# Heldenleben – musiikkivideo koodilla

Kokeiluprojekti, jossa Richard Straussin *Ein Heldenleben* (op. 40) saa musiikkivideon,
eräänlaisen fantasiadraaman. Äänenä on Clemens Kraussin ja Wienin filharmonikkojen
1950-luvun LP (London LL 659, Internet Archive) rahinoineen. Kuvat tuotetaan koodilla.
Ne seuraavat musiikin rakennetta (teemat, jaksot, soittimet) ja sen hetkellistä ilmaisua.
Koodin kirjoittaa Claude.

**9.11.2026: lähdeääni vaihdettiin nopeuskorjattuun siirtoon** (`audio/lp_krauss_k/`, k = 0,98598: levy soi
+24,4 c yli Deccan julkaisun; `docs/julkaisu2.md` 1.5, `runs/muste-1230/release2/referenssi_hr2015.md`).
Kaikki ajat ketjussa ovat nyt korjatun lähteen aikaa (t_uusi = t_vanha / k); tätä vanhemmat ajat
dokumenteissa ja julkaistussa v6:ssa ovat alkuperäisen siirron aikaa.

**Missä ollaan (7.11.2026):** A-puoli on valmis ja julkaistu YouTubessa:
[Punainen muste](runs/muste-1230/README.md) (A 0:00–20:40, v6, 2160p, https://youtu.be/EZ22YboLk7c)
kahdeksan kielen tekstityksin. Julkaisu ei saanut huomiota, ja tekstitykset paljastivat soitinhavaintojen
virheitä. Seuraava vaihe on [Julkaisu 2.0](docs/julkaisu2.md): soitinhavaintojen tarkistus
referenssiäänitteestä ja partituurista, tekstitykset kolmessa kerroksessa, prologi, Shorts-paketti ja
uusi lataus. B-puoli ja making-of tulevat sen jälkeen. Projekti on git-repo
(https://github.com/leothas-dotcom/strauss-heldenleben). Työjärjestys on
[kokonaissuunnitelmassa](docs/kokonaissuunnitelma.md) (luku 10). Aiempi demo: [Punainen purje](runs/purje-400/brief.md).

| Dokumentti | Sisältö |
|---|---|
| [docs/kokonaissuunnitelma.md](docs/kokonaissuunnitelma.md) | **kokonaisuus**: mitä inspiraatiovideosta opittiin, vaiheet, analyysipaketti, riippuvuudet, työjärjestys |
| [docs/julkaisu2.md](docs/julkaisu2.md) | **Julkaisu 2.0**: soitinhavaintojen tarkistus (referenssi + partituuri), tekstitykset 2.0, prologi, Shorts, uusi lataus |
| [docs/youtube.md](docs/youtube.md) | julkaisu v6 (1.11.2026): oikeudet, master, otsikko, kuvaus, thumbnail, making-ofin runko |
| [runs/muste-1230/](runs/muste-1230/README.md) | **julkaistu video** "Punainen muste" (A-puoli): tilanne, tekstitykset, YouTube-aineisto |
| [docs/analyysisuunnitelma.md](docs/analyysisuunnitelma.md) | kuuntelutyökalu: mallit, tulosteet, mitatut tulokset, rajoitukset |
| [annotations/kuunteluopas.md](annotations/kuunteluopas.md) | **kuunteluopas** (sanoitusten tilalla): tarina, henkilöt, ankkurit ja koko teos minuutti minuutilta (ajat generoitu teemakartasta) |
| [annotations/teemat.json](annotations/teemat.json) | **teemakartta**: jaksot ja tapahtumat tämän äänitteen ajassa, varmuus ja peruste; ainoa paikka, jossa aikoja korjataan |
| [annotations/cues.json](annotations/cues.json) | merkinnät koneluettavana: teemakartan jaksot ja tapahtumat sekä analyysin tapahtumat ja tahdit (A 0–400 s) |
| `build/koko/aikajana_A.md`, `_B.md` | koko levyn aikajana: jaksorajat, dynamiikka, soittimet, uudet soittimet, soolot, tunnelman muutokset (generoitu) |
| [docs/kuvakasikirjoitus.md](docs/kuvakasikirjoitus.md) | **koko teoksen kuvakäsikirjoitus** (luonnos): kokeilujen yhdistelmä, rekisterit maailma, vedos ja näyttämö |
| [docs/visuaalinen_tyyli.md](docs/visuaalinen_tyyli.md) | tyylikonsepti **"Elävä vedos"**: friisi, piste–viiva–taso, painovärit, selkeyden säännöt |
| [docs/paletti.svg](docs/paletti.svg) | paletti ja väripartituuri |
| [docs/heldenleben_tutkimus.md](docs/heldenleben_tutkimus.md) | teoksen tausta, jaksot, teemat ja lainaukset lähteineen |
| [docs/references/](docs/references/) | referenssikuvat (LP-kansi) |
| [runs/purje-400/](runs/purje-400/brief.md) | demovideo "Punainen purje": brief, kuvakäsikirjoitus, tarkistus |
| `runs/torviritari-400`, `sankarin-paiva-400`, `drehbuehne-400`, `video-400(b)` | aiemmat kokeilut |

## Pikaopas

```powershell
cd F:\code\heldenleben-video
.\setup.ps1              # asentaa lukitusten mukaan ja tarkistaa kaiken
.\setup.ps1 -CheckOnly   # pelkkä tarkistus: aja aina kun palaat projektiin

# Analyysi (esimerkkinä A-puolen ensimmäinen minuutti)
$py = '.venv\Scripts\python.exe'
& $py -I analysis\prepare.py --side 1 --start 0 --duration 60 --out build\demo
& $py -I analysis\analyze.py build\demo          # signaalianalyysi (CPU)
& $py -I analysis\listen.py build\demo           # kuuntelu (GPU)
& $py -I analysis\interpret.py build\demo        # tapahtumat lauseina -> events.json, yhteenveto.md
& $py -I analysis\segments.py build\demo         # jaksot ja niiden kuvaus -> segments.json, segments.md
& $py -I analysis\check_package.py build\demo    # tarkistaa paketin ja merkinnät

# Koko levy: osat build\demo400, A2, A3 (A-puoli) ja B1-B4 (B-puoli), kukin 420 s
$A = 'build\demo400','build\A2','build\A3'; $B = 'build\B1','build\B2','build\B3','build\B4'
& $py -I analysis\themes.py --A $A --B $B         # koko puolen kanavat -> build\koko\A.npz, B.npz
& $py -I analysis\aikajana.py --A $A --B $B       # jaksorajat ja kuvaukset -> build\koko\aikajana_A/B.md
# Teemakartta annotations\teemat.json muokataan aikajanan perusteella; sitten:
& $py -I analysis\make_cues.py build\demo400     # -> annotations\cues.json (vahvistettuja ei muuteta)
& $py -I analysis\kuunteluopas.py                 # -> kuunteluoppaan aikakoodatut osat
& $py -I analysis\score.py --pages 20-23          # partituurin sivut kuviksi tarkistusta varten
& $py -I analysis\aksentit.py build\demo400        # iskut 10 ms tarkkuudella -> aksentit.json, aksentit.md

# Kuva (demo: Punainen purje)
npm run preview                                  # esikatselu: http://127.0.0.1:5173/visual/purje/?data=build/demo400
node render\render.mjs --page visual/purje/index.html --data build\demo400 --stills 41,239.05 --debug 1 --dir runs\purje-400\stills
node render\camcheck.mjs --page visual/purje/index.html --data build\demo400 --max 20   # kameran kulmanopeus ja otot
node render\kohtauscheck.mjs --page visual/purje/index.html --data build\demo400 --step 10   # tyhjä tausta ja kerrosten reunat
node render\render.mjs --page visual/purje/index.html --data build\demo400 --out runs\purje-400\renders\heldenleben_purje_400s.mp4 --workers 2 --fade-out 3.5

# Valmiin videon tarkistus: ääni WAV-totuutta vasten, iskujen ruudut, jähmettymät
& $py -I analysis\videotarkistus.py runs\purje-400\renders\heldenleben_purje_400s.mp4
```

### Uusi video agentilla

Kokonaisen uuden videon voi antaa Claude Code -istunnolle tehtäväksi. Valmis prompti on tiedostossa
[docs/prompti_uusi_video.md](docs/prompti_uusi_video.md). Agentti lukee pysyvät säännöt
tiedostoista `CLAUDE.md` ja `docs/visuaalinen_tyyli.md`, joten prompti kertoo vain tavoitteen ja
rajauksen.

Ennen käynnistystä:
1. **Ota varmuuskopio.** Projekti ei ole git-repo. Aja `git init` ja tee ensimmäinen commit
   (`.gitignore` jättää isot datat pois), niin näet jälkikäteen agentin muutokset ja voit perua ne.
2. **Salli komennot**, ettei agentti pysähdy kysymään lupia. Valitse auto-tila tai salli etukäteen
   `node render\...`, `.venv\Scripts\python.exe -I analysis\...` ja `ffmpeg`.
3. **Sulje raskaat ohjelmat.** Renderöinti tarvitsee muistia: kun muut ohjelmat ovat auki, kolme
   työläistä on kaatanut x264:n.

Tulokset tulevat kansioon `runs/<nimi>-400/`:
- kuvakäsikirjoitus
- stillit ja kontaktiarkit
- `tarkistus.md`, jossa ovat mittaukset ja agentin itsearvio
- video ja WhatsApp-versio

Jos PowerShell estää skriptin ajamisen: `powershell -ExecutionPolicy Bypass -File .\setup.ps1`.

Setup näyttää lopuksi taulukon, jossa jokaisella rivillä on tila OK, PUUTTUU (virhekoodi
1), VAROITUS tai VALINNAINEN.

## Lähtökohta: malli ei kuule musiikkia

Inspiraatiovideon tärkein oppi on, että mallille rakennetaan korvat. Paikallinen,
koneeseen mitoitettu analyysityökalu muuttaa äänen paketiksi, jota malli lukee.
Paketissa on kuusi osaa:
- iskut
- nuotit
- soittimet
- kovat ja hiljaiset kohdat
- sanoitukset (meillä **kuunteluopas**)
- tarina

Tieto tulee kolmelta tasolta:

| Taso | Mitä | Miten | Luotettavuus |
|---|---|---|---|
| **A. Signaalianalyysi (CPU)** | voimakkuus, attakit, rekisteri, harmonia, jännite, patina | librosa | hyvä |
| **B. Kuuntelu (GPU)** | stemmit, soittimet, iskut ja tahdit, melodia ja basso | Demucs, PANNs, beat_this, torchcrepe | suuntaa antava, tarkistetaan |
| **C. Merkinnät** | jaksot, teemat ja tapahtumat tämän äänitteen ajassa | lähteiden järjestys (Porter, Wikipedia) + analyysin jaksorajat ja soitintapahtumat → teemat.json → kuunteluopas ja cues.json; sinä vahvistat korvalla | jaksorajat tarkkoja (±0,5 s); teeman nimi on tulkinta, ja sen varmuus on merkitty |

## Putki

```
audio/lp_krauss/side1.flac, side2.flac
   │
   ▼
1 ESIKÄSITTELY     prepare.py     ääniraita (rahina säilyy), puhdistetut kopiot,
   │                              viiveen korjaus, pintakohinan taso
   ▼
2 SIGNAALIANALYYSI analyze.py     analysis.json + .f32, patina.json        (CPU)
3 KUUNTELU         listen.py      listen.json + .f32, beats.json, notes.csv,
   │                              stems/, LUE_MINUT.md                     (GPU)
   ▼
4 TULKINTA         interpret.py   events.json, yhteenveto.md (soittimet sisään/ulos,
   │                              tempo, äkilliset muutokset, rakenteen muutokset)
   │               segments.py    segments.json, segments.md (taitekohdat; jakson
   │                              soittimet, dynamiikka, suunta, tempo, sävellaji)
   │               themes.py      koko puolen kanavat osista (build/koko/A.npz, B.npz)
   │               aikajana.py    koko levyn aikajana (build/koko/aikajana_A/B.md)
   ▼
  MERKINNÄT        annotations/teemat.json (teemakartta: lähteiden järjestys + aikajanan ajat)
   │                 → make_cues.py → annotations/cues.json
   │                 → kuunteluopas.py → annotations/kuunteluopas.md (aikakoodatut osat)
   ▼
5 TARKISTUS        check_package.py
   ▼
6 KOHTAUS          visual/purje/        seek(t): lukee koko paketin + cues.json + aksentit;
                                  three.js, 2D-paperimonitaso, rasterivarjostus ja painojälki
                                  (aiemmat: torviritari, sankarin-paiva, drehbuehne, friisi scene.js)
7 RENDERÖINTI      render/        Puppeteer-työläiset → ffmpeg (+ ääniraita), kontaktiarkki
8 AJO              runs/<nimi>/   brief.md, run.json, renders/, stills/
```

Kaikki ruutudata on 30 fps:llä, joten ruutu i vastaa aikaa i/30 s. Merkintöjen ajat ovat
aina LP-puolen omaa aikaa (side + t).

## Äänite: LP kahtena puolena

| | A-puoli | B-puoli |
|---|---|---|
| Tiedosto | `audio/lp_krauss/side1.flac` | `audio/lp_krauss/side2.flac` |
| Kesto | 21:37 | 39:35 |
| Musiikkia | 0:07.6 – 20:24 (katkeaa kesken taistelun) | 0:13.6 – 21:51.5 |
| Lopussa | n. 1 min loppuuraa | **n. 18 min loppuuraa** |

- **Muoto:** FLAC 96 kHz / 24 bit, stereodigitointi monolevystä. Pintakohina on A-puolella
  −46,8 dBFS.
- **A-puolen alku:** 0–3 s hiljaisuutta, noin 3 s kohdalla neula laskeutuu, sitten
  sisäänajoura. Musiikki alkaa 7,60 s, ja beat_this sijoittaa tahdin 1 kohtaan 7,62 s.
- **Ääniraita** säilyttää rahinan. Analyysi tehdään puhdistetusta monokopiosta.
- **Alkuperäinen zip** (`audio/lp_ein-heldenleben_…zip`, 909 Mt) on purettu, ja sen voi
  poistaa.

**Oikeudet:**
- **EU:** ennen vuotta 1963 julkaistut äänitteet ovat vapaita.
- **Yhdysvallat:** ennen vuotta 1972 tehdyt äänitteet ovat suojattuja (Music Modernization
  Act). YouTube voi rajoittaa videota siellä.
- **Kansi ja Porterin teksti** ovat erikseen suojattuja: niistä otetaan inspiraatiota ja
  tietoa, ei kopioita.

## Ympäristö ja riippuvuudet

Kaikki riippuvuudet ovat manifesteissa ja lukituksissa, ja asennus tehdään vain
`setup.ps1`:n kautta ([kokonaissuunnitelma](docs/kokonaissuunnitelma.md), luku 8).

| Mitä | Manifesti | Lukitus / tarkistus | Asennus |
|---|---|---|---|
| Python 3.12 -paketit (myös PyTorch 2.11 + CUDA 13) | `pyproject.toml` | `uv.lock` | `uv sync --locked` |
| Node-paketit (three, puppeteer) | `package.json` | `package-lock.json`, `npm audit` | `npm ci` |
| Mallipainot (16 tiedostoa, 1,45 Gt) | `analysis/models.json` | SHA-256 | `analysis/fetch_models.py` → `models/` |
| ffmpeg, Python, Node, uv, Audacity | winget-tunnisteet `setup.ps1`:ssä | versiotarkistus | winget |

**Laitteisto:**
- näytönohjain RTX 4070 SUPER 12 Gt (CUDA, WebGL ANGLE/D3D11, NVENC)
- prosessori Ryzen 7 9700X
- muisti 31 Gt
- 460 Gt vapaata levytilaa

## Hakemistorakenne

```
heldenleben-video/
├── README.md, CLAUDE.md
├── setup.ps1                 asennus + tarkistus
├── pyproject.toml, uv.lock   Python-riippuvuudet ja lukitus
├── package.json, package-lock.json
├── docs/                     suunnitelmat, tyyli, tutkimus, paletti, references/
├── audio/lp_krauss/          LP:n puolet (EI versionhallintaan)
├── annotations/              kuunteluopas.md, teemat.json (teemakartta), cues.json,
│                             mallit (cues.example.json; themes.example.json = melodiakaarten
│                             malli, ei käytössä)
├── analysis/                 prepare, analyze, listen (GPU), interpret, segments, themes,
│                             aikajana, make_cues, kuunteluopas, score (partituurin sivut),
│                             check_package, fetch_models + models.json
├── models/                   mallipainot (ladataan, EI versionhallintaan)
├── visual/purje/             demokohtaus: world, critters, signals, paper, puppets, hero, loc_*, ink, main
├── visual/torviritari/ ym.   aiemmat kohtaukset (myös sankarin-paiva, drehbuehne)
├── visual/                   vanha friisikohtaus (hylätty): scene.js, print.js, main.js
├── render/                   render.mjs, camcheck.mjs, kohtauscheck.mjs, serve.mjs (esikatselu), check-webgl.mjs
├── runs/                     ajot: brief.md, run.json, renders/ ja stills/ (ei versionhallintaan)
├── build/                    analyysipaketit, esim. build/demo/ (generoitu)
└── output/                   renderöinnit, still-kuvat, kontaktiarkit (generoitu)
```
