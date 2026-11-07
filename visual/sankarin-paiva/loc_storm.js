// F, ylätasanko ja myrskyvuori (2:21.7–3:59.2): kuvakäsikirjoituksen rivit 15–19.
//  15 Sankarien kutsu: käyrätorvet suurimmillaan. Jälleennäkeminen, kellot ylhäällä, viirit, kaksi
//     patarumpuratsastajaa; 2:35 välähdys; d-mollissa kaukana myrskyvuori (Macbethin kruunu).
//  16 Myrsky nousee: kaukainen ukkonen (patarummut), ensimmäinen salama 2:50, sade f-mollissa.
//  17 Myrskyssä: kiipeäminen rinnettä, salamat 3:10 ja 3:20, ukkonen tärisyttää.
//  18 Neljä iskua: hiljenemisessä puupiirrosjähmettymä, patarumpujen paluussa salama ja uusi kulma.
//  19 Huippu: toverit liittyvät 3:50, pilvet repeävät lautasissa, dominanttiseptimissä viiri
//     pystyyn ja sädekehä taajuuskaistoista.

import * as THREE from 'three';
import { C, ink, flat, group, poly, rect, circle, cloud, crownPeak, ridgeGeo, skylineGeo, strokeGeo, boltPoints, waveMat, pennantGeo, streaks, sky as makeSky, clamp, smoothstep, mix, hash1, vnoise1 } from './paper.js';
import { knight, horse, poseKnight, poseHorse, KP, kmix } from './puppets.js';
import { leader, camPath, ease } from './hero.js';

