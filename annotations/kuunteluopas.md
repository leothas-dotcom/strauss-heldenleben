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
| Sankari astuu esiin | A 0:07.6 | musiikin alku +12 dB/s 7.6; partituuri s. 3-4 (tahdit 1-20) ja tahtiruudukko (T1 7.62, T6 17.64, T8 21.62, T9 23.62, T11 27.50, T13 31.42, T17 39.44, T20 45.74) | lähde+analyysi |
| Intro päättyy, jotain uutta alkaa | A 0:39.4 | käyttäjä: '0:00-0:40 intro, sitten uusi asia' (korvalla 29.10.); jaksoraja ja nuotinalku 39.4; partituuri s. 3-4 (tahdit 1-20) ja tahtiruudukko (T1 7.62, T6 17.64, T8 21.62, T9 23.62, T11 27.50, T13 31.42, T17 39.44, T20 45.74) | **vahvistettu** |
| Ensimmäinen huippu lähestyy | A 1:28.2–1:37.5 | jakso 88.2-94.1 ff, rekisteri 0.72, max 0.91; partituuri T42-44 crescendo | analyysi |
| Jännite jää ilmaan | A 3:49.0–3:59.2 | partituuri s. 22 (T. 112); kroma Bb7 3:49-3:58.5 (osuvuus 0.55); jakso 223.7 ff crescendo 0.72 -> 0.94 | analyysi |
| Jotain on tulossa | A 3:59.2–4:03.0 | kohinan yli 12 dB: 0-35/500 taajuutta 3:59.5-4:02.5 (spektri alkuperäisestä FLACista verrattuna levyn kohinaan (sisäänajoura), 30.10.2026); alin taso -49 dB 4:00.5-4:01.0 | analyysi |
| Arvostelija 1 aloittaa | A 4:03.0 | korkea kaista (1-3.5 kHz) 76/500 taajuutta kohinan yli 4:03, keski- ja matala kaista tyhjiä (spektri alkuperäisestä FLACista verrattuna levyn kohinaan (sisäänajoura), 30.10.2026); isku 243.10 (ensimmäinen sävel tauon jälkeen) | analyysi |
| 'The Hero's theme goes dolefully into the minor' (Kennedy) | A 4:44.9–4:52.5 | partituuri s. 25 (T. 140); jaksoraja 284.9: liike 6.3 -> 0.5/s, rekisteri laskee, g-molli 0.88; puupuhaltimet ulos 285.2 | lähde+analyysi |
| Kumppani astuu esiin, hellä ensiesiintyminen | A 7:02.0 | jaksoraja 422.0: dynamiikka f -> pp, +harppu, viulut | lähde+analyysi |
| Rakkauskohtaus alkaa: 'a voluptuously scored love-scene' (Wikipedia) | A 13:22.0–13:52.5 | jaksoraja 802.0 p -> f, +12 dB/s 802.5; Fis/Ges-duuri 0.85 13:30 | lähde+analyysi |
| Kulissitrumpetit kutsuvat taisteluun | A 18:45.7–19:05.0 | puupuhaltimet ja vasket sisään 1125.7-1126.0 lähes hiljaisuuden jälkeen; jaksoraja 1127.0 +käyrätorvet +trumpetit, rekisteri nousee 0.82 | lähde+analyysi |
| Taistelu alkaa (Wikipedia: lyömäsoittimet ja soolotrumpetti, ensimmäinen 3/4) | A 19:32.5 | jaksoraja 1172.5 mp -> f, patarummut; 1179.5 +trumpetit +virveli | lähde+analyysi |
| Kertaus: sankariteema palaa, voitto | B 4:37.7–4:45.0 | vasket sisään 277.5; jaksoraja 277.7 +käyrätorvet +trumpetit, liike 5.4 -> 1.9/s | lähde+analyysi **[tarkista]** |
| Taistelu on ohi | B 7:12.5–7:20.5 | jaksoraja 432.5 mf -> pp, +käyrätorvet; vasket sisään 436.4 | arvio **[tarkista]** |
| Agitato: arvostelijamotiivi palaa ja sankari kiihtyy (Wikipedia) | B 12:35.0–13:02.0 | jaksoraja 755.0 pp -> f, rekisteri nousee; es-molli | lähde+analyysi |
| Englannintorven pastoraali: sankariteema maalaisena (Kennedy: 'a bucolic cor anglais theme') | B 14:28.0–14:40.0 | rekisterimittaus (analysis/rekisteri.py, B-puolen loppuura vertailuna): matala H2/E2 +25...33 dB koko ajan, keskikaista yksi linja 13-48 taajuutta, korkea lähes tyhjä 14:31-14:39 | lähde+analyysi |
| Käyrätorven ja viulun duetto: sankari ja kumppani yhdessä | B 18:56.0–19:40.0 | rekisterimittaus (analysis/rekisteri.py, B-puolen loppuura vertailuna): keskikaista A#4/D#4/G4 +38...48 dB ja korkea lähes tyhjä 18:58-19:10 ja 19:19-19:34; korkea C7/D7 19:11-19:16 ja 19:35-19:39 | analyysi |
| Vaskien viimeinen fanfaari | B 21:13.5–21:37.5 | jaksot 1273.5 +käyrätorvet, 1284.0 pp -> mf, 1289.5 mf -> ff; lyömäsoittimet sisään 1289.7 | lähde+analyysi |
<!-- /GEN:ankkurit -->

---

## Minuutti minuutilta

Lihavoidut ajat ovat uusia soittimia, sooloja, dom7-sointu ja taukoja. Dynamiikkarivi kertoo,
miten voimakkuus vaihtelee minuutin aikana aikajanan jaksoissa.

<!-- GEN:minuutit -->
### A-puoli

#### Sankari (Der Held): A 0:07.6–3:59.2

Eloisa, laaja sankariteema, joka ei pysähdy 116 tahtiin. Teeman aikana esitellään sankarin luonteenpiirteitä tiheänä kontrapunktina. Neljä aaltoa kasvaa yhä korkeammalle; jakso huipentuu dominanttiseptimisointuun ja yleistaukoon.

##### A 0:00–1:00 · Sankari

