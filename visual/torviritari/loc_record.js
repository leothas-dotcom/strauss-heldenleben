// A, levy (0:00–0:07.6): kuvakäsikirjoituksen rivi 0.
// Levy edestä kuin paperileike. Äänivarsi kääntyy levylle, ja neula laskeutuu (varjo sulautuu
// varteen) ensimmäisen naksahduksen kohdalla. Kamera sukeltaa uraan: urien kaaret täyttävät
// kuvan ja rasteriliukuma vaihtaa ne laakson vuorenharjoiksi.

import * as THREE from 'three';
import { C, U, HALFTONE, ink, flat, group, poly, circle, rect, clamp, smoothstep } from './paper.js';
import { camPath, ease } from './hero.js';

const DISC_FS = /* glsl */ `
  uniform float uCell, uDim;
  uniform vec3 uBlack, uBlue, uPaper;
  varying vec3 vW;
  ${HALFTONE}
  void main() {
    vec2 p = vW.xy;
    float r = length(p);
    float gr = r * 7.0;
    float g = abs(fract(gr) - 0.5);
    float w = fwidth(gr);
    float line = (1.0 - smoothstep(0.12, 0.12 + w, g)) * (1.0 - smoothstep(0.3, 0.6, w));
    float a = atan(p.y, p.x);
    float sheen = pow(abs(cos(a - 0.8)), 18.0);
    vec3 c = mix(uBlack, uBlue, line * (0.5 + 0.5 * sheen));
    c = mix(c, uPaper, line * sheen * 0.7);
    c = mix(c, vec3(0.12, 0.1, 0.095), halftone(uDim * 0.9, 0.785, uCell));
    gl_FragColor = vec4(c, 1.0);
  }
`;

function labelTex() {
  const S = 1024;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const g = cv.getContext('2d');
  g.fillStyle = '#F5461A';
  g.fillRect(0, 0, S, S);
  g.strokeStyle = '#E8DCC6';
  g.lineWidth = 6;
  for (const rr of [0.47, 0.33]) { g.beginPath(); g.arc(S / 2, S / 2, S * rr, 0, Math.PI * 2); g.stroke(); }
  g.fillStyle = '#E8DCC6';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = '700 54px Georgia';
  const text = ' EIN HELDENLEBEN  ·  OP. 40  ·  RICHARD STRAUSS  ·  A  · ';
  const chars = [...text];
  const total = chars.reduce((s, ch) => s + g.measureText(ch).width, 0);
  let a = -Math.PI / 2;
  for (const ch of chars) {
    const w = (g.measureText(ch).width / total) * Math.PI * 2 * 0.98;
    a += w / 2;
    g.save();
    g.translate(S / 2 + S * 0.4 * Math.cos(a), S / 2 + S * 0.4 * Math.sin(a));
    g.rotate(a + Math.PI / 2);
    g.fillText(ch, 0, 0);
    g.restore();
    a += w / 2;
  }
  g.font = 'italic 44px Georgia';
  g.fillText('Wiener Philharmoniker', S / 2, S * 0.7);
  g.fillText('Clemens Krauss', S / 2, S * 0.75);
  g.font = '700 70px Georgia';
  g.fillText('33⅓', S / 2, S * 0.28);
  return new THREE.CanvasTexture(cv);
}

