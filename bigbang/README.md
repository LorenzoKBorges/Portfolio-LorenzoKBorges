# Big Bang (abertura do portfólio)

Versão da animação do repositório [bigbang-animacao](https://github.com/LorenzoKBorges/bigbang-animacao),
adaptada para tocar na tela de abertura do portfólio.

O site carrega só o arquivo `bigbang.js` (já gerado, com o three.js dentro). Ele é baixado
apenas por quem vê a abertura sem ter escolhido o modo leve antes.

## O que mudou em relação ao repositório original

Só `src/main.js`:

- A animação não começa sozinha nem procura os elementos pelo id. O portfólio controla tudo por
  `window.BigBang`:
  - `preparar({ palco, clarao, vinheta })` monta a cena (o ponto pulsando, parado);
  - `comecar()` dispara a animação (o "clique");
  - `pular()` vai para a tela branca em 0,6 s;
  - `deslocar(px)` sobe ou desce a cena na tela (na abertura o ponto fica acima dos botões);
  - `descartar()` para tudo e libera a placa de vídeo.
- No fim (tela branca) ela dispara o evento `bigbang:fim`, como antes; o portfólio aparece por baixo.
- Os atalhos de desenvolvimento viraram `?bbt=5` (começa no segundo 5) e `?bbt=5&bbpausa` (congela),
  para não misturar com os parâmetros do site. `?qualidade=0.5` continua igual.

Os outros arquivos de `src/` são idênticos aos do repositório original.

## Regerando o `bigbang.js`

Depois de mexer em `src/`, dentro desta pasta:

```bash
npm install
```

```bash
npm run build
```
