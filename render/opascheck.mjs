// Opastarkistus, mittaus: kysyy kohtaukselta window.opasProbe(t) jokaisessa teemakartan ankkurissa
// (annotations/cues.json, teema-kenttä) hetkillä t-0,5, t-1/30, t, t+1/30, t+0,5 sekä aikajanalta
// tasavälein (--dt). Tulos JSON:na analysis/opastarkistus.py:lle.
//   node render/opascheck.mjs --page visual/muste/index.html --data build/demo400 --from 0 --to 240 --out runs/muste-1230/perusta/opasprobe.json [--dt 0.1] [--side 1]

import puppeteer from 'puppeteer';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { startServer, ROOT } from './serve.mjs';

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, v, i, arr) => (v.startsWith('--') ? [...acc, [v.slice(2), arr[i + 1]]] : acc), []));
const page0 = args.page || 'visual/muste/index.html';
const data = args.data || 'build/demo400';
const side = Number(args.side || 1);
const from = Number(args.from || 0), to = Number(args.to || 240);
const dt = Number(args.dt || 0.1);
const out = path.resolve(ROOT, args.out || 'runs/muste-1230/perusta/opasprobe.json');
const FR = 1 / 30;

const cues = JSON.parse(await readFile(path.join(ROOT, 'annotations', 'cues.json'), 'utf-8'));
const anchors = cues.cues.filter((c) => c.teema && c.side === side && c.t >= from && c.t <= to).map((c) => ({ id: c.teema, t: c.t, luokka: c.luokka, note: c.note }));

const server = await startServer();
const browser = await puppeteer.launch({ headless: true, protocolTimeout: 600000, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage();
  await page.goto(`${server.url}/${page0}?data=${encodeURIComponent(data)}&mode=render`);
  await page.waitForFunction('window.sceneReady === true || !!window.sceneError', { timeout: 120000 });
  const err = await page.evaluate(() => window.sceneError);
  if (err) throw new Error(err);
  if (!(await page.evaluate(() => typeof window.opasProbe === 'function'))) throw new Error('kohtaus ei tarjoa window.opasProbe(t):tä');
  const probe = (ts) => page.evaluate((ts) => ts.map((t) => window.opasProbe(t)), ts);
  const res = { page: page0, data, side, from, to, dt, anchors: [], timeline: [] };
  for (const a of anchors) {
    // ±1 ruutu: iskun ruutu alkaa 33 ms ennen ääntä (t-FR), joten vertailu t-2FR .. t+FR
    const ts = [a.t - 0.5, a.t - 2 * FR, a.t, a.t + FR, a.t + 0.5].map((x) => Math.max(0, x));
    const p = await probe(ts);
    res.anchors.push({ ...a, probes: { 'm05': p[0], 'm1f': p[1], 't': p[2], 'p1f': p[3], 'p05': p[4] } });
    process.stdout.write(`${a.id} `);
  }
  console.log(`\n${anchors.length} ankkuria mitattu`);
  const n = Math.floor((to - from) / dt);
  for (let i = 0; i < n; i += 100) {
    const ts = [];
    for (let k = i; k < Math.min(n, i + 100); k++) ts.push(from + k * dt);
    res.timeline.push(...(await probe(ts)));
  }
  console.log(`aikajana ${res.timeline.length} näytettä (${dt} s)`);
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, JSON.stringify(res));
  console.log(`kirjoitettu ${out}`);
} finally {
  await browser.close();
  server.close();
}
