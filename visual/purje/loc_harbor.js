// B, aamun satama: kuvakäsikirjoituksen otot 1–6 (ankkurit held_alku ... held_lyyrinen).
//   1 Selkäkuva 1/4: kapteeni perässä, punainen purje nousee mastoon teeman kaaren mukana.
//   2 Sointuiskut T. 6, 8, 11: seitsemän laivaston purjetta napsahtaa auki kareen takana.
//   3 Viulut: säde välähtää mastonhuipun viirissä, tuulen viivoitus syttyy.
//   4 Vasket ja patarummut: aurinko nousee niemen kallion yli, viirit nousevat mastoihin,
//     patarummun lyönnit nostavat roiskeen niemen juurelta.
//   5 Laivasto kiertää kareen pään riviin; viirit värisevät trumpettien soinnuissa.
//   6 Viulujen juoksutus: puuska täyttää kaikki purjeet.

import * as THREE from 'three';
import { C, ink, flat, group, poly, rect, ridgeGeo, skylineGeo, strokeGeo, cloud, sky as makeSky, streaks, clamp, smoothstep, mix, hash1, vnoise1 } from './paper.js';
import { camPath, ease } from './hero.js';
import { seaBand, ship, ride, sternShip, splashes, cliffPts, common } from './world.js';

