// Rantaniitty: ohjauksen (docs/ohjaus.md, luku 3, uusi versio) otot 3.1–3.22, yksi paikka (gef_viulu … wal_kulissi1).
// Metsänreuna vasemmalla, järvi oikealla, kivi rannassa, vene airoineen rannassa, kuu; ilta -> yö -> paperi.
//   Kumppani on viiva (companionTrail) koko ajan: viisi elettä (kaipaus, ilo, kevytmielisyys, hellyys, sarkasmi) ja
//   läheisyyden asteet: latvoissa -> puiden lomassa -> kämmenellä -> olkapäällä -> punoksena mastossa -> vierellä kaarena.
//   Purppura (#8E2457) vain: aavistus punoksessa (3.15), koko kuvan kohoaminen huipussa (3.17), laskeutuminen (3.18).
//   Muste (tipTrail, punainen) vain 3.17: yksi veto kuun yli keihään kärjestä.
// Kierros 2 (palaute 31.10.): kumppani viivahahmona veneessä (3.13-3.17) ja rannalla (3.20-3.22), huipussa viiva kietoutuu ritariin
//   (sash.js, myös selkäkuvassa), tähdet pyörivät huipussa, harppu luo kuun siltaa (harpun muotoinen valosilta), pizzicato =
//   viivan värähdys pisteinä, suon olennot puupuhaltimien kanavista, sininen iltataivas; paperipesu on main.js:n PAPER_TRANS.
// Ajat ankkureista (S.A) ja jaksorajoista (S.segs); mitatut kanavat S.fam / S.energy sekä omat PANNs-kanavat (build/A2, build/A3).
// Puhdas seek(t). Yksi tuuli (+x).

import * as THREE from 'three';
import { C, U, HALFTONE, ink, flat, group, poly, circle, rect, limb, strokeGeo, skylineGeo, ridgeGeo, earleTree, waveMat, pennantGeo, sky as makeSky, water, clamp, smoothstep, mix, hash1, vnoise1 } from './paper.js';
import { glide, ease, leader, GRIP_BELOW } from './hero.js';
import { common, reflectDashes } from './world.js';
import { knightBack, KP, kpose, kmix, armIK, bodyScale, OAR } from './puppets.js';
import { oboeDuck, cAnglaisHeron, bassoonFrog } from './critters.js';
import { tipTrail, heroGate } from './brush.js';
import { dirOf, braid, companionFigure, ribbon, chaikin } from './companion.js';
import { makeSash } from './sash.js';
import { fluteMosquito } from './critters.js';
import * as CSW from './critters_swamp.js';   // 3.21 (B9): kaislikon reunan olennot käyttävät swamp-version luettavia viivoja (mitoitettu maailmaan)
import { gaussian, sampler } from '../util.js';

// --- Vesi: kuun polku ja purppuralaatta -------------------------------------------------------------
const WATER_FS = /* glsl */ `
  uniform float uCell, uTime, uGlint, uDark, uDim, uMoonX, uMoonAmt, uTop, uPur;
  uniform vec4 uHarp;   // B10/B11: kaksi harpun glissandon rintamaa kuun sillalla (syvyys 0 = kuu/horisontti -> 1 = katsoja, voimakkuus)
  uniform vec3 uBase, uDeep, uPaper, uPurC;
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
    // harpun glissando = välke, joka valuu kuun siltaa pitkin kuusta katsojaa kohti (laskeva glissando); rintama ja hiipuva jälki
    float hcol = exp(-pow((vW.x - uMoonX) / (1.3 + 2.6 * depth), 2.0));
    float d1 = depth - uHarp.x, d2 = depth - uHarp.z;
    float hb = uHarp.y * (exp(-d1 * d1 / 0.004) + 0.5 * (1.0 - step(0.0, d1)) * exp(d1 / 0.22))
             + uHarp.w * (exp(-d2 * d2 / 0.004) + 0.5 * (1.0 - step(0.0, d2)) * exp(d2 / 0.22));
    hb = clamp(hb, 0.0, 1.2) * hcol;
    float dash = step(0.7 - 0.42 * moonB - 0.3 * hb, vnoise(vec2(vW.x * 1.0 + uTime * (0.25 + 0.2 * hash12(vec2(row, 1.0))), row * 1.3)));
    c = mix(c, uPaper, dash * line * clamp(uGlint * 0.55 + moonB * 0.9 + hb, 0.0, 1.0) * (1.0 - 0.5 * depth * (1.0 - min(hb, 1.0))));
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
    c = mix(c, uPurC, halftone(uPur * (1.0 - dash * line * moonB), 1.05, uCell));
    c = mix(c, vec3(0.12, 0.1, 0.095), halftone(uDim * 0.92, 0.785, uCell));
    gl_FragColor = vec4(c, 1.0);
  }
`;
// --- Mitatut kanavat (PANNs, build/A2 ja build/A3): pizzicato, harppu, huilu, klarinetti, puupuhaltimet, viulu --------------------
// S.fam ei sisällä näitä erillisinä, joten ne luetaan suoraan analyysipaketeista (sama aikajana kuin data.js: ruutu i = i/30 s).
const CH_NAMES = ['panns_pizzicato', 'panns_harp', 'panns_flute', 'panns_clarinet', 'panns_wind_instrument_woodwind_instrument', 'panns_violin_fiddle', 'stem_vocals'];
async function loadChannels(names) {
  const n = Math.round(1258 * 30) + 1; // puolen loppu korjatussa ajassa (1240 / k, audio/lahde.json)
  const out = Object.fromEntries(names.map((c) => [c, new Float32Array(n)]));
  for (const p of [{ dir: 'build/A2', from: 400, to: 810 }, { dir: 'build/A3', from: 810, to: 1258 }]) {
    const r1 = await fetch(`/${p.dir}/listen.json`), r2 = await fetch(`/${p.dir}/listen.f32`);
    if (!r1.ok || !r2.ok) throw new Error(`kanavat puuttuvat: ${p.dir}`);
    const m = await r1.json(), raw = new Float32Array(await r2.arrayBuffer());
    const Cn = m.channels.length, s0 = Math.round(m.start * 30), i0 = Math.round(p.from * 30), i1 = Math.min(n, Math.round(p.to * 30) + 1);
    for (const c of names) {
      const j = m.channels.indexOf(c);
      if (j < 0) throw new Error(`kanava puuttuu: ${c}`);
      for (let i = i0; i < i1; i++) { const k = i - s0; if (k >= 0 && k < m.frames) out[c][i] = raw[k * Cn + j]; }
    }
  }
  return out;
}
const RAW = await loadChannels(CH_NAMES);
const HARP = await (await fetch('/visual/muste/harppu_glissandot.json')).json();
// kanava tasoitettuna ja suhteutettuna oman ikkunansa [a, b] s 98. persentiiliin (PANNs-todennäköisyydet ovat pieniä: vertaa suhteellisesti)
function chanNorm(name, a, b, sigma, pct = 0.98) {
  const sm = gaussian(RAW[name], sigma);
  const seg = Array.from(sm.subarray(Math.round(a * 30), Math.round(b * 30))).sort((x, y) => x - y);
  const p = seg[Math.floor(pct * (seg.length - 1))] || 1e-6;
  return sampler(Float32Array.from(sm, (v) => Math.min(1.5, Math.max(0, v / p))), 30);
}
// huiput (paikalliset maksimit): aika-lista, kun tasoitettu kanava ylittää kynnyksen (suhteessa ikkunan maksimiin) ja on suurin ±hw s:n sisällä
function chanPeaks(name, a, b, sigma, frac, hw) {
  const sm = gaussian(RAW[name], sigma), i0 = Math.round(a * 30), i1 = Math.round(b * 30), w = Math.round(hw * 30);
  let mx = 1e-9;
  for (let i = i0; i < i1; i++) mx = Math.max(mx, sm[i]);
  const out = [];
  for (let i = i0 + w; i < i1 - w; i++) {
    if (sm[i] < frac * mx || sm[i] <= sm[i - 1] || sm[i] < sm[i + 1]) continue;
    let top = true;
    for (let k = -w; k <= w && top; k++) if (sm[i + k] > sm[i]) top = false;
    if (top) out.push([i / 30, sm[i] / mx]);
  }
  return out;
}

const R3 = (x) => Math.round(x * 1000) / 1000;
// Hermite-käyrä avainpisteistä [[t, arvo]]: jatkuva nopeus (ei pysähdystä avainten kohdalla)
function keyed(keys, t) {
  const n = keys.length;
  if (t <= keys[0][0]) return keys[0][1];
  if (t >= keys[n - 1][0]) return keys[n - 1][1];
  let i = 0;
  while (i < n - 2 && t >= keys[i + 1][0]) i++;
  const [t0, p0] = keys[i], [t1, p1] = keys[i + 1];
  const m = (j) => (j <= 0 || j >= n - 1 ? 0 : (keys[j + 1][1] - keys[j - 1][1]) / (keys[j + 1][0] - keys[j - 1][0]));
  const h = t1 - t0, u = (t - t0) / h, u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * p0 + (u3 - 2 * u2 + u) * h * m(i) + (-2 * u3 + 3 * u2) * p1 + (u3 - u2) * h * m(i + 1);
}

