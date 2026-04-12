import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import JsonLd from "@/components/seo/JsonLd";
import { getAllInsightSlugs, getInsightBySlug } from "@/lib/insights";
import { generatePageMetadata, articleSchema } from "@/lib/seo";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllInsightSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const insight = getInsightBySlug(slug);
  if (!insight) return {};

  return generatePageMetadata({
    title: insight.meta.title,
    description: insight.meta.description,
    path: `/insights/${slug}`,
  });
}

export default async function InsightPage({ params }: PageProps) {
  const { slug } = await params;
  const insight = getInsightBySlug(slug);

  if (!insight) notFound();

  const formattedDate = new Date(insight.meta.date).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <>
      <JsonLd
        data={articleSchema({
          title: insight.meta.title,
          description: insight.meta.description,
          url: `/insights/${slug}`,
          datePublished: insight.meta.date,
          author: insight.meta.author,
        })}
      />

      {/* Header */}
      <section className="bg-ink py-20 sm:py-28">
        <Container className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-copper">
            {insight.meta.category.replace("-", " ")}
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-cloud sm:text-4xl lg:text-5xl font-heading">
            {insight.meta.title}
          </h1>
          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-foreground-on-dark-muted">
            <span>{insight.meta.author}</span>
            <span>&middot;</span>
            <time dateTime={insight.meta.date}>{formattedDate}</time>
          </div>
        </Container>
      </section>

      {/* Content */}
      <section className="py-20 sm:py-24">
        <Container>
          <article className="prose prose-lg mx-auto max-w-3xl prose-headings:font-heading prose-headings:text-ink prose-a:text-signal hover:prose-a:text-signal-hover">
            <MDXRemote source={insight.content} />
          </article>
          <div className="mx-auto mt-16 max-w-3xl border-t border-border pt-8">
            <Link
              href="/insights"
              className="text-sm font-medium text-signal hover:text-signal-hover transition-colors"
            >
              &larr; Back to Insights
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
