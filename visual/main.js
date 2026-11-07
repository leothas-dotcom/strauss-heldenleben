// Käynnistys: lataa analyysipaketin ja merkinnät, rakentaa kohtauksen ja tarjoaa window.seek(t).
//   ?data=build/demo400&mode=render   Puppeteer kutsuu seek(t) ruutu kerrallaan
//   ?data=build/demo400&mode=preview  ääni soi ja kuva seuraa (välilyönti, nuolet)
//   &debug=1                          datan arvot kuvan päällä (tarkistus)

import { createScene, W, H } from './scene.js';
import { createPrinter } from './print.js';
import { clamp } from './util.js';

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
  const C = meta.channels.length;
  const channels = {};
  meta.channels.forEach((c, j) => {
    const a = new Float32Array(meta.frames);
    for (let i = 0; i < meta.frames; i++) a[i] = raw[i * C + j];
    channels[c] = a;
  });
  return { meta, channels };
}

async function load() {
  const analysis = await frames('analysis');
  const listen = await frames('listen');
  const json = async (p) => (await fetchOk(p)).json();
  return {
    meta: analysis.meta,
    channels: analysis.channels,
    listen,
    beats: await json(`/${dataDir}/beats.json`),
    events: await json(`/${dataDir}/events.json`),
    patina: await json(`/${dataDir}/patina.json`),
    segments: await json(`/${dataDir}/segments.json`),
    cues: await json('/annotations/cues.json'),
  };
}

function startPreview(duration) {
  document.body.classList.add('preview');
  const hud = document.getElementById('hud');
  hud.hidden = false;
  const fit = () => document.documentElement.style.setProperty('--s', Math.min(innerWidth / W, innerHeight / H));
  addEventListener('resize', fit);
  fit();
  const audio = new Audio(`/${dataDir}/soundtrack.wav`);
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      audio.paused ? audio.play() : audio.pause();
      e.preventDefault();
    }
    if (e.code === 'ArrowRight') audio.currentTime = Math.min(duration, audio.currentTime + 5);
    if (e.code === 'ArrowLeft') audio.currentTime = Math.max(0, audio.currentTime - 5);
  });
  const loop = () => {
    window.seek(audio.currentTime);
    requestAnimationFrame(loop);
  };
  loop();
}

try {
  const view = document.getElementById('view');
  const hud = document.getElementById('hud');
  view.width = W;
  view.height = H;
  const data = await load();
  const scene = createScene(data);
  const printer = createPrinter(view, scene.plates);
  const duration = data.meta.duration;
  const gl = view.getContext('webgl2'); // sama konteksti kuin painojäljellä
  // Palauttaa false, jos WebGL-konteksti on kadonnut (kuva olisi tyhjä); renderöijä hylkää osan.
  window.seek = (t) => {
    printer.composite(scene.draw(clamp(t, 0, duration)));
    if (debug) {
      hud.hidden = false;
      hud.textContent = Object.entries(scene.debugInfo(t)).map(([k, v]) => `${k}: ${v}`).join('\n');
    }
    return !gl.isContextLost();
  };
  window.contextOk = () => !gl.isContextLost();
  window.duration = duration;
  window.sceneReady = true;
  if (mode === 'preview') startPreview(duration);
} catch (e) {
  window.sceneError = String(e && e.stack ? e.stack : e);
  console.error(e);
}
