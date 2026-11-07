"""Viuluviiva: sooloviulun sävelkorkeus äänestä ilman partituuria.

CREPE jää varmuuskynnyksen alle viulun soolokohdissa orkesterin seassa. Menetelmä on teemaviiva.py:n:
CQT-salienssi levyn kohinan yläpuolella, harmoninen summa (6 yläsäveltä). Haku rajataan viulun
soolorekisteriin G3 (55) ... E7 (100) ja polku valitaan Viterbillä: siirtymäkustannus kasvaa puolisävelaskeleen
hypyn mukaan ja oktaavihypylle (12 ± 0,5 st) on lisärangaistus, joten viiva on jatkuva.
Äänettömyys (null): salienssin huippu alle kynnyksen suhteessa kaistan keskiarvoon TAI PANNs-viulukanava < 0,15
(build/A2 ja A3 listen.f32, 30 fps, paketin alusta; paketit limittyvät kuten visual/muste/data.js:ssä: myöhempi
paketti voittaa rajalla).

    python -I analysis/viuluviiva.py --side 1 --from 422 --to 1126 --out build/koko/viuluviiva_A.json
"""
import argparse
import json
import sys
from pathlib import Path

import librosa
import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
FILES = {1: ROOT / "audio" / "lp_krauss" / "side1.flac", 2: ROOT / "audio" / "lp_krauss" / "side2.flac"}
NOISE = {1: (4.0, 7.2), 2: (1400.0, 1406.0)}
PACKS = {1: ["build/A2", "build/A3"], 2: []}
SR = 22050
HOP = 256
BPO = 60
FMIN = librosa.note_to_hz("C1")
NBINS = BPO * 7
HARM = [1.0, 0.8, 0.6, 0.45, 0.35, 0.25]
LO, HI = 55, 100
PER = BPO // 12
FPS = 30


def load(side, a, b):
    sr0 = sf.info(str(FILES[side])).samplerate
    y, _ = sf.read(str(FILES[side]), start=int(a * sr0), stop=int(b * sr0), dtype="float32", always_2d=True)
    return librosa.resample(y.mean(axis=1), orig_sr=sr0, target_sr=SR)


def load_stem(a, b, stem):
    """Demucs-stemmi: A2 (start 400) aikaan 810 asti, A3 (start 800) sen jälkeen."""
    parts = []
    for d, st, lo, hi in (("build/A2", 400.0, 0.0, 810.0), ("build/A3", 800.0, 810.0, 1e9)):
        x0, x1 = max(a, lo), min(b, hi)
        if x1 <= x0:
            continue
        f = ROOT / d / "stems" / (stem + ".wav")
        sr0 = sf.info(str(f)).samplerate
        y, _ = sf.read(str(f), start=int((x0 - st) * sr0), stop=int((x1 - st) * sr0), dtype="float32", always_2d=True)
        parts.append(librosa.resample(y.mean(axis=1), orig_sr=sr0, target_sr=SR))
    return np.concatenate(parts)


def cqt(y):
    return np.abs(librosa.cqt(y, sr=SR, hop_length=HOP, fmin=FMIN, n_bins=NBINS, bins_per_octave=BPO, filter_scale=0.8))


def panns_violin(side, n_frames, t0):
    """PANNs-viulukanava 30 fps:n ruuduille t0 + i/30 (ei pakettia -> 1.0)."""
    out = np.full(n_frames, np.nan)
    t = t0 + np.arange(n_frames) / FPS
    for d in PACKS[side]:
        meta = json.loads((ROOT / d / "listen.json").read_text(encoding="utf-8"))
        ch = meta["channels"].index("panns_violin_fiddle")
        raw = np.fromfile(ROOT / d / "listen.f32", dtype="<f4").reshape(-1, len(meta["channels"]))
        k = np.round((t - meta["start"]) * FPS).astype(int)
        ok = (k >= 0) & (k < len(raw))
        out[ok] = raw[k[ok], ch]   # myöhempi paketti ylikirjoittaa
    return out


def viterbi(E, T):
    n, m = E.shape
    cost = np.zeros(m)
    back = np.zeros((n, m), dtype=np.int16)
    for i in range(n):
        tot = cost[:, None] + T
        back[i] = np.argmin(tot, axis=0)
        cost = tot[back[i], np.arange(m)] + E[i]
    path = np.zeros(n, dtype=int)
    path[-1] = int(np.argmin(cost))
    for i in range(n - 1, 0, -1):
        path[i - 1] = back[i, path[i]]
    return path


