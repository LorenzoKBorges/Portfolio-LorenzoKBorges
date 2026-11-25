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

## Arquivos

| Arquivo | O quê |
| --- | --- |
| `src/main.js` | Cena, os dois sistemas, cores de cada planeta (`VISUAL`), câmera, rótulos e cliques |
| `src/corpos.js` | O sol, as órbitas (linha com rastro de luz) e os planetas (anel, atmosfera, luas) |
| `src/texturas.js` | Texturas desenhadas na hora (nenhuma imagem é baixada) |

## Regerando o `sistemas.js`

Depois de mexer em `src/`, dentro desta pasta:

```bash
npm install
```

```bash
npm run build
```
