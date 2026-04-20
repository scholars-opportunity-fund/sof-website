import Image from "next/image";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import CountUp from "@/components/ui/CountUp";
import { generatePageMetadata } from "@/lib/seo";
import { CIO } from "@/lib/team";

export const metadata = generatePageMetadata({
  title: "About",
  description:
    "Scholars Opportunity Fund runs a quantitative investment process targeting special situations in public equities. Led by Dr. Jonathan Brogaard.",
  path: "/about",
});

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Systematic Detection",
    text: "A proprietary platform continuously monitors regulatory filings and market data, scoring candidates against the fund's special-situation criteria.",
  },
  {
    step: "02",
    title: "Analyst Review",
    text: "Candidates clearing the threshold enter structured fundamental review. Student analysts build a collective case, stress-tested internally before it leaves the team.",
  },
  {
    step: "03",
    title: "Decision",
    text: "A final investment memo reaches the Chief Investment Officer, who owns position sizing, entry, and exit.",
  },
  {
    step: "04",
    title: "Monitoring & Reporting",
    text: "Positions are continuously monitored for drift and material events. LP reporting closes the loop between analytical work and capital outcome.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink py-24 sm:py-32">
        {/* Subtle signal/copper accents */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full bg-copper/10 blur-3xl" />
          <div className="absolute -bottom-60 -left-40 h-[520px] w-[520px] rounded-full bg-signal/5 blur-3xl" />
        </div>
        <Container className="relative">
          <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
            About the Fund
          </p>
          <h1 className="mt-6 max-w-3xl text-5xl text-cloud sm:text-6xl lg:text-[72px] lg:leading-[1.1]">
            Scholars Opportunity Fund
          </h1>
          <p className="mt-8 max-w-xl text-[17px] leading-[1.8] text-foreground-on-dark-muted">
            A quantitative investment process targeting special situations in
            the public equity universe, where institutional coverage is thinnest
            and pricing inefficiency is highest.
          </p>
        </Container>
      </section>

      {/* Fund at a glance */}
      <section className="border-b border-border/60 bg-cloud py-10 sm:py-14">
        <Container>
          <div className="grid grid-cols-3 gap-px bg-border/60">
            <Stat label="Universe" value="Public Equities" />
            <Stat label="Strategy" value="Special Situations" />
            <Stat
              label="Cohort Size"
              render={<CountUp to={11} suffix=" Analysts" />}
            />
          </div>
        </Container>
      </section>

      {/* Investment process */}
      <section className="py-16 sm:py-24">
        <Container>
          <Reveal className="grid gap-16 lg:grid-cols-[1fr_1.5fr] lg:gap-24">
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
                Investment Process
              </p>
              <h2 className="mt-6 text-4xl sm:text-5xl">
                From signal to decision
              </h2>
              <p className="mt-8 text-[17px] leading-[1.8] text-foreground-muted">
                A single pipeline from detection to outcome, with complete
                transparency at every stage.
              </p>
            </div>
            <div className="space-y-8">
              {PROCESS_STEPS.map((step) => (
                <div
                  key={step.step}
                  className="group grid grid-cols-[80px_1fr] gap-6 border-l-2 border-copper/30 pb-2 pl-8 transition-colors duration-300 hover:border-copper"
                >
                  <span className="font-heading text-3xl text-copper/70 transition-colors group-hover:text-copper">
                    {step.step}
                  </span>
                  <div>
                    <h3 className="font-heading text-xl text-ink transition-colors group-hover:text-copper">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-foreground-muted">
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Leadership with CIO headshot */}
      <section className="border-t border-border/60 bg-cloud py-16 sm:py-24">
        <Container>
          <Reveal className="grid items-start gap-16 lg:grid-cols-[320px_1fr] lg:gap-24">
            <div>
              <div className="relative aspect-[4/5] overflow-hidden bg-gunmetal/10">
                <Image
                  src={CIO.image}
                  alt={`${CIO.name}, Chief Investment Officer`}
                  fill
                  sizes="(min-width: 1024px) 320px, 90vw"
                  className="object-cover"
                />
              </div>
              <p className="mt-4 font-heading text-lg text-ink">{CIO.name}</p>
              <p className="mt-1 text-[12px] font-medium tracking-[0.15em] text-copper uppercase">
                {CIO.role}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
                Leadership
              </p>
              <h2 className="mt-6 text-4xl sm:text-5xl">
                A CIO whose research shaped the field
              </h2>
              <p className="mt-8 text-[17px] leading-[1.8] text-foreground-secondary">
                Scholars Opportunity Fund is led by{" "}
                <strong className="font-medium text-ink">
                  Dr. Jonathan Brogaard
                </strong>
                , Associate Dean of Research and Kendall D. Garff Chaired
                Professor of Finance at the University of Utah&apos;s David
                Eccles School of Business. His research on trading
                microstructure and empirical asset pricing has been published
                in the Journal of Finance, Journal of Financial Economics, and
                Review of Financial Studies, and cited in Bloomberg, the
                Financial Times, and the Wall Street Journal.
              </p>
              <p className="mt-6 text-[17px] leading-[1.8] text-foreground-secondary">
                He serves on FINRA&apos;s Market Regulation Committee and, in
                2023, founded the University of Utah&apos;s Institute for
                Advanced Investment Management. Every capital decision at SOF
                passes through him; analysts operate within defined process
                boundaries that surface work for his judgment without
                introducing uncontrolled investment risk.
              </p>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Structure */}
      <section className="bg-ink py-16 sm:py-24">
        <Container>
          <Reveal className="grid gap-16 lg:grid-cols-[1fr_1.5fr] lg:gap-24">
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
                Fund Structure
              </p>
              <h2 className="mt-6 text-4xl text-cloud sm:text-5xl">
                Independently operated
              </h2>
            </div>
            <div className="space-y-8 text-[17px] leading-[1.8] text-foreground-on-dark-muted">
              <p>
                Scholars Opportunity Fund is independently operated. The fund
                combines experienced GP oversight with a structured student
                analyst program that produces institutional-grade analytical
                throughput and exceptional talent development.
              </p>
              <p>
                The structural parallel to established student-run investment
                programs is direct: independent operation, student analysts at
                the center, experienced leadership making every capital
                decision.
              </p>
              <p>
                Every step from signal detection to investment outcome is
                documented, measured, and auditable. Process integrity drives
                performance.
              </p>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}

function Stat({
  label,
  value,
  render,
}: {
  label: string;
  value?: string;
  render?: React.ReactNode;
}) {
  return (
    <div className="bg-cloud p-6 sm:p-8">
      <p className="text-[11px] font-medium tracking-[0.18em] text-copper uppercase">
        {label}
      </p>
      <p className="mt-3 font-heading text-xl text-ink sm:text-2xl">
        {render ?? value}
      </p>
    </div>
  );
}
