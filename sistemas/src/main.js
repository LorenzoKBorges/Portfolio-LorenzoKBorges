import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { Estrela, Planeta } from './corpos.js';
import { Painel } from './painel.js';
// Mesmo modelo de arte da animação do Big Bang (pasta bigbang/src)
import { criarTexturas } from '../../bigbang/src/texturas.js';
import { globais } from '../../bigbang/src/materiais.js';
import { Ceu } from '../../bigbang/src/universo.js';

// ==================================================================
// Sistemas solares das matérias
//   Sistema A: matérias básicas · Sistema B: matérias técnicas
//   Cada matéria é um planeta: tamanho e número de luas = número de trabalhos.
// ==================================================================

const reduzirMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fraco = matchMedia('(pointer: coarse)').matches || Math.min(innerWidth, innerHeight) < 600;

// Cor final da imagem, igual à do Big Bang: escurecer, saturação e quanto puxa para o roxo
const COR = { escurecer: 1.35, saturacao: 1.4, roxo: 1 };

// Visual de cada planeta, na ordem das matérias em data/3ano.js.
// Mesmos parâmetros dos planetas do sistema solar do Big Bang (src/sistema.js de lá).
const VISUAL = {
  basicas: [
    // Matemática: como Marte (rochoso, rosado, crateras)
    { paleta: ['#b4568e', '#d07aa8', '#9a3f78', '#e3a0c4', '#c06a9a'], crateras: 18, atmosfera: '#f9a8d4', forcaAtmosfera: 0.5 },
    // Linguagens: como Vênus (nuvens claras)
    { paleta: ['#e8d4f5', '#d6b8ee', '#f2e4fa', '#c9a2e6', '#ebd9f7'], nuvens: true, atmosfera: '#f5d0fe' },
    // Humanas: como a Terra (oceanos e nuvens)
    { paleta: ['#2f2f96', '#4a63c8', '#5f45b8', '#62b8d8', '#3a3aa8'], nuvens: true, atmosfera: '#7dd3fc' },
    // Natureza: o Saturno do Big Bang (a que tem mais trabalhos)
    { saturno: true, anel: true, atmosfera: '#c9a6ff', forcaAtmosfera: 1.6 },
  ],
  tecnicas: [
    // Banco de Dados: como Netuno
    { paleta: ['#3b3bb0', '#5a5ad8', '#4848c4', '#7c8cf0', '#3a3aa8'], faixas: true, atmosfera: '#818cf8' },
    // Desenvolvimento de Sistemas: como Júpiter
    { paleta: ['#b04ad0', '#e07ae8', '#8f2fb0', '#f0a6f0', '#c25ad8', '#7c3aed'], faixas: true, atmosfera: '#f0abfc' },
    // Modelagem de Sistemas: como Urano
    { paleta: ['#a5d8f0', '#b7c0ff', '#9ad0ea', '#c9d4ff', '#a8b8f8'], faixas: true, atmosfera: '#a5f3fc' },
    // Implantação (em breve): como Mercúrio
    { paleta: ['#8a7aa0', '#a898c0', '#c4b6dc', '#9888b0', '#ddd2ee'], crateras: 40, atmosfera: '#c4b5fd', forcaAtmosfera: 0.3 },
    // Manutenção (em breve): como Mercúrio, outro tom
    { paleta: ['#7e7396', '#9b8fb4', '#b7aacd', '#8d80a6', '#d2c7e4'], crateras: 30, atmosfera: '#c4b5fd', forcaAtmosfera: 0.3 },
    // Programação de Aplicativos: como Marte
    { paleta: ['#b4568e', '#d07aa8', '#9a3f78', '#e3a0c4', '#c06a9a'], crateras: 12, atmosfera: '#f9a8d4', forcaAtmosfera: 0.5 },
    // Testes (em breve): como Mercúrio, outro tom
    { paleta: ['#8678a0', '#a294bc', '#bfb2d8', '#9284ac', '#d9cfee'], crateras: 34, atmosfera: '#c4b5fd', forcaAtmosfera: 0.3 },
    // IoT: gasoso com anéis
    { paleta: ['#7c3aed', '#a78bfa', '#6d28d9', '#c4b5fd', '#8b5cf6'], faixas: true, anel: true, atmosfera: '#c4b5fd' },
  ],
};
// visual neutro para matéria nova que ainda não tenha um definido acima
const VISUAL_PADRAO = { paleta: ['#8a7aa0', '#a898c0', '#c4b6dc', '#9888b0', '#ddd2ee'], crateras: 20, atmosfera: '#c4b5fd' };

