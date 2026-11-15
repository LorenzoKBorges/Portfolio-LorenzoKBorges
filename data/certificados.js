/* ==========================================================================
   Certificados
   --------------------------------------------------------------------------
   As imagens ficam em imagens/certificados/:
     <arquivo>.webp     versão grande (abre ao clicar)
     <arquivo>-p.webp   miniatura do cartão
   Para adicionar um certificado: salve as duas imagens e copie uma linha.

   Campos:
     arquivo   nome do arquivo, sem extensão
     cat       'olimpiadas' | 'xadrez' | 'cursos' | 'escola'
     titulo    nome do certificado
     org       quem emitiu / detalhe curto
     ano       ano (opcional)
     medalha   'ouro' | 'prata' | 'bronze' | 'mencao' | 'lugar2' (opcional)
   ========================================================================== */

const CERT_CATEGORIAS = {
  olimpiadas: 'Olimpíadas científicas',
  xadrez: 'Xadrez',
  cursos: 'Cursos e tecnologia',
  escola: 'Escola e eventos'
};

const CERT_MEDALHAS = {
  ouro: 'Medalha de ouro',
  prata: 'Medalha de prata',
  bronze: 'Medalha de bronze',
  mencao: 'Menção honrosa',
  lugar2: '2° lugar'
};

const CERTIFICADOS = [
  // ---- Olimpíadas científicas
  { arquivo: 'oba-2025', cat: 'olimpiadas', titulo: '28ª Olimpíada Brasileira de Astronomia e Astronáutica', org: 'OBA · Sociedade Astronômica Brasileira', ano: 2025, medalha: 'ouro' },
  { arquivo: 'obg-2024', cat: 'olimpiadas', titulo: '9ª Olimpíada Brasileira de Geografia', org: 'OBG · etapa estadual, em equipe', ano: 2024, medalha: 'prata' },
  { arquivo: 'oba-2024', cat: 'olimpiadas', titulo: '27ª Olimpíada Brasileira de Astronomia e Astronáutica', org: 'OBA · Sociedade Astronômica Brasileira', ano: 2024, medalha: 'bronze' },
  { arquivo: 'obmep-2022', cat: 'olimpiadas', titulo: '17ª Olimpíada Brasileira de Matemática das Escolas Públicas', org: 'OBMEP · IMPA', ano: 2022, medalha: 'mencao' },
  { arquivo: 'obmep-2021', cat: 'olimpiadas', titulo: '16ª Olimpíada Brasileira de Matemática das Escolas Públicas', org: 'OBMEP · IMPA', ano: 2021, medalha: 'mencao' },
  { arquivo: 'oba-2023', cat: 'olimpiadas', titulo: '26ª Olimpíada Brasileira de Astronomia e Astronáutica', org: 'OBA · Sociedade Astronômica Brasileira', ano: 2023 },
  { arquivo: 'mobfog-2023', cat: 'olimpiadas', titulo: '17ª Mostra Brasileira de Foguetes', org: 'MOBFOG · OBA', ano: 2023 },
  { arquivo: 'oba-2022', cat: 'olimpiadas', titulo: '25ª Olimpíada Brasileira de Astronomia e Astronáutica', org: 'OBA · Sociedade Astronômica Brasileira', ano: 2022 },
  { arquivo: 'mobfog-2022', cat: 'olimpiadas', titulo: '16ª Mostra Brasileira de Foguetes', org: 'MOBFOG · OBA', ano: 2022 },

  // ---- Cursos e tecnologia
  { arquivo: 'creative-tech-challenge', cat: 'cursos', titulo: 'Creative and Tech Challenge · 1ª edição', org: 'SENAI Florianópolis', medalha: 'lugar2' },
  { arquivo: 'python-senai-2025', cat: 'cursos', titulo: 'Programação em Linguagem Python', org: 'SENAI/SC · 40 horas', ano: 2025 },
  { arquivo: 'cpdi-logica-2023', cat: 'cursos', titulo: 'Introdução à Lógica de Programação', org: 'CPDI · 180 horas/aula', ano: 2023 },
  { arquivo: 'cpdi-meu-aplicativo-2022', cat: 'cursos', titulo: 'Meu AplicAtivo', org: 'CPDI · 50 horas/aula', ano: 2022 },
  { arquivo: 'nexxera-conexao-jovem-2022', cat: 'cursos', titulo: 'Projeto Conexão Jovem', org: 'Instituto Nexxera', ano: 2022 },

  // ---- Xadrez
  { arquivo: 'xadrez-fenaj-2025', cat: 'xadrez', titulo: 'FENAJ · Festival Nacional da Juventude', org: 'Campeonato Brasileiro Sub 14, 16 e 18 · Florianópolis', ano: 2025 },
  { arquivo: 'xadrez-brazil-chess-series-2025', cat: 'xadrez', titulo: 'Brazil Chess Series · Floripa', org: 'Lira Tênis Clube · Florianópolis', ano: 2025 },
  { arquivo: 'xadrez-brasileiro-escolar-2024', cat: 'xadrez', titulo: 'Campeonato Brasileiro de Xadrez Escolar', org: 'CBX · Caxambu/MG', ano: 2024 },
  { arquivo: 'xadrez-taca-pro-2024', cat: 'xadrez', titulo: 'Taça Pró Xadrez', org: 'Pró Xadrez Clube', ano: 2024 },
  { arquivo: 'xadrez-circuito-rapidas-2024', cat: 'xadrez', titulo: 'V Circuito Rápidas Pró Xadrez · etapa 4', org: 'Pró Xadrez Clube', ano: 2024 },
  { arquivo: 'xadrez-circuito-blitz-2024', cat: 'xadrez', titulo: 'V Circuito Rápidas e Blitz Pró Xadrez · etapa 2', org: 'Pró Xadrez Clube', ano: 2024 },
  { arquivo: 'xadrez-escolar-floripa-2024', cat: 'xadrez', titulo: 'Circuito de Xadrez Escolar da Grande Florianópolis', org: '1ª etapa', ano: 2024 },
  { arquivo: 'xadrez-fecaj-2024', cat: 'xadrez', titulo: 'FECAJ · Festival Catarinense da Juventude', org: 'Federação Catarinense de Xadrez · Joaçaba', ano: 2024 },
  { arquivo: 'xadrez-floripa-chess-open-2024', cat: 'xadrez', titulo: 'X Floripa Chess Open', org: 'Floripa Chess Festival', ano: 2024 },

  // ---- Escola e eventos
  { arquivo: 'siem-2026', cat: 'escola', titulo: 'XIV SIEM · Simulação de Organizações Internacionais', org: 'UFSC · organização do evento, 12 horas', ano: 2026 },
  { arquivo: 'contraturno-redacao-2024', cat: 'escola', titulo: 'Contraturno de Redação', org: 'Escola SESI · 54 horas/aula', ano: 2024 },
  { arquivo: 'avalia-sesi-2024', cat: 'escola', titulo: 'Avalia SESI · desempenho em Matemática', org: 'PASSE · Sistema SESI de Educação', ano: 2024 },
  { arquivo: 'feira-matematica-2023', cat: 'escola', titulo: 'IX Feira Regional de Matemática da Grande Florianópolis', org: 'Prefeitura de Florianópolis', ano: 2023 },
  { arquivo: 'ebias-inteligencia-emocional-2021', cat: 'escola', titulo: 'Projeto Desenvolvendo a Inteligência Emocional', org: 'EBIAS · Prefeitura de Florianópolis', ano: 2021 }
];
