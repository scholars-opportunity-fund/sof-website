# 01 — Authority architecture

## What authority is, mechanically

Search engines model the web as a graph. Pages are nodes, links are edges. Authority is a quantity that enters the graph from outside, flows along edges, and pools wherever the edges point. Every page divides the authority it holds among its outbound links and passes it on.

Two consequences do most of the work:

- **A page with no inbound internal links holds almost nothing**, no matter how good it is. Being in the sitemap is not an inbound link. The sitemap is a discovery hint, not an edge.
- **A page that links to fifty things passes a fiftieth to each.** Link count is a budget, and site-wide navigation spends it on every single page.

## Where authority enters this site

Almost nowhere yet, and you should design around that honestly.

For a fund at this stage, external authority arrives through a small number of channels: the university, the professor, LinkedIn profiles of twelve team members, and eventually press or a directory listing. There is no organic backlink flywheel and there will not be one. Document 07 covers what to do about that.

The practical read: **we are not authority-rich, so we cannot afford to leak any.** Sites with strong domain authority survive sloppy architecture. This one will not.

## Where authority needs to end up

Rank the pages by what they need to do:

1. **Homepage.** Receives nearly all external authority. Every external link points here.
2. **`/about` (Overview) and `/team`.** These are what a diligence check actually reads. They are also where the entity graph lives, because the fund and its people are the entity.
3. **`/program` (Process).** The credibility page. Proves there is a real method, not a stock-picking club.
4. **`/apply`.** Conversion, for the recruiting pipeline.
5. **`/insights/*`.** Currently empty. When it fills, this becomes the only part of the site that can earn external links on its own merit, which flips it from a leaf to a source. Design it now for that future, but do not pretend it has arrived.

## The shape

Use a shallow hub and spoke. Every page is reachable from the homepage within two clicks, and there is no page anywhere that requires three.

```
                        /  (homepage)
                        │
        ┌───────────────┼───────────────┬──────────────┐
        │               │               │              │
     /about          /team          /program        /insights
        │               │               │              │
        └──────── cross-links ──────────┘        /insights/[slug]
                        │
                     /apply
```

Rules that follow from the shape:

- **Depth cap of two.** Anything three clicks from the homepage is effectively invisible on a site this small. There is no excuse for depth here; we have six pages.
- **No orphans.** Every route must be reachable by a rendered `<a>` from at least one other page. If you cannot name the page that links to it, it does not exist. `/apply` is currently close to this failure, and `/insights` is only reachable because the footer still lists it.
- **The nav is not a linking strategy.** Site-wide nav links are discounted precisely because they appear everywhere. They establish structure. They do not confer meaningful relative authority. In-body contextual links do that work.

## Canonical discipline

This is where sites lose more authority than anywhere else, and it is where this site is currently losing it.

One page, one URL. Every duplicate path that resolves to the same content splits authority between them.

The rules:

- **One host.** Pick `www` or apex. Enforce with a 301 at the edge, and make every canonical, sitemap `<loc>`, `og:url`, and schema `@id` use it. Read from a single constant so they cannot drift.
- **A self-referencing canonical must not redirect.** If `/team` canonicals to a URL that 301s, the canonical is wrong. This is live right now. See `current-state.md`.
- **One slash convention.** `trailingSlash: false`, enforced at the edge. Already correct here.
- **Query strings do not create pages.** If you ever add filters or tracking params, canonical them back to the clean path.

## Redirect discipline

You are rebuilding a site that is already indexed. Every URL that changes needs a 301, and the redirect map is not optional cleanup work, it is part of the rebuild.

- **301, not 302.** A 302 tells Google the move is temporary and to keep the old URL indexed.
- **No chains.** `/old` to `/older` to `/new` bleeds authority at every hop and eventually gets abandoned by the crawler. Point every legacy URL directly at its final destination. When you rename something twice, go back and rewrite the first redirect.
- **Redirect to the equivalent page, not the homepage.** A bulk redirect of everything to `/` is read as a soft 404 and the authority is dropped.
- **Keep the map in code, in one place, with a comment per entry saying what it came from.** It becomes unmaintainable within a year otherwise, and nobody will dare delete an entry they cannot explain.

Before you change any URL, export the current indexed URL list from Search Console and diff it against your new route tree. Anything in the first list and not the second needs a redirect entry.

## What does not apply here

If you have done local-business or e-commerce SEO, discard these instincts:

- **Location pages.** A fund has one location and no service area. Do not build city pages.
- **Keyword-targeted landing pages.** There is no non-branded volume worth capturing. Pages exist because a real reader needs them.
- **Programmatic page generation.** Twelve team members do not need twelve indexable bio pages unless each one carries genuine unique content. Thin pages at scale are a liability, not a footprint.
