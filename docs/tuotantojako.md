# Tuotantojako: "Punainen muste" osissa

*Sovittu käyttäjän kanssa 31.10.2026. Ohjaaja (pääistunto) kirjoittaa ohjauksen, tarkastaa osat ja
kokoaa; jokainen osa tehdään omassa istunnossaan, joka lukee vain tässä nimetyt lähteet.*

## Tuotantosääntö: mallit ja kustannus (käyttäjän vaatimus 31.10.2026)

Vain ohjaajan pääistunto käyttää Fablea. **Jokainen osaistunto ja aliagentti käynnistetään
Sonnetilla** (mekaaninen tai vain lukeva työ Haikulla). Istunto ilman model-parametria on virhe.
Osaistunnot käyttävät omia tarkistaja-aliagenttejaan myös Sonnetilla. Käyttörajaan pysähtynyt
istunto herää itsestään ja jatkaa vanhalla ohjeella: ohjaaja pysäyttää tai ohjeistaa sen ennen
korvaavan käynnistämistä.

## Lähteet, jotka jokainen osa lukee, tässä järjestyksessä (eikä muuta)

**Järjestys on sitova (käyttäjän vaatimus, toistettu joka kierroksella; kirjattu 1.11.2026 harpun
"emämoan" jälkeen).** Tyyli luetaan kokonaan ennen palautetta, ohjausta ja koodia.

1. `docs/visuaalinen_tyyli.md` **kokonaan** (ei lukuvalikoimaa). Erityisesti luvut 2 (vedos), 4 (kielioppi:
   piste, viiva, taso), 5 (väripartituuri), 8 (liike), 10 (henkilöt), 13 (selkeys), 15 (mitä vältämme), 18 (muste
   ja Disney, soitin = elementti -taulukko).
2. `docs/kuvasaannot.md` – tyyliohjeen tiivistys kuvasäännöiksi; kohta 8 nimeää soitinten elementit.
3. `docs/ohjaus.md` – oma näytös (otot, ankkurit, sankarin teko, kuka johtaa kuvaa).
4. `docs/palautelista.md` – käyttäjän palaute; osa käydään sitä vasten ennen luovutusta. **Palautteen rivi
   luetaan tyyliohjeen läpi:** käyttäjän sanat kertovat, mikä ei toimi; tyyliohje ja kuvasäännöt kertovat, millä
   elementillä se korjataan. Palaute ei koskaan oikeuta kirjaimelliseen soittimeen tai esineeseen, jonka tyyli kieltää.
5. `annotations/kuunteluopas.md` ja `annotations/cues.json` (ajat vain ankkureista `S.A(id)`).
6. `runs/muste-1230/storyboard.md` vain taustaksi; ristiriidassa ohjaus.md voittaa.

**Ristiriita:** jos brief, ohjaus tai palautelista pyytää jotain, mikä rikkoo tyyliohjetta tai kuvasääntöjä, tyyliohje
voittaa, ja osa kysyy ohjaajalta `pyynnot.md`:ssä ennen toteutusta. Osa kirjaa tarkistus.md:hen, että se luki
tyyliohjeen kokonaan ennen työtä.

Kielletyt: README.md, aiemmat ajot, `audio/`, `build/`, `annotations/` (vain luku). (`CLAUDE.md` latautuu joka
istuntoon automaattisesti, eikä sitä kielletä: sen tyyli- ja elesäännöt sitovat myös osia.)

## Ohjaajan briefin säännöt (opittu 31.10.2026: harppu)

v2:n harpunmuotoinen valosilta syntyi ohjaajan briefistä, ei osan omasta päästä: brief kirjoitti viaksi
"valkoinen kaari ei tunnistu harpuksi" ja vaatimukseksi "selvästi luettava elementti", ja kriitikon kohta pyysi
"harpun pitäisi näkyä selvästi". Osa ja kriitikko tekivät täsmälleen sen. Siksi:

1. Briefin ensimmäinen rivi on aina: *"Lue ensin `docs/visuaalinen_tyyli.md` kokonaan ja `docs/kuvasaannot.md`;
   ne voittavat tämän briefin."*
