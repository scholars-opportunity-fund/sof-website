/**
 * Scholar Opportunity Fund. Team Roster.
 *
 * Single source of truth for the team page and any other place that needs
 * to render team members. Update this file to add, remove, or reorder.
 *
 * Three tiers:
 *   1. CIO. Dr. Brogaard. Every capital decision.
 *   2. Co-Founder. Head of Research and Operations.
 *   3. Analysts. The cohort doing the fundamental work.
 */

export type TeamRole =
  | "Chief Investment Officer"
  | "Co-Founder, Head of Research & Operations"
  | "Analyst";

export interface TeamMember {
  slug: string;
  name: string;
  role: TeamRole;
  image: string;
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

export const CIO: TeamMember = {
  slug: "jonathan-brogaard",
  name: "Dr. Jonathan Brogaard",
  role: "Chief Investment Officer",
  image: "/team/brogaard.jpg",
  headline:
    "Tenured finance professor, FINRA Market Regulation Committee member, and one of the most cited researchers in market microstructure.",
  bio: "Dr. Brogaard chairs every investment decision at Scholar Opportunity Fund. His research on high-frequency trading, market structure, and liquidity has been cited thousands of times and is standard reading on institutional trading desks. He serves on the FINRA Market Regulation Committee, advising on how systematic activity shapes U.S. equity markets. At SOF, his role is narrow and absolute. Every capital decision passes through him, and process authority stops where his judgment begins.",
  credentials: "Ph.D. Finance, Northwestern University",
  linkedin: "https://www.linkedin.com/in/jonathan-brogaard/",
};

export const GPS: TeamMember[] = [
  {
    slug: "ronan-schultz",
    name: "Ronan Schultz",
    role: "Co-Founder, Head of Research & Operations",
    image: "/team/ronan.jpg",
    headline:
      "Co-founder of Scholar Opportunity Fund. Oversees the analyst team, the research pipeline, and fund operations.",
    bio: "Ronan co-founded Scholar Opportunity Fund alongside Dr. Brogaard and will be with the fund for its full lifespan. As Head of Research and Operations, he owns the day-to-day engine of the fund: the analyst cohort, the research workflow from candidate detection to memo delivery, and all operating infrastructure supporting the CIO's investment decisions.",
    gradYear: "May 2028",
    credentials: "B.S. Quantitative Analysis of Markets & Organizations",
    linkedin: "https://www.linkedin.com/in/ronanschultz/",
  },
];

export const ANALYSTS: TeamMember[] = [
  {
    slug: "gregor-hawranek",
    name: "Gregor Hawranek",
    role: "Analyst",
    image: "/team/gregor.jpg",
    headline:
      "Incoming Bain & Company consultant. Co-founded the University of Utah's first quantitative finance student organization.",
    gradYear: "May 2027",
    credentials: "B.S. QAMO, Mathematics minor",
    linkedin: "https://www.linkedin.com/in/gdhawranek/",
  },
  {
    slug: "adam-ferrell",
    name: "Adam Ferrell",
    role: "Analyst",
    image: "/team/adam.jpg",
    headline:
      "Growth Equity Intern at University Growth Fund. Sorenson Capital Case Competition finalist.",
    gradYear: "May 2028",
    credentials: "B.S. QAMO",
    linkedin: "https://www.linkedin.com/in/a-ferrell",
  },
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
    slug: "maxwell-white",
    name: "Maxwell White",
    role: "Analyst",
    image: "/team/max.jpg",
    headline:
      "Growth Equity Intern at UGF ($90M AUM). Analyst Intern at Spacestation Investments.",
    gradYear: "May 2028",
    credentials: "B.S. QAMO, Finance emphasis",
    linkedin: "https://www.linkedin.com/in/maxwell-n-white/",
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
    slug: "maretta-henriksen",
    name: "Maretta Henriksen",
    role: "Analyst",
    image: "/team/maretta.jpg",
    headline:
      "Marketing & Data Analyst at Eccles Graduate Programs. Women in Business member.",
    gradYear: "May 2029",
    credentials: "B.S. QAMO",
    linkedin: "https://www.linkedin.com/in/maretta-henriksen-b3409b353/",
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
