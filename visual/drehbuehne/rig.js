// Tanssijat: geometrisista kappaleista koottu luuranko (Schlemmer-henkiset asut, ei kasvoja).
// Asento on joukko nivelkulmia; applyPose asettaa ne ja laskee lantion korkeuden niin,
// että alin jalka tai polvi koskettaa lattiaa (hyppy lisätään erikseen).

import * as THREE from 'three';
import { C, inkMat, hullMat, faceted } from './ink.js';

// Perusasento ja avaimet. Kulmat radiaaneina: Raise = käsi sivulle (0 alas, PI ylös),
// Fwd = käsi eteen, Elb = kyynärpää, LegF = jalka eteen (negatiivinen taakse), LegS = sivulle,
// Knee = polvi, spineF = kumarrus, toe = varpaille (0..1), y = hyppy (m), turn = lisäkierto.
export const P0 = {
  y: 0, toe: 0, turn: 0, spineF: 0, spineS: 0, spineT: 0, headF: 0, headT: 0,
  lRaise: 0.18, lFwd: 0.05, lElb: 0.15, rRaise: 0.18, rFwd: 0.05, rElb: 0.15,
  lLegF: 0, lLegS: 0.05, lKnee: 0, rLegF: 0, rLegS: 0.05, rKnee: 0,
};
const KEYS = Object.keys(P0);
export const pose = (o = {}) => ({ ...P0, ...o });
export function mixPose(a, b, t) {
  const o = {};
  for (const k of KEYS) o[k] = a[k] + (b[k] - a[k]) * t;
  return o;
}
export function mirror(p) {
  return {
    ...p, lRaise: p.rRaise, rRaise: p.lRaise, lFwd: p.rFwd, rFwd: p.lFwd, lElb: p.rElb, rElb: p.lElb,
    lLegF: p.rLegF, rLegF: p.lLegF, lLegS: p.rLegS, rLegS: p.lLegS, lKnee: p.rKnee, rKnee: p.lKnee,
    spineS: -p.spineS, spineT: -p.spineT, headT: -p.headT, turn: -p.turn,
  };
}

// --- Geometriat (jaetaan) ----------------------------------------------------------------
const GEO = new Map();
function geo(key, make) {
  if (!GEO.has(key)) GEO.set(key, faceted(make()));
  return GEO.get(key);
}
const cyl = (rt, rb, h, s = 7) => geo(`c${rt},${rb},${h},${s}`, () => new THREE.CylinderGeometry(rt, rb, h, s, 1));
const sph = (r, s = 10) => geo(`s${r},${s}`, () => new THREE.SphereGeometry(r, s, Math.max(6, s - 3)));
const box = (x, y, z) => geo(`b${x},${y},${z}`, () => new THREE.BoxGeometry(x, y, z));
const tor = (r, tube, s = 14) => geo(`t${r},${tube},${s}`, () => new THREE.TorusGeometry(r, tube, 6, s));
const oct = (r) => geo(`o${r}`, () => new THREE.OctahedronGeometry(r, 0));

export function part(parent, g, mat, hull, o = {}) {
  const m = new THREE.Mesh(g, mat);
  if (o.p) m.position.set(...o.p);
  if (o.r) m.rotation.set(...o.r);
  if (o.s) m.scale.set(...o.s);
  parent.add(m);
  if (hull) m.add(new THREE.Mesh(g, hull));
  return m;
}

