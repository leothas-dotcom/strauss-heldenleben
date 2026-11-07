# Ajo: torviritari-400 – "Torviritari"

**Pyyntö (käyttäjä, 30.10.2026):** oikea Disney-henkinen piirretty, pelkkää liikegrafiikkaa, luova
ja uniikki, sulava kamera. Musiikin liikkeet frame-tarkasti: kirjoitetut iskut paikalleen ja
soittimille harkitut hahmot. Kuvakäsikirjoitus ensin, ja lopputulos noudattaa sitä. Hylätyt:
friisi (`video-400`, `video-400b`), pyörivä näyttämö (`drehbuehne-400`) ja abstrakti painokone.

**Kuvakäsikirjoitus:** [storyboard.md](storyboard.md) · **Tarkistus:** [tarkistus.md](tarkistus.md)

## Idea yhdellä lauseella

Torviritari (käyrätorvet) laulaa punaisen viirinsä taivaalle, kokoaa seitsemän toveriaan, kiipeää
myrskyn ja neljän kohtaloiskun läpi huipulle ja joutuu sitten suolle, jossa arvostelijat ovat
soittimiensa olentoja: hyttynen, sorsa, Quijote-nukke, kvintin päässä istuvat rupikonnat, sirkat,
sammakot ja varikset.

## Ajat ja tarkkuus

- Kaikki ajat tulevat teemakartasta (`annotations/teemat.json` → `cues.json`, ankkurit
  tunnisteilla) ja iskut `build/demo400/aksentit.json`:sta. Kohtauksessa ei ole kovakoodattuja
  aikoja. Puuttuva ankkuri pysäyttää kohtauksen virheeseen.
- Aikojen totuus on `build/kuuntelu/A_puoli_kuuntelu.wav` (sovittu 30.10.2026). Videon ääni on
  `build/demo400/soundtrack.wav`, joka on mitattu näytteen tarkkuudella samaan aikaan.
- Kirjoitettu isku näkyy ensimmäisellä ruudulla, joka alkaa aikaisintaan 33 ms ennen ääntä.
  Iskun tekee yksi elementti, ja koko kuva ei pysähdy, välähdä eikä tärähdä (kuvakäsikirjoitus, luku 4).

## Mikä muuttui edellisistä

| Ennen | Nyt |
|---|---|
| Paikat ja otot jaksonumeroista (`seg(5)`), varmuusajat | Paikat, otot ja olennot teemakartan ankkureista |
| PANNsin "iskut" (osa levyn naksahduksia) | Iskut 10 ms:n tarkkuudella, naksahdukset suodatettu |
| Sama tanssi tai sama laaja otto toistuu | Jokaisella olennolla oma lähikuva, välissä ritarin reaktio tai puolikuva olennosta ja ritarista |
| Isku jähmetti, välähdytti tai tärisytti koko kuvan ja leikkasi | Iskun tekee yksi elementti (salama, kellojen välähdys, pölypilvi, roiske). Liike jatkuu, ja iskujen sarja on yksi jatkuva otto (käyttäjän linjaus 30.10.2026). |
