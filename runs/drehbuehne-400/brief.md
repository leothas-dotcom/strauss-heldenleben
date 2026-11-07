# Ajo: drehbuehne-400 – "Pyörivä näyttämö"

**Pyyntö (käyttäjä, 29.10.2026):** kokonainen musiikkivideo, kuin oikea virallinen
musiikkivideo, jossa on paljon tanssia tai tarina, pelkkänä liikegrafiikkana (2D/3D). Tärkeintä
on, että video on luova ja uniikki. Tyyliä käytetään referenssinä. Edellisten ajojen
(`video-400`, `video-400b`) idea, eli sivuttain vierivä friisi, **hylätään liian staattisena**.
Analyysiä ei luoda lisää, vaan käytetään valmista pakettia `build/demo400` (A-puoli 0–400 s),
kuunteluopasta ja merkintöjä.

**Kuvakäsikirjoitus:** [storyboard.md](storyboard.md)

## Idea yhdellä lauseella

**LP-levy on pyörivä näyttämö, ja orkesteri on tanssiseurue.** Jokainen soitinryhmä on oma
tanssijaryhmänsä, joka tulee lavalle, kun soittimet tulevat sisään, ja poistuu, kun ne
vaikenevat. Sankari on solisti, ja kamera leikkaa tahtiviivoilla kuin musiikkivideossa.

## Miksi juuri tämä

| Lähde | Mitä otamme |
|---|---|
| **Drehbühne**, Karl Lautenschläger, Residenztheater, München 1896 (*Don Giovanni*) | Länsimaisen teatterin ensimmäinen pyörivä näyttämö oli Münchenissä samoina vuosina, kun Strauss oli siellä hovikapellimestarina (1894–98). Lavastus vaihtuu pimeässä, kun näyttämö kääntyy. Oliko Strauss mukana juuri tässä tuotannossa: **[tarkista]**. |
| **LP-levy** (London LL 659) | Näyttämö on itse levy: urat, etiketti ja äänivarsi. Äänivarren neula etenee urassa sen mukaan, missä kohtaa levyä ollaan. |
| **Oskar Schlemmer: *Triadisches Ballett*** (Stuttgart 1922) | Tanssijat on rakennettu geometrisista kappaleista (kartio, lieriö, pallo, kiekko), eikä heillä ole kasvoja. Kolme tanssijaa ja kolme osaa vastaavat tyylin kolmea voimaa (piste, viiva, taso). |
| **Busby Berkeley** (1930-luvun elokuvamusikaalit) | Kun koko orkesteri soittaa, kamera katsoo suoraan ylhäältä ja tanssijoiden kehät muodostavat levyn päälle kaleidoskoopin. |
| **Elävä vedos** (`docs/visuaalinen_tyyli.md`) | Seitsemän painoväriä, rasterivarjostus (ei digitaalisia liukuvärejä), mustetta ja paperia. Mustat hahmot saavat paperinvalkoisen ääriviivan kuin valkoviivapuupiirroksessa (*Weißlinienschnitt*). Levyn naksahdukset näkyvät pölynä, ja hiljaisuus on tyhjää paperia. |

## Mikä muuttui hylätyistä

| Hylätyt (`video-400`, `video-400b`) | Nyt (`drehbuehne-400`) |
|---|---|
| 2D-friisi vierii sivuttain samalla nopeudella | 3D-näyttämö, 100 ottoa (keskimäärin 4 s) ja 26 kamerakulmaa: edestä, sammakko, ylhäältä, kiertävä, nosturi, ura, äänivarsi, sankarin näkökulma vastustajien keskeltä... |
| viiri ja maisema | 39 tanssijaa: sankari, käyrätorvikuoro (4), viulut (8), sellot ja bassot (6), vasket (6), 13 vastustajaa yhdeksänä tyyppinä ja kurkistaja |
| soittimet kaistoina | soittimet tanssijoina, jotka tulevat ja poistuvat datan mukaan, sekä soittimet lavasteina (harppu, patarummut, lautaset) |
| tapahtumat merkkeinä | tapahtumat koreografiana: nousu luukusta, tornin portaat, neljä jähmettymistä, huipun tablo, pimeä lavanvaihto |

## Tekniikka

