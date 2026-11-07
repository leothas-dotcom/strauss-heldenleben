# Analyysisuunnitelma: kuuntelutyökalu

Kuuntelutyökalu on mallin "korvat". Se tekee äänitteestä analyysipaketin
([kokonaissuunnitelma](kokonaissuunnitelma.md), luku 4). Raskas työ tehdään
näytönohjaimella, ja työkalu on mitoitettu tähän koneeseen.

**Tila 29.10.2026:**
- Kaikki vaiheet toimivat A-puolen ensimmäisillä 400 sekunnilla (`build/demo400`:
  sankarijakso ja vastustajien alku), ja tulos on validoitu lähteitä ja korvalla tehtyjä
  havaintoja vasten.
- Koko levy on analysoitu 420 s:n osina: `build/A2`, `A3`, `B1`–`B4`. Niistä on ajettu
  soittimet, iskut, tulkinta ja jaksot; stemmejä ja sävelkorkeutta ei, koska muisti ei
  riittänyt.
- Osat yhdistetään koko levyn aikajanaksi (vaiheet 4b ja 4c).
- CLAP on pois käytöstä (ks. Rajoitukset).

## Validointi (400 s)

| Tarkistus | Tulos |
|---|---|
| Sankarijakson tahtimäärä | **118 tahtia** puhtaassa tahtiruudukossa, Porterin mukaan 116 ✓ |
| Dominanttiseptimi ja tauko | Bb7-sointu kromassa A 3:49–3:58.5, katko A 3:59.0–3:59.2 (−16 dB sekunnissa), yleistauko 4:02.7 asti ✓ |
| Vastustajat = puupuhaltimet heti tauon jälkeen | **puupuhaltimet tulevat sisään A 4:02.7**, aktiivisuus ×300 ✓ |
| A 0:40: uusia soittimia, tempo vaihtuu hieman (sinun havaintosi) | vaskipuhaltimet sisään 0:38.9, viulut takaisin 0:48.0; tempo noin 122 → 117 BPM ✓ |
| Näytönohjaimen käyttö | jatkuva seuranta: kortin muisti 2,4 → 5,8 Gt (+3,4 Gt), käyttöaste keskimäärin 79 %, huippu 100 % |
| Tahdin alut vastustajien jaksossa | ✗ epäluotettavia (staccato); tempoa ei raportoida siellä |

## Laitteisto

| | Mitattu | Käyttö |
|---|---|---|
| Näytönohjain | NVIDIA RTX 4070 SUPER, 12 Gt, ajuri 621.01 | neuroverkkomallit (PyTorch 2.11 + CUDA 13), WebGL-renderöinti |
| Videoenkooderi | NVENC: H.264, HEVC, AV1 | nopeat luonnosrenderöinnit |
| Prosessori | AMD Ryzen 7 9700X, 8 ydintä / 16 säiettä | signaalianalyysi, renderöintityöläiset |
| Muisti | 31 Gt | äänet käsitellään paloina |
| Levy | 460 Gt vapaana | stemmit ja välitulokset kansioon `build/` |

## Komennot

```powershell
$py = '.venv\Scripts\python.exe'
& $py -I analysis\prepare.py --side 1 --start 0 --duration 60 --out build\demo
& $py -I analysis\analyze.py build\demo
& $py -I analysis\listen.py build\demo          # --steps stemmit,soittimet,iskut,savelet
& $py -I analysis\interpret.py build\demo       # -> events.json, yhteenveto.md
& $py -I analysis\segments.py build\demo        # -> segments.json, segments.md
& $py -I analysis\check_package.py build\demo

# Koko levy (osat ks. README): yhdistys, aikajana, teemakartta -> merkinnät ja kuunteluopas
& $py -I analysis\themes.py --A $A --B $B      # -> build\koko\A.npz, B.npz
& $py -I analysis\aikajana.py --A $A --B $B    # -> build\koko\aikajana_A/B.md
& $py -I analysis\make_cues.py build\demo400  # teemat.json -> annotations\cues.json
& $py -I analysis\kuunteluopas.py              # teemat.json -> kuunteluoppaan aikakoodatut osat
```

## Vaihe 1: esikäsittely (`prepare.py`)

- **Ääniraita:** 48 kHz stereo, rahina säilyy.
- **Monokopiot:** alkuperäinen, naksahduksista puhdistettu (`adeclick`) ja kokonaan
  puhdistettu (`adeclick` + `afftdn`), 22,05 kHz:llä ja lisäksi 44,1 kHz:llä
  näytönohjaimen malleille.
- **Viive:** kohinanpoisto viivästää 25 ms (551 / 1102 näytettä). Viive mitataan
  ristikorrelaatiolla ja korjataan heti, joten kaikki tiedostot ovat samassa ajassa.