export function build(K) {
  const { S, seg } = K;
  const A = K.a;
  const T_D = S.T_DOM7;
  const scene = new THREE.Scene();
  const SKY = makeSky(scene);
  const tRow = seg(18), tFar = seg(18) + 0; // 2:30.9 d-molli
  const tStorm = seg(19), tRain = seg(21), tSlope = seg(22), tHam = seg(25), tSum = seg(28);
  const tDm = seg(18);
  void tRow; void tFar;
  const lightningT = [];
  { // ensimmäinen salama: vaskien ja patarumpujen isku noin 2:50, sitten lautasiskut
    let tb = 170, hb = 0;
    for (let t = 168; t < 172.4; t += 0.05) { const h = S.fam.perc(t) + S.fam.tpt(t); if (h > hb) { hb = h; tb = t; } }
    lightningT.push(tb);
    for (const h of S.cymbalHits) if (h.t > tSlope - 1 && h.t < tHam) lightningT.push(h.t);
    for (const [, r] of S.freezes) lightningT.push(r);
  }
  // --- maailma: tasanne x -20..30, tasanko 30..180, rinne 180..255 (huippu y 50) ---
  const SUMX = 252, SUMY = 50;
  const slopeY = (x) => (x < 178 ? 0 : x < SUMX ? Math.pow((x - 178) / (SUMX - 178), 1.15) * SUMY : SUMY);
  const groundPts = [];
  for (let i = 0; i <= 500; i++) { const x = -40 + i * 0.6; groundPts.push([x, slopeY(x) + 0.25 * (vnoise1(x / 2.3, 5) - 0.5) * (x > 178 ? 3 : 1)]); }
  const groundMat = ink(C.black, { shade: C.blue, raster: 0.15 });
  flat(scene, skylineGeo([[-60, -3], [-7, -3], [-6, 0], ...groundPts.filter((p) => p[0] > -6)], -60), groundMat, { z: 0 });
  // kruunu huipulla (Macbeth)
  flat(scene, crownPeak(16, 7, 3), groundMat, { x: SUMX + 2, y: SUMY - 0.5, z: -0.05 });
  // kaukaiset kerrokset
  flat(scene, ridgeGeo(-500, 900, 46, 51, { lambda: 150, base: -300 }), ink(C.paper, { shade: C.blue, raster: 0.32 }), { z: -230 });
  flat(scene, crownPeak(120, 70, 9), ink(C.blue, { shade: C.black, raster: 0.25 }), { x: 330, y: 0, z: -180 });
  flat(scene, ridgeGeo(-300, 600, 14, 53, { lambda: 45, base: -120 }), ink(C.blue, { shade: C.paper, raster: 0.1 }), { z: -70 });
  // myrskypilvet: tummat leikkeet, jotka vyöryvät oikealta
  const stormClouds = Array.from({ length: 26 }, (_, k) => {
    const m = flat(scene, cloud(34 + 20 * hash1(k), 16 + 8 * hash1(k + 1), k + 300, false), ink(C.black, { shade: C.blue, raster: 0.35 }), { x: 0, y: 40 + 30 * hash1(k + 2), z: -60 - 70 * hash1(k + 3) });
    m.k = k;
    return m;
  });
  // sade ja tuuli
  const rain = streaks(scene, 260, ink(C.paper, { shade: C.blue, raster: 0.3 }), 2);
  // salama
  const boltMat = ink(C.paper);
  const bolts = lightningT.map((te, i) => {
    const m = flat(scene, strokeGeo(boltPoints(i + 7, 0, 60, 0, 0), (u) => 0.5 * (1 - u) + 0.15), boltMat, { z: -8 });
    m.visible = false;
    return { m, te };
  });

  // --- sankarit ---
  const L = leader(scene, {});
  const mates = Array.from({ length: 7 }, (_, i) => {
    const P = knight(scene, { raster: 0.1 * (i % 3) });
    const H = horse(scene, { mane: i % 2 ? C.paper : C.red });
    return { P, H, i, x0: 3 + i * 2.6, z: [-0.4, 0.2, -0.7, 0.1, -0.5, 0.3, -0.9][i] };
  });
  const LH = horse(scene, { mane: C.red });
  // patarumpuratsastajat
  const drummers = [0, 1].map((i) => {
    const H = horse(scene, {});
    const P = knight(scene, { raster: 0.2 });
    P.mounted = true;
    const drum = group(scene);
    flat(drum, poly(Array.from({ length: 16 }, (_, k) => { const a = Math.PI + (k / 15) * Math.PI; return [Math.cos(a) * 0.55, Math.sin(a) * 0.5]; })), ink(C.red, { shade: C.black, raster: 0.25 }), {});
    flat(drum, rect(1.15, 0.08), ink(C.paper), { y: 0.02, z: 0.01 });
    const mallet = group(drum, { x: 0.1, y: 0.9, z: 0.02 });
    flat(mallet, rect(0.05, 0.8, 0.5, 1), ink(C.black), {});
    flat(mallet, circle(0.11, 12, 0, -0.8), ink(C.paper), { z: 0.01 });
    return { H, P, drum, mallet, x0: 23 + i * 3.4, z: -1.3 - 0.3 * i };
  });
  const pens = [0, 1, 2].map((i) => {
    const g = group(scene, { x: 6 + i * 5.2, z: -1.6 });
    flat(g, rect(0.07, 4.6, 0.5, 0), ink(C.black), {});
    const m = waveMat([C.red, C.paper, C.red][i], { amp: 0.25, k: 6 });
    flat(g, pennantGeo(2.4, 0.75), m, { y: 4.2, z: 0.01 });
    return { g, m };
  });

  // Ratsastus ja kiipeäminen: kertymä esilaskettu
  const FPS = 30;
  const t0 = A - 2, n = Math.ceil((T_D + 4 - t0) * FPS);
  const xs = new Float32Array(n), gph = new Float32Array(n);
  const speedAt = (t) => (t < tStorm + 1 ? 0 : t < tSlope ? 7.2 * smoothstep(tStorm + 1, tStorm + 3, t) : 0);
  for (let i = 1; i < n; i++) { const t = t0 + i / FPS; xs[i] = xs[i - 1] + speedAt(t) / FPS; gph[i] = gph[i - 1] + 2 * Math.PI * 2.2 / FPS; }
  const samp = (arr) => (t) => { const f = clamp((t - t0) * FPS, 0, n - 1); const i = Math.floor(f); const j = Math.min(n - 1, i + 1); return arr[i] + (arr[j] - arr[i]) * (f - i); };
  const rideX = samp(xs), gallop = samp(gph);
  const RIDE_END = rideX(tSlope);
  // kiipeämisen eteneminen: tasainen rinteessä, neljä askelta jähmettymien jälkeen, huipulle
  const climbX = (t) => {
    if (t < tSlope) return 0;
    let x = 178 + 40 * ease(clamp((t - tSlope) / (tHam - tSlope)));
    S.freezes.forEach(([d, r], k) => { x += 3.2 * ease(clamp((t - r) / 0.35)); void d; void k; });
    x += (SUMX - 230.8) * ease(clamp((t - tSum - 1) / (T_D - 1.2 - tSum - 1)));
    return x;
  };

  function leaderState(t) {
    if (t < tStorm + 1) {
      const rise = ease(smoothstep(A - 0.3, A + 1.8, t));
      const x = -4.6 + 2.5 * smoothstep(A + 1.8, A + 4.5, t);
      const call = smoothstep(0.35, 0.8, S.energy.horns(t));
      const walk = Math.floor(t / 0.45) % 2 ? KP.stepA : KP.stepB;
      const base = t < A + 1.8 ? KP.climbA : t < A + 4.5 ? walk : KP.proud;
      return { x, y: -3.2 * (1 - rise), z: 0.3, facing: 1, pose: { ...kmix(base, KP.call, call * smoothstep(A + 3.5, A + 5, t)), mounted: false } };
    }
    if (t < tSlope) {
      const x = -2 + rideX(t) + 4;
      return { x, y: 1.52 + 0.08 * Math.abs(Math.sin(gallop(t))), z: 0.33, facing: 1, pose: { ...KP.ride, aN: 1.7, eN: 0.3, lean: 0.2, mounted: true } };
    }
    const x = climbX(t) + 1.2;
    const atTop = smoothstep(T_D - 2, T_D - 0.2, t);
    const c = Math.floor(t / 0.5) % 2 ? KP.climbA : KP.climbB;
    let pose = kmix({ ...c, lean: 0.3 }, KP.plant, atTop);
    if (t > T_D - 0.15) pose = kmix(KP.plant, KP.lanceUp, smoothstep(T_D - 0.15, T_D + 0.05, t));
    const lanceAng = t > T_D - 0.6 ? 0.0 : undefined;
    return { x, y: slopeY(x), z: 0.35, facing: 1, pose: { ...pose, mounted: false }, lanceAng };
  }
  const windAt = (t) => {
    const st = smoothstep(tStorm, tRain, t);
    return { x: -(1.5 + 7 * st + 2 * S.loud(t)), y: 0.5 + 1.5 * S.energy.violins(t) - 0.8 * st };
  };
  const LS = (t) => leaderState(t);
  const lazy = (t, lag = 1.0) => { let x = 0, y = 0; for (let k = 0; k < 7; k++) { const s = LS(t - (k / 6) * lag); x += s.x; y += s.y; } return [x / 7, y / 7]; };

  // Neljä iskua: otto jokaiselle pudotukselle ja paluulle
  const hammerShots = [];
  {
    const angles = [
      (lx, ly) => ({ pos: [lx - 7, ly - 2.5, 15], look: [lx, ly + 2.5, 0], fov: 44 }),
      (lx, ly) => ({ pos: [lx + 5, ly + 7, 16], look: [lx, ly + 1, 0], fov: 42 }),
      (lx, ly) => ({ pos: [lx + 2.2, ly + 0.6, 7.5], look: [lx, ly + 2.4, 0], fov: 44 }),
      (lx, ly) => ({ pos: [lx - 11, ly + 2, 22], look: [lx + 2, ly + 3, 0], fov: 42 }),
    ];
    let a = tHam;
    S.freezes.forEach(([d, r], k) => {
      if (d > a + 0.3) hammerShots.push({ name: `18 kiipeää (${k + 1})`, a, b: d - 1 / 30, cam: (u, t) => { const [lx, ly] = lazy(t); return angles[(k + 3) % 4](lx, ly); } });
      hammerShots.push({ name: `18 jähmettymä ${k + 1}`, a: d - 1 / 30, b: r - 1 / 30, cam: (u, t) => { const [lx, ly] = lazy(d); return angles[k % 4](lx, ly); } });
      a = r - 1 / 30;
    });
    hammerShots.push({ name: '18 viimeinen isku', a, b: tSum + 1.2, cam: (u, t) => { const [lx, ly] = lazy(t); return angles[1](lx, ly); } });
  }
  const shots = [
    { name: '15 matala nousu: johtaja palaa tovereiden luo', a: A - 1, b: A + 4.6, cam: camPath([{ pos: [-2.5, -0.6, 9.5], look: [-4.2, 2.2, 0], fov: 44 }, { pos: [-1.5, 0.6, 10], look: [-2.5, 2.6, 0], fov: 44 }]) },
    { name: '15 sivuajo: kellot ylhäällä', a: A + 4.6, b: tDm, cam: camPath([{ pos: [-3, 1.8, 8.5], look: [-1, 2.6, 0], fov: 42 }, { pos: [17, 2.1, 8.5], look: [19, 2.8, 0], fov: 42 }]) },
    { name: '15 laaja: myrskyvuori kaukana', a: tDm, b: tStorm, cam: camPath([{ pos: [70, 20, 175], look: [115, 22, 0], fov: 42 }, { pos: [86, 24, 165], look: [128, 24, 0], fov: 42 }]) },
    { name: '16 laaja: tummuva taivas', a: tStorm, b: tStorm + 8.4, cam: (u, t) => { const x = rideX(t); return { pos: [x + 14, 7, 46], look: [x + 24, 5, 0], fov: 42 }; } },
    { name: '16 sivuajo sateessa', a: tStorm + 8.4, b: tSlope, cam: (u, t) => { const x = rideX(t); return { pos: [x - 2, 2.6, 14], look: [x - 1, 1.8, 0], fov: 42 }; } },
    { name: '17 rinne laajana', a: tSlope, b: tSlope + 9.5, cam: camPath([{ pos: [196, 24, 72], look: [206, 22, 0], fov: 42 }, { pos: [204, 28, 68], look: [212, 25, 0], fov: 42 }]) },
    { name: '17 matala: johtaja kiipeää sateessa', a: tSlope + 9.5, b: tSlope + 20, cam: (u, t) => { const [lx, ly] = lazy(t); return { pos: [lx + 3.2, ly - 0.4, 9.5], look: [lx, ly + 3.0, 0], fov: 44 }; } },
    { name: '17 viiri myrskytuulessa', a: tSlope + 20, b: tHam, cam: (u, t) => { const [lx, ly] = lazy(t); return { pos: [lx + 1.6, ly + 3.4, 7], look: [lx - 1.2, ly + 4.2, 0], fov: 44 }; } },
    ...hammerShots,
    { name: '19 nosturi huipulle', a: tSum + 1.2, b: T_D - 2.4, cam: (u, t) => { const [lx, ly] = lazy(t, 1.4); return { pos: [lx + 6, ly + 1.5 + 5 * ease(u), 24 - 4 * ease(u)], look: [lx + 2, ly + 3, 0], fov: 44 }; } },
    { name: '19 sammakko: viiri pystyyn ja sädekehä', a: T_D - 2.4, b: T_D + 3, cam: camPath([{ pos: [SUMX + 1.2, SUMY - 4, 24], look: [SUMX + 1.0, SUMY + 5.5, 0], fov: 48 }, { pos: [SUMX + 1.2, SUMY - 4.2, 22.5], look: [SUMX + 1.0, SUMY + 6, 0], fov: 48 }]) },
  ];

  // Jähmettymässä koko maailma pysähtyy (myös sade ja viiri).
  const frz = (t) => { for (const [d, r] of S.freezes) if (t >= d - 1 / 30 && t < r - 1 / 30) return d - 1 / 30; return t; };
  function update(t0) {
    const t = frz(t0);
    const u = SKY.u;
    u.uTime.value = t;
    const dm = smoothstep(tDm, tStorm + 6, t);
    const st = smoothstep(tStorm, tRain + 4, t);
    const gap = smoothstep(T_D - 7, T_D - 3.5, t);
    u.uBlueAmt.value = 1; u.uBlueH.value = mix(0.55, 0.1, st) + 0.4 * gap;
    u.uRedAmt.value = 0.15 + 0.25 * gap;
    u.uBlackTop.value = 0.75 * st * (1 - 0.6 * gap);
    u.uMurk.value = 0.35 * dm + 0.45 * st;
    // aurinko huipun takana: viimeisen kameran ja huipun kautta kulkeva suora taivastasolle (z -480)
    const cam = [SUMX + 1.2, SUMY - 4, 24], tgt = [SUMX + 1.0, SUMY + 5.5, 0];
    const k2 = (24 + 480) / 24;
    const sunX = cam[0] + (tgt[0] - cam[0]) * k2, sunY = cam[1] + (tgt[1] - cam[1]) * k2 * 0.86;
    u.uCloudGap.value.set(sunX, sunY, 160, gap);
    u.uSun.value.set(sunX, sunY, 24, smoothstep(T_D - 6, T_D - 3, t));
    if (t < tStorm) u.uSun.value.set(120, 160, 24, 1 - dm);
    const fl2 = S.cymbalHits.find((h) => h.t > A + 8 && h.t < tDm + 7)?.t;
    let rays = fl2 && t > fl2 - 0.1 ? Math.exp(-(t - fl2) / 1.2) * (1 - dm) : 0;
    rays = Math.max(rays, 0.35 * smoothstep(T_D - 6, T_D - 1, t) + 0.65 * smoothstep(T_D - 0.2, T_D + 0.02, t));
    u.uRays.value = rays;
    for (let k = 0; k < 6; k++) u.uBands.value[k] = clamp(S.bands[k](Math.min(t, T_D + 0.1)) * 1.4);
    // pilvet vyöryvät; huipulla ne väistyvät
    stormClouds.forEach((m) => {
      const k = m.k;
      const base = 60 + k * 16 + 30 * hash1(k + 9);
      const roll = 260 * (1 - smoothstep(tDm - 4, tStorm + 14, t));
      const part = gap * (k % 2 ? 1 : -1) * 120;
      m.position.x = base + roll + part + 4 * Math.sin(t * 0.2 + k);
      m.visible = t > tDm - 5;
    });
    // salamat
    let flash = 0;
    bolts.forEach((b, i) => {
      const a = t - b.te;
      b.m.visible = a >= -0.02 && a < 0.22;
      if (b.m.visible) {
        const [lx] = lazy(b.te);
        b.m.position.set(lx + 14 + 10 * (hash1(i) - 0.5), slopeY(lx) - 6, -8);
      }
      if (a >= -0.02 && a < 1.2) flash = Math.max(flash, 0.75 * Math.exp(-Math.max(0, a) / 0.18));
    });
    for (const h of S.percHits) { const a = t - h.t; if (h.t > tDm && h.t < tSlope && a >= 0 && a < 0.6) u.uFlash.value = 0; }
    u.uFlash.value = 0.35 * flash;
    // sade
    const rr = smoothstep(tRain - 1, tRain + 3, t) * (1 - smoothstep(T_D - 6, T_D - 3, t));
    const [cx, cy] = lazy(t);
    rain.set((i) => {
      if (hash1(i * 3) > rr) return null;
      const sp = 26 + 10 * hash1(i);
      const span = 40;
      const ph = (hash1(i * 5) * span + t * sp) % span;
      return { x: cx - 25 + 50 * hash1(i * 7) + ph * 0.45, y: cy + 22 - ph, z: -2 + 6 * hash1(i * 11), ang: -1.15, len: 1.2 + 1.2 * hash1(i * 13), w: 0.045 };
    });
    // johtaja ja hänen hevosensa
    const riding = t >= tStorm + 1 && t < tSlope;
    L.place(t, leaderState, windAt, { capeWind: 0.6 + st, width: 0.95, dt: riding ? 0.022 : 0.04, windScale: riding ? 0.5 : 0.8 });
    const ridden = t >= tStorm + 1 && t < tSlope;
    LH.root.visible = t >= tStorm - 3;
    const lhx = ridden ? -2 + rideX(t) + 4 : t < tStorm + 1 ? 1 : RIDE_END + 2;
    LH.root.position.set(lhx, 0, 0.3);
    poseHorse(LH, ridden ? 'gallop' : 'stand', gallop(t), 1);
    // toverit
    const call = smoothstep(0.35, 0.8, S.energy.horns(t));
    mates.forEach((m) => {
      const i = m.i;
      let x, y, pose, mounted = false, facing = 1;
      if (t < tStorm + 1) {
        x = m.x0; y = 0;
        pose = kmix(KP.proud, KP.call, call);
        m.H.root.position.set(x - 0.6, 0, m.z - 0.8);
        poseHorse(m.H, 'stand', 0, 0);
      } else if (t < tSlope) {
        x = -2 + rideX(t) - 2.8 * (i + 1); y = 0;
        m.H.root.position.set(x, 0, m.z);
        poseHorse(m.H, 'gallop', gallop(t) + i * 0.7, 1);
        m.H.root.updateMatrixWorld(true);
        const sp = new THREE.Vector3(); m.H.saddle.getWorldPosition(sp);
        x = sp.x - 0.05; y = sp.y + 0.02; mounted = true;
        pose = { ...KP.ride, lean: 0.2 };
      } else {
        m.H.root.position.set(RIDE_END - 3 - 2.6 * i, 0, m.z - 0.8);
        poseHorse(m.H, 'stand', 0, 0);
        // kiipeävät johtajan perässä; 3:50 nousevat huipun olkapäille
        const join = smoothstep(tSum + 4.5, tSum + 7.5, t);
        const trailX = climbX(t - 0.8 - 0.6 * i) + 1.2 - 2.0 * (i + 1);
        const topX = SUMX + [-7.5, -5.5, -3.5, 3.5, 5.5, 7.5, -9.5][i];
        x = mix(trailX, topX, join);
        y = mix(slopeY(trailX), SUMY - 1.4 * Math.abs(topX - SUMX) / 8, join);
        const c = Math.floor((t + i * 0.2) / 0.5) % 2 ? KP.climbA : KP.climbB;
        pose = kmix({ ...c, lean: 0.3 }, kmix(KP.proud, KP.call, Math.max(call, smoothstep(T_D - 0.3, T_D, t))), join);
        facing = join > 0.5 && topX > SUMX ? -1 : 1;
      }
      m.P.root.position.set(x, y, m.z + 0.02);
      m.P.root.scale.x = facing;
      poseKnight(m.P, { ...pose, mounted }, t, 0.4 + st);
    });
    // patarumpuratsastajat: kapula iskee patarumpujen mukaan (kohtaus 15–16)
    drummers.forEach((d, i) => {
      const vis = t < tSlope;
      d.H.root.visible = d.P.root.visible = d.drum.visible = vis;
      if (!vis) return;
      const riding = t >= tStorm + 1;
      const x = riding ? -2 + rideX(t) - 22 - 3 * i : d.x0;
      d.H.root.position.set(x, 0, d.z);
      poseHorse(d.H, riding ? 'gallop' : 'stand', gallop(t) + 2 + i, riding ? 1 : 0);
      d.H.root.updateMatrixWorld(true);
      const sp = new THREE.Vector3(); d.H.saddle.getWorldPosition(sp);
      d.P.root.position.set(sp.x, sp.y + 0.02, d.z + 0.03);
      let hit = 0;
      for (const h of S.percHits) { const a = t + 1 / 30 - h.t; if (a > -0.12 && a < 0.45) hit = Math.max(hit, a < 0 ? 1 + a / 0.12 : Math.exp(-a / 0.1)); }
      poseKnight(d.P, { ...KP.ride, aN: 1.2 + 0.9 * hit, eN: 0.6, mounted: true }, t, 0.4);
      d.drum.position.set(sp.x + 0.55, sp.y - 0.35, d.z + 0.05);
      d.mallet.rotation.z = -0.9 + 0.9 * hit;
    });
    pens.forEach((p, i) => {
      p.g.visible = t < tStorm + 1;
      p.m.uniforms.uTime.value = t + i;
      p.m.uniforms.uAmp.value = 0.1 + 0.35 * smoothstep(0.1, 0.6, S.energy.brass(t));
    });
    // jähmettymä: puupiirros
    let wood = 0;
    for (const [d, r] of S.freezes) if (t0 >= d - 1 / 30 && t0 < r - 1 / 30) wood = 1;
    let shake = 0;
    for (const h of S.percHits) { const a = t - h.t; if (h.t > tStorm && a >= 0 && a < 0.7) shake += 4 * h.s * Math.exp(-a / 0.16) * Math.cos(a * 50); }
    const dim = 0.32 * st * (1 - 0.8 * gap);
    return { dim, flash: wood ? 0 : 0.45 * flash, wood, shake: wood ? 0 : shake };
  }
  return { scene, update, shots };
}
