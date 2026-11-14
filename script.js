/* Portfólio · 3° ano
   Monta as trilhas (básicas / técnicas), as páginas de cada matéria e as
   interações. Os dados ficam em data/3ano.js (objeto PORTFOLIO). */

const TRILHAS = {
  basicas: { nome: 'Matérias básicas', curto: 'Básica', cor: 'var(--bas)' },
  tecnicas: { nome: 'Matérias técnicas', curto: 'Técnico', cor: 'var(--tec)', corTexto: 'var(--tec-ink)', corSobre: 'var(--tec-on)' }
};

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

// ---------------------------------------------------------------- início

function renderHome() {
  const todas = [...PORTFOLIO.basicas, ...PORTFOLIO.tecnicas];
  const unicas = new Set(todas.flatMap((m) => m.atividades));

  $('#hero-stats').innerHTML = [
    [unicas.size, 'atividades e projetos'],
    [PORTFOLIO.basicas.length, 'matérias básicas'],
    [PORTFOLIO.tecnicas.length, 'matérias técnicas']
  ].map(([n, l]) => `<div><dt>${pad(n)}</dt><dd>${l}</dd></div>`).join('');

  for (const trilha of Object.keys(TRILHAS)) {
    const lista = PORTFOLIO[trilha];
    const total = lista.reduce((s, m) => s + m.atividades.length, 0);
    $(`#count-${trilha}`).textContent = `${pad(lista.length)} matérias · ${pad(total)} trabalhos`;
    $(`#grid-${trilha}`).innerHTML = lista.map((m, i) => {
      const areas = [...new Set(m.atividades.map((a) => a.area).filter(Boolean))];
      const n = m.atividades.length;
      return `
        <a class="subject-card${n ? '' : ' is-empty'}" href="#/${trilha}/${m.id}">
          <span class="sc-index">${pad(i + 1)}</span>
          <span class="sc-count">${n ? plural(n, 'trabalho', 'trabalhos') : 'em breve'}</span>
          <h4 class="sc-title">${esc(m.nome)}</h4>
          <p class="sc-desc">${esc(m.desc)}</p>
          ${areas.length > 1 ? `<span class="sc-areas">${areas.map(esc).join(' · ')}</span>` : ''}
          <span class="sc-arrow" aria-hidden="true">→</span>
        </a>`;
    }).join('');
  }

  // Faixa animada com o nome das matérias
  const nomes = todas.map((m) => m.nome);
  const faixa = nomes.map((n, i) => `<span>${esc(n)}</span><b>${i % 2 ? '✦' : '●'}</b>`).join('');
  $('#marquee').innerHTML = faixa + faixa;

  // Destaques: projetos que aparecem em mais de uma matéria
  const destaques = [
    { a: GRAND_PRIX, rota: '#/tecnicas/iot', n: '01' },
    { a: PROJETO_BP, rota: '#/tecnicas/desenvolvimento', n: '02' },
    { a: PORTFOLIO.tecnicas.find((m) => m.id === 'iot').atividades[1], rota: '#/tecnicas/iot', n: '03' }
  ];
  $('#feature-row').innerHTML = destaques.map(({ a, rota, n }) => {
    const onde = todas.filter((m) => m.atividades.includes(a)).map((m) => m.nome);
    const img = a.midia.find((m) => m.tipo === 'img');
    return `
      <a class="feature" href="${rota}">
        <div class="feature-media">${img ? `<img src="${esc(img.src)}" alt="" loading="lazy">` : `<div class="feature-placeholder"><span>${esc(a.titulo.split(' ')[0])}</span></div>`}</div>
        <div class="feature-body">
          <span class="feature-n">${n}</span>
          <h4>${esc(a.titulo)}</h4>
          <p>${esc(a.tag)}</p>
          <span class="feature-where">${onde.map(esc).join(' / ')}</span>
        </div>
      </a>`;
  }).join('');
}

// ---------------------------------------------------------------- matéria

