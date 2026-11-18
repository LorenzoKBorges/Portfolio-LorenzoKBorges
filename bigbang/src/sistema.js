import * as THREE from 'three';
import { sprite, globais } from './materiais.js';
import { texturaPlaneta } from './texturas.js';
import { smoothstep } from './utils.js';

/**
 * Os planetas do sistema solar (Saturno é a classe Planeta, à parte), do sol para fora.
 * raio = tamanho do planeta; orbita = distância ao sol; volta = velocidade da órbita (rad/s);
 * giro = rotação no próprio eixo (rad/s); angulo0 = onde ele está na órbita no começo (graus).
 * Tamanhos e distâncias são exagerados para o sistema inteiro caber na tela.
 */
export const PLANETAS = [
  {
    nome: 'mercurio',
    raio: 4,
    orbita: 44,
    volta: 0.5,
    giro: 0.5,
    paleta: ['#8a7aa0', '#a898c0', '#c4b6dc', '#9888b0', '#ddd2ee'],
    crateras: 40,
    atmosfera: '#c4b5fd',
    forcaAtmosfera: 0.3,
  },
  {
    nome: 'venus',
    raio: 6.5,
    orbita: 64,
    volta: 0.36,
    giro: -0.25,
    paleta: ['#e8d4f5', '#d6b8ee', '#f2e4fa', '#c9a2e6', '#ebd9f7'],
    nuvens: true,
    atmosfera: '#f5d0fe',
  },
  {
    nome: 'terra',
    raio: 7,
    orbita: 86,
    volta: 0.28,
    giro: 1.2,
    paleta: ['#2f2f96', '#4a63c8', '#5f45b8', '#62b8d8', '#3a3aa8'],
    nuvens: true,
    atmosfera: '#7dd3fc',
    lua: true,
    angulo0: 130,
  },
  {
    nome: 'marte',
    raio: 5.5,
    orbita: 108,
    volta: 0.22,
    giro: 1.1,
    paleta: ['#b4568e', '#d07aa8', '#9a3f78', '#e3a0c4', '#c06a9a'],
    crateras: 18,
    atmosfera: '#f9a8d4',
    forcaAtmosfera: 0.4,
    angulo0: 40,
  },
  {
    nome: 'jupiter',
    raio: 15,
    orbita: 150,
    volta: 0.08,
    giro: 1.6,
    paleta: ['#b04ad0', '#e07ae8', '#8f2fb0', '#f0a6f0', '#c25ad8', '#7c3aed'],
    faixas: true,
    atmosfera: '#f0abfc',
  },
  {
    nome: 'urano',
    raio: 10,
    orbita: 235,
    volta: 0.03,
    giro: -0.9,
    paleta: ['#a5d8f0', '#b7c0ff', '#9ad0ea', '#c9d4ff', '#a8b8f8'],
    faixas: true,
    atmosfera: '#a5f3fc',
    angulo0: 120,
  },
  {
    nome: 'netuno',
    raio: 10,
    orbita: 270,
    volta: 0.02,
    giro: 1.0,
    paleta: ['#3b3bb0', '#5a5ad8', '#4848c4', '#7c8cf0', '#3a3aa8'],
    faixas: true,
    atmosfera: '#818cf8',
  },
];

/** Saturno fica nesta órbita (não anda na órbita: a estrela dá uma volta inteira nele). */
export const ORBITA_SATURNO = 195;

