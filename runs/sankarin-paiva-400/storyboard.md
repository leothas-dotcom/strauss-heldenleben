# Kuvakäsikirjoitus: sankarin-paiva-400 – "Sankarin päivä" (versio 2)

LP-puoli A, 0–400 s. Versio 2 korjaa version 1, jossa monet ajat ja soittimet tulivat
PANNs-tunnistimesta ja olivat väärin. Väärin olivat esimerkiksi "viulut 0:17", "lautaset
0:32,6" ja "puupuhaltimet ensi kertaa 1:40". Lisäksi kuvaan keksittiin tapahtumia, joita
musiikissa ei ole.

**Sopimus:**
- Jokaisella rivillä on musiikillinen peruste ja tarkistuskohta (aika ja mitä still-kuvassa
  pitää näkyä). Toteutus on valmis vasta, kun kaikki rivit on tarkistettu (`tarkistus.md`).
- **Ajat** tulevat teemakartasta ([teemat.json](../../annotations/teemat.json); sama sisältö
  [kuunteluoppaassa](../../annotations/kuunteluopas.md)). Sankari- ja vastustajajaksossa ne on
  tarkistettu partituurista (tahdit ja harjoitusnumerot) ja kohdistettu äänen jaksorajoihin ja
  iskuanalyysiin (`aksentit.py`, 10 ms). Jos aika muuttuu, se muutetaan teemakarttaan, ei tähän.
- **Kuvan kieli** on [tyylidokumentin](../../docs/visuaalinen_tyyli.md) "Elävä vedos".
  Tämän kuvakäsikirjoituksen sääntöjä ei voi käyttää tyylin ohittamiseen.

## 1. Kielioppi: mitä kukin soitin on kuvassa

Tyylin perusmuodot (luku 4): **sankari on taso, kumppani viiva, vastustajat pisteitä, ja
maailma on berliininsininen maisema**, jossa säestys näkyy sivutoimintana. Tekniikka on 2D-paperi
kerroksina (Reiniger, multiplane).

| Soitin | Mitä se edustaa | Miten se näkyy | Milloin |
|---|---|---|---|
| **käyrätorvet ja sellot** sankariteemassa | sankari | **sinooperinpunainen taso, eli viiri**. Yläreuna on teeman kaari (korkeus = sävelkorkeus), ja paksuus kasvaa vaskien ja jousten massan mukana. Liike on raskas ja juhlava, ja jälkiliike pitkä. | aina kun sankariteema soi |
| **8 käyrätorvea yhdessä pääänenä** | sankarin joukko ("käyrätorvet ovat sankarit") | 8 paperisiluettia, joiden kellot nousevat. **Vain harkiten:** T17, harjoitusnumerot 8 ja 9 sekä dom7. Yksi siluetti T45:n soolossa. | tahtien mukaan, ks. rivit |
| sankarin siluetti selkäpuolelta | kuuntelijan paikka | **vain kahdesti tällä välillä** (tyyli 7): avauksessa ja dom7-sädekehää vasten | rivit 1 ja 19 |
| **viulut** (korkea) | henki ja valo | taivas, eli yläkolmannes. Viulujen soidessa taivaan rasteri vaalenee ja tuulen viivoitus liikkuu. Juoksutus on nouseva viivoitusveto. Viulut eivät ole hahmoja. | tulevat T9 (0:23) |
| **alttoviulut, sellot, kontrabassot** | maa ja paino | vuoret ja maa berliininsinisenä. Sellojen ja bassojen nousu kohottaa vuoria, matala rekisteri painaa kuvan alas. | |
| **puupuhaltimet sankarijaksossa** | mielikuvitus ja tunne | paperiset linnut (pääskyt) keski- ja yläkaistalla, kermanvaaleina | tulevat T21 (0:47.8) |
| **puupuhaltimet vastustajien jaksossa** | arvostelijat | samat soittimet kääntyvät **mustiksi pisteiksi** (tyyli 10: huilu = neulanpisteet, oboe = paisuva parvi jne.). Linnuista tulee pisteitä: tämä on tarkoituksellinen kaari. | 4:02.7 alkaen |
| **harput** | vesi | joen ja veden väreily ja putous sivutoimintana. Glissando on aalto. | tulevat T21 |
| **patarummut** | kohtalo ja voima | yksittäinen lyönti tärähdyttää maata ja tremolo saa sen jyrisemään. Rytmi tulee iskuanalyysistä. | tulevat T13 (0:31.4) |
| **trumpetit, pasuunat ja tuubat** sankarijaksossa | juhla ja valta | heraldiset viirit tason takana sivuäänenä (rasteri). Tuubat ovat maan tumma massa. | T13 alkaen |
| **tuubat vastustajien jaksossa** | Dehring | kaksi raskasta mustaa täplää maassa, aina kvintin päässä toisistaan ja rinnakkain | 4:10.7, 4:26, 6:07, 6:20 |
| **sordinoidut pasuunat** | arvostelija 9 | mustan leimasimen isku ja tahra | 4:25.5 |
| koko orkesteri ff | koko maailma | kaikki kerrokset ovat täysiä, ja kuvan tiheys seuraa orkestraatiota (tyyli 13.6) | |

