// F ylätasanko ja putous, G myrskyvuori: kuvakäsikirjoituksen otot 16–24
// (ankkurit held_t61 ... held_dom7).
//   16 Vuoret kohoavat alhaalta, joukko marssii ylätasangolle.
//   Osa 1 (31.10.2026): muste vain kohdassa 1.11 (reh8 -> reh9): YKSI leveä veto rivin yllä, ritarit vain nostavat
//      kellot (ei keihäitä, ei kahdeksaa vetoa, ei lankoja). Muualla viiri on viiri. Ohjaus: 1.10 vedot kokoontuvat,
//      1.12 sankari kulkee rivin editse, 1.13 kiipeää kalliolle ja osoittaa keihäällä vaakaan kohti myrskyvuorta,
//      1.14 joukko laskeutuu putouksen vierestä, 1.17 iskee keihään kiveen.
//   17 H8: koko joukko tasangolla, kellot ylhäällä (leikkaus jakson alkuun); 17-18 yksi otto.
//   18 H9: kellojen portaat: sarjan jokainen isku nostaa seuraavan kellon.
//   19 H10: kaikki liikkeessä, myrskyvuori kaukana (ei patarumpuja).
//   20 H11: putous; harpun nuotinalut ovat aaltoja, jotka syöksyvät alas.
//   21 H12: myrskypilvet, sade, patarummut jyrisevät; joukko kiipeää rinnettä.
//   21-22 yhtenä jatkuvana ottona. Neljä kohtaloiskua: katko on sisäänhengitys (sade ja tuuli
//      hiljenevät, liike jatkuu), iskussa salama lyö joukon edellä yhä lähemmäs huippua, ritari loikkaa
//      ja viiri napsahtaa. Koko kuvaa ei jähmetetä, välähdetä eikä täristetä.
//   23 Ritari nousee huipulle ja pystyttää viirin, toverit liittyvät.
//   24 Tablo: selkäkuva (2/2) ja sädekehä (taajuuskaistat), kellot ylhäällä.

import * as THREE from 'three';
import { C, ink, flat, group, poly, rect, circle, cloud, crownPeak, ridgeGeo, skylineGeo, strokeGeo, boltPoints, waveMat, pennantGeo, streaks, sky as makeSky, clamp, smoothstep, mix, hash1, vnoise1 } from './paper.js';
import { knightBack, KP, kmix, backGrip } from './puppets.js';
import { leader, camPath, ease, GRIP_BELOW } from './hero.js';
import { tipTrail } from './brush.js';

