import { ArrowRight, BadgeCheck, Check, ChevronRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SpendAnywhere } from '../../components/pass';
import { PayMethodPicker, PAY_METHODS } from '../../components/payment';
import { Button, Card, IconBubble, LinkButton, PageHeader } from '../../components/ui';
import { PASS_KWH, SAVER_PACKS } from '../../data/constants';
import { cx, fmtInt, fmtRm } from '../../lib/format';
import { audienceOf, passMonthValue, passPlansFor, SAVER_MAX_PCT, SAVER_MIN_PCT, saverBonusPct, standardRate } from '../../lib/pricing';
import { usePersona, useProfile } from '../../store/hooks';
import { useStore } from '../../store/useStore';

/** The Pass beats Saver for regulars: show it beside the packs. */
function PassBetterValue() {
  const persona = usePersona();
  const from = Math.min(...passPlansFor(persona.id).map((p) => p.price));
  const value = passMonthValue(audienceOf(persona.id));
  return (
    <Card to="/wallet/pass" tone="leaf" className="flex items-center gap-3 p-4">
      <IconBubble tone="leaf">
        <BadgeCheck size={22} />
      </IconBubble>
      <div className="min-w-0 flex-1">
        <div className="font-bold leading-6">Charge every week? SunD Pass is better value</div>
        <div className="text-[14px] leading-5 text-ink-muted">
          From RM {from} a month: {PASS_KWH} kWh + unlimited eBike & parking, worth about RM {value} (+{Math.round((value / from - 1) * 100)}%)
        </div>
      </div>
      <ChevronRight size={20} className="shrink-0 text-ink-subtle" />
    </Card>
  );
}

export default function BuySaver() {
  const persona = usePersona();
  const prof = useProfile();
  const rate = standardRate(audienceOf(persona.id));
  const buy = useStore((s) => s.buySaver);
  const nav = useNavigate();
  const [pack, setPack] = useState(0);
  const [method, setMethod] = useState(PAY_METHODS[0].id);
  const [stage, setStage] = useState<'choose' | 'paying' | 'done'>('choose');
  const p = SAVER_PACKS[pack];

  const pay = () => {
    setStage('paying');
    window.setTimeout(() => {
      buy(pack, method);
      setStage('done');
    }, 1500);
  };

  if (stage === 'done')
    return (
      <>
        <PageHeader title="Saver Credits" back="/wallet" />
        <div className="rise-in flex flex-col items-center px-6 pb-10 pt-12 text-center">
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-leaf-soft text-leaf-deep">
            <Check size={48} strokeWidth={2.5} />
          </span>
          <h1 className="mt-6 text-[28px] font-bold leading-9">{fmtRm(p.get)} added</h1>
          <p className="mt-2 text-[18px] text-ink-muted tabular">Balance {fmtRm(prof.saver)}</p>
          <div className="mt-5 w-full rounded-[20px] bg-sky-soft p-4">
            <div className="mb-3 text-[15px] font-bold text-sky-deep">Spend it anywhere in SunD</div>
            <SpendAnywhere />
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

  return (
    <>
      <PageHeader title="Buy Saver Credits" />
      <div className="flex flex-col gap-6 px-5 pb-10 pt-4">
        <div className="rounded-[20px] border border-sky-soft bg-sky-wash p-5">
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-[14px] text-ink-muted">You pay</div>
              <div className="font-display text-[28px] font-bold tabular">{fmtRm(p.pay)}</div>
            </div>
            <ArrowRight size={28} className="text-sky" />
            <div className="text-center">
              <div className="text-[14px] text-ink-muted">You get</div>
              <div className="font-display text-[28px] font-bold text-leaf-ink tabular">{fmtRm(p.get)}</div>
            </div>
          </div>
          <div className="mt-4 rounded-2xl bg-sky-soft p-3">
            <div className="mb-2 text-center text-[14px] font-bold text-sky-deep">Spend anywhere in SunD</div>
            <SpendAnywhere />
          </div>
        </div>

        <fieldset>
          <legend className="mb-1 text-[19px] font-bold">Choose a pack</legend>
          <p className="mb-3 text-[15px] text-ink-muted">
            Top up more, get more: +{SAVER_MIN_PCT}% from {fmtRm(SAVER_PACKS[0].pay)}, up to +{SAVER_MAX_PCT}%
          </p>
          <div className="flex flex-col gap-3">
            {SAVER_PACKS.map((pk, i) => {
              const top = saverBonusPct(pk) === SAVER_MAX_PCT;
              return (
                <button key={i} type="button" aria-pressed={pack === i} onClick={() => setPack(i)} className={cx('card flex min-h-20 items-center gap-4 p-4 text-left', pack === i && 'card-active')}>
                  <div className="flex-1">
                    <div className="text-[15px] text-ink-muted">Pay {fmtRm(pk.pay)}</div>
                    <div className="font-display text-[24px] font-bold">Get {fmtRm(pk.get)}</div>
                    <div className="text-[14px] text-ink-muted tabular">
                      ≈ {fmtInt(pk.get / rate)} kWh at {fmtRm(rate)}/kWh
                    </div>
                  </div>
                  <span className={cx('rounded-full px-3 py-1 font-bold', top ? 'bg-leaf text-white' : 'bg-leaf-soft text-leaf-ink')}>+{saverBonusPct(pk)}%</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {persona.drivesEv && !prof.pass && <PassBetterValue />}

        <PayMethodPicker value={method} onChange={setMethod} />

        <Button size="lg" onClick={pay} disabled={stage === 'paying'}>
          {stage === 'paying' ? (
            <>
              <Loader2 size={22} className="spin" /> Processing…
            </>
          ) : (
            `Pay ${fmtRm(p.pay)}`
          )}
        </Button>
        <p className="-mt-3 text-center text-[14px] text-ink-muted">Demo · no real payment</p>
      </div>
    </>
  );
}
