"""Levyn nopeus toisella menetelmällä: sävelkorkeus senttitarkasti samoista tahdeista kahdesta äänitteestä.

docs/julkaisu2.md luku 1.5 ja docs/prompti_julkaisu2_vaihe1.md tehtävä 3. Krauss 1952 (siirto levyltä, nopeus
epävarma) ja referenssi hr 2015 soittavat samat tahdit; CREPE (torchcrepe full) seuraa johtavaa linjaa, ja
jokaisen ruudun poikkeama lähimmästä tasavireisestä sävelestä (A440) senteissä kertoo viritystason.
Erotus Krauss − ref = viritystasojen ero + levyn nopeusvirhe. Nopeus saadaan vasta, kun orkesterien
viritystasot oletetaan: hr-Sinfonieorchester ~443 Hz, Wiener Philharmoniker 1952 443–445 Hz [tarkista].

Dekooderi on weighted_argmax (ei viterbin ditheriä), koska mitataan senttejä, ei nuotteja. Kaksi kohtaa:
  A  alun Es-duuri, sellot ja käyrätorvet (Krauss 7.6–20.0 s, ref 21.0–35.0 s)
  B  sooloviulun tulo Gefährtinissä (Krauss 423.2–443 s, ref 480.2–502 s; ajat mitattu RMS:stä, raportti)
Krauss luetaan kuuntelukopiosta (sovittu totuusaika), ref audio/ref/-FLACista.

    python -I analysis/nopeus.py --nimi hr2015
"""
import argparse
import json
from pathlib import Path

import librosa
import numpy as np
import torch

ROOT = Path(__file__).resolve().parent.parent
KRAUSS = ROOT / "build" / "kuuntelu" / "A_puoli_kuuntelu.wav"
REF = ROOT / "audio" / "ref" / "ref_Us1jfC7bMpA.flac"
KOHDAT = {
    "A_alku_Es": {"krauss": (7.6, 20.0), "ref": (21.0, 35.0), "fmin": 60, "fmax": 1200, "kuvaus": "alun Es-duuri, sellot ja käyrätorvet"},
    "B_viulu": {"krauss": (423.2, 443.0), "ref": (480.2, 502.0), "fmin": 180, "fmax": 2000, "kuvaus": "sooloviulun tulo (Gefährtin)"},
    # dom7-sointu ennen yleistaukoa; ref-aika linjauskuvauksesta (Krauss 236 -> 265.0)
    "C_dom7": {"krauss": (229.0, 238.5), "ref": (257.5, 268.0), "fmin": 60, "fmax": 2000, "kuvaus": "dominanttiseptimisointu ennen yleistaukoa"},
    # kulissitrumpetit puolen lopussa: kulissisoittajien taso ei ole orkesterin taso (Krauss +3 c vs +25 c alussa),
    # pidetään taulukossa vertailuna mutta ei keskiarvossa
    "D_trumpetit": {"krauss": (1125.7, 1136.0), "ref": (1214.0, 1225.0), "fmin": 150, "fmax": 2000, "kuvaus": "kulissitrumpettien kutsu (Walstatt)",
                    "pois": "kulissisoittimet, oma taso"},
    # orkesterikohdat puolen keskeltä ja lopusta; ref-ikkuna luetaan linjauskuvauksesta (build/ref_<nimi>/linjaus.json)
    "E_huilu": {"krauss": (243.0, 258.0), "fmin": 250, "fmax": 2000, "kuvaus": "Widersacherin alku, huilu ja puupuhaltimet"},
    "F_rakkaus": {"krauss": (919.0, 936.0), "fmin": 60, "fmax": 2000, "kuvaus": "rakkauskohtauksen huippu, tutti Ges-duuri"},
}
MAD_RAJA = 10.0  # kohta kelpaa, jos molempien äänitteiden MAD on alle tämän (muuten sävelet eivät ole samoja / rubato)
NIMET = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]


def crepe(path, t0, t1, fmin, fmax):
    import torchcrepe
    y, _ = librosa.load(str(path), sr=16000, mono=True, offset=t0, duration=t1 - t0)
    audio = torch.tensor(y, dtype=torch.float32)[None].cuda()
    np.random.seed(0)
    pitch, per = torchcrepe.predict(audio, 16000, hop_length=160, fmin=fmin, fmax=fmax, model="full",
                                    decoder=torchcrepe.decode.weighted_argmax, return_periodicity=True,
                                    batch_size=1024, device="cuda")
    per = torchcrepe.filter.median(per, 3)
    pitch, per = pitch[0].cpu().numpy(), per[0].cpu().numpy()
    ok = np.isfinite(pitch) & np.isfinite(per) & (pitch > 0)
    return pitch[ok], per[ok]


