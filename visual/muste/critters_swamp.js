// Suon soitinolennot, luettavat versiot (palaute C4, kierros 2). Muoto, mittakaava ja eleet ovat samat kuin
// critters.js:ssä (yhteinen tiedosto, ei muokata), mutta viivanpaksuus ja kontrasti on mitoitettu *maailman*
// yksikköinä: ääriviiva vähintään RIM_W maailmayksikköä, ohuet osat (pistin, jalat, putket, kaula) vähintään
// 0,03 yksikköä. Olennot ovat täplän kokoisia (kierros 4c): rakentajalle annettu sc on suurimman koon mittakaava (loc_swamp.js SCp), ja pienempinä (pianissimo) viivat ohenevat vain sen suhteessa.
// Jokaisella olennolla on yksi ele (pose(g)), jonka ajaa yksi 0..1-luku: oman soitinkanavan tasoitettu verhokäyrä
// (loc_swamp.js), ei nuotinalku.
// Kaikki hahmot katsovat +x-suuntaan; root.scale.x = -1 peilaa.

import { C, ink, flat, group, poly, circle, rect, strokeGeo, outline, TAU } from './paper.js';

export const RIM_W = 0.05;      // ääriviivan leveys maailmassa suurimmalla koolla (olennot ovat täplän kokoisia, kierros 4c: ääriviiva ei saa ohentua luettavuuden alle)
export const LINE_W = 0.03;     // ohuin viiva maailmassa suurimmalla koolla

function kit(sc, rimMax = 0.4) {
  const rw = Math.min(rimMax, Math.max(0.04, RIM_W / sc));      // paikallinen ääriviivan leveys (rimMax: pieni olento ei muutu valkoiseksi putkeksi)
  const lw = LINE_W / sc;                     // paikallinen vähimmäisviiva
  const M = { body: ink(C.black, {}), rim: ink(C.paper, {}), eye: ink(C.paper, {}), wing: ink(C.paper, { shade: C.blue, raster: 0.4 }), red: ink(C.red, {}) };
  const sil = (p, shape, o = {}) => {
    flat(p, outline(shape, (o.rimW ?? rw) * 2.6), M.body, { ...o, z: (o.z ?? 0) - 0.001 });   // musta ulkoreuna: erottuu myös vaalealla taustalla
    flat(p, shape, M.body, o);
    flat(p, outline(shape, o.rimW ?? rw), M.rim, { ...o, z: (o.z ?? 0) + 0.002 });
  };
  const eye = (p, x, y, r) => {
    const R = Math.max(r, 0.045 / sc);
    flat(p, circle(R, 16, x, y), M.eye, { z: 0.006 });
    flat(p, circle(R * 0.5, 12, x + R * 0.25, y), M.body, { z: 0.008 });
  };
  // viiva, jonka paksuus on vähintään lw: nelikulmio (x0,y0)-(x1,y1)
  const bar = (p, x0, y0, x1, y1, w, mat, o = {}) => flat(p, strokeGeo([[x0, y0], [x1, y1]], Math.max(w, lw)), mat, o);
  return { M, rw, lw, sil, eye, bar };
}

// Huilu: hyttynen, jonka ruumis on huilu (sormiläpät) ja kärki pistin.
export function fluteMosquito(parent, sc = 1) {
  const { M, sil, eye, bar, lw } = kit(sc, 0.12);
  const root = group(parent);
  const b = group(root);
  sil(b, poly([[-1.4, -0.16], [0.6, -0.16], [0.6, 0.16], [-1.4, 0.16]]));
  for (let i = 0; i < 6; i++) flat(b, circle(0.065, 10, -1.05 + i * 0.25, 0), M.rim, { z: 0.01 });
  sil(b, circle(0.27, 20, 0.8, 0.05));
  eye(b, 0.88, 0.12, 0.09);
  const needle = group(b, { x: 1.03, y: 0.0, z: 0.004 });
  flat(needle, poly([[0, Math.max(0.05, lw / 2)], [1.1, 0], [0, -Math.max(0.05, lw / 2)]]), M.body);
  const wN = group(b, { x: 0.1, y: 0.06, z: 0.02 }), wF = group(b, { x: -0.1, y: 0.06, z: -0.02 });
  const wing = poly(Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * TAU; return [-0.35 + 0.46 * Math.cos(a), 0.5 + 0.2 * Math.sin(a)]; }));
  flat(wN, wing, M.wing); flat(wF, wing, M.wing);
  for (let i = 0; i < 3; i++) bar(b, 0.2 - i * 0.3, -0.08, 0.1 - i * 0.4, -0.72, 0.07, M.body);
  return { root, b, wN, wF, needle, mats: Object.values(M),
    pose(g, t) { const f = Math.sin(t * TAU * 2.25); wN.rotation.z = 0.5 * f; wF.rotation.z = -0.5 * f; needle.rotation.z = -0.25 * g; } };
}

