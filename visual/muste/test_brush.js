// Testi: teemaviiva vetona, sankari, morph 0.5 ja 1.0, roiske. render.mjs: window.seek/sceneReady/duration.
import * as THREE from 'three';
import { C } from './ink.js';
import { createSignals } from './signals.js';
import { loadSide } from './data.js';
import { brushStroke, themeLine, inkHero, splat } from './brush.js';
import { clamp } from '../util.js';

const W = 1920, H = 1080;
window.duration = 400;
try {
  const data = await loadSide([{ dir: 'build/demo400', from: 0, to: 400 }]);
  const S = createSignals(data);
  const tv = await (await fetch('/build/demo400/teemaviiva.json')).json();
  const TL = themeLine(S, tv);
  const view = document.getElementById('view');
  view.width = W; view.height = H;
  const renderer = new THREE.WebGLRenderer({ canvas: view, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false);
  renderer.setClearColor(C.paper, 1);
  const scene = new THREE.Scene();
  const U = 60;                                  // px / yksikkÃ¶
  const cam = new THREE.OrthographicCamera(-W / 2 / U, W / 2 / U, H / 2 / U, -H / 2 / U, -50, 50);
  // a) teemaviiva: x = aika (7.6..31 s), y = rekisteri
  const sx = 0.56, ox = -15.5 - 7.6 * sx, sy = 1.05, oy = -8.4;
  const line = brushStroke(scene, 300, C.red, { wmin: 0.08, wmax: 0.4, hairW: 0.05, fs: 2.2, bleed: 0.06, dryLen: 0.16, lambda: 0.012, seed: 3 });
  const tr = TL.trace(7.6, 31, 1 / 30, (t, y) => [ox + t * sx, oy + y * sy], { smooth: 0.15 });
  // paine: S.loud tasoitettuna 0,3 s; kihitsu sävelen vaihtuessa (ohenee, sitten paksuuntuu)
  const sm = (t) => { let a = 0, w = 0; for (let k = -4; k <= 4; k++) { const g = Math.exp(-0.5 * (k / 2) ** 2); a += g * S.loud(t + k * 0.075); w += g; } return a / w; };
  let lo = 1e9, hi = -1e9; for (let t = 7.6; t < 31; t += 0.1) { lo = Math.min(lo, sm(t)); hi = Math.max(hi, sm(t)); }
  const changes = []; for (let t = 7.6; t < 31; t += 1 / 30) { const a = TL.midi(t), b = TL.midi(t + 1 / 30); if (a !== null && b !== null && Math.abs(b - a) > 0.8) changes.push(t + 1 / 30); }
  const tsPts = []; for (let t = 7.6; t <= 31 + 1e-9; t += 1 / 30) if (TL.y(t) !== null) tsPts.push(t);
  const press = tsPts.map((t) => {
    let p = Math.pow(clamp((sm(t) - lo) / (hi - lo)), 1.1);
    let k = 1;
    for (const c of changes) { const d = t - c; if (d > -0.1 && d < 0.25) k *= 1 - 0.55 * Math.exp(-(((d + 0.02) / 0.05) ** 2)) + 0.3 * Math.exp(-(((d - 0.1) / 0.07) ** 2)); }
    return clamp(p * k, 0.02, 1);
  });
  console.log('press', [0,.1,.25,.5,.75,.9].map(q=>[...press].sort((a,b)=>a-b)[Math.floor(q*press.length)].toFixed(2)).join(' '));
  // b) sankari, c) morph 0.5 ja 1.0
  const mk = (x, y, sc) => { const h = inkHero(scene); h.root.position.set(x, y, 0.1); h.root.scale.setScalar(sc); return h; };
  const friezePts = (x0, y0, x1) => Array.from({ length: 90 }, (_, i) => { const f = i / 89; const t = 9.0 + f * 20; return [x0 + f * (x1 - x0), y0 + 0.5 * (TL.y(t) ?? 1.5)]; });
  const hB = mk(1.8, -8.5, 1.9);
  const hC1 = mk(9.6, -8.5, 1.9); hC1.setFrieze(friezePts(1.0, -3.4, 15.5));
  const hC2 = mk(9.6, 0.0, 1.9); hC2.setFrieze(friezePts(-1.0, 2.8, 15.5));
  const sp = new THREE.Group(); scene.add(sp);
  const spl = splat(sp, 1);
  window.seek = (t) => {
    line.set(tr.pts, press, 1);
    hB.morph(t, 0); hC1.morph(t, 0.5); hC2.morph(t, 1.0);
    spl.set(t, [{ t, x: -12.5, y: 5.2, s: 1.6, z: 4 }], 0.08);
    renderer.render(scene, cam);
    return true;
  };
  window.seek(20);
  window.sceneReady = true;
} catch (e) { window.sceneError = String(e && e.stack || e); console.error(window.sceneError); }
