// Asentohyppyjen skannaus koko A-puolelta: node runs/muste-1230/perusta3/poseskan.mjs [alku] [loppu]
import puppeteer from 'puppeteer';
import { startServer } from '../../../render/serve.mjs';
const [t0 = 0, t1 = 1240] = process.argv.slice(2).map(Number);
const server = await startServer();
const browser = await puppeteer.launch({ headless: true, protocolTimeout: 900000, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage();
  page.on('console', (m) => { if (m.type() === 'error') console.log('console:', m.text()); });
  await page.goto(`${server.url}/visual/muste/index.html?data=build/demo400&mode=render`);
  await page.waitForFunction('window.sceneReady === true || !!window.sceneError', { timeout: 120000 });
  const err = await page.evaluate(() => window.sceneError);
  if (err) throw new Error(err);
  let n = 0;
  for (let a = t0; a < t1; a += 60) {
    const r = await page.evaluate((x, y) => window.poseScan(x, y, 1), a, Math.min(t1, a + 60));
    for (const q of r) { console.log(JSON.stringify(q)); n++; }
  }
  console.log(`valmis, ${n} ikkunaa joissa hyppy`);
} finally { await browser.close(); server.close(); }
