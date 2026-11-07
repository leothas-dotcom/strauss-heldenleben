// Sankari: johtaja (1. käyrätorvi) keihäineen ja viireineen. Viiri on keihään kärjen polku
// viimeiseltä ~1,3 sekunnilta (jälkiliike), ja sitä nostaa tuuli: viulut ja voimakkuus.
// Kaikki lasketaan aiemmista ajoista, joten ruutujen välillä ei ole tilaa.

import * as THREE from 'three';
import { C, ink, flat, poly, clamp } from './paper.js';
import { knight, poseKnight } from './puppets.js';

export function leader(parent, o = {}) {
  const P = knight(parent, o);
  const lanceMat = ink(C.black);
  const tipMat = ink(C.paper);
  const lance = new THREE.Group();
  parent.add(lance);
  const LEN = o.lance ?? 3.4;
  flat(lance, poly([[-0.025, -0.9], [0.025, -0.9], [0.025, LEN - 0.9], [-0.025, LEN - 0.9]]), lanceMat, { z: 0.05 });
  flat(lance, poly([[-0.07, LEN - 0.9], [0.07, LEN - 0.9], [0, LEN - 0.9 + 0.32]]), tipMat, { z: 0.051 });
  const NB = 28;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NB * 2 * 3), 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(NB * 2 * 2), 2));
  const idx = [];
  for (let k = 0; k < NB - 1; k++) { const a = 2 * k; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  geo.setIndex(idx);
  const bannerMat = ink(C.red, { shade: C.black, raster: 0 });
  const banner = new THREE.Mesh(geo, bannerMat);
  banner.frustumCulled = false;
  parent.add(banner);
  const tmp = new THREE.Vector3();
  const tmpE = new THREE.Vector3();

  // state(t) -> { x, y, facing, pose, t2 } ; wind(t) -> { x, y } tuulen nopeus (m/s)
  function place(t, state, wind, opts = {}) {
    const dt = opts.dt ?? 0.05;
    const trail = [];
    for (let k = NB - 1; k >= 0; k--) {
      const s = state(t - k * dt);
      P.root.position.set(s.x, s.y, s.z ?? 0);
      P.root.scale.x = s.facing ?? 1;
      poseKnight(P, s.pose, t, 0.3);
      P.root.updateMatrixWorld(true);
      P.handN.getWorldPosition(tmp);
      P.elN.getWorldPosition(tmpE);
      // keihään suunta: kyynärvarren suunta, mutta aina ylöspäin painottuen
      const dx = tmp.x - tmpE.x, dy = tmp.y - tmpE.y;
      let ax = dx * 0.6, ay = Math.abs(dy) * 0.4 + 1.0;
      if (s.lanceAng !== undefined) { ax = Math.sin(s.lanceAng); ay = Math.cos(s.lanceAng); }
      const l = Math.hypot(ax, ay);
      trail[k] = { hx: tmp.x, hy: tmp.y, dx: ax / l, dy: ay / l, z: (s.z ?? 0) + 0.05 };
    }
    const s0 = state(t);
    P.root.position.set(s0.x, s0.y, s0.z ?? 0);
    P.root.scale.x = s0.facing ?? 1;
    poseKnight(P, s0.pose, t, opts.capeWind ?? 0.3);
    const tr0 = trail[0];
    lance.position.set(tr0.hx, tr0.hy, tr0.z - 0.05);
    lance.rotation.z = -Math.atan2(tr0.dx, tr0.dy);
    lance.visible = !opts.noLance;
    // viiri
    const pos = geo.getAttribute('position');
    const tipOff = (LEN - 0.9) - 0.15;
    for (let k = 0; k < NB; k++) {
      const tr = trail[k];
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
  return { P, lance, banner, bannerMat, place, mats: [...P.mats, bannerMat] };
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
