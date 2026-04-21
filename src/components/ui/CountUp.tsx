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
 * Renders the target value on first paint (SSR, prefers-reduced-motion, and
 * link-preview scrapers all see the final number). On client mount, if motion
 * is allowed, resets to 0 and counts up when the element enters the viewport.
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
  const [value, setValue] = useState(to);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let started = false;
    let raf = 0;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting || started) continue;
          started = true;
          io.disconnect();

          setValue(0);
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic, monotonic
            setValue(to * eased);
            if (t < 1) raf = requestAnimationFrame(tick);
            else setValue(to);
          };
          raf = requestAnimationFrame(tick);
          break;
        }
      },
      { threshold: 0.4 }
    );
    io.observe(node);

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [to, duration]);

  const safe = Math.max(0, value);
  const formatted = safe.toFixed(decimals);

  return (
    <span ref={ref} className={className} aria-label={`${prefix}${to}${suffix}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
