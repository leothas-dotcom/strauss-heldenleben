// käyttö: node hs.mjs t0 t1 step  -> heroState-avaimet
import puppeteer from 'puppeteer';
import { startServer } from '../../../../render/serve.mjs';
const [t0, t1, st = 0.1] = process.argv.slice(2).map(Number);
const server = await startServer();
const browser = await puppeteer.launch({ headless: true, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage();
  page.on('console', (m) => { if (m.type() === 'error') console.log('console:', m.text()); });
  await page.goto(`${server.url}/visual/muste/index.html?data=build/demo400&mode=render`);
  await page.waitForFunction('window.sceneReady === true || !!window.sceneError', { timeout: 120000 });
  const err = await page.evaluate(() => window.sceneError); if (err) throw new Error(err);
  const r = await page.evaluate((a, b, s) => {
    const L = window.__locAt(a);
    const out = [];
    for (let t = a; t <= b + 1e-9; t += s) {
      const h = L.heroState(t); const p = h.pose;
      out.push([+t.toFixed(3), +p.aN.toFixed(2), +p.eN.toFixed(2), +p.aF.toFixed(2), +p.eF.toFixed(2), +p.hN.toFixed(2), +p.hF.toFixed(2), +p.lean.toFixed(2), 'ow', +h.ow.toFixed(3), 'bd', +h.bd.toFixed(2), 'sd', +h.sd.toFixed(2), 'ms', +h.ms.toFixed(2), 'x', +h.x.toFixed(2), 'y', +h.y.toFixed(2), 'f', +h.facing.toFixed(2)].join(' '));
    }
    return out;
  }, t0, t1, st);
  console.log(r.join('\n'));
} finally { await browser.close(); server.close(); }
