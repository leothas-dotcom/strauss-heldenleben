// J, taistelukenttä: kuvakäsikirjoituksen kohtaukset 61–65 (wal_kulissi1 ... wal_puolenvaihto).
//  61 wal_kulissi1: kolme kulissitrumpettia ovat kolme viiriä horisontissa (musta, valkoinen, punainen),
//     samassa tuulessa. Ritari seisoo hevosensa vieressä ja kääntyy katsomaan.
//  62 wal_vastaus: ritari nousee ratsaille, viiri vastaa. Kenttä painuu esiin puupiirroksena (Dürer).
//     Hiljaisuus (S.loud kynnyksen alla) palautetaan arvona paper: friisiin jää tyhjää paperia.
//  63 wal_kulissi2: viirit lähempänä, kumppanin paikka varattu (valkoinen viiva vain jos viulut soivat).
//  64 wal_taistelu: kenttä mustana ja tulenpunaisena. Patarummun lyönnit pöllähdyttävät viivoitusta
//     (S.strokes), haboku-läiskät kasvavat orkestraation tiheyden mukaan, trumpettien huudot ovat
//     mustia kiiloja (S.fam.tpt, nuotinalut), virvelit pisteviivoitusta maassa, salamat paperin
//     leikkauksia mitatuissa iskuissa (S.accIn). Kohdistus hajoaa (palautus: mis).
//  65 wal_puolenvaihto: päättyy tähän (levy: record.js).
// Kamera: yksi jatkuva dolly (ei leikkauksia). Etualan kerrokset ohittavat kameran, kun se sukeltaa
// syvyyteen. Kaikki on puhdas funktio ajasta: siemenet hash1:stä, kertymät samplereina.

import * as THREE from 'three';
import { C, U, HALFTONE, ink, flat, group, poly, rect, circle, strokeGeo, ridgeGeo, deadTree, cloud, streaks, pennantGeo, waveMat, boltPoints, clamp, smoothstep, mix, hash1 } from './paper.js';
import { leader, ease } from './hero.js';
import { horse, poseHorse, KP, kmix } from './puppets.js';
import { common } from './world.js';
import { gaussian, sampler } from '../util.js';

// --- Taivas: paperi horisontissa, ylös sinooperi, ylimpänä musta; yöllä sininen ja musta ---------
// Sininen ja punainen eivät ole koskaan yhtä aikaa (purppura on säästetty väri): sininen sammuu
// mustan sameuden alle, ennen kuin punainen alkaa.
const SKY_FS = /* glsl */ `
  uniform float uCell, uTime, uBlue, uRed, uBlack, uMurk, uHorY;
  uniform vec3 uBlackC, uBlueC, uPaperC, uRedC;
  varying vec3 vW;
  ${HALFTONE}
  void main() {
    float y = vW.y - uHorY;
    float gb = uBlue * (0.4 + 0.6 * smoothstep(0.0, 140.0, y));
    float gr = uRed * smoothstep(3.0, 85.0, y);
    float gk = uBlack * smoothstep(55.0, 230.0, y);
    float murk = uMurk * smoothstep(-5.0, 60.0, y) * (0.4 + 0.6 * vnoise(vW.xy * 0.011 + vec2(uTime * 0.02, 0.0)));
    vec3 c = uPaperC;
    c = mix(c, uBlueC, halftone(gb, 0.26, uCell * 1.25));
    c = mix(c, uRedC, halftone(gr, 1.31, uCell * 1.25));
    c = mix(c, uBlackC, halftone(max(gk, murk), 0.785, uCell * 1.25));
    gl_FragColor = vec4(c, 1.0);
  }
`;

