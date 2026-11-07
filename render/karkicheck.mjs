// Mustevedon kärki: vedon uusimman pään ja keihään kärjen etäisyys joka ruudussa (opasProbe(t).karki_ero, yksikköä).
// Raja 0,1. Paikka (valley) laskee eron näkymäpuun keihäästä (selkäkuva tai johtaja) ja tipTrail:n uusimmasta pisteestä.
//   node render/karkicheck.mjs --from 7.3 --to 31.4 [--step 1] [--max 0.1]   (step = ruutuja)

import puppeteer from 'puppeteer';
import { startServer } from './serve.mjs';

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, v, i, arr) => (v.startsWith('--') ? [...acc, [v.slice(2), arr[i + 1]]] : acc), []));
const FPS = 30, MAX = Number(args.max || 0.1), step = Number(args.step || 1);
const server = await startServer();
const browser = await puppeteer.launch({ headless: true, protocolTimeout: 600000, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage();
  await page.goto(`${server.url}/${args.page || 'visual/muste/index.html'}?data=${encodeURIComponent(args.data || 'build/demo400')}&mode=render`);
  await page.waitForFunction('window.sceneReady === true || !!window.sceneError', { timeout: 120000 });
  const err = await page.evaluate(() => window.sceneError);
  if (err) throw new Error(err);
  const i0 = Math.round(Number(args.from || 7.3) * FPS), i1 = Math.round(Number(args.to || 31.4) * FPS);
  const res = await page.evaluate((a, b, s) => { const o = []; for (let k = a; k < b; k += s) { const r = window.opasProbe(k / 30); o.push([k / 30, r.karki_ero ?? null]); } return o; }, i0, i1, step);
  const act = res.filter((r) => r[1] !== null);
  const worst = act.reduce((m, r) => (r[1] > m[1] ? r : m), [0, 0]);
  const over = act.filter((r) => r[1] > MAX);
  console.log(`ruutuja ${res.length}, vedon kärki mitattu ${act.length} ruudussa (${act.length ? act[0][0].toFixed(2) + '–' + act[act.length - 1][0].toFixed(2) + ' s' : '-'})`);
  console.log(`suurin etäisyys ${worst[1].toFixed(4)} (${worst[0].toFixed(2)} s), rajan ${MAX} ylittäviä ${over.length}`);
  if (over.length) { console.log(over.slice(0, 10).map((r) => `${r[0].toFixed(2)} s: ${r[1].toFixed(3)}`).join('\n')); process.exitCode = 1; }
} finally {
  await browser.close();
  server.close();
}
