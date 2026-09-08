import { SITE_SECTIONS } from './site-map';

const ENV_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

// A production build that cannot know its own host must not ship: every
// canonical, sitemap <loc>, og:url, and schema @id derives from this value.
// See docs/seo/09-failure-modes.md ("Host and canonical drift").
if (!ENV_SITE_URL && process.env.NODE_ENV === "production") {
  throw new Error(
    "NEXT_PUBLIC_SITE_URL is not set. Set it (https://www.scholarsoppfund.com) in the Vercel project for all environments before building."
  );
}

export const SITE_URL = ENV_SITE_URL || "https://www.scholarsoppfund.com";

const CONTACT_EMAIL = "contact@scholarsoppfund.com";

export const FUND = {
  name: "Scholars Opportunity Fund",
  shortName: "SOF",
  description:
    "Student-run event-driven fund in public equities, led by Professor Jonathan Brogaard. Focused on special situations and catalyst-driven opportunities.",
  foundedYear: 2025,
  cio: "Dr. Jonathan Brogaard",
  cioTitle: "Chief Investment Officer",
  location: "Salt Lake City, UT",
  contactEmail: CONTACT_EMAIL,
} as const;

export const NAV_ITEMS = [
  { label: SITE_SECTIONS.approach.name, href: SITE_SECTIONS.approach.href },
  { label: SITE_SECTIONS.team.name, href: SITE_SECTIONS.team.href },
  { label: SITE_SECTIONS.program.name, href: SITE_SECTIONS.program.href },
  { label: "Contact", href: `mailto:${CONTACT_EMAIL}` },
] as const;

export const FOOTER_LINKS = {
  fund: [
    { label: SITE_SECTIONS.process.name, href: SITE_SECTIONS.process.href },
    { label: SITE_SECTIONS.structure.name, href: SITE_SECTIONS.structure.href },
    { label: SITE_SECTIONS.approach.name, href: SITE_SECTIONS.approach.href },
    { label: SITE_SECTIONS.team.name, href: SITE_SECTIONS.team.href },
  ],
  program: [{ label: SITE_SECTIONS.program.name, href: SITE_SECTIONS.program.href }],
  contact: [
    {
      label: CONTACT_EMAIL,
      href: `mailto:${CONTACT_EMAIL}`,
    },
  ],
} as const;
