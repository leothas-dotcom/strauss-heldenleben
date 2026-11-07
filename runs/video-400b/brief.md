# Ajo: video-400b

**Pyyntö (käyttäjä, 29.10.2026):** kokonainen uusi musiikkivideo A-puolen 400 sekunnin pätkästä.
Ensimmäinen versio (`runs/video-400`) hylättiin, koska siinä ei tapahtunut mitään ja siinä
oli vain yksi viiri kolmen minuutin ajan. Uusi video käyttää kuunteluopasta ja dokumentteja.
Se kuvaa eri soittimet, tempon vaihtelut ja taitekohdat, ja se kertoo sankarin matkan:
mitä sankari haluaa sanoa ja mistä tarinassa on kyse. Tyyliä "Elävä vedos"
(`docs/visuaalinen_tyyli.md`) noudatetaan kokonaan.

**Kuvakäsikirjoitus:** [storyboard.md](storyboard.md)

## Mikä muuttui hylätystä versiosta

| Hylätty (video-400) | Nyt (video-400b) | Tyylin kohta |
|---|---|---|
| yksi viiri koko ajan | sankari, viulut, bassot, vasket, lyömäsoittimet, harppu ja vastustajat ovat omia ääniään omilla kaistoillaan | 4 kielioppi, 7 rekisterikaistat |
| kaikki saman vahvuisina | pääääni täysvärinä, sivuääni rasterina ja säestys maailman sinisenä | 7 Hauptstimme |
| sama muoto koko ajan | sankarin neljä luonnetta jaksoittain (45 jaksoa, `segments.py`) | 10 hahmot |
| sama maisema koko ajan | jokaisella jaksolla on oma harjanteensa, ja suurimmissa taitteissa on jugend-pylväät | 6 friisi, 11 jaksot |
| tempo ei näkynyt | tahtipaalut polulla: välistys on tempo | 8 liike |
| ei sivutoimintaa | tremolo, harpun väreet, patarumpujen tärähdys ja lautasiskun välähdys | 8 Disneyn periaatteet |
| vastustajat yhtenä pistejoukkona | yhdeksän tyyppiä Porterin järjestyksessä ja venytys ja litistys | 10 vastustajat |
| ff-tutti näytti tyhjältä | tehollinen tutti: kova soitto, jota soitinluokat eivät selitä, kuuluu koko orkesterille | 13 selkeys |
| vedosarkki lopussa | kirjapainon koriste painokohtaan | – |

Selkäkuva esiintyy vain kahdesti: alussa ja dominanttiseptimissä. Kasvoja ja hahmoanimaatiota
ei ole (tyyli, kohta 15).

## Tekniikka

- **Kohtaus:** `visual/scene.js` (muodot laatoilla), `visual/print.js` (painojälki) ja
  `visual/main.js` (lataus).
- **Data:**
  - `analysis.f32`: voimakkuus, rekisteri, jännite, kaistat, attakit, sävellajit
  - `listen.f32`: soitinperheet (PANNs), bassostemmi, melodia (CREPE)
  - `beats.json`: tahtiruudukko
  - `events.json`: vasaraniskut
  - `segments.json`: jaksot ja niiden soittimet, dynamiikka ja suunta
  - `patina.json`: pöly
  - `cues.json`: dominanttiseptimin ja vastustajien alun ajat
- **Tarkistus:** `?debug=1` näyttää kuvan päällä jakson ja luonteen, pääänen ja jokaisen äänen
  arvon. Tarkistuskuvat ovat kansiossa `stills/`.
- **Renderöinti:** `ffmpeg` on PATHissa, tai sen polku annetaan muuttujassa `FFMPEG`.
  Renderöinti tehdään 40 sekunnin osina, joten keskeytynyt ajo jatkuu valmiista osista.
  Kahdella työntekijällä, koska muut ohjelmat varaavat koneen muistin.

  ```
  node render/render.mjs --data build/demo400 --out runs/video-400b/renders/heldenleben_400s.mp4 --workers 2 --chunk 40 --fade-out 3.5
  ```
