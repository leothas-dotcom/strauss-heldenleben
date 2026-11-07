# Kuvakäsikirjoitus: muste-1230 – "Punainen muste", A-puoli

LP:n A-puoli kokonaan: neula 0:00, musiikki 0:07.6–20:23.7, puolenvaihto, loppu 1240 s.
Lähteet ovat ehdottomia:
- [docs/visuaalinen_tyyli.md](../../docs/visuaalinen_tyyli.md), erityisesti luku 18 (elävä muste ja
  Disneyn opit): miltä kuva näyttää ja miten se liikkuu
- [annotations/kuunteluopas.md](../../annotations/kuunteluopas.md): mitä musiikissa tapahtuu

*(T 18)* = tyyliohjeen luku. Ajat ovat teemakartan ankkureita ([teemat.json](../../annotations/teemat.json)),
ja koodi lukee ne `S.A(id)`:llä. Kestot ovat ankkureista vain mittasuhteiden vuoksi.
**[tarkista]** = oppaan varmuus on "arvio", opas itse merkitsee kohdan tai opas on kohdassa tyhjä.
**Tulkinta** = kuvakäsikirjoituksen oma ratkaisu, jota lähteet eivät suoraan anna.

Tämä korvaa luonnoksen `vedos-1230` (pelkkä friisi, hylätty staattisena, kuten `video-400`).

---

## 1. Periaate: Disney-elokuva, jonka punainen lanka on vedos

Video seuraa koko ajan **sankaria, joka tekee asioita** tunnemaisemissa: aamunkoitto, joki, kukkula,
myrsky ja salamat, suo, kuutamojoki, taistelukenttä. Maisemat herättävät tunteet, ja musiikki ohjaa
jokaista tapahtumaa.

**Sankari on punaista mustetta** *(T 18)*. Hänet on maalattu sinooperisilla siveltimenvedoilla, ja
siksi hän voi muuttaa olomuotoaan musiikin mukaan:
- **Melodiassa** hänen vetonsa juoksevat friisiin **teemaviivaksi**, joka seuraa sävelkorkeutta
  tarkasti.
- **Toiminnassa** vedot kokoontuvat hahmoksi: hän nousee, ratsastaa, kiipeää, istuu ja taistelee.
- **Taistelun huipussa** hän repeää roiskeiksi ja kokoontuu taas.

Friisi on taustalla koko ajan: kaikki painettu jää vasemmalle, ja oikealla on tyhjää paperia ja
tulevan luonnos *(T 6)*.

**Friisin ja maailman suhde:** friisi on multiplane-kerros 4, äänien taso *(T 7)*, horisontin
korkeudella maiseman keskellä. Laajoissa kuvissa se näkyy punaisena nauhana, joka jatkuu
vasemmalle menneisyyteen; lähikuvissa se näkyy taustan nauhana hahmon takana, ja painokohta on
hahmon kohdalla. "Sukeltaa friisin sisään" (kehittely) tarkoittaa, että kamera siirtyy kerrosten
väliin niin, että etuala ohittaa kameran ja friisi tulee lähelle. "Kiertyy uraksi" tarkoittaa, että
kamera vetäytyy, kunnes koko painettu nauha näkyy, ja nauha taipuu spiraaliksi levyn uraksi. Friisiä ei seurata minuuttikausia, vaan se on **punainen lanka**, jonka
päässä sankari on.

**Kaksi mittaria** *(T 1)*: ilman ääntä katsoja tietää, kuka soittaa ja missä kohtaa teosta ollaan,
ja äänen kanssa hän kuulee enemmän.

### Mitä aiemmista ajoista opittiin

| Toimi (säilytetään) | Ei toiminut (ei toistu) |
|---|---|
| auringonnousu korkeimmassa paikassa, sankari etualalla | pelkkä friisi 400 s, pelkkä viiva |
| pääskyt ja tiirat puupuhaltimina | sama tanssi koko ajan, pyörivä kamera |
| nousut yhä korkeammalle, aaltovuoren kiipeäminen | pomppivat hahmot, päällekkäiset viirit |
| sädekehä selkäkuvan takana | suo kaukaa kuvattuna, pienet olennot |
| soitinten muotoiset olennot lähikuvissa | peilikuva hahmon päällä |
| yksi tuuli, iskut ruudun tarkkuudella | natsitervehdystä muistuttava ele |
| viiva, joka kietoutuu viiriin (rakkaus) | laivasto ja toverit liian aikaisin |

---

## 2. Henkilöt

| Henkilö | Ääni | Muoto *(T 4, 10, 18)* | Miten liikkuu |
|---|---|---|---|
| **Sankari** | käyrätorvet ja sellot | Punaista mustetta: kasvoton ritari, jonka kypärä on käyrätorven kello ja rintapanssari torven kierre. Maalattu 20 vedolla. Viiri on yksi pitkä veto hänen keihäässään, ja sen jälki friisissä on teemaviiva. | Fraasien mukaan, ei iskuissa. Hajoaa friisiksi melodiassa ja kokoontuu toiminnassa. Eleet: kello soittoasentoon, viiri pystyyn molemmin käsin, polvistuminen, käsi matalalla kumppanille. **Ei koskaan ojennettua suoraa käsivartta ylös ja eteen.** |
| **Toverit** | 8 käyrätorvea ryhmänä | seitsemän pienempää punaista ritaria | Säästetään: iskuissa vain viirinkärjet harjanteen takaa, rivi `held_intro_loppuu`:ssa, koko joukko `held_reh8`:ssa. |
| **Kumppani** | sooloviulu | **Musteeton**: hän on se kohta, johon mustetta ei paineta *(T 10, 18)*. Vedoksessa hän on paperinvalkoinen viiva, joka leikkaa sinisen laveerauksen auki ja seuraa viulun sävelkorkeutta. Maailmassa hän on hoikka, kasvoton valkoviivahahmo, jonka helmasta viiva piirtyy. Straussin kuvaus: herkkä sielu siilin piikkien takana. | Mielialat vaihtuvat fraasirajoissa *(T 10 taulukko)*: sarkasmissa viiva on siksak, joka pistää viiriä, ja hellyydessä samat piikit pehmenevät kiehkuroiksi. Hän pyörähtää, kääntää selkänsä ja kumartaa. |
| **Vastustajat** | huilu, oboe, englannintorvi, tuubat, fagotit, pasuunat, lautaset | **Mustaa mustetta.** Tippoja ja pisteitä (staccato) sekä suolla **soitinten muotoiset olennot** Porterin järjestyksessä: huiluhyttynen, oboesorsa, englannintorvihaikara, tuubakotilot (Dehring, kvintin päässä), fagottisammakot ja pasuunavarikset. Venytys ja litistys vain niille. Yhdessä ne ovat sameus. | Jokaisella yksi ele fraasin verhokäyrän mukaan. Lähikuvissa, ja sankari näkyy samassa kuvassa. |
| **Maailma** | säestys | berliininsiniset paperitasot: taivas, vuoret, keskimaisema, maa, etuala *(T 7)* | Taustat elävät hienovaraisesti: vuorten rasteri hengittää dynamiikan mukaan, usvat liukuvat jousten mukaan, taivas seuraa rekisteriä. Yksi tuuli. |
| **Selkäkuva** | kuuntelija | sankari selkä kameraan | A-puolella kahdesti: `held_alku` ja `held_dom7`. Lisäksi kaksi hahmoa kuun alla `gef_jalkihehku`. |

