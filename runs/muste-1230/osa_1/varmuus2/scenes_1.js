// Kuvakäsikirjoituksen luvun 3 kohtaukset (runs/muste-1230/storyboard.md) koneluettavana.
// [#, alkuankkuri, loppuankkuri, nimi, musiikki, kuva, { paikka, key }]
// Erikoisankkurit: '@0', '@end', '@seg:wal_taistelu'. key = still-kuvan hetki kohtauksen sisällä (0..1).
// Paikat: A levy/paperi, B laakso, C joki, D kukkula, E niitty, F tasanko+putous+myrsky, G suo, I metsäaukio+kuutamojoki, J taistelukenttä.
// Osa 1: Sankari (held_alku -> held_gp). main.js kokoaa osat: SCN = [...SCENES_1, ...SCENES_2, ...SCENES_3, ...SCENES_4].

export const SCENES_1 = [
  [0, '@0', 'held_alku', 'Neula', 'Neula laskeutuu, sisäänajoura', 'Kermapaperi, lyijykynäluonnos vuorista, nimiö', { paikka: 'A', key: 0.8 }],
  [1, 'held_alku', 'held_isku_t6', 'Ensimmäinen veto', 'Sankariteema matalalta: käyrätorvi, alttoviulut, sellot, Es-duuri', 'Punainen veto = teemaviiva; vedon päähän selkäkuva laakson pohjalla', { paikka: 'B', key: 0.8 }],
  [2, 'held_isku_t6', 'held_viulut', 'Sointuiskut T. 6 ja 8', 'f-sointuiskut: 8 käyrätorvea, fagotit, kontrabassot', 'Teemaviiva jatkuu; iskussa viirinkärjet napsahtavat harjanteen takaa', { paikka: 'B', key: 0.1 }],
  [3, 'held_viulut', 'held_vasket_t13', 'Jouset liittyvät', 'Viulut ensimmäistä kertaa, teema T. 9', 'Vuoret painautuvat sinisellä, ritari sivuprofiilissa, säde viirin kärjessä', { paikka: 'B', key: 0.4 }],
  [4, 'held_vasket_t13', 'held_intro_loppuu', 'Auringonnousu', 'Trumpetti, pasuunat, tuuba, patarummut; nousu ff:ään', 'Aurinko harjanteen huipun takaa, ritari pienenä etualalla, heraldiset viirit', { paikka: 'B', key: 0.7 }],
  [5, 'held_intro_loppuu', 'held_lyyrinen', 'Toverit harjanteella', 'Käyrätorvet ff matalalla, trumpetit p, viulujen juoksutus', 'Toverien siluetit vastavaloon, viirit samaan suuntaan', { paikka: 'B', key: 0.6 }],
  [6, 'held_lyyrinen', 'held_t25', 'Mielikuvitus', 'Puupuhaltimet ja harput ensimmäistä kertaa; lyyrinen vastateema', 'Rasteriliukuma avomerelle: tiirat syntyvät vaahdosta, harpun välkerenkaat', { paikka: 'C', key: 0.6 }],
  [7, 'held_t25', 'held_t31', 'Puupuhallinten laulu', 'Englannintorvi, klarinetit, oboet; käyrätorvet I-II laulavat', 'Tiiraparit veden pinnassa, pilvet ajelehtivat', { paikka: 'C', key: 0.5 }],
  [8, 'held_t31', 'held_t34', 'Uusi aalto', 'pp: harput, juoksutukset, käyrätorvet espressivo', 'Uusi aalto: välkerenkaat ja tuuli, ritari laivan keulassa', { paikka: 'C', key: 0.6 }],
  [9, 'held_t34', 'held_reh4', 'Laivaston kilpa', 'Huilut ja käyrätorvet f, harput; T. 36 ff', 'Laivasto liittyy ja kilpailee rinnakkain, omilla syvyyksillään', { paikka: 'C', key: 0.6 }],
  [10, 'held_reh4', 'held_huippu1', 'Rinne', 'p, uusi kasvu; sforzandot', 'Mainingit kasvavat matalien jousten mukaan, sforzandot keularoiskeina', { paikka: 'C', key: 0.6 }],
  ['11-12', 'held_huippu1', 'held_t47', 'Ensimmäinen huippu', 'Crescendo; ff-sointu; massiivinen ja matala huippu', 'Lähikuva vetäytyy laajaksi, hevonen nousee, aurinko murtautuu', { paikka: 'C', key: 0.7 }],
  [13, 'held_t47', 'held_t49', 'Kultainen niitty', 'Huilu ja englannintorvi soolokuvioin; myrsky laantuu', 'Rasteriliukuma niitylle, kaksi pääskyä ritarin ympärillä', { paikka: 'E', key: 0.6 }],
  [14, 'held_t49', 'held_reh6', 'Puron äärellä', 'pp ausdrucksvoll: huilu, I viulut, harput, tremolo', 'Ritari polvistuu, heinät värisevät', { paikka: 'E', key: 0.5 }],
  [15, 'held_reh6', 'held_t61', 'Hän hajoaa vedoiksi', 'Käyrätorvet I-II laulavat, alttoviulun soolo', 'Hahmo haalistuu, kaksi punaista vetoa friisiin rinnakkain', { paikka: 'E', key: 0.55 }],
  [16, 'held_t61', 'held_reh8', 'Vedot kokoontuvat', 'Crescendo matalalta: käyrätorvet marcato, sellot, bassot', 'Ritari kokoontuu ja marssii ylätasangolle', { paikka: 'F', key: 0.7 }],
  [17, 'held_reh8', 'held_reh9', 'Paluu, koko joukko', 'ff-tutti: 8 käyrätorvea teemassa', 'Joukko lähikuvassa, teemaviiva palaa leveänä', { paikka: 'F', key: 0.5 }],
  [18, 'held_reh9', 'held_reh10', 'Viirien portaat', 'ff-tutti; sankariarpeggiot', 'Kolmen ritarikolmikon viirit avautuvat iskuissa', { paikka: 'F', key: 0.5 }],
  [19, 'held_reh10', 'held_reh11', 'Kaikki liikkeessä', 'fff-tutti [tarkista]', 'Tuuli, viirit, vuoret; myrskyvuori kaukana', { paikka: 'F', key: 0.5 }],
  [20, 'held_reh11', 'held_reh12', 'Putous', 'Puupuhaltimet juoksutuksin, harppujen glissando', 'Putous ryöppyää, muste levittäytyy renkaina', { paikka: 'F', key: 0.5 }],
  [21, 'held_reh12', 'held_isku1', 'Myrsky', 'ff-tutti patarumpuineen [tarkista]', 'Pilvet vyöryvät, sade viivoitusta, joukko kiipeää', { paikka: 'F', key: 0.5 }],
  [22, 'held_isku1', 'held_dom7_sointu', 'Salamat', 'Neljä kohtaloiskua, kohotahti', 'Salama paperin leikkauksena yhä lähemmäs huippua', { paikka: 'F', key: 0.3 }],
  [23, 'held_dom7_sointu', 'held_dom7', 'Selkäkuva ja sädekehä', 'Pasuunat ja tuubat fff, dominanttiseptimi', 'Ritari huipulla selkä kameraan, sädekehä', { paikka: 'F', key: 0.8 }],
  [24, 'held_gp', 'wid_1_huilu', 'Yleistauko', 'Hiljaisuus', 'Säteet sammuvat, paperi nousee kuvan yli', { paikka: 'F', key: 0.5 }],
];
