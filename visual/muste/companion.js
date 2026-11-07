// Kumppani (sooloviulu): musteeton, paperinvalkoinen viiva. Kolme muotoa:
//   companionLine   viiva taivaalla: seuraa viulun sävelkorkeutta, näkyy vain kun viulu soi
//   companionFigure kasvoton valkoviivahahmo maailmassa: yksi jatkuva viiva, helmasta viiva
//   braid           punos: sankarin punainen veto ja kumppanin valkoinen viiva kietoutuvat
// Kaikki on puhdasta ajan funktiota: geometria lasketaan joka ruudulla alusta, ei tilaa ruutujen välillä.
// Mielialat (tyyli, luku 10): kaipaus, ilo, kevyt, hellyys, sentimentaali, riehakkuus, sarkasmi.
// Mieliala on merkkijono tai {a, b, k}: vaihto a -> b (k 0..1), jotta fraasirajalla ei ole hyppyä.

import * as THREE from 'three';
import { C, ink, poly, TAU, clamp, smoothstep, mix, vnoise1 } from './paper.js';
import { tipTrail } from './brush.js';

// --- Nauha: dynaaminen viivageometria ------------------------------------------------------------
export function ribbon(n) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(n * 2 * 3);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n * 2 * 2), 2));
  const idx = [];
  for (let k = 0; k < n - 1; k++) { const a = 2 * k; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  geo.setIndex(idx);
  const attr = geo.getAttribute('position');
  return {
    geo,
    // X, Y, Z (valinnainen, taulukko tai luku), Wd = leveys pisteessä
    fill(X, Y, Z, Wd) {
      for (let i = 0; i < n; i++) {
        const a = Math.max(0, i - 1), b = Math.min(n - 1, i + 1);
        let dx = X[b] - X[a], dy = Y[b] - Y[a];
        const l = Math.hypot(dx, dy);
        if (l < 1e-6) { dx = 1; dy = 0; } else { dx /= l; dy /= l; }
        const h = Wd[i] / 2;
        const z = typeof Z === 'number' ? Z : Z[i];
        pos[6 * i] = X[i] - dy * h; pos[6 * i + 1] = Y[i] + dx * h; pos[6 * i + 2] = z;
        pos[6 * i + 3] = X[i] + dy * h; pos[6 * i + 4] = Y[i] - dx * h; pos[6 * i + 5] = z;
      }
      attr.needsUpdate = true;
    },
  };
}

// Mielialan paino: merkkijono tai {a, b, k}
function moodWeights(m) {
  if (typeof m === 'string') return [[m, 1]];
  const k = clamp(m.k ?? 1);
  return k >= 0.999 ? [[m.b, 1]] : k <= 0.001 ? [[m.a, 1]] : [[m.a, 1 - k], [m.b, k]];
}

const tri = (x) => Math.abs(x - Math.floor(x) - 0.5) * 4 - 1;   // kolmioaalto -1..1

// Viivan luonne mielialoittain. s = kulkukoordinaatti (maailman yksikköä, kulkee viivan mukana),
// palauttaa [dx, dy, leveys, katko 0..1]. Trokoidi (x = p - A sin, y = -A (1 - cos)) tekee silmukat,
// kun A * kulmataajuus > 1.
function shape(name, s, amp) {
  switch (name) {
    case 'kaipaus': {          // liian koristeelliset, riippuvat kiehkurat
      const th = 2.7 * s;
      return [-0.5 * Math.sin(th) * amp, -0.5 * (1 - Math.cos(th)) * amp, 0.3, 1];
    }
    case 'ilo':                // kevyet, hyppivät kaaret
      return [0, 0.95 * Math.abs(Math.sin((Math.PI * s) / 2.1)) * amp, 0.28, 1];
    case 'kevyt': {            // katkeileva, sinkoileva viiva
      const g = smoothstep(0.34, 0.46, vnoise1(s * 0.85, 11));
      return [0, (vnoise1(s * 1.5, 3) - 0.5) * 1.9 * amp, 0.26, g];
    }
    case 'hellyys':            // ohut, tasainen, pehmeä
      return [0, 0.12 * Math.sin(s * 0.9) * amp, 0.16, 1];
    case 'sentimentaali': {    // hitaat, raskaat silmukat
      const th = 1.5 * s;
      return [-0.92 * Math.sin(th) * amp, -0.85 * (1 - Math.cos(th)) * amp, 0.42, 1];
    }
    case 'riehakkuus': {       // suuret koukerot
      const th = 1.45 * s;
      return [-1.1 * Math.sin(th) * amp, 1.1 * (Math.cos(th) - 1) * amp + 0.7 * Math.sin(0.5 * th) * amp, 0.3, 1];
    }
    case 'sarkasmi':           // terävä siksak
      return [0, 0.95 * tri(s / 0.85) * amp, 0.18, 1];
    default:
      return [0, 0, 0.1, 1];
  }
}