// Escala igual à do sistema solar do Big Bang (sol de raio 19)
const SISTEMAS = [
  {
    id: 'basicas',
    rotulo: 'Sistema A',
    nome: 'Base comum',
    titulo: 'Matérias básicas',
    centro: new THREE.Vector3(-700, 0, 0),
    // sol mais quente (areia, a cor das matérias básicas no portfólio)
    estrela: { raio: 19, nucleo: '#fff1e6', coroa: '#f0c8b4', halo: '#b45a8c', raios: '#fff0e6', luz: '#ffe9dc' },
    corOrbita: '#e9c9b4',
    corTrilha: '#E2C9AB',
  },
  {
    id: 'tecnicas',
    rotulo: 'Sistema B',
    nome: 'Desenvolvimento de Sistemas',
    titulo: 'Matérias técnicas',
    centro: new THREE.Vector3(700, 0, 0),
    // o sol roxo-branco do Big Bang
    estrela: { raio: 19, nucleo: '#f1e4ff', coroa: '#d8b4fe', halo: '#7c3aed', raios: '#f3e8ff', luz: '#ead9ff' },
    corOrbita: '#a78bfa',
    corTrilha: '#B46CC2',
  },
];

// ------------------------------------------------------------------ cena

const palco = document.getElementById('palco');
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, fraco ? 1.5 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.setClearColor('#050009');
palco.appendChild(renderer.domElement);

const cena = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.5, 9000);
cena.add(new THREE.AmbientLight('#9b7be0', 0.2));

// Pós-processamento do Big Bang. A diferença: a imagem é desenhada com antisserrilhado (MSAA),
// para as linhas das órbitas e as bordas dos planetas ficarem lisas.
const alvoRender = new THREE.WebGLRenderTarget(innerWidth * renderer.getPixelRatio(), innerHeight * renderer.getPixelRatio(), {
  type: THREE.HalfFloatType,
  samples: 4,
});
const composer = new EffectComposer(renderer, alvoRender);
composer.addPass(new RenderPass(cena, camera));
const VERT_TELA = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
// limita o brilho antes do bloom: pontos muito estourados viram "quadrados" no desfoque
composer.addPass(
  new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uMax: { value: 2.4 } },
    vertexShader: VERT_TELA,
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
// (limiar mais alto que o do Big Bang: só o sol, os anéis e as atmosferas brilham; as estrelas
//  do fundo ficam de fora, senão o desfoque transforma cada uma num quadradinho apagado)
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.8, 0.45, 0.5);
composer.addPass(bloom);
composer.addPass(new OutputPass());
// cor final: mais escuro e com roxos mais fortes (como no Big Bang)
composer.addPass(
  new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uGama: { value: COR.escurecer }, uSat: { value: COR.saturacao }, uRoxo: { value: COR.roxo } },
    vertexShader: VERT_TELA,
    fragmentShader: `
      uniform sampler2D tDiffuse; uniform float uGama; uniform float uSat; uniform float uRoxo; varying vec2 vUv;
      void main() {
        vec3 c = texture2D(tDiffuse, vUv).rgb;
        float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
        c = max(mix(vec3(l), c, uSat), 0.0);
        c *= mix(vec3(1.0 + 0.04 * uRoxo, 1.0 - 0.2 * uRoxo, 1.0 + 0.08 * uRoxo), vec3(1.0), smoothstep(0.6, 1.0, l));
        c = pow(c, vec3(uGama));
        gl_FragColor = vec4(c, 1.0);
      }`,
  })
);

const controles = new OrbitControls(camera, renderer.domElement);
controles.enableDamping = true;
controles.dampingFactor = 0.06;
controles.enablePan = false;
controles.rotateSpeed = 0.55;
controles.zoomSpeed = 0.7;
// dá para girar a câmera em volta de tudo: de cima até um pouco por baixo do plano das órbitas.
// Com um planeta aberto não chega tão perto dos polos (lá a textura da esfera se fecha num ponto).
const POLAR_SISTEMA = [0.02, 2.2];
const POLAR_PLANETA = [0.55, 2.3];
[controles.minPolarAngle, controles.maxPolarAngle] = POLAR_SISTEMA;
let girarSozinho = !reduzirMovimento; // botão "Girar sozinho"
controles.autoRotate = girarSozinho;
controles.autoRotateSpeed = 0.25;

// ------------------------------------------------------------------ céu e texturas (do Big Bang)

const tex = criarTexturas();
const ceu = new Ceu(cena, tex, fraco ? 0.45 : 1);
// tamanho dos pontos (estrelas) em pixels depende da altura da tela e do campo de visão
function ajustarEscalaPixel() {
  const h = renderer.getDrawingBufferSize(new THREE.Vector2()).y;
  globais.uEscalaPixel.value = h / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
}
ajustarEscalaPixel();

// ------------------------------------------------------------------ sistemas

const dados = typeof PORTFOLIO !== 'undefined' ? PORTFOLIO : { basicas: [], tecnicas: [] };
const todosPlanetas = [];

