# 05 — Answer engines (GEO)

## Why this is the main event here

A meaningful and growing share of "who is Scholars Opportunity Fund" queries never reach a search result page. Someone asks ChatGPT, Claude, Perplexity, or Google's AI overview, reads a synthesised answer, and never visits the site.

For a demand-capture business that is a threat, because it intercepts a click that would have converted. For this site it is mostly an opportunity, because the goal was never the click. The goal is that the answer is accurate and that we are the source it came from.

That reframes the objective: **do not optimise to be ranked, optimise to be quoted.**

## What makes a page quotable

Retrieval systems chunk pages, embed the chunks, and pull the ones that answer the question. What survives that pipeline:

**Self-contained claims.** A sentence that carries its own subject and context survives being extracted from its paragraph. "SOF is a student-run event-driven fund in public equities led by Professor Jonathan Brogaard at the University of Utah" survives anywhere. "We focus on special situations" does not, because "we" is gone the moment the chunk is lifted.

**Answers positioned before elaboration.** Lead with the fact, then explain. A page that builds atmospherically to its point gets chunked into pieces that individually say nothing.

**Real headings.** Headings are chunk boundaries. A heading that states the question a reader actually has ("How the fund selects positions") produces a clean, retrievable chunk. A heading that is a mood ("Our Philosophy") produces a chunk with no handle.

**Specifics.** Named people, dates, methods, affiliations. Retrieval systems weight concrete detail because it is what distinguishes a real answer from filler. "Led by Dr. Jonathan Brogaard, Associate Dean of Research" is retrievable. "Led by experienced faculty" is not.

**Plain HTML.** Content that requires JavaScript to appear may never be seen. Most AI crawlers do not execute JavaScript, and the ones that do deprioritise it. This site is statically rendered, which is a real advantage. Keep it.

**Consistency across surfaces.** When the site, LinkedIn, and a university page disagree about a title or a founding year, a model has to pick, and it will sometimes pick wrong and then repeat the wrong version indefinitely. Alignment across every surface is worth more here than any on-page tactic.

## `llms.txt`

Currently 404. Worth adding.

It is a plain-Markdown file at `/llms.txt` that states what the organisation is and links the pages worth reading. The convention is young and not universally honoured, but it is cheap, it is a single static file, and when it is read it is treated as the authoritative summary.

What belongs in it: what the fund is, in one paragraph, in complete sentences. Who leads it and their real affiliation. What it invests in. Where it is. How to make contact. A list of the key pages with absolute URLs.

What does not: marketing language, anything unverified, and any performance or capital figure that has not been cleared. Whatever goes in this file is what gets repeated back, verbatim, by systems that will not check it. Treat it as the most consequential copy on the site, because per word it is.

Keep it generated from the same constants the site renders from. A hand-maintained `llms.txt` goes stale within one product change, and a stale one is worse than none because it is treated as authoritative.

## Bot policy

The current `robots.txt` allows everyone implicitly. Make the choice explicitly, because the two categories deserve different answers.

**Retrieval and citation crawlers** fetch a page to answer a live question and link back. Allow these. They are the mechanism by which we get cited. Blocking them removes us from the answer entirely.

**Bulk training crawlers** collect content to train models. These do not cite and do not refer. Whether to allow them is a policy call for Joel, not a technical one. There is a reasonable argument either way: blocking protects nothing especially valuable on a public marketing site, and allowing may improve how well future models know the entity.

The distinction is real and the vendors document it. Anthropic, for instance, separates its retrieval agents from its training crawler under different user-agent strings, so blocking training does not cost citations. Check each vendor's current documentation when you write the file, because these names change.

Whatever the decision, name the groups explicitly and remember the winner-take-all matching rule from document 03: a named group must repeat every disallow, not inherit it.

## What not to do

- **Do not write for the model at the expense of the reader.** Keyword-stuffed, list-heavy prose reads as low quality to both.
- **Do not fabricate specificity.** Inventing a precise-sounding detail to be more quotable is how a wrong fact about a financial institution ends up in a model's answer permanently.
- **Do not add a chatbot or an embedded assistant to the site.** It adds JavaScript, breaks the CSP, and answers nothing the pages should not already answer.
