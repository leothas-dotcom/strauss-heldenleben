# Tarkistus: purje-400 – "Punainen purje"

Ajat ovat A-puolen aikaa (totuus: `build/kuuntelu/A_puoli_kuuntelu.wav`). Raportissa on vain se,
minkä mittaus tai kuva osoittaa.

## 1. Mittaukset (valmis video `renders/heldenleben_purje_400s.mp4`)

| Tarkistus | Tulos | Tiedosto |
|---|---|---|
| `analysis/videotarkistus.py`: ääni totuutta vasten | suurin ero 0,00 ms, ajautuminen 0 ppm | `videotarkistus.txt` |
| `videotarkistus.py`: 9 teemakartan iskua | kaikki 9 osuvat oikeaan ruutuun (ensimmäinen, joka alkaa aikaisintaan 33 ms ennen ääntä) | `videotarkistus.txt` |
| `videotarkistus.py`: jähmettymät ennen yleistaukoa | 0 | `videotarkistus.txt` |
| `render/camcheck.mjs --max 20` | 36 ottoa, ei ylityksiä; suurin kääntö 12,9 °/s (levyn sukellus), muuten alle 4 °/s | `camcheck.txt` |
| `render/kohtauscheck.mjs --step 10` (uusi) | 1200 ruutua: tyhjää taustaa 0, kerrosreunan ylityksiä 0 (5795 kerrosvertailua) | `kohtauscheck.txt` |
| WhatsApp-versio | 1280×720, h264 + aac, 400,0 s, 137 Mt (raja 170 Mt) | `renders/heldenleben_purje_400s_whatsapp.mp4` |

Iskut ruudulla (suurin kuvamuutos ja muutos ympärillä):

| Isku | Ääni | Iskuruutu | Muutos | Ympärillä |
|---|---|---|---|---|
| `held_isku_t6` | 17.64 | 17.633 | 2,6 | 0,7 |
| `held_isku_t8` | 21.62 | 21.600 | 2,2 | 0,4 |
| `held_isku_t11` | 27.50 | 27.467 | 3,7 | 1,5 |
| `held_reh9` | 154.66 | 154.633 | 1,9 | 1,7 |
| `held_isku1`–`4` | 213.40 / 217.26 / 220.95 / 224.64 | 213.367 / 217.233 / 220.933 / 224.633 | 2,2 / 3,9 / 5,7 / 7,2 | 0,3–0,5 |
| `wid_reh20_lautaset` | 384.60 | 384.567 | 1,3 | 0,3 |

Kohtaloiskujen muutos kasvaa iskusta toiseen kuvakäsikirjoituksen mukaisesti: maininki lyö luotoa
vasten yhä korkeammalle.

**Uusi työkalu `render/kohtauscheck.mjs`** (palaute 30.10.2026, kohta 5) tarkistaa kaksi asiaa:
1. **Tyhjä tausta:** kohtaus piirtää jokaisen näkymän magentaa taustaa vasten (`window.leakProbe`), ja
   jokainen magenta pikseli on kohta, jota mikään kerros ei peitä.
2. **Kerrosten alueet:** jokaiselle reunalliselle kerrokselle (`userData.edge`) lasketaan kameran
   näkymä kerroksen syvyydellä ja verrataan kerroksen x-alueeseen ja alareunaan.

**Rajoitus:** Taivastaso peittää aina koko taustan, joten magenta paljastaa vain aukot taivaan
läpi. Kerrokset, jotka päättyvät tarkoituksella (niemi, kari, rannat), eivät ole kerrosvertailussa.
Niiden päät tarkistettiin stilleistä, ja ne laskeutuvat veden alle. Kaislalahden rantojen pystyreunat
löytyivät näin ja korjattiin.

## 2. Tarkistus tuorein silmin: neljä agenttia

Käyttäjän pyynnöstä työtä tarkisti neljä erillistä agenttia, joista mikään ei tehnyt kohtausta:
elokuvakriitikko (kaksi kierrosta), peittotarkistaja (kaksi kierrosta), kamera-agentti ja
yleisten mokien tarkistaja. Tärkeimmät havainnot ja mitä niille tehtiin:

| Havainto | Agentti | Korjaus |
|---|---|---|
| Laivasto näkyi liian aikaisin, ja sen kokoontuminen ei yllättänyt | kriitikko | Iskuissa näkyvät vain purjeiden kärjet. Rivi tulee esiin `held_intro_loppuu`:ssa, avomerellä laivasto liittyy `held_t34`:ssä, ja koko laivasto nähdään `held_reh8`:ssa. |
| Auringonnousu oli pieni kiekko rinteen vieressä | kriitikko | Niemen huippu on aamun korkein paikka, ja aurinko nousee sen takaa. Sankarin laiva on etualalla. |
| Lähestyvät salamat toivat vastustajan ennen näytöstä II | kriitikko | Kohtaloiskut ovat nyt neljä yhä korkeammalle lyövää maininkia. Tablossa aurinko nousee sädekehänä majakan takaa. |
| Muisto oli staattinen ja epäselvä (sama virhe kuin torviritarissa kohdassa 320 s) | kriitikko | Muisto on aamun kuva ylösalaisin, ja jousten jokainen aalto (jaksoraja) lisää osan. |
| Arvostelijoiden lähikuvat pilkkoivat jakson | kriitikko | Yksi lavastus, johon olennot kerääntyvät. Lähikuvat saavat vain huilu, Dehring ja Quijote-peili. |
| Loppu kertoi voitosta, jota musiikissa ei vielä ole | kriitikko | Tuuli palaa, purje alkaa täyttyä ja "jatkuu" tulee nousevan purjeen päälle. |
| Pääpurje peitti laivaston purjeita, roiske peitti kapteenin huipulla, ja putouksen kallio oli laatikko | peittotarkistaja | Laivasto on sankarin purjeen molemmin puolin, ja syvyydet on porrastettu. Roiskeet ovat keulan edessä. Putouksella on loivat rinteet. |
| Kahden laivan duetossa toinen purje oli piilossa, ja peilissä oli vaalea suorakaide | peittotarkistaja | Laivat samalla syvyydellä yli laivan pituuden päässä toisistaan. Peilikuva on katkonaisia viivoja. |
| Sädekehän edessä oli pilvi, ja kaislat peittivät hahmoja | peittotarkistaja | Pilvet väistyvät tablossa, ja hahmojen edessä ei ole kaisloja. |
| Rajaukset: kapteeni kuvan reunalla, lähikuva ilman kapteenia, nousujen kamerakorkeudet | kamera | Uudet avaimet. Nousu 2 kuvataan korkeammalta kuin nousu 1 ja nousu 3 vielä korkeammalta. Nousu 4 on yksi jatkuva nosturiajo. |
| Harpun renkaat eivät näkyneet (ikä laskettiin mainingin vaiheesta) | mokat | Renkailla on oma kellonsa (`uClock`). |
| Viirin aalto ja tuulen viivat saattoivat kulkea vastatuuleen (vaihe = t · muuttuva nopeus) | mokat | vakiotaajuus ja kertymä (`W.windX`) |
| Kerrosten himmennys oli edellisen ruudun arvo (tila ruutujen välillä) | mokat | asetetaan ennen piirtoa |
| Laivaston rungot olivat samalla syvyydellä kuin vesi (z-fighting) | mokat | porrastetut syvyydet |
| Kovakoodattu leikkaus `tHeroes + 3.4`, ja vuoret nousivat kiinteällä rampilla | mokat | Yksi jatkuva otto, ja nousu tulee matalien jousten kertymästä. |

## 3. Kolmen pahimman korjaus ja kierrokset

