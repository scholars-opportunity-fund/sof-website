import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { getAllInsights } from "@/lib/insights";
import InsightCard from "@/components/insights/InsightCard";

export default function Home() {
  const latestInsights = getAllInsights().slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="bg-ink py-40 sm:py-52">
        <Container>
          <h1 className="max-w-4xl text-5xl tracking-tight text-cloud sm:text-6xl lg:text-[80px] lg:leading-[1.1]">
            Quantitative investing in special situations
          </h1>
          <p className="mt-8 max-w-xl text-[17px] leading-relaxed text-foreground-on-dark-muted">
            A proprietary investment process targeting inefficiencies in
            public equities, powered by systematic research and rigorous
            analysis.
          </p>
          <div className="mt-12 flex items-center gap-5">
            <Button href="/about">Learn More</Button>
            <Button href="/program" variant="outline">
              <span className="text-cloud">Student Program</span>
            </Button>
          </div>
        </Container>
      </section>

      {/* Approach — asymmetric two-column */}
      <section className="py-32 sm:py-40">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1fr_1.5fr] lg:gap-24">
            <div>
              <h2 className="text-4xl sm:text-5xl">Our Approach</h2>
            </div>
            <div className="space-y-8 text-[17px] text-foreground-secondary leading-[1.8]">
              <p>
                We combine quantitative screening with fundamental analysis to
                identify opportunities where institutional coverage is thinnest
                and pricing inefficiency is highest.
              </p>
              <p>
                Our proprietary platform monitors regulatory filings
                continuously, scoring and surfacing candidates that meet our
                investment criteria. Every candidate undergoes structured
                fundamental review before reaching the Chief Investment Officer.
              </p>
              <p>
                From signal detection to investment outcome, every step is
                documented, measured, and auditable. Process integrity drives
                performance.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Pillars */}
      <section className="border-t border-border/60 py-32 sm:py-40">
        <Container>
          <div className="grid gap-px bg-border/60 sm:grid-cols-3">
            {[
              {
                title: "Systematic Detection",
                text: "Our platform monitors regulatory filings continuously, scoring and surfacing candidates that meet our investment criteria.",
              },
              {
                title: "Rigorous Analysis",
                text: "Every candidate undergoes structured fundamental review by our analyst team before reaching the Chief Investment Officer.",
              },
              {
                title: "Disciplined Process",
                text: "From signal detection to investment outcome, every step is documented, measured, and auditable.",
              },
            ].map((pillar) => (
              <div
                key={pillar.title}
                className="bg-background p-10 sm:p-12"
              >
                <h3 className="text-xl font-heading">{pillar.title}</h3>
                <p className="mt-4 text-[15px] text-foreground-muted leading-relaxed">
                  {pillar.text}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Student Program */}
      <section className="bg-ink py-32 sm:py-40">
        <Container>
          <div className="max-w-3xl">
            <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
              Student Analyst Program
            </p>
            <h2 className="mt-6 text-4xl text-cloud sm:text-5xl">
              Training the next generation
            </h2>
            <p className="mt-8 text-[17px] text-foreground-on-dark-muted leading-[1.8]">
              SOF puts students inside a live quantitative investment process
              before their careers begin. Analysts own real work product with
              real capital consequences, under experienced GP supervision.
            </p>
            <div className="mt-12">
              <Button href="/program" variant="outline">
                <span className="text-cloud">Explore the Program</span>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Insights */}
      <section className="py-32 sm:py-40">
        <Container>
          <div className="flex items-end justify-between">
            <h2 className="text-4xl sm:text-5xl">Insights</h2>
            {latestInsights.length > 0 && (
              <Link
                href="/insights"
                className="text-[15px] text-foreground-secondary hover:text-ink transition-colors"
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
