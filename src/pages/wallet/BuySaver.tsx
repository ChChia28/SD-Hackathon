import { ArrowRight, Bike, Building, Check, CreditCard, Loader2, Smartphone, Sun } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, LinkButton, PageHeader, Pill } from '../../components/ui';
import { SAVER_MIN_SOC, SAVER_PACKS } from '../../data/constants';
import { cx, fmtRm } from '../../lib/format';
import { useProfile } from '../../store/hooks';
import { useStore } from '../../store/useStore';

const METHODS = [
  { id: 'FPX online banking', Icon: Building },
  { id: 'E-wallet', Icon: Smartphone },
  { id: 'Debit / credit card', Icon: CreditCard },
];

export default function BuySaver() {
  const prof = useProfile();
  const buy = useStore((s) => s.buySaver);
  const nav = useNavigate();
  const [pack, setPack] = useState(0);
  const [method, setMethod] = useState(METHODS[0].id);
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
          <div className="mt-4 flex justify-center gap-2">
            <Pill tone="leaf" icon={<Sun size={15} />}>{SAVER_MIN_SOC}%+ solar bays</Pill>
            <Pill tone="leaf" icon={<Bike size={15} />}>eBikes</Pill>
          </div>
          <div className="mt-8 grid w-full gap-3">
            <LinkButton to="/map" size="lg">
              Find a green SunD Bay
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
          <div className="mt-3 flex justify-center gap-2">
            <Pill tone="leaf" icon={<Sun size={15} />}>{SAVER_MIN_SOC}%+ solar bays</Pill>
            <Pill tone="leaf" icon={<Bike size={15} />}>eBikes</Pill>
          </div>
        </div>

        <fieldset>
          <legend className="mb-3 text-[19px] font-bold">Choose a pack</legend>
          <div className="flex flex-col gap-3">
            {SAVER_PACKS.map((pk, i) => (
              <button key={i} type="button" aria-pressed={pack === i} onClick={() => setPack(i)} className={cx('card flex min-h-20 items-center gap-4 p-4 text-left', pack === i && 'card-active')}>
                <div className="flex-1">
                  <div className="text-[15px] text-ink-muted">Pay {fmtRm(pk.pay)}</div>
                  <div className="font-display text-[24px] font-bold">Get {fmtRm(pk.get)}</div>
                </div>
                <span className="rounded-full bg-leaf-soft px-3 py-1 font-bold text-leaf-ink">+{Math.round((pk.get / pk.pay - 1) * 100)}%</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-[19px] font-bold">Pay with</legend>
          <Card className="divide-y divide-outline">
            {METHODS.map((m) => (
              <label key={m.id} className="flex min-h-14 cursor-pointer items-center gap-3 px-4">
                <m.Icon size={22} className="text-ink-muted" />
                <span className="flex-1 font-bold">{m.id}</span>
                <input type="radio" name="method" checked={method === m.id} onChange={() => setMethod(m.id)} className="h-5 w-5 accent-[var(--color-sky)]" />
              </label>
            ))}
          </Card>
        </fieldset>

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
