import { ChevronLeft, ChevronRight, House, Presentation, X } from 'lucide-react';
import { Fragment, useCallback, useEffect, useRef, useState, type TouchEvent } from 'react';
import { useLocation, useNavigate, type NavigateFunction } from 'react-router-dom';
import { SAVER_PACKS } from '../data/constants';
import { cx } from '../lib/format';
import type { PersonaId } from '../store/types';
import { useStore, type State } from '../store/useStore';

interface Ctx {
  s: () => State;
  nav: NavigateFunction;
}

/** A short label pointed at one part of the app: an element tagged data-pitch="…". */
export interface PitchNote {
  at: string;
  text: string;
}

export interface PitchStep {
  /** Page of SunD_Pitch_v12_10slides.pdf this step goes with (1–10). */
  slide: number;
  /** The slide's section chip, as on the deck. */
  label: string;
  /** Headline. *Words in asterisks* are set in SunD red, like the deck. */
  title: string;
  sub?: string;
  /** Slide 4 only: the moment in Aisyah's Monday, and its phase. */
  time?: string;
  moment?: string;
  phase?: 1 | 2;
  /** At most three, a few words each, listed top to bottom as they sit on the screen. */
  notes?: PitchNote[];
  /** Scroll this tagged element into view before pointing at things (default: the first note, if it is cut off). */
  scroll?: { at: string; block?: 'start' | 'center' | 'end' };
  run: (c: Ctx) => void;
}

const AISYAH: PersonaId = 'condo';
const MALL_BAY = 'central-mall';
const TOP_UP_PACK = SAVER_PACKS.findIndex((p) => p.pay === 500);

const as = (c: Ctx, persona: PersonaId) => c.s().setPersona(persona);
/** Moves the township clock forward to the next time it is `hour` o'clock. */
const at = (c: Ctx, hour: number) => c.s().jumpTo(hour);
const setBaySoc = (c: Ctx, bayId: string, soc: number) => {
  const s = c.s();
  s.patch({ bays: { ...s.bays, [bayId]: { ...s.bays[bayId], soc } } });
};
const topUpTx = (c: Ctx) => c.s().profiles[AISYAH].txs.find((t) => t.type === 'topup' && t.rm === -500);

/** Her RM 500 top-up (the 8:10 moment), so every later moment can spend it. */
function ensureTopUp(c: Ctx) {
  if (!topUpTx(c)) c.s().buySaver(TOP_UP_PACK, 'FPX online banking');
}
/** Ends the charge the 8:45 moment left running (it is held still while pitching). */
function endCharge(c: Ctx) {
  if (c.s().session?.status === 'charging') c.s().stopSession();
  if (c.s().session) c.s().clearSession();
}
/** Coffee and mall parking, paid with her credits (the 8 pm moment). */
function ensureSpend(c: Ctx) {
  const since = topUpTx(c)?.at ?? 0;
  for (const id of ['mall-parking', 'shop-cafe']) if (!c.s().profiles[AISYAH].txs.some((t) => t.facilityId === id && t.at >= since)) c.s().redeem(id);
}

const HER_DAY = { slide: 4, label: 'Her day', title: 'Aisyah’s Monday *with SunD*' } as const;

/**
 * Pitch mode follows SunD_Pitch_v12_10slides.pdf page by page. Each step sets the person, the clock and one app
 * screen, then points at what matters on it. Every step can be jumped to on its own.
 */
