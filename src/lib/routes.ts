/**
 * Route registry. The single source of truth for which routes are indexable.
 *
 * The sitemap is generated from this list, and the build fails if a page in
 * src/app is missing from it (see sitemap.ts), so it cannot silently drift
 * from the routes that exist the way a hardcoded sitemap does.
 *
 * `sources` lists the files whose git history determines the route's
 * <lastmod>. Keep it narrow: a shared layout edit must not bump every page.
 */

export interface SiteRoute {
  /** Path with leading slash, "" for the homepage. */
  path: string;
  title: string;
  changeFrequency: "weekly" | "monthly";
  priority: number;
  sources: string[];
}

export const INDEXABLE_ROUTES: SiteRoute[] = [
  {
    path: "",
    title: "Home",
    changeFrequency: "weekly",
    priority: 1.0,
    sources: ["src/app/page.tsx"],
  },
  {
    path: "/about",
    title: "Overview",
    changeFrequency: "monthly",
    priority: 0.8,
    sources: ["src/app/about"],
  },
  {
    path: "/team",
    title: "Team",
    changeFrequency: "monthly",
    priority: 0.7,
    sources: ["src/app/team", "src/lib/team.ts"],
  },
  {
    path: "/program",
    title: "Process",
    changeFrequency: "monthly",
    priority: 0.8,
    sources: ["src/app/program"],
  },
  {
    path: "/apply",
    title: "Apply",
    changeFrequency: "monthly",
    priority: 0.6,
    sources: ["src/app/apply"],
  },
];

/**
 * Routes that exist in src/app but are deliberately not in the sitemap.
 * "/insights" earns its way in from content: sitemap.ts adds it, and each
 * published piece, only when content/insights contains at least one .mdx.
 */
export const CONTENT_GATED_ROUTES = ["/insights"];
