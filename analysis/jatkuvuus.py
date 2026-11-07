"""Jatkuvuustarkistus: paikallinen välkyntä ja äkilliset hypyt valmiissa videossa.

Video dekoodataan harmaasävynä 640x360:ssa (ffmpeg-putki, ruutu kerrallaan muistissa) ja
jokaista pikseliä verrataan naapuriruutuihin.

1. Välkyntä (pulssi): ruutu k poikkeaa sekä ruudusta k-1 että k+1 samaan suuntaan vähintään
   --amp tasoa (0-255), vaikka k-1 ja k+1 ovat keskenään lähellä (ero alle puolet pulssista).
   Myös kahden ruudun pulssi (k ja k+1 poikkeavat, k-1 ja k+2 lähellä) lasketaan.
   Ero mitataan liikekompensoituna: jos naapuriruudun siirto (+-3 px, ehdokkaille +-24 px
   täydessä koossa) selittää pikselin, kyse on liikkuvasta rasterista tai reunasta.
   Pulssi yksinään ei ole virhe: levyn pöly (patina.json, main.js) on pieniä pisteitä
   satunnaisissa paikoissa. Virhe on *toistuva* pulssi: sama pikseli pulssaa vähintään
   --repeat kertaa sekunnin ikkunassa. Toistuvat pikselit kootaan 8x8 lohkoihin (24x24 px
   täydessä koossa) sekunnin ikkunoittain (0,5 s välein) ja ryhmitellään ajan ja paikan mukaan.
2. Hypyt: lohkon liikkeellä selittämätön muutos edelliseen ruutuun on yli --jump-ratio kertaa
   naapuriruutujen muutos ja vähintään --jump-amp, kuva ei palaa seuraavassa ruudussa, ja
   muutos koskee ainakin --jump-blocks lohkoa enintään kahdessa ruudussa (pidempi jälki on
   nopeaa liikettä). Leikkaukset (koko ruudun suuri muutos, myös samannäköiseen ottoon)
   tunnistetaan erikseen, eikä niiden ympäriltä etsitä mitään. Teemakartan `isku`-kohdat
   (+-0,15 s) ja --aksentit-tiedoston iskut (z >= --akz, +-0,1 s) merkitään: ne ovat
   tarkoituksellisia (tyyliohje, luku 8: viirin napsahdus, roiske), eivätkä ne kaada tarkistusta.

Tuloste: löydökset pisteiden mukaan: aika, alue (x, y, w, h) 1920x1080-koordinaatein,
pulssiruutuja sekunnissa, pulssin voimakkuus (keskiarvo/maksimi 0-255), toistuvia pikseleitä
ikkunassa ja pisteet (pikselit x pulssia/s x voimakkuus / 30). Paluuarvo 1, jos jonkin
välkyntälöydöksen pisteet ylittävät --fail-score tai hyppyjä on iskujen ulkopuolella.
Täysi 400 s ajo kestää muutamia minuutteja (CPU).

    python -I analysis/jatkuvuus.py runs/purje-400/renders/heldenleben_purje_400s.mp4 [--start 0] [--from 0 --to 400] [--top 15] [--json out.json]
"""
import argparse
import json
import subprocess
import sys
from collections import deque
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
FPS = 30
W, H = 640, 360
B = 8                         # lohkon koko (pikseleinä 640x360:ssa)
BW, BH = W // B, H // B
SCALE = 1920 / W
CUT = 18.0                    # koko ruudun keskimääräinen muutos (0-255), jonka yli on aina leikkaus
CUT_REL = (5.0, 6.0)          # tai: muutos yli 5 ja yli 6 x ympäröivien ruutujen mediaani (samannäköinen otto)
WIN, HOP = 30, 15             # ikkuna ja askel ruutuina (1 s, 0,5 s)


