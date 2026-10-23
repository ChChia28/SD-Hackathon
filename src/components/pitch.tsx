import { ChevronLeft, ChevronRight, Presentation, X } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { useNavigate, type NavigateFunction } from 'react-router-dom';
import { cx } from '../lib/format';
import { useStore, type State } from '../store/useStore';

interface Ctx {
  s: () => State;
  nav: NavigateFunction;
}

export interface PitchStep {
  /** Deck slide this step illustrates (page number in SunD_Pitch_Deck_UrbanByte.pdf). */
  slide: number;
  slideTitle: string;
  title: string;
  /** One-line talking point for the presenter. */
  say: string;
  run: (c: Ctx) => void;
}

const PILOT = 'clubhouse';
const as = (c: Ctx, persona: Parameters<State['setPersona']>[0]) => c.s().setPersona(persona);

/** The demo in deck order. Each step sets the persona, time and screen it needs, so any step can be jumped to. */
export const PITCH_STEPS: PitchStep[] = [
  {
    slide: 3,
    slideTitle: 'Target user',
    title: 'Aisyah has no roof, but she has solar',
    say: 'NEM, Solar ATAP and CREAM all need a roof. Aisyah rents a condo, so SunD gives her a 1 kW slice of the township pool.',
    run: (c) => {
      c.s().resetDemo();
      as(c, 'condo');
      c.s().setHeat(false);
      c.s().setSpeed(60);
      c.nav('/');
    },
  },
  {
    slide: 4,
    slideTitle: 'Solution · SHARE',
    title: 'One wallet turns solar into a lower bill',
    say: '110 kWh a month at a flat 36 sen is about RM 40 off the bill: no roof, no install, no change of supplier.',
    run: (c) => {
      as(c, 'condo');
      c.nav('/wallet/slice');
    },
  },
  {
    slide: 6,
    slideTitle: 'How it works · nudge',
    title: '11am: the app nudges demand into the solar peak',
    say: 'Pre-cool, run the washer, charge the car while the sun is strongest. Every kWh moved is read from smart-meter data.',
    run: (c) => {
      as(c, 'condo');
      c.s().jumpTo(11.1);
      c.nav('/');
    },
  },
  {
    slide: 6,
    slideTitle: 'How it works · SunD Bay',
    title: 'Mr Lim keeps his lease and earns credits on top',
    say: 'A SunD Bay makes and stores its own power: canopy, battery, charger, car. 0 km transmission; the grid tops up the rest.',
    run: (c) => {
      as(c, 'landed');
      const id = c.s().triggerSurplus(PILOT);
      c.nav(`/map/bay/${id}`);
    },
  },
  {
    slide: 6,
    slideTitle: 'How it works · spend',
    title: 'He charges with credits, never cash',
    say: 'Credits only spend on solar-powered facilities, so the benefit never leaks out of the loop.',
    run: (c) => {
      as(c, 'landed');
      const s = c.s();
      if (s.bays[PILOT].soc < 80) s.triggerSurplus(PILOT);
      if (!s.session || s.session.status !== 'charging') c.s().startSession(PILOT, 'ac', 20);
      c.nav('/charge/session');
    },
  },
  {
    slide: 5,
    slideTitle: 'Innovation',
    title: 'Daniel pays less than the market at the same bay',
    say: 'Public drivers pay per kWh, catch the Solar Surplus Discount, or pre-buy Saver Credits: pay RM 20, get RM 30. That revenue funds the next bay.',
    run: (c) => {
      as(c, 'public');
      if (c.s().bays[PILOT].soc < 80) c.s().triggerSurplus(PILOT);
      c.nav(`/map/bay/${PILOT}`);
    },
  },
  {
    slide: 6,
    slideTitle: 'How it works · hybrid',
    title: 'At night the bays run on stored sunshine',
    say: 'The battery carries midday solar into the evening; only when it runs low does the grid take over.',
    run: (c) => {
      as(c, 'public');
      c.s().jumpTo(21.5);
      c.nav('/map');
    },
  },
  {
    slide: 7,
    slideTitle: 'Visual concept · SunD Walk',
    title: 'The hottest route gets a solar roof first',
    say: 'A Landsat heat map ranks the routes. Street shade cuts feels-like temperature by about 3 °C, and the roof feeds the pool.',
    run: (c) => {
      as(c, 'condo');
      c.s().jumpTo(14);
      c.nav('/map?tab=walk&walk=walk-a');
    },
  },
  {
    slide: 3,
    slideTitle: 'Target user · People',
    title: 'Uncle Tan gets the heat alert in his language',
    say: 'Sponsored slice, large text, 中文 or BM, read aloud. On a Level 1 heat day the nearest SunD Cool room is one tap away.',
    run: (c) => {
      as(c, 'elder');
      c.s().setHeat(true);
      c.nav('/');
    },
  },
  {
    slide: 6,
    slideTitle: 'How it works · SunD Cool',
    title: 'He checks in at the cool room',
    say: 'Visits per heat-alert day, and the share who are 65+ or B40, are pilot KPI 4.',
    run: (c) => {
      as(c, 'elder');
      if (!c.s().heat.on) c.s().setHeat(true);
      c.nav('/cool');
    },
  },
  {
    slide: 6,
    slideTitle: '2027 extension',
    title: 'Next: SunD Balcony for condos',
    say: 'Germany runs 1.53 million plug-in kits. Malaysia has no rules yet, so we propose an SDP pilot inside the 2027 sandbox.',
    run: (c) => {
      as(c, 'condo');
      c.s().setHeat(false);
      c.nav('/wallet/balcony');
    },
  },
  {
    slide: 9,
    slideTitle: 'Impact · Feasibility',
    title: 'SDP sees every kWh, credit and tonne',
    say: 'Seven KPIs with month-1 baselines and a go / no-go on the first three. Drag the sliders to answer any “what if usage is lower?”',
    run: (c) => c.nav('/sdp'),
  },
  {
    slide: 10,
    slideTitle: 'Why our team should win',
    title: 'One sun, one township, one loop',
    say: 'No new plant, no new licence: it connects what SDP already owns with a go/no-go call at month 6.',
    run: (c) => {
      as(c, 'landed');
      c.nav('/home/impact');
    },
  },
];

