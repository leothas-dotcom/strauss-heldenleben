"""Referenssiäänitteen linjaus Kraussin aikaan ja levyn nopeuden mittaus (docs/julkaisu2.md luvut 1.3 ja 1.5).

Referenssi (esim. hr-Sinfonieorchester / Orozco-Estrada 2015, audio/ref/ref_Us1jfC7bMpA.flac) on vain
analyysin apuväline: sen ajat eivät koskaan päädy videoon, kuunteluoppaaseen tai teemakarttaan muuten kuin
tämän kuvauksen kautta. Kraussin aika = kuuntelukopio build/kuuntelu/A_puoli_kuuntelu.wav (sovittu totuus).

Tekee kolme asiaa:
  1. Viritys: librosa.estimate_tuning molemmista (sentit suhteessa A440) jaksoittain. Erotus
     Krauss - ref on arvio levyn nopeusvirheestä, jos orkesterit soittavat samalla viritystasolla
     (hr ~443 Hz, WPh 1952 todennäköisesti 443-445 [tarkista]) -> julkaisu2.md 1.5.
  2. DTW: chroma_cqt (viritys korjattuna) 5 ruutua/s, Sakoe-Chiba-ikkuna, koko A-puoli kerralla.
     Tulos: kuvaus t_ref -> t_krauss sekunnin välein, paikallinen nopeussuhde ja residuaalit
     tunnetuissa jaksorajoissa (referenssin kuvauksen ajat vs. teemakartan sections).
  3. Laatuportti: residuaali jaksorajoilla <= 1,0 s, muuten linjaus hylätään (exit 2).

Tulosteet (build/ref_<nimi>/): linjaus.json, linjaus.md, linjaus.png.

    python -I analysis/linjaus.py --ref audio/ref/ref_Us1jfC7bMpA.flac --nimi hr2015 \
        --ref-rajat 21,272,480,1214
"""
import argparse
import json
from pathlib import Path

import librosa
import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
KRAUSS = ROOT / "build" / "kuuntelu" / "A_puoli_kuuntelu.wav"
TEEMAT = ROOT / "annotations" / "teemat.json"
SR = 22050
FPS = 5  # chroma-ruutuja sekunnissa DTW:lle
HOP = 512


def lataa(path, start=0.0, duration=None):
    y, sr = librosa.load(str(path), sr=SR, mono=True, offset=start, duration=duration)
    return y


def viritys(y, alku, kesto=90.0, askel=300.0, loppu=None):
    """Viritys senteissä (suhteessa A440) jaksoittain; palauttaa listan (t, sentit)."""
    out = []
    t = alku
    loppu = loppu if loppu is not None else len(y) / SR
    while t + kesto <= loppu:
        seg = y[int(t * SR): int((t + kesto) * SR)]
        tun = librosa.estimate_tuning(y=seg, sr=SR, bins_per_octave=120)  # osuus puolisävelaskelesta
        out.append((round(t, 1), round(float(tun) * 100.0, 1)))
        t += askel
    return out


