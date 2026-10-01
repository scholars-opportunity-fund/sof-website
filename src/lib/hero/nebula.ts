import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// A field of drifting particles behind the opening line, in the fund's own colours.
//
// The motion is computed in the vertex shader, not in JavaScript: a CPU loop over tens of thousands of
// particles costs a frame budget several times over and allocates its way into the garbage collector, which
// is what makes most versions of this effect stutter. Here the only thing sent per frame is a clock, so the
// cost is the GPU drawing points — a field this size runs at frame rate on a laptop and leaves the main
// thread free for the page. Nothing renders while it is off screen, in a hidden tab, or under reduced motion.

const SKY = new THREE.Color('#7BB8D6'), COPPER = new THREE.Color('#A0755A'), DEEP = new THREE.Color('#2E4C6B');
// GLSL ES has no implicit int-to-float conversion, so every value written into the shader goes through
// this: an interpolated `16` is a compile error, and a failed compile is a stage with nothing on it.
const glsl = (value: number) => value.toFixed(4);

const SETTINGS = {
  // Particles, and the cube they are seeded in. Phones take a third of the count: the look survives it,
  // a mid-range phone GPU does not survive the full field.
  count: 46000, mobileCount: 15000, box: 5.2,
  // Point size in pixels at the field's resting depth, the spread of sizes across it, and how far the
  // drift carries a particle. Anything under a pixel is clamped to one by the driver, which is the
  // difference between a field of dust and a field with cores and halos.
  size: 2.0, sizeVariance: .62, amplitude: .62,
  // How fast the flow field evolves, and how tightly it curls.
  speed: .085, scale: .42,
  // How far the pointer pushes particles aside, and how close it has to be to do it.
  repulsion: .55, reach: 1.9,
  // How far the camera leans toward the pointer.
  parallax: .34,
  bloom: { strength: .5, radius: .45, threshold: .16 },
  // The transition out of the hero: the field draws into a core, then throws itself outward past the camera.
  gather: { core: .26, spread: .34 }, burst: { distance: 16, lift: 2.4 },
} as const;

// Simplex noise, Ashima Arts / Stefan Gustavson (MIT). Three samples of it, decorrelated, make the flow
// field: cheaper than true curl noise — which needs eighteen — and at this scale it reads the same.
const NOISE = `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }
`;

const VERTEX = `
  uniform float uTime, uSize, uRatio, uAmplitude, uScale, uRepulsion, uReach, uReveal, uGather, uBurst;
  uniform vec3 uMouse;
  attribute float aTint, aScale, aPhase;
  varying vec3 vColor;
  varying float vAlpha;
  ${NOISE}
  void main() {
    vec3 seed = position;
    float t = uTime;
    // The flow field: a slow, divergence-light drift that never repeats and never sends a particle far
    // from where it was seeded, so the field breathes in place instead of migrating off screen.
    vec3 flow = vec3(
      snoise(seed * uScale + vec3(0.0, 0.0, t)),
      snoise(seed.yzx * uScale + vec3(t, 0.0, 0.0)),
      snoise(seed.zxy * uScale + vec3(0.0, t, 0.0))
    );
    vec3 drifted = seed + flow * uAmplitude;
    // Scrolling out of the hero draws the whole field into a core: each particle keeps its bearing but
    // gives up its distance, so the cloud contracts rather than collapsing to a single dot.
    vec3 bearing = normalize(seed + vec3(0.0001));
    vec3 core = bearing * (${glsl(SETTINGS.gather.core)} + aScale * ${glsl(SETTINGS.gather.spread)});
    drifted = mix(drifted, core, uGather);
    // Then it throws itself outward, accelerating, and the next screen is behind it.
    float thrown = uBurst * uBurst;
    drifted += bearing * thrown * ${glsl(SETTINGS.burst.distance)} * (0.55 + aScale);
    drifted.z += thrown * ${glsl(SETTINGS.burst.lift)};
    // The pointer pushes the field aside, falling off with the square of the distance.
    vec2 away = drifted.xy - uMouse.xy;
    float distance = length(away);
    drifted.xy += normalize(away + 1e-5) * uRepulsion / (1.0 + distance * distance / (uReach * uReach)) * uMouse.z;
    vec4 viewPosition = modelViewMatrix * vec4(drifted, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    // Sized in pixels, scaled by how near the particle is: the resting field sits five units out, so that
    // distance is the one the configured size describes.
    gl_PointSize = uSize * aScale * uRatio * (5.0 / -viewPosition.z);
    // Warm a minority of the field to copper and let the rest run from sky to a deep blue, so the colour
    // reads as one palette rather than a rainbow. Depth and a slow pulse carry the rest of the variation.
    vColor = mix(mix(vec3(${glsl(DEEP.r)}, ${glsl(DEEP.g)}, ${glsl(DEEP.b)}), vec3(${glsl(SKY.r)}, ${glsl(SKY.g)}, ${glsl(SKY.b)}), smoothstep(0.0, 0.55, aTint)),
                 vec3(${glsl(COPPER.r)}, ${glsl(COPPER.g)}, ${glsl(COPPER.b)}), smoothstep(0.82, 1.0, aTint));
    // Nearer particles burn brighter, far ones sink into the field. The camera sits five units out, so
    // the range is measured from there rather than from the origin.
    float depth = clamp(1.0 - (-viewPosition.z - 2.4) / 7.0, 0.38, 1.0);
    // Brighter as the field gathers — the core is what the burst comes out of — and gone by the end of it.
    float fade = 1.0 - smoothstep(0.3, 0.95, uBurst);
    // Additive blending stacks: held this low, the overlaps read as the field's own colour rather than
    // burning through to white, and the line in front of it stays legible.
    vAlpha = uReveal * depth * fade * (0.34 + 0.16 * sin(t * 6.0 + aPhase)) * (1.0 + uGather * 0.35);
  }
`;

