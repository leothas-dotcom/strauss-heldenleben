"""Vaihe 1: analyysi (taso A).

Laskee piirteet täsmälleen videon ruutunopeudella: hop = 22050 / 30 = 735 näytettä,
eli ruutu i vastaa aikaa i / 30 s. Lukee prepare.py:n tulosteet ja kirjoittaa:
  analysis.json  metatiedot, kanavien nimet, attakit, sävellajit
  analysis.f32   ruutudata (ruudut x kanavat, float32)
  patina.json    levyn naksahdukset ja sihinä (kuvan patinaa varten)
  plots/overview.png  tarkistuskuva

Demo:  python -I analysis/analyze.py build/demo
"""
import argparse
import json
import time
from pathlib import Path

import librosa
import numpy as np
import scipy.ndimage as ndi
import scipy.signal as sps
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
FPS = 30
SR = 22050
HOP = SR // FPS  # 735
N_FFT = 2048
CHROMA_HOP = 256  # CQT vaatii kahden potenssin monikerran; interpoloidaan ruutuihin

# Rekisterikaistat nimetään rekisterin, ei soittimen mukaan.
BANDS = [(20, 60), (60, 250), (250, 500), (500, 2000), (2000, 4000), (4000, 10000)]
BAND_NAMES = ["sub", "matala", "matala_keski", "keski", "korkea_keski", "korkea"]
PITCHES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"]
# Krumhansl–Kessler-sävellajiprofiilit.
KK_MAJOR = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
KK_MINOR = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])


def envelope(x, attack_s=0.03, release_s=0.3):
    """Attack/release-verhokäyrä: nousee nopeasti, laskee hitaasti (kuva ei värise)."""
    att = 1 - np.exp(-1 / (attack_s * FPS))
    rel = 1 - np.exp(-1 / (release_s * FPS))
    y = np.empty_like(x)
    acc = x[0]
    for i, v in enumerate(x):
        acc += (att if v > acc else rel) * (v - acc)
        y[i] = acc
    return y


def pnorm(x, lo=5, hi=99, mask=None):
    """Persentiilinormalisointi 0..1; mask = ruudut, joista persentiilit lasketaan."""
    ref = x if mask is None else x[..., mask]
    a, b = np.nanpercentile(ref, [lo, hi])
    return np.clip((x - a) / (b - a + 1e-9), 0, 1)


def fit(x, n):
    """Pituus täsmälleen n ruutua."""
    return x[..., :n] if x.shape[-1] >= n else np.pad(x, [(0, 0)] * (x.ndim - 1) + [(0, n - x.shape[-1])], mode="edge")


def key_profiles():
    profs, names = [], []
    for mode, base in (("duuri", KK_MAJOR), ("molli", KK_MINOR)):
        for k in range(12):
            p = np.roll(base, k)
            profs.append((p - p.mean()) / p.std())
            names.append(f"{PITCHES[k]} {mode}")
    return np.array(profs), names


def novelty_curve(feats, n, half_s=4.0, rate=5):
    """Rakenteen muutoskohdat: itsesamankaltaisuusmatriisi + shakkilautaydin."""
    step = FPS // rate
    f = feats[:, ::step]
    f = f / (np.linalg.norm(f, axis=0, keepdims=True) + 1e-9)
    ssm = f.T @ f
    L = int(half_s * rate)
    g = np.outer(sps.windows.gaussian(2 * L, L / 2), sps.windows.gaussian(2 * L, L / 2))
    kernel = g * np.kron([[1, -1], [-1, 1]], np.ones((L, L)))
    pad = np.pad(ssm, L, mode="reflect")
    nov = np.array([np.sum(pad[i:i + 2 * L, i:i + 2 * L] * kernel) for i in range(ssm.shape[0])])
    nov = np.clip(nov, 0, None)
    return pnorm(np.interp(np.arange(n), np.arange(len(nov)) * step, nov), 0, 100)


