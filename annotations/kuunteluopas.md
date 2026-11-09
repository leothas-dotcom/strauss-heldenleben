# Kuunteluopas: Ein Heldenleben

*Wienin filharmonikot, Clemens Krauss (London LL 659).*

Tämä on projektin "sanoitukset": mitä musiikissa tapahtuu ja mitä se merkitsee,
aikakoodattuna juuri tähän äänitteeseen, minuutti minuutilta koko teoksen läpi.
Kuvakäsikirjoitus kirjoitetaan tämän pohjalta. Versio 3, 29.10.2026.

**Ajat:**
- **[A m:ss]** = LP-puoli 1 (`audio/lp_krauss/side1.flac`)
- **[B m:ss]** = LP-puoli 2 (`side2.flac`)
- Puolenvaihto on kesken taistelun.
- **Kuuntele WAV-kopiosta:** `build/kuuntelu/A_puoli_kuuntelu.wav` ja `B_puoli_kuuntelu.wav`.
  Windows Media Player arvioi FLAC-tiedostossa toistokohdan tiedostosijainnista, joten sen kello
  kulkee kovissa jaksoissa edellä (A-puolella noin +11 s neljännellä minuutilla). WAVissa kello
  on tarkka, ja se on sama kuin tämän oppaan ja videon aika.
- Kaikki ajat ovat alkuperäisen FLACin aikaa. Analyysin ja videon äänitiedostot on mitattu
  näytteen tarkkuudella samaan aikaan (`analysis/kellot.py`).
- Tarkkuus: A 0:00–6:48 on tarkistettu (iskut 10 ms, muut ±0,5 s). Sen jälkeen ja koko B-puolella
  jaksojen alut ovat analyysin jaksorajoja, joiden epävarmuus on noin ±1 s, kunnes ne on
  tarkistettu korvalla.

**Mistä ajat tulevat:** kaikki tämän oppaan ajat generoidaan teemakartasta
[teemat.json](teemat.json) (`python -I analysis/kuunteluopas.py`). Samasta kartasta
`make_cues.py` kirjoittaa [cues.json](cues.json):n, joten opas ja merkinnät eivät voi olla
ristiriidassa. Korjaukset tehdään teemakarttaan, ei tähän tiedostoon.

**Tapahtumaluokat** (tärkeimmät kuuntelijalle):
- **uusi soitin**: soitin tai ryhmä tulee sisään
- **tunnelma**: dynamiikka, liike tai rekisteri muuttuu selvästi
- **soolo**: yksi soitin hallitsee ohutta tekstuuria (alussa käyrätorvet, sitten sooloviulu)
- **huippu**, **tauko**

**Varmuus:**
- **vahvistettu** = sinä olet tarkistanut korvalla
- **analyysi** = selvä mitattu piirre (jaksoraja, soitin sisään, tauko, dynamiikka)
- **lähde+analyysi** = lähteen kuvaama tapahtuma osuu selvään mitattuun piirteeseen
- **arvio** = tulkinta; merkitty **[tarkista]**

## Miten opas on tehty ja kuinka luotettava se on

1. **Järjestys lähteistä.** Lähteet ovat Porter (LP:n kansiteksti), Wikipedia englanniksi ja
   saksaksi (Kennedyn ja Hepokoskin lainaukset) sekä ohjelmatekstit
   ([taustatutkimus](../docs/heldenleben_tutkimus.md)). Aikakoodattua kuunteluopasta ei löytynyt.
2. **Hetket äänestä** ([aikajana](../build/koko/aikajana_A.md), `analysis/aikajana.py`):
   - **Jaksorajat** tulevat segments.py:n uutuuskäyrästä (taajuuskaistat, kroma, voimakkuus,
     nuotinalut). Ne ovat teräviä (±0,5 s) ja osuvat kaikkiin vahvistettuihin kohtiin.
   - **Soitin sisään tai ulos** tulee interpret.py:stä (soitinperheen aktiivisuus moninkertaistuu).
   - **Mikä soi** tulee PANNs-soitintunnistimesta. Se kertoo luotettavasti soitinperheen
     hiljaisissa ja ohuissa kohdissa, mutta ei tarkkaa hetkeä, koska ikkuna on useita sekunteja.
     ff-tutissa se on epäluotettava: käyrätorvet katoavat sellojen alle.
3. **Teeman nimi** (esim. "Dehring", "pastoraali") tulee lähteestä, kun lähteen tapahtuma osuu
   oikeassa järjestyksessä selvään mitattuun piirteeseen. Muuten se on arvio.
4. **Partituuri** (IMSLP, Leuckart 1899) toimii vain tarkistukseen. Esimerkiksi sivulla 22 ovat
   dominanttiseptimi, fermaatit ja yleistauko, T. 111–117.

**Rajoitukset:**
- PANNs ei erota oboeta englannintorvesta eikä tuubia trumpeteista.
- Hiljaisissa kohdissa levyn rahina näyttää lautasilta ja virveliltä, ja ne suodatetaan pois.
- Lainauksia (Don Juan, Till...) ei tunnisteta äänestä melodiana.
- Tahtinumeroita ei lasketa äänestä, koska tahtiruudukko ajautuu tempomuutoksissa ja
  fermaateissa.

**Palaute:** kun kuuntelet oppaan kanssa, kerro aika ja mitä kuulit, esimerkiksi "A 4:11 ei
tuubia, ne tulevat 4:15" tai "B 14:30 pastoraali kuuluu, oikein". Korjaukset menevät
teemakarttaan. Oikeaksi kuullut kohdat saavat merkinnän **vahvistettu**, eikä niitä muuteta enää.

---

## Tarina lyhyesti

**Sankari astuu esiin.** Hän on yhtä aikaa Strauss itse ja ei ole. Häntä kuvaa laaja,
itsevarma teema, joka harppoo matalalta korkealle: mielikuvitusta, paloa, pyrkimystä ja
suoraselkäisyyttä.

**Vastustajat nalkuttavat.** Pikkumaiset kriitikot pistelevät ja pilkkaavat. Sankari ei
aluksi välitä, mutta suuttuu sitten ja ajaa heidät tiehensä.

**Kumppani saapuu.** Pauline, sooloviulu, rauhoittaa sankarin. Hän on oikukas: välillä
hellä, välillä teeskentelevä, iloinen, kevytmielinen ja pisteliäs. Lopulta syntyy
rakkausduetto.

**Taistelu.** Rakkauden jälkeen vihollisten mutina kuuluu taas, ja kaukaiset trumpetit
kutsuvat taisteluun. Kumppani rinnallaan sankari voittaa, ja hänen teemansa palaa
riemukkaana.

