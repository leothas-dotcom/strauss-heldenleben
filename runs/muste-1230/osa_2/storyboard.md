# Osa 2: Vastustajat (wid_1_huilu → gef_viulu), toteutuneet otot

Lähde: `docs/ohjaus.md` luku 2; kuvasäännöt: `docs/kuvasaannot.md`. Tiedostot: `visual/muste/scenes_2.js`, `loc_swamp.js`.
Ajat tulevat vain ankkureista (`S.A(id)`), `segments.json`:n jaksorajoista (muiston aallot) ja mitatuista kanavista
(`S.onsetsIn`, `S.fam`, `S.energy`); eleiden kestot ovat osuuksia kahden ankkurin väliltä. Kuunteluoppaan tekstiä ei ole tässä.

Aseman logiikka (kaikki olennot ritarin lähellä, ritari ja olento samassa rajauksessa): ritari harppupuun juurella
(x −4,3), sammakot tukilla (x −3,1 / −2,3), kotilot penkereellä (x −1,3 / −0,5), sorsa vedessä (x 1,1), peili
veden alla (x 2,0), haikara paalujen portailla (x 3,2 … 5,2), varikset puun kaulalla (y 5,5–7,4). Mittakaava
ritariin (2,0) nähden: hyttynen ~1,0 (huilu), sorsa ~1,7, haikara ~2,2, kotilo ~0,9, sammakko ~0,6, varis ~0,9.

| Otto | Ankkurit | Johtaja | Ritari tekee (asento) | Olento / elementti ja sen ele | Kuva |
|---|---|---|---|---|---|
| 2.1a Laskeutuu | loc alku → `wid_1_huilu` | maailma (hiljaisuus) | kävelee vasemmalta puulle, istuutuu (kävely → istuminen) | – | laaja, ritari pieni |
| 2.1b Pisto | `wid_1_huilu` → `wid_2_oboe` | huilu | huitaisee keihäällä vaakaan (kyynärpää koukussa) | hyttynen: piikki työntyy huilun nuottialuilla, siivet lyövät vain huilun soidessa; musta pisto ensimmäisellä äänellä | lähikuva, hyttynen ja ritari |
| 2.2a Sorsa | `wid_2_oboe` → `wid_3_4` | oboe | kääntää selkänsä (kapenee syrjäksi, kääntyy vasemmalle) | sorsa: kaksoislehdykkä käy fraasin mukaan | ritari + sorsa + vesi |
| 2.2b Haikara | `wid_3_4` → `wid_dehring1` | englannintorvi | kääntyy takaisin ja nousee puoliksi | haikara: astuu neljää paalua ylös (kromaattinen nousu) | ritari vasemmalla, haikara oikealla |
| 2.2c Kotilot | `wid_dehring1` → `wid_6` | tuubat | painaa käden korvalle, keihäs pystyssä | kotilot: kellot kääntyvät, ryömivät lähemmäs (matalien kanava) | lähikuva |
| 2.2d Sorsa kiihtyy | `wid_6` → `wid_7_8` | oboe, Es-klarinetti | istuu, kuuntelee | sorsan nokka ja pää kiihtyvät | ritari + sorsa |
| 2.2e Peili ja sammakot | `wid_7_8` → `wid_9_pasuunat` | englannintorvi, fagotit | nousee puoliksi ja katsoo peiliä | peili veden alla (laiha Quijote venyy); sammakot kurnuttavat tukilla | ritari + tukki + peili |
| 2.2f Varikset | `wid_9_pasuunat` → `wid_kuoro` | pasuunat | vetää viirin suojaan (keihäs viistoon maahan, viiri kapenee) | varikset harppupuuhun, vetoputki liikkuu; tahra ensimmäisellä äänellä | puu, varikset ja ritari |
| 2.3 Sameus | `wid_kuoro` → `wid_sankari_molli` | kaikki yhtä aikaa | yrittää nousta kahdesti ja painuu takaisin | kaikki olennot; musta rasteriusva sakenee | laaja |
| 2.4a Molli | `wid_sankari_molli` → `wid_reh16` | käyrätorvet (pp) | kypärä alas, keihäs maahan | viiri tummuu | lähikuva kypärästä |
| 2.4b Kuuntelevat | `wid_reh16` → `wid_reh17` | – | istuu liikkumatta | tumma viiri hengittää; olennot himmeinä | keskilaaja |
| 2.5a Lampi | `wid_reh17` → jaksoraja 1 | jouset | kävelee rantaan, polvistuu lammen ääreen | aamun harjanne nousee veden alle (aalto 1) | lampi, ritari vasemmalla |
| 2.5b Kasvot | jaksoraja 1 → jaksoraja 2 | jouset | nostaa päätään | aurinko harjanteen takaa (aalto 2) | lähikuva |
| 2.5c Viiri | jaksoraja 2 → häipyminen | jouset | tarttuu viiriin (keihäs nousee pystyyn) | kahdeksan viiriä (aalto 3) | keskilähikuva |
| 2.5d Häipyy | häipyminen → `wid_uusi_hyokkays` | – | nousee ja kävelee puulle | muisto häipyy | laaja |
| 2.6 Piiritys | `wid_uusi_hyokkays` → `wid_reh20` | puupuhaltimet, tuubat | seisoo selkä puuhun viiri kädessä | olennot kutistuvat ritarin ympärille | ylhäältä |
| 2.7 Toverit | `wid_reh20` → `wid_sankari_nousee` | käyrätorvet | katsoo harjanteelle, nostaa kellon ja vastaa | toverit nousevat vastarannalle; roiske lammessa `wid_reh20_lautaset` | ritari lähellä, toverit kaukana |
| 2.8a Viiri pystyyn | `wid_sankari_nousee` → `wid_voitto` | jouset, torvet | nostaa viirin molemmin käsin, viiri leimahtaa | – | alhaalta ylös |
| 2.8b Voitto | `wid_voitto` → `gef_viulu` | vasket | pyyhkäisee keihäällä vaakaan | leveä punainen veto viirin kärjestä suon yli; olennot hajoavat pisaroiksi; taivas lämpenee | sammakkoperspektiivi → laaja |

