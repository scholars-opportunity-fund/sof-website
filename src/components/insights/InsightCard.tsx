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
      className="group block rounded-lg border border-border bg-background-alt p-6 transition-all duration-200 hover:border-signal hover:shadow-sm"
    >
      <div className="flex items-center gap-3 text-xs">
        <span className="font-medium uppercase tracking-widest text-copper">
          {categoryLabels[insight.category] || insight.category}
        </span>
        <span className="text-foreground-muted">{formattedDate}</span>
      </div>
      <h3 className="mt-3 text-xl font-bold text-ink group-hover:text-copper transition-colors font-heading">
        {insight.title}
      </h3>
      <p className="mt-2 text-sm text-foreground-muted leading-relaxed line-clamp-2">
        {insight.description}
      </p>
      <p className="mt-4 text-xs font-medium text-slate">
        {insight.author}
      </p>
    </Link>
  );
}
