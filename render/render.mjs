// Renderöinti: Puppeteer kutsuu seek(t) ruutu kerrallaan ja putkittaa kuvat ffmpegille.
//   node render/render.mjs --data build/demo400 --out runs/video-400/renders/video.mp4
//        [--start 0] [--end 400] [--workers 3] [--fade-out 3.5] [--chunk 40]
//   node render/render.mjs --data build/demo400 --stills 5,40,239 [--debug 1] [--dir output/stills]
//   --page visual/drehbuehne/index.html valitsee kohtauksen (oletus visual/index.html)
// Ruudut jaetaan noin --chunk sekunnin osiin, ja työläiset ottavat osia jonosta (kohtaus on puhdas
// aikafunktio). Jokainen osa renderöidään tuoreella selaimella, jolloin selaimen ja GPU:n muisti
// vapautuu osien välillä. Epäonnistunut osa yritetään kerran uudelleen. Valmiit osat (.valmis)
// säilyvät, joten keskeytynyt ajo jatkuu samasta kohdasta. Lopuksi osat liitetään, ääni lisätään
// ja tehdään kontaktiarkki (6 x 5) itsearviointia varten.

import puppeteer from 'puppeteer';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { startServer, ROOT } from './serve.mjs';

const FPS = 30;
const W = 1920;
const H = 1080;
const CLIP = { x: 0, y: 0, width: W, height: H };

function parseArgs() {
  const a = { data: 'build/demo', out: 'output/demo.mp4', start: 0, end: null, stills: null, quality: 92,
    workers: 1, 'fade-out': 0, chunk: 40, debug: '0', dir: 'output/stills', page: 'visual/index.html', audio: null, side: null };
  const v = process.argv.slice(2);
  for (let i = 0; i < v.length; i += 2) {
    const key = v[i].replace(/^--/, '');
    const val = v[i + 1];
    if (key === 'stills') a.stills = val.split(',').map(Number);
    else if (['start', 'end', 'quality', 'workers', 'fade-out', 'chunk'].includes(key)) a[key] = Number(val);
    else a[key] = val;
  }
  return a;
}

function ffmpeg(argv) {
  const p = spawn(process.env.FFMPEG || 'ffmpeg', ['-y', '-v', 'error', ...argv], { stdio: ['pipe', 'inherit', 'inherit'] });
  p.stdin.on('error', (e) => console.error('ffmpeg stdin:', e.message));
  const done = once(p, 'close').then(([code]) => {
    if (code !== 0) throw new Error(`ffmpeg palautti ${code}`);
  });
  return { p, done };
}

async function openPage(browser, url) {
  const page = await browser.newPage();
  page.on('console', (m) => console.log('[sivu]', m.text()));
  page.on('pageerror', (e) => console.error('[sivu, virhe]', e.message));
  await page.goto(url);
  await page.waitForFunction('window.sceneReady === true || !!window.sceneError', { timeout: 120000 });
  const err = await page.evaluate(() => window.sceneError);
  if (err) throw new Error(err);
  return page;
}

// Yksi osa: ruudut [c.i0, c.i1) -> videotiedosto (ilman ääntä). c.done laskee valmiit ruudut.
async function renderRange(page, c, quality, progress) {
  const enc = ffmpeg(['-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', c.file]);
  try {
    // Kadonnut WebGL-konteksti antaa tyhjiä ruutuja ilman virhettä, joten se tarkistetaan
    // joka ruudulla ja vielä osan lopussa.
    const lost = () => new Error('WebGL-konteksti katosi');
    for (let i = c.i0; i < c.i1; i++) {
      if ((await page.evaluate((x) => window.seek(x), i / FPS)) === false) throw lost();
      const buf = await page.screenshot({ type: 'jpeg', quality, optimizeForSpeed: true, clip: CLIP });
      if (!enc.p.stdin.write(buf)) await once(enc.p.stdin, 'drain');
      c.done++;
      progress();
    }
    if (!(await page.evaluate(() => window.contextOk()))) throw lost();
  } catch (e) {
    enc.p.stdin.destroy();
    enc.p.kill();
    await enc.done.catch(() => {});
    throw e;
  }
  enc.p.stdin.end();
  await enc.done;
}

// Jokaisella työläisellä on oma selaimensa: saman selaimen taustavälilehtien piirto
// jäädytetään, jolloin kuvakaappaus jää odottamaan ruutua, jota ei tule.
const launch = () => puppeteer.launch({
  headless: true,
  protocolTimeout: 300000,
  args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=d3d11', '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'],
  defaultViewport: { width: W, height: H, deviceScaleFactor: 1 },
});

// Osa omalla selaimellaan; epäonnistuessa yksi uusi yritys tuoreella selaimella.
async function renderChunk(url, c, quality, progress) {
  for (let attempt = 1; ; attempt++) {
    const browser = await launch();
    try {
      const page = await openPage(browser, url);
      await renderRange(page, c, quality, progress);
      await writeFile(`${c.file}.valmis`, '');
      return;
    } catch (e) {
      c.done = 0;
      if (attempt >= 2) throw e;
      console.error(`osa ${c.k}: ${String(e.message).split('\n')[0]}; uusi yritys`);
    } finally {
      await browser.close().catch(() => {});
    }
  }
}

