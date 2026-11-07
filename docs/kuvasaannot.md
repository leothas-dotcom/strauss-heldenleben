# Kuvasäännöt yhdellä sivulla (sitova tarkistuslista osaistunnoille)

*Tiivistelmä tyyliohjeesta (`visuaalinen_tyyli.md` luvut 7–8, 13, 18), tuotantojaosta ja käyttäjän
palautteesta. Jos tämä ja pitempi dokumentti eroavat, pitempi voittaa, mutta tämän listan jokainen
kohta tarkistetaan jokaisesta otosta ennen luovutusta. Tarkistaja-agentti pisteyttää jokaisen stillin
tällä listalla: kohta kerrallaan KYLLÄ/EI ja mistä sen näkee.*

## A. Jokainen still on kuva (stillisääntö)
1. **Yksi hallitseva muoto** (aurinko, harjanne, veto, vene, kuu) ja enintään kolme elementtiryhmää.
2. **Kolmasosa tyhjää** taivasta tai paperia; tyhjässä kolmanneksessa ei liiku mitään.
3. **Mittakaava kertoo:** ritari on pieni maailmaa vasten (laaja) tai täyttää kuvan (lähikuva); ei
   keskikokoa, jossa hän vain seisoo.
4. **Pääääni täydessä värissä ja terävällä reunalla, sivuääni rasterina, säestys sinisenä ja
   matalalla kontrastilla.** Vain yksi pääosa kerrallaan.
5. **Siluetti luettavissa** yhdellä silmäyksellä: hahmon teko näkyy ääriviivasta; ei kasvoja.
6. **Tiheys = orkestraatio**, ei äänenvoimakkuus: soolo = yksi asia kuvassa, tutti = täysi mutta järjestetty kuva.
7. **Pystysuunta on rekisteri:** yläkolmannes korkea (sooloviulu, huilu), keski (käyrätorvet,
   puupuhaltimet), alakolmannes matala (sellot, bassot). Ylös on korkea sävel, oikealle on aika.

## B. Mikä saa näkyä ja milloin
8. **Soitin on hahmo tai elementti, ja se näkyy silloin kun soi** (`roolit.json`): käyrätorvet =
   ritari ja punainen muste; sellot ja bassot = maa; viulut = usvat ja tuulen viivat; sooloviulu =
   kumppanin valkoinen viiva; puupuhaltimet = olennot ja tiirat; trumpetit, pasuunat = aurinko,
   salamat, taistelun kiilat; patarummut = maan pöllähdys; harput = välkerenkaat ja kuun väreet.
   Mikä on vaiti, on levossa. **Suon olennot** (tyyliohje luku 10, 1.11.2026): koot suhteessa ritariin (hyttynen pään kokoinen, haikara enintään puolet, kotilot kolmannes, sammakot viidennes), rekisteri = korkeus kuvassa, ei lavasteita olentojen tueksi.
9. **Pääosasääntö:** torvet soittavat teemaa tai toimivat → ritari tekee; torvet laulavat sisäisesti →
   viiri tai muste yksin; torvet vaiti → toinen soitin johtaa, ritari kuuntelee pienenä tai poissa;
   tutti ilman torvia → maailma johtaa.
10. **Melodiamuste vain neljässä kohdassa A-puolella** (avaus `held_alku`→`held_viulut`; kahdeksan
    torvea `held_reh8`→`held_reh9` YHTENÄ vetona; hajoaminen `held_reh6`→`held_t61`; teeman paluu
    `gef_huippu`→`gef_sankari_hiljaa`), ja silloin se on kuvan ainoa pääosa. Muualla viiri on viiri
    yhdessä tuulessa. Melodia korostetaan muualla leikkauksella fraasin alkuun, kameran nousulla,
    horisontin tai valon muutoksella. **Muste on sankarin kädessä olevan viirin kärjen jälki:** viiri on kiinni keihäässä ja keihäs kädessä; kärki **mukailee** melodiaa tasoitetusti fraasin mitalla (ei nuotti nuotilta töksähtäen; vain kirjoitetut iskut saavat napsahtaa), ja jälki piirtyy kärjestä, ajelehtii tuuleen ja häviää. Irrallinen veto tai kärki, joka hyppii sävelestä säveleen, on virhe.
