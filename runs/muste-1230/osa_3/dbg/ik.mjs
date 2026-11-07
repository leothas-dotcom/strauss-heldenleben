import puppeteer from 'puppeteer';
import { startServer } from '../../../../render/serve.mjs';
const [t0, t1, st = 0.05] = process.argv.slice(2).map(Number);
const server = await startServer();
const browser = await puppeteer.launch({ headless: true, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage();
  await page.goto(`${server.url}/visual/muste/index.html?data=build/demo400&mode=render`);
  await page.waitForFunction('window.sceneReady === true || !!window.sceneError', { timeout: 120000 });
  const r = await page.evaluate((a, b, s) => {
    const L = window.__locAt(a); const out = []; let pn = null, pf = null;
    for (let t = a; t <= b; t += s) {
      const h = L.heroState(t);
      if (h.ikN === null) { pn = pf = null; continue; }
      if (pn !== null) { const dn = Math.abs(h.ikN - pn), df = Math.abs(h.ikF - pf); if (dn > 0.5 || df > 0.5 || (t>909.3&&t<909.5)) out.push([+t.toFixed(3), +pn.toFixed(2), +h.ikN.toFixed(2), +pf.toFixed(2), +h.ikF.toFixed(2), +h.ow.toFixed(2)].join(' ')); }
      pn = h.ikN; pf = h.ikF;
    }
    return out;
  }, t0, t1, st);
  console.log(r.join('\n'));
} finally { await browser.close(); server.close(); }
