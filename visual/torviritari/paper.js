// Paperileikkeiden työkalupakki (2D, multiplane). Kaikki on tasoja z-syvyyksillä; kamera liikkuu
// niiden läpi. Muodot: vuoret, pilvet, puut, Straussin teosten tunnukset, viivat ja ääriviivat.
// Liike: tuulen ja sateen viirut, pääskyparvi, viirit (aaltoileva varjostin), vesi, taivas.

import * as THREE from 'three';
import { C, U, HALFTONE, ink } from './ink.js';
import { hash1, vnoise1, clamp, smoothstep, mix } from '../util.js';

export const TAU = Math.PI * 2;

// --- Muodot -----------------------------------------------------------------------------------
export function poly(pts) {
  const s = new THREE.Shape();
  pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  s.closePath();
  return s;
}
export function circle(r, n = 40, cx = 0, cy = 0, sy = 1) {
  return poly(Array.from({ length: n }, (_, i) => [cx + r * Math.cos((i / n) * TAU), cy + r * sy * Math.sin((i / n) * TAU)]));
}
export function rect(w, h, ax = 0.5, ay = 0.5) {
  return poly([[-w * ax, -h * ay], [w * (1 - ax), -h * ay], [w * (1 - ax), h * (1 - ay)], [-w * ax, h * (1 - ay)]]);
}
// Pyöristetty raaja: alkaa origosta ja kulkee alaspäin (nivel ylhäällä).
export function limb(len, w0, w1) {
  const pts = [];
  const n = 8;
  for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI; pts.push([(Math.cos(a) * w0) / 2, (Math.sin(a) * w0) / 2]); }
  for (let i = 0; i <= n; i++) { const a = Math.PI + (i / n) * Math.PI; pts.push([(Math.cos(a) * w1) / 2, -len + (Math.sin(a) * w1) / 2]); }
  return poly(pts);
}

export function ridgeY(x, seed, rough = 1) {
  let v = 0, a = 1, f = 1, s = 0;
  for (let o = 0; o < 4; o++) {
    const n = vnoise1(x * f, seed + o * 13);
    v += a * Math.pow(1 - Math.abs(2 * n - 1), 1.5 + 0.5 * rough);
    s += a;
    a *= 0.5;
    f *= 2.2;
  }
  return v / s;
}
// Vuorijono: siluetti x0..x1, korkeus h, pohja syvällä.
export function ridge(x0, x1, h, seed, opts = {}) {
  const n = opts.n ?? 90;
  const lam = opts.lambda ?? (x1 - x0) / 5;
  const base = opts.base ?? -60;
  const pts = [[x0, base]];
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    const y = (opts.offset ?? 0) + h * ridgeY(x / lam, seed, opts.rough ?? 1) * (opts.env ? opts.env(x) : 1);
    pts.push([x, y]);
  }
  pts.push([x1, base]);
  return poly(pts);
}
// Siluetti nauhana: jokaisesta yläreunan pisteestä pystysuora kaistale pohjaan (varma kolmiointi).
export function skylineGeo(pts, base) {
  const pos = [], idx = [];
  pts.forEach(([x, y], i) => {
    pos.push(x, y, 0, x, base, 0);
    if (i < pts.length - 1) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(new Array((pos.length / 3) * 2).fill(0), 2));
  g.setIndex(idx);
  return g;
}
export function ridgePts(x0, x1, h, seed, opts = {}) {
  const n = opts.n ?? 120;
  const lam = opts.lambda ?? (x1 - x0) / 5;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    pts.push([x, (opts.offset ?? 0) + h * ridgeY(x / lam, seed, opts.rough ?? 1) * (opts.env ? opts.env(x) : 1)]);
  }
  return pts;
}
export const ridgeGeo = (x0, x1, h, seed, opts = {}) => skylineGeo(ridgePts(x0, x1, h, seed, opts), opts.base ?? -300);

