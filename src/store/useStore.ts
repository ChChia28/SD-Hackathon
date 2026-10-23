import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { BAYS, getBay } from '../data/bays';
import { CHARGE_TIMELAPSE, CO2_KG_PER_KWH, EV, HEAT_LEVEL1_C, KM_PER_KWH, PEAK, SAVER_PACKS } from '../data/constants';
import { PERSONAS, PERSONA_IDS } from '../data/personas';
import { awardAchievements, getAchievement, getFacility } from '../data/rewards';
import { fmt, uid } from '../lib/format';
import { bonusRateFor, maxBillShare, rateFor, saverEligible, splitReward, usesCredits } from '../lib/pricing';
import { NUDGES } from '../data/nudges';
import { translate } from '../lib/translate';
import { bayStatus, baySolarPct, freePorts, hourKeyOf, occupancy, stepBay } from '../sim/bays';
import { dayKey, hourOf, solarKw } from '../sim/solar';
import { seedBays, seedNotices, seedProfile, startTime } from './seed';
import type { BayLive, Lang, Notice, PersonaId, Profile, Session, Toast, Tx, Weather } from './types';

const STEP_MS = 15 * 60_000;
const DAY = 86_400_000;
const NOTICE_CAP = 30;
const EVENT_TOAST_GAP_MS = 12_000;

interface Data {
  onboarded: boolean;
  persona: PersonaId;
  profiles: Record<PersonaId, Profile>;
  simTime: number;
  speed: number; // sim seconds per real second (0 = paused)
  weather: Weather;
  bays: Record<string, BayLive>;
  session: Session | null;
  notices: Notice[];
  surplusAlerts: boolean;
  /** MetMalaysia-style heat alert, triggered from the presenter controls. */
  heat: { on: boolean; tempC: number; day: number };
  /** Guided pitch mode: which step of the deck-ordered demo is showing. */
  pitch: { on: boolean; step: number };
  /** Wallets opened during the demo (onboarding) — adds to the simulated pilot count. */
  demoWallets: number;
}

interface Ui {
  toasts: Toast[];
  demoOpen: boolean;
  confettiKey: number;
  lastEventToast: number;
}

interface Actions {
  tick: (realDtMs: number) => void;
  completeOnboarding: (persona: PersonaId) => void;
  replayOnboarding: () => void;
  setPersona: (persona: PersonaId) => void;
  setSpeed: (speed: number) => void;
  setWeather: (weather: Weather) => void;
  jumpTo: (hour: number) => void;
  triggerSurplus: (bayId?: string) => string;
  resetDemo: () => void;
  startSession: (bayId: string, connectorId: string, targetKwh: number) => boolean;
  stopSession: () => void;
  clearSession: () => void;
  buySaver: (packIndex: number, method: string) => string;
  redeem: (facilityId: string) => string | null;
  toast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
  markNoticesRead: () => void;
  setSurplusAlerts: (on: boolean) => void;
  setCashShare: (share: number) => void;
  setDemoOpen: (open: boolean) => void;
  celebrate: () => void;
  setLang: (lang: Lang) => void;
  setLargeText: (on: boolean) => void;
  setSlice: (on: boolean) => void;
  acceptNudge: (id: string) => void;
  joinBalcony: () => void;
  coolCheckin: () => string;
  setHeat: (on: boolean) => void;
  setPitch: (p: { on: boolean; step: number }) => void;
  patch: (p: Partial<Data>) => void;
}

export type State = Data & Ui & Actions;

function initialData(): Data {
  const simTime = startTime();
  const weather: Weather = 'sunny';
  return {
    onboarded: false,
    persona: 'condo',
    profiles: {
      landed: seedProfile('landed', simTime, weather),
      condo: seedProfile('condo', simTime, weather),
      public: seedProfile('public', simTime, weather),
      elder: seedProfile('elder', simTime, weather),
    },
    simTime,
    speed: 60,
    weather,
    bays: seedBays(simTime),
    session: null,
    notices: seedNotices(simTime),
    surplusAlerts: true,
    heat: { on: false, tempC: 36, day: 3 },
    pitch: { on: false, step: 0 },
    demoWallets: 0,
  };
}

