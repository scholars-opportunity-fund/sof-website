import type { InsightMeta } from "@/lib/types";
import InsightCard from "./InsightCard";

export default function InsightGrid({
  insights,
}: {
  insights: InsightMeta[];
}) {
  if (insights.length === 0) {
    return (
      <div className="border-t border-border/60 py-20 text-center">
        <p className="text-[11px] font-medium tracking-[0.2em] text-copper uppercase">
          Coming Soon
        </p>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-foreground-muted">
          Our first published research, post mortems, and commentary are in
          progress. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
      {insights.map((insight) => (
        <InsightCard key={insight.slug} insight={insight} />
      ))}
    </div>
  );
}
