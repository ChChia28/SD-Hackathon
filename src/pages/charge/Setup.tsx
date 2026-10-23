import { Car, Gift, Zap } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StatusPill } from '../../components/status';
import { Button, Card, PageHeader, ProgressBar, Row } from '../../components/ui';
import { EV, KM_PER_KWH } from '../../data/constants';
import { cx, fmt, fmtInt, fmtRm } from '../../lib/format';
import { bonusRateFor, estimatePayment, usesCredits } from '../../lib/pricing';
import { useBayView, useProfile } from '../../store/hooks';
import { useStore } from '../../store/useStore';

export default function Setup() {
  const { bayId } = useParams();
  const v = useBayView(bayId);
  const prof = useProfile();
  const persona = useStore((s) => s.persona);
  const start = useStore((s) => s.startSession);
  const toast = useStore((s) => s.toast);
  const session = useStore((s) => s.session);
  const nav = useNavigate();

  const firstFree = v?.bay.connectors.find((c) => c.count - (v.live.busy[c.id] ?? 0) > 0);
  const [connId, setConnId] = useState(firstFree?.id ?? 'ac');
  const [target, setTarget] = useState<'10' | '20' | '80' | 'full'>('20');
  if (!v) return <PageHeader title="Bay not found" />;

  const room = ((100 - prof.evSoc) / 100) * EV.batteryKwh;
  const targets = {
    '10': { label: '+10 kWh', kwh: Math.min(10, room) },
    '20': { label: '+20 kWh', kwh: Math.min(20, room) },
    '80': { label: 'To 80%', kwh: Math.max(0, ((80 - prof.evSoc) / 100) * EV.batteryKwh) },
    full: { label: 'Full', kwh: room },
  };
  const kwh = targets[target].kwh;
  const conn = v.bay.connectors.find((c) => c.id === connId) ?? v.bay.connectors[0];
  const pay = estimatePayment(kwh, prof, v.rate, usesCredits(persona), v.saverOk);
  const bonus = bonusRateFor(persona, v.status, v.solarPct);
  const bonusSc = (kwh * v.solarPct * bonus) / 100;
  const minutes = Math.max(1, Math.round((kwh / conn.kw) * 60 * 1.1));
  const endSoc = Math.min(100, prof.evSoc + (kwh / EV.batteryKwh) * 100);
  const busyNow = session?.status === 'charging';

  const go = () => {
    if (start(v.bay.id, conn.id, kwh)) nav('/charge/session', { replace: true });
    else toast({ icon: 'alert', title: 'That charger was just taken', body: 'Pick another charger or try a bay nearby.' });
  };

  return (
    <>
      <PageHeader title="Set up charging" />
      <div className="flex flex-col gap-6 px-5 pb-10 pt-4">
        <div>
          <StatusPill status={v.status} />
          <h1 className="mt-2 text-[24px] font-bold leading-8">{v.bay.name}</h1>
          <div className="text-ink-muted">
            {v.solarPct}% solar right now · {v.source}
          </div>
        </div>

        <fieldset>
          <legend className="mb-3 text-[19px] font-bold">Charger</legend>
          <div className="grid grid-cols-2 gap-3">
            {v.bay.connectors.map((c) => {
              const free = c.count - (v.live.busy[c.id] ?? 0);
              const sel = connId === c.id;
              return (
                <button key={c.id} type="button" disabled={free <= 0} aria-pressed={sel} onClick={() => setConnId(c.id)} className={cx('card flex min-h-24 flex-col items-start justify-center gap-1 p-4 text-left disabled:opacity-50', sel && 'card-active')}>
                  <span className="flex items-center gap-1.5 font-bold">
                    <Zap size={18} className={c.kind === 'DC' ? 'text-berry' : 'text-sky'} /> {c.kind === 'DC' ? 'Fast DC' : 'AC'}
                  </span>
                  <span className="text-[14px] text-ink-muted">{c.label}</span>
                  <span className={cx('text-[14px] font-bold', free > 0 ? 'text-leaf-ink' : 'text-coral-ink')}>{free > 0 ? `${free} free` : 'All in use'}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-[19px] font-bold">How much?</legend>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(targets) as (keyof typeof targets)[]).map((k) => (
              <button key={k} type="button" aria-pressed={target === k} onClick={() => setTarget(k)} disabled={targets[k].kwh < 0.5} className={cx('chip !min-h-14 justify-center !px-2', 'disabled:opacity-40')}>
                {targets[k].label}
              </button>
            ))}
          </div>
          <Card tone="leaf" className="mt-3 p-4">
            <div className="flex items-center gap-2 font-bold">
              <Car size={20} className="text-ink-muted" /> {EV.name}
            </div>
            <ProgressBar value={endSoc / 100} className="mt-3 !h-3" />
            <div className="mt-1.5 flex justify-between text-[14px] text-ink-muted tabular">
              <span>Now {Math.round(prof.evSoc)}%</span>
              <span className="font-bold text-ink">After {Math.round(endSoc)}%</span>
            </div>
          </Card>
        </fieldset>

        <Card tone="sky" className="divide-y divide-sky-soft px-5 py-1">
          <Row label="Energy" value={`${fmt(kwh)} kWh`} />
          <Row label="Adds about" value={`${fmtInt(kwh * KM_PER_KWH)} km`} />
          <Row label="Takes about" value={`${minutes} min`} />
          {pay.sc > 0 && <Row label="SunD Credits" value={`−${fmt(pay.sc)} SC`} />}
          {pay.saver > 0 && <Row label="Saver Credits" value={`−${fmtRm(pay.saver)}`} />}
          {pay.rm > 0.005 && <Row label={`Card (RM ${v.rate.toFixed(2)}/kWh)`} value={fmtRm(pay.rm)} />}
          <Row label="You pay in cash" value={pay.rm > 0.005 ? fmtRm(pay.rm) : 'RM 0.00'} strong tone={pay.rm > 0.005 ? undefined : 'leaf'} />
        </Card>

        {bonusSc > 0.005 && (
          <div className="flex items-center gap-3 rounded-[20px] bg-berry-soft p-4 text-berry-ink">
            <Gift size={24} className="shrink-0" />
            <div>
              <div className="font-bold">+{fmt(bonusSc, 2)} bonus credits</div>
              <div className="text-[15px]">{Math.round(bonus * 100)}% back · {v.status === 'surplus' ? 'surplus' : 'solar'} bay</div>
            </div>
          </div>
        )}
        {usesCredits(persona) && pay.rm > 0.005 && <p className="-mt-3 text-[15px] text-ink-muted">Credits run out · rest on card</p>}

        <Button size="lg" onClick={go} disabled={kwh < 0.5 || busyNow}>
          <Zap size={22} fill="currentColor" /> Start charging
        </Button>
        {busyNow && <p className="-mt-3 text-center text-[15px] text-ink-muted">Another session is running</p>}
      </div>
    </>
  );
}