### Muste elää musiikin mukana *(T 18)*

| Musiikki | Muste | Missä |
|---|---|---|
| legato, pitkä fraasi | yksi siveltimenveto, leveys paineesta, kasure fraasin lopussa | teemaviiva, viiri |
| staccato | tippoja | vastustajat |
| kirjoitettu isku | yksi läiskä tai punainen leima iskun ruudulla, jälki jää friisiin | luku 4 |
| crescendo | vedot sulautuvat massaksi | nousut, huiput |
| tremolo | märkä reuna värisee | patarummun tremolot |
| harpun glissando | muste levittäytyy veteen renkaina | joki, kuutamo |
| hiljaisuus | muste kuivuu, paperi jää tyhjäksi | yleistauko, tyven |

Raja: koko kuva ei läikähdä jokaisessa äänessä. Iskun tekee yksi läiskä, ja liike seuraa fraasia.

### Teemaviiva: melodia tarkasti

Kun melodia tuodaan esiin, viiri jättää friisiin viivan, joka seuraa sävelkorkeutta puolen
puolisävelaskeleen tarkkuudella *(T 18)*. Ylös on korkea *(T 7)*. Tärkein on **sankariteema
alussa**: muoto partituurista (käyttäjän lupa 30.10.2026), tarkka sävelkorkeus ja ajoitus äänestä
(`analysis/teemaviiva.py`). Teemaviiva näytetään kohtauksissa 1–2, 17 (paluu), 33 (molli), 35
(muisto) ja 56 (huippu). Muualla viiri liehuu tuulessa, eikä se väitä olevansa melodia.

---

## 3. Kohtaukset

Paikat: **A** levy, **B** aamunkoiton laakso ja harjanne, **C** mielikuvituksen joki, **D** kukkula,
**E** kultainen niitty, **F** ylätasanko ja putous, **G** myrskyvuori, **H** suo, **I** metsäaukio
ja kuutamojoki, **J** taistelukenttä. Paikat B–H ovat torviritarin ja purjeen koodissa valmiina.

Sarakkeet: #, ankkurit, kesto, musiikki (kuunteluoppaasta), kuva, kamera ja muste.

### Kehys: neula (0:00–0:07.6)

| # | Ankkurit | Kesto | Musiikki | Kuva | Kamera, muste |
|---|---|---|---|---|---|
| 0 | alku → `held_alku` | 7,6 s | neula laskeutuu noin 3 s, sisäänajoura | Kermapaperi, jonka rakeisuus värähtelee rahinan tahtiin. Oikealla haalea lyijykynäluonnos vuorista. Nimiö painuu paperiin ja haalistuu (poikkeus: vedoksen nimiö). *(T 12.1)* | lepää, alkaa liukua |

### Jakso 1: Sankari (Der Held), A 0:07.6–3:59.2. Aamunkoi → aamu → myrsky

**Muutos 30.10.2026 (käyttäjän palaute renderistä):** kohtaukset 6–12 tapahtuvat purjeen avomerellä
(`visual/muste/loc_sea_muste.js`): mielikuvitus on tiiroja vaahdosta, laivasto liittyy `held_t34`:ssä,
ja ensimmäinen huippu on aallon harja. Joki ja kukkula (pääskyt, laukka) poistuivat, samoin niiden
mukana kulkeneet keksityt viittaukset (liekki, narrinlakki, tuulimylly). Ritari seisoo laivan
keulassa, eikä hän ole laiva.

Yksi teema 116 tahtia tauotta, joten kuva ei leikkaa kovasti: paikasta toiseen siirrytään viirin
kärkeä seuraten. Neljä aaltoa nousevat yhä korkeammalle, ja jokaisen huipulla kamera on korkeammalla
ja kuva laajempi. *(T 11, 12)*