export const PITCH_STEPS: PitchStep[] = [
  {
    slide: 1,
    label: 'SunD',
    title: 'The township wallet, *powered by its own sun*',
    sub: 'One solar ecosystem: Wallet, solar roofs, SunD Bay, home solar, balcony, Walk and Cool.',
    notes: [
      { at: 'app-header', text: 'One wallet for the township' },
      { at: 'home-solar', text: 'Powered by Elmina’s own solar' },
      { at: 'home-nudge', text: 'Use power while the sun shines' },
    ],
    run: (c) => {
      c.s().resetDemo();
      as(c, AISYAH);
      c.s().setHeat(false);
      c.nav('/');
    },
  },
  {
    slide: 2,
    label: 'The problem',
    title: 'Paid for by the developer *alone*, felt by almost *no resident*',
    sub: 'So township solar stays a pilot. SunD shares it through one wallet.',
    notes: [
      { at: 'impact-roofs', text: 'Solar Sime Darby paid for alone' },
      { at: 'impact-wallet', text: 'SunD: every resident feels it' },
      { at: 'impact-use', text: 'Used where it is made' },
    ],
    run: (c) => {
      as(c, AISYAH);
      c.s().setHeat(false);
      c.nav('/home/impact');
    },
  },
  {
    slide: 3,
    label: 'The solution',
    title: 'One township, *one solar loop*',
    sub: 'Phase 1, the pilot: Wallet, mall roof and SunD Bay. Phase 2 adds home solar, balcony, Walk and Cool.',
    notes: [
      { at: 'map-modes', text: 'Phase 2: Walk and Cool' },
      { at: `bay-${MALL_BAY}`, text: 'Phase 1: mall roof + SunD Bay' },
      { at: 'map-legend', text: 'Green pin: running on spare solar' },
    ],
    run: (c) => {
      as(c, AISYAH);
      c.s().setHeat(false);
      at(c, 12.5);
      setBaySoc(c, MALL_BAY, 93);
      c.nav('/map');
    },
  },
  {
    ...HER_DAY,
    time: '7:00 AM',
    moment: 'Balcony power',
    phase: 2,
    notes: [
      { at: 'balcony-kwh', text: '800 W kit: ≈ 47 kWh a month' },
      { at: 'balcony-join', text: 'Phase 2: the 2027 sandbox' },
    ],
    run: (c) => {
      as(c, AISYAH);
      c.s().setHeat(false);
      endCharge(c);
      at(c, 7);
      c.nav('/wallet/balcony');
    },
  },
  {
    ...HER_DAY,
    time: '8:10 AM',
    moment: 'Top up',
    phase: 1,
    notes: [
      { at: 'saver-amounts', text: 'RM 500 in, RM 650 to spend' },
      { at: 'spend-anywhere', text: 'Spend it anywhere in Sime Darby' },
    ],
    run: (c) => {
      as(c, AISYAH);
      at(c, 8 + 10 / 60);
      c.nav('/wallet/saver?pack=500');
    },
  },
  {
    ...HER_DAY,
    time: '8:30 AM',
    moment: 'Shaded walk',
    phase: 2,
    notes: [
      { at: 'walk-walk-a', text: 'Solar roof over the hottest route' },
      { at: 'walk-under', text: '3.1 °C cooler in its shade' },
    ],
    scroll: { at: 'walk-under', block: 'end' },
    run: (c) => {
      as(c, AISYAH);
      ensureTopUp(c);
      at(c, 8.5);
      c.nav('/map?tab=walk&walk=walk-a');
    },
  },
  {
    ...HER_DAY,
    time: '8:45 AM',
    moment: 'Charge on sunshine',
    phase: 1,
    notes: [
      { at: 'session-ring', text: 'At the mall’s SunD Bay' },
      { at: 'session-source', text: 'Solar from this canopy' },
      { at: 'session-cash', text: 'Paid with credits: RM 0 cash' },
    ],
    scroll: { at: 'session-ring', block: 'start' },
    run: (c) => {
      as(c, AISYAH);
      ensureTopUp(c);
      at(c, 8.75);
      setBaySoc(c, MALL_BAY, 93);
      c.s().pitchCharge(MALL_BAY, 'dc', 34, 72);
      c.nav('/charge/session');
    },
  },
  {
    ...HER_DAY,
    time: '2:00 PM',
    moment: 'Cool room nearby',
    phase: 2,
    notes: [
      { at: 'cool-heat', text: 'Heat alert: Level 1, 36 °C' },
      { at: 'cool-nearest', text: 'Nearest cool room, one tap' },
      { at: 'cool-solar', text: 'Cooled by solar' },
    ],
    run: (c) => {
      as(c, AISYAH);
      endCharge(c);
      at(c, 14);
      c.s().setHeat(true);
      c.nav('/cool');
    },
  },
  {
    ...HER_DAY,
    time: '8:00 PM',
    moment: 'Pay, see the impact',
    phase: 1,
    notes: [
      { at: 'tx-shop', text: 'Coffee, on credits' },
      { at: 'tx-parking', text: 'Mall parking, on credits' },
      { at: 'tx-charge', text: 'This morning’s solar charge' },
    ],
    scroll: { at: 'wallet-activity', block: 'start' },
    run: (c) => {
      as(c, AISYAH);
      c.s().setHeat(false);
      endCharge(c);
      ensureTopUp(c);
      at(c, 20);
      ensureSpend(c);
      c.nav('/wallet');
    },
  },
  {
    slide: 5,
    label: 'Why SunD',
    title: 'Others sell charging. *SunD runs on its own sun.*',
    sub: 'Made on site, open to anyone, and the money stays in Sime Darby.',
    notes: [
      { at: 'bay-energy', text: 'Made on site, by the sun' },
      { at: 'bay-topup', text: 'RM 1.40 ÷ 1.30 = RM 1.08 a kWh' },
    ],
    scroll: { at: 'bay-price', block: 'end' },
    run: (c) => {
      as(c, 'public');
      c.s().setHeat(false);
      at(c, 10.5);
      setBaySoc(c, MALL_BAY, 60);
      c.nav(`/map/bay/${MALL_BAY}`);
    },
  },
  {
    slide: 6,
    label: 'Business model',
    title: 'The money *never leaves* the township',
    sub: 'Top up, build solar, power the mall and bays, spend inside Sime Darby. No cash-out.',
    notes: [
      { at: 'rewards-ebike', text: 'eBikes on Sime Darby’s solar' },
      { at: 'rewards-mall', text: 'Spent in Sime Darby’s own mall' },
    ],
    scroll: { at: 'rewards-ebike', block: 'start' },
    run: (c) => {
      as(c, AISYAH);
      c.s().setHeat(false);
      c.nav('/rewards');
    },
  },
  {
    slide: 7,
    label: 'The numbers',
    title: 'Phase 1 pays back in *9 years*',
    sub: 'One Elmina precinct, 25 years, 8% discount rate.',
    notes: [
      { at: 'case-kpis', text: 'NPV RM 2.26M · IRR 12% · 9 years' },
      { at: 'case-pays', text: 'Top-ups pay 53% of the build' },
      { at: 'case-cases', text: 'Positive in every case' },
    ],
    run: (c) => {
      as(c, AISYAH);
      c.nav('/pilot');
    },
  },
  {
    slide: 8,
    label: 'Impact',
    title: 'One ringgit of top-up *works three times*',
    sub: 'For residents, the planet and Sime Darby.',
    notes: [
      { at: 'receipt-place', text: 'Sime Darby: its sun, its bay' },
      { at: 'receipt-cash', text: 'Residents: RM 0 cash' },
      { at: 'receipt-co2', text: 'Planet: CO₂ avoided, every charge' },
    ],
    scroll: { at: 'receipt-co2', block: 'end' },
    run: (c) => {
      as(c, AISYAH);
      endCharge(c);
      const tx = c.s().profiles[AISYAH].txs.find((t) => t.type === 'charge');
      c.nav(tx ? `/charge/receipt/${tx.id}` : '/wallet');
    },
  },
  {
    slide: 9,
    label: 'Feasibility',
    title: 'Can it start now? *Yes.*',
    sub: 'Months 0–3 launch the wallet. 3–9 build the mall roof and first bay. 9–18 measure, decide.',
    notes: [
      { at: 'town-live', text: 'One Elmina precinct first' },
      { at: 'town-soon', text: 'Next townships once proven' },
    ],
    run: (c) => c.nav('/welcome?step=link'),
  },
  {
    slide: 10,
    label: 'The ask',
    title: 'Spend a *Sunny Day*. Charge at *SunD* Bay.',
    sub: 'Welcome to the Sustainably Designed Sime Darby township of tomorrow.',
    notes: [
      { at: 'home-bay', text: 'Charge at SunD Bay, on sunshine' },
      { at: 'quick-actions', text: 'Enjoy solar-driven facilities' },
    ],
    scroll: { at: 'home-bay', block: 'start' },
    run: (c) => {
      as(c, AISYAH);
      c.s().setHeat(false);
      at(c, 12.5);
      c.nav('/');
    },
  },
];

