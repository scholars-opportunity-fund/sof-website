'use client';

import { useEffect, useRef } from 'react';

export default function SignalField({ active = true }: { active?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active) return;
    const element = canvas.current;
    const context = element?.getContext('2d', { alpha: false });
    if (!element || !context) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let timer: ReturnType<typeof setTimeout> | undefined;
    let visible = false;
    const started = performance.now();
    function draw() {
      if (!element || !context) return;
      clearTimeout(timer);
      if (!visible || document.hidden) return;
      const box = element.getBoundingClientRect();
      const width = Math.max(8, Math.round(box.width / 7)), height = Math.max(8, Math.round(box.height / 7));
      if (element.width !== width || element.height !== height) { element.width = width; element.height = height; }
      const pixels = context.createImageData(width, height), data = pixels.data;
      const time = preference.matches ? 0 : (performance.now() - started) / 1000;
      for (let j = 0; j < height; j++) for (let i = 0; i < width; i++) {
        const v = j / height, x = i / width * width / height;
        const f = Math.sin((x * 2.2 + v * 1.7) * 2 + time * .09) * .5 + Math.sin((v * 2.9 - x * 1.5) * 1.5 - time * .068) * .34 + Math.sin((x * 3.1 - v * 2) * .95 + time * .047) * .2;
        const b1 = Math.exp(-(((f - .5) * 3.2) ** 2)), b2 = Math.exp(-(((f + .44) * 2.8) ** 2)) * .55;
        const edge = Math.max(0, 1 - ((i / width - .5) ** 2 * 1.2 + (v - .5) ** 2 * .9) * 1.2);
        const k = Math.min(1, (b1 + b2) * edge) ** 1.4, p = (j * width + i) * 4;
        data[p] = 243 - k * 34 + b2 * edge * 12; data[p + 1] = 245 - k * 30; data[p + 2] = 248 - k * 22 - b2 * edge * 10; data[p + 3] = 255;
      }
      context.putImageData(pixels, 0, 0);
      if (!preference.matches) timer = setTimeout(draw, 120);
    }
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; draw(); }); observer.observe(element);
    const resize = new ResizeObserver(draw); resize.observe(element);
    document.addEventListener('visibilitychange', draw); preference.addEventListener('change', draw);
    return () => { clearTimeout(timer); observer.disconnect(); resize.disconnect(); document.removeEventListener('visibilitychange', draw); preference.removeEventListener('change', draw); };
  }, [active]);
  return <canvas ref={canvas} aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
}
