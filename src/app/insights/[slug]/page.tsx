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

      <section className="bg-ink py-36 sm:py-44">
        <Container>
          <p className="text-xs font-medium tracking-[0.2em] text-copper uppercase">
            {insight.meta.category.replace("-", " ")}
          </p>
          <h1 className="mt-6 max-w-4xl text-4xl text-cloud sm:text-5xl lg:text-[64px] lg:leading-[1.15]">
            {insight.meta.title}
          </h1>
          <div className="mt-8 flex items-center gap-4 text-[15px] text-foreground-on-dark-muted">
            <span>{insight.meta.author}</span>
            <span>&middot;</span>
            <time dateTime={insight.meta.date}>{formattedDate}</time>
          </div>
        </Container>
      </section>

      <section className="py-32 sm:py-40">
        <Container>
          <article className="prose prose-lg mx-auto max-w-3xl prose-headings:font-heading prose-headings:font-normal prose-a:text-signal hover:prose-a:text-signal-hover">
            <MDXRemote source={insight.content} />
          </article>
          <div className="mx-auto mt-20 max-w-3xl border-t border-border/60 pt-8">
            <Link
              href="/insights"
              className="text-[15px] text-foreground-secondary hover:text-ink transition-colors"
            >
              &larr; Back to Insights
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
