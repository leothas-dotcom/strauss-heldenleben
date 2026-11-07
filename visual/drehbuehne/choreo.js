// Koreografia: orkesterin soitinryhmät ovat tanssijaryhmiä. Jokainen tanssija on puhdas
// ajan funktio: paikka (muodostelma, sisääntulo siivistä tai luukusta) ja asento (fraasit
// tahtiajassa, energia soitinryhmän aktiivisuudesta). Sankarin viiri lasketaan keihään kärjen
// aikaisemmista paikoista (jälkiliike), joten ruutujen välillä ei ole tilaa.

import * as THREE from 'three';
import { pose, mixPose, mirror, applyPose, createDancer, troupeMats, part } from './rig.js';
import { C, inkMat, hullMat, faceted } from './ink.js';
import { clamp, smoothstep, hash1, mix } from '../util.js';
import { FLOOR_Y, TIER_H } from './stage.js';

const TAU = Math.PI * 2;
const LEAD = 1 / 30; // kuva yhden ruudun ennen ääntä
const mod = (a, n) => ((a % n) + n) % n;
const E = {
  s: (x) => x * x * (3 - 2 * x),
  snap: (x) => 1 - (1 - x) ** 3,
  hold: (x) => smoothstep(0.0, 0.55, x),
};

// --- Asentosanasto -------------------------------------------------------------------------
const L = {
  stand: pose(),
  first: pose({ lFwd: 0.45, rFwd: 0.45, lRaise: 0.3, rRaise: 0.3, lElb: 0.9, rElb: 0.9 }),
  second: pose({ lRaise: 1.45, rRaise: 1.45, lElb: 0.2, rElb: 0.2, lFwd: 0.15, rFwd: 0.15 }),
  fifth: pose({ lRaise: 2.75, rRaise: 2.75, lElb: 0.55, rElb: 0.55, lFwd: 0.25, rFwd: 0.25, toe: 1, headF: -0.15 }),
  plie: pose({ lRaise: 1.35, rRaise: 1.35, lElb: 0.3, rElb: 0.3, lLegS: 0.38, rLegS: 0.38, lLegF: 0.45, rLegF: 0.45, lKnee: 0.95, rKnee: 0.95 }),
  arabesque: pose({ toe: 1, lLegF: -1.25, spineF: 0.3, rFwd: 1.5, rRaise: 0.15, rElb: 0.1, lRaise: 1.3, lFwd: -0.4, lElb: 0.1, headF: -0.2 }),
  attitude: pose({ toe: 1, lLegF: -0.9, lKnee: 1.0, lLegS: 0.3, rRaise: 2.7, rElb: 0.5, lRaise: 1.4, lElb: 0.3, spineS: -0.1 }),
  lunge: pose({ rLegF: 1.0, rKnee: 1.2, lLegF: -0.55, spineF: 0.12, rFwd: 1.55, rElb: 0.05, lRaise: 0.9, lFwd: -0.7, lElb: 0.2, headF: -0.1 }),
  jete: pose({ rLegF: 1.35, lLegF: -1.15, lKnee: 0.15, rFwd: 1.5, rRaise: 0.4, lRaise: 1.7, lFwd: -0.35, spineF: -0.05, headF: -0.2 }),
  retire: pose({ toe: 1, lLegF: 0.95, lLegS: 0.85, lKnee: 2.1, lFwd: 0.5, rFwd: 0.5, lRaise: 0.35, rRaise: 0.35, lElb: 1.1, rElb: 1.1 }),
  kneel: pose({ lLegF: 0.05, lKnee: 1.65, rLegF: 1.45, rKnee: 1.55, spineF: 0.15, lRaise: 0.3, rRaise: 0.3, lFwd: 0.2, rFwd: 0.2, headF: 0.25 }),
  crouch: pose({ lLegF: 1.35, rLegF: 1.35, lKnee: 2.4, rKnee: 2.4, lLegS: 0.2, rLegS: 0.2, spineF: 0.85, headF: 0.5, lFwd: 0.8, rFwd: 0.8, lElb: 1.9, rElb: 1.9, lRaise: 0.25, rRaise: 0.25 }),
  reachUp: pose({ toe: 1, lRaise: 2.95, rRaise: 2.95, lElb: 0.1, rElb: 0.1, headF: -0.45, spineF: -0.15 }),
  bow: pose({ spineF: 0.95, headF: 0.35, lFwd: 0.4, rFwd: 0.4, lLegF: -0.3, lKnee: 0.4 }),
  salute: pose({ rRaise: 2.6, rFwd: 0.4, rElb: 0.2, lRaise: 0.35, lFwd: 0.6, lElb: 1.4, spineF: -0.06, headF: -0.2 }),
  marchL: pose({ lLegF: 1.0, lKnee: 1.25, rFwd: 0.8, lFwd: -0.45, rElb: 0.5, lElb: 0.2 }),
  stampL: pose({ lLegF: 1.1, lKnee: 1.7, lLegS: 0.2, lRaise: 0.95, rRaise: 0.95, lElb: 1.6, rElb: 1.6, spineF: 0.15, rKnee: 0.4, rLegF: 0.2 }),
  heavy: pose({ lLegS: 0.38, rLegS: 0.38, lLegF: 0.3, rLegF: 0.3, lKnee: 0.65, rKnee: 0.65, lRaise: 0.75, rRaise: 0.75, lElb: 1.3, rElb: 1.3, spineF: 0.12 }),
  heavySway: pose({ lLegS: 0.4, rLegS: 0.3, lLegF: 0.3, rLegF: 0.2, lKnee: 0.7, rKnee: 0.3, lRaise: 1.6, rRaise: 0.5, lElb: 0.5, rElb: 1.0, spineS: 0.3 }),
  fanfare: pose({ rFwd: 2.1, rRaise: 0.55, lFwd: 1.9, lRaise: 0.45, lElb: 0.15, rElb: 0.15, headF: -0.35, spineF: -0.12 }),
  fanfareHi: pose({ rFwd: 2.6, rRaise: 0.3, lFwd: 2.5, lRaise: 0.3, lElb: 0.1, rElb: 0.1, headF: -0.5, spineF: -0.2, toe: 1 }),
  swayL: pose({ spineS: 0.28, lRaise: 0.9, rRaise: 2.3, lElb: 0.4, rElb: 0.45, lLegS: 0.3, toe: 0.5 }),
  hunch: pose({ spineF: 0.55, headF: -0.4, lRaise: 0.75, rRaise: 0.75, lElb: 1.7, rElb: 1.7, lFwd: 0.4, rFwd: 0.4, lKnee: 0.5, rKnee: 0.5, lLegF: 0.35, rLegF: 0.35 }),
  jab: pose({ rFwd: 1.6, rElb: 0.0, rRaise: 0.1, spineF: 0.5, lLegF: -0.55, rLegF: 0.45, rKnee: 0.5, headF: -0.3, lRaise: 0.6, lElb: 1.2 }),
  sit: pose({ lLegF: 1.45, rLegF: 1.3, lKnee: 1.9, rKnee: 2.2, lLegS: 0.25, rLegS: 0.15, spineF: 0.45, headF: 0.55, lFwd: 0.9, rFwd: 0.7, lElb: 1.5, rElb: 1.3, lRaise: 0.15, rRaise: 0.2 }),
  slam: pose({ lLegS: 0.45, rLegS: 0.45, lLegF: 0.6, rLegF: 0.6, lKnee: 1.3, rKnee: 1.3, spineF: 0.6, lRaise: 0.5, rRaise: 0.5, lFwd: 1.2, rFwd: 1.2, lElb: 0.2, rElb: 0.2 }),
};
const K = (p, o = {}) => ({ p, ...o });
const M_ = mirror;

