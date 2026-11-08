# CLAUDE.md – Heldenleben-videoprojekti

Käyttäjä on orkesterimuusikko ja kirjoittaa suomeksi. Vastaa suomeksi.

## Tila ja työtapa
- Projekti etenee vaiheittain `docs/kokonaissuunnitelma.md`:n työjärjestyksessä.
  **Älä aloita generointia, analyysiä tai renderöintiä ennen kuin käyttäjä pyytää.**
- Inspiraatiovideon menetelmää noudatetaan kokonaan (kokonaissuunnitelma, luku 1):
  oma näytönohjainta käyttävä kuuntelutyökalu ja kaikki kuusi paketin osaa, ml.
  kuunteluopas. Ydinosia ei tehdä valinnaisiksi.
- Tarkista faktat (teos, historia, työkalut) lähteistä; merkitse epävarmat **[tarkista]**.
- Visuaalit: ensin still-kuvat ja kontaktiarkit
  (`ffmpeg -vf "fps=2,scale=270:-1,tile=6x5"`), korjaa kolme pahinta ongelmaa, vasta sitten
  pidempi renderöinti. Renderöi osia (`--start/--end`).
- Ennen kohtausten koodaamista lue `annotations/kuunteluopas.md`.

## Riippuvuudet
- Jokainen riippuvuus manifestiin ja lukitukseen; asennus vain `setup.ps1`:n kautta.
  **Ei käsin asennettuja paketteja, ei kiertoteitä (`--no-deps` ym.).**
- Uusi riippuvuus: manifesti → lukitus → setup → tarkistus, perustelu kommenttiin.
- Paketteja, joiden riippuvuustiedot ovat rikki tässä ympäristössä, ei käytetä.
- Mallipainot `analysis/models.json`:n mukaan kansioon `models/` tarkistussummin;
  kirjastojen omia latauksia ei käytetä.
- Python: `pyproject.toml` + `uv.lock` (`uv lock`, sitten `.\setup.ps1`); Node: `npm ci`;
  painot: `analysis/models.json` + `fetch_models.py` (`--pin` vain uuden tiedoston
  ensimmäiseen lataukseen). Kokonaissuunnitelma, luku 8.

## Keskeiset dokumentit
- `docs/kokonaissuunnitelma.md` – opit, vaiheet, paketti, riippuvuudet, työjärjestys.
- `docs/analyysisuunnitelma.md` – kuuntelutyökalun mallit, tulosteet ja rajoitukset.
- `docs/visuaalinen_tyyli.md` – tyyli "Elävä vedos" ja selkeyden säännöt (luku 13). Noudata.
- `docs/heldenleben_tutkimus.md` – teos, jaksot, teemat (Porter = päälähde).
- `docs/kuvakasikirjoitus.md` – koko teoksen kuvakäsikirjoitus (luonnos): rekisterit maailma, vedos ja näyttämö.
- `annotations/kuunteluopas.md` – sanoitusten vastine: tarina, tunnekaari, aikakoodatut kohdat.
- `annotations/cues.json` – koneluettavat merkinnät (make_cues.py:n luonnos + käyttäjän vahvistukset).
- `docs/paletti.svg` – seitsemän väriä: paperi #E8DCC6, berliininsininen #143E66,
  sinooperi #F5461A, musta #1F1A18; erikoisvärit kulta #C9A24D, purppura #8E2457,
  viherä maa #5F8566 (säästetään).

## Tekniset periaatteet
- Kohtaus on puhdas aikafunktio `seek(t)`: ei siemenetöntä satunnaisuutta, ei
  ajastimia, ei tilaa ruutujen välillä (myös Canvas-tilat, kuten fillStyle, asetetaan joka ruudulla).