// --- Luuranko -----------------------------------------------------------------------------
function skeleton(d) {
  const G = () => new THREE.Group();
  const r = { root: G(), hips: G(), spine: G(), chest: G(), head: G(), lSh: G(), lEl: G(), lHand: G(),
    rSh: G(), rEl: G(), rHand: G(), lHip: G(), lKn: G(), lFoot: G(), rHip: G(), rKn: G(), rFoot: G(), d };
  r.root.add(r.hips);
  r.hips.add(r.spine, r.lHip, r.rHip);
  r.spine.rotation.order = 'YXZ';
  r.spine.add(r.chest);
  r.chest.position.y = d.torso;
  r.chest.add(r.head, r.lSh, r.rSh);
  r.head.position.y = d.neck;
  r.lSh.position.set(d.sw, -0.04, 0);
  r.rSh.position.set(-d.sw, -0.04, 0);
  r.lSh.add(r.lEl); r.rSh.add(r.rEl);
  r.lEl.position.y = -d.upper; r.rEl.position.y = -d.upper;
  r.lEl.add(r.lHand); r.rEl.add(r.rHand);
  r.lHand.position.y = -d.fore; r.rHand.position.y = -d.fore;
  r.lHip.position.set(d.hw, 0, 0);
  r.rHip.position.set(-d.hw, 0, 0);
  r.lHip.add(r.lKn); r.rHip.add(r.rKn);
  r.lKn.position.y = -d.thigh; r.rKn.position.y = -d.thigh;
  r.lKn.add(r.lFoot); r.rKn.add(r.rFoot);
  r.lFoot.position.y = -d.shin; r.rFoot.position.y = -d.shin;
  return r;
}

const DIM = { torso: 0.58, neck: 0.12, sw: 0.21, upper: 0.3, fore: 0.3, hw: 0.1, thigh: 0.47, shin: 0.48 };

export function applyPose(r, P) {
  const d = r.d;
  r.spine.rotation.set(P.spineF, P.spineT, P.spineS);
  r.head.rotation.set(P.headF, P.headT, 0);
  r.lSh.rotation.set(-P.lFwd, 0, P.lRaise);
  r.rSh.rotation.set(-P.rFwd, 0, -P.rRaise);
  r.lEl.rotation.set(-P.lElb, 0, 0);
  r.rEl.rotation.set(-P.rElb, 0, 0);
  r.lHip.rotation.set(-P.lLegF, 0, P.lLegS);
  r.rHip.rotation.set(-P.rLegF, 0, -P.rLegS);
  r.lKn.rotation.set(P.lKnee, 0, 0);
  r.rKn.rotation.set(P.rKnee, 0, 0);
  // Maakosketus: alin polvi tai jalka lattialle.
  const leg = (f, s, k) => {
    const ky = -d.thigh * Math.cos(f) * Math.cos(s);
    const fy = ky - d.shin * Math.cos(f - k) * Math.cos(s);
    return Math.min(ky - 0.06, fy - 0.03);
  };
  const low = Math.min(leg(P.lLegF, P.lLegS, P.lKnee), leg(P.rLegF, P.rLegS, P.rKnee));
  r.hips.position.y = -low + 0.07 * P.toe;
  r.hips.rotation.y = P.turn;
}

// --- Asut -----------------------------------------------------------------------------------
function limbs(r, M, H, t = 1, legT = 1) {
  const d = r.d;
  part(r.lSh, cyl(0.055 * t, 0.045 * t, d.upper), M.limb, H, { p: [0, -d.upper / 2, 0] });
  part(r.rSh, cyl(0.055 * t, 0.045 * t, d.upper), M.limb, H, { p: [0, -d.upper / 2, 0] });
  part(r.lEl, cyl(0.045 * t, 0.035 * t, d.fore), M.limb, H, { p: [0, -d.fore / 2, 0] });
  part(r.rEl, cyl(0.045 * t, 0.035 * t, d.fore), M.limb, H, { p: [0, -d.fore / 2, 0] });
  part(r.lHip, cyl(0.075 * legT, 0.058 * legT, d.thigh), M.leg, H, { p: [0, -d.thigh / 2, 0] });
  part(r.rHip, cyl(0.075 * legT, 0.058 * legT, d.thigh), M.leg, H, { p: [0, -d.thigh / 2, 0] });
  part(r.lKn, cyl(0.058 * legT, 0.04 * legT, d.shin), M.leg, H, { p: [0, -d.shin / 2, 0] });
  part(r.rKn, cyl(0.058 * legT, 0.04 * legT, d.shin), M.leg, H, { p: [0, -d.shin / 2, 0] });
}

