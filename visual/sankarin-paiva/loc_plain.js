// D, tasanko ja jyrkänne (1:13.0–1:34.1 ja laskeutumisen alku): kuvakäsikirjoituksen rivit 7–9 (+10).
//   7 Ratsastus: tutti ja käyrätorvet, kaviot jylisevät patarumpujen mukana, kellot nousevat 1:17.5.
//   8 Joen yli: jouset ja harppu, roiskeet harpun voimalla, jyrkänne edessä.
//   9 Ensimmäinen huippu: ylös jyrkänteelle, tempo hidastuu (hidastettu laukka), lautasissa
//     auringon välähdys, johtajan hevonen nousee takajaloilleen ja viiri on taivaalla.
//  10 (alku) Uusi taso: jyrkänteen reuna halkeaa, maa järisee, johtaja astuu rotkoon.

import * as THREE from 'three';
import { C, ink, flat, group, poly, rect, circle, cloud, ridgeGeo, skylineGeo, strokeGeo, outline, water, waveMat, pennantGeo, sky as makeSky, clamp, smoothstep, mix, hash1, vnoise1 } from './paper.js';
import { knight, horse, poseKnight, poseHorse, KP, kmix } from './puppets.js';
import { leader, camPath, ease } from './hero.js';

export function build(K) {
  const { S, seg } = K;
  const A = K.a, B = K.b;
  const scene = new THREE.Scene();
  const SKY = makeSky(scene);
  const tRiver = seg(9), tClimb = seg(10), tNew = seg(11);
  const cym = S.cymbalHits.find((h) => h.t > tClimb && h.t < tNew)?.t ?? 92.5;
  const tSlow = 90.0;
  // Ratsastajien kulku: nopeus vaiheittain (joessa hitaammin, hidastus 1:30), kertymä esilaskettu.
  const FPS = 30;
  const n = Math.ceil((B - A + 8) * FPS);
  const xs = new Float32Array(n), ph = new Float32Array(n);
  const speed = (t) => (t < tRiver - 0.5 ? 9 : t < tClimb - 1 ? 5.5 : t < tSlow ? 6.5 : t < cym ? 3.0 : 1.2);
  const rate = (t) => (t < tSlow ? 2.3 : t < cym ? 1.0 : 0.6) * 2 * Math.PI; // laukan vaihe (rad/s)
  for (let i = 1; i < n; i++) { const t = A - 2 + i / FPS; xs[i] = xs[i - 1] + speed(t) / FPS; ph[i] = ph[i - 1] + rate(t) / FPS; }
  const look = (arr) => (t) => { const f = clamp((t - (A - 2)) * FPS, 0, n - 1); const i = Math.floor(f); const j = Math.min(n - 1, i + 1); return arr[i] + (arr[j] - arr[i]) * (f - i); };
  const colX = look(xs), gallop = look(ph);
  const XR = colX(tRiver + 1.5);       // joki
  const XC = colX(tClimb) + 1;         // jyrkänteen juuri
  const TOPX = colX(cym - 0.7), TOPY = 9; // huippu: johtaja on siellä juuri ennen lautasiskua
  const ground = (x) => (x < XC ? 0 : x < TOPX ? ((x - XC) / (TOPX - XC)) * TOPY : TOPY);

  // --- kerrokset ---
  const X0 = -80, X1 = TOPX + 160;
  flat(scene, ridgeGeo(X0 - 400, X1 + 600, 42, 41, { lambda: 150, base: -300 }), ink(C.paper, { shade: C.blue, raster: 0.3 }), { z: -230 });
  flat(scene, ridgeGeo(X0 - 200, X1 + 300, 13, 43, { lambda: 40, base: -100 }), ink(C.blue, { shade: C.paper, raster: 0.15 }), { z: -70 });
  const fieldMat = ink(C.paper, { shade: C.blue, raster: 0.32, grad: [C.blue, -1, -12, 0.7] });
  const fieldPts = [];
  for (let i = 0; i <= 400; i++) { const x = X0 - 60 + (i * (X1 - X0 + 200)) / 400; fieldPts.push([x, -0.7 + 0.5 * vnoise1(x / 13, 3)]); }
  flat(scene, skylineGeo(fieldPts, -40), fieldMat, { z: -14 });
  // polku, jolla ratsastajat kulkevat (musta maa), ja jyrkänne
  const pathPts = [];
  for (let i = 0; i <= 300; i++) { const x = X0 + (i * (TOPX + 40 - X0)) / 300; pathPts.push([x, ground(x) - 0.02]); }
  const groundM = flat(scene, skylineGeo(pathPts, -40), ink(C.black), { z: -0.9 });
  void groundM;
  const cliffPts = [[XC - 2, -40], [XC - 2, 0], [XC + 3, 2.5], [XC + 7, 4.5], [TOPX - 2, TOPY], [TOPX + 6, TOPY + 0.6], [TOPX + 9, TOPY + 0.2], [TOPX + 9.5, -40]];
  flat(scene, poly(cliffPts), ink(C.black, { shade: C.blue, raster: 0.2 }), { z: -1.4 });
  const crackMat = ink(C.paper);
  const crackPts = [[TOPX + 6.5, TOPY + 0.4], [TOPX + 6.2, TOPY - 0.8], [TOPX + 6.8, TOPY - 1.7], [TOPX + 6.3, TOPY - 2.9], [TOPX + 6.9, TOPY - 4.0]];
  const crack = flat(scene, strokeGeo(crackPts, 0.08), crackMat, { z: -1.38 });
  // joki: kaista ratsastajien edessä ja takana
  const riv = water(scene, 26, 2.4, { x: XR, y: -0.9, z: 0.6, glint: 0.9 });
  const rivBack = water(scene, 26, 3, { x: XR, y: -0.4, z: -1.0, glint: 0.6 });
  // pilvet
  for (let k = 0; k < 22; k++) flat(scene, cloud(12 + 10 * hash1(k), 5 + 3 * hash1(k + 1), k + 60), ink(C.paper, { shade: C.blue, raster: 0.1 }), { x: X0 + k * 20 + 8 * hash1(k + 2), y: 14 + 12 * hash1(k + 3), z: -60 - 60 * hash1(k + 4) });
  // roiskeet (harppu)
  const splashMat = ink(C.paper);
  const splashes = Array.from({ length: 24 }, () => { const m = flat(scene, circle(0.11, 12, 0, 0, 1.5), splashMat, { z: 0.7 }); m.visible = false; return m; });

  // --- ratsastajat: johtaja + 7 toveria, viirit kolmella ---
  const riders = [];
  for (let i = 0; i < 8; i++) {
    const zz = [0, -0.5, 0.35, -0.9, 0.15, -0.65, 0.45, -1.1][i];
    const H = horse(scene, { mane: i === 0 ? C.red : C.paper });
    const P = i === 0 ? null : knight(scene, { raster: 0.1 * (i % 3) });
    if (P) P.mounted = true;
    let pen = null;
    if (i === 2 || i === 4 || i === 6) {
      pen = group(scene);
      flat(pen, rect(0.06, 4.2, 0.5, 0), ink(C.black), {});
      const m = waveMat(i === 4 ? C.paper : C.red, { amp: 0.25, k: 6 });
      flat(pen, pennantGeo(2.2, 0.7), m, { y: 3.8, z: 0.01 });
      pen.m = m;
    }
    riders.push({ H, P, pen, dx: -2.7 * i - (i > 3 ? 1 : 0), z: zz, ph0: hash1(i * 7) * 6 });
  }
  const L = leader(scene, {});
  L.P.mounted = true;

  const riderX = (r, t) => colX(t) + r.dx;
  const leaderRear = (t) => smoothstep(cym - 0.9, cym - 0.1, t) * (1 - smoothstep(tNew - 0.6, tNew + 0.4, t));
  const horns = (t) => smoothstep(0.35, 0.8, S.energy.horns(t));
  function riderPose(t, lead) {
    const call = horns(t);
    let p = kmix(KP.ride, { ...KP.ride, lean: -0.2, tilt: 0.9, aN: 1.4, eN: 1.4 }, call);
    if (lead) p = { ...p, aN: 1.6 + 0.8 * clamp((S.melody(t) - 50) / 25), eN: 0.3 };
    return p;
  }
  // johtajan tila: ratsailla; uuden tason (1:34.1) jälkeen jalan kohti reunaa ja alas
  function leaderState(t) {
    const r = riders[0];
    const x = riderX(r, t);
    if (t < tNew + 0.5) {
      const rear = leaderRear(t);
      const pose = riderPose(t, true);
      return { x: x + 0.05 - 0.35 * rear, y: ground(x) + 1.52 + 0.75 * rear, z: r.z + 0.03, facing: 1, pose: { ...pose, lean: pose.lean - 0.5 * rear, mounted: true } };
    }
    const w = clamp((t - tNew - 0.5) / 4);
    const px = mix(x, TOPX + 6.8, ease(w));
    const down = smoothstep(tNew + 3.0, tNew + 6.5, t) * 7;
    const c = Math.floor(t / 0.42) % 2 ? KP.stepA : KP.stepB;
    return { x: px, y: TOPY + 0.2 - down, z: 0.2, facing: 1, pose: { ...kmix(c, KP.look, 0.3), mounted: false } };
  }
  const windAt = (t) => ({ x: -(1.5 + 2 * S.energy.violins(t)), y: 0.4 + 1.2 * S.loud(t) });

  const shots = [
    { name: '7 sivuajo laukan rinnalla', a: A, b: tRiver, cam: (u, t) => { const c = colX(t) - 8; return { pos: [c + 1, 2.6, 15], look: [c + 2, 1.6, 0], fov: 42 }; } },
    { name: '8 matala vesirajasta', a: tRiver, b: tRiver + 4.7, cam: camPath([{ pos: [XR - 3, -0.35, 8], look: [XR - 4.5, 1.2, 0], fov: 46 }, { pos: [XR - 1.5, -0.3, 7.6], look: [XR + 0.5, 1.4, 0], fov: 46 }]) },
    { name: '8 korkea ja laaja: jyrkänne edessä', a: tRiver + 4.7, b: tClimb, cam: (u, t) => { const c = colX(t) - 6; return { pos: [c + 8 * ease(u), 10, 44], look: [c + 14, 3, 0], fov: 42 }; } },
    { name: '9 nosturi jyrkännettä ylös', a: tClimb, b: cym - 1.2, cam: (u, t) => { const c = colX(t) - 4; return { pos: [c - 2, ground(c) + 2.5 + 3 * ease(u), 17], look: [c + 3, ground(c + 3) + 2.0, 0], fov: 42 }; } },
    { name: '9 sammakko: hevonen takajaloillaan, viiri taivaalla', a: cym - 1.2, b: tNew, cam: camPath([{ pos: [TOPX + 0.5, TOPY + 0.2, 9.5], look: [TOPX + 4.5, TOPY + 3.4, 0], fov: 46 }, { pos: [TOPX + 1.0, TOPY + 0.0, 8.8], look: [TOPX + 4.8, TOPY + 3.7, 0], fov: 46 }]) },
    { name: '10 halkeama ja laskeutuminen', a: tNew, b: B + 2, cam: (u, t) => { const w = ease(clamp((t - tNew) / 4.2)); return { pos: [TOPX + 4 + 2 * w, TOPY + 3 - 7 * ease(clamp((t - tNew - 1.5) / 4)), 13], look: [TOPX + 6.5, TOPY + 1 - 8 * ease(clamp((t - tNew - 1.5) / 4)), 0], fov: 44 }; } },
  ];

  function update(t) {
    const u = SKY.u;
    u.uTime.value = t;
    u.uBlueAmt.value = 1; u.uBlueH.value = 0.55; u.uBlackTop.value = 0; u.uRedAmt.value = 0.2;
    const sunUp = smoothstep(tClimb, cym, t);
    u.uSun.value.set(TOPX + 60, mix(60, 150, sunUp), 26, 1);
    const flash = t >= cym - 0.15 ? Math.exp(-(t - cym) / 0.9) : 0;
    u.uRays.value = 0.25 + 0.9 * flash;
    for (let k = 0; k < 6; k++) u.uBands.value[k] = clamp(S.bands[k](Math.min(t, cym + 0.1)) * 1.4);
    // ratsastajat
    riders.forEach((r, i) => {
      const x = riderX(r, t);
      const g = ground(x);
      const inRiver = Math.abs(x - XR) < 9;
      r.H.root.position.set(x, g - (inRiver ? 0.45 : 0), r.z);
      r.H.root.rotation.z = x > XC && x < TOPX ? Math.atan2(TOPY, TOPX - XC) * 0.8 : 0;
      const mode = i === 0 && t > cym - 1.5 ? 'stand' : 'gallop';
      poseHorse(r.H, mode, gallop(t) + r.ph0, 1, i === 0 ? leaderRear(t) : 0);
      r.H.root.updateMatrixWorld(true);
      const sp = new THREE.Vector3(); r.H.saddle.getWorldPosition(sp);
      if (r.P) {
        r.P.root.position.set(sp.x - 0.05, sp.y + 0.02, r.z + 0.03);
        poseKnight(r.P, riderPose(t - 0.03 * i, false), t, 0.6);
      }
      if (r.pen) {
        r.pen.position.set(sp.x - 0.25, sp.y - 0.4, r.z - 0.02);
        r.pen.rotation.z = 0.12;
        r.pen.m.uniforms.uTime.value = t + i;
        r.pen.m.uniforms.uAmp.value = 0.12 + 0.3 * smoothstep(0.1, 0.6, S.energy.brass(t));
      }
      const leftBehind = i === 0 && t > tNew + 0.5;
      r.H.root.visible = true;
      void leftBehind;
    });
    L.place(t, leaderState, windAt, { capeWind: 0.8, dt: 0.02, windScale: 0.6 });
    // joki: välkkeet, roiskeet ja renkaat (harppu)
    for (const w of [riv, rivBack]) { w.u.uTime.value = t; w.u.uGlint.value = 0.5 + 0.7 * S.fam.harp(t); }
    const hp = 0.4 + 1.2 * S.fam.harp(t);
    let k = 0;
    riv.rings.forEach((rr) => rr.set(0, 0, -99, 0));
    splashes.forEach((s) => (s.visible = false));
    riders.forEach((r, i) => {
      const x = riderX(r, t);
      if (Math.abs(x - XR) > 9) return;
      for (let j = 0; j < 3 && k < splashes.length; j++) {
        const s = splashes[k++];
        const a = ((t * 2.3 + i * 0.37 + j * 0.31) % 1);
        s.visible = true;
        s.position.set(x + 0.6 - j * 0.7 + (j - 1) * 1.2 * a, -0.6 + 1.6 * hp * Math.sin(Math.PI * a), 0.7);
        s.rotation.z = (j - 1) * 0.5;
        const sc = 0.6 + 0.8 * hp * (1 - a);
        s.scale.set(sc, sc, 1);
      }
      if (i < 16) riv.rings[i].set(x, -0.8, t - ((t * 1.7 + i * 0.3) % 1.2), 1.0);
    });
    // halkeama ja maanjäristys (uusi taso, sellot ja bassot)
    const cr = smoothstep(tNew - 0.2, tNew + 1.5, t);
    crack.visible = cr > 0;
    crack.scale.set(1, cr, 1);
    let shake = 0;
    if (t > tNew) shake = 3.5 * S.energy.lows(t) * Math.sin(t * 47) * (1 - smoothstep(tNew + 4, tNew + 6, t));
    for (const h of S.percHits) { const a = t - h.t; if (a >= 0 && a < 0.4 && h.t > A && h.t < tRiver) shake += 3 * h.s * Math.exp(-a / 0.1) * Math.cos(a * 60); }
    return { dim: 0.25 * smoothstep(tNew + 1, tNew + 5, t), flash: 0.55 * flash, shake };
  }
  return { scene, update, shots };
}
