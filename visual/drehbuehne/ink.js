// Painojälki 3D:lle: rasterivarjostus (ei digitaalisia liukuvärejä), ääriviivat (käännetty kuori),
// ja lopullinen vedos (paperin rakeisuus, levyn pöly, kohdistusvirhe, otsikot, paperiin häivytys).
// Värit kulkevat raakana (ColorManagement pois), jotta paletin arvot ovat tarkat.

import * as THREE from 'three';

THREE.ColorManagement.enabled = false;

export const PAL = {
  paper: 0xe8dcc6, blue: 0x143e66, red: 0xf5461a, black: 0x1f1a18,
  gold: 0xc9a24d, purple: 0x8e2457, green: 0x5f8566,
};
export const C = Object.fromEntries(Object.entries(PAL).map(([k, v]) => [k, new THREE.Color(v)]));
// Päällepainatus: kahden laatan sekoitus (kertolasku), esim. sininen + punainen.
export const over = (a, b) => new THREE.Color(a).multiply(new THREE.Color(b));

// Jaetut uniformit: kaikki materiaalit lukevat samat arvot.
export const U = {
  uLight: { value: new THREE.Vector3(-0.45, 0.8, 0.55).normalize() },
  uCell: { value: 7.0 },
  uDim: { value: 0 },
  uRes: { value: new THREE.Vector2(1920, 1080) },
};

export const HALFTONE = /* glsl */ `
  float aastep(float th, float v) { float w = fwidth(v) * 0.75; return smoothstep(th - w, th + w, v); }
  // Rasteripiste: cov = musteen peitto 0..1. Kulma kuten painolaatoissa.
  float halftone(float cov, float ang, float cell) {
    cov = clamp(cov, 0.0, 1.0);
    vec2 p = gl_FragCoord.xy / cell;
    float c = cos(ang), s = sin(ang);
    p = vec2(c * p.x - s * p.y, s * p.x + c * p.y);
    if (cov < 0.5) {
      float d = length(fract(p) - 0.5);
      return 1.0 - aastep(sqrt(cov / 3.14159), d);
    }
    float d2 = length(fract(p + 0.5) - 0.5);
    return aastep(sqrt((1.0 - cov) / 3.14159), d2);
  }
  float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash12(i), hash12(i + vec2(1, 0)), u.x), mix(hash12(i + vec2(0, 1)), hash12(i + vec2(1, 1)), u.x), u.y);
  }
`;

const INK_VS = /* glsl */ `
  varying vec3 vN;
  varying vec3 vW;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vW = w.xyz;
    vN = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const INK_FS = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uShade;
  uniform vec3 uLight;
  uniform float uCell;
  uniform float uDim;
  uniform float uAmbient;
  uniform float uFlat;
  uniform float uAng;
  uniform float uRaster;
  uniform float uSelfDim;
  varying vec3 vN;
  varying vec3 vW;
  ${HALFTONE}
  void main() {
    vec3 n = normalize(vN);
    if (!gl_FrontFacing) n = -n;
    float l = max(dot(n, uLight), 0.0);
    float lit = mix(uAmbient + (1.0 - uAmbient) * l, 1.0, uFlat);
    lit *= (1.0 - clamp(uDim + uSelfDim, 0.0, 1.0));
    float cov = smoothstep(0.66, 0.0, lit) * 0.95;
    cov = max(cov, uRaster);
    float ink = halftone(cov, uAng, uCell);
    gl_FragColor = vec4(mix(uColor, uShade, ink), 1.0);
  }
`;

// Värimateriaali: perusväri valossa, varjo rasteripisteinä varjovärillä.
export function inkMat(color, shade = C.black, opts = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uShade: { value: new THREE.Color(shade) },
      uAmbient: { value: opts.ambient ?? 0.38 },
      uFlat: { value: opts.flat ?? 0 },
      uAng: { value: opts.angle ?? 0.785 },
      uRaster: { value: opts.raster ?? 0 },
      uSelfDim: { value: 0 },
      uLight: U.uLight,
      uCell: U.uCell,
      uDim: U.uDim,
    },
    vertexShader: INK_VS,
    fragmentShader: INK_FS,
    side: opts.side ?? THREE.FrontSide,
    transparent: false,
  });
}

const HULL_VS = /* glsl */ `
  attribute vec3 hullNormal;
  uniform float uPx;
  uniform vec2 uRes;
  void main() {
    vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vec3 nv = normalize(normalMatrix * hullNormal);
    vec2 dir = (projectionMatrix * vec4(nv, 0.0)).xy;
    float L = length(dir);
    dir = L > 1e-5 ? dir / L : vec2(0.0);
    clip.xy += dir * uPx * 2.0 / uRes * clip.w;
    gl_Position = clip;
  }
`;
const HULL_FS = /* glsl */ `
  uniform vec3 uColor;
  void main() { gl_FragColor = vec4(uColor, 1.0); }
`;

export function hullMat(color = C.black, px = 2.2) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uPx: { value: px }, uRes: U.uRes },
    vertexShader: HULL_VS,
    fragmentShader: HULL_FS,
    side: THREE.BackSide,
  });
}