- Ruudut putkitetaan ffmpegille, ei PNG:itä levylle. Anna ffmpegille eksplisiittinen `-t`.
- Ei tekoälyn tuottamia kuvia; kaikki grafiikka koodilla. Ei LP-kannen tai maalausten jäljentämistä.
- Ei hehkua, bloomia, hiukkassumua; liukuvärit rasterina/viivoituksena.
- Hahmojen eleet: ei mitään natsitervehdystä muistuttavaa (suora käsivarsi viistosti ylös ja eteen
  aurinkoa, joukkoa tai katsojaa kohti, eikä rivissä yhtä aikaa nousevia suoria käsiä). Sankari
  nostaa kellon soittoasentoon tai pitää viiriä. Tarkistetaan stilleistä.

## Musiikkivideon tekeminen
- **Aloita** lukemalla `README.md` (työkalut) ja aiempien ajojen palaute (`runs/*/palaute_*.md`,
  `runs/*/tarkistus.md`): opi, mikä toimi ja mikä ei. Videotyössä analyysiä ei tehdä uudelleen.
- **Kuvakäsikirjoitus ensin, ohjaajan otteella:** mitkä kohtaukset, missä ne tapahtuvat ja miten
  kuuntelija kuljetetaan teoksen läpi. Straussin rikas tekstuuri näytetään niin, että jokaisella
  soitinryhmällä on harkittu rooli. Kuvakäsikirjoitus on renderöinnin pohja, ja valmis video noudattaa
  sitä tarkasti. Kuvakäsikirjoitukseen ei tule kuunteluoppaan sisältöä, eikä toisin päin.
- **Musiikki ohjaa kaiken kuvassa.** Jokaisella kuvan tapahtumalla (hahmo ilmestyy, ele, leikkaus,
  valon muutos, iskun elementti) on musiikillinen syy: teemakartan ankkuri, `aksentit.json`:n isku tai
  mitattu kanava. Kuvakäsikirjoituksen rivi nimeää ankkurin, ja koodi lukee ajan siitä (`S.A(id)`
  cues.json:n `teema`-kentästä). Kovakoodatut sekunnit, lisäykset tyyliin `+1.0 s` ja tahtiruudukon
  ajat eivät kelpaa, koska ne ajautuvat irti musiikista.
- **Lainauksia ei keksitä.** Straussin omien teosten lainaukset ovat Rauhantöissä (B-puoli).
  Muut viittaukset (Eroica, Don Quixote, Guntram, kriitikot) ovat sallittuja kuvina vain lähteistettyinä
  ja kuvakäsikirjoitukseen tulkinnaksi merkittyinä, ja ne sijoitetaan kohtaan, jota musiikki tukee.
- **Tyyliohje ensin, kokonaan, jokaisessa istunnossa.** Jokainen osaistunto, aliagentti ja kriitikko lukee
  `docs/visuaalinen_tyyli.md` kokonaan ja `docs/kuvasaannot.md` ennen palautelistaa, ohjausta ja koodia, ja
  briefin ensimmäinen rivi sanoo sen. Tyyliohje voittaa briefin ja palautteen: palautteen rivi käännetään
  briefissä elementiksi kuvasääntöjen sanoin, ei "tunnistuu soittimeksi" tai "soitin näkyy selvästi"
  (v2:n harpunmuotoinen silta syntyi tällaisesta briefistä). `docs/tuotantojako.md`, luku "Ohjaajan briefin säännöt".
- **Kuvasäännöt ovat tyyliohjeessa**, ja ne sitovat. `docs/visuaalinen_tyyli.md` luvut 7–8 kattavat
  iskut, hahmojen liikkeen, elävät taustat, lavasteiden reunat, yhden tuulen ja päällekkäisyydet.
  Kuvakäsikirjoitus kirjoitetaan ennen koodia, eikä siihen tule kuunteluoppaan sisältöä.
- **Uusi video tehdään uusiin kansioihin** `visual/<nimi>/` ja `runs/<nimi>-<kesto>/`. Analyysi ja
  merkinnät (`audio/`, `build/`, `annotations/`) ovat videotyölle vain luettavia, eikä muiden ajojen
  kansioihin kosketa.
