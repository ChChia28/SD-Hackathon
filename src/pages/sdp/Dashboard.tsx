import { ArrowLeft, BatteryCharging, Calculator, CheckCircle2, CircleDashed, Clock3, Leaf, Smartphone, Sun, TrendingUp } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { SunD, SunMark } from '../../components/shell';
import { STATUS_META } from '../../components/status';
import { BAYS, PHASE_LABEL } from '../../data/bays';
import { MARKET_DC, TOWNSHIP } from '../../data/constants';
import { BAY_SIZES, DEFAULT_WHATIF, bayEconomics, type BaySize, type WhatIf } from '../../lib/economics';
import { cx, fmtDate, fmtInt, fmtTime } from '../../lib/format';
import { useBayViews } from '../../store/hooks';
import { useStore } from '../../store/useStore';
import { computeKpis, type KpiStatus } from '../../sim/kpis';

const STATUS_STYLE: Record<KpiStatus, { label: string; cls: string; Icon: typeof CheckCircle2 }> = {
  met: { label: 'On target', cls: 'bg-leaf-soft text-leaf-ink', Icon: CheckCircle2 },
  track: { label: 'Below target', cls: 'bg-coral-soft text-coral-ink', Icon: TrendingUp },
  waiting: { label: 'Not yet measured', cls: 'bg-sunken text-ink-muted', Icon: CircleDashed },
};

function Slider({ label, value, min, max, step, onChange, show }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; show: string }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[14px] font-bold text-ink-muted">{label}</span>
        <span className="font-display text-[18px] font-bold tabular">{show}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 h-8 w-full cursor-pointer accent-[var(--color-sky)]" />
    </label>
  );
}

