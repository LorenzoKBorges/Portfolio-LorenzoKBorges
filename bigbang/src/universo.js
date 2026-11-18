import * as THREE from 'three';
import { materialPontos, geometria, pontos, sprite, longeDaCamera, globais } from './materiais.js';
import { criarRng, gauss, naEsfera, smoothstep, lerp } from './utils.js';

// O universo depois do Big Bang: céu, a galáxia e Saturno.
// Cada "marco" tem: centro, raio (alcance do destaque), atualizar(t, destaque, posEstrela) e formacao (0..1).

/** Céu de fundo: estrelas distantes e nebulosidade bem fraca. Acompanha a câmera (sem paralaxe). */
export class Ceu {
  constructor(cena, tex, q) {
    this.grupo = new THREE.Group();
    cena.add(this.grupo);
    const rand = criarRng(101);
    const n = Math.round(8000 * q);
    const pos = new Float32Array(n * 3);
    const cor = new Float32Array(n * 3);
    const tam = new Float32Array(n);
    const sem = new Float32Array(n);
    const cs = ['#ffffff', '#f3e8ff', '#e9d5ff', '#ddd6fe', '#c4b5fd', '#f5d0fe', '#e2d1ff'].map((h) => new THREE.Color(h));
    const v = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      naEsfera(rand, v);
      // um pouco mais de estrelas perto de uma faixa (como a Via Láctea)
      if (rand() < 0.35) v.y *= 0.18;
      v.normalize().multiplyScalar(3000);
      pos.set([v.x, v.y, v.z], i * 3);
      const c = cs[Math.floor(rand() * cs.length)];
      const b = 0.4 + rand() * 0.9;
      cor.set([c.r * b, c.g * b, c.b * b], i * 3);
      tam[i] = 4.5 + Math.pow(rand(), 4) * 22;
      sem[i] = rand();
    }
    this.u = { uOpac: { value: 0 }, uT: { value: 0 } };
    this.estrelas = pontos(
      geometria({ position: [pos, 3], aCor: [cor, 3], aTam: [tam, 1], aSem: [sem, 1] }, n),
      materialPontos({
        uniforms: this.u,
        cabecalho: 'attribute vec3 aCor; attribute float aTam; attribute float aSem; uniform float uOpac; uniform float uT;',
        corpo: /* glsl */ `
          pos = position; cor = aCor * 1.15; tam = aTam;
          alfa = uOpac * (0.7 + 0.3 * sin(uT * (0.8 + aSem * 2.5) + aSem * 80.0));
        `,
      })
    );
    this.grupo.add(this.estrelas);

    this.brumas = [];
    const brumas = [
      ['#6d28d9', [-0.6, 0.15, -0.8], 2800, 0.3],
      ['#7e22ce', [0.7, -0.1, -0.7], 2500, 0.26],
      ['#a21caf', [0.1, 0.4, -0.9], 2000, 0.18],
      ['#4c1d95', [-0.8, -0.3, 0.5], 2800, 0.28],
      ['#6d28d9', [0.6, 0.2, 0.75], 2600, 0.26],
      ['#581c87', [0.0, -0.7, 0.2], 3000, 0.3],
      ['#9333ea', [-0.3, 0.8, 0.1], 2400, 0.2],
      ['#5b21b6', [0.9, 0.1, -0.1], 2600, 0.24],
    ];
    brumas.forEach(([c, d, s, op], i) => {
      const b = sprite(tex.nuvens[i % tex.nuvens.length], c, s, 0);
      b.position.set(...d).normalize().multiplyScalar(2700);
      b.userData.op = op;
      this.grupo.add(b);
      this.brumas.push(b);
    });
  }

  atualizar(t, camera, opac) {
    this.grupo.position.copy(camera.position);
    this.u.uOpac.value = opac;
    this.u.uT.value = t;
    this.grupo.visible = opac > 0.001;
    for (const b of this.brumas) b.material.opacity = b.userData.op * opac * 0.8;
  }
}

/** Quantos braços a galáxia tem. */
export const BRACOS = 6;

