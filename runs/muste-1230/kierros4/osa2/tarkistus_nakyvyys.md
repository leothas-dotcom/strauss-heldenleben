# Kierros 4b, osa 2: jokainen olento kokonaan kuvassa ja erillään (suo 240–422 s)

Tiedostot: `visual/muste/loc_swamp.js` (puuta ei kosketettu), `visual/muste/scenes_2.js` (vain kuvausteksti ja otsikkokommentti), uusi `render/nakyvyys.mjs`.
`critters_swamp.js` ei muuttunut (olentojen muoto ja mittakaava ennallaan).

## Työkalu
- `window.nakyvyysProbe(t)` (loc_swamp.js): `[{nimi, x0, y0, x1, y1, lepo, peitto}]` ruutukoordinaatteina 0..1 (x oikealle, y alas), kameran projisoimana
  näkyvien verkkojen maailmalaatikosta. Nimet: `ritari`, `keihas` (lisäksi varsi `a`, `b`), `hyttynen`, `sorsa`, `haikara`, `kotilo1-2`, `sammakko1-2`, `varis1-3`.
  `lepo` = soitin soi ja olento on lepopaikallaan (tulo ja lähtö saavat ylittää reunan). `peitto` = penkereen (etualan musta maa) taakse jäävä osa laatikon leveydestä.
- `node render/nakyvyys.mjs --from 240 --to 422 [--step 0.5] [--margin 0.04] [--overlap 0.10] [--keihas 0.15] [--peitto 0.03]`
  Rikkeet (palauttaa 1): lepäävä olento reunan takana (marginaali 0,04), kaksi lepäävää laatikkoa leikkaa (> 10 % pienemmästä), keihään varsi kulkee
  olennon laatikon halki (> 15 % laatikon lävistäjästä; viistoa keihästä ei arvioida laatikolla, koska laatikko on sen lävistäjä), lepäävästä
  olennosta > 3 % jää penkereen taakse. "ohi" = liikkeessä oleva olento kulkee toisen yli (ei rike, listataan). Ritarin keihäs ei ole reunatarkistuksessa.
- Poikkeus: hyttysen lähtö alkaa ritarin huitaisusta (`tSwat0`…`swM`+0,15 s hyttynen on jo liikkeessä), koska keihäs pyyhkäisee sen ohi.

## Ennen (alkutila, `nakyvyys_ennen.txt`, väli 0,5 s, 240–422 s): 413 rikettä
(peittotarkistus lisättiin vasta myöhemmin, joten sitä ei ole tässä)
- Reunan takana (lepo), sekuntia: hyttynen 0,5, sorsa 9,5, haikara 23,5, sammakko2 1,0, varis1 0,5, varis2 1,5, varis3 11,5, ritari 21,0 (alareuna 269,5–271,5 s ja muiston kaksi ottoa 2.5a, 2.5b), kotilo2 0,5.
- Päällekkäin (lepo vs lepo), sekuntia: kotilo1+kotilo2 27,0, sammakko1+sammakko2 22,5, haikara+sorsa 18,5, ritari+sammakko1 14,5, kotilo1+sammakko2 11,0, kotilo2+sammakko2 11,0,
  keihas+sammakko1 3,5, varis1+varis2 6,5, varis2+varis3 5,5, kotilo2+sorsa 5,5, sammakko2+sorsa 5,5, keihas+varis1 5,0, kotilo1+sorsa 1,0.

## Jälkeen (`nakyvyys_jalkeen.txt`): 0 rikettä, paluuarvo 0
Sama ajo 0,1 s välein (1793 hetkeä): rikkeitä 0. Muu: `camcheck --max 20` 0 ylitystä (suon otot enintään 6,8 °/s), `kohtauscheck` 240–422 s tyhjää taustaa 0 ruudussa ja reunaylityksiä 0.
Jäljellä vain liikkeessä olevien ohikulkuja (ei riko): esim. 244,5 s keihäs ja hyttynen (huitaisu), 285–287 s lähtevät kotilot ja sammakot (otto 2.4a), 381–382,5 s tulevat sammakot ja lähtevät kotilot.

