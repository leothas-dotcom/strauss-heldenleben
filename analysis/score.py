"""Partituurin luku: sivut, järjestelmät, tahtiviivat ja tahtinumerot.

Partituuri: IMSLP 19168 (Leuckart 1899, Dover-näköispainos), projektin juuressa. Sivut ovat
JBIG2-kuvia; PyMuPDF renderöi ne. Tahtiviivat tunnistetaan kuvasta:
  * nuottiviivat = rivit, joilla on pitkä vaakasuora musteviiva; viisi viivaa = viivasto
  * järjestelmä = viivastojen ryhmä; iso pystyväli erottaa sivun kaksi järjestelmää
  * tahtiviiva = pystyviiva, joka ylittää valtaosan järjestelmän viivastoista koko korkeudeltaan
    (varret ja palkit eivät ylitä kokonaisia viivastoja useassa soitinryhmässä)
Tahtinumerot juoksevat ensimmäiseltä nuottisivulta (s. 3). Rajoitus: yksinäisillä
viulusoolon riveillä (s. 34-45) varret tulkitaan tahtiviivoiksi, ja haalea harmaasävysivu 15
jää vajaaksi, joten numerot ovat suuntaa antavia [tarkista]. Ankkurit tarkistetaan kuvista. Tulos tarkistetaan lähteiden tahdeista
(Rösch: dominanttiseptimi T. 117, Widersacher T. 118, Gefährtin T. 188, Walstatt T. 368).

Tulosteet (build/partituuri/):
  sivut.json         sivu -> järjestelmät, tahtiviivojen x, ensimmäinen ja viimeinen tahti
  sNNN.png           sivut (110 dpi) tahtinumeroineen tarkistusta varten
    python -I analysis/score.py [--pdf ...] [--pages 3-20]
"""
import argparse
import json
from pathlib import Path

import numpy as np
import pymupdf
from scipy.ndimage import maximum_filter1d, label, find_objects
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PDF = ROOT / "IMSLP19168-PMLP04982-Strauss_-_Ein_Heldenleben,_Op._40_(orch._score).pdf"
OUT = ROOT / "build" / "partituuri"
DPI_DETECT = 200
DPI_VIEW = 110


def staff_lines(ink):
    """Nuottiviivojen rivit: rivin mustan osuus yli 45 % leveydestä."""
    frac = ink.mean(axis=1)
    rows = np.where(frac > 0.45)[0]
    lines, cur = [], []
    for r in rows:
        if cur and r - cur[-1] > 1:
            lines.append(int(np.mean(cur)))
            cur = []
        cur.append(r)
    if cur:
        lines.append(int(np.mean(cur)))
    return lines


def staves(lines):
    """Viiden viivan ryhmät (sallii puuttuvan viivan)."""
    out, i = [], 0
    while i < len(lines):
        grp = [lines[i]]
        j = i + 1
        while j < len(lines) and lines[j] - grp[-1] < 3.2 * (np.median(np.diff(lines[i:i + 5])) if i + 5 <= len(lines) else 30) and len(grp) < 5:
            grp.append(lines[j])
            j += 1
        if len(grp) >= 4:
            out.append((grp[0], grp[-1]))
            i = j
        else:
            i += 1
    return out


