const atividadeGrandPrix = `
  <div class="activity-block">
      <div class="activity-container">
          <div class="activity-left">
              <div class="doc-embed" style="position: relative; width: 100%; aspect-ratio: 16/9; overflow: hidden; border-radius: 12px; background-color: #000;">
                  <iframe 
                      loading="lazy" 
                      style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none;"
                      src="https://www.canva.com/design/DAHG7LgveB0/IZCExqde8d4f6hy9SgR-oA/view?embed" 
                      allowfullscreen="allowfullscreen" allow="fullscreen">
                  </iframe>
              </div>
          </div>
          <div class="activity-right">
              <div class="activity-info">
                  <h3 class="activity-title">Grand Prix - Desafio Vale</h3>
                  <div class="activity-tag">Projeto de Inovação</div>
                  <p class="activity-text">
                      Solução desenvolvida para o Grand Prix em parceria com a Vale, integrando dispositivos IoT 
                      para coleta de dados e estruturação em banco de dados para otimização industrial.
                  </p>
                  
                  <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
                      <a href="https://www.youtube.com/watch?v=2o7PK2cXa60" target="_blank" class="skills-btn" style="text-decoration: none; color: #ff4d4d; background: rgba(255, 77, 77, 0.08); border-color: rgba(255, 77, 77, 0.2);">
                          VER PITCH 🎬
                      </a>
                      <a href="https://www.youtube.com/watch?v=MSF-WI-C_6U" target="_blank" class="skills-btn" style="text-decoration: none;">
                          SISTEMA DE ROTEIRIZAÇÃO 📝
                      </a>
                  </div>

                  <div class="activity-skills">
                      <span>#GrandPrix</span><span>#Inovação</span><span>#Vale</span>
                  </div>
              </div>
              <div class="activity-footer">
                  <a href="https://www.canva.com/design/DAHG7LgveB0/IZCExqde8d4f6hy9SgR-oA/view" target="_blank" class="view-btn">Ver no Canva ↗</a>
              </div>
          </div>
      </div>
  </div>
`;

// --- 2. TRABALHO ESPECÍFICO (S.A DE MODELAGEM) - INVERTIDO ---
const atividadeModelagemSA = `
  <div class="activity-block">
      <div class="activity-container">
          <div class="activity-right">
              <div class="activity-info">
                  <h3 class="activity-title">S.A - Modelagem de Sistemas</h3>
                  <div class="activity-tag">Documentação Técnica</div>
                  <p class="activity-text">
                      Desenvolvimento da arquitetura e documentação completa do sistema para a Situação de Aprendizagem (S.A). 
                      O projeto abrange diagramas de casos de uso, diagramas de classe e fluxos de processos essenciais.
                  </p>
                  
                  <div class="activity-skills">
                      <span>#UML</span><span>#EngenhariaDeSoftware</span><span>#Modelagem</span>
                  </div>
              </div>
              <div class="activity-footer">
                  <a href="https://www.canva.com/design/DAHEiMlngjI/JHzOzP0tJghXZUUKE24G7g/view" target="_blank" class="view-btn">Ver no Canva ↗</a>
              </div>
          </div>
          
          <div class="activity-left">
              <div class="doc-embed" style="position: relative; width: 100%; aspect-ratio: 16/9; overflow: hidden; border-radius: 12px; background-color: #000;">
                  <iframe 
                      loading="lazy" 
                      style="position: absolute; width: 115%; height: 115%; top: -8%; left: 0; border: none;"
                      src="https://www.canva.com/design/DAHEiMlngjI/JHzOzP0tJghXZUUKE24G7g/view?embed" 
                      allowfullscreen="allowfullscreen" allow="fullscreen">
                  </iframe>
              </div>
          </div>
      </div>
  </div>
`;

//===============================================================================================================================================================================================================
//===============================================================================================================================================================================================================
//===============================================================================================================================================================================================================
//===============================================================================================================================================================================================================

