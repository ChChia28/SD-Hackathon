// Guards every figure the app shares with the SunD deck and appendix, so a later edit can't quietly break the story.
import { describe, expect, it } from 'vitest';
import { BAYS } from '../src/data/bays';
import * as C from '../src/data/constants';
import { PERSONAS } from '../src/data/personas';
import { SOURCES } from '../src/data/sources';
import { DICT } from '../src/lib/dict';
import { BAY_SIZES, DEFAULT_WHATIF, bayEconomics } from '../src/lib/economics';
import { FACILITIES, getFacility } from '../src/data/rewards';
import { estimatePayment, facilityPayment, passMonthValue, passPlansFor, SAVER_MAX_PCT, SAVER_MIN_PCT, saverBonusPct, sliceValueRm, splitReward, TOP_UP, withTopUp } from '../src/lib/pricing';
import { seedProfile } from '../src/store/seed';
import type { Pass } from '../src/store/types';

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
  it('slice is worth ≈ RM 40 a month at a flat 36 sen (A11)', () => {
    expect(Math.round(sliceValueRm(C.TARIFF.aisyah))).toBe(40);
    expect(Math.round(sliceValueRm(C.TARIFF.high))).toBe(40);
    near(sliceValueRm(C.TARIFF.low), 39.6, 0.01);
  });
  it('TNB base 27.03 + 4.55 + 12.85 = 44.43 sen', () => near(C.TARIFF.base, 0.2703 + 0.0455 + 0.1285, 1e-9));
  it('public price RM 1.40 (A14) and market DC RM 0.88–1.80 (EV Sifu)', () => {
    expect(C.PUBLIC_PRICE).toBe(1.4);
    expect(C.MARKET_DC).toEqual({ low: 0.88, high: 1.8 });
    expect(C.PUBLIC_SURPLUS_PRICE).toBeLessThan(C.PUBLIC_PRICE);
  });
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
  it('Aisyah: condo renter, ~490 kWh a month, bill ≈ RM 162, slice → RM 122.40', () => {
    expect(PERSONAS.condo.reward).toBe('slice');
    expect(PERSONAS.condo.monthlyUseKwh).toBe(490);
    near((PERSONAS.condo.monthlyUseKwh ?? 0) * (PERSONAS.condo.tariff ?? 0), 162, 0.05);
    near((PERSONAS.condo.monthlyUseKwh ?? 0) * (PERSONAS.condo.tariff ?? 0) - sliceValueRm(0), 122.4, 0.05);
  });
  it('Uncle Tan: sponsored slice, no EV, 中文 + large text', () => {
    expect(PERSONAS.elder.sponsored).toBe(true);
    expect(PERSONAS.elder.drivesEv).toBe(false);
    expect(PERSONAS.elder.lang).toBe('zh');
  });
  it('Daniel earns nothing and pays per kWh', () => expect(splitReward(100, 'public', 0).income).toBe(0));
  it('slice credits are issued at the resident’s own tariff', () => near(splitReward(110, 'condo', 1).rebateRm, 39.6, 1e-9));
  it('roof host: RM 0.10/kWh, +20% as credits, ≤50% to the bill', () => {
    const r = splitReward(100, 'landed', 0.5);
    near(r.income, 10, 1e-9);
    near(r.rebateRm, 5, 1e-9);
    near(r.credits, 6, 1e-9);
  });
});

