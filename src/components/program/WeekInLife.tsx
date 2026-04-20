"use client";

import { useState } from "react";

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
      "The quantitative model's new candidate set lands in the team inbox.",
      "Analysts skim every new filing and claim one for the week.",
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
    title: "Quant Layer",
    focus: "Modeling & validation",
    items: [
      "Layer the model's signal contribution onto your fundamental thesis.",
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

export default function WeekInLife() {
  const [activeKey, setActiveKey] = useState(DAYS[0].key);
  const active = DAYS.find((d) => d.key === activeKey) ?? DAYS[0];

  return (
    <div>
      {/* Tab strip */}
      <div
        role="tablist"
        aria-label="A week at Scholars Opportunity Fund"
        className="flex flex-wrap gap-px bg-border/60"
      >
        {DAYS.map((d) => {
          const isActive = d.key === activeKey;
          return (
            <button
              key={d.key}
              role="tab"
              aria-selected={isActive}
              aria-controls={`week-panel-${d.key}`}
              id={`week-tab-${d.key}`}
              onClick={() => setActiveKey(d.key)}
              className={[
                "flex-1 min-w-[88px] bg-background px-4 py-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-inset",
                isActive
                  ? "bg-ink text-cloud"
                  : "text-foreground-muted hover:text-ink hover:bg-cloud",
              ].join(" ")}
            >
              <span className="block text-[11px] font-medium tracking-[0.18em] uppercase">
                {d.label}
              </span>
              <span
                className={[
                  "mt-1 block font-heading text-sm",
                  isActive ? "text-cloud" : "text-ink",
                ].join(" ")}
              >
                {d.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <div
        role="tabpanel"
        id={`week-panel-${active.key}`}
        aria-labelledby={`week-tab-${active.key}`}
        className="border-t border-border/60 bg-background p-8 sm:p-10"
      >
        <p className="text-[11px] font-medium tracking-[0.18em] text-copper uppercase">
          {active.focus}
        </p>
        <h3 className="mt-3 font-heading text-2xl text-ink sm:text-3xl">
          {active.title}
        </h3>
        <ul className="mt-6 space-y-4">
          {active.items.map((item) => (
            <li
              key={item}
              className="flex items-start gap-4 text-[15px] leading-relaxed text-foreground-secondary"
            >
              <span
                aria-hidden="true"
                className="mt-[10px] inline-block h-px w-5 shrink-0 bg-copper"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
