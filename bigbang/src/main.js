import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

import { criarTexturas } from './texturas.js';
import { globais } from './materiais.js';
import { Singularidade } from './singularidade.js';
import { Explosao } from './explosao.js';
import { Ceu, Galaxia, Planeta, PoeiraViagem } from './universo.js';
import { Estrela } from './estrela.js';
import { Viagem, planejarRota } from './viagem.js';
import { SistemaSolar } from './sistema.js';
import { Raios } from './raios.js';
import {
  clamp,
  lerp,
  progresso,
  smoothstep,
  janela,
  easeInQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  tremor,
} from './utils.js';

// Cor final da imagem: escurecer (1 = como era; maior = mais escuro), saturação (1 = como era)
// e quanto puxa para o roxo (0 = nada)
const COR = { escurecer: 1.35, saturacao: 1.4, roxo: 1 };

// ------------------------------------------------------------------
// Linha do tempo (segundos contados a partir do clique)
// ------------------------------------------------------------------
// Total: ~29,85 segundos do clique até a tela branca.
const CARGA = 2.0; // sobrecarga: treme, pulsa cada vez mais rápido
const BANG = CARGA + 0.25; // implosão rápida e... BUM (2,25 s)
const FOCO_INI = BANG + 2.2; // a câmera, parada, assiste à explosão; depois vira para a estrela...
const FOCO_FIM = BANG + 5.0; // ...e vai devagar até ficar atrás dela (7,25 s)
// a viagem: galáxia (braço com nebulosa, buraco negro), lupa, sistema solar, voltas em Saturno e subida em espiral
const VIAGEM_INI = FOCO_FIM;
const VIAGEM_DUR = 20.5;
const FINAL_INI = VIAGEM_INI + VIAGEM_DUR; // lá no alto da espiral a estrela para e treme (27,75 s)
const SUPERNOVA = FINAL_INI + 1.2; // ela explode
const BRANCO = SUPERNOVA + 0.9; // tela 100% branca (~29,85 s)

// Batida do coração e fluxo de energia (a frequência sobe durante a carga)
const BATIDA_0 = 0.85;
const BATIDA_1 = 8;
const FLUXO_0 = 0.12;
const FLUXO_1 = 0.95;

// Onde a estrela protagonista "nasce" (a galáxia é posicionada a partir daqui)
const H0 = new THREE.Vector3(25, 5, -20);

const parametros = new URLSearchParams(location.search);
const reduzirMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ------------------------------------------------------------------
// Versão para o portfólio
// ------------------------------------------------------------------
// Aqui a animação não começa sozinha nem procura os elementos pelo id: o portfólio decide.
//   BigBang.preparar({ palco, clarao, vinheta })  monta a cena (o ponto pulsando, parado)
//   BigBang.comecar()                              dispara a animação (o "clique")
//   BigBang.pular()                                vai para a tela branca em 0,6 s
//   BigBang.descartar()                            para tudo e libera a placa de vídeo
// No fim (tela branca) dispara o evento 'bigbang:fim' na janela.
let el = null;
let controle = null;

/** Termina na tela branca e avisa quem quiser continuar a partir dali. */
function mostrarFinal() {
  el.clarao.style.opacity = '1';
  el.palco.style.display = 'none';
  window.dispatchEvent(new CustomEvent('bigbang:fim'));
}

function suportaWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

window.BigBang = {
  suportado: suportaWebGL(),
  preparar(elementos) {
    if (!controle && this.suportado) {
      el = elementos;
      controle = iniciar();
    }
    return !!controle;
  },
  comecar() {
    if (controle) controle.comecar();
  },
  pular() {
    if (controle) controle.pular();
  },
  /** Desloca a cena na vertical, em pixels (negativo = para cima). Muda suave. */
  deslocar(px) {
    if (controle) controle.deslocar(px);
  },
  descartar() {
    if (controle) controle.descartar();
    controle = null;
  },
};
window.dispatchEvent(new CustomEvent('bigbang:carregado'));

