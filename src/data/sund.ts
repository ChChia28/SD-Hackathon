import { HEAT_LEVEL1_C, KWP_PER_M2, WALK_DELTA_C, YIELD_KWH_PER_KWP_DAY } from './constants';
import { hashRand, dayKey, hourOf } from '../sim/solar';

/** Places the walks and cool rooms connect to (stylised map, not to scale). */
export const PLACES = {
  transit: { x: 314, y: 318, name: 'LRT / transit stop' },
  school: { x: 44, y: 330, name: 'SK Elmina (school)' },
  hall: { x: 180, y: 320, name: 'Elmina Community Hall' },
};

export interface Walk {
  id: string;
  name: string;
  from: string;
  to: string;
  lengthM: number;
  /** Rank by Landsat land-surface temperature along the route (deck slide 9: the hottest route is built first). */
  rank: number;
  status: 'next' | 'planned';
  /** SVG path on the township map. */
  d: string;
  /** Roof width carrying panels — ASSUMPTION: one row of panels along the walkway roof. */
  panelWidthM: number;
}

export const WALKS: Walk[] = [
  {
    id: 'walk-a',
    name: 'SunD Walk A',
    from: 'Residensi Elmina',
    to: 'LRT / transit stop',
    lengthM: 650,
    rank: 1,
    status: 'next',
    d: 'M268 300 C 284 296, 296 304, 312 316',
    panelWidthM: 1.2,
  },
  {
    id: 'walk-b',
    name: 'SunD Walk B',
    from: 'Flat Elmina Jaya',
    to: 'Community Hall · SunD Cool',
    lengthM: 400,
    rank: 2,
    status: 'planned',
    d: 'M178 334 C 174 330, 176 326, 180 322',
    panelWidthM: 1.2,
  },
  {
    id: 'walk-c',
    name: 'SunD Walk C',
    from: 'Elmina West',
    to: 'SK Elmina (school)',
    lengthM: 900,
    rank: 3,
    status: 'planned',
    d: 'M120 300 C 96 310, 70 318, 48 328',
    panelWidthM: 1.2,
  },
];

export const walkRoofKwp = (w: Walk) => w.lengthM * w.panelWidthM * KWP_PER_M2;
export const walkKwhPerDay = (w: Walk) => walkRoofKwp(w) * YIELD_KWH_PER_KWP_DAY;
/** Walking time at an easy 3.5 km/h. */
export const walkMinutes = (m: number) => Math.round((m / 3500) * 60);

/** Simulated feels-like temperature on the open road (°C), peaking mid-afternoon. Heat-alert days run hotter. */
export function feelsLikeC(t: number, heat: boolean): number {
  const h = hourOf(t);
  const bump = Math.exp(-((h - 14.5) ** 2) / (2 * 3.2 * 3.2));
  const base = 27 + 10 * bump + (heat ? 4 : 0);
  return Math.round(base * 10) / 10;
}
export const underWalkC = (t: number, heat: boolean) => Math.round((feelsLikeC(t, heat) - WALK_DELTA_C) * 10) / 10;

export interface CoolRoom {
  id: string;
  name: string;
  area: string;
  x: number;
  y: number;
  capacity: number;
  opens: number;
  closes: number;
  primary: boolean;
}

export const COOL_ROOMS: CoolRoom[] = [
  { id: 'hall', name: 'Elmina Community Hall', area: 'Elmina Central', x: PLACES.hall.x, y: PLACES.hall.y, capacity: 60, opens: 11, closes: 18, primary: true },
  { id: 'clubhouse-room', name: 'Clubhouse Function Room', area: 'Elmina West', x: 96, y: 200, capacity: 30, opens: 12, closes: 17, primary: false },
];

export const isCoolOpen = (r: CoolRoom, t: number, heat: boolean) => heat && hourOf(t) >= r.opens && hourOf(t) < r.closes;

/** People inside a cool room right now (simulated; stable within the hour). */
export function coolOccupancy(r: CoolRoom, t: number, heat: boolean): number {
  if (!isCoolOpen(r, t, heat)) return 0;
  const h = hourOf(t);
  const bump = Math.exp(-((h - 15) ** 2) / (2 * 2.2 * 2.2));
  const jitter = hashRand(`${r.id}-${dayKey(t)}-${Math.floor(h)}`);
  return Math.round(r.capacity * (0.15 + 0.55 * bump + 0.1 * jitter));
}

/** Total visits so far today across cool rooms (simulated pilot KPI 4), plus check-ins made in the app. */
export function coolVisitsToday(t: number, heat: boolean, appCheckins: number): number {
  if (!heat) return appCheckins;
  const h = hourOf(t);
  let n = 0;
  for (const r of COOL_ROOMS) {
    for (let x = r.opens; x < Math.min(h, r.closes); x++) n += Math.round(r.capacity * 0.22 * (0.6 + 0.6 * hashRand(`${r.id}-v-${dayKey(t)}-${x}`)));
  }
  return n + appCheckins;
}

export const heatLabel = (tempC: number) => (tempC >= 40 ? 'Level 3 · emergency' : tempC >= 37 ? 'Level 2 · heatwave' : tempC >= HEAT_LEVEL1_C ? 'Level 1 · alert' : 'Watch');