export function build(K) {
  const { S } = K;
  const A = K.a;
  const tT61 = S.A('held_t61').t;
  const tReun = S.A('held_reh8').t;
  const tSteps = S.A('held_reh9').t;
  const tFar = S.A('held_reh10').t;
  const tFall = S.A('held_reh11').t;
  const tStorm = S.A('held_reh12').t;
  const hits = ['held_isku1', 'held_isku2', 'held_isku3', 'held_isku4'].map((id) => S.A(id).t);
  const tChord = S.A('held_dom7_sointu').t;
  const T_D = S.A('held_dom7').t;
  // katkot: pidetty sointu katkeaa ennen kutakin kohotahti-iskua (interpret.py). Katko on
  // sisäänhengitys: sade ja tuuli hiljenevät, liike jatkuu (kuvakäsikirjoitus, luku 4).
  const breaks = hits.map((h) => [S.drops.filter((d) => d < h && d > h - 2.5).pop() ?? h - 1.0, h]);
  const brk = (t) => breaks.reduce((m, [d, h]) => Math.max(m, smoothstep(d - 0.1, d + 0.25, t) * (1 - smoothstep(h - S.LEAD - 0.06, h - S.LEAD, t))), 0);
  const stepHits = S.accIn(tSteps - 0.3, tSteps + 2.5, 5).map((x) => x.t);
  const tTab = mix(tChord, T_D, 0.5);
  const tStrike = mix(tChord, T_D, 0.82);   // 1.17 keihäs iskee kiveen
  const scene = new THREE.Scene();
  const SKY = makeSky(scene);

  // --- maailma: tasanne x -40..60, rinne 60..140 (huippu y 46) ---
  const SUMX = 140, SUMY = 46;
  const slopeY = (x) => (x < 60 ? 0 : x < SUMX ? Math.pow((x - 60) / (SUMX - 60), 1.15) * SUMY : SUMY);
  const groundPts = [];
  for (let i = 0; i <= 420; i++) { const x = -60 + i * 0.6; groundPts.push([x, slopeY(x) + 0.25 * (vnoise1(x / 2.3, 5) - 0.5) * (x > 60 ? 3 : 1)]); }
  const groundMat = ink(C.black, { shade: C.blue, raster: 0.15 });
  flat(scene, skylineGeo(groundPts, -60), groundMat, { z: 0 });
  // huipun kruunu: ritari seisoo keskisyvennyksessä (noin 0,65 h), kärjet kehystävät häntä eivätkä
  // peitä sädekehän taivasta tablon lähiotossa
  flat(scene, crownPeak(14, 6, 3), groundMat, { x: SUMX - 0.3, y: SUMY - 4.0, z: -0.05 });
  const far3 = flat(scene, ridgeGeo(-500, 900, 46, 51, { lambda: 150, base: -300 }), ink(C.paper, { shade: C.blue, raster: 0.32 }), { z: -230 });
  const stormMt = flat(scene, crownPeak(120, 70, 9), ink(C.blue, { shade: C.black, raster: 0.25 }), { x: 260, y: 0, z: -180 });
  const mid = flat(scene, ridgeGeo(-300, 600, 14, 53, { lambda: 45, base: -120 }), ink(C.blue, { shade: C.paper, raster: 0.1 }), { z: -70 });
  // putous nousee maasta held_reh11:ssä (1.14: maailma johtaa); 1.13:ssa ritari ja myrskyvuori ovat kuvassa kahden
  const fallG = group(scene, {});
  // putous tasangon reunalla (x 30): kallion lovesta vesi kaartuu reunan yli, sininen vesipatsas
  // vaaleine virtausnauhoineen, alas valuvat juovat (puhdas ajan funktio), pohjalla vaahto
  const FX = 30, FTOP = 22.5;
  flat(fallG, poly([[FX - 9, -20], [FX - 9, -1], [FX - 7.5, 14], [FX - 6, 19], [FX - 4.2, 24.2], [FX - 2.8, 23.6], [FX - 2.2, FTOP], [FX + 2.2, FTOP],
    [FX + 2.9, 23.8], [FX + 4.6, 25.2], [FX + 6.5, 20], [FX + 8, 12], [FX + 9.5, -1], [FX + 9.5, -20]]), ink(C.black, { shade: C.blue, raster: 0.3 }), { z: -6.2 });
  const lip = []; for (let i = 0; i <= 12; i++) { const a = Math.PI * i / 12; lip.push([FX - 2.2 * Math.cos(a), FTOP + 0.7 * Math.sin(a)]); }
  flat(fallG, poly([[FX - 2.2, FTOP - 0.4], ...lip, [FX + 2.2, FTOP - 0.4]]), ink(C.paper, { shade: C.blue, raster: 0.2 }), { z: -6.0 });
  flat(fallG, rect(4.4, FTOP + 1, 0.5, 0), ink(C.blue, { shade: C.paper, raster: 0.45 }), { x: FX, y: -1, z: -6.05 });
  [-1.5, -0.7, 0.1, 0.8, 1.6].forEach((dx, k) => flat(fallG, rect(0.22 + 0.25 * hash1(k + 40), FTOP + 1, 0.5, 0), ink(C.paper, { shade: C.blue, raster: 0.15 }), { x: FX + dx, y: -1, z: -6.0 }));
  const fallDash = Array.from({ length: 22 }, (_, k) => ({ k, m: flat(fallG, rect(0.14, 1.0 + 0.8 * hash1(k + 60), 0.5, 0), ink(C.blue, { shade: C.black, raster: 0.3 }), { x: FX - 1.9 + 3.8 * hash1(k + 61), z: -5.95 }) }));
  const foam = flat(fallG, cloud(10, 3.2, 77, false), ink(C.paper, { shade: C.blue, raster: 0.12 }), { x: FX, y: -1.4, z: -5.8 });
  // putouksen juuren maa: vesipatsaan ja kallion alareuna jää sen taakse, vaahto nousee sen takaa
  const poolPts = []; for (let i = 0; i <= 28; i++) { const x = FX - 14 + i; poolPts.push([x, -1.1 + 0.35 * vnoise1(x * 0.8, 71)]); }
  flat(fallG, skylineGeo(poolPts, -20), groundMat, { z: -5.7 });
  const waveMats = [];
  const waves = Array.from({ length: 14 }, (_, k) => { const m = ink(C.paper); waveMats.push(m); const w = flat(fallG, cloud(5.0, 1.0, k + 90, false), m, { x: FX, z: -5.9 }); w.visible = false; return w; });
  const harpOns = S.onsetsIn(tFall - 0.2, tStorm).filter((o) => S.fam.harp(o) > 0.18);
  const fallHits = S.accIn(tFall - 0.2, tFall + 4, 5).map((x) => x.t);
  const fallEvents = [...new Set([...fallHits, ...harpOns])].sort((a, b) => a - b);
  // myrskypilvet ja sade
  const stormClouds = Array.from({ length: 26 }, (_, k) => {
    const m = flat(scene, cloud(34 + 20 * hash1(k), 16 + 8 * hash1(k + 1), k + 300, false), ink(C.black, { shade: C.blue, raster: 0.35 }), { y: 40 + 30 * hash1(k + 2), z: -60 - 70 * hash1(k + 3) });
    m.k = k;
    return m;
  });
  const rain = streaks(scene, 260, ink(C.paper, { shade: C.blue, raster: 0.3 }), 2);
  const boltMat = ink(C.paper);
  const strongStrokes = S.strokesIn(tStorm, breaks[0][0]).filter((t, i, a) => i === 0 || t - a[i - 1] > 2.5).slice(0, 3);
  const dropTimes = breaks.map((b) => b[0]);   // salama = pidetyn soinnun katkeaminen, joka EDELTÄÄ paussin (ei paussin kohtaa)
  const boltTimes = [...strongStrokes, ...dropTimes];
  // salama: leveä paperinvalkoinen ydin mustalla ääriviivalla; kohtaloiskuissa sivuhaara ja
  // iskupisteeseen piikikäs leimahdus. Kasvaa iskusta toiseen (neljäs suurin).
  const boltEdge = ink(C.black);
  const burst = () => { const pts = []; for (let j = 0; j < 22; j++) { const a = (j / 22) * Math.PI * 2; const r = j % 2 ? 0.32 + 0.12 * hash1(j + 3) : 1; pts.push([r * Math.cos(a), r * Math.sin(a)]); } return poly(pts); };
  const flareMats = [];
  const bolts = boltTimes.map((te, i) => {
    const k = dropTimes.indexOf(te);
    const ZIG = 2.4;   // vaakavenytys: siksak näkyy, leveys kompensoidaan
    const W = (k < 0 ? 1.6 : 3.0 + 0.8 * k) / ZIG;
    const m = group(scene, { z: -8 });
    m.scale.x = ZIG;
    const core = boltPoints(i + 7, 0, 60, 0, 0);
    flat(m, strokeGeo(core, (u) => W * 1.7 * (0.5 * (1 - u) + 0.2)), boltEdge, { z: -0.02 });
    flat(m, strokeGeo(core, (u) => W * (0.5 * (1 - u) + 0.2)), boltMat, {});
    if (k >= 0) {
      const br = boltPoints(i + 57, core[5][0], core[5][1], core[5][0] + (i % 2 ? 3 : -3), core[5][1] - 16);
      flat(m, strokeGeo(br, (u) => W * 0.9 * (0.4 * (1 - u) + 0.15)), boltEdge, { z: -0.02 });
      flat(m, strokeGeo(br, (u) => W * 0.5 * (0.4 * (1 - u) + 0.15)), boltMat, {});
    }
    m.visible = false;
    let fl = null;
    if (k >= 0) { const fm = ink(C.paper, { shade: C.red, raster: 0.2 }); flareMats.push(fm); fl = flat(scene, burst(), fm, { z: -7.9 }); fl.visible = false; }
    return { m, fl, te, k };
  });

  // --- sankarit ---
  const L = leader(scene, {});
  const back = knightBack(scene);
  const backLance = back.lance;   // ryhmä on oikean käden kämmenessä (puppets.js knightBack.hold)
  flat(backLance, rect(0.05, 3.8 + GRIP_BELOW, 0.5, 0), ink(C.black), { y: -GRIP_BELOW });
  const backFlag = flat(backLance, pennantGeo(2.4, 0.85), waveMat(C.red, { amp: 0.25, k: 5 }), { y: 3.5, z: 0.01 });
  // toverit: keihäs ja viiri kädessä (hero.js leader), ei erillisiä viiritankoja
  const mates = Array.from({ length: 7 }, (_, i) => ({ L: leader(scene, { raster: 0.1 * (i % 3), lance: 3.4, nb: 16, bannerColor: i % 2 ? C.paper : C.red }), i, x0: -6 + i * 2.6 - (i > 2 ? -3.2 : 0), z: [-0.4, 0.2, -0.7, 0.1, -0.5, 0.3, -0.9][i] }));

  // kiipeäminen rinteessä: H12:n leikkauksessa joukko on jo rinteen juurella (x 60), sitten tasainen
  // nousu, neljä askelta iskuissa ja huipulle soinnun alkuun
  // paussissa kiipeäminen pysähtyy (nopeus 1 - brk) ja jatkuu kohotahti-iskulla; tau on uudelleenaikaistettu aika
  // (kohtauksen alku ja loppu pysyvät), joten huippu saavutetaan ajoissa.
  const tEndC = tChord + 1.5, DT = 0.02;
  const cum = [0];
  for (let t = tStorm; t < tEndC; t += DT) cum.push(cum[cum.length - 1] + DT * (1 - 0.97 * brk(t + DT / 2)));
  const tau = (t) => {
    if (t <= tStorm) return t;
    if (t >= tEndC) return t;
    const f = (t - tStorm) / DT, i = Math.min(cum.length - 2, Math.floor(f));
    const c = cum[i] + (cum[i + 1] - cum[i]) * (f - i);
    return tStorm + ((tEndC - tStorm) * c) / cum[cum.length - 1];
  };
  const climbX = (t0) => {
    const t = tau(t0);
    let x = 60 + 50 * ease(clamp((t - tStorm) / (breaks[0][0] - tStorm)));
    // (ei loikkia: salama on elementti, ritari kiipeää tasaisesti)
    x += (SUMX - 1.5 - 124) * ease(clamp((t - hits[3] - 0.5) / (tChord + 1.5 - hits[3] - 0.5)));
    return x;
  };
  const SLOT = [0, 1, 2, 4, 5, 6, 7];   // kahdeksan ritaria rivissä, sankari paikalla 3
  const rowX = (slot) => -2 + 2.6 * (slot - 3);
  const raise = (t, i) => smoothstep(tReun - 0.1 + 0.05 * i, tReun + 0.45 + 0.05 * i, t);   // kellot nousevat yhdessä
  const march = (t) => (t < tReun ? mix(-40, -2, ease(clamp((t - A) / (tReun - A - 0.5)))) : -2);
  const horns = (t) => smoothstep(0.35, 0.8, S.energy.horns(t));
  // kahdeksan käyrätorven teema (kohtaus 17): keihäät nousevat sävelen mukana. CREPE ei erota teemaa
  // ff-tutista (S.melody litteä), joten sävel otetaan alun teemaviivan muodosta aikaskaalattuna jaksoon
  // [TULKINTA, lähde: partituuri/opas]. Ikkuna lanceWin: tReun ... tSteps.
  const TSPAN = tSteps - tReun - 0.6;
  const TLm = K.TL, tA = S.A('held_alku').t, tB = S.A('held_viulut').t;
  const thMidi = (u) => { for (let d = 0; d < 12; d++) { const m = TLm.midi(tA + clamp(u + (d % 2 ? -1 : 1) * Math.ceil(d / 2) * 0.004) * (tB - tA)); if (m !== null) return m; } return 55; };
  const pitchU = (tt) => { let a = 0; for (let q = -2; q <= 2; q++) a += clamp((thMidi(clamp((tt - tReun) / TSPAN) + q * 0.0025) - 39) / 36, 0, 1.05); return a / 5; };
  const lanceWin = (tt) => smoothstep(tReun - 0.6, tReun + 0.4, tt) * (1 - smoothstep(tSteps + 0.6, tSteps + 2.6, tt));
  const LP = (u) => ({ ...KP.lanceUp, aN: 1.45 + 1.3 * u, eN: 0.55 - 0.3 * u, lanceAng: 0.55 - 0.75 * u });
  // kallio (1.13): sankari kiipeää sille ja osoittaa keihäällä vaakaan kohti myrskyvuorta
  const ROCK_X0 = 11, ROCK_TOP_X = 17.6, ROCK_TOP_Y = 6.8;
  const rockY = (x) => ROCK_TOP_Y * ease(clamp((x - ROCK_X0 - 0.4) / (ROCK_TOP_X - ROCK_X0 - 1.6)));
  const tUp1 = tFar + 0.4 * (tFall - tFar);   // kiipeämisen loppu: osoitus alkaa
  const tDn0 = tFall;
  const tDn1 = tFall + 0.4 * (tStorm - tFall);
  const gait = (t, k = 0.45) => (Math.floor(t / k) % 2 ? KP.stepA : KP.stepB);
  const FOOT = 22;   // joukko kokoontuu putouksen altaalle
  function leaderState(t) {
    if (t < tStorm) {
      let x = march(t), y = 0, z = 0.3, pose;
      if (t < tReun - 0.5) pose = gait(t);
      else if (t < tSteps) pose = kmix(KP.proud, KP.call, Math.max(horns(t), S.pulse(t, tReun, 1.5), raise(t, 3)));
      else if (t < tFar) {
        // 1.12: sankari kulkee rivin editse (edessä, lähempänä kameraa)
        const u = ease(smoothstep(tSteps, tFar, t));
        x = mix(-2, ROCK_X0, u); z = 0.9;
        pose = kmix(KP.proud, gait(t, 0.5), smoothstep(tSteps, tSteps + 1.0, t));
      } else if (t < tUp1) {
        const u = ease(smoothstep(tFar, tUp1 - 2.0, t));
        x = mix(ROCK_X0, ROCK_TOP_X, u); y = rockY(x); z = 0.5;
        pose = kmix(gait(t, 0.5), Math.floor(t / 0.5) % 2 ? KP.climbA : KP.climbB, smoothstep(0.1, 0.5, u));
        pose = kmix(pose, KP.proud, smoothstep(tUp1 - 2.0, tUp1, t));
      } else if (t < tDn0) {
        x = ROCK_TOP_X; y = ROCK_TOP_Y; z = 0.5;
        const pt = smoothstep(tUp1 - 0.5, tUp1 + 1.5, t);
        pose = kmix(KP.proud, { ...KP.lanceFwd, aN: 1.1, eN: 0.7, lanceAng: 1.45, lean: 0.05 }, pt);
      } else {
        const u = ease(smoothstep(tDn0, tDn1, t));
        x = mix(ROCK_TOP_X, FOOT - 3, u);
        y = ROCK_TOP_Y * (1 - ease(clamp(u * 1.6)));
        z = 0.5;
        pose = kmix(kmix({ ...KP.lanceFwd, aN: 1.1, eN: 0.7, lanceAng: 1.45 }, KP.proud, smoothstep(tDn0, tDn0 + 1.0, t)), gait(t, 0.5), smoothstep(tDn0, tDn0 + 1.5, t) * (1 - smoothstep(tDn1 - 0.5, tDn1 + 0.5, t)) * 0.9);
        pose = kmix(pose, KP.proud, smoothstep(tDn1, tDn1 + 1.5, t));
      }
      return { x, y, z, facing: 1, pose: { ...pose, mounted: false } };
    }
    const x = climbX(t) + 1.2;
    const atTop = smoothstep(tChord - 1, tChord + 1, t);
    const c0 = Math.floor(tau(t) / 0.5) % 2 ? KP.climbA : KP.climbB;
    const c = kmix(c0, { ...KP.stand, lean: -0.1 }, brk(t));
    const leap = 0;   // ei loikkia salamoissa
    const pose = kmix(kmix({ ...c, lean: 0.3 }, { ...KP.lanceUp, lean: 0.15 }, 0.75 * leap), KP.plant, atTop);
    return { x, y: slopeY(x), z: 0.35, facing: 1, pose: { ...pose, mounted: false } };
  }
  const windAt = (t) => {
    const st = smoothstep(tStorm, tStorm + 6, t);
    const gust = hits.reduce((m, h) => Math.max(m, S.pulse(t, h, 0.4)), 0);
    return { x: -((1.5 + 7 * st + 2 * S.loud(t)) * (1 - 0.95 * brk(t)) + 7 * gust), y: 0.5 + 1.5 * S.energy.violins(t) - 0.8 * st + 1.2 * gust - 5 * brk(t) };
  };
  // kameran tasoitettu polku; ei sekoita tasangon ja rinteen näytteitä H12:n leikkauksen yli
  const lazy = (t, lag = 1.0) => {
    const t0 = t >= tStorm ? tStorm : -Infinity;
    let x = 0, y = 0;
    for (let k = 0; k < 7; k++) { const s = leaderState(Math.max(t0, t - (k / 6) * lag)); x += s.x; y += s.y; }
    return [x / 7, y / 7];
  };

  const lin = (x) => clamp(x);
  const shots = [
    { name: '16 vuoret kohoavat, joukko marssii', a: A - 1, b: tReun, cam: camPath([{ pos: [-30, -0.4, 16], look: [-24, 2.4, 0], fov: 44 }, { pos: [-12, 1.2, 15], look: [-6, 3.2, 0], fov: 44 }]) },
    // 1.11: koko joukko rivissä, kellot ylhäällä, yksi leveä veto yllä (laaja, ritarit pieniä)
    { name: '1.11 rivi ja leveä veto', a: tReun, b: tSteps - S.LEAD, cam: camPath([{ pos: [-4, 3.2, 20], look: [-2, 4.3, 0], fov: 44 }, { pos: [3, 3.8, 15], look: [0, 4.7, 0], fov: 44 }], (u) => clamp(u)) },
    // 1.12: kellojen portaat tekevät iskun; sivuajo rivin ohi sankarin mukana
    { name: '1.12 viirien portaat, sivuajo', a: tSteps - S.LEAD, b: tFar, cam: camPath([{ pos: [-6, 1.7, 11], look: [-3, 2.8, 0], fov: 42 }, { pos: [8, 2.0, 10], look: [10, 3.0, 0], fov: 42 }], lin) },
    // 1.13: laaja, korkealla; sankari kalliolla pieni, myrskyvuori kaukana
    { name: '1.13 kallio ja myrskyvuori', a: tFar, b: tFall, cam: camPath([{ pos: [9, 7.5, 24], look: [22, 10.5, 0], fov: 44 }, { pos: [12, 8.5, 28], look: [30, 12, 0], fov: 44 }], lin) },
    { name: '20 putous', a: tFall, b: tStorm, cam: camPath([{ pos: [FX - 4, 22, 22], look: [FX, 14, -6], fov: 42 }, { pos: [FX - 6, 6, 24], look: [FX, 2, -6], fov: 44 }, { pos: [FX - 10, 10, 30], look: [FX + 2, 10, -6], fov: 44 }], (u) => 0.4 * clamp(u) + 0.6 * (1 - (1 - clamp(u)) ** 3)) },
    // 21-22: yksi jatkuva otto H12:sta soinnun alkuun. Sivuajo sateessa kääntyy joukon taakse, ja
    // kohtaloiskujen ajan kamera nousee nosturina joukon mukana; salamat lyövät edellä kuvassa.
    { name: '21-22 rinne sateessa ja kohtaloiskut', a: tStorm, b: tChord, cam: (u, t) => {
      // rinteen sivulta: harjalinja kulkee kuvan poikki vinosti, salamat lyövät taivasta vasten
      const [lx, ly] = lazy(t, 1.6);
      const e1 = ease(clamp((t - tStorm) / (breaks[0][0] - tStorm)));
      const e2 = ease(clamp((t - breaks[0][0] + 2) / (tChord - breaks[0][0] + 2)));
      return { pos: [lx + 6 - e1 + 2 * e2, ly + 4 + e1 + 5 * e2, 30 + 6 * e2], look: [lx + 4 + 4 * e1 + 3 * e2, ly + 4 + e1 + 4 * e2, 0], fov: 44 };
    } },
    { name: '23 nosturi huipulle', a: tChord, b: tTab, cam: (u, t) => { const [lx, ly] = lazy(t, 1.4); return { pos: [lx + 6, ly + 1.5 + 5 * ease(u), 24 - 4 * ease(u)], look: [lx + 2, ly + 3, 0], fov: 44 }; } },
    // tablo: tasainen hidas lähestyminen koko soinnun ajan (ei pysähdy: jännite pysyy)
    { name: '24 tablo: selkäkuva ja sädekehä', a: tTab, b: T_D + 3, cam: camPath([{ pos: [SUMX + 0.6, SUMY + 1.5, 10.0], look: [SUMX + 30, SUMY + 60, -480], fov: 50 }, { pos: [SUMX + 0.6, SUMY + 1.1, 8.2], look: [SUMX + 32, SUMY + 67, -480], fov: 50 }], (u) => u) },
  ];

  // --- kahdeksan käyrätorven teema (kohtaus 17): YKSI leveä veto rivin yllä (ritarit vain nostavat kellot) ---
  // Toverin tila tasangolla (puhdas ajan funktio): paikka rivissä ja asento; 1.14: laskeutuvat altaalle.
  function mateFlat(i, tt) {
    const m = mates[i];
    let x = mix(march(tt) + m.x0 + 2, rowX(SLOT[i]), smoothstep(tReun - 1.8, tReun - 0.2, tt));
    const walking = tt < tReun - 0.5;
    const stepUp = tt >= tSteps - 2 * S.LEAD && tt < tFar ? smoothstep(0, 0.25, tt - (stepHits[Math.min(stepHits.length - 1, Math.floor(i / 3))] ?? tSteps) + 2 * S.LEAD) : 0;
    const base = walking ? gait(tt + i * 0.1) : KP.proud;
    const bell = Math.max(horns(tt), S.pulse(tt, tReun, 1.5), raise(tt, i), tt >= tSteps - 2 * S.LEAD && tt < tFar ? stepUp * (0.6 + 0.4 * (i / 6)) : 0);
    let pose = kmix(base, KP.call, walking ? 0 : bell);
    // 1.14 joukko laskeutuu putouksen vierestä altaalle (sankari edellä)
    const dn = ease(smoothstep(tFall + 1.0 + 0.25 * i, tFall + 0.4 * (tStorm - tFall) + 0.25 * i, tt));
    x = mix(x, FOOT + 2.3 * (i - 2.5) + 6, dn);
    pose = kmix(pose, gait(tt + 0.1 * i, 0.5), dn * (1 - smoothstep(0.9, 1, dn)) * 0.9);
    return { x, y: 0, pose };
  }
  // yksi leveä veto rivin yllä: kärki kulkee rivin yli vasemmalta oikealle sävelen korkeudella
  // [TULKINTA: sävel aikaskaalattuna alun teemaviivasta, ks. thMidi]
  const bandTip = (tt) => {
    if (tt < tReun - 0.3 || tt > tSteps + 0.2) return null;
    const u = clamp((tt - tReun) / (tSteps - tReun));
    return { x: rowX(0) - 1.5 + 21 * u, y: 5.7 + 2.3 * pitchU(tt), z: 0.2 };
  };
  const band = tipTrail(scene, S, { seed: 41, N: 300, win: 15, wmax: 0.78, wmin: 0.12, hairW: 0.08, drift: 0.05 });
  // 1.10: vedot kokoontuvat ritariksi (kuusi punaista vetoa lentää sankarin luo; ei melodiaviiva)
  const gather = Array.from({ length: 6 }, (_, k) => flat(scene, rect(1.1 + 0.3 * (k % 3), 0.13, 0.5, 0.5), ink(C.red, { shade: C.black, raster: 0.1 }), { z: 0.6 }));
  gather.forEach((g) => (g.visible = false));
  // sädekehän luonnos myrskyvuoren yllä (1.13): ohuita lyijykynäsäteitä
  const sketchRays = Array.from({ length: 11 }, (_, k) => {
    const a = (-0.95 + k * 0.19) * 1.0;
    const m = ink(C.paper, { shade: C.blue, raster: 0.55 });
    const g = flat(scene, rect(0.7, 60 + 25 * hash1(k + 80), 0.5, 0), m, { x: 260 + 30 * Math.sin(a) * 0, y: 74, z: -179 });
    g.rotation.z = -a; g.visible = false;
    return { g, m };
  });
  // kallio (1.13)
  flat(scene, poly([[ROCK_X0 - 0.5, -1], [ROCK_X0 + 1.0, 0.6], [ROCK_X0 + 2.6, 3.0], [ROCK_X0 + 4.2, 6.0], [ROCK_TOP_X - 1, ROCK_TOP_Y - 0.15], [ROCK_TOP_X + 3, ROCK_TOP_Y - 0.15], [ROCK_TOP_X + 3.8, 4.0], [ROCK_TOP_X + 4.0, -1]]), groundMat, { z: 0.15 });

  // toverin tila (puhdas ajan funktio): tasangolla mateFlat, rinteessä kiipeäminen, huipulla riviin
  function mateState(i, tt) {
    const m = mates[i];
    if (tt < tStorm) { const st = mateFlat(i, tt); return { x: st.x, y: st.y, z: m.z + 0.02, facing: 1, pose: { ...st.pose, mounted: false } }; }
    const call = horns(tt);
    const join = smoothstep(tChord + 1, tChord + 4, tt);
    const trailX = climbX(tt - 0.8 - 0.6 * i) + 1.2 - 2.0 * (i + 1);
    const topX = SUMX + [-7.5, -5.5, -3.5, 3.5, 5.5, 7.5, -9.5][i];
    const x = mix(trailX, topX, join);
    const y = mix(slopeY(trailX), SUMY - 1.4 * Math.abs(topX - SUMX) / 8, join);
    const c = kmix(Math.floor((tau(tt) + i * 0.2) / 0.5) % 2 ? KP.climbA : KP.climbB, { ...KP.stand, lean: -0.1 }, brk(tt));
    const pose = kmix({ ...c, lean: 0.3 }, kmix(KP.proud, KP.call, Math.max(call, smoothstep(T_D - 4, T_D - 1, tt))), join);
    return { x, y, z: m.z + 0.02, facing: join > 0.5 && topX > SUMX ? -1 : 1, pose: { ...pose, mounted: false } };
  }
  // viirin avaus: kulkueessa auki, rivissä (1.11) kääritty jotta muste on ainoa pääosa, portaiden iskuissa auki ryhmittäin
  function bannerOpen(i, t) {
    const furl = 1 - 0.55 * smoothstep(tReun - 1.0, tReun - 0.3, t);
    if (t < tSteps - 0.8) return furl;
    const hT = stepHits[Math.min(stepHits.length - 1, Math.floor(i / 3))] ?? tSteps;
    const opened = t < tSteps ? 0 : ease(smoothstep(hT - 2 * S.LEAD, hT + 0.5, t));
    return Math.max(furl * (1 - smoothstep(tSteps - 0.8, tSteps - 0.2, t)), opened);
  }

  function update(t) {
    const u = SKY.u;
    u.uTime.value = t;
    const dm = smoothstep(tFar, tStorm + 4, t);
    const st = smoothstep(tStorm, tStorm + 8, t);
    const gap = smoothstep(tChord - 2, tChord + 2.5, t);
    u.uBlueAmt.value = 1; u.uBlueH.value = mix(0.55, 0.1, st) + 0.4 * gap;
    u.uRedAmt.value = 0.15 + 0.25 * gap;
    u.uBlackTop.value = 0.75 * st * (1 - 0.6 * gap) + 0.15 * brk(t);   // katkossa yläilma tummuu
    u.uMurk.value = 0.3 * dm + 0.45 * st * (1 - gap);
    // vuoret kohoavat alhaalta (matala crescendo)
    const rise = ease(smoothstep(A - 0.5, tReun, t));
    far3.position.y = -30 * (1 - rise);
    mid.position.y = -12 * (1 - rise);
    stormMt.visible = t > tFar - 3;
    // aurinko ja sädekehä huipun takana (selkäkuvan suunnassa)
    u.uSun.value.set(SUMX + 30, SUMY + 60 + 45 * (t < tStorm ? 1 : 0), 26, t < tStorm ? 1 - dm : smoothstep(tChord, tChord + 3, t));
    u.uCloudGap.value.set(SUMX + 30, SUMY + 60, 160, gap);
    // sädekehä syttyy soinnun mukana ja sammuu, kun sointu katkeaa (held_dom7)
    u.uRays.value = (0.3 * smoothstep(tChord + 1, tStrike - 0.5, t) + 0.55 * smoothstep(tStrike - S.LEAD, tStrike + 0.5, t) + 0.15 * smoothstep(T_D - 0.5, T_D - S.LEAD, t)) * (1 - smoothstep(T_D - S.LEAD, T_D + 0.3, t));
    for (let k = 0; k < 6; k++) u.uBands.value[k] = clamp(S.bands[k](Math.min(t, T_D)) * 1.4);
    stormClouds.forEach((m) => {
      const k = m.k;
      const base = 60 + k * 16 + 30 * hash1(k + 9);
      const roll = 260 * (1 - smoothstep(tFar, tStorm + 10, t));
      // pilvet aukeavat sädekehän edestä: jokainen väistää tablokameran näkölinjasta omalla syvyydellään
      const x0 = base + roll + 4 * Math.sin(t * 0.2 + k);
      const xl = SUMX + 0.6 + 29.4 * (9.5 - m.position.z) / 489.5;
      const clear = 125 + (34 + 20 * hash1(k)) / 2;
      const dx = x0 - xl;
      m.position.x = x0 + gap * Math.sign(dx || 1) * Math.max(0, clear - Math.abs(dx));
      m.visible = t > tFar - 5;
    });
    // putous: juovat valuvat tasaisesti, aksentit ja harpun nuotinalut syöksyvät ryöppyinä alas
    for (const d of fallDash) {
      const ph = (t * (8 + 3 * hash1(d.k + 62)) + FTOP * hash1(d.k + 63)) % FTOP;
      d.m.position.y = FTOP - ph - 1;
    }
    waves.forEach((w) => (w.visible = false));
    let wk = 0, surge = 0;
    for (let i = fallEvents.length - 1; i >= 0 && wk < waves.length; i--) {
      const a = t - (fallEvents[i] - S.LEAD);
      if (a < 0 || a > 1.6) continue;
      const w = waves[wk++];
      w.visible = true;
      w.position.y = FTOP + 0.5 - 15 * a * a;
      w.scale.set(1 + 0.3 * a, 1, 1);
      surge = Math.max(surge, a > 1.1 ? 1 - (a - 1.1) / 0.5 : 0);
    }
    fallG.position.y = -70 * (1 - clamp((t - (tFall - S.LEAD)) / 1.8));
    foam.scale.set(1 + 0.25 * surge, 1 + 0.8 * surge, 1);
    // salamat: myrskyn patarumpujen lyönnit pilvissä, kohtaloiskut joukon edellä yhä lähempänä
    // huippua (neljäs osuu huippuun); iskupisteeseen leviää valoläikkä. Vain taivas välkähtää.
    let flash = 0;
    bolts.forEach((b, i) => {
      const a = t - (b.te - S.LEAD);
      const life = b.k < 0 ? 0.2 : 0.3 + 0.05 * b.k;
      b.m.visible = a >= 0 && a < life;
      const xs = b.k < 0 ? lazy(b.te)[0] + 14 + 10 * (hash1(i) - 0.5) : b.k === 3 ? SUMX : climbX(b.te) + 9 + 4 * b.k;
      if (b.m.visible) b.m.position.set(xs, b.k < 0 ? slopeY(xs) + 8 : slopeY(xs), -8);
      if (b.fl) {
        b.fl.visible = a >= 0 && a < 0.9;
        const r = (1.6 + 0.6 * b.k) * (0.45 + 1.4 * ease(clamp(a / 0.3)));
        b.fl.position.set(xs, slopeY(xs) + 0.3, -7.9);
        b.fl.rotation.z = 0.3 * b.k + 0.4 * a;
        b.fl.scale.set(r * 1.3, r, 1);
        b.fl.material.uniforms.uAppear.value = 1 - smoothstep(0.25, 0.9, a);
      }
      if (a >= 0 && a < 0.8) flash = Math.max(flash, (b.k < 0 ? 0.4 : 0.6 + 0.1 * b.k) * Math.exp(-a / 0.12));
    });
    u.uFlash.value = 0.2 * flash;
    const rr = smoothstep(tStorm, tStorm + 3, t) * (1 - smoothstep(tChord - 1, tChord + 2, t)) * (1 - 0.75 * brk(t));
    const [cx, cy] = lazy(t);
    rain.set((i) => {
      if (hash1(i * 3) > rr) return null;
      const sp = 26 + 10 * hash1(i);
      const ph = (hash1(i * 5) * 40 + t * sp) % 40;
      return { x: cx - 25 + 50 * hash1(i * 7) + ph * 0.45, y: cy + 22 - ph, z: -2 + 6 * hash1(i * 11), ang: -1.15, len: 1.2 + 1.2 * hash1(i * 13), w: 0.045 };
    });
    // ritari: profiilissa tablon alkuun asti, sitten selkäkuva huipulla
    const tab = t >= tTab;
    L.P.root.visible = !tab;
    L.place(t, leaderState, windAt, { capeWind: 0.6 + st, width: 0.95, dt: 0.04, windScale: 0.3, noBanner: tab, noLance: tab });
    { const hf = K.fx && K.fx.heroFade ? K.fx.heroFade(t) : 0;   // hahmo haalistuu rasterina friisin vedoiksi (kohtaukset 15-16)
      for (const m of L.mats) if (m.uniforms && m.uniforms.uAppear) m.uniforms.uAppear.value = 1 - hf;
      if (hf > 0.97) { L.P.root.visible = false; L.banner.visible = false; } else L.P.root.visible = true;
      if (hf > 0.5) L.lance.visible = false; }
    back.root.visible = tab;
    back.root.position.set(SUMX - 0.3, SUMY, 0.35);
    back.M.cape.uniforms.uTime.value = t;
    back.M.cape.uniforms.uAmp.value = 0.15 + 0.2 * S.loud(t);
    backFlag.material.uniforms.uTime.value = t;
    // 1.17: keihäs nousee ja iskee kiveen (held_dom7_sointu -> held_dom7), sädekehä leimahtaa iskussa
    const plantU = ease(smoothstep(tStrike - 0.5, tStrike, t));
    const liftU = ease(smoothstep(tTab, tTab + 1.6, t)) * (1 - plantU);
    back.hold(0.5 + 0.9 * liftU, -0.05);   // keihäs seuraa kättä
    // toverit keihäineen: marssi, tasanko (kellot), portaat, kiipeäminen, huipun olkapäät
    mates.forEach((m) => {
      m.L.place(t, (tt) => mateState(m.i, tt), windAt, { capeWind: 0.4 + st, width: 0.7 * bannerOpen(m.i, t), dt: 0.04, rigid: true });
    });
    // yksi leveä veto rivin yllä (1.11); veto kuivuu hitaammin kuin laaksossa
    band.set(t, bandTip, windAt, tReun - 0.3, mix(1.1, 0.3, smoothstep(tSteps - 0.5, tSteps + 1.2, t)));   // veto kuivuu pois ennen viirien portaita
    // 1.10 vedot kokoontuvat ritariksi (heroFade nostaa rasterihahmon samalla)
    gather.forEach((g, k) => {
      const gu = ease(smoothstep(tT61 + 0.8 + 0.35 * k, tT61 + 7 + 0.35 * k, t));
      const hx0 = march(t), hy = 1.3 + 0.3 * k - 0.15 * k * k * 0.3;
      g.visible = gu > 0.001 && gu < 0.985;
      if (!g.visible) return;
      const ox = -(12 + 2.2 * k) * (1 - gu), oy = (2.2 + 1.6 * Math.sin(k * 1.9)) * (1 - gu) + 1.2 * k * 0.1;
      g.position.set(hx0 + ox, hy + oy, 0.6);
      g.rotation.z = Math.atan2(-oy, -ox) * 0.6;
      g.scale.set(0.6 + 0.6 * (1 - gu), 1, 1);
    });
    // 1.13 sädekehän luonnos myrskyvuoren yllä
    const sk = smoothstep(tFar + 0.3 * (tFall - tFar), tFall - 1, t) * (1 - smoothstep(tFall + 0.5, tStorm, t));
    sketchRays.forEach((r) => { r.g.visible = sk > 0.02; r.m.uniforms.uAppear.value = sk; });
    // ei koko kuvan efektejä: iskut ovat salamoiden, viirin ja ritarin tekoja
    const dim = 0.32 * st * (1 - 0.8 * gap);
    return { dim };
  }
  // opastarkistus: salamat, sädekehä, sade ja tuuli, katko
  const probe = (t) => ({
    salamat: bolts.filter((b) => b.m.visible).length,
    sadekeha: SKY.u.uRays.value,
    sade: smoothstep(tStorm, tStorm + 3, t) * (1 - smoothstep(tChord - 1, tChord + 2, t)) * (1 - 0.75 * brk(t)),
    katko: brk(t),
    napsahdus: hits.reduce((m, h) => Math.max(m, S.pulse(t, h, 0.3)), 0),
    tuuli: null,   // myrskyn tuuli ja sade eivät ole viuluelementti
    torvi: Math.max(horns(t), raise(t, 3)) * (t < tStorm ? 1 : 0),
    pollahdys: waves.filter((w) => w.visible).length + bolts.filter((b) => b.m.visible).length,
    vareet: waves.filter((w) => w.visible).length,
  });
  const grip = () => (back.root.visible ? [backGrip(back, GRIP_BELOW, 3.8)] : []);
  return { scene, update, shots, probe, grip };
}
