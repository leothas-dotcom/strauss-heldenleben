# Ohjaus: Ein Heldenleben kohtaus kohtaukselta (koko teos, A + B)

*Ohjaajan käsikirjoitus 31.10.2026. Lähteet: [kuunteluopas](../annotations/kuunteluopas.md) (mitä
musiikissa tapahtuu), [visuaalinen tyyli](visuaalinen_tyyli.md) (luvut 4–11, 13, 18) ja
[taustatutkimus](heldenleben_tutkimus.md) (Porter). Ajat ovat teemakartan ankkureita; kestot ovat
mukana vain mittasuhteina. Tämä korvaa A-puolen osalta `runs/muste-1230/storyboard.md`:n luvun 3
silloin, kun ne eroavat: tässä sankari TEKEE jokaisessa otossa jotain.*

---

## 0. Sääntö, jota ohjaus noudattaa

**Jokaisella otolla on kolme asiaa:** (1) mitä musiikissa tapahtuu, (2) mitä sankari tekee ja mitä
hän haluaa, (3) mikä kuvassa muuttuu (valo, kamera, muste). Jos kohdalle 2 ei löydy tekoa, otto on
väärin kirjoitettu. Leikkaus tulee aina jaksorajaan tai ankkuriin, ei iskuun. Otto kestää
korkeintaan niin kauan kuin musiikin lause: pitkässä jaksossa otot vaihtuvat jaksorajoissa
(`segments.json`), eikä sama sommitelma pysy yli noin 30 s.

**Punainen lanka:** sankari on punaista mustetta, ja hänen viirinsä jättää friisiin vedon aina, kun
käyrätorvet laulavat teemaa. Veto piirtyy, kuivuu ja häipyy. Kun sankari on sisäisessä tilassa
(hellyys, muisto, suru), hän hajoaa vedoiksi; kun hän toimii, hän on hahmo.

**Kuka johtaa kuvaa (pääosasääntö, sovittu 31.10.2026):** pääosa on se, joka musiikissa puhuu.
Käyrätorvet soittavat teemaa tai toimivat → ritari tekee. Käyrätorvet laulavat sisäisesti → viiri tai
muste yksin, ritari pieni tai hajonnut. Käyrätorvet vaiti → toinen soitin johtaa (olennot, viulun
viiva, tiirat) ja ritari kuuntelee pienenä tai poissa. Tutti ilman torvia → maailma johtaa (salamat,
putous, läiskät). Jokaisen oton "Sankari tekee" -sarake luetaan tämän läpi: kun torvet ovat vaiti,
teko on kuuntelemista tai reagointia, ei esiintymistä. Jako ja tiedostorajat: `tuotantojako.md`.

**Valo on päivä** (Runge): aamunkoi (sankari) → aamupäivän sameus (vastustajat) → ilta ja yö
(kumppani) → myrsky-yö ja aamun valkeneminen (taistelu) → keskipäivä (kertaus) → kultainen iltapäivä
ja hämärä (rauhantyöt) → auringonlasku ja yö (pako ja täyttymys).

**Sonaattimuoto kamerassa:** esittely kulkee eteenpäin, kehittely sukeltaa, kertaus palaa avauksen
kulmaan, kooda vetäytyy.

---

## NÄYTÖS I: ESITTELY (A-puoli)

### 1. Sankari (`held_alku` → `held_gp`, 3 min 52 s). Aamunkoi.

Musiikki on yksi 116 tahdin lause neljänä aaltona. **Kuva on yksi jatkuva liike**, jossa paikka
vaihtuu viirin kärkeä seuraten, ja jokaisen aallon huipulla kamera on korkeammalla.

