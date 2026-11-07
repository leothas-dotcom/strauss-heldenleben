// Siveltimenveto, teemaviiva, vedoista maalattu sankari ja roiskeet (Punainen muste, tyyli: luku 18).
// Kaikki on puhdasta aikafunktiota: geometria lasketaan uudelleen joka ruudulla, kohina on
// siemennettyä ja sidottu vedon omaan s-koordinaattiin (ei ruutuun, ei ajastimiin).
//   brushStroke(parent, N, color, opts) -> { mesh, mat, set(points, pressure, inkLeft) }
//   themeLine(S, teemaviivaJson)        -> { y(t), conf(t), yReg(midi), trace(ta, tb, dt) }
//   inkHero(parent)                     -> { root, strokes, setFrieze(pts), morph(t, u) }
//   splat(parent, n)                    -> { set(t, events, LEAD) }
//   tipTrail(parent, S, opts)           -> { set(t, tip, wind, from, k), last, mesh } (viirin jättämä muste)

import * as THREE from 'three';
import { C, U, HALFTONE } from './ink.js';
import { hash1, vnoise1, clamp, smoothstep } from '../util.js';

// --- Siveltimen materiaali --------------------------------------------------------------------
const BVS = /* glsl */ `
  attribute vec4 aA;   // u (-1..1 poikki), s (kaarenpituus, maailman yksikköä), T (0..1), muste
  attribute vec2 aB;   // ytimen puolileveys, kokonaispuolileveys (nijimi mukana)
  varying vec4 vA;
  varying vec2 vB;
  varying vec2 vP;
  void main() {
    vA = aA; vB = aB;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vP = w.xy;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const BFS = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uShade;
  uniform float uCell;
  uniform float uDim;
  uniform float uAppear;
  uniform float uSeed;
  uniform float uHairW;   // karvan leveys (maailman yksikköä)
  uniform float uFs;      // karvan kohinataajuus pitkin vetoa (1 / yksikkö)
  uniform float uBleed;   // nijimin enimmäisulottuvuus
  uniform float uDryLen;  // kasuren osuus vedon lopusta
  uniform float uDryAmt;
  varying vec4 vA;
  varying vec2 vB;
  varying vec2 vP;
  ${HALFTONE}
  void main() {
    if (uAppear < 0.999) {
      float da = halftone(1.0 - uAppear, 0.4, uCell * 1.4);
      if (da > 0.5) discard;
    }
    float u = vA.x, s = vA.y, T = vA.z, ink = clamp(vA.w, 0.0, 1.0);
    float core = vB.x, tot = vB.y;
    float dist = abs(u) * tot;
    // kuivuus: muste vähenee ja vedon loppu kuivuu (kasure)
    float dryT = smoothstep(1.0 - uDryLen, 1.0, T);
    float D = clamp((1.0 - ink) * 0.95 + dryT * uDryAmt, 0.0, 1.0);
    // reuna elää hieman (sidottu s:ään)
    float wob = 1.0 + 0.07 * (vnoise(vec2(s * 5.0, uSeed + 31.0)) - 0.5);
    float coreE = core * wob;
    vec3 c = uColor;
    if (dist <= coreE) {
      // karvat: kukin karva jättää jäljen, jos sen kohina ylittää kuivuuskynnyksen
      float q = u * tot / uHairW;
      float idx = floor(q);
      float f = fract(q);
      float n = 0.6 * vnoise(vec2(s * uFs, idx * 13.0 + uSeed)) + 0.4 * vnoise(vec2(s * uFs * 3.3 + 7.0, idx * 13.0 + uSeed + 5.0));
      float rel = dist / max(coreE, 1e-4);
      float th = 0.82 * pow(D, 1.25) + 0.30 * pow(rel, 4.0) * D;
      float gap = 0.55 * pow(D, 1.5);
      if (n < th || f < gap * 0.5 || f > 1.0 - gap * 0.5) discard;
      // vaalea paine: paperin pisteet läpi vaaleassa kohdassa
      float pale = 0.2 * (1.0 - ink) * (1.0 - dryT);
      c = mix(c, uShade, halftone(pale, 0.26, uCell));
    } else {
      // nijimi: märkä reuna leviää paperin kuituja pitkin rasteripisteinä
      float fib = vnoise(vP * vec2(13.0, 3.2) + uSeed);
      float R = uBleed * (1.0 - D) * pow(ink, 1.2) * (0.55 + 0.9 * fib);
      float d = dist - coreE;
      if (d >= R || R < 1e-4) discard;
      float cov = 1.0 - d / R;
      if (halftone(cov, 0.52, uCell * 0.8) < 0.5) discard;
    }
    if (uDim > 0.002) c = mix(c, vec3(0.12, 0.1, 0.095), halftone(clamp(uDim, 0.0, 1.0) * 0.92, 0.785, uCell));
    gl_FragColor = vec4(c, 1.0);
  }
`;

