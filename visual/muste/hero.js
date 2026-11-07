// Sankari: johtaja (1. käyrätorvi) keihäineen ja viireineen. Viiri on keihään kärjen polku
// viimeiseltä ~1,3 sekunnilta (jälkiliike), ja sitä nostaa tuuli: viulut ja voimakkuus.
// Kaikki lasketaan aiemmista ajoista, joten ruutujen välillä ei ole tilaa.
//
// Ote: keihään sijoitus ja käsien paikka tulevat samasta laskennasta (frame): lähempi käsi on keihään
// varrella (keihään origo on kämmenessä), kauempi käsi ratkaistaan käänteiskinematiikalla varrelle
// (armIK). Sama frame antaa kärjen radan (tipAt), joten muste, keihäs ja kädet eivät eriydy.

import * as THREE from 'three';
import { C, ink, flat, poly, clamp, smoothstep, mix } from './paper.js';
import { knight, poseKnight, handFK, armIK, bodyScale, kmix, KP0, poseBlendDur } from './puppets.js';
import { makeSash } from './sash.js';

// Rekisteri opastarkistusta varten (window.opasProbe): jokainen sankari paikkoineen.
export const LEADERS = [];
export { setSashDefault } from './sash.js';
export const GRIP_BELOW = 0.9;   // kämmen on 0,9 yksikköä keihään tyvestä (tyvi osoittaa maahan seisoessa)

// --- Asennonvahti: asento ei koskaan vaihdu yhdessä ruudussa (puppets.js POSE_BLEND) -------------------
// Tilafunktion asennosta etsitään hypyt (nivelkulman muutos > 0,3 rad 1/12 s:ssa, joka ei ole jatkuvaa liikettä:
// puolitushaku 1/12 s -> 0,65 ms ja ero edelleen > 0,08 rad). Hypyn jälkeen asento on edellisen asennon ja
// uuden asennon smoothstep-sekoitus poseBlendDur(opts.poseBlend) sekunnin ajan (0,8 s ... , oletus 1,5 s).
// Puhdas ajan funktio: hypyt haetaan tilafunktiosta joka kutsulla ikkunasta, ei tilaa ruutujen välillä.
// opts.poseBlend === false poistaa vahdin; opts.cuts = [t, ...] sallii hypyn leikkauksessa (uusi otto).
const JUMP_KEYS = ['lean', 'tilt', 'aN', 'eN', 'aF', 'eF', 'hN', 'kN', 'hF', 'kF', 'sx', 'palm'];
const JUMP_THR = 0.3, JUMP_FINE = 0.08, JUMP_STEP = 1 / 12;
const ANG = new Set(['lean', 'tilt', 'aN', 'eN', 'aF', 'eF', 'hN', 'kN', 'hF', 'kF']);
const wrapPi = (x) => x - 2 * Math.PI * Math.round(x / (2 * Math.PI));   // 2π:n ero on sama asento
// Suurin nivelmuutos asentojen välillä (kulmat modulo 2π). poseDeltaKey kertoo, mikä nivel muuttui eniten.
const poseDeltaKey = (a, b, P) => {
  let m = P ? Math.abs(handFK(P, a, true).hipY - handFK(P, b, true).hipY) : 0, mk = 'hipY';   // lantion korkeus (mounted/y-vaihto)
  for (const k of JUMP_KEYS) {
    const x = a[k] ?? (k === 'sx' ? 1 : KP0[k] ?? 0), y = b[k] ?? (k === 'sx' ? 1 : KP0[k] ?? 0);
    const d = Math.abs(ANG.has(k) ? wrapPi(x - y) : x - y);
    if (d > m) { m = d; mk = k; }
  }
  return [m, mk];
};
const poseDelta = (a, b, P) => poseDeltaKey(a, b, P)[0];
export function poseJumps(state, a, b, cuts = [], P = null) {
  const out = [];
  let tp = a, pp = state(a).pose;
  for (let tt = a + JUMP_STEP; tp < b; tt += JUMP_STEP) {
    const tc = Math.min(tt, b), pc = state(tc).pose;
    if (poseDelta(pp, pc, P) > JUMP_THR) {
      let lo = tp, hi = tc, plo = pp, phi = pc;
      for (let i = 0; i < 7; i++) {
        const m = (lo + hi) / 2, pm = state(m).pose;
        if (poseDelta(plo, pm, P) >= poseDelta(pm, phi, P)) { hi = m; phi = pm; } else { lo = m; plo = pm; }
      }
      if (poseDelta(plo, phi, P) > JUMP_FINE && !cuts.some((c) => Math.abs(c - hi) < 0.1)) out.push({ t: lo, pre: plo, d: poseDelta(plo, phi, P), k: poseDeltaKey(plo, phi, P)[1] });
    }
    tp = tc; pp = pc;
  }
  return out;
}
const smooth01 = (u) => { u = clamp(u); return u * u * (3 - 2 * u); };
function guardState(state, jumps0, dur, P) {
  // Vain yksittäiset asennonvaihdot pehmennetään. Jonon hyppyjä (toisto alle `dur` välein: askellus, soudun
  // yksittäiset kulmahypyt) ei kosketa, koska 1,5 s:n sekoitus tekisi niistä sutta; ne ovat osan korjattavia
  // (poseskan-raportti, runs/muste-1230/perusta3/pyynnot_osille.md). Ikkuna ulottuu `dur` eteenpäin, joten
  // yksittäisyys tiedetään myös hypyn jälkeisiltä hetkiltä.
  const jumps = jumps0.filter((j) => !jumps0.some((o) => o !== j && Math.abs(o.t - j.t) < dur));
  if (!jumps.length) return state;
  return (tt) => {
    const s = state(tt);
    let J = null;
    for (const j of jumps) if (j.t <= tt) J = j;
    if (!J || tt - J.t >= dur) return s;
    const u = smooth01((tt - J.t) / dur);
    const pb = { ...s.pose, ...kmix(J.pre, s.pose, u) };
    // lantion korkeus siirtyy myös silloin, kun asento vaihtaa mounted-lipun (ratsaille nousu): y säädetään sekoituksen mukaan
    const hip = (q) => handFK(P, q, true).hipY;
    pb.y = (pb.y ?? 0) + mix(hip(J.pre), hip(s.pose), u) - hip(pb);
    return { ...s, pose: pb };
  };
}

