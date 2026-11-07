// Elävä vedos: friisi, jossa aika on vaakasuunta (x = t, 1 yksikkö = 1 s) ja rekisteri pystysuunta.
// Kuvakäsikirjoitus: runs/vedos-1230/storyboard.md. Kaikki on puhdas ajan funktio: friisin painettu
// osa lasketaan joka ruudulla aiemmista ajoista (näytteet), joten ruutujen välillä ei ole tilaa.
//
//   taso   = sankari (sinooperi), yläreuna = johtava melodia, paksuus = vaskien ja jousten massa
//   viiva  = kumppani (paperinvalkoinen), sooloviulun melodia
//   pisteet = vastustajat (musta), Porterin järjestys kohtausten mukaan
//   taustatasot = maailma: taivas (vuorokausi), vuoret, keskimaisema, maa, etuala

import * as THREE from 'three';
import { C, U, ink, flat, group, poly, rect, circle, ridgeGeo, skylineGeo, strokeGeo, cloud, deadTree, earleTree, pennantGeo, waveMat, water, sky as makeSky, clamp, smoothstep, mix, hash1, vnoise1, TAU } from './paper.js';
import { knightBack } from './puppets.js';
import { gaussian, sampler } from '../util.js';

export const yReg = (midi) => clamp((midi - 36) / 48, -0.05, 1.1) * 12;   // C2 = 0, C6 = 12

// Dynaaminen nauha: N pistettä, kaksi reunaa (ylä- ja alareuna tai keskiviiva ± leveys).
function dynStrip(parent, N, mat, z = 0) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 2 * 3), 3));
  g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(N * 2 * 2), 2));
  const idx = [];
  for (let k = 0; k < N - 1; k++) { const a = 2 * k; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  g.setIndex(idx);
  const m = new THREE.Mesh(g, mat);
  m.frustumCulled = false;
  m.position.z = z;
  parent.add(m);
  const P = g.getAttribute('position');
  return {
    mesh: m, N,
    // pystykaista: x[k], ylä[k], ala[k]
    band(xs, top, bot) { for (let k = 0; k < N; k++) { P.setXYZ(2 * k, xs[k], top[k], 0); P.setXYZ(2 * k + 1, xs[k], bot[k], 0); } P.needsUpdate = true; },
    // viiva pisteiden kautta, leveys w[k] (0 = katko)
    line(xs, ys, w) {
      for (let k = 0; k < N; k++) {
        const a = Math.max(0, k - 1), b = Math.min(N - 1, k + 1);
        let dx = xs[b] - xs[a], dy = ys[b] - ys[a];
        const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
        const h = w[k] / 2;
        P.setXYZ(2 * k, xs[k] - dy * h, ys[k] + dx * h, 0);
        P.setXYZ(2 * k + 1, xs[k] + dy * h, ys[k] - dx * h, 0);
      }
      P.needsUpdate = true;
    },
  };
}

// Instanssoidut pisteet (ympyrät tai kiilat).
function dots(parent, n, mat, shape) {
  const im = new THREE.InstancedMesh(shape, mat, n);
  im.frustumCulled = false;
  parent.add(im);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(), zA = new THREE.Vector3(0, 0, 1);
  let k = 0;
  return {
    im,
    begin() { k = 0; },
    add(x, y, z, sx, sy, r = 0) { if (k >= n) return; q.setFromAxisAngle(zA, r); p.set(x, y, z); s.set(sx, sy, 1); m4.compose(p, q, s); im.setMatrixAt(k++, m4); },
    end() { m4.makeScale(0, 0, 0); for (let i = k; i < n; i++) im.setMatrixAt(i, m4); im.instanceMatrix.needsUpdate = true; },
  };
}

