import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cx } from '../lib/format';

type Variant = 'primary' | 'secondary' | 'leaf' | 'ghost' | 'coral' | 'red' | 'onnavy';

export function Button({ variant = 'primary', size, className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'lg' }) {
  return <button className={cx('btn', `btn-${variant}`, size === 'lg' && 'btn-lg', className)} {...rest} />;
}

export function LinkButton({ to, variant = 'primary', size, className, children }: { to: string; variant?: Variant; size?: 'lg'; className?: string; children: ReactNode }) {
  return (
    <Link to={to} className={cx('btn', `btn-${variant}`, size === 'lg' && 'btn-lg', className)}>
      {children}
    </Link>
  );
}

/** Light tints for large cards: same family as the palette, just enough to separate sections. */
const WASH = {
  sky: 'bg-sky-wash border-sky-soft',
  leaf: 'bg-leaf-wash border-leaf-soft',
  sun: 'bg-sun-wash border-sun-soft',
  berry: 'bg-berry-wash border-berry-soft',
} as const;
export type Wash = keyof typeof WASH;

export function Card({ className, children, to, onClick, tone }: { className?: string; children: ReactNode; to?: string; onClick?: () => void; tone?: Wash }) {
  const cls = cx('card', tone && WASH[tone], className);
  if (to)
    return (
      <Link to={to} className={cx('card-link', cls)}>
        {children}
      </Link>
    );
  if (onClick)
    return (
      <button type="button" onClick={onClick} className={cx('card-link w-full text-left', cls)}>
        {children}
      </button>
    );
  return <div className={cls}>{children}</div>;
}

export function ProgressBar({ value, className, color }: { value: number; className?: string; color?: string }) {
  const pct = Math.max(0, Math.min(100, value * 100));
  return (
    <div className={cx('progress', className)} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

type Tone = 'sky' | 'leaf' | 'sun' | 'coral' | 'berry' | 'slate';
const TONES: Record<Tone, string> = {
  sky: 'bg-sky-soft text-sky-deep',
  leaf: 'bg-leaf-soft text-leaf-ink',
  sun: 'bg-sun-soft text-sun-ink',
  coral: 'bg-coral-soft text-coral-ink',
  berry: 'bg-berry-soft text-berry-ink',
  slate: 'bg-sunken text-ink-muted',
};

export function Pill({ tone = 'sky', icon, children, className }: { tone?: Tone; icon?: ReactNode; children: ReactNode; className?: string }) {
  return <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[14px] font-bold leading-6 whitespace-nowrap', TONES[tone], className)}>{icon}{children}</span>;
}

export function IconBubble({ tone = 'sky', children, size = 44 }: { tone?: Tone; children: ReactNode; size?: number }) {
  return (
    <span className={cx('inline-flex shrink-0 items-center justify-center rounded-full', TONES[tone])} style={{ width: size, height: size }}>
      {children}
    </span>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="text-[19px] font-bold leading-7 text-ink">{children}</h2>
      {action}
    </div>
  );
}

export function SeeAll({ to, children = 'See all' }: { to: string; children?: ReactNode }) {
  return (
    <Link to={to} className="inline-flex min-h-11 items-center gap-0.5 rounded-lg px-2 text-[15px] font-bold text-sky-deep hover:bg-sky-soft">
      {children}
      <ChevronRight size={18} />
    </Link>
  );
}

/** Header for sub-pages: back button and title. */
export function PageHeader({ title, right, back }: { title: string; right?: ReactNode; back?: string }) {
  const nav = useNavigate();
  return (
    <header className="sticky top-0 z-10 flex min-h-16 items-center gap-1 border-b border-outline bg-page/95 px-2 backdrop-blur">
      <button type="button" className="icon-btn !h-14 !w-14" aria-label="Back" onClick={() => (back ? nav(back) : nav(-1))}>
        <ChevronLeft size={28} />
      </button>
      <h1 className="flex-1 truncate text-[20px] font-bold">{title}</h1>
      {right}
    </header>
  );
}

export function Row({ label, value, strong, tone }: { label: ReactNode; value: ReactNode; strong?: boolean; tone?: 'leaf' | 'berry' | 'coral' | 'sun' }) {
  const toneCls = tone === 'leaf' ? 'text-leaf-ink' : tone === 'berry' ? 'text-berry-ink' : tone === 'coral' ? 'text-coral-ink' : tone === 'sun' ? 'text-sun-ink' : 'text-ink';
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-ink-muted">{label}</span>
      <span className={cx('tabular text-right', strong ? 'font-bold text-[17px]' : 'font-bold', toneCls)}>{value}</span>
    </div>
  );
}

const STAT_BG: Record<Wash | 'plain', string> = { plain: 'bg-surface', sky: 'bg-sky-wash', leaf: 'bg-leaf-wash', sun: 'bg-sun-wash', berry: 'bg-berry-wash' };

export function Stat({ label, value, unit, icon, tone = 'plain' }: { label: string; value: ReactNode; unit?: string; icon?: ReactNode; tone?: Wash | 'plain' }) {
  return (
    <div className={cx('rounded-2xl p-3', STAT_BG[tone])}>
      <div className="flex items-center gap-1.5 text-[14px] text-ink-muted">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 font-display text-[22px] font-bold leading-8 tabular">
        {value}
        {unit && <span className="ml-1 text-[15px] font-semibold text-ink-muted">{unit}</span>}
      </div>
    </div>
  );
}

/** Earned achievement: sun-filled circle with a star. Locked: outlined. */
export function StarBadge({ earned, size = 64, glow }: { earned: boolean; size?: number; glow?: boolean }) {
  return (
    <span
      className={cx('inline-flex shrink-0 items-center justify-center rounded-full', earned ? 'bg-sun text-white star-pop' : 'border-2 border-dashed border-ink-faint bg-surface text-ink-faint', glow && earned && 'glow-fade')}
      style={{ width: size, height: size }}
    >
      <Star size={size * 0.45} fill="currentColor" strokeWidth={2} />
    </span>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={cx('relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors', on ? 'bg-sky' : 'bg-ink-faint')}
    >
      <span className={cx('inline-block h-6 w-6 rounded-full bg-white shadow transition-transform duration-200', on ? 'translate-x-7' : 'translate-x-1')} />
    </button>
  );
}

export function Avatar({ initials, size = 56 }: { initials: string; size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-sky-soft font-display font-bold text-sky-deep"
      style={{ width: size, height: size, boxShadow: '0 0 0 3px #fff, 0 0 0 5px var(--color-sky)', fontSize: size * 0.36 }}
    >
      {initials}
    </span>
  );
}
