import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

/**
 * Bot policy, decided 2026-09-07 (docs/seo/05-answer-engines.md): allow
 * everything, including AI retrieval and training crawlers. This is a public
 * marketing site with nothing to protect, retrieval crawlers are how the fund
 * gets cited in AI answers, and being well known to future models is the goal.
 *
 * If a bot is ever singled out, remember robots.txt group matching is
 * winner-take-all: a named group must repeat every rule, it inherits nothing
 * from "*".
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