// Kuoren normaalit: saman paikan kärkien normaalit keskiarvoistetaan, jotta särmiin ei jää rakoja.
export function withHull(geo) {
  if (geo.getAttribute('hullNormal')) return geo;
  const pos = geo.getAttribute('position');
  const nor = geo.getAttribute('normal');
  const acc = new Map();
  const key = (i) => `${pos.getX(i).toFixed(4)},${pos.getY(i).toFixed(4)},${pos.getZ(i).toFixed(4)}`;
  for (let i = 0; i < pos.count; i++) {
    const k = key(i);
    const a = acc.get(k) || [0, 0, 0];
    a[0] += nor.getX(i); a[1] += nor.getY(i); a[2] += nor.getZ(i);
    acc.set(k, a);
  }
  const hn = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const a = acc.get(key(i));
    const l = Math.hypot(a[0], a[1], a[2]) || 1;
    hn[i * 3] = a[0] / l; hn[i * 3 + 1] = a[1] / l; hn[i * 3 + 2] = a[2] / l;
  }
  geo.setAttribute('hullNormal', new THREE.BufferAttribute(hn, 3));
  return geo;
}

// Litteäsävytteinen (fasetoitu) geometria: geometriset asut näkyvät tasoina.
export function faceted(geo) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  g.computeVertexNormals();
  return withHull(g);
}

// --- Lopullinen vedos ---------------------------------------------------------------------
const POST_FS = /* glsl */ `
  uniform sampler2D tScene;
  uniform sampler2D tTitle;
  uniform vec2 uRes;
  uniform float uGrain;
  uniform float uMis;
  uniform float uPaper;
  uniform float uTitle;
  uniform vec4 uDust[24];
  uniform vec3 uPaperC;
  uniform vec3 uBlack;
  varying vec2 vUv;
  ${HALFTONE}
  void main() {
    vec2 px = vUv * uRes;
    vec3 c = texture2D(tScene, vUv).rgb;
    // Kohdistusvirhe: punainen laatta liukuu harmonisen jännitteen mukaan.
    vec2 off = vec2(uMis, -0.6 * uMis) / uRes;
    c.r = mix(c.r, texture2D(tScene, vUv + off).r, 0.85);
    // Hiljaisuus on tyhjää paperia: kuva nousee paperista ja palaa siihen.
    float th = vnoise(px * 0.012) * 0.6 + vnoise(px * 0.08) * 0.25 + vnoise(px * 0.5) * 0.15;
    float pa = smoothstep(th - 0.06, th + 0.06, uPaper * 1.12 - 0.06);
    c = mix(c, uPaperC, pa);
    // Otsikot: muste painuu paperiin.
    vec4 tt = texture2D(tTitle, vUv);
    float ta = tt.a * uTitle;
    float edge = vnoise(px * 0.09) * 0.35 + vnoise(px * 0.6) * 0.15;
    ta = smoothstep(0.25 + edge, 0.55 + edge, ta);
    c = mix(c, tt.rgb, ta);
    // Levyn pöly: naksahdukset täplinä samassa ruudussa kuin ne kuuluvat.
    for (int i = 0; i < 24; i++) {
      vec4 d = uDust[i];
      if (d.z <= 0.0) continue;
      vec2 q = px - d.xy;
      float r = d.z * (0.75 + 0.5 * vnoise(q * 0.6 + d.xy));
      float m = 1.0 - smoothstep(r - 0.8, r + 0.8, length(q));
      c = mix(c, d.w > 0.0 ? uBlack : uPaperC, m * abs(d.w));
    }
    // Paperin kuitu ja rakeisuus (pysyy paperissa, matala kontrasti).
    float g = vnoise(px * 0.9) * 0.5 + vnoise(px * 0.23) * 0.3 + vnoise(px * vec2(0.05, 0.7)) * 0.2;
    c *= 1.0 - uGrain * (g - 0.35);
    gl_FragColor = vec4(c, 1.0);
  }
`;

export function createPost(renderer, W, H) {
  const rt = new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.UnsignedByteType });
  const title = document.createElement('canvas');
  title.width = W;
  title.height = H;
  const titleTex = new THREE.CanvasTexture(title);
  titleTex.minFilter = THREE.LinearFilter;
  titleTex.generateMipmaps = false;
  const dust = Array.from({ length: 24 }, () => new THREE.Vector4(0, 0, 0, 0));
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      tScene: { value: rt.texture },
      tTitle: { value: titleTex },
      uRes: U.uRes,
      uGrain: { value: 0.06 },
      uMis: { value: 0 },
      uPaper: { value: 0 },
      uTitle: { value: 0 },
      uDust: { value: dust },
      uPaperC: { value: C.paper.clone() },
      uBlack: { value: C.black.clone() },
    },
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: POST_FS,
    depthTest: false,
    depthWrite: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  const scene = new THREE.Scene();
  scene.add(quad);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  return {
    rt,
    uniforms: mat.uniforms,
    dust,
    titleCanvas: title,
    titleCtx: title.getContext('2d'),
    titleChanged() { titleTex.needsUpdate = true; },
    render() {
      renderer.setRenderTarget(null);
      renderer.render(scene, cam);
    },
  };
}