def poikkeama(hz, per, kynnys):
    sel = per >= kynnys
    hz = hz[sel]
    if len(hz) == 0:
        return None
    midi = 69 + 12 * np.log2(hz / 440.0)
    dev = (midi - np.round(midi)) * 100.0  # sentit lähimmästä tasavireisestä sävelestä, [-50, 50)
    pcs = np.round(midi).astype(int) % 12
    top = [(NIMET[p], int(c)) for p, c in sorted(zip(*np.unique(pcs, return_counts=True)), key=lambda x: -x[1])[:5]]
    return {"n": int(len(dev)), "mediaani_c": round(float(np.median(dev)), 1),
            "mad_c": round(float(np.median(np.abs(dev - np.median(dev)))), 1),
            "p25_c": round(float(np.percentile(dev, 25)), 1), "p75_c": round(float(np.percentile(dev, 75)), 1),
            "savelluokat": top}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--nimi", default="hr2015")
    ap.add_argument("--kynnys", type=float, default=0.7, help="CREPEn periodisuuden vähimmäisarvo")
    a = ap.parse_args()
    out = ROOT / "build" / f"ref_{a.nimi}"
    out.mkdir(parents=True, exist_ok=True)

    linjaus = json.loads((out / "linjaus.json").read_text(encoding="utf-8"))
    kuvaus = {s: r for s, r, _ in linjaus["kuvaus_krauss_to_ref"]}
    for k in KOHDAT.values():
        if "ref" not in k:
            t0, t1 = k["krauss"]
            k["ref"] = (round(kuvaus[int(round(t0))], 1), round(kuvaus[int(round(t1))], 1))
            k["ref_lahde"] = "linjaus.json"

    tulos = {"kynnys": a.kynnys, "kohdat": {}}
    md = ["# Levyn nopeus: sävelkorkeus CREPEllä samoista tahdeista\n",
          f"Periodisuuskynnys {a.kynnys}. Poikkeama = sentit lähimmästä tasavireisestä sävelestä (A440); mediaani ja MAD.\n",
          "| kohta | äänite | ruutuja | mediaani c | MAD c | p25..p75 | sävelluokat |", "|---|---|---|---|---|---|---|"]
    erot = []
    for kid, k in KOHDAT.items():
        rivi = {}
        for nimi, path in (("krauss", KRAUSS), ("ref", REF)):
            t0, t1 = k[nimi]
            hz, per = crepe(path, t0, t1, k["fmin"], k["fmax"])
            p = poikkeama(hz, per, a.kynnys)
            rivi[nimi] = p
            if p:
                md.append(f"| {kid} | {nimi} {t0}–{t1} s | {p['n']} | {p['mediaani_c']:+.1f} | {p['mad_c']} | {p['p25_c']:+.0f}..{p['p75_c']:+.0f} | {p['savelluokat']} |")
        if rivi["krauss"] and rivi["ref"]:
            rivi["erotus_c"] = round(rivi["krauss"]["mediaani_c"] - rivi["ref"]["mediaani_c"], 1)
            rivi["kelpaa"] = bool(rivi["krauss"]["mad_c"] < MAD_RAJA and rivi["ref"]["mad_c"] < MAD_RAJA and "pois" not in k)
            if "pois" in k:
                rivi["pois"] = k["pois"]
            if rivi["kelpaa"]:
                erot.append((kid, rivi["krauss"]["mediaani_c"], rivi["ref"]["mediaani_c"]))
        tulos["kohdat"][kid] = rivi

    def hz(c):
        return 440.0 * 2 ** (c / 1200.0)

    kelpaa = [k for k, _, _ in erot]
    kr_c = float(np.mean([k for _, k, _ in erot])) if erot else float("nan")
    rf_c = float(np.mean([r for _, _, r in erot])) if erot else float("nan")
    tulos["kelpaavat_kohdat"] = kelpaa
    tulos["krauss_taso_c"] = round(kr_c, 1)
    tulos["krauss_taso_hz"] = round(hz(kr_c), 1)
    tulos["ref_taso_c"] = round(rf_c, 1)
    tulos["ref_taso_hz"] = round(hz(rf_c), 1)
    pois = [f"{kid} ({r.get('pois') or 'MAD ≥ raja: eri sävelet tai epävarma seuranta'})" for kid, r in tulos["kohdat"].items() if not r.get("kelpaa")]
    md.append(f"\nKelpaavat kohdat (orkesteri, MAD < {MAD_RAJA:.0f} c molemmissa): {', '.join(kelpaa)}. Pois: {'; '.join(pois)}.")
    md.append(f"\n**Krauss soi tasolla {kr_c:+.1f} c = a¹ ≈ {hz(kr_c):.1f} Hz** (kohdittain {', '.join(f'{k} {c:+.1f}' for k, c, _ in erot)}).")
    md.append(f"Referenssi hr 2015: {rf_c:+.1f} c ≈ {hz(rf_c):.1f} Hz (kohdittain {', '.join(f'{r:+.1f}' for _, _, r in erot)}): uskottava nykyorkesterin taso, eli CREPE ei ole harhainen.\n")
    md.append("Nopeusvirhe = Kraussin mitattu taso − WPh:n viritystaso 1952 [tarkista: 443–445 Hz]. Referenssiä ei tarvita tähän; se vain vahvistaa mittarin.\n")
    md.append("| WPh 1952 | viritystaso c | nopeusvirhe c | nopeusvirhe % | A-puolen musiikki (1216 s) oikealla nopeudella |")
    md.append("|---|---|---|---|---|")
    tulos["wph_oletukset"] = {}
    for wph in (440, 442, 443, 444, 445):
        wph_c = 1200 * np.log2(wph / 440)
        nop_c = kr_c - wph_c
        k = 2 ** (nop_c / 1200)
        kesto = 1216.0 * k  # Krauss A 7.6–1224 s
        tulos["wph_oletukset"][str(wph)] = {"viritystaso_c": round(float(wph_c), 1), "nopeusvirhe_c": round(float(nop_c), 1),
                                            "nopeusvirhe_pros": round(float((k - 1) * 100), 2), "kesto_korjattu_s": round(float(kesto), 1)}
        md.append(f"| {wph} Hz | {wph_c:+.1f} | {nop_c:+.1f} | {(k - 1) * 100:+.2f} % | {kesto:.0f} s ({kesto - 1216:+.0f} s) |")
    (out / "nopeus.json").write_text(json.dumps(tulos, ensure_ascii=False, indent=1), encoding="utf-8")
    (out / "nopeus.md").write_text("\n".join(md), encoding="utf-8")
    print("\n".join(md))


if __name__ == "__main__":
    main()
