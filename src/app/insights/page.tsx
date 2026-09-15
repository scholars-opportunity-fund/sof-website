import { notFound } from "next/navigation";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { getAllInsights } from "@/lib/insights";
import { generatePageMetadata } from "@/lib/seo";
import { FUND } from "@/lib/constants";

export const metadata = generatePageMetadata({
  title: "Insights",
  description: `Research notes and market commentary from the ${FUND.name} team.`,
  path: "/insights",
});

export default function InsightsPage() {
  const insights = getAllInsights();

  // A route with no content does not exist. Never publish a page whose only
  // content is a statement that it has no content. See docs/seo/09.
  if (insights.length === 0) notFound();

  return (
    <>
      <section className="bg-ink py-24 sm:py-32">
        <Container>
          <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
            Insights
          </p>
          <h1 className="mt-6 max-w-4xl text-4xl text-cloud sm:text-5xl">
            Research notes from the {FUND.name} team
          </h1>
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container>
          <ul className="mx-auto max-w-3xl space-y-12">
            {insights.map((insight) => (
              <li key={insight.slug} className="border-b border-border/60 pb-10">
                <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
                  {insight.category.replace("-", " ")}
                </p>
                <h2 className="mt-3 text-2xl text-ink">
                  <Link
                    href={`/insights/${insight.slug}`}
                    className="hover:text-signal transition-colors"
                  >
                    {insight.title}
                  </Link>
                </h2>
                <p className="mt-3 text-[15px] text-foreground-secondary">
                  {insight.description}
                </p>
                <div className="mt-4 flex items-center gap-4 text-sm text-foreground-secondary">
                  <span>{insight.author}</span>
                  <span>&middot;</span>
                  <time dateTime={insight.date}>
                    {new Date(insight.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
