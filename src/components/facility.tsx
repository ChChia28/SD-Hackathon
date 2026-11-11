import { ChevronRight, Lock } from 'lucide-react';
import { bikesAvailable, type Facility } from '../data/rewards';
import { cx, fmt } from '../lib/format';
import { facilityPayment } from '../lib/pricing';
import { useProfile } from '../store/hooks';
import { useStore } from '../store/useStore';
import { FACILITY_ICON } from './TownshipMap';
import { Card } from './ui';

/** Docked bikes as filled slots, so availability reads at a glance. */
export function DockSlots({ bikes, docks }: { bikes: number; docks: number }) {
  return (
    <span className="flex items-center gap-[2px]" aria-label={`${bikes} of ${docks} bikes available`}>
      {Array.from({ length: docks }, (_, i) => (
        <span key={i} className={cx('h-3 w-1.5 rounded-[2px]', i < bikes ? 'bg-leaf' : 'border border-ink-faint')} />
      ))}
    </span>
  );
}

const KIND_TINT = { ebike: 'bg-leaf-soft text-leaf-deep', clubhouse: 'bg-berry-soft text-berry-ink', parking: 'bg-sky-soft text-sky-deep', shop: 'bg-sky-soft text-sky-deep' };

export function FacilityRow({ f, active }: { f: Facility; active?: boolean }) {
  const persona = useStore((s) => s.persona);
  const simTime = useStore((s) => s.simTime);
  const prof = useProfile();
  const Icon = FACILITY_ICON[f.icon];
  const ebike = f.kind === 'ebike';
  const pay = facilityPayment(f, persona, prof);
  const locked = pay.via === 'locked';
  const bikes = ebike ? bikesAvailable(f, simTime) : 0;
  const short = pay.via === 'sc' && !pay.enough ? pay.price - prof.sc : 0;

  return (
    <Card to={`/rewards/redeem/${f.id}`} className={cx('flex items-center gap-3 p-3.5', active && 'card-active', locked && 'opacity-60')}>
      <span className={cx('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl', KIND_TINT[f.kind])}>
        <Icon size={22} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate font-bold leading-6">{ebike ? f.name.replace('SunD eBike · ', '') : f.item}</div>
        {ebike ? (
          <div className="mt-1 flex items-center gap-2">
            <DockSlots bikes={bikes} docks={f.docks ?? 0} />
            <span className="whitespace-nowrap text-[13px] font-bold text-leaf-ink tabular">{bikes} bikes</span>
          </div>
        ) : (
          <div className={cx('truncate text-[14px]', short > 0 ? 'font-bold text-coral-ink' : 'text-ink-muted')}>{short > 0 ? `${fmt(short)} SC short` : f.note}</div>
        )}
      </div>
      <span className="shrink-0 text-right font-bold tabular">
        {pay.via === 'locked' ? (
          <Lock size={18} className="text-sun-deep" />
        ) : pay.via === 'pass' ? (
          <span className="text-leaf-ink">Pass</span>
        ) : pay.via === 'sc' ? (
          <span className="text-sun-ink">{pay.price} SC</span>
        ) : (
          `RM ${pay.price.toFixed(0)}`
        )}
      </span>
      <ChevronRight size={18} className="shrink-0 text-ink-subtle" />
    </Card>
  );
}