function brushMaterial(color, o) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uShade: { value: new THREE.Color(o.shade ?? C.paper) },
      uCell: U.uCell, uDim: U.uDim,
      uAppear: { value: 1 },
      uSeed: { value: o.seed },
      uHairW: { value: o.hairW },
      uFs: { value: o.fs },
      uBleed: { value: o.bleed },
      uDryLen: { value: o.dryLen },
      uDryAmt: { value: o.dryAmt },
    },
    vertexShader: BVS,
    fragmentShader: BFS,
    side: THREE.DoubleSide,
    depthWrite: true,
  });
}

// --- Siveltimenveto ---------------------------------------------------------------------------
// opts: wmin, wmax (maailman yksikköä), hairW, fs, bleed, dryLen, dryAmt, lambda (musteen kuluminen),
//       capIn (alkukuori, yksikköä), tail (loppuhaarto, osuus pituudesta), seed, z, shade
export function brushStroke(parent, N, color, opts = {}) {
  const o = {
    wmin: 0.06, wmax: 0.5, hairW: 0.045, fs: 2.4, bleed: 0.05, dryLen: 0.3, dryAmt: 1.0,
    lambda: 0.03, capIn: null, tail: 0.16, seed: 1, z: 0, ...opts,
  };
  o.seedN = Math.floor(o.seed) % 997;
  const mat = brushMaterial(color, { ...o, seed: o.seedN });
  const pos = new Float32Array(N * 2 * 3);
  const aA = new Float32Array(N * 2 * 4);
  const aB = new Float32Array(N * 2 * 2);
  const idx = [];
  for (let i = 0; i < N - 1; i++) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aA', new THREE.BufferAttribute(aA, 4));
  g.setAttribute('aB', new THREE.BufferAttribute(aB, 2));
  g.setIndex(idx);
  const mesh = new THREE.Mesh(g, mat);
  mesh.frustumCulled = false;
  mesh.position.z = o.z;
  parent.add(mesh);

  const rx = new Float32Array(N), ry = new Float32Array(N), rp = new Float32Array(N), ri = new Float32Array(N);
  const cum = [];
  const src = new Float32Array(N);   // n�ytteen paikka alkuper�isten pisteiden indeksin�
  const lerpArr = (a, x) => { const i = Math.min(a.length - 2, Math.max(0, Math.floor(x))); return a[i] + (a[i + 1] - a[i]) * clamp(x - i); };
  // arvo: luku | f(0..1) | taulukko (pisteiden pituinen = sidottu pisteisiin, muuten tasav�lein)
  const val = (a, f, d, k, M) => {
    if (typeof a === 'function') return a(f);
    if (Array.isArray(a) || ArrayBuffer.isView(a)) return a.length === M ? lerpArr(a, src[k]) : lerpArr(a, f * (a.length - 1));
    return a ?? d;
  };

  // points: [[x,y], ...]; pressure: luku | taulukko | f(0..1) -> 0..1; inkLeft: alkumuste (luku) tai taulukko/funktio
  function set(points, pressure = 0.7, inkLeft = 1, flatEnds = 0) {
    const M = points.length;
    if (M < 2) { mesh.visible = false; return; }
    cum.length = M;
    cum[0] = 0;
    for (let i = 1; i < M; i++) cum[i] = cum[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
    const L = cum[M - 1];
    if (L < 1e-5) { mesh.visible = false; return; }
    mesh.visible = true;
    // uudelleennäytteistys kaarenpituuden mukaan
    let j = 0;
    for (let i = 0; i < N; i++) {
      const s = (i / (N - 1)) * L;
      while (j < M - 2 && cum[j + 1] < s) j++;
      const seg = cum[j + 1] - cum[j] || 1e-9;
      const f = clamp((s - cum[j]) / seg);
      src[i] = j + f;
      rx[i] = points[j][0] + (points[j + 1][0] - points[j][0]) * f;
      ry[i] = points[j][1] + (points[j + 1][1] - points[j][1]) * f;
    }
    const capIn = o.capIn ?? o.wmax * 0.55;
    const tailL = Math.max(1e-4, o.tail * L);
    let used = 0;
    const inkArr = typeof inkLeft === 'number' ? null : inkLeft;
    for (let i = 0; i < N; i++) {
      const fr = i / (N - 1), s = fr * L;
      // paine: kaksi tasoitusta (hento käden kohina, s-sidottu)
      let p = clamp(val(pressure, fr, 0.7, i, M));
      p = clamp(p * (0.94 + 0.12 * vnoise1(s * 0.9, o.seedN + 3)));
      const wBase = o.wmin + (o.wmax - o.wmin) * Math.pow(p, 0.7);
      const x0 = clamp(s / capIn);
      const eIn = Math.sqrt(1 - (1 - x0) * (1 - x0));              // pyöreä alku (tome)
      const eOut = 1 - 0.94 * smoothstep(0, 1, clamp((s - (L - tailL)) / tailL)) ** 0.9; // harai
      const w = Math.max(wBase * (eIn + (1 - eIn) * flatEnds) * (eOut + (1 - eOut) * flatEnds), 0.0001);
      if (i > 0) used += w * (L / (N - 1));
      const ink = inkArr ? clamp(val(inkArr, fr, 1, i, M)) : clamp(inkLeft * Math.exp(-o.lambda * used));
      rp[i] = w; ri[i] = ink;
    }
    // normaalit (miter, rajattu)
    for (let i = 0; i < N; i++) {
      const a = Math.max(0, i - 1), b = Math.min(N - 1, i + 1);
      let t0x = rx[i] - rx[a], t0y = ry[i] - ry[a], t1x = rx[b] - rx[i], t1y = ry[b] - ry[i];
      const l0 = Math.hypot(t0x, t0y), l1 = Math.hypot(t1x, t1y);
      if (l0 < 1e-9) { t0x = t1x; t0y = t1y; } else { t0x /= l0; t0y /= l0; }
      if (l1 < 1e-9) { t1x = t0x; t1y = t0y; } else { t1x /= l1; t1y /= l1; }
      let nx = -(t0y + t1y), ny = t0x + t1x;
      const nl = Math.hypot(nx, ny) || 1;
      nx /= nl; ny /= nl;
      const n0x = -t0y, n0y = t0x;
      const k = 1 / Math.max(0.55, nx * n0x + ny * n0y);
      const core = rp[i] / 2;
      const tot = core * 1.12 + o.bleed * 1.0;
      const wpx = nx * tot * Math.min(k, 1.0 + 0.0) , wpy = ny * tot * Math.min(k, 1.0 + 0.0);
      const fr = i / (N - 1);
      const v = i * 2;
      pos.set([rx[i] - wpx, ry[i] - wpy, 0, rx[i] + wpx, ry[i] + wpy, 0], v * 3);
      aA.set([-1, fr * L, fr, ri[i], 1, fr * L, fr, ri[i]], v * 4);
      aB.set([core, tot, core, tot], v * 2);
    }
    g.attributes.position.needsUpdate = true;
    g.attributes.aA.needsUpdate = true;
    g.attributes.aB.needsUpdate = true;
  }
  return { mesh, mat, set, N };
}

// --- Teemaviiva -------------------------------------------------------------------------------
// teemaviiva.json: fps, t0 (puolen aikaa), midi[] (null = ei nuottia), varmuus[]. Ruutujen välillä
// lineaarinen; kun nuottia ei ole, palautetaan null. Rekisteri: C2 (midi 36) = 0 ... C6 (midi 84) = 12.
export function themeLine(S, tv) {
  const fps = tv.fps || 30;
  const off = S && S.meta ? -(S.meta.start || 0) : 0;   // puolen aika -> paketin aika
  const t0 = tv.t0 + off;
  const n = tv.midi.length;
  const yReg = (midi) => (midi - 36) / 4;
  const at = (arr, t) => {
    const f = (t - t0) * fps;
    if (f < 0 || f > n - 1) return null;
    const i = Math.floor(f);
    const a = arr[i];
    if (a === null || a === undefined) return null;
    const b = arr[Math.min(n - 1, i + 1)];
    if (b === null || b === undefined) return a;
    return a + (b - a) * (f - i);
  };
  const y = (t) => { const m = at(tv.midi, t); return m === null ? null : yReg(m); };
  const conf = (t) => at(tv.varmuus, t);
  const midi = (t) => at(tv.midi, t);
  // polku vedoksi: x = t * kx + x0, y = yReg * ky + y0; ohittaa tyhjät kohdat (pitää edellisen arvon)
  // opts.smooth: gaussinen tasoitus sekunteina (hyppy kvintist� yl�s on silti yhden ruudun jyrkkyys; tasoitus
  // py�rist�� vain kulmat ja pit�� s�velkorkeuden alle 0,2 puolis�velaskelen virheess� tasanteilla).
  function trace(ta, tb, dt = 1 / 30, map = (t, yy) => [t, yy], opts = {}) {
    const sg = opts.smooth ?? 0;
    const ts = [], ys = [], cf = [];
    for (let t = ta; t <= tb + 1e-9; t += dt) {
      const yy = y(t);
      if (yy === null) continue;
      ts.push(t); ys.push(yy); cf.push(conf(t));
    }
    let ys2 = ys;
    if (sg > 0) {
      const r = Math.ceil((3 * sg) / dt);
      ys2 = ys.map((_, i) => {
        let a = 0, w = 0;
        for (let k = Math.max(0, i - r); k <= Math.min(ys.length - 1, i + r); k++) { const g = Math.exp(-0.5 * (((k - i) * dt) / sg) ** 2); a += g * ys[k]; w += g; }
        return a / w;
      });
    }
    return { pts: ts.map((t, i) => map(t, ys2[i])), conf: cf };
  }
  return { y, conf, midi, yReg, trace, t0, t1: t0 + (n - 1) / fps };
}

// --- Sankari 20 vedolla -----------------------------------------------------------------------
// Koordinaatit sankarin omia (jalat y=0, korkeus noin 3, kasvot oikealle). Kaikki punaista C.red.
const HERO = [
  // [nimi, pisteet, paine (luku | f), leveys-kerroin]
  ['keihas_viiri', [[0.46, 0.04], [0.465, 1.2], [0.46, 2.4], [0.45, 3.3], [0.85, 3.5], [1.3, 3.25], [1.8, 3.5], [2.35, 3.28]], (f) => (f < 0.62 ? 0.16 : 0.16 + 0.8 * Math.sin(Math.min(1, (f - 0.62) / 0.14) * Math.PI / 2)), 1],
  ['kello_vasen', [[-0.05, 2.0], [-0.1, 2.3], [-0.26, 2.58], [-0.5, 2.78]], 0.7, 1.5],
  ['kello_oikea', [[0.13, 2.0], [0.18, 2.3], [0.34, 2.58], [0.58, 2.78]], 0.7, 1.5],
  ['kello_suu', [[-0.56, 2.84], [-0.2, 2.96], [0.26, 2.96], [0.64, 2.84]], 0.9, 1.2],
  ['leuka', [[-0.1, 1.92], [0.04, 1.84], [0.18, 1.9]], 0.5, 1],
  ['torso', [[-0.2, 1.02], [-0.24, 1.4], [-0.16, 1.85]], 0.8, 1.3],
  ['torven_kierre', [[0.1, 1.46], [0.18, 1.42], [0.22, 1.52], [0.16, 1.62], [0.04, 1.6], [0.0, 1.46], [0.06, 1.3], [0.2, 1.26], [0.3, 1.4]], 0.55, 0.8],
  ['kasi_ylempi', [[0.34, 1.8], [0.58, 1.64], [0.62, 1.4]], 0.6, 1],
  ['kasi_alempi', [[0.62, 1.4], [0.56, 1.5], [0.48, 1.6]], 0.5, 1],
  ['kasi_kauka', [[-0.5, 1.8], [-0.7, 1.55], [-0.62, 1.3]], 0.5, 1],
  ['viitta_paa', [[-0.08, 1.76], [-0.42, 1.55], [-0.68, 1.05], [-0.86, 0.55], [-1.05, 0.28]], 0.9, 1.3],
  ['viitta_reuna', [[-0.04, 1.62], [-0.34, 1.25], [-0.52, 0.8], [-0.6, 0.45]], 0.4, 1],
  ['helma_taka', [[-0.22, 1.08], [-0.34, 0.8], [-0.4, 0.55]], 0.6, 1],
  ['helma_etu', [[0.2, 1.08], [0.34, 0.8], [0.4, 0.6]], 0.6, 1],
  ['jalka_lahi', [[0.06, 1.0], [0.14, 0.6], [0.1, 0.16], [0.38, 0.06]], 0.7, 1.1],
  ['saapas_lahi', [[0.0, 0.12], [0.2, 0.02], [0.4, 0.06]], 0.8, 0.9],
  ['jalka_kauka', [[-0.1, 1.0], [-0.14, 0.6], [-0.22, 0.16], [-0.04, 0.06]], 0.55, 1],
  ['saapas_kauka', [[-0.28, 0.1], [-0.12, 0.02], [0.04, 0.05]], 0.6, 0.8],
  ['vyo', [[-0.3, 1.1], [-0.05, 1.06], [0.2, 1.1], [0.34, 1.08]], 0.5, 0.9],
];

function catmull(pts, per = 8) {
  const out = [];
  const P = [pts[0], ...pts, pts[pts.length - 1]];
  for (let i = 1; i < P.length - 2; i++) {
    const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
    for (let k = 0; k < per; k++) {
      const t = k / per, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((c) => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3)));
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}
function arcLen(pts) { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; }
function resamplePts(pts, n) {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const L = cum[cum.length - 1];
  const out = [];
  let j = 0;
  for (let i = 0; i < n; i++) {
    const s = (i / (n - 1)) * L;
    while (j < pts.length - 2 && cum[j + 1] < s) j++;
    const f = clamp((s - cum[j]) / (cum[j + 1] - cum[j] || 1e-9));
    out.push([pts[j][0] + (pts[j + 1][0] - pts[j][0]) * f, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * f]);
  }
  return out;
}
const easeIO = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const nz2 = (x, y, s) => {
  const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const h = (a, b) => hash1(a * 7919 + b * 104729 + s * 15485863);
  return (h(xi, yi) * (1 - ux) + h(xi + 1, yi) * ux) * (1 - uy) + (h(xi, yi + 1) * (1 - ux) + h(xi + 1, yi + 1) * ux) * uy;
};
const curl = (x, y, s) => { const e = 0.05; return [(nz2(x, y + e, s) - nz2(x, y - e, s)) / (2 * e), -(nz2(x + e, y, s) - nz2(x - e, y, s)) / (2 * e)]; };

export function inkHero(parent, opts = {}) {
  const NP = 56;               // pisteitä vedossa (sama kuvassa ja friisissä)
  const root = new THREE.Group();
  parent.add(root);
  const K = HERO.length;
  const strokes = HERO.map(([name, pts, pr, wk], k) => {
    const base = resamplePts(catmull(pts, 10), NP);
    const L = arcLen(base);
    const bs = brushStroke(root, NP, C.red, {
      wmin: 0.02 * wk, wmax: 0.25 * wk * 0.75, hairW: 0.0175, fs: 4.0, bleed: 0.02, dryLen: 0.2, dryAmt: 0.75, lambda: 0.04, capIn: 0.14, tail: 0.18,
      seed: 11 + k * 7, z: 0.001 * k,
    });
    const cx = base.reduce((a, p) => a + p[0], 0) / NP, cy = base.reduce((a, p) => a + p[1], 0) / NP;
    return { name, base, L, pr, bs, cx, cy, F: null, rank: 0, flow: 0 };
  });
  // parit: järjestys vasemmalta oikealle ja ylöspäin (melodian suunta)
  const order = strokes.map((s, i) => i).sort((a, b) => (strokes[a].cx + 0.35 * strokes[a].cy) - (strokes[b].cx + 0.35 * strokes[b].cy));
  order.forEach((i, r) => { strokes[i].rank = r; });
  const DELTA = 0.55;
  let friezeSet = false;

  // Friisipolku (pisteet maan koordinaateissa, sama avaruus kuin root.position). Jokainen veto saa
  // peräkkäisen palan polusta, pituudella pituuden suhteessa; suunta valitaan lyhyemmän siirtymän mukaan.
  function setFrieze(pts) {
    const path = resamplePts(pts, 600);
    const total = path.reduce((a, p, i) => a + (i ? Math.hypot(p[0] - path[i - 1][0], p[1] - path[i - 1][1]) : 0), 0);
    const sumL = strokes.reduce((a, s) => a + s.L, 0);
    let acc = 0;
    const sc = root.scale.x || 1, ox = root.position.x, oy = root.position.y;
    const toLocal = (p) => [(p[0] - ox) / sc, (p[1] - oy) / sc];
    const cum = [0];
    for (let i = 1; i < path.length; i++) cum.push(cum[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]));
    const sub = (a, b) => {
      const out = [];
      for (let i = 0; i < NP; i++) {
        const s = a + (b - a) * (i / (NP - 1));
        let j = 0; while (j < path.length - 2 && cum[j + 1] < s) j++;
        const f = clamp((s - cum[j]) / (cum[j + 1] - cum[j] || 1e-9));
        out.push(toLocal([path[j][0] + (path[j + 1][0] - path[j][0]) * f, path[j][1] + (path[j + 1][1] - path[j][1]) * f]));
      }
      return out;
    };
    for (const i of order) {
      const s = strokes[i];
      const a0 = (acc / sumL) * total, b0 = ((acc + s.L) / sumL) * total, ov = 0.12 * (b0 - a0);
      const a = Math.max(0, a0 - ov), b = Math.min(total, b0 + ov);
      acc += s.L;
      let F = sub(a, b);
      const cost = (Q) => Q.reduce((c, p, j) => c + (p[0] - s.base[j][0]) ** 2 + (p[1] - s.base[j][1]) ** 2, 0);
      const Fr = [...F].reverse();
      if (cost(Fr) < cost(F)) F = Fr;
      s.F = F;
    }
    friezeSet = true;
  }

  // t: aika (tuuli, curl), u: 0 hahmo ... 1 friisi
  function morph(t, u) {
    const sc = 1;
    for (const s of strokes) {
      const sig = friezeSet ? clamp(u * (1 + DELTA) - DELTA * s.rank / (K - 1)) : 0;
      const e = easeIO(sig);
      const live = 1 - sig;            // tuuli vain hahmossa
      const A = 0.3 * Math.sin(Math.PI * sig);
      const pts = new Array(NP);
      for (let j = 0; j < NP; j++) {
        const b = s.base[j];
        let x = b[0], y = b[1];
        const fr = j / (NP - 1);
        // tuuli: viitta, viiri ja keihään kärki heiluvat (puhdas aikafunktio)
        if (s.name === 'keihas_viiri') {
          const w = smoothstep(0.58, 1.0, fr);
          y += w * (0.1 * Math.sin(t * 2.4 - fr * 9) + 0.04 * Math.sin(t * 5.1 - fr * 15)) * live;
        } else if (s.name.startsWith('viitta')) {
          const w = 1 - fr;
          x += -0.05 * w * Math.sin(t * 1.7 + fr * 4) * live; y += 0.03 * w * Math.sin(t * 2.3 + fr * 5) * live;
        }
        if (s.F) {
          const f = s.F[j];
          x += (f[0] - x) * e; y += (f[1] - y) * e;
          if (A > 1e-4) { const c = curl(x * 0.9 + t * 0.25, y * 0.9 - t * 0.18, 5 + s.rank); x += A * c[0]; y += A * c[1]; }
        }
        pts[j] = [x * sc, y * sc];
      }
      s.bs.set(pts, s.pr, 1, smoothstep(0.8, 1.0, u));
    }
  }
  return { root, strokes, setFrieze, morph, K };
}

