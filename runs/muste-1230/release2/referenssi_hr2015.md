# Referenssilinjaus hr2015 → Krauss A: raportti (Julkaisu 2.0, vaihe 1)

*8.11.2026. Sama teksti kopiona `build/ref_hr2015/raportti.md` (build/ ei ole versionhallinnassa).
Suunnitelma: `docs/julkaisu2.md` luvut 1.3 ja 1.5; tehtävät `docs/prompti_julkaisu2_vaihe1.md`.*

Referenssi: `audio/ref/ref_Us1jfC7bMpA.flac`, hr-Sinfonieorchester / Andrés Orozco-Estrada, Alte Oper
Frankfurt 11.12.2015 (YouTube Us1jfC7bMpA, 50 min 40 s, Opus 137 kbit/s → 48 kHz mono FLAC). Vain
analyysin apuväline; sen ajat eivät päädy videoon, oppaaseen eivätkä teemakarttaan muuten kuin
linjauskuvauksen kautta. Kraussin aika = `build/kuuntelu/A_puoli_kuuntelu.wav` (sovittu totuus).

## Tehtävä 1: riippuvuus kirjaan (commit 8575099)

- `setup.ps1 -WithYtDlp` asentaa yt-dlp:n wingetillä; tila VALINNAINEN, perustelu kommentissa
  (vain referenssilinjaukseen, ei videon tekoon). `-CheckOnly` näyttää `yt-dlp 2026.10.26 OK`.
- `build/ref_lataus.ps1` → `analysis/ref_lataus.ps1 -Url <osoite> -Tunniste <id>`; ei asenna mitään
  itse. `build/ref_lataus.cmd` poistettu.

## Tehtävä 2: linjaus ja nopeus (`analysis/linjaus.py`)

Ajo: `python -I analysis/linjaus.py --ref audio/ref/ref_Us1jfC7bMpA.flac --nimi hr2015 --ref-alku 21 --ref-rajat 21,272,480,1214`
→ `build/ref_hr2015/linjaus.json`, `linjaus.md`, `linjaus.png`, `linjaus_ajo.log`. Kesto noin 4 min (CPU).

### Korjaukset koodiin (menetelmä ennallaan)

1. `--ref-loppu`-oletus puuttui: koodi latasi koko 50 min levyn, vaikka docstring lupasi "Krauss A
   loppuu +120 s". Koko levyllä Sakoe–Chiba-kaista olisi kulkenut väärää diagonaalia (B-puoli
   mukana). Nyt oletus = ref-alku + (Kraussin kesto − held-alku) + 120 s = 1431 s.
2. Hiljaisen ruudun chroma oli nollavektori → kosinietäisyys NaN. Lisätty tasainen pohja 1e-4 ennen
   normalisointia.
3. Kuvaus Krauss → ref: `np.interp` polun toistuvilla x-arvoilla (pystyaskeleet) ei ole määritelty.
   Nyt keskiarvo Krauss-ruutua kohti, sitten interpolointi sekunnin ruudukkoon, kuten kommentti lupasi.

### Tulos

DTW 6845 × 6207 ruutua (5/s), ikkuna 12 %, kustannus 492.

| jakso | Krauss s | ref annettu s | ref linjaus s | residuaali s |
|---|---|---|---|---|
| held | 7.6 | 21.0 | 21.0 | +0.00 |
| widersacher | 243.0 | 272.0 | 272.4 | +0.40 |
| gefaehrtin | 422.0 | 480.0 | 475.8 | **−4.20** |
| walstatt | 1125.7 | 1214.0 | 1214.1 | +0.10 |

**Laatuportti (≤ 1,0 s): HYLÄTTY**, pahin residuaali 4,2 s. Rajaa ei löysätty.

### Mistä Gefährtin-residuaali tulee

Tarkistin rajan molempien äänitteiden voimakkuuskäyrästä (RMS, 0,1 s):

