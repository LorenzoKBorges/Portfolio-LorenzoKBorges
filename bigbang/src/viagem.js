import * as THREE from 'three';
import { smoothstep, clamp, lerp } from './utils.js';
import { PLANETAS, ORBITA_SATURNO, SistemaSolar } from './sistema.js';
import { Galaxia, BRACOS } from './universo.js';

const M = 6000; // amostras ao longo do caminho
const SUAVIZAR = 35; // a câmera de perseguição segue a direção média de ±35 de caminho
const LIXA = 10; // o caminho é arredondado numa janela de ±10 (tira quinas sem encolher as curvas)
const LIXA_SISTEMA = 30; // entre os planetas o arredondamento é bem maior (curvas abertas, sem quinas)
const AMPLIACAO = 400; // a "lupa" amplia o pontinho do braço 400 vezes até virar o sistema solar
const FATOR_LUPA = 4.5; // velocidade (relativa) com que a ampliação acontece
const DISTANCIA_CAMERA = 400; // de onde a câmera vê o sistema solar inteiro
const ELEVACAO_CAMERA = THREE.MathUtils.degToRad(28); // ...e quão acima do plano das órbitas
const INCLINACAO_SISTEMA = THREE.MathUtils.degToRad(55); // plano das órbitas x disco da galáxia
const DERIVA_CAMERA = THREE.MathUtils.degToRad(35); // a câmera gira devagar em volta do sistema
const RAIO_ORBITA = 34; // a volta em Saturno começa a esta distância do centro (anéis vão até 28)...
const VARIACAO_ORBITA = 12; // ...e abre do outro lado (volta menos "certinha")
const RAIO_CAMERA = 90; // a câmera acompanha por fora, um pouco acima do plano da volta...
const ATRASO_CAMERA = 0.6; // ...sempre ~35° atrás da estrela
const VOLTAS_SATURNO = 3; // voltas em Saturno, cada vez mais rápido (a câmera dá a primeira junto)
const ACELERACAO_SATURNO = 6; // no fim das voltas a estrela está 7 vezes mais rápida
const SUBIDA = { voltas: 4.5, altura: 95, raioFinal: 2 }; // depois é lançada para cima numa espiral que vai afinando
const TREMOR_SATURNO = 2.4; // a tela treme mais conforme a estrela acelera
const INCLINACAO_VOLTAS = THREE.MathUtils.degToRad(58); // cada volta num plano bem inclinado...
const GIRO_DAS_VOLTAS = THREE.MathUtils.degToRad(-180); // ...que gira 60° a cada volta: os três planos ficam igualmente espaçados
const ABERTURA_VOLTAS = 26; // cada volta é uma elipse aberta: vai de 32 a 32 + 26 de distância de Saturno
// Galáxia, em coordenadas dela (disco no plano y = 0, núcleo na origem)
const INCLINACAO_GALAXIA = THREE.MathUtils.degToRad(25); // disco inclinado para a câmera da explosão
const BRACO_DA_ROTA = { braco: 2, de: 110, ate: 40 }; // a estrela entra pela ponta deste braço e vai por dentro dele até perto do núcleo
const RAIO_NEBULOSA = 76; // no caminho, dentro do braço, ela atravessa uma nebulosa
const PARTIDA_ATRAS = 120; // a estrela começa fora do disco, na continuação do braço...
const PARTIDA_ALTURA = 90; // ...e acima dele (desce vendo a galáxia de cima)
const RAIO_BURACO = 32; // a volta no buraco negro do núcleo (o disco de acreção vai até 33, inclinado)
const ALTURA_BURACO = 6;
const RAIO_BOLHA = 1.2; // sem estrelas da galáxia em volta do pontinho (ampliado 400x, fica fora do sistema solar)
const RETA_ATE_PONTINHO = 60; // depois do buraco negro ela voa reto e começa a frear a esta distância do pontinho
// De Júpiter a Mercúrio a câmera desce e segue a estrela girando em volta da direção dela (espiral)
const VOLTAS_ESPIRAL = 1;
const ESPIRAL_RAIO = 8;
const ESPIRAL_ATRAS = 13;

// Rota no sistema solar: onde (ângulo na órbita, em graus) cada planeta está quando a estrela passa.
// A estrela começa em Netuno, vai para Vênus, Júpiter, volta para Mercúrio e voa para Saturno.
const GIRO_DA_ROTA = 0; // gira a rota inteira em volta do sol (ajuste fino do enquadramento)
const DESVIO_LUPA = 15; // graus: a estrela passa um pouco ao lado do pontinho (não por cima dele)
const ROTA = [
  { nome: 'netuno', graus: 248 },
  { nome: 'venus', graus: 20 },
  { nome: 'jupiter', graus: 100 },
  { nome: 'mercurio', graus: 150 },
];
const GRAUS_SATURNO = 190;
const CHEGADA_NETUNO = -10; // direção (graus) em que a estrela chega em Netuno

/** Média móvel de uma lista de pontos (x, y, z) com janela ±k. */
function mediaMovel(src, k) {
  const n = src.length / 3;
  const out = new Float32Array(src.length);
  const soma = [0, 0, 0];
  let ini = 0;
  let fim = -1;
  for (let i = 0; i < n; i++) {
    const a = Math.max(0, i - k);
    const b = Math.min(n - 1, i + k);
    while (fim < b) {
      fim++;
      for (let c = 0; c < 3; c++) soma[c] += src[fim * 3 + c];
    }
    while (ini < a) {
      for (let c = 0; c < 3; c++) soma[c] -= src[ini * 3 + c];
      ini++;
    }
    for (let c = 0; c < 3; c++) out[i * 3 + c] = soma[c] / (b - a + 1);
  }
  return out;
}

/** Direções (normalizadas) suavizadas por média móvel com janela ±k amostras. */
function suavizarDirecoes(T, k) {
  const out = mediaMovel(T, k);
  const v = new THREE.Vector3();
  for (let i = 0; i < out.length; i += 3) {
    v.fromArray(out, i).normalize();
    v.toArray(out, i);
  }
  return out;
}

/**
 * Pontos de um estilingue: uma hipérbole em volta do planeta P (como a trajetória de verdade),
 * passando por fora da curva a uma distância mínima rp. A estrela chega de lado, faz uma curva
 * aberta e sai pela tangente; quanto maior o desvio, mais ela "abraça" o planeta.
 */