| Otto | Ankkurit | Musiikki (opas) | Sankari tekee | Kuva, valo, kamera |
|---|---|---|---|---|
| 1.1 Ensimmäinen veto | `held_alku` → `held_viulut` (15 s) | käyrätorvi, sellot, alttoviulut unisonossa Es2:sta ylös; sointuiskut T. 6 ja 8 | **Herää ja nousee.** Selkäkuva laakson pohjalla; hän kohottaa keihään, ja viiri piirtää teemaviivan ruudun alareunasta yläreunaan nuotti nuotilta (teemaviiva.json). Iskuissa toverien viirinkärjet vastaavat harjanteen takaa. | yö → sarastus; kamera nousee vedon mukana; veto on kuvan pääosa ja muste leveää |
| 1.2 Jouset liittyvät | `held_viulut` → `held_vasket_t13` (8 s) | viulut ensimmäistä kertaa, T. 11 isku | **Kääntyy profiiliin ja lähtee kävelemään harjannetta ylös.** | vuoret painautuvat sinisellä; tuulen viivoitus taivaalle; nosturi jatkaa |
| 1.3 Auringonnousu | `held_vasket_t13` → `held_intro_loppuu` (8 s) | trumpetit, pasuunat, tuuba ja patarummut ensimmäistä kertaa, ff | **Pysähtyy harjanteen huipulle ja nostaa keihään molemmin käsin**, kun aurinko nousee huipun takaa (hän on pieni, aurinko iso). Patarummut pöllähdyttävät maan viivoitusta. | sama ajo laajenee; aamunkoi vaalenee kermaksi |
| 1.4 Toverit | `held_intro_loppuu` → `held_lyyrinen` (8 s) | käyrätorvet ff matalalla, trumpetit toistuvin soinnuin, juoksutus (`held_viulut_paluu`) | **Kääntyy ja näkee toverinsa** nousevan harjanteelle siluetteina; hän nostaa kellon ja soittaa heille; juoksutuksen puuska nostaa kaikki viirit. | sivuajo rivin ohi; vastavalo |
| 1.5 Mielikuvitus | `held_lyyrinen` → `held_t31` (20 s) | puupuhaltimet ja 2 harppua ensimmäistä kertaa, lyyrinen vastateema; englannintorvi ja klarinetit virtaavina | **Astuu laivan keulaan** (rasteriliukuma: harjanne aukeaa mereksi). Tiirat syntyvät vaahdosta ja kiertävät häntä; hän seuraa niitä katseellaan ja ojentaa kätensä, yksi tiira laskeutuu keihään kärkeen. Harppu = välkerenkaat. | kirkas aamu; lento parven mukana; kamera vedenpinnan tasolla |
| 1.6 Laivasto | `held_t31` → `held_reh4` (11 s) | pp, uusi kasvu; huilut ja käyrätorviryhmä f, T. 36 ff | **Nostaa purjeen** (uusi aalto); laivasto liittyy rinnalle ja kilpailee. | sivuajo laivojen rinnalla |
| 1.7 Rinne ja huippu | `held_reh4` → `held_t47` (20 s) | p, kasvu; sforzandot; `held_reh5_isku` ff-sointu; `held_huippu1_kohta` ensimmäinen huippu (vahvistettu) | Mainingit kasvavat. **Hän nostaa kellon soittoasentoon** fraasin mittaisella liikkeellä (lähikuva), ja laiva **ylittää aallon harjan** huipussa; harja murtuu ja aurinko murtautuu pilvestä. Sforzandot ovat tiirojen syöksyjä. | lähikuva vetäytyy yhtenä liikkeenä laajaan; huipulla kamera korkeammalla kuin 1.3 |
| 1.8 Hellyys | `held_t47` → `held_reh6` (10 s) | huilu ja englannintorvi leikkivät, klarinetti nousee; pp ausdrucksvoll, tremolo | **Laskeutuu niitylle, polvistuu purolle ja laskee kypärän.** Kaksi tiiraa (huilu, englannintorvi) leikkii hänen ympärillään. | rasteriliukuma kultaiseen aamupäivään; hyvin hidas lähestyminen |
| 1.9 Hajoaminen | `held_reh6` → `held_t61` (18 s) | käyrätorvet I–II laulavat, alttoviulun soolo | **Hajoaa vedoiksi:** hahmo ja viiri juoksevat friisiin kahdeksi punaiseksi vedoksi (kaksi käyrätorvea), alttoviulu sinisenä katkoviivana välissä. Katsoja oppii, että vedos on hänen sisäinen äänensä. | lähellä friisiä, sivuajo; valo paperinvaalea |
| 1.10 Kokoontuminen | `held_t61` → `held_reh8` (15 s) | crescendo matalalta, käyrätorvet f marcato, sellot ja bassot | **Vedot kokoontuvat takaisin ritariksi**, joka nousee ja marssii ylätasangolle; vuoret kohoavat jousten mukana. | nousee maan tasalta |
| 1.11 Kahdeksan käyrätorvea | `held_reh8` → `held_reh9` (14 s) | ff-tutti: 8 käyrätorvea teemassa | **Koko joukko rivissä nostaa kellot yhtä aikaa**; iso veto piirtyy niiden yllä teemana. Tämä on kohtauksen 1.1 kaari täytenä (paluu). | matala edestä → laaja |
| 1.12 Viirien portaat | `held_reh9` → `held_reh10` (16 s) | ff-tutti, arpeggiot | Mitatut iskut avaavat kolmen kolmikon viirit vuorotellen; sankari kulkee rivin editse. | sivuajo |
| 1.13 Nousu 3 | `held_reh10` → `held_reh11` (10 s) | fff-tutti, ei patarumpuja | **Hän kiipeää kalliolle ja osoittaa keihäällä kohti myrskyvuorta** (ei ojennettu käsi: keihäs vaakaan). Sädekehän luonnos ilmestyy vuoren ylle. | laaja, korkealla; kohdistus alkaa liukua |
| 1.14 Putous | `held_reh11` → `held_reh12` (19 s) | puupuhaltimet alas, harput fff glissando, patarummun tremolo | **Joukko laskeutuu putouksen vierestä**; ryöpyt harpun glissandoissa, tremolo värisyttää maata. | seuraa putousta alas → ylös |
| 1.15 Myrsky | `held_reh12` → `held_isku1` (14 s) | ff-tutti patarumpuineen | **Kiipeää rinnettä sateessa joukon kärjessä**, viitta tuulessa. | sivuajo; pilvet vyöryvät |
| 1.16 Neljä salamaa | `held_isku1` → `held_dom7_sointu` (16 s) | neljä katkoa ja kohotahti-iskua | Salama lyö **katkon alussa** (sointu katkeaa), joukko **pysähtyy ja viirit painuvat** paussissa; iskulla viirit napsahtavat ylös ja he jatkavat. Neljä kertaa, yhä lähempänä huippua. | yksi jatkuva nosturiajo |
| 1.17 Huippu ja sädekehä | `held_dom7_sointu` → `held_dom7` (10 s) | pasuunat fff, dominanttiseptimi, tremolo | **Nousee huipulle ja iskee keihään kiveen**; selkäkuva 2; sädekehä leimahtaa taivaalle (taajuuskaistat). Laatat kauimpana kohdistuksesta. | hyvin hidas lähestyminen |
| 1.18 Yleistauko | `held_gp` → `wid_1_huilu` (4 s) | ainoa pitkä hiljaisuus | Säteet sammuvat. **Hän seisoo yksin, ja paperi nousee kuvan yli.** | tyhjä paperi, rahina pölynä |

### 2. Vastustajat (`wid_1_huilu` → `gef_viulu`, 3 min). Aamupäivän sameus, suo.