function iniciar() {
  const pedido = parseFloat(parametros.get('qualidade'));
  const fraco = matchMedia('(pointer: coarse)').matches || Math.min(innerWidth, innerHeight) < 600;
  const q = clamp(Number.isFinite(pedido) ? pedido : fraco ? 0.45 : 1, 0.15, 1.5);

  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, fraco ? 1.5 : 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor('#050009');
  el.palco.appendChild(renderer.domElement);

  const cena = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 9000);
  camera.position.set(0, 0, 30);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(cena, camera));
  // Limita o brilho antes do bloom: pontos muito estourados viram "quadrados" no desfoque.
  composer.addPass(
    new ShaderPass({
      uniforms: { tDiffuse: { value: null }, uMax: { value: 2.4 } },
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `
        uniform sampler2D tDiffuse; uniform float uMax; varying vec2 vUv;
        void main() {
          vec3 c = texture2D(tDiffuse, vUv).rgb;
          float m = max(max(c.r, c.g), c.b);
          if (m > uMax) c *= uMax / m;
          gl_FragColor = vec4(c, 1.0);
        }`,
    })
  );
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.75, 0.45, 0.18);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  // Cor final: tudo mais escuro e com roxos mais fortes (ajuste em COR, no topo do arquivo)
  composer.addPass(
    new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        uGama: { value: COR.escurecer },
        uSat: { value: COR.saturacao },
        uRoxo: { value: COR.roxo },
      },
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `
        uniform sampler2D tDiffuse; uniform float uGama; uniform float uSat; uniform float uRoxo; varying vec2 vUv;
        void main() {
          vec3 c = texture2D(tDiffuse, vUv).rgb;
          float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
          // roxos mais fortes: mais saturação, e menos verde nos meios-tons (o verde deixa o roxo
          // acinzentado); os brancos (núcleo da estrela, clarões) continuam brancos
          c = max(mix(vec3(l), c, uSat), 0.0);
          c *= mix(vec3(1.0 + 0.04 * uRoxo, 1.0 - 0.2 * uRoxo, 1.0 + 0.08 * uRoxo), vec3(1.0), smoothstep(0.6, 1.0, l));
          // mais escuro: afunda as sombras e os meios-tons, sem apagar os brilhos
          c = pow(c, vec3(uGama));
          gl_FragColor = vec4(c, 1.0);
        }`,
    })
  );

  cena.add(new THREE.AmbientLight('#9b7be0', 0.2));
  // luz vinda da câmera, só durante a explosão: mostra o relevo das rochas que voam na direção dela
  const luzFrontal = new THREE.DirectionalLight('#eadcff', 0);
  cena.add(luzFrontal);

  // ---------------- elementos ----------------
  const tex = criarTexturas();
  const singularidade = new Singularidade(cena, tex, q);
  const bigbang = new Explosao(cena, tex, { qualidade: q, semente: 7 });
  const ceu = new Ceu(cena, tex, q);
  const galaxia = new Galaxia(cena, tex, q, new THREE.Vector3());
  // a rota posiciona a galáxia e escolhe o pontinho do braço onde está o sistema solar
  const rota = planejarRota(galaxia, H0);
  const sistema = new SistemaSolar(cena, tex, rota.base);
  const planeta = new Planeta(cena, tex, q, rota.saturno);
  sistema.adotarSaturno(planeta, rota.grausSaturno);

  const viagem = new Viagem({ inicio: H0, galaxia, planeta, rota }, VIAGEM_DUR);
  planeta.inclinarAneis(sistema.direcaoLocal(viagem.normalDosAneis()));
  // cada planeta visitado chega ao ponto do encontro na hora exata em que a estrela passa
  sistema.sincronizar(
    Object.fromEntries(viagem.encontros.map((e) => [e.nome, { graus: e.graus, t: VIAGEM_INI + viagem.tempoDe(e.s) }]))
  );
  // os planetas que a estrela não visita ficam longe do caminho dela
  sistema.afastarDaRota((x, out) => viagem.estrelaEm(x - VIAGEM_INI, out), VIAGEM_INI + viagem.tempoDe(viagem.sLupaFim), FINAL_INI);
  // quando a lupa começa e termina
  const tLupa = VIAGEM_INI + viagem.tempoDe(viagem.sLupaIni);
  const tLupaFim = VIAGEM_INI + viagem.tempoDe(viagem.sLupaFim);
  const ampliacao = (x) => (x < VIAGEM_INI ? viagem.sigma0 : viagem.ampliacao(Math.min(x, FINAL_INI) - VIAGEM_INI));
  const poeira = new PoeiraViagem(cena, q, viagem);
  const estrela = new Estrela(cena, tex);

  // Depois da viagem a estrela ainda desliza um pouco antes de parar
  const fimViagem = viagem.pontoBase(viagem.L, new THREE.Vector3());
  const tangFinal = viagem.tangenteFinal(new THREE.Vector3());
  const velFinal = (viagem.L - viagem.sEm(VIAGEM_DUR - 0.05)) / 0.05;

  function posEstrela(t, out) {
    if (t < VIAGEM_INI) {
      const te = Math.max(0, t - BANG);
      return out.copy(H0).multiplyScalar(1 - Math.exp(-4 * te));
    }
    if (t < FINAL_INI) return viagem.estrelaEm(t - VIAGEM_INI, out);
    const tf = t - FINAL_INI;
    return out.copy(fimViagem).addScaledVector(tangFinal, (velFinal * (1 - Math.exp(-3 * tf))) / 3);
  }

  const posSupernova = posEstrela(SUPERNOVA, new THREE.Vector3());
  const supernova = new Explosao(cena, tex, {
    centro: posSupernova,
    qualidade: q,
    semente: 99,
    vMax: 140,
    arrasto: 1.3,
    poeira: 16000,
    raios: 500,
    nuvens: 18,
    galaxias: 0,
    estrelas: 0,
    fragmentos: 0,
    flash: 90,
    decaiFlash: 0.5,
    onda: 160,
    tamanho: 0.6,
    paleta: ['#ffffff', '#e9d5ff', '#c4b5fd', '#f0abfc', '#a78bfa'],
  });

  // raios elétricos em volta da estrela quando ela fica instável
  const grupoRaiosEstrela = new THREE.Group();
  cena.add(grupoRaiosEstrela);
  const raiosEstrela = new Raios(grupoRaiosEstrela, { quantidade: 9, cor: '#e3d0ff' });

  // ---------------- tamanho da tela ----------------
  function ajustarEscalaPixel() {
    const h = renderer.getDrawingBufferSize(new THREE.Vector2()).y;
    globais.uEscalaPixel.value = h / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
  }
  // Deslocamento vertical da cena (o portfólio põe o ponto acima do meio da tela, na abertura)
  let desloc = 0;
  let alvoDesloc = 0;
  function aplicarDesloc() {
    if (Math.abs(desloc) < 0.5) camera.clearViewOffset();
    // janela de visão mais abaixo na imagem = a cena sobe na tela
    else camera.setViewOffset(innerWidth, innerHeight, 0, -desloc, innerWidth, innerHeight);
  }
  function redimensionar() {
    camera.aspect = innerWidth / innerHeight;
    aplicarDesloc();
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    composer.setSize(innerWidth, innerHeight);
    bloom.resolution.set(innerWidth, innerHeight);
    ajustarEscalaPixel();
  }
  addEventListener('resize', redimensionar);
  ajustarEscalaPixel();
  let ativo = true;
  function encerrar() {
    if (!ativo) return;
    ativo = false;
    renderer.setAnimationLoop(null);
    removeEventListener('resize', redimensionar);
    renderer.dispose();
    renderer.forceContextLoss();
  }

  // Pré-compila shaders e envia texturas para a GPU agora, para não engasgar na explosão
  cena.traverse((o) => (o.visible = true));
  Object.values(tex)
    .flat()
    .forEach((t) => renderer.initTexture(t));
  cena.traverse((o) => {
    for (const chave of ['map', 'emissiveMap']) if (o.material?.[chave]) renderer.initTexture(o.material[chave]);
  });
  renderer.compile(cena, camera);

  // ---------------- estado ----------------
  let estado = 'ocioso'; // ocioso -> rodando -> fim
  let tOcioso = 0;
  let t = 0; // tempo desde o clique
  let faseClique = 0;
  let fluxoClique = 0;

  // Ajuda para desenvolver: ?bbt=30 começa no segundo 30 ao chamar comecar(); ?bbt=30&bbpausa congela ali.
  const pausado = parametros.has('bbpausa');
  const inicioDebug = parseFloat(parametros.get('bbt'));

  // Pular: a tela vai ficando branca a partir de onde estiver e termina em PULO segundos
  const PULO = 0.6;
  let pularDesde = -1;

  function comecar() {
    if (estado !== 'ocioso') return;
    estado = 'rodando';
    alvoDesloc = 0; // a explosão acontece no meio da tela
    faseClique = BATIDA_0 * tOcioso;
    fluxoClique = FLUXO_0 * tOcioso;
    if (Number.isFinite(inicioDebug)) t = Math.max(0, inicioDebug);
  }
  function pular() {
    if (estado === 'ocioso') comecar();
    if (estado === 'rodando' && pularDesde < 0) pularDesde = t;
  }

  // ---------------- direção de câmera ----------------
  const camPos = new THREE.Vector3();
  const camAlvo = new THREE.Vector3();
  const camCima = new THREE.Vector3(0, 1, 0);
  const vTmp = new THREE.Vector3();
  const vTmp2 = new THREE.Vector3();
  const vTmp3 = new THREE.Vector3();
  const vTremor = new THREE.Vector3();
  const vDeriva = new THREE.Vector3();
  // curva bem suave (começa e termina sem tranco nenhum)
  const suave = (x) => x * x * x * (x * (x * 6 - 15) + 10);
  // balanço leve da câmera depois da explosão, que vai sumindo
  const balanco = (te) => Math.sin(te * 1.2) * 0.06 * Math.exp(-te * 0.5);
  const estrelaPos = new THREE.Vector3();
  const CAM_OCIOSA = new THREE.Vector3(0, 0, 30);
  const CAM_CARGA = new THREE.Vector3(0, 0, 23);
  const CAM_EXPLOSAO = new THREE.Vector3(-12, 20, 125);

  // pose da câmera no começo e no fim da viagem (para as transições)
  const camViagem0 = { pos: new THREE.Vector3(), alvo: new THREE.Vector3(), cima: new THREE.Vector3() };
  camViagem0.fov = viagem.camera(0, camViagem0.pos, camViagem0.alvo, camViagem0.cima);
  const camViagem1 = { pos: new THREE.Vector3(), alvo: new THREE.Vector3(), cima: new THREE.Vector3() };
  camViagem1.fov = viagem.camera(VIAGEM_DUR, camViagem1.pos, camViagem1.alvo, camViagem1.cima);
  // no final a câmera só se aproxima da estrela, vindo do lado em que a viagem terminou
  const ladoFinal = camViagem1.pos.clone().sub(fimViagem).normalize();
  const tremorFimViagem = viagem.tremor(VIAGEM_DUR);

  function posCameraExplosao(te, out) {
    const k = easeOutCubic(clamp(te / 2.0));
    return out.lerpVectors(CAM_CARGA, CAM_EXPLOSAO, k).add(vDeriva.set(Math.sin(te * 0.35) * 2.5, Math.sin(te * 0.27) * 1.5, 0));
  }

  function dirigirCamera(t, carga) {
    let fov = 60;
    let tremorAmp = 0;
    camCima.set(0, 1, 0);

    if (estado === 'ocioso') {
      camPos.set(Math.sin(tOcioso * 0.1) * 1.2, Math.cos(tOcioso * 0.13) * 0.8, 30);
      camAlvo.set(0, 0, 0);
    } else if (t < BANG) {
      camPos.lerpVectors(CAM_OCIOSA, CAM_CARGA, easeInOutCubic(clamp(t / CARGA)));
      camAlvo.set(0, 0, 0);
      tremorAmp = 0.32 * carga * carga;
    } else if (t < FOCO_INI) {
      // a câmera recua com a explosão e fica quase parada, assistindo
      const te = t - BANG;
      posCameraExplosao(te, camPos);
      camAlvo.set(0, 0, 0);
      tremorAmp = 1.6 * Math.exp(-te * 2.5);
      camCima.set(balanco(te), 1, 0).normalize();
    } else if (t < FOCO_FIM) {
      // transição leve: primeiro só vira para olhar a estrela; depois sai atrás dela,
      // começando bem devagar e chegando sem tranco (curva suave nas duas pontas)
      const f = progresso(FOCO_INI, FOCO_FIM, t);
      const virar = suave(progresso(0, 0.45, f));
      const ir = suave(progresso(0.22, 1, f));
      const p0 = posCameraExplosao(FOCO_INI - BANG, vTmp);
      const p1 = camViagem0.pos;
      const ctrl = vTmp2.lerpVectors(p0, p1, 0.5).add(vTmp3.set(30, 25, 0));
      camPos
        .copy(p0)
        .multiplyScalar((1 - ir) * (1 - ir))
        .addScaledVector(ctrl, 2 * ir * (1 - ir))
        .addScaledVector(p1, ir * ir);
      posEstrela(t, estrelaPos);
      camAlvo.set(0, 0, 0).lerp(estrelaPos, virar).lerp(camViagem0.alvo, ir);
      camCima.set(balanco(FOCO_INI - BANG), 1, 0).lerp(camViagem0.cima, ir).normalize();
      fov = lerp(60, camViagem0.fov, ir);
    } else if (t < FINAL_INI) {
      fov = viagem.camera(t - VIAGEM_INI, camPos, camAlvo, camCima);
      // nas voltas em Saturno a tela treme cada vez mais, conforme a estrela acelera
      tremorAmp = viagem.tremor(t - VIAGEM_INI);
    } else {
      // final: a câmera sai de trás e vai para o lado da estrela, chegando perto
      const tf = t - FINAL_INI;
      posEstrela(t, estrelaPos);
      const desloc = vTmp.subVectors(camViagem1.pos, fimViagem);
      const seguir = vTmp2.copy(estrelaPos).add(desloc);
      const lado = vTmp3.copy(ladoFinal);
      const dist = lerp(camViagem1.pos.distanceTo(fimViagem), 9, easeInOutCubic(progresso(0, SUPERNOVA - FINAL_INI, tf)));
      const b = easeInOutCubic(progresso(0, 0.65, tf));
      camPos.lerpVectors(seguir, lado.multiplyScalar(dist).add(estrelaPos), b);
      camAlvo.copy(camViagem1.alvo).sub(fimViagem).add(estrelaPos).lerp(estrelaPos, b);
      camCima.copy(camViagem1.cima).lerp(vTmp.set(0, 1, 0), b).normalize();
      fov = lerp(camViagem1.fov, 55, b);
      const k = progresso(FINAL_INI + 0.1, SUPERNOVA, t);
      tremorAmp =
        tremorFimViagem * (1 - smoothstep(0, 0.5, tf)) + 0.2 * k * k + (t > SUPERNOVA ? 1.2 * Math.exp(-(t - SUPERNOVA) * 3) : 0);
    }

    // tela em pé (celular): abre o campo de visão para caber o mesmo tanto na horizontal
    fov *= lerp(1, 1.5, clamp((1 - camera.aspect) / 0.55));

    if (reduzirMovimento) tremorAmp *= 0.3;
    camera.position.copy(camPos).add(tremor(t + tOcioso, tremorAmp, vTremor, 11));
    camera.up.copy(camCima);
    camera.lookAt(camAlvo);
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
      ajustarEscalaPixel();
    }
  }

  // ---------------- quadro a quadro ----------------
  const zero = { planeta: 0 };
  let ultimo = performance.now();

  function quadro(agora) {
    // limite alto: mesmo num aparelho lento a animação dura 10 s (só pula quando a aba volta do segundo plano)
    const dt = Math.min((agora - ultimo) / 1000, 0.1);
    ultimo = agora;
    if (estado === 'ocioso') tOcioso += dt;
    else if (estado === 'rodando' && !pausado) t += dt;
    if (desloc !== alvoDesloc) {
      desloc += (alvoDesloc - desloc) * (1 - Math.exp(-dt * 2.6));
      if (Math.abs(alvoDesloc - desloc) < 0.5) desloc = alvoDesloc;
      aplicarDesloc();
    }
    const relogio = tOcioso + t;
    globais.camPos.copy(camera.position);

    // --- singularidade (antes do Big Bang)
    let carga = 0;
    if (estado === 'ocioso') {
      singularidade.visivel = true;
      singularidade.atualizar(dt, relogio, BATIDA_0 * tOcioso, FLUXO_0 * tOcioso, 0, 0);
    } else if (t < BANG) {
      const tc = Math.min(t, CARGA);
      carga = easeInQuad(tc / CARGA);
      // fase integrada: a frequência cresce com t², então a fase cresce com t³
      const integral = (tc * tc * tc) / (3 * CARGA * CARGA) + Math.max(0, t - CARGA);
      const fase = faseClique + BATIDA_0 * t + (BATIDA_1 - BATIDA_0) * integral;
      const fluxo = fluxoClique + FLUXO_0 * t + (FLUXO_1 - FLUXO_0) * integral;
      const colapso = easeInCubic(progresso(CARGA, BANG, t));
      singularidade.visivel = true;
      singularidade.atualizar(dt, relogio, fase, fluxo, carga, colapso);
    } else {
      singularidade.visivel = false;
    }

    // --- Big Bang
    bigbang.atualizar(estado === 'ocioso' ? -1 : t - BANG);
    // os restos da explosão somem enquanto a estrela voa até o pontinho do braço
    const restos = 1 - smoothstep(FOCO_FIM - 1.5, VIAGEM_INI + 2.5, t);
    bigbang.opacidade = lerp(1, 0.6, smoothstep(FOCO_INI, FOCO_FIM, t)) * restos;
    if (restos < 0.01) bigbang.grupo.visible = false;

    // --- a lupa: o sistema solar cresce de um pontinho até o tamanho final, e a galáxia junto
    const amp = estado === 'ocioso' ? viagem.sigma0 : ampliacao(t);
    sistema.escala = amp;
    galaxia.ampliar(viagem.sol, amp / viagem.sigma0, camera.position.distanceTo(viagem.sol));

    // --- universo
    const formacao = estado === 'ocioso' ? 0 : smoothstep(BANG + 0.3, BANG + 2.0, t);
    posEstrela(t, estrelaPos);
    const dest = t > VIAGEM_INI - 0.5 && t < SUPERNOVA ? viagem.destaques(estrelaPos) : zero;
    // (o relógio da galáxia é o tempo desde o clique: assim o braço está onde a rota espera;
    //  ela para de girar quando a lupa começa, senão o pontinho sairia de baixo do sistema solar)
    galaxia.atualizar(t, dest.galaxia ?? 0, estrelaPos, formacao);
    planeta.atualizar(t, dest.planeta ?? 0, estrelaPos, formacao);
    sistema.atualizar(t, estrelaPos, formacao);
    poeira.atualizar(estado === 'ocioso' ? 0 : smoothstep(BANG + 0.8, BANG + 2.4, t) * (1 - smoothstep(SUPERNOVA, SUPERNOVA + 0.4, t)));

    // --- estrela protagonista
    const viva = estado !== 'ocioso' && t >= BANG && t < SUPERNOVA;
    const te = t - BANG;
    const kFinal = progresso(FINAL_INI + 0.1, SUPERNOVA - 0.25, t);
    const contrai = easeInCubic(progresso(SUPERNOVA - 0.25, SUPERNOVA, t));
    const acende = janela(te, 1.3, 1.9, 2.5, 3.8); // a estrela se acende enquanto a câmera está parada
    const piscada = kFinal > 0.3 ? 1 + (Math.random() - 0.5) * 0.7 * kFinal : 1;
    // o rastro faz parte da cena: na lupa ele é ampliado junto. A estrela quase para no pontinho,
    // então o rastro some logo antes da lupa e volta quando ela sai para Netuno (o pedaço de
    // antes da lupa fica preso onde a lupa começou, senão viraria um risco atravessando a tela)
    const ampAgora = ampliacao(t);
    const semRastro = janela(t, tLupa - 0.35, tLupa, tLupaFim - 0.1, tLupaFim + 0.4);
    const posRastro = (ti, out) => {
      const tj = t > tLupa ? Math.max(ti, tLupa) : ti;
      posEstrela(tj, out);
      const r = ampAgora / ampliacao(tj);
      if (r !== 1) out.sub(viagem.sol).multiplyScalar(r).add(viagem.sol);
      return out;
    };
    estrela.atualizar(t, posRastro, {
      visivel: viva,
      brilho:
        (lerp(0.55, 1.2, smoothstep(0.5, 1.2, te)) + 1.4 * acende + 0.6 * kFinal) *
        piscada *
        lerp(1, 0.4, contrai),
      escala: lerp(0.55, 1, smoothstep(0.5, 1.3, te)) * (1 + 0.7 * kFinal * kFinal) * lerp(1, 0.12, contrai),
      tremor: 0.55 * kFinal * kFinal,
      limite: kFinal,
      luz: 55 * smoothstep(0.6, 1.4, te) * (1 + 2 * kFinal),
      rastro: smoothstep(0.05, 0.3, te) * (1 - smoothstep(FINAL_INI + 0.1, FINAL_INI + 0.7, t)) * (1 - semRastro),
      quedaRastro: lerp(1.4, 0.35, t > VIAGEM_INI && t < FINAL_INI ? viagem.rastroLongo(t - VIAGEM_INI) : 0),
      raioMalabares: (x) =>
        smoothstep(FOCO_INI - 0.6, FOCO_FIM - 0.3, x) * (1 - easeInQuad(progresso(FINAL_INI + 0.05, FINAL_INI + 0.75, x))),
      // vista de longe (sistema solar inteiro), a estrela e o rastro ficam maiores para não sumir
      escalaVisual: clamp(Math.sqrt(camera.position.distanceTo(estrelaPos) / 28), 1, 4.5),
    });
    if (viva && kFinal > 0.05 && contrai < 0.5) {
      grupoRaiosEstrela.position.copy(estrela.grupo.position);
      raiosEstrela.atualizar(dt, Math.pow(kFinal, 1.2), 1.2, 4 + 7 * kFinal, 0.9);
    } else raiosEstrela.esconder();

    // --- supernova final
    supernova.atualizar(t - SUPERNOVA);

    // --- céu
    ceu.atualizar(relogio, camera, estado === 'ocioso' ? 0 : smoothstep(BANG + 0.2, BANG + 1.8, t));

    dirigirCamera(t, carga);
    luzFrontal.position.copy(camera.position);
    luzFrontal.intensity = estado === 'ocioso' ? 0 : 3 * janela(t - BANG, 0, 0.15, 0.8, 2.6);

    // --- camadas HTML: clarão branco e vinheta
    let branco = 0;
    if (estado !== 'ocioso') {
      if (t >= BANG) branco = 0.85 * Math.exp(-(t - BANG) * 4.5);
      if (t >= SUPERNOVA) {
        const r = progresso(SUPERNOVA, BRANCO, t);
        const pop = 0.22 * Math.exp(-(t - SUPERNOVA) * 8);
        branco = clamp(Math.pow(r, 1.8) + pop * (1 - r));
      }
    }
    if (pularDesde >= 0) branco = Math.max(branco, smoothstep(pularDesde, pularDesde + PULO, t));
    el.clarao.style.opacity = branco.toFixed(3);
    const vin =
      estado === 'ocioso' || t < BANG
        ? 0.75
        : lerp(0.5, 0.95, janela(t, FOCO_INI, FOCO_INI + 0.6, FOCO_FIM - 0.3, FOCO_FIM + 0.8)) +
          0.25 * smoothstep(FINAL_INI, SUPERNOVA, t) +
          0.3 * janela(t, tLupa - 0.4, tLupa + 0.2, tLupaFim - 0.3, tLupaFim + 0.4) -
          smoothstep(SUPERNOVA, SUPERNOVA + 0.4, t);
    el.vinheta.style.opacity = clamp(vin).toFixed(3);

    composer.render();

    if (estado === 'rodando' && (t >= BRANCO || (pularDesde >= 0 && t >= pularDesde + PULO))) {
      estado = 'fim';
      encerrar();
      mostrarFinal();
    }
  }

  renderer.setAnimationLoop(quadro);
  return {
    comecar,
    pular,
    deslocar: (px) => {
      alvoDesloc = px;
      if (estado === 'ocioso' && t === 0 && tOcioso < 0.05) {
        desloc = px; // ainda nem desenhou: já começa no lugar
        aplicarDesloc();
      }
    },
    descartar: () => {
      estado = 'fim';
      encerrar();
      el.palco.innerHTML = '';
    },
  };
}
