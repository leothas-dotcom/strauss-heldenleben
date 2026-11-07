// D, kukkula: kuvakäsikirjoituksen otot 9–12 (ankkurit held_t34 ... held_tunnelma_vaihtuu).
//   9  Joukko ratsastaa joenrantaa (matalikon roiskeet = harppu); kaviot iskevät musiikin iskuilla.
//   10 Kukkulan rinne: jokainen sforzando on kavioniskun pöllähdys, viiri kiipeää portaittain.
//   11 Leikkaus H5:n alkuun: ritari nostaa kellonsa (kutsu) kesken laukan.
//   12 Samassa liikkeessä: kamera vetäytyy, ja huipussa hevonen nousee takajaloilleen, maa kohoaa ja
//      aurinko murtautuu esiin. Kamera hidastuu mutta ei pysähdy.

import * as THREE from 'three';
import { C, ink, flat, group, poly, rect, circle, cloud, ridgeGeo, skylineGeo, water, waveMat, pennantGeo, sky as makeSky, clamp, smoothstep, mix, hash1, vnoise1 } from './paper.js';
import { knight, horse, poseKnight, poseHorse, KP, kmix } from './puppets.js';
import { leader, camPath, ease } from './hero.js';

export function build(K) {
  const { S } = K;
  const A = K.a, B = K.b;
  const tClimb = S.A('held_reh4').t;
  const tCall = S.A('held_reh5_isku').t;
  const tPeak = S.A('held_huippu1_kohta').t;
  const tRiver = A + 1.5;
  const scene = new THREE.Scene();
  const SKY = makeSky(scene);
  // Kulku: laukka tasangolla, hitaampi nousu rinteessä, pysähtyy huipulle ennen kutsua.
  const FPS = 30;
  const n = Math.ceil((B - A + 8) * FPS);
  const xs = new Float32Array(n);
  const speed = (t) => (t < tClimb - 1 ? 9 : t < tCall - 1.5 ? 4.6 : t < tCall ? 1.5 : 0.25);
  for (let i = 1; i < n; i++) { const t = A - 2 + i / FPS; xs[i] = xs[i - 1] + speed(t) / FPS; }
  const colX = (t) => { const f = clamp((t - (A - 2)) * FPS, 0, n - 1); const i = Math.floor(f); const j = Math.min(n - 1, i + 1); return xs[i] + (xs[j] - xs[i]) * (f - i); };
  // laukan vaihe musiikin iskuista: yksi askelsykli per isku, kaviot maassa iskulla
  const gallop = (t) => S.beatPos(t + S.LEAD) * Math.PI * 2;
  const XR = colX(tRiver + 1.5);
  const XC = colX(tClimb) + 1;
  const TOPX = colX(tCall - 0.6), TOPY = 9;
  const ground = (x) => (x < XC ? 0 : x < TOPX ? ((x - XC) / (TOPX - XC)) * TOPY : TOPY);

  // --- kerrokset ---
  const X0 = -80, X1 = TOPX + 160;
  const farR = flat(scene, ridgeGeo(X0 - 400, X1 + 600, 42, 41, { lambda: 150, base: -300 }), ink(C.paper, { shade: C.blue, raster: 0.3 }), { z: -230 });
  const midR = flat(scene, ridgeGeo(X0 - 200, X1 + 300, 13, 43, { lambda: 40, base: -100 }), ink(C.blue, { shade: C.paper, raster: 0.15 }), { z: -70 });
  const fieldPts = [];
  for (let i = 0; i <= 400; i++) { const x = X0 - 60 + (i * (X1 - X0 + 200)) / 400; fieldPts.push([x, -0.7 + 0.5 * vnoise1(x / 13, 3)]); }
  flat(scene, skylineGeo(fieldPts, -40), ink(C.paper, { shade: C.blue, raster: 0.32, grad: [C.blue, -1, -12, 0.7] }), { z: -14 });
  const pathPts = [];
  for (let i = 0; i <= 300; i++) { const x = X0 + (i * (TOPX + 40 - X0)) / 300; pathPts.push([x, ground(x) - 0.02]); }
  flat(scene, skylineGeo(pathPts, -40), ink(C.black), { z: -0.9 });
  flat(scene, poly([[XC - 2, -40], [XC - 2, 0], [XC + 3, 2.5], [XC + 7, 4.5], [TOPX - 2, TOPY], [TOPX + 6, TOPY + 0.6], [TOPX + 9, TOPY + 0.2], [TOPX + 14, TOPY - 3], [TOPX + 20, -40]]), ink(C.black, { shade: C.blue, raster: 0.2 }), { z: -1.4 });
  const riv = water(scene, 26, 2.4, { x: XR, y: -0.9, z: 0.6, glint: 0.9 });
  const rivBack = water(scene, 26, 3, { x: XR, y: -0.4, z: -1.0, glint: 0.6 });
  for (let k = 0; k < 22; k++) flat(scene, cloud(12 + 10 * hash1(k), 5 + 3 * hash1(k + 1), k + 60), ink(C.paper, { shade: C.blue, raster: 0.1 }), { x: X0 + k * 20 + 8 * hash1(k + 2), y: 14 + 12 * hash1(k + 3), z: -60 - 60 * hash1(k + 4) });
  const splashMat = ink(C.paper);
  const splashes = Array.from({ length: 24 }, () => { const m = flat(scene, circle(0.11, 12, 0, 0, 1.5), splashMat, { z: 0.7 }); m.visible = false; return m; });
  // kavioiden pöllähdykset (sforzandot)
  const dustMat = ink(C.paper, { shade: C.blue, raster: 0.35 });
  const puffs = Array.from({ length: 10 }, () => { const m = flat(scene, cloud(2.2, 1.2, 7, true), dustMat, { z: 0.4 }); m.visible = false; return m; });
  const sfz = S.accIn(tClimb, tCall, 4.5).map((x) => x.t);

  // --- ratsastajat: ritari + 7 toveria, viirit kolmella ---
  const riders = [];
  for (let i = 0; i < 8; i++) {
    const zz = [0, -0.5, 0.35, -0.9, 0.15, -0.65, 0.45, -1.1][i];
    const H = horse(scene, { mane: i === 0 ? C.red : C.paper });
    const P = i === 0 ? null : knight(scene, { raster: 0.1 * (i % 3) });
    if (P) P.mounted = true;
    let pen = null;
    if (i === 2 || i === 4 || i === 6) {
      pen = group(scene);
      flat(pen, rect(0.06, 4.2, 0.5, 0), ink(C.black), {});
      const m = waveMat(i === 4 ? C.paper : C.red, { amp: 0.25, k: 6 });
      flat(pen, pennantGeo(2.2, 0.7), m, { y: 3.8, z: 0.01 });
      pen.m = m;
    }
    riders.push({ H, P, pen, dx: -2.7 * i - (i > 3 ? 1 : 0), z: zz, ph0: hash1(i * 7) * 0.8 });
  }
  const L = leader(scene, {});
  L.P.mounted = true;
  const riderX = (r, t) => colX(t) + r.dx;
  const rear = (t) => ease(smoothstep(tPeak - 0.45, tPeak - S.LEAD, t)) * (1 - smoothstep(B - 0.2, B + 0.8, t));
  const call = (t) => smoothstep(tCall - S.LEAD, tCall + 0.35, t);
  function leaderState(t) {
    const r = riders[0];
    const x = riderX(r, t);
    const c = call(t);
    let pose = kmix(KP.ride, { ...KP.ride, lean: -0.25, tilt: 1.0, aN: 1.5, eN: 1.5 }, c);
    pose = { ...pose, aN: c > 0 ? pose.aN : 1.6 + 0.8 * clamp((S.melody(t) - 50) / 25), eN: c > 0 ? pose.eN : 0.3 };
    const rr = rear(t);
    return { x: x + 0.05 - 0.35 * rr, y: ground(x) + 1.52 + 0.75 * rr, z: r.z + 0.03, facing: 1, pose: { ...pose, lean: pose.lean - 0.5 * rr, mounted: true } };
  }
  const windAt = (t) => ({ x: -(1.5 + 2 * S.energy.violins(t)), y: 0.4 + 1.2 * S.loud(t) + 2 * S.pulse(t, tPeak, 1.5) });

  const shots = [
    { name: '9 sivuajo laukan rinnalla joenrannassa', a: A, b: tClimb, cam: (u, t) => { const c = colX(t) - 8; return { pos: [c + 1, 2.6, 15], look: [c + 2, 1.6, 0], fov: 42 }; } },
    { name: '10 rinne: viiri kiipeää portaittain', a: tClimb, b: tCall, cam: (u, t) => { const c = colX(t) - 4; return { pos: [c - 2, ground(c) + 2.5 + 3 * ease(u), 17], look: [c + 3, ground(c + 3) + 2.0, 0], fov: 42 }; } },
    // 11-12 yhtenä liikkeenä: H5:n leikkauksesta kellon lähikuva vetäytyy crescendon aikana ja saapuu
    // laajaan matalaan kuvaan huipun hetkellä liikkeessä; huipun jälkeen liike hidastuu, ei pysähdy.
    { name: '11-12 kello nousee, huippu', a: tCall, b: B + 1.5, cam: camPath([
      { pos: [TOPX - 1.2, TOPY + 3.2, 6.0], look: [TOPX + 0.4, TOPY + 3.2, 0], fov: 38 },
      { pos: [TOPX - 5.4, TOPY - 0.6, 17.6], look: [TOPX + 1, TOPY + 4.4, 0], fov: 46 },
      { pos: [TOPX - 6.4, TOPY - 0.9, 19.6], look: [TOPX + 1, TOPY + 4.9, 0], fov: 46 }]) },
  ];

  function update(t) {
    const u = SKY.u;
    u.uTime.value = t;
    const peak = S.pulse(t, tPeak, 1.4);
    u.uBlueAmt.value = 1; u.uBlueH.value = 0.55 + 0.2 * smoothstep(tPeak - 0.1, tPeak + 1, t); u.uBlackTop.value = 0; u.uRedAmt.value = 0.2;
    // aurinko nousee rinteessä ja murtautuu esiin huipussa (ei sädekehää)
    const sunUp = smoothstep(tClimb, tPeak, t);
    u.uSun.value.set(TOPX + 60, mix(60, 150, sunUp) + 20 * smoothstep(tPeak - 0.1, tPeak + 1.2, t), 26 + 16 * peak, 1);   // aurinko murtautuu esiin
    u.uRays.value = 0;
    // maa kohoaa huipussa: kaukaiset vuoret nousevat ja asettuvat
    farR.position.y = 6 * ease(smoothstep(tPeak - 0.2, tPeak + 0.8, t)) * (1 - 0.5 * smoothstep(tPeak + 1, B, t));
    midR.position.y = 3 * ease(smoothstep(tPeak - 0.1, tPeak + 0.6, t));
    riders.forEach((r, i) => {
      const x = riderX(r, t);
      const g = ground(x);
      const inRiver = Math.abs(x - XR) < 9;
      r.H.root.position.set(x, g - (inRiver ? 0.45 : 0), r.z);
      r.H.root.rotation.z = x > XC && x < TOPX ? Math.atan2(TOPY, TOPX - XC) * 0.8 : 0;
      const stand = t > tCall - 1.0;
      poseHorse(r.H, stand ? 'stand' : 'gallop', gallop(t) + r.ph0, 1, i === 0 ? rear(t) : 0);
      r.H.root.updateMatrixWorld(true);
      const sp = new THREE.Vector3(); r.H.saddle.getWorldPosition(sp);
      if (r.P) {
        r.P.root.position.set(sp.x - 0.05, sp.y + 0.02, r.z + 0.03);
        poseKnight(r.P, kmix(KP.ride, { ...KP.ride, tilt: 0.9, aN: 1.4, eN: 1.4 }, peak), t, 0.6);
      }
      if (r.pen) {
        r.pen.position.set(sp.x - 0.25, sp.y - 0.4, r.z - 0.02);
        r.pen.rotation.z = 0.12;
        r.pen.m.uniforms.uTime.value = t + i;
        r.pen.m.uniforms.uAmp.value = 0.12 + 0.3 * smoothstep(0.1, 0.6, S.energy.brass(t)) + 0.4 * peak;
      }
    });
    L.place(t, leaderState, windAt, { capeWind: 0.8, dt: 0.02, windScale: 0.6 });
    // joki: välkkeet ja roiskeet (harppu)
    for (const w of [riv, rivBack]) { w.u.uTime.value = t; w.u.uGlint.value = 0.5 + 0.7 * S.fam.harp(t); }
    const hp = 0.4 + 1.2 * S.fam.harp(t);
    let k = 0;
    riv.rings.forEach((rr) => rr.set(0, 0, -99, 0));
    splashes.forEach((s) => (s.visible = false));
    riders.forEach((r, i) => {
      const x = riderX(r, t);
      if (Math.abs(x - XR) > 9) return;
      for (let j = 0; j < 3 && k < splashes.length; j++) {
        const s = splashes[k++];
        const a = ((t * 2.3 + i * 0.37 + j * 0.31) % 1);
        s.visible = true;
        s.position.set(x + 0.6 - j * 0.7 + (j - 1) * 1.2 * a, -0.6 + 1.6 * hp * Math.sin(Math.PI * a), 0.7);
        const sc = 0.6 + 0.8 * hp * (1 - a);
        s.scale.set(sc, sc, 1);
      }
      if (i < 16) riv.rings[i].set(x, -0.8, t - ((t * 1.7 + i * 0.3) % 1.2), 1.0);
    });
    // sforzandot: pöllähdys johtajan kavioista
    puffs.forEach((p) => (p.visible = false));
    let pk = 0;
    for (const s of sfz) {
      const a = t - (s - S.LEAD);
      if (a < 0 || a > 0.9 || pk >= puffs.length) continue;
      const p = puffs[pk++];
      const x = riderX(riders[0], s) - 0.6;
      p.visible = true;
      p.position.set(x - 0.6 * a, ground(x) + 0.2 + 0.5 * a, 0.4);
      p.scale.setScalar(0.4 + 1.1 * a);
      p.material.uniforms.uAppear.value = 1 - a / 0.9;
    }
    // ei koko kuvan efektejä: huipun tekevät hevonen, maa ja aurinko
    return { dim: 0 };
  }
  return { scene, update, shots };
}
