# YouTube-julkaisu: *Ein Heldenleben*, A-puoli (muste-1230)

*Kirjoitettu 31.10.2026. Lähteet: `README.md`, `runs/muste-1230/` (tarkistus, videotarkistus, lokit),
`docs/palautelista.md`, `docs/visuaalinen_tyyli.md`, teemakartta `annotations/teemat.json` (jaksorajat)
sekä alla luetellut verkkolähteet. Epävarmat kohdat on merkitty **[tarkista]**.*

Julkaistava video: `runs/muste-1230/renders/heldenleben_muste_A_final.mp4` (A-puoli 0–20:40, renderöity
31.10.2026 klo 13.05). YouTube-master: `runs/muste-1230/renders/heldenleben_muste_A_youtube_2160p.mp4`
(luku 3). Thumbnail-ehdokkaat: `runs/muste-1230/youtube/`.

---

> **Päivitys 1.11.2026 aamu (kierros 4c):** julkaisuehdokas on **v6**: `runs/muste-1230/renders/heldenleben_muste_A_v6_youtube_2160p.mp4` (5,96 Gt, BT.709, tv-range). Mitattu: ääni 0,00 ms, jähmettymiä 0, iskut ruudulleen, näkyvyys 0 rikettä; koko palautelistan tarkistus `kriitikko_v6/palaute_tarkistus.md` (37 hoidettu, 0 ei). Käyttäjän päätös 1.11.: julkaistaan yksityisenä. **Ladattu 1.11.2026 aamulla yksityisenä:** https://youtu.be/EZ22YboLk7c (otsikko luku 4, kuvaus luku 5 + suomenkielinen kappale; 2160p-käsittely ja Content ID -tarkistus tehdään latauksen valmistuttua).

## 0. Suositus lyhyesti

1. **Julkaise A-puoli musiikkivideona, mutta vasta korjatun renderin jälkeen.** Käyttäjä osoitti
   31.10. kaksi kohtaa, jotka eivät kelpaa julkaistavaksi: alun ponnahtelevat toverit (17–28 s, videon
   ensimmäiset sekunnit) ja huipulle "lentävät" hahmot (229–234 s), ks. luku 2.2. Korjaus, uusi
   renderi (18 min), master (14 min) ja kriitikkoportti (piti näkyä / näkyy) ennen latausta.
   Nimetään rehellisesti "Side A": levyn puoli loppuu kesken taistelun, ja kuva kääntyy levyksi.
   Se on konsepti, ei vika, ja kuvaus kertoo sen.
2. **Tee making-of erikseen**, 8–12 minuuttia, ja julkaise se vasta, kun B-puoli on valmis. Se on
   videoista se, jolla on mahdollisuus levitä, ja sen huippukohta on koko teoksen loppu (Rauhantyöt,
   levyn kiertyminen), jota ei vielä ole. Käsikirjoituksen runko on luvussa 7.
3. **Lataa 2160p-master** (1080p-renderi skaalattuna tarkasti kaksinkertaiseksi), jotta YouTube koodaa
   videon VP9/AV1:llä eikä 1080p-tason AVC:llä. Rasteri ja paperin rae ovat juuri sitä, minkä 1080p:n
   matala bittinopeus tuhoaa.
4. **Otsikko:** ei "Imagined by Claude" (musiikkia ei kuvitellut Claude, ja sana vihjaa niin). Suositus:
   `Ein Heldenleben – Strauss, drawn by Claude note by note · Side A (Vienna Philharmonic / Krauss 1952)`.
5. **Thumbnail:** kahdeksan torviritaria ja punainen muste (150 s), ilman tekstiä tai teksti
   alareunan maassa. Vaihtoehdot: sädekehä huipulla (237 s, käyttäjän ehdotus) ja purppurahetki
   (935 s). Ruutu 232 s poistettiin ehdokkaista (bugi C12).

---


> **Päivitys 31.10.2026 ilta (kierros 2):** ladattava master on nyt
> `runs/muste-1230/renders/heldenleben_muste_A_v2_youtube_2160p.mp4` (6,1 Gt, sama resepti kuin luvussa 3, GOP 30),
> tehty renderistä `heldenleben_muste_A_v2.mp4`, jossa ovat palautelistan kierroksen 2 korjaukset (C11, C12, B5, B6,
> A8, A11, A12, B9, B10, C6 osin, C8). Mittaukset: ääni 0,00 ms, jähmettymiä 0, camcheck 0, kohtauscheck 0, jatkuvuus
> 34/123 (final 67/407). Tila ja avoimet kohdat: `docs/palautelista.md`, luku "Kierros 2". Aiempi master on vanhentunut.

## 1. Kummalla mennään: sellaisenaan vai making-of?

Vastaus on **molemmat, mutta eri aikaan ja eri tehtävässä.**

**Musiikkivideo sellaisenaan** on teos. Se on 20 minuuttia Straussia, jonka katsoja joko antautuu
kuuntelemaan tai ei. Sen yleisö on klassisen musiikin kuulijat, animaation ystävät ja ne, jotka tulevat
making-ofin kautta katsomaan, mistä puhuttiin. Se ei leviä itsestään: pitkä orkesteriteos ilman
selitystä on algoritmille vaikea (katseluaika suhteessa kestoon putoaa nopeasti), eikä otsikko lupaa
mitään, minkä voi ymmärtää viidessä sekunnissa. Mutta sen pitää olla olemassa, ja sen pitää olla
julkinen, koska making-of linkittää siihen ja koska se on todiste.

**Making-of** on tarina, ja inspiraatiovideo oli nimenomaan tarina: "mallille rakennettiin korvat". Meillä
tarina on vahvempi kuin inspiraatiossa, koska siinä on neljä käännettä, joita katsoja ei arvaa:

| Käänne | Mitä näytetään |
|---|---|
| 1. Malli ei kuule | Pyyntö "tee musiikkivideo", ja mitä malli oikeasti saa: tiedoston nimen. Sitten korvat: stemmit soimaan erikseen (Demucs), soittimet ruuduittain (PANNs), iskut (beat_this), sävelkorkeus (torchcrepe), 1952 LP:n rahina ja naksahdukset datana (`patina.json`). |
| 2. Muusikko tarkistaa koneen korvat | Käyttäjä on orkesterimuusikko. Teemakartan aika verrattuna partituuriin ja korvaan; väärät ehdokkaat (CLAP romahti, pYIN ei toimi orkesterissa). Tämä on se, mitä kenelläkään muulla ei ole. |
| 3. Tyyli tulee levystä, ei tekoälykuvista | Kolme painoväriä mitattu LP-kannesta, rasteri liukuvärin sijaan, säästetyt värit (purppura kerran). Ei yhtään tekoälykuvaa: jokainen muoto on koodia. Tyylidokumentti on jo itsessään kokonainen luku. |
| 4. Epäonnistumiset | Pyörivä näyttämö aiheutti pahoinvointia; friisi oli liian staattinen; sankari "toljotti lippu kädessä" 15 minuuttia; renderi, jonka ääni loppui 400 sekuntiin. Rehellinen epäonnistumisten ketju on sitä, mitä inspiraatiovideossa katsottiin. |

Ja lopussa levy loppuu kesken taistelun, kuva kiertyy levyksi: *käännä levy*. Se on luonnollinen
jatko-osan koukku, joka on totta.

**Mitä making-of ei saa olla:** supercut, jossa kertoja puhuu musiikin päälle. Koko projektin pointti on,
että musiikki ohjaa kuvaa. Siksi making-ofissa puhutaan prosessin päällä (kuvakaappaukset, kaaviot,
stillit, kontaktiarkit) ja kun valmista kuvaa näytetään, musiikki saa soida: 20–40 sekunnin otteet,
joissa kertoja vaikenee ja ruudun alareunassa lukee, mikä soittimessa ja kuvassa tapahtuu. Paras
muoto on inspiraatiovideon muoto: kertoja + ruutu, ei kasvoja pakollisena.

**Kertoja.** Käyttäjän oma ääni, englanniksi (yleisö on kansainvälinen; inspiraatiovideo oli
englanniksi). Jos englanti ei luista, suomeksi englanninkielisin tekstityksin. Ei synteettistä ääntä:
muusikon oma ääni on videon uskottavuus, ja se on se kulma, jota kukaan muu ei voi kopioida.

**Miksi making-of vasta B-puolen jälkeen:** making-ofin lopun pitää olla valmis teos. Nyt loppu olisi
"ja B-puoli on työn alla", mikä on heikko loppu tarinalle, jonka pointti on, että musiikki vietiin
loppuun asti. Lisäksi B-puolella ovat Straussin omat lainaukset (Rauhantyöt), eli making-ofin paras
"tiesitkö"-jakso.

**Entä viraalius?** Kukaan ei voi luvata sitä, mutta vivut ovat tunnetut:
- Otsikko lupaa yhden konkreettisen, yllättävän asian: *"I taught Claude to hear a 1952 record. Then it
  drew Strauss."* Ei "AI music video".
- Ensimmäiset 20 sekuntia: valmis auringonnousu torviteemalla ilman puhetta, sitten leikkaus
  tekstieditoriin: "This is all the model got." (tiedoston nimi).