describe('SunD Pass and Saver Credits (team update, 10 Nov 2026)', () => {
  it('Saver top-up (Sheet + deck): RM 50 → 55 … RM 500 → 650; the more you top up, the bigger the bonus (+10% to +30%)', () => {
    expect(C.SAVER_PACKS).toEqual([
      { pay: 50, get: 55 },
      { pay: 100, get: 115 },
      { pay: 200, get: 240 },
      { pay: 300, get: 375 },
      { pay: 500, get: 650 },
    ]);
    expect(C.SAVER_PACKS.map(saverBonusPct)).toEqual([10, 15, 20, 25, 30]);
    for (let i = 1; i < C.SAVER_PACKS.length; i++) {
      expect(C.SAVER_PACKS[i].pay).toBeGreaterThan(C.SAVER_PACKS[i - 1].pay);
      expect(saverBonusPct(C.SAVER_PACKS[i])).toBeGreaterThan(saverBonusPct(C.SAVER_PACKS[i - 1]));
    }
    expect([SAVER_MIN_PCT, SAVER_MAX_PCT]).toEqual([10, 30]);
  });
  it('deck slide 5: a RM 500 top-up makes public charging RM 1.40 ÷ 1.30 ≈ RM 1.08 a kWh', () => {
    expect(withTopUp(C.PUBLIC_PRICE).toFixed(2)).toBe('1.08');
    expect(TOP_UP.pay).toBe(500);
  });
  it('a typical Pass month is worth RM 180 (public) / RM 130 (residents)', () => {
    expect(passMonthValue('public')).toBe(180);
    expect(passMonthValue('resident')).toBe(130);
  });
  it('the Pass stays the better deal for regulars: every plan beats the top Saver bonus in a typical month', () => {
    for (const p of C.PASS_PLANS) expect((passMonthValue(p.who) / p.price - 1) * 100, p.id).toBeGreaterThan(SAVER_MAX_PCT);
    // Public +40% vs Saver +30%: keep at least a 5-point gap so the Pass reads as clearly better.
    const pub = C.PASS_PLANS.find((p) => p.who === 'public')!;
    expect(Math.round((passMonthValue('public') / pub.price - 1) * 100) - SAVER_MAX_PCT).toBeGreaterThanOrEqual(5);
  });
  it('SunD Pass: 100 kWh; residents RM 79 (12-month) or RM 89, public RM 129', () => {
    expect(C.PASS_KWH).toBe(100);
    expect(passPlansFor('condo').map((p) => p.price)).toEqual([79, 89]);
    expect(passPlansFor('landed').map((p) => p.price)).toEqual([79, 89]);
    expect(passPlansFor('public').map((p) => p.price)).toEqual([129]);
  });
  it('100 kWh is worth RM 90 to a resident and RM 140 to the public; every plan costs less than its charging alone', () => {
    near(C.PASS_KWH * C.RESIDENT_PRICE, 90, 1e-9);
    near(C.PASS_KWH * C.PUBLIC_PRICE, 140, 1e-9);
    for (const p of C.PASS_PLANS) expect(p.price).toBeLessThan(C.PASS_KWH * (p.who === 'resident' ? C.RESIDENT_PRICE : C.PUBLIC_PRICE));
  });
  it('a charge is paid Pass kWh → SunD Credits → Saver → card', () => {
    const pay = estimatePayment(30, { sc: 9, saver: 5, passKwh: 10 }, 1, true);
    expect(pay).toEqual({ pass: 10, sc: 9, saver: 5, rm: 6 });
    // The public skips credits; Saver works at any bay.
    expect(estimatePayment(10, { sc: 50, saver: 7, passKwh: 0 }, 1.4, false)).toEqual({ pass: 0, sc: 0, saver: 7, rm: 14 - 7 });
  });
  it('Saver pays anywhere; the Pass covers eBikes and mall parking; SunD Credits stay on solar facilities', () => {
    const pass: Pass = { planId: 'public-1', price: 129, startedAt: 0, renewsAt: 1, autoRenew: true, kwhLeft: 100, rides: 0, parks: 0 };
    const daniel = { sc: 0, saver: 60, pass: null };
    for (const kind of ['ebike', 'parking', 'shop'] as const) expect(facilityPayment(FACILITIES.find((f) => f.kind === kind)!, 'public', daniel).via).toBe('saver');
    expect(facilityPayment(getFacility('gym'), 'public', daniel).via).toBe('locked');
    expect(facilityPayment(getFacility('gym'), 'condo', { sc: 0, saver: 60, pass: null }).via).toBe('saver');
    expect(facilityPayment(getFacility('mall-parking'), 'public', { ...daniel, pass }).via).toBe('pass');
    expect(facilityPayment(getFacility('ebike-park'), 'condo', { sc: 50, saver: 0, pass }).via).toBe('pass');
    expect(facilityPayment(getFacility('shop-cafe'), 'condo', { sc: 500, saver: 0, pass })).toEqual({ via: 'saver', price: 15, enough: false });
    expect(getFacility('mall-parking').saverRm).toBe(C.MALL_PARKING_RM);
  });
});

describe('Farah, the SunD Pass member demo', () => {
  const farah = seedProfile('member', new Date(2026, 10, 12, 10, 30).getTime(), 'sunny');
  const pass = farah.pass!;
  it('is a public driver on the RM 129 plan, with an active Pass', () => {
    expect(PERSONAS.member.reward).toBe('none');
    expect(passPlansFor('member').map((p) => p.price)).toEqual([129]);
    expect([pass.planId, pass.price, pass.autoRenew]).toEqual(['public-1', 129, true]);
    expect(pass.renewsAt - pass.startedAt).toBe(C.PASS_DAYS * 86_400_000);
  });
  it('day 14: 66 of 100 kWh used, 6 eBike rides, 10 parking entries, all covered by the Pass', () => {
    expect(pass.kwhLeft).toBe(34);
    expect(farah.txs.reduce((a, t) => a + (t.passKwh ?? 0), 0)).toBe(C.PASS_KWH - pass.kwhLeft);
    expect([pass.rides, pass.parks]).toEqual([6, 10]);
    expect(farah.txs.filter((t) => t.viaPass)).toHaveLength(pass.rides + pass.parks);
    expect(farah.txs.filter((t) => t.type === 'charge').every((t) => !t.rm && !t.saver && !t.sc)).toBe(true);
    expect(farah.txs.filter((t) => t.type === 'pass').map((t) => t.rm)).toEqual([-129]);
  });
  it('value used so far: 66 × RM 1.40 + 6 × RM 2 + 10 × RM 3 = RM 134.40, more than the RM 129 she paid', () => {
    const value = (C.PASS_KWH - pass.kwhLeft) * C.PUBLIC_PRICE + pass.rides * C.EBIKE_RIDE_RM + pass.parks * C.MALL_PARKING_RM;
    near(value, 134.4, 1e-9);
    expect(value).toBeGreaterThan(pass.price);
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
