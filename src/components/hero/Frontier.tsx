'use client';

import { useEffect, useRef, useState } from 'react';
import type { Nebula } from '@/lib/hero/nebula';
import styles from './Frontier.module.css';

// Where the beats of the scroll sit, as fractions of the transition band below the first screen. The line
// leaves first either way; what the field then does depends on what is underneath it.
const COPY_OUT = .28;

// Without the clip — portrait, narrow or metered, where the brain runs its drawn trace instead — the
// field draws into a core and the core is thrown outward past the camera, and the veil lifts during the
// burst, which is what puts the screen below behind the particles instead of under them.
const GATHER = [.18, .68] as const, BURST = [.66, 1] as const, VEIL_OUT = [.66, .94] as const;

// With the clip, nothing is thrown anywhere, because nothing leaves: the field gathers early, resolves
// into the clip's own first frame, and is still holding that picture when the veil lifts to reveal the
// footage behind it. The brain's timeline opens on frame zero the moment its section reaches the header
// (introStart in BrainExperience), which is the same scroll position the old burst began at — so the
// picture the dots have drawn and the frame that replaces them are the same image, and the dots can
// simply fade off it. The veil lifts before the fade starts, so the footage arrives under the dots
// rather than after them.
const FORM_GATHER = [.12, .40] as const, FORM = [.34, .70] as const;
const FORM_VEIL_OUT = [.56, .78] as const, FORM_FADE = [.76, .98] as const;

// The clip's first frame, which is both what the brain lands on and what the field resolves into.
// Kept in step with FIRST_FRAME in BrainExperience.
const FIRST_FRAME = '/brain/intro/f00.webp';

const span = (value: number, [from, to]: readonly [number, number]) => Math.max(0, Math.min(1, (value - from) / (to - from)));
const smooth = (value: number) => value * value * (3 - 2 * value);

// Resolves to null rather than rejecting: a still that will not load costs the hero its formation, not
// its transition.
const loadFrame = (source: string) => new Promise<HTMLImageElement | null>(resolve => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => resolve(null);
  image.src = source;
});

// The first screen: one line over a field of particles, an instruction to scroll, and a transition that
// hands the page to the brain below — the field gathers, then either resolves into the first frame of the
// brain's own film and dissolves into it, or, where that film will not run, is thrown past the camera.
export default function Frontier() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const root = useRef<HTMLElement>(null);
  const nebula = useRef<Nebula | null>(null);
  // True once the field has a formation to resolve into. Read by the scroll handler, which runs on
  // every frame of the transition and must not care whether the still has arrived yet.
  const forms = useRef(false);
  const [lit, setLit] = useState(false);

  // The field is the page's heaviest piece of work and none of it is needed to read the line, so it is
  // held back until the browser is idle — the line and the cue are painted and interactive before any of
  // three.js is fetched. Phones hold it back further still, until the first touch, scroll or key: a phone
  // CPU and a phone GPU both pay for this, and neither should be paying during the page's first seconds.
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    let cancelled = false, idle = 0;
    const begin = () => {
      if (cancelled) return;
      import('@/lib/hero/nebula')
        .then(module => module.createNebula(element))
        .then(async scene => {
          if (cancelled) { scene.dispose(); return; }
          nebula.current = scene;
          setLit(true);
          // Only where the clip is what comes next. The frame is the brain's landing image and is
          // preloaded for it, so this is a cache read; if it will not load or will not sample, the
          // field keeps the burst and the hero hands over the way it always did.
          const { clipPreferred } = await import('@/lib/brain/clip-mode');
          if (cancelled || !clipPreferred()) return;
          const frame = await loadFrame(FIRST_FRAME);
          if (cancelled || !frame) return;
          forms.current = scene.formFrom(frame);
        })
        .catch(() => {});
    };
    const whenIdle = () => { idle = window.requestIdleCallback?.(begin, { timeout: 1200 }) ?? window.setTimeout(begin, 400); };
    const triggers = ['pointerdown', 'touchstart', 'keydown', 'scroll'] as const;
    const wake = () => { triggers.forEach(type => removeEventListener(type, wake)); whenIdle(); };
    if (innerWidth < 900 || matchMedia('(pointer: coarse)').matches) triggers.forEach(type => addEventListener(type, wake, { passive: true }));
    else whenIdle();
    return () => {
      cancelled = true;
      triggers.forEach(type => removeEventListener(type, wake));
      window.cancelIdleCallback?.(idle); clearTimeout(idle);
      nebula.current?.dispose(); nebula.current = null;
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const element = root.current;
      if (!element) return;
      const box = element.getBoundingClientRect();
      // The band is everything past the first screenful: the section's height less one viewport.
      const progress = Math.max(0, Math.min(1, -box.top / Math.max(1, box.height - innerHeight)));
      element.style.setProperty('--exit', String(span(progress, [0, COPY_OUT])));
      // Past the handover the hero is a sheet of nothing over the brain, so it stops taking the pointer.
      const handed = forms.current ? smooth(span(progress, FORM)) : span(progress, BURST);
      element.style.setProperty('--through', handed > .5 ? 'none' : 'auto');
      if (forms.current) {
        element.style.setProperty('--veil', String(1 - span(progress, FORM_VEIL_OUT)));
        nebula.current?.setTransition(span(progress, FORM_GATHER), 0, handed);
        nebula.current?.setOpacity(1 - span(progress, FORM_FADE));
      } else {
        element.style.setProperty('--veil', String(1 - span(progress, VEIL_OUT)));
        nebula.current?.setTransition(span(progress, GATHER), handed);
        nebula.current?.setOpacity(1 - span(progress, [.9, 1]));
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    schedule();
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    return () => { cancelAnimationFrame(frame); removeEventListener('scroll', schedule); removeEventListener('resize', schedule); };
  }, []);

  return <section ref={root} className={styles.hero} data-lit={lit} aria-label="Scholars at the Frontier">
    <div className={styles.stage}>
      <canvas ref={canvas} className={styles.field} aria-hidden="true" />
      <div className={styles.copy}>
        <h1 className={styles.line}>Scholars at the <em>Frontier</em></h1>
      </div>
      <a href="#sof-brain" className={styles.cue}>
        <span className={styles.track}><i /></span>Scroll
      </a>
    </div>
  </section>;
}
