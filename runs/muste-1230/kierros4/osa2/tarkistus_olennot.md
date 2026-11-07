# Kierros 4, osa 2: olennot tulevat ja lähtevät soittimensa mukana

Muutetut tiedostot: `visual/muste/loc_swamp.js` (puuta r. 103–146 ei kosketettu), `visual/muste/scenes_2.js` (vain kuvaustekstit ja otto 34:n nimi).
`critters_swamp.js` ei muuttunut (olentojen muotoa ei muutettu, D9).

## Menetelmä
- Jokaisella olennolla on ikkunat (ankkurit: huilu 243, oboe 246, pikkuhuilu/englannintorvi 250, Dehring 252, fagotit 262, pasuunat 265,5, kuoro 272–284,9, piiritys 367,2–380,5, 2.7 ja viimeinen vasket-isku). Ikkunan sisällä soitinkanava (`S.fam.winds`, `S.fam.bass`, `S.fam.tpt`, tasoitettu 0,4–0,5 s) kynnystetään hystereesillä (puupuhaltimet 0,30/0,18; matala 0,18/0,07; pasuunat 0,35/0,15, viimeisellä ikkunalla 0,8/0,3). Alle 4,5 s aukot yhdistetään, liian lyhyet välit pudotetaan.
- Olento on kuvassa välin ajan ja yhden tulo- ja yhden lähtöliikkeen verran. Välit tulostuvat `window.__osa2.iv`.
- Muistossa ja mollissa (285–367 s) soittimet vaikenevat, joten kuvassa ei ole yhtään olentoa (probe `olento_nakyy` = 0 ajalla 287,5–367).
- Ennen vetoa (`wid_voitto`) olevat varikset eivät lähde omin liikkein vaan veto hajottaa ne tipoiksi.

## Taulukko (suo, A-puolen aika s)

| Olento | Soitin ja kanava | Kuvassa (s) | Tulo / lähtö |
|---|---|---|---|
| Hyttynen | huilu; `fam.winds`, ikkuna 243–huitaisu | 243,0–244,7 (+lähtö 1,4 s); 272–284,9; 369,7–380,5 | tulo: lentää oikealta ylhäältä ritarin korvalle; lähtö: kääntyy ja lentää oikealle ylös (huitaisun jälkeen) |
| Sorsa | oboe; `fam.winds` | 246–261,2; 272–284,9; 369,7–388,3 | tulo: ui sisään oikealta; lähtö: sukeltaa nokka edellä penkereen taakse, rengas veteen |
| Haikara | englannintorvi; `fam.winds` | 250–265,5; 272–284,9; 369,7–388,3 | tulo: laskeutuu ensimmäiselle paalulle ja kävelee portaat; lähtö: kääntyy ja nousee siivelle oikealle |
| Kotilot (2) | Dehringin tuubat; `fam.bass` | 252,1–259; 272–284,9; 367,2–380,5 | tulo: ryömivät penkereen reunan yli veden puolelta; lähtö: kääntyvät ja ryömivät reunan yli takaisin veteen (toinen 0,45 s perässä) |
| Sammakot (2) | fagotit ff; `fam.bass` | 262,3–265,5; 272–284,9; 381,3–391,7 | tulo: hyppäävät penkereen takaa tukille; lähtö: hyppäävät takaisin reunan yli |
| Varikset (3) | sordinoidut pasuunat; `fam.tpt` | 266,4–274,8; 371,7–375,8; 405,3–408,2 | tulo: laskeutuvat oksalle (piiritys: ritarin ympärille), kääntyvät oksalla; lähtö: nousevat siivelle oikealle. Viimeinen väli päättyy vetoon: veto hajottaa ne tipoiksi |

Ei olentoja: 286–367 s (molli ja muisto), 392–405 s.

