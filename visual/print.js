// Painojälki (WebGL2): laatat -> rasteri, kohdistus, päällepainatus paperille, pöly.
// Rasteri ja paperi on kiinnitetty friisiin (maailmankoordinaatteihin), joten pisteet eivät valu.

const VS = `#version 300 es
void main() {
  vec2 p = vec2(gl_VertexID == 1 ? 3.0 : -1.0, gl_VertexID == 2 ? 3.0 : -1.0);
  gl_Position = vec4(p, 0.0, 1.0);
}`;

const FS = `#version 300 es
precision highp float;
uniform sampler2D uB0, uB1, uB2, uR, uK, uS, uD;
uniform vec2 uRes, uCam;
uniform vec3 uPar;          // sinisten kerrosten parallaksit
uniform float uTen[65];     // harmoninen jännite ruudun leveydellä
uniform float uMaxOff;
out vec4 outColor;

const vec3 PAPER = vec3(0.910, 0.863, 0.776);      // #E8DCC6
// Musteen läpäisy = musteen väri / paperi, jolloin täysi muste paperilla = paletin väri.
const vec3 T_BLUE = vec3(0.086, 0.282, 0.515);     // #143E66
const vec3 T_RED = vec3(1.0, 0.318, 0.131);        // #F5461A
const vec3 T_BLACK = vec3(0.134, 0.118, 0.121);    // #1F1A18
const vec3 T_GRAPHITE = vec3(0.6, 0.6, 0.63);

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float tensionAt(float x) {
  float u = clamp(x / uRes.x, 0.0, 1.0) * 64.0;
  int i = int(floor(u));
  int j = min(i + 1, 64);
  return mix(uTen[i], uTen[j], fract(u));
}
float cov(sampler2D s, vec2 px) { return texture(s, px / uRes).a; }
// Musteen epätasaisuus: reunat repaleisiksi, sävypinnat laikukkaiksi.
float rough(float c, vec2 w) {
  float edge = 4.0 * c * (1.0 - c);
  c += (vnoise(w * 0.45) - 0.5) * 0.45 * edge;
  return clamp(c * (0.93 + 0.14 * vnoise(w * 0.03)), 0.0, 1.0);
}
// Rasteri: peittoaste -> pisteet. Täysi muste pysyy yhtenäisenä.
float halftone(float c, vec2 w, float ang, float cell) {
  float cs = cos(ang), sn = sin(ang);
  vec2 q = mat2(cs, -sn, sn, cs) * w / cell;
  float s = 0.5 + 0.25 * (cos(6.2831853 * q.x) + cos(6.2831853 * q.y));
  float aa = fwidth(s) * 0.8 + 1e-4;
  float h = smoothstep(s - aa, s + aa, c);
  h = c > 0.985 ? 1.0 : h;
  return c < 0.004 ? 0.0 : h;
}

void main() {
  vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  float ten = tensionAt(px.x);
  vec2 offB = vec2(1.0, -0.6) * uMaxOff * ten;
  vec2 offR = vec2(-0.8, 0.7) * uMaxOff * ten;
  vec2 offK = vec2(0.35, 0.3) * uMaxOff * ten;
  vec2 w1 = px + uCam;
  vec2 wb0 = px + uCam * uPar.x;
  vec2 wb1 = px + uCam * uPar.y;
  vec2 wb2 = px + uCam * uPar.z;

  float hb0 = halftone(rough(cov(uB0, px + offB), wb0), wb0, 0.2618, 5.0);
  float hb1 = halftone(rough(cov(uB1, px + offB), wb1), wb1, 0.2618, 5.0);
  float hb2 = halftone(rough(cov(uB2, px + offB), wb2), wb2, 0.2618, 5.0);
  float hB = 1.0 - (1.0 - hb0) * (1.0 - hb1) * (1.0 - hb2);
  float hR = halftone(rough(cov(uR, px + offR), w1), w1, 1.309, 5.0);
  float hK = halftone(rough(cov(uK, px + offK), w1), w1, 0.7854, 4.0);
  hB *= 1.0 - hR;  // sankari on maailman edessä: sinistä ei paineta punaisen alle

  // Paperin kuidut: kierretyt koordinaatit, ettei hajautuksen akselirakenne näy juovina.
  vec2 wr = mat2(0.8, -0.6, 0.6, 0.8) * mod(w1, 4096.0);
  float g = (vnoise(wr * vec2(0.7, 0.55)) - 0.5) * 0.035
          + (vnoise(wr * 0.07) - 0.5) * 0.035
          + (vnoise(w1 * 0.006) - 0.5) * 0.03;
  vec3 col = PAPER * (1.0 + g);
  float sk = clamp(cov(uS, px) * (0.75 + 0.5 * vnoise(w1 * 0.6)), 0.0, 1.0);
  col *= mix(vec3(1.0), T_GRAPHITE, sk);
  col *= mix(vec3(1.0), T_BLUE, hB);
  col *= mix(vec3(1.0), T_RED, hR);
  col *= mix(vec3(1.0), T_BLACK, hK);
  col *= 1.0 - 0.6 * cov(uD, px) * (1.0 - hR);  // patina pysyy paperissa
  outColor = vec4(col, 1.0);
}`;

export function createPrinter(view, plates) {
  const gl = view.getContext('webgl2', {
    antialias: false, alpha: false, preserveDrawingBuffer: true, premultipliedAlpha: false,
  });
  if (!gl) throw new Error('WebGL2 ei käytettävissä');

  const shader = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);
  const loc = (name) => gl.getUniformLocation(prog, name);

  const names = ['uB0', 'uB1', 'uB2', 'uR', 'uK', 'uS', 'uD'];
  const sources = [...plates.blue, plates.red, plates.black, plates.sketch, plates.dust];
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  const textures = sources.map((_, i) => {
    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + i);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(loc(names[i]), i);
    return tex;
  });
  gl.uniform2f(loc('uRes'), view.width, view.height);
  gl.uniform1f(loc('uMaxOff'), 5.0);
  const uCam = loc('uCam');
  const uTen = loc('uTen');
  const uPar = loc('uPar');

  return {
    composite({ camX, camY, ten, parallax }) {
      sources.forEach((src, i) => {
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, textures[i]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
      });
      gl.uniform2f(uCam, camX, camY);
      gl.uniform1fv(uTen, ten);
      gl.uniform3f(uPar, parallax[0], parallax[1], parallax[2]);
      gl.viewport(0, 0, view.width, view.height);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.flush();
    },
  };
}