/** Adds toasts to the on-screen queue and the notification list. */
function withToasts(s: State, toasts: Omit<Toast, 'id'>[], at = s.simTime): Partial<State> {
  if (!toasts.length) return {};
  const made = toasts.map((t) => ({ ...t, id: uid('t') }));
  return {
    toasts: [...s.toasts, ...made].slice(-3),
    notices: [...made.map((t) => ({ ...t, at, read: false })), ...s.notices].slice(0, NOTICE_CAP),
  };
}

const badgeToasts = (ids: string[]): Omit<Toast, 'id'>[] =>
  ids.map((id) => ({ icon: 'star', to: '/rewards/achievements', title: `Badge unlocked: ${getAchievement(id)?.title}`, body: getAchievement(id)?.desc }));

/** Records the finished day's credits and resets daily (and, on a new month, monthly) counters. */
function closeDay(p: Profile, endOfDay: number, next: number): Profile {
  const txs: Tx[] =
    p.todayKwh > 0.005
      ? [{ id: uid('tx'), type: 'earn', at: endOfDay, title: 'SunD Credits earned', sc: p.todayCredits, rebateRm: p.todayRebateRm || undefined, kwh: p.todayKwh }, ...p.txs]
      : p.txs;
  const newMonth = new Date(next).getMonth() !== new Date(endOfDay).getMonth();
  return { ...p, txs, todayKwh: 0, todayCredits: 0, todayRebateRm: 0, ...(newMonth ? { monthKwh: 0, monthCredits: 0, monthRebateRm: 0 } : {}) };
}

/** Runs the township forward from s.simTime to t1: generation, credits, bay batteries, events. */
function advance(s: State, t1: number): Partial<State> {
  let t = s.simTime;
  const profiles = { ...s.profiles };
  const bays = { ...s.bays };
  const before = Object.fromEntries(BAYS.map((b) => [b.id, bayStatus(b, s.bays[b.id])]));
  const genBefore = profiles[s.persona].todayKwh;

  while (t < t1) {
    const tn = Math.min(t1, t + STEP_MS);
    const dtH = (tn - t) / 3_600_000;
    const h = hourOf(t + (tn - t) / 2);

    for (const id of PERSONA_IDS) {
      const p = PERSONAS[id];
      const kwh = p.kWp ? solarKw(p.kWp, h, s.weather) * dtH : 0;
      if (kwh <= 0) continue;
      const pr = profiles[id];
      if (p.reward === 'slice' && !pr.sliceOn) continue;
      const { credits: cr, rebateRm } = splitReward(kwh, id, pr.cashShare);
      profiles[id] = {
        ...pr,
        sc: pr.sc + cr,
        todayKwh: pr.todayKwh + kwh,
        todayCredits: pr.todayCredits + cr,
        todayRebateRm: pr.todayRebateRm + rebateRm,
        monthKwh: pr.monthKwh + kwh,
        monthCredits: pr.monthCredits + cr,
        monthRebateRm: pr.monthRebateRm + rebateRm,
        lifetimeGenKwh: pr.lifetimeGenKwh + kwh,
      };
    }

    const hn = hourOf(tn);
    const hk = hourKeyOf(dayKey(tn), hn);
    for (const b of BAYS) {
      let live = stepBay(b, bays[b.id], h, dtH, s.weather);
      if (live.hourKey !== hk) live = { ...live, busy: occupancy(b, hn, hk), hourKey: hk };
      bays[b.id] = live;
    }

    if (dayKey(tn) !== dayKey(t)) {
      for (const id of PERSONA_IDS) profiles[id] = { ...closeDay(profiles[id], t, tn), nudgesDone: [] };
    }
    t = tn;
  }
  const crossedPeak = hourOf(s.simTime) < PEAK.from && hourOf(t1) >= PEAK.from && t1 - s.simTime < DAY;

  const events: Omit<Toast, 'id'>[] = [];
  const now = Date.now();
  let lastEventToast = s.lastEventToast;
  if (s.surplusAlerts && now - s.lastEventToast > EVENT_TOAST_GAP_MS) {
    for (const b of BAYS) {
      const after = bayStatus(b, bays[b.id]);
      if (after === before[b.id]) continue;
      if (after === 'surplus') {
        const rate = rateFor(s.persona, 'surplus');
        events.push({
          icon: 'leaf',
          to: `/map/bay/${b.id}`,
          title: `Green SunD Bay: ${b.name}`,
          body: usesCredits(s.persona) ? `Solar stock ${Math.round(bays[b.id].soc)}% · 2× bonus` : `Solar stock ${Math.round(bays[b.id].soc)}% · RM ${rate.toFixed(2)}/kWh`,
        });
        lastEventToast = now;
        break;
      }
      if (after === 'grid') {
        events.push({ icon: 'moon', to: `/map/bay/${b.id}`, title: `Grid backup: ${b.name}`, body: 'Battery low · grid until sunrise' });
        lastEventToast = now;
        break;
      }
    }
  }

  if (crossedPeak) {
    const n = NUDGES.find((x) => x.for.includes(s.persona));
    if (n) events.push({ icon: 'sun', to: '/', title: 'Solar peak now · 11am–3pm', body: n.title });
  }

  const persona = PERSONAS[s.persona];
  const genAfter = profiles[s.persona].todayKwh;
  const step = persona.kWp >= 5 ? 10 : 2;
  if (persona.kWp && genAfter > genBefore && Math.floor(genAfter / step) > Math.floor(genBefore / step)) {
    events.push({
      icon: 'sun',
      to: '/home/solar',
      title: `${Math.floor(genAfter / step) * step} kWh made today`,
      body: profiles[s.persona].todayRebateRm > 0 ? `+${fmt(profiles[s.persona].todayCredits)} SC · RM ${profiles[s.persona].todayRebateRm.toFixed(2)} bill rebate` : `+${fmt(profiles[s.persona].todayCredits)} SC so far`,
    });
  }

  return { simTime: t1, profiles, bays, lastEventToast, ...withToasts({ ...s, simTime: t1 }, events) };
}