// Pilvi: ylöspäin pyöreiden kumpujen verho, tasainen pohja.
export function cloud(w, h, seed, flatBottom = true) {
  const bumps = Array.from({ length: 6 }, (_, i) => ({ x: (-0.5 + (i + 0.5) / 6) * w * 0.9, r: (0.18 + 0.2 * hash1(seed * 31 + i)) * w * (i === 2 || i === 3 ? 1.25 : 1) }));
  const pts = [];
  const n = 70;
  for (let i = 0; i <= n; i++) {
    const x = -w / 2 + (w * i) / n;
    let y = 0;
    for (const b of bumps) { const d = x - b.x; if (Math.abs(d) < b.r) y = Math.max(y, Math.sqrt(b.r * b.r - d * d)); }
    pts.push([x, (y * h) / (w * 0.35)]);
  }
  if (!flatBottom) for (let i = n; i >= 0; i--) pts.push([-w / 2 + (w * i) / n, -0.15 * h * Math.sin((i / n) * Math.PI)]);
  return poly(pts);
}
// Don Juan: liekki (kolme kieltä).
export function flame(w, h) {
  const pts = [];
  const n = 90;
  const g = (u, c, s) => Math.exp(-(((u - c) / s) ** 2));
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const top = 0.3 + 0.7 * Math.max(0.62 * g(u, 0.2, 0.09), 1.0 * g(u, 0.5, 0.1), 0.72 * g(u, 0.8, 0.09), 0.25 * Math.sin(Math.PI * u));
    pts.push([w * (u - 0.5) + 0.1 * w * Math.sin(Math.PI * 2 * u) * top, h * top]);
  }
  for (let i = n; i >= 0; i--) { const u = i / n; pts.push([w * (u - 0.5) * 0.92, -0.22 * h * Math.sin(Math.PI * u)]); }
  return poly(pts);
}
// Till Eulenspiegel: narrinlakki (kolme sakaraa).
export function jesterCap(w, h) {
  return poly([[-w * 0.5, 0], [-w * 0.55, h * 0.35], [-w * 0.95, h * 0.85], [-w * 0.3, h * 0.55], [0, h * 1.05], [w * 0.3, h * 0.55], [w * 0.95, h * 0.85], [w * 0.55, h * 0.35], [w * 0.5, 0]]);
}
// Macbeth: tumma sahalaitainen kruunu (myrskyvuoren huippu).
export function crownPeak(w, h, seed) {
  const pts = [[-w / 2, -h * 3]];
  const k = 5;
  for (let i = 0; i <= k * 2; i++) {
    const u = i / (k * 2);
    const tip = i % 2 === 0;
    const env = 0.55 + 0.45 * Math.sin(Math.PI * u);
    pts.push([-w / 2 + w * u, h * env * (tip ? 1 : 0.62 + 0.1 * hash1(seed + i))]);
  }
  pts.push([w / 2, -h * 3]);
  return poly(pts);
}
// Earlen tyylitelty puu: kapea kartio porrastettuine reunoineen.
export function earleTree(h, w, seed) {
  const pts = [[-0.04 * w, 0]];
  const steps = 7;
  for (let i = 0; i < steps; i++) {
    const y0 = h * (0.12 + (0.8 * i) / steps);
    const ww = w * 0.5 * (1 - i / steps) * (0.85 + 0.3 * hash1(seed + i));
    pts.push([-ww, y0], [-ww * 0.45, y0 + h * 0.06]);
  }
  pts.push([0, h]);
  for (let i = steps - 1; i >= 0; i--) {
    const y0 = h * (0.12 + (0.8 * i) / steps);
    const ww = w * 0.5 * (1 - i / steps) * (0.85 + 0.3 * hash1(seed + 50 + i));
    pts.push([ww * 0.45, y0 + h * 0.06], [ww, y0]);
  }
  pts.push([0.04 * w, 0]);
  return poly(pts);
}
// Kuollut puu: oksat nelikulmioina (ShapeGeometry ottaa listan).
export function deadTree(seed, scale = 1) {
  const out = [];
  const branch = (x, y, ang, len, w, depth) => {
    const x2 = x + Math.sin(ang) * len, y2 = y + Math.cos(ang) * len;
    const nx = Math.cos(ang) * w, ny = -Math.sin(ang) * w;
    out.push(poly([[x - nx, y - ny], [x2 - nx * 0.45, y2 - ny * 0.45], [x2 + nx * 0.45, y2 + ny * 0.45], [x + nx, y + ny]]));
    if (depth > 0) {
      branch(x2, y2, ang - 0.45 - 0.35 * hash1(seed + depth * 7 + out.length), len * 0.66, w * 0.6, depth - 1);
      branch(x2, y2, ang + 0.4 + 0.35 * hash1(seed + depth * 11 + out.length), len * 0.6, w * 0.6, depth - 1);
    }
  };
  branch(0, 0, (hash1(seed) - 0.5) * 0.3, 1.8 * scale, 0.2 * scale, 4);
  return out;
}

