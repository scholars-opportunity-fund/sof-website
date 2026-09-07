import * as THREE from 'three';
import { BRAIN_LOOKS, DEFAULT_LOOK, type BrainLookName } from './looks';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { brainRegions, type BrainRegion } from './regions';

export type BrainPhase = 'loading' | 'forming' | 'still';
export type BrainScene = Awaited<ReturnType<typeof createBrainScene>>;
type Callbacks = { hover: (region: BrainRegion | null) => void; select: (region: BrainRegion | null) => void; move: () => void; zoom: (zoom: number) => void; failed: () => void };
const HOME = new THREE.Vector3(4.6, .6, 2.65);
const BASE_DISTANCE = HOME.length();

export async function createBrainScene(canvas: HTMLCanvasElement, callbacks: Callbacks, signal: AbortSignal) {
  if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
  const request = new AbortController();
  const cancelRequest = () => request.abort();
  signal.addEventListener('abort', cancelRequest, { once: true });
  const timeout = setTimeout(cancelRequest, 20000);
  let bytes: ArrayBuffer;
  try {
    const response = await fetch('/brain/anatomical-brain.glb.gz', { signal: request.signal });
    if (!response.ok || !response.body) throw new Error('Brain model could not load');
    bytes = await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener('abort', cancelRequest);
  }
  const model = await new GLTFLoader().parseAsync(bytes, '');
  function disposeModel() { model.scene.traverse(object => { if (object instanceof THREE.Mesh) { object.geometry.dispose(); const materials = Array.isArray(object.material) ? object.material : [object.material]; materials.forEach(material => material.dispose()); } }); }
  if (signal.aborted) { disposeModel(); throw new DOMException('Aborted', 'AbortError'); }
  let renderer: THREE.WebGLRenderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' }); }
  catch (error) { disposeModel(); throw error; }
  renderer.setClearColor(0x0b1221, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .95;
  const scene = new THREE.Scene();
  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environmentMap = pmrem.fromScene(environment, .04);
  scene.environment = environmentMap.texture;
  environment.dispose(); pmrem.dispose();
  scene.add(new THREE.AmbientLight(0xb3d9f0, .45));
  for (const [color, intensity, x, y, z] of [[0xc3e7ff, 1.8, 3, 5, 4], [0xc49a7a, 1.1, -4, 1, 2], [0x7bb8d6, 2.2, -2, 3, -5]]) {
    const light = new THREE.DirectionalLight(color, intensity); light.position.set(x, y, z); scene.add(light);
  }
  const camera = new THREE.PerspectiveCamera(35, 1.5, .1, 50);
  camera.position.copy(HOME);
  // Ordinary wheel scrolling remains page scrolling. Shift+wheel controls 3D zoom.
  const wheel = (event: WheelEvent) => { if (!event.shiftKey || event.ctrlKey || event.metaKey) event.stopImmediatePropagation(); };
  canvas.addEventListener('wheel', wheel, { capture: true });
  const controls = new OrbitControls(camera, canvas);
  // A vertical swipe moves through the landing page; horizontal drag and pinch explore the model.
  canvas.style.touchAction = 'pan-y';
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = .09;
  controls.rotateSpeed = .65;
  controls.zoomSpeed = .6;
  controls.minDistance = BASE_DISTANCE / 1.6;
  controls.maxDistance = BASE_DISTANCE;
  controls.minPolarAngle = .2;
  controls.maxPolarAngle = Math.PI - .2;
  controls.update();
  controls.saveState();
  const brain = new THREE.Group();
  brain.add(model.scene); scene.add(brain);
  // The metal shell grows out of the same seed the network grows from: fragments nearer the seed skin over
  // first, with a lit frontier where the metal is still creeping. `grown` at 1 is the finished brain.
  const growthSeed = new THREE.Vector3(.8, .1, 1);
  const growth = { grown: { value: 1 }, seed: { value: growthSeed }, reach: { value: 1 }, rim: { value: .2 }, rimColor: { value: new THREE.Color('#8fd4f5') } };
  const surfaces: THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>[] = [];
  const outlines: THREE.LineSegments[] = [];
  const wires: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>[] = [];
  const candidates: THREE.Vector3[] = [];
  model.scene.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    const oldMaterials = Array.isArray(object.material) ? object.material : [object.material];
    oldMaterials.forEach(material => material.dispose());
    object.material = new THREE.MeshPhysicalMaterial({ color: '#18364d', metalness: .7, roughness: .28, clearcoat: 1, clearcoatRoughness: .2, envMapIntensity: .65, transparent: true, opacity: .94, depthWrite: true, emissive: '#183044', emissiveIntensity: .16 });
    object.material.onBeforeCompile = (shader: { uniforms: Record<string, { value: unknown }>; vertexShader: string; fragmentShader: string }) => {
      Object.assign(shader.uniforms, { uGrown: growth.grown, uSeed: growth.seed, uReach: growth.reach, uRim: growth.rim, uRimColor: growth.rimColor });
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>
          varying vec3 vGrowthPos;`)
        .replace('#include <begin_vertex>', `#include <begin_vertex>
          vGrowthPos = position;`);
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>
          varying vec3 vGrowthPos;
          uniform float uGrown;
          uniform vec3 uSeed;
          uniform float uReach;
          uniform float uRim;
          uniform vec3 uRimColor;`)
        .replace('#include <dithering_fragment>', `#include <dithering_fragment>
          if (uGrown < 0.999) {
            float reached = distance(vGrowthPos, uSeed) / uReach;
            if (reached > uGrown) discard;
            gl_FragColor.rgb += uRimColor * smoothstep(uGrown - uRim, uGrown, reached) * .75;
          }`);
    };
    object.material.customProgramCacheKey = () => 'brain-growth';
    object.renderOrder = 1;
    surfaces.push(object as THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>);
    const outline = new THREE.LineSegments(new THREE.EdgesGeometry(object.geometry, 32), new THREE.LineBasicMaterial({ color: '#7BB8D6', transparent: true, opacity: 0, depthWrite: false }));
    outline.visible = false; outline.name = object.name; outline.renderOrder = 3; outlines.push(outline); brain.add(outline);
    const wireMaterial = new THREE.MeshBasicMaterial({ color: '#9ccde4', wireframe: true, transparent: true, opacity: .025, depthWrite: false });
    // The scaffold grows with the shell. Without this it arrives complete and the handoff reads as a jump
    // from the trace's sparse dots to a dense mesh.
    wireMaterial.onBeforeCompile = (shader: { uniforms: Record<string, { value: unknown }>; vertexShader: string; fragmentShader: string }) => {
      Object.assign(shader.uniforms, { uGrown: growth.grown, uSeed: growth.seed, uReach: growth.reach, uRim: growth.rim, uRimColor: growth.rimColor });
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>
          varying vec3 vGrowthPos;`)
        .replace('#include <begin_vertex>', `#include <begin_vertex>
          vGrowthPos = position;`);
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>
          varying vec3 vGrowthPos;
          uniform float uGrown;
          uniform vec3 uSeed;
          uniform float uReach;
          uniform float uRim;
          uniform vec3 uRimColor;`)
        .replace('#include <dithering_fragment>', `#include <dithering_fragment>
          if (uGrown < 0.999) {
            float reached = distance(vGrowthPos, uSeed) / uReach;
            // The mesh fades in just ahead of the metal instead of stopping dead at the frontier.
            if (reached > uGrown + uRim) discard;
            gl_FragColor.a *= 1.0 - smoothstep(uGrown, uGrown + uRim, reached);
          }`);
    };
    wireMaterial.customProgramCacheKey = () => 'brain-growth-wire';
    const wire = new THREE.Mesh(object.geometry, wireMaterial);
    wire.renderOrder = 2; wires.push(wire); brain.add(wire);
    const positions = object.geometry.getAttribute('position');
    for (let i = 0; i < positions.count; i += Math.max(1, Math.floor(positions.count / 700))) {
      const point = new THREE.Vector3().fromBufferAttribute(positions, i).multiplyScalar(.96);
      if (candidates.every(other => other.distanceToSquared(point) > .038)) candidates.push(point);
    }
  });

  // Connections are anchored to actual 3D anatomy, so the formation and final view agree.
  const seed = growthSeed;
  growth.reach.value = Math.max(.001, Math.sqrt(candidates.reduce((far, point) => Math.max(far, point.distanceToSquared(seed)), 0)));
  candidates.sort((a, b) => a.distanceToSquared(seed) - b.distanceToSquared(seed));
  const nodes = candidates.slice(0, 360);
  const birth = (index: number) => .25 + 7.15 * Math.log(1 + index / nodes.length * (Math.exp(4) - 1)) / 4;
  const positions: number[] = [], births: number[] = [], along: number[] = [];
  for (let i = 1; i < nodes.length; i++) {
    const neighbors = nodes.slice(0, i).map((point, index) => ({ index, distance: point.distanceToSquared(nodes[i]) })).sort((a, b) => a.distance - b.distance).slice(0, i % 3 === 0 ? 2 : 1);
    for (const neighbor of neighbors) {
      const from = nodes[neighbor.index], to = nodes[i];
      const middle = from.clone().lerp(to, .5).multiplyScalar(.87);
      const curve = new THREE.QuadraticBezierCurve3(from, middle, to);
      for (let step = 0; step < 12; step++) {
        for (const t of [step / 12, (step + 1) / 12]) {
          positions.push(...curve.getPoint(t).toArray()); births.push(birth(i)); along.push(t);
        }
      }
    }
  }
  const connections = new THREE.BufferGeometry();
  connections.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  connections.setAttribute('birth', new THREE.Float32BufferAttribute(births, 1));
  connections.setAttribute('along', new THREE.Float32BufferAttribute(along, 1));
  const networkMaterial = new THREE.ShaderMaterial({
    uniforms: { time: { value: 12 }, strength: { value: .45 }, baseColor: { value: new THREE.Vector3(...BRAIN_LOOKS[DEFAULT_LOOK].network.base) }, pulseColor: { value: new THREE.Vector3(...BRAIN_LOOKS[DEFAULT_LOOK].network.pulse) }, pointSize: { value: BRAIN_LOOKS[DEFAULT_LOOK].junction.size }, pointStrength: { value: BRAIN_LOOKS[DEFAULT_LOOK].junction.strength } }, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'attribute float birth; attribute float along; varying float vBirth; varying float vAlong; void main(){vBirth=birth;vAlong=along;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: 'uniform float time; uniform float strength; uniform vec3 baseColor; uniform vec3 pulseColor; varying float vBirth; varying float vAlong; void main(){if(time<vBirth+vAlong*.55)discard;float pulse=pow(max(0.,1.-abs(fract(time*.6-vAlong)-.5)*2.),18.);gl_FragColor=vec4(mix(baseColor,pulseColor,pulse),strength*(.38+pulse*.62));}',
  });
  const network = new THREE.LineSegments(connections, networkMaterial); network.renderOrder = 4; brain.add(network);
  const junctionGeometry = new THREE.BufferGeometry().setFromPoints(nodes);
  junctionGeometry.setAttribute('birth', new THREE.Float32BufferAttribute(nodes.map((_, index) => birth(index)), 1));
  const junctionMaterial = new THREE.ShaderMaterial({
    uniforms: networkMaterial.uniforms, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'attribute float birth; uniform float time; uniform float pointSize; varying float alive; void main(){alive=step(birth,time);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);gl_PointSize=pointSize;}',
    fragmentShader: 'uniform float strength; uniform float pointStrength; uniform vec3 pulseColor; varying float alive; void main(){float light=max(0.,1.-length(gl_PointCoord-.5)*2.);gl_FragColor=vec4(pulseColor,alive*light*strength*pointStrength*.5);}',
  });
  const junctions = new THREE.Points(junctionGeometry, junctionMaterial); junctions.renderOrder = 5; brain.add(junctions);

  function applyLook() {
    const preset = BRAIN_LOOKS[look], face = preset.surface;
    for (const surface of surfaces) {
      const material = surface.material;
      material.color.set(face.color); material.emissive.set(face.emissive); material.emissiveIntensity = face.emissiveIntensity;
      material.metalness = face.metalness; material.roughness = face.roughness; material.clearcoat = face.clearcoat;
      material.transmission = face.transmission; material.thickness = face.thickness; material.ior = face.ior;
      material.envMapIntensity = face.envMapIntensity; material.depthWrite = face.depthWrite;
      material.attenuationColor.set(face.attenuationColor); material.attenuationDistance = face.attenuationDistance; material.needsUpdate = true;
    }
    for (const wire of wires) wire.material.opacity = preset.wireOpacity;
    networkMaterial.uniforms.baseColor.value.set(...preset.network.base);
    networkMaterial.uniforms.pulseColor.value.set(...preset.network.pulse);
    networkMaterial.uniforms.pointSize.value = preset.junction.size;
    networkMaterial.uniforms.pointStrength.value = preset.junction.strength;
  }

  // The intro clock (0 → 12) is driven from outside so the 2D synapse overlay and the model agree.
  let phase: BrainPhase = 'loading', introTime = 0, frame = 0, disposed = false, visible = true, active: BrainRegion | null = null;
  let navigation = 0, clipAspect: number | null = null, look: BrainLookName = DEFAULT_LOOK;
  // 1 the instant the clip hands over, decaying to 0 as the metal skins over and the traffic calms.
  let arrival = 0;
  // Keeps the resting brain alive: a slow clock so pulses keep travelling the connections once it settles.
  let idle = 0, lastFrame = 0;
  const viewport = new THREE.Vector2();
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  controls.enableDamping = !preference.matches;
  function invalidate() { if (!disposed && visible && !document.hidden && !frame) frame = requestAnimationFrame(render); }
  function render() {
    frame = 0;
    const time = phase === 'forming' ? Math.min(12, introTime) : 12;
    const now = performance.now();
    const delta = lastFrame ? Math.min(.05, (now - lastFrame) / 1000) : 0;
    lastFrame = now;
    // At rest the clock keeps running at a fraction of formation speed, so the network reads as alive
    // rather than frozen. Reduced motion holds it still.
    const breathing = phase === 'still' && !preference.matches;
    if (breathing) idle += delta * .22;
    // The rendered clip carries the formation; the model is fully formed and static beneath it and keeps a faint network after the swap.
    networkMaterial.uniforms.time.value = 12 + idle;
    const preset = BRAIN_LOOKS[look], hot = arrival;
    // On arrival the brain is still the clip's glowing lattice: traffic at full tilt, shell thin and lit.
    // As `hot` decays the shell closes to its finish and the network drops back to its resting hum.
    const settled = THREE.MathUtils.smoothstep(time, 9.4, 10.6);
    const breath = breathing ? .82 + Math.sin(idle * 1.7) * .18 : 1;
    networkMaterial.uniforms.strength.value = settled * .26 * preset.network.strength * breath + hot * .95;
    networkMaterial.uniforms.pointStrength.value = preset.junction.strength * (1 + hot * 2.4);
    // Ease the frontier so it starts quickly at the seed and slows as it closes over the far lobes.
    growth.grown.value = hot > 0 ? Math.pow(1 - hot, .7) : 1;
    for (const surface of surfaces) {
      surface.material.opacity = preset.surface.opacity * (surface.name === active ? 1.04 : 1);
      surface.material.emissiveIntensity = preset.surface.emissiveIntensity + hot * .7;
    }
    for (const wire of wires) wire.material.opacity = preset.wireOpacity * (1 + hot * .8);
    brain.scale.setScalar(1); brain.rotation.set(0, 0, 0); brain.position.set(0, 0, 0);
    const shift = settled * (1 - navigation);
    renderer.getSize(viewport);
    const mobile = viewport.x < 768;
    // While a clip is matched the aspect factor follows the clip, so the model matches the height-fitted video; it settles to the stage's own factor across the shift.
    const stageFactor = Math.min(1, viewport.x / viewport.y * 1.05);
    const factor = clipAspect ? THREE.MathUtils.lerp(Math.min(1, clipAspect * 1.05), stageFactor, settled) : stageFactor;
    brain.scale.multiplyScalar(factor * THREE.MathUtils.lerp(1, mobile ? .72 : .66, shift));
    camera.setViewOffset(viewport.x, viewport.y, mobile ? 0 : -viewport.x * .25 * shift, mobile ? viewport.y * .14 * shift : 0, viewport.x, viewport.y);
    controls.update();
    renderer.render(scene, camera);
    canvas.dataset.orientation = camera.position.toArray().map(value => value.toFixed(3)).join(',');
    canvas.dataset.formation = time.toFixed(2);
    canvas.dataset.region = active ?? 'none';
    // Only the resting brain drives itself; every other state renders on demand.
    if (breathing) invalidate();
  }
  function resize() {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    const pixelRatio = Math.min(devicePixelRatio, innerWidth < 768 ? 1.25 : 1.6);
    if (renderer.getPixelRatio() !== pixelRatio) renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); invalidate();
  }
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(canvas);
  const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; lastFrame = 0; if (visible) invalidate(); }); intersection.observe(canvas);
  const visibilityChanged = () => { lastFrame = 0; invalidate(); };
  document.addEventListener('visibilitychange', visibilityChanged);
  window.addEventListener('resize', resize);
  controls.addEventListener('change', invalidate);
  controls.addEventListener('start', callbacks.move);
  const reportZoom = () => callbacks.zoom(BASE_DISTANCE / camera.position.length());
  controls.addEventListener('end', reportZoom);
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  function pick(event: PointerEvent) {
    const box = canvas.getBoundingClientRect();
    pointer.set((event.clientX - box.left) / box.width * 2 - 1, -(event.clientY - box.top) / box.height * 2 + 1);
    camera.updateMatrixWorld(); brain.updateMatrixWorld(true);
    raycaster.setFromCamera(pointer, camera);
    return (raycaster.intersectObjects(surfaces, false)[0]?.object.name as BrainRegion | undefined) ?? null;
  }
  let hoverFrame = 0;
  let hoverEvent: PointerEvent | null = null;
  function clearHover() { cancelAnimationFrame(hoverFrame); hoverFrame = 0; hoverEvent = null; callbacks.hover(null); }
  let down: { x: number; y: number } | null = null, dragged = false, pointers = 0;
  function pointerDown(event: PointerEvent) { clearHover(); pointers++; if (pointers === 1) { down = { x: event.clientX, y: event.clientY }; dragged = false; } else dragged = true; canvas.focus({ preventScroll: true }); }
  function pointerMove(event: PointerEvent) {
    if (phase !== 'still') return;
    if (down && Math.hypot(event.clientX - down.x, event.clientY - down.y) > 6) dragged = true;
    if (!down && event.pointerType === 'mouse') {
      hoverEvent = event;
      if (!hoverFrame) hoverFrame = requestAnimationFrame(() => { hoverFrame = 0; if (hoverEvent && !disposed) callbacks.hover(pick(hoverEvent)); });
    }
  }
  function pointerUp(event: PointerEvent) { pointers = Math.max(0, pointers - 1); if (phase === 'still' && down && !dragged && pointers === 0) callbacks.select(pick(event)); if (!pointers) down = null; }
  function pointerCancel() { pointers = 0; down = null; dragged = true; }
  function pointerLeave() { clearHover(); }
  function keyDown(event: KeyboardEvent) {
    if (phase !== 'still') return;
    if (event.key === 'Escape') { callbacks.select(null); canvas.blur(); return; }
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '-', '='].includes(event.key)) return;
    event.preventDefault(); callbacks.move();
    const spherical = new THREE.Spherical().setFromVector3(camera.position);
    if (event.key === 'ArrowLeft') spherical.theta -= .15;
    if (event.key === 'ArrowRight') spherical.theta += .15;
    if (event.key === 'ArrowUp') spherical.phi = Math.max(.2, spherical.phi - .15);
    if (event.key === 'ArrowDown') spherical.phi = Math.min(Math.PI - .2, spherical.phi + .15);
    if (['+', '='].includes(event.key)) spherical.radius = Math.max(controls.minDistance, spherical.radius / 1.1);
    if (event.key === '-') spherical.radius = Math.min(controls.maxDistance, spherical.radius * 1.1);
    camera.position.setFromSpherical(spherical); controls.update(); reportZoom(); invalidate();
  }
  function contextLost(event: Event) { event.preventDefault(); callbacks.failed(); }
  canvas.addEventListener('pointerdown', pointerDown); canvas.addEventListener('pointermove', pointerMove); canvas.addEventListener('pointerup', pointerUp); canvas.addEventListener('pointercancel', pointerCancel); canvas.addEventListener('pointerleave', pointerLeave); canvas.addEventListener('keydown', keyDown); canvas.addEventListener('webglcontextlost', contextLost);
  const motionChanged = () => { controls.enableDamping = !preference.matches; };
  preference.addEventListener('change', motionChanged);
  resize();
  return {
    setNavigation(value: number) { navigation = THREE.MathUtils.clamp(value, 0, 1); invalidate(); },
    setRegion(region: BrainRegion | null) {
      active = region;
      for (const mesh of surfaces) { const color = brainRegions.find(item => item.id === mesh.name)?.color ?? '#7BB8D6'; const face = BRAIN_LOOKS[look].surface; mesh.material.color.set(mesh.name === region ? color : face.color); mesh.material.emissive.set(mesh.name === region ? color : face.emissive); mesh.material.emissiveIntensity = mesh.name === region ? .3 : face.emissiveIntensity; }
      for (const outline of outlines) { const material = outline.material as THREE.LineBasicMaterial; outline.visible = outline.name === region; material.opacity = .4; material.color.set(brainRegions.find(item => item.id === outline.name)?.color ?? '#7BB8D6'); }
      invalidate();
    },
    setZoom(zoom: number) { camera.position.setLength(BASE_DISTANCE / THREE.MathUtils.clamp(zoom, 1, 1.6)); controls.update(); invalidate(); },
    resetView() {
      const damping = controls.enableDamping;
      controls.enableDamping = false;
      controls.update();
      controls.reset();
      controls.enableDamping = damping;
      invalidate();
    },
    setPhase(value: BrainPhase) { phase = value; controls.enabled = value === 'still'; invalidate(); },
    setTime(value: number) { introTime = value; invalidate(); },
    setClipAspect(value: number | null) { clipAspect = value; invalidate(); },
    setLook(value: BrainLookName) { look = value; applyLook(); invalidate(); },
    setArrival(value: number) { arrival = THREE.MathUtils.clamp(value, 0, 1); invalidate(); },
    dispose() {
      disposed = true; cancelAnimationFrame(frame); cancelAnimationFrame(hoverFrame); controls.dispose(); resizeObserver.disconnect(); intersection.disconnect();
      document.removeEventListener('visibilitychange', visibilityChanged); window.removeEventListener('resize', resize); preference.removeEventListener('change', motionChanged);
      canvas.removeEventListener('wheel', wheel, true); canvas.removeEventListener('pointerdown', pointerDown); canvas.removeEventListener('pointermove', pointerMove); canvas.removeEventListener('pointerup', pointerUp); canvas.removeEventListener('pointercancel', pointerCancel); canvas.removeEventListener('pointerleave', pointerLeave); canvas.removeEventListener('keydown', keyDown); canvas.removeEventListener('webglcontextlost', contextLost);
      disposeModel(); outlines.forEach(outline => { outline.geometry.dispose(); (outline.material as THREE.Material).dispose(); }); wires.forEach(wire => wire.material.dispose()); connections.dispose(); networkMaterial.dispose(); junctionGeometry.dispose(); junctionMaterial.dispose(); environmentMap.dispose(); renderer.dispose(); renderer.forceContextLoss();
    },
  };
}
