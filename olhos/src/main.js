/*
 * Olhos do portfólio: o olho do olho_port, igual ao original, espalhado pela página inicial e pelas
 * páginas das matérias (posições em posicoes.js). Não aparece nos sistemas solares.
 *
 * Uma camada de luz só (um canvas fixo do tamanho da tela) fica entre o céu do site e o conteúdo,
 * então os olhos passam POR BAIXO dos textos, cartões e fotos. A camada é misturada com o fundo
 * em modo "screen": o preto some e só a luz dos olhos aparece.
 *
 * A animação é a mesma do olho_port:
 *  - os olhos seguem o mouse (ou o dedo) a partir de onde estão;
 *  - parado 7 s, voltam a olhar para a frente; uns 3 s depois começam a olhar em volta;
 *  - cada um pisca a cada 8 a 10 s e "falha" (glitch) de vez em quando;
 *  - clicou num olho (na parte que aparece): pisca vermelho e fica quase fechado por ~5 s.
 * No modo leve (e para quem pediu menos movimento) os olhos ficam parados, olhando para a frente.
 */
import * as THREE from 'three';
import { Olho, OLHO, ANIMACAO, EFEITOS } from './olho.js';
import { criarPosProcesso, prepararRenderizador } from './posprocesso.js';
import { OLHOS, SUGESTOES, CELULAR_ATE, CONTEUDO, CONTEUDO_CELULAR } from './posicoes.js';

const html = document.documentElement;
const LISTA = /[?&]olhos=sugestoes/.test(location.search) ? [...OLHOS, ...SUGESTOES] : OLHOS;

// Elementos que cobrem os olhos: clicar neles não é clicar no olho
const COBRE = [
  'a', 'button', 'input', 'select', 'textarea', 'label', 'summary', 'iframe', 'img', 'video',
  '.nav', '.modal', '.track', '.feature', '.frame', '.activity', '.pager', '.cert-card', '.cert-photo',
  '.chip', '.filters', '.subject-switch', '.about-tags', '.ver-sistemas', '.intro-screen', '.autoscroll-pill',
].join(', ');

// ---------------------------------------------------------------- camada
const camada = document.createElement('div');
camada.className = 'olhos-fx';
camada.setAttribute('aria-hidden', 'true');
camada.setAttribute('data-banna-skip', '');
const ceuDoSite = document.querySelector('.bg-fx');
if (ceuDoSite) ceuDoSite.after(camada);
else document.body.prepend(camada);

let renderer = null;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
} catch (e) {
  camada.remove(); // sem WebGL: o site fica sem os olhos
}
if (renderer) iniciar();

