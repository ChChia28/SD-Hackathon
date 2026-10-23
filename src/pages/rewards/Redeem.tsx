import { Bike, Check, Lock } from 'lucide-react';
import { DockSlots } from '../../components/facility';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FACILITY_ICON } from '../../components/TownshipMap';
import { Button, Card, LinkButton, PageHeader, Row } from '../../components/ui';
import { bikesAvailable, getFacility } from '../../data/rewards';
import { fmt, fmtDateTime, fmtRm } from '../../lib/format';
import { usesCredits } from '../../lib/pricing';
import { hashRand } from '../../sim/solar';
import { usePersona, useProfile } from '../../store/hooks';
import { useStore } from '../../store/useStore';

/** Decorative QR-style code, derived from the voucher code. */
function PseudoQr({ code, size = 180 }: { code: string; size?: number }) {
  const n = 21;
  const finder = (r: number, c: number) => {
    const inBox = (r0: number, c0: number) => r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7;
    return inBox(0, 0) || inBox(0, n - 7) || inBox(n - 7, 0);
  };
  const cells: { r: number; c: number }[] = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (!finder(r, c) && hashRand(`${code}-${r}-${c}`) > 0.52) cells.push({ r, c });
  const box = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={7} height={7} fill="var(--color-ink)" />
      <rect x={x + 1} y={y + 1} width={5} height={5} fill="#fff" />
      <rect x={x + 2} y={y + 2} width={3} height={3} fill="var(--color-ink)" />
    </g>
  );
  return (
    <svg viewBox={`-1 -1 ${n + 2} ${n + 2}`} width={size} height={size} role="img" aria-label={`Voucher code ${code}`} shapeRendering="crispEdges">
      <rect x={-1} y={-1} width={n + 2} height={n + 2} fill="#fff" />
      {cells.map(({ r, c }) => (
        <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="var(--color-ink)" />
      ))}
      {box(0, 0)}
      {box(n - 7, 0)}
      {box(0, n - 7)}
    </svg>
  );
}

export default function Redeem() {
  const { id = '' } = useParams();
  const f = getFacility(id);
  const persona = usePersona();
  const prof = useProfile();
  const redeem = useStore((s) => s.redeem);
  const toast = useStore((s) => s.toast);
  const [voucherId, setVoucherId] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const Icon = FACILITY_ICON[f.icon];
  const resident = usesCredits(persona.id);
  const voucher = prof.vouchers.find((v) => v.id === voucherId);
  const ebike = f.kind === 'ebike';
  const simTime = useStore((s) => s.simTime);
  const bikes = ebike ? bikesAvailable(f, simTime) : 0;
  const withSaver = ebike && !(resident && prof.sc >= f.cost);
  const enough = withSaver ? prof.saver >= (f.saverRm ?? 0) : prof.sc >= f.cost;
  const priceLabel = withSaver ? fmtRm(f.saverRm ?? 0) : `${f.cost} SC`;

  const onRedeem = () => {
    const vid = redeem(f.id);
    if (vid) setVoucherId(vid);
    else {
      setShake(true);
      window.setTimeout(() => setShake(false), 300);
      toast({ icon: 'alert', title: 'Not quite enough', body: withSaver ? 'Top up Saver Credits' : `${fmt(f.cost - prof.sc)} SC short` });
    }
  };

  if (voucher)
    return (
      <>
        <PageHeader title={ebike ? 'Ride unlocked' : 'Your voucher'} back="/rewards" />
        <div className="rise-in flex flex-col items-center gap-5 px-5 pb-10 pt-6 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-leaf-soft text-leaf-deep">
            {ebike ? <Bike size={32} /> : <Check size={32} strokeWidth={3} />}
          </span>
          <div>
            <h1 className="text-[26px] font-bold leading-8">{f.item}</h1>
            <div className="text-ink-muted">{f.name}</div>
          </div>
          <Card className="flex flex-col items-center p-6">
            <PseudoQr code={voucher.code} />
            <div className="mt-3 font-mono text-[18px] font-bold tracking-wider">{voucher.code}</div>
            <div className="text-[14px] text-ink-muted">{fmtDateTime(voucher.at)} · {ebike ? '30 min' : '7 days'}</div>
          </Card>
          <p className="text-ink-muted">{ebike ? 'Scan at the dock to release a bike' : 'Show at the clubhouse counter'}</p>
          <LinkButton to="/rewards" variant="secondary" className="w-full">
            Back to rewards
          </LinkButton>
        </div>
      </>
    );

  return (
    <>
      <PageHeader title={f.item} />
      <div className="flex flex-col gap-5 px-5 pb-10 pt-6">
        <div className="flex flex-col items-center text-center">
          <span className={`flex h-24 w-24 items-center justify-center rounded-full ${ebike ? 'bg-leaf-soft text-leaf-deep' : 'bg-berry-soft text-berry-ink'}`}>
            <Icon size={44} />
          </span>
          <h1 className="mt-4 text-[26px] font-bold leading-8">{f.item}</h1>
          <div className="text-ink-muted">{f.name}</div>
          <div className="mt-1 text-[15px] font-bold text-leaf-ink">{f.note}</div>
          {ebike && (
            <div className="mt-3 flex items-center gap-2 rounded-full bg-leaf-wash px-4 py-2">
              <DockSlots bikes={bikes} docks={f.docks ?? 0} />
              <span className="font-bold text-leaf-ink tabular">{bikes} bikes</span>
            </div>
          )}
        </div>

        <Card tone={ebike ? 'leaf' : 'berry'} className="divide-y divide-outline px-5 py-1">
          <Row label="Cost" value={priceLabel} tone={withSaver ? undefined : 'sun'} />
          <Row label="Balance" value={withSaver ? fmtRm(prof.saver) : `${fmt(prof.sc)} SC`} />
          {enough && <Row label="After" value={withSaver ? fmtRm(prof.saver - (f.saverRm ?? 0)) : `${fmt(prof.sc - f.cost)} SC`} strong />}
        </Card>

        {resident || ebike ? (
          <div className={shake ? 'shake' : undefined}>
            <Button size="lg" className="w-full" onClick={onRedeem}>
              {ebike ? `Unlock bike · ${priceLabel}` : `Redeem · ${priceLabel}`}
            </Button>
            {!enough && <p className="mt-2 rounded-2xl bg-coral-soft p-3 text-center text-[15px] text-coral-ink">{withSaver ? 'Top up Saver Credits first' : `${fmt(f.cost - prof.sc)} SC short`}</p>}
          </div>
        ) : (
          <Card className="flex items-center gap-3 p-4">
            <Lock size={22} className="shrink-0 text-sun-deep" />
            <p className="text-[15px] text-ink-muted">SD residents only</p>
          </Card>
        )}

        {prof.vouchers.filter((v) => v.facilityId === f.id).length > 0 && (
          <Card className="p-4">
            <div className="font-bold">{ebike ? 'Your rides here' : 'Your vouchers'}</div>
            {prof.vouchers
              .filter((v) => v.facilityId === f.id)
              .map((v) => (
                <button key={v.id} type="button" onClick={() => setVoucherId(v.id)} className="mt-2 flex min-h-12 w-full items-center justify-between rounded-xl bg-surface px-3 text-left">
                  <span className="font-mono font-bold">{v.code}</span>
                  <span className="text-[14px] text-ink-muted">{fmtDateTime(v.at)}</span>
                </button>
              ))}
          </Card>
        )}
      </div>
    </>
  );
}
