# Vaihe 0b (perustan korjaus): tarkistus 31.10.2026

Tässä on vain se, minkä mittaus tai kuva näyttää. Ajat ovat A-puolen aikaa (totuus `build/kuuntelu/A_puoli_kuuntelu.wav`).
Kuvia ei ole renderöity videoksi; stillit, mittaukset ja tuoreen tarkistajan arvio riittävät. Ajon tiedostot tässä kansiossa:
`asennot.png` + `asennot.json` + `asentotaulu.md`, `t*.png` (stillit), `siirtymat_2s_jalkeen.png`, `otecheck.txt/.json`,
`kohtauscheck.txt`, `camcheck.txt`, `karkicheck.txt`, `ennen/` (korjausta edeltävät vertailustillit), `koe/` (korjauksen aikaiset koestillit).

## 1. Mitä korjattiin ja miksi (palautteesta 1–4)

| # | Vika (ohjaajan stillit) | Syy koodissa | Korjaus |
|---|---|---|---|
| 1 | keihäs seisoi erillään käsistä (t037, t044.5, t1014); airot eivät olleet käsissä (t830) | toverit olivat `knight()`-nukkeja ilman keihästä ja viiri oli erillinen tanko (`pennants`, `tips`, `pens`, `cpens`); selkäkuvan keihäs oli kiinteässä pisteessä (0,5; 1,0) eikä seurannut kättä; airon kulma oli soudun vaiheesta riippumaton eikä sidottu käsiin; rantaan isketty keihäs seisoi veneen sisällä (LANCE_X) | `hero.js frame()`: yksi laskenta (`handFK`) sijoittaa sekä keihään että kämmenet; lähempi kämmen on keihään origossa, kauempi ratkaistaan varrelle `armIK`:lla (`puppets.js`); toverit ovat `leader()`-nukkeja (keihäs ja viiri kädessä) laaksossa ja myrskyssä, erilliset tangot poistettu; selkäkuvan keihäs seuraa kättä (`knightBack.hold`); airo on esine: `OAR` (hankain, otteet), kädet airon varrelle, lapa veneen pohjan alla; rantakeihäs siirretty veneen ohi (LANCE_X) |
| 2 | siirtymä jätti edellisen paikan näkyviin (t048: laakson ritarit meren alla) | rasteriliukuma päättyi vasta ankkurin jälkeen (siirtymän keskikohta ankkuri − 0,2 s, kesto 1,4 s → loppu 48,3 s) | `main.js TRANS`: uusi paikka on kokonaan näkyvissä ankkurissa (siirtymä päättyy ankkuriin, `endAt`); kaksi tarkoituksella myöhästettyä (niitty, levyn avaus) ennallaan |
| 3 | veto leijui irrallaan taivaalla (t015.6) | `loc_valley.js tipAt` laski kynän paikan kärjestä riippumatta (PEN_GAIN, PEN_SWEEP) | veto lasketaan keihään todellisesta kärjestä (selkäkuvassa kämmenestä `hold`-kaavoilla, profiilissa `L.tipAt`); historia virtaa tuulessa (drift 1,0), joten sävelkorkeus piirtyy vedoksi; ohuempi sivellin (wmax 0,5); muste vain neljässä sovitussa kohdassa ennallaan |
| 4 | siivous | – | `loc_dream.js`, `loc_plain.js`, `test_battle/river/sea.html` → `visual/muste/_pois/` (ei viittauksia `index.html`:ssä, `main.js`:ssä eikä muualla); `perusta/chain*.log` → `perusta/lokit/`; `runs/muste-1230/README.md` |

Uudet mittarit: `render/otecheck.mjs` (kämmenen ja varren etäisyys, `window.gripProbe(t)` main.js:ssä; keihäs, airo ja selkäkuvan keihäs),
`render/karkicheck.mjs` (vedon kärjen ja keihään kärjen ero), `test_poses.html` (asentotaulu etäisyysluvuin).

## 2. Asentotaulu (`asennot.png`, `asentotaulu.md`)

