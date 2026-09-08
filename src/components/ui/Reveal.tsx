"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Delay in ms before the reveal transition runs after entering the viewport. */
  delay?: number;
  /** Distance (px) the element slides up from. */
  distance?: number;
  /** Custom class applied to the wrapper element (for layout). */
  className?: string;
  /** Optionally render as a different element. Defaults to 'div'. */
  as?: "div" | "section" | "article" | "li";
}

/**
 * Wraps any block and gently fades + slides it into view when it enters the
 * viewport. Fires once. Respects prefers-reduced-motion (no transition at all).
 */
export default function Reveal({
  children,
  delay = 0,
  distance = 16,
  className = "",
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const node = ref.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!node || preference.matches) return;

    // The server renders visible content, including when JavaScript never loads.
    const animation = node.animate([
      { opacity: 0, transform: `translateY(${distance}px)` },
      { opacity: 1, transform: 'translateY(0)' },
    ], { duration: 600, delay, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' });
    animation.pause();
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        animation.play();
        observer.disconnect();
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    observer.observe(node);
    const stop = () => {
      if (preference.matches) {
        animation.cancel();
        observer.disconnect();
        preference.removeEventListener('change', stop);
      }
    };
    animation.onfinish = () => preference.removeEventListener('change', stop);
    preference.addEventListener('change', stop);
    return () => {
      animation.onfinish = null;
      animation.cancel();
      observer.disconnect();
      preference.removeEventListener('change', stop);
    };
  }, [delay, distance]);

  // Cast for ref, since ref may be different element types via 'as' prop.
  return (
    <Tag
      ref={ref as React.MutableRefObject<never>}
      className={className}
    >
      {children}
    </Tag>
  );
}
