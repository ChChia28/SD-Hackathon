import { EBIKE_RIDE_RM, MALL_PARKING_RM } from './constants';
import { dayKey, hashRand, hourOf } from '../sim/solar';
import type { Profile, Tx } from '../store/types';

export type FacilityKind = 'ebike' | 'clubhouse' | 'parking' | 'shop';

export interface Facility {
  id: string;
  kind: FacilityKind;
  name: string;
  item: string;
  /** Price in SunD Credits. Absent where credits aren't accepted (mall parking and shops are not solar facilities). */
  cost?: number;
  /** Price in Saver Credits, RM. Saver Credits work anywhere in SunD. */
  saverRm?: number;
  icon: 'dumbbell' | 'waves' | 'users' | 'trophy' | 'flower' | 'bike' | 'parking' | 'utensils' | 'coffee' | 'basket';
  x: number;
  y: number;
  note: string;
  docks?: number;
}

/** Clubhouse: SunD Credits first, Saver Credits also accepted (1 SC = RM 1). Residents only. */
const club = (f: Omit<Facility, 'kind' | 'saverRm'> & { cost: number }): Facility => ({ ...f, kind: 'clubhouse', saverRm: f.cost });

/** Elmina Central Mall, home of the Phase 3 mall bay: parking and shops take Saver Credits. */
const MALL = { x: 196, y: 176 };

const ebike = (id: string, area: string, x: number, y: number, docks: number): Facility => ({
  id: `ebike-${id}`,
  kind: 'ebike',
  name: `SunD eBike · ${area}`,
  item: 'eBike ride · 30 min',
  cost: EBIKE_RIDE_RM,
  saverRm: EBIKE_RIDE_RM,
  icon: 'bike',
  x,
  y,
  note: 'Solar-charged dock',
  docks,
});

export const FACILITIES: Facility[] = [
  ebike('park', 'Central Park', 152, 118, 10),
  ebike('central', 'Elmina Central', 224, 192, 12),
  ebike('innovation', 'Innovation Park', 266, 150, 10),
  ebike('lakeside', 'Lakeside', 262, 286, 8),
  ebike('west', 'Elmina West', 92, 300, 8),
  club({ id: 'gym', name: 'Elmina Clubhouse Gym', item: 'Gym day pass', cost: 8, icon: 'dumbbell', x: 64, y: 196, note: 'Clubhouse rooftop solar' }),
  club({ id: 'pool', name: 'Clubhouse Pool', item: 'Pool + sauna', cost: 5, icon: 'waves', x: 84, y: 232, note: 'Solar water heating' }),
  club({ id: 'court', name: 'Badminton Hall', item: 'Court · 1 hour', cost: 6, icon: 'trophy', x: 52, y: 228, note: 'Solar lighting' }),
  club({ id: 'hall', name: 'Clubhouse Function Room', item: 'Function room · 2 h', cost: 25, icon: 'users', x: 96, y: 200, note: 'Solar-cooled' }),
  club({ id: 'yoga', name: 'Central Park Pavilion', item: 'Sunrise yoga', cost: 3, icon: 'flower', x: 128, y: 104, note: 'Sat · 7 am' }),
  { id: 'mall-parking', kind: 'parking', name: 'Elmina Central Mall', item: 'Mall parking · 1 entry', saverRm: MALL_PARKING_RM, icon: 'parking', ...MALL, note: 'Free with SunD Pass' },
  { id: 'shop-foodcourt', kind: 'shop', name: 'Elmina Central Mall', item: 'Food court voucher', saverRm: 10, icon: 'utensils', ...MALL, note: 'Any stall' },
  { id: 'shop-cafe', kind: 'shop', name: 'Elmina Central Mall', item: 'Café voucher', saverRm: 15, icon: 'coffee', ...MALL, note: 'Ground floor' },
  { id: 'shop-grocer', kind: 'shop', name: 'Elmina Central Mall', item: 'Grocery voucher', saverRm: 30, icon: 'basket', ...MALL, note: 'Lower ground' },
];

export const EBIKES = FACILITIES.filter((f) => f.kind === 'ebike');
export const CLUBHOUSE = FACILITIES.filter((f) => f.kind === 'clubhouse');
export const MALL_SPOTS = FACILITIES.filter((f) => f.kind === 'parking' || f.kind === 'shop');

export const getFacility = (id: string) => FACILITIES.find((f) => f.id === id) ?? FACILITIES[0];

/** The SunD eBike dock nearest a point on the township map (the person's home or workplace). */
export const nearestEbike = (at: { x: number; y: number }) =>
  EBIKES.reduce((best, f) => (Math.hypot(f.x - at.x, f.y - at.y) < Math.hypot(best.x - at.x, best.y - at.y) ? f : best));