**Kirjoitetut iskut** (tyyli 8, käyttäjän linjaus): isku on **painolaatan isku** paperiin.
Laatta painuu, muste leviää, kohdistus nytkähtää ja jälki jää. Muoto tulee soittimesta:
- käyrätorvien ja fagottien sointuisku leimaa tason reunaa
- patarumpu tärähdyttää maata
- tutti on koko laatan isku

Kuva tulee yhden ruudun ennen ääntä. Sykettä ei kuvata.

**Miljöö** saa olla keksitty, tapahtumat eivät (tyyli 13.12):
- **Sankarijakso:** aamunkoitto, laakso, ylätasanko ja myrskyvuori. Aurinko on vuorokaudenaika
  (Runge), ei *Zarathustra*-lainaus.
- **Vastustajat:** sameus ja suo kuolleine puineen. Harpun muotoinen kuollut puu (*Guntram*) on
  pelkkää miljöötä.
- **Straussin lainausten tunnukset** kuuluvat vasta rauhantöihin (tyyli 10).

**Värit:**
- Sankarijakso: aamunkoi, sininen → kerma.
- Vastustajat: sameus, musta ja punainen rasteri.
- Erikoisvärejä (kulta, purppura, vihreä) ei käytetä tällä välillä.

## 2. Rivit

Ajat ovat A-puolen aikaa sekunteina ja minuutteina. T = partituurin tahti ja H = harjoitusnumero.