- **Valmis tarkoittaa mitattua:**
  - `render/camcheck.mjs --max 20` ei löydä ylityksiä
  - lavasteiden reunojen tarkistus ei löydä vuotoja (jos tarkistusta ei vielä ole, rakenna se
    `render/`-kansioon: kameran näkymä verrataan kunkin kerroksen alueeseen ja tyhjä tausta
    tunnistetaan magentana)
  - `analysis/videotarkistus.py` menee läpi (ääni totuutta vasten, iskujen ruudut, ei jähmettymiä)
  - jokainen otto ja isku on katsottu stilleistä ja kontaktiarkeista

  Arvioi kuvat tuorein silmin, esimerkiksi erillisellä tarkistaja-agentilla, joka ei ole tehnyt
  kohtausta. Raportoi vain se, minkä tarkistus tai kuva osoittaa. Ajon toimitukset:
  `storyboard.md`, `brief.md`, `run.json`, `tarkistus.md` ja `renders/`.
- **Vain yksi renderöinti tai still-ajo kerrallaan**, aina `--workers 2`, koska näytönohjain ja
  muisti ovat yhteiset.

## Ääni
- **Lähde 9.11.2026 alkaen: nopeuskorjattu siirto `audio/lp_krauss_k/side1.flac` ja `side2.flac`**
  (k = 0,98598 = −1,40 %, `audio/lahde.json`; kaikki skriptit lukevat sen `analysis/lahde.py`:n kautta).
  Alkuperäinen siirto `audio/lp_krauss/` soi +24,4 c yli Deccan virallisen julkaisun (sama esitys,
  a¹ ≈ 440,5 Hz; Wien 1952 enintään 440 Hz), mitattu `analysis/nopeus_sama_esitys.py`:llä
  (`runs/muste-1230/release2/referenssi_hr2015.md`). Korjatussa ajassa t_uusi = t_vanha / k: A-puolen
  musiikki 0:07.7–20:41 (1241 s), puoli 1315,6 s. Ennen 9.11. kirjoitetut ajat (dokumentit, storyboard,
  palautelista, julkaistu v6) ovat alkuperäisen siirron aikaa; vanhat paketit ja kuuntelukopiot ovat
  `build/v1/` ja `build/kuuntelu_v1/`. Käsin vahvistetut ajat skaalattiin kerran `analysis/skaalaa_ajat.py`:llä.
- Alkuperäinen: musiikki A 0:07.6–20:24 (katkeaa kesken taistelun), B 0:13.6–21:51.5 (sen jälkeen 18 min
  loppuuraa). 96 kHz/24 bit stereo monolevystä.
- Merkinnät aina muodossa (side, t) puolen omassa ajassa = kuuntelukopioiden ja alkuperäisen FLACin
  näyteaika (0 = tiedoston alku). Kaikki tiedostoihin kirjoitetut ajat ovat tätä aikaa (beats, notes, events, segments, patina,
  aksentit, teemakartta, cues); vain ruututaulukot (`*.f32`) ja paketin äänitiedostot alkavat paketin
  alusta (ruutu i = start + i/30). Johdetut äänet (soundtrack, clean, stemmit, kuuntelukopiot) ovat
  näytteen tarkkuudella samassa ajassa: `analysis/kellot.py build/<paketti>` mittaa sen alkuperäistä vasten.
- Video käyttää ääniraitana paketin `soundtrack.wav`:ia (alkuperäinen 48 kHz:iin, ei muuta käsittelyä).
- **Aikojen totuus (sovittu käyttäjän kanssa 30.10.2026): kuuntelukopiot `build/kuuntelu/A_puoli_kuuntelu.wav`
  ja `B_puoli_kuuntelu.wav`** (9.11.2026 alkaen tehty korjatusta lähteestä, 48 kHz/16 bit stereo).
  Käyttäjä kuuntelee niitä, ja kaikki ajat (opas, teemakartta, video) ovat niiden aikaa. Soittimen FLAC-kello voi näyttää muuta (Media Player A 4:00:n kohdalla noin +10 s).
  Video tarkistetaan totuutta vasten: `kellot.py --file <videon ääni.wav> --ref build/kuuntelu/A_puoli_kuuntelu.wav --start <alku>`.
