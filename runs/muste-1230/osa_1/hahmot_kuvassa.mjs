// C11-mittaus: montako hahmoa (sankari + toverit) on kameran kuvassa ja näkyvissä hetkillä [alku, loppu] askeleella.
//   node runs/muste-1230/osa_1/hahmot_kuvassa.mjs <alku> <loppu> [askel=0.1] [odotus=8]
// Tulostaa ruudut, joissa lukumäärä poikkeaa odotetusta, ja yhteenvedon. Puhdas seek(t)-ajo, ei kuvia levylle.
import puppeteer from 'puppeteer';
import { startServer } from '../../../render/serve.mjs';
const [t0 = 7.6, t1 = 47, dt = 0.1, want = 8] = process.argv.slice(2).map(Number);
const server = await startServer();
const browser = await puppeteer.launch({ headless: true, protocolTimeout: 900000, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage();
  page.on('console', (m) => { if (m.type() === 'error') console.log('console:', m.text()); });
  await page.goto(`${server.url}/visual/muste/index.html?data=build/demo400&mode=render`);
  await page.waitForFunction('window.sceneReady === true || !!window.sceneError', { timeout: 120000 });
  const err = await page.evaluate(() => window.sceneError);
  if (err) throw new Error(err);
  const res = await page.evaluate(async (a, b, d, want) => {
    const THREE = await import('three');
    const { LEADERS } = await import('/visual/muste/hero.js');
    const { PUPPETS } = await import('/visual/muste/puppets.js');
    const out = []; let bad = 0, n = 0;
    const cam = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 2000);
    const v = new THREE.Vector3();
    for (let t = a; t <= b + 1e-9; t += d) {
      window.seek(t);
      const c = window.camProbe(t);
      cam.position.fromArray(c.p); cam.quaternion.fromArray(c.q); cam.fov = c.fov; cam.updateProjectionMatrix(); cam.updateMatrixWorld(true);
      const vis = (o) => { for (let x = o; x; x = x.parent) if (!x.visible) return false; return true; };
      const root = (o) => { let x = o; while (x.parent) x = x.parent; return x; };
      // nykyinen kohtaus = kamera-arvion paikan scene: otetaan ne nuket, joiden juuri on näkyvä ja joiden maailmapaikka on lähellä kameran katselusuuntaa
      const Lc = window.__locAt(t); const sc = Lc && (Lc.scene || (Lc.L && Lc.L.scene));
      const inSc = (o) => { for (let x = o; x; x = x.parent) if (x === sc) return true; return false; };
      let cnt = 0; const xs = [];
      const list = [...LEADERS.map((L) => L.P.root), ...PUPPETS.filter((P) => P.kind === 'back').map((P) => P.root)];
      for (const r of list) {
        if (!vis(r) || !inSc(r)) continue;
        r.updateMatrixWorld(true);
        v.set(0, 1.0, 0).applyMatrix4(r.matrixWorld);
        const p = v.clone().project(cam);
        if (Math.abs(p.x) < 0.98 && Math.abs(p.y) < 1 && p.z < 1 && p.z > -1 && Math.abs(v.z) < 3 && Math.abs(v.x) < 60) { cnt++; xs.push(+v.x.toFixed(1)); }
      }
      n++;
      if (cnt !== want) { bad++; out.push({ t: +t.toFixed(2), n: cnt, loc: c.loc, x: xs }); }
    }
    return { out, bad, n };
  }, t0, t1, dt, want);
  for (const r of res.out) console.log(JSON.stringify(r));
  console.log(`ruutuja ${res.n}, poikkeavia (ei ${want} hahmoa kuvassa) ${res.bad}`);
} finally { await browser.close(); server.close(); }
