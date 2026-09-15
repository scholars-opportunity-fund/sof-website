"use client";

import { useEffect, useRef, useState } from "react";
import Container from "@/components/ui/Container";
import styles from "./WeekInLife.module.css";

interface Day {
  key: string;
  label: string;
  title: string;
  focus: string;
  items: string[];
}

const DAYS: Day[] = [
  {
    key: "mon",
    label: "Mon",
    title: "Screen & Intake",
    focus: "Weekly digest review",
    items: [
      "The week's sourcing digest lands in the team inbox.",
      "Analysts review new candidates and claim one for the week.",
      "Initial hypothesis and capital-at-risk framing drafted before close of day.",
    ],
  },
  {
    key: "tue",
    label: "Tue",
    title: "Deep Dive",
    focus: "Fundamental research",
    items: [
      "Build out the full fundamental case: business model, capital structure, catalysts, downside.",
      "Pull filings, primary sources, conference call transcripts.",
      "Draft the first pass of the memo.",
    ],
  },
  {
    key: "wed",
    label: "Wed",
    title: "Validation",
    focus: "Modeling & base rates",
    items: [
      "Build the valuation and downside framing around the catalyst.",
      "Stress-test assumptions against historical base rates for comparable situations.",
      "Identify the weakest link in the bull case and write it up honestly.",
    ],
  },
  {
    key: "thu",
    label: "Thu",
    title: "Internal Review",
    focus: "Team stress test",
    items: [
      "Present your candidate to the rest of the cohort.",
      "The room tries to break the thesis. You adjust, kill, or escalate.",
      "Revisions go into the memo overnight.",
    ],
  },
  {
    key: "fri",
    label: "Fri",
    title: "Memo Handoff",
    focus: "CIO delivery & debrief",
    items: [
      "Final memo submitted to the Chief Investment Officer.",
      "Team retro on what got through, what didn't, and why.",
      "Position monitoring and LP reporting inputs updated for the week.",
    ],
  },
];

const LAST = DAYS.length - 1;
/** Desktop with motion allowed: the section pins and page scroll walks the week sideways.
 *  Everywhere else the cards are a native horizontal scroller. Keep in sync with the lg: classes. */
const PINNED = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
/** The sticky site header, which the pinned stage sits under. */
const HEADER = 72;
const GAP = 24;
/** Share of each day's scroll spent holding still before gliding to the next day. */
const HOLD = 0.35;

function dwell(raw: number) {
  const day = Math.floor(raw);
  const t = Math.min(1, Math.max(0, (raw - day - HOLD) / (1 - HOLD)));
  return day + t * t * (3 - 2 * t);
}

type Flip = { from: number; to: number; id: number };

