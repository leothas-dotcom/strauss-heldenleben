// B, aamunkoiton laakso (0:07.6–0:49.8): kuvakäsikirjoituksen rivit 1–4.
//   1 Syvyydestä: käyrätorvet aloittavat teeman, sellot ja bassot jatkavat. Johtaja kiipeää
//     harjanteelle, keihäs nousee melodian mukana, ja vuoret kohoavat sumusta bassojen voimalla.
//   2 Viulut nostavat: tuulen viirut ja pääskyparvi, viiri kasvaa ja taivas kirkastuu.
//   3 Auringonnousu (Zarathustra): lautasiskussa sädekehä, selkäkuva auringon edessä, valo tulvii.
//   4 Sankarit: käyrätorvet, vasket ja patarummut, viulut vaiti. Seitsemän ritaria nousee
//     harjanteelle, trumpettien viirit nousevat, kellot nousevat taivaalle käyrätorvien huipussa.

import * as THREE from 'three';
import { C, ink, flat, group, poly, ridgeGeo, skylineGeo, outline, rect, sky as makeSky, streaks, swallowShape, strokeGeo, waveMat, pennantGeo, circle, clamp, smoothstep, mix, hash1, vnoise1 } from './paper.js';
import { knight, knightBack, poseKnight, KP, kmix } from './puppets.js';
import { leader, camPath, ease } from './hero.js';

