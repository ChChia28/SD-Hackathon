import { BadgeCheck, Bike, Check, Loader2, SquareParking, Zap, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ring } from '../../components/charts';
import { PayMethodPicker, PAY_METHODS } from '../../components/payment';
import { Button, Card, IconBubble, LinkButton, PageHeader, Pill, Row, Stat, Toggle } from '../../components/ui';
import { EBIKE_RIDE_RM, MALL_PARKING_RM, PASS_KWH, PASS_PLANS, PASS_TYPICAL_MONTH, PUBLIC_PRICE, RESIDENT_PRICE } from '../../data/constants';
import { cx, fmt, fmtDate, fmtInt, fmtRm } from '../../lib/format';
import { audienceOf, passMonthValue, passPlansFor, SAVER_MAX_PCT, usesCredits } from '../../lib/pricing';
import { usePersona, useProfile } from '../../store/hooks';
import { useStore } from '../../store/useStore';
import type { Pass } from '../../store/types';

/** What 100 kWh is worth at this person's standard rate: RM 90 for residents, RM 140 for the public. */
const kwhRate = (resident: boolean) => (resident ? RESIDENT_PRICE : PUBLIC_PRICE);

function Included({ Icon, title, sub }: { Icon: LucideIcon; title: string; sub: string }) {
  return (
    <div className="flex min-h-16 items-center gap-3 px-4 py-2">
      <IconBubble tone="leaf">
        <Icon size={22} />
      </IconBubble>
      <div>
        <div className="font-bold leading-6">{title}</div>
        <div className="text-[14px] leading-5 text-ink-muted">{sub}</div>
      </div>
    </div>
  );
}

export default function PassPage() {
  const persona = usePersona();
  const prof = useProfile();
  const buy = useStore((s) => s.buyPass);
  const nav = useNavigate();
  const resident = usesCredits(persona.id);
  const plans = passPlansFor(persona.id);
  const [planId, setPlanId] = useState(plans[0].id);
  const [method, setMethod] = useState(PAY_METHODS[0].id);
  const [stage, setStage] = useState<'choose' | 'paying' | 'done'>('choose');
  const plan = plans.find((p) => p.id === planId) ?? plans[0];
  const chargeValue = PASS_KWH * kwhRate(resident);

  const pay = () => {
    setStage('paying');
    window.setTimeout(() => {
      buy(plan.id, method);
      setStage('done');
    }, 1500);
  };

  if (stage === 'done' && prof.pass)
    return (
      <>
        <PageHeader title="SunD Pass" back="/wallet" />
        <div className="rise-in flex flex-col items-center px-6 pb-10 pt-12 text-center">
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-leaf-soft text-leaf-deep">
            <Check size={48} strokeWidth={2.5} />
          </span>
          <h1 className="mt-6 text-[28px] font-bold leading-9">Your SunD Pass is active</h1>
          <p className="mt-2 text-[18px] text-ink-muted">
            {PASS_KWH} kWh ready · renews {fmtDate(prof.pass.renewsAt)}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Pill tone="leaf" icon={<Bike size={15} />}>
              Unlimited eBike
            </Pill>
            <Pill tone="leaf" icon={<SquareParking size={15} />}>
              Mall parking
            </Pill>
          </div>
          <div className="mt-8 grid w-full gap-3">
            <LinkButton to="/map" size="lg">
              Find a SunD Bay
            </LinkButton>
            <Button variant="secondary" onClick={() => nav('/wallet')}>
              Back to wallet
            </Button>
          </div>
        </div>
      </>
    );

  if (prof.pass) return <ActivePass pass={prof.pass} resident={resident} />;

  return (
    <>
      <PageHeader title="SunD Pass" />
      <div className="flex flex-col gap-6 px-5 pb-10 pt-4">
        <div className="text-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-leaf-soft text-leaf-deep">
            <BadgeCheck size={32} />
          </span>
          <h1 className="mt-3 text-[26px] font-bold leading-8">One monthly price</h1>
          <p className="mt-1 text-ink-muted">Charging, eBikes and parking in one pass</p>
        </div>

        <Card tone="leaf" className="divide-y divide-leaf-soft">
          <Included Icon={Zap} title={`${PASS_KWH} kWh of charging`} sub={`Any SunD Bay · worth ${fmtRm(chargeValue)} at ${fmtRm(kwhRate(resident))}/kWh`} />
          <Included Icon={Bike} title="Unlimited SunD eBike" sub={`30-min rides · RM ${EBIKE_RIDE_RM} each without the pass`} />
          <Included Icon={SquareParking} title="Unlimited mall parking" sub={`Elmina Central Mall · RM ${MALL_PARKING_RM} an entry without`} />
        </Card>

        <div className="-mt-3 rounded-2xl bg-leaf-soft px-4 py-3 text-[15px] leading-6 text-leaf-ink">
          <b>Worth about RM {passMonthValue(audienceOf(persona.id))} in a typical month</b>: all {PASS_KWH} kWh, {PASS_TYPICAL_MONTH.rides} eBike rides and {PASS_TYPICAL_MONTH.parks} parking entries. That’s +
          {Math.round((passMonthValue(audienceOf(persona.id)) / plan.price - 1) * 100)}% on this plan; Saver tops out at +{SAVER_MAX_PCT}%.
        </div>

        <fieldset>
          <legend className="mb-3 text-[19px] font-bold">{resident ? 'Resident plans' : 'Your plan'}</legend>
          <div className="flex flex-col gap-3">
            {plans.map((p) => {
              const saves = Math.max(...plans.map((x) => x.price)) - p.price;
              return (
                <button key={p.id} type="button" aria-pressed={planId === p.id} onClick={() => setPlanId(p.id)} className={cx('card flex min-h-20 items-center gap-4 p-4 text-left', planId === p.id && 'card-active')}>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold leading-6">{p.label}</span>
                      {saves > 0 && <Pill tone="leaf">Save RM {saves}</Pill>}
                    </div>
                    <div className="text-[14px] text-ink-muted">{p.note}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-[24px] font-bold leading-7 tabular">RM {p.price}</div>
                    <div className="text-[13px] text-ink-muted">a month</div>
                  </div>
                </button>
              );
            })}
          </div>
          {!resident && <p className="mt-2 text-[14px] text-ink-muted">SD residents pay from RM {Math.min(...PASS_PLANS.filter((p) => p.who === 'resident').map((p) => p.price))}</p>}
        </fieldset>

        <PayMethodPicker value={method} onChange={setMethod} />

        <Button size="lg" onClick={pay} disabled={stage === 'paying'}>
          {stage === 'paying' ? (
            <>
              <Loader2 size={22} className="spin" /> Processing…
            </>
          ) : (
            `Pay RM ${plan.price} · start pass`
          )}
        </Button>
        <p className="-mt-3 text-center text-[14px] leading-5 text-ink-muted">
          Pass kWh are used first and reset each month, with no rollover. Past {PASS_KWH} kWh, you pay as usual. Demo · no real payment
        </p>
      </div>
    </>
  );
}