Kolme riviä u = 0, 0,5, 1; jokaisen solun alla mitattu etäisyys (yksikköä) näkymäpuusta: k = lähemmän kämmenen etäisyys keihään (soutussa airon)
varresta, f = kauemman kämmenen etäisyys varresta tai vartalosta (pienempi). Hyväksymisraja 0,05. Luvut tulostuvat myös konsoliin
(JSON `asennot.json`). **33 solua: kaikissa k ja f ≤ 0,001** (`soutu`: airo hankaimineen, lapa veden alla; `kaantyminen_selkaan` u = 1: selkäkuvan keihäs, kämmen varrella).

| Asento | tyyppi | u = 0 (k / f) | u = 0,5 (k / f) | u = 1 (k / f) |
|---|---|---|---|---|
| seisonta | keihäs | 0.000 / 0.000 | 0.000 / 0.000 | 0.000 / 0.000 |
| kävely | keihäs | 0.000 / 0.000 | 0.000 / 0.000 | 0.000 / 0.000 |
| kääntyminen profiiliin | keihäs | 0.000 / 0.000 | 0.000 / 0.000 | 0.000 / 0.000 |
| kääntyminen selkään | keihäs | 0.000 / 0.000 | 0.000 / 0.000 | 0.000 / – (selkäkuva) |
| polvistuminen | keihäs | 0.000 / 0.000 | 0.000 / 0.000 | 0.000 / 0.000 |
| istuminen | keihäs | 0.000 / 0.000 | 0.000 / 0.000 | 0.000 / 0.000 |
| soutu | airo | 0.000 / 0.000 | 0.000 / 0.000 | 0.000 / 0.000 |
| keihään isku maahan | keihäs | 0.000 / 0.000 | 0.000 / 0.000 | 0.000 / 0.000 |
| kämmenen ojennus | keihäs | 0.000 / 0.000 | 0.000 / 0.000 | 0.000 / 0.000 |
| kellon nosto | keihäs | 0.000 / 0.000 | 0.000 / 0.000 | 0.000 / 0.000 |
| keihään nosto molemmin | keihäs | 0.000 / 0.000 | 0.000 / 0.000 | 0.000 / 0.000 |

Kauempi käsi on aina varrella (kaksi kättä keihäässä), paitsi kun varsi on yli ulottuman (yhden käden ote, esim. ratsastajan vaakasuora keihäs):
silloin varsi kallistuu enintään 0,6 rad kauempaa olkapäätä kohti, ja vasta sen jälkeen käsi siirtyy rinnalle (vartalolle).

## 3. Ote koko A-puolella (`otecheck.txt`)

`node render/otecheck.mjs --from 0 --to 1240 --step 0.5`: jokaisessa ruudussa (2480 ruutua) jokaisen näkyvän tai harjanteen takana piilossa olevan
keihään, airon ja selkäkuvan keihään ote mitattu näkymäpuusta. **4024 otetta (keihäs 3737, selkäkuvan keihäs 48, airo 239), ylityksiä (> 0,05) 0;
suurin lähempi 0,002, suurin kauempi 0,003.** Aiemmin samalla mittarilla (rajan ylittäviä) kolme tilannetta: kääntyminen 929–931 s, nousu/laskeutuminen
(kahden esineen ote päällekkäin, 950 s ja 809 s) ja ratsastus; ne korjattiin (keihään kallistus, airot vasta kun keihäs ei ole kädessä).

## 4. Muut mittaukset

| Tarkistus | Tulos |
|---|---|
| `kohtauscheck --step 15` (2480 ruutua) | kerrosreunan ylityksiä **0**; tyhjää taustaa 46 ruudussa, samat kuin perustassa (paperikehys 0–7,5 s, taistelun sukellus, levy) |
| `camcheck --max 20` | 97 ottoa, ylittäviä **0** |
| `karkicheck --from 7.3 --to 47` (valley) | vedon uusin pää keihään kärjessä: 572 ruutua mitattu (9,30–28,97 s), suurin etäisyys 0,0000 (raja 0,1) |
| siirtymät | kuva 2 s jokaisen siirtymän päättymisen jälkeen: `siirtymat_2s_jalkeen.png` (9,6; 49,8; 102,6; 128,4; 241,4; 424,0; 804,0; 1127,7; 1231,7 s): edellinen paikka ei näy missään |

## 5. Stillit (katsottu)

