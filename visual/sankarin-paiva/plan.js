// Kuvakäsikirjoitus koodina (runs/drehbuehne-400/storyboard.md). Lohkot rakennetaan analyysin
// jaksoista (segments.json), joten rajat ovat tämän esityksen omat.

// [nimi, ensimmäinen jakso (0-pohjainen indeksi segments.json:ssa)]
const BLOCKS = [
  ['rise', 0], // 1 sankari astuu esiin
  ['wake', 1], // 2–3 viulut tulevat
  ['drums', 3], // 4 lyömäsoittimet
  ['march', 4], // 5 vasket sisään, viulut ulos (vahvistettu)
  ['fancy', 5], // 6–8 mielikuvitus
  ['fire', 8], // 9–11 palo
  ['breath', 11], // 12–14 hengähdys, harppu, enne vastustajista
  ['strive', 14], // 15–17 pyrkimys, torni nousee
  ['upright', 17], // 18–19 suoraselkäisyys
  ['uphill', 19], // 20–25 taistelu ylämäkeen
  ['hammer', 25], // 26–28 neljä jähmettymistä
  ['summit', 28], // 29 viimeinen nousu ja dominanttiseptimi
  ['pause', 29], // 30 tauko: tyhjä paperi
  ['critics', 30], // 31 yhdeksän vastustajaa
  ['answer', 31], // 32–33 sankari vastaa hiljaa
  ['night', 33], // 34–40 yö
  ['return', 40], // 41–43 vastustajat palaavat
  ['snap', 43], // 44–45 kärsivällisyys loppuu
];

export function createPlan(S) {
  const blocks = BLOCKS.map(([name, k], j) => {
    const a = j === 0 ? S.T0 : S.segs[k].a;
    const next = BLOCKS[j + 1];
    const b = next ? S.segs[next[1]].a : S.T_END;
    return { name, a, b, j };
  });
  // Tauko alkaa dominanttiseptimin jälkeen (A 3:59.2) ja loppuu jakson 2 alkuun.
  const summit = blocks.find((x) => x.name === 'summit');
  const pause = blocks.find((x) => x.name === 'pause');
  summit.b = pause.a = S.T_DOM7 + 0.2;
  pause.b = blocks.find((x) => x.name === 'critics').a = S.T_WID;
  function blockAt(t) {
    if (t < blocks[0].a) return { name: 'prologue', a: 0, b: blocks[0].a, j: -1 };
    for (let j = blocks.length - 1; j >= 0; j--) if (t >= blocks[j].a) return blocks[j];
    return blocks[0];
  }
  const byName = Object.fromEntries(blocks.map((x) => [x.name, x]));
  return { blocks, blockAt, byName };
}
