let currentYear = 1;
const BG = { 1:'#0D0D1F', 2:'#090916', 3:'#050510' };

// --- Dados das disciplinas e trabalhos ---
// Agora carregados de arquivos separados (data/1ano.json, data/2ano.json, data/3ano.json)
// em vez de ficarem todos escritos aqui dentro. Facilita adicionar/editar atividades
// sem mexer na lógica do site.

let MAT = {};
let BAS = {};
let TRABALHOS = {};

function inicializarDados() {
  const todosOsDados = [
      { ano: 1, dados: typeof DADOS_1ANO !== 'undefined' ? DADOS_1ANO : {} },
      { ano: 2, dados: typeof DADOS_2ANO !== 'undefined' ? DADOS_2ANO : {} },
      { ano: 3, dados: typeof DADOS_3ANO !== 'undefined' ? DADOS_3ANO : {} }
  ];

  todosOsDados.forEach(item => {
    MAT[item.ano] = item.dados.materias || [];
    BAS[item.ano] = item.dados.basicas || [];
    
    Object.keys(item.dados.trabalhos || {}).forEach(nomeMateria => {
      TRABALHOS[`${item.ano}-${nomeMateria}`] = item.dados.trabalhos[nomeMateria];
    });
  });
}

inicializarDados();



function scrollToContent() {
  const page = document.querySelector('#page-home');
  const target = document.getElementById('main-content');
  page.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
}

function setAno(a) {
  goHome();
  currentYear = a;
  document.getElementById('pf').style.background = BG[a];
// Atualiza os botões antigos da Navbar (manteremos por enquanto)
    [1,2,3].forEach(n => document.getElementById('t'+n).classList.toggle('active', n===a));
    
    // ADICIONE ESTA LINHA: Atualiza os NOVOS botões da página!
    [1,2,3].forEach(n => {
        let btn = document.getElementById('pt'+n);
        if(btn) btn.classList.toggle('active', n===a);
    });

  const badge = document.getElementById('badge');
  if(badge) badge.style.display = a === 3 ? 'inline-block' : 'none';

  document.getElementById('sec-label').textContent = `Disciplinas — ${a}° ano`;
  document.getElementById('tec-title').textContent = a === 1 ? 'Mundo do Trabalho' : 'Matérias do Técnico';
  updateAstro(a); 
}

function openSelector(tipo) {
  const list = document.getElementById('modal-list');
  const title = document.getElementById('modal-title');
  let data = [];
  let tagInfo = "";

  if (tipo === 'basicas') {
      title.textContent = "Matérias Básicas";
      data = BAS[currentYear];
      tagInfo = `${currentYear}° Ano · Matéria Básica`;
  } else {
      title.textContent = currentYear === 1 ? "Mundo do Trabalho" : "Matérias do Técnico";
      data = MAT[currentYear];
      tagInfo = currentYear === 1 ? `1° Ano · Mundo do Trabalho` : `${currentYear}° Ano · Técnico`;
  }
  
  list.innerHTML = data.map(([n, d]) => `
      <div class="mat-card" onclick="openMateria('${n.replace(/'/g,"\\'")}','${d.replace(/'/g,"\\'")}','${tagInfo}')">
          <div class="mat-card-title">${n}</div>
          <div class="mat-card-arrow">Ver matéria →</div>
      </div>
  `).join('');
  
  document.getElementById('modal-overlay').classList.add('active');
}

function closeSelector() { 
  document.getElementById('modal-overlay').classList.remove('active'); 
}

function openMateria(nome, desc, tag) {
  closeSelector();
  document.getElementById('mp-title').textContent = nome;
  document.getElementById('mp-sub').textContent = desc;
  document.getElementById('mp-tag').textContent = tag;

  // --- MUDANÇA AQUI: LÓGICA DE MOSTRAR O TRABALHO CERTO ---
  const container = document.getElementById('activities-container');
  const chave = `${currentYear}-${nome}`; // Cria a chave "3-Matemática III"

  if (TRABALHOS[chave]) {
      // Se achar o trabalho, joga ele na tela
      container.innerHTML = TRABALHOS[chave];
  } else {
      // Se não tiver trabalho pra essa matéria, mostra o aviso
      container.innerHTML = `
          <div class="placeholder" style="padding: 40px;">
              Nenhum trabalho adicionado ainda para ${nome}.
              <small style="display:block; margin-top:4px; font-size:11px;">Em breve você poderá adicionar seus projetos aqui.</small>
          </div>
      `;
  }
  // --------------------------------------------------------

  document.getElementById('page-home').classList.replace('visible','hidden');
  document.getElementById('page-materia').classList.replace('hidden','visible');
  document.getElementById('pf').scrollTop = 0;
}

