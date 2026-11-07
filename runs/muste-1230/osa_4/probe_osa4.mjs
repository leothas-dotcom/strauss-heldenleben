// Pieni vianetsintä: node runs/muste-1230/osa_4/probe_osa4.mjs "<js-lauseke ajan t funktiona>" t1,t2,...  [check=1]
import puppeteer from 'puppeteer';
import { startServer } from '../../../render/serve.mjs';
const [expr, ts, chk] = process.argv.slice(2);
const server = await startServer();
const browser = await puppeteer.launch({ headless: true, protocolTimeout: 600000, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage();
  page.on('console', (m) => { if (m.type() === 'error') console.log('console:', m.text()); });
  await page.goto(`${server.url}/visual/muste/index.html?data=build/demo400&mode=render${chk ? '&check=1' : ''}`);
  await page.waitForFunction('window.sceneReady === true || !!window.sceneError', { timeout: 120000 });
  const err = await page.evaluate(() => window.sceneError);
  if (err) throw new Error(err);
  for (const t of ts.split(',').map(Number)) {
    const r = await page.evaluate(new Function('t', `return (${expr});`), t);
    console.log(t, JSON.stringify(r));
  }
} finally { await browser.close(); server.close(); }