def suunta(a, y, S, t0, tf, nfr, m):
    """Suuntaviiva: salienssin painotettu keskiarvo midi-asteikolla (ei huipun valintaa), tasoitettu."""
    from scipy.ndimage import gaussian_filter1d
    midis = LO + np.arange(m) / PER
    W = S ** 2
    mm = (W * midis).sum(axis=1) / (W.sum(axis=1) + 1e-9)
    win = int(0.05 * SR)
    rms = np.sqrt(np.convolve(y ** 2, np.ones(win) / win, mode="same"))
    rms_f = rms[np.clip((np.arange(nfr) * HOP).astype(int), 0, len(rms) - 1)]
    tg = np.arange(np.ceil(a.a * FPS), np.floor(a.b * FPS) + 1) / FPS
    idx = np.clip(np.searchsorted(tf, tg), 0, nfr - 1)
    x = mm[idx]
    voiced = rms_f[idx] >= np.percentile(rms_f, 10)
    # äänettömyys pitää edellisen arvon
    for i in range(len(x)):
        if not voiced[i]:
            x[i] = x[i - 1] if i else np.nan
    if np.isnan(x[0]):
        x[0] = x[np.argmax(voiced)]
        for i in range(1, len(x)):
            if np.isnan(x[i]):
                x[i] = x[i - 1]
    fast = gaussian_filter1d(x, 0.25 * FPS, mode="nearest")
    slow = gaussian_filter1d(x, 2.0 * FPS, mode="nearest")
    curve = 0.7 * fast + 0.3 * slow
    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    Path(a.out).write_text(json.dumps({"lahde": "analysis/viuluviiva.py --mode suunta: salienssin painotettu keskiarvo (vocals-stemmi), vain suunta", "side": a.side,
        "fps": FPS, "t0": round(float(tg[0]), 4), "midi": [round(float(v), 2) for v in curve],
        "varmuus": [1.0 if v else 0.0 for v in voiced]}, ensure_ascii=False), encoding="utf-8")
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    fig, ax = plt.subplots(figsize=(18, 5), dpi=110)
    ax.plot(tg, curve, lw=1.0, color="#143E66")
    ax.set_xlim(a.a, a.b); ax.set_xlabel("aika (s, A-puoli)"); ax.set_ylabel("midi (suunta)"); ax.grid(alpha=.3)
    fig.savefig(str(Path(a.out).with_suffix(".png")), bbox_inches="tight")
    for lo, hi, nm_ in ((422, 470, "422-470"), (802, 900, "802-900"), (518, 581, "8:38-9:41"), (802, 840, "13:22 cant.")):
        k = (tg >= lo) & (tg < hi)
        print(f"{nm_:12s} keski {curve[k].mean():5.1f}  vaihteluväli {np.ptp(curve[k]):4.1f}  keskihajonta {curve[k].std():4.2f}  |d/dt| {np.abs(np.diff(curve[k])).mean()*FPS:4.2f} st/s")
    print(f"{len(tg)} ruutua -> {a.out}")


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser()
    ap.add_argument("--side", type=int, default=1)
    ap.add_argument("--from", dest="a", type=float, required=True)
    ap.add_argument("--to", dest="b", type=float, required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--stem", default="vocals")
    ap.add_argument("--mode", choices=["suunta", "viterbi"], default="suunta", help="suunta: painotettu keskiarvo (vain suunta), viterbi: sävelpolku")
    ap.add_argument("--peak-ratio", type=float, default=2.0)
    ap.add_argument("--jump", type=float, default=1.05, help="siirtymäkustannus / puolisävelaskel")
    ap.add_argument("--octave", type=float, default=8.0, help="oktaavihypyn lisärangaistus")
    a = ap.parse_args()
    t0 = a.a - 0.5
    y = load_stem(t0, a.b + 0.5, a.stem)
    C = cqt(y)
    Cn = np.percentile(C, 10, axis=1, keepdims=True) + 1e-6
    L = np.clip(20 * np.log10(C + 1e-6) - 20 * np.log10(Cn), 0, None)
    Sal = np.zeros_like(L)
    for h, w in enumerate(HARM, start=1):
        off = int(round(BPO * np.log2(h)))
        Sal[: NBINS - off] += w * L[off:]
    b0 = int(round((LO - librosa.hz_to_midi(FMIN)) * PER))
    b1 = int(round((HI - librosa.hz_to_midi(FMIN)) * PER)) + 1
    S = Sal[b0:b1].T            # kehys x lokero
    nfr, m = S.shape
    tf = t0 + np.arange(nfr) * HOP / SR
    if a.mode == "suunta":
        return suunta(a, y, S, t0, tf, nfr, m)
    mean = np.median(S, axis=1, keepdims=True) + 1e-9
    R = S / mean                # suhteessa kaistan keskiarvoon
    E = -R * 1.0                # emissiokustannus
    d = np.abs(np.arange(m)[:, None] - np.arange(m)[None, :]) / PER   # puolisävelaskelia
    T = a.jump * np.minimum(d, 6.0) + 0.05 * d
    T += a.octave * (np.abs(d - 12) < 0.6) + a.octave * (np.abs(d - 24) < 0.6)
    path = viterbi(E, T)
    # parabolinen tarkennus
    pk = S[np.arange(nfr), path]
    win = int(0.05 * SR)
    rms = np.sqrt(np.convolve(y ** 2, np.ones(win) / win, mode="same"))
    rms_f = rms[np.clip((np.arange(nfr) * HOP).astype(int), 0, len(rms) - 1)]
    j = np.clip(path, 1, m - 2)
    y0, y1, y2 = S[np.arange(nfr), j - 1], S[np.arange(nfr), j], S[np.arange(nfr), j + 1]
    dd = np.where((path > 0) & (path < m - 1), 0.5 * (y0 - y2) / (y0 - 2 * y1 + y2 - 1e-9), 0.0)
    midi = LO + (path + np.clip(dd, -1, 1)) / PER
    conf = np.clip((pk / mean[:, 0] - 1) / 3, 0, 1)
    from scipy.ndimage import median_filter
    path = median_filter(path, size=9, mode="nearest")
    # 30 fps
    tg = np.arange(np.ceil(a.a * FPS), np.floor(a.b * FPS) + 1) / FPS
    idx = np.clip(np.searchsorted(tf, tg), 0, nfr - 1)
    # varmuus keskiarvoistetaan kolmen kehyksen yli
    from scipy.ndimage import uniform_filter1d
    conf_s = uniform_filter1d(conf, 5)
    om, oc = midi[idx], conf_s[idx]
    pv = np.zeros(len(tg))
    ratio = (pk / mean[:, 0])[idx]
    voiced = (ratio >= a.peak_ratio) & (rms_f[idx] >= np.percentile(rms_f, 10))
    # lyhyet (<4 ruutua) äänelliset pätkät pois
    v = voiced.astype(int)
    i = 0
    while i < len(v):
        if v[i]:
            k = i
            while k < len(v) and v[k]:
                k += 1
            if k - i < 4:
                v[i:k] = 0
            i = k
        else:
            i += 1
    voiced = v.astype(bool)
    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    Path(a.out).write_text(json.dumps({
        "lahde": "analysis/viuluviiva.py: CQT-harmoninen summa G3-E7 + Viterbi + PANNs-viulu", "side": a.side, "fps": FPS,
        "t0": round(float(tg[0]), 4), "midi": [round(float(x), 2) if ok else None for x, ok in zip(om, voiced)],
        "varmuus": [round(float(x), 2) for x in oc]}, ensure_ascii=False), encoding="utf-8")
    print(f"{len(tg)} ruutua, sävel {voiced.mean()*100:.1f} % -> {a.out}")

    names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    nm = lambda x: f"{names[int(round(x)) % 12]}{int(round(x)) // 12 - 1}"
    def table(s0, s1):
        print(f"\n t(s)  midi  nuotti  varmuus  panns")
        for t in np.arange(s0, s1 + 0.1, 2.0):
            k = int(round((t - tg[0]) * FPS))
            if 0 <= k < len(tg):
                print(f"{t:6.0f}  " + (f"{om[k]:5.1f}  {nm(om[k]):5s}" if voiced[k] else "  -     -   ") + f"   {oc[k]:.2f}    {pv[k]:.2f}")
    table(422, 470)
    table(802, 840)

    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    fig, ax = plt.subplots(figsize=(18, 6), dpi=110)
    sc = ax.scatter(tg[voiced], om[voiced], c=oc[voiced], s=2, cmap="viridis", vmin=0, vmax=1)
    ax.set_ylim(LO, HI); ax.set_xlim(a.a, a.b); ax.set_xlabel("aika (s, A-puoli)"); ax.set_ylabel("midi")
    fig.colorbar(sc, label="varmuus"); ax.grid(alpha=.3)
    fig.savefig(str(Path(a.out).with_suffix(".png")), bbox_inches="tight")


if __name__ == "__main__":
    main()
