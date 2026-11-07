# Tarkistus: muste-1230 – "Punainen muste", A-puoli

## 0. Toinen renderi 31.10.2026 (käyttäjän palautteen jälkeen)

Käyttäjän palaute ensimmäisestä renderistä ja mitä sille tehtiin:

| Palaute | Korjaus |
|---|---|
| **Musiikki loppui 400 s:iin** (renderi käytti demo400-paketin ääntä). | `render/render.mjs` käyttää nyt oletuksena puolen kuuntelukopiota (`build/kuuntelu/A_puoli_kuuntelu.wav`, aikojen totuus) ja tulostaa äänen lähteen. `videotarkistus.py` vaatii, että ääni kattaa koko kuvan keston eikä ole mykkä siellä, missä totuus soi; vanha renderi antaa nyt VIRHE-rivin. Sääntö kirjattu muistiin. |
| Purjeen elementtejä ei käytetty. | Kohtaukset 6–12 ovat nyt purjeen avomerellä (`loc_sea_muste.js`): tiirat vaahdosta, laivaston kilpa, ensimmäinen huippu aallon harjalla. Joki ja kukkula poistuivat. |
| Muste oli staattinen viiva, joka värisi. | Friisi kirjoitettiin uusiksi: veto piirtyy painokohdassa musiikin tahdissa, uusin osa leveä ja täysvärinen, vanha kuivuu 3–6 s:ssa rasteriksi ja häviää 17 s:ssa. Näkyy vain, kun käyrätorvi tai sello soi, ja vain teemaviiva- ja vedoskohtauksissa. |
| Torven melodia ei näkynyt. | Avauksessa iso veto piirtyy etualalla nuotti nuotilta teemaviivasta 7,6 s:stä; selkäkuva seisoo vedon alla. Kohtaus 17: kahdeksan ritaria nostaa kellot ja iso veto piirtyy niiden yllä. |
| Outo kohta ennen auringonnousua. | Syy oli leikkaus laajaan kuvaan 31,4 s:ssa ja friisiviivan ilmestyminen kerralla. Nyt yksi jatkuva nosturiajo selkäkuvasta auringonnousuun, ja veto jatkuu piirtyen. |
| Salamat osuivat kenraalipausseihin. | Salama ja roiske tulevat katkon alussa (`S.drops`, pidetyn soinnun katkeaminen). Paussissa tuuli ja sade hiljenevät ja viirit painuvat; kohotahti-iskulla viirit napsahtavat ylös. |
| Keksityt viittaukset (liekki, narrinlakki, tuulimylly). | Ne olivat torviritarin joessa (`loc_dream.js`), joka ei ole enää käytössä. |
| Suon olennot väärissä mittakaavoissa. | Yhtenäinen mittakaava suhteessa ritariin (2,0): hyttynen 0,75, sorsa 0,9, haikara 2,2, kotilot 0,8, sammakot 0,5, varikset 0,7. Omat paikat ja syvyydet. Hyttysen siipi 3,5 Hz. |
| Taistelun iskut: ovatko oikeassa kohdassa? | `videotarkistus.py` tarkistaa nyt myös `aksentit.json`:n kovat iskut (z ≥ 9) kaikista paketeista, eli myös A2:n ja A3:n. Tulos alla, kun renderi valmistuu. |

Draftin tarkistukset ennen renderiä: `kohtauscheck --step 15` 0 kerrosylitystä (tyhjä tausta vain
paperikehyksessä ja levyllä), `camcheck --max 20` 72 ottoa, 0 ylitystä.

### Tulos (renderi valmis 31.10.2026 00:20)

| Tarkistus | Tulos |
|---|---|
| Äänen lähde (`render.log`) | `build/kuuntelu/A_puoli_kuuntelu.wav` (totuus) |
| Ääni totuutta vasten | suurin ero 0,00 ms, ajautuminen 0 ppm, koko 1240 s; "hiljaa" vain 557 s, 1109 s ja 1232 s (hiljaiset kohdat musiikissa, eivät mykkää raitaa) |
| Teemakartan `isku`-kohdat (13) | 12/13 OK; `held_reh9` +2 ruutua (viirien portaat alkavat 154,70, ääni 154,66) |
| `aksentit.json`-iskut z ≥ 9 (120) | useimmilla kuvassa ei ole suunniteltua tapahtumaa (muutos 0,1–0,9), joten "±1–4 ruutua" ei ole ajoitusvirhe vaan tarkistimen kohina. **Tarkistimen vika:** se vertaa myös B1–B2-pakettien iskuja A-puolen videoon (`aks_B1_*`, `aks_B2_*`); korjattava rajaamaan paketit puolen mukaan. |
| Jähmettymät ennen yleistaukoa | 1 kohdassa 7,8 s (yhä; ensimmäinen veto alkaa paikallaan) |
| WhatsApp-versio | 149 Mt (≤ 170 Mt) |

