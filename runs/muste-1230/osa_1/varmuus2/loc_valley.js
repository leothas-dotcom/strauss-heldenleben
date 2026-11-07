// B, aamunkoiton laakso: kuvakäsikirjoituksen otot 1–6 (ankkurit held_alku ... held_lyyrinen).
// Ohjaus (docs/ohjaus.md, näytös 1, otot 1.1–1.4; osa 1, 31.10.2026):
//   1.1 held_alku: herää ja nousee selkäkuvassa (1/2) laakson pohjalta; keihäs nousee sävelen mukana ja
//       kärki jättää teemaviivan vedon. Sointuiskut T. 6, 8 ja 11: toverien viirinkärjet harjanteen takaa.
//   1.2 held_viulut: kääntyy profiiliin (asentokirjasto kaantyminen_profiiliin) ja kävelee (kavely)
//       harjannetta pitkin kohti aurinkoa; keihäs pitää sävelen; viulut sytyttävät tuulen.
//   1.3 held_vasket_t13: pysähtyy ja nostaa keihään molemmin käsin (keihaan_nosto_molemmin), kun aurinko
//       nousee harjanteen takaa; patarummut pöllähdyttävät harjanteen reunan.
//   1.4 held_intro_loppuu: kääntyy tovereihin, jotka nousevat riviin, ja nostaa kellon (kellon_nosto);
//       held_viulut_paluu: puuska nostaa viirit.