function estilingue(P, entra, sai, rp) {
  const desvio = Math.max(entra.angleTo(sai), 0.25);
  const e = 1 / Math.sin(desvio / 2); // excentricidade que dá exatamente esse desvio
  const assintota = Math.acos(-1 / e);
  // desenha cada lado até a distância ficar ~2,4x a mínima (o resto vira a ligação com o próximo)
  const limite = Math.min(Math.acos(clamp(((1 + e) / 2.4 - 1) / e, -1, 1)), assintota * 0.9);
  const fora = entra.clone().sub(sai).normalize();
  const frente = entra.clone().add(sai).normalize();
  const pts = [];
  for (let k = -4; k <= 4; k++) {
    const th = (k / 4) * limite;
    const r = (rp * (1 + e)) / (1 + e * Math.cos(th));
    pts.push(P.clone().addScaledVector(fora, Math.cos(th) * r).addScaledVector(frente, Math.sin(th) * r));
  }
  return pts;
}

/**
 * Planeja a rota antes de criar o sistema solar: posiciona e inclina a galáxia (com a nebulosa e o
 * buraco negro), escolhe o pontinho do braço que a lupa vai ampliar (onde fica o sol) e define a
 * orientação do sistema, a câmera e por onde a estrela passa.
 */
/**
 * Planeja a rota antes de criar o sistema solar: posiciona e inclina a galáxia (com a nebulosa e o
 * buraco negro), escolhe o pontinho do braço que a lupa vai ampliar (onde fica o sol) e define a
 * orientação do sistema, a câmera e por onde a estrela passa.
 */
/**
 * Curva aberta saindo de `inicio` na direção `rumo` até apontar para `alvo` (vira no máximo
 * 0,82° por unidade, raio ~70). Devolve null se a estrela precisaria dar a volta no alvo, se
 * sobraria pouca reta até ele, ou se a curva passaria perto do núcleo.
 */
function curvaAte(inicio, rumo0, alvo, nucleo) {
  const PASSO = 2;
  const GIRO_MAX = THREE.MathUtils.degToRad(0.82) * PASSO;
  const p = inicio.clone();
  const rumo = rumo0.clone();
  const pontos = [];
  let giro = 0;
  let distAnterior = Infinity;
  let aproximando = false;
  for (let k = 0; k < 300; k++) {
    const para = alvo.clone().sub(p);
    const dist = para.length();
    const ang = rumo.angleTo(para.normalize());
    if (ang < 0.01) {
      if (dist < 55) return null;
      return { pontos, fim: p, giro: THREE.MathUtils.radToDeg(giro), comprimento: k * PASSO };
    }
    // afastando do alvo depois de já ter começado a chegar: está dando a volta nele
    if (dist < distAnterior) aproximando = true;
    else if (aproximando) return null;
    distAnterior = dist;
    if (p.distanceTo(nucleo) < 45) return null;
    const eixo = new THREE.Vector3().crossVectors(rumo, para).normalize();
    const d = Math.min(GIRO_MAX, ang);
    rumo.applyAxisAngle(eixo, d);
    giro += d;
    p.addScaledVector(rumo, PASSO);
    if (k % 6 === 5) pontos.push(p.clone());
  }
  return null;
}

