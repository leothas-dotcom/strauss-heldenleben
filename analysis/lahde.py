"""Lähdeääni yhdestä paikasta: audio/lahde.json.

9.11.2026 lähteeksi vaihdettiin nopeuskorjattu siirto audio/lp_krauss_k/ (k = 0,98598: levy soi +24,4 c yli
Deccan virallisen julkaisun; runs/muste-1230/release2/referenssi_hr2015.md). Kaikki ajat ketjussa ovat
korjatun lähteen aikaa: t_uusi = t_vanha / k. Vakiot, jotka on alun perin mitattu alkuperäisestä siirrosta
(kohinan vertailukohdat, loppuurat), skaalataan tässä samalla kertoimella.

    from lahde import FILES, K, NOISE, RUNOUT, skaalaa
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
_CFG = json.loads((ROOT / "audio" / "lahde.json").read_text(encoding="utf-8"))
K = float(_CFG["k"])
KANSIO = ROOT / _CFG["kansio"]
FILES = {1: KANSIO / "side1.flac", 2: KANSIO / "side2.flac"}


def skaalaa(t):
    """Alkuperäisen siirron aika -> korjatun lähteen aika."""
    return t / K


# Alkuperäisestä siirrosta mitatut välit (s), skaalattuina korjattuun aikaan.
# kohinan vertailukohta: A sisäänajoura 0:04-0:07.2; B loppuura 23:20 (B:n alku on digitaalista hiljaisuutta)
NOISE = {1: (skaalaa(4.0), skaalaa(7.2)), 2: (skaalaa(1400.0), skaalaa(1406.0))}
# pelkkää loppuuraa kummallakin puolella: (alku s, kesto s)
RUNOUT = {1: (skaalaa(1240.0), skaalaa(50.0)), 2: (skaalaa(1400.0), skaalaa(60.0))}