for (const s of SISTEMAS) {
  s.grupo = new THREE.Group();
  s.grupo.position.copy(s.centro);
  s.grupo.rotation.z = s.id === 'basicas' ? 0.06 : -0.05;
  cena.add(s.grupo);

  s.estrela = new Estrela(tex, s.estrela);
  s.grupo.add(s.estrela.grupo);
  s.estrela.acender = 0;

  // órbitas espaçadas pelo tamanho real de cada planeta (com anéis e luas), para ninguém encostar
  s.planetas = [];
  let raio = s.estrela.raio * 2.3;
  const materias = dados[s.id] || [];
  materias.forEach((m, i) => {
    const visual = (VISUAL[s.id] && VISUAL[s.id][i]) || VISUAL_PADRAO;
    const semente = (s.id === 'basicas' ? 100 : 500) + i * 37;
    const ext = Planeta.extensaoPara(m.atividades.length, !!visual.anel);
    raio += i === 0 ? ext : ext + 6;
    const p = new Planeta(tex, { materia: m, indice: i, raioOrbita: raio, visual, semente, corOrbita: s.corOrbita });
    // mais perto do sol = mais rápido (como as órbitas de verdade, mas mais animado)
    p.velocidade = ((reduzirMovimento ? 0.45 : 1) * 73) / Math.pow(raio, 1.2);
    p.sistema = s;
    raio += ext;
    s.grupo.add(p.plano);
    s.planetas.push(p);
    todosPlanetas.push(p);
  });
  s.raioTotal = raio;
  s.entrada = 0; // 0..1: animação do sistema nascendo
  s.formado = false;
}

// ------------------------------------------------------------------ rótulos (HTML sobre o canvas)

const camadaRotulos = document.getElementById('rotulos');
const pad = (n) => String(n).padStart(2, '0');
for (const p of todosPlanetas) {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = `rotulo ${p.vazio ? 'vazio' : ''}`;
  el.innerHTML =
    `<span class="r-linha"></span>` +
    `<span class="r-caixa"><span class="r-n">${pad(p.indice + 1)}</span>` +
    `<span class="r-nome">${p.materia.nome}</span>` +
    `<span class="r-qtd">${p.vazio ? 'em breve' : `${p.n} ${p.n === 1 ? 'trabalho' : 'trabalhos'}`}</span></span>`;
  el.addEventListener('click', (e) => { e.stopPropagation(); focar(p); });
  el.addEventListener('pointerenter', () => { sobreRotulo = p; });
  el.addEventListener('pointerleave', () => { if (sobreRotulo === p) sobreRotulo = null; });
  camadaRotulos.append(el);
  p.rotulo = el;
}

// ------------------------------------------------------------------ câmera

const TAU = Math.PI * 2;
// Celular em pé: vê o sistema mais de cima, para ele ocupar a altura da tela
// Pontos de vista (botões): elevação da câmera em radianos, acima (+) ou abaixo (-) do plano das órbitas
const VISTAS = {
  inclinado: () => (camera.aspect < 1 ? 1.05 : 0.6), // celular em pé: mais de cima, para ocupar a altura da tela
  cima: () => 1.5,
  rasante: () => 0.12,
  baixo: () => -0.5,
};
let vistaAtual = 'inclinado';
const elevacaoVisao = () => VISTAS[vistaAtual]();
// distância para o sistema caber inteiro na tela, com margem para a interface do topo e do rodapé
function distanciaVisao(s, elevacao = elevacaoVisao()) {
  const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const tanH = tanV * camera.aspect;
  const R = s.raioTotal;
  return Math.max(R * 1.6, (R * 1.15) / tanH, (R * (Math.abs(Math.sin(elevacao)) + 0.32)) / tanV);
}
function posicaoVisao(s, out, azimute = 0.55, elevacao = elevacaoVisao()) {
  const d = distanciaVisao(s, elevacao);
  return out.set(Math.sin(azimute) * Math.cos(elevacao), Math.sin(elevacao), Math.cos(azimute) * Math.cos(elevacao)).multiplyScalar(d).add(alvoVisao(s, vAlvoTmp, azimute));
}
// a câmera mira um pouco à frente do sol (do lado dela): a borda de perto da órbita,
// que a perspectiva aumenta, não fica escondida embaixo da legenda
const vAlvoTmp = new THREE.Vector3();
function alvoVisao(s, out, azimute = 0.55) {
  // (no celular em pé o contrário: desce o sistema para o espaço livre entre os botões e a legenda)
  const k = camera.aspect < 1 ? -0.12 : 0.16;
  return out.set(Math.sin(azimute), 0, Math.cos(azimute)).multiplyScalar(s.raioTotal * k).add(s.centro);
}

// Viagem da câmera: de onde estiver até um destino (que pode estar se movendo)
let viagem = null;
const suave = (x) => x * x * x * (x * (x * 6 - 15) + 10);
// (durante a viagem o zoom fica sem limites; os limites do destino valem na chegada)
function viajar({ destinoPos, destinoAlvo, duracao, arco = 0, limites, polar = POLAR_SISTEMA, aoChegar }) {
  controles.minDistance = 0;
  controles.maxDistance = Infinity;
  controles.minPolarAngle = 0;
  controles.maxPolarAngle = Math.PI;
  viagem = {
    limites,
    polar,
    t: 0,
    duracao: reduzirMovimento ? Math.min(duracao, 0.8) : duracao,
    deP: camera.position.clone(),
    deA: controles.target.clone(),
    destinoPos,
    destinoAlvo,
    arco: reduzirMovimento ? 0 : arco,
    aoChegar,
  };
  controles.enabled = false;
}
const vP = new THREE.Vector3();
const vCima = new THREE.Vector3();
const vA = new THREE.Vector3();
function passoViagem(dt) {
  if (!viagem) return;
  viagem.t += dt;
  const k = Math.min(1, viagem.t / viagem.duracao);
  const e = suave(k);
  viagem.destinoPos(vP);
  viagem.destinoAlvo(vA);
  camera.position.lerpVectors(viagem.deP, vP, e);
  camera.position.y += Math.sin(Math.PI * k) * viagem.arco;
  controles.target.lerpVectors(viagem.deA, vA, e);
  if (k >= 1) {
    const fim = viagem.aoChegar;
    if (viagem.limites) [controles.minDistance, controles.maxDistance] = viagem.limites;
    [controles.minPolarAngle, controles.maxPolarAngle] = viagem.polar;
    viagem = null;
    controles.enabled = true;
    if (fim) fim();
  }
}