Still-kierroksia oli kahdeksan (`stills/b`, `b2`, `c1`, `d1`, `e1`, `f1`–`f3`, `g1`–`g2`, `r2`–`r7`,
`kierros1`, `iskut`, `iskut2`). Kontaktiarkit ovat `stills/kontakti_*.png`, ja valmiin videon
arkit ovat `stills/kontakti_video_0.png` ja `_200.png` (5 s:n välein). Kierroksen 1 (80 stilliä)
pahimmat ongelmat olivat muisto, tyvenen purje ja tablo, ja ne korjattiin luvun 2 mukaisesti.

Valmiin videon mittaus löysi viisi iskua väärältä ruudulta:
- `held_reh9`: otto vaihtui iskussa, joten otot 17–18 yhdistettiin yhdeksi liikkeeksi.
- Kohtaloiskut: sade palasi ruudun ennen iskua, ja roiske kasvoi vasta iskun jälkeen. Nyt
  sisäänhengitys päättyy iskun ruudulla, ja roiske on heti täysi.
- Lautaset: roiske syntyy nyt iskuruudulla.

Kaikki korjattiin, ja video renderöitiin uudelleen.

## 4. Itsearvio ja jatkotyö

Toimii (stillien ja agenttien arvion perusteella):
- auringonnousu niemen huipun takaa sankarin laiva etualalla
- tiirat (mielikuvitus)
- yksi tuuli
- aaltovuoren nosturiajo
- tablon sädekehä majakan yllä
- tuubakotilot (Dehring)
- tyvenessä roikkuva ja tummuva purje

**Kriitikon loppuarvio valmiista videosta** (kontaktiarkit 5 s:n välein):
- **Toimii:**
  - neljä nousua kantavat näytöstä I
  - auringonnousu 32–37 s on kantava kuva
  - tiirat ovat videon kertovin kuva
  - aaltovuori on vahva fyysinen nousu
  - tuubakotilot ovat selvin arvostelija
  - purje tummuu oikeassa kohdassa
  - loppu on nousu eikä voitto
- **Kolme heikointa:**
  1. Muisto (322–367 s) näkyy pikkukuvissa yhä punaisena laatikkorivinä ja mustana kolmiona, eikä
     se kasva näkyvästi aalto aallolta.
  2. Tablo (237 s): sädekehä on pieni ja oikeassa reunassa osin purjeen takana, eikä kapteeni ole
     selkä kameraan ruudun keskiakselilla.
  3. Laivasto on rannikolla (142–177 s) ohut kaistale horisontissa ff-tutin aikana, ja
     `held_reh20`:n purjeet ovat pieniä laatikoita.

Lopputeksti ja "jatkuu" näkyvät kohdassa 398,6 s (tarkistettu täysikokoisesta ruudusta). Tekijärivi
on hieman paperilaattaa leveämpi.

Lisäksi heikkoja ja jatkotyöksi:
- **Laajat otot kaislalahdessa:** haikara, hyttynen ja varikset ovat pieniä. Kuoron kokonaiskuvassa ne
  ovat kaukana.
- **Quijote-peili** (`wid_7_8`) on hienovarainen: laiha heijastus ei erotu selvästi ilman ääntä.
- **Muistojakso** (62 s) on rakenteeltaan oikein, mutta sen kolme ottoa ovat lähellä toisiaan.
- **Avauksen sukellus levyyn** on kopioitu torviritarista. Peittotarkistaja huomasi, että paperin
  reuna näkyy hetken siirtymässä noin 7 s:n kohdalla.
- **Rannikko** (125–199 s) on yhä sävyltään yhtenäinen: kalliot ja laivastorivi toistuvat.

## 5. Toimitukset

- `storyboard.md`: kuvakäsikirjoitus ohjaajan tulkintoineen ja kohtausten mittoineen
- `brief.md`, `run.json`
- `renders/heldenleben_purje_400s.mp4`: 1920×1080, 30 fps, h264 crf 18 + aac 320k, 1,23 Gt
- `renders/heldenleben_purje_400s_whatsapp.mp4`: 720p, 137 Mt
- `renders/heldenleben_purje_400s_kontakti.jpg`
- `render.log`, `videotarkistus.txt`, `camcheck.txt`, `kohtauscheck.txt`
