# Osa 3, kierros 2: Kumppani (`gef_viulu` → `wal_kulissi1`, 422–1126 s)

*Ohjaajan brief 31.10.2026. Omat tiedostot: `visual/muste/scenes_3.js`, `loc_shore.js`. Yhteisiin tiedostoihin ei kosketa;
perustan uudet rajapinnat (asennon pehmeä siirtymä, sankarin `sash`, paperisiirtymä, `starsSpin`):
`runs/muste-1230/perusta3/tarkistus.md`. Mitatut kanavat (`build/A2`, `build/A3`, `LUE_MINUT.md`): `panns_harp`,
`panns_pizzicato`, `panns_violin_fiddle`, `panns_wind_instrument_woodwind_instrument`, `panns_flute`, `panns_clarinet`,
`stem_vocals` (sooloviulu), `build/koko/viuluviiva_A.json`.*

Lue ensin: `docs/palautelista.md` (A3, A5, A8, A10, A11, A12, B3, B9, B10, C10), `docs/ohjaus.md` luku 3,
`docs/kuvasaannot.md`, `docs/visuaalinen_tyyli.md` luvut 5, 7–8, 18, `runs/muste-1230/storyboard.md` kohtaukset 40–60,
`runs/muste-1230/kriitikko/index.md`.

## Dramaturginen päätös (ohjaaja)

Käyttäjä: sankarin pitää **muuttua** kosinnan seurauksena, ja muutos kulkee mukana loppuun asti, myös taisteluun.
Ratkaisu: huipussa (`gef_huippu`) kumppanin valkoinen viiva **kietoutuu ritarin ympärille** (perustan `sash`-rajapinta)
ja jää häneen pysyvästi. Jälkihehkussa (958–1102 s) kumppani seisoo vielä viivahahmona hänen vierellään (kaksi hahmoa
katsomassa kuuta), ja hiljaisuudessa (`gef_hiljaisuus`) viivahahmo sulautuu kokonaan sashiin ennen taistelua. Viiva
värähtää aina, kun sooloviulu soi (`sashSignal` = mitattu viulukanava).

## Korjattavat, todisteineen

