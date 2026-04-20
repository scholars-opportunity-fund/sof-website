import Link from "next/link";
import type { InsightMeta } from "@/lib/types";

const categoryLabels: Record<string, string> = {
  "market-research": "Market Research",
  "post-mortem": "Post Mortem",
  commentary: "Commentary",
};

export default function InsightCard({ insight }: { insight: InsightMeta }) {
  const formattedDate = new Date(insight.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link
      href={`/insights/${insight.slug}`}
      className="group flex h-full flex-col border-t-2 border-ink/90 pt-8 transition-colors hover:border-copper"
    >
      <div className="flex items-center gap-3 text-[13px]">
        <span className="font-medium tracking-[0.1em] text-copper uppercase">
          {categoryLabels[insight.category] || insight.category}
        </span>
        <span className="h-px w-4 bg-border" aria-hidden="true" />
        <time
          dateTime={insight.date}
          className="text-foreground-muted"
        >
          {formattedDate}
        </time>
      </div>
      <h3 className="mt-5 font-heading text-2xl leading-tight text-ink transition-colors group-hover:text-copper">
        {insight.title}
      </h3>
      <p className="mt-4 line-clamp-3 text-[15px] leading-relaxed text-foreground-muted">
        {insight.description}
      </p>
      <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-4">
        <p className="text-[13px] text-foreground-muted/80">{insight.author}</p>
        <span
          aria-hidden="true"
          className="text-[13px] font-medium text-foreground-muted transition-all group-hover:translate-x-0.5 group-hover:text-copper"
        >
          Read &rarr;
        </span>
      </div>
    </Link>
  );
}
