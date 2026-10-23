import { AlertCircle, CloudSun, Gift, Leaf, Moon, Pause, RotateCcw, Snowflake, Sparkles, Star, Sun, ThermometerSun, X, Zap, type LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Type as TypeIcon } from 'lucide-react';
import { LANGS } from '../lib/i18n';
import { PitchPanel, usePitch } from './pitch';
import { ShareQr } from './ShareQr';
import { PERSONAS, PERSONA_IDS } from '../data/personas';
import { cx, fmtDate, fmtTime } from '../lib/format';
import { useStore } from '../store/useStore';
import type { Toast, ToastIcon, Weather } from '../store/types';
import { WEATHER_LABEL } from './status';
import { StarBadge } from './ui';

export const TOAST_ICONS: Record<ToastIcon, { Icon: LucideIcon; cls: string }> = {
  sun: { Icon: Sun, cls: 'bg-sun-soft text-sun-deep' },
  leaf: { Icon: Leaf, cls: 'bg-leaf-soft text-leaf-deep' },
  bolt: { Icon: Zap, cls: 'bg-sky-soft text-sky-deep' },
  gift: { Icon: Gift, cls: 'bg-berry-soft text-berry-ink' },
  star: { Icon: Star, cls: 'bg-sun-soft text-sun-deep' },
  moon: { Icon: Moon, cls: 'bg-sunken text-ink-muted' },
  alert: { Icon: AlertCircle, cls: 'bg-coral-soft text-coral-ink' },
  heat: { Icon: ThermometerSun, cls: 'bg-sun-soft text-sun-deep' },
  snow: { Icon: Snowflake, cls: 'bg-berry-soft text-berry-ink' },
};

