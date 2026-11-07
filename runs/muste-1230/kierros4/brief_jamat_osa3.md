# Kierros 4, osa 3 (ranta 422–1126 s): jämät pois, luonnos jatkuvaksi

*Ohjaajan brief 1.11.2026. Lue ensin `docs/visuaalinen_tyyli.md` kokonaan ja `docs/kuvasaannot.md`; ne voittavat tämän
briefin. Sitten `docs/ohjaus.md` luku 3, `visual/muste/roolit.json`, `docs/palautelista.md` rivit D10, B10, A8, ja
tarkistajan raportti `runs/muste-1230/kriitikko_v3b/index_tayt.md` (luku 2 otot 40–89, luku 6 jämät, bugilista kohdat 3, 4, 8).
Omat tiedostot: `visual/muste/loc_shore.js`, `visual/muste/scenes_3.js`, ja `visual/muste/main.js` VAIN luonnoksen
(A8, sketchPass/washAt, 1104–1126 s) lohko. Muihin yhteisiin ei kosketa (companion.js:n ihmisvariantti on ohjaajan, älä muuta).*

Käyttäjä 1.11.2026: "Näissä skreeneissä on paljon epämääräistä mustetta, valkoisia läiskiä. Jokaisella graafisella
elementillä pitäisi olla joku tarkoitus. Minusta tuntuu että ne on harpun jämiä."

## Tehtävä: jokainen kuvassa näkyvä elementti saa lähteen tai poistuu

1. **Valkoinen pistejono / vinoneliörivi veneen alla 841–960 s** (tarkistaja: otot 64–77, kasvaa 858–868 s isoksi
   laikaksi). Se on `moonDash` (r. 811, `reflectDashes` 11 paperinvalkoista katkoviivaa) ja/tai `boatDash`, jotka
   lähiotoissa osuvat kauas kuusta ja veneestä. Kuun heijastuksen katkoviivat saavat olla vain kuun juovassa (kuun
   alla, ei veneen alla) ja vain kun ne lukevat heijastuksena; lähiotoissa, joissa kuu ei ole kuvassa tai juova on
   muualla, ne pois. Veneen heijastus (`boatDash`, musta) veneen alle tai pois.
2. **Rasterilaikat maassa 581–744 s** (otot 51, 56, 57, 59): patarumpu ei soi. Selvitä, mikä piirtää ne (maan pöly
   `roolit.json` patarummut? mielialan pisteet? `pzEv`?), ja poista tai sido soivaan kanavaan niin, että laikka näkyy
   vain, kun sen soitin soi.
3. **812 s: valkoinen koukkuviiva ja irralliset valkoiset pisteet ritarin vieressä** (`kierros3/v3_harppu_802-820.jpg`
   ruutu 812). Selvitä lähde (kumppanin viiva laskeutumassa? pizzicato-pisteet `pzEv`, vaikka pizzicato on 3.1–3.12?)
   ja korjaa: viiva saa laskeutua veneeseen yhtenä liikkeenä, pisteitä vain pizzicaton soidessa.
4. **Tarkistajan epävarmat jämät rantaotoissa** (index_tayt.md luku 6: otot 40, 41, 42, 45–47, 50, 55, 57, 60, 83, 85,
   86: punainen piste vuoren yllä, valkoinen täplä maassa, mustat läiskät maassa): käy jokainen läpi koodista, nimeä
   lähde (ohjaus-rivi, soitin joka soi juuri silloin) tai poista. Kirjaa taulukkoon otto | elementti | lähde | päätös.
5. **Luonnoksen jähmettymä 1119,5–1122,7 s** (bugilista 8: noin 13 identtistä ruutua 0,25 s välein). A8:n luonnos
   (yö kuivuu paperiksi → luonnos piirtyy → väri) piirtyy yhtenä jatkuvana liikkeenä 1110–1124 s ilman taukoa:
   viivat ilmestyvät koko ajan, kolmen viirin luonnos erottuu ennen väriä. Ei yhden ruudun muutoksia.
6. Harpun glissandojen välke (B10/B11) ja ihmisvariantti (A14) jäävät ennalleen.

## Tarkistus (stillit, ei mittauspatteristoa)

Stillit `node render/render.mjs --page visual/muste/index.html --data build/demo400 --stills 590,620,700,812,845,862,
900,1112,1116,1120,1123 --workers 2 --dir runs/muste-1230/kierros4/osa3/stillit` ja kontaktiarkki 800–1126 s 2 s
välein (osarenderi `--start 800 --end 1126` on sallittu, jos sen tarvitset kontaktiarkkiin ja 4 fps -sarjaan 1110–1124).
Yksi still- tai renderiajo kerrallaan koko koneella: `runs/muste-1230/pyynnot.md` "käynnissä"-rivi ajon ajaksi.
Katso jokainen still: ei valkoisia pisteitä tai vinoneliöitä, joilla ei ole lähdettä; luonnos piirtyy ruudusta
ruutuun. Raportti `runs/muste-1230/kierros4/osa3/tarkistus.md`: muutetut rivit, taulukko kohdasta 4, stillit. Vain
se, minkä kuva näyttää.
