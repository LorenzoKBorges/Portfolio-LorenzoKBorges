// Painel da matéria: abre ao lado do planeta clicado (embaixo, no celular).
// Cada trabalho é um cartão; o número do cartão é o número da lua do planeta.

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

function midiaHTML(m) {
  if (m.tipo === 'img') {
    return `<button class="pa-img" type="button" data-zoom="${esc(m.src)}" aria-label="Ampliar imagem"><img src="${esc(m.src)}" alt="${esc(m.alt || '')}" loading="lazy"></button>`;
  }
  // iframes (Canva, YouTube, Google Docs) só carregam quando o cartão abre
  const ratio = m.ratio || (m.tipo === 'doc' ? '3/4' : '16/9');
  return `<div class="pa-embed" style="aspect-ratio:${esc(ratio)}" data-src="${esc(m.src)}"></div>`;
}

function linkHTML(l) {
  const icone = { video: '▶', github: '⌥' }[l.estilo] || '↗';
  return `<a class="pa-link ${l.estilo ? 'pa-link-' + esc(l.estilo) : ''}" href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)} <span>${icone}</span></a>`;
}

function cartaoHTML(a, k) {
  const resumo = a.texto && a.texto[0] ? a.texto[0] : '';
  return `
    <article class="pa-card" data-k="${k}" data-area="${esc(a.area || '')}">
      <button class="pa-cab" type="button" aria-expanded="false">
        <span class="pa-n" title="Lua ${pad(k + 1)}"><i></i>${pad(k + 1)}</span>
        <span class="pa-cab-txt">
          <span class="pa-cab-meta">${a.area ? `<span class="pa-chip">${esc(a.area)}</span>` : ''}${a.tag ? `<span class="pa-tag">${esc(a.tag)}</span>` : ''}</span>
          <span class="pa-titulo-card">${esc(a.titulo)}</span>
          <span class="pa-resumo">${esc(resumo)}</span>
        </span>
        <span class="pa-mais" aria-hidden="true">+</span>
      </button>
      <div class="pa-corpo" hidden>
        ${a.midia && a.midia.length ? `<div class="pa-midias">${a.midia.map(midiaHTML).join('')}</div>` : ''}
        ${(a.texto || []).map((p) => `<p class="pa-texto">${esc(p)}</p>`).join('')}
        ${a.links && a.links.length ? `<div class="pa-links">${a.links.map(linkHTML).join('')}</div>` : ''}
        ${a.codigo ? `
          <details class="pa-gaveta">
            <summary>Ver o código <span class="pa-g-icone">+</span></summary>
            <pre class="pa-codigo"><code>${esc(a.codigo)}</code></pre>
          </details>` : ''}
        ${a.habilidades && a.habilidades.length ? `
          <details class="pa-gaveta">
            <summary>Conceitos e habilidades <span class="pa-g-n">${a.habilidades.length}</span><span class="pa-g-icone">+</span></summary>
            <ul class="pa-skills">${a.habilidades.map(([c, t]) => `<li><b>${esc(c)}</b><span>${esc(t)}</span></li>`).join('')}</ul>
          </details>` : ''}
        ${a.hashtags && a.hashtags.length ? `<div class="pa-hashtags">${a.hashtags.map((h) => `<span>#${esc(h)}</span>`).join('')}</div>` : ''}
      </div>
    </article>`;
}

export class Painel {
  /**
   * @param raiz   elemento do painel
   * @param ao     { focarLua(k|null), selecionarLua(k|null), irPara(planeta), fechar() }
   */
  constructor(raiz, ao) {
    this.raiz = raiz;
    this.ao = ao;
    this.lista = raiz.querySelector('.pa-lista');
    this.filtros = raiz.querySelector('.pa-filtros');
    this.aberto = null; // índice do cartão aberto
    this.sobre = null; // índice do cartão com o mouse em cima
    this.planeta = null;

    raiz.querySelector('.pa-fechar').addEventListener('click', () => ao.fechar());
    raiz.querySelector('.pa-ant').addEventListener('click', () => this.vizinhos && ao.irPara(this.vizinhos[0]));
    raiz.querySelector('.pa-prox').addEventListener('click', () => this.vizinhos && ao.irPara(this.vizinhos[1]));

    this.lista.addEventListener('click', (e) => {
      const cab = e.target.closest('.pa-cab');
      if (cab) this.alternar(Number(cab.parentElement.dataset.k));
    });
    // passar o mouse num cartão acende a lua dele
    this.lista.addEventListener('pointerover', (e) => {
      const card = e.target.closest('.pa-card');
      const k = card ? Number(card.dataset.k) : null;
      if (k !== this.sobre) {
        this.sobre = k;
        ao.focarLua(k ?? this.aberto);
      }
    });
    this.lista.addEventListener('pointerleave', () => {
      this.sobre = null;
      ao.focarLua(this.aberto);
    });
    this.filtros.addEventListener('click', (e) => {
      const chip = e.target.closest('.pa-filtro');
      if (!chip) return;
      this.filtros.querySelectorAll('.pa-filtro').forEach((c) => c.classList.toggle('ativo', c === chip));
      const area = chip.dataset.area;
      this.lista.querySelectorAll('.pa-card').forEach((c) => { c.hidden = !!area && c.dataset.area !== area; });
    });
  }

