// Paperinuket (Lotte Reiniger): nivelet kiertyvät kuvan tasossa. Hahmot katsovat +x-suuntaan;
// facing = -1 peilaa. Kulmat: raajat 0 = suoraan alas, positiivinen = eteenpäin.
//
//   Käyrätorviritari (sankarit): rinnassa torven kierre, päässä torven kello kypäränä.
//   Hevonen: laukka, käynti, takajaloille nousu.
//   Kriitikko-olennot (Porter): hyttynen, sorsa, rupikonna, heinäsirkka, varis, sammakko,
//   ja Don Quijote -nukke (sankarin pilkkakuva laihoista ritari- ja hevosnukeista).

import * as THREE from 'three';
import { C, ink, poly, circle, limb, flat, group, outline, pennantGeo, waveMat, TAU, clamp, mix } from './paper.js';

// --- Käyrätorviritari -------------------------------------------------------------------------
export const KP0 = { lean: 0, tilt: 0, aN: 0.15, eN: 0.25, aF: -0.1, eF: 0.25, hN: 0.05, kN: 0.05, hF: -0.05, kF: 0.05, y: 0, cape: 0.15, coil: 0 };
export const kpose = (o = {}) => ({ ...KP0, ...o });
export function kmix(a, b, t) {
  const o = {};
  for (const k in KP0) o[k] = a[k] + (b[k] - a[k]) * t;
  return o;
}
// Asentosanasto
export const KP = {
  stand: kpose(),
  proud: kpose({ lean: -0.05, tilt: 0.05, aN: 0.5, eN: 1.6, aF: -0.25, eF: 0.4 }),
  call: kpose({ lean: -0.3, tilt: 1.05, aN: 1.5, eN: 1.5, aF: 1.25, eF: 1.6, hN: 0.25, kN: 0.2, hF: -0.3 }), // kello taivaalle
  lanceUp: kpose({ lean: -0.08, tilt: 0.15, aN: 2.7, eN: 0.2, aF: -0.3, eF: 0.4 }),   // keihäs pystyyn
  lanceFwd: kpose({ lean: 0.15, aN: 1.45, eN: 0.05, aF: -0.6, eF: 0.3, hN: 0.5, kN: 0.6, hF: -0.45 }),
  stepA: kpose({ hN: 0.5, kN: 0.35, hF: -0.35, kF: 0.15, aN: -0.35, aF: 0.35, lean: 0.06 }),
  stepB: kpose({ hN: -0.35, kN: 0.15, hF: 0.5, kF: 0.35, aN: 0.35, aF: -0.35, lean: 0.06 }),
  climbA: kpose({ hN: 1.2, kN: 1.4, hF: -0.2, kF: 0.3, aN: 1.9, eN: 0.4, aF: 0.9, eF: 0.8, lean: 0.35 }),
  climbB: kpose({ hN: 0.2, kN: 0.3, hF: 1.1, kF: 1.3, aN: 0.9, eN: 0.8, aF: 1.9, eF: 0.4, lean: 0.35 }),
  kneel: kpose({ hN: 1.45, kN: 1.55, hF: -0.15, kF: 1.7, lean: 0.2, tilt: -0.35, aN: 0.4, eN: 0.6, aF: 0.2, eF: 0.5 }),
  sit: kpose({ hN: 1.5, kN: 1.7, hF: 1.4, kF: 1.9, lean: 0.35, tilt: -0.5, aN: 0.9, eN: 1.5, aF: 0.7, eF: 1.6 }),
  look: kpose({ lean: -0.12, tilt: 0.6, aN: 0.25, eN: 0.4 }),
  ride: kpose({ hN: 1.0, kN: 1.5, hF: 0.9, kF: 1.4, lean: 0.12, aN: 0.9, eN: 1.0, aF: 0.6, eF: 1.1 }),
  plant: kpose({ lean: 0.25, aN: 0.6, eN: 0.1, aF: 0.4, eF: 0.4, hN: 0.6, kN: 0.9, hF: -0.4 }),
};