// Viiva (nauha) pisteiden läpi: ääriviivat, halkeamat, salama, kielet.
export function strokeGeo(pts, w, closed = false) {
  const P = closed ? [...pts, pts[0]] : pts;
  const pos = [];
  const idx = [];
  for (let i = 0; i < P.length; i++) {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    dx /= l; dy /= l;
    const ww = typeof w === 'function' ? w(i / (P.length - 1)) : w;
    pos.push(P[i][0] - dy * ww / 2, P[i][1] + dx * ww / 2, 0, P[i][0] + dy * ww / 2, P[i][1] - dx * ww / 2, 0);
    if (i < P.length - 1) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(new Array((pos.length / 3) * 2).fill(0), 2));
  g.setIndex(idx);
  return g;
}
export function outline(shape, w) {
  return strokeGeo(shape.getPoints(64).map((p) => [p.x, p.y]), w, true);
}

// Taso: muoto (tai geometria) materiaalilla paikalleen.
export function flat(parent, src, mat, o = {}) {
  const g = src.isBufferGeometry ? src : new THREE.ShapeGeometry(src, 8);
  const m = new THREE.Mesh(g, mat);
  m.position.set(o.x ?? 0, o.y ?? 0, o.z ?? 0);
  if (o.s !== undefined) { const s = Array.isArray(o.s) ? o.s : [o.s, o.s]; m.scale.set(s[0], s[1], 1); }
  if (o.r) m.rotation.z = o.r;
  m.frustumCulled = false;
  parent.add(m);
  return m;
}
export const group = (parent, o = {}) => {
  const g = new THREE.Group();
  g.position.set(o.x ?? 0, o.y ?? 0, o.z ?? 0);
  parent.add(g);
  return g;
};

