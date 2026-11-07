# Kumppani viivaolentona: kolme vaihtoehtoa (kierros 4, suunnittelututkimus)

Stillit: `variantit.png` (rivit a/b/c, sarakkeet 862 / 1000 / 1100 s). Vertailuksi nykyinen hahmo: `oletus/`.
Kutsu: `?kumppani=a|b|c`; ilman parametria oletushahmo (todennettu: kolme stilliä pikseleiltä identtiset ennen ja jälkeen).
Kaikissa yksi jatkuva veto, paperin väri, ei päätä, raajoja eikä kasvoja; juuri maassa, vapaa pää lähtee samaan tuuleen kuin muu kuva.
Leveys elää kalligrafisesti (leveäkärkinen sulka: paksu ja ohut suunnan mukaan, paine alussa, kasure lopussa).

## a. Kaisla/liekki
**Mitä viiva tekee:** nousee maasta S-kaarena, kiertyy ritaria kohti yhdeksi avoimeksi silmukaksi ja jatkaa siitä vapaana kielenä tuuleen ylös.
**Viulun mukana:** S-kaaren amplitudi, silmukan koko ja viivan leveys hengittävät `S.fam.violins`-kanavan mukana; vapaan kielen pää seuraa viuluviivan sävelkorkeutta (kuten nykyinen häntä); `o.tilt` kallistaa huipun ritaria kohti.
**Arvio:** elävin kolmesta ja lähin "viivasta vedetty olento", mutta silmukka on päänkokoinen, ja pienessä kuvassa (1000 s) varsi + silmukka voi lukea kukkana tai pallopäisenä tikkuna; läsnäolo vain jos kieli näkyy.

## b. Solmu
**Mitä viiva tekee:** sitoo itsensä pystyyn seisovaksi kahdeksikoksi, jonka alta lyhyt alkupää tulee maata pitkin ja loppupää valuu maahan tuuleen.
**Viulun mukana:** solmu kiristyy hellyydessä (kapea, ohut) ja avautuu riehakkuudessa, ilossa ja kevyessä (leveä, pyöreä); viulun hengitys leventää lohkoja ja korkeutta; loppupään pää seuraa viuluviivan korkeutta.
**Arvio:** selkein ja tarinallisin: sidos on kumppanin ja ritarin teema, siluetti ei muistuta ihmistä, ja mielialat näkyvät muodossa. Riski: lukee numerona 8 tai tiimalasina, jos se seisoo liikkumatta, ja liike on pienintä (vain hengitys ja huojunta).

## c. Kaari
**Mitä viiva tekee:** yksi korkea kaari, joka nousee maasta ritarin pään korkeudelle, kallistaa huippunsa ritaria kohti ja laskeutuu takaisin kääntyen pehmeästi maata pitkin tuuleen.
**Viulun mukana:** huipun kallistus seuraa viuluviivan tasoitettua suuntaa (±2 s: nouseva fraasi kallistaa enemmän, hiljaisuudessa palaa neutraaliksi); korkeus ja leveys hengittävät `S.fam.violins`-kanavan mukana.
**Arvio:** pelkistetyin ja täsmälleen "läsnäolo ilman hahmoa", mutta kuvassa se lukee esineeksi (ovikaari, kahva, koukku) eikä olennoksi, ja ranta-otossa (1100 s) häntä leikkaa veneen perää. Vähiten naurettava, mutta myös vähiten elävä.

## Suositus
1. **b** (solmu). 2. **a** (kaisla), jos halutaan liikettä: a:n vapaa kieli b:n solmun päähän on mahdollinen yhdistelmä. c vain jos halutaan mahdollisimman hiljainen läsnäolo.

## Huomiot (kaikille)
- 862 s: hahmo seisoo täysikuun ja sen juovan edessä, eli paperi paperia vasten. Kontrasti on heikko jokaisella variantilla ja nykyisellä hahmolla; vaihtoehdot ovat veneen siirto kuun vierestä tai kuun siirto (ei tehty, ei tämän tehtävän aluetta).
- 1000 s ja 1100 s: kaikki lukevat ritarin vierellä, 1100 s:ssä ritarin viiri ja viitta ovat vierekkäin, mutta ei päällekkäin (a:n silmukka lähimpänä).
- Sulautuminen vyöhön (hs+0,3…3,3 s) käyttää ennallaan samaa uAppear-rasterihäivytystä ja paikkaa; sitä ei katsottu stilleistä tässä ajossa (vain 862, 1000, 1100 s).
- Koodi: `companion.js` (`figureCurve`, `FIG_VARIANTS`, `pose(..., {variant})`), `loc_shore.js` (kaksi riviä: `?kumppani`-luku ja välitys `fig.pose`:lle), `render/render.mjs` (`--page` hyväksyy kyselyn).
