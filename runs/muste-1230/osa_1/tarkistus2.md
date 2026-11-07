# Osa 1, kierros 2: tarkistus (Sankari, 0–243 s)

Ajettu 31.10.2026. Omat tiedostot: `visual/muste/scenes_1.js`, `loc_valley.js`, `loc_sea_muste.js`, `loc_meadow.js`, `loc_storm.js` (varmuuskopiot ennen muutoksia: `runs/muste-1230/osa_1/varmuus2/`).
Lopullinen osarenderi: `runs/muste-1230/osa_1/renders/osa1_v2.mp4` (`--start 0 --end 243`, 4,2 min). Ei koskettu yhteisiin tiedostoihin; pyynnöt `runs/muste-1230/pyynnot.md`:ssä (osa 1, kierros 2).

## Mitä muutin
- **loc_valley.js**: toverit (7) ovat harjanteella kuvassa held_alku:sta alkaen (ei piilossa/ponnahdusta); oikea ryhmä seisoo, vasen ryhmä kävelee sankarin mukana; iskut T. 6/8 = viirinkärkien napsahdus + tuulenpuuska (viivoitus, viivojen vaihe integroitu, ei hyppyjä), T. 11 = kaikkien kahdeksan kellon nosto 1,6 s fraasina; `hitAmp`/`tptFlick`/`gust` liikuttavat vain tuulta/viirejä, keho ei reagoi. Teemaviiva yksi jatkuva veto (portti ei energiakynnyksellä), päättyy sankarin kääntyessä. Vuoret paperia + lyijykynäviiva, sininen pisteittäin (`uAppear`) vasta held_viulut:ssa. Kamerat leveämmiksi, jotta kaikki 8 mahtuu kuvaan koko jakson. Asentohypyt 38,54 ja 39,44 s poistettu lähteestä.
- **loc_storm.js**: askellus sin-käyränä (`stride`, `climbSt`) kovien A/B-vaihtojen tilalla; sankari rivin oikeassa päässä (ei kulje toverien läpi); vedot (kuusi `tipTrail`-vetoa) lentävät kuvaan oikealta ja kokoontuvat ritariksi, joka painuu pisteittäin näkyviin, sitten koko rivi marssii yhtenä muodostelmana (B4); portaat vain `aksentit.json`:n iskuissa (154,54 / 154,66 / 155,67), avautuminen 0,5 s; keihäs pysyy pystyssä (`lanceAng`); katkossa viirit painuvat (`droop`, 0,55 s) ja sade hiljenee 95 %, kohotahti-iskulla napsahtavat; huipun nousu: joukko kiipeää rinneviivaa pitkin (y = maan pinta), leikkaus tablolle `tTab`:ssa; mateiden z kallion edessä; laskeutumisjärjestys ilman kasaantumista.
- **loc_meadow.js**: pääskyn siiven `flap` pehmeäksi (3 ruudun nousu). **loc_sea_muste.js**: otto 1.7b alkaa 1.7a:n loppuavaimella (kameran hyppy 94,07 s poistui). **scenes_1.js**: kuvaustekstit.

