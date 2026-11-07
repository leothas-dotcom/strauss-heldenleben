# Kierros 4, osa 3 (ranta 422–1126 s): jämät pois, luonnos jatkuvaksi

Ajettu 1.11.2026. Tiedostot: `visual/muste/loc_shore.js`, `visual/muste/main.js` (vain `washAt`, luonnoksen lohko). `scenes_3.js` ei muuttunut.
Stillit: `runs/muste-1230/kierros4/osa3/stillit/` (briefin 11 aikaa), `stillit_lisa/` (16 lisäaikaa), `luonnos4fps/` (1104–1126 s, 4 fps, 89 kuvaa),
kontaktiarkit `kontakti_800-1126.jpg` (2 s välein), `stillit_sheet.jpg`, `lisa_sheet.jpg`, `luonnos_sheet.jpg`, `d2_sheet.jpg` (802–816 s). Lähtötilanne `ennen/`.

## Muutetut rivit (loc_shore.js)

| Kohta | Muutos |
|---|---|
| ~762 (`DUST`) | 18 -> 12 läiskää: kuusi jatkuvaa jalkojen/veneen läiskää (`DUST[12..17]`) poistettu. Jäljelle vain 3.2:n patarummun iskuista nousevat pöllähdykset (`percOns`) |
| ~1180–1186 | maan pölyn pohjataso (`mote = 0.08 + 0.45 * percK`) ja veneen alle piirtäminen (`hsx = B.x - 1.5`) pois, `mote = 0` |
| ~817, ~1030 | `moonDash` (11 paperinvalkoista suorakulmiota world-avaruudessa) poistettu; kuun juova on vesishaderissa (`WATER_FS`). `boatDash` (musta, veneen alla) jäi |
| ~425 (`seg`) | `fig` tallennetaan jaksoon (`fig: !!o.fig`); aiemmin se hävisi, joten viivan vaihtuminen viivahahmoksi veneessä (`cgate`) ei toiminut |
| ~551 (`chainStart`) | uusi: viivan historia alkaa nykyisen yhtenäisen jakson alusta (ei `brk`-rajan eikä näkymättömän `vis: 0`-välin yli) |
| ~896 (`confHold`), ~904 | uusi: 3.13:n (`fig`-jakso) viuluviivan varmuutta pidetään yllä ±1,6 s, muualla ennallaan |
| ~1071 | `trail.set(..., chainStart(t), 2.0)` (oli `-Infinity`) |
| probe | `patarumpu: R3(L.percK)` lisätty `opasProbe`en (tieto, ei kuvaa) |

main.js `washAt` (rivit ~178–187): luonnoksen loppu `sk1 = sk0 + (Wn.to - PRESS - sk0) / SK_FULL` (`SK_FULL = 0.78`). Aiempi `sk1 = Wn.to - PRESS - 0.5`.

## Mikä piirsi jämät (kooste)

1. **Vinoneliörivi ja pistejono veneen alla, rasterilaikat maassa (kohdat 1, 2)**: `DUST[12..17]` (paperinvalkoiset vinoneliöt, `dustMat`). Koko = `0.08 + 0.45 * percK`, `percK = S.fam.perc * 3`.
   `S.fam.perc` on suhteutettu oman 95. persentiilinsä mukaan, ja raakakanava `panns_timpani` on 422–1102 s:ssä alle 0,01, joten kohina ylittää kynnyksen lähes joka ruudulla (koetin: `percK > 0,15` 200 näytteessä 453:sta).
   Pohjataso 0,08 piirsi pienet läiskät aina; veneessä ne siirrettiin veneen alle veteen (`hsy = B.y - 0.35`), ja `percK`:n kasvaessa niistä tuli 350 px vinoneliörivi.
