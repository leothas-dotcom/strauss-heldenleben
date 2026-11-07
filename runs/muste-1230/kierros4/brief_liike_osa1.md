# Kierros 4, osa 1: liikkeet yhdeksi kaareksi (E1 huipun pilvet, E2 alun aurinko)

*Ohjaajan brief 1.11.2026. Lue ensin `docs/visuaalinen_tyyli.md` kokonaan (erityisesti luku 8, liike) ja
`docs/kuvasaannot.md`; ne voittavat tämän briefin. Sitten `docs/ohjaus.md` otot 1.1–1.3 ja 23–24,
`docs/palautelista.md` rivit E1, E2, A13, ja `docs/tuotantojako.md` luku "Kriitikko" kohta 1 (liikkeet).
Omat tiedostot: `visual/muste/loc_storm.js`, `visual/muste/loc_valley.js`. Yhteisiin tiedostoihin ei kosketa.*

## Käyttäjän sanat (1.11.2026)

> "Tärkeintä nyt olisi saada kaikkien elementtien liikkeet sulaviksi. Nyt tuota auringon nousua [huippu, kun
> aurinko tulee esiin pilvien takaa, 228–234 s] on hinkattu sen verran paljon, että ne pilvet avautuvat
> kolmesti. Kun sen pitäisi olla yksi yksittäinen liike."

Tyylin kielellä (luku 8): yksi musiikillinen tapahtuma on yksi liike, joka alkaa kerran ja päättyy kerran.
Peräkkäiset pehmennetyt ikkunat samalle asialle, tai sama tapahtuma kolmella mekanismilla eri ajoituksin,
lukevat nykimisenä.

## E1. Huippu: aurinko tulee esiin pilvien takaa (loc_storm.js, otto 23 → tablo 24)

Mitattu v3:sta (`runs/muste-1230/kierros3/liike_huippu_pilvet.png`, `v3_huippu_pilvet_227.5-234.5_4fps.jpg`,
`kriitikko_v3b/liikkeet/L_huippu_*`): kolme mekanismia eri ajoituksin.
1. `gap = smoothstep(tChord − 2, tChord + 2.5, t)` siirtää pilviä (r. 358, 384–394): useimmat väistyvät
   228,5–231 s, mutta vasemman yläkulman pilvi jää ja valuu hitaasti 231–234 s (sen `clear − |dx|` on pieni,
   joten se liikkuu vähän ja näkyy vielä).
2. Aurinko häivytetään näkyviin alfalla `smoothstep(tChord, tChord + 3, t)` (r. 379) samaan aikaan: aurinko
   ei tule esiin pilvien takaa, vaan ilmestyy haaleana kiekkona ja vahvistuu.
3. Kamera nousee (otto 23, 229–234 s) ja leikkaus tabloon 234,25 s poistaa loput pilvet kerralla: pilvien
   tila on leikkauksen jälkeen eri kuin ennen.

Haluttu: **yksi avautuminen.** Aurinko on täysin valmiina (alfa 1) pilvien takana jo ennen kuin ne alkavat
väistyä, ja se paljastuu vain siksi, että pilvet väistyvät. Kaikki näkyvät pilvet väistyvät samalla yhdellä
kaarella, joka alkaa soinnun ankkurissa (`tChord`, S.A) ja on perillä ennen leikkausta tabloon; yksikään pilvi
ei jää valumaan. Leikkauksen jälkeen (tablo) taivas on sama kuin leikkausta ennen (pilvet poissa molemmin
puolin). Kameran nousu saa jatkua, mutta se ei saa tuoda pilviä takaisin kuvaan (tarkista parallaksi: pilvet
z −60…−130). Kaaren muoto: yksi ease, ei kahta ikkunaa; nopeus saa seurata soinnun crescendoa, mutta ei
pysähtyä. A13:n paikat (aurinko huippumuurin vasemmalla puolella otossa 23, kruunun kärjet tablossa) säilyvät.

## E2. Alku: aurinko nousee harjanteen takaa (loc_valley.js)

Mitattu v3:sta: `sunY` (r. 268) on kolmen peräkkäisen smoothstepin summa (T0→tBrass, tBrass→tHeroes,
tHeroes→tEnd), ja jokainen alkaa ja päättyy nollanopeuteen → 5–6 liikkuvaa jaksoa, pysähdykset 31,0–33,4 ja
39,7–40,9 s (`kierros3/liike_aurinko_26-47.png`). Taivaan valkeneminen (r. 262–267) on neljä porrasta, usva
yhdeksän. Haluttu: aurinko nousee **yhdellä kaarella** T0:sta tEndiin; nopeus saa kasvaa vaskien tullessa
(`tBrass`) mutta ei pysähtyä välissä (esim. yksi monotoninen käyrä, jonka derivaatta on jatkuva ja painottuu
tBrassin jälkeen). Taivaan vaiheet (yö → sarastus → valo → aamu) saavat olla eri värejä, mutta kirkkauden
pitää kasvaa ilman pysähdyksiä. Usvan liike samoin: jos se avautuu, se avautuu kerran.

## Hyväksymisehto (mitattu, ei luettu)

1. Stillit ensin: `node render/render.mjs --page visual/muste/index.html --data build/demo400 --stills 228,229.5,231,232.5,234,234.5,236 --workers 2`
   ja alun 28,31,33,36,39,41,44. Yksi still- tai renderiajo kerrallaan koko koneella: tarkista
   `runs/muste-1230/pyynnot.md` ("käynnissä"), kirjoita oma rivisi ajon ajaksi, poista perään.
2. Osarenderit `--start 224 --end 241` ja `--start 6 --end 48` (`--workers 2`) kansioon
   `runs/muste-1230/kierros4/osa1/`, ja niistä:
   `python -I analysis/liikekayra.py <osarenderi.mp4> --start 226 --end 234.2 --crop 0,0,1920,620 --mode cover --thr 110 --png ...`
   (HUOM: osarenderin aika alkaa 0:sta; käytä `--start`/`--end` renderin omassa ajassa tai renderöi niin, että
   ajat täsmäävät; kerro raportissa, kumman teit) → **tulos "YKSI KAARI"**; sama `--mode red-y --crop 0,0,1920,700`
   auringolle 228–234,2; alulle `--mode red-y --crop 0,0,1920,560` 26–46 → YKSI KAARI; taivas `--mode luma
   --crop 0,0,1920,400` 8–46 → ei pysähdyksiä (pysähdyksiä 0).
3. `analysis/jatkuvuus.py` osarendereille: ei uusia hyppyjä; `render/camcheck.mjs --max 20`: 0 ylitystä.
4. 4 fps ruutusarja 227,5–235 s (taivas) ja kontaktiarkki 8–47 s, katsottuna: aurinko ei ilmesty haaleana,
   pilvet poissa leikkauksen molemmin puolin.

Raportti `runs/muste-1230/kierros4/osa1/tarkistus.md`: mitä muutit (rivit), mittaustulokset, kuvat. Vain se,
minkä mittaus tai kuva näyttää. Älä lisää uusia elementtejä, älä muuta hahmojen eleitä, älä koske iskuihin.
