# Osa 4 (Taistelu, A-puoli): tarkistus

Vain se, minkä mittaus tai kuva näyttää. Alue 1125,7–1240 s.

## Mittaukset (ajettu ennen lisäysbriefiä)
- `videotarkistus.py --start 1125.7`: ääni 0,00 ms, jähmettymiä 0, iskuruudut −4…+2 ruutua (`videotarkistus.txt`).
- `camcheck --max 20`: 0 ylitystä, taistelun suurin kääntö 3,7 °/s (`camcheck_koko.txt`).
- `kohtauscheck --step 15`: 0 reunaylitystä; tyhjää taustaa vain levykuvassa ja vetäytymisessä (`kohtauscheck.txt`).
- `opastarkistus`: viisi wal_*-ankkuria OK (`opastarkistus_1120-1240.md`); soitinroolit taistelussa 1172–1224 s OK (`opastarkistus_taistelu.md`). Koko alueella olentoroolit eivät mittaudu, koska olennot tulevat vasta taistelun alussa; skriptin osio 3 (avaus) ei mitattavissa.

## Tuoreen tarkistajan (sonnet) pisteytys stilleistä
- 4.1a, 4.1b, 4.1c: kohdat 1–7, 10, 19–24 KYLLÄ; 4.1a kohta 4 epäselvä (kolme viiriä kilpailee ritarin kanssa).
- 4.2 (t1178, vanha versio): EI kohdissa 2, 4, 5, 6, 22 (punainen taivas, olento ja kierre kilpailevat, olento viirien päällä).
- 4.3 (t1219.2, t1222): EI kohdissa 2, 4, 22 (mustat kierteet päällekkäin, taivaalla lintu); t1222 myös 1, 5, 7.
- 4.4 levy: kaikki KYLLÄ.
- Ritari erottuu yhdellä silmäyksellä vain osittain: laajoissa kuvissa (t1139, t1154) kyllä; t1178–t1222 punainen viitta ja punainen taivas sekoittuvat.
- Olennot ovat suon olentoja vain osittain (nokka-linnut ja torvikotilo tunnistettu; hyttynen, sammakko ei varmasti); suota ei ole kuvassa.
- Iskut: salama näkyi 1180 s; läiskää ei erotettu 270 px arkista.

## Avoimet kohdat
- Pyörteet menevät päällekkäin rynnäkössä (kohta 22) ja punainen taivas heikentää ritarin kontrastia: ei korjattu.
- Lisäysbriefin muutokset tehty tarkistajan jälkeen ja katsottu vain stilleistä `stills2/`: orkesterin trumpettiviirit etualalle (`wal_kulissi2`→taistelu; ankkuria `wal_trumpetit` ei ole cues.jsonissa), hyttynen kasvaa hirviöksi 3/4-jaksolla [tarkista, tulkinta], kaikki kirjoitetut iskut ovat läiskiä (salamat poistettu), läiskän koko z:stä. Osarenderiä ja videotarkistusta ei ajettu uudelleen; läiskän kokoa pienennetty viimeisen stillin jälkeen.
