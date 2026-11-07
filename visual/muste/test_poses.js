// Asentokirjaston tarkistussivu: kaikki asennot (puppets.js POSES) rinnakkain, keihäs ja viiri mukana.
// Kolme riviä: vaihe u = 0, 0,5 ja 1. Jokaisen asennon alle tulee mitattu ote (yksikköä):
//   k = lähemmän kämmenen etäisyys keihään varresta, f = kauemman kämmenen etäisyys varresta tai vartalosta
//   (pienempi), raja 0,05. Soutu-asennossa varsi on airo (hankain, lapa veden alla). Luvut myös konsoliin
//   (console.table) ja window.poseTable:iin. Mittaus luetaan näkymäpuusta (kämmenten maailmanpaikat ja
//   keihään matrixWorld), ei FK:sta.
//   node render/render.mjs --page visual/muste/test_poses.html --data build/demo400 --stills 0.5 --dir runs/muste-1230/perusta2
// window.seek(t), duration = 1, sceneReady; muste-kohtauksen rajapinnat (camProbe ym.) eivät ole tässä.

import * as THREE from 'three';
import { C, U, createPost } from './ink.js';
import { ink, flat, poly, rect } from './paper.js';
import { POSES, POSE_NAMES, OAR, oarDir, knightBack, bodyDist, backGrip } from './puppets.js';
import { leader, GRIP_BELOW } from './hero.js';

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

const N = POSE_NAMES.length;
const COLW = 32 / N;
const US = [0, 0.5, 1];
const ROWY = [3.6, -2.3, -8.2];   // jalkojen korkeus riveittäin (keihäs yltää noin +4,5 ylemmäs)
const ROWPX = ROWY.map((y) => (9 - y) * 60 + 8);   // lukujen korkeus pikseleinä jalkojen alla (ruutu 60 px/yksikkö)
const oarMat = ink(C.black);
const rows = US.map((u, r) => POSE_NAMES.map((name, i) => {
  const L = leader(scene, {});
  const B = knightBack(scene);
  B.root.visible = false;
  flat(B.lance, rect(0.05, 3.4 + GRIP_BELOW, 0.5, 0), ink(C.black), { y: -GRIP_BELOW });
  const x = -16 + COLW * (i + 0.5), y = ROWY[r];
  let oar = null;
  if (name === 'soutu') {
    // airo: hankain nuken omissa koordinaateissa, varsi sisään (kädet) ja ulos (lapa)
    oar = new THREE.Group();
    scene.add(oar);
    flat(oar, rect(0.06, OAR.inboard + 2.6, 0.5, 2.6 / (OAR.inboard + 2.6)), oarMat, { z: 0.06 });
    flat(oar, poly([[-0.12, -2.6], [0.12, -2.6], [0.1, -OAR.outboard], [-0.1, -OAR.outboard]]), oarMat, { z: 0.06 });
  }
  return { name, u, L, B, x, y, oar, cell: null };
}));
const labels = document.getElementById('labels');
POSE_NAMES.forEach((name, i) => {
  const d = document.createElement('div');
  d.className = 'lbl';
  d.style.left = `${(i * W) / N}px`; d.style.top = '8px'; d.style.width = `${W / N}px`;
  d.textContent = name.replace(/_/g, ' ');
  labels.appendChild(d);
});
const cellEls = rows.map((row, r) => row.map((c, i) => {
  const d = document.createElement('div');
  d.className = 'num';
  d.style.left = `${(i * W) / N}px`; d.style.top = `${ROWPX[r]}px`; d.style.width = `${W / N}px`;
  labels.appendChild(d);
  return d;
}));
US.forEach((u, r) => {
  const d = document.createElement('div');
  d.className = 'row'; d.style.top = `${ROWPX[r] - 28}px`; d.textContent = `u = ${u}`;
  labels.appendChild(d);
});

const wind = () => ({ x: -0.8, y: 0.2 });
const segD = (p, a, b) => {
  const ex = b[0] - a[0], ey = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * ex + (p[1] - a[1]) * ey) / (ex * ex + ey * ey)));
  return Math.hypot(p[0] - a[0] - t * ex, p[1] - a[1] - t * ey);
};
const f2 = (x) => x.toFixed(3);

