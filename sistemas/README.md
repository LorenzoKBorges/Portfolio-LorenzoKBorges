# Sistemas solares (protótipo)

As matérias do 3° ano como planetas de dois sistemas solares, em 3D (three.js).
A página é a `sistemas.html`, na raiz do site. Ela ainda não aparece no portfólio: é o modelo
para aprovar antes de ligar ao resto.

- **Sistema A:** matérias básicas, com sol cor de areia.
- **Sistema B:** matérias técnicas, com sol roxo.
- **Cada matéria é um planeta.** O tamanho e o número de luas são o número de trabalhos
  (uma lua por trabalho). Matérias sem trabalho aparecem apagadas ("em breve").
- **Os dados** vêm de `data/3ano.js`, o mesmo arquivo do portfólio: matéria ou trabalho novo
  aparece aqui sozinho.

## O que dá para fazer na página

- Trocar de sistema pelos botões (ou teclas 1 e 2): a câmera viaja de um para o outro.
- Arrastar para girar, rolar (ou pinçar) para aproximar.
- Passar o mouse num planeta: ele cresce, a órbita acende e tudo desacelera.
- Clicar num planeta (ou no rótulo): a câmera vai até ele e o acompanha na órbita.
  Esc ou "Voltar ao sistema" volta para a visão geral.

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

## Regerando o `sistemas.js`

Depois de mexer em `src/` (ou no `bigbang/src`, que esta página também usa), dentro desta pasta:

```bash
npm install
```

```bash
npm run build
```
