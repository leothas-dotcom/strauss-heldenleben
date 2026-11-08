"""Skaalaa käsin vahvistetut ajat korjatun lähteen aikaan: t_uusi = t_vanha / k (audio/lahde.json).

Ajetaan KERRAN, kun lähdeääni vaihtuu nopeuskorjattuun (docs/julkaisu2.md 1.5 b). Tiedostot, joiden ajat eivät
synny analyysistä vaan on kirjoitettu käsin tai vahvistettu korvalla:
  annotations/teemat.json          events[].t, events[].t1; sections[].start, .end (molemmat puolet)
  annotations/sankariteema.json    tahtiankkurit (tahti -> s)
  docs/liikkeet.json               t0, t1
  docs/kriitikko_kohdat.json       t0, t1
  docs/kriitikko_kaikki.json       t0, t1
Analyysistä syntyvät tiedostot (cues.json, aksentit.json, paketit, kuunteluopas) generoidaan uudelleen,
ei skaalata. Skripti kieltäytyy, jos tiedostoon on jo merkitty sama k (ei kaksinkertaista skaalausta).

    python -I analysis/skaalaa_ajat.py [--kuiva]
"""
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CFG = json.loads((ROOT / "audio" / "lahde.json").read_text(encoding="utf-8"))
K = float(CFG["k"])
MERKKI = "nopeuskorjaus"


def s(t, des=2):
    return None if t is None else round(float(t) / K, des)


def lue(p):
    return json.loads(p.read_text(encoding="utf-8"))


def kirjoita(p, d, kuiva):
    if not kuiva:
        p.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def merkitse(d):
    d[MERKKI] = {"k": K, "pvm": CFG["pvm"], "kansio": CFG["kansio"], "huom": "ajat = korjatun lähteen aikaa, t_uusi = t_vanha / k"}


def teemat(kuiva):
    p = ROOT / "annotations" / "teemat.json"
    d = lue(p)
    if d.get(MERKKI, {}).get("k") == K:
        return f"{p.name}: jo skaalattu k={K}, ohitetaan"
    n = 0
    for e in d["events"]:
        for key in ("t", "t1"):
            if e.get(key) is not None:
                e[key] = s(e[key]); n += 1
    for sec in d["sections"]:
        for key in ("start", "end"):
            if sec.get(key) is not None:
                sec[key] = s(sec[key]); n += 1
    d["_ohje"] = d["_ohje"] + f" NOPEUSKORJAUS {CFG['pvm']}: kaikki ajat jaettu k={K}:lla (audio/lahde.json); alkuperäiset ajat gitin historiassa ennen tätä."
    merkitse(d)
    kirjoita(p, d, kuiva)
    return f"{p.name}: {n} aikaa skaalattu"


def sankariteema(kuiva):
    p = ROOT / "annotations" / "sankariteema.json"
    d = lue(p)
    if d.get(MERKKI, {}).get("k") == K:
        return f"{p.name}: jo skaalattu, ohitetaan"
    d["tahtiankkurit"] = {k: s(v) for k, v in d["tahtiankkurit"].items()}
    merkitse(d)
    kirjoita(p, d, kuiva)
    return f"{p.name}: {len(d['tahtiankkurit'])} tahtiankkuria skaalattu"


def lista_t0_t1(nimi, kuiva):
    p = ROOT / "docs" / nimi
    d = lue(p)
    if isinstance(d, list):
        if d and isinstance(d[0], dict) and d[0].get("_" + MERKKI, {}).get("k") == K:
            return f"{p.name}: jo skaalattu, ohitetaan"
        n = 0
        for x in d:
            for key in ("t0", "t1"):
                if isinstance(x, dict) and x.get(key) is not None:
                    x[key] = s(x[key], 3 if nimi == "liikkeet.json" else 2); n += 1
        if d and isinstance(d[0], dict):
            d[0]["_" + MERKKI] = {"k": K, "pvm": CFG["pvm"]}
        kirjoita(p, d, kuiva)
        return f"{p.name}: {n} aikaa skaalattu"
    return f"{p.name}: tuntematon rakenne, ei muutettu"


def cues_vahvistetut(kuiva):
    """cues.json:iin suoraan merkityt vahvistetut kohdat (ei teemakartasta): make_cues.py säilyttää ne
    sellaisinaan, joten ne skaalataan tässä. Kaikki muu cues.json:ssa generoidaan uudelleen."""
    p = ROOT / "annotations" / "cues.json"
    d = lue(p)
    if d.get(MERKKI, {}).get("k") == K:
        return f"{p.name}: jo skaalattu, ohitetaan"
    n = 0
    for c in d.get("cues", []):
        if c.get("vahvistettu") and not c.get("teema"):
            for key in ("t", "t_end"):
                if c.get(key) is not None:
                    c[key] = s(c[key]); n += 1
    merkitse(d)
    kirjoita(p, d, kuiva)
    return f"{p.name}: {n} vahvistetun suoran merkinnän aikaa skaalattu (loput generoi make_cues.py)"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--kuiva", action="store_true", help="näytä mitä tehtäisiin, älä kirjoita")
    a = ap.parse_args()
    print(f"k = {K} ({CFG['kansio']}), 1/k = {1 / K:.5f}")
    for msg in (teemat(a.kuiva), sankariteema(a.kuiva), cues_vahvistetut(a.kuiva), lista_t0_t1("liikkeet.json", a.kuiva),
                lista_t0_t1("kriitikko_kohdat.json", a.kuiva), lista_t0_t1("kriitikko_kaikki.json", a.kuiva)):
        print(("[kuiva] " if a.kuiva else "") + msg)


if __name__ == "__main__":
    main()
