// A-levy (kohtaus 65): kenttä kiertyy levyn uraksi. Renkaat ovat A-puolen väripartituuri ulkoa sisään
// (tyyli, luku 5–6): rajoina held / widersacher / gef_viulu / gef_rakkaus / wal_kulissi1 / wal_puolenvaihto.
//   1 held          aamunkoi: berliininsininen -> kerma (sininen rasteri harvenee sisäänpäin)
//   2 widersacher   sameus: musta ja punainen rasteri, eri kulmissa ja toisiaan peittämättä
//   3 gef_viulu     iltarusko: sinooperi -> kerma
//   4 gef_rakkaus   yö: sininen ja musta
//   5 wal_kulissi1  taistelu: sinooperi ja musta
// Punaista ja sinistä rasteria ei paineta päällekkäin (se näyttäisi purppuralta, ja purppura on säästetty).
// Renkaan leveys on osittain jakson kesto (friisin leveys on verrannollinen aikaan), osittain tasajako,
// jotta lyhyinkin jakso näkyy. Levy on kokonaan kuvassa, pyörii hitaasti ja kamera vetäytyy loppuun asti.
//
// Kierros 2 (palaute C8): kenttä ei vaihdu levyyn leikkauksella. Levy on rakennettu kahdella tavalla samasta
// koodista (buildDiscPieces): 'scene' = oma kohtaus K (paperitausta) ja 'overlay' = taistelukentän (loc_battle.js)
// päälle kameraan kiinnitetty kerros. Puolenvaihdosta (wal_puolenvaihto) alkaen taistelukenttä kuivuu rasteriksi
// paperille (peitto uCov) ja levyn ura kiertyy ulkoreunalta sisäänpäin spiraalina (uProg) sillä välin, kun kenttä
// vielä näkyy kiertymättömän osan alla. Kaikki on puhdas ajan funktio ja rasterit tulevat ruutukoordinaateista,
// joten K ja kenttään liitetty levy näyttävät samalta; siirtymä K:hon (main.js TRANS) on silloin saumaton.

import * as THREE from 'three';
import { C, U, HALFTONE, ink, flat, group, circle, strokeGeo, hash1 } from './paper.js';
import { smoothstep } from '../util.js';

const FS = /* glsl */ `
  uniform float uCell, uR0, uR1, uProg, uOverlay;
  uniform vec4 uB;            // renkaiden rajat (0..1 ulkoa sisään): 1|2, 2|3, 3|4, 4|5
  uniform vec3 uBlack, uBlue, uPaper, uRed;
  varying vec3 vL;
  ${HALFTONE}
  void main() {
    float r = length(vL.xy);
    float u = clamp((uR1 - r) / (uR1 - uR0), 0.0, 1.0);   // 0 ulkoreuna (alku), 1 sisäreuna (loppu)
    float c0 = uCell * 1.15;
    vec3 c = uPaper;
    // friisi kiertyy urakseen ulkoreunalta sisäänpäin: spiraalin kulku p kasvaa säteellä (14 kierrosta) ja kulmalla
    float ang = atan(vL.y, vL.x) / 6.2831853 + 0.5;
    float pS = u * 14.0 + ang;
    if (pS > uProg * 15.0) {
      if (uOverlay > 0.5) discard;          // kentän päällä: kiertymätön osa näyttää kentän (ja paperipeiton)
      gl_FragColor = vec4(uPaper, 1.0);
      return;
    }
    float s;
    if (u < uB.x) {                       // 1 aamunkoi: sininen -> kerma
      s = u / uB.x;
      c = mix(uPaper, uBlue, halftone(0.94 - 0.9 * s, 0.26, c0));
    } else if (u < uB.y) {                // 2 sameus: musta + punainen, punainen vain mustan ulkopuolella
      float bk = halftone(0.4, 0.785, c0);
      float rd = halftone(0.38, 1.31, c0) * (1.0 - bk);
      c = mix(uPaper, uRed, rd);
      c = mix(c, uBlack, bk);
    } else if (u < uB.z) {                // 3 iltarusko: sinooperi -> kerma
      s = (u - uB.y) / (uB.z - uB.y);
      c = mix(uPaper, uRed, halftone(0.95 - 0.85 * s, 1.31, c0));
    } else if (u < uB.w) {                // 4 yö: sininen ja musta
      c = mix(uBlue, uBlack, halftone(0.5, 0.785, c0));
    } else {                              // 5 taistelu: sinooperi ja musta
      c = mix(uRed, uBlack, halftone(0.55, 0.785, c0));
    }
    // urat: ohuet tummat viivat (musta ei näy mustalla, mutta antaa levylle pinnan)
    float gr = abs(fract(r * 5.0) - 0.5);
    c = mix(c, uBlack, (1.0 - smoothstep(0.07, 0.13, gr)) * 0.3);
    // rajauralle (kappalevälit) tiheämpi musta viiva
    for (int i = 0; i < 4; i++) {
      float bu = i == 0 ? uB.x : i == 1 ? uB.y : i == 2 ? uB.z : uB.w;
      float br = uR1 - bu * (uR1 - uR0);
      c = mix(c, uBlack, 1.0 - smoothstep(0.05, 0.12, abs(r - br)));
    }
    gl_FragColor = vec4(c, 1.0);
  }
`;
const VS = 'varying vec3 vL; void main() { vL = position; gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0); }';