function midiaHTML(m) {
  if (m.tipo === 'img') {
    return `<button class="media media-img" data-zoom="${esc(m.src)}" aria-label="Ampliar imagem"><img src="${esc(m.src)}" alt="${esc(m.alt || '')}" loading="lazy"></button>`;
  }
  const ratio = m.ratio || (m.tipo === 'doc' ? '3/4' : '16/9');
  return `<div class="media media-embed" style="aspect-ratio:${ratio}"><iframe loading="lazy" src="${esc(m.src)}" allowfullscreen allow="fullscreen; autoplay; encrypted-media; picture-in-picture" title="Material da atividade"></iframe></div>`;
}

function linkHTML(l) {
  const icone = { video: '▶', github: '⌥' }[l.estilo] || '↗';
  return `<a class="pill-link ${l.estilo ? 'pl-' + l.estilo : ''}" href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)} <span>${icone}</span></a>`;
}

// Etiqueta da camada de "planta" acima da mídia: tipo · origem · proporção
function rotuloMidia(m) {
  if (!m) return '';
  const origem = /canva/.test(m.src) ? 'Canva' : /youtu/.test(m.src) ? 'YouTube' : /docs\.google/.test(m.src) ? 'Google Docs' : 'Imagem';
  const tipo = m.tipo === 'img' ? 'img' : 'iframe';
  const ratio = m.tipo === 'img' ? '' : ` · ${m.ratio || (m.tipo === 'doc' ? '3/4' : '16/9')}`;
  return `<span class="bp bp-tag bp-media" aria-hidden="true">&lt;${tipo}&gt; · ${origem}${ratio}</span>`;
}

function atividadeHTML(a, i) {
  return `
    <article class="activity" data-area="${esc(a.area || '')}" style="--i:${i}">
      <div class="activity-media">${rotuloMidia(a.midia[0])}${a.midia.map(midiaHTML).join('')}</div>
      <div class="activity-info">
        <div class="activity-meta">
          <span class="activity-n">${pad(i + 1)}</span>
          ${a.area ? `<span class="chip chip-area">${esc(a.area)}</span>` : ''}
          ${a.tag ? `<span class="activity-tag">${esc(a.tag)}</span>` : ''}
        </div>
        <h3 class="activity-title">${esc(a.titulo)}</h3>
        ${a.texto.map((p) => `<p class="activity-text">${esc(p)}</p>`).join('')}
        ${a.links?.length ? `<div class="activity-links">${a.links.map(linkHTML).join('')}</div>` : ''}
        ${a.codigo ? `
          <details class="drawer">
            <summary>Ver o código <span class="drawer-icon">+</span></summary>
            <pre class="code"><code>${esc(a.codigo)}</code></pre>
          </details>` : ''}
        ${a.habilidades?.length ? `
          <details class="drawer">
            <summary>Conceitos e habilidades <span class="drawer-n">${a.habilidades.length}</span><span class="drawer-icon">+</span></summary>
            <ul class="skills">${a.habilidades.map(([c, t]) => `<li><b>${esc(c)}</b><span>${esc(t)}</span></li>`).join('')}</ul>
          </details>` : ''}
        ${a.hashtags?.length ? `<div class="hashtags">${a.hashtags.map((h) => `<span>#${esc(h)}</span>`).join('')}</div>` : ''}
      </div>
    </article>`;
}

