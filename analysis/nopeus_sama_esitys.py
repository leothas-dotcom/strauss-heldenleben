"""Levyn nopeus saman esityksen toisesta siirrosta (Decca-remaster vs. oma LP-siirto).

docs/julkaisu2.md luku 1.5. Kun vertailuraita on SAMA esitys (Krauss/WPh 1952, Deccan virallinen julkaisu),
tempo on identtinen ja kaksi toisistaan riippumatonta mittaria kertovat siirtojen nopeuseron ilman
oletuksia orkesterin viritystasosta:
  1. kesto: iskukäyrien (onset strength, 0,05 s) ristikorrelaatio aikaskaalan r ja siirron d yli
     Krauss 7.6-239.2 s (Der Held) -> r = raidan kesto / LP:n kesto samalle musiikille.
  2. sävelkorkeus: CREPE samoista tahdeista (alun Es-duuri, dom7-sointu; raidan ikkunat kuvattu r:llä ja d:llä)
     -> erotus senteissä.
Jos LP on nopea kertoimella 1/r, sen sävel on 1200*log2(r) senttiä korkeampi: mittarien pitää täsmätä.

    python -I analysis/nopeus_sama_esitys.py --raita audio/ref/ref_decca_held.flac --nimi decca
"""
import argparse
import json
import sys
from pathlib import Path

import librosa
import numpy as np
from scipy.signal import correlate

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "analysis"))
from nopeus import KRAUSS, crepe, poikkeama  # noqa: E402

K_ALKU, K_TAUKO = 7.6, 239.2  # Krauss: musiikin alku, dom7-soinnun katkeaminen (teemakartta)
SR, HOP_S = 22050, 0.05
A_IKKUNA = (7.6, 20.0)        # alun Es-duuri (nopeus.py kohta A)
C_IKKUNA = (229.0, 238.5)     # dom7-sointu (nopeus.py kohta C)


def iskukayra(path, t0=0.0, kesto=None):
    y, sr = librosa.load(str(path), sr=SR, mono=True, offset=t0, duration=kesto)
    hop = int(SR * HOP_S)
    env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
    t = t0 + np.arange(len(env)) * HOP_S
    env = (env - env.mean()) / (env.std() + 1e-9)
    return t, env