**Rauhantyöt ja täyttymys.** Voiton jälkeen sankari muistelee luomistyötään: Straussin
omat aiemmat teokset kuuluvat lainauksina. Kriitikot yrittävät vielä kerran. Sitten
sankari vetäytyy maailmasta ja löytää rauhan.

**Sävy:** ironia ja vakavuus kulkevat rinnakkain. Teos on sekä ylevä sankarikuva että
hymyilevä omakuva, ja sen sisarteos on naurettavaa sankaria kuvaava *Don Quixote*.

## Tunnekaari

itsevarmuus → ärtymys ja pilkka → hellyys ja oikku → intohimo → kamppailu → riemuvoitto →
muistelu → seesteisyys

Sonaattimuotona (Hepokoski):
- **esittely:** sankari, vastustajat, kumppani
- **kehittely:** taistelu
- **kertaus:** sankariteema palaa voiton jälkeen
- **kooda:** rauhantyöt, pako maailmasta ja täyttymys

## Henkilöt ja teemat

| Henkilö | Ääni | Mistä tunnistaa |
|---|---|---|
| Sankari | käyrätorvet ja sellot | laaja, harppova Es-duuriteema: 3½ oktaavia yhdeksässä tahdissa, ja teema jatkuu 116 tahtia tauotta |
| Vastustajat | huilu, oboe, englannintorvi, Es-klarinetti, fagotit, tuubat, sordinoidut pasuunat | lyhyet, piikittelevät ja kärttyisät aiheet, korkealta nokkien |
| Dehring | tenorituuba ja bassotuuba | neljän sävelen aihe rinnakkaisina kvintteinä: "Dok-tor Deh-ring" |
| Kumppani | sooloviulu | mielialat vaihtuvat muutamassa tahdissa |
| Rakkaus | sankarin rauhoittava fraasi ja kumppanin herkin melodia | Ges-duuri, harpun glissandot ja tremolot |
| Taistelu | kolme kulissitrumpettia, lyömäsoittimet, trumpetit | kaukainen fanfaari, sitten 3/4, virvelit ja patarummut, kaikki teemat vastakkain |
| Rauhantyöt | Straussin omat teokset | Don Juan, Zarathustra, Tod und Verklärung, Don Quixote, Till Eulenspiegel, Guntram, Macbeth, laulu *Traum durch die Dämmerung* |
| Sovitus | englannintorvi | sama soitin, joka vastustajana vääristi sankariteeman, soittaa sen lopussa maalaisena |

## Ankkurit (varmimmat kohdat)

<!-- GEN:ankkurit -->
| Kohta | Aika | Mistä tunnistaa | Varmuus |
|---|---|---|---|
| Sankari astuu esiin | A 0:07.7 | musiikin alku +12 dB/s 7.6; partituuri s. 3-4 (tahdit 1-20) ja tahtiruudukko (T1 7.62, T6 17.64, T8 21.62, T9 23.62, T11 27.50, T13 31.42, T17 39.44, T20 45.74) | lähde+analyysi |
| Intro päättyy, jotain uutta alkaa | A 0:40.0 | käyttäjä: '0:00-0:40 intro, sitten uusi asia' (korvalla 29.10.); jaksoraja ja nuotinalku 39.4; partituuri s. 3-4 (tahdit 1-20) ja tahtiruudukko (T1 7.62, T6 17.64, T8 21.62, T9 23.62, T11 27.50, T13 31.42, T17 39.44, T20 45.74) | **vahvistettu** |
| Ensimmäinen huippu lähestyy | A 1:29.5–1:38.9 | jakso 88.2-94.1 ff, rekisteri 0.72, max 0.91; partituuri T42-44 crescendo | analyysi |
| Jännite jää ilmaan | A 3:52.3–4:02.6 | partituuri s. 22 (T. 112); kroma Bb7 3:49-3:58.5 (osuvuus 0.55); jakso 223.7 ff crescendo 0.72 -> 0.94 | analyysi |
| Jotain on tulossa | A 4:02.6–4:06.5 | kohinan yli 12 dB: 0-35/500 taajuutta 3:59.5-4:02.5 (spektri alkuperäisestä FLACista verrattuna levyn kohinaan (sisäänajoura), 30.10.2026); alin taso -49 dB 4:00.5-4:01.0 | analyysi |
| Arvostelija 1 aloittaa | A 4:06.5 | korkea kaista (1-3.5 kHz) 76/500 taajuutta kohinan yli 4:03, keski- ja matala kaista tyhjiä (spektri alkuperäisestä FLACista verrattuna levyn kohinaan (sisäänajoura), 30.10.2026); isku 243.10 (ensimmäinen sävel tauon jälkeen) | analyysi |
| 'The Hero's theme goes dolefully into the minor' (Kennedy) | A 4:48.9–4:56.7 | partituuri s. 25 (T. 140); jaksoraja 284.9: liike 6.3 -> 0.5/s, rekisteri laskee, g-molli 0.88; puupuhaltimet ulos 285.2 | lähde+analyysi |
| Kumppani astuu esiin, hellä ensiesiintyminen | A 7:08.0 | jaksoraja 422.0: dynamiikka f -> pp, +harppu, viulut | lähde+analyysi |
| Rakkauskohtaus alkaa: 'a voluptuously scored love-scene' (Wikipedia) | A 13:33.4–14:04.3 | jaksoraja 802.0 p -> f, +12 dB/s 802.5; Fis/Ges-duuri 0.85 13:30 | lähde+analyysi |
| Kulissitrumpetit kutsuvat taisteluun | A 19:01.7–19:21.3 | puupuhaltimet ja vasket sisään 1125.7-1126.0 lähes hiljaisuuden jälkeen; jaksoraja 1127.0 +käyrätorvet +trumpetit, rekisteri nousee 0.82 | lähde+analyysi |
| Taistelu alkaa (Wikipedia: lyömäsoittimet ja soolotrumpetti, ensimmäinen 3/4) | A 19:49.2 | jaksoraja 1172.5 mp -> f, patarummut; 1179.5 +trumpetit +virveli | lähde+analyysi |
| Kertaus: sankariteema palaa, voitto | B 4:41.6–4:49.1 | vasket sisään 277.5; jaksoraja 277.7 +käyrätorvet +trumpetit, liike 5.4 -> 1.9/s | lähde+analyysi **[tarkista]** |
| Taistelu on ohi | B 7:18.6–7:26.8 | jaksoraja 432.5 mf -> pp, +käyrätorvet; vasket sisään 436.4 | arvio **[tarkista]** |
| Agitato: arvostelijamotiivi palaa ja sankari kiihtyy (Wikipedia) | B 12:45.7–13:13.1 | jaksoraja 755.0 pp -> f, rekisteri nousee; es-molli | lähde+analyysi |
| Englannintorven pastoraali: sankariteema maalaisena (Kennedy: 'a bucolic cor anglais theme') | B 14:40.3–14:52.5 | rekisterimittaus (analysis/rekisteri.py, B-puolen loppuura vertailuna): matala H2/E2 +25...33 dB koko ajan, keskikaista yksi linja 13-48 taajuutta, korkea lähes tyhjä 14:31-14:39 | lähde+analyysi |
| Käyrätorven ja viulun duetto: sankari ja kumppani yhdessä | B 19:12.2–19:56.8 | rekisterimittaus (analysis/rekisteri.py, B-puolen loppuura vertailuna): keskikaista A#4/D#4/G4 +38...48 dB ja korkea lähes tyhjä 18:58-19:10 ja 19:19-19:34; korkea C7/D7 19:11-19:16 ja 19:35-19:39 | analyysi |
| Vaskien viimeinen fanfaari | B 21:31.6–21:56.0 | jaksot 1273.5 +käyrätorvet, 1284.0 pp -> mf, 1289.5 mf -> ff; lyömäsoittimet sisään 1289.7 | lähde+analyysi |
<!-- /GEN:ankkurit -->