function mats(base, shade, limb, limbShade, accent, accentShade, hullColor, opts = {}) {
  return {
    body: inkMat(base, shade, opts),
    limb: inkMat(limb, limbShade, opts),
    leg: inkMat(limb, limbShade, opts),
    accent: inkMat(accent, accentShade, opts),
    hull: hullMat(hullColor, opts.px ?? 2.2),
  };
}

const COSTUMES = {
  hero(r, M, H) {
    part(r.hips, cyl(0.17, 0.33, 0.38, 8), M.body, H, { p: [0, -0.1, 0] });
    part(r.spine, cyl(0.31, 0.15, 0.6, 6), M.body, H, { p: [0, 0.3, 0] });
    part(r.spine, cyl(0.13, 0.13, 0.05, 12), M.accent, H, { p: [0, 0.36, 0.17], r: [Math.PI / 2, 0, 0] });
    part(r.lSh, sph(0.09, 8), M.body, H);
    part(r.rSh, sph(0.09, 8), M.body, H);
    part(r.head, sph(0.135, 12), M.body, H, { p: [0, 0.13, 0] });
    part(r.head, box(0.04, 0.2, 0.34), M.accent, H, { p: [0, 0.27, -0.03] });
    part(r.chest, cyl(0.05, 0.06, 0.12, 6), M.limb, H, { p: [0, 0.05, 0] });
    limbs(r, M, H, 1.1, 1.1);
    part(r.lFoot, box(0.11, 0.07, 0.22), M.limb, H, { p: [0, 0, 0.05] });
    part(r.rFoot, box(0.11, 0.07, 0.22), M.limb, H, { p: [0, 0, 0.05] });
  },
  horns(r, M, H) {
    part(r.spine, cyl(0.12, 0.1, 0.56, 7), M.accent, H, { p: [0, 0.28, 0] });
    part(r.spine, tor(0.24, 0.07), M.body, H, { p: [0, 0.38, 0], r: [Math.PI / 2, 0, 0] });
    part(r.hips, tor(0.2, 0.065), M.body, H, { p: [0, -0.02, 0], r: [Math.PI / 2, 0, 0] });
    part(r.head, cyl(0.17, 0.05, 0.24, 10), M.body, H, { p: [0, 0.14, 0] });
    limbs(r, M, H, 0.9, 0.9);
  },
  violins(r, M, H) {
    part(r.spine, cyl(0.15, 0.09, 0.56, 6), M.body, H, { p: [0, 0.28, 0] });
    part(r.hips, cyl(0.46, 0.46, 0.025, 14), M.accent, H, { p: [0, -0.02, 0] });
    part(r.hips, cyl(0.37, 0.37, 0.025, 14), M.accent, H, { p: [0, 0.07, 0] });
    part(r.hips, cyl(0.28, 0.28, 0.025, 14), M.accent, H, { p: [0, 0.16, 0] });
    part(r.head, sph(0.1, 10), M.body, H, { p: [0, 0.1, 0] });
    part(r.head, cyl(0.012, 0.012, 0.55, 4), M.limb, H, { p: [0.12, 0.3, 0], r: [0, 0, -0.45] });
    limbs(r, M, H, 0.8, 0.85);
  },
  lows(r, M, H) {
    part(r.spine, box(0.56, 0.58, 0.4), M.body, H, { p: [0, 0.3, 0] });
    part(r.hips, box(0.5, 0.3, 0.38), M.body, H, { p: [0, -0.04, 0] });
    part(r.spine, box(0.08, 0.36, 0.02), M.accent, H, { p: [0.12, 0.3, 0.205] });
    part(r.spine, box(0.08, 0.36, 0.02), M.accent, H, { p: [-0.12, 0.3, 0.205] });
    part(r.head, box(0.24, 0.24, 0.24), M.body, H, { p: [0, 0.12, 0], r: [0, 0.785, 0] });
    limbs(r, M, H, 1.5, 1.45);
    part(r.lFoot, box(0.16, 0.08, 0.26), M.limb, H, { p: [0, 0, 0.05] });
    part(r.rFoot, box(0.16, 0.08, 0.26), M.limb, H, { p: [0, 0, 0.05] });
  },
  brass(r, M, H) {
    part(r.spine, cyl(0.2, 0.16, 0.56, 6), M.body, H, { p: [0, 0.28, 0] });
    part(r.hips, cyl(0.17, 0.2, 0.3, 6), M.body, H, { p: [0, -0.05, 0] });
    part(r.head, sph(0.11, 8), M.body, H, { p: [0, 0.1, 0] });
    part(r.head, cyl(0.24, 0.05, 0.3, 12), M.accent, H, { p: [0, 0.32, 0] });
    limbs(r, M, H, 1.0, 1.0);
    part(r.lHand, cyl(0.03, 0.13, 0.22, 10), M.accent, H, { p: [0, -0.05, 0] });
    part(r.rHand, cyl(0.03, 0.13, 0.22, 10), M.accent, H, { p: [0, -0.05, 0] });
  },
  // --- vastustajat (Porter) ---
  neula(r, M, H) {
    part(r.spine, cyl(0.07, 0.05, 0.58, 5), M.body, H, { p: [0, 0.29, 0] });
    part(r.head, cyl(0.0, 0.08, 0.6, 5), M.body, H, { p: [0, 0.08, 0.28], r: [Math.PI / 2, 0, 0] });
    part(r.lHand, cyl(0.0, 0.03, 0.3, 4), M.body, H, { p: [0, -0.15, 0] });
    part(r.rHand, cyl(0.0, 0.03, 0.3, 4), M.body, H, { p: [0, -0.15, 0] });
    limbs(r, M, H, 0.6, 0.6);
  },
  rykelma(r, M, H) {
    part(r.spine, sph(0.36, 9), M.body, H, { p: [0, 0.3, 0] });
    part(r.head, sph(0.12, 8), M.body, H, { p: [0, 0.16, 0] });
    for (let k = 0; k < 6; k++) part(r.spine, sph(0.05, 6), M.accent, null, { p: [Math.cos(k) * 0.37, 0.3 + Math.sin(k * 2.1) * 0.15, Math.sin(k) * 0.37] });
    limbs(r, M, H, 0.7, 0.8);
  },
  roiske(r, M, H) {
    part(r.spine, cyl(0.14, 0.1, 0.56, 6), M.body, H, { p: [0, 0.28, 0] });
    part(r.head, sph(0.11, 8), M.body, H, { p: [0, 0.1, 0] });
    part(r.lHand, cyl(0.38, 0.38, 0.03, 16), M.accent, H, { p: [0, -0.05, 0], r: [0, 0, Math.PI / 2] });
    part(r.rHand, cyl(0.38, 0.38, 0.03, 16), M.accent, H, { p: [0, -0.05, 0], r: [0, 0, Math.PI / 2] });
    limbs(r, M, H, 0.8, 0.8);
  },
  portaat(r, M, H) {
    part(r.spine, cyl(0.15, 0.12, 0.56, 5), M.body, H, { p: [0, 0.28, 0] });
    part(r.head, cyl(0.04, 0.04, 0.38, 6), M.body, H, { p: [0, 0.12, 0.12], r: [1.1, 0, 0] });
    part(r.head, sph(0.1, 8), M.body, H, { p: [0, 0.27, 0.27] });
    limbs(r, M, H, 0.75, 0.8);
  },
  dehring(r, M, H) {
    part(r.spine, sph(0.42, 10), M.body, H, { p: [0, 0.22, 0.04], s: [1, 0.9, 1] });
    part(r.head, sph(0.12, 8), M.body, H, { p: [0, 0.1, 0] });
    part(r.head, cyl(0.32, 0.06, 0.36, 12), M.accent, H, { p: [0, 0.36, 0] });
    limbs(r, M, H, 1.0, 1.2);
  },
  vapisevat(r, M, H) {
    part(r.spine, oct(0.3), M.body, H, { p: [0, 0.3, 0] });
    part(r.head, oct(0.13), M.body, H, { p: [0, 0.14, 0] });
    limbs(r, M, H, 0.6, 0.65);
  },
  karikatyyri(r, M, H) { COSTUMES.hero(r, M, H); },
  fagotit(r, M, H) {
    part(r.spine, cyl(0.13, 0.13, 0.95, 8), M.body, H, { p: [0, 0.45, 0] });
    part(r.head, cyl(0.03, 0.03, 0.4, 5), M.accent, H, { p: [0, 0.32, 0.12], r: [0.8, 0, 0] });
    limbs(r, M, H, 0.7, 0.75);
  },
  pasuunat(r, M, H) {
    part(r.spine, box(0.32, 0.56, 0.26), M.body, H, { p: [0, 0.28, 0] });
    part(r.head, box(0.5, 0.1, 0.42), M.accent, H, { p: [0, 0.22, 0] });
    part(r.head, cyl(0.04, 0.04, 0.18, 5), M.body, H, { p: [0, 0.09, 0] });
    limbs(r, M, H, 0.9, 0.9);
  },
};