function goHome() {
  document.getElementById('page-materia').classList.replace('visible','hidden');
  document.getElementById('page-home').classList.replace('hidden','visible');
}

function toggleSb() {
  document.getElementById('sb').classList.toggle('open');
  document.getElementById('ov').classList.toggle('open');
}

function goTo(id) {
  goHome();
  
  setTimeout(() => {
    const elemento = document.getElementById(id);
    if(elemento) {
      elemento.scrollIntoView({behavior:'smooth'});
    }
  }, 100);
}

// estrelas
const sc = document.getElementById('stars');
for(let i = 0; i < 80; i++){
  const s = document.createElement('div');
  s.className = 'star';
  const sz = Math.random() * 2.5 + 0.8;
  const dx = (Math.random() - 0.5) * 12;
  const dy = (Math.random() - 0.5) * 12;
  s.style.cssText = `
    width:${sz}px; height:${sz}px;
    top:${Math.random()*100}%; left:${Math.random()*100}%;
    --td:${1.5+Math.random()*2.5}s;
    --md:${6+Math.random()*8}s;
    --dx:${dx}px; --dy:${dy}px;
    animation-delay:${Math.random()*5}s, ${Math.random()*5}s;
    box-shadow: 0 0 ${sz*3}px rgba(200,200,255,0.9);
  `;
  sc.appendChild(s);
}

// ── Astros ──
const angles = [0,45,90,135,180,225,270,315];

function makeStar(id) {
    const el = document.createElement('div');
    el.className = 'astro astro-star'; el.id = id;
    const inner = document.createElement('div'); inner.className = 'astro-inner';
    const core = document.createElement('div'); core.className = 'star-core';
    inner.appendChild(core);
    angles.forEach(a => {
        const ray = document.createElement('div'); ray.className = 'ray';
        ray.style.cssText = `transform: translateX(-50%) translateY(-100%) rotate(${a}deg); transform-origin: 50% 100%; animation-delay: ${a/360}s`;
        inner.appendChild(ray);
    });
    el.appendChild(inner);
    return el;
}

function makeMoon(id) {
    const el = document.createElement('div');
    el.className = 'astro astro-moon'; el.id = id;
    el.innerHTML = '<div class="astro-inner"><div class="moon-shape"></div><div class="moon-glow"></div></div>';
    return el;
}

function makeBlackhole(id) {
    const el = document.createElement('div');
    el.className = 'astro astro-blackhole'; el.id = id;
    el.innerHTML = '<div class="astro-inner"><div class="bh-distortion"></div><div class="bh-ring"></div><div class="bh-core"></div></div>';
    return el;
}

function createAstros() {
    const pf = document.getElementById('pf');

    // Principal — direita
    pf.appendChild(makeStar('astro-star'));
    pf.appendChild(makeMoon('astro-moon'));
    pf.appendChild(makeBlackhole('astro-blackhole'));

    // Secundário A — canto superior esquerdo
    pf.appendChild(makeStar('astro-star-a'));
    pf.appendChild(makeMoon('astro-moon-a'));
    pf.appendChild(makeBlackhole('astro-blackhole-a'));

    // Secundário B — canto inferior direito
    pf.appendChild(makeStar('astro-star-b'));
    pf.appendChild(makeMoon('astro-moon-b'));
    pf.appendChild(makeBlackhole('astro-blackhole-b'));
}

