# Kuvakäsikirjoitus: purje-400 – "Punainen purje"

Paperipiirretty Disneyn ja Lotte Reinigerin hengessä, pelkkää liikegrafiikkaa (2D-paperitasot
3D-tilassa, multiplane): LP-puoli A, 0–400 s. Tämä on renderöinnin pohja: mitä kuvassa on, missä ja
miksi. Mitä musiikissa tapahtuu, kerrotaan [kuunteluoppaassa](../../annotations/kuunteluopas.md).
Jokainen rivi nimeää ankkurinsa [teemakartasta](../../annotations/teemat.json). Kohtaus lukee ajat
`S.A(id)`:llä `cues.json`:n `teema`-kentästä ja iskut `build/demo400/aksentit.json`:sta. Kohtauksessa
ei ole kovakoodattuja sekunteja eikä lisäyksiä tyyliin `+1.0 s`. Siirtymien ja iskujen kuoret ovat
ainoat kestot.

## 1. Tarina

**Kapteeni** on nuori merenkulkija, jonka kypärä on käyrätorven kello ja rintapanssari torven
kierre. Hän on Straussin sankari, ja hänen äänensä on käyrätorvi. Hänen laivansa **punainen purje on
sankarin taso** (tyyli, luku 10): sama sinooperinpunainen pinta, jonka yläreuna nousee teeman mukana.
Purje nousee mastoon sitä mukaa kuin sankariteema kiipeää matalalta korkealle. Kun purje on täysi,
sankari on täysi.

Kahdeksan käyrätorvea on **laivasto**, kahdeksan purjetta. Strauss vaatii kahdeksan käyrätorvea, kun
tavallisesti niitä on neljä. Kapteeni ei ole yksin, sillä hänen oma soittimensa vastaa hänelle
kahdeksankertaisena.

Video on yksi päivä merellä (Runge: elämä yhtenä päivänä):
- **Aamunkoitossa** kapteeni nostaa purjeen kallioniemen suojassa, ja laivasto vastaa niemen takaa.
- **Avomerellä** tiirat lentävät, ja laivasto kilpailee tuulen kanssa ensimmäisen suuren aallon harjalle.
- **Tyynessä lahdessa** kultaisessa aamupäivässä kaksi laivaa laulaa rinnakkain.
- **Rannikolla** kalliot nousevat, koko laivasto kokoontuu ja putous ryöppyää mereen.
- **Myrskyssä** laiva kiipeää aaltovuoria, ja salamat lyövät yhä lähemmäs majakkaluotoa. Kapteeni
  seisoo keulassa sädekehän edessä, ja maailma vaikenee.

Hämärässä tuuli loppuu (näytös II). Laiva ajelehtii **kaislalahteen**, jossa lahden olennot
nalkuttavat. Ne ovat Straussin arvostelijat, ja jokainen on rakennettu oman soittimensa muotoon.
Purje roikkuu, ja kapteeni painuu tummaksi. Yöllä kuu nousee, ja tyynen veden pinnalla näkyy aamun
muisto: kahdeksan purjetta auringon alla. Kun olennot hyökkäävät uudelleen, laivaston purjeet
nousevat horisonttiin, tuuli palaa ja punainen purje täyttyy.

### Ohjaajan tulkinta: mitä Strauss kertoo

**Näytös I ei ole matka vaan muotokuva.** Porterin mukaan sankariteeman aikana esitellään sankarin
luonteenpiirteet: mielikuvituksen rikkaus, tunteen palo, pyrkimys ja ennen kaikkea
suoraselkäisyys. Teema ei pysähdy 116 tahtiin, ja sen **neljä aaltoa nousevat yhä korkeammalle**,
kunnes kaikki jää ilmaan dominanttiseptimiin ja teoksen ainoaan pitkään hiljaisuuteen. Elokuvan
kielellä tämä on **neljä nousua**, joista jokainen nousee korkeammalle kuin edellinen. Jokaisen
huipulla kamera on korkeammalla, horisontti matalammalla ja kuva laajempi:
1. **Aamu:** purje nousee ja aurinko nousee niemen huipun yli (`held_vasket_t13`).
2. **Avomeri:** ensimmäisen suuren aallon harja (`held_huippu1_kohta`).
3. **Rannikko:** koko laivasto ja korkeat kalliot (`held_reh10`).
4. **Myrsky:** aaltovuori ja majakkaluodon huippu (`held_dom7_sointu`).

