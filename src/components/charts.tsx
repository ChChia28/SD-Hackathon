import type { ReactNode } from 'react';

interface Pt {
  x: number;
  y: number;
}

/** Area chart: solid up to `nowX`, dashed forecast after. */
export function AreaChart({ points, nowX, xMin, xMax, height = 150, ticks, unit = 'kW' }: { points: Pt[]; nowX?: number; xMin: number; xMax: number; height?: number; ticks: { x: number; label: string }[]; unit?: string }) {
  const W = 330;
  const H = height;
  const pad = { l: 6, r: 6, t: 16, b: 26 };
  const yMax = Math.max(0.1, ...points.map((p) => p.y)) * 1.15;
  const sx = (x: number) => pad.l + ((x - xMin) / (xMax - xMin)) * (W - pad.l - pad.r);
  const sy = (y: number) => H - pad.b - (y / yMax) * (H - pad.t - pad.b);
  const line = (ps: Pt[]) => ps.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ');
  const past = nowX === undefined ? points : points.filter((p) => p.x <= nowX);
  const future = nowX === undefined ? [] : points.filter((p) => p.x >= nowX);
  const area = past.length > 1 ? `${line(past)} L${sx(past[past.length - 1].x)},${sy(0)} L${sx(past[0].x)},${sy(0)} Z` : '';
  const nowY = nowX !== undefined ? interp(points, nowX) : 0;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Solar output today, peak ${yMax.toFixed(1)} ${unit}`}>
      <line x1={pad.l} x2={W - pad.r} y1={sy(0)} y2={sy(0)} stroke="var(--color-outline)" />
      {area && <path d={area} fill="var(--color-leaf-soft)" />}
      {past.length > 1 && <path d={line(past)} fill="none" stroke="var(--color-leaf-deep)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />}
      {future.length > 1 && <path d={line(future)} fill="none" stroke="var(--color-ink-faint)" strokeWidth={2} strokeDasharray="5 5" />}
      {nowX !== undefined && nowX >= xMin && nowX <= xMax && (
        <g>
          <line x1={sx(nowX)} x2={sx(nowX)} y1={pad.t - 6} y2={sy(0)} stroke="var(--color-sky)" strokeDasharray="3 3" />
          <circle cx={sx(nowX)} cy={sy(nowY)} r={5} fill="var(--color-page)" stroke="var(--color-leaf-deep)" strokeWidth={3} />
        </g>
      )}
      {ticks.map((t) => (
        <text key={t.x} x={sx(t.x)} y={H - 6} textAnchor="middle" fontSize={12} fill="var(--color-ink-muted)">
          {t.label}
        </text>
      ))}
    </svg>
  );
}

function interp(points: Pt[], x: number) {
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    if (x >= a.x && x <= b.x) return a.y + ((b.y - a.y) * (x - a.x)) / (b.x - a.x || 1);
  }
  return 0;
}

export function BarChart({ values, labels, highlight, height = 140, color = 'var(--color-leaf)', dim = 'var(--color-sky-soft)', label }: { values: number[]; labels: string[]; highlight?: number; height?: number; color?: string; dim?: string; label: string }) {
  const W = 330;
  const H = height;
  const padB = 24;
  const max = Math.max(0.1, ...values);
  const slot = W / values.length;
  const bw = Math.min(28, slot * 0.62);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={label}>
      {values.map((v, i) => {
        const h = Math.max(3, (v / max) * (H - padB - 8));
        const x = i * slot + (slot - bw) / 2;
        const isHi = highlight === undefined || highlight === i;
        return (
          <g key={i}>
            <rect x={x} y={H - padB - h} width={bw} height={h} rx={Math.min(6, bw / 2)} fill={isHi ? color : dim} />
            {labels[i] && (
              <text x={x + bw / 2} y={H - 6} textAnchor="middle" fontSize={12} fill={highlight === i ? 'var(--color-ink)' : 'var(--color-ink-muted)'} fontWeight={highlight === i ? 700 : 400}>
                {labels[i]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function Ring({ value, size = 200, stroke = 16, color = 'var(--color-leaf)', track = 'var(--color-sky-soft)', children, pulse }: { value: number; size?: number; stroke?: number; color?: string; track?: string; children?: ReactNode; pulse?: boolean }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v)} className={pulse ? 'ring-pulse' : undefined} style={{ transition: 'stroke-dashoffset 480ms ease-out' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

/** Two-part bar: solar vs grid share. */
export function MixBar({ solarPct }: { solarPct: number }) {
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-sunken">
        <span className="h-full bg-leaf transition-[width] duration-500" style={{ width: `${solarPct}%` }} />
        <span className="h-full bg-ink-faint" style={{ width: `${100 - solarPct}%` }} />
      </div>
      <div className="mt-1.5 flex justify-between text-[14px]">
        <span className="flex items-center gap-1.5 font-bold text-leaf-ink">
          <span className="h-2.5 w-2.5 rounded-full bg-leaf" /> Solar {solarPct}%
        </span>
        <span className="flex items-center gap-1.5 text-ink-muted">
          <span className="h-2.5 w-2.5 rounded-full bg-ink-faint" /> Grid {100 - solarPct}%
        </span>
      </div>
    </div>
  );
}
