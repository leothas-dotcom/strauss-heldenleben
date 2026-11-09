# Julkaisu 2.0: korjauslista (soitinväitteet)

Jokainen rivi: tekstitysnumero (v1, `tekstitykset/tekstitys.md` 4.11.), väite, mitä lähteet sanovat, päätös.
Lähteet: **P** = partituuri (IMSLP 19168, Dover-sivu), **K** = Krauss 1952 (analyysikanavat: PANNs suhteessa
paketin p90:een, `rekisteri.py`:n spektri kohinaan verrattuna, rumpustemmi; korva), **R** = referenssi hr 2015
PANNs linjattuna Kraussin aikaan. Varmuus: kuultu / ehdokas / kielletty (`docs/julkaisu2.md` luku 1).
Sääntö: **kuultu** vaatii kaksi lähdettä ja partituuri ei kiellä. Vain kuultu pääsee Kuuntele-kerrokseen;
pelkän partituurin tieto saa olla Tausta-kerroksessa sanalla "Partituurissa". Varmuudet on kirjattu
teemakarttaan (`annotations/teemat.json`, kenttä `soittimet`), ja `tekstitys.py` tarkistaa ne.

Ajat alla ovat alkuperäisen siirron aikaa (ennen 9.11.); korjatussa ajassa t / 0,98598.

## Patarumpu (käyttäjän havainto 7.11.: "ei soi siinä kohtaa")

| # | Aika | Väite | P | K | R | Päätös |
|---|---|---|---|---|---|---|
| 6 | 0:31 | "Vasket ja patarummut ensi kertaa" (T. 13) | ✓ harj.nro 1 (Dover s. 179): trumpetti, 3 pasuunaa, tuuba ja **Pauken-tremolo mf**, yksi tahti | ✓ PANNs timpani 0,046 kohdassa 31,5–33,5 s = **koko 400 s paketin maksimi** (p90 0,002); rumpustemmin lyönnit 31,04 / 31,63 / 32,12 (tremolo) | ✓ PANNs timpani 0,048 samassa tahdissa (ref 46,8–49,0 s; ref-A:n p90 0,003) | **patarumpu: ehdokas (heikko)**: kolme lähdettä samaa mieltä, mutta yksi tahti vaskien alla, eikä käyttäjä kuule sitä. v2: vain vasket (kuultu). Palautetaan, jos käyttäjä vahvistaa korvalla 31,5–33,5 s. |
| 7 | 0:39 | "Pöly ritarien jaloissa on patarumpu: lyönnit nostavat pilviä" (T. 14–19) | ✗ Dover s. 180: **ei Pauken-viivastoa** | ✗ PANNs timpani p90-taso 39–45 s; rumpustemmin "lyönnit" 40,5 / 40,9 / 41,1 / 42,6 ovat **vääriä hälytyksiä** | ✗ PANNs timpani p90-taso | **kielletty** (3/3). v2: tarina-rivi "Pöly nousee matalien iskujen mukana" (kuvan pöly seuraa kanavaa 'patarummut ja matalat iskut', loc_valley.js). |
| 8 | 0:47 | "Puupuhaltimet ja harput tulevat" (harj.nro 2) | ✓ Dover s. 181 (s. 5): huilut, oboet, klarinetit, fagotit pp cresc., 2 harppua mf | ✗ PANNs 0,1× (sokea) | ✗ 0,0–0,5× | **ehdokas** (vain P) → v2 Tausta: "Partituurissa puupuhaltimet ja kaksi harppua tulevat nyt ensi kertaa." |
| 73 | 19:32 | "Patarummut: taistelu alkaa" | ✓ Dover s. 229–230: harj. 43 ja 44 jälkeen **Pauke mf → f, tremolo** | (✓) PANNs 0,006 = 6× p90; rumpustemmin lyönnit **1175,0 / 1175,8 / 1177,5** | ✓ PANNs 0,035 ≫ p90 0,003 kohdassa 1176–1180 | **kuultu**. Uusi ankkuri `wal_patarummut` (1175,0 → 1191,72 korjatussa ajassa), teksti siirretty siihen. |

## Harput