const DIMK = { thigh: 0.5, shin: 0.5, torso: 0.74, upper: 0.34, fore: 0.32 };

export function knight(parent, o = {}) {
  const d = { ...DIMK, ...(o.dim || {}) };
  const thin = o.thin ? 0.45 : 1;
  const M = {
    body: ink(o.body ?? C.red, { raster: o.raster ?? 0 }),
    tunic: ink(o.body ?? C.red, { shade: C.black, raster: 0.35 }),
    limb: ink(o.limb ?? C.black, {}),
    far: ink(o.limb ?? C.black, { shade: C.blue, raster: 0.55 }),
    coil: ink(C.paper, { shade: C.black, raster: o.coilRaster ?? 0 }),
    rim: ink(C.paper, {}),
    line: ink(o.line ?? C.black, {}),
    cape: waveMat(o.cape ?? C.red, { shade: C.black, raster: 0.5, amp: 0.12, k: 5 }),
  };
  const root = group(parent);
  const hip = group(root, { y: 1.0 });
  const torso = group(hip);
  const head = group(torso, { x: 0.03, y: d.torso + 0.06 });
  const mk = (p, x, y, z) => group(p, { x, y, z });
  const shN = mk(torso, 0.04, d.torso - 0.06, 0.03), elN = mk(shN, 0, -d.upper, 0);
  const shF = mk(torso, -0.04, d.torso - 0.06, -0.03), elF = mk(shF, 0, -d.upper, 0);
  const hpN = mk(hip, 0.03, 0, 0.02), knN = mk(hpN, 0, -d.thigh, 0);
  const hpF = mk(hip, -0.03, 0, -0.02), knF = mk(hpF, 0, -d.thigh, 0);
  // viitta selän takana
  const capeM = flat(torso, pennantGeo(1.15, 0.55), M.cape, { x: -0.12, y: d.torso - 0.02, z: -0.05, r: -1.75 });
  // vartalo
  const tw = 0.27 * thin, ww = 0.17 * thin;
  flat(torso, poly([[-ww, 0.02], [ww, 0.02], [tw, d.torso], [-tw * 0.95, d.torso]]), M.body, { z: 0 });
  if (!o.thin) {
    flat(hip, poly([[-0.2, 0.06], [0.2, 0.06], [0.27, -0.3], [-0.27, -0.3]]), M.tunic, { z: -0.005 });
    // torven kierre rinnassa
    flat(torso, new THREE.RingGeometry(0.1, 0.17, 32), M.coil, { x: 0.05, y: d.torso * 0.58, z: 0.01 });
    flat(torso, new THREE.RingGeometry(0.035, 0.06, 20), M.coil, { x: 0.05, y: d.torso * 0.58, z: 0.012 });
    flat(torso, poly([[0.18, d.torso * 0.6], [0.28, d.torso * 0.5], [0.3, d.torso * 0.56], [0.2, d.torso * 0.66]]), M.coil, { z: 0.011 });
  }
  // pää ja kello (kypärä): kapea kurkku, leveä suu ylhäällä, hieman eteenpäin
  flat(head, circle(0.13 * (o.thin ? 0.8 : 1), 24), M.body, { z: 0.005 });
  const bell = group(head, { y: 0.06, z: 0.008 });
  bell.rotation.z = -0.32;
  if (o.thin) {
    // Don Quijoten partavatikypärä
    flat(bell, poly([[-0.22, 0.12], [0.22, 0.12], [0.16, 0.2], [-0.16, 0.2]]), M.line);
  } else {
    flat(bell, poly([[-0.07, 0], [0.07, 0], [0.05, 0.22], [0.12, 0.36], [0.27, 0.52], [-0.27, 0.52], [-0.12, 0.36], [-0.05, 0.22]]), M.body);
    flat(bell, circle(0.27, 32, 0, 0.52, 0.22), M.rim, { z: 0.002 });
    flat(bell, circle(0.2, 28, 0, 0.53, 0.14), M.line, { z: 0.004 });
  }
  // raajat
  const L = (p, len, w0, w1, m, z) => flat(p, limb(len, w0, w1), m, { z });
  L(shN, d.upper, 0.13 * thin, 0.1 * thin, M.limb, 0); L(elN, d.fore, 0.1 * thin, 0.08 * thin, M.limb, 0);
  L(shF, d.upper, 0.13 * thin, 0.1 * thin, M.far, 0); L(elF, d.fore, 0.1 * thin, 0.08 * thin, M.far, 0);
  L(hpN, d.thigh, 0.17 * thin, 0.13 * thin, M.limb, 0); L(knN, d.shin, 0.13 * thin, 0.1 * thin, M.limb, 0);
  L(hpF, d.thigh, 0.17 * thin, 0.13 * thin, M.far, 0); L(knF, d.shin, 0.13 * thin, 0.1 * thin, M.far, 0);
  const boot = poly([[-0.07, 0.04], [0.06, 0.04], [0.2, -0.05], [-0.08, -0.06]]);
  flat(knN, boot, M.limb, { y: -d.shin }); flat(knF, boot, M.far, { y: -d.shin });
  const handN = mk(elN, 0, -d.fore, 0.01);
  const handF = mk(elF, 0, -d.fore, -0.01);
  const P = { root, hip, torso, head, bell, shN, elN, shF, elF, hpN, knN, hpF, knF, handN, handF, capeM, M, d, mounted: false };
  P.mats = Object.values(M);
  return P;
}

