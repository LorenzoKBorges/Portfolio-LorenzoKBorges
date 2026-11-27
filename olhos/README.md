# Olhos

Os olhos roxos do repositório [olho_port](https://github.com/LorenzoKBorges/olho_port), iguais ao
original, espalhados pela **página inicial** e pelas **páginas das matérias** do portfólio.
Eles não aparecem nos sistemas solares.

## O que fazem (igual ao olho_port)

- Seguem o mouse (ou o dedo) a partir de onde estão.
- Com o ponteiro parado por 7 s, voltam a olhar para a frente; uns 3 s depois começam a olhar em volta.
  Mexeu ou rolou a página, voltam a seguir.
- Cada um pisca a cada 8 a 10 s e "falha" (glitch) de vez em quando.
- Clicou na parte que aparece de um olho: ele pisca vermelho e fica quase fechado por uns 5 s.
- No **modo leve** (e para quem pediu menos movimento no sistema) ficam parados, olhando para a frente.

## Por baixo do conteúdo

Os olhos são desenhados numa camada só (um canvas fixo do tamanho da tela) que fica entre o céu do
site e o conteúdo. Por isso eles passam **por baixo** dos textos, cartões, fotos e do documento:
onde um olho encontra um cartão, só aparece a parte que sobra para fora. A camada é misturada com o
fundo em modo `screen`, então o preto some e só a luz dos olhos aparece.

O arquivo só é baixado depois que o site aparece (não pesa na abertura) e só desenha quando algum
olho está na tela.

## Onde ficam

As posições estão em `src/posicoes.js`. Cada olho fica preso a um elemento da página e anda junto
com ele:

| Olho | Onde |
| --- | --- |
| `atividades` | à direita do título "Atividades" |
| `trilha-a` | espiando por trás do canto do cartão "Matérias básicas" |
| `destaques` | acima do título "Em destaque" |
| `destaques-cartoes` | pequeno, entre o texto e os cartões dos destaques (só no computador) |
| `apresentacao` | por trás do documento de apresentação, saindo pela direita |
| `sobre` | o grande, embaixo dos gostos (Xadrez, Coup...) |
| `rodape-nome` | acima do nome grande do rodapé (aparece também nas matérias) |
| `rodape-topo` | perto do pulsar, por cima do "Voltar ao topo" |
| `materia-titulo` | nas matérias: ao lado da última linha do nome (no celular, ao lado de "6 trabalhos") |
| `materia-2`, `materia-4`, `materia-6` | espiando por trás do 2°, 4° e 6° trabalho, alternando os lados (computador) |
| `materia-unico` | matéria com um trabalho só: por trás do canto de baixo do cartão (computador) |
| `materia-vazia` | matéria "em breve": por trás do aviso (computador) |
| `materia-fim` | no celular: antes de "Anterior / Próxima" |

Cada posição tem uma versão para o computador e outra para o celular (até 860 px de largura).
Para mudar um olho de lugar, mude `x`, `y`, `largura` e `graus` dele (a explicação está no topo do arquivo).

**Ideias a mais:** abrindo o site com `?olhos=sugestoes` no fim do endereço aparecem também os olhos
de `SUGESTOES` (à direita de "Certificados", por trás da foto com as medalhas e por trás do cartão
"Matérias técnicas"). Para deixar um deles de vez, mova-o para a lista `OLHOS`.

## Arquivos

| Arquivo | O quê |
| --- | --- |
| `src/olho.js` | O olho, copiado do olho_port (medidas, cores, shaders, piscada, falha, clique). |
| `src/posprocesso.js` | Brilho difuso e cor final, copiados do olho_port. |
| `src/posicoes.js` | Onde fica cada olho. |
| `src/main.js` | A camada na página: posições, animação e cliques. |
| `olhos.js` | Gerado a partir de `src/` (é o que o site carrega). |

## Mexendo

```bash
npm install
```

```bash
npm run build
```