const PHR = {
  suora: [[K(L.salute), K(L.marchL), K(L.salute), K(M_(L.marchL))]],
  kiehkurat: [[K(L.fifth), K(L.retire, { spin: 1 }), K(L.second), K(L.arabesque), K(L.fifth), K(M_(L.retire), { spin: -1 }), K(L.swayL), K(M_(L.swayL))]],
  liekit: [[K(L.lunge), K(L.jete, { jump: 0.55 }), K(M_(L.lunge)), K(M_(L.jete), { jump: 0.55 }), K(L.reachUp), K(L.attitude), K(L.lunge), K(L.fifth)]],
  portaat: [[K(L.lunge), K(L.salute), K(M_(L.lunge)), K(L.reachUp)]],
  perus: [[K(L.second), K(L.swayL), K(L.fifth), K(M_(L.swayL))]],
  breath: [[K(L.second), K(L.kneel), K(L.kneel), K(L.swayL)]],
  night: [[K(L.arabesque), K(L.second), K(L.attitude), K(L.bow), K(M_(L.arabesque)), K(L.swayL), K(L.kneel), K(L.second)]],
  vln: [
    [K(L.fifth), K(L.arabesque), K(L.second), K(M_(L.arabesque)), K(L.swayL), K(M_(L.swayL)), K(L.retire, { spin: 1 }), K(L.fifth)],
    [K(L.plie), K(L.fifth), K(L.attitude), K(M_(L.attitude)), K(L.first), K(L.reachUp), K(M_(L.retire), { spin: -1 }), K(L.second)],
  ],
  lows: [
    [K(L.heavy), K(L.stampL), K(L.heavy), K(M_(L.stampL))],
    [K(L.heavy), K(L.heavySway), K(L.heavy), K(M_(L.heavySway))],
  ],
  brassMarch: [[K(L.marchL), K(L.stand), K(M_(L.marchL)), K(L.stand)]],
  brassFan: [[K(L.fanfare), K(L.fanfareHi), K(L.stand), K(L.fanfare)], [K(L.fanfareHi), K(L.fanfare), K(L.salute), K(L.fanfareHi)]],
};

// Fraasi tahtiajassa: avainasento joka bpk:nnella iskulla, kahden tahdin lohkot vaihtelevat.
function phrasePose(list, seed, beat, bpk, ease, mirrorOdd = true) {
  const kb = beat / bpk;
  const k = Math.floor(kb);
  const f = kb - k;
  const perBlock = 8 / bpk;
  const keyAt = (kk) => {
    const blk = Math.floor(kk / perBlock);
    const ph = list[Math.floor(hash1(seed * 977 + blk) * list.length)];
    const key = ph[mod(kk, ph.length)];
    const mir = mirrorOdd && hash1(seed * 131 + blk * 7) > 0.5;
    return mir ? { ...key, p: mirror(key.p), spin: key.spin ? -key.spin : 0 } : key;
  };
  const A = keyAt(k);
  const B = keyAt(k + 1);
  const e = ease(f);
  const P = mixPose(A.p, B.p, e);
  if (B.spin) P.turn += B.spin * TAU * e;
  if (B.jump) P.y += B.jump * Math.sin(Math.PI * f);
  return P;
}

function walkPose(P, ph, amt) {
  const s = Math.sin(ph);
  const W = {
    ...P,
    lLegF: 0.6 * s, rLegF: -0.6 * s, lKnee: 0.25 + 0.6 * Math.max(0, -Math.sin(ph - 0.6)), rKnee: 0.25 + 0.6 * Math.max(0, Math.sin(ph - 0.6)),
    lFwd: -0.45 * s, rFwd: 0.45 * s, lRaise: 0.2, rRaise: 0.2, lElb: 0.5, rElb: 0.5, spineF: 0.1, toe: 0, turn: 0,
  };
  return mixPose(P, W, clamp(amt));
}

// --- Muodostelmat: (i, n, t, b) -> {x, z, face}; kulma 0 = eteen (+z), PI = taakse -----------
const polar = (r, a) => ({ x: r * Math.sin(a), z: r * Math.cos(a) });
const F = {
  ring: (r, speed, a0 = 0, faceMode = 'tangent') => (i, n, t, b) => {
    const a = a0 + (i / n) * TAU + speed * (t - b.a);
    const p = polar(r, a);
    const face = faceMode === 'center' ? a + Math.PI : faceMode === 'front' ? 0 : a + (speed >= 0 ? Math.PI / 2 : -Math.PI / 2);
    return { ...p, face };
  },
  arcBack: (r, spread = 1.9) => (i, n) => {
    const a = Math.PI + (n > 1 ? (i / (n - 1) - 0.5) * 2 * spread : 0);
    return { ...polar(r, a), face: 0 };
  },
  frontArc: (r) => (i, n) => {
    const side = i % 2 ? 1 : -1;
    const k = Math.floor(i / 2);
    const a = side * (0.42 + 0.36 * k);
    return { ...polar(r, a), face: a * 0.3 };
  },
  line: (z, x0, x1, face = 0) => (i, n) => ({ x: n > 1 ? x0 + ((x1 - x0) * i) / (n - 1) : (x0 + x1) / 2, z, face }),
  behind: (r, spread = 1.0) => (i, n, t, b, hero) => {
    const a = Math.PI + (n > 1 ? (i / (n - 1) - 0.5) * 2 * spread : 0);
    const p = polar(r, a);
    return { x: hero.x + p.x, z: hero.z + p.z, face: hero.face };
  },
};

