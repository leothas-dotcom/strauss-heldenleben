// E, kultainen niitty: kuvakäsikirjoituksen otot 13–15 (ankkurit held_tunnelma_vaihtuu ... held_t61).
//   13 Tunnelma vaihtuu: kultainen aamupäivä, värit hennot; kaksi pääskyä (huilu ja englannintorvi)
//      leikkii ritarin ympärillä nuotinalkujen tahdissa; ritari laskee kellonsa.
//   14 Ritari polvistuu puron äärelle; vesi välkkyy hiljaa (harppu), heinät värisevät patarummun
//      tremolossa.
//   15 Hajoaminen (ohjaus 1.9, held_reh6 -> held_t61): hahmo ja viiri juoksevat kahdeksi punaiseksi vedoksi
//      (käyrätorvet I-II), alttoviulu on sinisenä katkoviivana vetojen välissä. Torviritareita ei ole:
//      vedot ovat sankarin sisäinen ääni. Muste säästeliäästi: tämä on vähäisistä neljästä kohdasta.
//      Vetojen korkeus on sävel [TULKINTA: kaksi ääntä S.melody-viivasta, toinen terssin verran alempana].

import * as THREE from 'three';
import { C, ink, flat, group, poly, rect, cloud, earleTree, ridgeGeo, skylineGeo, water, waveMat, pennantGeo, swallowShape, outline, sky as makeSky, clamp, smoothstep, mix, hash1, vnoise1 } from './paper.js';
import { knight, poseKnight, KP, kmix } from './puppets.js';
import { leader, camPath, ease } from './hero.js';
import { tipTrail } from './brush.js';
import { soitin, iskut, verho } from './partituuri.js';

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
  // Kierros 4 (jämät): paperinväriset taivaspilvet poistettu. Niillä ei ollut soitinta eikä ohjausriviä (ohjaus 1.8: kaksi tiiraa, puro, aurinko),
  // ne näkyivät vain valkoisena leikkeenä auringon kiekossa (otot 10-11) ja himmeinä harmaina viiruina taivaan yläreunassa (otto 12).
  // ritari
  const L = leader(scene, {});
  // kaksi pääskyä
  const birds = [0, 1].map(() => {
    const g = group(scene, { z: 1.5 });
    flat(g, swallowShape(), ink(C.paper), {});
    flat(g, outline(swallowShape(), 0.05), ink(C.black), { z: 0.01 });
    return g;
  });
  // data
  const ons = S.onsetsIn(A - 0.3, B);
  // pääskyn siipi lyö nuotinalussa: pehmeä nousu (3 ruutua) ja jälkiliike; liikuttaa vain linnun siipeä (ei hahmon kehoa)
  const flap = (t) => ons.reduce((s, o) => s + smoothstep(o - 1 / 30, o + 0.08, t) * Math.exp(-Math.max(0, t - o) / 0.12), 0);
  // välkerenkaat vain kohdassa, jossa harput soivat: held_t49 -> held_reh6 (kuunteluopas A 1:42.3-1:48.5 'harput pp', cues held_t49 lead harps);
  // held_reh6:ssa (käyrätorvet laulavat, alttoviulu) harput eivät ole mukana, joten uusia renkaita ei synny
  // 10.11.2026 (korjaukset.md K3, K4): harput ja patarumpu partituurista (partituuri_a.json, T. 49-52), ei kuolleesta harppukanavasta
  // eikä tremolotunnistimesta (S.rolls ei löytänyt tästä yhtään tremoloa, joten heinät eivät koskaan värisseet).
  const harpEv = soitin(S, 'harput', tKneel - 0.2, tDuet + 0.2);
  const harpOns = iskut(harpEv).map((e) => e.t);
  const harpPP = verho(harpEv, 0.1, 1.5);
  const harpEnv = (t) => clamp(harpPP(t) / 0.35);                    // pp = täysi välke tässä hiljaisessa kuvassa
  const timpPP = verho(soitin(S, 'patarumpu', tKneel - 0.2, tDuet), 0.25, 0.6);
  const hum = (t) => clamp(timpPP(t) / 0.35);                        // patarummun pp-tremolo T. 49: heinät värisevät sen ajan
  const kneel = (t) => ease(smoothstep(tKneel - 1.2, tKneel + 0.8, t)) * (1 - ease(smoothstep(tDuet - 1.5, tDuet + 0.5, t)));
  function leaderState(t) {
    const pose = kmix(kmix(KP.proud, KP.look, smoothstep(A, A + 2, t)), KP.kneel, kneel(t));
    return { x: -1.5, y: -2.4, z: 0, facing: 1, pose: { ...pose, tilt: pose.tilt - 0.6 * smoothstep(A, A + 1.5, t) * (1 - kneel(t)) - 0.25 * kneel(t) } };
  }
  const windAt = (t) => ({ x: -(0.4 + 0.8 * S.energy.horns(t)), y: 0.3 });

  const shots = [
    { name: '13 kultainen niitty: kaksi pääskyä', a: A, b: tKneel, cam: camPath([{ pos: [-3, 1.0, 16], look: [0, 0.6, 0], fov: 44 }, { pos: [-1.5, 0.8, 14.5], look: [0, 0.6, 0], fov: 44 }]) },
    { name: '14 puron äärellä', a: tKneel, b: tDuet, cam: camPath([{ pos: [-0.5, -1.2, 8.5], look: [-1.2, -1.6, 0], fov: 40 }, { pos: [-0.2, -1.1, 8.1], look: [-1.0, -1.6, 0], fov: 40 }], (u) => clamp(u)) },
    // 1.9: sivuajo friisin vierellä; kamera seuraa vetojen päätä
    { name: '1.9 hajoaminen: kaksi vetoa juoksee', a: tDuet, b: B + 1.5, cam: (u, t) => { const cx = -1.5 + 0.55 * (t - tDuet) + 3.0; return { pos: [cx, 0.2, 12], look: [cx + 1.2, -0.2, 0], fov: 42 }; } },
  ];

  // --- hajoaminen: kaksi vetoa ja alttoviulun katkoviiva (1.9) ---
  const HX = -1.5;
  const penX = (tt) => HX + 0.9 * (tt - tDuet);
  const midiOf = (tt, d = 0) => clamp(S.melody(tt - d), 48, 84);
  const rise = (tt) => ease(smoothstep(tDuet, tDuet + 4, tt));
  const yBase = (tt) => -1.1 + 1.3 * rise(tt);
  const y1 = (tt) => yBase(tt) + 0.07 * (midiOf(tt) - 62) * rise(tt);
  const y2 = (tt) => yBase(tt) - 0.95 + 0.06 * (midiOf(tt, 0.3) - 62) * rise(tt);
  const tipOf = (yf) => (tt) => (tt < tDuet ? null : { x: penX(tt), y: yf(tt), z: 0.2 });
  const strokes = [y1, y2].map((yf, i) => tipTrail(scene, S, { seed: 31 + 9 * i, N: 260, win: 16, wmax: 0.4, wmin: 0.06, hairW: 0.05, color: C.red }));
  const wLike = (t) => ({ x: -(0.3 + 0.5 * S.energy.horns(t)), y: 0.1 });
  const dashes = Array.from({ length: 34 }, (_, j) => flat(scene, rect(0.42, 0.06, 0.5, 0.5), ink(C.blue, {}), { z: 0.25 }));
  dashes.forEach((d) => (d.visible = false));
  const violaOn = (tt) => smoothstep(0.2, 0.5, S.fam.strings(tt)) * smoothstep(tDuet + 1, tDuet + 3, tt);

  let dashN = 0;
  function update(t) {
    const u = SKY.u;
    u.uTime.value = t;
    // kultainen aamupäivä: vaalea, hennot värit
    u.uBlueAmt.value = 0.55; u.uBlueH.value = 0.75; u.uBlackTop.value = 0; u.uRedAmt.value = 0.35;
    u.uSun.value.set(40, 120, 30, 1);
    u.uRays.value = 0;
    L.place(t, leaderState, windAt, { capeWind: 0.3, noBanner: t > tKneel - 0.5 && t < tDuet });
    { const hf = K.fx && K.fx.heroFade ? K.fx.heroFade(t) : 0;   // hahmo haalistuu rasterina friisin vedoiksi (kohtaukset 15-16)
      for (const m of L.mats) if (m.uniforms && m.uniforms.uAppear) m.uniforms.uAppear.value = 1 - hf;
      if (hf > 0.97) { L.P.root.visible = false; L.banner.visible = false; } else L.P.root.visible = true;
      if (hf > 0.5) L.lance.visible = false; }
    // kaksi pääskyä kiertää ritaria; siivet lyövät nuotinaluissa
    const fl = flap(t);
    birds.forEach((g, i) => {
      const ph = t * (0.9 + 0.25 * i) + i * 2.4;
      const r = 3.2 + 0.8 * Math.sin(t * 0.4 + i);
      g.position.set(-1.5 + r * Math.cos(ph), 2.6 + 1.4 * Math.sin(ph * 1.3) - 0.8 * kneel(t), 1.5 + 0.5 * Math.sin(ph));
      g.rotation.z = 0.4 * Math.cos(ph);
      g.scale.set(0.7 * (Math.cos(ph) > 0 ? 1 : -1), 0.7 * (0.45 + 0.4 * Math.abs(Math.sin(t * 5 + i)) + 0.4 * clamp(fl)), 1);
      g.visible = t < tDuet;
    });
    // 1.9: kaksi vetoa lähtee hahmon kohdalta; alttoviulu katkoviivana välissä
    strokes.forEach((tr, i) => tr.set(t, tipOf(i ? y2 : y1), wLike, tDuet - 0.2, 1.1));
    let dn = 0;
    dashes.forEach((d, j) => {
      const tj = t - 0.33 * j - 0.2;
      const on = tj > tDuet + 1 && violaOn(tj) > 0.05;
      d.visible = on;
      if (!on) return;
      dn++;
      const xm = penX(tj), ym = (y1(tj) + y2(tj)) / 2 + 0.1 * Math.sin(tj * 2.2);
      d.position.set(xm, ym, 0.25);
      d.rotation.z = Math.atan2(y1(tj + 0.1) - y1(tj - 0.1) + y2(tj + 0.1) - y2(tj - 0.1), 2 * 0.2 * 0.9 * 2);
      d.scale.set(0.8 + 0.5 * violaOn(tj), 1, 1);
    });
    dashN = dn;
    // puro: harpun hiljaiset renkaat
    brook.u.uTime.value = t;
    brook.u.uGlint.value = 0.35 + 0.6 * harpEnv(t);
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
  const probe = (t) => ({
    torvi: strokes.some((tr) => tr.last.n > 0) ? 1 : 0,
    vareet: brook.rings.filter((r) => r.z > -90 && r.w !== 0).length,
    pollahdys: hum(t),
    vedot: strokes.filter((tr) => tr.last.n > 0).length,
    katkoviiva: dashN,
    paaskyt: birds.filter((g) => g.visible).length,
    olennot: birds.reduce((s, g) => s + (g.visible ? Math.abs(g.scale.y / g.scale.x) : 0), 0),
    polvi: kneel(t),
    hahmo: 1 - (K.fx && K.fx.heroFade ? K.fx.heroFade(t) : 0),
    puro: harpEnv(t),
    heinat: hum(t),
  });
  return { scene, update, shots, probe };
}
