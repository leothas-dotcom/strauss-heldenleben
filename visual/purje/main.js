// Punainen purje: Disney-henkinen paperipiirretty (2D multiplane). Ohjaaja: paikat ja siirtymät
// teemakartan ankkureista (runs/purje-400/storyboard.md, luku 5), kamerat, otsikot, pöly.
//   ?data=build/demo400&mode=render|preview   &debug=1   &check=1 (tyhjä tausta magentana)
//   window.seek(t), window.camProbe(t), window.leakProbe(t) (lavasteiden reunojen tarkistus)

import * as THREE from 'three';
import { U, C, createPost } from './ink.js';
import { createSignals } from './signals.js';
import { clamp, smoothstep, hash1 } from '../util.js';
import * as record from './loc_record.js';
import * as harbor from './loc_harbor.js';
import * as sea from './loc_sea.js';
import * as calm from './loc_calm.js';
import * as coast from './loc_coast.js';
import * as storm from './loc_storm.js';
import * as lagoon from './loc_lagoon.js';

const W = 1920;
const H = 1080;
const params = new URLSearchParams(location.search);
const dataDir = params.get('data') || 'build/demo400';
const mode = params.get('mode') || 'preview';
const debug = params.get('debug') === '1';
const check = params.get('check') === '1';

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