/** Ângulo (rad) do centro do braço `braco` a uma distância `r` do núcleo (espiral logarítmica). */
function anguloDoBraco(braco, r) {
  return (braco * Math.PI * 2) / BRACOS + Math.log(r / 6) * 1.9;
}

/** Nebulosa colorida num braço da galáxia: nuvens de gás e estrelas jovens. Acende quando a estrela passa. */
class NebulosaGalactica {
  constructor(pai, tex, q, local) {
    this.grupo = new THREE.Group();
    this.grupo.position.copy(local);
    pai.add(this.grupo);
    const rand = criarRng(212);
    const cores = ['#ff4fd8', '#c026d3', '#a855f7', '#7c3aed', '#f472b6', '#22d3ee', '#e879f9'];
    this.puffs = [];
    for (let i = 0; i < 30; i++) {
      const s = sprite(tex.nuvens[i % tex.nuvens.length], cores[i % cores.length], 18 + rand() * 26, 0);
      s.position.set(gauss(rand) * 15, gauss(rand) * 4, gauss(rand) * 15);
      s.material.rotation = rand() * Math.PI * 2;
      s.userData = { op: 0.09 + rand() * 0.11, giro: (rand() - 0.5) * 0.08, rot0: s.material.rotation };
      this.grupo.add(s);
      this.puffs.push(s);
    }
    const n = Math.round(320 * Math.max(0.5, q));
    const pos = new Float32Array(n * 3);
    const sem = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos.set([gauss(rand) * 14, gauss(rand) * 4, gauss(rand) * 14], i * 3);
      sem[i] = rand();
    }
    this.u = { uOpac: { value: 0 }, uT: { value: 0 }, uDestaque: { value: 0 } };
    this.grupo.add(
      pontos(
        geometria({ position: [pos, 3], aSem: [sem, 1] }, n),
        materialPontos({
          uniforms: this.u,
          perto: 4,
          cabecalho: 'attribute float aSem; uniform float uOpac; uniform float uT; uniform float uDestaque;',
          corpo: /* glsl */ `
            pos = position;
            cor = mix(vec3(0.82, 0.9, 1.0), vec3(1.0, 0.78, 0.98), aSem) * (1.3 + uDestaque * 0.9);
            tam = 0.35 + aSem * 0.6;
            alfa = uOpac * (0.65 + 0.35 * sin(uT * 3.0 + aSem * 40.0));
          `,
        })
      )
    );
    this._v = new THREE.Vector3();
    this._w = new THREE.Vector3();
  }

  atualizar(t, opac, estrela) {
    this.grupo.visible = opac > 0.001;
    if (!this.grupo.visible) return;
    const centro = this.grupo.getWorldPosition(this._v);
    const perto = smoothstep(70, 8, centro.distanceTo(estrela));
    // com a câmera dentro do gás, cada nuvem fica bem mais fraca (senão a tela estoura de rosa)
    const dentro = smoothstep(45, 12, centro.distanceTo(globais.camPos));
    this.u.uOpac.value = opac;
    this.u.uT.value = t;
    this.u.uDestaque.value = perto;
    for (const s of this.puffs) {
      const d = s.userData;
      const longe = smoothstep(s.scale.x * 0.3, s.scale.x * 1.3, s.getWorldPosition(this._w).distanceTo(globais.camPos));
      s.material.opacity = d.op * opac * (1 + perto * 0.5) * (1 - 0.55 * dentro) * longe;
      s.material.rotation = d.rot0 + t * d.giro;
    }
  }
}