// --- Roiske -----------------------------------------------------------------------------------
const SFS = /* glsl */ `
  uniform vec3 uColor;
  uniform float uSeed;
  uniform float uZ;
  uniform float uG;      // kasvu 0..1
  uniform float uDir;
  uniform float uAppear;
  uniform float uCell;
  uniform float uDim;
  varying vec2 vQ;
  ${HALFTONE}
  float hs(float i, float k) { return hash12(vec2(i * 1.731 + uSeed, k * 7.13 + uSeed * 0.37)); }
  void main() {
    if (uAppear < 0.999) {
      float da = halftone(1.0 - uAppear, 0.4, uCell * 1.4);
      if (da > 0.5) discard;
    }
    vec2 p = vQ;
    float g = uG;
    float sg = sqrt(g);
    // pääläiskä: metaball-kenttä
    float phi = 0.0;
    float M = 3.0 + floor(uZ);
    for (int j = 0; j < 9; j++) {
      float fj = float(j);
      if (fj >= M + 1.0) break;
      float ang = 6.2832 * hs(fj, 1.0);
      float rad = fj < 0.5 ? 0.0 : 0.3 + 0.45 * hs(fj, 2.0);
      vec2 cj = rad * vec2(cos(ang), sin(ang)) * sg;
      float rj = (fj < 0.5 ? 0.36 : 0.13 + 0.17 * hs(fj, 3.0)) * sg;
      vec2 d = p - cj;
      phi += rj * rj / (dot(d, d) + 1e-4);
    }
    float cov = phi > 1.0 ? 1.0 : 0.0;
    // sakarat: kapenevat vedot ja pisarat niiden päässä
    float S = 8.0 + 4.0 * uZ;
    for (int k = 0; k < 24; k++) {
      float fk = float(k);
      if (fk >= S) break;
      float th = 6.2832 * (fk + 0.35 * (hs(fk, 4.0) - 0.5)) / S;
      float h = 0.3 + 0.7 * hs(fk, 5.0);
      float len = 1.6 * h * h * (1.0 + 0.6 * cos(th - uDir)) * g;
      vec2 dir = vec2(cos(th), sin(th));
      float t = dot(p, dir);
      float perp = abs(dot(p, vec2(-dir.y, dir.x)));
      float tt = clamp(t / max(len, 1e-3), 0.0, 1.0);
      float w = 0.11 * pow(1.0 - tt, 0.8) * (0.4 + 0.6 * h);
      if (t > 0.2 && t < len && perp < w) cov = 1.0;
      // pisara kärjessä
      float rr = 0.055 / sqrt(max(len, 0.1));
      if (len > 0.25 && length(p - dir * (len + rr * 1.3)) < rr) cov = 1.0;
    }
    // satelliittipisarat: tiheys pienenee säteen mukaan, koko ~ 1/r^2
    for (int m = 0; m < 16; m++) {
      float fm = float(m);
      float th = 6.2832 * hs(fm, 8.0);
      float rho = 0.85 + 0.9 * hs(fm, 9.0) * hs(fm, 9.0);
      rho *= 0.5 + 0.5 * g;
      float rr = min(0.085, 0.05 * (1.2 / rho) * (1.2 / rho)) * (0.6 + 0.8 * hs(fm, 10.0));
      if (length(p - rho * vec2(cos(th), sin(th))) < rr * sg) cov = 1.0;
    }
    // reuna elää: sidottu laikkuun, ei ruutuun
    if (cov < 0.5) discard;
    vec3 c = uColor;
    if (uDim > 0.002) c = mix(c, vec3(0.12, 0.1, 0.095), halftone(clamp(uDim, 0.0, 1.0) * 0.92, 0.785, uCell));
    gl_FragColor = vec4(c, 1.0);
  }
`;
const SVS = 'varying vec2 vQ; void main() { vQ = position.xy; gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0); }';

