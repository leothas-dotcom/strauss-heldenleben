# Kierros 4c, osa 2 (suo 240-422 s): olennot luonnollisen kokoisiksi, ei tukkia, lähikamerat

Perusta: tyyliohje luku 10 "Vastustajat: suon olennot" (päivitetty 1.11.2026), luku 4 / sääntö 13.5 (koko on voimakkuus), kuvasäännöt 3, 7, 22.
Muutetut tiedostot: `visual/muste/loc_swamp.js` (puuta ei kosketettu), `critters_swamp.js`, `scenes_2.js` (kuvaustekstit), `render/nakyvyys.mjs` (uusi valinnainen `--koot 1`).

## Koot (ritarin korkeus 1,9 yksikköä; pää = kypärä, mitattu 0,83)
Koko = `SCp * grow(oman kanavan tasoitettu voimakkuus)`, grow 0,67 (pp) .. 1 (ff), eli enintään 1,5-kertainen; kanavat: huilu/oboe/englannintorvi = `fam.winds`, tuubat/fagotit = `fam.bass`, pasuunat = `fam.tpt`.
Sorsa ja haikara ovat kaukana vedessä (z -3,7) ja näkyvät perspektiivissä 0,7-kertaisina, joten niitä on suurennettu 1,4-kertaisiksi (FAR); alla "kuvassa" = maailmalaatikko / 1,4.

| Olento (soitin) | Ennen (suurin mitta, laskettu rakenteen mitoista) | Jälkeen (mitattu, p10-p90, kuvassa) | % ritarista (jälkeen) | Taulukko | Rekisteri |
|---|---|---|---|---|---|
| hyttynen (huilu) | ~1,4 (0,34-mittakaava, pistin ulos) | 0,25-0,38 (korkeus 0,11-0,17) | 13-20 % (pään kokoinen) | 0,15-0,2 | yläkolmannes (taivas) |
| sorsa (oboe) | ~2,4 | 0,60-0,76 | 32-40 % | 0,35-0,4 | keski, vedessä |
| haikara (englannintorvi) | ~2,45 korkea | 0,79-1,05 korkea (hoikka) | 41-55 % | ~0,5 | keski, paalulla vedessä |
| kotilo x2 (tuubat, Dehring) | ~1,0 | 0,57-0,86 | 30-45 % (ff-hetket yläpäässä) | 0,3-0,35 | alakolmannes, penger ja sen reuna |
| sammakko x2 (fagotit) | ~1,5 | 0,43-0,57 (korkeus 0,26-0,42) | 23-30 % | 0,2-0,25 | alakolmannes, penkereen alarinne |
| varis x3 (pasuunat) | ~1,6 | 0,42-0,53 nokka mukana (korkeus 0,24-0,28) | 22-28 % | ~0,3 | ylä/keski, varisoksalla |

Suhde ritarin päähän (0,83): hyttynen 0,3-0,46, kotilo 0,7-1,0 (raskain täplä, tuuba ff, korkeintaan pään kokoinen), sammakko 0,5-0,7, varis 0,5-0,65, sorsa 0,7-0,9, haikara 1,0-1,3 (korkea, kapea).
Ääriviiva: `RIM_W` 0,034 -> 0,05 ja `LINE_W` 0,04 -> 0,03 maailmayksikköä ff-koolla (pp:llä x0,67); hyttysen ääriviiva rajattu (rimMax 0,12) ja runko paksunnettu (0,22 -> 0,32 paikallista), ettei se muutu valkoiseksi putkeksi. Olentojen muoto ja soitinpiirteet ovat ennallaan (D9).

