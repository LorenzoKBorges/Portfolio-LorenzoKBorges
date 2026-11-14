/* Buraco negro em WebGL (shader do Lorenzo, adaptado para o portfólio).
   BlackHole.create(canvas) devolve um controle com:
     setView(fn)   fn() -> { cx, cy, ring }: centro do buraco e raio do anel de luz, em px do canvas
     start()       anima (pausa sozinho fora da tela ou com a aba escondida)
     renderOnce()  desenha um quadro só e para (modo leve)
     dive(ms)      "mergulho": aproxima até a sombra cobrir a tela; devolve uma Promise
     resetZoom()   volta ao tamanho normal */
(function () {
  'use strict';

  var FS = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uCenter;  // centro do buraco, em pixels do canvas
uniform float uUnit;   // pixels por unidade de tela (controla o tamanho do buraco)

const float RIN  = 1.52;  // borda interna do disco (raio de Schwarzschild = 1)
const float ROUT = 10.8; // borda externa
const float PI = 3.14159265;

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

// textura do gás em coordenadas polares: x = filamentos turbulentos, y = forma da borda
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

// emissão do disco no ponto p; v = direção do raio
vec4 disk(vec3 p, vec3 v) {
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

  // borda externa irregular: o raio varia com o ângulo e o gás se desfaz em línguas
  // o disco é mais curto atrás do buraco (arco de cima fino) e mais longo na frente;
  // nas laterais o raio não muda
  float sz = p.z / r;
  float shape = 1.0 + (sz > 0.0 ? -0.47 : 0.11) * sz * sz;
  float rEdge = ROUT * (0.76 + 0.24 * e) * shape;
  float edge  = 1.0 - smoothstep(rEdge * 0.75, rEdge + 0.3, r);
  float fr    = smoothstep(rEdge * 0.54, rEdge * 0.93, r);
  float wisp  = mix(1.0, smoothstep(0.25, 0.75, n) * 1.7, fr);

  float inner = smoothstep(RIN, RIN + 0.15, r);
  float fall  = pow(RIN / r, 1.15);
  float I = inner * edge * wisp * (0.9 + 2.6 * pow(n, 1.5)) * (0.6 + 2.2 * fall);

  // efeito Doppler: o lado que vem em nossa direção brilha mais
  vec3 tang = normalize(vec3(p.z, 0.0, -p.x));
  float dop = 1.0 + 0.25 * dot(tang, -normalize(v));
  I *= dop * dop;

  float x = 1.0 - exp(-I * 0.8);
  float alpha = smoothstep(0.0, 0.45, x) * 0.97;
  return vec4(fire(x), alpha);
}

vec3 stars(vec3 d) {
  vec2 s = vec2(atan(d.z, d.x), asin(clamp(d.y, -1.0, 1.0))) * 70.0;
  vec2 i = floor(s), f = fract(s) - 0.5;
  float h = hash(i);
  vec2 o = (vec2(hash(i + 7.1), hash(i + 3.7)) - 0.5) * 0.7;
  float b = smoothstep(0.07, 0.0, length(f - o)) * step(0.86, h);
  float tw = 0.75 + 0.25 * sin(uTime * (1.0 + 3.0 * hash(i + 9.9)) + h * 40.0);
  return vec3(0.9, 0.9, 1.0) * b * (0.15 + 0.6 * hash(i + 1.3)) * tw;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - uCenter) / uUnit;

  // inclinação do disco na tela
  float roll = -0.40;
  float cr = cos(roll), sr = sin(roll);
  vec2 ruv = vec2(cr * uv.x - sr * uv.y, sr * uv.x + cr * uv.y);

  // câmera um pouco acima do plano do disco
  float el = 0.20 + 0.010 * sin(uTime * 0.13);
  float dist = 22.0;
  vec3 ro = dist * vec3(0.0, sin(el), -cos(el));
  vec3 fw = normalize(-ro);
  vec3 rt = normalize(cross(vec3(0.0, 1.0, 0.0), fw));
  vec3 up = cross(fw, rt);
  vec3 rd = normalize(fw * 1.32 + rt * ruv.x + up * ruv.y);

  // marcha do raio com curvatura gravitacional (geodésica de Schwarzschild)
  vec3 p = ro, v = rd;
  vec3 hv = cross(p, v);
  float h2 = dot(hv, hv);
  vec3 col = vec3(0.0);
  float trans = 1.0;
  float haze = 0.0;
  float hit = 0.0;
  float under = 0.0;

  for (int i = 0; i < 260; i++) {
    float r2 = dot(p, p);
    float r = sqrt(r2);
    if (r < 1.0) { hit = 1.0; break; }
    if (r > 32.0 && dot(p, v) > 0.0) break;
    float dt = clamp(0.04 * r, 0.015, 0.7);
    vec3 a = -1.5 * h2 * p / (r2 * r2 * r);
    v += a * dt;
    vec3 pn = p + v * dt;

    // só a face de cima do disco emite (sem a imagem secundária por baixo da sombra)
    if (p.y > 0.0 && pn.y <= 0.0) {
      float f = p.y / (p.y - pn.y);
      vec4 d = disk(mix(p, pn, f), v);
      col += trans * d.rgb;
      trans *= 1.0 - d.a;
    }

    // névoa luminosa em volta do disco
    float rr = length(p.xz);
    // (só enquanto o raio não desceu abaixo do disco: evita um halo sob a sombra)
    if (p.y < 0.0) under = 1.0;
    haze += (1.0 - 0.85 * under) * dt * exp(-abs(p.y) * 1.3) * smoothstep(ROUT * 1.25, 3.0, rr) * smoothstep(1.5, 2.6, rr);

    if (trans < 0.02) break;
    p = pn;
  }

  // a sombra aparece como um círculo limpo: o gás à frente dela só a tinge de laranja
  // o disco da frente só encobre a parte de baixo da sombra
  if (hit > 0.5) { col *= smoothstep(-0.075, -0.14, ruv.y); haze = 0.0; col += vec3(0.06, 0.0, 0.12); }
  else {
    col += trans * stars(normalize(v));
    // anel de fótons: linha fina e clara colada na sombra
    float b = sqrt(h2);
    // (uma faixa laranja estreita separa o anel do gás claro atrás dele)
    float top = smoothstep(-0.15, -0.05, ruv.y);   // some atrás do disco na parte de baixo
    float gap = exp(-pow((b - 2.78) / 0.07, 2.0)) * top;
    col = mix(col, col * vec3(0.55, 0.25, 1.0), 0.8 * gap);
    float ring = exp(-pow((b - 2.66) / 0.022, 2.0)) * top;
    col += ring * vec3(0.95, 0.88, 1.0);
  }
  col += vec3(0.5, 0.08, 1.0) * haze * 0.17;

  // brilho geral (alongado na direção do disco) — tinge a sombra e o fundo de vermelho-alaranjado
  float g = exp(-length(ruv * vec2(1.25, 2.6)) * 1.0) * 1.3;
  float g2 = exp(-length(ruv * vec2(1.0, 2.2)) * 3.2);
  col += vec3(0.42, 0.0, 0.85) * g * 0.34 + vec3(0.55, 0.15, 0.9) * g2 * 0.5;

  col = min(col, vec3(1.0));
  float vig = smoothstep(1.45, 0.35, length(uv));
  col *= mix(0.55, 1.0, vig);

  gl_FragColor = vec4(col, 1.0);
}
`;
  var VS = 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }';
  var RING_UV = 0.1608; // raio do anel de fótons em unidades de tela do shader

  function create(canvas) {
    var gl = null;
    try { gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' }); } catch (e) { /* sem WebGL */ }
    if (!gl) return { ok: false };

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    }
    var prog;
    try {
      prog = gl.createProgram();
      gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
      gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    } catch (err) {
      console.warn('buraco negro:', err);
      return { ok: false };
    }
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var uRes = gl.getUniformLocation(prog, 'uRes');
    var uTime = gl.getUniformLocation(prog, 'uTime');
    var uCenter = gl.getUniformLocation(prog, 'uCenter');
    var uUnit = gl.getUniformLocation(prog, 'uUnit');

    var pequeno = Math.min(innerWidth, innerHeight) < 700;
    var scale = Math.min(window.devicePixelRatio || 1, pequeno ? 0.8 : 1.25); // resolução adaptativa
    var viewFn = function () { return { cx: canvas.clientWidth / 2, cy: canvas.clientHeight / 2, ring: canvas.clientHeight * 0.16 }; };
    var view = null;
    var zoom = 1;
    var wanted = false;    // start() foi chamado
    var visible = true;    // canvas na tela
    var raf = 0;
    var last = 0, slow = 0, frames = 0;
    var t0 = performance.now();
    var frozenTime = 0;

    function resize() {
      var w = Math.max(1, Math.floor(canvas.clientWidth * scale));
      var h = Math.max(1, Math.floor(canvas.clientHeight * scale));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; view = null; }
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    function draw(time) {
      resize();
      if (!view) view = viewFn();
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, time);
      gl.uniform2f(uCenter, view.cx * scale, canvas.height - view.cy * scale);
      gl.uniform1f(uUnit, (view.ring / RING_UV) * scale * zoom);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function frame(now) {
      raf = 0;
      if (!wanted || !visible || document.hidden) return;
      var dt = now - last; last = now;
      if (frames++ > 20 && dt < 500) {
        if (dt > 40) slow++; else slow = Math.max(0, slow - 1);
        if (slow > 25 && scale > 0.4) { scale *= 0.8; slow = 0; }
      }
      frozenTime = (now - t0) * 0.001;
      draw(frozenTime);
      raf = requestAnimationFrame(frame);
    }
    function kick() {
      if (wanted && visible && !document.hidden && !raf) { last = performance.now(); frames = 0; raf = requestAnimationFrame(frame); }
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[entries.length - 1].isIntersecting;
        kick();
      }).observe(canvas);
    }
    document.addEventListener('visibilitychange', kick);
    addEventListener('resize', function () {
      view = null;
      if (!wanted) requestAnimationFrame(function () { if (!wanted) draw(frozenTime || 4.0); });
    });

    return {
      ok: true,
      setView: function (fn) { viewFn = fn; view = null; },
      refresh: function () { view = null; if (!wanted) draw(frozenTime || 4.0); },
      start: function () { wanted = true; kick(); },
      stop: function () { wanted = false; },
      renderOnce: function () {
        wanted = false;
        // um pouco menos de resolução: é um quadro parado, e o aparelho pode ser fraco
        scale = Math.min(scale, 0.8);
        draw(frozenTime || 4.0);
      },
      resetZoom: function () { zoom = 1; },
      dive: function (ms) {
        return new Promise(function (resolve) {
          var inicio = performance.now();
          function passo(now) {
            var k = Math.min(1, (now - inicio) / ms);
            zoom = 1 + 17 * k * k * k;
            if (!wanted) draw(frozenTime || 4.0);
            if (k < 1) requestAnimationFrame(passo); else resolve();
          }
          requestAnimationFrame(passo);
        });
      }
    };
  }

  window.BlackHole = { create: create };
})();