def frames(video, t0=None, t1=None):
    cmd = ["ffmpeg", "-v", "error"]
    if t0:
        cmd += ["-ss", f"{t0:.3f}"]
    cmd += ["-i", str(video)]
    if t1 is not None:
        cmd += ["-t", f"{t1 - (t0 or 0):.3f}"]
    cmd += ["-vf", f"scale={W}:{H}:flags=area,format=gray", "-f", "rawvideo", "-"]
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE)
    n = W * H
    while True:
        buf = p.stdout.read(n)
        if len(buf) < n:
            break
        yield np.frombuffer(buf, np.uint8).reshape(H, W).astype(np.int16)
    p.wait()


def cut_frames(video, t0, t1):
    """Leikkaukset nopealla 160x90-ajolla: ruudut (0-alkuinen indeksi), joista uusi otto alkaa."""
    cmd = ["ffmpeg", "-v", "error"] + (["-ss", f"{t0:.3f}"] if t0 else []) + ["-i", str(video)]
    if t1 is not None:
        cmd += ["-t", f"{t1 - (t0 or 0):.3f}"]
    raw = subprocess.run(cmd + ["-vf", "scale=160:90:flags=area,format=gray", "-f", "rawvideo", "-"],
                         capture_output=True, check=True).stdout
    fr = np.frombuffer(raw, np.uint8).reshape(-1, 90, 160).astype(np.float32)
    d = np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2))        # d[i] = muutos ruutuun i+1
    out = set()
    for i, x in enumerate(d):
        nb = np.concatenate([d[max(0, i - 8):i], d[i + 1:i + 9]])
        if x > CUT or (x > CUT_REL[0] and x > CUT_REL[1] * (np.median(nb) if nb.size else 0)):
            out.add(i + 1)
    return out


def blocks(a, op=np.sum):
    return op(a.reshape(BH, B, BW, B), axis=(1, 3))


def mc(x, ref, r=1):
    """Pienin ero |x - ref| ref:n siirroilla +-r pikseliä (+-3 px täydessä koossa)."""
    p = np.pad(ref, r, mode="edge")
    out = None
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            d = np.abs(x - p[r + dy:r + dy + H, r + dx:r + dx + W])
            out = d if out is None else np.minimum(out, d)
    return out


def moved(fa, fb, ys, xs, m, R=8, P=3):
    """Selittääkö liike pulssin? Pikselin (ys, xs) 7x7-ympäristö ruudussa fa haetaan ruudusta fb
    siirroilla +-R (+-24 px täydessä koossa). Paras siirto valitaan ympäristön erosta, ja pulssi
    on liikettä, jos keskipikselin ero sillä siirrolla on alle puolet pulssista (nopeasti
    liikkuva rasteri tai kilpirivi). Kadonnut kärki ei löydy mistään siirrosta, koska ympäristö
    osuu paikalleen ja keskipikseli jää eroamaan."""
    if ys.size == 0:
        return np.zeros(0, bool)
    pa = np.pad(fa, P, mode="edge")
    pb = np.pad(fb, P + R, mode="edge")
    oy, ox = np.mgrid[-P:P + 1, -P:P + 1]
    Y, X = ys[:, None, None] + oy, xs[:, None, None] + ox
    A = pa[Y + P, X + P].astype(np.float32)
    best = np.full(len(ys), np.inf, np.float32)
    cen = np.zeros(len(ys), np.float32)
    for dy in range(-R, R + 1):
        for dx in range(-R, R + 1):
            Bp = pb[Y + P + R + dy, X + P + R + dx]
            sad = np.abs(A - Bp).mean(axis=(1, 2))
            better = sad < best
            best = np.where(better, sad, best)
            cen = np.where(better, np.abs(A[:, P, P] - Bp[:, P, P]), cen)
    return cen * 2 < m


