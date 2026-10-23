import { Check, Gift, Share2, Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Button, Card, LinkButton, PageHeader, Row, StarBadge } from '../../components/ui';
import { getAchievement } from '../../data/rewards';
import { cx, fmt, fmtInt, fmtRm, fmtTime } from '../../lib/format';
import { useProfile } from '../../store/hooks';
import { useStore } from '../../store/useStore';

export default function Receipt() {
  const { id } = useParams();
  const tx = useProfile().txs.find((t) => t.id === id);
  const celebrate = useStore((s) => s.celebrate);
  const toast = useStore((s) => s.toast);
  const [rating, setRating] = useState(0);
  const fired = useRef(false);
  const fresh = (useLocation().state as { fresh?: boolean } | null)?.fresh;

  const finishedSession = useStore((s) => s.session?.status === 'done' && s.session.txId === id);
  const clearSession = useStore((s) => s.clearSession);
  useEffect(() => {
    if (finishedSession) clearSession();
  }, [finishedSession, clearSession]);

  // Confetti is reserved for completion: only right after a charge finishes, not when reopening a receipt.
  useEffect(() => {
    if (fired.current || !tx || !fresh) return;
    fired.current = true;
    celebrate();
  }, [tx, fresh, celebrate]);

  if (!tx)
    return (
      <>
        <PageHeader title="Receipt" back="/" />
        <p className="p-8 text-center text-ink-muted">This receipt belongs to another persona.</p>
      </>
    );

  const share = async () => {
    const text = `+${fmtInt(tx.km ?? 0)} km on ${tx.solarPct}% solar at a SunD Bay, Elmina ☀️`;
    try {
      if (navigator.share) await navigator.share({ title: 'SunD Wallet', text });
      else {
        await navigator.clipboard.writeText(text);
        toast({ icon: 'gift', title: 'Copied to clipboard', body: text });
      }
    } catch {
      /* share sheet dismissed */
    }
  };

  return (
    <>
      <PageHeader title="Receipt" back="/" />
      <div className="flex flex-col gap-5 px-5 pb-10 pt-6">
        <div className="flex flex-col items-center text-center">
          <span className="star-pop flex h-20 w-20 items-center justify-center rounded-full bg-leaf-soft text-leaf-deep">
            <Check size={40} strokeWidth={3} />
          </span>
          <h1 className="mt-4 text-[26px] font-bold leading-8">Charging complete</h1>
          <div className="mt-2 font-display text-[56px] font-bold leading-[56px] tabular">+{fmtInt(tx.km ?? 0)} km</div>
          <div className="mt-1 text-ink-muted">
            SunD Bay · {tx.place} · {fmtTime(tx.at)}
          </div>
        </div>

        {!!tx.bonusSc && (
          <div className="flex items-center gap-3 rounded-[20px] bg-berry-soft p-4 text-berry-ink">
            <Gift size={28} className="shrink-0" />
            <div>
              <div className="text-[19px] font-bold tabular">+{fmt(tx.bonusSc, 2)} bonus SC</div>
              <div className="text-[15px]">{tx.solarPct}% solar charge · in your wallet</div>
            </div>
          </div>
        )}

        {tx.unlocked?.map((aid) => {
          const a = getAchievement(aid);
          return (
            <Link key={aid} to="/rewards/achievements" className="card card-link flex items-center gap-4 p-4">
              <StarBadge earned glow size={56} />
              <div>
                <div className="text-[14px] font-bold uppercase tracking-wider text-sun-ink">Badge unlocked</div>
                <div className="text-[19px] font-bold">{a?.title}</div>
                <div className="text-[15px] text-ink-muted">{a?.desc}</div>
              </div>
            </Link>
          );
        })}

        <Card tone="leaf" className="divide-y divide-leaf-soft px-5 py-1">
          <Row label="Energy" value={`${fmt(tx.kwh ?? 0)} kWh`} />
          <Row label="Solar share" value={`${tx.solarPct}%`} tone="leaf" />
          {!!tx.sc && <Row label="Paid with SunD Credits" value={`${fmt(Math.abs(tx.sc), 2)} SC`} />}
          {!!tx.saver && <Row label="Paid with Saver Credits" value={fmtRm(tx.saver)} />}
          {!!tx.rm && <Row label="Card payment" value={fmtRm(tx.rm)} />}
          {!tx.rm && <Row label="Cash paid" value="RM 0.00" tone="leaf" />}
          <Row label="CO₂ avoided" value={`${fmt(tx.co2 ?? 0)} kg`} tone="leaf" />
          <Row label="Charging time" value={`${tx.durationMin} min`} />
        </Card>

        <Card className="p-5 text-center">
          <div className="font-bold">How was this bay?</div>
          <div className="mt-2 flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => setRating(n)} className="flex h-12 w-12 items-center justify-center rounded-full hover:bg-sunken">
                <Star size={30} className={cx(n <= rating ? 'text-sun' : 'text-ink-faint')} fill={n <= rating ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
          {rating > 0 && <div className="mt-1 text-[15px] text-ink-muted">Thanks · helps us place more panels</div>}
        </Card>

        <div className="grid grid-cols-[auto_1fr] gap-3">
          <Button variant="secondary" aria-label="Share" onClick={share}>
            <Share2 size={20} />
          </Button>
          <LinkButton to="/" size="lg">
            Done
          </LinkButton>
        </div>
      </div>
    </>
  );
}