Dynamiikka: mf → f → ff → f → mf (voimakkain jakso alkaa 0:31.4, huippu 0.92)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **A 0:07.6** | soolo | Sankariteema alkaa matalalta: käyrätorvi, alttoviulut ja sellot yhdessä, kontrabassot alla; Es-duuri, harppoo ylös. Viulut ovat tauolla. | Sankari astuu esiin | lähde+analyysi |
| **A 0:17.6** | isku | Lyhyt f-sointuisku: kaikki kahdeksan käyrätorvea, fagotit, kontrafagotti ja kontrabassot (dreifach) teeman keskelle | Ensimmäinen isku pitkässä fraasissa: koko joukko vastaa sankarille | lähde+analyysi |
| **A 0:21.6** | isku | Sama f-sointuisku uudelleen | Toinen isku | lähde+analyysi |
| **A 0:23.1–0:23.6** | uusi soitin | Viulut tulevat ensimmäistä kertaa: kohotahti 23.1, teema tahdista 9 (23.6); samalla fagottien ja käyrätorvien isku | Teema nousee ylös | lähde+analyysi |
| **A 0:27.5** | isku | f-sointuisku: fagotit, kontrafagotti, käyrätorvet, kontrabassot | Kolmas isku | lähde+analyysi |
| **A 0:31.4–0:39.4** | uusi soitin | Trumpetti, pasuunat, bassotuuba ja patarummut tulevat ensimmäistä kertaa (mf, harjoitusnumero 1); kasvu ff:ään. Lautasia ei ole. | Ensimmäinen avautuminen: vasket ja patarummut liittyvät | lähde+analyysi |
| **A 0:39.4** | uusi soitin | Käyrätorvet ff matalalla teemassa sellojen ja kontrabassojen kanssa (ff); trumpetit p toistuvin soinnuin, tenori- ja bassotuuba f; I viulut tauolla | Intro päättyy, jotain uutta alkaa | **vahvistettu** |
| **A 0:45.7** | uusi soitin | I viulut palaavat nousevalla juoksutuksella (f) | I viulut palaavat johtamaan | lähde+analyysi |
| **A 0:47.8–0:55.8** | uusi soitin | Harjoitusnumero 2: puupuhaltimet (3 huilua, oboet, englannintorvi, klarinetit, fagotit) ja 2 harppua tulevat ENSIMMÄISTÄ KERTAA; huilut ja viulut nousevin juoksutuksin pp crescendo, harppujen arpeggiot mf, patarummun tremolo pp; lyyrinen vastateema H-duurissa | Sankarin mielikuvitus ja tunne: lyyrinen vastateema (Wikipedia) | lähde+analyysi |
| **A 0:55.8–1:05.6** | soolo | Englannintorvi, klarinetit ja oboet virtaavina kuvioina, käyrätorvet I-II laulavat; sellot pizz f; T27 viulut pizz f, alttoviulut ff | Puupuhallinten laulu | lähde+analyysi |

##### A 1:00–2:00 · Sankari

Dynamiikka: mf → f → ff → f → mf (voimakkain jakso alkaa 1:28.2, huippu 0.91)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| A 1:07.5–1:13.0 | tunnelma | pp: harput ja viulujen juoksutukset palaavat; T32 käyrätorvet, tenorituuba ja kontrafagotti 'espressivo' mf | Uusi kasvu alkaa hiljaa | lähde+analyysi |
| **A 1:13.0–1:18.8** | uusi soitin | Huilut ja koko käyrätorviryhmä f, harput arpeggioina; T36 ff | Nousu | lähde+analyysi |
| A 1:18.8–1:28.2 | tunnelma | Harjoitusnumero 4: p, uusi kasvu; T40-41 oboeiden, englannintorven ja viulujen sforzandot | Jännite kasvaa kohti ensimmäistä huippua | lähde+analyysi |
| A 1:28.2–1:37.5 | huippu | Crescendo ensimmäiseen huippuun: huilut ja oboet nousevat, koko orkesteri ff | Ensimmäinen huippu lähestyy | analyysi |
| A 1:34.1 | huippu | Harjoitusnumero 5: ff-sointu, käyrätorvi I nousee sankariarpeggion, sellot ja kontrabassot juoksevat ylös | Huippu saapuu | lähde+analyysi |
| **A 1:37.5** | huippu | ENSIMMÄINEN HUIPPU: teoksen siihen asti voimakkain kohta, massiivinen ja matala (voimakkuus 0.93, rekisteri 0.06) | Ensimmäinen huippu (käyttäjä: 1:37) | **vahvistettu** |
| **A 1:38.1–1:42.3** | soolo | Huilu ja englannintorvi pienin soolokuvioin (f); T48 klarinettisoolo nousevana juoksutuksena | Hengähdys: puupuhaltimet leikittelevät | lähde+analyysi |
| A 1:39.0–1:42.3 | tunnelma | Huipun jälkeen tunnelma vaihtuu: voimakkuus putoaa (0.62 -> 0.45), rekisteri nousee, huilu ja englannintorvi leikittelevät, klarinetti nousee | Myrsky laantuu kirkkaaksi ja keveäksi | analyysi |
| A 1:42.3–1:48.5 | tunnelma | Hiljainen, ilmeikäs jakso pp ('ausdrucksvoll'): huilu ja I viulut laulavat, harput pp, patarummun tremolo pp, kontrabassot pizz | Sankarin hellempi puoli | lähde+analyysi |
| **A 1:48.5–2:06.4** | soolo | Harjoitusnumero 6: puupuhallinten ja käyrätorvien mf-sointu; T53-56 käyrätorvet I-II laulavat 'ausdrucksvoll', alttoviulun soolo, klarinetti 'hervortretend' | Käyrätorvien laulu | lähde+analyysi |

##### A 2:00–3:00 · Sankari

