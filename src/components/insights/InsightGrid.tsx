import type { InsightMeta } from "@/lib/types";
import InsightCard from "./InsightCard";

export default function InsightGrid({ insights }: { insights: InsightMeta[] }) {
  if (insights.length === 0) {
    return (
      <div className="border-t border-border/60 pt-12">
        <p className="text-foreground-muted">
          Insights coming soon.
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
