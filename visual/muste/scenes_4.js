// Ohjauksen luvun 4 (Taistelu, A-puoli) otot koneluettavana (docs/ohjaus.md; storyboard: runs/muste-1230/osa_4/storyboard.md).
// [#, alkuankkuri, loppuankkuri, nimi, musiikki, kuva, { paikka, key }]
// Erikoisankkurit: '@0', '@end', '@seg:wal_taistelu'. key = still-kuvan hetki kohtauksen sisällä (0..1).
// Paikat: J taistelukenttä, K levy.
// Osa 4: Taistelu A (wal_kulissi1 -> loppu). main.js kokoaa osat: SCN = [...SCENES_1, ...SCENES_2, ...SCENES_3, ...SCENES_4].

export const SCENES_4 = [
  [61, 'wal_kulissi1', 'wal_vastaus', '4.1 Kutsu: kolme viiriä', 'Kaukainen trumpettifanfaari', 'Ritari kääntyy ääntä kohti ja nostaa viirin; musta, valkoinen ja punainen viiri horisontissa', { paikka: 'J', key: 0.7 }],
  [62, 'wal_vastaus', 'wal_kulissi2', '4.1 Ratsaille', 'Orkesteri vastaa f, hiipuu', 'Ritari nousee ratsaille, kumppanin viiva satulaan taakse; kenttä puupiirroksena', { paikka: 'J', key: 0.5 }],
  [63, 'wal_kulissi2', 'wal_taistelu', '4.1 Viirit lähempänä', 'Trumpettikutsu uudelleen', 'Ritari ratsastaa kentälle, kolme viiriä lähempänä', { paikka: 'J', key: 0.5 }],
  ['64a', 'wal_taistelu', '@seg:wal_taistelu', '4.2 Patarummut', 'Patarummut f, 3/4', 'Hevonen pysähtyy kentän laidalle, viiri vaakaan, rummun lyönnit pöllähdyttävät viivoitusta', { paikka: 'J', key: 0.85 }],
  ['64b', '@seg:wal_taistelu', 'wal_puolenvaihto', '4.3 Rynnäkkö', 'Trumpetit ja virvelit, kasvu f:ään', 'Ritari lyö viirillä suon olentojen mustia pyörteitä; läiskät ja salamat iskuissa', { paikka: 'J', key: 0.9 }],
  [65, 'wal_puolenvaihto', '@end', '4.4 Sivun kääntö', 'A-puoli katkeaa kesken taistelun', 'Kamera vetäytyy, friisi kiertyy A-levyn renkaiksi', { paikka: 'K', key: 0.7 }],
];
