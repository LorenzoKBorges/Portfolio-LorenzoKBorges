// Funções matemáticas pequenas usadas em toda a animação.

export const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
export const lerp = (a, b, t) => a + (b - a) * t;

/** Posição normalizada de x entre a e b, presa em [0, 1]. */
export const progresso = (a, b, x) => clamp((x - a) / (b - a));

export function smoothstep(a, b, x) {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

/** Sobe de 0 a 1 entre a e b, fica em 1 e desce para 0 entre c e d. */
export const janela = (x, a, b, c, d) => smoothstep(a, b, x) * (1 - smoothstep(c, d, x));

export const easeInQuad = (t) => t * t;
export const easeInCubic = (t) => t * t * t;
export const easeOutCubic = (t) => 1 - (1 - t) ** 3;
export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
export const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t));

/** Gerador pseudoaleatório com semente (mulberry32): o universo sai igual toda vez. */
export function criarRng(semente = 1) {
  let s = semente >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Número com distribuição normal (média 0, desvio 1). */
export function gauss(rand) {
  let u = 0;
  while (u === 0) u = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
}

/** Direção aleatória uniforme na esfera. */
export function naEsfera(rand, out) {
  const z = rand() * 2 - 1;
  const a = rand() * Math.PI * 2;
  const r = Math.sqrt(1 - z * z);
  out.x = r * Math.cos(a);
  out.y = z;
  out.z = r * Math.sin(a);
  return out;
}

/** Ruído suave 1D feito de senos, em [-1, 1]. */
export function ondas(t, semente = 0) {
  return (
    Math.sin(t * 1.93 + semente) * 0.5 +
    Math.sin(t * 3.71 + semente * 1.7) * 0.3 +
    Math.sin(t * 7.13 + semente * 2.9) * 0.2
  );
}

/** Tremor 3D (para câmera e objetos). */
export function tremor(t, amp, out, freq = 9) {
  return out.set(
    ondas(t * freq, 1.1) * amp,
    ondas(t * freq, 4.7) * amp,
    ondas(t * freq, 8.3) * amp * 0.6
  );
}

/** Batimento tipo coração: um pico forte e outro menor logo depois. fase em ciclos. */
export function batida(fase) {
  const f = fase - Math.floor(fase);
  const pico = (x) => (x < 0 ? Math.exp(x * 60) : Math.exp(-x * 9));
  return pico(f) + 0.55 * pico(f - 0.2) + pico(f - 1) * 1;
}
