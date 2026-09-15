// Shared destinations for the brain, navigation, and HTML fallback links.
// The contact address lives here rather than in constants.ts because constants
// imports this file; the other direction would be a cycle.
export const CONTACT_EMAIL = 'contact@scholarsoppfund.com';

export const SITE_SECTIONS = {
  // The homepage rail is the cleanest telling of the process, so the nav and the brain both land there.
  process: { name: 'Investment process', href: '/#pipeline', description: 'Follow an idea from sourcing and diligence to investment committee and monitoring.' },
  approach: { name: 'The approach', href: '/#approach', description: 'Explore our focus on public equities, special situations, and event-driven opportunities.' },
  team: { name: 'The team', href: '/team', description: 'Meet the leadership and analysts connecting research with investment judgment.' },
  program: { name: 'Analyst program', href: '/program#analyst-program', description: 'See how student analysts develop through research, collaboration, and real work product.' },
  structure: { name: 'Fund structure', href: '/#fund-structure', description: 'Understand the independent fund, experienced oversight, and defined responsibilities.' },
  leadership: { name: 'Leadership', href: '/#leadership', description: 'The Chief Investment Officer who owns every capital decision.' },
  insights: { name: 'Insights', href: '/insights', description: 'What the fund has written on catalysts, situations, and process.' },
  apply: { name: 'Apply', href: '/apply', description: 'Join the analyst cohort.' },
  contact: { name: 'Contact', href: `mailto:${CONTACT_EMAIL}`, description: 'Reach the fund directly.' },
} as const;
