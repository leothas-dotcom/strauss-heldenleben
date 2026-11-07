# Osa 4, kierros 2: Taistelu (1126-1240 s), tarkistus

Vain se, minkä mittaus tai kuva näyttää. Omat tiedostot: `visual/muste/loc_battle.js`, `record.js`, `scenes_4.js` (ei muutoksia). Yhteisiin ei koskettu.
Lähteet: osan renderi `renders/osa4_v2.mp4` (`--start 1126 --end 1240`, ääni kuuntelukopiosta), stillit `stills2/` (1 fps 1124-1132, 0,5 fps 1126-1240, lisäksi 1144,9-1148, 1174,5, 1177,3, 1179,5, 1180, 1212,7, 1220,2) + `stills2/kontakti_a8_1124-1132.png`, `kontakti_0.5fps_1126-1240.png`, `kriitikko2/` (ruutusarjat + `tarkistaja.md`, tuore Sonnet-tarkistaja kahdesti). Vanha tila: `ennen/loc_battle_kierros2_alku.js`.

## Muutokset (loc_battle.js, record.js)
1. **Viulu vyössä (A11).** Erillinen kumppanin viiva (`slot`/`setLine`) poistettu. `L.place(..., { sashSignal })`, `sashSig = smoothstep(0,1..0,6; S.fam.violins)` = mitattu `panns_violin_fiddle` (`stem_vocals` on tässä paketissa nolla: mitattu 0,0009 p95). Vyö (sash.js oletus) on mukana alusta.
2. **Ratsaille nousu.** Hyppy 1145,0 s ja eN 0,7 / 1147,9 s: pose.y = lantion korkeus ennen ja jälkeen `mounted`-lipun, nousun korkeus tilan y:ssä; nousu `ramp(vas, vas+0,2*(k2-vas))` (3,9 s), kyynärpään ja keihään kulman sulautus pm-käyrällä. `poseskan.mjs 1126 1240`: **0 ikkunaa, joissa hyppy** (ennen: 1145,0 ja 1147,9).
3. **Keihään napsahdukset (uusi löydös).** `hero.js frame()`:n kauemman käden varren kallistus vaihtaa suuntaa yhdessä ruudussa (keihään kärki hyppää 2-3 yksikköä), kun lähemmän käden etäisyys kauemmasta olkapäästä on yli 0,58 ja käsi on olkapään tasolla. `lancescan.mjs 1128 1224` löysi 7 kohtaa (1131,5, 1140,85, 1146,3, 1146,67, 1149,57, 1161,75, 1174,38). Ratkaisu omassa tilafunktiossa: lähempi käsi pysyy rinnalla (kyynärpää koukussa, `E_CH` 1,9), nosto ja vastaus rinnalta pään korkeudelle koukistetulla kädellä, lyönti = varren kaari (`lanceAng`). **Nyt `lancescan` 1126-1224: [] (ei yhtään).** Ei suoraa käsivartta viistosti ylös eteen: käsi on koukussa kaikissa stilleissä.
4. **`pulse` r. 519:** liikuttaa vain horisontin viirien amplitudia (`p.fm/p.rm uAmp`), ei kehoa (luettu; `poseskan` 0).
5. **Salamat ja läiskät (C8).** Kirjoitetut iskut (z >= 5, `aksentit.json`) vuorottelevat salaman ja läiskän välillä. Salama = paperinvalkoinen siksak mustalla ääriviivalla, hajoaa rasteriksi (`uAppear`), ei katoa yhdessä ruudussa. Läiskä pienempi (1,7+0,4(z-5)), eri syvyydessä (z -1,6...-3,2), elinaika 1,0 s (ritari ratsastaa sen ohi). Olennot ja pyörteet pysyvät hevosen ja keihään edessä (lähin piste ~4,6 yksikköä, pyörre puristetaan rajalla kx+3,2), eri syvyyksillä. Saapumisaika lyhyempi (0,045 x jakson kesto), jotta olento on perillä iskun hetkellä.
6. **Välke:** maan viivoituksen aaltoilu vaimennettu lähellä, pisteviivat (virvelit) vain keski- ja kaukokentässä: `jatkuvuus.py`-välkyntäpisteet alueella y>=792 y 18600 -> 0 (koe 1196-1208 s; täysi renderi 24000 -> 13300, jäljellä vain siirtymän aikainen osa, ks. alla).
7. **Levy (C8): kenttä kiertyy levyksi vähitellen.** `record.js` `buildDiscPieces(parent, S, A, 'scene'|'overlay')`: sama levy kahdella tavalla. `loc_battle.js` lisää levyn **kameraan kiinnitettynä kerroksena kentän päälle** `wal_puolenvaihto`:sta (1223,7 s): kenttä kuivuu rasteriksi paperille (2,4 s, uCov), ura kiertyy ulkoreunalta sisäänpäin spiraalina (smoothstep puolenvaihdosta seuraavaan jaksorajaan 1236,8 s), etiketti ja naarmut painuvat viimeisenä. Kerros on mitoitettu samaksi kuin kohtaus K (rasteri ruutukoordinaateista), joten main.js:n J->K-siirtymä (1224,2-1227,2) on saumaton: **ei leikkausta levyyn**. Kamera vetäytyy hitaammin (`sA+3`).
8. **Alku (A8 alkupää).** Kolme viiriä lähemmäs ja suuremmiksi (z -200 -> -70), kamera lähempänä (z 17 -> 12,5 viulujaksossa -> 17), joten luonnoksen lähde (`wal_kulissi1 - 1,0`) on selkeä: ritari, hevonen, horisontti, kolme viiriä.

