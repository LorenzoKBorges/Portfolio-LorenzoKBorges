import * as THREE from 'three';
// Mesmo modelo de arte da animação do Big Bang: texturas, sprites e materiais vêm de lá
import { texturaPlaneta } from '../../bigbang/src/texturas.js';
import { sprite } from '../../bigbang/src/materiais.js';
import { criarRng } from '../../bigbang/src/utils.js';

const TAU = Math.PI * 2;

/** Brilho na borda do planeta (efeito Fresnel), igual ao do sistema solar do Big Bang. */
function atmosfera(raio, cor) {
  const u = { uCor: { value: new THREE.Color(cor) }, uInt: { value: 0.3 } };
  const malha = new THREE.Mesh(
    new THREE.SphereGeometry(raio * 1.07, 48, 32),
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

// ------------------------------------------------------------------ estrela (sol do sistema)

/** Sol como o do Big Bang: núcleo claro com luz própria, coroa, halo largo e raios em cruz. */
export class Estrela {
  constructor(tex, { raio, nucleo, coroa, halo, raios, luz }) {
    this.grupo = new THREE.Group();
    this.raio = raio;
    this.nucleo = new THREE.Mesh(new THREE.SphereGeometry(raio, 48, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(nucleo).multiplyScalar(1.8) }));
    // tamanhos proporcionais aos do sol do Big Bang (raio 19: coroa 75, halo 210, raios 120)
    this.coroa = sprite(tex.brilho, coroa, raio * 3.95, 0.55);
    this.halo = sprite(tex.brilho, halo, raio * 11, 0.22);
    this.raios = sprite(tex.flare, raios, raio * 6.3, 0.3);
    this.grupo.add(this.nucleo, this.halo, this.coroa, this.raios);
    this.luz = new THREE.PointLight(luz, 700, 0, 1.1);
    this.grupo.add(this.luz);
    this.opacidades = [0.55, 0.22, 0.3];
  }

  atualizar(t) {
    this.raios.material.rotation = t * 0.05;
    this.coroa.scale.setScalar(this.raio * 3.95 * (1 + 0.03 * Math.sin(t * 2.3)));
  }

  /** 0..1: a estrela "acende" na entrada do sistema */
  set acender(k) {
    this.nucleo.scale.setScalar(Math.max(0.001, k));
    this.coroa.material.opacity = this.opacidades[0] * k;
    this.halo.material.opacity = this.opacidades[1] * k;
    this.raios.material.opacity = this.opacidades[2] * k;
    this.luz.intensity = 700 * k;
  }
}

// ------------------------------------------------------------------ planeta (matéria)

/**
 * Um planeta por matéria.
 *  tamanho  = número de trabalhos
 *  luas     = uma lua para cada trabalho
 *  apagado  = matéria ainda sem trabalhos ("em breve")
 *
 * visual: { paleta, faixas, crateras, nuvens, atmosfera, forcaAtmosfera, anel, saturno }
 *  (mesmos campos dos planetas do sistema solar do Big Bang; saturno = usa a textura do Saturno de lá)
 */
export class Planeta {
  constructor(tex, { materia, indice, raioOrbita, visual, semente, corOrbita }) {
    this.materia = materia;
    this.indice = indice;
    this.n = materia.atividades.length;
    this.vazio = this.n === 0;
    this.raio = Planeta.raioPara(this.n);
    this.raioOrbita = raioOrbita;
    this.velocidade = 0;
    const rand = criarRng(semente);
    this.angulo0 = rand() * TAU;
    this.angulo = this.angulo0;

    // plano da órbita: um pouco inclinado, cada um para um lado
    this.plano = new THREE.Group();
    this.plano.rotation.set((rand() - 0.5) * 0.1, rand() * TAU, (rand() - 0.5) * 0.1);

    // linha da órbita, como no Big Bang (fina, fraca, somando luz)
    this.opacidadeOrbita = this.vazio ? 0.12 : 0.22;
    this.matOrbita = new THREE.LineBasicMaterial({
      color: new THREE.Color(corOrbita),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const pts = [];
    for (let i = 0; i < 256; i++) {
      const a = (i / 256) * TAU;
      pts.push(new THREE.Vector3(Math.cos(a) * raioOrbita, 0, Math.sin(a) * raioOrbita));
    }
    this.plano.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), this.matOrbita));

    // corpo
    this.corpo = new THREE.Group();
    this.plano.add(this.corpo);
    this.eixo = new THREE.Group();
    this.eixo.rotation.z = 0.15 + rand() * 0.35; // inclinação do eixo de rotação
    this.corpo.add(this.eixo);

    const mapa = visual.saturno ? tex.planeta : texturaPlaneta({ semente: semente + 7, ...visual });
    // brilho próprio leve com a própria textura: o lado da noite continua aparecendo (como no Big Bang)
    this.matCorpo = new THREE.MeshStandardMaterial({
      map: mapa,
      emissiveMap: mapa,
      emissive: new THREE.Color('#ffffff'),
      emissiveIntensity: this.vazio ? 0.08 : 0.22,
      roughness: 0.92,
      metalness: 0,
    });
    if (this.vazio) this.matCorpo.color.set('#8a8494'); // apagado: cores mais fracas
    this.esfera = new THREE.Mesh(new THREE.SphereGeometry(this.raio, 64, 48), this.matCorpo);
    this.eixo.add(this.esfera);

    this.atm = atmosfera(this.raio, visual.atmosfera);
    this.forcaAtmosfera = (visual.forcaAtmosfera ?? 1) * (this.vazio ? 0.4 : 1);
    this.corpo.add(this.atm.malha);

    // anéis (textura dos anéis do Saturno do Big Bang)
    if (visual.anel && !this.vazio) {
      const r0 = this.raio * 1.42;
      const r1 = this.raio * 2.33;
      const geo = new THREE.RingGeometry(r0, r1, 160, 1);
      const p = geo.attributes.position;
      const uv = geo.attributes.uv;
      for (let i = 0; i < p.count; i++) uv.setXY(i, (Math.hypot(p.getX(i), p.getY(i)) - r0) / (r1 - r0), 0.5);
      this.anel = new THREE.Mesh(
        geo,
        new THREE.MeshStandardMaterial({
          map: tex.aneisPlaneta,
          emissiveMap: tex.aneisPlaneta,
          emissive: new THREE.Color('#ffffff'),
          emissiveIntensity: 0.4,
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: false,
          roughness: 1,
          metalness: 0,
        })
      );
      this.anel.rotation.x = -Math.PI / 2;
      this.eixo.add(this.anel);
    }

    // luas: uma por trabalho (rochas irregulares, como as luas do Saturno do Big Bang)
    this.luas = [];
    const cores = ['#c4b5d9', '#dccbe8', '#cbbfe0'];
    for (let k = 0; k < this.n; k++) {
      const geo = new THREE.IcosahedronGeometry(1.1 + rand() * 0.7, 3);
      const pp = geo.attributes.position;
      const v = new THREE.Vector3();
      for (let i = 0; i < pp.count; i++) {
        v.fromBufferAttribute(pp, i).multiplyScalar(0.92 + rand() * 0.12);
        pp.setXYZ(i, v.x, v.y, v.z);
      }
      geo.computeVertexNormals();
      const lua = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: cores[k % 3], roughness: 1, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.05 }));
      const plano = new THREE.Group();
      plano.rotation.set((rand() - 0.5) * 0.9, rand() * TAU, (rand() - 0.5) * 0.5);
      plano.add(lua);
      this.corpo.add(plano);
      this.luas.push({
        malha: lua,
        distancia: this.raio * (this.anel ? 2.7 : 1.9) + (k % 3) * 2.6 + rand() * 1.2,
        velocidade: (0.7 + rand() * 0.5) * (k % 2 ? -1 : 1),
        fase: rand() * TAU,
      });
    }

    // área de clique maior que o planeta (fácil de acertar, inclusive no celular)
    this.alvo = new THREE.Mesh(
      new THREE.SphereGeometry(Math.max(this.raio * 1.9, 9), 12, 8),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false })
    );
    this.alvo.userData.planeta = this;
    this.corpo.add(this.alvo);

    this.escala = 1;
    this.escalaAlvo = 1;
    this.destaque = 0;
    this.entrada = 0; // 0..1: animação de nascimento
    this.extensao = Planeta.extensaoPara(this.n, !!visual.anel);
  }

  /** tamanho pelo número de trabalhos (Júpiter do Big Bang tem raio 15) */
  static raioPara(n) {
    return n === 0 ? 3.2 : 4 + 1.6 * n;
  }
  /** raio ocupado pelo planeta com anéis e luas (para espaçar as órbitas) */
  static extensaoPara(n, anel) {
    const r = Planeta.raioPara(n);
    return n === 0 ? r * 1.6 : Math.max(r * (anel ? 2.33 : 1.2), r * (anel ? 2.7 : 1.9) + 6.5);
  }

  /** posição no mundo (para a câmera seguir) */
  posicaoMundo(out) {
    return this.corpo.getWorldPosition(out);
  }

  atualizar(dt, t, ritmo, apagarOrbita) {
    this.angulo += this.velocidade * dt * ritmo;
    // nascimento: sai de dentro do sol em espiral e chega na órbita
    const k = this.entrada;
    const sai = k <= 0 ? 0 : 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2); // ease out back
    const r = this.raioOrbita * Math.max(0, sai);
    const th = this.angulo - (1 - k) * 2.2;
    this.corpo.position.set(Math.cos(th) * r, 0, Math.sin(th) * r);
    this.corpo.visible = k > 0.001;

    this.esfera.rotation.y += dt * 0.3 * ritmo;
    this.escala += (this.escalaAlvo - this.escala) * (1 - Math.exp(-dt * 10));
    const tam = this.escala * Math.min(1, k * 1.6);
    this.eixo.scale.setScalar(tam);
    this.atm.malha.scale.setScalar(tam);
    // a atmosfera acende no hover e no foco (como os planetas do Big Bang quando a estrela passa perto)
    this.atm.u.uInt.value = (0.22 + this.destaque * 0.5) * this.forcaAtmosfera;

    for (const l of this.luas) {
      const a = l.fase + t * l.velocidade * (0.4 + 0.6 * ritmo);
      const d = l.distancia * this.escala * Math.min(1, k * 1.4);
      l.malha.position.set(Math.cos(a) * d, 0, Math.sin(a) * d);
      l.malha.scale.setScalar(Math.min(1, k * 1.4));
    }

    // órbita aparece junto com o planeta; mais forte no destaque, mais fraca quando outro está em foco
    const alvo = (this.opacidadeOrbita + this.destaque * 0.3) * (apagarOrbita ? 0.35 : 1) * Math.min(1, k * 1.5);
    this.matOrbita.opacity += (alvo - this.matOrbita.opacity) * (1 - Math.exp(-dt * 6));
  }
}
