// Punaisen purjeen maailma: yksi tuuli, meren mainingit, laiva ja purje, perästä nähty laiva
// (selkäkuva), tiirat ja roiskeet. Kaikki on puhdas ajan funktio: aallot ja tuuli lasketaan
// samasta kaavasta varjostimessa ja JS:ssä, joten laiva istuu aallolla ilman tilaa ruutujen välillä.
//
// Tuuli (kuvakäsikirjoitus, luku 2): puhaltaa aina vasemmalta oikealle (+x). Voima on viulut,
// jouset ja voimakkuus tasoitettuna (sekunteja), ei koskaan yksittäinen isku. Kaikki purjeet,
// viirit, viitat ja sade lukevat saman wind(t):n.

import * as THREE from 'three';
import { C, U, HALFTONE, ink, flat, group, poly, circle, rect, strokeGeo, outline, swallowShape, cloud, TAU, clamp, smoothstep, mix, hash1, vnoise1 } from './paper.js';
import { knight, knightBack, poseKnight, KP, kmix } from './puppets.js';
import { gaussian, sampler } from '../util.js';

// --- Tuuli ------------------------------------------------------------------------------------
// Koko aikajanan tuuli: 0..1. calm: [[a, b], ...] välit, joissa tyven (näytös II).
export function makeWind(S, calm = []) {
  const n = S.n;
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / 30;
    const v = S.energy.violins(t), st = S.fam.strings(t), lo = S.loudSlow(t);
    let w = 0.18 + 0.45 * v + 0.2 * clamp(st) + 0.3 * lo;
    for (const [c0, c1] of calm) w *= 1 - Math.min(smoothstep(c0 - 2, c0 + 3, t), 1 - smoothstep(c1 - 1, c1 + 2.5, t));
    a[i] = clamp(w);
  }
  return sampler(gaussian(a, 30), 30);   // tasoitus noin sekunti
}

// --- Meri: mainingit ----------------------------------------------------------------------------
// Aalto: kaksi siniaaltoa, jotka kulkevat oikealle (tuulen mukana). Sama kaava JS:ssä ja GLSL:ssä.
export function waveY(w, x, t) {
  return w.A * (0.62 * Math.sin(w.k * x - w.sp * t + w.ph) + 0.38 * Math.sin(1.83 * w.k * x - 1.41 * w.sp * t + 2.1 * w.ph));
}
export function waveSlope(w, x, t) {
  return w.A * (0.62 * w.k * Math.cos(w.k * x - w.sp * t + w.ph) + 0.38 * 1.83 * w.k * Math.cos(1.83 * w.k * x - 1.41 * w.sp * t + 2.1 * w.ph));
}