export function planejarRota(galaxia, inicio) {
  const { braco, de, ate } = BRACO_DA_ROTA;

  // 1) orientação da galáxia: disco inclinado para a câmera da explosão (que o vê de cima). A
  //    estrela começa acima do disco, na continuação do braço, e desce até a ponta dele; a galáxia
  //    gira em volta da normal para essa descida ir para longe da câmera
  const entradaLocal = Galaxia.localDoBraco(braco, de).setY(3);
  const tangente = Galaxia.localDoBraco(braco, de - 1).sub(entradaLocal).setY(0).normalize(); // para dentro
  const partida = entradaLocal.clone().addScaledVector(tangente, -PARTIDA_ATRAS).setY(PARTIDA_ALTURA);
  const normal = new THREE.Vector3(0, Math.cos(INCLINACAO_GALAXIA), Math.sin(INCLINACAO_GALAXIA));
  let q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
  for (let k = 0; k < 3; k++) {
    const d = entradaLocal.clone().sub(partida).applyQuaternion(q);
    const ajuste = Math.PI - Math.atan2(d.x, d.z); // queremos a direção apontando para -z
    q = new THREE.Quaternion().setFromAxisAngle(normal, ajuste).multiply(q);
  }
  galaxia.posicionar(inicio.clone().sub(partida.clone().applyQuaternion(q)), q);
  galaxia.criarNebulosa(braco, RAIO_NEBULOSA);
  const n = galaxia.normal;
  const nebulosa = galaxia.mundo(Galaxia.localDoBraco(braco, RAIO_NEBULOSA).setY(2));
  const buraco = galaxia.mundo(new THREE.Vector3(0, ALTURA_BURACO, 0));

  // 2) desce até a ponta do braço e vai por dentro dele, no meio das estrelas, passando pela
  //    nebulosa, seguindo a espiral até perto do núcleo
  const descida = galaxia.mundo(entradaLocal.clone().addScaledVector(tangente, -45).setY(16));
  const noBraco = [];
  for (let r = de; r >= ate - 0.01; r -= 5) {
    noBraco.push(galaxia.mundo(Galaxia.localDoBraco(braco, r).setY(3 + 1.5 * Math.sin(r * 0.15))));
  }

  // 3) dá uma volta no buraco negro (no mesmo sentido da espiral) e sai pela tangente, reto para
  //    o pontinho de um braço (o sistema solar). O pontinho escolhido é o que faz a volta ser
  //    grande (~160°) e deixa espaço para a estrela frear antes dele
  const a0 = Math.atan2(Galaxia.localDoBraco(braco, ate).z, Galaxia.localDoBraco(braco, ate).x);
  const dr0 = (ate - RAIO_BURACO) / ate; // ...e o raio vai fechando no ritmo da espiral
  let melhor = null;
  for (let b = 0; b < BRACOS; b++) {
    if (b === braco) continue; // o pontinho fica noutro braço
    for (let r = 86; r <= 108; r += 2) {
      const S = Galaxia.localDoBraco(b, r);
      const aT = Math.atan2(S.z, S.x) + Math.acos(RAIO_BURACO / r); // onde a reta sai tangente
      const volta = THREE.MathUtils.euclideanModulo(a0 - aT, Math.PI * 2);
      if (volta < THREE.MathUtils.degToRad(110) || volta > THREE.MathUtils.degToRad(230)) continue;
      const nota = Math.abs(volta - THREE.MathUtils.degToRad(160)) + Math.abs(r - 98) * 0.01;
      if (!melhor || nota < melhor.nota) melhor = { S, r, volta, nota };
    }
  }
  const voltaBuraco = [];
  const nVolta = Math.ceil(melhor.volta / THREE.MathUtils.degToRad(12));
  const taxa = 1 / 1.9 / dr0; // o raio começa a fechar com a mesma inclinação da espiral
  for (let k = 1; k <= nVolta; k++) {
    const u = (melhor.volta * k) / nVolta;
    const r = RAIO_BURACO + (ate - RAIO_BURACO) * Math.exp(-u * taxa);
    voltaBuraco.push(galaxia.mundo(new THREE.Vector3(Math.cos(a0 - u) * r, ALTURA_BURACO, Math.sin(a0 - u) * r)));
  }
  const sol = galaxia.mundo(melhor.S);
  galaxia.definirBolha(melhor.S, RAIO_BOLHA);
  const saidaBuraco = voltaBuraco[voltaBuraco.length - 1];
  const dReta = sol.clone().sub(saidaBuraco);
  const antesDoPontinho = sol.clone().addScaledVector(dReta.clone().normalize(), -RETA_ATE_PONTINHO);
  const curvaSaida = [new THREE.Vector3().lerpVectors(saidaBuraco, antesDoPontinho, 0.5)];
  const dChegada = sol.clone().sub(antesDoPontinho).normalize(); // a estrela chega no pontinho nesta direção

  // 4) orientação do sistema: plano das órbitas inclinado em volta da direção de chegada (assim a
  //    estrela chega no plano das órbitas); a câmera fica atrás, do lado de onde a estrela vem
  const cima = n.clone().applyAxisAngle(dChegada, INCLINACAO_SISTEMA).normalize();
  const e1 = dChegada.clone().negate();
  const e2 = new THREE.Vector3().crossVectors(e1, cima);
  const base = { sol, e1, e2, cima };
  // câmera da lupa e do sistema: perto do plano da galáxia, para ela virar uma faixa atrás do sistema
  const camera = sol
    .clone()
    .addScaledVector(e1, Math.cos(ELEVACAO_CAMERA) * DISTANCIA_CAMERA)
    .addScaledVector(cima, Math.sin(ELEVACAO_CAMERA) * DISTANCIA_CAMERA);
  const mundo = (local) =>
    new THREE.Vector3().addScaledVector(e1, local.x).addScaledVector(cima, local.y).addScaledVector(e2, local.z).add(sol);

  // 5) gira a rota em volta do sol para o ponto de onde a estrela começa (fora de Netuno) ficar
  //    bem na frente da direção de chegada: durante a lupa ela segue reto, sem curva
  const netunoTipo = PLANETAS.find((x) => x.nome === 'netuno');
  const inicioLocal = (giro) => {
    const a = THREE.MathUtils.degToRad(CHEGADA_NETUNO + giro);
    return SistemaSolar.local(netunoTipo.orbita, ROTA[0].graus + giro).add(new THREE.Vector3(-Math.cos(a) * 80, 0, -Math.sin(a) * 80));
  };
  const i0 = inicioLocal(0);
  const giro = 180 + DESVIO_LUPA - THREE.MathUtils.radToDeg(Math.atan2(i0.z, i0.x)) + GIRO_DA_ROTA;
  const encontros = ROTA.map(({ nome, graus }) => {
    const p = PLANETAS.find((x) => x.nome === nome);
    return { nome, graus: graus + giro, raio: p.raio, pos: mundo(SistemaSolar.local(p.orbita, graus + giro)) };
  });
  const grausSaturno = GRAUS_SATURNO + giro;
  const saturno = mundo(SistemaSolar.local(ORBITA_SATURNO, grausSaturno));
  const inicioSistema = mundo(inicioLocal(giro));

  // 6) antes da lupa o sistema é 30x menor: a estrela passa pelo pontinho e para logo depois dele
  const sigma0 = 1 / AMPLIACAO;
  const fimAproximacao = sol.clone().lerp(inicioSistema, sigma0);

  // 7) entrada na volta de Saturno: vem de Mercúrio e continua a curva do último estilingue
  const ultimo = encontros[encontros.length - 1].pos;
  const dEnt = saturno.clone().sub(ultimo).normalize();
  const dentroUltimo = dEnt.clone().sub(ultimo.clone().sub(encontros[encontros.length - 2].pos).normalize());
  const lado = dentroUltimo.addScaledVector(dEnt, -dentroUltimo.dot(dEnt)).normalize();
  const entrada = saturno.clone().addScaledVector(lado, -RAIO_ORBITA);

  return {
    descida,
    noBraco,
    nebulosa,
    buraco,
    centroGalaxia: galaxia.mundo(new THREE.Vector3()),
    normalGalaxia: n,
    voltaBuraco,
    curvaSaida,
    base,
    camera,
    sigma0,
    antesDoPontinho,
    fimAproximacao,
    inicioSistema,
    encontros,
    grausSaturno,
    saturno,
    entrada,
    dEnt,
    lado,
  };
}

/**
 * A viagem da estrela: atravessa um braço da galáxia, voa até um pontinho do braço que a lupa
 * amplia até virar o sistema solar, passa por Netuno, Vênus, Júpiter e Mercúrio (estilingue em
 * cada um), dá uma volta completa em Saturno e para ao lado dele.
 * Também diz onde a câmera fica a cada instante e quanto a lupa está ampliando.
 */
