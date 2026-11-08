// Punainen muste, A-puoli (runs/muste-1230/storyboard.md). Ohjaaja: paikat ja siirtymät ankkureista,
// otsikot, slate, tarkistusrajapinnat. Muste syntyy paikoissa keihään kärjestä (brush.js tipTrail),
// ei kameraan kiinnitettynä nauhana.
//   ?mode=render|preview  &debug=1  &slate=1 (slate kuvan alla, kuva 1920x1000)  &check=1 (tyhjä tausta magentana)
//   window.seek(t), camProbe(t), leakProbe(t), opasProbe(t), sceneTimes(), duration, sceneReady

import * as THREE from 'three';
import { U, C, createPost } from './ink.js';
import { createSignals } from './signals.js';
import { loadSide } from './data.js';
import { themeLine, TRAILS } from './brush.js';
import { buildRecord } from './record.js';
import { SCENES_1 } from './scenes_1.js';
import { SCENES_2 } from './scenes_2.js';
import { SCENES_3 } from './scenes_3.js';
import { SCENES_4 } from './scenes_4.js';
import { LEADERS, setSashDefault } from './hero.js';
import { PUPPETS, bodyDist, updateBackSashes } from './puppets.js';
import { dirOf } from './companion.js';
import { clamp, smoothstep, hash1 } from '../util.js';
import * as valley from './loc_valley.js';
import * as sea from './loc_sea_muste.js';
import * as meadow from './loc_meadow.js';
import * as storm from './loc_storm.js';
import * as swamp from './loc_swamp.js';
import * as shore from './loc_shore.js';
import * as battle from './loc_battle.js';

const params = new URLSearchParams(location.search);
const mode = params.get('mode') || 'preview';
const debug = params.get('debug') === '1';
const slate = params.get('slate') === '1';
const check = params.get('check') === '1';
const W = 1920, H = slate ? 1000 : 1080;
const PACKS = [
  { dir: 'build/demo400', from: 0, to: 400 },
  { dir: 'build/A2', from: 400, to: 810 },
  { dir: 'build/A3', from: 810, to: 1258 },
];
const fmt = (t) => { const m = Math.floor(t / 60); const s = t - 60 * m; return `A ${m}:${s.toFixed(1).padStart(4, '0')}`; };

function drawTitle(post, key) {
  const g = post.titleCtx;
  g.clearRect(0, 0, W, H);
  g.textAlign = 'center';
  if (key === 'main') {
    g.fillStyle = '#1F1A18';
    g.font = '600 34px Georgia';
    g.fillText('R I C H A R D   S T R A U S S', W / 2, H * 0.36);
    g.font = '700 132px Georgia';
    g.fillText('EIN HELDENLEBEN', W / 2, H * 0.5);
    g.font = 'italic 38px Georgia';
    g.fillText('op. 40  ·  Wiener Philharmoniker  ·  Clemens Krauss', W / 2, H * 0.58);
  } else if (key && key.startsWith('act')) {
    const [num, name] = { act1: ['I', 'Der Held'], act2: ['II', 'Des Helden Widersacher'], act3: ['III', 'Des Helden Gefährtin'], act4: ['IV', 'Des Helden Walstatt'] }[key];
    g.font = 'italic 40px Georgia';
    const w2 = 120 + g.measureText(name).width;
    g.fillStyle = '#E8DCC6';
    g.fillRect(80, 70, w2, 92);
    g.fillStyle = '#F5461A';
    g.fillRect(80, 162, w2, 6);
    g.fillStyle = '#1F1A18';
    g.textAlign = 'left';
    g.font = '700 46px Georgia';
    g.fillText(num, 104, 132);
    g.font = 'italic 40px Georgia';
    g.fillText(name, 104 + (num.length * 22 + 26), 132);
  }
  post.titleChanged();
}