/** What kind of place a redeem transaction was spent at. */
export const txFacilityKind = (t: Tx): FacilityKind | undefined => (t.type === 'redeem' ? FACILITIES.find((f) => f.id === t.facilityId)?.kind : undefined);
export const isEbikeTx = (t: Tx) => txFacilityKind(t) === 'ebike';
export const isClubTx = (t: Tx) => txFacilityKind(t) === 'clubhouse';
export const isMallTx = (t: Tx) => txFacilityKind(t) === 'parking' || txFacilityKind(t) === 'shop';
/** Anything the SunD Pass paid for: the pass itself, charging from its kWh, rides and parking. */
export const isPassTx = (t: Tx) => t.type === 'pass' || !!t.viaPass || !!t.passKwh;

/** Bikes docked right now: stable within the hour. */
export function bikesAvailable(f: Facility, simTime: number): number {
  const docks = f.docks ?? 0;
  const r = hashRand(`${f.id}-${dayKey(simTime)}-${Math.floor(hourOf(simTime))}`);
  return Math.max(1, Math.round(docks * (0.25 + 0.65 * r)));
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  test: (p: Profile) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-solar', title: 'First solar charge', desc: '1 charge at a SunD Bay', test: (p) => p.greenCharges >= 1 },
  { id: 'km100', title: '100 km on sunshine', desc: '100 km on solar', test: (p) => p.kmOnSolar >= 100 },
  { id: 'streak7', title: 'Green week', desc: '7-day solar streak', test: (p) => p.streak >= 7 },
  { id: 'surplus3', title: 'Surplus hunter', desc: '3 surplus charges', test: (p) => p.surplusCharges >= 3 },
  { id: 'pedal3', title: 'Pedal power', desc: '3 eBike rides', test: (p) => p.txs.filter(isEbikeTx).length >= 3 },
  { id: 'mwh', title: '1 MWh club', desc: '1,000 kWh generated', test: (p) => p.lifetimeGenKwh >= 1000 },
  { id: 'saver', title: 'Early supporter', desc: 'First Saver top-up', test: (p) => p.txs.some((t) => t.type === 'topup') },
  { id: 'facility', title: 'Green living', desc: 'Clubhouse visit on credits', test: (p) => p.txs.some(isClubTx) },
];

export const getAchievement = (id: string) => ACHIEVEMENTS.find((a) => a.id === id);

/** Returns the profile with any newly earned achievements added, and their ids. */
export function awardAchievements(p: Profile): { profile: Profile; unlocked: string[] } {
  const unlocked = ACHIEVEMENTS.filter((a) => !p.achievements.includes(a.id) && a.test(p)).map((a) => a.id);
  if (!unlocked.length) return { profile: p, unlocked };
  return { profile: { ...p, achievements: [...p.achievements, ...unlocked] }, unlocked };
}

export const LEVELS = [
  { name: 'Seedling', min: 0 },
  { name: 'Sprout', min: 40 },
  { name: 'Sunseeker', min: 120 },
  { name: 'Solar Champion', min: 300 },
  { name: 'Township Hero', min: 700 },
];

/** Level is based on solar kWh charged. */
export function levelFor(kwh: number) {
  let i = 0;
  while (i < LEVELS.length - 1 && kwh >= LEVELS[i + 1].min) i++;
  const cur = LEVELS[i];
  const next = LEVELS[i + 1];
  const progress = next ? (kwh - cur.min) / (next.min - cur.min) : 1;
  return { index: i + 1, name: cur.name, next, progress, toNext: next ? next.min - kwh : 0 };
}

export const OFFERS = [
  { id: 'noon', title: 'Solar noon 2×', body: '11 am–3 pm · green bays', tag: 'Bonus', to: '/map', resident: true },
  { id: 'ebike', title: 'Ride while you charge', body: 'eBike dock at every SunD Bay', tag: 'eBike', to: '/map?tab=ebike', resident: false },
  { id: 'park', title: 'Weekend park +5%', body: 'Central Park · Sat & Sun', tag: 'Weekend', to: '/map', resident: true },
  { id: 'pass', title: 'SunD Pass', body: '100 kWh + unlimited eBike & mall parking', tag: 'Monthly', to: '/wallet/pass', resident: false },
  { id: 'saver', title: 'Saver up to +30%', body: 'RM 100 → 115 · RM 200 → 240 · RM 500 → 650', tag: 'Everyone', to: '/wallet/saver', resident: false },
];

export const LEADERBOARD = [
  { name: 'Farid R.', km: 642 },
  { name: 'Mei Ling T.', km: 588 },
  { name: 'Priya K.', km: 455 },
  { name: 'Daniel W.', km: 391 },
];
