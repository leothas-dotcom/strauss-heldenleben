# Korjauserä v6, osa 1 (0–240 s). Tiukka rajaus: vain alla olevat kohdat.

*Lue ensin `docs/visuaalinen_tyyli.md` kokonaan ja `docs/kuvasaannot.md`; ne voittavat tämän briefin. Lähde:
`runs/muste-1230/kriitikko_v5/palaute_tarkistus.md` (rivit B8, D3, E1, jämät otot 2 ja 19). Omat tiedostot: `loc_valley.js`,
`loc_storm.js`, `loc_sea_muste.js`, `loc_meadow.js`, `scenes_1.js`. Ei muita muutoksia, ei uusia elementtejä.*

1. **B8, iskut held_isku_t6/t8/t11 (17,64 / 21,62 / 27,50 s) +2 ruutua** (`videotarkistus_v5.txt`): viirinkärkien napsahdus
   ja puuska (loc_valley.js, probe `viirinkarjet_y`) alkaa nyt pehmeästi ja huippu on 67 ms iskun jälkeen. Kuvasääntö 15: isku on
   yhden elementin teko ruutua ennen ääntä. Muuta napsahduksen muoto niin, että suurin muutos on ensimmäisessä ruudussa
   (alku `S.A(id) - S.LEAD`, välitön nousu, sitten hidastuva palautuminen), ei muuta.
2. **D3, jähmettymä 140,87 s** (2 ruutua ennen leikkausta 141,0 s, `v4_140.3-141.5_10fps.png`): otossa 1.11 ennen leikkausta
   kuva on täysin staattinen. Kuvasääntö 16: otto ei pääty pysähdyksestä. Pidä viirien tuuli ja hahmojen hengitys/huojunta
   käynnissä leikkaukseen asti (ei uutta elementtiä).
3. **E1, jäämäpilvi 232–233 s**: tarkistaja näkee yhden pilven vielä 232–233 s. Varmista 4 fps -ruuduista 231–234 s, että
   viimeinenkin pilvi on poissa viimeistään 232,0 s; jos ei, siirrä sen `clear`-matkaa, ei kaaren ajoitusta.
4. **Jämät:** otto 2 (40,5–41,7 s) valkoisia rasterikappaleita maassa; otto 19 (224–228 s) pieni punainen laatikko huipun reunalla.
   Nimeä lähde koodista; jos lähdettä ei ole, poista. Taulukko: otto | elementti | lähde | päätös.

Tarkistus stilleillä: 17,6/17,67 (2 ruutua ennen ja jälkeen iskua), 140,5–141,0 @10 fps, 231–234 @4 fps, 41, 226.
`videotarkistus.py --start 0` osarenderistä 0–48 s (`--start 0 --end 48`) iskuille t6/t8/t11: tulos OK. Yksi still-/renderiajo
kerrallaan (`pyynnot.md` "käynnissä"). Raportti `runs/muste-1230/kierros4/osa1/tarkistus_era.md`. Vain se, minkä kuva näyttää.