// --- Taivas: kaukainen taso, kolme rasterilaattaa, aurinko, sädekehä, kuu, sameus, salama ------
const SKY_FS = /* glsl */ `
  uniform float uCell;
  uniform vec3 uBlack, uBlue, uPaper, uRed;
  uniform float uHorY, uBlueAmt, uBlueH, uRedAmt, uBlackTop, uMurk, uFlash, uTime;
  uniform vec4 uSun;   // x, y, säde, näkyvyys
  uniform vec4 uMoon;
  uniform float uRays;
  uniform float uBands[6];
  uniform vec4 uCloudGap; // repeämä: x, y, leveys, määrä
  varying vec3 vW;
  ${HALFTONE}
  void main() {
    float h = (vW.y - uHorY) / 320.0;
    vec3 c = uPaper;
    float blue = uBlueAmt * smoothstep(uBlueH - 0.3, uBlueH + 0.5, h);
    float red = uRedAmt * (1.0 - smoothstep(0.0, 0.35, h));
    float black = uBlackTop * smoothstep(0.1, 0.9, h);
    float murk = uMurk * (0.5 + 0.5 * vnoise(vW.xy * 0.012 + vec2(uTime * 0.03, 0.0)));
    c = mix(c, uRed, halftone(red, 1.31, uCell * 1.25));
    c = mix(c, uBlue, halftone(blue, 0.26, uCell * 1.25));
    vec2 q = vW.xy - uSun.xy;
    float sd = length(q);
    float ray = 0.0;
    if (uRays > 0.0) {
      float sa = atan(q.x, q.y);
      float k = floor((sa + 3.14159) / 6.28318 * 48.0);
      float band = uBands[int(mod(k, 6.0))];
      float within = abs(fract((sa + 3.14159) / 6.28318 * 48.0) - 0.5);
      float len = uSun.z * (1.6 + 5.0 * band) * uRays;
      ray = (1.0 - smoothstep(0.17, 0.23, within)) * step(uSun.z * 1.12, sd) * (1.0 - smoothstep(len - 1.0, len, sd));
    }
    float sun = (1.0 - smoothstep(uSun.z - 0.6, uSun.z + 0.6, sd)) * uSun.w;
    c = mix(c, uRed, max(sun, ray * uSun.w));
    float moon = (1.0 - smoothstep(uMoon.z - 0.6, uMoon.z + 0.6, length(vW.xy - uMoon.xy))) * uMoon.w;
    float gap = uCloudGap.w * (1.0 - smoothstep(uCloudGap.z * 0.6, uCloudGap.z, length((vW.xy - uCloudGap.xy) * vec2(0.6, 1.0))));
    float dark = max(black, murk) * (1.0 - gap);
    c = mix(c, uBlack, halftone(dark, 0.785, uCell * 1.25));
    c = mix(c, uPaper, moon);
    c = mix(c, uPaper, uFlash);
    gl_FragColor = vec4(c, 1.0);
  }
`;
export function sky(parent, z = -480) {
  const u = {
    uCell: U.uCell, uBlack: { value: C.black }, uBlue: { value: C.blue }, uPaper: { value: C.paper }, uRed: { value: C.red },
    uHorY: { value: 0 }, uBlueAmt: { value: 1 }, uBlueH: { value: 0.3 }, uRedAmt: { value: 0 }, uBlackTop: { value: 0 },
    uMurk: { value: 0 }, uFlash: { value: 0 }, uTime: { value: 0 },
    uSun: { value: new THREE.Vector4(0, -50, 22, 0) }, uMoon: { value: new THREE.Vector4(0, 120, 16, 0) },
    uRays: { value: 0 }, uBands: { value: [0, 0, 0, 0, 0, 0] }, uCloudGap: { value: new THREE.Vector4(0, 0, 1, 0) },
  };
  const m = new THREE.Mesh(new THREE.PlaneGeometry(6000, 3000), new THREE.ShaderMaterial({
    uniforms: u,
    vertexShader: 'varying vec3 vW; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: SKY_FS, depthWrite: false,
  }));
  m.position.z = z;
  m.frustumCulled = false;
  m.renderOrder = -10;
  parent.add(m);
  return { mesh: m, u };
}

// --- Vesi: kaista, välkkeet ja väreilyrenkaat -----------------------------------------------
const WATER_FS = /* glsl */ `
  uniform float uCell, uTime, uGlint, uDark, uDim;
  uniform vec3 uBase, uDeep, uPaper;
  uniform vec4 uRings[16];
  uniform float uTop;
  varying vec3 vW;
  ${HALFTONE}
  void main() {
    vec3 c = uBase;
    float depth = clamp((uTop - vW.y) / 6.0, 0.0, 1.0);
    c = mix(c, uDeep, halftone(depth * 0.8 + uDark, 0.26, uCell));
    float row = floor(vW.y * 6.0);
    float dash = step(0.72, vnoise(vec2(vW.x * 0.8 + uTime * (0.4 + 0.3 * hash12(vec2(row, 1.0))), row)));
    float line = 1.0 - smoothstep(0.02, 0.05, abs(fract(vW.y * 6.0) - 0.5));
    c = mix(c, uPaper, dash * line * uGlint * (1.0 - 0.6 * depth));
    for (int i = 0; i < 16; i++) {
      vec4 R = uRings[i];
      if (R.w <= 0.0) continue;
      float age = uTime - R.z;
      if (age < 0.0 || age > 3.0) continue;
      vec2 d = (vW.xy - R.xy) * vec2(1.0, 4.0);
      float rr = abs(length(d) - age * 1.6 * R.w);
      float ring = (1.0 - smoothstep(0.04, 0.12, rr)) * exp(-age * 1.1);
      c = mix(c, uPaper, ring);
    }
    c = mix(c, vec3(0.12, 0.1, 0.095), halftone(uDim * 0.92, 0.785, uCell));
    gl_FragColor = vec4(c, 1.0);
  }
`;
export function water(parent, w, h, o = {}) {
  const rings = Array.from({ length: 16 }, () => new THREE.Vector4(0, 0, -99, 0));
  const u = {
    uCell: U.uCell, uDim: U.uDim, uTime: { value: 0 }, uGlint: { value: o.glint ?? 0.8 }, uDark: { value: 0 },
    uBase: { value: new THREE.Color(o.base ?? C.blue) }, uDeep: { value: new THREE.Color(o.deep ?? C.black) }, uPaper: { value: C.paper },
    uRings: { value: rings }, uTop: { value: (o.y ?? 0) + h / 2 },
  };
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.ShaderMaterial({ uniforms: u, vertexShader: 'varying vec3 vW; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }', fragmentShader: WATER_FS, side: THREE.DoubleSide }));
  m.position.set(o.x ?? 0, o.y ?? 0, o.z ?? 0);
  m.frustumCulled = false;
  parent.add(m);
  return { mesh: m, u, rings };
}