export function build(K) {
  const { S } = K;
  const W = common(S);
  const at = (id) => S.A(id).t;
  const T = {
    viulu: at('gef_viulu'), v1: at('gef_vastaus1'), v2: at('gef_viulu2'), va2: at('gef_vastaus2'), mo: at('gef_mielialat'),
    va3: at('gef_vastaus3'), ki: at('gef_kiihkea'), pu: at('gef_puupuhaltimet'), le: at('gef_leimahdus'), lu: at('gef_lustig'),
    ra: at('gef_rauhoittava'), v3: at('gef_viulu3'), rk: at('gef_rakkaus'), rh: at('gef_rakkaus_hiljaa'), hi: at('gef_hiljenee'),
    no: at('gef_nousu'), ko: at('gef_kolkutus'), hu: at('gef_huippu'), sh: at('gef_sankari_hiljaa'), aa: at('gef_aalto'),
    ja: at('gef_jalkihehku'), un: at('gef_arvostelijat_uni'), hs: at('gef_hiljaisuus'), wal: at('wal_kulissi1'),
  };
  const win = (a, b, c, d, t) => smoothstep(a, b, t) * (1 - smoothstep(c, d, t));
  const segsIn = (a, b) => S.segs.filter((s) => s.a > a && s.a < b).map((s) => s.a);
  // lähin jaksoraja hetkeen t (mielialojen ja ottojen leikkaukset jaksorajoissa)
  const nearSeg = (t, lo = -Infinity, hi = Infinity) => {
    const c = S.segs.map((s) => s.a).filter((x) => x > lo && x < hi);
    return c.length ? c.reduce((m, x) => (Math.abs(x - t) < Math.abs(m - t) ? x : m), c[0]) : t;
  };
  const dirV = dirOf(K.viuluviiva);
  // Mitatut kanavat (RAW): pizzicato 3.1-3.12 (suhteessa oman jaksonsa 98. persentiiliin), harppu 3.13-3.21, puupuhaltimet 3.21, viulu
  const pzEv = chanPeaks('panns_pizzicato', T.viulu, T.rk, 2, 0.2, 0.27);                        // [[t, voimakkuus 0..1]]
  const pzN = chanNorm('panns_pizzicato', T.viulu, T.rk, 2, 0.98);
  const violinN = chanNorm('panns_violin_fiddle', T.viulu, T.hs, 6, 0.95);                          // sooloviulun / viulujen kanava (sash)
  const sashSig = (t) => clamp(violinN(t));
  // B10/B11 (kierros 3): harpun glissandot partituurista ja mitatuista tahdeista (harppu_glissandot.json), EI panns_harp-kanavasta (kuollut).
  // [alku, loppu, voimakkuus]; tahdin alku = mitattu isku, iskun paikka partituurista.
  const harpGl = HARP.glissandot.map((g) => {
    const D = HARP.tahdit, b0 = D[g.tahti], L = D[g.tahti + 1] - b0;
    return [b0 + ((g.alku - 1) * L) / 4, b0 + ((g.loppu - 1) * L) / 4, g.dyn === 'ff' ? 1 : 0.6];
  }).filter(([a]) => a > T.rk - 1 && a < T.hs);
  const harpChord = HARP.sointu.map((c) => HARP.tahdit[c.tahti]);
  const fluteN = chanNorm('panns_flute', T.un - 10, T.hs + 5, 15, 0.98);
  const clarN = chanNorm('panns_clarinet', T.un - 10, T.hs + 5, 15, 0.98);
  const woodN = chanNorm('panns_wind_instrument_woodwind_instrument', T.un - 10, T.hs + 5, 15, 0.98);
  const windV = (tt) => { const q = W.wind(tt); return { x: 0.5 + 1.8 * q, y: 0.1 + 0.4 * q }; };

  // --- Maailman mitat ----------------------------------------------------------------------------------
  const X0 = 1.2;              // niitty: ritarin paikka, keihäs (3.1)
  const ROCKX = 6.3;           // kivi rannassa (istuin)
  const BANK = 9.4;            // rannan reuna
  const BX0 = 10.9;            // vene rannassa
  const SHORE_SIT = 7.9;       // 3.20: ritari istuu rannalla selin
  const WATER_Y = 0.45;        // veneen korkeus
  const MOON = { x: 23.8, y: 4.9, r: 2.3, z: -20 };
  const SUN = { x: 19.5, z: -12, r: 2.1 };
  const TREE_HIDE = -4.9;      // etualan puu (kevytmielisyys katoaa sen taakse)
  const STONES = [{ x: ROCKX, top: 0.85 }, { x: 3.0, top: 1.55 }, { x: 4.6, top: 0.45 }];   // kivi, lohkare, pikkukivi

  // --- Mielialojen ja ottojen jaksorajat -------------------------------------------------------------------
  const span5 = T.va3 - T.mo;
  const M1 = nearSeg(T.mo + 0.17 * span5, T.mo + 8, T.mo + 24), M2 = nearSeg(T.mo + 0.38 * span5, M1 + 8, M1 + 30);
  const M3 = nearSeg(T.mo + 0.55 * span5, M2 + 8, M2 + 30), M4 = nearSeg(T.mo + 0.72 * span5, M3 + 8, M3 + 30);
  const t3a = segsIn(T.v2 + 5, T.va2 - 5);                      // 3.3 kolme vuoroa
  const TURN = [T.v2, t3a[0] ?? T.v2 + 11, t3a[1] ?? T.v2 + 19];
  const segHere = (lo, hi) => segsIn(lo, hi);

  // --- Ritarin aikajana ---------------------------------------------------------------------------------
  // liikkeet [t0, t1, x0, x1, kävely 0/1]
  const tWalkBack = T.va2 + 1.8, tSit = T.va2 + 15;
  const tKneel = M3 - 2.5, tStepBack = M4 + 0.4;
  const tBoard0 = T.rk + 12.2, tBoard1 = T.rk + 14.8;           // astuu veneeseen
  const tOut0 = T.aa + 12.5, tOut1 = T.aa + 16.5, tBack = tOut1 + 2.6;   // astuu rannalle, istuu selin
  const MOVES = [
    [T.viulu - 8, T.viulu + 4.2, -6.5, X0, 1],
    [TURN[0] + 0.3, TURN[0] + 1.7, X0, X0 - 0.9, 1],
    [TURN[1] + 0.3, TURN[1] + 1.7, X0 - 0.9, X0 - 1.8, 1],
    [TURN[2] + 0.3, TURN[2] + 1.7, X0 - 1.8, X0 - 2.7, 1],
    [tWalkBack, tSit - 3.5, X0 - 2.7, ROCKX, 1],
    [tKneel, tKneel + 2.4, ROCKX, ROCKX - 1.0, 0],
    [tStepBack, tStepBack + 1.3, ROCKX - 1.0, ROCKX - 2.0, 1],
    [T.ki + 1.0, T.pu - 1.2, ROCKX - 2.0, X0, 1],
    [T.pu + 9.5, T.pu + 11.5, X0, X0 - 0.7, 1],
    [T.ra + 3, T.ra + 5, X0 - 0.7, X0 - 0.7, 0],
    [T.rk + 2.0, T.rk + 11.6, X0 - 0.7, BANK - 0.2, 1],
    [tOut1, tBack, BANK - 0.2, SHORE_SIT, 1],
  ];
  const xBase = (t) => {
    let x = MOVES[0][2];
    for (const [a, b, x0, x1] of MOVES) { if (t >= b) x = x1; else if (t >= a) { x = mix(x0, x1, ease((t - a) / (b - a))); break; } else break; }
    return x;
  };
  const walkW = (t) => {
    let w = 0;
    for (const [a, b, , , wk] of MOVES) if (wk && t > a && t < b) w = Math.max(w, smoothstep(a, a + 0.5, t) * (1 - smoothstep(b - 0.6, b, t)));
    return w;
  };
  const walkPh = (t) => { let d = 0; for (const [a, b, x0, x1, wk] of MOVES) { if (!wk) continue; if (t >= b) d += Math.abs(x1 - x0); else if (t > a) d += Math.abs(xBase(t) - x0); } return d * 3.4; };

  // Vene: rannassa BX0, työntö, soutu ulos, leijuu, paluu rantaan (kaikki avainpisteistä, Hermite)
  const tPush0 = T.rk + 11.5, tPush1 = T.rk + 16.5;
  const BOATK = [
    [tPush0, BX0], [tPush1, BX0 + 1.9], [T.rh, BX0 + 4.4], [T.rh + 30, BX0 + 8.0], [T.hi, BX0 + 9.4], [T.ko, BX0 + 10.4],
    [T.hu + 12, BX0 + 10.9], [T.sh + 8, BX0 + 11.1], [T.aa, BX0 + 11.1], [T.aa + 6, BX0 + 8.0], [T.ja - 1.5, BX0 + 0.5], [T.ja + 1.5, BX0 + 0.1],
  ];
  const boatXf = (t) => (t < tPush0 ? BX0 : t > T.ja + 1.5 ? BX0 + 0.1 : keyed(BOATK, t));
  const yawK = (t) => Math.PI * smoothstep(T.aa + 3, T.aa + 8, t);                       // vene kääntyy rantaan
  function boatT(t) {
    const x = boatXf(t);
    const away = smoothstep(BX0 + 0.2, BX0 + 3, x);
    return { x, y: WATER_Y + 0.07 * away * Math.sin(t * 0.43), z: -3.0, roll: 0.03 * away * Math.sin(t * 0.52 + 1.0), yaw: yawK(t), dir: Math.cos(yawK(t)) };
  }
  const toWorld = (B, lx, ly, lz = 0) => {
    const cx = lx * B.dir;
    return [B.x + cx * Math.cos(B.roll) - ly * Math.sin(B.roll), B.y + ly * Math.cos(B.roll) + cx * Math.sin(B.roll), B.z + lz];
  };
  const SEAT = { x: 0.2, y: 0.12 }, STANDX = 0.5, MASTX = 1.7;
  const tStand0 = T.ko + 0.4, tStand1 = T.ko + 3.6;              // nousee seisomaan (3.16)
  const tSit1 = T.sh + 1.6, tSit2 = T.sh + 5.5;                  // istuu punoksen viereen (3.18)
  const standK = (t) => smoothstep(tStand0, tStand1, t) * (1 - smoothstep(T.sh, T.sh + 2.4, t));
  const mastSit = (t) => smoothstep(tSit1, tSit2, t) * (1 - smoothstep(T.aa + 0.5, T.aa + 3, t));
  const boardK = (t) => ease(smoothstep(tBoard0, tBoard1, t)) * (1 - ease(smoothstep(tOut0, tOut1, t)));

  // Soutu: vaihe harpusta ja jousista
  const rowOn = (t) => smoothstep(tBoard1 + 1.5, tBoard1 + 4, t) * (1 - smoothstep(T.rh - 1.0, T.rh + 2.0, t)) + 0.9 * smoothstep(T.aa + 2, T.aa + 4, t) * (1 - smoothstep(tOut0 - 2, tOut0, t));
  const rowPh = W.integ((t) => (rowOn(t) > 0.01 ? (0.2 + 0.28 * clamp(0.5 * S.fam.harp(t) + 0.5 * S.energy.violins(t))) * rowOn(t) : 0));
  const rowS = (t) => Math.sin(Math.PI * 2 * rowPh(t)) * clamp(rowOn(t));
  const oarAng = (t) => OAR.mid + OAR.swing * rowS(t);
  const LOCK = { x: SEAT.x + OAR.lock[0], y: SEAT.y + OAR.lock[1] };
  function oarAxis(B, a) {
    const lk = toWorld(B, LOCK.x, LOCK.y, 0.34);
    const lx = -Math.sin(a) * B.dir, ly = Math.cos(a);
    return { lock: lk, dir: [lx * Math.cos(B.roll) - ly * Math.sin(B.roll), lx * Math.sin(B.roll) + ly * Math.cos(B.roll)] };
  }

  const SIT = kpose({ ...KP.sit, lean: 0.04, tilt: 0.05, aN: 0.45, eN: 1.0, aF: 0.3, eF: 0.9 });
  const SITR = kpose({ ...KP.sit, lean: 0.12, tilt: -0.25 });                 // kivellä: katsoo alas veteen
  const STAND_BOAT = kpose({ ...KP.stand, lean: -0.04, tilt: 0.15, aN: 0.55, eN: 0.5, aF: -0.15, eF: 0.4, hN: 0.12, hF: -0.08 });
  const OFFER = kpose({ ...KP.sit, lean: 0.2, tilt: -0.3, aN: 1.05, eN: 0.35, aF: 0.3, eF: 1.2, palm: 1 });   // istuu, kämmen ylöspäin
  const KNEEL_PALM = kpose({ ...KP.kneel, aN: 1.0, eN: 0.35, palm: 1 });
  const LISTEN = kpose({ ...KP.look, tilt: 0.5, aN: 0.25, eN: 0.4 });
  const GUARD = kpose({ ...KP.lanceFwd, lanceAng: -0.35 });
  const LANCE_REST = -2.0;     // keihäs viistoon alas eteen, kärki maahan (facing -1: negatiivinen = vasemmalle)

  const tPlant = T.viulu + 8.5;                      // 3.1 viiri maahan
  const tTurnL = T.viulu + 4.6, tTurnL1 = T.viulu + 6.4;
  const tPick = T.pu + 1.2;                          // 3.8 ottaa keihään takaisin
  const tStrike = T.le + 1.25;                       // 3.9 isku maahan (kärki osuu, viiri leimahtaa)
  const tLay = T.ra + 3.2;                           // 3.11 laskee keihään maahan
  const tPickB = T.rk + 1.2;                         // 3.13 nostaa viirin
  const tToBoat = tBoard1 - 0.4;                     // keihäs veneen pohjalle
  const tTakeB = tStand0 + 1.0;                      // 3.16 keihäs käteen vaakaan
  const tLayB = T.sh + 0.7;                          // 3.18 keihäs veneen pohjalle
  const tShoreL = tOut1 + 0.5;                       // rannalle isketty keihäs
  const tTake3 = T.hs + 0.15;                        // 3.22 nostaa viirin maasta: valmis ennen paperin alkua (hs + 3,5)

  const lance = { facing: -1 };
  function heroState(t) {
    const B = boatT(t);
    const bd = boardK(t);
    let x = xBase(t), y = 0, z = 0;
    // suunta: 1 = oikealle (järvi), -1 = vasemmalle (metsä)
    let facing, fTurn = 1;
    {
      const arrive = 1;                                            // saapuu oikealle kävellen
      let f = arrive;
      f = mix(f, -1, smoothstep(tTurnL, tTurnL1, t));              // kääntyy ääntä kohti (3.1)
      f = mix(f, 1, smoothstep(T.va2 + 0.4, T.va2 + 1.8, t));      // kävelee rantaan
      // 3.5 ilo: kääntyy viivan perässä; kevytmielisyys: pyörähtää (kaksi kääntöä)
      const iloK = win(M1 + 0.5, M1 + 1.9, M2 - 1.9, M2, t);
      // (kierros 4: sgn oli Math.sign eli yhden ruudun peilaus; nyt pehmeä käännös: sin kerrottuna 1,5:llä rajataan ±1:een, käännös kestää ~1,3 s nollakohdan ympärillä)
      if (iloK > 0.01) { const sgn = clamp(1.5 * Math.sin((t - M1) * 0.95), -1, 1); f = mix(f, sgn, iloK); }
      const spin = win(M2 + 2.5, M2 + 3.6, M2 + 6.4, M2 + 7.4, t) + win(M2 + 8.4, M2 + 9.4, M2 + 11.5, M2 + 12.5, t);
      if (spin > 0.01) f = mix(f, Math.cos(Math.PI * 2 * smoothstep(M2 + 2.6, M2 + 12.4, t) * 1.0), Math.min(1, spin * 4));
      f = mix(f, -1, smoothstep(M4 - 0.4, M4 + 1.2, t));           // sarkasmi (kierros 4: käännös 0,6 s -> 1,6 s): perääntyy (kasvot vielä viivaan)
      f = mix(f, 1, smoothstep(T.va3 + 0.5, T.va3 + 2.0, t));      // 3.6 soittaa järvelle
      f = mix(f, -1, smoothstep(T.ki + 1.0, T.ki + 2.5, t));       // 3.7 kävelee keihään luo
      f = mix(f, 1, smoothstep(T.ra + 1.0, T.ra + 3.0, t));        // 3.11 istuu, katsoo järvelle
      f = mix(f, 1, smoothstep(T.rk + 1.5, T.rk + 3.0, t));        // 3.13 kävelee veneelle
      if (bd > 0.5) f = B.dir;
      if (t > T.aa + 8) f = mix(f, B.dir, 1);
      facing = Math.abs(f) < 0.12 ? 0.12 * (f < 0 ? -1 : 1) : f;
      fTurn = Math.min(1, Math.abs(f));
    }
    // pohja-asento
    const ph = walkPh(t), ww = walkW(t);
    let p = kmix(KP.stand, kmix(KP.stepA, KP.stepB, 0.5 + 0.5 * Math.sin(ph)), ww);
    // 3.1: pysähtyy, kuuntelee, laskee viirin maahan
    const listen1 = smoothstep(T.viulu + 3.0, T.viulu + 5.5, t) * (1 - smoothstep(T.v1 - 1.2, T.v1 - 0.2, t));
    const lowerL = smoothstep(T.viulu + 5.8, tPlant, t);
    p = kmix(p, LISTEN, listen1 * (1 - lowerL * 0.6));
    // 3.2: kello soittoon
    const bell = win(T.v1 + 0.3, T.v1 + 2.4, T.v2 - 2.4, T.v2 - 0.3, t);
    p = kmix(p, KP.call, bell);
    // 3.3: kuuntelee askelten välissä
    p = kmix(p, LISTEN, 0.7 * win(T.v2 + 2.5, T.v2 + 4, TURN[1] - 1, TURN[1], t));
    p = kmix(p, LISTEN, 0.7 * win(TURN[1] + 2.5, TURN[1] + 4, TURN[2] - 1, TURN[2], t));
    // 3.4-3.5: istuu kivelle
    const sit = smoothstep(tSit - 3.5, tSit, t) * (1 - smoothstep(tKneel, tKneel + 2.4, t));
    p = kmix(p, SITR, sit);
    // kaipaus: kallistaa päätä; hellyys: polvistuu kämmen ojossa; sarkasmi: nousee ja perääntyy
    p = kmix(p, kpose({ ...SITR, tilt: 0.35 }), win(T.mo + 1.5, T.mo + 4.5, M1 - 2, M1 - 0.4, t));
    const kn = smoothstep(tKneel, tKneel + 2.4, t) * (1 - smoothstep(tStepBack - 0.8, tStepBack + 0.6, t));
    p = kmix(p, KNEEL_PALM, kn);
    const back = win(tStepBack - 0.6, tStepBack + 0.5, M4 + 4.5, M4 + 6, t);
    p = kmix(p, kpose({ ...KP.stand, lean: -0.22, tilt: 0.1, aN: 0.5, eN: 0.5, aF: 0.3, eF: 0.5, hN: -0.1 }), back);
    // 3.6: nousee, kello soittoon pitkään
    const call2 = win(T.va3 + 1.8, T.va3 + 4.2, T.ki - 2.2, T.ki - 0.4, t);
    p = kmix(p, KP.call, call2);
    // 3.7-3.8: kävelee keihään luo, ottaa sen, vartioasento
    const pickK = smoothstep(tPick - 0.5, tPick + 3.5, t);
    // 3.8 vartioasento, 3.9 isku (nosto ennen ankkuria, iskun huippu tStrike)
    const guard = win(T.pu + 5, T.pu + 8.5, T.le - 3.5, T.le - 1.8, t);
    p = kmix(p, GUARD, guard);
    const strike = smoothstep(T.le - 1.8, T.le - 0.3, t) * (1 - smoothstep(tStrike + 0.4, tStrike + 2.0, t));
    const strikeU = clamp((t - (T.le - 1.8)) / (tStrike - (T.le - 1.8)));
    if (t >= T.le - 1.8 && t < T.lu - 4) p = kmix(p, { ...(strikeU < 0.55 ? kmix({ ...KP.proud, lanceAng: 0.1 }, KP.lanceLift, ease(strikeU / 0.55)) : kmix(KP.lanceLift, { ...KP.plant, lanceAng: 0.0 }, ease((strikeU - 0.55) / 0.45))) }, Math.max(strike, strikeU >= 1 ? 1 - smoothstep(tStrike + 3, tStrike + 6, t) : strike));
    // 3.10: seisoo yksin, katsoo ylös
    p = kmix(p, kpose({ ...KP.look, tilt: 0.4, aN: 0.3, eN: 0.3 }), win(T.lu + 6, T.lu + 10, T.ra - 4, T.ra - 1.5, t));
    // 3.11: laskee keihään, istuu, ojentaa kämmenen
    const sit2 = smoothstep(tLay + 1.5, tLay + 5.5, t) * (1 - smoothstep(T.rk + 0.2, T.rk + 1.6, t));
    p = kmix(p, kpose({ ...KP.kneel, lean: 0.25 }), win(tLay - 0.8, tLay + 1.2, tLay + 3, tLay + 4.6, t));
    p = kmix(p, OFFER, sit2 * smoothstep(tLay + 3.4, tLay + 7, t));
    p = kmix(p, SITR, sit2 * (1 - smoothstep(tLay + 3.4, tLay + 7, t)));
    // 3.13: laituri -> vene
    p = kmix(p, kmix(KP.stepA, KP.stepB, 0.5 + 0.5 * Math.sin(ph)), 0);
    const seatW = toWorld(B, SEAT.x, SEAT.y, 0.15);
    const row = rowOn(t) > 0 ? clamp(rowOn(t)) : 0;
    const sd = standK(t), ms = mastSit(t);
    let seat = smoothstep(0.55, 1, bd) * (1 - sd) * (1 - ms);
    p = kmix(p, SIT, seat);
    p = kmix(p, kmix(KP.rowA, KP.rowB, 0.5 + 0.5 * Math.sin(Math.PI * 2 * rowPh(t))), row * seat);
    p = kmix(p, STAND_BOAT, sd);
    p = kmix(p, kpose({ ...SIT, tilt: 0.45, lean: 0.0 }), ms);
    // Kaikki käännökset (kierros 4, C10): facing on vain suunnan merkki, joten sen vaihtuminen peilasi hahmon yhdessä ruudussa (viitta ja käsi vaihtoivat puolta).
    // Käännös tehdään leveyskertoimella sx = |facing| (profiiliin ja takaisin, kuten puppets.js kaantyminen_profiiliin): peilaus tapahtuu kapeimmillaan (0,12), alku ja loppu pehmeät
    if (fTurn < 0.999) p = { ...p, sx: Math.max(0.12, fTurn) };
    // paikka veneessä
    const stand = toWorld(B, STANDX, 0.3, 0.15), mastSeat = toWorld(B, 1.0, 0.12, 0.15);
    if (bd > 0) {
      const e = bd;
      const sx = mix(mix(seatW[0], stand[0], sd), mastSeat[0], ms), sy = mix(mix(seatW[1], stand[1], sd), mastSeat[1], ms), sz = seatW[2];
      x = mix(x, sx, e); y = mix(y, sy, e); z = mix(z, sz, e);
    }
    // 3.20: rannalla selin (knightBack), x asetetaan rannalle
    const onShoreBack = t >= tBack;
    // soutu: molemmat kämmenet airon varrelle (armIK, sama laskenta kuin keihäällä); airo näkyy vasta kun ote on täysi (ow >= 0,995)
    const ow = seat;
    let ikN = null, ikF = null;
    if (ow > 0.001) {
      const ax = oarAxis(B, oarAng(t));
      // IK lasketaan aina istuvan soutuasennon rungolle (ei seisomaan nousun / veneeseen astumisen sekoituksella): kulma on silloin
      // soutuvaiheen jatkuva funktio, eikä se kierry ympäri asennonvaihdoissa (poseskan 909 / 950 s)
      const pIK = kmix(SIT, kmix(KP.rowA, KP.rowB, 0.5 + 0.5 * Math.sin(Math.PI * 2 * rowPh(t))), row);
      const ex = bodyScale(p, facing);
      const to = (g) => [(ax.lock[0] + ax.dir[0] * g - x) / ex, ax.lock[1] + ax.dir[1] * g - y];
      const n = armIK(lead.P, pIK, true, ...to(OAR.grips[0])), f = armIK(lead.P, pIK, false, ...to(OAR.grips[1]));
      ikN = n.a; ikF = f.a;
      // atan2 palauttaa kulman välillä ±π: ilman purkua sekoitus mix(asento, IK, ow) hyppää 2π:n verran (yksi ruutu, aF ±1,5 rad).
      // IK-kulmat puretaan kiinteään haaraan (lähempi käsi keskipisteen -0,5, kauempi 1,8 ympärille), jolloin ne ovat jatkuvia ajan funktioita.
      const wp = (x) => x - 2 * Math.PI * Math.round(x / (2 * Math.PI));
      p = { ...p, aN: mix(p.aN, -0.5 + wp(n.a + 0.5), ow), eN: mix(p.eN, n.e, ow), aF: mix(p.aF, 1.8 + wp(f.a - 1.8), ow), eF: mix(p.eF, f.e, ow) };
    }
    // keihään kulma kädessä (0 = pysty, + = oikealle)
    let la = 0;
    if (t < tPlant) la = LANCE_REST * lowerL;
    else if (t < tPick - 0.5) la = LANCE_REST;
    else if (t < T.pu + 6) la = mix(LANCE_REST, 0.0, smoothstep(tPick + 1.0, tPick + 4.8, t));
    else if (t < T.le - 1.8) la = mix(0.0, -0.35, guard);
    else if (t < tStrike + 0.02) la = null;
    if (sd > 0.01) la = mix(1.2, -0.05, smoothstep(T.hu + 1, T.hu + 24, t));
    if (la !== null) p = { ...p, lanceAng: la };
    const act = Math.max(bell, call2, strike, win(T.pu + 4, T.pu + 8, T.le - 2, T.le - 1, t) * 0.5, sd > 0.2 ? 0.6 : 0);
    return { act, x, y, z, facing, pose: p, bd, sd, ms, seat, row, onShoreBack, ow, ikN, ikF };
  }

  // Keihäs: kädessä tai vapaana (tweenit): [t0, t1, mistä, mihin]; mistä/mihin = 'hand' tai tasonimi
  const REST = {
    A: () => handXf(tPlant),
    B: () => { const x = xBase(tLay) - 0.4; return { x, y: 0.14, ang: -1.5, z: -0.06 }; },
    C: (t) => { const B = boatT(t); const [wx, wy, wz] = toWorld(B, -0.5, 0.16, 0.45); return { x: wx, y: wy, ang: B.dir > 0 ? 1.5 + B.roll : -1.5 + B.roll, z: wz }; },
    D: () => ({ x: SHORE_SIT - 2.8, y: -0.12, ang: 0.1, z: 0.08 }),
  };
  const LK = [
    [tPlant, tPlant + 0.01, 'hand', 'A'],
    [tPick - 0.5, tPick + 1.0, 'A', 'hand'],
    [tLay, tLay + 1.8, 'hand', 'B'],
    [tPickB, tPickB + 2.0, 'B', 'hand'],
    [tToBoat, tToBoat + 1.6, 'hand', 'C'],
    [tTakeB, tTakeB + 2.4, 'C', 'hand'],
    [tLayB, tLayB + 2.4, 'hand', 'C'],
    [tShoreL - 4, tShoreL + 2, 'C', 'D'],
    [tTake3, tTake3 + 2.8, 'D', 'back'],
  ];
  const handXf = (t) => { const o = lead.tipAt(t); return { x: o.hx, y: o.hy, ang: Math.atan2(o.dx, o.dy), z: o.z - 0.05 }; };
  function lanceAt(t) {
    let e = null;
    for (const k of LK) if (t >= k[0]) e = k;
    if (!e) return { mode: 'hand' };
    const [t0, t1, from, to] = e;
    const xf = (n) => (n === 'hand' ? handXf(t) : n === 'back' ? backHandXf(t) : REST[n](n === 'A' && t < t1 ? t1 : t));
    if (t >= t1) return to === 'hand' ? { mode: 'hand' } : { mode: 'free', ...(to === 'back' ? backHandXf(t) : REST[to](t)) };
    const u = ease((t - t0) / (t1 - t0));
    const a = xf(from), b = xf(to);
    return { mode: 'free', x: mix(a.x, b.x, u), y: mix(a.y, b.y, u), ang: mix(a.ang, b.ang, u), z: mix(a.z, b.z, u) };
  }
  const backHandXf = (t) => {
    const u = smoothstep(tTake3 + 0.3, tTake3 + 2.8, t);
    const base = REST.D();
    return { x: mix(base.x, SHORE_SIT - 0.95, u), y: mix(base.y, 1.05, u), ang: mix(base.ang, 0, u), z: 0.1 };
  };

  // --- Viiva: polku maailmassa (kumppani on vain viiva) ------------------------------------------------------
  // jokainen jakso: [a, b, f(u, t) -> {x, y, z?}, ele, uusiAlku]
  const hxAt = (t) => xBase(t);
  const mel = (t) => clamp((dirV(t).midi - 70) * 0.12, -1.3, 1.3);
  const sine = (s, a, f) => a * Math.sin(f * s);
  const palmAt = (t) => ({ x: xBase(t) + (t < T.rk ? 1.0 : 1.0), y: 0.78 });
  const dropT = TURN;
  const CSEG = [];
  const seg = (a, b, ele, f, o = {}) => CSEG.push({ a, b, ele, f, brk: !!o.brk, fig: !!o.fig, z: o.z ?? 0.12, vis: o.vis ?? 1 });
  // 3.1 latvoissa: kaukana puiden latvoissa, ylävasemmalla
  seg(T.viulu, T.v1, 'hellyys', (u, t) => ({ x: -26 + 23 * u + sine(t, 0.9, 0.9), y: 11.8 + sine(t, 1.0, 0.75) + mel(t) * 1.3 }));
  // 3.2 hiljaa: katoaa kun torvet vastaavat (ritari johtaa)
  seg(T.v1, T.v2, 'hellyys', (u, t) => ({ x: -6 - 3 * u, y: 10.5 + mel(t) }), { vis: 0 });
  // 3.3 puiden lomassa: laskeutuu, vetäytyy kun ritari astuu, palaa kun hän pysähtyy
  for (let k = 0; k < 3; k++) {
    const a = TURN[k], b = k < 2 ? TURN[k + 1] : T.va2;
    seg(a, b, 'hellyys', (u, t) => {
      const near = smoothstep(0.1, 0.55, u) * (1 - smoothstep(0.9, 1, u) * 0.0);
      const hx = hxAt(t);
      const px = mix(-9.5, hx - 2.8 - 0.3 * k, near), py = mix(7.8 - 1.0 * k, 3.0 + 0.4 * k, near);
      return { x: px + sine(t, 0.35, 0.9), y: py + sine(t, 0.3, 1.1) + 0.8 * mel(t), z: -0.5 };
    });
  }
  // 3.4 ylhäällä auringon luona, hiljaa
  seg(T.va2, T.mo, 'hellyys', (u, t) => ({ x: mix(2, 15, ease(u)) + sine(t, 0.4, 0.6), y: 9.5 + 1.6 * u + mel(t) * 0.8 }), { brk: true });
  // 3.5 viisi elettä
  // kaipaus: pitkä laskeva kaari veden yllä, riippuvia kiehkuroita
  seg(T.mo, M1, 'kaipaus', (u, t) => {
    const s = (t - T.mo) * 1.1;
    const bx = mix(-1.5, 17, u), by = 12.0 - 8.6 * ease(u) ** 1.3;
    return { x: bx - 0.55 * Math.sin(2.4 * s) * 1.6, y: by - 0.5 * (1 - Math.cos(2.4 * s)) * 1.3 };
  }, { brk: true });
  // ilo: sahalaita kiveltä kivelle
  seg(M1, M2, 'ilo', (u, t) => {
    const n = 7, f = u * n, i = Math.floor(Math.min(f, n - 1e-6)), w = f - i;
    const order = [0, 1, 2, 1, 0, 2, 0, 1];
    const sa = STONES[order[i % order.length]], sb = STONES[order[(i + 1) % order.length]];
    const x = mix(sa.x, sb.x, ease(w)), top = mix(sa.top, sb.top, ease(w));
    return { x, y: top + 0.9 + 1.5 * Math.abs(Math.sin(Math.PI * w)) };
  }, { brk: true });
  // kevytmielisyys: katoaa puun taakse, ilmestyy selän takaa
  seg(M2, M3, 'kevytmielisyys', (u, t) => {
    const hx = ROCKX;
    if (u < 0.34) { const w = ease(u / 0.34); return { x: mix(hx - 1.5, TREE_HIDE, w), y: mix(5.5, 2.6, w) + 0.5 * Math.sin(w * 9), z: 0.9 }; }
    if (u < 0.5) return { x: TREE_HIDE, y: 2.6, z: 0.9, hide: true };
    const w = (u - 0.5) / 0.5;
    return { x: hx - 0.9 + 1.7 * Math.sin(w * 6.0) * (1 - 0.3 * w), y: 1.7 + 1.1 * Math.abs(Math.sin(w * 9)) + sine(t, 0.3, 4), z: -0.15 };
  }, { brk: true });
  // hellyys: laskeutuu ojennetulle kämmenelle
  seg(M3, M4, 'hellyys', (u, t) => {
    const pal = { x: ROCKX - 1.0 + 1.0, y: 0.78 };
    const w = ease(smoothstep(0.0, 0.8, u));
    const r = (1 - w) * 2.4;
    return { x: mix(ROCKX - 3.5, pal.x, w) + r * Math.sin(t * 1.3) * 0.5, y: mix(5.5, pal.y, w) + r * 0.4 * Math.cos(t * 1.3) + sine(t, 0.06, 3) };
  }, { brk: true });
  // sarkasmi: terävä piikki, viiva pois
  seg(M4, T.va3, 'sarkasmi', (u, t) => {
    const s = (t - M4);
    const zig = Math.abs(((s * 1.25) % 2) - 1) * 2 - 1;
    const rise = ease(smoothstep(0.0, 1, u));
    return { x: ROCKX - 0.5 + 12 * rise, y: mix(1.2, 9.5, ease(smoothstep(0.1, 0.9, u))) + zig * (0.9 + 0.6 * u) };
  }, { brk: true });
  // 3.6 hiljaa (ritari johtaa)
  seg(T.va3, T.ki, 'hellyys', (u, t) => ({ x: 14, y: 11 + mel(t) }), { vis: 0, brk: true });
  // 3.7 kiihtyminen: pyörre ritarin ympärillä, pakenee korkealle
  seg(T.ki, T.pu, 'kiihko', (u, t) => {
    const hx = hxAt(t);
    const ang = (t - T.ki) * (2.2 + 2.2 * u);
    const r = mix(1.6, 3.6, smoothstep(0.1, 0.8, u));
    const flee = ease(smoothstep(0.78, 1, u));
    return { x: hx + r * Math.cos(ang) * 1.5 + 8 * flee, y: 2.2 + 0.9 * r * Math.sin(ang) + 10 * flee * flee };
  }, { brk: true });
  // 3.8 katselee ylhäältä
  seg(T.pu, T.le - 0.8, 'hellyys', (u, t) => ({ x: hxAt(t) + 7 + sine(t, 0.8, 0.7), y: 10.8 + sine(t, 0.6, 0.9) + mel(t) * 0.7 }), { brk: true });
  // 3.9 hiljaa (viiri leimahtaa) ja 3.10 nauru: koukerot korkealla, loittonee
  seg(T.le - 0.8, T.lu, 'hellyys', (u, t) => ({ x: 20, y: 13 }), { vis: 0, brk: true });
  seg(T.lu, T.ra, 'riehakkuus', (u, t) => {
    const s = (t - T.lu) * 1.25;
    const bx = mix(8, 33, ease(u)), by = mix(10.5, 14.2, ease(u));
    return { x: bx - 1.1 * Math.sin(1.45 * s) * 1.6, y: by + 1.1 * (Math.cos(1.45 * s) - 1) * 1.3 + 0.7 * Math.sin(0.725 * s) };
  }, { brk: true });
  // 3.11 hitaasti lähemmäs lopussa
  seg(T.ra, T.v3, 'hellyys', (u, t) => {
    const hx = xBase(t);
    const w = ease(smoothstep(0.55, 1, u));
    return { x: mix(hx + 11, hx + 2.0, w) + sine(t, 0.4, 0.8), y: mix(9.5, 4.4, w) + mel(t) * 0.5 };
  }, { brk: true });
  // 3.12 lähentyminen: latvoista -> kiven taakse -> kämmenelle -> olkapäälle kaareksi
  const sg = segHere(T.v3 + 3, T.rk - 3);
  const L1 = sg[0] ?? T.v3 + 13.5, L2 = sg[1] ?? T.v3 + 25, L3 = sg[2] ?? T.v3 + 38;
  const HP = () => xBase(T.ra + 4);              // ritari istuu tässä (3.11-3.12)
  seg(T.v3, L1, 'hellyys', (u, t) => ({ x: mix(-9, HP() - 3.5, ease(u)) + sine(t, 0.4, 0.8), y: mix(11, 6.8, ease(u)) + mel(t) * 0.6 }), { brk: true });
  seg(L1, L2, 'hellyys', (u, t) => {
    const w = ease(u);
    return { x: mix(HP() - 3.5, STONES[1].x + 1.6, ease(smoothstep(0, 0.45, u))) + (u > 0.55 ? sine(t, 0.3, 1) : 0), y: mix(6.8, STONES[1].top + 0.9, ease(smoothstep(0, 0.45, u))) + 0.25 * Math.sin(t * 1.4) * w, z: u > 0.4 ? -0.35 : 0.12 };
  });
  seg(L2, L3, 'hellyys', (u, t) => {
    const w = ease(smoothstep(0.0, 0.7, u));
    const r = (1 - w) * 1.4;
    return { x: mix(STONES[1].x + 1.6, HP() + 1.05, w) + r * Math.sin(t * 1.2), y: mix(STONES[1].top + 0.9, 0.82, w) + r * 0.5 * Math.cos(t * 1.2), z: 0.2 };
  });
  seg(L3, T.rk, 'hellyys', (u, t) => {
    // kämmeneltä olkapään yli yhdeksi kaareksi
    const a = Math.PI * (0.05 + 0.9 * ease(u));
    const cx = HP() + 0.05, rx = 1.35, ry = 2.1;
    return { x: cx + rx * Math.cos(Math.PI - a) * 1.0 + 0.55, y: 0.82 + ry * Math.sin(a) * 0.95, z: 0.2 };
  });
  // 3.13 ennen venettä: viiva ritarin edellä; veneessä keulassa
  seg(T.rk, T.rh, 'hellyys', (u, t) => {
    const B = boatT(t);
    const walk = 1 - smoothstep(tBoard0, tBoard1, t);
    const mast = smoothstep(T.rh - 9, T.rh - 0.6, t);
    const px = mix(mix(B.x + 3.3 + sine(t, 0.2, 0.7), xBase(t) + 3.1, walk), B.x + 2.1, mast);
    return { x: px, y: mix(mix(B.y + 1.5 + 0.35 * Math.sin(t * 1.2), 6.4 + 0.5 * Math.sin(t * 1.2), walk), B.y + 5.6, mast) + 0.4 * mel(t) * (1 - mast), z: mix(-2.6, -0.6, walk) };   // otto 64 (kierros 4): reitti kulkee ritarin ja viirin ohi (yläpuolelta ja takaa), ei yli (kuvasääntö 22)
  }, { brk: true, fig: 1 });
  // 3.14-3.18: viiva on punoksen valkoinen säie (braid); sen jälkeen viiva hiipuu mastoon
  seg(T.rh, T.aa, 'punos', (u, t) => { const B = boatT(t); return { x: B.x + 2.6, y: B.y + 6.5, z: -2.6 }; }, { vis: 0 });
  // 3.19 palaa rannalle: viiva vierellä kaarena
  seg(T.aa, T.ja, 'hellyys', (u, t) => {
    const B = boatT(t);
    return { x: B.x - 2.2 * B.dir + sine(t, 0.5, 0.8), y: B.y + 3.0 + 0.5 * Math.sin(t * 0.9) + mel(t) * 0.5, z: -2.6 };
  }, { brk: true });
  // 3.20 rannalla: kumppani seisoo viivahahmona ritarin vieressä (fig), ei erillistä viivaa
  seg(T.ja, T.un, 'hellyys', (u, t) => ({ x: SHORE_SIT + 1.2, y: 1.0, z: 0.2 }), { vis: 0 });
  // 3.21 nukkuu kiven päällä suorana (oma viiva), 3.22 kuivuu
  seg(T.un, T.wal + 5, 'uni', (u, t) => ({ x: SHORE_SIT - 0.9, y: 1.5 }), { vis: 0 });
  const cseg = (t) => { for (let i = CSEG.length - 1; i >= 0; i--) if (t >= CSEG[i].a) return CSEG[i]; return CSEG[0]; };
  function cpos(t) {
    const s = cseg(t);
    const u = clamp((t - s.a) / Math.max(0.05, s.b - s.a));
    const p = s.f(u, t);
    return { x: p.x, y: p.y, z: p.z ?? s.z, hide: !!p.hide, s };
  }
  // yhtenäisen viivajakson alku: ketju jatkuu, kun jakso ei ole 'brk' (uusi alku) eikä edellinen jakso ole näkymätön
  function chainStart(t) {
    let i = CSEG.indexOf(cseg(t));
    while (i > 0 && !CSEG[i].brk && CSEG[i - 1].vis !== 0) i--;
    return CSEG[i].a;
  }
  // portti: näkyy kun jakso sallii; jakson alussa ja lopussa häivytys (katkoksissa ei viivaa hyppy-kohdassa)
  function cgate(tt) {
    const s = cseg(tt);
    let g = s.vis;
    if (s.fig) g *= 1 - smoothstep(tBoard1 - 1.0, tBoard1 + 0.8, tt);   // veneessä viiva muuttuu viivahahmoksi
    if (s.brk) g *= smoothstep(s.a, s.a + 0.7, tt);
    g *= 1 - smoothstep(s.b - 0.5, s.b - 0.05, tt) * (CSEG[CSEG.indexOf(s) + 1]?.brk ? 1 : 0);
    if (s.ele === 'kevytmielisyys') { const u = (tt - s.a) / (s.b - s.a); g *= 1 - (smoothstep(0.3, 0.34, u) - smoothstep(0.5, 0.54, u)); }
    return clamp(g);
  }

  // --- Muut ajastukset ----------------------------------------------------------------------------------
  const skyPur = (t) => smoothstep(T.hu + 2.2, T.hu + 9.6, t) * (1 - smoothstep(T.hu + 15.5, T.sh + 4, t));
  const braidPur = (t) => Math.max(skyPur(t), 0.9 * smoothstep(T.hu + 2.2, T.hu + 9.6, t) * (1 - smoothstep(T.sh + 6, T.aa - 1, t)));
  const aavistus = (t) => 0.5 * smoothstep(T.no, T.no + 8, t) * (1 - smoothstep(T.ko + 3, T.hu + 0.8, t));
  const braidLen = (t) => smoothstep(T.rh + 1, T.rh + 12, t) * (1 - smoothstep(T.aa, T.ja - 4, t));
  const inkWin = (tt) => smoothstep(T.hu - 0.3, T.hu + 0.6, tt) * (1 - smoothstep(T.sh - 3.0, T.sh - 0.5, tt));
  const night = (t) => smoothstep(T.v3 + 30, T.rk + 6, t);
  const eveningDeep = (t) => smoothstep(T.va2, T.v3, t);

  // --- Otot (kamerat): ankkureissa ja jaksorajoissa ----------------------------------------------------------
  const FOL = { hero: (t) => xBase(t) + 0.0, boat: (t) => boatXf(t), none: () => 0 };
  const P = (s, t) => { const f = FOL[s.f ?? 'none'](t); return { pos: [s.x + f, s.y, s.z], look: [s.lx + f, s.ly, 0], fov: s.fov ?? 40 }; };
  const mixS = (a, b, w) => { const o = {}; for (const k in a) o[k] = typeof a[k] === 'number' ? a[k] + ((b[k] ?? a[k]) - a[k]) * w : a[k]; return o; };
  const sh = (name, a, b, s0, s1 = s0) => ({ name, a, b, cam: (u, t) => P(mixS(s0, s1, glide(u)), t) });
  const SHOTS = [];
  const add = (...a) => SHOTS.push(sh(...a));
  // 3.1 Ääni: laaja, ritari pieni oikealla alhaalla, viiva ylävasemmalla
  add('3.1 ääni: viiva latvoissa, ritari pieni', T.viulu, T.v1, { x: -6, y: 6.6, z: 38, lx: -6, ly: 6.0 }, { x: -5.5, y: 6.7, z: 36, lx: -5.5, ly: 6.0 });
  add('3.2 vastaus: kello, lähikuva', T.v1, T.v2, { x: X0 - 0.1, y: 1.8, z: 6.4, lx: X0 - 0.3, ly: 1.9 }, { x: X0 - 0.4, y: 1.9, z: 6.0, lx: X0 - 0.5, ly: 2.0 });
  add('3.3 keskustelu: ensimmäinen askel', TURN[0], TURN[1], { x: -3.5, y: 4.1, z: 18, lx: -4.0, ly: 3.9 }, { x: -4.0, y: 4.2, z: 17, lx: -4.4, ly: 4.0 });
  add('3.3 keskustelu: puiden lomassa', TURN[1], TURN[2], { x: -6.5, y: 5.2, z: 23, lx: -7.0, ly: 4.8 }, { x: -6.0, y: 5.1, z: 22, lx: -6.4, ly: 4.7 });
  add('3.3 keskustelu: ritari niityllä', TURN[2], T.va2, { x: -3.4, y: 2.9, z: 12, lx: -3.8, ly: 2.7 }, { x: -3.6, y: 3.0, z: 11.5, lx: -4.0, ly: 2.8 });
  const w34 = nearSeg(T.va2 + 8, T.va2 + 4, T.mo - 30), w34b = nearSeg(T.mo - 14, w34 + 8, T.mo - 6);
  add('3.4 toinen vastaus: kävelee rantaan', T.va2, w34, { f: 'hero', x: 1.0, y: 3.2, z: 17, lx: 3.0, ly: 2.7 }, { f: 'hero', x: 2.0, y: 3.3, z: 18, lx: 3.5, ly: 2.8 });
  add('3.4 toinen vastaus: ranta ja aurinko puiden takana', w34, w34b, { x: 7.5, y: 5.2, z: 34, lx: 8.5, ly: 5.4 }, { x: 8.0, y: 5.0, z: 32, lx: 9.0, ly: 5.3 });
  add('3.4 toinen vastaus: kivellä', w34b, T.mo, { x: 5.8, y: 2.6, z: 14, lx: 6.6, ly: 2.2 }, { x: 6.0, y: 2.6, z: 13, lx: 6.7, ly: 2.3 });
  // 3.5 viisi mielialaa: kuva viivan korkeudella, ritari alareunassa
  add('3.5 kaipaus: kaari veden yllä', T.mo, M1, { x: 5.5, y: 8.6, z: 30, lx: 6.0, ly: 7.4 }, { x: 7.0, y: 8.0, z: 30, lx: 7.5, ly: 6.9 });
  add('3.5 ilo: kiveltä kivelle', M1, M2, { x: 4.4, y: 2.8, z: 16, lx: 4.6, ly: 2.5 }, { x: 4.6, y: 2.9, z: 15, lx: 4.8, ly: 2.6 });
  add('3.5 kevytmielisyys: puun taakse', M2, M3, { x: 0.9, y: 3.4, z: 18, lx: 0.9, ly: 3.0 }, { x: 1.4, y: 3.5, z: 17, lx: 1.4, ly: 3.1 });
  add('3.5 hellyys: kämmenelle', M3, M4, { x: 5.9, y: 1.6, z: 8, lx: 6.0, ly: 1.4 }, { x: 6.0, y: 1.6, z: 7.4, lx: 6.1, ly: 1.4 });
  add('3.5 sarkasmi: piikki', M4, T.va3, { x: 4.8, y: 5.0, z: 15, lx: 5.4, ly: 5.0 }, { x: 5.6, y: 6.0, z: 17, lx: 6.4, ly: 6.4 });
  add('3.6 painokas vastaus: kello täyttää kuvan', T.va3, T.ki, { x: 4.0, y: 2.5, z: 6.4, lx: 4.1, ly: 2.7 }, { x: 4.0, y: 2.7, z: 6.0, lx: 4.1, ly: 2.9 });
  add('3.7 kiihtyminen: pyörre, kuva laajenee', T.ki, T.pu, { f: 'hero', x: 0, y: 3.4, z: 13, lx: 0, ly: 3.0 }, { f: 'hero', x: 1.0, y: 7.0, z: 30, lx: 3.5, ly: 7.2 });
  const p38 = [nearSeg(T.pu + 16, T.pu + 10, T.pu + 24), nearSeg(T.pu + 36, T.pu + 28, T.le - 8)];
  add('3.8 pisteet: keihäs otetaan', T.pu, p38[0], { x: 0.3, y: 2.7, z: 11, lx: 0.2, ly: 2.5 }, { x: 0.0, y: 2.8, z: 11.5, lx: -0.2, ly: 2.6 });
  add('3.8 pisteet: metsänreuna', p38[0], p38[1], { x: -3.2, y: 3.8, z: 22, lx: -4.0, ly: 3.6 }, { x: -3.6, y: 3.9, z: 21, lx: -4.4, ly: 3.7 });
  add('3.8 pisteet: kääntyy kohti', p38[1], T.le, { x: 0.0, y: 2.6, z: 12, lx: -0.8, ly: 2.5 }, { x: 0.0, y: 2.6, z: 10.5, lx: -0.9, ly: 2.6 });
  add('3.9 leimahdus: viiri täyttää kuvan', T.le, T.lu, { x: 0.2, y: 3.0, z: 10.5, lx: 1.1, ly: 2.9 }, { x: 0.3, y: 3.1, z: 9.6, lx: 1.3, ly: 3.0 });
  add('3.10 nauru: viiva kaukana, ritari pieni', T.lu, T.ra, { x: 5.0, y: 8.5, z: 36, lx: 6.5, ly: 7.9 }, { x: 6.5, y: 8.6, z: 36, lx: 8.5, ly: 8.2 });
  add('3.11 rauhoittava fraasi: käsi ja maa', T.ra, T.v3, { x: -0.1, y: 1.2, z: 8.6, lx: 0.5, ly: 1.1 }, { x: 0.3, y: 1.2, z: 6.6, lx: 0.9, ly: 0.95 });
  add('3.12 lähentyminen: latvoista', T.v3, L1, { x: -3.5, y: 6.2, z: 27, lx: -3.0, ly: 5.6 }, { x: -2.0, y: 5.6, z: 24, lx: -1.6, ly: 5.0 });
  add('3.12 lähentyminen: kiven taakse', L1, L2, { x: 2.3, y: 2.8, z: 14, lx: 2.2, ly: 2.5 }, { x: 2.0, y: 2.8, z: 13, lx: 1.9, ly: 2.5 });
  add('3.12 lähentyminen: kämmenelle', L2, L3, { x: 1.0, y: 1.6, z: 9.2, lx: 0.9, ly: 1.4 }, { x: 0.6, y: 1.7, z: 8.6, lx: 0.6, ly: 1.5 });
  add('3.12 lähentyminen: olkapäälle, kaari', L3, T.rk, { x: 0.3, y: 2.5, z: 12.5, lx: 0.4, ly: 2.2 }, { x: 0.0, y: 2.6, z: 14, lx: 0.2, ly: 2.4 });
  const w13 = nearSeg(T.rk + 13.6, T.rk + 8, T.rh - 8);
  add('3.13 rakkauskohtaus: työntää veneen', T.rk, w13, { x: 5.5, y: 4.4, z: 33, lx: 7.0, ly: 4.6 }, { x: 8.0, y: 4.3, z: 31, lx: 9.5, ly: 4.7 });
  add('3.13 rakkauskohtaus: vene kuun juovalla', w13, T.rh, { f: 'boat', x: -2.0, y: 4.8, z: 30, lx: 1.5, ly: 5.0 }, { f: 'boat', x: -1.5, y: 4.9, z: 31, lx: 2.0, ly: 5.1 });
  const s314 = segsIn(T.rh + 6, T.hi - 5);
  const c1 = s314[0] ?? T.rh + 12.7, c2 = s314[1] ?? T.rh + 24, c3 = s314[3] ?? T.rh + 36;
  add('3.14 kahden kesken: punos syntyy', T.rh, c1, { f: 'boat', x: 0.8, y: 3.8, z: 19, lx: 2.4, ly: 4.2 }, { f: 'boat', x: 1.0, y: 4.0, z: 17.5, lx: 2.6, ly: 4.4 });
  add('3.14 kahden kesken: punos lähikuvassa, kuu takana', c1, c2, { f: 'boat', x: 1.6, y: 4.4, z: 12.5, lx: 3.0, ly: 4.5 }, { f: 'boat', x: 1.9, y: 4.6, z: 12.0, lx: 3.4, ly: 4.7 });
  add('3.14 kahden kesken: kaksi hahmoa', c2, c3, { f: 'boat', x: 0.2, y: 2.0, z: 8.6, lx: 0.9, ly: 1.8 }, { f: 'boat', x: 0.4, y: 2.1, z: 8.2, lx: 1.1, ly: 1.9 });
  add('3.14 kahden kesken: pitkä veto', c3, T.hi, { f: 'boat', x: 0.6, y: 3.8, z: 22, lx: 2.4, ly: 4.4 }, { f: 'boat', x: 0.8, y: 3.9, z: 24, lx: 2.6, ly: 4.6 });
  add('3.15 hiljaisuus: vene leijuu', T.hi, T.no, { f: 'boat', x: 0.4, y: 2.2, z: 26, lx: 2.2, ly: 5.4 }, { f: 'boat', x: 0.6, y: 2.4, z: 27, lx: 2.4, ly: 5.8 });
  const s315 = nearSeg(T.no + 14, T.no + 10, T.ko - 3);
  add('3.15 nousu: punos levenee', T.no, s315, { f: 'boat', x: 1.4, y: 4.3, z: 13, lx: 3.0, ly: 4.6 }, { f: 'boat', x: 1.7, y: 4.5, z: 12.5, lx: 3.4, ly: 4.8 });
  add('3.15 nousu: kuu ja punos', s315, T.ko, { f: 'boat', x: 1.0, y: 3.4, z: 15, lx: 2.8, ly: 4.0 }, { f: 'boat', x: 1.4, y: 3.6, z: 17, lx: 3.4, ly: 4.2 });
  add('3.16 ovella: nousee seisomaan', T.ko, T.hu, { f: 'boat', x: 2.4, y: 4.0, z: 28, lx: 4.8, ly: 4.1 }, { f: 'boat', x: 2.6, y: 4.1, z: 27, lx: 5.0, ly: 4.3 });
  const p17 = [nearSeg(T.hu + 7.4, T.hu + 5, T.hu + 11), nearSeg(T.hu + 13.4, T.hu + 11.5, T.sh - 8)];
  add('3.17 huippu: olennot painuvat, veto kuun yli', T.hu, p17[0], { f: 'boat', x: 1.8, y: 4.1, z: 19, lx: 3.0, ly: 4.6 }, { f: 'boat', x: 2.0, y: 4.5, z: 20, lx: 3.2, ly: 5.0 });
  add('3.17 huippu: purppura', p17[0], p17[1], { f: 'boat', x: 1.4, y: 4.8, z: 21, lx: 2.8, ly: 5.0 }, { f: 'boat', x: 1.6, y: 5.6, z: 22, lx: 3.0, ly: 5.6 });
  add('3.17 huippu: kuva nousee', p17[1], T.sh, { f: 'boat', x: 1.6, y: 5.6, z: 22, lx: 3.0, ly: 5.6 }, { f: 'boat', x: 1.6, y: 6.2, z: 24, lx: 3.0, ly: 6.2 });
  add('3.18 hellänä: kaksi muotoa', T.sh, T.aa, { f: 'boat', x: 1.3, y: 2.9, z: 9.0, lx: 2.2, ly: 3.0 }, { f: 'boat', x: 1.5, y: 3.1, z: 8.4, lx: 2.5, ly: 3.2 });
  // 3.19 päättyy täsmälleen 3.20:n alkuotokseen (sama paikka, katse ja polttoväli), joten 980 s:ssä ei ole kameran hyppyä
  const bJa = boatXf(T.ja);
  add('3.19 aalto: vene rantaan', T.aa, T.ja, { f: 'boat', x: -1.0, y: 5.2, z: 33, lx: 0.0, ly: 5.4 }, { f: 'boat', x: 9.2 - bJa, y: 5.4, z: 34, lx: 10.5 - bJa, ly: 5.8 });
  const e20 = [T.ja, nearSeg(T.ja + 25, T.ja + 18, T.ja + 30), nearSeg(T.ja + 55, T.ja + 45, T.ja + 60), nearSeg(T.ja + 70, T.ja + 62, T.un - 14), T.un];
  add('3.20 jälkihehku: laaja, kuu ja ranta', e20[0], e20[1], { x: 9.2, y: 5.4, z: 34, lx: 10.5, ly: 5.8 }, { x: 9.6, y: 5.6, z: 32, lx: 10.8, ly: 6.0 });
  add('3.20 jälkihehku: kaksi hahmoa', e20[1], e20[2], { x: 8.4, y: 2.5, z: 11, lx: 8.9, ly: 2.6 }, { x: 8.5, y: 2.6, z: 10.4, lx: 9.0, ly: 2.7 });
  add('3.20 jälkihehku: taivas', e20[2], e20[3], { x: 9.0, y: 6.0, z: 25, lx: 10.5, ly: 6.4 }, { x: 9.2, y: 6.2, z: 25, lx: 10.8, ly: 6.8 });
  add('3.20 jälkihehku: kaksi hahmoa, kutsu', e20[3], e20[4], { x: 8.5, y: 2.6, z: 11, lx: 9.0, ly: 2.8 }, { x: 8.6, y: 2.7, z: 10.5, lx: 9.1, ly: 2.9 });
  // 3.21: kaislikon reunan olennot (oikealla), ritari ja nojaava kumppani vasemmalla; olennot tulevat vain kun niiden soitin soi
  add('3.21 uni: suon olennot kaislikon reunassa, ritari ja kumppani', T.un, T.hs, { x: 12.6, y: 4.4, z: 18, lx: 13.4, ly: 4.9 }, { x: 13.0, y: 4.5, z: 17, lx: 13.8, ly: 5.0 });
  add('3.22 tyven: paperi, kaksi muotoa', T.hs, T.wal + 1, { x: 8.5, y: 3.0, z: 14, lx: 9.6, ly: 3.0 }, { x: 9.0, y: 3.1, z: 15, lx: 10.2, ly: 3.2 });
  const shotOf = (t) => { let s = SHOTS[0]; for (const x of SHOTS) if (t >= x.a) s = x; return s; };
  const camAt = (t) => { const s = shotOf(t); return s.cam(clamp((t - s.a) / Math.max(0.05, s.b - s.a)), t); };

  // --- Näyttämö -----------------------------------------------------------------------------------------
  const scene = new THREE.Scene();
  const SKY = makeSky(scene);
  const skyMat = SKY.mesh.material;
  skyMat.uniforms.uPur = { value: 0 };
  skyMat.uniforms.uPurC = { value: C.purple.clone() };
  skyMat.fragmentShader = skyMat.fragmentShader
    .replace('uniform float uRays;', 'uniform float uRays; uniform float uPur; uniform vec3 uPurC;')
    .replace('c = mix(c, uPaper, moon);', 'c = mix(c, uPurC, halftone(uPur * (1.0 - moon), 1.05, uCell * 1.25));\n    c = mix(c, uPaper, moon);');
  skyMat.needsUpdate = true;
  // Tähdet tasaisesti napa-ympyrän (säde 20-420) sisällä, joten pyöritys napansa ympäri ei jätä tyhjiä sektoreita (A12).
  // Napa = huipun kuvan keskipiste (kuun kohta, tähtitasolla z -470). Vain tähdet pyörivät, ei kuuta eikä vuoria.
  const STAR_C = { x: 24, y: 5 };
  const NSTAR = 440;
  const stars = new THREE.InstancedMesh(new THREE.CircleGeometry(1, 8), ink(C.paper, {}), NSTAR);
  stars.frustumCulled = false;
  stars.position.z = -470;
  scene.add(stars);
  const starP = Array.from({ length: NSTAR }, (_, i) => {
    const rr = Math.sqrt(20 * 20 + (420 * 420 - 20 * 20) * hash1(i * 5 + 1)), a0 = Math.PI * 2 * hash1(i * 5 + 2);
    return { rr, a0, r: 0.9 + 1.5 * hash1(i * 5 + 3) * hash1(i * 5 + 4), o: hash1(i * 5 + 9) };
  });
  // Kulmanopeus: nolla -> enintään 0,05 rad/s huipusta (gef_huippu), kasvaa fraasin voimakkuuden mukana ja pysähtyy pehmeästi ennen
  // gef_sankari_hiljaa:ta. Kulma on nopeuden integraali (puhdas ajan funktio, kiinteä askel).
  const SPIN_MAX = 0.05;
  const spinW = (tt) => SPIN_MAX * smoothstep(T.hu, T.hu + 9, tt) * (1 - smoothstep(T.sh - 9, T.sh - 0.5, tt)) * (0.55 + 0.45 * clamp(S.loud(tt)));
  const starsAngle = (t) => {
    if (t <= T.hu) return 0;
    const t1 = Math.min(t, T.sh), h = 0.25;
    let a = 0;
    for (let tt = T.hu; tt < t1; tt += h) a += 0.5 * (spinW(tt) + spinW(Math.min(t1, tt + h))) * Math.min(h, t1 - tt);
    return -a;   // myötäpäivään kuin levy
  };
  const m4 = new THREE.Matrix4();
  const hillMat = ink(C.blue, { shade: C.black, raster: 0.5 });
  const hills = flat(scene, ridgeGeo(-500, 700, 22, 17, { lambda: 70, base: -300 }), hillMat, { z: -200, y: 3 });
  hills.userData.edge = { name: 'kukkulat' };
  const farGround = flat(scene, ridgeGeo(-500, 700, 0.5, 7, { lambda: 14, base: -40 }), ink(C.black, { shade: C.blue, raster: 0.3 }), { z: -10, y: 2.5 });
  farGround.userData.edge = { name: 'vastaranta' };
  const farTreeMat = ink(C.black, { shade: C.blue, raster: 0.3 });
  for (let i = 0; i < 70; i++) {
    const h = 1.6 + 2.0 * hash1(i * 3 + 100) + (i % 5 === 0 ? 1.0 : 0);
    flat(scene, earleTree(h, h * 0.4, i * 11 + 3), farTreeMat, { x: 8 + i * 4.3 + 2 * hash1(i * 3 + 101), y: 2.5, z: -10.5 + 0.1 * (i % 3) });
  }
  const WATER_Z = -5.5;
  const lake = water(scene, 1400, 24, { x: 120, y: -9.4, z: WATER_Z, base: C.blue, deep: C.black });
  const lakeMat = lake.mesh.material;
  lakeMat.fragmentShader = WATER_FS;
  lakeMat.uniforms.uMoonX = { value: 0 };
  lakeMat.uniforms.uMoonAmt = { value: 0 };
  lakeMat.uniforms.uHarp = { value: new THREE.Vector4(0, 0, 0, 0) };
  lakeMat.uniforms.uPur = { value: 0 };
  lakeMat.uniforms.uPurC = { value: C.purple.clone() };
  lakeMat.uniforms.uDim = U.uDim;
  lakeMat.needsUpdate = true;
  lake.mesh.userData.edge = { name: 'järvi' };
  // metsän takaseinä: matala kallistuva reuna (ei pystysuoraa leikkausta)
  const wallPts = [];
  for (let i = 0; i <= 170; i++) {
    const x = -440 + i * 2.6;
    const slope = 1 - smoothstep(-34, -1.5, x);
    wallPts.push([x, 0.4 + 15.6 * slope + 2.2 * vnoise1(x / 6, 91) * slope]);
  }
  flat(scene, skylineGeo(wallPts, -30), ink(C.black, { shade: C.blue, raster: 0.38 }), { z: -5.0 });
  const forestFar = ink(C.blue, { shade: C.black, raster: 0.5 });
  const forestMid = ink(C.black, { shade: C.blue, raster: 0.3 });
  for (let i = 0; i < 110; i++) {
    const x = -300 + i * 2.5 + 1.5 * hash1(i + 200);
    if (x > -3.5) continue;
    const h = 8 + 7 * hash1(i * 3 + 210) + (i % 7 === 0 ? 3 : 0);
    flat(scene, earleTree(h, h * 0.4, i * 13 + 5), forestFar, { x, y: -0.4, z: -4.6 + 0.1 * (i % 3) });
  }
  for (let i = 0; i < 70; i++) {
    const x = -200 + i * 3.4 + 2 * hash1(i + 300);
    if (x > -4.4) continue;
    const h = 9 + 7 * hash1(i * 3 + 310) + (i % 5 === 0 ? 2.5 : 0);
    flat(scene, earleTree(h, h * 0.36, i * 17 + 9), forestMid, { x, y: -0.5, z: -3.0 + 0.1 * (i % 3) });
  }
  const bigAt = [[-9.6, 15.5], [-14.5, 17.5], [-19.5, 14.5], [-26, 18]];
  bigAt.forEach(([x, h], i) => flat(scene, earleTree(h, h * 0.34, i * 19 + 7), ink(C.black, { shade: C.blue, raster: 0.1 }), { x, y: -0.5, z: -1.0 + 0.1 * (i % 3) }));
  // etualan puu: viiva katoaa sen taakse (kevytmielisyys)
  const hideTreeMat = ink(C.black, { shade: C.blue, raster: 0.06 });
  flat(scene, earleTree(12.5, 3.4, 61), hideTreeMat, { x: TREE_HIDE, y: -0.6, z: 0.9 });
  // niitty: ranta laskee veteen x > BANK
  const mpts = [];
  mpts.push([-400, 0]);
  for (let i = 0; i <= 260; i++) {
    const x = -140 + i * 0.6;
    let y = 0.28 * vnoise1(x / 7, 57) * (1 - smoothstep(6, 9, x));
    const bank = smoothstep(BANK - 0.2, BANK + 2.6, x);
    y = y * (1 - bank) + (-6.5) * bank;
    mpts.push([x, y]);
  }
  mpts.push([60, -6.5], [200, -6.5], [500, -6.5]);
  const meadowMat = ink(C.black, { shade: C.blue, raster: 0.3 });
  const meadow = flat(scene, skylineGeo(mpts, -40), meadowMat, { z: -0.4, y: -0.05 });
  meadow.userData.edge = { name: 'niitty' };
  // kivet ja lohkare
  const stoneMat = ink(C.blue, { shade: C.black, raster: 0.4 });
  const stonePoly = (w, h) => poly([[-w, 0], [-w * 0.85, h * 0.6], [-w * 0.4, h], [w * 0.3, h * 0.96], [w * 0.8, h * 0.55], [w, 0]]);
  for (const [i, st] of STONES.entries()) {
    const w = [1.25, 1.3, 0.55][i], h = st.top + 0.12;
    flat(scene, stonePoly(w, h), stoneMat, { x: st.x, y: -0.12, z: -0.12 });
  }
  // heinät
  const grassG = group(scene, { z: 0.35 });
  const grassMat = ink(C.black, { shade: C.blue, raster: 0.25 });
  for (let k = 0; k < 150; k++) {
    const x = -14 + k * 0.17 + 0.1 * hash1(k + 500);
    if (x < -14 || x > BANK - 0.4) continue;
    const hh = 0.35 + 0.8 * hash1(k + 501);
    flat(grassG, poly([[-0.03, 0], [0.03, 0], [0.18 * (hash1(k + 502) - 0.5), hh]]), grassMat, { x, y: -0.15 });
  }
  // maan pöllähdys (3.2): patarummun iskut puhaltavat maan viivoituksen ilmaan ritarin jalkojen juuresta
  const dustMat = ink(C.paper, { shade: C.blue, raster: 0.5 });
  const lens = poly([[-1, 0], [0, 0.4], [1, 0], [0, -0.4]]);
  const DUST = Array.from({ length: 12 }, () => flat(scene, lens, dustMat, { z: 0.22 }));
  const percOns = S.onsetsIn(T.v1 - 0.6, T.v2 - 1, (t) => S.fam.perc(t) > 0.1).slice(0, 4);
  while (percOns.length < 3) percOns.push(T.v1 + 1.2 + 2.1 * percOns.length);
  // saari kaislikkoineen (3.16): olennot nousevat sieltä
  const isleX = 31;
  const reedBlades = [];
  for (let i = 0; i < 60; i++) {
    const x = 9 * (i / 59) + 0.25 * (hash1(i * 7 + 1) - 0.5);
    const hh = 0.7 + 0.7 * hash1(i * 7 + 2) + (i % 4 === 0 ? 0.6 : 0), lean = (hash1(i * 7 + 3) - 0.5) * 0.9, w = 0.07;
    reedBlades.push([[x - w, 0], [x + w, 0], [x + w * 0.7 + lean * 0.5, hh * 0.55], [x + lean, hh], [x - w * 0.7 + lean * 0.5, hh * 0.55]]);
  }
  const bpos = [];
  for (const pts of reedBlades) for (let i = 1; i < pts.length - 1; i++) bpos.push(pts[0][0], pts[0][1], 0, pts[i][0], pts[i][1], 0, pts[i + 1][0], pts[i + 1][1], 0);
  const bg = new THREE.BufferGeometry();
  bg.setAttribute('position', new THREE.Float32BufferAttribute(bpos, 3));
  bg.setAttribute('uv', new THREE.Float32BufferAttribute(new Array((bpos.length / 3) * 2).fill(0), 2));
  const reeds = flat(scene, bg, ink(C.black, { shade: C.blue, raster: 0.15 }), { x: isleX - 4.5, y: 0.35, z: -2.0 });
  flat(scene, poly([[-5, 0.0], [-3.8, 0.5], [3.4, 0.55], [5.2, 0.0]]), ink(C.black, { shade: C.blue, raster: 0.2 }), { x: isleX, y: 0.1, z: -2.1 });
  const duck = oboeDuck(scene), heron = cAnglaisHeron(scene), frog = bassoonFrog(scene);
  const crit = [duck, heron, frog];
  const critMats = crit.flatMap((c) => c.mats);
  duck.root.position.set(isleX - 2.6, 0.55, -2.0);
  heron.root.position.set(isleX + 0.3, 0.55, -2.0);
  heron.root.scale.set(1.15, 1.15, 1);
  frog.root.position.set(isleX + 3.1, 0.55, -2.0);
  crit.forEach((c) => (c.root.scale.x *= -1));
  // 3.21 Uni (B9): arvostelijoiden katkelmat = tunnistettavat suon olennot kaislikon reunassa ja tähtien joukossa; kukin omasta
  // mitatusta kanavastaan ja vain kun se soi (huilu -> hyttynen, puupuhaltimet -> oboesorsa ja englannintorvihaikara, klarinetti -> sammakko)
  const REEDB_X = 15.8;
  const reedsB = flat(scene, bg, ink(C.black, { shade: C.blue, raster: 0.15 }), { x: REEDB_X, y: 0.3, z: -4.3, s: [1, 0.55] });
  const isleB = flat(scene, poly([[-0.8, 0.0], [0.2, 0.5], [8.4, 0.55], [9.6, 0.0]]), ink(C.black, { shade: C.blue, raster: 0.2 }), { x: REEDB_X, y: 0.1, z: -4.2 });
  // koot ritarin korkeuteen (1,9 yksikköä) nähden, tyyliohje luku 10 ja loc_swamp.js SCp: hyttynen pään kokoinen (0,2 siipineen ja pistimineen), sorsa 0,35-0,4,
  // haikara 0,5 (korkeus), sammakko 0,2-0,25. FAR: kaislikon reuna on z -4 ja kamera kaukana, joten kerroin on mitattu kuvasta (ritari 230 px: sorsa 0,38, haikara 0,5, sammakko 0,22, hyttynen 0,2 siitä).
  const FARB = 3.4;
  const SCB = { mosq: 0.09 * FARB * 0.9, duck: 0.338 * FARB, heron: 0.278 * FARB * 0.5, frog: 0.183 * FARB * 1.1 };
  const mosqB = CSW.fluteMosquito(scene, SCB.mosq), duckB = CSW.oboeDuck(scene, SCB.duck), heronB = CSW.cAnglaisHeron(scene, SCB.heron), frogB = CSW.bassoonFrog(scene, SCB.frog);
  const critB = [
    { c: mosqB, k: SCB.mosq }, { c: duckB, k: SCB.duck }, { c: heronB, k: SCB.heron }, { c: frogB, k: SCB.frog },
  ];
  critB.forEach(({ c, k }) => { c.root.scale.set(-k, k, 1); });
  duckB.root.position.set(REEDB_X + 1.8, 0.62, -4.1);
  heronB.root.position.set(REEDB_X + 3.6, 0.62, -4.1);
  frogB.root.position.set(REEDB_X + 5.6, 0.62, -4.1);
  const critBMats = critB.flatMap(({ c }) => c.mats);
  // sinisten pisteiden joukko metsänreunassa (3.8)
  const dotMat = ink(C.blue, {}), dotRim = ink(C.paper, {});
  const dots = Array.from({ length: 12 }, (_, i) => {
    const g = group(scene, { x: -4.4 - 7.5 * hash1(i + 700), y: 0.7 + 4.2 * hash1(i + 710), z: -0.6 });
    flat(g, circle(0.46, 16), dotRim, { z: 0 });
    flat(g, circle(0.42, 16), dotMat, { z: 0.01 });
    return g;
  });
  const dotOns = S.onsetsIn(T.pu, T.le, (t) => S.fam.winds(t) > 0.08);
  const harpOns = [...harpChord, ...harpGl.map(([, b]) => b)].sort((a, b) => a - b);   // välkerenkaat: soinnun isku ja glissandon pohja (rintama saapuu veneen eteen)
  const flowT = W.integ((t) => 0.3 + 1.6 * clamp(W.lows(t)));
  // (paperipesu ja lyijykynäluonnos ovat main.js:n PAPER_TRANS: gef_hiljaisuus -> wal_kulissi1)
  // taivaan kohteet
  // kuu omana kiekkona kaukaisen rannan takana mutta kukkuloiden edessä (taivastaso jäisi kukkuloiden taakse)
  const moonMat = ink(C.paper, {});
  const moonMesh = flat(scene, circle(MOON.r, 48), moonMat, { x: MOON.x, y: MOON.y, z: MOON.z });
  // (kuun heijastuksen katkoviivat ovat vesishaderissa, WATER_FS dash/moonB; erillinen world-avaruuden moonDash-rivi poistettu
  //  kierroksella 4: se leijui lähiotoissa väärässä kohdassa lohkona ja oli kuun juovan kaksoiskappale)
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
  const oarN = group(hull, { x: SEAT.x + OAR.lock[0], y: SEAT.y + OAR.lock[1] + 0.0, z: 0.34 }), oarF = group(hull, { x: SEAT.x + OAR.lock[0], y: SEAT.y + OAR.lock[1], z: -0.02 });
  for (const o of [oarN, oarF]) { flat(o, rect(0.06, OAR.inboard + 2.6, 0.5, 2.6 / (OAR.inboard + 2.6)), oarMat, {}); flat(o, poly([[-0.12, -2.6], [0.12, -2.6], [0.1, -3.2], [-0.1, -3.2]]), oarMat, {}); }
  const mastG = group(boatG, { x: MASTX, y: 0.3, z: 0.05 });
  flat(mastG, rect(0.09, 5.3, 0.5, 0), ink(C.black, {}), {});
  const penMat = waveMat(C.red, { shade: C.black, raster: 0, amp: 0.14, k: 6 });
  const pennant = new THREE.Mesh(pennantGeo(1.9, 0.5), penMat);
  pennant.frustumCulled = false;
  pennant.position.set(MASTX + 0.02, 5.45, 0.06);
  boatG.add(pennant);
  const boatDash = reflectDashes(scene, 7, C.black);
  // ritari ja hänen keihäänsä (vapaa keihäs, kun ei kädessä)
  const lead = leader(scene, {});
  // selkäkuva rannalla (3.20-3.22): istuva viitta, pää kellokypärässä, vasen käsi keihääseen (oma, korvaa knightBackin laatikon)
  const back = (() => {
    const root = group(scene);
    root.visible = false;
    const M = { cloak: ink(C.red, { shade: C.black, raster: 0.4 }), body: ink(C.red, {}), rim: ink(C.paper, {}), line: ink(C.black, {}), cape: waveMat(C.red, { shade: C.black, raster: 0.55, amp: 0.1, k: 4 }) };
    const cloak = group(root);
    flat(cloak, poly([[-0.66, 0], [0.66, 0], [0.5, 0.5], [0.42, 0.95], [0.32, 1.2], [-0.32, 1.2], [-0.42, 0.95], [-0.5, 0.5]]), M.cloak, { z: 0 });
    flat(cloak, poly([[-0.36, 0.95], [0.36, 0.95], [0.3, 1.26], [-0.3, 1.26]]), M.body, { z: 0.01 });
    flat(cloak, strokeGeo([[0, 0.05], [0.02, 0.8]], 0.04), M.line, { z: 0.012 });
    const head = group(root, { y: 1.45, z: 0.03 });
    flat(head, circle(0.13, 24), M.body);
    flat(head, poly([[-0.07, 0.06], [0.07, 0.06], [0.05, 0.28], [0.27, 0.58], [-0.27, 0.58], [-0.05, 0.28]]), M.body, { z: 0.002 });
    flat(head, circle(0.27, 32, 0, 0.58, 0.18), M.rim, { z: 0.004 });
    const armL = group(root, { x: -0.34, y: 1.1, z: 0.04 });
    flat(armL, limb(0.62, 0.13, 0.09), M.line);
    return { root, cloak, head, armL, M, mats: Object.values(M) };
  })();
  // vapaa keihäs: varsi, kärki ja viiri (sama nauharakenne kuin hero.js)
  const FL = new THREE.Group();
  scene.add(FL);
  const LEN = 3.4, NB = 28;
  flat(FL, poly([[-0.025, -GRIP_BELOW], [0.025, -GRIP_BELOW], [0.025, LEN - GRIP_BELOW], [-0.025, LEN - GRIP_BELOW]]), ink(C.black), { z: 0.05 });
  flat(FL, poly([[-0.07, LEN - GRIP_BELOW], [0.07, LEN - GRIP_BELOW], [0, LEN - GRIP_BELOW + 0.32]]), ink(C.paper), { z: 0.051 });
  const fgeo = new THREE.BufferGeometry();
  fgeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NB * 2 * 3), 3));
  fgeo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(NB * 2 * 2), 2));
  { const idx = []; for (let k = 0; k < NB - 1; k++) { const a = 2 * k; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } fgeo.setIndex(idx); }
  const fbanMat = ink(C.red, { shade: C.black, raster: 0 });
  const fban = new THREE.Mesh(fgeo, fbanMat);
  fban.frustumCulled = false;
  scene.add(fban);
  function fillFreeBanner(xf, t, width) {
    const pos = fgeo.getAttribute('position');
    const dx = Math.sin(xf.ang), dy = Math.cos(xf.ang);
    const tipOff = (LEN - GRIP_BELOW) - 0.15;
    for (let k = 0; k < NB; k++) {
      const u = k / (NB - 1), dt = 0.05;
      const w = windV(t - k * dt), age = k * dt;
      const tx = xf.x + dx * tipOff + w.x * age;
      const ty = xf.y + dy * tipOff + w.y * age + Math.sin(k * 0.6 - t * 6.0) * 0.12 * u * (0.4 + Math.hypot(w.x, w.y) * 0.3);
      const wid = width * (1 - 0.6 * u);
      pos.setXYZ(2 * k, tx, ty, xf.z + 0.06);
      pos.setXYZ(2 * k + 1, tx - dx * wid, ty - dy * wid, xf.z + 0.06);
    }
    pos.needsUpdate = true;
  }
  // kumppani: valkoinen viiva (tipTrail), lepäävä viiva (uni), lyijykynäviiva (paperi)
  // valkoinen viiva (sama mekanismi kuin companion.js companionTrail, mutta leveys kameran etäisyyden mukaan ja pidempi muisti)
  const pressK = (tt) => clamp(camAt(tt).pos[2] / 30, 0.35, 1.0);
  const pzDip = (tt) => { let d = 0; for (const [o] of pzEv) { const x = (tt - o) / 0.2; if (x > -3 && x < 3) d = Math.max(d, Math.exp(-x * x)); } return d; };
  // 3.13 (viiva kävelee ritarin edellä veneelle): viuluviivan varmuus on binäärinen ja siinä on 1-3 s aukkoja (tutti, viulu on osa soittoa),
  // jolloin viiva katkeili hiuksenohuiksi pisteiksi ja koukuiksi (812 s, kierros 4). Siinä jaksossa varmuutta pidetään yllä ±1,6 s yli,
  // joten viiva laskeutuu veneeseen yhtenä liikkeenä; muissa jaksoissa viiva näkyy vain kun viulu soi.
  const confHold = (tt) => {
    if (!cseg(tt).fig) return dirV(tt).conf;
    let m = 0;
    for (let d = -1.6; d <= 1.6 + 1e-9; d += 0.2) m = Math.max(m, dirV(tt + d).conf);
    return m;
  };
  const trail = tipTrail(scene, S, {
    color: C.paper, shade: C.blue, seed: 41, N: 300, win: 9, drift: 0.14, wmin: 0.04, wmax: 0.42, hairW: 0.03, bleed: 0.02, zOff: 0.05,
    gate: (tt) => smoothstep(0.05, 0.3, confHold(tt)) * cgate(tt),   // (viivan katkaisu pizzicatolla poistettu: liikkuva aukko aiheutti reunavälkettä; pizzicato näkyy pisteinä)
    press: (tt) => clamp(0.42 + 0.45 * S.loud(tt)) * pressK(tt) * (cseg(tt).fig ? 0.3 : 1),   // otto 64 (kierros 4): 3.13:n kulkuvaiheessa nauha on companionFigure-viivan levyinen (0,42 * 0,3 = 0,13), ei leveä nauha
  });
  const inkTrail = tipTrail(scene, S, { seed: 6, gate: (tt) => inkWin(tt) * heroGate(S, tt), wmax: 0.5, win: 5 });
  // Kumppani viivahahmona (companion.js companionFigure: yksi jatkuva viiva, ei siluettia eikä kasvoja): veneessä keulassa
  // (3.13-3.16), huipussa sulautuu ritarin vyöhön (sash.js), rannalla ritarin vierellä (3.20-3.21) ja sulautuu vyöhön ennen taistelua.
  const fig = companionFigure(scene);
  // suunnittelututkimus (kierros 4): ?kumppani=a|b|c valitsee viivaolennon; ilman parametria oletushahmo (renderi ei muutu)
  // Käyttäjän poikkeus 1.11.2026: kumppani on hetken tunnistettava ihminen (yksi jatkuva viiva, FK-eleet, reagoi sankariin);
  // oletus 'ihminen'. ?kumppani=a|b|c|oletus valitsee muun (suunnittelututkimus kierros 4).
  const figParam = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('kumppani') : null;
  const figVariant = figParam === 'oletus' ? undefined : (figParam || 'ihminen');
  fig.root.visible = false;
  fig.root.scale.setScalar(1.08);
  // selkäkuvan vyö (hero.js:n oma vyö on vain etukuvassa): sama sash.js, takaa katsottuna viitan päällä
  const bSash = makeSash(back.cloak, { back: true, z: 0.02 });
  bSash.mesh.scale.set(1, 0.64, 1);
  // pizzicato = viivan värähdys pisteinä (A10): pisteet syntyvät viivan reitille pizzicaton hetkellä, irtoavat siitä ylös ja alas ja hiipuvat
  const PZN = 40;
  const pzMat = ink(C.paper, {});
  const pzDots = new THREE.InstancedMesh(new THREE.CircleGeometry(1, 10), pzMat, PZN);
  pzDots.frustumCulled = false;
  scene.add(pzDots);
  // B10 (kierros 3): EI harpun muotoa (käyttäjä: emämoka). Harppu = kuun sillan välke vedessä (WATER_FS uHarp) ja välkerenkaat.
  const brG = group(scene);
  const br = braid(brG, 160);
  const brGP = group(scene);
  const brP = braid(brGP, 160);
  brP.redMat.uniforms.uColor.value.copy(C.purple);
  brP.meshes[1].visible = false;
  lead.place(T.viulu, heroState, windV, {});   // alustaa tipAt:n tilafunktion ennen ensimmäistä ruutua
  // harpun glissandon rintama kuun sillalla: syvyys 0 (kuu) -> 1 (katsoja) glissandon keston aikana, hiipuu lopun jälkeen
  const harpFronts = (t) => {
    const act = [];
    for (const [a, b, v] of harpGl) {
      if (t < a - 0.1 || t > b + 1.8) continue;
      const f = clamp((t - a) / (b - a), 0, 1) + 0.15 * smoothstep(b, b + 1.8, t);
      act.push([f, v * smoothstep(a - 0.08, a + 0.2, t) * (1 - smoothstep(b, b + 1.6, t))]);
    }
    act.sort((p, q) => q[1] - p[1]);
    return [act[0] || [0, 0], act[1] || [0, 0]];
  };
  const harpEnv = (t) => { const [p, q] = harpFronts(t); return Math.max(p[1], q[1]); };
  // --- Päivitys -------------------------------------------------------------------------------------------
  const lastU = {};
  function update(t) {
    const w = 0.3 + 0.7 * W.wind(t);
    const nt = night(t), ev = eveningDeep(t);
    const cam = camAt(t);
    const u = SKY.u;
    u.uTime.value = t;
    // metsäaukion iltataivas on berliininsininen (väripartituuri); aurinkoruskon punainen vain kapeana vyönä horisontissa,
    // ja rusko syvenee vasta kun aurinko laskee (3.4 -> 3.12)
    const eveBlue = 1 - smoothstep(T.va2 - 4, T.va2 + 22, t);
    u.uBlueAmt.value = mix(mix(0.55, 1, nt), 1, eveBlue);
    u.uBlueH.value = mix(mix(0.42, -0.4, nt), -0.3, eveBlue);
    u.uRedAmt.value = mix(0.95, 0.6, ev) * (1 - nt) * mix(1, 0.3, eveBlue);
    u.uBlackTop.value = 0.55 * nt;
    u.uMurk.value = 0;
    u.uCloudGap.value.set(0, 0, 1, 0);
    // aurinko: kaukaisen rannan puiden takana, laskee veteen (3.12)
    const skyAt = (X, Y, Z, r) => {
      const cz = cam.pos[2], k = (cz + 480) / (cz - Z);
      return [cam.pos[0] + (X - cam.pos[0]) * k, cam.pos[1] + (Y - cam.pos[1]) * k, r * k];
    };
    const sunY = mix(6.4, 1.3, smoothstep(T.viulu, T.rk - 6, t));
    const sk = skyAt(SUN.x, sunY, SUN.z, SUN.r);
    u.uSun.value.set(sk[0], sk[1], sk[2], 1 - smoothstep(T.rk - 6, T.rk - 1, t));
    const moonK = smoothstep(T.rk - 0.5, T.rk + 5, t) * (1 - smoothstep(T.hs, T.wal, t));
    const mk = skyAt(MOON.x, MOON.y, MOON.z, MOON.r);
    u.uMoon.value.set(mk[0], mk[1], mk[2], 0);
    moonMesh.visible = moonK > 0.02;
    moonMat.uniforms.uAppear.value = moonK;
    const pur = skyPur(t);
    skyMat.uniforms.uPur.value = pur;
    lakeMat.uniforms.uPur.value = pur;
    const sAng = starsAngle(t);
    for (let i = 0; i < NSTAR; i++) {
      const p = starP[i];
      const k = smoothstep(0.35 + 0.6 * p.o, 0.5 + 0.6 * p.o, nt * smoothstep(T.rk - 2, T.rk + 10, t)) * (0.55 + 0.45 * smoothstep(0.3, 1, S.reg(t) + 0.2));
      const ang = p.a0 + sAng;
      m4.makeScale(p.r * k, p.r * k, 1);
      m4.setPosition(STAR_C.x + p.rr * Math.cos(ang), STAR_C.y + p.rr * Math.sin(ang), 0);
      stars.setMatrixAt(i, m4);
    }
    stars.instanceMatrix.needsUpdate = true;
    hillMat.uniforms.uRaster.value = 0.45 + 0.2 * S.energy.violins(t);
    // vene
    const B = boatT(t);
    boatG.position.set(B.x, B.y, B.z);
    boatG.rotation.z = B.roll;
    hull.scale.x = B.dir;
    mastG.position.x = MASTX * B.dir;
    pennant.position.x = (MASTX + 0.02) * B.dir;
    pennant.scale.x = B.dir;
    penMat.uniforms.uTime.value = t;
    penMat.uniforms.uAmp.value = 0.06 + 0.2 * w;
    const onBoat = boardK(t) > 0.02 || (t > tPush0 && t < tOut1);
    const penK = smoothstep(tBoard0, tBoard1, t) * (1 - smoothstep(T.rh, T.rh + 8, t));   // viiri muuttuu punokseksi (3.14): huipussa ei mastoviiriä punoksen rinnalla
    pennant.visible = penK > 0.02;
    penMat.uniforms.uAppear.value = penK;
    const hs = heroState(t);
    const oarA = oarAng(t);
    oarN.rotation.z = oarA; oarF.rotation.z = oarA;
    const oarOn = smoothstep(0.995, 1.0, hs.ow);
    oarN.visible = oarF.visible = oarOn > 0.02;
    oarMat.uniforms.uAppear.value = oarOn;
    // kuun väreet
    const wu = lakeMat.uniforms;
    wu.uTime.value = flowT(t);
    const harpF = harpEnv(t + S.LEAD) * (moonK > 0.3 ? 1 : 0);
    {
      const [h1, h2] = harpFronts(t + S.LEAD), g = moonK > 0.3 ? 1 : 0;
      wu.uHarp.value.set(h1[0], h1[1] * g, h2[0], h2[1] * g);
    }
    // veden välke ei pysähdy hiljaisuudessa (L_yo_kuivuu): hidas aaltoilu (~3,7 s) hs:stä paperin kuivumiseen asti
    wu.uGlint.value = clamp(0.25 + 0.25 * harpF + 0.07 * Math.sin(((t - T.hs) / 3.7) * 2 * Math.PI) * smoothstep(T.hs - 1.0, T.hs + 1.0, t) * (1 - smoothstep(T.hs + 9.0, T.hs + 11.0, t)));
    const moonRefX = cam.pos[0] + (MOON.x - cam.pos[0]) * ((cam.pos[2] - WATER_Z) / (cam.pos[2] - MOON.z));
    wu.uMoonX.value = moonRefX;
    wu.uMoonAmt.value = moonK * 0.9;
    let ri = 0;
    lake.rings.forEach((r) => r.set(0, 0, -99, 0));
    for (let i = harpOns.length - 1; i >= 0 && ri < 12; i--) {
      const o = harpOns[i];
      if (o > t || t - o > 3) continue;
      lake.rings[ri++].set(moonRefX + (hash1(i * 13) - 0.5) * 2.5, 0.5 + 0.6 * hash1(i * 17), o, 0.6 + 0.5 * hash1(i * 19));   // kuun sillan juurella
    }
    boatDash.set(B.x, B.y - 0.45, 4.8 * Math.abs(B.dir), 1.5, B.z - 0.2, t, onBoat ? 1 : 0);
    // ritari
    const lat = lanceAt(t);
    const inHand = lat.mode === 'hand';
    const width = 0.9 + 1.1 * win(tStrike - 0.2, tStrike + 0.5, tStrike + 4, tStrike + 12, t) * (t < T.lu ? 1 : 0.8 + 0.2 * 0) ;
    // soitinryhmien jatkuvat vaikutukset (roolit.json): torvet -> ritarin viitta, puupuhaltimet -> heinien huojunta, patarummut -> maan pöly, harput -> järven välke
    const hornK = W.horns(t), windK = clamp(W.winds(t) * 2.5), percK = clamp(S.fam.perc(t) * 3), harpK = clamp(harpEnv(t));
    lead.place(t, (tt) => heroState(tt), windV, { capeWind: 0.1 + 0.7 * hornK, noLance: !inHand, noBanner: !inHand, width, sashSignal: sashSig });
    const showBack = hs.onShoreBack;
    lead.P.root.visible = !showBack;
    lead.lance.visible = inHand && !showBack;
    lead.banner.visible = inHand && !showBack;
    // vapaa keihäs
    const fr = lat.mode === 'free';
    FL.visible = fban.visible = fr;
    if (fr) {
      FL.position.set(lat.x, lat.y, lat.z);
      FL.rotation.z = -lat.ang;
      fillFreeBanner(lat, t, 0.9);
    }
    // muste: yksi veto vain 3.17, keihään kärjestä
    inkTrail.set(t, (tt) => (inkWin(tt) > 0.01 && lanceAt(tt).mode === 'hand' ? lead.tipAt(tt) : null), windV, T.hu - 1, 1.0);
    // selkäkuva rannalla (3.20-3.22)
    back.root.visible = showBack;
    const fetchK = smoothstep(tTake3, tTake3 + 2.8, t);
    const rise = smoothstep(T.un + 0.1 * (T.hs - T.un), T.un + 0.45 * (T.hs - T.un), t);
    if (showBack) {
      // L_yo_kuivuu (kierros 4): pitkä sointu hidastuu leijuvaksi, ei pysähdy. Ritarin hengitys (hidas, ~5 s jakso, viitta ja pää) jatkuu paperin kuivumiseen asti
      const brK = smoothstep(T.hs - 1.0, T.hs + 1.0, t) * (1 - smoothstep(T.hs + 9.0, T.hs + 11.0, t));
      const br = Math.sin(((t - T.hs) / 5.2) * 2 * Math.PI) * brK;
      const sy = mix(0.82, 1.42, Math.max(rise, 0)) * (1 + 0.03 * br);
      back.root.position.set(SHORE_SIT, 0, 0.1);
      back.cloak.scale.set(1, sy, 1);
      back.head.position.y = 0.25 + 1.2 * sy;
      back.armL.position.y = 0.2 + 0.95 * sy;
      const hd = headTurn(t);
      back.head.rotation.z = -0.1 + 0.3 * hd + 0.15 * rise * (1 - fetchK) - 0.28 * fetchK + 0.06 * br;
      back.armL.rotation.z = -(0.3 + 1.05 * fetchK) + 0.05 * br;
      // vyön värähtely jatkuu hiljaisuudessa (hidas aaltoilu) kuivumiseen asti; viulun signaali ja sulautuminen kuten ennen
      bSash.set(t, { t0: T.hu, dur: 8 }, (tt) => clamp(sashSig(tt) + 0.8 * smoothstep(T.hs + 0.3, T.hs + 3.3, tt) * (1 - smoothstep(T.hs + 3.3, T.hs + 6, tt)) + 0.3 * smoothstep(T.hs, T.hs + 1.0, tt) * (1 - smoothstep(T.hs + 9.0, T.hs + 11.0, tt)) * (0.6 + 0.4 * Math.sin(((tt - T.hs) / 3.1) * 2 * Math.PI))));
    }
    // viiva
    const cp = cpos(t);
    // viivan historia alkaa vasta nykyisen yhtenäisen jakson alusta: aiemmat jaksot ja näkymättömät välit (vis 0) eivät piirrä haamuviivoja
    // (tipTrail piirtää ink = 0 -kohdat hiuksenohuina katkoviivoina ja pisteinä, jotka yhdistävät eri jaksojen päät: kierros 4 jämät)
    trail.set(t, (tt) => { const q = cpos(tt); return { x: q.x, y: q.y, z: q.z }; }, windV, chainStart(t), 2.0);
    lastU.cp = cp;
    // punos: viiva ja viiri kietoutuvat mastoon
    const lenK = braidLen(t);
    const loud = S.loud(t);
    const kol = win(T.ko, T.ko + 4, T.hu - 0.02, T.hu + 6, t);
    const tight = clamp(0.28 + 0.5 * smoothstep(0.2, 0.6, loud) + 0.7 * kol);
    const wid = (0.45 + 1.0 * smoothstep(0.15, 0.55, loud)) * (1 + 0.3 * smoothstep(T.no, T.ko, t));
    const top = toWorld(B, MASTX + 0.03, 5.45, 0.06);
    const pl = 6.5 * lenK + 0.01;
    brG.position.z = B.z + 0.1;
    brGP.position.z = B.z + 0.13;
    br.meshes.forEach((m) => { if (m.material !== br.purpleMat) m.visible = lenK > 0.02; });
    br.redMat.uniforms.uAppear.value = smoothstep(0.0, 0.6, lenK);
    br.set(t, top[0], top[1], pl, tight, lenK > 0.02 ? aavistus(t) + 0.5 * braidPur(t) : 0, wid);
    const bp = braidPur(t);
    brP.meshes.forEach((m, i) => { if (i === 0) m.visible = bp > 0.02 && lenK > 0.02; else if (i === 1) m.visible = false; else m.visible = false; });
    brP.redMat.uniforms.uAppear.value = bp;
    brP.set(t, top[0], top[1], pl, tight, 0, wid);
    brP.meshes[1].visible = false;
    // olennot kaislikossa (3.16): nousevat, painuvat huipulla
    const door = win(T.ko, T.ko + 5, T.hu + 1.5, T.hu + 5.5, t);
    critMats.forEach((m) => { m.uniforms.uAppear.value = door; });
    crit.forEach((c) => (c.root.visible = door > 0.02));
    duck.pose(0.5 * door, t);
    heron.pose(0.4 * door, t, 0);
    frog.pose(0.5 * door);
    // pisteet metsänreunassa (3.8): ilmestyvät puupuhaltimien mukana, hajoavat leimahduksessa
    let nDots = 0;
    dots.forEach((g, i) => {
      const o = dotOns[i * 2] ?? (T.pu + 2 + i * 3.5);
      const k = win(o - 0.05, o + 0.6, T.le - 0.2, T.le + 0.6, t);
      g.visible = k > 0.02;
      if (g.visible) nDots++;
      g.position.x += 0;
      dotMat.uniforms.uAppear.value = 1; dotRim.uniforms.uAppear.value = 1;
      g.scale.setScalar(0.4 + 0.6 * k);
    });
    // suon olennot (3.21, B9): kukin omasta mitatusta kanavastaan ja vain kun se soi; kaislikon reuna ja tähtien joukko
    const in321 = smoothstep(T.un - 0.02, T.un + 0.02, t) * (1 - smoothstep(T.hs + 4.5, T.hs + 5.0, t));
    reedsB.visible = isleB.visible = in321 > 0.01;
    const gC = [smoothstep(0.1, 0.3, fluteN(t)), smoothstep(0.1, 0.3, woodN(t)), smoothstep(0.35, 0.6, woodN(t)), smoothstep(0.1, 0.3, clarN(t))].map((g) => g * in321);
    let nDrops = 0;
    critB.forEach(({ c }, i) => {
      const g = gC[i];
      c.root.visible = g > 0.03;
      if (!c.root.visible) return;
      nDrops++;
      c.mats.forEach((m) => (m.uniforms.uAppear.value = g));
    });
    // hyttynen lentää ylärekisterissä (kuvasääntö 7) kuun yläpuolella eikä koskaan kuun päällä (kuvasääntö 22): kuun kiekko projisoidaan hyttysen tasolle
    // (z -4,0) kameran mukaan, ja hyttysen reitti pidetään kiekon yläpuolella (y) tai sen vasemmalla puolella (x)
    {
      const kz = (cam.pos[2] + 4.0) / (cam.pos[2] - MOON.z);
      const mx = cam.pos[0] + (MOON.x - cam.pos[0]) * kz, my = cam.pos[1] + (MOON.y - cam.pos[1]) * kz, mr = MOON.r * kz;
      const mxP = mx - mr - 2.4 + 2.0 * (0.5 + 0.5 * Math.sin(t * 0.33));          // reitti kuun vasemmalta puolelta kuun kohdalle asti
      const myP = my + mr + 1.0 + 0.3 * Math.sin(t * 1.05) + 0.12 * Math.sin(t * 2.3);   // aina kiekon yläreunan yläpuolella
      mosqB.root.position.set(mxP, myP, -4.0);
    }
    mosqB.pose(gC[0], 0.45 * t);   // siipien lepatus ~1 Hz (3,5 Hz olisi välkettä)
    duckB.root.position.y = 0.62 + 0.15 - 0.6 * (1 - gC[1]);
    duckB.pose(0.5 * gC[1], t);
    heronB.root.position.y = 0.62 - 1.0 * (1 - gC[2]);
    heronB.pose(0.4 * gC[2], t, 0);
    frogB.root.position.y = 0.62 + 0.8 * SCB.frog - 0.5 * (1 - gC[3]);
    frogB.pose(0.5 * gC[3]);
    // kumppani viivahahmona: veneessä keulassa, huipussa sulautuu vyöhön, rannalla vierellä ja nojaa (3.21), sulautuu vyöhön (3.22)
    const nojaa = win(T.un, T.un + 4, T.hs - 1, T.hs + 1, t);
    const aBoat = smoothstep(tBoard1 - 0.3, tBoard1 + 2.2, t) * (1 - smoothstep(T.hu + 6.2, T.hu + 8.6, t));   // haalistuu vasta, kun hän on kävellyt ritarin luo ja ojentanut käden (ihmisvariantti)
    const mergeS = smoothstep(T.hs + 0.3, T.hs + 3.3, t);
    const aShore = smoothstep(tBack - 1.0, tBack + 3.0, t) * (1 - mergeS);
    const figA = Math.max(aBoat, aShore);
    fig.root.visible = figA > 0.02;
    if (fig.root.visible) {
      if (aBoat >= aShore) {
        const m = ease(smoothstep(T.hu + 0.5, T.hu + 6.5, t));
        const wp = toWorld(B, mix(2.9, 0.8, m), 0.3, 0.25);   // keulassa kuun oikealla puolella (paperi ei paperia vasten), huipussa kävelee ritarin luo
        fig.root.position.set(wp[0], wp[1], wp[2]);
        fig.root.scale.x = 1.08 * B.dir;
        fig.root.rotation.z = B.roll;
      } else {
        fig.root.position.set(SHORE_SIT + mix(1.25, 0.15, mergeS) - 0.45 * nojaa, 0, 0.14);
        fig.root.scale.x = 1.08;
        fig.root.rotation.z = 0.1 * nojaa;
      }
      fig.mat.uniforms.uAppear.value = figA;
      // ihmisvariantti (käyttäjän poikkeus 1.11.2026): reaktiot sankariin. Huipussa hän kävelee keulasta ritarin luo
      // (root liikkuu m:n mukana) ja ojentaa käden hänen olkapäälleen ennen sulautumista; rannalla katsoo kuuta ja nojaa
      // torvikutsuilla (nojaa). Kaikki ajan funktioita.
      const walkK = aBoat >= aShore ? win(T.hu + 0.5, T.hu + 1.6, T.hu + 5.6, T.hu + 6.6, t) : 0;
      const reachK = aBoat >= aShore ? smoothstep(T.hu + 4.8, T.hu + 6.6, t) : 0;
      fig.pose(t, 'hellyys', { variant: figVariant, S, dir: dirV, wind: clamp(W.wind(t)), tilt: 0.05 * Math.sin(t * 0.37) + 0.12 * nojaa, trail: aBoat >= aShore ? 0.5 : 0.12,
        walk: walkK, reach: reachK, nojaa, gaze: aShore > aBoat ? 1 - nojaa : 0 });
    }
    // pizzicato = viivan värähdys pisteinä: pisteet viivan reitillä pizzicaton hetkellä (viiva katkeaa samasta kohdasta)
    let nPz = 0;
    for (const [o, v] of pzEv) {
      if (o > t + 0.04 || t - o > 1.8) continue;
      const a = t - o + S.LEAD;
      for (let j = 0; j < 4 && nPz < PZN; j++) {
        const tau = o + 0.2 * (j - 1.5), g = cgate(tau) * smoothstep(0.05, 0.3, dirV(tau).conf);
        if (tau > t) continue;
        if (g < 0.2) continue;
        const q = cpos(tau), wv = windV(tau), age = t - tau;
        const life = smoothstep(0, 0.08, a) * (1 - smoothstep(0.8, 1.8, a)) * (j === 1 ? 1 : 0.8);
        const cf = clamp(cam.pos[2] / 14, 0.6, 2.6);
        const r = (0.12 + 0.06 * v) * cf * life;
        // pisteet irtoavat viivasta ylös ja alas (värähdys): siirtymä kasvaa pehmeästi, merkki vuorottelee pisteittäin
        const off = (j % 2 ? 1 : -1) * (0.2 + 0.8 * smoothstep(0, 1.4, a)) * (0.4 + 0.6 * cf) * (0.6 + 0.4 * j / 3);
        m4.makeScale(r, r, 1);
        m4.setPosition(q.x + wv.x * age * 0.14 + 0.5 * off * (j < 2 ? -1 : 1), q.y + wv.y * age * 0.14 * 0.15 + off, q.z + 0.07);
        pzDots.setMatrixAt(nPz++, m4);
      }
    }
    for (let i = nPz; i < PZN; i++) { m4.makeScale(0, 0, 0); pzDots.setMatrixAt(i, m4); }
    pzDots.instanceMatrix.needsUpdate = true;
    // maan pöllähdys: pöly nousee iskusta ja hiipuu
    let puff = 0;
    // Maan pöllähdys vain patarummun iskuista ohjauksen 3.2:ssa (percOns, alla): ainoa otto, jossa patarumpu on nimetty (ohjaus 3.2,
    // roolit.json patarummut = maan pöllähdys). Kierroksella 4 poistettu jatkuva pohjataso (kuusi läiskää ritarin jaloissa ja
    // veneen alla koko ajan): S.fam.perc on suhteutettu oman 95. persentiilinsä mukaan, joten kohina ylitti kynnyksen lähes joka ruudulla.
    const mote = 0;
    DUST.forEach((d, i) => {
      const o = percOns[i % percOns.length] - S.LEAD;
      const age = t - o - 0.0;
      const on = age > 0 && age < 1.7;
      d.visible = on;
      if (!on) return;
      const k = age / 1.7, side = (i % 2 ? 1 : -1), j = Math.floor(i / percOns.length);
      const gx = xBase(o) - 0.3 + side * (0.5 + 1.6 * ease(k) * (0.5 + 0.35 * j));
      d.position.set(gx + (hash1(i * 5 + 3) - 0.5) * 0.8, 0.15 + 1.3 * ease(k) * (0.3 + 0.18 * j) + 0.25 * hash1(i * 7 + 1), 0.22);
      d.scale.set(0.28 + 0.34 * hash1(i * 7 + 2), 0.24 + 0.3 * hash1(i * 7 + 4), 1);
      d.rotation.z = side * (0.3 + 0.9 * k) + 0.6 * (hash1(i * 3 + 5) - 0.5);
      puff = Math.max(puff, 1 - k);
    });
    dustMat.uniforms.uAppear.value = 1;
    meadowMat.uniforms.uRaster.value = 0.34 + 0.2 * W.lows(t);
    // jokaisella ruudulla samat tilat: etualan heinät huojuvat tuulessa (viulut), muuten levossa
    grassG.children.forEach((g, k) => { g.rotation.z = (0.015 + 0.06 * windK) * Math.sin(t * 1.3 + k * 1.7); });
    update.last = { hornK, windK, percK, harpK, mote, puff, B, hs, moonK, door, pur, tight, lenK, cp, nDots, nDrops, rise, fetchK, ri, lat, bp, nojaa, harpF, nPz };
    return { dim: 0.12 * nt, wind: w, paper: 0 };
  }
  // kutsut 3.20: mitatut torvihuiput jälkihehkussa (ennakointi: pään kääntö)
  const calls = (() => {
    const v = [];
    for (let t = T.ja; t < T.un; t += 0.1) v.push([t, S.fam.horns(t)]);
    const peaks = [];
    for (let i = 3; i < v.length - 3; i++) if (v[i][1] > 0.25 && v[i][1] >= v[i - 1][1] && v[i][1] > v[i + 1][1] && v[i][1] > v[i - 3][1] + 0.05) peaks.push(v[i]);
    peaks.sort((a, b) => b[1] - a[1]);
    const picked = [];
    for (const p of peaks) if (picked.every((q) => Math.abs(q[0] - p[0]) > 8) && picked.length < 4) picked.push(p);
    const ts = picked.map((p) => p[0]).sort((a, b) => a - b);
    while (ts.length < 4) ts.push(T.ja + ((T.un - T.ja) * (ts.length + 1)) / 5);
    return ts.sort((a, b) => a - b);
  })();
  function headTurn(t) { return calls.reduce((m, c) => Math.max(m, win(c - 0.1, c + 1.0, c + 3.0, c + 5.5, t)), 0); }

  const probe = (t) => {
    const L = update.last || {};
    const B = L.B || boatT(t);
    const cp = L.cp || cpos(t);
    const hs = L.hs || heroState(t);
    return {
      viiva: { x: R3(cp.x), y: R3(cp.y), ele: cp.s.ele, nakyy: R3(cgate(t)) },
      ritari_kasi: { x: R3(hs.x), y: R3(hs.y), suunta: R3(hs.facing), kello: R3(hs.pose.aN), keihas: L.lat ? L.lat.mode : 'hand' },
      vene: { x: R3(B.x), y: R3(B.y), dir: R3(B.dir) }, soutu: R3(rowS(t)),
      punos: { pituus: R3(6.5 * (L.lenK ?? 0)), kireys: R3(L.tight ?? 0), purppura: R3(L.bp ?? 0), aavistus: R3(aavistus(t)) },
      purppura: R3(skyPur(t)), kuu: R3(L.moonK ?? 0), vareet: (L.ri ?? 0) + R3(4 * (L.harpK ?? 0)), kaislikko: R3(L.door ?? 0),
      pisteet_n: L.nDots ?? 0, tahtipisteet_n: L.nDrops ?? 0, harppusilta: R3(L.harpF ?? 0), paperi_pesu: R3(smoothstep(T.hs + 3.5, T.hs + 9.5, t)), lepaava: R3(L.nojaa ?? 0),
      kutsu: R3(headTurn(t)), nousee: R3(L.rise ?? 0), valo: R3(night(t)), aurinko_y: R3(1 - smoothstep(T.rk - 6, T.rk - 1, t)),
      torvi: R3(Math.max(hs.act ?? 0, headTurn(t), 0.1 + 0.7 * (L.hornK ?? 0))), maa: R3(0.34 + 0.2 * W.lows(t)), pollahdys: R3(Math.max(L.puff ?? 0, L.mote ?? 0)), patarumpu: R3(L.percK ?? 0), olennot: R3(Math.max(L.door ?? 0, L.nDots ? 0.6 : 0, L.nDrops ? 0.6 : 0, 0.12 + 0.48 * (L.windK ?? 0))),
      muste_ikkuna: R3(inkWin(t)), tuuli: R3(W.wind(t)),
      tahdet: { kulma: R3(starsAngle(t)), nopeus: R3((starsAngle(t + 0.05) - starsAngle(t - 0.05)) / 0.1) },
      mitatut: { dip: R3(pzDip(t)), dip_t1: R3(pzDip(t - 0.3)), pisteita: L.nPz ?? 0, pizzicato_n: pzEv.length, pizzicato: R3(pzN(t)), harppu_n: harpGl.length, harppu_silta: R3(harpEnv(t)), huilu: R3(fluteN(t)), klarinetti: R3(clarN(t)), puupuhaltimet: R3(woodN(t)), viulu: R3(violinN(t)) },
    };
  };
  function grip() {
    const hs = update.last && update.last.hs;
    if (!hs || hs.ow < 0.995) return [];
    const v = new THREE.Vector3();
    scene.updateMatrixWorld(true);
    const hand = (near) => { (near ? lead.P.handN : lead.P.handF).getWorldPosition(v); return [v.x, v.y]; };
    const end = (y) => { v.set(0, y, 0).applyMatrix4(oarN.matrixWorld); return [v.x, v.y]; };
    const a = end(OAR.inboard), b = end(-3.2);
    const segD = (q) => { const ex = b[0] - a[0], ey = b[1] - a[1]; const uu = clamp(((q[0] - a[0]) * ex + (q[1] - a[1]) * ey) / (ex * ex + ey * ey)); return Math.hypot(q[0] - a[0] - uu * ex, q[1] - a[1] - uu * ey); };
    return [{ tyyppi: 'airo', paino: R3(hs.ow), lahempi: R3(segD(hand(true))), kauempi_varsi: R3(segD(hand(false))), kauempi: R3(segD(hand(false))) }];
  }
  return { scene, pzDots, update, shots: SHOTS, camAt, probe, grip, heroState, cpos, boatT, T, M: [M1, M2, M3, M4], calls };
}
