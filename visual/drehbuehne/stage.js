// Näyttämö: LP-levy on pyörivä näyttämö (Drehbühne). Urat, etiketti, nouseva torni, luukut,
// valokeilat ja patarumpujen aaltorenkaat piirretään levyn varjostimessa. Ympärillä on
// paperilattia (piirustusruudukko) ja kaareva horisonttikangas, jonka taivas on kolmen laatan rasteria.
// Soittimet lavasteina: harppu (kielet väreilevät), patarummut, lautaset ja äänivarsi.

import * as THREE from 'three';
import { C, U, HALFTONE, inkMat, hullMat, faceted, withHull } from './ink.js';
import { part } from './rig.js';
import { clamp, hash1 } from '../util.js';

export const R_DISC = 14;
export const R_LABEL = 4.6;
export const FLOOR_Y = -0.3;
export const TIER_R = [4.6, 3.5, 2.45, 1.45];
export const TIER_H = 0.55;

const FLAT_VS = /* glsl */ `
  varying vec3 vW;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vW = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

// --- Levyn pinta -------------------------------------------------------------------------
const DISC_FS = /* glsl */ `
  uniform float uDim;
  uniform float uCell;
  uniform float uTime;
  uniform float uSpin;
  uniform vec4 uPools[6];
  uniform vec4 uRings[10];
  uniform vec3 uBlack, uBlue, uPaper;
  uniform float uSheen;
  uniform vec3 uCamPos;
  varying vec3 vW;
  varying vec2 vUv;
  ${HALFTONE}
  void main() {
    vec2 p = vW.xz;
    float r = length(p);
    vec3 c = uBlack;
    // Urat: hienot samankeskiset viivat, jotka häipyvät, kun ne ovat alle pikselin.
    float gr = r * 7.0;
    float g = abs(fract(gr) - 0.5);
    float w = fwidth(gr);
    float fade = 1.0 - smoothstep(0.25, 0.6, w);
    float line = (1.0 - smoothstep(0.08, 0.08 + w, g)) * fade;
    // Kiilto: kaksi vastakkaista kiilaa kameran suhteen (levyn tunnusmerkki), viivoina.
    vec2 cd = normalize(uCamPos.xz - p + 1e-4);
    float a = atan(p.x, p.y) - atan(cd.x, cd.y) + 0.9;
    float sheen = pow(abs(cos(a)), 26.0) * uSheen * smoothstep(${(R_LABEL + 0.2).toFixed(2)}, ${(R_LABEL + 1.4).toFixed(2)}, r);
    c = mix(c, uBlue, line * (0.55 + 0.45 * sheen));
    c = mix(c, uPaper, line * sheen * 0.8);
    // Taukouran nauhat (sisäänajoura ulkoreunalla, kiiltävämpi).
    float lead = smoothstep(13.55, 13.6, r) * (1.0 - smoothstep(13.92, 13.95, r));
    c = mix(c, uBlue, lead * 0.7);
    // Valokeilat: paperin rasteri mustalla vinyylillä.
    float pool = 0.0;
    for (int i = 0; i < 6; i++) {
      vec4 L = uPools[i];
      if (L.w <= 0.0) continue;
      float d = length(p - L.xy) / L.z;
      pool = max(pool, L.w * (1.0 - smoothstep(0.55, 1.0, d)));
    }
    c = mix(c, uPaper, halftone(pool * 0.75, 0.26, uCell));
    // Aaltorenkaat (patarummut, polkaisut, leimasimet).
    for (int i = 0; i < 10; i++) {
      vec4 R = uRings[i];
      if (R.w <= 0.0) continue;
      float age = uTime - R.z;
      if (age < 0.0 || age > 2.5) continue;
      float rad = age * 7.5;
      float d = abs(length(p - R.xy) - rad);
      float ring = (1.0 - smoothstep(0.06, 0.06 + fwidth(d) * 1.5 + 0.12 * age, d)) * R.w * exp(-age * 1.4);
      c = mix(c, uPaper, clamp(ring, 0.0, 1.0));
    }
    float dim = uDim;
    c = mix(c, uBlack, halftone(dim * 0.9, 0.785, uCell));
    gl_FragColor = vec4(c, 1.0);
  }