// --- Viirut: tuuli, sade, vesiputous (instanssit) -------------------------------------------
export function streaks(parent, n, mat, z = 0) {
  const geo = new THREE.PlaneGeometry(1, 1);
  geo.translate(0.5, 0, 0);
  const im = new THREE.InstancedMesh(geo, mat, n);
  im.position.z = z;
  im.frustumCulled = false;
  parent.add(im);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const zA = new THREE.Vector3(0, 0, 1);
  const p = new THREE.Vector3();
  const s = new THREE.Vector3();
  return {
    im,
    // f(i) -> {x, y, ang, len, w} tai null (piilossa)
    set(f) {
      for (let i = 0; i < n; i++) {
        const r = f(i);
        if (!r) { m4.makeScale(0, 0, 0); im.setMatrixAt(i, m4); continue; }
        q.setFromAxisAngle(zA, r.ang);
        p.set(r.x, r.y, r.z ?? 0);
        s.set(r.len, r.w, 1);
        m4.compose(p, q, s);
        im.setMatrixAt(i, m4);
      }
      im.instanceMatrix.needsUpdate = true;
    },
  };
}

// Pääsky: haarapyrstö ja siivet.
export function swallowShape() {
  return poly([[0.35, 0], [0.1, 0.06], [-0.05, 0.5], [-0.12, 0.08], [-0.42, 0.12], [-0.25, 0], [-0.42, -0.12], [-0.12, -0.08], [-0.05, -0.1], [0.1, -0.06]]);
}

// --- Viiri (trumpetit ja pasuunat): aaltoileva lippu varjostimessa ---------------------------
const WAVE_VS = /* glsl */ `
  uniform float uTime, uAmp, uK;
  varying vec3 vW;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    float u = uv.x;
    p.y += sin(u * uK - uTime * 7.0) * uAmp * u;
    p.x -= (1.0 - cos(sin(u * uK - uTime * 7.0) * 0.4)) * u * 0.3;
    vec4 lp = vec4(p, 1.0);
    #ifdef USE_INSTANCING
    lp = instanceMatrix * lp;
    #endif
    vec4 w = modelMatrix * lp;
    vW = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;
export function waveMat(color, opts = {}) {
  const m = ink(color, opts);
  m.uniforms.uTime = { value: 0 };
  m.uniforms.uAmp = { value: opts.amp ?? 0.15 };
  m.uniforms.uK = { value: opts.k ?? 6 };
  m.vertexShader = WAVE_VS;
  return m;
}
// Pitkä kolmioviiri: x 0..len, kapenee kärkeen.
export function pennantGeo(len, w, stripes = false) {
  const g = new THREE.PlaneGeometry(len, w, 24, 2);
  const pos = g.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + len / 2;
    const taper = 1 - 0.85 * (x / len);
    pos.setXY(i, x, pos.getY(i) * taper - (stripes ? 0 : 0));
  }
  g.computeBoundingSphere();
  return g;
}

// --- Salama -------------------------------------------------------------------------------------
export function boltPoints(seed, x0, y0, x1, y1) {
  const pts = [[x0, y0]];
  const n = 12;
  for (let i = 1; i < n; i++) {
    const u = i / n;
    const j = (hash1(seed * 17 + i) - 0.5) * 3.5 * Math.sin(Math.PI * u);
    pts.push([mix(x0, x1, u) + j, mix(y0, y1, u)]);
  }
  pts.push([x1, y1]);
  return pts;
}

export { clamp, smoothstep, mix, hash1, vnoise1, ink, C, U, HALFTONE };