function ToastItem({ t }: { t: Toast }) {
  const dismiss = useStore((s) => s.dismissToast);
  const nav = useNavigate();
  useEffect(() => {
    const id = window.setTimeout(() => dismiss(t.id), 4500);
    return () => window.clearTimeout(id);
  }, [dismiss, t.id]);
  const { Icon, cls } = TOAST_ICONS[t.icon];
  return (
    <button
      type="button"
      onClick={() => {
        dismiss(t.id);
        if (t.to) nav(t.to);
      }}
      className="toast-in pointer-events-auto flex w-full items-start gap-3 rounded-[20px] border border-outline bg-elevated p-3 text-left shadow-modal"
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${cls}`}>
        <Icon size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold leading-6">{t.title}</span>
        {t.body && <span className="block text-[14px] leading-5 text-ink-muted">{t.body}</span>}
      </span>
    </button>
  );
}

export function Toasts() {
  const toasts = useStore((s) => s.toasts);
  return (
    <div className="pointer-events-none absolute inset-x-3 top-2 z-40 flex flex-col gap-2" aria-live="polite">
      {toasts.map((t) => (
        <ToastItem key={t.id} t={t} />
      ))}
    </div>
  );
}

/** Confetti on completion only. Reduced motion gets a single static star. */
export function Confetti() {
  const key = useStore((s) => s.confettiKey);
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (!key) return;
    setActive(key);
    const id = window.setTimeout(() => setActive(0), 1900);
    return () => window.clearTimeout(id);
  }, [key]);
  const pieces = useMemo(
    () =>
      Array.from({ length: 44 }, (_, i) => ({
        left: (i * 37) % 100,
        color: ['var(--color-sky)', 'var(--color-sun)', 'var(--color-leaf)', 'var(--color-berry)'][i % 4],
        delay: ((i * 53) % 400) / 1000,
        dx: `${((i * 29) % 80) - 40}px`,
        rot: `${((i * 71) % 720) - 360}deg`,
      })),
    [],
  );
  if (!active) return null;
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reduced)
    return (
      <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center">
        <StarBadge earned size={96} glow />
      </div>
    );
  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={`${active}-${i}`}
          className="confetti-piece"
          style={{ left: `${p.left}%`, background: p.color, animationDelay: `${p.delay}s`, '--dx': p.dx, '--rot': p.rot } as CSSProperties}
        />
      ))}
    </div>
  );
}

const SPEEDS = [
  { v: 0, label: 'Pause' },
  { v: 1, label: '1×' },
  { v: 60, label: '60×' },
  { v: 600, label: '600×' },
];
const JUMPS = [
  { h: 8, label: 'Morning', sub: '8:00 am' },
  { h: 12.5, label: 'Noon', sub: '12:30 pm' },
  { h: 18.5, label: 'Evening', sub: '6:30 pm' },
  { h: 21.5, label: 'Night', sub: '9:30 pm' },
];

/** Presenter controls: time, weather, persona and scripted events. */
export function DemoControls({ onDone }: { onDone?: () => void }) {
  const nav = useNavigate();
  const s = useStore();
  const prof = s.profiles[s.persona];
  const go = (to: string) => {
    nav(to);
    onDone?.();
  };
  const label = 'mb-2 text-[13px] font-bold uppercase tracking-wider text-ink-subtle';

  return (
    <div className="flex flex-col gap-5">
      <PitchPanel />
      <div className="rounded-2xl bg-surface p-4">
        <div className="text-[14px] text-ink-muted">Simulated township clock</div>
        <div className="font-mono text-[28px] font-bold leading-9 tabular">{fmtTime(s.simTime)}</div>
        <div className="text-[14px] text-ink-muted">{fmtDate(s.simTime)} · 1 real second = {s.speed === 0 ? 'paused' : `${s.speed} sim seconds`}</div>
      </div>

      <div>
        <div className={label}>Speed</div>
        <div className="segmented">
          {SPEEDS.map((o) => (
            <button key={o.v} type="button" aria-pressed={s.speed === o.v} onClick={() => s.setSpeed(o.v)}>
              {o.v === 0 ? <Pause size={16} className="inline" /> : o.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className={label}>Fast-forward to</div>
        <div className="grid grid-cols-4 gap-2">
          {JUMPS.map((j) => (
            <button key={j.h} type="button" onClick={() => s.jumpTo(j.h)} className="flex min-h-14 flex-col items-center justify-center rounded-xl border border-outline bg-page text-[14px] font-bold hover:border-sky-bright hover:bg-sky-soft">
              {j.label}
              <span className="text-[12px] font-normal text-ink-muted">{j.sub}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className={label}>Weather</div>
        <div className="segmented">
          {(['sunny', 'cloudy', 'rainy'] as Weather[]).map((w) => (
            <button key={w} type="button" aria-pressed={s.weather === w} onClick={() => s.setWeather(w)}>
              {WEATHER_LABEL[w]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className={label}>Viewing as</div>
        <div className="grid grid-cols-2 gap-2">
          {PERSONA_IDS.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={s.persona === p}
              onClick={() => s.setPersona(p)}
              className={cx('flex min-h-14 flex-col items-start justify-center rounded-xl border px-3 text-left', s.persona === p ? 'border-sky bg-sky text-white' : 'border-outline bg-page hover:border-sky-bright')}
            >
              <span className="text-[15px] font-bold leading-5">{PERSONAS[p].short}</span>
              <span className={cx('text-[12px] leading-4', s.persona === p ? 'text-white/70' : 'text-ink-muted')}>{PERSONAS[p].label}</span>
            </button>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="segmented flex-1" role="group" aria-label="Language">
            {LANGS.map((l) => (
              <button key={l.id} type="button" aria-pressed={prof.lang === l.id} onClick={() => s.setLang(l.id)}>
                {l.label}
              </button>
            ))}
          </div>
          <button type="button" aria-pressed={prof.largeText} aria-label="Large text" onClick={() => s.setLargeText(!prof.largeText)} className={cx('flex h-[52px] w-[52px] items-center justify-center rounded-[14px] border', prof.largeText ? 'border-sky bg-sky text-white' : 'border-outline bg-page text-ink-muted')}>
            <TypeIcon size={20} />
          </button>
        </div>
      </div>

      <div>
        <div className={label}>Events</div>
        <div className="flex flex-col gap-2">
          <button type="button" className={cx('btn !justify-start', s.heat.on ? 'btn-red' : 'btn-secondary')} onClick={() => { s.setHeat(!s.heat.on); if (!s.heat.on) go('/'); }}>
            <ThermometerSun size={20} /> {s.heat.on ? 'End heat alert' : 'Heat alert · 36 °C'}
          </button>
          <button type="button" className="btn btn-secondary !justify-start" onClick={() => { s.jumpTo(11.1); go('/'); }}>
            <Sun size={20} /> Solar peak nudge · 11 am
          </button>
          <button type="button" className="btn btn-secondary !justify-start" onClick={() => go(`/map/bay/${s.triggerSurplus()}`)}>
            <Sparkles size={20} /> Trigger solar surplus
          </button>
          <button type="button" className="btn btn-secondary !justify-start" onClick={() => go('/sdp')}>
            <LayoutDashboard size={20} /> SDP pilot dashboard
          </button>
          <button type="button" className="btn btn-secondary !justify-start" onClick={() => go('/wallet/statement')}>
            <CloudSun size={20} /> Open monthly statement
          </button>
          <button type="button" className="btn btn-secondary !justify-start" onClick={() => go('/home/impact')}>
            <Leaf size={20} /> Open Township Impact
          </button>
          <button type="button" className="btn btn-secondary !justify-start" onClick={() => go('/sources')}>
            <BookOpen size={20} /> Sources
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className="btn btn-secondary" onClick={() => { s.replayOnboarding(); nav('/'); }}>
              Onboarding
            </button>
            <button type="button" className="btn btn-coral" onClick={() => { s.resetDemo(); go('/'); }}>
              <RotateCcw size={18} /> Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DemoSidePanel() {
  return (
    <aside className="hidden max-h-[calc(100dvh-48px)] w-[340px] shrink-0 overflow-y-auto rounded-[28px] border border-outline bg-page p-5 shadow-soft no-scrollbar lg:block">
      <h2 className="text-[20px] font-bold">Presenter controls</h2>
      <p className="mb-4 text-[14px] text-ink-muted">Not part of the app. On a phone, long-press the logo to open these.</p>
      <DemoControls />
      <div className="mt-5 rounded-2xl bg-surface p-4">
        <ShareQr />
      </div>
    </aside>
  );
}

export function DemoSheet() {
  const open = useStore((s) => s.demoOpen);
  const setOpen = useStore((s) => s.setDemoOpen);
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <button type="button" aria-label="Close demo controls" className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
      <div className="sheet-in relative max-h-[85%] overflow-y-auto rounded-t-[28px] bg-page p-5 pb-8 shadow-modal no-scrollbar">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[20px] font-bold">Presenter controls</h2>
          <button type="button" className="icon-btn" aria-label="Close" onClick={() => setOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <DemoControls onDone={() => setOpen(false)} />
      </div>
    </div>
  );
}

/** On the SDP dashboard: a small floating card so the presenter can carry on the pitch or go back. */
export function DashboardFloat() {
  const { pitch } = usePitch();
  if (!pitch.on) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 hidden w-[340px] max-w-[calc(100vw-32px)] shadow-modal md:block">
      <PitchPanel />
      <Link to="/" className="mt-2 block text-center text-[13px] font-bold text-ink-muted underline">
        Back to the phone
      </Link>
    </div>
  );
}
