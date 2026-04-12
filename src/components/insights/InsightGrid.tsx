import type { InsightMeta } from "@/lib/types";
import InsightCard from "./InsightCard";

export default function InsightGrid({ insights }: { insights: InsightMeta[] }) {
  if (insights.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-background-alt py-16 text-center">
        <p className="text-foreground-muted">
          Insights coming soon.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {insights.map((insight) => (
        <InsightCard key={insight.slug} insight={insight} />
      ))}
    </div>
  );
}