export default function WeekInLife() {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(false);
  const activeRef = useRef(0);
  const flipId = useRef(0);

  const [active, setActive] = useState(0);
  // The calendar page lying flat. A flip animates over it, then hands off.
  const [base, setBase] = useState(0);
  const [flip, setFlip] = useState<Flip | null>(null);

  const cardStep = () => {
    const card = trackRef.current?.firstElementChild as HTMLElement | null;
    return card ? card.offsetWidth + GAP : 1;
  };

  const show = (index: number) => {
    const from = activeRef.current;
    if (index === from) return;
    activeRef.current = index;
    setActive(index);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setBase(index);
      setFlip(null);
      return;
    }
    // Forward tears the old page away from over the new one; backward drops the new page
    // over the old one, so the old page stays flat underneath until the drop lands.
    setBase(index > from ? index : from);
    setFlip({ from, to: index, id: ++flipId.current });
  };

  useEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!section || !viewport || !track) return;
    const query = window.matchMedia(PINNED);
    let frame = 0;
    let current = 0;
    let target = 0;

    const tick = () => {
      current += (target - current) * 0.14;
      if (Math.abs(target - current) < 0.001) current = target;
      track.style.transform = `translate3d(${-current * cardStep()}px, 0, 0)`;
      show(Math.round(current));
      frame = current === target ? 0 : requestAnimationFrame(tick);
    };

    const onScroll = () => {
      if (!pinnedRef.current) return;
      const range = section.offsetHeight - window.innerHeight + HEADER;
      const progress = Math.min(1, Math.max(0, (HEADER - section.getBoundingClientRect().top) / range));
      target = dwell(progress * LAST);
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onTrackScroll = () => {
      if (!pinnedRef.current) show(Math.min(LAST, Math.round(viewport.scrollLeft / cardStep())));
    };

    const apply = () => {
      pinnedRef.current = query.matches;
      cancelAnimationFrame(frame);
      frame = 0;
      if (pinnedRef.current) {
        viewport.scrollLeft = 0;
        onScroll();
      } else {
        track.style.transform = "";
        onTrackScroll();
      }
    };

    apply();
    query.addEventListener("change", apply);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", apply);
    viewport.addEventListener("scroll", onTrackScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      query.removeEventListener("change", apply);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", apply);
      viewport.removeEventListener("scroll", onTrackScroll);
    };
  }, []);

  const goTo = (index: number) => {
    const section = sectionRef.current;
    if (!section) return;
    if (pinnedRef.current) {
      const range = section.offsetHeight - window.innerHeight + HEADER;
      // Land in the middle of that day's hold, so the glide settles on it.
      const raw = Math.min(LAST, index + HOLD / 2);
      const top = section.getBoundingClientRect().top + window.scrollY - HEADER + (raw / LAST) * range;
      window.scrollTo({ top, behavior: "smooth" });
    } else {
      viewportRef.current?.scrollTo({ left: index * cardStep(), behavior: "smooth" });
    }
  };

  const forward = flip ? flip.to > flip.from : true;

  return (
    <section
      ref={sectionRef}
      id="week"
      className="relative overflow-x-clip border-t border-border/60 bg-cloud lg:h-[380vh] motion-reduce:lg:h-auto"
    >
      <div className="py-16 sm:py-24 lg:sticky lg:top-[72px] lg:flex lg:h-[calc(100vh-72px)] lg:items-center lg:py-0 motion-reduce:lg:static motion-reduce:lg:h-auto motion-reduce:lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:items-center lg:gap-20">
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
                Rhythm
              </p>
              <h2 className="mt-6 text-4xl sm:text-5xl">A week in the life</h2>
              <p className="mt-6 max-w-sm text-[17px] leading-[1.8] text-foreground-muted">
                A typical analyst week, from Monday&apos;s sourcing digest to
                Friday&apos;s memo handoff.
              </p>

              <div className="mt-10 flex items-end gap-8">
                <div aria-hidden="true" className={`${styles.calendar} relative w-36 shrink-0`}>
                  <div className="relative z-20 flex h-6 items-center justify-center gap-14 bg-ink">
                    <span className="-mt-4 h-4 w-1.5 rounded-full bg-gunmetal ring-2 ring-cloud" />
                    <span className="-mt-4 h-4 w-1.5 rounded-full bg-gunmetal ring-2 ring-cloud" />
                  </div>
                  <div className="relative h-36">
                    <div className="absolute inset-x-1.5 -bottom-2 h-full border border-border bg-background-alt" />
                    <div className="absolute inset-x-0.5 -bottom-1 h-full border border-border bg-background-alt" />
                    <CalendarSheet index={base} className="z-0" />
                    {flip && (
                      <CalendarSheet
                        key={flip.id}
                        index={forward ? flip.from : flip.to}
                        className={`z-10 ${forward ? styles.tearAway : styles.dropIn}`}
                        onAnimationEnd={() => {
                          setBase(flip.to);
                          setFlip(null);
                        }}
                      />
                    )}
                  </div>
                </div>

                <div role="group" aria-label="Jump to a day" className="flex flex-col gap-1">
                  {DAYS.map((d, i) => (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => goTo(i)}
                      aria-current={i === active ? "step" : undefined}
                      className={[
                        "flex items-center gap-3 py-0.5 text-left text-[11px] font-medium tracking-[0.18em] uppercase transition-colors focus:outline-none focus-visible:text-copper",
                        i === active ? "text-ink" : "text-foreground-muted hover:text-ink",
                      ].join(" ")}
                    >
                      <span
                        aria-hidden="true"
                        className={[
                          "h-px transition-[width,background-color] duration-300",
                          i === active ? "w-6 bg-copper" : "w-3 bg-border",
                        ].join(" ")}
                      />
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div
              ref={viewportRef}
              className="scrollbar-hide -mx-8 min-w-0snap-x snap-mandatory scroll-px-8 overflow-x-auto px-8 lg:mx-0 lg:snap-none lg:overflow-visible lg:px-0 lg:[clip-path:inset(-50%_-100vw_-50%_0)] motion-reduce:lg:snap-x motion-reduce:lg:overflow-x-auto motion-reduce:lg:[clip-path:none]"
            >
              <div ref={trackRef} className="flex will-change-transform" style={{ gap: GAP }}>
                {DAYS.map((d, i) => (
                  <article
                    key={d.key}
                    aria-label={`${d.label}: ${d.title}`}
                    className={[
                      "w-[85%] shrink-0 snap-start border border-border/60 bg-background-alt p-8 transition-opacity duration-500 sm:p-10 lg:w-[88%]",
                      i === active ? "opacity-100" : "opacity-40",
                    ].join(" ")}
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="text-[11px] font-medium tracking-[0.18em] text-copper uppercase">
                        {d.focus}
                      </p>
                      <p className="text-[11px] font-medium tracking-[0.18em] text-foreground-muted uppercase">
                        {d.label}
                      </p>
                    </div>
                    <h3 className="mt-3 font-heading text-2xl text-ink sm:text-3xl">{d.title}</h3>
                    <ul className="mt-6 space-y-4">
                      {d.items.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-4 text-[15px] leading-relaxed text-foreground-secondary"
                        >
                          <span aria-hidden="true" className="mt-[10px] inline-block h-px w-5 shrink-0 bg-copper" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}

function CalendarSheet({
  index,
  className = "",
  onAnimationEnd,
}: {
  index: number;
  className?: string;
  onAnimationEnd?: () => void;
}) {
  const day = DAYS[index];
  return (
    <div
      onAnimationEnd={onAnimationEnd}
      className={`${styles.sheet} absolute inset-0 flex flex-col items-center justify-center border border-t-0 border-border bg-background-alt ${className}`}
    >
      <span className="text-[10px] font-medium tracking-[0.2em] text-copper uppercase">
        Day {index + 1}
      </span>
      <span className="mt-1 font-heading text-5xl leading-none text-ink">{day.label}</span>
      <span className="mt-3 px-3 text-center text-[11px] leading-snug text-foreground-muted">
        {day.title}
      </span>
    </div>
  );
}