---

## Minuutti minuutilta

Lihavoidut ajat ovat uusia soittimia, sooloja, dom7-sointu ja taukoja. Dynamiikkarivi kertoo,
miten voimakkuus vaihtelee minuutin aikana aikajanan jaksoissa.

<!-- GEN:minuutit -->
### A-puoli

#### Sankari (Der Held): A 0:07.7–4:02.6

Eloisa, laaja sankariteema, joka ei pysähdy 116 tahtiin. Teeman aikana esitellään sankarin luonteenpiirteitä tiheänä kontrapunktina. Neljä aaltoa kasvaa yhä korkeammalle; jakso huipentuu dominanttiseptimisointuun ja yleistaukoon.

##### A 0:00–1:00 · Sankari

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **A 0:07.7** | soolo | Sankariteema alkaa matalalta: käyrätorvi, alttoviulut ja sellot yhdessä, kontrabassot alla; Es-duuri, harppoo ylös. Viulut ovat tauolla. | Sankari astuu esiin | lähde+analyysi |
| **A 0:17.9** | isku | Lyhyt f-sointuisku: kaikki kahdeksan käyrätorvea, fagotit, kontrafagotti ja kontrabassot (dreifach) teeman keskelle | Ensimmäinen isku pitkässä fraasissa: koko joukko vastaa sankarille | lähde+analyysi |
| **A 0:21.9** | isku | Sama f-sointuisku uudelleen | Toinen isku | lähde+analyysi |
| **A 0:23.4–0:24.0** | uusi soitin | Viulut tulevat ensimmäistä kertaa: kohotahti 23.1, teema tahdista 9 (23.6); samalla fagottien ja käyrätorvien isku | Teema nousee ylös | lähde+analyysi |
| **A 0:27.9** | isku | f-sointuisku: fagotit, kontrafagotti, käyrätorvet, kontrabassot | Kolmas isku | lähde+analyysi |
| **A 0:31.9–0:40.0** | uusi soitin | Trumpetti, pasuunat, bassotuuba ja patarummut tulevat ensimmäistä kertaa (mf, harjoitusnumero 1); kasvu ff:ään. Lautasia ei ole. | Ensimmäinen avautuminen: vasket ja patarummut liittyvät | lähde+analyysi |
| **A 0:40.0** | uusi soitin | Käyrätorvet ff matalalla teemassa sellojen ja kontrabassojen kanssa (ff); trumpetit p toistuvin soinnuin, tenori- ja bassotuuba f; I viulut tauolla | Intro päättyy, jotain uutta alkaa | **vahvistettu** |
| **A 0:46.4** | uusi soitin | I viulut palaavat nousevalla juoksutuksella (f) | I viulut palaavat johtamaan | lähde+analyysi |
| **A 0:48.5–0:56.6** | uusi soitin | Harjoitusnumero 2: puupuhaltimet (3 huilua, oboet, englannintorvi, klarinetit, fagotit) ja 2 harppua tulevat ENSIMMÄISTÄ KERTAA; huilut ja viulut nousevin juoksutuksin pp crescendo, harppujen arpeggiot mf, patarummun tremolo pp; lyyrinen vastateema H-duurissa | Sankarin mielikuvitus ja tunne: lyyrinen vastateema (Wikipedia) | lähde+analyysi |
| **A 0:56.6–1:06.5** | soolo | Englannintorvi, klarinetit ja oboet virtaavina kuvioina, käyrätorvet I-II laulavat; sellot pizz f; T27 viulut pizz f, alttoviulut ff | Puupuhallinten laulu | lähde+analyysi |

##### A 1:00–2:00 · Sankari

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| A 1:08.5–1:14.0 | tunnelma | pp: harput ja viulujen juoksutukset palaavat; T32 käyrätorvet, tenorituuba ja kontrafagotti 'espressivo' mf | Uusi kasvu alkaa hiljaa | lähde+analyysi |
| **A 1:14.0–1:19.9** | uusi soitin | Huilut ja koko käyrätorviryhmä f, harput arpeggioina; T36 ff | Nousu | lähde+analyysi |
| A 1:19.9–1:29.5 | tunnelma | Harjoitusnumero 4: p, uusi kasvu; T40-41 oboeiden, englannintorven ja viulujen sforzandot | Jännite kasvaa kohti ensimmäistä huippua | lähde+analyysi |
| A 1:29.5–1:38.9 | huippu | Crescendo ensimmäiseen huippuun: huilut ja oboet nousevat, koko orkesteri ff | Ensimmäinen huippu lähestyy | analyysi |
| A 1:35.4 | huippu | Harjoitusnumero 5: ff-sointu, käyrätorvi I nousee sankariarpeggion, sellot ja kontrabassot juoksevat ylös | Huippu saapuu | lähde+analyysi |
| **A 1:38.9** | huippu | ENSIMMÄINEN HUIPPU: teoksen siihen asti voimakkain kohta, massiivinen ja matala (voimakkuus 0.93, rekisteri 0.06) | Ensimmäinen huippu (käyttäjä: 1:37) | **vahvistettu** |
| **A 1:39.5–1:43.8** | soolo | Huilu ja englannintorvi pienin soolokuvioin (f); T48 klarinettisoolo nousevana juoksutuksena | Hengähdys: puupuhaltimet leikittelevät | lähde+analyysi |
| A 1:40.4–1:43.8 | tunnelma | Huipun jälkeen tunnelma vaihtuu: voimakkuus putoaa (0.62 -> 0.45), rekisteri nousee, huilu ja englannintorvi leikittelevät, klarinetti nousee | Myrsky laantuu kirkkaaksi ja keveäksi | analyysi |
| A 1:43.8–1:50.0 | tunnelma | Hiljainen, ilmeikäs jakso pp ('ausdrucksvoll'): huilu ja I viulut laulavat, harput pp, patarummun tremolo pp, kontrabassot pizz | Sankarin hellempi puoli | lähde+analyysi |
| **A 1:50.0–2:08.2** | soolo | Harjoitusnumero 6: puupuhallinten ja käyrätorvien mf-sointu; T53-56 käyrätorvet I-II laulavat 'ausdrucksvoll', alttoviulun soolo, klarinetti 'hervortretend' | Käyrätorvien laulu | lähde+analyysi |

