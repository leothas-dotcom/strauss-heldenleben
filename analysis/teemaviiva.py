"""Teemaviiva: melodian tarkka sävelkorkeus äänestä, kun muoto tunnetaan partituurista.

CREPE ei tunnista unisonossa ja matalalla soivaa teemaa (sankariteeman alku: käyrätorvet, sellot ja
alttoviulut Es2:sta ylös, kontrabassot oktaavia alempana). Tieto on silti äänessä: spektrin
harmoninen summa (perussävel ja sen yläsävelet yhdessä) näkyy selvästi levyn kohinan yläpuolella.

Partituurista otetaan vain muoto (sävelten järjestys ja likimääräinen paikka tahdeissa). Se rajaa,
mistä kunkin hetken säveltä haetaan, ja ratkaisee oktaavivirheet. Äänestä tulevat:
  - tarkka sävelkorkeus (puolisävelaskeleen sadasosina, intonaatio ja vibrato mukana)
  - sävelen todellinen vaihtumishetki (Kraussin rubato), eli lähin hetki, jolla seuraava sävel
    voittaa nykyisen
  - varmuus (salienssin huippu suhteessa kaistan keskiarvoon)

Tahtien alut tulevat teemakartan ankkureista (tahtiankkurit); tahtien välit interpoloidaan
tasaisesti (tahtiruudukko pitää paikallisesti). Nuottilistan aika on vain haun alue: sävel
saa vaihtua ±0,6 tahtia nuotin rajasta.

    python -I analysis/teemaviiva.py --side 1 --muoto annotations/sankariteema.json --out build/demo400/teemaviiva.json

Tulos: {"fps": 30, "t0": ..., "midi": [...], "varmuus": [...], "nuotti": [...], "nuotit": [{alku, loppu, midi_mitattu, ...}]}
"""
import argparse
import json
import sys
from pathlib import Path

import librosa
import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
import sys as _sys
_sys.path.insert(0, str(Path(__file__).resolve().parent))
from lahde import FILES, NOISE  # lähdeääni ja kohinaväli audio/lahde.json:sta (nopeuskorjattu siirto)  # noqa: E402
SR = 22050
HOP = 256              # 86 kehystä/s, tulos näytteistetään 30 fps:iin
BPO = 60               # 5 lokeroa puolisävelaskelta kohden (20 senttiä)
FMIN = librosa.note_to_hz("C1")
NBINS = BPO * 7
HARM = [1.0, 0.8, 0.6, 0.45, 0.35, 0.25]   # yläsävelten painot


def load(side, a, b):
    info = sf.info(str(FILES[side]))
    sr0 = info.samplerate
    y, _ = sf.read(str(FILES[side]), start=int(a * sr0), stop=int(b * sr0), dtype="float32", always_2d=True)
    return librosa.resample(y.mean(axis=1), orig_sr=sr0, target_sr=SR)


def salience(y):
    C = np.abs(librosa.cqt(y, sr=SR, hop_length=HOP, fmin=FMIN, n_bins=NBINS, bins_per_octave=BPO, filter_scale=0.8))
    return C


