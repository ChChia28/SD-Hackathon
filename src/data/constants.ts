// Every figure here comes from the SunD deck / appendix (source id in brackets, see data/sources.ts),
// or is a demo value marked ASSUMPTION. tests/numbers.test.ts checks these against the deck.

/** Real-world Proton e.MAS 5 efficiency used in the deck: ~7 km per kWh (A4, ASSUMPTION in A9). */
export const KM_PER_KWH = 7;
/** Peninsular grid emission factor 2024, kg CO₂ per kWh [ec-gef]. */
export const CO2_KG_PER_KWH = 0.74;

/** KL solar yield used throughout the deck: 3.6 kWh per kWp per day ≈ 110 kWh per kW per month (A4, A9). */
export const YIELD_KWH_PER_KWP_DAY = 3.6;
export const SLICE_KWH_PER_MONTH = 110;
/** A solar slice is 1 kW of the shared township pool (deck slide 3). */
export const SLICE_KW = 1;

/** Effective TNB domestic rates per kWh (A4): ~35 sen at ≤600 kWh/month, ~52 sen above. Base 44.43 sen. */
export const TARIFF = { base: 0.4443, low: 0.35, high: 0.52, aisyah: 162 / 490 }; // Aisyah ≈490 kWh: 44.43 − 12 sen EEI, ×1.016 ≈ 33 sen ⇒ bill ≈ RM 162 (A11)

/**
 * Roof hosts (CREAM) — Kin Chung's 22 Oct model, kept as SDP-adjustable settings:
 * solar income = kWh × selling rate; credits get a top-up; the bill rebate is capped.
 */
export const SOLAR_SELL_RATE_RM = 0.1;
export const CREDIT_TOPUP = 1.2;
export const MAX_CASH_REBATE = 0.5;
export const DEFAULT_CASH_SHARE = 0.25;

/** Slice holders can apply all of their slice to the TNB bill, or keep some as SunD credits for charging. */
export const SLICE_MAX_BILL_SHARE = 1;

/** Public price: the appendix models RM 1.40/kWh (A13–A14); market DC RM 0.88–1.80 [evsifu]. */
export const PUBLIC_PRICE = 1.4;
/** Solar Surplus Discount for the public — ASSUMPTION (demo value). */
export const PUBLIC_SURPLUS_PRICE = 1.1;
/** Residents pay in credits at a member rate — ASSUMPTION (demo values). 1 SC = RM 1. */
export const RESIDENT_PRICE = 0.9;
export const RESIDENT_SURPLUS_PRICE = 0.8;
export const MARKET_DC = { low: 0.88, high: 1.8 };

/** Bonus credits, as a share of solar kWh charged — ASSUMPTION (demo values). */
export const SOLAR_BAY_BONUS = 0.05;
export const SURPLUS_BONUS = 0.1;

/** Bay battery thresholds, % state of charge. */
export const SURPLUS_SOC = 80;
export const GRID_BACKUP_SOC = 15;

/** Charging sessions are shown as a time-lapse so a demo charge takes ~20 s. */
export const CHARGE_TIMELAPSE = 180;

/** Proton e.MAS 5 Premium: 40.16 kWh [emas]. */
export const EV = { name: 'Proton e.MAS 5', batteryKwh: 40, startSoc: 34 };

/**
 * Saver Credits (team update, 10 Nov 2026 — replaces the deck's RM 20 → 30 at high-solar bays only):
 * top up at least RM 50, spendable anywhere in SunD — charging at every bay, eBikes, mall parking,
 * the clubhouse (residents) and mall shops. The more you top up, the bigger the bonus: +20%, +25%, +30%.
 * Capped at +30% so the SunD Pass stays the better deal for regulars: a typical Pass month is worth +40% or more
 * (PASS_TYPICAL_MONTH). tests/numbers.test.ts enforces that gap.
 */
export const SAVER_PACKS = [
  { pay: 50, get: 60 },
  { pay: 100, get: 125 },
  { pay: 200, get: 260 },
];

/**
 * SunD Pass (team proposal, 10 Nov 2026; prices are ASSUMPTIONS for the pilot to test): a monthly bundle of
 * 100 kWh at any SunD Bay + unlimited SunD eBike rides + unlimited mall parking.
 * 100 kWh is worth RM 90 at the resident rate and RM 140 at the public rate, so every plan costs less than its charging alone.
 */
export const PASS_KWH = 100;
export const PASS_DAYS = 30;
export type PassAudience = 'resident' | 'public';
export const PASS_PLANS: { id: string; who: PassAudience; price: number; label: string; note: string; months: number }[] = [
  { id: 'resident-12', who: 'resident', price: 79, label: '12-month plan', note: 'Billed monthly · 12-month minimum', months: 12 },
  { id: 'resident-1', who: 'resident', price: 89, label: 'Month to month', note: 'Stop anytime', months: 1 },
  { id: 'public-1', who: 'public', price: 129, label: 'Month to month', note: 'Stop anytime', months: 1 },
];
/** A typical Pass month, used to show what the Pass is worth: all 100 kWh plus eBike and mall parking twice a week — ASSUMPTION. */
export const PASS_TYPICAL_MONTH = { rides: 8, parks: 8 };
/** Elmina Central Mall parking, per entry — ASSUMPTION (demo value). Free with a SunD Pass. */
export const MALL_PARKING_RM = 3;
/** SunD eBike, per 30-minute ride (RM, or SC for residents). Free with a SunD Pass. */
export const EBIKE_RIDE_RM = 2;

/** Elmina Ridge 1: 228 homes, 1 MWp of SDP-installed solar [sdp-sr24]; ~3.7 MWh a day (team estimate). */
export const TOWNSHIP = { name: 'Elmina', homes: 228, mwp: 1, homesPlanned: 36_600, mwhPerDay: 3.7 };

/** Demo value — CREAM lease income is paid separately and isn't specified in the pitch. */
export const DEMO_LEASE_RM = 120;

/** Solar peak window the app nudges demand into (deck slide 6). */
export const PEAK = { from: 11, to: 15 };

/** Heat alert: MetMalaysia Level 1 = ≥35 °C for 3 consecutive days (A5). */
export const HEAT_LEVEL1_C = 35;
/** Street shade cut feels-like temperature by 3.1 °C UTCI [xu-bardhan]. */
export const WALK_DELTA_C = 3.1;
/** Panel: ~550 W on ~2.6 m² → ~0.21 kWp per m² of walkway roof (team context, ASSUMPTION). */
export const KWP_PER_M2 = 0.55 / 2.6;

/** SunD Balcony: 800 W kit, ~560 kWh/yr (German benchmark), RM 16–24/month at 35–52 sen (A7, A4). */
export const BALCONY = { watts: 800, kwhYear: 560, kwhMonth: 47, rmLow: 16, rmHigh: 24, kitEur: '€300–500', germanyUnits: '1.53 million' };

/** Map scale: SVG units to km. */
export const KM_PER_UNIT = 0.03;
