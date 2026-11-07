# Kierros 4, osa 1: pienet jämät ja vedon häntä (0–240 s)

Luettu: `docs/visuaalinen_tyyli.md` kokonaan, `docs/kuvasaannot.md`, `kriitikko_v3b/index_tayt.md` (otot 0–21, bugi 10, luku 6).
Muokattu vain: `visual/muste/loc_storm.js`, `loc_meadow.js`, `loc_valley.js`. `loc_sea_muste.js` ja `scenes_1.js` luettu, ei muutoksia.
Huipun pilvien, auringon ja sädekehän logiikkaan (E1: `gap`, `xf`, `uSun`, `uRays`) ei koskettu.

## Muutetut rivit

`loc_storm.js` (otot 14–15, bugi 10):
- r. 26: `heroGate` tuotu `brush.js`:stä (sama portti kuin tipTrailin oletus).
- r. 300–308: `bandTip` kulkee leikkaukseen asti (`tCut = tSteps - S.LEAD`, sama hetki kuin 1.12-oton alku) eikä `tSteps + 0,2`:een.
  `bandOut(t)` kuivattaa koko vedon viimeisen 2,4 s aikana nollaan leikkaukseen mennessä (kasure: muste ehtyy fraasin loppuessa).
  Vedon x-matka (21 yks.) on sama kuin ennen, nyt vain jaettu `tCut - tReun`:lle.
- r. 311: `band`-vedon `gate = heroGate(S, tt) * bandOut(bandNow)`.
- r. 483–484: `bandNow = t` ennen `band.set`; iän venytys `mix(1.1, 0.5, smoothstep(tCut - 2.4, tCut, t))` (vanha: 0,3 ja alkoi vasta `tSteps - 0,5`).
  Vanha häntä jäi kuivumaan leikkauksen jälkeen uuteen kuvaan: nyt leikkaushetkellä vetoa ei ole jäljellä.
- r. 400–413 (otto 16, pilvet): `roll = 400 * (1 - smoothstep(tFall, tStorm + 4, t))` (oli `260 * (1 - smoothstep(tFar, tStorm + 10, t))`) ja
  `m.visible = t > tFall - 1` (oli `tFar - 5`). Pilvet vyöryvät vasta putouksesta (ohjaus 1.14–1.15), eikä mikään pilvi ole 1.13-oton kuvassa.
  Rivit ovat samassa `forEach`-lohkossa kuin E1-pilvet, mutta E1:n `gap`, `goLeft`, `xf` ja `m.position.x`-rivit ovat koskemattomat;
  `roll` on 0 jo ennen tChord-ikkunaa (tStorm + 4 = 203 s; ennen 209 s), joten huipun pilvet käyttäytyvät samoin kuin ennen.

`loc_meadow.js` (otot 10, 11, 12):
- r. 40–41: kymmenen paperinväristä taivaspilveä (`cloud`, raster 0,06, z −100) poistettu.
- r. 55–57: välkerenkaiden `harpOns` rajattu ikkunaan `tKneel` ... `tDuet` (`held_t49` → `held_reh6`).

`loc_valley.js` (otto 1):
- r. 41–42: `midLine` (vuorten ääriviiva) oli `ink(C.black, raster 0,4)`, leveys 0,2. Nyt `ink(C.blue, { shade: C.paper, raster: 0.55 })`, leveys 0,16:
  haalea rasteroitu lyijykynäviiva, ei musta murtoviiva.

## Taulukko: otto | elementti | lähde | päätös

