// Elävä vedos, A-puoli (runs/vedos-1230/storyboard.md). Friisi, kamera, levyn kehys, otsikot ja slate.
//   ?mode=render|preview  &debug=1  &slate=1 (still-kuvien elokuvaslate: kohtaus, alku, kesto, musiikki)
//   window.seek(t), window.camProbe(t), window.sceneAtTime(t)

import * as THREE from 'three';
import { U, C, createPost } from './ink.js';
import { createSignals } from './signals.js';
import { loadSide } from './data.js';
import { buildFrieze } from './frieze.js';
import { buildRecord } from './record.js';
import { SCENES } from './scenes.js';
import { clamp, smoothstep, hash1, mix } from '../util.js';
import { gaussian, sampler } from '../util.js';

const W = 1920, H = 1080;
const params = new URLSearchParams(location.search);
const mode = params.get('mode') || 'preview';
const debug = params.get('debug') === '1';
const slate = params.get('slate') === '1';
const PACKS = [
  { dir: 'build/demo400', from: 0, to: 400 },
  { dir: 'build/A2', from: 400, to: 810 },
  { dir: 'build/A3', from: 810, to: 1240 },
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
  const A = (id) => S.A(id).t;
  // kohtaukset ankkureista
  const segTais = S.segs.filter((s) => s.a > A('wal_taistelu') + 3 && s.a < A('wal_taistelu') + 15)[0]?.a ?? A('wal_taistelu') + 7;
  const resolve = (id) => (id === '@0' ? 0 : id === '@end' ? S.T_END : id === '@seg:wal_taistelu' ? segTais : A(id));
  const SCN = SCENES.map(([n, a, b, name, music, image, o]) => ({ n, a: resolve(a), b: resolve(b), aId: a, name, music, image, ...o }));
  SCN.forEach((s, i) => { if (i < SCN.length - 1 && s.b < s.a) throw new Error(`kohtaus ${s.n}: loppu ennen alkua`); });
  const sceneAt = (t) => { let s = SCN[0]; for (const x of SCN) if (t >= x.a) s = x; return s; };
  const SC = { at: sceneAt };

  const renderer = new THREE.WebGLRenderer({ canvas: view, antialias: false, preserveDrawingBuffer: true, alpha: false });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  renderer.setClearColor(C.paper, 1);
  const post = createPost(renderer, W, H);
  const duration = S.T_END;
  const F = buildFrieze(S, A, SC);
  const R = buildRecord(S, A);
  const cam = new THREE.PerspectiveCamera(40, W / H, 0.1, 3000);
  const camR = new THREE.PerspectiveCamera(40, W / H, 0.1, 3000);
  const tFlip = A('wal_puolenvaihto');
  const T_REC = tFlip + 3.5;   // friisi kiertyy levyksi

  // kameran etäisyys ja korkeus: kohtausten arvot tasoitettuna (pehmeä siirtymä kohtausrajoilla)
  const n = S.n;
  const dArr = new Float32Array(n), lArr = new Float32Array(n);
  for (let i = 0; i < n; i++) { const s = sceneAt(i / 30); dArr[i] = s.d ?? 18; lArr[i] = s.lift ?? 0; }
  const D = sampler(gaussian(dArr, 60), 30);
  const LIFT = sampler(gaussian(lArr, 60), 30);
  const camY = sampler(gaussian(Float32Array.from({ length: n }, (_, i) => F.heroTopSlow(i / 30)), 75), 30);
  const tanH = Math.tan((40 * Math.PI) / 360) * (W / H);
  function aim(t) {
    let d = D(t);
    // puolenvaihto: vetäytyy; taistelu: sukeltaa (kehittely)
    d *= 1 + 1.6 * smoothstep(tFlip, T_REC + 1, t);
    const hw = d * tanH;
    const x = t - hw / 3;                      // painokohta 2/3:ssa ruudun leveydestä
    const y = clamp(camY(t) * 0.6 + 2.6 + LIFT(t), 3.5, 9.5);
    cam.position.set(x, y, d);
    cam.lookAt(x, y + 0.4, 0);
    cam.fov = 40;
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld(true);
    return { x0: x - hw, x1: x + hw };
  }

  const T_END_CARD = duration + 10;
  let titleKey = null;
  const gl = renderer.getContext();
  const slateEl = document.getElementById('slate');
  window.seek = (t) => {
    t = clamp(t, 0, duration);
    const v = aim(t);
    const fx = F.update(t, v);
    const rec = smoothstep(T_REC - 0.6, T_REC + 0.6, t);
    U.uDim.value = 0;
    renderer.setRenderTarget(post.rtA);
    renderer.render(F.scene, cam);
    if (rec > 0) { R.update(t, camR); renderer.setRenderTarget(post.rtB); renderer.render(R.scene, camR); }
    const u = post.uniforms;
    u.uMix.value = rec; u.uMode.value = 0;
    u.uFlash.value = 0; u.uWood.value = 0; u.uShake.value = 0;
    // hiljaisuus on tyhjää paperia: yleistauko ja tyyni ennen taistelua
    const gp = smoothstep(S.T_DOM7 + 0.15, S.T_DOM7 + 0.5, t) * (1 - smoothstep(S.T_WID - 0.3, S.T_WID + 1.2, t));
    const hil = smoothstep(A('gef_hiljaisuus') + 4, A('gef_hiljaisuus') + 12, t) * (1 - smoothstep(A('wal_kulissi1') - 3, A('wal_kulissi1') + 1, t));
    const intro = 1 - smoothstep(S.T0 - 2, S.T0 + 0.5, t);
    u.uPaper.value = Math.max(gp, hil * 0.92, intro * 0.0);
    // kohdistus: harmoninen jännite (dissonanssi liukuu, kadenssi loksahtaa); suurin dominanttiseptimissä
    const dom = smoothstep(A('held_dom7_sointu'), S.T_DOM7, t) * (1 - smoothstep(S.T_DOM7, S.T_WID + 6, t) * 0.5);
    u.uMis.value = 0.3 + 1.8 * clamp(S.tension(t)) + 3.5 * dom + 1.5 * smoothstep(A('wal_taistelu'), tFlip, t);
    u.uGrain.value = 0.05 + 0.6 * clamp(S.hiss(t) * 20) + (t < S.T0 ? 0.25 * (0.5 + 0.5 * Math.sin(t * 9)) * smoothstep(S.T_NEEDLE - 0.2, S.T_NEEDLE + 0.3, t) : 0);
    // otsikot: nimiö ennen ensimmäistä säveltä, jaksojen nimet yläreunan tyhjässä taivaassa
    let key = null, a = 0;
    const acts = [[S.T0 + 2, 'act1'], [S.T_WID + 0.8, 'act2'], [A('gef_viulu') + 1, 'act3'], [A('wal_kulissi1') + 1, 'act4']];
    if (t > 1.2 && t < S.T0 - 0.3) { key = 'main'; a = smoothstep(1.2, 2.4, t) * (1 - smoothstep(S.T0 - 1.6, S.T0 - 0.4, t)); }
    for (const [ta, k] of acts) if (t > ta && t < ta + 6) { key = k; a = smoothstep(ta, ta + 1, t) * (1 - smoothstep(ta + 4.8, ta + 6, t)); }
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
    // painokohta 2/3:ssa; ennen ensimmäistä säveltä painettua aluetta ei ole (kermapaperi ja luonnos)
    const hwNow = cam.position.z * tanH;
    const leftX = clamp(0.5 + (S.T0 - cam.position.x) / (2 * hwNow), 0, 1);
    u.uPrint.value.set(rec > 0.5 ? 1.01 : 2 / 3 + 0.004, rec > 0.5 ? -0.01 : leftX, rec > 0.5 ? 0 : 1);
    post.render();
    const sc = sceneAt(t);
    if (slate && slateEl) {
      slateEl.hidden = false;
      const sb = SCN[SCN.indexOf(sc) + 1];
      const b = sb ? sb.a : duration;
      slateEl.innerHTML = `<b>Kohtaus ${sc.n}</b> · ${sc.name}<br>${fmt(sc.a)} – ${fmt(b)} · kesto ${(b - sc.a).toFixed(1)} s · ruutu ${fmt(t)}<br><i>Musiikki:</i> ${sc.music}<br><i>Kuva:</i> ${sc.image}`;
    }
    if (debug) {
      const hud = document.getElementById('hud');
      hud.hidden = false;
      hud.textContent = `t ${t.toFixed(2)}  kohtaus ${sc.n}  d ${D(t).toFixed(1)}  käyrät ${S.energy.horns(t).toFixed(2)}  viul ${S.fam.violins(t).toFixed(2)}  puup ${S.fam.winds(t).toFixed(2)}  jännite ${S.tension(t).toFixed(2)}`;
    }
    return !gl.isContextLost();
  };
  window.camProbe = (t) => { aim(clamp(t, 0, duration)); const sc = sceneAt(t); return { loc: 'friisi', shot: `friisi/${sc.n} ${sc.name}`, cut: 0, p: cam.position.toArray(), q: cam.quaternion.toArray(), fov: cam.fov, trans: t > T_REC - 1 }; };
  window.sceneTimes = () => SCN.map((s, i) => { const b = SCN[i + 1] ? SCN[i + 1].a : duration; return { n: s.n, a: s.a, b, key: s.a + (b - s.a) * (s.key ?? 0.5), name: s.name }; });
  window.contextOk = () => !gl.isContextLost();
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
