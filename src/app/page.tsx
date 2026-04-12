import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { getAllInsights } from "@/lib/insights";
import InsightCard from "@/components/insights/InsightCard";

export default function Home() {
  const latestInsights = getAllInsights().slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="bg-ink py-28 sm:py-36">
        <Container className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-copper">
            Scholars Opportunity Fund
          </p>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-cloud sm:text-5xl lg:text-6xl font-heading">
            Quantitative Investing in
            <br />
            Special Situations
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-foreground-on-dark-muted leading-relaxed">
            A proprietary investment process targeting inefficiencies in public
            equities, powered by systematic research and rigorous analysis.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button href="/about">Learn More</Button>
            <Button href="/program" variant="outline">
              Student Program
            </Button>
          </div>
        </Container>
      </section>

      {/* Approach */}
      <section className="py-20 sm:py-24">
        <Container>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Our Approach
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-foreground-muted">
              We combine quantitative screening with fundamental analysis to
              identify opportunities where institutional coverage is thinnest
              and pricing inefficiency is highest.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            <Card variant="elevated">
              <h3 className="text-lg font-bold font-heading text-ink">
                Systematic Detection
              </h3>
              <p className="mt-3 text-sm text-foreground-muted leading-relaxed">
                Our proprietary platform monitors regulatory filings
                continuously, scoring and surfacing candidates that meet our
                investment criteria.
              </p>
            </Card>
            <Card variant="elevated">
              <h3 className="text-lg font-bold font-heading text-ink">
                Rigorous Analysis
              </h3>
              <p className="mt-3 text-sm text-foreground-muted leading-relaxed">
                Every candidate undergoes structured fundamental review by our
                analyst team before reaching the Chief Investment Officer for
                a final decision.
              </p>
            </Card>
            <Card variant="elevated">
              <h3 className="text-lg font-bold font-heading text-ink">
                Disciplined Process
              </h3>
              <p className="mt-3 text-sm text-foreground-muted leading-relaxed">
                From signal detection to investment outcome, every step is
                documented, measured, and auditable. Process integrity drives
                performance.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Student Program Teaser */}
      <section className="bg-ink py-20 sm:py-24">
        <Container className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-copper">
            Student Analyst Program
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-cloud sm:text-4xl font-heading">
            Training the Next Generation
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-foreground-on-dark-muted leading-relaxed">
            SOF puts students inside a live quantitative investment process
            before their careers begin. Analysts own real work product with
            real capital consequences, under experienced GP supervision.
          </p>
          <div className="mt-10">
            <Button href="/program">Explore the Program</Button>
          </div>
        </Container>
      </section>

      {/* Latest Insights */}
      <section className="py-20 sm:py-24">
        <Container>
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Insights
            </h2>
            {latestInsights.length > 0 && (
              <Link
                href="/insights"
                className="text-sm font-medium text-signal hover:text-signal-hover transition-colors"
              >
                View all &rarr;
              </Link>
            )}
          </div>
          <div className="mt-10">
            {latestInsights.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {latestInsights.map((insight) => (
                  <InsightCard key={insight.slug} insight={insight} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-background-alt py-16 text-center">
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
