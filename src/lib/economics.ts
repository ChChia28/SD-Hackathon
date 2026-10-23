import { CO2_KG_PER_KWH, YIELD_KWH_PER_KWP_DAY } from '../data/constants';

/** SunD Bay sizes and costs from appendix A2 (team build-up from published unit prices). */
export const BAY_SIZES = {
  small: { label: 'Small · 10 lots', lots: 10, kWp: 25, batteryKwh: 60, capex: [0.4, 0.58], effective: [0.34, 0.49], build: '2–3 months' },
  medium: { label: 'Medium · 30 lots', lots: 30, kWp: 75, batteryKwh: 180, capex: [1.19, 1.73], effective: [1.02, 1.47], build: '3–4 months' },
  large: { label: 'Large · 100 lots', lots: 100, kWp: 250, batteryKwh: 600, capex: [4.0, 5.8], effective: [3.4, 4.9], build: '4–6 months' },
} as const;
export type BaySize = keyof typeof BAY_SIZES;

/** Appendix A3 / A9 assumptions. */
export const A3 = { sessionKwh: 18, publicShare: 0.7, publicPrice: 1.4, gridCost: 0.45, omShareOfCapex: 0.025 };

export interface WhatIf {
  size: BaySize;
  sessionsPerLot: number;
  publicPrice: number;
  publicShare: number;
  gridCost: number;
}

/**
 * A3 annual cash view for one bay:
 * energy sold = lots × sessions × 18 kWh; canopy + battery supply up to kWp × 3.6 kWh;
 * the rest is grid top-up at the grid cost; public share pays the public price (residents pay in credits);
 * O&M ≈ 2.5% of capex a year (RM 100/day on a medium bay).
 */
export function bayEconomics(w: WhatIf) {
  const b = BAY_SIZES[w.size];
  const soldKwh = b.lots * w.sessionsPerLot * A3.sessionKwh;
  const solarDay = b.kWp * YIELD_KWH_PER_KWP_DAY;
  const solarKwh = Math.min(soldKwh, solarDay);
  const gridKwh = soldKwh - solarKwh;
  const gridRm = gridKwh * w.gridCost;
  const publicKwh = soldKwh * w.publicShare;
  const publicRm = publicKwh * w.publicPrice;
  const residentKwh = soldKwh - publicKwh;
  const capexMid = ((b.capex[0] + b.capex[1]) / 2) * 1e6;
  const omDay = (capexMid * A3.omShareOfCapex) / 365;
  const netDay = publicRm - gridRm - omDay;
  const netYear = netDay * 365;
  const payback = netYear > 0 ? ([b.effective[0] * 1e6, b.effective[1] * 1e6].map((c) => c / netYear) as [number, number]) : null;
  const co2Year = (solarKwh * 365 * CO2_KG_PER_KWH) / 1000;
  return { soldKwh, solarKwh, solarDay, gridKwh, gridRm, publicKwh, publicRm, residentKwh, omDay, netDay, netYear, payback, co2Year, solarShare: soldKwh ? solarKwh / soldKwh : 0 };
}

export const DEFAULT_WHATIF: WhatIf = { size: 'medium', sessionsPerLot: 2, publicPrice: A3.publicPrice, publicShare: A3.publicShare, gridCost: A3.gridCost };
