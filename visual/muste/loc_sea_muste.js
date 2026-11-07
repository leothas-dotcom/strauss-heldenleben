// Muste, avomeri: ohjaus (docs/ohjaus.md) otot 1.5–1.7, ankkurit held_lyyrinen ... held_t47 (K.a, K.b).
// Pääosasääntö: 1.5–1.6 puupuhaltimet ja harput puhuvat -> tiirat ja meri johtavat, ritari kuuntelee pienenä;
// 1.7 käyrätorvet palaavat -> ritari nostaa kellon (lähikuva) ja maailma (aalto, aurinko) tekee huipun.
// Mustetta ei piirretä merellä (tuotantojako.md, "Muste säästeliäästi"): viiri on viiri yhdessä tuulessa.
//   1.5 held_lyyrinen: ritari astuu laivan keulaan; tiirat syntyvät vaahdosta (puupuhaltimet) ja kiertävät
//       häntä; harppu = välkerenkaat. held_t25: hän seuraa niitä katseellaan ja ojentaa kätensä
//       (kammenen_ojennus), yksi tiira laskeutuu keulakeihään kärkeen.
//   1.6 held_t31: hän nostaa purjeen (uusi aalto, harput); held_t34: laivasto liittyy rinnalle ja kilpailee.
//   1.7 held_reh4: mainingit kasvavat matalien jousten mukaan; sforzandot ovat tiirojen syöksyjä; hän nostaa
//       kellon soittoasentoon fraasin mittaisella liikkeellä (lähikuva), joka päättyy held_reh5_isku-sointuun
//       (keularoiske = iskun elementti); lähikuva vetäytyy yhtenä liikkeenä laajaan, held_huippu1_kohta: laiva
//       ylittää harjan, harja murtuu, aurinko murtautuu; held_t47: kamera laskeutuu niitylle.

