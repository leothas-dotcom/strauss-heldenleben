// Pyörivä näyttämö (Drehbühne): LP-levy on näyttämö ja orkesteri tanssiseurue.
//   ?data=build/demo400&mode=render   Puppeteer kutsuu seek(t) ruutu kerrallaan
//   ?data=build/demo400&mode=preview  ääni soi ja kuva seuraa (välilyönti, nuolet)
//   &debug=1                          otto, lohko ja ryhmien läsnäolo kuvan päällä
// Ohjaaja: valot (Runge: elämä yhtenä päivänä), taivas, otsikot, pöly, kohdistus ja leikkaus.

import * as THREE from 'three';
import { U, C, createPost } from './ink.js';
import { createSignals } from './signals.js';
import { createPlan } from './plan.js';
import { createStage } from './stage.js';
import { createCompany } from './choreo.js';
import { createShots } from './shots.js';
import { clamp, smoothstep, mix, hash1 } from '../util.js';

const W = 1920;
const H = 1080;
const params = new URLSearchParams(location.search);
const dataDir = params.get('data') || 'build/demo400';
const mode = params.get('mode') || 'preview';
const debug = params.get('debug') === '1';

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
    beats: await json(`/${dataDir}/beats.json`),
    events: await json(`/${dataDir}/events.json`),
    patina: await json(`/${dataDir}/patina.json`),
    segments: await json(`/${dataDir}/segments.json`),
    cues: await json('/annotations/cues.json'),
  };
}

