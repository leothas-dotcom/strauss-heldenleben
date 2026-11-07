// B, aamunkoiton laakso: kuvakäsikirjoituksen otot 1–6 (ankkurit held_alku ... held_lyyrinen).
//   1 Ritari nousee laakson pohjalta selkäkuvassa (1/2); keihäs ja viiri nousevat melodian mukana.
//   2 Toverien sointuiskut: kahdeksan kelloa välähtää harjanteen takaa (koko = iskun z); ritari
//     ja kamera jatkavat nousuaan.
//   3 Viulut: ensimmäinen säde välähtää ritarin kellossa, tuuli syttyy taivaalle.
//   4 Vasket ja patarummut: aurinko nousee (ei sädekehää: se säästetään dom7:ään), viirit nousevat
//     harjanteen takaa, patarummun lyönnit nostavat pölyä harjanteen reunalta.
//   5 Kahdeksan torviritaria nousee riviin; viirit nykivät trumpettien soinnuissa; viulut vaiti.
//   6 Viulujen juoksutus: tuulenpuuska nostaa viirit.

import * as THREE from 'three';
import { C, ink, flat, group, poly, ridgeGeo, skylineGeo, rect, cloud, sky as makeSky, streaks, strokeGeo, waveMat, pennantGeo, circle, clamp, smoothstep, mix, hash1, vnoise1 } from './paper.js';
import { knight, knightBack, poseKnight, KP, kmix } from './puppets.js';
import { leader, camPath, ease } from './hero.js';