| Otto | Elementti | Lähde | Päätös |
|---|---|---|---|
| 1 (7,6–39,4 s) | ohut musta murtoviiva vuorten yli | koodissa `midLine`: vuoren lyijykynäluonnos ennen berliininsinistä (`held_viulut`). Lähde: ohjaus 1.1 / scenes_1 rivi 1 "vuoret paperia ja lyijykynää"; tyyliohje luku 12 kohta 1 "haalea lyijykynäluonnos vuorista". Ei soitinta (taustaa) | **Pidetty, korjattu lähteen mukaiseksi:** musta → haalea rasteroitu sininen, ohuempi (stillit 12 s ja 20 s) |
| 9 (98,1–99,0 s) | rasteriroiske veneen perässä | koodissa `crest` (loc_sea_muste.js): ohjaus 1.7 "ylittää aallon harjan; harja murtuu" ankkurissa `held_huippu1_kohta` (97,5 s), kesto alle 1,2 s; kuvasääntö 15 (isku = yhden elementin teko, roiske). Sijaitsee aallossa veneen edessä, ei perässä | **Pidetty, ei muutosta.** Stilli 98,4 s: rasteroitu vaahto aallon harjalla; stillit 60, 75, 90 s: roiskeita ei ole |
| 10 (99,0–102,3 s) | auringon valkoinen vaakaleike | loc_meadow.js:n paperinväriset taivaspilvet (ei soitinta, ei ohjausriviä), jotka kulkivat auringon kiekon yli | **Poistettu** (pilvet). Stillit 101,2 ja 104 s: aurinko ehjä |
| 11 (102,3–108,5 s) | valkoiset väreenrenkaat vedessä | harput pp: kuunteluopas A 1:42.3–1:48.5, cues `held_t49` (lead flute, violins, harps), scenes_1 rivi 14, roolit.json harput = välkerenkaat. Ohjaus 1.8 -taulukko ei mainitse harppua, mutta kuunteluopas ja cues mainitsevat | **Pidetty.** Renkaat vain mitatuista harpun nuotinaluista; ikkuna rajattu `held_t49` → `held_reh6` (jakson jälkeen ei uusia renkaita). Still 104 s: kolme rengasta; still 119 s: ei renkaita |
| 12 (108,5–125,4 s) | himmeät harmaat viirut taivaan yläreunassa | samat meadow-pilvet kuin otossa 10 (paperi, raster 0,06 paperitaivasta vasten = harmaita raitoja) | **Poistettu** (pilvet). Stillit 110 ja 119 s: yläreuna tasaista paperia ja rakeita |
| 16 (171–180,5 s) | tumma lohko ruudun oikeassa reunassa (~1900,430 px, still 177 s) | loc_storm.js `stormClouds`: ensimmäinen pilvi ajautui oton 1.13 oikeaan reunaan, koska pilvet näkyivät `tFar - 5`:stä. Ohjaus: pilvet vyöryvät vasta 1.14–1.15 | **Siirretty:** pilvet tulevat näkyviin vasta putouksesta (`tFall - 1`) ja alkumatka on 400. Still 177 s: oikea reuna vapaa; ohjauksen "myrskyvuori" ja sädekehän luonnos säilyvät |
| 14–15 (141–171 s) | veto katkeaa leikkaukseen, häntä kelluu | ohjaus 1.11 "iso veto piirtyy niiden yllä teemana" (`held_reh8` → `held_reh9`); kuvasääntö 10 (kahdeksan torvea yhtenä vetona) | **Veto päättyy ennen leikkausta** (kuivuu 2,4 s aikana). Leikkauksen jälkeen ei häntää |

Lisähavainnot (ei muutettu, ei pyydetty): meren paperipilvet (stillit 60, 75, 90 s, loc_sea_muste.js `clouds`) ovat selvästi luettavia pilviä ilman soitinta;
tiira on auringon kiekon edessä stillissä 98,4 s.

## Stillit

`runs/muste-1230/kierros4/osa1/jamat/` (`--workers 2`, `--data build/demo400`; vertailu ennen muutoksia: `jamat_ennen/`):
`t012.0.png`, `t020.0.png`, `t060.0.png`, `t075.0.png`, `t090.0.png`, `t110.0.png`, `t153.0.png`, `t155.0.png`, `t156.0.png`, `t158.0.png`
sekä lisäksi `t098.4.png`, `t101.2.png`, `t104.0.png`, `t119.0.png`, `t154.0.png`, `t154.4.png`, `t177.0.png`, `t183.0.png`.

Mitä stillit näyttävät:
- **153 s:** leveä punainen veto rivin yllä, vasen häntä jo rasteroitunut; **154,0 s:** veto on hajonnut punaisiksi siruiksi auringon alla; **154,4 s:** taivas vapaa vedosta.
  **155, 156, 158 s:** uusi sivuajo, taivaalla vain aurinko, ei vedon häntää. Viirit näkyvät 155 s:ssä vielä kapeina juovina ja avautuvat 156–158 s:ssä
  (kääritty viiri, ennallaan).
- **12 s:** vuoret paperina, ohut haalea sininen rasteroitu viiva vuorten päällä. **20 s:** sama; viiva ei erotu mustana.
- **60, 75, 90 s:** meri ja vene, ennallaan (loc_sea_muste.js ei muutettu).
- **98,4 s:** rasteroitu harjaroiske aallossa veneen edessä, pilvet ja tiirat ennallaan.
- **101,2 / 104 / 110 / 119 s:** niitty: aurinko ehjä, ei valkoista leikettä eikä harmaita taivasviiruja; 104 s kolme vesirengasta, 110 s yksi, 119 s ei renkaita.
- **177 s:** myrskyvuori ja sädekehän luonnos kuvassa, oikean reunan tumma lohko poissa. **183 s:** putous ja ritari kalliolla, myrskyvuoren kärki oikeassa reunassa, taivaalla ei pilviä.

Ei ajettu: `camcheck`, lavastereunatarkistus, `videotarkistus.py` eikä koko A-puolen renderiä (brief: vain stillit).
