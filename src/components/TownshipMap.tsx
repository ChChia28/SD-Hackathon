import { Bike, Dumbbell, Flower2, School, Snowflake, TrainFront, Trophy, Users, Waves, type LucideIcon } from 'lucide-react';
import { COOL_ROOMS, PLACES, WALKS } from '../data/sund';
import type { KeyboardEvent } from 'react';
import { FACILITIES, type Facility } from '../data/rewards';
import type { BayView } from '../store/hooks';
import { STATUS_META } from './status';

const FACILITY_ICON: Record<Facility['icon'], LucideIcon> = { dumbbell: Dumbbell, waves: Waves, users: Users, trophy: Trophy, flower: Flower2, bike: Bike };

export type MapMode = 'bays' | 'walk' | 'cool' | 'ebike' | 'facilities';

const onKey = (fn: () => void) => (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fn();
  }
};

/** Stylised map of the township: zones, roads, the CREAM 5 km zone, bay pins. */
export function TownshipMap({ views, home, mode, selected, onSelect, coolOpen = {} }: { views: BayView[]; home: { x: number; y: number }; mode: MapMode; selected?: string; onSelect: (id: string) => void; coolOpen?: Record<string, boolean> }) {
  return (
    <svg viewBox="0 0 360 430" className="h-full w-full" role="group" aria-label="Map of Elmina township">
      <rect width="360" height="430" fill="var(--color-surface)" />

      {/* zones */}
      <rect x="96" y="106" width="70" height="58" rx="18" fill="var(--color-leaf-soft)" />
      <ellipse cx="232" cy="266" rx="38" ry="22" fill="var(--color-sky-soft)" stroke="var(--color-sky-bright)" strokeWidth="1" />
      <rect x="258" y="70" width="78" height="62" rx="14" fill="var(--color-sunken)" />
      <rect x="40" y="186" width="70" height="56" rx="14" fill="var(--color-sunken)" />

      {/* roads */}
      <g fill="none" strokeLinecap="round">
        {['M-10 52 C 120 40, 240 70, 370 30', 'M-10 196 C 100 184, 260 200, 370 168', 'M192 -10 C 200 120, 180 300, 196 440', 'M60 440 C 80 340, 70 280, 100 196', 'M196 200 C 240 230, 280 300, 340 410'].map((d) => (
          <g key={d}>
            <path d={d} stroke="var(--color-outline)" strokeWidth="13" />
            <path d={d} stroke="#fff" strokeWidth="9" />
          </g>
        ))}
      </g>

      {/* CREAM radius */}
      <circle cx="190" cy="214" r="172" fill="none" stroke="var(--color-leaf-deep)" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.6" />
      <text x="190" y="36" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--color-leaf-ink)">
        CREAM 5 km zone
      </text>
      <text x="300" y="22" textAnchor="middle" fontSize="10" fill="var(--color-ink-muted)">
        Expressway
      </text>

      {/* labels */}
      <g fontSize="11" fill="var(--color-ink-muted)" fontWeight="700" textAnchor="middle">
        <text x="131" y="102">Central Park</text>
        <text x="297" y="146">Innovation Park</text>
        <text x="232" y="300">Lakeside</text>
        <text x="75" y="256">Clubhouse</text>
        <text x="196" y="214">Elmina Central</text>
        <text x="120" y="360">Elmina West</text>
        <text x="300" y="350">Elmina East</text>
      </g>

      {/* Landsat-style heat layer: hot roads and car parks rank the walkway routes */}
      {mode === 'walk' && (
        <g aria-hidden="true">
          <defs>
            <radialGradient id="hot">
              <stop offset="0" stopColor="var(--color-sun)" stopOpacity="0.32" />
              <stop offset="1" stopColor="var(--color-sun)" stopOpacity="0" />
            </radialGradient>
          </defs>
          {[
            [292, 306, 46],
            [190, 330, 34],
            [84, 318, 40],
            [200, 186, 40],
          ].map(([x, y, r]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="url(#hot)" />
          ))}
          <text x={14} y={420} fontSize="10" fill="var(--color-ink-muted)">Red = hottest surfaces (Landsat LST, schematic)</text>
        </g>
      )}

      {mode === 'walk' &&
        WALKS.map((w) => {
          const isSel = selected === w.id;
          return (
            <g key={w.id} role="button" tabIndex={0} aria-label={`${w.name}: ${w.from} to ${w.to}`} onClick={() => onSelect(w.id)} onKeyDown={onKey(() => onSelect(w.id))} style={{ cursor: 'pointer' }}>
              <path d={w.d} fill="none" stroke="transparent" strokeWidth="22" />
              <path d={w.d} fill="none" stroke={w.status === 'next' ? 'var(--color-sky)' : 'var(--color-outline-strong)'} strokeWidth={isSel ? 9 : 7} strokeLinecap="round" />
              <path d={w.d} fill="none" stroke={w.status === 'next' ? 'var(--color-sun-bright)' : '#fff'} strokeWidth="2" strokeDasharray="3 5" strokeLinecap="round" />
            </g>
          );
        })}

      {(mode === 'walk' || mode === 'cool') && (
        <g aria-hidden="true">
          <g transform={`translate(${PLACES.transit.x} ${PLACES.transit.y})`}>
            <rect x="-11" y="-11" width="22" height="22" rx="6" fill="var(--color-ink)" />
            <TrainFront x={-7} y={-7} size={14} color="#fff" strokeWidth={2.4} />
          </g>
          <g transform={`translate(${PLACES.school.x} ${PLACES.school.y})`}>
            <rect x="-11" y="-11" width="22" height="22" rx="6" fill="var(--color-ink-muted)" />
            <School x={-7} y={-7} size={14} color="#fff" strokeWidth={2.4} />
          </g>
          <text x={PLACES.transit.x} y={PLACES.transit.y + 24} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--color-ink-muted)">
            BUS
          </text>
        </g>
      )}

      {(mode === 'cool' || mode === 'walk') &&
        COOL_ROOMS.map((r) => {
          const isSel = selected === r.id;
          const open = coolOpen[r.id];
          const ring = open ? 'var(--color-berry)' : 'var(--color-outline-strong)';
          return (
            <g key={r.id} transform={`translate(${r.x} ${r.y}) scale(${isSel ? 1.25 : 1})`} role="button" tabIndex={0} aria-label={`${r.name}${open ? ', open' : ''}`} onClick={() => onSelect(r.id)} onKeyDown={onKey(() => onSelect(r.id))} style={{ cursor: 'pointer', transition: 'transform 240ms var(--ease-spring)' }}>
              <circle r="22" fill="transparent" />
              {open && <circle r="18" fill="var(--color-berry)" opacity="0.18" className="ring-pulse" />}
              <circle r="13" fill={isSel || open ? ring : '#fff'} stroke={ring} strokeWidth="2.5" />
              <Snowflake x={-8} y={-8} size={16} color={isSel || open ? '#fff' : ring} strokeWidth={2.4} />
            </g>
          );
        })}

      {/* you */}
      <g transform={`translate(${home.x} ${home.y})`} aria-label="You are here">
        <circle r="14" fill="var(--color-sky)" opacity="0.18" className="ring-pulse" />
        <circle r="7" fill="var(--color-sky)" stroke="#fff" strokeWidth="3" />
      </g>

      {mode === 'bays' &&
        views.map((v) => {
          const m = STATUS_META[v.status];
          const isSel = selected === v.bay.id;
          return (
            <g
              key={v.bay.id}
              transform={`translate(${v.bay.x} ${v.bay.y}) scale(${isSel ? 1.3 : 1})`}
              role="button"
              tabIndex={0}
              aria-label={`${v.bay.name}, ${m.label}`}
              onClick={() => onSelect(v.bay.id)}
              onKeyDown={onKey(() => onSelect(v.bay.id))}
              style={{ cursor: 'pointer', transition: 'transform 240ms var(--ease-spring)' }}
            >
              <circle cy="-20" r="24" fill="transparent" />
              <ellipse cy="1" rx="6" ry="2.5" fill="var(--color-ink)" opacity="0.15" />
              <path d="M0 0 C -4 -6 -14 -12 -14 -22 A 14 14 0 1 1 14 -22 C 14 -12 4 -6 0 0 Z" fill={m.color} stroke="#fff" strokeWidth="2.5" />
              <m.Icon x={-8} y={-30} size={16} color="#fff" strokeWidth={2.6} />
            </g>
          );
        })}

      {(mode === 'ebike' || mode === 'facilities') &&
        FACILITIES.filter((f) => (mode === 'ebike' ? f.kind === 'ebike' : f.kind === 'clubhouse')).map((f) => {
          const Icon = FACILITY_ICON[f.icon];
          const isSel = selected === f.id;
          const ring = f.kind === 'ebike' ? 'var(--color-leaf-deep)' : 'var(--color-sky-deep)';
          return (
            <g
              key={f.id}
              transform={`translate(${f.x} ${f.y}) scale(${isSel ? 1.25 : 1})`}
              role="button"
              tabIndex={0}
              aria-label={f.name}
              onClick={() => onSelect(f.id)}
              onKeyDown={onKey(() => onSelect(f.id))}
              style={{ cursor: 'pointer', transition: 'transform 240ms var(--ease-spring)' }}
            >
              <circle r="22" fill="transparent" />
              <circle r="14" fill={isSel ? ring : '#fff'} stroke={ring} strokeWidth="2.5" />
              <Icon x={-8} y={-8} size={16} color={isSel ? '#fff' : ring} strokeWidth={2.4} />
            </g>
          );
        })}
    </svg>
  );
}

export { FACILITY_ICON };
