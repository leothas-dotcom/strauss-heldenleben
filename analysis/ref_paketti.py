"""Referenssiäänitteen kevyt analyysipaketti ja soitinhavaintojen siirto Kraussin aikaan.

docs/julkaisu2.md luku 1.3 ja docs/prompti_julkaisu2_vaihe1.md tehtävä 4. Referenssi (audio/ref/*.flac) ei ole
LP-puoli, joten prepare.py/analyze.py eivät sovi sellaisinaan. Tämä tekee listen.py:lle riittävän paketin
(vain `--steps soittimet`):
  clean_44k.wav     mono 44,1 kHz (referenssi on puhdas, ei kohinanpoistoa)
  prepare.json      side="ref", start=0, duration
  analysis.json/.f32  yksi kanava: loudness (ruudun RMS dB), music_start = --musiikki-alku
Sitten `listen.py build/ref_<nimi> --steps soittimet` → listen.json/.f32 (panns_*-kanavat referenssin ajassa).

`--vaihe siirto` lukee listen.f32:n ja linjaus.json:n kuvauksen (Krauss-sekunti → ref-aika) ja kirjoittaa
soittimet_krauss_aika.json: jokaiselle Krauss-sekunnille kunkin panns_*-kanavan maksimi vastaavassa
ref-ikkunassa, sekä kolme vahvinta luokkaa. Referenssin ajat eivät päädy tästä eteenpäin mihinkään.

    python -I analysis/ref_paketti.py --vaihe paketti --ref audio/ref/ref_Us1jfC7bMpA.flac --nimi hr2015 --kesto 1500 --musiikki-alku 21
    python -I analysis/listen.py build/ref_hr2015 --steps soittimet
    python -I analysis/ref_paketti.py --vaihe siirto --nimi hr2015
"""
import argparse
import json
from pathlib import Path

import librosa
import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
FPS = 30


def paketti(a):
    out = ROOT / "build" / f"ref_{a.nimi}"
    out.mkdir(parents=True, exist_ok=True)
    y, sr = librosa.load(str(a.ref), sr=44100, mono=True, offset=0.0, duration=a.kesto)
    kesto = len(y) / sr
    sf.write(out / "clean_44k.wav", y, sr, subtype="FLOAT")
    n = int(round(kesto * FPS))
    hop = sr // FPS  # 1470
    rms = librosa.feature.rms(y=y, frame_length=2048, hop_length=hop, center=True)[0][:n]
    loud = np.full(n, -90.0, dtype=np.float32)
    loud[: len(rms)] = 20 * np.log10(rms + 1e-9)
    loud[:, None].astype(np.float32).tofile(out / "analysis.f32")
    (out / "prepare.json").write_text(json.dumps({
        "side": "ref", "start": 0.0, "duration": round(kesto, 3), "sr": sr, "lahde": str(Path(a.ref)),
        "huom": "referenssiäänite analyysiin (ei julkaisuun); ei kohinanpoistoa; ajat referenssin omia",
        "files": ["clean_44k.wav"]}, indent=2, ensure_ascii=False), encoding="utf-8")
    (out / "analysis.json").write_text(json.dumps({
        "fps": FPS, "frames": n, "music_start": a.musiikki_alku, "channels": ["loudness"], "dtype": "float32",
        "layout": "frames x channels", "huom": "kevyt paketti ref_paketti.py:stä listen.py --steps soittimet varten"},
        indent=1, ensure_ascii=False), encoding="utf-8")
    print(f"paketti {out}: {kesto:.1f} s, {n} ruutua")


def siirto(a):
    out = ROOT / "build" / f"ref_{a.nimi}"
    meta = json.loads((out / "listen.json").read_text(encoding="utf-8"))
    x = np.fromfile(out / "listen.f32", dtype=np.float32).reshape(meta["frames"], len(meta["channels"]))
    ch = [c for c in meta["channels"] if c.startswith("panns_")]
    idx = [meta["channels"].index(c) for c in ch]
    lin = json.loads((out / "linjaus.json").read_text(encoding="utf-8"))
    kuvaus = {s: r for s, r, _ in lin["kuvaus_krauss_to_ref"]}
    rivit = []
    for s in sorted(kuvaus):
        if s + 1 not in kuvaus:
            break
        r0, r1 = kuvaus[s], kuvaus[s + 1]
        if r1 <= r0:
            r1 = r0 + 0.2
        f0, f1 = int(r0 * FPS), max(int(r1 * FPS), int(r0 * FPS) + 1)
        if f0 >= meta["frames"]:
            break
        seg = x[f0:min(f1, meta["frames"]), idx]
        mx = seg.max(axis=0)
        top = np.argsort(-mx)[:3]
        rivit.append({"krauss_s": s, "ref_s": [round(r0, 2), round(r1, 2)],
                      "panns": {c[6:]: round(float(v), 3) for c, v in zip(ch, mx)},
                      "top3": [[ch[k][6:], round(float(mx[k]), 3)] for k in top]})
    tulos = {"lahde": meta.get("device"), "ref": str(lin["ref"]), "linjaus": "build/ref_hr2015/linjaus.json",
             "huom": "Krauss-sekunti s -> referenssin ikkuna [ref_s0, ref_s1); arvo = panns-kanavan maksimi ikkunassa. "
                     "Linjaus on Gefährtinin alussa noin 3 s edellä (raportti), muualla ±0,4 s.",
             "kanavat": [c[6:] for c in ch], "sekunnit": rivit}
    (out / "soittimet_krauss_aika.json").write_text(json.dumps(tulos, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"siirto: {len(rivit)} Krauss-sekuntia, {len(ch)} kanavaa -> {out / 'soittimet_krauss_aika.json'}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--vaihe", choices=("paketti", "siirto"), required=True)
    ap.add_argument("--nimi", default="hr2015")
    ap.add_argument("--ref", default=str(ROOT / "audio" / "ref" / "ref_Us1jfC7bMpA.flac"))
    ap.add_argument("--kesto", type=float, default=1500.0)
    ap.add_argument("--musiikki-alku", type=float, default=21.0)
    a = ap.parse_args()
    (paketti if a.vaihe == "paketti" else siirto)(a)


if __name__ == "__main__":
    main()
