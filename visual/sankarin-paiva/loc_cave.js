// E, rotko ja luola (1:34.1–2:21.7): kuvakäsikirjoituksen rivit 10–14.
// Rakenne sivusta: vasemmalla rotko (laskeutuminen, x -8..6), keskellä matala tunneli tippukivineen
// (katto y 8), oikealla maanalainen järvi ja valokuilu (x 18..30), jota pitkin noustaan valoon.
//  10 Uusi taso: matala rekisteri, sellot ja bassot. Johtaja laskeutuu rotkoa, kamera mukana.
//  11 Varjot: puupuhaltimet ensi kertaa, harppu. Pisarat putoavat tippukivistä järveen (harppu),
//     ja mustat linnut avaavat paperiset silmänsä puupuhaltimien soidessa (enne kriitikoista).
//  12 Pohja: matalin rekisteri. Järven ranta, maa jyrisee patarumpujen mukana ja katosta sataa pölyä.
//  13 Kutsu ylhäältä: valokiila aukeaa kuilusta, käyrätorvikutsu laskeutuu paperisina renkaina,
//     ritari nostaa katseensa. Viulut hellästi: valo laajenee.
//  14 Nousu valoon (Tod und Verklärung): kallioulokkeet kuilun seinällä vesiputouksen vierellä.

import * as THREE from 'three';
import { C, ink, flat, group, poly, rect, circle, strokeGeo, water, streaks, clamp, smoothstep, mix, hash1, vnoise1 } from './paper.js';
import { KP, kmix } from './puppets.js';
import { leader, camPath, ease } from './hero.js';

