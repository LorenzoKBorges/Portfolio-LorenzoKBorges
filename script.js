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

// ---------------------------------------------------------------- certificados

function renderCertificados() {
  const total = CERTIFICADOS.length;
  const conta = (f) => CERTIFICADOS.filter(f).length;
  const medalhas = conta((c) => ['ouro', 'prata', 'bronze'].includes(c.medalha));
  $('#cert-stats').innerHTML = [
    [total, 'certificados'],
    [medalhas, 'medalhas em olimpíadas'],
    [conta((c) => c.medalha === 'mencao'), 'menções honrosas'],
    [conta((c) => c.cat === 'xadrez'), 'torneios de xadrez']
  ].map(([n, l]) => `<div><dt>${pad(n)}</dt><dd>${l}</dd></div>`).join('');

  $('#cert-filters').innerHTML =
    '<span class="filters-label">Categorias</span>' +
    `<button class="chip active" data-cat="">Todos <i>${total}</i></button>` +
    Object.entries(CERT_CATEGORIAS).map(([id, nome]) =>
      `<button class="chip" data-cat="${id}">${esc(nome)} <i>${conta((c) => c.cat === id)}</i></button>`).join('');

  $('#cert-grid').innerHTML = CERTIFICADOS.map((c) => {
    const base = `imagens/certificados/${c.arquivo}`;
    const medalha = c.medalha ? CERT_MEDALHAS[c.medalha] : '';
    const legenda = [c.titulo, medalha, c.org, c.ano].filter(Boolean).join(' · ');
    return `
      <button class="cert-card" data-cat="${c.cat}" data-zoom="${base}.webp" data-caption="${esc(legenda)}" aria-label="Ampliar: ${esc(c.titulo)}">
        <span class="cert-thumb"><img src="${base}-p.webp" alt="Certificado: ${esc(c.titulo)}" loading="lazy"></span>
        <span class="cert-body">
          <span class="cert-meta">
            <span>${esc(CERT_CATEGORIAS[c.cat])}${c.ano ? ' · ' + c.ano : ''}</span>
            ${medalha ? `<span class="cert-medal m-${c.medalha}">${esc(medalha)}</span>` : ''}
          </span>
          <span class="cert-title">${esc(c.titulo)}</span>
          <span class="cert-org">${esc(c.org)}</span>
        </span>
      </button>`;
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
  if (abrirMateria) { medirPlanta(); ajustarMidiaFixa(); }
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

// A mídia de uma atividade acompanha a rolagem enquanto o texto ao lado é mais comprido.
// Assim, ao abrir "Conceitos e habilidades" ou o código, não sobra um vazio ao lado.
// Se a mídia for mais alta que a tela, ela prende pela base em vez do topo.
function ajustarMidiaFixa() {
  document.querySelectorAll('#view-subject .activity-media').forEach((m) => {
    const ultimo = m.lastElementChild;
    if (!ultimo || !m.offsetHeight) return;
    m.classList.add('is-sticky');
    const altura = ultimo.getBoundingClientRect().bottom - m.getBoundingClientRect().top;
    m.style.top = `${Math.round(Math.min(104, innerHeight - altura - 24))}px`;
  });
}
addEventListener('resize', ajustarMidiaFixa, { passive: true });
// imagens carregam depois: mede de novo quando cada uma chega
$('#view-subject').addEventListener('load', ajustarMidiaFixa, true);

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

  const certChip = e.target.closest('#cert-filters .chip');
  if (certChip) {
    document.querySelectorAll('#cert-filters .chip').forEach((c) => c.classList.toggle('active', c === certChip));
    const cat = certChip.dataset.cat;
    document.querySelectorAll('#cert-grid .cert-card').forEach((c) => { c.hidden = !!cat && c.dataset.cat !== cat; });
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
    $('#lightbox-cap').textContent = zoom.dataset.caption || '';
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
    atualizarEspaco();
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
    '<span class="bp bp-tag bp-hole" aria-hidden="true">&lt;canvas&gt; · buraco negro · WebGL</span>' +
    '<span class="bp bp-tag bp-photo" aria-hidden="true">&lt;img&gt; · 1202 × 1309</span>');
}

function medirPlanta() {
  document.querySelectorAll('.bp-dim').forEach((d) => {
    const w = d.getBoundingClientRect().width;
    if (w) d.firstElementChild.textContent = `${Math.round(w)} px`;
  });
}
addEventListener('resize', medirPlanta, { passive: true });

// ---------------------------------------------------------------- espaço (estrelas e buraco negro)

// Campo de estrelas: desenhado uma vez num canvas (custa quase nada), mais algumas
// estrelas piscando e uma estrela cadente de vez em quando no modo completo.
function desenharEstrelas() {
  const c = $('#stars');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = c.clientWidth;
  const h = c.clientHeight;
  c.width = w * dpr;
  c.height = h * dpr;
  const g = c.getContext('2d');
  g.scale(dpr, dpr);
  // gerador com semente fixa: o céu é o mesmo a cada visita e a cada redimensionamento
  let seed = 20260;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const n = Math.round((w * h) / 2600);
  for (let i = 0; i < n; i++) {
    const r = rnd();
    g.globalAlpha = 0.2 + rnd() * 0.7;
    g.fillStyle = r < 0.09 ? '#CC90D5' : r < 0.14 ? '#E2C9AB' : '#FFFFFF';
    const tam = rnd() < 0.92 ? 0.4 + rnd() * 0.7 : 1.1 + rnd() * 0.6;
    g.beginPath();
    g.arc(rnd() * w, rnd() * h, tam, 0, Math.PI * 2);
    g.fill();
  }
}

function criarPiscantes() {
  const box = $('#twinkles');
  const n = innerWidth < 700 ? 14 : 34;
  let html = '';
  for (let i = 0; i < n; i++) {
    const cor = Math.random() < 0.25 ? '#CC90D5' : Math.random() < 0.15 ? '#E2C9AB' : '#fff';
    html += `<i class="tw" style="left:${(Math.random() * 100).toFixed(2)}%;top:${(Math.random() * 100).toFixed(2)}%;--s:${(1 + Math.random() * 1.6).toFixed(1)}px;--d:${(2.4 + Math.random() * 3.6).toFixed(1)}s;--o:-${(Math.random() * 5).toFixed(1)}s;--c:${cor}"></i>`;
  }
  box.innerHTML = html;
}

let cadenteTimer = 0;
function estrelaCadente() {
  clearTimeout(cadenteTimer);
  if (MODO.atual === 'leve' || SEM_ANIMACAO) return;
  cadenteTimer = setTimeout(() => {
    if (!document.hidden && MODO.atual !== 'leve') {
      const el = document.createElement('i');
      el.className = 'shoot';
      el.style.cssText = `--x:${(5 + Math.random() * 70).toFixed(1)}%;--y:${(Math.random() * 45).toFixed(1)}%;--a:${(18 + Math.random() * 22).toFixed(0)}deg;` +
        `--len:${(90 + Math.random() * 110).toFixed(0)}px;--dist:${(260 + Math.random() * 260).toFixed(0)}px;--d:${(0.8 + Math.random() * 0.6).toFixed(2)}s`;
      $('.bg-fx').append(el);
      el.addEventListener('animationend', () => el.remove());
    }
    estrelaCadente();
  }, 4500 + Math.random() * 6000);
}

// Buraco negro: nasce na tela de abertura e depois fica atrás da foto no topo
const BH = (() => {
  const canvas = $('#bh');
  const bh = window.BlackHole ? window.BlackHole.create(canvas) : { ok: false };
  if (!bh.ok) HTML.classList.add('no-webgl');
  bh.canvas = canvas;
  return bh;
})();

// Pulsar no rodapé: some se o navegador não tiver WebGL
const PULSAR = (() => {
  const p = window.Pulsar ? window.Pulsar.create($('#pulsar')) : { ok: false };
  if (!p.ok) $('#pulsar-slot').hidden = true;
  return p;
})();

// Posição no topo: centro do buraco na cabeça da foto, anel um pouco maior que o cabelo
function verBuracoNoTopo() {
  const foto = $('#hero-photo');
  BH.setView(() => {
    const f = foto.getBoundingClientRect();
    const c = BH.canvas.getBoundingClientRect();
    return {
      cx: f.left + f.width * 0.53 - c.left,
      cy: f.top + f.height * 0.2 - c.top,
      ring: f.height * 0.29
    };
  });
}

function levarBuracoParaOTopo() {
  if (!BH.ok) return;
  $('#bh-slot').append(BH.canvas);
  BH.resetZoom();
  verBuracoNoTopo();
  atualizarEspaco();
  requestAnimationFrame(() => requestAnimationFrame(() => BH.canvas.classList.add('on')));
}

// Liga ou congela as animações do espaço conforme o modo
function atualizarEspaco() {
  const parado = MODO.atual === 'leve' || SEM_ANIMACAO;
  if (BH.ok) {
    if (parado) BH.renderOnce();
    else BH.start();
  }
  if (PULSAR.ok) {
    if (parado) PULSAR.renderOnce();
    else PULSAR.start();
  }
  estrelaCadente();
}

let estrelasTimer = 0;
addEventListener('resize', () => {
  clearTimeout(estrelasTimer);
  estrelasTimer = setTimeout(desenharEstrelas, 200);
}, { passive: true });
$('#hero-photo').addEventListener('load', () => { if (BH.ok) BH.refresh(); });

// ---------------------------------------------------------------- abertura

// O Big Bang (bigbang/bigbang.js, ~600 KB com o three.js) só é baixado por quem vai vê-lo
let bigBangCarregando = null;
function carregarBigBang() {
  if (!bigBangCarregando) {
    bigBangCarregando = new Promise((ok) => {
      if (window.BigBang) { ok(window.BigBang); return; }
      const s = document.createElement('script');
      s.src = 'bigbang/bigbang.js';
      s.onload = () => ok(window.BigBang || null);
      s.onerror = () => ok(null);
      document.head.append(s);
    });
  }
  return bigBangCarregando;
}

function initIntro() {
  const intro = $('#intro');
  if (!HTML.classList.contains('intro')) {
    // sem abertura (menos movimento / ?nobanna): o buraco vai direto para o topo, parado
    levarBuracoParaOTopo();
    intro.remove();
    return;
  }

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

  // ---- centro do espaço reservado (.intro-ring): é ali que o ponto pulsa e os cursores giram
  const centro = () => {
    const r = anel.getBoundingClientRect();
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, h: r.height };
  };
  // a cena do Big Bang é desenhada com o ponto no meio da tela: desloca até o centro do anel
  const alinharPalco = () => {
    const dy = Math.round(centro().cy - innerHeight / 2);
    intro.style.setProperty('--bb-y', `${dy}px`);
    if (bbPronto && !intro.classList.contains('bb-rodando')) window.BigBang.deslocar(dy);
  };

  // ---- Big Bang ao fundo (quem escolheu o modo leve antes não baixa a animação)
  let bbPronto = false;
  const bbElementos = { palco: $('#bb-palco'), vinheta: $('#bb-vinheta'), clarao: $('#bb-clarao') };
  const prepararBigBang = () => carregarBigBang().then((BB) => {
    if (!BB || !BB.suportado || !BB.preparar(bbElementos)) {
      intro.classList.remove('bb-on');
      return false;
    }
    bbPronto = true;
    alinharPalco();
    intro.classList.add('bb-pronto');
    return true;
  });
  let medirDesde = 0.5; // s: começa a medir a fluidez depois que a cena carrega
  if (salvo !== 'leve') {
    intro.classList.add('bb-on');
    alinharPalco();
    prepararBigBang().then(() => { medirDesde = Math.max(medirDesde, (performance.now() - inicio) / 1000 + 0.4); });
  }
  addEventListener('resize', alinharPalco);

  // ---- órbita (e medição de fluidez para a sugestão)
  // Os cursores giram em volta do ponto, cada um numa distância; na experiência completa
  // eles são sugados por ele logo antes da explosão.
  const fases = cursores.map((_, i) => (i / N) * Math.PI * 2 + (i % 3) * 0.5);
  const raios = cursores.map((_, i) => 1 + (i % 4) * 0.16);
  let raf = 0;
  let saindo = false;
  let sugando = false;
  let raio = 70;
  let encolhe = 1;
  let quadros = 0;
  let medido = false;
  const inicio = performance.now();
  let anterior = inicio;
  const girar = (agora) => {
    const t = (agora - inicio) / 1000;
    const dt = Math.min((agora - anterior) / 1000, 0.1);
    anterior = agora;
    const { cx, cy, h } = centro();
    if (intro.classList.contains('bb-on')) {
      // sugados pelo ponto em ~0,6 s, qualquer que seja a velocidade do aparelho
      if (sugando) encolhe *= Math.exp(-dt * 5);
      const base = Math.min(Math.max(h * 0.36, 62), 120);
      cursores.forEach((el, i) => {
        const r = base * raios[i] * encolhe;
        const fi = fases[i] + t * (0.9 / Math.pow(raios[i], 1.5)) * (sugando ? 1 + (1 - encolhe) * 4 : 1);
        const x = cx + Math.cos(fi) * r;
        const y = cy + Math.sin(fi) * r * 0.82;
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${(0.6 + 0.4 * encolhe).toFixed(2)})`;
        el.style.opacity = sugando ? Math.min(1, Math.max(0, encolhe * 1.5 - 0.3)).toFixed(2) : '1';
      });
    } else {
      const alvo = saindo ? 40 : 70 + Math.sin(t) * 12;
      raio += (alvo - raio) * 0.12;
      cursores.forEach((el, i) => {
        const a = (i / N) * Math.PI * 2 + t * 0.6;
        const x = cx + Math.cos(a) * raio + Math.sin(t * 1.6 + i) * 3;
        const y = cy + Math.sin(a) * raio + Math.cos(t * 1.3 + i) * 3;
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      });
    }
    // Conta os quadros por 1,5 s (depois que a cena carrega: o começo é sempre mais lento)
    if (!medido && t > medirDesde && t <= medirDesde + 1.5) quadros++;
    if (!medido && t > medirDesde + 1.5) {
      medido = true;
      const s = sugerirModo(quadros / 1.5);
      sugerir(s);
      if (!decidido) marcar(s, true);
    }
    raf = requestAnimationFrame(girar);
  };
  raf = requestAnimationFrame(girar);

  const pular = $('#bb-pular');
  const abrirSite = (m, devagar) => {
    window.scrollTo(0, 0);
    MODO.definir(m);
    intro.classList.toggle('leaving-slow', !!devagar);
    intro.classList.add('leaving');
    // Mostrar o site e esconder as camadas acontece no mesmo quadro: nada pisca
    HTML.classList.remove('intro');
    removeEventListener('resize', alinharPalco);
    removeEventListener('keydown', onEsc);
    levarBuracoParaOTopo();
    medirPlanta();
    construir();
    setTimeout(() => {
      cancelAnimationFrame(raf);
      if (window.BigBang) window.BigBang.descartar();
      intro.remove();
    }, devagar ? 1300 : 450);
  };

  // Experiência completa: os cursores são sugados, o ponto explode, e a tela branca vira o site
  const tocarBigBang = () => {
    intro.classList.add('diving', 'bb-rodando');
    sugando = true;
    addEventListener('bigbang:fim', () => abrirSite('completo', true), { once: true });
    window.BigBang.comecar();
    setTimeout(() => {
      intro.classList.add('bb-pulavel');
      pular.focus({ preventScroll: true });
    }, 1200);
  };
  const onEsc = (e) => { if (e.key === 'Escape' && window.BigBang) window.BigBang.pular(); };
  pular.addEventListener('click', () => { if (window.BigBang) window.BigBang.pular(); });

  const entrar = (m) => {
    if (saindo) return;
    saindo = true;
    removeEventListener('keydown', onKey);
    botoes.forEach((b) => b.classList.toggle('pressed', b.dataset.modo === m));
    intro.classList.add('pressing');

    setTimeout(() => {
      if (m !== 'completo') { abrirSite(m); return; }
      addEventListener('keydown', onEsc);
      if (bbPronto) { tocarBigBang(); return; }
      // ainda carregando (ou a pessoa tinha escolhido o modo leve antes): espera até 8 s
      intro.classList.add('bb-on', 'diving');
      alinharPalco();
      const desistir = setTimeout(() => abrirSite(m), 8000);
      prepararBigBang().then((ok) => {
        clearTimeout(desistir);
        if (ok && HTML.classList.contains('intro')) tocarBigBang();
        else if (HTML.classList.contains('intro')) abrirSite(m);
      });
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
const PARADAS = '.section-head, .track, .feature-row, .about, .cert-intro, .cert-filters, .activity, .pager, .footer';

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
  // espera os cursores terminarem o que já está na tela antes de começar a descer
  if (window.Banna && window.Banna.busy()) { AUTO.timer = setTimeout(iniciarRolagem, 1000); return; }
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

desenharEstrelas();
criarPiscantes();
renderHome();
renderCertificados();
decorarPlanta();
route();
addEventListener('hashchange', route);
initIntro();
if (!HTML.classList.contains('intro')) medirPlanta();
pararRolagem(); // começa a contagem de inatividade
estrelaCadente();