| # | Aika | Musiikki (tarkistettu) | Kuva ja sen peruste | Kamera | Tarkistus (still) |
|---|---|---|---|---|---|
| 0 | 0:00–0:07.6 | hiljaisuus; neula 0:03.1; sisäänajouran rahina | Kerma paperi herää rahinan tahtiin (patina). Oikealla on haalea lyijykynäluonnos vuorista (tyyli 12.1). Otsikko painuu. | levy → sukellus uraan → paperi | 3.4: neula urassa · 6.0: otsikko |
| 1 | 0:07.6–0:17.6 (T1–5) | **sankariteema**: käyrätorvi, alttoviulut ja sellot unisonossa, kontrabassot alla; Es-duuri; **viulut tauolla** | Punainen taso nousee laakson kaistalta, ja sen yläreuna seuraa teeman kaarta matalalta ylös. Sankarin siluetti näkyy selkäpuolelta (1/2) laakson reunalla, viirin varsi kädessä: taso *on* viiri. Vuoret painuvat sinisinä bassojen mukana. Taivas pysyy tyhjänä paperina, koska viulut ovat vaiti. | sivuttain, nousee hitaasti teeman mukana | 10: taso ja siluetti, tyhjä taivas · 15: taso korkealla |
| 2 | 0:17.64 · 0:21.62 · 0:27.50 (T6, T8, T11) | **kolme sointuiskua** f: kaikki 8 käyrätorvea, fagotit, kontrafagotti ja kontrabassot | Kolme samanlaista laatan iskua (sama musiikki näyttää samalta, tyyli 13.3). Tason alareunaan painuu leima, muste leviää ja maa nytkähtää hieman (kontrabassot). Iskujen välissä ei liikettä. | ei leikkausta; kevyt kohdistuksen nytkähdys | 17.7: leima ja leviävä muste |
| 3 | 0:23.07–0:31.4 (T9–12) | **viulut tulevat ensimmäistä kertaa** (kohotahti 23.1, T9 23.6) | Taivas avautuu: yläkolmanneksen rasteri vaalenee ja tuulen viivoitus alkaa liikkua viulujen kanssa. Taso kurottaa taivaalle (teema saavuttaa huippunsa noin T9). | nousee taivaalle | 24: vaalea taivas ja viivoitus · 28: T11-isku |
| 4 | 0:31.42–0:39.4 (T13–16, H1) | **trumpetti, pasuunat, bassotuuba ja patarummut tulevat ensimmäistä kertaa** mf, sitten kasvu ff:ään. **Ei lautasia.** | Heraldiset viirit nousevat tason taakse rasterina (sivuääni). Patarummut tärisyttävät maata. Aamuaurinko nousee vuorten takaa crescendon mukana (miljöö: aamunkoi), ilman välähdystä. Matalan kaistan isku 0:33.87 tärähdyttää maata. | laajenee | 33.9: maan tärähdys, viirit · 38: täysi aamu |
| 5 | 0:39.44–0:45.7 (T17–19) **vahvistettu** | **käyrätorvet ff matalalla teemassa** sellojen ja kontrabassojen kanssa; trumpetit p toistuvin soinnuin; tenori- ja bassotuuba f; **I viulut vaiti** | **8 käyrätorvisiluettia** nousee harjanteelle matalalle (matala rekisteri). Punainen taso painuu leveäksi ja raskaaksi lähelle maata. Taivas tyhjenee paperiksi, koska viulut ovat vaiti. Trumpettien toistuvat soinnut näkyvät viirien pieninä nykäyksinä iskuanalyysin rytmissä. | matala, edestä; sivuajo rivin ohi | 41: 8 siluettia ja matala taso · 44: tyhjä taivas |
| 6 | 0:45.74–0:47.8 (T20) | I viulut palaavat nousevalla juoksutuksella f | Yksi nouseva viivoitusveto pyyhkäisee taivaan alhaalta ylös. | – | 46.5: veto taivaalla |
| 7 | 0:47.8–0:55.8 (T21–24, H2) | **puupuhaltimet ja 2 harppua tulevat ensimmäistä kertaa**: huilut ja viulut nousevin juoksutuksin pp crescendo, harppujen arpeggiot, patarumpu pp; lyyrinen teema H-duurissa | Maailma avautuu: laaksoon aukeaa joki, joka väreilee harppujen arpeggioiden mukana. Ensimmäiset paperipääskyt (puupuhaltimet) nousevat ylös huilujen ja viulujen juoksutusten mukana. Taso lepää. | lento joen yli, pehmeä kaari | 50: joki väreilee, pääskyt nousevat |
| 8 | 0:55.8–1:07.5 (T25–30) | englannintorvi, klarinetit ja oboet virtaavina kuvioina; käyrätorvet I–II laulavat; sellot pizz | Pääskyt liitävät pareittain (puupuhallinten kuviot). Taso aaltoilee pehmeästi käyrätorvien laulun mukana (pääääni täysvärinen, linnut rasteria). | lento jatkuu | 58: pääskyparit ja aaltoileva taso |
| 9 | 1:07.5–1:18.8 (T31–36) | pp: harput ja viulujen juoksutukset; T32 käyrätorvet, tenorituuba ja kontrafagotti espressivo; **T34 huilut ja koko käyrätorviryhmä f**, T36 ff | Uusi aalto: joki väreilee ja taivas viivoittuu. Taso paisuu espressivossa ja leveää T34:ssä. Paikka vaihtuu tasangoksi. | sivuajo | 70: väreet · 75: leveä taso tasangolla |
| 10 | 1:18.8–1:34.1 (T37–44, H4) | p, uusi kasvu; **T40–41 sforzandot** (oboet, englannintorvi, viulut); crescendo; **1:28.2–1:34.1 ensimmäinen huippu** (vahvistettu) | Taso nousee portaittain. Jokainen sforzando painaa tason reunaan pienen leiman. Huipussa taso on korkeimmillaan ja taivas kirkkain. | nousee | 82: sforzandoleima · 92: huippu |
| 11 | **1:34.1** (T45, H5) | **ff-sointuisku** puupuhaltimissa ja käyrätorvissa; **käyrätorvi I nousee sankariarpeggion**; sellot ja bassot juoksevat ylös; sitten diminuendo | Koko laatan isku. **Yksi käyrätorvisiluetti** nostaa kellonsa (soolo), ja taso hyppää arpeggion portaat ylös. Sen jälkeen kaikki laskeutuu, ja rekisteri putoaa: kuva painuu alas. | pysähtyy iskuun, sitten laskeutuu | 94.2: isku ja yksi torvi · 97: laskeutunut kuva |
| 12 | 1:38.1–1:48.5 (T47–51) | huilu ja englannintorvi pienin soolokuvioin, klarinettisoolo (T48); **T49 hiljainen 'ausdrucksvoll'**: huilu ja I viulut laulavat, harput pp, patarummun tremolo pp | Kaksi lintua leikittelee (huilu ja englannintorvi). Hiljaisessa jaksossa joki väreilee hiljaa ja maa humisee pp (tremolo). Taso lepää hellänä. | hidas, lähes liikkumaton | 99: kaksi lintua · 105: hiljainen joki |
| 13 | 1:48.5–2:06.4 (T52–60, H6) | puupuhallinten ja käyrätorvien mf-sointu; **T53–56 käyrätorvet I–II laulavat 'ausdrucksvoll'**, alttoviulun soolo, klarinetti; matalin rekisteri | Taso laulaa yksin keskellä kuvaa (pääääni). Alttoviulun soolo näkyy keskikaistan ohuena viivoituksena, joka on rasteria, koska se ei ole kumppani. Kuva on matala ja rauhallinen. | hidas sivuajo | 113: laulava taso |
| 14 | 2:06.4–2:21.0 (T61–67, H7) | crescendo matalalta: käyrätorvet f marcato, sellot ja kontrabassot hervortretend; T64 huilusoolo | Vuoret kohoavat (sellot ja bassot), ja maakaista paksunee. Huilusoolo on yksittäinen lintu korkealla. | nousee alhaalta | 130: kohoavat vuoret |
| 15 | **2:21.0**–2:34.6 (T68, H8) | **ff-tutti**: 8 käyrätorvea sankariteemassa, 2 Es-trumpettia, pasuunat, tuubat ja kaikki jouset | Laatan isku 2:20.9. **8 käyrätorvisiluettia** ja heraldiset viirit ylätasangolla. Taso on täysimmillään ja paksuimmillaan. | matala nousu → laaja | 142: 8 siluettia, täysi taso |
| 16 | **2:34.6**–2:51 (T76, H9) | **ff-tutti**: sankariarpeggiot fagoteissa, bassoklarinetissa, käyrätorvissa ja selloissa | Iskut 2:34.5–2:35.7: taso nousee maasta arpeggion portain (teema matalissa soittimissa), ja jokainen porras on leima. | sivuajo | 155: portaat |
| 17 | 2:51–3:00.5 (T84, H10) | **fff-tutti**: kaikki puupuhaltimet fff, jouset kolmijaettuina soinnuin, trumpetit ja pasuunat; **ei patarumpuja** | Kaikki kerrokset ovat täynnä, ja kuvan tiheys on suurimmillaan. Maa ei tärise, koska patarummut eivät soi. Myrskyvuori näkyy kaukana (miljöö). | laaja | 175: täysi kuva, vuori kaukana **[tarkista aika]** |
| 18 | 3:00.5–3:30.6 (T90–101, H11–12) | **H11**: puupuhaltimet juoksutuksin, **harput fff alas ja glissandot**, patarummun crescendo-tremolo; säännölliset iskut 3:00.50, 3:01.51, 3:02.51, 3:03.62; **H12** ff-tutti patarumpuineen | Harppujen glissandot ovat putouksen aaltoja, ja jokainen isku on aalto oikeassa kohdassa. Maa jyrisee tremolossa. Taso kiipeää kohti myrskyvuorta. | seuraa ylös | 181.5: putouksen aalto · 200: kiipeävä taso **[tarkista H12:n aika]** |
| 19 | 3:30.6–3:44.8 (T102–109) | **neljä kohtaloiskua**: pidetty ff-sointu patarummun tremolon kanssa katkeaa (3:32.5, 3:36.3, 3:40.1, 3:43.7), ja **ff-kohotahti-isku** lyö (**3:33.40, 3:37.26, 3:40.95, 3:44.64**; kontrasti 5–14 dB) | Katkon hiljaisuudessa kuva jähmettyy mustavalkoiseksi puupiirrokseksi (Dürer). Iskussa koko laatta lyö: väri palaa, muste leviää ja kohdistus nytkähtää. Kuvakulma vaihtuu iskun kohdalla. Neljä samanlaista iskua, joista neljäs on vahvin. | leikkaus jokaisella iskulla | 213.0: puupiirros · 213.4: isku · 224.7: vahvin isku |
| 20 | 3:44.8–3:59.2 (T110–116, H13) | pasuunat ja tuubat fff; **dominanttiseptimisointu 3:49–3:59.2** (Bb-D-F-As); T114 patarummun 'molto cresc.' -tremolo | Huippu: sankarin siluetti selkäpuolelta (2/2) huipulla, viiri pystyssä. **Sädekehä** kasvaa taajuuskaistoista (tyyli 10). 8 käyrätorvisiluettia, kaikki kellot ylhäällä: tablo. Laatat liukuvat kauimmas kohdistuksesta, koska sointu jää ratkaisematta. | nosturi → pysähtyy | 232: huipulle · 239.05: sädekehä ja tablo |
| 21 | 3:59.2–4:02.7 (T117) | **yleistauko**, teoksen ainoa pitkä hiljaisuus | Tyhjä paperi. Vain levyn rahina välkehtii pölynä (tyyli 6). | liukuu tyhjän paperin yli | 241: tyhjä paperi |
| 22 | 4:02.7–4:20.7 (T118–126) | **vastustajat**, 3/4 'Etwas langsamer': **huilu** ff 'sehr scharf und spitzig' (4:02.7); **oboe** 'schnarrend' (4:04.7); **englannintorven** kromaattinen nousu, **lautaset 'zischend' pp**, pikkuhuilu (4:08.7); **Dehring**: tuubat p kvintteinä (4:10.7–4:18.6); oboe ja Es-klarinetti 'scharf und spitzig' | Sameus laskeutuu: suo ja kuolleet puut (miljöö). Pisteet tulevat Porterin järjestyksessä, kukin omalla hetkellään ja nuotinalkujen rytmissä:<br>• huilu: neulanpisteet taivaalla<br>• oboe: paisuva pisteparvi<br>• englannintorvi: pisteiden portaat<br>• lautaset: yksi suhiseva roiske<br>• Dehring: kaksi raskasta täplää maassa, kvintin päässä toisistaan<br>Laatat ovat epäkohdistuksessa. | rauhallinen: olennot ovat levottomia, kamera ei | 243: neulanpisteet · 249: portaat ja roiske · 252: Dehringin täplät |
| 23 | 4:20.7–4:44.9 (T127–139) | **englannintorvi ff** (vääristää sankariteeman) ja **2 fagottia ff** (4:20.7); **3 sordinoitua pasuunaa ff** (4:25.5); Dehring taas; **kuoro** 4:32–4:35 | Englannintorvi tekee sankarin tasosta pistekarikatyyrin (tyyli 4). Fagotit ovat kaksi hyppivää täplää. Pasuunat lyövät mustan leimasimen ja jättävät tahran. Kuorossa musta rasteriusva himmentää koko kuvan. | rauhallinen | 261: pistekarikatyyri · 266: leimasintahra · 273: sameus |
| 24 | 4:44.9–5:05.2 (T140–, H16) | **sankariteema mollissa**: sordinoidut matalat jouset, fagotit pp 'weich', bassoklarinetti, käyrätorvet V–VI 'molto espr.'; puupuhaltimet vaikenevat; **H16 (4:52.5)**: käyrätorvet V–VIII pp | Punainen taso palaa **tummana**: puoliksi rasteroituna ja mustalla päällepainettuna (tyyli 10), matalalla kuvassa. Pisteet vaikenevat ja jäävät reunoille. H16:ssa taso sykähtää hiljaa käyrätorvien mukana. Sankari ei vielä vastaa. | hidas | 290: tumma matala taso · 295: hiljaiset pisteet reunoilla |
| 25 | 5:05.2–6:07.2 (H17–18) | **H17**: I viulut sordinoituina G-kielellä 'mit Steigerung'; jouset kasvavat aaltoina mp → f (5:55); **H18**: käyrätorvet ja fagotit kasvavat, trumpetit ff, matalat jouset ff 'molto espr.' | Jokainen jousten aalto kasvattaa tasoa ja punaa (vähemmän rasteria). Taivas vaalenee hitaasti, mutta sameus pysyy reunoilla. Sankari kerää itseään. | hidas nousu aaltojen mukana | 320: kasvava taso · 355: lähes täysi puna |
| 26 | 6:07.2–6:20.5 (H19) | **arvostelijat palaavat** 'zurückhaltend': pikkuhuilu ja huilu ff, oboet, englannintorvi ja Es-klarinetti ff, Dehring p, sordinoidut pasuunat fp | Pisteet parveilevat takaisin tason ympärille, ja sameus sakenee. Dehringin täplät ryömivät maassa. | ylhäältä, rauhallinen | 370: piiritys |
| 27 | 6:20.5–6:31.7 (H20) | 'Wieder etwas langsamer': oboet ja fagotit ff, **kaikki 8 käyrätorvea 'espressivo'**, Dehring, lautaset 'zischend'; accelerando | 8 käyrätorvisiluettia nousee hämärästi (rasteroituina) tason juurelle: sankarin torvet vastaavat ensimmäistä kertaa. Taso ja pisteet vastakkain, ja accelerando kiihdyttää kaikkea. | lähenee | 383: 8 hämärää siluettia |
| 28 | 6:31.7–6:40 | jouset f; (6:41.4 käyrätorvet ja 6:48.2 vasket ff jäävät videon ulkopuolelle) | Tason puna leimahtaa täyteen, ja sameus alkaa repeillä. Kuva häipyy, ja tilalle tulee teksti "jatkuu". | pysähtyy | 394: leimahdus · 399: lopputeksti |