| # | Ankkurit | Kesto | Musiikki | Kuva | Kamera, muste |
|---|---|---|---|---|---|
| 1 | `held_alku` → `held_isku_t6` | 10 s | Sankariteema alkaa matalalta: käyrätorvi, alttoviulut ja sellot unisonossa, Es-duuri, harppoo ylös. Viulut tauolla. | **Ensimmäinen veto.** Tyhjälle paperille piirtyy yksi punainen siveltimenveto, joka on teemaviiva: Es2:sta ylös kolmisointua, ja jokainen harppaus näkyy samassa suhteessa. Veto alkaa laakson pohjasta (maa) ja nousee. Vedon päässä kokoontuu **selkäkuva 1**: ritari seisoo laakson pohjalla selkä meihin, ja viiri on vedon jatke hänen keihäässään. | matala, nousee vedon mukana; muste mf-paineella, paine kasvaa teeman aksenteissa |
| 2 | `held_isku_t6` → `held_viulut` | 5,4 s | f-sointuiskut T. 6 ja 8: kaikki 8 käyrätorvea, fagotit, kontrabassot | Teemaviiva jatkuu. Iskuissa seitsemän pientä punaista viirinkärkeä napsahtaa harjanteen takaa (luku 4). | nousee |
| 3 | `held_viulut` → `held_vasket_t13` | 8,4 s | Viulut ensimmäistä kertaa (23.1), teema T. 9; isku T. 11 | **Kun jouset liittyvät, vuoret painautuvat berliininsinisellä** *(T 12.2)*. Ritari kääntyy sivuprofiiliin ja nostaa keihään pystyyn. Ensimmäinen säde välähtää viirin kärjessä. Taivaalle syttyy tuulen viivoitus (viulut). | nosturi ylös |
| 4 | `held_vasket_t13` → `held_intro_loppuu` | 8,0 s | Trumpetti, pasuunat, tuuba ja patarummut ensimmäistä kertaa; nousu ff:ään | **Auringonnousu korkeimmassa paikassa:** aurinko nousee harjanteen korkeimman huipun takaa, ja ritari on etualalla pienenä sitä vasten. Heraldiset viirit kohoavat harjanteen takaa (vasket). Patarummun lyönnit pöllähdyttävät harjanteen juuren viivoitusta. | laajenee; aurinko on yksi punainen taso |
| 5 | `held_intro_loppuu` → `held_lyyrinen` | 8,4 s | Käyrätorvet ff matalalla teemassa, trumpetit p toistuvin soinnuin, I viulut tauolla; `held_viulut_paluu`: juoksutus | **Toverien siluetit nousevat harjanteelle** vastavaloon: kahdeksan käyrätorvea näkyvät tummina hahmoina ja viireinä, eivät vielä lähikuvassa (säästetään `held_reh8`:aan). Viirit värisevät trumpettien soinnuissa (mitattu trumpettikanava). Puuskassa kaikki viirit nousevat samaan suuntaan. | matala edestä → sivuajo rivin ohi |
| 6 | `held_lyyrinen` → `held_t25` | 8,0 s | Puupuhaltimet ja 2 harppua **ensimmäistä kertaa**; lyyrinen vastateema H-duuri; patarummun tremolo pp | **Mielikuvitus:** rasteriliukuma joelle. Pääskyparvi syntyy kaislikosta (puupuhaltimet), ja harppujen arpeggiot ovat välkerenkaita joen pinnassa. Ritarin viiri aaltoilee rannalla pehmeästi. Tremolo värisyttää sumun viivoitusta. | lento parven mukana |
| 7 | `held_t25` → `held_t31` | 11,7 s | Englannintorvi, klarinetit ja oboet virtaavina kuvioina; käyrätorvet I–II laulavat; pizz | Pääskyparit liitävät veden pinnassa (kaksi kuviota). Pilvet ajelehtivat puupuhaltimien kuvioiden mukaan ilman esittäviä muotoja (lainauksia ei keksitä). | pehmeät kaaret |
| 8 | `held_t31` → `held_t34` | 5,5 s | pp: harput ja juoksutukset palaavat; käyrätorvet espressivo | Uusi aalto: renkaat ja tuuli. Ritari nousee ratsaille rannalla. | laskeutuu rannalle |
| 9 | `held_t34` → `held_reh4` | 5,8 s | Huilut ja koko käyrätorviryhmä f, harput; T. 36 ff | **Laukka kukkulaa kohti.** Ritari ratsastaa yksin, ja toverien siluetit seuraavat kaukana. Kavioiden pöllähdykset tulevat käyrätorvien f-fraaseista (mitattu käyrätorvikanava), eivät patarummuista, joita oppaassa ei ole. Viiri liehuu tuulen suuntaan. | sivuajo laukan rinnalla |
| 10 | `held_reh4` → `held_huippu1` | 9,4 s | p, uusi kasvu; oboeiden, englannintorven ja viulujen sforzandot | Rinne. Oboeiden, englannintorven ja viulujen sforzandot ovat pääskyjen syöksyjä ja tuulen puuskia (sama soitin on sama hahmo), ja viiri kiipeää portaittain. | nousee rinnettä |
| 11–12 | `held_huippu1` → `held_t47` | 9,9 s | Crescendo huippuun; `held_reh5_isku`: ff-sointu, käyrätorvi I arpeggio; `held_huippu1_kohta`: **ensimmäinen huippu** (vahvistettu), massiivinen ja matala | **Lähikuva, joka vetäytyy yhtenä liikkeenä laajaan:** `held_reh5_isku`:ssa ritari nostaa kellonsa soittoasentoon, ja liike kestää fraasin ajan. Crescendon aikana hevonen nousee hitaasti takajaloilleen (fraasin mittainen liike, ei isku). Iskun elementti huipussa on maa, joka kohoaa, ja aurinko, joka murtautuu pilvestä. Oikealle on piirtynyt huipun luonnos. | lähikuva → laaja ja matala, hidastuu |
| 13 | `held_t47` → `held_t49` | 4,2 s | Huilu ja englannintorvi pienin soolokuvioin (f); `held_tunnelma_vaihtuu`: myrsky laantuu kirkkaaksi | Rasteriliukuma **kultaiseen niittyyn** (valo paperinvaalea, ei kultaa). Kaksi pääskyä (huilu ja englannintorvi) leikkii ritarin ympärillä. | leijuva |
| 14 | `held_t49` → `held_reh6` | 6,2 s | pp ausdrucksvoll: huilu ja I viulut laulavat, harput, patarummun tremolo pp | Ritari polvistuu puron äärelle. Huilu ja viulut laulavat ohuina viivoituksina taivaalla, ja heinät värisevät tremolossa. Ritarin viiri lepää. | hyvin hidas lähestyminen |
| 15 | `held_reh6` → `held_t61` | 17,9 s | Käyrätorvet I–II laulavat ausdrucksvoll, alttoviulun soolo, klarinetti | **Hän hajoaa vedoiksi.** Kun käyrätorvet laulavat, viiri ja hahmo juoksevat friisiin: kaksi punaista vetoa laulaa rinnakkain paperilla (käyrätorvet I–II), ja alttoviulu on sininen katkoviivoitus niiden välissä. Katsoja oppii, että vedos on sankarin sisäinen ääni. | lähellä, sivuajo friisiä |
| 16 | `held_t61` → `held_reh8` | 14,6 s | Crescendo matalalta: käyrätorvet f marcato, sellot ja bassot; huilusoolo | **Vedot kokoontuvat** takaisin ritariksi, joka marssii ylätasangolle. Vuoret kohoavat matalien jousten mukana. | nousee maan tasalta |
| 17 | `held_reh8` → `held_reh9` | 13,7 s | **ff-tutti:** 8 käyrätorvea teemassa, trumpetit, pasuunat, tuubat, kaikki jouset | **Koko joukko näkyy ensimmäistä kertaa lähikuvassa** tasangolla, kellot ylhäällä. Teemaviiva palaa friisiin kohtauksen 1 kaarena, nyt leveänä (paluu, *T 4*). | matala → laaja |
| 18 | `held_reh9` → `held_reh10` | 16,3 s | ff-tutti; sankariarpeggiot fagoteissa, käyrätorvissa, selloissa | **Viirien portaat:** `aksentit.json`:n iskut harjoitusnumeron 9 ympärillä (ensimmäinen osuu kohtauksen 17 loppuun) avaavat vuorotellen kolmen ritarikolmikon viirit. | sivuajo joukon ohi |
| 19 | `held_reh10` → `held_reh11` | 9,5 s | fff-tutti, ei patarumpuja **[tarkista]** | Kaikki liikkeessä: tuuli, viirit ja vuoret. Myrskyvuori ja sädekehän luonnos näkyvät kaukana. Kohdistus alkaa liukua (jännite). | laaja, korkealla |
| 20 | `held_reh11` → `held_reh12` | 18,5 s | Puupuhaltimet juoksutuksin, 2 harppua fff alas ja glissando, patarummun tremolo **[tarkista]** | **Putous** ryöppyää kallion lovesta. Puupuhaltimien juoksutukset liikuttavat putouksen viivoitusta jatkuvasti, ja ryöppy tulee vain harppujen glissandoissa ja kirjoitetuissa aksenteissa. Muste levittäytyy veteen renkaina. | seuraa putousta alas → ylös |
| 21 | `held_reh12` → `held_isku1` | 14,4 s | ff-tutti patarumpuineen **[tarkista]** | **Myrsky:** pilvet vyöryvät, sade on viivoitusta tuulen suuntaan. Joukko kiipeää rinnettä tasaisesti. | sivuajo sateessa |
| 22 | `held_isku1` → `held_dom7_sointu` | 15,6 s | **Neljä kohtaloiskua:** ff-sointu ja tremolo katkeavat, kohotahti-isku lyö | **Salamat:** jokaisessa iskussa salama lyö rinteeseen joukon edellä yhä lähemmäs huippua, ja neljäs osuu huippuun. Salama on paperin leikkaus (paperinvalkoinen siksak mustalla ääriviivalla), ei hehku. Katko ennen iskua on sisäänhengitys: sade ja tuuli hiljenevät, liike ei. Kukaan ei loikkaa. | yksi jatkuva nosturiajo |
| 23 | `held_dom7_sointu` → `held_dom7` | 10,2 s | Pasuunat ja tuubat fff, pitkä dominanttiseptimi; patarummun molto cresc. | **Selkäkuva 2 ja sädekehä:** ritari seisoo huipulla, pitää viiriä molemmin käsin, ja hänen edessään leimahtaa taivaalle **sädekehä** (LP-kannen sädekehä uudelleen tulkittuna): jokainen säde on yksi taajuuskaista. Aurinko on jo korkealla pilvien takana, eikä se nouse toista kertaa. Pilvet ovat auenneet. Laatat ovat kauimpana kohdistuksesta. *(T 12.5)* | hyvin hidas lähestyminen |
| 24 | `held_gp` → `wid_1_huilu` | 3,8 s | **Yleistauko**, ainoa pitkä hiljaisuus | Säteet sammuvat. Painaminen pysähtyy, ja paperi nousee kuvan yli. Vain levyn rahina välkehtii pölynä. *(T 12.6)* | liukuu |

