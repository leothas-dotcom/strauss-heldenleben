// Kärjen korkeuden tasaisuus: toinen derivaatta (yks/s^2) ja Spearman raakaan teemaviivaan (opasProbe: muste[0].karki_y, midi_raaka).
//   node render/kaarevyys.mjs --from 9.3 --to 29 [--max 60]
import puppeteer from 'puppeteer';
import { startServer } from './serve.mjs';
const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, r) => (v.startsWith('--') ? [...a, [v.slice(2), r[i + 1]]] : a), []));
const server = await startServer();
const browser = await puppeteer.launch({ headless: true, protocolTimeout: 600000, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage();
  await page.goto(`${server.url}/visual/muste/index.html?data=build/demo400&mode=render`);
  await page.waitForFunction('window.sceneReady === true || !!window.sceneError', { timeout: 120000 });
  const i0 = Math.round(Number(args.from || 9.3) * 30), i1 = Math.round(Number(args.to || 29) * 30);
  const r = await page.evaluate((a, b) => { const o = []; for (let k = a; k < b; k++) { const p = window.opasProbe(k / 30); const m = p.muste[0]; o.push([m && m.karki_y, p.midi_raaka, p.karki_ero]); } return o; }, i0, i1);
  const ok = r.map((x, i) => [...x, i]).filter((x) => x[0] !== null && x[0] !== undefined && x[2] !== null);
  const y = ok.map((x) => x[0]), m = ok.map((x) => x[1]);
  let d2 = 0; for (let i = 1; i < y.length - 1; i++) if (ok[i + 1][3] - ok[i - 1][3] === 2 && !(args.skip && Math.abs((i0 + ok[i][3]) / 30 - Number(args.skip)) < 0.1)) d2 = Math.max(d2, Math.abs(y[i + 1] - 2 * y[i] + y[i - 1]) * 900);
  const rank = (v) => { const idx = v.map((x, i) => [x, i]).sort((p, q) => p[0] - q[0]); const rk = []; idx.forEach(([, i], n) => (rk[i] = n)); return rk; };
  const ry = rank(y), rm = rank(m), n = y.length, mean = (n - 1) / 2;
  let c = 0, vy = 0, vm = 0; for (let i = 0; i < n; i++) { c += (ry[i] - mean) * (rm[i] - mean); vy += (ry[i] - mean) ** 2; vm += (rm[i] - mean) ** 2; }
  const sp = []; for (let i = 1; i < y.length - 1; i++) if (ok[i + 1][3] - ok[i - 1][3] === 2) sp.push([Math.abs(y[i+1]-2*y[i]+y[i-1])*900, (i0 + ok[i][3]) / 30]); sp.sort((p,q)=>q[0]-p[0]); console.log('huiput', sp.slice(0,5).map(p=>p[1].toFixed(2)+'s:'+p[0].toFixed(0)).join(' '));
  if (args.dump) console.log(ok.map((x) => x[3] + ' ' + x[0]).join(' | '));
  console.log(`ruutuja ${n}, kärjen korkeus ${Math.min(...y).toFixed(2)}–${Math.max(...y).toFixed(2)}, max |y''| ${d2.toFixed(1)} yks/s², Spearman ${(c / Math.sqrt(vy * vm)).toFixed(3)}`);
  if (args.max && d2 > Number(args.max)) process.exitCode = 1;
} finally { await browser.close(); server.close(); }
