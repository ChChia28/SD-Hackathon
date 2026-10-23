import type { Weather } from '../store/types';

export const WEATHER_FACTOR: Record<Weather, number> = { sunny: 1, cloudy: 0.45, rainy: 0.18 };

const SUNRISE = 7.1;
const SUNSET = 19.3;
/** Real-world derating so a 10 kWp roof makes ~37 kWh on an average day. */
const PERFORMANCE = 0.62;

/** Output as a fraction of kWp at a given hour of day. */
export function solarFraction(hour: number, weather: Weather): number {
  if (hour <= SUNRISE || hour >= SUNSET) return 0;
  const x = (hour - SUNRISE) / (SUNSET - SUNRISE);
  return Math.pow(Math.sin(Math.PI * x), 1.3) * PERFORMANCE * WEATHER_FACTOR[weather];
}

export const solarKw = (kWp: number, hour: number, weather: Weather) => kWp * solarFraction(hour, weather);

/** kWh generated between two hours of the same day. */
export function energyBetween(kWp: number, h0: number, h1: number, weather: Weather, steps = 96): number {
  if (h1 <= h0) return 0;
  const dh = (h1 - h0) / steps;
  let e = 0;
  for (let i = 0; i < steps; i++) e += solarKw(kWp, h0 + (i + 0.5) * dh, weather) * dh;
  return e;
}

export const isDaylight = (hour: number) => hour > SUNRISE && hour < SUNSET;

export function hourOf(t: number): number {
  const d = new Date(t);
  return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
}

export function dayKey(t: number): string {
  const d = new Date(t);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/** Deterministic pseudo-random number in [0, 1) from a string. */
export function hashRand(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

/** A past day's total generation — varies with that day's (pseudo) weather. */
export const pastDailyKwh = (kWp: number, t: number) => kWp * (3.0 + 1.45 * hashRand(`gen-${dayKey(t)}`));
