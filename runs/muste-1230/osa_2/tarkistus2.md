# Osa 2, kierros 2: tarkistus (vain mitattu ja kuvasta nähty)

Muutetut tiedostot: `visual/muste/loc_swamp.js`, uusi `visual/muste/critters_swamp.js` (osan oma; critters.js on yhteinen eikä muuttunut).
Ennen-versio: `loc_swamp.js.ennen_kierros2`. Renderi: `renders/osa2_v2.mp4` (243-422 s, 5370 ruutua, ei virheitä, `render2.log`).

## Mittaukset
- `poseskan.mjs 243 422`: ennen 6 asentohyppyä (252,7 / 266,15 / 271,97 / 314,36 / 361,52 / 391,67), jälkeen **0** (`poseskan_ennen.txt`, `poseskan_jalkeen.txt`). Korjaus lähteessä: heroState on nyt avainlista, jonka avaimet sekoittuvat smoothstepillä (`foldP`), ei kovia vaihtoja.
- Viirin kärjen hypyt (`tmp/tipscan.mjs`): ennen 23, jälkeen 0 muiston ja toverikohtauksen alueilla (jäljellä vain kameran leikkausten ja nostokohtien ulkopuoliset 363,7 s ja 392,5 s ennen viimeistä korjausta, ks. tipscan2.txt).
- `videotarkistus.py --start 243`: ääni 0,00 ms, isku `wid_reh20_lautaset` OK (ruutu 384,567), jähmettymiä 0, KAIKKI KUNNOSSA (`videotarkistus2.txt`).
- `camcheck --max 20`: 94 ottoa, ylityksiä 0 (`camcheck2.txt`). `kohtauscheck --step 15` (236-424 s): 376 ruutua, tyhjää 0, kerrosylityksiä 0 (`kohtauscheck2.txt`).
- `jatkuvuus.py --start 243` (`jatkuvuus2.txt`): hyppyjä 6 (kaikki iskujen ulkopuolella): **tarkistus EPÄONNISTUU** (vanha renderi: 31 hyppyä, välkyntä 0 yli rajan). Välkyntää yli rajan 150: 2 kohtaa: 0-1,5 s (243 s, paperi-siirtymä, yhteinen) ja 123-124,5 s (366 s, tuubakotilon pisteytetty ääriviiva värähtelee hitaan ryömimisen mukana, ei korjattu). Hyppyjä oli 31 -> 6.

## Kuvasta nähty (stillit `stills2/` 0,5 fps 243-330 s ja 1 fps 330-410 s, `kontakti_*.png`, `vertailu_aamu_vs_lampi.png`)
Neljä tuoretta Sonnet-tarkistajaa (`kriitikko/tarkistaja_raportti2..5.md`), jotka eivät tehneet kohtausta. Viimeisin (raportti5) viimeisen version kuvista:

**C6 muisto lammessa: OSIN (ei vielä OK).** Tunnistuu aamusta peilattuna: vaalea usvakaista, sininen vuorimassa jonka huiput osoittavat alas, sinooperi aurinko, viirit sauvoissa; kasvu vaiheittain (harjanne 318-324 s, aurinko ~332 s, sauvat 340 s, viirit 344-352 s, häipyy ~362 s); ritari nostaa torven viistosta pystyyn (329-344 s); peili veden alla, ei ritarin päällä; kartiota ei ole.
Puuttuu / virheet: 308-322 s näkyy vielä pelkkä vaalea pitkä kaista (käyttäjän hylkäämä "harmaa pitkulainen"), koska vuori kasvaa vasta aallolla 2 (aalto 1 = usvakaista + harjanteen reuna); musta harjanteen reuna sulautuu rantakaistaan; oranssi taivas ja kahdeksan hahmoa puuttuvat; harjanteen profiili on pyöreähkö (valleyRidge-tasanne), ei aamun teräviä huippuja; vasen musta vinoreunainen rantakiila lukee paikoin kolmiona (t334-t344); sorsa palaa ritarin viereen 352-363 s; "tarttuu viiriin" ei näy peilin viireissä. **Käyttäjän hylkäys EI ole varmasti ratkennut: tämä kierros ei ole valmis, vaatii vielä vertailun käyttäjällä/ohjaajalla.**

**C4 olennot: OSIN.** Sorsa ja tuubakotilot (t259, t265, t301) tunnistuvat; varikset kohtalaisesti. Hyttynen on pieni (0,34 mittakaava, ~150x40 px) ja haikara ohut: heikko; sammakot lukevat paikoin rapuina/hiiriltä; lähikuvat ritarin kanssa vain kotiloilla ja sammakoilla. Harmaa sumulaikku ~267-289 s (yhteinen taivas, uMurk) ei ratkaistu.

## C9 (yksi ele omasta kanavasta)
Olentojen eleet ajaa oman soitinryhmän tasoitettu verhokäyrä (`G.*`, ei nuotinalut): hyttynen siivet+pistin (huilu), sorsa nokan avaus (oboe), haikara pään kallistus + askeleet puupuhaltimien kertymän mukaan (`stairP`), kotilo kellon kallistus (tuubat), sammakko takajalka (fagotit), varis vetoputki (pasuunat). Todennettu vain koodista ja stilleistä, ei kanavakorrelaatiolla.

## Tehdyt koodimuutokset
Muisto: kuusi aaltoa jousikanavan (`S.fam.strings`) tasoitetun käyrän pohjista (5 pohjaa: 313,9 / 324,2 / 336,6 / 347,8 / 358,6 s; `__osa2.aallot`), kasvu = kanavan kertymä; ei `tNight+N`-lisäyksiä. Ritarin päänosto `head(t)` = kertymä. Peili: laakson `ridgePts`-vuoret + `valleyRidge`-reuna + aurinko + 8 viiriä, peilattu veden alle (`mem`, z PZ+0.02). Olennot väistyvät `EDGE`-asemiin (`edgeK`, aikaikkunat ankkureista/aalloista). Kolme kamerakuvaa jaettu aaltorajoihin.
Pyyntöjä yhteisiin tiedostoihin: ei.
