// Koko A-puoli kolmesta analyysipaketista (build/demo400 0–400 s, A2 400–820 s, A3 800–1260 s; korjatun lähteen aika, audio/lahde.json).
// Paketit yhdistetään yhdeksi aikajanaksi puolen omassa ajassa (0 = tiedoston alku). Limityksissä
// käytetään saumaa SEAM: sitä ennen edellinen paketti, sen jälkeen seuraava. Kaikki ruutudata on
// 30 fps, joten ruutu i = i/30 s. Tapahtumalistat (iskut, nuotinalut, naksahdukset, jaksot) otetaan
// kustakin paketista vain sen omalta väliltä, jotta mitään ei tule kahteen kertaan.

const FPS = 30;

async function fetchOk(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(`${path}: ${r.status}`);
  return r;
}
async function frames(dir, name) {
  const meta = await (await fetchOk(`/${dir}/${name}.json`)).json();
  const raw = new Float32Array(await (await fetchOk(`/${dir}/${name}.f32`)).arrayBuffer());
  return { meta, raw };
}
const json = async (p) => (await fetchOk(p)).json();

// paketit: [{ dir, from, to }] (from/to = väli, jolta paketti on voimassa)
export async function loadSide(packs, cuesPath = '/annotations/cues.json') {
  const loaded = [];
  for (const p of packs) {
    const a = await frames(p.dir, 'analysis');
    const l = await frames(p.dir, 'listen');
    loaded.push({
      ...p, a, l,
      beats: await json(`/${p.dir}/beats.json`), events: await json(`/${p.dir}/events.json`),
      patina: await json(`/${p.dir}/patina.json`), segments: await json(`/${p.dir}/segments.json`),
      aksentit: await json(`/${p.dir}/aksentit.json`),
    });
  }
  const m0 = loaded[0].a.meta;
  const end = loaded[loaded.length - 1].to;
  const n = Math.round(end * FPS) + 1;
  function merge(kind) {
    const names = loaded[0][kind].meta.channels;
    const out = Object.fromEntries(names.map((c) => [c, new Float32Array(n)]));
    for (const p of loaded) {
      const m = p[kind].meta;
      const Cn = m.channels.length;
      const i0 = Math.round(p.from * FPS), i1 = Math.min(n, Math.round(p.to * FPS) + 1);
      const s0 = Math.round(m.start * FPS);
      m.channels.forEach((c, j) => {
        const dst = out[c];
        if (!dst) return;
        for (let i = i0; i < i1; i++) {
          const k = i - s0;
          if (k >= 0 && k < m.frames) dst[i] = p[kind].raw[k * Cn + j];
        }
      });
    }
    return out;
  }
  const inside = (p, t) => t >= p.from && t < p.to;
  const meta = {
    ...m0, start: 0, duration: end, frames: n, side: m0.side,
    music_start: m0.music_start,
    onsets: loaded.flatMap((p) => p.a.meta.onsets.filter((t) => inside(p, t))),
    keys_5s: loaded.flatMap((p) => (p.a.meta.keys_5s || []).filter((k) => inside(p, k.t))),
    channels: loaded[0].a.meta.channels,
  };
  const listenCh = merge('l');
  return {
    meta, channels: merge('a'),
    listen: { meta: { ...loaded[0].l.meta, frames: n }, channels: listenCh },
    beats: { ...loaded[0].beats, bars: loaded.flatMap((p) => p.beats.bars.filter((b) => inside(p, b.t))) },
    events: { events: loaded.flatMap((p) => p.events.events.filter((e) => inside(p, e.t))) },
    patina: { ...loaded[0].patina, clicks: loaded.flatMap((p) => p.patina.clicks.filter(([t]) => inside(p, t))) },
    segments: loaded.flatMap((p) => p.segments.filter((s) => inside(p, s.alku))),
    aksentit: {
      aksentit: loaded.flatMap((p) => p.aksentit.aksentit.filter((x) => inside(p, x.t))),
      patarumpu: {
        lyonnit: loaded.flatMap((p) => (p.aksentit.patarumpu?.lyonnit ?? []).filter((t) => inside(p, t))),
        tremolot: loaded.flatMap((p) => (p.aksentit.patarumpu?.tremolot ?? []).filter(([a]) => inside(p, a))),
      },
    },
    cues: await json(cuesPath),
  };
}
