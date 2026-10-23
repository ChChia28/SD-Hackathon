// Guards every figure the app shares with the SunD deck and appendix, so a later edit can't quietly break the story.
import { describe, expect, it } from 'vitest';
import { BAYS } from '../src/data/bays';
import * as C from '../src/data/constants';
import { PERSONAS } from '../src/data/personas';
import { SOURCES } from '../src/data/sources';
import { DICT } from '../src/lib/dict';
import { BAY_SIZES, DEFAULT_WHATIF, bayEconomics } from '../src/lib/economics';
import { sliceValueRm, splitReward } from '../src/lib/pricing';

const near = (a: number, b: number, tol: number) => expect(Math.abs(a - b)).toBeLessThanOrEqual(tol);

describe('deck facts (slides 2–10)', () => {
  it('Elmina Ridge 1: 228 homes, 1 MWp, 36,600 homes planned', () => {
    expect(C.TOWNSHIP.homes).toBe(228);
    expect(C.TOWNSHIP.mwp).toBe(1);
    expect(C.TOWNSHIP.homesPlanned).toBe(36_600);
  });
  it('grid factor 0.74 kg CO₂/kWh (EC 2024)', () => expect(C.CO2_KG_PER_KWH).toBe(0.74));
  it('1 kW slice ≈ 110 kWh/month; yield 3.6 kWh/kWp/day', () => {
    expect(C.SLICE_KWH_PER_MONTH).toBe(110);
    expect(C.YIELD_KWH_PER_KWP_DAY).toBe(3.6);
  });
  it('slice is worth RM 40–57 a month at 35–52 sen (A4)', () => {
    expect(Math.round(sliceValueRm(C.TARIFF.aisyah))).toBe(40);
    expect(Math.round(sliceValueRm(C.TARIFF.high))).toBe(57);
    near(sliceValueRm(C.TARIFF.low), 38.5, 0.01);
  });
  it('TNB base 27.03 + 4.55 + 12.85 = 44.43 sen', () => near(C.TARIFF.base, 0.2703 + 0.0455 + 0.1285, 1e-9));
  it('public price RM 1.40 (A9) and market DC RM 1.30–1.80', () => {
    expect(C.PUBLIC_PRICE).toBe(1.4);
    expect(C.MARKET_DC).toEqual({ low: 1.3, high: 1.8 });
    expect(C.PUBLIC_SURPLUS_PRICE).toBeLessThan(C.MARKET_DC.low);
  });
  it('Saver Credits: pay RM 20, get RM 30', () => expect(C.SAVER_PACKS[0]).toEqual({ pay: 20, get: 30 }));
  it('solar peak 11am–3pm; Level 1 heat ≥35 °C; walk shade −3.1 °C', () => {
    expect(C.PEAK).toEqual({ from: 11, to: 15 });
    expect(C.HEAT_LEVEL1_C).toBe(35);
    expect(C.WALK_DELTA_C).toBe(3.1);
  });
  it('SunD Balcony: 800 W, ~560 kWh/yr ≈ 47 kWh/month, RM 16–24 (A7, A4)', () => {
    expect(C.BALCONY.watts).toBe(800);
    expect(C.BALCONY.kwhYear).toBe(560);
    expect(Math.round(C.BALCONY.kwhYear / 12)).toBe(C.BALCONY.kwhMonth);
    expect(Math.floor(C.BALCONY.kwhMonth * 0.35)).toBe(C.BALCONY.rmLow);
    expect(Math.round(C.BALCONY.kwhMonth * 0.52)).toBe(C.BALCONY.rmHigh);
  });
  it('e.MAS 5 ~7 km/kWh real-world (A4)', () => expect(C.KM_PER_KWH).toBe(7));
});

