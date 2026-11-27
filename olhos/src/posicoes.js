// Onde ficam os olhos no portfólio (só na página inicial e nas páginas das matérias).
//
// Cada olho fica preso a um elemento da página (`ancora`) e anda junto com ele quando a página rola:
//   x: [fração da largura do elemento, px]   (0 = borda esquerda, 1 = borda direita)
//   y: [fração da altura do elemento, px]    (0 = topo, 1 = base)
//   largura: de ponta a ponta do olho, em px
//   graus: inclinação (positivo = desce para a direita)
// Os px valem para o conteúdo com 1208 px de largura (computador) e encolhem junto com ele.
// `celular` é a versão para telas de até 860 px (conteúdo de 358 px de referência); `false` esconde.
//
// Os olhos ficam sempre POR BAIXO do conteúdo: onde passam por um cartão, uma foto ou o documento,
// só aparece a parte que sobra para fora.

export const CELULAR_ATE = 860; // px de largura da tela
export const CONTEUDO = 1208; // largura de referência do conteúdo no computador
export const CONTEUDO_CELULAR = 358; // e no celular (390 px de tela)

export const OLHOS = [
  // ---------------------------------------------------------- página inicial (desenhados pelo Lorenzo)
  {
    id: 'atividades', // à direita do título "Atividades", por baixo da etiqueta <section>
    ancora: '#atividades .section-head',
    x: [0.936, 0], y: [0, 30], largura: 320, graus: 33,
    celular: { x: [0.8, 0], y: [0, -40], largura: 150, graus: 22 },
  },
  {
    id: 'trilha-a', // espiando por trás do canto do cartão "Matérias básicas"
    ancora: '#basicas',
    x: [0, 42], y: [0, 17], largura: 242, graus: -25.6,
    celular: { x: [0, 46], y: [0, -4], largura: 130, graus: -25 },
  },
  {
    id: 'destaques', // acima do título "Em destaque"
    ancora: '#destaques .section-head',
    x: [0.674, 0], y: [0, -79], largura: 243, graus: 14,
    celular: { x: [0.72, 0], y: [0, -50], largura: 150, graus: 14 },
  },
  {
    id: 'destaques-cartoes', // pequeno, entre o texto e os cartões dos destaques
    ancora: '#feature-row',
    x: [0.104, 0], y: [0, -57], largura: 149, graus: -29,
    celular: false, // no celular não sobra espaço entre o texto e os cartões
  },
  {
    id: 'apresentacao', // por trás do documento de apresentação, saindo pela direita
    ancora: '#sobre .frame',
    x: [0.938, 0], y: [0.181, 0], largura: 292, graus: 21.7,
    celular: { x: [0.84, 0], y: [0, -26], largura: 130, graus: 20 }, // saindo por cima do documento
  },
  {
    id: 'sobre', // o grande, embaixo dos gostos (Xadrez, Coup...)
    ancora: '#sobre .about-tags',
    x: [0, 215], y: [0, 126], largura: 372, graus: 8.6,
    celular: { ancora: '#sobre .section-head', x: [0.74, 0], y: [0, -42], largura: 170, graus: 8 },
  },
  {
    id: 'rodape-nome', // acima do nome grande do rodapé (aparece também nas matérias)
    ancora: '.footer-big',
    x: [0.0745, 0], y: [0, -92], largura: 281, graus: -30.7,
    celular: { x: [0.22, 0], y: [0, -52], largura: 140, graus: -30 },
  },
  {
    id: 'rodape-topo', // perto do pulsar, por cima do "Voltar ao topo"
    ancora: '.footer-row',
    x: [1.04, 0], y: [0, -82], largura: 283, graus: -37.5,
    celular: { x: [0.84, 0], y: [0, -36], largura: 130, graus: -37 },
  },

  // ---------------------------------------------------------- páginas das matérias
  {
    id: 'materia-titulo', // ao lado da última linha do nome da matéria (ou acima, se o nome for comprido)
    pos: 'tituloMateria',
    largura: 300, graus: -12,
    // no celular o nome ocupa a largura toda: o olho vai ao lado da etiqueta "6 trabalhos"
    celular: { ancora: '#view-subject .subject-count', x: [1, 96], y: [0.5, 0], largura: 140, graus: -12 },
  },
  {
    id: 'materia-2', // espiando por trás do 2° trabalho, pela esquerda
    ancora: '#view-subject .activities > .activity:nth-child(2)',
    x: [0, 10], y: [0, 46], largura: 230, graus: -22,
    celular: false, // no celular as margens são estreitas demais para espiar
  },
  {
    id: 'materia-4', // por trás do 4° trabalho, pela direita
    ancora: '#view-subject .activities > .activity:nth-child(4)',
    x: [1, -10], y: [0, 46], largura: 230, graus: 22,
    celular: false,
  },
  {
    id: 'materia-6', // por trás do 6° trabalho, pela esquerda
    ancora: '#view-subject .activities > .activity:nth-child(6)',
    x: [0, 10], y: [0, 46], largura: 230, graus: -22,
    celular: false,
  },
  {
    id: 'materia-unico', // matéria com um trabalho só: por trás do canto de baixo, à direita
    ancora: '#view-subject .activities > .activity:only-child',
    x: [1, -10], y: [1, -46], largura: 230, graus: -22,
    celular: false,
  },
  {
    id: 'materia-vazia', // matéria "em breve": por trás do aviso, pela direita
    ancora: '#view-subject .activities > .empty',
    x: [1, -10], y: [0, 46], largura: 230, graus: 22,
    celular: false, // no celular já tem o olho do topo e o de antes de "Anterior / Próxima"
  },
  {
    id: 'materia-fim', // no celular: entre o último trabalho e "Anterior / Próxima"
    ancora: '#view-subject .pager',
    largura: 0,
    desktop: false,
    celular: { x: [0.8, 0], y: [0, 30], largura: 130, graus: -18 },
  },
];

// Ideias a mais, só aparecem com ?olhos=sugestoes no endereço (para ver antes de decidir)
export const SUGESTOES = [
  {
    id: 'sug-certificados', // à direita do título "Certificados"
    ancora: '#certificados .section-head',
    x: [0.87, 0], y: [0, -80], largura: 250, graus: -10,
    celular: { x: [0.76, 0], y: [0, -44], largura: 150, graus: -10 },
  },
  {
    id: 'sug-medalhas', // espiando por trás da foto com as medalhas
    ancora: '#certificados .cert-photo',
    x: [1, -16], y: [1, -60], largura: 230, graus: -20,
    celular: { x: [1, -12], y: [1, -40], largura: 130, graus: -20 },
  },
  {
    id: 'sug-tecnicas', // espiando por trás do cartão "Matérias técnicas", pela direita
    ancora: '#tecnicas',
    x: [1, -42], y: [0, 17], largura: 242, graus: 25.6,
    celular: { x: [1, -46], y: [0, -4], largura: 130, graus: 25 },
  },
];
