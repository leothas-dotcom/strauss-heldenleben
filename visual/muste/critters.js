// Arvostelijat soittimiensa muotoisina olentoina (kuvakäsikirjoitus, luku 3). Isot, selvät mustat
// siluetit paperinvalkoisella ääriviivalla, jotta soittimen tunnistaa ilman ääntä. Jokaisella on
// yksi ele, jota ohjataan yhdellä luvulla 0..1 (fraasin tasoitettu verhokäyrä, ei nuotinalut).
// Hahmot katsovat +x-suuntaan; root.scale.x = -1 peilaa.

import * as THREE from 'three';
import { C, ink, flat, group, poly, circle, rect, strokeGeo, outline, TAU, clamp, mix } from './paper.js';

function mats() {
  return { body: ink(C.black, {}), rim: ink(C.paper, {}), eye: ink(C.paper, {}), wing: ink(C.paper, { shade: C.blue, raster: 0.55 }), red: ink(C.red, {}) };
}
function sil(p, shape, M, o = {}) {
  flat(p, shape, M.body, o);
  flat(p, outline(shape, o.rimW ?? 0.04), M.rim, { ...o, z: (o.z ?? 0) + 0.002 });
}
function eye(p, x, y, r, M) {
  flat(p, circle(r, 16, x, y), M.eye, { z: 0.006 });
  flat(p, circle(r * 0.45, 12, x + r * 0.25, y), M.body, { z: 0.008 });
}

// Huilu: hyttynen, jonka ruumis on huilu (sormiläpät) ja kärki pistin.
export function fluteMosquito(parent) {
  const M = mats();
  const root = group(parent);
  const b = group(root);
  sil(b, poly([[-1.4, -0.07], [0.6, -0.07], [0.6, 0.07], [-1.4, 0.07]]), M, { rimW: 0.035 });
  for (let i = 0; i < 6; i++) flat(b, circle(0.05, 10, -1.05 + i * 0.25, 0), M.rim, { z: 0.01 });
  sil(b, circle(0.2, 20, 0.78, 0.04), M);
  eye(b, 0.84, 0.1, 0.07, M);
  const needle = group(b, { x: 0.96, y: 0.0, z: 0.004 });
  flat(needle, poly([[0, 0.025], [1.1, 0], [0, -0.025]]), M.body);
  const wN = group(b, { x: 0.1, y: 0.06, z: 0.02 }), wF = group(b, { x: -0.1, y: 0.06, z: -0.02 });
  const wing = poly(Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * TAU; return [-0.35 + 0.42 * Math.cos(a), 0.45 + 0.16 * Math.sin(a)]; }));
  flat(wN, wing, M.wing); flat(wF, wing, M.wing);
  for (let i = 0; i < 3; i++) flat(b, poly([[0.2 - i * 0.3, -0.06], [0.23 - i * 0.3, -0.06], [0.1 - i * 0.4, -0.7], [0.07 - i * 0.4, -0.7]]), M.body);
  return { root, b, wN, wF, needle, mats: Object.values(M),
    pose(g, t) { const f = Math.sin(t * TAU * 3.5); wN.rotation.z = 0.5 * f; wF.rotation.z = -0.5 * f; needle.rotation.z = -0.25 * g; } };
}

// Oboe: sorsa, nokkana kaksoislehdykkä.
export function oboeDuck(parent) {
  const M = mats();
  const root = group(parent);
  const b = group(root);
  sil(b, poly([[-0.75, 0.2], [-0.9, 0.5], [-0.55, 0.42], [0.15, 0.45], [0.5, 0.28], [0.55, 0.0], [0.3, -0.2], [-0.55, -0.2]]), M);
  const head = group(b, { x: 0.45, y: 0.62, z: 0.003 });
  sil(head, circle(0.24, 24), M);
  eye(head, 0.07, 0.07, 0.06, M);
  // kaksoislehdykkä: kaksi kapeaa lehteä, jotka avautuvat
  const up = group(head, { x: 0.2, y: 0.0, z: 0.004 }), lo = group(head, { x: 0.2, y: -0.03, z: 0.003 });
  flat(up, poly([[0, 0.035], [0.55, 0.012], [0.55, -0.005], [0, -0.01]]), M.red);
  flat(lo, poly([[0, 0.01], [0.55, 0.005], [0.55, -0.012], [0, -0.035]]), M.red);
  flat(head, rect(0.1, 0.09, 0, 0.5), M.rim, { x: 0.16, z: 0.002 });   // lehdykän sidos
  return { root, b, head, mats: Object.values(M),
    pose(g) { up.rotation.z = 0.05 + 0.35 * g; lo.rotation.z = -0.05 - 0.35 * g; head.rotation.z = 0.1 * g; } };
}

// Englannintorvi: haikara, kaula on taivutettu putki ja pää päärynäkello.
export function cAnglaisHeron(parent) {
  const M = mats();
  const root = group(parent);
  const b = group(root, { y: 1.6 });
  sil(b, poly([[-0.6, 0.0], [-0.3, 0.3], [0.3, 0.3], [0.5, 0.05], [0.2, -0.2], [-0.5, -0.15]]), M);
  // jalat
  const legN = group(b, { x: 0.05, y: -0.15 }), legF = group(b, { x: -0.1, y: -0.15, z: -0.01 });
  flat(legN, rect(0.05, 1.5, 0.5, 1), M.body); flat(legF, rect(0.05, 1.5, 0.5, 1), M.body);
  // kaula: taivutettu putki (englannintorven es-putki)
  const neck = [];
  for (let i = 0; i <= 20; i++) { const u = i / 20; neck.push([0.35 + 0.35 * Math.sin(u * 2.2), 0.25 + 1.1 * u]); }
  flat(b, strokeGeo(neck, 0.11), M.body, { z: 0.002 });
  flat(b, strokeGeo(neck, 0.03), M.rim, { z: 0.004 });
  const head = group(b, { x: neck[20][0], y: neck[20][1] + 0.12, z: 0.005 });
  sil(head, circle(0.2, 24, 0, 0, 1.3), M);   // päärynäkello
  eye(head, 0.06, 0.08, 0.05, M);
  flat(head, poly([[0.15, 0.03], [0.75, -0.04], [0.15, -0.06]]), M.body, { z: 0.002 });
  return { root, b, head, legN, legF, mats: Object.values(M),
    pose(g, t, step = 0) { legN.rotation.z = 0.35 * Math.sin(step * Math.PI); legF.rotation.z = -0.35 * Math.sin(step * Math.PI); head.rotation.z = 0.25 * g; } };
}

