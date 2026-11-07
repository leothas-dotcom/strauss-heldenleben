// node probe.mjs t0 t1 step key1,key2  -> tulostaa opasProbe-kentät
import puppeteer from 'puppeteer';
import { startServer } from '../../../../render/serve.mjs';
const [t0, t1, st, keys] = process.argv.slice(2);
const server = await startServer();
const browser = await puppeteer.launch({ headless: true, protocolTimeout: 900000, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.log('virhe:', e.message));
  await page.goto(`${server.url}/visual/muste/index.html?data=build/demo400&mode=render`);
  await page.waitForFunction('window.sceneReady === true || !!window.sceneError', { timeout: 120000 });
  const err = await page.evaluate(() => window.sceneError);
  if (err) throw new Error(err);
  console.log(JSON.stringify(await page.evaluate(() => globalThis.__osa2)));
  const ks = keys.split(',');
  for (let t = Number(t0); t <= Number(t1) + 1e-6; t += Number(st)) {
    const o = await page.evaluate((x) => { window.seek(x); return window.opasProbe(x); }, t);
    console.log(t.toFixed(2), ks.map((k) => `${k}=${typeof o[k] === 'number' ? o[k].toFixed(3) : JSON.stringify(o[k])}`).join(' '));
  }
} finally { await browser.close(); server.close(); }
