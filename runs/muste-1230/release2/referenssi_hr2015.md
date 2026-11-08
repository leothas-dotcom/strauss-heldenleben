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

## Tehtävä 3: levyn nopeus toisella menetelmällä (`analysis/nopeus.py`)

Menetelmä: torchcrepe (full, weighted_argmax ilman ditheriä, periodisuus ≥ 0,7) seuraa johtavaa linjaa
samoista tahdeista molemmissa äänitteissä; jokaisen ruudun poikkeama lähimmästä tasavireisestä
sävelestä (A440) senteissä → mediaani ja MAD. Kohta kelpaa, kun MAD < 10 c molemmissa (muuten
ikkunat eivät sisällä samoja säveliä tai seuranta on epävarma). Tulos `build/ref_hr2015/nopeus.md`.

| kohta | Krauss c (MAD) | ref c (MAD) | kelpaa |
|---|---|---|---|
| A alun Es-duuri, sellot ja käyrätorvet (7.6–20 / 21–35) | **+27.8** (6.9) | +5.3 (1.7) | kyllä |
| B sooloviulun tulo (423.2–443 / 480.2–502) | +7.1 (19.9) | +7.2 (11.5) | ei: rubato, eri sävelet, LP-kohina |
| C dom7-sointu ennen taukoa (229–238.5 / 257.5–268) | **+25.2** (1.7) | +9.8 (1.6) | kyllä |
| D kulissitrumpetit (1125.7–1136 / 1214–1225) | +2.9 (3.7) | +2.2 (0.5) | ei: kulissisoittajien oma taso (23 c alle orkesterin) |
| E Widersacherin huilu (243–258 / 272.4–289) | −12.5 (19.7) | +6.8 (4.8) | ei: huilu LP-kohinassa epävarma |
| F rakkauskohtauksen huippu (919–936 / 984.4–1003.8) | **+29.6** (10.4) | +9.4 (6.5) | rajalla; vahvistaa A:n ja C:n |

- **Krauss soi tasolla +26,5 c (A ja C; F +29,6 samaa luokkaa) eli a¹ ≈ 447 Hz.** Taso on sama puolen
  alussa (8 s), 229 s:ssa ja 919 s:ssa: siirron nopeus on vakio koko puolella, virhe ei ole
  pyörimisnopeuden huojuntaa.
- **Referenssi hr 2015 mittautuu +5…+10 c eli ≈ 442 Hz**, tiukalla hajonnalla (MAD 1,6–1,7 c tutissa).
  Se on uskottava nykyinen saksalainen radio-orkesteritaso, joten CREPE ei ole harhainen: menetelmä
  toimii, ja referenssiä ei tarvita itse nopeuslukuun, vain mittarin vahvistukseen.
- Kulissitrumpetit (D) soivat kummassakin levytyksessä orkesteria matalammalta (Krauss −23 c, hr
  −5 c): kulissisoittimia ei saa käyttää viritystason mittaamiseen eikä tekstityksessä väittää niiden
  intonaatiosta mitään.
- Menetelmä 1 (`estimate_tuning`, tehtävä 2) antoi Krauss +16 c ja ref −16 c: ref-arvo on selvästi
  väärä (436 Hz), joten menetelmän 1 lukuja ei käytetä.

### Nopeusvirhe = Kraussin taso − WPh:n viritystaso 1952

| WPh 1952 | nopeusvirhe c | nopeusvirhe % | A-puolen musiikki (1216 s) oikealla nopeudella |
|---|---|---|---|
| 440 Hz | +26.5 | +1.54 % | +19 s |
| 442 Hz | +18.6 | +1.08 % | +13 s |
| 443 Hz | +14.7 | **+0.85 %** | +10 s |
| 444 Hz | +10.8 | **+0.63 %** | +8 s |
| 445 Hz | +6.9 | +0.40 % | +5 s |

WPh:n 1952-taso on edelleen **[tarkista]**: kaksi verkkohakua (8.11.) eivät löytäneet lähdettä
1950-luvulle; nykytasoksi mainitaan 443 tai 444 Hz, Berliinin aiempi 445 Hz koskee eri orkesteria.
Emaus & Junger 2013 (Austrian high tuning, s. 56–59) on skannattu PDF ilman tekstikerrosta, ei luettu.
Käyttäjä (orkesterimuusikko) voi tietää paremmin; muuten oletus 443–444 Hz.

### Johtopäätös (julkaisu2.md 1.5:n säännöllä)

Virhe on +0,6…+0,9 %, kun WPh:n tasoksi oletetaan 443–444 Hz, eli **yli 0,5 %:n rajan** → vaihtoehto
**b) nopeuden korjaus** ehdotetaan. Vain jos WPh soitti 1952 jo 445 Hz, virhe alittaa rajan ja a)
riittää. Korjaus on pelkkä uudelleennäytteistys kertoimella k = 2^(−virhe_c/1200) (443 Hz → k =
0,9915, puoli pitenee 10 s; 444 Hz → 0,9938, +8 s), ja sen jälkeen teemakartta, cues, aksentit,
paketit ja video generoidaan uudelleen k:lla (julkaisu2.md 1.5 b). **Ei tehty; päätös käyttäjällä.**
Virheen lähde voi olla levysoittimen siirto tai jo vuoden 1952 nauha→levy-ketju, sitä ei äänestä voi
erottaa; kumpikin korjaantuu samalla kertoimella.

## Tehtävä 4: referenssin soittimet Kraussin aikaan (`analysis/ref_paketti.py`)

`prepare.py` ja `analyze.py` olettavat LP-puolen, joten referenssille tehtiin kevyt paketti:
`ref_paketti.py --vaihe paketti` kirjoittaa `build/ref_hr2015/`-kansioon `clean_44k.wav` (mono 44,1 kHz,
ei kohinanpoistoa), `prepare.json` (side="ref", start 0, duration 1500) ja `analysis.json/.f32`
(yksi kanava loudness, music_start 21). Sitten `listen.py build/ref_hr2015 --steps soittimet` ajoi
PANNs CNN14 SED:n muuttamattomana (2,5 s GPU:lla, 625 Mt) → `listen.json/.f32`, 21 `panns_*`-kanavaa
referenssin ajassa. `ref_paketti.py --vaihe siirto` siirsi ne linjauskuvauksella:
`soittimet_krauss_aika.json` = jokaiselle Krauss-sekunnille kunkin kanavan maksimi vastaavassa
ref-ikkunassa ja kolme vahvinta luokkaa (1297 sekuntia).

Mihin referenssin PANNs kelpaa (maksimi / p90 musiikin aikana): viulu 0,93 / 0,67, huilu 0,67 / 0,00,
klarinetti 0,30, vasket 0,37, käyrätorvi 0,23, trumpetti 0,20, pasuuna 0,17, orkesteri 0,49 →
hyviä. **Harppu 0,021, patarumpu 0,087, lautaset 0,001, virveli 0,005**: PANNs on näille heikko myös
puhtaassa stereossa, joten niistä luetaan vain *suhteellinen* piikki (≫ p90), ei absoluuttista tasoa.
Linjauksen epävarmuus siirrossa: ±0,4 s, paitsi Gefährtinin alussa noin 3 s (tehtävä 2).
