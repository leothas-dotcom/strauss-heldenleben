// Näkyvyystarkistus (kuvasäännöt kohta 5, kierros 4b): jokainen olento on lepopaikallaan kokonaan kuvassa ja erillään.
// Kysyy kohtaukselta window.nakyvyysProbe(t) (loc_swamp.js): [{nimi, x0, y0, x1, y1, lepo}] ruutukoordinaatteina 0..1
// (x oikealle, y alas). Tämä on osan ensimmäinen tarkistus, ennen stillejä.
//   Reunarike: lepäävän olennon (ja ritarin) laatikko ylittää kuvan reunan marginaalin --margin (oletus 0,04).
//              Tulo ja lähtö (lepo = false) saavat ylittää reunan. Lepo = soitin soi ja olento on lepopaikallaan.
//   Peitto:    lepäävästä olennosta yli --peitto (oletus 0,03) laatikon leveydestä jää kauempana vedessä penkereen (kuvan etualan
//              mustan maan) reunan taakse.
//   Päällekkäisyys: kahden laatikon leikkauksen pinta-ala > --overlap (oletus 0,10) pienemmästä. Ritari ja hänen keihäänsä
//              eivät ole toistensa päällä. Keihäs (viisto sauva, jonka laatikko on sen lävistäjä) arvioidaan varrella: rike, kun
//              varren osuus olennon laatikon sisällä on > --keihas (oletus 0,15) laatikon lävistäjästä; kärki ja tyvi mukana. Lepo vs lepo = RIKE; liikkeessä oleva olento toisen päällä = "ohi" (ei riko, listataan).
//   node render/nakyvyys.mjs --from 240 --to 422 [--step 0.5] [--page visual/muste/index.html] [--data build/demo400]
//                            [--margin 0.04] [--overlap 0.10] [--keihas 0.15] [--peitto 0.03] [--times 250,260] [--verbose 1] [--json out.json]
//                            [--koot 1]   tulostaa jokaisen kuvassa olevan olennon maailmalaatikon (leveys x korkeus yksikköinä) sekä ritarin ja hänen päänsä (kypärä) mitat
// Palauttaa 0, kun rikkeitä ei ole (ohi-tapaukset eivät ole rikkeitä).

import puppeteer from 'puppeteer';
import fs from 'node:fs';
import { startServer } from './serve.mjs';

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, v, i, arr) => (v.startsWith('--') ? [...acc, [v.slice(2), arr[i + 1]]] : acc), []));
const page0 = args.page || 'visual/muste/index.html';
const data = args.data || 'build/demo400';
const MARGIN = Number(args.margin ?? 0.04);
const OVL = Number(args.overlap ?? 0.10);
const KEI = Number(args.keihas ?? 0.15);
const PEI = Number(args.peitto ?? 0.03);
const STEP = Number(args.step || 0.5);
const times = args.times ? args.times.split(',').map(Number) : (() => { const o = []; for (let t = Number(args.from ?? 240); t <= Number(args.to ?? 422) + 1e-9; t += STEP) o.push(Math.round(t * 1000) / 1000); return o; })();

const area = (b) => Math.max(0, b.x1 - b.x0) * Math.max(0, b.y1 - b.y0);
const inter = (a, b) => Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));
const ASP = 16 / 9;
// janan [a,b] osuus laatikossa (Liang-Barsky), pituus kuvasuhde huomioiden
const clipLen = (a, b, bx) => {
  let u0 = 0, u1 = 1;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  for (const [p, q] of [[-dx, a[0] - bx.x0], [dx, bx.x1 - a[0]], [-dy, a[1] - bx.y0], [dy, bx.y1 - a[1]]]) {
    if (p === 0) { if (q < 0) return 0; } else { const r = q / p; if (p < 0) u0 = Math.max(u0, r); else u1 = Math.min(u1, r); }
    if (u0 > u1) return 0;
  }
  return (u1 - u0) * Math.hypot(dx * ASP, dy);
};
const fmtBox = (b) => `[${b.x0.toFixed(2)},${b.y0.toFixed(2)} – ${b.x1.toFixed(2)},${b.y1.toFixed(2)}]`;

