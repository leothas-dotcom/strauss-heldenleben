# Kokonaissuunnitelma

Miten äänitteestä päädytään videoon. Lähtökohta on inspiraatiovideon menetelmä
(Devarf: *I Had Opus 5.5 Make the Same Music Video at Every Effort*), sovitettuna
Straussiin ja tähän koneeseen.

Tarkemmat suunnitelmat:
- [analyysisuunnitelma.md](analyysisuunnitelma.md): kuuntelutyökalun mallit ja tulosteet
- [visuaalinen_tyyli.md](visuaalinen_tyyli.md): miltä video näyttää
- [kuunteluopas](../annotations/kuunteluopas.md): mitä musiikissa tapahtuu (sanoitusten tilalla)

---

## 1. Mitä inspiraatiovideosta opittiin

1. **Malli ei kuule musiikkia, joten sille rakennetaan korvat.** Paikallinen
   analyysityökalu muuttaa äänen dataksi ja tekstiksi, jota malli voi lukea. Video voi
   olla vain niin hyvä kuin tämä analyysipaketti.
2. **Paketissa on kuusi osaa:**
   - iskut
   - nuotit
   - soittimet
   - kovat ja hiljaiset kohdat
   - sanoitukset
   - selkokielinen kuvaus kappaleen merkityksestä ja tarinasta
3. **Työkalu mitoitetaan omalle koneelle.** Tekijän työkalu käytti noin 5 Gt muistia
   6 Gt:n näytönohjaimella, ja hän kehotti rakentamaan omaan koneeseen sopivan, paremman
   version. Raskas työ tehdään näytönohjaimella.
4. **Analyysi on oma vaiheensa ennen videota.** Analyysi tehdään kerran ja tallennetaan
   tiedostoiksi. Videovaihe lukee vain paketin.
5. **Jokaisella ajolla on oma kansionsa**, jossa ovat tiedot ja työkalut.
6. **Työkalupakki on valmiina:** Three.js 3D:lle, Canvas 2D piirtämiseen, SVG ja ruutujen
   muuntaminen videoksi.
7. **Pyyntö ei määrännyt ulkoasua, ja tulos oli silti hyvä.** Tekijän loppuhuomio oli,
   että kannattaa kuvitella, mitä saisi, jos kertoisi tarkalleen miltä videon pitää
   näyttää. Meillä se on tyylidokumentti.
8. **Aloitettiin pätkällä** (79 s), ja video käytti alkuperäistä ääntä tahdissa.

## 2. Mitä teemme toisin Straussin kanssa

| Räppikappale | Heldenleben |
|---|---|
| Tasainen syke, joten iskut ohjaavat kuvaa | Rubato ja fermaatit: iskut ohjaavat kuvaa vain paikallisesti, eikä tahtinumeroita lasketa äänestä (ruudukko ajautuu). Taitekohdat tulevat jaksorajoista. |
| Sanoitukset | **Kuunteluopas**: Straussin ohjelma, teemat ja tapahtumat aikakoodattuina tähän äänitteeseen |
| Soittimet erottuvat toisistaan | Orkesteri sulautuu, joten tekoälytunnistus yhdistetään lähteiden tapahtumajärjestykseen (teemakartta) ja tarkistetaan korvalla |
| Nuotit = melodia | Johtoaiheet: tapahtumat lähteistä ja ajat analyysista; melodia ja basso analyysista (A 0–400 s). Partituuri on vain tarkistusta varten. |
| 79 s, yksi tiedosto | 42 min kahdella LP-puolella, rahina ja loppuurat mukana |

## 3. Kokonaisuus

```
 ÄÄNI: LP, kaksi puolta                    LÄHTEET JA TUTKIMUS
        │                                          │
 1 Esikäsittely        prepare.py ✓        4 Kuunteluopas (sanoitusten tilalla)
   ääniraita, puhdistus, kohinataso          annotations/kuunteluopas.md ✓ v3
        │                                          │
 2 Kuuntelu, GPU       listen.py           5 Merkinnät
   stemmit, soittimet, iskut, nuotit         teemat.json → cues.json
        │                                          │
 3 Signaalianalyysi    analyze.py ✓               │
   dynamiikka, harmonia, patina                    │
        └────────────────┬─────────────────────────┘
                         ▼
              6 ANALYYSIPAKETTI (mallin korvat)
                         │
              7 AJO: brief + tyyli + paketti
                kohtaus (visual/) → renderöinti (render/)
                         │
              8 ARVIOINTI: still-kuvat, kontaktiarkki,
                selkeystesti, sinun arviosi
```

