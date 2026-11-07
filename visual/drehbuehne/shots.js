// Kamera ja leikkaus kuin musiikkivideossa: jokaisella lohkolla on omat kuvakulmansa, ja leikkaukset
// osuvat tahtiviivoille (rauhallisissa kohdissa pidemmät otot, huipennuksissa lyhyemmät).
// Erityisleikkaukset: neulan lasku, neljä jähmettymistä, dominanttiseptimi, jokainen uusi vastustaja.

import * as THREE from 'three';
import { clamp, smoothstep, hash1, mix } from '../util.js';

const LEAD = 1 / 30;
const E = (x) => x * x * (3 - 2 * x);

// [kuvakulmat, tahteja per otto]
const CUTS = {
  rise: [['heroLow'], 99],
  wake: [['front', 'troupe:violins', 'overhead', 'heroMed', 'lowFront'], 2],
  drums: [['drums', 'front', 'heroLow'], 2],
  march: [['lowFront', 'troupe:brass', 'heroMed', 'tonearm2', 'troupe:horns'], 2],
  fancy: [['orbit', 'troupe:violins', 'high34', 'heroMed', 'overhead', 'wideSide'], 3],
  fire: [['overhead', 'heroTrack', 'lowFront', 'wideSide', 'troupe:lows', 'heroLow'], 2],
  breath: [['harp', 'heroMed', 'front', 'orbit'], 3],
  strive: [['crane', 'heroLow', 'troupe:violins', 'front', 'high34'], 3],
  upright: [['lowFront', 'troupe:brass', 'heroLow', 'tonearm2', 'troupe:horns'], 2],
  uphill: [['overhead', 'heroLow', 'front', 'troupe:lows', 'high34', 'drums', 'orbit', 'troupe:violins', 'heroTrack'], 2],
  hammer: [['front'], 2],
  summit: [['crane'], 99],
  pause: [['front'], 99],
  critics: [['mob', 'back', 'heroLow', 'mob', 'overhead'], 2],
  answer: [['heroMed', 'back', 'front'], 3],
  night: [['wideFront', 'heroLow', 'troupe:violins', 'orbitSlow', 'heroMed', 'harp', 'heroTrack', 'overhead', 'crane'], 3],
  return: [['overhead', 'mob', 'heroLow', 'back', 'mob', 'front'], 2],
  snap: [['heroLow'], 99],
};