| Otto | Ankkurit | Musiikki | Sankari tekee | Kuva |
|---|---|---|---|---|
| 2.1 Pisto | `wid_1_huilu` → `wid_2_oboe` (3 s) | huilu "sehr scharf", hyvin hiljaa | **Laskeutuu huipulta suolle ja istuu kuolleen puun juurelle lepäämään**; huiluhyttynen laskeutuu ja pistää, hän huitaisee sen pois. | hämärä sameus; lähikuva |
| 2.2 Olennot tulevat | `wid_2_oboe` → `wid_kuoro` (26 s) | oboe, pikkuhuilu ja englannintorvi, Dehring (tuubat), oboe kiihtyneenä, englannintorvi ff, fagotit, pasuunat | Jokainen olento tulee omalla ankkurillaan omaan paikkaansa, ja **sankari reagoi jokaiseen eri tavalla:** sorsalle hän kääntää selkänsä; haikaralle nousee puoliksi; Dehringin kotiloille (kvintin päässä) hän peittää korvansa; peilissä (englannintorvi vääristää teeman) hän **näkee itsensä laihana Quijotena** eikä suutu vaan katsoo; varisten laskeutuessa puuhun hän vetää viirin suojaan. | kamera rauhallinen; jokaiselle olennolle oma otto, jossa ritari näkyy |
| 2.3 Sameus | `wid_kuoro` → `wid_sankari_molli` (13 s) | kaikki yhtä aikaa mf | **Hän yrittää nousta, mutta painuu takaisin**: usva sakenee eikä viiri nouse. | musta rasteriusva peittää |
| 2.4 Molli | `wid_sankari_molli` → `wid_reh17` (20 s) | teema mollissa, fagotit, sordinoidut jouset; käyrätorvet V–VIII pp | **Painaa kypäränsä ja laskee viirin maahan**; viiri tummuu, ja friisiin piirtyy tumma teemaviiva. Olennot vaikenevat. | lähikuva kypärästä; valo sammuu |
| 2.5 Muisto | `wid_reh17` → `wid_uusi_hyokkays` (62 s) | viulut G-kielellä "mit Steigerung", aaltoina | **Hän katsoo lampeen** ja näkee aamun auringonnousun (1.3) ylösalaisin; jokainen jousten aalto lisää kuvaan osan (harjanne, aurinko, viirit) ja nostaa hänen päätään. Kolmannella aallolla hän **tarttuu viiriin**. | kolme ottoa jaksorajoissa: lampi, kasvot ja lampi, laaja; usva ohenee |
| 2.6 Uusi hyökkäys | `wid_uusi_hyokkays` → `wid_reh20` (13 s) | pikkuhuilu ff, Dehring, pasuunat | Olennot piirittävät; **hän nousee seisomaan viiri kädessä**, selkä puuhun. | ylhäältä loivasti, paikallaan |
| 2.7 Toverit vastaavat | `wid_reh20` → `wid_sankari_nousee` (11 s) | 8 käyrätorvea espressivo, lautaset | **Kuulee toverinsa**: siluetit nousevat harjanteelle; hän nostaa kellon ja vastaa. Roiske lammessa. | lähenee |
| 2.8 Nousu ja voitto | `wid_sankari_nousee` → `gef_viulu` (30 s) | jouset f, käyrätorvet, vasket ff: ajaa pakoon ja voitonhymni | **Nostaa viirin pystyyn, se leimahtaa punaiseksi, ja hän pyyhkäisee viirillä leveän vedon suon yli**: olennot hajoavat tippoina kaislikkoon, usva väistyy. Toverit vastaavat harjanteelta. Hän kääntyy iltaan. | sammakkoperspektiivi → laaja; taivas lämpenee iltaruskoksi |

### 3. Kumppani (`gef_viulu` → `wal_kulissi1`, 11 min 44 s). Ilta → yö. *(kirjoitettu uusiksi 31.10.2026)*

**Väripartituuri (tyyliohje luku 5, sitova):** kumppanin jakso on iltarusko, rakkausduetto on yö
(sininen ja musta), ja **purppura `#8E2457` ilmestyy ensimmäistä kertaa koko videossa rakkausduetin
huipussa** (Goethen *Steigerung*: sankarin sinooperi ja maailman sininen kohoavat ja kohtaavat
purppurassa). Se ei ole piste punoksessa, vaan koko kuvan tapahtuma: huipussa taivaan sininen
rasteri ja punainen veto painuvat päällekkäin ja koko ruutu kohoaa purppuraan, ja se laskeutuu
takaisin yöhön hellässä jälkisoitossa. Purppura näkyy videossa vain kahdesti (tässä ja
loppuduetossa), joten tämän on oltava näkyvä ja odotettu. Vastustajat ◐ taustalla vain ovella.

**Dramaturgia yhdessä lauseessa:** sankari yrittää voittaa kumppanin sankarin keinoin, ja jokainen
yritys ajaa hänet kauemmas; hän voittaa vasta, kun lakkaa esiintymästä ja odottaa. Musiikki sanoo
tämän itse: viulun soolot ovat pitkiä (30 s, 63 s), orkesterin vastaukset lyhyitä ja yhä
voimakkaampia (mp 7:14 → mf 10:05 → f 11:28 "leimahtaa"), ja sitten tulee hiljainen, rauhoittava
fraasi (12:09), lähentyminen (12:32) ja vasta sen jälkeen Ges-duurin rakkauskohtaus (13:22).

**Kumppani on viiva koko A-puolen, ei koskaan nukke.** Paperinvalkoinen yksi veto, joka seuraa
viuluviivan suuntaa ja jolla on oma ele joka mielialalle. Läheisyys näytetään sillä, missä viiva on
suhteessa ritariin (taivaalla kaukana → puiden lomassa → kämmenellä → keihään ympärillä punoksena →
olkapäällä → vierellä rannalla kaarena). Yksi paikka: **rantaniitty järven rannalla**, metsänreuna
vasemmalla, vesi oikealla; ilta jatkuu yöksi ja vene on samassa kuvassa ilman paikan vaihtoa.
Kamera: viulun sooloissa kuva on viivan korkeudella (yläkolmannes), ritarin vastauksissa maassa;
kuvat yhtyvät vasta lähentymisessä.

