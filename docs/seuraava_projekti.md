# Seuraava musiikkivideo: opit Heldenlebenistä ja aloitusprompti

*Kirjoitettu 1.11.2026 A-puolen v3-renderin jälkeen. Kaksi osaa: (1) mitä opimme, (2) prompti, jolla uusi
projekti aloitetaan uudessa kansiossa. Uuteen projektiin siirtyvät vain menetelmä, työkalut ja prosessisäännöt.
Visuaalinen kieli (tyyliohje, paletti, hahmot, kohtauskoodi, kuvakäsikirjoitus, paperi- ja mustemoottori) ei siirry:
se luodaan teokselle uudestaan käyttäjän ideoista.*

---

## 1. Mitä opimme

### Ohjaus ja prosessi

1. **Tyyli ensin, kokonaan, ja se voittaa.** Jokainen palaute ja idea käännetään ensin tyyliohjeen kielelle ja vasta
   sitten toteutukseksi. Harpun "emämoka" (kirjaimellinen harppu valosiltana) syntyi, kun brief sanoi "ei tunnistu
   harpuksi" ja "näkyy selvästi", vaikka kaikki dokumentit sanoivat "harppu = väreet vedessä". Oikea muoto: "tavallinen
   puu, jonka oksat värähtelevät harpun tahtiin".
2. **Chatissa sanottu ei siirry agenteille.** Osaistunto ja kriitikko toteuttavat briefin sanasta sanaan. Kaikki sitova
   kirjoitetaan tiedostoon, jonka osa lukee, ja brief alkaa rivillä "lue tyyliohje kokonaan; se voittaa tämän briefin".
   Lukulista on järjestyksessä: tyyli → kuvasäännöt → ohjaus → palaute → merkinnät.
3. **Ohjaajan ote ennen koodia.** Kuvakäsikirjoitus ja ohjaus kirjoitetaan ensin: jokaisessa otossa sankari tekee
   jotain, ja kuvaa johtaa se, joka musiikissa puhuu (pääosasääntö). Hylätyt versiot opettivat: pelkkä friisi on
   staattinen, pyörivä kamera aiheuttaa pahoinvointia, hahmo joka "toljottaa viiri kädessä" ei kanna.
4. **Musiikki ohjaa kaiken kuvassa.** Jokaisella kuvan tapahtumalla on musiikillinen syy: teemakartan ankkuri, kirjoitettu
   isku tai mitattu kanava. Kovakoodatut sekunnit ja tahtiruudukko ajautuvat irti musiikista.
5. **Valmis tarkoittaa mitattua.** Ääni totuutta vasten (0 ms), iskut oikeassa ruudussa, kamera ≤ 20 °/s, ei lavasteiden
   reunavuotoja, jatkuvuusmittari, tuore kriitikko. Raportoidaan vain se, minkä mittaus tai kuva näyttää. Palautetta ei
   merkitä hoidetuksi koodimuutoksen perusteella.
6. **Tuore kriitikko joka renderin jälkeen**, ja sillä kaksi tehtävää: jatkuvuus (tarkoitettu vai bugi) ja tyyli
   (säännön henki, ei kirjain: onko kuvan soitin elementti vai esine). Kriitikon "piti näkyä" kirjoitetaan elementtinä.
   Kriitikko ei nähnyt harppua, koska sitä pyydettiin katsomaan, "näkyykö harppu".
7. **Palautelista on sopimus.** Jokainen käyttäjän palaute yhdeksi riviksi (✅ todennettu / 🔶 korjattu, ei todennettu /
   ❌ auki) ja todennus kirjataan riville. Palautteen saa antaa mobiilista: WhatsApp-versio joka renderistä toimi.
8. **Luonnokset ennen renderiä.** Stillit ja kontaktiarkit, kolme pahinta ongelmaa korjataan, osarenderit `--start/--end`,
   vasta sitten koko puoli. Koko renderi ajetaan aina ketjuna, joka mittaa itsensä (renderi → videotarkistus →
   jatkuvuus → kontaktiarkki → stillit → WhatsApp), jotta käyttöraja tai yö ei katkaise työtä.
9. **Työnjako:** ohjaaja (pääistunto) kirjoittaa ohjauksen ja briefit, tarkastaa stillit ja kokoaa; osat omissa
   istunnoissaan omilla tiedostoillaan; yhteisiin tiedostoihin vain ohjaaja `pyynnot.md`:n kautta. Yksi renderi
   kerrallaan koneella. Pääistunto Fablella, osat ja kriitikot Sonnetilla.
10. **Versionhallinta alusta asti.** Tämä projekti ei ollut git-repo, ja versioiden erot piti säilyttää käsin
    diff-tiedostoina. Ajot omiin kansioihin `runs/<nimi>/` (brief, run.json, tarkistus, renders).
