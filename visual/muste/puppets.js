// Paperinuket (Lotte Reiniger): nivelet kiertyvät kuvan tasossa. Hahmot katsovat +x-suuntaan;
// facing = -1 peilaa. Kulmat: raajat 0 = suoraan alas, positiivinen = eteenpäin.
//
//   Käyrätorviritari (sankarit): rinnassa torven kierre, päässä torven kello kypäränä.
//   Hevonen: laukka, käynti, takajaloille nousu.
//   Kriitikko-olennot (Porter): hyttynen, sorsa, rupikonna, heinäsirkka, varis, sammakko,
//   ja Don Quijote -nukke (sankarin pilkkakuva laihoista ritari- ja hevosnukeista).

import * as THREE from 'three';
import { C, ink, poly, circle, limb, flat, group, outline, pennantGeo, waveMat, TAU, clamp, mix } from './paper.js';
import { makeSash } from './sash.js';

// --- Käyrätorviritari -------------------------------------------------------------------------
export const KP0 = { lean: 0, tilt: 0, aN: 0.15, eN: 0.25, aF: -0.1, eF: 0.25, hN: 0.05, kN: 0.05, hF: -0.05, kF: 0.05, y: 0, cape: 0.15, coil: 0 };
export const kpose = (o = {}) => ({ ...KP0, ...o });
// Lisäavaimet (eivät KP0:ssa): sx = leveyskerroin (kääntyminen), lanceAng = keihään kulma (rad, 0 = pysty,
// positiivinen = eteen), palm = kämmen auki 0..1, hands = keihäs molemmissa käsissä 0..1.
const EXTRA = { sx: 1, lanceAng: null, palm: 0, hands: 0 };
export function kmix(a, b, t) {
  const o = {};
  for (const k in KP0) o[k] = a[k] + (b[k] - a[k]) * t;
  for (const k in EXTRA) {
    const x = a[k] ?? EXTRA[k], y = b[k] ?? EXTRA[k];
    if (x === null || x === undefined) { if (y !== null && y !== undefined) o[k] = y; }
    else if (y === null || y === undefined) o[k] = x;
    else o[k] = x + (y - x) * t;
  }
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
  // kämmen ojossa matalalla, kämmen ylöspäin (ei suoraa kättä ylös)
  offer: kpose({ lean: 0.08, tilt: -0.15, aN: 0.75, eN: 0.35, aF: -0.1, eF: 0.3, palm: 1 }),
  // keihäs pystyssä molemmin käsin pään yllä: molemmat kyynärpäät koukussa, keihäs pystysuora
  lanceBoth: kpose({ lean: -0.06, tilt: 0.3, aN: 2.85, eN: 0.55, aF: 2.7, eF: 0.7, lanceAng: 0.0, hands: 1 }),
  // keihäs nostettu iskua varten: kärki hieman taakse, ote korkealla, kyynärpää koukussa
  lanceLift: kpose({ lean: -0.12, tilt: 0.1, aN: 2.6, eN: 1.35, aF: 0.3, eF: 0.5, hN: 0.1, hF: -0.15, lanceAng: -0.6 }),
  // soutu: istuu, kädet edessä (A) ja vedettynä taakse (B)
  rowA: kpose({ hN: 1.45, kN: 1.6, hF: 1.4, kF: 1.8, lean: 0.45, tilt: -0.2, aN: 1.25, eN: 0.25, aF: 1.15, eF: 0.3 }),
  rowB: kpose({ hN: 1.45, kN: 1.6, hF: 1.4, kF: 1.8, lean: -0.15, tilt: 0.0, aN: 0.35, eN: 1.5, aF: 0.3, eF: 1.5 }),
  // kääntymisen keskivaihe: kädet lähellä vartaloa
  edge: kpose({ aN: 0.2, eN: 0.5, aF: -0.1, eF: 0.4, hN: 0.02, hF: -0.02 }),
};