// ------------------------------------------------------------------ estado e interface

const ui = {
  botoes: [...document.querySelectorAll('[data-sistema]')],
  titulo: document.getElementById('titulo-sistema'),
  kicker: document.getElementById('kicker-sistema'),
  linha: document.getElementById('linha-painel'),
  dica: document.getElementById('dica-lua'),
  lightbox: document.getElementById('lightbox'),
};

// Painel da matéria (o que aparece ao clicar num planeta)
const painel = new Painel(document.getElementById('painel'), {
  focarLua: (k) => { if (focado) focado.luaEmDestaque = k; },
  selecionarLua: (k) => { if (focado) focado.luaEmDestaque = k; },
  irPara: (p) => focar(p),
  fechar: () => desfocar(),
});
const celular = () => innerWidth <= 720;
// quanto a cena anda para o lado (ou para cima) para o planeta não ficar embaixo do painel
function deslocamentoPainel() {
  if (!focado) return [0, 0];
  // (no celular, com um trabalho aberto, o painel cresce e o planeta sobe mais)
  if (celular()) return [0, innerHeight * (painel.aberto !== null ? 0.4 : 0.31)];
  const largura = Math.min(560, innerWidth * 0.42);
  return [(largura + 28) / 2, 0];
}

let atual = null; // sistema na tela
let focado = null; // planeta clicado
let sobre = null; // planeta com o mouse em cima (no canvas)
let sobreRotulo = null; // planeta com o mouse em cima (no rótulo)
let ritmo = 1; // velocidade do tempo das órbitas (diminui no hover e no foco)

function mostrarSistema(s, primeiraVez = false) {
  if (focado) desfocar(false);
  const anterior = atual;
  atual = s;
  ui.botoes.forEach((b) => {
    const on = b.dataset.sistema === s.id;
    b.classList.toggle('ativo', on);
    b.setAttribute('aria-pressed', String(on));
  });
  ui.kicker.textContent = `${s.rotulo} · ${s.nome}`;
  ui.titulo.textContent = s.titulo;
  document.documentElement.style.setProperty('--trilha', s.corTrilha);

  const destino = (out) => posicaoVisao(s, out);
  const alvo = (out) => alvoVisao(s, out);
  const limites = [s.raioTotal * 0.35, distanciaVisao(s) * 1.9];
  if (primeiraVez) {
    // chegada: começa longe e mergulha no sistema enquanto ele se forma
    posicaoVisao(s, camera.position, 0.95, 0.9).sub(s.centro).multiplyScalar(3.2).add(s.centro);
    alvoVisao(s, controles.target);
    viajar({ destinoPos: destino, destinoAlvo: alvo, duracao: 3.4, limites });
  } else {
    viajar({ destinoPos: destino, destinoAlvo: alvo, duracao: anterior ? 2.6 : 1.6, arco: anterior ? 320 : 0, limites });
  }
  if (!s.formado) {
    s.formado = true;
    s.inicioEntrada = relogio + (primeiraVez ? 0.4 : 1.2);
  }
}

function focar(p) {
  if (!p || p === focado) return;
  if (p.sistema !== atual) return;
  if (focado) focado.luaEmDestaque = null;
  focado = p;
  document.body.classList.add('com-foco');
  const lista = p.sistema.planetas;
  const i = lista.indexOf(p);
  painel.abrir(p, p.sistema, [lista[(i - 1 + lista.length) % lista.length], lista[(i + 1) % lista.length]]);
  // mais longe quando a tela está em pé (o campo de visão na horizontal é estreito)
  // e um pouco mais longe com o painel aberto, para as luas caberem na área livre
  const dist = Math.max(p.raio * (p.anel ? 7.6 : 7.2), 46) * (camera.aspect < 1 ? 1.9 : 1);
  const desvio = new THREE.Vector3();
  const lado = new THREE.Vector3();
  // câmera ao lado do planeta, um pouco para o lado do sol e acima: vê a face iluminada
  // (e não a noite do planeta, que é o que se veria olhando contra o sol)
  const destinoPos = (out) => {
    p.posicaoMundo(out);
    desvio.copy(out).sub(p.sistema.centro).setY(0).normalize();
    lado.set(-desvio.z, 0, desvio.x);
    return out.addScaledVector(lado, dist * 0.78).addScaledVector(desvio, -dist * 0.42).add(vCima.set(0, dist * 0.42, 0));
  };
  const destinoAlvo = (out) => p.posicaoMundo(out);
  controles.autoRotate = false;
  viajar({
    destinoPos,
    destinoAlvo,
    duracao: 1.6,
    limites: [p.raio * 2.5, dist * 3],
    polar: POLAR_PLANETA,
    aoChegar: () => p.posicaoMundo(posFocoAnterior),
  });
}

