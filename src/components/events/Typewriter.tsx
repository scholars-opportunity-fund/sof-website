'use client';

import { useEffect, useState } from 'react';
import styles from './EventsSection.module.css';

export type Phrase = {
  text: string;
  /** A trailing part of the text set in copper, e.g. the clause the line turns on. */
  accent?: string;
};

// Milliseconds: the wait before the first letter, per letter as the first line types itself in, and the
// extra pause after punctuation.
const TIMING = { start: 600, letter: 48, breath: 260 } as const;
// How long the caret holds steady after the words last changed before it starts to blink.
const REST = 400;

/**
 * The first line types itself in once the stage is in view. After that the scroll owns the words:
 * `progress` runs 0 to 1 across the stage's hold, and as the page moves each line is erased letter by
 * letter and the next typed in, so the visitor scrubs the text rather than waiting on it, and scrolling
 * back reverses it. Every letter is in the DOM from the start and only revealed, so the lines wrap
 * exactly as they will when complete and nothing shifts as they type. Reduced motion shows the first
 * line whole; without JavaScript the letters are shown by the noscript rule in EventsSection.
 */
export default function Typewriter({ phrases, active, progress }: { phrases: readonly Phrase[]; active: boolean; progress: number }) {
  const [intro, setIntro] = useState(0);
  const [still, setStill] = useState(false);
  // The words that have come to rest: the caret blinks only once the current ones have.
  const [rested, setRested] = useState('');

  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const settle = () => setStill(reduced.matches);
    settle();
    reduced.addEventListener('change', settle);
    return () => reduced.removeEventListener('change', settle);
  }, []);

  // The first line, typed by the clock, once.
  useEffect(() => {
    if (!active || still) return;
    const text = phrases[0].text;
    let count = 0, timer = 0;
    const step = () => {
      count += 1;
      setIntro(count);
      if (count < text.length) timer = window.setTimeout(step, TIMING.letter + (/[,.!?;:]/.test(text[count - 1]) ? TIMING.breath : 0));
    };
    timer = window.setTimeout(step, TIMING.start);
    return () => clearTimeout(timer);
  }, [active, still, phrases]);

  const placed = still ? { phrase: 0, target: phrases[0].text.length } : place(phrases, progress);
  const { phrase, target } = placed;
  const { text, accent } = phrases[phrase];
  // The first line cannot show more than the clock has typed; the others belong to the scroll alone.
  const count = still ? text.length : phrase === 0 ? Math.min(intro, target) : target;

  // The caret holds steady while the words are changing and blinks once they have rested a moment.
  const words = `${phrase}:${count}`;
  useEffect(() => {
    const timer = window.setTimeout(() => setRested(words), REST);
    return () => clearTimeout(timer);
  }, [words]);
  const idle = rested === words;

  const accentFrom = accent && text.endsWith(accent) ? text.length - accent.length : text.length;
  // The caret sits after the last visible letter; a space never carries it, and a still line has none.
  let caret = -1;
  if (!still) for (let index = count - 1; index >= 0; index--) if (text[index] !== ' ') { caret = index; break; }
  const parts: { start: number; word: string }[] = [];
  let cursor = 0;
  for (const word of text.split(' ')) { parts.push({ start: cursor, word }); cursor += word.length + 1; }

  return (
    <span className={styles.typed} data-typewriter data-idle={idle && !still} data-still={still}>
      {!still && caret < 0 && <span className={styles.home} />}
      {parts.map(({ start, word }, wordIndex) => (
        <span key={`${phrase}-${start}`}>
          {wordIndex > 0 && ' '}
          <span className={styles.word}>
            {Array.from(word, (letter, offset) => {
              const index = start + offset;
              return <span key={index} className={`${styles.letter} ${index >= accentFrom ? styles.accent : ''}`} data-on={index < count} data-caret={index === caret}>{letter}</span>;
            })}
          </span>
        </span>
      ))}
    </span>
  );
}

/**
 * Which line the scroll is on and how many of its letters it shows. The hold is divided evenly between
 * the lines, and each change-over is centred on a division: the old line erases across the quarter-slot
 * before it and the new one types across the quarter-slot after, so a line stands whole for the middle
 * half of its slot.
 */
function place(phrases: readonly Phrase[], progress: number) {
  const slots = phrases.length, span = .5 / slots;
  let phrase = 0, target = phrases[0].text.length;
  for (let index = 0; index < slots - 1; index++) {
    const at = (index + 1) / slots;
    if (progress < at - span) break;
    if (progress < at) { target = Math.round(phrases[index].text.length * (1 - (progress - (at - span)) / span)); break; }
    phrase = index + 1; target = phrases[phrase].text.length;
    if (progress < at + span) { target = Math.round(target * (progress - at) / span); break; }
  }
  return { phrase, target };
}
