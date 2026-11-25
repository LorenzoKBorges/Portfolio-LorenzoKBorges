import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { Estrela, Planeta } from './corpos.js';
import { aleatorio, texturaBrilho } from './texturas.js';

// ==================================================================
// Sistemas solares das matérias
//   Sistema A: matérias básicas · Sistema B: matérias técnicas
//   Cada matéria é um planeta: tamanho e número de luas = número de trabalhos.
// ==================================================================

const reduzirMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fraco = matchMedia('(pointer: coarse)').matches || Math.min(innerWidth, innerHeight) < 600;

// Visual de cada planeta, na ordem das matérias em data/3ano.js
const VISUAL = {
  basicas: [
    // Matemática · Linguagens · Humanas · Natureza
    { tipo: 'rocha', cores: ['#5b4636', '#a8876a', '#e2c9ab', '#f3e6d4'], atmosfera: '#e2c9ab', orbita: '#e2c9ab', lua: '#d9cdbd' },
    { tipo: 'gas', cores: ['#4a2340', '#9a4d7a', '#d68fb2', '#f4d6e6'], atmosfera: '#f0abfc', orbita: '#e7b6cf', lua: '#e4d3dc', anel: ['#b77a9a', '#f1d3e2', '#8c5a74'] },
    { tipo: 'gelo', cores: ['#23304f', '#3f5d8c', '#8fb0d9', '#dfe9f6'], atmosfera: '#9fc3ff', orbita: '#b8c9e6', lua: '#d3dbe8' },
    { tipo: 'gas', cores: ['#123b33', '#2f7a5f', '#7fc3a0', '#e3f2e4'], atmosfera: '#8ef0c2', orbita: '#a9dcc4', lua: '#d1e3da', anel: ['#5f9c84', '#cfeee0', '#3d6b5a'] },
  ],
  tecnicas: [
    // Banco de Dados · Desenvolvimento · Modelagem · Implantação · Manutenção · Aplicativos · Testes · IoT
    { tipo: 'rocha', cores: ['#1f1645', '#45348f', '#8a78e0', '#d8d0ff'], atmosfera: '#a99bff', orbita: '#b4a6ff', lua: '#d6d0f0' },
    { tipo: 'gas', cores: ['#3a0f45', '#7a2a8c', '#c06bd4', '#f2d6fa'], atmosfera: '#e09bff', orbita: '#d9a6ec', lua: '#e3d4ea', anel: ['#9c5bb0', '#efd2f7', '#6a3a7a'] },
    { tipo: 'gelo', cores: ['#162a45', '#2f5a8f', '#7ea9dd', '#e1ecfa'], atmosfera: '#8fc0ff', orbita: '#aac4e6', lua: '#d2dcea' },
    { tipo: 'rocha', orbita: '#8a8496', cores: [], atmosfera: '', lua: '' },
    { tipo: 'rocha', orbita: '#8a8496', cores: [], atmosfera: '', lua: '' },
    { tipo: 'gas', cores: ['#40143a', '#8f3a7d', '#e58cc6', '#fbe3f2'], atmosfera: '#ff9fdc', orbita: '#eab0d5', lua: '#ecd6e3' },
    { tipo: 'rocha', orbita: '#8a8496', cores: [], atmosfera: '', lua: '' },
    { tipo: 'gas', cores: ['#2b1150', '#5b2fa0', '#a679f0', '#ece0ff'], atmosfera: '#b892ff', orbita: '#c3a8f5', lua: '#ddd2f2', anel: ['#7d5bc0', '#e6dcff', '#4d3a80'] },
  ],
};
// visual neutro para quem não tiver um definido acima (ex.: matéria nova)
const VISUAL_PADRAO = { tipo: 'rocha', cores: ['#2b2340', '#5d4d8a', '#a99bd6', '#e6e0f7'], atmosfera: '#b4a6ff', orbita: '#b4a6ff', lua: '#d6d0f0' };