## Muutetut rivit (loc_swamp.js, rivinumerot nykyisen tiedoston)
- r. 98 `POSTS`: haikaran paalut siirretty oikealle (x 2,7–4,35 -> 4,7–6,35).
- r. 100–105: penkereen alarinteen toinen tukki (`log2`, y -1,7, paperinen ääriviiva); vanha tukki penkereellä poistettu. Tukki on kuvassa vain sammakoiden tullessa ja ollessa kuvassa
  (halftone-sisäänpainuminen, r. 603–605), joten muiston otot eivät näytä sitä.
- r. 307–309 `lifeAt(key, t, extra, extraEx)`: lähdön porrastus erikseen (reitin päässä oleva lähtee ensin, saapuu viimeisenä); r. 679, 706, 722 käyttävät sitä (kotilot, sammakot, varikset).
- r. 338 `ST`: sorsa (1,2 -> 2,5; -1,55), kotilot penkereellä (-1,8 ja -0,8; 0,05), sammakot tukilla (-3,9 ja -2,2; -1,55), varikset oksalla 1,5 välein (-5,2 / -3,7 / -2,2; y oksan pinnan mukaan).
- r. 339 `RING` (piiritys ja toverit): hyttynen (0,3; 2,2), sorsa (4,7; -1,55), haikara ylimmällä paalulla, varikset ilmassa eri korkeuksilla (-3,6; 3,9), (-2,2; 2,7), (-0,9; 3,7).
- r. 344–346 `SLOPE_LOW`, `pathPt`: alarivin reitti rinnettä myöten tukille; r. 704 sammakot hyppäävät veden puolelta (1,3+0,3 i; -2,6).
- r. 630 hyttynen kuorossa ja piirityksessä z 1,8 (lähempänä kameraa, leveässä kuvassa luettava koko, 7–8 % kuvan leveydestä). r. 760 englannintorven pisteet alkavat haikaran nokan edestä (eivät haikaran päällä).
- Kamerat (r. 370–388), otto: parametrit `frame(f, bot, d, ...)` ennen -> jälkeen:
  2.1b (0,62; -0,7; 4,8) -> (0,5; -0,9; 5,2); 2.2a (0,3; -2,3; 7,0) -> (0,25; -2,9; 9,8); 2.2b (0,2; -3,0; 9,0) -> (0,2; -3,0; 10,4); 2.2c (0,3; -0,9; 5,4) -> (0,2; -3,0; 10,4);
  2.2d (0,3; -2,3; 7,0) -> (0,2; -3,0; 10,4); 2.2e (0,28; -2,6; 7,2) -> (0,2; -3,0; 10,4); 2.2f (0,4; -0,4; 7,2) -> (0,25; -2,4; 11,0) (oksa ja varikset mahtuvat);
  2.3 (0,28; -2,0; 9,4; drift 0,8) -> (0,25; -2,8; 11,8; drift 0,4); 2.5a (0,2; -4,5; 10,8) -> (0,38; -4,5; 10,8) (ritari istuu kuvassa jo alussa); 2.5b (0,3; -3,6; 8,4) -> (0,3; -3,3; 8,4) (pää ei yläreunaan);
  2.6 (0,3; -1,3; 8,4) -> (0,25; -2,8; 11,8); 2.7 kamera [-8,6; 1,2; 8,5] -> [-7,4; 2,2; 8,5], katse [-0,5; 1,5; -2] -> [0,3; -0,3; -2] (ja loppuavain vastaavasti): sorsa ei jää penkereen taakse, sammakot eivät leikkaudu alareunasta.
- scenes_2.js: kohtauksen 32 kuvausteksti ja otsikkokommentti.

