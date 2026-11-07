// F, aaltovuori ja majakkaluoto: kuvakäsikirjoituksen otot 21–24 (ankkurit held_reh12 ... held_dom7).
// Nousu 4 (korkein). Kriitikon linjaus: musiikki on Es-duurin ff-tuttia ja pyrkimystä, ei uhkaa,
// joten salamat eivät lähesty; vastustaja tulee vasta näytöksessä II.
//  21 held_reh12: raskas meri, patarumpu jyrisee; laiva kiipeää jättimaininkia kohti luotoa.
//  22 held_isku1–4: neljä kohtaloiskua ovat neljä maininkia, jotka lyövät luotoa vasten yhä
//     korkeammalle (neljäs suurin). Katko on sisäänhengitys: vesi vetäytyy, liike jatkuu.
//     Yksi jatkuva otto, laiva ei loikkaa.
//  23 held_dom7_sointu: laiva saavuttaa harjan luodon juurella; pilvet aukeavat.
//  24 held_dom7: selkäkuva 2/4: kapteeni perässä, edessä luodon huippu ja sädekehä: aurinko
//     korkeimmassa paikassa (aamun kuva palaa), jokainen säde on taajuuskaista. Säteet sammuvat.

import * as THREE from 'three';
import { C, ink, flat, group, poly, rect, ridgeGeo, skylineGeo, strokeGeo, cloud, sky as makeSky, streaks, clamp, smoothstep, mix, hash1, vnoise1 } from './paper.js';
import { camPath, ease } from './hero.js';
import { seaBand, ship, sternShip, splashes, cliffPts, common } from './world.js';

