/*
 * Buraco negro em 3D (protótipo da parte "Sobre mim").
 *
 * Mesmo estilo do buraco negro do topo do portfólio (blackhole.js): o mesmo gás roxo do disco,
 * o anel de fótons fino e a névoa violeta, desenhados por um shader que segue os raios de luz
 * curvados pela gravidade (geodésicas de Schwarzschild). A diferença é que aqui a câmera gira
 * em volta dele em 3D, então tudo tem que estar certo de qualquer ângulo: as duas faces do disco
 * brilham, e a luz da parte de trás do disco é curvada por cima e por baixo da sombra.
 *
 * As 5 partes (cada uma pode ser realçada; as outras escurecem):
 *   1. singularidade        — o ponto no centro (escondido; aparece em "raio-x" ao realçar)
 *   2. horizonte de eventos — a esfera negra (r = 1); ao realçar mostra uma grade na superfície
 *   3. esfera de fótons     — a casca onde a luz anda em círculos (r = 1,5) e o anel fino
 *   4. disco de acreção     — o gás girando, mais rápido perto do centro
 *   5. jatos relativísticos — dois feixes de plasma saindo pelos polos
 *
 * Sem bibliotecas: um shader de tela cheia e uma câmera que gira em volta (arrastar, rolar, pinça).
 */
