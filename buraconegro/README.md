# Buraco negro em 3D (protótipo)

Um buraco negro que dá para girar em 3D, para a futura parte elaborada do **Sobre mim**.
A página é a `buraconegro.html`, na raiz do site. Ela ainda não aparece no portfólio.

Etapas: arte e movimento (feito) → o que cada parte mostra (feito: painel com o texto) → ligar ao portfólio.

## Mesmo estilo do buraco negro do topo

A arte vem do buraco negro que fica atrás da foto no topo do portfólio (`blackhole.js`): o mesmo gás
roxo do disco, a mesma paleta (índigo → violeta → orquídea → lavanda), o anel de fótons fino, a névoa
violeta em volta e o brilho que deixa a sombra roxa. A câmera fica um pouco inclinada, como o disco lá
de cima.

A diferença é que lá a câmera é fixa, e aqui ela gira em volta. Por isso o desenho tem que estar certo
de qualquer ângulo:

- as duas faces do disco brilham, e a luz da parte de trás do disco é curvada pela gravidade por cima
  e por baixo da sombra (como no filme Interstellar);
- a sombra continua um círculo limpo de qualquer lado: o gás só passa na frente dela onde está mesmo
  entre a câmera e o buraco;
- o lado do disco que vem na nossa direção brilha mais (efeito Doppler);
- as estrelas do fundo também são curvadas em volta do buraco.

Tudo é um shader só (sem bibliotecas), que segue cada raio de luz curvado pela gravidade
(geodésicas de Schwarzschild).

## As 5 partes

| Parte | Como aparece | Realçada |
| --- | --- | --- |
| 01 Singularidade | escondida no centro, dentro do horizonte | aparece em "raio-x": um ponto de luz com brilho em cruz |
| 02 Horizonte de eventos | a esfera negra (sombra roxa) | mostra uma grade na superfície, curvada pela gravidade |
| 03 Esfera de fótons | o anel fino de luz colado na sombra | a casca acende, com a luz dando voltas nela |
| 04 Disco de acreção | o gás roxo girando, mais rápido perto do centro | mais forte |
| 05 Jatos relativísticos | dois feixes de plasma saindo pelos polos | mais fortes |

Quando uma parte é realçada, as outras escurecem.

## Painel de cada parte

Clicar (ou tocar) numa das 5 regiões abre um painel à direita (no celular, de baixo para cima),
como o das matérias nos sistemas solares:

- o nome da estrutura, a frase de abertura, uma linha sobre o que ela é na física e os parágrafos;
- a câmera vai até um bom ponto de vista para aquela parte e o buraco sai do meio para dar lugar ao painel;
- uma linha liga a parte ao painel;
- "Anterior" e "Próxima" (ou as setas ← →) trocam de parte; ✕ ou Esc fecha e a câmera volta para onde estava.

Os textos ficam em `../data/sobre.js`: para mudar um texto, mude lá.

**Como o clique sabe qual parte é:** o próprio shader responde. No ponto clicado ele desenha um pixel
só, em "modo clique", seguindo o mesmo raio de luz curvado pela gravidade, e devolve qual parte está
ali (o anel, o disco curvado por cima da sombra, um jato...). Por isso o clique acerta de qualquer
ângulo. Passar o mouse faz a mesma pergunta e mostra o nome da parte.

## O que dá para fazer na página

- **Arrastar** para girar (vale ir por cima e por baixo do disco); **rolar** ou **pinçar** para aproximar.
- **Pontos de vista:** Inclinado, De cima, De lado e Por baixo. Clique duplo volta ao inclinado.
- **Girar sozinho** liga e desliga a rotação automática.
- **Partes:** passar o mouse realça e mostra o nome; clicar abre o painel. A lista do canto também
  abre, e as teclas 1 a 5.

## Desempenho

O shader é pesado, então a imagem é desenhada com menos pixels e o navegador amplia (o gás e a névoa
são suaves, então quase não se nota). Se o aparelho não der conta, a resolução diminui sozinha.

## Arquivos

| Arquivo | O quê |
| --- | --- |
| `../buraconegro.html` | A página (interface e estilos). |
| `buraconegro.js` | O shader do buraco negro, a câmera, os controles, o clique e o painel. |
| `../data/sobre.js` | Os textos de cada parte. |
