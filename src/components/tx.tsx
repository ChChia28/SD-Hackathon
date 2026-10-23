import { Bike, ChevronRight, Dumbbell, Snowflake, Sun, Ticket, Zap, type LucideIcon } from 'lucide-react';
import { isEbikeTx } from '../data/rewards';
import { fmt, fmtDate, fmtRm } from '../lib/format';
import type { Tx, TxType } from '../store/types';
import { Card } from './ui';

export const TX_META: Record<TxType, { Icon: LucideIcon; cls: string }> = {
  earn: { Icon: Sun, cls: 'bg-sun-soft text-sun-deep' },
  charge: { Icon: Zap, cls: 'bg-sky-soft text-sky-deep' },
  redeem: { Icon: Dumbbell, cls: 'bg-berry-soft text-berry-ink' },
  topup: { Icon: Ticket, cls: 'bg-sky-soft text-sky-deep' },
  checkin: { Icon: Snowflake, cls: 'bg-berry-soft text-berry-ink' },
};

export const txMeta = (tx: Tx) => (isEbikeTx(tx) ? { Icon: Bike, cls: 'bg-leaf-soft text-leaf-deep' } : TX_META[tx.type]);

/** Signed amount with a real minus sign. */
export const signed = (n: number, digits = 1) => `${n < 0 ? '−' : '+'}${fmt(Math.abs(n), digits)}`;

export function txSummary(tx: Tx): { main: string; sub: string; positive: boolean } {
  switch (tx.type) {
    case 'earn':
      return { main: `${signed(tx.sc ?? 0, 2)} SC`, sub: `${fmt(tx.kwh ?? 0)} kWh made${tx.rebateRm ? ` · +${fmtRm(tx.rebateRm)} rebate` : ''}`, positive: true };
    case 'charge': {
      const main = tx.sc ? `${signed(tx.sc)} SC` : tx.saver ? `−${fmtRm(tx.saver)} Saver` : tx.rm ? `−${fmtRm(tx.rm)}` : '0 SC';
      const extra = tx.sc && tx.rm ? ` · ${fmtRm(tx.rm)} card` : tx.sc && tx.saver ? ` · ${fmtRm(tx.saver)} Saver` : '';
      const bonus = tx.bonusSc ? ` · +${fmt(tx.bonusSc, 1)} bonus` : '';
      return { main, sub: `${fmt(tx.kwh ?? 0)} kWh${extra}${bonus}`, positive: false };
    }
    case 'redeem':
      return { main: tx.saver ? `−${fmtRm(tx.saver)} Saver` : `${signed(tx.sc ?? 0, 0)} SC`, sub: tx.place?.replace('SunD eBike · ', 'eBike · ') ?? '', positive: false };
    case 'topup':
      return { main: `+${fmtRm(tx.saver ?? 0)} Saver`, sub: `Paid ${fmtRm(tx.rm ?? 0)}`, positive: true };
    case 'checkin':
      return { main: 'Free', sub: tx.place ?? 'SunD Cool', positive: true };
  }
}

export function TxRow({ tx }: { tx: Tx }) {
  const { Icon, cls } = txMeta(tx);
  const s = txSummary(tx);
  return (
    <Card to={`/wallet/tx/${tx.id}`} className="flex items-center gap-3 p-3.5">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${cls}`}>
        <Icon size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate font-bold leading-6">{tx.type === 'charge' ? tx.place : isEbikeTx(tx) ? 'eBike ride' : tx.type === 'earn' ? 'SunD Credits' : tx.title}</div>
        <div className="truncate text-[14px] text-ink-muted">
          {fmtDate(tx.at)} · {s.sub}
        </div>
      </div>
      <div className={`shrink-0 font-bold tabular ${s.positive ? 'text-leaf-ink' : 'text-ink'}`}>{s.main}</div>
      <ChevronRight size={18} className="shrink-0 text-ink-subtle" />
    </Card>
  );
}
