import type { BayStatus } from '../store/types';
import { STATUS_META } from './status';

/** Rooftop with panels; energy dashes flow to the house while producing. */
export function HouseSolar({ kw, kWp, variant = 'house' }: { kw: number; kWp: number; variant?: 'house' | 'canopy' }) {
  const producing = kw > 0.05;
  const strength = Math.min(1, kw / Math.max(0.1, kWp * 0.62));
  return (
    <svg viewBox="0 0 120 96" width={120} height={96} aria-hidden="true">
      <g opacity={producing ? 1 : 0.35}>
        <circle cx="96" cy="20" r={9 + strength * 3} fill="var(--color-sun)" />
        <g className={producing ? 'spin-slow' : undefined} stroke="var(--color-sun)" strokeWidth="2.5" strokeLinecap="round">
          <path d="M96 3v4M96 33v4M79 20h4M109 20h4M84 8l3 3M105 29l3 3M84 32l3-3M105 11l3-3" />
        </g>
      </g>
      {variant === 'house' ? (
        <>
          <path d="M14 52 48 26l34 26" fill="none" stroke="var(--color-ink)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M22 48 48 28l26 20z" fill="var(--color-sky-deep)" />
          <g stroke="var(--color-sky-bright)" strokeWidth="1">
            <path d="M30 42 48 28M38 46 56 32M48 28l18 14M35 38h26M28 44h40" />
          </g>
          <rect x="22" y="52" width="52" height="34" rx="3" fill="var(--color-page)" stroke="var(--color-ink)" strokeWidth="3" />
          <rect x="42" y="66" width="12" height="20" rx="2" fill="var(--color-sky-soft)" stroke="var(--color-ink)" strokeWidth="2" />
          <path d="M76 86h30" stroke="var(--color-ink-faint)" strokeWidth="3" strokeLinecap="round" />
          {producing && <path d="M68 40 C 90 44, 96 60, 98 78" fill="none" stroke="var(--color-leaf-deep)" strokeWidth="2.5" strokeLinecap="round" className="flow" />}
          <rect x="88" y="72" width="18" height="12" rx="3" fill="var(--color-leaf-soft)" stroke="var(--color-leaf-deep)" strokeWidth="2" />
          <path d="M96 75l-3 4h4l-2 3" stroke="var(--color-leaf-deep)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <path d="M10 40h76l-6-12H16z" fill="var(--color-sky-deep)" />
          <g stroke="var(--color-sky-bright)" strokeWidth="1">
            <path d="M29 28l-3 12M48 28v12M67 28l3 12M13 34h70" />
          </g>
          <path d="M18 40v44M78 40v44" stroke="var(--color-ink)" strokeWidth="3" strokeLinecap="round" />
          <rect x="26" y="62" width="44" height="16" rx="7" fill="var(--color-sky-soft)" stroke="var(--color-ink)" strokeWidth="2.5" />
          <circle cx="36" cy="80" r="4" fill="var(--color-ink)" />
          <circle cx="60" cy="80" r="4" fill="var(--color-ink)" />
          {producing && <path d="M60 40 C 66 50, 72 58, 72 64" fill="none" stroke="var(--color-leaf-deep)" strokeWidth="2.5" strokeLinecap="round" className="flow" />}
          <path d="M6 86h108" stroke="var(--color-ink-faint)" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

/** Hero illustration for a charging bay: solar canopy, battery level, cars. */
export function BayHero({ status, soc, daylight, ports }: { status: BayStatus; soc: number; daylight: boolean; ports: number }) {
  const color = STATUS_META[status].color;
  const n = Math.min(4, ports);
  const level = Math.max(0, Math.min(1, soc / 100));
  return (
    <svg viewBox="0 0 360 170" className="w-full" role="img" aria-label={`Solar canopy, battery ${Math.round(soc)}%`}>
      <rect width="360" height="170" fill={daylight ? 'var(--color-sky-soft)' : '#1E293B'} />
      {daylight ? (
        <g>
          <circle cx="312" cy="36" r="16" fill="var(--color-sun)" />
          <g className="spin-slow" stroke="var(--color-sun)" strokeWidth="3" strokeLinecap="round">
            <path d="M312 10v5M312 57v5M286 36h5M333 36h5M294 18l4 4M326 50l4 4M294 54l4-4M326 22l4-4" />
          </g>
        </g>
      ) : (
        <g fill="#E2E8F0">
          <path d="M318 22a14 14 0 1 0 12 22 11 11 0 0 1-12-22z" />
          <circle cx="60" cy="24" r="1.5" />
          <circle cx="140" cy="16" r="1.2" />
          <circle cx="220" cy="30" r="1.5" />
        </g>
      )}
      <rect y="140" width="360" height="30" fill={daylight ? '#E2E8F0' : '#334155'} />
      <path d="M24 74h272l-14-22H38z" fill="var(--color-sky-deep)" />
      <g stroke="var(--color-sky-bright)" strokeWidth="1.2">
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M${52 + i * 28} 52l-3 22`} />
        ))}
        <path d="M31 63h258" />
      </g>
      <g transform="translate(130 36)">
        <rect width="100" height="22" rx="11" fill="var(--color-page)" stroke="var(--color-sky-deep)" strokeWidth="2" />
        <text x="50" y="15.5" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--color-ink)" fontFamily="var(--font-display)">
          Sun<tspan fill="var(--color-sky)">D</tspan> Bay
        </text>
      </g>
      {[40, 280].map((x) => (
        <path key={x} d={`M${x} 74v66`} stroke={daylight ? 'var(--color-ink)' : '#CBD5E1'} strokeWidth="4" strokeLinecap="round" />
      ))}
      {Array.from({ length: n }, (_, i) => {
        const x = 56 + i * 56;
        return (
          <g key={i}>
            <rect x={x} y="112" width="44" height="20" rx="8" fill={i % 2 ? 'var(--color-page)' : 'var(--color-sky-bright)'} stroke={daylight ? 'var(--color-ink)' : '#CBD5E1'} strokeWidth="2.5" />
            <circle cx={x + 11} cy="134" r="5" fill="var(--color-ink)" />
            <circle cx={x + 33} cy="134" r="5" fill="var(--color-ink)" />
          </g>
        );
      })}
      <g transform="translate(300 92)">
        <rect width="40" height="48" rx="6" fill="var(--color-page)" stroke={daylight ? 'var(--color-ink)' : '#CBD5E1'} strokeWidth="2.5" />
        <rect x="14" y="-5" width="12" height="6" rx="2" fill={daylight ? 'var(--color-ink)' : '#CBD5E1'} />
        <rect x="5" y={5 + 38 * (1 - level)} width="30" height={38 * level} rx="3" fill={color} />
        <text x="20" y="64" textAnchor="middle" fontSize="12" fontWeight="700" fill={daylight ? 'var(--color-ink)' : '#F8FAFC'}>
          {Math.round(soc)}%
        </text>
      </g>
    </svg>
  );
}
