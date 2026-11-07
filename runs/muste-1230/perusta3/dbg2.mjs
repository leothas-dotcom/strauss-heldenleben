import puppeteer from 'puppeteer';
import { startServer } from '../../../render/serve.mjs';
const server = await startServer();
const browser = await puppeteer.launch({ headless: true, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage();
  await page.goto(`${server.url}/visual/muste/index.html?data=build/demo400&mode=render`);
  await page.waitForFunction('window.sceneReady === true || !!window.sceneError', { timeout: 120000 });
  const r = await page.evaluate(async () => {
    const THREE = await import('three');
    const h = await import('/visual/muste/hero.js');
    const p = await import('/visual/muste/puppets.js');
    const g = new THREE.Group();
    const L = h.leader(g, {});
    const hard = (t) => ({ x: 0, y: 0, z: 0, facing: 1, pose: t < 10 ? p.KP.sit : p.KP.stand });
    const seq = p.poseSeq([[0, p.KP.sit], [10, p.KP.stand]]);
    const out = { vahti: [], seq: [] };
    for (let t = 9.8; t <= 12.01; t += 0.2) {
      L.place(t, hard, () => ({ x: 0, y: 0 }), {});
      out.vahti.push([+t.toFixed(1), +L.P.hip.position.y.toFixed(3), +L.P.hpN.rotation.z.toFixed(3)]);
      out.seq.push([+t.toFixed(1), +seq(t).hN.toFixed(3)]);
    }
    return out;
  });
  console.log(JSON.stringify(r));
} finally { await browser.close(); server.close(); }