function renderSubject(trilha, id) {
  const lista = PORTFOLIO[trilha];
  const idx = lista ? lista.findIndex((m) => m.id === id) : -1;
  if (idx < 0) return false;
  const m = lista[idx];
  const t = TRILHAS[trilha];
  const areas = [...new Set(m.atividades.map((a) => a.area).filter(Boolean))];
  const prev = lista[(idx - 1 + lista.length) % lista.length];
  const next = lista[(idx + 1) % lista.length];

  const view = $('#view-subject');
  view.style.setProperty('--track', t.cor);
  view.style.setProperty('--track-ink', t.corTexto || t.cor);
  view.style.setProperty('--on-track', t.corSobre || 'var(--ink)');
  view.innerHTML = `
    <section class="subject-hero">
      <div class="crumbs">
        <a href="#/" data-scroll="atividades">Atividades</a><span>/</span>
        <a href="#/" data-scroll="${trilha}">${t.nome}</a><span>/</span>
        <b>${esc(m.nome)}</b>
      </div>
      <div class="subject-switch" role="tablist" aria-label="${t.nome}">
        ${lista.map((s) => `<a href="#/${trilha}/${s.id}" class="${s.id === id ? 'active' : ''}">${esc(s.nome)}</a>`).join('')}
      </div>
      <p class="eyebrow"><span class="eyebrow-line"></span>${t.curto} · 3° ano · ${pad(idx + 1)}/${pad(lista.length)}</p>
      <h1 class="subject-title">${esc(m.nome)}</h1>
      <div class="subject-sub">
        <p>${esc(m.desc)}</p>
        <span class="subject-count">${m.atividades.length ? plural(m.atividades.length, 'trabalho', 'trabalhos') : 'nenhum trabalho ainda'}</span>
      </div>
      ${areas.length > 1 ? `
        <div class="filters" id="filters">
          <span class="filters-label">Submatérias</span>
          <button class="chip active" data-area="">Todas <i>${m.atividades.length}</i></button>
          ${areas.map((a) => `<button class="chip" data-area="${esc(a)}">${esc(a)} <i>${m.atividades.filter((x) => x.area === a).length}</i></button>`).join('')}
        </div>` : ''}
    </section>

    <section class="activities" id="activities">
      ${m.atividades.length ? m.atividades.map(atividadeHTML).join('') : `
        <div class="empty">
          <div class="empty-icon">✦</div>
          <p>Nenhum trabalho adicionado ainda para ${esc(m.nome)}.</p>
          <small>Em breve</small>
        </div>`}
    </section>

    <nav class="pager">
      <a href="#/${trilha}/${prev.id}"><small>← Anterior</small><span>${esc(prev.nome)}</span></a>
      <a href="#/${trilha}/${next.id}" class="pager-next"><small>Próxima →</small><span>${esc(next.nome)}</span></a>
    </nav>`;

  document.title = `${m.nome} · Lorenzo Kurrle Borges`;
  return true;
}

// ---------------------------------------------------------------- rotas

let primeiraRota = true;

function route() {
  const [, trilha, id] = (location.hash.replace(/^#\/?/, '/')).split('/');
  const home = $('#view-home');
  const subject = $('#view-subject');
  const abrirMateria = trilha && id && renderSubject(trilha, id);

  home.hidden = !!abrirMateria;
  subject.hidden = !abrirMateria;
  if (!abrirMateria) document.title = 'Lorenzo Kurrle Borges · Portfólio';
  // No celular, deixa a aba da matéria atual visível na barra de matérias
  if (abrirMateria) medirPlanta();
  const ativa = abrirMateria && subject.querySelector('.subject-switch .active');
  if (ativa) ativa.parentElement.scrollLeft = ativa.offsetLeft - 16;

  if (!primeiraRota) {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const alvo = pendingScroll;
    pendingScroll = null;
    if (alvo && !abrirMateria) requestAnimationFrame(() => scrollToId(alvo, 'instant'));
    // Os cursores constroem cada nova página de matéria
    if (abrirMateria) {
      document.querySelectorAll('.nav, .footer').forEach((el) => el.setAttribute('data-banna-skip', ''));
      construir();
    }
  }
  primeiraRota = false;
}

let pendingScroll = null;

function scrollToId(id, behavior = 'smooth') {
  const el = document.getElementById(id);
  if (!el) return;
  const y = id === 'topo' ? 0 : el.getBoundingClientRect().top + scrollY - 90;
  window.scrollTo({ top: y, behavior });
}

// Links com data-scroll: rolam até a seção (voltando ao início se precisar)
document.addEventListener('click', (e) => {
  const link = e.target.closest('[data-scroll]');
  if (link) {
    e.preventDefault();
    closeMenu();
    const alvo = link.dataset.scroll;
    if ($('#view-home').hidden) {
      pendingScroll = alvo;
      location.hash = '#/';
    } else {
      scrollToId(alvo);
    }
    return;
  }

  const chip = e.target.closest('#filters .chip');
  if (chip) {
    document.querySelectorAll('#filters .chip').forEach((c) => c.classList.toggle('active', c === chip));
    const area = chip.dataset.area;
    let n = 0;
    document.querySelectorAll('#activities .activity').forEach((a) => {
      const show = !area || a.dataset.area === area;
      a.hidden = !show;
      if (show) a.querySelector('.activity-n').textContent = pad(++n);
    });
    return;
  }

  const zoom = e.target.closest('[data-zoom]');
  if (zoom) {
    const box = $('#lightbox');
    box.querySelector('img').src = zoom.dataset.zoom;
    box.hidden = false;
    requestAnimationFrame(() => box.classList.add('open'));
    return;
  }

  if (e.target.closest('#lightbox')) closeLightbox();
});

function closeLightbox() {
  const box = $('#lightbox');
  box.classList.remove('open');
  setTimeout(() => { box.hidden = true; }, 250);
}
addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeLightbox(); closeMenu(); } });

