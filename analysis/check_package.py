"""Tarkistaa analyysipaketin ja merkinnät: JSON kelpaa, binääridata vastaa metatietoja.

  python -I analysis/check_package.py build/demo     paketti + annotations/cues.json
  python -I analysis/check_package.py --cues-only    vain merkinnät
Palauttaa virhekoodin 1, jos jokin tarkistus ei mene läpi.
"""
import argparse
import csv
import json
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
errors = []


def check(ok, msg):
    print(("OK      " if ok else "VIRHE   ") + msg)
    if not ok:
        errors.append(msg)
    return ok


def load_json(path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as e:
        check(False, f"{path.name}: {e}")
        return None


def check_frames(d, name):
    meta = load_json(d / f"{name}.json")
    if meta is None:
        return None
    f32 = d / f"{name}.f32"
    size = f32.stat().st_size if f32.exists() else -1
    expect = meta["frames"] * len(meta["channels"]) * 4
    if check(size == expect, f"{name}.f32: {meta['frames']} ruutua x {len(meta['channels'])} kanavaa ({size} tavua)"):
        x = np.fromfile(f32, dtype=np.float32)
        check(bool(np.isfinite(x).all()), f"{name}.f32: ei NaN/inf-arvoja")
    check(len(set(meta["channels"])) == len(meta["channels"]), f"{name}.json: kanavien nimet yksilöllisiä")
    check(meta.get("fps") == 30, f"{name}.json: 30 fps")
    return meta


def check_package(d):
    print(f"--- paketti {d.relative_to(ROOT)}")
    a = check_frames(d, "analysis")
    li = check_frames(d, "listen")
    if a and li:
        check(a["frames"] == li["frames"], "analysis ja listen: sama ruutumäärä")
        check(abs(a["music_start"] - li["music_start"]) < 1e-6, "analysis ja listen: sama musiikin alku")
    beats = load_json(d / "beats.json")
    if beats is not None:
        b = np.array(beats["beats"])
        check(bool(np.all(np.diff(b) > 0)), f"beats.json: {len(b)} iskua kasvavassa järjestyksessä")
        bars = [x["bar"] for x in beats["bars"]]
        check(bars == list(range(1, len(bars) + 1)), f"beats.json: tahdit 1..{len(bars)} järjestyksessä")
        # ajat puolen aikaa (alkuperäinen FLAC): paketin sisällä
        span = (a["start"] - 0.1, a["start"] + a["duration"] + 0.1) if a else None
        check(beats.get("aika", "").startswith("puolen aika") and (span is None or len(b) == 0 or span[0] <= b[0] and b[-1] <= span[1]),
              "beats.json: ajat puolen aikaa (alkuperäinen FLAC)")
    patina = load_json(d / "patina.json")
    if patina is not None:
        check(all(len(c) == 2 for c in patina["clicks"]), f"patina.json: {len(patina['clicks'])} naksahdusta")
    notes = d / "notes.csv"
    if check(notes.exists(), "notes.csv löytyy"):
        with open(notes, encoding="utf-8") as f:
            rows = list(csv.DictReader(f))
        check(all(float(r["loppu_s"]) > float(r["alku_s"]) for r in rows), f"notes.csv: {len(rows)} nuottia, loppu > alku")
        if a and rows:
            check(all(a["start"] - 0.1 <= float(r["alku_s"]) <= a["start"] + a["duration"] + 0.1 for r in rows),
                  "notes.csv: ajat puolen aikaa (alkuperäinen FLAC)")
    check((d / "LUE_MINUT.md").exists(), "LUE_MINUT.md löytyy")
    ev = load_json(d / "events.json") if (d / "events.json").exists() else None
    if check(ev is not None, "events.json löytyy (interpret.py)"):
        t = [e["t"] for e in ev["events"]]
        check(t == sorted(t) and all("kuvaus" in e for e in ev["events"]),
              f"events.json: {len(t)} tapahtumaa järjestyksessä, kuvaukset mukana")
    check((d / "yhteenveto.md").exists(), "yhteenveto.md löytyy")


def check_cues():
    path = ROOT / "annotations" / "cues.json"
    print(f"--- {path.relative_to(ROOT)}")
    if not check(path.exists(), "cues.json löytyy (luo: python -I analysis/make_cues.py <paketti>)"):
        return
    c = load_json(path)
    if c is None:
        return
    for key in ("recording", "themes", "sections", "cues", "bars"):
        check(key in c, f"avain '{key}'")
    ids = [x.get("id") for x in c.get("cues", []) + c.get("sections", [])]
    check(None not in ids and len(ids) == len(set(ids)), "tunnisteet (id) olemassa ja yksilöllisiä")
    bad = [x["id"] for x in c.get("cues", []) if x.get("side") not in (1, 2, None)
           or not (x.get("t") is None or isinstance(x["t"], (int, float)))]
    check(not bad, f"tapahtumien side/t kelvollisia {bad if bad else ''}")
    themes = set(c.get("themes", {})) | {"rakenteen_muutos", "es_duuri"}
    unknown = sorted({x["theme"] for x in c.get("cues", []) if x.get("theme") not in themes})
    check(not unknown, f"teemat tunnettuja {unknown if unknown else ''}")
    for side, bars in c.get("bars", {}).items():
        t = [b["t"] for b in bars]
        check(t == sorted(t), f"tahdit, puoli {side}: {len(t)} kpl järjestyksessä")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("packages", nargs="*", type=Path)
    ap.add_argument("--cues-only", action="store_true")
    a = ap.parse_args()
    if not a.cues_only:
        for d in a.packages:
            check_package(d if d.is_absolute() else ROOT / d)
    check_cues()
    print(f"{len(errors)} virhettä." if errors else "Kaikki tarkistukset kunnossa.")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
