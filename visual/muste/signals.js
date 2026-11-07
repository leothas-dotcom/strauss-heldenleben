// Musiikkidata -> näyttämön signaalit. Kaikki lasketaan latauksessa koko aikajanalle, joten
// ajonaikainen haku on puhdas funktio ajasta (ei tilaa ruutujen välillä).
//
//   ryhmät:     soitinperheet suhteessa omaan 95. persentiiliinsä (PANNs), tehollinen tutti
//   läsnäolo:   hystereesi + ennakoiva sisääntulo (tanssija on paikallaan, kun soitin alkaa)
//   tahtiaika:  jatkuva tahti- ja iskuluku tahtiruudukosta (beats.json)
//   vastustajat: puupuhaltimien fraasit (attakit alle 0,9 s välein), Porterin järjestys

import { clamp, smoothstep, gaussian, sampler, hash1 } from '../util.js';

export const FPS = 30;

function percentile(arr, q, from = 0) {
  const v = Array.from(arr.subarray(from)).sort((a, b) => a - b);
  return v[Math.floor(q * (v.length - 1))] || 1e-6;
}

export function createSignals({ meta, channels: ch, listen, beats, events, cues, patina, segments, aksentit }) {
  const n = meta.frames;
  const T0 = meta.music_start - meta.start;
  const i0 = Math.round(T0 * FPS);
  const lch = listen.channels;
  const cue = (id) => cues.cues.find((c) => c.id === id);
  const sec = (id) => cues.sections.find((s) => s.id === id);
  // Teemakartan ankkuri (kuvakäsikirjoituksen tunniste): A-puolen aika paketin ajassa.
  // Puuttuva ankkuri on virhe: kuva ei saa arvata aikaa.
  const A = (id) => {
    const c = cues.cues.find((x) => x.teema === id) || cue(id);
    if (!c || c.side !== meta.side) throw new Error(`ankkuri puuttuu teemakartasta: ${id}`);
    return { t: c.t - meta.start, t1: (c.t_end ?? c.t) - meta.start, z: c.z ?? null };
  };
  // Iskuanalyysi (aksentit.py): iskut 10 ms tarkkuudella ja patarummun lyönnit.
  if (!aksentit?.aksentit) throw new Error('aksentit.json puuttuu (aja analysis/aksentit.py)');
  const acc = aksentit.aksentit.map((x) => ({ ...x, t: x.t - meta.start }));
  const strokes = (aksentit.patarumpu?.lyonnit ?? []).map((t) => t - meta.start);
  const rolls = (aksentit.patarumpu?.tremolot ?? []).map(([a, b]) => [a - meta.start, b - meta.start]);
  const T_DOM7 = A('cue_hero_dom7').t;
  const widSec = sec('widersacher');
  if (!widSec || widSec.side !== meta.side) throw new Error('jakso widersacher puuttuu teemakartasta');
  const T_WID = widSec.start - meta.start;
  const T_NEEDLE = (patina.clicks.length ? patina.clicks[0][0] : 3.1) - meta.start;
  const T_END = meta.duration;
  const fi = (t) => clamp(Math.round(t * FPS), 0, n - 1);

  const loudArr = ch.loudness;
  const loud = sampler(gaussian(loudArr, 3), FPS);
  const loudSlow = sampler(gaussian(loudArr, 20), FPS);
  const reg = sampler(gaussian(Float32Array.from(ch.register, (v, i) => (i < i0 ? ch.register[i0] : v)), 18), FPS);
  const tension = sampler(gaussian(ch.tension, 12), FPS);
  const hiss = sampler(gaussian(ch.hiss, 30), FPS);

  // --- Soitinperheet --------------------------------------------------------------------
  function famArr(keys, sigma = 12) {
    const a = new Float32Array(n);
    for (const k of keys) {
      const c = lch[`panns_${k}`];
      if (c) for (let i = 0; i < n; i++) a[i] += c[i];
    }
    const s = gaussian(Float32Array.from(a, (v) => Math.min(1, v)), sigma);
    const p = percentile(s, 0.95, i0);
    // ennen musiikkia ja tauossa levyn rahina ei ole soitinta
    return Float32Array.from(s, (v, i) => (i < i0 || loudArr[i] < 0.06 ? 0 : clamp(v / p, 0, 1.5)));
  }
  const F = {
    horns: famArr(['french_horn']),
    brass: famArr(['trumpet', 'trombone', 'brass_instrument']),
    tpt: famArr(['trumpet', 'trombone']),
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
  // Tehollinen tutti: kova soitto, jota soitinluokat eivät selitä, on koko orkesteri.
  const loudS = gaussian(loudArr, 9);
  const tutti = Float32Array.from(F.tutti, (v, i) => (i < i0 ? 0 : Math.max(clamp(v), smoothstep(0.5, 0.88, loudS[i]))));
  const G = {
    hero: new Float32Array(n),
    horns: new Float32Array(n),
    violins: new Float32Array(n),
    lows: new Float32Array(n),
    brass: new Float32Array(n),
  };
  for (let i = 0; i < n; i++) {
    const tu = tutti[i];
    G.hero[i] = clamp(Math.max(F.horns[i], 0.85 * F.cello[i], 0.7 * F.brass[i], 0.9 * tu));
    G.horns[i] = clamp(Math.max(F.horns[i], 0.75 * tu));
    G.violins[i] = clamp(Math.max(F.violins[i], 0.7 * F.strings[i], 0.75 * tu));
    G.lows[i] = clamp(Math.max(F.cello[i], F.bass[i], 0.8 * bs[i] / bsP, 0.75 * tu));
    G.brass[i] = clamp(Math.max(F.brass[i], 0.7 * tu));
  }
  const energy = Object.fromEntries(Object.entries(G).map(([k, v]) => [k, sampler(gaussian(v, 8), FPS)]));
  const fam = Object.fromEntries(Object.entries(F).map(([k, v]) => [k, sampler(v, FPS)]));
  const tuttiS = sampler(tutti, FPS);

  // Läsnäolo: välit, joina ryhmä soi (hystereesi), ja niistä ennakoiva liukuma 0..1.
  function presence(arr, on, off, holdOn = 0.5, holdOff = 2.5, gapMerge = 3.0, minStart = T0) {
    const iv = [];
    let state = 0, cnt = 0, a = 0;
    for (let i = 0; i < n; i++) {
      const v = arr[i];
      if (!state) {
        cnt = v > on ? cnt + 1 : 0;
        if (cnt >= holdOn * FPS) { state = 1; a = (i - cnt + 1) / FPS; cnt = 0; }
      } else {
        cnt = v < off ? cnt + 1 : 0;
        if (cnt >= holdOff * FPS) { state = 0; iv.push([a, (i - cnt + 1) / FPS]); cnt = 0; }
      }
    }
    if (state) iv.push([a, T_END + 10]);
    const merged = [];
    for (const [s, e] of iv) {
      const last = merged[merged.length - 1];
      if (last && s - last[1] < gapMerge) last[1] = e;
      else merged.push([Math.max(s, minStart), e]);
    }
    const p = new Float32Array(n);
    for (const [s, e] of merged) {
      for (let i = 0; i < n; i++) {
        const t = i / FPS;
        const v = Math.min(smoothstep(s - 0.7, s + 0.8, t), 1 - smoothstep(e, e + 2.2, t));
        if (v > p[i]) p[i] = v;
      }
    }
    return { at: sampler(p, FPS), intervals: merged };
  }
  const pres = {
    horns: presence(G.horns, 0.42, 0.14),
    violins: presence(G.violins, 0.45, 0.16),
    lows: presence(G.lows, 0.42, 0.15, 0.3, 3.5),
  };
  // Vaskiryhmä (trumpetit ja pasuunat) jaksoista: PANNs:n trumpetti/pasuuna on tässä epätarkka
  // (antaa käyttäjän vahvistaman tulon A 0:39.4 vasta 41,0 s), jaksoraja osuu kohdalleen.
  // Näytöksessä II matalat vasket ovat vastustajia; vaskiryhmä palaa vasta kahdessa viimeisessä jaksossa.
  {
    const iv = [];
    segments.forEach((s, k) => {
      const a = s.alku - meta.start, b = s.loppu - meta.start;
      const act2 = a >= T_WID - 0.5;
      if (!s.soittimet.includes('trumpetit ja pasuunat')) return;
      if (act2 && k < segments.length - 2) return;
      const last = iv[iv.length - 1];
      if (last && a - last[1] < 3) last[1] = b; else iv.push([a, b]);
    });
    const p = new Float32Array(n);
    for (const [a, b] of iv) for (let i = 0; i < n; i++) {
      const t = i / FPS;
      p[i] = Math.max(p[i], Math.min(smoothstep(a - 1.3, a + 0.2, t), 1 - smoothstep(b - 0.2, b + 2.0, t)));
    }
    pres.brass = { at: sampler(p, FPS), intervals: iv };
  }

  // --- Tahtiaika ----------------------------------------------------------------------
  const barT = beats.bars.map((b) => b.t - meta.start);
  function barPos(t) {
    const m = barT.length;
    if (t < barT[0]) return (t - barT[0]) / 2.0;
    if (t >= barT[m - 1]) return m - 1 + (t - barT[m - 1]) / (barT[m - 1] - barT[m - 2]);
    let lo = 0, hi = m - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (barT[mid] <= t) lo = mid; else hi = mid;
    }
    return lo + (t - barT[lo]) / (barT[hi] - barT[lo]);
  }
  const barTime = (b) => {
    const m = barT.length;
    if (b <= 0) return barT[0] + b * 2.0;
    if (b >= m - 1) return barT[m - 1] + (b - m + 1) * (barT[m - 1] - barT[m - 2]);
    const k = Math.floor(b);
    return barT[k] + (b - k) * (barT[k + 1] - barT[k]);
  };
  const beatPos = (t) => barPos(t) * 4;
  // tahdin numero 1-pohjaisena (partituurin tapaan)
  const barStart = (barNo) => barTime(barNo - 1);

  // --- Jaksot ja luonne -----------------------------------------------------------------
  const segs = segments.map((s, k) => ({ ...s, a: s.alku - meta.start, b: s.loppu - meta.start, k }));
  function trait(s) {
    if (s.a >= T_DOM7 + 0.5) return 'tumma';
    const a = s.aktiivisuus;
    const brassy = (a['trumpetit ja pasuunat'] ?? 0) + (a['käyrätorvet'] ?? 0);
    if (brassy > 0.9 && (a['lyömäsoittimet'] ?? 0) > 0.35) return 'suora';
    if (s.suunta === 'diminuendo') return 'perus';
    if (s.suunta === 'crescendo') return 'portaat';
    if ((a.viulut ?? 0) > 0.6 && s.dynamiikka !== 'ff') return 'kiehkurat';
    if (s.dynamiikka === 'f' || s.dynamiikka === 'ff') return 'liekit';
    return 'perus';
  }
  segs.forEach((s) => (s.trait = trait(s)));
  function segAt(t) {
    if (!segs.length || t < segs[0].a) return null;
    let lo = 0, hi = segs.length - 1;
    while (hi > lo) {
      const mid = (lo + hi + 1) >> 1;
      if (segs[mid].a <= t) lo = mid; else hi = mid - 1;
    }
    return segs[lo];
  }

  // --- Melodia: johtava ääni (CREPE), aukot täytetään edellisellä varmalla äänellä ----------
  const melArr = new Float32Array(n);
  {
    let last = 55;
    for (let i = 0; i < n; i++) {
      const m = lch.johtava_midi[i];
      if (m > 0 && lch.johtava_varmuus[i] >= 0.45) last = m;
      melArr[i] = last;
    }
  }
  const melody = sampler(gaussian(melArr, 7), FPS);
  const bassMidi = (() => {
    const a = new Float32Array(n);
    let last = 40;
    for (let i = 0; i < n; i++) {
      const m = lch.basso_midi[i];
      if (m > 0 && lch.basso_varmuus[i] >= 0.45) last = m;
      a[i] = last;
    }
    return sampler(gaussian(a, 5), FPS);
  })();

  // --- Tapahtumat -----------------------------------------------------------------------
  const evs = events.events.map((e) => ({ ...e, t: e.t - meta.start }));
  const drops = evs.filter((e) => e.tyyppi === 'hiljenee_akkia' && e.t > T0 + 5 && e.t < T_DOM7 - 1).map((e) => e.t);
  const rises = evs.filter((e) => e.tyyppi === 'voimistuu_akkia' && e.t > T0 + 5 && e.t < T_DOM7 - 1).map((e) => e.t);
  // Jähmettymät: pudotuksesta seuraavaan nousuun.
  const freezes = drops.map((d) => [d, rises.find((r) => r > d) ?? d + 1.2]);
  function hits(arr, thr, rise, minGap = 15) {
    const out = [];
    let last = -99;
    for (let i = i0 + 6; i < n - 1; i++) {
      if (arr[i] > thr && arr[i] - arr[i - 6] > rise && arr[i] >= arr[i - 1] && arr[i + 1] <= arr[i] && i - last > minGap) {
        if (loudArr[i] > 0.1) out.push({ t: i / FPS, s: clamp(arr[i]) });
        last = i;
      }
    }
    return out;
  }
  const percHits = hits(F.perc, 0.45, 0.25);
  const cymbalHits = hits(F.cymbal, 0.55, 0.3, 30).filter((h) => h.t > T0 + 1);
  const clicks = patina.clicks.map(([t, s]) => [t - meta.start, s]);

  // --- Vastustajat: puupuhaltimien fraasit ----------------------------------------------
  const ORDER = ['neula', 'rykelma', 'roiske', 'portaat', 'dehring', 'vapisevat', 'karikatyyri', 'fagotit', 'pasuunat'];
  const phrases = [];
  {
    const winds = F.winds;
    const ons = meta.onsets.map((x) => x - meta.start).filter((t) => t >= T_WID + 0.3 && t < T_END - 1.5)
      .filter((t) => winds[fi(t)] >= 0.12 || (bs[fi(t)] / bsP >= 0.32 && F.strings[fi(t)] < 0.4 && F.cello[fi(t)] < 0.5));
    for (const t of ons) {
      const last = phrases[phrases.length - 1];
      if (last && t - last.ons[last.ons.length - 1] < 0.9) last.ons.push(t);
      else phrases.push({ ons: [t] });
    }
    phrases.forEach((ph, p) => {
      ph.t0 = ph.ons[0];
      ph.t1 = ph.ons[ph.ons.length - 1] + 0.5;
      const m0 = lch.johtava_midi[fi(ph.t0)];
      ph.midi = m0 > 0 ? m0 : 60;
      const band = ph.midi >= 74 ? ['neula', 'vapisevat'] : ph.midi >= 58 ? ['rykelma', 'karikatyyri', 'portaat', 'vapisevat'] : ['dehring', 'fagotit', 'pasuunat'];
      ph.type = p < ORDER.length ? ORDER[p] : band[Math.floor(hash1(5000 + p) * band.length)];
    });
    // Lautasisku on oma vastustajansa (Porterin nro 3), kun se osuu jaksoon 2.
    for (const h of cymbalHits) if (h.t >= T_WID) phrases.push({ ons: [h.t], t0: h.t, t1: h.t + 0.6, midi: 84, type: 'roiske' });
    phrases.sort((a, b) => a.t0 - b.t0);
  }
  const windsSlow = sampler(gaussian(F.winds, 60), FPS);

  // --- Levyn pyöriminen (Drehbühne): kulma kertyy tempon ja energian mukaan ---------------
  const spin = new Float32Array(n);
  {
    let a = 0;
    for (let i = 0; i < n; i++) {
      const t = i / FPS;
      const act2 = t >= T_WID;
      const still = t < T_NEEDLE || (t > T_DOM7 + 0.15 && t < T_WID); // tauossa levy pysähtyy
      const base = act2 ? 0.022 : 0.045; // rad/s
      const e = loudS[i];
      if (!still) a += (base * (0.45 + 1.1 * e)) / FPS;
      spin[i] = a;
    }
  }

  // Duurin ja mollin vaihtelu taivaalle (5 s ikkunat).
  const keys = (meta.keys_5s || []).map((k) => ({ t: k.t - meta.start, minor: k.key.includes('molli') }));
  const minorArr = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / FPS;
    const k = keys.find((x) => t >= x.t && t < x.t + 5);
    minorArr[i] = k && k.minor ? 1 : 0;
  }
  const minor = sampler(gaussian(minorArr, 45), FPS);

  // Levyn 0–6 taajuuskaistat sädekehää varten.
  const bandNames = ['band_sub', 'band_matala', 'band_matala_keski', 'band_keski', 'band_korkea_keski', 'band_korkea'];
  const bands = bandNames.map((b) => sampler(gaussian(ch[b], 2), FPS));

  // Isku-kuoret: kuva tulee yhden ruudun ennen ääntä (tyyli 8), nousee heti ja hiipuu.
  const LEAD = 1 / FPS;
  const pulse = (t, at, decay = 0.35) => (t < at - LEAD ? 0 : Math.exp(-Math.max(0, t - (at - LEAD)) / decay));
  // Nuotinalut annetulla välillä (analyysi), esim. siipien lyönnit ja vesirenkaat.
  const onsetsAll = meta.onsets.map((x) => x - meta.start);
  const onsetsIn = (a, b, pred = null) => onsetsAll.filter((t) => t >= a && t < b && (!pred || pred(t)));
  const strokesIn = (a, b) => strokes.filter((t) => t >= a && t < b);
  const accIn = (a, b, zmin = 5) => acc.filter((x) => x.t >= a && x.t < b && x.z >= zmin);

  return {
    A, acc, strokes, rolls, LEAD, pulse, onsetsIn, strokesIn, accIn,
    n, T0, T_DOM7, T_WID, T_NEEDLE, T_END, fi,
    loud, loudSlow, reg, tension, hiss, fam, tutti: tuttiS, energy, pres,
    barPos, barTime, beatPos, barStart, barT,
    segs, segAt, melody, bassMidi,
    drops, rises, freezes, percHits, cymbalHits, clicks, phrases, windsSlow,
    spin: sampler(spin, FPS), minor, bands,
  };
}
