# Pyynnöt ja rajapinnat osille 1–4 (perusta3)

Yhteisiin tiedostoihin ei tarvita lisämuutoksia osien takia. Yhden rivin kutsumuutoksia **ei vaadita keneltäkään**; alla vain vapaaehtoiset ja löydökset.

## Uudet rajapinnat (kaikki puhtaita ajan funktioita)

### Asennonvaihto (puppets.js, hero.js)
```js
import { poseSeq, poseSwitch, KP } from './puppets.js';
// asentolista ankkuriaikoineen; siirtymä alkaa avaimen ajasta, kestää dur (oletus 1,5 s, väh. 0,8 s)
const pose = poseSeq([[0, KP.stand], [S.A('gef_rakkaus_hiljaa'), SIT], [S.A('gef_hiljenee'), STAND_BOAT, 2.4]]);
// tai kaksi asentoa: poseSwitch(t, S.A('gef_kolkutus'), SIT, STAND_BOAT, 2.0)
lead.place(t, state, windV, { poseBlend: 1.5, cuts: [S.A('gef_huippu')] });   // kaikki valinnaisia
```
Vaikka et käyttäisi näitä, `place()` pehmentää **yksittäisen** asentohypyn (> 0,3 rad) automaattisesti 1,5 s:n smoothstepillä. Hypyn jonoa (toisto < 1,5 s) se ei pehmennä: ne pitää korjata lähteellä (ks. löydökset). `cuts` sallii hypyn leikkauksessa. `poseBlend: false` poistaa vahdin.
Tarkistus: `node runs/muste-1230/perusta3/poseskan.mjs [alku loppu]` (käyttää `window.poseScan`; "raaka" = hypyt lähteessä, "vahdin_jalkeen" = jäljellä oleva jono).

### Sankarin vyö (sash.js) — osa 3 ja osa 4
Päällä oletuksena `gef_huippu`:sta (A-puoli) kaikissa `leader()`-sankareissa ja `knightBack()`-selkäkuvissa: 8 s:n pehmeä kietoutuminen, ei tarvitse tehdä mitään. Ohitus/hienosäätö:
```js
lead.place(t, state, windV, { sash: { t0: S.A('gef_huippu'), dur: 12, amount: (t) => /* 0..1 */ }, sashSignal: (t) => S.<sooloviulukanava>(t) /* 0..1 */ });
lead.place(..., { sash: false });             // ei vyötä tässä kutsussa
```
`signal` oletuksena viuluviivan varmuus (`build/koko/viuluviiva_A.json`); mitatun kanavan voi antaa `sashSignal`illa. Vyö = leveys 0,085, paperi, olkapäältä lanteelle + vapaa pää; värähtää ja leveneee signaalin mukana. `sash.png`: kolme asentoa. Osa 3: 3.16–3.18 saa vyön huipussa (920 s), tarkista ettei viirin punos/valkoinen viiva veneessä tuplaa vyötä (jos tuplaa, ohenna punosta tai laita `sash:false` hetkeksi).
Osa 4 (taistelu): vyö on mukana. "Taistelussa viulun teemat esitetään tällä vaatteella": `sashSignal` = taistelun viulukanava → vyö leviää viulun soidessa.
B-puoli: kutsu `setSashDefault({ t0: <A-puolen sama hetki tai 0>, dur: 0.01 })` main.js:ssä, niin vyö on alusta saakka.

### Paperisiirtymä (main.js `PAPER_TRANS`)
Osa 3/4 ei tee mitään: 3.22→4.1 hoituu (`gef_hiljaisuus`→`wal_kulissi1`). Luonnos = uuden paikan ensimmäisen ruudun (`wal_kulissi1 − 1,0 s`) reunaviivat, joten 4.1-oton ensimmäinen ruutu on luonnoksen sisältö: **pidä 4.1:n alku selkeänä** (ritari, hevonen, horisontti, kolme viiriä). Osa 3: `loc_shore.js`:n oma paperipesu ja luonnos (`wash`, `sketch`, `pencil`, `penLine`, T.hs…T.wal) peittyvät nyt pääkuvan paperin alle eivätkä näy; voi poistaa halutessaan (ei pakko). Viimeinen 3 s ennen `wal_kulissi1`:ä shore ei näy.

