// J, taistelukenttä: ohjaus 4.1-4.4 (wal_kulissi1 ... wal_puolenvaihto, A-puolen loppu).
//  4.1 Kutsu (wal_kulissi1 -> wal_taistelu): kolme kulissitrumpettia ovat kolme viiriä horisontissa (musta,
//     valkoinen, punainen). Ritari seisoo hevosensa vieressä, kääntyy ääntä kohti ja nostaa viirin; jokainen
//     aksentit.json:n z >= 9 -isku napsauttaa yhtä horisontin viiriä. Orkesterin vastatessa (wal_vastaus) hän
//     nousee ratsaille, ja kumppanin ohut viiva nousee satulaan hänen taakseen. Hiljaisuudessa kuva rauhoittuu
//     paperiksi. Toisella kutsulla (wal_kulissi2) viirit ovat lähempänä ja ritari ratsastaa kentälle.
//  4.2 Patarummut (wal_taistelu -> jaksoraja): hän pysäyttää hevosen kentän laidalle (hidastuu käyntiin, ei jähmety)
//     ja laskee viirin vaakaan. Jokainen patarummun lyönti pöllähdyttää maan viivoitusta.
//  4.3 Rynnäkkö (jaksoraja -> wal_puolenvaihto): hän ratsastaa suon olentojen (critters.js) mustia pyörteitä päin ja
//     lyö viirillä fraaseittain. Jokainen kirjoitettu isku (z >= 5) on yhden elementin teko: läiskä (musta roiske) tai
//     salama osuu olentoon ruutua ennen ääntä.
//  4.4 Sivun kääntö: puolenvaihdon jälkeen kamera vetäytyy (record.js ottaa kuvan jaksorajassa).
// Värit: musta ja tulenpunainen. Ritari täysi sinooperi paperin päällä (kenttä lähellä paperia, punainen vasta kaukana);
// vastustajat ovat mustia rasterilaikkuja ja pyörteitä paperireunalla. Sininen sammuu ennen punaista.
// Kaikki on puhdas funktio ajasta: siemenet hash1:stä, kertymät samplereina; ajat ankkureista, jaksorajoista ja iskuista.

import * as THREE from 'three';
import { C, U, HALFTONE, ink, flat, group, poly, rect, strokeGeo, ridgeGeo, deadTree, cloud, streaks, pennantGeo, waveMat, boltPoints, clamp, smoothstep, mix, hash1 } from './paper.js';
import { leader, ease } from './hero.js';
import { horse, poseHorse, KP, kmix, handFK } from './puppets.js';
import { buildDiscPieces } from './record.js';
import { fluteMosquito, oboeDuck, cAnglaisHeron, tubaSnail, bassoonFrog, tromboneCrow } from './critters_swamp.js';   // sama muoto kuin critters.js, viivat mitoitettu maailmaan (pienet koot)
import { brushStroke, splat } from './brush.js';
import { common } from './world.js';
import { gaussian, sampler } from '../util.js';

// --- Taivas: paperi horisontissa, ylös sinooperi, ylimpänä musta; yöllä sininen ja musta ---------
// Sininen ja punainen eivät ole koskaan yhtä aikaa (purppura on säästetty väri): sininen sammuu
// mustan sameuden alle, ennen kuin punainen alkaa.
const SKY_FS = /* glsl */ `
  uniform float uCell, uTime, uBlue, uRed, uBlack, uMurk, uHorY;
  uniform vec3 uBlackC, uBlueC, uPaperC, uRedC;
  varying vec3 vW;
  ${HALFTONE}
  void main() {
    float y = vW.y - uHorY;
    float gb = uBlue * (0.4 + 0.6 * smoothstep(0.0, 140.0, y));
    float gr = uRed * smoothstep(22.0, 130.0, y);
    float gk = uBlack * smoothstep(55.0, 230.0, y);
    float murk = uMurk * smoothstep(-5.0, 60.0, y) * (0.4 + 0.6 * vnoise(vW.xy * 0.011 + vec2(uTime * 0.02, 0.0)));
    vec3 c = uPaperC;
    c = mix(c, uBlueC, halftone(gb, 0.26, uCell * 1.25));
    c = mix(c, uRedC, halftone(gr, 1.31, uCell * 1.25));
    c = mix(c, uBlackC, halftone(max(gk, murk), 0.785, uCell * 1.25));
    gl_FragColor = vec4(c, 1.0);
  }
`;

