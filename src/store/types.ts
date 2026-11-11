export type PersonaId = 'landed' | 'condo' | 'public' | 'elder';
export type Lang = 'en' | 'ms' | 'zh';
export type Weather = 'sunny' | 'cloudy' | 'rainy';
export type BayType = 'mall' | 'office' | 'park' | 'clubhouse' | 'commercial' | 'condo' | 'petrol';
export type BayStatus = 'surplus' | 'normal' | 'busy' | 'grid';
export type TxType = 'earn' | 'charge' | 'redeem' | 'topup' | 'checkin' | 'pass';
export type ToastIcon = 'sun' | 'leaf' | 'bolt' | 'gift' | 'star' | 'moon' | 'alert' | 'heat' | 'snow';

export interface Tx {
  id: string;
  type: TxType;
  at: number; // sim time (ms)
  title: string;
  place?: string;
  sc?: number; // SunD Credit delta (excluding bonus)
  rebateRm?: number; // electricity bill rebate earned (roof hosts and slice holders)
  bonusSc?: number;
  saver?: number; // Saver Credit delta, RM
  passKwh?: number; // charging kWh covered by the SunD Pass
  viaPass?: boolean; // eBike ride or mall parking covered by the SunD Pass
  rm?: number; // card / FPX payment, RM (negative = paid)
  kwh?: number;
  solarPct?: number;
  bayId?: string;
  facilityId?: string;
  km?: number;
  co2?: number;
  durationMin?: number;
  method?: string;
  unlocked?: string[]; // achievement ids unlocked by this transaction
}

export interface Voucher {
  id: string;
  facilityId: string;
  code: string;
  at: number;
}

/** An active SunD Pass: a monthly allowance of charging plus unlimited eBike rides and mall parking. */
export interface Pass {
  planId: string;
  price: number;
  startedAt: number; // sim time the pass was bought
  renewsAt: number; // end of the current month of the pass
  /** End of a 12-month plan's minimum term (absent for month to month). */
  commitUntil?: number;
  autoRenew: boolean;
  kwhLeft: number;
  /** eBike rides and parking entries this pass month (unlimited; counted to show the value). */
  rides: number;
  parks: number;
}

export interface Profile {
  sc: number;
  saver: number;
  /** SunD Pass, if this person has one. */
  pass?: Pass | null;
  /** Share of the reward taken as a bill rebate (0 … MAX_CASH_REBATE). The rest is SunD Credits. */
  cashShare: number;
  todayKwh: number;
  todayCredits: number;
  todayRebateRm: number;
  monthKwh: number;
  monthCredits: number;
  monthRebateRm: number;
  lifetimeGenKwh: number;
  solarKwhCharged: number;
  kmOnSolar: number;
  co2Kg: number;
  greenCharges: number;
  surplusCharges: number;
  streak: number;
  lastGreenDay: string;
  evSoc: number;
  txs: Tx[];
  vouchers: Voucher[];
  achievements: string[];
  /** Display language and large-text mode (per person, so Uncle Tan opens in 中文 + large text). */
  lang: Lang;
  largeText: boolean;
  /** Solar slice subscription (slice personas). */
  sliceOn: boolean;
  /** kWh moved into the 11am–3pm solar peak by accepted nudges, this month. */
  nudgeKwh: number;
  /** Nudge ids accepted today (so each shows once a day). */
  nudgesDone: string[];
  balconyWaitlist: boolean;
  /** Day keys on which this person checked in at a SunD Cool room. */
  coolCheckins: string[];
}

export interface BayLive {
  soc: number; // battery state of charge, % — "solar stock"
  busy: Record<string, number>; // occupied ports per connector id
  hourKey: string;
}

export interface Session {
  bayId: string;
  connectorId: string;
  kw: number;
  targetKwh: number;
  delivered: number;
  solarKwh: number;
  solarPct: number;
  passKwh: number; // kWh covered by the SunD Pass so far
  scUsed: number;
  saverUsed: number;
  rm: number;
  rate: number; // RM/kWh for anything not covered by credits
  useCredits: boolean;
  surplus: boolean;
  bonusRate: number;
  startSoc: number;
  elapsedSec: number; // real seconds
  status: 'charging' | 'done';
  txId?: string;
}

export interface Toast {
  id: string;
  icon: ToastIcon;
  title: string;
  body?: string;
  to?: string; // where tapping it navigates
}

export interface Notice extends Toast {
  at: number; // sim time
  read: boolean;
}
