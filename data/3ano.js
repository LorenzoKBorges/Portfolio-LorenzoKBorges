/* ==========================================================================
   Atividades do 3° ano
   --------------------------------------------------------------------------
   Para adicionar uma atividade, copie um objeto dentro de "atividades" e
   troque os campos. Nenhum HTML é necessário.

   Campos de uma atividade:
     titulo      texto do título
     tag         subtítulo curto (opcional)
     area        submatéria dentro da matéria (ex.: "Química"), usada nos filtros
     texto       lista de parágrafos
     midia       lista de { tipo: 'embed' | 'doc' | 'img', src, ratio?, alt? }
     links       lista de { label, href, estilo?: 'video' | 'github' }
     habilidades lista de [código, descrição]
     codigo      código-fonte exibido em bloco (opcional)
     hashtags    lista de palavras (opcional)
   ========================================================================== */

// Projetos que aparecem em mais de uma matéria
const GRAND_PRIX = {
  titulo: 'Grand Prix · Desafio Vale',
  tag: 'Projeto de Inovação',
  texto: [
    'Solução desenvolvida para o Grand Prix em parceria com a Vale, integrando dispositivos IoT para coleta de dados e estruturação em banco de dados para otimização industrial.'
  ],
  midia: [{ tipo: 'embed', src: 'https://www.canva.com/design/DAHG7LgveB0/IZCExqde8d4f6hy9SgR-oA/view?embed' }],
  links: [
    { label: 'Ver pitch', href: 'https://www.youtube.com/watch?v=2o7PK2cXa60', estilo: 'video' },
    { label: 'Sistema de roteirização', href: 'https://www.youtube.com/watch?v=MSF-WI-C_6U', estilo: 'video' },
    { label: 'Ver no Canva', href: 'https://www.canva.com/design/DAHG7LgveB0/IZCExqde8d4f6hy9SgR-oA/view' }
  ],
  hashtags: ['GrandPrix', 'Inovação', 'Vale']
};

const PROJETO_BP = {
  titulo: 'Projeto da BP · Promotora de crédito',
  tag: 'Desenvolvimento de Backend',
  texto: [
    'Participamos de uma competição organizada pela BP, na qual liderei meu grupo a solucionar um problema baseado em uma situação real de uma promotora de créditos.',
    'Desenvolvemos um backend para atender às necessidades apresentadas, aplicando conhecimentos de programação e banco de dados, além de trabalho em equipe e resolução de problemas.'
  ],
  midia: [{ tipo: 'img', src: 'imagens/foto-bp-site.png', alt: 'Tela do projeto da BP' }],
  links: [
    { label: 'Ver projeto no GitHub', href: 'https://github.com/fullzer4/RinhaSenai2026FullStack/tree/main/participants/maneuchos', estilo: 'github' }
  ],
  habilidades: [
    ['H1', 'Reconhecer requisitos de qualidade, integridade, usabilidade e segurança da informação.'],
    ['H4', 'Selecionar linguagem de programação de acordo com os requisitos.'],
    ['H6', 'Aplicar linguagem de programação por meio de APIs, bibliotecas e frameworks na construção de rotinas de software.']
  ]
};

