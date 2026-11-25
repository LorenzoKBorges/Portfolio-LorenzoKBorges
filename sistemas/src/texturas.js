import * as THREE from 'three';

// Texturas desenhadas na hora (nenhuma imagem é baixada).

// Gerador pseudoaleatório com semente: cada planeta sai sempre igual
export function aleatorio(semente) {
  let s = semente >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Ruído de valor 2D periódico em x (para a textura fechar sem emenda em volta da esfera)
function criarRuido(rnd, largura) {
  const tam = 256;
  const tab = new Float32Array(tam * tam);
  for (let i = 0; i < tab.length; i++) tab[i] = rnd();
  const v = (x, y) => tab[((y % tam) + tam) % tam * tam + ((x % largura) + largura) % largura];
  const suave = (t) => t * t * (3 - 2 * t);
  const ruido = (x, y) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const fx = suave(x - xi);
    const fy = suave(y - yi);
    const a = v(xi, yi);
    const b = v(xi + 1, yi);
    const c = v(xi, yi + 1);
    const d = v(xi + 1, yi + 1);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  };
  return (x, y, oitavas = 4) => {
    let s = 0;
    let amp = 0.5;
    let f = 1;
    for (let o = 0; o < oitavas; o++) {
      s += amp * ruido(x * f, y * f);
      amp *= 0.5;
      f *= 2;
    }
    return s / (1 - Math.pow(0.5, oitavas));
  };
}

const hexParaRgb = (hex) => {
  const c = new THREE.Color(hex);
  return [c.r * 255, c.g * 255, c.b * 255];
};
const misturar = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

// Paleta como gradiente: t de 0 a 1 percorre as cores
function amostrar(paleta, t) {
  const n = paleta.length - 1;
  const x = Math.min(Math.max(t, 0), 0.9999) * n;
  const i = Math.floor(x);
  return misturar(paleta[i], paleta[i + 1], x - i);
}

/**
 * Superfície de planeta.
 * tipo: 'gas' (faixas como Júpiter), 'rocha' (manchas e crateras), 'gelo' (liso com veios)
 */
export function texturaPlaneta({ tipo, cores, semente }) {
  const L = 512;
  const A = 256;
  const canvas = document.createElement('canvas');
  canvas.width = L;
  canvas.height = A;
  const g = canvas.getContext('2d');
  const img = g.createImageData(L, A);
  const rnd = aleatorio(semente);
  const PER = 16; // período do ruído em x (fecha a volta)
  const ruido = criarRuido(rnd, PER * 8);
  const paleta = cores.map(hexParaRgb);
  const faixas = 3 + rnd() * 5;
  const fase = rnd() * 10;

  for (let y = 0; y < A; y++) {
    const v = y / A;
    for (let x = 0; x < L; x++) {
      const u = x / L;
      let t;
      if (tipo === 'gas') {
        const turb = ruido(u * PER, v * 6, 4);
        t = 0.5 + 0.5 * Math.sin((v * faixas + turb * 0.9) * Math.PI * 2 + fase);
        t = t * 0.75 + ruido(u * PER * 2, v * 24, 3) * 0.25;
      } else if (tipo === 'gelo') {
        const n = ruido(u * PER, v * 8, 5);
        const veio = Math.abs(Math.sin((n * 6 + v * 3) * Math.PI));
        t = n * 0.7 + (1 - Math.pow(veio, 0.25)) * 0.5;
      } else {
        const n = ruido(u * PER, v * 8, 5);
        const det = ruido(u * PER * 4, v * 32, 3);
        t = n * 0.75 + det * 0.25;
        t = Math.pow(t, 1.3);
      }
      // polos um pouco mais claros
      const polo = Math.pow(Math.abs(v - 0.5) * 2, 6) * 0.35;
      const c = misturar(amostrar(paleta, t), paleta[paleta.length - 1], polo);
      const i = (y * L + x) * 4;
      img.data[i] = c[0];
      img.data[i + 1] = c[1];
      img.data[i + 2] = c[2];
      img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);

  // crateras nas rochosas
  if (tipo === 'rocha') {
    const n = 14 + Math.floor(rnd() * 12);
    for (let k = 0; k < n; k++) {
      const cx = rnd() * L;
      const cy = A * 0.15 + rnd() * A * 0.7;
      const r = 2 + Math.pow(rnd(), 2) * 12;
      for (const dx of [-L, 0, L]) {
        const grad = g.createRadialGradient(cx + dx, cy, r * 0.2, cx + dx, cy, r);
        grad.addColorStop(0, 'rgba(0,0,0,0.28)');
        grad.addColorStop(0.75, 'rgba(0,0,0,0.12)');
        grad.addColorStop(0.9, 'rgba(255,255,255,0.10)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = grad;
        g.beginPath();
        g.ellipse(cx + dx, cy, r * 1.3, r, 0, 0, Math.PI * 2);
        g.fill();
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

/** Anel: faixas radiais com transparência (u = de dentro para fora). */
export function texturaAnel(cores, semente) {
  const L = 512;
  const canvas = document.createElement('canvas');
  canvas.width = L;
  canvas.height = 4;
  const g = canvas.getContext('2d');
  const rnd = aleatorio(semente);
  const paleta = cores.map(hexParaRgb);
  for (let x = 0; x < L; x++) {
    const u = x / L;
    const faixa = 0.5 + 0.5 * Math.sin(u * 60 + rnd() * 0.6) * Math.sin(u * 17);
    const borda = Math.sin(u * Math.PI);
    const a = Math.max(0, (0.25 + 0.75 * faixa) * Math.pow(borda, 0.6) * (rnd() < 0.04 ? 0.2 : 1));
    const c = amostrar(paleta, u);
    g.fillStyle = `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a.toFixed(3)})`;
    g.fillRect(x, 0, 1, 4);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Brilho redondo (para o sol e os halos), branco: a cor vem do material. */
export function texturaBrilho() {
  const t = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = t;
  const g = canvas.getContext('2d');
  const grad = g.createRadialGradient(t / 2, t / 2, 0, t / 2, t / 2, t / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.18, 'rgba(255,255,255,0.55)');
  grad.addColorStop(0.45, 'rgba(255,255,255,0.14)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, t, t);
  return new THREE.CanvasTexture(canvas);
}

/** Raios finos saindo do centro (coroa do sol). */
export function texturaRaios(semente) {
  const t = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = t;
  const g = canvas.getContext('2d');
  const rnd = aleatorio(semente);
  g.translate(t / 2, t / 2);
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 70; i++) {
    const ang = rnd() * Math.PI * 2;
    const comp = t * (0.18 + rnd() * 0.32);
    const larg = 1 + rnd() * 3;
    const grad = g.createLinearGradient(0, 0, Math.cos(ang) * comp, Math.sin(ang) * comp);
    grad.addColorStop(0, `rgba(255,255,255,${(0.10 + rnd() * 0.16).toFixed(2)})`);
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.strokeStyle = grad;
    g.lineWidth = larg;
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(Math.cos(ang) * comp, Math.sin(ang) * comp);
    g.stroke();
  }
  return new THREE.CanvasTexture(canvas);
}
