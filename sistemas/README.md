# Sistemas solares

As matérias do 3° ano como planetas de dois sistemas solares, em 3D (three.js).
A página é a `sistemas.html`, na raiz do site. No portfólio, a faixa roxa **Ver sistemas solares**
(logo abaixo do topo, no lugar da antiga faixa com os nomes das matérias) leva até ela.
Quem volta pelo "← Portfólio" (ou pelo botão de voltar do navegador) cai direto na faixa,
sem a tela de abertura de novo.

- **Sistema A:** matérias básicas, com sol cor de areia.
- **Sistema B:** matérias técnicas, com sol roxo.
- **Cada matéria é um planeta.** O tamanho e o número de luas são o número de trabalhos
  (uma lua por trabalho). Matérias sem trabalho aparecem apagadas ("em breve").
- **Os dados** vêm de `data/3ano.js`, o mesmo arquivo do portfólio: matéria ou trabalho novo
  aparece aqui sozinho.

## O que dá para fazer na página

- Trocar de sistema pelos botões (ou teclas 1 e 2): a câmera viaja de um para o outro.
- Arrastar para girar (dá para ver de cima e por baixo do plano das órbitas), rolar (ou pinçar) para aproximar.
- **Pontos de vista** (canto de baixo): Inclinado, De cima, Rasante e Por baixo levam a câmera
  ao ângulo com um clique, no sistema inteiro ou em volta do planeta aberto. "Girar sozinho"
  liga e desliga a rotação automática.
- Passar o mouse num planeta: ele cresce, a órbita acende e tudo desacelera.
- Clicar num planeta (ou no rótulo): a câmera vai até ele e abre o **painel da matéria**,
  à direita no computador e de baixo para cima no celular.
- **No painel**, cada trabalho é um cartão numerado. O número é o da lua do planeta:
  - passar o mouse num cartão acende a lua dele, mostra o nome perto dela e leva a linha até ela;
  - clicar numa lua abre o trabalho dela no painel;
  - abrir um cartão mostra o material (Canva, vídeo e documentos só carregam nessa hora),
    o texto, os links, as habilidades e o código;
  - as submatérias viram filtros, e "Anterior" e "Próxima" (ou as setas ← →) trocam de matéria.
- Esc ou ✕ fecha o painel e volta para a visão geral.

## Mesmo modelo de arte do Big Bang

Os planetas, o sol, o céu, as órbitas e o tratamento de cor usam o próprio código da animação
do Big Bang (`bigbang/src`): as texturas (`texturas.js`), os sprites (`materiais.js`), o céu
(`Ceu`, em `universo.js`) e o pós-processamento (brilho e cor final).
Cada matéria tem o visual de um planeta da animação: Natureza é o Saturno, Linguagens é Vênus,
Humanas é a Terra, Desenvolvimento é Júpiter, Banco de Dados é Netuno, e assim por diante.

Diferenças em relação ao Big Bang:
- **Bordas lisas:** a imagem é desenhada com antisserrilhado (MSAA), então as linhas das órbitas
  e as bordas dos planetas ficam lisas.
- **Brilho só no que é claro:** o brilho (bloom) tem um limiar mais alto, para pegar só o sol,
  os anéis e as atmosferas. Nas estrelas do fundo ele criava quadradinhos.

## Arquivos

| Arquivo | O quê |
| --- | --- |
| `src/main.js` | Cena, os dois sistemas, o visual de cada planeta (`VISUAL`), câmera, rótulos e cliques |
| `src/corpos.js` | O sol e os planetas (anéis, atmosfera, luas), no modelo do sistema solar do Big Bang |
| `src/painel.js` | O painel da matéria: cartões dos trabalhos, filtros e navegação entre matérias |

## Regerando o `sistemas.js`

Depois de mexer em `src/` (ou no `bigbang/src`, que esta página também usa), dentro desta pasta:

```bash
npm install
```

```bash
npm run build
```