/** Wraps up the charging session: receipt transaction, bonus credits, streak, achievements. */
function finalize(s: State): Partial<State> {
  const ses = s.session;
  if (!ses || ses.status !== 'charging') return {};
  const bay = getBay(ses.bayId);
  const prof = s.profiles[s.persona];
  const bonus = ses.useCredits ? Math.round(ses.solarKwh * ses.rate * ses.bonusRate * 100) / 100 : 0;
  const solarPct = ses.delivered > 0 ? Math.round((ses.solarKwh / ses.delivered) * 100) : 0;
  const green = ses.delivered > 0.05 && solarPct >= 50;
  const today = dayKey(s.simTime);
  const streak = !green || prof.lastGreenDay === today ? prof.streak : prof.lastGreenDay === dayKey(s.simTime - DAY) ? prof.streak + 1 : 1;

  const tx: Tx = {
    id: uid('tx'),
    type: 'charge',
    at: s.simTime,
    title: 'Charging',
    place: bay.name,
    sc: -ses.scUsed,
    bonusSc: bonus,
    saver: -ses.saverUsed,
    rm: -ses.rm,
    kwh: ses.delivered,
    solarPct,
    bayId: bay.id,
    km: ses.delivered * KM_PER_KWH,
    co2: ses.solarKwh * CO2_KG_PER_KWH,
    durationMin: Math.max(1, Math.round((ses.elapsedSec * CHARGE_TIMELAPSE) / 60)),
  };

  const next: Profile = {
    ...prof,
    sc: prof.sc + bonus,
    solarKwhCharged: prof.solarKwhCharged + ses.solarKwh,
    kmOnSolar: prof.kmOnSolar + ses.solarKwh * KM_PER_KWH,
    co2Kg: prof.co2Kg + ses.solarKwh * CO2_KG_PER_KWH,
    greenCharges: prof.greenCharges + (green ? 1 : 0),
    surplusCharges: prof.surplusCharges + (green && ses.surplus ? 1 : 0),
    streak,
    lastGreenDay: green ? today : prof.lastGreenDay,
    txs: [tx, ...prof.txs],
  };
  const { profile, unlocked } = awardAchievements(next);
  tx.unlocked = unlocked;

  const toasts: Omit<Toast, 'id'>[] = [
    { icon: 'bolt', to: `/charge/receipt/${tx.id}`, title: 'Charging complete', body: `${fmt(ses.delivered)} kWh · +${Math.round(ses.delivered * KM_PER_KWH)} km · ${bay.name}` },
    ...badgeToasts(unlocked),
  ];

  return {
    profiles: { ...s.profiles, [s.persona]: profile },
    session: { ...ses, status: 'done', txId: tx.id },
    ...withToasts(s, toasts),
  };
}

