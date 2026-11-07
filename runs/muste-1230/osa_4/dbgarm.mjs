import puppeteer from 'puppeteer';
import { startServer } from '../../../render/serve.mjs';
const ts = process.argv.slice(2).map(Number);
const server = await startServer();
const browser = await puppeteer.launch({ headless: true, protocolTimeout: 900000, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage();
  await page.goto(`${server.url}/visual/muste/index.html?data=build/demo400&mode=render`);
  await page.waitForFunction('window.sceneReady === true || !!window.sceneError', { timeout: 120000 });
  for (const t of ts) {
    const r = await page.evaluate(async (t) => {
      const { handFK } = await import('/visual/muste/puppets.js');
      const Lc = window.__locAt(t); window.seek(t);
      const p = Lc.state(t).pose;
      const q = { ...p, mounted: true, y: 0 };
      const h = handFK(Lc.lead.P, q, true), f = handFK(Lc.lead.P, q, false);
      const v = [f.sh[0] - h.hand[0], f.sh[1] - h.hand[1]];
      const la = p.lanceAng ?? Lc.state(t).lanceAng ?? 0;
      const u = [Math.sin(la), Math.cos(la)];
      const rr = Math.hypot(...v);
      let d = Math.atan2(u[1], u[0]) - Math.atan2(v[1], v[0]); d = Math.atan2(Math.sin(d), Math.cos(d));
      const g = Lc.lead.grip();
      const R = (x) => +x.toFixed(2);
      return { t, rel: R(g.rel||0), reach: R(g.reach||0), a: g.a.map(R), r: R(rr), d: R(d), along: R(Math.abs(v[0] * u[0] + v[1] * u[1])), aN: R(p.aN), eN: R(p.eN), la: R(la), b: g.b.map(R) };
    }, t);
    console.log(JSON.stringify(r));
  }
} finally { await browser.close(); server.close(); }
