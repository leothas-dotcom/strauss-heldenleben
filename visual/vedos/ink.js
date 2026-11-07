// Painojälki paperileikkeille: tasavärit, rasteriliukumat ("liukuvärit rasterina"), pisteittäin
// painuva ilmestyminen ja lopullinen vedos (paperi, levyn pöly, kohdistus, otsikot, siirtymät
// kohtausten välillä, puupiirrosjähmettymä). Värit kulkevat raakana (ColorManagement pois).

import * as THREE from 'three';

THREE.ColorManagement.enabled = false;

export const PAL = {
  paper: 0xe8dcc6, blue: 0x143e66, red: 0xf5461a, black: 0x1f1a18,
  gold: 0xc9a24d, purple: 0x8e2457, green: 0x5f8566,
};
export const C = Object.fromEntries(Object.entries(PAL).map(([k, v]) => [k, new THREE.Color(v)]));

// Jaetut uniformit.
export const U = {
  uCell: { value: 7.0 },
  uDim: { value: 0 },
  uRes: { value: new THREE.Vector2(1920, 1080) },
};

export const HALFTONE = /* glsl */ `
  float aastep(float th, float v) { float w = fwidth(v) * 0.75; return smoothstep(th - w, th + w, v); }
  // Rasteripiste: cov = musteen peitto 0..1, kulma kuten painolaatoissa.
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

const VS = /* glsl */ `
  varying vec3 vW;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 lp = vec4(position, 1.0);
    #ifdef USE_INSTANCING
    lp = instanceMatrix * lp;
    #endif
    vec4 w = modelMatrix * lp;
    vW = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

// Tasaväri + rasteri. uGrad: toinen väri rasterina maailman y:n mukaan (y0 -> y1).
// uAppear < 1: kappale painuu näkyviin pisteittäin (ei läpinäkyvyyttä, vaan rasteri).
const FS = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uShade;
  uniform float uRaster;
  uniform float uAng;
  uniform float uCell;
  uniform float uDim;
  uniform float uSelfDim;
  uniform float uAppear;
  uniform vec3 uGradC;
  uniform vec4 uGrad;   // y0, y1, määrä, käytössä
  varying vec3 vW;
  ${HALFTONE}
  void main() {
    if (uAppear < 0.999) {
      float d = halftone(1.0 - uAppear, 0.4, uCell * 1.4);
      if (d > 0.5) discard;
    }
    vec3 c = uColor;
    if (uGrad.w > 0.5) {
      float g = clamp((vW.y - uGrad.x) / (uGrad.y - uGrad.x), 0.0, 1.0) * uGrad.z;
      c = mix(c, uGradC, halftone(g, 0.26, uCell));
    }
    c = mix(c, uShade, halftone(uRaster, uAng, uCell));
    float dim = clamp(uDim + uSelfDim, 0.0, 1.0);
    c = mix(c, vec3(0.12, 0.1, 0.095), halftone(dim * 0.92, 0.785, uCell));
    gl_FragColor = vec4(c, 1.0);
  }