- **Pintakohinan taso** mitataan loppuurasta: A-puoli −46,8 dBFS.

## Vaihe 2: signaalianalyysi (`analyze.py`, CPU)

40 kanavaa 30 fps:llä:
- voimakkuus suhteessa pintakohinaan ja attakit
- kirkkaus ja rekisteri
- kuusi rekisterikaistaa
- chroma ja tonnetz
- sävellaji ja harmoninen jännite
- rakenteen uutuuskäyrä

Lisäksi `patina.json`, jossa ovat naksahdukset ja sihinä. Musiikin alku tunnistetaan
(A-puoli 7,60 s), ja normalisointi lasketaan vain musiikin ajalta.

## Vaihe 3: kuuntelu näytönohjaimella (`listen.py`)

Mallit ajetaan peräkkäin, ja muisti vapautetaan välissä. Jokaisen vaiheen
näytönmuistin huippu ja kesto kirjataan `listen.json`iin ja `LUE_MINUT.md`:hen.

| Vaihe | Malli | Tuloste | Mitattu (60 s) |
|---|---|---|---|
| stemmit | Demucs `htdemucs_ft` | `stems/*.wav`, stemmien energiaosuudet (summa 1) | 4,8 s, 0,55 Gt |
| soittimet | PANNs CNN14 DecisionLevelMax (20 s palat) | 21 AudioSet-soitinluokkaa ruuduittain | 1,3 s, 0,64 Gt |
| iskut | beat_this `final0` + puhdas tahtiruudukko | iskut, tahdit (lähde: tunnistettu / isku / laskettu), tempo, isku- ja tahtivaihe | 0,4 s, 0,17 Gt |
| sävelet | torchcrepe `full` | melodia (muu- ja laulu-stemmi), basso, johtava linja, nuotit | 5,7 s, 2,67 Gt |
| clap | CLAP `laion/larger_clap_music` | *ei käytössä* | – |

Koko kuuntelu kesti 13 s, ja näytönmuistin huippu oli 2,7 Gt (koko kortilla enimmillään
5,7 Gt). 400 sekunnin pätkä vei 85 s: Demucs `shifts=2` 43 s ja CREPE 35 s.

**Tahdit:** beat_this vaihtaa välillä metristä tasoa koko jakson ajaksi, ja silloin
tahdin alku tulee joka puolikkaaseen tahtiin tai jopa joka iskuun. Siksi tahdit
rakennetaan puhtaaksi ruudukoksi:
1. Yleisin tahdinpituus haetaan oktaavista riippumatta ja sijoitetaan välille 1,5–3 s.
2. Seuraava tahti haetaan paikallisen tahdinpituuden päästä: ensisijaisesti
   tunnistettu tahdin alku, sitten lähin isku, viimeisenä laskettu kohta.
3. Jokaisen tahdin lähde kirjataan.

Raa'at tahdin alut säilyvät `beats.json`issa kentässä `downbeats_raaka`.

**Ensimmäisen minuutin tulokset:**
- **Tahdit:** 29 tahtia. Tahti 1 alkaa 7,62 s, ja esikäsittely tunnisti musiikin alun
  kohtaan 7,60 s. Tahdin mediaani on 1,98 s, ja tahdissa on neljä iskua.
- **Stemmit:** muu 76 %, basso 13 %, laulu 2 %, rummut 0 % (oikein: ensimmäisellä
  minuutilla ei ole rumpuja). Bassostemmin huiput osuvat tahdin alkuihin.
- **Sävelet:** melodia on varma 41 %:ssa ruuduista (muu-stemmi) ja basso 29 %:ssa.
  Laulu-stemmi on lähes tyhjä, joten hypoteesi "laulu = johtava linja" ei päde tällä
  minuutilla. Nuotteja on 103.
- **Soittimet (PANNs):** viulu, jousisoittimet, sello ja orkesteri erottuvat.
  Käyrätorvia malli tunnistaa heikosti, joten teeman alun unisonokäyrätorvet jäävät
  näkymättä.

## Vaihe 4: tulkinta (`interpret.py`)

Muuttaa kanavat musiikillisiksi tapahtumiksi. Tämä vastaa litteraatin "plain note" -osaa,
eli tieto kerrotaan lauseina eikä pelkkinä numeroina.

| Tapahtuma | Ehto |
|---|---|
| soittimet sisään / ulos | soitinperheen (jouset, vaskipuhaltimet, puupuhaltimet, lyömäsoittimet, harppu) aktiivisuus muuttuu yli 10-kertaisesti, kun verrataan 3 s ennen ja jälkeen |
| tempomuutos | tahtitempo muuttuu yli 8 %, kun verrataan 6 tahtia ennen ja jälkeen. Raportoidaan vain, jos vähintään 3/4 tahdeista on ankkuroitu kuultuun ääneen. |
| äkillinen hiljeneminen tai voimistuminen | voimakkuus muuttuu yli 10 dB sekunnissa |
| rakenteen muutos | uutuuskäyrän huippu ja muut tapahtumat ±3 s sisällä, eli mitä siinä muuttui |

