import * as THREE from 'three';
import { materialPontos, materialLinhas, geometria, pontos, sprite, longeDaCamera, geometriaRocha } from './materiais.js';
import { criarRng, naEsfera, gauss, smoothstep } from './utils.js';

export const PALETA_UNIVERSO = ['#7c3aed', '#8b5cf6', '#a78bfa', '#c084fc', '#d946ef', '#c026d3', '#e879f9', '#6d28d9', '#818cf8', '#f0abfc'];

/**
 * Uma explosão completa. Quase tudo é animado na GPU em função do tempo desde a explosão,
 * então dá para "pular" para qualquer instante sem acumular estado.
 */
export class Explosao {
  constructor(cena, tex, op) {
    const o = {
      centro: new THREE.Vector3(),
      qualidade: 1,
      vMax: 230,
      arrasto: 1.1,
      poeira: 42000,
      raios: 700,
      nuvens: 40,
      galaxias: 7,
      estrelas: 90,
      fragmentos: 110,
      paleta: PALETA_UNIVERSO,
      semente: 1,
      flash: 700,
      onda: 420,
      tamanho: 1,
      decaiFlash: 2.2,
      ...op,
    };
    this.o = o;
    const rand = criarRng(o.semente);
    this.grupo = new THREE.Group();
    this.grupo.position.copy(o.centro);
    this.grupo.visible = false;
    cena.add(this.grupo);

    const paleta = o.paleta.map((h) => new THREE.Color(h));
    const v = new THREE.Vector3();

    // Jatos: direções preferidas, deixam a explosão filamentosa como a teia cósmica
    const jatos = Array.from({ length: 28 }, () => naEsfera(rand, new THREE.Vector3()));
    const direcao = (out, espalhamento = 0.2) => {
      if (rand() < 0.62) {
        const j = jatos[Math.floor(rand() * jatos.length)];
        out.set(j.x + gauss(rand) * espalhamento, j.y + gauss(rand) * espalhamento, j.z + gauss(rand) * espalhamento).normalize();
      } else naEsfera(rand, out);
      return out;
    };

    // ---- Clarão, brilho residual e ondas de choque
    this.flash = sprite(tex.brilho, '#ffffff', 1, 0);
    this.resto = sprite(tex.brilho, '#9b4dff', 1, 0);
    this.onda = sprite(tex.anel, '#d7c2ff', 1, 0);
    this.onda2 = sprite(tex.anel, '#c9a3ff', 1, 0);
    const matPlano = new THREE.MeshBasicMaterial({
      map: tex.anel,
      color: new THREE.Color('#e7b8ff'),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.anelPlano = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), matPlano);
    this.anelPlano.rotation.set(-1.15, 0.25, 0.1);
    this.grupo.add(this.resto, this.onda, this.onda2, this.anelPlano, this.flash);

    // ---- Poeira / plasma (dezenas de milhares de pontos)
    const nP = Math.round(o.poeira * o.qualidade);
    const dir = new Float32Array(nP * 3);
    const vel = new Float32Array(nP);
    const sem = new Float32Array(nP);
    const cor = new Float32Array(nP * 3);
    const tam = new Float32Array(nP);
    for (let i = 0; i < nP; i++) {
      direcao(v, 0.22);
      dir.set([v.x, v.y, v.z], i * 3);
      const casca = rand() < 0.3;
      vel[i] = o.vMax * (casca ? 0.82 + rand() * 0.18 : Math.cbrt(rand()) * 0.95);
      sem[i] = rand();
      const c = paleta[Math.floor(rand() * paleta.length)];
      const claro = 0.5 + rand() * 0.9;
      cor.set([c.r * claro, c.g * claro, c.b * claro], i * 3);
      tam[i] = (0.25 + rand() * rand() * 1.1) * o.tamanho;
    }
    this.uPoeira = { uT: { value: 0 }, uArrasto: { value: o.arrasto }, uOpac: { value: 1 } };
    this.poeira = pontos(
      geometria({ aDir: [dir, 3], aVel: [vel, 1], aSem: [sem, 1], aCor: [cor, 3], aTam: [tam, 1] }, nP),
      materialPontos({
        uniforms: this.uPoeira,
        perto: 3,
        cabecalho: /* glsl */ `
          attribute vec3 aDir; attribute float aVel; attribute float aSem; attribute vec3 aCor; attribute float aTam;
          uniform float uT; uniform float uArrasto; uniform float uOpac;
        `,
        corpo: /* glsl */ `
          float d = aVel * (1.0 - exp(-uArrasto * uT)) / uArrasto;
          float giro = (aSem - 0.5) * 0.7 * (1.0 - exp(-uT * 0.4));
          float cg = cos(giro); float sg = sin(giro);
          vec3 dd = vec3(aDir.x * cg - aDir.z * sg, aDir.y, aDir.x * sg + aDir.z * cg);
          vec3 turb = vec3(sin(aSem * 91.0 + uT * 0.7), sin(aSem * 57.0 + uT * 0.6), sin(aSem * 33.0 + uT * 0.8)) * 0.05 * d;
          pos = dd * d + turb;
          float quente = exp(-uT * (1.6 + aSem * 2.6));
          cor = mix(aCor, vec3(0.96, 0.9, 1.0) * 1.8, quente);
          tam = aTam * (1.0 + 2.5 * quente);
          alfa = uOpac * (0.5 + 0.5 * quente) * smoothstep(0.0, 0.04, uT);
        `,
      })
    );
    this.grupo.add(this.poeira);

    // ---- Raios de luz (rastros rápidos saindo do centro)
    const nR = Math.round(o.raios * o.qualidade);
    const rDir = new Float32Array(nR * 6);
    const rVel = new Float32Array(nR * 2);
    const rPonta = new Float32Array(nR * 2);
    const rSem = new Float32Array(nR * 2);
    for (let i = 0; i < nR; i++) {
      direcao(v, 0.3);
      const s = rand();
      const vv = o.vMax * (0.9 + rand() * 1.6);
      for (let k = 0; k < 2; k++) {
        rDir.set([v.x, v.y, v.z], (i * 2 + k) * 3);
        rVel[i * 2 + k] = vv;
        rPonta[i * 2 + k] = k;
        rSem[i * 2 + k] = s;
      }
    }
    this.uRaios = { uT: { value: 0 } };
    this.raios = new THREE.LineSegments(
      geometria({ aDir: [rDir, 3], aVel: [rVel, 1], aPonta: [rPonta, 1], aSem: [rSem, 1] }, nR * 2),
      materialLinhas({
        uniforms: this.uRaios,
        cabecalho: /* glsl */ `
          attribute vec3 aDir; attribute float aVel; attribute float aPonta; attribute float aSem;
          uniform float uT;
        `,
        corpo: /* glsl */ `
          float k = 2.0;
          float tc = aPonta > 0.5 ? uT : max(uT - 0.1 - aSem * 0.12, 0.0);
          pos = aDir * aVel * (1.0 - exp(-k * tc)) / k;
          alfa = exp(-uT * (1.1 + aSem)) * aPonta * smoothstep(0.0, 0.03, uT);
          cor = mix(vec3(0.7, 0.45, 1.0), vec3(0.92, 0.78, 1.0), aSem) * 2.0;
        `,
      })
    );
    this.raios.frustumCulled = false;
    this.grupo.add(this.raios);

    // ---- Nuvens de gás coloridas
    this.nuvens = [];
    for (let i = 0; i < o.nuvens; i++) {
      const c = paleta[Math.floor(rand() * paleta.length)];
      const s = sprite(tex.nuvens[i % tex.nuvens.length], c, 1, 0);
      s.material.rotation = rand() * Math.PI * 2;
      s.userData = {
        dir: direcao(new THREE.Vector3(), 0.25),
        vel: o.vMax * (0.35 + rand() * 0.6),
        tam: (55 + rand() * 90) * o.tamanho,
        opac: 0.07 + rand() * 0.12,
        giro: (rand() - 0.5) * 0.15,
        rot0: s.material.rotation,
      };
      this.grupo.add(s);
      this.nuvens.push(s);
    }

    // ---- Protogaláxias: pequenos redemoinhos que saem voando
    this.galaxias = [];
    if (o.galaxias > 0) {
      const nG = Math.round(900 * o.qualidade);
      const gPos = new Float32Array(nG * 3);
      const gCor = new Float32Array(nG * 3);
      const gTam = new Float32Array(nG);
      const cA = new THREE.Color('#f7e8ff');
      const cB = new THREE.Color('#a78bfa');
      const cC = new THREE.Color('#f0abfc');
      for (let i = 0; i < nG; i++) {
        const braco = i % 2;
        const r = Math.pow(rand(), 0.8) * 9;
        const a = braco * Math.PI + r * 0.55 + gauss(rand) * 0.3;
        gPos.set([Math.cos(a) * r, gauss(rand) * 0.4, Math.sin(a) * r], i * 3);
        const c = r < 2 ? cA : rand() < 0.15 ? cC : cB;
        gCor.set([c.r, c.g, c.b], i * 3);
        gTam[i] = 0.18 + rand() * 0.35;
      }
      const uG = { uOpac: { value: 1 } };
      const matG = materialPontos({
        uniforms: uG,
        cabecalho: 'attribute vec3 aCor; attribute float aTam; uniform float uOpac;',
        corpo: 'pos = position; cor = aCor * 1.2; tam = aTam; alfa = uOpac;',
      });
      this.uGalaxias = uG;
      const geoG = new THREE.BufferGeometry();
      geoG.setAttribute('position', new THREE.BufferAttribute(gPos, 3));
      geoG.setAttribute('aCor', new THREE.BufferAttribute(gCor, 3));
      geoG.setAttribute('aTam', new THREE.BufferAttribute(gTam, 1));
      for (let i = 0; i < o.galaxias; i++) {
        const g = new THREE.Group();
        const p = pontos(geoG, matG);
        const nucleo = sprite(tex.brilho, '#e9c6ff', 9, 0.9);
        g.add(p, nucleo);
        g.rotation.set(rand() * Math.PI, rand() * Math.PI, 0);
        const dg = direcao(new THREE.Vector3(), 0.15);
        if (dg.z > 0.35) dg.z = -dg.z;
        g.userData = { dir: dg.normalize(), vel: o.vMax * (0.5 + rand() * 0.45), giro: 0.5 + rand() * 0.6, eixo: g.rotation.clone() };
        this.grupo.add(g);
        this.galaxias.push(g);
      }
    }

    // ---- Estrelas recém-nascidas com raios em cruz
    const nE = o.estrelas;
    if (nE > 0) {
      const eDir = new Float32Array(nE * 3);
      const eVel = new Float32Array(nE);
      const eSem = new Float32Array(nE);
      const eCor = new Float32Array(nE * 3);
      const cs = ['#ffffff', '#e9d5ff', '#ddd6fe', '#f5d0fe'].map((h) => new THREE.Color(h));
      for (let i = 0; i < nE; i++) {
        direcao(v, 0.3);
        eDir.set([v.x, v.y, v.z], i * 3);
        eVel[i] = o.vMax * (0.3 + rand() * 0.7);
        eSem[i] = rand();
        const c = cs[Math.floor(rand() * cs.length)];
        eCor.set([c.r, c.g, c.b], i * 3);
      }
      this.uEstrelas = { uT: { value: 0 }, uArrasto: { value: o.arrasto * 1.15 } };
      this.estrelas = pontos(
        geometria({ aDir: [eDir, 3], aVel: [eVel, 1], aSem: [eSem, 1], aCor: [eCor, 3] }, nE),
        materialPontos({
          uniforms: this.uEstrelas,
          forma: 'estrela',
          cabecalho: /* glsl */ `
            attribute vec3 aDir; attribute float aVel; attribute float aSem; attribute vec3 aCor;
            uniform float uT; uniform float uArrasto;
          `,
          corpo: /* glsl */ `
            pos = aDir * aVel * (1.0 - exp(-uArrasto * uT)) / uArrasto;
            cor = aCor * 1.3;
            tam = (3.5 + aSem * 5.0) * (0.75 + 0.25 * sin(uT * (2.0 + aSem * 4.0) + aSem * 60.0));
            alfa = smoothstep(0.6, 2.2, uT + aSem * 0.8);
          `,
        })
      );
      this.grupo.add(this.estrelas);
    }

    // ---- Fragmentos de matéria incandescente (rochas que passam voando)
    this.fragmentos = null;
    if (o.fragmentos > 0) {
      const geo = geometriaRocha(rand);
      const mat = new THREE.MeshStandardMaterial({
        color: '#7a6888',
        emissive: new THREE.Color('#b44bff'),
        emissiveIntensity: 3,
        roughness: 0.85,
        flatShading: true,
      });
      const n = Math.round(o.fragmentos * Math.max(0.5, o.qualidade));
      this.fragmentos = new THREE.InstancedMesh(geo, mat, n);
      this.fragmentos.frustumCulled = false;
      this.dadosFrag = [];
      for (let i = 0; i < n; i++) {
        // um terço vem na direção da câmera inicial (passa raspando)
        if (rand() < 0.33) v.set(gauss(rand) * 0.35, gauss(rand) * 0.25, 1).normalize();
        else naEsfera(rand, v);
        this.dadosFrag.push({
          dir: v.clone(),
          vel: o.vMax * (0.35 + rand() * 0.9),
          tam: 0.3 + Math.pow(rand(), 3) * 2.2,
          eixo: naEsfera(rand, new THREE.Vector3()),
          giro: (rand() - 0.5) * 6,
          escala: new THREE.Vector3(1 + rand() * 0.6, 0.7 + rand() * 0.4, 1),
        });
      }
      this.grupo.add(this.fragmentos);
      this._m = new THREE.Matrix4();
      this._q = new THREE.Quaternion();
      this._p = new THREE.Vector3();
      this._s = new THREE.Vector3();
    }

    // Luz do clarão (ilumina os fragmentos)
    this.luz = new THREE.PointLight('#dcb8ff', 0, 0, 1.4);
    this.grupo.add(this.luz);
  }