export function build(K) {
  const { S, seg } = K;
  const A = K.a, B = K.b;
  const tCave = seg(12), tBottom = seg(13), tCall = seg(14), tClimb = seg(15), tMaj = seg(16);
  const scene = new THREE.Scene();
  scene.background = C.black.clone();
  const TOP = 46, CEIL = 8;
  // taka-ala: aukoista näkyy valo (vaalenee ylöspäin)
  const bgMat = ink(C.blue, { shade: C.black, raster: 0.55, grad: [C.paper, 16, 46, 0.95] });
  flat(scene, rect(300, 140), bgMat, { y: 10, z: -24 });
  // kallio: seinien reunat kohinalla
  const edge = (x0, y, seed, amp = 1.6) => x0 + amp * (vnoise1(y / 3.2, seed) - 0.5) * 2 + 1.2 * (vnoise1(y / 11, seed + 3) - 0.5);
  const rockMat = ink(C.black, { shade: C.blue, raster: 0.12 });
  const ys = Array.from({ length: 41 }, (_, i) => CEIL + ((TOP + 4 - CEIL) * i) / 40);
  const ysAll = Array.from({ length: 51 }, (_, i) => -1 + ((TOP + 5) * i) / 50);
  const chasmL = ysAll.map((y) => [edge(-8, y, 3), y]);
  const chasmR = ys.map((y) => [edge(6.5, y, 7), y]);
  const shaftL = ys.map((y) => [edge(18, y, 11), y]);
  const shaftR = ys.map((y) => [edge(30, y, 13), y]);
  flat(scene, poly([[-90, -40], ...chasmL, [-90, TOP + 10]]), rockMat, { z: 0 });                                    // vasen kallio
  flat(scene, poly([...chasmR, ...shaftL.slice().reverse()]), rockMat, { z: 0 });                                   // keskikatto
  flat(scene, poly([...shaftR, [120, TOP + 4], [120, -1], [44, -1], [44, CEIL], [shaftR[0][0], CEIL]]), rockMat, { z: 0 }); // oikea kallio
  // tunnelin katon alareuna ja tippukivet
  const STAL = Array.from({ length: 14 }, (_, k) => ({ x: 7.2 + k * 0.78 + 0.3 * hash1(k), len: 1.4 + 2.2 * hash1(k + 1) }));
  const rimMat = ink(C.paper, { shade: C.blue, raster: 0.5 });
  STAL.forEach((s) => { const sh = poly([[s.x - 0.32, CEIL + 0.3], [s.x + 0.32, CEIL + 0.3], [s.x, CEIL - s.len]]); flat(scene, sh, rockMat, { z: 0.01 }); flat(scene, strokeGeo([[s.x + 0.3, CEIL], [s.x, CEIL - s.len]], 0.05), rimMat, { z: 0.02 }); });
  flat(scene, strokeGeo([[6.5, CEIL], [18, CEIL]], 0.06), rimMat, { z: 0.02 });
  for (let k = 0; k < 9; k++) { const x = 31 + k * 1.3; flat(scene, poly([[x - 0.3, CEIL + 0.3], [x + 0.3, CEIL + 0.3], [x, CEIL - 0.8 - 1.4 * hash1(k + 40)]]), rockMat, { z: 0.01 }); }
  // lattia ja järvi
  flat(scene, poly([[-90, -40], [-90, 0], [12, 0], [12.6, -0.6], [13, -40]]), rockMat, { z: 0.2 });
  const lake = water(scene, 40, 6, { x: 32, y: -3.3, z: 0.25, base: C.blue, deep: C.black, glint: 0.45 });
  flat(scene, rect(200, 30, 0.5, 1), rockMat, { y: -6.2, z: 0.3 });
  // kallioulokkeet: musta hylly, jonka yläreuna on paperinvalkoinen
  const shelfMat = ink(C.black, { shade: C.blue, raster: 0.25 });
  const lipMat = ink(C.paper, { shade: C.blue, raster: 0.3 });
  const shelf = (a, b) => { flat(scene, strokeGeo([[a[0], a[1] - 0.25], [b[0], b[1] - 0.25]], 0.5), shelfMat, { z: -1.45 }); flat(scene, strokeGeo([a, b], 0.07), lipMat, { z: -1.44 }); };
  const DOWN = [[-6.5, 36], [3.5, 30], [-5.5, 23], [4, 16], [-5, 9], [3, 3], [-1, 0]];
  for (let i = 0; i < DOWN.length - 1; i++) shelf(DOWN[i], DOWN[i + 1]);
  const UPS = [[12, 0], [18.8, 3.2], [19.4, 8], [22.5, 12.5], [19.3, 17], [22.8, 21.5], [19.4, 26], [22.6, 30.5], [19.5, 35], [22.5, 39.5], [20.5, 44], [21, 47]];
  for (let i = 1; i < UPS.length - 1; i++) shelf(UPS[i], UPS[i + 1]);
  // vesiputous kuilun oikealla seinällä
  const fallMat = ink(C.paper, { shade: C.blue, raster: 0.2 });
  flat(scene, rect(1.8, TOP + 1, 0.5, 1), ink(C.blue, { shade: C.black, raster: 0.35 }), { x: 28.2, y: TOP, z: -0.9 });
  const fall = streaks(scene, 80, fallMat, -0.85);
  // linnut, joilla paperiset silmät (puupuhaltimet): katon alla ja seinillä
  const birdMat = ink(C.black, { shade: C.blue, raster: 0.1 });
  const eyeMat = ink(C.paper);
  const BIRDS = [[8.0, CEIL - 0.9], [10.3, CEIL - 0.6], [13.4, CEIL - 1.0], [16.2, CEIL - 0.7], [5.8, 4.8], [-6.6, 3.2], [17.6, 5.0]].map(([x, y], k) => {
    const g = group(scene, { x, y, z: 0.5 });
    flat(g, poly([[-0.5, 0], [-0.2, 0.35], [0.25, 0.4], [0.45, 0.15], [0.2, -0.2], [-0.4, -0.25]]), birdMat);
    const head = group(g, { x: 0.32, y: 0.45 });
    flat(head, circle(0.2, 14), birdMat);
    flat(head, poly([[0.15, 0.03], [0.45, -0.04], [0.15, -0.08]]), birdMat);
    const eye = flat(head, circle(0.08, 12, 0.06, 0.05), eyeMat, { z: 0.01 });
    const pupil = flat(head, circle(0.035, 10, 0.08, 0.05), birdMat, { z: 0.02 });
    g.scale.x = k % 2 ? -1 : 1;
    return { g, head, eye, pupil, k };
  });
  // valokiila kuilusta ja kutsun renkaat
  const shaftMat = ink(C.paper, { shade: C.blue, raster: 0.4 });
  const beam = flat(scene, poly([[-3.5, 0], [3.5, 0], [8, -TOP], [-8, -TOP]]), shaftMat, { x: 24, y: TOP, z: -1.0 });
  const ringMat = ink(C.paper);
  const callRings = Array.from({ length: 6 }, () => { const m = flat(scene, new THREE.RingGeometry(0.93, 1, 48, 1, Math.PI * 1.08, Math.PI * 0.84), ringMat, { z: 0.6 }); m.visible = false; return m; });
  const tHorn = (() => { let tb = tCall + 3, hb = 0; for (let t = tCall; t < tCall + 7; t += 0.1) { const h = S.fam.horns(t); if (h > hb) { hb = h; tb = t; } } return tb; })();
  // pisarat harpun voimistumisista
  const dropMat = ink(C.paper);
  const drops = Array.from({ length: 10 }, () => { const m = flat(scene, circle(0.11, 12, 0, 0, 1.6), dropMat, { z: 0.6 }); m.visible = false; return m; });
  const dropEv = [];
  { let last = -9; for (let t = tCave - 1; t < tClimb; t += 1 / 30) { const h = S.fam.harp(t); if ((h > 0.25 && h - S.fam.harp(t - 0.25) > 0.05 && t - last > 0.3) || t - last > 1.8) { dropEv.push(t); last = t; } } }
  const LAKE_STAL = STAL.filter((s) => s.x > 13);
  const dust = streaks(scene, 50, ink(C.paper, { shade: C.blue, raster: 0.3 }), 0.8);

  const L = leader(scene, {});
  const pathAt = (pts, u) => {
    const lens = [];
    let tot = 0;
    for (let i = 0; i < pts.length - 1; i++) { const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); lens.push(l); tot += l; }
    let d = clamp(u) * tot;
    for (let i = 0; i < lens.length; i++) {
      if (d <= lens[i] || i === lens.length - 1) { const w = clamp(d / lens[i]); return [mix(pts[i][0], pts[i + 1][0], w), mix(pts[i][1], pts[i + 1][1], w), pts[i + 1][0] >= pts[i][0] ? 1 : -1]; }
      d -= lens[i];
    }
    return [pts[pts.length - 1][0], pts[pts.length - 1][1], 1];
  };
  const WALK = [[-1, 0], [11.6, 0]];
  function leaderState(t) {
    let x, y, facing = 1, pose;
    const walk = Math.floor(t / 0.45) % 2 ? KP.stepA : KP.stepB;
    if (t < tCave) {
      [x, y, facing] = pathAt(DOWN, ease(clamp((t - A + 1.2) / (tCave - A + 1.0))));
      pose = kmix(walk, KP.stand, 0.15);
    } else if (t < tBottom) {
      [x, y, facing] = pathAt(WALK, clamp((t - tCave) / (tBottom - tCave - 0.6)));
      pose = { ...kmix(walk, KP.stand, 0.25), lean: 0.22, tilt: -0.35 };
      if (t > tBottom - 0.7) pose = kmix(pose, KP.stand, smoothstep(tBottom - 0.7, tBottom, t));
    } else if (t < tClimb) {
      x = 11.6; y = 0; facing = 1;
      pose = kmix(KP.stand, KP.kneel, smoothstep(tBottom + 0.5, tBottom + 2.5, t));
      pose = kmix(pose, KP.look, smoothstep(tHorn - 0.8, tHorn + 0.5, t));
    } else {
      const u = clamp((t - tClimb) / (B - tClimb + 0.6));
      [x, y, facing] = pathAt(UPS, ease(u));
      const c = Math.floor(t / 0.5) % 2 ? KP.climbA : KP.climbB;
      pose = { ...c, lean: 0.25 };
    }
    return { x, y, z: -1.2, facing, pose: { ...pose, mounted: false } };
  }
  const windAt = (t) => ({ x: -0.3, y: t > tClimb ? 0.6 + 1.6 * S.energy.violins(t) : -0.5 });
  const lagged = (t, lag) => { let sx = 0, sy = 0; for (let k = 0; k < 9; k++) { const s = leaderState(t - (k / 8) * lag); sx += s.x; sy += s.y; } return [sx / 9, sy / 9]; };
  const follow = (dz, dy, ly, lag, fov = 42, dx = 1.2) => (u, t) => { const [x, y] = lagged(t, lag); return { pos: [x + dx, y + dy, dz], look: [x + dx, y + ly, -1], fov }; };

  const shots = [
    { name: '10 laskeutuminen rotkoon', a: A, b: tCave, cam: follow(19, 2.2, 0.8, 1.8, 44, 0.5) },
    { name: '11 varjot: tunneli, linnut ja pisarat', a: tCave, b: tBottom, cam: camPath([{ pos: [2.5, 3.0, 14.5], look: [4, 3.4, 0], fov: 44 }, { pos: [11, 3.2, 14.5], look: [12, 3.6, 0], fov: 44 }]) },
    { name: '12 pohja: järven ranta', a: tBottom, b: tCall, cam: camPath([{ pos: [17, 3.6, 23], look: [18, 2.6, 0], fov: 44 }, { pos: [17.5, 3.8, 21.5], look: [18.5, 2.8, 0], fov: 44 }]) },
    { name: '13 ylös kuiluun: valokiila ja renkaat', a: tCall, b: tCall + 6.2, cam: camPath([{ pos: [16.5, 4.0, 25], look: [19, 10, 0], fov: 48 }, { pos: [16.8, 4.4, 23.5], look: [19.3, 11, 0], fov: 48 }]) },
    { name: '13 ritari katsoo ylös, valo laajenee', a: tCall + 6.2, b: tClimb, cam: camPath([{ pos: [14.8, 1.8, 6.6], look: [11.8, 2.1, 0], fov: 40 }, { pos: [14.2, 2.0, 5.9], look: [11.8, 2.3, 0], fov: 40 }]) },
    { name: '14 nousu vesiputouksen vierellä', a: tClimb, b: tMaj + 2, cam: follow(15, 1.5, 2.2, 1.6, 44, 1.8) },
    { name: '14 valoon', a: tMaj + 2, b: B + 2, cam: follow(21, 2.5, 4.0, 1.6, 46, 2.0) },
  ];

  function update(t) {
    // linnut: silmät aukeavat puupuhaltimien soidessa ja seuraavat ritaria
    const ww = smoothstep(0.06, 0.3, S.fam.winds(t)) * smoothstep(tCave - 0.5, tCave + 1, t) * (1 - smoothstep(tClimb - 2, tClimb + 1, t));
    const s = leaderState(t);
    BIRDS.forEach((b) => {
      const open = clamp(ww * 1.5 - 0.12 * b.k + 0.25);
      const lit = ww > 0.05 ? open : 0;
      b.eye.scale.set(1, Math.max(0.05, lit), 1);
      b.pupil.visible = lit > 0.3;
      const dx = s.x - b.g.position.x;
      b.pupil.position.x = 0.08 + 0.03 * Math.sign(dx) * b.g.scale.x;
      b.head.rotation.z = 0.12 * Math.sin(t * 0.8 + b.k) * lit;
    });
    // pisarat ja renkaat järvessä
    drops.forEach((d) => (d.visible = false));
    lake.rings.forEach((r) => r.set(0, 0, -99, 0));
    lake.u.uTime.value = t;
    lake.u.uGlint.value = 0.35 + 0.6 * S.fam.harp(t);
    let k = 0, kr = 0;
    for (let i = dropEv.length - 1; i >= 0; i--) {
      const te = dropEv[i];
      const st = LAKE_STAL[Math.floor(hash1(i * 13) * LAKE_STAL.length)];
      const yTip = CEIL - st.len;
      const fallT = Math.sqrt((2 * (yTip + 0.3)) / 9.8);
      const a = t - te;
      if (a >= 0 && a < fallT && k < drops.length) { const d = drops[k++]; d.visible = true; d.position.set(st.x, yTip - 0.5 * 9.8 * a * a, 0.6); }
      if (a >= fallT && a < fallT + 3 && kr < 16) lake.rings[kr++].set(st.x, -0.4, te + fallT, 1.3);
    }
    // valokiila ja kutsun renkaat
    const open = smoothstep(tCall - 0.5, tHorn, t) * (0.6 + 0.4 * smoothstep(tHorn + 2, tClimb, t));
    beam.visible = open > 0.02;
    beam.scale.set(0.25 + 0.75 * clamp(open), 1, 1);
    beam.material.uniforms.uRaster.value = 0.78 - 0.4 * clamp(open);
    callRings.forEach((m, j) => {
      const a = t - tHorn + 0.25 - j * 0.45;
      m.visible = a > 0 && a < 4;
      if (!m.visible) return;
      const r = 1 + a * 2.4;
      m.scale.set(r, r * 0.55, 1);
      m.position.set(24, 26 - a * 6, 0.6);
      m.material.uniforms.uAppear.value = 1 - clamp(a / 4);
    });
    // vesiputous
    const hp = 0.4 + S.fam.harp(t);
    fall.set((i) => {
      const sp = 10 + 5 * hash1(i);
      const ph = (hash1(i * 3) * TOP + t * sp) % TOP;
      return { x: 27.4 + 1.6 * hash1(i * 7), y: TOP - ph, ang: -Math.PI / 2, len: 1.0 + 2.2 * hash1(i * 5) * hp, w: 0.07 };
    });
    // jyrinä: pöly katosta
    let rumble = 0;
    for (const h of S.percHits) { const a = t - h.t; if (a >= 0 && a < 2.5 && h.t > tBottom - 0.5 && h.t < tCall) rumble = Math.max(rumble, h.s * (1 - a / 2.5)); }
    if (t > tBottom && t < tCall) rumble = Math.max(rumble, 0.7 * smoothstep(0.12, 0.35, S.fam.perc(t)));
    dust.set((i) => {
      if (hash1(i * 3) > rumble) return null;
      const a = (t * 0.8 + hash1(i)) % 1;
      return { x: 6.5 + 11 * hash1(i * 7), y: CEIL - 0.5 - a * 8.5, ang: -Math.PI / 2, len: 0.22, w: 0.07 };
    });
    const shake = 4 * rumble * Math.sin(t * 53) + (t < tCave ? 2.2 * S.energy.lows(t) * Math.sin(t * 41) : 0);
    L.place(t, leaderState, windAt, { capeWind: 0.2, width: 0.75 });
    const light = smoothstep(tMaj - 2, B, t);
    L.bannerMat.uniforms.uRaster.value = 0.35 * (1 - light);
    bgMat.uniforms.uRaster.value = 0.8 - 0.3 * light;
    const dim = (t < tCave ? 0.12 : 0.28) * (1 - light);
    return { dim, shake };
  }
  return { scene, update, shots };
}