## Rekisterit ja paikat (suo, maailmakoordinaatit; penkereen reuna y 0,05)
- hyttynen taivaalla: (HX+1,5; 1,95) otossa 2.1b, kuorossa ja piirityksessä (-1,0; 3,7).
- sorsa vedessä (1,5; -0,5), piirityksessä (1,9; -0,5), otossa 2.7 (4,3; -0,4) (kamera katsoo penkereen ylitse).
- haikara paaluilla vedessä: paalut x 2,75 / 3,0 / 3,25 / 3,5 (huiput -1,4 ... -0,2), piirityksessä 3. paalu, 2.7:ssä (5,7; -0,2).
- kotilot (Dehring) rinnakkain: (-1,7; 0,05) penkereen päällä ja penkereen reunan rinteellä y -0,55: pystyetäisyys aina 0,6 (`DEHRING_V`, kvintti).
- sammakot hyppäävät veden puolelta penkereen alarinteelle ja istuvat rinteellä (y -1,05 ja -1,5), hyppykaari 1,3.
- varikset varisoksalla (x -5,5; -4,5; -3,5, y oksan pinnan mukaan).
- Tukki (`log2` ja sen halftone-sisäänpainuminen) poistettu kokonaan; ei uusia lavasteita. Englannintorven pisteet (haikaran vääristys) pienennetty haikaran mittakaavaan ja samalle syvyydelle kuin haikara; leima (pasuunoiden isku) siirretty kokonaan kuvaan (-0,9; 2,4), koko 1,2-1,5.

## Kamerat (`frame(f, bot, d, ...)`, otot jotka 4b muutti)

| Otto | 4b (f; bot; d) | nyt |
|---|---|---|
| 2.1b pisto | 0,5; -0,9; 5,2 | 0,62; -0,7; 4,8 (alkuperäinen) |
| 2.2a sorsa | 0,25; -2,9; 9,8 | 0,2; -2,3; 7,0 (alkuperäinen d ja bot; f 0,3 -> 0,2: enemmän vettä oikealla) |
| 2.2b haikara | 0,2; -3,0; 10,4 | 0,2; -3,0; 9,0 (alkuperäinen) |
| 2.2c kotilot | 0,2; -3,0; 10,4 | 0,17; -1,3; 6,4 (alkuperäinen 0,3; -0,9; 5,4; d hiukan suurempi, jotta sorsa, haikara, kotilot ja ritari mahtuvat) |
| 2.2d sorsa kiihtyy | 0,2; -3,0; 10,4 | 0,2; -2,3; 7,0 (f 0,3 -> 0,2) |
| 2.2e peili ja sammakot | 0,2; -3,0; 10,4 | 0,2; -2,6; 7,2 (f 0,28 -> 0,2) |
| 2.2f varikset | 0,25; -2,4; 11,0 | 0,4; -0,7; 7,5 (alkuperäinen 0,4; -0,4; 7,2; hiukan alemmas ja kauemmas, jotta ritarin jalat ja oksan varikset mahtuvat) |
| 2.3 kuoro | 0,25; -2,8; 11,8; drift 0,4 | 0,28; -2,15; 9,4; drift 0,15 (alkuperäinen 0,28; -2,0; 9,4; drift 0,8; drift pienempi, ettei alareuna tai varikset leikkaudu) |
| 2.5a, 2.5b | 4b:n arvot | ennallaan (ritarin reunat; ei olentoja) |
| 2.6 piiritys | 0,25; -2,8; 11,8 | 0,3; -1,3; 8,4 (alkuperäinen) |
| 2.7 toverit | pos [-7,4; 2,2; 8,5] katse [0,3; -0,3; -2] | pos [-8,6; 1,2; 8,5] katse [-0,5; 1,5; -2], loppuavain [-8,0; 1,0; 7,8] / [-0,2; 1,7; -2] (alkuperäinen) |

d on jokaisessa otossa enintään alkuperäinen (2.2c +1,0 ja 2.2f +0,3 poikkeavat). `camcheck --max 20`: ottoja 94, ylityksiä 0 (suon otot enintään 6,8 °/s 2.1a:n laskeutumisessa, muut enintään 2,4 °/s), tuloste `camcheck_suo.txt`.
`kohtauscheck`: tyhjää taustaa 0 ruudussa, kerrosreunan ylityksiä 0 (2400 ruutua, ajettu camcheckin yhteydessä).