## Pyyntö osalle 3: tähdet pyörivät huipussa (A12)
Tähdet ovat `loc_shore.js`:ssä (`stars`, `starP`, rivit ~584–591 ja ~859–866), ei world.js:ssä. Tee siellä (puhdas aikafunktio):
```js
const starsSpin = { center: [x0, y0], angle: (t) => ... };
// kulma kasvaa gef_huippu:sta (920 s) pehmeästi (smoothstep nopeus 0 → ~0,05 rad/s → pehmeä pysähdys ennen gef_sankari_hiljaa), 
// esim. angle(t) = TURNS * ease(smoothstep(S.A('gef_huippu'), S.A('gef_aalto'), t));
// tähden paikka: rotate((p.x - cx, p.y - cy), angle) + c   (tähdet z = -470, keskipiste kuun kohdalla: MOON.x, MOON.y tai taivaan keskipiste)
```
Pyöritä vain tähdet (ei kuuta, ei vuoria). Pidä pyöreä liike hitaana (kulmanopeus ≤ 0,05 rad/s), ettei se pahoinvoi (drehbuehne-opetus).
Samassa A12:ssa: "kolme tai neljä viiriä huipussa" rikkoo tyyliä: ainoa viiri on ritarin; vyö/viiva eivät saa olla viirejä.

## Löydökset osille: kovat asentohypyt lähteissä (poseskan, `poseskan_3.txt`)
Vahdin jälkeen näitä ei näy yksittäisinä, mutta ne ovat bugeja lähteessä (hyppy yhdessä ruudussa):
- **Osa 1 (`loc_valley.js`)**: aF ±1,5 rad kaikilla sankareilla yhtä aikaa **17,607 / 21,587 / 27,467 s** (T. 6, 8, 11 -iskut = C1-palaute "toverit ilmestyvät") ja 38,54 s (2,9 rad), 39,44 s. Käytä `poseSeq`:ia tai tee kulma fraasin mittaiseksi.
- **Osa 1 (`loc_storm.js`, 120–240 s)**: jono hyppyjä hN/hF 0,85–1,3 rad ~0,45 s välein, kahdeksalla hahmolla (askellus kovina vaihtoina, ei smoothstepinä) — korjaa jalkojen vaihto `sin`-käyräksi. 140–220 s lisäksi yksittäisiä aF/aN. Muut: 252,7 (kF 0,8), 266,15 (eF 1,35), 314,36 (hN 1,69), 361,5 (aN 0,8).
- **Osa 3 (`loc_shore.js`)**: aF 1,4–1,6 rad 951,35 / 969,23 / 980,92 s (nousu ja kutsut), 909 (0,55). Vahti pehmentää; korjaa mielellään lähteessä.
- **Osa 4 (`loc_battle.js`)**: lantion korkeus 1,05 (mounted-lippu vaihtuu) **1145,0 s** ja eN 0,7 1147,9 s. Vahti pehmentää (säätää y:tä), mutta ratsaille nousu kannattaa tehdä `pm`-käyrällä.
- C1/C11: kutsujat, jotka ajavat asiaa iskulla (`S.pulse`/`accIn`) — tarkista, että ne liikuttavat vain viirin kärkeä/tuulta/valoa/roiskeita eivätkä hahmon kehoa: `loc_valley.js` `hitAmp` (r. 107), `tptFlick`, `gust`; `loc_storm.js` r. 173, 208, 251, 430 (`napsahdus`); `loc_meadow.js` r. 52 (`flap`); `loc_battle.js` r. 519 (`pulse`). Yhteisistä tiedostoista ei löytynyt iskuun sidottua kehon liikettä.