## Todennus (kuva tai mittaus)
| Rivi | Todennus | Tila |
|---|---|---|
| C11 (17,6 / 21,6 / 27,5 s) | `hahmot_kuvassa.mjs` (hahmot kameran kuvassa, 7,6–46,3 s, 0,1 s välein): **388 ruutua, 0 poikkeavaa (aina 8)**, `hahmot_kuvassa_tulos.txt`. Stillit 10 fps 16,5–29 s: `kontakti_c11_a.png`, `kontakti_c11_b.png`, 1 fps 7,6–60 s: `kontakti_1fps.png` (`stills2/`). `jatkuvuus.py`: ei hyppyjä 17,6/21,6/27,5 s:n ±0,5 s:ssä (`jatkuvuus_v2.json`). Tuore tarkistaja: 8 hahmoa kaikissa ruuduissa, kukaan ei ilmesty/katoa (`kriitikko2/index_tayt.md`). `poseskan.mjs 0 245`: **0 asentohyppyä** (`poseskan_2.txt`). | OK. Avoin: sankarin selkäkuva→profiili 23,033→23,067 s (held_viulut-ankkuri, ei isku) vaihtaa nuken yhdessä ruudussa (mallin vaihto; leveys sovitettu, viiri avautuu ohuesta). |
| B2 | Stillit 1 fps: veto yksi jatkuva alusta 23 s:iin, vuoret paperia+lyijykynää, sininen 23,6 s:stä (`kriitikko2/B2_*.png`). | OK osin: veto 17,6–23 s ohut ja sotkuinen (tyylikysymys), pää on keihään viirissä. |
| B4 | Stillit 128–133 s: kuusi vetoa laskeutuu sankariin oikealta, hahmo painuu pisteittäin, rivi marssii 133–141 s (`kriitikko2/B4_*.png`). | OK osin: seitsemän toveria on kuvassa leikkauksesta 126,4 s (paikan vaihto), vain sankari kokoontuu vedoista. |
| B5 + jatkuvuus | `jatkuvuus.py`: ei hyppyä yhdelläkään tasasekunnilla 156–170 s (vain 169,27 s: 10 lohkoa); `poseskan`: ei A/B-askelhyppyjä; viirit avautuvat iskuissa 154,54/154,66/155,67 s. Ei päällekkäisyyttä (stillit 140–172 s). | OK; avautumisen ajoitus iskuun: EI VOI TODETA STILLEISTÄ (koodissa `stepHits` = `aksentit.json`). |
| 126,5 s | `jatkuvuus.py`: ei hyppyjä 126–127,2 s (aiemmin 22 hyppyä); gait-vaihdot poistettu (`poseskan` 0). | OK |
| B6 | Stillit 212,6 / 212,9 / 216,6 / 216,9 / 220,5 / 224,0 s + tuore tarkistaja: salama katkon alussa, viirit roikkuvat alas, sade harvenee, iskun jälkeen viirit ylös; ei loikkia. | OK |
| C12 | Stillit 229,5–238 s (`stills2_t`) + tuore tarkistaja: kaikki seisovat rinteellä/huipulla, ei ilmassa; sädekehä 234–238 s. | OK |
| C8 pieni | Tuore tarkistaja + zoom 235/236,5 s: ei suoraa käsivartta viistosti ylös eteen; sankarin käsi/keihäs alennettu (vyötärö, pystyssä). | OK |

## Mittaukset (osarenderi 0–243 s)
- `jatkuvuus.py` (`jatkuvuus_v2.json/.txt`): välkyntälöydöksiä 275 → 123 (yli 150: 20 → 2, pisteet 29238 → 2806), hyppyjä iskujen ulkopuolella 299 → 66 (lohkoja 2623 → 455). Jäljellä yli 150: sädekehän säteet 235–239,5 s (tarkoitettu) ja katkon salama 213,5 s.
- `camcheck --max 20`: 94 ottoa, **0 ylitystä** (osan suurin 15,8 °/s, meri 94,1 s). `kohtauscheck --step 15 --from 0 --to 244`: **0 kerrosylitystä** (tyhjää vain A paperi 0–7,5 s, tarkoitettu).

## Mikä jäi / huomiot
1. Sankarin selkäkuva→profiili 23,03 s on mallin vaihto yhdessä ruudussa (korjaus vaatisi pisteittäisen ristiinhäivytyksen `uAppear`:lla tai profiilihahmon koko jaksolle).
2. Kahdeksan hahmoa on kuvassa 7,6–46,4 s (laakso). Merellä (47,8 s alkaen) sankari on yksin keulassa (kohtaus 1.5: "mielikuvitus"), laivasto liittyy 73 s: brief sanoi 60 s, tämä on ohjaajan päätös (ei toteutettu).
3. Teemaviiva 17–23 s sotkuinen; B4: toverit ilmestyvät leikkauksessa 126,4 s; A7: ensimmäinen huippu aallon harjalla ei lue; 46 s ja 100 s siirtymäruuduissa kahden kohtauksen limitys (tarkoitettu).
4. Renderin viimeinen ruutu 243 s: musta/paperi-ruutuja 242,8–243,4 s kuuluvat yleistauon paperiin (main.js), eivät tähän osaan.
5. Pyynnöt yhteisiin tiedostoihin: `vastaukset.json` elementtitekstit (probe-kentät `viirinkarjet_y`, `viirit_n`, `rivi_y` saivat uuden merkityksen); muita ei.
