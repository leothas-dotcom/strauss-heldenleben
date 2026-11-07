# Opastarkistus: visual/muste/index.html (1120–1240 s, puoli 1)

Vain mitattu: ankkurin kuvallinen vastaus (vastaukset.json) ja sen mittarin muutos opasProbe-tilasta;
soitinroolit listen.f32:n kanavia vasten; kärjen korkeus teemaviivaa vasten.

## 1. Ankkurit: kuvallinen vastaus ja mitattu muutos

| ankkuri | t | oppaan sana | vastaus | mittari | t−0,5 → t+0,5 | ±1 ruutu | tulos |
|---|---|---|---|---|---|---|---|
| wal_kulissi1 | 1125.70 | Kulissitrumpetit kutsuvat taisteluun, kaukaa horisontista | yö haalistuu paperiksi (paperin kautta) ja taistelukenttä painuu esiin: kolme viiriä horisontissa (musta, valkoinen, punainen); ritari kääntyy ääntä kohti | `paikka` | 1 | 1 | OK |
| wal_vastaus | 1145.00 | Orkesteri vastaa f | ritari nousee ratsaille ja kumppanin ohut viiva siirtyy satulaan hänen taakseen | `ritari_y` | 1.13 | 1.05 | OK |
| wal_kulissi2 | 1164.30 | Toinen kutsu hiljaisuuden jälkeen | horisontin kolme viiriä tulevat lähemmäs ja kuva palaa hiljaisuuden paperista | `viirit_z` | 0.24 | 0 | OK |
| wal_taistelu | 1172.50 | Taistelu alkaa: patarummut f, 3/4 | kenttä tummuu mustaksi ja tulenpunaiseksi, hevonen pysähtyy kentän laidalle ja viiri laskeutuu vaakaan | `kentta_punainen` | 0.363 | 0.038 | OK |
| wal_puolenvaihto | 1223.70 | A-puoli katkeaa kesken taistelun | kamera vetäytyy ja kenttä alkaa kiertyä A-levyn uraksi | `kamera.z` | 33.2 | 0.748 | OK |

Vastauksia ilman ankkuria mittausalueella: held_alku, held_isku_t6, held_isku_t8, held_viulut, held_isku_t11, held_vasket_t13, held_intro_loppuu, held_viulut_paluu, held_lyyrinen, held_t25, held_t31, held_t34, held_reh4, held_huippu1, held_reh5_isku, held_huippu1_kohta, held_t47, held_tunnelma_vaihtuu, held_t49, held_reh6, held_t61, held_reh8, held_reh9, held_reh10, held_reh11, held_reh12, held_isku1, held_isku2, held_isku3, held_isku4, held_dom7_sointu, held_dom7, held_gp, gef_viulu, gef_vastaus1, gef_viulu2, gef_vastaus2, gef_mielialat, gef_vastaus3, gef_kiihkea, gef_puupuhaltimet, gef_leimahdus, gef_lustig, gef_rauhoittava, gef_viulu3, gef_rakkaus, gef_rakkaus_hiljaa, gef_hiljenee, gef_nousu, gef_kolkutus, gef_huippu, gef_sankari_hiljaa, gef_aalto, gef_jalkihehku, gef_arvostelijat_uni, gef_hiljaisuus, wid_1_huilu, wid_2_oboe, wid_3_4, wid_dehring1, wid_6, wid_7_8, wid_9_pasuunat, wid_kuoro, wid_sankari_molli, wid_reh16, wid_reh17, wid_uusi_hyokkays, wid_reh20, wid_reh20_lautaset, wid_sankari_nousee, wid_voitto

## 2. Soitinroolit: elementti liikkuu, kun soitin soi (ikkunat 2 s)

| soitin | kanava | elementti | mittari | Spearman | soi & levossa | vaiti & liikkuu | tulos |
|---|---|---|---|---|---|---|---|
| käyrätorvet | panns_french_horn | ritari (teko: keihäs, kello) ja viirin punainen muste vain neljässä kohdassa | `torvi` | – | | | ei mittausta alueella |
| sellot, bassot | panns_cello, panns_double_bass | maa: vuorten rasteri, harjanteet, maan viivoitus ja joen virta (osa 3) | `maa` | – | | | ei mittausta alueella |
| viulut, alttoviulut | panns_violin_fiddle, panns_string_section | usvat, tuulen viivoitus, kuun väreet | `tuuli` | – | | | ei mittausta alueella |
| huilu, oboe, englannintorvi, klarinetti, fagotti | panns_flute, panns_clarinet, panns_wind_instrument_woodwind_instrument | soitinolennot (tiirat merellä, suon olennot, pisteet puiden takana) | `olennot` | 0.05 | 50% | 19% | VIRHE |
| trumpetit, pasuunat, tuuba | panns_trumpet, panns_trombone, panns_brass_instrument | aurinko, salamat, taistelun mustat kiilat | `aurinko` | – | | | ei mittausta alueella |
| patarummut | panns_timpani | maan pöllähdys, ryöpyt | `pollahdys` | 0.35 | 38% | 0% | OK |
| harput | panns_harp | välkerenkaat, glissando = kuun väreet, putouksen ryöpyt | `vareet` | – | | | ei mittausta alueella |
| lautaset, pikkurumpu | panns_cymbal, panns_snare_drum | taistelun iskut (elementin teko); virvelit pisteviivoina maassa, kirjoitetut iskut läiskinä ja salamina | `pisteviivat` | -0.04 | 75% | 6% | VIRHE |
| huilu (hyttynen) | panns_flute | huiluhyttynen: piikki ja siivet liikkuvat huilun fraasin mukaan | `mosq_ele` | – | | | ei mittausta alueella |
| oboe, englannintorvi, fagotti, klarinetti (sorsa, haikara, sammakot) | panns_wind_instrument_woodwind_instrument, panns_clarinet | sorsan nokka, haikaran askel ja sammakoiden kurnutus | `puupuhallin_olennot` | – | | | ei mittausta alueella |
| tuubat, pasuunat (kotilot, varikset) | panns_trombone, panns_brass_instrument | kotiloiden kellot ja varisten vetoputki | `vaski_olennot` | – | | | ei mittausta alueella |

## 3. Kärjen korkeus seuraa teemaviivaa (avaus)

Ei mitattavissa (teemaviiva tai avauksen ankkurit puuttuvat mittausalueelta).

**3 virhettä**