## Stillit (`runs/muste-1230/kierros4/osa2/nakyvyys/`)
`t247.0, t251.0, t256.0, t261.0, t266.0, t270.0, t276.0, t280.0, t284.0, t368.0, t372.0, t376.0, t380.0, t386.0` sekä lisäksi `t244.0, t264.0, t306.0, t335.0, t407.0` (`--workers 2`).
Mitä ne näyttävät:
- 244: hyttynen ritarin oikealla puolella kokonaan kuvassa. 247: sorsa uimassa vedessä, kokonaan kuvassa ja penkereen oikealla puolella. 251: sorsa ja haikara (paalulla) vierekkäin, erillään.
- 256: kaksi kotiloa penkereellä vierekkäin, sorsa vedessä, haikara ylimmällä paalulla; kaikki erillään. 261: tukki painuu näkyviin, sorsa on lähdössä.
- 264: kaksi sammakkoa tukilla alarivissä, kotilot poissa, haikara paalulla, peili (musta hahmo) veden alla; musta pistejono haikaran vasemmalla puolella.
- 266, 270: kolme varista oksalla rivissä (1,5 välein), päät ja siivet kuvassa, keihäs ei niiden päällä (270).
- 276, 280, 284 (kuoro): kotilot penkereellä, sammakot tukilla alempana, sorsa ja haikara vedessä kaukana, hyttynen taivaalla; ei kasassa, keihäs ei olentojen päällä. 276 ja 284: varikset ovat tulossa tai lähdössä (varisten soitin soi vain 272–274,8 ja 283–284,9 s).
- 306, 335: muiston otot 2.5a ja 2.5b, ritari kokonaan kuvassa, tukki ei näy.
- 368: yksi kotilo tulossa rinnettä pitkin. 372, 376: hyttynen, kotilot, sorsa ja haikara kuvassa; 372 yksi varis laskeutumassa oksalle, 376 kolme varista ilmassa ritarin oikealla puolella, eivät toistensa päällä.
- 380: kaikki piirityksen olennot kuvassa. 386: otto 2.7, ritari vasemmalla, toverit harjanteella, sammakot tukilla alhaalla, sorsa ja haikara kaukana vedessä. 407: kaksi varista oksalla (kolmas laskeutumassa), keihäs ei niiden päällä.

## Avoimet kohdat
- Leveissä otoissa (d 10–12) ritari ja olennot ovat pienempiä kuin ennen (esim. kotilo n. 7 % ja hyttynen n. 8 % kuvan leveydestä); tämä on hinta siitä, että kaikki kuusi soitinta mahtuvat yhteen kuvaan. Kuvaa ei ole tarkistanut erillinen tarkistaja.
- Varisten oksa ja puu ennallaan; kolmas varis istuu oksan kärjessä (x -2,2).
- Peili (Quijote) ja toverit (harjanne) eivät ole mukana näkyvyystarkistuksessa.
- Opastarkistusta ja videotarkistusta ei ajettu.

## Korjaus (ohjaajan huomiot stilleistä 261, 266, 380)
- t266 yläreunan musta kulmikas muoto oli pasuunoiden iskun leima (`stamp`, kirjoitettu isku, y 5,0), ei sammakko eikä varis. Siirretty kohtaan (1,5; 3,0): kokonaan kuvassa ja varisten oksan ulkopuolella.
  Sammakon lähtöhypyn kaari matalammaksi (3,4 -> 2,3); sammakon laatikon ylin kohta koko ajalla y0 0,43 eli kuvan alapuoliskossa.
- t261 ja t380 vasemman alakulman valkoinen katkoviiva oli oma tukkini (`log2`) halftone-sisäänpainumisen puolivälissä, ei englannintorven pisteitä. Sisäänpainuminen lyhennetty 0,5 s:iin ja ajoitettu juuri ennen sammakon tuloa; stilleissä 261 ja 380 tukkia ei ole.
- Englannintorven pisteet (haikaran piirtämä vääristys, 262,1–265,3 s) olivat osittain haikaran päällä; alku siirretty haikaran nokan edestä vasemmalle (`hpz.x - 3,1`).
- `nakyvyysProbe` palauttaa nyt myös `leima` ja `pisteet` (kaikkien näkyvien pisteiden laatikko); sammakot (hyppykaari) olivat jo mukana. Ajo 240–422 s, väli 0,1 s: rikkeitä 0, paluuarvo 0. Stillit 261, 264, 266, 268, 380 uusittu.