// Otsikot: aina yläreunan tyhjään taivaaseen (ei hahmojen päälle, palaute 30.10.2026).
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
    const y0 = 70;
    g.fillStyle = '#E8DCC6';
    g.fillRect(80, y0, w2, 92);
    g.fillStyle = '#F5461A';
    g.fillRect(80, y0 + 92, w2, 6);
    g.fillStyle = '#1F1A18';
    g.textAlign = 'left';
    g.font = '700 46px Georgia';
    g.fillText(key === 'act1' ? 'I' : 'II', 104, y0 + 62);
    g.font = 'italic 40px Georgia';
    g.fillText(key === 'act1' ? 'Der Held' : 'Des Helden Widersacher', key === 'act1' ? 150 : 168, y0 + 62);
  } else if (key === 'end') {
    // lopputeksti nousevan purjeen päälle: paperinen laatta yläreunan tyhjällä taivaalla
    g.fillStyle = '#E8DCC6';
    g.fillRect(W / 2 - 560, H * 0.32, 1120, H * 0.4);
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
  const MAGENTA = new THREE.Color(1, 0, 1);
  renderer.setClearColor(check ? MAGENTA : C.paper, 1);
  const post = createPost(renderer, W, H);
  const duration = data.meta.duration;
  const K = { S, LEAD: 1 / 30, check };
  const at = (id) => S.A(id).t;

  // Paikat ankkureista (kuvakäsikirjoitus, luku 5).
  const LOCS = [
    { id: 'A levy', mod: record, a: 0, b: S.T0 },
    { id: 'B satama', mod: harbor, a: S.T0, b: at('held_lyyrinen') },
    { id: 'C avomeri', mod: sea, a: at('held_lyyrinen'), b: at('held_tunnelma_vaihtuu') },
    { id: 'D tyyni lahti', mod: calm, a: at('held_tunnelma_vaihtuu'), b: at('held_t61') },
    { id: 'E rannikko', mod: coast, a: at('held_t61'), b: at('held_reh12') },
    { id: 'F myrsky', mod: storm, a: at('held_reh12'), b: S.T_DOM7 + 0.2 },
    { id: 'G kaislalahti', mod: lagoon, a: S.T_WID - 0.3, b: duration + 1 },
  ];
  // Siirtymät: keskikohta, kesto, tapa (0 rasteriliukuma, 1 paperin kautta, -1 leikkaus).
  const TRANS = [
    { at: S.T0 - 0.45, dur: 1.1, mode: 0 },
    { at: at('held_lyyrinen') - 0.2, dur: 1.4, mode: 0 },
    { at: at('held_tunnelma_vaihtuu') + 0.8, dur: 1.6, mode: 0 },
    { at: at('held_t61') - 0.25, dur: 1.4, mode: 1 },
    { at: at('held_reh12') - 1 / 30, dur: 0, mode: -1 },
    { at: S.T_DOM7 + 0.2, dur: 0, mode: -1 },
  ];
  const locs = LOCS.map((L) => ({ ...L, ...L.mod.build({ ...K, a: L.a, b: L.b }) }));
  locs.forEach((L, i) => {
    L.i = i;
    L.cam = new THREE.PerspectiveCamera(40, W / H, 0.1, 3000);
    if (check) L.scene.background = null;
  });
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
    let s = L.shots[0];
    L.shots.forEach((x, n) => { if (t >= x.a) { s = x; s.n = n; } });
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
    L.cam.updateMatrixWorld(true);
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
    u.uFlash.value = 0;
    u.uWood.value = 0;
    u.uShake.value = 0;
    let paper = 0;
    if (t > S.T_DOM7 + 0.2 && t < S.T_WID + 1.4) paper = smoothstep(S.T_DOM7 + 0.2, S.T_DOM7 + 0.5, t) * (1 - smoothstep(S.T_WID - 0.25, S.T_WID + 1.3, t));

    u.uPaper.value = check ? 0 : paper;
    let key = null, a = 0;
    if (t > 4.2 && t < S.T0 - 0.3) { key = 'main'; a = smoothstep(4.2, 5.2, t) * (1 - smoothstep(S.T0 - 1.3, S.T0 - 0.4, t)); }
    else if (t > S.T0 + 2 && t < S.T0 + 8) { key = 'act1'; a = smoothstep(S.T0 + 2, S.T0 + 3, t) * (1 - smoothstep(S.T0 + 6.8, S.T0 + 8, t)); }
    else if (t > S.T_WID + 0.8 && t < S.T_WID + 7.5) { key = 'act2'; a = smoothstep(S.T_WID + 0.8, S.T_WID + 1.8, t) * (1 - smoothstep(S.T_WID + 6, S.T_WID + 7.5, t)); }
    else if (t > T_END_CARD + 0.6) { key = 'end'; a = smoothstep(T_END_CARD + 0.6, T_END_CARD + 1.6, t); }
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
    // painovärien siirtymä seuraa harmonista jännitettä hitaasti
    u.uMis.value = check ? 0 : 0.4 + 1.6 * clamp(S.tension(t));
    u.uGrain.value = check ? 0 : 0.05 + 0.6 * clamp(S.hiss(t) * 20);
    if (st.tr) { u.uMix.value = st.tr.m; u.uMode.value = st.tr.mode; } else u.uMix.value = 0;
  }

  window.seek = (t) => {
    t = clamp(t, 0, duration);
    const st = step(t);
    // himmennys tämän ruudun arvosta ennen piirtoa (ei edellisen ruudun tilaa)
    U.uDim.value = ((st.tr && st.tr.m > 0.5 ? st.fxB : st.fx).dim) ?? 0;
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
        `t ${t.toFixed(2)}  paikka ${st.L.id}${st.tr ? ' -> ' + st.tr.B.id + ' ' + st.tr.m.toFixed(2) : ''}`,
        `otto: ${st.shot.name}  ${st.shot.a.toFixed(1)}–${st.shot.b.toFixed(1)}  (#${st.shot.n ?? ''})`,
        `jakso ${sg ? sg.k + 1 : '-'}  voim ${S.loud(t).toFixed(2)}  rek ${S.reg(t).toFixed(2)}  tuuli ${(st.fx.wind ?? 0).toFixed(2)}`,
        `käyrät ${S.fam.horns(t).toFixed(2)}  trp ${S.fam.tpt(t).toFixed(2)}  viul ${S.fam.violins(t).toFixed(2)}  jous ${S.fam.strings(t).toFixed(2)}`,
        `sellot ${S.fam.cello(t).toFixed(2)}  bassot ${S.fam.bass(t).toFixed(2)}  puup ${S.fam.winds(t).toFixed(2)}  harppu ${S.fam.harp(t).toFixed(2)}`,
      ].join('\n');
    }
    return !gl.isContextLost();
  };
  window.camProbe = (t) => {
    const st = step(clamp(t, 0, duration));
    const c = st.L.cam;
    return { loc: st.L.id, shot: `${st.L.id}/${st.shot.name}`, cut: st.shot.a, p: c.position.toArray(), q: c.quaternion.toArray(), fov: c.fov, trans: !!st.tr };
  };

  // --- Lavasteiden reunojen tarkistus (render/kohtauscheck.mjs) ------------------------------
  // 1) Pikselit: kohtaus piirretään pieneen kohteeseen magentaa taustaa vasten; jokainen magenta
  //    pikseli on kohta, jota mikään kerros ei peitä.
  // 2) Kerrosten alueet: jokaiselle reunalliselle kerrokselle (userData.edge) lasketaan kameran
  //    näkymä kerroksen syvyydellä ja verrataan kerroksen x-alueeseen ja alareunaan.
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
      let vis = true;
      for (let p = m.parent; p; p = p.parent) if (!p.visible) vis = false;
      if (!vis) return;
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
    for (const [Lx] of [[st.L], ...(st.tr ? [[st.tr.B]] : [])]) {
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
  window.contextOk = () => !gl.isContextLost();
  window.duration = duration;
  window.shotList = () => locs.flatMap((L) => L.shots.map((s) => [L.id, s.name, s.a.toFixed(2), s.b.toFixed(2)]));
  window.sceneReady = true;
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
