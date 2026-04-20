import Image from "next/image";
import Container from "@/components/ui/Container";
import { generatePageMetadata } from "@/lib/seo";
import { CIO } from "@/lib/team";

export const metadata = generatePageMetadata({
  title: "About",
  description:
    "Scholar Opportunity Fund runs a quantitative investment process targeting special situations in public equities. Led by Dr. Jonathan Brogaard.",
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
    title: "CIO Decision",
    text: "A final investment memo reaches Dr. Brogaard, who makes every capital decision. Position sizing, entry, and exit stay with him.",
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
      <section className="relative overflow-hidden bg-ink py-36 sm:py-44">
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
            Scholar Opportunity Fund
          </h1>
          <p className="mt-8 max-w-xl text-[17px] leading-[1.8] text-foreground-on-dark-muted">
            A quantitative investment process targeting special situations in
            the public equity universe, where institutional coverage is thinnest
            and pricing inefficiency is highest.
          </p>
        </Container>
      </section>

      {/* Fund at a glance */}
      <section className="border-b border-border/60 bg-cloud py-16 sm:py-20">
        <Container>
          <div className="grid grid-cols-2 gap-px bg-border/60 sm:grid-cols-4">
            <Stat label="Universe" value="Public Equities" />
            <Stat label="Strategy" value="Special Situations" />
            <Stat label="Investment Decisions" value="CIO-Only" />
            <Stat label="Cohort Size" value="11 Analysts" />
          </div>
        </Container>
      </section>

      {/* Investment process */}
      <section className="py-32 sm:py-40">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1fr_1.5fr] lg:gap-24">
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
            <div className="space-y-10">
              {PROCESS_STEPS.map((step, i) => (
                <div
                  key={step.step}
                  className="grid grid-cols-[80px_1fr] gap-6 border-l-2 border-copper/30 pb-2 pl-8"
                >
                  <span className="font-heading text-3xl text-copper/70">
                    {step.step}
                  </span>
                  <div>
                    <h3 className="font-heading text-xl text-ink">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-foreground-muted">
                      {step.text}
                    </p>
                  </div>
                  {i < PROCESS_STEPS.length - 1 && (
                    <span className="sr-only">Next:</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Leadership with CIO headshot */}
      <section className="border-t border-border/60 bg-cloud py-32 sm:py-40">
        <Container>
          <div className="grid items-start gap-16 lg:grid-cols-[320px_1fr] lg:gap-24">
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
                Scholar Opportunity Fund is led by{" "}
                <strong className="font-medium text-ink">
                  Dr. Jonathan Brogaard
                </strong>
                , Chief Investment Officer. Dr. Brogaard is a tenured finance
                professor, FINRA Market Regulation Committee member, and one of
                the most cited researchers in market microstructure.
              </p>
              <p className="mt-6 text-[17px] leading-[1.8] text-foreground-secondary">
                All investment decisions are made exclusively by the CIO.
                Student analysts operate within defined process boundaries,
                contributing analytical throughput without introducing
                uncontrolled investment risk.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Structure */}
      <section className="bg-ink py-32 sm:py-40">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1fr_1.5fr] lg:gap-24">
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
                Scholar Opportunity Fund is independently operated. The fund
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
          </div>
        </Container>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-cloud p-6 sm:p-8">
      <p className="text-[11px] font-medium tracking-[0.18em] text-copper uppercase">
        {label}
      </p>
      <p className="mt-3 font-heading text-xl text-ink sm:text-2xl">{value}</p>
    </div>
  );
}