export function build(K) {
  const { S } = K;
  const scene = new THREE.Scene();
  scene.background = C.black.clone();
  const R = 15;
  const disc = new THREE.Mesh(new THREE.CircleGeometry(R, 160), new THREE.ShaderMaterial({
    uniforms: { uCell: U.uCell, uDim: U.uDim, uBlack: { value: C.black }, uBlue: { value: C.blue }, uPaper: { value: C.paper } },
    vertexShader: 'varying vec3 vW; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: DISC_FS,
  }));
  scene.add(disc);
  const label = new THREE.Mesh(new THREE.CircleGeometry(5, 80), new THREE.MeshBasicMaterial({ map: labelTex() }));
  label.position.z = 0.01;
  scene.add(label);
  flat(scene, circle(0.25, 20), ink(C.paper, { shade: C.blue, raster: 0.4 }), { z: 0.02 });
  // levysoittimen kansi: paperinvalkoinen alusta levyn ympärillä
  const plinth = flat(scene, rect(70, 50), ink(C.paper, { shade: C.blue, raster: 0.18 }), { z: -0.05, x: 6 });
  void plinth;
  // äänivarsi: jalusta oikealla ylhäällä, varsi kääntyy nivelen ympäri
  const PIV = [19.5, 11];
  const base = group(scene, { x: PIV[0], y: PIV[1], z: 0.5 });
  flat(base, circle(2.2, 40), ink(C.black, {}), {});
  flat(base, circle(1.5, 40), ink(C.paper, { shade: C.blue, raster: 0.35 }), { z: 0.01 });
  const arm = group(base, { z: 0.05 });
  const armLen = Math.hypot(PIV[0] - 14.3 * Math.cos(-0.35), PIV[1] - 14.3 * Math.sin(-0.35));
  flat(arm, rect(0.32, armLen, 0.5, 1), ink(C.paper, { shade: C.blue, raster: 0.25 }), {});
  flat(arm, rect(1.6, 1.0, 0.5, 0.5), ink(C.black, {}), { y: 0.9 });
  const head = group(arm, { y: -armLen, z: 0.02 });
  flat(head, rect(0.9, 1.3, 0.5, 0.5), ink(C.paper, { shade: C.blue, raster: 0.25 }), {});
  flat(head, rect(0.3, 0.45, 0.5, 0.5), ink(C.black, {}), { y: -0.3, z: 0.01 });
  // varjo: nostettu varsi heittää varjon sivuun, laskeutuessa varjo sulautuu varteen
  const shadow = group(scene, { x: PIV[0], y: PIV[1], z: 0.3 });
  const shArm = group(shadow);
  flat(shArm, rect(0.36, armLen, 0.5, 1), ink(C.black, { shade: C.blue, raster: 0.3 }), {});
  flat(shArm, rect(0.95, 1.35, 0.5, 0.5), ink(C.black, { shade: C.blue, raster: 0.3 }), { y: -armLen });

  const T_N = S.T_NEEDLE;
  const shots = [
    { name: 'urat ja varsi', a: 0, b: T_N + 0.1, cam: camPath([{ pos: [7, 1, 24], look: [9, 4, 0], fov: 40 }, { pos: [10, 2.5, 19], look: [12, 4, 0], fov: 40 }]) },
    { name: 'sukellus uraan', a: T_N + 0.1, b: S.T0 + 1, cam: (u) => camPath([{ pos: [10, 2.5, 19], look: [12, 4, 0], fov: 40 }, { pos: [12.0, -4.6, 5], look: [12.3, -5.6, 0], fov: 38 }, { pos: [12.05, -5.85, 0.9], look: [12.2, -5.95, 0], fov: 32 }])(u * 0.92) },
  ];
  const spin = (t) => -3.49 * t;

  function update(t) {
    label.rotation.z = spin(t);
    // varsi kääntyy levylle 0,8–2,9 s; laskeutuu naksahduksessa
    const swing = ease(smoothstep(0.8, T_N - 0.3, t));
    const angRest = 0.55, angPlay = Math.atan2(14.3 * Math.cos(-0.35) - PIV[0], -(14.3 * Math.sin(-0.35) - PIV[1]));
    const ang = angRest + (angPlay - angRest) * swing;
    arm.rotation.z = ang;
    shArm.rotation.z = ang;
    const lift = 1 - smoothstep(T_N - 0.35, T_N, t);
    shadow.position.set(PIV[0] + 0.9 * lift, PIV[1] - 0.6 * lift, 0.3);
    arm.scale.set(1 + 0.04 * lift, 1 + 0.04 * lift, 1);
    const dim = t < T_N ? 0.35 : 0.35 - 0.2 * smoothstep(T_N, S.T0, t);
    return { dim };
  }
  return { scene, update, shots };
}
