// Keihään suunnan epäjatkuvuudet: node runs/muste-1230/osa_4/lancescan.mjs alku loppu  (askel 1/60 s; ero > 0,35 yksikköä)
import puppeteer from 'puppeteer';
import { startServer } from '../../../render/serve.mjs';
const [t0, t1] = process.argv.slice(2).map(Number);
const server = await startServer();
const browser = await puppeteer.launch({ headless: true, protocolTimeout: 900000, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage();
  await page.goto(`${server.url}/visual/muste/index.html?data=build/demo400&mode=render`);
  await page.waitForFunction('window.sceneReady === true || !!window.sceneError', { timeout: 120000 });
  const r = await page.evaluate((t0, t1) => {
    const out = []; let prev = null;
    for (let t = t0; t < t1; t += 1 / 60) {
      const Lc = window.__locAt(t);
      if (!Lc.lead) { prev = null; continue; }
      window.seek(t);
      const g = Lc.lead.grip();
      const cur = { t, a: g.a, b: g.b };
      if (prev) { const d = Math.hypot(cur.b[0] - prev.b[0], cur.b[1] - prev.b[1]); if (d > 0.35) out.push([+t.toFixed(3), +d.toFixed(2)]); }
      prev = cur;
    }
    return out;
  }, t0, t1);
  console.log(JSON.stringify(r));
} finally { await browser.close(); server.close(); }