2. Palautteen "Mitä pitää näkyä" kirjoitetaan **elementtinä kuvasääntöjen sanoin** (harppu = kuun sillan välke
   ja renkaat; pizzicato = pisteet; patarumpu = pöllähdys), ei soittimena. Kiellettyjä sanamuotoja: "tunnistuu
   X:ksi", "X näkyy selvästi", "luettava X", kun X on soitin tai esine, jonka tyyli kuvaa elementtinä.
3. Käyttäjän sanat lainataan sellaisinaan ja käännetään perään elementiksi: *käyttäjä: "harppu ei näy" →
   elementti: sillan välke liian heikko ja väärin ajoitettu*.
4. Kriitikon kohdan `piti_nakya` kirjoitetaan samalla säännöllä, ja kriitikko tarkistaa aina säännön hengen
   (kriitikko-luku, kohta 3).
5. Lainaukset Straussin muista teoksista (Guntramin harppu, Don Quixoten mylly, Tillin kiemura) ovat vain
   Rauhantöissä (B-puoli). A-puolen ohjauksessa oleva "harppupuu" (2.1, suo) on tämän säännön vastainen ja odottaa
   käyttäjän päätöstä (palautelista D8).

## Pääosasääntö (kuka johtaa kuvaa)

Pääosa on se, joka musiikissa puhuu. Käyrätorvet ovat sankari.

| Musiikissa | Kuvassa johtaa |
|---|---|
| Käyrätorvet soittavat teemaa tai toimivat | ritari tekee (hahmo, teko, lähikuva) |
| Käyrätorvet laulavat sisäisesti (lyyrinen, hellä, hiljainen) | viiri tai muste yksin; ritari pieni tai hajonnut |
| Käyrätorvet vaiti, toinen soitin puhuu | toinen on pääosassa, ritari kuuntelee pienenä tai poissa |
| Tutti ilman torvia (vaski, iskut) | maailma johtaa: salamat, putous, taistelun läiskät |

Osuudet A-puolesta suunnilleen: ritari tekee 40 %, viiri/muste 15 %, toinen johtaa 35 %, maailma 10 %.
Tarkistaja katsoo stilleistä, että otto noudattaa sarakettaan.

## Kuunteluopas kuvaksi: soitinroolit ja opastarkistus

Disneyn oppi (tyyliohje luku 18): jokainen soitin on hahmo tai elementti, ja se näkyy silloin, kun
se soi, ei muulloin. Kuunteluoppaan jokainen aikakoodattu kohta saa kuvallisen vastauksen, ja
vastaus mitataan ääntä vasten.

**Soitinroolit** (`visual/muste/roolit.json`, vaihe 0 kirjoittaa, osat täydentävät omalta alueeltaan):

| Soitin / kanava | Elementti kuvassa |
|---|---|
| käyrätorvet | ritari (teko) ja viirin punainen muste |
| sellot, bassot | maa: vuorten rasteri, harjanteet, maan viivoitus |
| viulut, alttoviulut | usvat, tuulen viivoitus, kuun väreet |
| sooloviulu | kumppanin valkoinen viiva |
| huilu, oboe, englannintorvi, klarinetti, fagotti | soitinolennot (tiirat merellä, suon olennot, pisteet puiden takana) |
| trumpetit, pasuunat, tuuba | aurinko, salamat, taistelun mustat kiilat |
| patarummut | maan pöllähdys, ryöpyt |
| harput | välkerenkaat, glissando = kuun väreet, putouksen ryöpyt |
| lautaset, pikkurumpu | taistelun iskut (elementin teko) |

**Opastarkistus** (`render/opascheck.mjs` + `analysis/opastarkistus.py`, vaihe 0 rakentaa):
1. Sivu antaa `window.opasProbe(t)`: elementtien tila hetkellä t (ritarin asento, musteen pituus ja
   kärjen korkeus, kunkin olennon näkyvyys ja ele, valon taso, oton tunnus, kameran paikka).
