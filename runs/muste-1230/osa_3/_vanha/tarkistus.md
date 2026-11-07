# Osa 3 (kosinta, 422–1125,7 s): tarkistus

## Mittaukset (uusin renderi `renders/osa3.mp4`)
- `kohtauscheck --step 15` 420–1126 s: 0 ylitystä (aiempi 3.8:n `metsänpohja`-vuoto korjattu).
- `camcheck --max 20`: 0 ylitystä.
- `videotarkistus.py --start 422`: ääni 0,00 ms, iskut ruudun tarkkuudella, ei jähmettymiä, "KAIKKI KUNNOSSA".
- `opastarkistus.py` (`opastarkistus.md`): virheitä jäljellä (ks. alla), kaikki muut gef_*-ankkurit läpi.
  - `gef_viulu`: ankkuri osuu rasteriliukuman keskelle (paikka H alkaa 0,9 s ennen), mittari ei muutu ±0,5 s.
  - `wal_kulissi1`: osan 4 ankkuri, ei vastausta tässä osassa.
  - soitinroolit: `käyrätorvet` (muste.punainen.muste, muste on tarkoituksella vain 3.11:ssä) ja `olennot` (siniset pisteet:
    puupuhaltimien alkuja täydennetty tasavälein, joten pisteet näkyvät myös kanavan ollessa hiljaa) eivät täytä korrelaatiota.

## Tuoreen tarkistajan (sonnet) havainnot ja korjaukset
Korjattu: 3.3–3.4 viiva yläkolmannekseen ja kamerat laajoiksi (ritari pieni, ei päällekkäisyyttä); punaiset kaaret 3.12–3.13
poistettu (muste vain gef_huippu); siniset pisteet paperireunalla; 3.9 punoskuva ei leikkaa hahmoja.
Edelleen avoinna (kuvasta näkyvä):
- 3.12–3.13: selkäkuvan ritari on puuhahmo-laatikko (`knightBack`, yhteinen puppets-tiedosto): ei käsiä, pään käännöt ja
  viirin haku eivät lue siluetista (kohta 5, 22); `knightBack` pyydettävä uusittavaksi.
- 3.9, 3.11, 3.12: ritari keskikokoinen veneessä (kohta 3); 3.11:ssä purppura on pieni eikä erotu stillistä selvästi.
- 3.1 viirin lasku, 3.6 keihään isku ja 3.13 viirin haku eivät näy 5 s kontaktiarkista (toteutettu koodissa, ei vahvistettu stillillä).
- 3.5: ritari seisoo; tekoa (kääntyminen) ei tarkistettu stillistä.
- 3.3 hellyys (≈570 s): viiva laskeutuu kämmenelle lähikuvassa ja on suuri.
- 1012–1022 s tumma ruutu ei toistunut tarkistusstillissä (1014 s: pieni vene, kuu, tähdet).

## Kysymykset
(a) Tekeekö sankari jokaisessa otossa jotain: kyllä koodissa jokaisessa; stilleistä vahvistuu: kävely, kello, istuminen, kämmen,
soutu, seisominen keihäs kädessä; 3.5 ja 3.12–3.13 heikoimmat.
(b) Näkyykö kosinta ilman selitystä: viivan muuttuminen hahmoksi, rinnakkain kävely, vene ja punos lukevat; huippu (purppura) heikosti.
Puutteet: ks. yllä. Ei kuunteluoppaan sisältöä.
