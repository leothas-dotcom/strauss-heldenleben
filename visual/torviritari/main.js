// Torviritari: Disney-henkinen paperipiirretty (2D multiplane). Ohjaaja: paikat ja siirtymät
// teemakartan ankkureista (runs/torviritari-400/storyboard.md, luku 5), kamerat, otsikot, pöly.
//   ?data=build/demo400&mode=render|preview   &debug=1
//   window.seek(t), window.camProbe(t) (kameran sulavuuden tarkistus ilman piirtoa)

import * as THREE from 'three';
import { U, C, createPost } from './ink.js';
import { createSignals } from './signals.js';
import { clamp, smoothstep, hash1 } from '../util.js';
import * as record from './loc_record.js';
import * as valley from './loc_valley.js';
import * as dream from './loc_dream.js';
import * as plain from './loc_plain.js';
import * as meadow from './loc_meadow.js';
import * as storm from './loc_storm.js';
import * as swamp from './loc_swamp.js';

const W = 1920;
const H = 1080;
const params = new URLSearchParams(location.search);
const dataDir = params.get('data') || 'build/demo400';
const mode = params.get('mode') || 'preview';
const debug = params.get('debug') === '1';
const only = params.get('only'); // esikatselu: vain yksi paikka

async function fetchOk(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(`${path}: ${r.status}`);
  return r;
}
async function frames(name) {
  const meta = await (await fetchOk(`/${dataDir}/${name}.json`)).json();
  const raw = new Float32Array(await (await fetchOk(`/${dataDir}/${name}.f32`)).arrayBuffer());
  const Cn = meta.channels.length;
  const channels = {};
  meta.channels.forEach((c, j) => {
    const a = new Float32Array(meta.frames);
    for (let i = 0; i < meta.frames; i++) a[i] = raw[i * Cn + j];
    channels[c] = a;
  });
  return { meta, channels };
}
async function load() {
  const analysis = await frames('analysis');
  const listen = await frames('listen');
  const json = async (p) => (await fetchOk(p)).json();
  return {
    meta: analysis.meta, channels: analysis.channels, listen,
    beats: await json(`/${dataDir}/beats.json`), events: await json(`/${dataDir}/events.json`),
    patina: await json(`/${dataDir}/patina.json`), segments: await json(`/${dataDir}/segments.json`),
    aksentit: await json(`/${dataDir}/aksentit.json`), cues: await json('/annotations/cues.json'),
  };
}

function drawTitle(post, key) {
  const g = post.titleCtx;
  g.clearRect(0, 0, W, H);
  g.textAlign = 'center';
  if (key === 'main') {
    g.fillStyle = '#E8DCC6';
    g.font = '600 34px Georgia';
    g.fillText('R I C H A R D   S T R A U S S', W / 2, H * 0.36);
    g.font = '700 132px Georgia';
    g.fillText('EIN HELDENLEBEN', W / 2, H * 0.5);
    g.font = 'italic 38px Georgia';
    g.fillText('op. 40  ·  Wiener Philharmoniker  ·  Clemens Krauss', W / 2, H * 0.58);
  } else if (key === 'act1' || key === 'act2') {
    const w2 = key === 'act1' ? 330 : 600;
    g.fillStyle = '#E8DCC6';
    g.fillRect(80, H - 190, w2, 92);
    g.fillStyle = '#F5461A';
    g.fillRect(80, H - 98, w2, 6);
    g.fillStyle = '#1F1A18';
    g.textAlign = 'left';
    g.font = '700 46px Georgia';
    g.fillText(key === 'act1' ? 'I' : 'II', 104, H - 128);
    g.font = 'italic 40px Georgia';
    g.fillText(key === 'act1' ? 'Der Held' : 'Des Helden Widersacher', key === 'act1' ? 150 : 168, H - 128);
  } else if (key === 'end') {
    g.fillStyle = '#1F1A18';
    g.font = '700 84px Georgia';
    g.fillText('EIN HELDENLEBEN', W / 2, H * 0.42);
    g.font = 'italic 34px Georgia';
    g.fillText('I  Der Held  ·  II  Des Helden Widersacher', W / 2, H * 0.5);
    g.font = '30px Georgia';
    g.fillText('Wiener Philharmoniker  ·  Clemens Krauss  ·  LP London LL 659, A-puoli 0:00–6:40', W / 2, H * 0.57);
    g.fillStyle = '#F5461A';
    g.fillRect(W / 2 - 60, H * 0.62, 120, 6);
    g.fillStyle = '#1F1A18';
    g.font = 'italic 28px Georgia';
    g.fillText('jatkuu', W / 2, H * 0.68);
  }
  post.titleChanged();
}