2. **Lohkomainen kuun silta lähikuvassa (862 s)**: `moonDash` (ks. yllä), kaksoiskappale shaderin heijastukselle.
3. **812 s koukkuviiva ja irralliset pisteet**: ne ovat kumppanin viiva (`trail`), ei pizzicato (`pzEv` on vain 3.1–3.12 ja pisteet elävät 1,8 s). Kolme syytä:
   (a) viuluviivan varmuus on binäärinen ja 3.13:ssa siinä on 1–3 s aukkoja (806–808, 811 s), jolloin `tipTrail` piirsi `ink = 0` -kohdat hiuksenohuina katkoviivoina ja pisteinä;
   (b) `chainStart`: historia ylitti jaksorajat ja yhdisti eri jaksojen päät haamuviivoilla (590 s: ohut koukku taivaasta veneeseen);
   (c) `fig`-lippu ei tallentunut `seg`:iin, joten viiva ei koskaan haalistunut viivahahmon tullessa veneeseen.
4. **Luonnoksen jähmettymä (kohta 5)**: post-shaderin rintama (`ink.js` POST_FS, `uSk * 1.3 - sijainti`) kattaa koko kuvan, kun `uSk` on noin 0,78–0,9. Vanha `sk1` ohjasi `uSk`:n 1:een 0,5 s ennen värin painumista, joten rintama oli valmis ~1,5–2 s ennen painamisen alkua.

## Taulukko jämistä (index_tayt.md luku 6)

| otto | elementti | lähde | päätös |
|---|---|---|---|
| 40 (422–434 s) | punainen piste vuoren yllä | iltarusko/aurinko (`uSun`, ohjaus 3.1 iltarusko, 3.4 aurinko puiden takana, 3.12 laskee) | ei näy stilleissä 424/428/432; aurinko näkyy vasta 474+ puoliympyränä horisontissa. Säilyy, lähde ohjaus |
| 41 (434,5–441,5 s) | harmaanvalkoiset sirpaleet jaloissa | `DUST[0..11]` = patarummun iskut 3.2 (`percOns`), roolit.json patarummut = maan pöllähdys | säilyy: 3.2 on ainoa otto, jossa patarumpu on nimetty; stilli 437 s näyttää sirpaleet iskuhetkellä |
| 42 (441,5–452,4 s) | pienet valkoiset täplät maassa | `DUST[12..17]` (jatkuva pohjataso) | **poistettu** |
| 45 (471,5–504 s) | valkoinen pilvimäinen läiskä ja lintukaari taivaalla | kumppanin viiva (`trail`, jakso 3.4 "ylhäällä auringon luona", viulu); ei erillistä elementtiä | säilyy viivana (ohjaus 3.4); stillit 474/482/490 näyttävät lyhyen valkoisen kaaren, ei läiskää |
| 46 (504–518 s) | täplät veden reunassa | `DUST[12..17]` | **poistettu** |
| 47 (518–533 s) | kaksi irtopistettä viivan alla | `pzDots`: pizzicato, `panns_pizzicato`-huiput | säilyy (pisteitä vain pizzicaton soidessa, ohjaus 3.5/3.3) |
| 50 (566–581 s) | täplät jaloissa | `DUST[12..17]` | **poistettu** |
| 51 (581–605 s) | raapaisu, koukkuviiva, läiskä maassa | raapaisu = sarkasmin siksak (`trail`, viulu, ohjaus 3.5); koukku = vanhan jakson historia (`chainStart`); läiskä = `DUST[12..17]` | siksak säilyy; koukku ja läiskä **poistettu** (stilli 590: ei kumpaakaan) |
| 55 (653–674 s) | viivan häntä ylänurkassa | kumppanin viiva (3.8 katselee ylhäältä; edellinen jakso 3.7 pakenee) | säilyy; `chainStart` katkaisee historian jakson rajalta |
| 56 (674–688 s) | rasterilaikka maassa | `DUST[12..17]` | **poistettu** |
| 57 (688–702 s) | rasterilaikka maassa; valkoinen kolmio viirin vieressä | laikka `DUST[12..17]`; kolmio on keihään kärki (`hero.js`/`FL`, paperinvärinen) | laikka **poistettu**, kärki säilyy (keihäs kädessä) |
| 59 (729–752 s) | leveä rasterilaikka jalkojen kohdalla | `DUST[12..17]` | **poistettu** |
| 60 (752–765 s) | valkoiset läikät kuusen latvassa | kumppanin viiva latvoissa (3.12 "latvoista") | säilyy (ohjaus 3.12) |
| 64–77 (802–960 s) | pistejono ja vinoneliörivi veneen alla | `DUST[12..17]` veneen alle | **poistettu** (stillit 845/862/900: ei yhtään) |
| 64–67 | lohkomainen kuun silta | `moonDash` | **poistettu**; kuun juova = vesishaderi |
| 83 (1102–1126 s) | kaarenpätkä vasemmassa reunassa 1109,9 s | luonnoksen ensimmäinen reunaviiva (post-shader `tS`, rintaman alku) | säilyy: se on luonnoksen alku, ei vanhan kuvan jäänne |
| 85 (1145–1164 s), 86 (1164–1172 s) | vinot mustat läiskät maassa vasemmalla | `loc_battle.js` kentän maan viivoitus (sellot = maa, vinot varjoviivat; stillit `taistelu/t1151.4`, `t1157.9`) | **ei minun tiedostoani**: ei muutettu. Stilli 1151,4: vinot tummat viivat ovat kentän rasterin varjoja vasemmassa alakulmassa; ohjaajan/osan 4 päätettävä |

