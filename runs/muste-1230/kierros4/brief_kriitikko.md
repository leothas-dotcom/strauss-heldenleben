# Kriitikko v3b: neljä porttia koko A-puolelle (renderi v3)

*Ohjaajan brief 1.11.2026. Olet tuore tarkistaja, et ole tehnyt kohtauksia. Raportoi vain se, minkä kuva tai
mittaus näyttää. Kirjoita suomeksi.*

## Lue ensin, tässä järjestyksessä, ennen yhtään kuvaa

1. `docs/visuaalinen_tyyli.md` KOKONAAN. Se on kaiken peruste ja voittaa muut ohjeet. Kiinnitä huomio lukuihin
   4 (kielioppi: piste, viiva, taso), 8 (liike: sulava, ei nykivä), 10 (henkilöt: kumppani on viiva), 13
   (selkeyden säännöt), 15 (mitä vältämme), 18 (muste ja soitin = elementti).
2. `docs/kuvasaannot.md`.
3. `docs/tuotantojako.md` luku "Kriitikko: pysyvä jatkuvuus- ja tyyliportti" (neljä porttia) ja luku
   "Ohjaajan briefin säännöt".
4. `docs/ohjaus.md` (otot: mitä kussakin otossa pitää tapahtua, kuka johtaa kuvaa) ja `visual/muste/roolit.json`
   (soitin → elementti).
5. Vasta sitten aineisto: `runs/muste-1230/kriitikko_v3b/index.md` ja sen kuvat.

## Käyttäjän sanat, joiden takia tämä kierros tehdään (1.11.2026)

> "Tärkeintä nyt olisi saada kaikkien elementtien liikkeet sulaviksi. Nyt tuota auringon nousua [= huippu
> 228–240 s, kun aurinko tulee esiin pilvien takaa] on hinkattu sen verran paljon, että ne pilvet avautuvat
> kolmesti. Kun sen pitäisi olla yksi yksittäinen liike. Miten kriitikko ei huomaa tätä? Hänen päätehtävä oli
> varmistaa visuaalinen tyyli, missä sanotaan että hahmojen liike pitää olla sujuvaa. Ei nykivää."
> "Näissä skreeneissä on paljon epämääräistä mustetta, jotain valkoisia läiskiä. Jokaisella graafisella
> elementillä pitäisi olla joku tarkoitus. Minusta tuntuu että ne on jotain harpun jämiä."
> "Sen [kriitikon] pitää oikeasti katsoa että jokainen kuva on tyylin mukainen, ja että liikkeet on sujuvia."

## Neljä porttia ja mitä kirjoitat

Kirjoita `runs/muste-1230/kriitikko_v3b/index_tayt.md`, jossa on index.md:n kolme taulukkoa täytettyinä ja
perässä bugilista.

**Portti 1, liikkeet (index.md luku 3).** Jokaisesta liikkeestä: katso käyrä (`liikkeet/<id>_kayra.png`) ja
4 fps ruudut (`liikkeet/<id>_ruudut.png`). Mitattu luku "liikkuvia jaksoja" verrattuna odotukseen. Jos
jaksoja on enemmän, kerro ruuduista, MIKÄ liikkuu useasti (esim. "pilvet väistyvät 228,5–231, yksi pilvi jää
ja valuu 231–234, leikkaus 234,25 poistaa loput; aurinko häivytetään samaan aikaan"). Tila: OK / NYKII /
TARKOITETTU (iskuittain). Lisää omat havaintosi liikkeistä, joita listassa ei ole: käy läpi otot (luku 2) ja
nimeä jokainen liike, joka näyttää alkavan tai pysähtyvän useammin kuin musiikki antaa aihetta.

**Portti 2, elementti-inventaario (index.md luku 2, 94 ottoa).** Jokaisesta oton stilliparista luettele KAIKKI
näkyvät elementit (hahmot, viirit, viivat, pisteet, läiskät, renkaat, katkoviivat, pilvet, olennot, tekstit) ja
nimeä kullekin lähde: ohjaus.md:n otto-rivi, roolit.json:n soitin (ja soiko se tuolloin: ohjaus.md:n
musiikkisarake) tai kuvasääntö. Elementti ilman lähdettä, tai jonka soitin ei soi, on **JÄMÄ**. Erityisesti
rantaotot 422–1126 s: valkoiset viivat, koukut, pisteet, vinoneliöt, läiskät vedessä ja taivaalla. Sarake
"tyyli": onko still tyyliohjeen mukainen kuva (yksi pääosa, lukusuunta, väripartituuri, ei sekavaa mustetta,
stillisääntö). Tila: OK / JÄMÄ / SEKAVA.

**Portti 3, säännön henki.** Jokaisesta kuvan soittimesta: elementti vai esine. Jokaisesta hahmosta: tyyliohje
luku 10 ja päätös "kumppani on viiva, ei nukke" (nykyinen valkoinen ääriviivahahmo on tiedossa, A14; kerro
silti, missä otoissa se lukee ihmishahmona). Soitinmuotoiset olennot ovat tiedossa (D9); kirjaa ne otoittain.

**Portti 4, jatkuvuus (index.md luku 1, palautekohdat).** Täytä "Näkyy" ja "Ero / tila" kuten ennen.

**Bugilista** lopuksi, numeroitu, vakavin ensin: aika sekunteina, otto, mitä näkyy, mikä sääntö rikkoutuu,
mikä mielestäsi on syy (ruutujen perusteella, älä arvaa koodia). Erota TARKOITETTU (leikkaus jaksorajassa,
isku, siirtymä) ja BUGI. Merkitse epävarmat [epävarma].

Älä korjaa mitään, älä aja renderiä. Lopuksi palauta minulle: bugilistan 10 vakavinta, liikkeet jotka nykivät,
jämien luettelo otoittain, ja montako ottoa 94:stä on tyylin mukaisia stillisäännön mielessä.