def skaala_ja_siirto(t_k, e_k, t_r, e_r, r_vali=(0.96, 1.04), askel=0.0002):
    """Etsi r ja d siten, että raidan käyrä e_r ajassa d + (t - K_ALKU) * r vastaa LP:n käyrää e_k.
    Palauttaa (r, d, korrelaatio) ja koko profiilin."""
    paras = None
    profiili = []
    for r in np.arange(r_vali[0], r_vali[1] + 1e-9, askel):
        # raita LP:n aikaskaalaan: näyte LP:n ruudulle t vastaa raidan aikaa t * r (siirto haetaan korrelaatiolla)
        t_skaalattu = t_r / r
        e_rs = np.interp(np.arange(0, t_skaalattu[-1], HOP_S), t_skaalattu, e_r)
        c = correlate(e_k, e_rs, mode="full", method="fft")
        i = int(np.argmax(c))
        lag = (i - (len(e_rs) - 1)) * HOP_S  # e_k:n aika, johon e_rs:n alku osuu
        # normalisoitu korrelaatio
        n = min(len(e_k), len(e_rs))
        corr = float(c[i] / n)
        profiili.append((round(float(r), 4), round(corr, 4)))
        if paras is None or corr > paras[2]:
            paras = (float(r), float(lag), corr)
    r, lag, corr = paras
    # raidan aika 0 osuu LP:n aikaan t_k[0] + lag; LP:n K_ALKU vastaa raidan aikaa:
    d = (K_ALKU - (t_k[0] + lag)) * r
    return r, d, corr, profiili


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--raita", required=True, help="vertailuraita, sama esitys (esim. audio/ref/ref_decca_held.flac)")
    ap.add_argument("--nimi", default="decca")
    ap.add_argument("--kynnys", type=float, default=0.7)
    a = ap.parse_args()
    out = ROOT / "build" / f"ref_{a.nimi}"
    out.mkdir(parents=True, exist_ok=True)

    t_k, e_k = iskukayra(KRAUSS, K_ALKU - 2.0, (K_TAUKO - K_ALKU) + 4.0)
    t_r, e_r = iskukayra(a.raita)
    r, d, corr, profiili = skaala_ja_siirto(t_k, e_k, t_r, e_r)
    # toiseksi paras r kaukana parhaasta kertoo, onko huippu yksikäsitteinen
    prof = sorted(profiili, key=lambda x: -x[1])
    toinen = next((p for p in prof if abs(p[0] - r) > 0.003), None)

    def raita_aika(t):
        return d + (t - K_ALKU) * r

    kesto_c = 1200 * np.log2(r)
    md = [f"# Nopeus saman esityksen toisesta siirrosta: {a.nimi} vs. LP\n",
          f"Raita `{a.raita}` ({t_r[-1]:.1f} s). Iskukäyrien ristikorrelaatio LP 7.6–239.2 s (Der Held) yli skaalan r ja siirron d.\n",
          f"- **Kestosuhde r = {r:.5f}** ({(r - 1) * 100:+.2f} %), korrelaatio {corr:.3f}"
          + (f" (toiseksi paras erillinen huippu r = {toinen[0]}, {toinen[1]:.3f})" if toinen else ""),
          f"- LP:n aika {K_ALKU} s vastaa raidan aikaa {d:.2f} s; LP {K_TAUKO} s → raita {raita_aika(K_TAUKO):.2f} s",
          f"- r > 1 tarkoittaa, että LP soi nopeammin kuin {a.nimi}: vastaava sävelero {kesto_c:+.1f} c\n"]

    kohdat = {
        "A_alku_Es": {"krauss": A_IKKUNA, "fmin": 60, "fmax": 1200},
        "C_dom7": {"krauss": C_IKKUNA, "fmin": 60, "fmax": 2000},
    }
    md += ["| kohta | äänite | ruutuja | mediaani c | MAD c | p25..p75 | sävelluokat |", "|---|---|---|---|---|---|---|"]
    tulos = {"raita": a.raita, "kestosuhde_r": round(float(r), 5), "siirto_d": round(float(d), 3), "korrelaatio": round(corr, 4),
             "kesto_sentteina": round(float(kesto_c), 1), "profiili": profiili, "kohdat": {}}
    erot = []
    for kid, k in kohdat.items():
        rivi = {}
        for nimi, path, ikk in (("krauss", KRAUSS, k["krauss"]),
                                ("raita", Path(a.raita), (raita_aika(k["krauss"][0]), raita_aika(k["krauss"][1])))):
            hz, per = crepe(path, ikk[0], ikk[1], k["fmin"], k["fmax"])
            p = poikkeama(hz, per, a.kynnys)
            rivi[nimi] = p
            if p:
                md.append(f"| {kid} | {nimi} {ikk[0]:.1f}–{ikk[1]:.1f} s | {p['n']} | {p['mediaani_c']:+.1f} | {p['mad_c']} | {p['p25_c']:+.0f}..{p['p75_c']:+.0f} | {p['savelluokat']} |")
        if rivi["krauss"] and rivi["raita"]:
            rivi["erotus_c"] = round(rivi["krauss"]["mediaani_c"] - rivi["raita"]["mediaani_c"], 1)
            erot.append(rivi["erotus_c"])
        tulos["kohdat"][kid] = rivi
    ero = float(np.mean(erot)) if erot else float("nan")
    k_savel = 2 ** (-ero / 1200)
    tulos.update({"savelero_c": round(ero, 1), "k_savelesta": round(float(k_savel), 5), "k_kestosta": round(float(1 / r), 5)})
    md.append(f"\n**Sävelero LP − {a.nimi}: {ero:+.1f} c** (kohdittain {', '.join(f'{e:+.1f}' for e in erot)}); kestosta {kesto_c:+.1f} c. "
              f"LP:n nopeuskerroin suhteessa {a.nimi}an: sävelestä k = {k_savel:.5f}, kestosta k = {1 / r:.5f}. "
              f"Mittarit täsmäävät, jos ero on alle noin 3 c (0,2 %).")
    md.append(f"\nKorjaus b) kertoimella k = {k_savel:.5f}: sävel laskee {ero:.1f} c ja A-puolen musiikki (1216 s) pitenee "
              f"{1216 * (1 / k_savel - 1):+.1f} s; {a.nimi}n absoluuttinen taso on raidan mediaani (yllä), LP:n korjattu taso = LP − ero.")
    (out / "nopeus_sama_esitys.json").write_text(json.dumps(tulos, ensure_ascii=False, indent=1), encoding="utf-8")
    (out / "nopeus_sama_esitys.md").write_text("\n".join(md), encoding="utf-8")


if __name__ == "__main__":
    main()
