import puppeteer from 'puppeteer';
import { startServer } from '../../../../render/serve.mjs';
const ts = process.argv.slice(2).map(Number);
const server = await startServer();
const browser = await puppeteer.launch({ headless: true, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage();
  page.on('console', (m) => { if (m.type() === 'error') console.log('console:', m.text()); });
  await page.goto(`${server.url}/visual/muste/index.html?data=build/demo400&mode=render`);
  await page.waitForFunction('window.sceneReady === true || !!window.sceneError', { timeout: 120000 });
  for (const t of ts) {
    const r = await page.evaluate((t) => { window.seek(t); const L = window.__locAt(t); return JSON.stringify(L.probe(t).mitatut); }, t);
    console.log(t, r);
  }
} finally { await browser.close(); server.close(); }
