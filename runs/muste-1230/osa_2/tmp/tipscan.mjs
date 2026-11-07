import puppeteer from 'puppeteer';
import { startServer } from '../../../../render/serve.mjs';
const [t0, t1] = process.argv.slice(2).map(Number);
const server = await startServer();
const browser = await puppeteer.launch({ headless: true, protocolTimeout: 900000, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage();
  await page.goto(`${server.url}/visual/muste/index.html?data=build/demo400&mode=render`);
  await page.waitForFunction('window.sceneReady === true || !!window.sceneError', { timeout: 120000 });
  let prev = null, n = 0;
  for (let t = t0; t < t1; t += 1 / 30) {
    const o = await page.evaluate((x) => { window.seek(x); const p = window.opasProbe(x); return [p.viirikarki_x, p.viirikarki_y]; }, t);
    if (prev && Math.hypot(o[0] - prev[0], o[1] - prev[1]) > 0.35) { console.log(t.toFixed(3), prev.map((v) => v.toFixed(2)).join(','), '->', o.map((v) => v.toFixed(2)).join(',')); n++; }
    prev = o;
  }
  console.log('hyppyjä', n);
} finally { await browser.close(); server.close(); }