Dynamiikka: mf → f → ff → f → ff (voimakkain jakso alkaa 2:30.9, huippu 0.97)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| A 2:06.4–2:21.0 | tunnelma | Harjoitusnumero 7 (T62): crescendo matalalta, käyrätorvet f marcato, sellot ja kontrabassot 'hervortretend'; T64 huilusoolo f | Voima kerääntyy alhaalta | lähde+analyysi |
| **A 2:21.0–2:34.6** | uusi soitin | Harjoitusnumero 8: ff-tutti, 8 käyrätorvea sankariteemassa, 2 Es-trumpettia, pasuunat, tenori- ja bassotuuba, kaikki jouset ff | Sankari täydessä voimassa | lähde+analyysi |
| **A 2:34.7–2:50.0** | isku | Harjoitusnumero 9: ff-tutti; sankariarpeggiot fagoteissa, bassoklarinetissa, kontrafagotissa, käyrätorvissa ja selloissa | Sankarin teema kaikkialla alhaalta ylös | lähde+analyysi |
| A 2:51.0–3:00.5 | huippu | Harjoitusnumero 10: fff-tutti, kaikki puupuhaltimet fff, jouset kolmijaettuina soinnuin, trumpetit ja pasuunat; ei patarumpuja | Huippu: koko orkesteri | lähde+analyysi **[tarkista]** |

##### A 3:00–4:00 · Sankari

Dynamiikka: ff → f → ff → p (voimakkain jakso alkaa 3:00.5, huippu 1.00)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **A 3:00.5–3:19.0** | uusi soitin | Harjoitusnumero 11: ff, puupuhaltimet juoksutuksin, 2 harppua fff alas ja glissando, patarummun crescendo-tremolo | Puupuhaltimet ja harput ryöppyävät alaspäin, patarummut kasvattavat jännitettä | lähde+analyysi **[tarkista]** |
| A 3:19.0–3:30.6 | huippu | Harjoitusnumero 12: ff-tutti patarumpuineen; sankariarpeggiot matalissa soittimissa | – | lähde+analyysi **[tarkista]** |
| **A 3:33.4** | isku | Pidetty ff-sointu (patarummun tremolo) katkeaa 3:32.5, ja ff-kohotahti-isku lyö | Ensimmäinen kohtaloisku | lähde+analyysi |
| **A 3:37.3** | isku | Sama uudelleen: katko 3:36.3, isku | Toinen kohtaloisku | lähde+analyysi |
| **A 3:40.9** | isku | Katko 3:40.1, isku | Kolmas kohtaloisku | lähde+analyysi |
| **A 3:44.6** | isku | Katko 3:43.7, isku: vahvin kontrasti | Neljäs kohtaloisku: harjoitusnumero 13 (T110) alkaa | lähde+analyysi |
| **A 3:49.0–3:59.2** | huippu | Pasuunat ja tuubat fff, sitten pitkä dominanttiseptimisointu (Bb-D-F-As): T114 patarummun 'molto cresc.' -tremolo, T115 toistuvat soinnut, T116 sointu ja tauot | Jännite jää ilmaan | analyysi |
| **A 3:59.2** | tauko | Sointu katkeaa | Kaikki pysähtyy | analyysi |
| **A 3:59.2–4:03.0** | tauko | Yleistauko (T. 117), teoksen ainoa pitkä hiljaisuus | Jotain on tulossa | analyysi |

#### Vastustajat (Des Helden Widersacher): A 4:03.0–7:02.0

Hieman hitaammin. Kriitikot esittäytyvät korkeina, piikittelevinä puupuhaltimina ja matalina tuubina (Porter: 1 huilu, 2 oboe, 3 lautasisku, 4 englannintorven kromaattinen nousu, 5 Dehring = tuubat kvintteinä, 6 oboe, 7 englannintorvi vääristää sankariteeman, 8 fagotit, 9 sordinoidut pasuunat). Sankarin teema kuuluu ensin mollissa ja tummana; lopulta hän ajaa vastustajat pakoon.

##### A 4:00–5:00 · Vastustajat