##### A 2:00–3:00 · Sankari

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| A 2:08.2–2:23.0 | tunnelma | Harjoitusnumero 7 (T62): crescendo matalalta, käyrätorvet f marcato, sellot ja kontrabassot 'hervortretend'; T64 huilusoolo f | Voima kerääntyy alhaalta | lähde+analyysi |
| **A 2:23.0–2:36.8** | uusi soitin | Harjoitusnumero 8: ff-tutti, 8 käyrätorvea sankariteemassa, 2 Es-trumpettia, pasuunat, tenori- ja bassotuuba, kaikki jouset ff | Sankari täydessä voimassa | lähde+analyysi |
| **A 2:36.9–2:52.4** | isku | Harjoitusnumero 9: ff-tutti; sankariarpeggiot fagoteissa, bassoklarinetissa, kontrafagotissa, käyrätorvissa ja selloissa | Sankarin teema kaikkialla alhaalta ylös | lähde+analyysi |
| A 2:53.4–3:03.1 | huippu | Harjoitusnumero 10: fff-tutti, kaikki puupuhaltimet fff, jouset kolmijaettuina soinnuin, trumpetit ja pasuunat; ei patarumpuja | Huippu: koko orkesteri | lähde+analyysi **[tarkista]** |

##### A 3:00–4:00 · Sankari

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **A 3:03.1–3:21.8** | uusi soitin | Harjoitusnumero 11: ff, puupuhaltimet juoksutuksin, 2 harppua fff alas ja glissando, patarummun crescendo-tremolo | Puupuhaltimet ja harput ryöppyävät alaspäin, patarummut kasvattavat jännitettä | lähde+analyysi **[tarkista]** |
| A 3:21.8–3:33.6 | huippu | Harjoitusnumero 12: ff-tutti patarumpuineen; sankariarpeggiot matalissa soittimissa | – | lähde+analyysi **[tarkista]** |
| **A 3:36.4** | isku | Pidetty ff-sointu (patarummun tremolo) katkeaa 3:32.5, ja ff-kohotahti-isku lyö | Ensimmäinen kohtaloisku | lähde+analyysi |
| **A 3:40.3** | isku | Sama uudelleen: katko 3:36.3, isku | Toinen kohtaloisku | lähde+analyysi |
| **A 3:44.1** | isku | Katko 3:40.1, isku | Kolmas kohtaloisku | lähde+analyysi |
| **A 3:47.8** | isku | Katko 3:43.7, isku: vahvin kontrasti | Neljäs kohtaloisku: harjoitusnumero 13 (T110) alkaa | lähde+analyysi |
| **A 3:52.3–4:02.6** | huippu | Pasuunat ja tuubat fff, sitten pitkä dominanttiseptimisointu (Bb-D-F-As): T114 patarummun 'molto cresc.' -tremolo, T115 toistuvat soinnut, T116 sointu ja tauot | Jännite jää ilmaan | analyysi |

#### Vastustajat (Des Helden Widersacher): A 4:06.5–7:08.0

Hieman hitaammin. Kriitikot esittäytyvät korkeina, piikittelevinä puupuhaltimina ja matalina tuubina (Porter: 1 huilu, 2 oboe, 3 lautasisku, 4 englannintorven kromaattinen nousu, 5 Dehring = tuubat kvintteinä, 6 oboe, 7 englannintorvi vääristää sankariteeman, 8 fagotit, 9 sordinoidut pasuunat). Sankarin teema kuuluu ensin mollissa ja tummana; lopulta hän ajaa vastustajat pakoon.

