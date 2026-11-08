# Prompti Claude Codelle: Julkaisu 2.0, vaihe 1 (referenssilinjaus ja nopeus)

Kopioi alla oleva Claude Code -istuntoon kansiossa `F:\code\heldenleben-video` (`git pull` ensin).

---

Lue `CLAUDE.md`, `docs/julkaisu2.md` (luvut 1.3 ja 1.5) ja `runs/muste-1230/release2/korjaukset.md`.

Referenssiäänite on ladattu: `audio/ref/ref_Us1jfC7bMpA.flac` (hr-Sinfonieorchester / Orozco-Estrada,
Alte Oper Frankfurt 11.12.2015; 48 kHz mono FLAC Opus-lähteestä, `audio/ref/ref_Us1jfC7bMpA.info.json`).
Referenssin jaksorajat kuvauksen mukaan: Held 0:21, Widersacher 4:32, Gefährtin 8:00, Walstatt 20:14.
Referenssi on vain analyysin apuväline: sen ajat eivät päädy videoon, oppaaseen eivätkä teemakarttaan
muuten kuin linjauskuvauksen kautta.

Tehtävät järjestyksessä, jokaisesta lyhyt raportti `build/ref_hr2015/raportti.md`:

1. **Riippuvuus kirjaan:** `build/ref_lataus.ps1` asensi `yt-dlp`:n wingetillä. Lisää se `setup.ps1`:n
   winget-listaan valinnaisena (VALINNAINEN-tila), perustelu kommenttiin: referenssiäänitteen lataus.
   Siirrä `build/ref_lataus.ps1` → `analysis/ref_lataus.ps1` (parametrina URL ja tunniste) ja poista
   `build/ref_lataus.cmd`. Commit.

2. **Linjaus ja nopeus:** aja
   `.venv\Scripts\python.exe -I analysis\linjaus.py --ref audio\ref\ref_Us1jfC7bMpA.flac --nimi hr2015 --ref-alku 21 --ref-rajat 21,272,480,1214`
   Skripti on uusi ja ajamaton: korjaa virheet, mutta älä muuta menetelmää (chroma_cqt viritys
   korjattuna, 5 ruutua/s, Sakoe-Chiba 12 %). Jos muisti loppuu DTW:ssä, rajaa referenssi `--ref-loppu 1500`.
   Laatuportti: jaksorajojen residuaali ≤ 1,0 s. Jos portti ei mene läpi, raportoi mistä (esim. tempo
   kertauksessa) äläkä löysää rajaa.

3. **Nopeuden tarkistus toisella menetelmällä:** `analysis/rekisteri.py` tai torchcrepe stemmeistä
   (`analysis/kuuntele.py`) alun Es-duurin pitkistä sävelistä (Krauss 7.6–20 s: sellot ja käyrätorvet,
   ref 21–35 s). Vertaa sävelkorkeuksia senttitarkasti. Raportoi: Kraussin poikkeama A440:stä, hr:n
   poikkeama, erotus, ja arvio levyn nopeusvirheestä olettaen WPh 443–445 Hz [tarkista]. Tee johtopäätös
   julkaisu2.md 1.5:n säännöllä (alle 0,5 % → a) ääni ennallaan; yli → b) ehdota korjausta, älä tee).

4. **Referenssin soittimet:** aja PANNs referenssille A-puolen alueelle (ref 0–1500 s) omaan pakettiin
   `build/ref_hr2015/` (`listen.py --steps soittimet`, tai jos prepare.py vaatii LP-puolen, tee
   referenssille kevyt polku, joka tuottaa saman `listen.json`-muodon). Siirrä havainnot Kraussin aikaan
   `build/ref_hr2015/linjaus.json`:n kuvauksella ja kirjoita `build/ref_hr2015/soittimet_krauss_aika.json`.

5. **Patarumpu kolmesta lähteestä:** korjauslistan rivit #6 (Krauss 31 s), #7 (39 s), #73 (1172 s):
   Krauss PANNs + rumpustemmi (`aksentit.json`), referenssin PANNs linjattuna, partituuri (P jo
   tarkistettu #6–#8). Kirjoita jokaiselle varmuus `kuultu | ehdokas | kielletty` ja lähteet
   korjauslistaan. Älä muuta vielä teemakarttaa eikä tekstityksiä: ne tehdään vaiheessa 2 kun koko lista on käyty.

Commit jokaisen tehtävän jälkeen suomenkielisellä viestillä, push lopuksi. Älä aloita renderöintejä.