// Oboe: sorsa, nokkana kaksoislehdykkä.
export function oboeDuck(parent, sc = 1) {
  const { M, sil, eye } = kit(sc);
  const root = group(parent);
  const b = group(root);
  sil(b, poly([[-0.75, 0.2], [-0.9, 0.5], [-0.55, 0.42], [0.15, 0.45], [0.5, 0.28], [0.55, 0.0], [0.3, -0.2], [-0.55, -0.2]]));
  const head = group(b, { x: 0.45, y: 0.62, z: 0.003 });
  sil(head, circle(0.26, 24));
  eye(head, 0.08, 0.08, 0.07);
  const up = group(head, { x: 0.2, y: 0.0, z: 0.004 }), lo = group(head, { x: 0.2, y: -0.03, z: 0.003 });
  flat(up, poly([[0, 0.07], [0.6, 0.03], [0.6, -0.01], [0, -0.02]]), M.red);
  flat(lo, poly([[0, 0.02], [0.6, 0.01], [0.6, -0.03], [0, -0.07]]), M.red);
  flat(head, rect(0.1, 0.1, 0, 0.5), M.rim, { x: 0.16, z: 0.002 });
  return { root, b, head, mats: Object.values(M),
    pose(g) { up.rotation.z = 0.05 + 0.35 * g; lo.rotation.z = -0.05 - 0.35 * g; head.rotation.z = 0.1 * g; } };
}

// Englannintorvi: haikara, kaula on taivutettu putki ja pää päärynäkello.
export function cAnglaisHeron(parent, sc = 1) {
  const { M, sil, eye, lw } = kit(sc);
  const root = group(parent);
  const b = group(root, { y: 1.6 });
  sil(b, poly([[-0.75, -0.02], [-0.4, 0.42], [0.35, 0.42], [0.62, 0.05], [0.25, -0.3], [-0.62, -0.2]]));
  const legN = group(b, { x: 0.05, y: -0.15 }), legF = group(b, { x: -0.1, y: -0.15, z: -0.01 });
  const LW = Math.max(0.16, lw * 1.6);
  flat(legN, rect(LW, 1.5, 0.5, 1), M.body); flat(legF, rect(LW, 1.5, 0.5, 1), M.body);
  flat(legN, rect(LW * 0.35, 1.5, 0.5, 1), M.rim, { z: 0.002 });
  const neck = [];
  for (let i = 0; i <= 20; i++) { const u = i / 20; neck.push([0.35 + 0.35 * Math.sin(u * 2.2), 0.25 + 1.1 * u]); }
  flat(b, strokeGeo(neck, Math.max(0.26, lw * 2.0)), M.body, { z: 0.002 });
  flat(b, strokeGeo(neck, Math.max(0.26, lw * 2.0) * 0.34), M.rim, { z: 0.004 });
  const head = group(b, { x: neck[20][0], y: neck[20][1] + 0.12, z: 0.005 });
  sil(head, circle(0.3, 24, 0, 0, 1.3));
  eye(head, 0.07, 0.09, 0.06);
  flat(head, poly([[0.18, 0.05], [0.8, -0.03], [0.18, -0.09]]), M.body, { z: 0.002 });
  return { root, b, head, legN, legF, mats: Object.values(M),
    pose(g, t, step = 0) { legN.rotation.z = 0.35 * Math.sin(step * Math.PI); legF.rotation.z = -0.35 * Math.sin(step * Math.PI); head.rotation.z = 0.25 * g; } };
}