- `t037.0.png`: toverit rivissä keihäät ja viirit kädessä harjanteen takana (ritarit piilossa, keihäät ja viirit ylittävät harjanteen); sankari pienenä, keihäs molemmin käsin.
- `t044.5.png`: kolme ritaria lähikuvassa, jokaisella molemmat kämmenet keihään varrella ja viiri keihäässä; ei erillisiä tankoja.
- `t048.0.png`: meri ilman jälkeäkään laaksosta (siirtymä päättyy ankkuriin 47,8 s).
- `t015.6.png`: ritari selin, keihäs kädessä, veto lähtee keihään kärjestä ohuena ja leveämpänä vasemmalle tuulessa.
- `t150.0.png`: kahdeksan ritaria keihäineen, keihäät kädessä; yksi leveä veto yllä (1.11, ennallaan).
- `t830.0.png`: ritari soutaa, molemmat kädet airon varrella, lapa vedessä (veneen pohjan alla 1,2 yksikköä tässä vaiheessa).
- `t1014.0.png`: vene rannassa; rantaan isketty keihäs on nyt veneen ulkopuolella (x +4,2 rannasta).

## 6. Tuoreen tarkistajan arvio (sonnet, ei tehnyt koodia)

Tarkistaja (sonnet, ei tehnyt koodia) katsoi stillit t037, t044.5, t048, t015.6, t150, t830, t1014 ja asentotaulun kuvasääntöjen kohdilla 1–7, 10, 21, 22, 24. Raportti on tallennettu tiivistettynä; kuvan perusteella:

- **Onko keihäs/airo käsissä?** t044.5 KYLLÄ (kaikki kolme näkyvää), t015.6 KYLLÄ, t150 KYLLÄ (kahdeksan), t830 KYLLÄ (airo kulkee käsien kautta, lapa vedessä), t037 vain keskiritari KYLLÄ: **seitsemän toverin keihästä seisoo ilman näkyvää ritaria** (ritarit ovat harjanteen takana, keihäs ja viiri nousevat harjanteen yli; ohjauksen "sointuiskun" elementti, ritarit nousevat 39,4 s), t1014 EI: rantaan isketty keihäs on erillään kädestä (ohjauksen mukainen: keihäs on laskettu), t048 ei varmaa (ritari liian pieni).
- Asentotaulu: tarkistaja ei pikselitasolla voinut vahvistaa otetta kaikissa soluissa; epäili profiili- ja selkäkääntymisen soluja (kapea vartalo), keihään nosto molemminkäsin u = 1 (varsi torven läpi) sekä soutusolun pitkää airoa (ylittää solun rajan). Mitattu etäisyys on silti 0.
- Kuvasäännöt: KYLLÄ kohtiin 3, 5, 7, 24 lähes kaikissa; EI kohtiin 1, 2, 4, 6 laajoissa kokokuvissa (t037, t044.5, t048, t830: monta ryhmää, punaista monessa paikassa); kohta 10: t015.6 KYLLÄ (veto ainoa pääosa, mutta "sotkuinen ja leikkautuu reunaan"), t150 EI (leveä veto ei lähde kärjistä eikä ole ainoa pääosa: tämä on `loc_storm.js`:n 1.11, ennallaan, ei tämän tehtävän kohta 3); kohta 21 EI t037 (tuuliviivat vs liput), t015.6 (viiri oikealle, muste vasemmalle); kohta 22 EI t037, t044.5 (lippu päällekkäin auringon kanssa), t048, t830 (kuu/viiri/puu päällekkäin).
- Pahimmat: (1) t150 muste leijuu irti kärjistä; (2) t037 tangot ilman ritaria, tuulen suunnat; (3) t044.5 lippu sulautuu aurinkoon, keskikokoiset ritarit; (4) t015.6 viiri ja muste eri suuntiin, muste reunaan; (5) t1014/t048 ritari liian pieni.

Nämä jäävät osan 1 / ohjaajan päätettäväksi (sommittelu, värit, tuuli), eivät kuulu perustan vikoihin.

### Kärki ja melodia (ohjaajan tarkennus 31.10.)

