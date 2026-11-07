// H, metsäaukio: ohjauksen (docs/ohjaus.md, luku 3) otot 3.1–3.8 (gef_viulu … gef_rakkaus). Kosinta on
// toimintaa: viulu puhuu (valkoinen viiva puiden lomassa ja aukiolla), ritari vastaa teolla
// (asentokirjasto puppets.js POSES/KP), ja leikkaus on vastaotto ankkurissa tai jaksorajassa.
//   3.1 kuulee äänen, laskee viirin, lähtee puita kohti    3.2 piiloleikki: kello, seuraa, istuu kivelle
//   3.3 viisi mielialaa, jokaiseen teko omassa paikassa     3.4 kellon nosto, viiva pyörteeksi
//   3.5 siniset pisteet puiden takana, asettuu väliin       3.6 keihään isku maahan, viiri leimahtaa; istuu kivelle
//   3.7 kämmen ylöspäin, viiva laskeutuu                    3.8 viiva nousee hahmoksi, viirin haku, rantaan
// Ajat vain ankkureista (S.A) ja jaksorajoista (S.segs); kovakoodattuja sekunteja ei ole. Puhdas seek(t).

import * as THREE from 'three';
import { C, ink, flat, group, poly, circle, rect, strokeGeo, ridgeGeo, earleTree, waveMat, pennantGeo, sky as makeSky, water, clamp, smoothstep, mix, hash1 } from './paper.js';
import { glide, leader } from './hero.js';
import { common } from './world.js';
import { KP, kpose, kmix, POSES, handFK } from './puppets.js';
import { companionFigure, dirOf, companionTrail } from './companion.js';

