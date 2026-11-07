// I, kuutamojoki: ohjauksen (docs/ohjaus.md, luku 3) otot 3.9–3.13 (gef_rakkaus … wal_kulissi1).
//   3.9  astuvat veneeseen; ritari soutaa, kumppani ohjaa; viiri ja viiva punokseksi mastossa; glissandot kuun väreinä
//   3.10 olentojen siluetit rannalla; ritari nousee seisomaan keihäs kädessä niiden ja kumppanin väliin; punos kiristyy
//   3.11 purppura punoksen kohtaamiskohdassa (vain tässä); ritari laskee keihään ja kääntyy kumppaniin; teemaviiva palaa
//   3.12 vene rantaan; kaksi hahmoa selin katsoo kuuta; jokaisella käyrätorvikutsulla pään kääntö kaukaisuuteen
//   3.13 mustat pisteet tähtien joukossa; ritari nousee ja katsoo pimeään, kumppani nukkuu; hakee viirin ja hevosen; paperi
// Ajat ankkureista (S.A) ja jaksorajoista (S.segs), mitatut kanavat (S.fam, S.energy). Puhdas seek(t). Yksi tuuli (+x).

import * as THREE from 'three';
import { C, U, HALFTONE, ink, flat, group, poly, circle, rect, strokeGeo, ridgeGeo, earleTree, waveMat, pennantGeo, sky as makeSky, water, clamp, smoothstep, mix, hash1 } from './paper.js';
import { glide, ease, leader } from './hero.js';
import { common, reflectDashes } from './world.js';
import { knightBack, KP, kpose, kmix, horse, poseHorse, armIK, bodyScale, OAR } from './puppets.js';
import { oboeDuck, cAnglaisHeron } from './critters.js';
import { tipTrail, heroGate } from './brush.js';
import { companionFigure, braid, dirOf } from './companion.js';

// --- Vesi: sama rajapinta kuin paper.js:n water(), paksummat välkeviivat ja kuun polku ---------------
const WATER_FS = /* glsl */ `
  uniform float uCell, uTime, uGlint, uDark, uDim, uMoonX, uMoonAmt, uTop;
  uniform vec3 uBase, uDeep, uPaper;
  uniform vec4 uRings[16];
  varying vec3 vW;
  ${HALFTONE}
  void main() {
    vec3 c = uBase;
    float depth = clamp((uTop - vW.y) / 4.2, 0.0, 1.0);
    c = mix(c, uDeep, halftone(depth * 0.7 + uDark, 0.26, uCell));
    float rowF = vW.y / 0.3;
    float row = floor(rowF);
    float line = 1.0 - smoothstep(0.1, 0.22, abs(fract(rowF) - 0.5));
    float moonB = uMoonAmt * exp(-pow((vW.x - uMoonX) / (1.0 + 2.2 * (1.0 - depth)), 2.0));
    float dash = step(0.7 - 0.42 * moonB, vnoise(vec2(vW.x * 1.0 + uTime * (0.25 + 0.2 * hash12(vec2(row, 1.0))), row * 1.3)));
    c = mix(c, uPaper, dash * line * clamp(uGlint * 0.55 + moonB * 0.9, 0.0, 1.0) * (1.0 - 0.5 * depth));
    for (int i = 0; i < 16; i++) {
      vec4 R = uRings[i];
      if (R.w <= 0.0) continue;
      float age = uTime - R.z;
      if (age < 0.0 || age > 3.2) continue;
      vec2 d = (vW.xy - R.xy) * vec2(1.0, 3.0);
      float rr = abs(length(d) - age * 1.5 * R.w);
      float ring = (1.0 - smoothstep(0.05, 0.16, rr)) * exp(-age * 0.9);
      c = mix(c, uPaper, ring);
    }
    c = mix(c, vec3(0.12, 0.1, 0.095), halftone(uDim * 0.92, 0.785, uCell));
    gl_FragColor = vec4(c, 1.0);
  }
`;
// Paperipesu: koko ruudun paperi rasterikynnyksellä (muste kuivuu). Piirtyy viimeisenä; luonnos sen päälle.
const WASH_FS = /* glsl */ `
  uniform float uA;
  uniform vec3 uPaperC;
  ${HALFTONE}
  void main() {
    vec2 px = gl_FragCoord.xy;
    float th = vnoise(px * 0.012) * 0.6 + vnoise(px * 0.08) * 0.25 + vnoise(px * 0.5) * 0.15;
    float pa = smoothstep(th - 0.06, th + 0.06, uA * 1.12 - 0.06);
    if (pa < 0.5) discard;
    gl_FragColor = vec4(uPaperC, 1.0);
  }
`;
function bladeGeo(blades) {
  const pos = [];
  for (const pts of blades) for (let i = 1; i < pts.length - 1; i++) pos.push(pts[0][0], pts[0][1], 0, pts[i][0], pts[i][1], 0, pts[i + 1][0], pts[i + 1][1], 0);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(new Array((pos.length / 3) * 2).fill(0), 2));
  return g;
}