function randomPos() {
    // Evita o centro (30%-70%) para não sobrepor o conteúdo
    const zones = [
        { top: [5, 20],  left: [3, 25]  },  // canto superior esquerdo
        { top: [5, 20],  left: [75, 95] },  // canto superior direito
        { top: [65, 85], left: [3, 25]  },  // canto inferior esquerdo
        { top: [65, 85], left: [75, 95] },  // canto inferior direito
        { top: [5, 20],  left: [35, 60] },  // topo centro
    ];
    const z = zones[Math.floor(Math.random() * zones.length)];
    const top  = z.top[0]  + Math.random() * (z.top[1]  - z.top[0]);
    const left = z.left[0] + Math.random() * (z.left[1] - z.left[0]);
    return { top: top + '%', left: left + '%', right: 'auto' };
}

function updateAstro(ano) {
    const allIds = [
        'astro-star','astro-moon','astro-blackhole',
        'astro-star-a','astro-moon-a','astro-blackhole-a',
        'astro-star-b','astro-moon-b','astro-blackhole-b'
    ];
    allIds.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.remove('visible');
    });

    const map = {
        1: ['astro-star',      'astro-star-a',      'astro-star-b'],
        2: ['astro-moon',      'astro-moon-a',      'astro-moon-b'],
        3: ['astro-blackhole', 'astro-blackhole-a', 'astro-blackhole-b']
    };

    // Sorteia 3 zonas diferentes para os 3 astros
    const usedZones = [];
    map[ano].forEach(id => {
        const el = document.getElementById(id);
        if(!el) return;
        let pos;
        do { pos = randomPos(); } while(usedZones.includes(pos.left));
        usedZones.push(pos.left);
        el.style.top   = pos.top;
        el.style.left  = pos.left;
        el.style.right = 'auto';
        setTimeout(() => el.classList.add('visible'), 80);
    });
}


// ── Estrelas cadentes ──
function launchShootingStar() {
  const container = document.getElementById('pf');
  const W = container.offsetWidth;
  const H = container.offsetHeight;

  // Nasce no topo ou canto superior esquerdo
  const fromTop = Math.random() > 0.4;
  const startX  = fromTop ? Math.random() * W * 1.2 : Math.random() * W * 0.2;
  const startY  = fromTop ? Math.random() * H * 0.2 : Math.random() * H * 0.4;

  // Diagonal suave para baixo-direita
  const angle = 25 + Math.random() * 20;
  const dist  = 250 + Math.random() * 200;
  const rad   = (angle * Math.PI) / 180;
  const tx    = Math.cos(rad) * dist;
  const ty    = Math.sin(rad) * dist;
  const tail  = 80 + Math.random() * 100;
  const dur   = 0.8 + Math.random() * 0.6;

  const star = document.createElement('div');
  star.className = 'shooting-star';
  star.style.cssText = `
    left: ${startX}px;
    top:  ${startY}px;
    --tx: ${tx}px;
    --ty: ${ty}px;
    --angle: ${angle}deg;
    --tail: ${tail}px;
    --dur: ${dur}s;
  `;

  container.appendChild(star);
  star.addEventListener('animationend', () => star.remove());

  // Próxima: entre 3s e 5s
  setTimeout(launchShootingStar, 3000 + Math.random() * 2000);
}

// Primeiro disparo após 2s
setTimeout(launchShootingStar, 2000);


function toggleSkills(btn) {
    const content = btn.nextElementSibling;
    content.classList.toggle('active');
    
    // Gira a setinha se você colocar uma, ou muda o texto
    if (content.classList.contains('active')) {
        btn.style.borderColor = "#7B7FD4";
        btn.querySelector('.arrow-icon').style.transform = "rotate(180deg)";
    } else {
        btn.style.borderColor = "rgba(123, 127, 212, 0.2)";
        btn.querySelector('.arrow-icon').style.transform = "rotate(0deg)";
    }
}
// Carrega os dados das disciplinas e só então inicia a interface
carregarDados()
  .then(() => {
    createAstros();
    setAno(1);
  })
  .catch(err => {
    console.error('Erro ao carregar os dados das disciplinas:', err);
    createAstros();
    setAno(1);
  });


  // Inicializa a interface

createAstros();
setAno(1);
