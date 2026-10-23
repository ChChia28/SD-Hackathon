import { Building2, HandHeart, KeyRound, ReceiptText, Sun, Wrench } from 'lucide-react';
import { RewardMix } from '../../components/RewardMix';
import { Button, Card, IconBubble, PageHeader, Pill, Row, SectionTitle } from '../../components/ui';
import { FlowRow } from '../../components/visual';
import { SLICE_KWH_PER_MONTH, TARIFF } from '../../data/constants';
import { fmtInt, fmtRm } from '../../lib/format';
import { useT } from '../../lib/i18n';
import { sliceValueRm } from '../../lib/pricing';
import { usePersona, useProfile } from '../../store/hooks';
import { useStore } from '../../store/useStore';

/** The 1 kW solar slice: what it is worth on this household's bill (appendix A4). */
export default function Slice() {
  const t = useT();
  const persona = usePersona();
  const prof = useProfile();
  const setSlice = useStore((s) => s.setSlice);
  const toast = useStore((s) => s.toast);
  const tariff = persona.tariff ?? TARIFF.low;
  const use = persona.monthlyUseKwh ?? 300;
  const billToday = use * tariff;
  const value = sliceValueRm(tariff);
  const withSlice = Math.max(0, billToday - value * prof.cashShare);

  if (persona.reward !== 'slice')
    return (
      <>
        <PageHeader title={t('Solar slice')} />
        <div className="flex flex-col gap-4 px-5 pb-10 pt-4">
          <Card tone="sky" className="p-5">
            <div className="font-bold">{t('Slices are for roofless SD households')}</div>
            <div className="mt-1 text-[15px] text-ink-muted">{t('Switch to Aisyah or Uncle Tan in the presenter controls to see one.')}</div>
          </Card>
        </div>
      </>
    );

  return (
    <>
      <PageHeader title={t('Solar slice')} />
      <div className="flex flex-col gap-6 px-5 pb-10 pt-4">
        <section className="card-navy p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[15px] font-bold text-white/80">
              <Sun size={18} className="text-sun-bright" /> {t('1 kW of the Elmina solar pool')}
            </div>
            {persona.sponsored && <span className="rounded-full bg-sun px-2.5 py-0.5 text-[13px] font-bold">{t('Sponsored')}</span>}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <div className="text-[14px] text-white/70">{t('Bill today')}</div>
              <div className="font-display text-[30px] font-bold tabular">{fmtRm(billToday)}</div>
            </div>
            <div>
              <div className="text-[14px] text-white/70">{t('With your slice')}</div>
              <div className="font-display text-[30px] font-bold text-sun-bright tabular">{fmtRm(withSlice)}</div>
            </div>
          </div>
          <div className="mt-2 text-[13px] text-white/60 tabular">
            {t('{u} kWh a month at ~{c} sen effective rate', { u: use, c: Math.round(tariff * 100) })}
          </div>
        </section>

        <Card tone="sun" className="p-5">
          <div className="mb-4 font-bold">{t('What a slice is worth')}</div>
          <FlowRow
            sep={['×', '=']}
            items={[
              { icon: <Sun size={24} />, label: `${SLICE_KWH_PER_MONTH} kWh`, sub: t('per month'), tone: 'sun' },
              { icon: <ReceiptText size={24} />, label: `${Math.round(tariff * 100)} sen`, sub: t('your tariff'), tone: 'sky' },
              { icon: <HandHeart size={24} />, label: fmtRm(value), sub: t('a month'), tone: 'leaf' },
            ]}
          />
          <div className="mt-3 text-center text-[13px] text-ink-muted">{t('Credits are issued at your own TNB rate, so the saving equals that kWh coming off your bill')}</div>
        </Card>

        {!persona.sponsored && (
          <Card tone="sky" className="p-4">
            <RewardMix />
          </Card>
        )}

        <section>
          <SectionTitle>{t('No roof needed')}</SectionTitle>
          <div className="grid grid-cols-3 gap-2">
            {[
              { Icon: Building2, label: t('Condo owners') },
              { Icon: KeyRound, label: t('Renters') },
              { Icon: HandHeart, label: t('B40, sponsored') },
            ].map((x) => (
              <div key={x.label} className="card flex flex-col items-center gap-2 p-3 text-center">
                <IconBubble tone="sky" size={40}>
                  <x.Icon size={20} />
                </IconBubble>
                <span className="text-[14px] font-bold leading-5">{x.label}</span>
              </div>
            ))}
          </div>
        </section>

        <Card className="divide-y divide-outline px-5 py-1">
          <Row label={t('This month so far')} value={`${fmtInt(prof.monthKwh)} kWh`} />
          <Row label={t('Off your bill so far')} value={fmtRm(prof.monthRebateRm)} tone="leaf" />
          <Row label={t('Supplier')} value={t('TNB, unchanged')} />
          <Row label={t('Installation')} value={<span className="flex items-center gap-1"><Wrench size={14} /> {t('None')}</span>} />
          <Row label={t('Funded by')} value={persona.sponsored ? t('Elmina solar dividend') : t('SDP rebate programme')} />
        </Card>

        {!persona.sponsored && (
          <Button
            variant={prof.sliceOn ? 'secondary' : 'primary'}
            onClick={() => {
              setSlice(!prof.sliceOn);
              toast({ icon: 'sun', title: prof.sliceOn ? t('Slice paused') : t('Slice active · 1 kW') });
            }}
          >
            {prof.sliceOn ? t('Pause my slice') : t('Subscribe to a 1 kW slice')}
          </Button>
        )}
        <div className="flex justify-center">
          <Pill tone="slate">{t('Credits are SDP rebates, not electricity sales')}</Pill>
        </div>
      </div>
    </>
  );
}
