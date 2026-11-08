"""Merkintäluonnos analyysista: kirjoittaa/päivittää annotations/cues.json.

Lukee analyysipaketit (build/<ajo>/: analysis.json, events.json, beats.json) ja kokoaa:
  sections  jaksot teemakartasta (annotations/teemat.json)
  cues      teemakartan tapahtumat (teema_*) + paketin tapahtumat: sankariteeman alku,
            interpret.py:n tapahtumat, Es-duurijaksot
  bars      tahdit puolittain (beat_this)
Jokaisessa kohdassa on "lahde" (analyysi / arvio / vahvistettu) ja "vahvistettu".
Kohtia, joissa "vahvistettu": true, ei koskaan muuteta eikä poisteta; muut luodaan uudelleen.

  python -I analysis/make_cues.py build/demo [build/muu ...]
"""
import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
from lahde import FILES  # lähdeääni audio/lahde.json:sta (nopeuskorjattu siirto)  # noqa: E402
CUES = ROOT / "annotations" / "cues.json"
EXAMPLE = ROOT / "annotations" / "cues.example.json"

# Jaksot ja teemat: annotations/teemat.json (teemakartta; lähteiden järjestys + analyysin ajat).
THEMES_MAP = ROOT / "annotations" / "teemat.json"
GENERATED_THEMES = {
    "soitin_sisaan": "Analyysi: soitinperhe tulee sisään (kenttä 'perhe')",
    "soitin_ulos": "Analyysi: soitinperhe vaikenee (kenttä 'perhe')",
    "tempo_muutos": "Analyysi: tahtitempo muuttuu (kenttä 'tiedot')",
    "hiljenee_akkia": "Analyysi: voimakkuus putoaa äkkiä (esim. dominanttiseptimi + tauko)",
    "voimistuu_akkia": "Analyysi: voimakkuus nousee äkkiä",
    "rakenteen_muutos": "Analyysi: uutuuskäyrän huippu ja mitä siinä muuttui",
    "es_duuri": "Analyysi: Es-duuri vahvana (sankarin kotisävellaji)",
}


def from_theme_map():
    """Jaksot ja teemamerkinnät teemakartasta. Kartan 'vahvistettu' siirtyy merkintään."""
    m = json.loads(THEMES_MAP.read_text(encoding="utf-8"))
    sections = [{**{k: v for k, v in sec.items()}, "vahvistettu": bool(sec.get("vahvistettu"))} for sec in m["sections"]]
    cues = []
    for e in m["events"]:
        c = {"id": e.get("cue_id", f"teema_{e['id']}"), "teema": e["id"], "side": e["side"], "t": e["t"], "theme": e["theme"]}
        if "t1" in e:
            c["t_end"] = e["t1"]
        for k in ("luokka", "lead", "critic", "work"):
            if k in e:
                c[k] = e[k]
        c["lahde"] = e["varmuus"]
        c["note"] = e["kuuluu"] + (f". {e['tarina']}" if e.get("tarina") else "") + (" [tarkista]" if e.get("tarkista") else "")
        c["peruste"] = e["peruste"]
        c["vahvistettu"] = bool(e.get("vahvistettu"))
        cues.append(c)
    return sections, cues, m.get("themes", {})


def generated_entry(**kw):
    return {**kw, "vahvistettu": False}


