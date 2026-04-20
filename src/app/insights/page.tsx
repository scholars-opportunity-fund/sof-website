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

const CATEGORY_LABELS: Record<string, string> = {
  "market-research": "Market Research",
  "post-mortem": "Post Mortems",
  commentary: "Commentary",
};

export default function InsightsPage() {
  const insights = getAllInsights();
  const categories = Array.from(new Set(insights.map((i) => i.category)));

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink py-24 sm:py-32">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute -top-40 right-1/4 h-[500px] w-[500px] rounded-full bg-signal/10 blur-3xl" />
        </div>
        <Container className="relative">
          <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
            Insights
          </p>
          <h1 className="mt-6 max-w-3xl text-5xl text-cloud sm:text-6xl lg:text-[72px] lg:leading-[1.1]">
            Research &amp; analysis
          </h1>
          <p className="mt-8 max-w-xl text-[17px] leading-[1.8] text-foreground-on-dark-muted">
            Market research, investment post mortems, and commentary from the
            Scholars Opportunity Fund team.
          </p>
        </Container>
      </section>

      {/* Perspective */}
      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1fr_1.5fr] lg:gap-24">
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
                Perspective
              </p>
              <h2 className="mt-6 text-4xl sm:text-5xl">
                What we publish, and why
              </h2>
            </div>
            <div className="space-y-8 text-[17px] leading-[1.8] text-foreground-secondary">
              <p>
                Public equity markets are being reshaped by systematic
                strategies, data-driven decision-making, and a shifting
                opportunity set in special situations. Our insights reflect
                the fund&apos;s view on these dynamics from the inside.
              </p>
              <p>
                We publish market research on the special situations universe
                we operate in, post mortems on completed investment cases, and
                commentary on the market structure themes that inform our
                process.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Category chips */}
      {insights.length > 0 && categories.length > 1 && (
        <section className="border-t border-border/60 bg-cloud py-8">
          <Container>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <span className="text-[11px] font-medium tracking-[0.18em] text-copper uppercase">
                Categories
              </span>
              {categories.map((c) => (
                <span
                  key={c}
                  className="text-[13px] tracking-wide text-foreground-muted"
                >
                  {CATEGORY_LABELS[c] ?? c}
                </span>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Grid */}
      <section className="border-t border-border/60 py-16 sm:py-24">
        <Container>
          <div className="flex items-end justify-between">
            <h2 className="text-4xl sm:text-5xl">Latest</h2>
            {insights.length > 0 && (
              <p className="text-[13px] text-foreground-muted">
                {insights.length}{" "}
                {insights.length === 1 ? "piece" : "pieces"}
              </p>
            )}
          </div>
          <div className="mt-16">
            <InsightGrid insights={insights} />
          </div>
        </Container>
      </section>
    </>
  );
}
