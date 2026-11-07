"""Iskut ja aksentit 10 ms:n tarkkuudella: missä pitkä fraasi saa iskun, ja mikä soitin sen lyö.

Analyysi tehdään puhdistetusta monokopiosta (clean_mono.wav, 22 050 Hz, hop 220 = 10 ms):
  * nuotinalkuvoimakkuus (log-mel, spektrivuo) koko kaistalla sekä matala (< 250 Hz),
    keski (250-2000 Hz) ja korkea (> 2000 Hz) kaista erikseen
  * isku = paikallinen huippu, joka erottuu ympäristöstään: z = (vuo - mediaani 3 s) / MAD 3 s
  * kontrasti = voimakkuuden nousu (dB) iskun jälkeen (0-80 ms) verrattuna edeltävään (-400...-50 ms):
    suuri kontrasti = isku hiljaisemman fraasin keskelle, pieni = aksentti tutissa
  * tyyppi kaistoista: tutti-isku (kaikki kaistat), matala isku / patarumpu (matala kaista,
    rumpustemmi), lautaset (korkea kaista ja rumpustemmi), aksentti (muu)
  * patarumpu: lyönnit rumpustemmistä (Demucs, jos ajettu), tiheät lyönnit (yli 7/s) = tremolo

Rajoitukset (rehellisesti): soitin on päätelmä kaistoista. Vaskien ja jousten iskua ei erota
ff-tutissa. Patarummun tremolosta ei saa yksittäisiä lyöntejä. Rumpustemmi on vain paketeissa,
joissa stemmit on ajettu (demo400).

Tulosteet: <paketti>/aksentit.json, aksentit.md (vahvimmat iskut aikajärjestyksessä)
    python -I analysis/aksentit.py build/demo400 [--top 80]
"""
import argparse
import json
from pathlib import Path

import librosa
import numpy as np
import soundfile as sf
from scipy.ndimage import maximum_filter1d, median_filter

SR = 22050
HOP = 220  # 10 ms


