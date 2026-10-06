// Shared by the full /process rail and the homepage teaser, so the two never tell different stories.
export const PROCESS_STEPS = [
  { title: 'Idea and research', text: 'A hypothesis about why some stocks are mispriced. Ideas come from academic research, market data and corporate events like mergers, spin-offs and index changes.', meta: 'Output · a testable idea' },
  { title: 'Build and backtest', text: 'Analysts build the strategy and test it on years of historical data, including trading costs.', meta: 'Output · backtest results' },
  { title: 'Independent review', text: "Someone who didn't build the strategy tries to break it. If the evidence holds up, the investment committee decides whether it moves on to trading.", meta: 'Output · reviewed strategy' },
  { title: 'Paper and live trading', text: 'Before a strategy trades, we write down the results that would count as a pass or a fail. Approved strategies trade on paper first, then with capital, under fund-wide risk limits.', meta: 'Output · ongoing monitoring' },
] as const;