11. **Hiljaisuus on tyhjää paperia.** Kuva ei keksi tapahtumia; vain miljöö saa olla keksitty.
12. **Erikoisvärit säästetään:** kulta vain kertauksessa ja lopussa, purppura vain `gef_huippu` ja
    duetto, vihreä vasta rauhantöistä. Jos jotain ei voisi painaa seitsemällä värillä, se ei kuulu kuvaan.
    Ei hehkua, sumennusta, hiukkasia; liukuvärit rasterina tai viivoituksena.

## C. Liike
13. **Mikään ei liiku ilman musiikillista syytä**, ja jokainen aika tulee ankkurista (`S.A(id)`),
    iskusta (`aksentit.json`) tai mitatusta kanavasta. Ei kovakoodattuja sekunteja, ei `+8 s`.
14. **Liike seuraa fraaseja, ei iskuja:** hidas alku ja loppu, hahmojen keho ei pompi. Ennakointi
    (kuva valmistautuu huipennukseen), jälkiliike (viirit jatkavat sävelen jälkeen).
15. **Kirjoitettu isku = yhden elementin teko** (salama, roiske, kellojen välähdys, viirin napsahdus)
    ruutua (33 ms) ennen ääntä; kamera ja hahmot jatkavat liikettään iskun ja edeltävän katkon yli;
    koko kuvaa ei jähmetetä, välähdetä eikä täristetä, eikä iskuun leikata.
16. **Pitkä sointu: liike hidastuu leijuvaksi, ei pysähdy.** Täysi pysähdys vain yleistauossa.
    Otto ei ala eikä pääty pysähdyksestä (jähmettymätarkistus).
17. **Leikkaus tulee jaksorajaan tai ankkuriin**, ei iskuun; sama sommitelma enintään noin 30 s.
18. **Kamera sulava** (`camcheck` ≤ 20 °/s), ei pyörimistä; sonaattimuoto kamerassa: esittely kulkee
    eteenpäin, kehittely sukeltaa, kertaus palaa avauksen kulmaan.

## D. Tila ja lavasteet
19. **Kerrostasot:** pohja ja taivas, kaukainen horisontti, keskimaisema, äänien taso (terävin),
    etualan siluetit, kehys vain siirtymissä. Taustakerrokset elävät hitaasti omien soittimiensa
    mukaan (rasteritiheys dynamiikasta, usvat jousista), eivät reagoi yksittäiseen iskuun.
20. **Lavasteet eivät paljastu:** ei kerroksen reunaa, katkeavaa vuorta eikä paperin loppua
    (`kohtauscheck` 0 ylitystä).
21. **Yksi tuuli:** kaikki viirit, viitat ja savut samaan suuntaan; voima jousista ja voimakkuudesta.
22. **Jokaisella hahmolla oma tila:** ei päällekkäisyyksiä, viiri kuuluu kantajalleen, otsikko ei peitä
    hahmoa; otsikot tyhjään taivaaseen. Peilikuva veden alla, ei hahmon päällä.
23. **Selkäkuva vain neljästi** (avaus, sädekehä, kertaus, loppu) ja kerran dueton kaksi hahmoa kuuta katsomassa.

## E. Kiellot
24. Ei natsitervehdystä muistuttavia eleitä: ei suoraa käsivartta viistosti ylös ja eteen, ei rivissä
    yhtä aikaa nousevia suoria käsiä. Sankari nostaa kellon tai pitää viiriä.
25. Ei keksittyjä lainauksia (liekki, narrinlakki, tuulimylly). Lainaukset vain rauhantöissä.
26. Ei käännettyä kolmiota muistona lammessa; ei syaania painovärien kohdistuksesta.
27. Ei kuunteluoppaan tekstiä storyboardiin eikä kuvaan.

## F. Mittaukset, joita ilman otto ei ole valmis
`videotarkistus.py` (ääni 0 ms koko alueelle, isku-kohdat ruudun tarkkuudella, ei jähmettymiä),
`opastarkistus.py` (jokaisella ankkurilla vastaus, joka muuttuu; soitin ↔ elementti), `kohtauscheck`,
`camcheck`, stillit joka otosta ja kontaktiarkit 5 s välein, tuoreen tarkistajan pisteytys tällä listalla.
