import { BAYS } from '../data/bays';
import { CO2_KG_PER_KWH, DEFAULT_CASH_SHARE, EV, KM_PER_KWH, PASS_DAYS, PASS_KWH, PASS_PLANS } from '../data/constants';
import { PERSONAS } from '../data/personas';
import { awardAchievements, getFacility } from '../data/rewards';
import { monthName } from '../lib/format';
import { splitReward } from '../lib/pricing';
import { hourKeyOf, occupancy } from '../sim/bays';
import { dayKey, energyBetween, hourOf, pastDailyKwh } from '../sim/solar';
import type { BayLive, Notice, Pass, PersonaId, Profile, Tx, Weather } from './types';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/** The demo always opens on today's date at 10:30 am, when the sun is up. */
export function startTime(): number {
  const d = new Date();
  d.setHours(10, 30, 0, 0);
  return d.getTime();
}

const startOfDay = (t: number) => {
  const d = new Date(t);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

interface ChargeSeed {
  daysAgo: number;
  hour: number;
  bayId: string;
  kwh: number;
  solarPct: number;
  pay: 'sc' | 'saver' | 'rm' | 'pass';
  rate?: number;
  bonus?: number;
}

/** A SunD Pass bought `daysAgo`; `parkDaysAgo` are the mall parking entries it covered. */
interface PassSeed {
  planId: string;
  daysAgo: number;
  hour: number;
  method: string;
  parkDaysAgo: number[];
}

interface Seed {
  carry: number;
  saver: number;
  charged: number;
  greenCharges: number;
  surplusCharges: number;
  streak: number;
  priorGen: number;
  billShare: number;
  charges: ChargeSeed[];
  redeem?: { daysAgo: number; facilityId: string; cost: number; title: string };
  rides?: { daysAgo: number; hour: number; facilityId: string; pay: 'sc' | 'saver' | 'pass' }[];
  topup?: { daysAgo: number; pay: number; get: number };
  pass?: PassSeed;
  nudgeKwh?: number;
  coolDaysAgo?: number[];
}

const SEEDS: Record<PersonaId, Seed> = {
  landed: {
    carry: 34,
    saver: 0,
    charged: 214,
    greenCharges: 16,
    surplusCharges: 2,
    streak: 6,
    priorGen: 4900,
    billShare: DEFAULT_CASH_SHARE,
    charges: [
      { daysAgo: 1, hour: 18.6, bayId: 'central-park', kwh: 14.2, solarPct: 94, pay: 'sc', rate: 1.0, bonus: 0.67 },
      { daysAgo: 3, hour: 13.2, bayId: 'central-mall', kwh: 18.6, solarPct: 100, pay: 'sc', rate: 0.8, bonus: 1.49 },
    ],
    redeem: { daysAgo: 4, facilityId: 'gym', cost: 8, title: 'Gym day pass' },
    rides: [
      { daysAgo: 2, hour: 8.2, facilityId: 'ebike-park', pay: 'sc' },
      { daysAgo: 5, hour: 17.5, facilityId: 'ebike-central', pay: 'sc' },
    ],
    nudgeKwh: 46,
  },
  condo: {
    carry: 9,
    saver: 0,
    charged: 96,
    greenCharges: 9,
    surplusCharges: 1,
    streak: 2,
    priorGen: 640,
    billShare: 1,
    charges: [{ daysAgo: 2, hour: 12.3, bayId: 'residensi', kwh: 12, solarPct: 91, pay: 'sc', rate: 1.0, bonus: 0.46 }],
    rides: [{ daysAgo: 1, hour: 19, facilityId: 'ebike-lakeside', pay: 'sc' }],
    nudgeKwh: 18,
  },
  public: {
    carry: 0,
    saver: 36,
    charged: 28,
    greenCharges: 2,
    surplusCharges: 1,
    streak: 1,
    priorGen: 0,
    billShare: 0,
    charges: [
      { daysAgo: 5, hour: 12.4, bayId: 'central-mall', kwh: 20, solarPct: 100, pay: 'saver', rate: 1.1 },
      { daysAgo: 8, hour: 16.1, bayId: 'lakeside', kwh: 8, solarPct: 92, pay: 'rm', rate: 1.4 },
    ],
    rides: [{ daysAgo: 3, hour: 13, facilityId: 'ebike-central', pay: 'saver' }],
    topup: { daysAgo: 9, pay: 50, get: 55 },
  },
  // Farah: day 14 of her public SunD Pass. 66 of 100 kWh used, 6 rides, 10 parking entries:
  // RM 92.40 + RM 12 + RM 30 = RM 134.40 of value for RM 129, so the Pass has already paid for itself.
  member: {
    carry: 0,
    saver: 0,
    charged: 64,
    greenCharges: 4,
    surplusCharges: 1,
    streak: 1,
    priorGen: 0,
    billShare: 0,
    charges: [
      { daysAgo: 1, hour: 12.6, bayId: 'central-mall', kwh: 15, solarPct: 100, pay: 'pass' },
      { daysAgo: 5, hour: 12.4, bayId: 'central-mall', kwh: 17, solarPct: 96, pay: 'pass' },
      { daysAgo: 8, hour: 13.1, bayId: 'central-mall', kwh: 16, solarPct: 100, pay: 'pass' },
      { daysAgo: 12, hour: 12.2, bayId: 'central-mall', kwh: 18, solarPct: 94, pay: 'pass' },
    ],
    rides: [
      { daysAgo: 1, hour: 13.2, facilityId: 'ebike-central', pay: 'pass' },
      { daysAgo: 3, hour: 13.1, facilityId: 'ebike-park', pay: 'pass' },
      { daysAgo: 5, hour: 18.4, facilityId: 'ebike-central', pay: 'pass' },
      { daysAgo: 7, hour: 13.3, facilityId: 'ebike-central', pay: 'pass' },
      { daysAgo: 9, hour: 12.9, facilityId: 'ebike-park', pay: 'pass' },
      { daysAgo: 12, hour: 13.0, facilityId: 'ebike-central', pay: 'pass' },
    ],
    pass: { planId: 'public-1', daysAgo: 14, hour: 8.4, method: 'FPX online banking', parkDaysAgo: [1, 2, 3, 5, 6, 7, 8, 9, 12, 13] },
    nudgeKwh: 18,
  },
  elder: {
    carry: 0,
    saver: 0,
    charged: 0,
    greenCharges: 0,
    surplusCharges: 0,
    streak: 0,
    priorGen: 220,
    billShare: 1,
    charges: [],
    nudgeKwh: 6,
    coolDaysAgo: [9, 10],
  },
};

export function seedProfile(id: PersonaId, now: number, weather: Weather): Profile {
  const p = PERSONAS[id];
  const seed = SEEDS[id];
  const dayStart = startOfDay(now);
  const dom = new Date(now).getDate();
  const txs: Tx[] = [];

  const cashShare = p.canRebate ? seed.billShare : 0;
  const todayKwh = p.kWp ? energyBetween(p.kWp, 0, hourOf(now), weather) : 0;
  let monthKwh = todayKwh;
  if (p.kWp) {
    for (let i = 1; i < dom; i++) {
      const end = dayStart - i * DAY + DAY - 60_000;
      const kwh = pastDailyKwh(p.kWp, end);
      monthKwh += kwh;
      const r = splitReward(kwh, id, cashShare);
      if (i <= 7) txs.push({ id: `seed-earn-${id}-${i}`, type: 'earn', at: end, title: 'SunD Credits earned', sc: r.credits, rebateRm: r.rebateRm || undefined, kwh });
    }
  }

  const today = splitReward(todayKwh, id, cashShare);
  const month = splitReward(monthKwh, id, cashShare);
  let sc = seed.carry + month.credits;
  let saver = seed.saver;
  let passKwhUsed = 0;
  seed.charges.forEach((c, i) => {
    const bay = BAYS.find((b) => b.id === c.bayId)!;
    const solar = (c.kwh * c.solarPct) / 100;
    const tx: Tx = {
      id: `seed-charge-${id}-${i}`,
      type: 'charge',
      at: dayStart - c.daysAgo * DAY + c.hour * HOUR,
      title: 'Charging',
      place: bay.name,
      kwh: c.kwh,
      solarPct: c.solarPct,
      bayId: bay.id,
      km: c.kwh * KM_PER_KWH,
      co2: solar * CO2_KG_PER_KWH,
      durationMin: Math.round((c.kwh / 22) * 60),
    };
    if (c.pay === 'sc') {
      tx.sc = -c.kwh * (c.rate ?? 1);
      tx.bonusSc = c.bonus ?? 0;
      sc += tx.sc + (c.bonus ?? 0);
    } else if (c.pay === 'saver') {
      tx.saver = -c.kwh * (c.rate ?? 1);
    } else if (c.pay === 'pass') {
      tx.passKwh = c.kwh;
      passKwhUsed += c.kwh;
    } else {
      tx.rm = -c.kwh * (c.rate ?? 1);
    }
    txs.push(tx);
  });
  if (seed.redeem) {
    txs.push({ id: `seed-redeem-${id}`, type: 'redeem', at: dayStart - seed.redeem.daysAgo * DAY + 9 * HOUR, title: seed.redeem.title, place: 'Elmina Clubhouse', facilityId: seed.redeem.facilityId, sc: -seed.redeem.cost });
    sc -= seed.redeem.cost;
  }
  seed.rides?.forEach((r, i) => {
    const f = getFacility(r.facilityId);
    const paid = r.pay === 'pass' ? { viaPass: true } : r.pay === 'sc' ? { sc: -(f.cost ?? 0) } : { saver: -(f.saverRm ?? 0) };
    txs.push({ id: `seed-ride-${id}-${i}`, type: 'redeem', at: dayStart - r.daysAgo * DAY + r.hour * HOUR, title: f.item, place: f.name, facilityId: f.id, ...paid });
    if (r.pay === 'sc') sc -= f.cost ?? 0;
  });
  let pass: Pass | null = null;
  if (seed.pass) {
    const plan = PASS_PLANS.find((x) => x.id === seed.pass!.planId)!;
    const startedAt = dayStart - seed.pass.daysAgo * DAY + seed.pass.hour * HOUR;
    const parking = getFacility('mall-parking');
    txs.push({ id: `seed-pass-${id}`, type: 'pass', at: startedAt, title: 'SunD Pass', rm: -plan.price, kwh: PASS_KWH, method: seed.pass.method });
    seed.pass.parkDaysAgo.forEach((d, i) => {
      txs.push({ id: `seed-park-${id}-${i}`, type: 'redeem', at: dayStart - d * DAY + 8.8 * HOUR, title: parking.item, place: parking.name, facilityId: parking.id, viaPass: true });
    });
    pass = {
      planId: plan.id,
      price: plan.price,
      startedAt,
      renewsAt: startedAt + PASS_DAYS * DAY,
      commitUntil: plan.months > 1 ? startedAt + plan.months * PASS_DAYS * DAY : undefined,
      autoRenew: true,
      kwhLeft: PASS_KWH - passKwhUsed,
      rides: (seed.rides ?? []).filter((r) => r.pay === 'pass').length,
      parks: seed.pass.parkDaysAgo.length,
    };
  }
  seed.coolDaysAgo?.forEach((d, i) => {
    txs.push({ id: `seed-cool-${id}-${i}`, type: 'checkin', at: dayStart - d * DAY + 13.5 * HOUR, title: 'SunD Cool check-in', place: 'Elmina Community Hall' });
  });
  if (seed.topup) {
    txs.push({ id: `seed-topup-${id}`, type: 'topup', at: dayStart - seed.topup.daysAgo * DAY + 20 * HOUR, title: 'Saver Credits top-up', saver: seed.topup.get, rm: -seed.topup.pay, method: 'FPX online banking' });
  }
  txs.sort((a, b) => b.at - a.at);

  const profile: Profile = {
    sc: p.reward === 'none' ? 0 : Math.max(sc, p.reward === 'slice' ? 6 : 18),
    saver,
    pass,
    cashShare,
    todayKwh,
    todayCredits: today.credits,
    todayRebateRm: today.rebateRm,
    monthKwh,
    monthCredits: month.credits,
    monthRebateRm: month.rebateRm,
    lifetimeGenKwh: seed.priorGen + monthKwh,
    solarKwhCharged: seed.charged,
    kmOnSolar: seed.charged * KM_PER_KWH,
    co2Kg: seed.charged * CO2_KG_PER_KWH,
    greenCharges: seed.greenCharges,
    surplusCharges: seed.surplusCharges,
    streak: seed.streak,
    lastGreenDay: dayKey(now - DAY),
    evSoc: EV.startSoc,
    txs,
    vouchers: [],
    achievements: [],
    lang: p.lang,
    largeText: !!p.largeText,
    sliceOn: p.reward === 'slice',
    nudgeKwh: seed.nudgeKwh ?? 0,
    nudgesDone: [],
    balconyWaitlist: false,
    coolCheckins: (seed.coolDaysAgo ?? []).map((d) => dayKey(dayStart - d * DAY + 13 * HOUR)),
  };
  return awardAchievements(profile).profile;
}

export function seedBays(now: number): Record<string, BayLive> {
  const h = hourOf(now);
  const hk = hourKeyOf(dayKey(now), h);
  const out: Record<string, BayLive> = {};
  for (const b of BAYS) {
    const busy = occupancy(b, h, hk);
    // Keep at least one port free at opening so the first demo charge always works.
    const first = b.connectors[b.connectors.length - 1];
    busy[first.id] = Math.min(busy[first.id], first.count - 1);
    out[b.id] = { soc: b.initialSoc, busy, hourKey: hk };
  }
  return out;
}

export function seedNotices(now: number): Notice[] {
  const d = new Date(now);
  const lastMonth = monthName(new Date(d.getFullYear(), d.getMonth() - 1, 1).getTime());
  return [
    { id: 'n-seed-1', icon: 'gift', title: `${lastMonth} statement ready`, body: '702 km on rooftop solar', to: '/wallet/statement', at: now - 2 * HOUR, read: false },
    { id: 'n-seed-2', icon: 'leaf', title: 'Green SunD Bay: Central Park', body: 'Solar stock 86% · 2× bonus', to: '/map/bay/central-park', at: now - 3 * HOUR, read: false },
    { id: 'n-seed-4', icon: 'sun', title: 'Solar peak tomorrow 11am–3pm', body: 'Run the washer or pre-cool then', at: now - 14 * HOUR, read: true },
    { id: 'n-seed-3', icon: 'bolt', title: 'Charging complete', body: '14.2 kWh · paid with credits', at: now - 16 * HOUR, read: true },
  ];
}