// ---------------------------------------------------------------- menu (celular)

const menuBtn = $('#nav-menu');
function closeMenu() {
  document.body.classList.remove('menu-open');
  menuBtn.setAttribute('aria-expanded', 'false');
}
menuBtn.addEventListener('click', () => {
  const open = document.body.classList.toggle('menu-open');
  menuBtn.setAttribute('aria-expanded', String(open));
});

// ---------------------------------------------------------------- efeitos

// Holofote que segue o mouse nos cartões
document.addEventListener('pointermove', (e) => {
  const card = e.target.closest?.('.subject-card, .feature, .activity');
  if (!card) return;
  const r = card.getBoundingClientRect();
  card.style.setProperty('--mx', `${e.clientX - r.left}px`);
  card.style.setProperty('--my', `${e.clientY - r.top}px`);
}, { passive: true });

// Barra de navegação fica sólida ao rolar
const nav = $('#nav');
const onScroll = () => nav.classList.toggle('scrolled', scrollY > 24);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Fundo reage levemente ao mouse
if (matchMedia('(pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const fx = $('.bg-fx');
  addEventListener('pointermove', (e) => {
    if (MODO.atual === 'leve') return;
    const x = (e.clientX / innerWidth - 0.5) * 30;
    const y = (e.clientY / innerHeight - 0.5) * 30;
    fx.style.setProperty('--px', `${x}px`);
    fx.style.setProperty('--py', `${y}px`);
  }, { passive: true });
}

// ---------------------------------------------------------------- modo (completo / leve)

// Sem animação para quem pediu menos movimento no sistema ou usa ?nobanna
const SEM_ANIMACAO = matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]nobanna/.test(location.search);
const CONSTRUIR = !SEM_ANIMACAO;
const HTML = document.documentElement;

const MODO = {
  atual: HTML.classList.contains('lite') ? 'leve' : 'completo',
  salvo() {
    try { return localStorage.getItem('lkb-modo'); } catch { return null; }
  },
  definir(m) {
    this.atual = m;
    HTML.classList.toggle('lite', m === 'leve');
    try { localStorage.setItem('lkb-modo', m); } catch { /* sem armazenamento: só vale nesta visita */ }
    $('#nav-mode-label').textContent = m === 'leve' ? 'Modo leve' : 'Modo completo';
    if (m === 'leve') {
      pararRolagem();
      if (window.Banna) window.Banna.skip();
    }
  }
};

// Sugestão de modo: aparelho com poucos recursos, economia de dados ou animação engasgando
function sugerirModo(fps) {
  const nav = navigator;
  const poucosRecursos = nav.hardwareConcurrency && nav.hardwareConcurrency <= 4 && nav.deviceMemory && nav.deviceMemory <= 4;
  const economia = nav.connection && nav.connection.saveData;
  return poucosRecursos || economia || (fps && fps < 40) ? 'leve' : 'completo';
}

