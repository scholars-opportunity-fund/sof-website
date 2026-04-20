import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import CountUp from "@/components/ui/CountUp";
import { getAllInsights } from "@/lib/insights";
import InsightCard from "@/components/insights/InsightCard";
import { CIO } from "@/lib/team";

export default function Home() {
  const latestInsights = getAllInsights().slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink py-24 sm:py-32">
        {/* Decorative gradient accents */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute -top-40 -right-20 h-[560px] w-[560px] rounded-full bg-copper/10 blur-3xl" />
          <div className="absolute -bottom-60 left-1/3 h-[600px] w-[600px] rounded-full bg-signal/5 blur-3xl" />
          {/* Thin copper/signal "signal" marks */}
          <svg
            className="absolute bottom-0 left-0 h-24 w-full opacity-[0.18]"
            viewBox="0 0 1200 100"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              d="M0 80 L300 60 L480 72 L660 30 L820 55 L1000 35 L1200 52"
              stroke="#7BB8D6"
              strokeWidth="1.5"
            />
            <path
              d="M0 90 L200 85 L400 78 L600 82 L800 70 L1000 80 L1200 72"
              stroke="#A0755A"
              strokeWidth="1.5"
            />
          </svg>
        </div>
        <Container className="relative">
          <p className="mb-6 inline-flex items-center gap-3 text-xs font-medium tracking-[0.2em] text-copper uppercase">
            <span
              aria-hidden="true"
              className="inline-block h-px w-8 bg-copper"
            />
            Scholars Opportunity Fund
          </p>
          <h1 className="max-w-4xl text-5xl tracking-tight text-cloud sm:text-6xl lg:text-[80px] lg:leading-[1.05]">
            Quantitative investing in{" "}
            <span className="text-copper">special situations</span>
          </h1>
          <p className="mt-8 max-w-xl text-[17px] leading-relaxed text-foreground-on-dark-muted">
            A proprietary investment process targeting inefficiencies in public
            equities, powered by systematic detection and rigorous fundamental
            review. All decisions made by the Chief Investment Officer.
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-5">
            <Button href="/about">Learn More</Button>
            <Button href="/program" variant="outline">
              <span className="text-cloud">Student Program</span>
            </Button>
          </div>
        </Container>
      </section>

      {/* Stats strip */}
      <section className="border-b border-border/60 bg-cloud py-14">
        <Container>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <Stat label="Universe" value="Public Equities" />
            <Stat label="Strategy" value="Special Situations" />
            <Stat label="Home" value="Salt Lake City" />
            <Stat
              label="Analyst Cohort"
              render={<CountUp to={11} suffix=" Students" />}
            />
          </div>
        </Container>
      </section>

      {/* Approach */}
      <section className="py-16 sm:py-24">
        <Container>
          <Reveal className="grid gap-16 lg:grid-cols-[1fr_1.5fr] lg:gap-24">
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
                Our Approach
              </p>
              <h2 className="mt-6 text-4xl sm:text-5xl">
                Systematic where it scales. Human where it matters.
              </h2>
            </div>
            <div className="space-y-8 text-[17px] leading-[1.8] text-foreground-secondary">
              <p>
                We combine quantitative screening with fundamental analysis to
                identify opportunities where institutional coverage is thinnest
                and pricing inefficiency is highest.
              </p>
              <p>
                Our proprietary platform monitors regulatory filings
                continuously, scoring and surfacing candidates that meet the
                fund&apos;s criteria. Every candidate undergoes structured
                fundamental review before reaching the Chief Investment
                Officer.
              </p>
              <p>
                From signal detection to investment outcome, every step is
                documented, measured, and auditable. Process integrity drives
                performance.
              </p>
              <Link
                href="/about"
                className="group inline-flex items-center gap-2 pt-2 text-[15px] font-medium text-ink hover:text-copper"
              >
                <span className="border-b border-copper/60 pb-0.5 transition-colors group-hover:border-copper">
                  Read how the process works
                </span>
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">&rarr;</span>
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Pillars */}
      <section className="border-t border-border/60 py-16 sm:py-24">
        <Container>
          <div className="grid gap-px bg-border/60 sm:grid-cols-3">
            {[
              {
                number: "01",
                title: "Systematic Detection",
                text: "A proprietary platform monitors regulatory filings continuously, scoring and surfacing candidates that meet the fund's investment criteria.",
              },
              {
                number: "02",
                title: "Rigorous Analysis",
                text: "Every candidate undergoes structured fundamental review by the analyst team before reaching the Chief Investment Officer.",
              },
              {
                number: "03",
                title: "Disciplined Process",
                text: "From signal detection to investment outcome, every step is documented, measured, and auditable.",
              },
            ].map((pillar) => (
              <div
                key={pillar.title}
                className="group relative overflow-hidden bg-background p-10 sm:p-12"
              >
                <span className="font-heading text-sm tracking-[0.15em] text-copper/70 uppercase">
                  {pillar.number}
                </span>
                <h3 className="mt-6 font-heading text-xl transition-colors group-hover:text-copper">
                  {pillar.title}
                </h3>
                <p className="mt-4 text-[15px] leading-relaxed text-foreground-muted">
                  {pillar.text}
                </p>
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 h-0.5 w-0 bg-copper transition-[width] duration-500 group-hover:w-full"
                />
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Leadership / CIO feature */}
      <section className="bg-cloud py-16 sm:py-24">
        <Container>
          <Reveal className="grid items-center gap-16 lg:grid-cols-[320px_1fr] lg:gap-24">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[320px] overflow-hidden bg-gunmetal/10">
              <Image
                src={CIO.image}
                alt={`${CIO.name}, Chief Investment Officer`}
                fill
                sizes="(min-width: 1024px) 320px, 80vw"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
                Leadership
              </p>
              <h2 className="mt-6 text-4xl sm:text-5xl">
                Led by Dr. Jonathan Brogaard
              </h2>
              <p className="mt-8 max-w-2xl text-[17px] leading-[1.8] text-foreground-secondary">
                Dr. Brogaard is the Associate Dean of Research and Kendall D.
                Garff Chaired Professor at the University of Utah&apos;s David
                Eccles School of Business. His research on trading
                microstructure and empirical asset pricing has been published
                in the Journal of Finance, Journal of Financial Economics, and
                Review of Financial Studies, and cited in Bloomberg, the
                Financial Times, and the Wall Street Journal. He serves on
                FINRA&apos;s Market Regulation Committee and, in 2023, founded
                the University of Utah&apos;s Institute for Advanced Investment
                Management.
              </p>
              <div className="mt-10">
                <Link
                  href="/team"
                  className="group inline-flex items-center gap-2 text-[15px] font-medium text-ink hover:text-copper"
                >
                  <span className="border-b border-copper/60 pb-0.5 transition-colors group-hover:border-copper">
                    Meet the team
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
          </Reveal>
        </Container>
      </section>

      {/* Student Program */}
      <section className="bg-ink py-16 sm:py-24">
        <Container>
          <div className="max-w-3xl">
            <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
              Student Analyst Program
            </p>
            <h2 className="mt-6 text-4xl text-cloud sm:text-5xl">
              Training the next generation
            </h2>
            <p className="mt-8 text-[17px] leading-[1.8] text-foreground-on-dark-muted">
              SOF puts students inside a live quantitative investment process
              before their careers begin. Analysts own real work product with
              real capital consequences, under experienced GP supervision.
            </p>
            <div className="mt-12 flex flex-wrap items-center gap-5">
              <Button href="/program" variant="outline">
                <span className="text-cloud">Explore the Program</span>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Insights */}
      <section className="py-16 sm:py-24">
        <Container>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
                Research & Analysis
              </p>
              <h2 className="mt-6 text-4xl sm:text-5xl">Insights</h2>
            </div>
            {latestInsights.length > 0 && (
              <Link
                href="/insights"
                className="text-[15px] text-foreground-secondary transition-colors hover:text-ink"
              >
                View all &rarr;
              </Link>
            )}
          </div>
          <div className="mt-16">
            {latestInsights.length > 0 ? (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {latestInsights.map((insight) => (
                  <InsightCard key={insight.slug} insight={insight} />
                ))}
              </div>
            ) : (
              <div className="border-t border-border/60 pt-12">
                <p className="text-foreground-muted">
                  Market research and post mortems coming soon.
                </p>
              </div>
            )}
          </div>
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
    <div>
      <p className="text-[11px] font-medium tracking-[0.18em] text-copper uppercase">
        {label}
      </p>
      <p className="mt-2 font-heading text-lg text-ink sm:text-xl">
        {render ?? value}
      </p>
    </div>
  );
}
