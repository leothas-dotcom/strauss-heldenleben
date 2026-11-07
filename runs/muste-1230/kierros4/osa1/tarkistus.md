# Kierros 4, osa 1: liikkeet yhdeksi kaareksi (E1 huipun pilvet, E2 alun aurinko)

Ohjaajan tarkennus 1.11.: ei mittauspatteristoa (jatkuvuus.py ja camcheck jätetty pois); stillit, 4 fps sarja,
kontaktiarkki ja yksi liikekayra-ajo kummallekin kohdalle.

## Muutetut rivit

`visual/muste/loc_storm.js` (E1):
- r. 358-361: `gap` = YKSI kaari `smoothstep(0,1,u^1,25)`, u = (t - tChord)/(tTab - LEAD - 0,5 - tChord). Alkaa ankkurissa
  `held_dom7_sointu` (229,0 s), perillä 233,5 s eli ennen leikkausta tabloon (234,07 s). Aiempi ikkuna tChord-2...tChord+2,5 poistettu.
  Sama `gap` ohjaa pilviä, taivaan sameuden repeämää ja valkenemista (ei toista ikkunaa).
- r. 382-383: aurinko alfa 1 (`t < tStorm ? 1 - dm : 1`); `smoothstep(tChord, tChord+3)`-häivytys poistettu.
- r. 394-401: pilvet: jokainen väistyy `gap`-kaarella näkymän ulkopuolelle sekä oton 23 että tablon kamerasta
  (`goLeft` kantapaikasta, `xf` = reunan ulkopuolella; jo ulkopuolella oleva pilvi ei liiku). Vanha `clear - |dx|` poistettu
  (siitä jäi vasemman yläkulman pilvi valumaan). Perillä pilvet ovat poissa molempien kameroiden kuvasta, joten leikkaus ei muuta taivasta.

`visual/muste/loc_valley.js` (E2), r. 265-275:
- `sunY` = `-10 + 180 * smoothstep(0,1,u^1,9)`, u = (t - T0)/(tEnd - T0): yksi kaari T0 -> tEnd, nopeus kasvaa vaskien (tBrass) jälkeen,
  ei pysähdyksiä välissä (vanha: kolme peräkkäistä smoothstepia).
- Taivas: `skyP = 1 - (1-u)^1,65` ohjaa `uBlackTop = 0,85 (1-skyP)^1,5` ja `uBlueH = -0,25 + 0,7 skyP` (vanha: kolme ikkunaa);
  `uRedAmt` käyttää `sunF`:ää (vanha ikkuna tBrass...tEnd). Usvaan ei koskettu (sen liike ei ollut ikkunoita; ei pyydetty muutettavaksi).

## Mittaus (`analysis/liikekayra.py`, osarenderit; render-aika = oikea aika - 224 s / - 6 s)

Huomio työkalusta: `np.convolve(mode='same')` täyttää reunan nollilla, joten oletusasetuksella (`--smooth 0.3`) jokaisen ikkunan
ensimmäinen 0,1 s lasketaan "nousuksi", jos alkuarvo on > 0. Siksi tulokset on annettu myös `--smooth 0.1` (ei reunavaikutusta).

E1 (huippu_224-241.mp4):
- pilvet `--start 2 --end 10.2 --crop 0,0,1920,620 --mode cover --thr 110 --smooth 0.1`: **YKSI KAARI**, nousee 230,0-233,4 s (kuvaaja
  `liike_huippu_pilvet_s0.1.png`); sitä ennen paikallaan (pilvet eivät liiku ennen 230 s), 234,07 s lopussa leikkaus tablon kuvaan.
  Oletusasetuksilla: "EI YKSI KAARI (2)" vain reunan 0,1 s:n takia (`liike_huippu_pilvet.png`).
- aurinko, briefin crop `0,0,1920,700 red-y`: EI YKSI KAARI (2), koska crop sisältää viirit ja leikkauksen 229,0 s ennen kuin aurinko
  näkyy; aurinkoalueella `--crop 400,0,1200,430 --start 6.5 --end 10.0 --mode red-y --smooth 0.1`: **YKSI KAARI**
  (`liike_huippu_aurinko_alue_6.5.png`; aurinko tulee näkyviin 230,7 s pilven reunan takaa täysvärisenä, ks. `sonne_reveal_230.3-231.3.jpg`).
  Ikkunalla 5.5 alkaen: 2 jaksoa, ensimmäinen 0,1 s "laskee" on punapikselien puuttumisen (cnt < 20) reunaartefakti (`..._s0.1.png`).

