"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const STATIONS = [
  {
    title: "Candidate Analysis",
    note: "Challenged before it reaches the CIO",
    text: "Build a collective investment case on each screened candidate. Conclusions are challenged internally before they reach the CIO. The standard is whether the work is fit to inform a real capital decision.",
    icon: (
      <>
        <circle cx="9.5" cy="9.5" r="5.5" />
        <path d="M13.5 13.5 19 19" />
      </>
    ),
    offset: "ml-5 sm:ml-[16%]",
  },
  {
    title: "Position Monitoring",
    note: "Update within 24 hours",
    text: "When a position drifts from thesis or a material event occurs, the team investigates and delivers an update within 24 hours.",
    icon: <path d="M2 11h4l2.5-6 3.5 11 2.5-7 1.5 2h4" />,
    offset: "ml-0",
  },
  {
    title: "Quarterly Reporting",
    note: "Straight to the LPs",
    text: "Students produce the analytical inputs for LP reporting, a direct line of accountability from their work product to the people whose capital is deployed.",
    icon: (
      <>
        <rect x="4" y="3" width="14" height="16" rx="1" />
        <path d="M8 15v-3M11 15V8M14 15v-5" />
      </>
    ),
    offset: "ml-5 sm:ml-[30%]",
  },
];

/** Where on screen the tip of the thread sits: it draws down to meet the reader's eye line. */
const EYE_LINE = 0.62;