| Vaihe | Tila (29.10.2026) |
|---|---|
| 1 Esikäsittely | ✓ toimii, ja viive korjataan jo tässä vaiheessa |
| 2 Kuuntelu (GPU) | ✓ toimii ja on validoitu 400 sekunnilla (sankarijaksossa 118 tahtia, Porter 116). Koko levy on ajettu 420 s:n osina (soittimet ja iskut; stemmit ja sävelkorkeus vain A 0–400 s). Tulkinta (`interpret.py`) ja jaksot (`segments.py`) kaikille osille, koko levyn aikajana `aikajana.py`. **CLAP ei toimi.** |
| 3 Signaalianalyysi | ✓ toimii |
| 4 Kuunteluopas | ✓ versio 3: koko teos minuutti minuutilta, aikakoodatut osat generoitu teemakartasta (`kuunteluopas.py`). Tarkistus korvalla on kesken. |
| 5 Merkinnät | ✓ teemakartta `annotations/teemat.json` (lähteiden järjestys + aikajanan ajat, varmuus ja peruste) → `make_cues.py` → `cues.json`. Melodiakaarten luettelo (`themes.json`) jätettiin pois: melodioita ei lueta partituurista. |
| 6 Paketti | ✓ demominuutille. `check_package.py` tarkistaa JSONit ja binääridatan. |
| 7 Ajo | ◐ `runs/torviritari-400` (A 0:00–6:40, Disney-henkinen paperipiirretty) työn alla; edeltäjä `sankarin-paiva-400` jäi kesken. Hylätyt: `video-400`, `video-400b` (friisi, staattinen) ja `drehbuehne-400` (sama tanssi koko ajan, pyörivä kamera). |
| 8 Arviointi | still-kuvat ja kontaktiarkki toimivat |

## 4. Analyysipaketti: litteraatin kuusi osaa

| Litteraatissa | Meillä | Tiedosto | Työkalu | Laite |
|---|---|---|---|---|
| iskut | iskut, tahdin alut, tahtinumerot, paikallinen tempo | `beats.json` | beat_this | GPU |
| nuotit | melodia ja basso nuotteina, harmonia, harmoninen jännite | `notes.csv`, `listen.f32`, `analysis.f32` | torchcrepe Demucs-stemmeistä, chroma | GPU + CPU |
| soittimet | soitinten todennäköisyys ruuduittain, stemmien energiaosuudet | `listen.f32` | PANNs (AudioSet), Demucs; CLAP (orkesterisoittimet tekstikuvauksin) ei vielä toimi | GPU |
| kovat ja hiljaiset kohdat | voimakkuus kohinaan suhteutettuna, attakit, rekisteri | `analysis.f32` | librosa | CPU |
| sanoitukset | **kuunteluopas** | `annotations/kuunteluopas.md` | tutkimus, merkinnät ja analyysi; sinä tarkistat | – |
| merkitys ja tarina | tarina lyhyesti ja tunnekaari (kuunteluoppaan alku) | sama | – | – |
| *(lisä)* levyn patina | naksahdukset, sihinä | `patina.json` | ffmpeg + numpy | CPU |
| *(lisä)* ohje mallille | mitä kukin kanava tarkoittaa ja kuinka luotettava se on | `LUE_MINUT.md` | generoidaan | – |

Videovaihe lukee vain tämän paketin, kuunteluoppaan, merkinnät ja tyylidokumentin.

## 5. Näytönohjaimen käyttö

Työkalu on mitoitettu tähän koneeseen (RTX 4070 SUPER 12 Gt, 31 Gt RAM). Inspiraation
6 Gt:n työkaluun verrattuna "parempi versio" tarkoittaa:
- **Stemmeihin erottelu** (Demucs) ja jokaisen stemmin analyysi erikseen.
- **Soittimet ruuduittain** (PANNs) eikä vain koko kappaleelle.
- **Orkesterisoittimet, joita AudioSetissä ei ole** (oboe, englannintorvi, fagotti,
  tuuba), tunnistetaan tekstikuvauksilla (CLAP).