##### A 4:00–5:00 · Sankari → Vastustajat

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **A 4:02.6** | tauko | Sointu katkeaa | Kaikki pysähtyy | analyysi |
| **A 4:02.6–4:06.5** | tauko | Yleistauko (T. 117), teoksen ainoa pitkä hiljaisuus | Jotain on tulossa | analyysi |
| **A 4:06.5** | uusi soitin | Huilu I 'sehr scharf und spitzig' yksin korkealla (F#6, D#6, C6...). Levyllä hyvin hiljainen: kokonaistaso vain noin 6 dB rahinan yläpuolella, joten tauko voi kuulostaa jatkuvan 4:10 asti | Arvostelija 1 aloittaa | analyysi |
| **A 4:09.5** | uusi soitin | Oboe 'schnarrend' (narisevasti) keskirekisterissä (C#5) | Arvostelija 2 mutisee | analyysi |
| **A 4:13.6** | uusi soitin | Tekstuuri tihenee: pikkuhuilu, englannintorven kromaattinen nousu; lautasten 'zischend' pp ei erotu rahinasta | Arvostelijat 3 ja 4 | lähde+analyysi **[tarkista]** |
| **A 4:15.6–4:22.3** | uusi soitin | Tenorituuba ja bassotuuba p matalalla (G3, Es3), pisteellinen rytmi | Dehring: 'Dok-tor Deh-ring' | analyysi |
| **A 4:22.7–4:25.7** | uusi soitin | Oboe ja Es-klarinetti 'sehr scharf und spitzig', korkealla | Arvostelija 6: kiihtynyt oboe | lähde+analyysi **[tarkista]** |
| **A 4:25.7–4:29.3** | uusi soitin | Englannintorvi ff ja 2 fagottia ff | Arvostelijat 7 ja 8: pilkka | lähde+analyysi **[tarkista]** |
| **A 4:29.3–4:38.7** | uusi soitin | 3 sordinoitua pasuunaa ff, sitten trilli p; tuubat (Dehring) taas p | Arvostelija 9: sordinoitujen pasuunojen terävä sointu (Porter) | lähde+analyysi |
| A 4:35.9–4:38.9 | huippu | Arvostelijat yhteen ääneen, mf, korkealla | Kuoro nalkuttaa | analyysi |
| A 4:48.9–4:56.7 | tunnelma | 4/4 'allmählich etwas fliessender': sankariteema mollissa; fagotit pp 'weich', bassoklarinetti, käyrätorvet V-VI ja SORDINOIDUT matalat jouset 'molto espressivo' | 'The Hero's theme goes dolefully into the minor' (Kennedy); sankari tummana | lähde+analyysi |
| **A 4:56.7–5:09.5** | uusi soitin | Harjoitusnumero 16: käyrätorvet V-VIII pp toistuvin soinnuin, alttoviulut sfz 'molto espr.' | Käyrätorvet hiljaa: sankari ei vielä vastaa | lähde+analyysi |

##### A 5:00–6:00 · Vastustajat

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| A 5:09.5–6:12.4 | tunnelma | Harjoitusnumero 17: I viulut sordinoituina G-kielellä 'mit Steigerung'; jouset kasvavat aaltoina mp -> mf | Sankari kerää itseään | lähde+analyysi **[tarkista]** |

##### A 6:00–7:00 · Vastustajat

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **A 6:12.4–6:25.9** | uusi soitin | Harjoitusnumero 19 'zurückhaltend, etwas langsamer': pikkuhuilu ja huilu ff, oboet, englannintorvi ja Es-klarinetti ff, tuubat p (Dehring), sordinoidut pasuunat fp | 'The critics renew their attacks' (Kennedy) | lähde+analyysi |
| **A 6:25.9–6:37.3** | uusi soitin | Harjoitusnumero 20 'Wieder etwas langsamer': oboet ja fagotit ff, kaikki 8 käyrätorvea 'espressivo', tuubat p (Dehring), lautaset 'zischend'; accelerando | Arvostelijat ja sankarin torvet vastakkain | lähde+analyysi |
| **A 6:30.1** | isku | Lautaset 'zischend' harjoitusnumerossa 20 | Lautaset suhisevat ('zischend'): vastustajien pilkka jatkuu | lähde+analyysi |
| **A 6:37.3–6:54.0** | uusi soitin | Jouset f; käyrätorvet tulevat 6:41.4 | Sankari nousee | analyysi |
| A 6:54.0–7:08.0 | huippu | Vasket ff (huippu 0.96) | Sankari ajaa vastustajat pakoon ja puhkeaa pieneen voitonhymniin | lähde+analyysi |

#### Kumppani (Des Helden Gefährtin): A 7:08.0–19:01.7

Sooloviulun pitkä säestetty kadenssi tarkkoine esitysohjeineen (teeskennelty kaipaus, kevytmielisyys, viha, hellyys...). Väliin orkesterin repliikkejä: sankari vastaa. Sitten Ges-duurinen rakkauskohtaus, sen jälkihehku ja arvostelijoiden mutina hiljaisuudessa.

##### A 7:00–8:00 · Vastustajat → Kumppani

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **A 7:08.0** | soolo | Sooloviulu, pp, harppu; tekstuuri ohut | Kumppani astuu esiin, hellä ensiesiintyminen | lähde+analyysi |
| **A 7:20.7–7:27.8** | uusi soitin | Orkesterin lyhyt vastaus: käyrätorvet ja patarumpu, mp | Sankari vastaa | analyysi |
| **A 7:27.8–7:58.2** | soolo | Viulu ja harppu, pp; matalat jouset vuorottelevat | Keskustelu | analyysi |
| A 7:58.2–8:05.8 | tunnelma | Sellot, bassot ja harppu mp (H-duuri) | Sankarin vastaus | analyysi |

##### A 8:00–9:00 · Kumppani

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **A 8:45.4–9:49.8** | soolo | Pitkät sooloviulujaksot pp; nopeampia kuvioita 8:44.5 | Mielialat vaihtuvat (teeskennelty kaipaus, iloisuus, kevytmielisyys, hellyys, sarkasmi) | lähde+analyysi |

##### A 9:00–10:00 · Kumppani

*(ei uusia tapahtumia: edellinen jatkuu)*

##### A 10:00–11:00 · Kumppani

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **A 10:13.6–10:30.3** | uusi soitin | Käyrätorvet ja bassot mf, B-duuri | Sankari vastaa painokkaasti | analyysi |
| **A 10:30.3–10:46.6** | soolo | Viulu kiihkeänä, nopeita kuvioita (3.2/s), p | Kumppani kiihtyy | analyysi |
| **A 10:46.6–11:03.3** | uusi soitin | Puupuhaltimet etualalla | Arvostelijoiden kaiku vai kumppanin pistely? | arvio **[tarkista]** |

##### A 11:00–12:00 · Kumppani

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **A 11:38.3–11:52.0** | uusi soitin | Käyrätorvet ja vasket kasvavat mf -> f | Sankari leimahtaa | analyysi |
| **A 11:52.0–12:07.7** | soolo | Viulu hyvin nopeana ja korkealla (5.2 ääntä/s) | Kumppani nauraa ja riehaantuu (partituurissa mm. 'beinahe doppelt so schnell (lustig)') | arvio **[tarkista]** |

##### A 12:00–13:00 · Kumppani

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| A 12:19.4–12:42.7 | tunnelma | Matalat jouset ja harppu, p | Sankarin hellä, rauhoittava fraasi? | arvio **[tarkista]** |
| **A 12:42.7–13:33.4** | soolo | Viulu ja harppu vuorottelevat orkesterin kanssa, p | Lähentyminen | analyysi |

##### A 13:00–14:00 · Kumppani

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| A 13:33.4–14:04.3 | tunnelma | Ges-duuri (Fis), cantabile, koko orkesteri f, harpun glissandot | Rakkauskohtaus alkaa: 'a voluptuously scored love-scene' (Wikipedia) | lähde+analyysi |

##### A 14:00–15:00 · Kumppani

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **A 14:04.3–14:49.5** | soolo | Harppu ja viulu hiljempaa (mp), sitten lämmin mf 14:06 | Kahden kesken | analyysi |
| A 14:49.5–14:59.1 | tunnelma | Hiljenee pp:hen, käyrätorvet hiljaa | Hetken hiljaisuus | analyysi |
| A 14:59.1–15:20.9 | tunnelma | Jouset ja harppu nousevat pp -> mf | – | analyysi |

##### A 15:00–16:00 · Kumppani

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **A 15:20.9–15:33.1** | uusi soitin | Puupuhaltimet ja matala vaski hiljaa kesken nousun (mf -> p) | Arvostelijat kolkuttelevat ovelle (Porter) | arvio **[tarkista]** |
| A 15:33.1–16:02.0 | huippu | Nousu p -> f, huippu noin 15:30 (0.75) | Rakkauden huippu; Porterin mukaan sankarin teema palaa | lähde+analyysi |

##### A 16:00–17:00 · Kumppani

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **A 16:02.0–16:15.7** | soolo | Käyrätorvet hiljaa, f -> mp, Fis/Ges-duuri | Sankari hellänä | analyysi |
| A 16:20.8–16:33.9 | tunnelma | Vielä yksi aalto mf | – | analyysi |
| A 16:33.9–18:11.7 | tunnelma | pp, käyrätorvet hiljaa (16:20, 16:45, 17:05, 17:14.5), harppu | Jälkihehku, yö | analyysi |

##### A 17:00–18:00 · Kumppani

*(ei uusia tapahtumia: edellinen jatkuu)*

##### A 18:00–19:00 · Kumppani

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **A 18:11.7–18:37.4** | uusi soitin | Puupuhaltimet pp | Arvostelijoiden katkelmat 'unisessa hiljaisuudessa' (Wikipedia de) | lähde+analyysi |
| **A 18:37.7–19:01.7** | tauko | Lähes hiljaisuus | Tyyntä myrskyn edellä | analyysi |

#### Taistelu (Des Helden Walstatt): A 19:01.7–B 4:41.6

Kehittely. Kaukaiset trumpetit kutsuvat, sitten lyömäsoittimet, 3/4 ja trumpettien taisteluhuudot; kaikki teemat kamppailevat. Harmoninen huippu kohti Ges-duuria ja es-mollia (Wikipedia). Puolenvaihto on kesken taistelun. **[tarkista jakson raja]**

##### A 19:00–20:00 · Kumppani → Taistelu

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **A 19:01.7–19:21.3** | uusi soitin | Kaukainen trumpettifanfaari, hiljaa ja korkealta (pp -> mp) | Kulissitrumpetit kutsuvat taisteluun; kaukana, horisontissa | lähde+analyysi |
| A 19:21.3–19:36.5 | tunnelma | Orkesteri vastaa f, sitten hiipuu | – | analyysi |
| **A 19:40.9–19:49.2** | uusi soitin | Trumpettikutsu uudelleen hiljaisuuden jälkeen | Toinen kutsu | analyysi |
| A 19:49.2 | tunnelma | Patarummut f; trumpetit ja virvelit 19:39.5; 3/4 | Taistelu alkaa (Wikipedia: lyömäsoittimet ja soolotrumpetti, ensimmäinen 3/4) | lähde+analyysi |
| **A 19:51.7** | uusi soitin | Patarummut mf -> f orkesterin purkauksessa toisen kulissikutsun jälkeen (Dover s. 230, harj. 44 jälkeen); tremolo seuraa | Taistelu alkaa: patarummut lyövät | lähde+analyysi |

##### A 20:00–21:00 · Taistelu

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| A 20:41.1 | tauko | A-puoli katkeaa kesken taistelun | – | analyysi |

### B-puoli

##### B 0:00–1:00 · Taistelu

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| B 0:13.8 | tunnelma | Taistelu jatkuu: lyömäsoittimet, virvelit, f | Toistaako B-puoli A:n viimeiset tahdit? | analyysi **[tarkista]** |
| **B 0:24.9–0:50.3** | uusi soitin | Trumpettien ja käyrätorvien taisteluhuudot, virvelit; ff 0:32.4 | Hyökkäys | analyysi |
| B 0:50.3–1:01.1 | tunnelma | Jouset ja viulut mf, lyömäsoittimet pois | Kumppani rinnalla taistelussa (Wikipedia de: viulut 'suloisin melodioin') | lähde+analyysi |

##### B 1:00–2:00 · Taistelu

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **B 1:01.1–1:24.9** | uusi soitin | Trumpetit, virvelit ja patarummut palaavat, ff 1:07.9 | – | analyysi |
| B 1:24.9–1:40.1 | tunnelma | Tutti ff, liike tihenee; Es- ja As-duuri vilahtavat | Sankarin teema taistelee | arvio **[tarkista]** |

##### B 2:00–3:00 · Taistelu

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| B 2:09.2–2:54.3 | huippu | Taistelun kiihkein jakso ff (0.95), fanfaarit ja virvelit; Fis/Ges 2:10, b-molli 2:15 | Kaaos, kaikki teemat vastakkain (Wikipedia: huippu kohti Ges-duuria ja es-mollia) | lähde+analyysi |
| B 2:54.3–3:04.8 | tunnelma | Jouset f (c-molli), lyömäsoittimet pois | Hetken hengähdys | analyysi |

##### B 3:00–4:00 · Taistelu

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| B 3:36.0–4:00.9 | huippu | Uusi rynnäkkö ff, huippu 0.92 (3:47), F-duuri | Ratkaisu lähenee | analyysi |

#### Taistelu: kertaus (Des Helden Walstatt: kertaus): B 4:41.6–7:18.6

Sankariteema palaa riemukkaana 4/4:ssä toistuvien kahdeksasosien päällä (Wikipedia); kumppanin teema mukana; uusi cantabile-teema trumpetissa johtaa rauhantöihin. **[tarkista jakson raja]**

##### B 4:00–5:00 · Taistelu → Taistelu: kertaus

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| B 4:16.3–4:22.3 | tunnelma | Äkillinen katko: ff -> hiljaa -> ff (4:15.7-4:17.0) | Ratkaiseva isku? | analyysi **[tarkista]** |
| **B 4:41.6–4:49.1** | uusi soitin | Käyrätorvet ja trumpetit ff, Es-duuri, liike harvenee | Kertaus: sankariteema palaa, voitto | lähde+analyysi **[tarkista]** |
| B 4:49.1–5:41.3 | huippu | Riemukas Es-duuri koko orkesterilla, toistuvat kahdeksasosat (liike 6.5/s), ff | Riemuvoitto: sankariteema koko orkesterissa | lähde+analyysi |

##### B 5:00–6:00 · Taistelu: kertaus

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **B 5:49.8–6:22.9** | uusi soitin | Viulut ja jouset f, Fis/Ges | Kumppani voittajana sankarin rinnalla | analyysi |

##### B 6:00–7:00 · Taistelu: kertaus

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **B 6:22.9–6:38.9** | uusi soitin | Käyrätorvet ja trumpetit ff | – | analyysi |
| B 6:38.9–7:18.6 | tunnelma | Moduloiva nousu (A-D-G-H-E), ff -> mf 7:02.5 | Uusi cantabile-teema trumpetissa ja sen kehittely johtaa rauhantöihin (Wikipedia) | arvio **[tarkista]** |

#### Rauhantyöt (Des Helden Friedenswerke): B 7:18.6–12:31.5

Sankari muistelee luomistyötään: noin 30 lainausta Straussin aiemmista teoksista (Wikipedia: Guntram 8, Don Quixote 5, Don Juan 4, Tod und Verklärung 4, Macbeth 3, Zarathustra 3, Till 1, laulut). Porterin järjestys: Don Juan vs Zarathustra, Tod und Verklärung, Don Quixote, Don Juan, Till, Guntram ja Macbeth, Traum durch die Dämmerung tenorituuballa. Lainausten tarkkoja kohtia ei tunnisteta äänestä. **[tarkista jakson raja]**

##### B 7:00–8:00 · Taistelu: kertaus → Rauhantyöt

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| B 7:18.6–7:26.8 | tunnelma | Lähes hiljaista; käyrätorvet hiljaa | Taistelu on ohi; uusi aihe (Wikipedia: nopea laskeva Es-kolmisointu)? | arvio **[tarkista]** |
| **B 7:26.8–8:36.2** | soolo | Harppu hallitsee (pp-p); matalat jouset 7:36.5, puupuhallin 7:40.7, harppu 7:53 ja 8:12.5 | Elegia: harppu, fagotti, englannintorvi, jouset (Wikipedia); muistelu alkaa | lähde+analyysi |

##### B 8:00–9:00 · Rauhantyöt

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **B 8:36.2–9:13.8** | soolo | Puupuhaltimet johtavat korkealla (rekisteri 0.81-0.88), jouset 8:48 | Lainauksia (mitkä?) | arvio **[tarkista]** |

##### B 9:00–10:00 · Rauhantyöt

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **B 9:13.8–10:17.1** | soolo | Puupuhaltimet ja käyrätorvet (p), käyrätorvisoolo 9:23, käyrätorvet johtavat mp-mf 10:08 asti | Ehdokas Don Juanin käyrätorviteemalle | arvio **[tarkista]** |

##### B 10:00–11:00 · Rauhantyöt

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| B 10:17.1–11:31.2 | tunnelma | f, viulut 10:24; voima kasvaa, sävellaji liikkuu (Fis 10:35-11:00) | Straussin aiemmat teokset seuraavat toisiaan ja kietoutuvat yhteen | analyysi |

##### B 11:00–12:00 · Rauhantyöt

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| B 11:31.2–12:22.9 | huippu | Huiput 11:21.5 ja 11:36.5, kummankin jälkeen pitkä hiipuminen | Rauhantöiden huipennus | analyysi |

#### Pako maailmasta ja täyttymys (Des Helden Weltflucht und Vollendung): B 12:31.5–22:10.2

Järjestys (Wikipedia, Porter): arvostelijamotiivi tuo agitaton, Dehring keskeyttää ja sankari ajaa hänet pois, kumppani lohduttaa, englannintorven pastoraali, Es-duurin rauhan teema, suuri nousu, viulun ja käyrätorven duetto, vaskien viimeinen fanfaari ja seesteinen Es-duuri. **[tarkista jakson raja]**

##### B 12:00–13:00 · Rauhantyöt → Pako maailmasta ja täyttymys

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **B 12:20.4–12:24.4** | soolo | Lähes hiljaisuuden jälkeen pehmeä matala/keskirekisterin sisääntulo (G3, D4) | Ehdokas: Traum durch die Dämmerung tenorituuballa ('tunnelma lukittuu') | arvio **[tarkista]** |
| **B 12:22.9–12:31.5** | tauko | Hiljaisuus | Jaksojen raja | analyysi |
| **B 12:31.5–12:45.7** | soolo | Harppu pp; viulu p 12:28 | – | analyysi |
| B 12:45.7–13:13.1 | tunnelma | Jouset f, korkealla, kiihkeästi; äkillisiä katkoja 12:38 | Agitato: arvostelijamotiivi palaa ja sankari kiihtyy (Wikipedia) | lähde+analyysi |

##### B 13:00–14:00 · Pako maailmasta ja täyttymys

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **B 13:26.3** | uusi soitin | Agitato katkeaa äkkiä 13:13.5, hiljaisuus; ensimmäinen lyhyt väliintulo 13:15 | Dehringin 1. keskeytys? | arvio **[tarkista]** |
| **B 13:28.3** | uusi soitin | Toinen lyhyt väliintulo 13:17 hiljaisuuden jälkeen | Dehringin 2. keskeytys? | arvio **[tarkista]** |
| **B 13:32.4–13:50.6** | uusi soitin | Käyrätorvet ja vasket mf; patarumpu 13:30 | Sankari ajaa Dehringin lopullisesti pois | arvio **[tarkista]** |
| **B 13:50.6–14:00.3** | soolo | Sooloviulu p | Kumppani lohduttaa | analyysi |

##### B 14:00–15:00 · Pako maailmasta ja täyttymys

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **B 14:17.5–14:36.8** | tauko | Lähes hiljaisuus | – | analyysi |
| **B 14:40.3–14:52.5** | soolo | Yksi hiljainen keskirekisterin linja (G4-A4-G5) matalan pitkän pedaalin (H2, E2) päällä; korkea rekisteri liittyy 14:40 | Englannintorven pastoraali: sankariteema maalaisena (Kennedy: 'a bucolic cor anglais theme'); vastustajana teeman vääristänyt soitin sovittaa sen | lähde+analyysi |

##### B 15:00–16:00 · Pako maailmasta ja täyttymys

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| B 15:16.1–15:50.8 | tunnelma | Käyrätorvet ja harppu p, B-duuri | Sankariteema lempeänä | analyysi |
| **B 15:50.8–16:21.3** | soolo | Viulu p, Es- ja As-duuri | Es-duurin rauhan teema: laskeva kolmisointu hitaana cantabilena (aavistettiin viulukadenssissa) | lähde+analyysi **[tarkista]** |

##### B 16:00–17:00 · Pako maailmasta ja täyttymys

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| B 16:21.3–16:45.6 | tunnelma | Nousu p -> mf, korkealla | – | analyysi |
| B 16:45.6–17:05.4 | huippu | Käyrätorvet kasvavat, suuri huippu f (0.93) 16:43.5 | Täyttymyksen suuri nousu | analyysi |

##### B 17:00–18:00 · Pako maailmasta ja täyttymys

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| B 17:05.4–17:59.6 | tunnelma | Patarummut johtavat; viimeinen kuohu f (0.86) 17:33 | Muisto taistelusta? | arvio **[tarkista]** |
| **B 17:59.6–18:34.1** | soolo | Äkillinen hiljaisuus: sooloviulu ja jouset pp, korkealla | Kumppani; sankari vetäytyy maailmasta | analyysi |

##### B 18:00–19:00 · Pako maailmasta ja täyttymys

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| B 18:34.1–19:12.2 | tunnelma | Matalat jouset, mp -> f (18:47.5), Es-duuri | Täyttymys kasvaa | analyysi |

##### B 19:00–20:00 · Pako maailmasta ja täyttymys

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **B 19:12.2–19:56.8** | soolo | Käyrätorvi (keskirekisteri) ja viulu (korkea) vuorottelevat: käyrätorvi 18:56-19:10, viulu 19:11-19:16, käyrätorvi 19:17-19:34, viulu 19:35 | Käyrätorven ja viulun duetto: sankari ja kumppani yhdessä | analyysi |

##### B 20:00–21:00 · Pako maailmasta ja täyttymys

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **B 20:19.1–20:56.6** | uusi soitin | Matalat jouset ja harppu mp; puupuhaltimet ja viulu korkealla 20:08; käyrätorvi 20:34 | Viimeiset muistot | analyysi |
| B 20:56.6–21:31.6 | tauko | Lähes hiljaisuus, sointu kantaa (Es-duuri) | – | analyysi |

##### B 21:00–22:00 · Pako maailmasta ja täyttymys

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| B 21:31.6–21:56.0 | huippu | Vasket tulevat pp 21:13.5, kasvavat mf 21:24 ja ff 21:29.5, patarumpu | Vaskien viimeinen fanfaari; sankarin viimeinen tervehdys | lähde+analyysi |
| B 21:56.0–22:10.2 | tunnelma | Es-duurinen loppusointu vaskissa, ff -> mp, hiipuu | Täyttymys, seesteisyys | analyysi |

##### B 22:00–23:00 · Pako maailmasta ja täyttymys

*(ei uusia tapahtumia: edellinen jatkuu)*
<!-- /GEN:minuutit -->

---

## Tarkistettavat kohdat (korvalla)

<!-- GEN:tarkista -->
- **A 2:53.4–3:03.1** Harjoitusnumero 10: fff-tutti, kaikki puupuhaltimet fff, jouset kolmijaettuina soinnuin, trumpetit ja pasuunat; ei patarumpuja: Huippu: koko orkesteri
- **A 3:03.1–3:21.8** Harjoitusnumero 11: ff, puupuhaltimet juoksutuksin, 2 harppua fff alas ja glissando, patarummun crescendo-tremolo: Puupuhaltimet ja harput ryöppyävät alaspäin, patarummut kasvattavat jännitettä
- **A 3:21.8–3:33.6** Harjoitusnumero 12: ff-tutti patarumpuineen; sankariarpeggiot matalissa soittimissa: tarkista
- **A 4:13.6** Tekstuuri tihenee: pikkuhuilu, englannintorven kromaattinen nousu; lautasten 'zischend' pp ei erotu rahinasta: Arvostelijat 3 ja 4
- **A 4:22.7–4:25.7** Oboe ja Es-klarinetti 'sehr scharf und spitzig', korkealla: Arvostelija 6: kiihtynyt oboe
- **A 4:25.7–4:29.3** Englannintorvi ff ja 2 fagottia ff: Arvostelijat 7 ja 8: pilkka
- **A 5:09.5–6:12.4** Harjoitusnumero 17: I viulut sordinoituina G-kielellä 'mit Steigerung'; jouset kasvavat aaltoina mp -> mf: Sankari kerää itseään
- **A 10:46.6–11:03.3** Puupuhaltimet etualalla: Arvostelijoiden kaiku vai kumppanin pistely?
- **A 11:52.0–12:07.7** Viulu hyvin nopeana ja korkealla (5.2 ääntä/s): Kumppani nauraa ja riehaantuu (partituurissa mm. 'beinahe doppelt so schnell (lustig)')
- **A 12:19.4–12:42.7** Matalat jouset ja harppu, p: Sankarin hellä, rauhoittava fraasi?
- **A 15:20.9–15:33.1** Puupuhaltimet ja matala vaski hiljaa kesken nousun (mf -> p): Arvostelijat kolkuttelevat ovelle (Porter)
- **B 0:13.8** Taistelu jatkuu: lyömäsoittimet, virvelit, f: Toistaako B-puoli A:n viimeiset tahdit?
- **B 1:24.9–1:40.1** Tutti ff, liike tihenee; Es- ja As-duuri vilahtavat: Sankarin teema taistelee
- **B 4:16.3–4:22.3** Äkillinen katko: ff -> hiljaa -> ff (4:15.7-4:17.0): Ratkaiseva isku?
- **B 4:41.6–4:49.1** Käyrätorvet ja trumpetit ff, Es-duuri, liike harvenee: Kertaus: sankariteema palaa, voitto
- **B 6:38.9–7:18.6** Moduloiva nousu (A-D-G-H-E), ff -> mf 7:02.5: Uusi cantabile-teema trumpetissa ja sen kehittely johtaa rauhantöihin (Wikipedia)
- **B 7:18.6–7:26.8** Lähes hiljaista; käyrätorvet hiljaa: Taistelu on ohi; uusi aihe (Wikipedia: nopea laskeva Es-kolmisointu)?
- **B 8:36.2–9:13.8** Puupuhaltimet johtavat korkealla (rekisteri 0.81-0.88), jouset 8:48: Lainauksia (mitkä?)
- **B 9:13.8–10:17.1** Puupuhaltimet ja käyrätorvet (p), käyrätorvisoolo 9:23, käyrätorvet johtavat mp-mf 10:08 asti: Ehdokas Don Juanin käyrätorviteemalle
- **B 12:20.4–12:24.4** Lähes hiljaisuuden jälkeen pehmeä matala/keskirekisterin sisääntulo (G3, D4): Ehdokas: Traum durch die Dämmerung tenorituuballa ('tunnelma lukittuu')
- **B 13:26.3** Agitato katkeaa äkkiä 13:13.5, hiljaisuus; ensimmäinen lyhyt väliintulo 13:15: Dehringin 1. keskeytys?
- **B 13:28.3** Toinen lyhyt väliintulo 13:17 hiljaisuuden jälkeen: Dehringin 2. keskeytys?
- **B 13:32.4–13:50.6** Käyrätorvet ja vasket mf; patarumpu 13:30: Sankari ajaa Dehringin lopullisesti pois
- **B 15:50.8–16:21.3** Viulu p, Es- ja As-duuri: Es-duurin rauhan teema: laskeva kolmisointu hitaana cantabilena (aavistettiin viulukadenssissa)
- **B 17:05.4–17:59.6** Patarummut johtavat; viimeinen kuohu f (0.86) 17:33: Muisto taistelusta?
- Jakson raja: **Taistelu** alkaa A 19:01.7 (kulissitrumpetit 1125.7 (Wikipedia en: Walstattin alku; de: Gefährtinin loppu); kertaus B 277.7)
- Jakson raja: **Taistelu: kertaus** alkaa B 4:41.6 (käyrätorvet ja trumpetit ff 277.7, tiheä tutti 285.0)
- Jakson raja: **Rauhantyöt** alkaa B 7:18.6 (ff -> pp 432.5; lähes hiljaisuus 732.5-741.0)
- Jakson raja: **Pako maailmasta ja täyttymys** alkaa B 12:31.5 (harppu hiljaisuuden jälkeen 741.0, agitato 755.0; musiikki loppuu 1311.5)
<!-- /GEN:tarkista -->