def pulses(f0, f1, f2, f3, amp):
    """Pulssin voimakkuus ruudussa f1 (0 = ei pulssia). f0..f3 = ruudut k-1..k+2."""
    a, b = f1 - f0, f1 - f2
    m = np.minimum(mc(f1, f0), mc(f1, f2))
    p1 = (np.sign(a) == np.sign(b)) & (m >= amp) & (np.abs(f2 - f0) * 2 <= m)
    # kahden ruudun pulssi: f1 ja f2 poikkeavat samaan suuntaan, f0 ja f3 lähellä
    c, d = f1 - f0, f2 - f3
    m2 = np.minimum(mc(f1, f0), mc(f2, f3))
    p2 = (np.sign(c) == np.sign(d)) & (m2 >= amp) & (np.abs(f3 - f0) * 2 <= m2) & (np.abs(f2 - f1) * 2 <= m2) & ~p1
    out = np.where(p1, m, 0) + np.where(p2, m2, 0)
    ys, xs = np.nonzero(out)
    if ys.size:
        mm = out[ys, xs].astype(np.float32)
        one = p1[ys, xs]
        ex = moved(f1, f0, ys, xs, mm)                                     # selittyykö edellisestä
        ex[one] |= moved(f1, f2, ys[one], xs[one], mm[one])               # tai seuraavasta
        ex[~one] |= moved(f2, f3, ys[~one], xs[~one], mm[~one])
        out[ys[ex], xs[ex]] = 0
    return out


def components(cells):
    """cells: {(i, by, bx): arvo}; naapuruus +-1 ajassa ja +-1 lohko paikassa."""
    seen, out = set(), []
    for c in cells:
        if c in seen:
            continue
        stack, comp = [c], []
        seen.add(c)
        while stack:
            i, y, x = stack.pop()
            comp.append((i, y, x))
            for di in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        n = (i + di, y + dy, x + dx)
                        if n in cells and n not in seen:
                            seen.add(n)
                            stack.append(n)
        out.append(comp)
    return out


def isku_times(side, start, end):
    m = json.loads((ROOT / "annotations" / "teemat.json").read_text(encoding="utf-8"))
    return [e["t"] for e in m["events"] if e["side"] == side and e.get("luokka") == "isku" and start <= e["t"] <= end]


