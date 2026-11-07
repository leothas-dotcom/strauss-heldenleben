"""Opastarkistus: kuunteluoppaan kohdat ja soitinroolit kuvaa vasten (docs/tuotantojako.md, luku
"Kuunteluopas kuvaksi").

Lähtötiedot: render/opascheck.mjs:n mittaus (opasProbe ankkureissa ja aikajanalla), visual/muste/vastaukset.json
(kuvallinen vastaus jokaiselle ankkurille), visual/muste/roolit.json (soitin -> elementti), paketin
listen.f32 (soitinkanavat) ja teemaviiva.json (sankariteeman sävel).

1. Ankkurit: jokaisella ankkurilla on vastaus (puuttuva = virhe), ja vastauksen mittari muuttuu
   t-0,5 s -> t+0,5 s vähintään kynnyksen verran (isku: ±1 ruudussa).
2. Soitinroolit: elementin tila korreloi kanavan kanssa ikkunoittain (Spearman) ja on levossa, kun
   soitin on vaiti (lepo-osuus).
3. Kärjen korkeus seuraa teemaviivan midiä (Spearman > 0,8 avauksessa held_alku .. held_vasket_t13).

    python -I analysis/opastarkistus.py runs/muste-1230/perusta/opasprobe.json --out runs/muste-1230/perusta/opastarkistus.md
"""
import argparse
import json
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
PACKS = {1: ["demo400", "A2", "A3"], 2: ["B1", "B2", "B3", "B4"]}
FPS = 30


def spearman(a, b):
    a, b = np.asarray(a, float), np.asarray(b, float)
    ok = np.isfinite(a) & np.isfinite(b)
    if ok.sum() < 4:
        return float("nan")
    ra, rb = a[ok].argsort().argsort(), b[ok].argsort().argsort()
    if ra.std() == 0 or rb.std() == 0:
        return float("nan")
    return float(np.corrcoef(ra, rb)[0, 1])


def load_channels(side, t0, t1, names):
    """Soitinkanavat puolen ajassa 30 fps välillä t0..t1 puolen paketeista (sauma: ensimmäinen, joka kattaa)."""
    n = int(round((t1 - t0) * FPS)) + 1
    out = {k: np.full(n, np.nan, np.float32) for k in names}
    for name in PACKS[side]:
        d = ROOT / "build" / name
        if not (d / "listen.json").exists():
            continue
        meta = json.loads((d / "listen.json").read_text(encoding="utf-8"))
        raw = np.fromfile(d / "listen.f32", np.float32).reshape(-1, len(meta["channels"]))
        for k in names:
            if k not in meta["channels"]:
                continue
            j = meta["channels"].index(k)
            for i in range(n):
                t = t0 + i / FPS
                f = int(round((t - meta["start"]) * FPS))
                if 0 <= f < raw.shape[0] and np.isnan(out[k][i]):
                    out[k][i] = raw[f, j]
    return out


def get(probe, path):
    """Mittarin arvo opasProbe-tilasta. Polut: muste.punainen.X, muste.valkoinen.X, muste.n, ritari.X, nuket.n,
    nuket.aN (keskiarvo), kamera.X, valo.X, otto, paikka, kohtaus, <paikan kenttä>."""
    if probe is None:
        return None
    p = path.split(".")
    if p[0] == "muste":
        if p[1] == "n":
            return sum(1 for m in probe["muste"] if m.get("nakyy"))
        col = {"punainen": "f5461a", "valkoinen": "e8dcc6"}[p[1]]
        ms = [m for m in probe["muste"] if m["vari"] == col]
        if not ms:
            return 0.0 if p[2] in ("pituus", "muste") else None
        if p[2] == "pituus":
            return max(m["pituus"] for m in ms)
        if p[2] == "muste":
            return max(m["muste"] for m in ms)
        best = max(ms, key=lambda m: m["muste"])
        return best.get(p[2])
    if p[0] == "ritari":
        r = probe.get("ritari")
        return None if r is None else r.get(p[1])
    if p[0] == "nuket":
        if p[1] == "n":
            return len(probe["nuket"])
        vals = [n[p[1]] for n in probe["nuket"] if p[1] in n and n[p[1]] is not None]
        return float(np.mean(vals)) if vals else None
    if p[0] in ("kamera", "valo"):
        return probe[p[0]].get(p[1])
    return probe.get(path)