### Jakso 2: Vastustajat (Des Helden Widersacher), A 4:03.0–7:02.0. Aamupäivän sameus suolla → voitto

Kamera on rauhallinen, ja olennot ovat levottomia *(T 11)*. Yksi lavastus: ritari istuu suon rannalla
kuolleen puun juurella, hevonen kahlattuna, viiri nojaa puuhun. Olennot tulevat omilla ankkureillaan ja
jäävät kuvaan kuoroon asti. Lähikuvat saavat huilu, Dehring ja Quijote-peili.

| # | Ankkurit | Kesto | Musiikki | Kuva | Kamera, muste |
|---|---|---|---|---|---|
| 25 | `wid_1_huilu` → `wid_2_oboe` | 3 s | Huilu I "sehr scharf und spitzig" yksin korkealla; levyllä hyvin hiljainen | **Suo aamupäivän sameudessa** *(T 5, Runge)*: taivas on mustaa ja punaista rasteria, kuolleet puut. **Huiluhyttynen** laskeutuu ylhäältä ja osoittaa pistimellä ritaria. Ensimmäinen sävel on musta pisto paperiin. Laatat jäävät epäkohdistukseen. | lähikuva: hyttynen ja ritari |
| 26 | `wid_2_oboe` → `wid_3_4` | 4 s | Oboe "schnarrend" keskirekisterissä | **Oboesorsa** kaislikossa, kaksoislehdykkä nokkana käy fraasin mukaan. | lavastus |
| 27 | `wid_3_4` → `wid_dehring1` | 2 s | Pikkuhuilu, englannintorven kromaattinen nousu; lautaset **[tarkista]** | **Englannintorvihaikara** kävelee paalulta paalulle ylöspäin. Lautaset: musta roiske, jos ne kuuluvat. | lavastus |
| 28 | `wid_dehring1` → `wid_6` | 7,0 s | Tenori- ja bassotuuba p: "Dok-tor Deh-ring" (4:18.6 asti) | **Lähikuva: Dehringin tuubakotilot** kahdella kivellä rinnakkain, oikea täsmälleen kvintin (3:2) korkeammalla. Kellot kääntyvät yhtä aikaa. Ritari takana. | lähikuva |
| 29 | `wid_6` → `wid_7_8` | 3 s | Oboe ja Es-klarinetti korkealla **[tarkista]** | Sorsa palaa kiihtyneenä: nokka käy nopeammin, tippoja ympärillä. | lavastus |
| 30 | `wid_7_8` → `wid_9_pasuunat` | 3,5 s | Englannintorvi ff ja 2 fagottia ff **[tarkista]** | **Rasterikarikatyyri** *(T 10, vastustaja 7)*: sankarin viiri painuu lammen pintaan karkeina pisteinä, ja ritarin heijastus venyy laihaksi (tulkinta: *Don Quixote* on teoksen sisarteos, Porter ja taustatutkimus). Peili on veden alla, ei hahmon päällä. **Fagottisammakot** kyyristyvät tukilla. | vedenpinnan tasolta: peili ja ritarin reaktio samassa kuvassa |
| 31 | `wid_9_pasuunat` → `wid_kuoro` | 6,5 s | 3 sordinoitua pasuunaa ff, trilli; tuubat | **Pasuunavarikset** laskeutuvat kuolleeseen puuhun soinnun ruudulla, vetoputkinokat työntyvät. Leimasimen tahra (luku 4). | lavastus |
| 32 | `wid_kuoro` → `wid_sankari_molli` | 12,9 s | Arvostelijat yhteen ääneen mf (4:32–4:35; sen jälkeen opas tyhjä **[tarkista]**) | **Sameus:** musta rasteriusva sakenee suon yllä, ja kaikki olennot ovat kuvassa. Kuoron jälkeen usva ohenee ennen mollia. | laaja, rauhallinen |
| 33 | `wid_sankari_molli` → `wid_reh16` | 7,6 s | Sankariteema mollissa: fagotit pp, bassoklarinetti, käyrätorvet V–VI, sordinoidut matalat jouset | **Tummana ja hiljaa:** ritari painaa kypäränsä, ja viiri painuu puuta vasten. Teemaviiva piirtyy friisiin mollissa, puoliksi rasteroituna ja mustalla päällepainettuna *(T 10)*. | lähikuva: kypärä painuu |
| 34 | `wid_reh16` → `wid_reh17` | 12,7 s | Käyrätorvet V–VIII pp toistuvin soinnuin, alttoviulut sfz | Tumma viiri hengittää hitaasti. Olennot vaikenevat ja kuuntelevat. | hidas |
| 35 | `wid_reh17` → `wid_uusi_hyokkays` | 62 s | I viulut sordinoituina G-kielellä "mit Steigerung"; jouset aaltoina **[tarkista]** | **Muisto (tulkinta).** Usva ohenee, ja tyynen lammen pinnassa näkyy **aamun auringonnousu** (kohtaus 4) ylösalaisin. Se kasvaa aalto aallolta: jokainen jousten aalto (mitattu jousikanava; jaksorajat eivät ole ankkureita) lisää yhden osan: harjanne, aurinko, viirit. Samalla ritari nostaa päätään, ja viirin tumma rasteri vaalenee kerros kerrokselta. Olennot väistyvät reunoille. Kolme ottoa, eikä sommitelma pysy paikallaan. | pitkät hitaat otot; muste palaa väriin; ei kuuta (kuu kuuluu duettoon) |
| 36 | `wid_uusi_hyokkays` → `wid_reh20` | 13,3 s | Pikkuhuilu, huilu, oboet, englannintorvi ja Es-klarinetti ff; tuubat, sordinoidut pasuunat | **Uusi hyökkäys:** olennot parveilevat takaisin ja piirittävät ritarin. Kamera pysyy, ja olennot kiertävät. Tipat roiskuvat. | ylhäältä, loivasti, paikallaan |
| 37 | `wid_reh20` → `wid_sankari_nousee` | 11,2 s | Oboet ja fagotit ff, kaikki 8 käyrätorvea espressivo, tuubat, lautaset "zischend" | **Toverien siluetit nousevat kaukaiselle harjanteelle** (kahdeksan käyrätorvea). Lautasten roiske lammessa (luku 4). | lähenee |
| 38 | `wid_sankari_nousee` → `wid_voitto` | 16,5 s | Jouset f; käyrätorvet tulevat (opas 6:41.4; mitattu käyrätorvikanava) | **Ritari nousee**, nostaa keihään pystyyn, ja viiri leimahtaa täyteen sinooperiin, kun käyrätorvet tulevat. Tuuli palaa. | sammakkoperspektiivi (1/2) |
| 39 | `wid_voitto` → `gef_viulu` | 13,8 s | Vasket ff (huippu 0,96): sankari ajaa vastustajat pakoon ja puhkeaa pieneen voitonhymniin | **Pieni voitto:** ritari pyyhkäisee viirillä yhden leveän punaisen vedon suon yli, ja olennot hajoavat tippoina kaislikkoon. Sameus väistyy. Toverit vastaavat harjanteelta. Taivas lämpenee iltaruskoksi, ja viiri johdattaa metsäaukiolle. | laajenee |