import * as THREE from 'three';
import { C, ink, flat, group, poly, rect, ridgeGeo, cloud, sky as makeSky, streaks, waveMat, pennantGeo, clamp, smoothstep, mix, hash1 } from './paper.js';
import { KP, kmix, handFK, POSES } from './puppets.js';
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
  const t47 = A('held_t47').t;
  const tEnd = K.b;

  const scene = new THREE.Scene();
  const SKY = makeSky(scene);
  const farMat = ink(C.paper, { shade: C.blue, raster: 0.3 });
  const far = flat(scene, ridgeGeo(-900, 1500, 26, 13, { lambda: 140, base: -300 }), farMat, { z: -300, y: -6 });
  far.userData.edge = { name: 'kaukaiset saaret' };
  // pilvet: harvassa ja haaleina (taivas on tyhjä kolmannes)
  const clouds = Array.from({ length: 7 }, (_, k) => flat(scene, cloud(45 + 30 * hash1(k + 3), 12 + 6 * hash1(k + 4), 70 + k, false), ink(C.paper, { shade: C.blue, raster: 0.08 + 0.12 * hash1(k) }), { y: 60 + 60 * hash1(k + 9), z: -220 }));
  const seaFar = seaBand(scene, -1000, 1800, 0, -80, { A: 0.2, k: 0.1, sp: 0.8, deepAmt: 0.3, glint: 0.5, rows: 1.2, name: 'kaukainen meri' });
  const seaMid = seaBand(scene, -800, 1600, 0, -22, { A: 0.3, k: 0.18, sp: 1.0, ph: 1.1, deepAmt: 0.45, name: 'keskimeri' });
  const seaNear = seaBand(scene, -600, 1400, 0, -1, { A: 0.4, k: 0.14, sp: 0.9, ph: 2.4, deepAmt: 0.55, rows: 2.5, name: 'lähimeri' });
  const seaFore = seaBand(scene, -600, 1400, -1.4, 8, { A: 0.5, k: 0.3, sp: 1.2, ph: 0.4, base: C.blue, shade: C.black, raster: 0.45, deep: C.black, deepAmt: 0.8, deepH: 3, name: 'etualan aalto' });

  const hero = ship(scene, { captain: true });
  const h = hero.h;
  // keulakeihäs: ritari pitää sen keulassa (lähikädessä); viiri virtaa myötätuuleen (+x) kuten mastoviiri
  const lance = group(hero.body, { z: 0.35 });
  flat(lance, rect(0.05, 3.6, 0.5, 0.2), ink(C.black), {});
  flat(lance, poly([[-0.07, 2.88], [0.07, 2.88], [0, 3.2]]), ink(C.paper), { z: 0.001 });
  const lanceFlag = waveMat(C.red, { shade: C.black, amp: 0.2, k: 5 });
  flat(lance, pennantGeo(1.6, 0.55), lanceFlag, { y: 2.6, z: 0.01 });
  const LANCE_TIP = 3.2 - 0.2 * 3.6;
  const mates = [0, 1, 2].map((i) => ({ s: ship(scene, { len: 8.5, sailRaster: 0.35, hullRaster: 0.1, penC: i % 2 ? C.paper : C.red }), i }));
  const flock = terns(scene, 14);
  const spl = splashes(scene, 10, { z: 1.5 });
  const crest = splashes(scene, 6, { z: 0.8, raster: 0.05 });
  const wind = streaks(scene, 150, ink(C.paper, {}), -4);

  // --- liike: laivat purjehtivat myötätuuleen (+x); nopeus tuulesta ja purjeesta ---
  const hoist = (t) => mix(0.3, 0.97, ease(smoothstep(t31 - 0.3, t31 + 2.0, t)));   // 1.6: purje nousee uuden aallon alkaessa
  const shipX = W.integ((t) => (t < t0 - 2 ? 0 : (1.6 + 2.6 * W.wind(t)) * (0.55 + 0.45 * hoist(t))));
  const X0 = shipX(t0);
  const hx = (t) => shipX(t) - X0;
  const mateZ = [-9, -16, -23];
  // laivasto tulee kuvaan held_t34:ssä vasemmalta (kapteeni on siihen asti yksin mielikuvituksen kanssa)
  const mateIn = (t) => ease(smoothstep(t34 - 0.3, t34 + 5.0, t));
  const mateX = (i, t) => hx(t) - 14 - 13 * i - 40 * (1 - mateIn(t)) - 6 * smoothstep(tR4, tR4 + 6, t);
  // tiirat: syntyvät vaahdosta puupuhaltimien tullessa, siivet puupuhallinten fraasin mukaan
  const flap = W.integ((t) => 5 + 9 * W.winds(t));
  const birth = (i) => t0 + 0.12 + i * 0.22;
  const harpOns = S.onsetsIn(t0 - 0.2, tEnd).filter((o) => S.fam.harp(o) > 0.16);
  // sforzandot (held_reh4 .. huippu): tiirojen syöksyjä
  const sfz = S.accIn(tR4, tPeak - 0.5, 4.5).map((x) => x.t).filter((x) => Math.abs(x - tR5) > 0.4);
  const peakEnv = (t) => smoothstep(tR4, tPeak, t) * (1 - smoothstep(tPeak + 0.5, tEnd + 1.5, t));
  // 1.5: ritari ojentaa kätensä tiiroille (held_t25), yksi tiira laskeutuu kärkeen; lähtee purjeen noustessa
  const reach = (t) => ease(smoothstep(t25 + 0.5, t25 + 3.5, t)) * (1 - ease(smoothstep(t31 - 1.0, t31 + 0.5, t)));
  const land = (t) => ease(smoothstep(t25 + 3.0, t25 + 6.5, t)) * (1 - ease(smoothstep(t31 - 0.3, t31 + 1.2, t)));
  // 1.7: kello nousee soittoasentoon fraasin mittaisella liikkeellä, joka päättyy ff-sointuun (held_reh5_isku)
  const raise = (t) => ease(smoothstep(tR5 - 3.6, tR5 - S.LEAD, t)) * (1 - ease(smoothstep(tPeak + 1.5, tEnd + 1, t)));
  // 1.5 astuu keulaan (kävely), 1.6 vetää purjetta köydestä (käsien vuorottelu hoist-nousun mukana)
  const walkU = (t) => smoothstep(t0 + 0.2, t0 + 3.4, t);
  const capX = (t) => mix(1.3, 4.25, ease(walkU(t))) * h;
  const rope = (t) => smoothstep(t31 - 0.3, t31 + 0.6, t) * (1 - smoothstep(t31 + 1.6, t31 + 2.4, t));
  const capPose = (t) => {
    const wk = smoothstep(0, 0.12, walkU(t)) * (1 - smoothstep(0.88, 1, walkU(t)));
    const hu = ease(smoothstep(t31 - 0.3, t31 + 2.0, t));
    const rp = rope(t);
    const rpPose = { ...KP.stand, aN: 1.9 + 0.55 * Math.sin(hu * 6.28 * 3), eN: 0.5, aF: 1.9 + 0.55 * Math.sin(hu * 6.28 * 3 + 3.14), eF: 0.5, lean: 0.12, tilt: 0.35 };
    const base0 = kmix(kmix(KP.proud, KP.stand, 0.25), POSES.kavely((t - t0) / 0.9), wk);
    return capPose2(t, base0, rp, rpPose);
  };
  const capPose2 = (t, base0, rp, rpPose) => {
    const base = kmix(base0, KP.look, 0.6 * smoothstep(t0, t0 + 3, t) * (1 - smoothstep(tR4, tR4 + 3, t)));
    const p = kmix(kmix(kmix(base, KP.offer, reach(t)), rpPose, rp), KP.call, raise(t));
    return { ...p, tilt: p.tilt + 0.45 * reach(t) };
  };

  // kamera seuraa laivan tasoitettua polkua
  const follow = (f, dz = 0) => (u, t) => { const c = f(u); const d = hx(t); return { ...c, pos: [c.pos[0] + d, c.pos[1], c.pos[2] + dz], look: [c.look[0] + d, c.look[1], c.look[2]] }; };
  const lin = (x) => clamp(x);
  const shots = [
    // 1.5 lento parven mukana, kamera vedenpinnan tasolla; laiva pieni, tiirat ja meri johtavat
    { name: '1.5a lento parven mukana: tiirat syntyvät vaahdosta', a: t0, b: t25,
      cam: follow(camPath([{ pos: [-16, 1.0, 30], look: [-6, 3.0, 0], fov: 42 }, { pos: [-6, 2.2, 26], look: [0, 4.5, 0], fov: 42 }])) },
    { name: '1.5b ritari keulassa ojentaa kätensä, tiira laskeutuu kärkeen', a: t25, b: t31,
      cam: follow(camPath([{ pos: [12, 3.0, 20], look: [5.5, 4.0, 0], fov: 40 }, { pos: [10.5, 3.4, 16], look: [5.5, 4.4, 0], fov: 40 }])) },
    // 1.6 purje nousee; sivuajo laivaston rinnalla
    { name: '1.6a purje nousee', a: t31, b: t34,
      cam: follow(camPath([{ pos: [14, 5.0, 26], look: [2, 6.0, -2], fov: 40 }, { pos: [11, 5.5, 25], look: [1, 6.5, -2], fov: 40 }])) },
    { name: '1.6b sivuajo: laivasto rinnakkain', a: t34, b: tR4,
      cam: follow(camPath([{ pos: [-18, 5, 30], look: [-12, 5, -10], fov: 42 }, { pos: [2, 5.5, 30], look: [-2, 5.5, -10], fov: 42 }])) },
    // 1.7 mainingit kasvavat; kamera lähestyy lähikuvaan, jossa kello nousee sointuun
    { name: '1.7a mainingit kasvavat, kello nousee (lähikuva)', a: tR4, b: tR5,
      cam: follow(camPath([{ pos: [-8, 2.5, 30], look: [1, 5, 0], fov: 42 }, { pos: [3, 2.8, 20], look: [4, 4.5, 0], fov: 40 }, { pos: [8, 3.6, 9.5], look: [4.4, 3.6, 0], fov: 36 }])) },
    // lähikuva vetäytyy yhtenä liikkeenä laajaan; huipulla kamera korkeammalla kuin aamussa (1.3)
    // 1.7b alkaa 1.7a:n loppuavaimella: kamera jatkuu saumattomasti (ei hyppyä ff-iskun kohdalla)
    { name: '1.7b harjan yli: lähikuvasta laajaan, aurinko murtautuu', a: tR5, b: t47,
      cam: follow(camPath([{ pos: [8, 3.6, 9.5], look: [4.4, 3.6, 0], fov: 36 }, { pos: [3, 7, 26], look: [4.6, 7.5, 0], fov: 44 }, { pos: [-2, 10, 34], look: [6, 10.5, 0], fov: 46 }])) },
    { name: '1.7c laskeutuu niitylle', a: t47, b: tEnd + 1.6,
      cam: follow(camPath([{ pos: [-2, 12, 40], look: [6, 11, 0], fov: 46 }, { pos: [4, 2.0, 30], look: [8, 3.0, 0], fov: 44 }], lin)) },
  ];

  let st = { tiirat: 0, tiirat_y: 0, roiske: 0, karjessa: 0 };
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
    // harpun nuotinalut: välkerenkaat laivan ympärillä (renkaat jäävät paikalleen veteen)
    const recent = harpOns.filter((o) => o <= t + S.LEAD && o > t - 2.6).slice(-12);
    seaNear.rings.forEach((R, i) => {
      const o = recent[i];
      if (o === undefined) { R.set(0, 0, -99, 0); return; }
      const rx = hx(o) - 14 + 28 * hash1(Math.round(o * 100));
      R.set(rx, seaNear.surf(rx) - 0.3, o - S.LEAD, 0.6 + 0.6 * hash1(Math.round(o * 100) + 1));
    });
    // sankarin laiva ja kapteeni
    const x = hx(t);
    ride(hero, seaNear, x, t, { z: 0, tiltK: 0.9 });
    hero.setSail({ hoist: hoist(t), wind: w, t, pen: 1 });
    const pose = capPose(t);
    hero.cap.root.position.x = capX(t);
    hero.poseCaptain(0, t, w, pose);
    // keulakeihäs kapteenin kaukokädessä (kämmen ojennetaan lähikädellä); kallistuu hiukan eteen
    const fk = handFK(hero.cap, pose, false);
    const cs = 1.15 * h;
    lance.position.set(capX(t) + cs * fk.hand[0], 0.05 * h + cs * fk.hand[1], 0.35);
    lance.rotation.z = -0.18;
    lanceFlag.uniforms.uTime.value = t;
    lanceFlag.uniforms.uAmp.value = 0.08 + 0.3 * w;
    // laivasto: tulee held_t34:ssä; pysyy omilla syvyyksillään
    mates.forEach((m) => {
      m.s.root.visible = mateIn(t) > 0.001;
      ride(m.s, seaMid, mateX(m.i, t), t, { z: mateZ[m.i] - 0.5 });
      m.s.setSail({ hoist: 0.95, wind: w, t: t + m.i * 0.5, pen: 1 });
    });
    // tiirat
    const cx = x + 4;
    const ld = land(t);
    hero.body.updateMatrixWorld(true);
    const tipW = new THREE.Vector3(Math.sin(0.18) * LANCE_TIP, Math.cos(0.18) * LANCE_TIP, 0).add(lance.position);
    hero.body.localToWorld(tipW);
    let nVis = 0, ySum = 0, wingSum = 0;
    flock.birds.forEach((B) => {
      const i = B.i;
      const b0 = birth(i);
      if (t < b0) { B.g.visible = false; return; }
      B.g.visible = true;
      const age = t - b0;
      const rise = ease(clamp(age / 1.6));
      const ph = hash1(i * 13) * 6.28;
      const glide = smoothstep(t25 - 1, t25 + 2, t) * (1 - smoothstep(t34 - 2, t34, t));
      // 1.5: parvi kiertää ritaria (held_t25 alkaen tiukemmin keulan ympärillä)
      const circ = smoothstep(t25 - 1, t25 + 2, t) * (1 - smoothstep(t31, t31 + 3, t));
      const wa = W.winds(t);
      const bx = cx - 14 + 28 * hash1(i * 7) + 4 * Math.sin(0.35 * t + ph) + circ * (x + 5 + 7 * Math.cos(0.5 * t + ph) - (cx - 14 + 28 * hash1(i * 7)));
      let by = mix(seaNear.surf(bx) + 0.3, 11.5 + 5 * hash1(i * 3) + 1.5 * Math.sin(0.5 * t + ph) * (0.4 + wa) - 1.0 * glide - 5.5 * circ * hash1(i * 5), rise);
      // sforzandot: syöksy kohti pintaa ja takaisin (tiiran teko, ei koko kuvan)
      let dive = 0;
      for (const s of sfz) { const a = t - (s - S.LEAD); if (a >= 0 && a < 1.0 && hash1(Math.round(s * 50) + i) < 0.45) dive = Math.max(dive, Math.sin(Math.PI * a) ); }
      by -= 5 * dive;
      let bz = 3 + 6 * hash1(i * 17);
      let sc = 2.6 + 1.4 * hash1(i * 5);
      let f = Math.sin(flap(t) * (0.9 + 0.2 * hash1(i)) + ph);
      let sy = glide > 0.5 ? 0.7 + 0.15 * f : 0.35 + 0.65 * Math.abs(f);
      let rz = 0.15 * Math.sin(0.7 * t + ph) + 0.3 * (1 - rise);
      if (i === 0 && ld > 0.001) {
        // yksi tiira laskeutuu keulakeihään kärkeen (siivet sulkeutuvat)
        const fx = bx + (tipW.x - bx) * ld, fy = by + (tipW.y + 0.35 - by) * ld;
        B.g.position.set(fx, fy, 0.5);
        B.g.scale.set(sc * (1 - 0.35 * ld), sc * mix(sy, 0.3, ld), 1);
        B.g.rotation.z = rz * (1 - ld);
        nVis++; ySum += fy; wingSum += 0.3;
        return;
      }
      B.g.position.set(bx, by, bz);
      B.g.scale.set(sc, sc * sy * (0.45 + 0.55 * clamp(W.winds(t) * 2)), 1);
      B.g.rotation.z = rz - 0.6 * dive;
      nVis++; ySum += by; wingSum += sy * (0.4 + 1.2 * W.winds(t));
    });
    // roiskeet: tiirojen synty vaahdosta ja ff-soinnun keularoiske (isku)
    const ev = [];
    for (let i = 0; i < flock.birds.length; i++) { const b0 = birth(i); if (t >= b0 - S.LEAD && t < b0 + 1) { const bx = cx - 14 + 28 * hash1(i * 7); ev.push({ t: b0, x: bx, y: seaNear.surf(bx) - 0.2, s: 0.5 }); } }
    if (t >= tR5 - S.LEAD && t < tR5 + 1) ev.push({ t: tR5, x: x + 7.5, y: hero.root.position.y - 0.2, s: 1.1 });
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
    st = { tiirat: nVis, tiirat_y: nVis ? ySum / nVis : 0, roiske: spl.list.filter((g) => g.visible).length + crest.list.filter((g) => g.visible).length, karjessa: ld,
      laiva_y: hero.root.position.y, laivasto: mates.filter((m) => m.s.root.visible).length, purje: hoist(t), mainingit: pk, aurinko: gap,
      kello: raise(t), torvi: raise(t), kammen: reach(t), vareet: recent.length, olennot: wingSum, tuuli: v, pollahdys: spl.list.filter((g) => g.visible).length + crest.list.filter((g) => g.visible).length };
    return { dim: 0, wind: w };
  }
  const probe = () => ({ ...st });
  return { scene, update, shots, probe };
}
