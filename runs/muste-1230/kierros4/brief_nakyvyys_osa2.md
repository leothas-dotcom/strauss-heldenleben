# Kierros 4b, osa 2 (suo 240–422 s): jokainen olento kokonaan kuvassa, ei päällekkäin

*Ohjaajan brief 1.11.2026. Lue ensin `docs/visuaalinen_tyyli.md` kokonaan ja `docs/kuvasaannot.md` (kohta 5: ei päällekkäisyyksiä,
lavasteiden reunat); ne voittavat tämän briefin. Sitten `docs/ohjaus.md` luku 2 ja oma edellinen raporttisi
`runs/muste-1230/kierros4/osa2/tarkistus_olennot.md`. Omat tiedostot: `visual/muste/loc_swamp.js`, `critters_swamp.js`,
`scenes_2.js`, ja uusi `render/nakyvyys.mjs`. Puuta (r. 103–146) ja olentojen muotoa ei muuteta.*

## Käyttäjän sanat (1.11.2026, renderistä v4)

> "Askeleita taaksepäin, mitä ei saisi sattua: nyt asiat menevät suolla päällekkäin, ne eivät näy, koska ovat reunojen
> takana. Ihan amatöörimoka: tämä pitäisi olla ensimmäinen tarkistus."

Mitä v4:n ruuduissa näkyy (`runs/muste-1230/kierros4/v4_suo_243-290_1fps.jpg`, `v4_suo_366-393_1fps.jpg`):
- 246–251 s sorsa ja haikara kuvan oikeassa reunassa osin rajattuina; 260–262 s sammakko ja haikara oikeassa reunassa.
- 268–276 s varikset oksalla kuvan yläreunassa, päät leikkautuvat; 371–376 s varikset lentävät sisään yläreunan läpi
  leikkautuneina; 366–372 s hyttynen oikeassa yläkulmassa pienenä ja rajattuna.
- 275–285 s kuoro: kotilot, sammakko, sorsa ja haikara samassa kasassa ritarin edessä, keihäs olentojen päällä;
  379–380 s sorsan nokka kotilon päällä; haikara oikeassa reunassa 375–380 s.

## Sääntö (kuvasäännöt kohta 5, nyt ensimmäinen portti)

Jokainen olento on soittimensa soidessa **kokonaan kuvassa** (koko siluetti vähintään 4 % marginaalilla kuvan reunoista)
ja **erillään**: ei toisen olennon, ritarin, keihään, viirin tai puun rungon päällä. Tulo ja lähtö saavat ylittää reunan,
mutta lepopaikka ei. Jokainen otto (scenes_2 / `add(...)`-kamerat) tarkistetaan erikseen, koska kamera vaihtuu.

## Tehtävä

1. **Näkyvyyskoetin** `loc_swamp.js`:ään: `window.nakyvyysProbe = (t) => [...]`, joka palauttaa jokaisesta kuvassa olevasta
   olennosta ja ritarista `{nimi, x0, y0, x1, y1}` ruutukoordinaatteina 0..1 (projisoi olennon rajauslaatikon kulmat
   kameralla; käytä olennon root-ryhmän maailmasijaintia ja tunnettua kokoa, `Box3.setFromObject` kelpaa). Puu ja viiri
   eivät ole mukana paitsi ritarin keihäs (oma laatikko `keihas`).
2. **Tarkistin** `render/nakyvyys.mjs` (malli: `render/otecheck.mjs`): avaa sivun, kysyy `nakyvyysProbe(t)` väliltä
   `--from --to` askelin `--step` (oletus 0,5 s) ja tulostaa jokaisen hetken, jolla jokin laatikko ylittää kuvan reunan
   (marginaali 0,04) tai kaksi laatikkoa leikkaavat (pinta-ala > 10 % pienemmästä). Lopussa yhteenveto olennoittain:
   sekunnit reunan takana ja päällekkäin. Palauttaa 0, kun rikkeitä ei ole. Tämä on jatkossa osan ensimmäinen tarkistus.
3. **Paikat kuntoon** jokaisessa otossa: siirrä olentojen lepopaikkoja, polkuja ja tarvittaessa varisten oksaa alemmas
   tai kameraa niin, että `nakyvyys.mjs 240 422` on puhdas. Kuoro (273–285 s): olennot rivissä penkereellä ja vedessä
   eri syvyyksillä, ei kasassa, keihäs ei niiden päällä (siirrä olentoja, älä ritarin asentoa). Hyttynen aina
   luettavan kokoisena kuvassa (ei nurkassa). Tulo- ja lähtöliikkeet säilyvät yhtenä liikkeenä.
4. Stillit 247, 251, 256, 261, 266, 270, 276, 280, 284, 368, 372, 376, 380, 386 (`--workers 2`,
   `--dir runs/muste-1230/kierros4/osa2/nakyvyys`), katsottuna: kaikki kuvassa, erillään.

Yksi still-ajo kerrallaan koko koneella (`runs/muste-1230/pyynnot.md` "käynnissä"). Raportti
`runs/muste-1230/kierros4/osa2/tarkistus_nakyvyys.md`: `nakyvyys.mjs`:n tuloste ennen ja jälkeen, muutetut rivit, stillit.
Vain se, minkä tuloste tai kuva näyttää.
