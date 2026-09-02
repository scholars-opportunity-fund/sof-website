# Current state — audited 2026-09-02

Verified against the live site at `www.scholarsoppfund.com` and against `main` at commit `5a72824`. Everything below was checked by fetching the live response, not read off the source.

## What is live

Five indexable routes, all returning 200: `/`, `/about` (labelled Overview), `/team`, `/program` (labelled Process), `/apply`, `/insights`. Contact is a `mailto:` in the nav, not a page.

The site is genuinely fast and genuinely clean. No third-party scripts, no analytics, no tag manager, no cookie banner, a tight CSP, HSTS with preload, correct security headers, self-hosted fonts via `next/font`. That is a much better starting position than most rebuilds get. Do not spend it.

## The four real problems

### 1. The whole site declares itself at the wrong host

`SITE_URL` in `src/lib/constants.ts` falls back to `https://scholarsoppfund.com`, the apex. `NEXT_PUBLIC_SITE_URL` is not set in the Vercel project, so the fallback is what ships. Meanwhile `src/proxy.ts` 301s the apex to `www`, and `www` is what Vercel serves.

Consequences, all confirmed live:

- Every canonical tag points at a URL that redirects. `/team` serves `<link rel="canonical" href="https://scholarsoppfund.com/team"/>` while living at `www.scholarsoppfund.com/team`.
- Every `<loc>` in `sitemap.xml` is a redirecting URL.
- `robots.txt` points at `https://scholarsoppfund.com/sitemap.xml`, which redirects.
- Every `og:url` is the redirecting host.
- The `Organization` and `WebSite` schema `@id` values declare the entity at the apex.

Google usually resolves this in our favour, but "usually" is doing a lot of work, and Search Console will report the submitted URLs as "Page with redirect" rather than indexing them as submitted. Every AI crawler and every link-checking tool sees the same inconsistency.

**Fix:** set `NEXT_PUBLIC_SITE_URL=https://www.scholarsoppfund.com` in the Vercel project (all environments) and redeploy. One environment variable. It corrects canonicals, sitemap, robots, OG tags, and schema `@id` in a single move, because they all read the same constant. Joel owns the Vercel account, so this one is his to make.

Decide `www` versus apex once and never revisit it. `www` is already the served host, already the DNS target, and already what the proxy enforces, so the cheap answer is to keep `www` and fix the constant.

### 2. `/insights` is a published empty page

`/insights` returns 200 and renders "This page is not yet published". `content/insights/` contains only a `.gitkeep`. The nav link was hidden in commit `e6b3ee9` until the first piece ships, but hiding the link did not unpublish the page, and `sitemap.ts` still submits it at priority 0.8, the joint-highest on the site after the homepage.

So we are actively asking Google to index a page whose entire content is a statement that it has no content. That is a soft 404 with a priority boost.

**Fix:** while the directory is empty, either return a real 404 from the route or mark it `noindex` and drop it from the sitemap. The sitemap should be generated from the content that exists, not from a hardcoded list. Same for `/insights/[slug]`.

### 3. `/apply` is live but invisible

`/apply` returns 200 and is absent from `sitemap.ts`, which hardcodes five entries and has drifted from the routes that actually exist.

For a fund whose recruiting pipeline is a real business function, the apply page being unlisted is a live miss. Decide deliberately whether it should be indexed. If yes, it belongs in the sitemap. If no, it needs `noindex`, not silence.

**Fix:** generate the sitemap from the route tree or from an explicit registry that fails a build when a route is missing from it. Hardcoded page lists drift, always.

### 4. `lastmod` is build time on every URL

Every entry uses `lastModified: new Date()`. Live sitemap shows an identical `2026-05-22T22:05:48.791Z` on all six URLs. That timestamp says every page on the site changed at the same instant, which is the build, not an edit.

A `lastmod` that moves when nothing changed is worse than no `lastmod`. Google learns the signal is noise and discounts it, and you lose the ability to request recrawls that actually land.

**Fix:** derive per-URL `lastmod` from the last commit that touched that page's source, with a build-time fallback. Deliberately narrower than "anything in the tree changed", so a shared layout edit does not bump every page. For MDX insights, use author-curated frontmatter `dateModified` instead, since that is authoritative.

## Smaller gaps

- **`robots.txt` is three lines.** `User-Agent: *`, `Allow: /`, and a sitemap line. No AI crawler policy at all. See document 05.
- **No `llms.txt`.** Returns 404. See document 05.
- **`breadcrumbSchema()` is defined in `src/lib/seo.ts` and called from nowhere.** Dead code, and a missing signal on a site with real hierarchy.
- **No `Person` schema for the team**, despite a `/team` page with 12 people and a LinkedIn URL for every one of them in `src/lib/team.ts`. This is the single largest missed opportunity on the site. See document 04.
- **`Organization` schema has no `sameAs`, no `logo`, no `address`.** It is a name, a description, a founder, and a founding year. Thin for an entity we want Google to recognise.
- **No OG images beyond a single `/og/default.png` reference.** Worth checking that file even exists before the rebuild ships.

## What not to "fix"

- The absence of analytics is a choice, not an oversight. If you add measurement, read document 08 first, because adding a tag manager to this site is the fastest way to lose its performance profile and its clean CSP.
- The tight CSP will block anything you add from a CDN. That is the point. Adding `unsafe-eval` or wildcarding a script source to make a library work is not an acceptable trade on this site.
- `trailingSlash: false` plus the proxy's slash-stripping is correct and consistent. Leave it.
