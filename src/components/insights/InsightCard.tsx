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
      className="group block border-t border-border/60 pt-8 transition-colors"
    >
      <div className="flex items-center gap-3 text-[13px]">
        <span className="font-medium tracking-[0.1em] text-copper uppercase">
          {categoryLabels[insight.category] || insight.category}
        </span>
        <span className="text-foreground-muted">{formattedDate}</span>
      </div>
      <h3 className="mt-4 font-heading text-2xl text-ink group-hover:text-copper transition-colors">
        {insight.title}
      </h3>
      <p className="mt-3 text-[15px] text-foreground-muted leading-relaxed line-clamp-2">
        {insight.description}
      </p>
      <p className="mt-4 text-[13px] text-foreground-muted/60">
        {insight.author}
      </p>
    </Link>
  );
}
