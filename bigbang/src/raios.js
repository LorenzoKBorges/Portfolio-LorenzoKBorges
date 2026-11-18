import * as THREE from 'three';

/**
 * Pequenos raios elétricos em volta de um ponto (sobrecarga de energia).
 * Cada raio é uma linha quebrada que é redesenhada aleatoriamente a cada poucos milissegundos.
 */
export class Raios {
  constructor(pai, { quantidade = 8, segmentos = 14, cor = '#dcc8ff' } = {}) {
    this.linhas = [];
    this.segmentos = segmentos;
    for (let i = 0; i < quantidade; i++) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(segmentos * 3), 3));
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color(cor).multiplyScalar(1.6),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const linha = new THREE.Line(geo, mat);
      linha.frustumCulled = false;
      linha.userData.espera = Math.random() * 0.2;
      pai.add(linha);
      this.linhas.push(linha);
    }
    this._d = new THREE.Vector3();
    this._a = new THREE.Vector3();
    this._b = new THREE.Vector3();
  }

  /**
   * @param dt        passo de tempo
   * @param chance    probabilidade (0..1) de cada raio aparecer quando é sorteado
   * @param r0, r1    raio inicial e alcance
   * @param brilho    opacidade máxima
   */
  atualizar(dt, chance, r0, r1, brilho) {
    for (const l of this.linhas) {
      l.userData.espera -= dt;
      if (l.userData.espera <= 0) {
        l.userData.espera = 0.035 + Math.random() * 0.09;
        if (Math.random() < chance) {
          this.gerar(l, r0, r1 * (0.5 + Math.random() * 0.7));
          l.material.opacity = brilho * (0.5 + Math.random() * 0.5);
        } else {
          l.material.opacity = 0;
        }
      } else {
        l.material.opacity *= Math.exp(-dt * 18);
      }
    }
  }

  gerar(linha, r0, r1) {
    const d = this._d.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
    const a = this._a.set(-d.y, d.x, 0.3).normalize();
    const b = this._b.crossVectors(d, a).normalize();
    const p = linha.geometry.attributes.position;
    const n = this.segmentos;
    let ox = 0;
    let oy = 0;
    for (let i = 0; i < n; i++) {
      const f = i / (n - 1);
      const r = r0 + (r1 - r0) * f;
      const amp = (r1 - r0) * 0.22 * Math.sin(Math.PI * Math.min(1, f * 1.3));
      ox = ox * 0.5 + (Math.random() - 0.5) * amp;
      oy = oy * 0.5 + (Math.random() - 0.5) * amp;
      p.setXYZ(i, d.x * r + a.x * ox + b.x * oy, d.y * r + a.y * ox + b.y * oy, d.z * r + a.z * ox + b.z * oy);
    }
    p.needsUpdate = true;
  }

  esconder() {
    for (const l of this.linhas) l.material.opacity = 0;
  }
}