const SEA_VS = /* glsl */ `
  uniform float uTime, uA, uK, uSp, uPh, uTop;
  varying vec3 vW;
  varying float vDepth;
  float wave(float x) { return uA * (0.62 * sin(uK * x - uSp * uTime + uPh) + 0.38 * sin(1.83 * uK * x - 1.41 * uSp * uTime + 2.1 * uPh)); }
  void main() {
    vec3 p = position;
    float top = uTop + wave(p.x);
    if (uv.y > 0.5) p.y = top;
    vDepth = top - p.y;
    vec4 w = modelMatrix * vec4(p, 1.0);
    vW = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;
const SEA_FS = /* glsl */ `
  uniform float uCell, uDim, uTime, uClock, uDeepH, uDeepAmt, uFoam, uFoamW, uGlint, uRows, uShiver, uRaster;
  uniform vec3 uBase, uDeep, uFoamC, uShade;
  uniform vec4 uRings[12];
  varying vec3 vW;
  varying float vDepth;
  ${HALFTONE}
  void main() {
    vec3 c = uBase;
    c = mix(c, uShade, halftone(uRaster, 0.785, uCell));
    c = mix(c, uDeep, halftone(clamp(vDepth / uDeepH, 0.0, 1.0) * uDeepAmt, 0.26, uCell));
    float crest = 1.0 - smoothstep(uFoamW * 0.6, uFoamW, vDepth);
    c = mix(c, uFoamC, crest * uFoam);
    // välkeviivat: rivit pinnan suuntaisesti, katkoviivat liikkuvat tuulen mukana
    float d = vDepth * uRows;
    float row = floor(d);
    float sh = uShiver * sin(vW.x * 9.0 + uTime * 40.0) * 0.25;
    float line = 1.0 - smoothstep(0.03, 0.08, abs(fract(d + sh) - 0.5));
    float dash = step(0.7, vnoise(vec2(vW.x * 0.6 - uTime * (0.5 + 0.4 * hash12(vec2(row, 3.0))), row * 1.7)));
    float fade = 1.0 - smoothstep(0.0, uDeepH * 0.8, vDepth);
    c = mix(c, uFoamC, dash * line * uGlint * fade);
    for (int i = 0; i < 12; i++) {
      vec4 R = uRings[i];
      if (R.w <= 0.0) continue;
      float age = uClock - R.z;   // renkaat todellisessa ajassa, eivät mainingin vaiheessa
      if (age < 0.0 || age > 2.6) continue;
      vec2 q = (vW.xy - R.xy) * vec2(1.0, 4.0);
      float rr = abs(length(q) - age * 2.2 * R.w);
      float ring = (1.0 - smoothstep(0.05, 0.14, rr)) * exp(-age * 1.2);
      c = mix(c, uFoamC, ring);
    }
    c = mix(c, vec3(0.12, 0.1, 0.095), halftone(uDim * 0.92, 0.785, uCell));
    gl_FragColor = vec4(c, 1.0);
  }
