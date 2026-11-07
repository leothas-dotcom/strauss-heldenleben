// Otetarkistus: kämmenen ja varren etäisyys (keihäs, airo, selkäkuvan keihäs) annetuilla hetkillä.
// Kysyy kohtaukselta window.gripProbe(t) ja listaa jokaisen otteen; raja 0,05 yksikköä (lähempi kämmen
// varrella; kauempi kämmen varrella tai vartalolla). Näkymättömät ritarit (harjanteen takana) lasketaan mukaan.
//   node render/otecheck.mjs --page visual/muste/index.html --data build/demo400 --times 15.6,37,44.5 [--max 0.05] [--json out.json]
//   node render/otecheck.mjs ... --from 0 --to 400 --step 2

import puppeteer from 'puppeteer';
import fs from 'node:fs';
import { startServer } from './serve.mjs';

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, v, i, arr) => (v.startsWith('--') ? [...acc, [v.slice(2), arr[i + 1]]] : acc), []));
const page0 = args.page || 'visual/muste/index.html';
const data = args.data || 'build/demo400';
const MAX = Number(args.max || 0.05);
const times = args.times ? args.times.split(',').map(Number) : (() => { const o = []; for (let t = Number(args.from || 0); t < Number(args.to || 60); t += Number(args.step || 2)) o.push(t); return o; })();

const server = await startServer();
const browser = await puppeteer.launch({ headless: true, protocolTimeout: 600000, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
let bad = 0, n = 0;
const all = [];
try {
  const page = await browser.newPage();
  await page.goto(`${server.url}/${page0}?data=${encodeURIComponent(data)}&mode=render`);
  await page.waitForFunction('window.sceneReady === true || !!window.sceneError', { timeout: 120000 });
  const err = await page.evaluate(() => window.sceneError);
  if (err) throw new Error(err);
  for (const t of times) {
    const r = await page.evaluate((x) => window.gripProbe(x), t);
    all.push(r);
    for (const o of r.otteet) {
      n++;
      const ok = o.lahempi <= MAX && (o.kauempi === undefined || o.kauempi <= MAX);
      if (!ok) bad++;
      console.log(`${t.toFixed(2).padStart(8)} ${r.paikka.padEnd(20)} ${o.tyyppi.padEnd(14)} lähempi ${String(o.lahempi).padStart(6)}  kauempi ${o.kauempi === undefined ? '   -  ' : String(o.kauempi).padStart(6)}${o.lapa_pohjan_alla !== undefined ? '  lapa pohjan alla ' + o.lapa_pohjan_alla : ''}${o.nakyy === false ? '  (ritari harjanteen takana)' : ''}  ${ok ? 'OK' : 'YLITYS'}`);
    }
  }
  console.log(`\notteita ${n}, ylityksiä (> ${MAX}) ${bad}`);
  if (args.json) fs.writeFileSync(args.json, JSON.stringify(all, null, 1));
  if (bad) process.exitCode = 1;
} finally {
  await browser.close();
  server.close();
}
