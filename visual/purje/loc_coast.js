// E, rannikko ja putous: kuvakäsikirjoituksen otot 16–20 (ankkurit held_t61 ... held_reh12).
//  16 held_t61: rannikon kalliot kohoavat alhaalta (matalien jousten kertymä), laivasto rannikolla.
//  17 held_reh8: leikkaus: koko laivasto (8 laivaa porrastettuna), kaikki purjeet ja viirit ylhäällä.
//  18 held_reh9: viirien portaat: jokainen mitattu isku avaa seuraavan laivan pitkän viirin.
//  19 held_reh10: nousu 3: kamera korkealla, myrskypilvi kaukana horisontissa.
//  20 held_reh11: putous kallioilta mereen; aksentit ja harpun nuotinalut ovat ryöppyjä.

import * as THREE from 'three';
import { C, ink, flat, group, rect, ridgeGeo, skylineGeo, strokeGeo, cloud, sky as makeSky, streaks, clamp, smoothstep, mix, hash1, vnoise1 } from './paper.js';
import { camPath, ease } from './hero.js';
import { seaBand, ship, ride, splashes, cliffPts, common } from './world.js';

export function build(K) {
  const { S } = K;
  const A = S.A;
  const W = common(S);
  const t0 = K.a;
  const tR8 = A('held_reh8').t;
  const tR9 = A('held_reh9').t;
  const tR10 = A('held_reh10').t;
  const tFall = A('held_reh11').t;
  const tEnd = K.b;

  const scene = new THREE.Scene();
  const SKY = makeSky(scene);
  const farMat = ink(C.paper, { shade: C.blue, raster: 0.3 });
  const far = flat(scene, ridgeGeo(-1000, 1800, 40, 41, { lambda: 150, base: -300 }), farMat, { z: -300, y: -8 });
  far.userData.edge = { name: 'kaukaiset vuoret' };
  // myrskypilvi horisontissa (nousu 4 odottaa)
  const stormMat = ink(C.black, { shade: C.blue, raster: 0.35 });
  const stormC = flat(scene, cloud(260, 70, 7, false), stormMat, { z: -260, y: 10 });
  const clouds = Array.from({ length: 10 }, (_, k) => flat(scene, cloud(50 + 30 * hash1(k + 23), 14 + 8 * hash1(k + 24), 120 + k, false), ink(C.paper, { shade: C.blue, raster: 0.15 + 0.2 * hash1(k) }), { y: 80 + 70 * hash1(k + 29), z: -220 }));
  // rannikon kalliot: korkeat seinämät takana, matalammat edessä; nousevat matalien jousten mukana
  const cliffMat = ink(C.black, { shade: C.blue, raster: 0.2 });
  const cliffBack = flat(scene, skylineGeo(cliffPts(-500, 1500, (x) => 22 + 18 * Math.pow(vnoise1(x / 40, 61), 1.5) + 4 * vnoise1(x / 7, 62), 400), -120), ink(C.blue, { shade: C.black, raster: 0.45 }), { z: -70 });
  cliffBack.userData.edge = { name: 'takakalliot' };
  const cliff = flat(scene, skylineGeo(cliffPts(-500, 1500, (x) => 10 + 12 * Math.pow(vnoise1(x / 25, 63), 1.3) + 2 * vnoise1(x / 4, 64), 500), -120), cliffMat, { z: -45 });
  cliff.userData.edge = { name: 'rantakalliot' };
  const mist = flat(scene, rect(3000, 1.4, 0.5, 0.5), ink(C.blue, { shade: C.paper, raster: 0.35 }), { z: -44, y: 0.8 });
  const seaFar = seaBand(scene, -1000, 1800, 0, -42, { A: 0.25, k: 0.15, sp: 0.9, deepAmt: 0.35, glint: 0.4, rows: 1.5, name: 'kaukainen meri', bottom: -200 });
  const seaMid = seaBand(scene, -800, 1600, 0, -18, { A: 0.35, k: 0.2, sp: 1.0, ph: 1.1, deepAmt: 0.45, name: 'keskimeri', bottom: -200 });
  const seaNear = seaBand(scene, -600, 1400, 0, -1, { A: 0.45, k: 0.16, sp: 0.9, ph: 2.4, deepAmt: 0.55, rows: 2.5, name: 'lähimeri', bottom: -200 });
  const seaFore = seaBand(scene, -600, 1400, -1.2, 8, { A: 0.5, k: 0.3, sp: 1.2, ph: 0.4, base: C.blue, shade: C.black, raster: 0.25, deep: C.black, deepAmt: 0.5, deepH: 8, name: 'etualan aalto', bottom: -200 });

  // --- laivasto: porrastettu rivi, sankari edessä (k = 0) ---
  const N = 8;
  const fleet = Array.from({ length: N }, (_, k) => ({
    k, s: k === 0 ? ship(scene, { captain: true }) : ship(scene, { len: 9, sailRaster: 0.35, hullRaster: 0.1, penC: k % 2 ? C.paper : C.red, penLen: 5.5 }),
    dx: -11 * k, z: -4.2 * k,
  }));
  const shipX = W.integ((t) => (t < t0 - 2 ? 0 : 1.8 + 2.8 * W.wind(t)));
  const X0 = shipX(t0);
  const hx = (t) => shipX(t) - X0;
  // ennen reh8:aa vain sankari ja kolme ensimmäistä; reh8:ssa koko laivasto (8 käyrätorvea ff)
  const visibleK = (k, t) => (k < 4 ? 1 : smoothstep(tR8 - 1, tR8 - S.LEAD, t));
  // viirien portaat: harjoitusnumeron 9 mitatut iskut, kukin avaa seuraavan laivan viirin
  const steps = S.accIn(tR9 - 0.3, tR9 + 3.2, 5).map((x) => x.t).slice(0, N - 1);
  while (steps.length < N - 1) steps.push(steps[steps.length - 1] ?? tR9);
  const penOf = (k, t) => {
    if (t < tR9 - S.LEAD) return t < tR8 ? 0.55 : 0.6;
    const st = steps[(N - 1 - k) % (N - 1)];
    return t < st - S.LEAD ? 0.6 : 1.0;
  };
  const snapOf = (k, t) => (k === 0 ? 0 : S.pulse(t, steps[(N - 1 - k) % (N - 1)], 0.5) * (t >= tR9 - S.LEAD ? 1 : 0));

  // --- putous: kallion lovesta mereen; ryöpyt aksenteissa ja harpussa ---
  const FX = hx(tFall) + 26, FZ = -44.5, FTOP = 24;
  const fallG = group(scene, { x: FX, z: FZ });
  flat(fallG, rect(6, FTOP + 2, 0.5, 0), ink(C.blue, { shade: C.paper, raster: 0.45 }), { y: -2 });
  [-2.2, -1.1, 0, 1.1, 2.2].forEach((dx, k) => flat(fallG, rect(0.3 + 0.3 * hash1(k + 40), FTOP + 2, 0.5, 0), ink(C.paper, { shade: C.blue, raster: 0.15 }), { x: dx, y: -2, z: 0.05 }));
  const dashes = Array.from({ length: 26 }, (_, k) => flat(fallG, rect(0.2, 1.2 + 1.0 * hash1(k + 60), 0.5, 0), ink(C.blue, { shade: C.black, raster: 0.3 }), { x: -2.6 + 5.2 * hash1(k + 61), z: 0.1 }));
  const gushMats = [];
  const gushes = Array.from({ length: 10 }, (_, k) => { const m = ink(C.paper); gushMats.push(m); const g = flat(fallG, cloud(6.5, 1.6, k + 90, false), m, { z: 0.15 }); g.visible = false; return g; });
  const foam = splashes(scene, 10, { z: FZ + 0.4, raster: 0.1 });
  const fallEvents = [...new Set([...S.accIn(tFall - 0.2, tEnd, 4.5).map((x) => x.t), ...S.onsetsIn(tFall - 0.2, tEnd).filter((o) => S.fam.harp(o) > 0.18)])].sort((a, b) => a - b);
  // kallion lovi putouksen kohdalla (kallion yläreuna on putouksen yläpuolella)
  // putouksen kallio: loivat rinteet molemmin puolin, lovi keskellä (ei laatikkotornia)
  flat(scene, skylineGeo([[FX - 26, -2], [FX - 16, FTOP - 9], [FX - 9, FTOP - 1], [FX - 5, FTOP + 2.5], [FX - 3, FTOP], [FX + 3, FTOP], [FX + 5, FTOP + 3], [FX + 10, FTOP], [FX + 18, FTOP - 8], [FX + 28, -2]], -10), cliffMat, { z: FZ - 0.2 });

  const wind = streaks(scene, 160, ink(C.paper, {}), -6);
  const follow = (f) => (u, t) => { const c = f(u); const d = hx(t); return { ...c, pos: [c.pos[0] + d, c.pos[1], c.pos[2]], look: [c.look[0] + d, c.look[1], c.look[2]] }; };
  const fixed = (f, x0) => (u) => { const c = f(u); return { ...c, pos: [c.pos[0] + x0, c.pos[1], c.pos[2]], look: [c.look[0] + x0, c.look[1], c.look[2]] }; };

  const shots = [
    { name: '16 kalliot kohoavat, kamera nousee vedenpinnasta', a: t0 - 1, b: tR8,
      cam: follow(camPath([{ pos: [-8, 0.6, 22], look: [-2, 3, -40], fov: 44 }, { pos: [-6, 5, 26], look: [-4, 8, -40], fov: 44 }])) },
    // 17-18 yhtenä liikkeenä: harjoitusnumeron 9 iskuun ei leikata, viirien portaat tekevät iskun
    { name: '17-18 koko laivasto, sivuajo viirien portaiden ohi', a: tR8, b: tR10,
      cam: follow(camPath([{ pos: [-26, 7, 66], look: [-30, 7, -20], fov: 44 }, { pos: [-40, 5.5, 34], look: [-40, 6.5, -20], fov: 43 }, { pos: [-62, 4.5, 14], look: [-58, 6, -20], fov: 42 }, { pos: [-6, 4.5, 14], look: [-2, 6, -20], fov: 42 }])) },
    { name: '19 nousu 3: korkealta, myrskypilvi kaukana', a: tR10, b: tFall,
      // nousu 3: korkeammalla kuin nousu 2; kalliot nousevat ruudun yläosaan
      cam: follow(camPath([{ pos: [-20, 10, 44], look: [-22, 16, -60], fov: 50 }, { pos: [-14, 11, 40], look: [-16, 16.5, -60], fov: 50 }])) },
    { name: '20 putous: katse laskee veden mukana ja nousee', a: tFall, b: tEnd + 0.5,
      cam: fixed(camPath([{ pos: [-8, 16, 12], look: [0, 18, FZ], fov: 44 }, { pos: [-5, 5, 13], look: [0, 4, FZ], fov: 44 }, { pos: [-1, 9, 16], look: [3, 11, FZ], fov: 46 }]), FX) },
  ];

  function update(t) {
    const lows = W.lows(t);
    const str = W.strings(t);
    const w = W.wind(t);
    farMat.uniforms.uRaster.value = 0.22 + 0.25 * W.loudS(t);
    cliffMat.uniforms.uRaster.value = 0.12 + 0.2 * (1 - W.loudS(t));
    // kalliot kohoavat matalien jousten kertymän mukana
    const up = ease(clamp((W.lowsI(t) - W.lowsI(t0 - 1)) / 7));
    cliff.position.y = -30 * (1 - up) + 0.6 * lows;
    cliffBack.position.y = -40 * (1 - up) + 0.8 * lows;
    mist.position.x = W.drift(t) * 0.8;
    stormC.position.x = hx(t) * 0.8 + 140;
    stormC.position.y = -10 + 22 * smoothstep(tR10 - 4, tFall, t);
    stormMat.uniforms.uAppear.value = smoothstep(tR10 - 5, tR10 + 2, t);
    clouds.forEach((c, k) => { c.position.x = -500 + ((hash1(k + 27) * 1400 + W.drift(t) * (0.6 + 0.4 * hash1(k)) + 0.5 * hx(t)) % 1400); });
    const u = SKY.u;
    u.uTime.value = t;
    u.uBlackTop.value = 0;
    u.uBlueH.value = 0.3 + 0.25 * (S.reg(t) - 0.5);
    u.uRedAmt.value = 0.18;
    u.uMurk.value = 0.25 * smoothstep(tR10, tEnd, t);
    u.uSun.value.set(hx(t) - 120, 150, 26, 1 - smoothstep(tR10, tFall, t));
    u.uCloudGap.value.set(0, 0, 1, 0);
    const tw = W.swellT(t);
    seaFar.set(tw, 0.2 + 0.15 * str, t);
    seaMid.set(tw, 0.3 + 0.35 * lows, t);
    seaNear.set(tw, 0.35 + 0.55 * lows, t);
    seaFore.set(tw, 0.45 + 0.5 * lows, t);
    for (const b of [seaFar, seaMid, seaNear]) b.u.uGlint.value = clamp(0.3 + 0.5 * S.energy.violins(t));
    const x = hx(t);
    fleet.forEach((f) => {
      const v = visibleK(f.k, t);
      f.s.root.visible = v > 0.001;
      const band = f.z > -8 ? seaNear : seaMid;
      ride(f.s, band, x + f.dx - 30 * (1 - v), t, { z: f.z - 0.5 });
      f.s.setSail({ hoist: 0.97, wind: w, snap: snapOf(f.k, t), t: t + f.k * 0.37, pen: penOf(f.k, t) });
      if (f.k === 0) f.s.poseCaptain(W.horns(t), t, w);
    });
    // putous: alkaa vasta ankkurissaan (harppujen glissando)
    fallG.visible = t >= tFall - 0.6;
    const flowT = W.integ ? 0 : 0;
    void flowT;
    dashes.forEach((m, k) => {
      const sp = 9 + 5 * hash1(k + 70);
      const len = FTOP + 2;
      m.position.y = FTOP - ((hash1(k + 71) * len + t * sp) % len);
    });
    const recent = fallEvents.filter((e) => e <= t + S.LEAD && e > t - 1.6).slice(-10);
    gushes.forEach((g, i) => {
      const e = recent[i];
      if (e === undefined) { g.visible = false; return; }
      const a = t - (e - S.LEAD);
      g.visible = true;
      g.position.y = FTOP - 1 - a * 16;
      g.scale.set(0.9 + 0.3 * a, 1, 1);
      gushMats[i].uniforms.uAppear.value = 1 - smoothstep(1.0, 1.5, a);
    });
    const fe = fallEvents.filter((e) => e + 1.4 <= t + S.LEAD && e + 1.4 > t - 1).map((e, k) => ({ t: e + 1.4, x: FX - 3 + 6 * hash1(Math.round(e * 100)), y: 0.2, s: 1.6 }));
    foam.set(t, fe.slice(-10), S.LEAD);
    const vv = S.energy.violins(t);
    wind.set((i) => {
      if (hash1(i * 7 + 1) > vv * 1.1) return null;
      const span = 110;
      const ph = (hash1(i * 5) * span + W.windX(t) * (0.8 + hash1(i * 3))) % span;
      return { x: x - 60 + ph, y: 3 + 26 * hash1(i * 11), ang: 0.04, len: (1.5 + 3.5 * hash1(i * 13)) * (0.4 + w), w: 0.07 };
    });
    return { dim: 0, wind: w };
  }
  return { scene, update, shots };
}
