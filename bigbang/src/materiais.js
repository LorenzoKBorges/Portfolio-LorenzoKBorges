import * as THREE from 'three';

// Uniformes compartilhados por todos os materiais de partículas.
// uEscalaPixel converte tamanho no mundo em pixels (depende da altura da tela e do FOV).
export const globais = {
  uEscalaPixel: { value: 600 },
  camPos: new THREE.Vector3(), // posição da câmera (para esmaecer sprites grandes muito perto dela)
};

/** 0 quando a câmera está dentro do sprite, 1 quando está longe o bastante. */
export function longeDaCamera(s) {
  const d = s.getWorldPosition(_v).distanceTo(globais.camPos);
  const r = s.scale.x;
  return Math.min(1, Math.max(0, (d - r * 0.15) / (r * 0.55)));
}
const _v = new THREE.Vector3();

const FRAG_REDONDO = /* glsl */ `
  varying vec3 vCor;
  varying float vAlfa;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = dot(c, c) * 4.0;              // 0 no centro, 1 na borda
    if (d > 1.0) discard;
    float a = exp(-d * 5.0) * 0.75 + exp(-d * 30.0) * 0.6;
    a *= 1.0 - d;
    gl_FragColor = vec4(vCor * a * vAlfa, 1.0);
  }
`;

// Estrela com raios em cruz, desenhada no próprio shader (sem textura).
const FRAG_ESTRELA = /* glsl */ `
  varying vec3 vCor;
  varying float vAlfa;
  void main() {
    vec2 c = (gl_PointCoord - 0.5) * 2.0;
    float r = length(c);
    float nucleo = exp(-r * r * 40.0) + 0.35 * exp(-r * r * 9.0);
    float cruz = exp(-abs(c.x) * 45.0) * (1.0 - abs(c.y)) + exp(-abs(c.y) * 45.0) * (1.0 - abs(c.x));
    float a = nucleo + cruz * 0.55;
    a *= 1.0 - smoothstep(0.85, 1.0, r * 0.75);
    gl_FragColor = vec4(vCor * a * vAlfa, 1.0);
  }
`;

// Final comum dos vertex shaders de pontos: projeta, calcula o tamanho em pixels
// e esconde partículas grudadas na câmera (evita "borrões" gigantes).
const VERT_FIM = /* glsl */ `
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  float prof = -mv.z;
  float px = tam * uEscalaPixel / max(prof, 0.01);
  alfa *= smoothstep(uPerto * 0.2, uPerto, prof);
  alfa *= clamp(px / 1.6, 0.0, 1.0);
  alfa *= 1.0 - smoothstep(120.0, 260.0, px);
  gl_PointSize = clamp(px, 1.6, 260.0);
  vCor = cor;
  vAlfa = alfa;
`;

/**
 * Material de pontos com brilho aditivo.
 * `corpo` é GLSL que precisa preencher: vec3 pos, vec3 cor, float tam (mundo), float alfa.
 */
export function materialPontos({ uniforms = {}, cabecalho = '', corpo, forma = 'redondo', perto = 2.5 }) {
  const u = { ...uniforms, uEscalaPixel: globais.uEscalaPixel, uPerto: { value: perto } };
  return new THREE.ShaderMaterial({
    uniforms: u,
    vertexShader: /* glsl */ `
      uniform float uEscalaPixel;
      uniform float uPerto;
      varying vec3 vCor;
      varying float vAlfa;
      ${cabecalho}
      void main() {
        vec3 pos; vec3 cor; float tam; float alfa;
        ${corpo}
        ${VERT_FIM}
      }
    `,
    fragmentShader: forma === 'estrela' ? FRAG_ESTRELA : FRAG_REDONDO,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

/** Material de linhas aditivas. `corpo` preenche vec3 pos, vec3 cor, float alfa. */
export function materialLinhas({ uniforms = {}, cabecalho = '', corpo }) {
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      varying vec3 vCor;
      varying float vAlfa;
      ${cabecalho}
      void main() {
        vec3 pos; vec3 cor; float alfa;
        ${corpo}
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        vCor = cor;
        vAlfa = alfa;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vCor;
      varying float vAlfa;
      void main() { gl_FragColor = vec4(vCor * vAlfa, 1.0); }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

/** Sprite de brilho aditivo (sempre virado para a câmera). */
export function sprite(mapa, cor, escala = 1, opacidade = 1) {
  const m = new THREE.SpriteMaterial({
    map: mapa,
    color: new THREE.Color(cor),
    transparent: true,
    opacity: opacidade,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const s = new THREE.Sprite(m);
  s.scale.setScalar(escala);
  return s;
}

/** Cria um BufferGeometry a partir de um mapa { nome: [array, tamanhoDoItem] }. */
export function geometria(atributos, quantidade) {
  const g = new THREE.BufferGeometry();
  for (const [nome, [arr, n]] of Object.entries(atributos)) {
    g.setAttribute(nome, new THREE.BufferAttribute(arr, n));
  }
  if (!atributos.position) {
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(quantidade * 3), 3));
  }
  // As posições reais são calculadas no shader, então desligamos o descarte por frustum.
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);
  return g;
}

/**
 * Rocha irregular: uma esfera facetada com calombos e amassados suaves.
 * O deslocamento depende só da direção do vértice, então as faces continuam coladas.
 */
export function geometriaRocha(rand) {
  const geo = new THREE.IcosahedronGeometry(1, 2);
  const bossas = Array.from({ length: 10 }, () => {
    const z = rand() * 2 - 1;
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(1 - z * z);
    return { d: new THREE.Vector3(r * Math.cos(a), z, r * Math.sin(a)), s: (rand() - 0.55) * 0.55, k: 2 + rand() * 5 };
  });
  const esticar = new THREE.Vector3(1 + rand() * 0.5, 0.65 + rand() * 0.3, 0.85 + rand() * 0.3);
  const p = geo.attributes.position;
  const v = new THREE.Vector3();
  const n = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    n.fromBufferAttribute(p, i).normalize();
    let r = 1 + 0.035 * Math.sin(n.x * 11 + n.y * 7) * Math.sin(n.z * 9 - n.y * 5);
    for (const b of bossas) r += b.s * Math.exp(-n.distanceToSquared(b.d) * b.k);
    v.copy(n).multiplyScalar(r).multiply(esticar);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

/** THREE.Points com frustum culling desligado. */
export function pontos(geo, mat) {
  const p = new THREE.Points(geo, mat);
  p.frustumCulled = false;
  return p;
}
