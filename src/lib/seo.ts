import type { Metadata } from "next";
import { FUND, SITE_URL } from "./constants";
import { ALL_MEMBERS, CIO, type TeamMember } from "./team";

interface MetaOptions {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  noIndex?: boolean;
}

/* ── Page Metadata ── */

export function generatePageMetadata({
  title,
  description,
  path,
  ogImage,
  noIndex,
}: MetaOptions): Metadata {
  const url = `${SITE_URL}${path}`;

  // Defining `openGraph` here replaces the file-convention images a parent
  // segment would otherwise contribute, so the generated image routes
  // (src/app/opengraph-image.tsx, twitter-image.tsx) must be referenced
  // explicitly. The old fallback pointed at /og/default.png, which never
  // existed.
  const image = ogImage || `${SITE_URL}/opengraph-image`;
  const twitterImage = ogImage || `${SITE_URL}/twitter-image`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: FUND.name,
      images: [{ url: image, width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [twitterImage],
    },
    ...(noIndex && { robots: { index: false, follow: false } }),
  };
}

/* ── Entity graph ──
 *
 * One connected @graph with stable @id values, emitted from the root layout.
 * Every cross-reference is an @id, not a duplicated inline object. Facts come
 * only from constants.ts and team.ts; nothing here may state what a page does
 * not visibly show. See docs/seo/04-structured-data.md.
 */

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export function personId(member: TeamMember): string {
  return `${SITE_URL}/team#${member.slug}`;
}

function personNode(member: TeamMember) {
  return {
    "@type": "Person",
    "@id": personId(member),
    name: member.name,
    jobTitle: member.role,
    worksFor: { "@id": ORG_ID },
    ...(member.image && { image: `${SITE_URL}${member.image}` }),
    ...(member.linkedin && { sameAs: [member.linkedin] }),
  };
}

function organizationNode() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: FUND.name,
    alternateName: FUND.shortName,
    url: SITE_URL,
    description: FUND.description,
    logo: `${SITE_URL}/icon.png`,
    email: FUND.contactEmail,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Salt Lake City",
      addressRegion: "UT",
      addressCountry: "US",
    },
    founder: { "@id": personId(CIO) },
    foundingDate: String(FUND.foundedYear),
    // sameAs: add the LinkedIn company page here once its URL is verified to
    // resolve. Never guess a slug; a dead sameAs is worse than none.
  };
}

/* ── Graph Schema (root layout) ── */

export function buildGraphSchema() {
  const website = {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: FUND.name,
    url: SITE_URL,
    publisher: { "@id": ORG_ID },
  };

  return {
    "@context": "https://schema.org",
    "@graph": [organizationNode(), website, ...ALL_MEMBERS.map(personNode)],
  };
}

/* ── Breadcrumb Schema ── */

export function breadcrumbSchema(
  items: { name: string; href: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.href}`,
    })),
  };
}

/* ── Article Schema (for Insights) ── */

export function articleSchema(article: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
}) {
  // An author who is on the team is referenced into the entity graph by @id,
  // which is what connects the content graph to the people. See docs/seo/02.
  const teamAuthor = ALL_MEMBERS.find((m) => m.name === article.author);
  const author = teamAuthor
    ? { "@id": personId(teamAuthor) }
    : { "@type": "Person", name: article.author || FUND.cio };

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: `${SITE_URL}${article.url}`,
    mainEntityOfPage: `${SITE_URL}${article.url}`,
    ...(article.image && { image: article.image }),
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author,
    publisher: { "@id": ORG_ID },
  };
}