## Muisto lammessa

Heijastus on aamun harjanteen peilikuva kaukorannan viivasta (y 0,25) alaspäin: sama tasanne ja rinteet kuin
`loc_valley.js`:n pääharjanteella (`valleyRidge`, sama kaava), huippu osoittaa alas, punainen aurinko sen takana
ja kahdeksan viiriä. Se ei ole kolmio eikä kartio. Kolme aaltoa ovat jousten crescendo-jaksorajat
(`segments.json`, `wid_reh17` ja kaksi seuraavaa), häipyminen on viimeinen jaksoraja ennen `wid_uusi_hyokkays`:ia.
Ritari polvistuu x −1,0:ssa penkereellä, heijastus on x 3,4:n ympärillä veden alla, joten se ei mene hänen päälleen.

## Huomio
Swamp-paikka alkaa 242,7 s; paperi väistyy ~244 s, joten otto 2.1a on lyhyt (0,3 s) ja 2.1b alkaa osin paperin alla.

## Taustatutkimuksen lisäykset (tehty)
- Lautasten isku `wid_reh20_lautaset`: musta `splat`-läiskä iskun ruudulla (koko z:stä) + roiske lammessa.
- Englannintorven vääristys (**tulkinta**, rasterikarikatyyri): haikara piirtää mustia pisteitä ritaria kohti `wid_7_8`:n aikana. Otto 2.2e ei kuvaa haikaraa, joten pisteet näkyvät vain yksittäin; ei vielä luettava.
- Ei tehty: Porterin järjestyksessä lautaset omana olentona; fanfaarilla kutistuminen (`wid_fanfaari`-ankkuria ei ole).
