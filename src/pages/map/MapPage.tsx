import { Sun } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BayRow } from '../../components/bay';
import { FacilityRow } from '../../components/facility';
import { TabHeader } from '../../components/shell';
import { STATUS_META } from '../../components/status';
import { TownshipMap, type MapMode } from '../../components/TownshipMap';
import { LinkButton, SectionTitle } from '../../components/ui';
import { CLUBHOUSE, EBIKES, bikesAvailable } from '../../data/rewards';
import { useBayViews, usePersona, type BayView } from '../../store/hooks';
import { COOL_ROOMS, isCoolOpen } from '../../data/sund';
import { useT } from '../../lib/i18n';
import { CoolList, WalkList } from './layers';
import { useStore } from '../../store/useStore';
import type { BayStatus, BayType } from '../../store/types';

const FILTERS: { id: string; label: string; test: (v: BayView) => boolean }[] = [
  { id: 'surplus', label: 'Surplus', test: (v) => v.status === 'surplus' },
  { id: 'available', label: 'Free now', test: (v) => v.free > 0 },
  { id: 'dc', label: 'Fast DC', test: (v) => v.bay.connectors.some((c) => c.kind === 'DC') },
  { id: 'saver', label: 'Saver OK', test: (v) => v.saverOk },
];
const TYPES: { id: BayType; label: string }[] = [
  { id: 'mall', label: 'Mall' },
  { id: 'office', label: 'Office' },
  { id: 'park', label: 'Park' },
  { id: 'clubhouse', label: 'Clubhouse' },
  { id: 'commercial', label: 'Shops' },
  { id: 'condo', label: 'Condo' },
  { id: 'petrol', label: 'Petrol' },
];
const MODES: { id: MapMode; label: string }[] = [
  { id: 'bays', label: 'Bays' },
  { id: 'walk', label: 'Walk' },
  { id: 'cool', label: 'Cool' },
  { id: 'ebike', label: 'eBike' },
];

export default function MapPage() {
  const persona = usePersona();
  const views = useBayViews();
  const simTime = useStore((s) => s.simTime);
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab');
  const mode: MapMode = tab === 'ebike' || tab === 'facilities' || tab === 'walk' || tab === 'cool' ? tab : 'bays';
  const [filters, setFilters] = useState<string[]>([]);
  const [type, setType] = useState<BayType | null>(null);
  const [selected, setSelected] = useState<string | undefined>(params.get('walk') ?? undefined);
  const heat = useStore((s) => s.heat.on);
  const t = useT();
  const coolOpen = Object.fromEntries(COOL_ROOMS.map((r) => [r.id, isCoolOpen(r, simTime, heat)]));

  const toggle = (id: string) => setFilters((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  const shown = views.filter((v) => filters.every((id) => FILTERS.find((f) => f.id === id)!.test(v)) && (!type || v.bay.type === type));
  const sel = views.find((v) => v.bay.id === selected);
  const list = mode === 'ebike' ? EBIKES : CLUBHOUSE;
  const ordered = selected ? [...list.filter((f) => f.id === selected), ...list.filter((f) => f.id !== selected)] : list;
  const totalBikes = EBIKES.reduce((n, f) => n + bikesAvailable(f, simTime), 0);

  return (
    <>
      <TabHeader title="Map" />
      <div className="flex flex-col gap-4 px-5 pb-8 pt-2">
        <div className="segmented" role="group" aria-label="Show">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={mode === m.id}
              onClick={() => {
                setParams(m.id === 'bays' ? {} : { tab: m.id });
                setSelected(undefined);
              }}
            >
              {t(m.label)}
            </button>
          ))}
        </div>

        {mode === 'bays' && (
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
            {FILTERS.map((f) => (
              <button key={f.id} type="button" className="chip" aria-pressed={filters.includes(f.id)} onClick={() => toggle(f.id)}>
                {f.id === 'surplus' && <Sun size={16} />}
                {f.label}
              </button>
            ))}
            {TYPES.map((t) => (
              <button key={t.id} type="button" className="chip" aria-pressed={type === t.id} onClick={() => setType(type === t.id ? null : t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        <div className="card aspect-[360/430] overflow-hidden">
          <TownshipMap views={shown} home={persona.home} mode={mode} selected={selected} coolOpen={coolOpen} onSelect={(id) => setSelected(id === selected ? undefined : id)} />
        </div>

        {mode === 'bays' && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[14px] text-ink-muted" aria-label="Legend">
            {(Object.keys(STATUS_META) as BayStatus[]).map((st) => {
              const m = STATUS_META[st];
              return (
                <span key={st} className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full text-white" style={{ background: m.color }}>
                    <m.Icon size={12} strokeWidth={3} />
                  </span>
                  {m.label}
                </span>
              );
            })}
          </div>
        )}

        {mode === 'bays' && sel && (
          <div className="rise-in flex flex-col gap-2">
            <BayRow v={sel} />
            <LinkButton to={sel.free > 0 ? `/charge/setup/${sel.bay.id}` : `/map/bay/${sel.bay.id}`} size="lg">
              {sel.free > 0 ? 'Charge here' : 'View bay'}
            </LinkButton>
          </div>
        )}

        {mode === 'walk' && <WalkList selected={selected} onSelect={setSelected} />}
        {mode === 'cool' && <CoolList />}
        {mode === 'walk' || mode === 'cool' ? null : mode === 'bays' ? (
          <section>
            <SectionTitle>{shown.length} SunD Bays · nearest first</SectionTitle>
            <div className="flex flex-col gap-2">
              {shown.map((v) => (
                <BayRow key={v.bay.id} v={v} />
              ))}
              {!shown.length && <p className="py-6 text-center text-ink-muted">No matches. Remove a filter.</p>}
            </div>
          </section>
        ) : (
          <section>
            <SectionTitle>{mode === 'ebike' ? `SunD eBike · ${totalBikes} bikes free` : 'Clubhouse · pay with credits'}</SectionTitle>
            <div className="flex flex-col gap-2">
              {ordered.map((f) => (
                <FacilityRow key={f.id} f={f} active={f.id === selected} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