const a = parseArgs();
const server = await startServer();
const browsers = [await launch()];
const pageUrl = a.page.replace(/\\/g, '/');   // --page voi sisältää kyselyn (esim. index.html?kumppani=a)
const url = `${server.url}/${pageUrl}${pageUrl.includes('?') ? '&' : '?'}data=${encodeURIComponent(a.data)}&mode=render&debug=${a.debug}`;

try {
  if (a.stills) {
    const page = await openPage(browsers[0], url);
    const dir = path.resolve(ROOT, a.dir);
    await mkdir(dir, { recursive: true });
    for (const t of a.stills) {
      await page.evaluate((x) => window.seek(x), t);
      const file = path.join(dir, `t${t.toFixed(1).padStart(5, '0')}.png`);
      await page.screenshot({ path: file, type: 'png', clip: CLIP });
      console.log('still:', file);
    }
  } else {
    const first = await openPage(browsers[0], url);
    const duration = await first.evaluate(() => window.duration);
    await browsers.pop().close(); // vain keston selvitykseen; osat avaavat omat selaimensa
    const out = path.resolve(ROOT, a.out);
    await mkdir(path.dirname(out), { recursive: true });
    const i0 = Math.round(a.start * FPS);
    const i1 = Math.round((a.end ?? duration) * FPS);
    const dur = (i1 - i0) / FPS;
    const n = Math.max(1, a.workers);
    const m = Math.max(1, Math.round((i1 - i0) / (a.chunk * FPS)));
    const chunks = Array.from({ length: m }, (_, k) => {
      const c = { k, i0: i0 + Math.round(((i1 - i0) * k) / m), i1: i0 + Math.round(((i1 - i0) * (k + 1)) / m),
        file: out.replace(/\.mp4$/, `.osa${String(k).padStart(3, '0')}.mp4`) };
      c.done = existsSync(`${c.file}.valmis`) ? c.i1 - c.i0 : 0;
      return c;
    });
    const segs = chunks.map((c) => c.file);
    const skipped = chunks.filter((c) => c.done > 0).length;
    if (skipped) console.log(`${skipped}/${m} osaa on jo valmiina, jatketaan`);
    const started = Date.now();
    const done0 = chunks.reduce((s2, c) => s2 + c.done, 0);
    let ticks = 0;
    const progress = () => {
      ticks++;
      const done = chunks.reduce((s2, c) => s2 + c.done, 0);
      if (ticks % 300 === 0 || done === i1 - i0) {
        const rate = (done - done0) / ((Date.now() - started) / 1000);
        console.log(`ruutu ${done}/${i1 - i0}  (${rate.toFixed(1)} ruutua/s, jäljellä ~${((i1 - i0 - done) / rate / 60).toFixed(1)} min)`);
      }
    };
    const queue = chunks.filter((c) => c.done === 0);
    let next = 0;
    await Promise.all(Array.from({ length: Math.min(n, queue.length) }, async () => {
      while (next < queue.length) await renderChunk(url, queue[next++], a.quality, progress);
    }));

    const list = out.replace(/\.mp4$/, '.osat.txt');
    await writeFile(list, segs.map((s) => `file '${s.replace(/\\/g, '/')}'`).join('\n'));
    // ääni samasta kohdasta kuin ensimmäinen ruutu (i0/FPS), ei pyöristämättömästä --startista
    // Ääniraita: --audio, muuten puolen kuuntelukopio (aikojen totuus, CLAUDE.md), ei paketin
    // soundtrack.wav, joka kattaa vain paketin keston (virhe 30.10.2026: 1240 s video 400 s äänellä).
    const side = a.side ? Number(a.side) : 1;
    const truth = path.join(ROOT, 'build', 'kuuntelu', side === 2 ? 'B_puoli_kuuntelu.wav' : 'A_puoli_kuuntelu.wav');
    const audioFile = a.audio ? path.resolve(ROOT, a.audio) : truth;
    if (!existsSync(audioFile)) throw new Error(`ääniraita puuttuu: ${audioFile}`);
    console.log(`ääni: ${audioFile}`);
    const audio = ['-ss', (i0 / FPS).toFixed(6), '-i', audioFile];
    const fade = a['fade-out'] > 0 ? ['-af', `afade=t=out:st=${(dur - a['fade-out']).toFixed(2)}:d=${a['fade-out']}`] : [];
    await ffmpeg(['-f', 'concat', '-safe', '0', '-i', list, ...audio, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
      ...fade, '-c:a', 'aac', '-b:a', '320k', '-t', String(dur), '-movflags', '+faststart', out]).done;
    for (const f of [...segs, ...segs.map((f2) => `${f2}.valmis`), list]) await rm(f, { force: true });

    const sheet = out.replace(/\.mp4$/, '_kontakti.jpg');
    await ffmpeg(['-i', out, '-vf', `fps=${30 / dur},scale=480:-1,tile=6x5`, '-frames:v', '1', sheet]).done;
    console.log(`Valmis: ${out}  (${((Date.now() - started) / 60000).toFixed(1)} min)`);
    console.log(`Kontaktiarkki: ${sheet}`);
  }
} finally {
  for (const b of browsers) await b.close();
  server.close();
}