function opcoesBanna() {
  return MODO.atual === 'leve'
    ? { agents: 3, speed: 1.8, maxWait: 3 }
    : { agents: 9, speed: 1, maxWait: 10 };
}

// Os cursores constroem a página. No modo leve: só a primeira tela, rápido, e o resto aparece pronto.
function construir() {
  if (!window.Banna || !CONSTRUIR) return;
  window.Banna.start(opcoesBanna());
  if (MODO.atual === 'leve') {
    const eventos = ['wheel', 'touchmove', 'keydown'];
    const fim = () => {
      clearTimeout(timer);
      eventos.forEach((ev) => removeEventListener(ev, fim));
      window.Banna.skip();
    };
    const timer = setTimeout(fim, 3500);
    eventos.forEach((ev) => addEventListener(ev, fim, { passive: true }));
  }
}

$('#nav-mode').addEventListener('click', () => {
  MODO.definir(MODO.atual === 'leve' ? 'completo' : 'leve');
  closeMenu();
});
$('#nav-mode-label').textContent = MODO.atual === 'leve' ? 'Modo leve' : 'Modo completo';

// ---------------------------------------------------------------- camada de "planta"

// Etiquetas e cotas no estilo de ferramenta de design: mais peças para os cursores
// construírem e reforço do tema "obra". Somem no modo leve.
function decorarPlanta() {
  document.querySelectorAll('#view-home .section').forEach((sec) => {
    const head = sec.querySelector('.section-head');
    if (!head || head.querySelector('.bp')) return;
    head.insertAdjacentHTML('beforeend',
      `<span class="bp bp-tag bp-head" aria-hidden="true">&lt;section id="${sec.id}"&gt;</span>` +
      '<span class="bp bp-dim" aria-hidden="true"><span class="bp-dim-n"></span></span>');
  });
  document.querySelectorAll('.track').forEach((tr) => {
    const n = tr.querySelectorAll('.subject-card').length;
    tr.insertAdjacentHTML('beforeend', `<span class="bp bp-tag bp-track" aria-hidden="true">div.trilha · ${pad(n)} itens</span>`);
  });
  document.querySelectorAll('.feature-body').forEach((f, i) => {
    f.insertAdjacentHTML('beforeend', `<span class="bp bp-tag bp-feat" aria-hidden="true">a.projeto · ${pad(i + 1)}</span>`);
  });
  const palco = $('.hero-stage');
  palco.insertAdjacentHTML('beforeend',
    '<span class="bp bp-tag bp-title" aria-hidden="true">h1 · Unbounded 800</span>' +
    '<span class="bp bp-tag bp-photo" aria-hidden="true">&lt;img&gt; · 1202 × 1309</span>');
}

function medirPlanta() {
  document.querySelectorAll('.bp-dim').forEach((d) => {
    const w = d.getBoundingClientRect().width;
    if (w) d.firstElementChild.textContent = `${Math.round(w)} px`;
  });
}
addEventListener('resize', medirPlanta, { passive: true });

// ---------------------------------------------------------------- abertura

