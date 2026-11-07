// Kameran sulavuuden tarkistus: käy läpi jokaisen ruudun ilman piirtoa (window.camProbe) ja laskee
// otoittain kameran suunnan kulmanopeuden (°/s) ja sijainnin nopeuden. Leikkauksia ei lasketa.
//   node render/camcheck.mjs --page visual/sankarin-paiva/index.html --data build/demo400 [--max 20] [--step 1]

import puppeteer from 'puppeteer';
import { startServer } from './serve.mjs';

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, v, i, arr) => (v.startsWith('--') ? [...acc, [v.slice(2), arr[i + 1]]] : acc), []));
const page0 = args.page || 'visual/sankarin-paiva/index.html';
const data = args.data || 'build/demo400';
const MAX = Number(args.max || 20);
const FPS = 30;
const step = Number(args.step || 1);

const server = await startServer();
const browser = await puppeteer.launch({ headless: true, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage();
  await page.goto(`${server.url}/${page0}?data=${encodeURIComponent(data)}&mode=render`);
  await page.waitForFunction('window.sceneReady === true || !!window.sceneError', { timeout: 120000 });
  const err = await page.evaluate(() => window.sceneError);
  if (err) throw new Error(err);
  const dur = await page.evaluate(() => window.duration);
  const n = Math.floor(dur * FPS);
  const probes = await page.evaluate((n, step, FPS) => {
    const out = [];
    for (let i = 0; i < n; i += step) out.push(window.camProbe(i / FPS));
    return out;
  }, n, step, FPS);
  const fwd = (q) => {
    const [x, y, z, w] = q;
    // (0,0,-1) kierrettynä kvaterniolla
    return [-(2 * (x * z + w * y)), -(2 * (y * z - w * x)), -(1 - 2 * (x * x + y * y))];
  };
  const shots = new Map();
  for (let k = 1; k < probes.length; k++) {
    const a = probes[k - 1], b = probes[k];
    if (a.shot !== b.shot || a.cut !== b.cut || a.trans || b.trans) continue;
    const fa = fwd(a.q), fb = fwd(b.q);
    const dot = Math.max(-1, Math.min(1, fa[0] * fb[0] + fa[1] * fb[1] + fa[2] * fb[2]));
    const deg = (Math.acos(dot) * 180) / Math.PI * (FPS / step);
    const sp = Math.hypot(b.p[0] - a.p[0], b.p[1] - a.p[1], b.p[2] - a.p[2]) * (FPS / step);
    const s = shots.get(b.shot + '@' + b.cut) || { shot: b.shot, cut: b.cut, maxDeg: 0, atDeg: 0, maxSp: 0, n: 0 };
    if (deg > s.maxDeg) { s.maxDeg = deg; s.atDeg = (k * step) / FPS; }
    s.maxSp = Math.max(s.maxSp, sp);
    s.n++;
    shots.set(b.shot + '@' + b.cut, s);
  }
  const list = [...shots.values()].sort((x, y) => x.cut - y.cut);
  let bad = 0;
  for (const s of list) {
    const flag = s.maxDeg > MAX ? '  <-- LIIAN NOPEA' : '';
    if (flag) bad++;
    console.log(`${s.cut.toFixed(1).padStart(6)} s  ${s.shot.padEnd(64)} kääntö max ${s.maxDeg.toFixed(1).padStart(5)} °/s (${s.atDeg.toFixed(1)} s)  siirto max ${s.maxSp.toFixed(1)} m/s${flag}`);
  }
  console.log(`\nottoja ${list.length}, rajan ${MAX} °/s ylittäviä ${bad}`);
} finally {
  await browser.close();
  server.close();
}
