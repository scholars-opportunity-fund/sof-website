/**
 * Scholars Opportunity Fund. Team Roster.
 *
 * Single source of truth for the team page and any other place that needs
 * to render team members. Update this file to add, remove, or reorder.
 *
 * Two tiers:
 *   1. Leadership. CIO + Head of Research and Operations.
 *   2. Analysts. The cohort doing the fundamental work.
 */

export type TeamRole =
  | "Chief Investment Officer"
  | "Head of Research & Operations"
  | "Analyst";

export interface TeamMember {
  slug: string;
  name: string;
  role: TeamRole;
  /** Headshot path under /public. Omit when we have no photo yet; the card and
   *  modal fall back to a monogram tile built from the member's initials. */
  image?: string;
  /** 1-sentence headline shown in modal. */
  headline: string;
  /** Optional longer bio for expanded treatments (shown in modal if present). */
  bio?: string;
  /** Optional graduation year, e.g. "May 2029". */
  gradYear?: string;
  /** Degree / major line shown in the modal. */
  credentials?: string;
  /** Optional LinkedIn profile URL. */
  linkedin?: string;
}

/** The CIO's portrait is used on About, Program, and Signal, so his `image` is
 *  required even though it is optional on the rest of the roster. */
export const CIO: TeamMember & { image: string } = {
  slug: "jonathan-brogaard",
  name: "Dr. Jonathan Brogaard",
  role: "Chief Investment Officer",
  image: "/team/jonathan.png",
  headline:
    "Associate Dean of Research and Kendall D. Garff Chaired Professor at the University of Utah's David Eccles School of Business.",
  bio: "Dr. Brogaard is the Associate Dean of Research and Kendall D. Garff Chaired Professor of Finance at the University of Utah's David Eccles School of Business. His research on trading microstructure and empirical asset pricing has been published in the Journal of Finance, Journal of Financial Economics, and Review of Financial Studies, and cited in Bloomberg, The Economist, the Financial Times, the New York Times, and the Wall Street Journal. He has worked with the U.S. Commodity Futures Trading Commission, the U.K. Financial Services Authority, and the Canadian Investment Industry Regulatory Organization, and currently serves on FINRA's Market Regulation Committee. In 2023 he founded the University of Utah's Institute for Advanced Investment Management. He was named one of Poets & Quants' Best 40-Under-40 Business School Professors in 2021 and holds a J.D. and a Ph.D. in Finance from Northwestern University.",
  credentials: "J.D. and Ph.D. Finance, Northwestern University",
  linkedin: "https://www.linkedin.com/in/jonathan-brogaard/",
};

export const GPS: TeamMember[] = [
  {
    slug: "ronan-schultz",
    name: "Ronan Schultz",
    role: "Head of Research & Operations",
    image: "/team/ronan.jpg",
    headline:
      "Co-founder of Scholars Opportunity Fund. Oversees the analyst team, the research pipeline, and fund operations.",
    bio: "Ronan co-founded Scholars Opportunity Fund alongside Dr. Brogaard and will be with the fund for its full lifespan. As Head of Research and Operations, he owns the day-to-day engine of the fund: the analyst cohort, the research workflow from candidate detection to memo delivery, and all operating infrastructure supporting the CIO's investment decisions.",
    gradYear: "May 2028",
    credentials: "B.S. Quantitative Analysis of Markets & Organizations",
    linkedin: "https://www.linkedin.com/in/ronanschultz/",
  },
];

