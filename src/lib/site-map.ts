// Shared destinations for the brain, navigation, and HTML fallback links.
export const SITE_SECTIONS = {
  // The homepage rail is the cleanest telling of the process, so the nav and the brain both land there.
  process: { name: 'Investment process', href: '/#pipeline', description: 'Follow an idea from sourcing and diligence to investment committee and monitoring.' },
  approach: { name: 'The approach', href: '/#approach', description: 'Explore our focus on public equities, special situations, and event-driven opportunities.' },
  team: { name: 'The team', href: '/team', description: 'Meet the leadership and analysts connecting research with investment judgment.' },
  program: { name: 'Analyst program', href: '/program#analyst-program', description: 'See how student analysts develop through research, collaboration, and real work product.' },
  structure: { name: 'Fund structure', href: '/about#fund-structure', description: 'Understand the independent fund, experienced oversight, and defined responsibilities.' },
} as const;