/** Buraco negro supermassivo no núcleo da galáxia, com disco de acreção girando. */
class BuracoNegroGalactico {
  constructor(pai, tex, q) {
    this.grupo = new THREE.Group();
    this.grupo.rotation.set(0.45, 0, 0.2); // disco inclinado em relação ao disco da galáxia
    pai.add(this.grupo);
    this.horizonte = new THREE.Mesh(new THREE.SphereGeometry(5, 40, 28), new THREE.MeshBasicMaterial({ color: '#000000' }));
    this.grupo.add(this.horizonte);
    const rand = criarRng(616);
    const n = Math.round(14000 * q);
    const aR = new Float32Array(n);
    const aAng = new Float32Array(n);
    const aY = new Float32Array(n);
    const aTam = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      aR[i] = 7 + 26 * Math.pow(rand(), 1.6);
      aAng[i] = rand() * Math.PI * 2;
      aY[i] = gauss(rand) * 0.2 * (aR[i] / 12);
      aTam[i] = 0.14 + rand() * 0.28;
    }
    this.u = { uOpac: { value: 0 }, uT: { value: 0 }, uDestaque: { value: 0 } };
    this.grupo.add(
      pontos(
        geometria({ aR: [aR, 1], aAng: [aAng, 1], aY: [aY, 1], aTam: [aTam, 1] }, n),
        materialPontos({
          uniforms: this.u,
          perto: 5,
          cabecalho: /* glsl */ `
            attribute float aR; attribute float aAng; attribute float aY; attribute float aTam;
            uniform float uOpac; uniform float uT; uniform float uDestaque;
          `,
          corpo: /* glsl */ `
            float ang = aAng + uT * 16.0 / pow(aR, 1.5);
            pos = vec3(cos(ang) * aR, aY, sin(ang) * aR);
            float quente = 1.0 - smoothstep(7.0, 33.0, aR);
            cor = mix(vec3(0.42, 0.16, 0.85), vec3(0.95, 0.35, 0.85), smoothstep(0.2, 0.6, quente));
            cor = mix(cor, vec3(1.0, 0.94, 1.0), smoothstep(0.75, 1.0, quente));
            cor *= (0.6 + 1.6 * quente) * (1.0 + uDestaque * 0.6);
            tam = aTam;
            alfa = uOpac;
          `,
        })
      )
    );
    this.anelFoton = sprite(tex.anel, '#f5d0fe', 12, 0);
    this.brilho = sprite(tex.brilho, '#c026d3', 70, 0);
    this.grupo.add(this.brilho, this.anelFoton);
    this._v = new THREE.Vector3();
  }

  atualizar(t, opac, estrela, ampliada) {
    // na lupa a esfera preta (opaca) não pode ficar no caminho: some logo
    this.grupo.visible = opac > 0.001 && ampliada < 3;
    if (!this.grupo.visible) return;
    const perto = smoothstep(80, 15, this.grupo.getWorldPosition(this._v).distanceTo(estrela));
    this.u.uOpac.value = opac;
    this.u.uT.value = t;
    this.u.uDestaque.value = perto;
    this.anelFoton.material.opacity = (0.55 + perto * 0.3) * opac;
    this.brilho.material.opacity = (0.16 + perto * 0.12) * opac * longeDaCamera(this.brilho);
  }
}

/**
 * Galáxia espiral com três braços, um buraco negro no núcleo e uma nebulosa num dos braços.
 * (Ela não gira: em poucos segundos não daria para notar, e assim os braços ficam onde a rota espera.)
 */