export function usePitch() {
  const nav = useNavigate();
  const pitch = useStore((s) => s.pitch);
  const setPitch = useStore((s) => s.setPitch);
  const go = useCallback(
    (i: number) => {
      const step = Math.max(0, Math.min(PITCH_STEPS.length - 1, i));
      setPitch({ on: true, step });
      useStore.getState().setDemoOpen(false);
      PITCH_STEPS[step].run({ s: useStore.getState, nav });
    },
    [nav, setPitch],
  );
  const exit = useCallback(() => setPitch({ on: false, step: 0 }), [setPitch]);
  return { pitch, go, exit, step: PITCH_STEPS[pitch.step] };
}

/** Arrow keys, Page Up/Down (presentation clickers) and Esc drive pitch mode. */
export function PitchKeyBridge() {
  const { pitch, go, exit } = usePitch();
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
      } else if (e.key === 'Escape') exit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pitch.on, pitch.step, go, exit]);
  return null;
}

/** "Slide 6 · How it works" tag above the phone while pitching. */
export function PitchTag() {
  const { pitch, step, go } = usePitch();
  if (!pitch.on) return null;
  const arrow = 'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30';
  return (
    <div className="pitch-tag rise-in flex w-full max-w-[390px] items-center gap-2 rounded-full bg-sky py-1.5 pl-1.5 pr-1.5 text-[14px] font-bold text-white shadow-soft">
      <button type="button" aria-label="Previous step" className={arrow} disabled={pitch.step === 0} onClick={() => go(pitch.step - 1)}>
        <ChevronLeft size={16} />
      </button>
      <span className="shrink-0 rounded-full bg-sun px-2 py-0.5 text-[12px]">Slide {step.slide}</span>
      <span className="min-w-0 flex-1 truncate">{step.slideTitle}</span>
      <span className="text-white/60 tabular">
        {pitch.step + 1}/{PITCH_STEPS.length}
      </span>
      <button type="button" aria-label="Next step" className={arrow} disabled={pitch.step === PITCH_STEPS.length - 1} onClick={() => go(pitch.step + 1)}>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

/** Pitch-mode card inside the presenter controls. */
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
          Slide {step.slide} · {step.slideTitle}
        </span>
        <button type="button" aria-label="Exit pitch mode" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" onClick={exit}>
          <X size={18} />
        </button>
      </div>
      <div className="mt-2 font-display text-[18px] font-bold leading-6">{step.title}</div>
      <p className="mt-1 text-[14px] leading-5 text-white/75">{step.say}</p>
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
