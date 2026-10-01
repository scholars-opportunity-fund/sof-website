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

const TEETH = 12;
const OUTER = 100;
const ROOT = 86;
/** Phase markers sit a third of a turn apart, counter-clockwise from 3 o'clock,
 *  so a clockwise turn of 120° brings the next one round to face the text. */
const MARKER_RADIUS = 56;
/** Scroll turns the gear. It rests on phase 1 until the middle of the gear and card rises past
 *  START (a fraction of the screen's height), and lands on the last phase as it reaches END. */
const START = 0.8;
const END = 0.25;

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

/** Scroll progress (0 to 1) to the gear's angle. Each third of a turn eases in and out, so the
 *  gear lingers on a phase while its card is read and turns briskly between phases. */
function angleAt(progress: number) {
  const x = progress * (PHASES.length - 1);
  const k = Math.min(Math.floor(x), PHASES.length - 2);
  const t = x - k;
  return 120 * (k + t * t * t * (t * (t * 6 - 15) + 10));
}

/** Where on screen the middle of the gear and card sits when phase i faces the text. */
const lineFor = (i: number) => START - ((START - END) * i) / (PHASES.length - 1);

export default function GrowthGear() {
  const stageRef = useRef<HTMLDivElement>(null);
  const gearRef = useRef<SVGGElement>(null);
  const numeralRefs = useRef<(SVGTextElement | null)[]>([]);
  const barRef = useRef<HTMLSpanElement>(null);
  const selectRef = useRef<(index: number) => void>(() => {});
  const [active, setActive] = useState(0);

  useEffect(() => {
    const stage = stageRef.current;
    const gear = gearRef.current;
    const bar = barRef.current;
    if (!stage || !gear || !bar) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let angle = 0;
    let target = 0;
    let frame = 0;

    const paint = () => {
      gear.style.transform = `rotate(${angle}deg)`;
      // The numerals turn back the same amount so they stay upright.
      numeralRefs.current.forEach((numeral) => {
        if (numeral) numeral.style.transform = `rotate(${-angle}deg)`;
      });
      // The tab underline slides with the gear; each step is a column plus the 1px gap.
      bar.style.transform = `translateX(calc(${angle / 120} * (100% + 1px)))`;
      setActive(Math.round(angle / 120));
    };

    // Reduced motion keeps the gear off the scroll; the phase tabs set it directly.
    if (still) {
      selectRef.current = (i) => {
        angle = i * 120;
        paint();
      };
      return;
    }

    const middle = () => {
      const box = stage.getBoundingClientRect();
      return box.top + box.height / 2;
    };

    const locate = () => {
      const progress = (START - middle() / window.innerHeight) / (START - END);
      target = angleAt(Math.min(1, Math.max(0, progress)));
    };

    const tick = () => {
      angle += (target - angle) * 0.12;
      if (Math.abs(target - angle) < 0.05) angle = target;
      paint();
      frame = angle === target ? 0 : requestAnimationFrame(tick);
    };

    const onScroll = () => {
      locate();
      if (!frame) frame = requestAnimationFrame(tick);
    };

    // A tab scrolls the page to where its phase faces the text, so the gear turns there by scroll too.
    selectRef.current = (i) => {
      window.scrollBy({ top: middle() - window.innerHeight * lineFor(i), behavior: "smooth" });
    };

    // Open on wherever the page already is (a reload partway down, a #growth link) without spinning up to it.
    locate();
    angle = target;
    frame = requestAnimationFrame(tick);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div>
      <div ref={stageRef} className="flex flex-col items-center gap-10 sm:flex-row sm:items-center sm:gap-0">
        <div className="relative w-48 shrink-0 sm:w-56">
          <svg viewBox="-112 -112 224 224" className="block w-full overflow-visible" aria-hidden="true">
            <g ref={gearRef} className={styles.gear}>
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
                      ref={(el) => {
                        numeralRefs.current[i] = el;
                      }}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="13"
                      fontWeight="500"
                      fill={on ? "var(--cloud)" : "var(--slate)"}
                      className={styles.numeral}
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

        {/* Every card shares one grid cell, so the stage keeps the tallest card's height and
            the scroll position the gear reads never jumps when the phase changes. */}
        <div className="grid w-full">
          {PHASES.map((p, i) => (
            <div
              key={p.phase}
              role="tabpanel"
              id={`growth-panel-${i}`}
              aria-labelledby={`growth-tab-${i}`}
              className={[
                "col-start-1 row-start-1 border border-border/60 bg-background-alt p-8 sm:p-10",
                i === active ? styles.pop : "invisible",
              ].join(" ")}
            >
              <span className="text-[11px] font-medium tracking-[0.15em] text-copper uppercase">
                Phase {i + 1}
              </span>
              <h3 className="mt-4 font-heading text-2xl text-ink">{p.phase}</h3>
              <p className="mt-4 text-[15px] leading-relaxed text-foreground-muted">{p.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div role="tablist" aria-label="Phases" className="relative mt-10 grid grid-cols-3 gap-px bg-border/60">
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
              onClick={() => selectRef.current(i)}
              className={[
                "bg-cloud px-4 py-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-copper",
                on ? "text-ink" : "text-foreground-muted hover:text-ink",
              ].join(" ")}
            >
              <span className="block text-[11px] font-medium tracking-[0.15em] uppercase">Phase {i + 1}</span>
              <span className="mt-1 block font-heading text-sm">{p.phase}</span>
            </button>
          );
        })}
        <span
          ref={barRef}
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-[calc((100%-2px)/3)] bg-copper"
        />
      </div>
    </div>
  );
}