export function createShots(S, plan, company) {
  const shots = [];
  const push = (a, b, type, extra = {}) => { if (b - a > 0.05) shots.push({ a, b, type, k: shots.length, ...extra }); };
  const atBar = (t, bars) => S.barTime(Math.round(S.barPos(t)) + bars) - LEAD;

  // Alkusoitto: urat -> neulan lasku -> nosturi vetäytyy -> sankari nousee.
  push(0, S.T_NEEDLE - 0.55, 'groove');
  push(S.T_NEEDLE - 0.55, S.T_NEEDLE + 1.9, 'needle');
  push(S.T_NEEDLE + 1.9, S.T0 + 1.6, 'craneOut');

  for (const b of plan.blocks) {
    const [types, bars] = CUTS[b.name];
    let a = b.name === 'rise' ? S.T0 + 1.6 : b.a;
    if (b.name === 'hammer') {
      // Leikkaus jokaisella pudotuksella (jähmettymä) ja nousulla (räjähdys uuteen tabloon).
      const T = ['overhead', 'front', 'wideSide', 'high34'];
      let k = 0;
      for (const [d, r] of S.freezes) {
        push(a, d - LEAD, k ? T[(k + 1) % 4] : 'front');
        push(d - LEAD, r - LEAD, 'freeze', { seed: k });
        a = r - LEAD;
        k++;
      }
      push(a, b.b - LEAD, 'heroLow');
      continue;
    }
    if (b.name === 'summit') {
      // viimeinen jähmettymä voi osua lohkon alkuun: nosturi alkaa sen jälkeen
      for (const [d, r] of S.freezes) if (d < a + 0.5 && r > a) a = r - LEAD;
      // sammakkokuva tornista ja auringosta viimeisen tahdin alusta, sädekehä leimahtaa soinnussa
      const last = S.barTime(Math.floor(S.barPos(S.T_DOM7)) - 1) - LEAD;
      push(a, last, 'crane');
      push(last, b.b, 'summitLow');
      continue;
    }
    if (b.name === 'critics' || b.name === 'return') {
      // Jokainen uusi vastustaja saa lähikuvan; väliin sankarin reaktio.
      const spawns = company.critics.filter((c) => c.k === 0 && c.spawn >= b.a && c.spawn < b.b).map((c) => ({ t: c.spawn, c }));
      if (b.name === 'return') {
        // paluussa: ensimmäiset iskut uudelleen
        const seen = new Set();
        for (const c of company.critics) {
          if (c.k) continue;
          const o = c.ons.find((x) => x.t >= b.a && x.t < b.b - 3);
          if (o && !seen.has(c.type)) { seen.add(c.type); spawns.push({ t: o.t, c }); }
        }
        spawns.sort((x, y) => x.t - y.t);
      }
      let i = 0;
      if (b.name === 'critics') {
        const e0 = spawns.length ? Math.min(a + 3.2, spawns[0].t - 0.5) : a + 3.2;
        if (e0 - a > 0.8) { push(a, e0, 'back'); a = e0; }
      }
      for (const sp of spawns) {
        const s0 = Math.max(a, sp.t - 0.5);
        if (s0 - a > 0.9) {
          let x = a;
          while (sp.t - 0.5 - x > 0.9) {
            const y = Math.min(sp.t - 0.5, atBar(x, bars));
            push(x, y, types[i++ % types.length]);
            x = y;
          }
          a = x;
        }
        const end = Math.min(b.b, sp.t + 2.8);
        push(Math.max(a, sp.t - 0.5), end, 'critic', { critic: sp.c });
        a = end;
        if (b.name === 'critics' && b.b - a > 2.5) { const e2 = Math.min(b.b, a + 2.0); push(a, e2, 'heroReact', { critic: sp.c }); a = e2; }
      }
      while (a < b.b - 0.5) {
        const y = Math.min(b.b, atBar(a, bars));
        push(a, y < b.b - 1.0 ? y : b.b, types[i++ % types.length]);
        a = y < b.b - 1.0 ? y : b.b;
      }
      continue;
    }
    if (b.name === 'breath') {
      // kurkistaja (puupuhaltimet, enne vastustajista) saa oman ottonsa
      const sc = company.scoutIv.find(([x]) => x >= b.a && x < b.b - 3);
      let i = 0;
      while (a < b.b - 0.5) {
        let y = Math.min(b.b, atBar(a, bars));
        if (sc && a < sc[0] + 0.2 && y > sc[0] + 0.2) {
          push(a, sc[0] + 0.2, types[i++ % types.length]);
          push(sc[0] + 0.2, sc[0] + 3.8, 'scout');
          a = sc[0] + 3.8;
          continue;
        }
        const end = y < b.b - 1.5 ? y : b.b;
        push(a, end, types[i++ % types.length]);
        a = end;
      }
      continue;
    }
    let i = 0;
    while (a < b.b - 0.5) {
      const y = bars >= 99 ? b.b : Math.min(b.b, atBar(a, bars));
      const end = y < b.b - 1.5 ? y : b.b;
      push(a, end, types[i++ % types.length]);
      a = end;
    }
  }
  // Loppu: lopputekstit paperilla (kamera pysyy).
  shots.sort((x, y) => x.a - y.a);
  shots.forEach((s, k) => { s.k = k; s.seed = s.seed ?? hash1(k * 71 + 3); });
  // Kurkistajan kohdalle oma otto (näytös I, puupuhaltimet).
  function shotAt(t) {
    let lo = 0, hi = shots.length - 1;
    while (hi > lo) {
      const mid = (lo + hi + 1) >> 1;
      if (shots[mid].a <= t) lo = mid; else hi = mid - 1;
    }
    return shots[lo];
  }

  const cam = new THREE.PerspectiveCamera(40, 1920 / 1080, 0.1, 400);
  const v = (x, y, z) => new THREE.Vector3(x, y, z);

  function frame(t, info, stage) {
    const s = shotAt(t);
    const u = clamp((t - s.a) / Math.max(0.1, s.b - s.a));
    // sankari voi olla vielä luukussa (lattian alla): kamera pysyy lattian yläpuolella
    const h = info.hero.clone();
    h.y = Math.max(0, h.y);
    const hh = info.heroHead;
    const sd = s.seed;
    let pos, look, fov = 40, roll = 0;
    const side = sd > 0.5 ? 1 : -1;
    switch (s.type.split(':')[0]) {
      case 'groove': {
        pos = v(mix(-3, 1.5, u), 0.32, 10.8);
        look = v(mix(-1, 2.5, u), -0.1, 3.0);
        fov = 48;
        break;
      }
      case 'needle': {
        const st = stage.arm.stylus;
        pos = v(st.x + 2.4, 1.1, st.z + 3.0).lerp(v(st.x + 3.2, 1.6, st.z + 4.2), E(u));
        look = v(st.x, 0.35, st.z);
        fov = 34;
        break;
      }
      case 'craneOut': {
        const st = stage.arm.stylus;
        const e = E(u);
        pos = v(st.x + 3.2, 1.6, st.z + 4.2).lerp(v(0, 10.5, 27), e);
        look = v(st.x, 0.35, st.z).lerp(v(0, 0.5, 0), e);
        fov = mix(34, 42, e);
        break;
      }
      case 'front': {
        pos = v(mix(-1.5, 1.5, sd) * (1 - u), 5.4, 24.5 - 2.6 * u);
        look = v(h.x * 0.3, 2.0 + h.y * 0.5, h.z * 0.3);
        break;
      }
      case 'wideFront': {
        pos = v(mix(-2, 2, u), 7.5, 26);
        look = v(0, 2.0, 0);
        fov = 42;
        break;
      }
      case 'lowFront': {
        // etukaaren bassojen välistä (x = 0), matalalta
        pos = v(side * 0.5 * (1 - u), 0.55, 12.5 - 1.5 * u);
        look = v(h.x, h.y + 1.9, h.z);
        fov = 44;
        break;
      }
      case 'heroLow': {
        const a = (sd - 0.5) * 1.6 + 0.35 * u * side;
        pos = v(h.x + 5.6 * Math.sin(a), h.y + 0.35, h.z + 5.6 * Math.cos(a));
        look = v(hh.x, hh.y + 0.7, hh.z);
        fov = 48;
        break;
      }
      case 'heroMed': {
        const a = (sd - 0.5) * 1.3 + 0.25 * u * side;
        pos = v(h.x + 8.2 * Math.sin(a), h.y + 2.6, h.z + 8.2 * Math.cos(a));
        look = v(h.x, h.y + 1.8, h.z);
        fov = 36;
        break;
      }
      case 'heroTrack': {
        pos = v(h.x + 6.5 * side, h.y + 1.9, h.z + 5.5);
        look = v(h.x, h.y + 1.6, h.z);
        fov = 42;
        break;
      }
      case 'heroReact': {
        const c = s.critic ? company.critics.find((x) => x === s.critic) : null;
        const cp = c ? v(c.r.root.position.x, 0, c.r.root.position.z) : v(5, 0, 5);
        const dir = v(h.x - cp.x, 0, h.z - cp.z).normalize();
        // vastustajan olan yli, sivummalta, ettei se peitä sankaria
        pos = cp.clone().addScaledVector(dir, -1.6).add(v(dir.z * 1.9 * side, 2.5, -dir.x * 1.9 * side));
        look = v(h.x, h.y + 1.3, h.z);
        fov = 38;
        break;
      }
      case 'overhead': {
        const close = sd > 0.55;
        const cx = close ? h.x * 0.6 : 0, cz = close ? h.z * 0.6 : 0;
        pos = v(cx + 0.001, close ? 19 - 2 * u : 30 - 2.5 * u, cz + 0.001);
        look = v(cx, 0, cz);
        roll = sd * 6.28 + 0.25 * u * side;
        fov = 44;
        break;
      }
      case 'high34': {
        const a = 0.7 * side + 0.15 * u;
        pos = v(21 * Math.sin(a), 15, 21 * Math.cos(a));
        look = v(0, 1, 0);
        fov = 42;
        break;
      }
      case 'wideSide': {
        pos = v(side * 21, 3.6, 6 - 3 * u);
        look = v(side * -1.5, 2.0, -1);
        fov = 44;
        break;
      }
      case 'orbit':
      case 'orbitSlow': {
        const sp = s.type === 'orbit' ? 0.75 : 0.35;
        const a = sd * 6.28 + sp * u * side;
        pos = v(h.x + 11 * Math.sin(a), h.y + 4.2, h.z + 11 * Math.cos(a));
        look = v(h.x, h.y + 1.6, h.z);
        fov = 40;
        break;
      }
      case 'troupe': {
        const c = info.centroid[s.type.split(':')[1]];
        const tgt = c ? c.clone() : v(0, 1, 0);
        const ang = Math.atan2(tgt.x, tgt.z) + (sd - 0.5) * 0.8;
        const r0 = Math.hypot(tgt.x, tgt.z);
        const R = r0 < 3 ? 9 : r0 + 7.5;
        pos = v(R * Math.sin(ang), 2.4 + 1.2 * sd, R * Math.cos(ang));
        if (r0 > 6.5 && Math.cos(ang) < -0.2) pos = v(tgt.x * 0.35 + side * 3, 2.8, tgt.z * 0.35 + 6);
        look = v(tgt.x, 1.3, tgt.z);
        pos.lerp(look, 0.08 * u);
        fov = 42;
        break;
      }
      case 'drums': {
        pos = v(-6.5, 2.4 + u, -1.5);
        look = v(-13.8, 1.7, -10.5);
        fov = 44;
        break;
      }
      case 'harp': {
        pos = v(-8.5, 1.6 + 0.6 * u, 12.5);
        look = v(-15.5, 4.6, 5.0);
        fov = 46;
        break;
      }
      case 'tonearm2': {
        pos = v(20.5, 4.6, -10.5);
        look = v(h.x, h.y + 1.5, h.z);
        fov = 40;
        break;
      }
      case 'crane': {
        const e = E(u);
        pos = v(1.5 * (1 - e), 0.8 + 9 * e, 17 - 2 * e);
        look = v(h.x, h.y + 1.6 + 1.5 * e, h.z);
        fov = 44;
        break;
      }
      case 'summitLow': {
        pos = v(0.0, 0.5, 15.5);
        look = v(0, 7.0, -4);
        fov = 52;
        break;
      }
      case 'freeze': {
        const T = [[-6, 0.5, 9], [6, 1.0, 8], [0, 14, 12], [-9, 3.5, 3]][s.seed % 4];
        pos = v(h.x + T[0], h.y + T[1], h.z + T[2]);
        look = v(hh.x, hh.y + 0.3, hh.z);
        fov = 38;
        break;
      }
      case 'scout': {
        pos = v(8.8, 1.5, 7.5 - 0.6 * u);
        look = v(14.4, 1.2, 3.2);
        fov = 36;
        break;
      }
      case 'mob': {
        // sankarin vierestä ulospäin: vastustajat piirittävät
        const a = sd * 6.28 + 0.45 * u * side;
        const d = v(Math.sin(a), 0, Math.cos(a));
        pos = v(h.x, h.y + 1.05, h.z).addScaledVector(d, -1.7).add(v(d.z * 0.9, 0, -d.x * 0.9));
        look = v(h.x, h.y + 1.4, h.z).addScaledVector(d, 7);
        fov = 50;
        break;
      }
      case 'back': {
        pos = v(h.x + 1.2 * side, h.y + 2.6, h.z + 5.2);
        look = v(h.x * 0.5, 1.6, -11);
        fov = 50;
        break;
      }
      case 'critic': {
        const c = s.critic;
        const cp = c.r.root.position;
        const out = v(cp.x, 0, cp.z).normalize();
        const tan = v(out.z, 0, -out.x).multiplyScalar(side);
        pos = v(cp.x, 0, cp.z).addScaledVector(out, -4.3).addScaledVector(tan, 1.4).add(v(0, 1.35, 0));
        look = v(cp.x, Math.max(0.6, cp.y + 1.1), cp.z).addScaledVector(out, 0.3);
        fov = 40;
        break;
      }
      default: {
        pos = v(0, 5.4, 24);
        look = v(0, 2, 0);
      }
    }
    cam.position.copy(pos);
    if (s.type === 'overhead') cam.up.set(Math.sin(roll), 0, -Math.cos(roll));
    else cam.up.set(0, 1, 0);
    cam.fov = fov;
    cam.updateProjectionMatrix();
    cam.lookAt(look);
    return s;
  }

  return { cam, frame, shots, shotAt };
}