- Viiri on kiinni keihäässä ja keihäs kädessä joka ruudussa (otecheck 4024 otetta, 0 ylitystä); muste on keihään KÄRJEN jälki, ei viirin: tipTrail lähtee `tipAt`:sta, ohut kärjestä (press kasvaa iän mukana), tuuli ajelehduttaa, rasteri kuivattaa (`karki_ero`).
- Kärjen korkeus mukailee melodiaa tasoitetusti: teemaviivan midi mediaanisuodatettu (±0,1 s) ja gaussisesti tasoitettu (sigma 0,35 s), esilaskettu 0,02 s ruudukkoon (`mel` loc_valley.js). Isoa kaarta Es2 → Es5 seurataan, yksittäiset nuotit eivät nyki.
- Mittaus `node render/kaarevyys.mjs --from 9.3 --to 29 --skip 23.07` (`kaarevyys.txt`): kärjen korkeuden toinen derivaatta suurin **8,1 yks/s²** (raja kirjattu 60 yks/s²; ennen tasoitusta ~490), Spearman raakaan teemaviivaan **0,803** (> 0,8, niukka), 572 ruutua. Ohitettu yksi ruutu 23,07 s: selkäkuva vaihtuu profiiliksi (keihäs hyppää, sama hyppy näkyy itse keihäässä; ennallaan).
- Kärki vs. keihään kärki: suurin ero 0,0000 yks (raja 0,1), 572 ruutua (`karkicheck.txt`).
- Stillit 15,6 / 22,0 / 30,0 s: `karki_15-22-30.png`. 15,6 ja 22,0: veto alkaa keihään kärjestä ja virtaa tuulessa vasemmalle; 30,0 s: portti on sulkeutunut (heroGate viulujen tullessa) ja veto on haalistunut lähes näkymättömiin; ritari kävelee profiilissa.
- Vain `isku`-kohdat saavat napsahtaa: kärjessä ei ole iskuun sidottua liikettä (ei yksittäisiä sävelhyppyjä).

## 7. Avoimet asiat

- Maston viiri (3.9, punos) on ohjauksen mukainen (ei käsissä): ennallaan. Jos viirin pitää olla käsissä myös 3.9:ssä, se on ohjausmuutos.
- `docs/palautelista.md` A6 viittaa `loc_dream.js`:ään (siirretty `_pois/`); doc ei ollut tämän tehtävän tiedostoja.
- Kauempi käsi on nyt aina keihäässä: kävely ja seisonta ovat kaksikätisiä (ei heilu); jos halutaan vapaa käsi, se on pyyntö ohjaajalle.

## 8. Ohjaajan hyväksyntä 31.10.2026

Stillit t015.6, t044.5, t830 ja karki_15-22-30 katsottu. Mekaniikka hyväksytty: keihäs ja airot
käsissä (0 ylitystä 4024 otteesta), veto alkaa kärjestä, kärki mukailee (toinen derivaatta 8 yks/s²),
siirtymä ei vuoda. Osille jää sommittelu: t044.5 keihäät ovat kuvaa korkeammat ja viiri sulautuu
aurinkoon; t022 toverien viirit näyttävät maahan pistetyiltä tangoilta; vedon muoto on yhä paksu
"käärme", sen pitää olla sivellinjälki (ohut, leveys paineesta, kasure). Kumppanin tikku-ukko (t830)
poistuu osan 3 uudessa ohjauksessa.

## 8. Korjaus 31.10. (ohjaaja): muste alkaa VIIRIN kärjestä, ei keihään

Veto lähtee nyt viirin vapaasta päästä (hännästä): profiilissa `hero.js tailAt` (sama laskenta kuin viirinauhan viimeinen piste), selkäkuvassa viirin häntä (viiri tuulen suuntaan -x, roikkuu vaakaan eikä kierry keihään mukana). Mittaus näkymäpuusta (viirinauhan viimeinen kärkipari / viirin hännän vertex): ero 0,0000 yks, 572 ruutua (`karkicheck.txt`). Avauksen (selkäkuva, 9,3–23,0 s) kärjen korkeus: max |y''| 8,1 yks/s², Spearman teemaviivaan **0,905**. Profiilivaiheessa (23,2–29 s, portti sulkeutuu, veto haalistuu) korkeuteen vaikuttaa viulutuuli (viirin häntä nousee tuulessa), joten Spearman siellä ei ole mielekäs; ruutu 23,07 s (selkäkuva -> profiili) on hyppy itse viirissä. Stillit 15,6 ja 22,0: `karki_15-22-30.png` (veto alkaa viirin hännästä). Aiempi Spearman 0,803 oli koko ajalta keihään kärjellä.
