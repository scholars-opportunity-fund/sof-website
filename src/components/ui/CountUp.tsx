"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  /** Target number to count to. */
  to: number;
  /** Duration of the count animation in ms. */
  duration?: number;
  /** Optional prefix to display, e.g. "$". */
  prefix?: string;
  /** Optional suffix to display, e.g. "%" or "+". */
  suffix?: string;
  /** Number of decimal places to show. */
  decimals?: number;
  className?: string;
}

/**
 * Counts up from 0 to `to` when the element enters the viewport. Fires once.
 * Respects prefers-reduced-motion (snaps to final value without animating).
 */
export default function CountUp({
  to,
  duration = 1400,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduced) {
      setValue(to);
      setStarted(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !started) {
            setStarted(true);
            const start = performance.now();
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
              setValue(to * eased);
              if (t < 1) requestAnimationFrame(tick);
              else setValue(to);
            };
            requestAnimationFrame(tick);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.4 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [to, duration, started]);

  const formatted = value.toFixed(decimals);

  return (
    <span ref={ref} className={className} aria-label={`${prefix}${to}${suffix}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
