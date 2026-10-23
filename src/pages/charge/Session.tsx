import { Gift } from 'lucide-react';
import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { MixBar, Ring } from '../../components/charts';
import { Button, Card, PageHeader, Pill, Row, Stat } from '../../components/ui';
import { getBay } from '../../data/bays';
import { CHARGE_TIMELAPSE, EV, KM_PER_KWH } from '../../data/constants';
import { fmt, fmtInt, fmtRm } from '../../lib/format';
import { useProfile } from '../../store/hooks';
import { useStore } from '../../store/useStore';

export default function Session() {
  const session = useStore((s) => s.session);
  const stop = useStore((s) => s.stopSession);
  const prof = useProfile();
  const nav = useNavigate();

  // The receipt page clears the finished session once it has it.
  useEffect(() => {
    if (session?.status === 'done' && session.txId) nav(`/charge/receipt/${session.txId}`, { replace: true, state: { fresh: true } });
  }, [session?.status, session?.txId, nav]);

  if (!session) return <Navigate to="/charge" replace />;
  if (session.status === 'done') return null;
  const bay = getBay(session.bayId);
  const taper = prof.evSoc > 80;
  const kw = session.kw * (taper ? 0.35 : 1);
  const bonus = session.solarKwh * session.bonusRate;
  const minutes = Math.round((session.elapsedSec * CHARGE_TIMELAPSE) / 60);

  return (
    <>
      <PageHeader title="Charging" back="/" />
      <div className="flex flex-col gap-5 px-5 pb-10 pt-5">
        <div className="text-center">
          <div className="font-bold">{bay.name}</div>
          <Pill tone="leaf" icon={<span className="live-dot" />} className="mt-1">
            Live · shown at {CHARGE_TIMELAPSE}× speed
          </Pill>
        </div>

        <div className="flex justify-center">
          <Ring value={prof.evSoc / 100} size={230} stroke={18} pulse>
            <span className="font-display text-[56px] font-bold leading-[56px] tabular">{Math.round(prof.evSoc)}%</span>
            <span className="mt-1 text-ink-muted">{EV.name}</span>
            <span className="mt-1 font-bold text-leaf-ink tabular">+{fmt(session.delivered)} kWh</span>
          </Ring>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Stat tone="sky" label="Power" value={fmt(kw, 0)} unit="kW" />
          <Stat tone="leaf" label="Range added" value={fmtInt(session.delivered * KM_PER_KWH)} unit="km" />
          <Stat tone="sky" label="Time" value={minutes} unit="min" />
          <Stat tone="sky" label="To go" value={fmt(Math.max(0, session.targetKwh - session.delivered))} unit="kWh" />
        </div>
        {taper && <p className="-mt-2 text-center text-[14px] text-ink-muted">Slower above 80% · battery care</p>}

        <Card tone="leaf" className="p-5">
          <div className="mb-2 font-bold">Energy source</div>
          <MixBar solarPct={session.solarPct} />
        </Card>

        <Card className="divide-y divide-outline px-5 py-1">
          {session.useCredits && <Row label="SunD Credits used" value={`${fmt(session.scUsed, 2)} SC`} />}
          {session.saverOk && session.saverUsed > 0 && <Row label="Saver Credits used" value={fmtRm(session.saverUsed)} />}
          <Row label="Card so far" value={fmtRm(session.rm)} />
          {session.useCredits && <Row label="Credits left" value={`${fmt(prof.sc, 2)} SC`} strong />}
        </Card>

        {session.bonusRate > 0 && (
          <div className="flex items-center gap-3 rounded-[20px] bg-berry-soft p-4 text-berry-ink">
            <Gift size={24} className="shrink-0" />
            <div className="font-bold tabular">+{fmt(bonus, 2)} bonus SC</div>
          </div>
        )}

        <Button variant="coral" onClick={stop}>
          Stop charging
        </Button>
      </div>
    </>
  );
}