export function build(K) {
  const { S } = K;
  const A = S.A;
  const W = common(S);
  const t0 = K.a;
  const hits = ['held_isku1', 'held_isku2', 'held_isku3', 'held_isku4'].map((id) => S.A(id).t);
  const tChord = A('held_dom7_sointu').t;
  const T_D = A('held_dom7').t;
  const tTab = (tChord + T_D) / 2;   // tablo soinnun puolivälistä
  // katkot ennen iskuja (interpret.py: äkillinen hiljeneminen)
  const breaks = hits.map((h) => [S.drops.filter((d) => d < h && d > h - 2.5).pop() ?? h - 1.0, h]);
  // katko palautuu vasta iskun jälkeen, jotta suurin kuvamuutos on itse iskun roiske
  const brk = (t) => breaks.reduce((m, [d, h]) => Math.max(m, smoothstep(d - 0.1, d + 0.3, t) * (t >= h - S.LEAD ? 0 : 1)), 0);   // sisäänhengitys päättyy iskun ruudulla

  const scene = new THREE.Scene();
  const SKY = makeSky(scene);
  const farMat = ink(C.blue, { shade: C.black, raster: 0.4 });
  const far = flat(scene, ridgeGeo(-800, 1000, 30, 81, { lambda: 120, base: -300 }), farMat, { z: -300, y: -10 });
  far.userData.edge = { name: 'kaukaiset vuoret' };
  const clouds = Array.from({ length: 22 }, (_, k) => flat(scene, cloud(50 + 40 * hash1(k), 18 + 10 * hash1(k + 1), k + 300, false), ink(C.black, { shade: C.blue, raster: 0.3 + 0.2 * hash1(k + 5) }), { y: 50 + 50 * hash1(k + 2), z: -150 - 60 * hash1(k + 3) }));

  // --- jättimaininki: rinne x 0..110 nousee y 0 -> 30; harja luodon juurella ---
  const SUMX = 110, SUMY = 30;
  const slopeY = (x) => (x < 0 ? 0 : x < SUMX ? SUMY * Math.pow(Math.sin((Math.PI / 2) * (x / SUMX)), 1.4) : SUMY - 0.02 * (x - SUMX));
  const waveMat = ink(C.blue, { shade: C.black, raster: 0.25 });
  const mountain = flat(scene, skylineGeo(cliffPts(-300, 400, slopeY, 600), -200), waveMat, { z: -0.6 });
  mountain.userData.edge = { name: 'aaltovuori', x0: -300, x1: 400, y0: -200 };
  // vaahtojuovat valuvat rinnettä alas (sivutoiminta: jouset)
  const foamLines = Array.from({ length: 40 }, (_, k) => flat(scene, rect(2 + 4 * hash1(k + 7), 0.12, 0.5, 0.5), ink(C.paper, { shade: C.blue, raster: 0.2 }), { z: -0.5 }));
  const crestLine = flat(scene, strokeGeo(cliffPts(-300, 400, (x) => slopeY(x) + 0.05, 600), 0.18), ink(C.paper), { z: -0.45 });
  void crestLine;
  // majakkaluoto: harjan takana, korkein paikka
  const RX = SUMX + 26;
  const rockPts = [[RX - 30, -100], [RX - 18, SUMY + 2], [RX - 12, SUMY + 12], [RX - 6, SUMY + 17], [RX - 2, SUMY + 19], [RX + 3, SUMY + 18], [RX + 9, SUMY + 13], [RX + 16, SUMY + 4], [RX + 30, -100]];
  const rockMat = ink(C.black, { shade: C.blue, raster: 0.1 });
  const rockG = group(scene, {});
  flat(rockG, poly(rockPts), rockMat, { z: -3 });
  flat(rockG, strokeGeo(rockPts.slice(1, -1), 0.2), ink(C.paper), { z: -2.98 });
  // majakka luodon huipulla
  const tower = group(rockG, { x: RX, y: SUMY + 18.5, z: -2.9 });
  flat(tower, poly([[-1.1, 0], [1.1, 0], [0.7, 7], [-0.7, 7]]), ink(C.paper, { shade: C.blue, raster: 0.2 }), {});
  [1.5, 3.5, 5.5].forEach((y) => flat(tower, rect(1.9 - y * 0.12, 0.6, 0.5, 0.5), ink(C.red), { y, z: 0.01 }));
  flat(tower, rect(1.8, 1.4, 0.5, 0), ink(C.black), { y: 7, z: 0.01 });
  flat(tower, poly([[-1.2, 8.4], [1.2, 8.4], [0, 9.6]]), ink(C.black), { z: 0.01 });
  // maininkien roiskeet luotoa vasten: koko kasvaa iskusta toiseen
  const breakers = splashes(scene, 8, { z: -2.5, raster: 0.05 });
  const sprayExtra = splashes(scene, 8, { z: -2.4, raster: 0.25 });

  // --- laivat ---
  const hero = ship(scene, { captain: true });
  const mates = [1, 2, 3].map((k) => ({ k, s: ship(scene, { len: 9, sailRaster: 0.35, hullRaster: 0.1, penC: k % 2 ? C.paper : C.red }) }));
  const stern = sternShip(scene);
  stern.capB.M.body.uniforms.uColor.value.copy(C.black);
  stern.capB.M.dark.uniforms.uColor.value.copy(C.black);
  stern.capB.root.position.set(2.2, 0.55, 0.6);   // perän oikeaan kulmaan, sädekehän alle
  const rain = streaks(scene, 220, ink(C.paper, { shade: C.blue, raster: 0.3 }), 4);
  const drum = S.strokesIn(t0, breaks[0][0]).filter((x, i, a) => i === 0 || x - a[i - 1] > 0.4);

  // laiva kiipeää tasaisesti (ei loikkia); katkossa vauhti hidastuu hieman, ei pysähdy
  const climbX = W.integ((t) => (t < t0 ? 0 : t > tChord + 1.5 ? 0.3 : (SUMX - 6) / (tChord + 1.5 - t0) * (1 - 0.35 * brk(t))));
  const C0 = climbX(t0);
  const shipX = (t) => clamp(climbX(t) - C0, 0, SUMX - 2);
  const windAt = (t) => clamp(W.wind(t) * (1 - 0.6 * brk(t)) + 0.25);
  const placeOnSlope = (sh, x, z, sc = 1) => {
    const L = 10 * sh.h * sc;
    const yA = slopeY(x - L * 0.35), yB = slopeY(x + L * 0.35);
    sh.place(x, (yA + yB) / 2 - 0.5 * sc, z, Math.atan2(yB - yA, L * 0.7) * 0.85, sc);
  };

  const tabX = SUMX - 4, tabY = SUMY;
  const shots = [
    // 21–23 yhtenä jatkuvana nosturiajona: kamera nousee laivan mukana videon korkeimpaan kohtaan
    { name: '21-23 nousu 4: aaltovuoren rinne, maininkien iskut luotoon', a: t0, b: tTab,
      cam: (u, t) => {
        const x = shipX(t), y = slopeY(x);
        const k = ease(smoothstep(t0, tTab, t));
        return { pos: [x - 10 + 6 * k, y + 3 + 14 * k, 34 + 26 * k], look: [x + 10 + 14 * k, y + 6 + 10 * k, 0], fov: 46 + 4 * k };
      } },
    { name: '24 tablo: selkäkuva, sädekehä luodon yllä', a: tTab, b: T_D + 3,
      // purje vasemmalla kolmanneksella, luoto ja sädekehä oikealla: sankari katsoo korkeimpaan paikkaan
      cam: camPath([{ pos: [tabX + 3.6, tabY + 1.9, 11.5], look: [tabX + 9.4, tabY + 10.2, -120], fov: 54 }, { pos: [tabX + 3.4, tabY + 1.7, 10.0], look: [tabX + 9.4, tabY + 10.4, -120], fov: 54 }], (u) => u) },
  ];
  // tablon luoto: kameran edessä syvyydessä (sama majakka, nähty perästä)
  // luoto kameran katseen akselilla: majakan huippu juuri sädekehän keskipisteen alla
  const rock2 = group(scene, { x: tabX + 6.6, y: tabY - 29, z: -60 });
  flat(rock2, poly([[-40, -60], [-16, 6], [-8, 15], [-2, 20], [3, 19], [10, 12], [20, 3], [44, -60]]), rockMat, {});
  const tw2 = group(rock2, { x: 0.5, y: 19.5, z: 0.05 });
  flat(tw2, poly([[-1.6, 0], [1.6, 0], [1.0, 10], [-1.0, 10]]), ink(C.paper, { shade: C.blue, raster: 0.2 }), {});
  flat(tw2, rect(2.6, 2, 0.5, 0), ink(C.black), { y: 10, z: 0.01 });
  flat(tw2, poly([[-1.7, 12], [1.7, 12], [0, 13.8]]), ink(C.black), { z: 0.01 });
  const sea2 = seaBand(scene, -200, 500, tabY - 0.8, -20, { A: 0.4, k: 0.2, sp: 1.0, deepAmt: 0.5, name: 'harjan meri' });

  function update(t) {
    const w = windAt(t);
    const open = ease(smoothstep(tChord, tTab, t));
    farMat.uniforms.uRaster.value = 0.3 + 0.25 * W.loudS(t);
    clouds.forEach((c, k) => {
      c.position.x = -200 + ((hash1(k + 7) * 700 + W.drift(t) * (1 + hash1(k)) * 1.5) % 700);
      c.position.y = 50 + 50 * hash1(k + 2) + 40 * open * (hash1(k + 9) > 0.5 ? 1 : -1);
    });
    const u = SKY.u;
    u.uTime.value = t;
    u.uBlackTop.value = 0.55 * (1 - open);
    u.uBlueAmt.value = 1;
    u.uBlueH.value = 0.0 + 0.4 * open;
    u.uRedAmt.value = 0.25 + 0.5 * open;
    u.uMurk.value = 0.6 * (1 - open) * (1 - 0.4 * brk(t));
    // aurinko luodon huipun takana (tablon kameran suunnassa)
    // aurinko näkyy vasta tablossa, majakan takana (kameran suunnasta laskettu)
    const sx = tabX + 3.6 + 5.8 * (490 / 130), sy = tabY + 1.9 + 8.3 * (490 / 130) + 6;
    const sv = t >= tTab ? open : 0;
    u.uSun.value.set(sx, sy, 30, sv);
    u.uCloudGap.value.set(sx, sy, 60 + 160 * open, sv);
    u.uRays.value = (smoothstep(tChord + 1, T_D - 0.5, t) * 0.85 + 0.15 * smoothstep(T_D - 0.5, T_D - S.LEAD, t)) * (1 - smoothstep(T_D - S.LEAD, T_D + 0.3, t));
    for (let k = 0; k < 6; k++) u.uBands.value[k] = clamp(S.bands[k](Math.min(t, T_D)) * 1.4);
    waveMat.uniforms.uRaster.value = 0.2 + 0.2 * W.lows(t);
    foamLines.forEach((m, k) => {
      const span = SUMX + 40;
      const fx = SUMX + 10 - ((hash1(k + 3) * span + W.swellT(t) * (6 + 4 * hash1(k))) % span);
      m.position.set(fx, slopeY(fx) - 1.5 - 14 * hash1(k + 11), -0.5);
      m.rotation.z = Math.atan(SUMY * 1.4 * Math.PI / (2 * SUMX) * Math.cos((Math.PI / 2) * (clamp(fx, 0, SUMX) / SUMX)) * 0.6);
    });
    sea2.set(W.swellT(t), 0.3 + 0.4 * W.lows(t), t);
    // laivat rinteellä
    const x = shipX(t);
    const tab = t >= tTab;
    hero.root.visible = !tab;
    stern.root.visible = tab;
    rockG.visible = !tab;
    clouds.forEach((c) => { c.visible = !tab; });   // tablossa taivas on auennut: sädekehän edessä ei pilviä
    rock2.visible = tab;
    mates.forEach((m) => { m.s.root.visible = !tab; });
    placeOnSlope(hero, x, 0.2);
    hero.setSail({ hoist: 0.97, wind: w, t, pen: 1 });
    hero.poseCaptain(W.horns(t), t, w);
    mates.forEach((m) => {
      placeOnSlope(m.s, Math.max(-20, x - 13 * m.k), -1.0 - 0.0 * m.k, 1);
      m.s.root.position.z = -1.6 - 1.2 * m.k;
      m.s.setSail({ hoist: 0.97, wind: w, t: t + m.k * 0.4, pen: 1 });
    });
    if (tab) {
      stern.root.position.set(tabX, tabY - 0.9, 3);
      stern.root.rotation.z = 0.02 * Math.sin(t * 0.8);
      stern.setSail({ hoist: 0.97, wind: 0.35 + 0.3 * W.wind(t), t });
      stern.capB.M.cape.uniforms.uTime.value = t;
      stern.capB.M.cape.uniforms.uAmp.value = 0.1 + 0.2 * w;
      stern.capB.armR.rotation.z = 0.3 + 1.6 * W.horns(t);
    }
    // patarummun lyönnit ja kohtaloiskut: maininki lyö luotoa vasten
    const ev = [];
    for (const d of drum) if (t >= d - S.LEAD && t < d + 1) ev.push({ t: d, x: RX - 19, y: SUMY - 2, s: 1.6 });
    hits.forEach((h, k) => { if (t >= h - S.LEAD && t < h + 1) for (let j = 0; j < 3; j++) ev.push({ t: h, x: RX - 20 + 2.5 * j, y: SUMY - 3 + 2 * j, s: 4.0 + 1.7 * k }); });
    breakers.set(t, ev.slice(-8), S.LEAD);
    const ev2 = hits.filter((h) => t >= h - S.LEAD && t < h + 1).map((h) => ({ t: h, x: RX - 17, y: SUMY + 3 + 3 * hits.indexOf(h), s: 3.0 + 1.5 * hits.indexOf(h) }));
    sprayExtra.set(t, ev2, S.LEAD);
    // sade: tuulen suuntaan; katkossa harvenee
    const rr = (1 - open) * (1 - 0.7 * brk(t));
    rain.set((i) => {
      if (hash1(i * 3 + 9) > rr) return null;
      const span = 80;
      const ph = (hash1(i * 5) * span + W.windX(t) * 2) % span;
      const yy = 60 - ((hash1(i * 7) * 70 + t * 30) % 70);
      return { x: x - 30 + ph, y: slopeY(x) + yy - 10, ang: -1.2, len: 2.2, w: 0.06 };
    });
    return { dim: 0, wind: w };
  }
  return { scene, update, shots };
}