| Otto | Ankkurit (opas) | Musiikki | Sankari tekee | Johtaa | Kuva |
|---|---|---|---|---|---|
| 3.1 Ääni | `gef_viulu` → `gef_vastaus1` (7:02–7:14) | sooloviulu pp, harppu | **Pysähtyy ja kuuntelee**; laskee viirin maahan. Viiva piirtyy kaukana puiden latvoissa. | viiva | iltarusko; laaja; ritari pieni oikealla alhaalla, viiva ylävasemmalla |
| 3.2 Ensimmäinen vastaus | `gef_vastaus1` → `gef_viulu2` (7:14–7:21) | käyrätorvet ja patarumpu mp | **Nostaa kellon ja soittaa** lyhyen kutsun; maan viivoitus pöllähtää. | ritari | leikkaus maahan, lähikuva |
| 3.3 Keskustelu | `gef_viulu2` → `gef_vastaus2` (7:21–7:51) | viulu ja harppu pp; matalat jouset vuorottelevat | Viiva laskeutuu puiden lomaan; **hän astuu askeleen**, viiva vetäytyy; hän pysähtyy, viiva palaa. Kolme vuoroa matalien jousten mukaan. | viiva | vastaotot: puiden lomassa / ritari niityllä |
| 3.4 Toinen vastaus | `gef_vastaus2` → `gef_mielialat` (7:51–8:38) | sellot, bassot, harppu mp, H-duuri; sitten pp | **Kävelee rantaan ja istuu kivelle**, laskee kypärän viereen. Valo laskee. | ritari → viiva | laaja, aurinko puiden takana |
| 3.5 Viisi mielialaa | `gef_mielialat` → `gef_vastaus3` (8:38–10:05, 87 s) | pitkä sooloviulu pp, nopeampia kuvioita 8:44.5 | Viiva leikkii kivellä istuvan ympärillä, viisi elettä viidessä paikassa, otot jaksorajoissa: **kaipaus** pitkä laskeva kaari veden yllä (hän kallistaa päätä); **ilo** sahalaita kiveltä kivelle (hän kääntyy perässä); **kevytmielisyys** katoaa puun taakse ja ilmestyy selän takaa (hän pyörähtää); **hellyys** laskeutuu ojennetulle kämmenelle (hän polvistuu); **sarkasmi** terävä piikki, viiva pois (hän perääntyy, viiri hätkähtää). | viiva | kuva viivan korkeudella, ritari alareunassa; ilta syvenee |
| 3.6 Painokas vastaus | `gef_vastaus3` → `gef_kiihkea` (10:05–10:21) | käyrätorvet ja bassot mf, B-duuri | **Nousee, nostaa kellon ja soittaa pitkän, painokkaan vastauksen**: ensimmäinen yritys voittaa. | ritari | lähikuva, kello täyttää kuvan |
| 3.7 Kiihtyminen | `gef_kiihkea` → `gef_puupuhaltimet` (10:21–10:37) | viulu kiihkeänä 3,2 ääntä/s | Viiva kiertää hänet **pyörteeksi** ja pakenee korkealle. | viiva | kuva laajenee ylös |
| 3.8 Pisteet | `gef_puupuhaltimet` → `gef_leimahdus` (10:37–11:28) **[tarkista]** | puupuhaltimet etualalla, p–mp | Siniset pisteet metsänreunassa (arvostelijoiden kaiku, ◐). **Hän kääntyy niitä kohti keihäs kädessä**; viiva katselee ylhäältä. | puupuhaltimet | metsänreuna, matala kontrasti |
| 3.9 Leimahdus | `gef_leimahdus` → `gef_lustig` (11:28–11:42) | käyrätorvet ja vasket mf → f | **Iskee keihään maahan, viiri leimahtaa leveäksi**, pisteet hajoavat. Sankarin suurin ele, ja se on väärä ele. | ritari | lähikuva, viiri täyttää kuvan |
| 3.10 Nauru | `gef_lustig` → `gef_rauhoittava` (11:42–12:09) **[tarkista]** | viulu hyvin nopeana ja korkealla (lustig) | Viiva **nauraa koukeroin korkealla** ja loittonee kauemmas kuin koskaan. Hän seisoo yksin leimahtaneen viirin alla. | viiva | laaja; ritari pieni, viiva kuvan yläreunassa |
| 3.11 Rauhoittava fraasi | `gef_rauhoittava` → `gef_viulu3` (12:09–12:32) **[tarkista]** | matalat jouset ja harppu p | **Käännekohta: hän laskee keihään maahan, istuu ja ojentaa kämmenen ylöspäin.** Ei kelloa, ei viiriä. | ritari (hiljaa) | lähikuva kädestä ja maasta; viiri makaa |
| 3.12 Lähentyminen | `gef_viulu3` → `gef_rakkaus` (12:32–13:22) | viulu ja harppu vuorottelevat orkesterin kanssa p | Viiva laskeutuu vuoro vuorolta: latvoista, kiven taakse, kämmenelle, **olkapäälle yhdeksi kaareksi**. Vastaotot sulautuvat yhdeksi kuvaksi. Aurinko laskee veteen. | molemmat | ensimmäinen kuva, jossa molemmat ovat samassa rajauksessa |
| 3.13 Rakkauskohtaus | `gef_rakkaus` → `gef_rakkaus_hiljaa` (13:22–13:52) | Ges-duuri cantabile, koko orkesteri f, harpun glissandot | **Hän nostaa viirin, työntää veneen vesille ja soutaa**; viiva keulassa. Glissandot ovat kuun väreitä vedessä. Yö: sininen ja musta. | orkesteri | laaja: vene kuun juovalla |
| 3.14 Kahden kesken | `gef_rakkaus_hiljaa` → `gef_hiljenee` (13:52–14:37) | harppu ja viulu mp, lämmin mf 14:06 | Viiva kietoutuu viirin ympärille **punokseksi mastoon**; hän lepuuttaa airoja. | viulu, harppu | kaksi: punos lähikuvassa, kuu takana |
| 3.15 Hiljaisuus ja nousu | `gef_hiljenee` → `gef_kolkutus` (14:37–15:08) | pp, käyrätorvet hiljaa; jouset ja harppu nousevat | Vene leijuu; punos ohenee hiljaisuudessa ja **levenee nousussa**; ensimmäinen purppuran aavistus punoksen kohtaamiskohdassa (ennakointi). | jouset | liike melkein pysähtyy, ei pysähdy |
| 3.16 Ovella | `gef_kolkutus` → `gef_huippu` (15:08–15:20) **[tarkista]** | puupuhaltimet ja matala vaski kesken nousun | Olentojen siluetit nousevat kaislikosta rannalla (◐). **Hän nousee veneessä seisomaan, keihäs vaakaan, olentojen ja punoksen väliin.** | puupuhaltimet | ranta kuvan reunassa, vene keskellä |
| 3.17 Huippu: PURPPURA | `gef_huippu` → `gef_sankari_hiljaa` (15:20–15:48, huippu ~15:30) | nousu p → f, sankarin teema palaa | Olennot painuvat. **Yksi punainen veto kuun yli ritarin kärjestä** (ainoa muste tässä näytöksessä). Huipussa punainen veto ja sininen taivas painuvat päällekkäin ja **koko kuva kohoaa purppuraan**: taivaan rasteri, kuun juova ja punos. Ensimmäinen uusi väri koko videossa. | torvet | kuva nousee; veto, kuu ja purppura ainoat muodot |
| 3.18 Hellänä | `gef_sankari_hiljaa` → `gef_aalto` (15:48–16:07) | käyrätorvet hiljaa f → mp, Ges | **Hän laskee keihään veneen pohjalle ja istuu punoksen viereen.** Purppura laskeutuu takaisin yön siniseen ja jää vain punokseen. | torvet | lähikuva, kaksi muotoa |
| 3.19 Vielä aalto | `gef_aalto` → `gef_jalkihehku` (16:07–16:20) | mf | Vene kääntyy rantaan; kuun juova levenee. | jouset | laaja |
| 3.20 Jälkihehku | `gef_jalkihehku` → `gef_arvostelijat_uni` (16:20–17:56, 96 s) | pp, neljä hiljaista käyrätorvikutsua (16:20, 16:45, 17:05, 17:14.5), harppu | Rannalla: **ritari istuu selin kuuta katsoen, viiva hänen vierellään kaarena** (Friedrichin kaksi hahmoa; dueton ainoa selkäkuva). Jokaisella torvikutsulla hän **kääntää päätään oikealle horisonttiin** (ennakointi), ja viiva vetää hänet takaisin. Kolme ottoa jaksorajoissa: laaja, kaksi, taivas. | torvet hiljaa | pitkät otot, yö |
| 3.21 Uni | `gef_arvostelijat_uni` → `gef_hiljaisuus` (17:56–18:22) | puupuhaltimet pp, katkelmia | Mustat pisteet tähtien joukossa, hetkeksi. **Hän nousee ja katsoo pimeään**; viiva nukkuu kiven päällä suorana. | puupuhaltimet | taivas; ritari siluettina alhaalla |
| 3.22 Tyven | `gef_hiljaisuus` → `wal_kulissi1` (18:22–18:45) | lähes hiljaisuus | Muste kuivuu, yö haalistuu paperiksi. **Hän nostaa viirin maasta ja katsoo oikealle.** | – | tyhjä paperi, kaksi muotoa |