// --- Asentokirjasto: jokainen asento on funktio vaiheesta u (0..1) ------------------------------
// Siirtymät ovat pehmeitä (smoothstep), eivätkä sisällä ponnahduksia. Kutsuja antaa u:n fraasin
// mittaisena (esim. u = smoothstep(fraasin alku, fraasin loppu, t)), ei iskusta. Kehä-asennot (kävely,
// soutu) ovat jaksollisia: u = 1 on sama kuin u = 0.
const E = (u) => { u = clamp(u); return u * u * (3 - 2 * u); };
const CYC = (u) => 0.5 - 0.5 * Math.cos(TAU * u);
export const POSES = {
  // seisonta: paino siirtyy hitaasti jalalta toiselle (u = hengityksen vaihe)
  seisonta: (u) => kmix(kpose({ hN: 0.03, hF: -0.04, lean: -0.01 }), kpose({ hN: -0.03, hF: 0.04, lean: 0.01, aN: 0.2 }), CYC(u)),
  // kävely: yksi askelpari
  kavely: (u) => kmix(KP.stepA, KP.stepB, CYC(u)),
  // kääntyminen profiiliin: alussa syrjittäin (kapea), lopussa täysi profiili
  kaantyminen_profiiliin: (u) => ({ ...kmix(KP.edge, KP.stand, E(u)), sx: 0.12 + 0.88 * E(u) }),
  // kääntyminen selkään: profiili kapenee syrjäksi; kutsuja vaihtaa selkäkuvaan (knightBack) u >= 0.5
  // ja avaa sen leveyden samalla käyrällä (back)
  kaantyminen_selkaan: (u) => ({ ...kmix(KP.stand, KP.edge, E(u)), sx: Math.max(0.12, 1 - 0.88 * E(Math.min(1, 2 * u))), back: E(Math.max(0, 2 * u - 1)) }),
  polvistuminen: (u) => kmix(KP.stand, KP.kneel, E(u)),
  istuminen: (u) => kmix(KP.stand, KP.sit, E(u)),
  // soutu: yksi veto (eteen kurotus -> veto taakse). Kädet ovat airon varrella: airo kiertyy hankaimen (OAR.lock, nuken
  // omissa koordinaateissa) ympäri kulmaan oarAng, ja molemmat käsivarret ratkaistaan sen varrelle (armIK).
  soutu: (u) => {
    const s = Math.sin(TAU * u);
    const base = kmix(KP.rowA, KP.rowB, 0.5 + 0.5 * s);
    const a = OAR.mid + OAR.swing * s;
    return { ...base, ...armsOnOar(base, a), oarAng: a };
  },
  // keihään isku maahan: nosto (0..0.55) ja isku (0.55..1); kärki osuu maahan u = 1
  keihaan_isku_maahan: (u) => (u < 0.55 ? kmix({ ...KP.proud, lanceAng: 0.1 }, KP.lanceLift, E(u / 0.55)) : kmix(KP.lanceLift, { ...KP.plant, lanceAng: 0.0 }, E((u - 0.55) / 0.45))),
  kammenen_ojennus: (u) => kmix(KP.stand, KP.offer, E(u)),
  kellon_nosto: (u) => kmix(KP.proud, KP.call, E(u)),
  keihaan_nosto_molemmin: (u) => kmix({ ...KP.stand, lanceAng: 0.25 }, KP.lanceBoth, E(u)),
};
export const POSE_NAMES = Object.keys(POSES);

