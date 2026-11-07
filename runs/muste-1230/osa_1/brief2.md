# Osa 1, kierros 2: Sankari (`held_alku` → `held_gp`, 0–243 s)

*Ohjaajan brief 31.10.2026 lopullisen renderin (`renders/heldenleben_muste_A_final.mp4`) palautteen jälkeen.
Omat tiedostot: `visual/muste/scenes_1.js`, `loc_valley.js`, `loc_sea_muste.js`, `loc_meadow.js`, `loc_storm.js`.
Yhteisiin tiedostoihin ei kosketa; perustan uudet rajapinnat: `runs/muste-1230/perusta3/tarkistus.md`.*

Lue ensin: `docs/palautelista.md` (C1, C11, C12, B2, B4, B5, B6, C2), `docs/kuvasaannot.md`,
`docs/visuaalinen_tyyli.md` luvut 7–8, `runs/muste-1230/storyboard.md` kohtaukset 1–24,
`runs/muste-1230/kriitikko/index.md` (kriitikon havainnot ruuduista).

## Korjattavat, todisteineen

| # | Aika | Mitä ruuduissa näkyy nyt | Mitä pitää näkyä |
|---|---|---|---|
| C11 **estää julkaisun** | 17,6 / 21,6 / 27,5 s (`held_isku_t6`, `held_isku_t8`, `held_isku_t11`) | toverit makaavat punaisina läiskinä maassa, ponnahtavat iskussa kokonaisiksi viirillisiksi hahmoiksi 3–5 ruuduksi ja kutistuvat takaisin | **Kahdeksan käyrätorvea = kahdeksan hahmoa.** Sankari ja seitsemän toveria ovat kuvassa `held_alku`:sta alkaen (toverit pieninä selkäkuvina rivissä sankarin takana tai harjanteella, samassa tuulessa) eivätkä ilmesty tai katoa kertaakaan 7,6–60 s. Iskun tekee elementti: `held_isku_t6` viirinkärjet napsahtavat ylös ja tuulenpuuska pyyhkäisee (viivoitus), `held_isku_t8` sama voimakkaampana, `held_isku_t11` kaikki kahdeksan nostavat kellot soittoasentoon fraasin mittaisena liikkeenä (1,5 s), ei nykäyksenä. Hahmon keho ei koskaan reagoi iskuun. |
| B2 | 7,6–32 s | teemaviiva piirtyy lyhyinä pätkinä, ritari ei ole selkäkuvassa, vuoret ovat siniset jo ennen 23 s | yksi jatkuva punainen veto teemaviivasta (`build/demo400/teemaviiva.json`), vedon päässä selkäkuva; vuoret painuvat berliininsinisellä vasta `held_viulut`:ssa (jouset), sitä ennen lyijykynäluonnos/paperi |
| B4 | 108–142 s | vedot eivät ehdi kokoontua ritariksi ennen leikkausta (124–126 s) | kohtaus 16 (`held_t61` → `held_reh8`): vedot kokoontuvat ritariksi näkyvästi ja ritari marssii tasangolle ennen `held_reh8`:aa |
| B5 + jatkuvuus | 154–171 s | viirien portaat avautuvat **joka tasasekunnilla** (156,00, 157,00 … 170,00) yhden ruudun napsahduksena; 160–164 s kaksi hahmoa päällekkäin | portaat avautuvat `aksentit.json`:n iskuissa harjoitusnumeron 9 ympärillä (ei `Math.floor(t)`-askellusta eikä mitään kellon mukaan), avautuminen on 0,3–0,5 s:n liike; hahmoilla vähimmäisväli, ei päällekkäisyyttä |
| 126,5 s | kohtaus 11–12 | yhden ritarin viiri vaihtaa muotoa yhdessä ruudussa | viirin muodonmuutos sidotaan tuuleen tai mitattuun kanavaan ja kestää vähintään 0,3 s |
| B6 | 211–228 s | paussissa viirit eivät painu eikä sade hiljene | kohtaus 22: salama katkon alussa (`S.drops`), katkossa sade ja tuuli hiljenevät ja viirit painuvat, kohotahti-iskulla viirit napsahtavat ylös; kukaan ei loikkaa |
| C12 **estää julkaisun** | 229–234 s (`held_dom7_sointu` → `held_dom7`) | toverit seisovat tai kelluvat ilmassa mustan kallion seinämällä ja taivaalla, ilmestyvät sattumanvaraisiin kohtiin | jokainen hahmo seisoo maalla koko ajan: joko joukko kiipeää näkyvää rinneviivaa pitkin (polku lasketaan kallion profiilista) tai leikataan suoraan huipulle (selkäkuva 2). Sädekehä 234–238 s säilyy sellaisenaan. |
| C8 pieni | 224–240 s | – | tarkista stilleistä, ettei yksikään käsivarsi ole suorana viistosti ylös eteen; kellot soittoasentoon, viirit pystyyn |

## Valmis tarkoittaa

1. Stillit 10 fps:llä 16,5–29,0 s ja 1 fps:llä 7,6–60 s: kahdeksan hahmoa näkyvissä jokaisessa ruudussa 7,6 s:stä alkaen,
   ei ilmestymisiä. `node render/render.mjs --page visual/muste/index.html --data build/demo400 --stills <ajat> --dir runs/muste-1230/osa_1/stills2 --workers 2`.
2. Osan renderi `--start 0 --end 243` kansioon `runs/muste-1230/osa_1/renders/osa1_v2.mp4` (yksi renderi kerrallaan: kirjaa
   `runs/muste-1230/pyynnot.md`:hen rivi "osa 1: renderi käynnissä" ja poista se, kun valmis; jos toinen on käynnissä, odota).
3. `analysis/jatkuvuus.py runs/muste-1230/osa_1/renders/osa1_v2.mp4 --start 0`: ei hyppyjä hahmoissa iskujen ulkopuolella,
   ei tasasekunnin hyppyjä 154–171 s.
4. `analysis/kriitikko.py` osan renderille kohdeluettelolla `docs/kriitikko_kohdat.json` (vain oman alueen kohdat; tee
   kopio luettelosta) ja **tuore tarkistaja-aliagentti (model: sonnet)**, joka täyttää "näkyy / ero" -sarakkeet. Bugilistan
   pitää olla tyhjä kohdista C11, C12, B6, B5.
5. `node render/camcheck.mjs --max 20` ja `node render/kohtauscheck.mjs --step 15` omalla alueella: 0 ylitystä.
6. Raportti `runs/muste-1230/osa_1/tarkistus2.md`: mitä muutit, jokaisen taulukon rivin todennus (still tai mittaus),
   mikä jäi. Älä merkitse mitään korjatuksi ilman kuvaa tai mittausta.

Kielletyt: yhteisten tiedostojen muokkaus (pyynnöt `pyynnot.md`:hen), kovakoodatut sekunnit, `Math.floor(t)`- tai
`t % 1`-tyyppinen askellus, hahmojen kehon reaktio iskuun, koko puolen renderöinti.