**Lisäykset 31.10.2026 (käyttäjän palaute renderistä: pitkäveteinen, sankari yksin veneessä, muutos puuttuu):**
- **Pizzicato ja artikulaatio näkyvät viivassa.** Jousten pizzicatot (opas: keskustelu 7:21–7:51,
  mielialat) = viivan värähdys: viiva katkeaa hetkeksi pisteiksi ja kokoontuu (tyyliohje 18:
  staccato = pisteitä). Tremolo = märkä reuna värisee. Harppu = väre vedessä. Jokaiselle
  kuunteluoppaan riville 7:02–18:45 on kuvallinen vastaus; opastarkistus mittaa myös nämä.
- **Kumppani näkyy veneessä.** Viiva seisoo keulassa korkeana kalligrafisena vetona (paperinvalkoinen,
  kuun kontrastissa), ei ohuena rihmana; punos mastossa on heidän yhteinen muotonsa. Ritari ei ole
  koskaan yksin veneessä.
- **Sankari muuttuu.** Huipun (3.17) jälkeen ritarin punaiseen viiriin jää **valkoinen juova** pysyvästi:
  viiva on osa häntä. Juova näkyy taistelussa (viulut soittavat kumppanille), kertauksessa ja
  loppuduetossa, ja se on tyyliohjeen luvun 10 mukainen (kumppani ◐ taustalla = juova viirissä).
  Vastaavasti viivaan jää huipun jälkeen punainen piste (hänen muste). Tämä on riimi, joka kertoo
  muutoksen ilman selitystä.

Mittakaava: viulun sooloissa ritari on pieni (alle kymmenesosa kuvan korkeudesta) ja viiva
hallitsee yläkolmannesta; vastauksissa lähikuva. Sama sommitelma ei kestä yli 30 s, ja jokaisessa
otossa on yksi hallitseva muoto (viiva, kello, viiri, käsi, vene, kuu, purppura).

## NÄYTÖS II: KEHITTELY (A-puolen loppu ja B-puolen alku)

### 4. Taistelu (`wal_kulissi1` → `wal_kertaus`, 6 min 27 s). Myrsky-yö → aamun valkeneminen.

| Otto | Ankkurit | Musiikki | Sankari tekee | Kuva |
|---|---|---|---|---|
| 4.1 Kutsu | `wal_kulissi1` → `wal_taistelu` (47 s) | kulissitrumpetit kaukaa, orkesteri vastaa, hiljaisuus, toinen kutsu | **Kuulee kutsun, nostaa kumppanin satulaan taakseen ja ratsastaa kentälle**; kolme viiriä horisontissa, toisella kutsulla lähempänä. Hiljaisuudessa friisiin jää aukko. | kaukana → lähestyy; kenttä puupiirroksena |
| 4.2 Patarummut | `wal_taistelu` → jaksoraja (7 s) | patarummut f, 3/4 | **Pysäyttää hevosen kentän laidalle ja laskee viirin vaakaan** (hyökkäysasento). | kenttä tummuu mustaksi ja punaiseksi |
| 4.3 Rynnäkkö | jaksoraja → `wal_puolenvaihto` (44 s) | trumpetit ja virvelit, kasvu f | **Ratsastaa olentojen läiskiä päin ja lyö viirillä fraaseittain**; trumpettien kiilat ja virvelien pisteviivoitus. Salamat mitatuissa iskuissa. | kamera sukeltaa kerrosten läpi |
| 4.4 Sivun kääntö | `wal_puolenvaihto` → `wal_b_jatkuu` (A:n loppu + B 0–13,6 s) | A katkeaa; B:n sisäänajoura | Kamera vetäytyy, **kenttä kiertyy A-levyksi** (väripartituuri renkaina), levy kääntyy, B:n ura aukeaa samaan kenttään. | levy |
| 4.5 Hyökkäys | `wal_b_jatkuu` → `wal_kumppani` (36 s) | taistelu jatkuu, trumpettien ja käyrätorvien huudot ff | **Ritari keskellä läiskien parvea; hän kaatuu melkein satulasta**, nousee. | tihein kuva; jokaisella hahmolla oma syvyys |
| 4.6 Kumppani rinnalla | `wal_kumppani` → `wal_rynnakko` (11 s) | jouset ja viulut mf, lyömäsoittimet pois | **Kumppanin viiva kiertää häntä ja ompelee sameuden auki** hänen ympäriltään; hän hengittää ja nostaa viirin. | valo aukeaa hetkeksi |
| 4.7 Uusi rynnäkkö | `wal_rynnakko` → `wal_huippu` (67 s) | trumpetit, virvelit, patarummut ff; sankarin teema taistelee | **Hän ratsastaa läpi; teemaviiva piirtyy taistelun läpi** ja läiskät leikkaavat sitä. Otot vaihtuvat jaksorajoissa. | sukellus syvemmälle |
| 4.8 Kaaos | `wal_huippu` → `wal_jouset` (45 s) | kiihkein ff, kaikki teemat vastakkain, Ges ja es-molli | **Sankari repeää roiskeiksi** (haboku): hahmo hajoaa vedoiksi läiskien keskelle ja **kokoontuu iskuissa lyömään**. Kohdistus hajoaa kauimmas. | kuvan tihein hetki |
| 4.9 Hengähdys | `wal_jouset` → `wal_huippu2` (41 s) | jouset f c-molli, lyömäsoittimet pois | **Hän seisoo yksin savun keskellä, viiri riekaleina**, kumppanin viiva etsii hänet. | kamera pysähtyy melkein; harmaa |
| 4.10 Viimeinen rynnäkkö | `wal_huippu2` → `wal_katko` (40 s) | ff F-duuri, ratkaisu lähenee | **Nousee ratsaille ja ajaa läiskät kentän laitaan.** | nousee |
| 4.11 Katko | `wal_katko` → `wal_kertaus` (25 s) **[tarkista]** | äkillinen katko ff → hiljaa → ff | **Isku:** koko kenttä vaikenee yhden ruudun, läiskät hajoavat tippoina paperille. | paperi välähtää? ei: valo nousee alhaalta |

