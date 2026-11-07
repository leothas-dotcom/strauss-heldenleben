# Osa 4, kierros 2: Taistelu (`wal_kulissi1` → A-puolen loppu, 1126–1240 s)

*Ohjaajan brief 31.10.2026. Omat tiedostot: `visual/muste/scenes_4.js`, `loc_battle.js`, `record.js`. Yhteisiin
tiedostoihin ei kosketa; perustan rajapinnat (`sash`, `sashSignal`, paperisiirtymä): `runs/muste-1230/perusta3/tarkistus.md`.
Osa 3 kertoo `runs/muste-1230/pyynnot.md`:ssä, millä `sash`-arvolla ritari saapuu.*

Lue ensin: `docs/palautelista.md` (A8, A11, C8, C10), `docs/ohjaus.md` luku 4, `docs/kuvasaannot.md`,
`docs/visuaalinen_tyyli.md` luvut 7–8, 18, `runs/muste-1230/storyboard.md` kohtaukset 61–65,
`runs/muste-1230/kriitikko/index.md` (C8, A8).

## Korjattavat, todisteineen

| # | Aika | Mitä ruuduissa näkyy nyt | Mitä pitää näkyä |
|---|---|---|---|
| A8 (alkupää) | 1124–1128 s | yksi ruutu haalistunutta taistelukenttää ennen jaksokorttia IV | taistelukenttä painuu luonnoksen päälle perustan siirtymällä; ei puoliksi haalistunutta välivaihetta; jaksokortti IV samaan aikaan kuin kenttä on painunut |
| A11 (taistelu) | 1126–1240 s | – | ritarilla kumppanin valkoinen viiva kietoutuneena (`sash`), ja **viulun teemat taistelussa näkyvät tässä viivassa**: `sashSignal` = mitattu viulukanava (`panns_violin_fiddle` / `stem_vocals`); kun viulut huutavat, viiva leimahtaa ja laajenee, kun ne vaikenevat, se painuu kehoon. Erillistä kumppanin viivaa taivaalla ei enää ole. |
| C8 pieni | 1160–1224 s | musta läiskä peittää ritarin; salama vain musta piikki; levyksi vaihtuu kerralla | ritari pysyy luettavana (läiskät eri syvyydessä, eivät ritarin päällä); salama on paperinvalkoinen siksak mustalla ääriviivalla (paperin leikkaus); `wal_puolenvaihto` → loppu: kenttä **kiertyy** levyn uraksi vähitellen, ei leikkausta levyyn |
| C8 eleet | koko alue | – | tarkista stilleistä, ettei viirin lyönti näytä suoralta käsivarrelta viistosti ylös eteen; lyönti on kaari, viiri tekee iskun |
| iskut | 1126–1240 s | `videotarkistus.py`: iskut ok | säilytä: `aksentit.json`:n z ≥ 9 iskut salamoina/läiskinä ruudun tarkkuudella |

## Valmis tarkoittaa

1. Stillit 1 fps 1124–1132, 0,5 fps 1126–1240 → `runs/muste-1230/osa_4/stills2/` + kontaktiarkki.
2. Osan renderi `--start 1126 --end 1240` → `runs/muste-1230/osa_4/renders/osa4_v2.mp4` (yksi renderi kerrallaan,
   kirjaus `pyynnot.md`:hen).
3. `analysis/jatkuvuus.py` osan renderille `--start 1126`: hypyt vain iskuissa.
4. `analysis/kriitikko.py` + tuore tarkistaja-aliagentti (model: sonnet): A8 (alkupää), A11, C8 OK.
5. `camcheck --max 20`, `kohtauscheck --step 15`: 0 ylitystä.
6. Raportti `runs/muste-1230/osa_4/tarkistus2.md` todennuksineen.

Kielletyt: yhteisten tiedostojen muokkaus, kovakoodatut sekunnit, kehon reaktio iskuun, koko puolen renderöinti.