Tämä renderi todentaa äänen ja ajoituksen. Se **ei** ole lopullinen: sankarin toiminta näytöksissä 2–3,
viirin jättämä muste friisin sijaan, muisto ja syaani ovat tekemättä (`docs/palautelista.md`).

---

## Ensimmäinen renderi 30.10.2026 (hylätty: väärä ääni)

Ajat ovat A-puolen aikaa (totuus `build/kuuntelu/A_puoli_kuuntelu.wav`). Tämä on ensimmäinen koko
A-puolen renderöinti käyttäjän pyynnöstä ("tee renderi") ennen palautekierrosta. Raportissa on vain
se, minkä mittaus tai kuva osoittaa.

## 1. Mittaukset

| Tarkistus | Tulos |
|---|---|
| `videotarkistus.py`: ääni totuutta vasten | suurin ero 0,00 ms, ajautuminen 0 ppm |
| `videotarkistus.py`: 9 teemakartan iskua | 8/9 oikealla ruudulla; `held_reh9` suurin muutos ruudun aikaisin (154,600 vs. 154,633) |
| `videotarkistus.py`: jähmettymät ennen yleistaukoa | 1 kohdassa 7,8 s (ensimmäisen vedon alku) |
| `camcheck --max 20` (drafti) | 73 ottoa, ei ylityksiä, suurin kääntö 0,4 °/s |
| `kohtauscheck --step 15` (drafti, korjausten jälkeen) | 240–1130 s: 0 kerrosylitystä; tyhjää taustaa vain paperikehyksessä 0–7,5 s, taistelun lopussa ja levyllä (tarkoituksellista) |
| `jatkuvuus.py` | **ei ajettu tähän renderiin** |
| `videotarkistus.py`:n iskulista kattaa vain demo400:n (0–400 s) `isku`-luokan; A2 ja A3 eivät sisälly | |

## 2. Mitä tässä renderissä on

- Kuvakäsikirjoitus `storyboard.md` (hyväksytty 30.10.2026) kohtauksittain, 66 kohtausta.
- Sankariteema ensimmäisenä vetona teemaviivasta (`analysis/teemaviiva.py`, muoto partituurista,
  sävel äänestä).
- Kumppanin viiva seuraa sooloviulun **suuntaa** (`analysis/viuluviiva.py --mode suunta`: spektrin
  painopiste vocals-stemmistä). Käyttäjän rajaus: suunta riittää, aloituskorkeus on vapaa.
- Uudet paikat: kuutamojoki ja vene (loc_river), taistelukenttä (loc_battle), A-levy (record).
- Torviritarin paikat korjattuina: yksi tuuli, ei pomppuja, soitinolennot suolla.

## 3. Tiedossa olevat puutteet (seuraava kierros)

1. **Muisto lammessa (kohtaus 35)** näyttää yhä käännetyltä kolmiolta, koska harjanne piirrettiin
   kartiona. Pitää heijastaa aamun oikea harjanne. Lisäksi agentti ajoitti muiston kasvun
   kovakoodatuilla lisäyksillä (`tNight+8…+38`), mikä rikkoo sääntöä; korjataan mitattuihin
   aaltoihin.
2. **Jähmettymä 7,8 s:** ensimmäinen veto alkaa paikallaan; vedon pitää liikkua heti musiikin alusta.
3. **`held_reh9`** ruudun aikaisin: viirien portaiden ensimmäinen isku on `aksentit.json`:n 154,54;
   tarkistetaan, kumpaa kuva seuraa.
4. **Sankarin hajoaminen friisiksi (15–16)** on kevyt versio (rasteri haalistuu, toinen veto
   friisiin); `inkHero.morph` ei ole käytössä.
5. **Taistelun kontrasti (64a–64b):** luettavuus perustuu väriin; läiskät ja kiilat erottuvat
   heikosti ritarista.
6. **Kumppanin hahmo** on ohut ja lukeutuu parhaiten kohtauksissa 51–58; `knightBack` on jäykkä.
7. `jatkuvuus.py` ja peittotarkistus ajamatta tälle renderille.

## 4. Toimitukset

- `storyboard.md`, `tarkistus.md`, `render.log`, `videotarkistus.txt`
- `renders/heldenleben_muste_1240s.mp4` (1920×1080, 30 fps, 2,7 Gt), kontaktiarkki
- `renders/heldenleben_muste_1240s_whatsapp.mp4` (720p)
- `drafti/` (66 stilliä slateineen), `kontakti_drafti_a/b/c.png`, `tyylikuvat/`