### 5. Kertaus (`wal_kertaus` → `fri_alku`, 2 min 35 s). Keskipäivä. **Kulta 1/2.**

| Otto | Ankkurit | Musiikki | Sankari tekee | Kuva |
|---|---|---|---|---|
| 5.1 Paluu | `wal_kertaus` → `wal_riemu` (7 s) | käyrätorvet ja trumpetit ff, Es-duuri | **Selkäkuva 3 avauksen laaksossa, samasta kulmasta** (1.1), mutta keskipäivän valossa; viiri on ehjä. Kohdistus loksahtaa. | kulta ilmestyy viirin reunaan |
| 5.2 Riemu | `wal_riemu` → `wal_kumppani2` (60 s) | riemukas Es-duuri koko orkesterilla, toistuvat kahdeksasosat | **Hän nousee harjanteelle ja soittaa**; toverit nousevat ympärille, viirit yhdessä tuulessa; teemaviiva kultaisena. Otot jaksorajoissa: laaja, rivi, lähikuva. | laaja; kaikki kerrokset liikkeessä |
| 5.3 Kumppani voittajana | `wal_kumppani2` → `wal_vasket3` (33 s) | viulut ja jouset f, Ges | **Kumppani astuu hänen rinnalleen**; viiva kiertyy viirin varren ympäri kuin nauha lipputangossa. | hidas lähestyminen |
| 5.4 Vasket | `wal_vasket3` → `wal_cantabile` (16 s) | käyrätorvet ja trumpetit ff | **Joukko nostaa kellot**; sädekehä palaa taivaalle ratkaistuna (vastaus 1.17:n kysymykseen). | korkealla |
| 5.5 Cantabile | `wal_cantabile` → `fri_alku` (39 s) **[tarkista]** | trumpetin uusi teema, moduloiva nousu, ff → mf | **Hän kääntyy ja kävelee pois harjanteelta alas**; kamera nousee ja laakso alkaa kiertyä levylavaksi. | vetäytyy; iltapäivän kulta |

## KOODA (B-puoli)

### 6. Rauhantyöt (`fri_alku` → `wel_alku`, 5 min 9 s). Kultainen iltapäivä → hämärä. Näyttämö.

Sankari on taiteilija. Lava on levy, se pyörii, kamera ei. Lainausten ajat ovat **[tarkista]**.

| Otto | Ankkurit | Musiikki | Sankari tekee | Kuva |
|---|---|---|---|---|
| 6.1 Hiljaisuus | `fri_alku` → `fri_elegia` (8 s) | lähes hiljaista, käyrätorvet hiljaa | **Istuu yksin levylavan reunalla** ja riisuu kypärän (kasvot jäävät varjoon). Keihäs lepää. | lava tyhjä, harppu lavasteena |
| 6.2 Elegia | `fri_elegia` → `fri_puupuhaltimet` (69 s) | harppu hallitsee pp, fagotti, englannintorvi, jouset | **Hän nostaa keihään ja se on tahtipuikko**: ensimmäinen liike nostaa luukusta Don Juanin liekin (punainen veto) ja Zarathustran auringon vastakkain. Viiri piirtää nuottiviivastoa friisiin. | lava kääntyy kuvaelmasta toiseen |
| 6.3 Lainaukset | `fri_puupuhaltimet` → `fri_nousu` (100 s) | puupuhaltimet korkealla, käyrätorvisoolo | **Hän johtaa**: Tod und Verklärungin nouseva valo (paperi), Don Quixoten tuulimylly (hän kumartaa sille hymyillen: peili palaa), Till Eulenspiegelin kiemura, Guntramin harppu, Macbethin kruunu. Jokainen teos on tanssija, joka nousee luukusta ja väistyy. Otot ankkureissa. | kultainen iltapäivä; lava pyörii |
| 6.4 Kaikki yhdessä | `fri_nousu` → `fri_huippu` (73 s) | f, viulut, sävellaji liikkuu | **Teokset kietoutuvat yhteen hänen ympärillään**, ja hän johtaa niitä kasvavin liikkein (vyötärön korkeudella). | nousee ylhäältä (Berkeley) |
| 6.5 Huipennus ja hiipuminen | `fri_huippu` → `fri_traum` (49 s) | kaksi huippua, pitkä hiipuminen | **Hän laskee kätensä, ja teokset laskeutuvat luukkuihin yksi kerrallaan.** | valo laskee hämärään |
| 6.6 Traum | `fri_traum` → `wel_alku` (11 s) **[tarkista]** | tenorituuba, hiljaisuus | **Lava pysähtyy; hän pukee kypärän takaisin.** Rasteri pehmenee. | hämärä lukittuu |