11. **Tarina ennen tekniikkaa.** Kuunteluopas (isän tarinat) on kuvan syy. Kuvakäsikirjoitukseen ei tule kuunteluoppaan
    sisältöä eikä toisin päin. Lainauksia ei keksitä; sallitut viittaukset lähteistetään ja merkitään tulkinnaksi.

### Musiikki ja analyysi

12. **Yksi aikojen totuus:** kuuntelukopio, jota käyttäjä kuuntelee. Kaikki ajat ovat sen aikaa, ja videon ääni mitataan
    sitä vasten (`kellot.py`). Soittimen oma kello voi näyttää muuta.
13. **Teemakartta on ainoa paikka ajoille**; cues ja kuunteluoppaan aikakoodit generoidaan siitä. Ajat tarkistetaan
    korvilla (`kuuntele.py`, `rekisteri.py`) ennen kuin niitä kutsutaan kuulluiksi.
14. **Kanavat eivät ole totuus.** PANNs kertoo, mikä soi, ei milloin; ff-tutissa se on sokea vaskille; rahina näyttää
    lautasilta; harppukanava ja CLAP olivat kuolleita; pYIN ja librosan tempo eivät toimi orkesterissa. Jokaiselle
    soittimelle, jota kuva käyttää, mitataan kanavan luotettavuus varmassa kohdassa ennen kuin sitä käytetään.
    Kuollut kanava korvataan partituurilla + mitatuilla tahdinaluilla + spektrogrammilla (harpun glissandot).
15. **Iskut 10 ms tarkkuudella** (`aksentit.py`), ja kuvan tapahtuma on iskun ruudulla. Iskun elementti on ympäristössä
    (viirinkärjet, tuulenpuuska, läiskä), ei hahmon kehossa: hahmot eivät pompi, ilmesty eivätkä katoa iskussa.
16. **Partituuri on tarkistusta varten**, ei kellona: tahtinumeroita ei lasketa äänestä. Lukuvirheiden varalta sivut
    renderöidään ja luetaan, ei muistella.
17. **Levyn rahina säilyy ääniraidassa**; analyysi tehdään puhdistetusta monokopiosta.

### Tekniikka

18. **Kohtaus on puhdas aikafunktio `seek(t)`**: ei tilaa ruutujen välillä, ei ajastimia, ei siemenetöntä satunnaisuutta.
    Jokainen piirtotila asetetaan joka ruudulla.
19. **Ruudut putkeen ffmpegille** eksplisiittisellä `-t`:llä, noin 40 s osina tuoreella selaimella, `--workers 2`;
    keskeytynyt ajo jatkuu valmiista osista.
20. **Mittarit rakennetaan ennen kohtauksia**: camcheck, kohtauscheck (reunavuodot magentana), jatkuvuus (välke, hypyt),
    asento- ja kärkiskannerit, "hahmot kuvassa" -laskuri. Kaikki liikkeen suunnanvaihdot tehdään jatkuviksi (IK:n kulman
    kääntyminen ja varren kallistus aiheuttivat yhden ruudun hyppyjä).
21. **Mittaa tiedostosta, ei esikatselusta.** Selaimen esikatselun välke ei ollut videossa.
22. **Julkaisumaster:** 2× Lanczos 2160p, full → limited range, BT.709, libx264 CRF 20, GOP 30, ääni koskematta, värilippujen
    remux. WhatsApp-versio 720p ≤ 170 Mt palautetta varten.
23. **Riippuvuudet:** manifesti + lukitus + setup-skripti, painot tarkistussummin; paketteja, joiden riippuvuustiedot ovat
    rikki, ei käytetä. Ei tekoälykuvia, kaikki grafiikka koodilla.

### Mitä teemme seuraavalla kerralla kehittyneemmin

- **Git ja `opit.md` päivästä yksi.** Jokainen kierros kirjaa oppinsa; palautelista ja kriitikon raportit ovat commit-historiassa.
- **Tyyliohje kirjoitetaan teokselle käyttäjän ideoista ennen yhtään riviä koodia**, ja siitä johdetaan samalla kertaa
  kuvasäännöt, soitinroolit ja kriitikon kohdat. Yksi lähde, kolme näkymää.
- **Kanavakortti heti analyysin jälkeen:** taulukko soitin → mitattu kanava → luotettavuus varmassa kohdassa → korvaava
  lähde. Kuollutta kanavaa ei pääse käyttämään vahingossa.
- **Brief tehdään mallista** (tiedosto), jossa lukujärjestys ja kielletyt sanamuodot ovat valmiina; kriitikko käynnistyy
  ketjussa automaattisesti renderin perään, ja sen bugilista on renderin kelpoisuuden ehto.