export class Viagem {
  constructor({ inicio, galaxia, planeta, rota }, duracao) {
    this.duracao = duracao;
    const { descida, noBraco, voltaBuraco, curvaSaida, base, antesDoPontinho, fimAproximacao } = rota;
    const { inicioSistema, encontros, entrada, dEnt, lado } = rota;
    const C = planeta.centro;
    this.sol = base.sol.clone();
    this.cimaSistema = base.cima.clone();
    this.cameraSistema = rota.camera.clone();
    this.sigma0 = rota.sigma0;
    this.centroGalaxia = rota.centroGalaxia.clone();
    this.normalGalaxia = rota.normalGalaxia.clone();
    this.buraco = rota.buraco.clone();
    this.distanciaLupa = inicioSistema.distanceTo(this.sol);

    // estilingues: cada planeta desvia a estrela, que passa por fora da curva
    const arcos = encontros.map((e, k) => {
      const antes = k === 0 ? inicioSistema : encontros[k - 1].pos;
      const depois = k === encontros.length - 1 ? entrada : encontros[k + 1].pos;
      return estilingue(e.pos, e.pos.clone().sub(antes).normalize(), depois.clone().sub(e.pos).normalize(), e.raio * 1.6 + 9);
    });
    const fimArcos = arcos[arcos.length - 1].at(-1);

    // voltas em torno de Saturno, entrando pela tangente. Cada volta é uma elipse num plano
    // diferente (como o desenho de um átomo): o plano da órbita se inclina e vai girando em volta
    // do eixo de Saturno, então as voltas cruzam em pontos diferentes em volta dele. Na última meia
    // volta o plano volta a ficar reto, e de lá a estrela é lançada para cima
    const eixo = new THREE.Vector3().crossVectors(lado.clone().negate(), dEnt).normalize();
    const cimaVolta = eixo.clone().multiplyScalar(eixo.dot(base.cima) >= 0 ? 1 : -1);
    const total = Math.PI * 2 * VOLTAS_SATURNO;
    const noPlano = (fi, r, out) =>
      out.copy(C).addScaledVector(lado, -Math.cos(fi) * r).addScaledVector(dEnt, Math.sin(fi) * r);
    const nodos = new THREE.Vector3();
    const naOrbita = (fi) => {
      const x = fi / total;
      const r = RAIO_ORBITA - 2 + ABERTURA_VOLTAS * Math.sin(fi / 2) ** 2 * (1 - 0.25 * x);
      const p = noPlano(fi, r, new THREE.Vector3()).sub(C);
      const inclinacao = INCLINACAO_VOLTAS * smoothstep(0, Math.PI * 0.9, fi) * (1 - smoothstep(total - Math.PI, total, fi));
      nodos.copy(lado).negate().applyAxisAngle(cimaVolta, GIRO_DAS_VOLTAS * x + 0.6);
      return p.applyAxisAngle(nodos, inclinacao).add(C);
    };
    const orbita = [];
    const nOrb = Math.ceil(total / 0.22);
    for (let k = 0; k <= nOrb; k++) orbita.push(naOrbita((total * k) / nOrb));
    const fimVoltas = orbita[orbita.length - 1];
    const primeiraVolta = orbita[Math.round(nOrb / VOLTAS_SATURNO)];
    // lançada para cima: espiral em volta do eixo de Saturno, no mesmo sentido das voltas, que vai
    // afinando enquanto sobe (e freando, até quase parar lá em cima, onde explode)
    const subida = [];
    const raio0 = RAIO_ORBITA - 2;
    const nSub = Math.ceil((SUBIDA.voltas * Math.PI * 2) / 0.25);
    for (let k = 1; k <= nSub; k++) {
      const u = k / nSub;
      const fi = total + u * SUBIDA.voltas * Math.PI * 2;
      const r = raio0 * Math.pow(1 - u, 1.4) + SUBIDA.raioFinal * u;
      const h = SUBIDA.altura * (0.8 * (1 - (1 - u) ** 2) + 0.2 * u);
      subida.push(noPlano(fi, r, new THREE.Vector3()).addScaledVector(cimaVolta, h));
    }
    const fim = subida[subida.length - 1];

    const naLupa = (f) => this.sol.clone().lerp(inicioSistema, f);
    const pts = [
      inicio.clone(),
      descida, // 1) desce até a ponta de um braço, vendo o disco de cima
      ...noBraco, // 2) por dentro do braço, passando pela nebulosa
      ...voltaBuraco, // 3) volta no buraco negro do núcleo
      ...curvaSaida, // 4) sai pela tangente, reto para o pontinho de um braço
      antesDoPontinho, // 5) voa até o pontinho e quase para
      new THREE.Vector3().lerpVectors(antesDoPontinho, fimAproximacao, 0.5),
      fimAproximacao,
      naLupa(0.12), // 3) a lupa: a estrela vai do pontinho até fora da órbita de Netuno
      naLupa(0.3),
      naLupa(0.6),
      inicioSistema,
      ...arcos.flat(), // 4) Netuno, Vênus, Júpiter e Mercúrio
      new THREE.Vector3().lerpVectors(fimArcos, entrada, 0.5),
      ...orbita, // 5) voltas em Saturno, acelerando
      ...subida, // 6) lançada para cima numa espiral que vai afinando
    ];
    this.curva = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    this.curva.arcLengthDivisions = 12000;
    this.curva.updateArcLengths();
    this.L = this.curva.getLength(); // atualizado em amostrar() depois de arredondar o caminho

    // dados da órbita para a câmera que dá a volta junto
    this.saturno = C.clone();
    // eixo da volta (regra da mão direita: girar em torno dele leva a estrela para a frente)
    this.eixoOrbita = eixo;
    // a câmera fica do lado de "cima" da órbita (o mesmo lado de cima do sistema solar)
    this.cimaOrbita = this.eixoOrbita.clone().multiplyScalar(this.eixoOrbita.dot(this.cimaSistema) >= 0 ? 1 : -1);

    // Marcos que podem ser destacados (Saturno; os outros planetas cuidam de si)
    this.marcos = [{ nome: 'planeta', centro: planeta.centro, raio: planeta.raio }];

    this.amostrar([
      [descida, noBraco[1]],
      [inicioSistema, entrada],
    ]);

    // onde (em s) começa e termina cada trecho
    // (o sistema solar ampliado fica por cima do lugar onde estava a galáxia: cada busca da
    //  galáxia vai só até o marco seguinte)
    const sGalaxia = this.sMaisPerto(antesDoPontinho);
    this.sBracoIni = this.sMaisPerto(noBraco[0], 0, sGalaxia);
    this.sNebulosa = this.sMaisPerto(rota.nebulosa, this.sBracoIni, sGalaxia);
    this.sBracoFim = this.sMaisPerto(noBraco[noBraco.length - 1], this.sNebulosa, sGalaxia);
    this.sBuraco = this.sMaisPerto(voltaBuraco[Math.floor(voltaBuraco.length / 2)], this.sBracoFim, sGalaxia); // meio da volta
    this.sBuracoFim = this.sMaisPerto(voltaBuraco[voltaBuraco.length - 1], this.sBuraco, sGalaxia);
    this.sCurvaFim = sGalaxia;
    this.sLupaIni = this.sMaisPerto(fimAproximacao, this.sCurvaFim);
    this.sLupaFim = this.sMaisPerto(inicioSistema, this.sLupaIni);
    this.sPlanetas = encontros.map((e) => this.sMaisPerto(e.pos, this.sLupaFim));
    this.encontros = encontros.map((e, k) => ({ nome: e.nome, graus: e.graus, s: this.sPlanetas[k] }));
    // (a volta passa duas vezes perto da entrada: procura só logo depois de Mercúrio)
    const sUltimo = this.sPlanetas[this.sPlanetas.length - 1];
    this.sOrbIni = this.sMaisPerto(entrada, sUltimo, sUltimo + 1.6 * encontros.at(-1).pos.distanceTo(entrada) + 40);
    // (as voltas passam várias vezes pelos mesmos lugares: cada busca fica perto do comprimento
    //  esperado, medido nos pontos de controle)
    const comprimento = (lista, ate) => {
      let c = 0;
      for (let k = 1; k <= ate; k++) c += lista[k].distanceTo(lista[k - 1]);
      return c;
    };
    const cVolta1 = comprimento(orbita, orbita.indexOf(primeiraVolta));
    const cVoltas = comprimento(orbita, orbita.length - 1);
    this.sVolta1 = this.sMaisPerto(primeiraVolta, this.sOrbIni + cVolta1 * 0.8, this.sOrbIni + cVolta1 * 1.2);
    this.sOrbFim = this.sMaisPerto(fimVoltas, this.sOrbIni + cVoltas * 0.9, this.sOrbIni + cVoltas * 1.1);
    this.cimaVolta = cimaVolta;

    // quanto a lupa amplia em cada ponto (1/30 antes, 1 depois): no trecho da lupa a estrela
    // está sempre em sol + ampliação x (início do sistema - sol), ou seja, parada no sistema ampliado
    this.ampliacaoEm = new Float32Array(M + 1);
    let maior = this.sigma0;
    const q = new THREE.Vector3();
    for (let i = 0; i <= M; i++) {
      const s = (i / M) * this.L;
      let a = this.sigma0;
      if (s >= this.sLupaFim) a = 1;
      else if (s > this.sLupaIni) a = clamp(this.pontoBase(s, q).distanceTo(this.sol) / this.distanciaLupa, this.sigma0, 1);
      maior = Math.max(maior, a);
      this.ampliacaoEm[i] = s > this.sLupaIni ? maior : this.sigma0;
    }

    this.tabelaDeTempo();
    // onde a câmera de perseguição está (em relação ao sol) quando a lupa começa
    {
      const T = new THREE.Vector3();
      const U = new THREE.Vector3();
      const R = new THREE.Vector3();
      const e = this.pontoBase(this.sLupaIni, new THREE.Vector3());
      this.quadro(this.sLupaIni, T, U, R);
      this.camLupa0 = this._perseguicao(this.sLupaIni, e, T, U, new THREE.Vector3(), new THREE.Vector3()).sub(this.sol);
    }

    // ângulo (em volta de Saturno) onde a câmera começa a acompanhar a volta
    this.inicioCamera = lado.clone().negate().applyAxisAngle(this.eixoOrbita, -ATRASO_CAMERA);

    // Quanto a câmera já girou em volta de Saturno em cada ponto do caminho. Na primeira volta ela
    // gira junto com a estrela (360°); depois a estrela acelera e passa a câmera, que só continua
    // girando devagar (mais 70° até o fim)
    this.anguloCamera = new Float32Array(M + 1);
    const ds = this.L / M;
    let acumulado = 0;
    let depois = 0;
    const devagar = new Float32Array(M + 1);
    for (let i = 0; i <= M; i++) {
      const si = i * ds;
      acumulado += smoothstep(this.sOrbIni - 30, this.sOrbIni + 30, si) * (1 - smoothstep(this.sVolta1 - 40, this.sVolta1 + 20, si)) * ds;
      depois += smoothstep(this.sVolta1 - 40, this.sVolta1 + 60, si) * (1 - smoothstep(this.L - 60, this.L, si)) * ds;
      this.anguloCamera[i] = acumulado;
      devagar[i] = depois;
    }
    for (let i = 0; i <= M; i++) {
      this.anguloCamera[i] = (this.anguloCamera[i] / acumulado) * Math.PI * 2 + (devagar[i] / depois) * THREE.MathUtils.degToRad(70);
    }

    // Espiral de Júpiter a Mercúrio: quanto a câmera já girou em volta da direção da estrela,
    // acelerando e freando aos poucos; e quando ela desce da vista de longe para perto da estrela
    const [, , sJ, sM] = this.sPlanetas;
    // (o giro começa depois que a estrela termina a curva em volta de Júpiter)
    const giroIni = sJ + 35;
    const giroFim = sM - 10;
    const rampa = (giroFim - giroIni) * 0.25;
    this.anguloEspiral = new Float32Array(M + 1);
    acumulado = 0;
    for (let i = 0; i <= M; i++) {
      const si = i * ds;
      acumulado += smoothstep(giroIni, giroIni + rampa, si) * (1 - smoothstep(giroFim - rampa, giroFim, si)) * ds;
      this.anguloEspiral[i] = acumulado;
    }
    for (let i = 0; i <= M; i++) this.anguloEspiral[i] *= (VOLTAS_ESPIRAL * Math.PI * 2) / acumulado;
    this.tEspiralIni = this.tempoDe(sJ) - 0.8;
    this.tEspiralCheia = this.tempoDe(sJ) + 0.3;
  }

