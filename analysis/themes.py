"""Vaihe 4b: teemat ja tapahtumat koko levyltä, tahtikartta.

Yhdistää osa-analyysit (prepare/analyze/listen 420 s:n osina) puolen mittaisiksi, laskee
voimakkuuden uudelleen koko puolen yli ja tunnistaa teoksen teemat ja käännekohdat äänestä:

  * teemahaku: malli on teeman ensiesiintymä TÄSTÄ äänitteestä (esim. sankariteema, tahdit 1-4);
    sitä haetaan kromasta osajono-DTW:llä kaikilla 12 transponoinnilla (teema palaa eri sävellajeissa)
  * tapahtumat: dominanttiseptimi ja yleistauko, sooloviulu (kumppani), Ges-duuri ja harppu
    (rakkauskohtaus), kulissitrumpetit (hiljaiset trumpetit), taistelu (virvelirumpu, 3/4),
    englannintorven pastoraali, loppusointu
  * tahtikartta (vain diagnostiikka): ruudukon tahtimäärää verrataan lähteeseen. Tulos 29.10.:
    ruudukko ajautuu tempomuutoksissa ja fermaateissa (A-puolelle ~750 "tahtia", lähde: taistelu
    alkaa T. 368), joten tahtinumeroita ei käytetä.

Tunnistimet ovat raakaehdokkaita (esim. PANNs-virveli sankarijakson huipussa, "hiljaiset
trumpetit" = tuubat). Varsinainen teemakartta on annotations/teemat.json: lähteiden järjestys,
ajat näistä kanavista ankkurien välistä haettuina (ks. kuunteluopas, "Miten ajat on saatu").

Tulosteet:
  build/koko/A.npz, B.npz       puolen kanavat (30 fps), tahdit, tapahtumat
  build/koko/teemat.json        tunnistetut teemat ja tapahtumat (aika, tahti, varmuus, peruste)
  annotations/themes.json       teemaluettelo: lähteiden tahdit + tämän äänitteen kohdat
  annotations/cues.json         teemamerkinnät lisätään (vahvistettuja ei muuteta)

    python -I analysis/themes.py --A build/demo400 build/A2 build/A3 --B build/B1 build/B2 build/B3 build/B4
"""
import argparse
import json
from pathlib import Path

import librosa
import numpy as np
from scipy.ndimage import gaussian_filter1d, uniform_filter1d

ROOT = Path(__file__).resolve().parent.parent
FPS = 30
PCS = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"]

# Lähteiden tahtinumerot (partituuri Leuckart 1899). Rösch: osastojen rajat (toisen käden lähde,
# keskustelupalsta; Hepokoski aloittaa kumppanin T. 192). Harjoitusnumerot: sooloviulu 22-32
# (orchestraexcerpts.com), kulissitrumpetit 42-43 (trumpetexcerpts.org, kolme B-trumpettia).
SOURCE = {
    "sections": [
        {"id": "held", "title": "Der Held", "bar": 1, "lahde": "Rösch (T. 1-117)"},
        {"id": "widersacher", "title": "Des Helden Widersacher", "bar": 118, "lahde": "Rösch (T. 118-187)"},
        {"id": "gefaehrtin", "title": "Des Helden Gefährtin", "bar": 188, "lahde": "Rösch (T. 188-367); Hepokoski T. 192"},
        {"id": "walstatt", "title": "Des Helden Walstatt", "bar": 368, "lahde": "Rösch (T. 368-684)"},
        {"id": "friedenswerke", "title": "Des Helden Friedenswerke", "bar": 685, "lahde": "Rösch (alkaa T. 685)"},
    ],
    "rehearsal": {
        "22": "sooloviulu alkaa (kumppani), orchestraexcerpts: 'Reh. 22-32 (Concertmaster Solo)'",
        "32": "sooloviulun jakso päättyy",
        "42": "kolme B-trumpettia (kulissitrumpetit), trumpetexcerpts: 'rehearsal 42 - rehearsal 43'",
        "50-55": "taistelu: Es-trumpetti 1",
        "58-61": "taistelu: B-trumpetti 1",
        "65-66": "taistelu: Es-trumpetti",
    },
}