| # | Ankkuri | Väite | P | K | R | Päätös |
|---|---|---|---|---|---|---|
| 11 | held_t49 (1:42) | "Harput väreilevät vedessä" | ✓ s. 11 (T. 49): harput pp | PANNs harppu 2× p90 | 2× p90 | **kuultu, heikko** (kaksi heikkoa + P). v2 Kuuntele: "harput pp". |
| 17 | held_reh11 (3:00) | "Harput ja puupuhaltimet ryöppyävät alas" | ✓ s. 18 (T. 90): 2 harppua fff glissando, puupuhaltimet juoksutuksin | ✗ 0,1× (ff-tutti) | ✗ 0,0× | **ehdokas** → v2 Tausta: "Vesiputous: partituurissa kaksi harppua glissandona alas, puupuhaltimet juoksutuksin." |
| 54 | gef_rakkaus (13:30) | "Harppujen glissandot" | ✓ glissandot luettu partituurista (B10/B11, 1.11.) | ✓ käyttäjä kuuli harpun rakkauskohtauksessa (palaute 31.10.); PANNs harppu sokea (1,0×) | 1,0× | **kuultu** (P + korva). |
| 58 | gef_nousu (14:46) | "Jouset ja harppu alkavat nousta" | – | harppu 2,1×, viulu 2,3× | harppu 2,0×, viulu 0,9× | **ehdokas** → v2 tarina ilman soitinta: "Musiikki alkaa nousta hiljaa kohti huippua." |

## Vastustajat (4:03–4:45)

| # | Ankkuri | Väite | P | K | R | Päätös |
|---|---|---|---|---|---|---|
| 21 | wid_1_huilu | huilu, "sehr scharf und spitzig" | ✓ Porter 1 | ✓ PANNs huilu 110×, rekisteri korkea kaista | ✓ 224× | **kuultu** |
| 22 | wid_2_oboe | oboe, "schnarrend" | ✓ Porter 2 | ✓ rekisteri C#5 +36 dB | ✓ puupuhallin 82× | **kuultu** |
| 23 | wid_dehring1 | 2 tuubaa kvintin päässä | ✓ Porter 5 (tenori- ja bassotuuba) | ✓ rekisteri G3/Es3 +27/+24 dB | – (ei luokkaa) | **kuultu** |
| 25 | wid_7_8 | englannintorvi vääristää teeman; 2 fagottia | ✓ Porter 7–8 | ✓ rekisteri G#4/F#4 ja G3 | – (ei luokkaa) | **kuultu** |
| 26 | wid_9_pasuunat | 3 sordinoitua pasuunaa | ✓ s. 24 (T. 130) | ✓ PANNs 16× | ✓ 26× | **kuultu** |
| 29 | wid_reh17 | viulut aaltoina | ✓ harj. 17 (I viulut sord.) | ✓ rekisteri | – | **kuultu** |
| 32 | wid_uusi_hyokkays | hyökkäys (v2: pikkuhuilu ja huilu ff) | ✓ harj. 19 | ✓ rekisteri korkea kaista | – | **kuultu** |
| 33 | wid_reh20 | 8 käyrätorvea vastaavat | ✓ harj. 20 | ✓ rekisteri + PANNs 2,6× | 0,1× | **kuultu** |
| 35 | wid_voitto | voitto (v2: vasket ff) | Kennedy: fanfare from the brass | ✓ vasket sisään ×36 | – | **kuultu** |

## Muut soitinväitteet

