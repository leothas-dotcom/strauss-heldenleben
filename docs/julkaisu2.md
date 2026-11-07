# Julkaisu 2.0: uusi YouTube-release A-puolesta

*Kirjoitettu 7.11.2026. Jatkaa `docs/youtube.md`:tä (julkaisu v6, 1.11.2026) ja
`runs/muste-1230/tekstitykset/` -työtä. Lähtökohta: käyttäjän havainnot 7.11. ja YouTube-kasvun
nykykäytännöt (lähteet luvun lopussa). Epävarmat kohdat **[tarkista]**.*

## 0. Mikä on vialla ja mitä tehdään

Video on julkaistu (https://youtu.be/EZ22YboLk7c), eikä se ole saanut huomiota. Syy ei ole kuva, vaan
**paketti**: otsikko, thumbnail, kuvaus ja tekstitykset eivät kerro ideaa viidessä sekunnissa, ja 20 min
Straussia ilman sisäänheittäjää on algoritmille umpikuja. Lisäksi tekstitykset paljastivat
**analyysivirheitä**: esimerkiksi "patarummut" mainitaan kohdissa, joissa niitä ei kuulu. Jokainen
tällainen rivi vie uskottavuuden koko "kone kuulee" -tarinalta.

Kolme työtä, tässä järjestyksessä:

| # | Työ | Tuotos | Miksi ensin |
|---|---|---|---|
| 1 | **Soitinhavaintojen tarkistus** kolmesta lähteestä (Krauss, referenssiäänite, partituuri) | `annotations/teemat.json`: varmuus jokaiselle soitinväitteelle; korjauslista | Tekstitykset, kuunteluopas ja kuva nojaavat tähän |
| 2 | **Tekstitykset 2.0**: kolme kerrosta, vain varmat soittimet, kriitikot ja Pauline avattuina | `runs/muste-1230/tekstitykset/tekstit.json` v2 + 8 kielen SRT:t | Halvin tapa parantaa julkaistua videota: SRT:t voi vaihtaa ilman uutta renderiä |
| 3 | **Uusi release**: prologi, Shorts-paketti, thumbnail, otsikko, kappalemerkit, jakelu | `runs/muste-1230/release2/` | Vasta kun 1–2 ovat kunnossa, koska Shortsit lupaavat sitä, mitä pitkä video sitten lunastaa |

Making-of (youtube.md luku 7) pysyy suunnitelmassa, mutta sen 60–90 sekunnin ydin tehdään nyt
**prologina** (luku 3.2). Koko making-of jää B-puolen jälkeen, kuten sovittiin.

## 1. Soitinhavaintojen tarkistus

### 1.1 Ongelma

PANNs ja Demucs kuulevat 1952 monolevyä, jossa bassorekisteri, pintakohina ja tutti sulautuvat.
Tunnetut heikkoudet (CLAUDE.md, analyysisuunnitelma): ff-tutissa vasket eivät erotu, hiljaisissa
kohdissa rahina näyttää lautasilta ja virveliltä, patarumpu ja kontrabassot sekoittuvat. Teemakartan
soitinväitteet on osin otettu näistä kanavista ilman toista lähdettä.

### 1.2 Kolme lähdettä, yksi varmuus

| Lähde | Kertoo | Heikkous |
|---|---|---|
| **Krauss 1952** (`build/*`, PANNs, stemmit) | mitä *tässä* äänitteessä kuuluu ja milloin | sumea, bassorekisteri |
| **Referenssiäänite** (moderni stereo) | mitä kuuluu selvästi, kun soittimet erottuvat | eri aika; vain analyysiin, ei videoon |
| **Partituuri** (IMSLP 19168, `score.py`) | mitä *pitäisi* soida | tahtiruudukko ei pidä äänestä; sivut luetaan silmällä |

Sääntö: soitinväite saa varmuuden **kuultu** vasta, kun vähintään kaksi lähdettä sanovat samaa ja
partituuri ei kiellä sitä. Yhden lähteen väite on **ehdokas**, ja ehdokas ei pääse tekstitykseen.

### 1.3 Referenssin linjaus Kraussin aikaan

Referenssin aikaleimat eivät saa sekoittua videon aikaan. Siksi:

1. Referenssi puretaan ja analysoidaan omaan pakettiinsa `build/ref_<nimi>/` samalla putkella
   (`prepare.py` → `listen.py --steps soittimet`), **ei koskaan** `build/demo400`-sarjaan.
2. `analysis/linjaus.py` laskee **DTW-kuvauksen** t_ref → t_krauss chroma- ja onset-piirteistä
   (librosa `dtw`, Sakoe–Chiba-ikkuna ±60 s, koska Kraussin tempo on omansa). Tulos
   `build/ref_<nimi>/linjaus.json`: taulukko (t_ref, t_krauss, residuaali s) sekunnin välein.
3. Laatu mitataan: residuaali vahvistetuilla teemakartan ankkureilla (`held_alku`, `held_dom7_sointu`,
   `wid_1_huilu`, `gef_viulu`, `wal_kulissi1`) saa olla enintään ±1,0 s. Jos ei, linjaus hylätään.
4. Referenssin soitinhavainnot siirretään kuvauksen kautta Kraussin aikaan ja kirjataan teemakarttaan
   kentällä `ref: {lahde, t_ref, varmuus}`. **Videon ja kuunteluoppaan aika on edelleen Kraussin aika.**

**Hankinta.** Tämä työtila ja koneen VM eivät pääse verkkoon (archive.org, IMSLP, pypi estetty
7.11.), joten referenssi tuodaan käsin kansioon `audio/ref/` (gitignoressa). Kelpaa mikä tahansa
selkeä stereolevytys, koska sitä ei julkaista: oma CD-rippi käy. Vapaita ehdokkaita Internet Archivesta
**[tarkista saatavuus]**: Reiner / Chicago 1954 (RCA Living Stereo, EU:ssa vapaa ennen 1963), Beecham /
RPO 1947. Nykyaikainen levytys on parempi erottelultaan; se saa olla käyttäjän oma.

### 1.4 Partituuritarkistus

`score.py` renderöi sivut; soitinväitteet, jotka koskevat tekstitysriviä, tarkistetaan sivulta
silmällä (kuka soittaa, ei tahtinumeroa äänestä). Tulos kirjataan teemakarttaan `peruste`-kenttään
("partituuri s. 22: Pk. tauolla"). Erityisesti tarkistettavat, koska tekstitys väittää niitä:

- **Patarumpu**: tekstit #6 (0:31 "vasket ja patarummut ensi kertaa"), #7 (0:39 "pöly on
  patarumpu"), #73 (19:32 "patarummut: taistelu alkaa"). Käyttäjä: ei kuulu kaikissa näissä.
- **Harput**: #8, #11, #17, #54, #58.
- **Sordinoidut pasuunat, tuubat, englannintorvi** vastustajissa (#21–26): partituuri tukee Porteria,
  mutta ajat pitää varmistaa.
- **Lavan takana soivat trumpetit** (#70, #72).

### 1.5 Tuotos

`annotations/teemat.json`: jokaiselle soitinta nimeävälle ankkurille `soittimet: [{nimi, varmuus:
kuultu|ehdokas|kielletty, lahteet: [krauss, ref, partituuri]}]`. `make_cues.py` ja `kuunteluopas.py`
lukevat tämän; `tekstitys.py` saa uuden tarkistuksen: **tekstissä nimetty soitin, jonka varmuus ei ole
`kuultu`, on virhe.** Lista korjatuista kohdista `runs/muste-1230/release2/korjaukset.md`.

## 2. Tekstitykset 2.0

Nykyiset 79 tekstiä (28 % ajasta) ovat oikeansuuntaiset, ja niissä on jo kolme ainesta: tarina, soittimet
ja tausta. Muutokset:

### 2.1 Kolme kerrosta, kullakin oma tehtävä

| Kerros | Sisältö | Tiheys | Esimerkki |
|---|---|---|---|
| **Tarina** | mitä sankari tekee nyt; mitä kuva tarkoittaa | perustaso, aina läsnä, 1–2 riviä | "Hän katsoo lampeen ja muistaa aamun." |
| **Kuuntele** | soitin tai tapahtuma, jonka katsoja voi *todentaa korvalla* nyt | vain `kuultu`-varmuus; alkaa sanalla *Kuuntele:* | "Kuuntele: kaksi tuubaa kvintin päässä. Dok-tor Deh-ring." |
| **Tausta** | Strauss, Pauline, kriitikot, Eroica, Don Quixote | 8–12 kertaa, kuvan rauhallisissa kohdissa | "Kriitikot ovat oikeita ihmisiä: Doktor Dehring kirjoitti Straussista Münchenissä." **[tarkista]** |

Kuuntele-rivi erottuu sanalla, ei värillä (SRT ei kanna tyyliä kaikilla alustoilla).

### 2.2 Mitä lisätään

- **Kriitikot**: nyt tekstit nimeävät olennot ja soittimet, mutta eivät sitä, keitä kriitikot *olivat*
  Straussin elämässä (Dehring, Hanslick-tyyppinen konservatiivinen kritiikki, Münchenin vastaanotto)
  eivätkä sitä, miksi Strauss pilkkaa heitä rinnakkaiskvinteillä. Kaksi–kolme tausta-riviä kohtaan
  4:03–4:45 ja yksi 17:56:aan (uni). Lähteet: `docs/heldenleben_tutkimus.md`, Porter. Nimiä ei keksitä.
- **Rakkauskohtaus (7:02–18:45)**: pisin jakso, jossa kuva on rauhallinen. Tausta-kerros kannattelee:
  Straussin partituurimerkinnät sooloviululle (*heuchlerisch schmachtend*, *leichtfertig*, *übermütig*,
  *zornig* …) riveinä sitä mukaa kuin ne soivat **[tarkista ajat partituurista]**, Pauline laulajana,
  Straussin kirje Rollandille. Tämä on se, mitä kuva ei voi kertoa ja mikä tekee 11 minuutista
  kuunneltavaa.
- **Prologi-rivi** 0:00–0:07 (neula laskeutuu): kolme lausetta, jotka kertovat idean: *"Jokainen ruutu
  on piirretty koodilla. Kone ei kuule, joten sille rakennettiin korvat. Tekstitys kertoo, mitä
  kuulet."*

### 2.3 Mitä poistetaan tai muutetaan

- Jokainen soitinväite, jonka varmuus ei ole `kuultu` (luku 1.5). Kysymysmuoto ("Arvostelijoiden
  kaikuako?") ei riitä: joko varma tai pois.
- Rivit, jotka selittävät koodia katsojalle ("Sädekehä on levyn ääni: jokainen säde on yksi
  taajuusalue") siirretään making-ofiin; videon tekstitys puhuu musiikista ja tarinasta.

### 2.4 Toteutus

`tekstit.json` v2 samaan kansioon, kenttä `kerros: tarina|kuuntele|tausta`. `tekstitys.py` tarkistaa
kerrosjakauman (kuuntele ≤ 40 %, tausta ≤ 15 %), soitinvarmuuden ja entiset rajat. Käännökset 7 kielelle
uudelleen vain muuttuneille tunnisteille. SRT:t vaihdetaan YouTube Studiossa vanhojen tilalle; video
pysyy samana, jos kuvaa ei muuteta.

## 3. Uusi release

### 3.1 Periaate: Shorts tuo, pitkä video pitää

Pitkä musiikkivideo ei leviä itsestään (youtube.md luku 1). Nykykäytäntö on, että Shorts-syöte toimii
erillisellä suosittelulla ja tavoittaa katsojia, jotka eivät ole koskaan nähneet kanavaa; pitkä video
saa katsojansa Shortsien, haun ja soittolistan kautta. Siksi release on **paketti**, ei yksi video.

### 3.2 Prologi (60–90 s) pitkän videon alkuun

Kaksi ongelmaa kerralla: kuollut alku (neula ja ura 0–7 s, sitten torviteema ilman selitystä) ja
"mitä tämä on" -kysymys. Prologi tehdään **omana videotiedostona ja liitetään pitkän videon alkuun**
uudessa latauksessa, joten teemakartan ajat eivät muutu: videon aika = prologin kesto + Kraussin aika,
ja kappalemerkit siirretään vastaavasti. **[päätös: liitetäänkö prologi vai julkaistaanko erillisenä
trailerina; jälkimmäinen säilyttää nykyisen videon ajat ja URL:n]**

Sisältö (kertoja = käyttäjän oma ääni, englanniksi; suomi tekstityksenä), youtube.md luvun 7 jaksot
1–2 tiivistettynä:
1. Valmis kuva täydellä äänellä 10 s (auringonnousu, `held_vasket_t13`).
2. "This is all the model got": tiedoston nimi. "An AI model cannot hear. So we built it ears."
   Demucs-stemmi soimaan erikseen, PANNs-käyrä ruudulle (15 s).
3. Isä: levyt lapsena, "hän kertoi, mitä musiikissa tapahtuu"; "I made this for him" (20 s).
4. "Turn on captions. They are his way of listening." Leikkaus neulaan (5 s).

Tyyli: sama kermapaperi, samat värit, terminaali ja kuvaajat samassa paletissa (youtube.md luku 7).

### 3.3 Shorts-paketti (4–6 kpl, 9:16, 30–45 s)

Jokainen Short on **yksi väite, yksi ote, teksti ruudussa**, ja päättyy "Full video: link in
description / pinned comment". Pystyrajaus vaatii oman renderin kameralla, joka seuraa kohdetta
(`render.mjs --aspect 9:16` **[toteutetaan]**), ei sokeaa rajausta 16:9-kuvasta.

| # | Ote (Kraussin aika) | Väite ruudussa | Miksi |
|---|---|---|---|
| S1 | 0:07–0:40 torviteema, aurinko, kahdeksan ritaria | "8 horns. 8 knights. Every frame drawn by code." | Konsepti yhdellä kuvalla |
| S2 | 4:03–4:35 kriitikot: hyttynen, sorsa, kotilot | "Strauss wrote his critics into the score. Here they are." | Hauskin kohta; selitys yhdessä lauseessa |
| S3 | 4:11–4:20 Dok-tor Deh-ring, kvintit | "This tuba line spells a critic's name." | Jaettava "tiesitkö" |
| S4 | 15:19–15:40 purppurahetki | "One colour, used once in 20 minutes." | Visuaalisesti erottuva |
| S5 | 20:02–20:40 taistelu → levyn ura | "The record ran out mid-battle. So does the video." | Koukku B-puoleen |
| S6 | prologin 2. jakso | "An AI cannot hear. We built it ears." | Tarina, ei musiikkivideo |

Julkaisutahti: yksi Short 2–3 päivän välein ennen ja jälkeen uuden latauksen, ei kaikkia kerralla.

### 3.4 Thumbnail, otsikko, kuvaus, kappalemerkit

- **Thumbnail**: yksi kohde, kolme väriä, enintään kolme sanaa. Ehdokas `thumb_150s` (ritaririvi ja
  muste) rajattuna tiukemmin: keskimmäiset neljä ritaria, muste suurempana (youtube.md luku 6). Teksti
  vain jos sana on konsepti: "DRAWN BY CODE". A/B-testi YouTuben omalla "Test & compare" -työkalulla
  (kaksi–kolme ehdokasta), ei arvailua.
- **Otsikko**: lupaa yksi yllättävä asia, ei "AI music video". Ehdokkaat:
  `An AI cannot hear. I built it ears, and it drew Strauss.` · `Strauss, drawn note by note by code
  (Ein Heldenleben, Side A)` · nykyinen lyhennettynä. Säveltäjä ja teos pysyvät otsikossa haun takia.
- **Kuvaus**: nykyinen on hyvä; nostetaan "WHY"-kappale ensimmäiseksi (ensimmäiset kaksi riviä näkyvät
  ilman klikkausta) ja lisätään rivi tekstityksistä.
- **Kappalemerkit**: nykyiset kuusi; lisätään jaksojen sisäiset (kriitikot, Pauline, rakkauskohtaus,
  kolkutus, taistelukutsu) teemakartasta, jotta 20 minuutilla on näkyvä rakenne.
- **Kiinnitetty kommentti**: tekstitysohje (LUE_MINUT.md) ja linkki soittolistaan.
- **Soittolista**: prologi/traileri, A-puoli, Shortsit, myöhemmin B ja making-of.

### 3.5 Jakelu (youtube.md luku 1, täydennetty)

r/classicalmusic, r/ClaudeAI, Hacker News (Show HN: menetelmä ja repo
https://github.com/leothas-dotcom/strauss-heldenleben), Slipped Disc -tyyppiset blogit, Anthropicin
yhteisö, suomeksi Rondo ja Yle Klassinen. Jokaiselle kanavalle oma ensimmäinen lause; Show HN:lle
tekninen ("built ears for the model"), klassiselle musiikille sisällöllinen ("Strauss's critics are in
the score; here they are drawn").

### 3.6 Mitä ei tehdä

- Ei leikata 20 minuutin videota lyhyemmäksi: teos on teos. Lyhyet versiot ovat Shortseja.
- Ei kertojaa musiikin päälle pitkässä videossa (prologi on ennen musiikkia).
- Ei uutta renderiä pelkän julkaisun takia, paitsi Shortsien pystyrenderit ja mahdollinen prologi.
  Rakkauskohtauksen "kuolleet kohdat" hoidetaan ensin tekstityksen tausta-kerroksella; kuvan
  tiivistys (harvemmat, pidemmät otot) vasta jos tekstitys ei riitä, ja silloin omana ajonaan.
- Ei ostettuja näyttökertoja, ei harhaanjohtavaa thumbnailia.

## 4. Työjärjestys ja mittarit

1. Referenssi kansioon `audio/ref/` (käyttäjä) → `linjaus.py` → linjauksen laatu (1.3 kohta 3).
2. Soitinvarmuus teemakarttaan; `korjaukset.md`.
3. `tekstit.json` v2, käännökset, SRT:t; vaihto Studiossa. **Tämä voi mennä ulos ennen muuta.**
4. Prologi: käsikirjoitus → äänitys → kuvakaappaukset → leikkaus. Päätös liittämisestä.
5. Shorts-renderit S1–S6; thumbnail-ehdokkaat; otsikko; kuvaus; kappalemerkit.
6. Uusi lataus (tai päivitys) + Shorts-tahti + jakelu.

Mittarit 30 päivän jälkeen: thumbnailin CTR (selaus 4–8 % on hyvä), katseluaika ensimmäisten 60 s
jälkeen, Shortsien → pitkän videon siirtymät, tekstitysten käyttöaste (Studio ei näytä suoraan;
kommentit kertovat). Mittarit kirjataan `runs/muste-1230/release2/mittarit.md`.

## Lähteet

- Dynamoi, *YouTube Channel Promotion: Growth Strategy for 2026*: Shorts-syötteen erillinen
  suosittelu, pitkä video nojaa tilaajiin ja hakuun. https://dynamoi.com/learn/youtube-music-promotion/how-to-grow-a-youtube-music-channel
- lvbeethoven.com, *Beethoven on YouTube*: klassisen musiikin thumbnail: kontrasti, yksi kohde,
  minimaalinen teksti; kokonaiset teokset toimivat "lean-back"-kuunteluna. https://lvbeethoven.com/?p=7981
- Dynamoi, *Get More Views on YouTube Music Videos*: thumbnailien A/B-testi YouTuben omalla
  työkalulla; harhaanjohtava metadata kielletty. https://dynamoi.com/learn/youtube-music-promotion/how-to-get-more-views-on-youtube-music-videos
- `docs/youtube.md` (31.10.–1.11.2026), `runs/muste-1230/tekstitykset/LUE_MINUT.md` ja `tekstitys.md`.
