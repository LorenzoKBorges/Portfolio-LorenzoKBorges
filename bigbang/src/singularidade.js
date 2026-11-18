import * as THREE from 'three';
import { materialPontos, geometria, pontos, sprite } from './materiais.js';
import { Raios } from './raios.js';
import { criarRng, naEsfera, batida, tremor, lerp } from './utils.js';

const COR_HALO = new THREE.Color('#9d6bff');
const COR_QUENTE = new THREE.Color('#ff7ad9');
const COR_LIMITE = new THREE.Color('#f3e8ff');

/**
 * O ponto branco-arroxeado do começo: pulsa como um coração, puxa partículas de energia
 * para dentro e, quando carregado, treme, solta raios e implode.
 */
export class Singularidade {
  constructor(cena, tex, qualidade) {
    this.grupo = new THREE.Group();
    cena.add(this.grupo);

    this.haloGrande = sprite(tex.brilho, '#4a1fb8', 46, 0.22);
    this.haloMedio = sprite(tex.brilho, '#9d6bff', 11, 0.6);
    this.haloPequeno = sprite(tex.brilho, '#e0cfff', 4.2, 0.95);
    this.nucleo = sprite(tex.brilho, '#ffffff', 1.7, 1);
    this.flare = sprite(tex.flare, '#e9dcff', 10, 0.55);
    this.grupo.add(this.haloGrande, this.haloMedio, this.haloPequeno, this.flare, this.nucleo);

    // Ondas de energia que saem a cada batida
    this.ondas = [];
    for (let i = 0; i < 7; i++) {
      const o = sprite(tex.anel, '#b48cff', 1, 0);
      o.userData.idade = 99;
      this.grupo.add(o);
      this.ondas.push(o);
    }
    this.proxOnda = 0;
    this.ultimaBatida = -1;

    // Partículas de energia espiralando para o centro
    const n = Math.round(2200 * qualidade);
    const rand = criarRng(3);
    const sem = new Float32Array(n);
    const raio = new Float32Array(n);
    const eixo = new Float32Array(n * 3);
    const ang = new Float32Array(n);
    const vel = new Float32Array(n);
    const v = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      sem[i] = rand();
      raio[i] = 5 + rand() * rand() * 30;
      naEsfera(rand, v);
      eixo.set([v.x, v.y, v.z], i * 3);
      ang[i] = rand() * Math.PI * 2;
      vel[i] = 0.25 + rand() * 0.6;
    }
    this.uFluxo = {
      uFase: { value: 0 },
      uIntensidade: { value: 0.2 },
      uColapso: { value: 0 },
      uCorA: { value: new THREE.Color('#5d3bd6') },
      uCorB: { value: new THREE.Color('#f2e9ff') },
    };
    const mat = materialPontos({
      uniforms: this.uFluxo,
      cabecalho: /* glsl */ `
        attribute float aSem; attribute float aRaio; attribute vec3 aEixo; attribute float aAng; attribute float aVel;
        uniform float uFase; uniform float uIntensidade; uniform float uColapso; uniform vec3 uCorA; uniform vec3 uCorB;
      `,
      corpo: /* glsl */ `
        float f = fract(aSem + uFase * aVel);
        float r = aRaio * pow(1.0 - f, 1.6) + 0.12;
        r *= 1.0 - uColapso;
        float ang = aAng + f * 5.0 + 1.6 / (r + 0.35);
        vec3 n = normalize(aEixo);
        vec3 t1 = normalize(cross(n, abs(n.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
        vec3 t2 = cross(n, t1);
        pos = (t1 * cos(ang) + t2 * sin(ang)) * r;
        cor = mix(uCorA, uCorB, f * f) * (0.6 + uIntensidade * 1.4);
        tam = 0.07 + 0.1 * f;
        alfa = smoothstep(0.0, 0.3, f) * (1.0 - smoothstep(0.9, 1.0, f)) * (0.35 + uIntensidade) * (1.0 - uColapso * 0.5);
      `,
    });
    this.fluxo = pontos(
      geometria({ aSem: [sem, 1], aRaio: [raio, 1], aEixo: [eixo, 3], aAng: [ang, 1], aVel: [vel, 1] }, n),
      mat
    );
    this.grupo.add(this.fluxo);