def mmss(t):
    m = int(t // 60)
    return f"{m}:{t - 60 * m:05.2f}"


def robust_z(x, win):
    med = median_filter(x, size=win, mode="nearest")
    mad = median_filter(np.abs(x - med), size=win, mode="nearest")
    return (x - med) / (1.4826 * mad + 1e-6)


def band_flux(y, sr):
    S = librosa.feature.melspectrogram(y=y, sr=sr, n_fft=2048, hop_length=HOP, n_mels=96, fmax=sr // 2)
    L = librosa.power_to_db(S, ref=np.max)
    freqs = librosa.mel_frequencies(n_mels=96, fmax=sr // 2)
    flux = np.maximum(0, np.diff(L, axis=1, prepend=L[:, :1]))
    bands = {"matala": freqs < 250, "keski": (freqs >= 250) & (freqs < 2000), "korkea": freqs >= 2000}
    out = {k: flux[m].mean(axis=0) for k, m in bands.items()}
    out["koko"] = flux.mean(axis=0)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("package", type=Path)
    ap.add_argument("--top", type=int, default=80, help="montako vahvinta iskua aksentit.md:hen")
    ap.add_argument("--zmin", type=float, default=5.0)
    a = ap.parse_args()
    d = a.package
    meta = json.loads((d / "analysis.json").read_text(encoding="utf-8"))
    start, music_start = meta["start"], meta.get("music_start", meta["start"])
    y, sr = sf.read(d / "clean_mono.wav", dtype="float32")
    assert sr == SR, sr
    fx = band_flux(y, sr)
    n = len(fx["koko"])
    rms = librosa.feature.rms(y=y, frame_length=1024, hop_length=HOP)[0][:n]
    db = 20 * np.log10(rms + 1e-5)
    win = int(3.0 * sr / HOP) | 1
    z = {k: robust_z(v, win) for k, v in fx.items()}

    # rumpustemmi (Demucs), jos saatavilla
    drum_z, strokes, rolls = None, [], []
    stem = d / "stems" / "drums.wav"
    if stem.exists():
        yd, srd = sf.read(stem, dtype="float32")
        yd = librosa.resample(yd if yd.ndim == 1 else yd.mean(axis=1), orig_sr=srd, target_sr=SR)
        od = librosa.onset.onset_strength(y=yd, sr=SR, hop_length=HOP)[:n]
        od = np.pad(od, (0, n - len(od)))
        drum_z = robust_z(od, win)
        rd = librosa.feature.rms(y=yd, frame_length=1024, hop_length=HOP)[0][:n]
        rd_db = 20 * np.log10(np.pad(rd, (0, n - len(rd))) + 1e-5)
        pk = librosa.util.peak_pick(od, pre_max=3, post_max=3, pre_avg=50, post_avg=50, delta=np.percentile(od, 90) * 0.5, wait=6)
        pk = [p for p in pk if drum_z[p] > 3.0 and rd_db[p] > np.percentile(rd_db, 60)]
        strokes = [round(start + p * HOP / SR, 3) for p in pk]
        # tremolo: lyöntejä yli 7/s vähintään 0,5 s
        i = 0
        while i < len(strokes):
            j = i
            while j + 1 < len(strokes) and strokes[j + 1] - strokes[j] < 1 / 7:
                j += 1
            if strokes[j] - strokes[i] >= 0.5:
                rolls.append([strokes[i], strokes[j]])
            i = j + 1

    # Levyn naksahdukset (patina.json) eivät ole iskuja: naksahdus kestää alle 10 ms, soittimen
    # isku nousee ja pysyy koholla kymmeniä millisekunteja. 30.10.2026 havaittu: ilman tätä viisi
    # teemakartan iskua (mm. 0:17.64, 0:27.40, 2:20.73) osui naksahdukseen.
    clicks = []
    if (d / "patina.json").exists():
        clicks = np.array([c[0] - start for c in json.loads((d / "patina.json").read_text(encoding="utf-8"))["clicks"]])
    # z on mielekäs vain, kun edellä on soittoa: hiljaisuuden jälkeen MAD -> 0 ja z paisuu
    floor = float(np.percentile(db, 5))
    # iskut: koko kaistan huiput, jotka erottuvat ympäristöstä
    zz = z["koko"]
    loc = (zz == maximum_filter1d(zz, size=13)) & (zz >= a.zmin)
    t_music = music_start - start
    acc, hylatyt = [], {"naksahdus": 0, "ei_kestoa": 0}
    for p in np.where(loc)[0]:
        t = p * HOP / SR
        if t < t_music:
            continue
        if len(clicks) and np.min(np.abs(clicks - t)) < 0.02:
            hylatyt["naksahdus"] += 1
            continue
        pre = db[max(0, p - 40):max(1, p - 5)]
        post = db[p:p + 8]
        sustain = db[p + 2:p + 8]  # 20-80 ms iskun jälkeen
        if len(pre) and len(sustain) and float(np.median(sustain) - pre.mean()) < 1.0 and float(post.max() - pre.mean()) < 3.0:
            hylatyt["ei_kestoa"] += 1
            continue
        jump = float(post.max() - pre.mean()) if len(pre) and len(post) else 0.0
        if len(pre) and pre.mean() < floor + 6:
            zz_p = min(float(zz[p]), 12.0)  # tauon jälkeinen ensimmäinen ääni: z ei ole vertailukelpoinen
        else:
            zz_p = float(zz[p])
        zb = {k: float(z[k][p]) for k in ("matala", "keski", "korkea")}
        dz = float(drum_z[p]) if drum_z is not None else None
        level = float(db[p:p + 8].max())
        if min(zb.values()) > 4 and jump > 4:
            typ = "tutti-isku"
        elif zb["matala"] > max(zb["keski"], zb["korkea"]) and (dz is None or dz > 3):
            typ = "matala isku (patarumpu/bassot)" if (dz is not None and dz > 3) else "matala isku"
        elif zb["korkea"] > max(zb["matala"], zb["keski"]) and dz is not None and dz > 4:
            typ = "lautaset/korkea isku"
        else:
            typ = "aksentti"
        dens = int(((np.arange(max(0, p - 200), p)) .size and (zz[max(0, p - 200):p] > 3).sum()) or 0)
        acc.append({"t": round(start + t, 3), "z": round(zz_p, 1), "kontrasti_db": round(jump, 1),
                    "taso_db": round(level, 1), "tyyppi": typ, "kaistat_z": {k: round(min(v, 99.0), 1) for k, v in zb.items()},
                    "rumpu_z": None if dz is None else round(dz, 1), "aksentteja_edelliset_2s": dens,
                    "pisteet": round(zz_p * max(1.0, jump / 6.0), 1)})
    print(f"hylätty: {hylatyt['naksahdus']} naksahdusta, {hylatyt['ei_kestoa']} ilman kestoa")
    # taso suhteessa koko pakettiin: kohtalokas isku = vahva kontrasti tai erittäin vahva z
    out = {"paketti": str(d).replace("\\", "/"), "hop_s": HOP / SR, "zmin": a.zmin,
           "aksentit": acc, "patarumpu": {"lyonnit": strokes, "tremolot": rolls}}
    (d / "aksentit.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    top = sorted(acc, key=lambda x: -x["pisteet"])[:a.top]
    lines = [f"# Iskut ja aksentit: {d.name} (puoli {meta['side']}, {mmss(start)}–{mmss(start + meta['duration'])})", "",
             f"{len(acc)} iskua (z >= {a.zmin}); alla {len(top)} vahvinta aikajärjestyksessä. Patarummun lyöntejä "
             f"{len(strokes)}, tremoloja {len(rolls)}.", "",
             "| Aika | Tyyppi | z | Kontrasti dB | Kaistat m/k/k | Rumpu z | Aksentteja 2 s ennen |", "|---|---|---|---|---|---|---|"]
    for x in sorted(top, key=lambda x: x["t"]):
        kb = x["kaistat_z"]
        lines.append(f"| {mmss(x['t'])} | {x['tyyppi']} | {x['z']} | {x['kontrasti_db']} | {kb['matala']}/{kb['keski']}/{kb['korkea']} "
                     f"| {x['rumpu_z'] if x['rumpu_z'] is not None else '–'} | {x['aksentteja_edelliset_2s']} |")
    if rolls:
        lines += ["", "**Patarummun tremolot:** " + ", ".join(f"{mmss(r[0])}–{mmss(r[1])}" for r in rolls)]
    (d / "aksentit.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"{d}: {len(acc)} iskua, {len(strokes)} patarummun lyöntiä, {len(rolls)} tremoloa -> aksentit.md")


if __name__ == "__main__":
    main()
