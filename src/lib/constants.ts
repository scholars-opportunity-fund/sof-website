export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://scholarsoppfund.com";

export const FUND = {
  name: "Scholars Opportunity Fund",
  shortName: "SOF",
  description:
    "A quantitative investment fund targeting special situations in public equities, led by Dr. Jonathan Brogaard.",
  foundedYear: 2025,
  cio: "Dr. Jonathan Brogaard",
  cioTitle: "Chief Investment Officer",
} as const;

export const NAV_ITEMS = [
  { label: "About", href: "/about" },
  { label: "Our Team", href: "/team" },
  { label: "Insights", href: "/insights" },
  { label: "Student Program", href: "/program" },
  { label: "Apply", href: "/apply" },
] as const;

export const FOOTER_LINKS = {
  fund: [
    { label: "About", href: "/about" },
    { label: "Our Team", href: "/team" },
    { label: "Insights", href: "/insights" },
  ],
  program: [
    { label: "Student Program", href: "/program" },
    { label: "Apply", href: "/apply" },
  ],
} as const;
