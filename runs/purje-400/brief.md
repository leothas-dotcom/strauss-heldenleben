# Ajo: purje-400 – "Punainen purje"

**Pyyntö (käyttäjä, 30.10.2026):** uusi musiikkivideo Ein Heldenlebenin alusta (A-puoli 0–400 s).
Oikean Disney-piirretyn kaltainen, sankarin matka tarinana pelkällä liikegrafiikalla. Luova ja
uniikki, ja vanhojen videoiden materiaalia saa käyttää. Video elää musiikin mukana, tukee
kuuntelua ja tulkitsee, mitä Strauss tarkoittaa. Kesken työn käyttäjä tarkensi, että työtä on
tehtävä elokuvaohjaajana ja draaman kaaren ehdoilla ja että työtä tarkistavat neljä agenttia.

**Kuvakäsikirjoitus:** [storyboard.md](storyboard.md) · **Tarkistus:** [tarkistus.md](tarkistus.md)

## Idea yhdellä lauseella

Käyrätorvikapteeni nostaa **punaisen purjeen** (sankarin taso) aamunkoitossa. Hänen kahdeksan
käyrätorvensa ovat laivasto. Neljä nousua yhä korkeammalle päättyy majakkaluodolle, jossa aurinko
nousee sädekehänä. Tyvenessä soitinten muotoiset arvostelijat vievät häneltä tuulen, kunnes hän
muistaa aamun ja tuuli palaa.

## Ohjaajan linjat (taustatutkimuksesta)

- **Näytös I on muotokuva, ei matka.** Porterin neljä luonteenpiirrettä ja neljä yhä korkeammalle
  nousevaa aaltoa muuttuvat neljäksi nousuksi: aamun niemi, avomeren harja, rannikko ja aaltovuori
  majakkaluodolle.
- **Kantava kuva on auringonnousu korkeimmassa paikassa.** Käyttäjä nosti sen torviritarin
  hienoimmaksi kohdaksi. Se tulee kolmesti: niemen huipun takaa (`held_vasket_t13`), sädekehänä
  luodon yllä (`held_dom7`) ja muistona tyynessä vedessä (`wid_reh17`).
- **Masto ja purje ovat suoraselkäisyys.** Näytöksessä II tuuli loppuu, purje roikkuu ja tummuu,
  ja kapteeni painuu. Loppu on nousun alku, koska käyrätorvet tulevat vasta A 6:41.
- **Ironia:** englannintorvi vääristää teeman, ja kapteenin peilikuva venyy Quijoteksi.

## Mitä otettiin edellisistä

| Edellisestä | Nyt |
|---|---|
| torviritarin painojälki, paperimuodot, signaalit, nukke ja levyn intro (`ink.js`, `paper.js`, `signals.js`, `puppets.js`, `hero.js`, `loc_record.js`) | kopioitu `visual/purje/`:hen ja täydennetty |
| ratsujoukko ja viirit eri suuntiin (palaute 6) | yksi tuuli: kaikki purjeet ja viirit lukevat saman `wind(t)`:n |
| pomppivat hahmot (palaute 2) | Laivat keinuvat mainingeilla, joiden korkeus tulee matalista jousista. Iskun tekee roiske, viiri, salama, maininki tai sädekehä. |
| staattiset taustat (palaute 3) | Vuorten rasteri hengittää dynamiikan mukaan, usvat ja pilvet ajelehtivat soitinten kertymän mukaan, kalliot nousevat matalien jousten mukana ja taivas seuraa rekisteriä. |
| suo ei välity (palaute 4) | olennot soittimiensa muotoisina isoina siluetteina, yksi ele kullakin |
| reunat paljastuvat (palaute 5) | uusi tarkistus `render/kohtauscheck.mjs` |

## Tekniikka

- **Kohtaus:** `visual/purje/` (three.js r170, ei uusia riippuvuuksia). Uutta ovat
  - `world.js`: tuuli, meri (sama aaltokaava varjostimessa ja JS:ssä), laiva ja purje, selkäkuvan
    laiva, tiirat, roiskeet ja heijastukset
  - `critters.js`: soitinten muotoiset olennot
  - paikat `loc_harbor`, `loc_sea`, `loc_calm`, `loc_coast`, `loc_storm` ja `loc_lagoon`
- **Ajat:** ankkurit `S.A(id)` teemakartasta, iskut `aksentit.json`:sta, jousten aallot
  jaksorajoista ja kertymät (purjeen nosto, kallioiden nousu, ajelehdinta) aikasarjoista.
- **Tarkistus:**
  ```
  node render/render.mjs --page visual/purje/index.html --data build/demo400 --stills 37,238 --debug 1 --dir runs/purje-400/stills
  node render/camcheck.mjs --page visual/purje/index.html --data build/demo400 --max 20
  node render/kohtauscheck.mjs --page visual/purje/index.html --data build/demo400 --step 10
  node render/render.mjs --page visual/purje/index.html --data build/demo400 --out runs/purje-400/renders/heldenleben_purje_400s.mp4 --workers 2 --fade-out 3.5
  ```
