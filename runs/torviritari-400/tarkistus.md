# Tarkistus: torviritari-400

Kuvakäsikirjoituksen luvun 7 vaiheet. Ajat ovat A-puolen aikaa (totuus: `build/kuuntelu/A_puoli_kuuntelu.wav`).

## 1. Still-kuvat jokaisesta otosta ja iskusta

- Jokaisen oton keskeltä on still-kuva kansiossa `stills/otot/`. Kontaktiarkit ovat
  `stills/kontakti_otot_1.png` ja `_2.png` (57 ottoa ennen iskujen uudistusta).
- Iskut on kuvattu iskuruuduilta:
  - `stills/iskut2/` ja `stills/iskut3/`: alun sointuiskut T. 6, 8 ja 11, matala isku, huippu, kohtaloiskut 2 ja 4
  - `stills/iskut/`: kohtaloiskut ja katkot

## 2. Kolmen pahimman korjaus (still-kierros 30.10.2026)

| Ongelma | Korjaus |
|---|---|
| Putous näytti tummalta ovelta (otot 19–20) | Kallion lovesta vesi kaartuu yli. Vesi on sininen ja siinä on vaaleat virtausnauhat, alas valuvat juovat ja kuplareunaiset ryöpyt (aksentit ja harppu). Juurella on vaahto ja maakaistale. |
| "Viirit kietoutuvat" kuvasi tyhjää taivasta | Kamera katsoo viirien korkeudelle. |
| Muisto lammessa peittyi kiviin ja olentoihin | Olennot ja kivet väistyvät yöksi (H17) ja palaavat uudessa hyökkäyksessä. |

Lisäksi korjattiin:
- tablo (huipun kruunu peitti sädekehän, pilvet jäivät sen eteen)
- rinneoton nykäys (ritari juoksi 58 yksikköä 1,5 sekunnissa)
- suon toistuva laaja otto (tilalle olennon ja ritarin puolikuva)

## 3. Iskujen uudistus (käyttäjän palaute 30.10.2026)

Käyttäjä katsoi testipätkän 205–225 s: kuvan jähmettyminen puupiirrokseksi, välähdys ja leikkaus
jokaisella kohtaloiskulla tekivät kerronnasta nykivää, ja jännite lässähti. Uusi linjaus
(kuvakäsikirjoitus luku 4, tyyliohje luku 8):
- Iskun tekee yksi elementti, ja liike jatkuu.
- Koko kuvaa ei jähmetetä, välähdetä eikä täristetä, eikä iskuun leikata.

| Kohta | Ennen | Nyt |
|---|---|---|
| Kohtaloiskut 1–4 | puupiirrosjähmettymä, välähdys, tärähdys, leikkaus joka iskulla | Yksi jatkuva nosturiajo H12:sta soinnun alkuun. Katkossa sade ja tuuli hiljenevät. Iskussa siksak-salama lyö joukon edellä yhä lähemmäs huippua, ja iskupisteeseen leviää leimahdus. Ritari loikkaa ja viiri napsahtaa. |
| Alun sointuiskut T. 6, 8, 11 | eivät näkyneet: kellot jäivät harjanteen alle ja kuva-alan ulkopuolelle; maa tärähti | Seitsemän toveria ponnahtaa harjanteen yli kellot soittoasennossa, ja kellot välähtävät. Ritari ja kamera jatkavat nousuaan. |
| Patarummun lyönnit (laakso, kukkula) | koko kuvan tärähdys | pölypilvet harjanteen reunalla, kavioiden pöllähdykset |
| Ensimmäinen huippu | leikkaus iskuun, välähdys, tärähdys | Kellon lähikuva vetäytyy crescendon aikana yhtenä liikkeenä laajaan kuvaan. Huipussa hevonen nousee takajaloilleen ja aurinko murtautuu esiin. |
| Patarummun tremolo niityllä | koko kuvan värinä | etualan heinät värisevät |
| Dominanttiseptimin katkeaminen | koko kuvan painovärien siirtymä | Sädekehä sammuu paperiin, ja kamera liukuu. |
| Harjoitusnumero 9 (isku, z 9,0) | otto vaihtui iskussa, ruudun myöhässä | Otot 17–18 ovat yksi liike: kamera liukuu joukon luo ja kääntyy sivuajoksi. Kellojen portaat tekevät iskun. |
| Oton alku ja loppu | pehmeä kiihdytys alkoi nollanopeudesta, joten kuva pysähtyi hetkeksi (alussa 7.9–8.7 s ja 171.5 s) | Jokaisella otolla on pieni alku- ja loppunopeus (`glide`). |
| Lautasten roiske | 67 ms ennen ääntä | enintään 33 ms ennen ääntä |

## 4. Mittaukset

- **Kamera** (`render/camcheck.mjs --max 20`): 46 ottoa, ei ylityksiä. Suurin kääntö on 15 °/s
  levyn sukelluksessa. Kohtaloiskujen jatkuvassa otossa kääntö on enintään 1,3 °/s ja siirto
  7,8 m/s.
- **Ääni videossa** (testipätkä 205–225 s, `analysis/kellot.py --ref build/kuuntelu/A_puoli_kuuntelu.wav`):
  ero 0,00 ms, ei ajautumista.
- **Iskut ruudulla** (testipätkä 205–242 s, ruutujen välinen muutos): jokaisen kohtaloiskun
  suurin kuvamuutos on ensimmäisellä ruudulla, joka alkaa aikaisintaan 33 ms ennen ääntä.

| Isku | Iskuruutu | Muutos iskuruudulle | Ympärillä |
|---|---|---|---|
| 1 (213.40) | 213.367 | 5,0 | 0,5–2,0 |
| 2 (217.26) | 217.233 | 5,8 | 0,5–2,3 |
| 3 (220.95) | 220.933 | 5,9 | 0,5–2,2 |
| 4 (224.64) | 224.633 | 5,7 | 0,5–2,2 |

- **Ei jähmettymiä:** katkoissa ruutujen välinen muutos pysyy yli nollan, eli liike jatkuu. Tablon
  alun lähes paikallaan pysyneet ruudut korjattiin tasaiseksi hitaaksi lähestymiseksi.

- **Valmis video** (`analysis/videotarkistus.py`, tulos `videotarkistus.txt`): ääni WAV-totuutta
  vasten, kaikki teemakartan `isku`-kohdat ja jähmettymät ennen yleistaukoa.

## 5. Renderöinti

`renders/heldenleben_torviritari_400s.mp4` ja kontaktiarkki `renders/heldenleben_torviritari_400s_kontakti.jpg`
(`--workers 2 --fade-out 3.5`). Loki: `render.log`.
