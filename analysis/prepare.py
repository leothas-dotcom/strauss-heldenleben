"""Vaihe 0: esikäsittely.

Leikkaa LP-puolelta pätkän ja tekee siitä kolme tiedostoa:
  soundtrack.wav  ääniraita, 48 kHz stereo, rahina säilyy
  orig_mono.wav     mono, käsittelemätön
  declick_mono.wav  mono, naksahdukset poistettu (orig - declick = naksahdukset)
  clean_mono.wav    mono, naksahdukset ja kohina poistettu (analyysiä varten;
                    declick - clean = sihinä)
  clean_44k.wav     sama 44,1 kHz:llä (näytönohjaimen mallit: Demucs, CLAP, beat_this)

Kohinanpoisto (afftdn) viivästää ääntä; viive mitataan ristikorrelaatiolla ja korjataan,
joten kaikki tiedostot ovat samassa ajassa ääniraidan kanssa.

Pintakohinan taso mitataan saman puolen loppuurasta.

Demo:  python -I analysis/prepare.py --side 1 --start 0 --duration 60 --out build/demo
"""
import argparse
import json
import shutil
import subprocess
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy import signal

ROOT = Path(__file__).resolve().parent.parent
SR = 22050
# Pelkkää loppuuraa kummallakin puolella: (alku s, kesto s).
RUNOUT = {1: (1240.0, 50.0), 2: (1400.0, 60.0)}
MONO = "pan=mono|c0=0.5*c0+0.5*c1"


def ffmpeg(*args):
    exe = shutil.which("ffmpeg")
    if not exe:
        raise SystemExit("ffmpeg puuttuu (aja setup.ps1)")
    subprocess.run([exe, "-v", "error", "-y", *args], check=True)


def extract(src, start, dur, af, out, sr, channels):
    ffmpeg("-ss", f"{start}", "-t", f"{dur}", "-i", str(src),
           "-af", af, "-ar", str(sr), "-ac", str(channels), "-c:a", "pcm_f32le", str(out))


def rms_db(x):
    return float(20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12))


def align_to(reference, path, max_lag_s=0.2):
    """Siirtää tiedoston path alkuperäisen (reference) kohdalle; palauttaa viiveen näytteinä."""
    ref, sr = sf.read(reference, dtype="float32")
    x, _ = sf.read(path, dtype="float32")
    seg = slice(0, min(len(ref), len(x), sr * 10))
    c = signal.correlate(ref[seg], x[seg], mode="full", method="fft")
    mid, m = len(c) // 2, int(max_lag_s * sr)
    lag = int(np.argmax(c[mid - m: mid + m + 1])) - m
    if lag:
        x = np.roll(x, lag)
        if lag < 0:
            x[lag:] = 0
        sf.write(path, x, sr, subtype="FLOAT")
    return lag


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--side", type=int, choices=(1, 2), required=True)
    ap.add_argument("--start", type=float, default=0.0)
    ap.add_argument("--duration", type=float, required=True)
    ap.add_argument("--out", type=Path, required=True)
    a = ap.parse_args()

    src = ROOT / "audio" / "lp_krauss" / f"side{a.side}.flac"
    out = a.out if a.out.is_absolute() else ROOT / a.out
    out.mkdir(parents=True, exist_ok=True)

    # Pintakohinan taso loppuurasta (sama monomiksaus kuin analyysikopiossa).
    ro_start, ro_dur = RUNOUT[a.side]
    runout = out / "runout_mono.wav"
    extract(src, ro_start, ro_dur, MONO, runout, SR, 1)
    noise_floor_db = rms_db(sf.read(runout, dtype="float32")[0])
    runout.unlink()
    nf = int(np.clip(round(noise_floor_db), -80, -20))  # afftdn hyväksyy -80..-20 dB

    extract(src, a.start, a.duration, "anull", out / "soundtrack.wav", 48000, 2)
    extract(src, a.start, a.duration, f"{MONO},aresample=44100", out / "orig_mono.wav", SR, 1)
    extract(src, a.start, a.duration, f"{MONO},aresample=44100,adeclick", out / "declick_mono.wav", SR, 1)
    clean_af = f"{MONO},aresample=44100,adeclick,afftdn=nf={nf}:tn=1"
    extract(src, a.start, a.duration, clean_af, out / "clean_mono.wav", SR, 1)
    extract(src, a.start, a.duration, clean_af, out / "clean_44k.wav", 44100, 1)
    extract(src, a.start, a.duration, f"{MONO},aresample=44100", out / "orig_44k.wav", 44100, 1)

    lags = {
        "declick_mono": align_to(out / "orig_mono.wav", out / "declick_mono.wav"),
        "clean_mono": align_to(out / "orig_mono.wav", out / "clean_mono.wav"),
        "clean_44k": align_to(out / "orig_44k.wav", out / "clean_44k.wav"),
    }
    (out / "orig_44k.wav").unlink()

    meta = {
        "side": a.side,
        "start": a.start,
        "duration": a.duration,
        "sr": SR,
        "noise_floor_db": round(noise_floor_db, 2),
        "afftdn_nf": nf,
        "runout": {"start": ro_start, "duration": ro_dur},
        "files": ["soundtrack.wav", "orig_mono.wav", "declick_mono.wav", "clean_mono.wav", "clean_44k.wav"],
        "corrected_lag_samples": lags,
    }
    (out / "prepare.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
    print(f"Pintakohina {noise_floor_db:.1f} dBFS (loppuura), afftdn nf={nf}")
    print("Korjatut viiveet (näytettä): " + ", ".join(f"{k} {v}" for k, v in lags.items()))
    print(f"Valmis: {out}")


if __name__ == "__main__":
    main()
