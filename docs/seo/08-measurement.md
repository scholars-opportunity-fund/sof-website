# 08 — Measurement

## What to measure, and why most of it is wrong for this site

Traffic is a vanity number here. A site whose purpose is to read as real when someone looks up the name does not succeed by having more sessions. It succeeds when branded searches resolve to us, when the entity is recognised, when the pages are fast and indexed, and when nothing about us is wrong anywhere.

Measure those.

## The instruments

**Google Search Console.** The only one that is non-negotiable. Free, zero client-side cost, and it is the only place you can see how Google actually understands the site. Verify via DNS so ownership survives any rebuild. Watch:

- **Branded impressions and average position.** Queries containing "scholars opportunity fund" or close variants. Position should be 1. If it is not, something is wrong with the entity graph or the host canonicalisation.
- **Coverage.** Indexed pages should equal the pages you intend to be indexed, exactly. "Page with redirect", "Crawled, currently not indexed", and "Soft 404" are each a bug with a name.
- **Enhancements.** Structured data parse errors surface only here.
- **Core Web Vitals.** Field data, if the site ever reaches the traffic threshold to populate it.

**Lighthouse in CI.** Lab performance, on every pull request, against the preview deployment. Covered in document 06.

**Bing Webmaster Tools.** Costs nothing, takes ten minutes, and Bing's index is what several AI assistants retrieve from. Worth having.

**Automated crawl checks.** Orphans, broken internal links, links to redirects, missing canonicals, sitemap entries not returning 200. Cheap scripts, run in CI. Document 02 lists them.

## Analytics: think before adding it

The site currently has none, and that is a large part of why it is fast and why the CSP is clean.

If Joel wants page-level analytics, the order of preference:

1. **Vercel Analytics or an edge-side equivalent.** Collected at the edge, one tiny script or none, no cookies, no consent banner, no CSP change of consequence.
2. **A privacy-first, cookieless tool** (Plausible, Fathom, or similar). One small script, no consent requirement, one CSP entry.
3. **GA4 direct**, with the tag loaded deferred and no tag manager. Adds weight and a cookie decision. Acceptable if there is a stated reason.
4. **GA4 via Google Tag Manager.** Do not. A tag manager container on this site is the single fastest way to lose the performance profile, and it creates a surface where anyone with GTM access can inject scripts without a code review.

Whichever is chosen, it is a `next.config.ts` CSP change and it should be reviewed as one.

## Events worth tracking, if anything is

For a site with no funnel, very few:

- Outbound clicks to LinkedIn profiles from `/team`.
- `/apply` form submission, if the rebuild adds a form.
- Outbound click on the contact `mailto:`.

That is the complete list. Anything beyond it is measurement for its own sake.

## A cadence

Monthly, fifteen minutes:

1. Search Console: branded position still 1, coverage count unchanged, no new enhancement errors.
2. Site search for the exact fund name in an incognito window. Check what the first result is and what the knowledge panel says, if there is one.
3. Ask two AI assistants "what is Scholars Opportunity Fund" and read the answer for anything wrong. If something is wrong, trace it to the surface it came from and fix that surface.

Step 3 is the most useful check on this list and the one nobody does.
