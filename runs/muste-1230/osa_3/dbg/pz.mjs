import puppeteer from 'puppeteer';
import { startServer } from '../../../../render/serve.mjs';
const server = await startServer();
const browser = await puppeteer.launch({ headless: true, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage();
  await page.goto(`${server.url}/visual/muste/index.html?data=build/demo400&mode=render`);
  await page.waitForFunction('window.sceneReady === true || !!window.sceneError', { timeout: 120000 });
  const r = await page.evaluate(() => {
    window.seek(430.0); const L = window.__locAt(430); const m = L.pzDots; const a = m.instanceMatrix.array;
    const out = { visible: m.visible, count: m.count, parent: !!m.parent, nPz: L.update.last.nPz };
    out.mat = []; for (let i = 0; i < 4; i++) out.mat.push(Array.from(a.slice(i * 16, i * 16 + 16)).map((x) => +x.toFixed(3)).join(','));
    out.cam = L.camAt(430); out.cp = L.cpos(430);
    return out;
  });
  console.log(JSON.stringify(r, null, 1));
} finally { await browser.close(); server.close(); }
