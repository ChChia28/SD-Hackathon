import type { Bay } from '../data/bays';
import { GRID_BACKUP_SOC, SURPLUS_SOC } from '../data/constants';
import type { BayLive, BayStatus, BayType, Weather } from '../store/types';
import { hashRand, solarKw } from './solar';

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** How busy a location type is at a given hour, relative to its base demand. */
export function demandFactor(type: BayType, h: number): number {
  const bump = (c: number, w: number) => Math.exp(-((h - c) ** 2) / (2 * w * w));
  switch (type) {
    case 'mall':
      return 0.15 + 1.6 * bump(14, 3.2) + 0.9 * bump(20, 1.5);
    case 'office':
      return 0.1 + 1.9 * bump(12, 2.8);
    case 'park':
      return 0.2 + 1.2 * bump(8, 1.3) + 1.4 * bump(18.5, 1.6);
    case 'clubhouse':
      return 0.2 + 1.0 * bump(10, 2) + 1.3 * bump(19.5, 2);
    case 'commercial':
      return 0.2 + 1.3 * bump(13, 3.5);
    case 'condo':
      return 0.35 + 1.6 * bump(21, 2.5) + 0.8 * bump(1, 2);
    case 'petrol':
      return 0.6 + 0.6 * bump(8, 2) + 0.6 * bump(18, 2);
  }
}

export const hourKeyOf = (day: string, h: number) => `${day}-${Math.floor(h)}`;

/** Ports in use for the current hour — stable within the hour so the UI doesn't flicker. */
export function occupancy(bay: Bay, h: number, hourKey: string): Record<string, number> {
  const f = demandFactor(bay.type, Math.floor(h) + 0.5) / 2;
  const busy: Record<string, number> = {};
  for (const c of bay.connectors) {
    const r = hashRand(`${bay.id}-${c.id}-${hourKey}`);
    const util = clamp(f + (r - 0.5) * 0.6, 0, 1);
    busy[c.id] = Math.min(c.count, Math.round(util * c.count));
  }
  return busy;
}

/** Advance one bay's battery by dtHours. */
export function stepBay(bay: Bay, live: BayLive, h: number, dtHours: number, weather: Weather): BayLive {
  const canopy = solarKw(bay.canopyKwp, h, weather);
  const demand = bay.baseDemandKw * demandFactor(bay.type, h);
  const net = canopy - demand;
  // Below the backup threshold the grid takes the load and the battery stops draining.
  if (net < 0 && live.soc <= GRID_BACKUP_SOC - 4) return live;
  const soc = clamp(live.soc + ((net * dtHours) / bay.batteryKwh) * 100, 0, 100);
  return { ...live, soc };
}

export const freePorts = (bay: Bay, live: BayLive) =>
  bay.connectors.reduce((n, c) => n + (c.count - (live.busy[c.id] ?? 0)), 0);

export const totalPorts = (bay: Bay) => bay.connectors.reduce((n, c) => n + c.count, 0);

export function bayStatus(bay: Bay, live: BayLive): BayStatus {
  if (freePorts(bay, live) === 0) return 'busy';
  if (live.soc < GRID_BACKUP_SOC) return 'grid';
  if (live.soc >= SURPLUS_SOC) return 'surplus';
  return 'normal';
}

/** Share of the energy a car gets right now that is solar (canopy or stored). */
export function baySolarPct(bay: Bay, live: BayLive, h: number, weather: Weather): number {
  const canopy = solarKw(bay.canopyKwp, h, weather);
  const demand = Math.max(0.1, bay.baseDemandKw * demandFactor(bay.type, h));
  if (live.soc >= GRID_BACKUP_SOC) return canopy >= demand ? 100 : Math.round(clamp(88 + canopy / demand * 10, 88, 98));
  return Math.round(clamp((canopy / demand) * 100, 4, 60));
}

/** Where the energy is coming from right now, for labels. */
export function baySource(bay: Bay, live: BayLive, h: number, weather: Weather): string {
  const canopy = solarKw(bay.canopyKwp, h, weather);
  if (live.soc < GRID_BACKUP_SOC) return canopy > 0.5 ? 'Canopy solar + grid backup' : 'Grid backup';
  if (canopy > bay.baseDemandKw * demandFactor(bay.type, h)) return 'Live canopy solar';
  return canopy > 0.5 ? 'Canopy solar + stored solar' : 'Stored solar (battery)';
}