// Paperipeitto: rasteripisteet kasvavat paperiksi (sama pisteistys kuin ink.js uAppear), peitto uCov 0..1.
const COVER_FS = /* glsl */ `
  uniform float uCell, uCov;
  uniform vec3 uPaper;
  varying vec3 vL;
  ${HALFTONE}
  void main() {
    if (halftone(1.0 - uCov, 0.4, uCell * 1.4) > 0.5) discard;
    gl_FragColor = vec4(uPaper, 1.0);
  }
`;

// Levyn palat vanhemman alle. mode: 'scene' (oma kohtaus, paperitausta) tai 'overlay' (kameraan kiinnitetty kerros
// taistelukentän päällä: paperipeitto + kiertymätön osa läpinäkyvä). A = (id) => aika sekunteina.
export function buildDiscPieces(parent, S, A, mode = 'scene') {
  const overlay = mode === 'overlay';
  const root = group(parent, {});
  const R1 = 15, R0 = 5.2;
  const T0 = S.T0, tE = A('wal_puolenvaihto');
  // rajat: held alkaa T0:sta, widersacher, gef_viulu, gef_rakkaus, wal_kulissi1, puolenvaihto
  const edges = [T0, S.T_WID, A('gef_viulu'), A('gef_rakkaus'), A('wal_kulissi1'), tE];
  const dur = edges.slice(1).map((e, i) => e - edges[i]);
  const total = edges[5] - edges[0];
  const frac = dur.map((d) => 0.5 * (d / total) + 0.5 * 0.2);   // leveys: puoliksi kesto, puoliksi tasajako
  const sumF = frac.reduce((a, b) => a + b, 0);
  const cum = [];
  frac.reduce((a, b) => { cum.push((a + b) / sumF); return a + b; }, 0);
  // jaksorajat puolenvaihdon jälkeen (segments.json): levy ottaa kuvan sA:ssa, friisi on kiertynyt kokonaan sB:ssä
  const sA = (S.segs.find((x) => x.a > tE + 1) || { a: tE + 2 }).a;
  const sB = (S.segs.find((x) => x.a > sA + 1) || { a: S.T_END }).a;
  const T_REC = sA;

  // paperipeitto (vain kentän päällä): kenttä kuivuu rasteriksi paperille puolenvaihdosta alkaen
  let cover = null;
  if (overlay) {
    cover = new THREE.Mesh(new THREE.PlaneGeometry(260, 260), new THREE.ShaderMaterial({
      uniforms: { uCell: U.uCell, uCov: { value: 0 }, uPaper: { value: C.paper } },
      vertexShader: VS, fragmentShader: COVER_FS,
    }));
    root.add(cover);
  }
  const disc = new THREE.Mesh(new THREE.RingGeometry(R0, R1, 220, 1), new THREE.ShaderMaterial({
    uniforms: {
      uCell: U.uCell, uR0: { value: R0 }, uR1: { value: R1 }, uProg: { value: 0 }, uOverlay: { value: overlay ? 1 : 0 },
      uB: { value: new THREE.Vector4(cum[0], cum[1], cum[2], cum[3]) },
      uBlack: { value: C.black }, uBlue: { value: C.blue }, uPaper: { value: C.paper }, uRed: { value: C.red },
    },
    vertexShader: VS,
    fragmentShader: FS,
  }));
  root.add(disc);
  // pyörivä osa: etiketti ja patina (levyn pinnan naarmut näyttävät pyörimisen). Ne painuvat näkyviin rasterina
  // puolenvaihdon jälkeen (uAppear), kun ura on kiertynyt ulkoreunalta etiketille asti.
  const fade = [];
  const rot = group(root, {});
  const mk = (colr, o) => { const m = ink(colr, o); fade.push(m); return m; };
  flat(rot, circle(R0, 90), mk(C.black, {}), { z: 0.04 });
  flat(rot, circle(R0 * 0.94, 90), mk(C.red, {}), { z: 0.05 });
  flat(rot, circle(R0 * 0.8, 90), mk(C.red, { shade: C.paper, raster: 0.22 }), { z: 0.06 });
  flat(rot, new THREE.RingGeometry(R0 * 0.8, R0 * 0.84, 90), mk(C.paper, {}), { z: 0.07 });
  // etiketin merkit: neljä mustaa viivaa ja yksi kerma piste (pyörimisen vertailukohta)
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + 0.3;
    const g = group(rot, { x: Math.cos(a) * R0 * 0.6, y: Math.sin(a) * R0 * 0.6, z: 0.08 });
    g.rotation.z = a;
    flat(g, strokeGeo([[-0.9, 0], [0.9, 0]], k === 0 ? 0.34 : 0.13), mk(C.black, {}), {});
  }
  flat(rot, circle(0.28, 18, R0 * 0.38, 0), mk(C.paper, {}), { z: 0.08 });
  flat(rot, circle(0.3, 20), mk(C.paper, {}), { z: 0.1 });
  // naarmut: lyhyitä kaaria levyllä, siemennetty
  const scratchMat = mk(C.paper, {});
  for (let i = 0; i < 9; i++) {
    const r = R0 + 0.6 + (R1 - R0 - 1.2) * hash1(i * 7 + 1);
    const a0 = hash1(i * 7 + 2) * Math.PI * 2, da = 0.12 + 0.35 * hash1(i * 7 + 3);
    const pts = Array.from({ length: 10 }, (_, k) => [r * Math.cos(a0 + (da * k) / 9), r * Math.sin(a0 + (da * k) / 9)]);
    flat(rot, strokeGeo(pts, 0.05 + 0.04 * hash1(i * 7 + 4)), scratchMat, { z: 0.03 });
  }
  const rimMat = ink(C.black, {});
  flat(root, new THREE.RingGeometry(R1, R1 + 0.22, 200), rimMat, { z: 0.005 });

  if (overlay) {
    // kuvan päälle kaikesta syvyydestä riippumatta, luontijärjestyksessä (peitto, levy, etiketti, reunus)
    let k = 0;
    root.traverse((o) => {
      if (!o.isMesh) return;
      o.renderOrder = 1000 + k++;
      o.frustumCulled = false;
      o.material.depthTest = false;
      o.material.depthWrite = false;
    });
  }

  function update(t) {
    // reunus piirtyy heti (ura alkaa ulkoreunalta); etiketti ja naarmut painuvat rasterina, kun ura on kiertynyt sisäänpäin asti
    const ap = smoothstep(sB - 4.0, sB - 0.5, t);
    rimMat.uniforms.uAppear.value = smoothstep(tE + 0.2, tE + 1.8, t);
    disc.material.uniforms.uProg.value = smoothstep(tE, sB, t);
    rot.rotation.z = -0.25 * (t - T_REC);
    for (const m of fade) m.uniforms.uAppear.value = ap;
    if (cover) cover.material.uniforms.uCov.value = smoothstep(tE, tE + 2.4, t);
    root.visible = !overlay || t >= tE;
  }
  return { root, update, T_REC, tE, sB, R1 };
}

export function buildRecord(S, A) {
  const scene = new THREE.Scene();
  scene.background = C.paper.clone();
  const D = buildDiscPieces(scene, S, A, 'scene');
  const { T_REC } = D;
  function update(t, cam) {
    D.update(t);
    const u = smoothstep(T_REC - 1, S.T_END, t);
    cam.position.set(0, 0, 47 + 15 * u);       // koko levy kuvassa koko ajan (R1 = 15, näkyvä puolikorkeus yli 17)
    cam.up.set(0, 1, 0);
    cam.lookAt(0, 0, 0);
    cam.fov = 40;
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld(true);
  }
  return { scene, update, T_REC };
}