export default function WorkThread() {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<SVGPathElement>(null);
  const threadRef = useRef<SVGPathElement>(null);
  const beadRef = useRef<SVGCircleElement>(null);
  const nodeRefs = useRef<(HTMLElement | null)[]>([]);
  // Sourcing, the three stations, then the LPs.
  const [lit, setLit] = useState(-1);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const thread = threadRef.current;
    const bead = beadRef.current;
    if (!root || !track || !thread || !bead) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let points: [number, number][] = [];
    let stops: number[] = [];
    let total = 0;
    let drawn = 0;
    let target = 0;
    let frame = 0;

    const measure = () => {
      const box = root.getBoundingClientRect();
      points = nodeRefs.current.map((node) => {
        const r = node!.getBoundingClientRect();
        return [r.left + r.width / 2 - box.left, r.top + r.height / 2 - box.top];
      });
      let d = `M ${points[0][0]} ${points[0][1]}`;
      stops = [0];
      for (let i = 1; i < points.length; i++) {
        const [x0, y0] = points[i - 1];
        const [x1, y1] = points[i];
        // Drop straight down beside the station's text, then bend across in the gap above the
        // next node, so the thread never crosses a paragraph.
        const bend = Math.min(80, (y1 - y0) * 0.6);
        d += ` L ${x0} ${y1 - bend} C ${x0} ${y1 - bend / 3}, ${x1} ${y1 - (bend * 2) / 3}, ${x1} ${y1}`;
        // Measure as we go, so each station knows how far along the thread it sits.
        thread.setAttribute("d", d);
        stops.push(thread.getTotalLength());
      }
      track.setAttribute("d", d);
      total = stops[stops.length - 1];
      thread.style.strokeDasharray = `${total}`;
      locate();
      if (still) drawn = target;
      paint();
    };

    // Map the eye line to a length along the thread. The path only ever runs downward,
    // so find the segment the eye line is in and interpolate between its stops.
    const locate = () => {
      const y = window.innerHeight * EYE_LINE - root.getBoundingClientRect().top;
      if (still || y >= points[points.length - 1][1]) return void (target = total);
      if (y <= points[0][1]) return void (target = 0);
      const i = points.findIndex(([, py]) => py > y);
      const [, y0] = points[i - 1];
      const [, y1] = points[i];
      target = stops[i - 1] + ((y - y0) / (y1 - y0)) * (stops[i] - stops[i - 1]);
    };

    const paint = () => {
      thread.style.strokeDashoffset = `${total - drawn}`;
      const tip = thread.getPointAtLength(drawn);
      bead.setAttribute("transform", `translate(${tip.x} ${tip.y})`);
      bead.style.opacity = drawn > 1 && drawn < total - 1 ? "1" : "0";
      let reached = -1;
      stops.forEach((stop, i) => {
        if (drawn >= stop - 1) reached = i;
      });
      setLit(reached);
    };

    const tick = () => {
      drawn += (target - drawn) * 0.12;
      if (Math.abs(target - drawn) < 0.5) drawn = target;
      paint();
      frame = drawn === target ? 0 : requestAnimationFrame(tick);
    };

    const onScroll = () => {
      locate();
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const observer = new ResizeObserver(measure);
    observer.observe(root);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const on = (i: number) => lit >= i;

  return (
    <div ref={rootRef} className="relative">
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        <path ref={trackRef} fill="none" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="2 6" strokeLinecap="round" />
        <path ref={threadRef} fill="none" stroke="var(--copper)" strokeWidth="1.5" strokeLinecap="round" />
        <circle ref={beadRef} r="4" fill="var(--copper)" opacity="0">
          <animate attributeName="r" values="3.5;5.5;3.5" dur="1.6s" repeatCount="indefinite" />
        </circle>
      </svg>

      <div className="relative space-y-16">
        <Stop
          nodeRef={(el) => { nodeRefs.current[0] = el; }}
          lit={on(0)}
          node={<span className="h-2.5 w-2.5 rounded-full bg-current" />}
          size="h-11 w-11 border-transparent"
        >
          <p className="text-[11px] font-medium tracking-[0.2em] uppercase">Sourcing</p>
          <p className="mt-1 text-[15px] text-foreground-muted">A catalyst-driven candidate surfaces.</p>
        </Stop>

        {STATIONS.map((s, i) => (
          <Stop
            key={s.title}
            nodeRef={(el) => { nodeRefs.current[i + 1] = el; }}
            lit={on(i + 1)}
            className={s.offset}
            node={
              <svg viewBox="0 0 22 22" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                {s.icon}
              </svg>
            }
          >
            <h3 className={`font-heading text-xl transition-colors duration-500 ${on(i + 1) ? "text-ink" : "text-foreground-muted"}`}>
              {s.title}
            </h3>
            <p className="mt-1 text-[11px] font-medium tracking-[0.18em] text-copper uppercase">{s.note}</p>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-foreground-muted">{s.text}</p>
          </Stop>
        ))}

        <Stop
          nodeRef={(el) => { nodeRefs.current[STATIONS.length + 1] = el; }}
          lit={on(STATIONS.length + 1)}
          className="ml-5 sm:ml-[30%]"
          node={<span className="h-3 w-3 rounded-full border-2 border-current" />}
        >
          <p className="text-[11px] font-medium tracking-[0.2em] uppercase">Limited Partners</p>
          <p className="mt-1 text-[15px] text-foreground-muted">The people whose capital is deployed.</p>
        </Stop>
      </div>
    </div>
  );
}

function Stop({
  nodeRef,
  lit,
  node,
  size = "h-11 w-11",
  className = "",
  children,
}: {
  nodeRef: (el: HTMLElement | null) => void;
  lit: boolean;
  node: ReactNode;
  size?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`flex items-start gap-5 ${className}`}>
      <span
        ref={nodeRef}
        className={[
          "grid shrink-0 place-items-center rounded-full border transition-[color,border-color,background-color,box-shadow] duration-500",
          size,
          lit
            ? "border-copper bg-background-alt text-copper shadow-[0_0_0_6px_rgba(160,117,90,0.12)]"
            : "border-border bg-background text-slate",
        ].join(" ")}
      >
        {node}
      </span>
      <div className={`pt-2.5 transition-opacity duration-500 ${lit ? "opacity-100" : "opacity-50"}`}>{children}</div>
    </div>
  );
}