Dynamiikka: p → mp (voimakkain jakso alkaa 4:00.0, huippu 0.69)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **A 4:03.0** | uusi soitin | Huilu I 'sehr scharf und spitzig' yksin korkealla (F#6, D#6, C6...). Levyllä hyvin hiljainen: kokonaistaso vain noin 6 dB rahinan yläpuolella, joten tauko voi kuulostaa jatkuvan 4:10 asti | Arvostelija 1 aloittaa | analyysi |
| **A 4:06.0** | uusi soitin | Oboe 'schnarrend' (narisevasti) keskirekisterissä (C#5) | Arvostelija 2 mutisee | analyysi |
| **A 4:10.0** | uusi soitin | Tekstuuri tihenee: pikkuhuilu, englannintorven kromaattinen nousu; lautasten 'zischend' pp ei erotu rahinasta | Arvostelijat 3 ja 4 | lähde+analyysi **[tarkista]** |
| **A 4:12.0–4:18.6** | uusi soitin | Tenorituuba ja bassotuuba p matalalla (G3, Es3), pisteellinen rytmi | Dehring: 'Dok-tor Deh-ring' | analyysi |
| **A 4:19.0–4:22.0** | uusi soitin | Oboe ja Es-klarinetti 'sehr scharf und spitzig', korkealla | Arvostelija 6: kiihtynyt oboe | lähde+analyysi **[tarkista]** |
| **A 4:22.0–4:25.5** | uusi soitin | Englannintorvi ff ja 2 fagottia ff | Arvostelijat 7 ja 8: pilkka | lähde+analyysi **[tarkista]** |
| **A 4:25.5–4:34.8** | uusi soitin | 3 sordinoitua pasuunaa ff, sitten trilli p; tuubat (Dehring) taas p | Arvostelija 9: sordinoitujen pasuunojen terävä sointu (Porter) | lähde+analyysi |
| A 4:32.0–4:35.0 | huippu | Arvostelijat yhteen ääneen, mf, korkealla | Kuoro nalkuttaa | analyysi |
| A 4:44.9–4:52.5 | tunnelma | 4/4 'allmählich etwas fliessender': sankariteema mollissa; fagotit pp 'weich', bassoklarinetti, käyrätorvet V-VI ja SORDINOIDUT matalat jouset 'molto espressivo' | 'The Hero's theme goes dolefully into the minor' (Kennedy); sankari tummana | lähde+analyysi |
| **A 4:52.5–5:05.2** | uusi soitin | Harjoitusnumero 16: käyrätorvet V-VIII pp toistuvin soinnuin, alttoviulut sfz 'molto espr.' | Käyrätorvet hiljaa: sankari ei vielä vastaa | lähde+analyysi |

##### A 5:00–6:00 · Vastustajat

Dynamiikka: mp → mf (voimakkain jakso alkaa 5:46.1, huippu 0.70)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| A 5:05.2–6:07.2 | tunnelma | Harjoitusnumero 17: I viulut sordinoituina G-kielellä 'mit Steigerung'; jouset kasvavat aaltoina mp -> mf | Sankari kerää itseään | lähde+analyysi **[tarkista]** |

##### A 6:00–7:00 · Vastustajat

Dynamiikka: mf → mp → mf → f → mf → f (voimakkain jakso alkaa 6:48.9, huippu 0.96)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **A 6:07.2–6:20.5** | uusi soitin | Harjoitusnumero 19 'zurückhaltend, etwas langsamer': pikkuhuilu ja huilu ff, oboet, englannintorvi ja Es-klarinetti ff, tuubat p (Dehring), sordinoidut pasuunat fp | 'The critics renew their attacks' (Kennedy) | lähde+analyysi |
| **A 6:20.5–6:31.7** | uusi soitin | Harjoitusnumero 20 'Wieder etwas langsamer': oboet ja fagotit ff, kaikki 8 käyrätorvea 'espressivo', tuubat p (Dehring), lautaset 'zischend'; accelerando | Arvostelijat ja sankarin torvet vastakkain | lähde+analyysi |
| **A 6:24.6** | isku | Lautaset 'zischend' harjoitusnumerossa 20 | Lautaset suhisevat ('zischend'): vastustajien pilkka jatkuu | lähde+analyysi |
| **A 6:31.7–6:48.2** | uusi soitin | Jouset f; käyrätorvet tulevat 6:41.4 | Sankari nousee | analyysi |
| A 6:48.2–7:02.0 | huippu | Vasket ff (huippu 0.96) | Sankari ajaa vastustajat pakoon ja puhkeaa pieneen voitonhymniin | lähde+analyysi |

#### Kumppani (Des Helden Gefährtin): A 7:02.0–18:45.7

Sooloviulun pitkä säestetty kadenssi tarkkoine esitysohjeineen (teeskennelty kaipaus, kevytmielisyys, viha, hellyys...). Väliin orkesterin repliikkejä: sankari vastaa. Sitten Ges-duurinen rakkauskohtaus, sen jälkihehku ja arvostelijoiden mutina hiljaisuudessa.

##### A 7:00–8:00 · Vastustajat → Kumppani

Dynamiikka: f → pp → mp → pp → p → pp → mp → p (voimakkain jakso alkaa 7:00.0, huippu 0.96)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **A 7:02.0** | soolo | Sooloviulu, pp, harppu; tekstuuri ohut | Kumppani astuu esiin, hellä ensiesiintyminen | lähde+analyysi |
| **A 7:14.5–7:21.5** | uusi soitin | Orkesterin lyhyt vastaus: käyrätorvet ja patarumpu, mp | Sankari vastaa | analyysi |
| **A 7:21.5–7:51.5** | soolo | Viulu ja harppu, pp; matalat jouset vuorottelevat | Keskustelu | analyysi |
| A 7:51.5–7:59.0 | tunnelma | Sellot, bassot ja harppu mp (H-duuri) | Sankarin vastaus | analyysi |

##### A 8:00–9:00 · Kumppani

Dynamiikka: p → mp → p → pp → p (voimakkain jakso alkaa 8:53.4, huippu 0.40)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **A 8:38.0–9:41.5** | soolo | Pitkät sooloviulujaksot pp; nopeampia kuvioita 8:44.5 | Mielialat vaihtuvat (teeskennelty kaipaus, iloisuus, kevytmielisyys, hellyys, sarkasmi) | lähde+analyysi |

##### A 9:00–10:00 · Kumppani

Dynamiikka: p → pp → mp → p (voimakkain jakso alkaa 9:50.8, huippu 0.46)

*(ei uusia tapahtumia: edellinen jatkuu)*

##### A 10:00–11:00 · Kumppani

Dynamiikka: p → mf → p → mp → p (voimakkain jakso alkaa 10:04.8, huippu 0.73)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **A 10:05.0–10:21.5** | uusi soitin | Käyrätorvet ja bassot mf, B-duuri | Sankari vastaa painokkaasti | analyysi |
| **A 10:21.5–10:37.5** | soolo | Viulu kiihkeänä, nopeita kuvioita (3.2/s), p | Kumppani kiihtyy | analyysi |
| **A 10:37.5–10:54.0** | uusi soitin | Puupuhaltimet etualalla | Arvostelijoiden kaiku vai kumppanin pistely? | arvio **[tarkista]** |

##### A 11:00–12:00 · Kumppani

Dynamiikka: p → mp → mf → mp → mf (voimakkain jakso alkaa 11:27.7, huippu 0.90)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **A 11:28.5–11:42.0** | uusi soitin | Käyrätorvet ja vasket kasvavat mf -> f | Sankari leimahtaa | analyysi |
| **A 11:42.0–11:57.5** | soolo | Viulu hyvin nopeana ja korkealla (5.2 ääntä/s) | Kumppani nauraa ja riehaantuu (partituurissa mm. 'beinahe doppelt so schnell (lustig)') | arvio **[tarkista]** |

##### A 12:00–13:00 · Kumppani

Dynamiikka: mf → p → mp → p → mp → p (voimakkain jakso alkaa 12:00.0, huippu 0.66)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| A 12:09.0–12:32.0 | tunnelma | Matalat jouset ja harppu, p | Sankarin hellä, rauhoittava fraasi? | arvio **[tarkista]** |
| **A 12:32.0–13:22.0** | soolo | Viulu ja harppu vuorottelevat orkesterin kanssa, p | Lähentyminen | analyysi |

##### A 13:00–14:00 · Kumppani

Dynamiikka: p → mp → p → f → mp (voimakkain jakso alkaa 13:22.3, huippu 0.79)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| A 13:22.0–13:52.5 | tunnelma | Ges-duuri (Fis), cantabile, koko orkesteri f, harpun glissandot | Rakkauskohtaus alkaa: 'a voluptuously scored love-scene' (Wikipedia) | lähde+analyysi |
| **A 13:52.5–14:37.0** | soolo | Harppu ja viulu hiljempaa (mp), sitten lämmin mf 14:06 | Kahden kesken | analyysi |

##### A 14:00–15:00 · Kumppani

Dynamiikka: mp → mf → pp → p → mf (voimakkain jakso alkaa 14:28.8, huippu 0.66)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| A 14:37.0–14:46.5 | tunnelma | Hiljenee pp:hen, käyrätorvet hiljaa | Hetken hiljaisuus | analyysi |
| A 14:46.5–15:08.0 | tunnelma | Jouset ja harppu nousevat pp -> mf | – | analyysi |

##### A 15:00–16:00 · Kumppani

Dynamiikka: mf → p → mf → f → mp (voimakkain jakso alkaa 15:27.4, huippu 0.86)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **A 15:08.0–15:20.0** | uusi soitin | Puupuhaltimet ja matala vaski hiljaa kesken nousun (mf -> p) | Arvostelijat kolkuttelevat ovelle (Porter) | arvio **[tarkista]** |
| A 15:20.0–15:48.5 | huippu | Nousu p -> f, huippu noin 15:30 (0.75) | Rakkauden huippu; Porterin mukaan sankarin teema palaa | lähde+analyysi |
| **A 15:48.5–16:02.0** | soolo | Käyrätorvet hiljaa, f -> mp, Fis/Ges-duuri | Sankari hellänä | analyysi |

##### A 16:00–17:00 · Kumppani

Dynamiikka: mp → p → mf → p → pp → mp → p → pp (voimakkain jakso alkaa 16:07.0, huippu 0.89)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| A 16:07.0–16:20.0 | tunnelma | Vielä yksi aalto mf | – | analyysi |
| A 16:20.0–17:56.4 | tunnelma | pp, käyrätorvet hiljaa (16:20, 16:45, 17:05, 17:14.5), harppu | Jälkihehku, yö | analyysi |

##### A 17:00–18:00 · Kumppani

Dynamiikka: pp → p → pp (voimakkain jakso alkaa 17:15.1, huippu 0.44)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **A 17:56.4–18:21.7** | uusi soitin | Puupuhaltimet pp | Arvostelijoiden katkelmat 'unisessa hiljaisuudessa' (Wikipedia de) | lähde+analyysi |

#### Taistelu (Des Helden Walstatt): A 18:45.7–B 4:37.7

Kehittely. Kaukaiset trumpetit kutsuvat, sitten lyömäsoittimet, 3/4 ja trumpettien taisteluhuudot; kaikki teemat kamppailevat. Harmoninen huippu kohti Ges-duuria ja es-mollia (Wikipedia). Puolenvaihto on kesken taistelun. **[tarkista jakson raja]**

##### A 18:00–19:00 · Kumppani → Taistelu

Dynamiikka: pp → mp (voimakkain jakso alkaa 18:47.9, huippu 0.57)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **A 18:22.0–18:45.7** | tauko | Lähes hiljaisuus | Tyyntä myrskyn edellä | analyysi |
| **A 18:45.7–19:05.0** | uusi soitin | Kaukainen trumpettifanfaari, hiljaa ja korkealta (pp -> mp) | Kulissitrumpetit kutsuvat taisteluun; kaukana, horisontissa | lähde+analyysi |

##### A 19:00–20:00 · Taistelu

Dynamiikka: mp → pp → mp → f (voimakkain jakso alkaa 19:51.4, huippu 0.99)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| A 19:05.0–19:20.0 | tunnelma | Orkesteri vastaa f, sitten hiipuu | – | analyysi |
| **A 19:24.3–19:32.5** | uusi soitin | Trumpettikutsu uudelleen hiljaisuuden jälkeen | Toinen kutsu | analyysi |
| A 19:32.5 | tunnelma | Patarummut f; trumpetit ja virvelit 19:39.5; 3/4 | Taistelu alkaa (Wikipedia: lyömäsoittimet ja soolotrumpetti, ensimmäinen 3/4) | lähde+analyysi |

##### A 20:00–21:00 · Taistelu

Dynamiikka: f → pp (voimakkain jakso alkaa 20:00.0, huippu 0.99)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| A 20:23.7 | tauko | A-puoli katkeaa kesken taistelun | – | analyysi |

### B-puoli

##### B 0:00–1:00 · Taistelu

Dynamiikka: f → mf → ff → mf (voimakkain jakso alkaa 0:32.4, huippu 0.91)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| B 0:13.6 | tunnelma | Taistelu jatkuu: lyömäsoittimet, virvelit, f | Toistaako B-puoli A:n viimeiset tahdit? | analyysi **[tarkista]** |
| **B 0:24.5–0:49.6** | uusi soitin | Trumpettien ja käyrätorvien taisteluhuudot, virvelit; ff 0:32.4 | Hyökkäys | analyysi |
| B 0:49.6–1:00.2 | tunnelma | Jouset ja viulut mf, lyömäsoittimet pois | Kumppani rinnalla taistelussa (Wikipedia de: viulut 'suloisin melodioin') | lähde+analyysi |

##### B 1:00–2:00 · Taistelu

Dynamiikka: mf → f → ff → f → ff → f (voimakkain jakso alkaa 1:07.9, huippu 0.95)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **B 1:00.2–1:23.7** | uusi soitin | Trumpetit, virvelit ja patarummut palaavat, ff 1:07.9 | – | analyysi |
| B 1:23.7–1:38.7 | tunnelma | Tutti ff, liike tihenee; Es- ja As-duuri vilahtavat | Sankarin teema taistelee | arvio **[tarkista]** |

##### B 2:00–3:00 · Taistelu

Dynamiikka: f → ff → f (voimakkain jakso alkaa 2:38.4, huippu 1.00)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| B 2:07.4–2:51.9 | huippu | Taistelun kiihkein jakso ff (0.95), fanfaarit ja virvelit; Fis/Ges 2:10, b-molli 2:15 | Kaaos, kaikki teemat vastakkain (Wikipedia: huippu kohti Ges-duuria ja es-mollia) | lähde+analyysi |
| B 2:51.9–3:02.2 | tunnelma | Jouset f (c-molli), lyömäsoittimet pois | Hetken hengähdys | analyysi |

##### B 3:00–4:00 · Taistelu

Dynamiikka: f → ff → f → ff (voimakkain jakso alkaa 3:47.0, huippu 0.99)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| B 3:33.0–3:57.5 | huippu | Uusi rynnäkkö ff, huippu 0.92 (3:47), F-duuri | Ratkaisu lähenee | analyysi |

#### Taistelu: kertaus (Des Helden Walstatt: kertaus): B 4:37.7–7:12.5

Sankariteema palaa riemukkaana 4/4:ssä toistuvien kahdeksasosien päällä (Wikipedia); kumppanin teema mukana; uusi cantabile-teema trumpetissa johtaa rauhantöihin. **[tarkista jakson raja]**

##### B 4:00–5:00 · Taistelu → Taistelu: kertaus

Dynamiikka: ff → mf → ff → f → ff → f → ff (voimakkain jakso alkaa 4:12.7, huippu 0.98)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| B 4:12.7–4:18.6 | tunnelma | Äkillinen katko: ff -> hiljaa -> ff (4:15.7-4:17.0) | Ratkaiseva isku? | analyysi **[tarkista]** |
| **B 4:37.7–4:45.0** | uusi soitin | Käyrätorvet ja trumpetit ff, Es-duuri, liike harvenee | Kertaus: sankariteema palaa, voitto | lähde+analyysi **[tarkista]** |
| B 4:45.0–5:36.5 | huippu | Riemukas Es-duuri koko orkesterilla, toistuvat kahdeksasosat (liike 6.5/s), ff | Riemuvoitto: sankariteema koko orkesterissa | lähde+analyysi |

##### B 5:00–6:00 · Taistelu: kertaus

Dynamiikka: ff → f (voimakkain jakso alkaa 5:00.0, huippu 0.95)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **B 5:44.9–6:17.5** | uusi soitin | Viulut ja jouset f, Fis/Ges | Kumppani voittajana sankarin rinnalla | analyysi |

##### B 6:00–7:00 · Taistelu: kertaus

Dynamiikka: f → ff → f → ff (voimakkain jakso alkaa 6:00.0, huippu 0.93)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **B 6:17.5–6:33.3** | uusi soitin | Käyrätorvet ja trumpetit ff | – | analyysi |
| B 6:33.3–7:12.5 | tunnelma | Moduloiva nousu (A-D-G-H-E), ff -> mf 7:02.5 | Uusi cantabile-teema trumpetissa ja sen kehittely johtaa rauhantöihin (Wikipedia) | arvio **[tarkista]** |

#### Rauhantyöt (Des Helden Friedenswerke): B 7:12.5–12:21.0

Sankari muistelee luomistyötään: noin 30 lainausta Straussin aiemmista teoksista (Wikipedia: Guntram 8, Don Quixote 5, Don Juan 4, Tod und Verklärung 4, Macbeth 3, Zarathustra 3, Till 1, laulut). Porterin järjestys: Don Juan vs Zarathustra, Tod und Verklärung, Don Quixote, Don Juan, Till, Guntram ja Macbeth, Traum durch die Dämmerung tenorituuballa. Lainausten tarkkoja kohtia ei tunnisteta äänestä. **[tarkista jakson raja]**

##### B 7:00–8:00 · Taistelu: kertaus → Rauhantyöt

Dynamiikka: ff → mf → pp → p → pp (voimakkain jakso alkaa 7:00.0, huippu 0.93)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| B 7:12.5–7:20.5 | tunnelma | Lähes hiljaista; käyrätorvet hiljaa | Taistelu on ohi; uusi aihe (Wikipedia: nopea laskeva Es-kolmisointu)? | arvio **[tarkista]** |
| **B 7:20.5–8:29.0** | soolo | Harppu hallitsee (pp-p); matalat jouset 7:36.5, puupuhallin 7:40.7, harppu 7:53 ja 8:12.5 | Elegia: harppu, fagotti, englannintorvi, jouset (Wikipedia); muistelu alkaa | lähde+analyysi |

##### B 8:00–9:00 · Rauhantyöt

Dynamiikka: pp → p → mp (voimakkain jakso alkaa 8:54.1, huippu 0.55)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **B 8:29.0–9:06.0** | soolo | Puupuhaltimet johtavat korkealla (rekisteri 0.81-0.88), jouset 8:48 | Lainauksia (mitkä?) | arvio **[tarkista]** |

##### B 9:00–10:00 · Rauhantyöt

Dynamiikka: mp → p → mp → mf (voimakkain jakso alkaa 9:31.8, huippu 0.69)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **B 9:06.0–10:08.5** | soolo | Puupuhaltimet ja käyrätorvet (p), käyrätorvisoolo 9:23, käyrätorvet johtavat mp-mf 10:08 asti | Ehdokas Don Juanin käyrätorviteemalle | arvio **[tarkista]** |

##### B 10:00–11:00 · Rauhantyöt

Dynamiikka: mf → f → mf → f → mf → f (voimakkain jakso alkaa 10:07.8, huippu 0.82)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| B 10:08.5–11:21.5 | tunnelma | f, viulut 10:24; voima kasvaa, sävellaji liikkuu (Fis 10:35-11:00) | Straussin aiemmat teokset seuraavat toisiaan ja kietoutuvat yhteen | analyysi |

##### B 11:00–12:00 · Rauhantyöt

Dynamiikka: f → mf (voimakkain jakso alkaa 11:21.8, huippu 0.94)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| B 11:21.5–12:12.5 | huippu | Huiput 11:21.5 ja 11:36.5, kummankin jälkeen pitkä hiipuminen | Rauhantöiden huipennus | analyysi |

#### Pako maailmasta ja täyttymys (Des Helden Weltflucht und Vollendung): B 12:21.0–21:51.5

Järjestys (Wikipedia, Porter): arvostelijamotiivi tuo agitaton, Dehring keskeyttää ja sankari ajaa hänet pois, kumppani lohduttaa, englannintorven pastoraali, Es-duurin rauhan teema, suuri nousu, viulun ja käyrätorven duetto, vaskien viimeinen fanfaari ja seesteinen Es-duuri. **[tarkista jakson raja]**

##### B 12:00–13:00 · Rauhantyöt → Pako maailmasta ja täyttymys

Dynamiikka: mf → pp → p → mp → f (voimakkain jakso alkaa 12:00.0, huippu 0.91)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **B 12:10.0–12:14.0** | soolo | Lähes hiljaisuuden jälkeen pehmeä matala/keskirekisterin sisääntulo (G3, D4) | Ehdokas: Traum durch die Dämmerung tenorituuballa ('tunnelma lukittuu') | arvio **[tarkista]** |
| **B 12:12.5–12:21.0** | tauko | Hiljaisuus | Jaksojen raja | analyysi |
| **B 12:21.0–12:35.0** | soolo | Harppu pp; viulu p 12:28 | – | analyysi |
| B 12:35.0–13:02.0 | tunnelma | Jouset f, korkealla, kiihkeästi; äkillisiä katkoja 12:38 | Agitato: arvostelijamotiivi palaa ja sankari kiihtyy (Wikipedia) | lähde+analyysi |

##### B 13:00–14:00 · Pako maailmasta ja täyttymys

Dynamiikka: f → mp → mf → p → pp (voimakkain jakso alkaa 13:06.7, huippu 0.76)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **B 13:15.0** | uusi soitin | Agitato katkeaa äkkiä 13:13.5, hiljaisuus; ensimmäinen lyhyt väliintulo 13:15 | Dehringin 1. keskeytys? | arvio **[tarkista]** |
| **B 13:17.0** | uusi soitin | Toinen lyhyt väliintulo 13:17 hiljaisuuden jälkeen | Dehringin 2. keskeytys? | arvio **[tarkista]** |
| **B 13:21.0–13:39.0** | uusi soitin | Käyrätorvet ja vasket mf; patarumpu 13:30 | Sankari ajaa Dehringin lopullisesti pois | arvio **[tarkista]** |
| **B 13:39.0–13:48.5** | soolo | Sooloviulu p | Kumppani lohduttaa | analyysi |

##### B 14:00–15:00 · Pako maailmasta ja täyttymys

Dynamiikka: pp (voimakkain jakso alkaa 14:25.2, huippu 0.32)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **B 14:05.5–14:24.5** | tauko | Lähes hiljaisuus | – | analyysi |
| **B 14:28.0–14:40.0** | soolo | Yksi hiljainen keskirekisterin linja (G4-A4-G5) matalan pitkän pedaalin (H2, E2) päällä; korkea rekisteri liittyy 14:40 | Englannintorven pastoraali: sankariteema maalaisena (Kennedy: 'a bucolic cor anglais theme'); vastustajana teeman vääristänyt soitin sovittaa sen | lähde+analyysi |

##### B 15:00–16:00 · Pako maailmasta ja täyttymys

Dynamiikka: pp → p → mp → p (voimakkain jakso alkaa 15:50.0, huippu 0.43)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| B 15:03.3–15:37.5 | tunnelma | Käyrätorvet ja harppu p, B-duuri | Sankariteema lempeänä | analyysi |
| **B 15:37.5–16:07.5** | soolo | Viulu p, Es- ja As-duuri | Es-duurin rauhan teema: laskeva kolmisointu hitaana cantabilena (aavistettiin viulukadenssissa) | lähde+analyysi **[tarkista]** |

##### B 16:00–17:00 · Pako maailmasta ja täyttymys

Dynamiikka: p → mf → f → mp (voimakkain jakso alkaa 16:31.2, huippu 0.95)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| B 16:07.5–16:31.5 | tunnelma | Nousu p -> mf, korkealla | – | analyysi |
| B 16:31.5–16:51.0 | huippu | Käyrätorvet kasvavat, suuri huippu f (0.93) 16:43.5 | Täyttymyksen suuri nousu | analyysi |
| B 16:51.0–17:44.5 | tunnelma | Patarummut johtavat; viimeinen kuohu f (0.86) 17:33 | Muisto taistelusta? | arvio **[tarkista]** |

##### B 17:00–18:00 · Pako maailmasta ja täyttymys

Dynamiikka: mp → mf → p → f → mf → pp (voimakkain jakso alkaa 17:33.3, huippu 0.95)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **B 17:44.5–18:18.5** | soolo | Äkillinen hiljaisuus: sooloviulu ja jouset pp, korkealla | Kumppani; sankari vetäytyy maailmasta | analyysi |

##### B 18:00–19:00 · Pako maailmasta ja täyttymys

Dynamiikka: pp → mp → f → p (voimakkain jakso alkaa 18:47.0, huippu 0.69)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| B 18:18.5–18:56.0 | tunnelma | Matalat jouset, mp -> f (18:47.5), Es-duuri | Täyttymys kasvaa | analyysi |
| **B 18:56.0–19:40.0** | soolo | Käyrätorvi (keskirekisteri) ja viulu (korkea) vuorottelevat: käyrätorvi 18:56-19:10, viulu 19:11-19:16, käyrätorvi 19:17-19:34, viulu 19:35 | Käyrätorven ja viulun duetto: sankari ja kumppani yhdessä | analyysi |

##### B 19:00–20:00 · Pako maailmasta ja täyttymys

Dynamiikka: p → pp (voimakkain jakso alkaa 19:00.0, huippu 0.58)

*(ei uusia tapahtumia: edellinen jatkuu)*

##### B 20:00–21:00 · Pako maailmasta ja täyttymys

Dynamiikka: pp → mp → p → pp (voimakkain jakso alkaa 20:08.5, huippu 0.60)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| **B 20:02.0–20:39.0** | uusi soitin | Matalat jouset ja harppu mp; puupuhaltimet ja viulu korkealla 20:08; käyrätorvi 20:34 | Viimeiset muistot | analyysi |
| B 20:39.0–21:13.5 | tauko | Lähes hiljaisuus, sointu kantaa (Es-duuri) | – | analyysi |

##### B 21:00–22:00 · Pako maailmasta ja täyttymys

Dynamiikka: pp → p → mf → ff → mp → pp (voimakkain jakso alkaa 21:30.4, huippu 1.00)

| Aika | Mitä | Mitä kuuluu | Merkitys | Varmuus |
|---|---|---|---|---|
| B 21:13.5–21:37.5 | huippu | Vasket tulevat pp 21:13.5, kasvavat mf 21:24 ja ff 21:29.5, patarumpu | Vaskien viimeinen fanfaari; sankarin viimeinen tervehdys | lähde+analyysi |
| B 21:37.5–21:51.5 | tunnelma | Es-duurinen loppusointu vaskissa, ff -> mp, hiipuu | Täyttymys, seesteisyys | analyysi |
<!-- /GEN:minuutit -->

---

## Tarkistettavat kohdat (korvalla)

<!-- GEN:tarkista -->
- **A 2:51.0–3:00.5** Harjoitusnumero 10: fff-tutti, kaikki puupuhaltimet fff, jouset kolmijaettuina soinnuin, trumpetit ja pasuunat; ei patarumpuja: Huippu: koko orkesteri
- **A 3:00.5–3:19.0** Harjoitusnumero 11: ff, puupuhaltimet juoksutuksin, 2 harppua fff alas ja glissando, patarummun crescendo-tremolo: Puupuhaltimet ja harput ryöppyävät alaspäin, patarummut kasvattavat jännitettä
- **A 3:19.0–3:30.6** Harjoitusnumero 12: ff-tutti patarumpuineen; sankariarpeggiot matalissa soittimissa: tarkista
- **A 4:10.0** Tekstuuri tihenee: pikkuhuilu, englannintorven kromaattinen nousu; lautasten 'zischend' pp ei erotu rahinasta: Arvostelijat 3 ja 4
- **A 4:19.0–4:22.0** Oboe ja Es-klarinetti 'sehr scharf und spitzig', korkealla: Arvostelija 6: kiihtynyt oboe
- **A 4:22.0–4:25.5** Englannintorvi ff ja 2 fagottia ff: Arvostelijat 7 ja 8: pilkka
- **A 5:05.2–6:07.2** Harjoitusnumero 17: I viulut sordinoituina G-kielellä 'mit Steigerung'; jouset kasvavat aaltoina mp -> mf: Sankari kerää itseään
- **A 10:37.5–10:54.0** Puupuhaltimet etualalla: Arvostelijoiden kaiku vai kumppanin pistely?
- **A 11:42.0–11:57.5** Viulu hyvin nopeana ja korkealla (5.2 ääntä/s): Kumppani nauraa ja riehaantuu (partituurissa mm. 'beinahe doppelt so schnell (lustig)')
- **A 12:09.0–12:32.0** Matalat jouset ja harppu, p: Sankarin hellä, rauhoittava fraasi?
- **A 15:08.0–15:20.0** Puupuhaltimet ja matala vaski hiljaa kesken nousun (mf -> p): Arvostelijat kolkuttelevat ovelle (Porter)
- **B 0:13.6** Taistelu jatkuu: lyömäsoittimet, virvelit, f: Toistaako B-puoli A:n viimeiset tahdit?
- **B 1:23.7–1:38.7** Tutti ff, liike tihenee; Es- ja As-duuri vilahtavat: Sankarin teema taistelee
- **B 4:12.7–4:18.6** Äkillinen katko: ff -> hiljaa -> ff (4:15.7-4:17.0): Ratkaiseva isku?
- **B 4:37.7–4:45.0** Käyrätorvet ja trumpetit ff, Es-duuri, liike harvenee: Kertaus: sankariteema palaa, voitto
- **B 6:33.3–7:12.5** Moduloiva nousu (A-D-G-H-E), ff -> mf 7:02.5: Uusi cantabile-teema trumpetissa ja sen kehittely johtaa rauhantöihin (Wikipedia)
- **B 7:12.5–7:20.5** Lähes hiljaista; käyrätorvet hiljaa: Taistelu on ohi; uusi aihe (Wikipedia: nopea laskeva Es-kolmisointu)?
- **B 8:29.0–9:06.0** Puupuhaltimet johtavat korkealla (rekisteri 0.81-0.88), jouset 8:48: Lainauksia (mitkä?)
- **B 9:06.0–10:08.5** Puupuhaltimet ja käyrätorvet (p), käyrätorvisoolo 9:23, käyrätorvet johtavat mp-mf 10:08 asti: Ehdokas Don Juanin käyrätorviteemalle
- **B 12:10.0–12:14.0** Lähes hiljaisuuden jälkeen pehmeä matala/keskirekisterin sisääntulo (G3, D4): Ehdokas: Traum durch die Dämmerung tenorituuballa ('tunnelma lukittuu')
- **B 13:15.0** Agitato katkeaa äkkiä 13:13.5, hiljaisuus; ensimmäinen lyhyt väliintulo 13:15: Dehringin 1. keskeytys?
- **B 13:17.0** Toinen lyhyt väliintulo 13:17 hiljaisuuden jälkeen: Dehringin 2. keskeytys?
- **B 13:21.0–13:39.0** Käyrätorvet ja vasket mf; patarumpu 13:30: Sankari ajaa Dehringin lopullisesti pois
- **B 15:37.5–16:07.5** Viulu p, Es- ja As-duuri: Es-duurin rauhan teema: laskeva kolmisointu hitaana cantabilena (aavistettiin viulukadenssissa)
- **B 16:51.0–17:44.5** Patarummut johtavat; viimeinen kuohu f (0.86) 17:33: Muisto taistelusta?
- Jakson raja: **Taistelu** alkaa A 18:45.7 (kulissitrumpetit 1125.7 (Wikipedia en: Walstattin alku; de: Gefährtinin loppu); kertaus B 277.7)
- Jakson raja: **Taistelu: kertaus** alkaa B 4:37.7 (käyrätorvet ja trumpetit ff 277.7, tiheä tutti 285.0)
- Jakson raja: **Rauhantyöt** alkaa B 7:12.5 (ff -> pp 432.5; lähes hiljaisuus 732.5-741.0)
- Jakson raja: **Pako maailmasta ja täyttymys** alkaa B 12:21.0 (harppu hiljaisuuden jälkeen 741.0, agitato 755.0; musiikki loppuu 1311.5)
<!-- /GEN:tarkista -->