function initIntro() {
  const intro = $('#intro');
  if (!HTML.classList.contains('intro')) { intro.remove(); return; }

  const cores = ['#762B82', '#E2C9AB', '#E5E5E5', '#9236A1', '#C9A27E', '#5E2269'];
  const N = 9; // mesmo número de cursores do modo completo
  const orbit = $('#intro-orbit');
  const anel = intro.querySelector('.intro-ring');
  const cursores = Array.from({ length: N }, (_, i) => {
    const el = document.createElement('span');
    el.className = 'intro-cursor';
    el.style.setProperty('--c', cores[i % cores.length]);
    el.innerHTML = '<svg viewBox="0 0 20 22"><path d="M2 2l15 8-6.5 2L8 19z"/></svg>';
    orbit.append(el);
    return el;
  });

  // ---- escolha do modo
  const botoes = [...intro.querySelectorAll('.mode-btn')];
  const salvo = MODO.salvo();
  let escolha = salvo || sugerirModo();
  let decidido = !!salvo; // a pessoa já escolheu antes ou mexeu nas opções agora
  const marcar = (m, foco) => {
    escolha = m;
    botoes.forEach((b) => {
      const on = b.dataset.modo === m;
      b.classList.toggle('selected', on);
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
      if (on && foco) b.focus({ preventScroll: true });
    });
  };
  const sugerir = (m) => botoes.forEach((b) => b.classList.toggle('suggested', b.dataset.modo === m));
  sugerir(sugerirModo());
  marcar(escolha, true);

  // ---- órbita (e medição de fluidez para a sugestão)
  let raf = 0;
  let saindo = false;
  let raio = 70;
  let quadros = 0;
  let medido = false;
  const inicio = performance.now();
  const girar = (agora) => {
    const t = (agora - inicio) / 1000;
    const r = anel.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const alvo = saindo ? 40 : 70 + Math.sin(t) * 12;
    raio += (alvo - raio) * 0.12;
    cursores.forEach((el, i) => {
      const a = (i / N) * Math.PI * 2 + t * 0.6;
      const x = cx + Math.cos(a) * raio + Math.sin(t * 1.6 + i) * 3;
      const y = cy + Math.sin(a) * raio + Math.cos(t * 1.3 + i) * 3;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    });
    // Conta os quadros entre 0,5 s e 2 s (o começo é sempre mais lento por causa do carregamento)
    if (t > 0.5 && t <= 2) quadros++;
    if (t > 2 && !medido) {
      medido = true;
      const s = sugerirModo(quadros / 1.5);
      sugerir(s);
      if (!decidido) marcar(s, true);
    }
    raf = requestAnimationFrame(girar);
  };
  raf = requestAnimationFrame(girar);

  const entrar = (m) => {
    if (saindo) return;
    saindo = true;
    removeEventListener('keydown', onKey);
    MODO.definir(m);
    botoes.forEach((b) => b.classList.toggle('pressed', b.dataset.modo === m));
    intro.classList.add('pressing');
    setTimeout(() => {
      window.scrollTo(0, 0);
      intro.classList.add('leaving');
      // Mostrar o site e esconder as camadas acontece no mesmo quadro: nada pisca
      HTML.classList.remove('intro');
      medirPlanta();
      construir();
      setTimeout(() => { cancelAnimationFrame(raf); intro.remove(); }, 450);
    }, 280);
  };
  const onKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') { e.preventDefault(); entrar(escolha); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === '1') { e.preventDefault(); decidido = true; marcar('completo', true); }
    else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === '2') { e.preventDefault(); decidido = true; marcar('leve', true); }
  };
  botoes.forEach((b) => {
    b.addEventListener('click', () => entrar(b.dataset.modo));
    b.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { decidido = true; marcar(b.dataset.modo, false); } });
  });
  addEventListener('keydown', onKey);
}

// ---------------------------------------------------------------- rolagem "câmera"

// Se o visitante ficar parado, a página vira uma apresentação: desce até o próximo
// bloco, espera os cursores terminarem de construir o que apareceu, e segue.
// Qualquer movimento (mouse, toque, roda, teclado) para e reinicia a contagem.
const AUTO = {
  espera: 5000,     // ms parado antes de começar
  leitura: 1600,    // ms parado em cada bloco depois de construído
  ativo: false,
  timer: 0,
  pausa: 0,
  raf: 0
};
const PARADAS = '.section-head, .track, .feature-row, .about, #certificados .empty, .activity, .pager, .footer';

function podeRolarSozinho() {
  return CONSTRUIR &&
    MODO.atual === 'completo' &&
    !HTML.classList.contains('intro') &&
    !document.body.classList.contains('menu-open') &&
    $('#lightbox').hidden &&
    !document.hidden &&
    document.activeElement?.tagName !== 'IFRAME' &&   // vendo um Canva / vídeo
    scrollY < maxScroll() - 2;
}

