'use client';

import { useEffect, useRef } from 'react';

// The surface behind the events stage: the overview's soft bands, rebuilt as a halftone of dots that
// fold and flow like a liquid. Everything is computed per pixel in a fragment shader, so the cost is one
// full-screen triangle at a reduced resolution — the upscaling is what gives the field its soft, faded
// look, the same way the overview's low-resolution canvas does. It draws only while on screen, stops in
// a hidden tab, and under reduced motion it draws once and holds.

const SETTINGS = {
  // The dot grid, in CSS pixels, and how fast the field flows. Scrolling stirs it (see `surge`), and the
  // pointer pushes the surface aside where it rests.
  cell: 14, mobileCell: 11, speed: .055, stir: 5, poke: 1,
  // Rendering resolution is capped: the softness is the point.
  maxRatio: 1.5,
} as const;

const VERTEX = `
  attribute vec2 aPosition;
  void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
`;

const FRAGMENT = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform float uTime, uCell, uPoke, uReveal;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float value = 0.0, amplitude = 0.5;
    for (int octave = 0; octave < 4; octave++) { value += amplitude * noise(p); p = p * 2.03 + 17.1; amplitude *= 0.5; }
    return value;
  }

  void main() {
    // Each dot takes the field's value at its own centre, so it reads as one bead of a halftone rather
    // than a shaded blob.
    vec2 cell = floor(gl_FragCoord.xy / uCell);
    vec2 center = (cell + 0.5) * uCell;
    vec2 p = center / uResolution.y * 1.5;
    float t = uTime;
    // The pointer presses the surface: the noise domain is pushed outward around it, which bends the
    // bands as a finger would bend the surface of water.
    vec2 away = (center - uPointer) / uResolution.y;
    float near = exp(-dot(away, away) * 22.0) * uPoke;
    p += normalize(away + 1e-4) * near * 0.14;
    // Domain warping: the field is sampled through two layers of its own distortion, which is what turns
    // a cloud of noise into something that folds and flows.
    vec2 q = vec2(fbm(p + vec2(0.0, t * 0.9)), fbm(p + vec2(5.2, 1.3) - t * 0.7));
    vec2 r = vec2(fbm(p + 2.2 * q + vec2(1.7, 9.2) + t * 0.5), fbm(p + 2.2 * q + vec2(8.3, 2.8) - t * 0.4));
    float f = fbm(p + 1.9 * r);
    // Two bands, like the overview's: a broad blue one, and a narrower warm one lower in the field.
    float blue = exp(-pow((f - 0.50) * 8.0, 2.0));
    float warm = exp(-pow((f - 0.31) * 9.0, 2.0)) * 0.5;
    // Each bead breathes on its own slow phase, so the surface glints rather than reading as a flat grid.
    float breath = 0.82 + 0.18 * sin(t * 42.0 + hash(cell) * 6.2832);
    float value = clamp((blue + warm) * breath + near * 0.35, 0.0, 1.0);
    // The bead: a soft disc that grows with the field's value, never quite vanishing, so the grid is
    // still faintly there in the troughs.
    float radius = uCell * (0.08 + 0.36 * value);
    float disc = 1.0 - smoothstep(radius - 1.0, radius + 1.0, length(gl_FragCoord.xy - center));
    // Deep blue in the troughs, sky on the crest, copper along the warm band.
    vec3 color = mix(vec3(0.18, 0.30, 0.42), vec3(0.48, 0.72, 0.84), blue);
    color = mix(color, vec3(0.77, 0.60, 0.48), clamp(warm * 1.3, 0.0, 1.0));
    // Fades toward the edges, and is centred right of the middle so the line on the left sits on quiet ground.
    vec2 n = (gl_FragCoord.xy / uResolution - vec2(0.62, 0.5)) * vec2(1.0, 1.3);
    float vignette = 0.08 + 0.92 * (1.0 - smoothstep(0.26, 0.82, length(n)));
    float alpha = disc * (0.07 + 0.6 * value) * vignette * uReveal;
    gl_FragColor = vec4(color * alpha, alpha);
  }
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null; }
  return shader;
}

