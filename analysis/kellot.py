"""Kellotarkistus: soivatko johdetut äänitiedostot samaa aikaa kuin alkuperäinen FLAC.

Kaikki ajat (teemakartta, kuunteluopas, cues.json, video) ilmoitetaan alkuperäisen FLACin
ajassa (puolen oma aika, 0 = tiedoston alku). Analyysi tehdään kuitenkin johdetuista
tiedostoista (prepare.py: monoksi muunnettu, naksahdukset ja kohina poistettu, näytetaajuus
muutettu; Demucs-stemmit; kuuntelukopiot). Tämä työkalu mittaa jokaisesta tiedostosta
ristikorrelaatiolla useassa kohdassa, kuinka paljon sama ääni on myöhässä (+) tai etuajassa (-)
alkuperäiseen verrattuna, ja laskee ajautumisen (soiko tiedosto eri vauhtia, ppm).

Alkuperäinen luetaan suoraan soundfilellä (ei ffmpegiä), joten vertailu on riippumaton
prepare.py:n leikkauksesta. Molemmat muunnetaan 8 kHz:iin; erottelu noin 0,1 ms.

    python -I analysis/kellot.py build/demo400 [build/A2 ...]
    python -I analysis/kellot.py --file build/kuuntelu/A_puoli_kuuntelu.wav --side 1 --start 0
    python -I analysis/kellot.py --file video_aani.wav --ref build/kuuntelu/A_puoli_kuuntelu.wav --start 211
      (--ref: vertailu sovittuun totuuteen eli kuuntelukopioon; --start = tiedoston alku vertailun ajassa)
"""
import argparse
import json
import sys
from fractions import Fraction
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import correlate, resample_poly

ROOT = Path(__file__).resolve().parent.parent
import sys as _sys
_sys.path.insert(0, str(Path(__file__).resolve().parent))
from lahde import FILES  # lähdeääni audio/lahde.json:sta (nopeuskorjattu siirto)  # noqa: E402
FS = 8000
WIN, MARGIN = 6.0, 0.5  # vertailuikkuna ja haettava siirtymä (s)
SILENT_DB = -45.0       # hiljaisia ikkunoita (esim. yleistauko) ei mitata


def read(path, t0, t1):
    """Mono 8 kHz:llä; path voi olla myös lista (stemmit summataan takaisin miksaukseksi)."""
    paths = path if isinstance(path, list) else [path]
    info = sf.info(str(paths[0]))
    a, b = max(0, int(round(t0 * info.samplerate))), int(round(t1 * info.samplerate))
    y = sum(sf.read(str(q), start=a, stop=min(b, info.frames), dtype="float32", always_2d=True)[0].mean(axis=1)
            for q in paths)
    sr = info.samplerate
    fr = Fraction(FS, sr).limit_denominator(1000)
    return resample_poly(y, fr.numerator, fr.denominator).astype(np.float64), a / info.samplerate


def offset_at(orig, side_start, path, tc):
    """Ero (ms) = tiedoston aika - alkuperäisen aika samalle äänelle, ikkunassa tc..tc+WIN (paketin aikaa)."""
    d, _ = read(path, tc, tc + WIN)
    if len(d) < WIN * FS * 0.9 or 20 * np.log10(np.sqrt(np.mean(d ** 2)) + 1e-12) < SILENT_DB:
        return None, None
    o, o0 = read(orig, side_start + tc - MARGIN, side_start + tc + WIN + MARGIN)
    d = d - d.mean()
    o = o - o.mean()
    c = correlate(o, d, mode="valid")
    # normitus: liukuva energia alkuperäisestä
    e = np.sqrt(np.convolve(o ** 2, np.ones(len(d)), mode="valid") * np.sum(d ** 2)) + 1e-12
    r = c / e
    k = int(np.argmax(r))
    frac = 0.0
    if 0 < k < len(r) - 1:
        y0, y1, y2 = r[k - 1], r[k], r[k + 1]
        den = y0 - 2 * y1 + y2
        frac = 0.5 * (y0 - y2) / den if den else 0.0
    orig_start_pkg = o0 - side_start  # ikkunan alku paketin ajassa (leikkaus alkuun)
    return 1000 * (tc - (orig_start_pkg + (k + frac) / FS)), float(r[k])


def check(path, side, start, times, label, ref=None):
    orig = ref or FILES[side]
    rows = []
    for tc in times:
        ms, r = offset_at(orig, start, path, tc)
        rows.append((tc, ms, r))
    ok = [(tc, ms) for tc, ms, r in rows if ms is not None and r > 0.5]
    drift = None
    if len(ok) >= 2:
        x, y = np.array(ok).T
        drift = np.polyfit(x, y, 1)[0] * 1000  # ms/s -> ppm
    cells = "  ".join(f"{tc:6.0f}s:{'   hiljaa' if ms is None else f'{ms:+7.2f} ms ({r:.2f})'}" for tc, ms, r in rows)
    worst = max((abs(ms) for _, ms in ok), default=float("nan"))
    print(f"{label:<34} suurin ero {worst:6.2f} ms, ajautuminen {'-' if drift is None else f'{drift:+.1f} ppm'}")
    print(f"    {cells}")
    return worst, drift


def times_for(dur):
    n = max(3, int(dur // 60) + 1)
    return [round(float(t), 1) for t in np.linspace(5, dur - WIN - 2, n)]


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser()
    ap.add_argument("packages", nargs="*")
    ap.add_argument("--file")
    ap.add_argument("--side", type=int)
    ap.add_argument("--start", type=float, default=0.0)
    ap.add_argument("--ref", help="vertailutiedosto (oletus alkuperäinen FLAC)")
    a = ap.parse_args()
    print(f"Ero = tiedoston aika - {Path(a.ref).name if a.ref else 'alkuperäisen FLACin'} aika samalle äänelle (+ = myöhässä). Suluissa korrelaatio.")
    bad = 0
    if a.file:
        dur = sf.info(a.file).duration
        w, _ = check(a.file, a.side, a.start, times_for(dur), Path(a.file).name, a.ref)
        bad += not (w < 2)
    for p in a.packages:
        p = Path(p)
        meta = json.loads((p / "prepare.json").read_text(encoding="utf-8"))
        side, start, dur = meta["side"], meta["start"], meta["duration"]
        print(f"\n== {p}  (puoli {'AB'[side - 1]}, alkaa {start:.1f} s alkuperäisessä, kesto {dur:.0f} s)")
        stems = sorted((p / "stems").glob("*.wav"))
        for f in [p / f for f in meta["files"]] + stems:
            if not f.exists():
                print(f"{f.name:<34} puuttuu")
                continue
            info = sf.info(str(f))
            if abs(info.duration - dur) > 0.05:
                print(f"{f.name:<34} kesto {info.duration:.3f} s (odotettu {dur:.3f})")
                bad += 1
        # yksittäinen stemmi voi olla hiljaa tai erota miksauksesta; niiden summa on Demucsin syöte
        targets = [(p / f, f"{f} ({sf.info(str(p / f)).samplerate} Hz)") for f in meta["files"] if (p / f).exists()]
        if stems:
            targets.append((stems, f"stems: {'+'.join(f.stem for f in stems)}"))
        for f, label in targets:
            w, _ = check(f, side, start, times_for(dur), label)
            bad += not (w < 2)
    print(f"\n{'KAIKKI SAMASSA AJASSA (ero alle 2 ms)' if not bad else f'{bad} tiedostoa poikkeaa yli 2 ms'}")


if __name__ == "__main__":
    main()