// --- Asennonvaihto oton sisällä: aina fraasin mittainen, pehmeä siirtymä ----------------------------
// Sääntö (perusta3): asento ei vaihdu yhdessä ruudussa. Siirtymä kestää vähintään POSE_BLEND_MIN (0,8 s),
// oletus POSE_BLEND (1,5 s), ja on smoothstep. Hyppy on sallittu vain leikkauksessa (uusi otto).
// Kaksi tapaa, molemmat puhtaita ajan funktioita:
//   1. poseSeq(keys): asentolista ankkuriaikoineen -> pose(t). keys = [[t0, pose, dur?], ...] aikajärjestyksessä;
//      pose voi olla asento tai funktio (t) -> asento (esim. kävelyjakso). Siirtymä edellisestä asennosta
//      uuteen alkaa avaimen ajasta t0 ja kestää dur.
//      const stateOf = poseSeq([[0, KP.stand], [S.A('gef_rakkaus_hiljaa'), KP.sit], [S.A('gef_hiljenee'), STAND_BOAT, 2.4]]);
//   2. poseSwitch(t, tSwitch, from, to, dur?): kahden asennon vaihto, yksi sulavasti kerrallaan.
//   Lisäksi hero.place() vahtii jokaisen kutsun (opts.poseBlend, hero.js): jos tilafunktio hyppää asennossa
//   (esim. useampi kmix-ikkuna vaihtaa kerralla), hyppy pehmennetään samalla säännöllä.
export const POSE_BLEND_MIN = 0.8, POSE_BLEND = 1.5;
export const poseBlendDur = (d) => clamp(d ?? POSE_BLEND, POSE_BLEND_MIN, 8);
export function poseSwitch(t, tSwitch, from, to, dur) {
  const u = E((t - tSwitch) / poseBlendDur(dur));
  const f = typeof from === 'function' ? from(t) : from, g = typeof to === 'function' ? to(t) : to;
  if (u <= 0) return f;
  if (u >= 1) return g;
  return { ...f, ...g, ...kmix(f, g, u) };
}
export function poseSeq(keys) {
  if (!keys.length) throw new Error('poseSeq: tyhjä lista');
  for (let i = 1; i < keys.length; i++) if (!(keys[i][0] > keys[i - 1][0])) throw new Error(`poseSeq: ajat eivät kasva (avain ${i})`);
  const at = (p, t) => (typeof p === 'function' ? p(t) : p);
  return (t) => {
    let i = keys.length - 1;
    while (i > 0 && t < keys[i][0]) i--;
    if (i === 0) return at(keys[0][1], t);
    // edellinen avain pysyy käynnissä siirtymän ajan (kävelyjakso ei jähmety), uusi avain kasvaa sisään
    return poseSwitch(t, keys[i][0], keys[i - 1][1], keys[i][1], keys[i][2]);
  };
}

// Airo: hankain (kiertopiste) nuken omissa koordinaateissa, kämmenten paikat varrella hankaimesta sisäänpäin ja
// airon kulma (0 = lapa suoraan alas, + = lapa eteen). loc_river.js käyttää samaa geometriaa veneen koordinaateissa.
export const OAR = { lock: [0.5, 0.38], grips: [0.9, 1.15], mid: 0.45, swing: 0.5, inboard: 1.5, outboard: 3.2 };
export const oarDir = (a) => [-Math.sin(a), Math.cos(a)];   // sisäänpäin (kämmenet), lapa on vastakkaiseen suuntaan
export function armsOnOar(p, a) {
  const P = { d: DIMK };
  const [dx, dy] = oarDir(a);
  const at = (g) => [OAR.lock[0] + dx * g, OAR.lock[1] + dy * g];
  const n = armIK(P, p, true, ...at(OAR.grips[0])), f = armIK(P, p, false, ...at(OAR.grips[1]));
  return { aN: n.a, eN: n.e, aF: f.a, eF: f.e };
}