## Mittaukset (alue 1126-1240 s)
- `poseskan.mjs 1126 1240`: 0 ikkunaa joissa hyppy. `lancescan.mjs 1126 1224`: ei keihään suunnan hyppyjä.
- `camcheck` (`camcheck_osa4.mjs --from 1127.5`, koska muiden osien paikat eivät ole mukana; koko ajon `camcheck` kaatui osan 3 keskeneräiseen `loc_shore.js`:ään): 6 ottoa, **0 ylitystä**, taistelun suurin kääntö 2,9 °/s (`camcheck2.txt`).
- `kohtauscheck --step 5 --from 1128 --to 1240`: **kerrosreunan ylityksiä 0**; tyhjää taustaa vain K:ssa/siirtymässä (levy paperilla, tarkoitettu) (`kohtauscheck2.txt`).
- `videotarkistus.py --start 1126`: ääni **0,00 ms** koko alueelle, jähmettymiä 0, KAIKKI KUNNOSSA; teemakartan pakollisia iskuja alueella 0; aksentit z >= 9 -ruutuerot -4...+2 (`videotarkistus2.txt`).
- `jatkuvuus.py --start 1126 --aksentit build/A3/aksentit.json --akz 5` (`jatkuvuus2.txt/.json`): **EPÄONNISTUI (työkalun raja): hyppyjä 18 iskujen ulkopuolella, välkyntälöytöjä 6 yli rajan.** Luokittelu:
  - tarkoitettu, iskun elementti (salama/läiskä, 1174,4, 1177,4, 1179,4-1179,9, 1212,7, 1220,1-1220,5): 48,4, 51,4, 53,4, 53,9, 86,7, 94,1, 94,5 s ruudun ajassa.
  - tarkoitettu, siirtymä (1222-1226,5, kenttä kuivuu paperille ja kamera vetäytyy, välkyntälöytö nro 1 alue y 792-1080): 96-100,5 s. Liike on kuivuvan kentän ja kameran liikettä, ei satunnaista välkettä.
  - tarkoitettu, vyön vapaa pää viulun soidessa (pieni, 48x48 px, 5 pikseliä/ikkuna, ritarin vyö): löydöt 4, 7. Vyön värähtely on sash.js:n signaali.
  - **avoin:** 77,4 s (1203,4 s, 168x48 px oikealla maassa) ja 18-19,5 s (1144-1145,5 s, 48x24 px) selittämättömiä; pieniä. Leikkaus-ilmoitukset 31,3 ja 33,0 s ovat taivaan rasterin kääntöjä (kuvassa tasainen häivytys, ei leikkausta).
