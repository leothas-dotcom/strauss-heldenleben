"""Musiikin jaksotus: taitekohdat ja jokaisen jakson kuvaus.

Taitekohdat haetaan yhdistelmästä: soitinperheiden aktiivisuus, voimakkuus, rekisteri,
attakkitiheys (tekstuuri), tempo ja sävysisältö (chroma). Piirteistä lasketaan
itsesamankaltaisuuden uutuuskäyrä (3 s shakkilautaydin), huiput vähintään 5 s välein, ja
rajat kohdistetaan lähimpään tahdin alkuun. Jokaiselle jaksolle kirjataan soittimet,
dynamiikka ja sen suunta, rekisteri, tekstuuri, tempo, sävellaji ja tapahtumat.

  python -I analysis/segments.py build/demo400   ->  segments.json, segments.md
"""
import argparse
import json
from pathlib import Path

import numpy as np
import scipy.ndimage as ndi
from scipy import signal

ROOT = Path(__file__).resolve().parent.parent
FPS = 30
FAMILIES = {
    "viulut": ["violin_fiddle"],
    "sellot ja bassot": ["cello", "double_bass"],
    "jouset": ["string_section", "bowed_string_instrument", "pizzicato"],
    "käyrätorvet": ["french_horn"],
    "trumpetit ja pasuunat": ["trumpet", "trombone", "brass_instrument"],
    "puupuhaltimet": ["wind_instrument_woodwind_instrument", "flute", "clarinet"],
    "lyömäsoittimet": ["timpani", "cymbal", "snare_drum", "bass_drum", "drum_roll"],
    "harppu": ["harp"],
    "tutti (orkesteri)": ["orchestra"],
}


def load(d, name):
    meta = json.loads((d / f"{name}.json").read_text(encoding="utf-8"))
    x = np.fromfile(d / f"{name}.f32", dtype=np.float32).reshape(meta["frames"], -1)
    return meta, {c: x[:, i] for i, c in enumerate(meta["channels"])}


