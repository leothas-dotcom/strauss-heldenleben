"""Kuunteluoppaan aikakoodatut osat teemakartasta (annotations/teemat.json).

Kirjoittaa annotations/kuunteluopas.md:n merkittyjen kohtien väliin:
  <!-- GEN:ankkurit -->  varmimmat kohdat
  <!-- GEN:minuutit --> minuutti minuutilta: jakso, dynamiikka (aikajanasta) ja tapahtumat
  <!-- GEN:tarkista --> tarkistettavat kohdat
Käsin kirjoitettu osa (tarina, henkilöt, menetelmä) jää ennalleen, eikä siinä ole aikoja: kaikki
ajat tulevat teemakartasta, joten opas ja cues.json eivät voi olla ristiriidassa.

    python -I analysis/kuunteluopas.py      (aja make_cues.py samalla, jos teemat.json muuttui)
"""
import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MAP = ROOT / "annotations" / "teemat.json"
GUIDE = ROOT / "annotations" / "kuunteluopas.md"
TIMELINE = ROOT / "build" / "koko"
LUOKKA = {"soitin": "uusi soitin", "isku": "isku", "tunnelma": "tunnelma", "soolo": "soolo", "huippu": "huippu", "tauko": "tauko"}
ANCHORS = ["held_alku", "held_intro_loppuu", "held_huippu1", "held_dom7_sointu", "held_gp", "wid_1_huilu",
           "wid_sankari_molli", "gef_viulu", "gef_rakkaus", "wal_kulissi1", "wal_taistelu", "wal_kertaus",
           "fri_alku", "wel_agitato", "wel_pastoraali", "wel_duetto", "wel_fanfaari"]


