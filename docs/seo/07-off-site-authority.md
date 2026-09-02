# 07 — Off-site authority

## The honest position

Nobody links to this site. Almost nobody will, organically, for a long time. That is not a problem to solve with link-building tactics; it is the natural state of a young institution, and the tactics that promise to change it quickly are the ones that get sites penalised.

What we can do is make sure that every place the entity is mentioned points here, says the same thing, and is one we control or influence. For a fund, that set is small, high-trust, and mostly already exists.

## What counts

Authority from a link is roughly the linking site's own authority, divided by its outbound links, scaled by relevance. A single link from a university department page outweighs a hundred directory listings. Volume is not the goal.

Rank the sources by what they are worth here:

**Tier 1, institutional.** The University of Utah, the David Eccles School of Business, any department or faculty page that mentions the fund or Dr. Brogaard's role in it. One link from here is worth more than everything else on this list combined. It is also the hardest to get and the most worth asking for. This is a conversation Joel or Dr. Brogaard has with whoever owns those pages, not something the site can engineer.

**Tier 2, professional profiles.** LinkedIn: the company page and all twelve personal profiles. Each should list the fund by its exact name, link to the site, and use the same title the site uses. Twelve people with consistent, linked profiles is a real entity signal, and it is entirely within our control. It also feeds the `sameAs` graph in document 04 from the other direction.

**Tier 3, press and events.** Any coverage of the fund, any conference or competition appearance, any guest talk. Ask for the link every time. Most organisers will add one if asked and none will if not.

**Tier 4, the professor's own footprint.** Dr. Brogaard has a faculty page, publications, a Google Scholar profile, likely a personal site. Wherever his affiliation with the fund is stated, it should link.

**Tier 5, directories.** Crunchbase, university club directories, student-organisation listings. Low weight individually, but they are where knowledge-graph systems go to confirm an entity exists. Worth claiming once and keeping accurate. Not worth chasing beyond that.

## Consistency is the real work

The knowledge-graph signal is not the links. It is that every one of those surfaces agrees.

Name: "Scholars Opportunity Fund", not "SOF", not "the Scholars Fund", not "Scholar's Opportunity Fund". Title for Dr. Brogaard: identical everywhere. Founding year: identical everywhere. Location: identical everywhere. Description: the same one-sentence version, verbatim where possible.

Every disagreement across surfaces is a place where a model or a knowledge panel has to guess. Pick the canonical version of each fact, put it in `src/lib/constants.ts`, and treat the site as the source of truth that every external profile is aligned to.

## Rules

**Never buy links.** Never trade them. Never post in comment sections or forums for the link. Every one of these is detectable, every one is against the guidelines, and a manual penalty on a fund's website is the kind of thing that gets noticed in diligence.

**Do not accept guest-post or "resource page" offers.** Any inbound email offering a link is spam, and the sites offering are the ones you do not want to be associated with.

**Disavow nothing unless there is a manual action.** The disavow tool is for penalty recovery. Using it pre-emptively against spammy links that will arrive on their own is a waste of time that occasionally causes harm.

**Every outbound link on the site is an endorsement.** Link to the university, to LinkedIn profiles, to primary sources in insights. Do not link to anything you would not vouch for. Outbound links to authoritative sources are a mild positive signal; outbound links to junk are a strong negative one.

## When insights exist

Research notes with a named author, a real thesis, and primary-source citations are the only content this site will ever produce that earns links on merit. A piece that says something specific and defensible about a real situation gets referenced. A piece that summarises what everyone already knows does not.

This is the long game and it is slow. It is also the only sustainable one.
