# 09 — Failure modes

Every one of these is a real thing that has happened on a site we have run. They are listed by how expensive they are to discover late.

## Host and canonical drift

The site says its URL is X, serves at Y, and redirects X to Y. Every signal the site emits is inconsistent with the URL it lives at. It is live on this site today. It happens because `SITE_URL` has a fallback default, the environment variable never got set, and nothing failed loudly.

**Prevention:** fail the production build if `NEXT_PUBLIC_SITE_URL` is unset. A build that cannot know its own host should not ship.

## The published empty page

A route exists for content that has not been written. It renders a placeholder, returns 200, sits in the sitemap. The nav link was hidden, so a human never sees it and nobody notices that Google does. Live on this site today at `/insights`.

**Prevention:** a route with no content returns 404 or `noindex`. The sitemap is generated from content that exists, never from a list of routes that might.

## The hardcoded page list

`sitemap.ts` lists five pages. Six exist. Nobody updated the list when `/apply` was added, because nothing told them to. Live on this site today.

**Prevention:** generate from the route tree, or maintain an explicit registry and add a test that fails when a route is missing from it.

## `lastmod` that means nothing

Every sitemap entry timestamped with build time. Every page "changed" at the same instant. Google discounts the field and you lose the ability to request a targeted recrawl. Live on this site today.

**Prevention:** per-file git mtime with a fallback. Layout changes do not bump content pages.

## The rebuild that orphans the ranking page

The redesign drops a link because it did not fit the new layout. The page still resolves, still sits in the sitemap, and has just lost its only inbound edge. It falls out of the index over the following weeks and nobody connects the two events.

**Prevention:** an orphan check in CI, and a rule that no page loses its last inbound link without a redirect or a deliberate decision to retire it.

## The redirect chain

A URL was renamed in April. It was renamed again in July. The April redirect still points at the July URL's old name, which now redirects again. Each hop loses authority and after a handful the crawler gives up.

**Prevention:** when renaming, rewrite every existing redirect that points at the old name to point at the new one. Keep the map in one file with a comment per entry saying where it came from.

## Dead `sameAs`

The Organization schema lists a Yelp and a BBB profile in `sameAs`. Both slugs were guessed, both 404. For months the site told Google the business was the same entity as two dead pages. Nobody noticed because `sameAs` produces nothing visible.

**Prevention:** every URL in `sameAs` is verified to return 200 in a CI check, and re-verified quarterly.

## The self-serving rating

An `aggregateRating` block, written by the business about itself, shipped on every page. Against Google's review snippet policy, and on a fund site it is also a performance representation. It was removed in an audit.

**Prevention:** no ratings, reviews, or numeric performance claims in structured data, ever, without explicit sign-off on the specific figure.

## The script-closing content field

A review body, a post title, or a frontmatter string contains `</script>`. It is serialised raw into a JSON-LD block. The tag closes early and the rest of the payload is parsed as HTML. It went unnoticed until an audit found it.

**Prevention:** the JSON-LD serialiser escapes `<`, `>`, `&`, U+2028 and U+2029. Covered in document 04.

## The stale machine-readable summary

`llms.txt` was hand-maintained. The pricing changed. The file did not. AI assistants read a price that was wrong in nine places and reported it as authoritative.

**Prevention:** generate `llms.txt` from the same constants the pages render from. Never hand-edit it.

## The claim that was true last quarter

The site said something specific and correct. The underlying fact changed. The site did not, and neither did the nine blog posts that repeated it. Prospects read one thing on the site and heard another from a person, and concluded one of them was lying.

**Prevention:** every factual claim lives in one place and is rendered everywhere from it. A claim that appears in copy in more than one file will drift. For a fund, this covers team titles, affiliations, founding date, capital, and anything about strategy. When a fact changes, grep the whole repo for the old value before shipping.

## The tag manager

A GTM container was added for one tag. Within three months it carried seven, two of them firing into nothing because a configuration tag was missing, one of them a pixel whose ID did not match the one on the other domain. Performance dropped, the CSP acquired four wildcards, and nobody could say what the container did.

**Prevention:** covered in document 08. No tag manager. Every script is a code change with a review.

## The Friday deploy

A URL-changing deploy went out at the end of a week. The redirects were in a separate commit that had not merged. Nobody looked at Search Console until Tuesday.

**Prevention:** redirects ship in the same deploy as URL changes. URL-changing deploys do not go out before a weekend.
