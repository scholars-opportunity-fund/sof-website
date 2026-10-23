'use client';

import { useEffect, useRef, useState } from 'react';
import { MICROCAP } from '@/lib/constants';
import LiquidField from './LiquidField';
import Typewriter, { type Phrase } from './Typewriter';
import styles from './EventsSection.module.css';

// The lines the stage shows, in scroll order. The first types itself in and is the one the section is
// read as; scrolling through the hold erases it and types the next.
const LINES: readonly Phrase[] = [
  { text: 'Opportunity doesn’t come around that often.', accent: 'that often.' },
  { text: `Registration closes ${MICROCAP.registrationCloses}.`, accent: `${MICROCAP.registrationCloses}.` },
];

// The last stretch of the hold, over which the stage lifts and lets go.
const RELEASE = [.86, 1] as const;

const clamp = (value: number) => Math.max(0, Math.min(1, value));

/**
 * The events beat on the homepage: one dark screen that pins under the header for a stretch of scroll
 * while a line is typed over a liquid field, with the competition and its registration link along the
 * bottom. The pin is a sticky stage inside a taller section; how far the page is through the extra
 * height drives the words (see Typewriter), the line along the base, and the lift at the end. Short
 * viewports and reduced motion get the same screen laid out plainly, with nothing pinned.
 */
export default function EventsSection() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  const [hold, setHold] = useState(0);

  useEffect(() => {
    const element = root.current, screen = stage.current;
    if (!element || !screen) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const box = element.getBoundingClientRect();
      // Where the stage pins, which is the header's height; 'auto' when the layout is the plain one.
      const start = parseFloat(getComputedStyle(screen).top) || 0;
      const length = box.height - screen.offsetHeight;
      const progress = length > 1 ? clamp((start - box.top) / length) : 0;
      element.style.setProperty('--hold', String(progress));
      element.style.setProperty('--release', String(clamp((progress - RELEASE[0]) / (RELEASE[1] - RELEASE[0]))));
      // Quantised so the words re-render only when the scroll has moved a letter's worth, not every frame.
      setHold(Math.round(progress * 400) / 400);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    schedule();
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    // The line starts typing once a good part of the stage is in view, not when the page loads.
    const watcher = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setSeen(true); watcher.disconnect(); }
    }, { threshold: .3 });
    watcher.observe(screen);
    return () => { cancelAnimationFrame(frame); removeEventListener('scroll', schedule); removeEventListener('resize', schedule); watcher.disconnect(); };
  }, []);

  return (
    <section ref={root} id="events" className={styles.events} aria-labelledby="events-title">
      <noscript><style>{`[data-typewriter] [data-on]{visibility:visible!important}`}</style></noscript>
      <div ref={stage} className={styles.stage}>
        <LiquidField className={styles.field} />
        <div className={styles.veil} aria-hidden="true" />
        <div className={styles.inner}>
          <div className={styles.topline}>
            <p className={styles.kicker}><span className={styles.rule} aria-hidden="true" />Events</p>
            <p className={styles.season}>Fall 2026</p>
          </div>

          <div className={styles.middle}>
            <h2 id="events-title" className={styles.headline}>
              <span className="sr-only">{LINES[0].text}</span>
              <span aria-hidden="true" className={styles.lines}><Typewriter phrases={LINES} active={seen} progress={hold} /></span>
            </h2>
            {/* The scroll is what changes the words, so the stage says so, in the hero's own vocabulary. */}
            <p className={styles.cue} aria-hidden="true"><span className={styles.track}><i /></span>Scroll</p>
          </div>

          <div className={styles.bottom}>
            <article id="competition" className={styles.event} aria-labelledby="competition-title">
              <p className={styles.eyebrow}>Student competition · {MICROCAP.dates}</p>
              <h3 id="competition-title" className={styles.title}>{MICROCAP.name}</h3>
              <p className={styles.when}>
                Starts {MICROCAP.starts}.<br />Ends {MICROCAP.ends}, when your GitHub repo and deck are due.
              </p>
              <p className={styles.description}>
                A hybrid case competition for student teams of <span className={styles.nowrap}>2–3</span>, run on SOF Scholars.
                Registration is free and closes {MICROCAP.registrationClosesAt}.
              </p>
            </article>
            <a href={MICROCAP.href} className={styles.register}>
              Register your team <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
        <div className={styles.progress} aria-hidden="true"><i /></div>
      </div>
    </section>
  );
}
