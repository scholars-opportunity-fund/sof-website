# Search and discovery — rebuild handoff

**For:** JP, taking over the site rebuild.
**Covers:** everything that is not UI/UX. Authority architecture, internal linking, crawling and indexing, structured data, answer engines, performance, off-site authority, measurement.
**Does not cover:** visual design, component structure, brand, copy voice. Those are yours.

## Read this part first

This site is not a demand-capture funnel, and almost every SEO instinct you have was formed on sites that are.

Nobody searches "student-run event-driven fund Salt Lake City" and lands here ready to convert. There is no meaningful non-branded search volume to win, and chasing it would be a waste of your time. The traffic that matters already knows the name. Someone takes a card at a conference, hears the fund mentioned in a meeting, gets a cold email from an analyst, or is a professor or an LP doing a quick check before agreeing to a conversation. They search "Scholars Opportunity Fund", or they ask an AI assistant about it, and we get a few seconds to read as a real institution rather than a class project.

So the job is not ranking. The job is **entity clarity and branded-search dominance**: when someone looks us up by name, every surface they hit agrees with every other surface, resolves fast, and says the same true things about who runs the fund and what it does.

Everything in these documents follows from that.

## Reading order

| # | Document | Why it matters here |
|---|---|---|
| — | [current-state.md](current-state.md) | What is live today, and the four things that are actually broken. Read before you touch anything. |
| 01 | [01-authority-architecture.md](01-authority-architecture.md) | Where authority enters the site and where it needs to end up. |
| 02 | [02-internal-linking.md](02-internal-linking.md) | The linking model, and the anti-patterns that quietly leak authority. |
| 03 | [03-crawl-and-indexing.md](03-crawl-and-indexing.md) | Canonicals, sitemap, robots, redirects. Where most of the current damage is. |
| 04 | [04-structured-data.md](04-structured-data.md) | The entity graph. The single highest-leverage area for a fund. |
| 05 | [05-answer-engines.md](05-answer-engines.md) | GEO. Being citable when someone asks an AI about us instead of Google. |
| 06 | [06-performance.md](06-performance.md) | Core Web Vitals, the budget, and what actually moves it. |
| 07 | [07-off-site-authority.md](07-off-site-authority.md) | Backlinks and citations for an entity nobody links to yet. |
| 08 | [08-measurement.md](08-measurement.md) | What to instrument, what to watch, what to ignore. |
| 09 | [09-failure-modes.md](09-failure-modes.md) | The traps. Read this twice. |
| 10 | [10-launch-checklist.md](10-launch-checklist.md) | The gate before any rebuild ships. |

## The ten rules, compressed

If you read nothing else:

1. **One host, one URL, one canonical.** Pick `www` or apex, declare it once, and make every canonical, sitemap entry, schema `@id`, and OG tag agree. We are currently failing this sitewide.
2. **A URL you submit must be the URL you serve.** No sitemap entry should redirect. Ever.
3. **Never publish a page that says "not yet published."** Either it has content or it does not exist. A live empty page is worse than a 404.
4. **`lastmod` is a promise.** If it lies, Google stops reading it. Build time is a lie.
5. **Authority flows through links you actually render.** A page reachable only from the sitemap is a page with no authority.
6. **Link once, link deliberately, link with real anchor text.** "Learn more" transfers nothing.
7. **The entity graph matters more than the copy.** For a fund, `Person` and `Organization` nodes with correct `sameAs` do more than any amount of keyword work.
8. **Say true things.** Every claim on this site is a claim about a financial institution. Wrong is worse than absent, and it compounds because AI assistants will repeat it.
9. **Third-party scripts are the performance budget.** The site is currently fast because it loads almost nothing. Protect that.
10. **Measure branded impressions, not traffic.** Total sessions is a vanity number on a site like this.

## Repo and deployment

- This repo is `scholars-opportunity-fund/sof-website`. It is the code the site is built from.
- Stack: Next.js 16 App Router, React 19, Tailwind 4, MDX for insights via `next-mdx-remote`.
- Deployed on Vercel. Production domain is `www.scholarsoppfund.com`, apex 301s to `www`.
- The SEO surface lives in a small number of files. Learn these before rebuilding:
  - `src/lib/constants.ts` — `SITE_URL`, the `FUND` entity, nav and footer link graph
  - `src/lib/seo.ts` — metadata builder and all JSON-LD schema
  - `src/app/sitemap.ts`, `src/app/robots.ts`
  - `src/proxy.ts` — host canonicalization and trailing-slash stripping
  - `next.config.ts` — security headers, CSP, cache policy

Rebuild the UI freely. Do not rebuild these five without reading document 03 first, because they are where the current damage is and where new damage is easiest to cause.