// Käden ja kyynärpään paikka nuken omissa koordinaateissa (jalat y = 0, kasvot +x) suoraan asennosta,
// ilman näkymäpuuta: keihään kärjen rata ajan funktiona (brush.js tipTrail) lasketaan tällä, ja
// hero.js sijoittaa keihään samasta laskennasta (ote on yksi laskenta, ei kahta).
const rot2 = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
export function handFK(P, p, near = true) {
  const d = P.d;
  let hipY;
  if (!(p.mounted ?? P.mounted)) {
    const leg = (h, k) => { const ky = -d.thigh * Math.cos(h); return Math.min(ky - 0.06, ky - d.shin * Math.cos(h - k) - 0.05); };
    hipY = -Math.min(leg(p.hN, p.kN), leg(p.hF, p.kF)) + p.y;
  } else hipY = p.y;
  const a0 = -p.lean;
  const [shx, shy] = rot2(near ? 0.04 : -0.04, d.torso - 0.06, a0);
  const a1 = a0 + (near ? p.aN : p.aF);
  const [ux, uy] = rot2(0, -d.upper, a1);
  const a2 = a1 + (near ? p.eN : p.eF);
  const [fx, fy] = rot2(0, -d.fore, a2);
  const sh = [shx, hipY + shy];
  const el = [shx + ux, hipY + shy + uy];
  return { sh, el, hand: [el[0] + fx, el[1] + fy], hipY };
}
// Vaakakerroin, jolla nuken paikalliset x-koordinaatit tulevat maailmaan (poseKnight: sx kääntymisessä).
export const bodyScale = (p, facing = 1) => (p.sx !== undefined ? (facing < 0 ? -1 : 1) * Math.max(0.05, p.sx) : facing);

// Käänteiskinematiikka: kulmat (aN/eN tai aF/eF), joilla käsi osuu kohtaan (tx, ty) nuken omissa
// koordinaateissa. Kahdesta ratkaisusta valitaan se, joka on lähempänä asennon omaa kulmaa (ei hyppyjä).
export function armIK(P, p, near, tx, ty) {
  const d = P.d, a0 = -p.lean;
  const [sx, sy] = handFK(P, p, near).sh;
  const dx = tx - sx, dy = ty - sy;
  const r = clamp(Math.hypot(dx, dy), Math.abs(d.upper - d.fore) + 1e-3, d.upper + d.fore - 1e-3);
  const phi = Math.atan2(dx, -dy);
  const b = Math.acos(clamp((d.upper * d.upper + r * r - d.fore * d.fore) / (2 * d.upper * r), -1, 1));
  const g = Math.acos(clamp((d.fore * d.fore + r * r - d.upper * d.upper) / (2 * d.fore * r), -1, 1));
  const curA = near ? p.aN : p.aF, curE = near ? p.eN : p.eF;
  const wrap = (x, ref) => x + TAU * Math.round((ref - x) / TAU);
  // Kyynärpää taipuu aina eteenpäin (e > 0): ratkaisu s = -1. Aiempi "lähempi nykyistä kulmaa" -valinta vaihtoi
  // kyynärpään taittosuuntaa kesken liikkeen (soutu: e hyppäsi ~2 rad), joka oli näkyvä napsahdus.
  let best = null;
  for (const s of [-1]) {
    const a1 = phi + s * b, a2 = phi - s * g;
    const a = wrap(a1 - a0, curA), e = wrap(a2 - a1, curE);
    best = { a, e, cost: 0 };
  }
  return { a: best.a, e: best.e };
}
// Vartalon etäisyys maailmanpisteestä (näkymäpuusta): 0 = pisteen kohdalla on vartalo (torso tai tunika).
// Mittaus (test_poses, gripProbe): ei käytä FK:ta, joten se tarkistaa sekä FK:n että nuken rakenteen.
export function bodyDist(P, w) {
  const d = P.d, tw = 0.27, ww = 0.17;
  P.root.updateMatrixWorld(true);
  const polys = [
    [P.torso, [[-ww, 0.02], [ww, 0.02], [tw, d.torso], [-tw * 0.95, d.torso]]],   // torso
    [P.hip, [[-0.2, 0.06], [0.2, 0.06], [0.27, -0.3], [-0.27, -0.3]]],              // tunika
  ];
  let best = Infinity;
  for (const [node, poly] of polys) {
    const q = node.worldToLocal(new THREE.Vector3(w[0], w[1], 0));
    const x = q.x, y = q.y;
    let inside = false, dm = Infinity;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [x1, y1] = poly[i], [x2, y2] = poly[j];
      if ((y1 > y) !== (y2 > y) && x < ((x2 - x1) * (y - y1)) / (y2 - y1) + x1) inside = !inside;
      const ex = x2 - x1, ey = y2 - y1;
      const t = clamp(((x - x1) * ex + (y - y1) * ey) / (ex * ex + ey * ey));
      dm = Math.min(dm, Math.hypot(x - x1 - t * ex, y - y1 - t * ey));
    }
    best = Math.min(best, inside ? 0 : dm);
  }
  return best;
}