  /** s do ponto do caminho mais perto de p (procurando entre `desde` e `ate`). */
  sMaisPerto(p, desde = 0, ate = Infinity) {
    let melhor = desde;
    let menor = Infinity;
    const fim = Math.min(M, Math.floor((ate / this.L) * M));
    for (let i = Math.floor((desde / this.L) * M); i <= fim; i++) {
      const dx = this.P[i * 3] - p.x;
      const dy = this.P[i * 3 + 1] - p.y;
      const dz = this.P[i * 3 + 2] - p.z;
      const d = dx * dx + dy * dy + dz * dz;
      if (d < menor) [menor, melhor] = [d, (i / M) * this.L];
    }
    return melhor;
  }

  /** Proximidade (0..1) de um ponto a um marco. */
  peso(mc, p) {
    return smoothstep(mc.raio * 1.5, mc.raio * 0.55, p.distanceTo(mc.centro));
  }

  /** Índice da amostra mais perto de p (procurando a partir de `desde`). */
  static maisPerto(P, p, desde = 0) {
    let melhor = desde;
    let menor = Infinity;
    for (let i = desde; i <= M; i++) {
      const d = (P[i * 3] - p.x) ** 2 + (P[i * 3 + 1] - p.y) ** 2 + (P[i * 3 + 2] - p.z) ** 2;
      if (d < menor) [menor, melhor] = [d, i];
    }
    return melhor;
  }