export function splat(parent, n, o = {}) {
  const geo = new THREE.PlaneGeometry(3.4, 3.4);
  const list = Array.from({ length: n }, () => {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(o.color ?? C.red) }, uSeed: { value: 1 }, uZ: { value: 3 }, uG: { value: 1 },
        uDir: { value: Math.PI / 2 }, uAppear: { value: 1 }, uCell: U.uCell, uDim: U.uDim,
      },
      vertexShader: SVS, fragmentShader: SFS, side: THREE.DoubleSide, depthWrite: true,
    });
    const m = new THREE.Mesh(geo, mat);
    m.frustumCulled = false;
    m.visible = false;
    parent.add(m);
    return m;
  });
  // e: { t, x, y, s, z?, dir? } kuten purjeen roiskeet; näkyy iskun ruudulla (LEAD ennen)
  function set(t, events, LEAD) {
    list.forEach((m, i) => {
      const e = events[i];
      if (!e) { m.visible = false; return; }
      const a = t - (e.t - LEAD);
      m.visible = a >= 0 && a < (o.life ?? 1.0);
      if (!m.visible) return;
      const u = m.material.uniforms;
      u.uSeed.value = 1 + Math.floor(hash1(Math.round(e.t * 1000)) * 900);
      u.uZ.value = e.z ?? 3;
      u.uDir.value = e.dir ?? Math.PI / 2;
      u.uG.value = 1 - Math.exp(-a / 0.04);
      u.uAppear.value = 1 - smoothstep(0.55 * (o.life ?? 1), o.life ?? 1, a);
      m.position.set(e.x, e.y, e.z0 ?? 0.4);
      m.scale.set(e.s, e.s, 1);
    });
  }
  return { list, set };
}