export function poseKnight(P, p, t = 0, wind = 0.3) {
  const d = P.d;
  P.torso.rotation.z = -p.lean;
  P.head.rotation.z = p.tilt;
  P.shN.rotation.z = p.aN; P.elN.rotation.z = p.eN;
  P.shF.rotation.z = p.aF; P.elF.rotation.z = p.eF;
  P.hpN.rotation.z = p.hN; P.knN.rotation.z = -p.kN;
  P.hpF.rotation.z = p.hF; P.knF.rotation.z = -p.kF;
  if (!(p.mounted ?? P.mounted)) {
    const leg = (h, k) => { const ky = -d.thigh * Math.cos(h); return Math.min(ky - 0.06, ky - d.shin * Math.cos(h - k) - 0.05); };
    P.hip.position.y = -Math.min(leg(p.hN, p.kN), leg(p.hF, p.kF)) + p.y;
  } else P.hip.position.y = p.y;
  P.M.cape.uniforms.uTime.value = t;
  P.M.cape.uniforms.uAmp.value = 0.05 + 0.25 * wind + p.cape * 0.2;
}
// Käden maailmankoordinaatit (keihäs ja viiri).
export function handWorld(P, near = true) {
  const v = new THREE.Vector3();
  P.root.updateMatrixWorld(true);
  (near ? P.handN : P.handF).getWorldPosition(v);
  return v;
}

// Selkäkuva (Friedrich): symmetrinen siluetti, viitta ja kello.
export function knightBack(parent) {
  const M = { body: ink(C.red, {}), dark: ink(C.red, { shade: C.black, raster: 0.45 }), line: ink(C.black), rim: ink(C.paper), cape: waveMat(C.red, { shade: C.black, raster: 0.55, amp: 0.1, k: 4 }) };
  const root = group(parent);
  flat(root, poly([[-0.22, 0], [-0.12, 0], [-0.1, 0.95], [0.1, 0.95], [0.12, 0], [0.22, 0], [0.2, 1.0], [0.3, 1.75], [-0.3, 1.75], [-0.2, 1.0]]), M.dark, { z: 0 });
  flat(root, poly([[-0.36, 1.0], [0.36, 1.0], [0.3, 1.78], [-0.3, 1.78]]), M.body, { z: 0.01 });
  const capeM = flat(root, new THREE.PlaneGeometry(0.75, 1.2, 8, 8), M.cape, { y: 1.15, z: 0.02 });
  const head = group(root, { y: 1.88, z: 0.03 });
  flat(head, circle(0.13, 24), M.body);
  flat(head, poly([[-0.07, 0.06], [0.07, 0.06], [0.05, 0.28], [0.27, 0.58], [-0.27, 0.58], [-0.05, 0.28]]), M.body, { z: 0.002 });
  flat(head, circle(0.27, 32, 0, 0.58, 0.18), M.rim, { z: 0.004 });
  const armL = group(root, { x: -0.33, y: 1.72, z: 0.015 });
  const armR = group(root, { x: 0.33, y: 1.72, z: 0.015 });
  flat(armL, limb(0.66, 0.13, 0.09), M.line); flat(armR, limb(0.66, 0.13, 0.09), M.line);
  const handR = group(armR, { y: -0.66 });
  return { root, head, armL, armR, handR, capeM, M, mats: Object.values(M) };
}

