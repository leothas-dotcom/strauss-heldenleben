# Kierros 4, osa 4 erä: otto 88 (1180–1223 s), olentojen koot

Muutettu: `visual/muste/loc_battle.js` (record.js ja scenes_4.js ennallaan).

## Muutokset (loc_battle.js)
- r. 22: olennot tuodaan `critters_swamp.js`:stä (sama muoto kuin `critters.js`, viivat mitoitettu maailmaan; tiedostoa ei muutettu).
- r. 134–144 (TYPES): `sc` uusiksi (suosta tutut SCp-arvot, ritarin korkeus 1,9): hyttynen 0,09, sorsa 0,338, haikara 0,278, kotilo 0,29, sammakko 0,183, varis 0,216. Vanhat koot jäivät kenttään `swc` pelkästään pyörteiden mitoitukseen.
- r. 210: kommentti (hirviöhyttynen).
- r. 427: `mk(scene, c.T.sc)`; r. 433, 581, 591: pyörteen leveys, säde ja korkeus käyttävät `swc`:tä, eli pyörteet, saapumiset, ajat ja liikeradat ovat ennallaan.
- r. 570–576: olennon koko = `sc` x voimakkuus (0,67 pp .. 1 ff, oman kanavan g) x perspektiivikorjaus (olento z -1,2…-2,8 on ritaria kauempana; korjaus pitää kuvasuhteen ritariin samana kameran lähestyessä, 1,1…1,35). Poistettu hirviökasvu (`mon`, hyttynen jopa 4,2 x); hirviöpyörre (R-kerroin) säilyy.
- Läiskät, salamat, rummun pöly ja levy koskemattomia.

## Koot ritarin korkeuteen (1,9) nähden, suurin mitta, kun suurin koko (ff)
| Olento | Ennen | Jälkeen | Luvun 10 raja |
|---|---|---|---|
| hyttynen (siivin, pistimin) | 1,6 (viimeisessä hirviökasvussa jopa 6,9) | 0,2 | 0,15–0,2 |
| sorsa | 2,1 (korkeus 0,95) | 0,4 | 0,35–0,4 |
| haikara (korkeus) | 2,0 | 0,5 | 0,5 |
| kotilo | 1,05 | 0,33 | 0,3–0,35 |
| sammakko | 1,4 | 0,25 | 0,2–0,25 |
| varis | 1,4 | 0,3 | 0,3 |
"Ennen" on laskettu rakennusmitoista (raaka suurin mitta x vanha `sc`) ja varmistettu v5:n kontaktiarkista (A11b, 1186–1222 s: sorsa ja haikara ratsastajan kokoisia, kotilo ja sammakko lähes hevosen kokoisia). "Jälkeen" on taulukon mitoitus; pp-hetkillä 0,67-kertainen. Ei mitattu pikseleinä.

## Stillit
`stillit/t1150, t1165, t1180, t1195, t1210, t1220.png`; kontaktiarkit `kontakti_1.jpg` (1126–1174) ja `kontakti_2.jpg` (1176–1224), lähdekuvat `kontakti_stillit/` (2 s välein).

Mitä kuvat näyttävät:
- 1150, 1165: ei olentoja (viirit horisontissa, ritari seisoo ja ratsastaa); ei muutosta.
- 1180: iso musta läiskä (splat) oikealla ja pisteitä; se on kirjoitetun iskun läiskä, ei olento, ja koskematon. Olentoja ei erota.
- 1195: yksi pieni olento (kotilo/sammakko) pyörteensä sisällä oikealla, selvästi ratsastajaa pienempi; toinen pyörre tyhjänä.
- 1210: kolme pyörrettä: yksi olento ylhäällä (pieni), kaksi pyörteen sisällä oikealla; kaikki murto-osa ratsastajasta, eivät peitä ritaria eivätkä hevosta.
- 1220: olennot pyörteiden sisällä oikealla (n. 90–100 px, ratsastaja n. 250 px); kukaan ei ole ratsastajan päällä.
- Kontaktiarkki: 1178–1224 pyörteet kasvavat ja tihenevät oikealla, olennot pienet mustat/valkoreunaiset hahmot niiden keskellä; ei kuvaa, jossa olento tai parvi peittäisi ritarin tai hevosen. Pienimmät (hyttynen, varis) lukeutuvat vain pyörteen täplänä.

## Avoimet kohdat
- Olentojen siluetit ovat pieniä: soitinpiirre (putki, kello, nokka) luetaan vain lähemmissä ruuduissa (1210–1222), kaukaisissa vain "täplä pyörteessä". Se on luvun 10 koko; ei muutettu.
- `render/nakyvyys.mjs` ei kata taistelua; päällekkäisyys tarkistettu vain silmin. Kuvaa ei ole arvioinut erillinen tarkistaja; camcheck, videotarkistus ja jatkuvuus ajamatta.