/** Brilho na borda do planeta (efeito Fresnel). */
function atmosfera(raio, cor) {
  const u = { uCor: { value: new THREE.Color(cor) }, uInt: { value: 0.3 } };
  const malha = new THREE.Mesh(
    new THREE.SphereGeometry(raio * 1.07, 40, 28),
    new THREE.ShaderMaterial({
      uniforms: u,
      vertexShader: /* glsl */ `
        varying vec3 vN; varying vec3 vV;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vN = normalize(normalMatrix * normal);
          vV = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uCor; uniform float uInt;
        varying vec3 vN; varying vec3 vV;
        void main() {
          float f = pow(1.0 - max(dot(normalize(vN), normalize(vV)), 0.0), 2.4);
          gl_FragColor = vec4(uCor * f * uInt, 1.0);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  return { malha, u };
}

/**
 * Sistema solar: sol roxo-branco com luz própria, os planetas girando no próprio eixo e em
 * volta do sol, e as linhas das órbitas. Tudo fica num grupo com origem no sol, que pode ser
 * encolhido (é assim que a "lupa" amplia um pontinho do braço da galáxia até virar o sistema).
 *
 * @param base { sol, e1, e2, cima }: posição do sol e os eixos do plano das órbitas, no mundo
 */
export class SistemaSolar {
  constructor(cena, tex, base) {
    this.sol = base.sol.clone();
    this.grupo = new THREE.Group();
    this.grupo.position.copy(this.sol);
    // eixos locais: x = e1, y = cima (perpendicular às órbitas), z = e2
    this.grupo.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(base.e1, base.cima, base.e2));
    cena.add(this.grupo);

    // --- sol
    const corSol = new THREE.Color('#f1e4ff').multiplyScalar(1.8);
    this.nucleoSol = new THREE.Mesh(new THREE.SphereGeometry(19, 48, 32), new THREE.MeshBasicMaterial({ color: corSol }));
    this.coroa = sprite(tex.brilho, '#d8b4fe', 75, 0.55);
    this.coroa2 = sprite(tex.brilho, '#7c3aed', 210, 0.22);
    this.raiosSol = sprite(tex.flare, '#f3e8ff', 120, 0.3);
    this.grupo.add(this.nucleoSol, this.coroa2, this.coroa, this.raiosSol);
    this.luz = new THREE.PointLight('#ead9ff', 700, 0, 1.1);
    this.grupo.add(this.luz);

    // --- planetas
    this.planetas = PLANETAS.map((tipo, k) => {
      const mapa = texturaPlaneta({ semente: 900 + k * 17, ...tipo });
      const corpo = new THREE.Mesh(
        new THREE.SphereGeometry(tipo.raio, 48, 32),
        // brilho próprio leve com a própria textura: o lado da noite continua aparecendo
        new THREE.MeshStandardMaterial({
          map: mapa,
          emissiveMap: mapa,
          emissive: new THREE.Color('#ffffff'),
          emissiveIntensity: 0.22,
          roughness: 0.9,
          metalness: 0,
        })
      );
      const eixo = new THREE.Group(); // inclinação do eixo de rotação
      eixo.rotation.z = 0.15 + ((k * 0.37) % 0.4);
      eixo.add(corpo);
      const atm = atmosfera(tipo.raio, tipo.atmosfera);
      eixo.add(atm.malha);
      const g = new THREE.Group();
      g.add(eixo);
      let lua = null;
      if (tipo.lua) {
        lua = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 2), new THREE.MeshStandardMaterial({ color: '#cbbfe0', roughness: 1 }));
        g.add(lua);
      }
      this.grupo.add(g);
      return { ...tipo, grupo: g, corpo, atm, lua, anguloEncontro: null, tEncontro: 0 };
    });

    // --- linhas das órbitas (no plano local y = 0)
    this.materialOrbita = new THREE.LineBasicMaterial({
      color: new THREE.Color('#a78bfa'),
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    for (const r of [...PLANETAS.map((p) => p.orbita), ORBITA_SATURNO]) {
      const pts = [];
      for (let i = 0; i < 200; i++) {
        const a = (i / 200) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
      }
      this.grupo.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), this.materialOrbita));
    }
    this.grupo.updateMatrixWorld();
    this._v = new THREE.Vector3();
  }

  /** Ponto do plano das órbitas (raio, ângulo em graus) em coordenadas locais. */
  static local(raio, graus, out = new THREE.Vector3()) {
    const a = THREE.MathUtils.degToRad(graus);
    return out.set(Math.cos(a) * raio, 0, Math.sin(a) * raio);
  }

  /** Local -> mundo, com o sistema no tamanho final (escala 1). */
  mundo(local, out = new THREE.Vector3()) {
    return out.copy(local).applyQuaternion(this.grupo.quaternion).add(this.sol);
  }

  /** Mundo (tamanho final) -> local: direções. */
  direcaoLocal(v, out = new THREE.Vector3()) {
    return out.copy(v).applyQuaternion(this.grupo.quaternion.clone().invert());
  }

  /** Coloca Saturno (classe Planeta) dentro do sistema, na órbita dele. */
  adotarSaturno(planeta, graus) {
    const local = SistemaSolar.local(ORBITA_SATURNO, graus);
    this.grupo.add(planeta.grupo);
    planeta.grupo.position.copy(local);
    planeta.centro.copy(this.mundo(local));
  }

  /**
   * Define em que ângulo da órbita cada planeta visitado estará e em que instante:
   * encontros = { nome: { graus, t } }. Os outros seguem a partir do angulo0.
   */
  sincronizar(encontros) {
    for (const p of this.planetas) {
      const e = encontros[p.nome];
      if (e) {
        p.anguloEncontro = e.graus;
        p.tEncontro = e.t;
      }
    }
  }

  /**
   * Para os planetas que a estrela não visita: escolhe onde cada um começa na órbita de modo que
   * ele fique o mais longe possível do caminho da estrela durante toda a viagem.
   * posEstrela(t, out) dá a posição da estrela no mundo (sistema no tamanho final).
   */
  afastarDaRota(posEstrela, t0, t1) {
    const p = new THREE.Vector3();
    const amostras = [];
    for (let t = t0; t <= t1; t += 0.02) amostras.push([t, posEstrela(t, new THREE.Vector3())]);
    for (const pl of this.planetas) {
      if (pl.anguloEncontro !== null) continue;
      let melhor = pl.angulo0 ?? 0;
      let maiorFolga = -Infinity;
      for (let a0 = 0; a0 < 360; a0 += 5) {
        let folga = Infinity;
        for (const [t, e] of amostras) {
          this.mundo(SistemaSolar.local(pl.orbita, a0 + THREE.MathUtils.radToDeg(pl.volta) * t, p), p);
          folga = Math.min(folga, p.distanceTo(e) - pl.raio);
        }
        if (folga > maiorFolga) [maiorFolga, melhor] = [folga, a0];
      }
      pl.angulo0 = melhor;
    }
  }

  /** Ângulo (graus) do planeta na órbita no instante t. */
  angulo(p, t) {
    const graus = THREE.MathUtils.radToDeg(p.volta);
    return p.anguloEncontro !== null ? p.anguloEncontro + graus * (t - p.tEncontro) : (p.angulo0 ?? 0) + graus * t;
  }

  /** Encolhe/estica o sistema inteiro em volta do sol (1 = tamanho final). */
  set escala(s) {
    this.grupo.scale.setScalar(s);
  }

  atualizar(t, estrela, formacao) {
    this.grupo.visible = formacao > 0.001;
    if (!this.grupo.visible) return;
    this.raiosSol.material.rotation = t * 0.05;
    // quando o sistema ainda é um pontinho no braço, o brilho do sol tem um tamanho mínimo na tela
    // (senão ele sumiria): proporcional à distância da câmera. No tamanho final volta ao normal
    const e = this.grupo.scale.x;
    const dCam = this.grupo.getWorldPosition(this._v).distanceTo(globais.camPos);
    this.coroa.scale.setScalar((Math.hypot(75 * e, 0.0125 * dCam) / e) * (1 + 0.03 * Math.sin(t * 2.3)));
    this.raiosSol.scale.setScalar(Math.hypot(120 * e, 0.02 * dCam) / e);
    this.coroa2.scale.setScalar(Math.hypot(210 * e, 0.0078 * dCam) / e);
    this.materialOrbita.opacity = 0.22 * formacao;
    this.grupo.updateMatrixWorld();
    for (const p of this.planetas) {
      SistemaSolar.local(p.orbita, this.angulo(p, t), p.grupo.position);
      p.corpo.rotation.y = t * p.giro;
      // a estrela passando perto acende a atmosfera
      const perto = smoothstep(60, 12, p.grupo.getWorldPosition(this._v).distanceTo(estrela) / this.grupo.scale.x);
      p.atm.u.uInt.value = (0.22 + perto * 0.55) * (p.forcaAtmosfera ?? 1) * formacao;
      if (p.lua) {
        const a = t * 1.4;
        p.lua.position.set(Math.cos(a) * 13, Math.sin(a * 0.6) * 2, Math.sin(a) * 13);
      }
    }
  }
}
