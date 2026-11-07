// H, suo hämärässä ja yössä: kuvakäsikirjoituksen otot 26–32 (ankkurit wid_1_huilu ... wid_sankari_nousee).
//   26 Ritari istuu harppupuun (Guntram) juurella; hyttynen (huilu) pistää.
//   27 Olennot yksi kerrallaan omilla ankkureillaan, eleet oman soittimensa nuotinalkujen tahdissa:
//      sorsa (oboe), Quijote-nukke ja roiske (englannintorvi, lautaset), rupikonnat kvintin päässä
//      (Dehring), sirkat (oboe ja Es-klarinetti), Quijote matkii ja kaksi sammakkoa (englannintorvi,
//      fagotit), kolme varista (sordinoidut pasuunat), kuoro: usva sakenee.
//   28 Sankariteema mollissa: ritari ja viiri painuvat tummiksi, olennot vaikenevat.
//   29 Yö: kuu, lammen muisto (aamun kahdeksan ritaria) vahvistuu jousten aalloissa.
//   30 Olennot palaavat (H19), piiritys.  31 H20: toverien siluetit harjanteelle, roiske.
//   32 Ritari nousee, viiri leimahtaa.

import * as THREE from 'three';
import { C, ink, flat, group, poly, rect, circle, deadTree, skylineGeo, strokeGeo, water, sky as makeSky, clamp, smoothstep, mix, hash1, vnoise1 } from './paper.js';
import { knight, horse, poseKnight, poseHorse, KP, kmix, mosquito, duck, toad, cricket, crow, frog } from './puppets.js';
import { leader, camPath, ease } from './hero.js';

