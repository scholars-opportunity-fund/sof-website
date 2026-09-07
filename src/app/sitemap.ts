import fs from "fs";
import path from "path";
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { INDEXABLE_ROUTES, CONTENT_GATED_ROUTES } from "@/lib/routes";
import { getAllInsights } from "@/lib/insights";
import { lastCommitDate } from "@/lib/last-modified";

/**
 * Every static route in src/app must be accounted for in the registry, so a
 * new page cannot silently ship unlisted the way /apply once did. Runs at
 * build time; a drifted registry fails the build with the missing path.
 */
function assertRegistryCoversAppTree() {
  const appDir = path.join(process.cwd(), "src/app");
  const found: string[] = [];

  const walk = (dir: string, routePath: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        // Dynamic segments are content-driven; their parents are registered.
        if (entry.name.startsWith("[")) continue;
        walk(path.join(dir, entry.name), `${routePath}/${entry.name}`);
      } else if (entry.name === "page.tsx") {
        found.push(routePath);
      }
    }
  };
  walk(appDir, "");

  const registered = new Set([
    ...INDEXABLE_ROUTES.map((r) => r.path),
    ...CONTENT_GATED_ROUTES,
  ]);
  const missing = found.filter((p) => !registered.has(p));
  if (missing.length > 0) {
    throw new Error(
      `Route(s) exist in src/app but are missing from src/lib/routes.ts: ${missing.join(
        ", "
      )}. Register each one as indexable or content-gated so the sitemap cannot drift.`
    );
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  assertRegistryCoversAppTree();

  const staticPages: MetadataRoute.Sitemap = INDEXABLE_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: lastCommitDate(route.sources),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // /insights and its pieces earn their way in by existing. An empty section
  // submits nothing; the route itself 404s until the first piece ships.
  const insights = getAllInsights();
  if (insights.length === 0) return staticPages;

  const insightIndex: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/insights`,
      lastModified: lastCommitDate(["content/insights"]),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const insightPages: MetadataRoute.Sitemap = insights.map((insight) => ({
    url: `${SITE_URL}/insights/${insight.slug}`,
    // Frontmatter is author-curated and authoritative for MDX content.
    lastModified: new Date(insight.dateModified || insight.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...insightIndex, ...insightPages];
}