export function leader(parent, o = {}) {
  const P = knight(parent, o);
  const lanceMat = ink(C.black);
  const tipMat = ink(C.paper);
  const lance = new THREE.Group();
  parent.add(lance);
  const LEN = o.lance ?? 3.4;
  flat(lance, poly([[-0.025, -GRIP_BELOW], [0.025, -GRIP_BELOW], [0.025, LEN - GRIP_BELOW], [-0.025, LEN - GRIP_BELOW]]), lanceMat, { z: 0.05 });
  flat(lance, poly([[-0.07, LEN - GRIP_BELOW], [0.07, LEN - GRIP_BELOW], [0, LEN - GRIP_BELOW + 0.32]]), tipMat, { z: 0.051 });
  const sash = makeSash(P.torso);   // kumppanin viiva ritarin ympärillä (sash.js), torson lapsena eli FK:n mukana
  const NB = o.nb ?? 28;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NB * 2 * 3), 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(NB * 2 * 2), 2));
  const idx = [];
  for (let k = 0; k < NB - 1; k++) { const a = 2 * k; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  geo.setIndex(idx);
  const bannerMat = ink(o.bannerColor ?? C.red, { shade: C.black, raster: 0 });
  const banner = new THREE.Mesh(geo, bannerMat);
  banner.frustumCulled = false;
  parent.add(banner);
  const TIP = (LEN - GRIP_BELOW) + 0.32;   // kärjen etäisyys kädestä keihään suunnassa
  // viimeksi annettu tilafunktio (puhdas ajan funktio): tipAt(tt) lukee sen uudelleen hetkellä tt
  const cur = { state: null, raw: null, opts: {} };

  // Keihään suunta kädestä: kyynärvarren suunta ylöspäin painottuen, tai annettu kulma (0 = pysty).
  function lanceDir(s, dx, dy) {
    const ang = s.lanceAng ?? (s.pose && s.pose.lanceAng);
    let ax = dx * 0.6, ay = Math.abs(dy) * 0.4 + 1.0;
    if (ang !== undefined && ang !== null) { ax = Math.sin(ang); ay = Math.cos(ang); }
    const l = Math.hypot(ax, ay) || 1;
    return [ax / l, ay / l];
  }
  // Yksi laskenta: asennosta kämmenen paikka, keihään suunta ja kauemman käden ote (maailmassa).
  // armed = keihäs kädessä: kauempi käsi ratkaistaan varrelle (ei muuttaa asentoa, kun keihäs puuttuu).
  function frame(s, armed = true) {
    const fc = s.facing ?? 1;
    const p0 = s.pose;
    const ex = bodyScale(p0, fc);
    const fk = handFK(P, p0, true);
    const hx = s.x + ex * fk.hand[0], hy = s.y + fk.hand[1];
    let [dx, dy] = lanceDir(s, ex * (fk.hand[0] - fk.el[0]), fk.hand[1] - fk.el[1]);
    let pose = p0;
    if (armed) {
      // kauempi käsi varrelle (nuken omissa koordinaateissa; kääntyessä leveyskerroin ex ei vääristä).
      const sf = handFK(P, p0, false).sh;
      let ux = dx / ex, uy = dy;
      { const l = Math.hypot(ux, uy) || 1; ux /= l; uy /= l; }
      // Jos varsi on kauempaa olkapäältä yli ulottuman (0,58), varsi kallistuu lähemmän kämmenen ympäri olkapäätä kohti
      // (enintään 0,6 rad): molemmat kämmenet pysyvät varrella, keihään suunta muuttuu vain vähän.
      const vx = sf[0] - fk.hand[0], vy = sf[1] - fk.hand[1], r = Math.hypot(vx, vy);
      if (r > 0.58) {
        const phiMax = Math.asin(Math.min(1, 0.58 / r));
        let d = Math.atan2(uy, ux) - Math.atan2(vy, vx);
        d = Math.atan2(Math.sin(d), Math.cos(d));
        if (Math.abs(d) > Math.PI / 2) d -= Math.sign(d) * Math.PI;   // viiva, ei vektori: pienempi kulma v:hen
        if (Math.abs(d) > phiMax) {
          // Jatkuva: kun |d| lähestyy pi/2, pienemmän kulman haara vaihtuu ja rot vaihtaisi merkkiä yhdessä ruudussa
          // (keihään kärki hyppäsi 2-3 yksikköä; osa 4:n löydös). Paino w vie korjauksen nollaan ennen vaihtoa.
          const w = 1 - smoothstep(Math.PI / 2 - 0.35, Math.PI / 2, Math.abs(d));
          const rot = clamp(Math.abs(d) - phiMax, 0, 0.6) * -Math.sign(d) * w;
          const c = Math.cos(rot), sn = Math.sin(rot);
          [ux, uy] = [ux * c - uy * sn, ux * sn + uy * c];
          const wx = ux * ex, wy = uy, wl = Math.hypot(wx, wy) || 1;   // takaisin maailmaan
          [dx, dy] = [wx / wl, wy / wl];
        }
      }
      const proj = vx * ux + vy * uy;
      let g = clamp(proj, -(GRIP_BELOW - 0.1), 0.6);
      if (Math.abs(g) < 0.16) g = g < 0 ? -0.16 : 0.16;
      let tx = fk.hand[0] + ux * g, ty = fk.hand[1] + uy * g;
      // varsi yhä liian kaukana toiselle kädelle: käsi vartalolle (keskirinta)
      const reach = Math.hypot(tx - sf[0], ty - sf[1]);
      const rel = smoothstep(P.d.upper + P.d.fore + 0.03, P.d.upper + P.d.fore + 0.05, reach);
      cur.rel = rel; cur.reach = reach;
      if (rel > 0) {
        const a0 = -p0.lean, hip = handFK(P, p0, true).hipY;
        const chest = [0.1 * Math.cos(a0) - 0.45 * Math.sin(a0), hip + 0.1 * Math.sin(a0) + 0.45 * Math.cos(a0)];   // rinnan keskikohta (torson koordinaatit 0,1; 0,45)
        tx = mix(tx, chest[0], rel); ty = mix(ty, chest[1], rel);
      }
      const ik = armIK(P, p0, false, tx, ty);
      pose = { ...p0, aF: ik.a, eF: ik.e };
    }
    return { pose, hx, hy, dx, dy, z: (s.z ?? 0) + 0.05, ex };
  }
  // Keihään kärki maailmassa hetkellä tt, laskettuna suoraan asennosta (ei näkymäpuuta, ei tilaa).
  function tipAt(tt) {
    if (!cur.state) return null;
    const f = frame(cur.state(tt), !cur.opts.noLance);
    return { x: f.hx + f.dx * TIP, y: f.hy + f.dy * TIP, z: f.z, hx: f.hx, hy: f.hy, dx: f.dx, dy: f.dy };
  }

  // Viirin vapaa pää (häntä) maailmassa hetkellä tt: sama laskenta kuin place():n viiri viimeisellä pisteellä (k = NB-1).
  // Muste alkaa tästä, ei keihään kärjestä.
  function tailAt(tt) {
    if (!cur.state || !cur.wind) return null;
    const o = cur.opts, dt = o.dt ?? 0.05, k = NB - 1;
    const f = frame(cur.state(tt - (o.rigid ? 0 : k * dt)), !o.noLance);
    const w = cur.wind(tt - k * dt);
    const age = k * dt * (o.windScale ?? 1), tipOff = (LEN - GRIP_BELOW) - 0.15;
    const wid = (o.width ?? 0.9) * 0.4;
    const tx = f.hx + f.dx * tipOff + w.x * age;
    const ty = f.hy + f.dy * tipOff + w.y * age + Math.sin(k * 0.6 - tt * 6.0) * 0.12 * (0.4 + Math.hypot(w.x, w.y) * 0.3);
    return { x: tx - f.dx * wid / 2, y: ty - f.dy * wid / 2, z: f.z };
  }
  // state(t) -> { x, y, facing, pose, t2 } ; wind(t) -> { x, y } tuulen nopeus (m/s)
  function place(t, state0, wind, opts = {}) {
    const dt = opts.dt ?? 0.05;
    // asennonvahti: hypyt ikkunasta [vanhin viirin piste - siirtymän kesto, t]
    let state = state0;
    if (opts.poseBlend !== false) {
      const dur = poseBlendDur(opts.poseBlend);
      state = guardState(state0, poseJumps(state0, t - (NB - 1) * dt - dur - JUMP_STEP, t + dur, opts.cuts, P), dur, P);
    }
    cur.state = state; cur.raw = state0; cur.opts = opts; cur.wind = wind;
    const armed = !opts.noLance;
    const trail = [];
    for (let k = NB - 1; k >= 0; k--) {
      const f = frame(state(t - k * dt), armed);
      trail[k] = { hx: f.hx, hy: f.hy, dx: f.dx, dy: f.dy, z: f.z };
    }
    const s0 = state(t);
    const f0 = frame(s0, armed);
    P.root.position.set(s0.x, s0.y, s0.z ?? 0);
    P.root.scale.x = s0.facing ?? 1;
    poseKnight(P, f0.pose, t, opts.capeWind ?? 0.3);
    const tr0 = trail[0];
    lance.position.set(tr0.hx, tr0.hy, tr0.z - 0.05);
    lance.rotation.z = -Math.atan2(tr0.dx, tr0.dy);
    lance.visible = !opts.noLance;
    sash.set(t, opts.sash, opts.sashSignal);
    // viiri
    const pos = geo.getAttribute('position');
    const tipOff = (LEN - GRIP_BELOW) - 0.15;
    for (let k = 0; k < NB; k++) {
      const tr = opts.rigid ? trail[0] : trail[k];   // rigid: viiri roikkuu vain nykyisestä kärjestä (nousevat tovereiden keihäät eivät vedä häntää)
      const u = k / (NB - 1);
      const w = wind(t - k * dt);
      const age = k * dt * (opts.windScale ?? 1);
      const tx = tr.hx + tr.dx * tipOff + w.x * age;
      const ty = tr.hy + tr.dy * tipOff + w.y * age + Math.sin(k * 0.6 - t * 6.0) * 0.12 * u * (0.4 + Math.hypot(w.x, w.y) * 0.3);
      const wid = (opts.width ?? 0.9) * (1 - 0.6 * u);
      pos.setXYZ(2 * k, tx, ty, tr.z + 0.01);
      pos.setXYZ(2 * k + 1, tx - tr.dx * wid, ty - tr.dy * wid, tr.z + 0.01);
    }
    pos.needsUpdate = true;
    banner.visible = !opts.noBanner;
  }
  // Mittaus (test_poses, opasProbe): kämmenet ja varsi maailmassa, suoraan näkymäpuusta (ei FK:sta).
  function grip() {
    const v = new THREE.Vector3();
    P.root.updateMatrixWorld(true);
    lance.updateMatrixWorld(true);
    const hand = (near) => { (near ? P.handN : P.handF).getWorldPosition(v); return [v.x, v.y]; };
    const end = (y) => { v.set(0, y, 0).applyMatrix4(lance.matrixWorld); return [v.x, v.y]; };
    return { near: hand(true), far: hand(false), a: end(-GRIP_BELOW), b: end(LEN - GRIP_BELOW), rel: cur.rel, reach: cur.reach };
  }
  // Mittaus: tilafunktion asentohypyt ikkunassa (vahdin jälkeen niitä ei pitäisi jäädä: poseJumpsGuarded)
  const jumpsIn = (a, b) => (cur.raw ? poseJumps(cur.raw, a, b, cur.opts.cuts, P) : []);
  const jumpsGuarded = (a, b) => (cur.state ? poseJumps(cur.state, a, b, cur.opts.cuts, P) : []);
  const L = { P, lance, banner, bannerMat, sash, place, tipAt, tailAt, grip, jumpsIn, jumpsGuarded, tipLocal: TIP, mats: [...P.mats, bannerMat, sash.mat], parent };
  LEADERS.push(L);
  return L;
}

