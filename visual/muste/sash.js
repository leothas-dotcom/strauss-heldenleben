// Ritarin vyö: kumppanin paperinvalkoinen viiva kietoutuu ritarin ympärille kosinnan seurauksena
// (palaute A11: "sankarin pitää MUUTTUA kosinnan seurauksena ... uusi vaate, osaksi häntä ... hän
// kuljettaa sitä lopun elokuvaa mukana, vaikka taisteluun").
//
// Yksi jatkuva viiva olkapäältä vyötärölle ja vyötärön ympäri, lopussa vapaa pää tuulessa. Sama väri
// (paperi) ja sama leveys kuin companion.js:n viivalla (companionFigure W0 = 0,085); ei siluettia eikä
// kasvoja. Viiva on hahmon torson lapsi, joten se seuraa FK:ta (seisoo, polvistuu, ratsailla, soutaa).
// Kaikki on puhdasta ajan funktiota: geometria lasketaan joka ruudulla alusta, ei tilaa ruutujen välillä.
//
// Rajapinta (hero.place opts.sash, tai oletus setSashDefault):
//   sash: { t0, dur = 8, amount(t) = ease((t - t0) / dur), signal(t) = oletus }
//     t0     = ankkuri, jossa viiva alkaa kietoutua (A-puoli: S.A('gef_huippu'))
//     amount = 0..1: kuinka suuri osa viivasta on kietoutunut (kasvaa olkapäältä alas, ei napsahda)
//     signal = 0..1 (opts.sashSignal): mitattu sooloviulukanava; viiva värähtää ja leviää, kun viulu soi
//   sash: false  -> ei vyötä tässä kutsussa
// main.js asettaa oletuksen kerran (setSashDefault), joten kaikki myöhemmät otot (taistelu, B-puoli)
// saavat vyön ilman että osa tekee mitään; osa voi ohittaa oletuksen omalla sash-oliollaan.

import * as THREE from 'three';
import { C, ink, clamp, smoothstep } from './paper.js';
import { ribbon, chaikin } from './companion.js';

export const SASH_W = 0.085;   // = companion.js companionFigure W0
const NS = 64;                 // viivan pisteitä

const DEFAULT = { t0: null, dur: 8, amount: null, signal: null };
export function setSashDefault(o) { Object.assign(DEFAULT, { t0: null, dur: 8, amount: null, signal: null }, o); }
export const sashDefault = () => DEFAULT;

const ease = (x) => { const u = clamp(x); return u * u * (3 - 2 * u); };
function resolve(o, t, sig) {
  if (o === false) return { amount: 0, signal: 0 };
  const d = o && (o.t0 !== undefined || o.amount) ? o : DEFAULT;   // opts.sash ilman t0/amount -> oletus
  if (!d || (d.t0 === null && !d.amount)) return { amount: 0, signal: 0 };
  const amount = d.amount ? d.amount(t) : ease((t - d.t0) / (d.dur ?? 8));
  const sg = sig || (o && o.signal) || DEFAULT.signal;
  return { amount: clamp(amount), signal: sg ? clamp(sg(t)) : 0 };
}

// Ohjauspisteet (torson paikalliset koordinaatit, kasvot +x; torso y 0..0,74, leveys ~0,17..0,27):
// kauempi olkapää -> rinnan yli viistoon -> lähempi lanne -> vyötärön ympäri taakse -> vapaa pää.
const FRONT = [[-0.22, 0.7], [-0.17, 0.56], [-0.09, 0.42], [0.02, 0.28], [0.14, 0.16], [0.21, 0.085], [0.12, 0.05], [-0.04, 0.055], [-0.18, 0.07], [-0.27, 0.085]];
// selkäkuva (knightBack, koordinaatit: juuri jaloissa, hartiat y ~1,75, vyötärö y ~1,0)
const BACK = [[-0.3, 1.72], [-0.18, 1.5], [-0.04, 1.3], [0.1, 1.12], [0.2, 0.98], [0.24, 0.93], [0.1, 0.9], [-0.06, 0.91], [-0.2, 0.93], [-0.3, 0.95]];

export function makeSash(parent, o = {}) {
  const R = ribbon(NS);
  const mat = ink(C.paper, {});
  const mesh = new THREE.Mesh(R.geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 0;
  mesh.position.z = o.z ?? 0.02;
  mesh.visible = false;
  parent.add(mesh);
  const base = o.back ? BACK : FRONT;
  const X = new Float32Array(NS), Y = new Float32Array(NS), Wd = new Float32Array(NS);
  const last = { amount: 0, signal: 0, len: 0 };
  function set(t, so, sig) {
    const { amount, signal } = resolve(so, t, sig);
    last.amount = amount; last.signal = signal;
    mesh.visible = amount > 0.002;
    if (!mesh.visible) return last;
    // vapaa pää: viulun soidessa värähtää ja leviää; muuten hiljainen huojunta
    const A = 0.03 + 0.32 * signal;   // viulun soidessa vapaa pää leimahtaa selvästi (osa 4: 0,17 ei lukeutunut)
    const pts = base.map((p) => p.slice());
    const e = pts[pts.length - 1];
    for (let j = 1; j <= 4; j++) {
      const v = j / 4;
      pts.push([e[0] - (0.17 + 0.12 * signal) * j, e[1] - 0.03 * j + A * v * Math.sin(1.7 * j - t * 3.3)]);   // vapaa pää valuu selän puolelle (-x)
    }
    const sm = chaikin(pts, 2);
    // tasavälinen otanta kaaren pituuden mukaan
    const cum = [0];
    for (let i = 1; i < sm.length; i++) cum.push(cum[i - 1] + Math.hypot(sm[i][0] - sm[i - 1][0], sm[i][1] - sm[i - 1][1]));
    const L = cum[cum.length - 1];
    last.len = L;
    const sEnd = amount * L;
    let k = 0;
    const wBase = SASH_W * (1 + 1.1 * signal);
    for (let i = 0; i < NS; i++) {
      const s = Math.min(sEnd, (L * i) / (NS - 1));
      while (k < cum.length - 2 && cum[k + 1] < s) k++;
      const f = (s - cum[k]) / Math.max(1e-6, cum[k + 1] - cum[k]);
      X[i] = sm[k][0] + (sm[k + 1][0] - sm[k][0]) * f;
      Y[i] = sm[k][1] + (sm[k + 1][1] - sm[k][1]) * f;
      // alku ja kasvava kärki ohenevat; vapaa pää kapenee
      const head = smoothstep(0, 0.04 * L, s), tip = 1 - smoothstep(Math.max(0, sEnd - 0.1 * L), sEnd + 1e-4, s) * (amount < 0.999 ? 0.9 : 0);
      const tail = 1 - 0.8 * smoothstep(0.82 * L, L, s);
      Wd[i] = (L * i) / (NS - 1) > sEnd + 1e-6 ? 0 : wBase * head * tip * tail;
    }
    R.fill(X, Y, 0, Wd);
    return last;
  }
  return { mesh, mat, set, last };
}