export class Galaxia {
  constructor(cena, tex, q, centro) {
    this.tex = tex;
    this.q = q;
    this.centro = centro.clone();
    this.raio = 130;
    this.grupo = new THREE.Group();
    this.grupo.position.copy(centro);
    cena.add(this.grupo);
    const R = 115;
    const rand = criarRng(303);
    const n = Math.round(40000 * q);
    const aR = new Float32Array(n);
    const aAng = new Float32Array(n);
    const aY = new Float32Array(n);
    const aCor = new Float32Array(n * 3);
    const aTam = new Float32Array(n);
    const aSem = new Float32Array(n);
    const cNucleo = new THREE.Color('#fbeaff');
    const cDentro = new THREE.Color('#e4d4ff');
    const cFora = new THREE.Color('#9b7bff');
    const cRosa = new THREE.Color('#f06fe0');
    const c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      let r;
      let a;
      let y;
      let tam = 0.3 + rand() * 0.45;
      if (rand() < 0.18) {
        // bojo central (com um vazio no meio, onde fica o buraco negro)
        r = 8 + Math.abs(gauss(rand)) * 12;
        a = rand() * Math.PI * 2;
        y = gauss(rand) * 6 * Math.exp(-r / 14);
        c.copy(cNucleo).lerp(cDentro, rand() * 0.4);
      } else {
        const braco = Math.floor(rand() * BRACOS);
        r = R * (0.08 + 0.92 * Math.pow(rand(), 0.8));
        // (com 6 braços cada um é mais fino, para não se misturarem)
        a = anguloDoBraco(braco, r) + gauss(rand) * 0.17 * (1 - (r / R) * 0.3);
        y = gauss(rand) * 1.6 * (1 - (r / R) * 0.5);
        c.copy(cDentro).lerp(cFora, Math.min(1, r / R + rand() * 0.2));
        if (rand() < 0.06) {
          c.copy(cRosa);
          tam *= 1.8;
        }
      }
      aR[i] = r;
      aAng[i] = a;
      aY[i] = y;
      const b = 0.55 + rand() * 0.7;
      aCor.set([c.r * b, c.g * b, c.b * b], i * 3);
      aTam[i] = tam;
      aSem[i] = rand();
    }
    this.u = {
      uOpac: { value: 0 },
      uT: { value: 0 },
      uDestaque: { value: 0 },
      uTamMul: { value: 1 },
      uBolha: { value: new THREE.Vector3(1e5, 0, 0) },
      uBolhaR: { value: 0 },
    };
    this.ampliada = 1;
    this.someNaLupa = 1;
    this.disco = pontos(
      geometria({ aR: [aR, 1], aAng: [aAng, 1], aY: [aY, 1], aCor: [aCor, 3], aTam: [aTam, 1], aSem: [aSem, 1] }, n),
      materialPontos({
        uniforms: this.u,
        perto: 7,
        cabecalho: /* glsl */ `
          attribute float aR; attribute float aAng; attribute float aY; attribute vec3 aCor; attribute float aTam; attribute float aSem;
          uniform float uOpac; uniform float uT; uniform float uDestaque; uniform float uTamMul;
          uniform vec3 uBolha; uniform float uBolhaR;
        `,
        corpo: /* glsl */ `
          pos = vec3(cos(aAng) * aR, aY, sin(aAng) * aR);
          cor = aCor * (1.0 + uDestaque * 0.35) * (1.0 + 0.5 * smoothstep(2.0, 20.0, uTamMul));
          tam = aTam * (1.0 + uDestaque * 0.2) * uTamMul;
          alfa = uOpac * (0.85 + 0.15 * sin(uT * 2.0 + aSem * 50.0));
          // em volta do sistema solar não há estrelas (assim, ampliado, nenhuma fica no meio dele)
          alfa *= smoothstep(uBolhaR * 0.7, uBolhaR, distance(pos, uBolha));
        `,
      })
    );
    this.grupo.add(this.disco);
    this.nucleo = sprite(tex.brilho, '#f0c8ff', 50, 0);
    this.halo = sprite(tex.brilho, '#8b4dff', 320, 0);
    this.grupo.add(this.halo, this.nucleo);
    this.buraco = new BuracoNegroGalactico(this.grupo, tex, q);
    this.nebulosa = null;
  }

  /** Coloca a galáxia num lugar, com uma orientação (quaternion). */
  posicionar(centro, quaternion) {
    this.centro.copy(centro);
    this.grupo.position.copy(centro);
    this.grupo.quaternion.copy(quaternion);
    this.grupo.updateMatrixWorld();
  }

  /** Cria a nebulosa no braço `braco`, a uma distância `r` do núcleo. */
  criarNebulosa(braco, r) {
    this.nebulosa = new NebulosaGalactica(this.grupo, this.tex, this.q, Galaxia.localDoBraco(braco, r).setY(2));
  }

  /**
   * A "lupa": amplia a galáxia `fator` vezes em volta do ponto `pivo` (onde está o sistema solar).
   * As estrelas se espalham e crescem um pouco; depois a galáxia some e o sistema solar fica limpo.
   */
  /** Esvazia uma bolha de raio `r` (coordenadas da galáxia) em volta do sistema solar. */
  definirBolha(local, r) {
    this.u.uBolha.value.copy(local);
    this.u.uBolhaR.value = r;
  }

  ampliar(pivo, fator, distanciaCamera = 0) {
    this.ampliada = fator;
    // as estrelas não crescem junto com a ampliação: elas se espalham, passam pela câmera e as de
    // longe viram poeira. A galáxia só é desligada no fim, quando o que sobrou já é quase invisível
    this.someNaLupa = 1 - smoothstep(150, 390, fator);
    // estrelas muito perto da câmera somem (passam por ela)
    this.disco.material.uniforms.uPerto.value = Math.max(7, distanciaCamera * 0.3);
    this.grupo.position.copy(this.centro).sub(pivo).multiplyScalar(fator).add(pivo);
    this.grupo.scale.setScalar(fator);
    this.u.uTamMul.value = Math.pow(fator, 0.4);
  }

  /** Centro do braço em coordenadas da galáxia (plano do disco: y = 0). */
  static localDoBraco(braco, r, out = new THREE.Vector3()) {
    const a = anguloDoBraco(braco, r);
    return out.set(Math.cos(a) * r, 0, Math.sin(a) * r);
  }

  /** Centro do braço `braco` (0 a BRACOS - 1) a uma distância `r` do núcleo, no mundo. */
  pontoDoBraco(braco, r, out = new THREE.Vector3()) {
    this.grupo.updateMatrixWorld();
    return Galaxia.localDoBraco(braco, r, out).applyMatrix4(this.grupo.matrixWorld);
  }

  /** Ponto em coordenadas da galáxia -> mundo. */
  mundo(local, out = new THREE.Vector3()) {
    this.grupo.updateMatrixWorld();
    return out.copy(local).applyMatrix4(this.grupo.matrixWorld);
  }

  get normal() {
    return new THREE.Vector3(0, 1, 0).applyQuaternion(this.grupo.quaternion);
  }

  atualizar(t, destaque, estrela, formacao) {
    const opac = formacao * this.someNaLupa;
    this.grupo.visible = opac > 0.001;
    this.u.uOpac.value = opac;
    this.u.uT.value = t;
    this.u.uDestaque.value = destaque;
    // ampliada, o brilho do núcleo cobriria tudo: some aos poucos
    const ampliacao = smoothstep(6, 1.5, this.ampliada);
    this.nucleo.material.opacity = (0.4 + destaque * 0.2) * formacao * longeDaCamera(this.nucleo) * ampliacao;
    this.halo.material.opacity = (0.1 + destaque * 0.05) * formacao * longeDaCamera(this.halo) * ampliacao;
    this.buraco.atualizar(t, opac, estrela, this.ampliada);
    if (this.nebulosa) this.nebulosa.atualizar(t, opac, estrela);
  }
}