// Pehmeä käyrä (C2): kameran ja liikkeiden helpotus.
export const ease = (x) => { const u = clamp(x); return u * u * u * (u * (u * 6 - 15) + 10); };
export const lerp3 = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
// Kameran otto avainkohdista [{pos, look, fov}]: kaksi avainta = pehmeä siirto, useampi =
// Catmull-Rom-käyrä, jota kuljetaan pehmeästi kiihtyen ja hidastaen (ei pysähdyksiä välissä).
// Oton liike: pehmeä, mutta ei ala eikä pääty seisovaan kuvaan (alku- ja loppunopeus 0,3),
// jotta liike pysyy käynnissä leikkausten yli (kuvakäsikirjoitus, luku 6).
export const glide = (u) => 0.3 * clamp(u) + 0.7 * ease(u);
export function camPath(keys, shape = glide) {
  const V = (a) => new THREE.Vector3(...a);
  const pc = keys.length > 2 ? new THREE.CatmullRomCurve3(keys.map((k) => V(k.pos)), false, 'centripetal') : null;
  const lc = keys.length > 2 ? new THREE.CatmullRomCurve3(keys.map((k) => V(k.look)), false, 'centripetal') : null;
  return (u) => {
    const w = shape(u);
    const fovAt = () => {
      const x = w * (keys.length - 1);
      const i = Math.min(keys.length - 2, Math.floor(x));
      const f = x - i;
      const a = keys[i].fov ?? 40, b = keys[i + 1].fov ?? a;
      return a + (b - a) * f;
    };
    if (!pc) return { pos: lerp3(keys[0].pos, keys[1].pos, w), look: lerp3(keys[0].look, keys[1].look, w), fov: fovAt() };
    const p = pc.getPoint(w), l = lc.getPoint(w);
    return { pos: [p.x, p.y, p.z], look: [l.x, l.y, l.z], fov: fovAt() };
  };
}
// Tasainen kulku (ei helpotusta): pitkät lennot, jotka jatkuvat leikkauksen yli.
export const linear = (x) => clamp(x);
