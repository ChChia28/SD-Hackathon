import {
  CREDIT_TOPUP,
  KM_PER_KWH,
  PUBLIC_PRICE,
  PUBLIC_SURPLUS_PRICE,
  RESIDENT_PRICE,
  RESIDENT_SURPLUS_PRICE,
  EBIKE_RIDE_RM,
  MALL_PARKING_RM,
  PASS_KWH,
  PASS_PLANS,
  PASS_TYPICAL_MONTH,
  SAVER_PACKS,
  type PassAudience,
  SOLAR_BAY_BONUS,
  SOLAR_SELL_RATE_RM,
  SURPLUS_BONUS,
  MAX_CASH_REBATE,
  SLICE_MAX_BILL_SHARE,
} from '../data/constants';
import { PERSONAS } from '../data/personas';
import type { Facility } from '../data/rewards';
import type { BayStatus, PersonaId, Profile } from '../store/types';

/**
 * Splits newly generated solar into SunD Credits and a bill rebate, by the person's reward model.
 * - Roof host (CREAM): kWh × selling rate = solar income; credits get the +20% top-up, the rebate is RM for RM.
 * - Slice holder: credits are issued at a flat 36 sen/kWh SunD rate (≈ RM 40 a month for 1 kW),
 *   paid for by SunD Bay charging profit (appendix A11, A20). They choose how much goes straight to the bill.
 * 1 SC = RM 1 at SunD.
 */
export function splitReward(kwh: number, persona: PersonaId, billShare: number) {
  const p = PERSONAS[persona];
  if (p.reward === 'cream') {
    const income = kwh * p.rewardShare * SOLAR_SELL_RATE_RM;
    return { income, credits: income * (1 - billShare) * CREDIT_TOPUP, rebateRm: income * billShare };
  }
  if (p.reward === 'slice') {
    const income = kwh * SLICE_CREDIT_RATE;
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

export function bonusRateFor(persona: PersonaId, status: BayStatus, solarPct: number): number {
  if (!usesCredits(persona)) return 0;
  if (status === 'surplus') return SURPLUS_BONUS;
  return solarPct >= 50 ? SOLAR_BAY_BONUS : 0;
}

/**
 * How a charge of `kwh` would be paid: SunD Pass kWh first (they reset monthly), then SunD Credits,
 * then Saver Credits (any bay), then card. `pass` is in kWh; the rest in RM / SC.
 */
export function estimatePayment(kwh: number, balance: { sc: number; saver: number; passKwh: number }, rate: number, useCredits: boolean) {
  let rem = kwh;
  const pass = Math.min(rem, Math.max(0, balance.passKwh));
  rem -= pass;
  const sc = useCredits ? Math.min(rem * rate, Math.max(0, balance.sc)) : 0;
  rem -= sc / rate;
  const saver = Math.min(rem * rate, Math.max(0, balance.saver));
  rem -= saver / rate;
  const rm = Math.max(0, rem * rate);
  return { pass, sc, saver, rm };
}

/** Bonus on a Saver pack, whole %: RM 50 → 60 is 20. */
export const saverBonusPct = (p: { pay: number; get: number }) => Math.round((p.get / p.pay - 1) * 100);
/** The biggest Saver bonus on offer, whole % (the top pack). */
export const SAVER_MAX_PCT = Math.max(...SAVER_PACKS.map(saverBonusPct));
export const SAVER_MIN_PCT = Math.min(...SAVER_PACKS.map(saverBonusPct));

/** Standard charging rate for a Pass audience: RM 0.90 for residents (paid in credits), RM 1.40 for the public. */
export const standardRate = (who: PassAudience) => (who === 'resident' ? RESIDENT_PRICE : PUBLIC_PRICE);
export const audienceOf = (persona: PersonaId): PassAudience => (usesCredits(persona) ? 'resident' : 'public');

/**
 * What a SunD Pass month is worth at the standard rate: all 100 kWh plus a month of eBike rides and mall parking.
 * Public: RM 140 + 8 × RM 2 + 8 × RM 3 = RM 180. Residents: RM 90 + RM 40 = RM 130.
 */
export const passMonthValue = (who: PassAudience, use = PASS_TYPICAL_MONTH) => PASS_KWH * standardRate(who) + use.rides * EBIKE_RIDE_RM + use.parks * MALL_PARKING_RM;

/** SunD Pass plans this person can buy: resident plans for SD residents, the public plan for everyone else. */
export const passPlansFor = (persona: PersonaId) => PASS_PLANS.filter((p) => p.who === audienceOf(persona));

/** Charging kWh left on this person's SunD Pass (0 without one). */
export const passKwhLeft = (prof: Pick<Profile, 'pass'>) => prof.pass?.kwhLeft ?? 0;

export type FacilityPay =
  | { via: 'locked' }
  | { via: 'pass' }
  | { via: 'sc' | 'saver'; price: number; enough: boolean };

/**
 * How this person pays for a facility right now.
 * - SunD Pass: eBikes and mall parking are included.
 * - SunD Credits (residents): solar-powered facilities only, i.e. eBikes and the clubhouse.
 * - Saver Credits: anywhere in SunD, including mall parking and shops. The clubhouse stays residents-only.
 * Credits are tried first, then Saver; if neither covers it, the person's main option is returned with enough = false.
 */
export function facilityPayment(f: Facility, persona: PersonaId, prof: Pick<Profile, 'sc' | 'saver' | 'pass'>): FacilityPay {
  const resident = usesCredits(persona);
  if (f.kind === 'clubhouse' && !resident) return { via: 'locked' };
  if (prof.pass && (f.kind === 'ebike' || f.kind === 'parking')) return { via: 'pass' };
  const sc = resident && f.cost !== undefined ? { via: 'sc' as const, price: f.cost, enough: prof.sc >= f.cost } : null;
  const saver = f.saverRm !== undefined ? { via: 'saver' as const, price: f.saverRm, enough: prof.saver >= f.saverRm } : null;
  if (sc?.enough) return sc;
  if (saver?.enough) return saver;
  return sc ?? saver ?? { via: 'locked' };
}

/** Slice credits use one flat SunD rate for every household (A11). */
export const SLICE_CREDIT_RATE = 0.36;
/** What a 1 kW slice is worth a month (A11): 110 kWh × flat 36 sen ≈ RM 40. The tariff argument is kept for callers. */
export const sliceValueRm = (_tariff: number, kwhMonth = 110) => kwhMonth * SLICE_CREDIT_RATE;