| # | Aika | Mitä ruuduissa näkyy nyt | Mitä pitää näkyä |
|---|---|---|---|
| A8 **estää julkaisun** | 1098–1126 s (`gef_hiljaisuus` → `wal_kulissi1`) | yö hajoaa paperiläiskiksi, noin 12 s tyhjää paperia, luonnos vasta 1124,7 s, 1126 s välähdys toisesta kohtauksesta | perustan korjatulla siirtymällä: ritari nousee seisomaan fraasin aikana (ennakointi), yö kuivuu paperiksi, **kolmen viirin lyijykynäluonnos piirtyy horisonttiin koko hiljaisuuden ajan**, tyhjää paperia ilman luonnosta enintään 2 s, ei välähdystä. `main.js overlay()`:n `hil`-paperi oli osan 3 aiempi pyyntö; perusta hoitaa, sinä käytät rajapintaa. |
| B9 **estää julkaisun** | 1074–1090 s (`gef_arvostelijat_uni`, opas noin 17:57) | musiikin muutokselle (puupuhaltimet palaavat) ei kuvallista vastausta; kuva 13 s muuttumaton; aiemmin näkyi "ympyröitä" | arvostelijoiden katkelmat = **tunnistettavat suon olennot** (`critters.js`: huiluhyttynen, oboesorsa, Es-klarinetti/fagotti), siluetteina kaislikon reunassa tai tähtien joukossa, kukin omasta mitatusta kanavasta ja vain kun se soi; ei ympyröitä, ei uusia hahmoja (Disney: sama teema, sama hahmo). Kumppani nojaa ritariin. |
| B10 | 845–870 s ja 1062–1076 s (ja muut harpun kohdat) | harppu ei näy; glissando pieni vinoneliörivi; valkoinen kaari ei tunnistu harpuksi | **harppu luo kuun siltaa:** `panns_harp`-kanavan glissandot ovat kuunvalon paperinvalkoisia väreitä, jotka piirtyvät kuusta veneeseen siltana (tyyliohje: glissando = kuun väreet); selvästi luettava elementti, ei taustakohina |
| A5 / A11 | 760–900 s | veneessä vain ritari; kumppani vain viiva taivaalla | kohtaus 51–53: kumppani viivahahmona veneessä ritarin kanssa (yksi jatkuva viiva piirtää hoikan hahmon ääriviivan, ei siluettia eikä kasvoja), punos maston päällä; sankari ei ole yksin |
| A11 **(käyttäjän ydinpyyntö)** | `gef_huippu` → loppu | ritarissa ei pysyvää muutosta | viiva kietoutuu ritariin huipussa (`sash` 0→1 fraasin aikana), näkyy jokaisessa myöhemmässä otossa, värähtää viulun mukaan |
| A12 | 926–954 s | kolme viirielementtiä yhtä aikaa (930–941, 949–953) | huipussa vain sankarin viiri ja kumppanin viiva/punos; muut viirit pois; tähdet alkavat pyöriä yhteisen keskipisteen ympäri kuin LP (`starsSpin`), fraasin mukana kiihtyen ja pehmeästi pysähtyen; purppura koko kuvan tapahtumana säilyy (käyttäjä hyväksyi) |
| B3 | 422–472 s | iltataivas oranssi, viiva lähes näkymätön 423–432 s | metsäaukion **sininen** iltataivas (väripartituuri: ilta = berliininsininen + paperi), viiva paperinvalkoisena selvästi kontrastissa; seuraa viulun suuntaa |
| A10 | 472–760 s | sommitelma vaihtuu, mutta pizzicatot eivät näy | pizzicato (`panns_pizzicato`) = viivan värähdys pisteinä; jokaiseen mielialaan ritarin yksi ele (ohjaus luku 3) |
| jatkuvuus | 832,5 s | ritari vaihtuu istuvasta seisovaan yhdessä ruudussa | perustan pehmeä asennonvaihto (≥ 0,8 s) |
| jatkuvuus | 980,0 s | koko kuva nykäisee muutaman pikselin oton sisällä (ei leikkaus) | kameran polku jatkuva oton sisällä; jos leikkaus, tee siitä selvä leikkaus jaksorajassa |

## Valmis tarkoittaa

1. Stillit: 1 fps 422–472, 0,2 fps 760–900, 1 fps 840–870, 1 fps 924–956, 0,5 fps 956–1010, 1 fps 1060–1130,
   10 fps 832,0–833,5 → `runs/muste-1230/osa_3/stills2/` + kontaktiarkit.
2. Osan renderi `--start 422 --end 1126` → `runs/muste-1230/osa_3/renders/osa3_v2.mp4` (yksi renderi kerrallaan,
   kirjaus `runs/muste-1230/pyynnot.md`:hen; noin 10 min).
3. `analysis/jatkuvuus.py` osan renderille `--start 422`: ei hyppyjä iskujen ulkopuolella (832,5 ja 980,0 poissa).
4. `analysis/kriitikko.py` + tuore tarkistaja-aliagentti (model: sonnet): A8, B9, B10, A5, A11, A12, B3 OK.
5. `camcheck --max 20`, `kohtauscheck --step 15`: 0 ylitystä.
6. Raportti `runs/muste-1230/osa_3/tarkistus2.md` todennuksineen; kerro osalle 4 `pyynnot.md`:ssä, millä
   `sash`-arvolla ritari saapuu `wal_kulissi1`:een.

Kielletyt: yhteisten tiedostojen muokkaus, kovakoodatut sekunnit ja `+N s` -lisäykset, kehon reaktio iskuun, ympyrät
olentojen tilalla, koko puolen renderöinti.
