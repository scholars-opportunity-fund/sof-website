import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import CountUp from "@/components/ui/CountUp";
import WeekInLife from "@/components/program/WeekInLife";
import GrowthGear from "@/components/program/GrowthGear";
import WorkThread from "@/components/program/WorkThread";
import HeadquartersMap from "@/components/program/HeadquartersMap";
import { generatePageMetadata } from "@/lib/seo";
import { CIO } from "@/lib/team";

export const metadata = generatePageMetadata({
  title: "Analyst Program",
  description:
    "How Scholars Opportunity Fund sources, researches, and underwrites event-driven opportunities in public equities.",
  path: "/program",
});

export default function ProgramPage() {
  return (
    <>
      {/* Hero */}
      <section id="analyst-program" className="scroll-mt-24 relative overflow-hidden bg-ink py-24 sm:py-32">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute -top-40 right-10 h-[500px] w-[500px] rounded-full bg-copper/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-20 h-[500px] w-[500px] rounded-full bg-signal/5 blur-3xl" />
        </div>
        <Container className="relative">
          <Reveal>
            <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
              Student Analyst Program
            </p>
            <h1 className="mt-6 max-w-4xl text-5xl text-cloud sm:text-6xl lg:text-[72px] lg:leading-[1.1]">
              Build what&apos;s next in finance
            </h1>
            <p className="mt-8 max-w-xl text-[17px] leading-[1.8] text-foreground-on-dark-muted">
              SOF places analysts inside a live event-driven investment
              process. Real work product under a CIO whose research has
              shaped the field. Build the paper portfolio track record that
              determines whether real capital follows.
            </p>
            <div className="mt-12 flex flex-wrap items-center gap-5">
              <Button href="/team" variant="outline">
                <span className="text-cloud">Meet the cohort</span>
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Quick stats with animated counters */}
      <section className="border-b border-border/60 bg-cloud py-14">
        <Container>
          <div className="grid grid-cols-3 gap-8">
            <AnimatedStat label="Structure" value="Analyst Cohort" />
            <AnimatedStat
              label="Hours / Week"
              numeric
              to={12}
              prefix="Up to "
            />
            <AnimatedStat label="Term" value="Multi-Semester" />
          </div>
        </Container>
      </section>

      {/* What Students Do */}
      <section id="work" className="py-16 sm:py-24">
        <Container>
          <Reveal>
            <div className="grid gap-16 lg:grid-cols-[1fr_1.5fr] lg:gap-24">
              <div className="lg:sticky lg:top-32 lg:self-start">
                <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
                  Program
                </p>
                <h2 className="mt-6 text-4xl sm:text-5xl">
                  What students do
                </h2>
                <p className="mt-6 text-[17px] leading-[1.8] text-foreground-muted">
                  The fund&apos;s sourcing process surfaces catalyst-driven
                  candidates across the public equity universe. The analyst
                  team takes it from there: company-level diligence, internal
                  pressure-testing, and a collective investment memo
                  delivered to the Chief Investment Officer.
                </p>
              </div>
              {/* One copper thread carries the work from sourcing to the LPs as you scroll */}
              <WorkThread />
            </div>
          </Reveal>
        </Container>
      </section>

      {/* A week in the life: a desk calendar that flips as the days scroll sideways */}
      <WeekInLife />

      {/* How responsibility grows */}
      <section id="growth" className="py-16 sm:py-24">
        <Container>
          <Reveal>
            <div className="grid gap-16 lg:grid-cols-[1fr_1.5fr] lg:gap-24">
              <div>
                <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
                  Growth
                </p>
                <h2 className="mt-6 text-4xl sm:text-5xl">
                  How responsibility grows
                </h2>
                <p className="mt-6 text-[17px] leading-[1.8] text-foreground-muted">
                  SOF runs a flat Analyst cohort. Scope expands with judgment,
                  not title.
                </p>
              </div>
              <GrowthGear />
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Mentorship / learn from */}
      <section className="border-t border-border/60 bg-cloud py-16 sm:py-24">
        <Container>
          <Reveal>
            <div className="grid items-center gap-12 lg:grid-cols-[240px_1fr] lg:gap-20">
              <div className="relative aspect-[4/5] w-full max-w-[240px] overflow-hidden bg-gunmetal/10">
                <Image
                  src={CIO.image}
                  alt={CIO.name}
                  fill
                  sizes="(min-width: 1024px) 240px, 60vw"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
                  Who You Learn From
                </p>
                <h2 className="mt-6 text-4xl sm:text-5xl">
                  Mentorship from a top-cited researcher
                </h2>
                <p className="mt-8 max-w-2xl text-[17px] leading-[1.8] text-foreground-secondary">
                  Analysts work directly under Dr. Jonathan Brogaard, Associate
                  Dean of Research at the David Eccles School of Business and
                  founder of the University of Utah&apos;s Institute for
                  Advanced Investment Management. His research on market
                  microstructure has shaped both academic understanding and
                  regulatory policy.
                </p>
                <div className="mt-8">
                  <Link
                    href="/team"
                    className="group inline-flex items-center gap-2 text-[15px] font-medium text-ink hover:text-copper"
                  >
                    <span className="border-b border-copper/60 pb-0.5 transition-colors group-hover:border-copper">
                      Read Dr. Brogaard&apos;s full bio
                    </span>
                    <span
                      aria-hidden="true"
                      className="transition-transform group-hover:translate-x-1"
                    >
                      &rarr;
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Who We Recruit */}
      <section id="apply" className="bg-ink py-16 sm:py-24">
        <Container>
          <Reveal>
            <div className="max-w-3xl">
              <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
                Who We Recruit
              </p>
              <h2 className="mt-6 text-4xl text-cloud sm:text-5xl">
                Depth over pedigree
              </h2>
              <p className="mt-8 text-[17px] leading-[1.8] text-foreground-on-dark-muted">
                SOF draws from the University of Utah and maintains a steady
                cohort of student analysts. New analysts are admitted each
                semester to backfill natural attrition, ensuring continuity
                of process ownership and institutional knowledge across
                cohort generations. The{" "}
                <Link
                  href="/apply"
                  className="text-copper underline underline-offset-4 hover:text-cloud transition-colors"
                >
                  Student Analyst Program application page
                </Link>{" "}
                shows the current cohort status.
              </p>
            </div>
            <div className="mt-16 flex flex-wrap items-center gap-5">
              <Button href="/team" variant="outline">
                <span className="text-cloud">Meet the cohort</span>
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Location */}
      <section className="py-16 sm:py-24">
        <Container>
          <Reveal>
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr]">
              <div>
                <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
                  Where
                </p>
                <h2 className="mt-6 text-4xl sm:text-5xl">
                  Headquartered in Salt Lake City
                </h2>
                <p className="mt-8 max-w-xl text-[17px] leading-[1.8] text-foreground-secondary">
                  Headquartered in Salt Lake City. The analyst team is drawn
                  from the University of Utah, and meets in person each week
                  for candidate review, memo defense, and CIO handoffs.
                </p>
              </div>
              <div className="flex items-stretch justify-center">
                <HeadquartersMap />
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}

function AnimatedStat({
  label,
  to,
  value,
  numeric,
  prefix,
  suffix,
}: {
  label: string;
  to?: number;
  value?: string;
  numeric?: boolean;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium tracking-[0.18em] text-copper uppercase">
        {label}
      </p>
      <p className="mt-2 font-heading text-lg text-ink sm:text-xl">
        {numeric && typeof to === "number" ? (
          <CountUp to={to} prefix={prefix} suffix={suffix} />
        ) : (
          value
        )}
      </p>
    </div>
  );
}