/** Saturno: gigante gasoso com anéis e duas luas, iluminado pela luz da própria estrela. */
export class Planeta {
  constructor(cena, tex, q, centro) {
    this.centro = centro.clone();
    this.raio = 70;
    this.raioOrbita = 36;
    this.grupo = new THREE.Group();
    this.grupo.position.copy(centro);
    this.grupo.rotation.set(0.28, 0, 0.42);
    cena.add(this.grupo);

    this.corpo = new THREE.Mesh(
      new THREE.SphereGeometry(12, 64, 48),
      // brilho próprio leve: as faixas aparecem mesmo no lado que a estrela não ilumina
      new THREE.MeshStandardMaterial({
        map: tex.planeta,
        emissiveMap: tex.planeta,
        emissive: new THREE.Color('#ffffff'),
        emissiveIntensity: 0.22,
        roughness: 0.95,
        metalness: 0,
      })
    );
    this.grupo.add(this.corpo);

    // atmosfera: brilho na borda (efeito Fresnel)
    this.uAtm = { uCor: { value: new THREE.Color('#c9a6ff') }, uInt: { value: 0.5 } };
    const atm = new THREE.Mesh(
      new THREE.SphereGeometry(12.8, 48, 32),
      new THREE.ShaderMaterial({
        uniforms: this.uAtm,
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
            float f = pow(1.0 - max(dot(normalize(vN), normalize(vV)), 0.0), 2.6);
            gl_FragColor = vec4(uCor * f * uInt, 1.0);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    this.grupo.add(atm);

    // anéis
    const geoAnel = new THREE.RingGeometry(17, 28, 160, 1);
    const p = geoAnel.attributes.position;
    const uv = geoAnel.attributes.uv;
    for (let i = 0; i < p.count; i++) {
      const r = Math.hypot(p.getX(i), p.getY(i));
      uv.setXY(i, (r - 17) / 11, 0.5);
    }
    this.anel = new THREE.Mesh(
      geoAnel,
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
    this.grupo.add(this.anel);

    // luas
    this.luas = [];
    const rand = criarRng(404);
    for (const [raio, dist, vel, cor] of [
      [2.2, 95, 0.22, '#c4b5d9'],
      [1.4, 112, -0.16, '#dccbe8'],
    ]) {
      const geo = new THREE.IcosahedronGeometry(raio, 3);
      const pp = geo.attributes.position;
      const v = new THREE.Vector3();
      for (let i = 0; i < pp.count; i++) {
        v.fromBufferAttribute(pp, i).multiplyScalar(0.92 + rand() * 0.12);
        pp.setXYZ(i, v.x, v.y, v.z);
      }
      geo.computeVertexNormals();
      const lua = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: cor, roughness: 1 }));
      lua.userData = { dist, vel, fase: rand() * Math.PI * 2 };
      this.grupo.add(lua);
      this.luas.push(lua);
    }
  }

  get normal() {
    return new THREE.Vector3(0, 1, 0).applyQuaternion(this.grupo.quaternion);
  }

  /** Inclina o planeta (e os anéis) para o eixo apontar para `normal`. */
  inclinarAneis(normal) {
    this.grupo.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal.clone().normalize());
  }