- **Kohtaus:** `visual/drehbuehne/` (three.js r170 on jo lukituksessa, ei uusia riippuvuuksia).
  Kohtaus on puhdas aikafunktio `seek(t)`, myös nauha ja tanssijoiden polut: ne lasketaan
  aikaisemmista ajoista, eikä ruutujen välillä ole tilaa.
- **Renderöinti:** `render/render.mjs` sai valitsimen `--page` (oletus edelleen
  `visual/index.html`, joten vanhat ajot toistuvat samoina).

  ```
  node render/render.mjs --page visual/drehbuehne/index.html --data build/demo400 --stills 9,30,45 --dir runs/drehbuehne-400/stills
  node render/render.mjs --page visual/drehbuehne/index.html --data build/demo400 --out runs/drehbuehne-400/renders/heldenleben_drehbuehne_400s.mp4 --workers 2 --fade-out 3.5
  ```
- **Tarkistus:** `&debug=1` näyttää kuvan päällä kuvan numeron, kameran, jakson ja tanssijaryhmien
  läsnäolon.

## Tulos

- **Video:** `renders/heldenleben_drehbuehne_400s.mp4` (400 s, 1920×1080, 30 fps, h264 crf 18 +
  aac 320k, 1,9 Gt). Renderöinti kesti 7,6 min kahdella työläisellä (`render.log`).
- **Kontaktiarkki:** `renders/heldenleben_drehbuehne_400s_kontakti.jpg`.
- **Tarkistuskuvat:** `stills/` (osa `debug=1`-tilassa).

## Työn kulku

1. Kuvakäsikirjoitus (`storyboard.md`), sitten kohtaus.
2. Still-kuvat ja korjaukset, jotka tehtiin kolmella kierroksella:
   - taivas loppui kesken
   - toimintanimike ei erottunut
   - vasket tulivat lavalle liian aikaisin
   - harpun geometria oli väärin
   - lautaset näyttivät silmiltä taivaalla
   - kamera oli lattian alla nousussa
3. Koko luonnos ja sen läpikäynti 2 s:n välein. Korjatut kolme pahinta ongelmaa:
   - vastustajat olivat liian pieniä ja tummia mustalla levyllä: nyt ne ovat isommat, lähempänä
     sankaria ja saavat omat valokeilansa
   - yöjakso oli staattinen: nyt otot ovat lyhyempiä, ja sankari kulkee kaarta etiketillä
   - kurkistaja ei osunut kuvaan: nyt sillä on oma ottonsa
4. Leikkauslistan tarkistus: huipun kohdalla neljäs jähmettymä oli nosturin alla, ja
   dominanttiseptimin otto kesti vain 0,23 s. Molemmat korjattiin, ja lopullinen video
   renderöitiin.

## Datan käytöstä tehdyt valinnat (tarkista)

- **Vaskiryhmän** (trumpetit ja pasuunat) läsnäolo tulee analyysin jaksoista eikä PANNs-käyrästä.
  PANNs:n trumpetti- ja pasuunaluokka antaa vahvistamasi tulon (A 0:39.4) vasta 41,0 s:n kohdalla,
  ja sen "brass instrument" -luokka reagoi myös käyrätorviin.
- **Neljä jähmettymää** (A 3:32.5, 3:36.3, 3:40.1, 3:43.7): kuva noudattaa dataa. Äkillinen
  hiljeneminen jähmettää näyttämön, ja noin 1,2 s myöhemmin tuleva paluu räjäyttää seurueen uuteen
  tabloon. Mitä partituurissa tapahtuu, on edelleen **[tarkista]**.
- **Vastustajat** saavat Porterin järjestyksen puupuhaltimien fraasien järjestyksessä samaan tapaan
  kuin `video-400b`:ssä. Kuka oikeasti soittaa minkäkin fraasin: **[tarkista]**.
- **Drehbühne ja Strauss:** pyörivä näyttämö esiteltiin Münchenin Residenztheaterissa 1896
  (*Don Giovanni*), kun Strauss toimi Münchenissä hovikapellimestarina. Lähteet eivät kerro,
  johtiko hän juuri sen esityksen **[tarkista]**.

Lähteet: [Deutsche Biographie: Lautenschläger](https://www.deutsche-biographie.de/sfz48520.html),
[Revolving stage (Wikipedia)](https://en.wikipedia.org/wiki/Revolving_stage),
[Schlemmer: Triadic Ballet](https://www.schlemmer.org/triadic-ballet).
