# Osa 4: Taistelu (A-puoli) – toteutuneet otot

*Lähde: `docs/ohjaus.md` luku 4 (4.1–4.4), kuvasäännöt `docs/kuvasaannot.md`. Ajat ovat ankkureita (`S.A(id)`, cues.json `teema`),
jaksorajoja (`segments.json`) tai iskuja (`build/A3/aksentit.json`). Ei kuunteluoppaan tekstiä. Koodi: `visual/muste/loc_battle.js`
(paikka J), `record.js` (paikka K), `scenes_4.js`.*

Väripartituuri (tyyli luku 5): tausta musta ja tulenpunainen, ei erikoisvärejä; ritari ● täysi sinooperi ja terävä paperireuna;
kumppani ◐ ohut valkoinen viiva ritarin takana; vastustajat ● mustat suon olennot (critters.js) mustan musteen pyörteinä ja läiskinä.
Taistelun maa on lähellä paperia (ritari erottuu), tulenpunainen vain kaukana. Sininen sammuu mustan alle ennen kuin punainen alkaa.

## Otot

| Otto | Ankkurit | Pääosa (pääosasääntö) | Sankari tekee | Kuvan tapahtumat (syy) |
|---|---|---|---|---|
| 4.1a Kutsu | `wal_kulissi1` → `wal_vastaus` | trumpetit kaukaa (maailma johtaa); torvet vaiti → ritari kuuntelee | Seisoo hevosensa vieressä, **kääntyy ääntä kohti** (ensimmäinen z ≥ 9 -isku) ja **nostaa viirin** (kaksin käsin, `lanceBoth`), laskee sen ennen vastausta | Kolme viiriä horisontissa (musta, valkoinen, punainen). Jokainen aksentit.json:n z ≥ 9 -isku (`fan`, 19 kpl) napsauttaa yhtä viiriä ruutua ennen ääntä: pelkkä viirin amplitudi, kamera ja ritari jatkavat |
| 4.1b Ratsaille | `wal_vastaus` → `wal_kulissi2` | orkesteri vastaa (toinen johtaa) | **Nousee ratsaille** (`climbA` → `ride`), viiri vastaa (nousee pystyyn) ja **nostaa kumppanin satulaan**: ohut valkoinen viiva siirtyy hänen viereltään satulan taakse | Kenttä painuu esiin puupiirroksena (Dürer-viivoitus); hiljaisuus (`quiet`, S.loud alle kynnyksen) rauhoittaa taivaan paperiksi, ei keksittyjä tapahtumia |
| 4.1c Viirit lähempänä | `wal_kulissi2` → `wal_taistelu` | trumpetit (maailma johtaa) | Ratsastaa ravia kentälle viiri pystyssä | Kolme viiriä lähempänä (penZ), z ≥ 9 -iskut taas viirien napsahduksina |
| 4.2 Patarummut | `wal_taistelu` → jaksoraja (seg 1179.0) | patarummut (maailma johtaa) | **Pysäyttää hevosen kentän laidalle** (hidastuu hitaaseen käyntiin, ei jähmety) ja **laskee viirin vaakaan** (hyökkäysasento: kyynärpää koukussa) | Taivas ja maa tummuvat mustaksi ja tulenpunaiseksi (maa kaukaa); jokainen patarummun lyönti pöllähdyttää maan viivoitusta ja nostaa pölyn |
| 4.3 Rynnäkkö | jaksoraja → `wal_puolenvaihto` | trumpetit ja virvelit; torvet soivat → ritari tekee | **Ratsastaa olentojen läiskiä päin ja lyö viirillä fraaseittain** (lyönti = tasoitettu käyrätorvikanava) | Suon olennot (hyttynen, sorsa, haikara, kotilo, sammakko, varis) saapuvat patarummun lyönnillä ja kiertävät ritaria mustina pyörteinä; jokainen kirjoitettu isku (z ≥ 5) osuu yhteen olentoon: parittomat iskut **läiskä** (brush.js splat, musta), parilliset **salama**; virvelit pisteviivoina maassa; kamera sukeltaa kerrosten läpi lähikuvaan |
| 4.4 Sivun kääntö | `wal_puolenvaihto` → loppu | ääni katkeaa (rahina) | Jatkaa hevosella; kamera vetäytyy | Kamera vetäytyy, rasteriliukuma jaksorajassa levyyn; **friisi kiertyy A-levyn renkaiksi** spiraalina ulkoa sisään (uProg), renkaat ovat A-puolen väripartituuri (ei purppuraa); levy alkaa pyöriä |

## Poikkeamat ohjauksesta

- Mustat kiilat (trumpetit) on poistettu: käyttäjän palaute oli, että vastustajat ovat suon olentoja, eivät abstrakteja kiiloja.
  Trumpettien rooli: kulissi-iskujen viirit ja taistelun salamat.
- Kumppani on viiva (ei nukke); taistelussa vain ohut viiva satulan takana.
- aksentit.json:ssa on taistelun aikana (1172.5–1223.7 s) vain kuusi z ≥ 5 -iskua (suurin z 6,6), z ≥ 9 -iskuja ei ole;
  z ≥ 9 -iskut ovat kulissifanfaarissa (1127–1143 s ja 1165–1171 s) ja ne ovat viirien napsahduksia.
  Iskut puolenvaihdon jälkeen (1227 s →, z = 12 kattoarvo) ovat levyn rahinaa, ei musiikkia, eikä niitä kuvata.
