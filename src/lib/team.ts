/**
 * Scholars Opportunity Fund. Team Roster.
 *
 * Single source of truth for the team page and any other place that needs
 * to render team members. Update this file to add, remove, or reorder.
 *
 * Two tiers:
 *   1. Leadership. CIO + Head of Research and Operations.
 *   2. The cohort doing the fundamental work: associates and analysts.
 */

export type TeamRole =
  | "Chief Investment Officer"
  | "Head of Research & Operations"
  | "Associate"
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
    bio: "Schultz co-founded Scholars Opportunity Fund alongside Dr. Brogaard and will be with the fund for its full lifespan. As Head of Research and Operations, Schultz owns the day-to-day engine: the analyst cohort, the research workflow from candidate detection to memo delivery, and all the operating infrastructure behind the CIO's investment decisions.",
    gradYear: "May 2028",
    credentials: "B.S. Quantitative Analysis of Markets & Organizations",
    linkedin: "https://www.linkedin.com/in/ronanschultz/",
  },
];

export const ANALYSTS: TeamMember[] = [
  {
    slug: "cash-francis",
    name: "Cash Francis",
    role: "Associate",
    image: "/team/cash.jpg",
    headline:
      "Leads fundamental signal research. Headed to Goldman Sachs' Risk division.",
    bio: "Francis brings a background spanning data science at Pattern and consulting work through Korn Ferry and the University of Utah. Francis currently leads fundamental signal research as a team lead at SOF and is headed to Goldman Sachs' Risk division in finance.",
    gradYear: "May 2028",
    credentials: "B.S. QAMO, Advanced Financial Analysis minor",
    linkedin: "https://www.linkedin.com/in/cash-francis/",
  },
  {
    slug: "joel-bryan",
    name: "Joel Bryan",
    role: "Associate",
    image: "/team/joel.jpg",
    headline:
      "Built the fund's cloud architecture, databases and trading systems. Founded Bryan Car Care at 18.",
    bio: "From Coeur d'Alene, Idaho, Bryan is studying Quantitative Analysis of Markets and Organizations at the University of Utah's David Eccles School of Business, on track to graduate in December 2027, a year and a half early. At 18, Bryan founded Bryan Car Care, a private car collection management company with more than $30M in vehicles actively under management, and runs its six-person team remotely from Salt Lake City on self-built software. At SOF, Bryan leads infrastructure and risk: building the fund's cloud architecture, databases, security controls and trading systems, and owning their deployment, monitoring and reliability in production.",
    gradYear: "December 2027",
    credentials: "B.S. QAMO",
    linkedin: "https://www.linkedin.com/in/joelhbryan/",
  },
  {
    slug: "caden-campbell",
    name: "Caden Campbell",
    role: "Associate",
    image: "/team/caden.jpg",
    headline:
      "Leads the Alternative Signals pod. Mathematics at NYU.",
    bio: "Campbell is a sophomore studying mathematics and minoring in business at NYU. Campbell leads the Alternative Signals pod, identifying and developing novel applications of data analytics and mathematics in financial markets, and plans to continue similar work after graduating. Outside the fund, Campbell enjoys rock climbing, snowboarding, hiking, and exploring new places.",
    gradYear: "May 2029",
    credentials: "B.A. Mathematics, Business minor, NYU",
    linkedin: "https://www.linkedin.com/in/caden-campbell-an7",
  },
  {
    slug: "tyler-teo",
    name: "Tyler Teo",
    role: "Analyst",
    image: "/team/tyler.png",
    headline:
      "Alternative Signals team. Machine-learning driven algorithmic trading strategies.",
    bio: "Originally from Ogden, Utah, Teo joined the fund during its inaugural year. Teo works on the Alternative Signals team, focusing on the research and development of machine learning driven algorithmic trading strategies, and is building toward a long-term career in quantitative finance.",
    gradYear: "May 2029",
    credentials: "Honors B.S. QAMO and Mathematics",
    linkedin: "https://www.linkedin.com/in/tyler-teo/",
  },
  {
    slug: "nicholas-kouzmanoff",
    name: "Nicholas Kouzmanoff",
    role: "Analyst",
    image: "/team/nick.jpg",
    headline:
      "Fundamental Signals team. Venture capital student analyst at the Sorenson Impact Institute.",
    bio: "Kouzmanoff is from Palos Verdes, California, and joined the fund in its inaugural year. Kouzmanoff works on the Fundamental Signals team building trading strategies and serves as a venture capital student analyst at the Sorenson Impact Institute, with plans for a career in investment banking and a long-term interest in buy-side investing.",
    gradYear: "May 2029",
    credentials: "B.S. Finance, Advanced Financial Analysis minor",
    linkedin: "https://www.linkedin.com/in/nicholas-kouzmanoff",
  },
  {
    slug: "taggart-severson",
    name: "Taggart Severson",
    role: "Analyst",
    image: "/team/taggart.jpg",
    headline:
      "Treasurer, Business Economics Society. Building toward a career in real estate development.",
    bio: "Severson is a sophomore from San Jose, California, studying Quantitative Analysis of Markets and Organizations at the University of Utah. Beyond SOF, Severson serves as Treasurer of the Business Economics Society and is a member of the Goff Strategic Leadership Institute, through which Severson also interns at the Grant County Economic Growth Council. After graduation, Severson plans to apply those analytical and strategic skills to a career in real estate development.",
    gradYear: "May 2029",
    credentials: "B.S. QAMO, Advanced Financial Analysis and Real Estate minors",
    linkedin: "https://www.linkedin.com/in/taggart-severson",
  },
  {
    slug: "ian-elvington",
    name: "Ian Elvington",
    role: "Analyst",
    image: "/team/ian.png",
    headline:
      "Runs the fund's middle-office functions. Headed for a Master's in Applied Mathematics.",
    bio: "Elvington is the Quantitative Risk Manager at SOF, responsible for the firm's middle-office functions. Elvington plans to pursue a Master's in Applied Mathematics and hopes to keep working in quantitative finance.",
    gradYear: "May 2029",
    credentials: "B.S. Applied Mathematics and QAMO",
    linkedin: "https://www.linkedin.com/in/ian-elvington",
  },
  // Bios are written in the third person.
  {
    slug: "john-pary",
    name: "John Pary",
    role: "Analyst",
    image: "/team/john-pary.jpg",
    headline:
      "AI Special Projects Manager at Renew Health. Builds signals through to live trading.",
    bio: "Pary is from Spokane, Washington, and spent the summer as an AI Special Projects Manager at Renew Health. Pary now pairs that technical side with finance research, building signals through to live trading end to end, and is looking to pursue a career in management consulting or banking.",
    gradYear: "May 2029",
    credentials: "B.S. QAMO, Advanced Financial Analysis and AI minors",
    linkedin: "https://www.linkedin.com/in/john-pary-bb93b7359/",
  },
  {
    slug: "riley-fontanos-alfonso",
    name: "Riley Alfonso",
    role: "Analyst",
    image: "/team/riley-alfonso.jpg",
    headline:
      "Alternative Signals pod. Data Science and Cognitive Science at UC Berkeley.",
    bio: "Alfonso is a Data Science and Cognitive Science double major at UC Berkeley who joined SOF to apply that background to real market research. Alfonso's long-term goal is to build a career applying machine learning and data science in novel ways across interdisciplinary fields, currently exploring this in the realm of quantitative analysis.",
    gradYear: "May 2029",
    credentials: "B.A. Data Science and Cognitive Science, UC Berkeley",
    linkedin: "https://www.linkedin.com/in/rileyfontanosalfonso/",
  },
  {
    slug: "greyson-bailey",
    name: "Greyson Bailey",
    role: "Analyst",
    image: "/team/greyson-bailey.jpg",
    headline:
      "Analyst at University Growth Fund and Investment Intern at FJ Management. Helping raise the inaugural fund.",
    bio: "Bailey is an Analyst at University Growth Fund, leading deals in growth-stage companies, and an Investment Intern at FJ Management. Bailey is applying that experience toward helping raise SOF's inaugural fund, and previously worked at InvestNest Park City in partnership with the Park City Angels. Bailey hopes to pursue a career in asset management; outside of finance, Bailey is an avid reader, a 14-handicap golfer, and fluent in Spanish.",
    gradYear: "May 2028",
    credentials: "B.S. QAMO, Advanced Financial Analysis minor",
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