def mm(t):
    m = int(t // 60)
    return f"{m}:{t - 60 * m:04.1f}"


def when(e):
    tag = "AB"[e["side"] - 1]
    return f"{tag} {mm(e['t'])}" + (f"–{mm(e['t1'])}" if "t1" in e else "")


def varmuus(e):
    v = {"vahvistettu": "**vahvistettu**", "lahde+analyysi": "lähde+analyysi"}.get(e["varmuus"], e["varmuus"])
    return v + (" **[tarkista]**" if e.get("tarkista") else "")


def dyn_line(rows, a, b):
    """Dynamiikka minuutin sisällä aikajanan jaksoista."""
    seq, peak = [], (0.0, None)
    for r in rows:
        if r["loppu"] <= a or r["alku"] >= b:
            continue
        if not seq or seq[-1] != r["dyn"]:
            seq.append(r["dyn"])
        if r["huippu"] > peak[0]:
            peak = (r["huippu"], max(r["alku"], a))
    if not seq:
        return ""
    s = " → ".join(seq)
    return f"Dynamiikka: {s}" + (f" (voimakkain jakso alkaa {mm(peak[1])}, huippu {peak[0]:.2f})" if peak[1] is not None else "")


def section_at(secs, side, t):
    for s in secs:
        end_side = s.get("end_side", s["side"])
        after_start = (side > s["side"]) or (side == s["side"] and t >= s["start"] - 1e-6)
        before_end = (side < end_side) or (side == end_side and t < s["end"])
        if after_start and before_end:
            return s
    return None


def gen_minutes(m):
    secs = m["sections"]
    out = []
    for side in (1, 2):
        tag = "AB"[side - 1]
        out.append(f"### {'A' if side == 1 else 'B'}-puoli\n")
        rows = []
        f = TIMELINE / f"aikajana_{tag}.json"
        if f.exists():
            rows = json.loads(f.read_text(encoding="utf-8"))
        evs = sorted([e for e in m["events"] if e["side"] == side], key=lambda e: e["t"])
        side_secs = [s for s in secs if s["side"] == side]
        end = max([s["end"] for s in secs if s.get("end_side", s["side"]) == side] + [e.get("t1", e["t"]) for e in evs])
        shown = set()
        for minute in range(0, int(math.ceil(end / 60))):
            a, b = 60.0 * minute, 60.0 * (minute + 1)
            # jakson otsikko ja kuvaus, kun jakso alkaa tällä minuutilla
            for s in side_secs:
                if a <= s["start"] < b and s["id"] not in shown:
                    shown.add(s["id"])
                    end_tag = "AB"[s.get("end_side", s["side"]) - 1]
                    tail = mm(s["end"]) if end_tag == tag else f"{end_tag} {mm(s['end'])}"
                    out.append(f"#### {s['fi']} ({s['title']}): {tag} {mm(s['start'])}–{tail}\n")
                    out.append(s["kuvaus"] + (" **[tarkista jakson raja]**" if s.get("tarkista") else "") + "\n")
            names = []
            for t in (a + 0.01, (a + b) / 2, b - 0.01):
                s = section_at(secs, side, t)
                if s and s["fi"] not in names:
                    names.append(s["fi"])
            out.append(f"##### {tag} {minute}:00–{minute + 1}:00" + (" · " + " → ".join(names) if names else "") + "\n")
            dl = dyn_line(rows, a, b)
            if dl:
                out.append(dl + "\n")
            here = [e for e in evs if a <= e["t"] < b]
            if not here:
                out.append("*(ei uusia tapahtumia: edellinen jatkuu)*\n")
                continue
            out.append("| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |\n|---|---|---|---|---|")
            for e in here:
                key = e["luokka"] in ("soitin", "soolo", "isku") or e["theme"] in ("hero_dom7", "gp") or e["varmuus"] == "vahvistettu"
                t = f"**{when(e)}**" if key else when(e)
                out.append(f"| {t} | {LUOKKA[e['luokka']]} | {e['kuuluu']} | {e['tarina'] or '–'} | {varmuus(e)} |")
            out.append("")
    return "\n".join(out)


def gen_anchors(m):
    ev = {e["id"]: e for e in m["events"]}
    lines = ["| Kohta | Aika | Mistä tunnistaa | Varmuus |", "|---|---|---|---|"]
    for i in ANCHORS:
        e = ev.get(i)
        if e:
            lines.append(f"| {e['tarina'].split(';')[0] or e['kuuluu']} | {when(e)} | {e['peruste']} | {varmuus(e)} |")
    return "\n".join(lines)


def gen_check(m):
    lines = []
    for e in sorted([e for e in m["events"] if e.get("tarkista")], key=lambda e: (e["side"], e["t"])):
        lines.append(f"- **{when(e)}** {e['kuuluu']}: {e['tarina'] or 'tarkista'}")
    for s in m["sections"]:
        if s.get("tarkista"):
            lines.append(f"- Jakson raja: **{s['fi']}** alkaa {'AB'[s['side'] - 1]} {mm(s['start'])} ({s['peruste']})")
    return "\n".join(lines)


def replace(text, name, body):
    pat = re.compile(rf"(<!-- GEN:{name} -->\n).*?(<!-- /GEN:{name} -->)", re.S)
    if not pat.search(text):
        raise SystemExit(f"merkintä GEN:{name} puuttuu kuunteluoppaasta")
    return pat.sub(lambda mt: mt.group(1) + body.rstrip("\n") + "\n" + mt.group(2), text)


def main():
    m = json.loads(MAP.read_text(encoding="utf-8"))
    text = GUIDE.read_text(encoding="utf-8")
    text = replace(text, "ankkurit", gen_anchors(m))
    text = replace(text, "minuutit", gen_minutes(m))
    text = replace(text, "tarkista", gen_check(m))
    GUIDE.write_bytes(text.replace("\r\n", "\n").encode("utf-8"))
    print(f"{GUIDE.relative_to(ROOT)}: {len(m['events'])} tapahtumaa, {len(m['sections'])} jaksoa")


if __name__ == "__main__":
    main()