export const SLIDE_COUNT = Math.max(...PITCH_STEPS.map((s) => s.slide));

export function usePitch() {
  const nav = useNavigate();
  const pitch = useStore((s) => s.pitch);
  const setPitch = useStore((s) => s.setPitch);
  const go = useCallback(
    (i: number) => {
      const step = Math.max(0, Math.min(PITCH_STEPS.length - 1, i));
      // Pitch mode is still: the clock is paused, charging holds and toasts stay away.
      // Someone who scanned the QR and lands mid-pitch skips onboarding.
      if (!useStore.getState().onboarded) useStore.setState({ onboarded: true });
      setPitch({ on: true, step });
      useStore.getState().setDemoOpen(false);
      // Steps replace the address rather than add to it, so the browser's back button returns to the home page.
      const replaceNav = ((to: string) => nav(to, { replace: true })) as NavigateFunction;
      PITCH_STEPS[step].run({ s: useStore.getState, nav: replaceNav });
      useStore.setState({ speed: 0, toasts: [] });
    },
    [nav, setPitch],
  );
  const exit = useCallback(() => {
    setPitch({ on: false, step: 0 });
    useStore.getState().setSpeed(60);
  }, [setPitch]);
  const index = Math.min(pitch.step, PITCH_STEPS.length - 1);
  /** Back to the home page (Pitch mode or Live prototype). */
  const home = useCallback(() => {
    exit();
    nav('/start');
  }, [exit, nav]);
  const step = PITCH_STEPS[index];
  // Pitch mode moves slide by slide (10, like the deck). Slide 4 has six times of Aisyah's day inside it.
  const goSlide = (n: number) => {
    const i = firstOfSlide(n);
    if (i >= 0) go(i);
  };
  const moments = PITCH_STEPS.map((s, i) => ({ s, i })).filter((x) => x.s.slide === step.slide && x.s.time);
  const momentAt = moments.findIndex((m) => m.i === index);
  const nextMoment = moments.length ? moments[(momentAt + 1) % moments.length] : undefined;
  return {
    pitch: { ...pitch, step: index },
    go,
    exit,
    home,
    step,
    goSlide,
    nextSlide: () => goSlide(step.slide + 1),
    prevSlide: () => goSlide(step.slide - 1),
    isFirstSlide: step.slide === 1,
    isLastSlide: step.slide === SLIDE_COUNT,
    moments,
    momentAt,
    /** The next time on slide 4, wrapping back to the first after 8 pm. */
    nextMoment,
    goNextMoment: () => nextMoment && go(nextMoment.i),
    goPrevMoment: () => momentAt > 0 && go(moments[momentAt - 1].i),
  };
}