const maxScroll = () => document.documentElement.scrollHeight - innerHeight;

function proximoAlvo() {
  const y = scrollY;
  const topos = [...document.querySelectorAll(PARADAS)]
    .filter((el) => el.offsetParent !== null)
    .map((el) => el.getBoundingClientRect().top + y - 136)  // folga para o menu e as etiquetas
    .filter((t) => t > y + innerHeight * 0.25)
    .sort((a, b) => a - b);
  // Nunca pula mais de 3/4 de tela, para nada passar sem ser construído
  const alvo = Math.min(topos.length ? topos[0] : maxScroll(), y + innerHeight * 0.75, maxScroll());
  return alvo > y + 2 ? alvo : null;
}

function encerrarRolagem() {
  AUTO.ativo = false;
  cancelAnimationFrame(AUTO.raf);
  clearTimeout(AUTO.pausa);
  $('#autoscroll-pill').classList.remove('on');
}

function pararRolagem() {
  if (AUTO.ativo) encerrarRolagem();
  clearTimeout(AUTO.timer);
  AUTO.timer = setTimeout(iniciarRolagem, AUTO.espera);
}

function iniciarRolagem() {
  if (!podeRolarSozinho()) { AUTO.timer = setTimeout(iniciarRolagem, AUTO.espera); return; }
  AUTO.ativo = true;
  $('#autoscroll-pill').classList.add('on');
  moverCamera();
}

function moverCamera() {
  if (!AUTO.ativo) return;
  const alvo = podeRolarSozinho() ? proximoAlvo() : null;
  if (alvo === null) { encerrarRolagem(); return; }
  const de = scrollY;
  const dist = alvo - de;
  const dur = Math.min(2200, Math.max(900, Math.abs(dist) / 0.55));
  const t0 = performance.now();
  const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const quadro = (agora) => {
    if (!AUTO.ativo) return;
    const k = Math.min(1, (agora - t0) / dur);
    window.scrollTo({ top: de + dist * ease(k), behavior: 'instant' });
    if (k < 1) AUTO.raf = requestAnimationFrame(quadro);
    else esperarConstrucao();
  };
  AUTO.raf = requestAnimationFrame(quadro);
}

// Espera os cursores ficarem livres por meio segundo (ou no máximo 12 s) antes de seguir
function esperarConstrucao() {
  const inicio = performance.now();
  let livreDesde = 0;
  const checar = (agora) => {
    if (!AUTO.ativo) return;
    const ocupado = window.Banna && window.Banna.busy();
    if (ocupado) livreDesde = 0;
    else if (!livreDesde) livreDesde = agora;
    if ((livreDesde && agora - livreDesde > 500) || agora - inicio > 12000) {
      AUTO.pausa = setTimeout(moverCamera, AUTO.leitura);
      return;
    }
    AUTO.raf = requestAnimationFrame(checar);
  };
  AUTO.raf = requestAnimationFrame(checar);
}

// Mexer o mouse de verdade (mais de 3 px) conta como movimento; a rolagem sozinha não
let ultimoPonteiro = null;
addEventListener('pointermove', (e) => {
  if (ultimoPonteiro && Math.abs(e.clientX - ultimoPonteiro[0]) + Math.abs(e.clientY - ultimoPonteiro[1]) < 4) return;
  ultimoPonteiro = [e.clientX, e.clientY];
  pararRolagem();
}, { passive: true });
['pointerdown', 'wheel', 'touchstart', 'keydown'].forEach((ev) => addEventListener(ev, pararRolagem, { passive: true }));
document.addEventListener('visibilitychange', pararRolagem);
addEventListener('hashchange', pararRolagem);

// ---------------------------------------------------------------- início

renderHome();
decorarPlanta();
route();
addEventListener('hashchange', route);
initIntro();
if (!HTML.classList.contains('intro')) medirPlanta();
pararRolagem(); // começa a contagem de inatividade