const SISTEMAS = [
  {
    id: 'basicas',
    rotulo: 'Sistema A',
    nome: 'Base comum',
    titulo: 'Matérias básicas',
    centro: new THREE.Vector3(-150, 0, 0),
    estrela: { raio: 4.2, cor: '#fff3e0', corBorda: '#e2a86f', semente: 11 },
    corTrilha: '#E2C9AB',
  },
  {
    id: 'tecnicas',
    rotulo: 'Sistema B',
    nome: 'Desenvolvimento de Sistemas',
    titulo: 'Matérias técnicas',
    centro: new THREE.Vector3(150, 0, 0),
    estrela: { raio: 4.6, cor: '#f3e8ff', corBorda: '#9b4dd6', semente: 23 },
    corTrilha: '#B46CC2',
  },
];

// ------------------------------------------------------------------ cena

const palco = document.getElementById('palco');
const renderer = new THREE.WebGLRenderer({ antialias: !fraco, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, fraco ? 1.5 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.setClearColor('#07070c');
palco.appendChild(renderer.domElement);

const cena = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 4000);
cena.add(new THREE.AmbientLight('#8c7fb8', 0.16));

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(cena, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.8, 0.4, 0.62);
composer.addPass(bloom);
composer.addPass(new OutputPass());

const controles = new OrbitControls(camera, renderer.domElement);
controles.enableDamping = true;
controles.dampingFactor = 0.06;
controles.enablePan = false;
controles.rotateSpeed = 0.55;
controles.zoomSpeed = 0.7;
controles.minPolarAngle = 0.15;
controles.maxPolarAngle = 1.45; // não deixa passar por baixo do plano
controles.autoRotate = !reduzirMovimento;
controles.autoRotateSpeed = 0.25;

// ------------------------------------------------------------------ céu

function criarCeu() {
  const rnd = aleatorio(2026);
  const n = fraco ? 2200 : 4200;
  const pos = new Float32Array(n * 3);
  const cor = new Float32Array(n * 3);
  const tam = new Float32Array(n);
  const paleta = [new THREE.Color('#ffffff'), new THREE.Color('#d9c8ff'), new THREE.Color('#e2c9ab'), new THREE.Color('#b8a2ff')];
  for (let i = 0; i < n; i++) {
    const u = rnd() * 2 - 1;
    const th = rnd() * Math.PI * 2;
    const r = 1400 + rnd() * 600;
    const s = Math.sqrt(1 - u * u);
    pos.set([Math.cos(th) * s * r, u * r, Math.sin(th) * s * r], i * 3);
    const c = paleta[rnd() < 0.7 ? 0 : 1 + Math.floor(rnd() * 3)];
    cor.set([c.r, c.g, c.b], i * 3);
    tam[i] = rnd() < 0.94 ? 1 + rnd() * 1.6 : 2.6 + rnd() * 2;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(cor, 3));
  geo.setAttribute('aTam', new THREE.BufferAttribute(tam, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTempo: { value: 0 }, uPixel: { value: renderer.getPixelRatio() } },
    vertexShader: `
      attribute float aTam; varying vec3 vCor; varying float vPisca; uniform float uTempo; uniform float uPixel;
      void main() { vCor = color; vPisca = 0.65 + 0.35 * sin(uTempo * (0.6 + fract(position.x) * 2.0) + position.y);
        gl_PointSize = aTam * uPixel; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      varying vec3 vCor; varying float vPisca;
      void main() { float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vCor * vPisca, a * vPisca); }`,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
  });
  const pontos = new THREE.Points(geo, mat);
  cena.add(pontos);

  // nuvens de nebulosa bem fracas, para dar profundidade
  const tex = texturaBrilho();
  const nuvens = [
    ['#4b1f6e', -500, 120, -900, 900],
    ['#2c1452', 700, -160, -1000, 1100],
    ['#5a2a4e', 100, 300, 1100, 900],
    ['#1f2a5a', -900, -200, 400, 800],
  ];
  for (const [c, x, y, z, s] of nuvens) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: c, transparent: true, opacity: 0.2, depthWrite: false, blending: THREE.AdditiveBlending }));
    sp.position.set(x, y, z);
    sp.scale.setScalar(s);
    cena.add(sp);
  }
  return mat;
}
const matCeu = criarCeu();