- **Neuroverkkopohjainen iskujen ja tahtien tunnistus** (beat_this).
- **Sävelkorkeus stemmeistä** (torchcrepe), ei sekamiksauksesta.

Mallit ajetaan peräkkäin, ja muisti vapautetaan välissä. Jokaisen vaiheen
näytönmuistin huippu kirjataan pakettiin, ja sen näkee ajon aikana myös
`nvidia-smi`:llä. Tarkat mallit ja muistiarviot ovat
[analyysisuunnitelmassa](analyysisuunnitelma.md).

## 6. Kuunteluopas

Kuunteluopas on projektin sanoitukset: teksti, jonka malli lukee ennen kuin se kirjoittaa
yhtään kohtausta. Siinä on kolme osaa:
1. **Tarina lyhyesti**, eli mistä teos kertoo (litteraatin "plain note").
2. **Tunnekaari** koko teoksen läpi.
3. **Aikakoodatut kohdat** juuri tässä äänitteessä: mitä kuuluu, kuka soittaa, mitä se
   merkitsee, ja kuinka varma aika on (arvio / analyysi / sinun vahvistamasi).

Kuunteluopas kertoo totuuden siitä, mitä tapahtuu. `cues.json` on sen koneluettava
vastine. Molemmat generoidaan teemakartasta `annotations/teemat.json`, joten niissä ei voi
olla ristiriitaa:
- **Järjestys** tulee lähteistä (Porter, Wikipedia, Kennedy).
- **Ajat** tulevat koko levyn aikajanasta (jaksorajat ±0,5 s, soitin sisään/ulos).
- Jokaisella kohdalla on varmuus (vahvistettu / analyysi / lähde+analyysi / arvio) ja
  peruste.
- Sinun korvalla tekemäsi korjaukset menevät teemakarttaan, ja vahvistetut kohdat
  lukitaan.

## 7. Ajot

Jokainen ajo on oma kansionsa `runs/<nimi>/`:

```
runs/demo-01/
├── brief.md      pyyntö: mikä kohta, kesto, tavoite, mitä arvioidaan
├── run.json      LP-puoli, alku, kesto, analyysipaketin polku
└── renders/      video, still-kuvat, kontaktiarkit
```

Työkalut (visual/, render/, analysis/) ovat yhteisiä, ja ajon tiedot ovat omassa
kansiossaan. Näin versiot pysyvät vertailukelpoisina. Ensimmäinen ajo on `demo-01`:
A-puolen ensimmäinen minuutti.

## 8. Riippuvuudet

**Periaate:** jokainen riippuvuus on kirjattu manifestiin ja lukittu, ja asennus tehdään
vain `setup.ps1`:n kautta. Ei käsin asennettuja paketteja eikä kiertoteitä (kuten
`--no-deps`).

| Mitä | Manifesti | Lukitus | Asennus |
|---|---|---|---|
| Python-paketit | `pyproject.toml` (PyTorchin CUDA-indeksi määritelty manifestissa) | `uv.lock` | `uv sync --locked` |
| Node-paketit | `package.json` | `package-lock.json` | `npm ci` |
| Järjestelmätyökalut | winget-tunnisteet `setup.ps1`:ssä | versiotarkistus | winget |
| Mallipainot | `analysis/models.json`: lähde, revisio, tiedostot, SHA-256, lisenssi | tarkistussummat | latausskripti kansioon `models/` |

**Säännöt:**
- **Kiertoteitä ei käytetä.** Paketteja, joiden riippuvuustiedot ovat rikki tässä
  ympäristössä, ei käytetä. Esimerkiksi basic-pitch vaatii Python 3.12:lla
  TensorFlow-version, jota ei ole olemassa, joten se jätettiin pois.
- **Uusi riippuvuus kulkee aina saman reitin:** ensin manifestiin, sitten lukitus, setup
  ja tarkistus. Perustelu kirjataan manifestin kommenttiin.
