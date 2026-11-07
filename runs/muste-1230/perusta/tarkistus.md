# Vaihe 0 (perusta): tarkistus 31.10.2026

Tässä on vain se, minkä mittaus tai kuva näyttää. Ajat ovat A-puolen aikaa (totuus `build/kuuntelu/A_puoli_kuuntelu.wav`).
Tiedostot tässä kansiossa: stillit `t009.0 … t450.0.png`, `asennot_u05.png`, `kohtauscheck.txt` (koko puoli) ja
`kohtauscheck_0_60.txt` (avaus kameramuutoksen jälkeen), `camcheck.txt`, `opasprobe.json`, `opastarkistus.md`,
`videotarkistus.txt`, `renders/perusta_0_240.mp4` (+ kontaktiarkki), `frames/` (ruutukoosteet jähmettymäkohdista).

## 1. Mitä tehtiin (docs/tuotantojako.md, Vaihe 0, kohdat 1–7)

| # | Kohta | Toteutus |
|---|---|---|
| 1 | Viirin jättämä muste | `brush.js tipTrail`: veto = kärjen paikat hetkillä t−τ (0…17,5 s), puhdas ajan funktio; tuuli ajelehduttaa, `inkAge` kuivattaa, `heroGate` portittaa. Laakso: selkäkuvan keihäs nousee teemaviivan mukana (`backLanceRot`), profiilissa `leader.tipAt`. Myrsky 141–155 s: toverit saivat keihäät, kahdeksan `tipTrail`-vetoa. Kumppani: `companionTrail` (paperinvalkoinen, portti viuluviivan conf). Friisinauha (`mkFrieze`, `friezeUpdate`, `FRIEZE_N`, `hudStroke`) poistettu. |
| 2 | Asentokirjasto | `puppets.js POSES[nimi](u)`: 11 asentoa, siirtymät smoothstep-vaiheella; `handFK` (käden paikka ilman näkymäpuuta); `test_poses.html`. |
| 3 | Syaani pois | `ink.js`: post-shaderin RGB-kanavasiirto poistettu; laatan kohdistusvirhe vertex-shaderissa vain `ink()`-laatoille, suunta värin mukaan (`plateDir`), määrä `U.uMis` ≤ 1,8 px (`misAt(t)` main.js:ssä). |
| 4 | Tarkistin | `videotarkistus.py`: vain puolen paketit (A: demo400, A2, A3); teemakartan `isku`-kohdat pakollisia, aksentit z ≥ 9 vain tiedoksi. |
| 5 | Jako | `scenes_1.js` (0–24, held_alku→held_gp + yleistauko), `scenes_2.js` (25–39), `scenes_3.js` (40–60), `scenes_4.js` (61–65); 66 riviä, sisältö sama; `main.js` kokoaa. `scenes.js` poistettu. |
| 6 | Jähmettymä 7,8 s | Selkäkuva on jo nousemassa harjanteen takaa musiikin alkaessa (nousu T0−2,5…T0+3,5 s, −2,4:stä), avausoton kamera lähempänä ja keihäs 3,2 yksikköä, jotta kärki pysyy kuvassa. |
| 7 | Opastarkistus | `window.opasProbe(t)` (nuket, ritari, muste, valo, otto, kamera + paikan `probe`), `roolit.json`, `vastaukset.json` (33 ankkuria held_alku…held_gp), `render/opascheck.mjs`, `analysis/opastarkistus.py`. |

## 2. Mittaukset

