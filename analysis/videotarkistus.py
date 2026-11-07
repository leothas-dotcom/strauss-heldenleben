"""Valmiin videon tarkistus: ääni totuutta vasten, iskujen ruudut ja jähmettymät.

1. Ääni: videon ääniraita verrataan sovittuun totuuteen (kuuntelukopio) kellot.py:n menetelmällä.
2. Iskut: jokaiselle teemakartan `isku`-luokan kohdalle videon alueella haetaan suurin kuvamuutos
   iskun ympäriltä. Oikea ruutu on ensimmäinen, joka alkaa aikaisintaan 33 ms ennen ääntä
   (kuvakäsikirjoitus, luku 4). Muutos on ruudun keskimääräinen kirkkausero edelliseen.
   Teemakartan iskut ovat pakollisia (poikkeama = virhe). Lisäksi listataan videon puolen pakettien
   (A: demo400, A2, A3; B: B1–B4) aksentit.json:n kovat iskut (z >= 9) vain tiedoksi: niillä ei ole
   suunniteltua kuvatapahtumaa, joten niistä ei lasketa poikkeamia.
3. Jähmettymät: vähintään 4 peräkkäistä lähes muuttumatonta ruutua ennen yleistaukoa (held_gp),
   jolloin liike on pysähtynyt (käyttäjän linjaus 30.10.2026: liike ei pysähdy).

    python -I analysis/videotarkistus.py runs/torviritari-400/renders/heldenleben_torviritari_400s.mp4 [--start 0]
"""
import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import kellot  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
TRUTH = {1: ROOT / "build" / "kuuntelu" / "A_puoli_kuuntelu.wav", 2: ROOT / "build" / "kuuntelu" / "B_puoli_kuuntelu.wav"}
PACKS = {1: ["demo400", "A2", "A3"], 2: ["B1", "B2", "B3", "B4"]}   # analyysipaketit puolen mukaan
FPS = 30
STILL = 0.08   # ruutujen välinen muutos (0-255), jonka alla kuva on lähes pysähtynyt
W, H = 160, 90