// --- Maa: puupiirros. Z-suuntaiset viivat (Dürer), kauempana tiheämpiä ja sitten paperinen sumu.
// Pohjaväri: yöllä sininen/musta massa, sitten paperi, taistelussa tulenpunainen. Rummun lyönnit
// nostavat viivoitusta kuhmuna (kärkipisteet), virvelit ovat pisteviivoja.
const GROUND_VS = /* glsl */ `
  uniform vec4 uHits[8];
  uniform float uTime;
  varying vec3 vW;
  varying vec3 vP;
  varying float vBump;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vP = w.xyz;
    float b = 0.0;
    for (int i = 0; i < 8; i++) {
      vec4 h = uHits[i];
      if (h.w <= 0.0) continue;
      float age = uTime - h.z;
      if (age < 0.0 || age > 1.8) continue;
      float r = length(w.xz - h.xy);
      float R = 1.5 + h.w * (1.4 + 3.2 * age);
      float ring = exp(-pow((r - 0.4 * R) / (0.38 * R + 0.5), 2.0));
      b += h.w * 0.55 * ring * exp(-age * 1.9);
    }
    vBump = b;
    w.y += b;
    vW = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;
const GROUND_FS = /* glsl */ `
  uniform float uCell, uField, uRedG, uDots;
  uniform vec3 uBlackC, uBlueC, uPaperC, uRedC;
  varying vec3 vW;
  varying vec3 vP;
  varying float vBump;
  ${HALFTONE}
  float lineCov(float v, float p, float th) {
    float s = v / p;
    float aa = fwidth(s) * 1.5;
    float d = abs(fract(s) - 0.5) * 2.0;
    return 1.0 - smoothstep(th - aa, th + aa, d);
  }
  void main() {
    float zc = -vP.z;
    float x = vP.x;
    float dist = length(vP.xz - cameraPosition.xz);
    float haze = smoothstep(70.0, 300.0, dist);
    float wob = (vnoise(vec2(x * 0.16, zc * 0.05)) - 0.5) * 1.7 + 0.7 * sin(x * 0.06 + zc * 0.02);
    float zz = zc + wob;
    float tone = 0.2 + 0.3 * smoothstep(6.0, 90.0, dist) + vBump * 0.5;
    // viivojen väli pysyy noin 13 pikselinä (Dürerin viivoitus): puolitus/kaksinkertaistus liukuu
    float lvl = clamp(log2(fwidth(zc) * 13.0 / 0.4), -3.0, 12.0);
    float l0 = floor(lvl), fr = lvl - l0;
    float p0 = 0.4 * exp2(l0);
    float cov = mix(lineCov(zz, p0, tone), lineCov(zz, p0 * 2.0, tone), fr);
    float pat = smoothstep(0.52, 0.72, vnoise(vec2(x, zz) * 0.11));
    float cov2 = lineCov(x * 0.9 + zz * 0.5, p0 * 2.6, 0.12) * pat * (1.0 - smoothstep(25.0, 70.0, dist)) * smoothstep(9.0, 20.0, dist);
    float black = max(cov * (1.0 - haze * 0.92), cov2) * uField;
    // yö: sininen ja musta massa
    float night = (1.0 - uField);
    vec3 c = uPaperC;
    c = mix(c, uBlueC, halftone(night * (1.0 - haze * 0.5), 0.26, uCell * 1.4));
    c = mix(c, uBlackC, halftone(night * 0.75 * (1.0 - haze * 0.7), 0.785, uCell * 1.4));
    float rc = uRedG * (1.0 - haze);
    c = mix(c, uRedC, rc > 0.985 ? 1.0 : halftone(rc, 1.31, uCell * 1.4));
    c = mix(c, uBlackC, black);
    // virvelit: pisteviivat viivojen välissä
    float rs = zz / p0;
    float rowD = abs(fract(rs + 0.5) - 0.5);
    float rowId = floor(rs + 0.5) + l0 * 101.0;
    float rowOn = step(hash12(vec2(rowId, 3.7)), uDots);
    float dash = step(0.5, fract(x / (p0 * 1.3) + hash12(vec2(rowId, 9.1)) * 7.0));
    float dots = (1.0 - smoothstep(0.07, 0.14, rowD)) * rowOn * dash * (1.0 - smoothstep(40.0, 110.0, dist)) * uField;
    c = mix(c, uPaperC, dots);
    gl_FragColor = vec4(c, 1.0);
  }
`;

// --- Haboku: metaball-läiskät. Summa r²/d² yli 1 = musta, reunalla märkä rasteri (nijimi). ---------
const HABOKU_FS = /* glsl */ `
  uniform vec4 uB[32];
  uniform float uCell;
  uniform vec3 uBlackC;
  varying vec3 vW;
  ${HALFTONE}
  void main() {
    vec2 p = vW.xy;
    vec2 nz = vec2(vnoise(p * 1.1 + 7.0), vnoise(p * 3.7 + 2.0)) - 0.5;
    float f = 0.0;
    for (int i = 0; i < 32; i++) {
      vec4 b = uB[i];
      if (b.z <= 0.0) continue;
      vec2 d = p - b.xy + nz * b.z * 0.9;
      float q = dot(d, d) / (4.0 * b.z * b.z);
      float w = max(0.0, 1.0 - q);
      f += w * w;
    }
    if (f < 0.12) discard;
    float h = halftone(clamp((f - 0.12) / 0.3, 0.0, 1.0) * 0.9, 0.52, uCell * 0.9);
    if (f < 0.42 && h < 0.5) discard;
    gl_FragColor = vec4(uBlackC, 1.0);
  }
