import { ArrowRight, Coins, Leaf, Scale } from 'lucide-react';
import { Fragment, type ReactNode } from 'react';
import { GRID_BACKUP_SOC, SAVER_MIN_SOC, SURPLUS_SOC } from '../data/constants';
import { cx } from '../lib/format';
import { IconBubble } from './ui';

type Tone = 'sky' | 'leaf' | 'sun' | 'coral' | 'berry' | 'slate';
type Sep = 'arrow' | '=' | '×' | '+';

export interface FlowItem {
  icon: ReactNode;
  label: ReactNode;
  sub?: string;
  tone: Tone;
}

/** Icon steps joined by arrows or operators, used in place of explanatory sentences. */
export function FlowRow({ items, sep = 'arrow', size = 52 }: { items: FlowItem[]; sep?: Sep | Sep[]; size?: number }) {
  return (
    <div className="flex items-start justify-center gap-1.5">
      {items.map((it, i) => {
        const s = Array.isArray(sep) ? sep[i - 1] : sep;
        return (
          <Fragment key={i}>
            {i > 0 && (
              <span className="flex shrink-0 items-center text-ink-subtle" style={{ height: size }} aria-hidden="true">
                {s === 'arrow' ? <ArrowRight size={20} /> : <span className="font-display text-[22px] font-bold">{s}</span>}
              </span>
            )}
            <div className="flex min-w-0 flex-1 flex-col items-center text-center">
              <IconBubble tone={it.tone} size={size}>
                {it.icon}
              </IconBubble>
              <div className="mt-1.5 font-display text-[17px] font-bold leading-6 tabular">{it.label}</div>
              {it.sub && <div className="text-[14px] leading-5 text-ink-muted">{it.sub}</div>}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}

/** Three-up icon tiles with short labels. */
export function IconTiles({ items }: { items: { icon: ReactNode; title: string; tone: Tone }[] }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((it) => (
        <div key={it.title} className="flex flex-col items-center gap-2 rounded-2xl bg-page/70 p-3 text-center">
          <IconBubble tone={it.tone}>{it.icon}</IconBubble>
          <span className="text-[14px] font-bold leading-5">{it.title}</span>
        </div>
      ))}
    </div>
  );
}

export const WhyCredits = () => (
  <IconTiles
    items={[
      { icon: <Coins size={22} />, title: 'Worth more as credits', tone: 'sun' },
      { icon: <Scale size={22} />, title: 'Never paid out as cash', tone: 'sky' },
      { icon: <Leaf size={22} />, title: 'Spent on green only', tone: 'leaf' },
    ]}
  />
);

const ZONES = [
  { from: 0, to: GRID_BACKUP_SOC, label: 'Grid', bar: 'bg-ink-faint', text: 'text-ink-muted' },
  { from: GRID_BACKUP_SOC, to: SAVER_MIN_SOC, label: 'Normal', bar: 'bg-sky-soft', text: 'text-sky-deep' },
  { from: SAVER_MIN_SOC, to: SURPLUS_SOC, label: 'Saver', bar: 'bg-leaf-soft', text: 'text-leaf-ink' },
  { from: SURPLUS_SOC, to: 100, label: 'Surplus', bar: 'bg-leaf', text: 'text-leaf-ink' },
];

/** Battery level against the price thresholds, instead of a sentence explaining them. */
export function SocGauge({ soc }: { soc: number }) {
  const active = ZONES.findIndex((z) => soc >= z.from && soc < z.to + (z.to === 100 ? 1 : 0));
  return (
    <div>
      <div className="relative">
        <div className="flex h-4 gap-0.5 overflow-hidden rounded-full">
          {ZONES.map((z) => (
            <span key={z.label} className={z.bar} style={{ width: `${z.to - z.from}%` }} />
          ))}
        </div>
        <span
          className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-ink bg-page shadow transition-[left] duration-500"
          style={{ left: `${Math.max(3, Math.min(97, soc))}%` }}
          aria-hidden="true"
        />
      </div>
      <div className="mt-1.5 flex gap-0.5">
        {ZONES.map((z, i) => (
          <span key={z.label} className={cx('text-center text-[13px] leading-5', i === active ? `font-bold ${z.text}` : 'text-ink-subtle')} style={{ width: `${z.to - z.from}%` }}>
            {z.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Generate → use → reward loop for onboarding and Township Impact. */
export function LoopGraphic({ nodes }: { nodes: [FlowItem, FlowItem, FlowItem] }) {
  // Node centres sit on the circle (top, lower-left, lower-right) so labels fall clear of the line.
  const C = { x: 130, y: 112, r: 80 };
  const pos = [-90, 150, 30].map((deg) => ({ x: C.x + C.r * Math.cos((deg * Math.PI) / 180), y: C.y + C.r * Math.sin((deg * Math.PI) / 180) }));
  return (
    <div className="relative mx-auto h-[232px] w-[260px]">
      <svg viewBox="0 0 260 232" className="absolute inset-0" aria-hidden="true">
        <circle cx={C.x} cy={C.y} r={C.r} fill="none" stroke="var(--color-leaf-deep)" strokeWidth="3" className="flow" />
      </svg>
      {nodes.map((n, i) => (
        <div key={i} className="absolute flex w-[100px] -translate-x-1/2 -translate-y-8 flex-col items-center text-center" style={{ left: pos[i].x, top: pos[i].y }}>
          <span className="rounded-full bg-sky-wash p-1">
            <IconBubble tone={n.tone} size={56}>
              {n.icon}
            </IconBubble>
          </span>
          <span className="mt-0.5 text-[15px] font-bold leading-5">{n.label}</span>
        </div>
      ))}
    </div>
  );
}
