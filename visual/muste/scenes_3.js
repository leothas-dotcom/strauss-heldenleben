// Näytös 3, Kumppani: ohjauksen (docs/ohjaus.md, luku 3, uusi versio) 22 ottoa 3.1–3.22 koneluettavana.
// [#, alkuankkuri, loppuankkuri, nimi, musiikki, kuva, { paikka, key }]
// Yksi paikka: S rantaniitty (loc_shore.js). Ottojen sisäiset vastaotot vaihtuvat jaksorajoissa (segments.json) paikkatiedostossa.
// main.js kokoaa osat: SCN = [...SCENES_1, ...SCENES_2, ...SCENES_3, ...SCENES_4].

export const SCENES_3 = [
  ['3.1', 'gef_viulu', 'gef_vastaus1', '3.1 Ääni', 'Sooloviulu pp, harppu', 'Pysähtyy, kuuntelee, laskee viirin maahan; viiva latvoissa', { paikka: 'S', key: 0.6 }],
  ['3.2', 'gef_vastaus1', 'gef_viulu2', '3.2 Ensimmäinen vastaus', 'Käyrätorvet ja patarumpu mp', 'Nostaa kellon ja soittaa kutsun; maan pöllähdys', { paikka: 'S', key: 0.5 }],
  ['3.3', 'gef_viulu2', 'gef_vastaus2', '3.3 Keskustelu', 'Viulu ja harppu pp; matalat jouset vuorottelevat', 'Askel, viiva vetäytyy; pysähtyy, viiva palaa (kolme vuoroa)', { paikka: 'S', key: 0.5 }],
  ['3.4', 'gef_vastaus2', 'gef_mielialat', '3.4 Toinen vastaus', 'Sellot, bassot, harppu mp; sitten pp', 'Kävelee rantaan ja istuu kivelle; valo laskee', { paikka: 'S', key: 0.6 }],
  ['3.5', 'gef_mielialat', 'gef_vastaus3', '3.5 Viisi mielialaa', 'Pitkä sooloviulu pp', 'Viiva leikkii kiven ympärillä: kaipaus, ilo, kevytmielisyys, hellyys, sarkasmi', { paikka: 'S', key: 0.5 }],
  ['3.6', 'gef_vastaus3', 'gef_kiihkea', '3.6 Painokas vastaus', 'Käyrätorvet ja bassot mf', 'Nousee, nostaa kellon, soittaa pitkän vastauksen', { paikka: 'S', key: 0.5 }],
  ['3.7', 'gef_kiihkea', 'gef_puupuhaltimet', '3.7 Kiihtyminen', 'Viulu kiihkeänä', 'Viiva kiertää hänet pyörteeksi ja pakenee', { paikka: 'S', key: 0.4 }],
  ['3.8', 'gef_puupuhaltimet', 'gef_leimahdus', '3.8 Pisteet', 'Puupuhaltimet etualalla [tarkista]', 'Siniset pisteet metsänreunassa; kääntyy niitä kohti keihäs kädessä', { paikka: 'S', key: 0.5 }],
  ['3.9', 'gef_leimahdus', 'gef_lustig', '3.9 Leimahdus', 'Käyrätorvet ja vasket mf → f', 'Iskee keihään maahan, viiri leimahtaa, pisteet hajoavat', { paikka: 'S', key: 0.35 }],
  ['3.10', 'gef_lustig', 'gef_rauhoittava', '3.10 Nauru', 'Viulu hyvin nopeana ja korkealla [tarkista]', 'Viiva nauraa koukeroin kaukana; ritari yksin viirin alla', { paikka: 'S', key: 0.5 }],
  ['3.11', 'gef_rauhoittava', 'gef_viulu3', '3.11 Rauhoittava fraasi', 'Matalat jouset ja harppu p [tarkista]', 'Laskee keihään, istuu, ojentaa kämmenen', { paikka: 'S', key: 0.7 }],
  ['3.12', 'gef_viulu3', 'gef_rakkaus', '3.12 Lähentyminen', 'Viulu ja harppu vuorottelevat orkesterin kanssa p', 'Viiva latvoista kiven taakse, kämmenelle, olkapäälle kaareksi; aurinko laskee', { paikka: 'S', key: 0.5 }],
  ['3.13', 'gef_rakkaus', 'gef_rakkaus_hiljaa', '3.13 Rakkauskohtaus', 'Ges-duuri cantabile f, harpun glissandot', 'Nostaa viirin, työntää veneen vesille, soutaa; viiva keulassa; kuun väreet', { paikka: 'S', key: 0.7 }],
  ['3.14', 'gef_rakkaus_hiljaa', 'gef_hiljenee', '3.14 Kahden kesken', 'Harppu ja viulu mp', 'Viiva kietoutuu viirin ympärille punokseksi mastoon; hän lepuuttaa airoja', { paikka: 'S', key: 0.5 }],
  ['3.15', 'gef_hiljenee', 'gef_kolkutus', '3.15 Hiljaisuus ja nousu', 'pp; jouset ja harppu nousevat', 'Vene leijuu, punos ohenee ja levenee; purppuran aavistus', { paikka: 'S', key: 0.6 }],
  ['3.16', 'gef_kolkutus', 'gef_huippu', '3.16 Ovella', 'Puupuhaltimet ja matala vaski [tarkista]', 'Olennot nousevat kaislikosta; nousee veneessä seisomaan, keihäs vaakaan', { paikka: 'S', key: 0.6 }],
  ['3.17', 'gef_huippu', 'gef_sankari_hiljaa', '3.17 Huippu: purppura', 'Nousu p → f, sankarin teema palaa', 'Yksi veto kuun yli; taivas, kuun juova ja punos purppuraan', { paikka: 'S', key: 0.3 }],
  ['3.18', 'gef_sankari_hiljaa', 'gef_aalto', '3.18 Hellänä', 'Käyrätorvet hiljaa f → mp', 'Laskee keihään veneen pohjalle, istuu punoksen viereen; purppura laskeutuu', { paikka: 'S', key: 0.5 }],
  ['3.19', 'gef_aalto', 'gef_jalkihehku', '3.19 Vielä aalto', 'mf', 'Vene kääntyy rantaan; kuun juova levenee', { paikka: 'S', key: 0.5 }],
  ['3.20', 'gef_jalkihehku', 'gef_arvostelijat_uni', '3.20 Jälkihehku', 'pp, neljä hiljaista torvikutsua, harppu', 'Rannalla ritari selin katsoo kuuta, viiva kaarena vieressä; pään kääntö kutsuilla', { paikka: 'S', key: 0.5 }],
  ['3.21', 'gef_arvostelijat_uni', 'gef_hiljaisuus', '3.21 Uni', 'Puupuhaltimet pp, katkelmia', 'Mustat pisteet tähdissä; nousee ja katsoo pimeään; viiva nukkuu kiven päällä', { paikka: 'S', key: 0.5 }],
  ['3.22', 'gef_hiljaisuus', 'wal_kulissi1', '3.22 Tyven', 'Lähes hiljaisuus', 'Muste kuivuu, yö paperiksi; nostaa viirin maasta ja katsoo oikealle', { paikka: 'S', key: 0.6 }],
];
