// G, kaislalahti hämärässä ja yössä: kuvakäsikirjoituksen otot 26–32 (ankkurit wid_1_huilu ... loppu).
// Näytös II. Tuuli on loppunut (tyven, common().calm): purje roikkuu, viirit riippuvat.
// Kriitikon linjaus: olennot kerääntyvät yhteen rauhalliseen lavastukseen (laiva keskellä), jokainen
// tulee omalla ankkurillaan ja jää kuvaan kuoroon asti; lähikuvat vain huilulle, Dehringille ja
// Quijote-peilille. Muisto kasvaa jousten aalloissa. Loppu on nousun alku, ei voitto.

import * as THREE from 'three';
import { C, ink, flat, group, poly, rect, circle, ridgeGeo, skylineGeo, strokeGeo, cloud, deadTree, sky as makeSky, clamp, smoothstep, mix, hash1, vnoise1 } from './paper.js';
import { camPath, ease } from './hero.js';
import { seaBand, ship, splashes, cliffPts, common, knight, poseKnight, KP, kmix, hullShape, reflectDashes } from './world.js';
import { fluteMosquito, oboeDuck, cAnglaisHeron, tubaSnail, bassoonFrog, tromboneCrow } from './critters.js';

export function build(K) {
  const { S } = K;
  const A = S.A;
  const W = common(S);
  const t0 = S.T_WID;
  const tOb = A('wid_2_oboe').t, t34 = A('wid_3_4').t, tDeh = A('wid_dehring1').t, t6 = A('wid_6').t, t78 = A('wid_7_8').t;
  const tTb = A('wid_9_pasuunat').t, tKuoro = A('wid_kuoro').t, tMol = A('wid_sankari_molli').t, tR16 = A('wid_reh16').t;
  const tR17 = A('wid_reh17').t, tAtt = A('wid_uusi_hyokkays').t, tR20 = A('wid_reh20').t, tCym = A('wid_reh20_lautaset').t, tRise = A('wid_sankari_nousee').t;
  const tEnd = K.b;

  const scene = new THREE.Scene();
  const SKY = makeSky(scene);
  const farMat = ink(C.black, { shade: C.blue, raster: 0.3 });
  const far = flat(scene, ridgeGeo(-700, 700, 8, 91, { lambda: 60, base: -200 }), farMat, { z: -200, y: -2 });
  far.userData.edge = { name: 'kaukainen ranta' };
  // kuolleiden puiden rivi horisontissa
  const treeMat = ink(C.black, { shade: C.blue, raster: 0.15 });
  for (let i = 0; i < 26; i++) for (const sh of deadTree(200 + i, 3 + 2 * hash1(i))) flat(scene, sh, treeMat, { x: -150 + i * 12 + 4 * hash1(i + 1), y: 0, z: -70 });
  const waterFar = seaBand(scene, -800, 800, 0, -60, { A: 0.02, k: 0.2, sp: 0.3, base: C.blue, deepAmt: 0.2, glint: 0.5, rows: 2, foam: 0.3, name: 'lahti kaukana', bottom: -150 });
  const water = seaBand(scene, -400, 400, 0, -0.8, { A: 0.03, k: 0.25, sp: 0.4, base: C.blue, shade: C.black, raster: 0.15, deepAmt: 0.3, glint: 0.6, rows: 2.5, foam: 0.4, name: 'lahti', bottom: -150 });
  // rannat: vasen penger kuolleen harppupuun kanssa, oikea kivikko
  const bankMat = ink(C.black, { shade: C.blue, raster: 0.08 });
  // rantojen sisäpäät laskeutuvat veden alle (ei pystysuoraa lavasteen reunaa)
  flat(scene, skylineGeo(cliffPts(-200, -6, (x) => mix(-2, 1.5 + 2.2 * smoothstep(-12, -24, x) + 0.6 * vnoise1(x / 3, 93), smoothstep(-7, -13, x)), 140), -60), bankMat, { z: -6 });
  flat(scene, skylineGeo(cliffPts(8, 200, (x) => mix(-2, 1.2 + 2.5 * smoothstep(14, 28, x) + 0.6 * vnoise1(x / 3, 94), smoothstep(9, 15, x)), 140), -60), bankMat, { z: -8 });
  const deadG = group(scene, { x: -17, y: 2.5, z: -5.8 });
  for (const sh of deadTree(77, 3.6)) flat(deadG, sh, bankMat, {});
  // portaat haikaralle (kromaattinen nousu): paalut nousevat vasemmalta oikealle
  const POST = Array.from({ length: 6 }, (_, k) => ({ x: 9 + 1.6 * k, h: 0.6 + 0.45 * k }));
  // paalut ja kivet etualan vesikaistan takana: kaista peittää niiden alaosan (vesiraja)
  POST.forEach((p) => flat(scene, poly([[-0.22, -3], [0.22, -3], [0.2, p.h], [0.05, p.h + 0.12], [-0.2, p.h]]), bankMat, { x: p.x, y: 0, z: 1.3 }));
  // Dehringin kivet: oikea täsmälleen kvintin (3:2) korkeampi
  const DH = 1.4;
  const rockA = { x: -9.5, h: DH }, rockB = { x: -6.5, h: DH * 1.5 };
  [rockA, rockB].forEach((r) => flat(scene, poly([[-1.5, -3], ...Array.from({ length: 13 }, (_, i) => { const a = Math.PI * (1 - i / 12); return [1.4 * Math.cos(a), r.h - 0.9 + 0.9 * Math.sin(a)]; }), [1.5, -3]]), bankMat, { x: r.x, z: 1.2 }));
  // tukki sammakoille
  flat(scene, rect(5, 0.7, 0.5, 0), bankMat, { x: 9.5, y: -1.0, z: 1.4 });
  // etualan kaislat
  const reedMat = ink(C.black, {});
  for (let i = 0; i < 90; i++) {
    const x = -40 + 80 * hash1(i * 3 + 1);
    if (Math.abs(x) < 15) continue;   // ei kaisloja hahmojen edessä
    const h = 2 + 3 * hash1(i * 3 + 2);
    flat(scene, poly([[-0.06, -3], [0.06, -3], [0.02, h], [-0.02, h]]), reedMat, { x, y: -1, z: 9 + 2 * hash1(i * 3 + 3), r: 0.08 * (hash1(i * 7) - 0.5) });
  }

  // etualan vesikaista ja peilikuva (tyyni pinta y = Y0)
  const Y0 = -0.9;
  const fore = seaBand(scene, -400, 400, Y0, 1.5, { A: 0.01, k: 0.3, sp: 0.3, base: C.blue, shade: C.paper, raster: 0.2, deepAmt: 0.25, glint: 0.7, rows: 3, foam: 0.3, name: 'etualan vesi', bottom: -150 });
  const hero = ship(scene, { captain: true });
  const heroR = ship(scene, { captain: true, ghost: true });
  const dashR = reflectDashes(scene, 9);
  // Quijote-peili: laiha ritari tyynessä vedessä (englannintorvi vääristää teeman)
  const quix = knight(scene, { thin: true, body: C.blue, limb: C.blue, raster: 0.4 });
  // muisto vedessä: aamun niemi, aurinko ja kahdeksan purjetta (ylösalaisin, rasteroituna)
  // piirretään etualan tyynen pinnan päälle (Y0), jotta se näkyy vedessä laivan vasemmalla puolella
  const memG = group(scene, { x: 0, y: Y0 - 0.05, z: 2.0 });
  memG.scale.set(0.55, 0.55, 1);
  // muisto = aamun kuva (satama 37 s) ylösalaisin: niemen kartio, aurinko huipun yllä, kahdeksan laivaa
  memG.scale.y = -0.55;
  const memCape = flat(memG, poly([[-70, -0.2], [-52, 6], [-40, 14], [-32, 22], [-27, 25], [-22, 22], [-14, 12], [-6, 5], [4, 1], [70, -0.2]]), ink(C.blue, { shade: C.black, raster: 0.6 }), { z: 0.02 });
  const memSun = flat(memG, circle(5.5, 40), ink(C.red, { shade: C.paper, raster: 0.15 }), { x: -27, y: 33, z: 0.01 });
  const memHull = ink(C.paper, { shade: C.blue, raster: 0.45 });
  const memSail = ink(C.red, { shade: C.paper, raster: 0.2 });
  const memSails = Array.from({ length: 8 }, (_, k) => {
    const g = group(memG, { x: 2 + k * 6.4, y: 0.6, z: 0.03 + 0.001 * k });
    const sc = 0.45;
    flat(g, hullShape(10), memHull, { s: sc });
    flat(g, rect(0.12, 9.5 * sc, 0.5, 0), memHull, {});
    flat(g, rect(6.4 * sc, 7.4 * sc, 0.5, 0), memSail, { y: 1.0 * sc });
    return g;
  });
  memCape.material.uniforms.uAppear.value = 0;
  // laivaston purjeet horisontissa (wid_reh20: kaikki 8 käyrätorvea)
  const fleetFar = Array.from({ length: 7 }, (_, k) => ship(scene, { len: 7, sailRaster: 0.35, hullRaster: 0.2, penC: k % 2 ? C.paper : C.red }));

  // olennot
  const mosq = fluteMosquito(scene);
  const duck = oboeDuck(scene);
  const heron = cAnglaisHeron(scene);
  const snails = [tubaSnail(scene), tubaSnail(scene)];
  const frogs = [bassoonFrog(scene), bassoonFrog(scene)];
  const crows = [tromboneCrow(scene), tromboneCrow(scene), tromboneCrow(scene)];
  const cymbal = splashes(scene, 6, { z: 4, raster: 0.05 });
  cymbal.mats.forEach((m) => m.uniforms.uColor.value.copy(C.black));

  // --- data: eleet fraasin verhokäyrästä (tasoitettu), ei nuotinalkuja ---
  const windsEnv = W.smooth((t) => clamp(S.fam.winds(t) * 1.2), 0.25);
  const lowsEnv = W.smooth((t) => clamp(S.energy.lows(t)), 0.3);
  const heronStep = W.integ((t) => (t >= t34 && t < tDeh + 2 ? 1.6 : 0));
  // läsnäolo: olento ilmestyy ankkurinsa ruudulla (rasteri painuu esiin) ja väistyy yöksi
  const night = (t) => smoothstep(tR17 - 3, tR17 + 2, t) * (1 - smoothstep(tAtt - 1.5, tAtt + 0.5, t));
  const on = (ta) => (t) => smoothstep(ta - 0.4, ta, t) * (1 - night(t));
  const pres = { mosq: on(t0), duck: on(tOb), heron: on(t34), snails: on(tDeh), frogs: on(t78), crows: on(tTb) };
  const quixAmt = (t) => smoothstep(t78 - 0.3, t78 + 0.8, t) * (1 - smoothstep(tTb - 0.5, tTb + 1.5, t));
  const murk = (t) => smoothstep(tKuoro - 1, tKuoro + 2, t) * (1 - smoothstep(tMol, tMol + 6, t)) + 0.5 * smoothstep(tAtt, tAtt + 4, t) * (1 - smoothstep(tRise - 1, tRise + 3, t));
  // muiston aallot: jousten jaksorajat välillä wid_reh17 .. wid_uusi_hyokkays
  const waves = S.segs.filter((s) => s.a >= tR17 - 0.5 && s.a < tAtt - 2).map((s) => s.a);
  const memK = (t) => waves.filter((w) => t >= w).length;
  const memAmt = (i) => (t) => { const w = waves[Math.min(i, waves.length - 1)] ?? tR17; return smoothstep(w, w + 3, t) * (1 - smoothstep(tAtt - 2, tAtt + 1, t)) * (i < waves.length ? 1 : smoothstep(tR17 + 40, tR17 + 45, t)); };
  // kapteenin mieliala: istuu -> painuu -> kerää itsensä -> nousee
  const sink = (t) => smoothstep(tMol, tR16 + 3, t) * (1 - smoothstep(tR17 + 10, tAtt, t));
  const stand = (t) => ease(smoothstep(tRise - 0.5, tEnd, t));
  const gather = (t) => smoothstep(tR17, tAtt, t);
  const dark = (t) => Math.max(0.15, sink(t)) * (1 - 0.6 * gather(t)) * (1 - stand(t));

  const shots = [
    { name: '26 huiluhyttynen laskeutuu kapteenin taivaalle', a: t0 - 0.3, b: tOb,
      cam: camPath([{ pos: [3, 3.0, 20], look: [3, 4.2, 0], fov: 42 }, { pos: [3.5, 2.8, 18], look: [3.5, 4.0, 0], fov: 42 }]) },
    { name: '27 lavastus: sorsa ja haikara tulevat', a: tOb, b: tDeh,
      cam: camPath([{ pos: [0, 4.5, 30], look: [0, 3.5, 0], fov: 44 }, { pos: [1, 4.2, 28], look: [1, 3.4, 0], fov: 44 }]) },
    { name: '27 lähikuva: Dehringin kvinttikotilot, laiva takana', a: tDeh, b: t6,
      cam: camPath([{ pos: [-12, 1.8, 13], look: [-6, 2.2, 0], fov: 38 }, { pos: [-11, 1.6, 12], look: [-6.5, 2.0, 0], fov: 38 }]) },
    { name: '27 lähikuva: Quijote-peili ja fagottisammakot', a: t6, b: tTb,
      cam: camPath([{ pos: [7.5, 0.8, 15], look: [5.5, -1.0, 0], fov: 42 }, { pos: [7.0, 0.6, 14], look: [5.5, -1.2, 0], fov: 42 }]) },
    { name: '27 varikset puuhun, kuoro: kaikki samassa kuvassa', a: tTb, b: tMol,
      cam: camPath([{ pos: [-3, 5, 32], look: [-2, 4, 0], fov: 46 }, { pos: [0, 5.5, 36], look: [0, 4, 0], fov: 46 }]) },
    { name: '28 molli: kapteeni painuu, purje tummuu', a: tMol, b: tR16,
      cam: camPath([{ pos: [10, 2.6, 11], look: [4.25, 2.3, 0], fov: 38 }, { pos: [9, 2.0, 10], look: [4.25, 1.9, 0], fov: 38 }]) },
    { name: '28 käyrätorvet hiljaa: hämärä syvenee', a: tR16, b: tR17,
      cam: camPath([{ pos: [-6, 3.5, 26], look: [0, 3, 0], fov: 42 }, { pos: [-4, 3.0, 24], look: [0, 2.8, 0], fov: 42 }]) },
    { name: '29a muisto: kuu ja vesi', a: tR17, b: mix(tR17, tAtt, 0.33),
      cam: camPath([{ pos: [-2, 4, 30], look: [-2, 1.5, -40], fov: 46 }, { pos: [-1, 3.6, 27], look: [-1, 1.2, -40], fov: 46 }]) },
    { name: '29b muisto: yksityiskohta', a: mix(tR17, tAtt, 0.33), b: mix(tR17, tAtt, 0.66),
      cam: camPath([{ pos: [-8, 2.0, 22], look: [-4, -4, -20], fov: 44 }, { pos: [-3, 1.8, 20], look: [1, -4, -20], fov: 44 }]) },
    { name: '29c muisto: symmetria, horisontti keskellä', a: mix(tR17, tAtt, 0.66), b: tAtt,
      cam: camPath([{ pos: [2, 5, 40], look: [2, 1, -60], fov: 46 }, { pos: [2, 1.0, 34], look: [2, 0.6, -60], fov: 46 }]) },
    { name: '30 uusi hyökkäys: piiritys korkealta', a: tAtt, b: tR20,
      cam: camPath([{ pos: [2, 10, 30], look: [1, 2, 0], fov: 44 }, { pos: [1, 10.5, 28], look: [1, 2, 0], fov: 44 }]) },
    { name: '31 laivasto horisontissa, roiske', a: tR20, b: tRise,
      cam: camPath([{ pos: [-4, 4, 30], look: [0, 5, -40], fov: 44 }, { pos: [-2, 3.5, 22], look: [0, 5.5, -40], fov: 44 }]) },
    { name: '32 sammakkoperspektiivi: tuuli palaa, kapteeni nousee', a: tRise, b: tEnd + 1,
      cam: camPath([{ pos: [6.5, 0.5, 9.5], look: [4.25, 6, 0], fov: 50 }, { pos: [6.0, 0.35, 8.5], look: [4.25, 7, 0], fov: 50 }]) },
  ];

  function update(t) {
    const w = W.wind(t);
    const nt = night(t);
    const u = SKY.u;
    u.uTime.value = t;
    // hämärä: punainen taivaanranta -> yö (kuu) -> uusi hyökkäys hämärtää
    u.uBlackTop.value = 0.35 + 0.4 * nt;
    u.uBlueAmt.value = 1;
    u.uBlueH.value = 0.15 + 0.2 * (S.reg(t) - 0.5) - 0.1 * nt;
    u.uRedAmt.value = 0.8 * (1 - nt) + 0.3 * stand(t);
    u.uMurk.value = 0.45 * murk(t);
    u.uSun.value.set(0, 0, 1, 0);
    u.uRays.value = 0;
    u.uCloudGap.value.set(0, 0, 1, 0);
    u.uMoon.value.set(-30, 30 + 60 * ease(smoothstep(tR17 - 2, tR17 + 20, t)), 9, nt);
    farMat.uniforms.uRaster.value = 0.2 + 0.25 * W.loudS(t);
    const tw = W.swellT(t);
    waterFar.set(tw, 0.02, t);
    water.set(tw, 0.03 + 0.05 * W.strings(t) * nt, t);
    fore.set(tw, 0.01, t);
    fore.u.uGlint.value = 0.4 + 0.5 * nt;
    // laiva: ankkurissa tyvenessä, purje roikkuu ja tummuu; tuuli palaa vasta nousussa
    // tyven: purje roikkuu poimuilla näytöksen II alusta, kunnes sankari nousee
    const slack = 1 - stand(t);
    hero.place(0, -0.55, 0, 0.005 * Math.sin(t * 0.4), 1);
    const sailDark = dark(t);
    hero.sailMat.uniforms.uRaster.value = 0.6 * sailDark;
    hero.penMat.uniforms.uRaster.value = 0.6 * sailDark;
    const hz = 0.97;
    hero.setSail({ hoist: hz, wind: w, slack, t, pen: 1 });
    const sitP = kmix(KP.sit, kmix(KP.sit, KP.look, gather(t) * 0.6), 1 - sink(t));
    const capPose = kmix(kmix(sitP, { ...KP.sit, tilt: -0.7, lean: 0.5 }, sink(t)), KP.call, stand(t) * W.horns(t) + 0.5 * stand(t));
    poseKnight(hero.cap, capPose, t, w);
    // peilikuva ja Quijote
    heroR.root.visible = nt < 0.5;
    heroR.root.position.set(0, 2 * Y0 + 0.55, 1.8);
    heroR.root.scale.set(1, -1, 1);
    heroR.setSail({ hoist: hz, wind: w, slack, t, pen: 1 });
    poseKnight(heroR.cap, capPose, t, w);
    heroR.sail.visible = heroR.sailEdge.visible = false;
    dashR.set(0.3, Y0 - 1.3, 6.2, 6.5, 1.85, t, heroR.root.visible ? 1 : 0);
    dashR.mat.uniforms.uRaster.value = 0.35 + 0.5 * sailDark;
    const q = quixAmt(t);
    heroR.cap.root.visible = q < 0.5;
    quix.root.visible = q > 0.01;
    quix.root.position.set(4.25, 2 * Y0 + 0.55 - 0.05, 1.9);
    quix.root.scale.set(1.15 * (1 - 0.35 * q), -1.15 * (1 + 0.35 * q), 1);
    poseKnight(quix, kmix(KP.stand, { ...KP.call, tilt: 1.4, lean: -0.5 }, windsEnv(t) * q), t, 0);
    quix.mats.forEach((m) => { if (m.uniforms.uAppear) m.uniforms.uAppear.value = q; });
    // olennot
    const g = windsEnv(t);
    const pm = pres.mosq(t);
    mosq.root.visible = pm > 0.01;
    const dropM = ease(smoothstep(t0, t0 + 1.5, t));
    mosq.root.position.set(8.0 + 0.6 * Math.sin(t * 0.9), 10 - 3.4 * dropM + 0.3 * Math.sin(t * 1.3), 5.5);
    mosq.root.scale.set(-1.3, 1.3, 1);
    mosq.pose(g, t);
    mosq.mats.forEach((m) => { m.uniforms.uAppear.value = pm; });
    const pd = pres.duck(t);
    duck.root.visible = pd > 0.01;
    duck.root.position.set(-4.5, Y0 - 0.15, 1.35);
    duck.root.scale.setScalar(1.8);
    duck.pose(t > t6 ? clamp(g * 1.4) : g);
    duck.mats.forEach((m) => { m.uniforms.uAppear.value = pd; });
    const ph = pres.heron(t);
    heron.root.visible = ph > 0.01;
    const hs = heronStep(t);
    const hk = Math.min(POST.length - 1, Math.floor(hs));
    const hf = ease(clamp(hs - hk));
    const pA = POST[hk], pB = POST[Math.min(POST.length - 1, hk + 1)];
    heron.root.position.set(mix(pA.x, pB.x, hf), mix(pA.h, pB.h, hf) + 0.35 * Math.sin(Math.PI * hf), 1.32);
    heron.root.scale.set(-1.5, 1.5, 1);
    heron.pose(g, t, hs);
    heron.mats.forEach((m) => { m.uniforms.uAppear.value = ph; });
    const ps = pres.snails(t);
    const lg = lowsEnv(t);
    snails.forEach((s, i) => {
      s.root.visible = ps > 0.01;
      const r = i ? rockB : rockA;
      s.root.position.set(r.x, r.h, 1.25);
      s.root.scale.setScalar(1.25);
      s.pose(lg);
      s.mats.forEach((m) => { m.uniforms.uAppear.value = ps; });
    });
    const pf = pres.frogs(t);
    frogs.forEach((f, i) => {
      f.root.visible = pf > 0.01;
      f.root.position.set(8.2 + 2.6 * i, -0.3, 1.45);
      f.root.scale.set(i ? -1.2 : 1.2, 1.2, 1);
      f.pose(clamp(S.fam.winds(t) > 0.1 ? lg : 0));
      f.mats.forEach((m) => { m.uniforms.uAppear.value = pf; });
    });
    const pc = pres.crows(t);
    crows.forEach((c, i) => {
      c.root.visible = pc > 0.01;
      const land = ease(smoothstep(tTb - 0.2 + 0.25 * i, tTb + 1.4 + 0.25 * i, t));
      c.root.position.set(-17 + [-1.6, 0.4, 2.0][i] + 6 * (1 - land), 2.5 + [4.6, 5.8, 4.3][i] + 5 * (1 - land), -5.6);
      c.root.scale.set(1.3, 1.3, 1);
      c.pose(clamp(lg * 1.3));
      c.mats.forEach((m) => { m.uniforms.uAppear.value = pc; });
    });
    // uusi hyökkäys: olennot palaavat lähemmäs (piiri sulkeutuu)
    const ring = smoothstep(tAtt, tR20, t) * (1 - smoothstep(tRise, tEnd, t));
    duck.root.position.x += 1.5 * ring;
    snails.forEach((s) => { s.root.position.x += 0; });
    // muisto
    const mk = memK(t);
    void mk;
    memCape.material.uniforms.uAppear.value = memAmt(0)(t);
    memSun.material.uniforms.uAppear.value = memAmt(1)(t);
    memSun.visible = memAmt(1)(t) > 0.01;
    memCape.visible = memAmt(0)(t) > 0.01;
    // purjeet tulevat aalto aallolta, kaksi kerrallaan (materiaalit jaettuja: läsnäolo näkyvyydellä)
    memSails.forEach((s, k) => { s.visible = memAmt(2 + Math.floor(k / 2))(t) > 0.5; });
    memHull.uniforms.uAppear.value = memAmt(2)(t);
    memSail.uniforms.uAppear.value = memAmt(2)(t);
    // laivaston purjeet horisontissa: nousevat wid_reh20:ssa
    fleetFar.forEach((f, k) => {
      const a = smoothstep(tR20 - 0.5 + 0.4 * k, tR20 + 2.5 + 0.4 * k, t);
      f.root.visible = a > 0.01;
      f.place(-60 + k * 20, 1.5, -110, 0, 1.6);   // kaukana horisontissa, erillään
      f.setSail({ hoist: 0.15 + 0.8 * a, wind: w, slack: 1 - clamp(w * 2 + 0.4), t: t + k, pen: a });
    });
    // lautaset: musta roiske lammessa
    const ce = t >= tCym - S.LEAD && t < tCym + 1 ? [0, 1, 2].map((j) => ({ t: tCym, x: -1.5 + 1.5 * j, y: -0.8, s: 2.4 })) : [];
    cymbal.set(t, ce, S.LEAD);
    return { dim: 0.1 * nt, wind: w };
  }
  return { scene, update, shots };
}
