// Ritarin vyö (sash.js): seisoo, polvistuu, ratsailla ja selkäkuva, kolme riviä: amount 1 hiljaa, amount 1 viulun soidessa
// (signal 1) ja amount 0,5 (kietoutuminen kesken). Ritarit ovat paikoillaan; vyö on torson lapsi, joten se seuraa asentoa.
//   node render/render.mjs --page visual/muste/test_sash.html --data build/demo400 --stills 0.5 --dir runs/muste-1230/perusta3
// window.seek(t): t on vain viivan huojunnan vaihe.

import * as THREE from 'three';
import { C, U, createPost } from './ink.js';
import { POSES, KP, horse, poseHorse, knightBack, kpose } from './puppets.js';
import { leader } from './hero.js';
import { group, flat, poly } from './paper.js';
import { ink } from './ink.js';

const W = 1920, H = 1080;
const view = document.getElementById('view');
view.width = W; view.height = H;
const renderer = new THREE.WebGLRenderer({ canvas: view, antialias: false, preserveDrawingBuffer: true, alpha: false });
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.setClearColor(C.paper, 1);
const post = createPost(renderer, W, H);
const scene = new THREE.Scene();
scene.background = C.paper.clone();
const cam = new THREE.OrthographicCamera(-16, 16, 9, -9, 0.1, 100);
cam.position.set(0, 0, 20);
cam.lookAt(0, 0, 0);

const ROWS = [{ amount: 1, signal: 0, name: 'amount 1, viulu vaiti' }, { amount: 1, signal: 1, name: 'amount 1, viulu soi' }, { amount: 0.5, signal: 0.4, name: 'amount 0,5 (kietoutuu)' }];
const COLS = ['seisoo', 'polvistuu', 'ratsailla', 'selkäkuva'];
const ROWY = [3.2, -1.2, -5.4];
const wind = () => ({ x: -0.8, y: 0.2 });
const cells = [];
ROWS.forEach((row, r) => COLS.forEach((name, c) => {
  const x = -12 + c * 8, y = ROWY[r];
  const cell = { row, name, x, y };
  if (name === 'selkäkuva') {
    cell.B = knightBack(scene);
    cell.B.root.position.set(x, y, 0);
    cell.B.hold(0.3, 0.05);
  } else {
    cell.L = leader(scene, {});
    if (name === 'ratsailla') {
      cell.H = horse(scene, { mane: C.red });
      cell.H.root.position.set(x, y, -0.2);
      poseHorse(cell.H, 'walk', 0.4, 0.6);
    }
  }
  cells.push(cell);
}));
const labels = document.getElementById('labels');
COLS.forEach((n, c) => { const d = document.createElement('div'); d.className = 'lbl'; d.style.left = `${(c * 8 + 4) * 60 - 130}px`; d.style.top = '8px'; d.style.width = '260px'; d.textContent = n; labels.appendChild(d); });
ROWS.forEach((r, i) => { const d = document.createElement('div'); d.className = 'lbl'; d.style.left = '8px'; d.style.top = `${(9 - ROWY[i]) * 60 - 150}px`; d.style.textAlign = 'left'; d.textContent = r.name; labels.appendChild(d); });

window.seek = (t) => {
  for (const c of cells) {
    const sash = { t0: 0, amount: () => c.row.amount };
    const sig = () => c.row.signal;
    if (c.B) {
      c.B.M.cape.uniforms.uTime.value = t; c.B.M.cape.uniforms.uAmp.value = 0.1;
      c.B.sash.set(t, sash, sig);
      continue;
    }
    const pose = c.name === 'seisoo' ? POSES.seisonta(0.5) : c.name === 'polvistuu' ? POSES.polvistuminen(1) : { ...kpose({ ...KP.ride }), mounted: true };
    const y = c.name === 'ratsailla' ? c.y + 1.2 : c.y;
    const x = c.name === 'ratsailla' ? c.x + 0.1 : c.x;
    c.L.place(t, () => ({ x, y, z: 0, facing: 1, pose }), wind, { capeWind: 0.3, noLance: true, noBanner: true, sash, sashSignal: sig });
  }
  U.uDim.value = 0; U.uMis.value = 0;
  renderer.setRenderTarget(post.rtA);
  renderer.render(scene, cam);
  const u = post.uniforms;
  u.uMix.value = 0; u.uGrain.value = 0.05; u.uMis.value = 0; u.uPaper.value = 0; u.uTitle.value = 0; u.uWood.value = 0; u.uFlash.value = 0; u.uShake.value = 0; u.uSk.value = 0;
  for (const d of post.dust) d.set(0, 0, 0, 0);
  post.render();
  return true;
};
window.contextOk = () => true;
window.duration = 1;
window.sceneReady = true;
