"""Kuka soittaa: rekisterit ja sävelet kohinatason yläpuolella (alkuperäinen FLAC).

Ohuessa tekstuurissa soittimen voi tunnistaa rekisteristä ja sävelistä, kun spektriä verrataan
levyn omaan kohinaan (sisäänajoura, jossa ei ole musiikkia). Taajuus "soi", kun se on yli 12 dB
kohinan yläpuolella. Kaistat:
  matala 40-220 Hz      tuubat, fagotit, sellot ja kontrabassot, patarummut
  keski 220-1000 Hz     oboe, englannintorvi, klarinetit, käyrätorvet, alttoviulut
  korkea 1000-3500 Hz   huilut, pikkuhuilu, viulut korkealla
Laajakaistainen kohina 6-16 kHz on joko lautasia tai levyn naksahduksia: naksahdus kestää alle
10 ms (tarkistetaan purskeen kestosta), lautaset satoja millisekunteja.

Tulos on luettava taulukko sekunnin välein: montako taajuutta soi kullakin kaistalla ja
voimakkaimmat sävelet (nuottinimi ja dB kohinan yli).

    python -I analysis/rekisteri.py --side 1 --from 242 --to 300 [--step 1.0]
"""
import argparse
import sys
from pathlib import Path

import librosa
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
# lähdeääni ja kohinan vertailukohta (A: sisäänajoura 0:04-0:07.2; B: loppuura 23:20) audio/lahde.json:sta,
# korjatun siirron aikaan skaalattuina
from lahde import FILES, NOISE  # noqa: E402
BANDS = [("matala", 40, 220), ("keski", 220, 1000), ("korkea", 1000, 3500)]
N, H = 16384, 4800


def load(path, t0, t1):
    info = sf.info(path)
    y, sr = sf.read(path, start=int(t0 * info.samplerate), stop=int(t1 * info.samplerate), dtype="float32")
    return (y.mean(axis=1) if y.ndim > 1 else y), info.samplerate


def spec(y):
    win = np.hanning(N)
    return np.array([np.abs(np.fft.rfft(win * y[i:i + N])) ** 2 for i in range(0, max(1, len(y) - N), H)])


def peaks(row, f, lo, hi, k=2, thr=15):
    idx = np.where((f >= lo) & (f < hi))[0]
    out = []
    for j in np.argsort(row[idx])[::-1]:
        if row[idx[j]] < thr:
            break
        fr = f[idx[j]]
        if all(abs(librosa.hz_to_midi(fr) - librosa.hz_to_midi(o)) > 1.5 for o, _ in out):
            out.append((fr, row[idx[j]]))
        if len(out) >= k:
            break
    return " ".join(f"{librosa.midi_to_note(librosa.hz_to_midi(fr), unicode=False)}{v:+.0f}" for fr, v in out) or "-"


def burst_ms(y, sr):
    """Pisin yhtenäinen yli 12 dB:n jakso korkealla kaistalla (ms): naksahdus < 10 ms."""
    hp = sosfilt(butter(6, 6000, btype="high", fs=sr, output="sos"), y)
    w = max(1, int(0.005 * sr))
    env = np.sqrt(np.convolve(hp ** 2, np.ones(w) / w, mode="same"))
    db = 20 * np.log10(env + 1e-9)
    above = db > np.median(db) + 12
    best = cur = 0
    for a in above:
        cur = cur + 1 if a else 0
        best = max(best, cur)
    return 1000 * best / sr


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser()
    ap.add_argument("--side", type=int, required=True)
    ap.add_argument("--from", dest="t0", type=float, required=True)
    ap.add_argument("--to", dest="t1", type=float, required=True)
    ap.add_argument("--step", type=float, default=1.0)
    a = ap.parse_args()
    path = FILES[a.side]
    yn, sr = load(path, *NOISE[a.side])
    f = np.fft.rfftfreq(N, 1 / sr)
    nref = np.median(spec(yn), axis=0) + 1e-20
    y, _ = load(path, a.t0, a.t1 + N / sr)
    S = spec(y)
    times = a.t0 + (np.arange(len(S)) * H + N / 2) / sr
    R = 10 * np.log10(S / nref + 1e-20)
    print(f"Puoli {'AB'[a.side - 1]}, {a.t0:.1f}-{a.t1:.1f} s. Soivia taajuuksia (yli 12 dB kohinan yli) / voimakkaimmat sävelet.")
    print("aika     | matala 40-220        | keski 220-1000            | korkea 1-3.5 kHz          | 6-16 kHz purske")
    for t in np.arange(a.t0, a.t1, a.step):
        k = (times >= t) & (times < t + a.step)
        if not k.any():
            continue
        row = R[k].mean(axis=0)
        cells = []
        for _, lo, hi in BANDS:
            m = (f >= lo) & (f < hi)
            cells.append(f"{int((R[k][:, m] > 12).sum(axis=1).mean()):4d} {peaks(row, f, lo, hi):<19}")
        hm = (f >= 6000) & (f < 16000)
        hcount = int((R[k][:, hm] > 12).sum(axis=1).mean())
        seg = y[int((t - a.t0) * sr):int((t - a.t0 + a.step) * sr)]
        bt = f"{hcount:4d} ({burst_ms(seg, sr):.0f} ms)" if hcount > 10 else f"{hcount:4d}"
        m_, s_ = divmod(t, 60)
        print(f"{int(m_)}:{s_:04.1f}  | " + " | ".join(cells) + f" | {bt}")


if __name__ == "__main__":
    main()
