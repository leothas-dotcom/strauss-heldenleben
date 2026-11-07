// Kohtaus: piirtää muodot painolaatoille (Canvas 2D). Painojälki syntyy print.js:ssä.
// drawAt(t, camX, camY) on puhdas funktio: sama syöte antaa aina saman kuvan.
//
// Tyylin "Elävä vedos" kielioppi (docs/visuaalinen_tyyli.md):
//   pisteet = vastustajat, taso = sankari, taustatasot = maailma (orkesterin säestys).
//   Pystysuunta on rekisteri: taivas = viulut, horisontti = sankari (käyrätorvet + sellot),
//   maa = bassot. Pääääni täydellä värillä, sivuääni rasterina, säestys maailman sinisenä.
//   Jokaisella musiikillisella jaksolla (segments.json) on oma maisemansa ja sankaritason
//   muotonsa (mielikuvitus, palo, pyrkimys, suoraselkäisyys); suurimmissa siirtymissä
//   painetaan jugend-kehys. Sivutoiminta: tremolo värisyttää viivoitusta, harppu väreilee
//   vedessä, patarummut tärisyttävät maata, lautasisku välähtää. Tempo näkyy tahtipaaluina.

import { hash1, vnoise1, clamp, smoothstep, mix, gaussian, sampler } from './util.js';

export const W = 1920;
export const H = 1080;
export const FPS = 30;
export const SPEED = 160; // friisi: aika kulkee vaakasuunnassa, px/s
export const NOW_X = (W * 2) / 3; // painokohta
const LEAD = 1 / FPS; // kuva yhden ruudun ennen ääntä
const CRANE = 70;

// Maailman kerrostasot, p = parallaksi. far = horisontti (tutti), mid ja near = maa (bassot).
const LAYERS = [
  { p: 0.55, base: 0.5, amp: 0.17, lambda: 640, seed: 11, tint: 0.4, fog: 0.15 },
  { p: 0.75, base: 0.66, amp: 0.13, lambda: 430, seed: 23, tint: 0.7, fog: 0.12 },
  { p: 1.0, base: 0.8, amp: 0.1, lambda: 260, seed: 37, tint: 1.0, fog: 0.09 },
];
const PATH_Y = 0.885; // sankarin polku (maailman y, osuus korkeudesta)

const canvas = (w = W, h = H) => Object.assign(document.createElement('canvas'), { width: w, height: h });

function ridged(x, seed) {
  let v = 0, a = 1, f = 1, s = 0;
  for (let o = 0; o < 4; o++) {
    const n = vnoise1(x * f, seed + o * 13);
    v += a * Math.pow(1 - Math.abs(2 * n - 1), 1.6);
    s += a;
    a *= 0.48;
    f *= 2.3;
  }
  return v / s;
}

function percentile(arr, q, from = 0) {
  const v = Array.from(arr.subarray(from)).sort((a, b) => a - b);
  return v[Math.floor(q * (v.length - 1))] || 1e-6;
}

// Selkäkuva, paikallisissa koordinaateissa (jalat origossa, y ylöspäin negatiivinen).
function figurePaths() {
  const RIDGE = 'M-50 6 L-40 -4 L-24 -10 L-8 -6 L10 -12 L28 -8 L44 -1 L54 8';
  const rock = new Path2D(`M-52 40 L${RIDGE.slice(1)} L54 40 Z`);
  const rockTop = new Path2D(RIDGE);
  const body = new Path2D();
  body.moveTo(-10, -68);
  body.quadraticCurveTo(-15, -50, -16, -30);
  body.lineTo(-3, -33);
  body.lineTo(4, -31);
  body.quadraticCurveTo(14, -32, 21, -38);
  body.quadraticCurveTo(13, -52, 10, -68);
  body.quadraticCurveTo(0, -72, -10, -68);
  body.moveTo(-7, -9); body.lineTo(-5, -34); body.lineTo(-1, -34); body.lineTo(-2, -9); body.closePath();
  body.moveTo(2, -9); body.lineTo(1, -34); body.lineTo(5, -34); body.lineTo(7, -9); body.closePath();
  body.rect(-2.5, -79, 5, 10);
  body.moveTo(6.5, -85); body.arc(0, -85, 6.5, 0, Math.PI * 2);
  body.moveTo(8, -67); body.lineTo(20, -58); body.lineTo(18, -54); body.lineTo(6, -62); body.closePath();
  const lance = new Path2D('M19 -4 L26 -150');
  const tip = new Path2D('M26 -164 L29.5 -150 L22.5 -150 Z');
  return { rock, rockTop, body, lance, tip, lanceTop: [26, -150] };
}

function spirePath(h) {
  const p = new Path2D();
  const pts = [];
  for (let i = 0; i <= 10; i++) {
    const u = i / 10;
    pts.push([-95 + 80 * u + (hash1(800 + i) - 0.5) * 18 * (1 - u), -h * u + (hash1(820 + i) - 0.5) * 14]);
  }
  pts.push([0, -h - 4]);
  for (let i = 10; i >= 0; i--) {
    const u = i / 10;
    pts.push([100 - 84 * u + (hash1(840 + i) - 0.5) * 18 * (1 - u), -h * u + (hash1(860 + i) - 0.5) * 14]);
  }
  p.moveTo(pts[0][0], 60);
  for (const [x, y] of pts) p.lineTo(x, y);
  p.lineTo(pts[pts.length - 1][0], 60);
  p.closePath();
  return p;
}