  /** trechos: lista de [de, ate] (pontos); entre eles o caminho é arredondado com mais força. */
  amostrar(trechos) {
    // 1) amostra a curva em passos iguais de comprimento
    let P0 = new Float32Array((M + 1) * 3);
    const p = new THREE.Vector3();
    const t = new THREE.Vector3();
    for (let i = 0; i <= M; i++) {
      this.curva.getPointAt(i / M, p);
      P0.set([p.x, p.y, p.z], i * 3);
    }

    // 1b) na galáxia (descida, nebulosa e buraco negro) e no sistema solar (estilingues) arredonda
    //     bem mais, para as ligações virarem curvas abertas, sem quinas
    const kS = Math.max(1, Math.round((LIXA_SISTEMA / this.L) * M));
    const forte = mediaMovel(mediaMovel(P0, kS), kS);
    const peso = new Float32Array(M + 1);
    let desde = 0;
    for (const [de, ate] of trechos) {
      const iA = Viagem.maisPerto(P0, de, desde);
      // (a volta em Saturno passa duas vezes perto da entrada: fica com a primeira passagem)
      let iB = Viagem.maisPerto(P0, ate, iA);
      for (let j = iA; j < iB; j++) {
        if (Math.hypot(P0[j * 3] - ate.x, P0[j * 3 + 1] - ate.y, P0[j * 3 + 2] - ate.z) < 3) {
          iB = j;
          break;
        }
      }
      for (let i = 0; i <= M; i++) peso[i] = Math.max(peso[i], smoothstep(iA, iA + 2 * kS, i) * (1 - smoothstep(iB - 3 * kS, iB - kS, i)));
      desde = iB;
    }
    const P1 = new Float32Array(P0.length);
    for (let i = 0; i <= M; i++) {
      for (let c = 0; c < 3; c++) P1[i * 3 + c] = lerp(P0[i * 3 + c], forte[i * 3 + c], peso[i]);
    }
    P0 = P1;

    // 2) "lixa" o caminho: média móvel das posições (duas passadas), arredondando qualquer quina.
    //    Perto do começo e do fim o efeito some, para a estrela sair e chegar exatamente nos pontos.
    const k = Math.max(1, Math.round((LIXA / this.L) * M));
    let Q = P0;
    for (let passada = 0; passada < 2; passada++) Q = mediaMovel(Q, k);
    const Ps = new Float32Array((M + 1) * 3);
    for (let i = 0; i <= M; i++) {
      const w = smoothstep(0, 1.2 * k, i) * smoothstep(M, M - 1.2 * k, i);
      for (let c = 0; c < 3; c++) Ps[i * 3 + c] = lerp(P0[i * 3 + c], Q[i * 3 + c], w);
    }

    // 3) reamostra o caminho lixado em passos iguais de comprimento
    const acum = new Float64Array(M + 1);
    for (let i = 1; i <= M; i++) {
      acum[i] = acum[i - 1] + Math.hypot(Ps[i * 3] - Ps[i * 3 - 3], Ps[i * 3 + 1] - Ps[i * 3 - 2], Ps[i * 3 + 2] - Ps[i * 3 - 1]);
    }
    this.L = acum[M];
    this.P = new Float32Array((M + 1) * 3);
    let j = 0;
    for (let i = 0; i <= M; i++) {
      const alvo = (i / M) * this.L;
      while (j < M - 1 && acum[j + 1] < alvo) j++;
      const f = (alvo - acum[j]) / (acum[j + 1] - acum[j] || 1);
      for (let c = 0; c < 3; c++) this.P[i * 3 + c] = lerp(Ps[j * 3 + c], Ps[(j + 1) * 3 + c], f);
    }

    // direção do movimento em cada ponto, suavizada: orienta a câmera de perseguição
    const T = new Float32Array((M + 1) * 3);
    for (let i = 0; i <= M; i++) {
      const a = Math.max(0, i - 1);
      const b = Math.min(M, i + 1);
      t.set(this.P[b * 3] - this.P[a * 3], this.P[b * 3 + 1] - this.P[a * 3 + 1], this.P[b * 3 + 2] - this.P[a * 3 + 2]).normalize();
      T.set([t.x, t.y, t.z], i * 3);
    }
    this.T = suavizarDirecoes(T, Math.max(1, Math.round((SUAVIZAR / this.L) * M)));

    // "Cima" da câmera de perseguição: nivelado com o horizonte
    this.U = new Float32Array((M + 1) * 3);
    const cima = new THREE.Vector3(0, 1, 0);
    const u = new THREE.Vector3();
    for (let i = 0; i <= M; i++) {
      t.fromArray(this.T, i * 3);
      u.copy(cima).addScaledVector(t, -cima.dot(t)).normalize();
      this.U.set([u.x, u.y, u.z], i * 3);
    }
  }

  /** Velocidade relativa em cada ponto do caminho. */
  fatorVelocidade(s, ampliacao) {
    let f = 1;
    // na galáxia bem mais devagar (para dar tempo de ver), ainda mais na nebulosa e no buraco negro
    f *= lerp(0.3, 1, smoothstep(this.sCurvaFim - 30, this.sCurvaFim + 40, s));
    f *= 1 - 0.3 * Math.exp(-(((s - this.sNebulosa) / 45) ** 2));
    f *= 1 - 0.2 * Math.exp(-(((s - this.sBuraco) / 40) ** 2));
    if (s < this.sLupaIni) {
      // voa até o pontinho do braço freando (quanto mais perto, mais devagar)
      const x = clamp((this.sLupaIni - s) / (this.sLupaIni - this.sCurvaFim));
      if (s > this.sCurvaFim) f *= lerp(FATOR_LUPA * this.sigma0, 0.55, Math.pow(x, 0.3));
    } else if (s < this.sLupaFim) {
      // na lupa a velocidade cresce junto com a ampliação (o zoom parece constante)
      f = lerp(FATOR_LUPA * ampliacao, 1, smoothstep(0.55, 1, ampliacao));
    } else {
      // no sistema solar cada estilingue dá um empurrão perto do planeta
      for (const sp of this.sPlanetas) f *= 1 + 0.18 * Math.exp(-(((s - sp) / 22) ** 2));
      // de Júpiter a Mercúrio mais devagar: a câmera vem junto, girando em volta da estrela
      const [, , sJ, sM] = this.sPlanetas;
      f *= lerp(1, 0.45, smoothstep(sJ - 40, sJ + 20, s) * (1 - smoothstep(sM - 20, sM + 30, s)));
      // as voltas em Saturno começam devagar e vão acelerando...
      f *= lerp(1, 0.66, smoothstep(this.sOrbIni - 60, this.sOrbIni, s));
      const acel = smoothstep(this.sOrbIni + (this.sVolta1 - this.sOrbIni) * 0.3, this.sOrbFim, s);
      f *= 1 + ACELERACAO_SATURNO * acel * acel;
      // ...e na subida em espiral ela vai freando até quase parar lá em cima
      f *= lerp(1, 0.1, Math.pow(smoothstep(this.sOrbFim, this.L, s), 0.8));
    }
    // começo: sai do repouso
    f *= lerp(0.06, 1, smoothstep(0, 30, s));
    return f;
  }