export function build(K) {
  const { S } = K;
  const T0 = S.T0;
  const A = S.A;
  const W = common(S);
  const tHits = ['held_isku_t6', 'held_isku_t8', 'held_isku_t11'].map((id) => A(id));
  const tViol = A('held_viulut').t;
  const tBrass = A('held_vasket_t13').t;
  const tHeroes = A('held_intro_loppuu').t;
  const tGust = A('held_viulut_paluu').t;
  const tEnd = A('held_lyyrinen').t;

  const scene = new THREE.Scene();
  const SKY = makeSky(scene);
  const farMat = ink(C.paper, { shade: C.blue, raster: 0.24 });
  const far3 = flat(scene, ridgeGeo(-900, 900, 60, 3, { lambda: 170, base: -400 }), farMat, { z: -260 });
  far3.userData.edge = { name: 'kaukaiset vuoret' };
  const far2Mat = ink(C.paper, { shade: C.blue, raster: 0.5 });
  const far2 = flat(scene, ridgeGeo(-600, 600, 30, 7, { lambda: 90, base: -250 }), far2Mat, { z: -140 });
  far2.userData.edge = { name: 'vuoret' };
  // pilvet ajelehtivat puupuhaltimien mukana (tuulen suuntaan)
  const clouds = Array.from({ length: 9 }, (_, k) => flat(scene, cloud(40 + 25 * hash1(k + 3), 12 + 6 * hash1(k + 4), 40 + k, false), ink(C.paper, { shade: C.blue, raster: 0.18 + 0.2 * hash1(k) }), { y: 150 + 40 * hash1(k + 9), z: -200 }));
  // meri: kaukainen, keskimmäinen (laivasto), lähin (sankari), etuala
  const seaFar = seaBand(scene, -1200, 1200, 0, -60, { A: 0.15, k: 0.12, sp: 0.8, base: C.blue, deep: C.black, deepAmt: 0.3, glint: 0.5, rows: 1.2, name: 'kaukainen meri' });
  const seaMid = seaBand(scene, -600, 600, 0, -16, { A: 0.2, k: 0.25, sp: 1.0, ph: 1.3, deepAmt: 0.45, name: 'keskimeri' });
  const seaNear = seaBand(scene, -400, 400, 0, -1, { A: 0.35, k: 0.33, sp: 1.2, ph: 2.1, deepAmt: 0.55, rows: 2.5, name: 'lähimeri' });
  const seaFore = seaBand(scene, -300, 300, -0.9, 7, { A: 0.45, k: 0.4, sp: 1.3, ph: 0.4, base: C.blue, shade: C.black, raster: 0.25, deep: C.black, deepAmt: 0.5, deepH: 8, glint: 0.35, foamW: 0.2, name: 'etualan aalto' });
  // niemi vasemmalla: kallio, jonka yli aurinko nousee; ulottuu syvälle ja kauas vasemmalle
  // niemen huippu x = -40 on aamun korkein paikka: aurinko nousee sen takaa (held_vasket_t13)
  // niemi kaukana (z -70); huippu x = -60, y noin 55, on aamun korkein paikka
  const capeY = (x) => (x > -20 ? -8 : 7 + 16 * smoothstep(-20, -40, x) + 32 * Math.exp(-(((x + 60) / 14) ** 2)) + 5 * (vnoise1(x / 12, 21) - 0.5));
  const capePts = cliffPts(-700, -16, capeY, 260);
  const cape = flat(scene, skylineGeo(capePts, -200), ink(C.black, { shade: C.blue, raster: 0.12 }), { z: -70 });
  const capeRim = flat(scene, strokeGeo(capePts.filter((p) => p[0] < -22), 0.3), ink(C.paper), { z: -69.98 });
  // kari: matala luoto, jonka takana laivasto odottaa (x -60 .. 4)
  const reefY = (x) => 1.3 + 1.2 * Math.sin(Math.PI * clamp((x + 50) / 90)) + 0.4 * (vnoise1(x / 3, 31) - 0.5) - 3.5 * smoothstep(34, 40, x);
  const reef = flat(scene, skylineGeo(cliffPts(-60, 42, reefY, 160), -40), ink(C.black, { shade: C.blue, raster: 0.3 }), { z: -14 });
  void reef; void capeRim;

  // --- laivat ---
  const hero = ship(scene, { captain: true });
  const stern = sternShip(scene);
  // laivasto: 7 purjetta, porrastus syvyyteen (vähimmäisväli: laivan pituus)
  // selkäkuvassa sankarin purje peittää keskikaistan: laivasto sen molemmin puolin
  const FX = [-26, -19.5, -13, 10, 16.5, 23, 29.5];
  const FZ = FX.map((x, i) => (i % 2 ? -21 : -17));   // porrastus syvyyteen, vesikaistan takana
  const fleet = FX.map((x, i) => ({ s: ship(scene, { len: 8, sailRaster: 0.35, hullRaster: 0.1, penC: i % 2 ? C.paper : C.red }), x, z: FZ[i], i }));
  const glint = flat(scene, poly([[0, 0.9], [0.12, 0.12], [0.9, 0], [0.12, -0.12], [0, -0.9], [-0.12, -0.12], [-0.9, 0], [-0.12, 0.12]]), ink(C.paper), { z: 0.6 });
  const wind = streaks(scene, 160, ink(C.paper, {}), -5);
  const spl = splashes(scene, 8, { z: -8.5 });

  // --- data ---
  // purjeen nosto: johtavan melodian kertymä (teema kiipeää -> purje nousee), tasoitettu
  const melN = (t) => clamp((S.melody(t + S.LEAD) - 45) / 30);
  const hoistArr = new Float32Array(S.n);
  { let m = 0; for (let i = 0; i < S.n; i++) { const t = i / 30; if (t > T0) m = Math.max(m, melN(t)); hoistArr[i] = m; } }
  const hoist = W.smooth((t) => (t < T0 ? 0.04 : 0.08 + 0.92 * smoothstep(0.1, 0.85, hoistArr[Math.min(S.n - 1, Math.round(t * 30))])), 0.5);
  // laivaston vastaus: purje napsahtaa auki iskun ruudulla ja laskeutuu hitaasti
  const hitAmp = (t) => tHits.reduce((m, h) => Math.max(m, S.pulse(t, h.t, 1.1)), 0);
  const tptOns = S.onsetsIn(tHeroes, tGust);
  const tptFlick = (t) => clamp(tptOns.reduce((s, o) => s + S.pulse(t, o, 0.18), 0));
  const drum = S.strokesIn(tBrass - 0.2, tEnd).filter((x, i, a) => i === 0 || x - a[i - 1] > 0.35);
  const drumEv = drum.map((t, k) => ({ t, x: -12 + 5 * hash1(k * 3), y: 0.2, s: 0.7 + 0.5 * hash1(k * 5) }));
  const brassPen = (t) => ease(smoothstep(tBrass, tBrass + 3.0, t));
  const gust = (t) => S.pulse(t, tGust, 1.4) * smoothstep(tGust - 0.1, tGust, t);
  const windAt = (t) => clamp(W.wind(t) + 0.5 * gust(t));
  // laivasto kiertää kareen pään: liukuu oikealle tahdista 17 alkaen
  const fleetX = (f, t) => f.x + 22 * ease(smoothstep(tHeroes - 0.5 + f.i * 0.15, tGust + 1.5 + f.i * 0.15, t)) + 0.35 * (t - T0);

  const backEnd = tViol;
  const hxOf = (t) => 0.35 * (t - T0);
  const follow = (f) => (u, t) => { const c = f(u); const d = hxOf(t); return { ...c, pos: [c.pos[0] + d, c.pos[1], c.pos[2]], look: [c.look[0] + d, c.look[1], c.look[2]] }; };
  const shots = [
    { name: '1 selkäkuva: purje nousee teeman mukana', a: T0, b: backEnd,
      cam: camPath([{ pos: [0.6, 2.4, 17.5], look: [0, 5.5, -80], fov: 54 }, { pos: [0.4, 4.0, 16], look: [0, 7.5, -80], fov: 54 }]) },
    { name: '3 nosturi: viirin välähdys, tuuli', a: backEnd, b: tBrass,
      cam: follow(camPath([{ pos: [7, 1.2, 21], look: [1.5, 4, 0], fov: 40 }, { pos: [5, 4.5, 25], look: [1.5, 5.5, -6], fov: 42 }])) },
    { name: '4 laaja: aurinko nousee niemen huipun takaa, viirit nousevat', a: tBrass, b: tHeroes,
      // sankarin laiva etualalla, niemen huippu vasemmalla: tämä on hänen auringonnousunsa
      cam: camPath([{ pos: [16, 3.2, 28], look: [-12, 13, -70], fov: 46 }, { pos: [15, 3.0, 25], look: [-12, 13.5, -70], fov: 46 }]) },
    { name: '5 laivasto kiertää kareen, sivuajo rivin ohi', a: tHeroes, b: tGust,
      cam: camPath([{ pos: [0, 5, 40], look: [2, 7, -20], fov: 44 }, { pos: [2, 5, 30], look: [3, 6.5, -20], fov: 44 }, { pos: [6, 4.4, 15], look: [10, 5, -18], fov: 40 }]) },
    { name: '6 lähikuva: puuska täyttää purjeet', a: tGust, b: tEnd + 1.5,
      cam: follow(camPath([{ pos: [7.5, 3.4, 10.5], look: [4.25, 3.2, 0], fov: 38 }, { pos: [8.2, 3.6, 9.5], look: [4.4, 3.4, 0], fov: 36 }])) },
  ];

  function update(t) {
    const lows = W.lows(t);
    const str = W.strings(t);
    // vuoret painautuvat esiin matalien jousten kertymän mukana
    const up = smoothstep(0, 5, W.lowsI(t) - W.lowsI(T0));
    // vuoret painautuvat esiin matalien jousten mukana, sitten hengittävät dynamiikan mukaan
    far3.position.y = -48 * (1 - up) - 3 * (1 - lows);
    far2.position.y = -24 * (1 - up) - 2 * (1 - lows);
    farMat.uniforms.uRaster.value = 0.16 + 0.22 * W.loudS(t);
    far2Mat.uniforms.uRaster.value = 0.38 + 0.25 * W.loudS(t);
    cape.position.y = -4 * (1 - up) + 1.0 * lows;
    capeRim.position.y = cape.position.y;
    clouds.forEach((c, k) => { c.position.x = -400 + ((hash1(k + 7) * 800 + W.drift(t) * (0.6 + 0.4 * hash1(k))) % 800); });
    // taivas: yö -> sarastus (teema) -> valo (viulut) -> aamu (vasket ja aurinko); rekisteri nostaa sinistä
    const u = SKY.u;
    u.uTime.value = t;
    u.uBlackTop.value = 0.85 * (1 - smoothstep(T0, tViol + 1, t));
    u.uBlueH.value = mix(-0.25, 0.1, smoothstep(T0, tViol, t)) + 0.25 * smoothstep(tViol, tHeroes, t) + 0.1 * smoothstep(tHeroes, tEnd, t) + 0.15 * (S.reg(t) - 0.5);
    u.uRedAmt.value = 0.75 * smoothstep(T0 - 2, T0 + 5, t) * (1 - 0.6 * smoothstep(tBrass, tEnd, t));
    // aurinko on niemen huipun takana vaskien tullessa ja nousee sen yli tahtiin 17 mennessä
    // aurinko piilossa niemen huipun takana vaskien tullessa, nousee sen yli tahtiin 17 mennessä
    const sunY = mix(-60, 225, smoothstep(T0, tBrass, t)) + 110 * ease(smoothstep(tBrass, tHeroes, t)) + 30 * smoothstep(tHeroes, tEnd, t);
    u.uSun.value.set(-360, sunY, 42, t > T0 - 1 ? 1 : 0);
    u.uRays.value = 0;
    // meri: mainingit jousista (korkeus), vaihe jousten nopeudella; välke viuluista ja harpusta
    const tw = W.swellT(t);
    seaFar.set(tw, 0.12 + 0.1 * str, t);
    seaMid.set(tw, 0.18 + 0.15 * lows, t);
    seaNear.set(tw, 0.25 + 0.35 * lows, t);
    seaFore.set(tw, 0.35 + 0.4 * lows, t);
    for (const b of [seaFar, seaMid, seaNear]) b.u.uGlint.value = 0.25 + 0.6 * S.energy.violins(t) * smoothstep(T0, tViol, t);
    const w = windAt(t);
    const backView = t < backEnd;
    // sankarin laiva
    hero.root.visible = !backView;
    stern.root.visible = backView;
    const hz = hoist(t);
    const hx = 0.35 * (t - T0);
    ride(hero, seaNear, hx, t, { z: 0 });
    hero.setSail({ hoist: hz, wind: w, t, pen: 0.4 + 0.6 * brassPen(t) });
    hero.poseCaptain(t < tHeroes ? 0.2 * W.horns(t) : W.horns(t), t, w);
    if (backView) {
      const y = (seaNear.surf(-2) + seaNear.surf(2)) / 2 - 0.7;
      stern.root.position.set(0, y, 3.5);
      stern.root.rotation.z = Math.atan2(seaNear.surf(2) - seaNear.surf(-2), 4) * 0.5;
      stern.setSail({ hoist: hz, wind: w, t });
      stern.capB.M.cape.uniforms.uTime.value = t;
      stern.capB.M.cape.uniforms.uAmp.value = 0.08 + 0.2 * w;
      stern.capB.armR.rotation.z = 0.3 + 0.5 * W.horns(t);
      stern.capB.M.body.uniforms.uColor.value.copy(C.black);
      stern.capB.M.dark.uniforms.uColor.value.copy(C.black);
    }
    // laivasto: purjeet kareen takana; iskussa napsahtavat auki, tahdista 17 alkaen nousevat täyteen
    const hp = hitAmp(t);
    fleet.forEach((f) => {
      const x = fleetX(f, t);
      ride(f.s, seaMid, x, t, { z: f.z, sc: 1 });
      const full = ease(smoothstep(tHeroes - 0.3 + 0.1 * f.i, tHeroes + 1.6 + 0.1 * f.i, t));
      // ennen tahtia 17 purjeet ovat kerällä (vain mastot); iskussa vain purjeen yläosa napsahtaa auki
      const fh = Math.max(t < tHeroes ? 0.8 * hp : 0, full * 0.95);
      f.s.setSail({ hoist: fh, wind: w, snap: 0.6 * hp, t: t + f.i * 0.4, pen: 0.15 + 0.85 * brassPen(t) + 0.12 * tptFlick(t) });
    });
    // välähdys mastonhuipussa (viulujen ensimmäinen säde)
    const gv = S.pulse(t, tViol, 0.5);
    glint.visible = gv > 0.02 && !backView;
    if (glint.visible) {
      glint.position.set(hx + 0.2, hero.root.position.y + hero.MH + 0.4, 0.6);
      glint.scale.setScalar(0.4 + 1.4 * gv);
      glint.rotation.z = 0.6 * (t - tViol);
    }
    // tuulen viivoitus: viulut
    const v = S.energy.violins(t) * smoothstep(tViol - 0.1, tViol + 0.6, t);
    wind.set((i) => {
      if (hash1(i * 7 + 1) > v * 1.1 + 1.0 * gust(t)) return null;
      const sp = (6 + 6 * hash1(i * 3)) * (0.5 + w);
      const span = 90;
      const ph = (hash1(i * 5) * span + W.windX(t) * (0.8 + hash1(i * 3))) % span;
      return { x: -50 + ph, y: 2 + 22 * hash1(i * 11), ang: 0.04, len: (1.5 + 3.5 * hash1(i * 13)) * (0.4 + w), w: 0.06 };
    });
    spl.set(t, drumEv.filter((e) => t >= e.t - S.LEAD && t < e.t + 1).slice(-8), S.LEAD);
    const dim = t < T0 ? 0.45 : 0.45 * (1 - smoothstep(T0, tViol + 2, t));
    return { dim, wind: w };
  }
  return { scene, update, shots };
}
