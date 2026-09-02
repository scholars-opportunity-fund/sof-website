# 10 — Launch checklist

The gate before any rebuild ships to production. Every line is a yes or a no, verified against the **deployed preview URL**, not localhost and not the source.

## Host and URLs

- [ ] `NEXT_PUBLIC_SITE_URL` is set in Vercel for all environments and matches the served host exactly, including `www` and protocol.
- [ ] `curl -I` on the apex returns a single 301 to `www`. `curl -I` on `www` returns 200.
- [ ] Every canonical tag on every indexable page is absolute, self-referencing, and returns 200 with no redirect.
- [ ] Trailing-slash variants of every page 301 to the slash-less URL in one hop.
- [ ] Every legacy URL from the pre-rebuild Search Console export 301s to its equivalent in one hop. No chains. Tested with `curl -I` against the preview.

## Crawling and indexing

- [ ] `sitemap.xml` is generated, not hardcoded. Every `<loc>` is on the canonical host and returns 200.
- [ ] No sitemap entry points at a redirect, a `noindex` page, or a page with placeholder content.
- [ ] Every indexable route in the app tree appears in the sitemap. Every non-indexable route is `noindex` and absent from it.
- [ ] `lastmod` varies per page and reflects real edits.
- [ ] `robots.txt` names the sitemap on the canonical host and states the bot policy explicitly.
- [ ] Any authenticated, preview, or draft route is `noindex` via header, not just disallowed in `robots.txt`.

## Links

- [ ] Orphan check passes: every route has at least one rendered inbound `<a>`.
- [ ] No internal link returns 404 or 301.
- [ ] No anchor text is "learn more", "click here", "read more", or "here".
- [ ] `/about`, `/team`, and `/program` cross-link each other in body copy.
- [ ] Every link is a real `<a href>` in the served HTML, confirmed by viewing source, not the JSX.

## Structured data

- [ ] A single connected `@graph` with stable `@id` values. No dangling references.
- [ ] `Organization` node has `name`, `url`, `logo`, `description`, `foundingDate`, `sameAs` (verified 200), and a real founder.
- [ ] `Person` nodes for every team member, each with `worksFor` pointing at the Organization `@id` and `sameAs` pointing at a verified LinkedIn URL.
- [ ] `BreadcrumbList` on nested routes, or the dead helper is deleted.
- [ ] No `aggregateRating`, no `Review`, no numeric performance or capital figure anywhere in schema.
- [ ] JSON-LD serialiser escapes `<`, `>`, `&`, U+2028, U+2029.
- [ ] Google Rich Results Test and Schema.org validator both pass on the homepage, `/team`, and one insight if any exist.

## Answer engines

- [ ] `/llms.txt` exists, is generated from constants, and states only verified facts.
- [ ] Bot policy in `robots.txt` reflects a deliberate decision on retrieval versus training crawlers, with each named group repeating the full disallow list.
- [ ] Every page's first paragraph is a self-contained statement that survives being quoted out of context.

## Performance

- [ ] Lighthouse mobile on the preview deployment: Performance 95+, SEO 100, Accessibility 100, Best Practices 100.
- [ ] Every image has explicit width and height. LCP image is preloaded; nothing else is.
- [ ] First-load JavaScript under 150KB gzipped.
- [ ] No third-party script was added. If one was, the CSP change has a reason in the commit and Joel's sign-off.
- [ ] `next/font` still self-hosts; no `<link>` to a font CDN.

## Facts

- [ ] Every name, title, affiliation, and date on the site matches `src/lib/constants.ts` and `src/lib/team.ts`, and those match LinkedIn.
- [ ] No claim about performance, capital, returns, or track record exists on the site or in any machine-readable file without explicit sign-off on the specific figure.
- [ ] Grep the repo for any fact that changed during the rebuild. Old values appear nowhere.

## Operational

- [ ] Search Console ownership verified via DNS and survives the deploy.
- [ ] Pre-rebuild Search Console URL export saved in the repo under `docs/seo/` with a date.
- [ ] The deploy is not on a Friday.
- [ ] Someone is assigned to check Search Console coverage on days 3, 7, and 14 after launch.
