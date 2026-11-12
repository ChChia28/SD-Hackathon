import { ChevronLeft, ChevronRight, House, Presentation, X } from 'lucide-react';
import { Fragment, useCallback, useEffect, useRef, useState, type TouchEvent } from 'react';
import { useLocation, useNavigate, type NavigateFunction } from 'react-router-dom';
import { SAVER_PACKS } from '../data/constants';
import { cx } from '../lib/format';
import type { PersonaId } from '../store/types';
import { useStore, type State } from '../store/useStore';
import { ShareQr } from './ShareQr';
import { SunMark } from './shell';

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
  /** Scroll this tagged element into view before pointing at things. */
  scroll?: { at: string; block?: 'start' | 'center' | 'end' };
  /** Phones show less of the screen; scroll here instead when it differs. */
  phoneScroll?: { at: string; block?: 'start' | 'center' | 'end' };
  /** A picture or chart instead of the phone (slides 1, 2 and 7). */
  visual?: 'cover' | 'problem' | 'numbers';
  /** On a laptop, show the QR code that opens this walkthrough on the audience's phones. */
  qr?: boolean;
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
    visual: 'cover',
    qr: true,
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
    sub: 'So township solar stays a pilot.',
    visual: 'problem',
    run: () => {},
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
      { at: 'balcony-2027', text: 'Phase 2: 2027 sandbox' },
      { at: 'balcony-kwh', text: '800 W kit: ≈ 47 kWh a month' },
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
    scroll: { at: 'session-cash', block: 'end' },
    phoneScroll: { at: 'session-ring', block: 'start' },
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
    visual: 'numbers',
    run: () => {},
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
    phoneScroll: { at: 'receipt-co2', block: 'end' },
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
    qr: true,
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
    qr: true,
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
  return { pitch: { ...pitch, step: index }, go, exit, home, step: PITCH_STEPS[index] };
}

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

/** Arrow keys, Page Up/Down (presentation clickers) and Esc drive pitch mode. */
export function PitchKeyBridge() {
  const { pitch, go, home } = usePitch();
  useEffect(() => {
    if (!pitch.on) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        go(pitch.step + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        go(pitch.step - 1);
      } else if (e.key === 'Escape') home();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pitch.on, pitch.step, go, home]);
  return null;
}

/** Same height as the framed phone, so the slide panel and the phone line up. */
export const PITCH_HEIGHT = 'min(844px, calc(100dvh - 48px))';