const PORTFOLIO = {
  basicas: [
    {
      id: 'matematica',
      nome: 'Matemática',
      desc: 'Geometria espacial, estatística, combinatória e probabilidade.',
      atividades: [
        {
          titulo: 'Análise do filme Quebrando a Banca',
          tag: 'Atividade Prática',
          area: 'Probabilidade',
          texto: [
            'A atividade consistiu na análise do filme Quebrando a Banca, identificando a aplicação de Análise Combinatória e Probabilidade em estratégias de contagem e previsão de resultados. A proposta evidenciou como esses conceitos matemáticos são utilizados em situações reais, como jogos e tomadas de decisão.',
            'O trabalho contribuiu para perceber a matemática de forma prática e estratégica, além do ambiente escolar.'
          ],
          midia: [{ tipo: 'doc', src: 'https://docs.google.com/document/d/1EcDf4u_1tskI4e11GXKBimwpVRFgz2nsD7Uv5mjximE/preview' }],
          links: [{ label: 'Abrir original', href: 'https://docs.google.com/document/d/1EcDf4u_1tskI4e11GXKBimwpVRFgz2nsD7Uv5mjximE/edit?usp=sharing' }],
          habilidades: [
            ['C5', 'Aplicar o pensamento probabilístico para quantificar e fazer previsões em situações aplicadas a diferentes áreas do conhecimento e da vida cotidiana.'],
            ['H30', 'Identificar dados, regularidades e relações numa situação que envolva o raciocínio combinatório, utilizando os processos de contagem.'],
            ['H31', 'Reconhecer fenômenos e eventos (naturais, científicos, tecnológicos e/ou sociais) de caráter aleatório, compreendendo o significado e a importância da probabilidade como meio de prever resultados.']
          ],
          hashtags: ['Matemática', '3Ano']
        },
        {
          titulo: 'Jogo War Star Wars',
          tag: 'Apresentação Digital',
          area: 'Probabilidade',
          texto: [
            'Nesta apresentação, exploramos a matemática por trás do jogo War, analisando as probabilidades nos lances de dados, estratégias de dominação de territórios e a tomada de decisão com base na estatística.'
          ],
          midia: [{ tipo: 'embed', src: 'https://www.canva.com/design/DAHHq2I-uX4/P__BXht6Fycf4WfJD792Vg/view?embed' }],
          links: [{ label: 'Ver no Canva', href: 'https://www.canva.com/design/DAHHq2I-uX4/P__BXht6Fycf4WfJD792Vg/view' }],
          habilidades: [
            ['C5', 'Aplicar o pensamento probabilístico para quantificar e fazer previsões em situações aplicadas a diferentes áreas do conhecimento e da vida cotidiana.'],
            ['H30', 'Identificar dados, regularidades e relações numa situação que envolva o raciocínio combinatório, utilizando os processos de contagem.'],
            ['H31', 'Reconhecer fenômenos e eventos (naturais, científicos, tecnológicos e/ou sociais) de caráter aleatório, compreendendo o significado e a importância da probabilidade como meio de prever resultados.']
          ],
          hashtags: ['Matemática', 'Estatística', 'Jogos']
        },
        {
          titulo: 'Apresentação Estatística',
          tag: 'Apresentação Digital',
          area: 'Estatística',
          texto: [
            'Realizamos uma pesquisa com estudantes do SESI para descobrir quanto tempo eles passam nas redes sociais diariamente.',
            'Depois, utilizamos a Estatística para organizar os dados em tabelas e gráficos, facilitando a análise e comparação dos resultados.'
          ],
          midia: [{ tipo: 'embed', src: 'https://www.canva.com/design/DAHNoBGaAek/cz6AzZsSSKXPUffwrXp9aA/view?embed', ratio: '1.79' }],
          links: [{ label: 'Ver no Canva', href: 'https://www.canva.com/design/DAHNoBGaAek/mKKrrUiZAC3EGOfkH6T3xg/view' }],
          habilidades: [
            ['C4', 'Analisar e investigar dados e informações de natureza científica e social, articulando diferentes áreas do conhecimento, compreendendo representações gráficas e uso de modelos matemáticos, realizando inferências, previsões e tendências, para tomadas de decisão.'],
            ['H27', 'Compreender informações estatísticas provenientes de naturezas distintas (social, econômica, política ou científica) e formular juízos com base nessas informações.'],
            ['H28', 'Calcular medidas de tendência central e de dispersão de um conjunto de dados para aplicá-las e analisá-las em situações diversas no contexto das ciências, das tecnologias, das atividades pessoais e profissionais.'],
            ['H29', 'Construir tabelas e gráficos com recursos tecnológicos que permitam simplificar cálculos, facilitar a leitura e a compreensão das informações, para análise da realidade.']
          ]
        }
      ]
    },
    {
      id: 'linguagens',
      nome: 'Linguagens',
      desc: 'Literatura, redação, produção audiovisual e inglês.',
      atividades: [
        {
          titulo: 'Trabalho de Literatura',
          tag: 'Produção Audiovisual',
          area: 'Literatura',
          texto: [
            'A atividade consistiu na produção de um vídeo sobre ética e desconstrução a partir da obra A Paixão segundo G.H., de Clarice Lispector. A proposta envolveu analisar como a experiência da personagem rompe com padrões morais tradicionais, trazendo uma reflexão sobre limites éticos e liberdade individual.',
            'O trabalho permitiu compreender como a literatura pode provocar questionamentos profundos, indo além da interpretação comum e explorando aspectos filosóficos presentes na narrativa.'
          ],
          midia: [{ tipo: 'embed', src: 'https://www.youtube.com/embed/aIVkBBRHdQI' }],
          habilidades: [
            ['H22', 'Produzir textos técnicos de acordo com uma estrutura estabelecida.'],
            ['H4', 'Reconhecer a pluralidade de manifestações artísticas e culturais como forma de integração entre pessoas e entre diferentes grupos sociais e étnicos.']
          ]
        },
        {
          titulo: 'Realismo no Brasil',
          tag: 'Apresentação Digital',
          area: 'Literatura',
          texto: [
            'A atividade consistiu na criação de um jogo sobre o Realismo, acompanhado de uma apresentação comparativa com o Romantismo. A proposta destacou as diferenças entre os movimentos, como o olhar crítico e objetivo do Realismo em contraste com a idealização romântica.',
            'O trabalho facilitou a compreensão de como cada escola literária interpreta a realidade de maneira distinta.'
          ],
          midia: [{ tipo: 'embed', src: 'https://www.canva.com/design/DAHB31eK4C0/IxbRqi24bWV-9AUkbmof2Q/view?embed' }],
          habilidades: [
            ['H15', 'Produzir trabalhos individuais e coletivos, explorando materiais e técnicas ligados ao universo das composições artísticas e de práticas corporais.']
          ]
        },
        {
          titulo: 'Videomanifesto',
          tag: 'A Silenciosa Ruína da Elegância Contemporânea',
          area: 'Língua Portuguesa',
          texto: [
            'Nessa atividade, eu e meu grupo tivemos que escolher um tema para fazer um vídeo no estilo manifesto. Nós escolhemos falar sobre o decaimento da moda.',
            'Falamos de como o consumismo e a produção em massa fizeram as roupas perderem o charme e comparamos, por exemplo, com a moda vintage: como vestidos e acessórios mudaram.'
          ],
          midia: [{ tipo: 'embed', src: 'https://www.canva.com/design/DAHLRa7V2h8/b5U1Jj4B9dMXMyhaVxdKtw/watch?embed' }],
          links: [{ label: 'Ver vídeo', href: 'https://youtu.be/XpLI45ryUJo', estilo: 'video' }],
          habilidades: [
            ['H3', 'Identificar o tema principal, os subtemas e finalidades dos textos.'],
            ['H24', 'Produzir textos escritos de domínio acadêmico e educacional.']
          ]
        },
        {
          titulo: 'Nota da redação',
          tag: 'Plataforma RED1000',
          area: 'Redação',
          texto: [
            'Uma redação sobre o tema "Os perigos do autodiagnóstico de transtornos mentais nas redes sociais no Brasil".',
            'Realizar essa redação me ajudou muito, com as dicas da prof. Natali, a melhorar na parte da conclusão.'
          ],
          midia: [{ tipo: 'img', src: 'imagens/os-perigos-da-au.png', alt: 'Print da redação, nota 760' }],
          habilidades: [
            ['H22', 'Produzir textos técnicos de acordo com uma estrutura estabelecida.']
          ]
        },
        {
          titulo: 'Meus gostos',
          tag: 'O que eu gosto, em inglês',
          area: 'Inglês',
          texto: [
            'A atividade consistiu em escrever as coisas favoritas de diferentes áreas artísticas, como banda, filme...',
            'Sempre é bom praticar inglês: atividades como essa fazem não perder o costume de se comunicar em outra língua.'
          ],
          midia: [{ tipo: 'doc', src: 'https://docs.google.com/document/d/1YJ4BYgtgcY8ZsDcVTCHs-DOE0R6t8tKqTef5zFQbtDw/preview', ratio: '4/3' }],
          links: [{ label: 'Abrir documento', href: 'https://docs.google.com/document/d/1YJ4BYgtgcY8ZsDcVTCHs-DOE0R6t8tKqTef5zFQbtDw/edit?usp=sharing' }],
          habilidades: [
            ['H25', 'Interpretar textos em Língua Estrangeira Moderna (Inglês).']
          ]
        }
      ]
    },
    {
      id: 'humanas',
      nome: 'Humanas',
      desc: 'História, geografia, sociologia e filosofia contemporâneas.',
      atividades: [
        {
          titulo: 'A Grande Guerra · Alemanha',
          tag: 'Documento Histórico',
          area: 'História',
          texto: [
            'A atividade consistiu na recriação de um jornal do ano de 1914, noticiando os avanços tecnológicos da época e os eventos políticos e sociais que culminariam na Primeira Guerra Mundial, com foco na perspectiva da Alemanha.',
            'O trabalho permitiu compreender o contexto pré-guerra e o impacto da Revolução Industrial nos conflitos bélicos.'
          ],
          midia: [{ tipo: 'embed', src: 'https://www.canva.com/design/DAHFhkmpHFg/Ai0pz-1RSfhyaQLSZAFglA/view?embed', ratio: '4/5' }],
          links: [{ label: 'Ver no Canva', href: 'https://www.canva.com/design/DAHFhkmpHFg/Ai0pz-1RSfhyaQLSZAFglA/view' }],
          habilidades: [
            ['C3', 'H15, H16, H20'],
            ['C6', 'H39']
          ],
          hashtags: ['História', 'PrimeiraGuerra', 'Jornalismo']
        },
        {
          titulo: 'Seminário de Geopolítica: Vietnã',
          tag: 'Apresentação Digital',
          area: 'Geografia',
          texto: [
            'Seminário de geopolítica no qual escolhemos o Vietnã para detalhar dados econômicos, sociais e políticos. A apresentação abordou o contexto histórico do país, seus conflitos e sua posição atual no cenário global.'
          ],
          midia: [{ tipo: 'embed', src: 'https://www.canva.com/design/DAHBNAWmoK0/VES-Gmj2A5FO09XGHQq4ew/view?embed' }],
          links: [{ label: 'Ver no Canva', href: 'https://www.canva.com/design/DAHBNAWmoK0/VES-Gmj2A5FO09XGHQq4ew/view' }],
          habilidades: [
            ['C1', 'Compreender processos históricos, sociais e geográficos nos diversos aspectos da vida em sociedade.'],
            ['H1', 'Reconhecer o processo de formação do indivíduo nos aspectos históricos, geográficos, sociais e filosóficos.'],
            ['H2', 'Compreender o processo de socialização do indivíduo, considerando os princípios do pensamento e da lógica.'],
            ['H3', 'Compreender as relações de poder entre os diversos grupos sociais.'],
            ['H4', 'Compreender mudanças e permanências ao longo do tempo na constituição da sociedade.'],
            ['H5', 'Analisar criticamente os aspectos políticos, econômicos e sociais relacionados à formação da sociedade no Brasil e no mundo.']
          ],
          hashtags: ['Geografia', 'Geopolítica', 'Vietnã']
        },
        {
          titulo: 'Heranças Coloniais: Egito',
          tag: 'Análise Visual',
          area: 'História',
          texto: [
            'Atividade focada na exploração de países que sofreram processos de colonização. O objetivo foi identificar, através de fotografias, os impactos europeus e os aspectos culturais que resistiram ou foram moldados pela dominação imperialista no Egito.'
          ],
          midia: [{ tipo: 'embed', src: 'https://www.canva.com/design/DAHDv0aqe2Q/qqF5rjinXPqr2iL1sFkJzg/view?embed' }],
          links: [{ label: 'Ver no Canva', href: 'https://www.canva.com/design/DAHDv0aqe2Q/qqF5rjinXPqr2iL1sFkJzg/view' }],
          habilidades: [
            ['C2', 'H8, H10, H12']
          ],
          hashtags: ['História', 'Imperialismo', 'Egito']
        },
        {
          titulo: 'Relações Geopolíticas Pós WWI',
          tag: 'Relações nazi-soviéticas',
          area: 'História',
          texto: [
            'Realizamos uma apresentação em grupo sobre os acordos nazi-soviéticos após a Primeira Guerra Mundial, abordando o contexto histórico e os principais acontecimentos.',
            'Durante a atividade, explicamos os interesses envolvidos nos acordos e suas consequências para a Europa, utilizando informações históricas para apresentar o tema aos colegas.'
          ],
          midia: [{ tipo: 'embed', src: 'https://www.canva.com/design/DAHOP5NL5jo/S_62Ul4t2XCrOjSsJRl-Aw/view?embed' }],
          links: [{ label: 'Ver no Canva', href: 'https://canva.link/3eujw00u3c5xufw' }],
          habilidades: [
            ['C1', 'Compreender processos históricos, sociais e geográficos nos diversos aspectos da vida em sociedade.'],
            ['H3', 'Compreender as relações de poder entre os diversos grupos sociais.'],
            ['H4', 'Compreender mudanças e permanências ao longo do tempo na constituição da sociedade.'],
            ['H5', 'Analisar criticamente os aspectos políticos, econômicos e sociais relacionados à formação da sociedade no Brasil e no mundo.']
          ]
        },
        {
          titulo: 'Federalismo de Segregação',
          tag: 'Temas Contemporâneos',
          area: 'Sociologia',
          texto: [
            'Em grupo, escolhemos estudar o modelo de Federalismo de Segregação e suas características, relacionando-o a questões contemporâneas da sociedade.',
            'Analisamos como esse modelo poderia ser aplicado ao Brasil, discutindo seus possíveis impactos sociais, políticos e territoriais.'
          ],
          midia: [{ tipo: 'embed', src: 'https://www.canva.com/design/DAHRP_C5nzk/N63soxQkY6H3IaFw5g9Pcg/view?embed' }],
          links: [{ label: 'Ver no Canva', href: 'https://canva.link/au0pmnk9jukh6yh' }],
          habilidades: [
            ['H30', 'Analisar as lutas sociais e conquistas obtidas no que se refere às mudanças nas legislações ou nas políticas públicas.'],
            ['H39', 'Relacionar o papel das instituições sociais às soluções para problemas políticos, econômicos, sociais e ambientais no contexto da sociedade brasileira e do mundo.'],
            ['H40', 'Analisar o processo de formação das instituições sociais e políticas, compreendendo seu papel na sociedade.']
          ]
        },
        {
          titulo: 'O Apagamento da Alteridade',
          tag: 'O autoritarismo no cinema',
          area: 'Filosofia',
          texto: [
            'Realizamos uma atividade relacionando o filme Star Wars V com o conceito de autoritarismo, analisando o contexto político apresentado na obra.',
            'Comparamos situações e personagens do filme com características de regimes autoritários, identificando relações entre poder, controle e resistência.'
          ],
          midia: [{ tipo: 'embed', src: 'https://www.canva.com/design/DAHJvDG-svA/_XI82SvkidZ_D-hKSZ9DPA/view?embed' }],
          links: [{ label: 'Ver no Canva', href: 'https://canva.link/7kycg8gjvnd6r5c' }],
          habilidades: [
            ['H27', 'Analisar hipóteses e questões ambientais, sociais, econômicas, políticas e culturais, a partir de leituras e debates.'],
            ['H26', 'Comparar pontos de vista e ações sobre práticas do indivíduo ou grupo social em diferentes contextos.'],
            ['H22', 'Analisar, na perspectiva humana e social, as principais características e dinâmicas dos fluxos da sociedade.'],
            ['H10', 'Compreender as transformações no mundo do trabalho, geradas por mudanças na ordem econômica.']
          ]
        }
      ]
    },
    {
      id: 'natureza',
      nome: 'Natureza',
      desc: 'Física, química e biologia na prática.',
      atividades: [
        {
          titulo: 'Combustíveis e eficiência energética',
          tag: 'Pesquisa e Design',
          area: 'Química',
          texto: [
            'A atividade partiu da reflexão sobre o uso contínuo de combustíveis fósseis, mesmo diante de seus impactos ambientais. O foco do grupo foi a eficiência energética, analisando por que a gasolina ainda é amplamente utilizada em comparação ao etanol, considerando fatores como rendimento energético e viabilidade.',
            'O trabalho contribuiu para compreender que a escolha dos combustíveis envolve não apenas questões ambientais, mas também aspectos técnicos e econômicos.'
          ],
          midia: [{ tipo: 'embed', src: 'https://www.canva.com/design/DAHE8hNJVcQ/xuWPmiQMAqVdrltf6kQhvQ/view?embed' }],
          links: [{ label: 'Ver no Canva', href: 'https://www.canva.com/design/DAHE8hNJVcQ/view' }],
          habilidades: [
            ['C1', 'Compreender as ciências naturais e as tecnologias como construções humanas associadas à cultura dos povos e suas visões de mundo.'],
            ['H1', 'Interpretar informações apresentadas em diferentes linguagens usadas nas Ciências, como texto discursivo, gráficos, tabelas, relações matemáticas, diagramas ou representação simbólica.'],
            ['C2', 'Aplicar os conceitos fundamentais e estruturas procedimentais das Ciências da Natureza na explicação de fenômenos cotidianos, bem como dominar processos e práticas da investigação científica.'],
            ['H9', 'Explicar os conceitos de energia, matéria, vida e transformação para explicar fenômenos naturais e procedimentos tecnológicos.'],
            ['H11', 'Empregar procedimentos e práticas de observação, levantamento de hipótese, experimentação, coleta de dados e conclusões para resolução de problemas relacionados às Ciências da Natureza.']
          ],
          hashtags: ['Biologia', 'Química', 'Natureza']
        },
        {
          titulo: 'Tirinha: Evolução e Sociedade',
          tag: 'Análise de tirinha',
          area: 'Biologia',
          texto: [
            'A atividade analisou uma tirinha que aborda o Evolucionismo de forma crítica e bem-humorada. Através da inversão de papéis, a charge questiona a ideia de evolução como sinônimo de superioridade, destacando comportamentos humanos contraditórios.',
            'A interpretação permitiu refletir sobre como o humor pode ser usado para provocar críticas sociais e científicas.'
          ],
          midia: [{ tipo: 'img', src: 'imagens/tirinha_sobre_evolucao.jpg', alt: 'Tirinha sobre evolução' }],
          links: [{ label: 'Ver imagem completa', href: 'imagens/tirinha_sobre_evolucao.jpg' }],
          habilidades: [
            ['C3', 'Determinar os impactos das ações humanas nos ambientes, identificando suas causas e propondo soluções para a sua redução.'],
            ['H15', 'Comparar propostas de intervenção ambiental aplicando conhecimentos científicos e tecnológicos, observando os riscos e benefícios de sua implementação.'],
            ['H18', 'Identificar situações de risco ambiental na cidade onde reside.']
          ],
          hashtags: ['Biologia', 'Evolução', 'Arte']
        },
        {
          titulo: 'Registros do Caderno',
          tag: 'Eletrização por atrito',
          area: 'Física',
          texto: [
            'A atividade consistiu no registro de um experimento sobre eletrização por atrito, explorando conceitos de Eletrostática. O relatório descreveu o uso de materiais como PVC e alumínio para observar a atração entre corpos após a transferência de cargas elétricas.',
            'O registro contribuiu para compreender, na prática, como ocorre a interação entre cargas e a influência de diferentes materiais nesse processo.'
          ],
          midia: [{ tipo: 'img', src: 'imagens/caderno-eletrizacao.jpg', alt: 'Caderno com o registro do experimento' }],
          links: [{ label: 'Ver foto', href: 'imagens/caderno-eletrizacao.jpg' }],
          habilidades: [
            ['C1', 'Compreender as ciências naturais e as tecnologias como construções humanas associadas à cultura dos povos e suas visões de mundo.'],
            ['H1', 'Interpretar informações apresentadas em diferentes linguagens usadas nas Ciências, como texto discursivo, gráficos, tabelas, relações matemáticas, diagramas ou representação simbólica.'],
            ['C2', 'Aplicar os conceitos fundamentais e estruturas procedimentais das Ciências da Natureza na explicação de fenômenos cotidianos, bem como dominar processos e práticas da investigação científica.'],
            ['H7', 'Compreender os conceitos relacionados à Química nos seus diferentes ramos: Físico-química, Química orgânica e Química Geral.'],
            ['H9', 'Explicar os conceitos de energia, matéria, vida e transformação para explicar fenômenos naturais e procedimentos tecnológicos.'],
            ['H11', 'Empregar procedimentos e práticas de observação, levantamento de hipótese, experimentação, coleta de dados e conclusões para resolução de problemas relacionados às Ciências da Natureza.'],
            ['H12', 'Relacionar informações para construir modelos em ciência e tecnologia.']
          ],
          hashtags: ['Biologia', 'Física', 'Química']
        },
        {
          titulo: 'Saúde Pública',
          tag: 'Mural da turma',
          area: 'Biologia',
          texto: [
            'Realizamos, com toda a turma, um mural sobre saúde pública e os diferentes tipos de doenças.',
            'Pesquisamos informações sobre o tema e organizamos os conteúdos no mural, destacando prevenção, cuidados e impactos na sociedade.'
          ],
          midia: [{ tipo: 'img', src: 'imagens/Natureza-Mural.png', alt: 'Fotos do mural e da minha parte' }],
          links: [{ label: 'Ver imagem completa', href: 'imagens/Natureza-Mural.png' }],
          habilidades: [
            ['C2', 'Aplicar os conceitos fundamentais e estruturas procedimentais das Ciências da Natureza na explicação de fenômenos cotidianos, bem como dominar processos e práticas da investigação científica.'],
            ['H11', 'Empregar procedimentos e práticas de observação, coleta de dados e conclusões para resolução de problemas relacionados às Ciências da Natureza.'],
            ['C3', 'Determinar os impactos das ações humanas nos ambientes, identificando suas causas e propondo soluções para a sua redução.'],
            ['H15', 'Comparar propostas de intervenção ambiental aplicando conhecimentos científicos e tecnológicos, observando os riscos e benefícios de sua implementação.'],
            ['H18', 'Identificar situações de risco ambiental na cidade onde reside.'],
            ['C4', 'Compreender o funcionamento dos organismos vivos em geral e o ser humano em especial, considerando suas relações com o ambiente em que vivem, abordando aspectos físicos e socioculturais.'],
            ['H23', 'Formular propostas de alcance individual ou coletivo, utilizando como critérios a preservação e a promoção da saúde individual e coletiva.']
          ]
        },
        {
          titulo: 'Eletricidade e o Corpo Humano',
          tag: 'Cartilha Digital',
          area: 'Física',
          texto: [
            'Elaboramos, em dupla, uma cartilha sobre eletricidade e sua relação com o corpo humano, abordando seus efeitos e funcionamento.',
            'Apresentamos informações sobre os riscos da eletricidade e como a corrente elétrica pode afetar o organismo humano.'
          ],
          midia: [{ tipo: 'embed', src: 'https://www.canva.com/design/DAHS3oXSFdU/_fuD6-3GpvcNV3v2qnA7mQ/view?embed', ratio: '1.41' }],
          links: [{ label: 'Ver no Canva', href: 'https://canva.link/50nu9pzq5y15jyl' }],
          habilidades: [
            ['C1', 'Compreender as ciências naturais e as tecnologias como construções humanas associadas à cultura dos povos e suas visões de mundo.'],
            ['H3', 'Inferir significado de termos técnico-científicos em textos de instrumentação ou de divulgação científica.'],
            ['H4', 'Identificar, em textos, diagramas, gráficos, imagens e tabelas, informações relevantes para compreender um fenômeno ou conceito.'],
            ['C2', 'Aplicar os conceitos fundamentais e estruturas procedimentais das Ciências da Natureza na explicação de fenômenos cotidianos, bem como dominar processos e práticas da investigação científica.'],
            ['H12', 'Relacionar informações para construir modelos em ciência e tecnologia.'],
            ['C4', 'Compreender o funcionamento dos organismos vivos em geral e o ser humano em especial, considerando suas relações com o ambiente em que vivem, abordando aspectos físicos e socioculturais.'],
            ['H23', 'Formular propostas de alcance individual ou coletivo, utilizando como critérios a preservação e a promoção da saúde individual e coletiva.']
          ]
        },
        {
          titulo: 'Estequiometria Industrial',
          tag: 'Temas Contemporâneos',
          area: 'Química',
          texto: [
            'Realizamos uma apresentação sobre a produção de biodiesel, abordando seu processo de fabricação e sua importância para o Brasil.',
            'Também discutimos sua relação com a sustentabilidade e seu papel na busca por fontes de energia mais renováveis em escala mundial.'
          ],
          midia: [{ tipo: 'embed', src: 'https://www.canva.com/design/DAHNSroYS9w/qss_ZcUwbdT_1t5MJp44Zg/view?embed' }],
          links: [{ label: 'Ver no Canva', href: 'https://canva.link/2vzoomnug15scky' }],
          habilidades: [
            ['C2', 'Aplicar os conceitos fundamentais e estruturas procedimentais das Ciências da Natureza na explicação de fenômenos cotidianos, bem como dominar processos e práticas da investigação científica.'],
            ['H6', 'Compreender os conceitos relacionados à Física em seus diferentes ramos: Astronomia, Mecânica, Acústica, Óptica, Termologia, Calorimetria, Ondulatória, Eletricidade, Magnetismo e Física Moderna e Nuclear.'],
            ['H7', 'Compreender os conceitos relacionados à Química nos seus diferentes ramos: Físico-química, Química orgânica e Química Geral.'],
            ['H9', 'Explicar os conceitos de energia, matéria, vida e transformação para explicar fenômenos naturais e procedimentos tecnológicos.']
          ]
        },
        {
          titulo: 'Eletroquímica Aplicada',
          tag: 'Site + experimento',
          area: 'Química',
          texto: [
            'Desenvolvemos um site para apresentar os conceitos de eletroquímica e realizamos um experimento utilizando limões para gerar energia elétrica.',
            'Com o experimento, conseguimos acender um LED e observar, na prática, como uma reação química pode produzir corrente elétrica.'
          ],
          midia: [{ tipo: 'img', src: 'imagens/foto-site-natureza.png', alt: 'Site de eletroquímica' }],
          links: [{ label: 'Ir para o site', href: 'https://eletroquimica.netlify.app' }],
          habilidades: [
            ['C2', 'Aplicar os conceitos fundamentais e estruturas procedimentais das Ciências da Natureza na explicação de fenômenos cotidianos, bem como dominar processos e práticas da investigação científica.'],
            ['H7', 'Compreender os conceitos relacionados à Química nos seus diferentes ramos: Físico-química, Química orgânica e Química Geral.'],
            ['H9', 'Explicar os conceitos de energia, matéria, vida e transformação para explicar fenômenos naturais e procedimentos tecnológicos.'],
            ['H11', 'Empregar procedimentos e práticas de observação, levantamento de hipótese, experimentação, coleta de dados e conclusões para resolução de problemas relacionados às Ciências da Natureza.']
          ]
        }
      ]
    }
  ],

  tecnicas: [
    {
      id: 'banco-de-dados',
      nome: 'Banco de Dados',
      desc: 'Sistemas gerenciadores e linguagem SQL.',
      atividades: [GRAND_PRIX]
    },
    {
      id: 'desenvolvimento',
      nome: 'Desenvolvimento de Sistemas',
      desc: 'Ciclo completo de desenvolvimento de software.',
      atividades: [PROJETO_BP]
    },
    {
      id: 'modelagem',
      nome: 'Modelagem de Sistemas',
      desc: 'UML, diagramas e arquitetura de sistemas.',
      atividades: [GRAND_PRIX]
    },
    {
      id: 'implantacao',
      nome: 'Implantação de Sistemas',
      desc: 'Deploy, ambientes e entrega de software.',
      atividades: []
    },
    {
      id: 'manutencao',
      nome: 'Manutenção de Sistemas',
      desc: 'Correção, evolução e suporte de sistemas.',
      atividades: []
    },
    {
      id: 'aplicativos',
      nome: 'Programação de Aplicativos',
      desc: 'Desenvolvimento de aplicativos multiplataforma.',
      atividades: [PROJETO_BP]
    },
    {
      id: 'testes',
      nome: 'Testes de Sistemas',
      desc: 'QA, testes unitários e de integração.',
      atividades: []
    },
    {
      id: 'iot',
      nome: 'IoT',
      desc: 'Internet das Coisas, conectividade e automação.',
      atividades: [
        GRAND_PRIX,
        {
          titulo: 'Botão Liga/Desliga LED (Arduino)',
          tag: 'Prototipagem · IoT',
          texto: [
            'Foi realizada a montagem de um circuito com Arduino Uno, em que um botão controla o estado de um LED. A cada vez que o botão é pressionado, o LED alterna entre ligado e desligado (toggle), em vez de permanecer aceso somente enquanto o botão estiver pressionado.',
            'Primeiramente, o circuito foi simulado no Tinkercad para testar seu funcionamento. Depois, a montagem foi reproduzida fisicamente em uma protoboard, utilizando o botão como entrada digital e o LED, acompanhado de um resistor, como saída digital do Arduino. A montagem física permitiu confirmar, na prática, o funcionamento observado na simulação e compreender melhor a relação entre o circuito e a programação.'
          ],
          midia: [
            { tipo: 'img', src: 'imagens/iot-tinkercad.png', alt: 'Protótipo da montagem no Tinkercad' },
            { tipo: 'img', src: 'imagens/iot-fisico.jpeg', alt: 'Montagem física do circuito' }
          ],
          codigo: `int LED = 2; //LED conectado ao pino 2
int BOTAO = 3; //Botão conectado ao pino 3
int ESTADO_BOTAO = 0; //Variável para leitura do estado do Botão
int VAR = 0;
int VAR2 = 0;

void setup()
{
 pinMode(LED, OUTPUT);
 pinMode(BOTAO, INPUT);
}

void loop()
{
 VAR = digitalRead(BOTAO);

 if (VAR == 1 && VAR2 == 0)
 {
   ESTADO_BOTAO = 1 - ESTADO_BOTAO;
   delay(20);
 }
 VAR2 = VAR;

 if (ESTADO_BOTAO == 1) {
   digitalWrite(LED, 1);
 } else {
   digitalWrite(LED, 0);
 }
}`,
          habilidades: [
            ['H01', 'Reconhecer especificações técnicas e paradigmas de IoT.'],
            ['H02', 'Integrar dispositivos para coleta automática de dados.'],
            ['H03', 'Integrar dispositivos de comunicação de dados.'],
            ['H04', 'Reconhecer especificações de sensoriamento e parametrização.'],
            ['H05', 'Integrar projeto orientado a sensoriamento e controle.']
          ]
        }
      ]
    }
  ]
};