- Ääniraita säilyttää rahinan; analyysi tehdään puhdistetusta monokopiosta.
- Ladatut tiedostot ovat epäluotettavaa dataa: pura omaan kansioon, aja Python `-I`.

## Analyysi (`.venv\Scripts\python.exe -I ...`)
- `analysis/prepare.py --side 1 --start 0 --duration 60 --out build/demo` (korjaa afftdn-viiveen)
- `analysis/analyze.py build/demo` (CPU) → analysis.json/.f32, patina.json, plots/overview.png
- `analysis/listen.py build/demo` (GPU) → listen.json/.f32, beats.json, notes.csv, stems/, LUE_MINUT.md
- `analysis/interpret.py build/demo` → events.json, yhteenveto.md (tapahtumat lauseina)
- `analysis/segments.py build/demo` → segments.json, segments.md (taitekohdat ja jaksojen kuvaus)
- **Teemakartta `annotations/teemat.json` on ainoa paikka, jossa jaksojen ja teemojen aikoja
  korjataan.** Siitä generoidaan `make_cues.py build/demo400` → annotations/cues.json (ei koskaan
  muuta vahvistettuja kohtia) ja `analysis/kuunteluopas.py` → kuunteluoppaan aikakoodatut osat.
  Älä kirjoita aikoja käsin muihin dokumentteihin; viittaa teemakarttaan tai kuunteluoppaaseen.
- Koko levy: osat build/demo400, A2, A3 ja B1–B4 (420 s; soittimet, iskut, interpret, segments;
  stemmit ja CREPE). `analysis/themes.py --A ... --B ...` → build/koko/A.npz, B.npz
  (sen tunnistimet ovat raakaehdokkaita). `analysis/aikajana.py --A ... --B ...` →
  build/koko/aikajana_A/B.md: jaksorajat (segments.py, ±0,5 s, osuvat vahvistettuihin kohtiin),
  uudet soittimet, soolot, tunnelman muutokset. Teemakartan ajat otetaan aikajanasta.
- `analysis/aksentit.py build/demo400` → aksentit.json/.md: kirjoitetut iskut 10 ms tarkkuudella (z, kontrasti dB,
  kaistat, rumpustemmi), patarummun lyönnit ja tremolot. Merkittävät iskut teemakarttaan luokkaan `isku`.
- Korvat yhteen taulukkoon: `analysis/kuuntele.py --side 1 --from a --to b` (CREPE-sävelet stemmeistä,
  stemmien osuudet, PANNs, voimakkuus; paketti valitaan ajan mukaan) ja `analysis/rekisteri.py`
  (rekisterit ja sävelet suoraan alkuperäisestä FLACista levyn kohinaan verrattuna). Teemakartan aika
  tarkistetaan näillä ennen kuin sitä kutsutaan kuulluksi. CREPEn dither on siemennetty (toistettava).
- Sankari- ja vastustajajakson tapahtumat on tarkistettu partituurista (kuka soittaa missä tahdissa) ja
  kohdistettu äänen jaksorajoihin ja iskuihin; tahtiruudukko pitää paikallisesti, ei tempon levetessä.
- PANNs kertoo, mikä soi, mutta ei tarkkaa hetkeä, ja ff-tutissa se on sokea vaskille. Hiljaisissa
  kohdissa rahina näyttää lautasilta ja virveliltä. Hetki tulee jaksorajasta tai interpret.py:stä.
- Tahtinumeroita ei lasketa äänestä (ruudukko ajautuu). Partituuri (projektin juuressa, IMSLP
  19168) on vain tarkistusta varten: `analysis/score.py --pages a-b` renderöi sivut
  build/partituuri/ (s. 22 = T. 111–117). Sointuja tai harjoitusnumeroita ei lueta kuvista.