export function build(K) {
  const { S } = K;
  const A = K.a;
  const at = (id) => S.A(id);
  const tMos = at('wid_1_huilu').t, tDuck = at('wid_2_oboe').t, tQ = at('wid_3_4').t, tToad = at('wid_dehring1').t;
  const tToadEnd = at('wid_dehring1').t1, tCrick = at('wid_6').t, tMock = at('wid_7_8').t, tCrow = at('wid_9_pasuunat').t;
  const tCrowEnd = at('wid_9_pasuunat').t1, tChor = at('wid_kuoro').t, tAns = at('wid_sankari_molli').t, tR16 = at('wid_reh16').t;
  const tNight = at('wid_reh17').t, tRet = at('wid_uusi_hyokkays').t, tR20 = at('wid_reh20').t, tSplash2 = at('wid_reh20_lautaset').t;
  const tSnap = at('wid_sankari_nousee').t, END = S.T_END;
  const scene = new THREE.Scene();
  const SKY = makeSky(scene);
  // --- maisema ---
  const horizonPts = [];
  for (let i = 0; i <= 300; i++) { const x = -300 + i * 2; horizonPts.push([x, 1.5 + 1.2 * Math.pow(vnoise1(x * 0.7, 3), 3) + 0.6 * vnoise1(x / 9, 4)]); }
  flat(scene, skylineGeo(horizonPts, -80), ink(C.black, { shade: C.blue, raster: 0.25 }), { z: -120 });
  for (let k = 0; k < 12; k++) flat(scene, deadTree(k * 7 + 3, 2.2 + hash1(k) * 1.4), ink(C.black, { shade: C.blue, raster: 0.4 }), { x: -40 + k * 7.5 + 3 * hash1(k + 1), y: -1, z: -26 - 10 * hash1(k + 2) });
  const PZ = -4;
  const pond = water(scene, 90, 14, { x: 8, y: -6.75, z: PZ, base: C.blue, deep: C.black, glint: 0.55 });
  flat(scene, poly([[-60, 0.25], [60, 0.25], [60, 0.9], [20, 0.75], [8, 0.95], [-4, 0.7], [-60, 0.85]]), ink(C.black, { shade: C.blue, raster: 0.2 }), { z: PZ - 0.2 });
  flat(scene, poly([[-60, -14], [-60, 0], [-2.0, 0.05], [-0.6, -0.8], [0.6, -3.4], [2.5, -4.6], [60, -4.6], [60, -14]]), ink(C.black), { z: 0 });
  flat(scene, poly([[10.2, -4.6], [11, -0.2], [12.5, 0.15], [17, 0.1], [18, -4.6]]), ink(C.black), { z: 0.05 });
  // rupikonnien kivet (painuvat yöksi pois muiston tieltä)
  const stoneMats = [ink(C.black, { shade: C.blue, raster: 0.3 }), ink(C.black, { shade: C.blue, raster: 0.3 })];
  flat(scene, circle(0.8, 20, 0, 0, 0.45), stoneMats[0], { x: 5.4, y: -1.55, z: PZ + 0.05 });
  flat(scene, poly([[-0.8, -0.5], [-0.6, 0.5], [0.55, 0.55], [0.8, -0.5]]), stoneMats[1], { x: 7.6, y: -1.05, z: PZ + 0.05 });
  const reedMat = ink(C.black);
  const reed = (x, y0, h, lean, z) => flat(scene, poly([[x - 0.05, y0], [x + 0.05, y0], [x + lean + 0.01, y0 + h], [x + lean - 0.01, y0 + h]]), reedMat, { z });
  for (let k = 0; k < 30; k++) reed(10.8 + k * 0.2 + 0.1 * hash1(k), 0, 1.6 + 1.8 * hash1(k + 1), 0.4 * (hash1(k + 2) - 0.5), 0.04);
  for (let k = 0; k < 50; k++) reed(-2 + k * 0.5 + 0.3 * hash1(k + 9), -4.6, 1.2 + 1.6 * hash1(k + 3), 0.5 * (hash1(k + 4) - 0.5), 0.1);
  // Guntramin harppupuu
  const tree = group(scene, { x: -6.5, y: 0, z: -0.6 });
  const trunkPts = []; for (let i = 0; i <= 20; i++) { const u = i / 20; trunkPts.push([-0.6 * Math.sin(u * 2.4) + 0.3 * u, u * 6.4]); }
  flat(tree, strokeGeo(trunkPts, (u) => 0.55 - 0.3 * u), ink(C.black), {});
  const neckPts = []; for (let i = 0; i <= 24; i++) { const u = i / 24; neckPts.push([-0.4 + 4.8 * u, 6.3 + 0.9 * Math.sin(u * Math.PI) - 1.6 * u + 0.4 * Math.sin(u * Math.PI * 2)]); }
  flat(tree, strokeGeo(neckPts, (u) => 0.32 - 0.18 * u), ink(C.black), {});
  for (const s of deadTree(77, 0.9)) flat(tree, s, ink(C.black), { x: -0.3, y: 6.2, z: -0.01 });
  const strings = [];
  for (let k = 0; k < 10; k++) {
    const u = 0.12 + k * 0.08;
    const top = neckPts[Math.round(u * 24)];
    const g = group(tree, { x: top[0], y: top[1], z: 0.01 });
    flat(g, rect(0.022, 1.2 + 0.5 * hash1(k), 0.5, 1), ink(C.paper, { shade: C.blue, raster: 0.45 }), {});
    strings.push({ g, k });
  }
  // muisto lammessa: aamun kahdeksan ritaria harjanteella (peilikuvana)
  const mem = group(scene, { x: 6.5, y: -0.6, z: PZ + 0.02 });
  mem.scale.set(0.42, -0.42, 1);
  const memMat = ink(C.paper, { shade: C.red, raster: 0.45 });
  const memRed = ink(C.red, { shade: C.paper, raster: 0.3 });
  flat(mem, poly([[-9, 0], [-6, 1.5], [-2, 3.2], [0, 3.6], [2, 3.2], [6, 1.5], [9, 0]]), memMat, {});
  for (let k = 0; k < 8; k++) {
    const x = -3.2 + k * 0.9, y = 3.4 - Math.abs(x) * 0.3;
    flat(mem, poly([[x - 0.18, y], [x + 0.18, y], [x + 0.22, y + 0.9], [x - 0.22, y + 0.9]]), memRed, { z: 0.01 });
    flat(mem, poly([[x - 0.06, y + 0.9], [x + 0.06, y + 0.9], [x + 0.25, y + 1.35], [x - 0.25, y + 1.35]]), memRed, { z: 0.01 });
  }
  const memMats = [memMat, memRed];

  // --- ritari ja toverit ---
  const L = leader(scene, {});
  const HX = -4.3;
  const ridgeMates = Array.from({ length: 7 }, (_, i) => ({ P: knight(scene, { raster: 0.15 }), x: -1.5 + i * 2.3 }));

  // --- olennot: ankkuri + oman ikkunan nuotinalut ---
  const ons = (a, b, pred) => S.onsetsIn(a, b, pred).map((t, j) => ({ t, j }));
  const hi = (t) => S.reg(t) > 0.6;
  const mkc = (t0, list, build2, n = 1) => ({ t0, ons: list, parts: Array.from({ length: n }, () => build2(scene)) });
  const CR = {
    mosq: mkc(tMos, ons(tMos - 0.05, tDuck + 4, hi), mosquito),
    duck: mkc(tDuck, ons(tDuck - 0.05, tQ), duck),
    quix: mkc(tQ, [...ons(tQ - 0.05, tToad).slice(0, 8), ...ons(tMock - 0.05, tCrow).slice(0, 6)], (sc) => ({ H: horse(sc, { thin: true, color: C.black, mane: C.black }), P: knight(sc, { thin: true, body: C.black, limb: C.black, line: C.black, cape: C.black }) })),
    toads: mkc(tToad, [...ons(tToad - 0.05, tToadEnd), ...ons(tCrow, tCrowEnd).filter((o, i) => i % 2 === 0), ...ons(tRet + 4, tR20)], toad, 2),
    crick: mkc(tCrick, ons(tCrick - 0.05, tMock), cricket, 2),
    frogs: mkc(tMock, ons(tMock - 0.05, tCrow), frog, 2),
    crows: mkc(tCrow, ons(tCrow - 0.05, tCrowEnd).filter((o, i) => i % 2 === 0), crow, 3),
  };
  CR.quix.parts[0].P.mounted = true;
  const ladder = Array.from({ length: 8 }, (_, k) => flat(scene, rect(1.0, 0.08), ink(C.paper, { shade: C.black, raster: 0.4 }), { x: 10.6, y: 0.3 + 0.4 * k, z: 0.12 }));
  const splash = flat(scene, poly([[-1.2, 0], [-0.9, 1.3], [-0.5, 0.4], [-0.2, 1.8], [0.1, 0.5], [0.5, 1.5], [0.8, 0.3], [1.2, 1.0], [1.2, 0]]), ink(C.paper), { x: 2.0, y: -1.5, z: PZ + 0.15 });
  const splashT = [tQ, tSplash2];
  const gest = (c, t) => {
    let last = null;
    for (const o of c.ons) { if (o.t - S.LEAD <= t) last = o; else break; }
    if (!last) return { g: 0, j: 0, age: 99 };
    const age = t - (last.t - S.LEAD);
    return { g: age < 0.06 ? age / 0.06 : Math.exp(-(age - 0.06) / 0.25), j: last.j, age, t: last.t };
  };
  // läsnä ankkurista alkaen; sankariteeman molli vaientaa (vetäytyvät), yöllä poissa, palaavat H19:ssä
  const silent = (t) => smoothstep(tAns - 0.5, tAns + 3, t) * (1 - smoothstep(tRet - 0.5, tRet + 2, t));
  // yöllä (H17) olennot ovat poissa: lampi kuuluu muistolle
  const nightAway = (t) => smoothstep(tNight, tNight + 4, t) * (1 - smoothstep(tRet - 0.5, tRet + S.LEAD, t));
  const present = (c, t) => clamp(smoothstep(c.t0 - 0.5, c.t0 + S.LEAD, t) * (1 - 0.85 * silent(t)) * (1 - nightAway(t)) * (1 - smoothstep(tSnap, tSnap + 2.5, t)));

  // --- otot ---
  const crPos = {
    mosq: () => [HX + 1.6, 2.4, 0.5], duck: () => [3.2, -1.1, PZ], quix: () => [11.8, 0.4, 0.1], toads: () => [6.5, -1.0, PZ],
    crick: () => [11.6, 0.6, 0.2], frogs: () => [2.6, -1.4, PZ], crows: () => [-4.6, 6.0, -0.5],
  };
  const wide = (u, t) => { const d = clamp((t - A) / 45); return { pos: [4.5 - 1.2 * d, 2.4 - 0.1 * d, 15 - 1.5 * d], look: [4 - 0.6 * d, 0.6, -2], fov: 44 }; };
  const heroClose = (dx = 0) => camPath([{ pos: [HX + 2.4 + dx, 1.4, 5.8], look: [HX + 0.3, 1.1, 0], fov: 40 }, { pos: [HX + 2.0 + dx, 1.5, 5.0], look: [HX + 0.3, 1.2, 0], fov: 40 }]);
  const critClose = (k) => { const [x, y, z] = crPos[k](); return camPath([{ pos: [x - 1.0, y + 0.7, z + 5.6], look: [x, y + 0.35, z], fov: 40 }, { pos: [x - 0.6, y + 0.7, z + 4.9], look: [x, y + 0.4, z], fov: 40 }]); };
  const spawnList = [
    { k: 'mosq', t: tMos, name: 'hyttynen (huilu)' }, { k: 'duck', t: tDuck, name: 'sorsa (oboe)' }, { k: 'quix', t: tQ, name: 'Quijote kiipeää, roiske' },
    { k: 'toads', t: tToad, name: 'Dehring: rupikonnat' }, { k: 'crick', t: tCrick, name: 'sirkat (oboe ja Es-klarinetti)' },
    { k: 'quix', t: tMock, name: 'Quijote matkii, sammakot (fagotit)' }, { k: 'crows', t: tCrow, name: 'varikset (sordinoidut pasuunat)' },
  ];
  const CRNAME = { mosq: 'hyttynen', duck: 'sorsa', quix: 'Quijote', toads: 'rupikonnat', crick: 'sirkat', frogs: 'sammakot', crows: 'varikset' };
  // puolikuva: olento ja ritari samassa kuvassa (kehys vaihtuu olennon mukana, laajaa ei toisteta)
  const twoShot = (k) => {
    const [x, y, z] = crPos[k]();
    const mx = (x + HX) / 2, my = (y + 1.2) / 2, d = 7 + 0.45 * Math.abs(x - HX);
    return camPath([{ pos: [mx + 0.8, my + 1.2, z / 2 + d], look: [mx, my + 0.3, z / 2], fov: 42 }, { pos: [mx + 0.3, my + 1.2, z / 2 + d - 0.6], look: [mx, my + 0.35, z / 2], fov: 42 }]);
  };
  const shots = [{ name: '26 suo hämärässä: ritari harppupuun juurella', a: A, b: tMos - S.LEAD, cam: wide }];
  {
    let a = tMos - S.LEAD;
    let fill = 0;
    const filler = (x, y, k) => {
      while (y - x > 1.2) {
        const len = Math.min(y - x, fill % 2 ? 2.2 : 3.4);
        const e = y - x - len < 1.2 ? y : x + len;
        shots.push(fill % 2 ? { name: '27 ritarin reaktio', a: x, b: e, cam: heroClose(0.4 * hash1(x)) } : { name: `27 ${CRNAME[k]} ja ritari`, a: x, b: e, cam: twoShot(k) });
        fill++;
        x = e;
      }
      return x;
    };
    for (let i = 0; i < spawnList.length; i++) {
      const sp = spawnList[i];
      const next = (spawnList[i + 1] ? spawnList[i + 1].t : tChor) - S.LEAD;
      const s0 = Math.max(a, sp.t - S.LEAD);
      if (s0 - a > 0.05) a = filler(a, s0, i ? spawnList[i - 1].k : 'mosq');
      const e = Math.min(next, s0 + 3.0);
      shots.push({ name: `27 ${sp.name}`, a: s0, b: e, cam: critClose(sp.k) });
      a = filler(e, next, sp.k);
    }
    shots.push({ name: '27 kuoro: usva sakenee', a, b: tAns - S.LEAD, cam: camPath([{ pos: [4, 3, 18], look: [3, 1.4, 0], fov: 44 }, { pos: [3.5, 3.6, 21], look: [3, 1.8, 0], fov: 44 }]) });
  }
  const nightMid = tNight + (tRet - tNight) * 0.45;
  shots.push(
    { name: '28 ritari painuu tummaksi', a: tAns - S.LEAD, b: tR16, cam: heroClose(0) },
    { name: '28 olennot vaikenevat ja kuuntelevat', a: tR16, b: tNight, cam: camPath([{ pos: [4, 3, 20], look: [3, 1.8, 0], fov: 42 }, { pos: [4, 3.4, 22], look: [3, 2.2, 0], fov: 42 }]) },
    { name: '29 yö: kuu nousee', a: tNight, b: tNight + 11, cam: camPath([{ pos: [3, 3.2, 26], look: [4, 5, 0], fov: 44 }, { pos: [4, 3.6, 24], look: [5, 5.8, 0], fov: 44 }]) },
    { name: '29 muisto lammessa', a: tNight + 11, b: nightMid, cam: camPath([{ pos: [5.2, 0.9, 8], look: [6.0, -1.5, 0], fov: 42 }, { pos: [6.2, 0.7, 7.2], look: [6.2, -1.6, 0], fov: 42 }]) },
    { name: '29 ritari kerää itsensä', a: nightMid, b: tRet - 8, cam: camPath([{ pos: [HX + 5, 2.4, 13], look: [HX + 0.5, 2.2, 0], fov: 42 }, { pos: [HX + 3, 2.3, 8.5], look: [HX + 0.3, 2.2, 0], fov: 42 }]) },
    { name: '29 harppupuu: tyyntä ennen', a: tRet - 8, b: tRet - S.LEAD, cam: camPath([{ pos: [-5.5, 3.5, 11], look: [-5, 4.2, 0], fov: 42 }, { pos: [-4.5, 3.4, 10], look: [-4.2, 4.0, 0], fov: 42 }]) },
    { name: '30 olennot palaavat: piiritys', a: tRet - S.LEAD, b: tR20 - S.LEAD, cam: camPath([{ pos: [5, 4.5, 20], look: [4, 1.6, 0], fov: 44 }, { pos: [3, 6, 19], look: [2, 1.8, 0], fov: 44 }]) },
    { name: '31 toverit harjanteella', a: tR20 - S.LEAD, b: tSnap - S.LEAD, cam: camPath([{ pos: [HX - 3.2, 0.9, 10], look: [HX + 5.5, 2.0, -3], fov: 48 }, { pos: [HX - 2.8, 0.8, 9.0], look: [HX + 5.5, 2.2, -3], fov: 48 }]) },
    { name: '32 ritari nousee: viiri leimahtaa', a: tSnap - S.LEAD, b: END + 1, cam: camPath([{ pos: [HX + 3.0, -0.4, 8.5], look: [HX + 0.2, 2.6, 0], fov: 46 }, { pos: [HX + 2.6, -0.5, 7.8], look: [HX + 0.2, 2.9, 0], fov: 46 }]) },
  );
  shots.sort((a, b) => a.a - b.a);

  // jousten aallot yöllä: hidas voimakkuus ankkurin ja paluun välillä, normalisoituna
  let wMax = 1e-6;
  for (let t = tNight; t < tRet; t += 0.5) wMax = Math.max(wMax, S.loudSlow(t));
  const wave = (t) => clamp(S.loudSlow(t) / wMax);
  function heroState(t) {
    let pose;
    const hornUp = smoothstep(0.3, 0.75, S.energy.horns(t));
    const flinch = CR.mosq.ons.length ? S.pulse(t, CR.mosq.ons[0].t, 0.5) : 0;
    if (t < tAns) pose = { ...KP.sit, tilt: KP.sit.tilt + 0.25 * Math.sin(t * 0.6) + 0.4 * flinch, lean: KP.sit.lean - 0.2 * flinch };
    else if (t < tNight) pose = { ...KP.sit, tilt: -0.75, lean: 0.45 };
    else if (t < tRet) pose = kmix(kmix(KP.sit, KP.look, ease(smoothstep(tNight + 10, nightMid, t))), { ...KP.lanceUp, tilt: 0.3 }, ease(smoothstep(nightMid, tRet - 6, t)));
    else if (t < tSnap) pose = kmix(KP.proud, KP.call, hornUp);
    else pose = kmix(KP.lanceUp, KP.call, 0.3 * hornUp);
    const lanceAng = t < nightMid ? -0.38 : undefined;
    return { x: HX, y: 0.05, z: 0.1, facing: 1, pose: { ...pose, mounted: false }, lanceAng };
  }
  const windAt = (t) => ({ x: -(0.3 + 2.0 * S.energy.violins(t) + (t > tSnap ? 3 : 0)), y: -0.6 + 1.5 * S.energy.violins(t) + (t > tSnap ? 1.6 : 0) });
  function setAppear(mats, a) { for (const m of mats) m.uniforms.uAppear.value = a; }

  function update(t) {
    const u = SKY.u;
    u.uTime.value = t;
    const night = smoothstep(tNight - 1, tNight + 8, t) * (1 - smoothstep(tRet + 3, tRet + 14, t));
    const snap = smoothstep(tSnap - S.LEAD, tSnap + 2, t);
    u.uBlueAmt.value = mix(0.5, 1.0, night);
    u.uBlueH.value = mix(0.6, -0.2, night);
    u.uRedAmt.value = mix(0.75, 0.05, night) + 0.5 * snap;
    u.uBlackTop.value = mix(0.3, 0.5, night);
    const crit = Object.values(CR).reduce((s, c) => s + present(c, t), 0) / 7;
    const chorus = smoothstep(tChor - 0.5, tChor + 1, t) * (1 - smoothstep(tAns - 1, tAns + 2, t));
    u.uMurk.value = (0.15 + 0.5 * crit + 0.3 * chorus) * (1 - night) * (1 - 0.6 * snap);
    u.uMoon.value.set(60, mix(30, 120, smoothstep(tNight, tRet - 10, t)), 14, night);
    u.uSun.value.w = 0;
    u.uRays.value = 0;
    // muisto lammessa vahvistuu jousten aalloissa
    const memA = smoothstep(tNight + 6, tNight + 11, t) * (1 - smoothstep(tRet - 4, tRet, t)) * (0.35 + 0.65 * wave(t));
    setAppear(memMats, clamp(memA));
    setAppear(stoneMats, 1 - nightAway(t));
    mem.visible = memA > 0.01;
    mem.position.x = 6.5 + 0.06 * Math.sin(t * 3.1);
    pond.u.uTime.value = t;
    pond.u.uGlint.value = 0.35 + 0.6 * S.fam.harp(t) + 0.4 * night;
    pond.rings.forEach((r) => r.set(0, 0, -99, 0));
    let rk = 0;
    const hp = S.fam.harp(t);
    strings.forEach((s) => { s.g.rotation.z = 0.04 * hp * Math.sin(t * 22 + s.k * 0.9); });
    // ritari: tumma sankariteeman mollista, puna palaa jousten aalloissa, leimahtaa lopussa
    L.place(t, heroState, windAt, { capeWind: 0.2 + S.energy.violins(t), width: 0.9 });
    const darkMinor = smoothstep(tAns - S.LEAD, tAns + 1.5, t);
    const restore = t > tNight ? 0.6 * smoothstep(tNight, tRet, t) * (0.5 + 0.5 * wave(t)) : 0;
    const dark = 0.55 * darkMinor * (1 - restore) * (1 - snap);
    for (const m of [L.P.M.body, L.P.M.tunic, L.bannerMat]) m.uniforms.uRaster.value = dark;
    ridgeMates.forEach((m, i) => {
      const r = ease(smoothstep(tR20 - S.LEAD + i * 0.25, tR20 + 2.2 + i * 0.25, t));
      m.P.root.visible = r > 0.01;
      m.P.root.position.set(m.x, 0.8 - 2.6 * (1 - r), PZ - 0.4);
      for (const mm of m.P.mats || []) if (mm.uniforms?.uRaster) mm.uniforms.uRaster.value = 0.5 * (1 - snap);
      poseKnight(m.P, kmix(KP.proud, KP.call, smoothstep(0.3, 0.7, S.energy.horns(t))), t, 0.4);
    });

    // hyttynen (huilu)
    { const c = CR.mosq, p = present(c, t), m = c.parts[0], G = gest(c, t);
      m.root.visible = p > 0.01; setAppear(m.mats, p);
      m.root.position.set(HX + 1.6 + 0.6 * Math.sin(t * 1.7) - 1.2 * G.g + (1 - p) * 8, 2.3 + 0.4 * Math.sin(t * 2.3) - 0.3 * G.g + (1 - p) * 4, 0.5);
      m.root.scale.set(-1, 1, 1);
      m.wN.rotation.z = 0.6 * Math.sin(t * 60); m.wF.rotation.z = 0.6 * Math.sin(t * 60 + 1);
      m.b.rotation.z = -0.3 * G.g; }
    // sorsa (oboe): mutisee nokallaan
    { const c = CR.duck, p = present(c, t), m = c.parts[0], G = gest(c, t);
      m.root.visible = p > 0.01; setAppear(m.mats, p);
      m.root.position.set(3.2 + 0.4 * Math.sin(t * 0.3), -1.25 - 0.4 * (1 - p), PZ + 0.1);
      m.root.scale.set(-1, 1, 1);
      m.up.rotation.z = 0.35 * G.g; m.lo.rotation.z = -0.35 * G.g;
      m.head.rotation.z = 0.1 * Math.sin(t * 2) + 0.2 * G.g;
      if (G.age < 0.3 && rk < 16) pond.rings[rk++].set(3.2, -1.2, G.t, 0.8); }
    // roiske (lautaset): ankkurissa
    { let best = 99;
      for (const st of splashT) { const a = t - (st - S.LEAD); if (a >= -1e-6 && a < best) best = a; }
      splash.visible = best >= -1e-6 && best < 0.7;
      splash.scale.set(1 + best * 1.5, clamp(1 - best / 0.7) * 1.6, 1);
      for (const st of splashT) if (t > st - S.LEAD && t - st < 3 && rk < 16) pond.rings[rk++].set(2.0, -1.5, st, 1.8); }
    // Quijote-nukke (englannintorvi): kiipeää kaislatikkaita, sitten matkii ritaria
    { const c = CR.quix, p = present(c, t), q = c.parts[0], G = gest(c, t);
      q.H.root.visible = q.P.root.visible = p > 0.01;
      setAppear([...q.H.mats, ...q.P.mats], p);
      const climbing = t >= tQ - S.LEAD && t < tToad + 2;
      const climbN = climbing ? c.ons.filter((o) => o.t - S.LEAD <= t && o.t < tToad).length : 0;
      const mock = t >= tMock - S.LEAD && t < tCrow + 1;
      q.H.root.position.set(12.6, 0.15, 0.1); q.H.root.scale.set(-0.95, 1.1, 1);
      poseHorse(q.H, 'stand', 0, 0);
      q.P.root.position.set(12.0 - 1.4 * (climbN > 0 ? 1 : 0), climbN > 0 ? 0.3 + 0.4 * Math.min(climbN, 7) : 1.7, 0.13);
      q.P.root.scale.set(-1, 1 + 0.25 * (mock ? G.g : 0), 1);
      q.P.mounted = climbN === 0;
      let pose = climbN > 0 ? (climbN % 2 ? KP.climbA : KP.climbB) : KP.ride;
      if (mock) pose = kmix(KP.ride, { ...KP.call, tilt: 1.3, aN: 2.6, eN: 0.2, lean: -0.4 }, 0.4 + 0.6 * G.g);
      poseKnight(q.P, { ...pose, mounted: climbN === 0 }, t, 0.2);
      ladder.forEach((r, k) => { r.visible = climbN > 0 && k < climbN + 1; }); }
    // rupikonnat (Dehring): rinnakkain, toinen kvintin ylempänä, kurkkupussit samassa rytmissä
    { const c = CR.toads, p = present(c, t), G = gest(c, t);
      const swell = 1 + 0.6 * smoothstep(tRet + 6, tRet + 9, t) * (1 - smoothstep(tSnap, tSnap + 2, t));
      c.parts.forEach((m, k) => {
        m.root.visible = p > 0.01; setAppear(m.mats, p);
        m.root.position.set(k ? 7.6 : 5.4, k ? -0.55 : -1.3, PZ + 0.1);
        m.root.scale.set(-swell, swell, 1);
        const s = 1 + 1.4 * G.g; m.sac.scale.set(s, s, 1);
        m.b.position.y = -(1 - p) * 1.0;
      }); }
    // sirkat (oboe ja Es-klarinetti kiihtyneinä): sirittävät vuorotellen
    { const c = CR.crick, p = present(c, t), G = gest(c, t);
      c.parts.forEach((m, k) => {
        m.root.visible = p > 0.01; setAppear(m.mats, p);
        const mine = (G.j + k) % 2 === 0 ? G.g : 0;
        m.root.position.set(11.0 + 1.4 * k, 0.15 + 0.6 * mine, 0.2); m.root.scale.set(-1, 1, 1);
        m.hind.rotation.z = -0.6 * mine;
      }); }
    // kaksi sammakkoa (fagotit): hyppivät vuorotellen
    { const c = CR.frogs, p = present(c, t), G = gest(c, t);
      c.parts.forEach((m, k) => {
        m.root.visible = p > 0.01; setAppear(m.mats, p);
        const mine = (G.j + k) % 2 === 0 ? G.g : 0;
        m.root.position.set(2.0 + 1.6 * k, -1.45 + 1.4 * mine, PZ + 0.12); m.root.scale.set(-1, 1, 1);
        m.leg.rotation.z = -0.8 * mine;
      }); }
    // varikset (sordinoidut pasuunat): laskeutuvat puulle ankkurin ruudulla
    { const c = CR.crows, p = present(c, t), G = gest(c, t);
      const land = smoothstep(tCrow - 0.8, tCrow - S.LEAD, t);
      const circleUp = t > tRet + 8 && t < tSnap ? smoothstep(tRet + 8, tRet + 10, t) : 0;
      c.parts.forEach((m, k) => {
        m.root.visible = p > 0.01 || (t > tCrow - 0.8 && t < tCrow); setAppear(m.mats, Math.max(p, land));
        const bx = -5.2 + k * 1.3, by = 5.75 - 0.25 * k, ang = t * 0.9 + k * 2.1;
        m.root.position.set(mix(bx + 6 * (1 - land), -1 + 5 * Math.cos(ang), circleUp), mix(by + 3 * (1 - land), 6 + 1.4 * Math.sin(ang), circleUp), -0.5);
        m.root.scale.set(k % 2 ? -1 : 1, 1, 1);
        m.up.rotation.z = 0.4 * G.g; m.lo.rotation.z = -0.4 * G.g;
        m.wing.rotation.z = 0.8 * Math.max(G.g, (1 - land) * Math.abs(Math.sin(t * 8 + k)), circleUp * Math.abs(Math.sin(t * 8 + k)));
      }); }
    const dim = 0.12 + 0.28 * night - 0.12 * snap;
    return { dim };
  }
  return { scene, update, shots };
}
