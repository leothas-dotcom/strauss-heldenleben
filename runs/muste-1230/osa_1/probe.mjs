import puppeteer from 'puppeteer';
import { startServer } from '../../../render/serve.mjs';
const [a, b, d, expr] = [Number(process.argv[2]), Number(process.argv[3]), Number(process.argv[4]), process.argv[5]];
const server = await startServer();
const browser = await puppeteer.launch({ headless: true, protocolTimeout: 900000, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage();
  await page.goto(`${server.url}/visual/muste/index.html?data=build/demo400&mode=render`);
  await page.waitForFunction('window.sceneReady === true || !!window.sceneError', { timeout: 120000 });
  const err = await page.evaluate(() => window.sceneError); if (err) throw new Error(err);
  const rows = await page.evaluate(async (a, b, d, expr) => {
    const f = new Function('p', 't', 'return (' + expr + ')');
    const o = [];
    for (let t = a; t <= b + 1e-9; t += d) { window.seek(t); const p = window.opasProbe(t); o.push([+t.toFixed(2), f(p, t)]); }
    return o;
  }, a, b, d, expr);
  for (const r of rows) console.log(r[0], JSON.stringify(r[1]));
} finally { await browser.close(); server.close(); }
