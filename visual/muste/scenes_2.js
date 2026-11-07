// Näytös 2: vastustajat (wid_1_huilu -> gef_viulu), docs/ohjaus.md luku 2, koneluettavana.
// [#, alkuankkuri, loppuankkuri, nimi, musiikki, kuva, { paikka, key }]
// key = still-kuvan hetki kohtauksen sisällä (0..1). Paikka G = suo (loc_swamp.js).
// Näkyvyys (kierros 4b/4c): olennot ovat luonnollisen kokoisia (tyyliohje luku 10), jokainen on lepopaikallaan kokonaan kuvassa ja erillään; tarkistus: node render/nakyvyys.mjs --from 240 --to 422 (rikkeitä 0).
// main.js kokoaa osat: SCN = [...SCENES_1, ...SCENES_2, ...SCENES_3, ...SCENES_4].

export const SCENES_2 = [
  [25, 'wid_1_huilu', 'wid_2_oboe', '2.1 Pisto', 'Huilu I sehr scharf, hyvin hiljaa', 'Ritari istuu kuolleen puun juurelle, hyttynen lentää sisään ja pistää, hän huitaisee sen pois ja se lentää pois', { paikka: 'G', key: 0.55 }],
  [26, 'wid_2_oboe', 'wid_3_4', '2.2 Sorsa', 'Oboe schnarrend', 'Sorsa ui sisään, ritari kääntää selkänsä', { paikka: 'G', key: 0.6 }],
  [27, 'wid_3_4', 'wid_dehring1', '2.2 Haikara', 'Pikkuhuilu, englannintorven kromaattinen nousu', 'Haikara laskeutuu paalulle ja nousee paalu paalulta, ritari nousee puoliksi', { paikka: 'G', key: 0.7 }],
  [28, 'wid_dehring1', 'wid_6', '2.2 Kotilot', 'Tuubat p: Dehring', 'Kotilot ryömivät penkereelle, ritari peittää korvansa', { paikka: 'G', key: 0.5 }],
  [29, 'wid_6', 'wid_7_8', '2.2 Sorsa kiihtyy', 'Oboe ja Es-klarinetti korkealla', 'Sorsan nokka käy nopeammin', { paikka: 'G', key: 0.6 }],
  [30, 'wid_7_8', 'wid_9_pasuunat', '2.2 Peili ja sammakot', 'Englannintorvi ja fagotit ff', 'Peili veden alla: laiha Quijote; sammakot hyppäävät veden puolelta penkereen alarinteelle ja istuvat rinteellä', { paikka: 'G', key: 0.6 }],
  [31, 'wid_9_pasuunat', 'wid_kuoro', '2.2 Varikset', 'Sordinoidut pasuunat ff, tuubat', 'Varikset laskeutuvat kuolleeseen puuhun, ritari vetää viirin suojaan', { paikka: 'G', key: 0.6 }],
  [32, 'wid_kuoro', 'wid_sankari_molli', '2.3 Sameus', 'Arvostelijat yhteen ääneen mf', 'Kaikki kuusi olentoa kuvassa yhteen ääneen, kukin omalla rekisterillään: hyttynen taivaalla, sorsa ja haikara vedessä ja paalulla keskellä, kotilot penkereellä ja sammakot sen rinteellä; musta rasteriusva sakenee, ritari yrittää nousta ja painuu takaisin', { paikka: 'G', key: 0.5 }],
  [33, 'wid_sankari_molli', 'wid_reh16', '2.4 Molli', 'Sankariteema mollissa: fagotit pp, käyrätorvet V-VI', 'Kypärä painuu, keihäs maahan, viiri tummuu', { paikka: 'G', key: 0.6 }],
  [34, 'wid_reh16', 'wid_reh17', '2.4 Hiljaa', 'Käyrätorvet V-VIII pp, alttoviulut sfz', 'Tumma viiri hengittää, olennot ovat lähteneet (niiden soittimet vaikenivat)', { paikka: 'G', key: 0.5 }],
  [35, 'wid_reh17', 'wid_uusi_hyokkays', '2.5 Muisto', 'I viulut sordinoituina G-kielellä, jouset aaltoina', 'Polvistuu lammen ääreen; aamun harjanne veden alla aalto aallolta; kuvassa ei ole olentoja', { paikka: 'G', key: 0.5 }],
  [36, 'wid_uusi_hyokkays', 'wid_reh20', '2.6 Uusi hyökkäys', 'Huilut, oboet, englannintorvi ff; tuubat, pasuunat', 'Olennot palaavat soittimiensa mukana ja piirittävät, ritari seisoo selkä puuhun', { paikka: 'G', key: 0.6 }],
  [37, 'wid_reh20', 'wid_sankari_nousee', '2.7 Toverit', 'Oboet, fagotit ff, 8 käyrätorvea; lautaset', 'Toverien siluetit harjanteelle, ritari vastaa kellolla, roiske lammessa', { paikka: 'G', key: 0.7 }],
  [38, 'wid_sankari_nousee', 'wid_voitto', '2.8 Viiri pystyyn', 'Jouset f; käyrätorvet tulevat', 'Viiri pystyyn ja leimahtaa', { paikka: 'G', key: 0.6 }],
  [39, 'wid_voitto', 'gef_viulu', '2.8 Voitto', 'Vasket ff', 'Leveä punainen veto suon yli, kuvassa olevat (varikset) hajoavat tippoina', { paikka: 'G', key: 0.4 }],
];
