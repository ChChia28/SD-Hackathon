import { Check, Sun } from 'lucide-react';
import { useState } from 'react';
import { AreaChart, BarChart } from '../../components/charts';
import { Card, LinkButton, PageHeader, SectionTitle, Stat } from '../../components/ui';
import { fmt, fmtInt } from '../../lib/format';
import { energyBetween, hourOf, pastDailyKwh, solarKw } from '../../sim/solar';
import { usePersona, useProfile } from '../../store/hooks';
import { useStore } from '../../store/useStore';

const DAY = 86_400_000;
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function SolarDetail() {
  const persona = usePersona();
  const prof = useProfile();
  const simTime = useStore((s) => s.simTime);
  const weather = useStore((s) => s.weather);
  const [range, setRange] = useState<'day' | 'week' | 'month'>('day');

  if (!persona.kWp)
    return (
      <>
        <PageHeader title="Solar generation" />
        <div className="p-6 text-center">
          <Sun size={48} className="mx-auto text-ink-subtle" />
          <p className="mt-4 text-[18px] text-ink-muted">No solar linked to this account.</p>
          <LinkButton to="/home/impact" className="mt-6">
            See Township Impact
          </LinkButton>
        </div>
      </>
    );

  const h = hourOf(simTime);
  const points = Array.from({ length: 57 }, (_, i) => {
    const x = 6 + i * 0.25;
    return { x, y: solarKw(persona.kWp, x, weather) };
  });
  const peak = Math.max(...points.map((p) => p.y));
  const forecast = energyBetween(persona.kWp, 0, 24, weather);
  const d = new Date(simTime);
  const dom = d.getDate();

  const week = Array.from({ length: 7 }, (_, i) => {
    const t = simTime - (6 - i) * DAY;
    return { v: i === 6 ? prof.todayKwh : pastDailyKwh(persona.kWp, t), label: i === 6 ? 'Today' : WEEKDAYS[new Date(t).getDay()] };
  });
  const month = Array.from({ length: dom }, (_, i) => {
    const t = simTime - (dom - 1 - i) * DAY;
    return { v: i === dom - 1 ? prof.todayKwh : pastDailyKwh(persona.kWp, t), label: (i + 1) % 5 === 0 || i === 0 ? String(i + 1) : '' };
  });
  const average = persona.kWp * 3.6 * Math.max(1, dom - 1 + h / 24);
  const vsAvg = Math.round((prof.monthKwh / average - 1) * 100);

  return (
    <>
      <PageHeader title="Solar generation" />
      <div className="flex flex-col gap-6 px-5 pb-10 pt-4">
        <div className="segmented" role="group" aria-label="Range">
          {(['day', 'week', 'month'] as const).map((r) => (
            <button key={r} type="button" aria-pressed={range === r} onClick={() => setRange(r)}>
              {r === 'day' ? 'Today' : r === 'week' ? 'Week' : 'Month'}
            </button>
          ))}
        </div>

        <Card className="p-4">
          {range === 'day' && (
            <>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="font-bold">Output today (kW)</span>
                <span className="text-[14px] text-ink-muted">dashed = forecast</span>
              </div>
              <AreaChart points={points} nowX={h} xMin={6} xMax={20} ticks={[9, 12, 15, 18].map((x) => ({ x, label: x === 12 ? '12 pm' : x < 12 ? `${x} am` : `${x - 12} pm` }))} />
            </>
          )}
          {range === 'week' && (
            <>
              <div className="mb-2 font-bold">Last 7 days (kWh)</div>
              <BarChart values={week.map((w) => w.v)} labels={week.map((w) => w.label)} highlight={6} color="var(--color-leaf-deep)" dim="var(--color-leaf)" label="Daily generation, last 7 days" />
            </>
          )}
          {range === 'month' && (
            <>
              <div className="mb-2 font-bold">This month (kWh per day)</div>
              <BarChart values={month.map((m) => m.v)} labels={month.map((m) => m.label)} highlight={dom - 1} color="var(--color-leaf-deep)" dim="var(--color-leaf)" label="Daily generation this month" />
            </>
          )}
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Stat tone="leaf" label="Right now" value={fmt(solarKw(persona.kWp, h, weather), 2)} unit="kW" />
          <Stat tone="leaf" label="Peak today" value={fmt(peak, 1)} unit="kW" />
          <Stat tone="sky" label="Made today" value={fmt(prof.todayKwh)} unit="kWh" />
          <Stat tone="sky" label="Expected" value={fmt(forecast, 0)} unit="kWh" />
          <Stat tone="sky" label="This month" value={fmtInt(prof.monthKwh)} unit="kWh" />
          <Stat tone="sun" label="Credits" value={fmt(prof.monthCredits)} unit="SC" />
        </div>

        <Card tone={vsAvg >= 0 ? 'leaf' : 'sky'} className="flex items-center gap-4 p-5">
          <span className={`font-display text-[32px] font-bold tabular ${vsAvg >= 0 ? 'text-leaf-ink' : 'text-sky-deep'}`}>
            {vsAvg >= 0 ? '+' : '−'}
            {Math.abs(vsAvg)}%
          </span>
          <span className="text-ink-muted">vs Elmina average ({persona.kWp} kWp)</span>
        </Card>

        <section>
          <SectionTitle>Panel health</SectionTitle>
          <Card tone="sky" className="p-5">
            <div className="grid grid-cols-7 gap-2" aria-label={`${persona.panels} panels, all working`}>
              {Array.from({ length: persona.panels }, (_, i) => (
                <span key={i} className="flex aspect-[3/4] items-center justify-center rounded-md bg-sky-deep text-leaf">
                  <Check size={14} strokeWidth={3} />
                </span>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 font-bold text-leaf-ink">
              <Check size={20} /> {persona.panels}/{persona.panels} panels OK
            </div>
            <div className="mt-1 text-[14px] text-ink-muted">Monitored under CREAM · inspected 3 months ago</div>
          </Card>
        </section>
      </div>
    </>
  );
}
