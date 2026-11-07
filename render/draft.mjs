// Kuvallinen drafti: still jokaisesta kuvakäsikirjoituksen kohtauksesta elokuvaslaten kanssa
// (kohtaus, alku, kesto, musiikki, kuva). Kohtaus kertoo omat aikansa: window.sceneTimes().
//   node render/draft.mjs --page visual/vedos/index.html --dir runs/vedos-1230/drafti [--only 1,2,23] [--slate 1]

import puppeteer from 'puppeteer';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { startServer, ROOT } from './serve.mjs';

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, v, i, arr) => (v.startsWith('--') ? [...acc, [v.slice(2), arr[i + 1]]] : acc), []));
const page0 = args.page || 'visual/vedos/index.html';
const dir = path.resolve(ROOT, args.dir || 'runs/vedos-1230/drafti');
const only = args.only ? new Set(args.only.split(',')) : null;
const W = 1920, H = 1080;

const server = await startServer();
const browser = await puppeteer.launch({ headless: true, protocolTimeout: 600000, args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=d3d11'], defaultViewport: { width: W, height: H, deviceScaleFactor: 1 } });
try {
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('[sivu, virhe]', e.message));
  await page.goto(`${server.url}/${page0}?mode=render&slate=${args.slate ?? '1'}`);
  await page.waitForFunction('window.sceneReady === true || !!window.sceneError', { timeout: 180000 });
  const err = await page.evaluate(() => window.sceneError);
  if (err) throw new Error(err);
  await mkdir(dir, { recursive: true });
  const list = await page.evaluate(() => window.sceneTimes());
  for (const s of list) {
    if (only && !only.has(String(s.n))) continue;
    await page.evaluate((x) => window.seek(x), s.key);
    const file = path.join(dir, `k${String(s.n).replace(/^\d+/, (d) => d.padStart(3, '0'))}.png`);
    await page.screenshot({ path: file, type: 'png', clip: { x: 0, y: 0, width: W, height: H } });
    console.log(`${s.n}\t${s.a.toFixed(1)}\t${(s.b - s.a).toFixed(1)}\t${s.key.toFixed(2)}\t${s.name}`);
  }
} finally {
  await browser.close();
  server.close();
}