(function () {
  'use strict';

  var FS = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uCam;      // posição da câmera
uniform mat3 uRot;      // colunas: direita, cima, frente
uniform float uFoco;    // 1 / tan(campo de visão / 2)
uniform float uPix;     // tamanho de um pixel, em unidades do buraco, na distância do centro
uniform float uS;       // força de cada parte: 1 = normal, mais que 1 = realçada, menos = apagada
uniform float uH;
uniform float uF;
uniform float uD;
uniform float uJ;

const float PI = 3.14159265;
const float RIN  = 1.6;   // borda interna do disco (raio de Schwarzschild = 1)
const float ROUT = 10.8;  // borda externa
const float RFOT = 1.5;   // esfera de fótons
const float BCRIT = 2.598; // onde fica o anel de fótons (parâmetro de impacto crítico)
const float JLEN = 30.0;  // comprimento dos jatos
const float RMAX = 34.0;  // fora desta esfera o espaço é tratado como plano

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// ruído de valor, periódico em x (para o ângulo fechar sem emenda)
float vnoise(vec2 p, float per) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float x0 = mod(i.x, per), x1 = mod(i.x + 1.0, per);
  float a = hash(vec2(x0, i.y)),       b = hash(vec2(x1, i.y));
  float c = hash(vec2(x0, i.y + 1.0)), d = hash(vec2(x1, i.y + 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p, float per) {
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 5; i++) {
    s += a * vnoise(p, per);
    p *= vec2(2.0, 2.03); per *= 2.0; p.y += 17.0; a *= 0.5;
  }
  return s;
}

float fbm3(vec2 p, float per) {
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 3; i++) {
    s += a * vnoise(p, per);
    p *= vec2(2.0, 2.03); per *= 2.0; p.y += 17.0; a *= 0.5;
  }
  return s / 0.875;
}

// textura do gás em coordenadas polares (a mesma do buraco do topo)
vec2 gas(float r, float ang, float seed) {
  float per = 9.0;
  float an = ang / (2.0 * PI);
  vec2 q = vec2(an * per, r * 0.6 + seed);
  vec2 wq = q + vec2(0.0, 40.0);
  q += 0.55 * vec2(fbm3(wq, per) - 0.5, (fbm3(wq + vec2(0.0, 23.0), per) - 0.5) * 1.6);
  float n = fbm(q, per);
  float fine = fbm(vec2(q.x * 3.0, q.y * 2.6 + seed * 2.0), per * 3.0);
  float e = fbm3(vec2(an * 8.0, r * 0.15 + seed + 80.0), 8.0);
  return vec2(n * 0.6 + fine * 0.4, e);
}

// paleta roxa: índigo profundo -> violeta -> orquídea -> lavanda quase branca
vec3 fire(float x) {
  return vec3(smoothstep(0.0, 0.75, x) * 0.92,
              smoothstep(0.40, 1.0, x) * 0.88,
              smoothstep(0.0, 0.30, x));
}

// ---- 4. disco de acreção: emissão no ponto p onde o raio atravessa o plano (v = direção do raio)
vec4 disco(vec3 p, vec3 v) {
  float r = length(p.xz);
  if (r < RIN || r > ROUT * 1.2 + 0.5) return vec4(0.0);
  float ang = atan(p.z, p.x);

  // rotação kepleriana (mais rápida perto do centro), com mistura de duas fases
  // para a textura não se enrolar infinitamente
  float om = 3.2 / pow(r, 1.5);
  const float T = 7.0;
  float t1 = fract(uTime / T), t2 = fract(uTime / T + 0.5);
  float w = 1.0 - abs(2.0 * t1 - 1.0);
  float spiral = r * 0.32;
  vec2 g1 = gas(r, ang + spiral - om * (t1 - 0.5) * T, 0.0);
  vec2 g2 = gas(r, ang + spiral - om * (t2 - 0.5) * T, 31.7);
  vec2 g = mix(g2, g1, w);
  float n = smoothstep(0.22, 0.78, g.x);
  float e = smoothstep(0.30, 0.70, g.y);

  // borda externa irregular: o gás se desfaz em línguas
  float rEdge = ROUT * (0.76 + 0.24 * e);
  float edge  = 1.0 - smoothstep(rEdge * 0.75, rEdge + 0.3, r);
  float fr    = smoothstep(rEdge * 0.54, rEdge * 0.93, r);
  float wisp  = mix(1.0, smoothstep(0.25, 0.75, n) * 1.7, fr);

  float inner = smoothstep(RIN, RIN + 0.15, r);
  float fall  = pow(RIN / r, 1.15);
  float I = inner * edge * wisp * (0.9 + 2.6 * pow(n, 1.5)) * (0.6 + 2.2 * fall);

  // efeito Doppler: o lado do disco que vem na nossa direção brilha mais
  vec3 vel = normalize(vec3(-p.z, 0.0, p.x));
  float dop = 1.0 + 0.3 * dot(vel, -normalize(v));
  I *= dop * dop;

  float x = 1.0 - exp(-I * 0.7);
  float alpha = smoothstep(0.0, 0.45, x) * 0.97;
  return vec4(fire(x) * uD, alpha * min(uD, 1.0));
}

// ---- 5. jatos relativísticos: plasma saindo pelos dois polos (emissão por volume)
// (sinT: seno do ângulo entre o raio e o feixe; visto de ponta, o raio atravessaria o jato
//  inteiro e viraria uma mancha branca, então a emissão cai)
vec3 jato(vec3 p, float sinT) {
  float ay = abs(p.y);
  if (ay < 1.1 || ay > JLEN) return vec3(0.0);
  float rho = length(p.xz);
  float w = 0.16 + 0.07 * ay;            // o feixe abre devagar
  if (rho > w * 3.0) return vec3(0.0);
  float q = rho / w;
  float nucleo = exp(-q * q * 3.0);      // fio central, quase branco
  float bainha = exp(-q * q * 0.8);      // bainha violeta em volta
  // nós de plasma subindo depressa e uma torção em hélice na bainha
  float lado = p.y > 0.0 ? 0.0 : 7.3;
  float s = ay * 0.9 - uTime * 7.0;
  float nos = vnoise(vec2(s, lado), 4096.0) * 0.65 + vnoise(vec2(s * 2.7, lado + 3.0), 4096.0) * 0.35;
  float ang = atan(p.z, p.x);
  float helice = 0.5 + 0.5 * sin(ang * 2.0 + ay * 0.7 - uTime * 3.0);
  float base = smoothstep(1.4, 3.4, ay);
  float fim = 1.0 - smoothstep(JLEN * 0.4, JLEN, ay);
  float k = base * fim / (0.45 + ay * 0.07) * sinT;
  vec3 c = vec3(0.95, 0.9, 1.0) * nucleo * (0.5 + 1.0 * nos) * 1.5
         + vec3(0.45, 0.22, 1.0) * bainha * (0.4 + 0.6 * helice) * (0.4 + nos) * 0.5;
  return c * k;
}

// céu: estrelas e uma bruma roxa bem fraca (curvados pela gravidade junto com o resto)
vec3 ceu(vec3 d) {
  vec2 s = vec2(atan(d.z, d.x), asin(clamp(d.y, -1.0, 1.0))) * 70.0;
  vec2 i = floor(s), f = fract(s) - 0.5;
  float h = hash(i);
  vec2 o = (vec2(hash(i + 7.1), hash(i + 3.7)) - 0.5) * 0.7;
  float b = smoothstep(0.07, 0.0, length(f - o)) * step(0.86, h);
  float tw = 0.75 + 0.25 * sin(uTime * (1.0 + 3.0 * hash(i + 9.9)) + h * 40.0);
  vec3 c = vec3(0.9, 0.9, 1.0) * b * (0.15 + 0.6 * hash(i + 1.3)) * tw;
  float an = atan(d.z, d.x) / (2.0 * PI);
  float bruma = fbm3(vec2(an * 6.0, d.y * 2.2 + 3.0), 6.0);
  c += vec3(0.16, 0.03, 0.28) * pow(bruma, 3.0) * (0.5 + 0.5 * (1.0 - abs(d.y)));
  return c;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / (0.5 * uRes.y);
  vec3 rd = normalize(uRot * vec3(uv, uFoco));
  vec3 ro = uCam;
  float b0 = length(cross(ro, rd)); // distância do raio reto ao centro (para a singularidade)

  // dois acumuladores: um com tudo, e outro sem a parte de dentro do disco (r < 3).
  // Se o raio cai no buraco, vale o segundo: a sombra fica um círculo limpo (como no buraco do
  // topo) — o disco só passa na frente dela onde está mesmo entre a câmera e o buraco — e o gás
  // de trás aparece em volta dela, curvado pela gravidade.
  vec3 col = vec3(0.0);
  float trans = 1.0;
  vec3 colF = vec3(0.0);
  float transF = 1.0;
  float hit = 0.0;
  float haze = 0.0;
  float halo = 0.0;
  float rmin = 1e9;
  float transMin = 1.0;  // quanto do anel de fótons o disco da frente deixa passar
  vec3 p = ro, v = rd;

  // entra na esfera de raio RMAX (fora dela a luz anda em linha reta)
  float bq = dot(ro, rd);
  float c0 = dot(ro, ro) - RMAX * RMAX;
  float disc = bq * bq - c0;
  bool dentro = c0 < 0.0;
  bool passa = dentro || (disc > 0.0 && bq < 0.0);
  if (!dentro && passa) p = ro + rd * (-bq - sqrt(disc));

  vec3 hv = cross(p, v);
  float h2 = dot(hv, hv);

  if (passa) {
    for (int i = 0; i < 300; i++) {
      float r2 = dot(p, p);
      float r = sqrt(r2);
      if (r < 1.0) { hit = 1.0; break; }
      if (r > RMAX && dot(p, v) > 0.0) break;
      if (r < rmin) { rmin = r; transMin = trans; }
      float dt = clamp(0.04 * r, 0.015, 0.7);
      vec3 a = -1.5 * h2 * p / (r2 * r2 * r);
      v += a * dt;
      vec3 pn = p + v * dt;

      // disco: as duas faces brilham (a luz de trás é curvada por cima e por baixo da sombra)
      if (p.y * pn.y <= 0.0 && p.y != pn.y) {
        float f = p.y / (p.y - pn.y);
        vec3 pc = mix(p, pn, f);
        vec4 d = disco(pc, v);
        col += trans * d.rgb;
        trans *= 1.0 - d.a;
        float fora = smoothstep(2.6, 3.4, length(pc.xz));
        colF += transF * d.rgb * fora;
        transF *= 1.0 - d.a * fora;
      }

      // jatos
      vec3 ej = jato(p, length(normalize(v).xz)) * dt * 0.9 * uJ;
      col += trans * ej;
      colF += transF * ej;

      // esfera de fótons: uma casca fina de luz; ao realçar, mostra a luz dando voltas nela
      float casca = exp(-pow((r - RFOT) / 0.03, 2.0));
      if (casca > 0.001) {
        vec3 q = p / r;
        float lon = atan(q.z, q.x);
        float tracos = smoothstep(0.55, 1.0, sin(lon * 9.0 + q.y * 6.0 - uTime * 5.0));
        float realce = max(uF - 1.0, 0.0);
        vec3 ec = vec3(0.75, 0.6, 1.0) * casca * dt * (0.08 * uF + realce * (0.5 + 2.5 * tracos));
        col += trans * ec;
        colF += transF * ec;
      }

      // névoa luminosa em volta do disco e um halo violeta em volta do buraco
      float rr = length(p.xz);
      haze += dt * exp(-abs(p.y) * 1.3) * smoothstep(ROUT * 1.25, 3.0, rr) * smoothstep(1.5, 2.6, rr);
      halo += dt * exp(-r * 0.42) * (0.35 + 0.65 * exp(-abs(p.y) * 0.7));

      if (trans < 0.02 && transF < 0.02) break;
      p = pn;
    }
  }

  float b = sqrt(h2);
  if (hit > 0.5) {
    col = colF;
    trans = transF;
    // ---- 2. horizonte de eventos: negro, com um leve tom roxo; realçado, mostra uma grade
    vec3 q = normalize(p);
    float lat = asin(clamp(q.y, -1.0, 1.0));
    float lon = atan(q.z, q.x);
    float gl = abs(fract(lat * 9.0 / PI) - 0.5);
    float gm = abs(fract(lon * 12.0 / (2.0 * PI)) - 0.5);
    float linha = smoothstep(0.43, 0.5, max(gl, gm));
    float realceH = max(uH - 1.0, 0.0);
    col += trans * (vec3(0.06, 0.0, 0.12) * min(uH, 1.0) + vec3(0.55, 0.3, 1.0) * linha * 0.5 * realceH);
    // ---- 1. singularidade: escondida dentro do horizonte; realçada, aparece em "raio-x"
    float realceS = max(uS - 1.0, 0.0);
    float pulso = 0.8 + 0.2 * sin(uTime * 3.0);
    float sing = exp(-pow(b0 / 0.09, 2.0)) * 1.6 + exp(-b0 * 4.0) * 0.4;
    // um brilho em cruz, como uma estrela vista de longe (medido na tela, em volta do centro)
    vec3 cd = normalize(-ro);
    vec3 o = rd - cd * dot(rd, cd);
    float L = length(ro);
    float sx = dot(o, uRot[0]) * L, sy = dot(o, uRot[1]) * L;
    float raios = exp(-abs(sx) / 0.02) * exp(-abs(sy) / 0.55) + exp(-abs(sy) / 0.02) * exp(-abs(sx) / 0.55);
    col += vec3(0.95, 0.85, 1.0) * (sing + raios * 0.7) * pulso * realceS;
    col += vec3(0.25, 0.05, 0.5) * exp(-b0 * 1.2) * 0.35 * realceS; // o horizonte vira um vidro escuro
  } else {
    col += trans * ceu(normalize(v));
    // ---- 3. anel de fótons: linha fina e clara colada na sombra (some atrás do disco da frente)
    float largura = max(0.03, uPix * 0.85);
    float gap = exp(-pow((b - BCRIT - 0.14) / max(0.07, uPix * 1.5), 2.0)) * transMin;
    col = mix(col, col * vec3(0.55, 0.25, 1.0), 0.8 * gap);
    float anel = exp(-pow((b - BCRIT - 0.03) / largura, 2.0)) * transMin;
    col += anel * vec3(0.95, 0.88, 1.0) * uF;
  }
  col += vec3(0.5, 0.08, 1.0) * haze * 0.17 * uD;
  col += vec3(0.42, 0.0, 0.85) * halo * 0.05 * min(uD, 1.0);
  // brilho geral (o mesmo do buraco do topo): medido no ponto em que o raio reto passa mais
  // perto do centro, mais comprido no plano do disco — tinge a sombra e o fundo de roxo
  vec3 cp = ro + rd * max(-dot(ro, rd), 0.0);
  float rp = length(cp.xz);
  float gA = exp(-length(vec2(rp / 13.2, cp.y / 6.3))) * 1.3;
  float gB = exp(-length(vec2(rp / 5.2, cp.y / 2.4)));
  float brilho = 0.3 + 0.7 * min(uD, 1.0);
  col += (vec3(0.42, 0.0, 0.85) * gA * 0.34 + vec3(0.55, 0.15, 0.9) * gB * 0.5) * brilho;

  col = min(col, vec3(1.0));
  float vig = smoothstep(1.9, 0.5, length(uv));
  col *= mix(0.6, 1.0, vig);
  gl_FragColor = vec4(col, 1.0);
}
`;
  var VS = 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }';

  // ------------------------------------------------------------------ WebGL
  var canvas = document.getElementById('buraco');
  var gl = null;
  try { gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' }); } catch (e) { /* sem WebGL */ }
  if (!gl) { document.body.classList.add('sem-webgl'); return; }

  function compilar(tipo, src) {
    var s = gl.createShader(tipo);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  var prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, compilar(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compilar(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (err) {
    console.warn('buraco negro:', err);
    document.body.classList.add('sem-webgl');
    return;
  }
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var aLoc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(aLoc);
  gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);
  var U = {};
  ['uRes', 'uTime', 'uCam', 'uRot', 'uFoco', 'uPix', 'uS', 'uH', 'uF', 'uD', 'uJ'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });

  var reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pequeno = Math.min(innerWidth, innerHeight) < 700;
  // resolução: o shader é pesado, então desenha em menos pixels e o navegador amplia
  // (e diminui sozinho se o aparelho não der conta)
  var escala = Math.min(window.devicePixelRatio || 1, 1.5) * (pequeno ? 0.55 : 0.75);
  var ESCALA_MIN = 0.3;

  // ------------------------------------------------------------------ câmera (gira em volta do centro)
  var FOV = 40 * Math.PI / 180;
  // roll: a câmera fica um pouco inclinada, como o disco do buraco do topo
  var cam = { az: 0.6, el: 0.5, dist: 70, roll: -0.32 };      // começa longe e chega perto (abertura)
  var alvo = { az: 0.6, el: 0.22, dist: 26, roll: -0.32 };    // para onde a câmera está indo
  var vel = { az: 0, el: 0 };                  // inércia do arrasto
  var EL_MIN = -1.45, EL_MAX = 1.45, DIST_MIN = 5.5, DIST_MAX = 70;
  var girarSozinho = !reduzir;
  var ultimoToque = -1e9; // quando a pessoa mexeu pela última vez (o giro sozinho espera um pouco)

  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function distanciaInicial() { return innerWidth / innerHeight < 0.8 ? 40 : 26; } // em pé: mais longe
  alvo.dist = distanciaInicial();

  // ------------------------------------------------------------------ partes (realce)
  var PARTES = ['singularidade', 'horizonte', 'fotons', 'disco', 'jatos'];
  var forca = { singularidade: 1, horizonte: 1, fotons: 1, disco: 1, jatos: 1 };
  var realcada = null;   // parte realçada agora (mouse em cima ou clicada)
  var fixa = null;       // parte clicada (fica realçada)
  function alvoForca(nome) {
    if (!realcada) return 1;
    if (nome === realcada) return nome === 'singularidade' || nome === 'horizonte' ? 2.2 : 1.9;
    // a singularidade fica dentro do horizonte: realçar uma deixa a outra visível
    if (realcada === 'singularidade' && nome === 'horizonte') return 0.6;
    return 0.22;
  }

  // ------------------------------------------------------------------ desenho
  function redimensionar() {
    var w = Math.max(1, Math.round(canvas.clientWidth * escala));
    var h = Math.max(1, Math.round(canvas.clientHeight * escala));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function base() {
    var ce = Math.cos(cam.el);
    var pos = [cam.dist * ce * Math.sin(cam.az), cam.dist * Math.sin(cam.el), cam.dist * ce * Math.cos(cam.az)];
    var len = Math.hypot(pos[0], pos[1], pos[2]);
    var fw = [-pos[0] / len, -pos[1] / len, -pos[2] / len];
    // direita = frente × cima(0,1,0); cima = direita × frente
    var rt = [-fw[2], 0, fw[0]];
    var rl = Math.hypot(rt[0], rt[2]) || 1;
    rt = [rt[0] / rl, 0, rt[2] / rl];
    var up = [rt[1] * fw[2] - rt[2] * fw[1], rt[2] * fw[0] - rt[0] * fw[2], rt[0] * fw[1] - rt[1] * fw[0]];
    var cr = Math.cos(cam.roll), sr = Math.sin(cam.roll);
    var r2 = [rt[0] * cr + up[0] * sr, rt[1] * cr + up[1] * sr, rt[2] * cr + up[2] * sr];
    var u2 = [up[0] * cr - rt[0] * sr, up[1] * cr - rt[1] * sr, up[2] * cr - rt[2] * sr];
    return { pos: pos, rot: [r2[0], r2[1], r2[2], u2[0], u2[1], u2[2], fw[0], fw[1], fw[2]] };
  }

  function desenhar(t) {
    redimensionar();
    var b = base();
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform1f(U.uTime, t);
    gl.uniform3f(U.uCam, b.pos[0], b.pos[1], b.pos[2]);
    gl.uniformMatrix3fv(U.uRot, false, b.rot);
    gl.uniform1f(U.uFoco, 1 / Math.tan(FOV / 2));
    gl.uniform1f(U.uPix, (2 * cam.dist * Math.tan(FOV / 2)) / canvas.height);
    gl.uniform1f(U.uS, forca.singularidade);
    gl.uniform1f(U.uH, forca.horizonte);
    gl.uniform1f(U.uF, forca.fotons);
    gl.uniform1f(U.uD, forca.disco);
    gl.uniform1f(U.uJ, forca.jatos);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  // ------------------------------------------------------------------ animação
  var t0 = performance.now();
  var antes = t0;
  var lentos = 0;
  var quadros = 0;
  var tempo = 0; // segundos da animação (para quando a aba some)

  var congelado = false; // (só para testes: para de desenhar e deixa o último quadro)
  function quadro(agora) {
    requestAnimationFrame(quadro);
    if (document.hidden || congelado) { antes = agora; return; }
    var dt = Math.min(0.05, (agora - antes) / 1000);
    // resolução automática: muitos quadros lentos seguidos -> menos pixels
    if (quadros++ > 30 && agora - antes < 500) {
      if (agora - antes > 40) lentos++; else lentos = Math.max(0, lentos - 1);
      if (lentos > 20 && escala > ESCALA_MIN) { escala = Math.max(ESCALA_MIN, escala * 0.82); lentos = 0; }
    }
    antes = agora;
    tempo += dt * (reduzir ? 0.3 : 1);

    // câmera: inércia do arrasto, giro sozinho e suavização até o alvo
    if (!arrastando) {
      alvo.az += vel.az;
      alvo.el = clamp(alvo.el + vel.el, EL_MIN, EL_MAX);
      vel.az *= Math.pow(0.04, dt);
      vel.el *= Math.pow(0.04, dt);
      if (girarSozinho && agora - ultimoToque > 2500) alvo.az += dt * 0.06;
    }
    var k = 1 - Math.pow(0.0015, dt); // ~ quanto anda até o alvo neste quadro
    cam.az += (alvo.az - cam.az) * k;
    cam.el += (alvo.el - cam.el) * k;
    cam.dist += (alvo.dist - cam.dist) * (1 - Math.pow(0.02, dt));
    cam.roll += (alvo.roll - cam.roll) * k;

    // realce das partes: muda devagar
    PARTES.forEach(function (n) { forca[n] += (alvoForca(n) - forca[n]) * (1 - Math.pow(0.002, dt)); });

    desenhar(tempo);
    if (!pronto) { pronto = true; document.body.classList.add('pronto'); }
  }
  var pronto = false;
  requestAnimationFrame(quadro);

  // ------------------------------------------------------------------ arrastar, rolar, pinça
  var arrastando = false;
  var ponteiros = new Map();
  var distPinca = 0;
  canvas.addEventListener('pointerdown', function (e) {
    canvas.setPointerCapture(e.pointerId);
    ponteiros.set(e.pointerId, { x: e.clientX, y: e.clientY });
    arrastando = true;
    vel.az = vel.el = 0;
    ultimoToque = performance.now();
    if (ponteiros.size === 2) {
      var p = Array.from(ponteiros.values());
      distPinca = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
    }
  });
  canvas.addEventListener('pointermove', function (e) {
    if (!ponteiros.has(e.pointerId)) return;
    var antigo = ponteiros.get(e.pointerId);
    var novo = { x: e.clientX, y: e.clientY };
    ponteiros.set(e.pointerId, novo);
    ultimoToque = performance.now();
    if (ponteiros.size === 2) {
      var p = Array.from(ponteiros.values());
      var d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      if (distPinca > 0) alvo.dist = clamp(alvo.dist * distPinca / d, DIST_MIN, DIST_MAX);
      distPinca = d;
      return;
    }
    var s = 3.2 / Math.min(innerWidth, innerHeight * 1.6); // radianos por pixel
    var daz = -(novo.x - antigo.x) * s;
    var del = (novo.y - antigo.y) * s;
    alvo.az += daz;
    alvo.el = clamp(alvo.el + del, EL_MIN, EL_MAX);
    vel.az = daz * 0.9;
    vel.el = del * 0.9;
  });
  function soltar(e) {
    ponteiros.delete(e.pointerId);
    if (ponteiros.size < 2) distPinca = 0;
    if (ponteiros.size === 0) arrastando = false;
  }
  canvas.addEventListener('pointerup', soltar);
  canvas.addEventListener('pointercancel', soltar);
  canvas.addEventListener('wheel', function (e) {
    e.preventDefault();
    ultimoToque = performance.now();
    alvo.dist = clamp(alvo.dist * Math.exp(e.deltaY * 0.0012), DIST_MIN, DIST_MAX);
  }, { passive: false });
  canvas.addEventListener('dblclick', function () { irPara('inclinado'); });

  // ------------------------------------------------------------------ pontos de vista
  var VISTAS = {
    inclinado: { el: 0.22, dist: 1, roll: -0.32 },
    cima: { el: 1.4, dist: 1.4, roll: 0 },
    lado: { el: 0.03, dist: 1.1, roll: -0.2 },
    baixo: { el: -0.38, dist: 1.15, roll: 0.3 },
  };
  function irPara(nome) {
    var v = VISTAS[nome];
    if (!v) return;
    alvo.el = v.el;
    alvo.dist = distanciaInicial() * v.dist;
    alvo.roll = v.roll;
    vel.az = vel.el = 0;
    ultimoToque = performance.now();
    document.querySelectorAll('[data-vista]').forEach(function (b) {
      var on = b.dataset.vista === nome;
      b.classList.toggle('ativo', on);
      b.setAttribute('aria-pressed', String(on));
    });
  }
  document.querySelectorAll('[data-vista]').forEach(function (b) {
    b.addEventListener('click', function () { irPara(b.dataset.vista); });
  });
  var botaoGirar = document.getElementById('girar-sozinho');
  if (botaoGirar) {
    var marcarGirar = function () {
      botaoGirar.setAttribute('aria-pressed', String(girarSozinho));
      botaoGirar.classList.toggle('ativo', girarSozinho);
    };
    marcarGirar();
    botaoGirar.addEventListener('click', function () { girarSozinho = !girarSozinho; marcarGirar(); });
  }

  // ------------------------------------------------------------------ partes: passar o mouse realça, clicar fixa
  var botoesParte = Array.prototype.slice.call(document.querySelectorAll('[data-parte]'));
  function marcarPartes() {
    botoesParte.forEach(function (b) {
      b.classList.toggle('ativo', b.dataset.parte === realcada);
      b.setAttribute('aria-pressed', String(b.dataset.parte === fixa));
    });
  }
  botoesParte.forEach(function (b) {
    b.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { realcada = b.dataset.parte; marcarPartes(); } });
    b.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { realcada = fixa; marcarPartes(); } });
    b.addEventListener('focus', function () { realcada = b.dataset.parte; marcarPartes(); });
    b.addEventListener('blur', function () { realcada = fixa; marcarPartes(); });
    b.addEventListener('click', function () {
      fixa = fixa === b.dataset.parte ? null : b.dataset.parte;
      realcada = fixa;
      marcarPartes();
    });
  });
  addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { fixa = realcada = null; marcarPartes(); }
    var n = Number(e.key);
    if (n >= 1 && n <= 5 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      var nome = PARTES[n - 1];
      fixa = fixa === nome ? null : nome;
      realcada = fixa;
      marcarPartes();
    }
  });

  // para testes
  window.buracoNegro = {
    cam: cam, alvo: alvo, forca: forca,
    get escala() { return escala; },
    realcar: function (nome) { fixa = realcada = nome; marcarPartes(); },
    irPara: irPara,
    congelar: function (sim) { congelado = sim !== false; },
  };
})();
