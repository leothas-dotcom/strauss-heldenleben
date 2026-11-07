# Kierros 4, osa 2: harppupuu tavalliseksi kuolleeksi puuksi (D8)

*Ohjaajan brief 1.11.2026. Lue ensin `docs/visuaalinen_tyyli.md` kokonaan ja `docs/kuvasaannot.md`; ne voittavat
tämän briefin. Sitten `docs/palautelista.md` rivi D8 ja `docs/ohjaus.md` otot 2.1–2.2. Oma tiedosto:
`visual/muste/loc_swamp.js`. Yhteisiin tiedostoihin ei kosketa.*

## Käyttäjän sanat (1.11.2026)

> "Se voi olla tavallinen puu, mutta esim. sen oksat voivat sitten värähdellä harpun tahtiin. Tätä juuri
> tarkoitan: mieti aina ensiksi visuaalisen tyylin kautta."

Partituuri (luettu 1.11.2026, sivut s023–s041): **harput eivät soita Widersacher-jaksossa lainkaan** (T. 118 –
noin T. 209), joten oksat eivät voi seurata harppua. Tyyliohjeen kielellä (luku 18, muste-taulukko: "tremolo = märkä
reuna värisee"; kuvasääntö 8) oksat elävät sen mukaan, mikä suolla soi: **jousten tremolo ja aallot**, jotka on jo
mitattu (`S.fam.strings`, käytössä lammen aalloissa harj. 17:stä, `wid_reh17` → `wid_uusi_hyokkays`). Muulloin puu on
hiljaa (kuollut puu ei huoju itsestään).

## Tehtävä

1. `loc_swamp.js` r. 103–120 ("Guntramin harppupuu"): poista harpun muoto kokonaan (kaula `neckPts`, kielet
   `strings`, kaareva runko joka lukee harpun pylväänä). Tilalle tavallinen kuollut puu samasta paikasta
   (x −6,5): yksi runko (`strokeGeo`, hieman kaareva), 5–8 paljasta oksaa (`deadTree`-apu on jo käytössä rivillä
   108) kahdessa haarassa, musta muste, sama korkeus kuin ennen (noin 6,4). Ritari istuu sen juurelle (2.1) ja
   pasuunavarikset laskeutuvat siihen (2.2f, `tCrow`): tarkista, että variksilla on edelleen oksa, jolle laskeutua
   (nykyinen koodi käyttää puun pisteitä: etsi `tree`-viittaukset riveiltä 280–300 ja 480–495 ja päivitä).
2. Oksien värähtely: `S.fam.strings(t)` (tasoitettu ~0,3 s) kääntää oksia pienellä kulmalla (enintään 0,04 rad)
   eri taajuuksilla oksittain (hash1), ja värähtely on nolla, kun kanava on alle kynnyksen. Ei värähtelyä
   `panns_harp`-kanavasta (kuollut; r. 491–492 `hp` ja `strings.forEach` poistuvat). Rungon ja oksien liike on
   jatkuvaa: ei napsahduksia, ei ilmestymistä. Sama tuuli kuin muualla suolla.
3. Lammen peili (`mem`, r. 123–) ja `pond.u.uGlint` (r. 488) saavat jäädä; `uGlint` ei saa käyttää `S.fam.harp`:ia
   (vaihda jousikanavaan tai vakioon).

## Tarkistus

Stillit `node render/render.mjs --page visual/muste/index.html --data build/demo400 --stills 244,252,262,300,340,380
--workers 2 --dir runs/muste-1230/kierros4/osa2/stillit` (yksi still-ajo kerrallaan: `runs/muste-1230/pyynnot.md`
"käynnissä"-rivi ajon ajaksi, poista perään). Katso: puu lukee kuolleena puuna, ei harppuna; varikset istuvat
oksalla; ritari puun juurella; kuva muuten ennallaan. Kontaktiarkki 243–400 s (`fps=1/4`). Raportti
`runs/muste-1230/kierros4/osa2/tarkistus.md`: muutetut rivit ja mitä stillit näyttävät. Ei osarenderiä, ei
mittauspatteristoa. Älä muuta olentoja (D9 odottaa käyttäjän päätöstä), älä koske muihin tiedostoihin.