### Jakso 3: Kumppani (Des Helden Gefährtin), A 7:02.0–18:45.7. Ilta → yö, metsäaukio ja kuutamojoki

Dialogi: viulu puhuu, sankari vastaa. Leikkaus on vastaotto. **Viulu → vedos:** kumppanin
musteeton viiva piirtyy iltataivaan siniseen laveeraukseen ja seuraa viulun sävelkorkeutta.
**Sankari → maailma:** ritari aukiolla ja hänen reaktionsa. Kun kumppani soi, tausta ei koskaan ole
paperinvaalea *(T 10)*. Mielialat tulevat oppaasta (viisi kohtauksessa 44) ja muualla mitatuista
piirteistä (tulkinta): hidas ja koristeellinen = teeskennelty kaipaus, hyppivä = iloisuus,
katkeileva = kevytmielisyys, hiljainen legato = hellyys, terävät aksentit = sarkasmi, hyvin nopea
= riehakkuus.

| # | Ankkurit | Kesto | Musiikki | Kuva | Kamera, muste |
|---|---|---|---|---|---|
| 40 | `gef_viulu` → `gef_vastaus1` | 12,5 s | Sooloviulu pp, harppu; ohut | **Viiva saapuu:** metsäaukion sininen iltataivas, ja siihen leikkautuu paperinvalkoinen viiva viulun melodian mukaan. Ritari laskee viirinsä lepoon aukion laidalla: ele on vastaanotto. | hidastuu; viiva on poissaolo, ei muste |
| 41 | `gef_vastaus1` → `gef_viulu2` | 7 s | Käyrätorvet ja patarumpu mp | **Vastaotto:** ritari nostaa kellon ja vastaa lyhyesti, hieman kömpelösti. Kypärä laskee. | puolikuva |
| 42 | `gef_viulu2` → `gef_vastaus2` | 30 s | Viulu ja harppu pp; matalat jouset vuorottelevat | **Keskustelu:** viiva kysyy taivaalla ja ritarin viiri vastaa maassa. Viiva nousee kuin kysymys. | vastaotot |
| 43 | `gef_vastaus2` → `gef_mielialat` | 46,5 s | Sellot, bassot ja harppu mp (H-duuri); 7:59–8:38 opas tyhjä **[tarkista]** | Ritari kävelee aukion yli joen rantaan. Harppu välkkyy joen pinnassa. Viiva painetaan vain, kun viulu soi (mitattu viulukanava). | hidas sivuajo |
| 44 | `gef_mielialat` → `gef_vastaus3` | 87 s | Pitkät sooloviulujaksot pp; viisi mielialaa: teeskennelty kaipaus, iloisuus, kevytmielisyys, hellyys, sarkasmi; 9:41.5–10:05 tyhjä **[tarkista]** | **Siilin piikit.** Viiva vaihtaa luonnettaan mitatuissa jaksorajoissa; oppaan mielialajärjestys on tulkinta, ja mieliala valitaan jakson mitatuista piirteistä (johdannon taulukko). Ritarilla on jokaiseen mielialaan yksi ele: kaipauksessa hän kallistaa kypäräänsä, iloisuudessa viiri heilahtaa, kevytmielisyydessä hän astuu askeleen taakse, hellyydessä nostaa päänsä, ja sarkasmin siksak pistää viiriä, jolloin hän hätkähtää. Edellinen mieliala jää friisiin haalistuen. | kuva viivan korkeudella, ritari alareunassa |
| 45 | `gef_vastaus3` → `gef_kiihkea` | 16,5 s | Käyrätorvet ja bassot mf, B-duuri | Ritari vastaa painokkaasti: kello ylös, viiri nousee viivan alle. | puolikuva |
| 46 | `gef_kiihkea` → `gef_puupuhaltimet` | 16 s | Viulu kiihkeänä, nopeita kuvioita (3,2/s) | Viiva kiihtyy koukeroiksi taivaalla kehyksen sisällä. | seuraa viivaa |
| 47 | `gef_puupuhaltimet` → `gef_leimahdus` | 51 s | Puupuhaltimet etualalla: arvostelijoiden kaiku vai kumppanin pistely? **[tarkista]**; 10:54–11:28.5 tyhjä | Kysymys jätetään auki: puupuhaltimet painetaan sinisinä pisteinä keskikolmannekseen, eivät mustina, jolloin ero vastustajiin näkyy. Ritari kääntää päätään ääniä kohti. Viiva jatkuu, kun viulu soi. | hidas |
| 48 | `gef_leimahdus` → `gef_lustig` | 13,5 s | Käyrätorvet ja vasket mf → f | **Sankari leimahtaa:** viiri täyteen sinooperiin, ja ritari astuu askeleen eteen. Viiva vetäytyy siksakiksi. | laajenee |
| 49 | `gef_lustig` → `gef_rauhoittava` | 27 s | Viulu hyvin nopeana ja korkealla (5,2 ääntä/s) **[tarkista]**; 11:57.5–12:09 tyhjä **[tarkista]** | **Riehakkuus:** suuret koukerot korkealla. Ritari laskee keihään ja katsoo ylös. | seuraa |
| 50 | `gef_rauhoittava` → `gef_viulu3` | 23 s | Matalat jouset ja harppu p **[tarkista]** | **Rauhoittava fraasi:** ritari polvistuu ja ojentaa kätensä matalalla, kämmen ylöspäin, viivaa kohti. Viiri laskeutuu pehmeänä. | lähikuva kädestä |
| 51 | `gef_viulu3` → `gef_rakkaus` | 50 s | Viulu ja harppu vuorottelevat orkesterin kanssa, p | **Viiva astuu vedoksesta maailmaan** (tulkinta; tyyli tuntee kumppanin viivana, ja tämä laajentaa sitä). Valkoinen viiva irtoaa taivaalta, taittuu ja seisoo aukiolla: kumppani on yhä yksi jatkuva viiva, joka piirtää hoikan hahmon ääriviivan ilman siluettia tai kasvoja, ja hänen helmastaan viiva piirtyy edelleen. Aurinko laskee. | hidastuu; jakson tärkein kuva |

