// E, kultainen niitty: kuvakäsikirjoituksen otot 13–15 (ankkurit held_tunnelma_vaihtuu ... held_t61).
//   13 Tunnelma vaihtuu: kultainen aamupäivä, värit hennot; kaksi pääskyä (huilu ja englannintorvi)
//      leikkii ritarin ympärillä nuotinalkujen tahdissa; ritari laskee kellonsa.
//   14 Ritari polvistuu puron äärelle; vesi välkkyy hiljaa (harppu), heinät värisevät patarummun
//      tremolossa.
//   15 Kaksi torviritaria laulaa kahden kesken (käyrätorvet I-II), viirit kietoutuvat.

import * as THREE from 'three';
import { C, ink, flat, group, poly, rect, cloud, earleTree, ridgeGeo, skylineGeo, water, waveMat, pennantGeo, swallowShape, outline, sky as makeSky, clamp, smoothstep, mix, hash1, vnoise1 } from './paper.js';
import { knight, poseKnight, KP, kmix } from './puppets.js';
import { leader, camPath, ease } from './hero.js';

export function build(K) {
  const { S } = K;
  const A = K.a, B = K.b;
  const tKneel = S.A('held_t49').t;
  const tDuet = S.A('held_reh6').t;
  const scene = new THREE.Scene();
  const SKY = makeSky(scene);
  // maisema: kaukaiset kukkulat, niitty, puro, puut
  flat(scene, ridgeGeo(-500, 500, 30, 51, { lambda: 120, base: -300 }), ink(C.paper, { shade: C.blue, raster: 0.18 }), { z: -200 });
  flat(scene, ridgeGeo(-260, 260, 12, 53, { lambda: 55, base: -120 }), ink(C.paper, { shade: C.blue, raster: 0.32 }), { z: -80 });
  const treeMat = ink(C.paper, { shade: C.blue, raster: 0.45 });
  for (let k = 0; k < 26; k++) flat(scene, earleTree(6 + 5 * hash1(k + 400), 2.4 + hash1(k + 401), k + 400), treeMat, { x: -90 + k * 7.5 + 3 * hash1(k + 402), y: -1.5, z: -40 });
  const meadowPts = [];
  for (let i = 0; i <= 300; i++) { const x = -150 + i; meadowPts.push([x, -1.2 + 0.6 * vnoise1(x / 10, 57)]); }
  flat(scene, skylineGeo(meadowPts, -40), ink(C.paper, { shade: C.blue, raster: 0.22, grad: [C.blue, -2, -10, 0.5] }), { z: -12 });
  const brook = water(scene, 120, 1.6, { x: 0, y: -2.9, z: -2, glint: 0.7 });
  // etualan heinät
  const grass = new THREE.Group(); grass.position.z = 3; scene.add(grass);
  for (let k = 0; k < 120; k++) {
    const x = -30 + k * 0.5 + 0.4 * hash1(k + 500);
    const h = 1 + 1.8 * hash1(k + 501);
    flat(grass, poly([[-0.04, 0], [0.04, 0], [0.25 * (hash1(k + 502) - 0.5), h]]), ink(C.blue, { shade: C.black, raster: 0.3 }), { x, y: -6.5 });
  }
  for (let k = 0; k < 10; k++) flat(scene, cloud(14 + 8 * hash1(k + 600), 4 + 2 * hash1(k + 601), k + 600), ink(C.paper, { shade: C.blue, raster: 0.06 }), { x: -80 + k * 18, y: 18 + 8 * hash1(k + 602), z: -100 });
  // ritari ja kaksi laulavaa toveria
  const L = leader(scene, {});
  const duo = [0, 1].map((i) => {
    const P = knight(scene, { raster: i ? 0.12 : 0, coilRaster: 0.1 });
    const g = group(scene, { z: -0.5 });
    flat(g, rect(0.06, 4.0, 0.5, 0), ink(C.black), {});
    const m = waveMat(i ? C.paper : C.red, { shade: C.black, amp: 0.22, k: 5 });
    flat(g, pennantGeo(2.6, 0.7), m, { y: 3.6, z: 0.01 });
    return { P, g, m, x: i ? 5.6 : 3.2 };
  });
  // kaksi pääskyä
  const birds = [0, 1].map(() => {
    const g = group(scene, { z: 1.5 });
    flat(g, swallowShape(), ink(C.paper), {});
    flat(g, outline(swallowShape(), 0.05), ink(C.black), { z: 0.01 });
    return g;
  });
  // data
  const ons = S.onsetsIn(A - 0.3, B);
  const flap = (t) => ons.reduce((s, o) => s + S.pulse(t, o, 0.12), 0);
  const harpOns = ons.filter((o) => S.fam.harp(o) > 0.2 && o >= tKneel);
  const hum = (t) => (S.rolls.some(([a, b]) => t >= a && t <= b) ? 1 : 0) * smoothstep(tKneel - 0.5, tKneel + 1, t) * (1 - smoothstep(tDuet - 1, tDuet, t));
  const kneel = (t) => ease(smoothstep(tKneel - 1.2, tKneel + 0.8, t)) * (1 - ease(smoothstep(tDuet - 1.5, tDuet + 0.5, t)));
  function leaderState(t) {
    const pose = kmix(kmix(KP.proud, KP.look, smoothstep(A, A + 2, t)), KP.kneel, kneel(t));
    return { x: -1.5, y: -2.4, z: 0, facing: 1, pose: { ...pose, tilt: pose.tilt - 0.6 * smoothstep(A, A + 1.5, t) * (1 - kneel(t)) } };
  }
  const windAt = (t) => ({ x: -(0.4 + 0.8 * S.energy.horns(t)), y: 0.3 });

  const shots = [
    { name: '13 kultainen niitty: kaksi pääskyä', a: A, b: tKneel, cam: camPath([{ pos: [-3, 1.0, 16], look: [0, 0.6, 0], fov: 44 }, { pos: [-1.5, 0.8, 14.5], look: [0, 0.6, 0], fov: 44 }]) },
    { name: '14 puron äärellä', a: tKneel, b: tDuet, cam: camPath([{ pos: [-0.5, -1.2, 8.5], look: [-1.2, -1.6, 0], fov: 40 }, { pos: [-0.2, -1.1, 8.1], look: [-1.0, -1.6, 0], fov: 40 }]) },
    { name: '15 kaksi torviritaria laulaa', a: tDuet, b: tDuet + (B - tDuet) / 2, cam: camPath([{ pos: [2.6, 0.4, 10.5], look: [4.4, 1.0, 0], fov: 40 }, { pos: [5.6, 0.6, 10.0], look: [4.4, 1.2, 0], fov: 40 }]) },
    { name: '15 viirit kietoutuvat', a: tDuet + (B - tDuet) / 2, b: B + 1.5, cam: camPath([{ pos: [4.6, 1.8, 9.0], look: [4.4, 2.4, 0], fov: 42 }, { pos: [4.1, 2.4, 8.4], look: [4.4, 2.8, 0], fov: 42 }]) },
  ];

  function update(t) {
    const u = SKY.u;
    u.uTime.value = t;
    // kultainen aamupäivä: vaalea, hennot värit
    u.uBlueAmt.value = 0.55; u.uBlueH.value = 0.75; u.uBlackTop.value = 0; u.uRedAmt.value = 0.35;
    u.uSun.value.set(40, 120, 30, 1);
    u.uRays.value = 0;
    L.place(t, leaderState, windAt, { capeWind: 0.3, noBanner: t > tKneel - 0.5 && t < tDuet });
    // kaksi pääskyä kiertää ritaria; siivet lyövät nuotinaluissa
    const fl = flap(t);
    birds.forEach((g, i) => {
      const ph = t * (0.9 + 0.25 * i) + i * 2.4;
      const r = 3.2 + 0.8 * Math.sin(t * 0.4 + i);
      g.position.set(-1.5 + r * Math.cos(ph), 2.6 + 1.4 * Math.sin(ph * 1.3) - 0.8 * kneel(t), 1.5 + 0.5 * Math.sin(ph));
      g.rotation.z = 0.4 * Math.cos(ph);
      g.scale.set(0.7 * (Math.cos(ph) > 0 ? 1 : -1), 0.7 * (0.45 + 0.4 * Math.abs(Math.sin(t * 5 + i)) + 0.4 * clamp(fl)), 1);
      g.visible = t < tDuet + 4;
    });
    // kaksi torviritaria: nousevat esiin dueton alussa, kellot laulun mukana
    const d = ease(smoothstep(tDuet - 0.5, tDuet + 2.0, t));
    duo.forEach((k, i) => {
      k.P.root.visible = d > 0.01;
      k.g.visible = d > 0.01;
      k.P.root.position.set(k.x, -2.5 - 2.5 * (1 - d), -0.4 - 0.1 * i);
      const sing = smoothstep(0.25, 0.75, S.energy.horns(t - 0.15 * i));
      poseKnight(k.P, kmix(KP.proud, KP.call, sing * (i ? 0.85 : 1)), t, 0.3);
      // viirit kietoutuvat toisiinsa (toisen viirin kärki kohti toista)
      k.g.position.set(k.x + (i ? -0.7 : 0.7), -2.5 + 1.3 - 2.5 * (1 - d), -0.6);
      k.g.rotation.z = (i ? 0.35 : -0.35) * ease(smoothstep(tDuet + 3, tDuet + 10, t));
      k.m.uniforms.uTime.value = t + i * 0.7;
      k.m.uniforms.uAmp.value = 0.12 + 0.25 * sing;
    });
    // puro: harpun hiljaiset renkaat
    brook.u.uTime.value = t;
    brook.u.uGlint.value = 0.35 + 0.6 * S.fam.harp(t);
    brook.rings.forEach((r) => r.set(0, 0, -99, 0));
    let k = 0;
    for (let i = harpOns.length - 1; i >= 0 && k < 16; i--) {
      const te = harpOns[i];
      if (te > t + S.LEAD || t - te > 3) continue;
      brook.rings[k++].set(-2 + 6 * (hash1(i * 3) - 0.5), -2.8, te, 0.8 + 0.5 * hash1(i * 5));
    }
    // patarummun tremolo: etualan heinät värisevät (ei koko kuvan tärinää)
    const hm = hum(t);
    grass.children.forEach((g, k) => { g.rotation.z = hm * 0.05 * Math.sin(t * 38 + k * 1.7); });
    return { dim: 0 };
  }
  return { scene, update, shots };
}