Tulosteet:
- `events.json` koneelle
- `yhteenveto.md`, jossa ovat tapahtumat ja 10 sekunnin ikkunoiden taulukko
  (hallitsevat soitinperheet, tempo, voimakkuus, sävellaji). Tämä on kuunteluoppaan
  pohja.

### Jaksotus (`segments.py`)

Etsii musiikin taitekohdat ja kuvaa jokaisen jakson. Tätä kohtaus käyttää jakson
maisemaan, sankarin luonteeseen ja jugend-pylväisiin.

- **Piirteet** (0,5 s välein, z-normalisoituina): soitinperheiden aktiivisuus,
  voimakkuus, rekisteri, attakkitiheys, tempo ja chroma.
- **Uutuuskäyrä:** itsesamankaltaisuusmatriisista 3 s:n shakkilautaytimellä. Huiput
  ovat vähintään 5 s välein, ja rajat kohdistetaan lähimpään tahdin alkuun.
  Äkilliset hiljenemiset ovat aina rajoja.
- **Jakson kuvaus:**
  - soittimet sekä tulevat ja lähtevät soittimet
  - dynamiikka (pp–ff) ja suunta (crescendo, diminuendo, tasainen)
  - rekisteri, tekstuuri, tempo, sävellaji ja tapahtumat
- **Tulos A 0–400 s:** 45 jaksoa. Vaskien tulo 0:39.4, vasaraniskut 3:31–3:44, tauko
  3:59.2 ja puupuhaltimet 4:01 osuvat jaksorajoille.
- **Rajoitus:** PANNs ei erottele soittimia tiheässä ff-tutissa (esim. A 3:58:
  voimakkuus 1,00, soitinluokat alle 0,3). Kohtaus käsittelee tämän tehollisena tuttina.

## Vaihe 4b: koko levyn kanavat (`themes.py`)

Yhdistää osien kanavat puolen mittaisiksi (vaihto osien limityksen puolivälissä) ja laskee
voimakkuuden ja soitinperheet koko puolen yli normalisoituina → `build/koko/A.npz`, `B.npz`.
Sen teematunnistimet (kromahaku, dom7, virveli ym.) ovat raakaehdokkaita, ja niissä on vääriä
osumia, kuten "virveli" sankarijakson huipussa. Tahtiruudukkoa ei käytetä tahtinumeroina:
koko A-puolelle se antaisi noin 750 "tahtia", vaikka taistelu alkaa lähteiden mukaan T. 368.

## Vaihe 4c: aikajana (`aikajana.py`)

Koko levyn aikajana `build/koko/aikajana_A/B.md`:
- **Jaksorajat** tulevat segments.py:stä ja ovat teräviä (±0,5 s). Ne osuvat vahvistettuihin
  kohtiin: A 0:39.4 (vasket sisään) ja A 1:34.1 (ensimmäinen huippu).
- **Jokaisesta jaksosta:** dynamiikka ja suunta, rekisteri, liiketiheys, sävellaji
  selkeyksineen ja soitinperheet.
- **Uusi / poistuu:** perhe vahvistuu tai heikkenee selvästi edelliseen jaksoon verrattuna.
- **Soolo tai ohut tekstuuri:** hiljainen kohta, jossa yksi perhe hallitsee.
- **Tunnelman muutos:** dynamiikka muuttuu vähintään kaksi astetta, liike kaksinkertaistuu tai
  puolittuu, rekisteri siirtyy tai duuri ja molli vaihtuvat.
- **Rajoitukset:** PANNs kertoo, mikä soi, mutta ei tarkkaa hetkeä, koska ikkuna on useita
  sekunteja. Vahvistetussa kohdassa A 0:39.4 vaskien raaka-arvot jäivät alle 0,04. Hiljaisissa
  kohdissa rahina näyttää lautasilta ja virveliltä, joten ne nollataan.

## Vaihe 5: merkinnät (teemakartta → `make_cues.py`, `kuunteluopas.py`)

**Teemakartta `annotations/teemat.json`** on käsin ylläpidetty ja ainoa paikka, jossa
jaksojen ja teemojen aikoja korjataan:
- **Tapahtumien järjestys** tulee lähteistä (Porter, Wikipedia en/de, Kennedy).
- **Ajat** tulevat aikajanasta: jaksoraja tai interpret.py:n soitintapahtuma.
- **Jokaisella tapahtumalla on:**
  - luokka (soitin, tunnelma, soolo, huippu, tauko)
  - mitä kuuluu ja tarina
  - varmuus (vahvistettu / analyysi / lahde+analyysi / arvio)
  - peruste (mitattu piirre)
