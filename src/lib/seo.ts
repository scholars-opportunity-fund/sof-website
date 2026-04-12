import type { Metadata } from "next";
import { FUND, SITE_URL } from "./constants";

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
  const image = ogImage || `${SITE_URL}/og/default.png`;

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
      images: [image],
    },
    ...(noIndex && { robots: { index: false, follow: false } }),
  };
}

/* ── Organization Schema ── */

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: FUND.name,
    alternateName: FUND.shortName,
    url: SITE_URL,
    description: FUND.description,
    founder: {
      "@type": "Person",
      name: FUND.cio,
      jobTitle: FUND.cioTitle,
    },
    foundingDate: String(FUND.foundedYear),
  };
}

/* ── Graph Schema (root layout) ── */

export function buildGraphSchema() {
  const org = organizationSchema();
  const { "@context": _ctx, ...orgEntity } = org;

  const website = {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: FUND.name,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return {
    "@context": "https://schema.org",
    "@graph": [orgEntity, website],
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
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: `${SITE_URL}${article.url}`,
    ...(article.image && { image: article.image }),
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      "@type": "Person",
      name: article.author || FUND.cio,
    },
    publisher: {
      "@type": "Organization",
      name: FUND.name,
      "@id": `${SITE_URL}/#organization`,
    },
  };
}
