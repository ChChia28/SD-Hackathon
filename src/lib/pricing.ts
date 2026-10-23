import {
  CREDIT_TOPUP,
  KM_PER_KWH,
  PUBLIC_PRICE,
  PUBLIC_SURPLUS_PRICE,
  RESIDENT_PRICE,
  RESIDENT_SURPLUS_PRICE,
  SAVER_MIN_SOC,
  SOLAR_BAY_BONUS,
  SOLAR_SELL_RATE_RM,
  SURPLUS_BONUS,
  MAX_CASH_REBATE,
  SLICE_MAX_BILL_SHARE,
} from '../data/constants';
import { PERSONAS } from '../data/personas';
import type { BayLive, BayStatus, PersonaId } from '../store/types';

/**
 * Splits newly generated solar into SunD Credits and a bill rebate, by the person's reward model.
 * - Roof host (CREAM): kWh × selling rate = solar income; credits get the +20% top-up, the rebate is RM for RM.
 * - Slice holder: credits are issued at the resident's own effective tariff, so the saving equals
 *   that kWh coming off the bill (appendix A4). They choose how much goes straight to the bill.
 * 1 SC = RM 1 at SunD.
 */
export function splitReward(kwh: number, persona: PersonaId, billShare: number) {
  const p = PERSONAS[persona];
  if (p.reward === 'cream') {
    const income = kwh * p.rewardShare * SOLAR_SELL_RATE_RM;
    return { income, credits: income * (1 - billShare) * CREDIT_TOPUP, rebateRm: income * billShare };
  }
  if (p.reward === 'slice') {
    const income = kwh * (p.tariff ?? 0.35);
    return { income, credits: income * (1 - billShare), rebateRm: income * billShare };
  }
  return { income: 0, credits: 0, rebateRm: 0 };
}

/** Highest share of the reward that can go to the bill. */
export const maxBillShare = (persona: PersonaId) => (PERSONAS[persona].reward === 'slice' ? SLICE_MAX_BILL_SHARE : MAX_CASH_REBATE);

/** Driving range a credit balance buys at the resident rate. */
export const scToKm = (sc: number) => (sc / RESIDENT_PRICE) * KM_PER_KWH;

/** SunD Credits are for SD residents (roof hosts and slice holders). */
export const usesCredits = (persona: PersonaId) => PERSONAS[persona].reward !== 'none';

/** RM (or SC) per kWh. Residents pay in credits at the member rate; the public pays per kWh. */
export function rateFor(persona: PersonaId, status: BayStatus): number {
  const surplus = status === 'surplus';
  if (usesCredits(persona)) return surplus ? RESIDENT_SURPLUS_PRICE : RESIDENT_PRICE;
  return surplus ? PUBLIC_SURPLUS_PRICE : PUBLIC_PRICE;
}

/** Discount against the standard price for that person. */
export const discountPct = (rate: number, persona: PersonaId = 'public') =>
  Math.round((1 - rate / (usesCredits(persona) ? RESIDENT_PRICE : PUBLIC_PRICE)) * 100);

/** Saver Credits only work where the bay has plenty of stored solar. */
export const saverEligible = (live: BayLive) => live.soc >= SAVER_MIN_SOC;

export function bonusRateFor(persona: PersonaId, status: BayStatus, solarPct: number): number {
  if (!usesCredits(persona)) return 0;
  if (status === 'surplus') return SURPLUS_BONUS;
  return solarPct >= 50 ? SOLAR_BAY_BONUS : 0;
}

/** How a charge of `kwh` would be paid: SunD Credits first, then Saver Credits, then card. */
export function estimatePayment(
  kwh: number,
  balance: { sc: number; saver: number },
  rate: number,
  useCredits: boolean,
  saverOk: boolean,
) {
  let rem = kwh;
  const sc = useCredits ? Math.min(rem * rate, Math.max(0, balance.sc)) : 0;
  rem -= sc / rate;
  const saver = saverOk ? Math.min(rem * rate, Math.max(0, balance.saver)) : 0;
  rem -= saver / rate;
  const rm = Math.max(0, rem * rate);
  return { sc, saver, rm };
}

/** What a 1 kW slice is worth a month at a given effective tariff (A4): 110 kWh × rate. */
export const sliceValueRm = (tariff: number, kwhMonth = 110) => kwhMonth * tariff;