function desfocar(voltarCamera = true) {
  if (!focado) return;
  focado.luaEmDestaque = null;
  focado = null;
  document.body.classList.remove('com-foco');
  painel.fechar();
  controles.autoRotate = girarSozinho;
  if (voltarCamera && atual) {
    viajar({
      destinoPos: (out) => posicaoVisao(atual, out),
      destinoAlvo: (out) => alvoVisao(atual, out),
      duracao: 1.6,
      limites: [atual.raioTotal * 0.35, distanciaVisao(atual) * 1.9],
    });
  }
}

// ------------------------------------------------------------------ pontos de vista

// Leva a câmera para o ponto de vista escolhido, mantendo o lado de onde ela olha.
// Com um planeta aberto, gira em volta dele (na mesma distância); senão, enquadra o sistema inteiro.
const vRel = new THREE.Vector3();
function aplicarVista(nome) {
  if (!VISTAS[nome] || viagem) return;
  vistaAtual = nome;
  document.querySelectorAll('[data-vista]').forEach((b) => {
    const on = b.dataset.vista === nome;
    b.classList.toggle('ativo', on);
    b.setAttribute('aria-pressed', String(on));
  });
  vRel.copy(camera.position).sub(controles.target);
  const azimute = Math.atan2(vRel.x, vRel.z);
  let elev = elevacaoVisao();
  if (focado) {
    const p = focado;
    const d = vRel.length();
    elev = Math.min(elev, Math.PI / 2 - POLAR_PLANETA[0]);
    const dir = new THREE.Vector3(Math.sin(azimute) * Math.cos(elev), Math.sin(elev), Math.cos(azimute) * Math.cos(elev));
    viajar({
      destinoPos: (out) => p.posicaoMundo(out).addScaledVector(dir, d),
      destinoAlvo: (out) => p.posicaoMundo(out),
      duracao: 1.3,
      limites: [controles.minDistance, controles.maxDistance],
      polar: POLAR_PLANETA,
      aoChegar: () => p.posicaoMundo(posFocoAnterior),
    });
  } else if (atual) {
    const s = atual;
    viajar({
      destinoPos: (out) => posicaoVisao(s, out, azimute, elev),
      destinoAlvo: (out) => alvoVisao(s, out, azimute),
      duracao: 1.5,
      limites: [s.raioTotal * 0.35, distanciaVisao(s) * 1.9],
    });
  }
}
document.querySelectorAll('[data-vista]').forEach((b) => b.addEventListener('click', () => aplicarVista(b.dataset.vista)));
const botaoGirar = document.getElementById('girar-sozinho');
if (botaoGirar) {
  botaoGirar.setAttribute('aria-pressed', String(girarSozinho));
  botaoGirar.addEventListener('click', () => {
    girarSozinho = !girarSozinho;
    botaoGirar.setAttribute('aria-pressed', String(girarSozinho));
    botaoGirar.classList.toggle('ativo', girarSozinho);
    if (!focado) controles.autoRotate = girarSozinho;
  });
  botaoGirar.classList.toggle('ativo', girarSozinho);
}

ui.botoes.forEach((b) => b.addEventListener('click', () => {
  const s = SISTEMAS.find((x) => x.id === b.dataset.sistema);
  if (s && s !== atual) mostrarSistema(s);
}));
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!ui.lightbox.hidden) fecharLightbox();
    else desfocar();
    return;
  }
  // (teclas de atalho só fora de campos e botões do painel)
  if (e.target.closest && e.target.closest('#painel')) return;
  if (e.key === '1') mostrarSistema(SISTEMAS[0]);
  if (e.key === '2') mostrarSistema(SISTEMAS[1]);
  if (focado && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
    const lista = focado.sistema.planetas;
    const i = lista.indexOf(focado) + (e.key === 'ArrowRight' ? 1 : -1);
    focar(lista[(i + lista.length) % lista.length]);
  }
});

// imagens dos trabalhos abrem grandes
document.addEventListener('click', (e) => {
  const z = e.target.closest('[data-zoom]');
  if (z) {
    ui.lightbox.querySelector('img').src = z.dataset.zoom;
    ui.lightbox.hidden = false;
    requestAnimationFrame(() => ui.lightbox.classList.add('on'));
    return;
  }
  if (e.target.closest('#lightbox')) fecharLightbox();
});
function fecharLightbox() {
  ui.lightbox.classList.remove('on');
  setTimeout(() => { ui.lightbox.hidden = true; }, 250);
}

