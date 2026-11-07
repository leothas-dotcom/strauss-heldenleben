# Pyynnöt ja vuorot (runs/muste-1230)

## Vuoro (vain yksi renderi tai still-ajo kerrallaan koko koneella)

## Pyynnöt yhteisiin tiedostoihin
- osa 3 -> osa 4 (tiedoksi, ei muutospyyntöä, 1.11.): ritarin vyö (`sash`) on `wal_kulissi1`:ssä täysi, `sash` = 1 (main.js:n oletus
  `t0 = gef_huippu`, `dur 8` valmistuu 928 s:ssä; osa 3 ei ohita sitä, `sash: false` ei missään kutsussa). Osa 3 antaa vyölle signaaliksi
  mitatun viulukanavan (`panns_violin_fiddle`, tasoitettu); osa 4:n kannattaa antaa `sashSignal` = taistelun viulukanava. Kumppanin viivahahmo
  on sulautunut vyöhön ennen `wal_kulissi1`:tä (3.22, hs+0,3…3,3 s), joten 4.1:ssä ritari on yksin, vyö yllä.
- osa 3 (tehty, main.js): uusi paikka `H metsäaukio` (`loc_forest.js`) LOCS-taulukkoon, paikan `I kuutamojoki` alku
  siirretty ankkuriin `gef_rakkaus`, ja TRANS-taulukkoon leikkaus (`mode -1`) ankkurissa `gef_rakkaus`. TRANS on
  indeksisidonnainen LOCS-riveihin, joten uusi paikka vaati rivin myös siihen. Pyydän ohjaajaa hyväksymään.
- osa 3: `[tarkista]`-ankkurit `gef_puupuhaltimet`, `gef_rauhoittava`, `gef_hiljenee` ovat cues.json:ssa (arvio); käytetty
  sellaisinaan, storyboardiin merkitty [tarkista].
- osa 3 (puppets.js): `knightBack` (selkäkuva, käytössä loc_river.js 3.12–3.13) on kädetön laatikko; pään käännöt ja viirin haku eivät
  lue siluetista (kuvasäännöt kohdat 5, 22). Pyydän uusimaan: käsivarret, istuma-asento selin, pään käännön ja käden ojennuksen
  näkyvyys ääriviivasta. Loc_river.js käyttää `back.head.rotation.z`, `back.armR.rotation.z`, `back.M.cape`; rajapinta saa säilyä.
- osa 1 (index.html): `#slate` on `display:grid`, joka ohittaa `hidden`-attribuutin, joten jokaisen stillin ja videon alareunassa on 80 px musta palkki (kuva piirtyy vain 1000 px:ään). Korjaus: `#slate[hidden]{display:none}`. Ohjaaja hyväksyköön.
- osa 3 (uusi toteutus 1.11.): `loc_forest.js` ja `loc_river.js` siirretty `_pois/`; main.js:ssä vain oman paikan rivit tehty
  (import `shore`, LOCS `S rantaniitty` gef_viulu−0.9 → wal_kulissi1, TRANS-rivi `gef_rakkaus` poistettu). Pyyntö: `main.js overlay()`:n
  koko ruudun paperi `hil` (gef_hiljaisuus+4 … wal_kulissi1) peittää ritarin (uPaper-jälkikäsittely); 3.22 tekee paperipesun itse
  paikassa (hahmojen takana, ritari ja viiri jäävät näkyviin). Pyydän poistamaan `hil`-termin `overlay()`:sta ja `opasProbe`:n `valo.paperi`:sta
  (tai nollaamaan sen gef_hiljaisuus…wal_kulissi1 -välillä). Siihen asti 3.22:n stillit näyttävät ritarin paperin peitossa.
- osa 1 (kierros 2, vastaukset.json): `visual/muste/vastaukset.json` viittaa laakson probe-kenttiin, joiden merkitys muuttui (C11: toverit ovat kuvassa koko ajan, iskut ovat viirin kärjen napsahduksia ja puuska).
  Kentät säilyivät samannimisinä: `viirinkarjet_y` = iskun napsahdus (0..~1; ankkurit held_isku_t6/t8/t11), `viirit_n` = heraldisten viirien avautuminen vaskien tullessa (0..7), `rivi_y` = kellojen nosto (0..1; held_intro_loppuu),
  `kellot` (uusi) sama kuin `rivi_y`. Pyyntö ohjaajalle: päivitä `elementti`-tekstit (esim. "toverien viirinkärjet napsahtavat harjanteen takaa" -> "viirinkärjet napsahtavat ja tuulenpuuska pyyhkäisee; kaikki kahdeksan hahmoa kuvassa") ja
  held_intro_loppuu "kahdeksan torviritaria nousee harjanteen takaa riviin" -> "kahdeksan nostaa kellot".
- osa 1 (kierros 2, main.js): `K.fx.heroFade` ei enää ohjaa `loc_storm.js`:n sankarin painumista (storm laskee oman painumisen: held_t61+2 ... +6); meadow käyttää sitä edelleen. Ei muutosta pyydetä.
- osa 1 (kierros 2, hero.js, ei kiireellinen): `leader().place` käyttää tuulifunktiota `wind(t - k*dt)` (viirin historia); katkon (alle sekunnin) viirien painuminen tehtiin kutsujan puolella antamalla tuulifunktio, joka lukee katkon kutsuhetkestä. Jos hero.js saisi myöhemmin valinnaisen `opts.windNow` olisi siisti, mutta ei tarvita.
