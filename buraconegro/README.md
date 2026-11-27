# Buraco negro em 3D (protótipo)

Um buraco negro que dá para girar em 3D, para a futura parte elaborada do **Sobre mim**.
A página é a `buraconegro.html`, na raiz do site. Ela ainda não aparece no portfólio: esta é a
primeira etapa (arte e movimento), para aprovar antes de pensar no conteúdo de cada parte.

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

Quando uma parte é realçada, as outras escurecem. Por enquanto isso serve para ver as divisões; o
conteúdo de cada parte (texto e funções) é a próxima etapa.

## O que dá para fazer na página

- **Arrastar** para girar (vale ir por cima e por baixo do disco); **rolar** ou **pinçar** para aproximar.
- **Pontos de vista:** Inclinado, De cima, De lado e Por baixo. Clique duplo volta ao inclinado.
- **Girar sozinho** liga e desliga a rotação automática.
- **Partes:** passar o mouse (ou focar com o teclado) realça; clicar deixa realçada. Teclas 1 a 5 também,
  Esc solta.

## Desempenho

O shader é pesado, então a imagem é desenhada com menos pixels e o navegador amplia (o gás e a névoa
são suaves, então quase não se nota). Se o aparelho não der conta, a resolução diminui sozinha.

## Arquivos

| Arquivo | O quê |
| --- | --- |
| `../buraconegro.html` | A página (interface e estilos). |
| `buraconegro.js` | O shader do buraco negro, a câmera e os controles. |