E2 (alku_6-48.mp4):
- aurinko, briefin crop `0,0,1920,560 red-y` 26-46 s: EI YKSI KAARI (5 jaksoa, 3 taukoa), koska crop ottaa mukaan viirien yläreunat ja
  punaisen taivasrasterin (taukokohdat 32,3-33,2 s ja 35,7-36,2 s); `liike_aurinko_brief.png`. Aurinkoalueella `--crop 600,0,900,400 --start 24 --end 33.3`
  (30-39,3 s): yksi yhtäjaksoinen nousu 31,4 s (aurinko harjanteen yli, tBrass) -> 39,3 s, nopeus kasvaa (red-y/s 0,014 -> 0,057), ei taukoja
  (`liike_aurinko_alue_24.png`; ensimmäinen 0,1 s on reunaartefakti).
- taivas `--start 2 --end 33.3 --crop 0,0,1920,400 --mode luma --smooth 0.1` (8-39,3 s): **YKSI KAARI**, pysähdyksiä liikkeen sisällä 0
  (`liike_taivas_8-39_s0.1.png`). Kirkkaus (stillien keskiarvo): 16 s 50, 20 s 64, 24 s 85, 28 s 107, 32 s 125, 36 s 139, 38 s 146 (3-6 luma/s).
  Alku 8-16 s on hidas (0-3 luma/s) ja jää "paikallaan"-luokkaan, koska vmin = 3 % laajuudesta/s; kirkkaus kuitenkin kasvaa. Oletus `--smooth 0.3`: 6 jaksoa
  (nopeus heiluu vmin-rajan ympärillä 31-36 s). `--vmin 0.02`: 3 jaksoa (`liike_taivas_8-39_vmin02.png`). Briefin alue 8-46 s sisältää leikkauksen
  39,44 s (tHeroes, kameran vaihto), joka pudottaa cropin kirkkauden 153 -> 105, joten mitattu 8-39,3 s. 15 s kohdan pieni pudotus on otsikkokortin
  ("Der Held") poistuminen, ei taivas.
- Ennen (briefin mittaus v3:sta): E1 kolme mekanismia, vasemman yläkulman pilvi valuu 231-234 s; E2 5-6 liikkuvaa jaksoa, pysähdykset 31,0-33,4 ja 39,7-40,9 s.

## Kuvat (silmin katsottu)
- `huippu_stillit.jpg` (226; 227,5; 228; 229,5; 231; 232,5; 233,5; 234; 234,5; 236 s): aurinkoa ei näy ennen 230,7 s (pilvet ja sameus peittävät),
  232,5 s alkaen pilvet poissa, 233,5 ja 234,0 s (ennen leikkausta) ja 234,5 s (tablo) taivas tyhjä pilvistä, aurinko kokonaan huippumuurin vasemmalla
  puolella (A13 säilyy), tablossa kruunun kärjet ennallaan. Yksittäiset stillit `stillit/t*.png`.
- `huippu_pilvet_227.5-235_4fps.jpg` (4 fps, 5x6, 0,25 s per ruutu, alkaen 227,5 s): pilvet väistyvät yhtenä liikkeenä 230-232 s, aurinko ei ilmesty haaleana;
  `sonne_reveal_230.3-231.3.jpg` (10 fps).
- `alku_stillit.jpg` (28, 31, 33, 36, 39, 41, 44 s) ja `alku_kontakti_8-46.jpg` (1,5 s välein): aurinko nousee yhtenä kaarena, taivas kirkastuu ilman portaita.
- Osarenderit: `huippu_224-241.mp4`, `alku_6-48.mp4` (+ `_kontakti.jpg`).

## Huomioita
- Aurinko pysyy huipussa piilossa kuvasta ennen 230,7 s sameuden ja pilvien takia (stillit 226-229,5 s); alfa 1 -vaihto kohdassa tStorm tapahtuu piilossa.
- Nopeus: vain kaaren keskiosa (230-232,5 s) näkyy pilvien liikkeenä, koska pilvet matkaavat kuvan reunan ulkopuolelle; kaari alkaa silti ankkurissa 229,0 s.