function ActivePass({ pass, resident }: { pass: Pass; resident: boolean }) {
  const simTime = useStore((s) => s.simTime);
  const setAutoRenew = useStore((s) => s.setPassAutoRenew);
  const plan = PASS_PLANS.find((p) => p.id === pass.planId);
  const usedKwh = PASS_KWH - pass.kwhLeft;
  const chargeRm = usedKwh * kwhRate(resident);
  const ridesRm = pass.rides * EBIKE_RIDE_RM;
  const parksRm = pass.parks * MALL_PARKING_RM;
  const value = chargeRm + ridesRm + parksRm;
  const locked = !!pass.commitUntil && simTime < pass.commitUntil;

  return (
    <>
      <PageHeader title="SunD Pass" back="/wallet" />
      <div className="flex flex-col gap-5 px-5 pb-10 pt-5">
        <div className="flex flex-col items-center text-center">
          <Ring value={pass.kwhLeft / PASS_KWH} size={200} stroke={16}>
            <span className="font-display text-[48px] font-bold leading-[48px] tabular">{fmtInt(pass.kwhLeft)}</span>
            <span className="mt-1 text-ink-muted">of {PASS_KWH} kWh left</span>
          </Ring>
          <div className="mt-3 flex justify-center gap-2">
            <Pill tone="leaf" icon={<BadgeCheck size={15} />}>
              Active
            </Pill>
            <Pill tone="slate">
              {pass.autoRenew ? 'Renews' : 'Ends'} {fmtDate(pass.renewsAt)}
            </Pill>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Stat tone="leaf" icon={<Bike size={16} />} label="eBike rides" value={pass.rides} unit="· unlimited" />
          <Stat tone="leaf" icon={<SquareParking size={16} />} label="Mall parking" value={pass.parks} unit="· unlimited" />
        </div>

        <Card tone="sky" className="divide-y divide-sky-soft px-5 py-1">
          <Row label={`Charging · ${fmt(usedKwh)} kWh`} value={fmtRm(chargeRm)} />
          <Row label={`eBike · ${pass.rides} × RM ${EBIKE_RIDE_RM}`} value={fmtRm(ridesRm)} />
          <Row label={`Parking · ${pass.parks} × RM ${MALL_PARKING_RM}`} value={fmtRm(parksRm)} />
          <Row label="Value used this month" value={fmtRm(value)} strong />
          <Row label="You pay" value={`${fmtRm(pass.price)}/month`} />
        </Card>
        <p className={cx('-mt-2 text-center text-[15px] font-bold', value >= pass.price ? 'text-leaf-ink' : 'text-ink-muted')}>
          {value >= pass.price ? `${fmtRm(value - pass.price)} ahead this month` : `${fmtRm(pass.price - value)} more use to break even`}
        </p>

        <Card className="divide-y divide-outline px-5 py-1">
          <Row label="Plan" value={plan?.label ?? 'SunD Pass'} />
          <Row label="Started" value={fmtDate(pass.startedAt)} />
          {pass.commitUntil && <Row label="Minimum term until" value={fmtDate(pass.commitUntil)} />}
          <div className="flex min-h-14 items-center justify-between gap-3">
            <div>
              <div className="font-bold">Auto-renew</div>
              <div className="text-[14px] text-ink-muted">{locked ? 'On for the 12-month term' : pass.autoRenew ? `Next payment ${fmtRm(pass.price)} on ${fmtDate(pass.renewsAt)}` : `Pass ends ${fmtDate(pass.renewsAt)}`}</div>
            </div>
            {!locked && <Toggle on={pass.autoRenew} onChange={setAutoRenew} label="Auto-renew SunD Pass" />}
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-2">
          <LinkButton to="/map" variant="secondary" className="!px-2">
            <Zap size={18} /> Charge
          </LinkButton>
          <LinkButton to="/map?tab=ebike" variant="secondary" className="!px-2">
            <Bike size={18} /> Ride
          </LinkButton>
          <LinkButton to="/rewards/redeem/mall-parking" variant="secondary" className="!px-2">
            <SquareParking size={18} /> Park
          </LinkButton>
        </div>
        <p className="-mt-2 text-center text-[14px] text-ink-muted">Pass kWh are used first · {PASS_KWH} kWh reset every month</p>
      </div>
    </>
  );
}