| Tarkistus | Tulos |
|---|---|
| `kohtauscheck --step 15` (koko A-puoli, ennen avauskameran muutosta) | 2480 ruutua: kerrosreunan ylityksiä 0; tyhjää taustaa 46 ruudussa, kaikki paperikehyksessä (0–7,5 s), taistelun sukelluksessa ja levyllä (tarkoituksellisia, kuten aiemmin) |
| `kohtauscheck --step 15 --from 0 --to 60` (avauskameran muutoksen jälkeen) | kerrosreunan ylityksiä 0; tyhjää vain paperikehyksessä 0–7,5 s |
| `camcheck --max 20` | 72 ottoa, 0 ylitystä |
| `videotarkistus.py` renderistä 0–240 s: ääni | suurin ero 0,00 ms, ajautuminen 0 ppm, lähde kuuntelukopio |
| teemakartan iskut (8, pakolliset) | 7/8 OK; `held_reh9` +2 ruutua (sama kuin aiemmissa rendereissä: viirien portaat alkavat 154,70) |
| aksentit z ≥ 9 (tiedoksi) | 1 kpl (181,51), ruutuero 0; B-puolen paketit eivät enää näy A-videossa |
| jähmettymät ennen yleistaukoa | **7,8 s poistunut.** Jäljellä 3: 102,77 (niitty, oton 14 alku), 171,03 (myrsky, oton 19 alku) ja 180,37 (putous, oton 20 alku). Nämä paljastuivat vasta nyt: aiemmin post-shaderin RGB-siirto (uMis) muuttui joka ruudussa ja peitti pysähdykset. Otot kuuluvat osalle 1 (kamera lähtee liian hitaasti). |
| `opastarkistus.py` 0–240 s | kärjen korkeus vs. teemaviiva avauksessa 7,6–31,4 s: **Spearman 0,972** (vaadittu > 0,8). Ankkureista 29/33 OK; 4 virhettä: `held_huippu1` ja `held_t47` (meri: ei vielä mittaria, osa 1), `held_reh9` (sama +2 ruudun asia), `held_alku` OK vasta mittarilla `nuket.y` (selkäkuva nousee); muste alkaa, kun `heroGate` avautuu, ei aivan T0:ssa. Soitinroolit: käyrätorvet ↔ muste Spearman 0,37, mutta 56 % voimakkaista torvi-ikkunoista ilman mustetta: meri ja niitty eivät vielä piirrä mustetta (osa 1 kytkee `tipTrail`in). Viulut ↔ tuuli ja patarummut ↔ pöllähdys: mittari kattaa vain laakson/myrskyn, ei vertailukelpoinen vielä. |
| `render.mjs --start 0 --end 240 --workers 2` | valmis, 3,6 min, ääni kuuntelukopiosta |

## 3. Stillit (katsottu)

- `t009.0`: selkäkuva näkyy harjanteen takaa, keihäs lähes vaakatasossa (Es2), viiri kärjessä; mustetta ei vielä (torven portti aukeaa 8–9 s).
- `t015.0`: veto lähtee keihään kärjestä, kaartuu ylös ja vasemmalle tuulessa; vanha pää ohuempana ja rasteroituneena.
- `t022.0`: veto nousee ja laskee sävelen mukana; toverien viirinkärjet harjanteen takana (sointuiskut).
- `t030.0`: veto pitkänä kaarena, vanhin osa kuivunut rasteriviivoiksi; ritari pienenä, kamera noussut.
- `t145.0`, `t150.0`: kahdeksan ritaria keihäineen rivissä, kahdeksan vetoa piirtyy yhdessä leveäksi nauhaksi (muoto teemaviivasta, TULKINTA).
- `t430.0`, `t450.0`: kumppanin valkoinen veto taivaalla kuvan oikeassa yläosassa, suunta viuluviivasta; pieni mutta näkyvä.
- `asennot_u05.png`: 11 asentoa kahdella rivillä, nimet alla.

## 4. Tuoreen tarkistajan havainnot (sonnet, ei tehnyt koodia)

Tarkistaja katsoi stillit t009–t450 ja asentotaulun (ennen kohdan 2 viimeistä korjauskierrosta; korjatut kohdat merkitty).