// Tuubat: kotilo, jonka kuori on tuuban kello (Dehring).
export function tubaSnail(parent, sc = 1) {
  const { M, sil, eye, bar, lw } = kit(sc);
  const root = group(parent);
  const b = group(root);
  sil(b, poly([[-0.9, 0], [0.9, 0], [1.2, 0.15], [1.15, 0.35], [0.8, 0.3], [-0.8, 0.22]]));
  bar(b, 0.98, 0.3, 1.13, 0.8, 0.09, M.body);
  eye(b, 1.13, 0.82, 0.09);
  const shell = group(b, { x: -0.1, y: 0.75, z: 0.004 });
  sil(shell, circle(0.62, 36));
  flat(shell, strokeGeo(Array.from({ length: 40 }, (_, i) => { const a = i * 0.32; const r = 0.5 - i * 0.011; return [r * Math.cos(a), r * Math.sin(a)]; }), Math.max(0.075, lw * 0.9)), M.rim, { z: 0.004 });
  const bell = group(shell, { x: 0.2, y: 0.5, z: 0.006 });
  sil(bell, poly([[-0.12, 0], [0.12, 0], [0.25, 0.4], [0.6, 0.75], [-0.6, 0.75], [-0.25, 0.4]]));
  flat(bell, circle(0.6, 32, 0, 0.75, 0.2), M.rim, { z: 0.004 });
  flat(bell, circle(0.5, 32, 0, 0.76, 0.14), M.body, { z: 0.006 });
  return { root, b, bell, mats: Object.values(M), pose(g) { bell.rotation.z = -0.35 + 0.5 * g; } };
}

// Fagotit: sammakko, jonka takajalat ovat fagotin putkia.
export function bassoonFrog(parent, sc = 1) {
  const { M, sil, eye, bar, lw } = kit(sc);
  const root = group(parent);
  const b = group(root);
  sil(b, poly([[-0.65, -0.02], [-0.45, 0.55], [0.3, 0.6], [0.72, 0.2], [0.45, -0.1], [-0.4, -0.12]]));
  eye(b, 0.32, 0.62, 0.14);
  const leg = group(b, { x: -0.3, y: 0.05, z: 0.004 });
  const LH = Math.max(0.2, lw * 1.2);
  flat(leg, rect(1.3, LH, 1, 0.5), M.body);
  flat(leg, rect(1.3, LH * 0.3, 1, 0.5), M.rim, { z: 0.002 });
  const shin = group(leg, { x: -1.25 });
  flat(shin, rect(LH * 0.95, 1.0, 0.5, 1), M.body);
  flat(shin, rect(LH * 0.3, 1.0, 0.5, 1), M.rim, { z: 0.002 });
  flat(shin, poly([[-0.25, -1.0], [0.1, -1.0], [0.05, -0.9]]), M.body);
  bar(b, 0.32, 0, 0.4, -0.35, 0.09, M.body);
  return { root, b, leg, mats: Object.values(M), pose(g) { leg.rotation.z = -0.5 + 0.35 * g; b.position.y = -0.1 * g; } };
}

// Sordinoidut pasuunat: varis, nokkana vetoputki.
export function tromboneCrow(parent, sc = 1) {
  const { M, sil, eye, bar, lw } = kit(sc);
  const root = group(parent);
  const b = group(root);
  sil(b, poly([[-0.9, 0.12], [-0.45, 0.4], [0.2, 0.42], [0.45, 0.28], [0.3, 0.0], [-0.3, -0.15], [-0.95, -0.05]]));
  const head = group(b, { x: 0.42, y: 0.45, z: 0.003 });
  sil(head, circle(0.22, 20));
  eye(head, 0.07, 0.07, 0.07);
  const slide = group(head, { x: 0.15, y: -0.02, z: 0.004 });
  const SW = Math.max(0.085, lw * 0.7);
  flat(slide, rect(0.7, SW, 0, 0.5), M.body, { y: 0.075 });
  flat(slide, rect(0.7, SW, 0, 0.5), M.body, { y: -0.075 });
  const outer = group(slide, { x: 0.3 });
  flat(outer, rect(0.55, SW * 0.7, 0, 0.5), M.rim, { y: 0.075, z: 0.002 });
  flat(outer, rect(0.55, SW * 0.7, 0, 0.5), M.rim, { y: -0.075, z: 0.002 });
  flat(outer, rect(0.08, 0.2, 0, 0.5), M.rim, { x: 0.55, z: 0.002 });
  flat(head, circle(0.13, 16, 0.2, 0), M.rim, { z: 0.006 });
  bar(b, -0.03, -0.1, 0.0, -0.5, 0.08, M.body);
  bar(b, 0.11, -0.1, 0.15, -0.5, 0.08, M.body);
  return { root, b, head, mats: Object.values(M), pose(g) { outer.position.x = 0.15 + 0.5 * g; head.rotation.z = 0.15 * g; } };
}