// --- 1. Viiva taivaalla --------------------------------------------------------------------------
// S: signaalit (S.melody, S.fam.violins). set(t, xs = [x0, x1], mood, amp, o):
//   viivan vanhin kohta on x0:ssa ja uusin x1:ssä; korkeus = viulun sävelkorkeus (midi lo..hi -> yA..yB).
//   o: span (s), thr (viulun kynnys), lo, hi, yA, yB, S
// Kumppanin viiva samalla mekanismilla kuin sankarin muste (brush.js tipTrail): kärki jättää maailmaan
// paperinvalkoisen vedon, joka seuraa viuluviivan suuntaa ja näkyy vain, kun sooloviulu soi (conf).
//   companionTrail(parent, S, dir, o) -> tipTrail; o.fade(tt) 0..1 himmentää (esim. laskeutuminen maailmaan)
export function companionTrail(parent, S, dir, o = {}) {
  const conf = (tt) => smoothstep(0.05, 0.3, dir(tt).conf);
  return tipTrail(parent, S, {
    color: C.paper, shade: C.blue, seed: o.seed ?? 41, N: o.N ?? 300, win: o.win ?? 12, drift: o.drift ?? 0.14,
    wmin: 0.04, wmax: o.wmax ?? 0.34, hairW: 0.03, bleed: 0.02, zOff: o.zOff ?? 0.05,
    gate: (tt) => conf(tt) * (o.fade ? o.fade(tt) : 1),
    press: (tt) => clamp(0.45 + 0.5 * S.loud(tt)),
  });
}

// Viuluviiva (build/koko/viuluviiva_A.json): jatkuva suuntakäyrä. dirOf(data) -> (t) => {midi, conf}
export function dirOf(d) {
  return (t) => {
    if (!d) return { midi: 70, conf: 0 };
    const f = (t - d.t0) * d.fps, i = Math.floor(f);
    if (i < 0 || i + 1 >= d.midi.length) return { midi: 70, conf: 0 };
    const u = f - i;
    return { midi: d.midi[i] * (1 - u) + d.midi[i + 1] * u, conf: d.varmuus[i] * (1 - u) + d.varmuus[i + 1] * u };
  };
}
export const DIR_K = 0.6;   // yksikköä / puolisävel (5 puolisävelaskelta = 3 yksikköä)

export function companionLine(parent, N = 420, S = null) {
  const R = ribbon(N);
  const mat = ink(C.paper, {});
  const mesh = new THREE.Mesh(R.geo, mat);
  mesh.frustumCulled = false;
  parent.add(mesh);
  const X = new Float32Array(N), Y = new Float32Array(N), Wd = new Float32Array(N);
  function set(t, xs, mood = 'hellyys', amp = 1, o = {}) {
    const sg = o.S ?? S;
    if (!sg) throw new Error('companionLine: signaalit (S) puuttuvat');
    const span = o.span ?? 7, thr = o.thr ?? 0.3, lo = o.lo ?? 58, hi = o.hi ?? 100;
    const yA = o.yA ?? 6, yB = o.yB ?? 12;
    const x0 = xs[0], x1 = xs[1];
    const speed = (x1 - x0) / span;
    const mw = moodWeights(mood);
    for (let i = 0; i < N; i++) {
      const u = i / (N - 1);
      const tau = t - (1 - u) * span;
      const xb = x0 + (x1 - x0) * u;
      const dr = o.dir ? o.dir(tau) : { midi: 70, conf: 0 };
      const yc = 0.5 * (yA + yB), hh = o.half ?? 4.5;
      const base = Math.max(yc - hh, Math.min(yc + hh, yc + (dr.midi - 70) * (o.k ?? DIR_K)));
      const s = speed * tau;
      let dx = 0, dy = 0, w = 0, g = 0;
      for (const [name, k] of mw) { const sh = shape(name, s, amp); dx += k * sh[0]; dy += k * sh[1]; w += k * sh[2]; g += k * sh[3]; }
      const vis = smoothstep(0.05, 0.3, dr.conf);
      X[i] = xb + dx; Y[i] = base + dy;
      Wd[i] = w * (o.wid ?? 1) * vis * g * smoothstep(0, 0.18, u);
    }
    R.fill(X, Y, 0, Wd);
  }
  return { mesh, mat, set };
}

// --- 2. Kumppani maailmassa: yksi jatkuva viiva ------------------------------------------------------
// Hoikka kasvoton ääriviiva (pää, kaula, hartiat, pitkä helma), sisus on taustan väriä.
// Viiva alkaa helman oikeasta reunasta ulos kulkevana hännänä (tuuli +x), nousee oikeaa sivua pitkin
// päähän, kiertää pään, laskeutuu vasenta sivua ja sulkeutuu helmaa pitkin.
// pose(t, mood, o): o.tilt (pään kallistus), o.spin (pyörähdys, pi = selkä), o.bow (kumarrus),
// o.fan (helman viuhka), o.wind (0..1, tuuli), o.trail (hännän pituus 0..1)
// Helman ja vartalon leveys korkeuden mukaan (puolileveys). hem = helman reuna, fan = viuhka.
function halfW(y, hem, fan) {
  const k = [[0.03, hem], [0.38, 0.2 + 0.1 * fan], [0.72, 0.14 + 0.03 * fan], [0.95, 0.1], [1.12, 0.115], [1.3, 0.125], [1.42, 0.14]];
  if (y <= k[0][0]) return k[0][1];
  for (let j = 0; j < k.length - 1; j++) {
    if (y <= k[j + 1][0]) { const u = smoothstep(k[j][0], k[j + 1][0], y); return k[j][1] + (k[j + 1][1] - k[j][1]) * u; }
  }
  return k[k.length - 1][1];
}
// Chaikin-pyöristys: kulmista pehmeät käyrät, pistemäärä kasvaa ennustettavasti
export function chaikin(pts, it = 2) {
  let P = pts;
  for (let r = 0; r < it; r++) {
    const Q = [P[0]];
    for (let i = 0; i < P.length - 1; i++) {
      const a = P[i], b = P[i + 1];
      Q.push([0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]], [0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]]);
    }
    Q.push(P[P.length - 1]);
    P = Q;
  }
  return P;
}
const NECK = 1.62;
const NTORSO = 18;
// Oikea sivu alhaalta ylös: helma, vartalo, käsivarsi (sisäreuna alas, käsi, ulkoreuna ylös), hartia, kaula.
// Käsivarsi roikkuu vartalon vieressä; koko sivu on yhtä viivaa.
function sidePts(hem, fan) {
  const P = [];
  for (let j = 0; j < NTORSO; j++) { const y = 0.03 + (1.34 * j) / (NTORSO - 1); P.push([halfW(y, hem, fan), y]); }
  const arm = [[0.17, 1.36], [0.21, 1.15], [0.24, 0.95], [0.25, 0.88], [0.3, 0.84], [0.35, 0.88], [0.34, 1.05], [0.32, 1.28], [0.28, 1.47], [0.19, 1.55], [0.1, 1.58], [0.075, NECK]];
  return P.concat(chaikin(arm, 2));
}
const NSIDE = sidePts(0.4, 0).length;

