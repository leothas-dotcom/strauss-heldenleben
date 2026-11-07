# Kierros 4c, osa 2 (suo 240–422 s): olennot luonnollisen kokoisiksi, tukki pois, kamerat takaisin lähemmäs

*Ohjaajan brief 1.11.2026. Lue ensin `docs/visuaalinen_tyyli.md` kokonaan ja `docs/kuvasaannot.md`; ne voittavat tämän briefin.
Sitten `docs/ohjaus.md` luku 2 ja omat raporttisi `runs/muste-1230/kierros4/osa2/tarkistus_olennot.md` ja `tarkistus_nakyvyys.md`.
Omat tiedostot: `visual/muste/loc_swamp.js` (ei puuta r. 103–146), `critters_swamp.js`, `scenes_2.js`, `render/nakyvyys.mjs`.*

**ÄLÄ MUUTA YHTÄÄN TIEDOSTOA ennen kuin `grep -q "renderi loppui" runs/muste-1230/final5_chain.log` onnistuu** (koko A-puolen
renderi v5 lataa lähdetiedostot osittain tuoreena; odota vaikka 20 min). Still-ajot vasta, kun `pyynnot.md`:ssä ei ole
"käynnissä"-riviä (ketjun mittaukset eivät varaa vuoroa, mutta tarkista silti).

## Käyttäjän sanat (1.11.2026)

> "Eikö ole mitään ilmiselvempää tapaa saada kaikki critterit näkyviin? Muutetaan niiden kokoa? Nythän ne on absurdin isoja."
> (tukista:) "Siis teit jonkun tukin sinne? Oliko tämä nyt visuaalisen tyylin mukaista?"

## Tehtävä

1. **Koko ja paikka tyyliohjeesta (ohjaajan korjaus: aiemmat lukuarvot kumottu, käyttäjä 1.11.2026 "MITÄ SE SANOO?").**
   Luku 10: vastustajat ovat **mustia pisteitä**: huilu = neulanpisteet, oboe = pisteparvi, englannintorvi = pisteiden
   portaat, Dehringin tuubat = "kaksi raskasta täplää, aina kvintin päässä toisistaan ja aina rinnakkain", fagotit = "kaksi
   hyppivää täplää", pasuunat = leimasimen isku, tahra. Olento (luku 18, Disney 1) säilyy, mutta mittakaava on täplän: raskain
   täplä enintään ritarin pään kokoinen, huilun hyttynen neulanpiste siipineen. Luku 4 ja 13.5: **koko on voimakkuus**, eli
   olennon koko skaalautuu oman mitatun kanavansa voimakkuudesta (peruskoko täplä, vahvistus enintään noin 2x). Kuvasääntö 7:
   **pystysuunta on rekisteri**: hyttynen yläkolmanneksessa, sorsa ja haikara keskellä, kotilot ja sammakot alakolmanneksessa;
   kotilot aina kvintin päässä toisistaan pystysuunnassa. Kuvasääntö 3: ritari lähikuvan kokoinen tai pieni maailmaa vasten.
   Luku 18 Disney 5: pisteet luetaan kontaktiarkissa (scale 270) mutta eivät ole isompia kuin se vaatii. Ääriviivan leveys
   pysyy luettavana. Olentojen muotoa (D9) ei muuteta.
2. **Tukki pois** (`log2`, r. 100–105 ja 603–605): lavaste ei ole soittimen elementti eikä sitä ole ohjauksessa tai tyylissä.
   Sammakot (fagotit: "kaksi hyppivää täplää") hyppäävät veden puolelta penkereen alarinteelle ja istuvat rinteellä.
3. **Kamerat takaisin lähemmäs:** palauta kierros 4:n alkuperäiset (ennen 4b:tä) kameraparametrit otoissa, joissa muutit niitä
   (raportissasi on vanhat ja uudet arvot), ja hae pienemmillä olennoilla sommittelu, jossa ritari on taas lähikuvan kokoinen
   2.1b–2.2e:ssä ja kuoro (2.3) mahtuu kuvaan ilman että kamera on kauempana kuin v3:ssa. Olennot erillään ja kokonaan kuvassa:
   `node render/nakyvyys.mjs --from 240 --to 422` **0 rikettä** (myös --step 0.1). Lisää tarkistimeen tukin tilalle ei mitään.
4. Stillit 244, 247, 251, 256, 261, 266, 270, 276, 280, 284, 372, 380, 386 (`--workers 2`, `--dir runs/muste-1230/kierros4/osa2/koko`)
   ja v3-vertailu samoista ajoista v3-renderistä (`ffmpeg -ss T -i runs/muste-1230/renders/heldenleben_muste_A_v3.mp4 -frames:v 1`)
   rinnakkain arkiksi `koko_vertailu.jpg` (vasen v3, oikea uusi). Katso: olennot luonnollisen kokoisia, ritari lähikuvan
   kokoinen, ei tukkia, ei päällekkäisyyksiä.

Raportti `runs/muste-1230/kierros4/osa2/tarkistus_koko.md`: koot ennen/jälkeen (yksikköä ja % ritarista), kamerat, tarkistimen
tuloste, stillit. Vain se, minkä tuloste tai kuva näyttää. Yksi still-ajo kerrallaan (`pyynnot.md` "käynnissä").
