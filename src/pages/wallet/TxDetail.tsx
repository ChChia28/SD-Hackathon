import { Link, useParams } from 'react-router-dom';
import { signed, txMeta, txSummary } from '../../components/tx';
import { Card, LinkButton, PageHeader, Row } from '../../components/ui';
import { getBay } from '../../data/bays';
import { fmt, fmtDateTime, fmtInt, fmtRm } from '../../lib/format';
import { useProfile } from '../../store/hooks';

export default function TxDetail() {
  const { id } = useParams();
  const tx = useProfile().txs.find((t) => t.id === id);
  if (!tx)
    return (
      <>
        <PageHeader title="Transaction" />
        <p className="p-8 text-center text-ink-muted">We couldn't find this transaction. It may belong to another persona.</p>
      </>
    );
  const { Icon, cls } = txMeta(tx);
  const s = txSummary(tx);

  return (
    <>
      <PageHeader title={tx.title} />
      <div className="flex flex-col gap-5 px-5 pb-10 pt-6">
        <div className="flex flex-col items-center text-center">
          <span className={`flex h-16 w-16 items-center justify-center rounded-full ${cls}`}>
            <Icon size={30} />
          </span>
          <div className={`mt-3 font-display text-[36px] font-bold tabular ${s.positive ? 'text-leaf-ink' : ''}`}>{s.main}</div>
          <div className="text-ink-muted">{fmtDateTime(tx.at)}</div>
        </div>
        <Card className="divide-y divide-outline px-5 py-1">
          {tx.place && <Row label="Location" value={tx.bayId ? <Link className="text-sky-deep underline" to={`/map/bay/${tx.bayId}`}>{getBay(tx.bayId).name}</Link> : tx.place} />}
          {tx.kwh !== undefined && <Row label={tx.type === 'earn' ? 'Generated' : 'Energy'} value={`${fmt(tx.kwh)} kWh`} />}
          {tx.solarPct !== undefined && <Row label="Solar share" value={`${tx.solarPct}%`} tone="leaf" />}
          {!!tx.sc && <Row label="SunD Credits" value={`${signed(tx.sc, 2)} SC`} />}
          {!!tx.rebateRm && <Row label="Bill rebate" value={`+${fmtRm(tx.rebateRm)}`} />}
          {!!tx.bonusSc && <Row label="Bonus credits" value={`+${fmt(tx.bonusSc, 2)} SC`} tone="berry" />}
          {!!tx.saver && <Row label="Saver Credits" value={`${tx.saver < 0 ? '−' : '+'}${fmtRm(tx.saver)}`} />}
          {!!tx.rm && <Row label={tx.type === 'topup' ? 'You paid' : 'Card payment'} value={fmtRm(tx.rm)} />}
          {tx.method && <Row label="Payment method" value={tx.method} />}
          {tx.km !== undefined && <Row label="Driving added" value={`${fmtInt(tx.km)} km`} />}
          {tx.co2 !== undefined && <Row label="CO₂ avoided" value={`${fmt(tx.co2)} kg`} tone="leaf" />}
          {tx.durationMin !== undefined && <Row label="Duration" value={`${tx.durationMin} min`} />}
          <Row label="Reference" value={<span className="font-mono text-[14px]">{tx.id.toUpperCase()}</span>} />
        </Card>
        {tx.type === 'earn' && <p className="text-center text-[14px] text-ink-muted">Added live · recorded at midnight</p>}
        {tx.type === 'charge' && (
          <LinkButton to={`/charge/receipt/${tx.id}`} variant="secondary">
            View receipt
          </LinkButton>
        )}
      </div>
    </>
  );
}
