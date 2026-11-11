import { BadgeCheck, Bike, ChevronRight, Dumbbell, ShoppingBag, SquareParking, Zap, type LucideIcon } from 'lucide-react';
import { PASS_KWH } from '../data/constants';
import { fmtDate, fmtInt } from '../lib/format';
import { passPlansFor } from '../lib/pricing';
import { usePersona, useProfile } from '../store/hooks';
import { Card, IconBubble, Pill, ProgressBar } from './ui';

const SPEND: { Icon: LucideIcon; label: string }[] = [
  { Icon: Zap, label: 'Charging' },
  { Icon: Bike, label: 'eBikes' },
  { Icon: SquareParking, label: 'Parking' },
  { Icon: Dumbbell, label: 'Clubhouse' },
  { Icon: ShoppingBag, label: 'Mall shops' },
];

/** Where Saver Credits work: everywhere in SunD. */
export function SpendAnywhere() {
  return (
    <div className="grid grid-cols-5 gap-1.5" aria-label="Saver Credits work for charging, eBikes, parking, the clubhouse and mall shops">
      {SPEND.map(({ Icon, label }) => (
        <div key={label} className="flex flex-col items-center gap-1 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-page text-sky-deep">
            <Icon size={19} />
          </span>
          <span className="text-[12px] font-bold leading-4 text-ink-muted">{label}</span>
        </div>
      ))}
    </div>
  );
}

/** SunD Pass status (active) or an offer (none yet). Opens the pass screen. */
export function PassCard() {
  const persona = usePersona();
  const prof = useProfile();
  const pass = prof.pass;

  if (!pass) {
    const from = Math.min(...passPlansFor(persona.id).map((p) => p.price));
    return (
      <Card to="/wallet/pass" tone="leaf" className="flex items-center gap-3 p-4">
        <IconBubble tone="leaf">
          <BadgeCheck size={22} />
        </IconBubble>
        <div className="min-w-0 flex-1">
          <div className="font-bold leading-6">SunD Pass · from RM {from}/month</div>
          <div className="text-[14px] leading-5 text-ink-muted">{PASS_KWH} kWh + unlimited eBike & mall parking</div>
        </div>
        <ChevronRight size={20} className="shrink-0 text-ink-subtle" />
      </Card>
    );
  }

  return (
    <Card to="/wallet/pass" tone="leaf" className="p-4">
      <div className="flex items-center gap-2">
        <BadgeCheck size={20} className="text-leaf-deep" />
        <span className="font-bold">SunD Pass</span>
        <Pill tone="leaf">Active</Pill>
        <span className="ml-auto text-[14px] text-ink-muted">{pass.autoRenew ? 'Renews' : 'Ends'} {fmtDate(pass.renewsAt)}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-display text-[30px] font-bold leading-9 tabular">{fmtInt(pass.kwhLeft)}</span>
        <span className="text-ink-muted">of {PASS_KWH} kWh left</span>
      </div>
      <ProgressBar value={pass.kwhLeft / PASS_KWH} className="mt-1" />
      <div className="mt-3 flex flex-wrap gap-2">
        <Pill tone="leaf" icon={<Bike size={15} />}>
          Unlimited eBike
        </Pill>
        <Pill tone="leaf" icon={<SquareParking size={15} />}>
          Mall parking
        </Pill>
      </div>
    </Card>
  );
}
