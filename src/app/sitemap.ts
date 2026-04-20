import type { MetadataRoute } from "next";
import { getAllInsightSlugs } from "@/lib/insights";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://scholarsoppfund.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const insightSlugs = getAllInsightSlugs();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/team`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/insights`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/program`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];

  const insightPages: MetadataRoute.Sitemap = insightSlugs.map((slug) => ({
    url: `${SITE_URL}/insights/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...insightPages];
}