export function build(K) {
  const { S } = K;
  const W = common(S);
  const at = (id) => S.A(id).t;
  const tViulu = at('gef_viulu'), tV1 = at('gef_vastaus1'), tV2 = at('gef_viulu2'), tA2 = at('gef_vastaus2');
  const tMiel = at('gef_mielialat'), tA3 = at('gef_vastaus3'), tKiih = at('gef_kiihkea'), tPuu = at('gef_puupuhaltimet');
  const tLeim = at('gef_leimahdus'), tLust = at('gef_lustig'), tRau = at('gef_rauhoittava'), tV3 = at('gef_viulu3'), tRak = at('gef_rakkaus');
  const win = (a, b, c, d, t) => smoothstep(a, b, t) * (1 - smoothstep(c, d, t));
  const fr = (a, b, k) => a + (b - a) * k;   // osuus ankkurivälistä
  // jaksorajat (segments.json) välillä: leikkaukset ja teot sidotaan niihin, ei sekunteihin
  const segsIn = (a, b) => S.segs.filter((s) => s.a > a && s.a < b).map((s) => s.a);
  const pick = (list, i, fallback) => (list.length > i ? list[i] : fallback);

  // --- Ajat jaksorajoista -------------------------------------------------------------------------
  const c42 = segsIn(tV2 + 0.5, tA2 - 1.5);                       // 3.2 vastaotot (viulu kysyy / ritari vastaa)
  const s43 = segsIn(tA2 + 2, tMiel - 2);                          // 3.2 jälkiosa: istuu kivelle, viiva lähestyy
  const tSit = pick(s43, 0, fr(tA2, tMiel, 0.2));                  // istuu kivelle ja odottaa
  const tLah = pick(s43, s43.length - 1, fr(tA2, tMiel, 0.7));     // viiva lähestyy varovasti
  const tSitMid = pick(s43, 1, fr(tSit, tLah, 0.5));                // odotuksen keskileikkaus (jaksoraja)
  const mb = segsIn(tMiel - 0.6, tA3 - 1);                         // 3.3 mielialat jaksorajoissa (oppaan järjestys: tulkinta)
  const mAt = (i, k) => pick(mb, i, fr(tMiel, tA3, k));
  const tKai = tMiel, tIlo = mAt(2, 0.18), tKev = mAt(4, 0.38), tKev2 = mAt(5, 0.46), tHel = mAt(6, 0.56), tSar = mAt(8, 0.73), tSar2 = mAt(9, 0.84);
  const s47 = segsIn(tPuu + 1, tLeim - 1);                         // 3.5 kolme ottoa
  const t47a = pick(s47, 1, fr(tPuu, tLeim, 0.33)), t47b = pick(s47, 3, fr(tPuu, tLeim, 0.7));
  const tSitB = pick(segsIn(tLust + 5, tRau - 3), 0, fr(tLust, tRau, 0.55));   // 3.6 istuu kivelle, laskee kypärän
  const s51 = segsIn(tV3 + 5, tRak - 4);                           // 3.8 nousee, hakee viirin, rantaan
  const tStand = pick(s51, 0, fr(tV3, tRak, 0.27)), tPick = pick(s51, 1, fr(tV3, tRak, 0.5)), t51c = pick(s51, 2, fr(tV3, tRak, 0.77));

  const plan = [[tKai, 'kaipaus'], [tIlo, 'ilo'], [tKev, 'kevyt'], [tHel, 'hellyys'], [tSar, 'sarkasmi'], [tA3, 'vastaus'], [tKiih, 'riehakkuus'], [tPuu, 'kevyt'], [tLeim, 'sarkasmi'], [tLust, 'riehakkuus'], [tRau, 'hellyys'], [tV3, 'sentimentaali']];
  const moodAt = (t) => { let m = 'hellyys'; for (const [tt, n] of plan) if (t >= tt) m = n; return t < tKai ? 'hellyys' : m; };

  // --- Paikat aukiolla -----------------------------------------------------------------------------
  const X0 = -4;                 // ritarin alkupaikka aukion laidalla
  const ROCK_A = { x: 1.5, y: 0.55 }, ROCK_B = { x: 12.3, y: 0.5 };
  const STONES = [3.4, 4.9, 6.3, 7.7].map((x, i) => ({ x, y: 0.22 + 0.06 * hash1(i + 3) }));
  const BROOK = { x: 10.6, w: 2.4 };
  const X_KEV = 6.5, X_SAR = 9.1, X_PUU = 10.6, X_SHORE = 21.5;
  const LAND = { x: 13.6 };      // viivan laskeutumispaikka (3.8)
  const dirV = dirOf(K.viuluviiva);
  const pitch = (tt) => Math.max(-2.4, Math.min(2.4, (dirV(tt).midi - 70) * 0.42));
  const stair = (p, n) => { const q = clamp(p) * n; const i = Math.floor(q); return Math.min(n, i + smoothstep(0.25, 0.75, q - i)) / n; };

  // --- Ritari: paikka, suunta, asento --------------------------------------------------------------
  const plantX = X_PUU + 0.1;    // keihään isku maahan (3.6) tapahtuu tässä
  const lanceDown = (t) => smoothstep(fr(tViulu, tV1, 0.12), fr(tViulu, tV1, 0.5), t) * (1 - smoothstep(tV1, tV1 + 1.8, t));   // 3.1 viiri maahan, 3.2 ylös vastaukseen
  const sitA = (t) => smoothstep(tSit, tSit + 3, t) * (1 - smoothstep(tMiel, tMiel + 2.6, t));
  const spinK = (t) => smoothstep(tKev2, tKev2 + 1.6, t) * (1 - smoothstep(tA3, tA3 + 1.4, t));                           // selkä viivalle -> kääntyy takaisin 3.4
  const look47 = (t) => smoothstep(t47a, t47a + 1.6, t) * (1 - smoothstep(t47b, t47b + 1.6, t));                            // 3.5 kääntyy pisteitä kohti
  const kneelK = (t) => smoothstep(tHel, tHel + 3.5, t) * (1 - smoothstep(tSar - 0.4, tSar + 1.0, t));
  const plantK = (t) => smoothstep(tLeim, fr(tLeim, tLust, 0.4), t);
  const hasLance = (t) => t < tLust || t >= tPick;
  const sitB = (t) => smoothstep(tSitB, tSitB + 3, t) * (1 - smoothstep(tStand, tStand + 3, t));
  const offerK = (t) => smoothstep(tRau, fr(tRau, tV3, 0.3), t) * (1 - smoothstep(tStand - 1, tStand + 1.5, t));
  const hearK = (t) => smoothstep(tViulu - 0.3, tViulu + 1.4, t) * (1 - smoothstep(tV1 - 1.5, tV1, t));   // 3.1 kuulee äänen: pää kääntyy ylös
  const callK = (t) => {
    const a = smoothstep(tV1 - 0.2, tV1 + 2, t) * (1 - smoothstep(tV2 - 1, tV2 + 1.2, t));                                     // 3.2 vastaa kellolla
    const b = smoothstep(tA3 - 0.2, tA3 + 2.2, t) * (1 - smoothstep(tKiih - 1.5, tKiih + 1.5, t));                             // 3.4 pitkä vastaus
    return Math.max(a, b);
  };
  const stingOns = S.onsetsIn(tSar, tA3, (t) => S.fam.violins(t) > 0.25 || S.energy.violins(t) > 0.35).filter((o, i, arr) => i === 0 || o - arr[i - 1] > 1.2).slice(0, 8);
  const sting = (t) => stingOns.reduce((m, o) => (t >= o ? Math.max(m, Math.exp(-(t - o) / 0.55)) : m), 0);

  function landXraw(t) {
    let x = X0;
    x += (-1 - X0) * smoothstep(fr(tViulu, tV1, 0.5), tV1, t);                              // 3.1 lähtee ääntä kohti
    x += 2.0 * smoothstep(tV2, pick(c42, 0, fr(tV2, tA2, 0.35)), t);                        // 3.2 astuu aukiolle, seuraa
    x += 1.6 * smoothstep(pick(c42, 1, fr(tV2, tA2, 0.6)), pick(c42, 2, fr(tV2, tA2, 0.9)), t);
    x -= 1.3 * smoothstep(tA2, tA2 + 3, t);                                                   // palaa kivelle ja istuu
    x += (ROCK_A.x + 0.3 - x) * smoothstep(tSit - 2, tSit + 0.5, t);
    // 3.3: ilo seuraa askel askeleelta kiveltä kivelle; kevyt ja hellyys paikallaan; sarkasmi perääntyy
    x += (X_KEV - (ROCK_A.x + 0.3)) * stair((t - tIlo - 0.8) / Math.max(1, tKev - tIlo - 1.5), 4) * (t >= tIlo ? 1 : 0);
    x += (X_SAR - X_KEV) * (0.6 * smoothstep(tSar, tSar + 4, t) + 0.4 * smoothstep(tSar2, tSar2 + 3, t));
    x += (X_PUU - X_SAR) * smoothstep(tPuu, fr(tPuu, tLeim, 0.25), t);                       // 3.5 asettuu pisteiden ja viivan väliin
    x += (ROCK_B.x + 0.3 - X_PUU) * smoothstep(fr(tLust, tRau, 0.1), fr(tLust, tRau, 0.5), t); // 3.6 kivelle
    x += (plantX - 0.9 - (ROCK_B.x + 0.3)) * smoothstep(tStand + 1.5, tPick, t);               // 3.8 hakee viirin
    x += (X_SHORE - (plantX - 0.9)) * smoothstep(tPick + 1.2, tRak + 0.3, t);                 // rantaan rinnakkain
    return x;
  }
  const landX = W.smooth(landXraw, 0.25);
  const facingK = (t) => Math.cos(Math.PI * Math.max(spinK(t), look47(t)));
  const SIT = kpose({ ...KP.sit, lean: 0.06, tilt: -0.1, aN: 0.5, eN: 1.1, aF: 0.35, eF: 1.0 });
  const SIT_OFFER = kpose({ ...SIT, aN: 1.0, eN: 0.15, palm: 1, tilt: -0.3 });
  const KNEEL_OFFER = kpose({ ...KP.kneel, aN: 0.8, eN: 0.3, palm: 1, tilt: -0.2 });
  function heroState(t) {
    const x0 = landX(t);
    const v = (landX(t + 0.15) - landX(t - 0.15)) / 0.3;
    const gait = smoothstep(0.04, 0.12, Math.abs(v));
    let p = kmix(KP.stand, KP.proud, 0.15);
    p = kmix(p, kmix(KP.stepA, KP.stepB, 0.5 + 0.5 * Math.sin(x0 * (Math.PI * 2) / 1.5)), gait);
    const horn = smoothstep(0.25, 0.7, S.energy.horns(t));
    p = kmix(p, KP.look, 0.8 * hearK(t));
    p = kmix(p, KP.call, callK(t) * (0.55 + 0.45 * horn));
    // 3.3 eleet
    const m = moodAt(t), inM = t >= tMiel && t < tA3;
    if (inM && m === 'kaipaus') p = { ...p, tilt: p.tilt + 0.45 * smoothstep(tKai, tKai + 2.5, t) * (1 - smoothstep(tIlo - 1, tIlo + 0.5, t)) };
    const kn = kneelK(t);
    p = kmix(p, KNEEL_OFFER, kn);
    const st = sting(t) * (t >= tSar && t < tA3 + 0.5 ? 1 : 0);
    p = { ...p, lean: p.lean - 0.28 * st, tilt: p.tilt - 0.15 * st };
    // 3.6 keihään isku maahan, sitten istuminen ja kypärän lasku; 3.7 kämmen
    const pk = plantK(t);
    if (pk > 0 && t < tLust + 0.3) p = kmix(p, POSES.keihaan_isku_maahan(pk), smoothstep(0, 0.08, pk) * (1 - smoothstep(tLust - 0.3, tLust + 0.3, t)));
    const sa = sitA(t), sb = sitB(t);
    p = kmix(p, SIT, Math.max(sa, sb));
    p = { ...p, tilt: p.tilt - 0.45 * sb * (1 - smoothstep(tRau, tRau + 3, t)) };
    p = kmix(p, SIT_OFFER, offerK(t));
    const lanceAng = mix(0.12 + 0.06 * Math.sin(t * 0.3), 1.25, lanceDown(t)) + 0.35 * st * (t < tA3 ? 1 : 0);
    let facing = facingK(t);
    if (Math.abs(facing) < 0.12) facing = 0.12 * (facing < 0 ? -1 : 1);
    const y = ROCK_A.y * 0.8 * sa + ROCK_B.y * 0.8 * sb;
    return { x: x0, y, z: 0, facing, pose: p, lanceAng: pk > 0.05 && t < tLust + 0.3 ? (p.lanceAng ?? lanceAng) : lanceAng };
  }

  // --- Kumppani: viivan kärki (companionTrail) ja hahmo (3.8) --------------------------------------------
  const LINE_Z = -9.9;
  const whirl = W.integ((tt) => (tt < tA3 - 1 || tt > tPuu + 2 ? 0 : 0.9 + 1.7 * smoothstep(tKiih - 0.6, tKiih + 1.2, tt) * (1 - smoothstep(tPuu, tPuu + 2, tt)) + 0.6 * S.energy.violins(tt)));
  const laugh = W.integ((tt) => (tt < tLeim || tt > tV3 ? 0 : 3.2 * smoothstep(tLust - 0.5, tLust + 0.5, tt) * (1 - smoothstep(tRau - 1, tRau + 1, tt)) * (0.5 + 0.5 * clamp(S.energy.violins(tt)))));
  const circ = W.integ((tt) => (tt < tKai - 0.5 || tt > tIlo + 0.5 ? 0 : 0.75));
  const landed = (t) => smoothstep(tV3, fr(tV3, tRak, 0.14), t);        // viiva laskeutuu maahan
  const figM = (t) => smoothstep(fr(tV3, tRak, 0.1), fr(tV3, tRak, 0.3), t);   // nousee hahmoksi
  const gapAfter = (tt, cut, d = 0.45) => tt >= cut && tt < cut + d;
  function tipC(tt) {
    if (tt < tViulu - 1.0) return null;
    const hs = heroState(tt);
    const hx = hs.x;
    if (tt < tV1) {   // 3.1 puiden lomassa, kulkee oikealle
      return { x: -9 + 16 * smoothstep(tViulu - 1, tV1, tt), y: 5.6 + pitch(tt), z: LINE_Z };
    }
    if (tt < tV2) return null;   // pakenee puun taakse torvien vastauksen ajaksi
    if (tt < tA2) {   // 3.2 ilmestyy toisaalle, karkaa jaksorajoissa
      const edges = [tV2, ...c42];
      let i = 0; for (let k = 0; k < edges.length; k++) if (tt >= edges[k]) i = k;
      if (gapAfter(tt, edges[i])) return null;
      const xs = [9.5, 13.5, 7.5, 12.0];
      return { x: xs[i % 4] - 0.6 * smoothstep(edges[i], edges[i] + 8, tt), y: 6.2 + pitch(tt) + 0.6 * (i % 2), z: LINE_Z };
    }
    if (tt < tLah) {   // 3.2 ritari istuu, viiva pysyy kaukana puissa
      if (gapAfter(tt, tA2, 1.5)) return null;
      return { x: 12.5 - 3 * smoothstep(tSit, tLah, tt), y: 7 - 1.2 * smoothstep(tSit, tLah, tt) + pitch(tt), z: LINE_Z };
    }
    if (tt < tKai) {   // lähestyy varovasti aukiolle
      const k = smoothstep(tLah, tKai, tt);
      return { x: mix(9.5, hx + 2.8, k), y: mix(5.8, 3.6, k) + pitch(tt), z: mix(LINE_Z, -0.8, k) };
    }
    if (tt < tIlo) {   // kaipaus kiertää ritaria
      const a = circ(tt);
      return { x: hx + 2.6 * Math.cos(a), y: 5.6 + 1.0 * Math.sin(a) + 0.5 * pitch(tt), z: -3 + 0.6 * Math.sin(a) };
    }
    if (tt < tKev) {   // ilo hyppii kiveltä kivelle
      const p = clamp((tt - tIlo) / Math.max(1, tKev - tIlo));
      const sx = STONES[0].x + (STONES[3].x - STONES[0].x) * p;
      const hop = Math.abs(Math.sin(Math.PI * p * 4));
      return { x: sx, y: 0.5 + 1.9 * hop + 0.3 * pitch(tt), z: -0.8 };
    }
    if (tt < tHel) {   // kevyt: katoaa ja ilmestyy selän taakse
      if (gapAfter(tt, tKev2, 0.6)) return null;
      const behind = tt >= tKev2;
      return { x: hx + (behind ? -2.6 : 2.4), y: 5.4 + 0.8 * pitch(tt), z: -3 };
    }
    if (tt < tSar) {   // hellyys laskeutuu kämmenelle (kämmen on käännetyllä ritarilla -x-puolella)
      const k = smoothstep(tHel, tHel + 4, tt);
      const fk = handFK(leadP, heroState(tt).pose, true);
      const palmX = hx + hs.facing * fk.hand[0] + hs.facing * 0.2, palmY = hs.y + fk.hand[1] + 0.25;
      return { x: mix(hx - 2.6, palmX, k), y: mix(3.0, palmY, k) + (1 - k) * 0.5 * pitch(tt), z: 0.1 };
    }
    if (tt < tA3) {   // sarkasmi pistää: siksak pään korkeudella, ritari perääntyy
      return { x: hx - 1.4 - 0.5 * Math.sin(tt * 2.1), y: 5.0 + 0.9 * pitch(tt), z: -3 };
    }
    if (tt < tPuu) {   // 3.4 pyörre ritarin ympärillä, laajenee kiihkeässä
      const a = whirl(tt);
      const r = 1.9 + 1.5 * smoothstep(tKiih, tPuu, tt);
      return { x: hx + r * Math.cos(a), y: 5.4 + 0.5 * r * Math.sin(a) + 0.4 * pitch(tt), z: -3 + 0.7 * Math.sin(a) };
    }
    if (tt < tLeim) {   // 3.5 viiva ritarin oikealla, pisteet vasemmalla puiden takana
      return { x: hx + 4.0 + 0.3 * Math.sin(tt * 0.7), y: 4.3 + pitch(tt), z: -0.8 };
    }
    if (tt < tRau) {   // 3.6 pakenee korkealle ja nauraa koukeroin
      const up = smoothstep(tLeim, tLeim + 3, tt);
      const a = laugh(tt);
      return { x: hx + 4.5 + 1.3 * Math.sin(a), y: mix(4.3, 9.6, up) + 1.3 * (Math.cos(a) - 1) * smoothstep(tLust, tLust + 1, tt) + 0.5 * pitch(tt), z: -0.8 };
    }
    if (tt < tV3) {   // 3.7 laskeutuu hitaasti kämmentä kohti
      const k = smoothstep(tRau, tV3, tt);
      const fk = handFK(leadP, heroState(tt).pose, true);
      return { x: mix(hx + 4.5, hx + fk.hand[0] + 1.6, k), y: mix(9.6, hs.y + fk.hand[1] + 1.1, k) + (1 - k) * 0.4 * pitch(tt), z: -0.3 };
    }
    // 3.8 laskeutuu maahan ritarin eteen (hahmo nousee tästä)
    const k = landed(tt);
    const fk = handFK(leadP, heroState(tt).pose, true);
    return { x: mix(hx + fk.hand[0] + 1.6, LAND.x, k), y: mix(hs.y + fk.hand[1] + 1.1, 0.35, k), z: 0.1 };
  }

  // --- Kamera (sh: kaksi avainta, glide; follow = ritarin paikka) ----------------------------------------
  const focusX = (t) => landX(t);
  const P = (s, t) => { const f = (s.follow ?? 0) * focusX(t); return { pos: [s.cx + f, s.y, s.z], look: [s.lx + f, s.ly, s.lz ?? 0], fov: s.fov }; };
  const mixS = (a, b, w) => { const o = {}; for (const k in a) o[k] = typeof a[k] === 'number' ? a[k] + ((b[k] ?? a[k]) - a[k]) * w : a[k]; return o; };
  const sh = (name, a, b, s0, s1 = s0) => ({ name, a, b, cam: (u, t) => P(mixS(s0, s1, glide(u)), t) });
  const shots = [];
  // Stillisääntö 3: ritari joko täyttää kuvan (CL, z ~6) tai on pieni maailmaa vasten (laaja, z >= 16); ei keskikokoa.
  const CL = { cx: -0.3, follow: 1, y: 1.45, z: 6.2, lx: 0.4, ly: 1.4, fov: 38 };
  const CLb = { ...CL, z: 5.8, cx: -0.2 };
  const WIDE_F = { cx: 0.5, follow: 1, y: 3.0, z: 18, lx: 1.5, ly: 3.8, fov: 46 };
  shots.push(sh('3.1 ääni metsästä', tViulu - 2, tV1, { cx: -3.5, follow: 0, y: 3.0, z: 20, lx: 1.0, ly: 4.6, fov: 46 }, { cx: -2.0, follow: 0, y: 3.1, z: 18, lx: 1.5, ly: 4.7, fov: 46 }));
  shots.push(sh('3.2 vastaa kellolla', tV1, tV2, CL, CLb));
  {
    const edges = [tV2, ...c42, tA2];
    const skyS = { cx: 9.5, follow: 0, y: 3.4, z: 19, lx: 9.5, ly: 5.8, fov: 48 };
    edges.slice(0, -1).forEach((a, i) => {
      const b = edges[i + 1];
      const j = i % 4;
      if (j === 0) shots.push(sh('3.2 viiva puissa', a, b, skyS, { ...skyS, cx: 10.5, lx: 10.5, z: 18 }));
      else if (j === 1) shots.push(sh('3.2 ritari seuraa', a, b, CL, CLb));
      else if (j === 2) shots.push(sh('3.2 viiva toisaalla', a, b, { ...skyS, cx: 8, lx: 8 }, { ...skyS, cx: 9, lx: 9, z: 17.5 }));
      else shots.push(sh('3.2 ritari ja viiva', a, b, { cx: 2, follow: 0.6, y: 3.0, z: 19, lx: 3.0, ly: 3.8, fov: 44 }, { cx: 2.4, follow: 0.6, y: 3.1, z: 18, lx: 3.3, ly: 3.9, fov: 44 }));
    });
  }
  shots.push(sh('3.2 vastaus: sellot, palaa kivelle', tA2, tSit, CL, { ...CL, z: 6.6, cx: -0.5 }));
  shots.push(sh('3.2 istuu kivelle ja odottaa', tSit, tSitMid, { cx: 4.5, follow: 0, y: 3.0, z: 17, lx: 5.5, ly: 4.2, fov: 46 }, { cx: 4.0, follow: 0, y: 3.0, z: 16, lx: 5.0, ly: 4.0, fov: 46 }));
  shots.push(sh('3.2 odottaa: viiva puissa', tSitMid, tLah, { cx: 1.0, follow: 0, y: 1.3, z: 6.0, lx: 1.8, ly: 1.4, fov: 38 }, { cx: 1.1, follow: 0, y: 1.35, z: 5.7, lx: 1.9, ly: 1.45, fov: 38 }));
  shots.push(sh('3.2 viiva lähestyy varovasti', tLah, tKai, { cx: 2.5, follow: 0.5, y: 3.0, z: 17, lx: 3.0, ly: 3.6, fov: 44 }, { cx: 2.2, follow: 0.5, y: 2.9, z: 16, lx: 2.8, ly: 3.5, fov: 44 }));
  // 3.3: viisi mielialaa, viisi paikkaa; lähikuva ja laaja vuorottelevat
  shots.push(sh('3.3 kaipaus kiertää', tKai, tIlo, { cx: 0.0, follow: 1, y: 3.0, z: 17, lx: 0.2, ly: 4.4, fov: 44 }, { cx: 0.2, follow: 1, y: 3.0, z: 16, lx: 0.3, ly: 4.4, fov: 44 }));
  shots.push(sh('3.3 ilo kiveltä kivelle', tIlo, tKev, { cx: 2.2, follow: 0.5, y: 2.6, z: 16.5, lx: 3.0, ly: 2.8, fov: 46 }, { cx: 2.8, follow: 0.5, y: 2.7, z: 16, lx: 3.4, ly: 2.9, fov: 46 }));
  shots.push(sh('3.3 kevytmielisyys selän taakse', tKev, tHel, { cx: 0.3, follow: 1, y: 3.0, z: 17, lx: 0.0, ly: 4.4, fov: 44 }, { cx: -0.3, follow: 1, y: 3.0, z: 16, lx: -0.3, ly: 4.4, fov: 44 }));
  shots.push(sh('3.3 hellyys kämmenelle', tHel, tSar, { cx: -0.9, follow: 1, y: 1.4, z: 6.0, lx: -0.9, ly: 1.3, fov: 38 }, { cx: -1.0, follow: 1, y: 1.3, z: 5.6, lx: -1.0, ly: 1.2, fov: 38 }));
  shots.push(sh('3.3 sarkasmi pistää', tSar, tSar2, { cx: -1.0, follow: 1, y: 3.0, z: 17, lx: -0.8, ly: 4.4, fov: 44 }, { cx: -0.7, follow: 1, y: 3.0, z: 16, lx: -0.5, ly: 4.4, fov: 44 }));
  shots.push(sh('3.3 sarkasmi: perääntyy', tSar2, tA3, { cx: 1.0, follow: 1, y: 3.0, z: 17, lx: 0.4, ly: 3.4, fov: 44 }, { cx: 1.4, follow: 1, y: 3.0, z: 16, lx: 0.5, ly: 3.5, fov: 44 }));
  shots.push(sh('3.4 painokas vastaus: kello', tA3, tKiih, { cx: 0.2, follow: 1, y: 3.0, z: 17, lx: 0.5, ly: 4.4, fov: 44 }, { cx: 0.2, follow: 1, y: 3.0, z: 16, lx: 0.5, ly: 4.4, fov: 44 }));
  shots.push(sh('3.4 viiva pyörteeksi, laajenee', tKiih, tPuu, { cx: -0.2, follow: 1, y: 3.0, z: 16, lx: 0.5, ly: 4.4, fov: 44 }, { cx: 0.2, follow: 1, y: 3.2, z: 18, lx: 0.6, ly: 3.8, fov: 46 }));
  shots.push(sh('3.5 pisteet puiden takana', tPuu, t47a, { cx: -3.5, follow: 1, y: 3.4, z: 20, lx: -1.0, ly: 4.4, fov: 46 }, { cx: -3.0, follow: 1, y: 3.4, z: 19, lx: -0.8, ly: 4.4, fov: 46 }));
  shots.push(sh('3.5 kääntyy ääniä kohti', t47a, t47b, { cx: 0.5, follow: 1, y: 1.6, z: 6.8, lx: -0.5, ly: 1.6, fov: 40 }, { cx: 0.3, follow: 1, y: 1.65, z: 6.4, lx: -0.6, ly: 1.65, fov: 40 }));
  shots.push(sh('3.5 asettuu väliin', t47b, tLeim, { cx: 1.5, follow: 1, y: 3.0, z: 18, lx: 1.0, ly: 3.8, fov: 46 }, { cx: 1.0, follow: 1, y: 3.0, z: 17, lx: 0.8, ly: 3.7, fov: 46 }));
  shots.push(sh('3.6 keihään isku: viiri leimahtaa', tLeim, tLust, { cx: -0.3, follow: 1, y: 1.8, z: 7.0, lx: 0.6, ly: 2.0, fov: 40 }, { cx: 0.4, follow: 1, y: 3.4, z: 18, lx: 1.4, ly: 4.2, fov: 46 }));
  shots.push(sh('3.6 viiva nauraa korkealla', tLust, tSitB, { cx: 1.5, follow: 1, y: 4.5, z: 18, lx: 2.5, ly: 6.4, fov: 50 }, { cx: 1.8, follow: 1, y: 4.8, z: 17, lx: 2.8, ly: 6.8, fov: 50 }));
  shots.push(sh('3.6 istuu kivelle, laskee kypärän', tSitB, tRau, { cx: -0.8, follow: 1, y: 1.5, z: 6.2, lx: 0.1, ly: 1.4, fov: 38 }, { cx: -0.7, follow: 1, y: 1.45, z: 5.8, lx: 0.2, ly: 1.35, fov: 38 }));
  shots.push(sh('3.7 kämmen ylöspäin', tRau, tV3, { cx: -0.2, follow: 1, y: 1.3, z: 5.4, lx: 0.9, ly: 1.2, fov: 36 }, { cx: 0.0, follow: 1, y: 1.4, z: 5.0, lx: 1.0, ly: 1.3, fov: 36 }));
  shots.push(sh('3.8 viiva nousee hahmoksi', tV3, tStand, { cx: -0.4, follow: 1, y: 1.5, z: 7.2, lx: 1.4, ly: 1.4, fov: 40 }, { cx: -0.8, follow: 1, y: 1.7, z: 8.2, lx: 1.5, ly: 1.6, fov: 40 }));
  shots.push(sh('3.8 hakee viirin', tStand, tPick, { cx: 1.2, follow: 1, y: 3.0, z: 17, lx: 0.4, ly: 3.6, fov: 44 }, { cx: 1.0, follow: 1, y: 3.0, z: 16, lx: 0.3, ly: 3.6, fov: 44 }));
  shots.push(sh('3.8 rinnakkain rantaan', tPick, t51c, { cx: -1.5, follow: 1, y: 3.0, z: 18, lx: 1.4, ly: 3.6, fov: 44 }, { cx: -1.0, follow: 1, y: 3.1, z: 19, lx: 1.6, ly: 3.8, fov: 44 }));
  shots.push(sh('3.8 aurinko laskee', t51c, tRak + 1, { cx: -4, follow: 1, y: 3.2, z: 20, lx: 1.5, ly: 4.2, fov: 46 }, { cx: -5, follow: 1, y: 3.4, z: 22, lx: 1.5, ly: 4.6, fov: 46 }));
  const shotOf = (t) => { let s = shots[0]; for (const x of shots) if (t >= x.a) s = x; return s; };
  const camAt = (t) => { const s = shotOf(t); return s.cam(clamp((t - s.a) / Math.max(0.05, s.b - s.a)), t); };

  // --- Näyttämö ------------------------------------------------------------------------------------------
  const scene = new THREE.Scene();
  const SKY = makeSky(scene);
  const hillMat = ink(C.blue, { shade: C.black, raster: 0.55 });
  const hills = flat(scene, ridgeGeo(-400, 600, 22, 17, { lambda: 70, base: -300 }), hillMat, { z: -200, y: 3 });
  hills.userData.edge = { name: 'kukkulat' };
  const farGround = flat(scene, ridgeGeo(-400, 600, 0.5, 7, { lambda: 14, base: -30 }), ink(C.black, { shade: C.blue, raster: 0.3 }), { z: -11, y: 2.4 });
  farGround.userData.edge = { name: 'metsänpohja' };
  // puut: kaukainen metsä (Earle), kaksi syvyyttä, jotta viiva kulkee puiden lomassa
  const treeMat = ink(C.black, { shade: C.blue, raster: 0.22 });
  const farTrees = [];
  for (let i = 0; i < 70; i++) {
    const h = 2.4 + 2.8 * hash1(i * 3 + 100) + (i % 5 === 0 ? 1.6 : 0);
    farTrees.push(flat(scene, earleTree(h, h * 0.42, i * 11 + 3), treeMat, { x: -140 + i * 5.6 + 3 * hash1(i * 3 + 101), y: 2.5, z: i % 2 ? -9.3 : -10.6 }));
  }
  // aukion laitojen suuret puut (lähellä, mustat): vasen laita ja rannan pää
  const bigAt = [[-9.5, 14], [-12.5, 11.5], [-16, 15], [-22, 12.5], [-32, 15], [X_SHORE + 6, 14], [X_SHORE + 10.5, 11], [X_SHORE + 15, 15], [X_SHORE + 23, 12.5]];
  bigAt.forEach(([x, h], i) => flat(scene, earleTree(h, h * 0.44, i * 17 + 5), ink(C.black, { shade: C.blue, raster: 0.12 }), { x, y: -0.2, z: 0.3 + 0.1 * (i % 3) }));
  // maa: niitty ja etuala
  const meadowMat = ink(C.blue, { shade: C.black, raster: 0.4, grad: [C.black, 0.4, -3.5, 0.55] });
  const meadow = flat(scene, ridgeGeo(-400, 600, 0.5, 5, { lambda: 11, base: -40 }), meadowMat, { z: -0.4, y: -0.05 });
  meadow.userData.edge = { name: 'niitty' };
  const fore = flat(scene, ridgeGeo(-400, 600, 0.35, 21, { lambda: 6, base: -40 }), ink(C.black, { shade: C.blue, raster: 0.25 }), { z: 1.4, y: -1.25 });
  fore.userData.edge = { name: 'etuala' };
  // kivet: istuinkivi A, hyppykivet, istuinkivi B puron luona
  const rockMat = ink(C.black, { shade: C.blue, raster: 0.35 });
  const rockShape = (w, h, seed) => poly(Array.from({ length: 14 }, (_, i) => { const a = Math.PI * (i / 13); return [w * Math.cos(a) * (0.9 + 0.2 * hash1(seed + i)), h * Math.sin(a) * (0.85 + 0.3 * hash1(seed + 20 + i))]; }));
  flat(scene, rockShape(1.1, ROCK_A.y + 0.1, 7), rockMat, { x: ROCK_A.x, y: -0.05, z: -0.35 });
  flat(scene, rockShape(1.0, ROCK_B.y + 0.1, 9), rockMat, { x: ROCK_B.x, y: -0.05, z: -0.35 });
  STONES.forEach((s, i) => flat(scene, rockShape(0.45, s.y + 0.05, 30 + i), rockMat, { x: s.x, y: -0.05, z: -0.3 }));
  // puro: kapea sininen juova, välke harpusta
  const brook = water(scene, BROOK.w, 1.1, { x: BROOK.x, y: -0.3, z: -0.25, base: C.blue, deep: C.black });
  brook.mesh.scale.y = 0.5;
  // siniset pisteet puiden takana (3.5): puupuhaltimet
  const NDOT = 36;
  const dots = new THREE.InstancedMesh(new THREE.CircleGeometry(1, 14), ink(C.blue, {}), NDOT);
  dots.frustumCulled = false;
  scene.add(dots);
  // paperireuna, jotta sininen piste erottuu siniseltä taivaalta
  const dotRims = new THREE.InstancedMesh(new THREE.CircleGeometry(1, 14), ink(C.paper, {}), NDOT);
  dotRims.frustumCulled = false;
  scene.add(dotRims);
  for (const m of [dots.material, dotRims.material]) if (m.uniforms.uAppear) m.uniforms.uAppear.value = 1;
  const dotOns = S.onsetsIn(tPuu - 0.3, tLeim, (t) => S.fam.winds(t) > 0.03).filter((o, i, arr) => i === 0 || o - arr[i - 1] > 2.5).slice(0, NDOT);
  // puupuhaltimien kanava voi olla hiljainen: täydennetään tasavälein ankkurivälille (ei sekunteja, osuus välistä) [tarkista]
  for (let k = 0; k < 11; k++) dotOns.push(fr(tPuu, tLeim, 0.04 + 0.09 * k));   // tasaväli täydentää mitatut alut koko välille
  dotOns.sort((a, b) => a - b);
  dotOns.length = Math.min(dotOns.length, NDOT);
  const dotP = Array.from({ length: NDOT }, (_, i) => ({ x: -6 + 18 * hash1(i * 7 + 500), y: 3.2 + 3.2 * hash1(i * 7 + 501), r: 0.5 + 0.3 * hash1(i * 7 + 502) }));
  const m4 = new THREE.Matrix4();
  // maahan iskety keihäs ja viiri (3.6–3.8), kun ritari on laskenut sen kädestään
  const planted = group(scene, { x: plantX + 0.75, y: 0, z: 0.06 });
  flat(planted, rect(0.05, 3.2, 0.5, 0), ink(C.black, {}), {});
  flat(planted, poly([[-0.07, 3.2], [0.07, 3.2], [0, 3.52]]), ink(C.paper, {}), { z: 0.001 });
  const plantedPen = waveMat(C.red, { shade: C.black, raster: 0, amp: 0.12, k: 6 });
  const plantedFlag = new THREE.Mesh(pennantGeo(1.5, 0.45), plantedPen);
  plantedFlag.frustumCulled = false;
  plantedFlag.position.set(0.02, 3.1, 0.01);
  planted.add(plantedFlag);
  planted.visible = false;
  // hahmot
  const lead = leader(scene, {});
  const leadP = lead.P;
  const fig = companionFigure(scene);
  const ctrail = companionTrail(scene, S, dirV, { fade: (tt) => 1 - landed(tt), wmax: 0.17, N: 320, win: 10, drift: 0.1 });

  // --- Päivitys ----------------------------------------------------------------------------------------
  function update(t) {
    const w = 0.3 + 0.7 * W.wind(t);
    const windV = (tt) => { const q = W.wind(tt); return { x: 0.5 + 1.8 * q, y: 0.1 + 0.4 * q }; };
    // taivas: ilta, aurinko laskee kohti metsää (3.8 aurinko laskee)
    const u = SKY.u;
    u.uTime.value = t;
    const pSun = clamp((t - tViulu) / (tRak - tViulu));
    const dusk = smoothstep(tV3, tRak, t);
    u.uBlueAmt.value = 0.96;
    u.uBlueH.value = mix(-0.22, -0.4, dusk);
    u.uRedAmt.value = 0.55 + 0.35 * dusk;
    u.uBlackTop.value = 0.25 * dusk;
    u.uMurk.value = 0;
    u.uCloudGap.value.set(0, 0, 1, 0);
    u.uSun.value.set(-150, 72 - 60 * Math.pow(pSun, 1.6), 22, 1);
    u.uMoon.value.set(0, 120, 16, 0);
    hillMat.uniforms.uRaster.value = 0.45 + 0.2 * S.energy.violins(t);
    // puro: harppu välkkyy
    brook.u.uTime.value = t;
    brook.u.uGlint.value = 0.3 + 0.7 * clamp(S.fam.harp(t));
    // ritari
    const hs = heroState(t);
    const lanceNow = hasLance(t);
    const flare = win(tLeim, fr(tLeim, tLust, 0.35), tLust - 0.5, tLust + 0.5, t);
    lead.place(t, heroState, windV, { capeWind: w * 0.5, noLance: !lanceNow, noBanner: !lanceNow, width: 0.8 + 0.9 * flare });
    lead.bannerMat.uniforms.uAppear.value = 1;
    planted.visible = !lanceNow;
    plantedPen.uniforms.uTime.value = t;
    plantedPen.uniforms.uAmp.value = 0.05 + 0.18 * w;
    // ei punaista mustetta metsässä (tuotantojako: muste vain gef_huippu..gef_sankari_hiljaa joella); viiri on viiri
    // kumppani: viiva ja hahmo
    ctrail.set(t, tipC, windV, tViulu - 1.0);
    const fm = figM(t);
    fig.root.visible = fm > 0.02;
    fig.mat.uniforms.uAppear.value = fm;
    const walkK = smoothstep(tPick + 1.2, tPick + 3, t);
    const fx = mix(LAND.x, hs.x + 1.7, walkK);
    fig.root.position.set(fx, 0, 0.1);
    fig.root.scale.set(1, mix(0.25, 1, smoothstep(0, 1, fm)), 1);
    fig.pose(t, moodAt(t), { bow: 0.12 * smoothstep(fr(tV3, tRak, 0.3), fr(tV3, tRak, 0.5), t) * (1 - walkK), tilt: 0.05 * Math.sin(t * 0.37), dir: dirV, wind: w, trail: 1, fan: 0.06 * walkK });
    // siniset pisteet puiden takana (puupuhaltimet)
    let nDots = 0;
    for (let i = 0; i < NDOT; i++) {
      const o = dotOns[i];
      let s = 0;
      if (o !== undefined && t >= o - S.LEAD && t < o + 4.5) { const age = t - o + S.LEAD; s = dotP[i].r * smoothstep(0, 0.1, age) * (1 - smoothstep(2.6, 4.5, age)) * (0.7 + 0.6 * clamp(S.fam.winds(t))); }
      if (s > 0.01) nDots++;
      const dx = o !== undefined ? hs.x - 3 - 8 * hash1(i * 7 + 500) : 0;   // ritarin vasemmalla puolella, viivasta poispäin
      const dy = 2.8 + 2.6 * hash1(i * 7 + 501);
      m4.makeScale(s * 0.62, s * 0.62, 1);
      m4.setPosition(dx, dy, -10.88);
      dots.setMatrixAt(i, m4);
      m4.makeScale(s, s, 1);
      m4.setPosition(dx, dy, -10.89);
      dotRims.setMatrixAt(i, m4);
    }
    dotRims.instanceMatrix.needsUpdate = true;
    dots.instanceMatrix.needsUpdate = true;
    update.last = { nDots, flare, hs, fm, fx };
    return { dim: 0.12 * dusk, wind: w, paper: 0 };
  }
  const r3 = (x) => Math.round(x * 1000) / 1000;
  function probe(t) {
    const L = update.last || {};
    const hs = L.hs || heroState(t);
    const tip = tipC(t);
    const fk = handFK(leadP, hs.pose, true);
    return {
      viiva_y: tip ? r3(tip.y) : 0, mieliala: moodAt(t), kuulee: r3(hearK(t)), pisteet_n: L.nDots ?? 0, olennot: L.nDots ?? 0, viiri_leveys: r3(0.8 + 0.9 * (L.flare ?? 0)),
      keihas_maassa: hasLance(t) ? 0 : 1, kierto: r3(whirl(t) + laugh(t) + circ(t)),
      viiva: tip ? { x: r3(tip.x), y: r3(tip.y), z: r3(tip.z), nakyy: ctrail.last.ink > 0.05 ? 1 : 0 } : { x: null, y: null, nakyy: 0 },
      hahmo: { nakyy: (L.fm ?? 0) > 0.02 ? 1 : 0, x: r3(L.fx ?? 0), nousu: r3(L.fm ?? 0) },
      kammen: hs.pose.palm > 0.02 ? r3(hs.pose.palm) : 0, kasi_y: r3(hs.y + fk.hand[1]),
      istuu: r3(Math.max(sitA(t), sitB(t))), polvistuu: r3(kneelK(t)), kello: r3(callK(t)), aurinko_y: r3(72 - 60 * Math.pow(clamp((t - tViulu) / (tRak - tViulu)), 1.6)),
      vareet: r3(0.3 + 0.7 * clamp(S.fam.harp(t))), tuuli: r3(W.wind(t)),
    };
  }
  return { scene, update, shots, camAt, probe, heroState, moodAt, times: { tSit, tLah, tKai, tIlo, tKev, tKev2, tHel, tSar, tSar2, t47a, t47b, tSitB, tStand, tPick, t51c } };
}