  /** Abre o painel para um planeta (matéria). vizinhos = [anterior, próximo] no mesmo sistema */
  abrir(planeta, sistema, vizinhos) {
    this.planeta = planeta;
    this.vizinhos = vizinhos;
    this.aberto = null;
    this.sobre = null;
    const m = planeta.materia;
    const n = m.atividades.length;
    const tipo = sistema.id === 'basicas' ? 'Matéria básica' : 'Matéria técnica';
    const r = this.raiz;
    r.querySelector('.pa-k').textContent = `${sistema.rotulo} · ${tipo} · ${pad(planeta.indice + 1)}/${pad(sistema.planetas.length)}`;
    r.querySelector('.pa-titulo').textContent = m.nome;
    r.querySelector('.pa-desc').textContent = m.desc || '';
    r.querySelector('.pa-meta').innerHTML = n
      ? `<span><b>${pad(n)}</b> ${n === 1 ? 'trabalho' : 'trabalhos'}</span><span><b>${pad(n)}</b> ${n === 1 ? 'lua' : 'luas'} · uma por trabalho</span>`
      : '<span>Em breve</span>';

    // submatérias viram filtros (como na página de matéria do portfólio)
    const areas = [...new Set(m.atividades.map((a) => a.area).filter(Boolean))];
    this.filtros.hidden = areas.length < 2;
    this.filtros.innerHTML = areas.length < 2 ? '' :
      `<button class="pa-filtro ativo" type="button" data-area="">Todas <i>${n}</i></button>` +
      areas.map((a) => `<button class="pa-filtro" type="button" data-area="${esc(a)}">${esc(a)} <i>${m.atividades.filter((x) => x.area === a).length}</i></button>`).join('');

    this.lista.innerHTML = n
      ? m.atividades.map(cartaoHTML).join('')
      : `<div class="pa-vazio"><span>✦</span><p>Nenhum trabalho adicionado ainda para ${esc(m.nome)}.</p><small>Em breve</small></div>`;
    this.lista.scrollTop = 0;

    const [ant, prox] = vizinhos;
    r.querySelector('.pa-ant span').textContent = ant.materia.nome;
    r.querySelector('.pa-prox span').textContent = prox.materia.nome;

    r.hidden = false;
    r.scrollTop = 0;
    requestAnimationFrame(() => r.classList.add('on'));
  }

  fechar() {
    this.fecharCartao();
    this.raiz.classList.remove('on');
    clearTimeout(this.timerFechar);
    this.timerFechar = setTimeout(() => {
      if (!this.raiz.classList.contains('on')) {
        this.raiz.hidden = true;
        this.lista.innerHTML = '';
      }
    }, 350);
  }

  alternar(k) {
    if (this.aberto === k) this.fecharCartao();
    else this.abrirCartao(k);
  }

  /** Abre um trabalho (também usado quando a pessoa clica na lua dele) */
  abrirCartao(k, rolar = false) {
    this.fecharCartao();
    const card = this.lista.querySelector(`.pa-card[data-k="${k}"]`);
    if (!card) return;
    card.hidden = false;
    card.classList.add('aberto');
    card.querySelector('.pa-cab').setAttribute('aria-expanded', 'true');
    const corpo = card.querySelector('.pa-corpo');
    corpo.hidden = false;
    corpo.querySelectorAll('.pa-embed[data-src]').forEach((d) => {
      d.innerHTML = `<iframe src="${esc(d.dataset.src)}" loading="lazy" allowfullscreen allow="fullscreen; autoplay; encrypted-media; picture-in-picture" title="Material do trabalho"></iframe>`;
    });
    this.aberto = k;
    this.raiz.classList.add('com-cartao');
    this.ao.selecionarLua(k);
    if (rolar) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  fecharCartao() {
    if (this.aberto === null) return;
    const card = this.lista.querySelector(`.pa-card[data-k="${this.aberto}"]`);
    if (card) {
      card.classList.remove('aberto');
      card.querySelector('.pa-cab').setAttribute('aria-expanded', 'false');
      const corpo = card.querySelector('.pa-corpo');
      corpo.hidden = true;
      // tira os iframes (para vídeos pararem e o Canva não ficar pesando)
      corpo.querySelectorAll('.pa-embed').forEach((d) => { d.innerHTML = ''; });
    }
    this.aberto = null;
    this.raiz.classList.remove('com-cartao');
    this.ao.selecionarLua(null);
  }

  /** Ponto do painel onde a linha que vem do planeta (ou da lua) chega: borda esquerda, em px da tela */
  ancora() {
    const r = this.raiz.getBoundingClientRect();
    const k = this.sobre ?? this.aberto;
    if (k !== null) {
      const cab = this.lista.querySelector(`.pa-card[data-k="${k}"] .pa-cab`);
      if (cab) {
        const c = cab.getBoundingClientRect();
        const y = Math.min(Math.max(c.top + Math.min(c.height / 2, 34), r.top + 20), r.bottom - 20);
        return { x: r.left, y, lua: k };
      }
    }
    const t = this.raiz.querySelector('.pa-titulo').getBoundingClientRect();
    return { x: r.left, y: t.top + t.height / 2, lua: null };
  }
}