const FORM = {
  violins: {
    default: F.arcBack(7.4, 1.5), wake: F.ring(6.2, 0.13), fancy: F.ring(6.0, 0.17), fire: F.ring(6.8, 0.28), answer: F.ring(7.2, 0.06),
    uphill: F.ring(6.6, 0.2), hammer: F.ring(6.6, 0.0), summit: F.ring(3.95, 0.05, 0.4, 'front'), night: F.ring(6.4, 0.11, 0.3), snap: F.arcBack(7.4, 1.5),
  },
  lows: {
    default: F.frontArc(9.6), fire: F.ring(9.2, -0.16, 0.3), uphill: F.ring(9.2, -0.12, 0.3), hammer: F.ring(9.2, 0), summit: F.ring(5.5, -0.04, 0.2, 'center'),
  },
  brass: {
    default: F.line(-10.2, -6.5, 6.5), fire: F.ring(11.4, 0.12, 0.5), uphill: F.ring(11.4, 0.1, 0.5), hammer: F.ring(11.4, 0),
    summit: F.ring(2.95, 0.04, 0.9, 'front'), snap: F.line(-5.0, -5.5, 5.5),
  },
  horns: { default: F.behind(2.7, 0.9), summit: F.ring(2.0, 0.04, 1.6, 'front') },
};