def align_lag(a, b, max_lag=4000):
    """Viive, jolla b osuu a:n kohdalle (ffmpeg-suotimet voivat viivästää)."""
    seg = slice(0, min(len(a), len(b), SR * 10))
    c = sps.correlate(a[seg], b[seg], mode="full", method="fft")
    mid = len(c) // 2
    window = c[mid - max_lag: mid + max_lag + 1]
    return int(np.argmax(window)) - max_lag


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("dir", type=Path)
    a = ap.parse_args()
    d = a.dir if a.dir.is_absolute() else ROOT / a.dir
    prep = json.loads((d / "prepare.json").read_text(encoding="utf-8"))
    t0 = time.time()

    orig, sr = sf.read(d / "orig_mono.wav", dtype="float32")
    declick, _ = sf.read(d / "declick_mono.wav", dtype="float32")
    clean, _ = sf.read(d / "clean_mono.wav", dtype="float32")
    assert sr == SR
    # ffmpeg-suotimet viivästävät; siirretään käsitellyt versiot alkuperäisen kohdalle.
    lag_declick, lag_clean = align_lag(orig, declick), align_lag(orig, clean)
    declick, clean = np.roll(declick, lag_declick), np.roll(clean, lag_clean)
    n = 1 + len(clean) // HOP
    times = np.arange(n) / FPS

    def frame_db(y):
        return 20 * np.log10(fit(librosa.feature.rms(y=y, frame_length=N_FFT, hop_length=HOP)[0], n) + 1e-10)

    # --- Musiikin alku: taso pysyy yli 10 dB pintakohinan yläpuolella sekunnin ajan ---
    # (erottaa musiikin sisäänajouran rahinasta ja neulan laskeutumisesta)
    above = ndi.uniform_filter1d((frame_db(declick) - prep["noise_floor_db"] > 10).astype(float), size=FPS) > 0.9
    start_frame = max(int(np.argmax(above)) - FPS // 2, 0) if above.any() else 0
    music = np.arange(n) >= start_frame

    # --- Voimakkuus suhteessa levyn pintakohinaan ---
    rel_db = frame_db(clean) - prep["noise_floor_db"]
    loud_raw = np.where(music, np.clip(rel_db / np.percentile(rel_db[music], 99), 0, 1), 0)
    loudness = envelope(loud_raw)

    # --- Spektri, sointiväri, rekisterikaistat ---
    S = fit(np.abs(librosa.stft(clean, n_fft=N_FFT, hop_length=HOP)), n)
    freqs = librosa.fft_frequencies(sr=SR, n_fft=N_FFT)
    centroid = fit(librosa.feature.spectral_centroid(S=S, sr=SR)[0], n)
    bandwidth = fit(librosa.feature.spectral_bandwidth(S=S, sr=SR)[0], n)
    flatness = fit(librosa.feature.spectral_flatness(S=S)[0], n)
    power = S ** 2
    bands = np.array([pnorm(10 * np.log10(power[(freqs >= lo) & (freqs < hi)].sum(axis=0) + 1e-12), mask=music)
                      for lo, hi in BANDS])
    # Rekisterin painopiste (log-taajuus 50 Hz – 4 kHz): karkea arvio siitä, millä korkeudella
    # soiva massa on. Teemojen todelliset melodiakaaret tulevat partituurista (themes.json).
    sel = (freqs >= 50) & (freqs <= 4000)
    reg = (np.log2(freqs[sel])[:, None] * power[sel]).sum(axis=0) / (power[sel].sum(axis=0) + 1e-12)
    register = pnorm(reg, 2, 98, mask=music)

    # --- Attakit (vain musiikin ajalta) ---
    flux = fit(librosa.onset.onset_strength(y=clean, sr=SR, hop_length=HOP), n) * music
    onsets = librosa.onset.onset_detect(onset_envelope=flux, sr=SR, hop_length=HOP, units="time")

    # --- Harmonia: chroma, tonnetz, sävellaji ja jännite ---
    chroma_hi = librosa.feature.chroma_cqt(y=clean, sr=SR, hop_length=CHROMA_HOP)
    t_hi = np.arange(chroma_hi.shape[1]) * CHROMA_HOP / SR
    chroma = np.array([np.interp(times, t_hi, row) for row in chroma_hi])
    tonnetz = librosa.feature.tonnetz(chroma=chroma)
    profs, key_names = key_profiles()
    cs = ndi.uniform_filter1d(chroma, size=2 * FPS, axis=1)  # 2 s ikkuna
    cz = (cs - cs.mean(axis=0)) / (cs.std(axis=0) + 1e-9)
    corr = profs @ cz / 12  # (24, n), korrelaatio -1..1
    best = corr.argmax(axis=0)
    key_clarity = corr.max(axis=0)
    tension = 1 - pnorm(key_clarity, mask=music)
    eb_major = corr[key_names.index("Eb duuri")]

    # --- Rakenne ja tempo ---
    mfcc = fit(librosa.feature.mfcc(S=librosa.power_to_db(power), n_mfcc=13), n)
    novelty = novelty_curve(np.vstack([cs, (mfcc - mfcc.mean(1, keepdims=True)) / (mfcc.std(1, keepdims=True) + 1e-9)]), n)
    tempo = fit(librosa.feature.tempo(onset_envelope=flux, sr=SR, hop_length=HOP, aggregate=None), n)

    # --- Melodia (pYIN): unisonot ja soolot ---
    f0, _, vprob = librosa.pyin(clean, fmin=librosa.note_to_hz("C2"), fmax=librosa.note_to_hz("C7"),
                                sr=SR, frame_length=N_FFT, hop_length=HOP)
    f0, vprob = fit(f0, n), fit(vprob, n)
    f0_midi = np.where(np.isfinite(f0), librosa.hz_to_midi(np.nan_to_num(f0, nan=1.0)), -1.0)

    # --- Patina: levyn oma ääni ---
    # naksahdukset = alkuperäinen - declick, sihinä = declick - puhdistettu
    hpf = sps.butter(4, 2000, "highpass", fs=SR, output="sos")
    click_res = sps.sosfiltfilt(hpf, orig - declick)
    hiss = pnorm(frame_db(sps.sosfiltfilt(hpf, declick - clean)), mask=music)
    # Naksahdus = poistettu impulssi, joka on voimakkaampi kuin pintakohinan taso.
    thr = 10 ** (prep["noise_floor_db"] / 20)
    peaks, props = sps.find_peaks(np.abs(click_res), height=thr, distance=int(SR * 0.01))
    click_t = peaks / SR
    click_s = np.clip(props["peak_heights"] / (thr * 8), 0, 1)

    # --- Tallennus ---
    channels = {
        "loudness": loudness, "loudness_raw": loud_raw, "rel_db": rel_db,
        "flux": pnorm(flux), "centroid": pnorm(centroid), "register": register, "bandwidth": pnorm(bandwidth),
        "flatness": pnorm(flatness),
        **{f"band_{nm}": b for nm, b in zip(BAND_NAMES, bands)},
        **{f"chroma_{p}": c for p, c in zip(PITCHES, chroma)},
        **{f"tonnetz_{i}": t for i, t in enumerate(tonnetz)},
        "key_clarity": key_clarity, "tension": tension, "eb_major": eb_major,
        "novelty": novelty, "tempo": tempo, "f0_midi": f0_midi, "voiced_prob": np.nan_to_num(vprob),
        "hiss": hiss,
    }
    data = np.stack([np.asarray(v, dtype=np.float32) for v in channels.values()], axis=1)
    data.tofile(d / "analysis.f32")

    keys_5s = []
    for s in range(0, n, 5 * FPS):
        vals, counts = np.unique(best[s:s + 5 * FPS], return_counts=True)
        keys_5s.append({"t": round(s / FPS + prep["start"], 1), "key": key_names[vals[counts.argmax()]],
                        "clarity": round(float(key_clarity[s:s + 5 * FPS].mean()), 2)})

    meta = {
        "fps": FPS, "sr": SR, "hop": HOP, "frames": n,
        "side": prep["side"], "start": prep["start"], "duration": prep["duration"],
        "noise_floor_db": prep["noise_floor_db"],
        "music_start": round(start_frame / FPS + prep["start"], 3),
        "align_lag_samples": {"declick": lag_declick, "clean": lag_clean},
        "channels": list(channels.keys()), "dtype": "float32", "layout": "frames x channels",
        "onsets": [round(float(t) + prep["start"], 3) for t in onsets],
        "keys_5s": keys_5s,
        "notes": "Normalisointi on tässä pätkän sisäinen; koko teoksessa normalisoidaan koko äänitteen yli.",
    }
    (d / "analysis.json").write_text(json.dumps(meta, indent=1, ensure_ascii=False), encoding="utf-8")
    (d / "patina.json").write_text(json.dumps({
        "threshold": thr,
        "clicks": [[round(float(t) + prep["start"], 4), round(float(s), 3)] for t, s in zip(click_t, click_s)],
    }), encoding="utf-8")

    plot(d, prep, times, orig, clean, channels, onsets, click_t, click_s, keys_5s, chroma, bands, start_frame)

    dur = music.sum() / FPS
    voiced = np.mean(vprob[music] > 0.5)
    print(f"Ruutuja {n} ({n / FPS:.1f} s), {data.shape[1]} kanavaa, aikaa {time.time() - t0:.0f} s")
    print(f"Musiikki alkaa {start_frame / FPS + prep['start']:.2f} s; viive declick {lag_declick}, "
          f"puhdistettu {lag_clean} näytettä")
    print(f"Pintakohina {prep['noise_floor_db']} dBFS; voimakkuus kohinan yläpuolella "
          f"mediaani {np.median(rel_db[music]):.1f} dB, huippu {rel_db.max():.1f} dB")
    print(f"Attakeja {len(onsets)} ({len(onsets) / dur * 60:.0f}/min), "
          f"naksahduksia {len(click_t)} ({len(click_t) / (n / FPS) * 60:.0f}/min)")
    print(f"Melodia soinnillinen {voiced:.0%} musiikkiruuduista; "
          f"tempoarvio mediaani {np.median(tempo[music]):.0f} BPM (suuntaa antava, rubato)")
    print("Sävellajit 5 s jaksoissa: " + ", ".join(f"{k['t']:.0f}s {k['key']} ({k['clarity']})" for k in keys_5s))


def plot(d, prep, times, orig, clean, ch, onsets, click_t, click_s, keys_5s, chroma, bands, start_frame):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    off = prep["start"]
    t = times + off
    paper, blue, red, black, gold = "#E8DCC6", "#143E66", "#F5461A", "#1F1A18", "#C9A24D"
    fig, ax = plt.subplots(8, 1, figsize=(16, 20), sharex=True, facecolor=paper,
                           gridspec_kw={"height_ratios": [1.2, 1, 1, 1.4, 1, 1, 1.3, 0.8]})
    music_t = start_frame / FPS + off
    for x in ax:
        x.set_facecolor(paper)
        x.axvspan(off, music_t, color="#9A8B76", alpha=0.25, lw=0)
        for s in x.spines.values():
            s.set_color(black)
    ax[1].text(off + 0.2, 0.9, "sisäänajoura", fontsize=8, color=black)

    ds = 50
    tw = np.arange(0, len(orig), ds) / SR + off
    ax[0].plot(tw, orig[::ds], color="#9A8B76", lw=0.4, label="alkuperäinen (rahina)")
    ax[0].plot(tw, clean[::ds], color=blue, lw=0.4, label="puhdistettu")
    ax0b = ax[0].twinx()
    ax0b.plot(t, ch["loudness"], color=red, lw=1.6, label="voimakkuus (verhokäyrä)")
    ax0b.set_ylim(0, 1.05)
    ax[0].set_title(f"LP-puoli {prep['side']}, {off:.0f}–{off + prep['duration']:.0f} s · pintakohina "
                    f"{prep['noise_floor_db']} dBFS", loc="left", color=black)
    ax[0].legend(loc="upper left", fontsize=8)
    ax0b.legend(loc="upper right", fontsize=8)

    ax[1].plot(t, ch["flux"], color=black, lw=0.7)
    ax[1].vlines(np.asarray(onsets) + off, 0, 1, color=red, lw=0.6, alpha=0.7)
    ax[1].set_ylabel("attakit")

    ax[2].imshow(bands, aspect="auto", origin="lower", cmap="Blues",
                 extent=[t[0], t[-1], -0.5, len(BAND_NAMES) - 0.5])
    ax[2].set_yticks(range(len(BAND_NAMES)), BAND_NAMES, fontsize=8)
    ax[2].set_ylabel("rekisteri")

    ax[3].imshow(chroma, aspect="auto", origin="lower", cmap="Oranges",
                 extent=[t[0], t[-1], -0.5, 11.5])
    ax[3].set_yticks(range(12), PITCHES, fontsize=8)
    for k in keys_5s:
        ax[3].text(k["t"] + 0.2, 11.2, k["key"], fontsize=7, color=black, va="top")
    ax[3].set_ylabel("chroma")

    ax[4].plot(t, ch["tension"], color=red, lw=1, label="harmoninen jännite")
    ax[4].plot(t, ch["eb_major"], color=gold, lw=1, label="Es-duuri-sopivuus")
    ax[4].legend(loc="upper right", fontsize=8)

    ax[5].plot(t, ch["centroid"], color=blue, lw=0.8, label="kirkkaus (painopiste)")
    ax[5].plot(t, ch["novelty"], color=black, lw=1, label="rakenteen muutos")
    ax[5].plot(t, ndi.gaussian_filter1d(ch["register"], 6), color=red, lw=1.2, label="rekisteri (pehmennetty)")
    ax[5].legend(loc="upper right", fontsize=8)

    m = ch["voiced_prob"] > 0.5
    ax[6].scatter(t[m], ch["f0_midi"][m], s=3, c=ch["voiced_prob"][m], cmap="Reds", vmin=0.5, vmax=1)
    ax[6].set_ylim(36, 96)
    ax[6].set_yticks(range(36, 97, 12), [f"C{o}" for o in range(2, 8)])
    ax[6].set_ylabel("melodia (pYIN)")

    ax[7].plot(t, ch["hiss"], color="#9A8B76", lw=0.8)
    ax[7].vlines(click_t + off, 0, click_s, color=black, lw=0.5)
    ax[7].set_ylabel("patina")
    ax[7].set_xlabel("aika (s)")

    fig.tight_layout()
    (d / "plots").mkdir(exist_ok=True)
    fig.savefig(d / "plots" / "overview.png", dpi=90, facecolor=paper)


if __name__ == "__main__":
    main()