// --- Maa: puupiirros. Z-suuntaiset viivat (Dürer), kauempana tiheämpiä ja sitten paperinen sumu.
// Pohjaväri: yöllä sininen/musta massa, sitten paperi, taistelussa lähellä paperi (ritari erottuu) ja kaukana
// tulenpunainen. Rummun lyönnit nostavat viivoitusta kuhmuna (kärkipisteet), virvelit ovat pisteviivoja.
const GROUND_VS = /* glsl */ `
  uniform vec4 uHits[8];
  uniform float uTime;
  varying vec3 vW;
  varying vec3 vP;
  varying float vBump;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vP = w.xyz;
    float b = 0.0;
    for (int i = 0; i < 8; i++) {
      vec4 h = uHits[i];
      if (h.w <= 0.0) continue;
      float age = uTime - h.z;
      if (age < 0.0 || age > 1.8) continue;
      float r = length(w.xz - h.xy);
      float R = 1.5 + h.w * (1.4 + 3.2 * age);
      float ring = exp(-pow((r - 0.4 * R) / (0.38 * R + 0.5), 2.0));
      b += h.w * 0.55 * ring * exp(-age * 1.9);
    }
    vBump = b;
    w.y += b;
    vW = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;
const GROUND_FS = /* glsl */ `
  uniform float uCell, uField, uRedG, uDots;
  uniform vec3 uBlackC, uBlueC, uPaperC, uRedC;
  varying vec3 vW;
  varying vec3 vP;
  varying float vBump;
  ${HALFTONE}
  float lineCov(float v, float p, float th) {
    float s = v / p;
    float aa = fwidth(s) * 1.5;
    float d = abs(fract(s) - 0.5) * 2.0;
    return 1.0 - smoothstep(th - aa, th + aa, d);
  }
  void main() {
    float zc = -vP.z;
    float x = vP.x;
    float dist = length(vP.xz - cameraPosition.xz);
    float haze = smoothstep(70.0, 300.0, dist);
    // lähellä viivat ovat suoria (aaltoilu liikkuisi ruudulla ratsastusnopeudella ja välkkyisi), kaukana ne aaltoilevat
    float wob = ((vnoise(vec2(x * 0.16, zc * 0.05)) - 0.5) * 1.7 + 0.7 * sin(x * 0.06 + zc * 0.02)) * smoothstep(14.0, 80.0, dist);
    float zz = zc + wob;
    float tone = 0.2 + 0.3 * smoothstep(6.0, 90.0, dist) + vBump * 0.5;
    // viivojen väli pysyy noin 13 pikselinä (Dürerin viivoitus): puolitus/kaksinkertaistus liukuu
    float lvl = clamp(log2(fwidth(zc) * 13.0 / 0.4), -3.0, 12.0);
    float l0 = floor(lvl), fr = lvl - l0;
    float p0 = 0.4 * exp2(l0);
    float cov = mix(lineCov(zz, p0, tone), lineCov(zz, p0 * 2.0, tone), fr);
    float pat = smoothstep(0.52, 0.72, vnoise(vec2(x, zz) * 0.11));
    float cov2 = lineCov(x * 0.9 + zz * 0.5, p0 * 2.6, 0.12) * pat * (1.0 - smoothstep(25.0, 70.0, dist)) * smoothstep(9.0, 20.0, dist);
    float black = max(cov * (1.0 - haze * 0.92), cov2) * uField;
    // yö: sininen ja musta massa
    float night = (1.0 - uField);
    vec3 c = uPaperC;
    c = mix(c, uBlueC, halftone(night * (1.0 - haze * 0.5), 0.26, uCell * 1.4));
    c = mix(c, uBlackC, halftone(night * 0.75 * (1.0 - haze * 0.7), 0.785, uCell * 1.4));
    // taistelu: tulenpunainen vain kaukana (ritarin alla paperi), lähellä harva rasteri
    float rc = uRedG * (0.08 + 0.72 * smoothstep(40.0, 150.0, dist)) * (1.0 - haze * 0.5);
    c = mix(c, uRedC, halftone(rc, 1.31, uCell * 1.4));
    c = mix(c, uBlackC, black);
    // virvelit: pisteviivat viivojen välissä
    float rs = zz / p0;
    float rowD = abs(fract(rs + 0.5) - 0.5);
    float rowId = floor(rs + 0.5) + l0 * 101.0;
    float rowOn = step(hash12(vec2(rowId, 3.7)), uDots);
    float dash = step(0.5, fract(x / (p0 * 1.3) + hash12(vec2(rowId, 9.1)) * 7.0));
    // pisteviivat vain keski- ja kaukokentässä: lähellä ne liikkuisivat ruudulla satoja pikseleitä sekunnissa ja välkkyisivät
    float dots = (1.0 - smoothstep(0.07, 0.14, rowD)) * rowOn * dash * smoothstep(16.0, 48.0, dist) * (1.0 - smoothstep(40.0, 110.0, dist)) * uField;
    c = mix(c, uPaperC, dots);
    gl_FragColor = vec4(c, 1.0);
  }
