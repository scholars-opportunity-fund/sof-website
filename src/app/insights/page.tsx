import Container from "@/components/ui/Container";
import InsightGrid from "@/components/insights/InsightGrid";
import { getAllInsights } from "@/lib/insights";
import { generatePageMetadata } from "@/lib/seo";

export const metadata = generatePageMetadata({
  title: "Insights",
  description:
    "Market research, post mortems, and commentary from the Scholars Opportunity Fund team.",
  path: "/insights",
});

export default function InsightsPage() {
  const insights = getAllInsights();

  return (
    <>
      {/* Hero */}
      <section className="bg-ink py-20 sm:py-28">
        <Container className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-copper">
            Insights
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-cloud sm:text-5xl font-heading">
            Research &amp; Analysis
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground-on-dark-muted leading-relaxed">
            Market research, investment post mortems, and commentary from the
            Scholars Opportunity Fund team.
          </p>
        </Container>
      </section>

      {/* Overview */}
      <section className="py-20 sm:py-24">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Our Perspective
            </h2>
            <div className="mt-8 space-y-6 text-foreground-secondary leading-relaxed">
              <p>
                The public equity markets are being reshaped by systematic
                strategies, quantitative infrastructure, and an accelerating
                shift toward data-driven decision-making. Our insights reflect
                the fund&apos;s approach to understanding these dynamics from
                the inside.
              </p>
              <p>
                We publish market research on the special situations universe
                we operate in, post mortems on completed investment cases, and
                commentary on the quantitative methods and market structure
                themes that inform our process.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Insights Grid */}
      <section className="bg-background-alt py-20 sm:py-24">
        <Container>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Latest
          </h2>
          <div className="mt-10">
            <InsightGrid insights={insights} />
          </div>
        </Container>
      </section>
    </>
  );
}
