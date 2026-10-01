// Shared by the full /process rail and the homepage teaser, so the two never tell different stories.
export const PROCESS_STEPS = [
  { title: 'Idea sourcing', text: 'Structured sourcing across event-driven situations in the public equity universe: spin-offs, mergers, restructurings, index changes, activism.', meta: 'Output · candidate list' },
  { title: 'Screening & diligence', text: 'Candidates clearing the screen enter rigorous diligence. Analysts build the case and pressure-test it internally before it leaves the team.', meta: 'Output · investment memo' },
  { title: 'Investment committee', text: 'The final memo reaches the Chief Investment Officer, who owns sizing, entry and exit.', meta: 'Output · capital decision' },
  { title: 'Monitoring', text: 'Positions are tracked against the original thesis and material events. Reporting closes the loop between research and outcome.', meta: 'Output · 24-hour event updates' },
] as const;