def chroma(y, tuning_cents):
    # tuning = poikkeama CQT-bineinä (bins_per_octave=36 -> 3 biniä/puolisävelaskel)
    c = librosa.feature.chroma_cqt(y=y, sr=SR, hop_length=HOP, bins_per_octave=36, tuning=tuning_cents / 100.0 * 3, n_chroma=12)
    # 5 ruutua/s: keskiarvo ikkunoittain
    per = int(round(SR / HOP / FPS))
    n = c.shape[1] // per
    c = c[:, : n * per].reshape(12, n, per).mean(axis=2)
    # pieni tasainen pohja, jotta hiljainen ruutu ei ole nollavektori (kosinietäisyys antaisi NaN:in)
    c = c + 1e-4
    c = c / np.linalg.norm(c, axis=0, keepdims=True)
    return c.astype(np.float32)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ref", required=True, help="referenssiäänite (audio/ref/...)")
    ap.add_argument("--nimi", required=True, help="tulostekansion nimi: build/ref_<nimi>")
    ap.add_argument("--krauss", default=str(KRAUSS))
    ap.add_argument("--ref-alku", type=float, default=0.0, help="referenssin musiikin alku (s)")
    ap.add_argument("--ref-loppu", type=float, default=None, help="referenssin raja A-puolen DTW:lle (s); oletus: kunnes Krauss A loppuu +120 s")
    ap.add_argument("--ref-rajat", default="", help="referenssin jaksorajat sekunteina järjestyksessä held,widersacher,gefaehrtin,walstatt")
    ap.add_argument("--max-residuaali", type=float, default=1.0)
    a = ap.parse_args()

    out = ROOT / "build" / f"ref_{a.nimi}"
    out.mkdir(parents=True, exist_ok=True)
    teemat = json.loads(TEEMAT.read_text(encoding="utf-8"))
    sec = {s["id"]: s for s in teemat["sections"] if s["side"] == 1}
    k_alku = sec["held"]["start"]

    print("lataa Krauss (kuuntelukopio, totuusaika)")
    yk = lataa(a.krauss)
    k_kesto = len(yk) / SR
    # Referenssi rajataan A-puolen alueelle: koko levy (B-puoli mukana) vääristäisi Sakoe-Chiba-diagonaalin.
    r_loppu = a.ref_loppu if a.ref_loppu else a.ref_alku + (k_kesto - k_alku) + 120.0
    print(f"lataa referenssi 0-{r_loppu:.0f} s")
    yr = lataa(a.ref, 0.0, r_loppu)

    # 1. viritys
    vk = viritys(yk, k_alku + 5.0, loppu=min(k_kesto, 1230.0))
    vr = viritys(yr, a.ref_alku + 5.0, loppu=len(yr) / SR)
    med_k = float(np.median([c for _, c in vk]))
    med_r = float(np.median([c for _, c in vr]))
    ero = med_k - med_r
    nopeus = 2 ** (ero / 1200.0)
    print(f"viritys: Krauss {med_k:+.1f} c, ref {med_r:+.1f} c, erotus {ero:+.1f} c -> nopeussuhde {nopeus:.4f} ({(nopeus-1)*100:+.2f} %)")

    # 2. DTW
    print("chroma")
    ck = chroma(yk, med_k)
    cr = chroma(yr, med_r)
    print(f"DTW {cr.shape[1]} x {ck.shape[1]} ruutua")
    D, wp = librosa.sequence.dtw(X=cr, Y=ck, metric="cosine", global_constraints=True, band_rad=0.12)
    wp = wp[::-1]  # (i_ref, j_krauss), nouseva
    t_ref = wp[:, 0] / FPS
    t_kr = wp[:, 1] / FPS
    # yksikäsitteinen kuvaus: jokaiselle Krauss-sekunnille referenssin aika (mediaani polun pisteistä)
    sek = np.arange(0, int(k_kesto) + 1)
    # polulla on samalle Krauss-ruudulle useita ref-ruutuja (pystysuorat askeleet): keskiarvo ruutua kohti,
    # sitten interpolointi sekunnin ruudukkoon (np.interp vaatii aidosti nousevan x:n)
    j_uniq, inv = np.unique(wp[:, 1], return_inverse=True)
    r_mean = np.bincount(inv, weights=wp[:, 0]) / np.bincount(inv)
    kuvaus = np.interp(sek, j_uniq / FPS, r_mean / FPS)
    # paikallinen nopeussuhde d t_ref / d t_krauss 30 s ikkunassa
    slope = np.gradient(np.convolve(kuvaus, np.ones(31) / 31, mode="same"))

    # 3. residuaalit jaksorajoilla
    rajat = {}
    if a.ref_rajat:
        ids = ["held", "widersacher", "gefaehrtin", "walstatt"]
        for sid, tr in zip(ids, [float(x) for x in a.ref_rajat.split(",")]):
            tk = sec[sid]["start"]
            ennuste = float(np.interp(tk, sek, kuvaus))
            rajat[sid] = {"t_krauss": tk, "t_ref_annettu": tr, "t_ref_linjaus": round(ennuste, 2), "residuaali_s": round(ennuste - tr, 2)}
    pahin = max((abs(v["residuaali_s"]) for v in rajat.values()), default=0.0)
    ok = pahin <= a.max_residuaali

    tulos = {
        "ref": str(Path(a.ref).relative_to(ROOT)) if Path(a.ref).is_absolute() else a.ref,
        "krauss": str(Path(a.krauss)),
        "viritys": {"krauss_sentit": vk, "ref_sentit": vr, "mediaani_krauss": round(med_k, 1), "mediaani_ref": round(med_r, 1),
                     "erotus_sentit": round(ero, 1), "nopeussuhde_arvio": round(nopeus, 4),
                     "huom": "erotus = levyn nopeus vain jos viritystasot ovat samat; WPh 1952 [tarkista]"},
        "dtw": {"fps": FPS, "band_rad": 0.12, "kustannus": float(D[-1, -1])},
        "kuvaus_krauss_to_ref": [[int(s), round(float(r), 2), round(float(k), 4)] for s, r, k in zip(sek, kuvaus, slope)],
        "jaksorajat": rajat, "pahin_residuaali_s": round(pahin, 2), "hyvaksytty": ok,
    }
    (out / "linjaus.json").write_text(json.dumps(tulos, ensure_ascii=False, indent=1), encoding="utf-8")

    md = [f"# Linjaus: {a.nimi} -> Krauss A\n",
          f"- Viritys: Krauss {med_k:+.1f} c, ref {med_r:+.1f} c; erotus **{ero:+.1f} c** -> nopeussuhde {nopeus:.4f} ({(nopeus-1)*100:+.2f} %). Pätee vain, jos viritystasot ovat samat [tarkista].",
          f"- DTW: {cr.shape[1]} x {ck.shape[1]} ruutua, {FPS}/s, ikkuna 12 %; kustannus {D[-1,-1]:.1f}",
          f"- Paikallinen nopeussuhde (ref/Krauss) mediaani {np.median(slope[int(k_alku):int(k_kesto)-5]):.3f}: >1 = Krauss nopeampi (tempo + levyn nopeus yhdessä)\n",
          "| jakso | Krauss s | ref annettu s | ref linjaus s | residuaali s |", "|---|---|---|---|---|"]
    for sid, v in rajat.items():
        md.append(f"| {sid} | {v['t_krauss']} | {v['t_ref_annettu']} | {v['t_ref_linjaus']} | {v['residuaali_s']:+.2f} |")
    md.append(f"\n**{'HYVÄKSYTTY' if ok else 'HYLÄTTY'}**: pahin residuaali {pahin:.2f} s (raja {a.max_residuaali} s)")
    md.append("\nViritys jaksoittain (t, sentit): Krauss " + ", ".join(f"{t}:{c:+.0f}" for t, c in vk))
    md.append("ref " + ", ".join(f"{t}:{c:+.0f}" for t, c in vr))
    (out / "linjaus.md").write_text("\n".join(md), encoding="utf-8")

    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        fig, ax = plt.subplots(2, 1, figsize=(10, 7), sharex=True)
        ax[0].plot(sek, kuvaus); ax[0].set_ylabel("t_ref (s)"); ax[0].set_title(f"{a.nimi} -> Krauss")
        for sid, v in rajat.items():
            ax[0].plot(v["t_krauss"], v["t_ref_annettu"], "rx")
        ax[1].plot(sek, slope); ax[1].axhline(1, color="k", lw=0.5); ax[1].set_ylabel("d t_ref / d t_krauss"); ax[1].set_xlabel("t_krauss (s)")
        ax[1].set_ylim(0.6, 1.6)
        fig.tight_layout(); fig.savefig(out / "linjaus.png", dpi=110)
    except Exception as e:  # kuva on valinnainen
        print("kuva ohitettu:", e)

    print("\n".join(md))
    raise SystemExit(0 if ok else 2)


if __name__ == "__main__":
    main()
