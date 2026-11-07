// Kuvakäsikirjoituksen luvun 3 kohtaukset (runs/muste-1230/storyboard.md) koneluettavana.
// [#, alkuankkuri, loppuankkuri, nimi, musiikki, kuva, { paikka, key }]
// Erikoisankkurit: '@0', '@end', '@seg:wal_taistelu'. key = still-kuvan hetki kohtauksen sisällä (0..1).
// Paikat: A levy/paperi, B laakso, C joki, D kukkula, E niitty, F tasanko+putous+myrsky, G suo, I metsäaukio+kuutamojoki, J taistelukenttä.
// Osa 4: Taistelu A (wal_kulissi1 -> loppu). main.js kokoaa osat: SCN = [...SCENES_1, ...SCENES_2, ...SCENES_3, ...SCENES_4].

export const SCENES_4 = [
  [61, 'wal_kulissi1', 'wal_vastaus', 'Kolme viiriä', 'Kaukainen trumpettifanfaari', 'Musta, valkoinen ja punainen viiri horisontissa', { paikka: 'J', key: 0.5 }],
  [62, 'wal_vastaus', 'wal_kulissi2', 'Ratsaille', 'Orkesteri vastaa f, hiipuu', 'Ritari ratsaille, kenttä puupiirroksena', { paikka: 'J', key: 0.5 }],
  [63, 'wal_kulissi2', 'wal_taistelu', 'Viirit lähempänä', 'Trumpettikutsu uudelleen', 'Kolme viiriä lähempänä', { paikka: 'J', key: 0.5 }],
  ['64a', 'wal_taistelu', '@seg:wal_taistelu', 'Kenttä mustana ja punaisena', 'Patarummut f, 3/4', 'Rummun lyönnit pöllähdyttävät viivoitusta', { paikka: 'J', key: 0.5 }],
  ['64b', '@seg:wal_taistelu', 'wal_puolenvaihto', 'Taistelu', 'Trumpetit ja virvelit, kasvu f:ään', 'Haboku-myrsky, mustat kiilat, salamat', { paikka: 'J', key: 0.5 }],
  [65, 'wal_puolenvaihto', '@end', 'Sivun kääntö', 'A-puoli katkeaa kesken taistelun', 'Kenttä kiertyy levyn uraksi, väripartituuri', { paikka: 'K', key: 0.7 }],
];
