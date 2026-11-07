// C, avomeri: kuvakäsikirjoituksen otot 7–12 (ankkurit held_lyyrinen ... held_tunnelma_vaihtuu).
//   7 Puupuhaltimet tulevat: tiiraparvi syntyy aaltojen vaahdosta, harppu = välkerenkaat.
//   8 Tiirat liitävät aaltojen yllä, laiva kaukana.
//   9 Uusi aalto (held_t31); held_t34: laivasto kiihdyttää rinnakkain (sivuajo).
//  10 held_reh4: mainingit kasvavat, sforzandot ovat keularoiskeita, laiva kiipeää.
//  11 held_reh5_isku: kapteeni nostaa kellonsa (leikkaus jakson alkuun).
//  12 held_huippu1_kohta: laiva ylittää suuren aallon harjan, harja murtuu, aurinko murtautuu esiin.

import * as THREE from 'three';
import { C, ink, flat, ridgeGeo, cloud, sky as makeSky, streaks, clamp, smoothstep, mix, hash1 } from './paper.js';
import { camPath, ease } from './hero.js';
import { seaBand, ship, ride, terns, splashes, common } from './world.js';

export function build(K) {
  const { S } = K;
  const A = S.A;
  const W = common(S);
  const t0 = K.a;
  const t25 = A('held_t25').t;
  const t31 = A('held_t31').t;
  const t34 = A('held_t34').t;
  const tR4 = A('held_reh4').t;
  const tR5 = A('held_reh5_isku').t;
  const tPeak = A('held_huippu1_kohta').t;
  const tEnd = K.b;

  const scene = new THREE.Scene();
  const SKY = makeSky(scene);
  const farMat = ink(C.paper, { shade: C.blue, raster: 0.3 });
  const far = flat(scene, ridgeGeo(-900, 1500, 26, 13, { lambda: 140, base: -300 }), farMat, { z: -300, y: -6 });
  far.userData.edge = { name: 'kaukaiset saaret' };
  const clouds = Array.from({ length: 14 }, (_, k) => flat(scene, cloud(45 + 30 * hash1(k + 3), 14 + 8 * hash1(k + 4), 70 + k, false), ink(C.paper, { shade: C.blue, raster: 0.15 + 0.25 * hash1(k) }), { y: 45 + 70 * hash1(k + 9), z: -220 }));
  const seaFar = seaBand(scene, -1000, 1800, 0, -80, { A: 0.2, k: 0.1, sp: 0.8, deepAmt: 0.3, glint: 0.5, rows: 1.2, name: 'kaukainen meri' });
  const seaMid = seaBand(scene, -800, 1600, 0, -22, { A: 0.3, k: 0.18, sp: 1.0, ph: 1.1, deepAmt: 0.45, name: 'keskimeri' });
  const seaNear = seaBand(scene, -600, 1400, 0, -1, { A: 0.4, k: 0.14, sp: 0.9, ph: 2.4, deepAmt: 0.55, rows: 2.5, name: 'lähimeri' });
  const seaFore = seaBand(scene, -600, 1400, -1.4, 8, { A: 0.5, k: 0.3, sp: 1.2, ph: 0.4, base: C.blue, shade: C.black, raster: 0.45, deep: C.black, deepAmt: 0.8, deepH: 3, name: 'etualan aalto' });

  const hero = ship(scene, { captain: true });
  const mates = [0, 1, 2].map((i) => ({ s: ship(scene, { len: 8.5, sailRaster: 0.35, hullRaster: 0.1, penC: i % 2 ? C.paper : C.red }), i }));
  const flock = terns(scene, 16);
  const spl = splashes(scene, 10, { z: 1.5 });
  const crest = splashes(scene, 6, { z: 0.8, raster: 0.05 });
  const wind = streaks(scene, 150, ink(C.paper, {}), -4);

  // --- liike: laivat purjehtivat myötätuuleen (+x); nopeus tuulesta ---
  const shipX = W.integ((t) => (t < t0 - 2 ? 0 : 1.6 + 2.6 * W.wind(t)));
  const X0 = shipX(t0);
  const hx = (t) => shipX(t) - X0;
  // laivasto kiihdyttää rinnakkain kohdassa held_t34; syvyysvälit ja vähimmäisväli
  const mateZ = [-9, -16, -23];
  // laivasto tulee kuvaan vasta held_t34:ssä vasemmalta (kapteeni on yksin mielikuvituksen kanssa)
  const mateIn = (t) => ease(smoothstep(t34 - 2.5, t34 + 3.5, t));
  const mateX = (i, t) => hx(t) - 14 - 13 * i - 40 * (1 - mateIn(t)) - 6 * smoothstep(tR4, tR4 + 6, t);
  // tiirat: syntyvät vaahdosta puupuhaltimien tullessa, siivet puupuhallinten fraasin mukaan
  const flap = W.integ((t) => 5 + 9 * W.winds(t));
  const birth = (i) => t0 + 0.12 + i * 0.22;
  const harpOns = S.onsetsIn(t0 - 0.2, tEnd).filter((o) => S.fam.harp(o) > 0.16);
  const sfz = S.accIn(tR4, tPeak + 1, 4.5).map((x) => x.t);
  const peakEnv = (t) => smoothstep(tR4, tPeak, t) * (1 - smoothstep(tPeak + 0.5, tEnd + 1.5, t));

  // kamera seuraa laivan tasoitettua polkua
  const follow = (f, dz = 0) => (u, t) => { const c = f(u); const d = hx(t); return { ...c, pos: [c.pos[0] + d, c.pos[1], c.pos[2] + dz], look: [c.look[0] + d, c.look[1], c.look[2]] }; };
  const shots = [
    { name: '7 lento parven mukana: tiirat syntyvät vaahdosta', a: t0, b: t25,
      cam: follow(camPath([{ pos: [-14, 3, 26], look: [-8, 4.5, 0], fov: 42 }, { pos: [-4, 7, 22], look: [0, 8, 0], fov: 42 }])) },
    { name: '8 tiirat liitävät, laiva kaukana', a: t25, b: t31,
      cam: follow(camPath([{ pos: [8, 8, 24], look: [3, 8, -10], fov: 42 }, { pos: [12, 8.5, 26], look: [5, 8, -10], fov: 42 }])) },
    { name: '9 uusi aalto: välkerenkaat laivan ympärillä', a: t31, b: t34,
      cam: follow(camPath([{ pos: [12, 3.5, 26], look: [1, 4.5, -2], fov: 40 }, { pos: [9, 4, 24], look: [1, 5, -2], fov: 40 }])) },
    { name: '9 sivuajo: laivasto rinnakkain', a: t34, b: tR4,
      cam: follow(camPath([{ pos: [-18, 5, 30], look: [-12, 5, -10], fov: 42 }, { pos: [2, 5.5, 30], look: [-2, 5.5, -10], fov: 42 }])) },
    { name: '10 mainingit kasvavat, laiva kiipeää', a: tR4, b: tR5,
      cam: follow(camPath([{ pos: [-10, 2.5, 30], look: [0, 5, 0], fov: 42 }, { pos: [-6, 1.2, 26], look: [1, 6, 0], fov: 44 }])) },
    { name: '11 lähikuva: kapteeni nostaa kellon', a: tR5, b: tPeak,
      cam: follow(camPath([{ pos: [9, 4.5, 14], look: [4.25, 4.2, 0], fov: 40 }, { pos: [10, 4.2, 15], look: [4.25, 4.6, 0], fov: 42 }])) },
    { name: '12 ensimmäinen huippu: harjan yli', a: tPeak, b: tEnd + 1.6,
      // nousu 2: kamera korkeammalla kuin aamussa, horisontti matalammalla
      cam: follow(camPath([{ pos: [-4, 8, 36], look: [2, 10.5, 0], fov: 46 }, { pos: [2, 8.5, 34], look: [6, 11, 0], fov: 46 }])) },
  ];

  function update(t) {
    const lows = W.lows(t);
    const str = W.strings(t);
    const pk = peakEnv(t);
    const w = clamp(W.wind(t) + 0.3 * pk);   // yksi tuuli kaikille: huipulla puuska
    farMat.uniforms.uRaster.value = 0.22 + 0.25 * W.loudS(t);
    clouds.forEach((c, k) => { c.position.x = -500 + ((hash1(k + 7) * 1400 + W.drift(t) * (0.6 + 0.4 * hash1(k)) + 0.5 * hx(t)) % 1400); });
    // taivas: kirkas aamu; kohti huippua pilvet sakenevat, huipussa repeämä ja aurinko
    const u = SKY.u;
    u.uTime.value = t;
    u.uBlackTop.value = 0;
    u.uBlueH.value = 0.35 + 0.25 * (S.reg(t) - 0.5);
    u.uRedAmt.value = 0.28;
    u.uMurk.value = 0.45 * smoothstep(tR4, tPeak - 2, t) * (1 - 0.7 * smoothstep(tPeak, tEnd, t));
    const gap = ease(smoothstep(tPeak - S.LEAD, tPeak + 1.2, t));
    u.uSun.value.set(hx(t) + 60, 110, 30, gap);
    u.uCloudGap.value.set(hx(t) + 60, 110, 30 + 90 * gap, gap);
    // meri: mainingit kasvavat kohti huippua (matalat jouset)
    const tw = W.swellT(t);
    seaFar.set(tw, 0.15 + 0.15 * str);
    seaMid.set(tw, 0.25 + 0.3 * lows + 0.5 * pk);
    seaNear.set(tw, 0.3 + 0.5 * lows + 1.6 * pk, t);
    seaFore.set(tw, 0.4 + 0.5 * lows + 0.8 * pk);
    const gl = 0.3 + 0.5 * S.energy.violins(t) + 0.4 * S.fam.harp(t);
    for (const b of [seaFar, seaMid, seaNear]) b.u.uGlint.value = clamp(gl);
    // harpun nuotinalut: välkerenkaat laivan ympärillä
    const recent = harpOns.filter((o) => o <= t + S.LEAD && o > t - 2.6).slice(-12);
    seaNear.rings.forEach((R, i) => {
      const o = recent[i];
      if (o === undefined) { R.set(0, 0, -99, 0); return; }
      const rx = hx(o) - 14 + 28 * hash1(Math.round(o * 100));   // rengas jää paikalleen veteen
      R.set(rx, seaNear.surf(rx) - 0.3, o - S.LEAD, 0.6 + 0.6 * hash1(Math.round(o * 100) + 1));
    });
    // sankarin laiva
    const x = hx(t);
    ride(hero, seaNear, x, t, { z: 0, tiltK: 0.9 });
    hero.setSail({ hoist: 0.97, wind: w, t, pen: 1 });
    const raise = ease(smoothstep(tR5 - S.LEAD, tR5 + 1.6, t));
    hero.poseCaptain(Math.max(W.horns(t) * 0.8, raise * (1 - smoothstep(tPeak + 1, tEnd, t))), t, w);
    // laivasto: näkyy t34-sivuajosta; pysyy omilla syvyyksillään
    mates.forEach((m) => {
      m.s.root.visible = mateIn(t) > 0.001;
      ride(m.s, seaMid, mateX(m.i, t), t, { z: mateZ[m.i] - 0.5 });
      m.s.setSail({ hoist: 0.95, wind: w, t: t + m.i * 0.5, pen: 1 });
    });
    // tiirat
    const cx = x + 4;
    flock.birds.forEach((B) => {
      const i = B.i;
      const b0 = birth(i);
      if (t < b0) { B.g.visible = false; return; }
      B.g.visible = true;
      const age = t - b0;
      const rise = ease(clamp(age / 1.6));
      const ph = hash1(i * 13) * 6.28;
      const glide = smoothstep(t25 - 1, t25 + 2, t) * (1 - smoothstep(t34 - 2, t34, t));
      const bx = cx - 14 + 28 * hash1(i * 7) + 4 * Math.sin(0.35 * t + ph);
      const by = mix(seaNear.surf(bx) + 0.3, 11.5 + 5 * hash1(i * 3) + 1.5 * Math.sin(0.5 * t + ph) - 1.0 * glide, rise);   // maston yläpuolella
      const bz = 3 + 6 * hash1(i * 17);
      B.g.position.set(bx, by, bz);
      const s = 2.6 + 1.4 * hash1(i * 5);
      const f = Math.sin(flap(t) * (0.9 + 0.2 * hash1(i)) + ph);
      B.g.scale.set(s, s * (glide > 0.5 ? 0.7 + 0.15 * f : 0.35 + 0.65 * Math.abs(f)), 1);
      B.g.rotation.z = 0.15 * Math.sin(0.7 * t + ph) + 0.3 * (1 - rise);
    });
    // roiskeet: tiirojen synty vaahdosta ja sforzandojen keularoiskeet
    const ev = [];
    for (let i = 0; i < flock.birds.length; i++) { const b0 = birth(i); if (t >= b0 - S.LEAD && t < b0 + 1) { const bx = cx - 14 + 28 * hash1(i * 7); ev.push({ t: b0, x: bx, y: seaNear.surf(bx) - 0.2, s: 0.5 }); } }
    for (const st of sfz) if (t >= st - S.LEAD && t < st + 1) ev.push({ t: st, x: x + 7.5, y: hero.root.position.y - 0.2, s: 0.8 });
    spl.set(t, ev.slice(-10), S.LEAD);
    const ce = [];
    if (t >= tPeak - S.LEAD && t < tPeak + 1.2) for (let k = 0; k < 4; k++) ce.push({ t: tPeak + k * 0.05, x: x + 7 + 3 * k, y: seaNear.surf(x + 7 + 3 * k) - 0.4, s: 0.9 + 0.3 * hash1(k) });
    crest.set(t, ce, S.LEAD);
    // tuulen viivoitus: viulut
    const v = S.energy.violins(t);
    wind.set((i) => {
      if (hash1(i * 7 + 1) > v * 1.1) return null;
      const sp = (6 + 6 * hash1(i * 3)) * (0.5 + w);
      const span = 100;
      const ph = (hash1(i * 5) * span + W.windX(t) * (0.8 + hash1(i * 3))) % span;
      return { x: x - 50 + ph, y: 3 + 22 * hash1(i * 11), ang: 0.04, len: (1.5 + 3.5 * hash1(i * 13)) * (0.4 + w), w: 0.06 };
    });
    return { dim: 0, wind: w };
  }
  return { scene, update, shots };
}
