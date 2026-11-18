import * as THREE from 'three';
import { sprite, globais } from './materiais.js';
import { tremor } from './utils.js';

/**
 * Rastro luminoso em forma de fita: uma tira de triângulos sempre virada para a câmera,
 * que passa pelas posições recentes. Mais grossa e clara na ponta, some no fim.
 */
class Rastro {
  constructor(cena, n, corA, corB, largura) {
    this.n = n;
    this.largura = largura;
    const pos = new Float32Array(n * 6);
    const idade = new Float32Array(n * 2);
    const lado = new Float32Array(n * 2);
    this.espaco = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) {
      idade[i * 2] = idade[i * 2 + 1] = i / (n - 1);
      lado[i * 2] = -1;
      lado[i * 2 + 1] = 1;
    }
    const indices = [];
    for (let i = 0; i < n - 1; i++) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    this.geo = new THREE.BufferGeometry();
    this.geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.geo.setAttribute('aIdade', new THREE.BufferAttribute(idade, 1));
    this.geo.setAttribute('aLado', new THREE.BufferAttribute(lado, 1));
    this.geo.setAttribute('aEspaco', new THREE.BufferAttribute(this.espaco, 1));
    this.geo.setIndex(indices);
    this.u = {
      uCorA: { value: new THREE.Color(corA) },
      uCorB: { value: new THREE.Color(corB) },
      uOpac: { value: 0 },
      uQueda: { value: 1.4 },
    };
    this.malha = new THREE.Mesh(
      this.geo,
      new THREE.ShaderMaterial({
        uniforms: this.u,
        vertexShader: /* glsl */ `
          attribute float aIdade; attribute float aLado; attribute float aEspaco;
          varying float vIdade; varying float vLado; varying float vEspaco;
          void main() {
            vIdade = aIdade; vLado = aLado;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            // o rastro passa ao lado da câmera: some antes de chegar nela
            vEspaco = aEspaco * smoothstep(6.0, 22.0, -mv.z);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uCorA; uniform vec3 uCorB; uniform float uOpac; uniform float uQueda;
          varying float vIdade; varying float vLado; varying float vEspaco;
          void main() {
            float borda = 1.0 - abs(vLado);
            float a = pow(borda, 1.6) * pow(1.0 - vIdade, uQueda) * uOpac * vEspaco;
            vec3 c = mix(uCorA, uCorB, smoothstep(0.0, 0.6, vIdade));
            c = mix(c, vec3(1.0), pow(borda, 6.0) * (1.0 - vIdade) * 0.6);
            gl_FragColor = vec4(c * a * 1.3, 1.0);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      })
    );
    this.malha.frustumCulled = false;
    cena.add(this.malha);
    this.P = Array.from({ length: n }, () => new THREE.Vector3());
    this._dir = new THREE.Vector3();
    this._lado = new THREE.Vector3(1, 0, 0);
    this._olhar = new THREE.Vector3();
  }

  /** posicao(i, out) devolve a posição do ponto i (0 = mais novo). */
  /** `queda`: quanto o rastro apaga ao longo do comprimento (menor = a parte antiga brilha mais). */
  atualizar(posicao, opac, larguraMul = 1, queda = 1.4) {
    this.u.uOpac.value = opac;
    this.u.uQueda.value = queda;
    this.malha.visible = opac > 0.001;
    if (!this.malha.visible) return;
    const n = this.n;
    const P = this.P;
    for (let i = 0; i < n; i++) posicao(i, P[i]);
    const pos = this.geo.attributes.position.array;
    for (let i = 0; i < n; i++) {
      const d = this._dir.subVectors(P[Math.max(0, i - 1)], P[Math.min(n - 1, i + 1)]);
      const seg = d.length();
      this._olhar.subVectors(globais.camPos, P[i]);
      if (seg > 1e-5) {
        const lado = d.cross(this._olhar);
        if (lado.lengthSq() > 1e-10) this._lado.copy(lado).normalize();
      }
      const w = this.largura * larguraMul * (1 - (i / (n - 1)) * 0.75);
      const k = i * 6;
      pos[k] = P[i].x - this._lado.x * w;
      pos[k + 1] = P[i].y - this._lado.y * w;
      pos[k + 2] = P[i].z - this._lado.z * w;
      pos[k + 3] = P[i].x + this._lado.x * w;
      pos[k + 4] = P[i].y + this._lado.y * w;
      pos[k + 5] = P[i].z + this._lado.z * w;
      // amontoado (estrela parada): cada pedaço brilha menos
      const dens = Math.min(1, seg / (w * 0.6 + 1e-4));
      this.espaco[i * 2] = this.espaco[i * 2 + 1] = dens;
    }
    this.geo.attributes.position.needsUpdate = true;
    this.geo.attributes.aEspaco.needsUpdate = true;
  }
}

const COR_HALO = new THREE.Color('#b98bff');
const COR_HALO_LIMITE = new THREE.Color('#f3e8ff');
const COR_LUZ = new THREE.Color('#d9c2ff');
const COR_LUZ_LIMITE = new THREE.Color('#f5eeff');

/**
 * A estrela protagonista: núcleo branco-arroxeado com raios em cruz, uma luz que ilumina
 * planetas e rochas, um rastro, e três bolinhas de luz girando em volta como malabares.
 */
export class Estrela {
  constructor(cena, tex) {
    this.grupo = new THREE.Group();
    cena.add(this.grupo);
    this.halo2 = sprite(tex.brilho, '#7c3aed', 10, 0.1);
    this.halo = sprite(tex.brilho, '#b98bff', 4.5, 0.7);
    this.flare = sprite(tex.flare, '#efe1ff', 9, 0.7);
    this.nucleo = sprite(tex.brilho, '#ffffff', 1.6, 1);
    this.grupo.add(this.halo2, this.halo, this.flare, this.nucleo);
    this.luz = new THREE.PointLight(COR_LUZ, 0, 0, 1.1);
    this.grupo.add(this.luz);

    this.rastro = new Rastro(cena, 240, '#f3e8ff', '#c026d3', 0.55);

    this.malabares = [
      { cor: '#c4b5fd', raio: 2.4, vel: 1.9, eixo: new THREE.Vector3(0.25, 1, 0.15), fase: 0 },
      { cor: '#f0abfc', raio: 3.0, vel: -1.5, eixo: new THREE.Vector3(1, 0.35, -0.3), fase: 2.1 },
      { cor: '#a5b4fc', raio: 3.6, vel: 1.2, eixo: new THREE.Vector3(-0.5, 0.55, 1), fase: 4.2 },
    ].map((m) => {
      const n = m.eixo.normalize();
      const e1 = new THREE.Vector3().crossVectors(n, Math.abs(n.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0)).normalize();
      const e2 = new THREE.Vector3().crossVectors(n, e1);
      const g = new THREE.Group();
      const brilho = sprite(tex.brilho, m.cor, 1.8, 0.8);
      const miolo = sprite(tex.brilho, '#ffffff', 0.5, 1);
      g.add(brilho, miolo);
      cena.add(g);
      return { ...m, e1, e2, grupo: g, brilho, miolo, rastro: new Rastro(cena, 90, '#ffffff', m.cor, 0.22) };
    });

    this._a = new THREE.Vector3();
    this._b = new THREE.Vector3();
    this._t = new THREE.Vector3();
  }

  /** Deslocamento de um malabar em relação à estrela no instante t. */
  deslocamento(m, t, fatorRaio, out) {
    const a = m.fase + m.vel * t;
    const r = m.raio * fatorRaio * (1 + 0.08 * Math.sin(t * 1.1 + m.fase));
    return out.copy(m.e1).multiplyScalar(Math.cos(a) * r).addScaledVector(m.e2, Math.sin(a) * r);
  }

  /**
   * @param t        relógio da animação
   * @param posEm    função (t, out) => posição da estrela no instante t
   * @param e        estado: { visivel, brilho, escala, tremor, raioMalabares(t), luz, rastro, quedaRastro, limite }
   */
  atualizar(t, posEm, e) {
    this.grupo.visible = e.visivel;
    if (!e.visivel) {
      this.rastro.atualizar(null, 0);
      for (const m of this.malabares) {
        m.grupo.visible = false;
        m.rastro.atualizar(null, 0);
      }
      return;
    }
    posEm(t, this.grupo.position);
    if (e.tremor > 0) this.grupo.position.add(tremor(t, e.tremor, this._t, 26));

    const b = e.brilho;
    const v = e.escalaVisual ?? 1; // vista de longe a estrela fica maior na tela, para não sumir
    const s = e.escala * v;
    const pulso = 1 + 0.06 * Math.sin(t * 5.1) + 0.04 * Math.sin(t * 13.7);
    this.nucleo.scale.setScalar(1.6 * s * pulso);
    this.halo.scale.setScalar(4.5 * s * pulso * (0.8 + 0.2 * b));
    this.halo2.scale.setScalar(10 * s * (0.7 + 0.3 * b));
    this.flare.scale.setScalar(9 * s * (0.7 + 0.3 * b) * pulso);
    this.flare.material.rotation = t * 0.12;
    this.halo.material.color.copy(COR_HALO).lerp(COR_HALO_LIMITE, e.limite);
    this.nucleo.material.opacity = Math.min(1, b);
    this.halo.material.opacity = 0.6 * Math.min(1.5, b);
    this.halo2.material.opacity = 0.1 * b;
    this.flare.material.opacity = 0.65 * Math.min(1.6, b);
    this.luz.intensity = e.luz;
    this.luz.color.copy(COR_LUZ).lerp(COR_LUZ_LIMITE, e.limite);

    // rastro: posições da estrela nos últimos ~2,2 s
    this.rastro.atualizar((i, out) => posEm(t - i / 100, out), e.rastro, v, e.quedaRastro ?? 1.4);

    for (const m of this.malabares) {
      const fr = e.raioMalabares(t);
      m.grupo.visible = fr > 0.01;
      if (!m.grupo.visible) {
        m.rastro.atualizar(null, 0);
        continue;
      }
      this.deslocamento(m, t, fr, m.grupo.position).add(this.grupo.position);
      const brilhoM = Math.min(1, fr * 1.5) * Math.min(1.3, b);
      m.grupo.scale.setScalar(v);
      m.brilho.material.opacity = 0.8 * brilhoM;
      m.miolo.material.opacity = brilhoM;
      m.rastro.atualizar((i, out) => {
        const ti = t - i / 130;
        posEm(ti, out);
        return out.add(this.deslocamento(m, ti, e.raioMalabares(ti), this._a));
      }, Math.min(1, fr * 1.2) * e.rastro, v);
    }
  }
}
