'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './BrainIntro.module.css';

export default function BrainIntro({ children, onReplay }: { children: ReactNode; onReplay?: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const skipped = useRef(false);
  const returnFocus = useRef(false);
  const [phase, setPhase] = useState<'waiting' | 'forming' | 'docking' | 'still'>('waiting');
  const [run, setRun] = useState(0);
  const [materialFailed, setMaterialFailed] = useState(false);
  const opening = phase === 'forming' || phase === 'docking';

  useLayoutEffect(() => {
    if (!opening) {
      if (returnFocus.current) {
        root.current?.querySelector('button')?.focus({ preventScroll: true });
        returnFocus.current = false;
      }
      return;
    }
    if (!dialog.current) return;
    const modal = dialog.current;
    const previousOverflow = document.body.style.overflow;
    const previousPageOverflow = document.documentElement.style.overflow;
    const previousBackground = document.documentElement.style.backgroundColor;
    const previousGutter = document.documentElement.style.scrollbarGutter;
    document.documentElement.style.scrollbarGutter = 'stable';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.backgroundColor = '#0B1221';
    document.body.style.overflow = 'hidden';
    modal.showModal();
    return () => {
      modal.close();
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousPageOverflow;
      document.documentElement.style.backgroundColor = previousBackground;
      document.documentElement.style.scrollbarGutter = previousGutter;
    };
  }, [opening]);

  useLayoutEffect(() => {
    if (phase !== 'docking' || !stage.current || !root.current) return;
    const from = stage.current.getBoundingClientRect();
    const to = root.current.getBoundingClientRect();
    const animation = stage.current.animate([
      { transform: 'none' },
      { transform: `translate(${to.x - from.x}px, ${to.y - from.y}px) scale(${to.width / from.width})` },
    ], { duration: 1100, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'forwards' });
    let active = true;
    const settle = () => { if (active) setPhase('still'); };
    animation.finished.then(settle).catch(() => {});
    window.addEventListener('resize', settle);
    return () => { active = false; animation.cancel(); window.removeEventListener('resize', settle); };
  }, [phase]);

  useEffect(() => {
    let active = true;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const stopForPreference = () => {
      if (preference.matches) { skipped.current = true; setPhase('still'); }
    };
    preference.addEventListener('change', stopForPreference);
    const material = root.current?.querySelector<HTMLImageElement>('[data-brain-material]');
    if (material) {
      material.decode().then(() => {
        if (active) setPhase(preference.matches || skipped.current ? 'still' : 'forming');
      }).catch(() => {
        if (active) { setMaterialFailed(true); setPhase('still'); }
      });
    }
    return () => { active = false; preference.removeEventListener('change', stopForPreference); };
  }, [run]);

  function finish() { skipped.current = true; returnFocus.current = true; setPhase('still'); }
  function replay() {
    onReplay?.();
    skipped.current = false;
    returnFocus.current = true;
    setPhase('waiting');
    setRun(value => value + 1);
  }

  return (
    <div ref={root} className={styles.intro} data-brain-home data-intro-phase={opening ? undefined : phase} data-material-failed={materialFailed}>
      {!opening && children}
      {!materialFailed && !opening && <div className={styles.introControls}>
        <button type="button" onClick={phase === 'still' ? replay : finish}>
          {phase === 'still' ? 'Replay formation' : 'Skip animation'}
          <span aria-hidden="true">{phase === 'still' ? '↻' : '→'}</span>
        </button>
      </div>}
      {opening && createPortal(
        <dialog ref={dialog} className={styles.startup} data-brain-startup data-intro-phase={phase}
          aria-label="Welcome to Scholars Opportunity Fund" onCancel={event => { event.preventDefault(); finish(); }}>
          <div className={styles.brand}><span>SOF</span><span>Scholars<br />Opportunity Fund</span></div>
          <div className={styles.edition}>Independent thinking.<br />Connected.</div>
          <div ref={stage} className={styles.stage} data-startup-stage onAnimationEnd={event => {
            if (phase === 'forming' && event.target instanceof HTMLElement && event.target.hasAttribute('data-brain-material')) setPhase('docking');
          }}>{children}</div>
          <div className={styles.statement}>
            <p>Research. Judgment. Conviction.</p>
            <div>It starts with <em>a connection.</em></div>
          </div>
          <div className={styles.startupFooter}>
            <span>Salt Lake City, Utah<span className={styles.rule} /></span>
            <button type="button" onClick={finish}>Skip intro <span aria-hidden="true">→</span></button>
          </div>
          <div className={styles.progress} aria-hidden="true"><span /></div>
        </dialog>, document.body
      )}
    </div>
  );
}