- **Ulos:**
  - `make_cues.py` kirjoittaa `annotations/cues.json`:iin teemakartan jaksot ja tapahtumat
    (`teema_*`; video käyttää myös `cue_hero_dom7`) sekä paketin tapahtumat ja tahdit
    (A 0–400 s).
  - `kuunteluopas.py` kirjoittaa kuunteluoppaan aikakoodatut osat: ankkurit, minuutti
    minuutilta ja tarkistuslista.

Jokaisessa kohdassa on `lahde` (analyysi / arvio / vahvistettu) ja `vahvistettu`.
Vahvistettuja kohtia ei koskaan kirjoiteta yli.

## Vaihe 6: tarkistus (`check_package.py`)

Tarkistaa, että:
- JSON-tiedostot kelpaavat
- `.f32`-tiedostojen koko vastaa ruutuja × kanavia
- arvoissa ei ole NaN- tai inf-arvoja
- iskut ja tahdit ovat järjestyksessä ja nuotit kelvollisia
- `cues.json`in rakenne kelpaa: tunnisteet, teemat, ajat ja tahdit

`setup.ps1` tarkistaa `cues.json`in samalla työkalulla.

## Paketti (`build/<ajo>/`)

| Tiedosto | Sisältö |
|---|---|
| `prepare.json` | lähde, kohinataso, korjatut viiveet |
| `analysis.json` + `analysis.f32` | signaalianalyysi, ruudut × kanavat (float32, 30 fps) |
| `listen.json` + `listen.f32` | kuuntelu: soittimet, stemmit, sävelet, isku- ja tahtivaihe; mallit, näytönmuistin huiput, kestot |
| `beats.json` | iskut, puhdas tahtiruudukko (tahtinumero, aika, tempo, lähde), raa'at tahdin alut |
| `events.json`, `yhteenveto.md` | tulkinta: tapahtumat ja 10 sekunnin yhteenveto |
| `notes.csv` | alku, loppu, MIDI, varmuus, lähde |
| `patina.json` | naksahdukset ja voimakkuudet |
| `stems/` | Demucs-stemmit |
| `LUE_MINUT.md` | kanavien selitys mallille, luotettavuus, näytönmuisti |
| `plots/overview.png`, `plots/listen.png` | tarkistuskuvat |

## Mallipainot

Painot ladataan etukäteen manifestin `analysis/models.json` mukaan kansioon `models/`
(`fetch_models.py`), ja jokaisen tiedoston SHA-256 tarkistetaan. Kirjastojen omia
latauksia ei käytetä. PANNs lukee AudioSet-luokkien nimet kotikansiosta
(`~/panns_data`), joten `listen.py` kopioi tarkistetun tiedoston sinne ennen importtia.
Lisenssit tarkistetaan ennen julkaisua (merkitty manifestiin).

## Rajoitukset

- **CLAP ei toimi.** `laion/larger_clap_music` antaa kaikille teksteille saman upotuksen
  (teksti–teksti-samankaltaisuus 1,00, siniääni vs. kohina 0,97). Sama tulos saatiin
  sekä transformers 5.21.1:llä että 4.57.6:lla, ja checkpointin lämpötila on 0,027
  (koulutetulla mallilla luokkaa 2,6–4,6). Vika on siis painoissa. **Seuraavaksi**
  kokeillaan toista CLAP-checkpointia manifestin kautta. Siihen asti orkesterisoittimet,
  joita AudioSetissä ei ole (oboe, englannintorvi, fagotti, tuuba), ja luonne tulevat
  merkinnöistä.
- **Orkesteri sulautuu,** joten soitintunnistus kertoo todennäköisyyksiä. Teeman nimi tulee
  lähteiden tapahtumajärjestyksestä ja tarkistetaan korvalla. Partituuria käytetään vain
  tarkistukseen (`score.py`); sointuja tai harjoitusnumeroita ei lueta kuvista.
- **Demucs on koulutettu populaarimusiikilla,** joten stemmit ovat likiarvoja.
- **Koko orkesterin polyfonista transkriptiota ei tehdä,** koska Python 3.12:lle ei ole
  asianmukaisesti paketoitua mallia. Melodiakaarten luetteloa (`themes.json`) ei tehdä,
  koska melodioita ei lueta partituurista. Lainauksia (Don Juan ym.) ei siksi tunnisteta
  äänestä, ja niiden kohdat ovat arvioita.
- **Iskunseuranta on epätarkka** rubatossa ja tempovaihdoksissa. Sankarijakson tahtimäärä
  täsmää (Porter: 116 tahtia), mutta pidemmällä matkalla ruudukko ajautuu, joten
  tahtinumeroita ei lasketa koko teokselle.