// ------------------------------------------------------------------ mouse / toque

const raycaster = new THREE.Raycaster();
const ponteiro = new THREE.Vector2();
let ponteiroDentro = false;
let arrastou = false;
let inicioToque = null;
renderer.domElement.addEventListener('pointermove', (e) => {
  ponteiro.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ponteiroDentro = true;
  if (inicioToque && Math.hypot(e.clientX - inicioToque[0], e.clientY - inicioToque[1]) > 6) arrastou = true;
});
renderer.domElement.addEventListener('pointerleave', () => { ponteiroDentro = false; });
renderer.domElement.addEventListener('pointerdown', (e) => {
  inicioToque = [e.clientX, e.clientY];
  arrastou = false;
  ponteiro.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
});
renderer.domElement.addEventListener('pointerup', () => {
  inicioToque = null;
  if (arrastou) return; // foi um arrasto para girar, não um clique
  // com um planeta aberto, clicar numa lua dele abre o trabalho dela no painel
  const l = luaSobPonteiro();
  if (l !== null) { painel.abrirCartao(l, true); return; }
  const p = planetaSobPonteiro();
  if (p) focar(p);
});

const alvosClique = () => (atual ? atual.planetas.filter((p) => p.entrada > 0.9).map((p) => p.alvo) : []);
function planetaSobPonteiro() {
  raycaster.setFromCamera(ponteiro, camera);
  const hit = raycaster.intersectObjects(alvosClique(), false)[0];
  return hit ? hit.object.userData.planeta : null;
}
function luaSobPonteiro() {
  if (!focado || !focado.luas.length || viagem) return null;
  raycaster.setFromCamera(ponteiro, camera);
  const hit = raycaster.intersectObjects(focado.luas.map((l) => l.alvo), false)[0];
  return hit ? hit.object.userData.lua : null;
}

// ------------------------------------------------------------------ tela

function redimensionar() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
  bloom.resolution.set(innerWidth, innerHeight);
  ajustarEscalaPixel();
  if (atual && !focado && !viagem) {
    controles.maxDistance = distanciaVisao(atual) * 1.9;
  }
}
addEventListener('resize', redimensionar);

// ------------------------------------------------------------------ quadro a quadro

let relogio = 0;
let luaSobre = null; // lua (trabalho) com o mouse em cima, no planeta aberto
const desloc = [0, 0];
const posFocoAnterior = new THREE.Vector3();
const vSegue = new THREE.Vector3();
let ultimo = performance.now();
const vTela = new THREE.Vector3();
const vCam = new THREE.Vector3();

function quadro(agora) {
  const dt = Math.min((agora - ultimo) / 1000, 0.05);
  ultimo = agora;
  relogio += dt;

  // hover (no canvas ou no rótulo); com um planeta aberto, as luas dele também respondem
  luaSobre = ponteiroDentro && !inicioToque ? luaSobPonteiro() : null;
  sobre = sobreRotulo || (ponteiroDentro && !viagem && !inicioToque && luaSobre === null ? planetaSobPonteiro() : null);
  if (sobre === focado) sobre = null;
  renderer.domElement.style.cursor = sobre || luaSobre !== null ? 'pointer' : '';
  if (focado) focado.luaEmDestaque = luaSobre ?? painel.sobre ?? painel.aberto;

  // a cena anda para o lado (ou para cima) para o planeta aberto ficar na área livre ao lado do painel
  const [alvoDx, alvoDy] = deslocamentoPainel();
  desloc[0] += (alvoDx - desloc[0]) * (1 - Math.exp(-dt * 4));
  desloc[1] += (alvoDy - desloc[1]) * (1 - Math.exp(-dt * 4));
  if (Math.abs(desloc[0]) < 0.5 && Math.abs(desloc[1]) < 0.5) {
    if (camera.view && camera.view.enabled) camera.clearViewOffset();
  } else {
    camera.setViewOffset(innerWidth, innerHeight, desloc[0], desloc[1], innerWidth, innerHeight);
  }
  const ritmoAlvo = focado ? 0.12 : sobre ? 0.25 : 1;
  ritmo += (ritmoAlvo - ritmo) * (1 - Math.exp(-dt * 4));

  globais.camPos.copy(camera.position);

  for (const s of SISTEMAS) {
    // nascimento do sistema: o sol acende e os planetas saem dele, um de cada vez
    if (s.formado) s.entrada = Math.min(1, Math.max(0, relogio - s.inicioEntrada) / 3.2);
    const ka = Math.min(1, s.entrada * 3);
    s.estrela.acender = s.formado ? 1 - Math.pow(1 - ka, 3) : 0.35; // de longe já brilha um pouco
    s.estrela.atualizar(relogio);
    const n = s.planetas.length;
    s.planetas.forEach((p, i) => {
      const ini = 0.12 + (i / Math.max(1, n)) * 0.55;
      p.entrada = s.formado ? Math.min(1, Math.max(0, (s.entrada - ini) / 0.38)) : 0;
      const destaque = p === focado || p === sobre;
      p.escalaAlvo = destaque ? 1.18 : 1;
      p.destaque += ((destaque ? 1 : 0) - p.destaque) * (1 - Math.exp(-dt * 8));
      // no foco, as outras órbitas ficam mais apagadas
      p.atualizar(dt, relogio, ritmo, !!focado && p !== focado);
    });
  }

  passoViagem(dt);
  // no foco, a câmera acompanha o planeta enquanto ele anda na órbita (e a pessoa pode girar em volta dele)
  if (focado && !viagem) {
    focado.posicaoMundo(vSegue);
    vSegue.sub(posFocoAnterior);
    camera.position.add(vSegue);
    controles.target.add(vSegue);
    focado.posicaoMundo(posFocoAnterior);
    mostrarLuaEmDestaque(dt);
  }
  controles.update();

  posicionarRotulos();
  desenharLinhaPainel();

  // céu do Big Bang: acompanha a câmera (as estrelas ficam sempre ao fundo)
  ceu.atualizar(relogio, camera, 1);
  composer.render();
}