  tabelaDeTempo() {
    this.tempo = new Float64Array(M + 1);
    this.fator = new Float32Array(M + 1);
    const ds = this.L / M;
    for (let i = 0; i <= M; i++) this.fator[i] = this.fatorVelocidade(i * ds, this.ampliacaoEm[i]);
    for (let i = 1; i <= M; i++) {
      this.tempo[i] = this.tempo[i - 1] + ds / ((this.fator[i - 1] + this.fator[i]) / 2);
    }
    const escala = this.duracao / this.tempo[M];
    for (let i = 0; i <= M; i++) this.tempo[i] *= escala;
  }

  _interp(arr, s, out, normalizar) {
    const x = clamp(s / this.L, 0, 1) * M;
    const i = Math.min(M - 1, Math.floor(x));
    const f = x - i;
    const a = i * 3;
    const b = a + 3;
    out.set(lerp(arr[a], arr[b], f), lerp(arr[a + 1], arr[b + 1], f), lerp(arr[a + 2], arr[b + 2], f));
    return normalizar ? out.normalize() : out;
  }

  _interp1(arr, s) {
    const x = clamp(s / this.L, 0, 1) * M;
    const i = Math.min(M - 1, Math.floor(x));
    return lerp(arr[i], arr[i + 1], x - i);
  }

  pontoBase(s, out) {
    return this._interp(this.P, s, out, false);
  }

  /** Orientação da câmera de perseguição em s (frente suavizada, cima e direita). */
  quadro(s, T, U, R) {
    this._interp(this.T, s, T, true);
    this._interp(this.U, s, U, true);
    U.addScaledVector(T, -U.dot(T)).normalize();
    R.crossVectors(T, U);
  }

