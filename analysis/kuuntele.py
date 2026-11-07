"""Korvat yhteen taulukkoon: mitä aikavälillä soi, alkuperäisen FLACin ajassa.

Kokoaa analyysipaketeista (oikea paketti valitaan ajan mukaan) rivin aika-askelta kohden:
  voimakkuus (dB levyn pintakohinan yli, puhdistetusta kopiosta), Demucs-stemmien osuudet (rummut, basso, muu, "laulu"),
  PANNsin kolme vahvinta soitinta, ja CREPEn sävelet stemmeistä: melodia_laulu (vocals-stemmi:
  yleensä johtava korkea linja), melodia_muu (other-stemmi), basso (bass-stemmi). Sävel näytetään
  sillä rivillä, jolla se alkaa, ja varmuus suluissa. CREPE ei kuule hiljaisia ääniä, ja
  bassostemmin G1-sävelet ovat usein levyn jyminää: tarkista epäselvät `rekisteri.py`:llä
  (alkuperäinen FLAC verrattuna levyn kohinaan).

    python -I analysis/kuuntele.py --side 1 --from 240 --to 262 [--step 0.5]
"""
import argparse
import csv
import json
import sys
from pathlib import Path

import librosa
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
PACKAGES = {1: ["demo400", "A2", "A3"], 2: ["B1", "B2", "B3", "B4"]}
FPS = 30
SRC = {"melodia_laulu": "L", "melodia_muu": "M", "basso": "B"}


def pick(side, t0, t1):
    best = None
    for name in PACKAGES[side]:
        d = ROOT / "build" / name
        m = json.loads((d / "listen.json").read_text(encoding="utf-8"))
        a, b = m["start"], m["start"] + m["duration"]
        cover = min(b, t1) - max(a, t0)
        if best is None or cover > best[0]:
            best = (cover, d, m)
    if best[0] < t1 - t0 - 1e-6:
        print(f"huom: {best[1].name} kattaa vain {best[0]:.1f}/{t1 - t0:.1f} s; jaa väli kahteen kyselyyn")
    return best[1], best[2]


def mmss(t):
    m, s = divmod(t, 60)
    return f"{int(m)}:{s:04.1f}"


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser()
    ap.add_argument("--side", type=int, required=True)
    ap.add_argument("--from", dest="t0", type=float, required=True)
    ap.add_argument("--to", dest="t1", type=float, required=True)
    ap.add_argument("--step", type=float, default=0.5)
    ap.add_argument("--min-conf", type=float, default=0.6, help="nuottien vähimmäisvarmuus")
    a = ap.parse_args()
    d, lm = pick(a.side, a.t0, a.t1)
    am = json.loads((d / "analysis.json").read_text(encoding="utf-8"))
    L = np.fromfile(d / "listen.f32", dtype=np.float32).reshape(lm["frames"], -1)
    A = np.fromfile(d / "analysis.f32", dtype=np.float32).reshape(am["frames"], -1)
    lc, ac = lm["channels"], am["channels"]
    with open(d / "notes.csv", encoding="utf-8") as f:
        notes = [r for r in csv.DictReader(f) if float(r["varmuus"]) >= a.min_conf]
    start = lm["start"]
    rel_db = A[:, ac.index("rel_db")]
    panns = [c for c in lc if c.startswith("panns_") and c not in ("panns_orchestra",)]
    stems = [c for c in lc if c.startswith("stem_")]
    print(f"Puoli {'AB'[a.side - 1]} {mmss(a.t0)}–{mmss(a.t1)} (paketti {d.name}; ajat alkuperäisen FLACin aikaa).")
    print("dB* = taso levyn pintakohinan yli (puhdistettu kopio; alle noin 5 = hiljaisuutta).")
    print("Sävelet: L = vocals-stemmi (johtava linja), M = other-stemmi, B = bass-stemmi; suluissa CREPEn varmuus.")
    print("aika    | dB*  | stemmit r/b/m/l   | PANNs (3 vahvinta)                         | sävelet alkavat")
    for t in np.arange(a.t0, a.t1, a.step):
        s = slice(int((t - start) * FPS), int((t + a.step - start) * FPS))
        if s.start < 0 or s.stop > lm["frames"]:
            continue
        db = float(rel_db[s].mean())
        st = "/".join(f"{float(L[s, lc.index(c)].mean()):.2f}".lstrip("0") for c in stems)
        pv = sorted(((float(L[s, lc.index(c)].mean()), c[6:]) for c in panns), reverse=True)[:3]
        pt = ", ".join(f"{n} {v:.2f}" for v, n in pv if v >= 0.05) or "-"
        ns = [r for r in notes if t <= float(r["alku_s"]) < t + a.step]
        nt = " ".join(f"{SRC.get(r['lahde'], '?')}:{librosa.midi_to_note(int(r['midi']), unicode=False)}({float(r['varmuus']):.2f})"
                      for r in ns)
        print(f"{mmss(t):<7} | {db:4.0f} | {st:<17} | {pt:<42} | {nt}")


if __name__ == "__main__":
    main()