- **Kuuntelukriitikko:** elementin ajoitus tarkistetaan korvalla ja spektrillä, ei vain ruuduista.
- **Osarenderit ja stillit jokaisesta otosta ennen koko renderiä**, jatkuvuusbudjetti (välke ja hypyt) sovitaan etukäteen.
- **Palaute mobiilista rakenteisena:** aikakoodi + sanat, suoraan palautelistaan.
- **Pääosasääntö ja "jokaisessa otossa teko" ohjaukseen alusta asti**, ei korjauskierroksena.

---

## 2. Aloitusprompti uuteen projektiin

*Kopioi tämä uuden kansion ensimmäiseksi viestiksi. Täytä <TEOS>, <LEVYTYS> ja <KANSIO>. Prompti ei sisällä
visuaalisia ohjeita tarkoituksella: tyyli luodaan käyttäjän ideoista ensimmäisenä työvaiheena.*

```
Aloitamme uuden musiikkivideoprojektin kansiossa <KANSIO>. Teos: <TEOS>. Äänilähde: <LEVYTYS>
(kuvaa: LP/CD/tiedosto, näytteenottotaajuus, puolet/raidat). Kirjoitan suomeksi; vastaa suomeksi.
Olen orkesterimuusikko. Tämä on toinen projekti sarjassa, ja edellinen (Heldenleben, F:\code\heldenleben-video)
opetti menetelmän. Sieltä siirtyvät VAIN menetelmä, työkalut ja prosessisäännöt. Sieltä EI siirry mitään
visuaalista: ei tyyliohjetta, palettia, hahmoja, kuvakäsikirjoitusta, kohtauskoodia eikä piirtomoottoria
(paperi, muste, rasteri, nuket). Tälle teokselle luodaan oma visuaalinen kieli minun ideoistani. Jos huomaat
ehdottavasi jotain, mikä on Heldenlebenin tyyliä, pysähdy ja sano se.

TYÖTAPA
- Projekti etenee vaiheittain, ja aloitat jokaisen vaiheen vasta pyynnöstäni. Ei generointia, analyysiä
  tai renderöintiä ennen kuin pyydän.
- Perusta git-repo heti ja committaa jokaisen vaiheen lopussa. Pidä docs/opit.md:tä elävänä: jokainen
  kierros kirjaa, mikä toimi ja mikä ei.
- Tarkista faktat (teos, historia, levytys, työkalut) lähteistä ja merkitse epävarmat [tarkista].
- Sinä olet ohjaaja pääistunnossa. Osatyöt tehdään omissa istunnoissaan tai aliagenteilla, ja ne
  käynnistetään aina model: sonnet. Osa saa briefin tiedostona; chatissa sanottu ei siirry osille, joten
  kaikki sitova kirjoitetaan tiedostoon, jonka osa lukee.

VAIHEET (järjestys sitova)
1. Lähteet ja työkalut: kopioi Heldenlebenistä vain analysis/ (prepare, analyze, listen, interpret,
   segments, aksentit, kuuntele, rekisteri, kellot, themes, aikajana, make_cues, kuunteluopas,
   videotarkistus, jatkuvuus, kriitikko, check_package, fetch_models + models.json), render/ (render,
   camcheck, kohtauscheck, otecheck), setup.ps1, pyproject.toml, uv.lock, package.json ja
   docs/youtube.md:n masterresepti. Tarkista, että ne toimivat uudella aineistolla, ja korjaa teoskohtaiset
   oletukset. Riippuvuudet vain manifestin, lukituksen ja setup-skriptin kautta; painot tarkistussummin.
2. Teos: tutkimusdokumentti (rakenne, jaksot, teemat, soitinnus, lähteet), partituuri tarkistusta varten.
3. Ääni: kuuntelukopio on aikojen ainoa totuus; kaikki ajat ovat sen aikaa, ja videon ääni mitataan sitä
   vasten. Analyysi puhdistetusta monokopiosta, ääniraita alkuperäisestä.
4. Kuuntelutyökalu ja kanavakortti: aja analyysi, ja tee heti taulukko soitin -> mitattu kanava ->
   luotettavuus varmassa kohdassa -> korvaava lähde (partituuri + mitatut tahdinalut + spektrogrammi).
   Kuollutta kanavaa ei käytetä kuvan ajoitukseen.
5. Kuunteluopas ja teemakartta: opas on tarina kuuntelijalle (minun tarinani, kysy niitä); teemakartta on
   ainoa paikka, jossa jaksojen, teemojen ja iskujen ajat ovat, ja cues sekä oppaan aikakoodit generoidaan
   siitä. Ajat tarkistetaan korvilla ennen kuin niitä kutsutaan kuulluiksi.
6. VISUAALINEN TYYLI: haastattele minua ideoistani ennen kuin kirjoitat mitään. Kirjoita sitten
   docs/visuaalinen_tyyli.md tälle teokselle: ydinidea, kielioppi, väri, tila, liike, henkilöt tai
   elementit, selkeyden säännöt, mitä vältämme, soitin -> elementti -taulukko (jokainen soitin on
   elementti, ei esine). Johda siitä samalla kertaa docs/kuvasaannot.md (tiivistys), soitinroolit ja
   kriitikon kohdat. Tyyliohje on kaiken peruste, ja se voittaa briefin, palautteen ja ohjauksen.
7. Ohjaus ja kuvakäsikirjoitus: jokaisessa otossa teko; kuvaa johtaa se, joka musiikissa puhuu; jokainen
   kuvan tapahtuma nimeää ankkurin, iskun tai mitatun kanavan; ei kovakoodattuja sekunteja. Kuvakäsikirjoitukseen
   ei tule kuunteluoppaan sisältöä eikä toisin päin. Lainauksia ei keksitä.
8. Tekniikka valitaan tyylin mukaan (ei etukäteen): kohtaus on puhdas aikafunktio seek(t) ilman tilaa
   ruutujen välillä, ruudut putkitetaan ffmpegille, osat tuoreella selaimella, yksi renderi kerrallaan.
   Mittarit (camcheck, kohtauscheck, jatkuvuus, hahmot kuvassa, asento- ja kärkiskannerit) rakennetaan
   ennen ensimmäistä kohtausta.
9. Perusta, sitten osat: jokainen osa omassa istunnossaan omilla tiedostoillaan, brief mallista
   (docs/brief_malli.md: ensimmäinen rivi "lue tyyliohje kokonaan ja kuvasäännöt; ne voittavat tämän
   briefin"; palaute kirjoitetaan elementtinä kuvasääntöjen sanoin, ei "tunnistuu X:ksi" tai "X näkyy
   selvästi"; käyttäjän sanat lainataan erikseen). Yhteisiin tiedostoihin vain ohjaaja pyynnot.md:n kautta.
10. Luonnokset ennen renderiä: stillit, kontaktiarkit, kolme pahinta ongelmaa, osarenderit --start/--end.
11. Kriitikko joka renderin jälkeen: tuore Sonnet-agentti, joka lukee ensin koko tyyliohjeen ja
    kuvasäännöt, sitten ruutusarjat; jatkuvuus (tarkoitettu vai bugi) ja säännön henki (elementti vai
    esine) ja ajoitus musiikkiin korvalla. Bugilista tyhjä = renderi kelpaa.
12. Koko renderi vain ketjuna, joka mittaa itsensä: renderi -> ääni totuutta vasten -> iskujen ruudut ->
    jatkuvuus -> kontaktiarkki -> stillit -> WhatsApp-versio palautetta varten. Sitten master (2160p-resepti).

SÄÄNNÖT, JOTKA EIVÄT NEUVOTELLA
- Valmis tarkoittaa mitattua. Raportoi vain se, minkä mittaus tai kuva näyttää; "koodi tekee näin" ei riitä.
- Palautelista (docs/palautelista.md): jokainen palautteeni yhdeksi riviksi, tila ✅ todennettu /
  🔶 korjattu, ei todennettu / ❌ auki, ja todennus riville. Mobiilipalaute kirjataan heti aikakoodeineen.
- Hahmot tai elementit eivät ilmesty, katoa tai loikkaa iskussa; iskun elementti on ympäristössä.
  Liikkeen suunnanvaihdot jatkuvia. Kamera ei pyöri eikä ylitä 20 °/s.
- Ei tekoälyn tuottamia kuvia; kaikki grafiikka koodilla. Ei olemassa olevien kansien tai maalausten
  jäljentämistä. Hahmojen eleissä ei mitään natsitervehdystä muistuttavaa.
- Tarina ennen tekniikkaa. Kun olet epävarma, kysy tarinaa, älä arvaa tekniikkaa.

ENSIMMÄINEN TEHTÄVÄ NYT
Älä aloita mitään vaihetta. Lue tämä viesti, kirjoita kansioon CLAUDE.md näistä säännöistä (tiivis, omin
sanoin, ilman Heldenlebenin visuaalisia termejä) ja docs/kokonaissuunnitelma.md vaiheista 1-12 tarkistus-
listoineen. Kysy sitten minulta: (a) äänilähteen tiedot, (b) milloin haluan kertoa visuaaliset ideani
(vaihe 6 tehdään haastatteluna), (c) mitkä Heldenlebenin työkalut saan kopioida sellaisenaan.
```