def aksentti_times(path, zmin, start, end):
    if not path or not Path(path).exists():
        return []
    a = json.loads(Path(path).read_text(encoding="utf-8"))
    return [x["t"] for x in a.get("aksentit", []) if x.get("z", 0) >= zmin and start <= x["t"] <= end]


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser()
    ap.add_argument("video", type=Path)
    ap.add_argument("--start", type=float, default=0.0, help="videon alku puolen ajassa")
    ap.add_argument("--side", type=int, default=1)
    ap.add_argument("--from", dest="t0", type=float, default=0.0, help="tutki videon ajasta (s)")
    ap.add_argument("--to", dest="t1", type=float, default=None)
    ap.add_argument("--amp", type=float, default=20, help="pienin pulssi (0-255)")
    ap.add_argument("--repeat", type=int, default=3, help="pulsseja samassa pikselissä sekunnissa")
    ap.add_argument("--min-px", type=int, default=2, help="toistuvia pikseleitä lohkossa ikkunassa")
    ap.add_argument("--jump-amp", type=float, default=25, help="hypyn pienin lohkomuutos (0-255)")
    ap.add_argument("--jump-ratio", type=float, default=6)
    ap.add_argument("--jump-blocks", type=int, default=4, help="hypyn pienin koko lohkoina")
    ap.add_argument("--aksentit", type=Path, default=ROOT / "build" / "demo400" / "aksentit.json")
    ap.add_argument("--akz", type=float, default=4.0, help="pienin hyväksyttävän aksentin z")
    ap.add_argument("--fail-score", type=float, default=150, help="välkyntälöydöksen pisteraja")
    ap.add_argument("--top", type=int, default=15)
    ap.add_argument("--json", type=Path)
    a = ap.parse_args()

    cut_at = cut_frames(a.video, a.t0, a.t1)
    hist = deque(maxlen=4)               # ruudut k-1..k+2
    pbuf = np.zeros((WIN, H, W), np.uint8)   # pulssien voimakkuus, rengaspuskuri
    flick = {}                           # (ikkuna, by, bx) -> (toistuvat pikselit, pulssiruudut, summa, maksimi, pulsseja)
    ehist = deque(maxlen=9)              # lohkojen liikkeellä selittämätön muutos edelliseen ruutuun
    jumps = []
    n = 0
    for f in frames(a.video, a.t0, a.t1):
        n += 1
        if hist:
            ehist.append(blocks(mc(f, hist[-1], 1).astype(np.float32), np.mean))
        hist.append(f)
        if len(hist) < 4:
            continue
        k = n - 3                        # hist[1] on ruutu k (0-alkuinen)
        near_cut = any(c in cut_at for c in range(k - 1, k + 3))
        p = np.zeros((H, W), np.int16) if near_cut else pulses(*hist, a.amp)
        pbuf[k % WIN] = np.clip(p, 0, 255)
        # hyppy ruutuun k: liikkeellä selittämätön muutos k-1 -> k on moninkertainen naapuriruutuihin
        # verrattuna, liike jatkuu tasaisena (k -> k+1 pieni) eikä kuva palaa (k-1 vs k+1 suuri)
        if len(ehist) == 9 and not any(c in cut_at for c in range(k - 5, k + 4)):
            e = np.stack(ehist)          # e[i] = muutos ruutuun k-6+i (e[6] = k-1 -> k)
            ek = e[6]
            base = np.median(np.delete(e, 6, axis=0), axis=0)
            back = e[7]
            ret = blocks(mc(hist[2], hist[0], 1).astype(np.float32), np.mean)
            jm = (ek >= a.jump_amp) & (ek >= a.jump_ratio * (base + 1)) & (back * 3 < ek) & (ret * 1.5 > ek)
            for by, bx in zip(*np.nonzero(jm)):
                jumps.append((k, int(by), int(bx), float(ek[by, bx])))
        # ikkuna valmis
        if k >= WIN - 1 and (k + 1) % HOP == 0:
            win = (k + 1 - WIN) // HOP
            rep = (pbuf > 0).sum(0) >= a.repeat
            rb = blocks(rep.astype(np.int32))
            hit = np.nonzero(rb >= a.min_px)
            if hit[0].size:
                act = pbuf.reshape(WIN, BH, B, BW, B)
                for by, bx in zip(*hit):
                    cell = act[:, by, :, bx, :]
                    nz = cell[cell > 0]
                    pf = int((cell.reshape(WIN, -1) > 0).any(1).sum())
                    flick[(win, int(by), int(bx))] = (int(rb[by, bx]), pf, float(nz.sum()), int(nz.max()), int(nz.size))
        if n % 1500 == 0:
            print(f"  {a.t0 + n / FPS:7.1f} s", file=sys.stderr, flush=True)

    t_of = lambda i: a.t0 + i / FPS  # noqa: E731
    cuts = sorted(cut_at)
    print(f"== Jatkuvuus: {a.video.name}, {n} ruutua ({n / FPS:.1f} s), leikkauksia {len(cuts)}: "
          + ", ".join(f"{t_of(c):.2f}" for c in cuts))

    # välkyntälöydökset
    res = []
    for comp in components(flick):
        ws = [c[0] for c in comp]
        ys = [c[1] for c in comp]
        xs = [c[2] for c in comp]
        vals = [flick[c] for c in comp]
        t0 = t_of(min(ws) * HOP)
        t1 = t_of(max(ws) * HOP + WIN)
        nwin = len(set(ws))
        per_win = {}                     # pulssiruutuja sekunnissa: alueen paras lohko ikkunaa kohden
        for c, v in zip(comp, vals):
            per_win[c[0]] = max(per_win.get(c[0], 0), v[1])
        rate = float(np.mean(list(per_win.values())))
        npx = sum(v[0] for v in vals)
        mean_amp = sum(v[2] for v in vals) / max(1, sum(v[4] for v in vals))
        score = npx / nwin * rate * mean_amp / 30 * min(1.0, (t1 - t0) / 2) ** 0.5
        res.append(dict(t0=round(t0, 2), t1=round(t1, 2), x=int(min(xs) * B * SCALE), y=int(min(ys) * B * SCALE),
                        w=int((max(xs) - min(xs) + 1) * B * SCALE), h=int((max(ys) - min(ys) + 1) * B * SCALE),
                        rate=round(rate, 1), amp=round(mean_amp, 1), max=max(v[3] for v in vals),
                        px=round(npx / nwin, 1), windows=nwin, score=round(score, 1)))
    res.sort(key=lambda r: -r["score"])
    print(f"\n== Välkyntä: {len(res)} löydöstä (pulssi >= {a.amp:.0f}, sama pikseli >= {a.repeat}/s)")
    print(" #   aika (s)         x     y     w     h   pulssia/s  voim. ka/max  pikseleitä/ikk  pisteet")
    for i, r in enumerate(res[:a.top], 1):
        print(f"{i:2d}  {r['t0']:7.2f}-{r['t1']:7.2f}  {r['x']:4d}  {r['y']:4d}  {r['w']:4d}  {r['h']:4d}  {r['rate']:9.1f}  "
              f"{r['amp']:6.1f}/{r['max']:3d}  {r['px']:14.1f}  {r['score']:7.1f}")

    # hypyt ryhmiteltyinä
    iskut = isku_times(a.side, a.start + a.t0, a.start + a.t0 + n / FPS)
    aks = aksentti_times(a.aksentit, a.akz, a.start + a.t0, a.start + a.t0 + n / FPS)
    jc = {(j[0], j[1], j[2]): j[3] for j in jumps}
    jres = []
    for comp in components(jc):
        fr = [c[0] for c in comp]
        ys = [c[1] for c in comp]
        xs = [c[2] for c in comp]
        if len(comp) < a.jump_blocks or max(fr) - min(fr) > 1:
            continue                     # pieni = pöly; usean ruudun jälki = nopea liike
        t = t_of(min(fr))
        isku = ("isku" if any(abs(a.start + t - ti) < 0.15 for ti in iskut)
                else "aksentti" if any(abs(a.start + t - ti) < 0.1 for ti in aks) else "")
        jres.append(dict(t=round(t, 3), x=int(min(xs) * B * SCALE), y=int(min(ys) * B * SCALE),
                         w=int((max(xs) - min(xs) + 1) * B * SCALE), h=int((max(ys) - min(ys) + 1) * B * SCALE),
                         blocks=len(comp), amp=round(max(jc[c] for c in comp), 1), isku=isku))
    jres.sort(key=lambda r: -r["blocks"] * r["amp"])
    nj = sum(not r["isku"] for r in jres)
    print(f"\n== Hypyt: {len(jres)} ({nj} iskujen ulkopuolella)")
    print("  aika (s)      x     y     w     h  lohkoja  muutos  isku")
    for r in jres[:a.top]:
        print(f"  {r['t']:8.3f}  {r['x']:4d}  {r['y']:4d}  {r['w']:4d}  {r['h']:4d}  {r['blocks']:7d}  {r['amp']:6.1f}  {r['isku'] or '-'}")

    bad_f = [r for r in res if r["score"] > a.fail_score]
    ok = not bad_f and nj == 0
    print(f"\n== Tulos: {'OK' if ok else 'EPÄONNISTUI'}: välkyntää yli rajan {a.fail_score:.0f}: {len(bad_f)}, hyppyjä: {nj}")
    if a.json:
        a.json.write_text(json.dumps(dict(cuts=[t_of(c) for c in cuts], flicker=res, jumps=jres), ensure_ascii=False, indent=1), encoding="utf-8")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
