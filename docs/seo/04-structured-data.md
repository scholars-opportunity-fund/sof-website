# 04 — Structured data and the entity graph

This is the highest-leverage area on this site and the one most likely to be skipped, because it produces nothing visible. Do it anyway.

## Why it matters more here than on a normal site

Structured data on an e-commerce site buys rich snippets: star ratings, prices, stock status. Cosmetic wins in the search result.

On this site it buys something different. It is how we tell Google that "Scholars Opportunity Fund" is **a specific entity in the world** rather than a string of words, that it is connected to Jonathan Brogaard and the University of Utah, and that twelve named people are associated with it. That connection is what produces a knowledge panel, what makes branded search resolve cleanly, and what AI assistants read when someone asks who we are.

For an organisation nobody has heard of, the entity graph is the credibility mechanism. Copy is what humans read. The graph is what machines read, and machines are increasingly the first reader.

## The graph, not a pile of blobs

The mistake is emitting disconnected schema blocks per page. Correct approach is a single connected graph, with stable `@id` values that nodes reference each other by.

Current state, in `src/lib/seo.ts`: an `Organization` and a `WebSite` node in a `@graph`, joined by `publisher`. Correct shape, thin content. Nothing else references it, and the `Person` nodes do not exist.

The target graph:

```
Organization  (@id: {SITE}/#organization)
   ├─ founder / employee ──► Person nodes (one per team member)
   ├─ sameAs               ──► LinkedIn company page, any external profile
   ├─ parentOrganization?  ──► University of Utah, if the affiliation supports it
   └─ logo, address, foundingDate

WebSite       (@id: {SITE}/#website)
   └─ publisher            ──► Organization

Person        (@id: {SITE}/team#firstname-lastname)
   ├─ worksFor             ──► Organization
   ├─ sameAs               ──► their LinkedIn
   └─ jobTitle, name, image

Article       (per insight)
   ├─ author               ──► Person node
   ├─ publisher            ──► Organization
   └─ mainEntityOfPage     ──► the page URL

BreadcrumbList (per nested page)
```

Every arrow is a `@id` reference, not a duplicated inline object. That is what makes it a graph.

## The single biggest gap

`src/lib/team.ts` already contains twelve people with names, titles, and a LinkedIn URL each. None of it reaches the structured data.

Emitting `Person` nodes for those twelve, each with `sameAs` pointing at their real LinkedIn profile and `worksFor` pointing at the Organization `@id`, is the highest-value structured-data work available on this site. It is also nearly free, because the data already exists in a typed array.

`sameAs` is the disambiguation mechanism. It is how you tell Google that this "Cash Francis" is that "Cash Francis". Without it, twelve names on a page are twelve strings.

## Rules

**Only mark up what is visible on the page.** Schema describing content a human cannot see is a spam signal and can earn a manual action. If the `Person` node says someone is an analyst, the page says so too.

**Say only true things.** Every claim here is a claim about a financial institution made in machine-readable form, which means it gets repeated verbatim by systems that will not check it. Founding year, titles, affiliations, and any performance or capital figure must be exactly right. When in doubt, omit the property. An absent field costs nothing; a wrong one is a liability that propagates.

**Never publish self-serving ratings.** Do not emit `aggregateRating` or a `Review` array that the fund writes about itself. Google's review-snippet policy treats self-published ratings as self-serving, and for a fund it is worse than a policy problem. Any performance representation is a regulatory surface. Keep numbers out of schema unless Joel has explicitly cleared the specific figure.

**Escape the JSON-LD payload.** Any string that reaches a `<script type="application/ld+json">` block can close the tag early if it contains `</script>`, which turns a content field into an HTML injection. Escape `<`, `>`, `&`, and the U+2028 / U+2029 line separators to their `\uXXXX` forms before serialising. Those escapes are still valid JSON, so consumers parse identical data. This matters as soon as insight frontmatter or any external content feeds a schema field, which is to say as soon as `/insights` ships.

**Centralise it.** All schema construction stays in `src/lib/seo.ts`, built from typed constants. A page that hand-writes a JSON-LD literal will drift from the entity within two months.

**Wire up the breadcrumbs.** `breadcrumbSchema()` exists and is called from nowhere. Either use it on nested routes or delete it, but do not leave dead schema code implying a signal that is not being sent.

## Validate, every time

Structured data fails silently. A malformed node produces no error, no warning, and no effect.

- Google Rich Results Test for anything eligible for a rich result.
- Schema.org validator for the full graph.
- Search Console Enhancements reports after deploy, which is the only place you will see real-world parse failures.

Add a build-time check that every schema object serialises and that every `@id` referenced by another node actually exists in the graph. Dangling `@id` references are the most common silent failure and no external validator catches them.
