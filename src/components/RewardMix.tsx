import { Car, ReceiptText, Sun } from 'lucide-react';
import { CREDIT_TOPUP, SLICE_KWH_PER_MONTH, SOLAR_SELL_RATE_RM, YIELD_KWH_PER_KWP_DAY } from '../data/constants';
import { fmtInt, fmtRm } from '../lib/format';
import { maxBillShare, scToKm, splitReward } from '../lib/pricing';
import { usePersona, useProfile } from '../store/hooks';
import { useStore } from '../store/useStore';
import { Pill } from './ui';

/** Typical month of roof output, for showing what each mix is worth. */
const typicalMonthKwh = (kWp: number, slice: boolean) => (slice ? SLICE_KWH_PER_MONTH * kWp : kWp * YIELD_KWH_PER_KWP_DAY * 30);

/**
 * Landed owners choose how their solar income is redeemed: SunD Credits (unlimited, with a top-up)
 * or up to the policy cap as a cash rebate on the electricity bill.
 */
export function RewardMix() {
  const persona = usePersona();
  const prof = useProfile();
  const setCashShare = useStore((s) => s.setCashShare);
  const slice = persona.reward === 'slice';
  const cap = Math.round(maxBillShare(persona.id) * 100);
  const monthKwh = typicalMonthKwh(persona.kWp, slice);
  const cash = Math.round(prof.cashShare * 100);
  const topup = Math.round((CREDIT_TOPUP - 1) * 100);
  const { income, credits, rebateRm } = splitReward(monthKwh, persona.id, prof.cashShare);

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold">How you redeem it</span>
        <Pill tone="slate">{slice ? 'Bill up to 100%' : `Bill cap ${cap}%`}</Pill>
      </div>
      <div className="mt-1 text-[14px] text-ink-muted tabular">
        {slice ? (
          <>
            Slice worth ≈ <b className="text-ink">{fmtRm(income)}</b> / month · {fmtInt(monthKwh)} kWh × RM 0.36 (flat slice rate)
          </>
        ) : (
          <>
            Solar income ≈ <b className="text-ink">{fmtRm(income)}</b> / month · {fmtInt(monthKwh * persona.rewardShare)} kWh × RM {SOLAR_SELL_RATE_RM.toFixed(2)}
          </>
        )}
      </div>

      <div className="mt-3 flex h-10 overflow-hidden rounded-2xl text-[14px] font-bold" aria-hidden="true">
        <span className="flex items-center justify-center bg-sun text-white transition-[width] duration-300" style={{ width: `${100 - cash}%` }}>
          <Sun size={16} className="mr-1" /> {100 - cash}%
        </span>
        {cash > 0 && (
          <span className="flex items-center justify-center bg-sky text-white transition-[width] duration-300" style={{ width: `${cash}%` }}>
            {cash}%
          </span>
        )}
      </div>

      <input
        type="range"
        min={0}
        max={cap}
        step={5}
        value={cash}
        onChange={(e) => setCashShare(Number(e.target.value) / 100)}
        aria-label="Share of solar income as bill rebate"
        className="mt-3 h-8 w-full cursor-pointer accent-[var(--color-sky)]"
      />
      <div className="flex justify-between text-[13px] text-ink-muted">
        <span>All credits</span>
        <span>{cap}% to bill{slice ? '' : ' (max)'}</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-sun-soft p-3">
          <div className="flex items-center gap-1.5 text-[14px] font-bold text-sun-ink">
            <Sun size={15} /> SunD Credits
          </div>
          <div className="font-display text-[22px] font-bold tabular">~{fmtInt(credits)} SC</div>
          <div className="flex items-center gap-1 text-[13px] text-ink-muted tabular">
            <Car size={13} /> ≈ {fmtInt(scToKm(credits))} km / month
          </div>
        </div>
        <div className="rounded-2xl bg-sky-soft p-3">
          <div className="flex items-center gap-1.5 text-[14px] font-bold text-sky-deep">
            <ReceiptText size={15} /> Bill rebate
          </div>
          <div className="font-display text-[22px] font-bold tabular">{fmtRm(rebateRm)}</div>
          <div className="text-[13px] text-ink-muted">off TNB bill / month</div>
        </div>
      </div>
      {slice ? (
        <div className="mt-2 text-center text-[13px] text-ink-muted">Credits are issued at a flat 36 sen per kWh: about RM 40 off your bill every month</div>
      ) : (
        <>
          <div className="mt-2 text-center text-[13px] text-ink-muted">
            RM 1 of income = <b className="text-sun-ink">RM {CREDIT_TOPUP.toFixed(2)} in credits</b> (+{topup}%) or <b className="text-sky-deep">RM 1.00 off the bill</b>
          </div>
          <div className="mt-1 text-center text-[13px] text-ink-subtle">Rate, top-up and cap are SDP settings and may change</div>
        </>
      )}
    </div>
  );
}
