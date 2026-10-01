'use client';

import { useEffect, useRef, useState } from 'react';
import type { Nebula } from '@/lib/hero/nebula';
import styles from './Frontier.module.css';

// Where the three beats of the scroll sit, as fractions of the transition band below the first screen:
// the line leaves, the field draws into a core, and the core is thrown outward past the camera.
const COPY_OUT = .28, GATHER = [.18, .68] as const, BURST = [.66, 1] as const;
// The veil is the hero's own background. It lifts during the burst, which is what puts the screen below
// behind the particles instead of under them.
const VEIL_OUT = [.66, .94] as const;

const span = (value: number, [from, to]: readonly [number, number]) => Math.max(0, Math.min(1, (value - from) / (to - from)));

// The first screen: one line over a field of particles, an instruction to scroll, and a transition that
// hands the page to the brain below — the field gathers, then bursts, and the brain's own film is behind it.
export default function Frontier() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const root = useRef<HTMLElement>(null);
  const nebula = useRef<Nebula | null>(null);
  const [lit, setLit] = useState(false);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    let cancelled = false;
    import('@/lib/hero/nebula').then(module => {
      if (cancelled) return;
      nebula.current = module.createNebula(element);
      setLit(true);
    }).catch(() => {});
    return () => { cancelled = true; nebula.current?.dispose(); nebula.current = null; };
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
      const burst = span(progress, BURST);
      element.style.setProperty('--exit', String(span(progress, [0, COPY_OUT])));
      element.style.setProperty('--veil', String(1 - span(progress, VEIL_OUT)));
      // Past the burst the hero is a sheet of nothing over the brain, so it stops taking the pointer.
      element.style.setProperty('--through', burst > .5 ? 'none' : 'auto');
      nebula.current?.setTransition(span(progress, GATHER), burst);
      nebula.current?.setOpacity(1 - span(progress, [.9, 1]));
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