| tapahtuma | Krauss | ref |
|---|---|---|
| Widersacherin loppusointu päättyy (−22 → −40 dB) | 421.2 | 477.7 |
| pp-häntä | 421.5–422.6 | 478.0–478.5 |
| yleistauko (lattia −50…−58 dB) | 422.7–423.1 (0,5 s) | 478.6–480.1 (1,5 s) |
| harppu ja sooloviulu tulevat | 423.2 | 480.2 |

Kuvauksen "8:00" on siis oikea (viulu tulee 480,2); teemakartan 422,0 osuu Kraussin pp-häntään, 1,2 s
ennen viulua. Kun verrataan samaa tapahtumaa (viulun tulo 423,2 ↔ 480,2), DTW:n kuvaus antaa 423,2 →
noin 477, eli **linjaus on tässä kohdassa noin 3 s edellä**. Syy on kohdan luonne: loud–tauko–pp.
Chroma ei kerro tauon ja pp-hännän sisällä mitään, orkesterit pitävät tauon eripituisena (0,5 s vs
1,5 s), ja sooloviulun ja harpun ohut chroma antaa polulle vapauden liukua. Muissa rajoissa musiikki
jatkuu rajan yli (held→widersacher: huilu tulee heti; gefaehrtin→walstatt: trumpetit kulississa), ja
residuaali on ≤ 0,4 s.

Paikallinen nopeussuhde d t_ref / d t_krauss: mediaani 1,071, 10–90 % väli 0,91–1,19 (kuva
`linjaus.png`). Krauss on A-puolella keskimäärin 7 % nopeampi kuin hr 2015, mutta vaihtelu on
tempoa, ei levyn nopeutta: esim. Widersacherissa ref on 1,3× hitaampi, Gefährtinin alussa Krauss
on hitaampi (0,8). Koko A-puoli: Krauss 7,6 → 1224 s (1216 s) vastaa ref 21 → ~1333 s (1312 s),
suhde 1,079.

### Viritysarvio (menetelmä 1, `librosa.estimate_tuning`)

Mediaani Krauss +16 c, ref −16 c, erotus +32 c → "nopeussuhde" 1,0187 (+1,87 %). **Ei luotettava:**
ikkunoiden arvot heittelevät ±40 c (Krauss +1/+36/+18/+14, ref +46/+49/−31/−37/−16), koska
90 s orkesteritekstuurissa vibrato, kromaattiset kulut ja CQT-binien vuoto tekevät jakauman
monihuippuiseksi. Lisäksi ref −16 c tarkoittaisi, että hr soittaisi 436 Hz, mikä ei pidä paikkaansa
(saksalaiset radio-orkesterit 442–443 Hz). Levyn nopeus mitataan tehtävässä 3 toisella menetelmällä
(CREPE pitkistä sävelistä samoista tahdeista molemmissa äänitteissä).

### Päätelmä ja ehdotus

- Linjaus kelpaa jaksotason siirtoihin kolmessa rajassa neljästä (±0,4 s) ja on Gefährtinin alussa
  noin 3 s edellä. Portin sääntö on ≤ 1,0 s kaikissa, joten linjaus on **hylätty** sellaisenaan.
- Vaihtoehdot käyttäjän päätettäväksi (menetelmän muutos, ei tämän tehtävän sisällä):
  a) lisätään chroman rinnalle onset-/voimakkuuspiirre, jolloin tauko ja pp-tulo ankkuroituvat;
  b) hyväksytään linjaus jaksoittain ja merkitään Gefährtin-siirroille epävarmuus ±3 s ensimmäisen
  30 s ajalle; c) linjataan Gefährtin omana DTW-ajonaan alkaen viulun tulosta (423,2 ↔ 480,2).
- Teemakartan `gef_viulu`-ankkuri 422,0 on pp-hännän, ei viulun, alku; viulu tulee 423,2. Tämä
  kirjataan korjauslistaan tarkistettavaksi vaiheessa 2 (ei muuteta nyt).

## Tehtävä 3: levyn nopeus toisella menetelmällä

*(kesken)*