`;

// --- Paperilattia: piirustusruudukko ---------------------------------------------------------
const FLOOR_FS = /* glsl */ `
  uniform float uDim;
  uniform float uCell;
  uniform float uNight;
  uniform float uTime;
  uniform vec4 uRings[10];
  uniform vec3 uBlack, uBlue, uPaper;
  varying vec3 vW;
  ${HALFTONE}
  float gridLine(vec2 p, float s, float wpx) {
    vec2 q = abs(fract(p / s) - 0.5) * s;
    vec2 fw = fwidth(p) * wpx;
    vec2 l = 1.0 - smoothstep(fw * 0.5, fw * 1.2, q);
    return max(l.x, l.y);
  }
  void main() {
    vec2 p = vW.xz;
    vec3 c = uPaper;
    float r = length(p);
    float fadeFar = 1.0 - smoothstep(30.0, 60.0, r);
    c = mix(c, uBlue, gridLine(p, 1.0, 1.0) * 0.28 * fadeFar);
    c = mix(c, uBlue, gridLine(p, 5.0, 1.6) * 0.55 * fadeFar);
    // Levyn varjo paperilla.
    float sh = 1.0 - smoothstep(14.0, 15.6, length(p - vec2(0.9, -0.6)));
    c = mix(c, uBlue, halftone(sh * 0.55, 0.26, uCell));
    for (int i = 0; i < 10; i++) {
      vec4 R = uRings[i];
      if (R.w <= 0.0) continue;
      float age = uTime - R.z;
      if (age < 0.0 || age > 2.5) continue;
      float d = abs(length(p - R.xy) - age * 7.5);
      float ring = (1.0 - smoothstep(0.06, 0.2 + 0.12 * age, d)) * R.w * exp(-age * 1.4);
      c = mix(c, uBlue, clamp(ring, 0.0, 1.0));
    }
    c = mix(c, uBlue, halftone(uNight * 0.85, 0.26, uCell));
    c = mix(c, uBlack, halftone(uDim * 0.9, 0.785, uCell));
    gl_FragColor = vec4(c, 1.0);
  }