## 3. Kamera: sulavuuden säännöt

- Ei kallistusta (roll), ei kieppumista eikä nopeita kääntöjä. Kulmanopeus otossa on enintään
  20 °/s ja yleensä alle 8 °/s. Tämä tarkistetaan koodilla (`camcheck`).
- Kamera liikkuu pehmeästi kiihtyen ja hidastaen. Se seuraa hahmon tasoitettua polkua, ei
  hahmoa itseään.
- **Sankarijakso:** kamera kulkee sivuttain ja nousee teeman mukana.
- **Vastustajat:** kamera on rauhallinen; olennot ovat levottomia, kamera ei (tyyli 11).
- Otto vaihtuu, kun johtava ääni vaihtuu. Leikkaukset osuvat kirjoitettuihin iskuihin tai
  tahtiviivoille, eivät sykkeeseen.
- Siirtymät paikasta toiseen tehdään rasteriliukumalla tai paperin kautta. Iiris tulee vain
  loppuun.

## 4. Muutokset koodiin (versio 1 → versio 2)

`visual/sankarin-paiva/` on tehty version 1 mukaan. Seuraavat kohdat poikkeavat tästä
kuvakäsikirjoituksesta ja korjataan:
1. **Ajat** luetaan teemakartan merkinnöistä (`cues.json`: `teema_*`) eikä PANNs-huipuista:
   - aurinko ja lautasisku 32.6 poistetaan
   - pääskyt ja tuuli alkavat vasta viulujen ja puupuhaltimien tullessa (23.1 ja 47.8)
   - puupuhaltimien "enne" 1:40 poistetaan
2. **Johtaja-nukke** näkyy vain riveillä 1 ja 20. Muualla sankari on punainen taso.
   Käyrätorvisiluetit näkyvät vain riveillä 5, 11 (yksi), 15, 20 ja 27.
3. **Keksityt tapahtumat poistetaan:** ratsastus, joenylitys, hevonen takajaloillaan, rotko,
   luola ja lainausten tunnukset sankarijaksossa. Miljöön vaihdokset saavat jäädä, kun ne
   seuraavat musiikkia: rekisteri, sävellaji ja voimakkuus.
4. **Iskut** tehdään laatan iskuna tarkoissa ajoissa: rivit 2, 11, 15, 16, 18, 19 ja 23.
5. **Vastustajat** ovat pisteitä tyylin taulukon mukaan (tyyli 10), ja niiden ajat ovat
   partituurin tahdeista.