export function build(K) {
  const { S } = K;
  const T0 = S.T0;
  const A = S.A;
  const tHits = ['held_isku_t6', 'held_isku_t8', 'held_isku_t11'].map((id) => A(id));
  const tViol = A('held_viulut').t;            // kohotahti
  const tBrass = A('held_vasket_t13').t;
  const tHeroes = A('held_intro_loppuu').t;    // vahvistettu
  const tGust = A('held_viulut_paluu').t;
  const tEnd = A('held_lyyrinen').t;

  const scene = new THREE.Scene();
  const SKY = makeSky(scene);
  const far3 = flat(scene, ridgeGeo(-700, 700, 52, 3, { lambda: 170, base: -400 }), ink(C.paper, { shade: C.blue, raster: 0.24 }), { z: -230 });
  const far2 = flat(scene, ridgeGeo(-450, 450, 40, 7, { lambda: 90, base: -250 }), ink(C.paper, { shade: C.blue, raster: 0.5 }), { z: -125 });
  const mist1 = flat(scene, rect(1200, 14), ink(C.paper, { shade: C.blue, raster: 0.1 }), { z: -100, y: 2 });
  const mid = flat(scene, ridgeGeo(-260, 260, 22, 11, { lambda: 48, base: -160 }), ink(C.blue, { grad: [C.black, 6, -12, 0.85] }), { z: -46 });
  const mist2 = flat(scene, rect(700, 6), ink(C.paper, { shade: C.blue, raster: 0.22 }), { z: -30, y: -3 });
  // pääharjanne: tasanne ritareille (x -15..17)
  const topPts = [];
  for (let i = 0; i <= 160; i++) {
    const x = -130 + (260 * i) / 160;
    const plateau = 1 - smoothstep(14, 26, Math.abs(x - 1));
    const y = plateau * (0.12 * (vnoise1(x * 0.8, 5) - 0.5)) + (1 - plateau) * (-0.32 * Math.max(0, Math.abs(x - 1) - 14) + 3.5 * (vnoise1(x / 9, 9) - 0.5));
    topPts.push([x, y]);
  }
  flat(scene, skylineGeo(topPts, -80), ink(C.black, {}), { z: 0 });
  const rimMat = ink(C.paper, {});
  flat(scene, strokeGeo(topPts, 0.07), rimMat, { z: 0.01 });
  const foreMat = ink(C.black, {});
  flat(scene, poly([[-30, -20], [-30, -2], [-24, -1.2], [-19, -2.6], [-15, -4.5], [-14, -20]]), foreMat, { z: 7 });
  flat(scene, poly([[14, -20], [15, -5], [19, -2.2], [24, -1.4], [30, -2.5], [30, -20]]), foreMat, { z: 7.5 });

  // --- ritari (profiili ja selkäkuva) ---
  const L = leader(scene, {});
  const back = knightBack(scene);
  const backLance = group(back.root, { x: 0.5, y: 1.0, z: 0.03 });
  flat(backLance, rect(0.05, 3.6, 0.5, 0), ink(C.black), {});
  const backFlag = flat(backLance, pennantGeo(2.2, 0.8), waveMat(C.red, { amp: 0.2, k: 5 }), { y: 3.3, z: 0.01 });
  // välähdys kellossa (viulujen ensimmäinen säde)
  const glint = group(scene, { z: 0.6 });
  const glintMat = ink(C.paper, {});
  flat(glint, poly([[0, 0.9], [0.12, 0.12], [0.9, 0], [0.12, -0.12], [0, -0.9], [-0.12, -0.12], [-0.9, 0], [-0.12, 0.12]]), glintMat, {});

  // --- toverit: 7 torviritaria harjanteen alla ---
  const XS = [-9.6, -7.0, -4.3, 3.7, 6.3, 8.9, 11.5];
  const XSB = XS.map((x) => x * 0.42);   // piilossa ryhmässä kuva-alalla, riviin ennen nousua
  const mates = XS.map((x, i) => {
    const P = knight(scene, { raster: [0, 0.15, 0.3, 0.1, 0.25, 0.05, 0.2][i], coilRaster: 0.15 * (i % 2) });
    P.x = x;
    P.z = -0.35 - 0.04 * i;
    return P;
  });
  // heraldiset viirit (vasket)
  const PX = [-8.3, -5.6, -2.2, 5.0, 7.6, 10.2];
  const pennants = PX.map((x, i) => {
    const g = group(scene, { x, z: -1.3 });
    flat(g, rect(0.07, 4.6, 0.5, 0), ink(C.black), {});
    const col = [C.red, C.paper, C.red, C.paper, C.red, C.paper][i];
    const m = waveMat(col, { shade: C.black, amp: 0.2, k: 6 });
    flat(g, pennantGeo(2.4, 0.75), m, { y: 4.2, z: 0.01 });
    flat(g, poly([[-0.12, 4.6], [0.12, 4.6], [0, 4.95]]), ink(C.paper), { z: 0.02 });
    return { g, m };
  });
  const wind = streaks(scene, 170, ink(C.paper, {}), 1.2);
  // kellojen välähdys sointuiskussa (jokaisella toverilla oma)
  const bellGlints = XS.map(() => { const g = group(scene, { z: 0.2 }); flat(g, poly([[0, 0.7], [0.1, 0.1], [0.7, 0], [0.1, -0.1], [0, -0.7], [-0.1, -0.1], [-0.7, 0], [-0.1, 0.1]]), ink(C.paper, {}), {}); g.visible = false; return g; });
  // patarummun lyönnit: pölypilvi nousee harjanteen reunalta (elementti, ei koko kuvan tärähdys)
  const puffMats = [];
  const puffs = [-11, -6.5, -2.5, 2.5, 6.8, 11.2].map((x, i) => {
    const m = ink(C.paper, { shade: C.blue, raster: 0.3 });
    puffMats.push(m);
    const g = flat(scene, cloud(2.4, 0.9, 500 + i, false), m, { x, y: 0.05, z: 0.3 });
    g.visible = false;
    return g;
  });

  // --- data ---
  const mel = (t) => clamp((S.melody(t + S.LEAD) - 48) / 24);
  const horns = (t) => smoothstep(0.3, 0.8, S.energy.horns(t));
  // viulut soivat: kohotahdista tahdin 17 taukoon ja taas tahdista 20 (partituuri, ankkurit)
  const violinsOn = (t) => (t >= tViol - 0.1 && t < tHeroes) || t >= tGust - 0.1;
  const violins = (t) => (violinsOn(t) ? Math.max(0.45, S.energy.violins(t)) : 0) * smoothstep(tViol - 0.1, tViol + 0.8, t);
  // toverien sointuiskut (T. 6, 8, 11: kahdeksan käyrätorvea, fagotit, kontrabassot f): kellot
  // ponnahtavat harjanteen yli iskun ruudulla ja painuvat hitaasti takaisin. Partituurin iskuilla ei
  // ole mitattua z:aa, joten ne ovat täysikokoisia (koko kirjoitetusta f:stä).
  const hitAmp = (t) => tHits.reduce((m, h) => Math.max(m, S.pulse(t, h.t, 0.85) * (h.z == null ? 1 : clamp((h.z - 2.5) / 3.5, 0.4, 1))), 0);
  // patarummun lyönnit vaskien tulosta alkaen
  const drum = S.strokesIn(tBrass - 0.2, tEnd);
  const low = S.accIn(tBrass, tHeroes, 5).filter((x) => x.kaistat_z.matala > 6);
  // trumpettien toistuvat soinnut tahdeista 17-19: nuotinalut
  const tptOns = S.onsetsIn(tHeroes, tGust);
  const tptFlick = (t) => tptOns.reduce((s, o) => s + S.pulse(t, o, 0.15), 0);

  function leaderState(t) {
    let pose;
    if (t < tHeroes) pose = { ...KP.lanceUp, aN: 1.45 + 1.3 * mel(t), lean: -0.04 + 0.03 * Math.sin(t * 0.9) };
    else pose = kmix(KP.proud, KP.call, horns(t));
    return { x: 0, y: 0, z: -0.3, facing: 1, pose: { ...pose, cape: violins(t) } };
  }
  const windAt = (t) => ({ x: -(0.5 + 2.6 * violins(t) + 0.8 * S.loud(t)), y: 0.2 + 2.4 * violins(t) });

  // --- otot ---
  const backEnd = tViol;                // selkäkuva iskut mukaan lukien, ei leikkausta
  const shots = [
    { name: '1 selkäkuva: ritari nousee laaksosta, viiri melodian mukana', a: T0, b: backEnd,
      cam: camPath([{ pos: [0.9, -0.9, 6.6], look: [6, 5, -120], fov: 50 }, { pos: [0.8, 0.4, 6.0], look: [10, 22, -200], fov: 50 }]) },
    { name: '3 nosturi: säde ja tuuli', a: backEnd, b: tBrass,
      cam: camPath([{ pos: [5.6, 1.4, 8.8], look: [0.4, 2.6, 0], fov: 40 }, { pos: [4.4, 3.2, 11.5], look: [0.6, 4.0, -8], fov: 42 }]) },
    { name: '4 laaja: aurinko nousee, viirit harjanteen takaa', a: tBrass, b: tHeroes,
      cam: camPath([{ pos: [2, 6.5, 32], look: [2, 4.5, -30], fov: 42 }, { pos: [1.5, 5.2, 27], look: [2, 5, -30], fov: 42 }]) },
    { name: '5 matala edestä: kahdeksan nousee', a: tHeroes, b: tHeroes + 3.4,
      cam: camPath([{ pos: [1, -0.6, 23], look: [1, 2.4, 0], fov: 42 }, { pos: [1, -0.2, 20.5], look: [1, 2.6, 0], fov: 42 }]) },
    { name: '5 sivuajo rivin ohi', a: tHeroes + 3.4, b: tGust,
      cam: camPath([{ pos: [-10, 1.6, 7.5], look: [-7, 2.4, 0], fov: 40 }, { pos: [3, 1.8, 7.5], look: [5, 2.5, 0], fov: 40 }]) },
    { name: '6 lähikuva: puuska nostaa viirit', a: tGust, b: tEnd + 1.5,
      cam: camPath([{ pos: [2.4, 2.6, 6.8], look: [0.2, 3.0, 0], fov: 40 }, { pos: [1.8, 3.0, 6.0], look: [0.2, 3.4, 0], fov: 40 }]) },
  ];

  function update(t) {
    const lows = S.energy.lows(t);
    const up = smoothstep(T0 - 1, T0 + 12, t);
    far3.position.y = -42 * (1 - up) - 3 * (1 - lows);
    far2.position.y = -26 * (1 - up) - 2 * (1 - lows);
    mid.position.y = -9 * (1 - smoothstep(T0, T0 + 9, t));
    mist1.position.x = t * 1.5;
    mist2.position.x = -t * 2.2;
    // taivas: yö -> sarastus (teema) -> valo (viulut) -> aamu (vasket ja aurinko)
    const u = SKY.u;
    u.uTime.value = t;
    u.uBlackTop.value = 0.85 * (1 - smoothstep(T0, tViol + 1, t));
    u.uBlueH.value = mix(-0.25, 0.1, smoothstep(T0, tViol, t)) + 0.25 * smoothstep(tViol, tHeroes, t) + 0.1 * smoothstep(tHeroes, tEnd, t);
    u.uRedAmt.value = 0.75 * smoothstep(T0 - 2, T0 + 5, t) * (1 - 0.6 * smoothstep(tBrass, tEnd, t));
    const sunY = mix(-10, 40, smoothstep(T0, tBrass, t)) + 110 * ease(smoothstep(tBrass, tHeroes, t)) + 30 * smoothstep(tHeroes, tEnd, t);
    u.uSun.value.set(60, sunY, 26, t > T0 - 1 ? 1 : 0);
    u.uRays.value = 0;
    rimMat.uniforms.uColor.value.copy(t > tBrass ? C.red : C.paper);

    // ritari: selkäkuva oton 1 ajan
    const backView = t < backEnd;
    L.P.root.visible = !backView;
    L.place(t, leaderState, windAt, { noBanner: backView, noLance: backView, capeWind: violins(t) });
    back.root.visible = backView;
    const riseB = ease(smoothstep(T0 - 0.3, T0 + 5.5, t));
    back.root.position.set(0, -3.2 * (1 - riseB), -0.3);
    back.M.cape.uniforms.uTime.value = t;
    back.M.cape.uniforms.uAmp.value = 0.1 + 0.2 * S.loud(t);
    backFlag.material.uniforms.uTime.value = t;
    // keihäs nousee melodian mukana (laulu)
    backLance.rotation.z = mix(0.75, -0.18, mel(t)) + 0.03 * Math.sin(t);
    back.armR.rotation.z = 0.35 + 0.4 * mel(t);
    // kellon välähdys kohotahdissa
    const g = S.pulse(t, tViol, 0.5);
    glint.visible = g > 0.02 && !backView;
    if (glint.visible) {
      glint.position.set(0.25, 3.55, 0.6);
      glint.scale.setScalar(0.25 + 1.1 * g);
      glint.rotation.z = 0.6 * (t - tViol);
    }

    // toverit: piilossa harjanteen alla; iskuissa kellot pilkahtavat, tahdissa 17 nousevat
    const hp = hitAmp(t);
    mates.forEach((P, i) => {
      const r2 = ease(smoothstep(tHeroes - S.LEAD + i * 0.05, tHeroes + 1.0 + i * 0.07, t));
      const peek = t < tHeroes ? 2.1 * hp : 0;
      const y = -3.6 * (1 - r2) + peek;
      const x = mix(XSB[i], P.x, smoothstep(tHeroes - 1.6, tHeroes - 0.6, t));
      P.root.visible = y > -3.5;
      P.root.position.set(x, y, P.z);
      const gl = bellGlints[i];
      gl.visible = t < tHeroes && hp > 0.3;
      if (gl.visible) { gl.position.set(x + 0.15, y + 2.15, P.z + 0.2); gl.scale.setScalar(0.12 + 0.3 * hp); gl.rotation.z = 0.8 * hp + i; }
      const h = t >= tHeroes ? horns(t - 0.04 * i) : clamp(hp);
      const pose = kmix(kmix(KP.proud, KP.stand, 0.3 * (i % 2)), KP.call, h);
      poseKnight(P, { ...pose, tilt: pose.tilt + 0.05 * Math.sin(t * 1.1 + i) }, t, violins(t));
    });
    // viirit: nousevat vaskien tullessa, nykivät trumpettien soinnuissa, puuska nostaa
    const gust = S.pulse(t, tGust, 1.1);
    pennants.forEach((p, i) => {
      const r3 = ease(smoothstep(tBrass + i * 0.25, tBrass + 3.0 + i * 0.25, t));
      p.g.visible = r3 > 0.001;
      p.g.position.y = -5 * (1 - r3) + (t >= tHeroes && t < tGust ? 0.12 * tptFlick(t) : 0);
      p.m.uniforms.uTime.value = t + i * 0.3;
      p.m.uniforms.uAmp.value = 0.06 + 0.25 * smoothstep(0.15, 0.7, S.energy.brass(t)) + 0.4 * gust;
    });
    // tuuli = viulut
    const v = violins(t);
    const lo = S.loud(t);
    wind.set((i) => {
      if (hash1(i * 7 + 1) > v * 1.1 + 1.2 * gust) return null;
      const sp = (5 + 6 * hash1(i * 3)) * (0.6 + lo + 2 * gust);
      const span = 60;
      const ph = (hash1(i * 5) * span + t * sp) % span;
      return { x: -30 + ph, y: -9 + 24 * hash1(i * 11) + ph * 0.32, ang: 0.32, len: (1.2 + 3 * hash1(i * 13)) * (0.4 + v + gust), w: 0.045 };
    });
    // patarummut ja matalat iskut: pölypilvet harjanteen reunalla (puolet pilvistä per lyönti)
    const thuds = [...drum.map((d) => ({ t: d, s: 0.6 })), ...low.map((x) => ({ t: x.t, s: 1 }))];
    puffs.forEach((g, i) => {
      let best = null;
      for (const e of thuds) { const a = t - (e.t - S.LEAD); if (a >= 0 && a < 0.8 && hash1(e.t * 7 + i) < 0.55 && (!best || a < best.a)) best = { a, s: e.s }; }
      g.visible = !!best;
      if (!best) return;
      const r = best.s * (0.5 + 1.2 * ease(clamp(best.a / 0.4)));
      g.scale.set(r, r * (1 + best.a), 1);
      puffMats[i].uniforms.uAppear.value = 1 - smoothstep(0.3, 0.8, best.a);
    });
    const dim = t < T0 ? 0.45 : 0.45 * (1 - smoothstep(T0, tViol + 2, t));
    return { dim };
  }
  return { scene, update, shots };
}
