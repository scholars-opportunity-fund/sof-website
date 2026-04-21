import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import { CIO } from "@/lib/team";

export default function Home() {
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
            Student-run event-driven fund in{" "}
            <span className="text-copper">public equities</span>
          </h1>
          <p className="mt-8 max-w-xl text-[17px] leading-relaxed text-foreground-on-dark-muted">
            Led by Professor Jonathan Brogaard. Focused on special situations
            and catalyst-driven opportunities in the public equity universe.
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-5">
            <Button href="/about">View Overview</Button>
            <Button href="/program" variant="outline">
              <span className="text-cloud">Join the Fund</span>
            </Button>
          </div>
        </Container>
      </section>

      {/* Stats strip */}
      <section className="border-b border-border/60 bg-cloud py-14">
        <Container>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <Stat label="Universe" value="Public Equities" />
            <Stat label="Strategy" value="Event-Driven" />
            <Stat label="Focus" value="Special Situations" />
            <Stat label="Home" value="Salt Lake City" />
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
                Event-driven. Catalyst-focused. Selective.
              </h2>
            </div>
            <div className="space-y-8 text-[17px] leading-[1.8] text-foreground-secondary">
              <p>
                SOF underwrites catalyst-driven opportunities in public
                equities, situations where a defined event reshapes the
                risk-reward and institutional coverage is uneven.
              </p>
              <p>
                Idea sourcing, screening, and diligence feed a structured
                investment memo. Each memo is pressure-tested by the analyst
                team before reaching the investment committee.
              </p>
              <p>
                The Chief Investment Officer owns every capital decision.
                Positions are monitored continuously against the original
                thesis.
              </p>
              <Link
                href="/about"
                className="group inline-flex items-center gap-2 pt-2 text-[15px] font-medium text-ink hover:text-copper"
              >
                <span className="border-b border-copper/60 pb-0.5 transition-colors group-hover:border-copper">
                  View the overview
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
                title: "Catalyst Sourcing",
                text: "Structured idea generation across event-driven situations in the public equity universe.",
              },
              {
                number: "02",
                title: "Rigorous Diligence",
                text: "Every candidate enters a disciplined research and memo process before it reaches the investment committee.",
              },
              {
                number: "03",
                title: "Selective Underwriting",
                text: "The Chief Investment Officer owns sizing, entry, and exit. Positions are monitored against the original thesis.",
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
              The Analyst Team
            </p>
            <h2 className="mt-6 text-4xl text-cloud sm:text-5xl">
              Institutional discipline, selective by design
            </h2>
            <p className="mt-8 text-[17px] leading-[1.8] text-foreground-on-dark-muted">
              SOF is student-run but institutionally structured. Analysts
              carry live research responsibility under experienced GP
              oversight, and every capital decision routes through the
              Chief Investment Officer.
            </p>
            <div className="mt-12 flex flex-wrap items-center gap-5">
              <Button href="/program" variant="outline">
                <span className="text-cloud">How We Work</span>
              </Button>
            </div>
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
