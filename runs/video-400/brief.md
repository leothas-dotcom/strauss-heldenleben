# Ajo: video-400

> **Hylätty 29.10.2026.** Videossa ei tapahtunut mitään: siinä oli yksi viiri kolmen minuutin
> ajan, eikä se noudattanut tyylin kielioppia. Korvaava ajo on `runs/video-400b`.

**Pyyntö (käyttäjä, 29.10.2026):** kokonainen musiikkivideo A-puolen 400 sekunnin pätkästä,
kuin oikea virallinen musiikkivideo. Videossa on tarina, ja se toteutetaan pelkästään
liikegrafiikkana. Se saa olla 2D, 3D tai molempia. Tärkeintä on, että video on luova ja
uniikki. Työ tehdään itsenäisesti alusta loppuun.

**Lähteet:**
- kuunteluopas (`annotations/kuunteluopas.md`)
- merkinnät (`annotations/cues.json`)
- analyysipaketti (`build/demo400`)
- tyyli "Elävä vedos" (`docs/visuaalinen_tyyli.md`)

## Tarina

| Aika (A) | Musiikki | Kuva |
|---|---|---|
| 0:00–0:07.6 | hiljaisuus, neula laskeutuu, sisäänajoura | tyhjä paperi ja lyijykynäluonnos. Otsikko painautuu ensimmäisestä rahinasta kohopainona, ja naksahdukset näkyvät pölynä. |
| 0:07.6 | sankariteema alkaa matalalta | selkäkuva laaksossa. Keihään kärjestä aukeaa sinooperinpunainen viiri, joka nousee taivaalle rekisterin mukana. Vuoristo painautuu berliininsinisellä orkesterin täyttyessä, ja taivas tummuu hitaasti aamunkoiton rasteriksi. |
| koko jakso | tahdit, voimakkuus, jännite | viirin aalto kulkee tahtien mukana (yksi aalto kahdessa tahdissa). Paksuus seuraa voimakkuutta, ja laatat liukuvat erilleen harmonisen jännitteen mukaan. |
| 0:39 ja muut vaskikohdat | vaskipuhaltimet sisään | viiriin tulee hapsut |
| 3:32–3:44 | neljä iskua | jokainen isku painaa puupiirroksen tähden, joka ennakoi sädekehää |
| 3:59.0 | dominanttiseptimi | sankari huipulla (toinen esiintyminen). Sädekehän säteiden pituudet tulevat sen hetken taajuuskaistoista, ja laatat ovat kauimpana kohdistuksesta. |
| 3:59.2–4:01.5 | tauko | painaminen pysähtyy, ja friisiin jää tyhjää paperia |
| 4:01.5 → | vastustajat | maisema madaltuu suoksi, kuolleet puut painautuvat ja taivas sameutuu (mustan ja punaisen rasteri). Puupuhaltimien attakit tulevat mustina pisteinä sävelkorkeutensa kohdalle: neulat, rykelmät, täplät, Dehringin kaksoset ja lautasiskun roiske. Jokaisen pisteen ympärille jää sameaa usvaa. |
| vastustajien aikana | sankari hiljaa ja tummana | viiri on ohut, haalea ja mustalla tummennettu. Se leimahtaa täyteen sinooperiin, kun vasket tulevat. |
| 6:34–6:40 | loppu, ääni häivytetään | koko friisi taittuu vedosarkiksi, jossa ruudut ovat lukujärjestyksessä. Kirjapainon koriste painetaan seuraavaan tyhjään ruutuun. |

## Tekniikka

- **Kohtaus:** `visual/scene.js` (muodot laatoilla), `visual/print.js` (painojälki) ja
  `visual/main.js` (lataus ja vedosarkki).
- **Data:**
  - `analysis.f32`: voimakkuus, rekisteri, jännite, kaistat, attakit
  - `listen.f32`: soitinperheet, bassostemmi, melodia
  - `beats.json`: tahtiruudukko
  - `events.json`: iskut ja lautasiskut
  - `patina.json`: pöly
  - `cues.json`: dominanttiseptimin ja vastustajien alun ajat
- **Datatarkistus:** `?debug=1` näyttää arvot kuvan päällä. Tarkistuskuvat ovat kansiossa
  `stills/`.
- **Renderöinti:**

  ```
  node render/render.mjs --data build/demo400 --out runs/video-400/renders/heldenleben_400s.mp4 --workers 3 --fade-out 3.5
  ```
