import { BAYS, type Bay } from '../data/bays';
import { CO2_KG_PER_KWH, SLICE_KWH_PER_MONTH } from '../data/constants';
import { PERSONAS } from '../data/personas';
import { coolVisitsToday } from '../data/sund';
import { demandFactor, occupancy, hourKeyOf, totalPorts } from './bays';
import { dayKey, energyBetween, hashRand } from './solar';
import type { Profile, PersonaId, Weather } from '../store/types';

export const PILOT_BAY: Bay = BAYS.find((b) => b.phase === 'pilot')!;

/** Daily demand at a bay, kWh. */
export function bayDemandDay(bay: Bay): number {
  let e = 0;
  for (let h = 0; h < 24; h += 0.25) e += bay.baseDemandKw * demandFactor(bay.type, h + 0.125) * 0.25;
  return e;
}

/** Share of a bay's kWh that comes from its own canopy + battery over a day (KPI 2). 5% battery round-trip loss. */
export function baySolarShareDay(bay: Bay, weather: Weather): number {
  const solar = energyBetween(bay.canopyKwp, 0, 24, weather) * 0.95;
  const demand = bayDemandDay(bay);
  return Math.min(1, solar / demand);
}

/** Lot-hours occupied ÷ available, 8am–10pm (KPI 3). */
export function bayUtilisation(bay: Bay, t: number): number {
  const day = dayKey(t);
  let used = 0;
  let avail = 0;
  for (let h = 8; h < 22; h++) {
    const busy = occupancy(bay, h + 0.5, hourKeyOf(day, h));
    used += Object.values(busy).reduce((a, b) => a + b, 0);
    avail += totalPorts(bay);
  }
  return used / avail;
}

/** Simulated pilot cohort for KPI 7 (wallets opened, share roofless). */
export const PILOT_COHORT = { wallets: 312, roofless: 0.54, elderlyB40AtCool: 0.41 };

export interface KpiInput {
  simTime: number;
  weather: Weather;
  heat: boolean;
  profiles: Record<PersonaId, Profile>;
  demoWallets: number;
}

export type KpiStatus = 'met' | 'track' | 'waiting';
export interface Kpi {
  n: number;
  name: string;
  value: string;
  unit?: string;
  baseline: string;
  target: string;
  status: KpiStatus;
  note: string;
}

export function computeKpis(k: KpiInput): Kpi[] {
  const dom = new Date(k.simTime).getDate();
  const aisyah = k.profiles.condo;
  const projected = ((aisyah.monthRebateRm + aisyah.monthCredits) / Math.max(1, dom)) * 30;
  const sliceValue = SLICE_KWH_PER_MONTH * 0.36; // flat slice credit rate (A11)
  const rmSaved = Math.max(projected, 0);
  const share = baySolarShareDay(PILOT_BAY, k.weather);
  const util = bayUtilisation(PILOT_BAY, k.simTime);
  const today = dayKey(k.simTime);
  const appCheckins = (Object.values(k.profiles) as Profile[]).filter((p) => p.coolCheckins.includes(today)).length;
  const visits = coolVisitsToday(k.simTime, k.heat, appCheckins);
  const solarDay = Math.min(energyBetween(PILOT_BAY.canopyKwp, 0, 24, k.weather) * 0.95, bayDemandDay(PILOT_BAY));
  const co2Month = (solarDay * dom * CO2_KG_PER_KWH) / 1000;
  const wallets = PILOT_COHORT.wallets + k.demoWallets;
  const walkers = Math.round(140 + 60 * hashRand(`walkers-${today}`));

  return [
    { n: 1, name: 'RM saved per subscriber', value: `RM ${Math.round(rmSaved)}`, unit: '/ month', baseline: 'RM 0', target: '≈ RM 40', status: rmSaved >= 0.95 * 40 ? 'met' : 'track', note: `1 kW slice × 36 sen flat ≈ RM ${sliceValue.toFixed(0)} (A11)` },
    { n: 2, name: 'Bay kWh from on-site solar', value: `${Math.round(share * 100)}%`, baseline: '≈0% (grid 92% fossil)', target: '25–35%', status: share >= 0.25 ? 'met' : 'track', note: `Pilot bay · ${PILOT_BAY.canopyKwp} kWp canopy · today’s weather` },
    { n: 3, name: 'Bay utilisation', value: `${Math.round(util * 100)}%`, baseline: 'measured from week 1', target: '≥ 40%', status: util >= 0.4 ? 'met' : 'track', note: 'Lot-hours used ÷ available, 8am–10pm' },
    { n: 4, name: 'SunD Cool visits per heat-alert day', value: k.heat ? `${visits}` : '—', baseline: '0', target: 'measured', status: k.heat ? 'met' : 'waiting', note: k.heat ? `${Math.round(PILOT_COHORT.elderlyB40AtCool * 100)}% aged 65+ or B40 · so far today` : 'No heat alert today' },
    { n: 5, name: 'SunD Walk °C delta · walkers/day', value: '—', baseline: 'route measured 4 weeks pre-build', target: '≥ 3 °C cooler', status: 'waiting', note: `Walk A built in Phase 3 · baseline ~${walkers} walkers/day` },
    { n: 6, name: 'Tonnes CO₂ avoided', value: co2Month.toFixed(1), unit: 't this month', baseline: '0', target: '~2 t / month', status: (co2Month / dom) * 30 >= 1.8 ? 'met' : 'track', note: `≈ ${((co2Month / dom) * 30).toFixed(1)} t projected for the month · × 0.74 kg/kWh` },
    { n: 7, name: 'Wallets opened · share roofless', value: `${wallets}`, unit: `· ${Math.round(PILOT_COHORT.roofless * 100)}% roofless`, baseline: '0', target: '≥ 50% roofless', status: PILOT_COHORT.roofless >= 0.5 ? 'met' : 'track', note: 'One precinct · simulated cohort' },
  ];
}
