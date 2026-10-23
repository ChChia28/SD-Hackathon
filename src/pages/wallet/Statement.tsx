import { Download } from 'lucide-react';
import { BarChart } from '../../components/charts';
import { Button, Card, PageHeader, Row, SectionTitle } from '../../components/ui';
import { CREDIT_TOPUP, DEMO_LEASE_RM, KM_PER_KWH, SOLAR_SELL_RATE_RM } from '../../data/constants';
import { fmt, fmtInt, fmtRm, monthName } from '../../lib/format';
import { usesCredits } from '../../lib/pricing';
import { isEbikeTx } from '../../data/rewards';
import { pastDailyKwh } from '../../sim/solar';
import { usePersona, useProfile } from '../../store/hooks';
import { useStore } from '../../store/useStore';

const DAY = 86_400_000;

export default function Statement() {
  const persona = usePersona();
  const prof = useProfile();
  const simTime = useStore((s) => s.simTime);
  const toast = useStore((s) => s.toast);
  const d = new Date(simTime);
  const month = d.getMonth();
  const dom = d.getDate();
  const inMonth = prof.txs.filter((t) => new Date(t.at).getMonth() === month && new Date(t.at).getFullYear() === d.getFullYear());
  const charges = inMonth.filter((t) => t.type === 'charge');
  const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
  const scCharging = -sum(charges.map((t) => t.sc ?? 0));
  const bonus = sum(charges.map((t) => t.bonusSc ?? 0));
  const facilities = -sum(inMonth.filter((t) => t.type === 'redeem' && !isEbikeTx(t)).map((t) => t.sc ?? 0));
  const rides = inMonth.filter(isEbikeTx);
  const saverTopups = sum(inMonth.filter((t) => t.type === 'topup').map((t) => t.saver ?? 0));
  const kwhCharged = sum(charges.map((t) => t.kwh ?? 0));
  const solarKm = sum(charges.map((t) => ((t.kwh ?? 0) * (t.solarPct ?? 0)) / 100)) * KM_PER_KWH;
  const daily = Array.from({ length: dom }, (_, i) => (i === dom - 1 ? prof.todayKwh : pastDailyKwh(persona.kWp, simTime - (dom - 1 - i) * DAY)));

  return (
    <>
      <PageHeader title="Monthly statement" />
      <div className="flex flex-col gap-6 px-5 pb-10 pt-4">
        <div>
          <div className="text-[15px] text-ink-muted">{persona.name}</div>
          <h1 className="text-[26px] font-bold leading-8">
            {monthName(simTime)} {d.getFullYear()}
          </h1>
          <div className="text-[15px] text-ink-muted">1–{dom} {monthName(simTime)}, to date</div>
        </div>

        {persona.kWp > 0 && (
          <section>
            <SectionTitle>Generation</SectionTitle>
            <Card tone="leaf" className="p-4">
              <BarChart values={daily} labels={daily.map((_, i) => ((i + 1) % 5 === 0 || i === 0 ? String(i + 1) : ''))} highlight={dom - 1} color="var(--color-leaf-deep)" dim="var(--color-leaf)" label="Daily generation this month" height={120} />
              <div className="mt-2 divide-y divide-outline">
                <Row label={`${persona.systemLabel} generated`} value={`${fmt(prof.monthKwh)} kWh`} />
                {persona.reward === 'cream' ? (
                  <>
                    <Row label={`Solar income (× RM ${SOLAR_SELL_RATE_RM.toFixed(2)}/kWh)`} value={fmtRm(prof.monthKwh * persona.rewardShare * SOLAR_SELL_RATE_RM)} />
                    <Row label={`SunD Credits (${100 - Math.round(prof.cashShare * 100)}% + ${Math.round((CREDIT_TOPUP - 1) * 100)}% top-up)`} value={`+${fmt(prof.monthCredits)} SC`} tone="leaf" />
                  </>
                ) : (
                  <>
                    <Row label={`Slice value (× ${Math.round((persona.tariff ?? 0) * 100)} sen/kWh, your tariff)`} value={fmtRm(prof.monthKwh * (persona.tariff ?? 0))} />
                    {prof.monthCredits > 0.005 && <Row label="SunD Credits" value={`+${fmt(prof.monthCredits)} SC`} tone="leaf" />}
                  </>
                )}
                {persona.canRebate && <Row label={`Bill rebate (${Math.round(prof.cashShare * 100)}% of ${persona.reward === 'cream' ? 'income' : 'slice'})`} value={`+${fmtRm(prof.monthRebateRm)}`} />}
              </div>
            </Card>
          </section>
        )}

        <section>
          <SectionTitle>Wallet activity</SectionTitle>
          <Card className="divide-y divide-outline px-5 py-1">
            {usesCredits(persona.id) && (
              <>
                <Row label="Spent on charging" value={`−${fmt(scCharging)} SC`} />
                <Row label="Bonus credits" value={`+${fmt(bonus, 2)} SC`} tone="berry" />
                <Row label="Clubhouse" value={`−${fmt(facilities, 0)} SC`} />
              </>
            )}
            <Row label="eBike rides" value={`${rides.length} rides`} />
            <Row label="Saver Credits bought" value={`+${fmtRm(saverTopups)}`} />
            <Row label="Energy charged" value={`${fmt(kwhCharged)} kWh`} />
            <Row label="Driven on solar" value={`${fmtInt(solarKm)} km`} tone="leaf" />
            {usesCredits(persona.id) && <Row label="SunD Credit balance" value={`${fmt(prof.sc)} SC`} strong />}
            <Row label="Saver Credit balance" value={fmtRm(prof.saver)} strong />
          </Card>
        </section>

        {persona.id === 'landed' && (
          <Card tone="sky" className="p-5">
            <div className="flex items-center justify-between">
              <span className="font-bold">CREAM rooftop lease</span>
              <span className="font-bold tabular">{fmtRm(DEMO_LEASE_RM)}</span>
            </div>
            <div className="mt-1 text-[14px] text-ink-muted">Paid to your bank · credits are extra · demo value</div>
          </Card>
        )}

        <Button variant="secondary" onClick={() => toast({ icon: 'gift', title: 'Statement saved', body: 'PDF · demo' })}>
          <Download size={20} /> Download PDF
        </Button>
      </div>
    </>
  );
}
