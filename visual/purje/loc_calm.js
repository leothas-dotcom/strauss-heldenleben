// D, tyyni lahti kultaisessa aamupäivässä: kuvakäsikirjoituksen otot 13–15
// (ankkurit held_tunnelma_vaihtuu ... held_t61).
//  13 Tunnelma vaihtuu: valo paperinvaalea, kaksi tiiraa (huilu ja englannintorvi) leikkii mastojen yllä.
//  14 held_t49: laiva liukuu tyynellä, peilikuva vedessä; patarummun tremolossa vesi värisee.
//  15 held_reh6: kaksi laivaa laulaa rinnakkain (käyrätorvet I-II); viirit liehuvat samaan suuntaan.

import * as THREE from 'three';
import { C, ink, flat, ridgeGeo, cloud, sky as makeSky, clamp, smoothstep, mix, hash1 } from './paper.js';
import { camPath, ease } from './hero.js';
import { seaBand, ship, ride, terns, common, reflectDashes } from './world.js';

export function build(K) {
  const { S } = K;
  const A = S.A;
  const W = common(S);
  const t0 = K.a;
  const t49 = A('held_t49').t;
  const tR6 = A('held_reh6').t;
  const tEnd = K.b;

  const scene = new THREE.Scene();
  const SKY = makeSky(scene);
  const farMat = ink(C.paper, { shade: C.blue, raster: 0.18 });
  const far = flat(scene, ridgeGeo(-900, 1300, 22, 17, { lambda: 120, base: -300 }), farMat, { z: -280, y: -4 });
  far.userData.edge = { name: 'kaukaiset vuoret' };
  const isl = flat(scene, ridgeGeo(-500, 900, 9, 23, { lambda: 60, base: -150 }), ink(C.blue, { shade: C.paper, raster: 0.35 }), { z: -120, y: -2 });
  isl.userData.edge = { name: 'saaret' };
  const clouds = Array.from({ length: 8 }, (_, k) => flat(scene, cloud(50 + 30 * hash1(k + 13), 12 + 6 * hash1(k + 14), 90 + k, false), ink(C.paper, { shade: C.red, raster: 0.12 }), { y: 55 + 60 * hash1(k + 19), z: -220 }));
  // tyyni vesi: hyvin matalat mainingit, paljon välkettä
  const seaFar = seaBand(scene, -800, 1400, 0, -60, { A: 0.05, k: 0.1, sp: 0.4, base: C.blue, deep: C.blue, deepAmt: 0.0, glint: 0.7, rows: 1.5, foam: 0.5, name: 'kaukainen vesi' });
  const sea = seaBand(scene, -600, 1200, 0, -0.6, { A: 0.06, k: 0.2, sp: 0.5, base: C.blue, shade: C.paper, raster: 0.25, deepAmt: 0.25, glint: 0.8, rows: 2.5, foam: 0.6, name: 'tyyni vesi' });

  // etualan vesikaista: peittää kölin; peilikuva piirretään sen päälle (tyyni pinta y = -0.9)
  const fore = seaBand(scene, -600, 1200, -0.9, 1.5, { A: 0.02, k: 0.3, sp: 0.5, base: C.blue, shade: C.paper, raster: 0.3, deepAmt: 0.2, glint: 0.9, rows: 3, foam: 0.4, name: 'etualan vesi' });
  const Y0 = -0.9;
  const hero = ship(scene, { captain: true });
  const heroR = ship(scene, { captain: true, ghost: true });
  const dashR = reflectDashes(scene, 9);
  const mate = ship(scene, { len: 9, sailRaster: 0.35, hullRaster: 0.1, captain: true, capRaster: 0.3, penC: C.paper });
  const birds = terns(scene, 2);

  const shipX = W.integ((t) => (t < t0 - 2 ? 0 : 0.6 + 1.0 * W.wind(t)));
  const X0 = shipX(t0);
  const hx = (t) => shipX(t) - X0;
  // toinen laiva liittyy käyrätorvien duettoon (held_reh6), takana omalla syvyydellään
  const mateIn = (t) => ease(smoothstep(tR6 - 2, tR6 + 5, t));
  const mateX = (t) => hx(t) - 15 - 10 * (1 - mateIn(t));
  const MZ = -0.4;
  // patarummun tremolo: vesi värisee (sivutoiminta, ei koko kuvan tärähdystä)
  const rollAmt = (t) => S.rolls.reduce((m, [a, b]) => Math.max(m, smoothstep(a - 0.1, a + 0.1, t) * (1 - smoothstep(b, b + 0.3, t))), 0);
  const flap = W.integ((t) => 4 + 8 * W.winds(t));
  const follow = (f) => (u, t) => { const c = f(u); const d = hx(t); return { ...c, pos: [c.pos[0] + d, c.pos[1], c.pos[2]], look: [c.look[0] + d, c.look[1], c.look[2]] }; };

  const shots = [
    { name: '13 kultainen aamupäivä: kaksi tiiraa mastojen yllä', a: t0 - 1, b: t49,
      cam: follow(camPath([{ pos: [-6, 5, 30], look: [1, 6.5, 0], fov: 40 }, { pos: [-3, 5.5, 27], look: [1.5, 7, 0], fov: 40 }])) },
    { name: '14 hyvin hidas lähestyminen: kapteeni ja peilikuva', a: t49, b: tR6,
      cam: follow(camPath([{ pos: [14, 1.6, 22], look: [3, 3, 0], fov: 38 }, { pos: [12, 1.4, 18], look: [3, 3.2, 0], fov: 38 }])) },
    { name: '15 hidas sivuajo: kaksi laivaa laulaa', a: tR6, b: tEnd + 1,
      cam: follow(camPath([{ pos: [-12, 4.5, 36], look: [-7, 5.5, -5], fov: 44 }, { pos: [-4, 5, 36], look: [-6, 5.8, -5], fov: 44 }])) },
  ];

  function mirror(g, src, y0) {
    g.root.position.set(src.root.position.x, 2 * y0 - src.root.position.y, 1.8);
    g.root.scale.set(1, -1, 1);
    g.body.rotation.z = -src.body.rotation.z;
  }

  function update(t) {
    const w = 0.35 + 0.5 * W.wind(t);
    farMat.uniforms.uRaster.value = 0.12 + 0.18 * W.loudS(t);
    clouds.forEach((c, k) => { c.position.x = -500 + ((hash1(k + 17) * 1400 + W.drift(t) * 0.5 + 0.5 * hx(t)) % 1400); });
    const u = SKY.u;
    u.uTime.value = t;
    u.uBlackTop.value = 0;
    u.uBlueAmt.value = 0.55;
    u.uBlueH.value = 0.7 + 0.25 * (S.reg(t) - 0.5);
    u.uRedAmt.value = 0.35;
    u.uMurk.value = 0;
    u.uCloudGap.value.set(0, 0, 1, 0);
    u.uSun.value.set(hx(t) - 80, 95, 20, 0);
    const tw = W.swellT(t);
    seaFar.set(tw, 0.04);
    sea.set(tw, 0.05 + 0.05 * W.lows(t));
    const r = rollAmt(t);
    sea.u.uShiver.value = r;
    sea.u.uGlint.value = 0.55 + 0.35 * S.fam.harp(t) + 0.3 * S.energy.violins(t);
    const x = hx(t);
    ride(hero, sea, x, t, { z: 0 });
    hero.setSail({ hoist: 0.97, wind: w, t, pen: 1 });
    hero.poseCaptain(W.horns(t), t, w);
    fore.set(tw, 0.02);
    fore.u.uShiver.value = r;
    mirror(heroR, hero, Y0);
    heroR.setSail({ hoist: 0.97, wind: w, t, pen: 1 });
    heroR.poseCaptain(W.horns(t), t, w);
    heroR.sail.visible = heroR.sailEdge.visible = false;
    dashR.set(heroR.root.position.x + 0.3, Y0 - 1.3, 6.2, 6.5, 1.85, t);
    const mi = mateIn(t);
    mate.root.visible = mi > 0.001;
    ride(mate, sea, mateX(t), t, { z: MZ });
    mate.setSail({ hoist: 0.97, wind: w, t: t + 0.7, pen: 1 });
    mate.poseCaptain(W.horns(t - 0.3), t, w);
    // kaksi tiiraa (huilu ja englannintorvi): leikkivät kahdeksikkoa mastojen yllä
    birds.birds.forEach((B, i) => {
      B.g.visible = true;
      const ph = t * 0.55 + i * Math.PI;
      const bx = x + 1 + 5.5 * Math.sin(ph);
      const by = hero.root.position.y + 10.5 + 1.8 * Math.sin(2 * ph) + i * 0.6;
      B.g.position.set(bx, by, 0.8 - 1.6 * i);
      const f = Math.sin(flap(t) + i * 1.7);
      const s = 1.3;
      B.g.scale.set(s * Math.sign(Math.cos(ph)) || s, s * (0.35 + 0.65 * Math.abs(f)), 1);
      B.g.rotation.z = 0.2 * Math.sin(ph * 2);
    });
    return { dim: 0, wind: w };
  }
  return { scene, update, shots };
}
