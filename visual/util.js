// Deterministiset apufunktiot. Kaikki "satunnaisuus" tulee hajautusfunktiosta,
// joten ruutu n näyttää aina samalta.

export function hash1(n) {
  let x = Math.imul((n | 0) ^ 0x9e3779b9, 0x85ebca6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

export function vnoise1(x, seed = 0) {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  const a = hash1(i * 7919 + seed * 104729);
  const b = hash1((i + 1) * 7919 + seed * 104729);
  return a + (b - a) * u;
}

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

export function smoothstep(a, b, x) {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

export const mix = (a, b, t) => a + (b - a) * t;

export function gaussian(src, sigma) {
  const r = Math.ceil(sigma * 3);
  const k = new Float32Array(2 * r + 1);
  let sum = 0;
  for (let i = -r; i <= r; i++) sum += (k[i + r] = Math.exp(-(i * i) / (2 * sigma * sigma)));
  const out = new Float32Array(src.length);
  const last = src.length - 1;
  for (let n = 0; n <= last; n++) {
    let acc = 0;
    for (let i = -r; i <= r; i++) acc += k[i + r] * src[Math.min(last, Math.max(0, n + i))];
    out[n] = acc / sum;
  }
  return out;
}

// Ruutudatan lineaarinen näytteistys ajassa (s).
export function sampler(arr, fps) {
  const last = arr.length - 1;
  return (t) => {
    const x = clamp(t * fps, 0, last);
    const i = Math.floor(x);
    const j = Math.min(i + 1, last);
    return arr[i] + (arr[j] - arr[i]) * (x - i);
  };
}