**Rakkausduetto** (yö, sininen ja musta; kuutamojoki)

| # | Ankkurit | Kesto | Musiikki | Kuva | Kamera, muste |
|---|---|---|---|---|---|
| 52 | `gef_rakkaus` → `gef_rakkaus_hiljaa` | 30,5 s | Ges-duuri cantabile, koko orkesteri f, harpun glissandot | **Kuutamojoki:** kaksi hahmoa astuu pieneen veneeseen (tulkinta), ja vene liukuu joelle. Harpun glissandot ovat kuunvalon paperinvalkoisia väreitä tummassa vedessä. Viiri ja kumppanin viiva **kietoutuvat punokseksi** maston päällä tuulessa. *(T 4, 11)* | hidas lähestyminen |
| 53 | `gef_rakkaus_hiljaa` → `gef_hiljenee` | 44,5 s | Harppu ja viulu mp, lämmin mf (opas 14:06) | Kahden kesken: vene kulkee hitaasti, ja punos kiertää väljinä silmukoina. Lämmin mf leventää viiriä ja tihentää silmukoita. Heijastus vedessä on katkoviivoja. | melkein pysähtyy |
| 54 | `gef_hiljenee` → `gef_kolkutus` | 31 s | pp, sitten `gef_nousu`: jouset ja harppu pp → mf | pp: punos ohenee viivan paksuiseksi. Nousussa molemmat levenevät. Vene kääntyy hitaasti virrassa, ja kamera ei kierrä. | leijuu |
| 55 | `gef_kolkutus` → `gef_huippu` | 12 s | Puupuhaltimet ja matala vaski hiljaa **[tarkista]** | **Vastustajat ovella:** olentojen siluetit kurkistavat kaislikosta joen rannalla, ja punos kiristyy suojaksi. Ne eivät pääse veneeseen. | pysyy |
| 56 | `gef_huippu` → `gef_sankari_hiljaa` | 28,5 s | Nousu p → f, huippu noin 15:30; sankarin teema palaa | **Purppura (1/2):** huipulla punoksen kohtaamiskohta painetaan omalla purppuralaatalla muutamaksi sekunniksi, eikä purppura leviä laajaksi pinnaksi (säästäminen). Teemaviiva palaa friisiin. | nousee hiukan; liioittelu sallittu |
| 57 | `gef_sankari_hiljaa` → `gef_jalkihehku` | 31,5 s | Käyrätorvet hiljaa f → mp, Fis/Ges; `gef_aalto`: vielä aalto mf | Sankari hellänä: viiri lepää, ja purppura haalistuu muutamassa sekunnissa. Vene saavuttaa rannan. | hidas |
| 58 | `gef_jalkihehku` → `gef_arvostelijat_uni` | 96 s | pp, käyrätorvet hiljaa (opas 16:20, 16:45, 17:05, 17:14.5), harppu: jälkihehku, yö | **Kaksi hahmoa selkäpuolelta katsomassa kuuta** (Friedrich, *T 7*). Jokainen hiljainen käyrätorvikutsu (mitattu kanava) painaa horisonttiin pienen punaisen kaaren. Kuu on paikallaan, mutta joen virta ja käyrätorvikaaret kuljettavat kuvaa. Kolme hidasta ottoa: laaja, kaksi hahmoa, taivas. | pitkät otot, liike ei pysähdy |
| 59 | `gef_arvostelijat_uni` → `gef_hiljaisuus` | 25,6 s | Puupuhaltimet pp: arvostelijoiden katkelmat "unisessa hiljaisuudessa" | Muutama musta tippa syttyy tähtien joukkoon ja sammuu. Kumppani nojaa ritariin (muodot liittyvät, ei syleilyä). | hidas |
| 60 | `gef_hiljaisuus` → `wal_kulissi1` | 23,7 s | Lähes hiljaisuus: tyyntä myrskyn edellä | Yö haalistuu paperiksi, ja muste kuivuu. Ritari nousee seisomaan (ennakointi). Horisonttiin piirtyy kolmen viirin luonnos. *(T 13.7)* | liukuu |

