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
      <section className="bg-ink py-36 sm:py-44">
        <Container>
          <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
            Insights
          </p>
          <h1 className="mt-6 max-w-3xl text-5xl text-cloud sm:text-6xl lg:text-[72px] lg:leading-[1.1]">
            Research &amp; analysis
          </h1>
          <p className="mt-8 max-w-xl text-[17px] text-foreground-on-dark-muted leading-[1.8]">
            Market research, investment post mortems, and commentary from the
            Scholars Opportunity Fund team.
          </p>
        </Container>
      </section>

      {/* Perspective */}
      <section className="py-32 sm:py-40">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1fr_1.5fr] lg:gap-24">
            <div>
              <h2 className="text-4xl sm:text-5xl">Our perspective</h2>
            </div>
            <div className="space-y-8 text-[17px] text-foreground-secondary leading-[1.8]">
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

      {/* Grid */}
      <section className="border-t border-border/60 py-32 sm:py-40">
        <Container>
          <h2 className="text-4xl sm:text-5xl">Latest</h2>
          <div className="mt-16">
            <InsightGrid insights={insights} />
          </div>
        </Container>
      </section>
    </>
  );
}