function Panel({ title, icon, children, className }: { title: string; icon: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx('card p-5', className)}>
      <h2 className="mb-4 flex items-center gap-2 text-[18px] font-bold">
        <span className="text-sun">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Payback against sessions per lot per day: the one number that decides the business case (A3, A5 KPI 3). */
function PaybackCurve({ w }: { w: WhatIf }) {
  const xs = Array.from({ length: 26 }, (_, i) => 0.5 + i * 0.1);
  const pts = xs.map((x) => ({ x, p: bayEconomics({ ...w, sessionsPerLot: x }).payback }));
  const W = 320;
  const H = 120;
  const maxY = 15;
  const px = (x: number) => ((x - 0.5) / 2.5) * W;
  const py = (y: number) => H - (Math.min(y, maxY) / maxY) * H;
  const line = (k: 0 | 1) =>
    pts
      .filter((p) => p.p)
      .map((p, i) => `${i ? 'L' : 'M'}${px(p.x).toFixed(1)} ${py(p.p![k]).toFixed(1)}`)
      .join(' ');
  return (
    <svg viewBox={`-28 -8 ${W + 40} ${H + 30}`} className="w-full" role="img" aria-label="Payback years against sessions per lot per day">
      {[0, 5, 10, 15].map((y) => (
        <g key={y}>
          <line x1={0} x2={W} y1={py(y)} y2={py(y)} stroke="var(--color-outline)" />
          <text x={-6} y={py(y) + 4} fontSize={10} textAnchor="end" fill="var(--color-ink-subtle)">
            {y}y
          </text>
        </g>
      ))}
      {[0.5, 1, 1.5, 2, 2.5, 3].map((x) => (
        <text key={x} x={px(x)} y={H + 16} fontSize={10} textAnchor="middle" fill="var(--color-ink-subtle)">
          {x}
        </text>
      ))}
      <path d={line(1)} fill="none" stroke="var(--color-ink-faint)" strokeWidth={2} />
      <path d={line(0)} fill="none" stroke="var(--color-sky)" strokeWidth={2.5} />
      <line x1={px(w.sessionsPerLot)} x2={px(w.sessionsPerLot)} y1={0} y2={H} stroke="var(--color-sun)" strokeDasharray="4 4" strokeWidth={2} />
    </svg>
  );
}

export default function Dashboard() {
  const simTime = useStore((s) => s.simTime);
  const weather = useStore((s) => s.weather);
  const heat = useStore((s) => s.heat.on);
  const profiles = useStore((s) => s.profiles);
  const demoWallets = useStore((s) => s.demoWallets);
  const views = useBayViews();
  const kpis = useMemo(() => computeKpis({ simTime, weather, heat, profiles, demoWallets }), [simTime, weather, heat, profiles, demoWallets]);
  const [w, setW] = useState<WhatIf>(DEFAULT_WHATIF);
  const e = bayEconomics(w);
  const gate = kpis.slice(0, 3).filter((k) => k.status === 'met').length;
  const month = new Date(simTime).toLocaleString('en-MY', { month: 'long' });
  const up = (p: Partial<WhatIf>) => setW((x) => ({ ...x, ...p }));

  return (
    <div className="min-h-dvh bg-sunken">
      <header className="bg-sky text-white">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-4 px-5 py-4">
          <SunMark size={40} />
          <div className="min-w-0 flex-1">
            <div className="font-display text-[20px] font-bold leading-6">
              <SunD /> pilot dashboard · Sime Darby Property
            </div>
            <div className="text-[14px] text-white/70">
              Elmina pilot precinct · simulated · {fmtDate(simTime)}, {fmtTime(simTime)}
            </div>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-[13px] font-bold">Simulated pilot data · targets from appendix A17</span>
          <Link to="/" className="btn btn-onnavy !min-h-11">
            <ArrowLeft size={18} /> <Smartphone size={18} /> Back to app
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1280px] flex-col gap-6 px-5 py-6">
        <section className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h1 className="text-[28px] font-bold leading-9">Seven KPIs, each with a month-1 baseline</h1>
            <p className="text-ink-muted">Go / no-go at month 6 is taken on KPIs 1, 2 and 3. Every figure ties to the wallet ledger, charger meters or TNB smart-meter data.</p>
          </div>
          <div className={cx('card-navy flex items-center gap-4 px-5 py-4')}>
            <div>
              <div className="text-[13px] font-bold uppercase tracking-wider text-white/70">Go / no-go · KPIs 1–3</div>
              <div className="font-display text-[30px] font-bold leading-9">{gate} of 3 on target</div>
              <div className="text-[13px] text-white/70">{month} · live from the simulation</div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((k) => {
            const st = STATUS_STYLE[k.status];
            return (
              <div key={k.n} className={cx('card flex flex-col gap-2 p-4', k.n <= 3 && 'border-sky-bright')}>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky text-[13px] font-bold text-white">{k.n}</span>
                  <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] font-bold', st.cls)}>
                    <st.Icon size={13} /> {st.label}
                  </span>
                </div>
                <div className="text-[14px] font-bold leading-5 text-ink-muted">{k.name}</div>
                <div className="font-display text-[30px] font-bold leading-9 tabular">
                  {k.value} {k.unit && <span className="text-[14px] font-bold text-ink-muted">{k.unit}</span>}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[12px] leading-4">
                  <div className="rounded-xl bg-sunken p-2">
                    <div className="text-ink-subtle">Baseline</div>
                    <div className="font-bold">{k.baseline}</div>
                  </div>
                  <div className="rounded-xl bg-sky-wash p-2">
                    <div className="text-ink-subtle">Month-6 target</div>
                    <div className="font-bold">{k.target}</div>
                  </div>
                </div>
                <div className="text-[12px] leading-4 text-ink-subtle">{k.note}</div>
              </div>
            );
          })}
          <div className="card flex flex-col justify-center gap-1 border-dashed p-4">
            <div className="flex items-center gap-2 text-[14px] font-bold text-ink-muted">
              <Sun size={16} className="text-sun" /> Nudges · kWh moved into 11am–3pm
            </div>
            <div className="font-display text-[30px] font-bold tabular">
              {fmtInt((Object.values(profiles).reduce((a, p) => a + p.nudgeKwh, 0) / 4) * (312 + demoWallets))} <span className="text-[14px] text-ink-muted">kWh this month</span>
            </div>
            <div className="text-[12px] text-ink-subtle">Demo personas’ average × wallets · read from TNB smart-meter data in the pilot</div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <Panel title="What if? Bay business case (appendix A14)" icon={<Calculator size={20} />}>
            <div className="segmented mb-4" role="group" aria-label="Bay size">
              {(Object.keys(BAY_SIZES) as BaySize[]).map((s) => (
                <button key={s} type="button" aria-pressed={w.size === s} onClick={() => up({ size: s })}>
                  {BAY_SIZES[s].label}
                </button>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Slider label="Sessions per lot per day" value={w.sessionsPerLot} min={0.5} max={3} step={0.1} onChange={(v) => up({ sessionsPerLot: v })} show={w.sessionsPerLot.toFixed(1)} />
              <Slider label="Public price per kWh" value={w.publicPrice} min={1} max={1.8} step={0.05} onChange={(v) => up({ publicPrice: v })} show={`RM ${w.publicPrice.toFixed(2)}`} />
              <Slider label="Public share of kWh" value={w.publicShare} min={0.3} max={0.9} step={0.05} onChange={(v) => up({ publicShare: v })} show={`${Math.round(w.publicShare * 100)}%`} />
              <Slider label="Grid top-up cost per kWh" value={w.gridCost} min={0.35} max={0.6} step={0.01} onChange={(v) => up({ gridCost: v })} show={`RM ${w.gridCost.toFixed(2)}`} />
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-[12px]">
              <button type="button" className="chip !min-h-8 !text-[13px]" onClick={() => setW(DEFAULT_WHATIF)}>
                Reset to appendix A14
              </button>
              <span className="rounded-full bg-sunken px-3 py-1.5 text-ink-muted">Market DC RM {MARKET_DC.low.toFixed(2)}–{MARKET_DC.high.toFixed(2)}</span>
              <span className="rounded-full bg-sunken px-3 py-1.5 text-ink-muted">18 kWh per session · residents pay in credits</span>
            </div>
          </Panel>

          <Panel title="Result" icon={<TrendingUp size={20} />}>
            <div className="grid grid-cols-2 gap-3">
              <div className="card-navy p-4">
                <div className="text-[13px] font-bold text-white/70">Simple payback</div>
                <div className="font-display text-[30px] font-bold leading-9 tabular">{e.payback ? `${e.payback[0].toFixed(1)}–${e.payback[1].toFixed(1)}` : 'Never'}</div>
                <div className="text-[13px] text-white/70">years, after GITA</div>
              </div>
              <div className="rounded-[18px] bg-sky-wash p-4">
                <div className="text-[13px] font-bold text-ink-muted">Net cash a year</div>
                <div className={cx('font-display text-[30px] font-bold leading-9 tabular', e.netYear < 0 && 'text-coral-ink')}>RM {fmtInt(e.netYear / 1000)}k</div>
                <div className="text-[13px] text-ink-muted tabular">RM {fmtInt(e.netDay)} a day</div>
              </div>
              <div className="rounded-[18px] bg-leaf-wash p-4">
                <div className="text-[13px] font-bold text-ink-muted">CO₂ avoided a year</div>
                <div className="font-display text-[26px] font-bold leading-8 tabular">{fmtInt(e.co2Year)} t</div>
                <div className="text-[13px] text-ink-muted tabular">{fmtInt(e.solarKwh)} solar kWh a day</div>
              </div>
              <div className="rounded-[18px] bg-sunken p-4">
                <div className="text-[13px] font-bold text-ink-muted">Energy a day</div>
                <div className="font-display text-[26px] font-bold leading-8 tabular">{fmtInt(e.soldKwh)} kWh</div>
                <div className="text-[13px] text-ink-muted tabular">{Math.round(e.solarShare * 100)}% from the canopy</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-[13px] text-ink-muted">
                <span>Payback (years) vs sessions per lot per day</span>
                <span>
                  <span className="text-sky">━</span> low capex <span className="ml-2 text-ink-faint">━</span> high capex
                </span>
              </div>
              <PaybackCurve w={w} />
            </div>
            <p className="mt-2 text-[12px] leading-4 text-ink-subtle">
              Capex {BAY_SIZES[w.size].capex[0]}–{BAY_SIZES[w.size].capex[1]}M before tax allowance ({BAY_SIZES[w.size].effective[0]}–{BAY_SIZES[w.size].effective[1]}M after GITA) · build {BAY_SIZES[w.size].build}. Not counted: Saver Credit pre-sales, partner fees, REC value, the launch USP.
            </p>
          </Panel>
        </section>

        <Panel title="SunD Bays right now" icon={<BatteryCharging size={20} />}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[14px]">
              <thead className="text-[12px] uppercase tracking-wider text-ink-subtle">
                <tr>
                  <th className="py-2">Bay</th>
                  <th>Phase</th>
                  <th>Status</th>
                  <th className="text-right">Solar stock</th>
                  <th className="text-right">Solar now</th>
                  <th className="text-right">Ports free</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline">
                {BAYS.map((b) => {
                  const v = views.find((x) => x.bay.id === b.id)!;
                  const m = STATUS_META[v.status];
                  return (
                    <tr key={b.id}>
                      <td className="py-2.5 font-bold">{b.name}</td>
                      <td className="text-ink-muted">{PHASE_LABEL[b.phase]}</td>
                      <td>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: m.color }} /> {m.label}
                        </span>
                      </td>
                      <td className="text-right tabular">{Math.round(v.live.soc)}%</td>
                      <td className="text-right tabular">{v.solarPct}%</td>
                      <td className="text-right tabular">
                        {v.free}/{v.total}
                      </td>
                      <td className="text-ink-muted">{v.source}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { Icon: Clock3, title: 'Weeks 1–8 · Build', body: 'Wallet MVP + this dashboard · 10-lot pilot bay · one hall as SunD Cool · credit pool funded by bay charging profit' },
            { Icon: Leaf, title: 'Months 3–6 · Pilot', body: 'One precinct of condo owners and renters as subscribers · KPIs vs month-1 baselines · go / no-go with SDP' },
            { Icon: TrendingUp, title: 'Months 6–12 · Extend', body: 'First SunD Walk spine · medium bay at the mall · bays open to public drivers, revenue starts' },
          ].map((x) => (
            <div key={x.title} className="card p-4">
              <div className="flex items-center gap-2 font-bold">
                <x.Icon size={18} className="text-sun" /> {x.title}
              </div>
              <p className="mt-1 text-[14px] text-ink-muted">{x.body}</p>
            </div>
          ))}
        </section>
        <p className="pb-6 text-center text-[13px] text-ink-subtle">
          KPI values are simulated for the demo; targets, baselines and the cost model are from the SunD appendix (A2, A3, A5). <Link to="/sources" className="underline">Sources</Link>
        </p>
      </main>
    </div>
  );
}
