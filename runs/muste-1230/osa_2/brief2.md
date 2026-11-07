# Osa 2, kierros 2: Vastustajat (`wid_1_huilu` → `gef_viulu`, 243–422 s)

*Ohjaajan brief 31.10.2026. Omat tiedostot: `visual/muste/scenes_2.js`, `loc_swamp.js`. Yhteisiin tiedostoihin ei kosketa;
perustan rajapinnat: `runs/muste-1230/perusta3/tarkistus.md`.*

Lue ensin: `docs/palautelista.md` (C4, C5, C6, C9), `docs/kuvasaannot.md`, `docs/visuaalinen_tyyli.md` luvut 7–8,
`runs/muste-1230/storyboard.md` kohtaukset 25–39, `runs/muste-1230/kriitikko/index.md` (kohdat C4, C6).

## Korjattavat, todisteineen

| # | Aika | Mitä ruuduissa näkyy nyt | Mitä pitää näkyä |
|---|---|---|---|
| C6 **estää julkaisun** (kolmesti hylätty) | 330–410 s (`wid_reh17` → `wid_uusi_hyokkays`, kohtaus 35) | lammessa harmaa pitkulainen muoto ilman harjannetta, aurinkoa tai viirejä; se ei kasva | **Muisto:** tyynen lammen pinnassa aamun auringonnousu (kohtaus 4) ylösalaisin: harjanteen **oikea muoto** peilattuna (sama profiili kuin `loc_valley.js`:n harjanne, ei kartio eikä kolmio), aurinko, heraldiset viirit. Kasvaa aalto aallolta mitatun jousikanavan (`panns_string_section` / `stem_other`) aaltojen mukaan: jokainen aalto lisää yhden osan (harjanne → aurinko → viirit). Ei kovakoodattuja lisäyksiä (`tNight+8` tms.). Samalla ritari nostaa päätään fraasin mittaisesti ja viirin tumma rasteri vaalenee kerroksittain; olennot väistyvät reunoille. Kolme ottoa, sommitelma ei pysy paikallaan. Peili on veden alla, ei hahmon päällä (C5). |
| C4 pieni | 243–330 s | hyttynen, haikara ja sammakot ovat liian pieniä tai ohuita erottuakseen | mittakaavataulukko (hyttynen 0,75, sorsa 0,9, haikara 2,2, kotilot 0,8, sammakot 0,5, varikset 0,7 suhteessa ritariin 2,0) säilyy, mutta viivanpaksuus ja kontrasti nostetaan niin, että olento lukeutuu 1280 px leveästä kuvasta; lähikuvissa ritarin kanssa |
| C9 | 243–330 s | – | jokaisella olennolla yksi ele, joka tulee omasta soitinkanavasta (ei nuotinalun nykäys) |

## Valmis tarkoittaa

1. Stillit 1 fps:llä 330–410 s ja 0,5 fps:llä 243–330 s: `runs/muste-1230/osa_2/stills2/`. Muiston kasvu näkyy
   kolmena vaiheena, ja harjanteen muoto vastaa aamun harjannetta (laita rinnakkain still 36 s:stä).
2. Osan renderi `--start 243 --end 422` → `runs/muste-1230/osa_2/renders/osa2_v2.mp4` (yksi renderi kerrallaan,
   kirjaus `runs/muste-1230/pyynnot.md`:hen).
3. `analysis/jatkuvuus.py` osan renderille: ei hyppyjä iskujen ulkopuolella.
4. `analysis/kriitikko.py` + tuore tarkistaja-aliagentti (model: sonnet): C6 ja C4 OK.
5. `camcheck --max 20`, `kohtauscheck --step 15`: 0 ylitystä.
6. Raportti `runs/muste-1230/osa_2/tarkistus2.md` todennuksineen.

Kielletyt: yhteisten tiedostojen muokkaus, kovakoodatut sekunnit, kehon reaktio iskuun, koko puolen renderöinti.
