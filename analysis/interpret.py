"""Vaihe 4: tulkinta. Muuttaa analyysin kanavat musiikillisiksi tapahtumiksi.

Lukee analysis.* ja listen.* -tiedostot sekä beats.jsonin ja tunnistaa:
  soitin_sisaan / soitin_ulos   soitinperheen aktiivisuus kasvaa tai laskee >10-kertaisesti
  tempo_muutos                  tahtitempo muuttuu yli 6 % (4 tahtia ennen vs. jälkeen)
  hiljenee_akkia / voimistuu_akkia   voimakkuus muuttuu yli 10 dB sekunnissa
  rakenteen_muutos              uutuuskäyrän huippu + mitä siinä muuttui
Kirjoittaa events.json (koneelle) ja yhteenveto.md (selkokielinen, kuunteluoppaan pohjaksi).

  python -I analysis/interpret.py build/demo400
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
    "jouset": ["violin_fiddle", "cello", "double_bass", "string_section", "bowed_string_instrument", "pizzicato"],
    "vaskipuhaltimet": ["french_horn", "trumpet", "trombone", "brass_instrument"],
    "puupuhaltimet": ["wind_instrument_woodwind_instrument", "flute", "clarinet"],
    "lyömäsoittimet": ["timpani", "cymbal", "snare_drum", "bass_drum", "drum_roll", "glockenspiel"],
    "harppu": ["harp"],
}
FAMILY_GEN = {"jouset": "jouset", "vaskipuhaltimet": "vaskipuhaltimet", "puupuhaltimet": "puupuhaltimet",
              "lyömäsoittimet": "lyömäsoittimet", "harppu": "harppu"}


def load(d, name):
    meta = json.loads((d / f"{name}.json").read_text(encoding="utf-8"))
    x = np.fromfile(d / f"{name}.f32", dtype=np.float32).reshape(meta["frames"], -1)
    return meta, {c: x[:, i] for i, c in enumerate(meta["channels"])}


def fmt(side, t):
    return f"[{'A' if side == 1 else 'B'} {int(t // 60)}:{t % 60:04.1f}]"


def window_median(x, i, a, b):
    lo, hi = max(0, i + int(a * FPS)), min(len(x), i + int(b * FPS))
    return float(np.median(x[lo:hi])) if hi > lo else float("nan")


def family_activity(lch):
    out = {}
    for fam, classes in FAMILIES.items():
        keys = [f"panns_{c}" for c in classes if f"panns_{c}" in lch]
        if keys:
            out[fam] = ndi.gaussian_filter1d(np.minimum(sum(lch[k] for k in keys), 1.0), 0.75 * FPS)
    return out


def instrument_events(fam, music, start, side):
    """Sisääntulot ja poistumiset: aktiivisuuden suhde 3 s ennen vs. 3 s jälkeen."""
    events = []
    for name, a in fam.items():
        n = len(a)
        ratio = np.zeros(n)
        pre = np.zeros(n)
        post = np.zeros(n)
        for i in range(0, n, 3):  # 0,1 s välein riittää
            pre[i] = window_median(a, i, -3.0, -0.5)
            post[i] = window_median(a, i, 0.5, 3.0)
            ratio[i] = np.log10((post[i] + 1e-3) / (pre[i] + 1e-3))
        ratio[~music] = 0
        for sign, kind in ((1, "soitin_sisaan"), (-1, "soitin_ulos")):
            peaks, props = signal.find_peaks(sign * ratio, height=1.0, distance=4 * FPS)
            for p, h in zip(peaks, props["peak_heights"]):
                level = post[p] if sign > 0 else pre[p]
                if level < 0.01:
                    continue
                t = start + p / FPS
                verb = "tulevat sisään" if sign > 0 else "vaikenevat"
                events.append({"t": round(t, 2), "tyyppi": kind, "perhe": name,
                               "kuvaus": f"{FAMILY_GEN[name].capitalize()} {verb} (aktiivisuus {pre[p]:.3f} -> {post[p]:.3f}, x{10 ** (sign * h):.0f})",
                               "varmuus": round(float(min(1.0, h / 2)), 2)})
    return events


def tempo_events(beats, side):
    bars = [b for b in beats.get("bars", []) if b.get("tempo_bpm")]
    if len(bars) < 13:
        return []
    bpm = np.array([b["tempo_bpm"] for b in bars])
    # 6 tahtia ennen vs. jälkeen; vähintään 8 % ja 6 tahdin välein, jotta yksittäiset
    # virheelliset tahdin alut eivät tuota tempomuutoksia.
    w = 6
    change = np.zeros(len(bars))
    for k in range(w, len(bars) - w):
        change[k] = np.median(bpm[k:k + w]) / np.median(bpm[k - w:k]) - 1
    anchored = np.array([b.get("lahde", "tunnistettu") != "laskettu" for b in bars])
    events = []
    for sign, word in ((1, "kiihtyy"), (-1, "hidastuu")):
        peaks, _ = signal.find_peaks(sign * change, height=0.08, distance=w)
        for k in peaks:
            # Raportoidaan vain, jos vähintään 3/4 tahdeista on ankkuroitu kuultuun tahdin alkuun
            # tai iskuun (vastustajien staccatossa ruudukko on paljolti laskettua).
            if anchored[k - w:k + w].mean() < 0.75:
                continue
            before, after = np.median(bpm[k - w:k]), np.median(bpm[k:k + w])
            events.append({"t": bars[k]["t"], "tyyppi": "tempo_muutos", "tahti": bars[k]["bar"],
                           "kuvaus": f"Tempo {word}: {before:.0f} -> {after:.0f} BPM (tahti {bars[k]['bar']})",
                           "tiedot": {"ennen_bpm": round(float(before), 1), "jalkeen_bpm": round(float(after), 1)},
                           "varmuus": round(float(min(1.0, abs(change[k]) / 0.15)), 2)})
    return events


def dynamic_events(rel_db, music, start):
    n = len(rel_db)
    delta = np.zeros(n)
    for i in range(FPS, n - FPS):
        delta[i] = rel_db[i:i + FPS].mean() - rel_db[i - FPS:i].mean()
    delta[~music] = 0
    events = []
    for sign, kind, word in ((-1, "hiljenee_akkia", "hiljenee äkkiä"), (1, "voimistuu_akkia", "voimistuu äkkiä")):
        peaks, props = signal.find_peaks(sign * delta, height=10.0, distance=3 * FPS)
        for p, h in zip(peaks, props["peak_heights"]):
            events.append({"t": round(start + p / FPS, 2), "tyyppi": kind,
                           "kuvaus": f"Musiikki {word} ({sign * h:+.0f} dB sekunnissa)",
                           "varmuus": round(float(min(1.0, h / 20)), 2)})
    return events


def novelty_events(ach, music, start, others):
    nov = ach["novelty"].copy()
    nov[~music] = 0
    peaks, props = signal.find_peaks(nov, height=0.6, distance=8 * FPS)
    events = []
    for p, h in zip(peaks, props["peak_heights"]):
        t = start + p / FPS
        near = [e["kuvaus"] for e in others if abs(e["t"] - t) <= 3.0]
        events.append({"t": round(t, 2), "tyyppi": "rakenteen_muutos",
                       "kuvaus": "Rakenteen muutos" + (": " + "; ".join(near) if near else " (ei tunnistettua syytä: kuuntele)"),
                       "varmuus": round(float(h), 2)})
    return events


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("dir", type=Path)
    a = ap.parse_args()
    d = a.dir if a.dir.is_absolute() else ROOT / a.dir
    ameta, ach = load(d, "analysis")
    lmeta, lch = load(d, "listen")
    beats = json.loads((d / "beats.json").read_text(encoding="utf-8")) if (d / "beats.json").exists() else {}
    side, start, n = ameta["side"], ameta["start"], ameta["frames"]
    music = start + np.arange(n) / FPS >= ameta["music_start"]

    fam = family_activity(lch)
    events = instrument_events(fam, music, start, side)
    events += tempo_events(beats, side)
    events += dynamic_events(ach["rel_db"], music, start)
    events += novelty_events(ach, music, start, list(events))
    events.sort(key=lambda e: e["t"])

    windows = []
    tempo = lch.get("tempo_bpm")
    for i in range(0, n, 10 * FPS):
        s = slice(i, min(n, i + 10 * FPS))
        if not music[s].any():
            continue
        acts = {k: float(v[s].mean()) for k, v in fam.items()}
        top = [k for k, v in sorted(acts.items(), key=lambda kv: -kv[1]) if v >= 0.01][:2]
        key = next((k["key"] for k in ameta["keys_5s"] if abs(k["t"] - (start + i / FPS)) < 2.5), None)
        windows.append({"t": round(start + i / FPS, 1), "hallitsevat": top,
                        "aktiivisuus": {k: round(v, 3) for k, v in acts.items()},
                        "tempo_bpm": round(float(np.median(tempo[s])), 0) if tempo is not None else None,
                        "voimakkuus": round(float(ach["loudness"][s].mean()), 2), "savellaji": key})

    out = {"side": side, "start": start, "duration": ameta["duration"], "music_start": ameta["music_start"],
           "events": events, "ikkunat_10s": windows,
           "huom": "Tulkinta on automaattinen: soitinperheet PANNs-mallista (suhteelliset muutokset), tempo tahdin alkujen väleistä."}
    (d / "events.json").write_text(json.dumps(out, indent=1, ensure_ascii=False), encoding="utf-8")

    lines = [f"# Yhteenveto: LP-puoli {side}, {start:.0f}–{start + ameta['duration']:.0f} s", "",
             "Automaattinen tulkinta analyysista. Kuunteluoppaan pohja: tarkista korvalla.", "", "## Tapahtumat", ""]
    lines += [f"- {fmt(side, e['t'])} {e['kuvaus']}" for e in events] or ["- (ei tapahtumia)"]
    lines += ["", "## 10 sekunnin ikkunat", "", "| Aika | Hallitsevat soitinperheet | Tempo | Voimakkuus | Sävellaji |",
              "|---|---|---|---|---|"]
    lines += [f"| {fmt(side, w['t'])} | {', '.join(w['hallitsevat']) or '–'} | {w['tempo_bpm']} | {w['voimakkuus']} | {w['savellaji']} |"
              for w in windows]
    (d / "yhteenveto.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    counts = {}
    for e in events:
        counts[e["tyyppi"]] = counts.get(e["tyyppi"], 0) + 1
    print(f"{len(events)} tapahtumaa: " + ", ".join(f"{k} {v}" for k, v in counts.items()))


if __name__ == "__main__":
    main()