/** Left of the phone on a laptop: the slide this step goes with, its headline, and the controls. */
export function PitchSlide() {
  const { pitch, step, go, home } = usePitch();
  if (!pitch.on) return null;
  const moments = PITCH_STEPS.map((s, i) => ({ s, i })).filter((x) => x.s.slide === step.slide && x.s.time);
  const first = (n: number) => PITCH_STEPS.findIndex((s) => s.slide === n);
  return (
    <aside className="hidden w-[380px] shrink-0 flex-col justify-between min-[1200px]:flex" style={{ height: PITCH_HEIGHT }}>
      <div className="flex items-center gap-2.5">
        <SunMark size={30} />
        <span className="text-[13px] font-extrabold uppercase tracking-[0.18em] text-sun">SunD · Team UrbanByte</span>
        <button type="button" onClick={home} className="ml-auto flex h-9 items-center gap-1.5 rounded-full border border-outline bg-page px-3 text-[14px] font-bold text-ink hover:border-sky-bright">
          <House size={16} /> Home
        </button>
      </div>

      <div key={pitch.step} className="rise-in">
        <div className="text-[14px] font-extrabold uppercase tracking-[0.16em] text-sun">
          Slide {step.slide} · {step.label}
        </div>
        <span className="mt-2 block h-[3px] w-14 rounded-full bg-sun" />
        <h1 className="mt-5 text-[38px] font-bold leading-[44px] tracking-[-0.01em] text-ink">
          <Rich text={step.title} />
        </h1>
        {step.sub && <p className="mt-4 text-[19px] leading-7 text-ink-muted">{step.sub}</p>}
        {moments.length > 0 && (
          <>
            <ol className="mt-6 flex flex-col gap-1">
              {moments.map(({ s, i }) => {
                const on = i === pitch.step;
                return (
                  <li key={i}>
                    <button type="button" onClick={() => go(i)} className={cx('flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left', on ? 'bg-sun-soft' : 'hover:bg-sunken')}>
                      <span className={cx('w-[74px] shrink-0 text-[14px] font-extrabold tabular', on ? 'text-sun' : 'text-ink-subtle')}>{s.time}</span>
                      <span className={cx('flex-1 text-[17px] font-bold', on ? 'text-ink' : 'text-ink-muted')}>{s.moment}</span>
                      <span className={cx('h-2.5 w-2.5 shrink-0 rounded-full', s.phase === 1 ? 'bg-sun' : 'bg-sky')} aria-label={`Phase ${s.phase}`} />
                    </button>
                  </li>
                );
              })}
            </ol>
            <div className="mt-2 flex gap-4 px-3 text-[13px] font-bold text-ink-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-sun" /> Phase 1
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-sky" /> Phase 2
              </span>
            </div>
          </>
        )}
        {step.qr && (
          <div className="mt-6 rounded-2xl border border-outline bg-page p-4 shadow-soft">
            <ShareQr size={108} />
          </div>
        )}
      </div>

      <div>
        <div className="flex gap-1" role="group" aria-label="Slides">
          {Array.from({ length: SLIDE_COUNT }, (_, k) => k + 1).map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`Slide ${n}`}
              aria-current={n === step.slide ? 'step' : undefined}
              onClick={() => go(first(n))}
              className={cx('flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold tabular', n === step.slide ? 'bg-sun text-white' : n < step.slide ? 'bg-sky text-white' : 'border border-outline bg-page text-ink-muted hover:border-sky-bright')}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button type="button" aria-label="Previous" className="btn btn-secondary !min-h-11 !px-3" onClick={() => go(pitch.step - 1)} disabled={pitch.step === 0}>
            <ChevronLeft size={20} />
          </button>
          <button type="button" className="btn btn-primary !min-h-11 !px-5" onClick={() => go(pitch.step + 1)} disabled={pitch.step === PITCH_STEPS.length - 1}>
            Next <ChevronRight size={20} />
          </button>
          <span className="ml-1 text-[13px] text-ink-subtle">← → to move · Esc for home</span>
        </div>
      </div>
    </aside>
  );
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

/** True on screens wide enough for the laptop layout (slide panel, phone, labels). */
function useWide() {
  const query = '(min-width: 1200px)';
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setWide(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return wide;
}

interface Placed {
  /** The note's number: its place in the step's list. */
  n: number;
  text: string;
  /** Where the line meets the element (laptop) or the badge sits (phone). */
  tx: number;
  ty: number;
  ring: { x: number; y: number; w: number; h: number };
  /** Label centre, y (laptop only). */
  ly: number;
}

const LABEL_H = 52;
const LABEL_GAP = 14;

/**
 * One colour per note, so ring 2 on the app matches caption 2. Chosen to stand apart from the app's own
 * red, navy and green, and checked for colour-blind separation (dataviz validator). The numbers carry it too.
 */
const NOTE_COLORS = ['#3E63DD', '#C2680A', '#9B3FB5'];
export const noteColor = (n: number) => NOTE_COLORS[(n - 1) % NOTE_COLORS.length];

/**
 * Points at the parts of the app a step talks about. Each one gets a red ring and its number.
 * On a laptop the words sit beside the phone with a straight line to the ring;
 * on a phone the words are in the caption card under the app, so only the numbered ring shows.
 */
export function PitchNotes() {
  const { pitch, step } = usePitch();
  const loc = useLocation();
  const wide = useWide();
  const [placed, setPlaced] = useState<{ lx: number; items: Placed[] } | null>(null);
  const notes = pitch.on && !step.visual ? (step.notes ?? []) : [];
  const key = `${pitch.on}-${pitch.step}-${wide}`;

  useEffect(() => {
    if (!pitch.on || step.visual) return;
    // Phones show less of the screen: bring the first thing pointed at into view if no scroll is set.
    const set = wide ? step.scroll : (step.phoneScroll ?? step.scroll);
    const target = set?.at ?? (wide ? undefined : step.notes?.[0]?.at);
    if (!target) return;
    const block = set?.block ?? 'nearest';
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
    // Re-run when the step, the layout or the screen changes.
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
      const phone = document.querySelector('.phone');
      const screen = document.querySelector('.phone .screen');
      if (!phone || !screen) return;
      const pr = phone.getBoundingClientRect();
      const sr = screen.getBoundingClientRect();
      if (!pr.width) return;
      const items = notes
        .map((n, i) => ({ n: i + 1, text: n.text, el: document.querySelector(`.phone [data-pitch="${n.at}"]`) }))
        .flatMap(({ n, text, el }) => {
          if (!el) return [];
          const r = el.getBoundingClientRect();
          if (!r.width || r.bottom < sr.top + 10 || r.top > sr.bottom - 10) return [];
          const top = Math.max(r.top, sr.top + 4);
          const bottom = Math.min(r.bottom, sr.bottom - 4);
          const left = Math.max(r.left, sr.left + 4);
          const right = Math.min(r.right, sr.right - 4);
          const ring = { x: left - 6, y: top - 4, w: right - left + 12, h: bottom - top + 8 };
          // Phone: the badge sits on the ring's top-right corner, kept inside the screen.
          const edge = Math.min(sr.right, pr.right, window.innerWidth) - 18;
          const badge = { x: Math.min(ring.x + ring.w - 6, edge), y: Math.max(ring.y + 6, sr.top + 16) };
          if (!wide) ring.w = Math.min(ring.w, edge + 14 - ring.x);
          return [{ n, text, ring, ...(wide ? { tx: right + 6, ty: (top + bottom) / 2 } : { tx: badge.x, ty: badge.y }) }];
        })
        .sort((a, b) => a.ty - b.ty);
      // Laptop: stack the labels without overlap, each as level with its element as it can be.
      let y = -Infinity;
      const ly = items.map((it) => (y = Math.max(it.ty, y + LABEL_H + LABEL_GAP)));
      const over = ly.length ? ly[ly.length - 1] - (pr.bottom - LABEL_H / 2) : 0;
      if (over > 0) {
        for (let i = 0; i < ly.length; i++) ly[i] -= over;
        for (let i = 0; i < ly.length; i++) ly[i] = Math.max(ly[i], i ? ly[i - 1] + LABEL_H + LABEL_GAP : pr.top + LABEL_H / 2);
      }
      const next = { lx: Math.round(pr.right + 40), items: items.map((it, i) => ({ ...it, ly: Math.round(ly[i]) })) };
      const sig = JSON.stringify(next);
      if (sig !== last) {
        last = sig;
        setPlaced(next);
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [key]);

  if (!notes.length || !placed?.items.length) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[60]" aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full">
        {placed.items.map((it) => (
          <g key={it.n}>
            <rect x={it.ring.x} y={it.ring.y} width={it.ring.w} height={it.ring.h} rx={14} fill={noteColor(it.n)} fillOpacity={0.06} stroke={noteColor(it.n)} strokeWidth={2} />
            {wide && (
              <>
                <path d={`M${placed.lx} ${it.ly} L${it.tx} ${it.ty}`} stroke={noteColor(it.n)} strokeWidth={2} fill="none" />
                <circle cx={it.tx} cy={it.ty} r={5.5} fill={noteColor(it.n)} stroke="#fff" strokeWidth={2} />
              </>
            )}
          </g>
        ))}
      </svg>
      {placed.items.map((it) =>
        wide ? (
          <div key={it.n} className="rise-in absolute flex items-center gap-3 whitespace-nowrap rounded-2xl border border-outline bg-page py-2.5 pl-2.5 pr-4 shadow-soft" style={{ left: placed.lx, top: it.ly, transform: 'translateY(-50%)' }}>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white" style={{ background: noteColor(it.n) }}>
              {it.n}
            </span>
            <span className="text-[18px] font-bold leading-6 text-ink">{it.text}</span>
          </div>
        ) : (
          <span key={it.n} className="rise-in absolute flex h-7 w-7 items-center justify-center rounded-full text-[14px] font-bold text-white shadow-soft ring-2 ring-white" style={{ left: it.tx, top: it.ty, transform: 'translate(-50%, -50%)', background: noteColor(it.n) }}>
            {it.n}
          </span>
        ),
      )}
    </div>
  );
}

/** Swipe left or right outside the app screen (slide bar, captions, picture pages) to move through the pitch. */
export function usePitchSwipe() {
  const { pitch, go } = usePitch();
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
      if (Math.abs(dx) > 50 && Math.abs(dx) > 1.5 * Math.abs(dy)) go(pitch.step + (dx < 0 ? 1 : -1));
    },
  };
}

/** Phones and tablets: the slide this step goes with, above the app. */
export function PitchTop() {
  const { pitch, step, home } = usePitch();
  if (!pitch.on) return null;
  return (
    <header className="w-full shrink-0 bg-sky px-4 pb-3 pt-[max(10px,env(safe-area-inset-top))] text-white sm:rounded-[24px] sm:pt-3 min-[1200px]:hidden">
      <div className="flex items-center gap-2">
        <button type="button" onClick={home} aria-label="Home: choose Pitch mode or Live prototype" className="-ml-1 flex h-8 shrink-0 items-center gap-1 rounded-full bg-white/10 px-2.5 text-[13px] font-bold hover:bg-white/20">
          <House size={15} /> Home
        </button>
        <span className="shrink-0 rounded-full bg-sun px-2 py-0.5 text-[12px] font-bold">Slide {step.slide}</span>
        <span className="min-w-0 flex-1 truncate text-[12px] font-extrabold uppercase tracking-[0.14em] text-white/70">{step.label}</span>
        <span className="text-[13px] font-bold text-white/60 tabular">
          {pitch.step + 1}/{PITCH_STEPS.length}
        </span>
      </div>
      <h1 key={pitch.step} className="rise-in mt-1 text-[20px] font-bold leading-[26px]">
        <Rich text={step.title} onNavy />
      </h1>
      {step.time ? (
        <div className="mt-1 flex items-center gap-2 text-[15px] font-bold">
          <span className="text-sun-bright tabular">{step.time}</span>
          <span>{step.moment}</span>
          <span className={cx('ml-auto rounded-full px-2 py-0.5 text-[11px]', step.phase === 1 ? 'bg-sun' : 'bg-white/15')}>Phase {step.phase}</span>
        </div>
      ) : (
        step.visual && step.sub && <p className="mt-1 text-[14px] leading-5 text-white/75">{step.sub}</p>
      )}
    </header>
  );
}

/** Phones and tablets: what the numbered rings mean, then Back / Next. */
export function PitchBottom() {
  const { pitch, step, go, exit } = usePitch();
  if (!pitch.on) return null;
  const last = pitch.step === PITCH_STEPS.length - 1;
  const first = (n: number) => PITCH_STEPS.findIndex((s) => s.slide === n);
  return (
    <footer className="mt-2.5 w-full shrink-0 rounded-t-[20px] bg-page px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-6px_20px_rgba(26,31,58,0.08)] sm:mt-0 sm:rounded-[24px] sm:border sm:border-outline sm:shadow-soft min-[1200px]:hidden">
      {!!step.notes?.length && !step.visual && (
        <div key={pitch.step} className="rise-in mb-3">
          <div className="mb-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink-subtle">On this screen</div>
          <ol className="flex flex-col gap-1.5">
            {step.notes.map((n, i) => (
              <li key={n.at} className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white" style={{ background: noteColor(i + 1) }}>
                  {i + 1}
                </span>
                <span className="text-[15px] font-bold leading-5 text-ink">{n.text}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
      <div className="flex items-center gap-2">
        <button type="button" aria-label="Previous" disabled={pitch.step === 0} onClick={() => go(pitch.step - 1)} className="btn btn-secondary !min-h-11 !w-11 shrink-0 !px-0">
          <ChevronLeft size={20} />
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-center" role="group" aria-label="Slides">
          {Array.from({ length: SLIDE_COUNT }, (_, k) => k + 1).map((n) => (
            <button key={n} type="button" aria-label={`Slide ${n}`} aria-current={n === step.slide ? 'step' : undefined} onClick={() => go(first(n))} className="flex h-8 items-center px-[3px]">
              <span className={cx('block h-2 rounded-full transition-all', n === step.slide ? 'w-5 bg-sun' : n < step.slide ? 'w-2 bg-sky' : 'w-2 bg-ink-faint')} />
            </button>
          ))}
        </div>
        {last ? (
          <button type="button" onClick={exit} className="btn btn-primary !min-h-11 shrink-0 !px-4">
            Explore the app
          </button>
        ) : (
          <button type="button" onClick={() => go(pitch.step + 1)} className="btn btn-red !min-h-11 shrink-0 !px-4">
            Next <ChevronRight size={18} />
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
  const { pitch, go, exit, step } = usePitch();
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
        <div className="mt-1 text-[14px] font-bold text-sun-bright">
          {step.time} · {step.moment}
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
        <button type="button" className="btn btn-onnavy !min-h-11 flex-1" onClick={() => go(pitch.step - 1)} disabled={pitch.step === 0}>
          <ChevronLeft size={18} /> Back
        </button>
        <button type="button" className="btn btn-red !min-h-11 flex-[2]" onClick={() => go(pitch.step + 1)} disabled={pitch.step === PITCH_STEPS.length - 1}>
          Next <ChevronRight size={18} />
        </button>
      </div>
      <div className="mt-3 flex gap-1" aria-label={`Step ${pitch.step + 1} of ${PITCH_STEPS.length}`}>
        {PITCH_STEPS.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to step ${i + 1}`}
            onClick={() => go(i)}
            className={cx('h-1.5 flex-1 rounded-full', i === pitch.step ? 'bg-sun' : i < pitch.step ? 'bg-white/60' : 'bg-white/20')}
          />
        ))}
      </div>
      <div className="mt-2 text-[12px] text-white/50">← → or a presentation clicker · Esc to exit</div>
    </div>
  );
}