function show() {
  const table = [];
  rows.forEach((row, r) => {
    row.forEach((c, i) => {
      const pose = POSES[c.name](c.u);
      const back = pose.back ?? 0;
      const isOar = c.name === 'soutu';
      const state = () => ({ x: c.x, y: c.y, z: 0, facing: 1, pose, lanceAng: pose.lanceAng });
      // soutussa keihäs on laiturilla: airo on esine kädessä
      c.L.place(0, state, wind, { capeWind: 0.3, noLance: back > 0.5 || isOar, noBanner: back > 0.5 || isOar });
      c.L.P.root.visible = back <= 0.5;
      c.B.root.visible = back > 0.5;
      let rec;
      if (back > 0.5) {
        c.B.root.position.set(c.x, c.y, 0);
        c.B.root.scale.set(Math.max(0.1, back), 1, 1);
        c.B.M.cape.uniforms.uTime.value = 0; c.B.M.cape.uniforms.uAmp.value = 0.1;
        c.B.hold(0.3, 0.05);
        const g = backGrip(c.B, GRIP_BELOW, 3.4);
        rec = { tyyppi: 'keihäs selkäkuva', lahempi: g.lahempi, kauempi: null };
      } else if (isOar) {
        c.oar.position.set(c.x + OAR.lock[0], c.y + OAR.lock[1], 0);
        c.oar.rotation.z = pose.oarAng;
        scene.updateMatrixWorld(true);
        const v = new THREE.Vector3();
        const hand = (n) => { (n ? c.L.P.handN : c.L.P.handF).getWorldPosition(v); return [v.x, v.y]; };
        const end = (y) => { v.set(0, y, 0).applyMatrix4(c.oar.matrixWorld); return [v.x, v.y]; };
        const a = end(OAR.inboard), b = end(-OAR.outboard);
        const k = segD(hand(true), a, b), fv = segD(hand(false), a, b);
        c.L.lance.visible = false;
        rec = { tyyppi: 'airo', lahempi: k, kauempi: fv, kauempi_varsi: fv, kauempi_vartalo: bodyDist(c.L.P, hand(false)), lapa_alle: -(b[1] - c.y) };
      } else {
        const g = c.L.grip();
        const fs = segD(g.far, g.a, g.b), fb = bodyDist(c.L.P, g.far);
        rec = { tyyppi: 'keihäs', lahempi: segD(g.near, g.a, g.b), kauempi: Math.min(fs, fb), kauempi_varsi: fs, kauempi_vartalo: fb };
      }
      rec.pose = c.name; rec.u = c.u;
      rec.ok = rec.lahempi <= 0.05 && (rec.kauempi === null || rec.kauempi <= 0.05);
      table.push(rec);
      cellEls[r][i].className = 'num' + (rec.ok ? '' : ' bad');
      cellEls[r][i].textContent = `k ${f2(rec.lahempi)}${rec.kauempi === null ? '' : ' f ' + f2(rec.kauempi)}${rec.tyyppi === 'airo' ? ' (airo)' : rec.tyyppi === 'keihäs selkäkuva' ? ' (selkä)' : ''}`;
    });
  });
  return table;
}

window.seek = () => {
  const table = show();
  window.poseTable = table;
  if (!window.__logged) { window.__logged = true; console.log(JSON.stringify(table.map((r) => ({ asento: r.pose, u: r.u, tyyppi: r.tyyppi, k: +r.lahempi.toFixed(4), f: r.kauempi === null ? null : +r.kauempi.toFixed(4), ok: r.ok })))); }
  U.uDim.value = 0; U.uMis.value = 0;
  renderer.setRenderTarget(post.rtA);
  renderer.render(scene, cam);
  const u = post.uniforms;
  u.uMix.value = 0; u.uGrain.value = 0.05; u.uMis.value = 0; u.uPaper.value = 0; u.uTitle.value = 0; u.uWood.value = 0; u.uFlash.value = 0; u.uShake.value = 0;
  for (const d of post.dust) d.set(0, 0, 0, 0);
  post.render();
  return true;
};
window.contextOk = () => true;
window.duration = 1;
window.sceneReady = true;
