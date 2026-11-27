/*
 * O olho do repositório olho_port (github.com/LorenzoKBorges/olho_port), igual ao original:
 * mesmas medidas, cores, shaders, piscada, falha (glitch) e clique.
 * Única mudança: posicionar() recebe também o tamanho de referência das linhas (escalaRef),
 * porque aqui o olho é medido em pixels da página.
 *
 * O olho é um desenho feito de luz (sem cores por dentro):
 *  - as pálpebras são duas linhas de luz lilás que se cruzam um pouco além das pontas, com um halo
 *    violeta em volta;
 *  - por dentro o olho é transparente;
 *  - a íris é só o contorno de um círculo e a pupila, o contorno de uma fenda em pé (de gato).
 */
import * as THREE from 'three';

// ---------------------------------------------------------------- medidas do olho
export const OLHO = {
  meiaLargura: 11, // metade da largura da amêndoa
  meiaAltura: 5.2, // metade da altura (olho aberto)
  sobra: 1.1, // as linhas das pálpebras passam um pouco das pontas e se cruzam (como num desenho)
  raioIris: 4.5,
  fenda: { meiaAltura: 3.5, meiaLargura: 0.85 }, // a pupila é uma fenda em pé (olho de gato)
  linha: 0.075, // espessura das linhas de luz
};
const COR_OLHO = {
  contorno: '#e2ccff', // as pálpebras
  iris: '#c9adff', // o círculo da íris
  pupila: '#f1e6ff', // a fenda da pupila
  halo: '#7c3aed', // o brilho em volta do olho
  veu: '#06010f', // o olho por dentro é transparente, só um pouco mais escuro que o céu
};
const VEU = 0.35;
export const EFEITOS = {
  glitchEntre: [3, 9], // segundos entre uma falha e outra (cada olho no seu tempo)
  glitchDura: [0.12, 0.35], // quanto dura cada falha
  azul: '#2f5bff', // as duas cores da falha
  vermelho: '#b3122e',
  clique: { fechado: 5, abertura: 0.16 }, // clicou: pisca vermelho e fica quase fechado 5 s
  vermelhoClique: '#ff2a44',
}; // 0 = o céu aparece inteiro dentro do olho, 1 = o olho por dentro fica todo escuro

export const ANIMACAO = {
  voltarDepois: 7, // segundos com o ponteiro parado até o olho voltar a olhar para a frente
  normalPor: 3, // segundos olhando para a frente antes de começar a olhar para os lados
  piscarEntre: [8, 10], // segundos entre uma piscada e outra
  alcance: { x: 4.6, y: 1.7 }, // até onde a íris vai a partir do meio do olho
};

// a amêndoa é a interseção de dois círculos (raio R, centros em y = +d e y = -d)
function lente(meiaLargura, meiaAltura) {
  const k = (meiaLargura * meiaLargura) / meiaAltura;
  return new THREE.Vector2((k + meiaAltura) / 2, (k - meiaAltura) / 2);
}

// GLSL comum: distância até a borda da amêndoa (negativa dentro) e ruído
const GLSL_COMUM = /* glsl */ `
  uniform vec2 uLente; // (R, d)
  uniform float uDesloc; // ao piscar, o olho fecha um pouco abaixo do meio
  float sdLente(vec2 p) {
    // distância exata até a amêndoa (de Inigo Quilez, "vesica"): além das pontas mede até a
    // ponta, então o contorno não "vaza" quando o olho está quase fechado
    p.y -= uDesloc;
    vec2 q = abs(vec2(p.y, p.x));
    float b = sqrt(max(uLente.x * uLente.x - uLente.y * uLente.y, 0.0));
    return ((q.y - b) * uLente.y > q.x * b) ? length(q - vec2(0.0, b)) : length(q - vec2(-uLente.y, 0.0)) - uLente.x;
  }
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float ruido(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
      f.z);
  }
  // falha (glitch): algumas faixas horizontais do olho escorregam para o lado
  uniform float uGlitch; uniform float uSemente; uniform float uVermelho;
  uniform vec3 uAzulG; uniform vec3 uVermG; uniform vec3 uVermClique;
  float acaso(float n) { return fract(sin(n) * 43758.5453); }
  float deslizeGlitch(float y) {
    float faixa = floor(y * 1.7 + uSemente);
    float corte = step(0.55, acaso(faixa * 7.13 + uSemente)) * uGlitch;
    return (acaso(faixa * 3.71 + uSemente * 1.3) - 0.5) * 2.6 * corte;
  }
  float fbm(vec3 p) {
    float s = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) { s += a * ruido(p); p *= 2.03; a *= 0.5; }
    return s;
  }
`;

