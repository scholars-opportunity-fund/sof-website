export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://scholarsoppfund.com";

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
  { label: "Overview", href: "/about" },
  { label: "Team", href: "/team" },
  { label: "Process", href: "/program" },
  { label: "Contact", href: `mailto:${CONTACT_EMAIL}` },
] as const;

export const FOOTER_LINKS = {
  fund: [
    { label: "Overview", href: "/about" },
    { label: "Team", href: "/team" },
  ],
  program: [{ label: "Process", href: "/program" }],
  contact: [
    {
      label: CONTACT_EMAIL,
      href: `mailto:${CONTACT_EMAIL}`,
    },
  ],
} as const;
