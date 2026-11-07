# Koko palautelistan tarkistus renderistä v5 (ja uudestaan v6:sta)

*Ohjaajan brief 1.11.2026. Käyttäjä: "Haluan, että seuraava vedos on oikeasti viimeinen. Mieti kaikki mun antama palaute
(katso palautelista) ja tarkista että JOKAINEN NIISTÄ ON HOIDETTU KUNTOON KAIKISSA KUVISSA."*

Olet tuore tarkistaja. Et ole tehnyt kohtauksia. Raportoit vain sen, minkä kuva tai mittaus näyttää.

## Lue ensin, tässä järjestyksessä
1. `docs/visuaalinen_tyyli.md` KOKONAAN (huom. luku 10 "Vastustajat: suon olennot" on päivitetty 1.11.2026: olennot, koot
   suhteessa ritariin, rekisterit).
2. `docs/kuvasaannot.md`.
3. `docs/palautelista.md` KOKONAAN: jokainen rivi A1–A15, B1–B12, C1–C14, D1–D12, E1–E2 on käyttäjän palaute tai ohjaajan
   kirjaama löydös. Tämä on tarkistuslistasi.
4. `docs/tuotantojako.md` luku "Kriitikko" (portit) ja "Osan valmiin määritelmä" (0a näkyvyys).
5. Aineisto: `runs/muste-1230/kriitikko_v5/index.md` ja sen kuvat: luku 1 (43 palautekohtaa ruutusarjoina, tunnisteet vastaavat
   palautelistan rivejä), luku 2 (90 oton stilliparit `otot/`), luku 3 (16 liikettä käyriä ja 4 fps ruutuja `liikkeet/`).
   Mittaukset: `runs/muste-1230/videotarkistus_v5.txt`, `jatkuvuus_v5.txt`, `camcheck_v2.txt` (sama sivu), `kohtauscheck_v2.txt`,
   `kierros4/osa2/nakyvyys_jalkeen.txt`.

## Tehtävä: taulukko, jossa JOKAINEN palautelistan rivi saa tuomion kuvista

Kirjoita `runs/muste-1230/kriitikko_v5/palaute_tarkistus.md`:

| rivi | käyttäjän palaute (lyhyesti) | mistä katsottu (kuva, ruudun ajat / mittaus) | mitä näkyy | tuomio |

Tuomio: **HOIDETTU** (kuva näyttää korjauksen kaikissa katsotuissa ruuduissa), **OSIN** (joissain ruuduissa ei), **EI**
(kuva näyttää, ettei ole hoidettu), **MITTAUS** (rivi todennetaan mittauksella: kirjoita mittaustulos), **PROSESSI** (rivi
koskee työtapaa, ei kuvaa; kerro mikä dokumentti sen hoitaa). Jokaiselle riville vähintään yksi ruutusarja tai mittaus; jos
palautekohdalle ei ole omaa ruutusarjaa, käytä otot/-stillejä samalta ajalta (ohjaus.md antaa ajat) ja sano, mitä katsoit.
Erityisesti: C2 ja C3 (päällekkäisyydet, yksi tuuli) ja D1 (taustat) katsotaan KAIKISTA 90 otosta; C8 (eleet) kaikista
otoista, joissa käsivarsi nousee; C14 ja D12 (suon olentojen koko ja näkyvyys) ovat v5:ssä tiedossa EI (korjataan v6:een):
kirjaa silti, mitä näet.

Lopuksi:
- **EI- ja OSIN-rivien luettelo** aikoineen ja ruutuineen: tämä on korjauslista v6:een.
- Liikkeet (luku 3): nykivät vs. yksi kaari, kuten ennen.
- Jämät otoittain (luku 2): elementit ilman lähdettä.
- Oma arvio: montako riviä 56:sta on HOIDETTU, ja mitkä kolme asiaa estäisivät julkaisun.

Älä korjaa mitään, älä aja renderiä. Epävarma merkitään [epävarma]. Kirjoita suomeksi.
