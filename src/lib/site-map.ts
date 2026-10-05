// Shared destinations for the brain, navigation, and HTML fallback links.
// The contact address lives here rather than in constants.ts because constants
// imports this file; the other direction would be a cycle.
export const CONTACT_EMAIL = 'contact@scholarsoppfund.com';

export const SITE_SECTIONS = {
  // Every destination is its own page, so following the brain always leaves the homepage.
  process: { name: 'Investment process', href: '/process', description: 'How a strategy goes from an idea to live trading.' },
  approach: { name: 'The approach', href: '/approach', description: 'How we build systematic strategies in public equities.' },
  team: { name: 'The team', href: '/team', description: 'Meet the leadership and the student analysts.' },
  program: { name: 'Analyst program', href: '/program#analyst-program', description: 'What student analysts work on and how the role grows.' },
  structure: { name: 'Fund structure', href: '/approach#fund-structure', description: 'How the fund is run and who makes the final call.' },
  leadership: { name: 'Leadership', href: '/team', description: 'The Chief Investment Officer who owns every capital decision.' },
  insights: { name: 'Insights', href: '/insights', description: 'Research notes from the SOF team.' },
  apply: { name: 'Apply', href: '/apply', description: 'Join the analyst cohort.' },
  contact: { name: 'Contact', href: `mailto:${CONTACT_EMAIL}`, description: 'Reach the fund directly.' },
} as const;
