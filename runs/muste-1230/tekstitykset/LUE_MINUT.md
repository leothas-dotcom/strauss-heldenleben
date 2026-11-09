# Tekstitykset: Ein Heldenleben, A-puoli

**v2 (9.11.2026, Tekstitykset 2.0, `docs/julkaisu2.md` luku 2):** 82 tekstiä renderille **v7** (nopeuskorjattu lähde,
1258 s), ruudulla 31 % ajasta, kahdeksan kieltä, kolme kerrosta: *tarina* 36 (kuva ja tarina), *kuuntele* 31 (alkaa sanalla
Kuuntele; vain soittimet, joiden varmuus teemakartassa on `kuultu`, `release2/korjaukset.md`), *tausta* 15 (Strauss, Pauline,
kriitikot, partituurin tieto sanalla "Partituurissa"). Rakennettu v1:stä skriptillä `v2_rakenna.py`; v1 (79 tekstiä, v6:n
ajoitus, julkaistu 4.11.) on kansioissa `v1/` ja `srt_v6/`. **v2:n SRT:t eivät ole vielä YouTubessa:** ne kuuluvat v7:n
lataukseen (julkaisu2.md luku 3), koska v6:n ajat ovat alkuperäisen siirron aikaa.

Muutokset v1 → v2: patarumpuväitteet #6 ja #7 pois (ehdokas / kielletty), #73 uuteen ankkuriin `wal_patarummut`;
pelkän partituurin soittimet tausta-kerrokseen ("Partituurissa …": #8, #12, #17); "sädekehä on levyn ääni" ja
"arvostelijoiden kaikuako?" poistettu; prologi kahtena tekstinä; uudet tausta-rivit yleistauosta, Dehring/Hanslick-huhusta,
Straussin vihasta kriitikoihin ja Sinfonia domesticasta. Kuvaa koskevat väitteet tarkistettu v7:n ruuduista (`tyo/esikatselu_fi_*.jpg`).

Alkuperäinen v1: https://youtu.be/EZ22YboLk7c (renderi v6). 79 tekstiä, ruudulla 28 % ajasta, kahdeksan kieltä.

## Periaate

Tekstitys on valinnainen kerros, ei osa kuvaa (kuvasääntö 27: tekstiä ei polteta videoon). Ääni on se, joka antoi videolle
syyn: joku istuu vieressä ja kertoo, mitä seuraavaksi tapahtuu. Tyyliohjeen luku 1 antaa neljä kysymystä, ja jokainen teksti
vastaa johonkin niistä tai avaa kuvan kieltä: kuka soittaa, mitä teemalle tapahtuu, missä kohtaa teosta ollaan, mitä kuva
tarkoittaa. Tämä on tyyliohjeen luvun 17 avoin kysymys 6, "selitetty painos", ilman että videota muutetaan.

- **Harvaan, tarvittaessa.** Tiheimmillään vastustajien esittelyssä, jossa soittimia tulee sekunneissa, ja väljimmillään silloin,
  kun musiikki kantaa itse. Pisin tauko on 47 s.
- **Hiljaisuus on tyhjää paperia.** Yleistauon aikana ei ole tekstiä (generaattori estää sen).
- **Ajat tulevat ankkureista.** `tekstit.json` nimeää teemakartan ankkurin, ei sekunteja. Teksti tulee 0,3 s ennen ääntä.
- **Ei keksittyjä väitteitä.** Jokaisella tekstillä on `lahde`. Oppaan [tarkista]-kohdat on kirjoitettu kysymykseksi tai jätetty pois.
  Kuvan väitteet on tarkistettu v6:n ruuduista.
- **Ei pizzicato-pisteitä eikä teemaviivan kolmea oktaavia kuvana:** kuva ei osoita niitä varmasti (palautelista A10, B2, C15).

## Tiedostot

| Tiedosto | Sisältö |
|---|---|
| `srt/heldenleben_A.<kieli>.srt` | ladattavat tekstitykset: fi, en, de, sv, fr, es, it, ja |
| `tekstit.json` | lähde: ankkurit, suomi, englanti, lähteet |
| `kaannokset/<kieli>.json` | käännökset samoilla tunnisteilla |
| `tekstitys.md` | tarkistustaulukko: aika, ankkuri, suomi, englanti, lähde |
| `tyo/esikatselu_*.jpg` | tekstit ruudun päällä, vain tarkistukseen |

Generointi: `.venv\Scripts\python.exe -I analysis\tekstitys.py --lahde runs/muste-1230/tekstitykset/tekstit.json --video runs/muste-1230/renders/heldenleben_muste_A_v7.mp4 --out runs/muste-1230/tekstitykset [--esikatselu fi]`

Rajat, jotka generaattori tarkistaa: kaksi riviä, rivi enintään 42 merkkiä (japani 21), lukunopeus 15 merkkiä/s (japani 6), sama
ajoitus kaikilla kielillä, ajautuma ankkurista enintään 4 s; v2:ssa lisäksi kerros jokaisella tekstillä, Kuuntele-alkusana
kielittäin, kuuntele-rivin soittimet `kuultu` teemakartassa, kuuntele ≤ 40 % ja tausta ≤ 20 % teksteistä. Japanin lukunopeus
määrää keston, joten tiheissä kohdissa (alku, Widersacher) japani on lyhyt ja rivinvaihdot ovat teksteissä valmiina.

## Lataus YouTubeen

**Tehty 4.11.2026:** kaikki kahdeksan kieltä julkaistu videolle. Studion kielilistassa on lisäksi "Azeri", jota emme ladanneet; se ei näy katsojan raitalistassa.

YouTube Studio → Sisältö → video → Tekstitykset → Lisää kieli → Lisää (Tekstitykset) → Lataa tiedosto → Sisältää ajoituksen →
valitse kielen `.srt` → Julkaise. Toista kullekin kielelle. Videon kieli on englanti.

## Kommentti videolle

**English:**

> Turn on captions (CC) for a guided listen. They tell you who is playing, what is happening to the themes and what the
> pictures mean, like someone sitting next to you. Available in English, Finnish, German, Swedish, French, Spanish, Italian and Japanese.

**Suomeksi:**

> Laita tekstitykset (CC) päälle, niin video opastaa kuuntelua. Ne kertovat, kuka soittaa, mitä teemoille tapahtuu ja mitä kuvat
> tarkoittavat, kuin joku istuisi vieressäsi. Kielet: suomi, englanti, saksa, ruotsi, ranska, espanja, italia ja japani.
