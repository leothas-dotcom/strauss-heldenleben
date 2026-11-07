# Perusta 3: yhteiset tiedostot (tarkistus)

Ajettu 31.10.2026. Muutetut: `hero.js`, `puppets.js`, `companion.js`, `main.js`, `ink.js`; uusi `sash.js`, `test_sash.html/.js`.
Ei koskettu: `loc_*.js`, `scenes_*.js`, `record.js`. Ei videorenderiä.

## 1. Asennonvaihto (hero.js, puppets.js)

**Löydös 832,5 s:ssä:** ritari istuu veneessä sekä ennen että jälkeen (stillit `snap0/`, `snap_832.4667/`, `snap_832.5/`, `snap_832.5333/`, finaalin ruudut `snap_final/mont.png`).
`jatkuvuus.py`:n hyppy (28 lohkoa) on **kameraleikkaus** otossa 3.13→3.14 (`gef_rakkaus_hiljaa`, leveä → lähempi, uusi `add('3.14 …')`-otto), siis tarkoitettu leikkaus, ei asennon napsahdus. Asentohyppyä ei ole 830–835 s:ssä.
Osalle 3 ei siis tarvitse tehdä mitään tämän kohdan vuoksi.

**Yleinen sääntö silti toteutettu:**
- `puppets.js`: `poseSeq(keys)` (asentolista ankkuriaikoineen → `pose(t)`), `poseSwitch(t, tSwitch, from, to, dur)`, `POSE_BLEND_MIN = 0,8`, `POSE_BLEND = 1,5`, `poseBlendDur(d)`. smoothstep.
- `hero.js`, `place()`: **asennonvahti** (oletuksena päällä). Etsii tilafunktion asennosta hypyt (nivel > 0,3 rad / 1/12 s, puolitushaku 0,65 ms:iin, ero > 0,08 rad; kulmat modulo 2π; lantion korkeus mukana) ikkunasta [t − viirin pituus − 1,5 s, t + 1,5 s] ja pehmentää **yksittäisen** hypyn smoothstepillä (`opts.poseBlend`, oletus 1,5 s, väh. 0,8 s). Hypyn jonoa (toisto < 1,5 s välein) ei kosketa. `opts.cuts = [t,…]` sallii hypyn leikkauksessa; `opts.poseBlend = false` poistaa vahdin.
- `armIK` (puppets.js): kyynärpää taipuu aina eteenpäin (ennen: "lähempi nykyistä" -valinta vaihtoi taittosuuntaa kesken liikkeen).
- Todennus: synteettinen kova istuu→seisoo hyppy 10 s:ssä: lantion korkeus ja `hpN` kulkevat smoothstepillä 10,0→11,5 s (`dbg2.mjs`), täsmälleen kuten `poseSeq`. Koko A-puolen skannaus: `poseskan.mjs` (`window.poseScan`, `poseskan_3.txt`).

## 2. Sankarin vyö (A11): `sash.js`, `hero.js`, `main.js`
Kumppanin paperinvalkoinen viiva (leveys 0,085 = companionFigure W0) olkapäältä rinnan yli lanteelle ja vyötärön ympäri, vapaa pää tuulessa. Torson lapsi → seuraa FK:ta. Myös selkäkuvassa (`knightBack`).
`main.js` asettaa oletuksen `setSashDefault({ t0: S.A('gef_huippu'), dur: 8, signal: viuluviivan varmuus })`, joten kaikki myöhemmät otot (taistelu, B-puoli) saavat vyön **ilman osien muutoksia**. Todennus: `sash.png` (seisoo, polvistuu, ratsailla, selkä; amount 1 / viulu soi / amount 0,5), stillit 935 s.

## 3. Paperisiirtymä (A8): `main.js` (`washAt`, `PAPER_TRANS`, `sketchPass`), `ink.js`
Syy: pääkuvan paperikatto (`hil`, uPaper 0,92 1106→1126 s) peitti `loc_shore.js`:n oman luonnoksen ja haalisti taistelukentän läpi.
Nyt (puhdas aikafunktio, ajat ankkureista `gef_hiljaisuus`→`wal_kulissi1`): vanha paikka kuivuu paperiksi (3,5–9,5 s hiljaisuuden alusta; 3.22:n teko, ritari nostaa viirin, ehtii näkyä ennen paperia), **uuden paikan ensimmäisen ruudun lyijykynäluonnos** (reunaviivat, post-shader, `tS`) piirtyy paperille vasemmalta oikealle 5,0 s hiljaisuuden alusta aina painumiseen asti (tyhjää paperia ilman luonnosta < 2 s), ja uusi paikka painuu luonnoksen päälle rasterina viimeiset 3 s (mode 3), päättyen ankkuriin. Mikään välivaihe ei näytä toista paikkaa haalistuneena. Stillit 1100–1130 s: `siirtyma/`, kontakti `kontakti_siirtyma.png` (ennen: `kontakti_siirtyma_ennen.png`).
Uusi siirtymä lisätään riville `PAPER_TRANS` ({ from, to, next: paikan id }).

