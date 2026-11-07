// A-levy (kohtaus 65): esittelyn friisi kiertyy levyn uraksi. Renkaat ovat A-puolen väripartituuri
// ulkoa sisään: aamunkoi, sameus, iltarusko, yö ja keskellä taistelun musta ja punainen (tyyli, luku 6).
// Renkaiden leveys on jaksojen kesto (friisin leveys on verrannollinen aikaan).

import * as THREE from 'three';
import { C, U, HALFTONE, ink, flat, circle } from './paper.js';
import { smoothstep } from '../util.js';

const FS = /* glsl */ `
  uniform float uCell, uR0, uR1;
  uniform vec4 uB;            // jaksorajat säteinä (0..1 ulkoa sisään)
  uniform vec3 uBlack, uBlue, uPaper, uRed;
  varying vec3 vW;
  ${HALFTONE}
  void main() {
    float r = length(vW.xy);
    float u = clamp((uR1 - r) / (uR1 - uR0), 0.0, 1.0);   // 0 ulkoreuna (alku), 1 sisäreuna (loppu)
    vec3 c;
    if (u < uB.x) c = mix(uBlue, uPaper, halftone(0.25 + 0.6 * u / uB.x, 0.26, uCell));          // aamunkoi -> kerma
    else if (u < uB.y) c = mix(uBlack, uRed, halftone(0.35, 1.31, uCell));                          // sameus
    else if (u < uB.z) c = mix(uBlue, uRed, halftone(0.45, 0.52, uCell));                           // iltarusko
    else if (u < uB.w) c = mix(uBlack, uBlue, halftone(0.5, 0.26, uCell));                          // yö
    else c = mix(uBlack, uRed, halftone(0.55, 0.785, uCell));                                       // taistelu
    float gr = abs(fract(r * 6.0) - 0.5);
    c = mix(c, uBlack, (1.0 - smoothstep(0.08, 0.14, gr)) * 0.35);
    gl_FragColor = vec4(c, 1.0);
  }
`;

export function buildRecord(S, A) {
  const scene = new THREE.Scene();
  scene.background = C.paper.clone();
  const R1 = 15, R0 = 5.2;
  const T0 = S.T0, tE = A('wal_puolenvaihto');
  const f = (t) => (t - T0) / (tE - T0);
  const disc = new THREE.Mesh(new THREE.RingGeometry(R0, R1, 200, 1), new THREE.ShaderMaterial({
    uniforms: {
      uCell: U.uCell, uR0: { value: R0 }, uR1: { value: R1 },
      uB: { value: new THREE.Vector4(f(S.T_WID), f(A('gef_viulu')), f(A('gef_rakkaus')), f(A('wal_kulissi1'))) },
      uBlack: { value: C.black }, uBlue: { value: C.blue }, uPaper: { value: C.paper }, uRed: { value: C.red },
    },
    vertexShader: 'varying vec3 vW; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: FS,
  }));
  scene.add(disc);
  flat(scene, circle(R0, 80), ink(C.red, {}), { z: 0.01 });
  flat(scene, circle(R0 * 0.82, 80), ink(C.red, { shade: C.paper, raster: 0.2 }), { z: 0.012 });
  flat(scene, circle(0.3, 20), ink(C.paper, {}), { z: 0.02 });
  const ring = flat(scene, new THREE.RingGeometry(R1, R1 + 0.25, 160), ink(C.black, {}), { z: 0.005 });
  void ring;
  const T_REC = tE + 3.5;
  function update(t, cam) {
    disc.rotation.z = -0.25 * (t - T_REC);
    const u = smoothstep(T_REC - 1, S.T_END, t);
    cam.position.set(0, -6 + 4 * u, 34 + 10 * u);
    cam.up.set(0, 1, 0);
    cam.lookAt(0, 0, 0);
    cam.fov = 40;
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld(true);
  }
  return { scene, update };
}