const SCALE = { hero: 1.28, horns: 1.0, violins: 0.98, lows: 1.12, brass: 1.02, karikatyyri: 1.05, dehring: 1.05, fagotit: 1.0, neula: 1.0, rykelma: 0.95, roiske: 0.95, portaat: 0.95, vapisevat: 0.9, pasuunat: 1.0 };

// Väriryhmät. Mustat hahmot saavat paperisen ääriviivan (valkoviivapuupiirros).
export function troupeMats(kind) {
  switch (kind) {
    case 'hero': return mats(C.red, C.black, C.red, C.black, C.paper, C.blue, C.black);
    case 'horns': return mats(C.red, C.black, C.black, C.blue, C.paper, C.red, C.black);
    case 'violins': return mats(C.blue, C.black, C.blue, C.black, C.paper, C.blue, C.paper, { px: 1.8 });
    case 'lows': return mats(C.blue, C.black, C.blue, C.black, C.paper, C.blue, C.paper);
    case 'brass': return mats(C.paper, C.blue, C.black, C.blue, C.red, C.black, C.black);
    case 'karikatyyri': return mats(C.paper, C.black, C.paper, C.black, C.paper, C.black, C.black, { raster: 0.55, ambient: 0.2 });
    default: return mats(C.black, C.blue, C.black, C.blue, C.paper, C.black, C.paper);
  }
}

