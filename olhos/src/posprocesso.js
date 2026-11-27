import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

/**
 * Cor final da imagem: escurecer (1 = sem mudança; maior =
 * mais escuro), saturação (1 = sem mudança) e quanto puxa para o roxo (0 = nada).
 */
export const COR = { escurecer: 1.35, saturacao: 1.4, roxo: 1 };

const VERT = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';

/** Configura o renderizador com o mesmo tom de cor do Big Bang. */
export function prepararRenderizador(renderer) {
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor('#050009');
}

/**
 * Pós-processamento comum: limita o brilho, brilho difuso (bloom), tom de cor e a cor final
 * (mais escuro, roxos mais fortes). Devolve { composer, bloom }.
 */
export function criarPosProcesso(renderer, cena, camera, { bloom: forcaBloom = [0.75, 0.45, 0.18] } = {}) {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(cena, camera));
  // Limita o brilho antes do bloom: pontos muito estourados viram "quadrados" no desfoque.
  composer.addPass(
    new ShaderPass({
      uniforms: { tDiffuse: { value: null }, uMax: { value: 2.4 } },
      vertexShader: VERT,
      fragmentShader: `
        uniform sampler2D tDiffuse; uniform float uMax; varying vec2 vUv;
        void main() {
          vec3 c = texture2D(tDiffuse, vUv).rgb;
          float m = max(max(c.r, c.g), c.b);
          if (m > uMax) c *= uMax / m;
          gl_FragColor = vec4(c, 1.0);
        }`,
    })
  );
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), ...forcaBloom);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  // Cor final: tudo mais escuro e com roxos mais fortes (ajuste em COR)
  composer.addPass(
    new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        uGama: { value: COR.escurecer },
        uSat: { value: COR.saturacao },
        uRoxo: { value: COR.roxo },
      },
      vertexShader: VERT,
      fragmentShader: `
        uniform sampler2D tDiffuse; uniform float uGama; uniform float uSat; uniform float uRoxo; varying vec2 vUv;
        void main() {
          vec3 c = texture2D(tDiffuse, vUv).rgb;
          float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
          // roxos mais fortes: mais saturação, e menos verde nos meios-tons (o verde deixa o roxo
          // acinzentado); os brancos (núcleo da estrela, clarões) continuam brancos
          c = max(mix(vec3(l), c, uSat), 0.0);
          c *= mix(vec3(1.0 + 0.04 * uRoxo, 1.0 - 0.2 * uRoxo, 1.0 + 0.08 * uRoxo), vec3(1.0), smoothstep(0.6, 1.0, l));
          // mais escuro: afunda as sombras e os meios-tons, sem apagar os brilhos
          c = pow(c, vec3(uGama));
          gl_FragColor = vec4(c, 1.0);
        }`,
    })
  );
  return { composer, bloom };
}
