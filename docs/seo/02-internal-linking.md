# 02 — Internal linking

Internal links do three jobs at once: they route authority, they tell the crawler what a page is about, and they are the only reason a page is discoverable at all. Most sites treat them as navigation and get one job out of three.

## The model

Three tiers, with different purposes and different weight.

**Structural links.** Header nav, footer. They appear on every page, so they establish that a page exists and is important enough to be permanent. They carry little relative authority precisely because they are everywhere. Keep them small and stable. A footer with forty links is a footer that passes nothing.

**Contextual links.** Inside body copy, in a sentence, with anchor text that describes the destination. These carry the real weight and the real topical signal. A link from a paragraph about the research process to `/program` tells the crawler what `/program` is in a way the nav never can.

**Relational links.** "Related insights", "the analyst who wrote this", next and previous. These build the lateral edges that turn a set of pages into a graph rather than a star.

The current site has tier one, almost none of tier two, and none of tier three. The rebuild should invert that ratio.

## Rules

**Anchor text describes the destination.** "Read our investment process" is a link. "Learn more" and "click here" are not; they pass authority with no topical signal and they fail accessibility review at the same time. If the anchor text would not make sense read aloud out of context, rewrite it.

**Link the first meaningful mention, once per page.** Linking the same destination five times on one page does not multiply anything, it just adds noise and dilutes the other links on the page. Pick the mention where a reader would most plausibly want to leave and link that one.

**Every link must be a real `<a href>` in the served HTML.** A click handler that calls `router.push` is invisible to a crawler. In this codebase that means `next/link`, not `onClick`. Check the rendered output, not the JSX, because a component that looks like a link in source can render as a `div` after a refactor.

**Do not link to redirects internally.** An internal link pointing at a URL that 301s wastes a hop and is trivially avoidable. Redirects exist for external and legacy inbound traffic, not for our own navigation. Audit for this after any URL change.

**Nothing important sits behind an interaction.** Content revealed only on tab click, accordion expand, or modal open is usually still in the DOM and usually still crawled, but its links are weaker and its content is discounted. If it matters, render it.

**Cross-link the pillars deliberately.** `/about`, `/team`, and `/program` should each link to the other two in body copy, not just in the nav. Those three pages are the entity, and the crawler should see them as a tightly connected cluster rather than three siblings hanging off the nav.

## The thing people get wrong

Sitemaps are not links. A page listed in `sitemap.xml` and linked from nowhere is discoverable and worthless. It will get crawled, it may get indexed, and it will hold no authority. If you find yourself relying on the sitemap to surface a page, the page needs a home in the link graph instead.

The corollary: when you delete a page's last inbound link during a redesign, you have orphaned it, even if the route still resolves and the sitemap still lists it. This is the most common way a rebuild silently tanks a previously ranking page.

## Insights, when it exists

This is the part worth designing before you need it, because retrofitting is painful.

- Each piece links up to `/insights` and out to at least one pillar page in body copy.
- Each piece is attributed to a real author on `/team`, linked, both directions. That link is what connects the content graph to the entity graph, and for a fund it is the whole game. A research note by a named analyst who has a real profile and a real LinkedIn is a credibility artifact. An unattributed post is a blog.
- Related pieces link laterally, three to five, chosen by actual topical relation and not by recency.
- The index page lists every piece with a real title and a real excerpt. Not a card grid of dates.

## Checks worth automating

Cheap to write, and they catch the failures that matter:

- No route in the app tree is missing from the rendered link graph (orphan check).
- No internal `href` resolves to a URL that redirects.
- No internal `href` returns 404.
- No anchor text is in the banned set: "click here", "learn more", "read more", "here".
- Every published insight resolves to an author who exists in `src/lib/team.ts`.

Run them in CI on every pull request. An orphan check that only runs when someone remembers is an orphan check that does not exist.