`;
const worldVS = 'varying vec3 vW; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }';

const wrap = (v, P) => ((((v + P / 2) % P) + P) % P) - P / 2;

export function build(K) {
  const { S } = K;
  const LEAD = S.LEAD;
  const A = (id) => S.A(id).t;
  const W = common(S);
  const k1 = A('wal_kulissi1'), vas = A('wal_vastaus'), k2 = A('wal_kulissi2'), tais = A('wal_taistelu'), flip = A('wal_puolenvaihto');
  const tB = (S.segs.find((s) => s.a > tais + 3 && s.a < tais + 15) || { a: tais + 7 }).a;   // jaksoraja: virvelit ja huudot tiivistyvät
  const n = S.n;
  const arr = (f) => { const a = new Float32Array(n); for (let i = 0; i < n; i++) a[i] = f(i / 30); return a; };

  // --- Signaalit (kaikki puhtaita funktioita ajasta) ------------------------------------------
  const loudS = W.smooth((t) => S.loud(t), 1.5);
  const hornsS = W.smooth((t) => S.energy.horns(t), 0.9);         // tasoitettu käyrätorvikanava: ritarin iskut
  const dens = W.smooth((t) => clamp((S.fam.horns(t) + S.fam.brass(t) + S.fam.strings(t) + S.fam.winds(t) + 0.8 * S.fam.perc(t) + 0.5 * S.fam.cymbal(t)) / 3.4), 1.6);
  const violS = W.smooth((t) => clamp(S.fam.violins(t)), 0.8);
  const percS = W.smooth((t) => clamp(S.fam.perc(t)), 0.25);
  const windA = (t) => clamp(W.wind(t) + 0.12);
  const speed = (t) => {
    const s = 1.5 * smoothstep(vas + 2.5, vas + 6, t) + 3.4 * smoothstep(k2 - 3, k2 + 1, t) + 3.6 * smoothstep(tais - 1, tais + 3, t);
    return s * (0.85 + 0.3 * loudS(t));
  };
  const X = W.integ(speed);                                            // hevosen x
  const phW = (t) => (2 * Math.PI * X(t)) / 2.4;
  const phG = (t) => (2 * Math.PI * X(t)) / 6.0;
  const gGal = (t) => smoothstep(k2 - 3, k2 + 1.5, t);
  const amtW = (t) => clamp(speed(t) / 1.5);
  const amtG = (t) => smoothstep(1.5, 6.0, speed(t));

  // --- Kamera: yksi jatkuva dolly ritarin perässä, sukellus kerrosten läpi ------------------------
  // [t, y, z, katseen y, fov]; x seuraa ritaria. Tasoitus 1,5 s: ei äkkinäistä liikettä.
  const KEYS = [
    [k1, 2.0, 30, 4.0, 42], [vas, 2.0, 29, 4.0, 42], [vas + 8, 2.1, 27, 4.1, 42], [k2, 2.0, 24, 3.9, 42],
    [tais, 1.9, 20, 3.6, 42], [tais + 14, 1.7, 17, 3.4, 43], [tais + 30, 1.6, 14.5, 3.2, 44],
    [flip - 6, 1.5, 12, 3.0, 44], [flip + 6, 1.5, 11.5, 3.0, 44],
  ];
  const rawCam = (t) => {
    if (t <= KEYS[0][0]) return KEYS[0].slice(1);
    for (let i = 1; i < KEYS.length; i++) {
      if (t <= KEYS[i][0]) {
        const u = (t - KEYS[i - 1][0]) / (KEYS[i][0] - KEYS[i - 1][0]);
        return KEYS[i].slice(1).map((v, j) => mix(KEYS[i - 1][j + 1], v, u));
      }
    }
    return KEYS[KEYS.length - 1].slice(1);
  };
  const camArr = [0, 1, 2, 3].map(() => new Float32Array(n));
  for (let i = 0; i < n; i++) rawCam(i / 30).forEach((v, j) => { camArr[j][i] = v; });
  const camS = camArr.map((a) => sampler(gaussian(a, 45), 30));
  const camAt = (t) => {
    const x = X(t), cy = camS[0](t), cz = camS[1](t), ly = camS[2](t), fov = camS[3](t);
    const lead = 0.22 * cz;
    return { pos: [x, cy, cz], look: [x + lead, ly, 0], fov, yaw: Math.atan2(lead, cz) };
  };

  const scene = new THREE.Scene();
  scene.background = C.paper.clone();

  // --- Taivas ---
  const skyU = {
    uCell: U.uCell, uTime: { value: 0 }, uBlue: { value: 1 }, uRed: { value: 0 }, uBlack: { value: 0.3 }, uMurk: { value: 0 }, uHorY: { value: 0 },
    uBlackC: { value: C.black }, uBlueC: { value: C.blue }, uPaperC: { value: C.paper }, uRedC: { value: C.red },
  };
  const skyM = new THREE.Mesh(new THREE.PlaneGeometry(6000, 3000), new THREE.ShaderMaterial({ uniforms: skyU, vertexShader: worldVS, fragmentShader: SKY_FS, depthWrite: false }));
  skyM.position.z = -480; skyM.frustumCulled = false; skyM.renderOrder = -10;
  scene.add(skyM);

  // mustat pilvet (sameus), sininen ei sekoitu: pilvi on mustaa paperia vasten
  const cloudMat = ink(C.black, { shade: C.paper, raster: 0.18 });
  const clouds = Array.from({ length: 16 }, (_, k) => flat(scene, cloud(120 + 90 * hash1(k), 30 + 22 * hash1(k + 1), k + 40, true), cloudMat, { y: 55 + 90 * hash1(k + 2), z: -330 - 30 * hash1(k + 3) }));

  // yläpuolen pilvien sävy: paperi yöllä, sinooperi taistelussa (ei sinistä punaisen kanssa)
  const cloudShade = cloudMat.uniforms.uShade.value;

  // --- Maa (kaksi tasoa: lähellä tiheä verkko kuhmuille, kaukana tasainen) ---
  const gU = {
    uCell: U.uCell, uTime: { value: 0 }, uField: { value: 0 }, uRedG: { value: 0 }, uDots: { value: 0 },
    uHits: { value: Array.from({ length: 8 }, () => new THREE.Vector4(0, 0, -99, 0)) },
    uBlackC: { value: C.black }, uBlueC: { value: C.blue }, uPaperC: { value: C.paper }, uRedC: { value: C.red },
  };
  const gMat = new THREE.ShaderMaterial({ uniforms: gU, vertexShader: GROUND_VS, fragmentShader: GROUND_FS, side: THREE.DoubleSide });
  const gNear = new THREE.Mesh(new THREE.PlaneGeometry(240, 200, 240, 200), gMat);
  gNear.rotation.x = -Math.PI / 2; gNear.frustumCulled = false;
  const gFar = new THREE.Mesh(new THREE.PlaneGeometry(2400, 520, 2, 2), gMat);
  gFar.rotation.x = -Math.PI / 2; gFar.frustumCulled = false;
  scene.add(gNear, gFar);

  // --- Horisontti: kolme harjannetta (siluetit), kaukana sumuisia ---
  const ridgeMats = [ink(C.black, { shade: C.paper, raster: 0.35 }), ink(C.black, { shade: C.paper, raster: 0.18 }), ink(C.black, {})];
  const ridges = [[-430, 26, 11, 0], [-300, 15, 5, 1], [-110, 5.5, 3, 2]].map(([z, h, seed, mi]) => {
    const m = flat(scene, ridgeGeo(-900, 900, h, seed, { lambda: 150 - 30 * mi, base: -80 }), ridgeMats[mi], { z });
    m.userData.edge = { name: `harjanne z${z}`, x0: -900, x1: 900 };
    return m;
  });

  // --- Kolme kulissitrumpetin viiriä horisontissa: musta, valkoinen, punainen ---
  const PEN = [
    { c: C.black, rim: C.paper, th: 0.115, H: 34, L: 21, h: 6.4 },
    { c: C.paper, rim: C.black, th: 0.23, H: 41, L: 24, h: 7.0 },
    { c: C.red, rim: C.paper, th: 0.355, H: 31, L: 20, h: 6.0 },
  ].map((o, i) => {
    const g = group(scene, {});
    flat(g, rect(0.7, o.H, 0.5, 0), ink(C.black, {}), { z: 0.5 });
    flat(g, rect(1.7, o.H, 0.5, 0), ink(C.paper, {}), { z: 0 });
    const fm = waveMat(o.c, { amp: 1, k: 6 });
    const rm = waveMat(o.rim, { amp: 1, k: 6 });
    const flag = flat(g, pennantGeo(o.L, o.h), fm, { y: o.H - o.h * 0.5 - 1.5, z: 1.0 });
    const rim = flat(g, pennantGeo(o.L * 1.07, o.h * 1.28), rm, { y: o.H - o.h * 0.5 - 1.5, z: -0.5 });
    flag.scale.x = rim.scale.x = -1;     // sama tuuli kuin ritarin viirillä: virtaa -x
    flag.position.x = rim.position.x = 0.0;
    return { ...o, g, fm, rm, i };
  });
  const penOn = S.onsetsIn(k1 - 1, vas + 14, (t) => S.fam.tpt(t) > 0.12 || S.fam.brass(t) > 0.2);
  const penZ = (t) => -330 + 95 * ease(smoothstep(k1 + 6, k2, t)) + 70 * smoothstep(k2, tais + 8, t);

  // --- Kuolleet puut (maailman mukana) ja etualan kerrokset (kameran ohitse) ---
  const treeMat = ink(C.black, {});
  const trees = Array.from({ length: 6 }, (_, i) => {
    const g = group(scene, { z: -50 - 60 * hash1(i * 5 + 1) });
    deadTree(100 + i, 2.6 + 2 * hash1(i + 20)).forEach((sh) => flat(g, sh, treeMat, {}));
    return { g, x0: (hash1(i * 3 + 2) - 0.5) * 220, s: 0.8 + 0.6 * hash1(i + 50) };
  });
  // etualan kerrokset: harvat piikkiset ruohot/keihäät; jokainen kerros ohittaa kameran dollyssa
  const blade = (h, w, lean) => poly([[-w, 0], [-w * 0.3, h * 0.6], [lean, h], [w * 0.3, h * 0.55], [w, 0]]);
  const FG = [[16.5, 0.07, 0, 3.0], [12.8, 0.14, 1, 3.6]].map(([z, p, mi, hh], li) => {
    const m = [ink(C.black, {}), ink(C.red, { shade: C.black, raster: 0.4 })][mi];
    const items = Array.from({ length: 9 }, (_, i) => {
      const g = group(scene, { z: z + 0.06 * i });
      const hgt = hh * (0.55 + 0.9 * hash1(li * 100 + i));
      flat(g, blade(hgt, 0.05 + 0.05 * hash1(li * 70 + i), (hash1(li * 33 + i) - 0.5) * 0.5), m, {});
      flat(g, blade(hgt * 0.7, 0.05, -0.4), m, { x: 0.3 });
      flat(g, blade(hgt * 0.45, 0.04, 0.3), m, { x: -0.3 });
      flat(g, blade(hgt * 0.6, 0.045, 0.5), m, { x: 0.65 });
      return { g, x0: (i / 9 - 0.5) * 130 + 9 * (hash1(li * 17 + i) - 0.5) };
    });
    return { z, p, items, mi };
  });

  // --- Ritari ratsailla ja hevonen ---
  const H = horse(scene, { mane: C.red });
  const L = leader(scene, {});
  [...H.mats, ...L.mats].forEach((m) => { if (m.uniforms?.uShade && m.uniforms.uShade.value.equals(C.blue)) m.uniforms.uShade.value = C.red.clone(); });   // ei sinistä taisteluun
  const MOUNT_Y = 1.0494;                 // seisova lantio = istuva lantio satulassa alussa
  const bobAt = (t) => mix(0.03 * Math.abs(Math.sin(phW(t))) * amtW(t), 0.1 * Math.abs(Math.sin(phG(t))) * amtG(t), gGal(t));
  const windAt = (t) => ({ x: -(2.0 + 8 * windA(t)), y: 0.4 + 1.2 * violS(t) });
  function leaderState(t) {
    const hx = X(t);
    const pm = ease(clamp((t - vas) / 3.0));
    const look = smoothstep(k1, k1 + 2.2, t);
    const swing = smoothstep(tais, tais + 4, t) * clamp(hornsS(t) * 1.25);          // fraasin mittainen isku, ei yksittäinen nuotti
    const answer = smoothstep(vas + 3.2, vas + 5.5, t) * (1 - smoothstep(k2 - 4, k2 - 1, t));
    if (t < vas) {
      return { x: hx - 2.2, y: 0, z: 0.4, facing: 1, pose: { ...kmix(KP.stand, KP.look, look), mounted: false } };
    }
    let pose = kmix(kmix(KP.look, KP.climbA, smoothstep(0.05, 0.5, pm)), KP.ride, smoothstep(0.5, 1.0, pm));
    const y = MOUNT_Y + 0.47 * pm + 0.5 * Math.sin(Math.PI * pm) + (pm >= 1 ? bobAt(t) * 0.35 : 0);
    let lanceAng;
    if (pm >= 1) {
      const up = Math.max(answer, 0);
      pose = { ...KP.ride, aN: mix(mix(0.95, 2.6, up), 1.35, swing), eN: mix(0.3, 0.1, swing), lean: 0.1 + 0.18 * swing, tilt: 0.1 + 0.2 * answer };
      lanceAng = mix(mix(0.05, -0.08, up), 1.15, swing);
    }
    return { x: hx + 0.05 - 2.25 * (1 - pm), y, z: 0.4, facing: 1, pose: { ...pose, mounted: true }, lanceAng };
  }
  const JOINTS = () => [H.L.fN.up, H.L.fF.up, H.L.hN.up, H.L.hF.up, H.L.fN.lo, H.L.fF.lo, H.L.hN.lo, H.L.hF.lo, H.body, H.neck, H.tail];
  function poseHorseBlend(t) {
    const g = gGal(t);
    poseHorse(H, 'walk', phW(t), amtW(t));
    const a = [...JOINTS().map((o) => o.rotation.z), H.body.position.y, H.body.position.x];
    poseHorse(H, 'gallop', phG(t), amtG(t));
    JOINTS().forEach((o, i) => { o.rotation.z = mix(a[i], o.rotation.z, g); });
    H.body.position.y = mix(a[11], H.body.position.y, g);
    H.body.position.x = mix(a[12], H.body.position.x, g);
  }

  // --- Kumppanin paikka: valkoinen viiva vain jos viulukanava soi -------------------------------
  const slot = group(scene, { z: 0.1 });
  const NP = 26;
  const lg = new THREE.BufferGeometry();
  lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NP * 2 * 3), 3));
  lg.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(NP * 2 * 2), 2));
  { const idx = []; for (let k = 0; k < NP - 1; k++) { const a = 2 * k; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } lg.setIndex(idx); }
  const lineMat = ink(C.paper, {});
  const lineM = new THREE.Mesh(lg, lineMat);
  lineM.frustumCulled = false;
  slot.add(lineM);
  function setLine(t, amt, rise) {
    const pos = lg.getAttribute('position');
    const h = 3.6 * rise;
    for (let k = 0; k < NP; k++) {
      const u = k / (NP - 1);
      const xs = 0.22 * Math.sin(u * 5.0 - t * 1.6) * u * (0.4 + windA(t));
      const w = 0.07 + 0.05 * (1 - u);
      pos.setXYZ(2 * k, xs - w, u * h, 0);
      pos.setXYZ(2 * k + 1, xs + w, u * h, 0);
    }
    pos.needsUpdate = true;
    lineMat.uniforms.uAppear.value = amt;
    lineM.visible = amt > 0.03;
  }

  // --- Haboku-läiskät: siemennetyt, orkestraation tiheyden mukaan kasvavat ------------------------
  const bU = { uB: { value: Array.from({ length: 32 }, () => new THREE.Vector4(0, 0, 0, 0)) }, uCell: U.uCell, uBlackC: { value: C.black } };
  const hab = new THREE.Mesh(new THREE.PlaneGeometry(260, 70), new THREE.ShaderMaterial({ uniforms: bU, vertexShader: worldVS, fragmentShader: HABOKU_FS, side: THREE.DoubleSide }));
  hab.frustumCulled = false;
  scene.add(hab);
  const BIG = 16;
  const blobBase = Array.from({ length: BIG }, (_, i) => ({
    h0: hash1(i * 11 + 1), per: 6.5 + 5 * hash1(i * 11 + 2), dx: 6.5 + 12 * hash1(i * 11 + 3), y0: 0.4 + 8.5 * hash1(i * 11 + 4), r: 0.8 + 1.1 * hash1(i * 11 + 5),
  }));
  function blobs(t, kx, edge, near) {
    const grow = smoothstep(tais, tais + 4, t);
    const d = dens(t);
    const act = (0.3 + 0.7 * d) * BIG * 1.1 + 1;
    const pos = [];
    for (let i = 0; i < BIG; i++) {
      const b = blobBase[i];
      const ph = (t - tais) / b.per + b.h0;
      const u = ph - Math.floor(ph);
      const env = smoothstep(0, 0.14, u) * (1 - smoothstep(0.82, 1.0, u));
      const r = b.r * (0.4 + 0.6 * d) * grow * env * smoothstep(i, i + 1, act);
      const x = mix(edge + 5, near + b.dx * 0.5, Math.pow(u, 0.85));
      const y = b.y0 * (1 - 0.5 * u) + 0.2;
      pos.push([x, y, r]);
      bU.uB.value[i].set(x, y, r, 0);
    }
    for (let j = 0; j < 16; j++) {
      const [bx, by, br] = pos[j];
      const a = hash1(j * 13 + 7) * 6.283;
      const dd = br * (2.1 + 1.0 * hash1(j * 13 + 8));
      bU.uB.value[BIG + j].set(bx + Math.cos(a) * dd, by + Math.sin(a) * dd, br > 0.05 ? 0.14 + 0.22 * hash1(j * 13 + 9) * (0.5 + d) : 0, 0);
    }
  }

  // --- Trumpettien huudot: mustat kiilat (nuotinalut, S.fam.tpt) --------------------------------
  const wedgeEv = S.onsetsIn(tais - 0.05, flip, (t) => S.fam.tpt(t) > 0.28).filter((t, i, a) => i === 0 || t - a[i - 1] > 0.3).map((t, i) => ({ t, a: clamp(S.fam.tpt(t)), i }));
  const NW = 10;
  const wedges = Array.from({ length: NW }, () => {
    const mk = (c) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(9), 3));
      g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(6), 2));
      g.setIndex([0, 1, 2]);
      const m = new THREE.Mesh(g, ink(c, { noDim: true }));
      m.frustumCulled = false; m.visible = false;
      scene.add(m);
      return m;
    };
    return { rim: mk(C.paper), body: mk(C.black) };
  });
  function setWedge(m, hx, hy, tx, ty, w, z) {
    const dx = hx - tx, dy = hy - ty, l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l, ny = dx / l;
    const p = m.geometry.getAttribute('position');
    p.setXYZ(0, hx, hy, z); p.setXYZ(1, tx + nx * w, ty + ny * w, z); p.setXYZ(2, tx - nx * w, ty - ny * w, z);
    p.needsUpdate = true;
  }

  // --- Salamat: paperin leikkaus mustalla ääriviivalla -----------------------------------------
  const bolts = S.accIn(tais, flip, 6).map((e, i) => {
    const pts = boltPoints(300 + i, 0, 24, 0, 0);
    const side = hash1(i * 7 + 3) > 0.45 ? 1 : -1;
    const g = group(scene, { z: -3 });
    const wf = (u) => 0.55 * (1 - u) + 0.16;
    flat(g, strokeGeo(pts, (u) => wf(u) + 0.3), ink(C.black, { noDim: true }), { z: -0.02 });
    flat(g, strokeGeo(pts, wf), ink(C.paper, { noDim: true }), { z: 0 });
    // haara
    const b2 = pts.slice(5, 10).map(([x, y], k) => [x + k * 1.3 * side, y - k * 0.3]);
    flat(g, strokeGeo(b2, (u) => 0.4 * (1 - u) + 0.12 + 0.3), ink(C.black, { noDim: true }), { z: -0.02 });
    flat(g, strokeGeo(b2, (u) => 0.4 * (1 - u) + 0.12), ink(C.paper, { noDim: true }), { z: 0 });
    g.visible = false;
    return { g, t: e.t, z: e.z, side, f: 0.3 + 0.55 * hash1(i * 7 + 5) };
  });

  // --- Patarummun lyönnit: viivoituksen pöllähdys + nouseva pöly ---
  const drum = S.strokesIn(tais - 0.1, flip + 1);
  const dustMat = ink(C.paper, { shade: C.black, raster: 0.15, noDim: true });
  const DUSTN = 6, DUSTK = 12;
  const dust = streaks(scene, DUSTN * DUSTK, dustMat, 0);

  // --- Hiljaisuus: friisiin jää tyhjää paperia -------------------------------------------------
  const SIL_THR = 0.1;
  const quiet = (t) => {
    const gate = smoothstep(vas + 6, vas + 8, t) * (1 - smoothstep(k2 - 0.2, k2 + 0.6, t));
    return gate * (1 - smoothstep(SIL_THR * 0.7, SIL_THR * 1.3, S.loud(t)));
  };

  const shots = [
    { name: '61 kaukainen kutsu: kolme viiriä', a: k1, b: vas, cam: (u, t) => camAt(t) },
    { name: '62 ritari ratsaille, kenttä painuu esiin', a: vas, b: k2, cam: (u, t) => camAt(t) },
    { name: '63 viirit lähempänä', a: k2, b: tais, cam: (u, t) => camAt(t) },
    { name: '64 taistelu: sukellus kerrosten läpi', a: tais, b: flip + 1, cam: (u, t) => camAt(t) },
  ];

  function update(t) {
    const cam = camAt(t);
    const kx = X(t);
    const cx = cam.pos[0];
    const halfW = (z) => (cam.pos[2] - z) * Math.tan((cam.fov * Math.PI) / 360) * (16 / 9);
    const viewX = (f, z) => cam.look[0] + f * halfW(z);        // f -1..1: paikka ruudun leveydellä
    const w = windA(t);
    const battle = smoothstep(tais - 0.5, tais + 1.5, t);

    // taivas
    skyU.uTime.value = t;
    skyU.uBlue.value = 1 - smoothstep(k2 - 1, k2 + 3.2, t);
    skyU.uRed.value = smoothstep(tais - 0.6, tais + 2.5, t);
    skyU.uBlack.value = 0.25 + 0.65 * smoothstep(vas, tais, t);
    skyU.uMurk.value = 0.2 + 0.6 * smoothstep(vas, tais + 3, t);
    skyM.position.x = cx;
    cloudShade.copy(C.paper).lerp(C.red, smoothstep(k2 + 3.5, tais, t));
    clouds.forEach((c, k) => { c.position.x = cx + wrap(hash1(k * 9 + 1) * 700 - W.drift(t) * 3.0, 700) * 0.9; c.visible = true; });
    ridges.forEach((r, i) => { r.position.x = cx * (i === 2 ? 0.9 : 0.995); });

    // maa
    gNear.position.set(cx, 0, -75);
    gFar.position.set(cx, 0, -410);
    gU.uTime.value = t;
    gU.uField.value = smoothstep(vas, vas + 9, t);
    gU.uRedG.value = smoothstep(tais - 0.4, tais + 2.5, t);
    gU.uDots.value = clamp(percS(t) * 1.3) * smoothstep(tB - 0.5, tB + 1.5, t) * 0.85;
    const hits = [];
    drum.forEach((d, i) => { if (t >= d - LEAD && t < d + 1.8) hits.push({ t: d, x: kx + 6 + 11 * hash1(i * 5 + 3), z: -2.5 - 7 * hash1(i * 5 + 4), s: 1.0 + 0.5 * hash1(i + 9) }); });
    bolts.forEach((b) => { if (t >= b.t - LEAD && t < b.t + 1.8) { b.x = viewX(b.side * b.f, -3); hits.push({ t: b.t, x: b.x, z: -3, s: 2.4 }); } });
    hits.sort((a, b) => a.t - b.t);
    const last = hits.slice(-8);
    gU.uHits.value.forEach((v, i) => { const h = last[i]; if (h) v.set(h.x, h.z, h.t - LEAD, h.s); else v.set(0, 0, -99, 0); });

    // viirit
    const D = cam.pos[2] - penZ(t);
    PEN.forEach((p, i) => {
      const ang = cam.yaw + [0.115, 0.235, 0.36][i];
      const x = cam.pos[0] + D * Math.tan(ang);
      p.g.position.set(x, 0, penZ(t) - 8 * i);
      const evs = penOn.filter((_, j) => j % 3 === i);
      let pulse = 0;
      for (const e of evs) pulse = Math.max(pulse, S.pulse(t, e, 0.7) * (1 - smoothstep(e + 0.5, e + 2.0, t)));
      const amp = p.L * (0.03 + 0.07 * w + 0.07 * pulse);
      for (const m of [p.fm, p.rm]) { m.uniforms.uTime.value = t; m.uniforms.uAmp.value = amp; }
    });
    trees.forEach((tr) => { tr.g.position.x = cx + wrap(tr.x0 - kx * 0.9 + 80, 240) - 0; tr.g.position.y = 0; tr.g.scale.setScalar(tr.s); });
    FG.forEach((layer) => layer.items.forEach((it) => {
      it.g.position.x = cx + wrap(it.x0 - layer.p * cx, 130);
      it.g.position.y = -0.2;
      it.g.visible = layer.mi === 0 || battle > 0;
    }));

    // hevonen ja ritari
    H.root.position.set(kx, 0, 0);
    poseHorseBlend(t);
    L.place(t, leaderState, windAt, { capeWind: 0.3 + 0.5 * w, width: 0.95, dt: 0.022, windScale: 0.45 });

    // kumppanin paikka
    slot.position.set(kx - 3.4, 0, 0.1);
    setLine(t, smoothstep(0.22, 0.5, violS(t)) * smoothstep(k1 - 1, k1, t), 0.5 + 0.5 * smoothstep(k2 - 1, k2 + 5, t));

    // haboku
    hab.position.set(cx + 6, 14, -6);
    blobs(t, kx, viewX(1, -6), kx + 4.5);

    // kiilat
    const evw = wedgeEv.filter((e) => t >= e.t - LEAD && t < e.t + 1.0).slice(-NW);
    wedges.forEach((wd, j) => {
      const e = evw[j];
      if (!e) { wd.rim.visible = wd.body.visible = false; return; }
      const a = t - (e.t - LEAD);
      wd.rim.visible = wd.body.visible = true;
      const ox = viewX(0.97, -8) + 3 * hash1(e.i * 3 + 1), oy = 4 + 7 * hash1(e.i * 3 + 2);
      const ang = Math.PI + 0.1 + 0.3 * hash1(e.i * 3 + 3) - 0.15;
      const len = (4 + 8 * e.a) * (cam.pos[2] / 20) ** 0.5 + 4;
      const head = ease(clamp(a / 0.26));
      const tail = ease(clamp((a - 0.28) / 0.6));
      const hx = ox + Math.cos(ang) * len * head, hy = oy + Math.sin(ang) * len * head * 0.5 - 1.2 * head;
      const tx = ox + Math.cos(ang) * len * tail, ty = oy + Math.sin(ang) * len * tail * 0.5 - 1.2 * tail;
      const wdt = (0.5 + 0.9 * e.a) * (1 - tail);
      setWedge(wd.body, hx, hy, tx, ty, wdt, -8);
      setWedge(wd.rim, hx + (hx - tx) * 0.02 + 0.0, hy, tx - (hx - tx) * 0.01, ty, wdt + 0.28, -8.05);
      wd.body.visible = wd.rim.visible = tail < 0.97;
    });

    // salamat
    bolts.forEach((b) => {
      const a = t - (b.t - LEAD);
      b.g.visible = a >= 0 && a < 0.34;
      if (b.g.visible) b.g.position.set(viewX(b.side * b.f, -3), 0, -3);
    });

    // pöly
    const evd = hits.filter((h) => h.s < 2).slice(-DUSTN);
    dust.set((i) => {
      const e = evd[Math.floor(i / DUSTK)];
      if (!e) return null;
      const j = i % DUSTK;
      const a = t - (e.t - LEAD);
      if (a < 0 || a > 0.95) return null;
      const spread = (hash1(j * 5 + 1) - 0.5) * 3.2;
      const ang = Math.PI / 2 + (hash1(j * 5 + 2) - 0.5) * 1.5;
      const r = (1.2 + 2.6 * hash1(j * 5 + 3)) * Math.sqrt(a / 0.95);
      const l = (0.6 + 1.6 * hash1(j * 5 + 4)) * (1 - a / 0.95);
      return { x: e.x + spread + Math.cos(ang) * r, y: 0.05 + Math.sin(ang) * r, z: e.z, ang, len: l, w: 0.07 };
    });

    // kohdistus hajoaa: tiheys ja taistelun eteneminen
    const mis = 0.4 + 2.2 * smoothstep(tais, tais + 14, t) * (0.45 + 0.55 * dens(t)) * battle;
    return { mis, paper: quiet(t), dens: dens(t), wind: w };
  }
  return { scene, update, shots, slot, camAt };
}
