// Lavasteiden reunojen tarkistus ("kohtaus check", palaute 30.10.2026): käy aikajanan läpi ja kysyy
// kohtaukselta window.leakProbe(t). Kohtaus piirtää jokaisen näkymän pieneen kohteeseen magentaa
// taustaa vasten: magenta pikseli on kohta, jota mikään kerros ei peitä. Lisäksi kohtaus vertaa
// jokaisen reunallisen kerroksen (userData.edge) aluetta kameran näkymään kerroksen syvyydellä.
//   node render/kohtauscheck.mjs --page visual/purje/index.html --data build/demo400 [--step 5] [--from 0 --to 400]

import puppeteer from 'puppeteer';
import { startServer } from './serve.mjs';

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, v, i, arr) => (v.startsWith('--') ? [...acc, [v.slice(2), arr[i + 1]]] : acc), []));
const page0 = args.page || 'visual/purje/index.html';
const data = args.data || 'build/demo400';
const FPS = 30;
const step = Number(args.step || 5);

const server = await startServer();
const browser = await puppeteer.launch({ headless: true, protocolTimeout: 600000, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage();
  await page.goto(`${server.url}/${page0}?data=${encodeURIComponent(data)}&mode=render&check=1`);
  await page.waitForFunction('window.sceneReady === true || !!window.sceneError', { timeout: 120000 });
  const err = await page.evaluate(() => window.sceneError);
  if (err) throw new Error(err);
  if (!(await page.evaluate(() => typeof window.leakProbe === 'function'))) throw new Error('kohtaus ei tarjoa window.leakProbe(t):tä');
  const dur = await page.evaluate(() => window.duration);
  const i0 = Math.round(Number(args.from || 0) * FPS), i1 = Math.round(Number(args.to || dur) * FPS);
  const res = [];
  for (let i = i0; i < i1; i += step * 60) {
    const part = await page.evaluate((a, b, s) => { const o = []; for (let k = a; k < b; k += s) o.push(window.leakProbe(k / 30)); return o; }, i, Math.min(i1, i + step * 60), step);
    res.push(...part);
  }
  // kootaan otoittain
  const byShot = new Map();
  for (const r of res) {
    if (!r.magenta && !r.layers.length) continue;
    const key = `${r.loc} / ${r.shot}`;
    const s = byShot.get(key) || { key, n: 0, maxMag: 0, at: r.t, first: r.t, last: r.t, layers: new Map() };
    s.n++; s.last = r.t;
    if (r.magenta > s.maxMag) { s.maxMag = r.magenta; s.at = r.t; }
    for (const l of r.layers) { const [nm, v] = l.split(':'); s.layers.set(nm, Math.max(s.layers.get(nm) || 0, Number(v))); }
    byShot.set(key, s);
  }
  const total = 384 * 216;
  for (const s of byShot.values()) {
    const ls = [...s.layers.entries()].map(([k, v]) => `${k} +${v.toFixed(1)}`).join(', ');
    console.log(`${s.first.toFixed(1).padStart(6)}–${s.last.toFixed(1).padEnd(6)} ${s.key.padEnd(70)} ruutuja ${String(s.n).padStart(4)}  tyhjää max ${(100 * s.maxMag / total).toFixed(2)} % (${s.at.toFixed(1)} s)${ls ? '  kerrokset: ' + ls : ''}`);
  }
  const bad = res.filter((r) => r.magenta > 0).length;
  const chk = res.reduce((s, r) => s + (r.checked || 0), 0);
  console.log(`kerrosalueita verrattu ${chk} kertaa (keskimäärin ${(chk / res.length).toFixed(1)} kerrosta ruudulla)`);
  console.log(`\ntarkistettu ${res.length} ruutua (${step} ruudun välein), tyhjää taustaa ${bad} ruudussa, kerrosreunan ylityksiä ${res.filter((r) => r.layers.length).length} ruudussa`);
  if (bad) process.exitCode = 1;
} finally {
  await browser.close();
  server.close();
}