// --- Otsikot ---------------------------------------------------------------------------------
function drawTitle(post, key, S) {
  const g = post.titleCtx;
  g.clearRect(0, 0, W, H);
  g.textAlign = 'center';
  g.textBaseline = 'alphabetic';
  const ink = (c) => { g.fillStyle = c; };
  if (key === 'main') {
    ink('#E8DCC6');
    g.font = '600 34px Georgia';
    g.fillText('R I C H A R D   S T R A U S S', W / 2, H * 0.36);
    g.font = '700 132px Georgia';
    g.fillText('EIN HELDENLEBEN', W / 2, H * 0.5);
    g.font = 'italic 38px Georgia';
    g.fillText('op. 40  ·  Wiener Philharmoniker  ·  Clemens Krauss', W / 2, H * 0.58);
  } else if (key === 'act1' || key === 'act2') {
    // paperinen kilpi, jolla musta teksti: luettava sekä vaalealla että tummalla taustalla
    const w2 = key === 'act1' ? 330 : 600;
    g.fillStyle = '#E8DCC6';
    g.fillRect(80, H - 190, w2, 92);
    g.fillStyle = '#F5461A';
    g.fillRect(80, H - 98, w2, 6);
    ink('#1F1A18');
    g.textAlign = 'left';
    g.font = '700 46px Georgia';
    g.fillText(key === 'act1' ? 'I' : 'II', 104, H - 128);
    g.font = 'italic 40px Georgia';
    g.fillText(key === 'act1' ? 'Der Held' : 'Des Helden Widersacher', key === 'act1' ? 150 : 168, H - 128);
  } else if (key === 'end') {
    ink('#1F1A18');
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
  void S;
  post.titleChanged();
}

try {
  const view = document.getElementById('view');
  view.width = W;
  view.height = H;
  const data = await load();
  const S = createSignals(data);
  const plan = createPlan(S);
  const renderer = new THREE.WebGLRenderer({ canvas: view, antialias: false, preserveDrawingBuffer: true, alpha: false });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  renderer.setClearColor(C.paper, 1);
  const scene = new THREE.Scene();
  const stage = createStage(scene);
  const company = createCompany(scene, S, plan, stage);
  const shots = createShots(S, plan, company);
  const post = createPost(renderer, W, H);
  const duration = data.meta.duration;
  const T_END_CARD = duration - 3.6;
  let titleKey = null;
  const gl = renderer.getContext();

  function lights(t, b) {
    const sky = stage.sky;
    const minor = S.minor(t);
    // Valaistus (yleinen hämäryys): alkusoitto pimeä, aamunkoi, hengähdys ja yö himmeämpiä.
    let dim = 0;
    if (t < S.T_NEEDLE) dim = 0.75;
    else if (t < S.T0) dim = 0.55;
    else dim = 0.5 * (1 - smoothstep(S.T0, S.T0 + 14, t));
    if (b.name === 'breath') dim = Math.max(dim, 0.22 * smoothstep(b.a, b.a + 3, t) * (1 - smoothstep(b.b - 3, b.b, t)));
    if (b.name === 'night') dim = 0.28 * smoothstep(b.a, b.a + 4, t) * (1 - smoothstep(b.b - 4, b.b, t));
    if (b.name === 'critics' || b.name === 'answer' || b.name === 'return') dim = 0.1;
    let heroSelf = 0;
    for (const [d, r] of S.freezes) {
      if (t >= d - 1 / 30 && t < r - 1 / 30) { dim = 0.72; heroSelf = -0.72; }
    }
    U.uDim.value = dim;
    stage.discU.uCamPos.value.copy(shots.cam.position);
    stage.floor.uNight.value = t < S.T0 ? 0.6 * (1 - smoothstep(S.T_NEEDLE, S.T0 + 4, t)) : b.name === 'night' ? 0.35 * smoothstep(b.a, b.a + 4, t) * (1 - smoothstep(b.b - 4, b.b, t)) : 0;
    // Taivas: elämä yhtenä päivänä. Aamunkoi sinisestä kermaan; aurinko nousee sankarin mukana.
    const day = smoothstep(S.T0, S.T0 + 150, t);
    if (t < S.T_WID) {
      sky.uBlueAmt.value = 1;
      sky.uHor.value = mix(0.0, 0.66, day) - 0.14 * minor - (b.name === 'uphill' || b.name === 'hammer' ? 0.12 : 0);
      sky.uBlackTop.value = mix(0.85, 0.0, smoothstep(S.T0 - 2, S.T0 + 50, t)) + (b.name === 'uphill' || b.name === 'hammer' ? 0.22 * minor : 0);
      sky.uRedAmt.value = t < S.T0 - 1 ? 0.0 : 0.6 * (1 - smoothstep(S.T0 + 50, S.T0 + 130, t)) + 0.35 * smoothstep(S.T_DOM7 - 30, S.T_DOM7, t);
      sky.uMurk.value = 0;
      sky.uMount.value = 1;
      sky.uSwamp.value = 0;
      const sunH = mix(-0.14, 0.5, smoothstep(S.T0 - 1, S.T_DOM7 - 1, t));
      sky.uSun.value.set(0, sunH, 0.085, t > S.T0 - 1 ? 1 : 0);
      sky.uMoon.value.w = 0;
      // Sädekehä: luonnos ennakoi huippua, leimahtaa dominanttiseptimissä.
      sky.uRays.value = 0.3 * smoothstep(S.T_DOM7 - 9, S.T_DOM7 - 0.5, t) + 0.7 * smoothstep(S.T_DOM7 - 0.25, S.T_DOM7 + 0.02, t);
      for (let k = 0; k < 6; k++) sky.uBands.value[k] = clamp(S.bands[k](Math.min(t, S.T_DOM7 + 0.1)) * 1.4);
    } else {
      // Näytös II: sameus (musta ja punainen rasteri), yö (kuu), vastustajien paluu, leimahdus.
      const nightA = smoothstep(plan.byName.night.a, plan.byName.night.a + 6, t) * (1 - smoothstep(plan.byName.return.a - 2, plan.byName.return.a + 6, t));
      const crit = clamp(company.critics.filter((c) => c.r.root.visible).length / 10);
      const snapA = smoothstep(plan.byName.snap.a, plan.byName.snap.a + 4, t);
      sky.uBlueAmt.value = mix(0.55, 1.0, nightA);
      sky.uHor.value = mix(0.75, 0.0, nightA);
      sky.uBlackTop.value = mix(0.15, 0.45, nightA);
      sky.uRedAmt.value = mix(0.4, 0.0, nightA) + 0.55 * snapA;
      sky.uMurk.value = (0.12 + 0.5 * crit) * (1 - nightA) * (1 - 0.6 * snapA);
      sky.uMount.value = 0.3;
      sky.uSwamp.value = 1;
      sky.uSun.value.w = 0;
      sky.uMoon.value.set(0.42, mix(0.4, 0.66, smoothstep(plan.byName.night.a, plan.byName.night.b, t)), 0.055, nightA);
      sky.uRays.value = 0;
    }
    sky.uDim.value = dim * 0.6;
    return heroSelf;
  }

  function overlay(t) {
    const u = post.uniforms;
    // Hiljaisuus on tyhjää paperia: tauko ja loppu.
    let paper = 0;
    if (t > S.T_DOM7 + 0.2 && t < S.T_WID + 1.4) paper = smoothstep(S.T_DOM7 + 0.2, S.T_DOM7 + 0.5, t) * (1 - smoothstep(S.T_WID - 0.25, S.T_WID + 1.3, t));
    if (t < 0.25) paper = 0;
    paper = Math.max(paper, smoothstep(T_END_CARD - 0.2, T_END_CARD + 1.0, t));
    u.uPaper.value = paper;
    // Otsikot.
    let key = null, a = 0;
    if (t > S.T_NEEDLE + 1.2 && t < S.T0 + 1.2) { key = 'main'; a = smoothstep(S.T_NEEDLE + 1.2, S.T_NEEDLE + 2.4, t) * (1 - smoothstep(S.T0 - 0.2, S.T0 + 1.1, t)); }
    else if (t > S.T0 + 3 && t < S.T0 + 10) { key = 'act1'; a = smoothstep(S.T0 + 3, S.T0 + 4, t) * (1 - smoothstep(S.T0 + 8.5, S.T0 + 10, t)); }
    else if (t > S.T_WID + 0.6 && t < S.T_WID + 8) { key = 'act2'; a = smoothstep(S.T_WID + 0.6, S.T_WID + 1.8, t) * (1 - smoothstep(S.T_WID + 6.5, S.T_WID + 8, t)); }
    else if (t > T_END_CARD + 0.6) { key = 'end'; a = smoothstep(T_END_CARD + 0.6, T_END_CARD + 1.6, t); }
    if (key !== titleKey) { drawTitle(post, key, S); titleKey = key; }
    u.uTitle.value = key ? a : 0;
    // Pöly: levyn naksahdukset täplinä samoissa ruuduissa.
    let k = 0;
    for (const d of post.dust) d.set(0, 0, 0, 0);
    for (let q = 0; q < S.clicks.length && k < 24; q++) {
      const [tc, s] = S.clicks[q];
      const life = s > 0.55 ? 0.45 : 0.1;
      if (tc > t || t - tc > life) continue;
      const h1 = hash1(q * 3 + 1), h2 = hash1(q * 3 + 2);
      post.dust[k++].set(h1 * W, h2 * H, 1.2 + 4.5 * Math.min(1, s), (hash1(q * 3 + 3) > 0.45 ? 1 : -1) * (0.5 + 0.4 * s) * (1 - (t - tc) / life * 0.5));
    }
    // Kohdistus: harmoninen jännite, dominanttiseptimissä kauimpana.
    const dom = Math.exp(-(((t - S.T_DOM7) / 0.6) ** 2));
    u.uMis.value = 0.5 + 2.0 * clamp(S.tension(t)) + 5 * dom + (t > S.T_WID ? 0.8 : 0);
    u.uGrain.value = 0.05 + 0.6 * clamp(S.hiss(t) * 20);
  }

  window.seek = (t) => {
    t = clamp(t, 0, duration);
    stage.T.uTime.value = t;
    const b = plan.blockAt(t);
    // Levy pyörii (Drehbühne). Lavasteet: vuoret näytöksessä I, kuolleet puut näytöksessä II.
    stage.disc.rotation.y = -S.spin(t);
    const act2 = t >= S.T_WID - 0.3;
    // Vuoret painautuvat levylle, kun orkesteri alkaa soida (maailma syntyy musiikista).
    stage.mountains.forEach((m, k) => {
      const g = smoothstep(S.T0 + 1.5 + 0.55 * k, S.T0 + 3.0 + 0.55 * k, t);
      m.visible = !act2 && g > 0.001;
      m.scale.set(1, Math.max(0.001, g), 1);
    });
    stage.trees.forEach((m) => (m.visible = act2));
    // Äänivarsi: neula etenee urassa (A-puoli ~20,5 min), alussa varsi laskeutuu.
    const prog = clamp((t - S.T_NEEDLE) / (20.5 * 60));
    stage.setTonearm(13.75 - (13.75 - 4.9) * prog, 0.16 * (1 - smoothstep(S.T_NEEDLE - 1.6, S.T_NEEDLE - 0.05, t)));
    const info = company.update(t);
    const heroSelf = lights(t, b);
    company.heroSelfDim(heroSelf);
    // Harppu: kielet väreilevät soitossa, glissando kulkee kieleltä toiselle.
    const hp = S.fam.harp(t);
    for (const m of stage.harpStrings) { m.uniforms.uAmp.value = 0.09 * clamp(hp * 1.3); m.uniforms.uPhase.value = t * 1.7; }
    // Patarummut: kapula iskee, kalvo välähtää.
    stage.drums.forEach((d, i) => {
      let hit = 0;
      for (const h of S.percHits) {
        const di = Math.floor(hash1(Math.round(h.t * 10)) * 2);
        if (di !== i) continue;
        const a = t + 1 / 30 - h.t;
        if (a > -0.15 && a < 0.5) hit = Math.max(hit, a < 0 ? 1 + a / 0.15 : Math.exp(-a / 0.12));
      }
      d.mallet.rotation.x = -0.35 + 0.53 * hit;
    });
    // Lautaset: kiekot iskevät yhteen, puupiirrostähti.
    let cy = 0;
    for (const h of S.cymbalHits) {
      const a = t + 1 / 30 - h.t;
      if (a > -0.2 && a < 0.9) cy = Math.max(cy, a < 0 ? 1 + a / 0.2 : Math.exp(-a / 0.25));
    }
    // lautaset laskeutuvat näkyviin vain iskun ajaksi (eivät roiku taivaalla)
    let near = 0;
    for (const h of S.cymbalHits) near = Math.max(near, Math.min(smoothstep(h.t - 1.4, h.t - 0.5, t), 1 - smoothstep(h.t + 0.9, h.t + 1.8, t)));
    stage.cym.g.visible = near > 0.001;
    stage.cym.g.position.y = 9.5 + 14 * (1 - near);
    stage.cym.l.position.x = -0.1 - 1.4 * (1 - cy);
    stage.cym.r.position.x = 0.1 + 1.4 * (1 - cy);
    stage.cym.star.visible = cy > 0.3;
    stage.cym.star.scale.setScalar(0.4 + 0.8 * cy);
    const shot = shots.frame(t, info, stage);
    renderer.setRenderTarget(post.rt);
    renderer.render(scene, shots.cam);
    overlay(t);
    post.render();
    if (debug) {
      const hud = document.getElementById('hud');
      hud.hidden = false;
      const pr = (k) => `${k} ${S.pres[k].at(t).toFixed(2)} e${S.energy[k](t).toFixed(2)}`;
      hud.textContent = [
        `t ${t.toFixed(2)}  tahti ${(S.barPos(t) + 1).toFixed(2)}  lohko ${b.name}`,
        `otto ${shot.k}: ${shot.type}  ${shot.a.toFixed(1)}–${shot.b.toFixed(1)}`,
        `jakso ${S.segAt(t)?.k + 1 ?? '-'} ${S.segAt(t)?.trait ?? ''}  voimakkuus ${S.loud(t).toFixed(2)} tutti ${S.tutti(t).toFixed(2)}`,
        pr('horns'), pr('violins'), pr('lows'), pr('brass'),
        `puupuh. ${S.fam.winds(t).toFixed(2)} harppu ${hp.toFixed(2)} lyöm. ${S.fam.perc(t).toFixed(2)}`,
        `uusin vastustaja: ${info.criticNew ? info.criticNew.type : '-'}`,
      ].join('\n');
    }
    return !gl.isContextLost();
  };
  window.contextOk = () => !gl.isContextLost();
  window.duration = duration;
  window.shotList = () => shots.shots.map((s) => [s.a.toFixed(2), s.b.toFixed(2), s.type]);
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
