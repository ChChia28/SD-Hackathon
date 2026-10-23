import { useEffect, useMemo, useRef, type MouseEvent } from 'react';
import { BAYS, type Bay } from '../data/bays';
import { KM_PER_UNIT } from '../data/constants';
import { PERSONAS, type Persona } from '../data/personas';
import { discountPct, rateFor, saverEligible } from '../lib/pricing';
import { bayStatus, baySolarPct, baySource, freePorts, totalPorts } from '../sim/bays';
import { hourOf } from '../sim/solar';
import type { BayLive, BayStatus, PersonaId, Profile, Weather } from './types';
import { useStore } from './useStore';

export const useProfile = (): Profile => useStore((s) => s.profiles[s.persona]);
export const usePersona = (): Persona => PERSONAS[useStore((s) => s.persona)];

export interface BayView {
  bay: Bay;
  live: BayLive;
  status: BayStatus;
  solarPct: number;
  source: string;
  distanceKm: number;
  rate: number;
  discount: number;
  saverOk: boolean;
  free: number;
  total: number;
}

export function bayView(bay: Bay, live: BayLive, hour: number, weather: Weather, persona: PersonaId): BayView {
  const status = bayStatus(bay, live);
  const home = PERSONAS[persona].home;
  const rate = rateFor(persona, status);
  return {
    bay,
    live,
    status,
    solarPct: baySolarPct(bay, live, hour, weather),
    source: baySource(bay, live, hour, weather),
    distanceKm: Math.hypot(bay.x - home.x, bay.y - home.y) * KM_PER_UNIT,
    rate,
    discount: discountPct(rate),
    saverOk: saverEligible(live),
    free: freePorts(bay, live),
    total: totalPorts(bay),
  };
}

/** All bays with live status, nearest first. */
export function useBayViews(): BayView[] {
  const bays = useStore((s) => s.bays);
  const simTime = useStore((s) => s.simTime);
  const weather = useStore((s) => s.weather);
  const persona = useStore((s) => s.persona);
  return useMemo(() => {
    const h = hourOf(simTime);
    return BAYS.map((b) => bayView(b, bays[b.id], h, weather, persona)).sort((a, b) => a.distanceKm - b.distanceKm);
  }, [bays, simTime, weather, persona]);
}

export function useBayView(id: string | undefined): BayView | undefined {
  return useBayViews().find((v) => v.bay.id === id);
}

/** Drives the township simulation while the app is open. */
export function useSimulation(intervalMs = 500) {
  const tick = useStore((s) => s.tick);
  useEffect(() => {
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      // Cap the slice so a backgrounded tab doesn't jump hours on return.
      tick(Math.min(now - last, 2000));
      last = now;
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [tick, intervalMs]);
}

/** Long-press handlers for hidden presenter controls. */
export function useLongPress(onLongPress: () => void, ms = 600) {
  const timer = useRef<number | undefined>(undefined);
  const start = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(onLongPress, ms);
  };
  const cancel = () => window.clearTimeout(timer.current);
  return { onPointerDown: start, onPointerUp: cancel, onPointerLeave: cancel, onPointerCancel: cancel, onContextMenu: (e: MouseEvent) => e.preventDefault() };
}
