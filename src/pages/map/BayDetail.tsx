import { Navigation, Zap } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PriceTag } from '../../components/bay';
import { BarChart, MixBar } from '../../components/charts';
import { BayHero } from '../../components/illustrations';
import { StatusPill } from '../../components/status';
import { FacilityRow } from '../../components/facility';
import { Button, Card, PageHeader, Pill, SectionTitle } from '../../components/ui';
import { SocGauge } from '../../components/visual';
import { EBIKES } from '../../data/rewards';
import { BAY_TYPE_LABEL } from '../../data/bays';
import { MARKET_DC, PUBLIC_PRICE } from '../../data/constants';
import { fmt } from '../../lib/format';
import { bonusRateFor, usesCredits } from '../../lib/pricing';
import { demandFactor } from '../../sim/bays';
import { hourOf, isDaylight } from '../../sim/solar';
import { useBayView, useBayViews } from '../../store/hooks';
import { useStore } from '../../store/useStore';

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6);

export default function BayDetail() {
  const { id } = useParams();
  const v = useBayView(id);
  const views = useBayViews();
  const persona = useStore((s) => s.persona);
  const simTime = useStore((s) => s.simTime);
  const toast = useStore((s) => s.toast);
  const nav = useNavigate();
  if (!v) return <PageHeader title="Bay not found" />;

  const h = hourOf(simTime);
  const bonus = bonusRateFor(persona, v.status, v.solarPct);
  const alt = views.find((o) => o.bay.id !== v.bay.id && o.free > 0);
  const dock = [...EBIKES].sort((a, b) => Math.hypot(a.x - v.bay.x, a.y - v.bay.y) - Math.hypot(b.x - v.bay.x, b.y - v.bay.y))[0];

  return (
    <>
      <PageHeader title={v.bay.name} />
      <BayHero status={v.status} soc={v.live.soc} daylight={isDaylight(h)} ports={v.total} />
      <div className="flex flex-col gap-5 px-5 pb-10 pt-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={v.status} />
            {v.bay.outsideZone && <Pill tone="slate">Partner site · beyond township</Pill>}
          </div>
          <h1 className="mt-2 text-[26px] font-bold leading-8">{v.bay.name}</h1>
          <div className="text-ink-muted">
            {BAY_TYPE_LABEL[v.bay.type]} · {v.bay.area} · {fmt(v.distanceKm)} km away
          </div>
        </div>

        <Card tone="leaf" className="p-5">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="font-bold">Solar stock</span>
            <span className="font-display text-[24px] font-bold tabular">{Math.round(v.live.soc)}%</span>
          </div>
          <SocGauge soc={v.live.soc} />
          <div className="mt-5 mb-2 flex items-center justify-between">
            <span className="font-bold">Energy now</span>
            <span className="text-[14px] text-ink-muted">{v.source}</span>
          </div>
          <MixBar solarPct={v.solarPct} />
        </Card>

        <Card tone="sky" className="p-5">
          <div className="mb-2 font-bold">Price for you</div>
          <PriceTag v={v} align="left" />
          <div className="mt-3 flex flex-wrap gap-2">
            {usesCredits(persona) ? (
              <>
                <Pill tone="slate">1 SC = RM 1 · no cash needed</Pill>
              </>
            ) : (
              <>
                {v.discount > 0 && (
                  <Pill tone="slate">
                    Usually <s className="ml-1">RM {PUBLIC_PRICE.toFixed(2)}</s>
                  </Pill>
                )}
                {v.saverOk && <Pill tone="leaf">Saver OK</Pill>}
                <Pill tone="slate">Market DC RM {MARKET_DC.low.toFixed(2)}–{MARKET_DC.high.toFixed(2)}</Pill>
              </>
            )}
          </div>
        </Card>

        <section>
          <SectionTitle>Chargers</SectionTitle>
          <Card className="divide-y divide-outline">
            {v.bay.connectors.map((c) => {
              const free = c.count - (v.live.busy[c.id] ?? 0);
              return (
                <div key={c.id} className="flex min-h-16 items-center gap-3 px-4">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.kind === 'DC' ? 'bg-berry-soft text-berry-ink' : 'bg-sky-soft text-sky-deep'}`}>
                    <Zap size={20} />
                  </span>
                  <div className="flex-1">
                    <div className="font-bold">{c.label}</div>
                    <div className="text-[14px] text-ink-muted">{c.kind === 'DC' ? 'Fast charge' : 'Standard charge'}</div>
                  </div>
                  <Pill tone={free > 0 ? 'leaf' : 'coral'}>
                    {free} of {c.count} free
                  </Pill>
                </div>
              );
            })}
          </Card>
        </section>

        <section>
          <SectionTitle>Busy hours today</SectionTitle>
          <Card tone="sky" className="p-4">
            <BarChart
              values={HOURS.map((hr) => demandFactor(v.bay.type, hr + 0.5))}
              labels={HOURS.map((hr) => (hr % 3 === 0 ? (hr === 12 ? '12p' : hr < 12 ? `${hr}a` : `${hr - 12}p`) : ''))}
              highlight={HOURS.indexOf(Math.floor(h))}
              color="var(--color-sky)"
              label="Expected demand by hour"
              height={110}
            />
          </Card>
        </section>

        <section>
          <SectionTitle>Ride while you charge</SectionTitle>
          <FacilityRow f={dock} />
        </section>

        <div className="grid grid-cols-[auto_1fr] gap-3">
          <Button variant="secondary" aria-label="Navigate" onClick={() => toast({ icon: 'bolt', title: 'Opening directions', body: `${fmt(v.distanceKm)} km · ~${Math.max(2, Math.round(v.distanceKm * 2.5))} min drive` })}>
            <Navigation size={20} />
          </Button>
          <Button size="lg" disabled={v.free === 0} onClick={() => nav(`/charge/setup/${v.bay.id}`)}>
            <Zap size={22} /> Start charging
          </Button>
        </div>
        {v.free === 0 && alt && (
          <p className="-mt-2 rounded-2xl bg-coral-soft p-4 text-[15px] text-coral-ink">
            Full now · try {alt.bay.name} ({alt.free} free, {fmt(alt.distanceKm)} km)
          </p>
        )}
      </div>
    </>
  );
}