### 7. Pako maailmasta ja täyttymys (`wel_alku` → `wel_loppusointu`, 9 min 17 s). Ranta → meri, auringonlasku → yö.

| Otto | Ankkurit | Musiikki | Sankari tekee | Kuva |
|---|---|---|---|---|
| 7.1 Ranta | `wel_alku` → `wel_agitato` (14 s) | harppu pp, viulu p | **Kävelee rantaan**, kumppani odottaa veneen luona. | hämärä ranta |
| 7.2 Agitato | `wel_agitato` → `wel_dehring1` (40 s) | jouset f kiihkeästi, katkoja; arvostelijamotiivi | **Olentojen tipat seuraavat häntä rantaan**; hän kiihtyy, kääntyy, viiri nykii. | kamera kiihtyy jousten mukana |
| 7.3 Dehring kahdesti | `wel_dehring1` → `wel_sankari_ajaa` (6 s) **[tarkista]** | kaksi lyhyttä väliintuloa hiljaisuudessa | Kaksi tuubakotiloa kivillä (kvintti); **hän pysähtyy ja katsoo niitä.** | lähikuva |
| 7.4 Ajaa pois | `wel_sankari_ajaa` → `wel_viulu` (18 s) | käyrätorvet ja vasket mf, patarumpu | **Hän iskee keihään maahan kerran**: kotilot vetäytyvät kuoriinsa ja vierivät veteen. Ei väkivaltaa. | roiske; viiri leimahtaa |
| 7.5 Lohdutus | `wel_viulu` → `wel_hiljaisuus` (27 s) | sooloviulu p | **Kumppani silittää viirin rypyt suoriksi**; hän laskee keihään. | lähikuva käsistä |
| 7.6 Pastoraali | `wel_pastoraali` → `wel_sankari_lempea` (35 s) | englannintorvi: sankariteema maalaisena | **Hän katsoo veteen: kuva on ehjä** (englannintorvi sovittaa sen, mitä vääristi). **Vihreä ensimmäisen kerran** rannan kaislikossa. Hän **nostaa punaisen purjeen**. | ensimmäinen vihreä; valo lämmin |
| 7.7 Lempeä teema | `wel_sankari_lempea` → `wel_rauhan_teema` (34 s) | käyrätorvet ja harppu p, B-duuri | **He työntävät veneen vesille ja nousevat kyytiin.** | rasteriliukuma merelle |
| 7.8 Rauhan teema | `wel_rauhan_teema` → `wel_nousu` (30 s) | viulu p, Es/As | **Kumppani istuu keulassa; viulun teema on purjeen saumana.** | tyyni meri, auringonlasku |
| 7.9 Suuri nousu | `wel_nousu` → `wel_patarummut` (44 s) | nousu p → mf, käyrätorvet, suuri huippu f | **Täysi purje avomerellä**; sankari seisoo peräsimessä ja soittaa; teemaviiva piirtyy taivaalle leveänä. | kamera korkealla, laaja |
| 7.10 Muisto taistelusta | `wel_patarummut` → `wel_viulu2` (54 s) **[tarkista]** | patarummut, viimeinen kuohu f | Horisontissa välähtää taistelun musta ja punainen friisi vedoksena; **hän katsoo sitä eikä käänny.** | kaukainen vedos; iltarusko |
| 7.11 Vetäytyminen | `wel_viulu2` → `wel_rauhan_kasvu` (34 s) | äkillinen hiljaisuus, viulu pp | **Hän laskee keihään veneen pohjalle ja istuu kumppanin viereen.** | lähikuva; meri tyyntyy |
| 7.12 Täyttymys kasvaa | `wel_rauhan_kasvu` → `wel_duetto` (38 s) | matalat jouset mp → f, Es-duuri | Aurinko laskee mereen; **vene kääntyy sitä kohti.** | laaja |
| 7.13 Duetto | `wel_duetto` → `wel_muistot` (66 s) | käyrätorvi ja viulu vuorottelevat | **Selkäkuva 4: kaksi hahmoa keulassa**, viiri ja viiva vaihtavat paikkaa fraasi fraasilta. **Purppura toisen kerran.** | hidas lähestyminen |
| 7.14 Viimeiset muistot | `wel_muistot` → `wel_hiljaisuus2` (37 s) | matalat jouset ja harppu, viulu korkealla, käyrätorvi | Kamera vetäytyy, ja **koko matka alkaa painua friisiksi** taivaalle: aamun harjanne, suo, joki, kenttä. | vedos |
| 7.15 Sointu kantaa | `wel_hiljaisuus2` → `wel_fanfaari` (35 s) | lähes hiljaisuus, Es-duuri kantaa | **Vene on pieni piste**; friisi kiertyy spiraaliksi. | vetäytyy |
| 7.16 Fanfaari | `wel_fanfaari` → `wel_loppusointu` (24 s) | vasket pp → ff, patarumpu | **Hän nostaa kellon soittoasentoon**, toverien kellot vastaavat rannalta, majakan sädekehä syttyy kolmannen kerran. Ei ojennettua kättä. | kamera pysyy etäällä (teos meinasi päättyä hiljaa) |
| 7.17 Loppusointu | `wel_loppusointu` → loppu | Es-duuri ff → mp, hiipuu; loppuura | **Kulta 2/2.** Friisi sulkeutuu ensōksi, levyn uraksi; neula nousee; levy pyörii ja rahina jatkuu. | levy; häivytys |

---

## Taustatutkimuksen motiivit ja niiden paikat (lisätty 31.10.2026)

Lähteet: `heldenleben_tutkimus.md` (Porter, Kennedy, Wikipedia en/de), `tutkimus_disney.md`, `tutkimus_muste.md`.
Jokainen motiivi on sidottu ankkuriin ja osaan; osan brief sisältää omat rivinsä. Tulkinnaksi merkityt
ovat kuvia, eivät väitteitä musiikista.

