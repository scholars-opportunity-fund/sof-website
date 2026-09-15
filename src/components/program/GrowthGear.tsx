"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./GrowthGear.module.css";

const PHASES = [
  {
    phase: "First Semester",
    text: "Learn the research methodology, shadow live sourcing and diligence, and contribute to collective memos under supervision.",
  },
  {
    phase: "Returning Analyst",
    text: "Own candidate memos end-to-end. Position monitoring, event-driven updates, and direct input into LP reporting.",
  },
  {
    phase: "Senior Cohort",
    text: "Co-lead the research process, mentor new analysts, and run internal review sessions before memos reach the CIO.",
  },
];

/** How long each phase holds before the gear turns to the next. */
const DWELL = 5000;
const TEETH = 12;
const OUTER = 100;
const ROOT = 86;
/** Phase markers sit a third of a turn apart, counter-clockwise from 3 o'clock,
 *  so a clockwise turn of 120° brings the next one round to face the text. */
const MARKER_RADIUS = 56;

function gearPath() {
  const step = (Math.PI * 2) / TEETH;
  const top = step * 0.22;
  const base = step * 0.34;
  const point = (r: number, a: number) => `${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`;
  let d = "";
  for (let k = 0; k < TEETH; k++) {
    const a = k * step;
    d += `${k === 0 ? "M" : "L"} ${point(ROOT, a - base)} L ${point(OUTER, a - top)} L ${point(OUTER, a + top)} L ${point(ROOT, a + base)} `;
    d += `A ${ROOT} ${ROOT} 0 0 1 ${point(ROOT, a + step - base)} `;
  }
  return d + "Z";
}

const GEAR = gearPath();

export default function GrowthGear() {
  const rootRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  // Cumulative, so the gear always turns the same way, including from phase 3 back to 1.
  const [rotation, setRotation] = useState(0);
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);
  const [stopped, setStopped] = useState(false);

  const turnTo = (index: number) => {
    const steps = (index - activeRef.current + PHASES.length) % PHASES.length;
    if (!steps) return;
    activeRef.current = index;
    setActive(index);
    setRotation((r) => r + steps * 120);
  };

  useEffect(() => {
    const node = rootRef.current;
    // Reduced motion never auto-advances; the phase buttons still work.
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.5,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const cycling = inView && !paused && !stopped;

  useEffect(() => {
    if (!cycling) return;
    const timer = window.setTimeout(() => turnTo((active + 1) % PHASES.length), DWELL);
    return () => window.clearTimeout(timer);
  }, [cycling, active]);

  const current = PHASES[active];

  return (
    <div
      ref={rootRef}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="flex flex-col items-center gap-10 sm:flex-row sm:items-center sm:gap-0">
        <div className="relative w-48 shrink-0 sm:w-56">
          <svg viewBox="-112 -112 224 224" className="block w-full overflow-visible" aria-hidden="true">
            <g className={styles.gear} style={{ transform: `rotate(${rotation}deg)` }}>
              <path d={GEAR} fill="var(--background-alt)" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round" />
              <circle r="70" fill="none" stroke="var(--border)" strokeWidth="1" />
              <circle r="16" fill="var(--ink)" />
              <circle r="5" fill="var(--background-alt)" />
              {PHASES.map((_, i) => {
                const angle = (-120 * i * Math.PI) / 180;
                // Rounded so the server and browser print the same attribute and hydration matches.
                const x = Math.round(MARKER_RADIUS * Math.cos(angle) * 100) / 100;
                const y = Math.round(MARKER_RADIUS * Math.sin(angle) * 100) / 100;
                const on = i === active;
                return (
                  <g key={i}>
                    <line x1={0} y1={0} x2={x} y2={y} stroke="var(--border)" strokeWidth="1" />
                    <circle
                      cx={x}
                      cy={y}
                      r="15"
                      fill={on ? "var(--copper)" : "var(--background-alt)"}
                      stroke={on ? "var(--copper)" : "var(--slate)"}
                      strokeWidth="1"
                      className={styles.marker}
                    />
                    <text
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="13"
                      fontWeight="500"
                      fill={on ? "var(--cloud)" : "var(--slate)"}
                      className={styles.numeral}
                      style={{ transform: `rotate(${-rotation}deg)` }}
                    >
                      {i + 1}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        <span aria-hidden="true" className="hidden h-px w-10 shrink-0 bg-copper sm:block" />

        <div
          key={active}
          role="tabpanel"
          id={`growth-panel-${active}`}
          aria-labelledby={`growth-tab-${active}`}
          className={`${styles.pop} w-full border border-border/60 bg-background-alt p-8 sm:p-10`}
        >
          <span className="text-[11px] font-medium tracking-[0.15em] text-copper uppercase">
            Phase {active + 1}
          </span>
          <h3 className="mt-4 font-heading text-2xl text-ink">{current.phase}</h3>
          <p className="mt-4 text-[15px] leading-relaxed text-foreground-muted">{current.text}</p>
        </div>
      </div>

      <div role="tablist" aria-label="Phases" className="mt-10 grid grid-cols-3 gap-px bg-border/60">
        {PHASES.map((p, i) => {
          const on = i === active;
          return (
            <button
              key={p.phase}
              type="button"
              role="tab"
              id={`growth-tab-${i}`}
              aria-selected={on}
              aria-controls={`growth-panel-${i}`}
              onClick={() => {
                setStopped(true);
                turnTo(i);
              }}
              className={[
                "relative overflow-hidden bg-cloud px-4 py-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-copper",
                on ? "text-ink" : "text-foreground-muted hover:text-ink",
              ].join(" ")}
            >
              <span className="block text-[11px] font-medium tracking-[0.15em] uppercase">Phase {i + 1}</span>
              <span className="mt-1 block font-heading text-sm">{p.phase}</span>
              {on && (
                <span
                  key={`${active}-${cycling}`}
                  aria-hidden="true"
                  className={`absolute bottom-0 left-0 h-0.5 w-full bg-copper ${cycling ? styles.progress : ""}`}
                  style={cycling ? { animationDuration: `${DWELL}ms` } : undefined}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