## Muut muutokset
- Kotilo ei ole ritarin päällä: kotilot ja sammakot ovat penkereellä ritarin oikealla puolella, ja ne tulevat ja menevät vain penkereen reunan kautta. Muiston aikana kotiloita ei ole (otto 35, 365 s: kuvassa ei olentoja).
- Paikat: sorsa (1,2; −1,55), haikaran paalut (2,7–4,35), piiritysasemat (RING) siirretty niin, ettei sorsa, haikara ja kotilot mene päällekkäin; varisten oksapaikat ovat 1,4 yksikön välein; hyttynen kuoron ja piirityksen aikana (−0,8; 2,0) eikä ritarin kellon vieressä.
- Piirityspaikat vain 2.6–2.7; ennen vetoa varikset ovat oksalla.
- Probe: `olennot_reunalla` korvattu kentällä `olennot_poissa`; `haikara_askel` seuraa uutta portaiden loppua.
- `globalThis.__osa2` sisältää nyt `S` ja `iv` (vianetsintä).

## Stillit ja kontaktiarkki
`runs/muste-1230/kierros4/osa2/olennot/`: `t244.0, t247.0, t250.0, t256.0, t262.0, t270.0, t285.0, t295.0, t300.0, t330.0, t380.0` sekä lisäksi `t252.7, t262.6, t267.2, t274.4, t372.0, t376.0, t386.0, t407.0, t409.5`.
Kontaktiarkki 240–400 s, 2 s välein (stillit, ei osarenderiä): `kontakti_240-400_2s.jpg` (lähdestillit `kontakti_stillit/`).

Mitä stillit näyttävät:
- 244: hyttynen ritarin oikealla puolella (pistos). 247, 250: sorsa uimassa oikealla reunalla, ei hyttystä. 252,7–256: kaksi kotiloa penkereen reunalla, haikara ei ole kuvassa (otto 2.2c).
- 262,6: sammakko ilmassa penkereen takaa tukille, sorsa on sukeltanut (rengas ja kallellaan oleva sorsa veden alla), peili.
- 267,2: kolme varista oksalla, ei muita olentoja. 270: kolme varista oksalla.
- 274,4 (kuoro): kaikki kuusi olentoa kuvassa, sameus tummentaa taivaan; hyttynen ei ole ritarin kellossa.
- 285: ritari polvella, kotilo ja sammakko lähdössä reunan yli. 295, 300: ritari yksin, ei olentoja. 330: muisto, ei olentoja.
- 372, 376: varikset lentämässä sisään ja pois, hyttynen, haikara, sorsa, kotilot kuvassa. 380: hyttynen, kaksi kotiloa, sorsa ja haikara; sorsan nokka on kotilon vieressä (ei päällä).
- 386: sammakot penkereellä, toverit harjanteella. 407: kolme varista oksalla, toverit harjanteella. 409,5: varikset hajonneet tipoiksi.
- Kontaktiarkissa kuvassa on olentoja 244–285 s ja 368–390 s; 286–366 s ei yhtään.

## Avoimet kohdat
- Ankkuri `wid_uusi_hyokkays` (367,2): ensimmäinen puupuhallin tulee mitattuna vasta noin 369 s (hyttynen 369,7), joten opastarkistuksen `olento_nakyy` -kohta voi näyttää 1–2 s myöhässä; kotilot ovat kuvassa jo 367,2 (matala kanava soi). Ankkuri on todennäköisesti ~1,5 s etuajassa [tarkista].
- Ritarin keihäs on joissakin asennoissa (kuoro, 273–285 s) kotiloiden ja sammakoiden päällä; asento ei kuulu tähän briefiin eikä sitä muutettu.
- Haikara on otossa 2.2e kuvan oikeassa reunassa osin rajattuna.
- Hyttysen toinen ikkuna (pikkuhuilu 250 s) jätettiin pois: huilun raakakanava on 247–258 s hiljainen. Kanavan jakoa huiluun, oboeen ja englannintorveen ei ole; ne erotetaan ankkuri-ikkunoilla.
- Kuvaa ei ole tarkistanut erillinen tarkistaja; `camcheck`, `kohtauscheck` ja `videotarkistus` ajamatta.
