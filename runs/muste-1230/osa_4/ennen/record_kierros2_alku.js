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

import * as THREE from 'three';
import { C, U, HALFTONE, ink, flat, group, circle, strokeGeo, hash1 } from './paper.js';
import { smoothstep } from '../util.js';

const FS = /* glsl */ `
  uniform float uCell, uR0, uR1, uProg;
  uniform vec4 uB;            // renkaiden rajat (0..1 ulkoa sisään): 1|2, 2|3, 3|4, 4|5
  uniform vec3 uBlack, uBlue, uPaper, uRed;
  varying vec3 vW;
  ${HALFTONE}
  void main() {
    float r = length(vW.xy);
    float u = clamp((uR1 - r) / (uR1 - uR0), 0.0, 1.0);   // 0 ulkoreuna (alku), 1 sisäreuna (loppu)
    float c0 = uCell * 1.15;
    vec3 c = uPaper;
    // friisi kiertyy urakseen ulkoreunalta sisäänpäin: spiraalin kulku p kasvaa säteellä (14 kierrosta) ja kulmalla
    float ang = atan(vW.y, vW.x) / 6.2831853 + 0.5;
    float pS = u * 14.0 + ang;
    if (pS > uProg * 15.0) { gl_FragColor = vec4(uPaper, 1.0); return; }
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

export function buildRecord(S, A) {
  const scene = new THREE.Scene();
  scene.background = C.paper.clone();
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
  const disc = new THREE.Mesh(new THREE.RingGeometry(R0, R1, 220, 1), new THREE.ShaderMaterial({
    uniforms: {
      uCell: U.uCell, uR0: { value: R0 }, uR1: { value: R1 }, uProg: { value: 1 },
      uB: { value: new THREE.Vector4(cum[0], cum[1], cum[2], cum[3]) },
      uBlack: { value: C.black }, uBlue: { value: C.blue }, uPaper: { value: C.paper }, uRed: { value: C.red },
    },
    vertexShader: 'varying vec3 vW; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: FS,
  }));
  scene.add(disc);
  // pyörivä osa: etiketti ja patina (levyn pinnan naarmut näyttävät pyörimisen)
  const rot = group(scene, {});
  flat(rot, circle(R0, 90), ink(C.black, {}), { z: 0.04 });
  flat(rot, circle(R0 * 0.94, 90), ink(C.red, {}), { z: 0.05 });
  flat(rot, circle(R0 * 0.8, 90), ink(C.red, { shade: C.paper, raster: 0.22 }), { z: 0.06 });
  flat(rot, new THREE.RingGeometry(R0 * 0.8, R0 * 0.84, 90), ink(C.paper, {}), { z: 0.07 });
  // etiketin merkit: neljä mustaa viivaa ja yksi kerma piste (pyörimisen vertailukohta)
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + 0.3;
    const g = group(rot, { x: Math.cos(a) * R0 * 0.6, y: Math.sin(a) * R0 * 0.6, z: 0.08 });
    g.rotation.z = a;
    flat(g, strokeGeo([[-0.9, 0], [0.9, 0]], k === 0 ? 0.34 : 0.13), ink(C.black, {}), {});
  }
  flat(rot, circle(0.28, 18, R0 * 0.38, 0), ink(C.paper, {}), { z: 0.08 });
  flat(rot, circle(0.3, 20), ink(C.paper, {}), { z: 0.1 });
  // naarmut: lyhyitä kaaria levyllä, siemennetty
  const scratchMat = ink(C.paper, {});
  for (let i = 0; i < 9; i++) {
    const r = R0 + 0.6 + (R1 - R0 - 1.2) * hash1(i * 7 + 1);
    const a0 = hash1(i * 7 + 2) * Math.PI * 2, da = 0.12 + 0.35 * hash1(i * 7 + 3);
    const pts = Array.from({ length: 10 }, (_, k) => [r * Math.cos(a0 + (da * k) / 9), r * Math.sin(a0 + (da * k) / 9)]);
    flat(rot, strokeGeo(pts, 0.05 + 0.04 * hash1(i * 7 + 4)), scratchMat, { z: 0.03 });
  }
  flat(scene, new THREE.RingGeometry(R1, R1 + 0.22, 200), ink(C.black, {}), { z: 0.005 });
  // jaksorajat puolenvaihdon jälkeen (segments.json): levy ottaa kuvan sA:ssa, friisi on kiertynyt kokonaan sB:ssä
  const sA = (S.segs.find((x) => x.a > tE + 1) || { a: tE + 2 }).a;
  const sB = (S.segs.find((x) => x.a > sA + 1) || { a: S.T_END }).a;
  const T_REC = sA;
  function update(t, cam) {
    disc.material.uniforms.uProg.value = smoothstep(tE, sB, t);
    rot.rotation.z = -0.25 * (t - T_REC);
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