`;

// --- Horisonttikangas: kolme rasterilaattaa eri kulmissa ------------------------------------
const SKY_FS = /* glsl */ `
  uniform float uCell;
  uniform float uDim;
  uniform vec3 uBlack, uBlue, uPaper, uRed;
  uniform float uBlueAmt, uHor, uRedAmt, uBlackTop, uMurk, uMount, uSwamp;
  uniform vec4 uSun;   // kulma, korkeus (0..1), säde, näkyvyys
  uniform vec4 uMoon;
  uniform float uRays;
  uniform float uBands[6];
  uniform float uTime;
  varying vec3 vW;
  ${HALFTONE}
  float ridge(float x, float s) {
    float v = 0.0, a = 0.5, f = 1.0;
    for (int o = 0; o < 4; o++) { float n = vnoise(vec2(x * f + s, s)); v += a * (1.0 - abs(2.0 * n - 1.0)); a *= 0.5; f *= 2.2; }
    return v;
  }
  void main() {
    float ang = atan(vW.x, -vW.z);
    float h = (vW.y + 0.3) / 26.0;
    vec3 c = uPaper;
    // Taivas: sininen ylhäällä, punainen horisontissa (aamunkoi), musta sameus.
    float blue = uBlueAmt * smoothstep(uHor - 0.35, uHor + 0.45, h);
    float red = uRedAmt * (1.0 - smoothstep(0.0, 0.42, h));
    float black = uBlackTop * smoothstep(0.25, 1.0, h);
    float murk = uMurk * (0.55 + 0.45 * vnoise(vec2(ang * 4.0, h * 6.0) + uTime * 0.05));
    c = mix(c, uRed, halftone(red, 1.31, uCell * 1.25));
    c = mix(c, uBlue, halftone(blue, 0.26, uCell * 1.25));
    // Aurinko (sankarin nousu) ja sädekehä: säteiden pituus tulee taajuuskaistoista.
    vec2 q = vec2(ang * 30.0 / 26.0, h) - vec2(uSun.x * 30.0 / 26.0, uSun.y);
    float sd = length(q);
    float sa = atan(q.x, q.y);
    float ray = 0.0;
    if (uRays > 0.0) {
      float k = floor((sa + 3.14159) / 6.28318 * 48.0);
      float band = uBands[int(mod(k, 6.0))];
      float within = abs(fract((sa + 3.14159) / 6.28318 * 48.0) - 0.5);
      float len = uSun.z * (1.6 + 4.5 * band) * uRays;
      ray = (1.0 - smoothstep(0.18, 0.24, within)) * step(uSun.z * 1.15, sd) * (1.0 - smoothstep(len - 0.02, len, sd));
    }
    float sun = (1.0 - smoothstep(uSun.z - 0.003, uSun.z + 0.003, sd)) * uSun.w;
    c = mix(c, uRed, max(sun, ray));
    // Kuu (yö).
    vec2 mq = vec2(ang * 30.0 / 26.0, h) - vec2(uMoon.x * 30.0 / 26.0, uMoon.y);
    float moon = (1.0 - smoothstep(uMoon.z - 0.003, uMoon.z + 0.003, length(mq))) * uMoon.w;
    c = mix(c, uPaper, moon);
    // Vuoristo (kaukainen horisontti, Friedrich) ja suon matala ranta.
    float far = 0.03 + uMount * (0.05 + 0.16 * ridge(ang * 2.4, 3.0));
    float near = 0.02 + uMount * (0.02 + 0.09 * ridge(ang * 4.1, 9.0));
    c = mix(c, uBlue, halftone(step(h, far) * 0.6, 0.26, uCell));
    c = mix(c, uBlue, step(h, near));
    float reeds = uSwamp * step(h, 0.035 + 0.05 * pow(vnoise(vec2(ang * 60.0, 1.0)), 3.0) + 0.012 * vnoise(vec2(ang * 9.0, 4.0)));
    c = mix(c, uBlack, reeds);
    c = mix(c, uBlack, halftone(max(black, murk), 0.785, uCell * 1.25));
    c = mix(c, uBlack, halftone(uDim * 0.92, 0.785, uCell));
    gl_FragColor = vec4(c, 1.0);
  }