`;

export function ink(color, opts = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uShade: { value: new THREE.Color(opts.shade ?? C.black) },
      uRaster: { value: opts.raster ?? 0 },
      uAng: { value: opts.angle ?? 0.785 },
      uSelfDim: { value: 0 },
      uAppear: { value: 1 },
      uGradC: { value: new THREE.Color(opts.grad ? opts.grad[0] : C.black) },
      uGrad: { value: opts.grad ? new THREE.Vector4(opts.grad[1], opts.grad[2], opts.grad[3] ?? 1, 1) : new THREE.Vector4(0, 1, 0, 0) },
      uCell: U.uCell,
      uDim: opts.noDim ? { value: 0 } : U.uDim,
    },
    vertexShader: VS,
    fragmentShader: FS,
    side: THREE.DoubleSide,
    depthWrite: true,
  });
}

// --- Lopullinen vedos -----------------------------------------------------------------------
const POST_FS = /* glsl */ `
  uniform sampler2D tA;
  uniform sampler2D tB;
  uniform sampler2D tTitle;
  uniform vec2 uRes;
  uniform float uMix;      // siirtymä A -> B (0..1)
  uniform float uMode;     // 0 rasteriliukuma, 1 paperin kautta, 2 iiris
  uniform vec3 uIris;      // keskipiste (0..1) ja säde
  uniform float uGrain;
  uniform float uMis;
  uniform float uPaper;
  uniform float uTitle;
  uniform float uWood;     // puupiirrosjähmettymä 0..1
  uniform float uFlash;    // salama: paperi
  uniform vec4 uDust[24];
  uniform vec3 uPaperC;
  uniform vec3 uBlack;
  uniform vec3 uRedC;
  uniform float uShake;
  uniform vec3 uPrint;     // painokohta: x (0..1), painetun alueen vasen raja, luonnoksen voimakkuus
  varying vec2 vUv;
  ${HALFTONE}
  vec3 grab(sampler2D t, vec2 uv) {
    vec3 c = texture2D(t, uv).rgb;
    vec2 off = vec2(uMis, -0.6 * uMis) / uRes;
    c.r = mix(c.r, texture2D(t, uv + off).r, 0.85);
    return c;
  }
  void main() {
    vec2 px = vUv * uRes;
    vec2 uv = vUv + vec2(0.0, uShake / uRes.y);
    vec3 a = grab(tA, uv);
    vec3 c = a;
    if (uMix > 0.0) {
      vec3 b = grab(tB, uv);
      if (uMode < 0.5) {
        // rasteriliukuma: B painuu A:n päälle pisteittäin
        float h = halftone(uMix, 0.52, uCellPost());
        c = mix(a, b, h);
      } else if (uMode < 1.5) {
        float m1 = smoothstep(0.0, 0.5, uMix), m2 = smoothstep(0.5, 1.0, uMix);
        c = uMix < 0.5 ? mix(a, uPaperC, halftone(m1, 0.52, 9.0)) : mix(uPaperC, b, halftone(m2, 0.52, 9.0));
      } else {
        float r = length((vUv - uIris.xy) * vec2(uRes.x / uRes.y, 1.0));
        c = r < uIris.z ? b : a;
      }
    }
    // Puupiirros: kova kynnys mustaan ja paperiin (Dürer), punainen säilyy.
    if (uWood > 0.0) {
      float l = dot(c, vec3(0.3, 0.55, 0.15));
      float red = step(0.25, c.r - c.g);
      vec3 wc = l > 0.45 ? uPaperC : uBlack;
      wc = red > 0.5 ? uRedC : wc;
      float lines = step(0.5, fract((px.x + px.y) / 6.0));
      if (l > 0.3 && l <= 0.45) wc = lines > 0.5 ? uBlack : uPaperC;
      c = mix(c, wc, uWood);
    }
    c = mix(c, uPaperC, uFlash);
    // Painokohta (tyyli, luku 6): oikealla tyhjää paperia ja haalea lyijykynäluonnos; vasemmalla
    // painettu friisi. Raja on epätasainen kuin painuva muste.
    if (uPrint.z > 0.0) {
      float edge = (vnoise(px * 0.02) - 0.5) * 0.012 + (vnoise(px * 0.15) - 0.5) * 0.004;
      float ahead = smoothstep(uPrint.x - 0.004, uPrint.x + 0.006, vUv.x + edge);
      float before = 1.0 - smoothstep(uPrint.y - 0.006, uPrint.y + 0.004, vUv.x + edge);
      float unp = max(ahead, before);
      float l = dot(c, vec3(0.3, 0.55, 0.15));
      vec3 pencil = mix(uPaperC, vec3(0.42, 0.45, 0.52), clamp((0.75 - l) * 0.55, 0.0, 0.32) * uPrint.z);
      c = mix(c, pencil, unp);
    }
    // Hiljaisuus on tyhjää paperia.
    float th = vnoise(px * 0.012) * 0.6 + vnoise(px * 0.08) * 0.25 + vnoise(px * 0.5) * 0.15;
    float pa = smoothstep(th - 0.06, th + 0.06, uPaper * 1.12 - 0.06);
    c = mix(c, uPaperC, pa);
    vec4 tt = texture2D(tTitle, vUv);
    float ta = tt.a * uTitle;
    float edge = vnoise(px * 0.09) * 0.35 + vnoise(px * 0.6) * 0.15;
    ta = smoothstep(0.25 + edge, 0.55 + edge, ta);
    c = mix(c, tt.rgb, ta);
    for (int i = 0; i < 24; i++) {
      vec4 d = uDust[i];
      if (d.z <= 0.0) continue;
      vec2 q = px - d.xy;
      float r = d.z * (0.75 + 0.5 * vnoise(q * 0.6 + d.xy));
      float m = 1.0 - smoothstep(r - 0.8, r + 0.8, length(q));
      c = mix(c, d.w > 0.0 ? uBlack : uPaperC, m * abs(d.w));
    }
    float g = vnoise(px * 0.9) * 0.5 + vnoise(px * 0.23) * 0.3 + vnoise(px * vec2(0.05, 0.7)) * 0.2;
    c *= 1.0 - uGrain * (g - 0.35);
    gl_FragColor = vec4(c, 1.0);
  }
`.replace('uCellPost()', '8.0');

export function createPost(renderer, W, H) {
  const mk = () => new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.UnsignedByteType });
  const rtA = mk();
  const rtB = mk();
  const title = document.createElement('canvas');
  title.width = W;
  title.height = H;
  const titleTex = new THREE.CanvasTexture(title);
  titleTex.minFilter = THREE.LinearFilter;
  titleTex.generateMipmaps = false;
  const dust = Array.from({ length: 24 }, () => new THREE.Vector4(0, 0, 0, 0));
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      tA: { value: rtA.texture }, tB: { value: rtB.texture }, tTitle: { value: titleTex },
      uRes: U.uRes, uMix: { value: 0 }, uMode: { value: 0 }, uIris: { value: new THREE.Vector3(0.5, 0.5, 0) },
      uGrain: { value: 0.06 }, uMis: { value: 0 }, uPaper: { value: 0 }, uTitle: { value: 0 }, uWood: { value: 0 },
      uFlash: { value: 0 }, uShake: { value: 0 }, uDust: { value: dust }, uPrint: { value: new THREE.Vector3(1, 0, 0) },
      uPaperC: { value: C.paper.clone() }, uBlack: { value: C.black.clone() }, uRedC: { value: C.red.clone() },
    },
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: POST_FS,
    depthTest: false,
    depthWrite: false,
  });
  const scene = new THREE.Scene();
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  return {
    rtA, rtB, uniforms: mat.uniforms, dust,
    titleCtx: title.getContext('2d'),
    titleChanged() { titleTex.needsUpdate = true; },
    render() {
      renderer.setRenderTarget(null);
      renderer.render(scene, cam);
    },
  };
}