// ------------------------------------------------------------------ rótulos na tela

// Cada rótulo fica à direita do seu planeta; se dois se encostam, o de baixo desce e o de cima sobe
// (o de quem está em destaque não se mexe)
const caixas = [];
function posicionarRotulos() {
  caixas.length = 0;
  const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  for (const p of todosPlanetas) {
    const el = p.rotulo;
    // (com um planeta aberto, o nome dele está no painel: os rótulos somem)
    const visivel = p.sistema === atual && p.entrada > 0.85 && !focado && !viagem;
    p.posicaoMundo(vTela);
    vCam.copy(vTela).project(camera);
    const naFrente = vCam.z < 1 && Math.abs(vCam.x) < 1.15 && Math.abs(vCam.y) < 1.15;
    const on = visivel && naFrente;
    el.classList.toggle('on', on);
    el.classList.toggle('destaque', p === sobre || p === focado);
    if (!on) continue;
    if (!p.tamRotulo || p.tamRotuloEm !== innerWidth) {
      p.tamRotulo = [el.offsetWidth, el.offsetHeight];
      p.tamRotuloEm = innerWidth;
    }
    const distCam = camera.position.distanceTo(vTela);
    const raioTela = ((p.raio * p.escala) / (distCam * tanV)) * (innerHeight / 2);
    const xPlaneta = (vCam.x * 0.5 + 0.5) * innerWidth;
    const yPlaneta = (-vCam.y * 0.5 + 0.5) * innerHeight;
    const [l, a] = p.tamRotulo;
    // à direita do planeta; se não couber na tela, vai para a esquerda
    // (se não couber de nenhum lado, fica no lado com mais espaço, preso dentro da tela)
    const sobraDir = innerWidth - 8 - (xPlaneta + raioTela + 4 + l);
    const sobraEsq = xPlaneta - raioTela - 4 - l - 8;
    const esq = sobraDir < 0 && sobraEsq > sobraDir;
    el.classList.toggle('esq', esq);
    let x = esq ? xPlaneta - raioTela - 4 - l : xPlaneta + raioTela + 4;
    x = Math.min(Math.max(x, 8), innerWidth - 8 - l);
    caixas.push({ p, el, x, y: yPlaneta, yPlaneta, l, a, esq, fixo: p === sobre || p === focado });
  }
  // afasta (algumas passadas resolvem os casos com três ou mais rótulos juntos)
  const folga = 4;
  for (let passo = 0; passo < 4; passo++) {
    caixas.sort((a, b) => a.y - b.y);
    for (let i = 0; i < caixas.length; i++) {
      for (let j = i + 1; j < caixas.length; j++) {
        const A = caixas[i];
        const B = caixas[j];
        if (A.x + A.l < B.x || B.x + B.l < A.x) continue;
        const sobra = (A.a + B.a) / 2 + folga - (B.y - A.y);
        if (sobra <= 0) continue;
        if (A.fixo) B.y += sobra;
        else if (B.fixo) A.y -= sobra;
        else { A.y -= sobra / 2; B.y += sobra / 2; }
      }
    }
  }
  const vao = innerWidth <= 720 ? 10 : 18; // largura da linha (igual ao CSS)
  for (const c of caixas) {
    // a linha fina sai da altura do planeta e chega no meio da caixa, mesmo se ela foi deslocada
    const dy = c.yPlaneta - c.y;
    c.el.style.setProperty('--dy', `${dy.toFixed(1)}px`);
    c.el.style.setProperty('--len', `${Math.hypot(vao, dy).toFixed(1)}px`);
    c.el.style.setProperty('--ang', `${(c.esq ? Math.atan2(dy, vao) : Math.atan2(-dy, vao)).toFixed(3)}rad`);
    c.el.style.transform = `translate(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px)`;
  }
}

// ------------------------------------------------------------------ lua em destaque à vista

