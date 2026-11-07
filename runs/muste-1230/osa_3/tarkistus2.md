# Osa 3, kierros 2: tarkistus 1.11.2026

Muutettu vain `visual/muste/loc_shore.js` (`scenes_3.js` ei muuttunut; yhteisiin tiedostoihin ei kosketa). Vain se, minkä kuva tai mittaus näyttää.
Lopullinen osan renderi: `renders/osa3_v2.mp4` (`--start 422 --end 1126 --workers 2`, ääni kuuntelukopiosta). Stillit: `stills2/` (251 kuvaa), kontaktiarkit `kontakti2/`.
Apuskriptit: `dbg/` (`hs.mjs` asento, `ik.mjs` IK-kulmat, `probe.mjs` mitatut kanavat, `spin.mjs` tähtien kulma).

## Mittaukset (lopullinen koodi)

| Tarkistus | Tulos | Tiedosto |
|---|---|---|
| `videotarkistus.py --start 422` | ääni 0,00 ms (ajautuminen 0 ppm), jähmettymiä 0, KAIKKI KUNNOSSA | `videotarkistus2.txt` |
| `camcheck --max 20` | 94 ottoa, ylittäviä 0 (3.19→3.20 kääntö max 0,1 °/s) | `camcheck2_all.txt` |
| `kohtauscheck --step 15 --from 422 --to 1126` | 1408 ruutua, tyhjää taustaa 0, kerrosreunan ylityksiä 0 | `kohtauscheck2.txt` |
| `poseskan 422 1126` | ennen: 908,98 / 951,35 / 969,23 / 980,92 (aF 0,55–1,58 rad) ja 972,5; nyt vain 972,5 (aN 0,22, aF 0,14 rad, veneen kääntyessä hahmon facing vaihtaa merkkiä) | `poseskan2.txt` |
| `jatkuvuus.py --start 422`, vanha renderi vs. nyt | 832,5 s: 6 hyppylohkoa (28/19/18/8/5/5) -> tunnistetaan leikkaukseksi (410,5), ei hyppyä. 980,0 s: 52 lohkoa (133 amp) -> 4 lohkoa (72x48 px, amp 47). Hyppyjä iskujen ulkopuolella 54 -> 55, välkyntää >150: 25 -> 27 (molemmat ylittävät silti rajan, kuten vanhakin) | `jatkuvuus_vanha.txt`, `jatkuvuus5.txt` |
| tähtien kulma (`dbg/spin.mjs`) | kulma 0 -> -0,87 rad (920->948 s), max nopeus 0,050 rad/s (931,5 s), pehmeä alku ja loppu | `probe`-kenttä `tahdet` |

Jatkuvuuden jäljelle jäävät uudet kohdat (kaikki kirjattuina, ei piiloteta): 6 uutta kapeaa (24 px) hyppyä harpun glissandon kielten syttymisessä (950,3 / 960,7 / 1011,3 / 1019,9 / 1030,8 / 1070,7 s, 4–14 lohkoa, amp 28–39: kielet syttyvät yksi kerrallaan nousevana glissandona, mitattu harppukanava) ja kaksi uutta välkyntäaluetta (979–993 s 312x72 px, 1008–1012 s 72x144 px; jälkimmäinen on glissando 1011,3 s). Syytä en ole kumonnut mittauksella; ensimmäinen välkyntäalue on veneen/rannan kohdalla.

## Kriitikko (tuore Sonnet-tarkistaja, ei tehnyt koodia): `kriitikko2/index.md` (täytetty renderistä v4; lopullisessa renderissä v5 poistettu vain pizzicaton viivakatko ja harpun vinopohja, kuva `kriitikko3/`)
Ensimmäinen kierros (renderi v3) löysi bugin: pizzicato ei näkynyt (viiva ehjä, ei pisteitä) -> korjattu (pisteet irtoavat viivasta), uusi kierros: ei yhtään selvää bugia.