# --- yhdistäminen ---------------------------------------------------------------------------
def load_chunk(d):
    d = Path(d)
    am = json.loads((d / "analysis.json").read_text(encoding="utf-8"))
    A = np.fromfile(d / "analysis.f32", dtype=np.float32).reshape(am["frames"], -1)
    lm = json.loads((d / "listen.json").read_text(encoding="utf-8"))
    L = np.fromfile(d / "listen.f32", dtype=np.float32).reshape(lm["frames"], -1)
    beats = json.loads((d / "beats.json").read_text(encoding="utf-8"))
    ev = json.loads((d / "events.json").read_text(encoding="utf-8"))["events"] if (d / "events.json").exists() else []
    return {"dir": str(d), "start": am["start"], "dur": am["duration"], "A": A, "Ach": am["channels"], "L": L,
            "Lch": lm["channels"], "bars": beats.get("bars", []), "beats": beats.get("beats", []),
            "down": beats.get("downbeats_raaka", []), "keys": am.get("keys_5s", []), "onsets": am.get("onsets", []),
            "events": ev, "music_start": am.get("music_start", 0.0)}


def stitch(chunks):
    chunks = sorted(chunks, key=lambda c: c["start"])
    end = max(c["start"] + c["dur"] for c in chunks)
    n = int(round(end * FPS)) + 1
    # kanavat nimen mukaan: demo400:ssa on myös stemmit ja sävelkorkeudet, muissa osissa ei
    ach = [x for x in chunks[0]["Ach"] if all(x in c["Ach"] for c in chunks)]
    lch = [x for x in chunks[0]["Lch"] if all(x in c["Lch"] for c in chunks)]
    A = np.zeros((n, len(ach)), np.float32)
    L = np.zeros((n, len(lch)), np.float32)
    # vaihtokohta: seuraavan osan alku + puolet limityksestä
    cuts = []
    for k in range(len(chunks) - 1):
        a, b = chunks[k], chunks[k + 1]
        ov = a["start"] + a["dur"] - b["start"]
        cuts.append(b["start"] + max(0.0, ov) / 2)
    cuts.append(end + 1)
    lo = 0.0
    bars, beats, down, onsets, keys, events = [], [], [], [], [], []
    for k, c in enumerate(chunks):
        hi = cuts[k]
        i0, i1 = int(round(lo * FPS)), min(n, int(round(hi * FPS)))
        j0 = i0 - int(round(c["start"] * FPS))
        m = min(i1 - i0, len(c["A"]) - j0, len(c["L"]) - j0)
        if m > 0:
            A[i0:i0 + m] = c["A"][j0:j0 + m][:, [c["Ach"].index(x) for x in ach]]
            L[i0:i0 + m] = c["L"][j0:j0 + m][:, [c["Lch"].index(x) for x in lch]]
        inside = lambda t: lo <= t < hi
        bars += [b["t"] for b in c["bars"] if inside(b["t"])]
        beats += [t for t in c["beats"] if inside(t)]
        down += [t for t in c["down"] if inside(t)]
        onsets += [t for t in c["onsets"] if inside(t)]
        keys += [k2 for k2 in c["keys"] if inside(k2["t"])]
        events += [e for e in c["events"] if inside(e["t"])]
        lo = hi
    return {"n": n, "A": A, "Ach": ach, "L": L, "Lch": lch, "bars": np.array(sorted(bars)), "beats": np.array(sorted(beats)),
            "down": np.array(sorted(down)), "onsets": np.array(sorted(onsets)), "keys": keys, "events": events,
            "music_start": chunks[0]["music_start"], "chunks": [c["dir"] for c in chunks]}


