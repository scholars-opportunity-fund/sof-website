"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

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
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const node = ref.current;
    if (!node) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const shouldAnimate = !reducedMotion;
  const style: React.CSSProperties = shouldAnimate
    ? {
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${distance}px)`,
        transition:
          "opacity 600ms cubic-bezier(0.22, 1, 0.36, 1), transform 600ms cubic-bezier(0.22, 1, 0.36, 1)",
        transitionDelay: visible ? `${delay}ms` : "0ms",
        willChange: "opacity, transform",
      }
    : {};

  // Cast for ref, since ref may be different element types via 'as' prop.
  return (
    <Tag
      ref={ref as React.MutableRefObject<never>}
      style={style}
      className={className}
    >
      {children}
    </Tag>
  );
}
