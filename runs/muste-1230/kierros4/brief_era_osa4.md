# Korjauserä v6, osa 4 (1126–1240 s). Tiukka rajaus: vain alla oleva kohta.

*Lue ensin `docs/visuaalinen_tyyli.md` kokonaan (luku 10 "Vastustajat: suon olennot": koot suhteessa ritariin) ja
`docs/kuvasaannot.md`. Lähde: `runs/muste-1230/kriitikko_v5/palaute_tarkistus.md` (C14 otto 88). Omat tiedostot:
`loc_battle.js`, `record.js`, `scenes_4.js`.*

1. **Otto 88 (1180–1223 s):** olentopino oikealla on ratsastajaa isompi. Tyyliohje luku 10: vastustajat ovat ritaria
   pienempiä (hyttynen pään kokoinen, sorsa 0,35–0,4, haikara 0,5, kotilot 0,3–0,35, sammakot 0,2–0,25, varikset 0,3 ritarin
   korkeudesta); taistelussa ne saavat olla parvi, mutta yksittäinen olento ei ylitä näitä, ja parvi ei peitä ritaria eikä
   hevosta (kuvasääntö 22). Skaalaa olennot ja säilytä niiden pyörteet ja saapumiset ennallaan. Salamat, läiskät ja levy
   eivät muutu.

Tarkistus stilleillä: 1150, 1165, 1180, 1195, 1210, 1220 ja kontaktiarkki 1126–1224 2 s välein. `render/nakyvyys.mjs` ei
kata taistelua; tarkista päällekkäisyys silmin stilleistä. Yksi still-ajo kerrallaan (`pyynnot.md` "käynnissä"). Raportti
`runs/muste-1230/kierros4/osa4/tarkistus_era.md`. Vain se, minkä kuva näyttää.
