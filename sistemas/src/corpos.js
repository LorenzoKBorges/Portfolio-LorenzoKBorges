import * as THREE from 'three';
import { aleatorio, texturaPlaneta, texturaAnel, texturaBrilho, texturaRaios } from './texturas.js';

const TAU = Math.PI * 2;
const RUIDO_GLSL = `
  float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float ruido(vec3 x) {
    vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * ruido(p); p *= 2.02; a *= 0.5; } return s; }
`;

let brilhoCompartilhado = null;
const brilho = () => brilhoCompartilhado || (brilhoCompartilhado = texturaBrilho());

// ------------------------------------------------------------------ estrela (sol do sistema)

export class Estrela {
  constructor({ raio, cor, corBorda, semente }) {
    this.grupo = new THREE.Group();
    this.raio = raio;

    // superfície fervendo (ruído animado), clara o bastante para o bloom pegar
    this.mat = new THREE.ShaderMaterial({
      uniforms: {
        uTempo: { value: 0 },
        uCor: { value: new THREE.Color(cor) },
        uBorda: { value: new THREE.Color(corBorda) },
      },
      vertexShader: `
        varying vec3 vP; varying vec3 vN;
        void main() { vP = position; vN = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `
        uniform float uTempo; uniform vec3 uCor; uniform vec3 uBorda;
        varying vec3 vP; varying vec3 vN;
        ${RUIDO_GLSL}
        void main() {
          vec3 p = normalize(vP) * 2.4;
          float n = fbm(p + vec3(uTempo * 0.12, uTempo * 0.05, -uTempo * 0.08));
          float m = fbm(p * 2.3 - vec3(uTempo * 0.2));
          float t = smoothstep(0.25, 0.85, n * 0.7 + m * 0.3);
          float borda = pow(1.0 - abs(vN.z), 1.6);
          vec3 c = mix(uBorda, uCor, t);
          c = mix(c, uBorda * 1.4, borda * 0.6);
          gl_FragColor = vec4(c * 2.2, 1.0);
        }`,
    });
    this.nucleo = new THREE.Mesh(new THREE.SphereGeometry(raio, 64, 48), this.mat);
    this.grupo.add(this.nucleo);

    // halo e coroa (sprites somando luz)
    const halo = (escala, cor, opacidade, mapa) => {
      const s = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: mapa, color: cor, transparent: true, opacity: opacidade, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      s.scale.setScalar(raio * escala);
      this.grupo.add(s);
      return s;
    };
    this.halo1 = halo(5.5, corBorda, 0.85, brilho());
    this.halo2 = halo(10, corBorda, 0.16, brilho());
    this.coroa = halo(9, cor, 0.55, texturaRaios(semente));

    // luz que ilumina os planetas (sem queda com a distância: todos ficam visíveis)
    this.luz = new THREE.PointLight(new THREE.Color(cor).lerp(new THREE.Color('#ffffff'), 0.5), 3.2, 0, 0);
    this.grupo.add(this.luz);
  }

  atualizar(t) {
    this.mat.uniforms.uTempo.value = t;
    const pulso = 1 + Math.sin(t * 1.3) * 0.04 + Math.sin(t * 3.1) * 0.015;
    this.halo1.scale.setScalar(this.raio * 5.5 * pulso);
    this.coroa.material.rotation = t * 0.03;
    this.coroa.scale.setScalar(this.raio * 9 * (1 + Math.sin(t * 0.8) * 0.05));
  }

  /** 0..1: a estrela "acende" na entrada do sistema */
  set acender(k) {
    this.nucleo.scale.setScalar(Math.max(0.001, k));
    this.halo1.material.opacity = 0.85 * k;
    this.halo2.material.opacity = 0.16 * k;
    this.coroa.material.opacity = 0.55 * k;
    this.luz.intensity = 3.2 * k;
  }
}

// ------------------------------------------------------------------ órbita (linha com rastro)

export class Orbita {
  constructor({ raio, cor, angulo0 }) {
    const n = 360;
    const pos = new Float32Array(n * 3);
    const ang = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const a = i / n;
      const th = angulo0 + a * TAU;
      pos[i * 3] = Math.cos(th) * raio;
      pos[i * 3 + 2] = Math.sin(th) * raio;
      ang[i] = a;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aAng', new THREE.BufferAttribute(ang, 1));
    this.mat = new THREE.ShaderMaterial({
      uniforms: {
        uFase: { value: 0 },
        uRevelar: { value: 0 },
        uCor: { value: new THREE.Color(cor) },
        uAlpha: { value: 0.55 },
        uDestaque: { value: 0 },
        uRaioOrbita: { value: raio },
        uOculta: { value: 0 }, // raio em volta do planeta onde a linha some
      },
      vertexShader: `
        attribute float aAng; varying float vAng;
        void main() { vAng = aAng; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `
        uniform float uFase; uniform float uRevelar; uniform vec3 uCor; uniform float uAlpha; uniform float uDestaque;
        uniform float uRaioOrbita; uniform float uOculta;
        varying float vAng;
        void main() {
          if (vAng > uRevelar) discard;
          float d = fract(uFase - vAng);          // distância atrás do planeta (0 = colado nele)
          float rastro = exp(-d * 6.0);
          float a = uAlpha * (0.16 + 0.84 * rastro) + uDestaque * 0.4;
          // a linha some perto do planeta: o rastro parece sair de trás dele
          float arco = min(d, 1.0 - d) * 6.2832 * uRaioOrbita;
          a *= smoothstep(uOculta, uOculta * 1.8, arco);
          gl_FragColor = vec4(uCor * (1.0 + rastro * 0.8 + uDestaque * 0.6), a);
        }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.linha = new THREE.LineLoop(geo, this.mat);
  }
}

// ------------------------------------------------------------------ planeta (matéria)

/**
 * Um planeta por matéria.
 *  tamanho  = número de trabalhos
 *  luas     = uma lua para cada trabalho
 *  apagado  = matéria ainda sem trabalhos ("em breve")
 */
export class Planeta {
  constructor({ materia, indice, raioOrbita, visual, semente, velocidade }) {
    this.materia = materia;
    this.indice = indice;
    this.n = materia.atividades.length;
    this.vazio = this.n === 0;
    this.raio = this.vazio ? 0.9 : 1.1 + 0.32 * this.n;
    this.raioOrbita = raioOrbita;
    this.velocidade = velocidade;
    const rnd = aleatorio(semente);
    this.angulo0 = rnd() * TAU;
    this.angulo = this.angulo0;

    // plano da órbita: um pouco inclinado, cada um para um lado
    this.plano = new THREE.Group();
    this.plano.rotation.set((rnd() - 0.5) * 0.12, rnd() * TAU, (rnd() - 0.5) * 0.12);

    this.orbita = new Orbita({ raio: raioOrbita, cor: visual.orbita, angulo0: this.angulo0 });
    this.orbita.mat.uniforms.uAlpha.value = this.vazio ? 0.28 : 0.55;
    this.plano.add(this.orbita.linha);

    // corpo
    this.corpo = new THREE.Group();
    this.plano.add(this.corpo);
    this.eixo = new THREE.Group();
    this.eixo.rotation.z = (rnd() - 0.5) * 0.7; // inclinação do eixo
    this.corpo.add(this.eixo);

    const cores = this.vazio ? ['#2a2733', '#3b3746', '#565063'] : visual.cores;
    this.matSuperficie = new THREE.MeshStandardMaterial({
      map: texturaPlaneta({ tipo: visual.tipo, cores, semente: semente + 7 }),
      roughness: 0.9,
      metalness: 0,
      emissive: new THREE.Color(cores[1]),
      emissiveIntensity: this.vazio ? 0.02 : 0.07,
      transparent: this.vazio,
      opacity: this.vazio ? 0.85 : 1,
    });
    this.esfera = new THREE.Mesh(new THREE.SphereGeometry(this.raio, 48, 32), this.matSuperficie);
    this.eixo.add(this.esfera);

    // atmosfera: brilho na borda (fresnel)
    this.matAtmosfera = new THREE.ShaderMaterial({
      uniforms: { uCor: { value: new THREE.Color(this.vazio ? '#6b6478' : visual.atmosfera) }, uForca: { value: this.vazio ? 0.35 : 0.9 } },
      vertexShader: `
        varying vec3 vN; varying vec3 vV;
        void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `
        uniform vec3 uCor; uniform float uForca; varying vec3 vN; varying vec3 vV;
        void main() { float f = pow(1.0 - max(dot(vN, vV), 0.0), 2.6); gl_FragColor = vec4(uCor * f * uForca, f * uForca); }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.atmosfera = new THREE.Mesh(new THREE.SphereGeometry(this.raio * 1.14, 48, 32), this.matAtmosfera);
    this.corpo.add(this.atmosfera);

    // anel
    if (visual.anel && !this.vazio) {
      const geo = new THREE.RingGeometry(this.raio * 1.45, this.raio * 2.3, 96, 1);
      // u da textura vai de dentro para fora
      const p = geo.attributes.position;
      const uv = geo.attributes.uv;
      const v3 = new THREE.Vector3();
      for (let i = 0; i < p.count; i++) {
        v3.fromBufferAttribute(p, i);
        uv.setXY(i, (v3.length() - this.raio * 1.45) / (this.raio * 0.85), 0.5);
      }
      this.anel = new THREE.Mesh(
        geo,
        new THREE.MeshStandardMaterial({
          map: texturaAnel(visual.anel, semente + 3),
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: false,
          roughness: 1,
          emissive: new THREE.Color(visual.anel[1]),
          emissiveIntensity: 0.15,
        })
      );
      this.anel.rotation.x = -Math.PI / 2 + 0.35;
      this.eixo.add(this.anel);
    }

    // luas: uma por trabalho
    this.luas = [];
    for (let k = 0; k < this.n; k++) {
      const r = 0.2 + rnd() * 0.16;
      const lua = new THREE.Mesh(
        new THREE.SphereGeometry(r, 20, 14),
        new THREE.MeshStandardMaterial({ color: visual.lua, roughness: 1, emissive: new THREE.Color(visual.lua), emissiveIntensity: 0.12 })
      );
      const plano = new THREE.Group();
      plano.rotation.set((rnd() - 0.5) * 1.1, rnd() * TAU, (rnd() - 0.5) * 0.6);
      plano.add(lua);
      this.corpo.add(plano);
      this.luas.push({
        malha: lua,
        distancia: this.raio * 1.7 + (k % 3) * 0.55 + rnd() * 0.25,
        velocidade: (1.1 + rnd() * 0.7) * (k % 2 ? -1 : 1),
        fase: rnd() * TAU,
      });
    }

    // área de clique maior que o planeta (fácil de acertar, inclusive no celular)
    this.alvo = new THREE.Mesh(
      new THREE.SphereGeometry(Math.max(this.raio * 1.9, 2.4), 12, 8),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false })
    );
    this.alvo.userData.planeta = this;
    this.corpo.add(this.alvo);

    this.escala = 1;
    this.escalaAlvo = 1;
    this.entrada = 0; // 0..1: animação de nascimento
    this.extensao = this.raio * 1.7 + 1.35; // raio ocupado com as luas (para espaçar as órbitas)
  }

  /** posição no mundo (para a câmera seguir) */
  posicaoMundo(out) {
    return this.corpo.getWorldPosition(out);
  }

  atualizar(dt, t, ritmo) {
    this.angulo += this.velocidade * dt * ritmo;
    // nascimento: sai de dentro do sol em espiral e chega na órbita
    const k = this.entrada;
    const sai = k <= 0 ? 0 : 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2); // ease out back
    const r = this.raioOrbita * Math.max(0, sai);
    const th = this.angulo - (1 - k) * 2.2;
    this.corpo.position.set(Math.cos(th) * r, 0, Math.sin(th) * r);
    this.corpo.visible = k > 0.001;

    this.eixo.rotation.y += dt * 0.35 * ritmo;
    this.escala += (this.escalaAlvo - this.escala) * (1 - Math.exp(-dt * 10));
    this.eixo.scale.setScalar(this.escala * Math.min(1, k * 1.6));
    this.atmosfera.scale.setScalar(this.escala * Math.min(1, k * 1.6));

    for (const l of this.luas) {
      const a = l.fase + t * l.velocidade * (0.4 + 0.6 * ritmo);
      const d = l.distancia * this.escala * Math.min(1, k * 1.4);
      l.malha.position.set(Math.cos(a) * d, 0, Math.sin(a) * d);
    }

    const u = this.orbita.mat.uniforms;
    u.uFase.value = (((this.angulo - this.angulo0) / TAU) % 1 + 1) % 1;
    u.uOculta.value = this.raio * this.escala * 1.15 * Math.min(1, k * 1.6);
    u.uRevelar.value = Math.min(1, k * 1.15);
  }
}