export function build(K) {
  const { S } = K;
  const W = common(S);
  const at = (id) => S.A(id).t;
  const tRak = at('gef_rakkaus'), tRakH = at('gef_rakkaus_hiljaa'), tHilj = at('gef_hiljenee'), tNousu = at('gef_nousu'), tKolk = at('gef_kolkutus');
  const tHuip = at('gef_huippu'), tSankH = at('gef_sankari_hiljaa'), tAalto = at('gef_aalto'), tJalki = at('gef_jalkihehku');
  const tUni = at('gef_arvostelijat_uni'), tHiljaisuus = at('gef_hiljaisuus'), tWal = at('wal_kulissi1');
  const win = (a, b, c, d, t) => smoothstep(a, b, t) * (1 - smoothstep(c, d, t));
  const fr = (a, b, k) => a + (b - a) * k;
  const segsIn = (a, b) => S.segs.filter((s) => s.a > a && s.a < b).map((s) => s.a);
  const pick = (list, i, fallback) => (list.length > i ? list[i] : fallback);
  const dirV = dirOf(K.viuluviiva);

  // --- Paikat --------------------------------------------------------------------------------------
  const BX0 = 11, DIST = 46, XEND = BX0 + DIST;
  const KX0 = BX0 - 3.4, FX0 = BX0 - 1.6;   // laiturilla ennen veneeseen astumista
  const ZB = -3.0, ZBD = -1.6;
  const DOCK_Y = 0.75, MID_Y = 1.4;
  const SEAT_K = { x: 0.2, y: 0.12 }, SEAT_C = { x: -1.7, y: 0.1 }, STAND_X = 0.5;   // kumppani perässä (peräsin), ritari airoissa; seisoo kumppanin ja kaislikon välissä
  const SHORE_K = XEND - 0.7, SHORE_C = XEND + 0.5, LANCE_X = XEND + 4.2, HORSE_X = XEND + 6.5;

  // Veneen kulku: nopeus soudusta ja soitosta (harppu, jouset), pysähtyy rannalle
  const tBoard = fr(tRak, tRakH, 0.3);
  const tDep = fr(tRak, tRakH, 0.38);
  const boatSpeed = W.integ((t) => {
    if (t < tDep || t > tJalki) return 0;
    const sp = 0.25 + 0.75 * clamp(0.6 * S.fam.harp(t) + 0.5 * S.energy.violins(t));
    return sp * smoothstep(tDep, fr(tRak, tRakH, 0.55), t) * (1 - 0.9 * smoothstep(tSankH, tJalki, t));
  });
  const boatTotal = boatSpeed(tJalki + 0.5) || 1;
  const boatP = (t) => clamp(boatSpeed(t) / boatTotal);
  function boatT(t) {
    const p = boatP(t);
    const away = smoothstep(0.0, 0.12, p) * (1 - smoothstep(0.82, 1.0, p));
    const yaw = 0.5 * smoothstep(tNousu, tKolk, t) * (1 - smoothstep(tHuip, tSankH, t));
    return { x: BX0 + DIST * p, y: mix(DOCK_Y, MID_Y, away) + 0.05 * Math.sin(t * 0.43), z: mix(ZBD, ZB, away), roll: 0.03 * Math.sin(t * 0.52 + 1.0), yaw, p };
  }
  const toWorld = (B, lx, ly, lz = 0) => {
    const cx = lx * Math.cos(B.yaw);
    return [B.x + cx * Math.cos(B.roll) - ly * Math.sin(B.roll), B.y + ly * Math.cos(B.roll) + cx * Math.sin(B.roll), B.z + lz];
  };

  // --- Soutu: vaihe harpusta ja jousista (kertymä), vain 3.9 ----------------------------------------------
  const rowPh = W.integ((t) => (t < tBoard + 1 || t > tHilj ? 0 : (0.22 + 0.33 * clamp(0.5 * S.fam.harp(t) + 0.5 * S.energy.violins(t))) * smoothstep(tBoard + 1, tBoard + 4, t) * (1 - smoothstep(tHilj - 3, tHilj, t))));
  const rowK = (t) => smoothstep(tBoard + 1, tBoard + 4, t) * (1 - smoothstep(tHilj - 3, tHilj, t));
  // Airot ovat esine kuten keihäs: hankain (kiertopiste) veneessä, kädet airon varrella sisäpuolella, lapa vedessä.
  // Airon kulma on soudun vaiheesta; ritarin kädet ratkaistaan airon varrelle (armIK), joten ote on sama laskenta kuin keihäällä.
  const LOCK = { x: SEAT_K.x + OAR.lock[0], y: SEAT_K.y + OAR.lock[1] };   // hankain veneen omissa koordinaateissa (puppets.js OAR, istuimesta)
  const OAR_IN = OAR.grips;              // kämmenten paikat hankaimesta sisäänpäin (lähempi, kauempi käsi)
  const rowS = (t) => Math.sin(Math.PI * 2 * rowPh(t)) * rowK(t);   // -1 kurotus, +1 veto
  const oarAng = (t) => OAR.mid + OAR.swing * rowS(t);
  function oarAxis(B, a) {
    const lk = toWorld(B, LOCK.x, LOCK.y, 0.34);
    const lx = -Math.sin(a) * Math.cos(B.yaw), ly = Math.cos(a);   // sisäänpäin: veneen kapeneminen ja kallistus kuten toWorld
    return { lock: lk, dir: [lx * Math.cos(B.roll) - ly * Math.sin(B.roll), lx * Math.sin(B.roll) + ly * Math.cos(B.roll)] };
  }
  // 3.10 nousee seisomaan (kolkutus), 3.11 laskee keihään ja kääntyy kumppaniin
  const standK = (t) => smoothstep(tKolk, tKolk + 3, t) * (1 - smoothstep(tSankH, tSankH + 4, t));
  const lowerK = (t) => smoothstep(tHuip, fr(tHuip, tSankH, 0.5), t);
  const liftK = (t) => smoothstep(tKolk, fr(tKolk, tHuip, 0.6), t);   // ennakointi: kärki kallistuu taakse ylös ennen huippua
  // muste vain gef_huippu .. gef_sankari_hiljaa (tuotantojako: 'yksi veto kuun yli'), ja silloinkin vain kun torvi soi
  const inkWin = (tt) => smoothstep(tHuip - 0.3, tHuip + 0.4, tt) * (1 - smoothstep(tSankH - 1.5, tSankH + 0.5, tt));
  const turnK = (t) => smoothstep(fr(tHuip, tSankH, 0.3), fr(tHuip, tSankH, 0.7), t) * (1 - smoothstep(tSankH, tSankH + 2.5, t));
  const dkA = fr(tAalto, tJalki, 0.4);
  const dk = (t) => smoothstep(dkA, tJalki - 0.02 * (tJalki - tAalto), t);
  const eb = (t) => smoothstep(tRak, tBoard, t);
  const SIT = kpose({ ...KP.sit, lean: 0.04, tilt: 0.05, aN: 0.45, eN: 1.0, aF: 0.3, eF: 0.9 });
  const STAND_BOAT = kpose({ ...KP.stand, lean: -0.04, tilt: 0.15, aN: 0.55, eN: 0.5, aF: -0.15, eF: 0.4, hN: 0.12, hF: -0.08 });
  function heroState(t) {
    const B = boatT(t);
    const e = ease(eb(t)), d = ease(dk(t));
    const sk = toWorld(B, SEAT_K.x, SEAT_K.y, 0.15);
    let x = mix(KX0, sk[0], e), y = mix(0, sk[1], e), z = mix(0, sk[2], e);
    const walk = smoothstep(0.02, 0.4, e) * (1 - smoothstep(0.6, 0.98, e));
    let p = kmix(KP.stand, kmix(KP.stepA, KP.stepB, 0.5 + 0.5 * Math.sin(t * 5.2)), walk);
    const rk = rowK(t), sd = standK(t);
    const seat = smoothstep(0.55, 1, e) * (1 - sd);
    p = kmix(p, SIT, seat);
    p = kmix(p, kmix(KP.rowA, KP.rowB, 0.5 + 0.5 * Math.sin(Math.PI * 2 * rowPh(t))), rk * seat);
    p = kmix(p, STAND_BOAT, sd);
    const standY = toWorld(B, STAND_X, 0.3, 0.15);
    x = mix(x, standY[0], sd); y = mix(y, standY[1], sd);
    if (d > 0) { x = mix(x, SHORE_K, d); y = mix(y, 0, d); z = mix(z, 0, d); }
    let facing = Math.cos(Math.PI * turnK(t));
    if (Math.abs(facing) < 0.12) facing = 0.12 * (facing < 0 ? -1 : 1);
    const lanceAng = mix(mix(0.1, -0.7, liftK(t)), 1.05, lowerK(t));
    // kädet airoille: istuessa veneessä molemmat kämmenet airon varrella (ei laiturilla, ei kun on noussut seisomaan)
    // airot vain kun keihäs ei ole kädessä (3.10 nousu: airot pois ennen keihästä; 3.11 jälkeen: keihäs pois ennen airoja)
    const free = smoothstep(tBoard - 1.5, tBoard - 0.7, t) * (t < tSankH ? 1 : smoothstep(tSankH + 2.0, tSankH + 3.0, t));
    const ow = seat * (1 - d) * free * (1 - smoothstep(0.15, 0.45, sd));
    let oarA = oarAng(t);
    if (ow > 0.001) {
      const ax = oarAxis(B, oarAng(t));
      const ex = bodyScale(p, facing);
      const to = (g) => [(ax.lock[0] + ax.dir[0] * g - x) / ex, ax.lock[1] + ax.dir[1] * g - y];
      const n = armIK(lead.P, p, true, ...to(OAR_IN[0])), f = armIK(lead.P, p, false, ...to(OAR_IN[1]));
      p = { ...p, aN: mix(p.aN, n.a, ow), eN: mix(p.eN, n.e, ow), aF: mix(p.aF, f.a, ow), eF: mix(p.eF, f.e, ow) };
    }
    return { x, y, z, facing, pose: p, lanceAng, aboard: e > 0.02 && d < 0.98, sd, seat, ow, oarA };
  }
  const hasLance = (t) => t < tBoard - 1.5 || (standK(t) > 0.5 && t < tSankH + 2);
  function figState(t) {
    const B = boatT(t);
    const sk = toWorld(B, SEAT_C.x, SEAT_C.y, 0.2);
    const e = ease(eb(t)), d = ease(dk(t));
    let x = mix(FX0, sk[0], e), y = mix(0, sk[1], e), z = mix(0, sk[2], e);
    if (d > 0) { x = mix(sk[0], SHORE_C, d); y = mix(sk[1], 0, d); z = mix(sk[2], 0, d); }
    return { x, y, z, e, d, roll: B.roll * e * (1 - d) };
  }

  // --- Käyrätorvikutsut (3.12): mitatut huiput torvikanavasta jälkihehkussa ----------------------------
  const calls = (() => {
    const v = [];
    for (let t = tJalki; t < tUni; t += 0.1) v.push([t, S.fam.horns(t)]);
    const peaks = [];
    for (let i = 3; i < v.length - 3; i++) if (v[i][1] > 0.25 && v[i][1] >= v[i - 1][1] && v[i][1] > v[i + 1][1] && v[i][1] > v[i - 3][1] + 0.05) peaks.push(v[i]);
    peaks.sort((a, b) => b[1] - a[1]);
    const picked = [];
    for (const p of peaks) if (picked.every((q) => Math.abs(q[0] - p[0]) > 8) && picked.length < 4) picked.push(p);
    const ts = picked.map((p) => p[0]).sort((a, b) => a - b);
    while (ts.length < 4) ts.push(tJalki + ((tUni - tJalki) * (ts.length + 1)) / 5);
    return ts.sort((a, b) => a - b);
  })();
  const headTurn = (t) => calls.reduce((m, c) => Math.max(m, win(c - 0.1, c + 1.0, c + 3.0, c + 5.5, t)), 0);

  // --- Otot: leikkaukset ankkureissa ja jaksorajoissa ------------------------------------------------------
  const focusX = (t) => (t < tJalki ? boatT(t).x : XEND);
  const P = (s, t) => { const f = (s.follow ?? 0) * focusX(t); return { pos: [s.cx + f, s.y, s.z], look: [s.lx + f, s.ly, s.lz ?? 0], fov: s.fov }; };
  const mixS = (a, b, w) => { const o = {}; for (const k in a) o[k] = typeof a[k] === 'number' ? a[k] + ((b[k] ?? a[k]) - a[k]) * w : a[k]; return o; };
  const sh = (name, a, b, s0, s1 = s0) => ({ name, a, b, cam: (u, t) => P(mixS(s0, s1, glide(u)), t) });
  const shots = [];
  const WIDE = { cx: -3, follow: 1, y: 2.9, z: 20, lx: 1.2, ly: 3.8, fov: 42 };
  const TWO = { cx: -1.4, follow: 1, y: 2.4, z: 11.5, lx: 0.2, ly: 2.6, fov: 40 };
  const BRAID = { cx: -0.6, follow: 1, y: 3.5, z: 14, lx: 2.2, ly: 4.2, fov: 42 };
  const c52 = segsIn(tRak + 4, tRakH - 3), c53 = segsIn(tRakH + 4, tHilj - 4);
  const e9 = [tRak, ...c52, tRakH, ...c53, tHilj];
  const kinds = [WIDE, TWO, BRAID];
  const names = ['3.9 laaja: veneeseen', '3.9 kaksi hahmoa: soutaa, ohjaa', '3.9 punos mastossa'];
  e9.slice(0, -1).forEach((a, i) => {
    const b = e9[i + 1];
    const k = i % 3;
    const s0 = kinds[k];
    shots.push(sh(names[k] + (i >= 3 ? ' (mp)' : ''), a, b, s0, { ...s0, z: s0.z - 0.8, y: s0.y + 0.15 }));
  });
  shots.push(sh('3.10 hiljenee: leijuu', tHilj, tNousu, { cx: -1.4, follow: 1, y: 2.9, z: 12.5, lx: 1.0, ly: 3.7, fov: 42 }, { cx: -1.0, follow: 1, y: 3.0, z: 13.5, lx: 1.1, ly: 3.8, fov: 42 }));
  shots.push(sh('3.10 nousu', tNousu, tKolk, { cx: -1.0, follow: 1, y: 3.0, z: 13.5, lx: 1.1, ly: 3.8, fov: 42 }, { cx: -0.6, follow: 1, y: 3.0, z: 14, lx: 1.6, ly: 3.6, fov: 42 }));
  shots.push(sh('3.10 ovella: siluetit, nousee seisomaan', tKolk, tHuip, { cx: -1.0, follow: 1, y: 2.8, z: 14.5, lx: 2.8, ly: 3.2, fov: 42 }, { cx: -1.0, follow: 1, y: 2.9, z: 14, lx: 2.6, ly: 3.3, fov: 42 }));
  shots.push(sh('3.11 huippu: purppura, kääntyy kumppaniin', tHuip, tSankH, { cx: -1.0, follow: 1, y: 3.0, z: 13, lx: 1.0, ly: 4.0, fov: 42 }, { cx: -1.0, follow: 1, y: 3.5, z: 13, lx: 1.0, ly: 4.5, fov: 42 }));
  const c57 = segsIn(tSankH + 3, tAalto - 2);
  shots.push(sh('3.12 sankari hellänä', tSankH, pick(c57, 0, tAalto), { cx: -1.6, follow: 1, y: 2.6, z: 12, lx: 0.4, ly: 3.0, fov: 40 }, { cx: -1.8, follow: 1, y: 2.7, z: 13, lx: 0.5, ly: 3.1, fov: 40 }));
  if (c57.length) shots.push(sh('3.12 vene kohti rantaa', c57[0], tAalto, { cx: -2.2, follow: 1, y: 2.9, z: 16, lx: 1.4, ly: 3.7, fov: 42 }, { cx: -2.6, follow: 1, y: 2.8, z: 17.5, lx: 1.4, ly: 3.6, fov: 42 }));
  shots.push(sh('3.12 aalto: rantaan', tAalto, tJalki, { cx: -2.6, follow: 1, y: 2.8, z: 17.5, lx: 1.4, ly: 3.6, fov: 42 }, { cx: -2.0, follow: 1, y: 2.5, z: 15, lx: 1.2, ly: 3.2, fov: 42 }));
  const c58 = segsIn(tJalki + 8, tUni - 8);
  const e12 = [tJalki, ...[0, 2, 4, 6].map((i) => pick(c58, i, null)).filter((x) => x !== null && (x - tJalki) > 8), tUni];
  const shore = [
    ['3.12 kaksi hahmoa selin, kuu', { cx: XEND - 0.6, follow: 0, y: 1.7, z: 12, lx: XEND + 0.1, ly: 2.5, fov: 40 }, { cx: XEND - 0.3, follow: 0, y: 1.8, z: 11, lx: XEND + 0.1, ly: 2.6, fov: 40 }],
    ['3.12 laaja: kuu ja joki', { cx: XEND - 3, follow: 0, y: 3.0, z: 26, lx: XEND + 1, ly: 5.5, fov: 44 }, { cx: XEND - 2, follow: 0, y: 3.0, z: 24, lx: XEND + 1, ly: 5.8, fov: 44 }],
    ['3.12 taivas', { cx: XEND - 1, follow: 0, y: 2.4, z: 21, lx: XEND + 3, ly: 9.5, fov: 50 }, { cx: XEND, follow: 0, y: 2.6, z: 21, lx: XEND + 4, ly: 10.5, fov: 50 }],
    ['3.12 kaksi hahmoa: kutsu kaukaisuudesta', { cx: XEND - 0.8, follow: 0, y: 1.9, z: 10.5, lx: XEND + 0.2, ly: 2.6, fov: 40 }, { cx: XEND - 0.5, follow: 0, y: 2.0, z: 10, lx: XEND + 0.2, ly: 2.7, fov: 40 }],
    ['3.12 laaja: joen virta', { cx: XEND - 2, follow: 0, y: 3.0, z: 24, lx: XEND + 1, ly: 5.8, fov: 44 }, { cx: XEND - 1, follow: 0, y: 3.1, z: 22, lx: XEND + 1.5, ly: 6.0, fov: 44 }],
  ];
  e12.slice(0, -1).forEach((a, i) => { const [n, s0, s1] = shore[i % shore.length]; shots.push(sh(n, a, e12[i + 1], s0, s1)); });
  shots.push(sh('3.13 uni: pisteet tähdissä, nousee', tUni, tHiljaisuus, { cx: XEND - 0.5, follow: 0, y: 2.2, z: 12, lx: XEND + 0.1, ly: 4.0, fov: 44 }, { cx: XEND - 0.3, follow: 0, y: 2.6, z: 11, lx: XEND + 0.1, ly: 4.6, fov: 44 }));
  shots.push(sh('3.13 tyven: hakee viirin ja hevosen, paperi', tHiljaisuus, tWal + 1, { cx: XEND - 0.5, follow: 0, y: 2.8, z: 14, lx: XEND + 1.5, ly: 4.6, fov: 44 }, { cx: XEND + 1.5, follow: 0, y: 2.8, z: 17, lx: XEND + 3.5, ly: 5.0, fov: 44 }));
  const shotOf = (t) => { let s = shots[0]; for (const x of shots) if (t >= x.a) s = x; return s; };
  const camAt = (t) => { const s = shotOf(t); return s.cam(clamp((t - s.a) / Math.max(0.05, s.b - s.a)), t); };

  // --- Näyttämö ---------------------------------------------------------------------------------------
  const scene = new THREE.Scene();
  const SKY = makeSky(scene);
  const NSTAR = 170;
  const stars = new THREE.InstancedMesh(new THREE.CircleGeometry(1, 8), ink(C.paper, {}), NSTAR);
  stars.frustumCulled = false;
  stars.position.z = -470;
  scene.add(stars);
  const starP = Array.from({ length: NSTAR }, (_, i) => ({ x: -320 + 760 * hash1(i * 5 + 1), y: 70 + 280 * hash1(i * 5 + 2), r: 0.9 + 1.5 * hash1(i * 5 + 3) * hash1(i * 5 + 4), o: hash1(i * 5 + 9) }));
  const m4 = new THREE.Matrix4();
  const hillMat = ink(C.blue, { shade: C.black, raster: 0.55 });
  const hills = flat(scene, ridgeGeo(-400, 600, 22, 17, { lambda: 70, base: -300 }), hillMat, { z: -200, y: 3 });
  hills.userData.edge = { name: 'kukkulat' };
  const farGround = flat(scene, ridgeGeo(-400, 600, 0.5, 7, { lambda: 14, base: -12 }), ink(C.black, { shade: C.blue, raster: 0.3 }), { z: -10, y: 2.5 });
  farGround.userData.edge = { name: 'vastaranta' };
  const treeMat = ink(C.black, { shade: C.blue, raster: 0.22 });
  for (let i = 0; i < 62; i++) {
    const h = 2.2 + 2.6 * hash1(i * 3 + 100) + (i % 5 === 0 ? 1.4 : 0);
    flat(scene, earleTree(h, h * 0.42, i * 11 + 3), treeMat, { x: -125 + i * 5.9 + 3 * hash1(i * 3 + 101), y: 2.6, z: -10.5 + 0.1 * (i % 3) });
  }
  const WATER_Z = -5.5;
  const riverW = water(scene, 1000, 24, { x: 50, y: -9.4, z: WATER_Z, base: C.blue, deep: C.black });
  riverW.mesh.material.fragmentShader = WATER_FS;
  riverW.mesh.material.uniforms.uMoonX = { value: 0 };
  riverW.mesh.material.uniforms.uMoonAmt = { value: 0 };
  riverW.mesh.material.uniforms.uDim = U.uDim;
  riverW.mesh.material.needsUpdate = true;
  riverW.mesh.userData.edge = { name: 'joki' };
  const meadowMat = ink(C.blue, { shade: C.black, raster: 0.4, grad: [C.black, 0.4, -3.5, 0.55] });
  const meadow = flat(scene, ridgeGeo(-400, 600, 0.5, 5, { lambda: 11, base: -40 }), meadowMat, { z: -0.4, y: -0.05 });
  meadow.userData.edge = { name: 'niitty' };
  const fore = flat(scene, ridgeGeo(-400, 600, 0.35, 21, { lambda: 6, base: -40 }), ink(C.black, { shade: C.blue, raster: 0.25 }), { z: 1.4, y: -1.25 });
  fore.userData.edge = { name: 'etuala' };
  const bigAt = [[-4, 14], [-8.5, 11.5], [-13, 15], [-19, 12.5], [XEND + 9, 14], [XEND + 13.5, 11], [XEND + 18, 15], [XEND + 26, 12.5], [-30, 15]];
  bigAt.forEach(([x, h], i) => flat(scene, earleTree(h, h * 0.44, i * 17 + 5), ink(C.black, { shade: C.blue, raster: 0.12 }), { x, y: -0.2, z: 0.3 + 0.1 * (i % 3) }));
  // laituri (lähtöranta)
  flat(scene, rect(3.2, 0.18, 0.5, 0.5), ink(C.black, {}), { x: BX0 - 1.2, y: 0.05, z: -0.9 });
  // kaislikko (3.10) veneen edessä, vastustajat kurkistavat
  const reedBlades = [];
  for (let i = 0; i < 54; i++) {
    const x = 9 * (i / 53) + 0.25 * (hash1(i * 7 + 1) - 0.5);
    const h = 0.6 + 0.6 * hash1(i * 7 + 2) + (i % 4 === 0 ? 0.5 : 0), lean = (hash1(i * 7 + 3) - 0.5) * 0.9, w = 0.07;
    reedBlades.push([[x - w, 0], [x + w, 0], [x + w * 0.7 + lean * 0.5, h * 0.55], [x + lean, h], [x - w * 0.7 + lean * 0.5, h * 0.55]]);
    if (i % 4 === 0) reedBlades.push([[x + lean - 0.06, h * 0.72], [x + lean + 0.06, h * 0.72], [x + lean + 0.06, h * 0.98], [x + lean - 0.06, h * 0.98]]);
  }
  const reeds = flat(scene, bladeGeo(reedBlades), ink(C.black, { shade: C.blue, raster: 0.15 }), { z: -0.2, y: 0.1 });
  const duck = oboeDuck(scene), heron = cAnglaisHeron(scene);
  const critMats = [...duck.mats, ...heron.mats];
  const reedBase = boatT(tKolk).x + 4.5;
  reeds.position.x = reedBase;
  duck.root.position.set(reedBase + 3.2, 0.15, -0.35);
  heron.root.position.set(reedBase + 6.4, 0.15, -0.35);
  heron.root.scale.set(1.15, 1.15, 1);
  // käyrätorvikaaret horisonttiin (3.12) ja kolmen viirin luonnos (3.13)
  const arcs = Array.from({ length: 4 }, (_, i) => {
    const pts = Array.from({ length: 24 }, (_, j) => { const u = j / 23; return [(u - 0.5) * 2.2, 0.6 * Math.sin(Math.PI * u)]; });
    const m = ink(C.red, {});
    return { mesh: flat(scene, strokeGeo(pts, 0.1), m, { x: XEND - 14 + i * 7 + 2 * hash1(i + 40), y: 4.3 + 0.5 * hash1(i + 50), z: -11 }), mat: m };
  });
  const sketchMat = ink(C.black, {});
  sketchMat.depthTest = false;
  const sketch = group(scene);
  [0, 1, 2].forEach((i) => {
    const x = (i - 1) * 3.6, y = 0.3 * hash1(i + 70);
    const pole = flat(sketch, strokeGeo([[x, y], [x, y + 2.6]], 0.16), sketchMat, {});
    const flag = flat(sketch, strokeGeo([[x, y + 2.6], [x + 1.3, y + 2.35], [x + 0.1, y + 2.1]], 0.14), sketchMat, {});
    pole.renderOrder = flag.renderOrder = 120;
  });
  sketch.position.set(XEND + 2, 4.6, -9);
  sketch.scale.setScalar(1.5);
  const wash = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: { uA: { value: 0 }, uPaperC: { value: C.paper } },
    vertexShader: 'void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }', fragmentShader: WASH_FS, depthTest: false, depthWrite: false,
  }));
  wash.frustumCulled = false;
  wash.renderOrder = 100;
  scene.add(wash);
  const MOON = { x: 92, y: 112, r: 20 };
  const moonDash = reflectDashes(scene, 11, C.paper);
  moonDash.mat.uniforms.uRaster.value = 0.5;
  // vene, airot, masto ja viiri
  const boatG = group(scene);
  const hull = group(boatG);
  const hullMat = ink(C.black, { shade: C.blue, raster: 0.1 });
  const rimMat = ink(C.paper, {});
  flat(hull, poly([[-2.8, 0.5], [-2.55, 0.0], [-1.6, -0.3], [1.4, -0.3], [2.4, 0.1], [3.0, 0.7], [2.6, 0.55], [2.3, 0.5]]), hullMat, { z: 0 });
  flat(hull, strokeGeo([[-2.8, 0.5], [-2.3, 0.5], [2.3, 0.5], [2.6, 0.55], [3.0, 0.7]], 0.07), rimMat, { z: 0.01 });
  flat(hull, poly([[-2.45, 0.28], [2.2, 0.28], [2.35, 0.1], [1.4, -0.28], [-1.6, -0.28], [-2.5, 0.0]]), hullMat, { z: 0.32 });
  flat(hull, strokeGeo([[-2.45, 0.28], [2.2, 0.28]], 0.05), rimMat, { z: 0.33 });
  flat(hull, rect(0.9, 0.09, 0.5, 0.5), hullMat, { x: 0.2, y: 0.3, z: 0.1 });
  flat(hull, rect(0.9, 0.09, 0.5, 0.5), hullMat, { x: -1.7, y: 0.3, z: 0.1 });
  const oarMat = ink(C.black, {});
  const oarN = group(hull, { x: 0.7, y: 0.5, z: 0.34 }), oarF = group(hull, { x: 0.7, y: 0.5, z: -0.02 });
  for (const o of [oarN, oarF]) { flat(o, rect(0.06, 2.6 + 1.5, 0.5, 2.6 / 4.1), oarMat, {}); flat(o, poly([[-0.12, -2.6], [0.12, -2.6], [0.1, -3.2], [-0.1, -3.2]]), oarMat, {}); }   // varsi sisään 1,5 (kädet) ja ulos 2,6; lapa vedessä
  const rudder = group(hull, { x: -2.55, y: 0.5, z: 0.34 });
  flat(rudder, rect(0.06, 1.6, 0.5, 1), oarMat, {});
  const mast = flat(boatG, rect(0.09, 5.3, 0.5, 0), ink(C.black, {}), { x: 1.7, y: 0.3, z: 0.05 });
  const penMat = waveMat(C.red, { shade: C.black, raster: 0, amp: 0.14, k: 6 });
  const pennant = new THREE.Mesh(pennantGeo(1.9, 0.5), penMat);
  pennant.frustumCulled = false;
  pennant.position.set(1.72, 5.45, 0.06);
  boatG.add(pennant);
  const boatDash = reflectDashes(scene, 7, C.black);
  // hahmot
  const lead = leader(scene, {});
  const back = knightBack(scene);
  back.root.visible = false;
  const fig = companionFigure(scene);
  const trail = tipTrail(scene, S, { seed: 6, gate: (tt) => inkWin(tt) * heroGate(S, tt), wmax: 0.5, win: 14 });
  const brG = group(scene);
  const br = braid(brG, 160);
  // rannalle isketty keihäs ja hevonen (3.13: hakee viirin ja hevosen)
  const shoreLance = group(scene, { x: LANCE_X, y: 0, z: 0.05 });
  flat(shoreLance, rect(0.05, 3.2, 0.5, 0), ink(C.black, {}), {});
  flat(shoreLance, poly([[-0.07, 3.2], [0.07, 3.2], [0, 3.52]]), ink(C.paper, {}), { z: 0.001 });
  const shorePen = waveMat(C.red, { shade: C.black, raster: 0, amp: 0.12, k: 6 });
  const shoreFlag = new THREE.Mesh(pennantGeo(1.5, 0.45), shorePen);
  shoreFlag.frustumCulled = false;
  shoreFlag.position.set(0.02, 3.1, 0.01);
  shoreLance.add(shoreFlag);
  const H = horse(scene, { mane: C.red });
  H.root.position.set(HORSE_X, 0, -0.6);
  H.root.scale.set(-1.05, 1.05, 1);
  // mustat tipat tähtien joukossa (3.13)
  const dropMat = ink(C.black, {}), dropRim = ink(C.paper, {});
  const drops = Array.from({ length: 6 }, (_, i) => {
    const g = group(scene, { x: XEND - 18 + 36 * hash1(i + 200), y: 7 + 9 * hash1(i + 210), z: -9 });
    flat(g, circle(0.26, 14), dropRim, { z: 0 });
    flat(g, circle(0.18, 14), dropMat, { z: 0.01 });
    return g;
  });
  const dropMats = [dropMat, dropRim];
  const winOnsets = S.onsetsIn(tUni - 1, tHiljaisuus + 1, (t) => S.fam.winds(t) > 0.08).slice(0, 6);
  const harpOns = S.onsetsIn(tRak, tJalki, (t) => S.fam.harp(t) > 0.4);
  // joen virta: välkkeiden kulku matalista jousista (roolit.json: sellot, bassot = maa ja virta)
  const flowV = (tt) => 0.3 + 1.6 * clamp(W.lows(tt));
  const flowT = W.integ(flowV);

  // --- Päivitys -------------------------------------------------------------------------------------------
  function update(t) {
    const w = 0.3 + 0.7 * W.wind(t);
    const windV = (tt) => { const q = W.wind(tt); return { x: 0.5 + 1.8 * q, y: 0.1 + 0.4 * q }; };
    const night = smoothstep(tRak - 1, tRak + 6, t);
    const cam = camAt(t);
    const u = SKY.u;
    u.uTime.value = t;
    u.uBlueAmt.value = 1;
    u.uBlueH.value = mix(-0.4, -0.5, night);
    u.uRedAmt.value = 0.3 * (1 - night);
    u.uBlackTop.value = 0.5 * night;
    u.uMurk.value = 0;
    u.uCloudGap.value.set(0, 0, 1, 0);
    u.uSun.value.set(-150, 12 - 30 * night, 22, 1 - smoothstep(tRak, tRak + 2, t));
    const moonK = smoothstep(tRak - 0.5, tRak + 4, t) * (1 - smoothstep(tHiljaisuus, tWal, t));
    u.uMoon.value.set(MOON.x, MOON.y, MOON.r, moonK);
    for (let i = 0; i < NSTAR; i++) {
      const p = starP[i];
      const k = smoothstep(0.35 + 0.6 * p.o, 0.5 + 0.6 * p.o, night * smoothstep(tRak - 2, tRak + 10, t)) * (0.55 + 0.45 * smoothstep(0.3, 1, S.reg(t) + 0.2));
      m4.makeScale(p.r * k, p.r * k, 1);
      m4.setPosition(p.x, p.y, 0);
      stars.setMatrixAt(i, m4);
    }
    stars.instanceMatrix.needsUpdate = true;
    hillMat.uniforms.uRaster.value = 0.45 + 0.2 * S.energy.violins(t);
    // vene ja airot
    const B = boatT(t);
    boatG.position.set(B.x, B.y, B.z);
    boatG.rotation.z = B.roll;
    hull.scale.x = Math.cos(B.yaw);
    mast.position.x = 1.7 * Math.cos(B.yaw);
    pennant.position.x = 1.72 * Math.cos(B.yaw);
    penMat.uniforms.uTime.value = t;
    penMat.uniforms.uAmp.value = 0.06 + 0.2 * w;
    const penK = smoothstep(tBoard - 1.5, tBoard, t) * (1 - smoothstep(tSankH + 1, tAalto, t));   // viiri mastoon, kun ritari astuu veneeseen; irti 3.12
    pennant.visible = penK > 0.02;
    penMat.uniforms.uAppear.value = penK;
    const rk = rowK(t);
    const ph = Math.PI * 2 * rowPh(t);
    const hsO = heroState(t);
    oarN.rotation.z = hsO.oarA; oarF.rotation.z = hsO.oarA;
    const oarOn = smoothstep(0.995, 1.0, hsO.ow);   // airo ilmestyy vasta kun kädet ovat sen varrella (ei välivaiheen irtoamista)
    oarN.visible = oarF.visible = oarOn > 0.02;
    oarMat.uniforms.uAppear.value = oarOn;
    rudder.rotation.z = 0.35 + 0.12 * Math.sin(t * 0.5) * rk;
    rudder.visible = oarN.visible;
    const mastTop = toWorld(B, 1.7, 5.45, 0.06);
    // jokivesi: harppu välkyttää, glissandot renkaina (kuun väreet)
    const wu = riverW.mesh.material.uniforms;
    wu.uTime.value = flowT(t);
    wu.uGlint.value = 0.25 + 0.75 * clamp(S.fam.harp(t));
    const moonRefX = cam.pos[0] + (MOON.x - cam.pos[0]) * 0.048;
    wu.uMoonX.value = moonRefX;
    wu.uMoonAmt.value = moonK * 0.9;
    let ri = 0;
    riverW.rings.forEach((r) => r.set(0, 0, -99, 0));
    for (let i = harpOns.length - 1; i >= 0 && ri < 12; i--) {
      const o = harpOns[i];
      if (o > t || t - o > 3) continue;
      riverW.rings[ri++].set(B.x + (hash1(i * 13) - 0.5) * 8, 0.6 + 1.6 * hash1(i * 17), o, 0.6 + 0.8 * hash1(i * 19));
    }
    moonDash.set(moonRefX, 2.5, 1.7, 2.0, WATER_Z + 0.1, t, moonK);
    boatDash.set(B.x, B.y - 0.45, 4.8 * Math.cos(B.yaw), 1.5, ZB - 0.2, t, 1 - smoothstep(tJalki - 4, tJalki, t));
    // ritari: laiturilta veneeseen, soutaa, nousee, laskee keihään, kääntyy; rannalla selkäkuva
    const hs = heroState(t);
    const lanceNow = hasLance(t);
    lead.place(t, heroState, windV, { capeWind: w * 0.5, noLance: !lanceNow, noBanner: !lanceNow, width: 0.8 });
    const showBack = dk(t) >= 0.98;
    lead.P.root.visible = !showBack;
    trail.set(t, (tt) => (hasLance(tt) && inkWin(tt) > 0.01 ? lead.tipAt(tt) : null), windV, tHuip - 1);
    back.root.visible = showBack;
    const rise = smoothstep(tUni + 0.1 * (tHiljaisuus - tUni), tUni + 0.45 * (tHiljaisuus - tUni), t);   // 3.13 nousee ja katsoo pimeään
    const fetch = smoothstep(tHiljaisuus, fr(tHiljaisuus, tWal, 0.6), t);                                   // hakee viirin ja hevosen
    if (showBack) {
      const sitS = mix(0.72, 1, rise);
      back.root.position.set(mix(SHORE_K, LANCE_X - 0.6, fetch), 0, 0.1);
      back.root.scale.set(1, sitS, 1);
      back.head.rotation.z = -0.1 + 0.3 * headTurn(t) + 0.15 * rise * (1 - fetch);
      back.armR.rotation.z = -0.9 * fetch;
      back.M.cape.uniforms.uTime.value = t;
      back.M.cape.uniforms.uAmp.value = 0.04 + 0.12 * w;
    }
    shoreLance.visible = t >= dkA;
    shorePen.uniforms.uTime.value = t;
    shorePen.uniforms.uAmp.value = 0.05 + 0.18 * w;
    const horseK = smoothstep(tHiljaisuus, fr(tHiljaisuus, tWal, 0.25), t);
    H.root.visible = horseK > 0.02;
    H.mats.forEach((m) => (m.uniforms.uAppear.value = horseK));
    poseHorse(H, 'stand', 0, 0, 0);
    H.head.rotation.z = -0.15 + 0.2 * fetch;
    // kumppani: hahmo laiturilta veneen perään (ohjaa), rannalle; uni 3.13
    const fy = figState(t);
    fig.root.visible = t < tWal + 2;
    fig.mat.uniforms.uAppear.value = 1;
    const sleep = smoothstep(tUni, tUni + 0.3 * (tHiljaisuus - tUni), t);
    fig.root.position.set(fy.x - 0.15 * sleep, fy.y, fy.z + 0.1);
    fig.root.rotation.z = fy.roll;
    fig.root.scale.set(1, mix(1, 0.78, sleep * showBack), 1);
    fig.pose(t, fy.e > 0.02 ? 'sentimentaali' : 'hellyys', {
      spin: showBack ? Math.PI : 0,
      bow: showBack ? 0.1 + 0.45 * sleep : 0.1 * fy.e * (1 - fy.d),
      tilt: showBack ? 0.1 + 0.3 * sleep : 0.05 * Math.sin(t * 0.37) - 0.12 * hs.sd,
      fan: 0.08 * fy.e, dir: dirV, wind: w, trail: showBack ? 0.45 : fy.e > 0.5 ? 0.6 : 1,
    });
    // punos: viiri ja viiva maston päällä; kiristyy ovella; purppura vain huipussa
    const lenK = smoothstep(tBoard, fr(tRak, tRakH, 0.7), t) * (1 - smoothstep(tSankH, tAalto, t));
    const loud = S.loud(t);
    const kol = win(tKolk, fr(tKolk, tHuip, 0.25), tHuip - 0.02, fr(tHuip, tSankH, 0.05), t);
    const tight = clamp(0.28 + 0.5 * smoothstep(0.2, 0.6, loud) + 0.7 * kol);
    const wid = (0.45 + 1.0 * smoothstep(0.15, 0.55, loud)) * (1 + 0.3 * smoothstep(tNousu, tKolk, t));
    const pur = win(tHuip, fr(tHuip, tSankH, 0.12), fr(tHuip, tSankH, 0.3), fr(tHuip, tSankH, 0.5), t);
    br.meshes.forEach((m) => { if (m.material !== br.purpleMat) m.visible = lenK > 0.02; });
    br.redMat.uniforms.uAppear.value = smoothstep(0.0, 0.6, lenK);
    brG.position.z = B.z + 0.1;
    br.set(t, mastTop[0], mastTop[1], 6.5 * lenK + 0.01, tight, lenK > 0.02 ? pur : 0, wid);
    // kaislikon vastustajat (3.10)
    const door = win(tKolk, fr(tKolk, tHuip, 0.25), tHuip - 0.05 * (tHuip - tKolk), fr(tHuip, tSankH, 0.25), t);
    critMats.forEach((m) => { m.uniforms.uAppear.value = door; });
    duck.root.visible = heron.root.visible = door > 0.02;
    duck.pose(0.5 * door, t);
    heron.pose(0.4 * door, t, 0);
    // käyrätorvikaaret horisonttiin (3.12)
    // punaiset kaaret pois (kuvasäännöt kohta 10: muste vain gef_huippu); pään käännöt kertovat kutsut
    arcs.forEach((a) => { a.mesh.visible = false; });
    // mustat tipat tähtien joukossa (3.13)
    let nDrops = 0;
    drops.forEach((g, i) => {
      const o = winOnsets[i] ?? (tUni + (i + 1) * 3);
      const k = win(o - 0.05, o + 0.5, o + 2.0, o + 4.0, t);
      g.visible = k > 0.02;
      if (g.visible) nDrops++;
      dropMats.forEach((m) => (m.uniforms.uAppear.value = k));
    });
    // yö haalistuu paperiksi, muste kuivuu; luonnos piirtyy lopuksi
    const dry = smoothstep(fr(tHiljaisuus, tWal, 0.1), tWal, t);
    wash.material.uniforms.uA.value = dry * 0.97;
    sketchMat.uniforms.uAppear.value = smoothstep(fr(tHiljaisuus, tWal, 0.45), fr(tHiljaisuus, tWal, 0.9), t);
    sketch.visible = t > tHiljaisuus;
    update.last = { B, hs, moonK, door, pur, tight, lenK, rk, nDrops, rise, fetch, sleep, dry, fy, ri };
    return { dim: 0.12 * night, wind: w, paper: 0 };
  }
  const r3 = (x) => Math.round(x * 1000) / 1000;
  function probe(t) {
    const L = update.last || {};
    const B = L.B || boatT(t);
    return {
      vene: { x: r3(B.x), y: r3(B.y), yaw: r3(B.yaw), p: r3(B.p) }, soutu: r3(rowK(t) * (0.5 + 0.5 * Math.sin(Math.PI * 2 * rowPh(t)))),
      seisoo: r3(standK(t)), keihas_alas: r3(lowerK(t)), kaantyy: r3(turnK(t)),
      punos: { pituus: r3(6.5 * (L.lenK ?? 0)), kireys: r3(L.tight ?? 0), purppura: r3(L.pur ?? 0) },
      kuu: r3(L.moonK ?? 0), vareet: L.ri ?? 0, olennot: r3(L.door ?? 0), kutsu: r3(headTurn(t)),
      hahmo: { x: r3((L.fy || figState(t)).x), nukkuu: r3(L.sleep ?? 0) }, selka: back.root.visible ? 1 : 0, nousee: r3(L.rise ?? 0), hakee: r3(L.fetch ?? 0),
      pisteet_n: L.nDrops ?? 0, paperi_pesu: r3(L.dry ?? 0), tuuli: r3(W.wind(t)), virta: r3(flowV(t)), muste_ikkuna: r3(inkWin(t)),
    };
  }
  // otetarkistus (main.js gripProbe): kämmenet airon akselilla (näkymäpuusta) ja lapa veneen pohjan alla (= vedessä)
  function grip() {
    const hs = update.last && update.last.hs;
    if (!hs || hs.ow < 0.995) return [];
    const v = new THREE.Vector3();
    scene.updateMatrixWorld(true);
    const hand = (near) => { (near ? lead.P.handN : lead.P.handF).getWorldPosition(v); return [v.x, v.y]; };
    const end = (y) => { v.set(0, y, 0).applyMatrix4(oarN.matrixWorld); return [v.x, v.y]; };
    const a = end(1.5), b = end(-3.2);
    const segD = (q) => { const ex = b[0] - a[0], ey = b[1] - a[1]; const u = clamp(((q[0] - a[0]) * ex + (q[1] - a[1]) * ey) / (ex * ex + ey * ey)); return Math.hypot(q[0] - a[0] - u * ex, q[1] - a[1] - u * ey); };
    const bottom = hull.localToWorld(new THREE.Vector3(0, -0.3, 0)).y;
    return [{ tyyppi: 'airo', paino: r3(hs.ow), lahempi: r3(segD(hand(true))), kauempi_varsi: r3(segD(hand(false))), kauempi: r3(segD(hand(false))), lapa_y: r3(b[1]), pohja_y: r3(bottom), lapa_pohjan_alla: r3(bottom - b[1]) }];
  }
  return { scene, update, shots, camAt, calls, boatT, heroState, probe, grip };
}