    this.raios = new Raios(this.grupo, { quantidade: 10, cor: '#d9c4ff' });
    this._tremor = new THREE.Vector3();
    this._cor = new THREE.Color();
  }

  /**
   * @param tempo     relógio contínuo (s)
   * @param fase      fase da batida (ciclos)
   * @param fluxo     fase acumulada do fluxo de partículas
   * @param carga     0 = calma, 1 = no limite
   * @param colapso   0..1 implosão final
   */
  atualizar(dt, tempo, fase, fluxo, carga, colapso) {
    const b = batida(fase);
    const k = carga;
    const vivo = 1 - colapso;

    // Tremor cada vez mais forte
    tremor(tempo, 0.28 * k * k, this._tremor, 22);
    this.grupo.position.copy(this._tremor);

    // Cor esquenta: roxo -> rosa -> branco-azulado
    const c = this._cor.copy(COR_HALO);
    if (k < 0.6) c.lerp(COR_QUENTE, k / 0.6);
    else c.copy(COR_QUENTE).lerp(COR_LIMITE, (k - 0.6) / 0.4);
    this.haloMedio.material.color.copy(c);

    const piscar = k > 0.35 ? 1 - Math.random() * 0.45 * (k - 0.35) : 1;
    const inchar = 1 + 1.4 * k;
    const pulso = 1 + 0.22 * b * (1 + k * 1.5);

    this.nucleo.scale.setScalar(1.7 * pulso * inchar * lerp(1, 0.12, colapso));
    this.haloPequeno.scale.setScalar(4.2 * pulso * inchar * lerp(1, 0.2, colapso));
    this.haloMedio.scale.setScalar(11 * (1 + 0.12 * b) * (1 + 1.8 * k) * lerp(1, 0.15, colapso));
    this.haloGrande.scale.setScalar(46 * (1 + 0.06 * b) * (1 + 0.8 * k) * lerp(1, 0.3, colapso));
    this.flare.scale.setScalar(10 * (1 + 0.3 * b) * (1 + 2.2 * k) * vivo);
    this.flare.material.rotation = tempo * 0.15 + k * k * 3;

    this.nucleo.material.opacity = piscar;
    this.haloPequeno.material.opacity = 0.95 * piscar * (0.5 + 0.5 * vivo);
    this.haloMedio.material.opacity = (0.55 + 0.2 * b + 0.25 * k) * piscar * vivo;
    this.haloGrande.material.opacity = (0.2 + 0.08 * b + 0.25 * k) * vivo;
    this.flare.material.opacity = (0.45 + 0.4 * k) * piscar * vivo;

    // Fluxo de partículas
    this.uFluxo.uFase.value = fluxo;
    this.uFluxo.uIntensidade.value = 0.2 + 0.8 * k;
    this.uFluxo.uColapso.value = colapso;

    // Ondas: uma por batida (e mais curtas/rápidas conforme a carga)
    const indice = Math.floor(fase);
    if (indice !== this.ultimaBatida && colapso < 0.1) {
      this.ultimaBatida = indice;
      const o = this.ondas[this.proxOnda++ % this.ondas.length];
      o.userData.idade = 0;
      o.userData.vel = 9 + 26 * k;
      o.material.color.copy(c);
    }
    for (const o of this.ondas) {
      o.userData.idade += dt;
      const a = o.userData.idade;
      const vida = 1.6 - 0.9 * k;
      if (a > vida) {
        o.material.opacity = 0;
        continue;
      }
      o.scale.setScalar(2 + a * o.userData.vel);
      o.material.opacity = (1 - a / vida) ** 2 * (0.35 + 0.4 * k) * vivo;
    }

    // Raios elétricos só quando carregando
    if (colapso > 0) this.raios.esconder();
    else this.raios.atualizar(dt, k > 0.15 ? Math.pow(k, 1.3) : 0, 0.6, 3 + 6 * k, 0.9);
  }

  set visivel(v) {
    this.grupo.visible = v;
  }
}
