import { dayKey, hashRand, hourOf } from '../sim/solar';
import type { Profile, Tx } from '../store/types';

export interface Facility {
  id: string;
  kind: 'ebike' | 'clubhouse';
  name: string;
  item: string;
  cost: number; // SC
  /** eBikes can also be paid with Saver Credits, so the public can ride. */
  saverRm?: number;
  icon: 'dumbbell' | 'waves' | 'users' | 'trophy' | 'flower' | 'bike';
  x: number;
  y: number;
  note: string;
  docks?: number;
}

const ebike = (id: string, area: string, x: number, y: number, docks: number): Facility => ({
  id: `ebike-${id}`,
  kind: 'ebike',
  name: `SunD eBike · ${area}`,
  item: 'eBike ride · 30 min',
  cost: 2,
  saverRm: 2,
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
  { id: 'gym', kind: 'clubhouse', name: 'Elmina Clubhouse Gym', item: 'Gym day pass', cost: 8, icon: 'dumbbell', x: 64, y: 196, note: 'Clubhouse rooftop solar' },
  { id: 'pool', kind: 'clubhouse', name: 'Clubhouse Pool', item: 'Pool + sauna', cost: 5, icon: 'waves', x: 84, y: 232, note: 'Solar water heating' },
  { id: 'court', kind: 'clubhouse', name: 'Badminton Hall', item: 'Court · 1 hour', cost: 6, icon: 'trophy', x: 52, y: 228, note: 'Solar lighting' },
  { id: 'hall', kind: 'clubhouse', name: 'Clubhouse Function Room', item: 'Function room · 2 h', cost: 25, icon: 'users', x: 96, y: 200, note: 'Solar-cooled' },
  { id: 'yoga', kind: 'clubhouse', name: 'Central Park Pavilion', item: 'Sunrise yoga', cost: 3, icon: 'flower', x: 128, y: 104, note: 'Sat · 7 am' },
];

export const EBIKES = FACILITIES.filter((f) => f.kind === 'ebike');
export const CLUBHOUSE = FACILITIES.filter((f) => f.kind === 'clubhouse');

export const getFacility = (id: string) => FACILITIES.find((f) => f.id === id) ?? FACILITIES[0];

export const isEbikeTx = (t: Tx) => t.type === 'redeem' && !!t.facilityId?.startsWith('ebike');

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
  { id: 'facility', title: 'Green living', desc: 'Clubhouse visit on credits', test: (p) => p.txs.some((t) => t.type === 'redeem' && !isEbikeTx(t)) },
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
  { id: 'saver', title: 'Saver +50%', body: 'Pay RM 20 → get RM 30', tag: 'Everyone', to: '/wallet/saver', resident: false },
];

export const LEADERBOARD = [
  { name: 'Farid R.', km: 642 },
  { name: 'Mei Ling T.', km: 588 },
  { name: 'Priya K.', km: 455 },
  { name: 'Daniel W.', km: 391 },
];