def channels(S):
    """Koko puolen yli normalisoidut kanavat."""
    A, L = S["A"], S["L"]
    ga = lambda name: A[:, S["Ach"].index(name)]
    # sävelkorkeus (CREPE) puuttuu osista A2-B4 (ei ajettu muistin takia): nollat
    gl = lambda name: L[:, S["Lch"].index(name)] if name in S["Lch"] else np.zeros(len(L), np.float32)
    rel = ga("rel_db")
    music = rel > np.percentile(rel, 8)
    loud = np.clip(rel / max(1e-6, np.percentile(rel[music], 99)), 0, 1)
    loud = gaussian_filter1d(loud, 6)
    fam = lambda keys, sig=12: (lambda x: np.clip(x / max(1e-6, np.percentile(x[music], 95)), 0, 1.5))(
        gaussian_filter1d(np.minimum(1, sum(gl("panns_" + k) for k in keys)), sig))
    F = {
        "horns": fam(["french_horn"]), "tpt": fam(["trumpet", "trombone"]), "brass": fam(["brass_instrument"]),
        "violin": fam(["violin_fiddle"]), "strings": fam(["string_section", "bowed_string_instrument"]),
        "cello": fam(["cello"]), "bass": fam(["double_bass"]), "winds": fam(["wind_instrument_woodwind_instrument", "flute", "clarinet"]),
        "harp": fam(["harp"]), "perc": fam(["timpani", "bass_drum", "drum_roll"], 4), "snare": fam(["snare_drum"], 6),
        "cymbal": fam(["cymbal"], 3), "tutti": fam(["orchestra"], 20),
    }
    chroma = np.stack([ga("chroma_" + p) for p in PCS], axis=1)
    reg = gaussian_filter1d(ga("register"), 15)
    return {"loud": loud, "rel": rel, "music": music, "F": F, "chroma": chroma, "reg": reg,
            "tempo": gl("tempo_bpm"), "mel": gl("johtava_midi"), "melc": gl("johtava_varmuus"),
            "bass": gl("basso_midi"), "bassc": gl("basso_varmuus")}


# --- teemahaku (osajono-DTW, 12 transponointia) -------------------------------------------------
def cens(chroma, down=6):
    """Kromasta CENS-tyyppinen: normalisointi, kvantisointi, tasoitus, harvennus (30 -> 5 fps)."""
    c = chroma / np.maximum(1e-6, chroma.sum(axis=1, keepdims=True))
    q = np.zeros_like(c)
    for th, v in [(0.4, 4), (0.2, 3), (0.1, 2), (0.05, 1)]:
        q[(c > th) & (q == 0)] = v
    q = uniform_filter1d(q, size=down * 2, axis=0)[::down]
    return q / np.maximum(1e-6, np.linalg.norm(q, axis=1, keepdims=True))


def theme_search(template, seq, max_hits=24, thr=None, min_gap=8.0, step_s=0.2):
    """Palauttaa osumat [(alku_s, loppu_s, kustannus, transponointi)]."""
    hits = []
    for shift in range(12):
        X = np.roll(template, shift, axis=1).T
        D, _ = librosa.sequence.dtw(X=X, Y=seq.T, metric="cosine", subseq=True, step_sizes_sigma=np.array([[1, 1], [1, 2], [2, 1]]))
        cost = D[-1] / X.shape[1]
        for j in range(1, len(cost) - 1):
            if cost[j] <= cost[j - 1] and cost[j] <= cost[j + 1]:
                hits.append((j, float(cost[j]), shift))
    hits.sort(key=lambda h: h[1])
    if thr is None:
        allc = np.array([h[1] for h in hits])
        thr = np.percentile(allc, 3)
    out = []
    L = template.shape[0]
    for j, c, sh in hits:
        if c > thr:
            break
        t_end = j * step_s
        t0 = max(0.0, t_end - L * step_s)
        if all(abs(t0 - o[0]) > min_gap for o in out):
            out.append((t0, t_end, c, sh))
        if len(out) >= max_hits:
            break
    return sorted(out)


