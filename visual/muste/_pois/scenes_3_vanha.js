// Näytös 3, Kumppani: ohjauksen (docs/ohjaus.md, luku 3) otot 3.1–3.13 koneluettavana.
// [#, alkuankkuri, loppuankkuri, nimi, musiikki, kuva, { paikka, key }]
// Paikat: H metsäaukio (loc_forest.js, 3.1–3.8), I kuutamojoki (loc_river.js, 3.9–3.13). Leikkaus H -> I ankkurissa gef_rakkaus.
// Ottojen sisäiset vastaotot vaihtuvat jaksorajoissa (segments.json) paikkatiedostoissa; tässä ohjauksen otot.
// main.js kokoaa osat: SCN = [...SCENES_1, ...SCENES_2, ...SCENES_3, ...SCENES_4].

export const SCENES_3 = [
  [40, 'gef_viulu', 'gef_vastaus1', '3.1 Ääni metsästä', 'Sooloviulu pp, harppu', 'Kuulee äänen, laskee viirin maahan ja lähtee ääntä kohti; valkoinen viiva puiden lomassa', { paikka: 'H', key: 0.6 }],
  [41, 'gef_vastaus1', 'gef_mielialat', '3.2 Piiloleikki', 'Käyrätorvet ja patarumpu mp; viulu ja harppu; sellot ja bassot', 'Astuu aukiolle, vastaa kellolla; seuraa, viiva karkaa; istuu kivelle; viiva lähestyy', { paikka: 'H', key: 0.1 }],
  [42, 'gef_mielialat', 'gef_vastaus3', '3.3 Siilin piikit', 'Viisi mielialaa sooloviulussa', 'Kaipaus: kypärän kallistus; ilo: seuraa kiveltä kivelle; kevyt: pyörähtää; hellyys: polvistuu, kämmen; sarkasmi: perääntyy', { paikka: 'H', key: 0.6 }],
  [43, 'gef_vastaus3', 'gef_puupuhaltimet', '3.4 Painokkaasti ja kiihkeästi', 'Käyrätorvet ja bassot mf; viulu kiihkeänä', 'Nostaa kellon ja soittaa pitkän vastauksen; viiva pyörteeksi ympärille', { paikka: 'H', key: 0.3 }],
  [44, 'gef_puupuhaltimet', 'gef_leimahdus', '3.5 Pisteet puiden takana', 'Puupuhaltimet etualalla [tarkista]', 'Siniset pisteet puiden takana; asettuu niiden ja viivan väliin', { paikka: 'H', key: 0.5 }],
  [45, 'gef_leimahdus', 'gef_rauhoittava', '3.6 Leimahdus ja nauru', 'Käyrätorvet f; viulu lustig korkealla', 'Iskee keihään maahan, viiri leimahtaa; viiva nauraa korkealla; istuu kivelle ja laskee kypärän', { paikka: 'H', key: 0.1 }],
  [46, 'gef_rauhoittava', 'gef_viulu3', '3.7 Rauhoittava fraasi', 'Matalat jouset ja harppu p [tarkista]', 'Ojentaa kätensä matalalla, kämmen ylöspäin; viiva laskeutuu hitaasti', { paikka: 'H', key: 0.6 }],
  [47, 'gef_viulu3', 'gef_rakkaus', '3.8 Viiva astuu maailmaan', 'Viulu ja harppu vuorottelevat orkesterin kanssa', 'Viiva laskeutuu eteen ja nousee hahmoksi; hakee viirin; rantaan rinnakkain; aurinko laskee', { paikka: 'H', key: 0.25 }],
  [48, 'gef_rakkaus', 'gef_hiljenee', '3.9 Kuutamojoki', 'Ges-duuri cantabile f, harpun glissandot; sitten mp', 'Astuvat veneeseen; ritari soutaa, kumppani ohjaa; viiri ja viiva punokseksi mastossa; glissandot kuun väreitä', { paikka: 'I', key: 0.5 }],
  [49, 'gef_hiljenee', 'gef_huippu', '3.10 Ovella', 'pp, nousu; puupuhaltimet ja matala vaski [tarkista]', 'Olentojen siluetit rannalla; nousee seisomaan keihäs kädessä väliin; punos kiristyy', { paikka: 'I', key: 0.85 }],
  [50, 'gef_huippu', 'gef_sankari_hiljaa', '3.11 Huippu', 'Huippu f, sankarin teema palaa', 'Purppura punoksen kohtaamiskohdassa; laskee keihään ja kääntyy kumppaniin', { paikka: 'I', key: 0.35 }],
  [51, 'gef_sankari_hiljaa', 'gef_arvostelijat_uni', '3.12 Jälkihehku', 'Käyrätorvet hellinä; pp, neljä hiljaista kutsua', 'Vene rantaan; kaksi hahmoa selin katsoo kuuta; jokaisella kutsulla pään kääntö kaukaisuuteen', { paikka: 'I', key: 0.5 }],
  [52, 'gef_arvostelijat_uni', 'wal_kulissi1', '3.13 Uni ja tyven', 'Puupuhaltimet pp; lähes hiljaisuus', 'Mustat pisteet tähdissä; nousee ja katsoo pimeään, kumppani nukkuu; hakee viirin ja hevosen; paperi', { paikka: 'I', key: 0.4 }],
];