### Jakso 4: Taistelu (Des Helden Walstatt), alku A 18:45.7–20:23.7. Musta ja tulenpunainen kenttä

| # | Ankkurit | Kesto | Musiikki | Kuva | Kamera, muste |
|---|---|---|---|---|---|
| 61 | `wal_kulissi1` → `wal_vastaus` | 19,3 s | Kaukainen trumpettifanfaari hiljaa ja korkealta | **Kolme kulissitrumpettia ovat kolme viiriä horisontissa:** musta, valkoinen ja punainen, samassa tuulessa. Ritari ja kumppani kääntyvät katsomaan. *(T 11)* | kaukana |
| 62 | `wal_vastaus` → `wal_kulissi2` | 19,3 s | Orkesteri vastaa f, hiipuu; hiljaisuus 19:20–19:24.3 | Ritari nousee ratsaille, ja viiri vastaa. Kenttä painuu esiin puupiirroksena (Dürer). Hiljaisuudessa friisiin jää valkoinen aukko. | lähestyy |
| 63 | `wal_kulissi2` → `wal_taistelu` | 8,2 s | Trumpettikutsu uudelleen | Kolme viiriä lähempänä. Kumppanin viiva nousee ritarin rinnalle. | lähestyy |
| 64a | `wal_taistelu` → jaksoraja (opas 19:39.5) **[tarkista; myös jakson 4 raja]** | n. 7 s | Patarummut f, 3/4 | **Kenttä mustana ja tulenpunaisena.** Patarummun lyönnit pöllähdyttävät kentän viivoitusta, ja ritari ratsastaa kentälle. | lähestyy |
| 64b | jaksoraja → `wal_puolenvaihto` | n. 44 s | Trumpetit ja virvelit, 3/4, kasvu f:ään; trumpettien huudot ovat vastustajien teeman bisarri muunnelma | **Taistelu alkaa, haboku-myrsky:** olennot tulevat joukkoina mustina läiskinä, trumpettien huudot ovat mustia kiiloja (vastustajien teeman muunnelma **[tarkista]**) ja virvelit tiheää pisteviivoitusta. Salamat lyövät (paperin leikkauksia) mitatuissa iskuissa. Ritari pysyy koossa ja lyö viirillä fraaseittain; repeäminen vedoiksi säästetään B-puolen huippuun *(T 18)*. Kumppanin viiva näkyy vain, jos mitattu viulukanava soi. Kohdistus hajoaa. Vain kuullut äänet painetaan. | **sukeltaa friisin sisään kerrosten läpi** (kehittely), enintään 20 °/s |
| 65 | `wal_puolenvaihto` → loppu 1240 s | 16,3 s | A-puoli katkeaa kesken taistelun (20:23.7) | **Sivun kääntö:** kamera vetäytyy, kenttä kiertyy levyn uraksi ja syntyy A-levy, jonka renkaat ovat väripartituuri ulkoa sisään: aamunkoi, sameus, iltarusko, yö, taistelun musta ja punainen. Levy pyörii hitaasti. Ensō säästetään B-puolen loppuun. | vetäytyy |

---

## 4. Iskut: elementti pärähtää, liike jatkuu *(T 8, 18)*

Iskun tekee yksi elementti, ei hahmon keho eikä koko kuva. Elementti näkyy ensimmäisellä ruudulla,
joka alkaa aikaisintaan 33 ms ennen ääntä. Ajat tulevat `aksentit.json`:sta ja teemakartasta.