const firstOfSlide = (n: number) => PITCH_STEPS.findIndex((s) => s.slide === n);

/** *Asterisks* → SunD red, as on the deck (a brighter red on navy). */
function Rich({ text, onNavy = false }: { text: string; onNavy?: boolean }) {
  return (
    <>
      {text.split(/(\*[^*]+\*)/).map((part, i) =>
        part.startsWith('*') ? (
          <span key={i} className={onNavy ? 'text-sun-bright' : 'text-sun'}>
            {part.slice(1, -1)}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/** ← → and Page Up/Down (presentation clickers) move between slides; ↑ ↓ step through the times on slide 4; Esc goes home. */
export function PitchKeyBridge() {
  const p = usePitch();
  const ref = useRef(p);
  ref.current = p;
  const on = p.pitch.on;
  useEffect(() => {
    if (!on) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      const c = ref.current;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        c.nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        c.prevSlide();
      } else if (e.key === 'ArrowDown' && c.moments.length) {
        e.preventDefault();
        c.goNextMoment();
      } else if (e.key === 'ArrowUp' && c.moments.length) {
        e.preventDefault();
        c.goPrevMoment();
      } else if (e.key === 'Escape') c.home();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [on]);
  return null;
}

/** Scrolls the nearest scrolling box inside the phone so `el` sits at the start, centre or end ('nearest' only if it is cut off). */
function scrollInPhone(el: HTMLElement, block: 'start' | 'center' | 'end' | 'nearest') {
  let box = el.parentElement;
  while (box && !box.classList.contains('phone')) {
    const oy = getComputedStyle(box).overflowY;
    if ((oy === 'auto' || oy === 'scroll') && box.scrollHeight > box.clientHeight) break;
    box = box.parentElement;
  }
  if (!box || box.classList.contains('phone')) return;
  const b = box.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const pad = 16;
  if (block === 'nearest' && r.top >= b.top && r.bottom <= b.bottom) return;
  const delta = block === 'start' || block === 'nearest' ? r.top - b.top - pad : block === 'end' ? r.bottom - b.bottom + pad : r.top + r.height / 2 - (b.top + b.height / 2);
  // Rects are on-screen pixels; the phone screen is zoomed, scrollTop is not.
  const zoom = b.height / box.clientHeight || 1;
  box.scrollTop += delta / zoom;
}

/**
 * One colour per note, chosen to stand apart from the app's own red, navy and green and checked for
 * colour-blind separation (dataviz validator).
 */
const NOTE_COLORS = ['#3E63DD', '#C2680A', '#9B3FB5'];
export const noteColor = (n: number) => NOTE_COLORS[(n - 1) % NOTE_COLORS.length];

interface Tagged {
  n: number;
  text: string;
  ring: { x: number; y: number; w: number; h: number };
  tag: { x: number; y: number; w: number };
}

const TAG_H = 24;
/** Rough width of a tag before it renders: 12.5 px bold text plus padding. */
const tagWidth = (text: string) => Math.round(text.length * 6.9 + 22);
type Box = { x: number; y: number; w: number; h: number };
/** Cost of each spot round a ring: above, top edge, bottom edge, below, inside. */
const SPOT_COST = [0, 100, 400, 4000, 5000];
/** Area two boxes share (0 if apart). */
const shared = (a: Box, b: Box) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));

/**
 * Points at the parts of the app a step talks about: a coloured ring round each one, and its few words on a tag
 * sitting on the ring's edge (top, or bottom when there is no room), right where the eye already is.
 */
export function PitchNotes() {
  const { pitch, step } = usePitch();
  const loc = useLocation();
  const [placed, setPlaced] = useState<Tagged[] | null>(null);
  const notes = pitch.on ? (step.notes ?? []) : [];
  const key = `${pitch.on}-${pitch.step}`;

  useEffect(() => {
    if (!pitch.on) return;
    const target = step.scroll?.at ?? step.notes?.[0]?.at;
    if (!target) return;
    const block = step.scroll?.block ?? 'nearest';
    let tries = 0;
    let again = 0;
    const id = window.setInterval(() => {
      const el = document.querySelector<HTMLElement>(`.phone [data-pitch="${target}"]`);
      if (!el && ++tries < 30) return;
      window.clearInterval(id);
      if (!el) return;
      scrollInPhone(el, block);
      // Once more after late content (charts, images) has settled.
      again = window.setTimeout(() => scrollInPhone(el, block), 300);
    }, 100);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(again);
    };
    // Re-run when the step or the screen changes.
  }, [key, loc.key]);

  useEffect(() => {
    if (!notes.length) {
      setPlaced(null);
      return;
    }
    let raf = 0;
    let last = '';
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const screen = document.querySelector('.phone .screen');
      if (!screen) return;
      const sr = screen.getBoundingClientRect();
      if (!sr.width) return;
      // First the rings, so each tag can keep clear of every annotated part, then the tags.
      const rings = notes
        .map((n, i) => ({ n: i + 1, text: n.text, el: document.querySelector(`.phone [data-pitch="${n.at}"]`) }))
        .flatMap(({ n, text, el }) => {
          if (!el) return [];
          const r = el.getBoundingClientRect();
          // Skip a part that has (mostly) scrolled out of view, so no sliver of a ring is left at the edge.
          const visible = Math.min(r.bottom, sr.bottom) - Math.max(r.top, sr.top);
          if (!r.width || visible < Math.min(28, r.height) || visible < r.height * 0.4) return [];
          const top = Math.max(r.top, sr.top + 4);
          const bottom = Math.min(r.bottom, sr.bottom - 4);
          const left = Math.max(r.left, sr.left + 4);
          const right = Math.min(r.right, sr.right - 4);
          return [{ n, text, ring: { x: left - 5, y: top - 4, w: right - left + 10, h: bottom - top + 8 } }];
        });
      const tags: Box[] = [];
      const items = rings.map(({ n, text, ring }) => {
        const w = Math.min(tagWidth(text), sr.width - 16);
        const clampX = (x: number) => Math.max(sr.left + 8, Math.min(x, sr.right - 8 - w));
        const xs = [clampX(ring.x + 10), clampX(ring.x + ring.w - w - 10)];
        // Same order as SPOT_COST: just above the ring, on its top edge, on its bottom edge, just below, inside its top.
        const ys = [ring.y - TAG_H - 3, ring.y - TAG_H * 0.55, ring.y + ring.h - TAG_H * 0.45, ring.y + ring.h + 3, ring.y + 5];
        let best: Box | null = null;
        let bestScore = Infinity;
        ys.forEach((y, yi) =>
          xs.forEach((x, xi) => {
            const t = { x, y, w, h: TAG_H };
            if (y < sr.top + 2 || y + TAG_H > sr.bottom - 2) return;
            const score =
              tags.reduce((a, o) => a + shared(t, o) * 50, 0) + // never on another tag
              rings.reduce((a, o) => a + shared(t, o.ring) * (o.n === n ? 0.2 : 2.5), 0) + // keep other annotated parts readable
              SPOT_COST[yi] + xi * 20; // prefer above or on the top edge, so a tag never drifts onto the next card
            if (score < bestScore) {
              bestScore = score;
              best = t;
            }
          }),
        );
        const tag = best ?? { x: xs[0], y: ring.y + 5, w, h: TAG_H };
        tags.push(tag);
        return { n, text, ring, tag };
      });
      const sig = JSON.stringify(items);
      if (sig !== last) {
        last = sig;
        setPlaced(items);
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [key]);

  if (!notes.length || !placed?.length) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[60]" aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full">
        {placed.map((it) => (
          <rect key={it.n} x={it.ring.x} y={it.ring.y} width={it.ring.w} height={it.ring.h} rx={14} fill={noteColor(it.n)} fillOpacity={0.06} stroke={noteColor(it.n)} strokeWidth={2} />
        ))}
      </svg>
      {placed.map((it) => (
        <span
          key={it.n}
          className="rise-in absolute flex items-center whitespace-nowrap rounded-full px-2.5 text-[12.5px] font-bold leading-none text-white shadow-soft ring-2 ring-white"
          style={{ left: it.tag.x, top: it.tag.y, height: TAG_H, maxWidth: it.tag.w + 12, background: noteColor(it.n) }}
        >
          <span className="truncate">{it.text}</span>
        </span>
      ))}
    </div>
  );
}

/** Swipe left or right on the slide bar or the navigation to move between slides. */
export function usePitchSwipe() {
  const { pitch, nextSlide, prevSlide } = usePitch();
  const start = useRef<{ x: number; y: number } | null>(null);
  return {
    onTouchStart: (e: TouchEvent) => {
      const inApp = (e.target as Element).closest('.phone');
      start.current = inApp || !pitch.on ? null : { x: e.touches[0].clientX, y: e.touches[0].clientY };
    },
    onTouchEnd: (e: TouchEvent) => {
      const s = start.current;
      start.current = null;
      if (!s) return;
      const dx = e.changedTouches[0].clientX - s.x;
      const dy = e.changedTouches[0].clientY - s.y;
      if (Math.abs(dx) > 50 && Math.abs(dx) > 1.5 * Math.abs(dy)) (dx < 0 ? nextSlide : prevSlide)();
    },
  };
}

/** Above the app: Home, the slide number, the slide's title. Nothing else. */
export function PitchTop() {
  const { pitch, step, home } = usePitch();
  if (!pitch.on) return null;
  return (
    <header className="w-full shrink-0 bg-sky px-3 pb-2.5 pt-[max(8px,env(safe-area-inset-top))] text-white sm:rounded-[22px] sm:pt-2.5">
      <div className="flex items-center gap-2">
        <button type="button" onClick={home} aria-label="Home: choose Pitch mode or Live prototype" className="flex h-8 shrink-0 items-center gap-1 rounded-full bg-white/10 px-2.5 text-[13px] font-bold hover:bg-white/20">
          <House size={15} /> Home
        </button>
        <span className="ml-auto shrink-0 rounded-full bg-sun px-2.5 py-0.5 text-[13px] font-bold tabular">
          Slide {step.slide}/{SLIDE_COUNT}
        </span>
      </div>
      <h1 key={pitch.step} className="rise-in mt-1.5 px-0.5 text-[18px] font-bold leading-6">
        <Rich text={step.title} onNavy />
      </h1>
    </header>
  );
}

/** Below the app: on slide 4 the time of Aisyah's day and a Next-time button, then Back · slide dots · Slide X. */
export function PitchBottom() {
  const { pitch, step, go, exit, goSlide, nextSlide, prevSlide, isFirstSlide, isLastSlide, moments, momentAt, nextMoment, goNextMoment } = usePitch();
  if (!pitch.on) return null;
  return (
    <footer className="w-full shrink-0 bg-page px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2.5 sm:rounded-[22px] sm:border sm:border-outline sm:pb-2.5 sm:shadow-soft">
      {step.time && (
        <div className="mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold text-sun tabular">{step.time}</span>
            <span className="min-w-0 truncate text-[15px] font-bold text-ink">{step.moment}</span>
            {nextMoment && (
              <button type="button" onClick={goNextMoment} aria-label={`Next time: ${nextMoment.s.time}, ${nextMoment.s.moment}`} className="ml-auto flex h-8 shrink-0 items-center gap-1 rounded-full bg-sun-soft pl-3 pr-2 text-[13px] font-bold text-sun-ink hover:bg-sun hover:text-white">
                {momentAt === moments.length - 1 ? (
                  <>Back to {nextMoment.s.time}</>
                ) : (
                  <>
                    Next {nextMoment.s.time} <ChevronRight size={15} />
                  </>
                )}
              </button>
            )}
          </div>
          <div className="mt-1.5 flex gap-1" role="group" aria-label="Times of the day">
            {moments.map((m, k) => (
              <button key={m.i} type="button" aria-label={`${m.s.time} · ${m.s.moment}`} aria-current={k === momentAt ? 'step' : undefined} onClick={() => go(m.i)} className="flex h-3 flex-1 items-center">
                <span className={cx('block h-1 w-full rounded-full', k <= momentAt ? 'bg-sun' : 'bg-ink-faint')} />
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-center gap-2">
        <button type="button" aria-label={`Slide ${step.slide - 1}`} disabled={isFirstSlide} onClick={prevSlide} className="btn btn-secondary !min-h-11 !w-11 shrink-0 !px-0">
          <ChevronLeft size={20} />
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-center" role="group" aria-label="Slides">
          {Array.from({ length: SLIDE_COUNT }, (_, k) => k + 1).map((n) => (
            <button key={n} type="button" aria-label={`Slide ${n}`} aria-current={n === step.slide ? 'step' : undefined} onClick={() => goSlide(n)} className="flex h-8 items-center px-[3px]">
              <span className={cx('block h-2 rounded-full transition-all', n === step.slide ? 'w-5 bg-sun' : n < step.slide ? 'w-2 bg-sky' : 'w-2 bg-ink-faint')} />
            </button>
          ))}
        </div>
        {isLastSlide ? (
          <button type="button" onClick={exit} className="btn btn-primary !min-h-11 shrink-0 !px-4">
            Explore the app
          </button>
        ) : (
          <button type="button" onClick={nextSlide} className="btn btn-red !min-h-11 shrink-0 !px-4">
            Slide {step.slide + 1} <ChevronRight size={18} />
          </button>
        )}
      </div>
    </footer>
  );
}

/** Live prototype: a slim bar above the app with Home (back to the choice page) and a switch to pitch mode. */
export function ModeBar() {
  const nav = useNavigate();
  const pitchOn = useStore((s) => s.pitch.on);
  if (pitchOn) return null;
  return (
    <div className="flex min-h-11 w-full shrink-0 items-center gap-2 bg-sky px-2 pt-[env(safe-area-inset-top)] text-white sm:rounded-full sm:pt-0">
      <button type="button" onClick={() => nav('/start')} aria-label="Home: choose Pitch mode or Live prototype" className="flex h-8 items-center gap-1.5 rounded-full bg-white/10 px-3 text-[14px] font-bold hover:bg-white/20">
        <House size={16} /> Home
      </button>
      <span className="min-w-0 flex-1 truncate text-center text-[12px] font-extrabold uppercase tracking-[0.14em] text-white/70">Live prototype</span>
      <button type="button" onClick={() => nav('/pitch')} className="flex h-8 items-center gap-1.5 rounded-full bg-sun px-3 text-[14px] font-bold hover:bg-sun-deep">
        <Presentation size={16} /> Pitch mode
      </button>
    </div>
  );
}

/**
 * Opens the walkthrough from a link: #/pitch starts at slide 1, #/pitch/4 at slide 4.
 * The QR codes point here, so the audience can follow on their own phones.
 */
export function PitchEntry() {
  const loc = useLocation();
  const { go } = usePitch();
  useEffect(() => {
    const m = loc.pathname.match(/^\/pitch(?:\/(\d+))?\/?$/);
    if (!m) return;
    const i = PITCH_STEPS.findIndex((s) => s.slide === Number(m[1] ?? 1));
    go(Math.max(0, i));
  }, [loc.pathname, go]);
  return null;
}

/** Pitch-mode card inside the presenter controls (phones and small laptops). */
export function PitchPanel() {
  const { pitch, go, exit, step, goSlide, nextSlide, prevSlide, isFirstSlide, isLastSlide, nextMoment, goNextMoment } = usePitch();
  if (!pitch.on)
    return (
      <button type="button" className="btn btn-primary w-full" onClick={() => go(0)}>
        <Presentation size={20} /> Start pitch mode
      </button>
    );
  return (
    <div className="card-navy p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-sun px-2.5 py-0.5 text-[12px] font-bold">
          Slide {step.slide} · {step.label}
        </span>
        <button type="button" aria-label="Exit pitch mode" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" onClick={exit}>
          <X size={18} />
        </button>
      </div>
      <div className="mt-2 text-[18px] font-bold leading-6">{step.title.replace(/\*/g, '')}</div>
      {step.time && (
        <div className="mt-1 flex items-center gap-2 text-[14px] font-bold text-sun-bright">
          {step.time} · {step.moment}
          {nextMoment && (
            <button type="button" onClick={goNextMoment} className="ml-auto rounded-full bg-white/10 px-2.5 py-1 text-[12px] text-white hover:bg-white/20">
              Next: {nextMoment.s.time}
            </button>
          )}
        </div>
      )}
      {step.sub && <p className="mt-1 text-[14px] leading-5 text-white/75">{step.sub}</p>}
      {step.notes && (
        <ol className="mt-2 list-decimal pl-5 text-[14px] leading-5 text-white/85">
          {step.notes.map((n) => (
            <li key={n.at}>{n.text}</li>
          ))}
        </ol>
      )}
      <div className="mt-3 flex items-center gap-2">
        <button type="button" className="btn btn-onnavy !min-h-11 flex-1" onClick={prevSlide} disabled={isFirstSlide}>
          <ChevronLeft size={18} /> Slide {Math.max(1, step.slide - 1)}
        </button>
        {isLastSlide ? (
          <button type="button" className="btn btn-red !min-h-11 flex-[2]" onClick={exit}>
            Explore the app
          </button>
        ) : (
          <button type="button" className="btn btn-red !min-h-11 flex-[2]" onClick={nextSlide}>
            Slide {step.slide + 1} <ChevronRight size={18} />
          </button>
        )}
      </div>
      <div className="mt-3 flex gap-1" aria-label={`Slide ${step.slide} of ${SLIDE_COUNT}`}>
        {Array.from({ length: SLIDE_COUNT }, (_, k) => k + 1).map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`Go to slide ${n}`}
            onClick={() => goSlide(n)}
            className={cx('h-1.5 flex-1 rounded-full', n === step.slide ? 'bg-sun' : n < step.slide ? 'bg-white/60' : 'bg-white/20')}
          />
        ))}
      </div>
      <div className="mt-2 text-[12px] text-white/50">← → slides · ↑ ↓ times on slide 4 · Esc for home</div>
    </div>
  );
}