// Selkäkuvan keihään ote (mittaus): kämmenen (handR, näkymäpuusta) etäisyys keihään varresta (tyvi below alle, kärki above yli).
export function backGrip(B, below, above) {
  const v = new THREE.Vector3();
  B.root.updateMatrixWorld(true);
  B.handR.getWorldPosition(v);
  const h = [v.x, v.y];
  const end = (y) => { v.set(0, y, 0).applyMatrix4(B.lance.matrixWorld); return [v.x, v.y]; };
  const a = end(-below), b = end(above);
  const ex = b[0] - a[0], ey = b[1] - a[1];
  const u = clamp(((h[0] - a[0]) * ex + (h[1] - a[1]) * ey) / (ex * ex + ey * ey));
  return { tyyppi: 'keihäs selkä', nakyy: B.root.visible, lahempi: Math.round(1000 * Math.hypot(h[0] - a[0] - u * ex, h[1] - a[1] - u * ey)) / 1000 };
}

// Rekisteri opastarkistusta varten (window.opasProbe): kaikki nuket, joista luetaan näkyvyys ja asento.
export const PUPPETS = [];
// Selkäkuvien vyö (sash.js oletus) päivitetään yhdestä paikasta joka ruudulla: puhdas ajan funktio.
export const updateBackSashes = (t, so) => { for (const P of PUPPETS) if (P.kind === 'back' && P.sash) P.sash.set(t, so); };

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
  // kämmen: näkyy vain ojennuksessa (palm > 0), litteä soikio kämmen ylöspäin
  const palm = flat(handN, poly([[-0.05, 0.02], [0.16, 0.03], [0.2, 0.0], [0.16, -0.03], [-0.05, -0.02]]), M.limb, { z: 0.002 });
  palm.visible = false;
  const P = { root, hip, torso, head, bell, shN, elN, shF, elF, hpN, knN, hpF, knF, handN, handF, palm, capeM, M, d, mounted: false, kind: 'knight' };
  P.mats = Object.values(M);
  PUPPETS.push(P);
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
  // kääntyminen: leveyskerroin suunnan päälle (kutsuja asettaa root.scale.x = facing ennen tätä)
  if (p.sx !== undefined) P.root.scale.x = (P.root.scale.x < 0 ? -1 : 1) * Math.max(0.05, p.sx);
  const palm = p.palm ?? 0;
  P.palm.visible = palm > 0.02;
  if (P.palm.visible) { P.palm.scale.set(palm, 1, 1); P.palm.rotation.z = -(p.aN + p.eN - p.lean) + 0.15; }
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
  // keihäs: ryhmä on oikean käden kämmenessä (olkapää + varsi kulmassa a), varsi kulkee kämmenen kautta
  // (kutsuja lisää sen lapsiksi varren: tyvi 0,9 kämmenen alapuolella). hold(a, rot) asettaa kulman ja keihään.
  const lance = group(root, { z: 0.03 });
  const hold = (a, rot = 0) => {
    armR.rotation.z = a;
    const hx = 0.33 + 0.66 * Math.sin(a), hy = 1.72 - 0.66 * Math.cos(a);
    lance.position.set(hx, hy, 0.03);
    lance.rotation.z = rot;
    return [hx, hy];
  };
  // kumppanin viiva selässä (sash.js): päivittyy main.js:n joka ruudulla (updateBackSashes), oletuksena samalla ajalla kuin sankarilla
  const sash = makeSash(root, { back: true, z: 0.025 });
  const B = { root, head, armL, armR, handR, lance, hold, capeM, M, sash, mats: [...Object.values(M), sash.mat], kind: 'back' };
  PUPPETS.push(B);
  return B;
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