def from_package(d):
    """Tapahtumat ja tahdit yhdestä analyysipaketista."""
    meta = json.loads((d / "analysis.json").read_text(encoding="utf-8"))
    side, start = meta["side"], meta["start"]
    t_music = meta["music_start"]
    cues = []
    if start <= 7.6 <= start + meta["duration"] and side == 1:
        cues.append(generated_entry(id="cue_hero_start", side=1, t=round(t_music, 2), theme="hero",
                                    lead=["horns", "cellos"], lahde="analyysi",
                                    note="Musiikin ja sankariteeman alku (sisäänajouran jälkeen)"))
    # Tulkinnan tapahtumat (interpret.py): soittimet sisään/ulos, tempo, äkilliset muutokset,
    # rakenteen muutokset syineen.
    events_file = d / "events.json"
    if events_file.exists():
        for e in json.loads(events_file.read_text(encoding="utf-8"))["events"]:
            extra = {k: e[k] for k in ("perhe", "tahti", "tiedot") if k in e}
            cues.append(generated_entry(id=f"cue_{e['tyyppi']}_s{side}_{e['t']:.1f}" + (f"_{e['perhe']}" if "perhe" in e else ""),
                                        side=side, t=e["t"], theme=e["tyyppi"], varmuus=e["varmuus"], **extra,
                                        lahde="analyysi", note=e["kuvaus"]))
    # Es-duurijaksot (sankarin kotisävellaji) sävellaji-ikkunoista.
    run = None
    for k in meta["keys_5s"] + [{"t": None, "key": None, "clarity": 0}]:
        hit = k["key"] == "Eb duuri" and k["clarity"] >= 0.55 and k["t"] is not None and k["t"] >= t_music
        if hit and run is None:
            run = [k["t"], k["t"] + 5]
        elif hit:
            run[1] = k["t"] + 5
        elif run is not None:
            cues.append(generated_entry(id=f"cue_es_duuri_s{side}_{run[0]:.0f}", side=side, t=run[0], t_end=run[1],
                                        theme="es_duuri", lahde="analyysi", note="Es-duuri vahvana (sävellajiarvio)"))
            run = None
    bars = []
    beats_file = d / "beats.json"
    if beats_file.exists():
        beats = json.loads(beats_file.read_text(encoding="utf-8"))
        bars = [{"bar": b["bar"], "t": round(b["t"], 3), "lahde": "analyysi"} for b in beats["bars"]]  # puolen aika
    info = {"side": side, "start": start, "duration": meta["duration"], "paketti": str(d.relative_to(ROOT)).replace("\\", "/")}
    return cues, bars, info


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("packages", nargs="+", type=Path)
    a = ap.parse_args()

    base = json.loads((CUES if CUES.exists() else EXAMPLE).read_text(encoding="utf-8"))
    map_secs, cues, map_themes = from_theme_map()
    # Teemakartta on käsin ylläpidetty ja kantaa omat vahvistuksensa, joten sen merkinnät ja jaksot
    # tulevat aina kartasta. Muut vahvistetut merkinnät (cues.json:iin suoraan merkityt) säilyvät.
    map_ids = {c["id"] for c in cues}
    keep_cues = [c for c in base.get("cues", []) if c.get("vahvistettu") and c.get("id") not in map_ids
                 and not str(c.get("id", "")).startswith("teema_")]
    keep_ids = {c.get("id") for c in keep_cues}
    sections = map_secs
    bars, analyses = {"1": [], "2": []}, []
    for d in a.packages:
        d = d if d.is_absolute() else ROOT / d
        c, b, info = from_package(d)
        cues += c
        bars[str(info["side"])] += b
        analyses.append(info)
    cues = keep_cues + [c for c in cues if c["id"] not in keep_ids]
    cues.sort(key=lambda c: (c["side"] or 9, c["t"] if c["t"] is not None else 1e9))

    out = {
        "_ohje": ("Merkinnät, koneluettava vastine kuunteluoppaalle (annotations/kuunteluopas.md). "
                  "Ajat sekunteina LP-puolen tiedoston alusta. lahde: analyysi / arvio / vahvistettu. "
                  "Muokkaa vapaasti ja aseta \"vahvistettu\": true - make_cues.py ei koskaan muuta vahvistettuja "
                  "kohtia. Luotu: python -I analysis/make_cues.py <paketit>."),
        # lähdeääni audio/lahde.json:sta (nopeuskorjattu siirto), ei vanhasta cues.json:sta
        "recording": {**base["recording"], "sides": {str(s): str(p.relative_to(ROOT)).replace("\\", "/") for s, p in FILES.items()}},
        "themes": {**base["themes"], **map_themes, **GENERATED_THEMES},
        "sections": sections,
        "cues": cues,
        "bars": {k: sorted(v, key=lambda b: b["t"]) for k, v in bars.items()},
        "analyses": analyses,
    }
    CUES.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    n_conf = sum(1 for c in cues if c.get("vahvistettu"))
    print(f"{CUES.relative_to(ROOT)}: {len(sections)} jaksoa, {len(cues)} tapahtumaa ({n_conf} vahvistettua), "
          f"tahteja A {len(out['bars']['1'])} / B {len(out['bars']['2'])}")


if __name__ == "__main__":
    main()