const FRAGMENT = `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    // A soft round sprite. Squaring the falloff gives the point a core and a halo, which is what the
    // bloom pass then picks up; a hard circle blooms like a sticker.
    float edge = 1.0 - smoothstep(0.1, 0.5, length(gl_PointCoord - 0.5));
    if (edge < 0.01) discard;
    gl_FragColor = vec4(vColor, edge * edge * vAlpha);
  }
`;

export type Nebula = ReturnType<typeof createNebula>;

export function createNebula(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
  renderer.setClearColor(0x0b1221, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1, .1, 100);
  camera.position.z = 5;

  const phone = innerWidth < 900 || matchMedia('(pointer: coarse)').matches;
  const count = phone ? SETTINGS.mobileCount : SETTINGS.count;
  const positions = new Float32Array(count * 3);
  const tints = new Float32Array(count), scales = new Float32Array(count), phases = new Float32Array(count);
  for (let index = 0; index < count; index++) {
    // Seeded through a sphere, biased toward the middle, so the field has a bright core and thins out
    // at the edges rather than ending on the flat wall of points a uniform cube gives.
    const radius = (SETTINGS.box / 2) * Math.pow(Math.random(), .55);
    const theta = Math.random() * Math.PI * 2;
    const height = Math.random() * 2 - 1;
    const ring = Math.sqrt(1 - height * height);
    positions[index * 3] = Math.cos(theta) * ring * radius * 1.25;
    positions[index * 3 + 1] = height * radius * .62;
    positions[index * 3 + 2] = Math.sin(theta) * ring * radius;
    tints[index] = Math.random();
    scales[index] = 1 - Math.random() * SETTINGS.sizeVariance;
    phases[index] = Math.random() * Math.PI * 2;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aTint', new THREE.BufferAttribute(tints, 1));
  geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

  const uniforms = {
    uTime: { value: 0 }, uSize: { value: SETTINGS.size }, uRatio: { value: 1 },
    uAmplitude: { value: SETTINGS.amplitude }, uScale: { value: SETTINGS.scale },
    uRepulsion: { value: SETTINGS.repulsion }, uReach: { value: SETTINGS.reach },
    // Rises from zero on the first frames, so the field gathers rather than appearing.
    uReveal: { value: 0 },
    // Driven by the scroll out of the hero: the field contracts, then is thrown outward.
    uGather: { value: 0 }, uBurst: { value: 0 },
    // x and y are the pointer in world units; z fades the whole effect out when the pointer leaves.
    uMouse: { value: new THREE.Vector3(0, 0, 0) },
  };
  const material = new THREE.ShaderMaterial({
    uniforms, vertexShader: VERTEX, fragmentShader: FRAGMENT,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false,
  });
  const points = new THREE.Points(geometry, material);
  // The field is a sphere of fixed extent; without this, three culls it as the drift carries points
  // past the bounds it computed once at startup.
  points.frustumCulled = false;
  scene.add(points);

  // Bloom is a pair of full-screen passes, so it runs at a lower pixel ratio than the page and is dropped
  // on phones altogether. The field is additive, which already glows; bloom only softens the cores.
  const composer = phone ? null : new EffectComposer(renderer);
  if (composer) {
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), SETTINGS.bloom.strength, SETTINGS.bloom.radius, SETTINGS.bloom.threshold));
  }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = new THREE.Vector2(0, 0);
  const aim = new THREE.Vector3(0, 0, 0);
  let frame = 0, disposed = false, visible = true, started = 0, width = 0, height = 0;

  function resize() {
    const box = canvas.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const ratio = Math.min(devicePixelRatio || 1, phone ? 1.25 : 1.75);
    if (box.width === width && box.height === height && renderer.getPixelRatio() === ratio) return;
    width = box.width; height = box.height;
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    uniforms.uRatio.value = ratio;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    // Half-resolution bloom: the glow is low-frequency, so nobody sees the difference and it costs a quarter.
    composer?.setPixelRatio(ratio * .6);
    composer?.setSize(width, height);
  }

  function render(now: number) {
    frame = 0;
    if (disposed) return;
    resize();
    started ||= now;
    const seconds = (now - started) / 1000;
    uniforms.uTime.value = reduced.matches ? 0 : seconds * SETTINGS.speed;
    uniforms.uReveal.value = Math.min(1, seconds / 1.6);
    // The pointer, and the camera leaning after it, are eased rather than followed, so a flick of the
    // mouse reads as the field turning its head.
    aim.lerp(uniforms.uMouse.value.set(pointer.x * SETTINGS.box * .5, pointer.y * SETTINGS.box * .32, aim.z), 1);
    uniforms.uMouse.value.copy(aim);
    camera.position.x += (pointer.x * SETTINGS.parallax - camera.position.x) * .025;
    camera.position.y += (pointer.y * SETTINGS.parallax - camera.position.y) * .025;
    // The camera leans in as the field gathers and is overtaken as it bursts, so the particles pass the viewer.
    camera.position.z = 5 - uniforms.uGather.value * .9 - uniforms.uBurst.value * 1.8;
    camera.lookAt(0, 0, 0);
    if (composer) composer.render(); else renderer.render(scene, camera);
    // Reduced motion gets the field drawn once, at rest, and then nothing.
    if (reduced.matches && uniforms.uReveal.value >= 1) return;
    frame = requestAnimationFrame(render);
  }

  const wake = () => { if (!disposed && visible && !document.hidden && !frame) frame = requestAnimationFrame(render); };
  const sleep = () => { cancelAnimationFrame(frame); frame = 0; };

  const onPointer = (event: PointerEvent) => {
    const box = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - box.left) / box.width) * 2 - 1;
    pointer.y = -((event.clientY - box.top) / box.height) * 2 + 1;
    aim.z = 1;
    wake();
  };
  const onLeave = () => { aim.z = 0; pointer.set(0, 0); };
  const onVisibility = () => (document.hidden ? sleep() : wake());

  // Off screen the field stops entirely: the hero is the first of two WebGL scenes on this page and only
  // one of them should ever be drawing.
  const watcher = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) { started = 0; wake(); } else sleep();
  }, { threshold: 0 });
  watcher.observe(canvas);
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('blur', onLeave);
  document.addEventListener('visibilitychange', onVisibility);
  reduced.addEventListener('change', wake);
  wake();

  return {
    /** Dims the field as the page scrolls past it, so the hero hands over rather than cutting. */
    setOpacity(value: number) { canvas.style.opacity = String(value); },
    /** The scroll out of the hero, as two stages: the field contracting, then thrown outward. */
    setTransition(gather: number, burst: number) {
      uniforms.uGather.value = gather;
      uniforms.uBurst.value = burst;
      wake();
    },
    dispose() {
      disposed = true; sleep();
      watcher.disconnect();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('blur', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      reduced.removeEventListener('change', wake);
      geometry.dispose(); material.dispose(); composer?.dispose(); renderer.dispose();
    },
  };
}