try {
  const view = document.getElementById('view');
  view.width = W;
  view.height = H;
  const data = await load();
  const S = createSignals(data);
  const renderer = new THREE.WebGLRenderer({ canvas: view, antialias: false, preserveDrawingBuffer: true, alpha: false });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  renderer.setClearColor(C.paper, 1);
  const post = createPost(renderer, W, H);
  const duration = data.meta.duration;
  const K = { S, LEAD: 1 / 30 };
  const at = (id) => S.A(id).t;

  // Paikat ankkureista (kuvakäsikirjoitus, luku 5).
  const LOCS = [
    { id: 'A levy', mod: record, a: 0, b: S.T0 },
    { id: 'B laakso', mod: valley, a: S.T0, b: at('held_lyyrinen') },
    { id: 'C joki', mod: dream, a: at('held_lyyrinen'), b: at('held_t34') },
    { id: 'D kukkula', mod: plain, a: at('held_t34'), b: at('held_tunnelma_vaihtuu') },
    { id: 'E niitty', mod: meadow, a: at('held_tunnelma_vaihtuu'), b: at('held_t61') },
    { id: 'F-G tasanko ja myrskyvuori', mod: storm, a: at('held_t61'), b: S.T_DOM7 + 0.2 },
    { id: 'H suo', mod: swamp, a: S.T_WID - 0.3, b: duration + 1 },
  ];
  // Siirtymät: keskikohta, kesto, tapa (0 rasteriliukuma, 1 paperin kautta, -1 leikkaus).
  // Rasteriliukumat alkavat ankkurin kohdalla tai juuri ennen; kukkulalle leikataan laukan alkuun;
  // huipulta suolle yleistauon tyhjän paperin kautta (overlay).
  const TRANS = [
    { at: S.T0 - 0.45, dur: 1.1, mode: 0 },
    { at: at('held_lyyrinen') - 0.2, dur: 1.4, mode: 0 },
    { at: at('held_t34') - 1 / 30, dur: 0, mode: -1 },
    { at: at('held_tunnelma_vaihtuu') + 0.8, dur: 1.6, mode: 0 },
    { at: at('held_t61') - 0.25, dur: 1.4, mode: 1 },
    { at: S.T_DOM7 + 0.2, dur: 0, mode: -1 },
  ];
  const locs = LOCS.map((L) => ({ ...L, ...L.mod.build({ ...K, a: L.a, b: L.b }) }));
  locs.forEach((L, i) => { L.i = i; L.cam = new THREE.PerspectiveCamera(40, W / H, 0.1, 3000); });
  const T_END_CARD = duration - 3.6;
  let titleKey = null;
  const gl = renderer.getContext();

  function locAt(t) {
    for (let i = locs.length - 1; i >= 0; i--) if (t >= locs[i].a) return locs[i];
    return locs[0];
  }
  function transAt(t) {
    for (let i = 0; i < TRANS.length; i++) {
      const tr = TRANS[i];
      if (tr.mode >= 0 && Math.abs(t - tr.at) < tr.dur / 2) return { ...tr, A: locs[i], B: locs[i + 1], m: smoothstep(tr.at - tr.dur / 2, tr.at + tr.dur / 2, t) };
    }
    return null;
  }
  function shotOf(L, t) {
    const sh = L.shots;
    let s = sh[0];
    for (const x of sh) if (t >= x.a) s = x;
    return s;
  }
  function aim(L, t) {
    const s = shotOf(L, t);
    const u = clamp((t - s.a) / Math.max(0.05, s.b - s.a));
    const c = s.cam(u, t);
    L.cam.position.set(...c.pos);
    L.cam.up.set(0, 1, 0);
    L.cam.fov = c.fov ?? 40;
    L.cam.updateProjectionMatrix();
    L.cam.lookAt(...c.look);
    return s;
  }
  function step(t) {
    const tr = transAt(t);
    const L = tr ? tr.A : locAt(t);
    const fx = L.update(t) || {};
    const shot = aim(L, t);
    let fxB = null, shotB = null;
    if (tr) { fxB = tr.B.update(t) || {}; shotB = aim(tr.B, t); }
    return { L, tr, fx, fxB, shot, shotB };
  }

  function overlay(t, st) {
    const u = post.uniforms;
    const fx = st.tr && st.tr.m > 0.5 ? st.fxB : st.fx;
    U.uDim.value = fx.dim ?? 0;
    u.uFlash.value = fx.flash ?? 0;
    u.uWood.value = fx.wood ?? 0;
    u.uShake.value = fx.shake ?? 0;
    let paper = 0;
    if (t > S.T_DOM7 + 0.2 && t < S.T_WID + 1.4) paper = smoothstep(S.T_DOM7 + 0.2, S.T_DOM7 + 0.5, t) * (1 - smoothstep(S.T_WID - 0.25, S.T_WID + 1.3, t));
    paper = Math.max(paper, smoothstep(T_END_CARD - 0.2, T_END_CARD + 1.0, t));
    u.uPaper.value = paper;
    let key = null, a = 0;
    if (t > 4.2 && t < S.T0 - 0.3) { key = 'main'; a = smoothstep(4.2, 5.2, t) * (1 - smoothstep(S.T0 - 1.3, S.T0 - 0.4, t)); }
    else if (t > S.T0 + 2 && t < S.T0 + 8) { key = 'act1'; a = smoothstep(S.T0 + 2, S.T0 + 3, t) * (1 - smoothstep(S.T0 + 6.8, S.T0 + 8, t)); }
    else if (t > S.T_WID + 0.8 && t < S.T_WID + 7.5) { key = 'act2'; a = smoothstep(S.T_WID + 0.8, S.T_WID + 1.8, t) * (1 - smoothstep(S.T_WID + 6, S.T_WID + 7.5, t)); }
    else if (t > T_END_CARD + 0.6) { key = 'end'; a = smoothstep(T_END_CARD + 0.6, T_END_CARD + 1.6, t); }
    if (key !== titleKey) { drawTitle(post, key); titleKey = key; }
    u.uTitle.value = key ? a : 0;
    let k = 0;
    for (const d of post.dust) d.set(0, 0, 0, 0);
    for (let q = 0; q < S.clicks.length && k < 24; q++) {
      const [tc, s] = S.clicks[q];
      const life = s > 0.55 ? 0.45 : 0.1;
      if (tc > t || t - tc > life) continue;
      post.dust[k++].set(hash1(q * 3 + 1) * W, hash1(q * 3 + 2) * H, 1.2 + 4.5 * Math.min(1, s), (hash1(q * 3 + 3) > 0.45 ? 1 : -1) * (0.5 + 0.4 * s) * (1 - ((t - tc) / life) * 0.5));
    }
    // painovärien siirtymä seuraa jännitettä hitaasti; iskuihin ei koko kuvan efektejä
    u.uMis.value = 0.4 + 1.6 * clamp(S.tension(t));
    u.uGrain.value = 0.05 + 0.6 * clamp(S.hiss(t) * 20);
    if (st.tr) { u.uMix.value = st.tr.m; u.uMode.value = st.tr.mode; } else u.uMix.value = 0;
  }

  window.seek = (t) => {
    t = clamp(t, 0, duration);
    const st = step(t);
    renderer.setRenderTarget(post.rtA);
    renderer.render(st.L.scene, st.L.cam);
    if (st.tr) { renderer.setRenderTarget(post.rtB); renderer.render(st.tr.B.scene, st.tr.B.cam); }
    overlay(t, st);
    post.render();
    if (debug) {
      const hud = document.getElementById('hud');
      hud.hidden = false;
      const sg = S.segAt(t);
      hud.textContent = [
        `t ${t.toFixed(2)}  tahti ${(S.barPos(t) + 1).toFixed(2)}  paikka ${st.L.id}${st.tr ? ' -> ' + st.tr.B.id + ' ' + st.tr.m.toFixed(2) : ''}`,
        `otto: ${st.shot.name}  ${st.shot.a.toFixed(1)}–${st.shot.b.toFixed(1)}  (#${st.shot.n ?? ''})`,
        `jakso ${sg ? sg.k + 1 : '-'}  voim ${S.loud(t).toFixed(2)}  rek ${S.reg(t).toFixed(2)}`,
        `käyrät ${S.fam.horns(t).toFixed(2)}  trp ${S.fam.tpt(t).toFixed(2)}  viul ${S.fam.violins(t).toFixed(2)}  jous ${S.fam.strings(t).toFixed(2)}`,
        `sellot ${S.fam.cello(t).toFixed(2)}  bassot ${S.fam.bass(t).toFixed(2)}  puup ${S.fam.winds(t).toFixed(2)}  harppu ${S.fam.harp(t).toFixed(2)}`,
        `patar ${S.fam.perc(t).toFixed(2)}  lautaset ${S.fam.cymbal(t).toFixed(2)}`,
      ].join('\n');
    }
    return !gl.isContextLost();
  };
  window.camProbe = (t) => {
    const st = step(clamp(t, 0, duration));
    const c = st.L.cam;
    return { loc: st.L.id, shot: `${st.L.id}/${st.shot.name}`, cut: st.shot.a, p: c.position.toArray(), q: c.quaternion.toArray(), fov: c.fov, trans: !!st.tr };
  };
  window.contextOk = () => !gl.isContextLost();
  window.phrases = () => S.phrases.map((p) => [p.t0.toFixed(2), p.type, p.ons.length, Math.round(p.midi)]);
  window.duration = duration;
  window.shotList = () => locs.flatMap((L) => L.shots.map((s) => [L.id, s.name, s.a.toFixed(2), s.b.toFixed(2)]));
  window.sceneReady = true;
  void only;
  if (mode === 'preview') {
    document.body.classList.add('preview');
    const fit = () => document.documentElement.style.setProperty('--s', Math.min(innerWidth / W, innerHeight / H));
    addEventListener('resize', fit);
    fit();
    const audio = new Audio(`/${dataDir}/soundtrack.wav`);
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') { audio.paused ? audio.play() : audio.pause(); e.preventDefault(); }
      if (e.code === 'ArrowRight') audio.currentTime = Math.min(duration, audio.currentTime + 5);
      if (e.code === 'ArrowLeft') audio.currentTime = Math.max(0, audio.currentTime - 5);
    });
    const loop = () => { window.seek(audio.currentTime); requestAnimationFrame(loop); };
    loop();
  }
} catch (e) {
  window.sceneError = String(e && e.stack ? e.stack : e);
  console.error(e);
}
