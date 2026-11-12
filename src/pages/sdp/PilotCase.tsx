import { Card, PageHeader, Pill } from '../../components/ui';
import { PILOT_CASE as P } from '../../data/pilot';
import { cx } from '../../lib/format';

const rm = (m: number) => `RM ${m}M`;

/** Sime Darby's view of the Phase 1 pilot: value, who pays for the build, when it pays back, and how sure. */
export default function PilotCase() {
  const share = Math.round((P.pays.topUpsM / P.build.totalM) * 100);
  const maxNpv = Math.max(...P.cases.map((c) => c.npvM));
  return (
    <>
      <PageHeader title="Pilot business case" />
      <div className="flex flex-col gap-4 px-5 pb-10 pt-4">
        <div>
          <Pill tone="slate">For Sime Darby · one Elmina precinct</Pill>
          <h1 className="mt-2 text-[24px] font-bold leading-8">Phase 1, the pilot</h1>
          <p className="text-[15px] text-ink-muted">25 years · 8% discount rate · before tax</p>
        </div>

        <div className="grid grid-cols-3 gap-2" data-pitch="case-kpis">
          {[
            { label: 'Value today (NPV)', value: rm(P.npvM) },
            { label: 'Return (IRR)', value: `${P.irrPct.toFixed(1)}%` },
            { label: 'Payback', value: `${P.paybackYears.toFixed(1)} yrs`, red: true },
          ].map((k) => (
            <div key={k.label} className={cx('rounded-2xl p-3', k.red ? 'bg-sun-soft' : 'bg-surface')}>
              <div className={cx('text-[12px] font-bold leading-4', k.red ? 'text-sun-ink' : 'text-ink-muted')}>{k.label}</div>
              <div className={cx('mt-1 font-display text-[20px] font-bold leading-6 tabular', k.red ? 'text-sun' : 'text-ink')}>{k.value}</div>
            </div>
          ))}
        </div>

        <Card className="p-4" pitch="case-pays">
          <div className="flex items-baseline justify-between">
            <span className="font-bold">Build, years 0–2</span>
            <span className="font-display text-[20px] font-bold tabular">RM {P.build.totalM}M</span>
          </div>
          <div className="mt-1 flex flex-col gap-0.5 text-[14px] text-ink-muted">
            {P.build.parts.map((x) => (
              <div key={x.label} className="flex justify-between">
                <span>{x.label}</span>
                <span className="tabular">RM {x.m}M</span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-[13px] font-bold text-ink-muted">Who pays</div>
          <div className="mt-1 flex h-10 gap-[2px] overflow-hidden rounded-xl text-[13px] font-bold text-white">
            <div className="flex items-center bg-sun px-2.5" style={{ width: `${share}%` }}>
              Top-ups RM {P.pays.topUpsM}M · {share}%
            </div>
            <div className="flex flex-1 items-center bg-sky px-2.5">Sime Darby · {100 - share}%</div>
          </div>
        </Card>

        <Card className="p-4" pitch="case-cases">
          <div className="flex items-baseline justify-between">
            <span className="font-bold">Positive in every case</span>
            <span className="text-[13px] text-ink-muted">NPV · payback</span>
          </div>
          <div className="mt-2 flex flex-col gap-2">
            {P.cases.map((c) => (
              <div key={c.name} className="flex items-center gap-3">
                <div className="w-[64px] shrink-0">
                  <div className="text-[15px] font-bold">{c.name}</div>
                  <div className="text-[11px] leading-3 text-ink-muted">{c.sessions} charges/lot/day</div>
                </div>
                <div className="flex flex-1 items-center gap-2">
                  <div className="h-5 rounded-r-[4px]" style={{ width: `${(c.npvM / maxNpv) * 62}%`, background: c.name === 'Base' ? 'var(--color-sun)' : 'var(--color-sky)' }} />
                  <span className={cx('whitespace-nowrap text-[14px] font-bold tabular', c.name === 'Base' && 'text-sun')}>RM {c.npvM.toFixed(2)}M</span>
                </div>
                <span className="w-[52px] shrink-0 text-right text-[14px] font-bold tabular">{c.payback.toFixed(1)} yrs</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <div className="font-bold">Sime Darby’s cash over 25 years</div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            {P.cash.map((c) => (
              <div key={c.year} className="rounded-2xl bg-surface p-2">
                <div className="text-[12px] text-ink-muted">Year {c.year}</div>
                <div className={cx('font-display text-[17px] font-bold tabular', c.m < 0 ? 'text-sun' : 'text-ink')}>{c.m === 0 ? 'Break-even' : `${c.m > 0 ? '+' : '−'}RM ${Math.abs(c.m)}M`}</div>
                <div className="text-[11px] text-ink-muted">{c.label}</div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[13px] text-ink-muted">With no top-ups at all, the NPV is still RM {P.npvNoTopUpsM}M.</p>
        </Card>

        <p className="text-center text-[12px] leading-4 text-ink-subtle">Research values from the team’s financial model (Scenarios tab) and pitch deck slide 7. Car-park traffic and the mall transformer’s spare capacity are still to confirm with SDP.</p>
      </div>
    </>
  );
}