| Motiivi (lähde) | Kuva | Ankkuri / otto | Osa |
|---|---|---|---|
| Yhdeksän vastustajaa Porterin järjestyksessä: huilu, oboe, lautaset, englannintorvi, Dehring (2 tuubaa kvintteinä), oboe, englannintorvi (vääristää sankariteeman), 2 fagottia, 3 sordinoitua pasuunaa | olennot ilmestyvät tässä järjestyksessä, kukin oman soittimensa fraasilla; ei kaikki kerralla | `wid_1_huilu` → `wid_kuoro`, 2.1–2.2 | 2 |
| Dehring = kaksi tuubaa rinnakkaisina kvintteinä (sääntörikkomus) | kaksi kotiloa kvintin päässä toisistaan, nijimi-renkaat sulautuvat; "Dok-tor Deh-ring" -rytmi askelina | 2.2, 2.6; B: `wel_dehring1` (vierii pois) | 2, B |
| **Englannintorven kaari**: vastustajana vääristää sankariteeman, finaalissa sovittaa sen pastoraaliksi | haikara piirtää ritarin punaisen vedon **mustina pisteinä** (rasterikarikatyyri, tulkinta); B-puolella sama haikara piirtää sen pehmeänä kaarena vihreässä | 2.2 (toinen englannintorvi); B `wel_pastoraali` 7.6 | 2, B |
| "Sankari ei aluksi välitä (teema hiljaa ja tummasti), menettää kärsivällisyytensä, ajaa pakoon, pieni voitonhymni" (Porter) | ritari ensin selin, viiri alhaalla; sitten keihäs vaakaan, olennot hajoavat; kello ylös | 2.3 → 2.6 → 2.8 | 2 |
| Kennedy: teema molliin, vaskifanfaari pienentää kriitikot | olennot kutistuvat fanfaarilla (koko = voimakkuus, luku 13) | `wid_fanfaari` **[tarkista ankkuri]** | 2 |
| Viulu aavistaa kadenssissa teeman, joka hallitsee viimeistä jaksoa (de) | viivan yksi ele (hidas laskeva kolmisointu) palaa B-puolen Es-duurin rauhan teemassa samana muotona (riimi) | 3.5 tai 3.12 **[tarkista korvalla]**; B `wel_rauha` | 3, B |
| "Meet the Soundtrack": viivan reuna vaihtuu artikulaation mukaan | kumppanin viiva: legato = pehmeä reuna, staccato = katkonainen, sarkasmi = terävä | 3.5 viisi mielialaa | 3 |
| Kumppani musteettomana (Tōhaku): viiva on paperin kaistale sinisessä laveerauksessa, poissaolo | viiva leikkaa taivaan rasterin auki, ei valkoista maalia päälle | koko 3 | 3 |
| Vastustajat kolkuttelevat ovelle rakkausduetossa (Porter) | olentojen siluetit kaislikossa ◐ | 3.16 `gef_kolkutus` | 3 |
| Vastustajien katkelmat "unisessa hiljaisuudessa" (de) | mustat pisteet tähtien joukossa | 3.21 | 3 |
| Kulissitrumpettien fanfaari toistuu orkesterin trumpeteissa | kaukana horisontissa → lähellä etualalla | `wal_kulissi1` → `wal_trumpetit` | 4 |
| 3/4-taisteluhuudot = vastustajien ensimmäisen teeman "bisarri muunnelma" (de) | hyttynen (huilu) kasvaa hirviömäiseksi mustan musteen pyörteeksi | 4.x ensimmäinen 3/4 **[tarkista]** | 4 |
| Viulut soittavat suloisia melodioita kumppanille taistelussa (de) | viiva ritarin takana, ohuena, ei katkea | 4.x | 4 |
| Kohtaloiskut roiskemusteena: yksi läiskä per kirjoitettu isku, jää friisiin (muste 5.2) | `splat` iskun ruudulla, koko z:stä; ei välkettä | kaikki `isku`-kohdat | 1, 2, 4 |
| Pikkusievyys kielletty (Fischinger): pisteiden on luettava kontaktiarkissa 270 px | olentojen ja pisteiden koko mitoitetaan kontaktiarkista | – | 2, 4 |
| Kertauksen alussa myrsky väistyy ja jättää Tōhakun mäntymetsän (muste 5.5) | paperia ja muutama veto, sitten kulta | B `wal_kertaus` | B |
| Ave Marian 217 jalan otto: pimeästä valoon yhtenä ottona | rauhantöiden ja täyttymyksen loppu yhtenä kamera-ajona, friisi kiertyy levyksi, kulta vasta tässä | B 6.x → 7.x | B |
| Rauhantöiden lainaukset Porterin järjestyksessä (Don Juan ensin, Traum durch die Dämmerung tenorituuballa viimeisenä: "tunnelma lukittuu") | näyttämön tunnukset tässä järjestyksessä | B `fri_*` **[tarkista]** | B |
| Don Quixote -peilikuva (ironinen kerros) | ritarin varjo näyttää hetken Quijotelta: vain Don Quixote -lainauksen kohdalla | B `fri_quixote` **[tarkista]** | B |

## Toistuvat kuvat (riimit)

| Kuva | Kerrat |
|---|---|
| selkäkuva | 1.1 avaus · 1.17 sädekehä · 5.1 kertaus · 7.13 duetto (+ 3.12 kaksi hahmoa kuun alla) |
| aurinko korkeimmassa paikassa | 1.3 nousu · 1.17 sädekehä (kysymys) · 2.5 muisto · 5.4 sädekehä (vastaus) · 7.16 majakka (jäähyväiset) |
| peili vedessä | 2.2 Quijote · 6.3 tuulimylly · 7.6 ehjä ja vihreä |
| teemaviiva friisissä | 1.1 · 1.11 · 2.4 (molli) · 3.11 · 4.7 · 5.2 (kulta) · 7.9 · 7.14 |
| hajoaminen vedoiksi | 1.9 hellyys · 4.8 kaaos · 7.14 koko matka |
| Dehring | 2.2 · 2.6 · 7.3 (vierii pois) |
| levy | alku · 4.4 · 7.17 |

## Säästetyt värit

- **kulta:** 5.1–5.4 ja 7.17
- **purppura:** 3.11 ja 7.13
- **vihreä:** 7.6:sta loppuun

## Tarkistettavat ennen tuotantoa

Oppaan [tarkista]-kohdat: 3.5, 3.7, 3.10, 4.11, 5.5, 6.3 (lainausten ajat), 6.6, 7.3, 7.10 sekä
puolenvaihdon musiikillinen jatkuvuus (4.4). B1-paketin iskuanalyysi on ajettava uudelleen
(naksahduksentunnistus). Nämä kuunnellaan ennen kuin niitä kuvataan.
