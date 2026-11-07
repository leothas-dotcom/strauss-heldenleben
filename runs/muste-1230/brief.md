# Ajo: muste-1230 – "Punainen muste" (A-puoli, 0–1240 s)

**Pyyntö (käyttäjä, 30.10.2026):** kuvakäsikirjoitus tyyliohjeen ja kuunteluoppaan pohjalta koko
A-puolelle, sitten visualisoinnit ja kuvallinen drafti, sitten renderi. Disney-henkinen: seuraamme
sankaria, joka tekee asioita tunnemaisemissa. Sankari on musteella tehty ja hajoaa friisiksi.
Melodiaviiva seuraa sävelkorkeutta (sankariteema tarkasti, sooloviulu suuntana). Työtapa: Claude
ohjaa, sonnet-aliagentit rakentavat.

**Kuvakäsikirjoitus:** [storyboard.md](storyboard.md) · **Tarkistus:** [tarkistus.md](tarkistus.md)

## Idea yhdellä lauseella

Punaisesta musteesta maalattu käyrätorviritari nousee laaksosta myrskyvuoren sädekehään, istuu
suon arvostelijoiden keskellä ja muistaa aamunsa, kohtaa sooloviulun valkoisen viivan ja soutaa
kuutamojoella sen kanssa, kunnes kolme viiriä kutsuvat taisteluun ja A-levy kääntyy.

## Uutta tässä ajossa

- `docs/visuaalinen_tyyli.md` luku 18: elävä muste ja Disneyn opit (tutkimukset `docs/tutkimus_disney.md`,
  `docs/tutkimus_muste.md`).
- `analysis/teemaviiva.py` + `annotations/sankariteema.json`: sankariteema muodoltaan partituurista,
  säveleltään äänestä.
- `analysis/viuluviiva.py`: sooloviulun suunta spektrin painopisteenä.
- `analysis/jatkuvuus.py`: välkynnän ja hyppyjen tarkistus (ei vielä ajettu tähän renderiin).
- `render/draft.mjs`: still + slate jokaisesta kohtauksesta.
- `visual/muste/`: brush.js (veto, teemaviiva, inkHero, roiske), companion.js, loc_river.js,
  loc_battle.js, record.js, scenes.js, main.js, ja torviritarin paikat korjattuina.

## Komennot

```
node render/draft.mjs --page visual/muste/index.html --dir runs/muste-1230/drafti
node render/camcheck.mjs --page visual/muste/index.html --data build/demo400 --max 20
node render/kohtauscheck.mjs --page visual/muste/index.html --data build/demo400 --step 15
node render/render.mjs --page visual/muste/index.html --data build/demo400 --out runs/muste-1230/renders/heldenleben_muste_1240s.mp4 --workers 2 --fade-out 3.5
```