import * as THREE from 'three';
import { C, ink, flat, group, poly, ridgeGeo, skylineGeo, rect, cloud, sky as makeSky, streaks, strokeGeo, waveMat, pennantGeo, circle, clamp, smoothstep, mix, hash1, vnoise1 } from './paper.js';
import { knightBack, KP, kmix, POSES, backGrip } from './puppets.js';
import { leader, camPath, ease, GRIP_BELOW } from './hero.js';
import { tipTrail, heroGate } from './brush.js';

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
  const BX = -7;   // selkäkuvan paikka harjanteella; profiilissa ritari kävelee tästä rivin keskelle (x 0,5)
  const back = knightBack(scene);
  const BL_LEN = 4.4;   // pitkä keihäs: kärjen rata kattaa kuvan korkeuden, ritari pysyy pienenä (kärki kämmenestä)
  const backLance = back.lance;   // ryhmä on oikean käden kämmenessä (puppets.js knightBack.hold)
  flat(backLance, rect(0.05, BL_LEN + GRIP_BELOW, 0.5, 0), ink(C.black), { y: -GRIP_BELOW });
  const backFlag = flat(backLance, pennantGeo(1.3, 0.5), waveMat(C.red, { amp: 0.2, k: 5 }), { y: 4.3, z: 0.01 });
  backFlag.scale.x = -1;   // yksi tuuli (-x)
  // pieni viiri; veto on sivellinjälki, ei toinen lippu
  // välähdys kellossa (viulujen ensimmäinen säde)
  const glint = group(scene, { z: 0.6 });
  const glintMat = ink(C.paper, {});
  flat(glint, poly([[0, 0.9], [0.12, 0.12], [0.9, 0], [0.12, -0.12], [0, -0.9], [-0.12, -0.12], [-0.9, 0], [-0.12, 0.12]]), glintMat, {});

  // --- toverit: 7 torviritaria keihäineen harjanteen alla ---
  // Toverit pitävät keihäästään (kämmen varrella, hero.js): iskuissa ja vaskien tullessa harjanteen
  // yli nousee vain keihään kärki ja viiri (ritari pysyy harjanteen takana), tahdissa 17 ritarit nousevat.
  const XS = [-9.6, -7.0, -4.3, 3.7, 6.3, 8.9, 11.5];
  const XSB = XS.map((x) => x * 0.42);   // piilossa ryhmässä kuva-alalla, riviin ennen nousua
  const mates = XS.map((x, i) => ({
    L: leader(scene, { raster: [0, 0.15, 0.3, 0.1, 0.25, 0.05, 0.2][i], coilRaster: 0.15 * (i % 2), lance: 3.8, nb: 20, bannerColor: i % 2 ? C.paper : C.red }),
    x, z: -0.35 - 0.04 * i,
  }));
  const wind = streaks(scene, 170, ink(C.paper, {}), 1.2);
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
  // Sävelkorkeus teemaviivasta (analysis/teemaviiva.py), muuten S.melody. 0 = Es2 (midi 39), 1 = kolme oktaavia ylempänä.
  // Keihäs nousee sen mukana: kärjen korkeus on sävel, ja kärjen jättämä veto on teemaviiva maailmassa.
  const TL = K.TL;
  const midiAt = (t) => { const m = TL && TL.midi(t); return m !== null && m !== undefined && TL && t < TL.t1 ? m : S.melody(t); };
  const pitchU = (t) => { let a = 0; for (let q = -2; q <= 2; q++) a += clamp((midiAt(t + q * 0.03) - 39) / 36, 0, 1.05); return a / 5; };
  // Kärjen korkeus mukailee melodiaa tasoitetusti: fraasin mittainen kolmiosuodin (±0,8 s, mediaani poistaa yksittäiset ylikuoret), joten iso kaari näkyy mutta nuotit eivät nyki
  const midiN = (t) => clamp((midiAt(t) - 39) / 36, 0, 1.05);
  // esilaskettu taulukko (0,02 s ruudukko): mediaani (±0,1 s) ja gaussinen tasoitus (sigma 0,35 s) -> sileä kaari
  const MG0 = T0 - 2, MDT = 0.02, MN = Math.ceil((tBrass + 3 - MG0) / MDT);
  const raw = Array.from({ length: MN }, (_, i) => { const t1 = MG0 + i * MDT; return [midiN(t1 - 0.1), midiN(t1), midiN(t1 + 0.1)].sort((x, y) => x - y)[1]; });
  const kern = Array.from({ length: 71 }, (_, j) => Math.exp(-0.5 * ((j - 35) * MDT / 0.35) ** 2));
  const smooth = raw.map((_, i) => { let a = 0, w = 0; for (let j = 0; j < 71; j++) { const k = i + j - 35; if (k < 0 || k >= MN) continue; a += kern[j] * raw[k]; w += kern[j]; } return a / w; });
  const mel = (t) => { const f = clamp((t - MG0) / MDT, 0, MN - 1.001), i = Math.floor(f); return smooth[i] + (smooth[i + 1] - smooth[i]) * (f - i); };
  const horns = (t) => smoothstep(0.3, 0.8, S.energy.horns(t));
  // viulut soivat: kohotahdista tahdin 17 taukoon ja taas tahdista 20 (partituuri, ankkurit)
  const violinsOn = (t) => (t >= tViol - 0.1 && t < tHeroes) || t >= tGust - 0.1;
  const violins = (t) => (violinsOn(t) ? Math.max(0.45, S.energy.violins(t)) : 0) * smoothstep(tViol - 0.1, tViol + 0.8, t);
  // toverien sointuiskut (T. 6, 8, 11: kahdeksan käyrätorvea, fagotit, kontrabassot f): keihäät
  // ponnahtavat harjanteen yli iskun ruudulla ja painuvat hitaasti takaisin. Partituurin iskuilla ei
  // ole mitattua z:aa, joten ne ovat täysikokoisia (koko kirjoitetusta f:stä).
  const hitAmp = (t) => tHits.reduce((m, h) => Math.max(m, S.pulse(t, h.t, 0.85) * (h.z == null ? 1 : clamp((h.z - 2.5) / 3.5, 0.4, 1))), 0);
  // patarummun lyönnit vaskien tulosta alkaen
  const drum = S.strokesIn(tBrass - 0.2, tEnd);
  const low = S.accIn(tBrass, tHeroes, 5).filter((x) => x.kaistat_z.matala > 6);
  // trumpettien toistuvat soinnut tahdeista 17-19: nuotinalut
  const tptOns = S.onsetsIn(tHeroes, tGust);
  const tptFlick = (t) => tptOns.reduce((s, o) => s + S.pulse(t, o, 0.15), 0);

  // --- sankarin teot (asentokirjasto puppets.js POSES), ajat ankkureista ---
  const tTurn = tViol;                     // 1.2 kääntyy profiiliin
  const tWalk0 = tViol + 1.0, tWalk1 = tBrass - 0.4;   // kävely harjannetta pitkin
  const walkU = (t) => ease(smoothstep(tWalk0, tWalk1, t));
  const heroX = (t) => mix(BX, 0.5, walkU(t));
  const pitchArm = (t) => { const u = mel(t); return { aN: 1.45 + 1.3 * u, eN: 0.55 - 0.3 * u, lanceAng: 0.55 - 0.75 * u }; };
  const turnBack = (t) => smoothstep(tHeroes - 0.9, tHeroes + 0.3, t);   // 1.4 kääntyy tovereihin (syrjän kautta)
  function leaderState(t) {
    let pose, facing = 1;
    if (t < tBrass - 0.4) {
      // 1.2: syrjästä profiiliin ja kävelemään; keihäskäsi pitää sävelen koko ajan
      const turn = POSES.kaantyminen_profiiliin(smoothstep(tTurn, tTurn + 1.2, t));
      const walk = POSES.kavely((t - tWalk0) / 0.9);
      const w = smoothstep(tWalk0 - 0.3, tWalk0 + 0.3, t) * (1 - smoothstep(tWalk1 - 0.5, tWalk1, t));
      pose = { ...kmix(turn, walk, w), ...pitchArm(t), sx: turn.sx };
    } else if (t < tHeroes - 0.9) {
      // 1.3: pysähtyy ja nostaa keihään molemmin käsin auringolle (fraasin mittainen nosto)
      const r = ease(smoothstep(tBrass - 0.4, tBrass + 2.4, t));
      pose = kmix({ ...KP.stand, ...pitchArm(tBrass - 0.4) }, KP.lanceBoth, r);
    } else {
      // 1.4: kääntyy tovereihin ja nostaa kellon
      const tb = turnBack(t);
      facing = tb < 0.5 ? 1 : -1;
      const down = ease(smoothstep(tHeroes - 1.6, tHeroes - 0.7, t));
      const base = kmix(KP.lanceBoth, KP.proud, down);
      pose = { ...kmix(base, KP.call, horns(t) * smoothstep(tHeroes - 0.2, tHeroes + 1.2, t)), sx: 0.12 + 0.88 * Math.abs(1 - 2 * tb) };
    }
    return { x: heroX(t), y: 0, z: -0.3, facing, pose: { ...pose, cape: violins(t) } };
  }
  const windAt = (t) => ({ x: -(0.5 + 2.6 * violins(t) + 0.8 * S.loud(t)), y: 0.2 + 2.4 * violins(t) });

  // --- otot ---
  const backEnd = tViol;                // selkäkuva teeman ajan; viuluissa kääntyy profiiliin (1.2)
  const shots = [
    // 1-4 yksi jatkuva nosturiajo: selkäkuvasta laakson pohjalta auringonnousun laajaan kuvaan.
    // Veto (kameraan kiinnitetty, etualalla) jatkuu piirtyen koko ajan.
    // Stillisääntö: avauksessa ritari pieni selkäkuva alhaalla, veto kuvan ainoa pääosa, taivas tyhjä;
    // kamera nousee vedon mukana (1.1), jatkaa profiilikävelyn (1.2) yli ja laajenee auringonnousuun (1.3).
    { name: '1.1-1.3 nosturi: selkäkuva -> auringonnousu', a: T0, b: tHeroes,
      cam: camPath([{ pos: [BX + 1.0, 1.0, 21], look: [BX + 2.0, 7.0, -120], fov: 50 }, { pos: [BX + 1.2, 2.6, 20], look: [BX + 3.5, 8.5, -140], fov: 50 },
        { pos: [0.4, 3.4, 17], look: [2.5, 6.5, -90], fov: 46 }, { pos: [2, 6.5, 32], look: [2, 4.8, -30], fov: 42 }], (u) => 0.2 * clamp(u) + 0.8 * (1 - (1 - clamp(u)) ** 4)) },
    { name: '5 matala edestä: kahdeksan nousee', a: tHeroes, b: tHeroes + 3.4,
      cam: camPath([{ pos: [1, -0.6, 23], look: [1, 2.4, 0], fov: 42 }, { pos: [1, -0.2, 20.5], look: [1, 2.6, 0], fov: 42 }]) },
    { name: '5 sivuajo rivin ohi', a: tHeroes + 3.4, b: tGust,
      cam: camPath([{ pos: [-10, 1.2, 12.5], look: [-7, 3.2, 0], fov: 42 }, { pos: [3, 1.4, 12.5], look: [5, 3.3, 0], fov: 42 }]) },
    { name: '6 lähikuva: puuska nostaa viirit', a: tGust, b: tEnd + 1.5,
      cam: camPath([{ pos: [2.4, 2.6, 6.8], look: [0.2, 3.0, 0], fov: 40 }, { pos: [1.8, 3.0, 6.0], look: [0.2, 3.4, 0], fov: 40 }]) },
  ];

  // --- käyrätorviteema keihään kärjen jättämänä vetona maailmassa (brush.js tipTrail) ---
  // Selkäkuvan keihäs nousee sävelen mukana (backLance), ja kärki jättää punaisen vedon, joka ajelehtii
  // tuulessa ja kuivuu. Profiilissa (tHeroes alkaen) veto jatkuu johtajan keihään kärjestä.
  // Muste säästeliäästi (tuotantojako.md): laaksossa YKSI veto held_alku -> held_viulut, haalistuen
  // held_vasket_t13:een. Veto on sivellinjälki, ei toinen lippu: kärjen kohdalta ohut (press kasvaa iän
  // myötä), leveys paineesta (voimakkuus); portti sulkeutuu viulujen tultua ja muste vanhenee nopeammin (k).
  let curT = 0;
  const trail = tipTrail(scene, S, {
    seed: 11, N: 320, wmax: 0.24, wmin: 0.02, hairW: 0.04, drift: 1.0,
    press: (tt) => clamp(0.3 + 0.7 * S.loud(tt)) * smoothstep(0.05, 1.1, curT - tt),
    gate: (tt) => heroGate(S, tt) * (1 - smoothstep(tViol, tBrass - 1.5, tt)),
  });
  const trailK = (t) => mix(1, 0.45, smoothstep(tViol, tBrass, t));
  // ritari on jo nousemassa harjanteen takaa musiikin alkaessa (ei jähmettymää 7,8 s): liike käynnissä T0:ssa
  const backRise = (tt) => ease(smoothstep(T0 - 2.5, T0 + 3.5, tt));
  const backLanceRot = (tt) => mix(1.45, -0.05, mel(tt)) + 0.03 * Math.sin(tt);   // Es2 lähes vaakaan, kolme oktaavia ylempänä pystyyn
  const backArm = (tt) => 0.25 + 1.0 * mel(tt);
  const backY = (tt) => -2.4 * (1 - backRise(tt));
  const backSx = (tt) => Math.max(0.12, 1 - 0.88 * smoothstep(tViol - 0.6, tViol, tt));   // kääntyy syrjäksi ennen profiilia
  // Veto alkaa keihään kärjestä joka ruudussa: selkäkuvassa kärki lasketaan kämmenestä (hold) samoilla
  // kaavoilla kuin näkymäpuun keihäs, profiilissa johtajan frame (hero.js tipAt).
  function tipAt(tt) {
    if (tt < T0 - 0.3) return null;
    if (tt < backEnd) {
      const r = backLanceRot(tt), a = backArm(tt);
      const hx = 0.33 + 0.66 * Math.sin(a), hy = 1.72 - 0.66 * Math.cos(a);
      // viirin häntä: kiinnityskohta keihäässä (0; 4,3) kierrettynä kulmaan r, häntä tuulessa 1,3 vasemmalle (viiri ei kierry)
      const ax = -4.3 * Math.sin(r), ay = 4.3 * Math.cos(r);
      return { x: BX + backSx(tt) * (hx + ax - 1.3), y: backY(tt) + hy + ay, z: -0.3 + 0.08 };
    }
    if (tt >= tBrass) return null;   // vaskista alkaen viiri on viiri, ei sivellin
    return L.tailAt(tt);
  }

  // toverin tila (puhdas ajan funktio): harjanteen takana piilossa, iskuissa ja vaskissa keihäs nousee, tahdissa 17 koko ritari
  const peekHide = -4.2, peekUp = -1.25;   // peekUp: kypärä ja kello harjanteen yläpuolella
  function mateState(i, tt) {
    const M = mates[i];
    const hp = tt < tHeroes ? clamp(hitAmp(tt)) : 0;
    const r3 = ease(smoothstep(tBrass + i * 0.25, tBrass + 3.0 + i * 0.25, tt));
    const r2 = ease(smoothstep(tHeroes - S.LEAD + i * 0.05, tHeroes + 1.0 + i * 0.07, tt));
    const flick = tt >= tHeroes && tt < tGust ? 0.12 * tptFlick(tt) : 0;
    const yPeek = mix(peekHide, peekUp, Math.max(ease(hp), r3));
    const y = mix(yPeek, 0, r2) + flick * (1 - r2);
    const x = mix(XSB[i], M.x, smoothstep(tHeroes - 1.6, tHeroes - 0.6, tt));
    const h = tt >= tHeroes ? horns(tt - 0.04 * i) : clamp(hp);
    const pose = kmix(kmix(KP.proud, KP.stand, 0.3 * (i % 2)), KP.call, h);
    return { x, y, z: M.z, facing: 1, lanceAng: 0.03 * Math.sin(tt * 0.9 + i), pose: { ...pose, tilt: pose.tilt + 0.05 * Math.sin(tt * 1.1 + i) }, r2, r3, hp };
  }

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
    u.uSun.value.set(60, sunY, 34, t > T0 - 1 ? 1 : 0);   // aurinko iso, ritari pieni (1.3)
    u.uRays.value = 0;
    rimMat.uniforms.uColor.value.copy(t > tBrass ? C.red : C.paper);

    // ritari: selkäkuva oton 1 ajan
    const backView = t < backEnd;
    L.P.root.visible = !backView;
    L.place(t, leaderState, windAt, { noBanner: backView, noLance: backView, capeWind: violins(t) });
    back.root.visible = backView;
    back.root.position.set(BX, backY(t), -0.3);
    back.root.scale.x = backSx(t);
    back.M.cape.uniforms.uTime.value = t;
    back.M.cape.uniforms.uAmp.value = 0.1 + 0.2 * S.loud(t);
    backFlag.material.uniforms.uTime.value = t;
    backFlag.visible = true;
    // keihäs nousee melodian mukana (laulu): kärki on sävel, ja veto syntyy kärjestä
    back.hold(backArm(t), backLanceRot(t));
    backFlag.rotation.z = -backLanceRot(t);   // viiri roikkuu tuulessa vaakaan, ei kierry keihään mukana
    curT = t;
    trail.set(t, tipAt, windAt, T0 - 0.3, trailK(t));
    // kellon välähdys kohotahdissa
    const g = S.pulse(t, tViol, 0.5);
    glint.visible = g > 0.02 && !backView;
    if (glint.visible) {
      glint.position.set(heroX(t) + 0.25, 3.55, 0.6);
      glint.scale.setScalar(0.25 + 1.1 * g);
      glint.rotation.z = 0.6 * (t - tViol);
    }

    // toverit keihäineen: piilossa harjanteen takana; iskuissa ja vaskissa keihäs ja viiri nousevat, tahdissa 17 ritarit
    mates.forEach((M, i) => {
      M.L.place(t, (tt) => mateState(i, tt), windAt, { capeWind: violins(t), width: 0.7, rigid: true });
      const stt = mateState(i, t);
      M.L.P.root.visible = stt.r2 > 0.03 || stt.hp > 0.02 || stt.r3 > 0.001;   // keihäs ja viiri näkyvät harjanteen yli, ritarin harjanteen takana peittää kallio
    });
    const gust = S.pulse(t, tGust, 1.1);

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
  // opastarkistus: paikan omat elementit (viirinkärjet iskuissa, kellon välähdys, aurinko, viirit, tuuli, pöllähdykset)
  // veto alkaa kärjestä: vedon uusin piste (trail.last) ja keihään kärki näkymäpuusta (selkäkuvan tai johtajan keihäs)
  function tipGap() {
    const k = trail.last;
    if (!trail.mesh.visible || k.tipX === null || k.ink < 0.05) return null;   // vain kun vedon uusin pää on musteella (portti auki)
    scene.updateMatrixWorld(true);
    // viirin vapaa pää näkymäpuusta: selkäkuvassa viirin häntä, profiilissa viirinauhan viimeinen kärkipari
    let v;
    if (back.root.visible) v = backFlag.localToWorld(new THREE.Vector3(1.3, 0, 0));
    else { const g = L.banner.geometry.getAttribute('position'), n = g.count / 2 - 1; v = { x: (g.getX(2 * n) + g.getX(2 * n + 1)) / 2, y: (g.getY(2 * n) + g.getY(2 * n + 1)) / 2 }; }
    return Math.hypot(v.x - k.tipX, v.y - k.tipY);
  }
  const probe = (t) => ({
    karki_ero: tipGap(),
    midi_raaka: midiN(t), mel_t: mel(t),
    viirinkarjet: mates.filter((M, i) => t < tHeroes && mateState(i, t).hp > 0.02).length,
    viirinkarjet_y: mates.reduce((m, M, i) => Math.max(m, t < tHeroes && mateState(i, t).hp > 0.02 ? mateState(i, t).y : -9), -9),
    viirit_n: mates.filter((M, i) => mateState(i, t).r3 > 0.001).length,
    valahdys: glint.visible ? glint.scale.x : 0,
    aurinko_y: SKY.u.uSun.value.y,
    viirit_amp: mates.some((M, i) => mateState(i, t).r3 > 0.001) ? 0.06 + 0.25 * smoothstep(0.15, 0.7, S.energy.brass(t)) + 0.4 * S.pulse(t, tGust, 1.1) : 0,
    tuuli: violins(t),
    pollahdys: puffs.filter((g) => g.visible).length,
    rivi_y: mates.reduce((m, M, i) => m + mateState(i, t).y, 0) / mates.length,
    nuket_rivissa: mates.filter((M) => M.L.P.root.visible).length,
    selka_y: back.root.visible ? back.root.position.y : null,
    aurinko: SKY.u.uSun.value.y,
    maa: S.energy.lows(t),
    ritari_x: heroX(t),
    selkakuva_y: backY(t),
    torvi: Math.max(t < tBrass ? heroGate(S, t) : 0, t >= tHeroes ? horns(t) : 0),
    keihas_molemmin: t >= tBrass - 0.4 && t < tHeroes - 0.9 ? ease(smoothstep(tBrass - 0.4, tBrass + 2.4, t)) : 0,
  });
  const grip = () => (back.root.visible ? [backGrip(back, GRIP_BELOW, BL_LEN)] : []);
  return { scene, update, shots, probe, grip };
}