# --- tapahtumat -----------------------------------------------------------------------------------
def runs(mask, min_len_s, fps=FPS):
    out, i, n = [], 0, len(mask)
    while i < n:
        if mask[i]:
            j = i
            while j < n and mask[j]:
                j += 1
            if (j - i) / fps >= min_len_s:
                out.append((i / fps, j / fps))
            i = j
        else:
            i += 1
    return out


def key_of(chroma_mean):
    """Krumhansl-Schmuckler: paras duuri/molli."""
    maj = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
    mnr = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
    best = (-9, "")
    for k in range(12):
        for prof, name in [(maj, "duuri"), (mnr, "molli")]:
            r = np.corrcoef(chroma_mean, np.roll(prof, k))[0, 1]
            if r > best[0]:
                best = (r, f"{PCS[k]} {name}")
    return best[1], best[0]


def dom7_score(ch):
    """Dominanttiseptimisoinnun kroma: pohja, terssi, kvintti, pieni septimi (paras transponointi)."""
    c = ch / np.maximum(1e-6, ch.sum(axis=1, keepdims=True))
    best = np.zeros(len(c)), np.zeros(len(c), int)
    tpl = np.zeros(12)
    tpl[[0, 4, 7, 10]] = 1
    for k in range(12):
        s = c @ np.roll(tpl, k)
        better = s > best[0]
        best[0][better] = s[better]
        best[1][better] = k
    return best


def bar_at(bars, t):
    if len(bars) == 0:
        return None
    if t < bars[0]:
        return 1 + (t - bars[0]) / 2.0
    k = int(np.searchsorted(bars, t, side="right") - 1)
    if k >= len(bars) - 1:
        return k + 1 + (t - bars[-1]) / max(0.5, bars[-1] - bars[-2])
    return k + 1 + (t - bars[k]) / (bars[k + 1] - bars[k])


