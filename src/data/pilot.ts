// Phase 1 pilot business case for one Elmina precinct, as in the v12 pitch deck (slide 7) and the team's
// Google Sheet (Scenarios tab, 10 Nov 2026). 25 years, 8% discount rate, before tax, research values.
// tests/numbers.test.ts checks the parts add up.

export const PILOT_CASE = {
  npvM: 2.26,
  /** NPV if nobody tops up (deck slide 7). */
  npvNoTopUpsM: 1.52,
  irrPct: 12.0,
  paybackYears: 9.0,
  build: {
    totalM: 7.2,
    parts: [
      { label: '2 SunD Bays', m: 3.5 },
      { label: 'Roof solar', m: 2.6 },
      { label: 'Canopy expansion, year 2', m: 1.05 },
    ],
  },
  /** Who pays for the build: customers' top-ups and Sime Darby. */
  pays: { topUpsM: 3.8, sdpM: 3.4 },
  /** Sime Darby's cumulative cash. */
  cash: [
    { year: 2, label: 'Lowest point', m: -5.0 },
    { year: 9, label: 'Break-even', m: 0 },
    { year: 25, label: 'By year 25', m: 14.7 },
  ],
  /** The same model with four unconfirmed inputs moved (charges per lot a day shown). */
  cases: [
    { name: 'Bear', npvM: 0.69, payback: 10.6, sessions: 1.3 },
    { name: 'Base', npvM: 2.26, payback: 9.0, sessions: 1.6 },
    { name: 'Bull', npvM: 4.82, payback: 7.0, sessions: 2.0 },
  ],
} as const;