def staff_bar_xs(ink, staff):
    """Yhden viivaston tahtiviivaehdokkaat: sarakkeet, joissa muste ylittää viivaston koko korkeudelta."""
    a, b = staff
    seg = ink[a:b + 1]
    raw = seg.mean(axis=0)
    # tahtiviiva kattaa koko viivaston (varsi vain ~3,5 väliä neljästä): kynnys 0,95
    c = maximum_filter1d(raw, size=5) > 0.95
    xs, cur = [], []
    for x in np.where(c)[0]:
        if cur and x - cur[-1] > 2:
            xs.append(float(np.mean(cur)))
            cur = []
        cur.append(x)
    if cur:
        xs.append(float(np.mean(cur)))
    # ohut viiva: vieressä (±7 px) viivaston keskiosa on enimmäkseen tyhjää (ei numeroita, avaimia)
    W = ink.shape[1]
    mid = ink[a + (b - a) // 4:b - (b - a) // 4]
    keep = []
    for x in xs:
        xi = int(round(x))
        side = [mid[:, max(0, xi - 9):max(0, xi - 5)].mean() if xi - 9 >= 0 else 0, mid[:, min(W, xi + 5):min(W, xi + 9)].mean() if xi + 9 < W else 0]
        if max(side) < 0.45:
            keep.append(x)
    return keep


def _match(xa, xb, tol=7):
    if not xa or not xb:
        return 0.0
    ma = sum(1 for x in xa if any(abs(x - y) < tol for y in xb))
    mb = sum(1 for y in xb if any(abs(x - y) < tol for x in xa))
    return 0.5 * (ma / len(xa) + mb / len(xb))


def systems_by_bars(ink, stv):
    """Järjestelmät tahtiviivojen paikoista: saman järjestelmän viivastoilla viivat ovat samoissa
    x-kohdissa, eri järjestelmällä eri kohdissa (alkuviiva ja haarukat ovat katkonaisia)."""
    xs = [staff_bar_xs(ink, s) for s in stv]
    out, cur, cur_x = [], [], []
    for s, x in zip(stv, xs):
        if not cur:
            cur, cur_x = [s], [x]
            continue
        # vertaa järjestelmän viivastoihin, joilla on ehdokkaita
        ref = [r for r in cur_x if len(r) >= 2]
        sim = max([_match(x, r) for r in ref], default=1.0) if len(x) >= 2 else 1.0
        if sim < 0.45:
            out.append((cur, cur_x))
            cur, cur_x = [s], [x]
        else:
            cur.append(s)
            cur_x.append(x)
    if cur:
        out.append((cur, cur_x))
    return out


def consensus(xs_list, frac=0.4, tol=7):
    """Tahtiviivat, jotka löytyvät vähintään osuudelta frac järjestelmän viivastoista."""
    pts = sorted(x for xs in xs_list for x in xs)
    groups = []
    for x in pts:
        if groups and x - groups[-1][-1] < tol:
            groups[-1].append(x)
        else:
            groups.append([x])
    need = max(1, int(np.ceil(frac * len([1 for xs in xs_list if xs]))))
    lines = [float(np.mean(g)) for g in groups if len(g) >= need]
    merged = []
    for x in lines:
        if merged and x - merged[-1] < 14:
            merged[-1] = max(merged[-1], x)
        else:
            merged.append(x)
    return merged


def systems_by_line(ink, stv):
    """Järjestelmät vasemman reunan alkuviivasta: pitkä pystysuora musteviiva, joka yhdistää
    järjestelmän kaikki viivastot. Viivastot ryhmitellään sen mukaan, minkä viivan sisään ne osuvat."""
    if not stv:
        return []
    H, W = ink.shape
    left = min(a for a, b in stv)
    x0 = int(W * 0.03)
    x1 = int(W * 0.25)
    sh = np.median([b - a for a, b in stv])
    best = []
    for x in range(x0, x1):
        col = ink[:, max(0, x - 1):x + 2].any(axis=1)
        runs, y = [], 0
        while y < H:
            if col[y]:
                y2 = y
                while y2 < H and col[y2]:
                    y2 += 1
                if y2 - y > 3 * sh:
                    runs.append((y, y2))
                y = y2
            else:
                y += 1
        cover = sum(r[1] - r[0] for r in runs)
        if cover > sum(r[1] - r[0] for r in best):
            best = runs
    void = left
    if not best:
        return [stv]
    out = []
    for (y0, y1) in best:
        grp = [s for s in stv if s[0] >= y0 - sh and s[1] <= y1 + sh]
        if grp:
            out.append(grp)
    rest = [s for s in stv if not any(s in g for g in out)]
    return out if out and not rest else [stv]


def systems(stv):
    """Iso pystyväli viivastojen välissä erottaa järjestelmät."""
    if not stv:
        return []
    gaps = [stv[k + 1][0] - stv[k][1] for k in range(len(stv) - 1)]
    if not gaps:
        return [stv]
    med = np.median(gaps)
    out, cur = [], [stv[0]]
    for k, g in enumerate(gaps):
        if g > max(3.0 * med, 120):
            out.append(cur)
            cur = []
        cur.append(stv[k + 1])
    out.append(cur)
    return out


def barlines(ink, sys_staves):
    """Sarakkeet, joissa muste ylittää koko viivaston useimmissa järjestelmän viivastoissa."""
    H, W = ink.shape
    cov = np.zeros(W)
    for (a, b) in sys_staves:
        # viiva saa olla 1-2 px leveä ja hieman vino: sarakkeiden maksimi 5 px:n ikkunassa
        seg = ink[a:b + 1]
        c = seg.mean(axis=0)
        c = maximum_filter1d(c, size=5)
        cov += (c > 0.85)
    need = max(2, int(np.ceil(0.5 * len(sys_staves))))
    cols = np.where(cov >= need)[0]
    xs, cur = [], []
    for c in cols:
        if cur and c - cur[-1] > 2:
            xs.append(float(np.mean(cur)))
            cur = []
        cur.append(c)
    if cur:
        xs.append(float(np.mean(cur)))
    # kaksoisviivat ja paksut viivat yhdeksi
    merged = []
    for x in xs:
        if merged and x - merged[-1] < 14:
            merged[-1] = max(merged[-1], x)
        else:
            merged.append(x)
    return merged


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pdf", type=Path, default=PDF)
    ap.add_argument("--pages", default="")
    ap.add_argument("--first-page", type=int, default=3, help="ensimmäinen nuottisivu (1-2: nimiö, soittimet)")
    a = ap.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    doc = pymupdf.open(a.pdf)
    pages = range(doc.page_count)
    if a.pages:
        p0, p1 = [int(x) for x in a.pages.split("-")]
        pages = range(p0 - 1, p1)
    font = ImageFont.load_default(size=22)
    result, bar = [], 0
    crops = []
    for p in pages:
        if p + 1 < a.first_page:
            continue
        pg = doc[p]
        pix = pg.get_pixmap(dpi=DPI_DETECT, colorspace=pymupdf.csGRAY)
        img = np.frombuffer(pix.samples, np.uint8).reshape(pix.height, pix.width)
        ink = img < 140
        lines = staff_lines(ink)
        stv = staves(lines)
        sy = systems_by_bars(ink, stv)
        rec = {"page": p + 1, "systems": []}
        for s, sx in sy:
            xs = consensus(sx)
            if len(xs) < 2:
                continue
            # vasemmanpuoleisin pystyviiva on järjestelmän alku, muut päättävät tahdin
            n = len(xs) - 1
            rec["systems"].append({"y0": s[0][0], "y1": s[-1][1], "staves": len(s), "barlines": [round(x, 1) for x in xs],
                                   "first_bar": bar + 1, "last_bar": bar + n})
            bar += n
        for si, (s_st, _) in enumerate(sy):
            if si >= len(rec["systems"]):
                break
            S = rec["systems"][si]
            xs_s = S["barlines"]
            sp = np.median([b - a for a, b in s_st]) / 4  # viivaväli
            for (ta, tb) in s_st:
                y0 = int(max(0, ta - 9 * sp)); y1 = int(ta - 1.2 * sp)
                if y1 - y0 < 10:
                    continue
                band = ink[y0:y1, int(xs_s[0]):int(xs_s[-1])]
                lab, nl = label(band)
                objs = find_objects(lab)
                boxes = []
                for k, sl in enumerate(objs):
                    h = sl[0].stop - sl[0].start; w = sl[1].stop - sl[1].start
                    fill = (lab[sl] == k + 1).mean()
                    if 2.2 * sp <= h <= 5.5 * sp and 0.6 * sp <= w <= 4.5 * sp and fill > 0.28:
                        boxes.append([sl[1].start, sl[0].start, sl[1].stop, sl[0].stop])
                boxes.sort()
                groups = []
                for bx in boxes:
                    if groups and bx[0] - groups[-1][2] < 1.2 * sp and abs(bx[1] - groups[-1][1]) < 1.5 * sp:
                        g = groups[-1]; groups[-1] = [g[0], min(g[1], bx[1]), bx[2], max(g[3], bx[3])]
                    else:
                        groups.append(list(bx))
                for g in groups:
                    if g[2] - g[0] > 7 * sp:
                        continue
                    gx = g[0] + int(xs_s[0])
                    j = max(0, int(np.searchsorted(xs_s, gx + 0.3 * sp)) - 1)
                    crops.append({"page": p + 1, "bar": S["first_bar"] + min(j, len(xs_s) - 2), "x": gx, "y": y0 + g[1],
                                  "box": [gx - int(sp), y0 + g[1] - int(sp), g[2] + int(xs_s[0]) + int(sp), y0 + g[3] + int(sp)]})
        if rec["systems"]:
            rec["first_bar"] = rec["systems"][0]["first_bar"]
            rec["last_bar"] = rec["systems"][-1]["last_bar"]
        result.append(rec)
        # tarkistuskuva: tahtinumero jokaisen tahdin alkuun
        vp = pg.get_pixmap(dpi=DPI_VIEW)
        im = Image.frombytes("RGB", (vp.width, vp.height), vp.samples)
        dr = ImageDraw.Draw(im)
        k = DPI_VIEW / DPI_DETECT
        for s in rec["systems"]:
            xs = s["barlines"]
            for j in range(len(xs) - 1):
                x = xs[j] * k + 3
                dr.rectangle([x, s["y0"] * k - 30, x + 44, s["y0"] * k - 6], fill=(245, 70, 26))
                dr.text((x + 3, s["y0"] * k - 30), str(s["first_bar"] + j), fill=(255, 255, 255), font=font)
            for x in xs:
                dr.line([(x * k, s["y0"] * k - 4), (x * k, s["y0"] * k - 0)], fill=(20, 62, 102), width=3)
        im.save(OUT / f"s{p + 1:03d}.png")
        print(f"sivu {p + 1:3d}: järjestelmiä {len(rec['systems'])}, tahdit {rec.get('first_bar', '-')}-{rec.get('last_bar', '-')}")
    (OUT / "sivut.json").write_text(json.dumps(result, ensure_ascii=False, indent=1), encoding="utf-8")
    # harjoitusnumeroehdokkaat: samasta tahdista vain yksi (järjestelmän ylin)
    seen, uniq = set(), []
    for c in crops:
        if (c["page"], c["bar"]) in seen:
            continue
        seen.add((c["page"], c["bar"]))
        uniq.append(c)
    (OUT / "harjoitusnumerot_ehdokkaat.json").write_text(json.dumps(uniq, ensure_ascii=False, indent=1), encoding="utf-8")
    cw, chh, cols = 150, 70, 10
    sheet = Image.new("RGB", (cols * cw, ((len(uniq) + cols - 1) // cols) * chh), "white")
    dr = ImageDraw.Draw(sheet)
    small = ImageFont.load_default(size=13)
    cache = {}
    for k, c in enumerate(uniq):
        if c["page"] not in cache:
            pix = doc[c["page"] - 1].get_pixmap(dpi=DPI_DETECT, colorspace=pymupdf.csGRAY)
            cache = {c["page"]: Image.frombytes("L", (pix.width, pix.height), pix.samples)}
        im = cache[c["page"]].crop(tuple(c["box"]))
        im.thumbnail((cw - 50, chh - 6))
        x, y = (k % cols) * cw, (k // cols) * chh
        sheet.paste(im.convert("RGB"), (x + 48, y + 3))
        dr.text((x + 2, y + 4), f"s{c['page']}", fill=(20, 62, 102), font=small)
        dr.text((x + 2, y + 22), f"T{c['bar']}", fill=(245, 70, 26), font=small)
        dr.text((x + 2, y + 40), f"#{k}", fill=(90, 90, 90), font=small)
        dr.rectangle([x, y, x + cw - 1, y + chh - 1], outline=(200, 200, 200))
    sheet.save(OUT / "harjoitusnumerot_ehdokkaat.png")
    print(f"harjoitusnumeroehdokkaita {len(uniq)}")
    print(f"tahteja yhteensä {bar}")


if __name__ == "__main__":
    main()