export default function LiquidField({ className }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const gl = element.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
    if (!gl) return;
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX), fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return;
    gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);
    // One triangle that covers the clip space; the shader does the rest.
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const uniform = (name: string) => gl.getUniformLocation(program, name);
    const uResolution = uniform('uResolution'), uPointer = uniform('uPointer'), uTime = uniform('uTime');
    const uCell = uniform('uCell'), uPoke = uniform('uPoke'), uReveal = uniform('uReveal');
    gl.clearColor(0, 0, 0, 0);

    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const phone = innerWidth < 768 || matchMedia('(pointer: coarse)').matches;
    const stage = element.parentElement;
    let frame = 0, visible = false, lost = false, width = 0, height = 0, ratio = 1;
    let last = 0, clock = 0, reveal = 0, surge = 0, lastScroll = scrollY;
    // The pointer in CSS pixels over the stage, and how firmly it is pressing; both are eased.
    const pointer = { x: -1e4, y: -1e4, press: 0, target: 0 };

    function resize() {
      const box = element!.getBoundingClientRect();
      if (!box.width || !box.height) return false;
      const next = Math.min(devicePixelRatio || 1, SETTINGS.maxRatio);
      if (box.width === width && box.height === height && next === ratio) return true;
      width = box.width; height = box.height; ratio = next;
      element!.width = Math.round(width * ratio); element!.height = Math.round(height * ratio);
      gl!.viewport(0, 0, element!.width, element!.height);
      return true;
    }

    function draw(now: number) {
      if (!resize()) return;
      const dt = last ? Math.min(now - last, 64) / 1000 : 0;
      last = now;
      // Scrolling stirs the field; the stir settles over a second or so.
      clock += dt * SETTINGS.speed * (1 + surge * SETTINGS.stir);
      surge *= Math.pow(0.08, dt);
      reveal = Math.min(1, reveal + dt / 1.2);
      pointer.press += (pointer.target - pointer.press) * Math.min(1, dt * 4);
      gl!.uniform2f(uResolution, element!.width, element!.height);
      gl!.uniform2f(uPointer, pointer.x * ratio, (height - pointer.y) * ratio);
      gl!.uniform1f(uTime, clock);
      gl!.uniform1f(uCell, (phone ? SETTINGS.mobileCell : SETTINGS.cell) * ratio);
      gl!.uniform1f(uPoke, pointer.press * SETTINGS.poke);
      gl!.uniform1f(uReveal, reveal);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
      element!.dataset.lit = 'true';
    }

    function render(now: number) {
      frame = 0;
      if (lost) return;
      draw(now);
      // Reduced motion gets the field drawn once, at rest, and then nothing.
      if (reduced.matches) { if (reveal < 1) frame = requestAnimationFrame(render); return; }
      frame = requestAnimationFrame(render);
    }
    const wake = () => { if (!lost && visible && !document.hidden && !frame) { last = 0; frame = requestAnimationFrame(render); } };
    const sleep = () => { cancelAnimationFrame(frame); frame = 0; };

    const onPointer = (event: PointerEvent) => {
      const box = element!.getBoundingClientRect();
      pointer.x = event.clientX - box.left; pointer.y = event.clientY - box.top; pointer.target = 1;
    };
    const onLeave = () => { pointer.target = 0; };
    const onScroll = () => { const y = scrollY; surge = Math.min(1, surge + Math.abs(y - lastScroll) / 900); lastScroll = y; wake(); };
    const onVisibility = () => (document.hidden ? sleep() : wake());
    const onLost = (event: Event) => { event.preventDefault(); lost = true; sleep(); element!.dataset.lit = 'false'; };
    const onRestored = () => { lost = false; wake(); };

    const watcher = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) wake(); else sleep(); });
    watcher.observe(element);
    const sizer = new ResizeObserver(wake);
    sizer.observe(element);
    stage?.addEventListener('pointermove', onPointer, { passive: true });
    stage?.addEventListener('pointerleave', onLeave);
    addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    reduced.addEventListener('change', wake);
    element.addEventListener('webglcontextlost', onLost);
    element.addEventListener('webglcontextrestored', onRestored);
    wake();

    return () => {
      lost = true; sleep();
      watcher.disconnect(); sizer.disconnect();
      stage?.removeEventListener('pointermove', onPointer);
      stage?.removeEventListener('pointerleave', onLeave);
      removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      reduced.removeEventListener('change', wake);
      element.removeEventListener('webglcontextlost', onLost);
      element.removeEventListener('webglcontextrestored', onRestored);
      gl.deleteBuffer(buffer); gl.deleteProgram(program); gl.deleteShader(vertex); gl.deleteShader(fragment);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  return <canvas ref={canvas} className={className} aria-hidden="true" />;
}
