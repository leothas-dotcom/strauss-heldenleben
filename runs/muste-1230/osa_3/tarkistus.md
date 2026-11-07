# Osa 3, Kumppani: tarkistus 1.11.2026

Vain se, minkä mittaus tai kuva näyttää. Toteutus: `visual/muste/loc_shore.js` + `scenes_3.js`; vanhat `loc_forest.js`, `loc_river.js`, `scenes_3`-vanha ja vanhat tulosteet ovat `_pois/` ja `osa_3/_vanha/`.

## Mittaukset (422–1125,7 s)
| Tarkistus | Tulos |
|---|---|
| `kohtauscheck --step 15` (1414 ruutua) | tyhjää taustaa 0, kerrosreunan ylityksiä 0 |
| `camcheck --max 20` | 94 ottoa, ylittäviä 0 (osan 46 ottoa: `camcheck.txt`, suurin kääntö < 1 °/s) |
| `otecheck` (0,5 s välein) | 505 otetta (keihäs ja airot), ylityksiä 0 |
| osarenderi `--start 422 --end 1125.7` | `renders/osa3_422_1125.7.mp4` |
| `videotarkistus.py --start 422` | ääni 0,00 ms, ei jähmettymiä, KAIKKI KUNNOSSA; teemakartan pakollisia iskuja alueella 0 |
| `opastarkistus.py` | kaikki 24 ankkuria OK (`gef_*`, `wal_kulissi1`); soitinroolit torvi, maa, tuuli, olennot, pollahdys, vareet OK; ainoa "virhe" on kohta 3 (avauksen teemaviiva ei ole alueella, laskuri nostaa aina) |

## Tuoreen tarkistajan (sonnet) arvio stilleistä: `tarkistaja_raportti.md`
- (a) Tekeekö sankari jokaisessa otossa jotain: OSITTAIN. Ritari ei näy stilleissä 3.14 (t850) ja 3.15 (t895,6) (kamera on punoksessa; kuvaus "lepuuttaa airoja" ei näy); viivan rengas (3.7, t627,9; t808) ja viiri (t693,2) peittävät siluetin; 3.22 ei arvioitavissa.
- (b) Kosinnan kaari: OSITTAIN KYLLÄ (kaukana → lähelle → silmukat kauimpana t715,5 → polvillaan kämmen t740,5 → kämmenelle t777–790 → punos). Heikkous: viiva on ritarin päällä jo ennen luopumista (t545, t575, t627,9).
- (c) Purppura: KYLLÄ, koko kuvan tapahtumana (t928,5: taivas ja järvi), aavistus punoksessa (t895,6), jää punokseen (t957,8), ei muualla.
- Pahimmat: (1) viiva peittää ritarin tai ylittää hahmoja (t545, t575, t595, t627,9, t808, t1028,2, t456,5; viiri t693,2); (2) yli kolme elementtiryhmää laajoissa rantakuvissa (kohta 1); (3) keskikokoinen ritari (t436, t575, t613,2, t740,5, t790, t957,8, t1028,2).

## Avoimet
- 3.22: `main.js overlay()`:n koko ruudun paperipesu (`hil`) peittää ritarin; pyyntö `pyynnot.md`:ssä. Stillit t1112–1116 ovat siksi pelkkää paperia.
- Bottom-palkki 80 px (`#slate`) on edelleen kaikissa stilleissä (pyyntö `pyynnot.md`).
- 3.14b ja 3.15b: kamera punoksessa, ritari rajauksen ulkopuolella (korjaus: laajenna rajaus veneeseen).

## Ohjaajan lisäys (taustatutkimuksen motiivit): EI TOTEUTETTU
Krediittien loppumisen vuoksi työ viimeisteltiin nykytilasta. Auki: viivan reuna artikulaation mukaan (legato/staccato/sarkasmi; nyt vain muoto per ele), viivan "poissaolo" taivaan rasterin avauksena (nyt valkoinen veto päällä), riimimuoto B-puolelle (3.5/3.12, [tarkista korvalla]), 3.17:n muste `hero.js tailAt`:sta (nyt kärjestä `tipAt`). Olennot 3.16 ja pisteet 3.21 on tehty.
Lisäksi auki: edellä mainitut tarkistajan löydökset (viiva peittää ritarin, 3.14b/3.15b ritari rajauksen ulkopuolella, 3.22 paperipesu `main.js`:ssä).
Koodi latautuu virheettä (stillit t525 ja t928,5 renderöity), vastaukset.json on ehjä, vuororivi poistettu.

## Korjaus 1.11. (käyttäjän "korjaa")
3.14b ja 3.15b kamerat laajennettu niin, että ritari, vene, punos ja kuu ovat samassa rajauksessa (stillit t850 ja t895,6 uusittu, ritari näkyy). Osarenderiä ei ajettu uudelleen: `renders/osa3_422_1125.7.mp4` on ennen tätä korjausta; koko A-renderi ottaa muutoksen mukaan. Viivan peittämät ritarin siluetin (t545, t575, t627,9, t808) ja 3.22 jäivät auki.