// --- 2b. Kumppani viivaolentona: kolme vaihtoehtoa (kierros 4, suunnittelututkimus 1.11.2026) ----------
// Käyttäjä: "voisiko se olla joku muu kuin tikku-ukko? Jotenkin siitä valkoisesta viivasta vedetty olento."
// o.variant 'a' | 'b' | 'c' korvaa ihmisen ääriviivan; oletus (ei variantia) on alla oleva hahmo, joten renderi ei muutu.
// Kaikissa: yksi jatkuva veto, paperin väri, ei päätä, raajoja, kasvoja eikä siluettia; juuri maassa (y = 0),
// vapaa pää lähtee tuuleen (+x, sama tuuli kuin muualla). Koordinaatit paikalliset: jalka (0, 0), ylös +y, korkeus ~1,9.
//   a  kaisla/liekki: pystysuora S-kaari, jonka yläpää kiertyy avoimeksi silmukaksi; leveys ja amplitudi hengittävät viulun mukaan
//   b  solmu: viiva sitoo itsensä pystyyn seisovaksi kahdeksikoksi; kiristyy hellyydessä, avautuu riehakkuudessa; pää valuu maahan
//   c  kaari: yksi korkea kaari maasta ritarin pään korkeudelle ja takaisin; huippu kallistuu ritaria kohti viulun fraasin mukaan
// Kaikki on ajan funktio: ei tilaa ruutujen välillä. Viulun hengitys = S.fam.violins (o.S), fraasin suunta = o.dir (viuluviiva).
export const FIG_VARIANTS = ['a', 'b', 'c', 'ihminen'];
const NV = 320;
// pistejono -> tasavälinen kaarenpituuden mukaan: { P: [[x, y]...], total }
function resampleArc(P, n) {
  const Ls = [0];
  for (let i = 1; i < P.length; i++) Ls.push(Ls[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const total = Ls[Ls.length - 1];
  const out = [];
  let j = 0;
  for (let i = 0; i < n; i++) {
    const d = (total * i) / (n - 1);
    while (j < P.length - 2 && Ls[j + 1] < d) j++;
    const u = (d - Ls[j]) / Math.max(1e-9, Ls[j + 1] - Ls[j]);
    out.push([P[j][0] + (P[j + 1][0] - P[j][0]) * u, P[j][1] + (P[j + 1][1] - P[j][1]) * u]);
  }
  return { P: out, total };
}
// mielialan skalaari taulukosta
const moodScalar = (m, tbl) => moodWeights(m).reduce((a, [nm, k]) => a + k * (tbl[nm] ?? tbl.def), 0);
// viulun hengitys 0..1: S.fam.violins keskiarvo noin sekunnin yli (ei yksittäinen nuotinalku)
function violinBreath(o, t) {
  if (!o.S) return 0.5;
  let a = 0;
  for (let k = -2; k <= 2; k++) a += o.S.fam.violins(t + 0.25 * k);
  return clamp(a / 5);
}
// fraasin suunta -1..1: viuluviivan sävelkorkeus tasoitettuna (±2 s), vain kun viulu soi; muuten 0
function phraseDir(o, t) {
  if (!o.dir) return 0;
  let a = 0, w = 0;
  for (let k = -4; k <= 4; k++) { const d = o.dir(t + 0.5 * k); const c = smoothstep(0.05, 0.3, d.conf); a += c * (d.midi - 70); w += c; }
  return w > 0.5 ? clamp(a / w / 10, -1, 1) * Math.min(1, w / 4) : 0;
}
// Tuuleen lähtevä vapaa pää: jatkaa pisteestä p kulmasta th0 kohti tuulta (th = -droop), aaltoillen; pituus L
function windTail(p, th0, L, t, wind, rieh, droop, dir, turn = 0.4) {
  const n = 80, ds = L / n, out = [];
  let x = p[0], y = p[1];
  const thT = -droop;
  for (let j = 1; j <= n; j++) {
    const v = j / n;
    const th = th0 + (thT - th0) * smoothstep(0, turn, v) + (0.28 + 0.2 * wind + 0.25 * rieh) * Math.sin(2.6 * L * v - t * 2.2) * smoothstep(0.05, 0.6, v);
    x += Math.cos(th) * ds; y += Math.sin(th) * ds;
    let yy = y;
    if (dir) { const dr = dir(t - 2.5 * v); yy += Math.max(-0.45, Math.min(0.45, (dr.midi - 70) * DIR_K * 0.12)) * v * v * smoothstep(0.05, 0.3, dr.conf); }
    out.push([x, yy]);
  }
  return out;
}
// Yhteinen viimeistely: kallistus ritaria kohti (huippu siirtyy -x), tasaväli, leveys: leveäkärkinen sulka (kalligrafia)
// + ink-paine alussa + kasure lopussa. w0 = leveyden perusarvo.
function finishFigure(P0, o, w0, tailFrac) {
  const { P, total } = resampleArc(P0, NV);
  const lean = 1.8 * (o.tilt ?? 0);
  const X = new Float32Array(NV), Y = new Float32Array(NV), Wd = new Float32Array(NV);
  for (let i = 0; i < NV; i++) { X[i] = P[i][0] - lean * Math.pow(Math.max(0, P[i][1]) / 1.9, 2); Y[i] = P[i][1]; }
  for (let i = 0; i < NV; i++) {
    const a = Math.max(0, i - 1), b = Math.min(NV - 1, i + 1);
    const th = Math.atan2(Y[b] - Y[a], X[b] - X[a]);
    const nib = 0.55 + 0.45 * Math.abs(Math.sin(th - 0.7));
    const sA = (total * i) / (NV - 1);
    const pressIn = 0.4 + 0.6 * smoothstep(0, 0.35, sA);
    const e = i / (NV - 1);
    const dry = (1 - 0.6 * smoothstep(1 - tailFrac, 0.95, e)) * (1 - smoothstep(0.93, 1, e));   // kasure: ohenee, viimeinen kärki katoaa
    Wd[i] = Math.max(0.0001, w0 * nib * pressIn * dry);
  }
  return { X, Y, Wd };
}
// --- 2c. Kumppani ihmisenä hetkeksi (käyttäjän poikkeus 1.11.2026) ----------------------------------------
// "Mitä jos viiva muuttuu tunnistettavaksi hahmoksi, ikään kuin ihmiseksi hetkeksi? Tunnistettavasti ihmisen
// ruumis ja eleet. Ei staattinen piparkakkumuotti, vaan elävä olento, joka reagoi sankariin."
// Yksi jatkuva veto, joka piirtää ihmisen: tuulesta maata pitkin takakantapäähän, takajalka ylös, selkä, takakäsi
// (silmukka olkapäältä käteen ja takaisin), kaula, pää (kaari), etukäsi (silmukka), rinta alas, etujalka ja jalkaterä.
// Nivelet FK:na (lantio, selkä, olkapäät, kyynärpäät, polvet, pää). Kaikki ajan funktioita: ei tilaa ruutujen välillä.
// Ritari on -x:n puolella (loc_shore: root.scale.x hoitaa peilauksen), joten "eteen" = -x.
// Elämä: hengitys (0,22 Hz), painonsiirto (hidas kohina), pään nyökkäys viulun paisuessa.
// Reaktiot sankariin (o): toward 0..1 (nojautuu ja kääntyy häntä kohti; oletus viulusta), reach 0..1 (ojentaa käden
// hänen olkapäälleen), nojaa 0..1 (nojaa häneen, pää hänen olkaansa), gaze 0..1 (katsoo kuuta: pää taakse ylös),
// walk 0..1 (kävelee häntä kohti: jalat ja kädet vuorottelevat 1,3 askelta/s, root liikkuu kutsujan puolella).
const limb = (p, L, th) => [p[0] - L * Math.sin(th), p[1] - L * Math.cos(th)];   // th 0 = suoraan alas, + = eteen (-x)
function humanCurve(t, mood, o = {}) {
  const wind = o.wind ?? 0.3, trail = o.trail ?? 1;
  const br = violinBreath(o, t);
  const swell = clamp((br - violinBreath(o, t - 0.6)) * 3);
  const ph = phraseDir(o, t);
  const mw = moodWeights(mood);
  const rieh = mw.reduce((a, [n, k]) => a + (n === 'riehakkuus' ? k : 0), 0);
  const nojaa = clamp(o.nojaa ?? 0), reach = clamp(o.reach ?? 0), walk = clamp(o.walk ?? 0), gaze = clamp(o.gaze ?? 0);
  const toward = clamp(o.toward ?? (0.35 + 0.45 * br));
  const breath = Math.sin(TAU * 0.22 * t);
  const ws = Math.sin(0.5 * t + 1.7 * vnoise1(t * 0.07, 11)) * (1 - walk);   // painonsiirto -1..1
  const sp = TAU * 1.3 * t;                                                   // askelvaihe
  const sw = Math.sin(sp), swF = Math.sin(sp + Math.PI);
  const bob = walk * 0.02 * Math.abs(sw);
  // lantio ja selkäranka
  const px = 0.03 * ws - 0.1 * nojaa, py = 0.97 + bob + 0.01 * breath;
  const lean = 0.06 * toward + 0.26 * nojaa + 0.14 * reach + 0.05 * ph + 0.02 * ws;
  const Ls = 0.6 * (1 + 0.012 * breath);
  const spine = (u, side) => [px - u * Ls * Math.sin(lean) + side * (0.04 + 0.05 * Math.sin(Math.PI * u)) - 0.02 * Math.sin(Math.PI * u), py + u * Ls * Math.cos(lean)];
  const neck = spine(1, 0);
  // jalat: tukijalka suorempi, vapaa jalka hieman koukussa; kävellessä vuorottelu
  const hipB = [px + 0.045, py - 0.02], hipF = [px - 0.045, py - 0.02];
  const L1 = 0.48, L2 = 0.42;
  const thB = -0.04 + 0.3 * walk * sw - 0.08 * nojaa, thF = 0.1 + 0.3 * walk * swF + 0.18 * nojaa;
  const bendB = 0.08 + 0.05 * (1 + ws) / 2 + 0.55 * walk * Math.max(0, sw), bendF = 0.1 + 0.05 * (1 - ws) / 2 + 0.55 * walk * Math.max(0, swF);
  const kneeB = limb(hipB, L1, thB), ankleB = limb(kneeB, L2, thB - bendB);
  const kneeF = limb(hipF, L1, thF), ankleF = limb(kneeF, L2, thF - bendF);
  // kädet: etukäsi avautuu viulun mukaan ja ojentuu ritaria kohti; takakäsi tasapainottaa
  const S0 = spine(0.9, 0);
  const Sb = [S0[0] + 0.09, S0[1] - 0.02 + 0.01 * breath], Sf = [S0[0] - 0.1, S0[1] - 0.03 + 0.01 * breath];
  const A1 = 0.3, A2 = 0.27;
  const aF = Math.min(1.5, 0.12 + 0.55 * br + 1.3 * reach + 0.25 * walk * swF + 0.4 * rieh + 0.3 * nojaa);
  const eF = 0.45 + 0.3 * br - 0.25 * reach - 0.2 * nojaa;
  const aB = -0.1 + 0.35 * br + 0.25 * walk * sw + 0.3 * rieh;
  const eB = 0.3 + 0.2 * br;
  const Eb = limb(Sb, A1, aB), Hb = limb(Eb, A2, aB + eB);
  const Ef = limb(Sf, A1, aF), Hf = limb(Ef, A2, aF + eF);
  // pää: kallistus ritaria kohti, nyökkäys viulun paisuessa, kuuta katsoessa taakse ylös
  const tilt = (o.tilt ?? 0) + 0.12 * toward + 0.28 * nojaa + 0.12 * swell - 0.2 * gaze;
  const hr = 0.145, hc = [neck[0] - 0.19 * Math.sin(tilt), neck[1] + 0.19 * Math.cos(tilt)];
  const pts = [];
  // 1. häntä: tuulesta maata pitkin takakantapäähän
  const Ltail = (0.7 + 0.9 * wind) * (0.4 + 0.9 * trail);
  const tail = windTail([ankleB[0] + 0.03, 0.03], 0, Ltail, t, wind, rieh, 0.0, o.dir, 0.5).map(([x, y]) => [x, Math.max(0.02, y)]);
  for (let i = tail.length - 1; i >= 0; i--) pts.push(tail[i]);
  // 2. takajalka ylös
  pts.push([ankleB[0], Math.max(0.05, ankleB[1])], kneeB, hipB);
  // 3. selkä ylös
  for (let j = 1; j <= 8; j++) pts.push(spine(0.1 + (0.78 * j) / 8, +1));
  // 4. takakäsi: olkapää -> kyynärpää -> käsi ja takaisin (kapea silmukka)
  pts.push(Sb, Eb, Hb, [Hb[0] - 0.02, Hb[1] - 0.06], [Eb[0] + 0.02, Eb[1] + 0.01], [Sb[0] + 0.01, Sb[1] + 0.02]);
  // 5. kaula ja pää: takaa ylös, yli, eteen ja leukaan
  pts.push([neck[0] + 0.03, neck[1]]);
  const NHp = 22;
  for (let j = 0; j <= NHp; j++) {
    const a = -Math.PI / 2 + 1.0 + ((TAU - 2.0) * j) / NHp;
    const dx = hr * Math.cos(a), dy = hr * Math.sin(a);
    pts.push([hc[0] + dx * Math.cos(tilt) - dy * Math.sin(tilt), hc[1] + dx * Math.sin(tilt) + dy * Math.cos(tilt)]);
  }
  pts.push([neck[0] - 0.03, neck[1] - 0.01]);
  // 6. etukäsi: olkapää -> kyynärpää -> käsi ja takaisin
  pts.push(Sf, Ef, Hf, [Hf[0] - 0.03, Hf[1] - 0.05], [Ef[0] - 0.02, Ef[1] - 0.01], [Sf[0] - 0.01, Sf[1] - 0.03]);
  // 7. rinta ja vatsa alas
  for (let j = 7; j >= 1; j--) pts.push(spine((0.8 * j) / 8, -1));
  // 8. etujalka alas ja jalkaterä (kärki eteen, pieni nosto lopussa)
  pts.push(hipF, kneeF, [ankleF[0], Math.max(0.06, ankleF[1])], [ankleF[0] + 0.03, 0.03], [ankleF[0] - 0.17, 0.02], [ankleF[0] - 0.22, 0.06]);
  return finishFigure(chaikin(pts, 1), { ...o, tilt: 0 }, 0.1 * (0.92 + 0.16 * br), 0.08);
}
export function figureCurve(variant, t, mood, o = {}) {
  if (variant === 'ihminen') return humanCurve(t, mood, o);
  const wind = o.wind ?? 0.3, trail = o.trail ?? 1;
  const br = violinBreath(o, t);
  const mw = moodWeights(mood);
  const rieh = mw.reduce((a, [n, k]) => a + (n === 'riehakkuus' ? k : 0), 0);
  const Ltail = (0.8 + 1.0 * wind) * (0.45 + 0.9 * trail);
  const pts = [];
  if (variant === 'a') {
    // vars: S-kaari maasta ylös, amplitudi ja leveys hengittävät
    const sw = moodScalar(mood, { hellyys: 0.85, kaipaus: 1.0, ilo: 1.15, kevyt: 1.1, sentimentaali: 1.1, riehakkuus: 1.45, def: 1 });
    const A = 0.15 * sw * (0.65 + 0.7 * br);
    const Hs = 1.2, ph = 0.9 * t;
    const NS = 110;
    for (let i = 0; i <= NS; i++) {
      const v = i / NS;
      const env = smoothstep(0, 0.35, v) * 0.85 + 0.15 * v;
      pts.push([A * Math.sin(2 * Math.PI * v * 1.0 + ph) * env, Hs * v]);
    }
    // silmukka: kiertyy vastapäivään (ritaria kohti), 281 astetta, ei sulkeudu; päättyessä suunta ~ tuuleen
    const [px, py] = pts[pts.length - 1], [qx, qy] = pts[pts.length - 2];
    let th = Math.atan2(py - qy, px - qx), x = px, y = py;
    const r = 0.21 * (0.85 + 0.3 * br) * moodScalar(mood, { riehakkuus: 1.25, hellyys: 0.9, def: 1 });
    const turn = 4.9, Ll = r * turn, NL = 90;
    let ws = 0; const wg = [];
    for (let i = 0; i < NL; i++) { const v = (i + 0.5) / NL; const w = smoothstep(0, 0.2, v) * (1 - smoothstep(0.78, 1, v)) + 0.0001; wg.push(w); ws += w; }
    for (let i = 0; i < NL; i++) {
      th += (turn * wg[i]) / ws; x += Math.cos(th) * (Ll / NL); y += Math.sin(th) * (Ll / NL);
      pts.push([x, y]);
    }
    pts.push(...windTail([x, y], th, 1.35 * Ltail, t, wind, rieh, -0.55, o.dir));   // vapaa pää nousee tuuleen kuin liekin kieli
    return finishFigure(pts, o, 0.115 * (0.85 + 0.3 * br), 0.4);
  }
  if (variant === 'b') {
    // kahdeksikko: x = a sin 2φ, y = yc + b sin φ, ajettuna alhaalta (suunta tuuleen) kaksi lohkoa; sisään ja ulos maata pitkin
    const tight = moodScalar(mood, { hellyys: 0.9, kaipaus: 0.55, ilo: 0.35, kevyt: 0.25, sentimentaali: 0.6, riehakkuus: 0, sarkasmi: 0.7, def: 0.5 });
    const a = (0.34 - 0.17 * tight) * (0.88 + 0.24 * br);
    const bb = 0.88 * (0.96 + 0.08 * br), yc = 0.2 + bb;
    const NE = 160;
    for (let i = 0; i < 20; i++) { const v = i / 20; pts.push([-0.42 + 0.42 * v, 0.02 + (0.2 - 0.02) * smoothstep(0, 1, v)]); }
    const sway = (y) => 0.05 * Math.sin(0.8 * t + 1.4 * y) * (0.5 + 0.5 * wind);
    for (let i = 0; i <= NE; i++) {
      const phi = -0.5 * Math.PI - (4 * Math.PI * i) / NE;
      const x = a * Math.sin(2 * phi), y = yc + bb * Math.sin(phi);
      pts.push([x + sway(y), y]);
    }
    const last = pts[pts.length - 1];
    pts.push(...windTail([last[0], last[1]], 0, Ltail, t, wind, rieh, 0.02, o.dir).map(([x, y]) => [x, Math.max(0.0, y - 0.18 * smoothstep(0, 0.3, (x - last[0]) / Math.max(0.1, Ltail)))]));
    return finishFigure(pts, o, 0.1 * (0.9 + 0.2 * br), 0.5);
  }
  if (variant === 'c') {
    // kaari: pystynousu, tiukka käännös huipulla, pystylasku, ulosvirtaus maata pitkin tuuleen; huippu kallistuu fraasin mukaan
    const La = 3.9, N = 170;
    const ph = phraseDir(o, t);
    const H = 0.94 + 0.12 * br;
    const sweep = (v) => Math.PI * smoothstep(0.2, 0.8, v);
    let x = 0, y = 0;
    pts.push([0, 0]);
    for (let i = 1; i <= N; i++) {
      const v = i / N, vp = (i - 1) / N;
      const thm = Math.PI / 2 - sweep((v + vp) / 2);
      x += Math.cos(thm) * (La / N) * 0.8; y += Math.sin(thm) * (La / N) * 1.15 * H;
      pts.push([x, y]);
    }
    const lean = 0.28 + 0.32 * ph;   // huippu kallistuu ritaria kohti (-x)
    for (const q of pts) q[0] -= lean * Math.pow(Math.max(0, q[1]) / 1.8, 1.8);
    // oikea jalka päättyy ylemmäs ja kääntyy pehmeästi maata pitkin (ei kulmaa); maa pehmeä alaraja
    while (pts.length > 2 && pts[pts.length - 1][1] < 0.7 && pts[pts.length - 1][0] > 0.3) pts.pop();
    const last = pts[pts.length - 1], prev = pts[pts.length - 2];
    pts.push(...windTail([last[0], last[1]], Math.atan2(last[1] - prev[1], last[0] - prev[0]), 1.5 * Ltail, t, wind, rieh, 0.0, o.dir, 0.8).map(([qx, qy]) => [qx, 0.5 * (qy + 0.02 + Math.hypot(qy - 0.02, 0.1))]));
    return finishFigure(pts, o, 0.12 * (0.9 + 0.2 * br), 0.45);
  }
  throw new Error('companionFigure: tuntematon variantti ' + variant);
}

export function companionFigure(parent) {
  const root = new THREE.Group();
  parent.add(root);
  const NH = 26, NT = 60, NHEM = 24;
  const NP = NT + NSIDE + NH + 3 + NSIDE + NHEM;
  const R = ribbon(NP);
  const mat = ink(C.paper, {});
  const mesh = new THREE.Mesh(R.geo, mat);
  mesh.frustumCulled = false;
  root.add(mesh);
  const X = new Float32Array(NP), Y = new Float32Array(NP), Wd = new Float32Array(NP);
  const Y0 = 0.55;   // vyötärö: kumarruksen nivel
  // viivaolentovariantit (a/b/c): oma nauha samalla materiaalilla; oletus (ei variantia) piirtää ylläolevan hahmon
  const RV = ribbon(NV);
  const meshV = new THREE.Mesh(RV.geo, mat);
  meshV.frustumCulled = false;
  meshV.visible = false;
  root.add(meshV);

  function pose(t, mood = 'hellyys', o = {}) {
    const useV = FIG_VARIANTS.includes(o.variant);
    mesh.visible = !useV;
    meshV.visible = useV;
    if (useV) {
      const c = figureCurve(o.variant, t, mood, o);
      RV.fill(c.X, c.Y, 0, c.Wd);
      return;
    }
    const mw = moodWeights(mood);
    const sark = mw.reduce((a, [n, k]) => a + (n === 'sarkasmi' ? k : 0), 0);
    const rieh = mw.reduce((a, [n, k]) => a + (n === 'riehakkuus' ? k : 0), 0);
    const dirF = o.dir, dirK = o.k ?? DIR_K, spin = o.spin ?? 0, bow = o.bow ?? 0, wind = o.wind ?? 0.3, trail = o.trail ?? 1;
    const tilt = o.tilt ?? 0.05 * Math.sin(t * 0.37);
    const c = Math.cos(spin);
    const cx = (c < 0 ? -1 : 1) * Math.max(0.07, Math.abs(c));
    const fan = (o.fan ?? 0) + 0.18 * rieh + 0.85 * Math.abs(Math.sin(spin));
    const hem = 0.38 + 0.4 * fan;
    let n = 0;
    const add = (x, y, w) => { X[n] = x; Y[n] = y; Wd[n] = w; n++; };
    const W0 = 0.085;
    // häntä: helman oikeasta reunasta ulos, tuulen mukana (kirjoitetaan loppupäästä alkuun)
    const L = (2.4 + 1.6 * wind) * trail;
    for (let j = NT; j >= 1; j--) {
      const v = j / NT;
      let y = 0.03 + (0.13 + 0.12 * rieh) * Math.sin(2.3 * L * v - t * 2.2) * v - 0.1 * v * v;
      if (sark > 0) y += 0.28 * sark * tri((L * v) / 0.55) * v;
      let wv = Math.max(0.0001, W0 * (1 - 0.7 * v));
      if (dirF) {   // häntä seuraa viulun suuntaa: kauempana = vanhempi hetki
        const dr = dirF(t - 2.5 * v);
        y += Math.max(-1.6, Math.min(1.6, (dr.midi - 70) * dirK * 0.5)) * v * smoothstep(0.05, 0.3, dr.conf);
        wv *= smoothstep(0.05, 0.3, dr.conf);
      }
      add(hem * cx + L * v, y, wv);
    }
    const side = sidePts(hem, fan);
    // oikea sivu ylös
    for (let j = 0; j < NSIDE; j++) {
      const [px, py] = side[j];
      const sway = 0.04 * Math.sin(t * 0.8 + py * 2.0) * wind * (1 - py / NECK);
      add((px + sway) * cx, py, W0);
    }
    // pää (tilt: nivel kaulan tyvessä)
    const hr = 0.16, hcy = NECK + 0.19;
    const cT = Math.cos(tilt), sT = Math.sin(tilt);
    const rot = (x, y) => { const dx = x, dy = y - NECK; return [dx * cT - dy * sT, NECK + dx * sT + dy * cT]; };
    for (let j = 0; j < NH; j++) {
      const a = -1.25 + ((Math.PI + 2.5) * j) / (NH - 1);
      const [hx, hy] = rot(hr * Math.cos(a), hcy + hr * Math.sin(a));
      add(hx * cx, hy, W0);
    }
    add(-0.075 * cx, NECK, W0);
    add(-0.075 * cx, NECK - 0.02, W0);
    add(-0.075 * cx, NECK - 0.03, W0);
    // vasen sivu alas (peilikuva, vastakkainen suunta)
    for (let j = NSIDE - 1; j >= 0; j--) {
      const [px, py] = side[j];
      const sway = 0.04 * Math.sin(t * 0.8 + py * 2.0 + 1.3) * wind * (1 - py / NECK);
      add((-px + sway) * cx, py, W0);
    }
    // helma vasemmasta oikeaan: viuhka, ja sarkasmissa siksak-piikit
    for (let j = 0; j < NHEM; j++) {
      const v = j / (NHEM - 1);
      let y = 0.03 - 0.05 * Math.sin(Math.PI * v) + 0.035 * fan * Math.sin(7 * Math.PI * v + t * 1.8);
      if (sark > 0 && j % 2 === 1) y -= 0.32 * sark * (0.6 + 0.4 * Math.sin(j));
      add((-hem + 2 * hem * v) * cx, y, W0);
    }
    // kumarrus: ylävartalo kääntyy eteen (+x) vyötäröltä, pehmeästi
    if (bow !== 0) {
      for (let i = 0; i < n; i++) {
        if (Y[i] <= Y0) continue;
        const ph = -bow * smoothstep(Y0, 1.45, Y[i]);
        const cs = Math.cos(ph), sn = Math.sin(ph);
        const dy = Y[i] - Y0;
        const x = X[i];
        X[i] = x * cs - dy * sn;
        Y[i] = Y0 + x * sn + dy * cs;
      }
    }
    for (let i = n; i < NP; i++) { X[i] = X[n - 1]; Y[i] = Y[n - 1]; Wd[i] = 0; }
    R.fill(X, Y, 0, Wd);
  }
  return { root, mesh, mat, pose };
}

// --- 3. Punos ---------------------------------------------------------------------------------------
// Punainen veto (viiri) ja valkoinen viiva (kumppani) kietoutuvat yhteen maston yläpuolella ja
// kulkevat tuulen mukana +x-suuntaan. set(t, x0, y0, len, tight, purple, wid):
//   tight 0..1: löyhät silmukat -> kireä punos; purple 0..1: kohtaamiskohtien purppuralaatat (oma
//   geometria, ei sekoitusta); wid: leveyskerroin (pp ohut, mf leveä).
export function braid(parent, N = 160) {
  const Rr = ribbon(N), Rw = ribbon(N);
  const redMat = ink(C.red, { shade: C.black, raster: 0 });
  const whiteMat = ink(C.paper, {});
  const mr = new THREE.Mesh(Rr.geo, redMat), mw = new THREE.Mesh(Rw.geo, whiteMat);
  mr.frustumCulled = mw.frustumCulled = false;
  parent.add(mr, mw);
  const purpleMat = ink(C.purple, {});
  const lens = poly([[-1, 0], [0, 0.55], [1, 0], [0, -0.55]]);
  const NPUR = 14;
  const purples = Array.from({ length: NPUR }, () => {
    const m = new THREE.Mesh(new THREE.ShapeGeometry(lens, 4), purpleMat);
    m.frustumCulled = false;
    m.visible = false;
    parent.add(m);
    return m;
  });
  const XR = new Float32Array(N), YR = new Float32Array(N), ZR = new Float32Array(N), WR = new Float32Array(N);
  const XW = new Float32Array(N), YW = new Float32Array(N), ZW = new Float32Array(N), WW = new Float32Array(N);
  function set(t, x0, y0, len, tight = 0.3, purple = 0, wid = 1) {
    const lam = mix(3.4, 1.15, tight);          // aallonpituus: kireä = tiheä
    const A0 = mix(0.62, 0.13, tight);
    const k = TAU / lam;
    const ph = t * 1.1;                          // punos valuu tuulen mukana
    const baseY = (x) => {
      const v = clamp((x - x0) / Math.max(0.01, len));
      return y0 + 0.28 * Math.sin(0.55 * (x - x0) - t * 1.7) * v - 0.35 * v * v;
    };
    for (let i = 0; i < N; i++) {
      const u = i / (N - 1);
      const x = x0 + len * u;
      const env = smoothstep(0, 0.14, u) * (1 - 0.35 * smoothstep(0.7, 1, u));
      const a = k * (x - x0) - ph;
      const b = baseY(x);
      const off = A0 * env * Math.sin(a);
      XR[i] = x; YR[i] = b + off; ZR[i] = 0.05 * Math.cos(a);
      XW[i] = x; YW[i] = b - off; ZW[i] = -0.05 * Math.cos(a);
      const tp = 1 - 0.75 * smoothstep(0.55, 1, u);
      WR[i] = 0.22 * wid * tp * smoothstep(0, 0.04, u);
      WW[i] = 0.1 * wid * tp * smoothstep(0, 0.04, u);
    }
    Rr.fill(XR, YR, ZR, WR);
    Rw.fill(XW, YW, ZW, WW);
    // kohtaamiskohdat: sin(a) = 0
    purples.forEach((m) => (m.visible = false));
    if (purple > 0.01 && len > 0.5) {
      let j = 0;
      const xmin = x0 + Math.max(0.14 * len, 0.4);
      for (let q = Math.ceil((k * (xmin - x0) - ph) / Math.PI); j < NPUR; q++) {
        const x = x0 + (q * Math.PI + ph) / k;
        if (x > x0 + len * 0.92) break;
        const m = purples[j++];
        m.visible = true;
        m.position.set(x, baseY(x), 0.12);
        m.scale.set(0.17 * purple * (0.6 + 0.4 * wid), 0.17 * purple * (0.6 + 0.4 * wid), 1);
      }
    }
  }
  return { redMat, whiteMat, purpleMat, set, meshes: [mr, mw, ...purples] };
}