| Kohta | Havainto | Tila |
|---|---|---|
| B2 teema näkyy | 22 s: kärki matalammalla kuin 15 s, sopii sävelen laskuun; 30 s: "veto laskee, vaikka sävel nousee" | Syy oli tuulen pystysuuntainen ajelehdinta (vanha pää nousi). Korjattu: pystyajelehdinta 15 %:iin; uusi `t030.0.png` näyttää vedon nousevan kärkeä kohti. Mittaus: Spearman 0,972. |
| B4 muste syntyy ja häipyy | 22 s ja 150 s todennettu: tuore pää paksu, vanha pää rispaantuu | ✅ |
| B5 kahdeksan torvea | 150 s todennettu: kahdeksan ritaria, kahdeksan vetoa yhtenäisenä nauhana; 145 s vain seitsemän kuvassa (oton rajaus), vedot risteävät | 145 s rajaus osalle 1 |
| C1 ei pomppuja | todennettu kaikissa stilleissä | ✅ (liike todennetaan renderistä) |
| C8 ei tervehdyksiä | ei suoria viistoja käsivarsia; keihäät pystyssä, kädet taitettuina; asentotaulussa ei tervehdystä | ✅ |
| D5 ei syaania | ei syaania eikä magentaa missään stillissä | ✅ |
| 15 s harmaa läikkä vasemmassa yläkulmassa | näytöksen otsikko "I Der Held" häipymässä (otsikko näkyy T0+2…T0+8 s, reuna kohisee). Ei vika, mutta still osuu häipymään. | tiedoksi osalle 1 (otsikon häipymä) |
| 430/450 s valkoinen viiva pieni; 450 s "suorakulmainen kehys" | viiva on viuluviivan suunta: pitkä sama sävel = vaakaviiva, hyppy = pystyviiva; vanha osa on kuivunut ohueksi. Leveyttä kasvatettu (0,34), haalea muste ohuempana. | osa 3 säätää koon ja mielialat |
| Asentotaulu | ylärivi (u = 0,5) on siirtymän keskikohta: kääntyminen selkään näkyy syrjittäin (tarkoitus), kämmenen ojennus puolivälissä; alarivillä (u = 1) selkäkuva ja ojennus luettavissa. Soutu ilman airoja lukee istumisena. | airot ja vene osalle 3; muut 9 asentoa luettavissa |
| Vedot näyttävät viirin jatkeelta (9–22 s) | veto lähtee kärjestä viirin vierestä | tyylikysymys ohjaajalle |

## 5. Avoimet asiat osille

- Osa 1: otot 14, 19 ja 20 lähtevät pysähdyksestä (jähmettymät 102,77 / 171,03 / 180,37 s); `held_reh9` +2 ruutua; meri (6–12) ja niitty (13–16) eivät piirrä mustetta: kytke `tipTrail` (`L.tipAt`) ja lisää `probe(t)` (tiirat, laivasto, välkerenkaat); otto 19 "laaja" näyttää huipun mustana kiilana kuvan keskellä (`frames/t171.png`).
- Osat 2–4: kohtaukset 33 ja 56 menettivät friisin; muste `tipTrail`illä. `vastaukset.json` ja `probe(t)` omille ankkureille.
- Kaikki: `videotarkistus.py` ei enää peitä jähmettymiä; aja se jokaiselle osarenderille.

## 6. Ohjaajan hyväksyntä 31.10.2026

Stillit t015, t030, t150 ja asentotaulu katsottu. Hyväksytty perustaksi: veto lähtee kärjestä ja
elää (tuore pää leveä, vanha rispaantuu rasteriksi), Spearman 0,972 teemaviivaan, asennot
luettavissa, ei tervehdyksiä, ei syaania. Osalle 1 lisäksi: t150:ssä kärjistä nauhaan kulkevat ohuet
"langat" (nopean kärjen häntä) näyttävät rautalangalta ja vedot risteävät; kunkin ritarin veto
alkakoon omasta kärjestään ilman hiusviivaa. Vedon lukeminen viirin jatkeena on tarkoitus
(käyttäjän ajatus: muste muuttuu viiriksi).