- Aiemman renderin (`osa4.mp4`) `jatkuvuus` samalla työkalulla: välkyntää 24 (rajan yli), hyppyjä 35; nyt 6 ja 18 (`jatkuvuus_vanha_osa4.txt`).

## Tuoreen tarkistajan (Sonnet) tuomiot (`kriitikko2/tarkistaja.md`, viimeinen kierros)
| Kohta | Tuomio | Ero |
|---|---|---|
| A8 alkupää | **OK** | 1126,0 s: kenttä valmis, ritari, hevonen, horisontti, kolme viiriä; ei haalistunutta välivaihetta osan sisällä; jaksokortti IV 1127,5 s (main.js:n ajastus) |
| A11 vyö | **OSIN** | Vyö näkyy joka stillissä, ei erillistä viivaa taivaalla; viulujen leimahdus/laajeneminen ei erotu varmasti (sash.js:n signaalivaste pieni, ks. pyynnöt) |
| C8 eleet | **OSIN** | Ritari luettavana, käsi koukussa (ei suoraa käsivartta); keihään kaari näkyy selvästi vasta 1218-1224 s, välillä 1176-1213 s varsi liikkuu vähän |
| C8 iskut | **OSIN** | Salama paperinvalkoinen siksak mustalla reunalla ja läiskä mustana roiskeena; pari 1179,4/1179,9 toimii, ensimmäinen salama (1174,4) osuu vielä saapuvaan olentoon |
| C8 levy | **OK** | Kenttä häipyy rasteriksi 1222-1225,5, levyn ura kiertyy ulkoreunasta sisään 1225,5-1236 s, ei leikkausta |
| Nousu ratsaille | **OK** | Jatkuva liike, lantio ei hyppää (aiempi kierros kuvasi vanhaa 0,75 s nousua; nyt 3,9 s ramppi) |
Huom: viimeisen kierroksen jälkeen läiskän elinaika lyhennettiin 2,2 -> 1,0 s (tarkistajan havainto: läiskä peitti ritarin 1221 s); osan renderi ja mittaukset ajettu uudelleen, still 1177,3, 1179,5, 1180, 1220-1222 uusittu, mutta tuoretta tarkistaja-arviota muutoksesta ei ole.

## Ei todennettu / jäi
- A11: viulun leimahdus ei erotu varmasti (sash.js, ks. pyyntö). C8: keihään kaari heikko 1176-1213 s (`hornsS`-kanavan vaihtelu pieni).
- Jaksokortti IV ilmestyy 1127,5 s (main.js `acts`: wal_kulissi1 + 1), ei kentän painumisen hetkellä 1125,7 s.
- `jatkuvuus` hyppyjä/välkettä kohtia 77,4 s ja 18 s ei selvitetty.
- Palautelistan tilat: ei päivitetty (ohjaajan tehtävä); A8 alkupää, C8 levy ja nousu ovat nyt kuvalla todennettuja, A11 ja C8 eleet osittain.

## Pyynnöt yhteisiin tiedostoihin
1. `hero.js frame()` (kauemman käden varren kallistus, `rot = clamp(|d|-phiMax,0,0,6) * -sign(d)`, `if |d| > pi/2` -haara): suunta vaihtuu yhdessä ruudussa, kun `d` ylittää +-pi/2 ja r > 0,58. Jatkuva ratkaisu tarvitaan kaikkien osien raisseille/ratsastukselle. Osa 4 kiertää sen omassa tilafunktiossa (kyynärpää koukussa).
2. `sash.js`: signaalin vaste on pieni (leveys x(1+0,55 signaali), vapaa pää 0,03-0,2); viulun "leimahdus" ei erotu 10 px:n vyöstä. Pyydän suuremman leveyskertoimen ja pidemmän vapaan pään signaalin mukaan (esim. leveys x(1+1,2 s), pää x(1+1,5 s)).
3. `main.js` jaksokortti IV: ajasta 1125,7 s (kenttä painunut) tai selvitä, miksi 1 fps ja 2 fps -arkki näyttävät kortin eri hetkellä.
4. (tieto) Työkalut: `runs/muste-1230/osa_4/camcheck_osa4.mjs` (camcheck ajalle), `lancescan.mjs`, `dbgarm.mjs`, `probe_osa4.mjs`.
