import { MICROCAP } from "@/lib/constants";

/**
 * Registration callout for the fall competition, shared by the homepage and
 * /program. Links out to SOF Scholars, where students register their team.
 */
export default function MicrocapCallout({ id = "competition", className = "" }: { id?: string; className?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`scroll-mt-24 border-border bg-background-alt py-14 sm:py-16 ${className}`}>
      <div className="mx-auto grid w-full max-w-[1376px] gap-8 px-6 sm:px-12 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-24">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-3 text-xs font-medium tracking-[0.22em] text-copper uppercase">
            <span aria-hidden="true" className="h-px w-8 bg-copper" />
            Student competition · {MICROCAP.dates}
          </p>
          <h2 id={`${id}-title`} className="mt-5 text-[34px] text-ink text-balance break-words sm:text-[44px]">
            {MICROCAP.name}
          </h2>
        </div>
        <div className="min-w-0">
          <p className="text-[17px] leading-[1.7] text-foreground-secondary">
            A hybrid case competition for student teams of 2–3, run on SOF Scholars.
            Registration is free and closes {MICROCAP.registrationCloses}.
          </p>
          <a
            href={MICROCAP.href}
            className="mt-7 inline-flex items-center bg-ink px-7 py-4 text-sm font-medium tracking-[0.03em] text-cloud transition-colors hover:bg-gunmetal"
          >
            Register your team →
          </a>
        </div>
      </div>
    </section>
  );
}