const server = await startServer();
const browser = await puppeteer.launch({ headless: true, protocolTimeout: 600000, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
const peitossa = new Map();   // nimi -> sekunnit penkereen takana (lepo)
const reunalla = new Map();   // nimi -> sekunnit reunan takana (lepo)
const paalla = new Map();     // "a+b" -> sekunnit päällekkäin (lepo vs lepo)
const ohi = new Map();        // "a+b" -> sekunnit (liikkeessä)
const lines = [];
const all = [];
let bad = 0, nOhi = 0, nSamples = 0;
try {
  const page = await browser.newPage();
  await page.goto(`${server.url}/${page0}?data=${encodeURIComponent(data)}&mode=render`);
  await page.waitForFunction('window.sceneReady === true || !!window.sceneError', { timeout: 120000 });
  const err = await page.evaluate(() => window.sceneError);
  if (err) throw new Error(err);
  if (!(await page.evaluate(() => typeof window.nakyvyysProbe === 'function'))) throw new Error('kohtaus ei tarjoa window.nakyvyysProbe(t):tä');
  for (const t of times) {
    const r = await page.evaluate((x, koot) => ({ shot: window.camProbe(x).shot, boxes: window.nakyvyysProbe(x), koot: koot && window.olennotKoot ? window.olennotKoot(x) : null }), t, !!args.koot);
    if (r.koot) console.log(`koot ${t.toFixed(2)} ${r.shot}: ` + Object.entries(r.koot).map(([k, v]) => (v ? `${k} ${v.lev}x${v.kor}` : k)).join(', '));
    all.push({ t, ...r });
    if (!r.boxes.length) continue;
    nSamples++;
    const msgs = [];
    for (const b of r.boxes) {
      if (b.nimi === 'keihas' || !b.lepo) continue;
      const side = [b.x0 < MARGIN && 'vasen', b.x1 > 1 - MARGIN && 'oikea', b.y0 < MARGIN && 'ylä', b.y1 > 1 - MARGIN && 'ala'].filter(Boolean);
      if (b.peitto > PEI) { msgs.push(`PEITOSSA ${b.nimi} ${fmtBox(b)} (${Math.round(100 * b.peitto)} % penkereen takana)`); peitossa.set(b.nimi, (peitossa.get(b.nimi) || 0) + STEP); bad++; }
      if (side.length) { msgs.push(`REUNA ${b.nimi} ${fmtBox(b)} (${side.join('+')})`); reunalla.set(b.nimi, (reunalla.get(b.nimi) || 0) + STEP); bad++; }
    }
    for (let i = 0; i < r.boxes.length; i++) for (let j = i + 1; j < r.boxes.length; j++) {
      const a = r.boxes[i], b = r.boxes[j];
      if ((a.nimi === 'ritari' && b.nimi === 'keihas') || (a.nimi === 'keihas' && b.nimi === 'ritari')) continue;
      const key = [a.nimi, b.nimi].sort().join('+');
      let pct;
      if ((a.nimi === 'keihas' || b.nimi === 'keihas') && (a.a || b.a)) {
        const k = a.nimi === 'keihas' ? a : b, o = a.nimi === 'keihas' ? b : a;
        const diag = Math.hypot((o.x1 - o.x0) * ASP, o.y1 - o.y0);
        const f = clipLen(k.a, k.b, o) / diag;
        if (!(f > KEI)) continue;
        pct = Math.round(100 * f);
      } else {
        const ia = inter(a, b);
        if (!(ia > OVL * Math.min(area(a), area(b)))) continue;
        pct = Math.round(100 * ia / Math.min(area(a), area(b)));
      }
      if (a.lepo && b.lepo) { msgs.push(`PÄÄLLÄ ${a.nimi} ${fmtBox(a)} / ${b.nimi} ${fmtBox(b)} (${pct} %)`); paalla.set(key, (paalla.get(key) || 0) + STEP); bad++; }
      else { msgs.push(`ohi   ${a.nimi}${a.lepo ? '' : '*'} / ${b.nimi}${b.lepo ? '' : '*'} (${pct} %, liikkeessä)`); ohi.set(key, (ohi.get(key) || 0) + STEP); nOhi++; }
    }
    if (msgs.length || args.verbose) lines.push(`${t.toFixed(2).padStart(8)} ${String(r.shot).padEnd(40)} ${msgs.join('  |  ') || 'ok'}`);
  }
  for (const l of lines) console.log(l);
  console.log(`\nhetkiä ${nSamples} (väli ${STEP} s), ${times[0]}–${times[times.length - 1]} s; marginaali ${MARGIN}, päällekkäisyysraja ${OVL}`);
  console.log('reunan takana (lepo), sekunnit olennoittain: ' + ([...reunalla].map(([k, v]) => `${k} ${v.toFixed(1)}`).join(', ') || 'ei yhtään'));
  console.log('penkereen takana (lepo), sekunnit olennoittain: ' + ([...peitossa].map(([k, v]) => `${k} ${v.toFixed(1)}`).join(', ') || 'ei yhtään'));
  console.log('päällekkäin (lepo vs lepo), sekunnit pareittain: ' + ([...paalla].map(([k, v]) => `${k} ${v.toFixed(1)}`).join(', ') || 'ei yhtään'));
  console.log('ohi liikkeessä (* = liikkeessä; ei rike), sekunnit pareittain: ' + ([...ohi].map(([k, v]) => `${k} ${v.toFixed(1)}`).join(', ') || 'ei yhtään'));
  console.log(`rikkeitä ${bad}`);
  if (args.json) fs.writeFileSync(args.json, JSON.stringify(all));
  if (bad) process.exitCode = 1;
} finally {
  await browser.close();
  server.close();
}