  atualizar(t, destaque, estrela, formacao) {
    this.grupo.visible = formacao > 0.001;
    this.corpo.rotation.y = t * 0.05;
    this.uAtm.uInt.value = (0.08 + destaque * 0.14) * formacao;
    for (const l of this.luas) {
      const a = l.userData.fase + t * l.userData.vel;
      l.position.set(Math.cos(a) * l.userData.dist, Math.sin(a * 0.7) * 3, Math.sin(a) * l.userData.dist);
    }
  }
}

/** Poeira cósmica espalhada ao longo do caminho: dá sensação de velocidade (paralaxe). */
export class PoeiraViagem {
  constructor(cena, q, viagem) {
    const rand = criarRng(707);
    const n = Math.round(9000 * q);
    const pos = new Float32Array(n * 3);
    const cor = new Float32Array(n * 3);
    const tam = new Float32Array(n);
    const v = new THREE.Vector3();
    const p = new THREE.Vector3();
    const cs = ['#b9a7ff', '#c084fc', '#e7d9ff', '#f0abfc'].map((h) => new THREE.Color(h));
    for (let i = 0; i < n; i++) {
      viagem.pontoBase(viagem.sAleatorio(rand), p);
      naEsfera(rand, v);
      const r = 3 + Math.cbrt(rand()) * 65;
      p.addScaledVector(v, r);
      pos.set([p.x, p.y, p.z], i * 3);
      const c = cs[Math.floor(rand() * cs.length)];
      cor.set([c.r, c.g, c.b], i * 3);
      tam[i] = 0.1 + rand() * rand() * 0.45;
    }
    this.u = { uOpac: { value: 0 } };
    this.pontos = pontos(
      geometria({ position: [pos, 3], aCor: [cor, 3], aTam: [tam, 1] }, n),
      materialPontos({
        uniforms: this.u,
        perto: 2,
        cabecalho: 'attribute vec3 aCor; attribute float aTam; uniform float uOpac;',
        corpo: 'pos = position; cor = aCor; tam = aTam; alfa = uOpac * 0.8;',
      })
    );
    cena.add(this.pontos);
  }

  atualizar(opac) {
    this.pontos.visible = opac > 0.001;
    this.u.uOpac.value = opac;
  }
}