- **Kirjastot eivät saa ladata mitään omin päin.** Esimerkiksi PANNs yrittää ladata
  tiedostoja wgetillä jo importissa. Painot ladataan etukäteen manifestin mukaan ja
  tarkistussummat varmistetaan.
- **`setup.ps1 -CheckOnly`** varmistaa, että asennettu ympäristö vastaa lukitusta.

**Nykytila (29.10.2026):** kaikki on käytössä.
- **Python:** `uv.lock` sisältää 80 pakettia. `.venv` on täsmälleen lukituksen mukainen,
  ja aiemman kiertotien jäänteet poistuivat.
- **Node:** `npm ci`, 0 haavoittuvuutta.
- **Mallipainot:** 16 tiedostoa, SHA-256 kirjattu ja tarkistettu.
- **Esimerkki muutoksesta oikeaa reittiä:** CLAP-vian selvittelyssä transformers
  rajattiin ensin manifestissa 4.x-sarjaan ja palautettiin, kun vika osoittautui olevan
  painoissa, ei kirjastossa.
- **Demucs lataa painonsa picklenä** (`torch.load(weights_only=False)`). Se hyväksytään
  vain siksi, että tiedostot tulevat virallisesta lähteestä ja niiden SHA-256 on
  tarkistettu.

## 9. Laadunvarmistus

**Analyysi kelpaa, kun:**
1. ✓ Dominanttiseptimi ja tauko löytyvät A-puolelta noin kohdasta 4:00 (sointu kromassa,
   katko ja yleistauko).
2. ✓ Tahdin alkuja on sankarijaksossa suunnilleen yhtä monta kuin partituurissa. Porterin
   mukaan teema jatkuu 116 tahtia. Pidemmällä matkalla ruudukko ajautuu, joten tahteja ei
   lasketa koko teokselle.
3. ✓ Sooloviulu erottuu noin A 7:00 alkaen, eli kumppanin jaksossa.
4. ✓ Lyömäsoittimet erottuvat taistelussa (A-puolen lopusta B-puolelle).
4b. ✓ Jaksorajat osuvat korvalla vahvistettuihin kohtiin (teemakartta).
5. Sankariteeman alku nousee noin 3½ oktaavia yhdeksässä tahdissa.
6. Näytönmuistin käyttö on kirjattu jokaiselle mallille.
7. Kuunteluopas on luettu yhdessä, ja tarkistettavat kohdat on merkitty.

**Kuva:** still-kuvat ja kontaktiarkki jokaisen kierroksen jälkeen; kolme pahinta
ongelmaa korjataan kerrallaan. Lopuksi selkeystesti (tyylidokumentti, luku 16).

## 10. Työjärjestys

1. ✓ **Riippuvuudet:** `pyproject.toml` + `uv.lock`, `npm ci` ja mallimanifesti.
2. ✓ **Kuuntelutyökalu** (`listen.py`) demominuutille, tarkistuskuvat, JSON-ulostulo
   (`make_cues.py` → `annotations/cues.json`), tulkinta (`interpret.py`) ja tarkistus
   (`check_package.py`). Validoitu 400 sekunnilla (luku 9, kohdat 1, 2 ja 6). Kesken: CLAP.
3. ✓ **Kuunteluopas** versio 3 koko teokselle (teemakartta, aikajana). ◐ Sinun
   tarkistuksesi korvalla: tarkistuslista on oppaan lopussa.
4. ◐ **Musiikkivideo** A 0:00–6:40: `runs/torviritari-400`. Kuvakäsikirjoitus, still-kuvat ja
   kameratarkistus tehty; iskujen tulkinta uusitaan (isku on elementin teko, liike ei pysähdy),
   sitten renderöinti. Hylätyt: `video-400` ja `video-400b` (friisi, staattinen) sekä
   `drehbuehne-400` (sama tanssi koko ajan, pyörivä kamera).
5. ◐ **Koko teoksen** analyysi: soittimet, iskut, tapahtumat, jaksot ja teemakartta ovat
   valmiit; stemmit ja sävelkorkeus muille kuin A 0–400 s ajetaan, kun muistia on vapaana.
6. **Tuotanto** jakso kerrallaan.