def fmt(t):
    return f"{int(t // 60)}:{t % 60:04.1f}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("dir", type=Path)
    ap.add_argument("--min-len", type=float, default=5.0)
    a = ap.parse_args()
    d = a.dir if a.dir.is_absolute() else ROOT / a.dir
    am, ach = load(d, "analysis")
    lm, lch = load(d, "listen")
    beats = json.loads((d / "beats.json").read_text(encoding="utf-8"))
    events = json.loads((d / "events.json").read_text(encoding="utf-8"))["events"]
    n, start = am["frames"], am["start"]
    t = start + np.arange(n) / FPS
    music = t >= am["music_start"]

    fam = {}
    for name, keys in FAMILIES.items():
        v = sum(lch[f"panns_{k}"] for k in keys if f"panns_{k}" in lch)
        fam[name] = ndi.gaussian_filter1d(np.minimum(v, 1.0), 0.5 * FPS)
    rel = {k: v / (np.percentile(v[music], 95) + 1e-4) for k, v in fam.items()}
    loud = ach["loudness"]
    density = ndi.uniform_filter1d(ach["flux"], 2 * FPS)
    reg = ndi.gaussian_filter1d(ach["register"], 0.5 * FPS)
    tempo = lch.get("tempo_bpm", np.full(n, 120.0))
    chroma = np.stack([ach[f"chroma_{p}"] for p in ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"]])

    # Piirrevektori 0,5 s välein, jokainen piirre z-normalisoitu musiikin ajalta.
    step = FPS // 2
    feats = [np.log10(fam[k] + 1e-3) for k in FAMILIES] + [loud * 3, reg * 2, density * 2, tempo / 30]
    feats += list(ndi.uniform_filter1d(chroma, 2 * FPS, axis=1))
    F = np.stack(feats)[:, ::step]
    mm = music[::step]
    F = (F - F[:, mm].mean(1, keepdims=True)) / (F[:, mm].std(1, keepdims=True) + 1e-6)
    F = F / (np.linalg.norm(F, axis=0, keepdims=True) + 1e-9)
    ssm = F.T @ F
    L = 6  # 3 s
    g = np.outer(signal.windows.gaussian(2 * L, L / 2), signal.windows.gaussian(2 * L, L / 2))
    kern = g * np.kron([[1, -1], [-1, 1]], np.ones((L, L)))
    pad = np.pad(ssm, L, mode="reflect")
    nov = np.array([np.sum(pad[i:i + 2 * L, i:i + 2 * L] * kern) for i in range(ssm.shape[0])])
    nov[~mm] = 0
    nov = np.clip(nov, 0, None)
    peaks, _ = signal.find_peaks(nov, distance=int(a.min_len * 2), height=np.percentile(nov[mm], 60))

    bars = np.array([b["t"] for b in beats["bars"]])
    bounds = [am["music_start"]]
    for p in peaks:
        tb = start + p * step / FPS
        snap = bars[np.argmin(np.abs(bars - tb))] if len(bars) and np.min(np.abs(bars - tb)) < 1.2 else tb
        if snap - bounds[-1] >= a.min_len:
            bounds.append(float(snap))
    # Äkilliset hiljenemiset (esim. dominanttiseptimi + tauko) ovat aina rajoja.
    for e in events:
        if e["tyyppi"] == "hiljenee_akkia" and e["t"] - start > 0:
            if min(abs(b - e["t"]) for b in bounds) > 1.5:
                bounds.append(float(e["t"]))
    bounds = sorted(bounds) + [start + n / FPS]

    lvl = lambda v: "ff" if v > 0.85 else "f" if v > 0.7 else "mf" if v > 0.5 else "p" if v > 0.3 else "pp"
    segs = []
    for s0, s1 in zip(bounds[:-1], bounds[1:]):
        i0, i1 = int((s0 - start) * FPS), int((s1 - start) * FPS)
        if i1 - i0 < FPS:
            continue
        sl = slice(i0, i1)
        q = max(1, (i1 - i0) // 4)
        acts = {k: float(rel[k][sl].mean()) for k in FAMILIES}
        inst = [k for k, v in sorted(acts.items(), key=lambda kv: -kv[1]) if v >= 0.25]
        entering = [k for k in FAMILIES if rel[k][i0:i0 + q].mean() < 0.15 and rel[k][i1 - q:i1].mean() > 0.35]
        leaving = [k for k in FAMILIES if rel[k][i0:i0 + q].mean() > 0.35 and rel[k][i1 - q:i1].mean() < 0.15]
        l0, l1 = float(loud[i0:i0 + q].mean()), float(loud[i1 - q:i1].mean())
        dens = float(density[sl].mean())
        keys = [k["key"] for k in am["keys_5s"] if s0 - 2.5 <= k["t"] < s1]
        key = max(set(keys), key=keys.count) if keys else None
        ev = [e["kuvaus"] for e in events if s0 <= e["t"] < s1 and e["tyyppi"] != "rakenteen_muutos"]
        b_in = [b["bar"] for b in beats["bars"] if s0 - 0.3 <= b["t"] < s1 - 0.3]
        segs.append({
            "alku": round(s0, 2), "loppu": round(s1, 2), "kesto": round(s1 - s0, 1),
            "tahdit": [b_in[0], b_in[-1]] if b_in else None,
            "soittimet": inst, "aktiivisuus": {k: round(v, 2) for k, v in acts.items()},
            "tulevat": entering, "lahtevat": leaving,
            "dynamiikka": lvl(float(loud[sl].mean())), "voimakkuus": [round(l0, 2), round(l1, 2)],
            "suunta": "crescendo" if l1 - l0 > 0.12 else "diminuendo" if l0 - l1 > 0.12 else "tasainen",
            "rekisteri": round(float(reg[sl].mean()), 2),
            "tekstuuri": "tiheä, aktiivinen" if dens > 0.42 else "liikkuva" if dens > 0.3 else "laulava, legato",
            "tempo": round(float(np.median(tempo[sl])), 0), "savellaji": key, "tapahtumat": ev,
        })

    (d / "segments.json").write_text(json.dumps(segs, indent=1, ensure_ascii=False), encoding="utf-8")
    lines = [f"# Jaksot: LP-puoli {am['side']}, {start:.0f}–{start + am['duration']:.0f} s", "",
             "| # | Aika | Tahdit | Soittimet | Tulevat / lähtevät | Dynamiikka | Rekisteri | Tekstuuri | Tempo | Sävellaji |",
             "|---|---|---|---|---|---|---|---|---|---|"]
    for k, s in enumerate(segs, 1):
        tl = (" +" + ", +".join(s["tulevat"]) if s["tulevat"] else "") + (" −" + ", −".join(s["lahtevat"]) if s["lahtevat"] else "")
        lines.append(f"| {k} | {fmt(s['alku'])}–{fmt(s['loppu'])} ({s['kesto']} s) | {s['tahdit']} | {', '.join(s['soittimet']) or '–'} | "
                     f"{tl.strip() or '–'} | {s['dynamiikka']} {s['suunta']} ({s['voimakkuus'][0]}→{s['voimakkuus'][1]}) | "
                     f"{s['rekisteri']} | {s['tekstuuri']} | {s['tempo']:.0f} | {s['savellaji']} |")
    (d / "segments.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"{len(segs)} jaksoa")


if __name__ == "__main__":
    main()
