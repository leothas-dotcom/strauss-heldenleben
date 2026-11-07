# Kierros 4, suunnittelututkimus: kumppanin hahmo viivasta vedettynä olentona

*Ohjaajan brief 1.11.2026. Lue ensin `docs/visuaalinen_tyyli.md` kokonaan ja `docs/kuvasaannot.md`; ne voittavat
tämän briefin. Sitten `docs/ohjaus.md` luku 3 (Kumppani) ja `visual/muste/companion.js` (companionFigure, rivit
146–) sekä sen käyttö `visual/muste/loc_shore.js` r. 893–895 ja 1128.*

## Käyttäjän sanat (1.11.2026)

> "Nyt se rakastajan hahmo on tehnyt paluun. En ole varma mitä mieltä olen tästä. Jos hän saa hahmon, voisiko se
> olla joku muu kuin tikku-ukko? Se on vähän naurettava. Jotenkin siitä valkoisesta viivasta vedetty olento? Se
> kyllä sopii tuohon."

Tyylin kielellä: kumppani on sooloviulun paperinvalkoinen **viiva** (kuvasääntö 8, tyyliohje luku 10). Nykyinen
`companionFigure` piirtää yhdellä viivalla ihmisen ääriviivan (pää, kaula, hartiat, helma), ja se lukee
renderissä valkoisena tikku-ukkona. Haettu: olento, joka on selvästi **sama viiva** (yksi jatkuva veto, paperin
väri, sama leveys kuin companionLine), joka on vain asettunut maailmaan ja jolla on läsnäolo ritarin vieressä,
mutta ei ihmisen ääriviivaa, ei raajoja, ei kasvoja, ei siluettia.

## Tehtävä: kolme vaihtoehtoa stilleinä, ei renderiä

Toteuta `companionFigure`-funktioon valinnainen muoto `o.variant` ('a' | 'b' | 'c'; oletus = nykyinen, jotta
renderi ei muutu ennen käyttäjän valintaa) ja URL-parametri `?kumppani=a` (lue `index.html`/`main.js`:n tapaan
`new URLSearchParams(location.search)`, välitä loc_shore.js:n `fig.pose`-kutsuun). Kolme ehdotusta, kaikki yksi
jatkuva veto ja puhdas ajan funktio:

- **a. Kaisla/liekki:** pystysuora kalligrafinen S-kaari, jonka yläpää kiertyy yhdeksi silmukaksi (ei pääksi:
  silmukka on avoin ja viiva jatkuu siitä vapaana päänä tuuleen). Hengittää viulun mukaan (leveys ja kaaren
  amplitudi `S.fam.violins`), nojaa ritariin päin `o.tilt`:llä.
- **b. Solmu:** viiva sitoo itsensä löyhäksi kahdeksikoksi, joka seisoo pystyssä; solmu kiristyy hellyydessä ja
  avautuu riehakkuudessa (mielialat companion.js:n tapaan). Vapaa pää valuu veteen tai maahan.
- **c. Kaari:** yksi korkea kaari, joka lähtee maasta/veneen pohjasta, nousee ritarin pään korkeudelle ja laskeutuu
  takaisin; kaaren huippu kallistuu ritaria kohti viulun fraasin mukaan. Pelkistetyin: läsnäolo ilman hahmoa.

Jokaisen on toimittava kolmessa tilanteessa: seisoo veneen keulassa (862 s, lähiotto), seisoo rannalla ritarin
vieressä selin kuuhun (1000 s) ja sulautuu vyöhön ennen taistelua (1100 s; nykyinen sulautuminen saa säilyä).
Ei saa näyttää hahmolta, jolla on pää ja vartalo. Ei saa olla naurettava: katso stilli ja kysy, onko se
läsnäolo vai piirroshahmo.

## Stillit

`node render/render.mjs --page "visual/muste/index.html?kumppani=a" --data build/demo400 --stills 862,1000,1100 --workers 2`
(tarkista ensin, että `--page` hyväksyy kyselyn; jos ei, lisää render.mjs:ään ohitus tai lue parametri
`--variant`-lipusta ja välitä se sivulle). Yksi still-ajo kerrallaan koko koneella: kirjoita
`runs/muste-1230/pyynnot.md`:hen rivi "käynnissä: kumppani-stillit" ajon ajaksi ja poista se perään. Kokoa
`runs/muste-1230/kierros4/kumppani/variantit.png` (3 riviä = a/b/c, 3 saraketta = 862/1000/1100 s, 640 px
leveät) ja kirjoita `runs/muste-1230/kierros4/kumppani/ehdotus.md`: jokaisesta vaihtoehdosta kaksi lausetta
(mitä viiva tekee, miten se liikkuu viulun mukaan) ja oma arviosi, mikä on läsnäolo eikä hahmo. Älä muuta
oletusrenderiä, älä koske muihin tiedostoihin kuin companion.js, loc_shore.js (vain variantin välitys) ja
tarvittaessa render.mjs:n kyselyparametriin. Raportoi vain se, minkä stilli näyttää.