describe('personas (slide 3)', () => {
  it('Mr Lim’s roof is the Elmina Ridge 1 average: 1 MWp ÷ 228 ≈ 4.4 kWp', () => near(PERSONAS.landed.kWp, 1000 / 228, 0.05));
  it('Aisyah: condo renter on a 1 kW slice at ~36 sen, ~450 kWh a month', () => {
    expect(PERSONAS.condo.reward).toBe('slice');
    expect(PERSONAS.condo.tariff).toBe(0.36);
    expect(PERSONAS.condo.monthlyUseKwh).toBe(450);
  });
  it('Uncle Tan: sponsored slice, no EV, 中文 + large text', () => {
    expect(PERSONAS.elder.sponsored).toBe(true);
    expect(PERSONAS.elder.drivesEv).toBe(false);
    expect(PERSONAS.elder.lang).toBe('zh');
  });
  it('Daniel earns nothing and pays per kWh', () => expect(splitReward(100, 'public', 0).income).toBe(0));
  it('slice credits are issued at the resident’s own tariff', () => near(splitReward(110, 'condo', 1).rebateRm, 39.6, 1e-9));
  it('roof host: RM 0.25/kWh, +20% as credits, ≤50% to the bill', () => {
    const r = splitReward(100, 'landed', 0.5);
    near(r.income, 25, 1e-9);
    near(r.rebateRm, 12.5, 1e-9);
    near(r.credits, 15, 1e-9);
  });
});

describe('appendix A2 bay sizes', () => {
  it('solar per day 90 / 270 / 900 kWh at 2.5 kWp per lot', () => {
    for (const [k, kwh] of [['small', 90], ['medium', 270], ['large', 900]] as const) {
      expect(BAY_SIZES[k].kWp).toBe(BAY_SIZES[k].lots * 2.5);
      near(BAY_SIZES[k].kWp * C.YIELD_KWH_PER_KWP_DAY, kwh, 0.5);
    }
  });
  it('CO₂ avoided ≈ 24 / 73 / 243 t a year', () => {
    const t = (k: keyof typeof BAY_SIZES) => (BAY_SIZES[k].kWp * 3.6 * 365 * 0.74) / 1000;
    expect(Math.round(t('small'))).toBe(24);
    expect(Math.round(t('medium'))).toBe(73);
    expect(Math.round(t('large'))).toBe(243);
  });
  it('the app’s pilot bay is the A2 small bay; the mall bay is the medium bay', () => {
    const pilot = BAYS.find((b) => b.phase === 'pilot')!;
    expect([pilot.lots, pilot.canopyKwp, pilot.batteryKwh]).toEqual([10, 25, 60]);
    expect(pilot.connectors.map((c) => c.count).sort()).toEqual([2, 8]);
    const mall = BAYS.find((b) => b.phase === 'phase3')!;
    expect([mall.lots, mall.canopyKwp, mall.batteryKwh]).toEqual([30, 75, 180]);
  });
});

describe('appendix A3 unit economics (medium mall bay)', () => {
  const table = [
    { s: 1.5, day: 451, year: 165, pb: [6.2, 8.9] },
    { s: 2.0, day: 593, year: 216, pb: [4.7, 6.8] },
    { s: 2.5, day: 737, year: 269, pb: [3.8, 5.5] },
  ];
  for (const row of table)
    it(`${row.s} sessions/lot/day → RM ${row.day}/day, RM ${row.year}k/yr, payback ${row.pb[0]}–${row.pb[1]} yrs`, () => {
      const e = bayEconomics({ ...DEFAULT_WHATIF, sessionsPerLot: row.s });
      near(e.netDay, row.day, 1.5);
      // Within RM 1k: the appendix rounds the 2.0-session row down (RM 216.8k is printed as 216k).
      near(e.netYear / 1000, row.year, 1);
      expect(e.payback!.map((p) => Math.round(p * 10) / 10)).toEqual(row.pb);
    });
});

describe('sources and translations', () => {
  it('every source has an https link', () => {
    for (const s of SOURCES) expect(s.url).toMatch(/^https:\/\//);
    expect(new Set(SOURCES.map((s) => s.id)).size).toBe(SOURCES.length);
  });
  it('translations keep every {placeholder}', () => {
    for (const [en, row] of Object.entries(DICT)) {
      const ph = (en.match(/\{\w+\}/g) ?? []).sort();
      expect((row.ms.match(/\{\w+\}/g) ?? []).sort(), `ms: ${en}`).toEqual(ph);
      expect((row.zh.match(/\{\w+\}/g) ?? []).sort(), `zh: ${en}`).toEqual(ph);
    }
  });
});
