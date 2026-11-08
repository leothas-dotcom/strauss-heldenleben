// G, suo aamupäivän sameudessa ja illassa: näytös 2, vastustajat (wid_1_huilu ... gef_viulu).
// Ohjaus: docs/ohjaus.md luku 2. Kaikki ajat ovat ankkureita (S.A), jaksorajoja (S.segs) tai mitattuja
// kanavia (S.fam, S.energy); hahmon eleiden kestot ovat osuuksia kahden ankkurin välistä (fr()).
//   2.1 Pisto: ritari laskeutuu suolle, istuu kuolleen puun juurelle; hyttynen (huilu) pistää, hän huitaisee keihäällä.
//   2.2 Olennot yksi kerrallaan omilla ankkureillaan, ritari reagoi jokaiseen eri tavalla:
//       sorsa (oboe): selkä sorsalle; haikara (englannintorvi): nousee puoliksi; kotilot (Dehring): käsi korvalle;
//       peili (englannintorvi + fagotit): katsoo laihaa Quijotea; varikset (pasuunat): viiri suojaan.
//   2.3 Kuoro: sameus sakenee, hän yrittää nousta mutta painuu takaisin.  2.4 Molli: kypärä alas, keihäs maahan.
//   2.5 Muisto (kierros 2, C6): tyynen lammen pintaan piirtyy aamun auringonnousu (loc_valley.js, kohtaus 1.3)
//       ylösalaisin: sama kaukovuoret + lähivuori + harjanteen reuna + aurinko + viirit. Kuva kasvaa jousikanavan
//       (S.fam.strings = panns_string_section + bowed_string_instrument) aalto aallolta: aallot ovat kanavan
//       tasoitetun käyrän pohjien välit (mitattu, ei jaksorajoja), ja jokaisen aallon sisällä osa kasvaa kanavan
//       kertymän mukaan (soidessaan). Aalto 1 harjanne (lähivuori + reuna), 2 kaukovuoret, 3 aurinko,
//       4 viirit (vasen ryhmä), 5 viirit (oikea ryhmä), 6 hän tarttuu viiriin ja kuva häipyy.
//       Ritari nostaa päätään kertymän mukaan ja viirin tumma rasteri vaalenee aalto kerrallaan.
//       Olennot ovat poissa muiston ajan (soittimet vaikenevat), eikä niitä jää kuvaan.  2.6 Piiritys.
//   2.7 Toverit harjanteella vastaavat, roiske (lautaset).  2.8 Viiri pystyyn, leveä veto suon yli, olennot tippoina.
//   Olentojen läsnäolo (kierros 4, osa 2): olento on kuvassa vain, kun sen soitin soi (LIFE, soundIv); tulo ja lähtö ovat yksi liike.
//   Olentojen eleet (C9): jokaisella yksi ele, jonka ajaa oman soitinryhmän tasoitettu verhokäyrä (ei nuotinalku).
//   Näkyvyys (kierros 4b/4c, osa 2): olennot lepäävät kokonaan kuvassa (4 % marginaali) ja erillään; window.nakyvyysProbe(t) + render/nakyvyys.mjs tarkistavat jokaisen oton.
//   Koko ja paikka tyyliohjeesta (kierros 4c): vastustajat ovat täpliä (luku 10), joten olento on täplän kokoinen (raskain täplä, tuuba ff, enintään ritarin pään kokoinen) ja
//   koko on voimakkuus (luku 4, sääntö 13.5): jokaisen olennon koko seuraa oman soitinkanavansa tasoitettua voimakkuutta (peruskoko pp, enintään ~1,9-kertainen ff).
//   Pystysuunta on rekisteri (kuvasääntö 7): huilu (hyttynen) yläkolmanneksessa, oboe ja englannintorvi (sorsa, haikara) keskellä, tuubat ja fagotit (kotilot, sammakot) alhaalla
//   penkereellä ja sen alarinteellä; Dehringin kotilot ovat rinnakkain ja aina saman pystyetäisyyden (kvintti) päässä toisistaan. Ei lavasteita (tukki poistettu).

import * as THREE from 'three';
import { C, ink, flat, group, poly, rect, circle, outline, deadTree, skylineGeo, strokeGeo, water, sky as makeSky, ridgePts, clamp, smoothstep, mix, hash1, vnoise1 } from './paper.js';
import { knight, poseKnight, KP, kmix, POSES } from './puppets.js';
import { fluteMosquito, oboeDuck, cAnglaisHeron, tubaSnail, bassoonFrog, tromboneCrow } from './critters_swamp.js';
import { common } from './world.js';
import { brushStroke, splat } from './brush.js';
import { leader, camPath, ease } from './hero.js';
import { gaussian } from '../util.js';

// Aamun harjanne (loc_valley.js: topPts): tasanne x -13..15 ja loivat rinteet. Sama kaava kuin laaksossa.
const valleyRidge = (x) => {
  const plateau = 1 - smoothstep(14, 26, Math.abs(x - 1));
  return plateau * (0.12 * (vnoise1(x * 0.8, 5) - 0.5)) + (1 - plateau) * (-0.32 * Math.max(0, Math.abs(x - 1) - 14) + 3.5 * (vnoise1(x / 9, 9) - 0.5));
};

