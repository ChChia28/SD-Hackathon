import { Banknote, Car, Coins, FileText, Home as HomeIcon, ReceiptText, Sun, Ticket } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TabHeader } from '../../components/shell';
import { TxRow } from '../../components/tx';
import { Card, LinkButton, SectionTitle } from '../../components/ui';
import { BalconyTeaser, SliceCard } from '../../components/sund';
import { RewardMix } from '../../components/RewardMix';
import { FlowRow, WhyCredits } from '../../components/visual';
import { CREDIT_TOPUP, SOLAR_SELL_RATE_RM } from '../../data/constants';
import { isEbikeTx } from '../../data/rewards';
import { fmt, fmtInt, fmtRm } from '../../lib/format';
import { scToKm, usesCredits } from '../../lib/pricing';
import { usePersona, useProfile } from '../../store/hooks';
import type { Tx } from '../../store/types';

const FILTERS: { id: string; label: string; test: (t: Tx) => boolean; resident?: boolean }[] = [
  { id: 'all', label: 'All', test: () => true },
  { id: 'earn', label: 'Earned', test: (t) => t.type === 'earn', resident: true },
  { id: 'charge', label: 'Charging', test: (t) => t.type === 'charge' },
  { id: 'ebike', label: 'eBike', test: isEbikeTx },
  { id: 'facility', label: 'Clubhouse', test: (t) => t.type === 'redeem' && !isEbikeTx(t), resident: true },
  { id: 'topup', label: 'Top-ups', test: (t) => t.type === 'topup' },
];

export default function Wallet() {
  const persona = usePersona();
  const prof = useProfile();
  const [filter, setFilter] = useState('all');
  const resident = usesCredits(persona.id);
  const f = FILTERS.find((x) => x.id === filter)!;
  const txs = prof.txs.filter(f.test);

  return (
    <>
      <TabHeader title="Wallet" />
      <div className="flex flex-col gap-6 px-5 pb-8 pt-2">
        {persona.drivesEv && <div className="grid grid-cols-2 gap-3">
          {resident ? (
            <div className="card-navy p-4">
              <div className="flex items-center gap-1.5 text-[14px] font-bold text-white/80">
                <Sun size={16} className="text-sun-bright" /> SunD Credits
              </div>
              <div className="mt-1 font-display text-[30px] font-bold leading-9 tabular">{fmt(prof.sc)}</div>
              <div className="flex items-center gap-1 text-[14px] text-white/70 tabular">
                <Car size={14} /> ≈ {fmtInt(scToKm(prof.sc))} km
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center rounded-[20px] border border-dashed border-outline-strong bg-surface p-4">
              <div className="flex items-center gap-1.5 text-[14px] font-bold text-ink-muted">
                <Sun size={16} /> SunD Credits
              </div>
              <div className="mt-1 text-[14px] text-ink-muted">SD residents only</div>
            </div>
          )}
          <div className="rounded-[20px] border border-sky-bright bg-sky-soft p-4">
            <div className="flex items-center gap-1.5 text-[14px] font-bold text-sky-deep">
              <Ticket size={16} /> Saver Credits
            </div>
            <div className="mt-1 font-display text-[30px] font-bold leading-9 tabular">{fmtRm(prof.saver)}</div>
            <div className="text-[14px] text-ink-muted">60%+ solar bays · eBikes</div>
          </div>
        </div>}

        {persona.reward === 'slice' && <SliceCard />}
        {persona.reward === 'cream' && (
          <Card tone="sun" className="p-4">
            <div className="mb-3 text-[15px] font-bold text-ink-muted">This month</div>
            <FlowRow
              sep={['×', '=']}
              size={44}
              items={[
                { icon: persona.id === 'landed' ? <HomeIcon size={20} /> : <Sun size={20} />, label: `${fmt(prof.monthKwh * persona.rewardShare, 0)}`, sub: 'kWh sold', tone: 'leaf' },
                { icon: <Coins size={20} />, label: `RM ${SOLAR_SELL_RATE_RM.toFixed(2)}`, sub: 'per kWh', tone: 'slate' },
                { icon: <Banknote size={20} />, label: fmtRm(prof.monthKwh * persona.rewardShare * SOLAR_SELL_RATE_RM), sub: 'solar income', tone: 'sky' },
              ]}
            />
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-2xl bg-sun-soft px-2 py-2">
                <div className="font-display text-[18px] font-bold text-sun-ink tabular">+{fmt(prof.monthCredits)} SC</div>
                <div className="text-[13px] text-ink-muted tabular">credits (+{Math.round((CREDIT_TOPUP - 1) * 100)}%) · ≈{fmtInt(scToKm(prof.monthCredits))} km</div>
              </div>
              <div className="rounded-2xl bg-sky-soft px-2 py-2">
                <div className="font-display text-[18px] font-bold text-sky-deep tabular">{fmtRm(prof.monthRebateRm)}</div>
                <div className="flex items-center justify-center gap-1 text-[13px] text-ink-muted">
                  <ReceiptText size={13} /> bill rebate
                </div>
              </div>
            </div>
          </Card>
        )}

        {persona.canRebate && !persona.sponsored && (
          <Card tone="sky" className="p-4">
            <RewardMix />
          </Card>
        )}
        {persona.id === 'condo' && <BalconyTeaser />}

        <div className="grid grid-cols-2 gap-3">
          <LinkButton to="/wallet/saver">
            <Ticket size={20} /> Buy Saver
          </LinkButton>
          <LinkButton to="/wallet/statement" variant="secondary">
            <FileText size={20} /> Statement
          </LinkButton>
        </div>

        {resident && (
          <Card tone="leaf" className="p-4">
            <div className="mb-3 font-bold">Why credits first?</div>
            <WhyCredits />
          </Card>
        )}

        <section>
          <SectionTitle
            action={
              <Link to="/wallet/rules" className="text-[15px] font-bold text-sky-deep">
                Rules
              </Link>
            }
          >
            Activity
          </SectionTitle>
          <div className="no-scrollbar -mx-5 mb-3 flex gap-2 overflow-x-auto px-5">
            {FILTERS.filter((x) => resident || !x.resident).map((x) => (
              <button key={x.id} type="button" className="chip" aria-pressed={filter === x.id} onClick={() => setFilter(x.id)}>
                {x.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {persona.kWp > 0 && prof.sliceOn && (filter === 'all' || filter === 'earn') && (
              <div className="flex items-center gap-3 rounded-[20px] border border-dashed border-sun bg-sun-wash p-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sun-soft text-sun-deep">
                  <Sun size={20} className="spin-slow" />
                </span>
                <div className="flex-1">
                  <div className="font-bold leading-6">Today · live</div>
                  <div className="text-[14px] text-ink-muted tabular">{fmt(prof.todayKwh)} kWh</div>
                </div>
                <div className="font-bold text-leaf-ink tabular">{prof.todayCredits > 0.005 ? `+${fmt(prof.todayCredits, 2)} SC` : `−${fmtRm(prof.todayRebateRm)} bill`}</div>
              </div>
            )}
            {txs.map((tx) => (
              <TxRow key={tx.id} tx={tx} />
            ))}
            {!txs.length && <p className="py-6 text-center text-ink-muted">Nothing here yet.</p>}
          </div>
        </section>
      </div>
    </>
  );
}