| # | Ankkuri | Väite | P | K | R | Päätös |
|---|---|---|---|---|---|---|
| 2 | held_alku | käyrätorvet ja sellot | ✓ s. 3–4 | PANNs käyrätorvi 3,8×; sello 0,4× | sello 1,3× | **kuultu** käyrätorvi; sello → "matalat jouset" (alttoviulut, sellot, bassot; P + rekisteri matala) |
| 4 | held_isku_t6 | kaikki 8 käyrätorvea iskevät | ✓ s. 3 (T. 6) | isku z 5,5 (ei soitinta) | 0,1× | isku **kuultu**, soitin vain P → v2: "Kuuntele: isku keskellä teemaa. Partituurissa kaikki kahdeksan käyrätorvea…" |
| 5 | held_viulut | viulut tulevat | ✓ s. 3–4 (T. 9) | ✓ käyttäjä 29.10. + PANNs 1,5× | 0,6× | **kuultu** |
| 12 | held_reh6 | kaksi käyrätorvea laulaa | ✓ s. 12 (T. 53–56) | 0,5× | 0,1× | **ehdokas** → v2 tarina: "Kaksi punaista vetoa: partituurissa kaksi käyrätorvea laulaa." |
| 14 | held_reh8 | 8 käyrätorvea ff | ✓ s. 13 | ✓ PANNs 2,4× | 1,4× | **kuultu** |
| 36 | gef_viulu | sooloviulu | ✓ | ✓ | ✓ 0,93 | **kuultu**; huom. viulu tulee 1,2 s ankkurin (pp-häntä) jälkeen, teksti ennakoi |
| 38 | gef_vastaus1 | käyrätorvet vastaavat | opas | ✓ PANNs 21× | – (linjaus ~3 s edellä) | **kuultu** |
| 41 | gef_vastaus2 | sellot ja bassot | Porter: matalien jousten repliikit | rekisteri matala, mp | 0,6× | **kuultu** "matalat jouset" |
| 46 | gef_vastaus3 | käyrätorvet ja bassot | – | 0,3× | 1,6× / 2,1× | **ehdokas** → v2 tarina ilman soitinta |
| 48 | gef_puupuhaltimet | "Puupuhaltimet palaavat. Arvostelijoiden kaikuako?" | – (ankkuri arvio) | klarinetti 26× | 0,3× | **ehdokas**, kysymysmuoto ei kelpaa → **poistettu** |
| 49 | gef_leimahdus | leimahdus (vasket) | – | vasket sisään 692,8 | – | v2 tarina ilman soitinta |
| 50 | gef_lustig | viulu nauraa | ✓ | ✓ 5,2 nt/s | – | **kuultu** |
| 59 | gef_kolkutus | puupuhaltimet kolkuttavat | – | ✓ klarinetti 11× | ✓ 22× | **kuultu** |
| 63 | gef_jalkihehku | hiljaiset käyrätorvet | – | 1,0× (interpret +käyrätorvet) | 1,0× | **ehdokas** → v2 tarina: "Hiljaisia kutsuja yössä." |
| 67 | gef_arvostelijat_uni | puupuhaltimet kuiskivat | Porter/Kennedy | ✓ huilu 33× | ✓ 220× | **kuultu** |
| 70, 72 | wal_kulissi1/2 | kolme trumpettia lavan takaa | ✓ Dover s. 229 (harj. 42), s. 230 (harj. 44) | ✓ 23× / 27× | ✓ 16× / 26× | **kuultu** |
| 20 | held_dom7_sointu | "Sädekehä on levyn ääni: jokainen säde on taajuusalue" | koodin selitys | | | **poistettu** (making-of); tilalle tausta: yleistauko on teoksen ainoa pitkä hiljaisuus (T. 117) |

## Vaiheen 1 havainnot, jotka koskevat teemakarttaa tai kuvaa

- **`gef_viulu`** on pp-hännän alku; sooloviulu ja harppu tulevat 1,2 s myöhemmin (alkup. 423,2; ref 480,2).
  Tekstin ennakko riittää, ankkuria ei siirretty.
- **Kulissitrumpetit** soivat kummassakin levytyksessä orkesteria matalammalta (Krauss −23 c, hr −5 c).
  Intonaatiosta ei väitetä mitään.
- **Levyn nopeus**: korjattu 9.11. (k = 0,98598, `audio/lahde.json`); tämän listan ajat ovat alkuperäistä aikaa.
- **Linjaus hr2015 → Krauss** ±0,4 s muualla, noin 3 s edellä Gefährtinin alussa (R ei käytössä 422–450 s).
- **`aksentit.json`:n patarumpulyönnit** 40,5–42,7 s ovat vääriä: tunnistin reagoi kontrabassoihin/rahinaan.
  Kuvan pöly nousee niistä silti oikein "matalina iskuina"; tekstitys sanoo nyt niin.

## Huomio menetelmästä

Rivi 6 näyttää, miksi kolme lähdettä tarvitaan: partituuri sanoo "kyllä", mutta yksi mf-tahti patarumpua
tuttivaskien alla ei ole 1952 monolevyltä kuultavissa. **Kuuntele-kerrokseen pääsee vain se, minkä
katsoja voi todentaa tästä äänitteestä.** Partituurin totuus kuuluu tausta-kerrokseen ("Partituurissa
…"). PANNs on harpulle, käyrätorville tekstuurissa ja koko ff-tutille sokea molemmissa levytyksissä;
siellä K-lähde on `rekisteri.py`:n spektri tai korva, ei PANNs.
