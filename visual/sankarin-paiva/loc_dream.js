// C, unimaa (0:49.8–1:13.0): kuvakäsikirjoituksen rivit 5–6. Mielikuvitus.
// Jouset johtavat: lento metsien ja joen yli pääskyparven perässä. Lennon nopeus seuraa tempoa ja
// voimakkuutta. Joki välkkyy harpun mukana, ja bassoissa lento laskeutuu tummaan metsään.
// Pilvet muotoutuvat Straussin teoksiksi: Don Juanin liekki, käyrätorvien repliikissä Tillin
// narrinlakki ja F-duurissa (1:07.5) Don Quixoten tuulimylly sekä Zarathustran aurinko.

import * as THREE from 'three';
import { C, ink, flat, group, poly, rect, circle, cloud, flame, jesterCap, earleTree, ridgeGeo, skylineGeo, outline, water, swallowShape, sky as makeSky, clamp, smoothstep, mix, hash1, vnoise1 } from './paper.js';
import { ease } from './hero.js';

export function build(K) {
  const { S, seg } = K;
  const A = K.a, B = K.b;
  const scene = new THREE.Scene();
  const SKY = makeSky(scene);
  const tMaj = seg(7);   // 1:07.5 F-duuri
  const tCut = seg(6);   // 1:01.6

  // Lennon kulku: nopeus tempon ja voimakkuuden mukaan, kertymä esilaskettu (puhdas funktio).
  const FPS = 30;
  const n = Math.ceil((B - A + 6) * FPS);
  const xs = new Float32Array(n);
  for (let i = 1; i < n; i++) {
    const t = A - 3 + i / FPS;
    const bpm = S.barPos(t + 0.5) - S.barPos(t - 0.5); // tahteja sekunnissa
    xs[i] = xs[i - 1] + (6 + 10 * bpm * 0.5 + 3 * S.loud(t)) / FPS;
  }
  const camX = (t) => { const f = clamp((t - (A - 3)) * FPS, 0, n - 1); const i = Math.floor(f); const j = Math.min(n - 1, i + 1); return xs[i] + (xs[j] - xs[i]) * (f - i); };
  // korkeus: avainkohdat ajassa, C1-pehmeä
  const YK = [[A - 3, 5], [A, 4.5], [55, 2.4], [58.5, 3.0], [tCut, 7], [64.6, 1.6], [tMaj, 9], [70.5, 15], [B + 3, 17]];
  const camY = (t) => {
    let i = 0;
    while (i < YK.length - 2 && t > YK[i + 1][0]) i++;
    const [t0, y0] = YK[i], [t1, y1] = YK[i + 1];
    return y0 + (y1 - y0) * ease((t - t0) / (t1 - t0));
  };
  const X0 = camX(A), X1 = camX(B + 3) + 80;

  // --- kerrokset ---
  const far = flat(scene, ridgeGeo(X0 - 400, X1 + 900, 46, 21, { lambda: 140, base: -300 }), ink(C.paper, { shade: C.blue, raster: 0.28 }), { z: -220 });
  const mid = flat(scene, ridgeGeo(X0 - 200, X1 + 400, 16, 23, { lambda: 45, base: -120 }), ink(C.blue, { shade: C.paper, raster: 0.12 }), { z: -80 });
  const treeMat = ink(C.blue, { shade: C.black, raster: 0.35 });
  const midTrees = new THREE.Group(); midTrees.position.z = -60; scene.add(midTrees);
  for (let k = 0; k < 140; k++) {
    const x = X0 - 100 + k * ((X1 - X0 + 300) / 140) + 3 * hash1(k);
    flat(midTrees, earleTree(7 + 6 * hash1(k + 1), 2.6 + hash1(k + 2), k), treeMat, { x, y: -3 + 2 * (hash1(k + 3) - 0.5) });
  }
  const riv = water(scene, X1 - X0 + 900, 5, { x: (X0 + X1) / 2, y: -7.5, z: -18, glint: 0.9 });
  const nearMat = ink(C.black, {});
  const nearTrees = new THREE.Group(); nearTrees.position.z = -6; scene.add(nearTrees);
  const nearPts = [];
  for (let i = 0; i <= 700; i++) { const x = X0 - 60 + (i * (X1 - X0 + 200)) / 700; nearPts.push([x, -8.5 + 2.5 * vnoise1(x / 6, 31)]); }
  flat(nearTrees, skylineGeo(nearPts, -60), nearMat, {});
  for (let k = 0; k < 120; k++) {
    const x = X0 - 60 + k * ((X1 - X0 + 200) / 120) + 2 * hash1(k + 50);
    flat(nearTrees, earleTree(5 + 5 * hash1(k + 51), 2.2 + hash1(k + 52), k + 7), nearMat, { x, y: -9 });
  }
  const foreMat = ink(C.black, {});
  const fore = new THREE.Group(); fore.position.z = 5; scene.add(fore);
  for (let k = 0; k < 18; k++) flat(fore, earleTree(16, 3.4, k + 90), foreMat, { x: X0 + 10 + k * ((X1 - X0) / 18) + 6 * hash1(k + 91), y: -16 });
  // pilvet
  const cloudMat = ink(C.paper, { shade: C.blue, raster: 0.12 });
  const clouds = [];
  for (let k = 0; k < 40; k++) {
    const z = -40 - 80 * hash1(k + 200);
    const m = flat(scene, cloud(10 + 14 * hash1(k + 201), 5 + 4 * hash1(k + 202), k), cloudMat, { x: X0 - 50 + k * ((X1 - X0 + 200) / 40), y: 10 + 18 * hash1(k + 203), z });
    clouds.push(m);
  }
  // --- näyt (Straussin teokset) ---
  const at = (t) => camX(t);
  const tFlame = 56.8;
  let tTill = 61.5, hb = 0;
  for (let t = 59; t < 64.5; t += 0.1) { const h = S.fam.horns(t); if (h > hb) { hb = h; tTill = t; } }
  const visMat = (col, r) => ink(C.paper, { shade: col, raster: r });
  const flameM = flat(scene, flame(11, 13), visMat(C.red, 0.55), { x: at(tFlame) + 18, y: 6, z: -50 });
  flat(flameM, outline(flame(11, 13), 0.25), ink(C.red), { z: 0.01 });
  const capG = group(scene, { x: at(tTill - 1) + 9, y: 13.5, z: -26 });
  const capM = flat(capG, jesterCap(6, 4.5), visMat(C.red, 0.3), {});
  flat(capG, outline(jesterCap(6, 4.5), 0.18), ink(C.black), { z: 0.01 });
  const bells = [[-5.7, 3.85], [0, 4.75], [5.7, 3.85]].map(([x, y]) => flat(capG, circle(0.55, 20), ink(C.paper, { shade: C.black, raster: 0.2 }), { x, y, z: 0.02 }));
  // tuulimylly kukkulalla (F-duuri)
  const millX = at(69.5) + 16;
  const mill = group(scene, { x: millX, y: -5.5, z: -24 });
  flat(mill, poly([[-9, -20], [-6, 0.5], [6, 0.8], [10, -20]]), ink(C.blue, { shade: C.black, raster: 0.2 }), { y: -1 });
  flat(mill, poly([[-1.2, 0], [1.2, 0], [0.8, 5.2], [-0.8, 5.2]]), ink(C.paper, { shade: C.blue, raster: 0.2 }), { y: 0 });
  flat(mill, poly([[-1.1, 5.2], [1.1, 5.2], [0, 6.5]]), ink(C.red), {});
  flat(mill, outline(poly([[-1.2, 0], [1.2, 0], [0.8, 5.2], [-0.8, 5.2]]), 0.12), ink(C.black), { z: 0.01 });
  const sails = group(mill, { y: 5.3, z: 0.05 });
  for (let k = 0; k < 4; k++) {
    const s = group(sails); s.rotation.z = (k * Math.PI) / 2;
    flat(s, poly([[-0.08, 0], [0.08, 0], [0.08, 4.6], [-0.08, 4.6]]), ink(C.black), {});
    flat(s, poly([[0.1, 1.2], [1.1, 1.3], [1.0, 4.4], [0.1, 4.5]]), ink(C.paper, { shade: C.black, raster: 0.25 }), { z: -0.01 });
  }
  // pääskyt edellä (viulut)
  const NB = 34;
  const birds = new THREE.InstancedMesh(new THREE.ShapeGeometry(swallowShape()), ink(C.paper), NB);
  const birdsO = new THREE.InstancedMesh(outline(swallowShape(), 0.05), ink(C.black), NB);
  for (const b of [birds, birdsO]) { b.frustumCulled = false; scene.add(b); }
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), zA = new THREE.Vector3(0, 0, 1), pv = new THREE.Vector3(), sv = new THREE.Vector3();
  // harpun väreet joessa: harpun voimistumiset
  const harpEv = [];
  { let last = -9; for (let t = A; t < B; t += 1 / 30) { const h = S.fam.harp(t); if (h > 0.22 && h - S.fam.harp(t - 0.3) > 0.06 && t - last > 0.35) { harpEv.push(t); last = t; } } }

  const camDist = (t) => (t < tCut ? 18 : t < tMaj ? 12.5 : 23);
  const shots = [
    { name: '5 lento metsän ja joen yli', a: A, b: tCut },
    { name: '5 pilvien tasolla: näyt', a: tCut, b: tMaj },
    { name: '6 F-duuri: pilvien läpi valoon', a: tMaj, b: B + 1 },
  ].map((s) => ({ ...s, cam: (u, t) => {
    const x = camX(t), y = camY(t), d = camDist(t);
    const lookY = y - (t < tMaj ? 1.2 : 2.5);
    return { pos: [x, y, d], look: [x + 6, lookY, -10], fov: 42 };
  } }));

  function update(t) {
    const x = camX(t);
    const u = SKY.u;
    u.uTime.value = t;
    const maj = smoothstep(tMaj - 0.8, tMaj + 2.5, t);
    u.uBlueAmt.value = 1;
    u.uBlueH.value = mix(-0.1, 0.55, maj);
    u.uBlackTop.value = 0.35 * (1 - maj);
    u.uRedAmt.value = 0.15 + 0.2 * maj;
    u.uSun.value.set(x + 120, mix(-40, 130, ease(smoothstep(tMaj - 1, tMaj + 4, t))), 24, maj);
    u.uRays.value = 0.35 * maj;
    for (let k = 0; k < 6; k++) u.uBands.value[k] = clamp(S.bands[k](t) * 1.2);
    // pilvet ajelehtivat; F-duurissa ne väistyvät
    clouds.forEach((m, k) => { m.position.x += 0; m.material.uniforms.uRaster.value = mix(0.2, 0.06, maj); });
    // näyt painuvat esiin pisteittäin
    flameM.material.uniforms.uAppear.value = smoothstep(tFlame - 1.5, tFlame + 0.6, t) * (1 - smoothstep(tCut + 1, tCut + 3, t));
    flameM.children.forEach((c) => (c.material.uniforms.uAppear.value = flameM.material.uniforms.uAppear.value));
    const cap = smoothstep(tTill - 1.6, tTill - 0.2, t) * (1 - smoothstep(tMaj + 1.5, tMaj + 3.5, t));
    capG.traverse((o) => { if (o.material) o.material.uniforms.uAppear.value = cap; });
    bells.forEach((b, k) => { b.position.y = [3.85, 4.75, 3.85][k] + 0.25 * Math.sin(t * 9 + k * 2) * S.fam.horns(t); });
    capG.rotation.z = 0.06 * Math.sin(t * 2.2);
    sails.rotation.z = -t * (1.2 + 1.5 * S.loud(t));
    // pääskyt edellä
    const v = S.energy.violins(t);
    for (let i = 0; i < NB; i++) {
      if (hash1(i * 5 + 3) > 0.2 + v) { m4.makeScale(0, 0, 0); birds.setMatrixAt(i, m4); birdsO.setMatrixAt(i, m4); continue; }
      const ox = 9 + 6 * (hash1(i * 7) - 0.5) + 1.5 * Math.sin(t * 0.8 + i);
      const oy = 3 * (hash1(i * 11) - 0.5) + 1.0 * Math.sin(t * 1.3 + i * 1.7) - 0.5;
      const flap = 0.4 + 0.6 * Math.abs(Math.sin(t * 10 + i * 2.3));
      q.setFromAxisAngle(zA, 0.12 * Math.sin(t * 1.3 + i));
      pv.set(x + ox, camY(t) + oy - 1, 2 + 3 * hash1(i * 13));
      sv.set(0.55, 0.55 * flap, 1);
      m4.compose(pv, q, sv);
      birds.setMatrixAt(i, m4); birdsO.setMatrixAt(i, m4);
    }
    birds.instanceMatrix.needsUpdate = true; birdsO.instanceMatrix.needsUpdate = true;
    // joki: välkkeet ja harpun väreet
    riv.u.uTime.value = t;
    riv.u.uGlint.value = 0.5 + 0.8 * S.fam.harp(t);
    riv.rings.forEach((r) => r.set(0, 0, -99, 0));
    let k = 0;
    for (let i = harpEv.length - 1; i >= 0 && k < 16; i--) {
      const te = harpEv[i];
      if (te > t || t - te > 3) continue;
      riv.rings[k++].set(camX(te) + 4 + 14 * (hash1(i * 3) - 0.3), -7.3, te, 1.2 + 0.8 * hash1(i * 5));
    }
    const dim = 0.18 * (1 - maj) + 0.12 * (1 - smoothstep(0.3, 0.7, S.energy.lows(t))) * 0;
    return { dim };
  }
  return { scene, update, shots };
}
