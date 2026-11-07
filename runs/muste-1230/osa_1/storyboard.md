# Osa 1: Sankari (held_alku → held_gp), otot toteutuneina

Lähteet: `docs/ohjaus.md` luku 1, `docs/tuotantojako.md` (Muste säästeliäästi, Stillisääntö). Ajat tulevat
teemakartan ankkureista (`S.A(id)`), ei kovakoodattuja sekunteja; murtoluvut ovat ankkurivälin osia. Tiedostot:
`visual/muste/scenes_1.js`, `loc_valley.js`, `loc_sea_muste.js`, `loc_meadow.js`, `loc_storm.js`.
Pääosa = se, joka musiikissa puhuu (sarake "johtaa").

| Otto | Ankkurit | Johtaa | Sankari tekee (asentokirjasto) | Muste | Kamera / valo |
|---|---|---|---|---|---|
| 1.1 | held_alku → held_isku_t6 | veto | Selkäkuva nousee harjanteen takaa ja kohottaa keihään sävelen mukana (selkäkuva, pieni, alhaalla) | **Kohta 1:** yksi veto, sivellin = keihään kärjen korkeus (vahvistettu 2,0×), etenee ajan mukana nuotti nuotilta; taivas tyhjä | nosturi nousee vedon mukana; yö → sarastus |
| 1.1b | held_isku_t6/t8/t11 | maailma | Toverien viirinkärjet napsahtavat harjanteen takaa iskuilla (tips) | – | – |
| 1.2 | held_viulut → held_vasket_t13 | viulut (tuuli) | Kääntyy profiiliin (`kaantyminen_profiiliin`) ja kävelee harjannetta ylös (`kavely`) | veto haalistuu vaskiin mennessä (portti ja ikä) | viulut sytyttävät tuulen, vuoret sinisellä |
| 1.3 | held_vasket_t13 → held_intro_loppuu | trumpetit, patarummut | Pysähtyy ja nostaa keihään molemmin käsin (`keihaan_nosto_molemmin`); aurinko nousee harjanteen takaa, hän pieni | – | sama ajo laajenee; pöllähdykset patarumpuiskuista |
| 1.4 | held_intro_loppuu → held_lyyrinen | ritari | Kääntyy tovereihin ja nostaa kellon (`kellon_nosto`); puuska (held_viulut_paluu) nostaa viirit | – | sivuajo rivin ohi |
| 1.5 | held_lyyrinen → held_t31 | **tiirat**, harput | Astuu laivan keulaan (`kavely`), katsoo tiiroja ja ojentaa keihään; yksi tiira laskeutuu kärkeen (held_t25) | – | vedenpinnan taso, lento parven mukana |
| 1.6 | held_t31 → held_reh4 | **tiirat**, laivasto | Nostaa purjeen (köyden veto), laivasto liittyy held_t34:ssä | – | sivuajo |
| 1.7 | held_reh4 → held_t47 | maailma | Nostaa kellon fraasin mittaisesti (held_reh5_isku, lähikuva); sforzandot ovat tiirojen syöksyjä; laiva ylittää harjan, aurinko murtautuu | – | lähikuva vetäytyy yhtenä liikkeenä laajaan |
| 1.8 | held_t47 → held_reh6 | **huilu, englannintorvi** (pääskyt) | Polvistuu purolle (`polvistuminen`, pää alas); harput = puron renkaat, tremolo = heinät | – | hyvin hidas lähestyminen, kultainen aamupäivä |
| 1.9 | held_reh6 → held_t61 | torvet I–II | Hahmo hajoaa rasteriksi; hahmon vedot juoksevat kahdeksi punaiseksi vedoksi | **Kohta 4:** kaksi vetoa, alttoviulu sininen katkoviiva välissä; ei kärjen jälkeä | sivuajo friisin vierellä, paperinvaalea |
| 1.10 | held_t61 → held_reh8 | ritari | Vedot kokoontuvat ritariksi (punaiset viirut lentävät hahmon luo, raster palaa), marssii ylätasangolle | – | nousee maan tasalta |
| 1.11 | held_reh8 → held_reh9 | torvet ×8 | Kahdeksan nostaa kellot yhtä aikaa | **Kohta 2:** YKSI leveä veto rivin yllä (sävel aikaskaalattuna alun teemaviivasta, TULKINTA); ei keihäitä, ei lankoja | laaja, rivi kokonaan kuvassa |
| 1.12 | held_reh9 → held_reh10 | maailma (iskut) | Mitatut iskut avaavat kolme viiriä vuorotellen; sankari kulkee rivin editse (`kavely`) | veto kuivuu pois | sivuajo |
| 1.13 | held_reh10 → held_reh11 | ritari | Kiipeää kalliolle ja osoittaa keihäällä vaakaan kohti myrskyvuorta (käsi koukussa); sädekehän luonnos vuoren yllä | – | laaja, korkealla |
| 1.14 | held_reh11 → held_reh12 | **maailma** | Joukko laskeutuu putouksen vierestä altaalle; putous nousee, harpun glissandot ovat ryöppyjä | – | seuraa putousta |
| 1.15 | held_reh12 → held_isku1 | maailma | Kiipeää rinnettä sateessa joukon kärjessä | – | sivuajo |
| 1.16 | held_isku1 → held_dom7_sointu | maailma | Salama katkon alussa, joukko pysähtyy ja viirit painuvat; iskulla napsahtavat | – | nosturiajo |
| 1.17 | held_dom7_sointu → held_dom7 | pasuunat | Selkäkuva 2: nostaa keihään ja iskee sen kiveen; sädekehä leimahtaa iskussa | – | hyvin hidas lähestyminen |
| 1.18 | held_gp → wid_1_huilu | – | Säteet sammuvat, hän seisoo yksin, paperi nousee kuvan yli | – | tyhjä paperi |

## Poikkeamat ohjauksesta
- "Laskee kypärän" (1.8): kypärä on hahmon osa; toteutettu pään painamisena (tilt) polvistuessa.
- 1.9: torviritareita ei ole; kaksi vetoa ovat torvet I–II, koska sankarin vedot juoksevat (ohjaus), ja viulun sävel on S.melody-viivasta
  vahvistettu **[TULKINTA]**.
- Vedon pystyvahvistus (1.1): kärjen korkeus ×2,0, jotta veto kulkee ruudun alareunasta yläreunaan pienen ritarin yllä.
- Kolmas kohta (`gef_huippu`) kuuluu osalle 3.