| Kohta | Näkyy / ero | Todennus |
|---|---|---|
| B3 (422–472 s) | taivas berliininsininen koko jakson, paperinvalkoinen viiva selvästi luettava 424 s alkaen; 435–441 s lähikuvassa viivaa ei ole (otto 3.2, ritari johtaa) | `kriitikko2/B3_*.png`, `kontakti2/kontakti_b3.png` |
| A10 / A10p (pizzicato) | 75 mitattua pizzicaton hetkeä (`panns_pizzicato`); jokaisella 4 paperinvalkoista pistettä irtoaa viivan reitiltä ylös ja alas ja hiipuu; näkyy 8 fps ruuduissa 427,1 ja 430,0 s. 10 s välein otetuissa ruuduissa pisteitä ei erota. Ritarin eleet mielialoittain ennallaan | `kriitikko2/A10p_*.png` |
| A5 (760–900 s) | kumppani viivahahmona veneessä keulassa 817 s alkaen (kasvoton, yksi jatkuva viiva), punos maston päällä, ritari ei yksin | `kontakti2/kontakti_a5.png` |
| B10 / B10b | harppu = harpun muotoinen valosilta (pylväs veneen kohdalla, kaareva kaula, 21 kieltä) veneestä kuun alareunaan; mitattuja glissandoja 25 (802–1102 s), joista huipun ajan (920–949 s) tapahtumat jätetty pois. Näkyy 840–842, 845–848 ja 1071–1074 s jne. **Välillä 849–877 s `panns_harp`-kanavassa ei ole yhtään huippua (kanava ei kuule harppua), joten siltaa ei ole**; sitä ei ole keksitty | `kontakti2/kontakti_harppu.png`, `kontakti_uni.png` |
| A12 / A12s | huipussa mastoviiri on poistettu punoksen alta; näkyvissä ritarin viiri + kumppanin punos (+ ritarin lyhyt veto), ei kolmea–neljää viiriä; purppura ennallaan. Tähdet kiertyvät napansa ympäri (mitattu kuvista ~0,7 rad 924–946 s), kuu ja vuoret paikallaan | `kontakti2/kontakti_huippu.png` |
| A11 | vyö (`sash`) kietoutuu huipussa; näkyy lähikuvassa 950–966 s ja selkäkuvassa (oma vyö `bSash`) 986–1004 s. 968–984 s ja 1006–1010 s ritari liian pieni, EI VOI TODETA | `kontakti2/kontakti_jalkihehku.png` |
| B9 (1074–1090 s) | kuvallinen vastaus 1077 s: hyttynen (`panns_flute`), sorsa (puupuhaltimet), haikara (voimakkain puupuhallinkohta), sammakko (`panns_clarinet`) kaislikon reunassa, kukin vain kun oma kanavansa soi; ei ympyröitä. Sorsa ja hyttynen tunnistuvat selvästi; sammakko ja haikara ovat pieniä ja tummia (lievä) | `kontakti2/kontakti_uni.png` |
| A8 (1098–1126 s) | ritari seisoo 1102–1107 s ja nostaa viirin ennen paperia (1102,15–1104,95 s; paperi alkaa 1105,5 s); yö kuivuu paperiksi, tyhjää paperia ilman luonnosta alle 1 s, luonnos piirtyy 1109 s alkaen, ei välähdystä muusta kohtauksesta, 4.1 alkaa luonnoksen päälle. Kolmen viirin luonnos on epäselvä ennen 1124 s (lievä, main.js:n piirtämä) | `kontakti2/kontakti_siirtyma.png` |

## Korjatut kohdat lähteessä
- 3.19 -> 3.20 kamera: 3.19 päättyy täsmälleen 3.20:n alkuotokseen (980,0 s nykäys 52 -> 4 lohkoa).
- 832,5 s: perusta totesi kameraleikkaukseksi 3.13 -> 3.14; ei korjattavaa.
- Asentohypyt: syy ei ollut `poseSeq`-tarpeessa vaan soudun IK-kulma (atan2 ±π: sekoitus `mix(asento, IK, ow)` hyppäsi 2π). Kulmat puretaan kiinteään haaraan ja IK lasketaan aina soutuasennon rungolle (`pIK`); `poseSeq` ei tarvittu.
- `loc_shore.js`:n oma paperipesu ja luonnos (`wash`, `sketch`, `pencil`, `penLine`, `restLine`) poistettu; 3.22:n nosto siirretty aikaan hs + 0,15 s.
- 3.21: mustat pisteet poistettu, uusi kaislikon reuna (`reedsB`) ja neljä olentoa mitatuista kanavista (kanavat luetaan `build/A2` ja `build/A3` suoraan; `S.fam` ei sisällä niitä erikseen).
- Tähdet: napa-ympyrässä (440 tähteä), kulma enintään 0,05 rad/s.

## Ei tehty / avoinna
- 849–877 s harppua ei näy, koska mitattu harppukanava on hiljainen (ks. yllä).
- 3.8:n siniset pisteet (puupuhaltimet, 637–688 s) ovat yhä pisteitä, eivät olentoja (ohjaus.md 3.8 sanoo "siniset pisteet"); kriitikko pitää niitä lievänä huomiona (A10, 652–662 s). Palautteen B9 koski 3.21:tä.
- Jäännöshyppy 972,5 s (0,22 rad) veneen kääntyessä; jatkuvuuden uudet harpun onsetit ja välkyntäalueet (ks. yllä) mittauksessa avoinna.
- `opastarkistus.py` ei ajettu uudelleen (3.21:n `tahtipisteet_n` laskee nyt olentoja).

## Pyynnöt yhteisiin tiedostoihin
Ei muutospyyntöjä. Tiedoksi osalle 4 (`pyynnot.md`): sash = 1 `wal_kulissi1`:ssä (main.js:n oletus `t0 = gef_huippu`, `dur 8`, valmis 928 s), kumppanin viivahahmo on sulautunut vyöhön ennen sitä.