export function createDancer(kind, M) {
  const d = { ...DIM };
  if (kind === 'violins') { d.thigh = 0.5; d.shin = 0.52; d.torso = 0.54; }
  if (kind === 'lows') { d.thigh = 0.42; d.shin = 0.42; d.sw = 0.3; d.hw = 0.15; }
  if (kind === 'dehring') { d.thigh = 0.38; d.shin = 0.38; d.sw = 0.36; d.hw = 0.16; }
  if (kind === 'rykelma') { d.sw = 0.3; d.hw = 0.12; d.thigh = 0.38; d.shin = 0.36; }
  if (kind === 'fagotit') { d.torso = 0.92; d.sw = 0.15; }
  if (kind === 'neula') { d.thigh = 0.52; d.shin = 0.55; d.sw = 0.12; d.hw = 0.07; }
  const r = skeleton(d);
  COSTUMES[kind](r, M, M.hull);
  // vastustajat hieman yli luonnollisen koon: ne erottuvat mustalta levyltä
  const s = (SCALE[kind] ?? 1) * (['hero', 'horns', 'violins', 'lows', 'brass'].includes(kind) ? 1 : 1.3);
  r.root.scale.setScalar(s);
  r.kind = kind;
  r.scale = s;
  r.M = M;
  return r;
}