def bar_time(anchors, bar):
    """Tahdin (1-pohjainen, desimaali) alkuaika ankkureista lineaarisesti."""
    ks = sorted((float(k), float(v)) for k, v in anchors.items())
    for (b0, t0), (b1, t1) in zip(ks, ks[1:]):
        if b0 <= bar <= b1:
            return t0 + (bar - b0) * (t1 - t0) / (b1 - b0)
    (b0, t0), (b1, t1) = (ks[-2], ks[-1]) if bar > ks[-1][0] else (ks[0], ks[1])
    return t0 + (bar - b0) * (t1 - t0) / (b1 - b0)


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser()
    ap.add_argument("--side", type=int, default=1)
    ap.add_argument("--muoto", required=True, help="partituurin muoto: JSON {tahtiankkurit, nuotit[{tahti, isku, kesto, midi}]}")
    ap.add_argument("--out", required=True)
    ap.add_argument("--band", type=float, default=1.5, help="hakualue puolisävelaskelina odotetun sävelen ympärillä")
    a = ap.parse_args()
    spec = json.loads(Path(a.muoto).read_text(encoding="utf-8"))
    anchors = spec["tahtiankkurit"]
    notes = spec["nuotit"]
    for n in notes:
        n["a"] = bar_time(anchors, n["tahti"] + n["isku"] / 4.0)
        n["b"] = bar_time(anchors, n["tahti"] + (n["isku"] + n["kesto"]) / 4.0)
    t0 = notes[0]["a"] - 0.5
    t1 = notes[-1]["b"] + 0.5
    y = load(a.side, t0, t1)
    C = salience(y)
    # kohina: levyn pinta ilman musiikkia
    na, nb = NOISE[a.side]
    Cn = salience(load(a.side, na, nb)).mean(axis=1, keepdims=True) + 1e-9
    L = 20 * np.log10(C + 1e-9) - 20 * np.log10(Cn)
    L = np.clip(L, 0, None)
    # harmoninen summa: perussävel f saa yläsävelten h·f energian
    Sal = np.zeros_like(L)
    for h, w in enumerate(HARM, start=1):
        off = int(round(BPO * np.log2(h)))
        Sal[: NBINS - off] += w * L[off:]
    nfr = Sal.shape[1]
    tf = t0 + np.arange(nfr) * HOP / SR
    bin_midi = librosa.hz_to_midi(FMIN) + np.arange(NBINS) * 12.0 / BPO

    # ehdokkaat: kunkin kehyksen ympärillä olevat nuotit (vaihto saa liukua ±0,6 tahtia)
    bar_len = (bar_time(anchors, 2) - bar_time(anchors, 1))
    slack = 0.6 * bar_len / 4 * 4 / 4   # noin 0,6 tahdin neljäsosa-arvosta
    slack = max(0.25, 0.15 * bar_len)
    best_midi = np.full(nfr, np.nan)
    best_conf = np.zeros(nfr)
    best_note = np.full(nfr, -1)
    for i in range(nfr):
        t = tf[i]
        cand = [k for k, n in enumerate(notes) if n["a"] - slack <= t < n["b"] + slack]
        if not cand:
            continue
        bestv, bestm, bestk = -1, np.nan, -1
        col = Sal[:, i]
        for k in cand:
            m = notes[k]["midi"]
            sel = np.where(np.abs(bin_midi - m) <= a.band)[0]
            j = sel[np.argmax(col[sel])]
            # parabolinen tarkennus
            if 0 < j < NBINS - 1:
                y0, y1, y2 = col[j - 1], col[j], col[j + 1]
                d = 0.5 * (y0 - y2) / (y0 - 2 * y1 + y2 + 1e-9)
            else:
                d = 0.0
            v = col[j]
            # aikaprioriteetti: nuotin oma väli voittaa tasatilanteessa
            if notes[k]["a"] <= t < notes[k]["b"]:
                v *= 1.15
            if v > bestv:
                bestv, bestm, bestk = v, bin_midi[j] + d * 12.0 / BPO, k
        band = col[np.abs(bin_midi - bestm) <= 6].mean() + 1e-9
        best_midi[i], best_conf[i], best_note[i] = bestm, min(1.0, (bestv / band - 1) / 3), bestk
    # nuotin vaihto ei saa palata taaksepäin: monotoninen nuottijärjestys (mediaanisuodin)
    from scipy.ndimage import median_filter
    nn = best_note.copy()
    ok = nn >= 0
    nn[ok] = median_filter(nn[ok], size=9)
    for i in range(1, nfr):
        if nn[i] >= 0 and nn[i - 1] >= 0 and nn[i] < nn[i - 1]:
            nn[i] = nn[i - 1]
    # 30 fps
    fps = 30
    tg = np.arange(np.ceil(tf[0] * fps), np.floor(tf[-1] * fps) + 1) / fps
    idx = np.clip(np.searchsorted(tf, tg), 0, nfr - 1)
    out_m = best_midi[idx]
    out_c = best_conf[idx]
    out_n = nn[idx]
    # nuottikohtaiset mitatut ajat ja sävelet
    res = []
    for k, n in enumerate(notes):
        sel = np.where(nn == k)[0]
        if len(sel) == 0:
            res.append({**{x: n[x] for x in n if x not in ("a", "b")}, "alku": None, "loppu": None, "midi_mitattu": None})
            continue
        res.append({**{x: n[x] for x in n if x not in ("a", "b")}, "alku": round(float(tf[sel[0]]), 3), "loppu": round(float(tf[sel[-1]] + HOP / SR), 3),
                    "midi_mitattu": round(float(np.nanmedian(best_midi[sel])), 2), "varmuus_ka": round(float(best_conf[sel].mean()), 2)})
    Path(a.out).write_text(json.dumps({"lahde": "analysis/teemaviiva.py: harmoninen summa (CQT) + partituurin muoto", "side": a.side, "fps": fps,
                                        "t0": round(float(tg[0]), 4), "midi": [None if np.isnan(v) else round(float(v), 2) for v in out_m],
                                        "varmuus": [round(float(v), 2) for v in out_c], "nuotti": [int(v) for v in out_n], "nuotit": res},
                                       ensure_ascii=False), encoding="utf-8")
    print(f"{len(notes)} nuottia, {len(tg)} ruutua ({tg[0]:.2f}–{tg[-1]:.2f} s) -> {a.out}")
    for r in res:
        if r["alku"] is None:
            print(f"  T{r['tahti']}+{r['isku']:<4} {r.get('savel','?'):5s} ei löytynyt")
        else:
            dev = r["midi_mitattu"] - r["midi"]
            print(f"  T{r['tahti']}+{r['isku']:<4} {r.get('savel','?'):5s} odotettu {r['midi']:5.1f}  mitattu {r['midi_mitattu']:6.2f} ({dev:+.2f})  {r['alku']:7.2f}–{r['loppu']:7.2f}  varmuus {r['varmuus_ka']:.2f}")


if __name__ == "__main__":
    main()