// ------------------------------------------------------------------ sistemas

const dados = typeof PORTFOLIO !== 'undefined' ? PORTFOLIO : { basicas: [], tecnicas: [] };
const todosPlanetas = [];

for (const s of SISTEMAS) {
  s.grupo = new THREE.Group();
  s.grupo.position.copy(s.centro);
  s.grupo.rotation.z = s.id === 'basicas' ? 0.06 : -0.05;
  cena.add(s.grupo);

  s.estrela = new Estrela(s.estrela);
  s.grupo.add(s.estrela.grupo);
  s.estrela.acender = 0;

  // órbitas espaçadas pelo tamanho real de cada planeta (com as luas), para ninguém encostar
  s.planetas = [];
  let raio = s.estrela.raio * 2.6;
  const materias = dados[s.id] || [];
  materias.forEach((m, i) => {
    const visual = (VISUAL[s.id] && VISUAL[s.id][i]) || VISUAL_PADRAO;
    const semente = (s.id === 'basicas' ? 100 : 500) + i * 37;
    // primeiro cria para saber o tamanho, depois ajusta o raio da órbita
    const tmpN = m.atividades.length;
    const tmpRaio = tmpN === 0 ? 0.9 : 1.1 + 0.32 * tmpN;
    const ext = tmpRaio * 1.7 + 1.35;
    raio += i === 0 ? ext : ext + 1.6;
    const p = new Planeta({ materia: m, indice: i, raioOrbita: raio, visual, semente, velocidade: 0 });
    // mais perto do sol = mais rápido (como as órbitas de verdade, mas mais animado)
    p.velocidade = (reduzirMovimento ? 0.45 : 1) * 13.4 / Math.pow(raio, 1.2);
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
const elevacaoVisao = () => (camera.aspect < 1 ? 1.05 : 0.6);
// distância para o sistema caber inteiro na tela, com margem para a interface do topo e do rodapé
function distanciaVisao(s, elevacao = elevacaoVisao()) {
  const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const tanH = tanV * camera.aspect;
  const R = s.raioTotal;
  return Math.max(R * 1.6, (R * 1.15) / tanH, (R * (Math.sin(elevacao) + 0.32)) / tanV);
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
function viajar({ destinoPos, destinoAlvo, duracao, arco = 0, limites, aoChegar }) {
  controles.minDistance = 0;
  controles.maxDistance = Infinity;
  viagem = {
    limites,
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
  foco: document.getElementById('foco'),
  focoNome: document.getElementById('foco-nome'),
  focoQtd: document.getElementById('foco-qtd'),
  focoN: document.getElementById('foco-n'),
  voltar: document.getElementById('foco-voltar'),
};

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
    viajar({ destinoPos: destino, destinoAlvo: alvo, duracao: anterior ? 2.6 : 1.6, arco: anterior ? 70 : 0, limites });
  }
  if (!s.formado) {
    s.formado = true;
    s.inicioEntrada = relogio + (primeiraVez ? 0.4 : 1.2);
  }
}

function focar(p) {
  if (!p || p === focado) return;
  if (p.sistema !== atual) return;
  focado = p;
  document.body.classList.add('com-foco');
  ui.focoN.textContent = pad(p.indice + 1);
  ui.focoNome.textContent = p.materia.nome;
  ui.focoQtd.textContent = p.vazio ? 'Em breve' : `${p.n} ${p.n === 1 ? 'trabalho' : 'trabalhos'} · ${p.n} ${p.n === 1 ? 'lua' : 'luas'}`;
  ui.foco.hidden = false;
  requestAnimationFrame(() => ui.foco.classList.add('on'));
  // mais longe quando a tela está em pé (o campo de visão na horizontal é estreito)
  const dist = Math.max(p.raio * 7.5, 11) * (camera.aspect < 1 ? 1.7 : 1);
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
    aoChegar: () => p.posicaoMundo(posFocoAnterior),
  });
}

function desfocar(voltarCamera = true) {
  if (!focado) return;
  focado = null;
  document.body.classList.remove('com-foco');
  ui.foco.classList.remove('on');
  setTimeout(() => { if (!focado) ui.foco.hidden = true; }, 300);
  controles.autoRotate = !reduzirMovimento;
  if (voltarCamera && atual) {
    viajar({
      destinoPos: (out) => posicaoVisao(atual, out),
      destinoAlvo: (out) => alvoVisao(atual, out),
      duracao: 1.6,
      limites: [atual.raioTotal * 0.35, distanciaVisao(atual) * 1.9],
    });
  }
}

ui.botoes.forEach((b) => b.addEventListener('click', () => {
  const s = SISTEMAS.find((x) => x.id === b.dataset.sistema);
  if (s && s !== atual) mostrarSistema(s);
}));
ui.voltar.addEventListener('click', () => desfocar());
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') desfocar();
  if (e.key === '1') mostrarSistema(SISTEMAS[0]);
  if (e.key === '2') mostrarSistema(SISTEMAS[1]);
});

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
  const p = planetaSobPonteiro();
  if (p) focar(p);
});