| Ankkuri | Soittimet | Elementti |
|---|---|---|
| `held_isku_t6`, `_t8`, `_t11` | 8 käyrätorvea, fagotit, kontrabassot f | Seitsemän viirinkärkeä napsahtaa harjanteen takaa tuuleen ja painuu hitaasti. Ritari ei pompi. |
| `held_viulut` | viulut | säde välähtää viirin kärjessä |
| `held_vasket_t13`, patarummut | patarummut | harjanteen juuren viivoitus pöllähtää |
| `held_reh4`-sforzandot | oboet, englannintorvi, viulut | kavioiden pöllähdykset |
| `held_reh5_isku` | ff-sointu | kello nousee soittoasentoon (fraasin mittainen liike, ei nykäys) |
| `held_huippu1_kohta` | ff-tutti | hevonen nousee takajaloilleen, aurinko murtautuu esiin |
| `held_reh9`, iskut `aksentit.json`:sta | ff-tutti | kolmen ritarikolmikon viirit avautuvat |
| `held_reh11`, aksentit ja harppu | puupuhaltimet, harput | putouksen ryöpyt ja renkaat |
| `held_isku1`–`4` | ff-kohotahti | **salama** paperin leikkauksena, yhä lähempänä huippua, neljäs osuu huippuun; katkossa sade ja tuuli hiljenevät |
| `held_dom7` | sointu katkeaa | säteet sammuvat paperiin |
| `wid_1_huilu` | huilu | musta pisto |
| `wid_9_pasuunat` | sordinoidut pasuunat | leimasimen tahra |
| `wid_reh20_lautaset` | lautaset | musta roiske lammessa |
| `wid_voitto` | vasket ff | viirin leveä punainen pyyhkäisy suon yli |
| taistelun aksentit | tutti, patarummut | salama tai läiskä, ritari kokoontuu lyömään |

## 5. Kamera *(T 6, 8, 11, 18)*

- Esittelyssä kamera kulkee eteenpäin sankarin rinnalla. Jaksossa 1 ei kovia leikkauksia: paikasta
  toiseen siirrytään viirin kärkeä seuraten tai rasteriliukumana.
- Nousujen huipuilla (kohtaukset 4, 12, 19, 23) kamera on edellistä korkeammalla ja kuva laajempi.
- Vastustajissa kamera on rauhallinen, ja hahmot ovat levottomia. Lähikuvat olennoista ritarin kanssa.
- Kumppanissa vastaotot. Duetossa liike melkein pysähtyy, mutta ei pysähdy.
- Taistelussa kamera sukeltaa kerrosten läpi. Puolenvaihdossa vetäytyy.
- Kameran nopeus tulee fraasin verhokäyrästä ja tasoitetusta voimakkuuden muutoksesta, ei BPM:stä.
- Enintään 20 °/s, ei kallistusta, kieppumista eikä tärinää. Mikään elementti ei välky (`jatkuvuus.py`).
- Lähikuvat sankarista ilman kasvoja: kello (11, 41, 45), kypärä painuu (33), käsi (50), kädet
  keihäällä (23).

## 6. Mitä visualisointeja tarvitaan

| Valmiina (torviritari, purje, vedos) | Uutta |
|---|---|
| laakso, joki, kukkula, niitty, tasanko ja putous, myrskyvuori, suo, meri | **siveltimenveto** (leveys paineesta, kasure, nijimi-reuna rasterina), **teemaviiva** `teemaviiva.py`:stä |
| ritari, hevonen, toverit, pääskyt, soitinolennot, heijastukset | **sankari vedoista**: hahmo, joka hajoaa friisiksi ja kokoontuu (vetojen vastaavuus, curl-virtaus) |
| sädekehä, levy, salama (torviritari), viirit yhdessä tuulessa | **kumppanin valkoviivahahmo** ja musteeton viiva sinisessä laveerauksessa |
| iskut, kohtaustarkistus, kameratarkistus, slate-drafti | **metsäaukio ja kuutamojoki, vene, punos, purppuralaatta** |
| | **taistelukenttä puupiirroksena, haboku-läiskät, trumpettikiilat** |
| | **A-levy väripartituurirenkaina** (vedoksen `record.js` pohjana) |

## 7. Tarkistus ennen tuotantoa

- **Korvalla** (opas): kohtaukset 19–21, 27, 29–30, 32, 35, 43–44, 47, 49–50, 55, 61 ja 64.
- **Ankkurit teemakarttaan** (analyysityö): käyrätorvien paluu 6:41.4, lämmin mf 14:06, neljä
  käyrätorvikutsua 16:20–17:14.5, trumpetit ja virvelit 19:39.5.
- **Teemaviiva, tehty 30.10.2026:** muoto on luettu partituurista (`annotations/sankariteema.json`, 67
  nuottia, T. 1–20, sellostemma) ja mitattu äänestä (`analysis/teemaviiva.py` →
  `build/demo400/teemaviiva.json`): 64/67 nuottia löytyi, ja sävelrajat seuraavat ankkureita ±0,3 s.
  Levy soi noin 30 senttiä A=440:tä ylempänä, mikä näkyy tasaisena +0,2…+0,4 puolisävelaskeleen
  poikkeamana, ja viiva piirretään mitatusta arvosta. Huomio: tahtien 1–20 laajuus on Es2–H4 eli
  kaksi oktaavia ja sekunti, ja avauskaari Es2→G4 nousee yhden tahdin sisällä. Lähteiden "3½
  oktaavia" koskee teeman jatkoa **[tarkista]**. Epävarmat nuotit (T. 7, 12, 13) tarkistetaan
  korvalla.
- **Sooloviulun sävelkorkeus (avoin, 30.10.2026):** CREPE, orkesterin CQT-salienssi ja Demucs-stemmi
  (`analysis/viuluviiva.py`) antavat kaikki hajanaisia pisteitä, eivät melodialinjaa. Kumppanin viiva
  näyttää siksi toistaiseksi mielialan muodon rekisterikaistallaan, ei sävelkorkeutta. Tarkka viiva
  vaatii viulusoolon muodon partituurista (kuten sankariteemassa), ja se on käyttäjän päätös.
- **Tyylikuvat ennen animointia** *(T 16)*: sankari vedoista, kumppani, kuutamojoki ja vene, taistelu.
- **Kuvallinen drafti:** still jokaisesta kohtauksesta slaten kanssa (`render/draft.mjs`), katsotaan
  yhdessä ennen videota. Tarkistajat: tyyli ja opas, peitot, jatkuvuus.