def delta(a, b):
    if a is None or b is None:
        return None
    if isinstance(a, str) or isinstance(b, str):
        return 1.0 if a != b else 0.0
    return abs(float(b) - float(a))


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser()
    ap.add_argument("probe", type=Path)
    ap.add_argument("--out", type=Path, default=None)
    ap.add_argument("--vastaukset", type=Path, default=ROOT / "visual" / "muste" / "vastaukset.json")
    ap.add_argument("--roolit", type=Path, default=ROOT / "visual" / "muste" / "roolit.json")
    a = ap.parse_args()
    P = json.loads(a.probe.read_text(encoding="utf-8"))
    V = {v["ankkuri"]: v for v in json.loads(a.vastaukset.read_text(encoding="utf-8"))["vastaukset"]}
    R = json.loads(a.roolit.read_text(encoding="utf-8"))["roolit"]
    side = P["side"]
    lines = [f"# Opastarkistus: {P['page']} ({P['from']}–{P['to']} s, puoli {side})", "",
             "Vain mitattu: ankkurin kuvallinen vastaus (vastaukset.json) ja sen mittarin muutos opasProbe-tilasta;",
             "soitinroolit listen.f32:n kanavia vasten; kärjen korkeus teemaviivaa vasten.", ""]
    errors = 0

    # 1. ankkurit
    lines += ["## 1. Ankkurit: kuvallinen vastaus ja mitattu muutos", "",
              "| ankkuri | t | oppaan sana | vastaus | mittari | t−0,5 → t+0,5 | ±1 ruutu | tulos |", "|---|---|---|---|---|---|---|---|"]
    for an in P["anchors"]:
        v = V.get(an["id"])
        pr = an["probes"]
        if not v:
            errors += 1
            lines.append(f"| {an['id']} | {an['t']:.2f} | {(an.get('note') or '')[:40]} | **ei vastausta** | | | | VIRHE |")
            continue
        m = v["mittari"]
        d05 = delta(get(pr["m05"], m), get(pr["p05"], m))
        d1f = delta(get(pr["m1f"], m), get(pr["p1f"], m))
        thr = v.get("kynnys", 0)
        if d05 is None:
            ok = False; why = "mittari puuttuu"
        elif v.get("isku"):
            ok = d1f is not None and d1f > thr if thr > 0 else (d1f or 0) > 0
            why = "" if ok else "ei muutosta ±1 ruudussa"
        else:
            ok = d05 > thr if thr > 0 else d05 > 0
            why = "" if ok else "ei muutosta"
        errors += not ok
        fmt = lambda x: "–" if x is None else f"{x:.3g}"
        lines.append(f"| {an['id']} | {an['t']:.2f} | {v['opas']} | {v['elementti']} | `{m}` | {fmt(d05)} | {fmt(d1f)} | {'OK' if ok else 'VIRHE: ' + why} |")
    missing = [k for k in V if k not in {x['id'] for x in P['anchors']}]
    if missing:
        lines.append(f"\nVastauksia ilman ankkuria mittausalueella: {', '.join(missing)}")

    # 2. soitinroolit ikkunoittain (2 s)
    tl = P["timeline"]
    ts = np.array([p["t"] for p in tl])
    t0, t1 = float(ts.min()), float(ts.max())
    names = sorted({k for r in R for k in r["kanavat"] if k.startswith("panns_")})
    ch = load_channels(side, t0, t1, names)
    lines += ["", "## 2. Soitinroolit: elementti liikkuu, kun soitin soi (ikkunat 2 s)", "",
              "| soitin | kanava | elementti | mittari | Spearman | soi & levossa | vaiti & liikkuu | tulos |", "|---|---|---|---|---|---|---|---|"]
    WIN = 2.0
    nwin = int((t1 - t0) // WIN)
    for r in R:
        m = r.get("mittari")
        if not m:
            lines.append(f"| {r['soitin']} | {', '.join(r['kanavat'])} | {r['elementti']} | – | | | | ei mittaria (osa täydentää) |")
            continue
        if r["kanavat"] == ["teemaviiva"] or r["kanavat"] == ["viuluviiva"]:
            continue
        vals = np.array([(lambda x: np.nan if x is None else float(x))(get(p, m)) for p in tl])
        # paikat mittaavat eri asteikolla (esim. tuuli): normalisoidaan paikan huippuun
        paikat = np.array([p["paikka"] for p in tl])
        for pk in set(paikat):
            sel = paikat == pk
            mx = np.nanmax(np.abs(vals[sel])) if np.any(np.isfinite(vals[sel])) else 0
            if mx > 0:
                vals[sel] = vals[sel] / mx
        sig = np.zeros(len(ts))
        for k in r["kanavat"]:
            if k in ch:
                idx = np.clip(np.round((ts - t0) * FPS).astype(int), 0, len(ch[k]) - 1)
                sig = np.maximum(sig, np.nan_to_num(ch[k][idx]))
        xs, ys, soi_lepo, vaiti_liik, n_soi, n_vaiti = [], [], 0, 0, 0, 0
        for w in range(nwin):
            sel = (ts >= t0 + w * WIN) & (ts < t0 + (w + 1) * WIN)
            if sel.sum() < 3 or np.all(np.isnan(vals[sel])):
                continue
            v = np.nanmax(vals[sel]) - np.nanmin(vals[sel]) if m.endswith(("karki_y", "pituus", "_y", "amp")) else np.nanmax(vals[sel])
            s = float(np.mean(sig[sel]))
            xs.append(s); ys.append(v)
        if len(xs) < 4:
            lines.append(f"| {r['soitin']} | {', '.join(r['kanavat'])} | {r['elementti']} | `{m}` | – | | | ei mittausta alueella |")
            continue
        xs, ys = np.array(xs), np.array(ys)
        hi, lo = np.percentile(xs, 70), np.percentile(xs, 30)
        ymed = np.nanmedian(ys[ys > 0]) if np.any(ys > 0) else 0
        soi = xs >= hi; vaiti = xs <= lo
        soi_lepo = float(np.mean(ys[soi] <= 0.05 * ymed)) if soi.any() else float("nan")
        vaiti_liik = float(np.mean(ys[vaiti] > 0.5 * ymed)) if vaiti.any() else float("nan")
        rho = spearman(xs, ys)
        ok = (rho > 0.3) and (soi_lepo < 0.5)
        errors += not ok
        lines.append(f"| {r['soitin']} | {', '.join(r['kanavat'])} | {r['elementti']} | `{m}` | {rho:.2f} | {soi_lepo:.0%} | {vaiti_liik:.0%} | {'OK' if ok else 'VIRHE'} |")

    # 3. kärjen korkeus vs teemaviiva avauksessa
    lines += ["", "## 3. Kärjen korkeus seuraa teemaviivaa (avaus)", ""]
    tv = None
    for name in PACKS[side]:
        f = ROOT / "build" / name / "teemaviiva.json"
        if f.exists():
            tv = json.loads(f.read_text(encoding="utf-8")); break
    cues = json.loads((ROOT / "annotations" / "cues.json").read_text(encoding="utf-8"))["cues"]
    tA = next((c["t"] for c in cues if c.get("teema") == "held_alku" and c["side"] == side), None)
    tB = next((c["t"] for c in cues if c.get("teema") == "held_vasket_t13" and c["side"] == side), None)
    if tv and tA is not None and tB is not None and t0 <= tA and tB <= t1:
        midi = np.array([np.nan if m is None else m for m in tv["midi"]], float)
        xs, ys = [], []
        for p in tl:
            if not (tA <= p["t"] <= tB):
                continue
            f = int(round((p["t"] - tv["t0"]) * tv["fps"]))
            if not (0 <= f < len(midi)) or np.isnan(midi[f]):
                continue
            y = get(p, "muste.punainen.karki_y")
            if y is None:
                continue
            xs.append(midi[f]); ys.append(y)
        rho = spearman(xs, ys)
        ok = rho > 0.8
        errors += not ok
        lines.append(f"Näytteitä {len(xs)} ({tA:.1f}–{tB:.1f} s), Spearman(midi, kärjen y) = {rho:.3f} → {'OK' if ok else 'VIRHE (vaadittu > 0,8)'}")
    else:
        lines.append("Ei mitattavissa (teemaviiva tai avauksen ankkurit puuttuvat mittausalueelta).")
        errors += 1

    lines += ["", f"**{'KAIKKI KUNNOSSA' if not errors else f'{errors} virhettä'}**", ""]
    text = "\n".join(lines)
    print(text)
    if a.out:
        a.out.parent.mkdir(parents=True, exist_ok=True)
        a.out.write_text(text, encoding="utf-8")


if __name__ == "__main__":
    main()