| Piirre (Porter) | Kuvassa |
|---|---|
| suoraselkäisyys | **masto ja täysi purje**: pystyssä koko näytöksen I ajan. Tämä on läpikulkeva kuva. |
| tunteen palo | punainen purje pullistuu ja viiri leimahtaa f- ja ff-kohdissa |
| mielikuvituksen rikkaus | tiirat ja välke (puupuhaltimet ja harput, `held_lyyrinen`) |
| pyrkimys | neljä nousua yhä korkeammalle |

**Kantava kuva on auringonnousu korkeimmassa paikassa.** Käyttäjä nosti sen edellisen vedoksen
hienoimmaksi kohdaksi, ja se tulee kolmesti:
1. aamulla niemen huipun yli
2. dominanttiseptimissä sädekehänä majakkaluodon yllä, korkeimmalla
3. yöllä muistona tyynen veden peilissä

Kun sankari muistaa itsensä, sama kuva palaa.

**Näytös II on pikkumaisuus.** Arvostelijat eivät voi upottaa laivaa, mutta ne vievät siltä
tuulen: purje roikkuu, ja teema kuuluu mollissa ja tummana. **Ironia** (Gilliam, Porter;
taustatutkimuksen *Don Quixote* -peili): kun englannintorvi vääristää sankariteeman, kapteenin
kuva tyynessä vedessä venyy laihaksi Quijoteksi. Sitten sankari kerää itsensä (jouset "mit
Steigerung") ja muistaa aamun. Jakso ei lopu videon aikana, sillä sankari ajaa vastustajat pakoon
vasta A 6:48. Siksi video päättyy nousuun, ei voittoon: "jatkuu".

### Rakenne ja kohtausten mitat

Kohtauksen pituus on sen musiikin pituus (ankkurien väli). Pitkä musiikki saa useamman oton,
mutta ei uutta tapahtumaa.

| Kohtaus | Ankkurit | Kesto | Luonne | Tarina |
|---|---|---|---|---|
| 0 Levy | alku → `held_alku` | 7,6 s | sisäänajoura | neula, otsikko |
| 1 Aamu (nousu 1) | `held_alku` → `held_lyyrinen` | 40 s | harppova, itsevarma | Purje nousee, laivasto vastaa ja aurinko nousee niemen yli. |
| 2 Mielikuvitus ja nousu 2 | `held_lyyrinen` → `held_tunnelma_vaihtuu` | 51 s | lyyrinen → kasvava | Tiirat, sitten laivaston kilpa ja ensimmäinen harja. |
| 3 Hellyys | `held_tunnelma_vaihtuu` → `held_t61` | 27 s | pp, ausdrucksvoll | Kaksi laivaa laulaa tyynellä. |
| 4 Nousu 3 | `held_t61` → `held_reh12` | 73 s | täysi voima | Kalliot nousevat, koko laivasto ja putous. |
| 5 Nousu 4 | `held_reh12` → `held_dom7` | 40 s | kohtalo | Aaltovuori, salamat ja sädekehä. |
| 6 Hiljaisuus | `held_gp` | 3,8 s | yleistauko | tyhjä paperi |
| 7 Arvostelijat | `wid_1_huilu` → `wid_sankari_molli` | 42 s | piikittelevä | olennot yksi kerrallaan |
| 8 Epäilys | `wid_sankari_molli` → `wid_reh17` | 20 s | molli | Purje tummuu ja roikkuu. |
| 9 Muisto | `wid_reh17` → `wid_uusi_hyokkays` | 62 s | jousten aallot | Kuu ja aamun muisto vedessä, kolme ottoa. |
| 10 Nousu | `wid_uusi_hyokkays` → loppu | 33 s | hyökkäys → käyrätorvet | Laivasto horisontissa, ja tuuli palaa. |

**Tulkinta:** Ensimmäinen näytös on itsevarmuus, joka ei vielä tunne vastustajaa: tuuli on aina
myötäinen. Toinen näytös on tyven, eli pikkumaisuus, joka ei voi upottaa laivaa mutta voi viedä siltä
tuulen. Sankarin voima on tuulessa, eli orkesterissa, ja arvostelijat ovat tyvenen olentoja.
Miljöö (satama, meri, lahti, rannikko, myrsky, kaislikko) on keksittyä, mutta tapahtumat eivät ole:
jokainen tapahtuma seuraa Straussin ohjelmaa (Porter) ja teemakartan ankkuria.

## 2. Soittimet: kuka tekee mitä kuvassa

Straussin tekstuuri näytetään kerroksina (multiplane). Jokaisella soitinryhmällä on oma roolinsa ja
oma kerroksensa. Pääääni on täydessä värissä ja terävä, sivuääni rasteria, ja säestys on maailmaa.
Kuvan tiheys seuraa orkestraation tiheyttä, ei voimakkuutta.

| Soittimet | Mitä Strauss niillä tarkoitti | Kuka tai mikä kuvassa | Miten se elää |
|---|---|---|---|
| **käyrätorvet ja sellot**, sankariteema | sankari, isän soitin | **kapteeni** ja **punainen purje** | Purjeen nosto ja pullistuma seuraavat johtavaa melodiaa (tasoitettu, ei nuotinalkuja). Kapteenin kello nousee soittoasentoon, kun käyrätorvet soivat, pehmeästi fraasin mukana. |
| **8 käyrätorvea ryhmänä** | sankarin joukko | **laivasto**: seitsemän rasteroitua punaista purjetta (sivuääni) | Ennen kuin laivat näkyvät, niiden purjeet napsahtavat auki niemen takana ryhmän sointuiskuissa. Laivan runko ei pompi koskaan. |
| **viulut** | valo ja kurottaminen | **tuuli ja auringon välke** | Viulut ovat tuuli: kun ne soivat, tuulen viivoitus näkyy taivaalla ja aallonharjoissa. Ensimmäinen säde osuu mastonhuipun viiriin. Kun viulut vaikenevat, tuuli tyyntyy. |
| **alttoviulut, sellot ja bassot** | paino ja maa | **maa ja maininki**: kalliot ja aallokon pohjavire | Matala crescendo kohottaa kalliot alhaalta. Mainingin korkeus seuraa matalia jousia (tasoitus sekunteja). |
| **puupuhaltimet** (näytös I) | mielikuvitus ja tunne | **tiirat** | Parvi syntyy aaltojen vaahdosta, kun puupuhaltimet tulevat ensimmäistä kertaa. Siipien lyönnit tulevat puupuhallinten fraaseista. Huilu ja englannintorvi ovat kaksi leikkivää tiiraa. |
| **harput** | välke ja vesi | **veden välke** | Välkerenkaat leviävät harpun nuotinaluissa. Glissando on valoaalto veden yli. |
| **patarummut** | kohtalo, maan syke | **aallon isku kallioon** | Lyönti nostaa vaahtoroiskeen kallion juurelta. Tremolo on jyrinää, ja silloin vesi värisee. Koko kuva ei tärähdä. |
| **trumpetit, pasuunat ja tuubat** (näytös I) | juhla ja kutsu | **mastoviirit** | Viirit nousevat mastoihin vaskien tullessa. Toistuvat soinnut värisyttävät viirien kärkiä. |
| **koko orkesteri ff** | koko maailma | kaikki kerrokset liikkeessä | kamera laajimmillaan |
| **puupuhaltimet, tuubat ja pasuunat** (näytös II) | arvostelijat | **lahden olennot**, mustia ja groteskeja (venytys ja litistys vain niille) | ks. luku 3 |
| **hiljaisuus** | – | tyhjä paperi ja levyn pöly | – |

**Taustakerrokset elävät soittimiensa mukaan, hienovaraisesti** (tyyli, luku 7; palaute 30.10.2026).
Liike on hidasta ja tasoitettua, eikä se koskaan reagoi yksittäiseen iskuun.

| Kerros | Soitin tai suure | Miten |
|---|---|---|
| kaukaiset vuoret | dynamiikka (`loudSlow`) | rasteritiheys hengittää: kovempi on tummempi |
| keskimaiseman niemet | matalat jouset | nousevat ja laskevat korkeintaan muutaman prosentin |
| taivaan liukuma | rekisteri | sininen nousee korkeammalle, kun rekisteri nousee |
| pilvet | puupuhaltimet | ajelehtivat tuulen suuntaan puupuhallinten energian mukaan |
| mainingit (3 kaistaa) | matalat jouset ja jouset | korkeus ja nopeus |
| aallonharjojen välke | viulut ja harppu | välkkeen määrä |

**Laivasto säästetään** (kriitikon linjaus): iskuissa T. 6, 8 ja 11 näkyvät vain purjeiden kärjet
kareen takana. Rivi tulee esiin vasta `held_intro_loppuu`:ssa. Avomerellä kapteeni on aluksi
yksin tiirojen kanssa, ja laivasto liittyy `held_t34`:ssä. Koko kahdeksan laivan laivasto nähdään
ensimmäistä kertaa `held_reh8`:ssa.

**Yksi tuuli** (tyyli, luku 7): Jokaisessa paikassa on yksi tuuli, joka puhaltaa vasemmalta
oikealle, ja sen voima on viulut, jouset ja voimakkuus tasoitettuna. Kaikki purjeet, viirit, viitat,
savut ja sade lukevat saman `wind(t)`:n. Laivat purjehtivat myötätuuleen oikealle, joten viirit
osoittavat keulan suuntaan. **Poikkeus** (musiikin perustelema): näytöksen II tyvenessä
(`wid_1_huilu`…`wid_reh20`) tuulta ei ole, joten purje ja viiri roikkuvat. Tuuli palaa vasta, kun
sankari nousee (`wid_sankari_nousee`).

**Jokaisella hahmolla oma tilansa** (tyyli, luku 7): Laivat ovat omilla syvyysväleillään
(vähimmäisväli yhden laivan pituus), eivätkä purjeet koskaan peitä toisiaan kuvan sommittelussa.
Viiri on aina oman mastonsa huipussa. Otsikko sijoitetaan tyhjään taivaaseen, ei hahmon päälle.

## 3. Lahden olennot (arvostelijat)

Feedbackin opetus: olennon pitää olla iso, selvä siluetti, ja sillä on yksi tunnistettava ele.
Jokainen olento on rakennettu **soittimensa muotoon**, joten soittimen tunnistaa ilman ääntä.
Olennot ovat mustia paperileikkeitä vaaleaa hämärän taivasta vasten, ja jokaisella on paperinvalkoinen
ääriviiva. Sama soitin on aina sama olento. Ele seuraa soittimen fraasia (tasoitettu verhokäyrä),
ei yksittäisiä nuotinalkuja.

| Ankkuri | Olento | Ele |
|---|---|---|
| `wid_1_huilu` | **huiluhyttynen**: ruumis on huilu sormiläppineen, kärki pistin | Lentää kehyksen yläreunaan, kapteenin taivaalle (korkea rekisteri), ja osoittaa pistimellä kohti kapteenia. |
| `wid_2_oboe` | **oboesorsa**: kaksoislehdykkä nokkana | Nokka avautuu ja sulkeutuu fraasin verhokäyrän mukaan. |
| `wid_3_4` | **englannintorvihaikara**: kaula on englannintorven taivutettu putki, pää päärynäkello | Kävelee pitkin portaittaisia paaluja ylöspäin (kromaattinen nousu), yksi paalu kerrallaan. |
| `wid_dehring1` | **Dehring: kaksi tuubakotiloa** kivillä rinnakkain. Kuori on tuuban kello, ja oikea kivi on täsmälleen kvintin (3:2) korkeammalla | Kellot kääntyvät yhtä aikaa ja aina rinnakkain kuin rinnakkaiset kvintit. |
| `wid_6` | **oboesorsa palaa** kiihtyneenä | Nokka käy nopeammin. |
| `wid_7_8` | **Quijote-peili:** kapteenin kuva tyynessä vedessä venyy laihaksi Quijoteksi ja nostaa vääristyneen kellon (englannintorvi vääristää teeman). Lisäksi **kaksi fagottisammakkoa** | Sammakoilla on pitkät fagottiputkiset jalat, ja ne kyyristyvät fraasin mukaan. |
| `wid_9_pasuunat` | **kolme pasuunavarista** laskeutuu kuolleeseen puuhun | Vetoputkinokat työntyvät ulos. |
| `wid_kuoro` | kaikki yhdessä | Musta usva sakenee lahden yllä. |
| `wid_sankari_molli` · `wid_reh16` | – | Kapteeni istuu ja painuu tummaksi, ja purje tummuu tummanpunaiseksi (rasteri). Olennot vaikenevat. |
| `wid_uusi_hyokkays` | kaikki palaavat | Piiri sulkeutuu laivan ympärille. |
| `wid_reh20_lautaset` | **roiske** | Vesi suhisee mustana roiskeena kivien välissä. |

## 4. Iskut: elementti pärähtää, liike jatkuu

Sama linjaus kuin tyyliohjeen luvussa 8:
- Iskun tekee yksi elementti, ei hahmon keho eikä koko kuva.
- Kamera ja hahmot jatkavat liikettään iskun yli. Iskuun ei leikata.
- Elementti näkyy ensimmäisellä ruudulla, joka alkaa aikaisintaan 33 ms ennen ääntä.
- Koko tulee mitatusta voimakkuudesta (`z`).

| Ankkuri | Tekijä | Teko | Mikä jatkuu |
|---|---|---|---|
| `held_isku_t6`, `_t8`, `_t11` | 7 laivaston purjetta niemen takana | Purjeet napsahtavat auki ja täyttyvät (kahdeksan käyrätorvea vastaa). Ne laskeutuvat hitaasti. | Kapteenin purje nousee mastoon, ja kamera nousee mukana. |
| `held_viulut` | välke | Ensimmäinen auringonsäde välähtää mastonhuipun viirissä. | nosturi ylös |
| `held_vasket_t13` | mastoviirit, patarummut | Viirit kohoavat mastoihin, ja patarummun lyönnit nostavat roiskeen niemen kalliolle. | aurinko nousee niemen yli |
| `held_reh5_isku` | kapteenin kello | Kapteeni nostaa kellon taivaalle. Liike kestää fraasin ajan. | laiva kiipeää mainingin rinnettä |
| `held_huippu1_kohta` | aalto ja aurinko | **Ensimmäinen huippu:** laiva ylittää suuren aallon harjan, vaahtoharja murtuu ja aurinko murtautuu pilvestä. | Kamera hidastuu, mutta ei pysähdy. |
| `held_reh9` (sarja) | laivaston isopurjeet | Jokainen mitattu isku avaa seuraavan laivan purjeen. | sivuajo laivaston ohi |
| `held_reh11` | putous | Jokainen mitattu aksentti ja harpun nuotinalku on ryöppy, joka syöksyy alas mereen. | Kamera seuraa putousta. |
| `held_isku1`–`held_isku4` | **maininki** | **Kohtaloiskut:** neljä maininkia lyö luotoa vasten, ja jokainen roiske nousee korkeammalle kuin edellinen. Neljäs on suurin. Katkossa sade ja tuuli hiljenevät, ja vesi vetäytyy (sisäänhengitys). Salamoita ei ole (kriitikon linjaus): musiikki on Es-duurin pyrkimystä, ei uhkaa, eikä vastustaja saa näkyä ennen näytöstä II. | Yksi jatkuva otto: laiva kiipeää aaltovuorta tasaisesti, eikä se loikkaa. |
| `held_dom7` | sädekehä | Sointu katkeaa, säteet sammuvat ja paperi nousee kuvan yli. | Kamera liukuu. |
| `wid_1_huilu` | huiluhyttynen | Ensimmäinen sävel tauon jälkeen on pisto. | – |
| `wid_reh20_lautaset` | roiske | Vesi suhisee. | – |

## 5. Kohtaukset ja otot

Paikat: **A** levy, **B** aamun satama, **C** avomeri, **D** tyyni lahti, **E** rannikko ja putous,
**F** myrsky ja majakkaluoto, **G** kaislalahti hämärässä ja yössä.

Väri seuraa päivää: yö → aamunkoi → aamu → kultainen aamupäivä → kirkas päivä → myrskyn musta →
hämärän punainen → yön sininen. Käytössä on vain neljä perusväriä. Erikoisvärit säästetään
myöhempiin jaksoihin (tyyli, luku 5).

| # | Ankkuri | Paikka | Kuva | Kamera |
|---|---|---|---|---|
| 0 | alku | A | Levyn urat ja etiketti. Neula laskeutuu ensimmäisessä naksahduksessa. Otsikko painuu. Kamera sukeltaa uraan, ja urista tulee aaltoja. | lähikuva → sukellus |
| 1 | `held_alku` | B | **Selkäkuva 1/4:** yö muuttuu aamuksi, ja kapteeni seisoo keulassa selkä kameraan. Punainen purje nousee mastoon teeman kaaren mukana. Niemi ja vuoret painautuvat esiin matalien jousten mukana. | matala, hidas nousu purjeen mukana |
| 2 | `held_isku_t6` · `_t8` · `_t11` | B | laivaston purjeet niemen takana (luku 4) | sama otto |
| 3 | `held_viulut` | B | Viirin välähdys, ja tuulen viivoitus syttyy. | nosturi ylös |
| 4 | `held_vasket_t13` | B | Aurinko nousee niemen kallion yli. Mastoviirit nousevat, ja patarummut nostavat roiskeen kalliolta. | laajenee |
| 5 | `held_intro_loppuu` | B | **Laivasto kiertää niemen:** kahdeksan purjetta rivissä, porrastettuina syvyyteen. Viirit värisevät trumpettien soinnuissa. Tuuli on heikko, koska viulut ovat vaiti. | laaja → sivuajo rivin ohi |
| 6 | `held_viulut_paluu` | B | Tuulenpuuska täyttää kaikki purjeet. | lähikuva kapteenista |
| 7 | `held_lyyrinen` | C | **Rasteriliukuma.** Avomeri. Tiiraparvi syntyy vaahdosta, ja välke leviää harpun mukana. | lento parven mukana |
| 8 | `held_t25` | C | Tiirat liitävät aaltojen yllä, ja laiva kulkee kaukana. | pehmeät kaaret |
| 9 | `held_t31` · `held_t34` | C | Uusi aalto. Kohdassa `held_t34` laivasto kiihdyttää rinnakkain. | sivuajo laivojen rinnalla |
| 10 | `held_reh4` → `held_huippu1` | C | Mainingit kasvavat. Jokainen sforzando on keularoiske, ja laiva kiipeää. | nousee aallon mukana |
| 11 | `held_reh5_isku` | C | **Leikkaus jakson alkuun:** kapteeni nostaa kellonsa kesken nousun. | lähikuva jatkaa nousua |
| 12 | **`held_huippu1_kohta`** | C | **Ensimmäinen huippu** (luku 4) | laaja ja matala |
| 13 | **`held_tunnelma_vaihtuu`** | D | **Rasteriliukuma** kultaiseen aamupäivään. Kaksi tiiraa leikkii mastojen yllä. | hidastuu leijuvaksi |
| 14 | `held_t49` | D | Laiva liukuu tyynellä. Patarummun tremolossa vesi värisee. | hyvin hidas lähestyminen |
| 15 | `held_reh6` | D | Kaksi laivaa purjehtii rinnakkain kahden kesken, ja niiden viirit liehuvat samaan suuntaan. | hidas sivuajo |
| 16 | `held_t61` | E | **Siirtymä paperin kautta.** Rannikon kalliot kohoavat alhaalta, ja laivasto purjehtii rannikkoa pitkin. | nousee vedenpinnasta |
| 17 | `held_reh8` | E | **Leikkaus:** koko laivasto, kaikki purjeet ja viirit ylhäällä. | laaja |
| 18 | `held_reh9` | E | purjeiden portaat (luku 4) | sivuajo jatkuu |
| 19 | `held_reh10` | E | Kaikki liikkeessä. Myrskypilvi näkyy kaukana horisontissa. | laaja |
| 20 | `held_reh11` | E | Putous ryöppyää kallioilta mereen (luku 4). | seuraa putousta |
| 21 | `held_reh12` | F | Raskas meri ja sade. Patarummun lyönnit roiskuvat luotoa vasten, ja laiva kiipeää jättimaininkia. | yksi jatkuva nosturiajo, joka nousee videon korkeimpaan kohtaan |
| 22 | `held_isku1` … `held_isku4` | F | **Kohtaloiskut** (luku 4) | yksi jatkuva otto |
| 23 | `held_dom7_sointu` | F | Laiva saavuttaa majakkaluodon suojan, ja myrsky aukeaa. | nosturi hidastuu |
| 24 | `held_dom7_sointu`…`held_dom7` | F | **Tablo, selkäkuva 2/4:** Tablo alkaa soinnun puolivälistä. Kapteeni seisoo perässä selkä kameraan ja ojentaa kätensä. Edessä on majakkaluoto, ja sen yllä nousee **aurinko sädekehänä**, jonka jokainen säde on yksi taajuuskaista. Pilvet ovat auenneet. Kuva toistaa aamun auringonnousun korkeimmassa paikassa. | hyvin hidas lähestyminen |
| 25 | `held_gp` | – | tyhjä paperi, pöly | liuku paperin yli |
| 26 | `wid_1_huilu` | G | **Kaislalahti hämärässä:** punainen taivaanranta ja kuolleet puut. Laiva on tyvenessä, purje roikkuu ja kapteeni istuu. Hyttynen. | rauhallinen: olennot ovat levottomia, kamera ei |
| 27 | `wid_2_oboe` … `wid_kuoro` | G | Olennot tulevat yksi kerrallaan (luku 3), ja jokainen saa oman lähikuvansa, jossa myös kapteeni tai laiva näkyy. | lähikuvat, ei toistuvia laajoja ottoja |
| 28 | `wid_sankari_molli` · `wid_reh16` | G | Kapteeni painuu tummaksi, ja purje tummuu. | hidas |
| 29 | `wid_reh17` | G, yö | Kuu nousee. Tyynen veden peilissä näkyy **aamun muisto**, selvästi piirrettynä: niemi, nouseva aurinko ja kahdeksan purjetta. Muisto vahvistuu jousten aalloissa. | pitkät, hitaat otot |
| 30 | `wid_uusi_hyokkays` | G | Olennot palaavat, ja laiva on piiritetty. | korkealta |
| 31 | `wid_reh20` · `wid_reh20_lautaset` | G | Laivaston purjeet nousevat horisonttiin. Roiske. | lähenee |
| 32 | `wid_sankari_nousee` | G | Tuuli palaa, purje alkaa täyttyä, kapteeni nousee ja teksti "jatkuu" tulee nousevan purjeen päälle. Kuva näyttää nousun alun, ei voittoa, koska käyrätorvet tulevat vasta A 6:41. | sammakkoperspektiivi |

## 6. Kamera ja leikkaus

- **Sulavuus:** ei kallistusta, kieppumista eikä nopeita kääntöjä. Kulmanopeus on enintään 20 °/s,
  ja yleensä se on alle 8 °/s (`render/camcheck.mjs --max 20`).
- **Liike ei pysähdy** iskuun, katkoon eikä pitkään sointuun. Ainoa pysähdys on yleistauko.
- **Leikkaukset** osuvat jaksojen alkuihin, eivät iskuihin.
- **Lavasteet eivät paljastu:** jokainen kerros ulottuu jokaisen näkymän yli. Tämä tarkistetaan
  `render/kohtauscheck.mjs`:llä: tyhjä tausta näkyy magentana, ja kerrosten alueet verrataan kameran
  näkymään.
- **Kerrokset:** syvyys syntyy kerrosten välisestä liikkeestä. Etualan kaislat ja kivet liikkuvat
  nopeimmin.

## 7. Toteutus ja tarkistus

- **Kohtaus:** `visual/purje/`. Työkalut (painojälki, paperimuodot, signaalit, nuket) on kopioitu
  torviritarista ja niitä on täydennetty. Uudet osat ovat laiva, purje, meri, tuuli ja olennot.
- **Tarkistus** (`tarkistus.md`):
  1. still-kuva jokaisesta otosta ja iskusta sekä kontaktiarkit
  2. kolmen pahimman korjaus
  3. `camcheck` ja `kohtauscheck`
  4. renderöinti ja `analysis/videotarkistus.py`
  5. tuoreen tarkistaja-agentin arvio stilleistä