// --- Hevonen -------------------------------------------------------------------------------------
export function horse(parent, o = {}) {
  const thin = o.thin ? 0.5 : 1;
  const M = {
    body: ink(o.color ?? C.black, {}),
    far: ink(o.color ?? C.black, { shade: C.blue, raster: 0.55 }),
    rim: ink(o.rim ?? C.paper, {}),
    mane: ink(o.mane ?? C.red, { shade: C.black, raster: 0.3 }),
  };
  const root = group(parent);
  const body = group(root, { y: 1.15 });
  const bshape = o.thin
    ? poly([[-0.9, 0.05], [-0.8, 0.14], [0.6, 0.14], [0.85, 0.08], [0.82, -0.06], [-0.85, -0.06]])
    : poly([[-0.95, 0.12], [-0.85, 0.3], [-0.4, 0.36], [0.35, 0.32], [0.75, 0.3], [0.95, 0.05], [0.8, -0.25], [0.35, -0.33], [-0.4, -0.33], [-0.88, -0.2]]);
  flat(body, bshape, M.body, { z: 0 });
  if (!o.thin) flat(body, outline(bshape, 0.035), M.rim, { z: 0.004 });
  const neck = group(body, { x: 0.72, y: 0.18, z: 0.006 });
  flat(neck, poly([[-0.22 * thin, -0.12], [0.18 * thin, -0.2], [0.42, 0.72], [0.22, 0.8]]), M.body);
  flat(neck, poly([[-0.22, -0.08], [-0.05, -0.02], [0.24, 0.78], [0.12, 0.86]]), M.mane, { z: 0.003 });
  const head = group(neck, { x: 0.33, y: 0.76, z: 0.004 });
  flat(head, poly([[-0.1, 0.1], [0.12, 0.12], [0.62, -0.18], [0.6, -0.32], [0.42, -0.34], [-0.12, -0.08]]), M.body);
  flat(head, poly([[-0.04, 0.1], [0.02, 0.28], [0.08, 0.1]]), M.body, { z: 0.001 });
  flat(head, circle(0.035, 12, 0.14, -0.02), M.rim, { z: 0.003 });
  const leg = (x, y, z, m) => {
    const up = group(body, { x, y, z });
    flat(up, limb(0.5, 0.22 * thin + 0.04, 0.12 * thin), m);
    const lo = group(up, { y: -0.5 });
    flat(lo, limb(0.52, 0.1 * thin + 0.02, 0.08 * thin), m);
    flat(lo, poly([[-0.07, -0.5], [0.08, -0.5], [0.1, -0.6], [-0.08, -0.6]]), m);
    return { up, lo };
  };
  const L = { fN: leg(0.62, -0.18, 0.01, M.body), fF: leg(0.5, -0.18, -0.02, M.far), hN: leg(-0.62, -0.12, 0.01, M.body), hF: leg(-0.75, -0.12, -0.02, M.far) };
  const tail = group(body, { x: -0.92, y: 0.2, z: -0.01 });
  flat(tail, poly([[0, 0.05], [-0.15, 0], [-0.4, -0.45], [-0.3, -0.7], [-0.1, -0.35]]), M.mane);
  const saddle = group(body, { x: 0.02, y: 0.36, z: 0.02 });
  return { root, body, neck, head, L, tail, saddle, M, mats: Object.values(M) };
}
// mode: 'gallop' | 'walk' | 'stand' | 'rear', ph: vaihe (rad), amt: liikkeen määrä
export function poseHorse(H, mode, ph, amt = 1, rear = 0) {
  const s = Math.sin;
  let fN = 0, fF = 0, hN = 0, hF = 0, kfN = 0, kfF = 0, khN = 0, khF = 0, pitch = 0, bob = 0, nk = 0, tl = 0;
  if (mode === 'gallop') {
    fN = 0.6 * s(ph); fF = 0.6 * s(ph + 0.45);
    hN = 0.55 * s(ph + Math.PI); hF = 0.55 * s(ph + Math.PI + 0.45);
    kfN = -1.2 * Math.max(0, s(ph + 1.1)); kfF = -1.2 * Math.max(0, s(ph + 1.55));
    khN = 0.9 * Math.max(0, s(ph + Math.PI + 1.1)); khF = 0.9 * Math.max(0, s(ph + Math.PI + 1.55));
    pitch = 0.07 * s(ph + 0.6); bob = 0.1 * Math.abs(s(ph)); nk = 0.14 * s(ph + 0.3); tl = 0.3 * s(ph * 0.5);
  } else if (mode === 'walk') {
    fN = 0.3 * s(ph); fF = 0.3 * s(ph + Math.PI); hN = 0.28 * s(ph + Math.PI * 0.5); hF = 0.28 * s(ph + Math.PI * 1.5);
    kfN = -0.6 * Math.max(0, s(ph + 0.8)); kfF = -0.6 * Math.max(0, s(ph + Math.PI + 0.8));
    khN = 0.4 * Math.max(0, s(ph + 2.3)); khF = 0.4 * Math.max(0, s(ph + Math.PI + 2.3));
    bob = 0.03 * Math.abs(s(ph)); nk = 0.06 * s(ph * 2); tl = 0.15 * s(ph);
  }
  const k = clamp(amt);
  H.L.fN.up.rotation.z = fN * k; H.L.fF.up.rotation.z = fF * k; H.L.hN.up.rotation.z = hN * k; H.L.hF.up.rotation.z = hF * k;
  H.L.fN.lo.rotation.z = kfN * k; H.L.fF.lo.rotation.z = kfF * k; H.L.hN.lo.rotation.z = khN * k; H.L.hF.lo.rotation.z = khF * k;
  // takajaloille nousu: etuosa ylös, etujalat koukkuun
  const r = clamp(rear);
  H.body.rotation.z = pitch * k + 0.6 * r;
  H.body.position.y = 1.15 + bob * k + 0.35 * r;
  H.body.position.x = -0.35 * r;
  if (r > 0) {
    H.L.fN.up.rotation.z = mix(H.L.fN.up.rotation.z, 1.1, r); H.L.fN.lo.rotation.z = mix(H.L.fN.lo.rotation.z, -1.8, r);
    H.L.fF.up.rotation.z = mix(H.L.fF.up.rotation.z, 0.8, r); H.L.fF.lo.rotation.z = mix(H.L.fF.lo.rotation.z, -1.5, r);
    H.L.hN.up.rotation.z = mix(H.L.hN.up.rotation.z, -0.45, r); H.L.hF.up.rotation.z = mix(H.L.hF.up.rotation.z, -0.3, r);
  }
  H.neck.rotation.z = nk * k + 0.35 * r;
  H.tail.rotation.z = tl * k - 0.2 * r;
}