/** Delivers energy for one real-time slice and pays for it: credits, then Saver Credits, then card. */
function chargeStep(s: State, realDt: number): Partial<State> {
  const ses = s.session!;
  const prof = s.profiles[s.persona];
  const taper = prof.evSoc > 80 ? 0.35 : 1;
  const room = Math.max(0, ((100 - prof.evSoc) / 100) * EV.batteryKwh);
  const dk = Math.max(0, Math.min((ses.kw * taper * (realDt / 1000) * CHARGE_TIMELAPSE) / 3600, ses.targetKwh - ses.delivered, room));

  let rem = dk;
  let sc = prof.sc;
  let saver = prof.saver;
  let scUsed = 0;
  let saverUsed = 0;
  // 1 SC = RM 1, so credits pay the bay's RM rate per kWh.
  if (ses.useCredits && sc > 0) {
    scUsed = Math.min(rem * ses.rate, sc);
    sc -= scUsed;
    rem -= scUsed / ses.rate;
  }
  if (rem > 0 && ses.saverOk && saver > 0) {
    saverUsed = Math.min(rem * ses.rate, saver);
    saver -= saverUsed;
    rem -= saverUsed / ses.rate;
  }
  const rmPaid = rem > 1e-9 ? rem * ses.rate : 0;

  const session: Session = {
    ...ses,
    delivered: ses.delivered + dk,
    solarKwh: ses.solarKwh + (dk * ses.solarPct) / 100,
    scUsed: ses.scUsed + scUsed,
    saverUsed: ses.saverUsed + saverUsed,
    rm: ses.rm + rmPaid,
    elapsedSec: ses.elapsedSec + realDt / 1000,
  };
  const profiles = { ...s.profiles, [s.persona]: { ...prof, sc, saver, evSoc: Math.min(100, prof.evSoc + (dk / EV.batteryKwh) * 100) } };
  const next = { ...s, session, profiles };
  const done = session.delivered >= session.targetKwh - 1e-6 || room - dk <= 1e-6;
  return done ? { session, profiles, ...finalize(next) } : { session, profiles };
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...initialData(),
      toasts: [],
      demoOpen: false,
      confettiKey: 0,
      lastEventToast: 0,

      tick: (realDt) =>
        set((s) => {
          const patch = s.speed > 0 ? advance(s, s.simTime + realDt * s.speed) : {};
          const merged = { ...s, ...patch } as State;
          if (merged.session?.status === 'charging') return { ...patch, ...chargeStep(merged, realDt) };
          return patch;
        }),

      completeOnboarding: (persona) => set((s) => ({ onboarded: true, persona, demoWallets: s.demoWallets + 1 })),
      replayOnboarding: () => set({ onboarded: false, demoOpen: false }),

      setPersona: (persona) =>
        set((s) => {
          if (persona === s.persona) return {};
          const done = s.session?.status === 'charging' ? finalize(s) : {};
          return { ...done, session: null, persona };
        }),

      setSpeed: (speed) => set({ speed }),
      setWeather: (weather) => set({ weather }),

      jumpTo: (hour) =>
        set((s) => {
          const d = new Date(s.simTime);
          d.setHours(Math.floor(hour), Math.round((hour % 1) * 60), 0, 0);
          let target = d.getTime();
          if (target <= s.simTime) target += DAY;
          return advance({ ...s, lastEventToast: 0 }, target);
        }),

      triggerSurplus: (bayId) => {
        const s = get();
        const home = PERSONAS[s.persona].home;
        const dist = (x: number, y: number) => Math.hypot(x - home.x, y - home.y);
        const candidates = BAYS.filter((b) => bayStatus(b, s.bays[b.id]) !== 'surplus').sort((a, b) => dist(a.x, a.y) - dist(b.x, b.y));
        const bay = (bayId && BAYS.find((b) => b.id === bayId)) || candidates[0] || BAYS[0];
        const busy = { ...s.bays[bay.id].busy };
        for (const c of bay.connectors) busy[c.id] = Math.min(busy[c.id] ?? 0, Math.max(0, c.count - 2));
        const rate = rateFor(s.persona, 'surplus');
        set({
          bays: { ...s.bays, [bay.id]: { ...s.bays[bay.id], soc: 93, busy } },
          lastEventToast: Date.now(),
          ...withToasts(s, [
            {
              icon: 'leaf',
              to: `/map/bay/${bay.id}`,
              title: `Green SunD Bay: ${bay.name}`,
              body: usesCredits(s.persona) ? 'Solar stock 93% · 2× bonus' : `Solar stock 93% · RM ${rate.toFixed(2)}/kWh`,
            },
          ]),
        });
        return bay.id;
      },

      resetDemo: () => set({ ...initialData(), onboarded: true, persona: get().persona, pitch: get().pitch, toasts: [], lastEventToast: 0 }),

      startSession: (bayId, connectorId, targetKwh) => {
        const s = get();
        const bay = getBay(bayId);
        const live = s.bays[bayId];
        const conn = bay.connectors.find((c) => c.id === connectorId);
        if (!conn || freePorts(bay, live) === 0 || (live.busy[conn.id] ?? 0) >= conn.count) return false;
        const status = bayStatus(bay, live);
        const solarPct = baySolarPct(bay, live, hourOf(s.simTime), s.weather);
        set({
          session: {
            bayId,
            connectorId,
            kw: conn.kw,
            targetKwh,
            delivered: 0,
            solarKwh: 0,
            solarPct,
            scUsed: 0,
            saverUsed: 0,
            rm: 0,
            rate: rateFor(s.persona, status),
            useCredits: usesCredits(s.persona),
            saverOk: saverEligible(live),
            surplus: status === 'surplus',
            bonusRate: bonusRateFor(s.persona, status, solarPct),
            startSoc: s.profiles[s.persona].evSoc,
            elapsedSec: 0,
            status: 'charging',
          },
          // The car now occupies a port.
          bays: { ...s.bays, [bayId]: { ...live, busy: { ...live.busy, [conn.id]: (live.busy[conn.id] ?? 0) + 1 } } },
        });
        return true;
      },

      stopSession: () => set((s) => finalize(s)),
      clearSession: () => set({ session: null }),

      buySaver: (packIndex, method) => {
        const s = get();
        const pack = SAVER_PACKS[packIndex];
        const prof = s.profiles[s.persona];
        const tx: Tx = { id: uid('tx'), type: 'topup', at: s.simTime, title: 'Saver Credits top-up', saver: pack.get, rm: -pack.pay, method };
        const { profile, unlocked } = awardAchievements({ ...prof, saver: prof.saver + pack.get, txs: [tx, ...prof.txs] });
        tx.unlocked = unlocked;
        set({ profiles: { ...s.profiles, [s.persona]: profile }, ...withToasts(s, badgeToasts(unlocked)) });
        return tx.id;
      },

      redeem: (facilityId) => {
        const s = get();
        const f = getFacility(facilityId);
        const prof = s.profiles[s.persona];
        // Credits first; eBikes also take Saver Credits, so the public can ride.
        const withSc = usesCredits(s.persona) && prof.sc >= f.cost;
        const withSaver = !withSc && f.saverRm !== undefined && prof.saver >= f.saverRm;
        if (!withSc && !withSaver) return null;
        const prefix = f.kind === 'ebike' ? 'BIKE' : 'CLUB';
        const voucher = { id: uid('v'), facilityId, code: `${prefix}-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`, at: s.simTime };
        const tx: Tx = { id: uid('tx'), type: 'redeem', at: s.simTime, title: f.item, place: f.name, facilityId, ...(withSc ? { sc: -f.cost } : { saver: -(f.saverRm ?? 0) }) };
        const paid = withSc ? { sc: prof.sc - f.cost } : { saver: prof.saver - (f.saverRm ?? 0) };
        const { profile, unlocked } = awardAchievements({ ...prof, ...paid, txs: [tx, ...prof.txs], vouchers: [voucher, ...prof.vouchers] });
        tx.unlocked = unlocked;
        set({ profiles: { ...s.profiles, [s.persona]: profile }, ...withToasts(s, badgeToasts(unlocked)) });
        return voucher.id;
      },

      toast: (t) => set((s) => withToasts(s, [t])),
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      markNoticesRead: () => set((s) => ({ notices: s.notices.map((n) => ({ ...n, read: true })) })),
      setSurplusAlerts: (on) => set({ surplusAlerts: on }),
      // Only landed owners can take a bill rebate; it never exceeds the policy cap.
      setCashShare: (share) =>
        set((s) => {
          if (!PERSONAS[s.persona].canRebate) return {};
          const cashShare = Math.round(Math.min(maxBillShare(s.persona), Math.max(0, share)) * 100) / 100;
          return { profiles: { ...s.profiles, [s.persona]: { ...s.profiles[s.persona], cashShare } } };
        }),
      setDemoOpen: (open) => set({ demoOpen: open }),
      celebrate: () => set((s) => ({ confettiKey: s.confettiKey + 1 })),

      setLang: (lang) => set((s) => ({ profiles: { ...s.profiles, [s.persona]: { ...s.profiles[s.persona], lang } } })),
      setLargeText: (on) => set((s) => ({ profiles: { ...s.profiles, [s.persona]: { ...s.profiles[s.persona], largeText: on } } })),
      setSlice: (on) => set((s) => ({ profiles: { ...s.profiles, [s.persona]: { ...s.profiles[s.persona], sliceOn: on } } })),

      acceptNudge: (id) =>
        set((s) => {
          const n = NUDGES.find((x) => x.id === id);
          const prof = s.profiles[s.persona];
          if (!n || prof.nudgesDone.includes(id)) return {};
          return {
            profiles: { ...s.profiles, [s.persona]: { ...prof, nudgeKwh: prof.nudgeKwh + n.kwh, nudgesDone: [...prof.nudgesDone, id] } },
            ...withToasts(s, [{ icon: 'sun', title: `${n.kwh} kWh moved into solar hours`, body: 'Counted in the SDP pilot dashboard' }]),
          };
        }),

      joinBalcony: () =>
        set((s) => ({
          profiles: { ...s.profiles, [s.persona]: { ...s.profiles[s.persona], balconyWaitlist: true } },
          ...withToasts(s, [{ icon: 'gift', title: 'You’re on the SunD Balcony waitlist', body: 'For the 2027 sandbox pilot' }]),
        })),

      coolCheckin: () => {
        const s = get();
        const prof = s.profiles[s.persona];
        const today = dayKey(s.simTime);
        const tx: Tx = { id: uid('tx'), type: 'checkin', at: s.simTime, title: 'SunD Cool check-in', place: 'Elmina Community Hall' };
        if (prof.coolCheckins.includes(today)) return prof.txs.find((t) => t.type === 'checkin')?.id ?? tx.id;
        set({
          profiles: { ...s.profiles, [s.persona]: { ...prof, coolCheckins: [...prof.coolCheckins, today], txs: [tx, ...prof.txs] } },
          ...withToasts(s, [{ icon: 'snow', title: translate(prof.lang, 'Checked in · SunD Cool'), body: translate(prof.lang, 'Elmina Community Hall · stay as long as you like') }]),
        });
        return tx.id;
      },

      setHeat: (on) =>
        set((s) => ({
          heat: { ...s.heat, on },
          weather: on ? 'sunny' : s.weather,
          ...(on
            ? withToasts(s, [
                {
                  icon: 'heat',
                  to: '/cool',
                  title: translate(s.profiles[s.persona].lang, 'Heat alert · {temp} °C', { temp: s.heat.tempC }),
                  body: translate(s.profiles[s.persona].lang, 'Level 1 · day {d} at ≥{c} °C · SunD Cool is open', { d: s.heat.day, c: HEAT_LEVEL1_C }),
                },
              ])
            : {}),
        })),

      setPitch: (pitch) => set({ pitch }),
      patch: (p) => set(p),
    }),
    {
      name: 'sund-wallet-demo-v3',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        onboarded: s.onboarded,
        persona: s.persona,
        profiles: s.profiles,
        simTime: s.simTime,
        speed: s.speed,
        weather: s.weather,
        bays: s.bays,
        session: s.session,
        notices: s.notices,
        surplusAlerts: s.surplusAlerts,
        heat: s.heat,
        pitch: s.pitch,
        demoWallets: s.demoWallets,
      }),
    },
  ),
);