`;
// Merikaista x0..x1, pinta y (ennen aaltoa), pohja syvällä. o: A, k, sp, ph, base, deep, foam...
export function seaBand(parent, x0, x1, y, z, o = {}) {
  const nx = o.nx ?? Math.min(600, Math.round((x1 - x0) * (o.k ?? 0.3) * 8) + 40);
  const bottom = o.bottom ?? y - 400;
  const g = new THREE.PlaneGeometry(x1 - x0, y - bottom, nx, 1);
  g.translate((x0 + x1) / 2, (y + bottom) / 2, 0);
  const rings = Array.from({ length: 12 }, () => new THREE.Vector4(0, 0, -99, 0));
  const u = {
    uCell: U.uCell, uDim: o.noDim ? { value: 0 } : U.uDim, uTime: { value: 0 },
    uClock: { value: 0 }, uA: { value: o.A ?? 0.5 }, uK: { value: o.k ?? 0.3 }, uSp: { value: o.sp ?? 1 }, uPh: { value: o.ph ?? 0 }, uTop: { value: y },
    uDeepH: { value: o.deepH ?? 6 }, uDeepAmt: { value: o.deepAmt ?? 0.6 }, uFoam: { value: o.foam ?? 1 }, uFoamW: { value: o.foamW ?? 0.12 },
    uGlint: { value: o.glint ?? 0.6 }, uRows: { value: o.rows ?? 3 }, uShiver: { value: 0 }, uRaster: { value: o.raster ?? 0 },
    uBase: { value: new THREE.Color(o.base ?? C.blue) }, uDeep: { value: new THREE.Color(o.deep ?? C.black) },
    uFoamC: { value: new THREE.Color(o.foamC ?? C.paper) }, uShade: { value: new THREE.Color(o.shade ?? C.black) },
    uRings: { value: rings },
  };
  const m = new THREE.Mesh(g, new THREE.ShaderMaterial({ uniforms: u, vertexShader: SEA_VS, fragmentShader: SEA_FS, side: THREE.DoubleSide }));
  m.position.z = z;
  m.frustumCulled = false;
  parent.add(m);
  const W = { A: u.uA.value, k: u.uK.value, sp: u.uSp.value, ph: u.uPh.value };
  const band = {
    mesh: m, u, rings, W, y, z, x0, x1, bottom,
    // aseta aaltojen korkeus ja aika (sama arvo JS:lle ja varjostimelle)
    tw: 0,
    set(tw, A, t = 0) { W.A = A; u.uA.value = A; u.uTime.value = tw; u.uClock.value = t; band.tw = tw; },
    surf: (x) => y + waveY(W, x, band.tw),
    slope: (x) => waveSlope(W, x, band.tw),
  };
  m.userData.edge = { name: o.name ?? 'meri', x0, x1, y0: bottom, y1: y + 2 };
  return band;
}

// --- Laiva ---------------------------------------------------------------------------------------
// Pitkä paperilaiva, jonka keula kaartuu käyrätorven kelloksi. Neliöpurje raakapuussa (taso,
// nähty edestä), mastonhuipussa viiri. Purjeen korkeus = hoist (0..1), pullistuma = tuuli.
// Paikallinen koordinaatisto: kansi y = 0, keula +x.
const NU = 14, NV = 10, NB = 22;
function gridGeo(nu, nv) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nu * nv * 3), 3));
  const uv = new Float32Array(nu * nv * 2);
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { uv[(j * nu + i) * 2] = i / (nu - 1); uv[(j * nu + i) * 2 + 1] = j / (nv - 1); }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  const idx = [];
  for (let j = 0; j < nv - 1; j++) for (let i = 0; i < nu - 1; i++) { const a = j * nu + i; idx.push(a, a + 1, a + nu, a + 1, a + nu + 1, a + nu); }
  g.setIndex(idx);
  return g;
}
export function hullShape(L = 10) {
  const h = L / 10;
  const pts = [[-4.6 * h, 0.15 * h], [-5.3 * h, 0.9 * h], [-5.6 * h, 1.7 * h], [-5.2 * h, 2.0 * h], [-5.0 * h, 1.5 * h], [-4.9 * h, 0.4 * h]];
  // pohja kaarena
  for (let i = 0; i <= 16; i++) { const u = i / 16; pts.push([(-4.7 + 9.2 * u) * h, (-1.25 * Math.sin(Math.PI * Math.pow(u, 0.9)) + 0.1) * h]); }
  // keula nousee kaulaksi
  pts.push([4.9 * h, 0.5 * h], [5.2 * h, 1.4 * h], [5.25 * h, 2.4 * h]);
  pts.push([5.5 * h, 0.0 + 2.4 * h]);
  pts.push([5.0 * h, 2.4 * h], [4.8 * h, 1.2 * h], [4.4 * h, 0.15 * h]);
  return poly(pts);
}
export function bellShape(s = 1) {
  // käyrätorven kello keulan päässä (avautuu ylös ja eteen)
  return poly([[-0.12 * s, 0], [0.12 * s, 0], [0.18 * s, 0.35 * s], [0.42 * s, 0.75 * s], [0.75 * s, 0.98 * s], [-0.35 * s, 1.15 * s], [-0.15 * s, 0.7 * s], [-0.12 * s, 0.35 * s]]);
}

export function ship(parent, o = {}) {
  const L = o.len ?? 10;
  const h = L / 10;
  const root = group(parent, {});
  const body = group(root, {});   // keinuu aallolla
  // ghost: peilikuva tyynessä vedessä (rasteroitu sinisellä, ei läpinäkyvyyttä)
  const G = o.ghost ? 0.55 : 0;
  const hullMat = o.ghost ? ink(C.blue, { shade: C.black, raster: 0.55 }) : ink(o.hull ?? C.black, { shade: C.blue, raster: o.hullRaster ?? 0 });
  const rimMat = ink(C.paper, { shade: C.blue, raster: G });
  const hs = hullShape(L);
  flat(body, hs, hullMat, { z: 0 });
  flat(body, outline(hs, 0.09 * h), rimMat, { z: 0.01 });
  // kellokeula
  const bell = group(body, { x: 5.4 * h, y: 2.3 * h, z: 0.02 });
  bell.rotation.z = -0.5;
  flat(bell, bellShape(1.2 * h), hullMat, {});
  flat(bell, outline(bellShape(1.2 * h), 0.08 * h), rimMat, { z: 0.01 });
  // kilvet laidalla
  const shieldMats = [ink(C.paper, { shade: C.blue, raster: 0.25 }), ink(o.sailC ?? C.red, { shade: C.black, raster: 0.25 })];
  for (let i = 0; i < 6; i++) {
    const x = (-3.2 + i * 1.25) * h;
    flat(body, circle(0.42 * h, 20), shieldMats[i % 2], { x, y: 0.05 * h, z: 0.03 });
    flat(body, circle(0.12 * h, 12), hullMat, { x, y: 0.05 * h, z: 0.04 });
  }
  // masto ja raakapuu
  const MH = (o.mast ?? 9.5) * h;
  const mastMat = ink(C.black, {});
  flat(body, rect(0.16 * h, MH, 0.5, 0), mastMat, { y: -0.2 * h, z: -0.2 });
  const SW = (o.sailW ?? 6.4) * h;
  const SB = 0.9 * h;
  const SH = MH - SB - 0.9 * h;
  const yard = flat(body, rect(SW + 0.6 * h, 0.16 * h, 0.5, 0.5), mastMat, { z: -0.12 });
  const sailMat = o.ghost ? ink(C.blue, { shade: C.paper, raster: 0.3 }) : ink(o.sailC ?? C.red, { shade: C.black, raster: o.sailRaster ?? 0, grad: o.sailGrad ?? null });
  const sailGeo = gridGeo(NU, NV);
  const sail = new THREE.Mesh(sailGeo, sailMat);
  sail.frustumCulled = false;
  sail.position.z = -0.15;
  body.add(sail);
  // purjeen ääriviiva (paperinvalkoinen) reunojen mukaan
  const edgeGeo = new THREE.BufferGeometry();
  const NE = 2 * (NU + NV) - 4 + 1;
  edgeGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NE * 2 * 3), 3));
  const eidx = [];
  for (let k = 0; k < NE - 1; k++) { const a = 2 * k; eidx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  edgeGeo.setIndex(eidx);
  const sailEdge = new THREE.Mesh(edgeGeo, ink(o.edgeC ?? C.black, {}));
  sailEdge.frustumCulled = false;
  sailEdge.position.z = -0.14;
  body.add(sailEdge);
  // viiri mastonhuipussa
  const penGeo = new THREE.BufferGeometry();
  penGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NB * 2 * 3), 3));
  penGeo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(NB * 2 * 2), 2));
  const pidx = [];
  for (let k = 0; k < NB - 1; k++) { const a = 2 * k; pidx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  penGeo.setIndex(pidx);
  const penMat = ink(o.penC ?? C.red, { shade: C.black, raster: 0 });
  const pennant = new THREE.Mesh(penGeo, penMat);
  pennant.frustumCulled = false;
  pennant.position.z = -0.1;
  body.add(pennant);
  const masthead = flat(body, poly([[-0.2 * h, 0], [0.2 * h, 0], [0, 0.45 * h]]), ink(C.paper), { y: MH - 0.2 * h, z: -0.1 });
  void masthead;
  // kapteeni keulassa
  let cap = null;
  if (o.captain) {
    cap = knight(body, { raster: o.ghost ? 0.5 : o.capRaster ?? 0, thin: o.thin });
    cap.root.position.set(4.25 * h, 0.05 * h, 0.3);
    cap.root.scale.setScalar(1.15 * h);
  }
  const sp = sailGeo.getAttribute('position');
  const ep = edgeGeo.getAttribute('position');
  const pp = penGeo.getAttribute('position');
  const grid = Array.from({ length: NU * NV }, () => [0, 0]);

  // s: { hoist 0..1, wind 0..1, snap 0..1 (isku: napsahdus), slack 0..1 (tyven), t }
  function setSail(s) {
    const hz = clamp(s.hoist);
    const wb = clamp(s.wind) * (1 - (s.slack ?? 0)) + 0.6 * (s.snap ?? 0);
    const top = SB + SH * hz;
    yard.position.y = SB + SH * Math.max(hz, 0.02);
    yard.visible = true;
    const H = SH * hz;
    for (let j = 0; j < NV; j++) {
      const v = j / (NV - 1);            // 0 raakapuu, 1 alareuna
      for (let i = 0; i < NU; i++) {
        const u = i / (NU - 1);
        const cu = 2 * u - 1;
        const belly = Math.sin(Math.PI * Math.min(1, v * 1.05));
        let x = cu * SW * 0.5 * (1 + 0.12 * wb * belly) + wb * 0.55 * h * belly * (1 - 0.3 * cu * cu);
        let y = top - H * v - wb * 0.35 * h * Math.sin(Math.PI * u) * v * v * (H / (SH + 1e-6));
        // tyvenessä purje roikkuu ja rypistyy
        const sl = s.slack ?? 0;
        // tyven: purje roikkuu poimuilla, alareuna painuu ja kangas kapenee
        if (sl > 0) { x = mix(x, cu * SW * 0.4, sl) - sl * Math.sign(cu) * Math.abs(cu) * 0.45 * h * Math.abs(Math.sin(v * Math.PI * 3.2)); y -= sl * 0.9 * h * Math.pow(Math.abs(cu), 3) * (1 - v) * (H / (SH + 1e-6)); }
        // pieni lepatus heikossa tuulessa (kangas elää, ei iskuja)
        y += (1 - wb) * 0.05 * h * Math.sin(5 * u - 4 * (s.t ?? 0)) * v;
        grid[j * NU + i][0] = x; grid[j * NU + i][1] = y;
        sp.setXYZ(j * NU + i, x, y, 0);
      }
    }
    sp.needsUpdate = true;
    sail.visible = hz > 0.01;
    sailEdge.visible = sail.visible;
    // reunaviiva: ylä, oikea, ala, vasen
    const ring = [];
    for (let i = 0; i < NU; i++) ring.push(grid[i]);
    for (let j = 1; j < NV; j++) ring.push(grid[j * NU + NU - 1]);
    for (let i = NU - 2; i >= 0; i--) ring.push(grid[(NV - 1) * NU + i]);
    for (let j = NV - 2; j >= 0; j--) ring.push(grid[j * NU]);
    const wE = 0.08 * h;
    for (let k = 0; k < NE; k++) {
      const a = ring[Math.max(0, k - 1)], b = ring[Math.min(NE - 1, k + 1)], P = ring[Math.min(NE - 1, k)];
      let dx = b[0] - a[0], dy = b[1] - a[1];
      const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      ep.setXYZ(2 * k, P[0] - dy * wE, P[1] + dx * wE, 0);
      ep.setXYZ(2 * k + 1, P[0] + dy * wE, P[1] - dx * wE, 0);
    }
    ep.needsUpdate = true;
    // viiri: osoittaa tuulen suuntaan (+x); tyvenessä roikkuu
    const t = s.t ?? 0;
    const wp = clamp(clamp(s.wind) * (1 - (s.slack ?? 0)) + 0.8 * (s.snap ?? 0));
    const ang = mix(-1.35, -0.08, wp);
    const len = (o.penLen ?? 3.6) * h * Math.max(0.05, s.pen ?? 1);
    const w0 = 0.55 * h;
    for (let k = 0; k < NB; k++) {
      const u = k / (NB - 1);
      const ph = u * 5.5 - t * 6.5;   // vakiotaajuus: aalto kulkee aina kärkeen päin, voima muuttaa vain amplitudia
      const amp = (0.08 + 0.3 * wp + 0.35 * (s.snap ?? 0)) * u * h;
      const x = Math.cos(ang) * len * u + Math.sin(ph) * amp * -Math.sin(ang);
      const y = MH + 0.05 * h + Math.sin(ang) * len * u + Math.sin(ph) * amp * Math.cos(ang);
      const ww = w0 * (1 - 0.85 * u);
      pp.setXYZ(2 * k, x, y, 0);
      pp.setXYZ(2 * k + 1, x + Math.sin(ang) * ww, y - Math.cos(ang) * ww, 0);
    }
    pp.needsUpdate = true;
    pennant.visible = (s.pen ?? 1) > 0.01;

  }
  // aseta laiva aallon päälle: x, y, kallistus aallon rinteen mukaan (tasoitettu)
  function place(x, y, z, tilt = 0, sc = 1) {
    root.position.set(x, y, z);
    root.scale.setScalar(sc);
    body.rotation.z = tilt;
  }
  // kapteenin asento: soitto (0..1) fraasin verhokäyrästä; dark tummentaa
  function poseCaptain(play, t, wind, extra = {}) {
    if (!cap) return;
    const p = kmix(kmix(KP.proud, KP.stand, 0.25), KP.call, clamp(play));
    poseKnight(cap, { ...p, ...extra }, t, wind);
  }
  const mats = [hullMat, rimMat, sailMat, penMat, mastMat, ...shieldMats, ...(cap ? cap.mats : [])];
  return { root, body, sail, sailMat, sailEdge, pennant, penMat, yard, cap, setSail, place, poseCaptain, MH, SW, SB, SH, h, mats, hullMat };
}
// Laiva aallolla: sijoita kaistan pinnalle, kallistus aallon rinteestä (keskiarvo rungon yli).
export function ride(sh, band, x, t, o = {}) {
  const L = 10 * sh.h * (o.sc ?? 1);
  const yA = band.surf(x - L * 0.35, t), yB = band.surf(x + L * 0.35, t);
  const y = (yA + yB) / 2 + (o.dy ?? 0) - 0.55 * sh.h * (o.sc ?? 1);
  const tilt = Math.atan2(yB - yA, L * 0.7) * (o.tiltK ?? 0.8);
  sh.place(x, y, o.z ?? band.z + 0.5, tilt, o.sc ?? 1);
  return { y, tilt };
}

// --- Perästä nähty laiva (selkäkuva): purje edestä, kapteeni perässä selkä kameraan ------------
export function sternShip(parent, o = {}) {
  const root = group(parent, {});
  const hullMat = ink(C.black, {});
  const rimMat = ink(C.paper, {});
  const st = [];
  for (let i = 0; i <= 20; i++) { const a = Math.PI + (i / 20) * Math.PI; st.push([2.6 * Math.cos(a), 0.4 + 1.6 * Math.sin(a)]); }
  st.push([2.9, 1.0], [2.5, 0.6], [-2.5, 0.6], [-2.9, 1.0]);
  const hs = poly(st);
  flat(root, hs, hullMat, { z: 0 });
  flat(root, outline(hs, 0.08), rimMat, { z: 0.01 });
  flat(root, rect(0.18, 10, 0.5, 0), ink(C.black), { y: 0.3, z: -3 });
  const sailMat = ink(C.red, { shade: C.black, raster: 0 });
  const sailGeo = gridGeo(NU, NV);
  const sail = new THREE.Mesh(sailGeo, sailMat);
  sail.frustumCulled = false;
  sail.position.z = -2.9;
  root.add(sail);
  const yard = flat(root, rect(7.2, 0.2, 0.5, 0.5), ink(C.black), { z: -2.85 });
  const capB = knightBack(root);
  capB.root.position.set(0.2, 0.55, 0.3);
  capB.root.scale.setScalar(1.25);
  const sp = sailGeo.getAttribute('position');
  function setSail(s) {
    const hz = clamp(s.hoist);
    const wb = clamp(s.wind) * (1 - (s.slack ?? 0));
    const SB = 1.4, SH = 7.6;
    const top = SB + SH * hz;
    yard.position.y = SB + SH * Math.max(hz, 0.02);
    for (let j = 0; j < NV; j++) {
      const v = j / (NV - 1);
      for (let i = 0; i < NU; i++) {
        const u = i / (NU - 1);
        const cu = 2 * u - 1;
        const x = cu * 3.3 * (1 + 0.1 * wb * Math.sin(Math.PI * v));
        const y = top - SH * hz * v + wb * 0.6 * hz * Math.sin(Math.PI * u) * v * v + 0.04 * (1 - wb) * Math.sin(4 * u - 3 * (s.t ?? 0)) * v;
        sp.setXYZ(j * NU + i, x, y, 0);
      }
    }
    sp.needsUpdate = true;
    sail.visible = hz > 0.01;
  }
  return { root, setSail, capB, sailMat, mats: [hullMat, rimMat, sailMat, ...capB.mats] };
}

// --- Tiirat (puupuhaltimet) --------------------------------------------------------------------
// Parvi: jokainen lintu kulkee oman kaarensa; siivet lyövät puupuhallinten fraasin tahdissa
// (tasoitettu energia nostaa lyöntitaajuutta, ei yksittäiset nuotinalut).
export function terns(parent, n, o = {}) {
  const body = ink(C.paper, {});
  const cap = ink(C.black, {});
  const shp = swallowShape();
  const birds = Array.from({ length: n }, (_, i) => {
    const g = group(parent, {});
    const b = flat(g, shp, body, {});
    flat(g, circle(0.07, 10, 0.24, 0.02), cap, { z: 0.01 });
    flat(g, outline(shp, 0.025), cap, { z: 0.005 });
    g.visible = false;
    return { g, b, i };
  });
  return { birds, mats: [body, cap] };
}

// --- Roiske (patarummut, aksentit): pölypilven tapaan nouseva vaahto -------------------------
export function splashes(parent, n, o = {}) {
  const mats = [];
  const list = Array.from({ length: n }, (_, i) => {
    const m = ink(C.paper, { shade: C.blue, raster: o.raster ?? 0.15 });
    mats.push(m);
    // roiskeen kruunu: piikit ylös, pyöreä pohja (ei laatikkoa)
    const crown = [];
    for (let j = 0; j <= 18; j++) { const u = j / 18; const tip = j % 2 === 1; crown.push([(u - 0.5) * 2.4, tip ? 0.7 + 0.6 * hash1(i * 31 + j) : 0.15 + 0.1 * hash1(i * 7 + j)]); }
    for (let j = 12; j >= 0; j--) { const a = Math.PI * j / 12; crown.push([1.2 * Math.cos(a), -0.35 * Math.sin(a)]); }
    const g = flat(parent, poly(crown), m, { z: o.z ?? 0.4 });
    g.visible = false;
    return g;
  });
  // e: { t, x, y, s }: näkyy iskun ruudulla (LEAD ennen), kasvaa ja haihtuu rasterina
  function set(t, events, LEAD) {
    list.forEach((g, i) => {
      const e = events[i];
      if (!e) { g.visible = false; return; }
      const a = t - (e.t - LEAD);
      g.visible = a >= 0 && a < 1.0;
      if (!g.visible) return;
      // iskun ruudulla roiske on heti lähes täysi (suurin muutos osuu iskuun), sitten laajenee hiukan
      const r = e.s * (0.9 + 0.45 * Math.pow(clamp(a / 0.35), 0.5));
      g.position.set(e.x, e.y + 0.25 * a * e.s, g.position.z);
      g.scale.set(r, r * (1.1 + 0.35 * a), 1);
      mats[i].uniforms.uAppear.value = 1 - smoothstep(0.35, 0.95, a);
    });
  }
  return { list, set, mats };
}

// Kallio / niemi: yläreuna kohinasta, pystyreunat aina kuvan ulkopuolella (x0..x1 leveä).
export function cliffPts(x0, x1, f, n = 160) {
  const pts = [];
  for (let i = 0; i <= n; i++) { const x = x0 + ((x1 - x0) * i) / n; pts.push([x, f(x)]); }
  return pts;
}

export { knight, knightBack, poseKnight, KP, kmix };

// --- Jaetut aikasarjat (lasketaan kerran) -------------------------------------------------------
// smooth(f, s): funktion f(t) gaussinen tasoitus (s sekuntia) koko aikajanalle -> puhdas sampler.
// integ(f): kertymä ∫f dt (pilvien ja usvien ajelehdinta: nopeus soittimesta, sijainti puhdas).
export function common(S) {
  if (S._purje) return S._purje;
  const n = S.n;
  const arr = (f) => { const a = new Float32Array(n); for (let i = 0; i < n; i++) a[i] = f(i / 30); return a; };
  const smooth = (f, s) => sampler(gaussian(arr(f), Math.max(1, s * 30)), 30);
  const integ = (f) => { const a = arr(f); let acc = 0; for (let i = 0; i < n; i++) { acc += a[i] / 30; a[i] = acc; } return sampler(a, 30); };
  // tyven: näytös II alusta siihen, kun sankari nousee (kuvakäsikirjoitus, luku 2: poikkeus)
  const calm = [[S.T_WID - 0.5, S.A('wid_sankari_nousee').t]];
  const wind = makeWind(S, calm);
  const horns = smooth((t) => smoothstep(0.3, 0.8, S.energy.horns(t)), 0.6);
  const winds = smooth((t) => clamp(S.fam.winds(t)), 1.5);
  const lows = smooth((t) => S.energy.lows(t), 1.5);
  const strings = smooth((t) => clamp(Math.max(S.fam.strings(t), S.energy.violins(t))), 1.2);
  const loudS = smooth((t) => S.loud(t), 2.0);
  const drift = integ((t) => 0.4 + 2.5 * winds(t));
  // tuulen viivoituksen kulku: kertymä, joten viivat kulkevat aina tuulen suuntaan
  const windX = integ((t) => 6 * (0.5 + wind(t)));
  const lowsI = integ((t) => lows(t));
  const swellT = integ((t) => 0.6 + 0.9 * strings(t));   // mainingin vaihe: nopeus jousista
  S._purje = { smooth, integ, wind, horns, winds, lows, strings, loudS, drift, swellT, calm, windX, lowsI };
  return S._purje;
}

// Purjeen heijastus tyynessä vedessä: katkonaiset vaakaviivat (ei yhtenäistä suorakaidetta).
// Viivat lepattavat hiukan veden mukana; leveys kapenee syvemmälle.
export function reflectDashes(parent, n = 9, color = C.red) {
  const m = ink(color, { shade: C.blue, raster: 0.35 });
  const list = Array.from({ length: n }, (_, k) => flat(parent, rect(1, 0.16, 0.5, 0.5), m, {}));
  return {
    mat: m,
    set(x, y0, w, h, z, t, amt = 1) {
      list.forEach((d, k) => {
        const u = (k + 0.5) / n;
        d.visible = amt > 0.02;
        const ww = w * (1 - 0.35 * u) * (0.7 + 0.3 * Math.sin(k * 2.3 + t * 1.1));
        d.position.set(x + 0.25 * Math.sin(k * 1.7 + t * 0.9), y0 - h * u, z);
        d.scale.set(ww, 1 + 0.6 * u, 1);
      });
      m.uniforms.uAppear.value = amt;
    },
  };
}