## Näkyvyystarkistin
`node render/nakyvyys.mjs --from 240 --to 422 --step 0.1`: hetkiä 1793, reunan takana 0, penkereen takana 0, päällekkäin 0, **rikkeitä 0** (paluuarvo 0). Sama ajo välillä 0,5 s: 0 rikettä. Tuloste: `nakyvyys_jalkeen.txt`.
Jäljellä vain liikkeessä olevien ohikulkuja (ei riko): kotilo1+kotilo2 0,8 s, kotilo2+sammakko1 1,0 s, haikara+sorsa 0,4 s, hyttynen+keihäs 0,2 s (huitaisu).
Tarkistimeen ei lisätty tukin tilalle mitään; vain valinnainen `--koot 1` (maailmalaatikon mitat) raporttia varten.

## Stillit
`runs/muste-1230/kierros4/osa2/koko/`: `t244.0 t247.0 t251.0 t256.0 t261.0 t266.0 t270.0 t276.0 t280.0 t284.0 t372.0 t380.0 t386.0` (`--workers 2`),
v3-vertailu `koko_vertailu.jpg` (vasen v3-renderistä `ffmpeg -ss T`, oikea uusi; järjestys 244, 247, 251, 256, 261, 266, 270, 276, 280, 284, 372, 380, 386),
kontaktiarkki `kontakti_242-416_6s.jpg` (30 stillia 6 s välein, lähteet `kontakti_stillit/`).

Mitä stillit näyttävät:
- 244: ritari lähikuvassa, pieni hyttynen (siivet, pistin, jalat) oikealla taivaalla. v3:ssa hyttynen oli lähes ritarin kellon mittainen.
- 247, 251: sorsa uimassa oikealla, haikara ilmestyy paalulle sen oikealle puolelle; erillään. 256: kotilo penkereen päällä ja toinen rinteellä (pystyetäisyys 0,6), sorsa ja haikara vedessä; kaikki erillään ja kokonaan kuvassa, ritari vasemmalla.
- 261, 266: sammakot rinteellä (pieniä); 266 pasuunoiden leima kokonaan kuvassa. 270: varikset varisoksalla (pieniä), ritari kuvassa. 276, 280, 284 (kuoro): kaikki kuusi olentoa kuvassa omissa korkeuksissaan: hyttynen ja varikset ylhäällä, sorsa ja haikara keskellä, kotilot penkereellä ja rinteellä, sammakot rinteellä.
- 372, 380 (piiritys): olennot ritarin oikealla puolella ja ilmassa, erillään. 386 (2.7): sorsa ja haikara oikealla vedessä, sammakot rinteellä, toverit harjanteella.
- Tukkia ei ole missään stillissä. Olennot ovat v3:n olentoja selvästi pienempiä (suuruusluokka puolet tai alle) ja ritari on isompi (lähikuva, d 4,8-7,5).
- Kontaktiarkissa (320 px leveät ruudut) sorsa, kotilot ja haikara erottuvat paperireunansa ansiosta; hyttynen, sammakot ja varikset ovat pieniä pisteitä (hyttysen luettavuus on rajalla leveissä otoissa).

## Avoimet kohdat
- Tuoreen tarkistajan pisteytystä ei ole tehty; `videotarkistus` ja `opastarkistus` ajamatta.
- Haikaran paalut (vedessä, 4 kpl) ovat pitkiä tummia tankoja veden alla; ennallaan.
- Kamerat 2.2c ja 2.2f poikkeavat alkuperäisestä (d +1,0 / +0,3), koska olennot ja ritari pitää saada kuvaan samaan aikaan; v3:n tarkkoja arvoja ei ole tiedostossa, vaan palautus on kierros 4:n arvoihin.
- Olentojen koko vaihtelee kanavan mukaan 0,67-1; kanava on useimmiten korkea, joten mediaani on lähellä taulukon arvoa.
