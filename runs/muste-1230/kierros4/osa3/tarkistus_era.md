# Korjauserä v6, osa 3 (brief_era_osa3): tarkistus

Ajettu 1.11.2026, vain stillit (`--workers 2`). Kuvat: `runs/muste-1230/kierros4/osa3/era/` (`ennen/`, `stillit/`, `final/` = briefin ajat, `final_604-608.png`, `final_1104-1108.png`, `c10f_*` ja `yo_*`, `lk_*` ennen/jälkeen-vertailut). Muutetut tiedostot: `loc_shore.js`, `main.js` (luonnoslohko). `scenes_3.js` ei muuttunut.

| # | Kohta | Muutos | Kuva näyttää |
|---|---|---|---|
| 1 | B9, uni 1077–1098 | `loc_shore.js` ~793–805, ~1121–1135: kaislikon reunan olennot `critters_swamp.js`:stä mittakaavalla `SCB` (kerroin `FARB` 3,4 mitattu kuvasta); hyttysen reitti kuun kiekon yläpuolelle (kiekko projisoidaan hyttysen tasolle, y ≥ kuun yläreuna + 1) | 1085/1090/1095: ritari 230 px; sorsa ~0,38, haikara ~0,45, sammakko ~0,22, hyttynen ~0,2 ritarin korkeudesta; hyttynen ylärekisterissä, ei kuun päällä; haikara ei kuun päällä |
| 2 | C10, 606,27 | `loc_shore.js` ~315 (`heroState`): käännös vasemmalta järvelle (T.va3+0,5…+2,0) tehdään leveyskertoimella `sx` (profiiliin ja takaisin), peilaus kapeimmillaan. Syy: `facing`-peilaus vaihtoi viitan ja käden puolta yhdessä ruudussa. Käden nosto (`call2`) oli jo 2,4 s, ei muutettu | `c10f_jalkeen_sheet.png` (ruudut 605,8–607,6): ritari kapenee profiiliin 606,2 s ja leviää, viitta ei vaihda puolta; käsi nousee hitaasti 606,8 alkaen. Profiili on lähes neulan kapea ~0,3 s |
| 3 | L_yo_kuivuu 1104–1107 | `loc_shore.js` ~1072–1085 ja ~1030: ritarin hengitys (sin, jakso 5,2 s: viitan korkeus ±3 %, pään ja käsivarren kallistus), vyön signaaliin hidas aaltoilu (3,1 s), veden välkkeeseen hidas aaltoilu (3,7 s); kaikki hs-1…hs+11 s, eli kuivumiseen asti | `final_1104-1108.png`: vyön vapaa pää, pään kallistus ja välke vaihtelevat 1104–1107; vaikutus on hillitty (ruutuero 0,25 s välein noin +0,1…0,2 vs. ennen) |
| 4 | Otto 64 (811) | `loc_shore.js` ~537 ja ~913: 3.13:n kulkuvaiheessa viivan reitti y 3,4 -> 6,4 ja z 0,15 -> -0,6 (ohi ja yläpuolelta); `press` x 0,3 `fig`-jaksossa (leveys 0,42 x 0,3 ≈ 0,13) | `stillit/o64_sheet.png`, `final/t811.0.png`: ohut nauha ritarin ja viirin yläpuolella, ei päällekkäisyyttä |
| 5 | Otto 83 (1118) | `main.js` ~276: `post.rtS.texture.wrapS/T = MirroredRepeatWrapping`. Syy: `skEdge` (ink.js) luki kuvan reunassa yhtä rasteripistettä (ClampToEdge), mikä piirsi pystysuoran pisteviivan vasempaan reunaan. Ajoitus (`washAt`, `sk`) ennallaan | `lk_zoom.png` (ennen) vs `lk_zoom2.png` (jälkeen), `lk_jalkeen_sheet.png`: vasemman reunan pisteviiva poissa 1112–1122 s |

Rajaukset: (a) rintaman `front`-reuna on ink.js:n shaderissa (`uSk*1.3 - x*0.7 ...`); sen pehmennys vaatisi shaderin muutoksen eikä ollut sallittu, joten ei tehty. Havaittu vika oli reunan pisteviiva, ei rintama. (b) Muita käännöksiä (esim. 3.5, 3.7, 3.11) ei korjattu; ne käyttävät samaa `facing`-peilausta ja voivat näyttää saman hypyn. (c) Videota ei renderöity eikä `camcheck`/`videotarkistus` ajettu.

## Lisä: kaikki ritarin käännökset (`facing`) leveyskertoimella

`loc_shore.js` `heroState` (~273–347): `facing` on vain suunnan merkki, joten sen vaihtuminen peilasi hahmon yhdessä ruudussa. Nyt jokainen käännös tehdään yleisesti `sx = max(0,12, |f|)` (profiiliin ja takaisin, peilaus kapeimmillaan); 3.6:n erillinen paikkaus poistettu. Lisäksi 3.5 `Math.sign` -peilaus (yhden ruudun vaihto) korvattu pehmeällä `clamp(1,5·sin)`:llä, sarkasmin (M4) käännös 0,6 s -> 1,6 s, ja 3.5:n ilo-jakson sisään- ja ulosramppi 0,5 s -> 1,9 s. Veneessä `f = B.dir` (jatkuva cos) kutistaa ritarin veneen mukana (3.19). Ajat ankkureista (T.*, M1–M4), ei kovakoodattuja sekunteja. Ruudut 10 fps ±1 s: `era/turns/`, `era/turns2/`, arkit `era/turn_*.png`.

| otto | käännöksen aika (s) | kesto | ruudut |
|---|---|---|---|
| 3.1 | 426,7–428,4 | 1,7 s | kapenee 427,3–427,6 viivaksi, leviää; ei hyppyä |
| 3.3 | 472,0–473,3 | 1,3 s | aurinko-otto, ritari pieni siluetti pohjalla; ei hyppyä |
| 3.5 ilo | 536,0–537,5; 539,3–540,9; 542,6–544,2; 545,9–547,5; 549,0–550,8 | 1,5–1,8 s | jokainen kapenee ja leviää pehmeästi (viimeinen ramppi pidennetty, ennen 0,5 s) |
| 3.5 pyörähdykset | 554,4–558,7; 559,8–563,2 | ~1 s/kapeikko | kaksi pyörähdystä, kapeikot 556,7–557,2, 558,4, 559,9–560,6; ei hyppyä |
| 3.5 sarkasmi (M4) | 580,9–582,4 | 1,6 s | leikkaus 581,2; kapeikko 581,5–581,7 |
| 3.6 | 605,6–607,0 | 1,5 s | kapeikko 606,2 |
| 3.7 | 622,6–624,0 | 1,5 s | kapeikko 623,2–623,3 |
| 3.11 | 730,1–732,0 | 1,9 s | kapeikko ~730,7–731,3 (rajaus arkissa rajussa lähikuvassa) |
| 3.19 (vene) | 970,4–974,7 | ~4 s | ritari kutistuu veneen mukana (972,2–972,5), ei peilihyppyä |

Rajaus: kapeimmillaan ritari on 12 % leveä (neulan kapea) noin 0,2–0,3 s.
