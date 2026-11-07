# Osa 1 (held_alku → held_gp): tarkistus 31.10.2026 (2. kierros, perusta2:n jälkeen)

Vain se, minkä mittaus tai kuva näyttää. Tiedostot: `stills/` (30), `sheet_0..2.png`, `kontakti_5s.jpg`, `renders/osa1_0_240.mp4`,
`camcheck.txt`, `kohtauscheck.txt`, `videotarkistus.txt`, `opastarkistus.md`, `opasprobe.json`, `tarkistajan_raportti.md` (tuore sonnet, ei tehnyt koodia), `storyboard.md`.

## Mittaukset (uusin renderi 0–240 s)
| Tarkistus | Tulos |
|---|---|
| `videotarkistus.py` | ääni (kuuntelukopio) 0,00 ms, 0 ppm; iskut: 7/8 OK, **`held_isku2` +1 ruutua** (muutos ruudulla 217,267, ääni 217,26; isku1, 3, 4 ja reh9 OK); jähmettymiä 0 |
| `camcheck --max 20` | 0 ylitystä (ajettu ennen perusta2:n ja tämän kierroksen sommittelumuutoksia: **ajettava uudelleen**) |
| `kohtauscheck --step 15 --from 0 --to 240` | 0 reunaylitystä (sama: ajettu ennen viimeisiä muutoksia, **ajettava uudelleen**) |
| `opastarkistus.py` | ankkurit: 0 virhettä (`held_intro_loppuu` mittari `rivi_y`); soitinroolit 5 virhettä (käyrätorvet, huilut, trumpetit, patarummut, harput; mittarit karkeita, ei korjattu); kärjen korkeus vs teemaviiva avauksessa 7,6–31,4 s Spearman **0,66** (vaadittu > 0,8; perusta2 mittasi 0,905 vain ikkunalla 9,3–23 s, analyysin ikkuna sisältää profiilivaiheen, jossa viulutuuli nostaa viiriä) |

## Tuore tarkistaja (kuvasaannot.md, 30 stilliä)
Kyllä: kohdat 24 (ei natsieleitä) ja 26 kaikissa kuvissa; 241.1 paperi kunnossa; 15.6 ja 18.2 veto on ohut sivellinjälki.
Ohjaajan avoimet kohdat:
- (a) t044.5: **EI**, keihäs noin 2,0 × ritarin korkeus (tavoite 1,6) ja keskiviiri vain noin 30 px auringon alla.
- (b) toverit: **EI täysin**: 18.2 vain kepit ja viirit, 37.0 pieniä hahmoja, kypärää ei erota; 44.5 kello näkyy selvästi.
- (c) veto: 15.6/18.2 ohut sivellinjälki KYLLÄ; 26.4 ja 30.0 maassa neljä paksua nauhaa (viirien jälkeen jäävä muoto) näyttää käärmeiltä: **EI**.
Kolme pahinta, **auki**:
1. Päällekkäisyydet ja reunaleikkaukset (kohta 22): sankari purjeen päällä 48–84 s; tiirat osuvat viireihin ja aurinkoon; viirit risteävät 136.6, 162.8, 234.5, 237.2.
2. Muste: 26.4 irrallinen silmukka; 118.3 kaksi noin 100 px vetoa ilman ritaria; 147.8 irrallinen leveä veto (vedon pitäisi olla rivin yllä); 218.1 4–5 vetoa (viirinauhat myrskyssä); 136.6 ja 157.0 viirien reunat porrasmaiset.
3. Reunat ja luettavuus: maan oikea viistoreuna 26.4–37.0 ja 162.8; linnan (myrskyvuori) sivut suorakulmaiset 175.8; lohkoreunoja 189.8; myrskyssä 206.2 ja 218.1 ritarit liian pieniä.

## Muuta
- Alareunan 80 px musta palkki: `index.html` `#slate` ohittaa `hidden`-attribuutin (yhteinen tiedosto, pyyntö `pyynnot.md`:ssä).
- Poikkeamat ohjauksesta: `storyboard.md`.
- Ei tehty: ohjaajan hyväksyntä; ankkurikohtainen liikkeen katselu (vain stillit ja kontaktiarkki); soitinroolimittarien korjaus; 1.1:n vedon sirpaleisuus ja nauhat 26.4–30.0.