## 4. Tähdet (A12)
Tähtitaivas on `loc_shore.js`:ssä (ei world.js:ssä) → ei tehty, pyyntö osalle 3.

## 5. Syaani (D5)
`ink.js`: RGB-kanavasiirtoa ei ole; laattojen siirto alle 2 px. Zoom 4× reunoista (36, 150, 935 s): `syaani/zoom4x.png`; syaani- ja magenta-pikseleitä 0 / 0 / 0 kolmessa ruudussa. Ei korjattavaa.

## 6. Hahmot eivät pompi (C1/C11)
Yhteisissä tiedostoissa (`hero.js`, `puppets.js`, `companion.js`, `critters.js`, `signals.js`, `world.js`) ei ole iskuun/nuotinalkuun/`S.drops`iin sidottua kehon nykäystä, ponnahdusta tai ilmestymistä: `poseKnight`/`place` eivät lue iskuja, hevosen `bob` on askelvaihe, roiske (`world.js`) on pöllähdys. Poistettavaa ei löytynyt.
Mutta asentoskannaus löysi **kovia asentohyppyjä** juuri C1:n kohdista (17,607 / 21,587 / 27,467 s, aF 1,5 rad kaikilla sankareilla yhtä aikaa): ne pehmenevät nyt vahdilla, mutta syy on `loc_valley.js`:ssä (osa 1). Ks. `pyynnot_osille.md`.

## Mittaukset
- `render.mjs --stills 20,150,232,832.5,833.5,935,1110,1120,1125,1127,1180`: ei virheitä, `stills/` + `kontakti_stills.png`. Muualla kuin korjatuissa kohdissa samannäköiset.
- `kohtauscheck.mjs --step 30`: kerrosreunan ylityksiä 0 ruudussa; tyhjää taustaa 23 ruudussa, kaikki koskemattomissa paikoissa (A paperi 0–7 s, taistelun loppu 1225–1227 s, levy 1228–1239 s; check-tilan magenta on niissä tarkoitettu) ja 1090–1130 s: 0.
- Ei tehty: `camcheck` (kameroihin ei koskettu), videotarkistus (ei renderiä).

## Avoimet pyynnöt yhteisiin tiedostoihin (`runs/muste-1230/pyynnot.md`)
- **`hil`-termi (`main.js` overlay, `opasProbe` valo.paperi): tehty.** Vanha `hil` (uPaper 0,92, gef_hiljaisuus+4 … wal_kulissi1) poistettu ja korvattu `washAt()`:lla (kohta 3). Paperi ei enää peitä ritaria heti: se alkaa 3,5 s hiljaisuuden alusta, joten 3.22:n teko näkyy. Paperi peittää silti koko ruudun (myös ritarin) hiljaisuuden loppuosan, koska A8-palaute vaatii paperin ja luonnoksen. `loc_shore.js`:n oma paperipesu ja luonnos jäävät sen alle (ne eivät näy); jos osa 3 haluaa omansa näkyviin, `PAPER_TRANS`-rivi pitää poistaa, ja silloin A8:n luonnos puuttuu. `opasProbe` `valo.paperi` ja `luonnos` päivitetty.
- **`#slate[hidden]{display:none}` (`index.html`): tehty.** Stillien ja videon alareunan 80 px:n musta palkki on poissa (stillit täyskorkeita).
- **`knightBack`-nuken uusiminen (`puppets.js`): ei tehty, ei tarvita.** Pyyntö koski `loc_river.js`:ää (nyt `_pois/`); osa 3 korvasi selkäkuvan omalla `loc_shore.js`:n nukella (rivi ~765). `knightBack`ia käyttävät vielä `loc_valley.js` ja `loc_storm.js` (osa 1), joissa rajapinta (`head`, `armR`, `cape`, `hold`) pysyy ennallaan; uusiminen muuttaisi niiden kuvaa ilman pyyntöä. Ainoa lisäys: vyö (`sash`).
- **Uusi paikka `H metsäaukio` / `I kuutamojoki` / TRANS-rivi `gef_rakkaus` (main.js): ei tarvita.** Vanhentunut: `main.js`:ssä on jo `S rantaniitty` (`shore`) ja `loc_forest.js`/`loc_river.js` ovat `_pois/`; TRANS-rivit pariutuvat LOCS-riveihin oikein (`kohtauscheck` puhdas).
- **`[tarkista]`-ankkurit (`gef_puupuhaltimet`, `gef_rauhoittava`, `gef_hiljenee`): ei tarvita.** Eivät koske yhteisiä tiedostoja; ankkurit luetaan cues.json:sta kuten ennenkin.
