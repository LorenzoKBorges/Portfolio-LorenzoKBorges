/* Pulsar em WebGL (shader do Lorenzo, adaptado para o rodapé do portfólio).
   Diferente do original, o fundo é transparente: o céu é o do próprio site.
   Pulsar.create(canvas) devolve um controle com:
     start()       anima (pausa sozinho fora da tela ou com a aba escondida)
     renderOnce()  desenha um quadro só e para (modo leve) */
(function () {
  'use strict';

  var FS = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uCenter;   // centro da estrela, em pixels do canvas

// Cores: azul puxado para o roxo (anil). Para ajustar o tom, mexa só aqui.
const vec3 COR_FEIXE       = vec3(0.40, 0.24, 1.00);  // feixe (parte externa)
const vec3 COR_FEIXE_CLARO = vec3(0.86, 0.82, 1.00);  // miolo do feixe
const vec3 COR_HALO        = vec3(0.44, 0.28, 1.00);  // brilho em volta da estrela
const vec3 COR_SUP_ESCURA  = vec3(0.08, 0.04, 0.36);  // superfície: manchas escuras
const vec3 COR_SUP_CLARA   = vec3(0.34, 0.22, 0.95);  // superfície: manchas claras
const vec3 COR_SUP_BRILHO  = vec3(0.55, 0.45, 1.00);  // superfície: reflexos
const vec3 COR_BORDA       = vec3(0.60, 0.52, 1.00);  // borda iluminada da esfera
const vec3 COR_POLO        = vec3(0.86, 0.82, 1.00);  // calotas quentes nos polos

const float PI = 3.14159265;
const float R = 0.125;                    // raio da estrela (fração do menor lado da tela)
const float TILT = 0.30;                  // inclinação do eixo (~17° para a direita)
const float SWING = 0.1396;               // oscilação dos feixes: 8° para cada lado
const float SWING_PERIOD = 0.5;           // dois vai-e-vens completos por segundo
const float SPIN = 2.6;                   // rotação da estrela (rad/s)

float hash2(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float hash3(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.x + p.y) * p.z);
}
float noise2(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash2(i), hash2(i + vec2(1, 0)), f.x),
             mix(hash2(i + vec2(0, 1)), hash2(i + vec2(1, 1)), f.x), f.y);
}
float noise3(vec3 p) {
  vec3 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash3(i), hash3(i + vec3(1, 0, 0)), f.x),
                 mix(hash3(i + vec3(0, 1, 0)), hash3(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(hash3(i + vec3(0, 0, 1)), hash3(i + vec3(1, 0, 1)), f.x),
                 mix(hash3(i + vec3(0, 1, 1)), hash3(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
float fbm2(vec2 p) {
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 4; i++) { s += a * noise2(p); p = p * 2.03 + 11.7; a *= 0.5; }
  return s;
}
float fbm3(vec3 p) {
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 5; i++) { s += a * noise3(p); p = p * 2.03 + 7.3; a *= 0.5; }
  return s;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - uCenter) / min(uRes.x, uRes.y);
  float d = length(uv);

  // fundo transparente: o céu (estrelas e nebulosa) é o do próprio site
  vec3 col = vec3(0.0);
  float solid = 0.0;   // 1 dentro da estrela: ela é opaca

  // ---------- feixes: oscilam 15° para cada lado em torno do eixo ----------
  float th = TILT + SWING * sin(uTime * 2.0 * PI / SWING_PERIOD);
  float cs = cos(th), sn = sin(th);
  float bx = uv.x * cs - uv.y * sn;        // distância lateral ao feixe
  float by = uv.x * sn + uv.y * cs;        // posição ao longo do feixe
  float along = abs(by);
  float ax = abs(bx);

  float flow = along * 5.0 - uTime * 4.5;                      // matéria correndo para fora
  float streak = fbm2(vec2(bx * 42.0 / (1.0 + along * 2.5), flow));
  float puff   = fbm2(vec2(bx * 9.0, along * 3.0 - uTime * 1.6) + 31.0);

  float core  = exp(-pow(ax / (0.0030 + 0.0050 * along), 2.0));
  float inner = exp(-ax / (0.010 + 0.022 * along));
  float outer = exp(-ax / (0.030 + 0.085 * along));
  float beam = core * 1.5
             + inner * (0.35 + 0.75 * streak)
             + outer * (0.05 + 0.40 * smoothstep(0.3, 0.8, puff)) * smoothstep(0.1, 0.7, along);
  beam *= smoothstep(R * 0.80, R * 1.05, along);
  vec3 beamCol = mix(COR_FEIXE, COR_FEIXE_CLARO, clamp(core + inner * 0.35, 0.0, 1.0));
  col += beamCol * beam;

  // ---------- halo em volta da estrela ----------
  float out_ = max(d - R, 0.0);
  col += COR_HALO * (exp(-out_ / 0.022) * 0.85 + exp(-out_ / 0.11) * 0.22);

  // ---------- estrela de nêutrons: esfera com superfície girando ----------
  if (d < R) {
    float z = sqrt(R * R - d * d);
    vec3 n = vec3(uv, z) / R;

    // gira a textura em volta do eixo inclinado
    float c0 = cos(TILT), s0 = sin(TILT);
    vec3 q = vec3(n.x * c0 - n.y * s0, n.x * s0 + n.y * c0, n.z);
    float a = uTime * SPIN;
    float ca = cos(a), sa = sin(a);
    q = vec3(q.x * ca + q.z * sa, q.y, -q.x * sa + q.z * ca);

    float t1 = fbm3(q * 2.6);
    float t2 = fbm3(q * 6.5 + 4.0);
    float tex = smoothstep(0.25, 0.75, t1 * 0.65 + t2 * 0.35);

    vec3 surf = mix(COR_SUP_ESCURA, COR_SUP_CLARA, tex);
    surf += COR_SUP_BRILHO * pow(tex, 3.0) * 0.35;
    surf *= 0.45 + 0.55 * n.z;

    float rim = pow(1.0 - n.z, 2.2);
    surf += COR_BORDA * rim * 1.25;

    // calotas quentes nos polos magnéticos, de onde saem os feixes
    vec3 pole = vec3(sn, cs, 0.0);
    float cap = pow(abs(dot(n, pole)), 14.0);
    surf += COR_POLO * cap * 1.1;

    float aa = smoothstep(R, R - 0.004, d);
    col = mix(col, surf, aa);
    solid = aa;
  }

  // ajuste de tons
  col = 1.0 - exp(-col * 1.35);

  // saída com transparência (alfa pré-multiplicado): a luz se soma ao fundo da página
  float alpha = max(max(col.r, col.g), max(col.b, solid));
  // some suave perto das bordas do canvas, para os feixes não terminarem num corte
  vec2 e = gl_FragCoord.xy / uRes;
  float fade = smoothstep(0.0, 0.14, e.y) * smoothstep(1.0, 0.78, e.y)
             * smoothstep(0.0, 0.12, e.x) * smoothstep(1.0, 0.88, e.x);
  gl_FragColor = vec4(col, alpha) * fade;
}
`;
  var VS = 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }';
  var QUADRO_PARADO = 4.0; // instante usado no modo leve: feixes no meio da oscilação
  var CENTRO_Y = 0.68;     // altura do centro da estrela, do topo (0) à base (1) do canvas

  function create(canvas) {
    var gl = null;
    try { gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false }); } catch (e) { /* sem WebGL */ }
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
      console.warn('pulsar:', err);
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

    // resolução adaptativa: começa menor em telas pequenas e reduz se o quadro estiver lento
    var scale = Math.min(window.devicePixelRatio || 1, Math.min(innerWidth, innerHeight) < 700 ? 1 : 1.5);
    var wanted = false;
    var visible = true;
    var raf = 0;
    var last = 0, slow = 0, frames = 0;
    var t0 = performance.now();
    var desenhado = false; // renderOnce() já foi chamado (modo leve)

    function resize() {
      var w = Math.max(1, Math.floor(canvas.clientWidth * scale));
      var h = Math.max(1, Math.floor(canvas.clientHeight * scale));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    function draw(time) {
      resize();
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, time);
      // no celular o canvas fica entre o nome e a linha final, então a estrela vai no meio
      var cy = canvas.clientWidth < 600 ? 0.5 : CENTRO_Y;
      gl.uniform2f(uCenter, canvas.width * 0.5, canvas.height * (1 - cy));  // y do WebGL cresce para cima
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
      draw((now - t0) * 0.001);
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
    // redesenha o quadro parado quando o tamanho do canvas muda
    // (janela redimensionada, ou o rodapé mudando de altura quando as fontes carregam)
    var redesenhar = function () {
      if (!wanted && desenhado) requestAnimationFrame(function () { if (!wanted) draw(QUADRO_PARADO); });
    };
    if ('ResizeObserver' in window) new ResizeObserver(redesenhar).observe(canvas);
    else addEventListener('resize', redesenhar);

    return {
      ok: true,
      start: function () { wanted = true; kick(); },
      stop: function () { wanted = false; },
      renderOnce: function () {
        wanted = false;
        desenhado = true;
        scale = Math.min(scale, 1);
        draw(QUADRO_PARADO);
      }
    };
  }

  window.Pulsar = { create: create };
})();
