// C, mielikuvituksen joki: kuvakäsikirjoituksen otot 7–9 (ankkurit held_lyyrinen ... held_t34).
//   7 Puupuhaltimet ja harput tulevat: pääskyparvi syntyy kaislikosta, joki välkkyy harpun mukana.
//   8 Pääskyparit liitävät veden pinnassa (siivet lyövät nuotinaluissa); ritarin viiri kaukana
//     rannalla aaltoilee käyrätorvien laulun mukana; pilviin muotoutuvat tulevien teosten unet.
//   9 Uusi aalto: harppurenkaat ja tuuli; tuulimylly ja aurinko pilvien raosta.

import * as THREE from 'three';
import { C, ink, flat, group, poly, circle, cloud, flame, jesterCap, earleTree, ridgeGeo, skylineGeo, outline, water, swallowShape, sky as makeSky, clamp, smoothstep, mix, hash1, vnoise1 } from './paper.js';
import { leader, ease } from './hero.js';
import { KP } from './puppets.js';

export function build(K) {
  const { S } = K;
  const A = K.a, B = K.b;
  const tPairs = S.A('held_t25').t;
  const tWave = S.A('held_t31').t;
  const scene = new THREE.Scene();
  const SKY = makeSky(scene);

  // Lennon kulku: nopeus tempon ja voimakkuuden mukaan, kertymä esilaskettu (puhdas funktio).
  const FPS = 30;
  const n = Math.ceil((B - A + 6) * FPS);
  const xs = new Float32Array(n);
  for (let i = 1; i < n; i++) {
    const t = A - 3 + i / FPS;
    const bps = S.barPos(t + 0.5) - S.barPos(t - 0.5);
    xs[i] = xs[i - 1] + (6 + 5 * bps + 3 * S.loud(t)) / FPS;
  }
  const camX = (t) => { const f = clamp((t - (A - 3)) * FPS, 0, n - 1); const i = Math.floor(f); const j = Math.min(n - 1, i + 1); return xs[i] + (xs[j] - xs[i]) * (f - i); };
  // korkeus: nousee parven mukana, laskeutuu veden pintaan pareille, nousee aallossa
  const YK = [[A - 3, 3], [A, 2.4], [A + 5, 7], [tPairs - 0.5, 6], [tPairs + 2.5, 1.6], [tWave - 1, 2.2], [tWave + 3, 8], [B + 3, 11]];
  const camY = (t) => {
    let i = 0;
    while (i < YK.length - 2 && t > YK[i + 1][0]) i++;
    const [t0, y0] = YK[i], [t1, y1] = YK[i + 1];
    return y0 + (y1 - y0) * ease((t - t0) / (t1 - t0));
  };
  const X0 = camX(A), X1 = camX(B + 3) + 80;

  // --- kerrokset ---
  flat(scene, ridgeGeo(X0 - 400, X1 + 900, 46, 21, { lambda: 140, base: -300 }), ink(C.paper, { shade: C.blue, raster: 0.28 }), { z: -220 });
  flat(scene, ridgeGeo(X0 - 200, X1 + 400, 16, 23, { lambda: 45, base: -120 }), ink(C.blue, { shade: C.paper, raster: 0.12 }), { z: -80 });
  const treeMat = ink(C.blue, { shade: C.black, raster: 0.35 });
  const midTrees = new THREE.Group(); midTrees.position.z = -60; scene.add(midTrees);
  for (let k = 0; k < 140; k++) {
    const x = X0 - 100 + k * ((X1 - X0 + 300) / 140) + 3 * hash1(k);
    flat(midTrees, earleTree(7 + 6 * hash1(k + 1), 2.6 + hash1(k + 2), k), treeMat, { x, y: -3 + 2 * (hash1(k + 3) - 0.5) });
  }
  const riv = water(scene, X1 - X0 + 900, 9, { x: (X0 + X1) / 2, y: -6.2, z: -14, glint: 0.9 });
  // kaislikko etualalla (parvi syntyy täältä)
  const reedMat = ink(C.black, {});
  const reeds = new THREE.Group(); reeds.position.z = -4; scene.add(reeds);
  for (let k = 0; k < 160; k++) {
    const x = X0 - 40 + k * 0.9 + 0.6 * hash1(k + 300);
    const h = 2.5 + 3 * hash1(k + 301);
    flat(reeds, poly([[-0.05, 0], [0.05, 0], [0.02 + 0.3 * (hash1(k + 302) - 0.5), h]]), reedMat, { x, y: -9.5 });
  }
  const nearMat = ink(C.black, {});
  const nearPts = [];
  for (let i = 0; i <= 700; i++) { const x = X0 - 60 + (i * (X1 - X0 + 200)) / 700; nearPts.push([x, -10 + 1.5 * vnoise1(x / 6, 31)]); }
  flat(scene, skylineGeo(nearPts, -60), nearMat, { z: -2 });
  // vastaranta: ritari viireineen (kaukana, pieni)
  const shoreX = camX(tPairs) + 34;
  const shore = flat(scene, poly([[shoreX - 30, -6.4], [shoreX - 12, -4.6], [shoreX - 2, -3.4], [shoreX + 6, -3.2], [shoreX + 16, -4.8], [shoreX + 40, -6.4], [shoreX + 40, -9], [shoreX - 30, -9]]), ink(C.blue, { shade: C.black, raster: 0.4 }), { z: -16 });
  void shore;
  const knightG = group(scene, { x: shoreX + 2, y: -3.3, z: -15.5 });
  knightG.scale.setScalar(0.55);
  const L = leader(knightG, {});
  // pilvet ja tulevien teosten unet
  const cloudMat = ink(C.paper, { shade: C.blue, raster: 0.12 });
  for (let k = 0; k < 40; k++) {
    flat(scene, cloud(10 + 14 * hash1(k + 201), 5 + 4 * hash1(k + 202), k), cloudMat, { x: X0 - 50 + k * ((X1 - X0 + 200) / 40), y: 12 + 16 * hash1(k + 203), z: -40 - 80 * hash1(k + 200) });
  }
  const at = (t) => camX(t);
  const tFlame = tPairs + 1.0;
  const tTill = S.barStart(28);         // käyrätorvet III-IV f (partituuri s. 6, T. 28)
  const visMat = (col, r) => ink(C.paper, { shade: col, raster: r });
  const flameM = flat(scene, flame(11, 13), visMat(C.red, 0.55), { x: at(tFlame) + 22, y: 9, z: -50 });
  flat(flameM, outline(flame(11, 13), 0.25), ink(C.red), { z: 0.01 });
  const capG = group(scene, { x: at(tTill) + 12, y: 14, z: -30 });
  flat(capG, jesterCap(6, 4.5), visMat(C.red, 0.3), {});
  flat(capG, outline(jesterCap(6, 4.5), 0.18), ink(C.black), { z: 0.01 });
  const bells = [[-5.7, 3.85], [0, 4.75], [5.7, 3.85]].map(([x, y]) => flat(capG, circle(0.55, 20), ink(C.paper, { shade: C.black, raster: 0.2 }), { x, y, z: 0.02 }));
  const millX = at(tWave + 2) + 18;
  const mill = group(scene, { x: millX, y: -4.5, z: -24 });
  flat(mill, poly([[-9, -20], [-6, 0.5], [6, 0.8], [10, -20]]), ink(C.blue, { shade: C.black, raster: 0.2 }), { y: -1 });
  flat(mill, poly([[-1.2, 0], [1.2, 0], [0.8, 5.2], [-0.8, 5.2]]), ink(C.paper, { shade: C.blue, raster: 0.2 }), {});
  flat(mill, poly([[-1.1, 5.2], [1.1, 5.2], [0, 6.5]]), ink(C.red), {});
  const sails = group(mill, { y: 5.3, z: 0.05 });
  for (let k = 0; k < 4; k++) {
    const s = group(sails); s.rotation.z = (k * Math.PI) / 2;
    flat(s, poly([[-0.08, 0], [0.08, 0], [0.08, 4.6], [-0.08, 4.6]]), ink(C.black), {});
    flat(s, poly([[0.1, 1.2], [1.1, 1.3], [1.0, 4.4], [0.1, 4.5]]), ink(C.paper, { shade: C.black, raster: 0.25 }), { z: -0.01 });
  }
  // pääskyt = puupuhaltimet
  const NB = 34;
  const birds = new THREE.InstancedMesh(new THREE.ShapeGeometry(swallowShape()), ink(C.paper), NB);
  const birdsO = new THREE.InstancedMesh(outline(swallowShape(), 0.05), ink(C.black), NB);
  for (const b of [birds, birdsO]) { b.frustumCulled = false; scene.add(b); }
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), zA = new THREE.Vector3(0, 0, 1), pv = new THREE.Vector3(), sv = new THREE.Vector3();
  // nuotinalut: siipien lyönnit ja harppurenkaat
  const ons = S.onsetsIn(A - 0.5, B + 1);
  const harpOns = ons.filter((o) => S.fam.harp(o) > 0.22);
  const flapAt = (t) => ons.reduce((s, o) => s + S.pulse(t, o, 0.13), 0);

  const shots = [
    { name: '7 lento: parvi syntyy kaislikosta', a: A, b: tPairs },
    { name: '8 pääskyparit veden pinnassa, viiri rannalla', a: tPairs, b: tWave },
    { name: '9 uusi aalto: renkaat, tuulimylly, aurinko', a: tWave, b: B + 1.5 },
  ].map((s) => ({ ...s, cam: (u, t) => {
    const x = camX(t), y = camY(t);
    const d = t < tPairs ? 17 : t < tWave ? 13 : 20;
    return { pos: [x, y, d], look: [x + 6, y - 1.6, -10], fov: 42 };
  } }));

  function update(t) {
    const x = camX(t);
    const u = SKY.u;
    u.uTime.value = t;
    const wave = smoothstep(tWave - 0.8, tWave + 3, t);
    u.uBlueAmt.value = 1;
    u.uBlueH.value = mix(0.15, 0.55, wave);
    u.uBlackTop.value = 0.12 * (1 - wave);
    u.uRedAmt.value = 0.25 + 0.15 * wave;
    u.uSun.value.set(x + 120, mix(20, 130, ease(smoothstep(tWave, B + 2, t))), 24, 1);
    u.uRays.value = 0;
    // unet painuvat esiin pisteittäin
    const fA = smoothstep(tFlame - 1.5, tFlame + 0.6, t) * (1 - smoothstep(tWave, tWave + 2, t));
    flameM.material.uniforms.uAppear.value = fA;
    flameM.children.forEach((c) => (c.material.uniforms.uAppear.value = fA));
    const cap = smoothstep(tTill - 1.2, tTill + 0.2, t) * (1 - smoothstep(B - 1, B + 1, t));
    capG.traverse((o) => { if (o.material) o.material.uniforms.uAppear.value = cap; });
    const hornP = flapAt(t);
    bells.forEach((b, k) => { b.position.y = [3.85, 4.75, 3.85][k] + 0.2 * Math.sin(t * 9 + k * 2) * clamp(hornP); });
    capG.rotation.z = 0.06 * Math.sin(t * 2.2);
    sails.rotation.z = -t * (0.8 + 1.2 * S.loud(t));
    // ritari rannalla: viiri aaltoilee käyrätorvien mukana
    L.place(t, () => ({ x: 0, y: 0, z: 0, facing: 1, pose: { ...KP.lanceUp, aN: 2.2 + 0.25 * Math.sin(t * 0.7) } }),
      () => ({ x: -(0.8 + 1.6 * S.energy.horns(t)), y: 0.4 }), { capeWind: 0.4 });
    // pääskyt: syntyvät kaislikosta, sitten parit veden pinnassa
    const born = smoothstep(A - 0.2, A + 3.5, t);
    const pairs = smoothstep(tPairs - 0.5, tPairs + 2, t);
    const winds = clamp(0.35 + S.fam.winds(t));
    const fl = flapAt(t);
    for (let i = 0; i < NB; i++) {
      const pairsN = i < 8;
      const show = pairs > 0.5 ? (pairsN || hash1(i * 5 + 3) < 0.3 * winds) : hash1(i * 5 + 3) < born * winds;
      if (!show) { m4.makeScale(0, 0, 0); birds.setMatrixAt(i, m4); birdsO.setMatrixAt(i, m4); continue; }
      const rise = clamp((t - A - hash1(i * 7) * 1.5) / 2.5);
      let ox = 8 + 7 * (hash1(i * 7) - 0.5) + 1.5 * Math.sin(t * 0.8 + i);
      let oy = mix(-8.5, 1.5 + 3 * (hash1(i * 11) - 0.5), ease(rise)) + Math.sin(t * 1.3 + i * 1.7);
      if (pairsN && pairs > 0) {
        const pr = Math.floor(i / 2), side = i % 2;
        ox = mix(ox, 5 + pr * 4 + 0.9 * side + 0.6 * Math.sin(t * 1.1 + pr), pairs);
        oy = mix(oy, -4.3 + 0.5 * side + 0.35 * Math.sin(t * 1.6 + pr * 2), pairs);
      }
      const flap = 0.35 + 0.45 * Math.abs(Math.sin(t * 6 + i * 2.3)) + 0.5 * clamp(fl);
      q.setFromAxisAngle(zA, 0.12 * Math.sin(t * 1.3 + i));
      pv.set(x + ox, camY(t) + oy - 1, 2 + 3 * hash1(i * 13));
      sv.set(0.55, 0.55 * Math.min(1.2, flap), 1);
      m4.compose(pv, q, sv);
      birds.setMatrixAt(i, m4); birdsO.setMatrixAt(i, m4);
    }
    birds.instanceMatrix.needsUpdate = true; birdsO.instanceMatrix.needsUpdate = true;
    // joki: välkkeet ja harpun renkaat nuotinaluissa
    riv.u.uTime.value = t;
    riv.u.uGlint.value = 0.5 + 0.8 * S.fam.harp(t);
    riv.rings.forEach((r) => r.set(0, 0, -99, 0));
    let k = 0;
    for (let i = harpOns.length - 1; i >= 0 && k < 16; i--) {
      const te = harpOns[i];
      if (te > t + S.LEAD || t - te > 3) continue;
      riv.rings[k++].set(camX(te) + 4 + 14 * (hash1(i * 3) - 0.3), -6.0, te, 1.2 + 0.8 * hash1(i * 5));
    }
    return { dim: 0.1 * (1 - wave) };
  }
  return { scene, update, shots };
}
