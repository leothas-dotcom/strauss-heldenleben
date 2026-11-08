# Julkaisu 2.0: korjauslista (soitinväitteet)

Jokainen rivi: tekstitysnumero (`tekstitykset/tekstitys.md`), väite, mitä lähteet sanovat, päätös.
Lähteet: **P** = partituuri (IMSLP 19168, Dover-sivu), **K** = Krauss 1952 (analyysikanavat / korva),
**R** = referenssiäänite linjattuna (kun saatavilla). Varmuus: kuultu / ehdokas / kielletty
(`docs/julkaisu2.md` luku 1).

## Patarumpu (käyttäjän havainto 7.11.: "ei soi siinä kohtaa")

| # | Aika | Väite | P | K | R | Päätös |
|---|---|---|---|---|---|---|
| 6 | 0:31 | "Vasket ja patarummut ensi kertaa" (T. 13) | ✓ harj.nro 1 (Dover s. 179): trumpetti, 3 pasuunaa, tuuba ja **Pauken-tremolo mf**, yksi tahti | ✓ PANNs timpani 0,046 kohdassa 31,5–33,5 s = **koko 400 s paketin maksimi** (p90 0,002); rumpustemmin lyönnit 31,04 / 31,63 / 32,12 (tremolo) | ✓ PANNs timpani 0,048 samassa tahdissa (ref 46,8–49,0 s; ref-A:n p90 0,003) | **kuultu, heikko**: kolme lähdettä samaa mieltä, mutta yksi tahti vaskien alla. Teksti saa sanoa "vasket ja patarummun tremolo", jos käyttäjä vahvistaa korvalla 31,5–33,5 s; muuten vain vasket (vaihe 2). |
| 7 | 0:39 | "Pöly ritarien jaloissa on patarumpu: lyönnit nostavat pilviä" (T. 14–19) | ✗ Dover s. 180: **ei Pauken-viivastoa**, patarumpu vaiti koko sivun | ✗ PANNs timpani 0,002–0,004 (p90-taso) 39–45 s; rumpustemmin "lyönnit" 40,5 / 40,9 / 41,1 / 42,6 ovat **vääriä hälytyksiä** (kontrabassot/rahina) | ✗ PANNs timpani 0,001–0,002 (ref 54–61 s) | **kielletty** (3/3). Teksti pois. Kuvan pölyn ankkuri sidottu kanavaan, joka ei ole patarumpu → vaihe 2 tarkistaa `aksentit.json`:n lyöntitunnistimen tällä alueella. |
| 8 | 0:47 | "Puupuhaltimet ja harput tulevat" (harj.nro 2) | ✓ Dover s. 181: huilut, oboet, klarinetit, fagotit pp cresc., 2 harppua mf; Pauke pp-tremolo yksi tahti | – | – | kuultu (P + opas). Patarumpua ei mainita, oikein. |
| 73 | 19:32 | "Patarummut: taistelu alkaa" | ✓ Dover s. 229–230: harj. 42 kulissitrumpetit (T. 368), harj. 43 orkesterin vastaus **Pauke mf → f, tremolo**; harj. 44 toinen kutsu, sitten orkesteri taas **Pauke mf → f** (taistelu alkaa) | (✓) PANNs timpani 0,006 kohdassa 1177–1178 (A3-paketin p90 0,001, max 0,107) eli heikko; rumpustemmin lyönnit **1175,0 / 1175,8 / 1177,5** = Pauken iskut tahdeittain | ✓ PANNs timpani 0,035 kohdassa Krauss 1176–1180 (ref 1262,6–1265; ref-A:n p90 0,003, max 0,087) | **kuultu**. Patarummut tulevat orkesterin purkauksessa noin **1175,0 s**, 2,5 s teemakartan `wal_taistelu`-rajan (1172,5, mp → f) jälkeen → tekstin alku siirretään purkaukseen (vaihe 2). |

## Muut tarkistettavat (luettelo `docs/julkaisu2.md` 1.4)

| # | Aika | Väite | Tila |
|---|---|---|---|
| 11, 17, 54, 58 | – | harput | avoin |
| 21–26 | 4:03–4:27 | vastustajien soittimet (huilu, oboe, tuubat, englannintorvi, fagotit, sordinoidut pasuunat) | avoin; P tukee Porteria, ajat K:sta |
| 70, 72 | 18:45, 19:24 | trumpetit lavan takana | avoin |

## Vaiheen 1 havainnot, jotka koskevat teemakarttaa tai kuvaa (ei muutettu, vaihe 2)

Lähde: `referenssi_hr2015.md` (8.11.2026).

- **`gef_viulu` 422,0** on Kraussin pp-hännän alku; sooloviulu ja harppu tulevat **423,2** (yleistauko
  422,7–423,1). Referenssissä vastaava 480,2. Tekstityksen #36 ("Sooloviulu on Kumppani…") alku
  tarkistetaan tätä vasten.
- **Kulissitrumpetit** (1125,7–) soivat kummassakin levytyksessä orkesteria matalammalta (Krauss −23 c,
  hr −5 c). Niiden intonaatiosta ei väitetä mitään; ne eivät kelpaa viritystason mittaamiseen.
- **Levyn nopeus**: Krauss soi a¹ ≈ 447 Hz koko puolen ajan; virhe +0,6…+0,9 % WPh 443–444 Hz
  oletuksella → julkaisu2.md 1.5 b) ehdotetaan; päätös käyttäjällä. Jos b) tehdään, kaikki tämän listan
  ajat kertautuvat kertoimella k.
- **Linjaus hr2015 → Krauss** on ±0,4 s held/widersacher/walstatt-rajoilla ja noin 3 s edellä Gefährtinin
  alussa: referenssin soitinhavaintoja ei käytetä tarkkaan ajoitukseen 422–450 s alueella ilman korjausta.
- **`aksentit.json`:n patarumpulyönnit** 40,5–42,7 s ovat vääriä (partituurissa ei patarumpua, PANNs
  hiljaa molemmissa levytyksissä): tunnistimen kynnys tai kaista tarkistetaan ennen kuin lyöntejä
  käytetään kuvan ankkureina.

## Huomio menetelmästä

Rivi 6 näyttää, miksi kolme lähdettä tarvitaan: partituuri sanoo "kyllä", mutta yksi mf-tahti patarumpua
tuttivaskien alla ei ole 1952 monolevyltä kuultavissa. **Kuuntele-kerrokseen pääsee vain se, minkä
katsoja voi todentaa tästä äänitteestä.** Partituurin totuus kuuluu tausta-kerrokseen ("partituurissa
myös patarumpu"), jos sitä halutaan sanoa.