// Tuubat: kotilo, jonka kuori on tuuban kello (Dehring).
export function tubaSnail(parent) {
  const M = mats();
  const root = group(parent);
  const b = group(root);
  sil(b, poly([[-0.9, 0], [0.9, 0], [1.2, 0.15], [1.15, 0.35], [0.8, 0.3], [-0.8, 0.22]]), M);
  // silmävarret
  flat(b, poly([[0.95, 0.3], [1.0, 0.3], [1.15, 0.8], [1.1, 0.8]]), M.body);
  eye(b, 1.13, 0.82, 0.07, M);
  // kuori: kiemura ja kello
  const shell = group(b, { x: -0.1, y: 0.75, z: 0.004 });
  sil(shell, circle(0.62, 36), M);
  flat(shell, strokeGeo(Array.from({ length: 40 }, (_, i) => { const a = i * 0.32; const r = 0.5 - i * 0.011; return [r * Math.cos(a), r * Math.sin(a)]; }), 0.05), M.rim, { z: 0.004 });
  const bell = group(shell, { x: 0.2, y: 0.5, z: 0.006 });
  sil(bell, poly([[-0.12, 0], [0.12, 0], [0.25, 0.4], [0.6, 0.75], [-0.6, 0.75], [-0.25, 0.4]]), M);
  flat(bell, circle(0.6, 32, 0, 0.75, 0.2), M.rim, { z: 0.004 });
  flat(bell, circle(0.5, 32, 0, 0.76, 0.14), M.body, { z: 0.006 });
  return { root, b, bell, mats: Object.values(M), pose(g) { bell.rotation.z = -0.35 + 0.5 * g; } };
}

// Fagotit: sammakko, jonka takajalat ovat fagotin putkia.
export function bassoonFrog(parent) {
  const M = mats();
  const root = group(parent);
  const b = group(root);
  sil(b, poly([[-0.5, 0], [-0.35, 0.35], [0.25, 0.38], [0.55, 0.15], [0.35, -0.05], [-0.3, -0.08]]), M);
  eye(b, 0.25, 0.42, 0.09, M);
  const leg = group(b, { x: -0.3, y: 0.05, z: 0.004 });
  flat(leg, rect(1.3, 0.13, 1, 0.5), M.body);
  flat(leg, rect(1.3, 0.03, 1, 0.5), M.rim, { z: 0.002 });
  const shin = group(leg, { x: -1.25 });
  flat(shin, rect(0.12, 1.0, 0.5, 1), M.body);
  flat(shin, poly([[-0.25, -1.0], [0.1, -1.0], [0.05, -0.9]]), M.body);
  flat(b, poly([[0.3, 0], [0.34, 0], [0.42, -0.35], [0.38, -0.35]]), M.body);
  return { root, b, leg, mats: Object.values(M), pose(g) { leg.rotation.z = -0.5 + 0.35 * g; b.position.y = -0.1 * g; } };
}

// Sordinoidut pasuunat: varis, nokkana vetoputki.
export function tromboneCrow(parent) {
  const M = mats();
  const root = group(parent);
  const b = group(root);
  sil(b, poly([[-0.9, 0.12], [-0.45, 0.4], [0.2, 0.42], [0.45, 0.28], [0.3, 0.0], [-0.3, -0.15], [-0.95, -0.05]]), M);
  const head = group(b, { x: 0.42, y: 0.45, z: 0.003 });
  sil(head, circle(0.2, 20), M);
  eye(head, 0.06, 0.06, 0.055, M);
  const slide = group(head, { x: 0.15, y: -0.02, z: 0.004 });
  flat(slide, rect(0.7, 0.05, 0, 0.5), M.body, { y: 0.06 });
  flat(slide, rect(0.7, 0.05, 0, 0.5), M.body, { y: -0.06 });
  const outer = group(slide, { x: 0.3 });
  flat(outer, rect(0.55, 0.035, 0, 0.5), M.rim, { y: 0.06, z: 0.002 });
  flat(outer, rect(0.55, 0.035, 0, 0.5), M.rim, { y: -0.06, z: 0.002 });
  flat(outer, rect(0.06, 0.17, 0, 0.5), M.rim, { x: 0.55, z: 0.002 });
  flat(head, circle(0.12, 16, 0.18, 0), M.rim, { z: 0.006 });   // sordiino
  flat(b, poly([[-0.05, -0.1], [-0.02, -0.1], [0.02, -0.5], [-0.01, -0.5]]), M.body);
  flat(b, poly([[0.1, -0.1], [0.13, -0.1], [0.16, -0.5], [0.13, -0.5]]), M.body);
  return { root, b, head, mats: Object.values(M), pose(g) { outer.position.x = 0.15 + 0.5 * g; head.rotation.z = 0.15 * g; } };
}
