# 03 — Crawling and indexing

Getting this layer right is unglamorous and it is where the current site is actually broken. Read `current-state.md` alongside this.

## The contract

Everything in this layer is a set of statements we make to a crawler. The only thing that matters is that the statements are true and that they agree with each other. A site that says nothing is treated neutrally. A site that contradicts itself gets its signals discounted.

The four statements, and what each must agree with:

| Statement | Lives in | Must agree with |
|---|---|---|
| "This page's real URL is X" | `<link rel="canonical">` | the URL actually served, with no redirect |
| "These are my pages" | `sitemap.xml` | the routes that exist, all returning 200 |
| "Crawl these, not those" | `robots.txt` | what is actually sensitive or duplicative |
| "This page changed on date D" | `<lastmod>` | when the source last actually changed |

Every one of the four is currently wrong on this site. All four read from `SITE_URL`, so the host problem is one fix in one place.

## Canonicals

Emitted by `generatePageMetadata()` in `src/lib/seo.ts` as `alternates.canonical`. Keep that centralised. The moment a page hand-rolls its own canonical, drift begins.

- Self-referencing on every indexable page.
- Absolute, including protocol and host.
- Must resolve 200, not 301. Verify against the live site after any host or slash change, because this is exactly the class of bug that unit tests do not catch.
- Never canonical a page to an unrelated page to "consolidate" it. Google treats a canonical to a substantially different page as a hint it can ignore, and it usually does.

## Sitemap

Generate it, do not hardcode it. The current `sitemap.ts` hardcodes five entries while six routes exist, which is how `/apply` went missing.

- Every entry returns 200 on the canonical host. No redirects, no 404s, no `noindex` pages.
- `lastmod` reflects the last real edit to that page's source. Derive it from git history for code-backed pages, with a build-time fallback so a shallow clone cannot break the build. For MDX, use frontmatter `dateModified`, which is author-curated and authoritative.
- Deliberately do not bump every page when a shared layout changes. A sitewide `lastmod` bump on a layout tweak trains Google to ignore the field. If a layout change genuinely warrants a full recrawl, request it in Search Console rather than poisoning the automated signal.
- `priority` and `changefreq` are close to ignored by Google. Set them coherently and do not spend time tuning them. `priority` on a page you have not published is actively counterproductive.
- A page must earn its way in by existing and having content. Empty state pages do not belong.

## Robots

The current file allows everything and says nothing else. That is under-specified rather than wrong, but it leaves two decisions unmade.

**What to exclude.** On this site, very little. There is no admin surface, no faceted search, no paid landing pages. If the rebuild adds an authenticated area, an application backend, or preview routes, they go here and they also get an `X-Robots-Tag: noindex` header, because `robots.txt` prevents crawling but does not prevent indexing a URL discovered elsewhere. Blocking in `robots.txt` alone can produce the "indexed, though blocked" state, which is the worst of both.

**Bot policy.** Covered in document 05. It belongs in this file but the reasoning is an answer-engine question.

One mechanical trap worth knowing: **robots.txt group matching is winner-take-all.** A crawler obeys only the single most specific group that names it and ignores the `*` group entirely. So if you add a named group for a specific bot, that group must repeat every disallow rule, not inherit them. Getting this wrong silently exposes everything you thought you had blocked.

## Redirects

Covered in document 01. The one addition here: verify redirects against the deployed site, not the config. Vercel, the Next proxy, and the framework's own trailing-slash handling all sit in the same path and interact. The only trustworthy test is `curl -I` against production.

## Indexing hygiene during a rebuild

The rebuild is the risky moment. Order of operations:

1. Export the current indexed URL list from Search Console before you start.
2. Build the new route tree.
3. Diff. Every URL in the old list without an equivalent in the new tree needs a 301 to its nearest real equivalent.
4. Ship redirects in the same deploy as the URL changes, never after.
5. Resubmit the sitemap.
6. Watch Search Console coverage for two weeks. Expect a dip. Investigate anything still dipping at four weeks.

Do not ship a rebuild that changes URLs on a Friday.