export function createScene({ meta, channels: ch, listen, beats, events, cues, patina, segments }) {
  const n = meta.frames;
  const t0 = meta.music_start - meta.start;
  const i0 = Math.round(t0 * FPS);
  const lch = listen.channels;
  const cue = (id) => cues.cues.find((c) => c.id === id);
  const sec = (id) => cues.sections.find((s) => s.id === id);
  const T_DOM7 = (cue('cue_hero_dom7')?.t ?? 239.0) - meta.start;
  const T_WID = (sec('widersacher')?.start ?? 241.5) - meta.start;
  const T_NEEDLE = (patina.clicks.length ? patina.clicks[0][0] : 3.0) - meta.start;
  const T_END = meta.duration;
  const fi = (tau) => clamp(Math.round(tau * FPS), 0, n - 1);

  // --- Signaali ----------------------------------------------------------------
  const regArr = Float32Array.from(ch.register, (v, i) => (i < i0 ? ch.register[i0] : v));
  const reg = sampler(gaussian(regArr, 18), FPS);
  const regLong = sampler(gaussian(regArr, 60), FPS);
  const loud = sampler(ch.loudness, FPS);
  const presence = (tau) => smoothstep(0.03, 0.12, loud(tau));
  const flux = sampler(gaussian(ch.flux, 1.5), FPS);
  const tensionRaw = sampler(gaussian(ch.tension, 12), FPS);

  // --- Soittimet: perheet suhteessa omaan 95. persentiiliinsä -----------------
  function famArr(keys, sigma = 12) {
    const a = new Float32Array(n);
    for (const k of keys) {
      const c = lch[`panns_${k}`];
      if (c) for (let i = 0; i < n; i++) a[i] += c[i];
    }
    const s = gaussian(Float32Array.from(a, (v) => Math.min(1, v)), sigma);
    const p = percentile(s, 0.95, i0);
    return Float32Array.from(s, (v, i) => (i < i0 ? 0 : clamp(v / p, 0, 1.5)));
  }
  const F = {
    horns: famArr(['french_horn']),
    brass: famArr(['trumpet', 'trombone', 'brass_instrument']),
    violins: famArr(['violin_fiddle']),
    strings: famArr(['string_section', 'bowed_string_instrument']),
    cello: famArr(['cello']),
    bass: famArr(['double_bass']),
    winds: famArr(['wind_instrument_woodwind_instrument', 'flute', 'clarinet']),
    perc: famArr(['timpani', 'bass_drum', 'drum_roll', 'snare_drum'], 4),
    cymbal: famArr(['cymbal'], 3),
    harp: famArr(['harp'], 15),
    tutti: famArr(['orchestra'], 20),
  };
  const bs = gaussian(lch.stem_bass, 6);
  const bsP = percentile(bs, 0.95, i0);
  // Tehollinen tutti: kova soitto, jota yksittäiset soitinluokat eivät selitä, on koko orkesteri
  // (PANNs ei erottele soittimia tiheässä ff-tutissa).
  const loudS = gaussian(ch.loudness, 9);
  const tuttiArr = Float32Array.from(F.tutti, (v, i) => (i < i0 ? 0 : Math.max(clamp(v), smoothstep(0.45, 0.85, loudS[i]))));
  F.tutti = tuttiArr;
  // Äänet: sankari = käyrätorvet + sellot (+ vasket), taivas = viulut, maa = bassot.
  const heroArr = new Float32Array(n);
  const skyArr = new Float32Array(n);
  const earthArr = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    heroArr[i] = clamp(Math.max(F.horns[i], 0.8 * F.brass[i], 0.85 * F.cello[i], 0.9 * tuttiArr[i]));
    skyArr[i] = clamp(Math.max(F.violins[i], 0.6 * F.strings[i], 0.6 * tuttiArr[i]));
    earthArr[i] = clamp(Math.max(F.bass[i], 0.6 * F.cello[i], bs[i] / bsP, 0.75 * tuttiArr[i]));
  }
  // Pääääni (Hauptstimme) hystereesillä: vaihtuu vain, kun toinen ääni on selvästi vahvempi 0,5 s.
  const HARR = new Uint8Array(n);
  {
    let cur = 0, run = 0, cand = 0;
    for (let i = 0; i < n; i++) {
      const sc = [heroArr[i] * 1.15, skyArr[i], earthArr[i] * 0.9];
      const best = sc.indexOf(Math.max(...sc));
      if (best !== cur && sc[best] > sc[cur] + 0.08) {
        run = best === cand ? run + 1 : 1;
        cand = best;
        if (run >= 15) cur = best;
      } else run = 0;
      HARR[i] = cur;
    }
  }
  // Päääänen paino pehmeästi (0,4 s), ettei täysväri ja rasteri vaihdu pystysaumana.
  const leadW = [0, 1, 2].map((v) => sampler(gaussian(Float32Array.from(HARR, (h) => (h === v ? 1 : 0)), 12), FPS));
  const S = Object.fromEntries(Object.entries(F).map(([k, v]) => [k, sampler(v, FPS)]));
  const windsSlow = sampler(gaussian(F.winds, 90), FPS);
  const hero = sampler(heroArr, FPS);
  const sky = sampler(skyArr, FPS);
  const earth = sampler(earthArr, FPS);
  const lead = (tau) => HARR[fi(tau)]; // 0 sankari, 1 taivas (viulut), 2 maa (bassot)
  const harpPhase = new Float32Array(n);
  for (let i = 1; i < n; i++) harpPhase[i] = harpPhase[i - 1] + F.harp[i] / FPS;

  // Viulujen kaari: melodia (CREPE) kun se on korkealla ja varma, muuten korkean kaistan energia.
  const skyYArr = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const m = lch.johtava_midi[i];
    const y = m >= 64 && lch.johtava_varmuus[i] >= 0.5 ? 0.36 - ((m - 64) / 32) * 0.26 : 0.33 - 0.16 * ch.band_korkea[i];
    skyYArr[i] = clamp(y, 0.07, 0.38) * H;
  }
  const skyY = sampler(gaussian(skyYArr, 9), FPS);
  const heroYArr = Float32Array.from({ length: n }, (_, i) => H * (0.63 - 0.26 * reg(i / FPS)));
  const heroY = sampler(heroYArr, FPS);
  const heroYStraight = sampler(gaussian(heroYArr, 45), FPS);

  // Tahdit: jatkuva tahtiluku ja paalut.
  const barT = beats.bars.map((b) => b.t - meta.start);
  function barPos(tau) {
    if (barT.length < 2 || tau < barT[0]) return (tau - (barT[0] ?? 0)) / 2;
    let lo = 0, hi = barT.length - 1;
    if (tau >= barT[hi]) return hi + (tau - barT[hi]) / (barT[hi] - barT[hi - 1]);
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (barT[mid] <= tau) lo = mid; else hi = mid;
    }
    return lo + (tau - barT[lo]) / (barT[hi] - barT[lo]);
  }

  // Sävellaji: molli tummentaa taivasta hieman.
  const keys = meta.keys_5s.map((k) => ({ t: k.t - meta.start, minor: k.key.includes('molli') }));
  const minorAt = (tau) => (keys.find((k) => tau >= k.t && tau < k.t + 5)?.minor ? 1 : 0);

  // --- Jaksot: maisema ja sankaritason muoto ----------------------------------
  const segs = segments.map((s, k) => ({ ...s, a: s.alku - meta.start, b: s.loppu - meta.start, k }));
  function trait(s) {
    if (s.a >= T_DOM7 + 0.5) return 'tumma';
    const a = s.aktiivisuus;
    const brassy = (a['trumpetit ja pasuunat'] ?? 0) + (a['käyrätorvet'] ?? 0);
    if (brassy > 0.9 && (a['lyömäsoittimet'] ?? 0) > 0.35) return 'suora'; // suoraselkäisyys
    if (s.suunta === 'diminuendo') return 'perus'; // laskeutuminen: tavallinen taso
    if (s.suunta === 'crescendo') return 'portaat'; // pyrkimys
    if ((a.viulut ?? 0) > 0.6 && s.dynamiikka !== 'ff') return 'kiehkurat'; // mielikuvitus
    if (s.dynamiikka === 'f' || s.dynamiikka === 'ff') return 'liekit'; // palo
    return 'perus';
  }
  segs.forEach((s) => (s.trait = trait(s)));
  function segAt(tau) {
    let lo = 0, hi = segs.length - 1;
    if (!segs.length || tau < segs[0].a) return null;
    while (hi > lo) {
      const mid = (lo + hi + 1) >> 1;
      if (segs[mid].a <= tau) lo = mid; else hi = mid - 1;
    }
    return segs[lo];
  }
  // Jugend-kehys suurimpiin siirtymiin: soittimiston ja dynamiikan muutoksen koko.
  const fams = Object.keys(segs[0]?.aktiivisuus ?? {});
  const levels = { pp: 0.1, p: 0.3, mf: 0.55, f: 0.75, ff: 0.9 };
  const columns = segs.slice(1)
    .map((s, k) => {
      const prev = segs[k];
      const d = fams.reduce((acc, f) => acc + Math.abs((s.aktiivisuus[f] ?? 0) - (prev.aktiivisuus[f] ?? 0)), 0);
      return { tau: s.a, score: d + 2 * Math.abs(levels[s.dynamiikka] - levels[prev.dynamiikka]) };
    })
    .filter((c) => Math.abs(c.tau - T_DOM7) > 4 && c.tau > t0 + 5)
    .sort((x, y) => y.score - x.score)
    .slice(0, 9)
    .map((c) => c.tau)
    .sort((x, y) => x - y);

  // --- Tapahtumat ----------------------------------------------------------------
  const evs = events.events.map((e) => ({ ...e, t: e.t - meta.start }));
  const hammer = evs.filter((e) => e.tyyppi === 'voimistuu_akkia' && e.t > t0 + 5 && e.t < T_DOM7 - 1);
  const clicks = patina.clicks.map(([tc, s]) => [tc - meta.start, s]);
  function hits(arr, thr, rise) {
    const out = [];
    let last = -99;
    for (let i = i0 + 6; i < n; i++) {
      if (arr[i] > thr && arr[i] - arr[i - 6] > rise && arr[i] >= arr[i - 1] && (arr[i + 1] ?? 0) <= arr[i] && i - last > 15) {
        if (ch.loudness[i] > 0.08) out.push({ tau: i / FPS, s: clamp(arr[i]) });
        last = i;
      }
    }
    return out;
  }
  const percHits = hits(F.perc, 0.45, 0.25);
  const cymbalHits = hits(F.cymbal, 0.5, 0.3);

  // Vastustajat: puupuhaltimien fraasit (attakit alle 0,9 s välein); yhdeksän ensimmäistä
  // fraasia saavat Porterin järjestyksen, myöhemmät rekisterin mukaan.
  const ORDER = ['neula', 'rykelma', 'roiske', 'portaat', 'dehring', 'vapisevat', 'karikatyyri', 'fagotit', 'pasuunat'];
  const critics = [];
  {
    const ons = meta.onsets.map((x) => x - meta.start).filter((tau) => tau >= T_WID + 0.3 && tau < T_END - 1.5)
      // puupuhaltimet, tai matalat vasket/fagotit (bassostemmi ilman jousia)
      .filter((tau) => S.winds(tau) >= 0.12 || (bs[fi(tau)] / bsP >= 0.32 && S.strings(tau) < 0.4 && S.cello(tau) < 0.5));
    const phrases = [];
    for (const tau of ons) {
      const last = phrases[phrases.length - 1];
      if (last && tau - last[last.length - 1] < 0.9) last.push(tau);
      else phrases.push([tau]);
    }
    phrases.forEach((ph, p) => {
      const m0 = lch.johtava_midi[fi(ph[0])];
      const yBase = clamp(m0 > 0 ? H * (0.86 - ((m0 - 36) / 60) * 0.7) : H * (0.62 - 0.3 * reg(ph[0])), H * 0.18, H * 0.8);
      // Myöhemmät fraasit: tyyppi rekisterin mukaan, vaihtelu fraasikohtaisesti.
      const band = yBase < H * 0.36 ? ['neula', 'vapisevat'] : yBase < H * 0.6 ? ['rykelma', 'karikatyyri', 'portaat', 'vapisevat'] : ['dehring', 'fagotit', 'pasuunat'];
      const type = p < ORDER.length ? ORDER[p] : band[Math.floor(hash1(5000 + p) * band.length)];
      ph.forEach((tau, j) => {
        const y = type === 'neula' ? H * (0.14 + 0.16 * hash1(4000 + critics.length))
          : type === 'dehring' || type === 'fagotit' ? H * (0.72 + 0.08 * hash1(4100 + critics.length))
          : type === 'portaat' ? yBase - (j % 8) * 16
          : clamp(yBase + (hash1(4200 + critics.length) - 0.5) * 220, H * 0.16, H * 0.8);
        critics.push({ tau, y, type, j, ph0: ph[0], size: 0.6 + 0.6 * clamp(flux(tau)), seed: 7000 + critics.length });
      });
    });
    for (const h of cymbalHits) {
      if (h.tau >= T_WID) critics.push({ tau: h.tau, y: H * (0.22 + 0.15 * hash1(Math.round(h.tau * 10))), type: 'roiske', j: 0, ph0: h.tau, size: 1.2, seed: 9100 + critics.length });
    }
    critics.sort((a, b) => a.tau - b.tau);
  }

  const adv = (tau) => smoothstep(T_WID - 0.5, T_WID + 4, tau);
  const tension = (tau) =>
    clamp(tensionRaw(tau) * (1 - 0.3 * adv(tau)) + 0.35 * adv(tau) + 1.2 * Math.exp(-(((tau - T_DOM7) / 0.5) ** 2)), 0, 1.6);
  const camYAt = (t) => -CRANE * (regLong(t) - 0.5);
  const layerTau = (L, X) => (X - NOW_X * (1 - L.p)) / (L.p * SPEED);
  // Maan tärähdys patarummuista (sivutoiminta, hetkellinen).
  const shakeAt = (t) => {
    let y = 0;
    for (const h of percHits) {
      const a = t - h.tau;
      if (a >= 0 && a < 0.5) y += 7 * h.s * Math.exp(-a / 0.11) * Math.cos(a * 55);
    }
    return y;
  };

  function ridgeSeg(L, X, seg) {
    const seed = L.seed + 31 * (seg ? seg.k : 0);
    const lambda = L.lambda * (0.75 + 0.5 * hash1(seed + 5));
    return ridged(X / lambda, seed);
  }
  function ridgeAt(L, X) {
    const tau = layerTau(L, X);
    const s = segAt(tau);
    let r = ridgeSeg(L, X, s);
    if (s && s.k > 0) r = mix(ridgeSeg(L, X, segs[s.k - 1]), r, smoothstep(s.a, s.a + 1.2, tau));
    const a = adv(tau);
    const voice = L.p === 0.55 ? 0.6 + 0.5 * S.tutti(tau) : 0.3 + 0.9 * earth(tau);
    return (L.base + 0.05 * a) * H - L.amp * voice * (1 - 0.6 * a) * H * r;
  }

  // --- Painolaatat ----------------------------------------------------------
  const plates = { blue: LAYERS.map(() => canvas()), red: canvas(), black: canvas(), sketch: canvas(), dust: canvas() };
  const ctx = {
    blue: plates.blue.map((c) => c.getContext('2d')),
    red: plates.red.getContext('2d'),
    black: plates.black.getContext('2d'),
    sketch: plates.sketch.getContext('2d'),
    dust: plates.dust.getContext('2d'),
  };
  const tmp = canvas();
  const tctx = tmp.getContext('2d');
  const maskCanvas = canvas(W, 1);
  const mctx = maskCanvas.getContext('2d');
  const mask = mctx.createImageData(W, 1);
  const maskFull = canvas();
  const mfctx = maskFull.getContext('2d');
  const hatch = canvas(7, 7);
  {
    const hc = hatch.getContext('2d');
    hc.strokeStyle = '#000';
    hc.lineWidth = 1.5;
    hc.beginPath();
    hc.moveTo(-1, 8); hc.lineTo(8, -1);
    hc.moveTo(-1, 1); hc.lineTo(1, -1);
    hc.moveTo(6, 8); hc.lineTo(8, 6);
    hc.stroke();
  }
  const hatchPattern = ctx.black.createPattern(hatch, 'repeat');
  const fig = figurePaths();
  const FX = t0 * SPEED - 40;
  const GY = 0.885 * H;
  const XS = T_DOM7 * SPEED - 40;
  const TITLE_X = 400;

  const rowShift = (y, seed) => -45 - (vnoise1(y / 70, seed) - 0.5) * 80 - (vnoise1(y / 13, seed + 1) - 0.5) * 24;
  function columnMask(fn, ragged = false, seed = 0) {
    for (let x = 0; x < W; x++) mask.data[x * 4 + 3] = Math.round(255 * clamp(fn(x)));
    mctx.putImageData(mask, 0, 0);
    tctx.globalCompositeOperation = 'destination-in';
    if (ragged) {
      mfctx.clearRect(0, 0, W, H);
      for (let y = 0; y < H; y += 6) mfctx.drawImage(maskCanvas, rowShift(y, seed), y, W, 6);
      tctx.drawImage(maskFull, 0, 0);
    } else {
      tctx.drawImage(maskCanvas, 0, 0, W, H);
    }
    tctx.globalCompositeOperation = 'source-over';
  }
  // Painoreuna: kohta X painettiin hetkellä tau.
  function edgeAt(tau, t, X) {
    return clamp((t - tau) / 0.45 + (vnoise1(X / 37, 5) - 0.5) * 0.9);
  }
  function inkAt(tau, t, X, ramp = 2.0) {
    if (tau < t0 - 0.3) return 0;
    const begin = clamp((tau - t0) / ramp + 0.15 + (vnoise1(X / 37, 5) - 0.5) * 0.27);
    return edgeAt(tau, t, X) * begin * presence(tau);
  }
  const p1 = (x, camX) => (x + camX) / SPEED; // ruudun x -> painohetki (friisin taso)

  // --- Maailma: taivas, horisontti (tutti), maa (bassot), vesi (harppu) --------
  function drawWorld(t, camX, camY, shake) {
    // Taivas: aamunkoitto sinisestä kermaan (Runge), molli tummentaa; vastustajien aikana sameus.
    {
      const L = LAYERS[0];
      const oy = -L.p * camY;
      tctx.clearRect(0, 0, W, H);
      const g = tctx.createLinearGradient(0, oy, 0, H * 0.4 + oy);
      g.addColorStop(0, 'rgba(0,0,0,0.42)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      tctx.fillStyle = g;
      tctx.fillRect(0, 0, W, H);
      columnMask((x) => {
        const X = x + L.p * camX;
        const tau = layerTau(L, X);
        const dawn = mix(0.85, 0.35, smoothstep(t0, T_DOM7, tau)) * (1 - adv(tau));
        return inkAt(tau, t, X, 6) * dawn * (0.85 + 0.3 * minorAt(tau));
      }, true, 3);
      ctx.blue[0].drawImage(tmp, 0, 0);
    }
    LAYERS.forEach((L, k) => {
      const oy = -L.p * camY + (k === 2 ? shake : 0);
      tctx.clearRect(0, 0, W, H);
      const fogTop = L.base * H + oy;
      const g = tctx.createLinearGradient(0, fogTop - 0.03 * H, 0, fogTop + L.fog * H);
      g.addColorStop(0, `rgba(0,0,0,${L.tint})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      tctx.fillStyle = g;
      tctx.beginPath();
      tctx.moveTo(-10, H);
      for (let x = -10; x <= W + 10; x += 6) tctx.lineTo(x, ridgeAt(L, x + L.p * camX) + oy);
      tctx.lineTo(W + 10, H);
      tctx.closePath();
      tctx.fill();
      columnMask((x) => {
        const X = x + L.p * camX;
        const tau = layerTau(L, X);
        // Tiheys = orkestraation tiheys: horisontti tutin, maa bassojen mukaan.
        const voice = k === 0 ? 0.3 + 0.7 * S.tutti(tau)
          : k === 1 ? 0.35 + 0.65 * earth(tau)
          : (0.6 + 0.4 * leadW[2](tau)) * (0.35 + 0.65 * earth(tau));
        return inkAt(tau, t, X) * voice;
      }, true, L.seed);
      ctx.blue[k].drawImage(tmp, 0, 0);
    });

    // Vesi ja harpun väreet: vesi painetaan harpun soidessa, väreet ovat paperia (ei mustetta).
    const yw = (PATH_Y + 0.02) * H - camY;
    tctx.clearRect(0, 0, W, H);
    tctx.fillStyle = 'rgba(0,0,0,0.6)';
    tctx.beginPath();
    tctx.moveTo(-10, yw + 0.06 * H);
    for (let x = -10; x <= W + 10; x += 8) {
      tctx.lineTo(x, yw + 2.5 * Math.sin((x + camX) / 37) + 1.5 * Math.sin((x + camX) / 13 + 1.7));
    }
    tctx.lineTo(W + 10, yw + 0.06 * H);
    tctx.closePath();
    tctx.fill();
    columnMask((x) => {
      const tau = p1(x, camX);
      return smoothstep(0.15, 0.45, S.harp(tau)) * inkAt(tau, t, x + camX);
    }, true, 61);
    ctx.blue[2].drawImage(tmp, 0, 0);
    const b = ctx.blue[2];
    b.save();
    b.globalCompositeOperation = 'destination-out';
    b.strokeStyle = '#000';
    b.lineWidth = 1.8;
    b.lineCap = 'round';
    const ph = harpPhase[fi(t)];
    b.beginPath();
    for (let j = 0; j < 7; j++) {
      const y = yw + 6 + j * 8.5;
      const sp = 70 + 13 * j;
      const off = (ph * (90 + 25 * j) - camX) % sp;
      for (let x = -sp + off; x < W; x += sp) {
        const len = 18 + 16 * hash1(j * 97 + Math.floor((x + camX) / sp));
        b.moveTo(x, y);
        b.lineTo(x + len, y);
      }
    }
    b.stroke();
    b.restore();
  }

  // Sankarin polku ja tahtipaalut: tempo näkyy paalujen välistyksenä.
  function drawPath(t, camX, camY, shake) {
    const k = ctx.black;
    const y = PATH_Y * H - camY + shake * 0.6;
    const xa = Math.max(-10, t0 * SPEED - camX);
    const xb = t * SPEED - camX;
    if (xb <= xa) return;
    k.save();
    k.fillStyle = '#000';
    k.fillRect(xa, y, xb - xa, 2);
    for (let i = 0; i < barT.length; i++) {
      const tb = barT[i];
      if (tb > t) break;
      const x = tb * SPEED - camX;
      if (x < -20 || x > W + 20) continue;
      const a = clamp((t - tb) / 0.15) * presence(tb);
      if (a <= 0) continue;
      const hgt = (8 + 30 * loud(tb)) * (i % 4 === 0 ? 1.45 : 1);
      k.globalAlpha = a;
      k.fillRect(x - 1.2, y - hgt, 2.4, hgt);
      if (i % 4 === 0) { // joka neljäs tahti: pieni viiri
        k.beginPath();
        k.moveTo(x + 1.2, y - hgt);
        k.lineTo(x + 12, y - hgt + 4);
        k.lineTo(x + 1.2, y - hgt + 8);
        k.fill();
      }
    }
    k.restore();
  }

  // --- Viulut: taivaan viivoitettu kaista, kaari melodiasta -------------------
  function drawViolins(t, camX, camY) {
    const visA = Math.max(t0, (camX - 40) / SPEED);
    const visB = Math.min(t, (camX + W + 40) / SPEED);
    if (visB <= visA) return;
    const lines = 7;
    tctx.clearRect(0, 0, W, H);
    tctx.strokeStyle = '#000';
    tctx.lineCap = 'round';
    for (let j = 0; j < lines; j++) {
      tctx.lineWidth = j === 0 ? 2.6 : 1.5;
      tctx.beginPath();
      let first = true;
      for (let tau = visA; tau <= visB + 1e-6; tau += 1 / FPS) {
        const live = 1 - smoothstep(0, 2.0, t - tau);
        const th = 6 + 46 * sky(tau);
        const trem = live * 1.8 * clamp(flux(tau) * sky(tau) * 2) * Math.sin(tau * 37 + j * 2.1 + t * 40);
        const y = skyY(tau) - camY * 0.6 + (j / (lines - 1)) * th + trem;
        const x = tau * SPEED - camX;
        if (first) tctx.moveTo(x, y);
        else tctx.lineTo(x, y);
        first = false;
      }
      tctx.stroke();
    }
    columnMask((x) => {
      const tau = p1(x, camX);
      return smoothstep(0.12, 0.35, sky(tau)) * (0.5 + 0.5 * leadW[1](tau)) * edgeAt(tau, t, x + camX) * presence(tau);
    });
    ctx.blue[2].drawImage(tmp, 0, 0);
  }

  // --- Sankari: taso horisontissa, muoto jakson luonteen mukaan ----------------
  function heroTop(tau) {
    const s = segAt(tau);
    const tr = s ? s.trait : 'perus';
    let y = tr === 'suora' ? heroYStraight(tau) : heroY(tau);
    if (tr === 'portaat') { // pyrkimys: porras portaalta, lyhyt nousu askelmien välissä
      const q = y / 26;
      y = (Math.floor(q) + smoothstep(0.4, 0.6, q - Math.floor(q))) * 26;
    }
    return y + 0.06 * H * adv(tau);
  }
  const heroInk = (tau) => smoothstep(0.12, 0.38, hero(tau)) * (0.55 + 0.45 * leadW[0](tau)) * presence(tau) * (1 - 0.4 * adv(tau) * (1 - clamp(S.brass(tau))));
  const heroDark = (tau) => adv(tau) * 0.42 * (1 - clamp(S.brass(tau)));

  function drawPlane(tauS, tauE, t, camX, camY, opt) {
    const visA = Math.max(tauS, (camX - 120) / SPEED);
    const visB = Math.min(tauE, (camX + W + 120) / SPEED);
    if (visB <= visA) return;
    const lanceX = FX - camX + fig.lanceTop[0];
    const lanceY = GY - camY + fig.lanceTop[1];
    // Huipulla taso palaa selkäkuvan keihään kärkeen: viiri lähti keihäästä ja palaa siihen.
    const summitY = H * 0.53 - camY + 9 + fig.lanceTop[1];
    const pts = [];
    for (let tau = visA; ; tau += 0.5 / FPS) {
      const tt = Math.min(tau, visB);
      const sum = opt.lance ? smoothstep(T_DOM7 - 3.2, T_DOM7 - 0.1, tt) : 0;
      const live = opt.live ? (1 - smoothstep(0, 1.8, t - tt)) * (1 - sum) : 0;
      const s = opt.lance ? smoothstep(0, 0.7, tt - t0) : 1;
      const fade = opt.fadeIn ? smoothstep(0, 1.5, tt - tauS) : 1;
      let y = heroTop(tt) - camY + live * (4 + 8 * flux(t)) * Math.sin((Math.PI * barPos(tt)) / 2 - t * 2.0);
      let th = (8 + 70 * loud(tt)) * (0.45 + 0.55 * hero(tt)) * (1 - 0.35 * adv(tt)) * fade;
      if (opt.lance) {
        y = mix(mix(lanceY, y, s), summitY, sum);
        th = mix(mix(4, th, s), 5, sum);
      }
      pts.push([tt * SPEED - camX, y, th, tt]);
      if (tt >= visB) break;
    }
    if (pts.length < 2) return;
    const head = pts[pts.length - 1];
    const showHead = visB >= tauE - 1e-6;
    const tail = opt.live ? 4 * Math.sin(t * 9.0) : 0;
    const atLance = opt.lance && visA <= t0 + 1e-6;
    // Yläreuna: palon liekit (jakson luonne). Kielekkeet kallistuvat taaksepäin ja lepattavat
    // painokohdan lähellä; korkeus vaihtelee kielekkeittäin.
    const topEdge = pts.map(([x, y, th, tau]) => {
      const s = segAt(tau);
      if (!s || s.trait !== 'liekit') return [x, y];
      // kaksi eri jaksoista kielekesarjaa: epäsäännöllinen rytmi
      const live = 1 - smoothstep(0, 1.5, t - tau);
      let lift = 0, lean = 0;
      for (const [P, w, sd] of [[31, 1, 3], [47, 0.75, 11]]) {
        const u = (x + camX) / P;
        const cell = Math.floor(u);
        const phs = u - cell;
        const shape = Math.pow(phs < 0.35 ? phs / 0.35 : (1 - phs) / 0.65, 1.7);
        const hgt = w * (8 + 34 * loud(tau)) * (0.35 + 0.65 * hash1(cell * 7 + sd)) * (1 + 0.3 * live * Math.sin(t * 19 + cell * 2.3 + sd));
        if (hgt * shape > lift) { lift = hgt * shape; lean = 6 * shape * live; }
      }
      return [x - lean, y - lift];
    });

    const plane = new Path2D();
    plane.moveTo(atLance ? lanceX : topEdge[0][0], atLance ? lanceY : topEdge[0][1]);
    for (const [x, y] of topEdge) plane.lineTo(x, y);
    if (showHead) {
      plane.lineTo(head[0] + 36, head[1] - 3 + tail);
      plane.lineTo(head[0] + 13, head[1] + head[2] * 0.5);
      plane.lineTo(head[0] + 32, head[1] + head[2] + 3 - tail);
    }
    for (let i = pts.length - 1; i >= 0; i--) plane.lineTo(pts[i][0], pts[i][1] + pts[i][2]);
    if (atLance) plane.lineTo(lanceX, lanceY + 3);
    plane.closePath();
    const fringe = new Path2D(); // vasket: hapsut
    for (let i = 0; i < pts.length; i += 6) {
      const [x, y, th, tau] = pts[i];
      const len = 22 * clamp(S.brass(tau)) * (1 - 0.4 * adv(tau));
      if (len < 2) continue;
      fringe.moveTo(x - 5, y + th - 1);
      fringe.lineTo(x + 5, y + th - 1);
      fringe.lineTo(x, y + th + len);
      fringe.closePath();
    }
    tctx.clearRect(0, 0, W, H);
    tctx.fillStyle = '#000';
    tctx.fill(plane);
    tctx.fill(fringe);
    columnMask((x) => heroInk(p1(x, camX)));
    ctx.red.drawImage(tmp, 0, 0);
    if (adv(visB) > 0) {
      tctx.clearRect(0, 0, W, H);
      tctx.fill(plane);
      columnMask((x) => heroDark(p1(x, camX)) * smoothstep(0.12, 0.38, hero(p1(x, camX))));
      ctx.black.drawImage(tmp, 0, 0);
    }
    // Kaiverrettu ääriviiva ja viivoitettu varjo, maskattuna samoin kuin taso.
    tctx.clearRect(0, 0, W, H);
    tctx.strokeStyle = '#000';
    tctx.lineWidth = 1.8;
    const top = new Path2D();
    top.moveTo(atLance ? lanceX : topEdge[0][0], atLance ? lanceY : topEdge[0][1]);
    for (const [x, y] of topEdge) top.lineTo(x, y);
    if (showHead) top.lineTo(head[0] + 36, head[1] - 3 + tail);
    tctx.stroke(top);
    const shade = new Path2D();
    shade.moveTo(pts[0][0], pts[0][1] + pts[0][2]);
    for (const [x, y, th] of pts) shade.lineTo(x, y + th);
    if (showHead) shade.lineTo(head[0] + 32, head[1] + head[2] + 3 - tail);
    for (let i = pts.length - 1; i >= 0; i--) shade.lineTo(pts[i][0], pts[i][1] + pts[i][2] * 0.58);
    shade.closePath();
    tctx.fillStyle = hatchPattern;
    tctx.fill(shade);
    // Mielikuvitus: jugend-kiehkurat yläreunaan.
    tctx.lineWidth = 2;
    for (let i = 0; i < pts.length; i++) {
      const [x, , , tau] = pts[i];
      const s = segAt(tau);
      if (!s || s.trait !== 'kiehkurat' || Math.floor((x + camX) / 130) === Math.floor((x + camX - SPEED / FPS / 2) / 130)) continue;
      const [cx, cy] = topEdge[i];
      const r0 = 10 + 10 * hash1(Math.floor((x + camX) / 130));
      tctx.beginPath();
      for (let a = 0; a < Math.PI * 3.2; a += 0.2) {
        const r = r0 * (1 - a / (Math.PI * 3.6));
        const px = cx + Math.cos(a + Math.PI) * r;
        const py = cy - r0 + Math.sin(a + Math.PI) * r;
        if (a === 0) tctx.moveTo(px, py); else tctx.lineTo(px, py);
      }
      tctx.stroke();
    }
    columnMask((x) => smoothstep(0.12, 0.38, hero(p1(x, camX))) * presence(p1(x, camX)));
    ctx.black.drawImage(tmp, 0, 0);
  }

  function drawFigure(c, x, y, alpha) {
    c.save();
    c.globalAlpha = alpha;
    c.fillStyle = '#000';
    c.strokeStyle = '#000';
    c.translate(x, y);
    c.fill(fig.body);
    c.fill(fig.tip);
    c.lineWidth = 2.4;
    c.lineCap = 'round';
    c.stroke(fig.lance);
    c.restore();
  }

  function drawHero(t, camX, camY) {
    const k = ctx.black;
    hatchPattern.setTransform(new DOMMatrix().translateSelf(-(camX % 7), -(camY % 7)));
    const a1 = clamp((t - FX / SPEED) / 0.25);
    if (a1 > 0 && FX - camX > -200 && FX - camX < W + 200) { // selkäkuva laaksossa
      k.save();
      k.globalAlpha = a1;
      k.fillStyle = hatchPattern;
      k.translate(FX - camX, GY - camY);
      k.fill(fig.rock);
      k.restore();
      drawFigure(k, FX - camX, GY - camY, a1);
    }
    drawPlane(t0, Math.min(t, T_DOM7 - 0.1), t, camX, camY, { lance: true, live: t < T_DOM7 - 0.1 });
    if (t > T_WID + 0.25) drawPlane(T_WID + 0.25, t, t, camX, camY, { live: true, fadeIn: true });

    // Huipennuksen iskut: puupiirroksen tähdet (ennakoivat sädekehää).
    for (const e of hammer) {
      const x = e.t * SPEED - camX;
      if (e.t > t || x < -120 || x > W + 120) continue;
      const a = smoothstep(e.t, e.t + 0.1, t);
      const y = heroTop(e.t) - camY - 90;
      k.save();
      k.globalAlpha = a;
      k.strokeStyle = '#000';
      k.lineWidth = 3.2;
      k.lineCap = 'round';
      k.beginPath();
      for (let j = 0; j < 20; j++) {
        const ang = (j / 20) * Math.PI * 2 + hash1(Math.round(e.t * 100) + j) * 0.2;
        const r1 = 34 + 34 * hash1(Math.round(e.t * 100) + 40 + j);
        k.moveTo(x + Math.cos(ang) * 12, y + Math.sin(ang) * 12);
        k.lineTo(x + Math.cos(ang) * r1, y + Math.sin(ang) * r1);
      }
      k.stroke();
      k.restore();
      const r = ctx.red;
      r.save();
      r.globalAlpha = a;
      r.fillStyle = '#000';
      r.beginPath();
      r.arc(x, y, 10, 0, Math.PI * 2);
      r.fill();
      r.restore();
    }

    // Dominanttiseptimi: huippu, selkäkuva ja sädekehä (säteet taajuuskaistoista).
    const xs = XS - camX;
    if (xs > -1100 && xs < W + 1100) {
      const ground = ridgeAt(LAYERS[2], XS) - camY;
      const top = H * 0.53 - camY;
      const ps = clamp((t - XS / SPEED) / 0.2);
      const g = smoothstep(T_DOM7 - 0.02, T_DOM7 + 0.22, t);
      if (g > 0) {
        const i = fi(T_DOM7 + 0.05);
        const bands = ['sub', 'matala', 'matala_keski', 'keski', 'korkea_keski', 'korkea'].map((b2) => ch[`band_${b2}`][i]);
        const cy = top - 86;
        const r = ctx.red;
        r.save();
        r.fillStyle = '#000';
        k.save();
        k.strokeStyle = '#000';
        k.lineWidth = 1.4;
        k.beginPath();
        for (let j = 0; j < 72; j++) {
          const th = (j / 72) * Math.PI * 2 + (hash1(500 + j) - 0.5) * 0.03;
          if (Math.cos(th) < -0.12) continue;
          const up = Math.abs(Math.cos(th / 2));
          const band = bands[clamp(Math.floor(up * 5.99), 0, 5)];
          const L = (200 + 600 * (0.35 + 0.65 * band) * (0.75 + 0.5 * hash1(560 + j))) * g;
          const w = 0.016;
          r.beginPath();
          r.moveTo(xs + Math.sin(th - w) * 44, cy - Math.cos(th - w) * 44);
          r.lineTo(xs + Math.sin(th - w * 0.4) * L, cy - Math.cos(th - w * 0.4) * L);
          r.lineTo(xs + Math.sin(th + w * 0.4) * L, cy - Math.cos(th + w * 0.4) * L);
          r.lineTo(xs + Math.sin(th + w) * 44, cy - Math.cos(th + w) * 44);
          r.fill();
          if (j % 3 === 1) {
            k.moveTo(xs + Math.sin(th) * 48, cy - Math.cos(th) * 48);
            k.lineTo(xs + Math.sin(th) * L * 1.08, cy - Math.cos(th) * L * 1.08);
          }
        }
        k.stroke();
        k.restore();
        r.lineWidth = 5;
        r.strokeStyle = '#000';
        r.beginPath();
        r.arc(xs, cy, 46, 0, Math.PI * 2);
        r.stroke();
        r.restore();
      }
      if (ps > 0) {
        tctx.clearRect(0, 0, W, H);
        tctx.save();
        tctx.fillStyle = '#000';
        tctx.translate(xs, ground);
        tctx.fill(spirePath(ground - top));
        tctx.restore();
        tctx.globalCompositeOperation = 'destination-in';
        const fogG = tctx.createLinearGradient(0, ground - 40, 0, ground + 50);
        fogG.addColorStop(0, `rgba(0,0,0,${ps})`);
        fogG.addColorStop(1, 'rgba(0,0,0,0)');
        tctx.fillStyle = fogG;
        tctx.fillRect(0, 0, W, H);
        tctx.globalCompositeOperation = 'source-over';
        k.drawImage(tmp, 0, 0);
        drawFigure(k, xs, top + 9, ps);
      }
    }
  }

  // --- Lyömäsoittimet: puupiirrosleimat maahan, lautasisku kylmänä välähdyksenä --
  function drawPercussion(t, camX, camY) {
    const k = ctx.black;
    for (const h of percHits) {
      if (h.tau > t) break;
      const x = h.tau * SPEED - camX;
      if (x < -60 || x > W + 60) continue;
      const a = smoothstep(h.tau, h.tau + 0.08, t);
      const y = PATH_Y * H - camY - 4;
      k.save();
      k.globalAlpha = a;
      k.fillStyle = '#000';
      k.beginPath(); // leima: kahdeksansakarainen tähti polun päälle
      for (let j = 0; j < 16; j++) {
        const r = (j % 2 ? 5 : 15) * (0.7 + 0.6 * h.s);
        const ang = (j / 16) * Math.PI * 2;
        if (j === 0) k.moveTo(x + Math.cos(ang) * r, y + Math.sin(ang) * r);
        else k.lineTo(x + Math.cos(ang) * r, y + Math.sin(ang) * r);
      }
      k.closePath();
      k.fill();
      k.restore();
    }
    // Lautasisku: säteet pyyhkivät hetkeksi sinisen taivaan paperiksi (ei pysyvä).
    for (const h of cymbalHits) {
      const a = t - h.tau;
      if (a < 0 || a > 0.45) continue;
      const fade = Math.exp(-a / 0.15);
      const cx = h.tau * SPEED - camX;
      const cy = H * 0.2 - camY * 0.55;
      for (const b of [ctx.blue[0], ctx.blue[2]]) {
        b.save();
        b.globalCompositeOperation = 'destination-out';
        b.globalAlpha = fade;
        b.strokeStyle = '#000';
        b.lineWidth = 3;
        b.beginPath();
        for (let j = 0; j < 18; j++) {
          const ang = (j / 18) * Math.PI * 2;
          const r = 60 + 220 * hash1(Math.round(h.tau * 10) * 31 + j);
          b.moveTo(cx + Math.cos(ang) * 20, cy + Math.sin(ang) * 20);
          b.lineTo(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r);
        }
        b.stroke();
        b.restore();
      }
    }
  }

  // --- Vastustajat: yhdeksän tyyppiä, venytys ja litistys -----------------------
  function blob(c, x, y, rx, ry, seed) {
    c.beginPath();
    for (let v = 0; v <= 10; v++) {
      const a = (v / 10) * Math.PI * 2;
      const rr = 0.78 + 0.44 * hash1(seed + v);
      const px = x + Math.cos(a) * rx * rr;
      const py = y + Math.sin(a) * ry * rr;
      if (v === 0) c.moveTo(px, py); else c.lineTo(px, py);
    }
    c.closePath();
    c.fill();
  }
  function drawCritics(t, camX, camY) {
    const k = ctx.black;
    for (const c of critics) {
      if (c.tau > t) break;
      const x0 = c.tau * SPEED - camX;
      if (x0 < -160 || x0 > W + 160) continue;
      const age = t - c.tau;
      // Venytys ja litistys: ponnahdus esiin ja värähtelevä asettuminen.
      const sq = 1 + 0.55 * Math.exp(-age * 7) * Math.sin(age * 26);
      const g = smoothstep(0, 0.08, age);
      const s = c.size * g;
      const x = x0;
      const y = c.y - camY;
      k.globalAlpha = g;
      if (c.j === 0) { // fraasin alku jättää heikon sameuden
        const hr = 34 + 20 * hash1(c.seed);
        const haze = k.createRadialGradient(x, y, 0, x, y, hr);
        haze.addColorStop(0, 'rgba(0,0,0,0.06)');
        haze.addColorStop(1, 'rgba(0,0,0,0)');
        k.fillStyle = haze;
        k.fillRect(x - hr, y - hr, 2 * hr, 2 * hr);
      }
      k.fillStyle = '#000';
      switch (c.type) {
        case 'neula': { // 1 huilu: terävät piikit taivaalla
          const m = 3 + Math.floor(4 * hash1(c.seed + 1));
          for (let j = 0; j < m; j++) {
            const a = hash1(c.seed + 10 + j) * Math.PI * 2;
            const L = (10 + 14 * hash1(c.seed + 20 + j)) * s * sq;
            k.beginPath();
            k.moveTo(x + Math.cos(a + 1.57) * 1.4, y + Math.sin(a + 1.57) * 1.4);
            k.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L);
            k.lineTo(x - Math.cos(a + 1.57) * 1.4, y - Math.sin(a + 1.57) * 1.4);
            k.fill();
          }
          break;
        }
        case 'rykelma': // 2 oboe: mutiseva rykelmä, joka paisuu fraasin edetessä
        case 'vapisevat': { // 6 kiihtynyt oboe: värisevät pisteet
          const swell = c.type === 'rykelma' ? 1 + 0.06 * Math.min(c.j, 5) : 1;
          const m = 5 + Math.floor(7 * hash1(c.seed + 1));
          for (let j = 0; j < m; j++) {
            const a = hash1(c.seed + 10 + j) * Math.PI * 2;
            const d = 15 * s * hash1(c.seed + 20 + j) * swell;
            const jit = c.type === 'vapisevat' ? 3 * Math.sin(t * 50 + j * 3) * Math.exp(-age * 1.5) : 0;
            const r = (1.8 + 3 * hash1(c.seed + 30 + j)) * s * swell;
            k.beginPath();
            k.ellipse(x + Math.cos(a) * d + jit, y + Math.sin(a) * d, r * sq, r / sq, 0, 0, Math.PI * 2);
            k.fill();
          }
          break;
        }
        case 'roiske': { // 3 lautaset: yksi roiske
          blob(k, x, y, 9 * g * sq, 9 * g / sq, c.seed);
          for (let j = 0; j < 16; j++) {
            const a = hash1(c.seed + 10 + j) * Math.PI * 2;
            const d = (18 + 50 * hash1(c.seed + 20 + j)) * g;
            k.beginPath();
            k.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 1 + 2.4 * hash1(c.seed + 30 + j), 0, Math.PI * 2);
            k.fill();
          }
          break;
        }
        case 'portaat': // 4 englannintorvi: kromaattinen nousu, pisteiden portaat
          k.beginPath();
          k.ellipse(x, y, 6 * s * sq, 6 * s / sq, 0, 0, Math.PI * 2);
          k.fill();
          k.fillRect(x - 10, y + 6, 20, 2.5);
          break;
        case 'dehring': // 5 kaksi tuubaa kvintteinä: kaksoset, aina rinnakkain
          blob(k, x, y, 13 * g * sq, 13 * g / sq, c.seed);
          blob(k, x + 4, y - 72, 13 * g * sq, 13 * g / sq, c.seed);
          break;
        case 'karikatyyri': { // 7 englannintorvi vääristää sankariteeman: sankarin kaari pisteinä
          for (let j = 0; j < 9; j++) {
            const tauH = t0 + (c.j * 9 + j) * 0.35;
            const px = x + j * 9;
            const py = y + (heroY(tauH) - H * 0.5) * 0.45;
            k.beginPath();
            k.arc(px, py, (2 + 2.5 * hash1(c.seed + j)) * g, 0, Math.PI * 2);
            k.fill();
          }
          break;
        }
        case 'fagotit': { // 8 kaksi fagottia: hyppivät täplät
          const hop = Math.abs(Math.sin(age * 9)) * 22 * Math.exp(-age * 2.2);
          blob(k, x, y - hop, 9 * g * sq, 9 * g / sq, c.seed);
          blob(k, x + 22, y - hop * 0.6 + 4, 8 * g * sq, 8 * g / sq, c.seed + 40);
          break;
        }
        case 'pasuunat': { // 9 kolme sordinoitua pasuunaa: leimasimen isku
          for (let j = 0; j < 3; j++) blob(k, x + j * 16, y + (j - 1) * 6, 7 * g * sq, 12 * g / sq, c.seed + j * 20);
          break;
        }
        default:
          blob(k, x, y, 7 * s, 7 * s, c.seed);
      }
    }
    k.globalAlpha = 1;
  }

  // --- Jugend-kehys suurimmissa siirtymissä --------------------------------------
  function drawColumns(t, camX, camY) {
    const k = ctx.black;
    k.save();
    k.strokeStyle = '#000';
    k.fillStyle = '#000';
    k.lineCap = 'round';
    for (const tau of columns) {
      const x = tau * SPEED - camX;
      if (x < -60 || x > W + 60 || tau > t) continue;
      const a = clamp((t - tau) / 0.3);
      k.globalAlpha = a;
      const yt = H * 0.1 - camY * 0.3;
      const yb = H * 0.95 - camY * 0.3;
      k.lineWidth = 1.7;
      k.beginPath(); // varsi: kaksi rinnakkaista viivaa ja jalusta
      k.moveTo(x - 5, yt);
      k.lineTo(x - 5, yb);
      k.moveTo(x + 5, yt);
      k.lineTo(x + 5, yb);
      k.moveTo(x - 18, yb);
      k.lineTo(x + 18, yb);
      k.moveTo(x - 12, yb - 5);
      k.lineTo(x + 12, yb - 5);
      k.stroke();
      // Voluutit: kierre lähtee varresta ulospäin ja kiertyy sisään (ylhäällä ylös, alhaalla alas).
      for (const [yy, vdir, R] of [[yt, 1, 17], [yb - 5, -1, 11]]) {
        for (const side of [-1, 1]) {
          const cx = x + side * (5 + R);
          k.beginPath();
          for (let u = 0; u <= 1.0001; u += 0.025) {
            const th = Math.PI + u * 2.6 * Math.PI;
            const r = R * (1 - 0.75 * u);
            const px = cx + side * Math.cos(th) * r;
            const py = yy + vdir * Math.sin(th) * r;
            if (u === 0) k.moveTo(px, py); else k.lineTo(px, py);
          }
          k.stroke();
        }
      }
      // Lehti varren yläpäässä: piiskaviivan kärki ylöspäin.
      k.beginPath();
      k.moveTo(x, yt);
      k.quadraticCurveTo(x - 9, yt - 18, x + 2, yt - 40);
      k.quadraticCurveTo(x + 9, yt - 18, x, yt);
      k.fill();
    }
    k.restore();
  }

  // --- Lyijykynäluonnos tulevasta -------------------------------------------
  function drawSketch(t, camX, camY) {
    const headX = t * SPEED - camX;
    tctx.clearRect(0, 0, W, H);
    tctx.strokeStyle = '#000';
    tctx.lineJoin = 'round';
    tctx.lineWidth = 1.3;
    for (const L of LAYERS.slice(1)) {
      const oy = -L.p * camY;
      tctx.beginPath();
      for (let x = Math.max(-10, headX - 60), first = true; x <= W + 10; x += 5, first = false) {
        const X = x + L.p * camX;
        const y = ridgeAt(L, X) + oy + (vnoise1(X / 11, 70) - 0.5) * 2.4;
        if (first) tctx.moveTo(x, y); else tctx.lineTo(x, y);
      }
      tctx.stroke();
    }
    tctx.lineWidth = 1.1;
    if (t < FX / SPEED + 0.25) {
      tctx.save();
      tctx.translate(FX - camX, GY - camY);
      for (const p of [fig.rockTop, fig.body, fig.lance, fig.tip]) tctx.stroke(p);
      tctx.restore();
    }
    if (t < T_DOM7 && XS - camX < W + 900) {
      const x = XS - camX;
      const ground = ridgeAt(LAYERS[2], XS) - camY;
      const top = H * 0.53 - camY;
      tctx.save();
      tctx.translate(x, ground);
      tctx.stroke(spirePath(ground - top));
      tctx.restore();
      tctx.save();
      tctx.translate(x, top + 9);
      for (const p of [fig.body, fig.lance]) tctx.stroke(p);
      tctx.restore();
      tctx.beginPath();
      for (let r = 0; r < 24; r++) {
        const a = (r / 24) * Math.PI * 2;
        tctx.moveTo(x + Math.sin(a) * 60, top - 86 - Math.cos(a) * 60);
        tctx.lineTo(x + Math.sin(a) * (220 + 160 * hash1(300 + r)), top - 86 - Math.cos(a) * (220 + 160 * hash1(300 + r)));
      }
      tctx.stroke();
    }
    tctx.globalCompositeOperation = 'destination-in';
    const g = tctx.createLinearGradient(headX - 50, 0, headX + 70, 0);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.5)');
    tctx.fillStyle = g;
    tctx.fillRect(0, 0, W, H);
    tctx.globalCompositeOperation = 'source-over';
    ctx.sketch.drawImage(tmp, 0, 0);
    if (t < T_NEEDLE + 0.2) {
      const s = ctx.sketch;
      s.save();
      s.globalAlpha = 0.45 * smoothstep(0.4, 1.4, t) * (1 - smoothstep(T_NEEDLE, T_NEEDLE + 0.2, t));
      s.strokeStyle = '#000';
      s.lineWidth = 1;
      s.textAlign = 'center';
      s.font = '700 96px Georgia';
      s.letterSpacing = '16px';
      s.strokeText('EIN HELDENLEBEN', TITLE_X - camX, H * 0.3 - camY);
      s.restore();
    }
  }

  // --- Otsikko, jaksojen otsikot ja loppumerkki (kohopaino) --------------------
  function drawText(t, camX, camY) {
    const k = ctx.black;
    const r = ctx.red;
    const a = clamp((t - T_NEEDLE) / 0.12);
    const cx = TITLE_X - camX;
    if (a > 0 && cx > -700 && cx < W + 700) {
      const cy = H * 0.3 - camY;
      for (const c of [k, r]) {
        c.save();
        c.globalAlpha = a;
        c.fillStyle = '#000';
        c.textAlign = 'center';
      }
      k.font = '500 30px Georgia';
      k.letterSpacing = '12px';
      k.fillText('RICHARD STRAUSS', cx, cy - 92);
      r.font = '700 96px Georgia';
      r.letterSpacing = '16px';
      r.fillText('EIN HELDENLEBEN', cx, cy);
      k.fillRect(cx - 390, cy + 26, 780, 2.5);
      k.fillRect(cx - 390, cy + 32, 780, 1);
      k.font = 'italic 30px Georgia';
      k.letterSpacing = '2px';
      k.fillText('op. 40', cx, cy + 78);
      k.font = 'italic 24px Georgia';
      k.fillText('Wiener Philharmoniker · Clemens Krauss', cx, cy + 120);
      k.restore();
      r.restore();
    }
    for (const [X, label] of [[t0 * SPEED + 260, 'I · DER HELD'], [T_WID * SPEED + 140, 'II · DES HELDEN WIDERSACHER']]) {
      const x = X - camX;
      const b = clamp((t - X / SPEED) / 0.2);
      if (b <= 0 || x < -600 || x > W + 100) continue;
      k.save();
      k.globalAlpha = b;
      k.fillStyle = '#000';
      k.textAlign = 'left';
      k.font = '600 28px Georgia';
      k.letterSpacing = '8px';
      k.fillText(label, x, H * 0.05 - camY * 0.3);
      k.restore();
    }
    // Loppumerkki: kirjapainon koriste painokohtaan, kun ääni häivytetään.
    const TF = T_END - 2.8;
    const xf = TF * SPEED - camX + 40;
    const f = clamp((t - TF) / 0.25);
    if (f > 0) {
      r.save();
      r.globalAlpha = f;
      r.fillStyle = '#000';
      r.textAlign = 'center';
      r.font = '150px "Segoe UI Symbol", Georgia, serif';
      r.fillText('❦', xf, H * 0.45 - camY);
      r.restore();
    }
  }

  function drawDust(t, camX, camY) {
    const d = ctx.dust;
    d.fillStyle = '#000';
    for (let i = 0; i < clicks.length; i++) {
      const [tc, s] = clicks[i];
      if (tc > t) break;
      const a = s >= 0.55 ? 0.85 : 1 - (t - tc) / 0.2;
      if (a <= 0) continue;
      const X = hash1(i * 3 + 1) * W + (tc * SPEED - NOW_X);
      const Y = hash1(i * 3 + 2) * H + camYAt(tc);
      const x = X - camX;
      if (x < -5 || x > W + 5) continue;
      d.globalAlpha = a;
      d.beginPath();
      d.arc(x, Y - camY, 0.7 + 2.1 * s, 0, Math.PI * 2);
      d.fill();
    }
    d.globalAlpha = 1;
  }

  // Vastustajien sameus taivaalla (mustan ja punaisen rasteri).
  function drawMurk(t, camX, camY) {
    if ((camX + W) / SPEED < T_WID - 1) return;
    for (const [plate, alpha] of [[ctx.black, 0.15], [ctx.red, 0.08]]) {
      tctx.clearRect(0, 0, W, H);
      const g = tctx.createLinearGradient(0, -camY, 0, H * 0.62 - camY);
      g.addColorStop(0, `rgba(0,0,0,${alpha})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      tctx.fillStyle = g;
      tctx.fillRect(0, 0, W, H);
      columnMask((x) => {
        const tau = p1(x, camX);
        return adv(tau) * edgeAt(tau, t, x + camX) * presence(tau) * (0.2 + 0.8 * clamp(windsSlow(tau) * 1.6));
      }, true, 51);
      plate.drawImage(tmp, 0, 0);
    }
  }

  // Suon kuolleet puut.
  function drawTrees(t, camX, camY) {
    const k = ctx.black;
    k.strokeStyle = '#000';
    k.lineCap = 'round';
    let X = (T_WID + 1.5) * SPEED;
    for (let j = 0; X < camX + W + 200; j++) {
      const step = 110 + 160 * hash1(9000 + j);
      if (X > camX - 200) {
        const tau = X / SPEED;
        const a = clamp((t - tau) / 0.3) * smoothstep(T_WID + 1, T_WID + 5, tau) * presence(tau);
        if (a > 0) {
          const x = X - camX;
          const y = PATH_Y * H - camY - 2;
          const h = 50 + 110 * hash1(9200 + j);
          const lean = (hash1(9300 + j) - 0.5) * 18;
          k.globalAlpha = a;
          k.lineWidth = 2.4 + 1.2 * hash1(9400 + j);
          k.beginPath();
          k.moveTo(x, y);
          k.quadraticCurveTo(x + lean * 0.3, y - h * 0.5, x + lean, y - h);
          const nb = 2 + Math.floor(3 * hash1(9500 + j));
          for (let b2 = 0; b2 < nb; b2++) {
            const u = 0.35 + 0.5 * hash1(9600 + j * 7 + b2);
            const bx = x + lean * u;
            const by = y - h * u;
            const dir = b2 % 2 ? 1 : -1;
            const len = h * (0.22 + 0.25 * hash1(9700 + j * 7 + b2));
            k.moveTo(bx, by);
            k.lineTo(bx + dir * len * 0.8, by - len * 0.6);
          }
          k.stroke();
        }
      }
      X += step;
    }
    k.globalAlpha = 1;
  }

  function drawAt(t, camX, camY) {
    for (const c of [...ctx.blue, ctx.red, ctx.black, ctx.sketch, ctx.dust]) {
      c.clearRect(0, 0, W, H);
      c.globalAlpha = 1;
      c.globalCompositeOperation = 'source-over';
    }
    const shake = shakeAt(t);
    drawWorld(t, camX, camY, shake);
    drawViolins(t, camX, camY);
    drawMurk(t, camX, camY);
    drawTrees(t, camX, camY);
    drawPath(t, camX, camY, shake);
    drawColumns(t, camX, camY);
    drawSketch(t, camX, camY);
    drawText(t, camX, camY);
    drawHero(t, camX, camY);
    drawPercussion(t, camX, camY);
    drawCritics(t, camX, camY);
    drawDust(t, camX, camY);
    const ten = new Float32Array(65);
    for (let k = 0; k <= 64; k++) {
      const tau = ((k * W) / 64 + camX) / SPEED;
      ten[k] = tau <= t && tau >= t0 ? tension(tau) * smoothstep(t0, t0 + 1, tau) : 0;
    }
    return { camX, camY, ten, parallax: LAYERS.map((L) => L.p) };
  }

  function draw(tVideo) {
    const t = tVideo + LEAD;
    return drawAt(t, t * SPEED - NOW_X, camYAt(t));
  }

  function debugInfo(tVideo) {
    const t = tVideo + LEAD;
    const s = segAt(t);
    const names = ['sankari (käyrätorvet+sellot)', 'taivas (viulut)', 'maa (bassot)'];
    return {
      t: t.toFixed(2), jakso: s ? `${s.k + 1}: ${s.trait}` : 'neula', paaaani: t < t0 ? '–' : names[lead(t)],
      sankari: hero(t).toFixed(2), viulut: sky(t).toFixed(2), bassot: earth(t).toFixed(2),
      vasket: clamp(S.brass(t)).toFixed(2), puupuhaltimet: clamp(S.winds(t)).toFixed(2),
      lyomasoittimet: clamp(S.perc(t)).toFixed(2), harppu: clamp(S.harp(t)).toFixed(2), tutti: clamp(S.tutti(t)).toFixed(2),
      tahti: barPos(t).toFixed(2), voimakkuus: loud(t).toFixed(2), jannite: tension(t).toFixed(2),
    };
  }

  return { plates, draw, drawAt, camYAt, debugInfo, T_DOM7, T_WID };
}