  /** te = segundos desde a explosão (negativo = ainda não explodiu). */
  atualizar(te) {
    if (te < 0) {
      this.grupo.visible = false;
      this.luz.intensity = 0;
      return;
    }
    const o = this.o;
    this.grupo.visible = true;

    // Clarão
    const fs = 1 - Math.exp(-te * 14);
    this.flash.scale.setScalar(o.flash * fs + 1);
    this.flash.material.opacity = Math.exp(-te * o.decaiFlash);
    this.resto.scale.setScalar(o.flash * 0.12 * (1 + te * 0.08));
    this.resto.material.opacity = 0.5 * Math.exp(-te * 0.45) * smoothstep(0, 0.4, te) * longeDaCamera(this.resto);

    // Ondas de choque
    const r = o.onda * (1 - Math.exp(-te * 1.9));
    this.onda.scale.setScalar(r * 2 + 1);
    this.onda.material.opacity = 0.9 * Math.exp(-te * 1.1);
    const r2 = o.onda * 0.7 * (1 - Math.exp(-(te - 0.25) * 1.5));
    this.onda2.scale.setScalar(Math.max(1, r2 * 2));
    this.onda2.material.opacity = te > 0.25 ? 0.6 * Math.exp(-(te - 0.25) * 1.2) : 0;
    this.anelPlano.scale.setScalar(r * 1.25 + 1);
    this.anelPlano.material.opacity = 0.7 * Math.exp(-te * 1.8);

    this.uPoeira.uT.value = te;
    this.uRaios.uT.value = te;
    this.raios.visible = te < 6;
    if (this.uEstrelas) this.uEstrelas.uT.value = te;

    // Nuvens
    for (const s of this.nuvens) {
      const d = s.userData;
      const dist = (d.vel * (1 - Math.exp(-0.8 * te))) / 0.8;
      s.position.copy(d.dir).multiplyScalar(dist);
      s.scale.setScalar(d.tam * (0.15 + 0.85 * (1 - Math.exp(-0.6 * te))));
      s.material.opacity =
        d.opac * smoothstep(0.1, 1.4, te) * (0.6 + 0.4 * Math.exp(-te * 0.25)) * this.uPoeira.uOpac.value * longeDaCamera(s);
      s.material.rotation = d.rot0 + te * d.giro;
    }

    // Protogaláxias
    for (const g of this.galaxias) {
      const d = g.userData;
      const dist = (d.vel * (1 - Math.exp(-0.9 * te))) / 0.9;
      g.position.copy(d.dir).multiplyScalar(dist);
      g.scale.setScalar(smoothstep(0.2, 3.0, te) * 1.4 + 0.01);
      g.rotation.set(d.eixo.x, d.eixo.y + te * d.giro, d.eixo.z);
    }

    // Fragmentos
    if (this.fragmentos) {
      const vivo = te < 9;
      this.fragmentos.visible = vivo;
      if (vivo) {
        this.fragmentos.material.emissiveIntensity = 0.04 + 0.7 * Math.exp(-te * 2.2);
        this.dadosFrag.forEach((d, i) => {
          const dist = (d.vel * (1 - Math.exp(-0.45 * te))) / 0.45;
          this._p.copy(d.dir).multiplyScalar(dist);
          this._q.setFromAxisAngle(d.eixo, te * d.giro);
          this._s.copy(d.escala).multiplyScalar(d.tam * smoothstep(0, 0.15, te));
          this._m.compose(this._p, this._q, this._s);
          this.fragmentos.setMatrixAt(i, this._m);
        });
        this.fragmentos.instanceMatrix.needsUpdate = true;
      }
    }

    this.luz.intensity = 2500 * Math.exp(-te * 1.1) * smoothstep(0, 0.05, te);
  }

  /** Esmaece a poeira (usado quando a câmera foca na estrela). */
  set opacidade(v) {
    this.uPoeira.uOpac.value = v;
  }
}
