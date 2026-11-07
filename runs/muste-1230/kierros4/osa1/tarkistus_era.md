# Korjauserä v6, osa 1 (0–240 s)

Luettu: `docs/visuaalinen_tyyli.md`, `docs/kuvasaannot.md`. Muokattu vain `loc_valley.js` ja `loc_storm.js`; `loc_sea_muste.js`, `loc_meadow.js`, `scenes_1.js` eivät muuttuneet.

## Muutetut rivit
`visual/muste/loc_valley.js`
- B8: `snapAt` (r. 129) = 0 ennen `S.A(id) - S.LEAD`, sillä hetkellä 1 ja sen jälkeen `exp(-(t-(h-LEAD))/dec)` (välitön nousu, hidastuva palautuminen). `hitSweep` (r. 132) alkaa samasta hetkestä.
- Viiri piirretään tuulihistoriasta (`wind(t - k*dt)`), joten pelkkä jyrkkä snap olisi edennyt viirin yli aaltona. Siksi `windAt` lukee iskupuuskan nykyisen ruudun ajasta (`nowT`, asetetaan `update()`:n alussa, r. 178–182, 258): koko viiri napsahtaa iskun ruudulla. Trumpettien nuotinalut (`tptFlick`) käyttävät entistä pehmeää `softSnap`ia (ei muutosta).
`visual/muste/loc_storm.js`
- D3: `swayPose`/`swayOn` (r. 168–174): seisova hahmo huojuu ja hengittää marssin jälkeen (sankari ja 7 toveria; paino 0 marssiessa). `creep` (r. 176): kameran x-liuku nousee pehmeästi 0 -> 0,3 yks/s marssin loppuessa ja jatkuu leikkaukseen (otto 16). Käytössä `leaderState`:ssa (r. 215), `mateFlat`:ssa (r. 304) ja oton 16 kamerassa.
- E1 (jäämäpilvi): vasemmalle väistyvän pilven `xf` marginaali -8 -> -40 (r. ~403). `gap`-kaari ja ajoitus ennallaan.
- Otto 19: aurinkojen alfa ennen väistöä `smoothstep(0, 0.05, gap)` (oli 1) (r. 400).

## Mittaus
`videotarkistus.py --start 0` osarenderistä 0–48 s (`videotarkistus_era_0-48.txt`): ääni 0,00 ms; held_isku_t6 17,64 OK (oikea ruutu 17,633, suurin muutos 1,8 vs. ympärillä 0,4), held_isku_t8 21,62 OK (21,600, 2,2 vs. 0,2), held_isku_t11 27,50 OK (27,467, 2,8 vs. 0,7); jähmettymiä 0; KAIKKI KUNNOSSA.
Jähmettymä 140,87 s: osarenderi 138–142 s (`era_138-142.mp4`), ruutujen välinen muutos 140,0–141,0 s on 0,22–0,56 (raja 0,08), eli koko jakso liikkuu; 141,0 s on leikkaus.

## Stillit (`runs/muste-1230/kierros4/osa1/era/`)
- `isku_t6_17.6-17.67.png`: 17,60 s viirit pieniä ja tuuli tyyni; 17,67 s kaikki viirien kärjet nousseet ja venyneet vasemmalle, tuuliviivat ilmestyneet; ritarit eivät liiku.
- `jahmettyma_140.5-141_10fps.png`: rivi ritareita marssin jälkeen seisten, viirit ja asennot elävät; 141,0 s uusi otto (1.11).
- `pilvet_231-234_4fps.png`, `t232.0.png`: 232,0 s taivas vasemmalla ja oikealla pilvetön, aurinko vapaana; mustaa pilveä ei ole.
- `aurinko_224-230.png`, `t226.0.png`: 224–227,5 s huipun reunalla ei punaista laatikkoa; aurinko ilmestyy vasta pilvien väistyessä (230,5 s ei vielä).
- `t041.0.png`: otto 2, kahdeksan ritaria; maassa valkoisia rasteripilviä jalkojen välissä.

## Taulukko: otto | elementti | lähde | päätös
| Otto | Elementti | Lähde | Päätös |
|---|---|---|---|
| 2 (40,5–41,7 s) | valkoiset rasterikappaleet maassa | `puffs` (loc_valley.js): patarummun pölypilvet harjanteen reunalla, ajat `aksentit.json` `patarumpu.lyonnit` 40,548 / 40,937 / 41,097 (`S.strokesIn`), soitin = patarummut = maan pöllähdys (kuvasääntö 8, tyyliohje luku 8 sivutoiminta) | pidetty, ei muutosta |
| 19 (224–228 s) | pieni punainen laatikko huipun reunalla | taivaan aurinko (`uSun`, loc_storm.js) pilkotti myrskypilvien raosta ennen väistöä (still 226 s) | aurinko piilossa kunnes `gap` > 0 (alfa `smoothstep(0, 0.05, gap)`); stillit 224–227,5 s ilman laatikkoa |

Huomio: otto 19:n korjaus koskee auringon alfaa, ei `gap`-kaaren ajoitusta; ohjaaja arvioikoon, lasketaanko se E1-kaareen kuuluvaksi.
