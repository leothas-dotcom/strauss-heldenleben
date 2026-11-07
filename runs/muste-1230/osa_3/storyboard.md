# Osa 3, Kumppani: kuvakäsikirjoitus toteutuneena (rantaniitty, `visual/muste/loc_shore.js`)

Ajat ovat A-puolen aikaa (totuus `build/kuuntelu/A_puoli_kuuntelu.wav`) ja tulevat ankkureista (`S.A(id)`, cues.json `teema`) ja
jaksorajoista (`segments.json`); koodissa ei ole kovakoodattuja sekunteja. Kuunteluoppaan tekstiä ei ole tässä eikä kuvassa.
Ohjaus: `docs/ohjaus.md` luku 3 (22 ottoa 3.1–3.22). Yksi paikka, joka ei vaihdu: rantaniitty, metsänreuna vasemmalla (x < −4), niitty,
kivi (x 6,3) ja lohkare (x 3,0), järvi oikealla (ranta x 9,4), vene rannassa (x 10,9), kuu (x 23,8) ja kaislikkosaari (x 31).

## Rakenne

- **Kumppani on vain viiva**: `companion.js`-mekanismi (`tipTrail`, paperinvalkoinen, portti = viuluviivan varmuus `build/koko/viuluviiva_A.json`),
  piirtyy kärjen (pään) radasta; ei `companionFigure`a eikä toista nukkea. Viisi elettä (3.5) jaksorajoissa ja läheisyyden asteet:
  latvoissa (3.1) → puiden lomassa (3.3) → kämmenellä (3.12) → olkapäällä, kaarena (3.12) → punoksena mastossa (3.14–3.18, `braid`) →
  vierellä kaarena (3.19–3.20) → lepäävä viiva kiven päällä (3.21) → lyijykynäviiva paperilla (3.22).
- **Keihäs**: kädessä (`leader`, ote ja kärki `hero.js`:stä) tai vapaana (oma varsi ja viiri, tweenit käden ja levon välillä):
  maahan viistoon (3.1–3.8), iskettynä (3.9), makaamassa (3.11–3.13), veneen pohjalla (3.13–3.18, 3.19), rannalle pystyyn (3.19–3.21), käteen (3.22).
- **Valo**: iltarusko (3.1–3.12; aurinko laskee kaukaisen rannan puiden taakse), yö ja tähdet (3.13→; sininen ja musta), kuu omana kiekkona,
  harpun renkaat järvellä, paperipesu hahmojen takana (3.22).
- **Purppura `#8E2457`** vain: aavistus punoksen kohtaamiskohdissa (3.15), koko kuvan kohoaminen (3.17: taivaan ja järven purppuralaatta
  rasterina sinisen päälle, kuun kiekko ja punos; kaksi laattaa päällekkäin, ei liukuväriä), laskeutuminen (3.18, jää punokseen), muualla ei.
- **Muste** (`tipTrail` punainen) vain 3.17: yksi veto keihään kärjestä kuun yli.
- **Vastustajat ◐** vain 3.16: oboe-sorsa, englannintorvihaikara ja fagottisammakko kaislikkosaarella (`critters.js`), ja 3.8:n siniset pisteet
  metsänreunassa (puupuhaltimet); mustat pisteet tähdissä (3.21).

## Otot