export function build(K) {
  const { S } = K;
  const T0 = S.T0;
  const seg = K.seg;
  const scene = new THREE.Scene();
  const SKY = makeSky(scene);
  // --- kerrokset kaukaa lähelle ---
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
  const ridgeMat = ink(C.black, {});
  flat(scene, skylineGeo(topPts, -80), ridgeMat, { z: 0 });
  const rimMat = ink(C.paper, {});
  const rim = flat(scene, strokeGeo(topPts, 0.07), rimMat, { z: 0.01 });
  // etualan kivet (multiplane)
  const foreMat = ink(C.black, {});
  flat(scene, poly([[-30, -20], [-30, -2], [-24, -1.2], [-19, -2.6], [-15, -4.5], [-14, -20]]), foreMat, { z: 7 });
  flat(scene, poly([[14, -20], [15, -5], [19, -2.2], [24, -1.4], [30, -2.5], [30, -20]]), foreMat, { z: 7.5 });

  // --- sankarit ---
  const L = leader(scene, {});
  const back = knightBack(scene);
  const backLance = group(back.root, { x: 0.5, y: 1.0, z: 0.03 });
  flat(backLance, rect(0.05, 3.6, 0.5, 0), ink(C.black), {});
  const backFlag = flat(backLance, pennantGeo(2.2, 0.8), waveMat(C.red, { amp: 0.2, k: 5 }), { y: 3.3, z: 0.01 });
  const XS = [-9.6, -7.0, -4.3, 3.7, 6.3, 8.9, 11.5];
  const mates = XS.map((x, i) => {
    const P = knight(scene, { raster: [0, 0.15, 0.3, 0.1, 0.25, 0.05, 0.2][i], coilRaster: 0.15 * (i % 2) });
    P.x = x;
    P.z = -0.35 - 0.04 * i;
    return P;
  });
  // trumpettien ja pasuunoiden viirit
  const PX = [-8.3, -5.6, -2.2, 5.0, 7.6, 10.2];
  const pennants = PX.map((x, i) => {
    const g = group(scene, { x, z: -1.3 });
    flat(g, rect(0.07, 4.6, 0.5, 0), ink(C.black), {});
    const col = [C.red, C.paper, C.red, C.paper, C.red, C.paper][i];
    const m = waveMat(col, { shade: C.black, raster: col === C.paper ? 0 : 0.0, amp: 0.2, k: 6 });
    flat(g, pennantGeo(2.4, 0.75), m, { y: 4.2, z: 0.01 });
    flat(g, poly([[-0.12, 4.6], [0.12, 4.6], [0, 4.95]]), ink(C.paper), { z: 0.02 });
    return { g, m };
  });

  // --- tuuli ja pääskyt (viulut) ---
  const windMat = ink(C.paper, {});
  const wind = streaks(scene, 170, windMat, 1.2);
  const NBIRD = 46;
  const birds = new THREE.InstancedMesh(new THREE.ShapeGeometry(swallowShape()), ink(C.paper, {}), NBIRD);
  const birdsO = new THREE.InstancedMesh(outline(swallowShape(), 0.05), ink(C.black, {}), NBIRD);
  for (const b of [birds, birdsO]) { b.frustumCulled = false; b.position.z = 2; scene.add(b); }
  birdsO.position.z = 2.001;
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), zA = new THREE.Vector3(0, 0, 1), pv = new THREE.Vector3(), sv = new THREE.Vector3();

  // --- ajat ---
  const tViol = seg(1);      // 0:17.6 viulut
  const tSun0 = 30.0;        // auringonnousun kohtaus
  const cymSun = S.cymbalHits.find((h) => h.t > 29 && h.t < 36)?.t ?? 32.5;
  const tBack = 35.0;
  const tHeroes = seg(4);    // 0:39.4 sankarit (vahvistettu)
  const tEnd = seg(5);
  const rise = (t) => ease(smoothstep(T0 - 0.2, T0 + 4.4, t));
  const mel = (t) => clamp((S.melody(t + K.LEAD) - 48) / 24);
  const horns = (t) => smoothstep(0.3, 0.8, S.energy.horns(t));

  function leaderState(t) {
    let pose;
    if (t < T0 + 4.4) {
      const c = Math.floor((t - T0) / 0.55) % 2 ? KP.climbB : KP.climbA;
      pose = kmix(c, KP.stand, smoothstep(T0 + 3.6, T0 + 4.4, t));
    } else if (t < tViol) {
      pose = { ...KP.lanceUp, aN: 1.45 + 1.3 * mel(t) };
    } else if (t < tBack) {
      pose = { ...KP.lanceUp, aN: 2.55 + 0.18 * Math.sin(t * 1.3), lean: -0.06 + 0.04 * Math.sin(t * 0.9) };
    } else if (t < tHeroes) {
      pose = kmix(KP.proud, KP.call, smoothstep(tHeroes - 2.2, tHeroes - 0.2, t));
    } else {
      pose = kmix(KP.proud, KP.call, horns(t));
    }
    pose = { ...pose, cape: S.energy.violins(t) };
    return { x: 0, y: -2.8 * (1 - rise(t)), z: -0.3, facing: 1, pose };
  }
  const windAt = (t) => {
    const v = S.energy.violins(t);
    const l = S.loud(t);
    return { x: -(0.6 + 2.6 * v + 0.8 * l), y: 0.2 + 2.6 * v };
  };

  const shots = [
    { name: '1 matala nousu: johtaja kiipeää', a: T0, b: T0 + 5.0, cam: camPath([{ pos: [0.6, -1.2, 13.5], look: [0, 1.2, 0], fov: 42 }, { pos: [0.6, 0.4, 12.5], look: [0, 2.4, 0], fov: 42 }]) },
    { name: '1 sivuprofiili: keihäs nousee teeman mukana', a: T0 + 5.0, b: tViol, cam: camPath([{ pos: [6.5, 1.5, 9.5], look: [0.3, 2.4, 0], fov: 40 }, { pos: [3.5, 2.4, 9.5], look: [0.4, 3.4, 0], fov: 40 }]) },
    { name: '2 lento pääskyjen mukana ylös', a: tViol, b: seg(2), cam: camPath([{ pos: [-7, -3, 19], look: [-1, 1, 0], fov: 44 }, { pos: [-2, 3, 16], look: [1, 4, -6], fov: 44 }, { pos: [4, 9, 15], look: [3, 8, -20], fov: 44 }]) },
    { name: '2 laaja: laakso ja tuuli', a: seg(2), b: tSun0, cam: camPath([{ pos: [3, 7.5, 36], look: [3, 4, -30], fov: 42 }, { pos: [2, 6, 31], look: [2, 4, -30], fov: 42 }]) },
    { name: '3 selkäkuva auringon edessä', a: tSun0, b: tBack, cam: camPath([{ pos: [0.8, 1.2, 7], look: [30, 70, -480], fov: 50 }, { pos: [0.6, 1.0, 5.8], look: [36, 90, -480], fov: 50 }]) },
    { name: '3 vastakuva: valo ja kello kääntyy', a: tBack, b: tHeroes, cam: camPath([{ pos: [2.6, 2.3, 7.2], look: [0.1, 2.5, 0], fov: 38 }, { pos: [1.3, 2.6, 4.9], look: [0.0, 2.7, 0], fov: 38 }]) },
    { name: '4 matala edestä: kahdeksan nousee', a: tHeroes, b: tHeroes + 4.2, cam: camPath([{ pos: [1, -0.6, 23], look: [1, 2.4, 0], fov: 42 }, { pos: [1, -0.2, 20.5], look: [1, 2.6, 0], fov: 42 }]) },
    { name: '4 sivuajo rivin ohi', a: tHeroes + 4.2, b: tHeroes + 7.4, cam: camPath([{ pos: [-10, 1.6, 7.5], look: [-7, 2.4, 0], fov: 40 }, { pos: [7, 1.9, 7.5], look: [9, 2.6, 0], fov: 40 }]) },
    { name: '4 lähikuva johtajasta', a: tHeroes + 7.4, b: tEnd + 1, cam: camPath([{ pos: [2.2, 2.4, 5.6], look: [0.1, 2.5, 0], fov: 38 }, { pos: [1.6, 2.7, 4.6], look: [0.1, 2.8, 0], fov: 38 }]) },
  ];

  function update(t) {
    // vuoret kohoavat sumusta bassojen mukana
    const lows = S.energy.lows(t);
    const up = smoothstep(T0 - 1, T0 + 12, t);
    far3.position.y = -42 * (1 - up) - 3 * (1 - lows);
    far2.position.y = -26 * (1 - up) - 2 * (1 - lows);
    mid.position.y = -9 * (1 - smoothstep(T0, T0 + 9, t));
    mist1.position.x = t * 1.5;
    mist2.position.x = -t * 2.2;
    // taivas: sarastus -> aamu
    const u = SKY.u;
    u.uTime.value = t;
    u.uBlackTop.value = 0.85 * (1 - smoothstep(T0, cymSun, t));
    u.uBlueH.value = mix(-0.25, 0.3, smoothstep(T0, cymSun + 2, t)) + 0.2 * smoothstep(cymSun, tEnd, t);
    u.uRedAmt.value = 0.75 * smoothstep(T0 - 2, T0 + 5, t) * (1 - 0.6 * smoothstep(cymSun, tEnd, t));
    const sunY = mix(40, 150, ease(smoothstep(T0, cymSun, t))) + 45 * smoothstep(cymSun, tEnd, t);
    u.uSun.value.set(60, sunY, 26, t > T0 - 1 ? 1 : 0);
    const r = t < cymSun - 0.3 ? 0 : t < cymSun ? (t - cymSun + 0.3) / 0.3 : Math.exp(-(t - cymSun) / 2.2);
    u.uRays.value = r;
    for (let k = 0; k < 6; k++) u.uBands.value[k] = clamp(S.bands[k](Math.min(t, cymSun + 0.1)) * 1.4);
    rimMat.uniforms.uColor.value.copy(t > cymSun ? C.red : C.paper);

    // johtaja (selkäkuvassa erillinen nukke)
    const backView = t >= tSun0 - 0.02 && t < tBack;
    L.P.root.visible = !backView;
    L.place(t, leaderState, windAt, { noBanner: backView, noLance: backView, capeWind: S.energy.violins(t) });
    back.root.visible = backView;
    back.root.position.set(0, 0, -0.3);
    back.M.cape.uniforms.uTime.value = t;
    back.M.cape.uniforms.uAmp.value = 0.1 + 0.2 * S.loud(t);
    backFlag.material.uniforms.uTime.value = t;
    backLance.rotation.z = -0.1 + 0.03 * Math.sin(t);
    back.armR.rotation.z = 0.35;
    // toverit nousevat harjanteelle 0:39.4
    mates.forEach((P, i) => {
      const r2 = ease(smoothstep(tHeroes - 0.7 + i * 0.13, tHeroes + 1.4 + i * 0.13, t));
      P.root.visible = r2 > 0.001;
      P.root.position.set(P.x, -2.9 * (1 - r2), P.z);
      const h = horns(t - 0.04 * i);
      const pose = kmix(kmix(KP.proud, KP.stand, 0.3 * (i % 2)), KP.call, h);
      poseKnight(P, { ...pose, tilt: pose.tilt + 0.05 * Math.sin(t * 1.1 + i) }, t, S.energy.violins(t));
    });
    // viirit nousevat, kun trumpetit ja pasuunat soivat
    const tp = smoothstep(0.15, 0.7, S.energy.brass(t));
    pennants.forEach((p, i) => {
      const r3 = ease(smoothstep(tHeroes - 0.3 + i * 0.18, tHeroes + 2.0 + i * 0.18, t));
      p.g.visible = r3 > 0.001;
      p.g.position.y = -5 * (1 - r3);
      p.m.uniforms.uTime.value = t + i * 0.3;
      p.m.uniforms.uAmp.value = 0.06 + 0.3 * tp;
    });
    // tuulen viirut ja pääskyt: viulut
    const v = S.energy.violins(t);
    const lo = S.loud(t);
    wind.set((i) => {
      if (hash1(i * 7 + 1) > v * 1.1) return null;
      const sp = (5 + 6 * hash1(i * 3)) * (0.6 + lo);
      const span = 60;
      const ph = (hash1(i * 5) * span + t * sp) % span;
      const x = -30 + ph;
      const y = -9 + 24 * hash1(i * 11) + ph * 0.32;
      return { x, y, ang: 0.32, len: (1.2 + 3 * hash1(i * 13)) * (0.4 + v), w: 0.045 };
    });
    const flockT = t - tViol;
    for (let i = 0; i < NBIRD; i++) {
      const vis = flockT > -0.5 && hash1(i * 3 + 9) < 0.25 + v;
      if (!vis) { m4.makeScale(0, 0, 0); birds.setMatrixAt(i, m4); birdsO.setMatrixAt(i, m4); continue; }
      // parvi nousee laaksosta (vasen alhaalla) ylös oikealle ja kiertää korkealla
      const s = clamp(flockT / 6);
      const cx = mix(-12, 9, ease(s)) + (s >= 1 ? 7 * Math.sin((flockT - 6) * 0.35) : 0);
      const cy = mix(-6, 10, ease(s)) + (s >= 1 ? 3 * Math.cos((flockT - 6) * 0.35) : 0);
      const ox = 3.2 * (hash1(i * 17) - 0.5) + 0.8 * Math.sin(t * 0.9 + i);
      const oy = 2.4 * (hash1(i * 19) - 0.5) + 0.6 * Math.cos(t * 1.1 + i * 1.7);
      const flap = 0.4 + 0.6 * Math.abs(Math.sin(t * 11 + i * 2.1));
      q.setFromAxisAngle(zA, s < 1 ? 0.6 : 0.35 * Math.cos((flockT - 6) * 0.35));
      pv.set(cx + ox, cy + oy, hash1(i * 23) * 3 - 1);
      sv.set(0.55, 0.55 * flap, 1);
      m4.compose(pv, q, sv);
      birds.setMatrixAt(i, m4);
      birdsO.setMatrixAt(i, m4);
    }
    birds.instanceMatrix.needsUpdate = true;
    birdsO.instanceMatrix.needsUpdate = true;
    // patarummut tärisyttävät maata
    let shake = 0;
    for (const h of S.percHits) {
      const a = t - h.t;
      if (a >= 0 && a < 0.6 && h.t > 29) shake += 5 * h.s * Math.exp(-a / 0.12) * Math.cos(a * 60);
    }
    const dim = t < T0 ? 0.45 : 0.45 * (1 - smoothstep(T0, tSun0 + 2, t));
    return { dim, shake };
  }
  return { scene, update, shots };
}