`;
const worldVS = 'varying vec3 vW; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }';

const wrap = (v, P) => ((((v + P / 2) % P) + P) % P) - P / 2;
const TAU = Math.PI * 2;

// Olennot (critters_swamp.js), sama joukko kuin suolla. Koot tyyliohjeen luvun 10 mukaan (ritarin korkeus 1,9 yksikköä; suurin mitta
// ff:llä, kuten loc_swamp.js SCp): hyttynen 0,2 (siipineen ja pistimineen), sorsa 0,4, haikara 0,5 (korkeus), kotilo 0,33, sammakko 0,25, varis 0,3.
// sc = rakennus- ja kuvakoko (suurin, ff), swc = pyörteen vanha mitoitus (pyörteet säilyvät ennallaan), y = korkeus, lento = leijuu, env = ohjaava kanava
const TYPES = [
  { name: 'huilu-hyttynen', mk: fluteMosquito, sc: 0.09, swc: 0.9, y: 3.7, lento: true, env: 'fl' },
  { name: 'oboe-sorsa', mk: oboeDuck, sc: 0.338, swc: 1.7, y: 2.3, lento: true, env: 'fl' },
  { name: 'englannintorvi-haikara', mk: cAnglaisHeron, sc: 0.278, swc: 1.15, y: 0.0, lento: false, env: 'fl' },
  { name: 'tuuba-kotilo', mk: tubaSnail, sc: 0.29, swc: 0.95, y: 0.05, lento: false, env: 'brass', vaski: true },
  { name: 'fagotti-sammakko', mk: bassoonFrog, sc: 0.183, swc: 1.25, y: 0.1, lento: false, env: 'fl' },
  { name: 'pasuuna-varis', mk: tromboneCrow, sc: 0.216, swc: 1.1, y: 5.1, lento: true, env: 'brass', vaski: true },
];
const NC = 12;                // olentojen kokonaismäärä (kaksi instanssia kutakin lajia)

export function build(K) {
  const { S } = K;
  const LEAD = S.LEAD;
  const A = (id) => S.A(id).t;
  const W = common(S);
  const k1 = A('wal_kulissi1'), vas = A('wal_vastaus'), k2 = A('wal_kulissi2'), tais = A('wal_taistelu'), flip = A('wal_puolenvaihto');
  const tB = (S.segs.find((s) => s.a > tais + 3 && s.a < tais + 15) || { a: tais + 7 }).a;   // jaksoraja: virvelit ja huudot tiivistyvät
  const sA = (S.segs.find((s) => s.a > flip + 1) || { a: flip + 2 }).a;                       // jaksoraja puolenvaihdon jälkeen: levy ottaa kuvan
  const n = S.n;
  const arr = (f) => { const a = new Float32Array(n); for (let i = 0; i < n; i++) a[i] = f(i / 30); return a; };
  const ramp = (a, b, t) => smoothstep(a, b, t);
  const frac = (a, b, u) => mix(a, b, u);

  // --- Signaalit (kaikki puhtaita funktioita ajasta) ------------------------------------------
  const loudS = W.smooth((t) => S.loud(t), 1.5);
  const hornsS = W.smooth((t) => S.energy.horns(t), 0.9);         // tasoitettu käyrätorvikanava: viirin lyönnit fraaseittain
  const dens = W.smooth((t) => clamp((S.fam.horns(t) + S.fam.brass(t) + S.fam.strings(t) + S.fam.winds(t) + 0.8 * S.fam.perc(t) + 0.5 * S.fam.cymbal(t)) / 3.4), 1.6);
  const violS = W.smooth((t) => clamp(S.fam.violins(t)), 0.8);
  // Ritarin vyö (sash.js, palaute A11): taistelun viulun teemat näkyvät vyössä. Signaali = mitattu viulukanava (PANNs violin_fiddle,
  // S.fam.violins; stem_vocals on tässä paketissa nolla): viulut huutavat -> viiva leimahtaa ja laajenee, vaikenevat -> painuu kehoon.
  const sashSig = (t) => smoothstep(0.1, 0.6, S.fam.violins(t));
  const percS = W.smooth((t) => clamp(S.fam.perc(t)), 0.25);
  const env = { lows: W.lows, brass: W.smooth((t) => clamp(S.fam.brass(t) * 1.3), 0.5), fl: W.smooth((t) => clamp(S.fam.winds(t) * 1.3), 0.5) };
  const windA = (t) => clamp(W.wind(t) + 0.12);
  // hevosen nopeus: käynti vastauksesta, ravi toiselle kutsulle, pysäytys kentän laidalla (hidas käynti, ei jähmettymää), rynnäkkö jaksorajasta
  const speed = (t) => {
    const walk = 1.5 * ramp(frac(vas, k2, 0.13), frac(vas, k2, 0.31), t);
    const canter = 3.4 * ramp(frac(vas, k2, 0.85), frac(k2, tais, 0.55), t);
    const halt = -(walk + canter - 0.35) * ramp(tais, frac(tais, tB, 0.55), t);
    const charge = 3.6 * ramp(frac(tais, tB, 0.8), frac(tB, flip, 0.12), t);
    return Math.max(0.3, walk + canter + halt + charge) * ramp(vas, frac(vas, k2, 0.13), t) * (0.85 + 0.3 * loudS(t));
  };
  const X = W.integ(speed);                                            // hevosen x
  const phW = (t) => (2 * Math.PI * X(t)) / 2.4;
  const phG = (t) => (2 * Math.PI * X(t)) / 6.0;
  const gGal = (t) => ramp(frac(vas, k2, 0.85), frac(k2, tais, 0.6), t) * (1 - 0.0) ;
  const amtW = (t) => clamp(speed(t) / 1.5);
  const amtG = (t) => ramp(1.5, 6.0, speed(t));
  const orbI = W.integ((t) => 0.07 + 0.1 * dens(t));                   // olentojen kiertokulma (kierrosta)

  // --- Iskut: kulissi-iskut (z >= 9) -> horisontin viirit; taistelun kirjoitetut iskut (z >= 5) -> läiskä tai salama -----
  const fan = S.accIn(k1 - 0.5, tais, 9).map((e, i) => ({ t: e.t, z: e.z, i }));
  // kirjoitetut iskut vuorottelevat: salama (paperin leikkaus mustalla reunalla) ja läiskä; kumpikin on yhden elementin teko
  const accB = S.accIn(tais - 0.05, flip, 5).filter((e, i, a) => i === 0 || e.t - a[i - 1].t > 0.4).map((e, i) => ({ t: e.t, z: e.z, i, kind: i % 2 === 0 ? 'salama' : 'laiska' }));
  const drum = S.strokesIn(tais - 0.1, flip + 1);
  const tA1 = (fan.find((e) => e.t >= k1) || { t: k1 + 1.5 }).t;       // ensimmäinen kulissi-isku: ritari kääntyy

  // --- Olennot: syntyvät patarummun lyönneistä, osa kuolee kirjoitettuun iskuun -------------------------------------
  const strokesB = S.strokesIn(tais, flip).filter((t, i, a) => i === 0 || t - a[i - 1] > 1.0);
  const spawn = Array.from({ length: NC }, (_, j) => strokesB[Math.min(strokesB.length - 1, Math.floor((j * strokesB.length) / NC))] ?? frac(tais, flip, j / NC));
  const kill = new Array(NC).fill(null);
  const arrT = 0.045 * (flip - tais);   // saapumisen kesto (osuus taistelun kestosta, ei kiinteä sekunti)
  // jokaiselle kirjoitetulle iskulle on olento, johon isku osuu: vanhin elossa oleva, jonka saapuminen on ehtinyt pitkälle;
  // muuten vapaa olento aloittaa saapumisensa niin, että se on perillä iskun hetkellä
  accB.forEach((e) => {
    let best = -1;
    for (let j = 0; j < NC; j++) if (kill[j] === null && spawn[j] <= e.t - 0.5 * arrT && (best < 0 || spawn[j] < spawn[best])) best = j;
    if (best < 0) {
      for (let j = 0; j < NC; j++) if (kill[j] === null && (best < 0 || spawn[j] > spawn[best])) best = j;   // myöhäisin vapaa
      spawn[best] = Math.max(tais, e.t - arrT);
    }
    kill[best] = e;
  });
  spawn[0] = tais;   // ensimmäinen 3/4: hyttynen (huilu); sen pyörre kasvaa (hirviöpyörre), olento itse pysyy luvun 10 koossa
  const cr = Array.from({ length: NC }, (_, j) => {
    const T = TYPES[j % 6];
    return {
      j, T, t0: spawn[j], t1: kill[j] ? kill[j].t : sA, ev: kill[j],
      // olennot pysyvät hevosen ja keihään edessä (ritari luettavana): lähin piste vähintään ~4,6 yksikköä ritarin edellä
      near: (j === 0 ? 8.2 : 6.4) + 2.6 * hash1(j * 11 + 1), rx: 0.5 + 1.1 * hash1(j * 11 + 2), ry: 0.4 + 0.9 * hash1(j * 11 + 3),
      a0: hash1(j * 11 + 4) * TAU, dir: hash1(j * 11 + 5) > 0.5 ? 1 : -1, dy: 0.25 * (hash1(j * 11 + 6) - 0.5) * 2,
    };
  });

  // --- Kamera: yksi jatkuva dolly ritarin perässä; kerrosten läpi lähikuvaan, puolenvaihdon jälkeen vetäytyy -------------
  // [t, y, z, katseen y, fov]; x seuraa ritaria. Tasoitus 1,5 s: ei äkkinäistä liikettä. Laaja (ritari pieni) -> lähikuva (ritari täyttää).
  const KEYS = [
    [k1, 2.0, 17, 4.3, 42], [vas, 1.9, 16.5, 4.2, 42], [frac(vas, k2, 0.5), 1.9, 12.5, 3.9, 42], [k2, 1.9, 17, 4.0, 42],
    [tais, 1.8, 17.5, 3.9, 42], [tB, 1.8, 17, 3.6, 42], [frac(tB, flip, 0.3), 1.8, 14, 3.4, 43],
    [frac(tB, flip, 0.65), 1.9, 9, 3.2, 44], [flip - 0.0001, 2.0, 7.2, 3.1, 44],
    [sA + 3.0, 9, 44, 6, 44], [S.T_END, 12, 52, 7, 44],
  ];
  const rawCam = (t) => {
    if (t <= KEYS[0][0]) return KEYS[0].slice(1);
    for (let i = 1; i < KEYS.length; i++) {
      if (t <= KEYS[i][0]) {
        const u = (t - KEYS[i - 1][0]) / (KEYS[i][0] - KEYS[i - 1][0]);
        return KEYS[i].slice(1).map((v, j) => mix(KEYS[i - 1][j + 1], v, u));
      }
    }
    return KEYS[KEYS.length - 1].slice(1);
  };
  const camArr = [0, 1, 2, 3].map(() => new Float32Array(n));
  for (let i = 0; i < n; i++) rawCam(i / 30).forEach((v, j) => { camArr[j][i] = v; });
  const camS = camArr.map((a) => sampler(gaussian(a, 45), 30));
  const camAt = (t) => {
    const x = X(t), cy = camS[0](t), cz = camS[1](t), ly = camS[2](t), fov = camS[3](t);
    const lead = 0.22 * cz;
    return { pos: [x, cy, cz], look: [x + lead, ly, 0], fov, yaw: Math.atan2(lead, cz) };
  };
  const halfWAt = (cam, z) => (cam.pos[2] - z) * Math.tan((cam.fov * Math.PI) / 360) * (16 / 9);

  const scene = new THREE.Scene();
  scene.background = C.paper.clone();

  // --- Levy (palaute C8): puolenvaihdosta alkaen kenttä kuivuu rasteriksi paperille ja levyn ura kiertyy ulkoreunalta
  // sisäänpäin kentän päällä (record.js buildDiscPieces, 'overlay'). Kerros on kiinni kamerassa ja mitoitettu niin,
  // että levy näyttää samalta kuin kohtauksessa K (sama ruutukoordinaattien rasteri), joten K:hon vaihtuminen on saumaton.
  const REC = buildDiscPieces(scene, S, (id) => S.A(id).t, 'overlay');
  const vE = new THREE.Vector3(), vT = new THREE.Vector3(), vUp = new THREE.Vector3(0, 1, 0), mL = new THREE.Matrix4();
  function placeRecord(t) {
    REC.update(t);
    if (t < flip) return;
    const c = camAt(t);
    vE.set(...c.pos); vT.set(...c.look);
    mL.lookAt(vE, vT, vUp);
    REC.root.quaternion.setFromRotationMatrix(mL);
    const d = 30;
    const dK = 47 + 15 * smoothstep(REC.T_REC - 1, S.T_END, t);
    REC.root.scale.setScalar((d * Math.tan((c.fov * Math.PI) / 360)) / (dK * Math.tan(Math.PI / 9)));
    REC.root.position.copy(vT).sub(vE).normalize().multiplyScalar(d).add(vE);
  }

  // --- Taivas ---
  const skyU = {
    uCell: U.uCell, uTime: { value: 0 }, uBlue: { value: 1 }, uRed: { value: 0 }, uBlack: { value: 0.3 }, uMurk: { value: 0 }, uHorY: { value: 0 },
    uBlackC: { value: C.black }, uBlueC: { value: C.blue }, uPaperC: { value: C.paper }, uRedC: { value: C.red },
  };
  const skyM = new THREE.Mesh(new THREE.PlaneGeometry(6000, 3000), new THREE.ShaderMaterial({ uniforms: skyU, vertexShader: worldVS, fragmentShader: SKY_FS, depthWrite: false }));
  skyM.position.z = -480; skyM.frustumCulled = false; skyM.renderOrder = -10;
  scene.add(skyM);

  // mustat pilvet (sameus) vain keskikorkeudella: yläkolmannes jää tyhjäksi taivaaksi
  const cloudMat = ink(C.black, { shade: C.paper, raster: 0.18 });
  const clouds = Array.from({ length: 9 }, (_, k) => flat(scene, cloud(120 + 90 * hash1(k), 30 + 22 * hash1(k + 1), k + 40, true), cloudMat, { y: 12 + 38 * hash1(k + 2), z: -330 - 30 * hash1(k + 3) }));

  // yläpuolen pilvien sävy: paperi yöllä, sinooperi taistelussa (ei sinistä punaisen kanssa)
  const cloudShade = cloudMat.uniforms.uShade.value;

  // --- Maa (kaksi tasoa: lähellä tiheä verkko kuhmuille, kaukana tasainen) ---
  const gU = {
    uCell: U.uCell, uTime: { value: 0 }, uField: { value: 0 }, uRedG: { value: 0 }, uDots: { value: 0 },
    uHits: { value: Array.from({ length: 8 }, () => new THREE.Vector4(0, 0, -99, 0)) },
    uBlackC: { value: C.black }, uBlueC: { value: C.blue }, uPaperC: { value: C.paper }, uRedC: { value: C.red },
  };
  const gMat = new THREE.ShaderMaterial({ uniforms: gU, vertexShader: GROUND_VS, fragmentShader: GROUND_FS, side: THREE.DoubleSide });
  const gNear = new THREE.Mesh(new THREE.PlaneGeometry(240, 200, 240, 200), gMat);
  gNear.rotation.x = -Math.PI / 2; gNear.frustumCulled = false;
  const gFar = new THREE.Mesh(new THREE.PlaneGeometry(2400, 520, 2, 2), gMat);
  gFar.rotation.x = -Math.PI / 2; gFar.frustumCulled = false;
  scene.add(gNear, gFar);

  // --- Horisontti: kolme harjannetta (siluetit), kaukana sumuisia ---
  const ridgeMats = [ink(C.black, { shade: C.paper, raster: 0.35 }), ink(C.black, { shade: C.paper, raster: 0.18 }), ink(C.black, {})];
  const ridges = [[-430, 26, 11, 0], [-300, 15, 5, 1], [-110, 5.5, 3, 2]].map(([z, h, seed, mi]) => {
    const m = flat(scene, ridgeGeo(-900, 900, h, seed, { lambda: 150 - 30 * mi, base: -80 }), ridgeMats[mi], { z });
    m.userData.edge = { name: `harjanne z${z}`, x0: -900, x1: 900 };
    return m;
  });

  // --- Kolme kulissitrumpetin viiriä horisontissa: musta, valkoinen, punainen ---
  const PEN = [
    { c: C.black, rim: C.paper, th: 0.115, H: 34, L: 21, h: 6.4 },
    { c: C.paper, rim: C.black, th: 0.23, H: 41, L: 24, h: 7.0 },
    { c: C.red, rim: C.paper, th: 0.355, H: 31, L: 20, h: 6.0 },
  ].map((o, i) => {
    const g = group(scene, {});
    const sm1 = ink(C.black, {}), sm2 = ink(C.paper, {});
    flat(g, rect(0.7, o.H, 0.5, 0), sm1, { z: 0.5 });
    flat(g, rect(1.7, o.H, 0.5, 0), sm2, { z: 0 });
    const fm = waveMat(o.c, { amp: 1, k: 6 });
    const rm = waveMat(o.rim, { amp: 1, k: 6 });
    const flag = flat(g, pennantGeo(o.L, o.h), fm, { y: o.H - o.h * 0.5 - 1.5, z: 1.0 });
    const rim = flat(g, pennantGeo(o.L * 1.07, o.h * 1.28), rm, { y: o.H - o.h * 0.5 - 1.5, z: -0.5 });
    flag.scale.x = rim.scale.x = -1;     // sama tuuli kuin ritarin viirillä: virtaa -x
    flag.position.x = rim.position.x = 0.0;
    return { ...o, g, fm, rm, i, mats: [sm1, sm2, fm, rm] };
  });
  const penZ = (t) => -200 + 60 * ease(ramp(frac(k1, vas, 0.3), k2, t)) + 70 * ramp(k2, tais, t);   // toinen kutsu (orkesterin trumpetit, wal_kulissi2): viirit tulevat etualalle

  // --- Kuolleet puut (maailman mukana) ja etualan kerrokset (kameran ohitse) ---
  const treeMat = ink(C.black, {});
  const trees = Array.from({ length: 6 }, (_, i) => {
    const g = group(scene, { z: -50 - 60 * hash1(i * 5 + 1) });
    deadTree(100 + i, 2.6 + 2 * hash1(i + 20)).forEach((sh) => flat(g, sh, treeMat, {}));
    return { g, x0: (hash1(i * 3 + 2) - 0.5) * 220, s: 0.8 + 0.6 * hash1(i + 50) };
  });
  // etualan kerrokset: harvat piikkiset ruohot/keihäät; jokainen kerros ohittaa kameran dollyssa
  const blade = (h, w, lean) => poly([[-w, 0], [-w * 0.3, h * 0.6], [lean, h], [w * 0.3, h * 0.55], [w, 0]]);
  const FG = [[16.5, 0.07, 0, 3.0], [12.8, 0.14, 1, 3.6]].map(([z, p, mi, hh], li) => {
    const m = [ink(C.black, {}), ink(C.red, { shade: C.black, raster: 0.4 })][mi];
    const items = Array.from({ length: 9 }, (_, i) => {
      const g = group(scene, { z: z + 0.06 * i });
      const hgt = hh * (0.55 + 0.9 * hash1(li * 100 + i));
      flat(g, blade(hgt, 0.05 + 0.05 * hash1(li * 70 + i), (hash1(li * 33 + i) - 0.5) * 0.5), m, {});
      flat(g, blade(hgt * 0.7, 0.05, -0.4), m, { x: 0.3 });
      flat(g, blade(hgt * 0.45, 0.04, 0.3), m, { x: -0.3 });
      flat(g, blade(hgt * 0.6, 0.045, 0.5), m, { x: 0.65 });
      return { g, x0: (i / 9 - 0.5) * 130 + 9 * (hash1(li * 17 + i) - 0.5) };
    });
    return { z, p, items, mi };
  });

  // --- Ritari ratsailla ja hevonen ---
  const H = horse(scene, { mane: C.red });
  const L = leader(scene, {});
  [...H.mats, ...L.mats].forEach((m) => { if (m.uniforms?.uShade && m.uniforms.uShade.value.equals(C.blue)) m.uniforms.uShade.value = C.red.clone(); });   // ei sinistä taisteluun
  // Lantion korkeus nuken omissa koordinaateissa: seisovalla (mounted = false) se tulee jalkojen pituudesta, ratsailla
  // (mounted = true) vain pose.y:stä. Kun ratsaille nousu asettaa pose.y = MOUNT_Y, lantio on asentotasolla sama
  // ennen ja jälkeen lipun vaihdon (ei hyppyä 1145,0 s:ssa); nousun korkeus kulkee tilan y:ssä pm-käyrällä.
  const MOUNT_Y = handFK(L.P, KP.stand, true).hipY;
  const bobAt = (t) => mix(0.03 * Math.abs(Math.sin(phW(t))) * amtW(t), 0.1 * Math.abs(Math.sin(phG(t))) * amtG(t), gGal(t));
  const windAt = (t) => ({ x: -(2.0 + 8 * windA(t)), y: 0.4 + 1.2 * violS(t) });
  const mountDur = 0.2 * (k2 - vas);
  // ritarin teot (puhdas ajan funktio): kuuntelee, nostaa viirin, nousee ratsaille, vastaa, laskee viirin vaakaan, lyö fraaseittain
  const phase = (t) => {
    const look = ramp(k1, tA1, t);
    const rs = frac(tA1, vas, 0.12), re = frac(tA1, vas, 0.4), ls = frac(tA1, vas, 0.62), le = frac(tA1, vas, 0.88);
    const raise = ease(clamp((t - rs) / (re - rs))) * (1 - ease(clamp((t - ls) / (le - ls))));
    const pm = ramp(vas, vas + mountDur, t);
    const answer = ramp(frac(vas, k2, 0.17), frac(vas, k2, 0.29), t) * (1 - ramp(frac(vas, k2, 0.8), frac(vas, k2, 0.95), t));
    const low = ease(clamp((t - tais) / (frac(tais, tB, 0.7) - tais)));
    const swing = ramp(tB, frac(tB, flip, 0.12), t) * clamp(hornsS(t) * 1.25);          // fraasin mittainen isku, ei yksittäinen nuotti
    return { look, raise, pm, answer, low, swing };
  };
  // Lähempi käsi pysyy rinnan lähellä (kyynärpää koukussa, E_CH): silloin kauemman olkapään etäisyys on alle 0,58
  // eikä hero.js frame():n varren kallistus (jonka suunta vaihtuu yhdessä ruudussa, kun käsi ylittää olkapään tason
  // ja etäisyys on yli 0,58) tule käyttöön. Keihään nosto ja vastaus tehdään käden nousulla rinnalta pään korkeudelle
  // koukistetulla kädellä, ja lyönti on varren kaari (lanceAng), ei ojennettu käsivarsi.
  const E_CH = 1.9;
  function leaderState(t) {
    const hx = X(t);
    const f = phase(t);
    if (t < vas) {
      const base = kmix(KP.stand, KP.look, f.look);
      const p = kmix(base, KP.lanceBoth, f.raise);
      // nosto: ensin kyynärpää koukkuun (käsi rinnalle), sitten käsi ylös, lopuksi ojennus pään yläpuolelle
      const eUp = mix(base.eN, E_CH, ramp(0, 0.12, f.raise));
      const eN = mix(eUp, KP.lanceBoth.eN, ramp(0.78, 1.0, f.raise));
      return { x: hx - 2.2, y: 0, z: 0.4, facing: 1, pose: { ...p, eN, mounted: false } };
    }
    const pm = f.pm;
    const base = kmix(kmix(KP.look, KP.climbA, ramp(0.05, 0.5, pm)), KP.ride, ramp(0.5, 1.0, pm));
    const up = Math.max(f.answer, 0), low = f.low, sw = f.swing, arc = smoothstep(0.22, 0.85, hornsS(t));
    // käsi: riippuvasta (look) rinnalle koukistaen, vastauksessa pään korkeudelle, lyönnissä kaari pienenä liikkeenä rinnalla
    const aN = mix(KP.look.aN, 0.8 + 1.4 * up + 0.45 * arc * sw, ramp(0.25, 0.9, pm));
    const eN = mix(KP.look.eN, E_CH, ramp(0.0, 0.5, pm));
    const over = { ...KP.ride, lean: 0.1 + 0.1 * low + 0.12 * sw, tilt: 0.1 + 0.2 * f.answer };
    const wo = ramp(0.55, 1.0, pm);
    const pose = { ...kmix(base, over, wo), aN, eN, y: MOUNT_Y };
    const y = 0.47 * pm + 0.5 * Math.sin(Math.PI * pm) + bobAt(t) * 0.35 * ramp(0.8, 1.0, pm);
    // keihään kulma: ennen nousua pystysuora (lanceBoth 0), nousun aikana pysty, satulassa asennon mukainen kaari
    const target = mix(mix(mix(0.05, -0.08, up), 1.35, low), 1.6 - 1.0 * arc, sw);   // lyönti: varsi nousee taakse-ylös ja iskee eteen-alas fraasin mukana
    const lanceAng = mix(0, target, wo);
    return { x: hx + 0.05 - 2.25 * (1 - pm), y, z: 0.4, facing: 1, pose: { ...pose, mounted: true }, lanceAng };
  }
  const asento = (t) => {
    const f = phase(t);
    if (t < k1) return 'seisoo';
    if (t < vas) return f.raise > 0.5 ? 'nostaa viirin' : 'kuuntelee';
    if (f.pm < 1) return 'nousee ratsaille';
    if (t < tais) return f.answer > 0.5 ? 'viiri vastaa' : 'ratsastaa';
    if (t < tB) return f.low > 0.5 ? 'viiri vaakaan' : 'pysäyttää';
    return 'rynnäkkö';
  };
  const JOINTS = () => [H.L.fN.up, H.L.fF.up, H.L.hN.up, H.L.hF.up, H.L.fN.lo, H.L.fF.lo, H.L.hN.lo, H.L.hF.lo, H.body, H.neck, H.tail];
  function poseHorseBlend(t) {
    const g = gGal(t);
    poseHorse(H, 'walk', phW(t), amtW(t));
    const a = [...JOINTS().map((o) => o.rotation.z), H.body.position.y, H.body.position.x];
    poseHorse(H, 'gallop', phG(t), amtG(t));
    JOINTS().forEach((o, i) => { o.rotation.z = mix(a[i], o.rotation.z, g); });
    H.body.position.y = mix(a[11], H.body.position.y, g);
    H.body.position.x = mix(a[12], H.body.position.x, g);
  }

  // --- Suon olennot mustan musteen pyörteinä ----------------------------------------------------------------------------
  const setAppear = (mats, a) => { for (const m of mats) if (m.uniforms && m.uniforms.uAppear) m.uniforms.uAppear.value = a; };
  const swirlsN = 60;
  const creatures = cr.map((c) => {
    const o = c.T.mk(scene, c.T.sc);
    o.root.visible = false;
    // ei sinistä taisteluun; runko musta rasteri (vastustajat ovat mustia laikkuja ritarin sinooperia vasten)
    o.mats.forEach((m) => { if (m.uniforms?.uShade && m.uniforms.uShade.value.equals(C.blue)) m.uniforms.uShade.value = C.black.clone(); });
    const body = o.mats[0];
    body.uniforms.uShade.value = C.paper.clone(); body.uniforms.uRaster.value = 0.14;
    const sw = brushStroke(scene, swirlsN, C.black, { wmin: 0.05, wmax: 0.2 * (0.6 + 0.6 * c.T.swc), hairW: 0.03, fs: 1.8, bleed: 0.03, dryLen: 0.0001, dryAmt: 0, lambda: 0.01, tail: 0.3, seed: 40 + c.j, shade: C.paper, z: -0.8 });
    sw.mesh.visible = false;
    return { c, o, sw };
  });
  // läiskät (brush.js splat) olentojen kuolinpaikalla: musta muste, paperi ei peitä
  const splats = splat(scene, 8, { color: C.black, life: 1.0 });
  const sevents = accB.map((e) => ({ ...e }));
  // salamat: paperin leikkaus mustalla ääriviivalla, osuvat olentoon
  const bolts = accB.filter((e) => e.kind === 'salama').map((e, i) => {
    const pts = boltPoints(300 + i, 0, 24, 0, 0);
    const side = hash1(i * 7 + 3) > 0.45 ? 1 : -1;
    const g = group(scene, { z: -3 });
    const wf = (u) => 0.45 * (1 - u) + 0.18;
    const mats = [];
    const bm = (c) => { const m = ink(c, { noDim: true }); mats.push(m); return m; };
    flat(g, strokeGeo(pts, (u) => wf(u) + 0.28), bm(C.black), { z: -0.02 });
    flat(g, strokeGeo(pts, wf), bm(C.paper), { z: 0 });
    const b2 = pts.slice(5, 10).map(([x, y], k) => [x + k * 1.3 * side, y - k * 0.3]);
    flat(g, strokeGeo(b2, (u) => 0.4 * (1 - u) + 0.12 + 0.3), bm(C.black), { z: -0.02 });
    flat(g, strokeGeo(b2, (u) => 0.4 * (1 - u) + 0.12), bm(C.paper), { z: 0 });
    g.visible = false;
    return { g, e, mats };
  });

  // --- Patarummun lyönnit: viivoituksen pöllähdys + nouseva pöly ---
  const dustMat = ink(C.paper, { shade: C.black, raster: 0.15, noDim: true });
  const DUSTN = 6, DUSTK = 12;
  const dust = streaks(scene, DUSTN * DUSTK, dustMat, 0);

  // --- Hiljaisuus: kuva rauhoittuu paperiksi (ei keksittyjä tapahtumia) ---------------------------------------------------
  const SIL_THR = 0.1;
  const quiet = (t) => {
    const gate = ramp(frac(vas, k2, 0.3), frac(vas, k2, 0.4), t) * (1 - ramp(frac(vas, k2, 0.99), frac(k2, tais, 0.1), t));
    return gate * (1 - ramp(SIL_THR * 0.7, SIL_THR * 1.3, S.loud(t)));
  };

  const shots = [
    { name: '4.1 kutsu: kolme viiriä horisontissa', a: k1, b: vas, cam: (u, t) => camAt(t) },
    { name: '4.1 ritari ratsaille, kenttä painuu esiin', a: vas, b: k2, cam: (u, t) => camAt(t) },
    { name: '4.1 viirit lähempänä', a: k2, b: tais, cam: (u, t) => camAt(t) },
    { name: '4.2 patarummut: pysäytys kentän laidalla', a: tais, b: tB, cam: (u, t) => camAt(t) },
    { name: '4.3 rynnäkkö: sukellus kerrosten läpi', a: tB, b: flip + 1, cam: (u, t) => camAt(t) },
    { name: '4.4 kamera vetäytyy', a: flip + 1, b: 9999, cam: (u, t) => camAt(t) },
  ];

  let last = {};
  const P = L.P;
  const crState = (c, t) => {
    const cam = camAt(t);
    const kx = X(t);
    const u = clamp((t - c.t0) / arrT);
    const a = ease(u);
    const xFar = cam.look[0] + 1.12 * halfWAt(cam, -1.5);
    const ang = TAU * c.dir * (orbI(t) + c.a0);
    const xNear = kx + c.near + c.rx * Math.cos(ang);
    const yHome = c.T.y + (c.T.lento ? c.ry * Math.sin(ang * 1.3 + c.a0) + c.dy * 2 : 0.08 * Math.sin(ang * 2.1));
    const x = mix(xFar, xNear, a);
    const y = mix(yHome + (c.T.lento ? 2.8 : 0.0), yHome, a);
    return { x, y, a, u, ang: ang, cam, kx };
  };

  function update(t) {
    const cam = camAt(t);
    const kx = X(t);
    const cx = cam.pos[0];
    const viewX = (f, z) => cam.look[0] + f * halfWAt(cam, z);        // f -1..1: paikka ruudun leveydellä
    const w = windA(t);
    const battle = ramp(tais - 0.5, frac(tais, tB, 0.15), t);
    const q = quiet(t);

    // taivas: yö sininen+musta -> sameus -> taistelu: musta ja tulenpunainen (sininen sammuu ennen punaista)
    skyU.uTime.value = t;
    skyU.uBlue.value = (1 - ramp(frac(vas, k2, 0.9), frac(k2, tais, 0.6), t)) * (1 - 0.6 * q);
    skyU.uRed.value = ramp(frac(k2, tais, 0.8), frac(tais, tB, 0.35), t);
    skyU.uBlack.value = (0.25 + 0.65 * ramp(vas, tais, t)) * (1 - 0.7 * q);
    skyU.uMurk.value = (0.2 + 0.6 * ramp(vas, frac(tais, tB, 0.5), t)) * (1 - 0.9 * q);
    skyM.position.x = cx;
    cloudShade.copy(C.paper).lerp(C.red, ramp(frac(k2, tais, 0.7), tais, t));
    clouds.forEach((c, k) => { c.position.x = cx + wrap(hash1(k * 9 + 1) * 700 - W.drift(t) * 3.0, 700) * 0.9; c.visible = true; });
    ridges.forEach((r, i) => { r.position.x = cx * (i === 2 ? 0.9 : 0.995); });

    // maa
    gNear.position.set(cx, 0, -75);
    gFar.position.set(cx, 0, -410);
    gU.uTime.value = t;
    gU.uField.value = ramp(vas, frac(vas, k2, 0.47), t);
    gU.uRedG.value = ramp(frac(k2, tais, 0.9), frac(tais, tB, 0.35), t);
    gU.uDots.value = clamp(percS(t) * 1.3) * ramp(tB - 0.5, tB + 1.5, t) * 0.85;
    const hits = [];
    drum.forEach((d, i) => { if (t >= d - LEAD && t < d + 1.8) hits.push({ t: d, x: kx + 6 + 11 * hash1(i * 5 + 3), z: -2.5 - 7 * hash1(i * 5 + 4), s: 0.7 + 1.2 * clamp(S.fam.perc(d)) }); });
    hits.sort((a, b) => a.t - b.t);
    const lastH = hits.slice(-8);
    gU.uHits.value.forEach((v, i) => { const h = lastH[i]; if (h) v.set(h.x, h.z, h.t - LEAD, h.s); else v.set(0, 0, -99, 0); });
    let poll = 0;
    hits.forEach((h) => { poll = Math.max(poll, h.s * Math.exp(-Math.max(0, t - (h.t - LEAD)) * 1.9)); });

    // horisontin viirit: kulissi-iskut (z >= 9) napsauttavat yhtä kerrallaan
    const D = cam.pos[2] - penZ(t);
    let ampMax = 0;
    PEN.forEach((p, i) => {
      const ang = cam.yaw + [0.115, 0.235, 0.36][i];
      const x = cam.pos[0] + D * Math.tan(ang);
      p.g.position.set(x, 0, penZ(t) - 8 * i);
      let pulse = 0;
      for (const e of fan) if (e.i % 3 === i) pulse = Math.max(pulse, S.pulse(t, e.t, 0.7) * (1 - ramp(e.t + 0.5, e.t + 2.0, t)));
      const amp = p.L * (0.03 + 0.07 * w + 0.07 * pulse);
      ampMax = Math.max(ampMax, amp);
      for (const m of [p.fm, p.rm]) { m.uniforms.uTime.value = t; m.uniforms.uAmp.value = amp; }
      // kutsu on ohi, kun taistelu alkaa: viirit painuvat pois pisteittäin
      const gone = ramp(tais, frac(tais, tB, 0.6), t);
      setAppear(p.mats, 1 - gone);
      p.g.visible = gone < 0.995;
    });
    trees.forEach((tr) => { tr.g.position.x = cx + wrap(tr.x0 - kx * 0.9 + 80, 240) - 0; tr.g.position.y = 0; tr.g.scale.setScalar(tr.s); });
    FG.forEach((layer) => layer.items.forEach((it) => {
      it.g.position.x = cx + wrap(it.x0 - layer.p * cx, 130);
      it.g.position.y = -0.2;
      it.g.visible = (layer.mi === 0 || battle > 0) && cam.pos[2] - layer.z < 2.2 && cam.pos[2] > layer.z - 1;   // vain kun kerros ohittaa kameran
    }));

    // hevonen ja ritari
    H.root.position.set(kx, 0, 0);
    poseHorseBlend(t);
    L.place(t, leaderState, windAt, { capeWind: 0.3 + 0.5 * w, width: 0.95, dt: 0.022, windScale: 0.45, sashSignal: sashSig });
    const ph = phase(t);

    // olennot
    let alive = 0, act = 0, actV = 0, nW = 0, nV = 0;
    const lista = [];
    creatures.forEach(({ c, o, sw }) => {
      const on = t >= c.t0 - LEAD && t < c.t1 - (c.ev ? LEAD : 0);
      o.root.visible = on;
      if (!on) { sw.mesh.visible = false; return; }
      alive++;
      const s = crState(c, t);
      const ar = clamp(s.u * 1.6);
      setAppear(o.mats, ar);
      const zc = -1.2 - 0.8 * (c.j % 3);
      o.root.position.set(s.x, s.y, zc);   // eri syvyyksiä: ritari (z 0,4) on aina edessä
      const g = clamp(env[c.T.env](t) * 1.5 + 0.04);
      // koko = voimakkuus (0,67 pp .. 1 ff) ja perspektiivikorjaus: olento on ritaria kauempana, joten se piirretään samassa suhteessa ritariin kuin lähellä
      const persp = (s.cam.pos[2] - zc) / (s.cam.pos[2] - 0.4);
      const sz = c.T.sc * ((1 + 0.5 * g) / 1.5) * persp;   // ei hirviömäistä kasvua: yksittäinen olento ei ylitä luvun 10 kokoja (hirviöpyörre säilyy pyörteessä)
      o.root.scale.set(-sz, sz, 1);
      o.pose(g, t, 3.0 * s.u);
      if (c.T.vaski) { actV += g; nV++; } else { act += g; nW++; }
      lista.push({ laji: c.T.name, x: Math.round(s.x * 100) / 100, y: Math.round(s.y * 100) / 100 });
      // pyörre: kaksi kierrosta olennon ympärillä, tihenee orkestraation tiheyden mukana
      const R = 0.8 * (0.9 + 1.5 * dens(t)) * (0.7 + 0.5 * c.T.swc) * (c.j === 0 ? 1 + 1.6 * ramp(tais, tB, t) : 1);
      const kxs = X(t);
      const turns = 1.4 + 0.5 * dens(t);
      const pts = [];
      for (let i = 0; i < swirlsN; i++) {
        const u = i / (swirlsN - 1);
        const a = s.ang * 1.7 + c.a0 + c.dir * TAU * turns * u;
        const r = R * (0.12 + 0.88 * u) * (0.85 + 0.15 * Math.sin(u * 9 + c.j));
        const px = s.x + r * Math.cos(a) * 1.15;
        // pyörre ei kierry ritarin päälle: hevosen ja keihään edessä oleva raja (kx + 3,2) puristaa pyörteen
        pts.push([px < kxs + 3.2 ? kxs + 3.2 + (px - kxs - 3.2) * 0.15 : px, s.y + (c.T.lento ? 0.0 : 0.5 * c.T.swc) + r * Math.sin(a) * 0.8]);
      }
      sw.mesh.visible = true;
      sw.mesh.position.z = -0.9 - 0.8 * (c.j % 3) - 0.02 * c.j;
      sw.set(pts, (f) => (0.95 * Math.pow(1 - f, 0.7) + 0.08) * ar, (f) => 1 - 0.65 * f, 0);
    });

    // läiskät ja salamat: kirjoitettu isku on yhden elementin teko olennon kuolinpaikalla
    const spl = [];
    cr.forEach((c) => {
      if (!c.ev) return;
      const st = crState(c, c.t1);
      const ev = { t: c.t1, x: st.x, y: st.y + 0.3, s: 1.7 + 0.4 * (c.ev.z - 5), z: 3, z0: -1.6 - 0.8 * (c.ev.i % 3), dir: Math.PI / 2 };
      if (c.ev.kind === 'laiska') spl.push(ev);
      else { const bo = bolts.find((b) => b.e === c.ev); if (bo) bo.pos = st.x; }
    });
    splats.set(t, spl.filter((e) => t >= e.t - LEAD && t < e.t + 1.0).slice(-8), LEAD);
    let nLaiska = 0;
    spl.forEach((e) => { if (t >= e.t - LEAD && t < e.t + 1.0) nLaiska++; });
    let salama = 0;
    bolts.forEach((b) => {
      const a = t - (b.e.t - LEAD);
      b.g.visible = a >= 0 && a < 0.34 && b.pos !== undefined;
      // salama syntyy iskun ruudulla ja hajoaa rasteriksi (ei katoa yhdessä ruudussa)
      if (b.g.visible) { b.g.position.set(b.pos, 0, -3); salama = 1; setAppear(b.mats, 1 - smoothstep(0.14, 0.34, a)); }
    });

    // pöly
    const evd = hits.slice(-DUSTN);
    dust.set((i) => {
      const e = evd[Math.floor(i / DUSTK)];
      if (!e) return null;
      const j = i % DUSTK;
      const a = t - (e.t - LEAD);
      if (a < 0 || a > 0.95) return null;
      const spread = (hash1(j * 5 + 1) - 0.5) * 3.2;
      const angD = Math.PI / 2 + (hash1(j * 5 + 2) - 0.5) * 1.5;
      const r = (1.2 + 2.6 * hash1(j * 5 + 3)) * Math.sqrt(a / 0.95);
      const l = (0.6 + 1.6 * hash1(j * 5 + 4)) * (1 - a / 0.95);
      return { x: e.x + spread + Math.cos(angD) * r, y: 0.05 + Math.sin(angD) * r, z: e.z, ang: angD, len: l, w: 0.07 };
    });

    act = nW ? act / nW : 0; actV = nV ? actV / nV : 0;   // keskimääräinen ele (ei riipu lukumäärästä)
    last = {
      olennot: Math.round(act * 1000) / 1000, puupuhallin_olennot: Math.round(act * 1000) / 1000, vaski_olennot: Math.round(actV * 1000) / 1000, olennot_n: alive, olennot_lista: lista, ritari_y: Math.round(P.root.position.y * 1000) / 1000, pisteviivat: Math.round(gU.uDots.value * 1000) / 1000, laiskat: nLaiska, salama, pollahdys: Math.round(poll * 1000) / 1000,
      viirit_amp: Math.round(ampMax * 1000) / 1000, viirit_z: Math.round(penZ(t) * 100) / 100,
      kentta_punainen: Math.round(gU.uRedG.value * 1000) / 1000, kentta_viivoitus: Math.round(gU.uField.value * 1000) / 1000,
      asento: asento(t), vyo_viulu: Math.round(sashSig(t) * 1000) / 1000, vyo_määrä: Math.round(L.sash.last.amount * 1000) / 1000, hiljaisuus: Math.round(q * 1000) / 1000,
      levy_kierto: Math.round(clamp((t - flip) / Math.max(1, S.T_END - flip)) * 1000) / 1000,
    };

    placeRecord(t);

    // kohdistus hajoaa: tiheys ja taistelun eteneminen
    const mis = 0.4 + 2.2 * ramp(tais, frac(tais, flip, 0.3), t) * (0.45 + 0.55 * dens(t)) * battle;
    return { mis, paper: q, dens: dens(t), wind: w };
  }
  return { scene, update, shots, probe: () => last, camAt, lead: L, state: leaderState };
}