function iniciar() {
  const fraco = matchMedia('(pointer: coarse)').matches || Math.min(screen.width, screen.height) < 700;
  const leve = () => html.classList.contains('lite');
  prepararRenderizador(renderer);
  renderer.setClearColor('#000000'); // preto: na mistura "screen" ele some
  camada.appendChild(renderer.domElement);

  const cena = new THREE.Scene();
  // câmera em pixels da tela: x para a direita, y para cima (y = -clientY)
  const camera = new THREE.OrthographicCamera(0, 1, 0, -1, -10, 10);
  const olhos = LISTA.map((def) => ({
    def,
    olho: new Olho(cena),
    centro: new THREE.Vector2(),
    escala: 1,
    inclinacao: 0,
    visivel: false,
    x: 0, // para onde está olhando (-1 a 1)
    y: 0,
    vx: 0,
    vy: 0,
    alvoX: 0, // para onde quer olhar
    alvoY: 0,
    proximaOlhada: 0,
    piscada: null,
    proximaPiscada: 0,
    abertura: 1,
    glitchIni: -1, // a falha atual (início e duração)
    glitchDura: 0,
    glitchForca: 1,
    proximoGlitch: 0,
    cliqueIni: -1, // quando foi clicado (fica vermelho e quase fechado)
  }));
  for (const o of olhos) o.olho.grupo.visible = false;
  // (o brilho difuso só pega o que é bem claro) — o mesmo do olho_port
  const { composer, bloom } = criarPosProcesso(renderer, cena, camera, { bloom: [0.6, 0.28, 0.6] });

  // ---------------------------------------------------------------- tamanho da tela
  let W = 0;
  let H = 0;
  let P = 0;
  function ajustarTamanho() {
    const w = camada.clientWidth || innerWidth;
    const h = camada.clientHeight || innerHeight;
    const p = Math.min(window.devicePixelRatio || 1, leve() ? 1 : fraco ? 1.5 : 2);
    if (w === W && h === H && p === P) return false;
    W = w;
    H = h;
    P = p;
    renderer.setPixelRatio(p);
    renderer.setSize(w, h);
    composer.setPixelRatio(p);
    composer.setSize(w, h);
    bloom.resolution.set(w, h);
    camera.left = 0;
    camera.right = w;
    camera.top = 0;
    camera.bottom = -h;
    camera.updateProjectionMatrix();
    return true;
  }

  // ---------------------------------------------------------------- posições (posicoes.js)
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  // de ponta a ponta das linhas das pálpebras, em unidades do olho
  const LARGURA_OLHO = 2 * (OLHO.meiaLargura + OLHO.sobra * 0.6);
  // na página do olho, a altura da tela mede ~37,8 unidades: serve para as linhas terem a mesma espessura
  const pxPorUnidade = () => H / 37.8;

  const ESPECIAIS = {
    // ao lado da última linha do nome da matéria; se o nome for comprido, acima dele (na linha
    // "Técnico · 3° ano · 02/08", que tem espaço sobrando à direita)
    tituloMateria(d, k) {
      const titulo = document.querySelector('#view-subject .subject-title');
      if (!titulo) return null;
      const caixa = titulo.getBoundingClientRect();
      if (!caixa.width) return null;
      const faixa = document.createRange();
      faixa.selectNodeContents(titulo);
      const linhas = faixa.getClientRects();
      const ultima = linhas.length ? linhas[linhas.length - 1] : caixa;
      const largura = d.largura * k;
      if (caixa.right - ultima.right >= largura * 0.95) {
        return { x: Math.min(caixa.right - largura * 0.42, ultima.right + largura * 0.62), y: ultima.top + ultima.height / 2 };
      }
      const linha = document.querySelector('#view-subject .subject-hero .eyebrow');
      const r = linha ? linha.getBoundingClientRect() : caixa;
      return { x: caixa.right - largura * 0.5, y: r.top + r.height / 2 - 6 * k };
    },
  };

  function posicaoPadrao(seletor, d, k) {
    const el = seletor && document.querySelector(seletor);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) return null; // escondido (outra página, ou tirado pelo filtro)
    return { x: r.left + d.x[0] * r.width + d.x[1] * k, y: r.top + d.y[0] * r.height + d.y[1] * k };
  }

  /** Coloca cada olho no lugar dele; devolve uma "assinatura" das posições (para saber se mudou). */
  function posicionarTodos() {
    const ref = document.querySelector('.footer-big');
    const conteudo = ref ? ref.getBoundingClientRect().width : Math.min(W, CONTEUDO);
    const celular = W <= CELULAR_ATE;
    const k = celular ? clamp(conteudo / CONTEUDO_CELULAR, 0.85, 1.7) : clamp(conteudo / CONTEUDO, 0.45, 1);
    let assinatura = '';
    for (const o of olhos) {
      const d = celular ? o.def.celular : o.def.desktop === false ? null : o.def;
      let ok = false;
      if (d) {
        const p = d.pos ? ESPECIAIS[d.pos](d, k) : posicaoPadrao(d.ancora || o.def.ancora, d, k);
        if (p) {
          const largura = d.largura * k;
          // só desenha o que está na tela (ou quase)
          ok = p.x > -largura && p.x < W + largura && p.y > -largura && p.y < H + largura;
          if (ok) {
            o.centro.set(p.x, -p.y);
            o.escala = largura / LARGURA_OLHO;
            o.inclinacao = -THREE.MathUtils.degToRad(d.graus);
            o.olho.posicionar(o.centro.x, o.centro.y, o.escala, o.inclinacao, o.escala / pxPorUnidade());
            assinatura += `${o.def.id}:${Math.round(p.x)},${Math.round(p.y)},${Math.round(largura)};`;
          }
        }
      }
      o.visivel = ok;
      o.olho.grupo.visible = ok;
    }
    return assinatura;
  }

  // ---------------------------------------------------------------- animação (a mesma do olho_port)
  const rand = (a, b) => a + Math.random() * (b - a);
  const relogio = new THREE.Clock();
  const estado = {
    modo: 'seguindo', // 'seguindo' o ponteiro, 'voltando' para a frente ou 'vagando' (olhando em volta)
    ponteiro: null, // onde o ponteiro está, no plano dos olhos
    cliente: null, // onde o ponteiro está na tela (a página pode rolar com ele parado)
    ultimoMovimento: 0,
    fimDoNormal: 0,
    olhos,
  };
  // cada olho pisca e falha no seu ritmo (a primeira vez de cada um num momento diferente)
  for (const o of olhos) {
    o.proximaPiscada = rand(1.5, ANIMACAO.piscarEntre[1]);
    o.proximoGlitch = rand(1, EFEITOS.glitchEntre[1]);
  }

  function glitchar(o, t, duracao, forca = 1) {
    o.glitchIni = t;
    o.glitchDura = duracao;
    o.glitchForca = forca;
  }

  /** Força da falha agora (0..1): pisca aos trancos enquanto dura. */
  function atualizarGlitch(o, t) {
    if (t >= o.proximoGlitch) {
      glitchar(o, t, rand(...EFEITOS.glitchDura), rand(0.6, 1));
      o.proximoGlitch = t + rand(...EFEITOS.glitchEntre);
    }
    const e = t - o.glitchIni;
    if (o.glitchIni < 0 || e > o.glitchDura) return 0;
    // aos trancos: liga e desliga rápido, com força variando
    return Math.random() < 0.3 ? 0.12 : o.glitchForca * rand(0.55, 1);
  }

  /** Clique: pisca vermelho, fecha quase todo e fica assim ~5 s; devolve { abertura, vermelho }. */
  const _clique = { abertura: 1, vermelho: 0 };
  function atualizarClique(o, t) {
    const e = t - o.cliqueIni;
    const dura = EFEITOS.clique.fechado;
    if (o.cliqueIni < 0 || e > dura + 0.6) {
      _clique.abertura = 1;
      _clique.vermelho = 0;
      return null;
    }
    const quase = EFEITOS.clique.abertura;
    // fecha rápido (0,12 s), fica quase fechado e abre devagar (0,6 s) no fim
    const fechar = Math.min(1, e / 0.12);
    const abrir = Math.max(0, (e - dura) / 0.6);
    _clique.abertura = 1 - (1 - quase) * (fechar * fechar) + (1 - quase) * (abrir * abrir * (3 - 2 * abrir));
    // um clarão vermelho piscando no começo; depois fica um vermelho fraco até abrir
    const clarao = Math.exp(-e * 3.5) * (0.7 + 0.3 * Math.cos(e * 48));
    const fundo = 0.4 * (1 - THREE.MathUtils.smoothstep(e, dura - 0.2, dura + 0.5));
    _clique.vermelho = Math.min(1, clarao + fundo);
    return _clique;
  }

  // em cima de qual olho (visível) está o ponto (ou -1)
  const _local = new THREE.Vector2();
  const _zero = new THREE.Vector2();
  function olhoEm(ponto) {
    for (let i = 0; i < olhos.length; i++) {
      const o = olhos[i];
      if (!o.visivel) continue;
      _local.copy(ponto).sub(o.centro).divideScalar(o.escala).rotateAround(_zero, -o.inclinacao);
      const x = _local.x / (OLHO.meiaLargura + 0.8);
      const y = _local.y / (OLHO.meiaAltura + 0.8);
      if (x * x + y * y < 1) return i;
    }
    return -1;
  }

  // o olho embaixo do ponteiro, se a parte dele que aparece está ali (e não um cartão, um link...)
  const _ponto = new THREE.Vector2();
  function olhoSob(e) {
    if (leve() || html.classList.contains('intro')) return -1;
    if (e.target instanceof Element && e.target.closest(COBRE)) return -1;
    return olhoEm(_ponto.set(e.clientX, -e.clientY));
  }

  function acordar(t) {
    if (estado.modo === 'vagando') for (const o of olhos) glitchar(o, t, 0.15, 0.6); // acordaram
    estado.modo = 'seguindo';
    estado.ultimoMovimento = t;
  }
  function moveu(e) {
    estado.cliente = { x: e.clientX, y: e.clientY };
    acordar(relogio.getElapsedTime());
    // em cima de um olho, o cursor vira a mãozinha (dá para clicar)
    html.classList.toggle('olho-sob-ponteiro', olhoSob(e) >= 0);
  }
  addEventListener('pointermove', moveu, { passive: true });
  addEventListener('pointerdown', (e) => {
    moveu(e);
    const i = olhoSob(e);
    if (i < 0) return;
    const o = olhos[i];
    const t = relogio.getElapsedTime();
    o.cliqueIni = t;
    o.piscada = null;
    glitchar(o, t, 0.35, 1);
  });
  // rolar a página também conta como mexer
  addEventListener('scroll', () => acordar(relogio.getElapsedTime()), { passive: true });

  const _v = new THREE.Vector2();
  function atualizarOlhar(o, t, dt) {
    if (estado.modo === 'seguindo') {
      if (estado.ponteiro) {
        // o ponteiro visto de dentro deste olho (desfazendo posição, tamanho e inclinação)
        _v.copy(estado.ponteiro).sub(o.centro).divideScalar(o.escala).rotateAround(_zero, -o.inclinacao);
        // longe do olho ele olha até o canto; perto, mexe menos
        const d = _v.length() || 1;
        const forca = Math.min(1, d / (OLHO.meiaLargura + 2));
        o.alvoX = (_v.x / d) * forca;
        o.alvoY = (_v.y / d) * forca;
      }
    } else if (estado.modo === 'voltando') {
      o.alvoX = 0;
      o.alvoY = 0;
    } else if (t >= o.proximaOlhada) {
      // olha para outro lugar (longe o bastante do atual para se notar); às vezes volta ao meio
      if (Math.random() < 0.15) {
        o.alvoX = rand(-0.1, 0.1);
        o.alvoY = rand(-0.1, 0.1);
      } else {
        let x;
        let y;
        do {
          x = rand(-1, 1);
          y = rand(-0.85, 0.85);
        } while (Math.hypot(x - o.alvoX, y - o.alvoY) < 0.6);
        o.alvoX = x;
        o.alvoY = y;
      }
      o.proximaOlhada = t + rand(0.9, 2.4);
    }
    // não passa da borda do olho
    const m = Math.hypot(o.alvoX, o.alvoY);
    if (m > 1) {
      o.alvoX /= m;
      o.alvoY /= m;
    }
    // mola sem balanço: segue rápido, volta ao meio devagar, olha em volta com movimentos rápidos
    const k = estado.modo === 'seguindo' ? 70 : estado.modo === 'voltando' ? 9 : 150;
    const c = 2 * Math.sqrt(k);
    const passos = 4;
    const h = dt / passos;
    for (let i = 0; i < passos; i++) {
      o.vx += (k * (o.alvoX - o.x) - c * o.vx) * h;
      o.vy += (k * (o.alvoY - o.y) - c * o.vy) * h;
      o.x += o.vx * h;
      o.y += o.vy * h;
    }
  }

  /** Abertura de um olho (1 aberto, 0 fechado): pisca a cada 8 a 10 s, cada vez um pouco diferente. */
  function atualizarPiscada(o, t) {
    if (!o.piscada && t >= o.proximaPiscada) {
      o.piscada = { t0: t, fechar: rand(0.07, 0.11), fechado: rand(0.03, 0.08), abrir: rand(0.12, 0.2) };
      o.proximaPiscada = t + rand(...ANIMACAO.piscarEntre);
    }
    if (!o.piscada) return 1;
    const e = t - o.piscada.t0;
    if (e < o.piscada.fechar) return 1 - (e / o.piscada.fechar) ** 2;
    if (e < o.piscada.fechar + o.piscada.fechado) return 0;
    const a = (e - o.piscada.fechar - o.piscada.fechado) / o.piscada.abrir;
    if (a < 1) return 1 - (1 - a) ** 2;
    o.piscada = null;
    return 1;
  }

  // ---------------------------------------------------------------- quadro
  let antes = 0;
  let desenhou = false;
  let ultimaAssinatura = '';
  function quadro() {
    requestAnimationFrame(quadro);
    // enquanto a tela de abertura está na frente, não desenha nada
    if (html.classList.contains('intro')) return;
    const mudouTamanho = ajustarTamanho();
    const assinatura = posicionarTodos();
    const algum = olhos.some((o) => o.visivel);
    const t = relogio.getElapsedTime();
    const dt = Math.min(0.05, t - antes);
    antes = t;
    const parado = leve();

    if (!parado) {
      if (estado.cliente) {
        estado.ponteiro = estado.ponteiro || new THREE.Vector2();
        estado.ponteiro.set(estado.cliente.x, -estado.cliente.y);
      }
      // o mesmo relógio para todos: parado 7 s, todos voltam para a frente; ~3 s depois cada um
      // começa a olhar em volta no seu tempo
      const quieto = t - estado.ultimoMovimento;
      if (estado.modo === 'seguindo' && quieto > ANIMACAO.voltarDepois) {
        estado.modo = 'voltando';
        estado.fimDoNormal = t + rand(ANIMACAO.normalPor - 0.3, ANIMACAO.normalPor + 0.3);
      } else if (estado.modo === 'voltando' && t > estado.fimDoNormal) {
        estado.modo = 'vagando';
        for (const o of olhos) o.proximaOlhada = t + rand(0, 0.9);
      }
      for (const o of olhos) {
        atualizarOlhar(o, t, dt);
        const clique = atualizarClique(o, t);
        if (clique) {
          // clicado: quase fechado e vermelho (não pisca enquanto isso)
          o.abertura = clique.abertura;
          o.proximaPiscada = Math.max(o.proximaPiscada, t + 2);
        } else {
          o.abertura = atualizarPiscada(o, t);
        }
        const glitch = atualizarGlitch(o, t);
        if (o.visivel) o.olho.atualizar(t, o.x, o.y, o.abertura, glitch, clique ? clique.vermelho : 0);
      }
    } else {
      // modo leve: parados, abertos, olhando para a frente
      for (const o of olhos) if (o.visivel) o.olho.atualizar(0, 0, 0, 1, 0, 0);
    }

    if (!algum) {
      if (desenhou) {
        renderer.setRenderTarget(null);
        renderer.clear();
        desenhou = false;
      }
      return;
    }
    // no modo leve só redesenha quando algo mudou de lugar (rolagem, tamanho da tela)
    if (parado && desenhou && !mudouTamanho && assinatura === ultimaAssinatura) return;
    ultimaAssinatura = assinatura;
    composer.render();
    if (!desenhou) camada.classList.add('on');
    desenhou = true;
  }
  requestAnimationFrame(quadro);

  // para testes: window.olhos mostra o estado; telaDoOlho(id) diz onde o olho está na tela
  estado.telaDoOlho = (id) => {
    const o = olhos.find((x) => x.def.id === id);
    return o && o.visivel ? { x: o.centro.x, y: -o.centro.y, largura: o.escala * LARGURA_OLHO } : null;
  };
  window.olhos = estado;
}