const alvosClique = () => (atual ? atual.planetas.filter((p) => p.entrada > 0.9).map((p) => p.alvo) : []);
function planetaSobPonteiro() {
  raycaster.setFromCamera(ponteiro, camera);
  const hit = raycaster.intersectObjects(alvosClique(), false)[0];
  return hit ? hit.object.userData.planeta : null;
}

// ------------------------------------------------------------------ tela

function redimensionar() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
  bloom.resolution.set(innerWidth, innerHeight);
  if (atual && !focado && !viagem) {
    controles.maxDistance = distanciaVisao(atual) * 1.9;
  }
}
addEventListener('resize', redimensionar);

// ------------------------------------------------------------------ quadro a quadro

let relogio = 0;
const posFocoAnterior = new THREE.Vector3();
const vSegue = new THREE.Vector3();
let ultimo = performance.now();
const vTela = new THREE.Vector3();
const vCam = new THREE.Vector3();

function quadro(agora) {
  const dt = Math.min((agora - ultimo) / 1000, 0.05);
  ultimo = agora;
  relogio += dt;

  // hover (no canvas ou no rótulo)
  sobre = sobreRotulo || (ponteiroDentro && !viagem && !inicioToque ? planetaSobPonteiro() : null);
  renderer.domElement.style.cursor = sobre ? 'pointer' : '';
  const ritmoAlvo = focado ? 0.12 : sobre ? 0.25 : 1;
  ritmo += (ritmoAlvo - ritmo) * (1 - Math.exp(-dt * 4));

  matCeu.uniforms.uTempo.value = relogio;

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
      p.orbita.mat.uniforms.uDestaque.value += ((destaque ? 1 : 0) - p.orbita.mat.uniforms.uDestaque.value) * (1 - Math.exp(-dt * 8));
      // no foco, as outras órbitas ficam mais apagadas
      const base = p.vazio ? 0.28 : 0.55;
      const alvoAlpha = focado && p !== focado ? base * 0.35 : base;
      const u = p.orbita.mat.uniforms.uAlpha;
      u.value += (alvoAlpha - u.value) * (1 - Math.exp(-dt * 5));
      p.atualizar(dt, relogio, ritmo);
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
  }
  controles.update();

  posicionarRotulos();

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
    const visivel = p.sistema === atual && p.entrada > 0.85 && (!focado || p === focado) && !viagem;
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

// ------------------------------------------------------------------ começo

mostrarSistema(SISTEMAS[0], true);
renderer.setAnimationLoop(quadro);
document.body.classList.add('pronto');