// --- Kriitikko-olennot ----------------------------------------------------------------------------
function critterMats() {
  return { body: ink(C.black, {}), rim: ink(C.paper, {}), eye: ink(C.paper, {}), wing: ink(C.paper, { shade: C.blue, raster: 0.55 }), red: ink(C.red, {}) };
}
function eye(p, x, y, r, M) {
  flat(p, circle(r, 16, x, y), M.eye, { z: 0.004 });
  flat(p, circle(r * 0.45, 12, x + r * 0.25, y), M.body, { z: 0.006 });
}
// Huilu: hyttynen ("sehr scharf und spitzig")
export function mosquito(parent) {
  const M = critterMats();
  const root = group(parent);
  const b = group(root);
  const body = poly([[-0.5, 0.0], [-0.3, 0.1], [0.1, 0.08], [0.2, 0.02], [0.1, -0.06], [-0.3, -0.08]]);
  flat(b, body, M.body); flat(b, outline(body, 0.02), M.rim, { z: 0.002 });
  flat(b, circle(0.1, 16, 0.28, 0.05), M.body, { z: 0.003 });
  eye(b, 0.31, 0.08, 0.04, M);
  const needle = group(b, { x: 0.36, y: 0.02, z: 0.003 });
  flat(needle, poly([[0, 0.015], [0.62, 0], [0, -0.015]]), M.body);
  const wN = group(b, { x: 0.0, y: 0.08, z: 0.01 }), wF = group(b, { x: -0.05, y: 0.08, z: -0.01 });
  const wing = poly(Array.from({ length: 20 }, (_, i) => { const a = (i / 20) * TAU; return [-0.25 + 0.28 * Math.cos(a), 0.3 + 0.1 * Math.sin(a)]; }));
  flat(wN, wing, M.wing); flat(wF, wing, M.wing);
  for (let i = 0; i < 3; i++) flat(b, poly([[0.0 - i * 0.12, -0.05], [0.02 - i * 0.12, -0.05], [0.08 - i * 0.2, -0.45], [0.06 - i * 0.2, -0.45]]), M.body);
  return { root, b, needle, wN, wF, mats: Object.values(M) };
}
// Oboe: mutiseva sorsa (palaa kiihtyneenä)
export function duck(parent) {
  const M = critterMats();
  const root = group(parent);
  const b = group(root);
  const body = poly([[-0.55, 0.15], [-0.65, 0.35], [-0.4, 0.3], [0.1, 0.32], [0.35, 0.2], [0.4, 0.0], [0.2, -0.15], [-0.4, -0.15]]);
  flat(b, body, M.body); flat(b, outline(body, 0.025), M.rim, { z: 0.002 });
  const head = group(b, { x: 0.32, y: 0.4, z: 0.003 });
  flat(head, circle(0.17, 20), M.body);
  eye(head, 0.05, 0.05, 0.045, M);
  const up = group(head, { x: 0.14, y: -0.02, z: 0.002 }), lo = group(head, { x: 0.14, y: -0.04, z: 0.001 });
  flat(up, poly([[0, 0.03], [0.3, 0.0], [0, -0.04]]), M.red);
  flat(lo, poly([[0, 0.02], [0.26, -0.02], [0, -0.05]]), M.red);
  return { root, b, head, up, lo, mats: Object.values(M) };
}
// Tuubat (Dehring): rupikonna, kurkkupussi paisuu
export function toad(parent) {
  const M = critterMats();
  const root = group(parent);
  const b = group(root);
  const body = poly(Array.from({ length: 30 }, (_, i) => { const a = (i / 29) * Math.PI; return [-Math.cos(a) * 0.55, Math.sin(a) * 0.42]; }));
  flat(b, body, M.body); flat(b, outline(body, 0.03), M.rim, { z: 0.002 });
  eye(b, 0.22, 0.4, 0.07, M);
  const sac = group(b, { x: 0.38, y: 0.08, z: 0.004 });
  flat(sac, circle(0.16, 20), M.wing);
  flat(b, poly([[0.15, 0.18], [0.52, 0.12], [0.5, 0.1], [0.15, 0.15]]), M.rim, { z: 0.005 });
  flat(b, poly([[-0.5, 0.0], [-0.2, -0.05], [-0.1, 0.05], [-0.45, 0.12]]), M.body, { z: 0.003 });
  return { root, b, sac, mats: Object.values(M) };
}
// Fagotit: heinäsirkka
export function cricket(parent) {
  const M = critterMats();
  const root = group(parent);
  const b = group(root, { y: 0.35 });
  const body = poly([[-0.45, 0.02], [-0.3, 0.12], [0.25, 0.1], [0.38, 0.0], [0.25, -0.08], [-0.3, -0.07]]);
  flat(b, body, M.body); flat(b, outline(body, 0.02), M.rim, { z: 0.002 });
  eye(b, 0.3, 0.05, 0.035, M);
  flat(b, poly([[0.35, 0.08], [0.75, 0.45], [0.74, 0.47], [0.33, 0.1]]), M.body);
  const hind = group(b, { x: -0.15, y: 0.02, z: 0.004 });
  flat(hind, poly([[0, 0], [-0.35, 0.35], [-0.32, 0.38], [0.04, 0.03]]), M.body);
  const shin = group(hind, { x: -0.34, y: 0.36 });
  flat(shin, poly([[0, 0], [-0.1, -0.7], [-0.07, -0.7], [0.03, 0]]), M.body);
  for (let i = 0; i < 2; i++) flat(b, poly([[0.1 + i * 0.12, -0.05], [0.12 + i * 0.12, -0.05], [0.2 + i * 0.12, -0.36], [0.17 + i * 0.12, -0.36]]), M.body);
  return { root, b, hind, shin, mats: Object.values(M) };
}
// Sordinoidut pasuunat: varis
export function crow(parent) {
  const M = critterMats();
  const root = group(parent);
  const b = group(root);
  const body = poly([[-0.6, 0.1], [-0.3, 0.28], [0.15, 0.3], [0.3, 0.2], [0.2, 0.0], [-0.2, -0.1], [-0.65, -0.05]]);
  flat(b, body, M.body); flat(b, outline(body, 0.025), M.rim, { z: 0.002 });
  const head = group(b, { x: 0.28, y: 0.32, z: 0.003 });
  flat(head, circle(0.14, 18), M.body);
  eye(head, 0.04, 0.04, 0.04, M);
  const up = group(head, { x: 0.12, y: 0.0, z: 0.002 }), lo = group(head, { x: 0.12, y: -0.02, z: 0.001 });
  flat(up, poly([[0, 0.04], [0.3, -0.02], [0, -0.03]]), M.body);
  flat(lo, poly([[0, 0.01], [0.26, -0.04], [0, -0.05]]), M.body);
  const wing = group(b, { x: -0.05, y: 0.22, z: 0.004 });
  flat(wing, poly([[0, 0], [-0.55, 0.12], [-0.7, -0.05], [-0.2, -0.12]]), M.body);
  flat(b, poly([[-0.05, -0.08], [-0.03, -0.08], [0.0, -0.32], [-0.02, -0.32]]), M.body);
  flat(b, poly([[0.05, -0.08], [0.07, -0.08], [0.1, -0.32], [0.08, -0.32]]), M.body);
  return { root, b, head, up, lo, wing, mats: Object.values(M) };
}
// Lautasisku: sammakko hyppää loiskeesta
export function frog(parent) {
  const M = critterMats();
  const root = group(parent);
  const b = group(root);
  const body = poly([[-0.3, 0], [-0.2, 0.2], [0.15, 0.22], [0.32, 0.08], [0.2, -0.06], [-0.2, -0.08]]);
  flat(b, body, M.body); flat(b, outline(body, 0.02), M.rim, { z: 0.002 });
  eye(b, 0.12, 0.24, 0.05, M);
  const leg = group(b, { x: -0.2, y: 0.0, z: 0.003 });
  flat(leg, poly([[0, 0], [-0.4, -0.2], [-0.38, -0.24], [0.02, -0.04]]), M.body);
  return { root, b, leg, mats: Object.values(M) };
}

export { flat, group };