export function buildFrieze(S, A, SC) {
  const scene = new THREE.Scene();
  const T0 = S.T0, TD = S.T_DOM7, TW = S.T_WID;
  const tGef = A('gef_viulu'), tWal = A('wal_kulissi1'), tEnd = S.T_END;
  const tViol = A('held_viulut'), tRak = A('gef_rakkaus'), tHuippu = A('gef_huippu');
  const tJalki = A('gef_jalkihehku'), tUni = A('gef_arvostelijat_uni'), tHil = A('gef_hiljaisuus');
  const tTais = A('wal_taistelu'), tFlip = A('wal_puolenvaihto'), tChord = A('held_dom7_sointu');
  const n = S.n;
  const arr = (f) => { const a = new Float32Array(n); for (let i = 0; i < n; i++) a[i] = f(i / 30); return a; };
  const smooth = (f, s) => sampler(gaussian(arr(f), Math.max(1, s * 30)), 30);
  // jakso: 0 intro, 1 sankari, 2 vastustajat, 3 kumppani, 4 taistelu
  const actOf = (t) => (t < T0 ? 0 : t < TW - 0.5 ? 1 : t < tGef ? 2 : t < tWal ? 3 : 4);
  const sceneAt = SC.at;

  // --- signaalit ---
  const melodyRaw = S.melody, bass = S.bassMidi;
  const mass = smooth((t) => clamp(0.45 * S.energy.brass(t) + 0.45 * S.tutti(t) + 0.5 * S.loud(t)), 0.25);
  const horns = smooth((t) => S.energy.horns(t), 0.3);
  const lows = smooth((t) => S.energy.lows(t), 0.6);
  const violin = smooth((t) => clamp(S.fam.violins(t)), 0.4);
  const winds = smooth((t) => clamp(S.fam.winds(t)), 0.3);
  const loudS = smooth((t) => S.loud(t), 1.5);
  const tension = smooth((t) => S.tension(t), 1.0);
  // sankarin sävel: jaksoissa 1–2 ja 4 johtava melodia, kumppanin jaksossa basso (sankari vastaa)
  // jakson 2 mollissa ja kokoamisessa sankari on matalalla (fagotit, käyrätorvet V–VIII, matalat jouset)
  const heroMidi = (t) => (actOf(t) === 3 || (actOf(t) === 2 && t >= A('wid_sankari_molli') && t < A('wid_sankari_nousee')) ? bass(t) + 12 : clamp(melodyRaw(t), 36, 79));
  const heroTop = smooth((t) => yReg(heroMidi(t)), 0.6);
  const heroTopSlow = smooth((t) => yReg(heroMidi(t)), 1.2);
  // sankarin läsnäolo (kuvakäsikirjoitus kohtauksittain)
  const heroOnArr = arr((t) => {
    const a = actOf(t);
    const st = sceneAt(t).style;
    if (a === 0 || st === 'none' || st === 'karikatyyri') return 0;
    if (a === 1) return 1;
    if (a === 2) return 1;
    if (a === 3) return smoothstep(0.3, 0.55, Math.max(horns(t), 0.8 * lows(t))) * (st === 'duetto' || st === 'huippu' || st === 'kutsu' ? 1 : 1);
    return smoothstep(0.25, 0.5, Math.max(horns(t), mass(t)));
  });
  const heroOn = sampler(gaussian(heroOnArr, 9), 30);
  // tummuus (jakso 2): kokoaminen aalloittain, sitten leimahdus
  const tMol = A('wid_sankari_molli'), tR17 = A('wid_reh17'), tAtt = A('wid_uusi_hyokkays'), tNousee = A('wid_sankari_nousee');
  const waves = S.segs.filter((s) => s.a >= tR17 - 0.5 && s.a < tAtt - 2).map((s) => s.a);
  const waveK = (t) => waves.reduce((m, w, i) => m + smoothstep(w, w + 3, t), 0) / Math.max(1, waves.length);
  const darkAt = (t) => {
    if (t < tMol || t >= tNousee + 3) return 0;
    if (t < tR17) return 1;
    if (t < tAtt) return 1 - 0.75 * waveK(t);
    return mix(0.6, 0, smoothstep(tNousee - 0.5, tNousee + 3, t));
  };
  // vastustajat ennen mollia: taso ei näy
  const act2Hidden = (t) => actOf(t) === 2 && t < tMol;

  // --- taivas ja vuorokausi ---
  const SKY = makeSky(scene, -480);
  // --- kerrokset ---
  const biome = (t) => {
    const w1 = 1 - smoothstep(TW - 8, TW + 4, t);
    const w4 = smoothstep(tWal - 6, tWal + 10, t);
    const w3 = smoothstep(tGef - 10, tGef + 6, t) * (1 - w4);
    const w2 = Math.max(0, 1 - w1 - w3 - w4);
    return [w1, w2, w3, w4];
  };
  const X0 = -200, X1 = tEnd + 260;
  const skyline = (f, nPts) => { const pts = []; for (let i = 0; i <= nPts; i++) { const x = X0 + ((X1 - X0) * i) / nPts; pts.push([x, f(x)]); } return pts; };
  const farF = (x) => { const [a, b, c, d] = biome(x); return a * (14 + 12 * Math.pow(vnoise1(x / 38, 3), 1.4)) + b * (6 + 2 * vnoise1(x / 60, 5)) + c * (8 + 4 * vnoise1(x / 45, 7)) + d * (5 + 1.5 * vnoise1(x / 70, 9)); };
  const midF = (x) => { const [a, b, c, d] = biome(x); return a * (5 + 7 * Math.pow(vnoise1(x / 17, 11), 1.6)) + b * (2.2 + 0.8 * vnoise1(x / 9, 13)) + c * (3.2 + 1.6 * vnoise1(x / 14, 15)) + d * (1.6 + 0.4 * vnoise1(x / 20, 17)); };
  const nearF = (x) => { const [a, b, c, d] = biome(x); return a * (1.2 + 1.5 * vnoise1(x / 6, 19)) + b * (0.8 + 0.3 * vnoise1(x / 3, 21)) + c * (1.0 + 0.7 * vnoise1(x / 5, 23)) + d * (0.6 + 0.2 * vnoise1(x / 2, 25)); };
  const farMat = ink(C.paper, { shade: C.blue, raster: 0.35 });
  const far = flat(scene, skylineGeo(skyline(farF, 1600), -200), farMat, { z: -140 });
  far.userData.edge = { name: 'kaukaiset vuoret' };
  const farSketch = flat(scene, strokeGeo(skyline(farF, 1600), 0.35), ink(C.paper, { shade: C.blue, raster: 0.55 }), { z: -139.9 });
  const midMat = ink(C.blue, { shade: C.black, raster: 0.15 });
  const mid = flat(scene, skylineGeo(skyline(midF, 2400), -200), midMat, { z: -45 });
  mid.userData.edge = { name: 'keskimaisema' };
  const nearMat = ink(C.black, { shade: C.blue, raster: 0.1 });
  const near = flat(scene, skylineGeo(skyline(nearF, 3200), -200), nearMat, { z: -8 });
  near.userData.edge = { name: 'maa' };
  // sumumeri laaksoissa (jakso 1) ja joki (jakso 3): vesi ja välke
  const mist = water(scene, X1 - X0, 2.2, { x: (X0 + X1) / 2, y: 1.0, z: -30, base: C.blue, deep: C.blue, glint: 0.6 });
  const river = water(scene, X1 - X0, 2.0, { x: (X0 + X1) / 2, y: 0.4, z: -6, base: C.blue, deep: C.black, glint: 0.8 });
  // kuolleet puut (jakso 2) ja metsän puut (jakso 3): keskimaisema ja maa
  const deadMat = ink(C.black, { shade: C.blue, raster: 0.35 });
  for (let i = 0; i < 40; i++) { const x = TW + 6 + i * 4.8 + 2 * hash1(i); for (const sh of deadTree(300 + i, 1.4 + 1.2 * hash1(i + 9))) flat(scene, sh, deadMat, { x: x * 1.0, y: midF(x) - 0.3, z: -44.5 }); }
  const treeMat = ink(C.blue, { shade: C.black, raster: 0.45 });
  for (let i = 0; i < 180; i++) { const x = tGef - 20 + i * 4.0 + 2 * hash1(i + 50); if (x > tWal) break; flat(scene, earleTree(4 + 3 * hash1(i + 3), 1.6, 400 + i), treeMat, { x, y: midF(x) - 0.4, z: -44.4 }); }
  // etuala (Reiniger): ruohot, kaislat, kivet — nopein kerros
  const foreMat = ink(C.black, {});
  for (let i = 0; i < 900; i++) {
    const x = -10 + i * 1.45 + hash1(i * 3) * 1.2;
    if (x > tEnd + 40) break;
    const [a, b, c, d] = biome(x);
    const h = (a * 0.7 + b * 1.8 + c * 0.9 + d * 0.5) * (0.6 + 0.8 * hash1(i * 7));
    flat(scene, poly([[-0.05, -6], [0.05, -6], [0.015, h], [-0.015, h]]), foreMat, { x, y: -1.2, z: 6, r: 0.12 * (hash1(i * 11) - 0.5) });
  }
  flat(scene, rect(X1 - X0, 8, 0.5, 1), foreMat, { x: (X0 + X1) / 2, y: -1.3, z: 6 }).userData.edge = { name: 'etuala', noBottom: true };
  // sameus: musta rasteriusva äänien tason takana (jakso 2)
  const murkMat = ink(C.black, { shade: C.black, raster: 0 });
  murkMat.uniforms.uAppear.value = 0;
  const murk = flat(scene, rect(400, 60, 0.5, 0.5), murkMat, { z: -2 });

  // --- äänien taso ---
  const NB = 520;
  const heroMat = ink(C.red, { shade: C.black, raster: 0 });
  const heroDarkMat = ink(C.red, { shade: C.black, raster: 0.55 });
  const heroB = dynStrip(scene, NB, heroMat, 0);
  const heroD = dynStrip(scene, NB, heroDarkMat, 0.01);
  const strand2 = dynStrip(scene, NB, ink(C.red, { shade: C.black, raster: 0.3 }), -0.02);
  const viola = dynStrip(scene, NB, ink(C.blue, { shade: C.paper, raster: 0.35 }), 0.02);
  const wisp = dynStrip(scene, NB, ink(C.red, { shade: C.paper, raster: 0.5 }), 0.015);
  const lineMat = ink(C.paper, {});
  const lineB = dynStrip(scene, NB, lineMat, 0.05);
  const purple = dynStrip(scene, NB, ink(C.purple, {}), 0.06);
  const windLines = dynStrip(scene, NB, ink(C.blue, { shade: C.paper, raster: 0.4 }), -0.03);
  // pisteet, kiilat ja leimat
  const dotM = dots(scene, 3000, ink(C.black, {}), new THREE.CircleGeometry(1, 14));
  const redDot = dots(scene, 1400, ink(C.red, { shade: C.black, raster: 0.25 }), new THREE.CircleGeometry(1, 10));
  const wedgeShape = new THREE.ShapeGeometry(poly([[-0.5, 0], [0.5, 0], [0, 1]]));   // kärki ylös
  const stamps = dots(scene, 64, ink(C.red, {}), wedgeShape);
  const tipShape = new THREE.ShapeGeometry(poly([[0, 0], [1, 0.25], [0, 0.5]]));
  const tips = dots(scene, 64, ink(C.red, { shade: C.black, raster: 0.1 }), tipShape);
  const blueRaster = dots(scene, 900, ink(C.blue, { shade: C.paper, raster: 0.4 }), new THREE.CircleGeometry(1, 8));
  // selkäkuvat
  const fig1 = knightBack(scene);
  fig1.M.body.uniforms.uColor.value.copy(C.black); fig1.M.dark.uniforms.uColor.value.copy(C.black);
  const fig2 = knightBack(scene);
  fig2.M.body.uniforms.uColor.value.copy(C.black); fig2.M.dark.uniforms.uColor.value.copy(C.black);
  // kaksi hahmoa kuun alla (rakkausduetto): sankari ja kumppani (kumppani paperinvalkoisena ääriviivana)
  const figA = knightBack(scene);
  figA.M.body.uniforms.uColor.value.copy(C.black); figA.M.dark.uniforms.uColor.value.copy(C.black);
  const figB = group(scene, {});
  const companion = poly([[-0.18, 0], [0.18, 0], [0.12, 1.3], [0.16, 1.55], [0.05, 1.75], [-0.05, 1.75], [-0.16, 1.55], [-0.12, 1.3]]);
  flat(figB, companion, ink(C.blue, { shade: C.black, raster: 0.3 }), {});
  flat(figB, strokeGeo(companion.getPoints(40).map((p) => [p.x, p.y]), 0.05, true), ink(C.paper), { z: 0.01 });
  flat(figB, circle(0.13, 20, 0, 1.92), ink(C.blue, { shade: C.black, raster: 0.3 }), {});
  flat(figB, strokeGeo(Array.from({ length: 25 }, (_, i) => [0.13 * Math.cos((i / 24) * TAU), 1.92 + 0.13 * Math.sin((i / 24) * TAU)]), 0.04), ink(C.paper), { z: 0.01 });
  const moon = flat(scene, circle(3.2, 48), ink(C.paper, {}), { z: -60 });
  // dominanttiseptimin huippu ja sädekehä
  const peakX = tChord + 2.5;
  const peak = flat(scene, poly([[peakX - 22, -30], [peakX - 9, 4], [peakX - 3, 8.2], [peakX, 9.0], [peakX + 3, 8.4], [peakX + 10, 4], [peakX + 24, -30]]), ink(C.black, { shade: C.blue, raster: 0.12 }), { z: -3 });
  const NR = 48;
  const haloG = new THREE.BufferGeometry();
  haloG.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NR * 4 * 3), 3));
  const hidx = []; for (let r = 0; r < NR; r++) { const a = 4 * r; hidx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  haloG.setIndex(hidx);
  const haloMat = ink(C.red, {});
  const halo = new THREE.Mesh(haloG, haloMat);
  halo.frustumCulled = false;
  halo.position.z = -3.5;
  scene.add(halo);
  const haloSun = flat(scene, circle(1.2, 40), ink(C.red, {}), { z: -3.4 });
  const sketchMat = ink(C.paper, { shade: C.blue, raster: 0.6 });
  const haloSketch = group(scene, { x: peakX, y: 9.0 + 2.2, z: -3.45 });
  flat(haloSketch, strokeGeo(Array.from({ length: 49 }, (_, i) => [1.4 * Math.cos((i / 48) * TAU), 1.4 * Math.sin((i / 48) * TAU)]), 0.06), sketchMat);
  for (let r = 0; r < 24; r++) { const a = (r / 24) * TAU; flat(haloSketch, strokeGeo([[1.7 * Math.cos(a), 1.7 * Math.sin(a)], [4.2 * Math.cos(a), 4.2 * Math.sin(a)]], 0.04), sketchMat); }
  // kolme kulissitrumpettien viiriä (musta, valkoinen, punainen)
  const flagsets = [A('wal_kulissi1'), A('wal_kulissi2')].map((tk, j) => {
    const g = group(scene, { x: tk + 9, y: j ? 1.0 : 3.5, z: j ? -16 : -40 });
    const ms = [C.black, C.paper, C.red].map((c, i) => {
      const m = waveMat(c, { shade: C.black, raster: c === C.paper ? 0 : 0.1, amp: 0.2, k: 5 });
      const pole = group(g, { x: (i - 1) * 2.2 });
      flat(pole, rect(0.09, 3.2, 0.5, 0), ink(C.black), {});
      flat(pole, pennantGeo(2.2, 0.7), m, { y: 2.8, z: 0.01 });
      return m;
    });
    return { g, ms, tk };
  });
  // pöllähdykset (patarummut): maakerroksen viivoitus
  const puffMats = [];
  const puffs = Array.from({ length: 10 }, (_, i) => { const m = ink(C.paper, { shade: C.blue, raster: 0.55 }); puffMats.push(m); const g = flat(scene, cloud(2.6, 0.8, 700 + i, false), m, { z: -7.5 }); g.visible = false; return g; });
  // lautasten roiske
  const splashShape = (() => { const p = []; for (let j = 0; j <= 18; j++) { const u = j / 18; p.push([(u - 0.5) * 2.4, j % 2 ? 0.8 + 0.5 * hash1(j) : 0.2]); } for (let j = 12; j >= 0; j--) { const a = Math.PI * j / 12; p.push([1.2 * Math.cos(a), -0.3 * Math.sin(a)]); } return poly(p); })();
  const splash = flat(scene, splashShape, ink(C.black, {}), { z: 0.2 });

  // --- tapahtumat ---
  const accIn = S.accIn;
  const t6 = ['held_isku_t6', 'held_isku_t8', 'held_isku_t11'].map((id) => A(id));
  const fate = ['held_isku1', 'held_isku2', 'held_isku3', 'held_isku4'].map((id) => ({ t: A(id), z: S.acc.find((x) => Math.abs(x.t - A(id)) < 0.1)?.z ?? 10 }));
  const sfz = accIn(A('held_reh4'), A('held_huippu1'), 4.5).map((x) => x.t);
  const reh9 = accIn(A('held_reh9') - 0.3, A('held_reh9') + 1.5, 6).map((x) => x.t).slice(0, 3);
  const cym = A('wid_reh20_lautaset');
  const drum = S.strokes.filter((t) => (t > A('held_vasket_t13') - 0.2 && t < A('held_lyyrinen')) || (t > tTais - 0.2 && t < tFlip));
  // vastustajien pisteet: nuotinalut kohtausten mukaan; tyyppi kohtauksesta
  const ons = S.onsetsIn(TW, tEnd);
  const pts = [];
  ons.forEach((t, i) => {
    const sc = sceneAt(t);
    const nm = String(sc.n);
    const midi = S.melody(t);
    const L = S.loud(t);
    const r1 = hash1(i * 7 + 1), r2 = hash1(i * 7 + 2);
    const P = (type, y, s) => pts.push({ t, type, y, s, r1, r2 });
    const act = actOf(t);
    if (act === 2) {
      if (t >= tMol && t < tAtt) return;   // molli ja kokoaminen: vastustajat vaikenevat (pisteet reunoilla jäävät)
      if (nm === '25') P('neula', 9.5 + 1.5 * r1, 0.05 + 0.04 * L);
      else if (nm === '26') for (let j = 0; j < 4; j++) P('ryhma', yReg(midi) + (hash1(i * 13 + j) - 0.5) * 1.6, 0.07 + 0.1 * L);
      else if (nm === '27') P('portaat', 4 + (i % 9) * 0.55, 0.11);
      else if (nm === '28' || nm === '31') { if (S.fam.winds(t) < 0.35) P('dehring', 1.0 + 0.4 * r1, 0.26 + 0.25 * L); else P('ryhma', yReg(midi), 0.09); }
      else if (nm === '29') P('vapisevat', 8.5 + 2 * r1, 0.07);
      else if (nm === '30') P('fagotti', 1.6 + 1.2 * (i % 2), 0.22);
      else P(['neula', 'ryhma', 'vapisevat', 'dehring'][Math.floor(r1 * 4)], r1 < 0.75 ? yReg(midi) + (r2 - 0.5) * 2 : 1.1, 0.06 + 0.14 * L);
    } else if (act === 3) {
      if (t >= tUni && t < tHil && r1 < 0.35) P('uni', 8 + 3.5 * r2, 0.05);
      if (sc.n === 55 && r1 < 0.5) P('ovi', 3 + 6 * r2, 0.12);
    } else if (act === 4 && t >= tTais) {
      if (S.fam.perc(t) > 0.3 && r1 < 0.7) P('virveli', 0.4 + 0.5 * r2, 0.07);
    }
  });
  const trumpets = S.onsetsIn(tTais, tFlip).filter((t) => S.fam.tpt(t) > 0.35);
  // karikatyyri: kohtauksen 1 kaari pisteinä (kohtaus 30)
  const t78 = A('wid_7_8'), t9 = A('wid_9_pasuunat');
  const blots = accIn(t9 - 0.3, A('wid_kuoro'), 4).map((x) => x.t).slice(0, 4);

  // --- päivitys ---
  const xs = new Float32Array(NB), top = new Float32Array(NB), bot = new Float32Array(NB);
  const xs2 = new Float32Array(NB), t2 = new Float32Array(NB), b2 = new Float32Array(NB), w2 = new Float32Array(NB);
  const dT = new Float32Array(NB), dB = new Float32Array(NB), pT = new Float32Array(NB), pB = new Float32Array(NB);
  const wy = new Float32Array(NB), ww = new Float32Array(NB);
  const ly = new Float32Array(NB), lw = new Float32Array(NB), lx = new Float32Array(NB);

  function styleTop(s, st, base, M) {
    if (st === 'suora') return mix(base, heroTopSlow(s), 0.75);
    if (st === 'pehmea' || st === 'duetto' || st === 'kutsu') return mix(base, heroTopSlow(s), 0.5);
    if (st === 'liekit') return base + 0.9 * M * Math.pow(Math.abs(Math.sin(s * 3.1 + 0.7 * Math.sin(s * 1.3))), 4);
    if (st === 'portaat') return Math.floor(base * 1.2) / 1.2 + 0.25 * smoothstep(0, 1, (base * 1.2) % 1);
    if (st === 'massa') return mix(base, 2.5 + 4 * M, 0.35);
    return base;
  }

  function update(t, cam) {
    const win0 = cam.x0 - 2, win1 = t;
    const span = Math.max(0.5, win1 - win0);
    const mainScene = sceneAt(t);
    // taustat elävät: vuorten rasteri hengittää dynamiikan mukaan, keskimaisema matalien jousten mukaan
    farMat.uniforms.uRaster.value = 0.25 + 0.25 * loudS(t);
    mid.position.y = -0.6 * (1 - lows(t));
    const appear = smoothstep(T0 - 0.5, tViol + 1.5, t);
    farMat.uniforms.uAppear.value = 0.25 + 0.75 * appear;
    midMat.uniforms.uAppear.value = smoothstep(tViol - 0.3, tViol + 2.5, t) * 0.999 + (t > tViol + 2.5 ? 0.001 : 0);
    farSketch.visible = t < tViol + 3;
    const ac = actOf(t);
    // vesi: sumumeri (1) ja joki (3)
    mist.mesh.visible = ac <= 1;
    river.mesh.visible = ac === 3 || (ac === 2 && t > tGef - 8);
    for (const w of [mist, river]) { w.u.uTime.value = t; w.u.uGlint.value = 0.25 + 0.6 * S.fam.harp(t) + 0.4 * winds(t); }
    // välkerenkaat harpun kohtauksissa (harppu = lähdetieto: kohtaukset 6, 14, 20, 40, 43, 52)
    const harpScenes = [6, 14, 20, 40, 43, 52, 53];
    const recent = S.onsetsIn(t - 2.8, t + S.LEAD).filter((o) => harpScenes.includes(sceneAt(o).n)).slice(-16);
    const wtr = ac === 3 ? river : mist;
    wtr.rings.forEach((R, i) => { const o = recent[i]; if (o === undefined) { R.set(0, 0, -99, 0); return; } R.set(o + 6 * (hash1(Math.round(o * 97)) - 0.5) + 2, wtr.mesh.position.y + 0.6 * hash1(Math.round(o * 31)), o - S.LEAD, 0.7); });
    // taivas: vuorokausi (Runge) ja jaksojen väripartituuri
    const u = SKY.u;
    u.uTime.value = t;
    u.uHorY.value = 0;
    const dawn = smoothstep(T0, tViol + 2, t), morn = smoothstep(A('held_vasket_t13'), A('held_reh8'), t);
    const sam = smoothstep(TW - 1, TW + 6, t) * (1 - smoothstep(A('wid_voitto'), tGef, t));
    const eve = smoothstep(A('wid_voitto'), tGef + 5, t);
    const night = smoothstep(tRak - 30, tRak + 10, t);
    const toPaper = smoothstep(tHil, tHil + 8, t) * (1 - smoothstep(tWal - 2, tWal + 4, t));
    const war = smoothstep(tTais - 6, tTais + 4, t);
    // ennen ensimmäistä säveltä taivasta ei ole painettu: kermapaperi (kohtaus 0)
    const printed = smoothstep(T0 - 1.0, T0 + 3.0, t);
    u.uBlackTop.value = printed * clamp(0.85 * (1 - dawn) + 0.3 * sam + 0.55 * night * (1 - toPaper) + 0.5 * war);
    u.uBlueAmt.value = printed * (1 - 0.6 * toPaper);
    u.uBlueH.value = mix(-0.2, 0.55, morn) + 0.25 * (S.reg(t) - 0.5) - 0.3 * eve;
    u.uRedAmt.value = printed * clamp(0.75 * dawn * (1 - morn * 0.7) + 0.6 * sam + 0.8 * eve * (1 - night) + 0.9 * war);
    u.uMurk.value = 0.45 * sam * (1 - smoothstep(tMol + 3, tR17 + 20, t)) + 0.4 * sam * smoothstep(tAtt, tAtt + 3, t) * (1 - smoothstep(tNousee, A('wid_voitto'), t));
    u.uSun.value.set(0, -50, 1, 0);
    u.uRays.value = 0;
    u.uMoon.value.set(0, 0, 1, 0);
    // murk-taso
    const mk = u.uMurk.value;
    murk.position.set(t, 6, -2);
    murkMat.uniforms.uAppear.value = clamp(mk * 0.9);
    murkMat.uniforms.uRaster.value = 0;

    // --- sankarin taso: näytteet painetusta friisistä ---
    for (let k = 0; k < NB; k++) {
      const s = win0 + (span * k) / (NB - 1);
      xs[k] = s; xs2[k] = s;
      const sc = sceneAt(s);
      const st = sc.style;
      const on = s < T0 || s > tEnd ? 0 : heroOn(s) * (act2Hidden(s) ? 0 : 1) * (s > TD + 0.05 && s < TW ? 0 : 1);
      const M = mass(s);
      let tp = styleTop(s, st, heroTop(s), M);
      // jälkiliike painokohdassa
      const age = t - s;
      tp += 0.35 * Math.exp(-age / 0.9) * Math.sin(age * 8.5) * (0.3 + M);
      // etureuna kapenee siveltimen tavoin painokohdassa (taso painuu, ei katkea pystysuoraan)
      let th = (0.3 + 2.0 * M) * smoothstep(-0.05, 0.7, age) * (st === 'massa' ? 1.35 : st === 'pehmea' || st === 'duetto' ? 0.6 : st === 'kutsu' ? 0.4 : 1);
      if (st === 'taistelu') th *= vnoise1(s * 1.7, 3) > 0.35 ? 1 : 0.08;   // fragmentointi
      // avauksen nousu: taso syntyy laakson kaistalta
      if (s < T0 + 9) { const r = smoothstep(T0, T0 + 9, s); tp = mix(0.8, tp, r); th *= 0.4 + 0.6 * r; }
      const dk = darkAt(s);
      const hh = th * on;
      top[k] = tp; bot[k] = tp - hh * (1 - dk);
      dT[k] = tp; dB[k] = tp - hh * dk;
      // toinen kaista (kaksi käyrätorvea)
      const two = st === 'kaksi' ? on : 0;
      t2[k] = tp - th - 0.6; b2[k] = tp - th - 0.6 - 0.8 * th * two;
      // kiehkurat (puupuhaltimet sivuäänenä) tason yllä
      const wk = st === 'kiehkurat' ? smoothstep(0.1, 0.4, winds(s)) * on : 0;
      wy[k] = tp + 0.9 + 0.55 * Math.sin(s * 3.3) + 0.3 * Math.sin(s * 7.1); ww[k] = 0.22 * wk;
      // purppura huipussa: kohtaamiskohta omalla laatalla
      const pk = st === 'huippu' ? smoothstep(tHuippu, tHuippu + 3, s) * (1 - smoothstep(tHuippu + 12, tHuippu + 16, s)) * on : 0;
      pT[k] = tp; pB[k] = tp - 0.45 * pk;
    }
    heroB.band(xs, top, bot);
    heroD.band(xs, dT, dB);
    strand2.band(xs2, t2, b2);
    wisp.line(xs, wy, ww);
    purple.band(xs, pT, pB);
    // alttoviulu (kohtaus 15): sininen katkoviivoitus kaistojen välissä
    for (let k = 0; k < NB; k++) { const s = xs[k]; const on = sceneAt(s).style === 'kaksi' ? 1 : 0; ly[k] = top[k] - 0.3 - 0.4 * Math.sin(s * 2.1); lw[k] = on * (Math.sin(s * 9) > 0 ? 0.07 : 0); lx[k] = s; }
    viola.line(lx, ly, lw);
    // viulut sivuäänenä (jakso 1): nouseva viivoitus taivaalla
    for (let k = 0; k < NB; k++) { const s = xs[k]; const a1 = actOf(s) === 1 ? smoothstep(0.35, 0.7, violin(s)) : 0; ly[k] = 8.5 + 1.8 * clamp((S.melody(s) - 60) / 30) + 0.3 * Math.sin(s * 1.7); lw[k] = 0.06 * a1 * (Math.sin(s * 14) > -0.2 ? 1 : 0); }
    windLines.line(xs, ly, lw);

    // --- kumppanin viiva (jaksot 3–4) ---
    const tVast = [A('gef_vastaus1'), A('gef_vastaus2'), A('gef_vastaus3')];
    for (let k = 0; k < NB; k++) {
      const s = xs[k];
      const a3 = actOf(s) >= 3 && s < tTais + 20;
      const st = sceneAt(s).style;
      const v = a3 ? smoothstep(0.12, 0.32, violin(s)) : 0;
      // kumppanin rekisteri: viulun ala sävelistä (G3) ylimpään taivaan kaistaan
      let y = 6.5 + clamp((S.melody(s) - 67) / 30, -0.2, 1) * 5.5, x = s;
      // mielialat (kohtaus 44: oppaan järjestys jaksorajoissa; muualla tyylin taulukko mitatuista piirteistä)
      const seg = S.segAt(s);
      const kseg = seg ? seg.k : 0;
      const mood = st === 'duetto' || st === 'huippu' ? 'kietoutuu' : sceneAt(s).n === 44 ? ['kaipaus', 'ilo', 'kevyt', 'hellyys', 'sarkasmi'][kseg % 5] : sceneAt(s).n === 49 || sceneAt(s).n === 46 ? 'riehakkuus' : 'hellyys';
      let w = 0.16;
      if (mood === 'kaipaus') { x += 0.25 * Math.cos(s * 6); y += 0.25 * Math.sin(s * 6) - 0.2 * Math.abs(Math.sin(s * 1.5)); }
      else if (mood === 'ilo') y += 0.45 * Math.abs(Math.sin(s * 4));
      else if (mood === 'kevyt') { y += 0.3 * Math.sin(s * 11); w *= Math.sin(s * 5) > -0.3 ? 1 : 0; }
      else if (mood === 'hellyys') { w = 0.11; }
      else if (mood === 'sarkasmi') y += 0.5 * (2 * Math.abs(((s * 2.2) % 1) - 0.5) - 0.5) * 2;
      else if (mood === 'riehakkuus') { x += 0.6 * Math.cos(s * 4.5); y += 0.6 * Math.sin(s * 4.5); w = 0.11; }
      else if (mood === 'kietoutuu') { y = top[k] - 0.3 + 0.9 * Math.sin(s * 1.6); w = 0.1; }
      lx[k] = x; ly[k] = y; lw[k] = w * (mood === 'kietoutuu' ? Math.max(v, heroOn(s)) * (a3 ? 1 : 0) : v) * (tVast.some((tv) => s > tv && s < tv + 4) ? 0.3 : 1);
    }
    lineB.line(lx, ly, lw);

    // --- pisteet ---
    dotM.begin(); redDot.begin(); blueRaster.begin();
    const scatter = smoothstep(A('wid_voitto'), A('wid_voitto') + 8, t);
    for (const p of pts) {
      if (p.t < win0 || p.t > t + S.LEAD) continue;
      const age = t - p.t;
      let x = p.t, y = p.y, sx = p.s * 2.2, sy = p.s * 2.2;
      // venytys ja litistys: vain vastustajille, fraasin tasoitettu liike (ei nuotinalkuja)
      const wob = Math.sin(t * 2.2 + p.r1 * 6.28);
      if (p.type === 'dehring') { sx *= 1.3 + 0.25 * wob; sy *= 0.75 - 0.15 * wob; dotM.add(x, y, 0.1, sx, sy); dotM.add(x, y + 1.75, 0.1, sx, sy); continue; }
      if (p.type === 'vapisevat') { x += 0.05 * Math.sin(t * 11 + p.r2 * 9); }
      if (p.type === 'fagotti') { y += 0.25 * Math.abs(Math.sin(t * 3 + p.r1 * 6)); sx *= 1.2; }
      if (p.type === 'ovi') { x = t + 9 + 2 * p.r2; }
      if (p.type === 'uni') { sx *= 0.6 + 0.4 * Math.sin(t * 0.7 + p.r1 * 6); sy = sx; }
      if (p.type === 'virveli') { sy *= 0.6; }
      // voitto: pisteet hajoavat ulos kehyksestä
      if (actOf(p.t) === 2 && scatter > 0) { const d = scatter * 30; x += (p.r1 - 0.5) * d; y += (p.r2 - 0.3) * d; }
      // neulan ensimmäinen pisto: piikki
      if (p.type === 'neula') { dotM.add(x, y, 0.1, sx * 0.6, sx * 3.5, 0.3 * (p.r2 - 0.5)); continue; }
      dotM.add(x, y, 0.1, sx, sy);
    }
    // karikatyyri: kohtauksen 1 kaari punamustina pisteinä
    if (t > t78 - S.LEAD && t < t9 + 25) {
      const L = Math.min(t, t78 + 8) - t78;
      for (let i = 0; i < 60; i++) {
        const u2 = i / 60;
        if (u2 * 8 > L) break;
        const s = T0 + u2 * 10;
        const yy = yReg(clamp(S.melody(s), 36, 79));
        for (let j = 0; j < 6; j++) redDot.add(t78 + u2 * 8, yy - j * 0.42, 0.12, 0.13 + 0.08 * hash1(i * 7 + j), 0.13 + 0.08 * hash1(i * 7 + j));
      }
    }
    // puupuhaltimet neutraalina sinisenä rasterina (kohtaus 47)
    for (const o of S.onsetsIn(Math.max(win0, A('gef_puupuhaltimet')), Math.min(t, A('gef_leimahdus')))) { if (S.fam.winds(o) > 0.2) blueRaster.add(o, 5.5 + 2.5 * hash1(Math.round(o * 77)), 0.05, 0.09, 0.09); }
    // pasuunat: leimasimen tahrat
    for (const b of blots) if (b < t + S.LEAD && b > win0) for (let j = 0; j < 7; j++) dotM.add(b + 0.3 * (hash1(j + b) - 0.5), 4 + 0.5 * (hash1(j * 3 + b) - 0.5), 0.12, 0.35 + 0.2 * hash1(j), 0.25 + 0.2 * hash1(j + 1));
    dotM.end(); redDot.end(); blueRaster.end();

    // --- iskujen elementit ---
    tips.begin();
    t6.forEach((th) => {
      if (th > t + S.LEAD || th < win0) return;
      const a = t - th + S.LEAD;
      const base = heroTop(th) + 1.4;
      for (let j = 0; j < 8; j++) {
        const flut = Math.exp(-a / 0.8) * Math.sin(a * 14 + j);
        const ln = 0.55 * (1 - Math.exp(-a / 0.06));
        tips.add(th - 1.6 + j * 0.45, base + 0.15 * Math.sin(j * 1.3), 0.03, ln, ln * (1 + 0.3 * flut), 0.15 * flut + 0.2);
      }
    });
    tips.end();
    stamps.begin();
    fate.forEach((f, k) => { if (f.t <= t + S.LEAD && f.t > win0) { const sz = 0.7 + 0.08 * f.z; stamps.add(f.t, heroTop(f.t) + 1.2 + 1.3 * k, 0.04, sz * 0.6, sz); } });
    for (const s of sfz) if (s <= t + S.LEAD && s > win0) stamps.add(s, heroTop(s) + 0.9, 0.04, 0.18, 0.35);
    stamps.end();
    // reh9: kolme nousevaa kaarta (iskut aloittavat)
    // (piirretään tason kaistoina: kaaret ovat lyhyitä punaisia vetoja kolmella korkeudella)
    // pöllähdykset
    puffs.forEach((g, i) => {
      const d = drum.filter((x) => x <= t + S.LEAD && x > t - 1).slice(-10)[i];
      g.visible = d !== undefined;
      if (!g.visible) return;
      const a = t - d + S.LEAD;
      g.position.set(d + 0.5 * (hash1(i * 5 + Math.round(d)) - 0.5), nearF(d) - 0.2, -7.5);
      g.scale.set(0.8 + 0.6 * a, 0.8 + 0.4 * a, 1);
      puffMats[i].uniforms.uAppear.value = 1 - smoothstep(0.4, 1.0, a);
    });
    splash.visible = t >= cym - S.LEAD && t < cym + 1.2;
    if (splash.visible) { const a = t - cym + S.LEAD; splash.position.set(cym, 2.0, 0.2); splash.scale.setScalar(0.9 + 0.3 * a); splash.material.uniforms.uAppear.value = 1 - smoothstep(0.6, 1.2, a); }

    // --- selkäkuvat, kuu, sädekehä, viirit ---
    fig1.root.visible = t > T0 - 1 && t < T0 + 40;
    fig1.root.position.set(T0 + 1.2, 0.2, 0.5);
    fig1.root.scale.setScalar(1.05);
    fig1.M.cape.uniforms.uTime.value = t;
    fig2.root.visible = t > tChord - 30 && t < TW;
    fig2.root.position.set(peakX, 9.0, -2.9);
    fig2.root.scale.setScalar(0.7);
    fig2.M.cape.uniforms.uTime.value = t;
    peak.visible = t > tChord - 40 && t < TW + 2;
    const rays = (smoothstep(tChord + 1, TD - 0.5, t) * 0.85 + 0.15 * smoothstep(TD - 0.5, TD - S.LEAD, t)) * (1 - smoothstep(TD - S.LEAD, TD + 0.2, t));
    halo.visible = haloSun.visible = rays > 0.01;
    haloSun.position.set(peakX, 9.0 + 2.2, -3.4);
    const hp = haloG.getAttribute('position');
    for (let r = 0; r < NR; r++) {
      const a = (r / NR) * TAU;
      const band = clamp(S.bands[r % 6](Math.min(t, TD)) * 1.4);
      const r0 = 1.5, r1 = r0 + rays * (1.5 + 5 * band);
      const da = 0.028;
      const cx = peakX, cy = 9.0 + 2.2;
      hp.setXYZ(4 * r, cx + r0 * Math.cos(a - da), cy + r0 * Math.sin(a - da), 0);
      hp.setXYZ(4 * r + 1, cx + r0 * Math.cos(a + da), cy + r0 * Math.sin(a + da), 0);
      hp.setXYZ(4 * r + 2, cx + r1 * Math.cos(a - da * 0.6), cy + r1 * Math.sin(a - da * 0.6), 0);
      hp.setXYZ(4 * r + 3, cx + r1 * Math.cos(a + da * 0.6), cy + r1 * Math.sin(a + da * 0.6), 0);
    }
    hp.needsUpdate = true;
    haloSketch.visible = t > A('held_reh10') - 2 && t < tChord + 1;
    // kuu ja kaksi hahmoa (kohtaus 58)
    const mx = tJalki + 39;   // kohtauksen 58 still-hetken kohdalla, jo painettu
    moon.visible = t > tRak - 20 && t < tHil + 4;
    moon.position.set(mx + 6, 16, -60);
    figA.root.visible = figB.visible = t > tJalki - 1 && t < tUni + 5;
    figA.root.position.set(mx, 0.6, 0.4); figA.root.scale.setScalar(0.85);
    figA.M.cape.uniforms.uTime.value = t;
    figB.position.set(mx + 0.9, 0.6, 0.38); figB.scale.setScalar(0.95);
    // kolme viiriä samassa tuulessa
    flagsets.forEach((f) => { f.g.visible = t > f.tk - 3 && t < f.tk + 60; f.ms.forEach((m, i) => { m.uniforms.uTime.value = t + i * 0.4; m.uniforms.uAmp.value = 0.12 + 0.2 * S.fam.tpt(t); }); });
    // trumpettien huudot taistelussa: punaiset kiilat (stamps-instanssit lisätään erikseen)
    return { act: ac, murk: mk, scene: mainScene };
  }
  return { scene, update, heroTop, heroTopSlow, actOf, trumpets };
}