export const ANALYSTS: TeamMember[] = [
  {
    slug: "cash-francis",
    name: "Cash Francis",
    role: "Analyst",
    image: "/team/cash.jpg",
    headline:
      "Incoming Data Science Intern at Pattern. Selected for the Goldman Sachs Emerging Leaders Series.",
    gradYear: "May 2028",
    credentials: "B.S. QAMO",
    linkedin: "https://www.linkedin.com/in/cash-francis/",
  },
  {
    slug: "joel-bryan",
    name: "Joel Bryan",
    role: "Analyst",
    image: "/team/joel.jpg",
    headline:
      "Founder of Bryan Car Care, LLC. Data Analytics Competition winner (1st of 70+ teams).",
    gradYear: "May 2028",
    credentials: "B.S. QAMO",
    linkedin: "https://www.linkedin.com/in/joelhbryan/",
  },
  {
    slug: "caden-campbell",
    name: "Caden Campbell",
    role: "Analyst",
    image: "/team/caden.jpg",
    headline:
      "Incoming Summer Analyst at Cimarron Healthcare Capital. Summer Growth Equity Intern at UGF.",
    gradYear: "May 2029",
    credentials: "Honors B.S. Finance, Mathematics minor",
    linkedin: "https://www.linkedin.com/in/caden-campbell-an7",
  },
  {
    slug: "tyler-teo",
    name: "Tyler Teo",
    role: "Analyst",
    image: "/team/tyler.png",
    headline:
      "Honors dual-degree in QAMO and Mathematics. SEO Strategy & Analytics Intern at Optodex.",
    gradYear: "May 2029",
    credentials:
      "Honors B.S. QAMO (Finance) and B.S. Mathematics (Statistics)",
    linkedin: "https://www.linkedin.com/in/tyler-teo/",
  },
  {
    slug: "nicholas-kouzmanoff",
    name: "Nicholas Kouzmanoff",
    role: "Analyst",
    image: "/team/nick.jpg",
    headline:
      "Utah Real Estate Competition development team. Eagle Scout and former Associated Student Body President.",
    gradYear: "May 2029",
    credentials: "B.S. Finance",
    linkedin: "https://www.linkedin.com/in/nicholas-kouzmanoff",
  },
  {
    slug: "taggart-severson",
    name: "Taggart Severson",
    role: "Analyst",
    image: "/team/taggart.jpg",
    headline:
      "Bloomberg Finance Fundamentals certified. Incoming Treasurer, Business Economics Society.",
    gradYear: "May 2029",
    credentials: "B.S. QAMO",
    linkedin: "https://www.linkedin.com/in/taggart-severson",
  },
  {
    slug: "ian-elvington",
    name: "Ian Elvington",
    role: "Analyst",
    image: "/team/ian.png",
    headline:
      "Dual-path in QAMO and Applied Mathematics. Independent research in Bayesian statistics and alternative data.",
    gradYear: "May 2029",
    credentials: "B.S. QAMO / Applied Mathematics",
    linkedin: "https://www.linkedin.com/in/ian-elvington",
  },
  // TODO: real copy pending. Headline, credentials, and gradYear for the three
  // members below are placeholders — replace before this page goes to production.
  {
    slug: "john-pary",
    name: "John Pary",
    role: "Analyst",
    image: "/team/john-pary.jpg",
    headline: "Analyst, Scholars Opportunity Fund.",
    linkedin: "https://www.linkedin.com/in/john-pary-bb93b7359/",
  },
  {
    slug: "riley-fontanos-alfonso",
    name: "Riley Fontanos Alfonso",
    role: "Analyst",
    headline: "Analyst, Scholars Opportunity Fund.",
    linkedin: "https://www.linkedin.com/in/rileyfontanosalfonso/",
  },
  {
    slug: "greyson-bailey",
    name: "Greyson Bailey",
    role: "Analyst",
    headline: "Analyst, Scholars Opportunity Fund.",
    linkedin: "https://www.linkedin.com/in/greyson-w-bailey/",
  },
];

export const ALL_MEMBERS: TeamMember[] = [CIO, ...GPS, ...ANALYSTS];

/** Group analysts by role for structured display. */
export function groupByRole<
  R extends TeamRole = TeamRole
>(members: TeamMember[]): Record<R, TeamMember[]> {
  const groups = {} as Record<R, TeamMember[]>;
  for (const m of members) {
    const role = m.role as R;
    (groups[role] ||= []).push(m);
  }
  return groups;
}