// Quando um trabalho está em destaque, a câmera gira devagar em volta do planeta até a lua dele
// ficar à vista: um pouco à direita do planeta e virada para a câmera (do lado do painel,
// sem ficar embaixo dele). Quem estiver girando com o mouse tem prioridade.
const vLua = new THREE.Vector3();
const vCamRel = new THREE.Vector3();
const vDir = new THREE.Vector3();
const vDesejo = new THREE.Vector3();
const EIXO_Y = new THREE.Vector3(0, 1, 0);
function mostrarLuaEmDestaque(dt) {
  const k = focado.luaEmDestaque;
  if (k === null || !focado.luas[k] || inicioToque) return;
  focado.posicaoLua(k, vLua).sub(controles.target).setY(0);
  vCamRel.copy(camera.position).sub(controles.target);
  const camHoriz = vDir.copy(vCamRel).setY(0);
  if (vLua.lengthSq() < 1e-4 || camHoriz.lengthSq() < 1e-4) return;
  vLua.normalize();
  camHoriz.normalize();
  // direita da tela, no plano horizontal
  const direita = vDesejo.setFromMatrixColumn(camera.matrixWorld, 0).setY(0).normalize();
  // (no celular a lua vai para a frente do planeta: não há painel ao lado)
  const desejo = direita.multiplyScalar(celular() ? 0.3 : 0.5).addScaledVector(camHoriz, 0.9).normalize();
  // ângulo (em volta do eixo vertical) que leva a direção desejada até a lua
  const ang = Math.atan2(desejo.clone().cross(vLua).y, desejo.dot(vLua));
  if (Math.abs(ang) < 0.01) return;
  const passo = ang * (1 - Math.exp(-dt * 3));
  vCamRel.applyAxisAngle(EIXO_Y, passo);
  camera.position.copy(controles.target).add(vCamRel);
}

// ------------------------------------------------------------------ linha até o painel

// A linha do desenho: sai do planeta aberto (ou da lua do trabalho em destaque) e chega no painel.
// Perto da lua aparece o nome do trabalho dela.
const vLinha = new THREE.Vector3();
function paraTela(v) {
  vCam.copy(v).project(camera);
  return { x: (vCam.x * 0.5 + 0.5) * innerWidth, y: (-vCam.y * 0.5 + 0.5) * innerHeight, frente: vCam.z < 1 };
}
function desenharLinhaPainel() {
  const linha = ui.linha;
  const ativo = focado && !viagem && !celular() && document.getElementById('painel').classList.contains('on');
  linha.classList.toggle('on', !!ativo);
  // (no celular o nome da lua não aparece: o trabalho já está aberto no painel, e não há espaço livre em cima)
  const kDica = focado && !viagem && !celular() ? (luaSobre ?? painel.sobre ?? painel.aberto) : null;
  // nome do trabalho perto da lua
  if (focado && kDica !== null && focado.luas[kDica]) {
    const t = paraTela(focado.posicaoLua(kDica, vLinha));
    if (t.frente) {
      const texto = `Lua ${pad(kDica + 1)} · ${focado.materia.atividades[kDica].titulo}`;
      if (ui.dica.textContent !== texto) ui.dica.textContent = texto;
      // centralizado em cima da lua, mas sempre dentro da tela
      const l = ui.dica.offsetWidth;
      // (não passa por baixo do painel)
      const limite = document.getElementById('painel').classList.contains('on') ? document.getElementById('painel').getBoundingClientRect().left - 12 : innerWidth - 8;
      const x = Math.min(Math.max(t.x - l / 2, 8), limite - l);
      ui.dica.style.transform = `translate(${x.toFixed(1)}px, ${(t.y - 16).toFixed(1)}px) translateY(-100%)`;
      ui.dica.classList.add('on');
    } else ui.dica.classList.remove('on');
  } else ui.dica.classList.remove('on');
  if (!ativo) return;

  const a = painel.ancora();
  let origem;
  if (a.lua !== null && focado.luas[a.lua]) {
    origem = paraTela(focado.posicaoLua(a.lua, vLinha));
  } else {
    // borda do planeta virada para o painel
    origem = paraTela(focado.posicaoMundo(vLinha));
    const distCam = camera.position.distanceTo(vLinha);
    const raioTela = ((focado.raio * focado.escala) / (distCam * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)))) * (innerHeight / 2);
    origem.x += raioTela * 1.05;
  }
  // um cotovelo: anda na horizontal e depois vai até o painel
  const meioX = origem.x + (a.x - origem.x) * 0.55;
  linha.querySelector('path').setAttribute('d', `M${origem.x.toFixed(1)},${origem.y.toFixed(1)} L${meioX.toFixed(1)},${origem.y.toFixed(1)} L${(a.x - 10).toFixed(1)},${a.y.toFixed(1)} L${a.x.toFixed(1)},${a.y.toFixed(1)}`);
  const [c0, c1] = linha.querySelectorAll('circle');
  c0.setAttribute('cx', origem.x.toFixed(1));
  c0.setAttribute('cy', origem.y.toFixed(1));
  c1.setAttribute('cx', a.x.toFixed(1));
  c1.setAttribute('cy', a.y.toFixed(1));
}

// ------------------------------------------------------------------ começo

mostrarSistema(SISTEMAS[0], true);
renderer.setAnimationLoop(quadro);
document.body.classList.add('pronto');
