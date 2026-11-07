# Tilanne: Punainen muste, A-puoli (päivitetty 31.10.2026 klo 12.00)

Ohjaaja päivittää tämän tiedoston aina, kun jokin osa alkaa, pysähtyy tai hyväksytään.
Jako ja säännöt: `docs/tuotantojako.md`, ohjaus: `docs/ohjaus.md`, kuvasäännöt: `docs/kuvasaannot.md`.

| Vaihe | Alue | Tila | Kuka | Mitä seuraavaksi |
|---|---|---|---|---|
| 0 Perusta | yhteiset tiedostot | hyväksytty 31.10. aamulla, mutta rikkoi otteet | – | – |
| 0b Perustan korjaus | yhteiset tiedostot | **HYVÄKSYTTY** 31.10. klo 11.30 (`perusta2/tarkistus.md` luku 8) | perusta-korjaus | – |
| 1 Sankari | 0–239 s | **KÄYNNISSÄ** (Sonnet) | osa1-sonnet | sommittelu kuvasäännöillä (keihäiden mittakaava, toverit, vedon muoto), tarkistaja, raportti |
| 2 Vastustajat | 239–422 s | **KÄYNNISSÄ** (Sonnet) | osa2-sonnet | alkaa 0b:n jälkeen rinnakkain 1:n ja 3:n kanssa (omat tiedostot `scenes_2.js`, `loc_swamp.js`); suo, olennot pääosassa, muisto lammessa oikealla harjanteella |
| 3 Kumppani | 422–1126 s | **KÄYNNISSÄ** uudella ohjauksella (Sonnet) | osa3b-sonnet | uusi ohjaus (22 ottoa, viiva, purppura koko kuvan tapahtumana) 0b:n jälkeen |
| 4 Taistelu (A) | 1126–1240 s | **KÄYNNISSÄ** (Sonnet) | osa4-sonnet | alkaa 0b:n jälkeen (`scenes_4.js`, `loc_battle.js`, `record.js`); suon olennot mustan musteen pyörteinä |
| Koko A | 0–1240 s | **RENDERÖITY 31.10. klo 13.05** (`renders/heldenleben_muste_A_final.mp4` 2,4 Gt, WhatsApp 167 Mt); videotarkistus: ääni 0 ms, 7/9 iskua OK, 0 jähmettymää. Ei vielä kriitikkoporttia. Aiemmin JONOSSA: `final_chain.sh` odottaa osa 3:n `tarkistus.md`:tä ja vapaata vuoroa, sitten renderi → `videotarkistus_final.txt` → WhatsApp (`renders/heldenleben_muste_A_final*.mp4`), loki `final_chain.log` | ohjaaja | käyttäjä katsoo; krediitit loppumassa 31.10. klo 12, joten osat 1, 2, 4 jäivät tarkistajan sommitteluhuomioineen (`osa_N/tarkistus.md`) |

Miksi 2 ja 4 eivät ole alkaneet: kaikki osat käyttävät samaa nukkea ja mustetta, ja ne ovat nyt rikki.
Kaksi kirjoittajaa samoihin tiedostoihin rikkoi työn tänään jo kerran, joten yhteiset tiedostot korjaa
yksi istunto, ja osat alkavat vasta sen jälkeen. Renderit ja still-ajot tehdään yksi kerrallaan
(`pyynnot.md`).

Kansiot: `perusta/` (vaihe 0), `perusta2/` (0b), `osa_1/`, `osa_2/`, `osa_3/`, `osa_4/` (kunkin stillit,
kontaktiarkit, renders/, tarkistus.md, storyboard.md), `drafti/` ja `tyylikuvat/` (vanhat luonnokset),
`renders/` (koko A-puolen renderit).
