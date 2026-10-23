import { ChevronRight } from 'lucide-react';
import { BAY_TYPE_LABEL } from '../data/bays';
import { fmt } from '../lib/format';
import { bonusRateFor, usesCredits } from '../lib/pricing';
import { useProfile, type BayView } from '../store/hooks';
import { useStore } from '../store/useStore';
import { STATUS_META } from './status';
import { Card } from './ui';

/** What a charge costs this user at this bay, right now. */
export function PriceTag({ v, align = 'right' }: { v: BayView; align?: 'left' | 'right' }) {
  const persona = useStore((s) => s.persona);
  const prof = useProfile();
  const bonus = bonusRateFor(persona, v.status, v.solarPct);
  const cls = align === 'right' ? 'text-right' : '';
  if (usesCredits(persona) && prof.sc >= v.rate)
    return (
      <div className={cls}>
        <div className="font-bold leading-6 tabular text-sun-ink">{v.rate.toFixed(2)} SC/kWh</div>
        {bonus > 0 ? <div className="text-[14px] font-bold text-berry-ink">+{Math.round(bonus * 100)}% bonus credits</div> : <div className="text-[14px] text-ink-muted">paid in credits, no cash</div>}
      </div>
    );
  return (
    <div className={cls}>
      <div className="font-bold leading-6 tabular">RM {v.rate.toFixed(2)}/kWh</div>
      {v.discount > 0 ? (
        <div className="text-[14px] font-bold text-leaf-ink">{v.discount}% off{v.status === 'surplus' ? ' · surplus' : ''}</div>
      ) : v.saverOk ? (
        <div className="text-[14px] text-ink-muted">Saver Credits OK</div>
      ) : (
        <div className="text-[14px] text-ink-muted">Standard rate</div>
      )}
    </div>
  );
}

/** One-line price summary for list rows. */
function PriceLine({ v }: { v: BayView }) {
  const persona = useStore((s) => s.persona);
  const prof = useProfile();
  const bonus = bonusRateFor(persona, v.status, v.solarPct);
  if (usesCredits(persona) && prof.sc >= v.rate)
    return (
      <div className="truncate text-[14px]">
        <span className="font-bold text-sun-ink tabular">{v.rate.toFixed(2)} SC/kWh</span>
        {bonus > 0 && <span className="font-bold text-berry-ink"> · +{Math.round(bonus * 100)}% bonus</span>}
      </div>
    );
  return (
    <div className="truncate text-[14px]">
      <span className="font-bold tabular">RM {v.rate.toFixed(2)}/kWh</span>
      {v.discount > 0 ? <span className="font-bold text-leaf-ink"> · {v.discount}% off</span> : v.saverOk && <span className="text-ink-muted"> · Saver OK</span>}
    </div>
  );
}

export function BayRow({ v, to }: { v: BayView; to?: string }) {
  const m = STATUS_META[v.status];
  return (
    <Card to={to ?? `/map/bay/${v.bay.id}`} className="flex items-center gap-3 p-3.5">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white" style={{ background: m.color }} aria-hidden="true">
        <m.Icon size={22} strokeWidth={2.5} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate font-bold leading-6">{v.bay.name}</div>
        <div className="truncate text-[14px] text-ink-muted">
          {fmt(v.distanceKm)} km · {m.label} · {v.free}/{v.total} free
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sky-soft">
            <span className="block h-full rounded-full bg-leaf transition-[width] duration-500" style={{ width: `${v.live.soc}%` }} />
          </div>
          <span className="text-[13px] font-bold text-ink-muted tabular">{Math.round(v.live.soc)}% solar</span>
        </div>
        <div className="mt-1">
          <PriceLine v={v} />
        </div>
      </div>
      <ChevronRight size={20} className="shrink-0 text-ink-subtle" />
    </Card>
  );
}

export const bayTypeLabel = (v: BayView) => BAY_TYPE_LABEL[v.bay.type];
