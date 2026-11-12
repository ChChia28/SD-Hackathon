import { BadgeCheck, Bike, ChevronRight, Dumbbell, ShoppingBag, SquareParking, Zap, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PASS_KWH } from '../data/constants';
import { nearestEbike } from '../data/rewards';
import { fmtDate, fmtInt } from '../lib/format';
import { passPlansFor } from '../lib/pricing';
import { usePersona, useProfile } from '../store/hooks';
import type { Pass } from '../store/types';
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

/** The three things a SunD Pass covers, each one tap away. Shared by the Home / Wallet card and the Pass screen. */
export function passBenefits(pass: Pass, home: { x: number; y: number }) {
  const out = pass.kwhLeft < 0.5;
  const dock = nearestEbike(home);
  return [
    {
      id: 'charge',
      Icon: Zap,
      label: 'Charge',
      title: `${PASS_KWH} kWh of charging`,
      status: out ? 'Used up' : `${fmtInt(pass.kwhLeft)} kWh left`,
      sub: out ? `All ${PASS_KWH} kWh used · pay as usual until ${fmtDate(pass.renewsAt)}` : `${fmtInt(pass.kwhLeft)} kWh left · any SunD Bay`,
      to: '/charge',
      cta: 'Charge',
    },
    {
      id: 'ebike',
      Icon: Bike,
      label: 'eBike',
      title: 'Unlimited eBike rides',
      status: 'Unlimited',
      sub: `${pass.rides} ${pass.rides === 1 ? 'ride' : 'rides'} this month · nearest: ${dock.name.replace('SunD eBike · ', '')}`,
      to: `/rewards/redeem/${dock.id}`,
      cta: 'Unlock',
    },
    {
      id: 'parking',
      Icon: SquareParking,
      label: 'Parking',
      title: 'Unlimited mall parking',
      status: 'Unlimited',
      sub: `${pass.parks} ${pass.parks === 1 ? 'entry' : 'entries'} this month · Elmina Central Mall`,
      to: '/rewards/redeem/mall-parking',
      cta: 'Exit code',
    },
  ];
}

/** Active SunD Pass: charging kWh left, then one big tile each for charging, eBikes and parking. */
function PassHero({ pass }: { pass: Pass }) {
  const persona = usePersona();
  const benefits = passBenefits(pass, persona.home);
  return (
    <section className="card bg-leaf-wash border-leaf-soft p-5" aria-label="Your SunD Pass">
      <Link to="/wallet/pass" className="flex items-center gap-2">
        <BadgeCheck size={20} className="text-leaf-deep" />
        <span className="font-bold">SunD Pass</span>
        <Pill tone="leaf">Active</Pill>
        <span className="ml-auto flex items-center text-[15px] font-bold text-sky-deep">
          My Pass <ChevronRight size={18} />
        </span>
      </Link>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-display text-[44px] font-bold leading-[48px] tabular">{fmtInt(pass.kwhLeft)}</span>
        <span className="text-ink-muted">of {PASS_KWH} kWh charging left</span>
      </div>
      <ProgressBar value={pass.kwhLeft / PASS_KWH} className="mt-2" />
      <div className="mt-1.5 text-[14px] text-ink-muted">{pass.autoRenew ? `Back to ${PASS_KWH} kWh on ${fmtDate(pass.renewsAt)}` : `Pass ends ${fmtDate(pass.renewsAt)}`}</div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {benefits.map((b) => (
          <Link key={b.id} to={b.to} className="flex min-h-[104px] flex-col items-center justify-center gap-1.5 rounded-[20px] bg-page p-2 text-center hover:shadow-soft">
            <IconBubble tone="leaf">
              <b.Icon size={22} />
            </IconBubble>
            <span className="font-bold leading-5">{b.label}</span>
            <span className="text-[13px] font-bold leading-4 text-leaf-ink tabular">{b.status}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** SunD Pass: the active pass with its benefits, or an offer if this person has none yet. */
export function PassCard() {
  const persona = usePersona();
  const prof = useProfile();
  const pass = prof.pass;
  if (pass) return <PassHero pass={pass} />;

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