def frame_changes(video):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(video), "-vf", f"scale={W}:{H},format=gray", "-f", "rawvideo", "-"],
                         capture_output=True, check=True).stdout
    fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
    return np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2)), len(fr)   # d[k] = muutos ruutuun k+1


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser()
    ap.add_argument("video", type=Path)
    ap.add_argument("--start", type=float, default=0.0, help="videon alku puolen ajassa")
    ap.add_argument("--side", type=int, default=1)
    a = ap.parse_args()
    bad = 0

    # 1. ääni
    with tempfile.TemporaryDirectory() as td:
        wav = Path(td) / "aani.wav"
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(a.video), "-vn", "-c:a", "pcm_s16le", str(wav)], check=True)
        dur = kellot.sf.info(str(wav)).duration
        print(f"== Ääni vs. {TRUTH[a.side].name}")
        worst, _ = kellot.check(wav, a.side, a.start, kellot.times_for(dur), a.video.name, TRUTH[a.side])
        bad += not (worst < 2)
        # ääniraidan on katettava koko video (virhe 30.10.2026: paketin soundtrack loppui 400 s:iin)
        vdur = float(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=duration",
                                     "-of", "csv=p=0", str(a.video)], capture_output=True, text=True, check=True).stdout.strip().strip(",") or 0)
        if vdur and abs(vdur - dur) > 0.5:
            print(f"VIRHE: ääniraita {dur:.1f} s, kuva {vdur:.1f} s: ääni ei kata koko videota")
            bad += 1
        # eikä ääni saa vaieta siellä, missä totuus soi
        y, sr = kellot.sf.read(str(wav), dtype="float32", always_2d=True)
        yt, srt = kellot.sf.read(str(TRUTH[a.side]), dtype="float32", always_2d=True, start=int(a.start * 48000), stop=int((a.start + dur) * 48000))
        def rms_db(x, s_, w=5.0):
            n = int(w * s_); m = len(x) // n
            v = x[: m * n].reshape(m, n, -1).mean(axis=2)
            return 20 * np.log10(np.sqrt((v ** 2).mean(axis=1)) + 1e-9)
        rv, rt = rms_db(y, sr), rms_db(yt, srt)
        mm = min(len(rv), len(rt))
        mute = [i * 5 for i in range(mm) if rt[i] > -45 and rv[i] < -60]
        if mute:
            print(f"VIRHE: video on mykkä, vaikka totuus soi, alkaen {a.start + mute[0]:.0f} s ({len(mute)} ikkunaa)")
            bad += 1

    # 2. iskut: teemakartan isku-kohdat (pakolliset) ja puolen pakettien aksentit (tiedoksi)
    d, n = frame_changes(a.video)
    t_end = a.start + n / FPS
    m = json.loads((ROOT / "annotations" / "teemat.json").read_text(encoding="utf-8"))
    hits = [e for e in m["events"] if e["side"] == a.side and e.get("luokka") == "isku" and a.start + 0.5 < e["t"] < t_end - 0.5]
    seen = {round(e["t"], 1) for e in hits}
    info = []
    for name in PACKS[a.side]:
        pk = ROOT / "build" / name / "aksentit.json"
        if not pk.exists():
            continue
        aj = json.loads(pk.read_text(encoding="utf-8"))
        for x in aj.get("aksentit", []):
            if x.get("z", 0) >= 9 and a.start + 0.5 < x["t"] < t_end - 0.5 and round(x["t"], 1) not in seen:
                info.append({"id": f"aks_{name}_{x['t']:.2f}", "t": x["t"], "z": x.get("z", 0)}); seen.add(round(x["t"], 1))
    hits.sort(key=lambda e: e["t"])
    info.sort(key=lambda e: e["t"])

    def frame_of(e):
        i = int(np.ceil((e["t"] - a.start - 1 / FPS) * FPS - 1e-6))   # oikean ruudun indeksi
        lo, hi = max(1, i - 4), min(len(d), i + 3)
        k = lo + int(np.argmax(d[lo - 1:hi - 1]))                    # ruutu, johon suurin muutos
        around = float(np.median(d[max(0, i - 16):max(1, i - 4)]))
        return i, k, around

    print(f"\n== Teemakartan iskut ({len(hits)}, pakolliset): oikea ruutu = ensimmäinen, joka alkaa aikaisintaan 33 ms ennen ääntä")
    print("tunniste              ääni     oikea ruutu  suurin muutos  muutos  ympärillä  tulos")
    for e in hits:
        i, k, around = frame_of(e)
        ok = k == i
        bad += not ok
        print(f"{e['id']:<20} {e['t']:8.2f}  {a.start + i / FPS:10.3f}  {a.start + k / FPS:12.3f}  {d[k - 1]:6.1f}  {around:9.1f}  {'OK' if ok else f'{k - i:+d} ruutua'}")
    print(f"\n== Aksentit z >= 9 puolen paketeista {', '.join(PACKS[a.side])} ({len(info)}, vain tiedoksi: ei suunniteltua kuvatapahtumaa, ei poikkeamia)")
    print("tunniste              ääni     oikea ruutu  suurin muutos  muutos  ympärillä  ruutuero")
    for e in info:
        i, k, around = frame_of(e)
        print(f"{e['id']:<20} {e['t']:8.2f}  {a.start + i / FPS:10.3f}  {a.start + k / FPS:12.3f}  {d[k - 1]:6.1f}  {around:9.1f}  {k - i:+d}")

    # 3. jähmettymät ennen yleistaukoa
    gp = next((e["t"] for e in m["events"] if e["id"] == "held_gp" and e["side"] == a.side), t_end)
    ts = a.start + (np.arange(len(d)) + 1) / FPS
    still = (d < STILL) & (ts > a.start + 1) & (ts < gp)
    runs, cur = [], 0
    for k, s in enumerate(still):
        cur = cur + 1 if s else 0
        if cur == 4:
            runs.append(ts[k - 3])
    print(f"\n== Jähmettymät ennen yleistaukoa ({gp:.1f} s): {len(runs)}" + (f": {[round(float(x), 2) for x in runs[:12]]}" if runs else ""))
    bad += len(runs)
    print(f"\n{'KAIKKI KUNNOSSA' if not bad else f'{bad} poikkeamaa'}")


if __name__ == "__main__":
    main()