try {
  const view = document.getElementById('view');
  view.width = W; view.height = H;
  const data = await loadSide(PACKS);
  const S = createSignals(data);
  const tv = await (await fetch('/build/demo400/teemaviiva.json')).json();
  const TL = themeLine(S, tv);
  const A = (id) => S.A(id).t;
  const duration = S.T_END;
  const segTais = S.segs.filter((s) => s.a > A('wal_taistelu') + 3 && s.a < A('wal_taistelu') + 15)[0]?.a ?? A('wal_taistelu') + 7;
  const resolve = (id) => (id === '@0' ? 0 : id === '@end' ? duration : id === '@seg:wal_taistelu' ? segTais : A(id));
  // kohtaukset osittain: 1 sankari, 2 vastustajat, 3 kumppani, 4 taistelu (docs/tuotantojako.md)
  const SCENES = [...SCENES_1, ...SCENES_2, ...SCENES_3, ...SCENES_4];
  const SCN = SCENES.map(([n, a, b, name, music, image, o]) => ({ n, a: resolve(a), b: resolve(b), name, music, image, ...o }));
  SCN.forEach((s) => { if (s.b < s.a) throw new Error(`kohtaus ${s.n}: loppu ennen alkua`); });
  const sceneAt = (t) => { let s = SCN[0]; for (const x of SCN) if (t >= x.a) s = x; return s; };

  const renderer = new THREE.WebGLRenderer({ canvas: view, antialias: false, preserveDrawingBuffer: true, alpha: false });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  const MAGENTA = new THREE.Color(1, 0, 1);
  renderer.setClearColor(check ? MAGENTA : C.paper, 1);
  const post = createPost(renderer, W, H);

  // --- hahmon haalistuminen friisiin (kohtaukset 15-16, kevyt versio: raster + kaksi vetoa) ---
  const tR6 = A('held_reh6'), tT61 = A('held_t61'), tR8 = A('held_reh8');
  const heroFade = (t) => smoothstep(tR6 + 2, tR6 + 9, t) * (1 - smoothstep(tT61 + 2, tT61 + 11, t));
  const K = { S, TL, LEAD: 1 / 30, check, fx: { heroFade }, viuluviiva: await fetch('/build/koko/viuluviiva_A.json').then((r) => (r.ok ? r.json() : null)).catch(() => null) };
  const at = (id) => A(id);
  // Ritarin vyö (sash.js, palaute A11): kumppanin viiva kietoutuu ritarin ympärille kosinnan huipussa ja pysyy
  // osana hahmoa lopun elokuvaa (taistelu, B-puoli). Osa voi ohittaa oletuksen: place(..., { sash: { t0, amount(t) }, sashSignal(t) }).
  // Viuluviivan varmuus (sooloviulu) värisyttää viivaa, kun viulu soi.
  {
    const dir = dirOf(K.viuluviiva);
    setSashDefault({ t0: at('gef_huippu'), dur: 8, signal: (t) => smoothstep(0.05, 0.3, dir(t).conf) });
  }

  // --- paperikehys (kohtaus 0): kermapaperi, lyijykynäluonnos ---
  function paperLoc() {
    const scene = new THREE.Scene();
    scene.background = C.paper.clone();
    const m = new THREE.MeshBasicMaterial({ color: 0xb9ad98 });
    const pts = Array.from({ length: 60 }, (_, i) => { const x = -40 + i * 1.5; return [x, 3 + 5 * Math.sin(i * 0.31) * Math.sin(i * 0.11 + 1) + 2 * Math.sin(i * 0.9)]; });
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
      const g = new THREE.PlaneGeometry(Math.hypot(x1 - x0, y1 - y0), 0.07);
      const q = new THREE.Mesh(g, m);
      q.position.set((x0 + x1) / 2 + 12, (y0 + y1) / 2, -40);
      q.rotation.z = Math.atan2(y1 - y0, x1 - x0);
      scene.add(q);
    }
    return { scene, update: () => ({ dim: 0 }), shots: [{ name: 'paperi', a: 0, b: 9999, cam: (u, t) => ({ pos: [0.3 * t, 4, 30], look: [0.3 * t + 6, 4, 0], fov: 40 }) }] };
  }
  const paperMod = { build: paperLoc };
  const recMod = {
    build() {
      const R = buildRecord(S, A);
      const dummy = new THREE.PerspectiveCamera(40, W / H, 0.1, 3000);
      return {
        scene: R.scene,
        update: (t) => { R.update(t, dummy); return { dim: 0 }; },
        shots: [{ name: 'levy', a: A('wal_puolenvaihto'), b: 9999, cam: (u, t) => { const k = smoothstep(R.T_REC - 1, S.T_END, t); return { pos: [0, 0, 47 + 15 * k], look: [0, 0, 0], fov: 40 }; } }],
      };
    },
  };

  const LOCS = [
    { id: 'A paperi', mod: paperMod, a: 0, b: at('held_alku') },
    { id: 'B laakso', mod: valley, a: at('held_alku'), b: at('held_lyyrinen') },
    { id: 'C avomeri', mod: sea, a: at('held_lyyrinen'), b: at('held_tunnelma_vaihtuu') },
    { id: 'E niitty', mod: meadow, a: at('held_tunnelma_vaihtuu'), b: at('held_t61') },
    { id: 'F tasanko ja myrsky', mod: storm, a: at('held_t61'), b: S.T_DOM7 + 0.2 },
    { id: 'G suo', mod: swamp, a: S.T_WID - 0.3, b: at('gef_viulu') },
    { id: 'S rantaniitty', mod: shore, a: at('gef_viulu') - 0.9, b: at('wal_kulissi1') },
    { id: 'J taistelukenttä', mod: battle, a: at('wal_kulissi1') - 1.0, b: at('wal_puolenvaihto') },
    { id: 'K levy', mod: recMod, a: (S.segs.find((x) => x.a > at('wal_puolenvaihto') + 1) || { a: at('wal_puolenvaihto') + 2 }).a - 1.5, b: duration + 1 },
  ];
  // Siirtymät: keskikohta, kesto, tapa (0 rasteriliukuma, 1 paperin kautta, -1 leikkaus).
  // Uusi paikka on kokonaan näkyvissä ankkurissa: siirtymä päättyy ankkuriin (keskikohta = ankkuri - kesto/2), joten
  // edellinen paikka ei näy ankkurin jälkeen (palaute 31.10.2026: laakson ritarit meren alla 48 s:ssa). Poikkeukset: myöhästetyt
  // siirtymät (niitty tunnelman vaihtuessa, levyn avaus), jotka ovat tarkoituksella ankkurin jälkeen.
  const endAt = (id, dur, mode) => ({ at: at(id) - dur / 2, dur, mode });
  const PRESS = 3.0;   // uuden paikan painuminen paperisiirtymän lopussa (mode 3), päättyy ankkuriin
  const TRANS = [
    endAt('held_alku', 0.9, 0),
    endAt('held_lyyrinen', 1.4, 0),
    { at: at('held_tunnelma_vaihtuu') + 0.8, dur: 1.6, mode: 0 },
    endAt('held_t61', 1.4, 1),
    { at: S.T_DOM7 + 0.2, dur: 0, mode: -1 },
    endAt('gef_viulu', 1.6, 0),
    { at: at('wal_kulissi1') - PRESS / 2, dur: PRESS, mode: 3, tFix: at('wal_kulissi1') - 1.0 },   // luonnoksen päälle painuu uusi paikka (washAt)
    { at: (S.segs.find((x) => x.a > at('wal_puolenvaihto') + 1) || { a: at('wal_puolenvaihto') + 2 }).a, dur: 3.0, mode: 0 },
  ];
  const locs = LOCS.map((L) => ({ ...L, ...L.mod.build({ ...K, a: L.a, b: L.b }) }));

  // --- Paikkojen välinen paperisiirtymä (palaute A8): vanha paikka kuivuu paperiksi, lyijykynäluonnos uudesta
  // paikasta piirtyy paperille koko hiljaisuuden ajan, ja uusi paikka painuu luonnoksen päälle ankkuriin
  // mennessä. Mikään välivaihe ei näytä toista paikkaa haalistuneena: luonnos on uuden paikan ensimmäisen
  // ruudun reunaviivat (ink.js POST_FS, tS), ei vanhan paikan jäänne. Puhdas ajan funktio ankkureista.
  //   from = hiljaisuuden ankkuri (paperi alkaa), to = uuden paikan ankkuri, next = uuden paikan tunnus.
  //   Tyhjää paperia ilman luonnosta on enintään 2 s: luonnos alkaa piirtyä 2 s ennen kuin paperi on täysi.
  const PAPER_TRANS = [{ from: at('gef_hiljaisuus'), to: at('wal_kulissi1'), next: 'J taistelukenttä' }];
  const washAt = (t) => {
    for (const Wn of PAPER_TRANS) {
      if (t < Wn.from || t >= Wn.to) continue;
      // paperi alkaa vasta 3,5 s hiljaisuuden alusta: 3.22:n teko (ritari nostaa viirin maasta) ehtii näkyä;
      // luonnos alkaa 1,5 s paperin alun jälkeen, joten tyhjää paperia ilman luonnosta on alle 2 s
      const dry = smoothstep(Wn.from + 3.5, Wn.from + 9.5, t);
      // Luonnos piirtyy yhtenä tasaisena pyyhkäisynä paperin kuivuessa aina värin painumisen alkuun asti (jähmettymä
      // 1119,5-1122,7 s, bugilista 8): post-shaderin rintama (ink.js: front = uSk*1.3 - sijainti) kattaa koko kuvan,
      // kun uSk on noin SK_FULL; uSk:n loppu valitaan niin, että kattavuus valmistuu vasta kun uuden paikan väri alkaa
      // painua (Wn.to - PRESS), eikä välissä ole ruutuja, joissa luonnos ei muutu.
      const SK_FULL = 0.78;
      const sk0 = Wn.from + 5.0, sk1 = sk0 + (Wn.to - PRESS - sk0) / SK_FULL;
      return { paper: dry, sk: clamp((t - sk0) / (sk1 - sk0)), next: locs.find((l) => l.id === Wn.next), tFix: Wn.to - 1.0 };
    }
    return { paper: 0, sk: 0 };
  };

  // --- kamera jokaiselle paikalle (friisinauha poistettu 31.10.2026: muste syntyy kärjestä paikoissa) ---
  function mkCam(L) {
    L.cam = new THREE.PerspectiveCamera(40, W / H, 0.1, 3000);
    if (check) L.scene.background = null;
    L.scene.add(L.cam);
  }
  locs.forEach((L, i) => { L.i = i; mkCam(L); });

  // Painolaattojen kohdistusvirhe (ink.js: vain laatat, alle 2 px): jännitteestä, dom7:stä ja taistelusta.
  const misAt = (t) => {
    const dom = smoothstep(A('held_dom7_sointu'), S.T_DOM7, t) * (1 - smoothstep(S.T_DOM7, S.T_WID + 6, t) * 0.5);
    return Math.min(1.8, 0.35 + 1.45 * clamp(0.5 * clamp(S.tension(t)) + 0.8 * dom + 0.4 * smoothstep(A('wal_taistelu'), A('wal_puolenvaihto'), t)));
  };

  const T_END_CARD = duration + 10;
  void T_END_CARD;
  let titleKey = null;
  const gl = renderer.getContext();
  const slateEl = document.getElementById('slate');
  const locAt = (t) => { for (let i = locs.length - 1; i >= 0; i--) if (t >= locs[i].a) return locs[i]; return locs[0]; };
  const transAt = (t) => {
    for (let i = 0; i < TRANS.length; i++) {
      const tr = TRANS[i];
      if (tr.mode >= 0 && Math.abs(t - tr.at) < tr.dur / 2) return { ...tr, A: locs[i], B: locs[i + 1], m: smoothstep(tr.at - tr.dur / 2, tr.at + tr.dur / 2, t) };
    }
    return null;
  };
  const shotOf = (L, t) => { let s = L.shots[0]; L.shots.forEach((x, n) => { if (t >= x.a) { s = x; s.n = n; } }); return s; };
  // kulmanopeus ≤ 20 °/s: tarkistus camcheckillä; tässä vain kameran asetus
  function aim(L, t) {
    const s = shotOf(L, t);
    const u = clamp((t - s.a) / Math.max(0.05, s.b - s.a));
    const c = s.cam(u, t);
    L.cam.position.set(...c.pos);
    L.cam.up.set(0, 1, 0);
    L.cam.fov = c.fov ?? 40;
    L.cam.aspect = W / H;
    L.cam.updateProjectionMatrix();
    L.cam.lookAt(...c.look);
    L.cam.updateMatrixWorld(true);
    return s;
  }
  function step(t) {
    updateBackSashes(t);
    const tr = transAt(t);
    const L = tr ? tr.A : locAt(t);
    const fx = L.update(t) || {};
    const shot = aim(L, t);
    if (L.late) L.late(t);
    L.cam.updateMatrixWorld(true);
    let fxB = null, shotB = null;
    if (tr) { const tB = tr.mode === 3 ? Math.max(t, tr.tFix) : t; fxB = tr.B.update(tB) || {}; shotB = aim(tr.B, tB); if (tr.B.late) tr.B.late(tB); tr.B.cam.updateMatrixWorld(true); }
    return { L, tr, fx, fxB, shot, shotB };
  }

  function overlay(t, st) {
    const u = post.uniforms;
    const fx = st.tr && st.tr.m > 0.5 ? st.fxB : st.fx;
    U.uDim.value = fx.dim ?? 0;
    u.uFlash.value = 0; u.uWood.value = 0; u.uShake.value = 0;
    const gp = smoothstep(S.T_DOM7 + 0.15, S.T_DOM7 + 0.5, t) * (1 - smoothstep(S.T_WID - 0.3, S.T_WID + 1.2, t));
    const wash = washAt(t);
    u.uPaper.value = check ? 0 : Math.max(gp, wash.paper);
    u.uSk.value = check ? 0 : wash.sk;
    let key = null, a = 0;
    const acts = [[S.T0 + 2, 'act1'], [S.T_WID + 0.8, 'act2'], [A('gef_viulu') + 1, 'act3'], [A('wal_kulissi1') + 1, 'act4']];
    if (t > 1.2 && t < S.T0 - 0.3) { key = 'main'; a = smoothstep(1.2, 2.4, t) * (1 - smoothstep(S.T0 - 1.6, S.T0 - 0.4, t)); }
    for (const [ta, k] of acts) if (t > ta && t < ta + 6) { key = k; a = smoothstep(ta, ta + 1, t) * (1 - smoothstep(ta + 4.8, ta + 6, t)); }
    if (check) key = null;
    if (key !== titleKey) { drawTitle(post, key); titleKey = key; }
    u.uTitle.value = key ? a : 0;
    let k = 0;
    for (const d of post.dust) d.set(0, 0, 0, 0);
    for (let q = 0; q < S.clicks.length && k < 24 && !check; q++) {
      const [tc, s] = S.clicks[q];
      const life = s > 0.55 ? 0.45 : 0.1;
      if (tc > t || t - tc > life) continue;
      post.dust[k++].set(hash1(q * 3 + 1) * W, hash1(q * 3 + 2) * H, 1.2 + 4.5 * Math.min(1, s), (hash1(q * 3 + 3) > 0.45 ? 1 : -1) * (0.5 + 0.4 * s) * (1 - ((t - tc) / life) * 0.5));
    }
    u.uMis.value = 0;   // RGB-kanavasiirto poistettu (syaani); kohdistusvirhe on laatoissa (U.uMis, ink.js)
    u.uGrain.value = check ? 0 : 0.05 + 0.6 * clamp(S.hiss(t) * 20) + (t < S.T0 ? 0.25 * (0.5 + 0.5 * Math.sin(t * 9)) * smoothstep(S.T_NEEDLE - 0.2, S.T_NEEDLE + 0.3, t) : 0);
    if (st.tr) { u.uMix.value = st.tr.m; u.uMode.value = st.tr.mode; } else u.uMix.value = 0;
  }

  // Luonnoksen lähde: uuden paikan ensimmäinen ruutu (tFix) omaan kuvapuskuriin; post-shader piirtää siitä reunaviivat.
  // Otto 83 (kierros 4): ink.js:n skEdge näyttelee tekstuuria yhdeksän pikselin päästä; ClampToEdge-oletuksella kuvan reunassa
  // luettiin yksi ja sama rasteripiste (ei keskiarvoa), joten reunaan syntyi pystysuora pisteviiva (vasen reuna, 1118 s).
  // Peilattu toisto jatkaa kuvaa reunan yli samalla rasterilla, jolloin reunaviivaa ei synny. Vain luonnoksen lähde (tS).
  post.rtS.texture.wrapS = post.rtS.texture.wrapT = THREE.MirroredRepeatWrapping;
  function sketchPass(t) {
    const w = washAt(t);
    if (!(w.sk > 0) || !w.next) return;
    const Bx = w.next;
    U.uMis.value = 0;
    U.uDim.value = (Bx.update(w.tFix) || {}).dim ?? 0;
    aim(Bx, w.tFix);
    if (Bx.late) Bx.late(w.tFix);
    Bx.cam.updateMatrixWorld(true);
    renderer.setRenderTarget(post.rtS);
    renderer.render(Bx.scene, Bx.cam);
  }
  window.seek = (t) => {
    t = clamp(t, 0, duration);
    sketchPass(t);
    const st = step(t);
    U.uDim.value = ((st.tr && st.tr.m > 0.5 ? st.fxB : st.fx).dim) ?? 0;
    U.uMis.value = check ? 0 : misAt(t);
    renderer.setRenderTarget(post.rtA);
    renderer.render(st.L.scene, st.L.cam);
    if (st.tr) { renderer.setRenderTarget(post.rtB); renderer.render(st.tr.B.scene, st.tr.B.cam); }
    overlay(t, st);
    post.render();
    const sc = sceneAt(t);
    if (slate && slateEl) {
      slateEl.hidden = false;
      const i = SCN.indexOf(sc);
      const b = SCN[i + 1] ? SCN[i + 1].a : duration;
      const cut = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
      slateEl.innerHTML = `<div class="h"><b>Kohtaus ${sc.n}</b> · ${sc.name} · ${fmt(sc.a)} – ${fmt(b)} · kesto ${(b - sc.a).toFixed(1)} s · ruutu ${fmt(t)} · paikka ${sc.paikka}</div><div><i>Musiikki:</i> ${cut(sc.music, 220)}</div><div><i>Kuva:</i> ${cut(sc.image, 220)}</div>`;
    }
    if (debug) {
      const hud = document.getElementById('hud');
      hud.hidden = false;
      hud.textContent = `t ${t.toFixed(2)} kohtaus ${sc.n} paikka ${st.L.id} otto ${st.shot.name}`;
    }
    return !gl.isContextLost();
  };
  window.camProbe = (t) => {
    const st = step(clamp(t, 0, duration));
    const c = st.L.cam;
    return { loc: st.L.id, shot: `${st.L.id}/${st.shot.name}`, cut: st.shot.a, p: c.position.toArray(), q: c.quaternion.toArray(), fov: c.fov, trans: !!st.tr };
  };
  window.sceneTimes = () => SCN.map((s, i) => { const b = SCN[i + 1] ? SCN[i + 1].a : duration; return { n: s.n, a: s.a, b, key: s.a + (b - s.a) * (s.key ?? 0.5), name: s.name }; });

  // --- Lavasteiden reunojen tarkistus (render/kohtauscheck.mjs), kuten purjeessa ---
  const rtC = new THREE.WebGLRenderTarget(384, 216, { samples: 0, type: THREE.UnsignedByteType });
  const pix = new Uint8Array(384 * 216 * 4);
  const ndc = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
  const box = new THREE.Box3();
  const v3 = new THREE.Vector3();
  function viewAtZ(cam, z) {
    const out = [];
    for (const [x, y] of ndc) {
      const p = new THREE.Vector3(x, y, 0.5).unproject(cam);
      const d = p.sub(cam.position).normalize();
      if (Math.abs(d.z) < 1e-6) return null;
      const s = (z - cam.position.z) / d.z;
      if (s <= 0) return null;
      out.push([cam.position.x + d.x * s, cam.position.y + d.y * s]);
    }
    return out;
  }
  function edgeLeaks(L) {
    const res = [];
    L.scene.updateMatrixWorld(true);
    L.scene.traverse((m) => {
      const e = m.userData && m.userData.edge;
      if (!e || !m.visible) return;
      for (let p = m.parent; p; p = p.parent) if (!p.visible) return;
      m.getWorldPosition(v3);
      let x0, x1, y0;
      if (e.x0 !== undefined) { const sx = m.matrixWorld.elements[0]; x0 = v3.x + e.x0 * sx; x1 = v3.x + e.x1 * sx; y0 = v3.y + e.y0 * m.matrixWorld.elements[5]; }
      else { if (!m.geometry.boundingBox) m.geometry.computeBoundingBox(); box.copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld); x0 = box.min.x; x1 = box.max.x; y0 = box.min.y; }
      const vw = viewAtZ(L.cam, v3.z);
      if (!vw) return;
      const vx0 = Math.min(...vw.map((p) => p[0])), vx1 = Math.max(...vw.map((p) => p[0])), vy0 = Math.min(...vw.map((p) => p[1]));
      const over = Math.max(x0 - vx0, vx1 - x1, e.noBottom ? 0 : y0 - vy0, 0);
      res.checked = (res.checked || 0) + 1;
      if (over > 1e-3) res.push(`${e.name}:${over.toFixed(1)}`);
    });
    return res;
  }
  window.leakProbe = (t) => {
    t = clamp(t, 0, duration);
    const st = step(t);
    const out = { t, loc: st.L.id, shot: st.shot.name, magenta: 0, layers: [] };
    U.uMis.value = 0;
    for (const Lx of [st.L, ...(st.tr ? [st.tr.B] : [])]) {
      renderer.setRenderTarget(rtC);
      renderer.setClearColor(MAGENTA, 1);
      const bg = Lx.scene.background;
      Lx.scene.background = null;
      renderer.clear();
      renderer.render(Lx.scene, Lx.cam);
      Lx.scene.background = bg;
      renderer.readRenderTargetPixels(rtC, 0, 0, 384, 216, pix);
      let n = 0;
      for (let i = 0; i < pix.length; i += 4) if (pix[i] > 200 && pix[i + 1] < 70 && pix[i + 2] > 200) n++;
      out.magenta += n;
      const el = edgeLeaks(Lx);
      out.checked = (out.checked || 0) + (el.checked || 0);
      out.layers.push(...el);
    }
    renderer.setRenderTarget(null);
    renderer.setClearColor(check ? MAGENTA : C.paper, 1);
    return out;
  };
  // --- Opastarkistus (render/opascheck.mjs): elementtien tila hetkellä t ---
  // ritarit (asento nivelkulmina, paikka, näkyvyys), selkäkuvat, keihäänkärjen muste (pituus, kärjen
  // korkeus, muste), kumppanin viiva, valon taso (dim), otto ja kamera. Paikka voi lisätä omia kenttiä
  // palauttamalla probe(t):n (olennot, elementit).
  const inScene = (obj, scene) => { for (let o = obj; o; o = o.parent) if (o === scene) return true; return false; };
  const visibleIn = (obj) => { for (let o = obj; o; o = o.parent) if (!o.visible) return false; return true; };
  const r3 = (x) => Math.round(x * 1000) / 1000;
  window.opasProbe = (t) => {
    t = clamp(t, 0, duration);
    const st = step(t);
    const L = st.L;
    const sc = sceneAt(t);
    const c = L.cam;
    const out = {
      t, kohtaus: sc.n, paikka: L.id, otto: st.shot.name, siirtyma: !!st.tr,
      kamera: { x: r3(c.position.x), y: r3(c.position.y), z: r3(c.position.z), fov: r3(c.fov), q: c.quaternion.toArray().map(r3) },
      valo: { dim: r3(st.fx.dim ?? 0), mis: r3(misAt(t)),
        paperi: r3(Math.max(smoothstep(S.T_DOM7 + 0.15, S.T_DOM7 + 0.5, t) * (1 - smoothstep(S.T_WID - 0.3, S.T_WID + 1.2, t)), washAt(t).paper)), luonnos: r3(washAt(t).sk) },
      nuket: [], muste: [], ritari: null,
    };
    for (const P of PUPPETS) {
      if (!inScene(P.root, L.scene) || !visibleIn(P.root)) continue;
      P.root.updateMatrixWorld(true);
      const w = new THREE.Vector3(); P.root.getWorldPosition(w);
      if (P.kind === 'knight') {
        out.nuket.push({ laji: 'ritari', x: r3(w.x), y: r3(w.y), suunta: Math.sign(P.root.scale.x || 1), sx: r3(Math.abs(P.root.scale.x)),
          lean: r3(-P.torso.rotation.z), tilt: r3(P.head.rotation.z), aN: r3(P.shN.rotation.z), eN: r3(P.elN.rotation.z), aF: r3(P.shF.rotation.z), eF: r3(P.elF.rotation.z),
          hN: r3(P.hpN.rotation.z), hF: r3(P.hpF.rotation.z), kammen: P.palm.visible ? 1 : 0 });
      } else {
        out.nuket.push({ laji: 'selka', x: r3(w.x), y: r3(w.y), kasi: r3(P.armR.rotation.z), sx: r3(Math.abs(P.root.scale.x)) });
      }
    }
    for (const Ld of LEADERS) {
      if (!inScene(Ld.P.root, L.scene)) continue;
      const tip = Ld.tipAt(t);
      const vis = visibleIn(Ld.P.root);
      if (!vis && !Ld.lance.visible) continue;
      const nk = out.nuket.find((n) => n.laji === 'ritari' && Math.abs(n.x - Ld.P.root.position.x) < 1e-6);
      out.ritari = { nakyy: vis, keihas: Ld.lance.visible, viiri: Ld.banner.visible, karki: tip ? { x: r3(tip.x), y: r3(tip.y) } : null, ...(nk || {}) };
    }
    for (const T of TRAILS) {
      if (!inScene(T.mesh, L.scene)) continue;
      const k = T.last;
      out.muste.push({ vari: T.mat.uniforms.uColor.value.getHexString(), nakyy: T.mesh.visible, pituus: r3(k.len), karki_x: k.tipX === null ? null : r3(k.tipX), karki_y: k.tipY === null ? null : r3(k.tipY), muste: r3(k.ink), pisteet: k.n });
    }
    if (L.probe) Object.assign(out, L.probe(t) || {});
    return out;
  };
  // --- Otetarkistus (render/otecheck.mjs): kämmenen ja varren etäisyys jokaisessa ruudussa ---
  // keihäs: lähempi kämmen varrella; kauempi kämmen varrella tai vartalolla (etäisyys 0 = vartalon kohdalla).
  // Paikka voi lisätä omat työkalunsa (airot, selkäkuvan keihäs) palauttamalla grip(t):n.
  const segD = (p, a, b) => {
    const ex = b[0] - a[0], ey = b[1] - a[1];
    const u = clamp(((p[0] - a[0]) * ex + (p[1] - a[1]) * ey) / (ex * ex + ey * ey));
    return Math.hypot(p[0] - a[0] - u * ex, p[1] - a[1] - u * ey);
  };
  window.gripProbe = (t) => {
    t = clamp(t, 0, duration);
    const st = step(t);
    const L = st.L;
    const out = { t, paikka: L.id, siirtyma: !!st.tr, otteet: [] };
    for (const Ld of LEADERS) {
      if (!inScene(Ld.P.root, L.scene) || !Ld.lance.visible) continue;
      const g = Ld.grip();
      const farShaft = segD(g.far, g.a, g.b), farBody = bodyDist(Ld.P, g.far);
      out.otteet.push({ tyyppi: 'keihäs', x: r3(Ld.P.root.position.x), nakyy: visibleIn(Ld.P.root), lahempi: r3(segD(g.near, g.a, g.b)), kauempi_varsi: r3(farShaft), kauempi_vartalo: r3(farBody), kauempi: r3(Math.min(farShaft, farBody)), irrotus: r3(g.rel ?? 0), ulottuma: r3(g.reach ?? 0) });
    }
    if (L.grip) out.otteet.push(...(L.grip(t) || []));
    return out;
  };
  // --- Asentohypyt (perusta3): kunkin sankarin tilafunktion asentohypyt ikkunassa [a, b], raakana ja vahdin jälkeen ---
  //   window.poseScan(t0, t1, hop = 2) -> [{ a, b, raaka: [[hypyn aika, suuruus]], vahdin_jalkeen: n }]
  window.poseScan = (t0, t1, hop = 2) => {
    const out = [];
    for (let a = t0; a < t1; a += hop) {
      const b = Math.min(t1, a + hop);
      const st = step(b);
      for (const Ld of LEADERS) {
        if (!inScene(Ld.P.root, st.L.scene)) continue;
        const raw = Ld.jumpsIn(a, b), grd = Ld.jumpsGuarded(a, b);
        if (raw.length || grd.length) out.push({ a, b, raaka: raw.map((j) => [+j.t.toFixed(3), +j.d.toFixed(2), j.k]), vahdin_jalkeen: grd.length });
      }
    }
    return out;
  };
  window.contextOk = () => !gl.isContextLost();
  window.__locAt = locAt;   // vianetsintä (render/debug)
  window.duration = duration;
  window.sceneReady = true;
  if (mode === 'preview') {
    document.body.classList.add('preview');
    const fit = () => document.documentElement.style.setProperty('--s', Math.min(innerWidth / W, innerHeight / H));
    addEventListener('resize', fit); fit();
    let t0 = 0;
    const loop = () => { window.seek(t0); requestAnimationFrame(loop); };
    document.addEventListener('keydown', (e) => { if (e.code === 'ArrowRight') t0 += 5; if (e.code === 'ArrowLeft') t0 -= 5; });
    loop();
  }
} catch (e) {
  window.sceneError = String(e && e.stack ? e.stack : e);
  console.error(e);
}