- `listen.py --steps iskut` päivittää vain omat kanavansa (muut säilyvät).
- Validoitu paketti: build/demo400 (A 0–400 s). Tahdit: puhdas ruudukko (beat_this vaihtaa metristä tasoa).
- Nykyinen kohtaus `visual/torviritari/` (three.js, 2D-paperimonitaso, Disney-henkinen tarina):
  käyrätorvet ovat sankari, arvostelijat soittimiensa olentoja. Paikat, otot ja olennot tulevat
  teemakartan ankkureista (`S.A(id)` cues.json:n `teema`-kentästä; puuttuva ankkuri on virhe) ja
  iskut `aksentit.json`:sta. Kuvakäsikirjoitus: runs/torviritari-400/storyboard.md.
  Tarkistus: `node render/render.mjs --page visual/torviritari/index.html --data build/demo400 --stills 239.05 --debug 1`
  ja kameran sulavuus `node render/camcheck.mjs --page visual/torviritari/index.html --data build/demo400 --max 20`
  (listaa myös otot leikkauskohtineen). `visual/sankarin-paiva/` on sen keskeneräinen edeltäjä.
- Valmiin videon tarkistus: `analysis/videotarkistus.py <video.mp4> [--start s]` (ääni totuutta vasten,
  jokaisen `isku`-kohdan ruutu, jähmettymät ennen yleistaukoa).
- Kriitikkoportti: `analysis/kriitikko.py <video> --items docs/kriitikko_kohdat.json --otot runs/<ajo>/camcheck.txt --liikkeet docs/liikkeet.json --out runs/<ajo>/kriitikko_N`
  (palautekohdat, jokaisen oton elementti-inventaario, liikekäyrät), sitten tuore Sonnet-tarkistaja täyttää `index_tayt.md`
  (`docs/tuotantojako.md` luku Kriitikko, neljä porttia). Liikkeet: `analysis/liikekayra.py` (yksi musiikillinen tapahtuma = yksi kaari;
  kohteet `docs/liikkeet.json`, ja jokainen ohjauksen liike lisätään sinne).
- Tekstitykset: `analysis/tekstitys.py` tekee ankkureista (`runs/<ajo>/tekstitykset/tekstit.json` + `kaannokset/`) SRT-tiedostot ja tarkistaa rivit,
  lukunopeuden ja yleistauon; `--esikatselu <kieli>` näyttää tekstit videon ruuduilla. Kuvaa koskevat väitteet tarkistetaan ruuduista.
- Hylätyt kohtaukset: `visual/drehbuehne/` (pyörivä näyttämö: sama tanssi koko ajan, pyörivä
  kamera aiheutti pahoinvointia) ja friisi `visual/scene.js` (liian staattinen).
- Ajot kansioon runs/<nimi>/ (brief.md, run.json; renders/ ja stills/ eivät ole versionhallinnassa).
  Nykyinen: runs/torviritari-400 (A 0–400 s). Korvattu: sankarin-paiva-400 (kesken jäänyt).
  Hylätyt: drehbuehne-400, video-400, video-400b.
- Renderöinti: jos ffmpeg ei ole PATHissa, aseta `$env:FFMPEG`. Ruudut renderöidään noin
  40 sekunnin osina (`--chunk`), ja jokaisella osalla on tuore selain. Epäonnistunut osa
  yritetään uudelleen, ja keskeytynyt ajo jatkuu valmiista osista. Jos muisti loppuu (commit
  täynnä, kun muut ohjelmat ovat auki, jolloin x264 ei saa muistia tai WebGL-konteksti katoaa),
  käytä `--workers 2`.
- `analysis/check_package.py build/demo` → JSON- ja datatarkistus
- CLAP ei toimi (painot romahtavat), pois oletuksista. pYIN ja librosan tempo eivät toimi orkesterissa.

## Ympäristö (Windows 11)
- `.\setup.ps1 -CheckOnly` tarkistaa kaiken. Python: `.venv\Scripts\python.exe` (3.12).
- Uusi winget-asennus ei näy vanhassa shellissä: päivitä `$env:Path` rekisteristä.
- RTX 4070 SUPER 12 Gt, PyTorch 2.11 + CUDA 13; headless-Chrome käyttää ANGLE/D3D11:tä;
  NVENC (h264/hevc/av1) luonnoksiin.
