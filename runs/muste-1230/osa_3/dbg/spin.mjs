import puppeteer from 'puppeteer';
import { startServer } from '../../../../render/serve.mjs';
const server = await startServer();
const browser = await puppeteer.launch({ headless: true, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage();
  await page.goto(`${server.url}/visual/muste/index.html?data=build/demo400&mode=render`);
  await page.waitForFunction('window.sceneReady === true || !!window.sceneError', { timeout: 120000 });
  const r = await page.evaluate(() => {
    const L = window.__locAt(930); const T = L.T; const out = []; let mx = 0, tm = 0;
    for (let t = T.hu - 2; t <= T.sh + 4; t += 0.25) { window.seek(t); const q = L.probe(t).tahdet; if (Math.abs(q.nopeus) > mx) { mx = Math.abs(q.nopeus); tm = t; } out.push([+t.toFixed(2), q.kulma, q.nopeus]); }
    return { hu: T.hu, sh: T.sh, maxNopeus: mx, tMax: tm, naytteet: out.filter((_, i) => i % 8 === 0) };
  });
  console.log(JSON.stringify(r));
} finally { await browser.close(); server.close(); }
