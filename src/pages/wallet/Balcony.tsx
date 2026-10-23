import { CheckCircle2, FileCheck2, Globe2, Grid3x3, Plug, ShieldCheck, Sun } from 'lucide-react';
import { Button, Card, IconBubble, PageHeader, Pill, Row, SectionTitle } from '../../components/ui';
import { FlowRow } from '../../components/visual';
import { BALCONY } from '../../data/constants';
import { useT } from '../../lib/i18n';
import { useProfile } from '../../store/hooks';
import { useStore } from '../../store/useStore';

/** SunD Balcony: plug-in kits proposed as an SDP pilot inside the Energy Commission's 2027 sandbox (A7). */
export default function Balcony() {
  const t = useT();
  const prof = useProfile();
  const join = useStore((s) => s.joinBalcony);
  return (
    <>
      <PageHeader title="SunD Balcony" />
      <div className="flex flex-col gap-6 px-5 pb-10 pt-4">
        <section className="card-navy p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[15px] font-bold text-white/80">
              <Grid3x3 size={18} className="text-sun-bright" /> {t('Your own panels, on your balcony')}
            </div>
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[13px] font-bold">2027</span>
          </div>
          <div className="mt-2 font-display text-[30px] font-bold leading-9 tabular">
            ~{BALCONY.kwhMonth} kWh <span className="text-[17px] text-white/60">/ {t('month')}</span>
          </div>
          <div className="mt-1 text-[15px] text-white/75 tabular">
            {BALCONY.watts} W {t('plug-in kit')} · RM {BALCONY.rmLow}–{BALCONY.rmHigh} {t('off the bill a month')}
          </div>
          <div className="mt-4">
            {prof.balconyWaitlist ? (
              <div className="flex items-center gap-2 font-bold text-sun-bright">
                <CheckCircle2 size={20} /> {t('On the waitlist for the sandbox pilot')}
              </div>
            ) : (
              <Button variant="red" className="w-full" onClick={join}>
                {t('Join the waitlist')}
              </Button>
            )}
          </div>
        </section>

        <Card tone="sun" className="p-5">
          <FlowRow
            items={[
              { icon: <Sun size={24} />, label: `${BALCONY.watts} W`, sub: t('2 panels'), tone: 'sun' },
              { icon: <Plug size={24} />, label: t('Socket'), sub: t('micro-inverter'), tone: 'sky' },
              { icon: <Grid3x3 size={24} />, label: '+SC', sub: t('bonus per kWh'), tone: 'leaf' },
            ]}
          />
          <div className="mt-3 text-center text-[13px] text-ink-muted">{t('Self-use cuts the bill directly; a bonus credit per kWh lands in SunD Wallet')}</div>
        </Card>

        <section>
          <SectionTitle>{t('Why 2027')}</SectionTitle>
          <Card className="divide-y divide-outline px-5 py-1">
            <Row label={t('Germany today')} value={`${BALCONY.germanyUnits} ${t('systems')}`} />
            <Row label={t('Malaysia today')} value={t('No framework yet')} tone="coral" />
            <Row label={t('Opening')} value={t('EC regulatory sandbox, 2027')} />
            <Row label={t('Kit price (DE)')} value={BALCONY.kitEur} />
          </Card>
        </section>

        <section>
          <SectionTitle>{t('Sandbox safety rules we propose')}</SectionTitle>
          <div className="flex flex-col gap-2">
            {[
              { Icon: ShieldCheck, title: t('Certified kits only'), sub: 'IEC 62109 / 61730 · anti-islanding' },
              { Icon: Plug, title: t('Zero export'), sub: t('Socket circuit checked by a registered contractor') },
              { Icon: FileCheck2, title: t('Strata by-law'), sub: t('Standard brackets and façade rules via the JMB/MC') },
              { Icon: Globe2, title: t('One SDP condo tower first'), sub: t('50–100 units in City of Elmina') },
            ].map((x) => (
              <Card key={x.title} className="flex items-center gap-3 p-3.5">
                <IconBubble tone="slate" size={40}>
                  <x.Icon size={20} />
                </IconBubble>
                <div>
                  <div className="font-bold leading-5">{x.title}</div>
                  <div className="text-[14px] text-ink-muted">{x.sub}</div>
                </div>
              </Card>
            ))}
          </div>
        </section>
        <div className="flex justify-center">
          <Pill tone="slate">{t('Not part of the 6-month pilot')}</Pill>
        </div>
      </div>
    </>
  );
}