  /** Distância percorrida (s) depois de `t` segundos de viagem. */
  sEm(t) {
    const tab = this.tempo;
    if (t <= 0) return 0;
    if (t >= tab[M]) return this.L;
    let lo = 0;
    let hi = M;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (tab[mid] <= t) lo = mid;
      else hi = mid;
    }
    const f = (t - tab[lo]) / (tab[hi] - tab[lo]);
    return ((lo + f) / M) * this.L;
  }

  /** Em quantos segundos de viagem a estrela chega em s. */
  tempoDe(s) {
    return this._interp1(this.tempo, s);
  }

  /** Quanto a lupa está ampliando no instante t da viagem (1/30 antes da lupa, 1 depois). */
  ampliacao(t) {
    return this._interp1(this.ampliacaoEm, this.sEm(t));
  }

  /** Posição da estrela no instante t da viagem. */
  estrelaEm(t, out) {
    return this.pontoBase(this.sEm(t), out);
  }

  /** Um s qualquer antes da lupa (para espalhar poeira onde a câmera passa perto). */
  sAleatorio(rand) {
    return rand() * (this.sLupaIni - 30);
  }

  /**
   * Câmera. Mistura três "gruas":
   *  - perseguição: atrás da estrela, no braço da galáxia;
   *  - de longe: recua até ver a galáxia inteira, fica parada durante a lupa e depois mostra o
   *    sistema solar inteiro, girando devagar em volta dele;
   *  - Saturno: por fora da volta, dando a volta inteira junto com a estrela. Depois da volta
   *    ela só se aproxima da estrela, sem girar, para a explosão final.
   * Preenche pos, alvo e cima; devolve o FOV.
   */
  /**
   * Câmera de perseguição em s. Na descida fica mais alta e afastada, olhando também para o centro
   * da galáxia (para ver o disco inteiro); no braço, mais perto (no meio das estrelas); no buraco
   * negro vai para fora da curva e para cima, olhando entre a estrela e o buraco (disco de acreção).
   */
  _perseguicao(s, estrela, T, U, pos, alvo) {
    const noBraco = smoothstep(this.sBracoIni - 70, this.sBracoIni + 30, s);
    const noBuraco = smoothstep(this.sBracoFim - 40, this.sBracoFim + 30, s) * (1 - smoothstep(this.sBuracoFim - 45, this.sBuracoFim + 5, s));
    const fora = (this._fo ??= new THREE.Vector3()).subVectors(estrela, this.buraco);
    fora.addScaledVector(this.normalGalaxia, -fora.dot(this.normalGalaxia)).normalize();
    pos
      .copy(estrela)
      .addScaledVector(T, -lerp(lerp(32, 18, noBraco), 20, noBuraco))
      .addScaledVector(U, lerp(lerp(16, 6, noBraco), 14, noBuraco))
      .addScaledVector(fora, 18 * noBuraco);
    // (olha um pouco além da estrela, na direção do centro: a estrela continua no quadro)
    alvo.subVectors(this.centroGalaxia, estrela).setLength(24 * (1 - noBraco));
    alvo.add(estrela).lerp(this.buraco, 0.4 * noBuraco);
    return pos;
  }

  /** Quanto da lupa já passou em s (0 antes, 1 depois), com começo e fim suaves. */
  progressoLupa(s) {
    const a = this._interp1(this.ampliacaoEm, s);
    const u = clamp(Math.log(a / this.sigma0) / Math.log(1 / this.sigma0));
    return u * u * u * (u * (u * 6 - 15) + 10);
  }

  camera(t, pos, alvo, cima) {
    const s = this.sEm(t);
    const estrela = this.pontoBase(s, (this._B ??= new THREE.Vector3()));
    const [, , sJupiter, sMercurio] = this.sPlanetas;

    // --- perseguição
    const T = (this._cT ??= new THREE.Vector3());
    const U = (this._cU ??= new THREE.Vector3());
    const R = (this._cR ??= new THREE.Vector3());
    this.quadro(s, T, U, R);
    const pPers = this._perseguicao(s, estrela, T, U, (this._pP ??= new THREE.Vector3()), (this._aP ??= new THREE.Vector3()));
    const aPers = this._aP;

    // --- de longe (sistema solar inteiro, girando devagar em volta dele)
    const andamento = smoothstep(this.sLupaFim - 40, sJupiter, s);
    const pLonge = (this._pL ??= new THREE.Vector3())
      .subVectors(this.cameraSistema, this.sol)
      .applyAxisAngle(this.cimaSistema, DERIVA_CAMERA * andamento)
      .multiplyScalar(lerp(1, 0.9, andamento))
      .add(this.sol);
    // --- a lupa: a câmera não recua antes; continua atrás da estrela até o pontinho e, enquanto
    //     tudo é ampliado, vai em arco em volta do sol até a posição de onde se vê o sistema inteiro
    const zoom = this.progressoLupa(s);
    const pLupa = (this._pZ ??= new THREE.Vector3()).copy(this.sol).add(this.camLupa0);
    const aLonge = (this._aL ??= new THREE.Vector3()).copy(this.sol).lerp(estrela, lerp(1, 0.35, zoom));

    // --- espiral (de Júpiter a Mercúrio): atrás da estrela, girando em volta da direção dela
    const fi = this._interp1(this.anguloEspiral, s);
    const pEsp = (this._pE ??= new THREE.Vector3())
      .copy(estrela)
      .addScaledVector(T, -ESPIRAL_ATRAS)
      .addScaledVector(U, Math.cos(fi) * ESPIRAL_RAIO)
      .addScaledVector(R, Math.sin(fi) * ESPIRAL_RAIO);
    const aEsp = (this._aE ??= new THREE.Vector3()).copy(estrela).addScaledVector(T, 6);

    // --- Saturno: a câmera dá a primeira volta junto com a estrela; quando ela acelera, a câmera
    //     sobe e se afasta para ver as voltas inteiras; na subida em espiral olha para cima, subindo
    //     e chegando mais perto, até a estrela lá no alto
    const ang = this._interp1(this.anguloCamera, s);
    const dirCam = (this._dc ??= new THREE.Vector3()).copy(this.inicioCamera).applyAxisAngle(this.eixoOrbita, ang);
    const abre = smoothstep(this.sVolta1 - 60, this.sVolta1 + 120, s);
    const sobe = smoothstep(this.sOrbFim - 30, this.L, s);
    const altura = this.cimaVolta.dot((this._h ??= new THREE.Vector3()).subVectors(estrela, this.saturno));
    const pSat = (this._pS ??= new THREE.Vector3())
      .copy(this.saturno)
      .addScaledVector(dirCam, lerp(lerp(RAIO_CAMERA, 125, abre), 85, sobe))
      .addScaledVector(this.cimaOrbita, lerp(20, 55, abre) * (1 - sobe))
      // (fica mais baixa que a estrela, olhando para cima: as voltas da espiral aparecem abertas)
      .addScaledVector(this.cimaVolta, Math.max(0, altura) * 0.2 * sobe);
    const aSat = (this._aS ??= new THREE.Vector3()).lerpVectors(this.saturno, estrela, lerp(lerp(0.3, 0.12, abre), 1, sobe));
    const perto = pSat;

    // mistura entre as câmeras, sempre em arco em volta da estrela
    // (andar em linha reta faria a câmera, quando está perto da estrela, girar de repente)
    const wEsp = smoothstep(this.tEspiralIni, this.tEspiralCheia, t);
    const wSat = smoothstep(sMercurio + 10, this.sOrbIni + 30, s);
    const p1 = zoom <= 0 ? pPers : this._emArco(this.sol, pLupa, pLonge, zoom, (this._p1 ??= new THREE.Vector3()));
    const p2 = this._emArco(estrela, p1, pEsp, wEsp, (this._p2 ??= new THREE.Vector3()));
    this._emArco(estrela, p2, perto, wSat, pos);
    alvo.copy(aPers).lerp(aLonge, zoom).lerp(aEsp, wEsp).lerp(aSat, wSat);
    cima.copy(U).lerp(this.cimaSistema, zoom).lerp(U, wEsp).lerp(this.cimaOrbita, wSat).normalize();
    return 60;
  }

  /** Nas voltas rápidas em Saturno o rastro fica longo (0..1): aparecem várias voltas ao mesmo tempo. */
  rastroLongo(t) {
    const s = this.sEm(t);
    return smoothstep(this.sVolta1 - 60, this.sVolta1 + 40, s) * (1 - smoothstep(this.sOrbFim + 40, this.L, s));
  }

  /** Quanto a tela treme no instante t da viagem: cresce com a velocidade nas voltas em Saturno. */
  tremor(t) {
    const s = this.sEm(t);
    const acel = smoothstep(this.sVolta1 - 80, this.sOrbFim, s);
    return TREMOR_SATURNO * acel * acel * (1 - 0.75 * smoothstep(this.sOrbFim, this.L, s));
  }

  /** Mistura duas posições de câmera girando em volta da estrela (e afastando/aproximando aos poucos). */
  _emArco(estrela, pA, pB, w, out) {
    if (w <= 0) return out.copy(pA);
    if (w >= 1) return out.copy(pB);
    const dA = (this._ea ??= new THREE.Vector3()).subVectors(pA, estrela);
    const dB = (this._eb ??= new THREE.Vector3()).subVectors(pB, estrela);
    const raio = Math.pow(dA.length(), 1 - w) * Math.pow(dB.length(), w);
    const z = (this._ez ??= new THREE.Vector3(0, 0, 1));
    const qA = (this._qa ??= new THREE.Quaternion()).setFromUnitVectors(z, dA.normalize());
    const qB = (this._qb ??= new THREE.Quaternion()).setFromUnitVectors(z, dB.normalize());
    return out.set(0, 0, 1).applyQuaternion(qA.slerp(qB, w)).multiplyScalar(raio).add(estrela);
  }

  /**
   * Inclinação dos anéis de Saturno (no mundo): quase no plano da volta (15° fora dele). Como a
   * câmera dá a volta inteira um pouco acima desse plano, os anéis aparecem abertos o tempo todo.
   */
  normalDosAneis() {
    return this.cimaOrbita.clone().multiplyScalar(Math.cos(0.26)).addScaledVector(this.inicioCamera, Math.sin(0.26)).normalize();
  }

  /** Quanto cada marco deve brilhar agora (estrela perto = destaque). */
  destaques(estrela) {
    const out = {};
    for (const mc of this.marcos) out[mc.nome] = smoothstep(mc.raio * 1.3, mc.raio * 0.35, estrela.distanceTo(mc.centro));
    return out;
  }

  /** Direção do movimento no fim da viagem (para a estrela continuar deslizando no final). */
  tangenteFinal(out) {
    const a = this.pontoBase(this.L, new THREE.Vector3());
    return this.pontoBase(this.L - 5, out).sub(a).negate().normalize();
  }
}