// mistura "pré-multiplicada": onde alfa = 1 o objeto cobre o que está atrás; onde alfa = 0 a
// cor só soma (brilho)
function materialOlho(uniforms, vertexShader, fragmentShader) {
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
  });
}

const cor3 = (h) => new THREE.Color(h);

export class Olho {
  constructor(cena) {
    this.grupo = new THREE.Group();
    cena.add(this.grupo);
    const L = lente(OLHO.meiaLargura, OLHO.meiaAltura);
    this.uComuns = {
      uLente: { value: L },
      uDesloc: { value: 0 },
      uT: { value: 0 },
      uLinha: { value: OLHO.linha },
      uGlitch: { value: 0 }, // 0..1: força da falha agora
      uSemente: { value: 0 }, // muda a cada quadro da falha (faixas e deslocamentos diferentes)
      uVermelho: { value: 0 }, // 0..1: o olho fica vermelho (clique)
      uAzulG: { value: cor3(EFEITOS.azul) },
      uVermG: { value: cor3(EFEITOS.vermelho) },
      uVermClique: { value: cor3(EFEITOS.vermelhoClique) },
    };
    this.L = L;

    // ---- pálpebras (duas linhas de luz que se cruzam nas pontas), halo e um véu bem leve por
    //      dentro do olho (um retângulo que cobre o olho e o halo)
    const fundo = new THREE.Mesh(
      new THREE.PlaneGeometry(OLHO.meiaLargura * 2 + 16, OLHO.meiaAltura * 2 + 16),
      materialOlho(
        {
          ...this.uComuns,
          uContorno: { value: cor3(COR_OLHO.contorno) },
          uHalo: { value: cor3(COR_OLHO.halo) },
          uVeuCor: { value: cor3(COR_OLHO.veu) },
          uVeu: { value: VEU },
          uSobra: { value: OLHO.sobra },
        },
        /* glsl */ `
          varying vec2 vP;
          void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
        `,
        /* glsl */ `
          uniform float uT; uniform vec3 uContorno; uniform vec3 uHalo; uniform vec3 uVeuCor; uniform float uVeu;
          uniform float uSobra; uniform float uLinha;
          varying vec2 vP;
          ${GLSL_COMUM}
          // uma pálpebra: arco de círculo (centro c, raio R) até um pouco além das pontas
          float palpebra(vec2 p, vec2 c, float meiaLargura, float lado) {
            float d = abs(length(p - c) - uLente.x);
            float ate = 1.0 - smoothstep(meiaLargura + uSobra * 0.35, meiaLargura + uSobra, abs(p.x));
            ate *= step(0.0, lado * (c.y - p.y)); // só o lado do arco que forma a pálpebra
            return (exp(-pow(d / uLinha, 2.0)) + 0.16 * exp(-pow(d / (uLinha * 4.0), 2.0))) * ate;
          }
          // as duas pálpebras (de baixo: círculo com centro acima; de cima: centro abaixo)
          float palpebras(vec2 p) {
            float meiaLargura = sqrt(max(uLente.x * uLente.x - uLente.y * uLente.y, 0.0));
            return min(palpebra(p, vec2(0.0, uLente.y), meiaLargura, 1.0) + palpebra(p, vec2(0.0, -uLente.y), meiaLargura, -1.0), 1.4);
          }
          void main() {
            float sd = sdLente(vP);
            float dentro = 1.0 - smoothstep(-0.03, 0.03, sd);
            vec2 p = vec2(vP.x + deslizeGlitch(vP.y), vP.y - uDesloc);
            float pulso = 0.92 + 0.08 * sin(uT * 1.6);
            // na falha: uma cópia azul e uma vermelho-escura, deslocadas para os lados
            float desvio = 0.5 * uGlitch;
            float linhas = palpebras(p);
            float linhasAzul = palpebras(p + vec2(desvio, 0.08 * uGlitch));
            float linhasVerm = palpebras(p - vec2(desvio, 0.08 * uGlitch));
            // halo violeta do lado de fora
            float fora = max(sd, 0.0);
            float halo = (exp(-fora / 0.8) * 0.24 + exp(-fora / 3.5) * 0.08) * (1.0 - dentro);
            // o halo vai a zero antes da borda do retângulo onde é desenhado (senão aparece um
            // "quadrado" de luz fraquinha em volta de cada olho)
            halo *= 1.0 - smoothstep(4.0, 7.5, fora);
            vec3 corLinha = mix(uContorno, uVermClique, uVermelho);
            vec3 corHalo = mix(uHalo, uVermG, uVermelho * 0.8);
            vec3 brilho = (corLinha * linhas * (1.0 - 0.5 * uGlitch) + corHalo * halo) * pulso;
            brilho += (uAzulG * linhasAzul + uVermG * 1.6 * linhasVerm) * uGlitch * 1.3;
            float veu = dentro * uVeu;
            gl_FragColor = vec4(uVeuCor * veu + brilho, veu);
          }
        `
      )
    );
    fundo.renderOrder = 10;
    this.fundo = fundo;
    this.grupo.add(fundo);

    // ---- íris e pupila: só os contornos (um círculo e uma fenda em pé), transparentes por dentro
    this.iris = new THREE.Group();
    this.grupo.add(this.iris);
    const lado = OLHO.raioIris * 2 + 1.5;
    // a fenda também é uma amêndoa (em pé): pontas finas, como a pupila de um gato
    const fenda = (meiaLargura) => {
      const k = (OLHO.fenda.meiaAltura * OLHO.fenda.meiaAltura) / meiaLargura;
      return new THREE.Vector2((k + meiaLargura) / 2, (k - meiaLargura) / 2);
    };
    this.fenda = fenda;
    this.uIris = {
      ...this.uComuns,
      uRi: { value: OLHO.raioIris },
      uFenda: { value: fenda(OLHO.fenda.meiaLargura) },
      uCorIris: { value: cor3(COR_OLHO.iris) },
      uCorPupila: { value: cor3(COR_OLHO.pupila) },
      uIrisPos: { value: new THREE.Vector2() }, // onde a íris está dentro do olho
      uIrisEscala: { value: new THREE.Vector2(1, 1) },
    };
    const discoIris = new THREE.Mesh(
      new THREE.PlaneGeometry(lado, lado),
      materialOlho(
        this.uIris,
        /* glsl */ `
          uniform vec2 uIrisPos; uniform vec2 uIrisEscala;
          varying vec2 vP; varying vec2 vW;
          void main() {
            vP = position.xy;
            vW = position.xy * uIrisEscala + uIrisPos; // posição dentro do olho
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        /* glsl */ `
          uniform float uT; uniform float uRi; uniform vec2 uFenda; uniform vec3 uCorIris; uniform vec3 uCorPupila;
          uniform float uLinha;
          varying vec2 vP; varying vec2 vW;
          ${GLSL_COMUM}
          // amêndoa em pé (a fenda da pupila): círculos de raio R com centros em x = +d e x = -d
          float sdFenda(vec2 p) {
            vec2 q = abs(p);
            float b = sqrt(max(uFenda.x * uFenda.x - uFenda.y * uFenda.y, 0.0));
            return ((q.y - b) * uFenda.y > q.x * b) ? length(q - vec2(0.0, b)) : length(q - vec2(-uFenda.y, 0.0)) - uFenda.x;
          }
          float traco(float d, float w) { return exp(-pow(d / w, 2.0)) + 0.16 * exp(-pow(d / (w * 4.0), 2.0)); }
          float tracos(vec2 p, vec3 corIris, vec3 corPupila, out vec3 cor) {
            float iris = traco(abs(length(p) - uRi), uLinha * 0.9);
            float pupila = traco(abs(sdFenda(p)), uLinha * 0.85);
            cor = corIris * iris * 0.85 + corPupila * pupila;
            return iris + pupila;
          }
          void main() {
            // na falha, as mesmas faixas que escorregam nas pálpebras escorregam aqui
            float deslize = deslizeGlitch(vW.y);
            vec2 w = vec2(vW.x + deslize, vW.y);
            float visivel = 1.0 - smoothstep(-0.08, 0.04, sdLente(w)); // só dentro do olho
            if (visivel <= 0.0) discard;
            vec2 p = vP + vec2(deslize, 0.0);
            vec3 corIris = mix(uCorIris, uVermClique, uVermelho);
            vec3 corPupila = mix(uCorPupila, uVermClique, uVermelho);
            vec3 cor;
            tracos(p, corIris, corPupila, cor);
            cor *= 1.0 - 0.5 * uGlitch;
            if (uGlitch > 0.0) {
              // cópias azul e vermelho-escura, deslocadas para os lados
              float desvio = 0.5 * uGlitch;
              vec3 lixo;
              float a = tracos(p + vec2(desvio, 0.08 * uGlitch), uAzulG, uAzulG, lixo);
              float b = tracos(p - vec2(desvio, 0.08 * uGlitch), uVermG, uVermG, lixo);
              cor += (uAzulG * a + uVermG * 1.6 * b) * uGlitch * 1.1;
            }
            cor *= visivel;
            cor *= 1.0 - smoothstep(uRi + 0.35, uRi + 0.7, length(vP)); // (zero antes da borda do quadrado)
            gl_FragColor = vec4(cor, 0.0); // só luz: por dentro tudo é transparente
          }
        `
      )
    );
    discoIris.renderOrder = 11;
    this.iris.add(discoIris);
  }

  /** Coloca o olho na tela: posição, tamanho e uma leve inclinação. */
  posicionar(x, y, escala, inclinacao, escalaRef = escala) {
    this.grupo.position.set(x, y, 0);
    this.grupo.scale.setScalar(escala);
    this.grupo.rotation.z = inclinacao;
    // olhos menores ficam com as linhas um pouco mais grossas (senão somem)
    // (no portfólio a escala é em pixels; escalaRef é o mesmo tamanho medido como na página do olho)
    this.uComuns.uLinha.value = OLHO.linha / Math.sqrt(Math.min(1, escalaRef * 2.2));
  }

  /**
   * @param olharX, olharY  para onde olha, de -1 a 1 (0 = para a frente)
   * @param abertura        1 = aberto, 0 = fechado (piscando)
   */
  atualizar(t, olharX, olharY, abertura, glitch = 0, vermelho = 0) {
    this.uComuns.uT.value = t;
    this.uComuns.uGlitch.value = glitch;
    if (glitch > 0) this.uComuns.uSemente.value = Math.floor(Math.random() * 1000);
    this.uComuns.uVermelho.value = vermelho;
    // a íris vai para o lado e, vista de lado, fica um pouco achatada (o olho é redondo)
    this.iris.position.set(olharX * ANIMACAO.alcance.x, olharY * ANIMACAO.alcance.y, 0);
    this.iris.scale.set(1 - 0.12 * olharX * olharX, 1 - 0.1 * olharY * olharY, 1);
    this.uIris.uIrisPos.value.set(this.iris.position.x, this.iris.position.y);
    this.uIris.uIrisEscala.value.set(this.iris.scale.x, this.iris.scale.y);
    // a fenda da pupila abre e fecha um pouco, devagar
    this.uIris.uFenda.value.copy(this.fenda(OLHO.fenda.meiaLargura * (1 + 0.18 * Math.sin(t * 0.7))));
    // piscar: a amêndoa fecha (mais a pálpebra de cima, então fecha um pouco abaixo do meio)
    const meiaAltura = Math.max(0.06, OLHO.meiaAltura * abertura);
    const k = (OLHO.meiaLargura * OLHO.meiaLargura) / meiaAltura;
    this.L.set((k + meiaAltura) / 2, (k - meiaAltura) / 2);
    this.uComuns.uDesloc.value = -(1 - abertura) * OLHO.meiaAltura * 0.3;
  }
}