const DADOS_3ANO = {
  "materias": [
    ["Banco de Dados", "Sistemas gerenciadores e linguagem SQL."],
    ["Desenvolvimento de Sistemas", "Ciclo completo de desenvolvimento de software."],
    ["Modelagem de Sistemas", "UML, diagramas e arquitetura de sistemas."],
    ["Implantação de Sistemas", "Deploy, ambientes e entrega de software."],
    ["Manutenção de Sistemas", "Correção, evolução e suporte de sistemas."],
    ["Prog. de Aplicativos", "Desenvolvimento de aplicativos multiplataforma."],
    ["Testes de Sistemas", "QA, testes unitários e de integração."],
    ["IoT", "Internet das Coisas, conectividade e automação."]
  ],
  "basicas": [
    ["Matemática III", "Geometria espacial, estatística e complexos."],
    ["Linguagens III", "Revisão para o ENEM e literatura contemporânea."],
    ["Humanas III", "Geopolítica e questões sociais contemporâneas."],
    ["Natureza III", "Eletromagnetismo, Físico-Química e Ecologia."]
  ],



  






  "trabalhos": {

"Prog. de Aplicativos":`

      <div class="activity-block" style="margin-top: 40px;">
          <div class="activity-container">
              <div class="activity-left">
                  <div class="doc-embed" style="aspect-ratio: 16/9; background: #fff; display: flex; align-items: center; justify-content: center;">
                      <img src="imagens/foto-bp-site.png" style="width: 100%; height: 100%; object-fit: contain;">
                  </div>
              </div>
              <div class="activity-right">
                  <div class="activity-info">
                      <h3 class="activity-title">projeto da BP - Promotora de crédito</h3>
                      <div class="activity-tag">Desenvolvimento de Backend</div>
                      <p class="activity-text">
                        Participamos de uma competição organizada pela BP, na qual liderei meu grupo a solucionar um problema baseado em uma situação real de uma promotora de créditos.
                            <br><br>
                        Desenvolvemos um backend para atender às necessidades apresentadas, aplicando conhecimentos de programação e banco de dados, além de trabalho em equipe e resolução de problemas.
                      </p>
                      <button class="skills-btn" onclick="toggleSkills(this)">Conceitos e Habilidades <span class="arrow-icon">↓</span></button>
                      <div class="skills-content">
                          <div class="skill-row"><b>H1</b><p>Reconhecer requisitos de qualidade, integridade, usabilidade e segurança da informação</p></div>
                          <div class="skill-row"><b>H4</b><p>Selecionar linguagem programação de acordo com os requisitos</p></div>
                          <div class="skill-row"><b>H6</b><p>Aplicar linguagem de programação por meio de apis, bibliotecas, frameworks na construção de rotinas de software </p></div>
                      </div>
                  </div>
                    <a href="https://github.com/fullzer4/RinhaSenai2026FullStack/tree/main/participants/maneuchos" target="_blank" class="skills-btn" style="text-decoration: none;">
                        VER PROJETO NO GITHUB 📝
                    </a>
              </div>
          </div>
      </div>


    `,

//===============================================================================================================================================================================================================
//===============================================================================================================================================================================================================
//===============================================================================================================================================================================================================
//===============================================================================================================================================================================================================


"Desenvolvimento de Sistemas":`

      <div class="activity-block" style="margin-top: 40px;">
          <div class="activity-container">
              <div class="activity-left">
                  <div class="doc-embed" style="aspect-ratio: 16/9; background: #fff; display: flex; align-items: center; justify-content: center;">
                      <img src="imagens/foto-bp-site.png" style="width: 100%; height: 100%; object-fit: contain;">
                  </div>
              </div>
              <div class="activity-right">
                  <div class="activity-info">
                      <h3 class="activity-title">projeto da BP - Promotora de crédito</h3>
                      <div class="activity-tag">Desenvolvimento de Backend</div>
                      <p class="activity-text">
                        Participamos de uma competição organizada pela BP, na qual liderei meu grupo a solucionar um problema baseado em uma situação real de uma promotora de créditos.
                            <br><br>
                        Desenvolvemos um backend para atender às necessidades apresentadas, aplicando conhecimentos de programação e banco de dados, além de trabalho em equipe e resolução de problemas.
                      </p>
                      <button class="skills-btn" onclick="toggleSkills(this)">Conceitos e Habilidades <span class="arrow-icon">↓</span></button>
                      <div class="skills-content">
                          <div class="skill-row"><b>H1</b><p>Reconhecer requisitos de qualidade, integridade, usabilidade e segurança da informação</p></div>
                          <div class="skill-row"><b>H4</b><p>Selecionar linguagem programação de acordo com os requisitos</p></div>
                          <div class="skill-row"><b>H6</b><p>Aplicar linguagem de programação por meio de apis, bibliotecas, frameworks na construção de rotinas de software </p></div>
                      </div>
                  </div>
                    <a href="https://github.com/fullzer4/RinhaSenai2026FullStack/tree/main/participants/maneuchos" target="_blank" class="skills-btn" style="text-decoration: none;">
                        VER PROJETO NO GITHUB 📝
                    </a>
              </div>
          </div>
      </div>


    `,

//===============================================================================================================================================================================================================
//===============================================================================================================================================================================================================
//===============================================================================================================================================================================================================
//===============================================================================================================================================================================================================



"Modelagem de Sistemas":`
      <div class="activity-block">
          <div class="activity-container">
              <div class="activity-left">
                  <div class="doc-embed" style="position: relative; width: 100%; aspect-ratio: 16/9; overflow: hidden; border-radius: 12px; background-color: #000;">
                      <iframe 
                          loading="lazy" 
                          style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none;"
                          src="https://www.canva.com/design/DAHG7LgveB0/IZCExqde8d4f6hy9SgR-oA/view?embed" 
                          allowfullscreen="allowfullscreen" allow="fullscreen">
                      </iframe>
                  </div>
              </div>
              <div class="activity-right">
                  <div class="activity-info">
                      <h3 class="activity-title">Grand Prix - Desafio Vale</h3>
                      <div class="activity-tag">Projeto de Inovação</div>
                      <p class="activity-text">
                          Solução desenvolvida para o Grand Prix em parceria com a Vale, integrando dispositivos IoT 
                          para coleta de dados e estruturação em banco de dados para otimização industrial.
                      </p>
                      
                      <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
                          <a href="https://www.youtube.com/watch?v=2o7PK2cXa60" target="_blank" class="skills-btn" style="text-decoration: none; color: #ff4d4d; background: rgba(255, 77, 77, 0.08); border-color: rgba(255, 77, 77, 0.2);">
                              VER PITCH 🎬
                          </a>
                          <a href="https://www.youtube.com/watch?v=MSF-WI-C_6U" target="_blank" class="skills-btn" style="text-decoration: none;">
                              SISTEMA DE ROTEIRIZAÇÃO 📝
                          </a>
                      </div>

                      <div class="activity-skills">
                          <span>#GrandPrix</span><span>#Inovação</span><span>#Vale</span>
                      </div>
                  </div>
                  <div class="activity-footer">
                      <a href="https://www.canva.com/design/DAHG7LgveB0/IZCExqde8d4f6hy9SgR-oA/view" target="_blank" class="view-btn">Ver no Canva ↗</a>
                  </div>
              </div>
          </div>
      </div>
    `,



//===============================================================================================================================================================================================================
//===============================================================================================================================================================================================================
//===============================================================================================================================================================================================================
//===============================================================================================================================================================================================================


    "IoT":`
      <div class="activity-block">
          <div class="activity-container">
              <div class="activity-left">
                  <div class="doc-embed" style="position: relative; width: 100%; aspect-ratio: 16/9; overflow: hidden; border-radius: 12px; background-color: #000;">
                      <iframe 
                          loading="lazy" 
                          style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none;"
                          src="https://www.canva.com/design/DAHG7LgveB0/IZCExqde8d4f6hy9SgR-oA/view?embed" 
                          allowfullscreen="allowfullscreen" allow="fullscreen">
                      </iframe>
                  </div>
              </div>
              <div class="activity-right">
                  <div class="activity-info">
                      <h3 class="activity-title">Grand Prix - Desafio Vale</h3>
                      <div class="activity-tag">Projeto de Inovação</div>
                      <p class="activity-text">
                          Solução desenvolvida para o Grand Prix em parceria com a Vale, integrando dispositivos IoT 
                          para coleta de dados e estruturação em banco de dados para otimização industrial.
                      </p>
                      
                      <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
                          <a href="https://www.youtube.com/watch?v=2o7PK2cXa60" target="_blank" class="skills-btn" style="text-decoration: none; color: #ff4d4d; background: rgba(255, 77, 77, 0.08); border-color: rgba(255, 77, 77, 0.2);">
                              VER PITCH 🎬
                          </a>
                          <a href="https://www.youtube.com/watch?v=MSF-WI-C_6U" target="_blank" class="skills-btn" style="text-decoration: none;">
                              SISTEMA DE ROTEIRIZAÇÃO 📝
                          </a>
                      </div>

                      <div class="activity-skills">
                          <span>#GrandPrix</span><span>#Inovação</span><span>#Vale</span>
                      </div>
                  </div>
                  <div class="activity-footer">
                      <a href="https://www.canva.com/design/DAHG7LgveB0/IZCExqde8d4f6hy9SgR-oA/view" target="_blank" class="view-btn">Ver no Canva ↗</a>
                  </div>
              </div>
          </div>
      </div>


      <div class="activity-block">
          <div class="activity-container">
              <div class="activity-right">
                  <div class="activity-info">
                      <h3 class="activity-title">Botão Liga/Desliga LED (Arduino)</h3>
                      <div class="activity-tag">Prototipagem · IoT</div>
                      <p class="activity-text">
                          Foi realizada a montagem de um circuito com Arduino Uno, em que um botão controla o estado de um LED. A cada vez que o botão é pressionado, o LED alterna entre ligado e desligado (toggle), em vez de permanecer aceso somente enquanto o botão estiver pressionado.
                          <br><br>
                          Primeiramente, o circuito foi simulado no Tinkercad para testar seu funcionamento. Depois, a montagem foi reproduzida fisicamente em uma protoboard, utilizando o botão como entrada digital e o LED, acompanhado de um resistor, como saída digital do Arduino. A montagem física permitiu confirmar, na prática, o funcionamento observado na simulação e compreender melhor a relação entre o circuito e a programação.
                      </p>

                      <button class="skills-btn" onclick="toggleSkills(this)">
                          Ver o código <span class="arrow-icon">↓</span>
                      </button>
                      <div class="skills-content code-content">
                          <pre style="margin: 0; font-family: 'Courier New', monospace; font-size: 12.5px; line-height: 1.6; color: #C8C8FF; white-space: pre; overflow-x: auto;"><code>int LED = 2; //LED conectado ao pino 2
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
}</code></pre>
                      </div>

                      <button class="skills-btn" onclick="toggleSkills(this)">
                          Conceitos e Habilidades <span class="arrow-icon">↓</span>
                      </button>
                      <div class="skills-content">
                          <div class="skill-row"><b>H01</b><p>Reconhecer especificações técnicas e paradigmas de IoT.</p></div>
                          <div class="skill-row"><b>H02</b><p>Integrar dispositivos para coleta automática de dados.</p></div>
                          <div class="skill-row"><b>H03</b><p>Integrar dispositivos de comunicação de dados.</p></div>
                          <div class="skill-row"><b>H04</b><p>Reconhecer especificações de sensoriamento e parametrização.</p></div>
                          <div class="skill-row"><b>H05</b><p>Integrar projeto orientado a sensoriamento e controle.</p></div>
                      </div>

                  </div>
              </div>
              <div class="activity-left">
                  <div class="doc-embed" style="width: 100%; aspect-ratio: 16/9; background: #fff; display: flex; align-items: center; justify-content: center;">
                      <img src="./imagens/iot-tinkercad.png" alt="Protótipo da montagem no Tinkercad" style="width: 100%; height: 100%; object-fit: contain; display: block;">
                  </div>
                  <div class="doc-embed" style="width: 100%; aspect-ratio: 16/9; background: #fff; display: flex; align-items: center; justify-content: center; margin-top: 16px;">
                      <img src="./imagens/iot-fisico.jpeg" alt="Montagem física do circuito" style="width: 100%; height: 100%; object-fit: contain; display: block;">
                  </div>
              </div>
          </div>
      </div>
    `,
//===============================================================================================================================================================================================================
//===============================================================================================================================================================================================================
//===============================================================================================================================================================================================================
//===============================================================================================================================================================================================================



    "Banco de Dados": `
      <div class="activity-block">
          <div class="activity-container">
              <div class="activity-left">
                  <div class="doc-embed" style="position: relative; width: 100%; aspect-ratio: 16/9; overflow: hidden; border-radius: 12px; background-color: #000;">
                      <iframe 
                          loading="lazy" 
                          style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none;"
                          src="https://www.canva.com/design/DAHG7LgveB0/IZCExqde8d4f6hy9SgR-oA/view?embed" 
                          allowfullscreen="allowfullscreen" allow="fullscreen">
                      </iframe>
                  </div>
              </div>
              <div class="activity-right">
                  <div class="activity-info">
                      <h3 class="activity-title">Grand Prix - Desafio Vale</h3>
                      <div class="activity-tag">Projeto de Inovação</div>
                      <p class="activity-text">
                          Solução desenvolvida para o Grand Prix em parceria com a Vale, integrando dispositivos IoT 
                          para coleta de dados e estruturação em banco de dados para otimização industrial.
                      </p>
                      
                      <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
                          <a href="https://www.youtube.com/watch?v=2o7PK2cXa60" target="_blank" class="skills-btn" style="text-decoration: none; color: #ff4d4d; background: rgba(255, 77, 77, 0.08); border-color: rgba(255, 77, 77, 0.2);">
                              VER PITCH 🎬
                          </a>
                          <a href="https://www.youtube.com/watch?v=MSF-WI-C_6U" target="_blank" class="skills-btn" style="text-decoration: none;">
                              SISTEMA DE ROTEIRIZAÇÃO 📝
                          </a>
                      </div>

                      <div class="activity-skills">
                          <span>#GrandPrix</span><span>#Inovação</span><span>#Vale</span>
                      </div>
                  </div>
                  <div class="activity-footer">
                      <a href="https://www.canva.com/design/DAHG7LgveB0/IZCExqde8d4f6hy9SgR-oA/view" target="_blank" class="view-btn">Ver no Canva ↗</a>
                  </div>
              </div>
          </div>
      </div>
    `,
//===============================================================================================================================================================================================================
//===============================================================================================================================================================================================================
//===============================================================================================================================================================================================================
//===============================================================================================================================================================================================================


  "Matemática III": `
      <div class="activity-block">
          <div class="activity-container">
              <div class="activity-left">
                  <div class="doc-embed">
                      <iframe 
                          src="https://docs.google.com/document/d/1EcDf4u_1tskI4e11GXKBimwpVRFgz2nsD7Uv5mjximE/preview" 
                          width="100%" 
                          height="500px" 
                          allow="autoplay">
                      </iframe>
                  </div>
              </div>
              <div class="activity-right">
                  <div class="activity-info">
                      <h3 class="activity-title">Análise do filme Quebrando a Banca</h3>
                      <div class="activity-tag">Atividade Prática</div>
                      <p class="activity-text">
A atividade consistiu na análise do filme Quebrando a Banca, identificando a aplicação de Análise Combinatória e Probabilidade em estratégias de contagem e previsão de resultados. A proposta evidenciou como esses conceitos matemáticos são utilizados em situações reais, como jogos e tomadas de decisão.
                        <br> <br>
O trabalho contribuiu para perceber a matemática de forma prática e estratégica, além do ambiente escolar.
                      </p>
                      
                      <button class="skills-btn" onclick="toggleSkills(this)">
                          Conceitos e Habilidades <span class="arrow-icon">↓</span>
                      </button>
                      <div class="skills-content">
                          <div class="skill-row"><b>C5</b><p>Aplicar o pensamento probabilístico para quantificar e fazer previsões em situações aplicadas a diferentes áreas do conhecimento e da vida cotidiana.</p></div>
                          <div class="skill-row"><b>H30</b><p>Identificar dados, regularidades e relações numa situação que envolva o raciocínio combinatório, utilizando os processos de contagem.</p></div>
                          <div class="skill-row"><b>H31</b><p>Reconhecer fenômenos e eventos (naturais, científicos, tecnológicos e/ou  sociais) de caráter aleatório, compreendendo o significado e a importância da  probabilidade como meio de prever resultados.</p></div>
                      </div>

                      <div class="activity-skills">
                          <span>#Matemática</span>
                          <span>#3Ano</span>
                      </div>
                  </div>
                  <div class="activity-footer">
                      <a href="https://docs.google.com/document/d/1EcDf4u_1tskI4e11GXKBimwpVRFgz2nsD7Uv5mjximE/edit?usp=sharing" target="_blank" class="view-btn">
                          Abrir original ↗
                      </a>
                  </div>
              </div>
          </div>
      </div>

      <div class="activity-block" style="margin-top: 40px;">
          <div class="activity-container">
              <div class="activity-right">
                  <div class="activity-info">
                      <h3 class="activity-title">Jogo War Star Wars</h3>
                      <div class="activity-tag">Apresentação Digital</div>
                      <p class="activity-text">
                          Nesta apresentação, exploramos a matemática por trás do jogo War, analisando as probabilidades nos lances de dados, estratégias de dominação de territórios e a tomada de decisão com base na estatística.
                      </p>
                      
                      <button class="skills-btn" onclick="toggleSkills(this)">
                          Conceitos e Habilidades <span class="arrow-icon">↓</span>
                      </button>
                      <div class="skills-content">
                          <div class="skill-row"><b>C5</b><p>Aplicar o pensamento probabilístico para quantificar e fazer previsões em situações aplicadas a diferentes áreas do conhecimento e da vida cotidiana.</p></div>
                          <div class="skill-row"><b>H30</b><p>Identificar dados, regularidades e relações numa situação que envolva o raciocínio combinatório, utilizando os processos de contagem.</p></div>
                          <div class="skill-row"><b>H31</b><p>Reconhecer fenômenos e eventos (naturais, científicos, tecnológicos e/ou  sociais) de caráter aleatório, compreendendo o significado e a importância da  probabilidade como meio de prever resultados.</p></div>
                      </div>

                      <div class="activity-skills">
                          <span>#Matemática</span>
                          <span>#Estatística</span>
                          <span>#Jogos</span>
                      </div>
                  </div>
                  <div class="activity-footer">
                      <a href="https://www.canva.com/design/DAHHq2I-uX4/P__BXht6Fycf4WfJD792Vg/view" target="_blank" class="view-btn">Ver no Canva ↗</a>
                  </div>
              </div>
              <div class="activity-left">
                  <div class="doc-embed" style="position: relative; width: 100%; aspect-ratio: 16/9; overflow: hidden; border-radius: 12px;">
                      <iframe 
                          loading="lazy" 
                          style="position: absolute; width: 100%; height: 115%; top: -8%; left: 0; border: none;"
                          src="https://www.canva.com/design/DAHHq2I-uX4/P__BXht6Fycf4WfJD792Vg/view?embed" 
                          allowfullscreen="allowfullscreen" allow="fullscreen">
                      </iframe>
                  </div>
              </div>
          </div>
      </div>



            <div class="activity-block" style="margin-top: 40px;">
          <div class="activity-container">
              <div class="activity-left">
                  <div style="position: relative; width: 100%; height: 0; padding-top: 55.8342%;
                  padding-bottom: 0; box-shadow: 0 2px 8px 0 rgba(63,69,81,0.16); margin-top: 1.6em; margin-bottom: 0.9em; overflow: hidden;
                  border-radius: 8px; will-change: transform;">
                    <iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none; padding: 0;margin: 0;"
                      src="https://www.canva.com/design/DAHNoBGaAek/cz6AzZsSSKXPUffwrXp9aA/view?embed" allowfullscreen="allowfullscreen" allow="fullscreen">
                    </iframe>
                  </div>
                </div>
              <div class="activity-right">
                  <div class="activity-info">
                      <h3 class="activity-title"> Apresentação Estatísticao</h3>
                      <div class="activity-tag">Apresentação digital</div>
                      <p class="activity-text">
                          Realizamos uma pesquisa com estudantes do SESI para descobrir quanto tempo eles passam nas redes sociais diariamente.
                          <br><br>
                          Depois, utilizamos a Estatística para organizar os dados em tabelas e gráficos, facilitando a análise e comparação dos resultados.
                      </p>
                      <button class="skills-btn" onclick="toggleSkills(this)">Conceitos e Habilidades <span class="arrow-icon">↓</span></button>
                      <div class="skills-content">
                          <div class="skill-row"><b>C4</b><p> Analisar e investigar  dados e informações de  natureza científica e  social, articulando diferentes áreas do conhecimento, compreendendo representações gráficas  e uso de modelos matemáticos, realizando  inferências, previsões e  tendências, para tomadas de decisão.</p></div>
                          <div class="skill-row"><b>H27</b><p>Compreender informações estatísticas provenientes de naturezas distintas  (social, econômica, política ou científica) e formular juízos com base nessas  informações.</p></div>
                          <div class="skill-row"><b>H28</b><p>Calcular medidas de tendência central e de dispersão de um conjunto de  dados para aplicá-las e analisá-las em situações diversas no contexto das  ciências, das tecnologias, das atividades pessoais e profissionais.</p></div>
                          <div class="skill-row"><b>H29</b><p>Construir tabelas e gráficos com recursos tecnológicos que permitam  simplificar cálculos, facilitar a leitura e a compreensão das informações, para  análise da realidade.</p></div>
                      </div>
                  </div>
                  <div class="activity-footer">
                      <a href="https://www.canva.com/design/DAHNoBGaAek/mKKrrUiZAC3EGOfkH6T3xg/view" target="_blank" class="view-btn">Ver no Canva ↗</a>
                  </div>
              </div>
          </div>
  `,
//===============================================================================================================================================================================================================
//===============================================================================================================================================================================================================
//===============================================================================================================================================================================================================
//===============================================================================================================================================================================================================
//===============================================================================================================================================================================================================

    "Linguagens III": `
      <div class="activity-block">
          <div class="activity-container">
              <div class="activity-left">
                  <div class="doc-embed" style="aspect-ratio: 16/9; width: 100%;">
                      <iframe 
                          width="100%" height="100%" 
                          src="https://www.youtube.com/embed/aIVkBBRHdQI" 
                          title="YouTube video player" frameborder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                          allowfullscreen>
                      </iframe>
                  </div>
              </div>
              <div class="activity-right">
                  <div class="activity-info">
                      <h3 class="activity-title">Trabalho de Literatura</h3>
                      <div class="activity-tag">Produção Audiovisual</div>
                      <p class="activity-text">
                          A atividade consistiu na produção de um vídeo sobre ética e desconstrução a partir da obra A Paixão segundo G.H., de Clarice Lispector. A proposta envolveu analisar como a experiência da personagem rompe com padrões morais tradicionais, trazendo uma reflexão sobre limites éticos e liberdade individual.
                            <br> <br>
O trabalho permitiu compreender como a literatura pode provocar questionamentos profundos, indo além da interpretação comum e explorando aspectos filosóficos presentes na narrativa.
                      </p>

                      <button class="skills-btn" onclick="toggleSkills(this)">
                          Conceitos e Habilidades <span class="arrow-icon">↓</span>
                      </button>
                      <div class="skills-content">
                          <div class="skill-row"><b>H22</b><p>Produzir textos técnicos de acordo com uma estrutura estabelecida. </p></div>
                          <div class="skill-row"><b>H4</b><p>Reconhecer a pluralidade de manifestações artísticas e culturais como forma de integração entre pessoas e entre diferentes grupos sociais e étnicos. </p></div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <div class="activity-block" style="margin-top: 40px;">
          <div class="activity-container">
              <div class="activity-right">
                  <div class="activity-info">
                      <h3 class="activity-title">Realismo no Brasil</h3>
                      <div class="activity-tag">Apresentação Digital</div>
                      <p class="activity-text">
A atividade consistiu na criação de um jogo sobre o Realismo, acompanhado de uma apresentação comparativa com o Romantismo. A proposta destacou as diferenças entre os movimentos, como o olhar crítico e objetivo do Realismo em contraste com a idealização romântica.
                        <br> <br>
O trabalho facilitou a compreensão de como cada escola literária interpreta a realidade de maneira distinta.
                      </p>

                      <button class="skills-btn" onclick="toggleSkills(this)">
                          Conceitos e Habilidades <span class="arrow-icon">↓</span>
                      </button>
                      <div class="skills-content">
                          <div class="skill-row"><b>H15</b><p>Produzir trabalhos individuais e coletivos, explorando materiais e técnicas ligados ao universo das composições artísticas e de práticas corporais.</p></div>
                      </div>
                  </div>
              </div>
              <div class="activity-left">
                  <div class="doc-embed" style="position: relative; width: 100%; aspect-ratio: 16/9; overflow: hidden; border-radius: 12px;">
                      <iframe 
                          loading="lazy" 
                          style="position: absolute; width: 100%; height: 115%; top: -8%; left: 0; border: none;"
                          src="https://www.canva.com/design/DAHB31eK4C0/IxbRqi24bWV-9AUkbmof2Q/view?embed" 
                          allowfullscreen="allowfullscreen" allow="fullscreen">
                      </iframe>
                  </div>
              </div>
          </div>
      </div>

      <div class="activity-block">
          <div class="activity-container">
              <div class="activity-left">
                <div style="position: relative; width: 100%; height: 0; padding-top: 56.2500%;
                padding-bottom: 0; box-shadow: 0 2px 8px 0 rgba(63,69,81,0.16); margin-top: 1.6em; margin-bottom: 0.9em; overflow: hidden;
                border-radius: 8px; will-change: transform;">
                  <iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none; padding: 0;margin: 0;"
                    src="https://www.canva.com/design/DAHLRa7V2h8/b5U1Jj4B9dMXMyhaVxdKtw/watch?embed" allowfullscreen="allowfullscreen" allow="fullscreen">
                  </iframe>
                </div>
                </div>
                <div class="activity-right">
                  <div class="activity-info">
                      <h3 class="activity-title">Videomanifesto</h3>
                      <div class="activity-tag">A Silenciosa Ruína da Elegância Contemporânea</div>
                      <p class="activity-text">
                          Nessa atividade, eu e meu grupo tivemos escolher um tema para fazer um vídeoo no estilo manifesto, nós escolhemos falar sobre o decaimento da moda
                          <br> <br>
                          Falamos de como o consumismo e a produção em massa fez as roupas perderem o charme, comparamos por exemplo, com a moda víntage, como vestidos e acessórios mudaram
                      </p>
                      
                      <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
                          <a href="https://youtu.be/XpLI45ryUJo" target="_blank" class="skills-btn" style="text-decoration: none; color: #ff4d4d; background: rgba(255, 77, 77, 0.08); border-color: rgba(255, 77, 77, 0.2);">
                              VER VÍDEO 🎬
                          </a>
                      </div>

                      <button class="skills-btn" onclick="toggleSkills(this)">
                          Conceitos e Habilidades <span class="arrow-icon">↓</span>
                      </button>
                      <div class="skills-content">
                          <div class="skill-row"><b>H3</b><p>Identificar o tema principal, os subtemas e finalidades dos textos; H24 - Produzir textos escritos de domínio acadêmico e educacional.</p></div>
                      </div>
                  </div>
              </div>
          </div>
      </div>




      <div class="activity-block" style="margin-top: 40px;">
          <div class="activity-container">

              <div class="activity-right">
                  <div class="activity-info">
                      <h3 class="activity-title">Nota redação</h3>
                      <div class="activity-tag">plataforma RED1000</div>
                      <p class="activity-text">
                        Uma redação sobre o tema "Os perigos do autodiagnóstico de transtornos mentais nas redes sociais no Brasil"
                            <br> <br>
                        Realizar essa redação me ajudou muito com as dicas da prof. Natali a melhorar na parte da conclusão
                      </p>

                      <button class="skills-btn" onclick="toggleSkills(this)">
                          Conceitos e Habilidades <span class="arrow-icon">↓</span>
                      </button>
                      <div class="skills-content">
                          <div class="skill-row"><b>H22</b><p>Produzir textos técnicos de acordo com uma estrutura estabelecida.</p></div>
                      </div>
                  </div>
              </div>

              <div class="activity-left">
                  <div class="doc-embed" style="width: 100%; aspect-ratio: 16/9; border-radius: 12px; overflow: hidden; background: #fff; display: flex; align-items: center; justify-content: center;">
                      <img src="./imagens/os-perigos-da-au.png" alt="Print da redação, nota 760" style="width: 100%; height: 100%; object-fit: contain; display: block;">
                  </div>
              </div>
          </div>
      </div>
    
      

      <div class="activity-block">
          <div class="activity-container">
              <div class="activity-left">
                  <div class="doc-embed">
                      <iframe 
                          src="https://docs.google.com/document/d/1YJ4BYgtgcY8ZsDcVTCHs-DOE0R6t8tKqTef5zFQbtDw/preview" 
                          width="100%" 
                          height="300px" 
                          allow="autoplay">
                      </iframe>
                  </div>
              </div>
              <div class="activity-right">
                  <div class="activity-info">
                      <h3 class="activity-title">Meus gostos</h3>
                      <div class="activity-tag">O que eu gosto em inglês</div>
                      <p class="activity-text">
A atividade consistiu em escrever as coisas favoritas de diferentes áreas artísticas, como banda, filem...
<br> <br>
Sempre é bom praticar inglês, atividades como essa faz não perder o costume da habilidade de se comunicar em outra língua
                      </p>
                      
                      <button class="skills-btn" onclick="toggleSkills(this)">
                          Conceitos e Habilidades <span class="arrow-icon">↓</span>
                      </button>
                      <div class="skills-content">
                          <div class="skill-row"><b>H25</b><p> Interpretar textos em Língua Estrangeira Moderna (Inglês)</p></div>
                      </div>
                  </div>
                  <div class="activity-footer">
                      <a href="https://docs.google.com/document/d/1YJ4BYgtgcY8ZsDcVTCHs-DOE0R6t8tKqTef5zFQbtDw/edit?usp=sharing" target="_blank" class="view-btn">
                          Abrir documento ↗
                      </a>
                  </div>
              </div>
          </div>
      </div>      
  `,
//===============================================================================================================================================================================================================
//===============================================================================================================================================================================================================
//===============================================================================================================================================================================================================
//===============================================================================================================================================================================================================
//===============================================================================================================================================================================================================

 "Natureza III": `
      <div class="activity-block">
          <div class="activity-container">
              <div class="activity-right">
                  <div class="activity-info">
                      <h3 class="activity-title">Ciências da Natureza</h3>
                      <div class="activity-tag">Pesquisa e Design</div>
                      <p class="activity-text">
                          A atividade partiu da reflexão sobre o uso contínuo de combustíveis fósseis, mesmo diante de seus impactos ambientais. O foco do grupo foi a eficiência energética, analisando por que a gasolina ainda é amplamente utilizada em comparação ao etanol, considerando fatores como rendimento energético e viabilidade.
                            <br> <br>
                          O trabalho contribuiu para compreender que a escolha dos combustíveis envolve não apenas questões ambientais, mas também aspectos técnicos e econômicos.
                      </p>
                      
                      <button class="skills-btn" onclick="toggleSkills(this)">
                          Conceitos e Habilidades <span class="arrow-icon">↓</span>
                      </button>
                      <div class="skills-content">
                          <div class="skill-row"><b>C1</b><p>Compreender as ciências naturais e as tecnologias como construções humanas associadas à cultura dos povos e suas visões de mundo.</p></div>
                          <div class="skill-row"><b>H1</b><p>Interpretar informações apresentadas em diferentes linguagens usadas nas Ciências, como texto discursivo, gráficos, tabelas, relações matemáticas, diagramas ou representação simbólica.</p></div>
                          <div class="skill-row"><b>C2</b><p>Aplicar os conceitos fundamentais e estruturas procedimentais das Ciências da Natureza na explicação de fenômenos cotidianos, bem como dominar processos e práticas da investigação científica.</p></div>
                          <div class="skill-row"><b>H9</b><p>Explicar os conceitos de energia, matéria, vida e transformação para explicar fenômenos naturais e procedimentos tecnológicos.</p></div>
                          <div class="skill-row"><b>H11</b><p>Empregar procedimentos e práticas de observação, levantamento de hipótese, experimentação, coleta de dados e conclusões para resolução de problemas relacionados às Ciências da Natureza.</p></div>
                      </div>

                      <div class="activity-skills">
                          <span>#Biologia</span><span>#Química</span><span>#Natureza</span>
                      </div>
                  </div>
                  <div class="activity-footer">
                      <a href="https://www.canva.com/design/DAHE8hNJVcQ/view" target="_blank" class="view-btn">Ver no Canva ↗</a>
                  </div>
              </div>
              <div class="activity-left">
                  <div class="doc-embed" style="position: relative; width: 100%; aspect-ratio: 16/9; overflow: hidden; border-radius: 12px;">
                      <iframe loading="lazy" style="position: absolute; width: 100%; height: 115%; top: -8%; left: 0; border: none;" src="https://www.canva.com/design/DAHE8hNJVcQ/xuWPmiQMAqVdrltf6kQhvQ/view?embed" allowfullscreen="allowfullscreen" allow="fullscreen"></iframe>
                  </div>
              </div>
          </div>
      </div>

      <div class="activity-block" style="margin-top: 40px;">
          <div class="activity-container">
              <div class="activity-left">
                  <div class="doc-embed" style="width: 100%; aspect-ratio: 16/9; border-radius: 12px; overflow: hidden; background: #fff; display: flex; align-items: center; justify-content: center;">
                      <img src="./imagens/tirinha_sobre_evolucao.jpg" alt="Tirinha sobre evolução" style="width: 100%; height: 100%; object-fit: contain; display: block;">
                  </div>
              </div>
              <div class="activity-right">
                  <div class="activity-info">
                      <h3 class="activity-title">Tirinha: Evolução e Sociedade</h3>
                      <div class="activity-tag">Biologia</div>
                      <p class="activity-text">
                        A atividade analisou uma tirinha que aborda o Evolucionismo de forma crítica e bem-humorada. Através da inversão de papéis, a charge questiona a ideia de evolução como sinônimo de superioridade, destacando comportamentos humanos contraditórios.
                            <br> <br>
                        A interpretação permitiu refletir sobre como o humor pode ser usado para provocar críticas sociais e científicas.
                      </p>

                      <button class="skills-btn" onclick="toggleSkills(this)">
                          Conceitos e Habilidades <span class="arrow-icon">↓</span>
                      </button>
                      <div class="skills-content">
                          <div class="skill-row"><b>C3</b><p>Determinar os impactos das ações humanas nos ambientes, identificando suas causas e propondo soluções para a sua redução.</p></div>
                          <div class="skill-row"><b>H15</b><p>Comparar propostas de intervenção ambiental aplicando conhecimentos científicos e tecnológicos, observando os riscos e benefícios de sua implementação.</p></div>
                          <div class="skill-row"><b>H18</b><p>Identificar situações de risco ambiental na cidade onde reside.</p></div>
                      </div>

                      <div class="activity-skills">
                          <span>#Biologia</span><span>#Evolução</span><span>#Arte</span>
                      </div>
                  </div>
                  <div class="activity-footer">
                      <a href="./imagens/tirinha_sobre_evolucao.jpg" target="_blank" class="view-btn">Ver Imagem Completa ↗</a>
                  </div>
              </div>
          </div>
      </div>

      <div class="activity-block" style="margin-top: 40px;">
          <div class="activity-container">
              <div class="activity-right">
                  <div class="activity-info">
                      <h3 class="activity-title">Registros do Caderno</h3>
                      <p class="activity-text">
                      A atividade consistiu no registro de um experimento sobre eletrização por atrito, explorando conceitos de Eletrostática. O relatório descreveu o uso de materiais como PVC e alumínio para observar a atração entre corpos após a transferência de cargas elétricas.
                        <br> <br>
                      O registro contribuiu para compreender, na prática, como ocorre a interação entre cargas e a influência de diferentes materiais nesse processo.
                      </p>
                      <button class="skills-btn" onclick="toggleSkills(this)">Conceitos e Habilidades <span class="arrow-icon">↓</span></button>
                      <div class="skills-content">
                          <div class="skill-row"><b>C1</b><p>Compreender as ciências naturais e as tecnologias como construções humanas associadas à cultura dos povos e suas visões de mundo.</p></div>
                          <div class="skill-row"><b>H1</b><p>Interpretar informações apresentadas em diferentes linguagens usadas nas Ciências, como texto discursivo, gráficos, tabelas, relações matemáticas, diagramas ou representação simbólica.</p></div>
                          <div class="skill-row"><b>C2</b><p>Aplicar os conceitos fundamentais e estruturas procedimentais das Ciências da Natureza na explicação de fenômenos cotidianos, bem como dominar processos e práticas da investigação científica.</p></div>
                          <div class="skill-row"><b>H7</b><p>Compreender os conceitos relacionados à Química nos seus diferentes ramos: Fisico-química, Química orgânica e Química Geral.</p></div>
                          <div class="skill-row"><b>H9</b><p>Explicar os conceitos de energia, matéria, vida e transformação para explicar fenômenos naturais e procedimentos tecnológicos.</p></div>
                          <div class="skill-row"><b>H11</b><p> Empregar procedimentos e práticas de observação, levantamento de hipótese, experimentação, coleta de dados e conclusões para resolução de problemas relacionados às Ciências da Natureza.</p></div>
                          <div class="skill-row"><b>H12</b><p> Relacionar informações para construir modelos em ciência e tecnologia</p></div>
                      </div>

                      <div class="activity-skills">
                          <span>#Biologia</span><span>#Física</span><span>#Química</span>
                      </div>
                  </div>
                  <div class="activity-footer"><a href="imagens/caderno-eletrizacao.jpg" target="_blank" class="view-btn">Ver Foto ↗</a></div>
              </div>
              <div class="activity-left">
                  <div class="doc-embed" style="aspect-ratio: 16/9; background: #fff; display: flex; align-items: center; justify-content: center;">
                      <img src="imagens/caderno-eletrizacao.jpg" style="width: 100%; height: 100%; object-fit: contain;">
                  </div>
              </div>
          </div>
      </div>






      <div class="activity-block" style="margin-top: 40px;">
          <div class="activity-container">
              <div class="activity-left">
                  <div class="doc-embed" style="width: 100%; aspect-ratio: 16/9; border-radius: 12px; overflow: hidden; background: #fff; display: flex; align-items: center; justify-content: center;">
                      <img src="./imagens/Natureza-Mural.png" alt="Fotos do Mural e da minha parte" style="width: 100%; height: 100%; object-fit: contain; display: block;">
                  </div>
              </div>
              <div class="activity-right">
                  <div class="activity-info">
                      <h3 class="activity-title">Saúde Pública</h3>
                      <div class="activity-tag">mural da turma.</div>
                      <p class="activity-text">
                        Realizamos, com toda a turma, um mural sobre saúde pública e os diferentes tipos de doenças.
                            <br><br>
                        Pesquisamos informações sobre o tema e organizamos os conteúdos no mural, destacando prevenção, cuidados e impactos na sociedade.
                      </p>

                      <button class="skills-btn" onclick="toggleSkills(this)">
                          Conceitos e Habilidades <span class="arrow-icon">↓</span>
                      </button>
                      <div class="skills-content">
                          <div class="skill-row"><b>C2 </b><p>Aplicar os conceitos fundamentais e estruturas procedimentais das Ciências da Natureza na explicação de fenômenos cotidianos, bem como dominar processos e práticas da  investigação científica.</p></div>
                          <div class="skill-row"><b>H11 </b><p> Empregar procedimentos e práticas de observação, coleta de dados e conclusões para resolução de problemas relacionados às Ciências da Natureza.</p></div>
                          <div class="skill-row"><b>C3 </b><p>Determinar os impactos das ações  humanas nos ambientes,  identificando suas causas e propondo soluções para a sua  redução.</p></div>
                          <div class="skill-row"><b>H15  </b><p>Comparar propostas de intervenção ambiental aplicando conhecimentos científicos e tecnológicos, observando os riscos e benefícios de sua implementação.</p></div>
                          <div class="skill-row"><b>H18  </b><p>Identificar situações de risco ambiental na cidade onde reside.</p></div>
                          <div class="skill-row"><b>C4   </b><p>Compreender o funcionamento dos  organismos vivos em  geral e o ser humano em  especial, considerando  suas relações com o  ambiente em que vivem,  abordando aspectos  físicos e socioculturais.</p></div>
                          <div class="skill-row"><b>H23   </b><p>Formular propostas de alcance individual ou coletivo, utilizando como critérios a preservação e a promoção da saúde individual e coletiva.</p></div>
                      </div>

                  </div>
                  <div class="activity-footer">
                      <a href="./imagens/Natureza-Mural.png" target="_blank" class="view-btn">Ver Imagem Completa ↗</a>
                  </div>
              </div>
          </div>
      </div>







    <div class="activity-block" style="margin-top: 40px;">
          <div class="activity-container">
              <div class="activity-right">
                  <div class="activity-info">
                      <h3 class="activity-title">Eletrecidade e o Corpo Humano</h3>
                      <div class="activity-tag">Cartilha Digital</div>
                      <p class="activity-text">
                        Elaboramos, em dupla, uma cartilha sobre eletricidade e sua relação com o corpo humano, abordando seus efeitos e funcionamento.
                            <br><br>
                        Apresentamos informações sobre os riscos da eletricidade e como a corrente elétrica pode afetar o organismo humano.
                      </p>
                      <button class="skills-btn" onclick="toggleSkills(this)">Conceitos e Habilidades <span class="arrow-icon">↓</span></button>
                      <div class="skills-content">
                          <div class="skill-row"><b>C1  </b><p>Compreender as ciências naturais e as tecnologias como construções humanas associadas à cultura dos povos e suas visões de mundo.</p></div>
                          <div class="skill-row"><b>H3  </b><p> Inferir significado de termos técnico-científicos em textos de instrumentação ou de divulgação científica. </p></div>
                          <div class="skill-row"><b>H4 </b><p>Identificar, em textos, diagramas, gráficos, imagens e tabelas, informações relevantes para compreender um fenômeno ou conceito</p></div>
                          <div class="skill-row"><b>C2  </b><p>Aplicar os conceitos fundamentais e estruturas procedimentais das Ciências da Natureza na explicação de fenômenos cotidianos, bem como dominar processos e práticas da investigação científica.</p></div>
                          <div class="skill-row"><b>H12  </b><p>Relacionar informações para construir modelos em ciência e tecnologia</p></div>
                          <div class="skill-row"><b>C4  </b><p>Compreender o funcionamento dos organismos vivos em geral e o ser humano em especial, considerando suas relações com o ambiente em que vivem, abordando aspectos físicos e socioculturais.</p></div>
                          <div class="skill-row"><b>H23  </b><p>Formular propostas de alcance individual ou coletivo, utilizando como critérios a preservação e a promoção da saúde individual e coletiva. </p></div>
                      </div>
                  </div>
                  <div class="activity-footer">
                      <a href="https://canva.link/50nu9pzq5y15jyl" target="_blank" class="view-btn">Ver no Canva ↗</a>
                  </div>
              </div>
              <div class="activity-left">
                <div style="position: relative; width: 100%; height: 0; padding-top: 70.8919%;
                padding-bottom: 0; box-shadow: 0 2px 8px 0 rgba(63,69,81,0.16); margin-top: 1.6em; margin-bottom: 0.9em; overflow: hidden;
                    border-radius: 8px; will-change: transform;">
                    <iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none; padding: 0;margin: 0;"
                        src="https://www.canva.com/design/DAHS3oXSFdU/_fuD6-3GpvcNV3v2qnA7mQ/view?embed" allowfullscreen="allowfullscreen" allow="fullscreen">
                    </iframe>
                </div>
          </div>
      </div>
    </div>







      <div class="activity-block" style="margin-top: 40px;">
          <div class="activity-container">
              <div class="activity-left">
                <div style="position: relative; width: 100%; height: 0; padding-top: 56.2500%;
                padding-bottom: 0; box-shadow: 0 2px 8px 0 rgba(63,69,81,0.16); margin-top: 1.6em; margin-bottom: 0.9em; overflow: hidden;
                border-radius: 8px; will-change: transform;">
                    <iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none; padding: 0;margin: 0;"
                    src="https://www.canva.com/design/DAHNSroYS9w/qss_ZcUwbdT_1t5MJp44Zg/view?embed" allowfullscreen="allowfullscreen" allow="fullscreen">
                    </iframe>
                </div>

              </div>
              <div class="activity-right">
                  <div class="activity-info">
                      <h3 class="activity-title">Estequiometria Industrial</h3>
                      <div class="activity-tag">Temas Comtemporâneos</div>
                      <p class="activity-text">
                        Realizamos uma apresentação sobre a produção de biodiesel, abordando seu processo de fabricação e sua importância para o Brasil.
                            <br><br>
                        Também discutimos sua relação com a sustentabilidade e seu papel na busca por fontes de energia mais renováveis em escala mundial.
                      </p>
                      <button class="skills-btn" onclick="toggleSkills(this)">Conceitos e Habilidades <span class="arrow-icon">↓</span></button>
                      <div class="skills-content">
                          <div class="skill-row"><b>C2</b><p>Aplicar os conceitos fundamentais e estruturas procedimentais das Ciências da Natureza na explicação de fenômenos cotidianos, bem como dominar processos e práticas da investigação científica.</p></div>
                        <div class="skill-row"><b>H6</b><p> Compreender os conceitos relacionados à Física em seus diferentes ramos: Astronomia, Mecânica, Acústica, Óptica, Termologia, Calorimetria, Ondulatória, Eletricidade, Magnetismo e Física Moderna e Nuclear.</p></div>
                          <div class="skill-row"><b>H7</b><p>Compreender os conceitos relacionados à Química nos seus diferentes ramos: Fisico-química, Química orgânica e Química Geral.</p></div>
                          <div class="skill-row"><b>H9</b><p>Explicar os conceitos de energia, matéria, vida e transformação para explicar fenômenos naturais e procedimentos tecnológicos.</p></div>
                      </div>
                  </div>
                  <div class="activity-footer">
                      <a href="https://canva.link/2vzoomnug15scky" target="_blank" class="view-btn">Ver no Canva ↗</a>
                  </div>
              </div>
          </div>
      </div>





      <div class="activity-block" style="margin-top: 40px;">
          <div class="activity-container">
              <div class="activity-right">
                  <div class="activity-info">
                      <h3 class="activity-title">Eletroquímica Aplicada</h3>
                      <p class="activity-text">
                        Desenvolvemos um site para apresentar os conceitos de eletroquímica e realizamos um experimento utilizando limões para gerar energia elétrica.
                            <br><br>
                        Com o experimento, conseguimos acender um LED e observar, na prática, como uma reação química pode produzir corrente elétrica.
                      </p>
                      <button class="skills-btn" onclick="toggleSkills(this)">Conceitos e Habilidades <span class="arrow-icon">↓</span></button>
                      <div class="skills-content">
                          <div class="skill-row"><b>C2</b><p>Aplicar os conceitos fundamentais e estruturas procedimentais das Ciências da Natureza na explicação de fenômenos cotidianos, bem como dominar processos e práticas da investigação científica.</p></div>
                          <div class="skill-row"><b>H7</b><p>Compreender os conceitos relacionados à Química nos seus diferentes ramos: Fisico-química, Química orgânica e Química Geral.</p></div>
                          <div class="skill-row"><b>H9</b><p>Explicar os conceitos de energia, matéria, vida e transformação para explicar fenômenos naturais e procedimentos tecnológicos.</p></div>
                          <div class="skill-row"><b>H11</b><p> Empregar procedimentos e práticas de observação, levantamento de hipótese, experimentação, coleta de dados e conclusões para resolução de problemas relacionados às Ciências da Natureza.</p></div>
                      </div>
                  </div>
                  <div class="activity-footer"><a href="https://eletroquimica.netlify.app" target="_blank" class="view-btn">Ir para o Site ↗</a></div>
              </div>
              <div class="activity-left">
                  <div class="doc-embed" style="aspect-ratio: 16/9; background: #fff; display: flex; align-items: center; justify-content: center;">
                      <img src="imagens/foto-site-natureza.png" style="width: 100%; height: 100%; object-fit: contain;">
                  </div>
              </div>
          </div>
      </div>

  `,
//===============================================================================================================================================================================================================
//===============================================================================================================================================================================================================
//===============================================================================================================================================================================================================
//===============================================================================================================================================================================================================
//===============================================================================================================================================================================================================
  "Humanas III": `
      <div class="activity-block">
          <div class="activity-container">
             <div class="activity-left">
                  <div class="doc-window" style="width: 100%; height: 400px; overflow-y: auto; overflow-x: hidden; border-radius: 12px; background-color: #f5f5f5; border: 1px solid #2a2a35;">
                      <div style="position: relative; width: 100%; padding-top: 125%;">
                          <iframe 
                              loading="lazy" 
                              style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none;"
                              src="https://www.canva.com/design/DAHFhkmpHFg/Ai0pz-1RSfhyaQLSZAFglA/view?embed" 
                              allowfullscreen="allowfullscreen" allow="fullscreen">
                          </iframe>
                      </div>
                  </div>
              </div>
              <div class="activity-right">
                  <div class="activity-info">
                      <h3 class="activity-title">A Grande Guerra - Alemanha</h3>
                      <div class="activity-tag">Documento Histórico</div>
                      <p class="activity-text">
                          A atividade consistiu na recriação de um jornal do ano de 1914, noticiando os avanços tecnológicos da época e os eventos políticos e sociais que culminariam na Primeira Guerra Mundial, com foco na perspectiva da Alemanha.
                          <br><br>
                          O trabalho permitiu compreender o contexto pré-guerra e o impacto da Revolução Industrial nos conflitos bélicos.
                      </p>
                      <button class="skills-btn" onclick="toggleSkills(this)">Conceitos e Habilidades <span class="arrow-icon">↓</span></button>
                      <div class="skills-content">
                          <div class="skill-row"><b>C3 - H15, H16, H20 - C6 - H39</b><p></p></div>
                      </div>
                      <div class="activity-skills">
                          <span>#História</span><span>#PrimeiraGuerra</span><span>#Jornalismo</span>
                      </div>
                  </div>
                  <div class="activity-footer">
                      <a href="https://www.canva.com/design/DAHFhkmpHFg/Ai0pz-1RSfhyaQLSZAFglA/view" target="_blank" class="view-btn">Ver no Canva ↗</a>
                  </div>
              </div>
          </div>
      </div>

      <div class="activity-block" style="margin-top: 40px;">
          <div class="activity-container">
              <div class="activity-right">
                  <div class="activity-info">
                      <h3 class="activity-title">Seminário de Geopolítica: Vietnã</h3>
                      <div class="activity-tag">Apresentação Digital</div>
                      <p class="activity-text">
                          Seminário de geopolítica no qual escolhemos o Vietnã para detalhar dados econômicos, sociais e políticos. A apresentação abordou o contexto histórico do país, seus conflitos e sua posição atual no cenário global.
                      </p>
                      <button class="skills-btn" onclick="toggleSkills(this)">Conceitos e Habilidades <span class="arrow-icon">↓</span></button>
                      <div class="skills-content">
                          <div class="skill-row"><b>C1</b><p>Compreender processos históricos, sociais e geográficos nos diversos aspectos da vida em sociedade.</p></div>
                          <div class="skill-row"><b>H1</b><p>Reconhecer o processo de formação do indivíduo nos aspectos históricos, geográficos, sociais e filosóficos.</p></div>
                          <div class="skill-row"><b>H2</b><p>Compreender o processo de socialização do indivíduo, considerando os princípios do pensamento e da lógica.</p></div>
                          <div class="skill-row"><b>H3</b><p>Compreender as relações de poder entre os diversos grupos sociais.</p></div>
                          <div class="skill-row"><b>H4</b><p>Compreender mudanças e permanências ao longo do tempo na constituição da sociedade.</p></div>
                          <div class="skill-row"><b>H5</b><p>Analisar criticamente os aspectos políticos, econômicos e sociais relacionados à formação da sociedade no Brasil e no mundo.</p></div>
                      </div>
                      <div class="activity-skills">
                          <span>#Geografia</span><span>#Geopolítica</span><span>#Vietnã</span>
                      </div>
                  </div>
                  <div class="activity-footer">
                      <a href="https://www.canva.com/design/DAHBNAWmoK0/VES-Gmj2A5FO09XGHQq4ew/view" target="_blank" class="view-btn">Ver no Canva ↗</a>
                  </div>
              </div>
              <div class="activity-left">
                  <div class="doc-embed" style="position: relative; width: 100%; aspect-ratio: 16/9; overflow: hidden; border-radius: 12px; background-color: #000;">
                      <iframe 
                          loading="lazy" 
                          style="position: absolute; width: 100%; height: 115%; top: -8%; left: 0; border: none;"
                          src="https://www.canva.com/design/DAHBNAWmoK0/VES-Gmj2A5FO09XGHQq4ew/view?embed" 
                          allowfullscreen="allowfullscreen" allow="fullscreen">
                      </iframe>
                  </div>
              </div>
          </div>
      </div>

      <div class="activity-block" style="margin-top: 40px;">
          <div class="activity-container">
              <div class="activity-left">
                  <div class="doc-embed" style="position: relative; width: 100%; aspect-ratio: 16/9; overflow: hidden; border-radius: 12px; background-color: #000;">
                      <iframe 
                          loading="lazy" 
                          style="position: absolute; width: 100%; height: 115%; top: -8%; left: 0; border: none;"
                          src="https://www.canva.com/design/DAHDv0aqe2Q/qqF5rjinXPqr2iL1sFkJzg/view?embed" 
                          allowfullscreen="allowfullscreen" allow="fullscreen">
                      </iframe>
                  </div>
              </div>
              <div class="activity-right">
                  <div class="activity-info">
                      <h3 class="activity-title">Heranças Coloniais: Egito</h3>
                      <div class="activity-tag">Análise Visual</div>
                      <p class="activity-text">
                          Atividade focada na exploração de países que sofreram processos de colonização. O objetivo foi identificar, através de fotografias, os impactos europeus e os aspectos culturais que resistiram ou foram moldados pela dominação imperialista no Egito.
                      </p>
                      <button class="skills-btn" onclick="toggleSkills(this)">Conceitos e Habilidades <span class="arrow-icon">↓</span></button>
                      <div class="skills-content">
                          <div class="skill-row"><b>C2 - H8, H10, H12</b><p></p></div>
                      </div>
                      <div class="activity-skills">
                          <span>#História</span><span>#Imperialismo</span><span>#Egito</span>
                      </div>
                  </div>
                  <div class="activity-footer">
                      <a href="https://www.canva.com/design/DAHDv0aqe2Q/qqF5rjinXPqr2iL1sFkJzg/view" target="_blank" class="view-btn">Ver no Canva ↗</a>
                  </div>
              </div>
          </div>
      </div>





      <div class="activity-block" style="margin-top: 40px;">
          <div class="activity-container">
              <div class="activity-right">
                  <div class="activity-info">
                      <h3 class="activity-title">Relações Geopolíticas Pós WWI</h3>
                      <div class="activity-tag">Relações nazi-soviéticas</div>
                      <p class="activity-text">
                        Realizamos uma apresentação em grupo sobre os acordos nazi-soviéticos após a Primeira Guerra Mundial, abordando o contexto histórico e os principais acontecimentos.
                            <br><br>
                        Durante a atividade, explicamos os interesses envolvidos nos acordos e suas consequências para a Europa, utilizando informações históricas para apresentar o tema aos colegas.
                      </p>
                      <button class="skills-btn" onclick="toggleSkills(this)">Conceitos e Habilidades <span class="arrow-icon">↓</span></button>
                      <div class="skills-content">
                          <div class="skill-row"><b>C1</b><p>Compreender processos históricos, sociais e geográficos nos diversos aspectos da vida em sociedade.</p></div>
                          <div class="skill-row"><b>H3</b><p>Compreender as relações de poder entre os diversos grupos sociais.</p></div>
                          <div class="skill-row"><b>H4</b><p>Compreender mudanças e permanências ao longo do tempo na constituição da sociedade.</p></div>
                          <div class="skill-row"><b>H5</b><p>Analisar criticamente os aspectos políticos, econômicos e sociais relacionados à formação da sociedade no Brasil e no mundo.</p></div>
                      </div>
                  </div>
                  <div class="activity-footer">
                      <a href="https://canva.link/3eujw00u3c5xufw" target="_blank" class="view-btn">Ver no Canva ↗</a>
                  </div>
              </div>
              <div class="activity-left">
                <div style="position: relative; width: 100%; height: 0; padding-top: 56.2500%;
                    padding-bottom: 0; box-shadow: 0 2px 8px 0 rgba(63,69,81,0.16); margin-top: 1.6em; margin-bottom: 0.9em; overflow: hidden;
                    border-radius: 8px; will-change: transform;">
                    <iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none; padding: 0;margin: 0;"
                        src="https://www.canva.com/design/DAHOP5NL5jo/S_62Ul4t2XCrOjSsJRl-Aw/view?embed" allowfullscreen="allowfullscreen" allow="fullscreen">
                    </iframe>
                </div>
          </div>
      </div>
    </div>


      <div class="activity-block" style="margin-top: 40px;">
          <div class="activity-container">
              <div class="activity-left">
                <div style="position: relative; width: 100%; height: 0; padding-top: 56.2500%;
                padding-bottom: 0; box-shadow: 0 2px 8px 0 rgba(63,69,81,0.16); margin-top: 1.6em; margin-bottom: 0.9em; overflow: hidden;
                border-radius: 8px; will-change: transform;">
                    <iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none; padding: 0;margin: 0;"
                        src="https://www.canva.com/design/DAHRP_C5nzk/N63soxQkY6H3IaFw5g9Pcg/view?embed" allowfullscreen="allowfullscreen" allow="fullscreen">
                    </iframe>
                </div>
              </div>
              <div class="activity-right">
                  <div class="activity-info">
                      <h3 class="activity-title">Federalismo de Segregação</h3>
                      <div class="activity-tag">Temas Comtemporâneos</div>
                      <p class="activity-text">
                        Em grupo, escolhemos estudar o modelo de Federalismo de Segregação e suas características, relacionando-o a questões contemporâneas da sociedade.
                        <br><br>
                        Analisamos como esse modelo poderia ser aplicado ao Brasil, discutindo seus possíveis impactos sociais, políticos e territoriais.
                      </p>
                      <button class="skills-btn" onclick="toggleSkills(this)">Conceitos e Habilidades <span class="arrow-icon">↓</span></button>
                      <div class="skills-content">
                        <div class="skill-row"><b>H30 </b><p>Analisar as lutas sociais e conquistas obtidas no que se refere às mudanças nas legislações ou nas políticas  públicas. </p></div>
                        <div class="skill-row"><b>H39 </b><p>Relacionar o papel das instituições sociais às soluções para problemas políticos, econômicos, sociais e  ambientais no contexto da sociedade brasileira e do mundo.</p></div>
                        <div class="skill-row"><b>H40 </b><p>Analisar o processo de formação das instituições sociais e políticas, compreendendo seu papel na sociedade.</p></div>
                      </div>
                  </div>
                  <div class="activity-footer">
                      <a href="https://canva.link/au0pmnk9jukh6yh" target="_blank" class="view-btn">Ver no Canva ↗</a>
                  </div>
              </div>
          </div>
      </div>




    <div class="activity-block" style="margin-top: 40px;">
          <div class="activity-container">
              <div class="activity-right">
                  <div class="activity-info">
                      <h3 class="activity-title">O Apagamento da Alteridade</h3>
                      <div class="activity-tag">O autoritarismo no cinema</div>
                      <p class="activity-text">
                        Realizamos uma atividade relacionando o filme Star Wars V com o conceito de autoritarismo, analisando o contexto político apresentado na obra.
                        <br><br>
                        Comparamos situações e personagens do filme com características de regimes autoritários, identificando relações entre poder, controle e resistência.
                      </p>
                      <button class="skills-btn" onclick="toggleSkills(this)">Conceitos e Habilidades <span class="arrow-icon">↓</span></button>
                      <div class="skills-content">
                          <div class="skill-row"><b>H27 </b><p>Analisar hipóteses e questões ambientais, sociais, econômicas, políticas e culturais, a partir de leituras e debates. </p></div>
                          <div class="skill-row"><b>H26 </b><p>Comparar pontos de vista e ações sobre práticas do indivíduo ou grupo social em diferentes contextos. </p></div>
                          <div class="skill-row"><b>H22</b><p>Analisar, na perspectiva humana e social, as principais características e dinâmicas dos fluxos da sociedade. </p></div>
                          <div class="skill-row"><b>H10 </b><p>Compreender as transformações no mundo do trabalho, geradas por mudanças na ordem econômica.</p></div>
                      </div>
                  </div>
                  <div class="activity-footer">
                      <a href="https://canva.link/7kycg8gjvnd6r5c" target="_blank" class="view-btn">Ver no Canva ↗</a>
                  </div>
              </div>
              <div class="activity-left">
                <div style="position: relative; width: 100%; height: 0; padding-top: 56.2500%;
                padding-bottom: 0; box-shadow: 0 2px 8px 0 rgba(63,69,81,0.16); margin-top: 1.6em; margin-bottom: 0.9em; overflow: hidden;
                border-radius: 8px; will-change: transform;">
                <iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none; padding: 0;margin: 0;"
                    src="https://www.canva.com/design/DAHJvDG-svA/_XI82SvkidZ_D-hKSZ9DPA/view?embed" allowfullscreen="allowfullscreen" allow="fullscreen">
                </iframe>
                </div>
          </div>
      </div>
    </div>
  `
  }
};