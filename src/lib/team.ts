/**
 * Scholar Opportunity Fund — Team Roster
 *
 * Single source of truth for the team page and any other place that needs
 * to render team members. Update this file to add, remove, or reorder.
 *
 * Three tiers:
 *   1. CIO — Dr. Brogaard; every capital decision.
 *   2. GPs — co-founders of the fund, overseeing the analyst cohort.
 *   3. Analysts — the cohort doing the fundamental work.
 */

export type TeamRole =
  | "Chief Investment Officer"
  | "Co-Founder & General Partner"
  | "Analyst";

export interface TeamMember {
  slug: string;
  name: string;
  role: TeamRole;
  image: string;
  /** 1-sentence headline shown in the grid. */
  headline: string;
  /** Optional longer bio for expanded treatments. */
  bio?: string;
  /** Optional graduation year, e.g. "May 2029". */
  gradYear?: string;
  /** Optional credentials shown below role (e.g. degree, GPA). */
  credentials?: string;
  /** Optional LinkedIn URL. */
  linkedin?: string;
}

export const CIO: TeamMember = {
  slug: "jonathan-brogaard",
  name: "Dr. Jonathan Brogaard",
  role: "Chief Investment Officer",
  image: "/team/brogaard.jpg",
  headline:
    "Tenured finance professor, FINRA Market Regulation Committee member, and one of the most cited researchers in market microstructure.",
  bio: "Dr. Brogaard chairs every investment decision at Scholar Opportunity Fund. His research on high-frequency trading, market structure, and liquidity has been cited thousands of times and is standard reading in institutional trading desks. He serves on the FINRA Market Regulation Committee, advising on how systematic activity shapes U.S. equity markets. At SOF, his role is narrow and absolute: every capital decision passes through him, and process authority stops where his judgment begins.",
  credentials: "Ph.D. Finance, Northwestern University",
};

export const GPS: TeamMember[] = [
  {
    slug: "ronan-schultz",
    name: "Ronan Schultz",
    role: "Co-Founder & General Partner",
    image: "/team/ronan.jpg",
    headline:
      "Co-founder of Scholar Opportunity Fund; oversees the analyst team and fund operations as a permanent GP.",
    bio: "Ronan co-founded Scholar Opportunity Fund alongside Dr. Brogaard and will be with the fund for its full lifespan. As General Partner, he oversees the analyst team, owns day-to-day operations, and serves as the primary bridge between the student cohort and the CIO.",
    gradYear: "May 2028",
    credentials: "B.S. QAMO · 4.00 GPA",
  },
];

export const ANALYSTS: TeamMember[] = [
  {
    slug: "gregor-hawranek",
    name: "Gregor Hawranek",
    role: "Analyst",
    image: "/team/gregor.jpg",
    headline:
      "Incoming Bain & Company consultant; co-founded the University of Utah's first quantitative finance student organization.",
    gradYear: "May 2027",
    credentials: "B.S. QAMO, Mathematics minor · 3.90 GPA",
  },
  {
    slug: "adam-ferrell",
    name: "Adam Ferrell",
    role: "Analyst",
    image: "/team/adam.jpg",
    headline:
      "Growth Equity Intern at University Growth Fund; Sorenson Capital Case Competition finalist.",
    gradYear: "May 2028",
    credentials: "B.S. QAMO · 3.98 GPA",
  },
  {
    slug: "cash-francis",
    name: "Cash Francis",
    role: "Analyst",
    image: "/team/cash.jpg",
    headline:
      "Incoming Data Science Intern at Pattern; Goldman Sachs Emerging Leaders Series.",
    gradYear: "May 2028",
    credentials: "B.S. QAMO · 4.00 GPA",
  },
  {
    slug: "joel-bryan",
    name: "Joel Bryan",
    role: "Analyst",
    image: "/team/joel.jpg",
    headline:
      "Founder of Bryan Car Care, LLC; Data Analytics Competition winner (1st of 70+ teams).",
    gradYear: "May 2028",
    credentials: "B.S. QAMO · 3.93 GPA",
  },
  {
    slug: "maxwell-white",
    name: "Maxwell White",
    role: "Analyst",
    image: "/team/max.jpg",
    headline:
      "Growth Equity Intern at UGF ($90M AUM); Analyst Intern at Spacestation Investments.",
    gradYear: "May 2028",
    credentials: "B.S. QAMO, Finance emphasis · 3.90 GPA",
  },
  {
    slug: "caden-campbell",
    name: "Caden Campbell",
    role: "Analyst",
    image: "/team/caden.jpg",
    headline:
      "Incoming Summer Analyst at Cimarron Healthcare Capital; Summer Growth Equity Intern at UGF.",
    gradYear: "May 2029",
    credentials: "Honors B.S. Finance, Mathematics minor · 4.00 GPA",
  },
  {
    slug: "tyler-teo",
    name: "Tyler Teo",
    role: "Analyst",
    image: "/team/tyler.png",
    headline:
      "Honors dual-degree in QAMO and Mathematics; SEO Strategy & Analytics Intern at Optodex.",
    gradYear: "May 2029",
    credentials:
      "Honors B.S. QAMO (Finance) + B.S. Mathematics (Statistics) · 4.00 GPA",
  },
  {
    slug: "maretta-henriksen",
    name: "Maretta Henriksen",
    role: "Analyst",
    image: "/team/maretta.jpg",
    headline:
      "Marketing & Data Analyst at Eccles Graduate Programs; Women in Business member.",
    gradYear: "May 2029",
    credentials: "B.S. QAMO · 4.00 GPA",
  },
  {
    slug: "nicholas-kouzmanoff",
    name: "Nicholas Kouzmanoff",
    role: "Analyst",
    image: "/team/nick.jpg",
    headline:
      "Utah Real Estate Competition development team; Eagle Scout and former Associated Student Body President.",
    gradYear: "May 2029",
    credentials: "B.S. Finance",
  },
  {
    slug: "taggart-severson",
    name: "Taggart Severson",
    role: "Analyst",
    image: "/team/taggart.jpg",
    headline:
      "Bloomberg Finance Fundamentals certified; incoming Treasurer, Business Economics Society.",
    gradYear: "May 2029",
    credentials: "B.S. QAMO · 3.92 GPA",
  },
  {
    slug: "ian-elvington",
    name: "Ian Elvington",
    role: "Analyst",
    image: "/team/ian.png",
    headline:
      "Dual-path in QAMO and Applied Mathematics; independent research in Bayesian statistics and alternative data.",
    gradYear: "May 2029",
    credentials: "B.S. QAMO / Applied Mathematics",
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