export function build(K) {
  const { S } = K;
  const A = K.a;
  const LEAD = S.LEAD;
  const at = (id) => S.A(id);
  const tMos = at('wid_1_huilu').t, tDuck = at('wid_2_oboe').t, tQ = at('wid_3_4').t, tToad = at('wid_dehring1').t;
  const tCrick = at('wid_6').t, tMock = at('wid_7_8').t, tCrow = at('wid_9_pasuunat').t;
  const tChor = at('wid_kuoro').t, tAns = at('wid_sankari_molli').t, tR16 = at('wid_reh16').t;
  const tNight = at('wid_reh17').t, tRet = at('wid_uusi_hyokkays').t, tR20 = at('wid_reh20').t, tSplash2 = at('wid_reh20_lautaset').t;
  const tSnap = at('wid_sankari_nousee').t, tVoit = at('wid_voitto').t, END = at('gef_viulu').t;
  const fr = (a, b, x) => a + (b - a) * x;   // osuus kahden ankkurin välistä
  const ramp = (a, b, t) => ease(smoothstep(a, b, t));
  const bump = (a, m, b, t) => ramp(a, m, t) * (1 - ramp(m, b, t));

  // --- muiston aallot: jousikanavan (S.fam.strings) tasoitetun käyrän pohjat wid_reh17:n ja wid_uusi_hyokkays:n välissä ---
  // Käyrä tasoitetaan 1,5 s:n gaussilla; pohja = paikallinen minimi ±4 s:n ikkunassa, jonka kummallakin puolella (8 s) on
  // vähintään 0,08 korkeampi huippu. Aalto = kahden pohjan väli. Kasvu aallon sisällä = kanavan kertymä (kasvaa soidessa,
  // pysähtyy tauossa, ei koskaan palaa), joten kuva seuraa mitattua soittoa eikä kellotettua kaavaa.
  const WF = 30, wA = tNight, wN = Math.round((tRet + 8 - wA) * WF) + 1;
  const strRaw = Float32Array.from({ length: wN }, (_, i) => S.fam.strings(wA + i / WF));
  const strSm = gaussian(strRaw, 45);
  const troughs = [], ehdokkaat = [];
  for (let i = 120; i < wN - 120; i++) {
    const tt = wA + i / WF;
    if (tt < wA + 3 || tt > tRet - 4) continue;
    let isMin = true;
    for (let j = i - 120; j <= i + 120; j++) if (j !== i && (j < i ? strSm[j] < strSm[i] : strSm[j] <= strSm[i])) { isMin = false; break; }
    if (!isMin) continue;
    let lm = 0, rm = 0;
    for (let j = Math.max(0, i - 240); j <= i; j++) lm = Math.max(lm, strSm[j]);
    for (let j = i; j < Math.min(wN, i + 241); j++) rm = Math.max(rm, strSm[j]);
    const prom = Math.min(lm, rm) - strSm[i];
    ehdokkaat.push([tt, prom]);
    // kynnys 0,08 (oli 0,12): nopeuskorjatun lähteen analyysissä (9.11.2026) viidennen aallon pohjan (341 s) prominenssi on 0,10
    if (prom >= 0.08) troughs.push(tt);
  }
  if (troughs.length < 5) {
    const lista = ehdokkaat.sort((a, b) => b[1] - a[1]).slice(0, 8).map(([tt, p]) => `${tt.toFixed(1)} s (${p.toFixed(3)})`).join(', ');
    throw new Error(`muiston aallot: jousikanavan pohjia alle 5 (wid_reh17 .. wid_uusi_hyokkays): ${troughs.length} pohjaa; ehdokkaat ${lista}`);
  }
  const WB = [tNight, ...troughs.slice(0, 5), tRet];          // kuusi aaltoa
  const cumA = new Float32Array(wN);
  { let acc = 0; for (let i = 0; i < wN; i++) { acc += Math.max(strRaw[i], 0.08) / WF; cumA[i] = acc; } }
  const cumAt = (t) => { const f = clamp((t - wA) * WF, 0, wN - 1.001), i = Math.floor(f); return cumA[i] + (cumA[i + 1] - cumA[i]) * (f - i); };
  const qWave = (k, t) => clamp((cumAt(t) - cumAt(WB[k])) / (cumAt(WB[k + 1]) - cumAt(WB[k])));
  const Pgrow = (t) => (qWave(0, t) + qWave(1, t) + qWave(2, t) + qWave(3, t) + qWave(4, t)) / 5;   // koko kasvu 0..1 (aallot 1-5)
  const bnd = S.segs.map((s) => s.a).filter((a) => a > WB[5] - 3 && a < tRet - 1);
  if (!bnd.length) throw new Error('muiston häipyminen: jaksoraja puuttuu');
  const FADE = bnd[bnd.length - 1];
  globalThis.__osa2 = { aallot: WB.slice(), fade: FADE, S };   // vianetsintä: window.__osa2

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
  // lähirannan reuna: tasainen penger x < -0.3, jyrkkä lasku veteen (olennot ja ritari ovat saman kuvan sisällä)
  flat(scene, poly([[-60, -14], [-60, 0], [-0.3, 0.05], [0.1, -0.9], [0.8, -2.8], [1.6, -4.6], [60, -4.6], [60, -14]]), ink(C.black, { grad: [C.blue, -0.4, -3.6, 0.9] }), { z: 0 });
  // haikaran portaat (kromaattinen nousu): neljä paalua (piiloon muiston ajaksi)
  const postMat = ink(C.black, { shade: C.blue, raster: 0.3 });
  // haikaran portaat: neljä paalua vedessä sorsan oikealla puolella (haikara keskirekisterissä, sorsa vedessä sen vasemmalla puolella): jokainen on edellistä korkeampi
  const POSTS = [[2.75, -1.4], [3.0, -1.0], [3.25, -0.6], [3.5, -0.2]];
  for (const [px, py] of POSTS) flat(scene, poly([[-0.1, -4.6], [-0.085, py], [0.085, py], [0.1, -4.6]]), postMat, { x: px, y: 0, z: PZ + 0.1 });
  const reedMat = ink(C.black);
  const reed = (x, y0, h, lean, z) => flat(scene, poly([[x - 0.05, y0], [x + 0.05, y0], [x + lean + 0.01, y0 + h], [x + lean - 0.01, y0 + h]]), reedMat, { z });
  for (let k = 0; k < 26; k++) reed(8.2 + k * 0.22 + 0.1 * hash1(k), 0, 1.6 + 1.8 * hash1(k + 1), 0.4 * (hash1(k + 2) - 0.5), 0.04);
  for (let k = 0; k < 40; k++) reed(2.0 + k * 0.5 + 0.3 * hash1(k + 9), -4.6, 1.2 + 1.6 * hash1(k + 3), 0.5 * (hash1(k + 4) - 0.5), 0.1);
  // Kuollut puu (D8, kierros 4): tavallinen paljas puu, ei harppua. Runko (hieman kaareva) ja kaksi haaraa:
  // vasen (B2, B2a, B4) ja oikea (B3, B3a, ja alhaalla oikealle kurottuva varisoksa B1, B1a). Oksat elävät sen mukaan,
  // mikä suolla soi (tyyliohje luku 18: tremolo = märkä reuna värisee): jousikanavan tasoitettu käyrä kääntää oksia
  // pienellä kulmalla (päälimmäinen oksa + lisäoksa yhteensä enintään 0,04 rad), oksittain eri taajuudella. Kanavan
  // ollessa alle kynnyksen puu on hiljaa. Runko ei liiku. Harput eivät soita Widersacher-jaksossa (partituuri).
  const tree = group(scene, { x: -6.5, y: 0, z: -0.6 });
  const treeMat = ink(C.black);
  const trunkPts = []; for (let i = 0; i <= 20; i++) { const u = i / 20; trunkPts.push([-0.6 * Math.sin(u * 2.4) + 0.3 * u, u * 6.4]); }
  flat(tree, strokeGeo(trunkPts, (u) => 0.55 - 0.41 * u), treeMat, {});
  const crSpline = (P, n = 8) => {   // Catmull-Rom: oksat kaareutuvat pehmeästi
    const out = [];
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
      for (let k = 0; k < n; k++) {
        const s = k / n, s2 = s * s, s3 = s2 * s;
        out.push([0, 1].map((d) => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * s + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * s2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * s3)));
      }
    }
    out.push(P[P.length - 1]);
    return out;
  };
  const treeLimbs = [];
  // oksa: kiertopiste (x, y) vanhemman koordinaatistossa, rel = rungon suuntainen piste-ketju kiertopisteestä
  const limb = (parent, x, y, rel, w0, w1, amp, lo, hi) => {
    const i = treeLimbs.length;
    const g = group(parent, { x, y, z: 0 });
    flat(g, strokeGeo(crSpline(rel), (u) => w1 + (w0 - w1) * Math.pow(1 - u, 1.4)), treeMat, {});
    const L = { g, amp, w: lo + (hi - lo) * hash1(i * 5 + 41), ph: 6.2832 * hash1(i * 7 + 13) };
    treeLimbs.push(L);
    return L;
  };
  // oikea haara: varisoksa B1 kantaa varikset (jalkojen korkeus mitattu stillistä: oksan pinta 0,4 aiempaa ylempänä),
  // sen päällä vähän aaltoileva, alla riippuva ja kärjessä pystyyn nouseva lisäoksa
  const B1 = limb(tree, -0.35, 3.3, [[0, 0], [0.95, 0.12], [1.95, 0.22], [2.95, 0.5], [3.95, 0.78], [4.7, 1.1]], 0.27, 0.06, 0.026, 5, 8);
  limb(B1.g, 1.6, 0.17, [[0, 0], [0.3, -0.45], [0.5, -1.05]], 0.1, 0.025, 0.014, 9, 14);
  limb(B1.g, 4.3, 0.95, [[0, 0], [0.12, 0.6], [-0.08, 1.25]], 0.07, 0.02, 0.014, 9, 14);
  const B3 = limb(tree, -0.4, 4.9, [[0, 0], [0.9, 0.5], [1.8, 0.8], [2.7, 1.45]], 0.2, 0.04, 0.026, 5, 8);
  limb(B3.g, 0.9, 0.5, [[0, 0], [0.2, 0.8], [0.0, 1.5]], 0.1, 0.03, 0.014, 9, 14);
  // vasen haara
  const B2 = limb(tree, -0.45, 4.2, [[0, 0], [-0.75, 0.4], [-1.55, 0.8], [-2.35, 1.5]], 0.22, 0.05, 0.026, 5, 8);
  limb(B2.g, -0.75, 0.4, [[0, 0], [-0.1, 0.9], [-0.4, 1.7]], 0.1, 0.03, 0.014, 9, 14);
  limb(tree, -0.2, 5.7, [[0, 0], [-0.7, 0.6], [-1.3, 1.2]], 0.15, 0.03, 0.036, 6, 9);
  const perch = treeLimbs[0];   // varisoksa: varikset seuraavat sen liikettä
  const perchX = -6.5 - 0.35;

  // --- muisto lammessa: aamun auringonnousu (loc_valley.js, kohtaus 1.3) ylösalaisin ---
  // Kuva on laakson aamun pieni vastine pystysuunnassa peilattuna lammen pintaan: sama vuoriviiva (ridgePts samoilla
  // parametreilla kuin laakson far3/far2/mid), harjanteen reuna (valleyRidge, tasanne), aurinko ja rivi viirejä.
  // Peilin akseli on kaukorannan alareuna (y 0,25): pinnan lähellä on harjanteen reuna viireineen, syvemmällä vuoret ja
  // alimpana aurinko. Kaikki on veden alla ja ritarin oikealla puolella (C5: ei hahmon päällä).
  const MY = 0.25, MCX = 7.0, SLAB = 0.42, ZX = 1.5, ZY = 1.0;   // peilin mittakaava: leveys 1,5 (aamun näkymä kattaa lammen), syvyys 1,15 (veden perspektiivi)
  const mem = group(scene, { x: MCX, y: MY - SLAB * ZY, z: PZ + 0.02 });
  mem.scale.set(ZX, -ZY, 1);                                        // dawn-koordinaatit: y ylös = syvemmälle veteen
  const lit = { noDim: true };
  const far3Mat = ink(C.paper, { shade: C.blue, raster: 0.9, ...lit });
  const far2Mat = ink(C.paper, { shade: C.blue, raster: 0.85, ...lit });
  const midMat = ink(C.blue, { shade: C.black, raster: 0.08, ...lit });
  const mistAMat = ink(C.paper, { shade: C.blue, raster: 0.2, ...lit });
  const mistBMat = ink(C.paper, { shade: C.blue, raster: 0.8, ...lit });
  const midRim = ink(C.paper, { ...lit });
  const slabMat = ink(C.black, { ...lit });
  const slabRim = ink(C.paper, { ...lit });
  const sunMat = ink(C.red, { shade: C.black, raster: 0.12, ...lit });
  const flagRed = ink(C.red, { shade: C.paper, raster: 0.1, ...lit });
  const flagPap = ink(C.paper, { shade: C.blue, raster: 0.12, ...lit });
  const flagLine = ink(C.black, { ...lit });
  const mastMat = ink(C.black, { ...lit });
  const PWL = -(MCX + 4) / ZX, PWR = 14 / ZX;                           // paneelin reunat (dawn-yksiköt, keskipiste MCX): vasen reuna rannan takana
  const BASE = -(SLAB + 0.2);                                      // peittyvä pohja (rannan takana)
  // vuorikerros: ridgePts(laakson parametrit) -> ryhmä, jonka mittakaava kuvaa laakson näkymän paneeliin (sx = paneeli / laakson yksikkö)
  const layer = (h, seed, lam, sx, vy, y0, mat, z, extra = null) => {
    const x0 = 2 + PWL / sx, x1 = 2 + PWR / sx;
    const pts = ridgePts(x0, x1, h, seed, { lambda: lam, n: Math.round((x1 - x0) / 0.35) });
    const g = group(mem, { x: -2 * sx, y: y0, z });
    g.scale.set(sx, sx * vy, 1);
    flat(g, skylineGeo(pts, (BASE - y0) / (sx * vy)), mat, {});
    if (extra) flat(g, strokeGeo(pts, extra.w / sx), extra.mat, { z: 0.002 });
    return g;
  };
  const MAXS = 1e-3;
  const far3G = layer(52, 3, 170, 0.0263, 0.6, 2.2, far3Mat, 0.006);
  const far2G = layer(40, 7, 90, 0.046, 0.45, 1.76, far2Mat, 0.012);
  const mistBG = group(mem, { x: 0, y: 1.15, z: 0.015 });
  flat(mistBG, rect(PWR - PWL, 0.36, 0, 0), mistBMat, { x: PWL });
  const midG = layer(22, 11, 48, 0.105, 2.3, -0.14, midMat, 0.02, { w: 0.07, mat: midRim });
  const mistAG = group(mem, { x: 0, y: -0.05, z: 0.03 });
  flat(mistAG, rect(PWR - PWL, 0.65, 0, 0), mistAMat, { x: PWL });
  // harjanteen reuna: tasanne (valleyRidge x 1 ± 14), musta laatta ja paperinen reunaviiva
  const edge = [];
  for (let x = PWL; x <= PWR; x += 0.1) edge.push([x, 0.35 * valleyRidge(1 + clamp(x, -4.4, 4.4) * 3.0)]);
  const slabG = group(mem, { z: 0.04 });
  flat(slabG, skylineGeo(edge, BASE), slabMat, {});
  flat(slabG, strokeGeo(edge, 0.05), slabRim, { z: 0.002 });
  // aurinko: laakson aurinko (r 93 px, 1920 px:n kuvassa) peilissä
  const SUNX = 0.9, SUNY = 3.3, SUNR = 0.56;
  const sunG = group(mem, { x: SUNX, y: SUNY, z: 0.002 });
  flat(sunG, circle(SUNR, 44), sunMat, {});
  // viirit: seitsemän toveria + sankari (laakson rivi), vaaleat ja punaiset vuorotellen, tuuli -x; paperiviireissä musta reuna
  const FLAGS = [-1.5, -1.05, -0.6, 0.0, 0.7, 1.15, 1.6, 2.05].map((x, i) => ({ x, hero: i === 3, red: i === 3 || i % 2 === 1 }));
  const flagGs = FLAGS.map((f, i) => {
    const H = f.hero ? 2.0 : 1.4 + 0.12 * hash1(i + 4), PL = f.hero ? 1.5 : 1.15, PWD = f.hero ? 0.5 : 0.42;
    const g = group(mem, { x: f.x, y: 0, z: 0.05 + 0.002 * i });
    const mast = group(g, {});
    flat(mast, rect(0.07, H, 0.5, 0), mastMat, {});
    const pen = group(g, { x: 0, y: H, z: 0.001 });
    const top = [], bot = [];
    for (let k = 0; k <= 10; k++) { const u = k / 10; const w = PWD * (1 - 0.88 * u) * 0.5, yy = 0.1 * Math.sin(u * 6.5 + i) * u; top.push([-PL * u, yy + w - 0.1]); bot.push([-PL * u, yy - w - 0.1]); }
    const shape = poly([...top, ...bot.reverse()]);
    flat(pen, shape, f.red ? flagRed : flagPap, {});
    if (!f.red) flat(pen, outline(shape, 0.045), flagLine, { z: 0.001 });
    return { g, mast, pen, H, i };
  });
  const setAppear = (mats, a) => { for (const m of mats) if (m.uniforms && m.uniforms.uAppear) m.uniforms.uAppear.value = a; };

  // --- ritari ---
  const L = leader(scene, {});
  const HX = -4.3;       // kuolleen puun juuri
  const HXS = -1.0;      // lammen ranta (polvistuminen)
  const HXT = -5.6;      // selkä puuhun (piiritys)
  const ridgeMates = Array.from({ length: 7 }, (_, i) => ({ P: knight(scene, { raster: 0.15 }), x: -1.5 + i * 2.3 }));

  // --- soitinolennot (critters_swamp.js: sama muoto kuin critters.js, viivat mitoitettu maailmaan) ---
  const Wc = common(S);
  const treeStr = Wc.smooth((t) => clamp(S.fam.strings(t)), 0.3);   // kuolleen puun oksien värähtely
  const env = { lows: Wc.lows, brass: Wc.smooth((t) => clamp(S.energy.brass(t)), 0.5), fl: Wc.smooth((t) => clamp(S.fam.winds(t) * 1.3), 0.5) };
  // koko = voimakkuus (tyyliohje luku 4, sääntö 13.5): jokaisen olennon koko on SCp * grow(oman soitinkanavan tasoitettu voimakkuus 0..1), grow = 0,67 (pp) .. 1 (ff), eli enintään
  // 1,5-kertainen. Suurin koko (ff) on taulukon arvo ritarin korkeuteen (1,9 yksikköä) nähden, suurin mitta: hyttynen 0,2 (siipineen ja pistimineen), sorsa 0,4, haikara 0,5 (korkeus,
  // hoikka), kotilo 0,33, sammakko 0,25, varis 0,3. FAR: kaukana vedessä (z -3,7) olevat (sorsa, haikara) näkyvät perspektiivissä n. 0,7-kertaisina, joten ne on suurennettu niin, että
  // kuvassa mittasuhde ritariin on sama kuin lähellä.
  const FAR = 1.4;
  const SCp = { mosq: 0.09, duck: 0.338 * FAR, heron: 0.278 * FAR, snail: 0.29, frog: 0.183, crow: 0.216 };
  const szW = Wc.smooth((t) => clamp(S.fam.winds(t) * 1.3), 1.2), szB = Wc.smooth((t) => clamp(S.fam.bass(t) * 1.6), 1.2), szT = Wc.smooth((t) => clamp(S.fam.tpt(t) * 1.2), 1.2);
  const grow = (v) => (1 + 0.5 * clamp(v)) / 1.5;   // 0,67 (pp) .. 1 (ff)
  const sizes = (t) => ({ mosq: SCp.mosq * grow(szW(t)), duck: SCp.duck * grow(szW(t)), heron: SCp.heron * grow(szW(t)), snail: SCp.snail * grow(szB(t)), frog: SCp.frog * grow(szB(t)), crow: SCp.crow * grow(szT(t)) });
  const SC = sizes(0);   // päivitetään joka ruudulla (update)
  const mosq = fluteMosquito(scene, SCp.mosq), duck = oboeDuck(scene, SCp.duck), heron = cAnglaisHeron(scene, SCp.heron);
  const snails = [tubaSnail(scene, SCp.snail), tubaSnail(scene, SCp.snail)];
  const frogs = [bassoonFrog(scene, SCp.frog), bassoonFrog(scene, SCp.frog)];
  const crows = [tromboneCrow(scene, SCp.crow), tromboneCrow(scene, SCp.crow), tromboneCrow(scene, SCp.crow)];
  const mirror = knight(scene, { thin: true, body: C.black, limb: C.black, line: C.black, cape: C.black });   // Quijote-peili
  const mirrorLance = flat(scene, poly([[-0.03, 0], [0.03, 0], [0.03, 3.6], [-0.03, 3.6]]), ink(C.black), { z: PZ + 0.02 });
  const stab = flat(scene, poly([[0, 0], [0.12, 0.5], [0.5, 0.5], [0.2, 0.8], [0.34, 1.3], [0, 0.95], [-0.34, 1.3], [-0.2, 0.8], [-0.5, 0.5], [-0.12, 0.5]]), ink(C.black), { z: 0.9 });
  const stamp = flat(scene, poly([[-1.1, 0.1], [-0.7, 0.9], [-0.1, 0.6], [0.4, 1.1], [0.9, 0.5], [1.2, -0.2], [0.5, -0.7], [-0.4, -0.5], [-0.9, -0.6]]), ink(C.black), { z: 0.9 });
  const splash = flat(scene, poly([[-1.2, 0], [-0.9, 1.3], [-0.5, 0.4], [-0.2, 1.8], [0.1, 0.5], [0.5, 1.5], [0.8, 0.3], [1.2, 1.0], [1.2, 0]]), ink(C.paper), { x: 1.0, y: -1.5, z: PZ + 0.15 });
  // tipat: jokaisesta olennosta seitsemän mustaa pisaraa, kun veto pyyhkäisee ohi
  const dropMat = ink(C.black);
  const mkDrops = () => Array.from({ length: 7 }, (_, k) => ({ m: flat(scene, circle(0.05 + 0.03 * hash1(k + 3), 12), dropMat, { z: 0.6 }), vx: (hash1(k + 11) - 0.3) * 0.9, vy: 0.3 + hash1(k + 21) * 0.6 }));
  const CR = { mosq, duck, heron, sn0: snails[0], sn1: snails[1], fr0: frogs[0], fr1: frogs[1], cw0: crows[0], cw1: crows[1], cw2: crows[2] };
  const drops = Object.fromEntries(Object.keys(CR).map((k) => [k, mkDrops()]));

  // veto suon yli (wid_voitto): alkaa viirin kärjestä, päättyy suon oikeaan reunaan
  const sweep = brushStroke(scene, 90, C.red, { wmin: 0.12, wmax: 0.75, hairW: 0.06, fs: 2.4, bleed: 0.06, dryLen: 0.2, lambda: 0.012, seed: 5, z: 0.8 });
  // lautasten isku: yksi mustan musteen läiskä iskun ruudulla (kohtaloisku, koko z:stä)
  const spl = splat(scene, 1, { color: C.black, life: 1.2 });
  // englannintorven vääristys (tulkinta): haikara piirtää ritarin punaisen vedon mustina pisteinä
  const dotMat = ink(C.black);
  const dots = Array.from({ length: 14 }, () => flat(scene, circle(0.09, 14), dotMat, { z: 0.5 }));
  const hitAge = (ta, life) => (t) => { const x = t - (ta - S.LEAD); return x >= -1e-6 && x < life ? x : -1; };
  const hitStab = hitAge(tMos, 0.8), hitStamp = hitAge(tCrow, 1.6);

  // --- olentojen läsnäolo (kierros 4, osa 2): olento on kuvassa vain, kun sen soitin soi ---
  // Soittimen kanava (S.fam.*, tasoitettu) kynnystetään hystereesillä ankkurien rajaamissa ikkunoissa. Ikkunan loppu on
  // ankkuri, jolla soitin vaihtuu tai vaikenee (ohjaus luku 2), joten kanavan nousu ikkunan ulkopuolella ei tuo olentoa
  // (kohina ja muut soittimet eivät riitä). Alle MERGE s:n aukot yhdistetään (fraasin tauko ei vie olentoa) ja liian lyhyet
  // välit pudotetaan. Tulo ja lähtö ovat yksi liike kumpikin (hyttynen lentää sisään ja pois, sorsa ui sisään ja sukeltaa,
  // haikara ja varikset laskeutuvat ja nousevat siivelle, kotilot ja sammakot tulevat ja menevät penkereen reunan yli veteen),
  // ei haalistumista eikä ilmestymistä kesken oton. Kun soitin vaikenee pitkäksi aikaa (muisto, molli), olento on poissa.
  const sw0 = tVoit - S.LEAD, sw1 = fr(tVoit, END, 0.55);
  const sweepP = (t) => clamp((t - sw0) / (sw1 - sw0));
  const sweepX = (t, x0) => mix(x0, 17, ease(sweepP(t)));
  const dissolve = (t, x) => smoothstep(x - 0.8, x + 1.2, sweepX(t, HX + 0.6)) * (t >= sw0 ? 1 : 0);   // veto hajottaa kuvassa olevat tipoiksi (olentojen lähtö wid_voitossa)

  const gW = Wc.smooth((t) => clamp(S.fam.winds(t)), 0.5);   // huilu, oboe, englannintorvi, klarinetti (puupuhaltimet)
  const gB = Wc.smooth((t) => clamp(S.fam.bass(t)), 0.5);    // matala: tuubat ja fagotit (kontrabasso-kanava; kohina ~0)
  const gT = Wc.smooth((t) => clamp(S.fam.tpt(t)), 0.4);     // pasuunat ja trumpetit
  const MERGE = 4.5;
  const soundIv = (gate, wins, on, off, minLen = 2.0) => {
    const raw = [];
    for (const [w0, w1, on2 = on, off2 = off] of wins) {   // ikkunalla voi olla oma kynnys
      let s0 = null;
      for (let t = w0; t <= w1 + 1e-9; t += 0.05) {
        const v = gate(t);
        if (s0 === null) { if (v >= on2) s0 = t; } else if (v < off2) { raw.push([s0, t]); s0 = null; }
      }
      if (s0 !== null) raw.push([s0, w1]);
    }
    const m = [];
    for (const iv of raw) { const l = m[m.length - 1]; if (l && iv[0] - l[1] < MERGE) l[1] = iv[1]; else m.push([iv[0], iv[1]]); }
    return m.filter(([a, b]) => b - a >= minLen);
  };
  // ikkunat: hyttynen = huilu (yksin 243 s, lähtee kun ritari huitaisee; palaa kuorossa ja piirityksessä); sorsa = oboe;
  // haikara = englannintorvi (pikkuhuilu 250); kotilot = tuubat (Dehring, kuoro, piiritys); sammakot = fagotit ff (262, kuoro, 2.7);
  // varikset = sordinoidut pasuunat (265,5 s, kuoro, piiritys ja ff-vasket ennen vetoa; viimeisellä ikkunalla korkea kynnys,
  // jotta torvien ja trumpettikanavan sekoittuminen 394-400 s ei tuo variksia)
  const LIFE = {
    mosq: { iv: soundIv(gW, [[tMos, fr(fr(tMos, tDuck, 0.3), fr(tMos, tDuck, 0.88), 0.45) + 0.05], [tChor, tAns], [tRet, tR20]], 0.3, 0.18, 1.5), ent: 0.9, pre: 0.85, ext: 1.4, dly: 0 },
    duck: { iv: soundIv(gW, [[tDuck, tMock - 0.8], [tChor, tAns], [tRet, tSnap]], 0.3, 0.18), ent: 1.8, pre: 0.8, ext: 1.3, dly: 0.2 },
    heron: { iv: soundIv(gW, [[tQ, tCrow], [tChor, tAns], [tRet, tSnap]], 0.3, 0.18), ent: 1.5, pre: 0.8, ext: 1.5, dly: 0.3 },
    snail: { iv: soundIv(gB, [[tToad, tCrick], [tChor, tAns], [tRet, tR20]], 0.18, 0.07), ent: 2.2, pre: 0.8, ext: 2.2, dly: 0.4 },
    frog: { iv: soundIv(gB, [[tMock, tCrow], [tChor, tAns], [tR20, tSnap]], 0.18, 0.07), ent: 1.0, pre: 0.6, ext: 0.9, dly: 0.5 },
    crow: { iv: soundIv(gT, [[tCrow, tAns], [tRet, tR20], [tSnap, sw0, 0.8, 0.3]], 0.35, 0.15, 1.5), ent: 1.3, pre: 0.8, ext: 1.5, dly: 0 },
  };
  globalThis.__osa2.iv = Object.fromEntries(Object.entries(LIFE).map(([k, v]) => [k, v.iv]));
  // olennon tila hetkellä t: on = kuvassa, en/ex = tulo- ja lähtöliikkeen eteneminen 0..1. Viimeinen väli ennen vetoa ei lähde
  // omin liikkein: veto hajottaa sen tipoiksi (dissolve).
  // extra = tulon porrastus, extraEx = lähdön porrastus (kierros 4b: kulkureitin päässä oleva lähtee ensin ja saapuu viimeisenä, jotta samaa reittiä kulkevat eivät mene toistensa päälle)
  const lifeAt = (key, t, extra = 0, extraEx = extra) => {
    const L = LIFE[key];
    for (const [a, b] of L.iv) {
      const t0 = a - L.pre + L.dly + extra, noExit = b >= sw0 - 1.2, t1 = noExit ? 1e9 : b + extraEx + L.ext;
      if (t < t0 || t > t1) continue;
      return { on: true, a, b, en: clamp((t - t0) / L.ent), ex: noExit ? 0 : clamp((t - b - extraEx) / L.ext) };
    }
    return { on: false, a: 0, b: 0, en: 0, ex: 0 };
  };
  const turnX = (p) => Math.cos(Math.PI * clamp(p));   // 1 -> -1: hahmo kääntyy sulavasti (ei yhden ruudun peilausta)
  const snd = (iv, t) => iv.reduce((m, [a, b]) => Math.max(m, smoothstep(a - 0.2, a + 0.4, t) * (1 - smoothstep(b - 0.3, b + 0.5, t))), 0);
  // ele = oman soitinryhmän tasoitettu verhokäyrä (ei nuotinalku), vain soidessa
  const chor = (t) => smoothstep(tChor - 0.5, tChor + 1, t) * (1 - smoothstep(tAns - 1, tAns + 2, t));   // kuoro: sameus sakenee
  const G = {
    mosq: (t) => clamp(env.fl(t) * snd(LIFE.mosq.iv, t)),
    duck: (t) => clamp(env.fl(t) * snd(LIFE.duck.iv, t)),
    heron: (t) => clamp(env.fl(t) * snd(LIFE.heron.iv, t)),
    snail: (t) => clamp(1.6 * gB(t) * snd(LIFE.snail.iv, t)),
    frog: (t) => clamp(1.7 * gB(t) * snd(LIFE.frog.iv, t)),
    crow: (t) => clamp(1.2 * gT(t) * snd(LIFE.crow.iv, t)),
  };
  // haikaran portaat: kromaattinen nousu etenee englannintorven (puupuhaltimien) kertymän mukaan laskeutumisen jälkeen
  const cumTab = (fn, a, b) => { const n = Math.round((b - a) * 30) + 1, arr = new Float32Array(n); let acc = 0; for (let i = 0; i < n; i++) { acc += Math.max(fn(a + i / 30), 0.05) / 30; arr[i] = acc; } return (t) => { const f = clamp((t - a) * 30, 0, n - 1.001), i = Math.floor(f); return (arr[i] + (arr[i + 1] - arr[i]) * (f - i)) / arr[n - 1]; }; };
  const tStairs1 = tToad + 2.0;
  const stairP = cumTab(env.fl, tQ + 1.4, tStairs1);

  // --- paikat: asemat (ST) ja piiritys (RING), mittakaava ritariin (2,0) nähden ---
  // Ritari istuu x = HX (piiritys: HXT). Olennot ovat täpliä ja jokaisella soittimella on oma korkeutensa (kuvasääntö 7: pystysuunta on rekisteri):
  // hyttynen (huilu) taivaalla, sorsa ja haikara (oboe, englannintorvi) keskellä vedessä ja paalulla, kotilot (tuubat) penkereen reunalla ja sammakot (fagotit)
  // penkereen alarinteellä. Kotilot ja sammakot tulevat ja menevät penkereen reunan (SLOPE) yli veden puolelta; rinteellä istuvat sammakot ovat kotiloiden alla.
  // Dehring: kaksi kotiloa rinnakkain, pystyetäisyys aina DEHRING_V (kvintti), ylempi vasemmalla penkereen reunalla, alempi rinteellä.
  const DEHRING_V = 0.6;
  const slopeX = (y) => (y > -0.9 ? -0.3 + 0.4 * (0.05 - y) / 0.95 : 0.1 + 0.7 * (-0.9 - y) / 1.9);   // penkereen reunan x korkeudella y
  const ST = { mosq: [HX + 1.5, 1.95], duck: [1.5, -0.5], heron: POSTS[0], mirror: [1.7, MY], snails: [[-1.7, 0.05], [slopeX(0.05 - DEHRING_V), 0.05 - DEHRING_V]], frogs: [[slopeX(-1.05) + 0.1, -1.05], [slopeX(-1.5) + 0.1, -1.5]], crows: [[-5.5, 3.0], [-4.5, 3.0], [-3.5, 3.0]] };
  const RING = { mosq: [-1.0, 3.7], duck: [1.9, -0.5], heron: POSTS[2], crows: [[-4.0, 2.4], [-2.7, 3.3], [-1.4, 2.3]] };
  // varisoksan pinta (limb B1: tyvi (-6,85; 3,3), keskilinjan pisteet (rel) + puoli paksuutta): olento seisoo pinnalla, jalat y -0,5 * mittakaava
  const perchRel = [[0, 0], [0.95, 0.12], [1.95, 0.22], [2.95, 0.5], [3.95, 0.78], [4.7, 1.1]];
  const perchSurf = (x) => { const o = clamp(x - perchX, 0, 4.7); for (let i = 0; i < 5; i++) if (o <= perchRel[i + 1][0]) return 3.39 + perchRel[i][1] + (perchRel[i + 1][1] - perchRel[i][1]) * (o - perchRel[i][0]) / (perchRel[i + 1][0] - perchRel[i][0]); return 3.39 + 1.1; };
  ST.crows = ST.crows.map(([x]) => [x, perchSurf(x)]);
  const RING2 = { duck: [4.3, -0.4], heron: [5.7, -0.2] };   // 2.7: kamera katsoo vasemmalta oikealle ylitse penkereen, joten sorsa ui kauempana oikealla (ei penkereen takana)
  const ph1 = (t) => t >= tRet - 1.0;   // piiritys: lentäjät asettuvat ritarin ympärille (RING), muuten asemilleen (ST)
  const ringK = (t) => smoothstep(tRet - 1.0, tRet + 1.0, t) * (1 - ramp(tSnap, tVoit, t));
  // penkereen reuna (sama kuin lähirannan polygonissa): kotilot ryömivät ja sammakot hyppäävät sen yli
  const SLOPE = [[1.9, -5.3], [1.6, -4.6], [0.8, -2.8], [0.1, -0.9], [-0.3, 0.05]];
  const pathPt = (st, u) => {
    // reitti veden puolelta rinnettä pitkin paikalleen: rinteellä istuva (st y < -0,2) pysähtyy sen kohtaan, penkereen reunalla oleva kulkee reunan yli
    const P = st[1] < -0.2 ? [...SLOPE.filter((q) => q[1] < st[1] - 0.1), st] : [...SLOPE, st];
    let len = 0; const seg = [];
    for (let i = 0; i < P.length - 1; i++) { const l = Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]); seg.push(l); len += l; }
    let d = clamp(u) * len;
    for (let i = 0; i < seg.length; i++) {
      if (d <= seg[i] || i === seg.length - 1) {
        const f = clamp(d / seg[i]);
        return { x: P[i][0] + (P[i + 1][0] - P[i][0]) * f, y: P[i][1] + (P[i + 1][1] - P[i][1]) * f, tx: (P[i + 1][0] - P[i][0]) / seg[i], ty: (P[i + 1][1] - P[i][1]) / seg[i] };
      }
      d -= seg[i];
    }
  };



  // --- kamera: jokaisessa otossa ritari ja olento samassa rajauksessa ---
  const HF = Math.tan((20 * Math.PI) / 180);   // puolikorkeus / etäisyys, kun fov 40
  // frame(f, bot, d, hx): ritari (x = hx) on kuvan vaakaosuudella f, alareuna bot, etäisyys d
  const frame = (f, bot, d, drift = 0.5, dx = 0.5, dy = 0.4, hx = HX) => {
    const cx = hx + (0.5 - f) * 2 * d * HF * (16 / 9), cy = bot + d * HF;
    return camPath([{ pos: [cx + dx, cy + dy, d], look: [cx, cy, 0], fov: 40 }, { pos: [cx + dx * 0.5, cy + dy, d - drift], look: [cx, cy + 0.05, 0], fov: 40 }]);
  };
  const wide = frame(0.4, -1.4, 13.5, 1.2, -0.6, 0.3);
  const shots = [
    { name: '2.1a laskeutuu suolle', a: A, b: tMos - S.LEAD, cam: wide },
    { name: '2.1b pisto: hyttynen ja ritari', a: tMos - S.LEAD, b: tDuck - S.LEAD, cam: frame(0.62, -0.7, 4.8, 0.4, 0.5, 0.4) },
    { name: '2.2a sorsa (oboe)', a: tDuck - S.LEAD, b: tQ - S.LEAD, cam: frame(0.2, -2.3, 7.0, 0.5) },
    { name: '2.2b haikara (englannintorvi)', a: tQ - S.LEAD, b: tToad - S.LEAD, cam: frame(0.2, -3.0, 9.0, 0.6) },
    { name: '2.2c kotilot (Dehring)', a: tToad - S.LEAD, b: tCrick - S.LEAD, cam: frame(0.17, -1.3, 6.4, 0.5, 0.4, 0.4) },
    { name: '2.2d sorsa kiihtyy', a: tCrick - S.LEAD, b: tMock - S.LEAD, cam: frame(0.2, -2.3, 7.0, 0.5, -0.5, 0.5) },
    { name: '2.2e peili ja sammakot', a: tMock - S.LEAD, b: tCrow - S.LEAD, cam: frame(0.2, -2.6, 7.2, 0.5, 0.5, 0.5) },
    { name: '2.2f varikset kuolleessa puussa', a: tCrow - S.LEAD, b: tChor - S.LEAD, cam: frame(0.4, -0.7, 7.5, 0.5, 0.6, 0.4) },
    { name: '2.3 kuoro: sameus sakenee', a: tChor - S.LEAD, b: tAns - S.LEAD, cam: frame(0.28, -2.15, 9.4, 0.15, 0.4, 0.4) },
    { name: '2.4a molli: kypärä alas', a: tAns - S.LEAD, b: tR16 - S.LEAD, cam: frame(0.5, -0.8, 4.6, 0.3, 0.8, 0.3, HX + 0.4) },
    { name: '2.4b hiljaa, ei olentoja', a: tR16 - S.LEAD, b: tNight - S.LEAD, cam: frame(0.3, -2.0, 9.4, 0.8, -0.2, 0.4) },
  ];
  // muiston kolme ottoa (ohjaus 2.5: lampi, kasvot ja lampi, laaja) jousiaaltojen rajoissa; sommitelma vaihtuu joka otossa
  shots.push(
    { name: '2.5a lampi: harjanne ja vuoret nousevat', a: tNight - S.LEAD, b: WB[2] - S.LEAD, cam: frame(0.38, -4.5, 10.8, 0.9, -0.8, 0.5, HXS) },
    { name: '2.5b kasvot ja lampi: aurinko', a: WB[2] - S.LEAD, b: WB[4] - S.LEAD, cam: frame(0.3, -3.3, 8.4, 0.5, -0.7, 0.3, HXS) },
    { name: '2.5c laaja: viirit, hän tarttuu viiriin', a: WB[4] - S.LEAD, b: FADE - S.LEAD, cam: frame(0.17, -5.0, 13.6, 0.7, 0.9, 0.2, HXS) },
    { name: '2.5d muisto häipyy, ritari kävelee puulle', a: FADE - S.LEAD, b: tRet - S.LEAD, cam: frame(0.5, -1.8, 10.0, 0.8, -0.2, 0.4, -3.3) },
    { name: '2.6 piiritys', a: tRet - S.LEAD, b: tR20 - S.LEAD, cam: frame(0.3, -1.3, 8.4, 0.4, -0.4, 0.8, HXT) },
    { name: '2.7 toverit harjanteella', a: tR20 - S.LEAD, b: tSnap - S.LEAD, cam: camPath([{ pos: [-8.6, 1.2, 8.5], look: [-0.5, 1.5, -2], fov: 46 }, { pos: [-8.0, 1.0, 7.8], look: [-0.2, 1.7, -2], fov: 46 }]) },
    { name: '2.8a viiri pystyyn', a: tSnap - S.LEAD, b: tVoit - S.LEAD, cam: frame(0.42, -0.9, 9.6, 1.4, 1.2, 0.2, HXT) },
    { name: '2.8b veto suon yli', a: tVoit - S.LEAD, b: END + 1, cam: camPath([{ pos: [-3.0, 0.3, 9.5], look: [-1.0, 1.8, 0], fov: 42 }, { pos: [0.5, 2.2, 15], look: [1.5, 1.8, 0], fov: 42 }, { pos: [2.0, 3.0, 21], look: [2.0, 1.8, 0], fov: 44 }]) },
  );
  shots.sort((a, b) => a.a - b.a);

  // --- sankarin teko: pose ajan funktiona (ankkureiden osuuksia, ei kovakoodattuja sekunteja) ---
  // Asento on avainlista, jonka kukin avain sekoittuu edelliseen smoothstepillä [t0, t0+dur] ("fold"): jokainen painokerroin
  // on jatkuva ajassa, joten asento ei hyppää yhdessäkään ruudussa (poseskan: ei hyppyjä). Avain voi olla asento tai
  // funktio (t) -> asento; neljäs alkio on valinnainen painokerroin.
  const kpose = (o) => ({ ...KP.sit, ...o });
  const foldP = (keys, t) => {
    let s = typeof keys[0][1] === 'function' ? keys[0][1](t) : keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t0, v, dur, amp] = keys[i];
      if (t <= t0) break;
      let u = ease((t - t0) / Math.max(dur, 1e-3));
      if (amp !== undefined) u *= typeof amp === 'function' ? amp(t) : amp;
      if (u > 0) s = kmix(s, typeof v === 'function' ? v(t) : v, u);
    }
    return s;
  };
  const foldN = (keys, t, v0) => {
    let s = v0;
    for (const [t0, v, dur] of keys) {
      if (t <= t0) break;
      const u = ease((t - t0) / Math.max(dur, 1e-3));
      s = s + ((typeof v === 'function' ? v(t) : v) - s) * u;
    }
    return s;
  };
  const checkAsc = (name, keys) => { for (let i = 1; i < keys.length; i++) if (!(keys[i][0] >= keys[i - 1][0])) throw new Error(`loc_swamp ${name}: avaimet eivät ole aikajärjestyksessä (${i})`); };

  const tWalk1 = fr(A, tMos, 0.85);                           // istuutuu, kun huilu on tulossa
  const tSwat0 = fr(tMos, tDuck, 0.3), tSwat1 = fr(tMos, tDuck, 0.88), swM = fr(tSwat0, tSwat1, 0.45);
  const tTurn0 = fr(tDuck, tQ, 0.12), tTurn1 = fr(tDuck, tQ, 0.42);   // selkä sorsalle
  const tBack0 = fr(tDuck, tQ, 0.78), tBack1 = fr(tQ, tToad, 0.5);    // takaisin, nousee puoliksi
  const tEar0 = fr(tToad, tCrick, 0.1), tEar1 = fr(tToad, tCrick, 0.9), earM = fr(tEar0, tEar1, 0.2);   // käsi korvalle
  const tRiseM0 = fr(tCrick, tMock, 0.5), tRiseM1 = fr(tMock, tCrow, 0.45);   // katsoo peiliin
  const tHide0 = fr(tCrow, tChor, 0.1), tHide1 = fr(tCrow, tChor, 0.9);      // viiri suojaan
  const tTry1 = [fr(tChor, tAns, 0.1), fr(tChor, tAns, 0.28), fr(tChor, tAns, 0.46)];
  const tTry2 = [fr(tChor, tAns, 0.54), fr(tChor, tAns, 0.66), fr(tChor, tAns, 0.8)];
  const tUp1 = fr(FADE, tRet, 0.3), tWk1 = fr(FADE, tRet, 0.92);
  const tLook1 = fr(tR20, tSplash2, 0.85);
  const swV = fr(tVoit, END, 0.25), swE = fr(tVoit, END, 0.9), swM2 = swV;
  const hornSm = (t) => smoothstep(0.3, 0.75, S.energy.horns(t));
  const upSnap = (t) => ramp(tSnap - LEAD, fr(tSnap, tVoit, 0.3), t);
  const X0 = HX - 0.9;

  const xK = [[A, HX, tWalk1 - A], [tNight, HXS, WB[1] - tNight], [tUp1, HXT, tWk1 - tUp1]];
  const xAt = (t) => foldN(xK, t, X0);
  const walkAt = (t) => { const c = Math.abs(xAt(t) - X0) / 1.4; return POSES.kavely(c - Math.floor(c)); };
  const sitTilt = (t) => -0.5 + 0.12 * Math.sin(t * 0.6);
  const SIT = (t) => kpose({ tilt: sitTilt(t) });
  const SWP = kpose({ aN: 1.5, eN: 1.5, tilt: 0.1, lean: 0.2 });
  const AW = kpose({ tilt: -0.75, lean: 0.4 });
  const HALF = kmix(kpose({ tilt: -0.5, lean: 0.35 }), { ...kmix(KP.sit, KP.stand, 0.55), tilt: 0.25, lean: 0.22 }, 0.8);
  const REST = kpose({ tilt: -0.3, lean: 0.25 });
  const EAR = kpose({ aN: 2.5, eN: 2.45, tilt: -0.85, lean: 0.4 });
  const MIR = { ...KP.look, hN: 1.2, kN: 1.5, hF: 1.1, kF: 1.6, lean: 0.12 };
  const HIDE = kpose({ tilt: -0.9, lean: 0.5 });
  const PLANTD = kmix(KP.sit, KP.plant, 1);
  const TRY1 = { ...kmix(HIDE, PLANTD, 0.8), tilt: 0.1 }, TRY2 = { ...kmix(HIDE, PLANTD, 0.56), tilt: mix(-0.9, 0.1, 0.7) };
  const brSm = (t) => smoothstep(tAns, tR16, t);
  const MOLLI = (t) => kpose({ tilt: -0.95 + 0.05 * (0.5 + 0.5 * Math.sin(t * 0.9)) * brSm(t), lean: 0.5 });
  // muisto: kävelee rantaan pää painuksissa, polvistuu, nostaa päätään jousikanavan kertymän mukaan, tarttuu viiriin
  const head = (t) => mix(-0.85, 0.25, ease(Pgrow(t)));
  const WALKM = (t) => ({ ...walkAt(t), tilt: -0.75, lean: 0.2 });
  const KNEELH = (t) => ({ ...KP.kneel, tilt: head(t) });
  const GRABH = (t) => ({ ...KP.kneel, tilt: head(t), aN: 1.2, eN: 0.7 });
  const LOOK70 = kmix(KP.proud, KP.look, 0.7);
  const SWEEPP = kmix(KP.lanceBoth, KP.plant, 0.5);
  const tKneel0 = fr(tNight, WB[1], 0.88), tKneel1 = fr(WB[1], WB[2], 0.5);

  const poseK = [
    [A, walkAt, 0], [tWalk1, SIT, tMos - tWalk1],
    [tSwat0, SWP, swM - tSwat0], [swM, SIT, tSwat1 - swM],
    [tTurn0, AW, tTurn1 - tTurn0],
    [tBack0, HALF, tBack1 - tBack0], [tBack1, REST, tEar0 - tBack1],
    [tEar0, EAR, earM - tEar0], [earM, REST, tEar1 - earM],
    [tRiseM0, MIR, tRiseM1 - tRiseM0],
    [tHide0, HIDE, tHide1 - tHide0],
    [tTry1[0], TRY1, tTry1[1] - tTry1[0]], [tTry1[1], HIDE, tTry1[2] - tTry1[1]],
    [tTry2[0], TRY2, tTry2[1] - tTry2[0]], [tTry2[1], HIDE, tTry2[2] - tTry2[1]],
    [tAns - LEAD, MOLLI, fr(tAns, tR16, 0.5) - (tAns - LEAD)],
    [tNight, WALKM, 0.35 * (WB[1] - tNight)],
    [tKneel0, KNEELH, tKneel1 - tKneel0],
    [WB[5], GRABH, FADE - WB[5]],
    [FADE, KP.stand, tUp1 - FADE],
    [tUp1, walkAt, tWk1 - tUp1], [tWk1, KP.proud, tRet - tWk1],
    [tR20, LOOK70, tLook1 - tR20],
    [tSplash2, KP.call, tSnap - tSplash2, (t) => (0.55 + 0.45 * hornSm(t)) * (1 - upSnap(t))],
    [tSnap - LEAD, KP.lanceBoth, fr(tSnap, tVoit, 0.3) - (tSnap - LEAD)],
    [tVoit - LEAD, SWEEPP, swM2 - (tVoit - LEAD)], [swM2, KP.lanceBoth, swE - swM2],
  ];
  const laK = [
    [tWalk1, -0.38, tMos - tWalk1],
    [tSwat0, 1.25, swM - tSwat0], [swM, -0.38, tSwat1 - swM],
    [tTurn0, -0.2, tTurn1 - tTurn0], [tBack0, -0.25, tBack1 - tBack0],
    [tEar0, 0.12, earM - tEar0], [earM, -0.25, tEar1 - earM],
    [tRiseM0, -0.05, tRiseM1 - tRiseM0],
    [tHide0, -1.9, tHide1 - tHide0],
    [tTry1[0], -0.6, tTry1[1] - tTry1[0]], [tTry1[1], -1.9, tTry1[2] - tTry1[1]],
    [tTry2[0], mix(-1.9, -0.6, 0.7), tTry2[1] - tTry2[0]], [tTry2[1], -1.9, tTry2[2] - tTry2[1]],
    [tNight, -0.3, 0.3 * (WB[1] - tNight)],
    [WB[5], 0.08, FADE - WB[5]],
    [tUp1, 0.04, tWk1 - tUp1],
    [tR20, -0.18, tLook1 - tR20],
    [tSnap - LEAD, -0.18, fr(tSnap, tVoit, 0.3) - (tSnap - LEAD)],
    [tVoit - LEAD, 1.35, swM2 - (tVoit - LEAD)], [swM2, 0.0, swE - swM2],
  ];
  const wdK = [
    [tHide0, 0.25, tHide1 - tHide0],
    [tTry1[0], 0.4, tTry1[1] - tTry1[0]], [tTry1[1], 0.25, tTry1[2] - tTry1[1]],
    [tTry2[0], mix(0.25, 0.4, 0.7), tTry2[1] - tTry2[0]], [tTry2[1], 0.25, tTry2[2] - tTry2[1]],
    [tAns - LEAD, 0.55, fr(tAns, tR16, 0.5) - (tAns - LEAD)],
    [WB[5], 0.6, FADE - WB[5]], [FADE, 0.55, tUp1 - FADE],
    [tSnap - LEAD, 0.6, fr(tSnap, tVoit, 0.3) - (tSnap - LEAD)],
  ];
  const awK = [[tTurn0, 1, tTurn1 - tTurn0], [tBack0, 0, tBack1 - tBack0], [tUp1, 1, 0.25 * (tWk1 - tUp1)], [fr(tUp1, tWk1, 0.7), 0, 0.25 * (tWk1 - tUp1)]];
  checkAsc('poseK', poseK); checkAsc('laK', laK); checkAsc('wdK', wdK); checkAsc('awK', awK);
  const swVal = (t) => bump(tVoit - LEAD, swV, swE, t);
  const widthExtra = (t) => (t <= tSnap - LEAD ? 0 : mix(0.7 * hornSm(t) * upSnap(t), 0.5 * (1 - swVal(t)), ramp(tVoit - LEAD, fr(tVoit, END, 0.1), t)));

  function heroState(t) {
    const aw = foldN(awK, t, 0);
    let pose = foldP(poseK, t);
    pose = { ...pose, sx: Math.max(0.12, Math.abs(1 - 2 * aw)), mounted: false };
    const facing = aw > 0.5 ? -1 : 1;
    const lanceAng = foldN(laK, t, 0.1);
    const br = 0.5 + 0.5 * Math.sin(t * 0.9);
    const width = foldN(wdK, t, 0.55) * (1 + 0.12 * br * brSm(t) * (1 - smoothstep(fr(tR16, tNight, 0.9), tNight, t)) + widthExtra(t));
    return { x: xAt(t), y: 0.05, z: 0.1, facing, pose, lanceAng: lanceAng * facing, width };
  }
  const windAt = (t) => ({ x: -(0.3 + 2.0 * S.energy.violins(t) + (t > tSnap ? 3 : 0)), y: -0.6 + 1.5 * S.energy.violins(t) + (t > tSnap ? 1.6 : 0) });

  const memFade = (t) => 1 - ramp(FADE, fr(FADE, tRet, 0.96), t);
  const memOn = (t) => smoothstep(tNight, fr(tNight, WB[1], 0.1), t) * memFade(t);

  const st = {};   // viimeisin tila probea varten
  function update(t) {
    Object.assign(SC, sizes(t));   // koko = oman soitinkanavan voimakkuus (puhdas ajan funktio)
    const u = SKY.u;
    u.uTime.value = t;
    const night = ramp(tNight, fr(tNight, WB[1], 0.8), t) * (1 - ramp(tRet, fr(tRet, tR20, 0.3), t));
    const snap = smoothstep(tSnap - S.LEAD, tSnap + 2, t);
    const evening = ramp(tVoit, END, t);
    u.uBlueAmt.value = mix(0.5, 1.0, night) * (1 - 0.4 * evening);
    u.uBlueH.value = mix(0.6, -0.2, night);
    u.uRedAmt.value = mix(0.75, 0.05, night) + 0.5 * snap + 0.6 * evening;
    u.uBlackTop.value = mix(0.3, 0.5, night) * (1 - 0.7 * evening);
    const vis = (k) => { const lf = lifeAt(k, t); return lf.on ? ease(lf.en) * (1 - ease(lf.ex)) : 0; };
    const crit = (vis('mosq') + vis('duck') + vis('heron') + vis('snail') + vis('frog') + vis('crow')) / 6;
    const chorus = chor(t);
    // sameus: musta rasteriusva sakenee olentojen mukana ja väistyy voitossa
    const murk = (0.15 + 0.5 * crit + 0.3 * chorus) * (1 - night) * (1 - 0.6 * snap) * (1 - dissolveAll(t));
    u.uMurk.value = murk;
    u.uMoon.value.set(60, 30, 14, 0);
    u.uSun.value.w = 0;
    u.uRays.value = 0;

    // --- muisto lammessa: kasvu aalto aallolta (jousikanavan kertymä), kuva häipyy FADE:sta ---
    const q = [0, 1, 2, 3, 4].map((k) => qWave(k, t));
    const mf = memFade(t), mon = memOn(t);
    mem.visible = mon > 0.002;
    const ap = (g) => clamp(g * 1.5) * mf;                          // halftone-sisäänpainuminen kasvun alkuvaiheessa
    // aalto 1: harjanne = lähivuori + reuna (kasvavat rannasta syvyyteen)
    setAppear([slabMat, slabRim, mistAMat], ap(q[0]));
    slabG.scale.y = Math.max(MAXS, q[0]);
    mistAG.scale.y = Math.max(MAXS, q[0]);
    // aalto 2: tumma vuorimassa (huiput alaspäin)
    setAppear([midMat, midRim], ap(q[1]));
    midG.scale.y = 0.105 * 2.3 * Math.max(MAXS, q[1]);
    far3G.visible = false; far2G.visible = false; mistBG.visible = false;   // takavuoret pois: vain tumma vuorimassa (huiput alaspäin) luetaan vuoreksi
    // aalto 3: aurinko nousee vuorten takaa (peilissä laskeutuu alas)
    setAppear([sunMat], ap(q[2]));
    sunG.position.y = mix(0.55, SUNY, ease(q[2]));
    { const sc = Math.max(MAXS, smoothstep(0, 0.35, q[2])); sunG.scale.set(sc * ZY / ZX, sc, 1); }   // pyöreä vaikka peili on leveämpi kuin syvä
    // aallot 4 ja 5: viirit (vasen ryhmä, oikea ryhmä); keihäs kasvaa ensin, viiri avautuu sen jälkeen
    setAppear([flagRed, flagPap, mastMat], ap(Math.max(q[3], q[4])));
    flagGs.forEach((f) => {
      const g = FLAGS[f.i].x < 0.3 ? q[3] : q[4];
      f.mast.scale.y = Math.max(MAXS, smoothstep(0, 0.55, g));
      f.pen.position.y = f.H * Math.max(MAXS, smoothstep(0, 0.55, g));
      f.pen.scale.x = Math.max(MAXS, smoothstep(0.35, 1, g));
      f.g.visible = g > 0.001;
      f.pen.rotation.z = 0.06 * Math.sin(t * 1.3 + f.i * 0.9) * (0.4 + 0.6 * S.energy.violins(t));   // vesi huojuttaa
    });
    // ritari ja viiri: tumma rasteri vaalenee aalto kerrallaan (Pgrow kasvaa vain soidessa)
    const mg = Pgrow(t);

    pond.u.uTime.value = t;
    pond.u.uGlint.value = 0.55 + 0.3 * treeStr(t) + 0.4 * night;   // jousien käyrä (ei harppu: harput eivät soita tässä jaksossa)
    pond.rings.forEach((r) => r.set(0, 0, -99, 0));
    let rk = 0;
    // puun oksat: jousikanavan tasoitettu käyrä (~0,3 s) kynnyksen yli -> pieni kulma, oksittain oma taajuus ja vaihe
    const tk = smoothstep(0.12, 0.4, treeStr(t));
    treeLimbs.forEach((l) => { l.g.rotation.z = l.amp * tk * Math.sin(t * l.w + l.ph); });
    const postK = 1 - smoothstep(tNight, fr(tNight, WB[1], 0.2), t) * (1 - smoothstep(fr(FADE, tRet, 0.8), fr(tRet, tR20, 0.1), t));   // paalut väistyvät peilin tieltä
    setAppear([postMat], clamp(postK));
    const hs = heroState(t);
    L.place(t, heroState, windAt, { capeWind: 0.2 + S.energy.violins(t), width: hs.width });
    const darkMinor = smoothstep(tAns - S.LEAD, tAns + 1.5, t);
    const restore = t > tNight ? 0.9 * mg : 0;
    const dark = 0.55 * darkMinor * (1 - restore) * (1 - snap);
    st.dark = dark;
    for (const m of [L.P.M.body, L.P.M.tunic, L.bannerMat]) m.uniforms.uRaster.value = dark;
    ridgeMates.forEach((m, i) => {
      const gap = (tSplash2 - tR20) * 0.06, rise = (tSplash2 - tR20) * 0.34;
      const r = smoothstep(tR20 - S.LEAD + i * gap, tR20 - S.LEAD + i * gap + rise, t);
      m.P.root.visible = r > 0.01;
      m.P.root.position.set(m.x, 0.8 - 2.6 * (1 - r), PZ - 0.4);
      for (const mm of m.P.mats || []) if (mm.uniforms?.uRaster) mm.uniforms.uRaster.value = 0.5 * (1 - snap);
      poseKnight(m.P, kmix(KP.proud, KP.call, smoothstep(0.3, 0.7, S.energy.horns(t))), t, 0.4);
    });

    const gm = G.mosq(t), gd = G.duck(t), gh = G.heron(t), gs = G.snail(t), gf = G.frog(t), gc = G.crow(t);
    st.gm = gm; st.gd = gd; st.gh = gh; st.gs = gs; st.gf = gf; st.gc = gc;
    const rgk = ph1(t) && t < tSnap ? 1 : 0;   // piiritys vain 2.6-2.7; vetoa edeltävät varikset istuvat oksalla
    // dissolve-pisarat
    const dropsFor = (key, cx, cy, d) => {
      drops[key].forEach((p) => {
        const a = d > 0.04 && d < 0.98;
        p.m.visible = a;
        if (a) {
          const f = (d - 0.04) / 0.94;
          p.m.position.set(cx + p.vx * f * 1.2, Math.max(-4.2, cy + 0.2 + p.vy * f - 3.2 * f * f), 0.6);
          p.m.scale.setScalar(1 - 0.7 * f);
        }
      });
    };
    // huiluhyttynen (ele: siipien ja pistimen lyönti = huilun verhokäyrä): lentää sisään oikealta, pistää, lentää pois kun ritari huitaisee
    { const lf = lifeAt('mosq', t), dd = dissolve(t, ST.mosq[0]);
      const home = lf.a >= tChor - 1 ? RING.mosq : ST.mosq;   // pisto ritarin korvalla vain ensimmäisellä kerralla
      mosq.root.visible = lf.on && dd < 0.999;
      let fly = 0;
      if (lf.on) {
        const en = ease(lf.en), ex = ease(lf.ex), e1 = 1 - en;
        const sw = bump(tSwat0, swM, tSwat1, t);
        fly = Math.min(1, e1 * 1.5 + ex * 1.5);
        mosq.root.position.set(home[0] + 0.15 * Math.sin(t * 0.8) + 13 * e1 + 15 * ex, home[1] + 0.1 * Math.sin(t * 1.3) - 0.15 * sw + 5 * e1 * e1 + 7 * ex * ex + 0.3 * Math.sin(t * 7) * (e1 + ex), 0.3);
        mosq.root.scale.set(-SC.mosq * turnX(smoothstep(0, 0.3, lf.ex)), SC.mosq, 1);
      }
      setAppear(mosq.mats, 1 - dd);
      mosq.pose(gm, t);
      const f = Math.sin(t * Math.PI * 4.5), wa = Math.max(gm, fly);
      mosq.wN.rotation.z = 0.5 * f * wa; mosq.wF.rotation.z = -0.5 * f * wa;   // siivet lyövät vain huilun soidessa ja lentäessä
      mosq.needle.position.x = 1.03 + 0.55 * gm;                                // piikki = huilun taso
      const hsd = hitStab(t);
      stab.visible = hsd >= 0;
      if (hsd >= 0) { stab.position.set(ST.mosq[0] - 0.6, ST.mosq[1] - 0.05, 0.9); stab.rotation.z = Math.PI * 0.55; stab.scale.setScalar(0.2 + 0.15 * Math.min(1, hsd / 0.1)); }
      dropsFor('mosq', home[0], home[1], dd); }
    // oboesorsa vedessä (ele: nokan avautuminen = oboen verhokäyrä): ui sisään oikealta, sukeltaa pois (kaksi rengasta, sukelluksessa roiske)
    { const lf = lifeAt('duck', t), dd = dissolve(t, ST.duck[0]);
      const home = rgk ? (t >= tR20 - S.LEAD ? RING2.duck : RING.duck) : ST.duck;
      const ex2 = smoothstep(tCrick - 0.5, tCrick + 1.5, t) * (1 - smoothstep(tMock - 0.5, tMock + 1, t));
      duck.root.visible = lf.on && dd < 0.999;
      if (lf.on) {
        const en = ease(lf.en), dv = smoothstep(0.08, 1, lf.ex);
        duck.root.position.set(home[0] + 15 * (1 - en) + 0.12 * Math.sin(t * 0.3), home[1] - 4.8 * dv + 0.04 * Math.sin(t * 5) * (1 - en) + 0.03 * Math.sin(t * 1.7), PZ + 0.3);
        duck.root.rotation.z = 1.15 * smoothstep(0, 0.5, lf.ex);   // keula alas: nokka edellä veden alle
        if (rk < 15 && lf.en > 0.7 && lf.ex === 0) for (let k = 0; k < 2; k++) { const off = k * 1.5; pond.rings[rk++].set(home[0], home[1] + 0.05, Math.floor((t - off) / 3) * 3 + off, 0.5 + 0.5 * ex2); }
        if (rk < 16 && lf.ex > 0.02) pond.rings[rk++].set(home[0], home[1] + 0.05, lf.b + 0.3, 1.3);
      }
      duck.root.scale.set(-SC.duck, SC.duck, 1);
      setAppear(duck.mats, 1 - dd);
      duck.pose(clamp(gd * (1 + 0.5 * ex2)));
      dropsFor('duck', home[0], home[1], dd); }
    // englannintorvihaikara: laskeutuu paalulle, kävelee portaita ylös (kromaattinen nousu = puupuhaltimien kertymä), lentää pois
    { const lf = lifeAt('heron', t), dd = dissolve(t, POSTS[0][0]);
      const onStairs = t < tStairs1 + 0.5;
      const prog = stairP(t) * 3;   // 0..3 askelta
      const k = Math.min(2, Math.floor(prog)), w = prog - k;
      const a = POSTS[k], b = POSTS[k + 1];
      const hop = Math.sin(w * Math.PI) * 0.2;
      const base = [mix(a[0], b[0], ease(w)), mix(a[1], b[1], ease(w)) + hop];
      const home = onStairs ? base : (rgk ? (t >= tR20 - S.LEAD ? RING2.heron : RING.heron) : POSTS[3]);
      heron.root.visible = lf.on && dd < 0.999;
      if (lf.on) {
        const en = ease(lf.en), ex = ease(lf.ex), e1 = 1 - en;
        heron.root.position.set(home[0] + 13 * e1 + 15 * ex, home[1] + 6 * e1 * e1 + 7 * ex * ex + 0.18 * Math.sin(t * 6) * (e1 + ex), PZ + 0.2);
        heron.root.rotation.z = 0.25 * e1 - 0.3 * ex;
        heron.root.scale.set(-SC.heron * turnX(smoothstep(0, 0.3, lf.ex)), SC.heron, 1);
      }
      setAppear(heron.mats, 1 - dd);
      heron.pose(gh, t, onStairs ? prog * 1.0 : 0);
      dropsFor('heron', home[0], home[1] + 1.2, dd); }
    // Dehringin tuubakotilot (ele: kellon kallistus = tuubien verhokäyrä): ryömivät penkereen reunan yli sisään ja takaisin veteen
    { snails.forEach((s, i) => {
        const lf = lifeAt('snail', t, i * 0.45, (1 - i) * 0.45), dd = dissolve(t, ST.snails[i][0]);
        s.root.visible = lf.on && dd < 0.999;
        if (lf.on) {
          const crawl = Math.min(0.3, (1.5 - i * 0.2) * (Wc.lowsI(t) - Wc.lowsI(lf.a)) * 0.05) * (1 - lf.ex);
          const st2 = [ST.snails[i][0] - crawl, ST.snails[i][1]];
          const u = lf.ex > 0 ? 1 - ease(smoothstep(0.15, 1, lf.ex)) : ease(lf.en);
          const P = pathPt(st2, u);
          s.root.position.set(P.x, P.y, mix(-0.1, 0.04, smoothstep(0.8, 1, u)));
          s.root.rotation.z = clamp(0.7 * Math.atan2(-P.ty, -P.tx), -1.2, 0);   // seuraa rinnettä
          s.root.scale.set(-SC.snail * turnX(smoothstep(0, 0.2, lf.ex)), SC.snail, 1);
        }
        setAppear(s.mats, 1 - dd);
        s.pose(clamp(gs * (i ? 1.0 : 0.85)));
        dropsFor(i ? 'sn1' : 'sn0', ST.snails[i][0], ST.snails[i][1] + 0.4, dd);
      }); }
    // Quijote-peili: sankarin heijastus venyy laihaksi lammen pintaan (veden alla)
    { const q2 = smoothstep(tMock - 0.3, tMock + 0.8, t) * (1 - smoothstep(tCrow - 0.5, tCrow + 1.5, t)) * (1 - dissolve(t, ST.mirror[0]));
      mirror.root.visible = q2 > 0.01; mirrorLance.visible = q2 > 0.01;
      setAppear(mirror.mats, q2);
      mirror.root.position.set(ST.mirror[0], ST.mirror[1], PZ + 0.3);
      mirror.root.scale.set(-0.9, -1.35 * (1 + 0.3 * q2), 1);
      mirrorLance.position.set(ST.mirror[0] - 0.9, ST.mirror[1], PZ + 0.3);
      mirrorLance.scale.y = -1;
      poseKnight(mirror, kmix(KP.sit, { ...KP.call, tilt: 1.2, aN: 2.2, eN: 0.2, lean: -0.3 }, 0.5 * gh * q2), t, 0); }
    // fagottisammakot (ele: takajalan potku = fagottien verhokäyrä): hyppäävät veden puolelta penkereen alarinteelle ja istuvat rinteellä
    { const st2f = (i) => [slopeX(-3.0 - 0.3 * i) + 0.75, -3.0 - 0.3 * i];   // sammakko hyppää veden puolelta rinteelle
      frogs.forEach((f, i) => {
        const lf = lifeAt('frog', t, i * 0.3, (1 - i) * 0.5), dd = dissolve(t, ST.frogs[i][0]);
        f.root.visible = lf.on && dd < 0.999;
        let air = 0;
        if (lf.on) {
          const u = lf.ex > 0 ? 1 - ease(lf.ex) : ease(lf.en);
          const H0 = st2f(i), st2 = ST.frogs[i];
          air = 4 * u * (1 - u);
          f.root.position.set(mix(H0[0], st2[0], u), mix(H0[1], st2[1], u) + 1.3 * air, mix(-0.1, 0.05, smoothstep(0.3, 0.7, u)));
          f.root.rotation.z = -0.3 * smoothstep(0.7, 1, u);   // istuu rinteellä: kallistuu rinteen mukaan
          f.root.scale.set(-SC.frog * turnX(i ? smoothstep(0, 0.25, lf.ex) : smoothstep(0.7, 1, lf.en)), SC.frog, 1);
        }
        setAppear(f.mats, 1 - dd);
        f.pose(clamp(Math.max(gf, air * 1.3)));
        dropsFor(i ? 'fr1' : 'fr0', ST.frogs[i][0], ST.frogs[i][1] + 0.2, dd);
      }); }
    // pasuunavarikset (ele: vetoputken veto = pasuunoiden verhokäyrä): laskeutuvat kuolleen puun varisoksalle (piiritys: ritarin ympärille) ja nousevat siivelle
    { crows.forEach((c, i) => {
        const lf = lifeAt('crow', t, i * 0.6, (2 - i) * 0.6), dd = dissolve(t, ST.crows[i][0]);
        const home = rgk ? RING.crows[i] : ST.crows[i];
        c.root.visible = lf.on && dd < 0.999;
        if (lf.on) {
          const en = ease(lf.en), ex = ease(lf.ex), e1 = 1 - en;
          const ang = t * 0.9 + i * 2.1, settled = en * (1 - ex) * (1 - rgk);
          c.root.position.set(home[0] + 0.2 * Math.cos(ang) * rgk + 14 * e1 + 15 * ex, home[1] + (1 - rgk) * 0.5 * SC.crow + 0.25 * Math.sin(ang) * rgk + settled * (home[0] - perchX) * perch.g.rotation.z + 7 * e1 * e1 + 8 * ex * ex + 0.2 * Math.sin(t * 8 + i) * (e1 + ex), mix(-0.5, 0.3, rgk));
          c.root.scale.set(-SC.crow * turnX(smoothstep(0.65, 1, lf.en)), SC.crow, 1);   // tulee vasemmalle päin, kääntyy oksalla
        }
        setAppear(c.mats, 1 - dd);
        c.pose(clamp(Math.max(gc, lf.on ? Math.min(1, (1 - ease(lf.en)) * 2 + ease(lf.ex) * 2) : 0)));
        dropsFor('cw' + i, home[0], home[1], dd);
      });
      const hsd = hitStamp(t);
      // leima taivaalle lammen yläpuolelle: kokonaan kuvassa (ei yläreunan läpi, ei varisten oksan päällä)
      stamp.visible = hsd >= 0;
      if (hsd >= 0) { stamp.position.set(-0.9, 2.4, 0.9); stamp.scale.setScalar(0.5 + 0.15 * Math.min(1, hsd / 0.1)); stamp.material.uniforms.uAppear.value = 1 - smoothstep(0.8, 1.6, hsd); } }
    // wid_voitto: leveä punainen veto viirin kärjestä suon yli
    { const sp = sweepP(t), show = t >= sw0 && t < END + 4;
      sweep.mesh.visible = show && sp > 0.02;
      if (sweep.mesh.visible) {
        // alku: viirin kärjen oikea rata pyyhkäisyn huippuun (tPk), sitten veto jatkuu suon yli oikeaan reunaan
        const tPk = swV, ARC = 12, NN = 40;
        const pk = L.tipAt(tPk);
        const pts = [];
        for (let k = 0; k < NN; k++) {
          if (k < ARC) { const q3 = L.tipAt(mix(sw0, tPk, k / (ARC - 1))); pts.push([q3.x, q3.y]); }
          else { const f = (k - ARC + 1) / (NN - ARC); pts.push([pk.x + (17 - pk.x) * f, mix(pk.y, 1.6, smoothstep(0, 0.4, f)) - 1.4 * Math.sin(f * 2.2) + 0.4 * Math.sin(f * 9)]); }
        }
        const vis2 = ease(sp);
        const n = Math.max(2, Math.round(vis2 * (NN - 1)) + 1);
        sweep.set(pts.slice(0, n), 0.85, 1);
      } }
    spl.set(t, [{ t: tSplash2, x: 0.4, y: -1.2, s: 3.0, z: 6, z0: PZ + 0.5 }], S.LEAD);
    { const q4 = smoothstep(tMock, fr(tMock, tCrow, 0.6), t) * (1 - smoothstep(fr(tMock, tCrow, 0.5), fr(tMock, tCrow, 0.97), t));
      const hpz = heron.root.position;
      dots.forEach((d, k) => {
        const f = (k + 1) / dots.length * q4;
        const dk = clamp(q4 * dots.length - k); d.visible = dk > 0.01;
        d.position.set(hpz.x - 0.9 - f * 2.6, hpz.y + 0.62 * (SC.heron / (0.278 * FAR)) + 0.3 * Math.sin(f * 9 + k) + 0.25 * f, hpz.z + 0.2);   // pisteet alkavat haikaran nokan edestä (eivät haikaran päällä)
        d.scale.setScalar((0.9 + 0.3 * Math.sin(k)) * 1.4 * smoothstep(0, 1, dk));
      }); }
    // lautasten roiske lammessa: yhden elementin teko ruutua ennen ääntä
    { const best = t - (tSplash2 - S.LEAD);
      splash.visible = best >= -1e-6 && best < 0.7;
      splash.scale.set(1.7 + best * 1.5, clamp(1 - best / 0.7) * 2.6, 1);
      if (t > tSplash2 - S.LEAD && t - tSplash2 < 3 && rk < 16) pond.rings[rk++].set(1.0, -1.5, tSplash2, 1.8); }
    st.hs = hs; st.mf = mf; st.q = q; st.mg = mg; st.murk = murk; st.rg = ringK(t);
    const dim = 0.12 + 0.28 * night - 0.12 * snap + 0.14 * murk;
    return { dim: clamp(dim, 0, 0.7), wind: 0.3 };
  }
  // koko veto on ohittanut kaikki (sameus väistyy)
  function dissolveAll(t) { return dissolve(t, 3.0); }

  // opastarkistus: olennot, ritarin teko, lampi ja muisto, sameus
  const probe = (t) => {
    const hs = heroState(t);
    const tip = L.tipAt(t);
    const qs = [0, 1, 2, 3, 4].map((k) => qWave(k, t));
    const act2 = {
      mosq: lifeAt('mosq', t).on ? G.mosq(t) : 0, duck: lifeAt('duck', t).on ? G.duck(t) : 0, heron: lifeAt('heron', t).on ? G.heron(t) : 0,
      snail: lifeAt('snail', t).on ? G.snail(t) : 0, frog: lifeAt('frog', t).on ? G.frog(t) : 0, crow: lifeAt('crow', t).on ? G.crow(t) : 0,
    };
    const hsd = hitStab(t), hst = hitStamp(t);
    return {
      mosq_ele: act2.mosq, sorsa_ele: act2.duck, haikara_ele: act2.heron, kotilo_ele: act2.snail, sammakko_ele: act2.frog, varis_ele: act2.crow,
      puupuhallin_olennot: Math.max(act2.mosq, act2.duck, act2.heron, act2.frog), vaski_olennot: Math.max(act2.snail, act2.crow),
      olennot: act2.mosq + act2.duck + act2.heron + act2.snail + act2.frog + act2.crow,
      olento_nakyy: [mosq.root, duck.root, heron.root, snails[0].root, frogs[0].root, crows[0].root].filter((o) => o.visible).length,
      pisto: hsd >= 0 ? 1 : 0, tahra: hst >= 0 ? 1 : 0,
      sorsa_nokka: act2.duck, haikara_askel: stairP(t) * (t < tStairs1 ? 1 : 0) + (t >= tStairs1 ? 1 : 0),
      peili: smoothstep(tMock - 0.3, tMock + 0.8, t) * (1 - smoothstep(tCrow - 0.5, tCrow + 1.5, t)),
      sameus: st.murk ?? 0, piiritys: ringK(t), viiri_tumma: st.dark ?? 0,
      viirikarki_y: tip ? tip.y : 0, viirikarki_x: tip ? tip.x : 0,
      viiri_leveys: hs.width,
      ritari_x: hs.x, ritari_suunta: hs.facing, ritari_tilt: hs.pose.tilt, ritari_lanceAng: hs.lanceAng ?? 0,
      ritari_kallistus: hs.pose.tilt, ritari_polvella: hs.pose.hN > 1.3 ? 1 : 0,
      muisto: Math.max(qs[0], 0) * memFade(t), muisto_aalto1: qs[0], muisto_aalto2: qs[1], muisto_aalto3: qs[2], muisto_aalto4: qs[3], muisto_aalto5: qs[4],
      muisto_kasvu: Pgrow(t), muisto_jouset: S.fam.strings(t), olennot_poissa: [mosq.root, duck.root, heron.root, snails[0].root, snails[1].root, frogs[0].root, frogs[1].root, crows[0].root, crows[1].root, crows[2].root].some((o) => o.visible) ? 0 : 1,
      heijastus_y: mem.visible ? MY : null, heijastus_veden_alla: mem.visible ? 1 : 0,
      toverit_n: ridgeMates.filter((m) => m.P.root.visible).length,
      roiske: (() => { const b = t - (tSplash2 - S.LEAD); return b >= -1e-6 && b < 0.7 ? 1 + b : 0; })(),
      veto: sweepP(t),
    };
  };
  // --- näkyvyyskoetin (kierros 4b, render/nakyvyys.mjs): jokaisen kuvassa olevan olennon ja ritarin rajauslaatikko ruutukoordinaatteina ---
  // Palauttaa [{nimi, x0, y0, x1, y1, lepo}], x oikealle ja y alas, 0..1 (kuvan reunat 0 ja 1). Laatikko = näkyvien verkkojen
  // maailmalaatikko (ei piilotettuja osia) projisoituna kameralla (kahdeksan kulmaa). lepo = olento on lepopaikallaan (tulo ja lähtö
  // saavat ylittää reunan). Ritarilla ja keihäällä (nimi 'keihas') lepo on aina tosi. Puu, viiri, peili ja toverit eivät ole mukana.
  const nvBox = new THREE.Box3(), nvTmp = new THREE.Box3(), nvV = new THREE.Vector3();
  const nvWorldBox = (root) => {
    nvBox.makeEmpty();
    root.updateMatrixWorld(true);
    root.traverse((o) => {
      if (!o.isMesh || !o.geometry) return;
      for (let p = o; p; p = p.parent) { if (!p.visible) return; if (p === root) break; }
      if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
      nvTmp.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);
      nvBox.union(nvTmp);
    });
    return nvBox.isEmpty() ? null : nvBox.clone();
  };
  const nvScreen = (b, cam) => {
    let x0 = 9, y0 = 9, x1 = -9, y1 = -9;
    for (let k = 0; k < 8; k++) {
      nvV.set(k & 1 ? b.max.x : b.min.x, k & 2 ? b.max.y : b.min.y, k & 4 ? b.max.z : b.min.z).project(cam);
      const sx = 0.5 + 0.5 * nvV.x, sy = 0.5 - 0.5 * nvV.y;
      x0 = Math.min(x0, sx); x1 = Math.max(x1, sx); y0 = Math.min(y0, sy); y1 = Math.max(y1, sy);
    }
    return { x0, y0, x1, y1 };
  };
  // penkereen reuna (z 0, mustan penkereen reunaviiva): kaukana vedessä (z < 0) olevat olennot jäävät sen taakse, jos ne ovat kuvassa sen vasemmalla puolella
  const BANK_EDGE = [[-0.3, 0.05], [0.1, -0.9], [0.8, -2.8], [1.6, -4.6], [1.9, -5.3]];
  const nvBank = (cam) => BANK_EDGE.map(([x, y]) => { nvV.set(x, y, 0).project(cam); return [0.5 + 0.5 * nvV.x, 0.5 - 0.5 * nvV.y]; });
  const nvEdgeX = (pts, ys) => {   // penkereen reunan x ruudulla korkeudella ys (alas): -9, jos reuna on ylempänä kuin ys
    if (ys < pts[0][1]) return -9;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      if (ys <= b[1]) return a[0] + (b[0] - a[0]) * ((ys - a[1]) / Math.max(1e-6, b[1] - a[1]));
    }
    return pts[pts.length - 1][0];
  };
  const NV = [
    ['hyttynen', mosq.root, 'mosq', 0], ['sorsa', duck.root, 'duck', 0], ['haikara', heron.root, 'heron', 0],
    ['kotilo1', snails[0].root, 'snail', 0, 0.45], ['kotilo2', snails[1].root, 'snail', 0.45, 0],
    ['sammakko1', frogs[0].root, 'frog', 0, 0.5], ['sammakko2', frogs[1].root, 'frog', 0.3, 0],
    ['varis1', crows[0].root, 'crow', 0, 1.2], ['varis2', crows[1].root, 'crow', 0.6, 0.6], ['varis3', crows[2].root, 'crow', 1.2, 0],
  ];
  const r4 = (x) => Math.round(x * 10000) / 10000;
  // koot (kierros 4c): jokaisen kuvassa olevan olennon maailmalaatikon leveys ja korkeus yksikköinä sekä ritarin pään (kypärän kello ja pää) mitat
  window.olennotKoot = (t) => {
    window.camProbe(t);
    const out = {}, bb = (root) => { const b = nvWorldBox(root); return b ? { lev: r4(b.max.x - b.min.x), kor: r4(b.max.y - b.min.y) } : null; };
    for (const [nimi, root] of NV) if (root.visible) { const k = bb(root); if (k) out[nimi] = k; }
    out.ritari_paa = bb(L.P.head);
    out.ritari = bb(L.P.root);
    return out;
  };
  window.nakyvyysProbe = (t) => {
    const cp = window.camProbe(t);                       // askeltaa kohtauksen (update + kamera) täsmälleen kuten seek
    if (cp.loc !== 'G suo') return [];
    const cam = scene.children.find((o) => o.isPerspectiveCamera);
    if (!cam) return [];
    const out = [];
    const bank = nvBank(cam);
    const add = (nimi, root, lepo) => {
      for (let p = root; p; p = p.parent) if (!p.visible) return;
      const b = nvWorldBox(root);
      if (!b) return;
      const s = nvScreen(b, cam);
      const o = { nimi, x0: r4(s.x0), y0: r4(s.y0), x1: r4(s.x1), y1: r4(s.y1), lepo };
      // peitto: penkereen taakse jäävän osan osuus laatikon leveydestä (vain kauempana kuin penger, z < -0,3)
      o.peitto = b.max.z < -0.3 ? r4(clamp((nvEdgeX(bank, s.y1) - s.x0) / Math.max(1e-6, s.x1 - s.x0))) : 0;
      out.push(o);
    };
    add('ritari', L.P.root, true);
    if (L.lance.visible) {
      add('keihas', L.lance, true);
      // keihään varsi (tyvi ja kärki) ruutu- ja maailmakoordinaatteina: viistoa keihästä ei arvioida laatikolla (laatikko on sen lävistäjä)
      const k = out[out.length - 1];
      if (k && k.nimi === 'keihas') {
        const g = L.grip(), z = L.lance.getWorldPosition(nvV).z;
        let dx = g.b[0] - g.a[0], dy = g.b[1] - g.a[1];
        const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
        const tip = [g.b[0] + dx * 0.32, g.b[1] + dy * 0.32];
        const pr = (x, y) => { nvV.set(x, y, z).project(cam); return [r4(0.5 + 0.5 * nvV.x), r4(0.5 - 0.5 * nvV.y)]; };
        k.a = pr(g.a[0], g.a[1]); k.b = pr(tip[0], tip[1]);
        k.wa = [r4(g.a[0]), r4(g.a[1])]; k.wb = [r4(tip[0]), r4(tip[1])];
      }
    }
    for (const [nimi, root, key, extra, extraEx] of NV) {
      if (!root.visible) continue;
      const lf = lifeAt(key, t, extra, extraEx);
      // hyttysen lähtö alkaa ritarin huitaisusta (keihäs pyyhkäisee sen ohi): huitaisun ajan se on jo liikkeessä
      const swatting = key === 'mosq' && t >= tSwat0 && t <= swM + 0.15;
      add(nimi, root, lf.on && lf.en >= 1 && lf.ex === 0 && (t < lf.b || lf.b >= sw0 - 1.2) && !swatting);
    }
    // yhden elementin iskut: leima (pasuunat) ja englannintorven pisteet (laatikko kaikista näkyvistä pisteistä); lepo = tosi (kuuluvat kuvaan koko elinaikansa)
    add('leima', stamp, true);
    { const vis = dots.filter((d) => d.visible);
      if (vis.length) {
        const bb = nvBox.clone().makeEmpty();
        for (const d of vis) { const b = nvWorldBox(d); if (b) bb.union(b); }
        if (!bb.isEmpty()) { const sc = nvScreen(bb, cam); out.push({ nimi: 'pisteet', x0: r4(sc.x0), y0: r4(sc.y0), x1: r4(sc.x1), y1: r4(sc.y1), lepo: true, peitto: 0 }); }
      } }
    return out;
  };
  return { scene, update, shots, probe };
}
