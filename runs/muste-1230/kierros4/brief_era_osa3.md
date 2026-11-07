# Korjauserä v6, osa 3 (422–1126 s). Tiukka rajaus: vain alla olevat kohdat.

*Lue ensin `docs/visuaalinen_tyyli.md` kokonaan (luku 10 "Vastustajat: suon olennot": koot suhteessa ritariin) ja
`docs/kuvasaannot.md`. Lähde: `runs/muste-1230/kriitikko_v5/palaute_tarkistus.md` (B9, C10, L_yo_kuivuu, jämät otot 64 ja 83).
Omat tiedostot: `loc_shore.js`, `scenes_3.js`, ja `main.js` VAIN luonnoksen (washAt/sketch) lohko. Kumppanin ihmisvariantti
(companion.js) on käyttäjän hyväksymä: älä muuta sitä.*

1. **B9, uni 1077–1098 s** (otto 82): hyttynen ja sorsa ovat noin 2x ritarin leveys ja hyttynen peittää kuun 1085 s. Skaalaa
   kaislikon reunan olennot (mosqB, duckB, heronB, frogB) tyyliohjeen luvun 10 kokoihin suhteessa ritariin (hyttynen pään
   kokoinen, sorsa 0,35–0,4, haikara 0,5, sammakko 0,2–0,25); ei kuun päällä (kuvasääntö 22); omissa rekistereissään.
2. **C10, 606,27 s hyppy**: ritarin käden nosto kestää noin 0,1 s. Kuvasääntö 14: liike seuraa fraasia. Tee nostosta fraasin
   mittainen (ankkurista, ei sekunteja), hidas alku ja loppu.
3. **L_yo_kuivuu, 1104–1107 s**: kuva täysin staattinen 3 s ennen yön kuivumista paperiksi. Kuvasääntö 16: pitkä sointu
   hidastuu leijuvaksi, ei pysähdy. Pidä ritarin hengitys/vyön värähtely ja veden välke käynnissä kuivumiseen asti.
4. **Otto 64 (811 s)**: kumppanin viiva laskeutuu veneeseen leveänä nauhana ritarin ja viirin yli. Ohenna (`trail`-kutsun
   `wmax`) niin, että nauha on companionLine-viivan levyinen, ja reitti kulkee ritarin ohi, ei yli (kuvasääntö 22).
5. **Otto 83 (1118 s)**: luonnoksen rintamalla jyrkkä pystysuora vasen reuna. Pehmennä rintaman reuna (kohina/rasteri, ei
   suora viiva), muuttamatta luonnoksen ajoitusta (A8 on hoidettu).

Tarkistus stilleillä: 1080, 1085, 1090; 604–608 @10 fps; 1104–1108 @4 fps; 811; 1118. Yksi still-ajo kerrallaan
(`pyynnot.md` "käynnissä"). Raportti `runs/muste-1230/kierros4/osa3/tarkistus_era.md`. Vain se, minkä kuva näyttää.