// --- Lisaykset: elava muste (hahmo ei nay, vain veto) ------------------------------------------
// inkAge(age, k): painettu veto kuivuu. Leveys kapenee 3-6 s kuluessa, vareja rasteroituu, 12 s
// jalkeen jaljella ohut haalea jalki, ~17 s jalkeen ei mitaan. k venyttaa aikaa (k=1 friisi).
export function inkAge(age, k = 1) {
  const a = Math.max(0, age) / k;
  const w = 1 - 0.8 * smoothstep(1.0, 5.5, a);
  const ink = (1 - 0.72 * smoothstep(1.5, 11.0, a)) * (1 - smoothstep(13.0, 17.5, a));
  return { w, ink };
}
// Sankarin melodia soi: kayratorvi tai sello.
export function heroGate(S, t) {
  return smoothstep(0.18, 0.45, Math.max(S.energy.horns(t), S.fam.cello(t)));
}
// (Kameraan kiinnitetty veto hudStroke poistettu 31.10.2026: muste syntyy maailmassa kärjestä, tipTrail alla.)

// --- Kärjen jättämä muste ----------------------------------------------------------------------
// Keihään (tai kumppanin) kärki jättää maailmaan vedon: pisteet ovat kärjen paikat hetkillä t - tau
// (tau 0..WIN), siis puhdas ajan funktio ilman tilaa ruutujen välillä. Uusin pää on leveä ja
// täysvärinen, vanha kuivuu rasteriksi ja häipyy (inkAge); muste piirtyy vain, kun portti on auki
// (oletus heroGate: käyrätorvi tai sello soi). Tuuli venyttää vetoa viirin tapaan: piste ajelehtii
// syntyhetkensä tuulella ikänsä verran.
//   opts: color, N, win (s), wmin, wmax, hairW, seed, drift (yksikköä / s tuuliyksikköä kohti),
//         gate(tt) 0..1, press(tt) 0..1, zOff
//   set(t, tip(tt) -> {x, y, z} | null, wind(tt) -> {x, y}, from = aikaisin hetki, k = iän venytys)
//   palauttaa suurimman musteen; last = { len, tipX, tipY, ink, n } viimeisimmästä kutsusta (opasProbe).
export const TRAILS = [];
export function tipTrail(parent, S, o = {}) {
  const N = o.N ?? 240, WIN = o.win ?? 17.5, drift = o.drift ?? 0.22;
  const st = brushStroke(parent, N, o.color ?? C.red, {
    wmin: o.wmin ?? 0.05, wmax: o.wmax ?? 0.42, hairW: o.hairW ?? 0.045, fs: 1.8, bleed: o.bleed ?? 0.06,
    dryLen: 0.0001, dryAmt: 0, lambda: 0.006, tail: 0.01, seed: o.seed ?? 3, shade: o.shade ?? C.black,   // haalea muste tummina pisteinä, ei paperinvärisenä läikkänä
  });
  st.mesh.visible = false;
  const gate = o.gate ?? ((tt) => heroGate(S, tt));
  const press = o.press ?? ((tt) => clamp(0.35 + 0.75 * S.loud(tt)));
  const pts = [], pr = [], ik = [];
  const T = { mesh: st.mesh, mat: st.mat, parent, last: { len: 0, tipX: null, tipY: null, ink: 0, n: 0 } };
  function set(t, tip, wind, from = -Infinity, k = 1) {
    const a = Math.max(from, t - WIN * k);
    st.mesh.visible = false;
    T.last = { len: 0, tipX: null, tipY: null, ink: 0, n: 0 };
    if (t - a < 0.05) return 0;
    pts.length = 0; pr.length = 0; ik.length = 0;
    let mx = 0, prev = null, prevInk = 0, len = 0, z = null;
    for (let i = 0; i < N; i++) {
      const tt = a + ((t - a) * i) / (N - 1);
      const age = t - tt;
      const p = tip(tt);
      const ag = inkAge(age, k);
      let x, y, g = 0;
      if (p) {
        const w = wind ? wind(tt) : { x: 0, y: 0 };
        // tuuli venyttää vetoa vaakasuunnassa; pystysuunnassa vain vähän, jotta vedon korkeus pysyy sävelenä
        x = p.x + (w.x || 0) * age * drift;
        y = p.y + (w.y || 0) * age * drift * 0.15;
        g = clamp(gate(tt));
        if (z === null || i === N - 1) z = p.z ?? 0;
      } else if (prev) { x = prev[0]; y = prev[1]; } else { x = 0; y = 0; }
      pts.push([x, y]);
      const inkv = ag.ink * g;
      pr.push(inkv < 0.02 ? 0.0001 : clamp(press(tt)) * ag.w * smoothstep(0.02, 0.35, inkv));   // haalea muste on ohut, musteeton ei piirrä
      ik.push(inkv);
      if (inkv > 0.05 && prev && prevInk > 0.05) len += Math.hypot(x - prev[0], y - prev[1]);
      prevInk = inkv;
      prev = [x, y];
      mx = Math.max(mx, inkv);
    }
    T.last = { len, tipX: prev[0], tipY: prev[1], ink: ik[N - 1], n: ik.filter((v) => v > 0.05).length };
    if (mx < 0.03) return mx;
    st.mesh.position.z = (z ?? 0) + (o.zOff ?? 0.08);
    st.set(pts, pr, ik, 0.8);
    st.mesh.visible = true;
    return mx;
  }
  T.set = set;
  TRAILS.push(T);
  return T;
}
