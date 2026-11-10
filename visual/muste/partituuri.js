// Partituurista luetut soitintapahtumat (harput, patarumpu) A-puolen Der Held -jaksossa: partituuri_a.json.
// Tahti ja isku muunnetaan ajaksi teemakartan ankkureista (S.A), lineaarisesti kahden peräkkäisen tahtiankkurin
// välillä. Ei kovakoodattuja sekunteja: jos ankkuri siirtyy teemakartassa, tapahtumat siirtyvät mukana.
// Käyttö:
//   import { soitin, verho } from './partituuri.js';
//   const harp = soitin(S, 'harput', a, b);        // [{ t, t1, voima, laji, tahti, isku }] välillä [a, b)
//   const rings = iskut(harp);                      // yksi hetki iskua kohden (arpeggio, tremolo, juoksutus)
//   const harpEnv = verho(harp, 0.08, 1.2);         // (t) => 0..1: soi (nousu s, lasku s)
const P = await (await fetch('/visual/muste/partituuri_a.json')).json();
const DYN = { pp: 0.35, p: 0.5, mp: 0.6, mf: 0.7, f: 0.85, ff: 1, fff: 1 };
const ISKUJA = 4;   // 4/4 koko Der Held -jakson ajan

// Tahtiluku (murtoluku: tahti + (isku - 1) / 4) -> aika. Väli valitaan niin, että tahti on sen sisällä;
// muuten lähin väli (ekstrapolointi).
function tahtiAika(S, x) {
  const pts = P.tahtiankkurit.map(([b, id]) => [b, S.A(id).t]);
  let k = 0, best = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    const [b0] = pts[i], [b1] = pts[i + 1];
    const d = x < b0 ? b0 - x : x > b1 ? x - b1 : 0;
    if (d < best) { best = d; k = i; }
  }
  const [b0, t0] = pts[k], [b1, t1] = pts[k + 1];
  return t0 + ((x - b0) * (t1 - t0)) / (b1 - b0);
}

// Soittimen ('harput' | 'patarumpu') tapahtumat aikavälillä [a, b): alku t, loppu t1, voima dynamiikasta.
export function soitin(S, nimi, a = -Infinity, b = Infinity) {
  return P[nimi].map((e) => {
    const x = e.tahti + (e.isku - 1) / ISKUJA;
    return { t: tahtiAika(S, x), t1: tahtiAika(S, x + e.kesto / ISKUJA), voima: DYN[e.dyn] ?? 0.7, laji: e.laji, tahti: e.tahti, isku: e.isku, kesto: e.kesto };
  }).filter((e) => e.t >= a && e.t < b);
}

// Yksi hetki iskua kohden: pitkä tapahtuma (arpeggio, juoksutus, tremolo) antaa hetken jokaiselle iskulle.
export function iskut(ev) {
  const out = [];
  for (const e of ev) {
    const n = Math.max(1, Math.round(e.kesto));
    for (let i = 0; i < n; i++) out.push({ t: e.t + ((e.t1 - e.t) * i) / n, voima: e.voima, laji: e.laji });
  }
  return out.sort((p, q) => p.t - q.t);
}

// Verhokäyrä: 1 * voima tapahtuman ajan, pehmeä nousu ja lasku. Puhdas ajan funktio.
export function verho(ev, nousu = 0.08, lasku = 1.2) {
  const ss = (a, b, x) => { const u = Math.min(1, Math.max(0, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
  return (t) => {
    let v = 0;
    for (const e of ev) {
      if (t < e.t - nousu || t > e.t1 + lasku) continue;
      v = Math.max(v, e.voima * ss(e.t - nousu, e.t + nousu, t) * (1 - ss(e.t1, e.t1 + lasku, t)));
    }
    return v;
  };
}