def mmss(t):
    return f"{int(t // 60)}:{t % 60:04.1f}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--A", nargs="+", type=Path, required=True)
    ap.add_argument("--B", nargs="+", type=Path, required=True)
    ap.add_argument("--out", type=Path, default=ROOT / "build" / "koko")
    args = ap.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    sides = {1: stitch([load_chunk(d) for d in args.A]), 2: stitch([load_chunk(d) for d in args.B])}
    C = {s: channels(S) for s, S in sides.items()}
    found = []

    def add(side, t, theme, note, conf, how, t1=None, **kw):
        S = sides[side]
        e = {"side": side, "t": round(float(t), 2), "theme": theme, "note": note, "varmuus": round(float(conf), 2), "peruste": how}
        if t1 is not None:
            e["t1"] = round(float(t1), 2)
        b = bar_at(S["bars_side"], t) if "bars_side" in S else None
        if b is not None:
            e["tahti_ruudukko"] = round(float(b), 1)
        e.update(kw)
        found.append(e)
        return e

    # --- tahtiruudukko koko levylle: A-puoli jatkuu B-puolelle (tahtiluku kertyy) ---
    A_bars = sides[1]["bars"]
    music_A = C[1]["music"]
    sides[1]["bars_side"] = A_bars
    # B-puolen tahtiluku jatkuu A:n viimeisestä (puolenvaihto on tauko äänitteessä, ei partituurissa)
    sides[2]["bars_side"] = sides[2]["bars"]
    nA = len(A_bars)

    # --- 1. sankariteema: malli A-puolen tahdeista 1-4 ---
    t_hero = sides[1]["music_start"]
    b1 = A_bars[A_bars >= t_hero - 0.5]
    t_h0 = b1[0] if len(b1) else t_hero
    t_h1 = b1[4] if len(b1) > 4 else t_h0 + 8
    seqA, seqB = cens(C[1]["chroma"]), cens(C[2]["chroma"])
    tpl = seqA[int(t_h0 * 5):int(t_h1 * 5)]
    hero_hits = {1: theme_search(tpl, seqA), 2: theme_search(tpl, seqB)}

    # --- 2. dominanttiseptimi ja yleistauko: voimakas dom7-kroma, jonka jälkeen yli 1 s hiljaisuus ---
    for s in (1, 2):
        c = C[s]
        sc, root = dom7_score(gaussian_filter1d(c["chroma"], 3, axis=0))
        silent = runs((c["rel"] < np.percentile(c["rel"][c["music"]], 6)) & (np.arange(len(c["rel"])) / FPS > sides[s]["music_start"] + 5), 1.2)
        for a, b in silent:
            i = int(a * FPS)
            if i < 30 or b > (len(c["rel"]) / FPS) - 30:
                continue
            w = slice(max(0, i - 30), i)
            if c["loud"][w].max() < 0.6:
                continue
            k = int(np.argmax(sc[w]))
            r = int(root[w][k])
            add(s, a - (30 - k) / FPS, "hero_dom7" if s == 1 and a < 400 else "suuri_tauko",
                f"{PCS[r]}7-sointu (dominanttiseptimi, kroman osuvuus {sc[w][k]:.2f}) ja {b - a:.1f} s hiljaisuus",
                min(1.0, sc[w][k] * 1.6), "dom7-kroma + yleistauko", t1=b, sointu=f"{PCS[r]}7")

    # --- 3. sooloviulu: viulu soi, orkesteri ohut ---
    for s in (1, 2):
        c = C[s]
        solo = gaussian_filter1d(c["F"]["violin"] * (1 - np.clip(c["F"]["tutti"], 0, 1)) * (1 - c["loud"] * 0.7), 30)
        mask = solo > np.percentile(solo[c["music"]], 85)
        for a, b in runs(mask, 6.0):
            add(s, a, "companion", f"sooloviulu (viulu korkealla, orkesteri ohut) {b - a:.0f} s", min(1, float(solo[int(a * FPS):int(b * FPS)].mean() * 2)), "PANNs viulu / tutti", t1=b)

    # --- 4. rakkauskohtaus: Ges-duuri (F# duuri) ja harppu ---
    for s in (1, 2):
        c = C[s]
        win = 8 * FPS
        for i in range(0, len(c["loud"]) - win, 2 * FPS):
            cm = c["chroma"][i:i + win].mean(axis=0)
            k, r = key_of(cm)
            if k == "F# duuri" and c["F"]["harp"][i:i + win].mean() > 0.35 and r > 0.6:
                add(s, i / FPS, "love", f"Ges-duuri (F#) ja harppu ({c['F']['harp'][i:i + win].mean():.2f})", r, "sävellaji + harppu", t1=(i + win) / FPS)

    # --- 5. kulissitrumpetit: trumpetti hiljaa (kaukaa), ei tuttia ---
    for s in (1, 2):
        c = C[s]
        far = gaussian_filter1d(c["F"]["tpt"] * (1 - c["loud"]) * (1 - np.clip(c["F"]["tutti"], 0, 1)), 10)
        mask = far > max(0.25, np.percentile(far[c["music"]], 97))
        for a, b in runs(mask, 1.0):
            add(s, a, "fanfare", f"hiljaiset trumpetit (kaukaa?) {b - a:.1f} s", float(far[int(a * FPS):int(b * FPS)].max()), "PANNs trumpetti / voimakkuus", t1=b)

    # --- 6. taistelu: virvelirumpu (sotilasrumpu) ja voimakkuus ---
    for s in (1, 2):
        c = C[s]
        bat = gaussian_filter1d(c["F"]["snare"] * c["loud"], 30)
        mask = bat > max(0.15, np.percentile(bat[c["music"]], 80))
        for a, b in runs(mask, 10.0):
            add(s, a, "battle", f"virvelirumpu ja voimakas soitto {b - a:.0f} s", float(bat[int(a * FPS):int(b * FPS)].mean() * 3), "PANNs virvelirumpu × voimakkuus", t1=b)

    # --- 7. sankariteema: osumat (palaako Es-duurissa voimakkaana = kertaus) ---
    for s in (1, 2):
        c = C[s]
        for t0, t1, cost, sh in hero_hits[s]:
            if s == 1 and abs(t0 - t_h0) < 2:
                theme = "hero"
                note = "sankariteeman alku (malli, tahdit 1-4): käyrätorvet ja sellot Es-duurissa"
            else:
                theme = "hero"
                note = "sankariteema palaa"
            key = PCS[(3 + sh) % 12]
            lo = float(c["loud"][int(t0 * FPS):int(t1 * FPS)].mean())
            if s == 2 and key == "Eb" and lo > 0.6:
                theme = "recapitulation"
                note = "sankariteema Es-duurissa ja voimakkaana (kertaus?)"
            add(s, t0, theme, f"{note}; sävellaji {key}, voimakkuus {lo:.2f}", max(0.0, 1 - cost * 3), "sankariteeman kromamalli, osajono-DTW", t1=t1, savellaji=key, dtw=round(cost, 3))

    # --- 8. loppusointu: viimeinen voimakas Es-duurisointu ja häipyminen ---
    c = C[2]
    idx = np.where(c["music"])[0]
    last = idx[-1] / FPS if len(idx) else 0
    k, r = key_of(c["chroma"][max(0, idx[-1] - 20 * FPS):idx[-1]].mean(axis=0)) if len(idx) else ("", 0)
    add(2, last - 12, "coda", f"loppusointu ja häipyminen ({k}), musiikki loppuu {mmss(last)}", r, "voimakkuus + sävellaji", t1=last)

    # --- tahtianalyysi: ruudukon tahdit lähteiden ankkureihin ---
    dom = [e for e in found if e["theme"] == "hero_dom7"]
    bar_report = {"A_ruudukon_tahteja": int(nA), "B_ruudukon_tahteja": int(len(sides[2]["bars"]))}
    if dom:
        tg = bar_at(A_bars, dom[0]["t"])
        bar_report["dom7"] = {"aika": mmss(dom[0]["t"]), "ruudukon_tahti": round(tg, 2), "lahde_tahti": 117,
                              "ero_tahteina": round(tg - 117, 2)}
    # tahtien kestojen poikkeamat: mahdolliset tuplatut tai puuttuvat tahdit
    dur = np.diff(A_bars)
    med = gaussian_filter1d(dur, 4)
    odd = [{"tahti": int(i + 1), "aika": mmss(A_bars[i]), "kesto": round(float(dur[i]), 2), "ymparisto": round(float(med[i]), 2)}
           for i in range(len(dur)) if dur[i] < 0.62 * med[i] or dur[i] > 1.6 * med[i]]
    bar_report["A_poikkeavat_tahdit"] = odd[:40]

    # --- tallennus ---
    for s, S in sides.items():
        c = C[s]
        np.savez_compressed(args.out / ("A.npz" if s == 1 else "B.npz"), loud=c["loud"], reg=c["reg"], chroma=c["chroma"],
                            tempo=c["tempo"], mel=c["mel"], melc=c["melc"], bass=c["bass"], bassc=c["bassc"],
                            bars=S["bars"], beats=S["beats"], down=S["down"], onsets=S["onsets"],
                            **{"F_" + k: v for k, v in c["F"].items()})
        (args.out / ("A_events.json" if s == 1 else "B_events.json")).write_text(
            json.dumps({"events": S["events"], "keys": S["keys"]}, ensure_ascii=False, indent=1), encoding="utf-8")
    found.sort(key=lambda e: (e["side"], e["t"]))
    out = {"lahteet": SOURCE, "tahdit": bar_report, "tunnistetut": found}
    (args.out / "teemat.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    for e in found:
        print(f"{'AB'[e['side'] - 1]} {mmss(e['t']):>7}  tahti {e.get('tahti_ruudukko', '-'):>6}  {e['theme']:<15} {e['varmuus']:.2f}  {e['note']}")
    print(json.dumps(bar_report, ensure_ascii=False, indent=1)[:1500])


if __name__ == "__main__":
    main()
