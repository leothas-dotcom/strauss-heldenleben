# Kierros 4, osa 2 (suo 240–422 s): olennot tulevat ja lähtevät soittimensa mukana

*Ohjaajan brief 1.11.2026. Lue ensin `docs/visuaalinen_tyyli.md` kokonaan (luku 18: soitin näkyy silloin kun soi) ja
`docs/kuvasaannot.md` (kohta 8); ne voittavat tämän briefin. Sitten `docs/ohjaus.md` luku 2, `visual/muste/roolit.json`
ja tarkistajan raportti `runs/muste-1230/kriitikko_v3b/index_tayt.md` (otot 22–38, bugilista 5). Omat tiedostot:
`visual/muste/loc_swamp.js`, `visual/muste/critters_swamp.js`, `visual/muste/scenes_2.js`. Yhteisiin ei kosketa.
Puu on juuri tehty uusiksi (D8, r. 103–146): älä muuta sitä.*

Tarkistaja: "Hyttynen on kuvassa 60 s, vaikka huilu soi 3 s. Kotilot, varikset, sorsa ja haikara eivät lähde kuvasta.
Otossa 35 (noin 290–300 s) kotilo on ritarin päällä."

## Tehtävä

1. Jokainen olento on kuvassa vain, kun sen soitin soi (ohjaus luku 2 nimeää soittimet ja ankkurit; mitatut kanavat
   `S.fam.*`, kynnys niin, että kohina ei tuo olentoa). Tulo ja lähtö ovat yksi liike kumpikin (laskeutuu / lentää
   pois / sukeltaa / vetäytyy kaislikkoon), ei ilmestymistä eikä katoamista kesken oton, ei yhden ruudun muutoksia.
   Olento, jonka soitin vaikenee pitkäksi aikaa, poistuu kuvasta ja palaa vasta soittimen palatessa. Varikset
   (pasuunat) saavat jäädä oksalle sen aikaa, kun pasuunat soivat tai palaavat alle 10 s:ssa.
2. Kotilo ei ole ritarin päällä (otto 35): olennot ja ritari eivät mene päällekkäin (kuvasäännöt).
3. Olentojen muotoa (D9: huilun putki, tuuban kello) EI muuteta tällä kierroksella; käyttäjä päättää.

## Tarkistus

Stillit 244, 247, 250, 256, 262, 270, 285, 295, 300, 330, 380 (`--workers 2`, `--dir runs/muste-1230/kierros4/osa2/olennot`)
ja kontaktiarkki 240–400 s 2 s välein (osarenderi `--start 240 --end 400` sallittu). Yksi still- tai renderiajo kerrallaan
(`runs/muste-1230/pyynnot.md` "käynnissä"). Taulukko raporttiin `runs/muste-1230/kierros4/osa2/tarkistus_olennot.md`:
olento | soitin ja kanava | kuvassa (s) | tulo/lähtö-liike. Vain se, minkä kuva näyttää.