| Otto | Ankkurit → jaksorajat (leikkaukset) | Sankari tekee | Johtaa | Kuva (rajaus, valo) |
|---|---|---|---|---|
| 3.1 | `gef_viulu` → `gef_vastaus1` | Saapuu kävellen, pysähtyy, kääntyy ääntä kohti, kuuntelee ja laskee keihään viistoon maahan (viiri ruohoon) | viiva | laaja z 38, ritari alle 10 % korkeudesta oikealla alhaalla, viiva pitkänä latvojen yllä vasemmalla; iltarusko |
| 3.2 | `gef_vastaus1` → `gef_viulu2` | Nostaa kellon ja soittaa; maan pöllähdys patarummun iskuista (vaaleat läiskät maasta) | ritari | lähikuva z 6, kello täyttää kuvan |
| 3.3 | `gef_viulu2` → `gef_vastaus2`; leikkaukset jaksorajoissa (kolme vuoroa) | Kolme askelta metsää kohti; jokaisen jälkeen pysähtyy ja kuuntelee | viiva | viiva laskeutuu puiden lomaan, vetäytyy askeleesta ja palaa; vastaotot: laaja / puiden lomassa / ritari niityllä |
| 3.4 | `gef_vastaus2` → `gef_mielialat`; leikkaukset jaksorajoissa | Kääntyy, kävelee rantaan, istuu kivelle | ritari → viiva | laaja z 34, aurinko kaukaisen rannan puiden takana, valo laskee |
| 3.5 | `gef_mielialat` → `gef_vastaus3`; leikkaus jokaisen eleen vaihtuessa (jaksorajat 533,4 / 551,3 / 566,4 / 581,2) | Kaipaus: kallistaa päätä; ilo: kääntyy viivan perässä; kevytmielisyys: pyörähtää (viiva katoaa puun taakse, ilmestyy selän takaa); hellyys: polvistuu kämmen ylöspäin; sarkasmi: nousee ja perääntyy | viiva | kuva viivan korkeudessa, ritari alareunassa (z 30 → 8) |
| 3.6 | `gef_vastaus3` → `gef_kiihkea` | Nousee, nostaa kellon, soittaa pitkän vastauksen | ritari | lähikuva z 6,4 |
| 3.7 | `gef_kiihkea` → `gef_puupuhaltimet` | Kävelee keihään luo | viiva | viiva kiertää hänet pyörteeksi (kasvava), pakenee ylös; kuva laajenee ylös |
| 3.8 | `gef_puupuhaltimet` → `gef_leimahdus` (653,5 / 673,8) | Ottaa keihään, vartioasento, kääntyy pisteitä kohti keihäs kädessä | puupuhaltimet | siniset pisteet metsänreunassa matalalla kontrastilla; viiva katselee ylhäältä |
| 3.9 | `gef_leimahdus` → `gef_lustig` | Nostaa keihään ja iskee sen maahan; viiri leimahtaa leveäksi; pisteet hajoavat | ritari | lähikuva, viiri täyttää kuvan |
| 3.10 | `gef_lustig` → `gef_rauhoittava` | Seisoo yksin leimahtaneen viirin alla, katsoo ylös | viiva | viiva koukeroin korkealla ja yhä kauemmas; laaja z 36 |
| 3.11 | `gef_rauhoittava` → `gef_viulu3` | Laskee keihään maahan, istuu, ojentaa kämmenen ylöspäin | ritari (hiljaa) | lähikuva kädestä ja maasta; viiri makaa |
| 3.12 | `gef_viulu3` → `gef_rakkaus` (765,5 / 777,6 / 790,5) | Istuu kämmen ojossa | molemmat | viiva latvoista → lohkareen taakse → kämmenelle → olkapään yli yhdeksi kaareksi; ensimmäinen rajaus, jossa molemmat; aurinko laskee veteen |
| 3.13 | `gef_rakkaus` → `gef_rakkaus_hiljaa` (815,6) | Nostaa viirin, kävelee veneelle, työntää veneen vesille, astuu sisään, laskee keihään pohjalle ja soutaa | orkesteri | laaja yö: vene kuun juovalla (harpun renkaat), viiva keulassa ja lopuksi mastolla |
| 3.14 | `gef_rakkaus_hiljaa` → `gef_hiljenee` (845,2 / 856,7 / 868,8) | Soutaa, sitten lepuuttaa airoja | viulu, harppu | viiva kietoutuu viirin ympärille punokseksi mastoon; punos lähikuvassa, kuu takana |
| 3.15 | `gef_hiljenee` → `gef_kolkutus` (`gef_nousu`, 900,7) | Vene leijuu (liike hidastuu, ei pysähdy) | jouset | punos ohenee ja levenee; purppuran aavistus kohtaamiskohdissa |
| 3.16 | `gef_kolkutus` → `gef_huippu` | Nousee veneessä seisomaan ja ottaa keihään vaakaan olentojen ja punoksen väliin | puupuhaltimet | olennot nousevat kaislikkosaarelta (◐), ranta kuvan reunassa |
| 3.17 | `gef_huippu` → `gef_sankari_hiljaa` (927,4 / 933,4) | Nostaa keihään pystyyn; kärki piirtää yhden vedon kuun yli | torvet | olennot painuvat; huipussa taivaan sininen rasteri, kuun juova ja punos purppuraan (koko kuvan tapahtuma); kuva nousee |
| 3.18 | `gef_sankari_hiljaa` → `gef_aalto` | Laskee keihään veneen pohjalle ja istuu punoksen viereen | torvet | lähikuva, kaksi muotoa; purppura laskeutuu yön siniseen ja jää vain punokseen |
| 3.19 | `gef_aalto` → `gef_jalkihehku` | Soutaa takaisin, vene kääntyy rantaan, astuu maihin | jouset | laaja; kuun juova levenee; punos ohenee loppuun |
| 3.20 | `gef_jalkihehku` → `gef_arvostelijat_uni` (1005 / 1035,1 / 1050,1) | Istuu rannalla selin kuuta katsoen; neljällä torvikutsulla (982,2 / 990,2 / 1008,3 / 1043,6) kääntää päätään oikealle | torvet hiljaa | viiva vierellä kaarena; otot: laaja, kaksi, taivas, kaksi |
| 3.21 | `gef_arvostelijat_uni` → `gef_hiljaisuus` | Nousee ja katsoo pimeään | puupuhaltimet | mustat pisteet tähtien joukossa; ritari siluettina alhaalla; viiva nukkuu suorana kiven päällä |
| 3.22 | `gef_hiljaisuus` → `wal_kulissi1` | Nostaa keihään maasta ja katsoo oikealle | – | muste kuivuu, yö haalistuu paperiksi; kaksi muotoa; lyijykynäluonnos |

Huomio 3.22: koko ruudun paperipesu `main.js overlay()`:ssä (`hil`) peittää ritarin; pyyntö `pyynnot.md`:ssä (paikan oma paperipesu on hahmojen takana).
