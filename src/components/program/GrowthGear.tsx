"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import styles from "./GrowthGear.module.css";

const PHASES = [
  {
    phase: "First Semester",
    text: "Learn how the fund researches and tests strategies. Join an existing strategy team with support from returning analysts.",
  },
  {
    phase: "Returning Analyst",
    text: "Own part of a strategy from research through testing. Present your work in review and help monitor strategies that trade.",
  },
  {
    phase: "Senior Analyst",
    text: "Lead a strategy team, review other teams' work, and help train new analysts.",
  },
];

const TEETH = 12;
const OUTER = 100;
const ROOT = 86;
/** Phase markers sit a third of a turn apart, counter-clockwise from 3 o'clock,
 *  so a clockwise turn of 120° brings the next one round to face the text. */
const MARKER_RADIUS = 56;
/** The section pins under the header while the reader scrolls this runway, and the scroll turns
 *  the gear through the phases. LEAD is the share of the runway held still at each end, so the
 *  pinned stage settles before the first turn and shows the last phase before it lets go. */
const RUNWAY = "h-[140svh]";
const LEAD = 0.12;

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

/** How far down the runway (0 to 1) phase i faces the text. */
const stopFor = (i: number) => LEAD + ((1 - 2 * LEAD) * i) / (PHASES.length - 1);

/** The growth section. Its heading comes in as children so the copy stays on the page. */
export default function GrowthGear({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const gearRef = useRef<SVGGElement>(null);
  const numeralRefs = useRef<(SVGTextElement | null)[]>([]);
  const barRef = useRef<HTMLSpanElement>(null);
  const selectRef = useRef<(index: number) => void>(() => {});
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const pin = pinRef.current;
    const gear = gearRef.current;
    const bar = barRef.current;
    if (!root || !track || !pin || !gear || !bar) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let angle = 0;
    let target = 0;
    let frame = 0;
    let pinned = false;
    let pinTop = 0;

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

    const tick = () => {
      angle += (target - angle) * 0.12;
      if (Math.abs(target - angle) < 0.05) angle = target;
      paint();
      frame = angle === target ? 0 : requestAnimationFrame(tick);
    };

    const turn = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    // The pinned stage's distance down its runway, as a share of the runway.
    const travelled = () => {
      const box = track.getBoundingClientRect();
      const run = box.height - pin.offsetHeight;
      return run > 0 ? (pin.getBoundingClientRect().top - box.top) / run : 0;
    };

    const locate = () => {
      if (!pinned) return;
      target = angleAt(Math.min(1, Math.max(0, (travelled() - LEAD) / (1 - 2 * LEAD))));
    };

    // Pin only when the stage fits under the header with room to spare, and centre it there.
    // A short screen (a phone on its side) or reduced motion leaves the section in the flow,
    // and the phase tabs turn the gear instead.
    const measure = () => {
      const header = document.querySelector("header")?.offsetHeight ?? 0;
      const room = window.innerHeight - header;
      pinned = !still && pin.offsetHeight <= room - 32;
      pinTop = header + Math.max(16, (room - pin.offsetHeight) / 2);
      root.style.setProperty("--pin", `${pinTop}px`);
      root.dataset.pinned = String(pinned);
      locate();
    };

    selectRef.current = (i) => {
      if (!pinned) {
        target = i * 120;
        if (still) {
          angle = target;
          paint();
        } else turn();
        return;
      }
      // Scroll to the point on the runway where this phase faces the text, so the gear turns there by scroll.
      const box = track.getBoundingClientRect();
      const at = stopFor(i) * (box.height - pin.offsetHeight);
      window.scrollTo({ top: window.scrollY + box.top + at - pinTop, behavior: "smooth" });
    };

    const onScroll = () => {
      locate();
      turn();
    };

    const onResize = () => {
      measure();
      turn();
    };

    // Open on wherever the page already is (a reload partway down, a #growth link) without spinning up to it.
    measure();
    angle = target;
    frame = requestAnimationFrame(tick);
    const observer = new ResizeObserver(onResize);
    observer.observe(pin);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section ref={rootRef} id="growth" className="group/growth py-16 [--pin:88px] sm:py-24">
      <Container>
        <Reveal>
          <div className="grid gap-16 lg:grid-cols-[1fr_1.5fr] lg:gap-24">
            {/* On wide screens the heading pins beside the gear; on phones it scrolls away first. */}
            <div className="lg:self-start lg:group-data-[pinned=true]/growth:sticky lg:group-data-[pinned=true]/growth:top-[var(--pin)]">
              {children}
            </div>

            <div ref={trackRef}>
              <div
                ref={pinRef}
                className="group-data-[pinned=true]/growth:sticky group-data-[pinned=true]/growth:top-[var(--pin)]"
              >
                <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:gap-0">
                  <div className="relative w-40 shrink-0 sm:w-56">
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
                          "col-start-1 row-start-1 border border-border/60 bg-background-alt p-6 sm:p-10",
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

                <div role="tablist" aria-label="Phases" className="relative mt-6 grid grid-cols-3 gap-px bg-border/60 sm:mt-10">
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
              {/* The runway the stage stays pinned over while the scroll turns the gear. */}
              <div aria-hidden="true" className={`hidden ${RUNWAY} group-data-[pinned=true]/growth:block`} />
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
