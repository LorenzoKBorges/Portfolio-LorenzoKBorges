/* Portfólio · 3° ano
   Monta as trilhas (básicas / técnicas), as páginas de cada matéria e as
   interações. Os dados ficam em data/3ano.js (objeto PORTFOLIO). */

const TRILHAS = {
  basicas: { nome: 'Matérias básicas', curto: 'Básica', cor: 'var(--bas)' },
  tecnicas: { nome: 'Matérias técnicas', curto: 'Técnico', cor: 'var(--tec)' }
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

function atividadeHTML(a, i) {
  return `
    <article class="activity" data-area="${esc(a.area || '')}" style="--i:${i}">
      <div class="activity-media">${a.midia.map(midiaHTML).join('')}</div>
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
  const ativa = abrirMateria && subject.querySelector('.subject-switch .active');
  if (ativa) ativa.parentElement.scrollLeft = ativa.offsetLeft - 16;

  if (!primeiraRota) {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const alvo = pendingScroll;
    pendingScroll = null;
    if (alvo && !abrirMateria) requestAnimationFrame(() => scrollToId(alvo, 'instant'));
    // Os cursores constroem cada nova página de matéria
    if (abrirMateria && window.Banna && CONSTRUIR) {
      document.querySelectorAll('.nav, .footer').forEach((el) => el.setAttribute('data-banna-skip', ''));
      window.Banna.start();
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
    const x = (e.clientX / innerWidth - 0.5) * 30;
    const y = (e.clientY / innerHeight - 0.5) * 30;
    fx.style.setProperty('--px', `${x}px`);
    fx.style.setProperty('--py', `${y}px`);
  }, { passive: true });
}

// ---------------------------------------------------------------- abertura

// Sem animação para quem pediu menos movimento no sistema ou usa ?nobanna
const CONSTRUIR = !matchMedia('(prefers-reduced-motion: reduce)').matches && !/[?&]nobanna/.test(location.search);

function initIntro() {
  const root = document.documentElement;
  const intro = $('#intro');
  if (!root.classList.contains('intro')) { intro.remove(); return; }

  const cores = ['#D7422C', '#E2C9AB', '#E5E5E5', '#F06A4F', '#C9A27E', '#B8343F'];
  const N = 9; // mesmo número de cursores do banna (data-agents)
  const orbit = $('#intro-orbit');
  const cursores = Array.from({ length: N }, (_, i) => {
    const el = document.createElement('span');
    el.className = 'intro-cursor';
    el.style.setProperty('--c', cores[i % cores.length]);
    el.innerHTML = '<svg viewBox="0 0 20 22"><path d="M2 2l15 8-6.5 2L8 19z"/></svg>';
    orbit.append(el);
    return el;
  });

  let raf = 0;
  let saindo = false;
  let raio = 70;
  const inicio = performance.now();
  const girar = (agora) => {
    const t = (agora - inicio) / 1000;
    const cx = innerWidth / 2;
    const cy = innerHeight / 2;
    // Antes de sair, o círculo fecha no raio em que o banna posiciona os cursores dele
    const alvo = saindo ? 40 : 70 + Math.sin(t * 1) * 12;
    raio += (alvo - raio) * 0.12;
    cursores.forEach((el, i) => {
      const a = (i / N) * Math.PI * 2 + t * 0.6;
      const x = cx + Math.cos(a) * raio + Math.sin(t * 1.6 + i) * 3;
      const y = cy + Math.sin(a) * raio + Math.cos(t * 1.3 + i) * 3;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    });
    raf = requestAnimationFrame(girar);
  };
  raf = requestAnimationFrame(girar);

  const entrar = () => {
    if (saindo) return;
    saindo = true;
    removeEventListener('keydown', onKey);
    intro.classList.add('pressing');
    setTimeout(() => {
      window.scrollTo(0, 0);
      intro.classList.add('leaving');
      // Mostrar o site e esconder as camadas acontece no mesmo quadro: nada pisca
      root.classList.remove('intro');
      if (window.Banna && CONSTRUIR) window.Banna.start();
      setTimeout(() => { cancelAnimationFrame(raf); intro.remove(); }, 450);
    }, 220);
  };
  const onKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      entrar();
    }
  };
  intro.addEventListener('click', entrar);
  addEventListener('keydown', onKey);
  intro.focus({ preventScroll: true });
}

// ---------------------------------------------------------------- rolagem automática

// Se o visitante ficar parado, a página desce devagar sozinha.
// Qualquer movimento (mouse, toque, roda, teclado) para a rolagem e reinicia a contagem.
const AUTO = {
  espera: 5000,       // ms parado antes de começar a descer
  velocidade: 42,     // pixels por segundo
  ativo: false,
  timer: 0,
  raf: 0,
  sobra: 0,
  ultimo: 0
};

function podeRolarSozinho() {
  return CONSTRUIR &&
    !document.documentElement.classList.contains('intro') &&
    !document.body.classList.contains('menu-open') &&
    $('#lightbox').hidden &&
    !document.hidden &&
    document.activeElement?.tagName !== 'IFRAME' &&   // vendo um Canva / vídeo
    innerHeight + scrollY < document.documentElement.scrollHeight - 2;
}

function pararRolagem() {
  if (AUTO.ativo) {
    AUTO.ativo = false;
    cancelAnimationFrame(AUTO.raf);
    $('#autoscroll-pill').classList.remove('on');
  }
  clearTimeout(AUTO.timer);
  AUTO.timer = setTimeout(iniciarRolagem, AUTO.espera);
}

function iniciarRolagem() {
  if (!podeRolarSozinho()) { AUTO.timer = setTimeout(iniciarRolagem, AUTO.espera); return; }
  AUTO.ativo = true;
  AUTO.sobra = 0;
  AUTO.ultimo = performance.now();
  $('#autoscroll-pill').classList.add('on');
  const passo = (agora) => {
    if (!AUTO.ativo) return;
    if (!podeRolarSozinho()) { pararRolagem(); return; }
    const dt = Math.min((agora - AUTO.ultimo) / 1000, 0.05);
    AUTO.ultimo = agora;
    AUTO.sobra += AUTO.velocidade * dt;
    const px = Math.floor(AUTO.sobra);
    if (px >= 1) {
      AUTO.sobra -= px;
      window.scrollBy({ top: px, behavior: 'instant' });
    }
    AUTO.raf = requestAnimationFrame(passo);
  };
  AUTO.raf = requestAnimationFrame(passo);
}

['pointermove', 'pointerdown', 'wheel', 'touchstart', 'keydown'].forEach((ev) =>
  addEventListener(ev, pararRolagem, { passive: true }));
document.addEventListener('visibilitychange', pararRolagem);
addEventListener('hashchange', pararRolagem);

// ---------------------------------------------------------------- início

renderHome();
route();
addEventListener('hashchange', route);
initIntro();
pararRolagem(); // começa a contagem de inatividade
