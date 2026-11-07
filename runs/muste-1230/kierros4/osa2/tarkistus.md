# Kierros 4, osa 2: harppupuu tavalliseksi kuolleeksi puuksi (D8)

Muutettu vain `visual/muste/loc_swamp.js`. Pyyntörivi `runs/muste-1230/pyynnot.md`:ssa oli vain still-ajojen ajan ja on poistettu.

## Muutetut rivit (`loc_swamp.js`)

- r. 103–146: "Guntramin harppupuu" korvattu kuolleella puulla. Poistettu: kaula `neckPts`, kymmenen kieltä `strings`, harpun
  pylvästä lukenut runko ja `deadTree(77)`-latva. Uusi: runko (`strokeGeo`, hieman kaareva, sama paikka x −6,5 ja
  korkeus 6,4, leveys 0,55 → 0,14) ja seitsemän paljasta oksaa mustana musteena kahdessa haarassa (vasen: B2, sen lisäoksa,
  latvaoksa; oikea: B3 ja sen lisäoksa sekä alhaalla oikealle kurottuva varisoksa B1 kahdella lisäoksalla). Oksat ovat
  ryhmiä, joiden kiertopiste on oksan tyvi (`limb()`), ja lisäoksat ovat vanhemman lapsia.
- r. 226: `treeStr` = `S.fam.strings` tasoitettuna 0,3 s (`Wc.smooth`).
- r. 522: oksien värähtely `rotation.z = amp * tk * sin(t*w + ph)`, jossa `tk = smoothstep(0.12, 0.40, treeStr(t))` (nolla alle kynnyksen),
  amp 0,026 päälimmäisellä ja 0,014 lisäoksalla (yhteensä enintään 0,04 rad; yksinäinen latvaoksa 0,036), `w` 5–8 rad/s
  päälimmäisillä ja 9–14 rad/s lisäoksilla (`hash1` oksan järjestysluvusta), vaihe `hash1`. Runko ei liiku. Aiemmat `hp = S.fam.harp(t)`
  ja `strings.forEach` poistettu.
- r. 517: `pond.u.uGlint` = `0.55 + 0.3 * treeStr(t) + 0.4 * night` (ei enää `S.fam.harp`; peili `mem` ennallaan).
- r. 636: varisten y-paikkaan lisätty varisoksan kierto (`(pos[0] - perchX) * perch.g.rotation.z * land * (1 - rg)`), jotta ne istuvat
  liikkuvalla oksalla eivätkä irtoa siitä. Varisten ST/EDGE/RING-paikat ja olennot ovat ennallaan.
- Varisoksan B1 pinta nostettu 0,4 yksikköä vanhaa (harpun puoli-oksan) linjaa ylemmäs, koska jalat jäivät ensimmäisessä
  stillissä noin 0,4 oksan yläpuolelle (still 268 ennen korjausta). Nyt jalat osuvat oksan pintaan.
- Kommentit ja otonimi: "harppupuu" → "kuollut puu" (r. 4, 219, 315, 629).

## Mittaus: mikä oksia ohjaa

Pelkkä `S.fam.strings` ja `S.fam.harp` (tasoitus kuten `signals.js`), `build/demo400`, välillä 244–396 s:
- `strings` on 0,02–0,10 monissa kohdissa (244–260, 268–284, 292–296, 324) ja 0,3–1,0 jousten soidessa (264, 300, 308–320, 328–372, 380, 388–396);
  portti `tk` on silloin 0 ja 1.
- `harp` oli 0,08–1,5 koko jakson ajan, vaikka harput eivät soita (partituuri, D8-rivi): kanava on kohinaa. Siksi `uGlint` ei käytä sitä.

## Stillit (`runs/muste-1230/kierros4/osa2/stillit/`)

Pyydetyt: `t244.0.png`, `t252.0.png`, `t262.0.png`, `t300.0.png`, `t340.0.png`, `t380.0.png`. Lisäksi `t268.0.png` (otto 2.2f, varikset oksalla),
`t300.1/300.2` (värähtelyn vertailu), `t308.*`. Kontaktiarkki 243–400 s (joka 4. s, 40 kuvaa, 5×8):
`runs/muste-1230/kierros4/osa2/kontakti_243-400.jpg` (lähdestillit `kontakti_stillit/`).

Mitä stillit näyttävät (vain se, minkä kuva näyttää):
- 244, 252, 262: kuvassa näkyy vasemmassa reunassa vain puun musta, hieman kaareva runko; harpun muotoa ei ole. Ritari istuu rungon oikealla puolella juuren lähellä (244: pistoksen otto).
- 268 (2.2f): puussa on pitkä, oikealle nouseva paljas oksa, ja kolme varista seisoo sen päällä, jalat oksan pinnalla. Oksan alla riippuu lisäoksa ja
  kärjessä nousee ohut lisäoksa. Rungon vasemmalla puolella lähtee oksa ylös vasemmalle. Ritari on oksan alla.
- 300: runko, varisoksa ja sen päällä kolme varista; vasemmalla ylhäällä oksat. Ei kieliä eikä kaulaa. Ritari makaa lähikuvassa rungon vieressä, olennot lammen rannalla.
- 340: puu ei ole kuvassa (otto 2.5b lammen peilistä; vain taustan kuolleet puut). Peili ja aurinko ennallaan.
- 380 (2.6 piiritys): vasemmalla runko ja varisoksa, kaksi varista oksalla ja kolmas oksan alla lentäen piirityksessä; ritari rungon juurella viiri kädessä.
- Värähtely: kohdassa 300 s oksan yläreunan mustan jakson reuna siirtyy 3–5 px (300.0 → 300.1 sarakkeessa x=700: 144 → 149 px) ja palaa 300.2:ssa; 308 s:n
  stillissä puu ei ole kuvassa. Kohdassa 268 s portti on 0, ja oksat ovat paikallaan.
- Kontaktiarkki: puu on musta kuollut puu kaikissa otoissa, joissa se on kuvassa; varikset istuvat oksalla 267–299 s ja 355–399 s (piirityksessä osa lentää). Muuten kuva on ennallaan (taivas, lampi, peili, olennot).

## Ei tehty / avoin

- Värähtelyn amplitudi on pieni (enintään 0,04 rad ≈ 0,15 yksikköä oksan kärjessä), joten yksittäisestä stillistä sitä ei näe; näkyy vain liikkeenä tai parista stillistä (yllä).
- Ei osarenderiä eikä mittauspatteristoa (briefin mukaisesti). `camcheck`, `kohtauscheck` ja `videotarkistus` ajamatta.
- Muut tiedostot viittaavat vielä "harppupuuhun" (ei koskettu): `visual/muste/scenes_2.js` r. 7 ja 13, `visual/muste/vastaukset.json` r. 463 (`elementti`-teksti),
  `docs/ohjaus.md` 2.1–2.2 ja storyboard. Ohjaajan päivitettävä.
- Varisten EDGE-paikat (muistoaika, y 4,05–4,4) ovat oksan yläpuolella; olentoja ei muutettu (D9).