`;

// --- Harpun kieli: siirtymä varjostimessa ----------------------------------------------------
const STRING_VS = /* glsl */ `
  uniform float uAmp;
  uniform float uPhase;
  uniform float uIdx;
  varying vec3 vW;
  varying vec3 vN;
  void main() {
    vec3 p = position;
    float v = uv.y;
    p.x += uAmp * sin(3.14159 * v) * sin(uPhase * 9.0 - uIdx * 0.75) ;
    vec4 w = modelMatrix * vec4(p, 1.0);
    vW = w.xyz;
    vN = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

function labelTexture() {
  const S = 1024;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const g = cv.getContext('2d');
  const cx = S / 2;
  g.fillStyle = '#F5461A';
  g.fillRect(0, 0, S, S);
  g.strokeStyle = '#E8DCC6';
  g.lineWidth = 6;
  for (const rr of [0.47, 0.33]) { g.beginPath(); g.arc(cx, cx, S * rr, 0, Math.PI * 2); g.stroke(); }
  g.fillStyle = '#E8DCC6';
  g.font = '700 54px Georgia';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const text = ' EIN HELDENLEBEN  ·  OP. 40  ·  RICHARD STRAUSS  ·  A  · ';
  const chars = [...text];
  const total = chars.reduce((s, ch) => s + g.measureText(ch).width, 0);
  const rad = S * 0.4;
  let a = -Math.PI / 2;
  const span = (Math.PI * 2) * 0.98;
  for (const ch of chars) {
    const w = (g.measureText(ch).width / total) * span;
    a += w / 2;
    g.save();
    g.translate(cx + rad * Math.cos(a), cx + rad * Math.sin(a));
    g.rotate(a + Math.PI / 2);
    g.fillText(ch, 0, 0);
    g.restore();
    a += w / 2;
  }
  g.font = 'italic 44px Georgia';
  g.fillText('Wiener Philharmoniker', cx, cx + S * 0.2);
  g.fillText('Clemens Krauss', cx, cx + S * 0.25);
  g.font = '700 70px Georgia';
  g.fillText('33⅓', cx, cx - S * 0.22);
  const tex = new THREE.CanvasTexture(cv);
  tex.anisotropy = 8;
  return tex;
}

const TEX_FS = /* glsl */ `
  uniform sampler2D tMap;
  uniform float uDim;
  uniform float uCell;
  uniform vec3 uBlack;
  uniform vec4 uPools[6];
  varying vec2 vUv;
  varying vec3 vW;
  ${HALFTONE}
  void main() {
    vec3 c = texture2D(tMap, vUv).rgb;
    float pool = 0.0;
    for (int i = 0; i < 6; i++) {
      vec4 L = uPools[i];
      if (L.w <= 0.0) continue;
      float d = length(vW.xz - L.xy) / L.z;
      pool = max(pool, L.w * (1.0 - smoothstep(0.55, 1.0, d)));
    }
    float dim = clamp(uDim - 0.8 * pool, 0.0, 1.0);
    c = mix(c, uBlack, halftone(dim * 0.9, 0.785, uCell));
    gl_FragColor = vec4(c, 1.0);
  }
`;

export function createStage(scene) {
  const T = { uTime: { value: 0 } };
  const pools = Array.from({ length: 6 }, () => new THREE.Vector4());
  const rings = Array.from({ length: 10 }, () => new THREE.Vector4());
  const common = { uBlack: { value: C.black }, uBlue: { value: C.blue }, uPaper: { value: C.paper }, uRed: { value: C.red } };

  // Levy pyörii: kaikki levyyn kiinnitetty on tämän ryhmän lapsia.
  const disc = new THREE.Group();
  scene.add(disc);

  const discMat = new THREE.ShaderMaterial({
    uniforms: { ...common, uDim: U.uDim, uCell: U.uCell, uTime: T.uTime, uSpin: { value: 0 }, uPools: { value: pools },
      uRings: { value: rings }, uSheen: { value: 1 }, uCamPos: { value: new THREE.Vector3() } },
    vertexShader: FLAT_VS, fragmentShader: DISC_FS,
  });
  const top = new THREE.Mesh(new THREE.RingGeometry(R_LABEL, R_DISC, 160, 1), discMat);
  top.rotation.x = -Math.PI / 2;
  scene.add(top); // urat ovat pyörähdyssymmetrisiä, joten pinta ei pyöri
  const edge = new THREE.Mesh(new THREE.CylinderGeometry(R_DISC, R_DISC, -FLOOR_Y, 160, 1, true), inkMat(C.black, C.blue, { ambient: 0.6 }));
  edge.position.y = FLOOR_Y / 2;
  scene.add(edge);

  const floorMat = new THREE.ShaderMaterial({
    uniforms: { ...common, uDim: U.uDim, uCell: U.uCell, uNight: { value: 0 }, uTime: T.uTime, uRings: { value: rings } },
    vertexShader: FLAT_VS, fragmentShader: FLOOR_FS,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = FLOOR_Y;
  scene.add(floor);

  // Etiketti ja torni: neljä kerrosta, jotka nousevat sankarin pyrkiessä ylös.
  const labelMat = new THREE.ShaderMaterial({
    uniforms: { tMap: { value: labelTexture() }, uDim: U.uDim, uCell: U.uCell, uBlack: { value: C.black }, uPools: { value: pools } },
    vertexShader: FLAT_VS, fragmentShader: TEX_FS,
  });
  const tierTopMat = inkMat(C.red, C.black, { flat: 1 });
  const tierSideMat = inkMat(C.black, C.blue, { ambient: 0.5 });
  const tierHull = hullMat(C.paper, 1.6);
  const tiers = TIER_R.map((r, i) => {
    const g = new THREE.Group();
    const side = new THREE.Mesh(withHull(new THREE.CylinderGeometry(r, r, 1, 64, 1, true)), tierSideMat);
    side.position.y = -0.5;
    g.add(side);
    side.add(new THREE.Mesh(side.geometry, tierHull));
    const topM = new THREE.Mesh(new THREE.CircleGeometry(r, 64), i === 0 ? labelMat : tierTopMat);
    topM.rotation.x = -Math.PI / 2;
    topM.position.y = 0.003;
    g.add(topM);
    if (i > 0) {
      const ringLine = new THREE.Mesh(new THREE.RingGeometry(r - 0.12, r - 0.06, 64), inkMat(C.paper, C.paper, { flat: 1 }));
      ringLine.rotation.x = -Math.PI / 2;
      ringLine.position.y = 0.004;
      g.add(ringLine);
    }
    disc.add(g);
    return { g, side, r };
  });
  // Etiketin keskellä hissiluukku, josta sankari nousee.
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.95, 40), inkMat(C.black, C.black, { flat: 1 }));
  hole.rotation.x = -Math.PI / 2;
  hole.position.y = 0.006;
  scene.add(hole);
  const lift = new THREE.Mesh(faceted(new THREE.CylinderGeometry(0.9, 0.9, 0.12, 24)), inkMat(C.red, C.black));
  scene.add(lift);

  // Luukut: paperinvaalea aukko (valo alhaalta), josta tanssijat nousevat.
  const trapMat = inkMat(C.paper, C.paper, { flat: 1 });
  const traps = Array.from({ length: 24 }, () => {
    const m = new THREE.Mesh(new THREE.CircleGeometry(0.62, 28), trapMat);
    m.rotation.x = -Math.PI / 2;
    m.visible = false;
    scene.add(m);
    return m;
  });

  // Horisonttikangas.
  const skyU = {
    ...common, uCell: U.uCell, uDim: { value: 0 }, uTime: T.uTime,
    uBlueAmt: { value: 1 }, uHor: { value: 0.2 }, uRedAmt: { value: 0 }, uBlackTop: { value: 0.6 }, uMurk: { value: 0 },
    uMount: { value: 1 }, uSwamp: { value: 0 }, uSun: { value: new THREE.Vector4(0, -0.2, 0.09, 0) },
    uMoon: { value: new THREE.Vector4(0.45, 0.62, 0.05, 0) }, uRays: { value: 0 }, uBands: { value: [0, 0, 0, 0, 0, 0] },
  };
  const sky = new THREE.Mesh(
    new THREE.CylinderGeometry(30, 30, 90, 200, 1, true, 0, Math.PI * 2),
    new THREE.ShaderMaterial({ uniforms: skyU, vertexShader: FLAT_VS, fragmentShader: SKY_FS, side: THREE.BackSide }),
  );
  sky.position.y = 45 + FLOOR_Y;
  scene.add(sky);

  // --- Äänivarsi --------------------------------------------------------------------------
  const PIVOT = new THREE.Vector3(17.6, FLOOR_Y, -7.5);
  const armMat = inkMat(C.paper, C.blue);
  const armDark = inkMat(C.black, C.blue);
  const armHull = hullMat(C.black, 2.0);
  const tone = new THREE.Group();
  tone.position.copy(PIVOT);
  scene.add(tone);
  part(tone, faceted(new THREE.CylinderGeometry(1.5, 1.7, 0.6, 24)), armDark, hullMat(C.paper, 1.8), { p: [0, 0.3, 0] });
  part(tone, faceted(new THREE.CylinderGeometry(0.35, 0.45, 1.8, 16)), armMat, armHull, { p: [0, 1.4, 0] });
  const yaw = new THREE.Group();
  yaw.position.y = 2.25;
  tone.add(yaw);
  const pitch = new THREE.Group();
  yaw.add(pitch);
  const armLen = new THREE.Vector2(13.3 * Math.cos(0.17) - PIVOT.x, 13.3 * Math.sin(0.17) - PIVOT.z).length();
  const tube = part(pitch, faceted(new THREE.CylinderGeometry(0.14, 0.14, armLen, 12)), armMat, armHull, { p: [0, 0, armLen / 2], r: [Math.PI / 2, 0, 0] });
  part(pitch, faceted(new THREE.CylinderGeometry(0.55, 0.55, 0.8, 18)), armDark, hullMat(C.paper, 1.8), { p: [0, 0, -1.4], r: [Math.PI / 2, 0, 0] });
  const head = part(pitch, faceted(new THREE.BoxGeometry(0.7, 0.35, 1.1)), armMat, armHull, { p: [0, -0.15, armLen + 0.2] });
  part(head, faceted(new THREE.BoxGeometry(0.28, 0.6, 0.28)), armDark, hullMat(C.paper, 1.6), { p: [0, -0.4, 0.1] });
  void tube;

  // --- Harppu (vasemmalla edessä kuin proskeniumin pylväs) ---------------------------------
  const harp = new THREE.Group();
  harp.position.set(-16.2, FLOOR_Y, 5.5);
  harp.rotation.y = 0.55;
  scene.add(harp);
  const harpMat = inkMat(C.red, C.black);
  const harpHull = hullMat(C.black, 2.2);
  // Pylväs (vasen), kaikupohja (viisto, alhaalta pylvään juurelta oikealle ylös) ja kaula (S-kaari).
  part(harp, faceted(new THREE.CylinderGeometry(0.2, 0.3, 8.3, 8)), harpMat, harpHull, { p: [-2.1, 4.45, 0] });
  part(harp, faceted(new THREE.BoxGeometry(1.1, 0.7, 1.0)), harpMat, harpHull, { p: [-1.8, 0.35, 0] });
  const S0 = new THREE.Vector2(-1.7, 0.7), S1 = new THREE.Vector2(1.75, 7.3);
  const sbLen = S0.distanceTo(S1);
  part(harp, faceted(new THREE.CylinderGeometry(0.2, 0.5, sbLen, 6)), harpMat, harpHull,
    { p: [(S0.x + S1.x) / 2, (S0.y + S1.y) / 2, 0], r: [0, 0, -Math.atan2(S1.x - S0.x, S1.y - S0.y)] });
  const neckCurve = new THREE.CatmullRomCurve3([[-2.1, 8.55], [-1.2, 8.95], [-0.2, 8.35], [0.8, 7.75], [1.85, 7.85]].map(([x, y]) => new THREE.Vector3(x, y, 0)));
  part(harp, withHull(new THREE.TubeGeometry(neckCurve, 40, 0.19, 8, false)), harpMat, harpHull);
  const neckPts = neckCurve.getPoints(200);
  const neckY = (x) => neckPts.reduce((best, q) => (Math.abs(q.x - x) < Math.abs(best.x - x) ? q : best)).y;
  const strings = [];
  const NS = 22;
  for (let k = 0; k < NS; k++) {
    // pystysuorat kielet kaikupohjalta kaulaan: pitkät bassokielet pylvään puolella
    const x = -1.45 + (2.95 * k) / (NS - 1);
    const by = S0.y + ((x - S0.x) / (S1.x - S0.x)) * (S1.y - S0.y) + 0.12;
    const ty = neckY(x) - 0.14;
    const len = Math.max(0.3, ty - by);
    const mat = new THREE.ShaderMaterial({
      uniforms: { uAmp: { value: 0 }, uPhase: { value: 0 }, uIdx: { value: k }, uColor: { value: C.black }, uShade: { value: C.black },
        uLight: U.uLight, uCell: U.uCell, uDim: U.uDim, uAmbient: { value: 1 }, uFlat: { value: 1 }, uAng: { value: 0.785 }, uRaster: { value: 0 }, uSelfDim: { value: 0 } },
      vertexShader: STRING_VS,
      fragmentShader: inkMat(C.black).fragmentShader,
    });
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, len, 4, 16, true), mat);
    m.position.set(x, by + len / 2, 0);
    harp.add(m);
    strings.push(mat);
  }

  // --- Patarummut (vasemmalla takana, levyn ulkopuolella) ----------------------------------
  const drumMat = inkMat(C.red, C.black);
  const drumHead = inkMat(C.paper, C.blue);
  const drumHull = hullMat(C.black, 2.2);
  const drums = [[-15.6, -8.2, 1.45], [-12.4, -12.2, 1.25]].map(([x, z, r]) => {
    const g = new THREE.Group();
    g.position.set(x, FLOOR_Y, z);
    scene.add(g);
    const bowl = new THREE.SphereGeometry(r, 18, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    part(g, faceted(bowl), drumMat, drumHull, { p: [0, 1.6, 0] });
    const headM = part(g, faceted(new THREE.CylinderGeometry(r * 1.02, r * 1.02, 0.08, 28)), drumHead, drumHull, { p: [0, 1.62, 0] });
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2;
      part(g, faceted(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 5)), drumMat, drumHull, { p: [Math.cos(a) * r * 0.6, 0.45, Math.sin(a) * r * 0.6] });
    }
    // Kapula: varsi ja pallopää, nivel rummun takana.
    const mallet = new THREE.Group();
    mallet.position.set(-r * 0.2, 1.9, -r - 0.4);
    g.add(mallet);
    part(mallet, faceted(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 5)), armDark, armHull, { p: [0, 0, 0.8], r: [Math.PI / 2, 0, 0] });
    part(mallet, faceted(new THREE.SphereGeometry(0.17, 8, 6)), drumHead, armHull, { p: [0, 0, 1.6] });
    return { g, head: headM, mallet, r, x, z };
  });

  // --- Lautaset: jättikiekot ilmassa takana oikealla, ja puupiirrostähti ---------------------
  const cym = new THREE.Group();
  cym.position.set(9, 9.5, -19);
  scene.add(cym);
  const cymMat = inkMat(C.paper, C.blue);
  const cymL = part(cym, faceted(new THREE.CylinderGeometry(2.0, 2.0, 0.08, 32)), cymMat, hullMat(C.black, 2.2), { r: [0, 0, Math.PI / 2] });
  const cymR = part(cym, faceted(new THREE.CylinderGeometry(2.0, 2.0, 0.08, 32)), cymMat, hullMat(C.black, 2.2), { r: [0, 0, Math.PI / 2] });
  cym.rotation.y = 0.75;
  const starShape = new THREE.Shape();
  for (let k = 0; k < 32; k++) {
    const a = (k / 32) * Math.PI * 2;
    const rr = k % 2 ? 1.6 : 6.5 + 2.5 * hash1(k * 17);
    const fn = k ? 'lineTo' : 'moveTo';
    starShape[fn](Math.sin(a) * rr, Math.cos(a) * rr);
  }
  const star = new THREE.Mesh(new THREE.ShapeGeometry(starShape), inkMat(C.black, C.black, { flat: 1 }));
  star.position.set(9, 9.5, -19.6);
  star.visible = false;
  scene.add(star);

  // --- Lavasteet levyllä: vuoret (näytös I) ja kuolleet puut (näytös II) ----------------------
  const flatMat = inkMat(C.blue, C.black, { side: THREE.DoubleSide, flat: 0.4 });
  const flatPaper = inkMat(C.paper, C.blue, { side: THREE.DoubleSide, flat: 0.4 });
  const treeMat = inkMat(C.black, C.black, { side: THREE.DoubleSide, flat: 1 });
  const mountains = [];
  for (let k = 0; k < 14; k++) {
    const a = (k / 14) * Math.PI * 2 + hash1(k) * 0.2;
    const s = new THREE.Shape();
    const wdt = 3.4 + 1.8 * hash1(k + 40);
    const ht = 0.8 + 1.0 * hash1(k + 80);
    s.moveTo(-wdt / 2, 0);
    const steps = 7;
    for (let j = 1; j < steps; j++) {
      const u = j / steps;
      const env = Math.sin(Math.PI * u);
      s.lineTo(-wdt / 2 + wdt * u, ht * env * (0.6 + 0.5 * hash1(k * 31 + j)));
    }
    s.lineTo(wdt / 2, 0);
    const g = new THREE.Group();
    g.position.set(Math.sin(a) * 12.3, 0, Math.cos(a) * 12.3);
    g.rotation.y = a;
    const m = new THREE.Mesh(new THREE.ShapeGeometry(s), k % 3 ? flatMat : flatPaper);
    g.add(m);
    disc.add(g);
    mountains.push(g);
  }
  const trees = [];
  function treeShape(seed) {
    const s = new THREE.Shape();
    const pts = [];
    const branch = (x, y, ang, len, w, depth) => {
      const x2 = x + Math.sin(ang) * len;
      const y2 = y + Math.cos(ang) * len;
      pts.push([x, y, x2, y2, w]);
      if (depth > 0) {
        branch(x2, y2, ang - 0.5 - 0.3 * hash1(seed + depth * 7 + x * 3), len * 0.62, w * 0.6, depth - 1);
        branch(x2, y2, ang + 0.45 + 0.3 * hash1(seed + depth * 11 + y * 5), len * 0.58, w * 0.6, depth - 1);
      }
    };
    branch(0, 0, (hash1(seed) - 0.5) * 0.3, 1.6 + hash1(seed + 1), 0.18, 3);
    return pts.map(([x, y, x2, y2, w]) => {
      const ang = Math.atan2(x2 - x, y2 - y);
      const nx = Math.cos(ang) * w, ny = -Math.sin(ang) * w;
      const sh = new THREE.Shape();
      sh.moveTo(x - nx, y - ny); sh.lineTo(x2 - nx * 0.4, y2 - ny * 0.4); sh.lineTo(x2 + nx * 0.4, y2 + ny * 0.4); sh.lineTo(x + nx, y + ny);
      return sh;
    });
  }
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2 + hash1(k + 300) * 0.25;
    const g = new THREE.Group();
    const rr = 11.4 + 1.8 * hash1(k + 200);
    g.position.set(Math.sin(a) * rr, 0, Math.cos(a) * rr);
    g.rotation.y = a + 0.4 * (hash1(k + 500) - 0.5);
    const m = new THREE.Mesh(new THREE.ShapeGeometry(treeShape(k * 13 + 1)), treeMat);
    m.scale.setScalar(1.0 + 0.6 * hash1(k + 600));
    g.add(m);
    g.visible = false;
    disc.add(g);
    trees.push(g);
  }

  // --- Ajonaikainen päivitys ----------------------------------------------------------------
  const arm = { stylus: new THREE.Vector3() };
  function setTonearm(radius, liftAmt) {
    // Neula säteellä radius: ympyröiden leikkaus (varren pituus vakio).
    const L = armLen;
    const px = PIVOT.x, pz = PIVOT.z;
    const d = Math.hypot(px, pz);
    const aP = Math.atan2(pz, px);
    const cosA = clamp((radius * radius + d * d - L * L) / (2 * radius * d), -1, 1);
    const ang = aP + Math.acos(cosA);
    const sx = radius * Math.cos(ang), sz = radius * Math.sin(ang);
    arm.stylus.set(sx, 0, sz);
    yaw.rotation.y = Math.atan2(sx - px, sz - pz);
    const drop = FLOOR_Y + 2.25 - 0.85; // neulan kärki levyn pintaan
    pitch.rotation.x = Math.atan2(drop, L + 0.2) - liftAmt;
  }

  function groundAt(x, z) {
    const r = Math.hypot(x, z);
    if (r > R_DISC) return FLOOR_Y;
    let h = 0;
    for (let i = 0; i < 4; i++) if (r <= TIER_R[i]) h += tiers[i].h ?? 0;
    return h;
  }

  return {
    disc, tiers, traps, pools, rings, sky: skyU, floor: floorMat.uniforms, discU: discMat.uniforms, T,
    harpStrings: strings, drums, cym: { g: cym, l: cymL, r: cymR, star }, mountains, trees, lift, hole,
    setTonearm, arm, groundAt, labelMat,
    setTiers(heights) {
      let acc = 0;
      tiers.forEach((tr, i) => {
        tr.h = heights[i];
        acc += heights[i];
        tr.g.position.y = acc;
        tr.side.scale.y = Math.max(0.001, acc);
        tr.side.position.y = -acc / 2;
        tr.g.visible = i === 0 || heights[i] > 0.002;
      });
    },
  };
}