export function createCompany(scene, S, plan, stage) {
  const blockAt = plan.blockAt;
  const prevBlock = (b) => (b.j > 0 ? plan.blocks[b.j - 1] : b);
  // Jähmettymät: neljä äkillistä hiljenemistä ja dominanttiseptimin tablo -> koreografian aika pysähtyy.
  const holds = [...S.freezes.map(([d, r]) => [d - LEAD, r - LEAD]), [S.T_DOM7 + 0.05, S.T_WID - 0.2]];
  const choreoT = (t) => {
    for (const [a, b] of holds) if (t >= a && t < b) return a;
    return t;
  };
  const burst = (t) => {
    let v = 0;
    for (const [, r] of S.freezes) if (t >= r && t < r + 0.6) v = Math.max(v, 1 - (t - r) / 0.6);
    return v;
  };

  // --- Torni: kerrokset nousevat tahtiviivoilla pyrkimyksen mukana ----------------------------
  const levels = [[57, 1], [66, 2], [89, 3], [111, 4]].map(([bar, lv]) => ({ t: S.barStart(bar) - LEAD, lv }));
  function towerLevel(t) {
    if (t >= S.T_WID - 1) return 0;
    let lv = 0;
    for (const L2 of levels) {
      if (t < L2.t) break;
      const u = clamp((t - L2.t) / 0.55);
      const over = 1 + 0.12 * Math.sin(u * Math.PI) * (1 - u);
      lv = (L2.lv - 1) + E.snap(u) * over;
    }
    return lv;
  }
  const tierHeights = (t) => [0, 1, 2, 3].map((i) => TIER_H * clamp(towerLevel(t) - i, 0, 1.15));

  // --- Sankari -----------------------------------------------------------------------------------
  const heroM = troupeMats('hero');
  const hero = createDancer('hero', heroM);
  scene.add(hero.root);
  const staff = new THREE.Group();
  scene.add(staff);
  const staffMat = inkMat(C.black, C.blue);
  const STAFF = 3.6;
  part(staff, faceted(new THREE.CylinderGeometry(0.035, 0.035, STAFF, 6)), staffMat, hullMat(C.paper, 1.4), { p: [0, STAFF / 2 - 1.0, 0] });
  part(staff, faceted(new THREE.ConeGeometry(0.1, 0.42, 6)), inkMat(C.paper, C.blue), hullMat(C.black, 1.8), { p: [0, STAFF - 1.0 + 0.21, 0] });
  const NB = 26;
  const bannerGeo = new THREE.BufferGeometry();
  bannerGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NB * 2 * 3), 3));
  bannerGeo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(NB * 2 * 3), 3));
  {
    const idx = [];
    for (let k = 0; k < NB - 1; k++) {
      const a = 2 * k, b = 2 * k + 1, c = 2 * k + 2, d = 2 * k + 3;
      idx.push(a, b, c, b, d, c);
    }
    bannerGeo.setIndex(idx);
  }
  const bannerMat = inkMat(C.red, C.black, { side: THREE.DoubleSide, ambient: 0.55 });
  const banner = new THREE.Mesh(bannerGeo, bannerMat);
  banner.frustumCulled = false;
  scene.add(banner);

  const T_RISE = S.T0;
  function heroPos(t) {
    const b = blockAt(t);
    let x = 0, z = 0, face = 0;
    const fire = plan.byName.fire;
    if (t >= fire.a - 2 && t < fire.b + 3) {
      const bp = S.barPos(t) - S.barPos(fire.a);
      const w = (bp * Math.PI) / 4;
      const amt = smoothstep(fire.a - 0.5, fire.a + 1.5, t) * (1 - smoothstep(fire.b - 0.5, fire.b + 2.5, t));
      x = 3.4 * Math.sin(w) * amt;
      z = (1.8 * Math.sin(2 * w) + 0.6) * amt;
      const dx = Math.cos(w) * 3.4, dz = 3.6 * Math.cos(2 * w);
      face = Math.atan2(dx, dz) * amt * 0.8;
    }
    const nt = plan.byName.night;
    if (t >= nt.a - 1 && t < nt.b + 3) {
      const w = ((S.barPos(t) - S.barPos(nt.a)) * Math.PI) / 7;
      const amt = smoothstep(nt.a, nt.a + 4, t) * (1 - smoothstep(nt.b - 3, nt.b + 1, t));
      x += 2.0 * Math.sin(w) * amt;
      z += (1.2 * Math.sin(2 * w)) * amt;
    }
    if (t >= S.T_WID) {
      face = Math.PI;
      const ans = plan.byName.answer, ret = plan.byName.return, snap = plan.byName.snap;
      face = mix(Math.PI, 0.25, smoothstep(ans.a + 2, ans.a + 7, t));
      face += 0.35 * Math.sin((t - ans.a) * 0.11) * smoothstep(plan.byName.night.a, plan.byName.night.a + 6, t);
      face = mix(face, -0.6 + 1.2 * Math.sin((t - ret.a) * 0.19), smoothstep(ret.a, ret.a + 4, t) * (1 - smoothstep(snap.a, snap.a + 2, t)));
      face = mix(face, 0, smoothstep(snap.a, snap.a + 1.5, t));
    }
    void b;
    return { x, z, face };
  }

  function heroPose(t) {
    const b = blockAt(t);
    const beat = S.beatPos(t + LEAD);
    const seg = S.segAt(t);
    const trait = seg ? seg.trait : 'perus';
    let P;
    if (t < T_RISE + 16.5) {
      // Nousu luukusta: kyyry -> pysty, keihäs nousee teeman mukana (3½ oktaavia 9 tahdissa).
      const u = smoothstep(T_RISE - 0.5, T_RISE + 15.5, t);
      P = mixPose(L.crouch, L.salute, E.s(u));
      P.spineF += 0.04 * Math.sin(beat * Math.PI * 0.5);
    } else if (b.name === 'march' || b.name === 'upright') P = phrasePose(PHR.suora, 1, beat, 2, E.snap, false);
    else if (b.name === 'fancy') P = phrasePose(PHR.kiehkurat, 2, beat, 2, E.s);
    else if (b.name === 'fire') P = phrasePose(PHR.liekit, 3, beat, 2, E.s);
    else if (b.name === 'breath') P = phrasePose(PHR.breath, 4, beat, 4, E.s);
    else if (b.name === 'strive') P = phrasePose(PHR.portaat, 5, beat, 4, E.s);
    else if (b.name === 'uphill') P = phrasePose(trait === 'portaat' ? PHR.portaat : PHR.liekit.map((ph) => ph.map((k) => ({ ...k, jump: k.jump ? 0.3 : 0 }))), 6, beat, trait === 'portaat' ? 4 : 2, E.s);
    else if (b.name === 'hammer') P = phrasePose(PHR.suora, 7, beat, 2, E.snap, false);
    else if (b.name === 'summit') {
      const u = smoothstep(S.T_DOM7 - 6, S.T_DOM7 - 0.3, t);
      P = mixPose(phrasePose(PHR.portaat, 8, beat, 4, E.s), mixPose(L.reachUp, L.salute, 0.4), u);
    } else if (b.name === 'pause') P = mixPose(L.reachUp, L.salute, 0.4);
    else if (b.name === 'critics') P = mixPose(L.sit, L.kneel, 0.15 + 0.1 * Math.sin(t * 0.7));
    else if (b.name === 'answer') {
      const u = smoothstep(b.a, b.a + 7, t);
      P = mixPose(L.sit, phrasePose([[K(L.second), K(L.bow), K(L.swayL), K(L.second)]], 9, beat, 4, E.s), u);
    } else if (b.name === 'night') P = phrasePose(PHR.night, 10, beat, 4, E.s);
    else if (b.name === 'return') P = mixPose(phrasePose(PHR.night, 11, beat, 4, E.s), L.hunch, 0.25 + 0.35 * smoothstep(b.a, b.b, t));
    else if (b.name === 'snap') P = mixPose(L.lunge, L.salute, smoothstep(b.a, b.a + 3, t));
    else P = phrasePose(PHR[trait] ?? PHR.perus, 12, beat, 2, E.s);
    if (b.name === 'prologue') P = { ...L.crouch };
    // Keihäskäsi seuraa johtavaa melodiaa: korkeus = sävelkorkeus.
    const mel = clamp((S.melody(t + LEAD) - 45) / 42);
    const follow = t < S.T_WID ? 0.55 : b.name === 'snap' ? 0.5 : 0.15;
    if (b.name !== 'pause' && !(b.name === 'summit' && t > S.T_DOM7 - 1)) P.rRaise = mix(P.rRaise, 0.5 + 2.45 * mel, follow * (t < T_RISE + 16.5 ? 0.6 : 1));
    // Energia: hiljaisissa kohdissa liike pienenee kohti lepoasentoa.
    const e = S.energy.hero(t);
    const amp = t < S.T_WID ? 0.55 + 0.6 * e : 0.75;
    return mixPose(mixPose(L.stand, L.second, 0.2), P, clamp(amp));
  }

  // Sankarin koko tila (paikka, asento) annettuna aikana: koreografian aika jähmettyy.
  function heroState(t0) {
    const t = choreoT(t0);
    const pos = heroPos(t);
    const P = heroPose(t);
    let lift = 0;
    if (t0 < T_RISE + 4.5) lift = -2.9 * (1 - E.s(smoothstep(T_RISE - 0.4, T_RISE + 4.5, t0)));
    if (t0 < S.T0 - 0.4) lift = -3.2;
    return { pos, P, lift };
  }

  const tmpV = new THREE.Vector3();
  const tmpS = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  function placeHero(st, groundY) {
    hero.root.position.set(st.pos.x, groundY + st.lift + st.P.y * hero.scale, st.pos.z);
    hero.root.rotation.y = st.pos.face;
    applyPose(hero, { ...st.P, y: 0 });
    hero.root.updateMatrixWorld(true);
    hero.rHand.getWorldPosition(tmpV);
    hero.rSh.getWorldPosition(tmpS);
    const dir = tmpV.clone().sub(tmpS).normalize().multiplyScalar(0.75).add(up).normalize();
    const tip = tmpV.clone().addScaledVector(dir, STAFF - 1.0 + 0.1);
    return { grip: tmpV.clone(), dir, tip };
  }
  const heroGround = (t) => {
    const st = heroPos(choreoT(t));
    const h = tierHeights(choreoT(t)).reduce((s, v) => s + v, 0);
    return Math.hypot(st.x, st.z) < 1.45 ? h : stage.groundAt(st.x, st.z);
  };

  // --- Ryhmät ------------------------------------------------------------------------------------
  const troupes = {};
  function makeTroupe(name, kind, n) {
    const M = troupeMats(kind);
    const ds = Array.from({ length: n }, (_, i) => {
      const r = createDancer(kind, M);
      scene.add(r.root);
      return { r, i };
    });
    troupes[name] = { name, kind, M, ds, n };
    return troupes[name];
  }
  makeTroupe('horns', 'horns', 4);
  makeTroupe('violins', 'violins', 8);
  makeTroupe('lows', 'lows', 6);
  makeTroupe('brass', 'brass', 6);

  const formAt = (name, b) => FORM[name][b.name] ?? FORM[name].default;
  function formPos(name, i, n, t, hero0) {
    const b = blockAt(t);
    const cur = formAt(name, b)(i, n, t, b, hero0);
    const pb = prevBlock(b);
    const prev = formAt(name, pb);
    if (prev === formAt(name, b)) return cur;
    const u = E.s(clamp((t - b.a) / 2.2));
    if (u >= 1) return cur;
    const p = prev(i, n, t, pb, hero0);
    let df = cur.face - p.face;
    df = mod(df + Math.PI, TAU) - Math.PI;
    return { x: mix(p.x, cur.x, u), z: mix(p.z, cur.z, u), face: p.face + df * u };
  }
  // Sisääntulo: siivistä (viulut, vasket), takaa (käyrätorvet), luukusta (bassot).
  function entrance(name, i, n, f) {
    if (name === 'violins') return { x: (f.x < 0 ? -1 : 1) * 19, z: f.z * 0.6, face: f.x < 0 ? Math.PI / 2 : -Math.PI / 2 };
    if (name === 'brass') return { x: -19 - i * 1.4, z: f.z, face: Math.PI / 2 };
    if (name === 'horns') return { x: f.x * 0.4, z: -17, face: 0 };
    return { ...f, trap: true };
  }
  const presOf = {
    horns: (t) => S.pres.horns.at(t),
    violins: (t) => S.pres.violins.at(t),
    lows: (t) => S.pres.lows.at(t),
    brass: (t) => S.pres.brass.at(t),
  };
  // Huipulla ja lopussa koko seurue on lavalla (tehollinen tutti).
  function presence(name, t) {
    let p = presOf[name](t);
    const sm = plan.byName.summit;
    if (t > sm.a + 2 && t < S.T_WID) p = Math.max(p, smoothstep(sm.a + 2, sm.a + 6, t));
    if (name !== 'lows' && t >= plan.byName.critics.a && t < plan.byName.snap.a - 1 && !(name === 'violins')) p = Math.min(p, 0);
    if (t >= S.T_WID - 0.2 && t < S.T_WID + 0.5) p = 0;
    if (name === 'lows' && t >= plan.byName.critics.a - 0.5 && t < plan.byName.answer.a + 3) p = 0;
    return p;
  }
  function memberState(tr, d, t0) {
    const t = choreoT(t0);
    const n = tr.n;
    const h0 = heroPos(t);
    const pRaw = presence(tr.name, t);
    const stagger = tr.name === 'brass' || tr.name === 'horns' ? 0.07 * d.i : 0.04 * d.i;
    const p = clamp((pRaw - stagger) / (1 - stagger * 0.999 - 0.0001));
    const f = formPos(tr.name, d.i, n, t, h0);
    const ent = entrance(tr.name, d.i, n, f);
    const ep = E.s(p);
    let x = f.x, z = f.z, face = f.face, sink = 0;
    if (ent.trap) sink = (1 - ep) * 2.6;
    else { x = mix(ent.x, f.x, ep); z = mix(ent.z, f.z, ep); }
    return { x, z, face, sink, p, ent, f };
  }

  function troupePose(tr, d, t0, st) {
    const t = choreoT(t0);
    const b = blockAt(t);
    const e = S.energy[tr.name](t);
    const canon = tr.name === 'violins' && S.tutti(t) < 0.5 ? 0.25 * (d.i % 4) : 0;
    const beat = S.beatPos(t + LEAD) - canon;
    let P;
    if (tr.name === 'violins') P = phrasePose(PHR.vln, 20 + (d.i % 2), beat, 2, E.s);
    else if (tr.name === 'lows') P = phrasePose(PHR.lows, 30, beat, 2, E.snap, true);
    else if (tr.name === 'brass') {
      P = b.name === 'march' || b.name === 'upright' ? phrasePose(PHR.brassMarch, 40, beat, 1, E.snap, false) : phrasePose(PHR.brassFan, 41, beat, 2, E.snap, false);
    } else {
      // käyrätorvet toistavat sankarin liikkeen puoli iskua myöhemmin
      const dt = 0.5 * (60 / 120);
      P = heroPose(t - dt);
      if (d.i % 2) P = mirror(P);
      P.rRaise = Math.min(P.rRaise, 2.6);
    }
    if (b.name === 'summit' || b.name === 'pause') P = mixPose(P, d.i % 2 ? L.fanfareHi : L.reachUp, smoothstep(S.T_DOM7 - 5, S.T_DOM7 - 0.4, t));
    const amp = clamp(0.25 + 0.95 * e + 0.6 * burst(t0));
    let Q = mixPose(mixPose(L.stand, L.first, 0.3), P, amp);
    // Liike muodostelmasta toiseen: kävely tai juoksu nopeuden mukaan.
    const s2 = memberState(tr, d, t0 - 0.12);
    const v = Math.hypot(st.x - s2.x, st.z - s2.z) / 0.12;
    const run = clamp((v - 0.4) / 3.0);
    if (run > 0) {
      Q = walkPose(Q, t * (9 + 2.5 * run), run);
      Q.spineF += 0.2 * run;
    }
    return { P: Q, run, vx: st.x - s2.x, vz: st.z - s2.z };
  }

  // --- Vastustajat (näytös II) --------------------------------------------------------------------
  const ORDER = ['neula', 'rykelma', 'roiske', 'portaat', 'dehring', 'vapisevat', 'karikatyyri', 'fagotit', 'pasuunat'];
  const COUNT = { dehring: 2, fagotit: 2, pasuunat: 3 };
  const BASE_A = { neula: 0.55, rykelma: -0.75, roiske: 1.35, portaat: -1.45, dehring: 2.2, vapisevat: -2.15, karikatyyri: 0.08, fagotit: -2.75, pasuunat: 2.75 };
  const critics = [];
  const ph = S.phrases;
  for (const type of ORDER) {
    const mine = ph.filter((p) => p.type === type);
    if (!mine.length) continue;
    const M = troupeMats(type === 'karikatyyri' ? 'karikatyyri' : 'critic');
    const ons = mine.flatMap((p) => p.ons.map((o, j) => ({ t: o, j, p })));
    for (let k = 0; k < (COUNT[type] ?? 1); k++) {
      const r = createDancer(type, M);
      scene.add(r.root);
      let box = null;
      if (type === 'dehring' && k === 1) box = part(r.root, faceted(new THREE.BoxGeometry(0.9, 0.55, 0.9)), M.accent, M.hull, { p: [0, 0.275, 0] });
      const steps = [];
      if (type === 'portaat') {
        for (let s = 0; s < 8; s++) {
          const st = part(scene, faceted(new THREE.BoxGeometry(0.7, 0.12, 0.5)), M.body, M.hull);
          st.visible = false;
          steps.push(st);
        }
      }
      critics.push({ type, k, r, M, mine, ons, spawn: mine[0].t0, box, steps, a0: BASE_A[type] + (k - ((COUNT[type] ?? 1) - 1) / 2) * 0.22 });
    }
  }
  // Englannintorven ennakko näytöksessä I: musta hahmo kurkistaa siivistä (puupuhaltimet 1:38.9).
  const scoutM = troupeMats('critic');
  const scout = createDancer('neula', scoutM);
  scene.add(scout.root);
  const scoutP = (() => {
    const arr = [];
    for (let i = 0; i < S.n; i++) {
      const t = i / 30;
      arr.push(t < S.T_DOM7 - 10 && t > S.T0 + 30 ? S.fam.winds(t) : 0);
    }
    return arr;
  })();
  const scoutIv = [];
  {
    let on = -1;
    for (let i = 0; i < scoutP.length; i++) {
      if (scoutP[i] > 0.3 && on < 0) on = i;
      if (scoutP[i] < 0.08 && on >= 0) { if (i - on > 20) scoutIv.push([on / 30, i / 30]); on = -1; }
    }
  }
  const scoutAt = (t) => scoutIv.reduce((m, [a, b]) => Math.max(m, Math.min(smoothstep(a - 0.6, a + 0.6, t), 1 - smoothstep(b, b + 1.5, t))), 0);

  // Vastustajajoukon läsnäolo: fraasin ympärillä, vajoaa kun puupuhaltimet vaikenevat.
  const mobIv = [];
  for (const p of ph) {
    const a = p.t0 - 1.0, b = p.t1 + 6.0;
    const last = mobIv[mobIv.length - 1];
    if (last && a < last[1]) last[1] = Math.max(last[1], b);
    else mobIv.push([a, b]);
  }
  const mobAt = (t) => mobIv.reduce((m, [a, b]) => Math.max(m, Math.min(smoothstep(a - 0.4, a + 0.3, t), 1 - smoothstep(b, b + 2.0, t))), 0);

  function criticState(c, t0) {
    const t = t0 + LEAD;
    if (t < c.spawn - 0.5) return null;
    const rise = c.spawn - 0.45;
    const mob = Math.max(mobAt(t), 0);
    let up2 = t < rise + 0.6 ? clamp((t - rise) / 0.6) : mob;
    if (t >= plan.byName.snap.a) up2 = Math.max(up2, 1);
    // viimeisin oma isku
    let last = null, idx = -1;
    for (let k = 0; k < c.ons.length; k++) { if (c.ons[k].t <= t) { last = c.ons[k]; idx = k; } else break; }
    const age = last ? t - last.t : 99;
    const g = age < 0.06 ? age / 0.06 : Math.exp(-(age - 0.06) / 0.28);
    const phNow = c.mine.find((p) => t >= p.t0 - 0.1 && t <= p.t1 + 0.3);
    const ret = plan.byName.return, snap = plan.byName.snap;
    let rad = 5.4 + 0.7 * hash1(c.a0 * 100);
    rad = mix(rad, 3.9, smoothstep(ret.a, ret.b, t));
    rad = mix(rad, 8.6, smoothstep(snap.a + 1, snap.a + 4, t));
    if (c.type === 'karikatyyri') rad = mix(4.2, rad, smoothstep(ret.a, ret.b, t));
    // joukko kiertää sankaria, nopeammin kun puupuhaltimet soivat
    const a = c.a0 + 0.035 * (t - S.T_WID) + 0.35 * Math.sin((t - S.T_WID) * 0.21 + c.a0 * 3);
    const x = rad * Math.sin(a), z = rad * Math.cos(a);
    const face = Math.atan2(-x, -z);
    return { up: up2, g, last, idx, phNow, x, z, face, age };
  }

  function criticPose(c, cs, t) {
    let P = { ...L.hunch };
    const g = cs.g;
    const j = cs.last ? cs.last.j : 0;
    let y = 0, sx = 1, sy = 1;
    switch (c.type) {
      case 'neula': P = mixPose(mixPose(L.hunch, pose({ toe: 1, spineF: 0.3 }), 0.5), j % 2 ? M_(L.jab) : L.jab, g); y = 0.25 * g; break;
      case 'rykelma': {
        P = mixPose(L.hunch, L.second, 0.3 * g);
        const prog = cs.phNow ? clamp((t - cs.phNow.t0) / Math.max(0.5, cs.phNow.t1 - cs.phNow.t0)) : 0;
        sx = 1 + 0.45 * prog + 0.1 * g; sy = 1 + 0.3 * prog;
        break;
      }
      case 'roiske': P = mixPose(pose({ lRaise: 1.4, rRaise: 1.4, lElb: 0.1, rElb: 0.1 }), pose({ lFwd: 1.5, rFwd: 1.5, lRaise: 0.35, rRaise: 0.35, lElb: 0.1, rElb: 0.1, toe: 1 }), g); y = 0.3 * g; break;
      case 'portaat': {
        const n = cs.phNow ? cs.phNow.ons.filter((o) => o <= t + 0.05).length : 0;
        y = 0.3 * Math.min(n, 8);
        P = mixPose(L.hunch, L.marchL, j % 2 ? 0.0 : g);
        if (j % 2) P = mixPose(L.hunch, M_(L.marchL), g);
        break;
      }
      case 'dehring': P = mixPose(L.heavy, j % 2 ? M_(L.heavySway) : L.heavySway, g); break;
      case 'vapisevat': {
        const tr = cs.phNow ? 1 : 0.2;
        P = { ...L.hunch, spineS: 0.18 * Math.sin(t * 47) * tr, lRaise: 0.9 + 0.4 * Math.sin(t * 53) * tr, rRaise: 0.9 + 0.4 * Math.sin(t * 41 + 1) * tr };
        y = 0.08 * Math.abs(Math.sin(t * 23)) * tr;
        break;
      }
      case 'karikatyyri': {
        // Matkii sankarin näytöksen I liikettä, liioitellen.
        const hp = heroPose(plan.byName.fire.a + ((t * 1.3) % 20));
        P = mixPose(L.hunch, hp, 0.55 + 0.45 * g);
        sx = 1 - 0.15 * g; sy = 1 + 0.25 * g;
        break;
      }
      case 'fagotit': P = mixPose(L.plie, L.reachUp, (j + c.k) % 2 ? g : 0); y = ((j + c.k) % 2 ? 0.55 : 0.05) * g; break;
      case 'pasuunat': P = mixPose(L.stand, L.slam, g); break;
      default: break;
    }
    if (g > 0.05 && c.type !== 'rykelma' && c.type !== 'karikatyyri') { sx = 1 - 0.12 * g; sy = 1 + 0.2 * g; }
    // levottomuus: hahmot ovat levottomia, kamera ei (tyyli, luku 11)
    const w = clamp(S.fam.winds(t) * 1.5) * (1 - g);
    const ph = c.a0 * 7 + c.k;
    P.spineS += 0.12 * w * Math.sin(t * 6.3 + ph);
    P.headT += 0.5 * w * Math.sin(t * 2.9 + ph);
    P.lRaise += 0.4 * w * Math.max(0, Math.sin(t * 5.1 + ph));
    y += 0.06 * w * Math.abs(Math.sin(t * 4.4 + ph));
    return { P, y, sx, sy };
  }

  // Aaltorenkaat: patarummut, leimasimet (pasuunat), tornin askeleet.
  const ringEvents = [];
  for (const h of S.percHits) {
    const d = stage.drums[Math.floor(hash1(Math.round(h.t * 10)) * 2)];
    ringEvents.push({ t: h.t, x: d.x, z: d.z, s: 0.5 + 0.6 * h.s });
  }
  for (const c of critics) if (c.type === 'pasuunat' && c.k === 1) for (const o of c.ons) ringEvents.push({ t: o.t, critic: c, s: 0.9 });
  for (const L2 of levels) ringEvents.push({ t: L2.t, x: 0, z: 0, s: 1.0 });
  ringEvents.sort((a, b) => a.t - b.t);

  const c2s = (c) => (c.type === 'dehring' || c.type === 'pasuunat' || c.type === 'fagotit' ? 1.15 : 1);

  // --- Päivitys ruudulle -------------------------------------------------------------------------
  const info = { hero: new THREE.Vector3(), heroHead: new THREE.Vector3(), centroid: {}, criticNew: null };
  let trapK = 0;
  function useTrap(x, z, y, open) {
    if (trapK >= stage.traps.length || open <= 0.01) return;
    const m = stage.traps[trapK++];
    m.visible = true;
    m.position.set(x, y + 0.008, z);
    m.scale.setScalar(clamp(open * 1.3));
  }

  function update(t) {
    trapK = 0;
    stage.traps.forEach((m) => (m.visible = false));
    const tc = choreoT(t);
    stage.setTiers(tierHeights(tc));

    // Sankari, keihäs ja viiri.
    const gY = heroGround(t);
    const visibleHero = t > S.T0 - 0.6 && !(t > S.T_DOM7 + 0.4 && t < S.T_WID - 0.3);
    hero.root.visible = staff.visible = banner.visible = visibleHero;
    const trail = [];
    const dt = 0.055;
    for (let k = NB - 1; k >= 0; k--) {
      const tk = t - k * dt;
      const st = heroState(tk);
      const pl = placeHero(st, heroGround(tk));
      trail[k] = pl;
    }
    const st = heroState(t);
    const pl = placeHero(st, gY);
    staff.position.copy(pl.grip);
    staff.quaternion.setFromUnitVectors(up, pl.dir);
    // Viiri: keskiviiva = kärjen polku + tuuli (orkesterin hengitys), leveys keihään suuntaan.
    const pos = bannerGeo.getAttribute('position');
    const nor = bannerGeo.getAttribute('normal');
    const wind = new THREE.Vector3(-0.85, 0.18, -0.5).normalize().multiplyScalar(0.8 + 2.4 * S.loud(tc));
    for (let k = 0; k < NB; k++) {
      const u = k / (NB - 1);
      const p0 = trail[k].tip.clone().addScaledVector(trail[k].dir, -0.25);
      const fl = Math.sin(k * 0.65 - tc * 6.5) * 0.16 * u;
      p0.addScaledVector(wind, k * dt).add(new THREE.Vector3(0, fl, 0));
      const w = 0.95 * (1 - 0.55 * u);
      const p1 = p0.clone().addScaledVector(trail[k].dir, -w);
      pos.setXYZ(2 * k, p0.x, p0.y, p0.z);
      pos.setXYZ(2 * k + 1, p1.x, p1.y, p1.z);
    }
    pos.needsUpdate = true;
    bannerGeo.computeVertexNormals();
    nor.needsUpdate = true;
    // Tumma sankari näytöksessä II (puoliksi rasteroitu); täysi sinooperi, kun kärsivällisyys loppuu.
    const dark = t >= S.T_WID ? 0.5 * (1 - smoothstep(plan.byName.snap.a, plan.byName.snap.a + 3, t)) * (1 - 0.3 * S.energy.horns(t)) : 0;
    for (const m of [heroM.body, heroM.limb, heroM.leg, bannerMat]) m.uniforms.uRaster.value = dark;
    info.hero.set(st.pos.x, gY + st.lift, st.pos.z);
    hero.head.getWorldPosition(info.heroHead);
    stage.lift.position.set(0, Math.min(gY, 0) + st.lift - 0.06, 0);
    stage.lift.visible = t < T_RISE + 5;
    stage.hole.visible = t < T_RISE + 5;

    // Ryhmät.
    for (const tr of Object.values(troupes)) {
      let cx = 0, cz = 0, cn = 0;
      const e = S.energy[tr.name](t);
      // Hauptstimme: hiljaiset ryhmät rasteroituvat (sivuääni), soivat täysvärisinä.
      const ras = 0.45 * (1 - smoothstep(0.22, 0.6, e));
      for (const m of [tr.M.body, tr.M.limb, tr.M.leg, tr.M.accent]) m.uniforms.uRaster.value = ras;
      for (const d of tr.ds) {
        const ms = memberState(tr, d, t);
        const vis = ms.p > 0.002;
        d.r.root.visible = vis;
        if (!vis) continue;
        const tp = troupePose(tr, d, t, ms);
        let face = ms.face;
        if (tp.run > 0.05) face = mix(face, Math.atan2(tp.vx, tp.vz), clamp(tp.run * 1.5));
        const gy = stage.groundAt(ms.x, ms.z);
        d.r.root.position.set(ms.x, gy - ms.sink + tp.P.y * d.r.scale, ms.z);
        d.r.root.rotation.y = face;
        applyPose(d.r, { ...tp.P, y: 0 });
        if (ms.ent.trap) useTrap(ms.x, ms.z, gy, ms.sink > 0.02 ? 1 - ms.sink / 2.6 + 0.3 : 0);
        cx += ms.x; cz += ms.z; cn += ms.p;
      }
      info.centroid[tr.name] = cn > 0.5 ? new THREE.Vector3(cx / tr.n, 1.0, cz / tr.n) : null;
    }

    // Kurkistaja (näytös I).
    {
      const p = scoutAt(t);
      scout.root.visible = p > 0.01;
      if (p > 0.01) {
        scout.root.position.set(mix(19.5, 14.2, E.s(p)), FLOOR_Y, 3.4);
        scout.root.rotation.y = -Math.PI / 2 + 0.3;
        const P = mixPose(L.hunch, L.jab, 0.4 + 0.3 * Math.sin(t * 2.3));
        P.headT = 0.4 * Math.sin(t * 1.7);
        applyPose(scout, P);
      }
    }

    // Vastustajat.
    let newest = null;
    for (const c of critics) {
      const cs = criticState(c, t);
      if (!cs || cs.up <= 0.002) {
        c.r.root.visible = false;
        c.steps.forEach((s) => (s.visible = false));
        continue;
      }
      c.r.root.visible = true;
      const cp = criticPose(c, cs, t);
      const over2 = cs.up < 1 ? 1 + 0.25 * Math.sin(cs.up * Math.PI) : 1;
      const sinkY = (1 - cs.up) * 2.4;
      const gy = stage.groundAt(cs.x, cs.z);
      const boxY = c.box ? 0.55 : 0;
      c.r.root.position.set(cs.x + (c.type === 'dehring' ? (c.k - 0.5) * 0.0 : 0), gy - sinkY + (cp.y + boxY) * c.r.scale, cs.z);
      if (c.box) c.box.position.y = -boxY / c.r.scale + 0.275;
      c.r.root.rotation.y = cs.face;
      c.r.root.scale.set(c.r.scale * cp.sx, c.r.scale * cp.sy * over2, c.r.scale * cp.sx);
      applyPose(c.r, cp.P);
      useTrap(cs.x, cs.z, gy, cs.up < 1 ? 1 - Math.abs(cs.up - 0.5) * 2 + 0.4 : 0);
      if (c.type === 'portaat') {
        const n2 = Math.round(cp.y / 0.3);
        c.steps.forEach((s, k) => {
          s.visible = k < n2 && cs.up > 0.5;
          const fwd = 0.35 * (k + 1);
          s.position.set(cs.x + Math.sin(cs.face) * fwd * 0.2, gy + 0.3 * (k + 1) - 0.06, cs.z + Math.cos(cs.face) * fwd * 0.2);
          s.rotation.y = cs.face;
        });
      }
      if (cs.age < 2.5 && (!newest || cs.last.t > newest.t)) newest = { t: cs.last.t, x: cs.x, z: cs.z, type: c.type, c };
    }
    info.criticNew = newest;
    info.critics = critics;

    // Valokeilat: sankari aina, uusin vastustaja näytöksessä II.
    const pools = stage.pools;
    pools.forEach((v) => v.set(0, 0, 1, 0));
    const heroLight = t < S.T0 - 0.5 ? 0 : 0.55 + 0.45 * smoothstep(0.2, 0.8, 1 - S.loudSlow(t));
    pools[0].set(info.hero.x, info.hero.z, 2.6, visibleHero ? heroLight : 0);
    if (t >= S.T_WID) {
      const lit = critics.map((c) => ({ c, cs: c.r.root.visible ? criticState(c, t) : null })).filter((q) => q.cs)
        .sort((a2, b2) => a2.cs.age - b2.cs.age).slice(0, 5);
      lit.forEach((q, k2) => pools[k2 + 1].set(q.cs.x, q.cs.z, 1.7 * c2s(q.c), q.cs.up * (0.3 + 0.6 * q.cs.g)));
    }
    // Aaltorenkaat.
    const rings = stage.rings;
    rings.forEach((v) => v.set(0, 0, -99, 0));
    let k = 0;
    for (let q = ringEvents.length - 1; q >= 0 && k < rings.length; q--) {
      const ev = ringEvents[q];
      if (ev.t > t || t - ev.t > 2.5) continue;
      let x = ev.x, z = ev.z;
      if (ev.critic) { const cs = criticState(ev.critic, ev.t); if (!cs) continue; x = cs.x; z = cs.z; }
      rings[k++].set(x, z, ev.t, ev.s);
    }
    return info;
  }

  // Jähmettymässä valot sammuvat, mutta sankarin valokeila jää.
  function heroSelfDim(v) {
    for (const m of [heroM.body, heroM.limb, heroM.leg, heroM.accent, bannerMat]) m.uniforms.uSelfDim.value = v;
  }

  return { update, info, heroState, troupes, critics, tierHeights, choreoT, burst, holds, heroSelfDim, scoutIv };
}