2. Jokaiselle `annotations/cues.json`:n teema-ankkurille (= kuunteluoppaan aikakoodattu kohta)
   `visual/muste/vastaukset.json` nimeää kuvallisen vastauksen (mikä elementti, mikä muuttuu).
   Ankkuri ilman vastausta on virhe; vastaus, jonka elementti ei muutu ±1 ruudussa ankkurista
   (tilavertailu t−0,5 s / t / t+0,5 s), on virhe.
3. Soitinroolit ääntä vasten: paketin `listen.f32`-kanavista (soittimien aktiivisuus) ja
   `teemaviiva.json`:sta tarkistetaan, että elementti liikkuu, kun soitin soi (korrelaatio
   kanavan ja elementin tilan välillä ikkunoittain), ja on levossa, kun soitin on vaiti; punaisen
   musteen kärjen korkeus seuraa teemaviivan midiä (Spearman > 0,8 avauksessa).
4. Raportti `runs/muste-1230/<osa>/opastarkistus.md`: ankkuri, oppaan sana, vastaus, mitattu
   muutos, tulos. Osa on valmis vasta, kun raportissa ei ole virheitä.

## Muste säästeliäästi (ohjaajan korjaus 31.10.2026 käyttäjän palautteen jälkeen)

Perustan stillit (`runs/muste-1230/perusta/t015.0.png`, `t150.0.png`) näyttivät, että kärjen jättämä
veto joka paikassa rikkoo tyyliohjetta: luku 13 kohta 2 (yksi pääosa kerrallaan), kohta 6 (kuvan
tiheys seuraa orkestraation tiheyttä) ja luku 18 ("melodiaa ei näytetä koko ajan, vaan silloin, kun se
halutaan tuoda esiin"; "koko kuva ei läikähdä jokaisessa äänessä"). Kahdeksan vetoa kahdeksan ritarin
yllä oli sekava, ja avauksessa veto kilpaili ritarin kanssa.

**Sääntö:** melodiaviiva mustetta on A-puolella vain neljässä kohdassa, ja silloin se on kuvan ainoa
pääosa (ritari pieni, taivas tyhjä, ei muita liikkuvia elementtejä):

| Kohta | Ankkurit | Muoto |
|---|---|---|
| Avaus, käyrätorvisoolo | `held_alku` → `held_viulut` (→ `held_vasket_t13` haalistuen) | yksi veto, teemaviivasta nuotti nuotilta; ritari selkäkuvana pienenä alhaalla |
| Kahdeksan käyrätorvea | `held_reh8` → `held_reh9` | **yksi** leveä veto rivin yllä (ei kahdeksaa); ritarit vain nostavat kellot |
| Teeman paluu kosinnan huipussa | `gef_huippu` → `gef_sankari_hiljaa` | yksi veto kuun yli, purppura kohtaamiskohdassa |
| Hajoaminen (sisäinen ääni) | `held_reh6` → `held_t61` | hahmon vedot juoksevat kahdeksi vedoksi (ei kärjen jälki) |

Muualla viiri on viiri yhdessä tuulessa, ei sivellin. `tipTrail` kytketään pois muista paikoista
(meri, niitty, myrsky muuten kuin reh8, suo, metsä, joki, taistelu). Kumppanin valkoinen viiva on
hahmo, ei melodiaviiva: se piirtyy vain viulun soittaessa ja seuraa suuntaa, mutta se on ohut ja
yksin taivaalla.

**Melodia korostetaan muuten kuvan muutoksella, ei musteella:** leikkaus fraasin alkuun, kamera
nousee linjan mukana, horisontin tai auringon paikka vaihtuu, valo muuttuu. Kaikki muu ruudulla
seuraa soitinrooleja (`roolit.json`): mikä soi, se liikkuu; mikä on vaiti, on levossa.

**Kumppani on viiva koko A-puolen, ei koskaan nukke** (päätös 31.10.2026: hahmo oli koominen eikä tehnyt mitään). Ohjaus luku 3 kirjoitettu uusiksi 22 otoksi; purppura on koko kuvan tapahtuma huipussa (tyyliohje luku 5).

**Väripartituuri sitoo jokaista osaa** (tyyliohje luku 5): osan brief nimeää jaksonsa taustavärin ja sen, näkyykö erikoisväri (kulta: kertaus ja loppu; purppura: rakkausduetin huippu ja loppuduetto; vihreä: pastoraalista loppuun). Erikoisvärin saapuminen on koko kuvan tapahtuma, ei yksityiskohta.

## Stillisääntö (jokainen pysäytetty ruutu on kuva)

Tarkistaja arvioi jokaisen oton stillin näillä, ja otto ei ole valmis ennen kuin kaikki täyttyvät:
1. **Yksi hallitseva muoto** (aurinko, harjanne, veto, vene) ja enintään kolme elementtiryhmää.
2. **Kolmasosa tyhjää** (taivas tai paperi), eikä mitään liikkuvaa tyhjässä kolmanneksessa.
3. **Mittakaava kertoo:** ritari on pieni maailmaa vasten (laaja) tai täyttää kuvan (lähikuva);
   ei keskikokoa, jossa hän on vain "siellä".
4. **Pääääni täydessä värissä, sivuääni rasterina, säestys sinisenä** (luku 7).
5. **Siluetti luettavissa** yhdellä silmäyksellä: hahmon teko näkyy ääriviivasta.
6. Tiheys vastaa orkestraatiota: soolo = yksi asia kuvassa; tutti = täysi kuva, mutta järjestetty.

## Tiedostorajat

Yhteiset tiedostot (vain vaihe 0 kirjoittaa; osat vain lukevat ja kutsuvat):
`visual/muste/brush.js`, `ink.js`, `paper.js`, `puppets.js`, `hero.js`, `signals.js`, `world.js`,
`data.js`, `companion.js`, `critters.js`, `main.js`, `index.html`, `render/*`, `analysis/*`.

Osakohtaiset tiedostot (vain oma osa kirjoittaa):

| Osa | Ankkurit | Kohtaustiedosto | Paikkatiedostot |
|---|---|---|---|
| 1 Sankari | `held_alku` → `held_gp` | `visual/muste/scenes_1.js` | `loc_valley.js`, `loc_sea_muste.js`, `loc_meadow.js`, `loc_storm.js` |
| 2 Vastustajat | `wid_1_huilu` → `gef_viulu` | `scenes_2.js` | `loc_swamp.js` |
| 3 Kumppani | `gef_viulu` → `wal_kulissi1` | `scenes_3.js` | `loc_shore.js` (rantaniitty: metsänreuna, järvi, vene; korvaa loc_forest.js + loc_river.js) |
| 4 Taistelu (A) | `wal_kulissi1` → A-puolen loppu | `scenes_4.js` | `loc_battle.js`, `record.js` |

`main.js` kokoaa kohtaustiedostot (`SCN = [...s1, ...s2, ...s3, ...s4]`) ja paikat; osa lisää uuden
paikan `LOCS`-taulukkoon vain omalla kirjaimellaan, ei muuta main.js:ää muuten. Jos osa tarvitsee
muutoksen yhteiseen tiedostoon, se kirjoittaa pyynnön `runs/muste-1230/pyynnot.md`:hen eikä tee sitä.

## Vaihe 0: perusta (ennen osia, yksi tekijä)

1. **Viirin jättämä muste** (`brush.js`): keihään kärki jättää maailmaan punaisen vedon, jonka korkeus
   seuraa teemaviivaa (`teemaviiva.json`, muuten `S.melody`); veto venyy tuulessa, kuivuu rasteriksi
   ja häipyy (`inkAge`); piirtyy vain, kun käyrätorvi/sello soi (`heroGate`). Puhdas `seek(t)`: rata
   lasketaan kärjen paikasta hetkillä t−τ. Kameraan kiinnitetty friisinauha (`mkFrieze`, `FRIEZE_N`)
   poistetaan. Kumppanille sama valkoisena viuluviivan suunnasta.
2. **Asentokirjasto** (`puppets.js`/`hero.js`): seisonta, kävely, kääntyminen, polvistuminen,
   istuminen, soutu, keihään isku maahan, kämmenen ojennus matalalla, kellon nosto soittoasentoon,
   keihään nosto molemmin käsin. Siirtymät fraasin mittaisia, ei pomppuja. Ei natsitervehdystä
   muistuttavia asentoja (CLAUDE.md).
3. **Syaani pois**: `ink.js`-jälkikäsittelyn RGB-kanavasiirto korvataan laattojen kohdistusvirheellä
   (alle 2 px, vain laatoissa).
4. **Tarkistin**: `videotarkistus.py` käyttää vain videon puolen paketteja (A: demo400, A2, A3) ja
   erottaa suunnitellut iskut (teemakartan `isku`) aksenttien kohinasta.
5. **Jako**: `scenes.js` jaetaan tiedostoihin `scenes_1..4.js` nykyisen sisällön mukaan ilman
   sisältömuutoksia; `main.js` kokoaa ne.
6. **Jähmettymä 7,8 s**: ensimmäinen veto liikkuu musiikin alusta.
7. **Opastarkistus ja soitinroolit** (luku yllä): `opasProbe`, `roolit.json`, `vastaukset.json`
   näytökselle 1, `render/opascheck.mjs`, `analysis/opastarkistus.py`; ajettu alueelle 0–240 s.

Valmis: stillit 7,6–31 s, 141–155 s ja 422–470 s näyttävät vedon syntyvän kärjestä ja seuraavan
säveltä; `kohtauscheck --step 15` ja `camcheck --max 20` puhtaat; `videotarkistus.py` renderistä
`--start 0 --end 240` menee läpi ilman jähmettymää; asennot katsottu stilleistä (yksi per asento).

## Kriitikko: pysyvä jatkuvuus- ja tyyliportti (käyttäjän vaatimus 31.10.2026, uusittu 1.11.2026)

Jokaisen renderin (osa tai koko puoli) jälkeen ajetaan **kriitikko** (Sonnet-istunto tai -aliagentti, joka ei
ole tehnyt koodia), ennen kuin renderi näytetään käyttäjälle. Kriitikko lukee ensin `docs/visuaalinen_tyyli.md`
kokonaan ja `docs/kuvasaannot.md`, ja vasta sitten aineiston. Aineiston tekee `analysis/kriitikko.py`
(palautekohdat + otot + liikkeet) yhdellä ajolla, ja kriitikolla on **neljä porttia**. Renderi ei kelpaa, ennen
kuin jokaisen portin bugilista on tyhjä tai ohjaaja on kirjannut poikkeuksen palautelistaan.

1. **Liikkeet: yksi musiikillinen tapahtuma on yksi kaari** (käyttäjä 1.11.2026: "pilvet avautuvat kolmesti"
   huipulla; "liikkeiden pitää olla sujuvia, ei nykiviä"). `docs/liikkeet.json` nimeää jokaisen ohjauksen
   liikkeen (alue, mittari, odotus), ja `analysis/liikekayra.py` mittaa videosta, montako kertaa liike pysähtyy
   tai kääntyy. Odotus 1 = liike alkaa kerran ja päättyy kerran. Tyypilliset syyt nykimiseen, jotka kriitikko
   nimeää: (a) peräkkäiset smoothstep-ikkunat samalle asialle (jokainen alkaa ja päättyy nollanopeuteen),
   (b) sama tapahtuma kolmella mekanismilla eri ajoituksin (pilvet väistyvät + aurinko häivytetään näkyviin +
   kamera nousee), (c) leikkaus kesken liikkeen, jonka jälkeen tila on eri kuin ennen leikkausta, (d) osa
   elementeistä jää jälkeen (yksi pilvi jatkaa, kun muut ovat perillä). Jokainen ohjaukseen lisätty liike
   lisätään myös liikkeet.json:iin.
2. **Elementti-inventaario joka otosta** (käyttäjä 1.11.2026: "jokaisella graafisella elementillä pitää olla
   tarkoitus"). Kriitikko luettelee jokaisen oton stillistä KAIKKI näkyvät elementit ja nimeää lähteen:
   ohjaus.md:n otto, `roolit.json`:n soitin (joka soi juuri silloin) tai kuvasääntö. Elementti ilman lähdettä,
   tai elementti, jonka soitin ei soi, on **jämä** ja bugi. Erityisesti valkoiset läiskät, pisteet ja viivat
   vedessä tai taivaalla: mikä soitin, mikä otto?
3. **Säännön henki, ei kirjain.** Jokaisesta kuvan soittimesta: elementti vai esine (kuvasääntö 8)? Jokaisesta
   hahmosta: tyyliohjeen luku 10 (henkilöt) ja käyttäjän päätökset (kumppani on viiva, ei nukke). Kirjaimellinen
   soitin (harppu, huilun putki, tuuban kello) on bugi.
4. **Jatkuvuus.** `analysis/jatkuvuus.py`, `render/camcheck.mjs`, `render/kohtauscheck.mjs`, kontaktiarkit 1 s
   välein: jokainen epäjatkuvuus luokitellaan tarkoitetuksi (leikkaus jaksorajassa, isku ankkurissa, siirtymä)
   tai bugiksi (välke, hyppy, hahmo ilmestyy tai katoaa kesken oton, z-taistelu, vuoto).
5. **Elementin ajoitus musiikkiin.** Kun elementti on sidottu soittimeen, kriitikko kuuntelee kohdan ja
   vertaa mitattuun käyrään. Kuollut kanava (`panns_harp`) ei kelpaa ajoituksen lähteeksi.

Ruutusarjat katsotaan vähintään 4 fps liikkeen ajalta: 0,5–2 fps ei näytä nykimistä, ja se on syy, miksi
kriitikko v3 ei huomannut huipun kolmea avautumista. Raportti `runs/<ajo>/<osa>/kriitikko.md` tai
`kriitikko_*/index_tayt.md`: jokaisella rivillä aika, mitä näkyy, lähde tai "jämä", tila. Ohjaaja lukee vain sen
ja bugilistan, ja ohjaajan ratkaisut kirjataan palautelistaan.

## Osan valmiin määritelmä

0a. **Näkyvyys ensin (käyttäjä 1.11.2026: "tämä pitäisi olla ensimmäinen tarkistus").** Jokainen nimetty elementti
   (olento, hahmo, viiri, esine) on soittimensa soidessa kokonaan kuvassa (marginaali 4 %) ja erillään muista: ei toisen
   elementin, ritarin, keihään tai lavasteen päällä. Osa toteuttaa `window.nakyvyysProbe(t)` (ruutulaatikot 0..1) ja ajaa
   `render/nakyvyys.mjs --from --to` ennen stillejä; tuloste raporttiin. Tulo ja lähtö saavat ylittää reunan, lepopaikka ei.
0. tarkistus.md toteaa, että tyyliohje luettiin kokonaan ennen työtä, ja nimeää jokaisen kuvassa näkyvän
   soittimen elementin (kuvasääntö 8). Kirjaimellinen soitin tai esine, jonka tyyli kuvaa elementtinä, on bugi.
1. Jokainen oton rivi ohjaus.md:stä on toteutettu: teko, pääosasarake, leikkaus ankkurissa.
2. Alueen renderi `--start/--end`, `videotarkistus.py --start`: ääni 0 ms, iskut OK, ei jähmettymiä.
3. `kohtauscheck` ja `camcheck` alueelta puhtaat.
4. Stillit jokaisesta otosta ja kontaktiarkit 5 s välein (`runs/muste-1230/osa_N/`), tuore
   tarkistaja-agentti käy ne läpi `palautelista.md`:tä ja pääosasaraketta vasten; raportti
   `runs/muste-1230/osa_N/tarkistus.md`, vain se, minkä kuva tai mittaus näyttää.
5. Ohjaaja hyväksyy stillien perusteella. Vasta kaikkien osien jälkeen koko A-puolen renderi.

Vain yksi renderi tai still-ajo kerrallaan koko koneella (`--workers 2`); osat sopivat vuorot
`runs/muste-1230/pyynnot.md`:n kautta tai tekevät ne peräkkäin.