## Stillit (mitä kuva näyttää)

- 590 s: sarkasmin siksak (viiva) ja ritari; ei koukkuviivaa, ei läikkiä maassa.
- 620 s, 700 s: lähikuvat torvesta ja viiristä; maassa ei läikkiä.
- 812 s: viiva yhtenä jatkuvana valkoisena nauhana ritarin edellä veneelle (d2_sheet: 804–816 s, ei hiuspisteitä); veneen alla ei valkoisia pisteitä.
- 845, 862, 900 s: vene, punos, kuu ja viivahahmo; ei vinoneliöitä eikä pistejonoa veden pinnalla; kuun juova vain shaderin vaakaviivoina kuun alla.
- 1112, 1116, 1120, 1123 s: luonnos etenee vasemmalta oikealle (1112: vasen reuna; 1116: horisontti ja hevonen; 1120: kolme viiriä erottuu); 1123 s värin painuminen alkanut.
- 4 fps -sarja 1104–1126 s: peräkkäisten ruutujen keskimääräinen ero (ffmpeg `tblend`+`signalstats`, 480 px harmaa) on luonnoksen aikana aina yli 0,16; vanhalla koodilla 1119–1121 s oli viisi peräkkäistä ruutua arvolla 0,00–0,04 (jähmettymä). Uudella ei yhtään nolla-ruutua; rintama etenee painamisen alkuun (~1121 s sivun ajassa).

## Rajaukset ja huomiot

- Luonnoksen rintama jättää hetkeksi yksittäisen irtopilkun rintaman eteen (1116–1117,5 s, kuvan oikea puoli): se on post-shaderin kohinatermi (`ink.js`), ei omaa koodiani; ei muutettu.
- 3.13:n viiva näkyy nyt paksuna jatkuvana nauhana (aiemmin hajonneina paloina); jos ohjaaja haluaa ohuemman, `wmax` on `trail`-kutsun parametri.
- Työjärjestyksen lipsahdus: ensimmäiset lähtötilannestillit (`ennen/`, 7 kuvaa, alle 5 s) ajettiin samaan aikaan kuin osa 1:n ajo (rivi `pyynnot.md`:ssä alkoi 01:26), koska luin rivin vasta ajon jälkeen. Muut ajot odottivat vuoroa.
- Harpun glissandojen välke (B10/B11) ja ihmisvariantti (A14) koskemattomia. `scenes_3.js` ei muuttunut.