- Yksi lause, jonka voi lainata: "An AI model cannot hear. So we built it ears."
- Jakelu: r/classicalmusic, r/ClaudeAI, Hacker News (Show HN: koodi ja menetelmä), Slipped Disc -tyyppiset
  klassisen musiikin blogit, Anthropicin yhteisö (merkitse @AnthropicAI; heillä on tapana jakaa
  Claude Codella tehtyjä projekteja), suomeksi Rondo ja Yle Klassinen ("orkesterimuusikko opetti
  tekoälyn kuulemaan Straussin").
- Shorts-teaser (pystyformaatti 9:16): auringonnousu tai purppurahetki, 30 s, linkki pitkään videoon.
  Pystyrajaus vaatii oman renderin kameralla, joka seuraa ritaria; ei rajata 16:9-kuvasta sokeasti.
- Yksi yhteinen soittolista: musiikkivideo (A), making-of, B-puoli.

---

## 2. Julkaisutarkistus

### 2.1 Oikeudet

| Mikä | Tila | Peruste |
|---|---|---|
| **Sävellys** (Strauss, k. 1949; teos julkaistu 1899) | vapaa kaikkialla | EU: 70 vuotta kuolinvuoden lopusta → vapaa 1.1.2020 alkaen. Yhdysvallat: ennen vuotta 1930 julkaistut teokset ovat vapaita. |
| **Äänite** (Wienin filharmonikot / Krauss, Decca, Wien, syyskuu 1952; UK-LP LXT 2729, US-LP London LL 659) | **EU/Suomi: vapaa. Yhdysvallat: suojattu.** | EU:n äänitteiden suoja-ajan pidennys 50 → 70 vuotta (direktiivi 2011/77/EU) ei palauttanut jo rauenneita suojia: 1952 julkaistu äänite raukesi 2002 lopussa (tuottajan ja esittäjien oikeudet, Suomessa tekijänoikeuslaki 46 ja 47 §). Yhdysvalloissa Music Modernization Act (2018) antaa 1947–1956 julkaistuille äänitteille 110 vuoden suojan → noin 2062. **[tarkista Yhdysvaltain päättymisvuosi]** |
| **Siirto (Internet Archive)** | ei uutta oikeutta | Mekaaninen digitointi (Boston Public Libraryn LP-kokoelma, identifier `lp_ein-heldenleben_richard-strauss-the-vienna-philharmonic-or`) ei synnytä uutta tekijän- tai lähioikeutta EU:ssa eikä Yhdysvalloissa. Sivulla ei ole lisenssimerkintää. Mainitaan lähteenä kuvauksessa. |
| **Kansi ja Porterin kansiteksti** | suojattuja, **ei käytetä** | Kuvasta ei ole jäljennetty mitään (sädekehä on uusi tulkinta, tyyliohje); tekstiä ei lainata. Thumbnailiin ei kantta. |
| **Fontti** (nimiö ja jaksokortit: Georgia, Windowsin järjestelmäfontti) | ok | Teksti on rasteroitu videon kuvaan, fonttitiedostoa ei jaeta. **[tarkista Microsoftin fonttilisenssi, jos haluat olla varma]** |
| **Kirjastot** (three.js, Puppeteer, ffmpeg, Demucs, PANNs, beat_this, torchcrepe, librosa) | ok | Avoimen lähdekoodin lisenssit (MIT, BSD, LGPL/GPL ffmpegissä käyttöön, ei jakeluun). Mallipainot vain analyysiin; videossa ei ole niiden tuotosta. |
| **Nimi "Claude" otsikossa** | ok tosiasiallisena mainintana | Kerrotaan, millä työkalulla koodi kirjoitettiin; ei saa vihjata Anthropicin tekemäksi tai tukemaksi. **[tarkista Anthropicin tavaramerkkiohje, jos otsikossa on "Claude"]** |
| **YouTuben tekoälymerkintä** | ei pakollinen, suositellaan silti | YouTube vaatii "altered or synthetic content" -merkinnän vain realistiselta sisällöltä; selvästi epärealistinen animaatio on vapautettu. Videossa ei ole yhtään tekoälyn tuottamaa kuvaa, vain tekoälyn kirjoittamaa koodia. Kuvaus kertoo tämän suoraan. |

**Mitä Content ID:stä pitää odottaa.** Decca/Universal on julkaissut saman äänityksen uudelleen
(Testament, Decca Eloquence, *Clemens Krauss: Complete Decca Recordings*). Content ID tunnistaa
1952 äänityksen rahinan läpi todennäköisesti. Seuraus on **väite (claim), ei varoitus (strike)**:
oikeudenhaltija voi ottaa mainostulot tai estää videon Yhdysvalloissa. Videon voi silti julkaista, ja
väitteen voi kiistää EU:n osalta ("public domain in my country"), mutta Yhdysvaltain estoa ei kannata
riitauttaa, koska siellä äänite on suojattu. Käytännön ohje: **älä laita monetisointia päälle**, ja
kirjaa kuvaukseen äänitteen lähde ja oikeustilanne, niin väite ei näytä piilottelulta.

### 2.2 Bugit: mitä mitattiin ja katsottiin (31.10.2026)

| Tarkistus | Tulos |
|---|---|
| Ääni totuutta vasten (`videotarkistus.py`, `build/kuuntelu/A_puoli_kuuntelu.wav`) | suurin ero 0,00 ms, ajautuminen 0 ppm koko 1240 s:n matkalla |
| Teemakartan pakolliset iskut (9) | 7 oikealla ruudulla, 2 yhden ruudun (33 ms) myöhässä (`held_isku2`, `wid_reh20_lautaset`); ei silmin havaittava |
| Aksentit z ≥ 9 (76 kpl, tiedoksi) | ei poikkeamia |
| Jähmettymät ennen yleistaukoa | 0 |
| `camcheck --max 20` ja `kohtauscheck --step 15` (drafti ennen renderiä) | 0 ylitystä, 0 kerrosylitystä |
| `jatkuvuus.py` (välkyntä ja hypyt) koko videolle | **EPÄONNISTUI mittarin rajoilla** (67 välkyntälöydöstä yli rajan, 407 hyppyä iskujen ulkopuolella). Seitsemästä katsotusta ryppäästä kolme on tarkoitettua liikettä ja neljä oikeita yhden ruudun napsahduksia: ks. liite. |
| Kontaktiarkit 5 s:n välein (248 ruutua) ja 16 stilliä täydessä koossa | ei magentaa eikä tyhjiä kerroksia, ei lavasteiden reunoja, ei natsitervehdystä muistuttavia eleitä (viirit pystyssä, kellot soittoasennossa), jaksokortit I–IV paikoillaan, loppu kiertyy levyksi 1225–1240 s |
| Tiedosto | 1920×1080, 30 fps, H.264 High, CRF 18, keskimäärin 15 Mbit/s, AAC-LC 320 kbit/s 48 kHz, 2,38 Gt, faststart |

**Bugit, jotka käyttäjä osoitti 31.10. iltapäivällä ja jotka korjataan ennen julkaisua
(`docs/palautelista.md` C1, C11, C12):**

| Kohta | Mitä piti näkyä (kuvakäsikirjoitus) | Mitä näkyy (ruudut 10 fps) |
|---|---|---|
| 17,6 / 21,6 / 27,5 s (T. 6, 8, 11) | kahdeksan käyrätorvea ff: sankari ja seitsemän toveria kuvassa, iskuissa viirinkärjet napsahtavat | toverit makaavat punaisina läiskinä, ponnahtavat iskussa kokonaisiksi hahmoiksi 2–3 ruuduksi ja kutistuvat taas viireiksi; sama kolmesti |
| 229–234 s (huippu) | kiipeäminen huipulle, selkäkuva 2 | toverit seisovat mustan kallion seinämällä ilmassa ja ilmestyvät sattumanvaraisiin kohtiin; 234–238 s (sädekehä) toimii |
| Prosessi | kriitikkoportti ennen jokaista näyttöä | ei rakennettu eikä ajettu; palautelistan C1 oli "korjattu, todennetaan" ilman todennusta; minun tarkistukseni (kontaktiarkit 5 s välein) ei nähnyt 0,1 s:n ponnahduksia |

Nämä eivät näkyneet mittauksissa, koska yksikään tarkistin ei vertaa kuvakäsikirjoituksen aikomusta
ruutuun. Siksi julkaisua ei suositella ennen korjausta ja uutta renderiä.

**Huomiot, jotka eivät ole bugeja mutta jotka katsoja voi kokea sellaisina:**

1. **Tyhjä paperi 1114–1124 s** (hiljaisuus ennen taistelua, kohtaus 60). Tyyliohjeen mukaan
   "hiljaisuus on tyhjää paperia", ja musiikki on tässä lähes äänetön. Kymmenen sekuntia pelkkää
   kermapaperia YouTubessa näyttää kuitenkin helposti katkenneelta videolta. Kuvakäsikirjoituksen
   "kolmen viirin luonnos horisonttiin" ei näy; ritarin lyijykynäluonnos ilmestyy vasta 1125 s:ssa.
   **Harkittava korjaus ennen julkaisua:** luonnos piirtyy hitaasti koko hiljaisuuden ajan, jolloin paperi
   ei ole koskaan täysin tyhjä. Pieni muutos `scenes_3.js`/`scenes_4.js`:ssä, uusi renderi vain
   osalle (`--start 1100 --end 1130`) ei riitä, koska lopullinen tiedosto renderöidään kokonaan.
2. **Yleistauko 239–243 s** on tyhjä paperi 3,8 s. Lyhyt, tarkoituksellinen; jätetään.
3. **Alku 0–7,6 s:** nimiökortti ja neulan laskeutuminen ilman musiikkia. YouTuben ensimmäiset sekunnit
   ratkaisevat, jatkaako katsoja. Konseptin kannalta oikein (levy pannaan soimaan). Jätetään, mutta
   making-ofissa ja Shortsissa aloitetaan musiikista.
4. **Video on vain A-puoli** ja loppuu kesken taistelun. Otsikko ja kuvaus sanovat sen; sivun kääntö on
   kuvassa (levy).
5. Palautelistan (`docs/palautelista.md`) kohdat A3, A10, A11 ja C10 (sankarin teot kumppanin
   jaksossa, kriitikkoportti) on merkitty avoimiksi 31.10. aamulla; lopullinen renderi tehtiin
   osien 1–4 korjausten jälkeen, ja käyttäjä hyväksyi sen katsomalla. Listaa ei ole päivitetty
   tämän renderin mukaan.

### 2.3 Mitä ei ole todennettu

- `jatkuvuus.py`-ajon tulos kirjataan alle, kun se valmistuu (ks. loppu).
- 2160p-masterin kuva on verrattu alkuperäiseen vain ffprobella ja yhdellä ruudulla (luku 3);
  koko videon katsominen 4K-näytöllä on tekemättä.
- Yhdysvaltain Content ID -käyttäytymistä ei voi tietää etukäteen; se selviää latauksessa
  (YouTube Studio näyttää väitteet ennen julkaisua, kun video ladataan ensin yksityisenä).

---

## 3. Resoluutio ja master

**Oikea resoluutio YouTubeen on 3840×2160 (2160p), vaikka lähde on 1080p.** Syy ei ole terävyys vaan
koodekki: YouTube koodaa 1080p-lähteet AVC:llä noin 8 Mbit/s:n tasolle, ja 1440p:stä ylöspäin se käyttää
VP9:ää ja AV1:tä korkeammilla bittinopeuksilla kaikille katselutasoille. Tämän videon kuva on pelkkää
hienoa rasteria ja paperin raetta, ja juuri se mössöytyy ensimmäisenä matalalla bittinopeudella.
Tasan kaksinkertainen skaalaus (Lanczos) on rasterille puhtain: 1440p olisi 1,33-kertainen ja tuottaisi
pisteisiin moirén.

**Miksi ei oikeaa 4K-renderiä:** kohtaus on kirjoitettu 1920×1080-pikseleihin (`visual/muste/main.js`
`W=1920`, `ink.js` `uRes 1920×1080`, rasteri ja kohdistussiirto pikseliyksiköissä). Oikea 4K-renderi
muuttaisi rasterin tiheyttä suhteessa kuvaan eli ulkoasua, ja se pitäisi virittää uudelleen stilleistä.
Lisäksi renderi veisi noin neljä kertaa 18 minuuttia ja x264:n 4K-koodaus päälle. Se on oma työnsä, ei
julkaisun ehto.

**YouTuben suositukset (SDR, 24–30 fps):** MP4, H.264 High, `moov` tiedoston alussa, suljettu GOP
puoli ruututaajuutta, 2 B-ruutua, 4:2:0, BT.709; bittinopeus 2160p 35–45 Mbit/s, 1440p 16 Mbit/s,
1080p 8 Mbit/s; ääni AAC-LC stereo 384 kbit/s, 48 kHz.

**Värit:** alkuperäinen renderi on täyden alueen YUV (`yuvj420p`, JPEG-ruuduista) ja merkitty
BT.601:ksi (`bt470bg`). YouTube olettaa HD:lle BT.709:n rajoitetun alueen, joten master muunnetaan
eksplisiittisesti (täysi → rajoitettu, BT.601 → BT.709) ja merkitään. Ilman muunnosta kontrasti voi
näyttää eri soittimissa eri tavalla.

**Bittinopeusmittaus 15 s:n näytteillä (150 s ja 760 s), 2160p, x264 medium:**

| CRF | Mbit/s |
|---|---|
| 16 | 65–85 |
| 19 | 49–66 |
| 21 | 41–55 |

Rasteri on kallista: pelkkä kohina ei pakkaudu. Valinta: **CRF 20, katto 60 Mbit/s** (`-maxrate 60M
-bufsize 120M`), mikä osuu YouTuben suositushaarukan yläreunaan. Odotettu koko noin 7–8 Gt. Jos
lähetyskaista ei riitä, vaihtoehto on ladata 1080p-renderi sellaisenaan (2,4 Gt), jolloin laatu on
YouTuben 1080p-tasoa.

**Komento (ajettu 31.10.2026, loki `runs/muste-1230/youtube_2160p.log`):**

```
ffmpeg -i runs/muste-1230/renders/heldenleben_muste_A_final.mp4 \
  -vf "scale=3840:2160:flags=lanczos+accurate_rnd+full_chroma_int:in_range=pc:out_range=tv:in_color_matrix=bt470bg:out_color_matrix=bt709,format=yuv420p" \
  -c:v libx264 -preset medium -crf 20 -maxrate 60M -bufsize 120M -profile:v high -level 5.1 \
  -g 15 -keyint_min 15 -bf 2 \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
  -c:a copy -movflags +faststart \
  runs/muste-1230/renders/heldenleben_muste_A_youtube_2160p.mp4
```

Ääni kopioidaan (`-c:a copy`): sama AAC 320 kbit/s kuin renderissä, ei toista häviöllistä koodausta.
YouTuben 384 kbit/s on suositus, ei vaatimus. Tulos ja mittaukset: luvun lopussa.

---

## 4. Otsikko

YouTube näyttää noin 60 ensimmäistä merkkiä hakutuloksissa ja syötteessä; enimmäispituus 100.

| Ehdotus | Huomio |
|---|---|
| **Ein Heldenleben – Strauss, drawn by Claude note by note · Side A (Vienna Philharmonic / Krauss 1952)** | **Suositus.** Teos ja säveltäjä ensin (haku), sitten se mikä on uutta, sitten rehellinen rajaus ja äänitteen credit. 97 merkkiä. |
| Ein Heldenleben – Imagined by Claude | Käyttäjän ehdotus. Lyhyt ja kaunis, mutta "imagined" vihjaa, että Claude kuvitteli musiikin. Ei "Strauss"-sanaa, jolla teosta haetaan. Jos tätä käytetään: *Strauss: Ein Heldenleben – imagined in ink by Claude (Side A)*. |
| A Hero's Life, drawn by code: Strauss – Ein Heldenleben (Side A, 1952 LP) | Englanninkielinen nimi ensin; parempi, jos yleisö ei tunne saksankielistä nimeä. |
| *Making-of (myöhemmin):* I taught Claude to hear a 1952 record. Then it drew Strauss's Ein Heldenleben. | Lupaa yhden asian, jonka ymmärtää heti. |

Otsikossa ei sanota "AI" eikä "generated": molemmat tuovat väärän yleisön ja väärän oletuksen
(tekoälykuvat). "Drawn by Claude" + kuvauksen ensimmäinen rivi "every frame is drawn by code" kertoo,
mistä on kyse.

---

## 5. Kuvauskenttä (englanniksi, liitettävä sellaisenaan)

Alle 5000 merkkiä; kappaleet (chapters) toimivat, kun ensimmäinen aikaleima on 0:00 ja jaksoja on
vähintään kolme, kukin yli 10 s. Ajat ovat teemakartan jaksorajoja (`annotations/teemat.json`,
A-puolen aika = videon aika). Korvaa `[CHANNEL]` ja `[LINK]` ennen julkaisua.

```
Richard Strauss: Ein Heldenleben (A Hero's Life), Op. 40 – Side A
Vienna Philharmonic Orchestra, Clemens Krauss. Recorded by Decca in Vienna, September 1952 (LP: London LL 659).

Every frame of this video is drawn by code, and every event in the picture has a reason in the music.

This is a music video for the first LP side of Strauss's tone poem: the Hero, his Adversaries, his Companion, and the beginning of the Battle. The side ends where the record did in 1952, in the middle of the battle, and the picture turns into the record itself. Side B (the end of the Battle, the Works of Peace, the Hero's Retirement) is in production.

WHY

When I was a child, my father and I listened to classical records together, and he told me what was happening in the music: who was speaking, who was arriving, when the storm would break. I used to wonder where he got those stories. He is an orchestral musician. This week I heard the Helsinki Philharmonic at the Musiikkitalo, and he was on stage. That is where this video began.

It moves me that I can now do the same thing with a machine as my partner, and bring his stories to life as pictures. The listening guide that steers every frame here is, in the end, his way of listening: someone sitting next to you, telling you what happens next.

I made this for him.

HOW IT WAS MADE

An AI model cannot hear. So the first job was to build it ears: a local analysis toolkit (Demucs stems, PANNs instrument detection, beat_this, torchcrepe pitch tracking, librosa) that turns the old mono LP, surface noise and all, into data: who plays when, beats, dynamics, written accents to the hundredth of a second, and even the clicks and hiss of the record. A theme map and a "listening guide" (our substitute for lyrics) place Strauss's themes and events in the time of this particular recording, checked by ear and against the score.

The visual style, "Living print", comes from the record itself: three printing inks measured from the LP sleeve (cream paper, Prussian blue, vermilion, black), halftone instead of gradients, and the record's noise visible as paper grain and dust at exactly the moments you hear it. Three more colours are saved for turning points. You will see one of them once on this side.

The storyboard gives every instrument group a role. The horns are the hero, a knight. The solo violin is a single white line. The woodwind critics are creatures shaped like their instruments. Cuts, gestures and changes of light are tied to measured anchors in the audio, never to a clock.

The scenes are written in JavaScript (three.js, a two-dimensional paper multiplane) as pure functions of time, rendered frame by frame in headless Chrome, piped to ffmpeg and checked by scripts: camera speed, set edges, audio sync against the source, every written accent on its frame.

The code was written by Claude (Anthropic) in Claude Code and directed by a professional orchestral musician, who checked each cut by ear and by eye. No AI-generated images or video were used anywhere. Every shape you see is drawn by code.

CHAPTERS
0:00 The needle drops
0:07 I. Der Held (The Hero)
4:03 II. Des Helden Widersacher (The Hero's Adversaries)
7:02 III. Des Helden Gefährtin (The Hero's Companion)
18:45 IV. Des Helden Walstatt (The Hero's Battlefield) begins
20:23 End of Side A

THE RECORDING
Transfer from the Internet Archive (Boston Public Library LP collection): https://archive.org/details/lp_ein-heldenleben_richard-strauss-the-vienna-philharmonic-or
Strauss's music is in the public domain worldwide. The 1952 recording is in the public domain in the EU (recordings published before 1963). US law protects pre-1972 recordings for longer, so availability may differ there. No ads are run on this video.

TOOLS
Python: librosa, Demucs, PANNs, beat_this, torchcrepe, PyTorch · JavaScript: three.js, Puppeteer · ffmpeg · Claude Code
Inspiration: Devarf, "I Had Opus 5.5 Make the Same Music Video at Every Effort", for the idea of building ears for the model.

Making-of and Side B: [LINK]

#Strauss #EinHeldenleben #ClassicalMusic #CreativeCoding #GenerativeArt #ClaudeCode
```

Suomenkielinen lisäkappale (valinnainen, kuvauksen loppuun):

```
SUOMEKSI
Richard Straussin Sankarielämän A-puoli musiikkivideona. Jokainen ruutu on piirretty koodilla, ja jokaisella kuvan tapahtumalla on syy musiikissa. Tekoälylle rakennettiin ensin korvat (ääni dataksi), sitten tyyli levyn kannen kolmesta painoväristä, sitten kuvakäsikirjoitus, jossa käyrätorvet ovat sankari. Ohjaus ja tarkistus: orkesterimuusikko. Koodi: Claude.

Lapsena kuuntelin isäni kanssa klassisia levyjä, ja hän kertoi, mitä musiikissa tapahtuu. Mietin, mistä hän ne tarinat keksi. Isäni on orkesterimuusikko; tällä viikolla kuuntelin Helsingin kaupunginorkesteria Musiikkitalossa, ja hän oli lavalla. Siitä tämä video alkoi. Kuunteluopas, joka ohjaa tämän videon jokaista kuvaa, on lopulta hänen tapansa kuunnella: joku istuu vieressä ja kertoo, mitä seuraavaksi tapahtuu. Tein tämän hänelle.
```

Huomio henkilökohtaisesta kappaleesta: se nimeää orkesterin ja viikon, joten isäsi on siitä
tunnistettavissa. Jos haluat varjella häntä, jätä orkesterin nimi pois ("a concert this week, and he
was on stage"); teksti kantaa ilmankin. Kappale on tarkoituksella ennen HOW IT WAS MADE -osaa:
YouTube näyttää kuvauksesta ensin vain kolme riviä, joten ensimmäinen rivi pysyy asiatietona ja
tarina avautuu "lisää"-painikkeen takaa heti seuraavana.

---

## 6. Thumbnail

Vaatimukset: 1280×720, 16:9, JPG/PNG, alle 2 Mt. Ehdokkaat on tehty lopullisen renderin ruuduista
kansioon `runs/muste-1230/youtube/`:

| Tiedosto | Mitä | Arvio |
|---|---|---|
| `thumb_150s.jpg` | kahdeksan torviritaria rivissä, iso punainen musteveto taivaalla, aurinko (harjoitusnumero 8, 8 käyrätorven teema) | **Suositus.** Yksi selkeä aihe, kolme väriä, kertoo heti "musiikki piirtyy musteena". Toimii pienenä. |
| `thumb_150s_teksti.jpg` | sama, "RICHARD STRAUSS / EIN HELDENLEBEN" alareunan mustassa maassa (Georgia, kuten nimiökortissa) | Jos halutaan teksti. Teksti ei peitä mustetta. |
| `thumb_935s.jpg` | purppurahetki: vene, kuu, punos | Vaihtoehto. Erottuu syötteestä, koska väri on outo, mutta aihe on pieni. |
| `thumb_935s_teksti.jpg` | sama tekstillä tyhjällä purppurataivaalla | Teksti istuu tähän hyvin. |
| `thumb_36s.jpg` | auringonnousu, ritarit pieninä | Kaunis, mutta hahmot katoavat pienessä koossa. |
| `thumb_237s.jpg` | sädekehä huipulla: aurinko säteineen vuorten välissä, ritarit viireineen (käyttäjän ehdotus) | Vahva vaihtoehto: ainoa kohta, jossa sädekehä näkyy. |
| ~~232 s~~ | huippu ennen sädekehää | **Poistettu:** käyttäjä osoitti 31.10., että toverit "lentävät" kallion seinämälle (C12). Kuvaa ei saa käyttää. |
| `thumb_1200s.jpg` | taistelu, musta ja punainen | Making-ofin tai B-puolen thumbnail, ei tämän. |

Ohjeet: ei LP-kantta, ei tekoälykuvaa, ei huutomerkkejä eikä kasvoja. Jos ritaririvistä halutaan
vielä voimakkaampi, rajataan 150 s:n ruudusta keskimmäiset neljä ritaria ja muste suuremmiksi (oma
renderi `--stills 150 --debug 0` ja rajaus), mutta ensin kannattaa katsoa, miten nykyinen näyttää
YouTube Studion esikatselussa puhelimen koossa.

---

## 7. Making-of: käsikirjoituksen runko (8–12 min)

Rakenne on sama kuin inspiraatiovideossa: kertoja ja ruutu. Jokaisessa jaksossa yksi väite, yksi
kuva, yksi musiikkiote. Valmiin videon otteissa kertoja vaikenee.

| # | Kesto | Jakso | Ruudulla | Kertoja (väite) |
|---|---|---|---|---|
| 1 | 0:00–0:25 | Koukku | Auringonnousu (held_vasket_t13 → held_intro_loppuu) täydellä äänellä, sitten leikkaus terminaaliin: `side1.flac`. | "This is all the model got: a file name. It cannot hear a note of it." |
| 2 | 0:25–1:15 | Kuka ja miksi | **Henkilökohtainen syy ensin:** lapsuuden levyt isän kanssa, isä kertoi mitä musiikissa tapahtuu; isä on orkesterimuusikko, ja idea syntyi konsertissa, jossa hän oli lavalla. Sitten orkesterimuusikon näkökulma: soitan tätä teosta; inspiraatiovideon idea (korvat mallille); 42 minuuttia Straussia, kaksi LP-puolta, 1952. Kuunteluopas = isän tarinat. | "My father used to tell me what was happening in the music. I wanted to do that again, for him, with a machine that cannot hear." Sitten: "A rap track has a beat grid and lyrics. Strauss has rubato, fermatas and no words. So we had to build better ears." |
| 3 | 1:15–3:00 | Korvat | Demucs-stemmit soivat erikseen (käyrätorvet esiin); PANNs-soitinkäyrät ruuduittain (`plots/overview.png`); beat_this ja miksi tahtiruudukko ajautuu; CREPE stemmeistä; `patina.json`: naksahdukset datana. Epäonnistumiset: CLAP romahti, pYIN ei kuule orkesteria. | "Six parts: beats, notes, instruments, loud and quiet, lyrics, story. We had no lyrics, so we wrote a listening guide." |
| 4 | 3:00–4:15 | Muusikko tarkistaa | Teemakartta (`teemat.json`) ja partituurin sivu rinnakkain; kahdeksan käyrätorven kohta; "vahvistettu korvalla" -merkinnät; aikojen totuus (kuuntelukopio). | "The machine proposes, the ear confirms. Every anchor in the picture is a time I signed off on." |
| 5 | 4:15–5:45 | Tyyli levystä | Paletti (`docs/paletti.svg`): kolme painoväriä mitattuna kannesta (kantta ei näytetä); rasteri ei liukuväri; säästetyt värit; väripartituuri; "ei tekoälykuvia, kaikki koodia" (näytä `hero.js`-pätkä ja sama ritari ruudulla). Valmis ote: suo ja soitinolennot. | "The style is the record's third printing: the sound was pressed into vinyl, the picture into paper, and we print it again as moving ink." |
| 6 | 5:45–7:00 | Kuvakäsikirjoitus | Storyboardin taulukko: ankkuri, musiikki, mitä sankari tekee, mikä muuttuu; sääntö "ei kovakoodattuja sekunteja"; soitinroolit. Valmis ote: kumppanin viiva (gef_viulu). | "Every cut has a musical reason or it does not exist." |
| 7 | 7:00–8:15 | Mikä meni pieleen | Pyörivä näyttämö (drehbuehne, 10 s: pahoinvointi); friisi (liian staattinen); sankari seisoo 15 minuuttia; renderi, jonka ääni loppui 400 sekuntiin ("Tällaista amatöörimokaa ei saa tapahtua"). | "Four scenes thrown away. The fifth one is the video." |
| 8 | 8:15–9:15 | Renderöinti ja mittaus | Putki: puhdas aikafunktio → headless Chrome → ffmpeg; `camcheck`, `kohtauscheck` (magenta), `videotarkistus` (0,00 ms); kontaktiarkit; ohjaaja ja agentit. | "Done means measured, not felt." |
| 9 | 9:15–10:45 | Tulos | Kaksi pitkää otetta ilman puhetta: purppurahetki ja taistelun alku / levyn kiertyminen. | – |
| 10 | 10:45–11:30 | Käännä levy | Levyn puoli loppui kesken taistelun. B-puoli: Rauhantyöt ja Straussin omat lainaukset. Linkki koko videoon. | "The record ran out in the middle of the battle. Flip it." |

Tuotantohuomiot: ruudun kaappaukset tehdään oikeista tiedostoista (ei lavasteita); terminaali ja
koodi näytetään samalla kermapaperilla ja samoilla väreillä kuin video (yksi tyyli); kertojan ääni
äänitetään rauhallisessa huoneessa yhdellä otolla per jakso; tekstitys englanniksi ja suomeksi.

---

## 8. Julkaisun askeleet (YouTube Studio)

1. Lataa `heldenleben_muste_A_v6_youtube_2160p.mp4` **yksityisenä** (julkaisupaketti: `runs/muste-1230/julkaisu_v6.md`, kuvaus `youtube_kuvaus_v6.txt`). Odota, että 2160p-käsittely on
   valmis (voi kestää tunteja) ja katso, tuleeko Content ID -väite. Tarkista, että laatuvalikossa on
   2160p ja että toisto 1080p:nä näyttää rasterin terävänä (tilastosivulla koodekki on vp09 tai av01).
2. Otsikko (luku 4), kuvaus (luku 5), thumbnail (luku 6).
3. Kieli: englanti; nimen ja kuvauksen käännökset: suomi (valinnainen).
4. Kategoria: Music. Ei lapsille suunnattu. Lisenssi: Standard YouTube License (koodi ja
   dokumentit voi julkaista erikseen omalla lisenssillään).
5. "Altered or synthetic content": ei vaadittu (animaatio), mutta merkinnän voi laittaa, jos haluaa
   olla läpinäkyvä; se ei vaikuta näkyvyyteen.
6. Kappaleet tulevat kuvauksesta automaattisesti. Lisää loppukortti (end screen) 20:23–20:40
   levyn pyöriessä: linkki making-ofiin tai soittolistaan, kun ne ovat olemassa.
7. Monetisointi pois. Kommentit auki.
8. Julkaise, ja vie sama video soittolistaan "Ein Heldenleben, drawn by code" (A, making-of, B).
9. Jaa: r/classicalmusic, r/ClaudeAI, Hacker News (vasta making-ofin kanssa), suomalainen
   klassisen musiikin media.

---

## Lähteet

- [YouTube: Recommended upload encoding settings](https://support.google.com/youtube/answer/1722171)
- [YouTube: Disclosing use of altered or synthetic content](https://support.google.com/youtube/answer/14328491?hl=en-GB)
- [YouTube blog: How we're helping creators disclose altered or synthetic content](https://blog.youtube/news-and-events/disclosing-ai-generated-content)
- [Eloquence Classics: Clemens Krauss, Complete Decca Recordings (äänityspäivät ja LXT 2729)](https://www.eloquenceclassics.com/?p=10731)
- [Internet Archive: lp_ein-heldenleben_richard-strauss-the-vienna-philharmonic-or](https://archive.org/details/lp_ein-heldenleben_richard-strauss-the-vienna-philharmonic-or)
- [CRS: The Music Modernization Act: Extending Copyright Protection to Pre-1972 Sound Recordings](https://www.everycrsreport.com/reports/LSB10181.html)
- [Library of Congress: Copyright breakdown, the Music Modernization Act](https://blogs.loc.gov/now-see-hear/2019/02/copyright-breakdown-the-music-modernization-act/)
- Direktiivi 2011/77/EU (äänitteiden suoja-ajan pidennys; ei koske jo rauenneita) **[tarkista suoraan direktiivistä]**

---

## Liite: masterin ja jatkuvuustarkistuksen tulokset

### 2160p-master (valmis 31.10.2026 klo 14.17)

| Mittaus | Tulos |
|---|---|
| Tiedosto | `runs/muste-1230/renders/heldenleben_muste_A_youtube_2160p.mp4`, 7,52 Gt |
| Kuva | 3840×2160, 30 fps, H.264 High L5.1, yuv420p, keskimäärin 48,2 Mbit/s (katto 60), GOP 15 |
| Värimerkinnät (ffprobe) | range tv, matrix bt709, primaries bt709, transfer bt709 (primaries ja transfer kirjoitettiin jälkikäteen `h264_metadata`-suodattimella, koska x264 ei kirjoittanut niitä ensimmäisellä kerralla) |
| Ääni | kopioitu bittitarkasti: AAC-LC 48 kHz stereo, md5 `8dda3f09…a5be` sama kuin lähteessä, joten synkroni on identtinen mitatun renderin kanssa (0,00 ms) |
| `moov` tiedoston alussa | kyllä (faststart) |
| Värien säilyminen (150 s, lähde dekoodattuna BT.601 täysi alue, master BT.709 rajoitettu alue, lohkokeskiarvot 60×34) | keskiero 0,5 / 255, suurin 2,0 → täysi → rajoitettu -muunnos ja matriisin vaihto onnistuivat; pikselitason ero (4,8) on rasterin uudelleennäytteistystä |
| Koodausaika | 14 min 1080p-renderistä (x264 medium, noin 50 ruutua/s) |

Koko videota ei ole katsottu 4K-näytöllä; se tehdään YouTube Studion esikatselusta latauksen jälkeen.

### `jatkuvuus.py` (välkyntä ja hypyt), ajettu 31.10.2026 klo 14.25

Tuloste `runs/muste-1230/jatkuvuus_final.txt` ja `.json` (kopiot alla luetelluista löydöksistä).
Mittari tuomitsee: 1238 välkyntälöydöstä, joista 67 yli pisterajan 150; 425 hyppyä, joista 407
iskujen ulkopuolella (iskuiksi laskettiin vain teemakartan `isku`-kohdat, ei `aksentit.json`:ia).
Rajat on viritetty purje-ajolle, joten luvut eivät sellaisenaan kerro, mikä näkyy. Siksi seitsemän
voimakkainta rypästä katsottiin peräkkäisinä ruutuina erotuskuvineen:

| Aika | Mittarin löydös | Mitä ruuduissa näkyy | Arvio |
|---|---|---|---|
| 45,5–47,5 s | pulssit 100–130/255, 4 aluetta | tuulen valkoiset viivat (viulut) pyyhkäisevät kuvan yli, viirit liehuvat | tarkoitettua liikettä |
| 126,5 s | 22 hyppyä sekunnin sisällä | yhden ritarin viiri vaihtaa muotoa yhdessä ruudussa | **napsahdus** |
| 156–170 s | hyppy **joka tasasekunnilla** (156,00, 157,00 … 170,00) | tasangolla yhden ritarin viiri kääntyy yhdessä ruudussa, joka sekunti eri ritarilla | **napsahdus, kellon mukaan**: ei vastaa `aksentit.json`:n iskuja (viirien portaiden piti avautua iskuissa), vaan `Math.floor(t)`-tyyppistä askellusta; vastoin sääntöä "ei kovakoodattuja sekunteja" |
| 626–654 s | 20 pulssia/s, voimakkuus 35 | kumppanin valkoinen viiva piirtyy ja liikkuu; rasteri viivan reunoilla elää | tarkoitettua liikettä (viiva seuraa viulua) |
| 832,5 s | 3 hyppyä, voimakkuus 130 | ritari vaihtuu istuvasta seisovaan **yhdessä ruudussa** veneessä | **napsahdus**: asennon pitäisi vaihtua fraasin mittaisena liikkeenä (tyyliohje luku 8) |
| 980,0 s | 1 hyppy, 52 lohkoa, voimakkuus 133 | koko kuva siirtyy muutaman pikselin yhdessä ruudussa, ei leikkaus (leikkaukset 967,0 ja 1005,0) | **kameran nykäys** oton sisällä |
| 1221–1227 s | koko alakaista, 24 pulssia/s | taistelukenttä kiertyy levyn uraksi, koko rasteri liikkuu | tarkoitettua (sivun kääntö) |

Lisäksi hypyt 212,5, 216,3 ja 220,1 s ovat salamat katkon alussa ennen kohtaloiskuja
(kuvakäsikirjoitus, kohtaus 22), 243,8 ja 252,7 s suon olentojen ensimmäiset äänet ja 435,5 s
`aksentit.json`:n isku 435,48: tarkoitettuja, vaikka mittari ei niitä tunne.

**Johtopäätös:** videossa on ainakin neljä oikeaa yhden ruudun napsahdusta (126,5 s; 156–170 s joka
sekunti; 832,5 s; 980,0 s). Ne ovat pieniä kuvassa, ja käyttäjä on katsonut videon hyväksyen sen, mutta
ne ovat juuri sitä, mitä palautelistan kohta C10 pyysi poistamaan. Korjaus on koodissa pieni
(viirien portaat ankkureihin, asennon siirtymä fraasin mittaiseksi, kameran polku jatkuvaksi), mutta
se vaatii koko A-puolen uuden renderin (18 min) ja masterin (14 min) sekä tämän tarkistuksen
uudelleen. Loput 400 hyppyä ovat samaa luokkaa tai pienempiä, eikä niitä ole katsottu yksitellen.
