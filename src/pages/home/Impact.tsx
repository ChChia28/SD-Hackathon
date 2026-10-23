import { Card, PageHeader, SectionTitle, Stat } from '../../components/ui';
import { WhyCredits } from '../../components/visual';
import { CO2_KG_PER_KWH, TOWNSHIP, WALK_DELTA_C } from '../../data/constants';
import { PERSONAS } from '../../data/personas';
import { fmt, fmtInt } from '../../lib/format';
import { useBayViews } from '../../store/hooks';
import { useStore } from '../../store/useStore';

/** A node in the flow diagram. */
function Node({ x, y, w, h = 48, title, sub, tone }: { x: number; y: number; w: number; h?: number; title: string; sub: string; tone: 'leaf' | 'sky' | 'sun' | 'slate' | 'berry' }) {
  const fills = { leaf: 'var(--color-leaf-soft)', sky: 'var(--color-sky-soft)', sun: 'var(--color-sun-soft)', slate: 'var(--color-sunken)', berry: 'var(--color-berry-soft)' };
  const strokes = { leaf: 'var(--color-leaf-deep)', sky: 'var(--color-sky)', sun: 'var(--color-sun-deep)', slate: 'var(--color-outline-strong)', berry: 'var(--color-berry)' };
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={12} fill={fills[tone]} stroke={strokes[tone]} strokeWidth={1.5} />
      <text x={x + w / 2} y={y + h / 2 - 3} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--color-ink)">
        {title}
      </text>
      <text x={x + w / 2} y={y + h / 2 + 13} textAnchor="middle" fontSize={10} fill="var(--color-ink-muted)">
        {sub}
      </text>
    </g>
  );
}

function Flow({ d, color = 'var(--color-leaf-deep)', label, lx, ly }: { d: string; color?: string; label?: string; lx?: number; ly?: number }) {
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={2.5} className="flow" markerEnd="url(#arrow)" />
      {label && (
        <text x={lx} y={ly} fontSize={11} fill="var(--color-ink-muted)" fontWeight={700}>
          {label}
        </text>
      )}
    </g>
  );
}

export default function Impact() {
  const host = useStore((s) => s.profiles.landed);
  const views = useBayViews();
  // Elmina Ridge 1: 1 MWp across 228 roofs, scaled from one 4.4 kWp roof's live output.
  const perKwp = host.todayKwh / PERSONAS.landed.kWp;
  const todayKwh = perKwp * TOWNSHIP.mwp * 1000;
  const monthKwh = (host.monthKwh / PERSONAS.landed.kWp) * TOWNSHIP.mwp * 1000;
  const count = (st: string) => views.filter((v) => v.status === st).length;
  const col = [18, 128, 238];

  return (
    <>
      <PageHeader title="Township Impact" />
      <div className="flex flex-col gap-6 px-5 pb-10 pt-4">
        <div>
          <h1 className="text-[24px] font-bold leading-8">One loop for Elmina</h1>
          <p className="mt-1 text-ink-muted">Every surface generates · one wallet shares · the township uses it where it is made</p>
        </div>

        <Card tone="sky" className="p-3">
          <svg viewBox="0 0 350 420" className="w-full" role="img" aria-label="GENERATE: rooftops, bay canopies and walkway roofs, plus balcony kits from 2027. SHARE: the SunD Wallet gives roof hosts credits, roofless households a 1 kW slice and B40 households a sponsored slice. USE: SunD Bay, SunD Walk and SunD Cool. Public charging revenue funds the next bay.">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0 0 10 5 0 10z" fill="var(--color-ink-muted)" />
              </marker>
            </defs>
            <text x={10} y={16} fontSize={11} fontWeight={800} letterSpacing="0.12em" fill="var(--color-sun-deep)">GENERATE</text>
            <Node x={col[0]} y={24} w={98} title="Rooftops" sub={`${TOWNSHIP.mwp} MWp today`} tone="sun" />
            <Node x={col[1]} y={24} w={98} title="Bay canopies" sub="2.5 kWp / lot" tone="sun" />
            <Node x={col[2]} y={24} w={98} title="Walkway roofs" sub="SunD Walk" tone="sun" />
            <text x={175} y={92} textAnchor="middle" fontSize={11} fill="var(--color-ink-muted)">+ SunD Balcony kits · 2027 sandbox</text>

            <text x={10} y={128} fontSize={11} fontWeight={800} letterSpacing="0.12em" fill="var(--color-sky)">SHARE</text>
            <Node x={18} y={136} w={314} h={56} title="SunD Wallet · one account per resident" sub="Roof hosts · 1 kW slices · sponsored B40" tone="sky" />

            <text x={10} y={232} fontSize={11} fontWeight={800} letterSpacing="0.12em" fill="var(--color-leaf-ink)">USE</text>
            <Node x={col[0]} y={240} w={98} title="SunD Bay" sub="0 km, solar first" tone="leaf" />
            <Node x={col[1]} y={240} w={98} title="SunD Walk" sub={`−${WALK_DELTA_C} °C shade`} tone="leaf" />
            <Node x={col[2]} y={240} w={98} title="SunD Cool" sub="heat-alert days" tone="leaf" />
            <Node x={18} y={346} w={314} title="Public drivers pay per kWh" sub="Revenue funds the next canopy and bay" tone="berry" />

            <Flow d="M175 74 V130" color="var(--color-sun-deep)" label="credits" lx={182} ly={112} />
            <Flow d="M67 196 V234" color="var(--color-sky)" />
            <Flow d="M177 196 V234" color="var(--color-sky)" />
            <Flow d="M287 196 V234" color="var(--color-sky)" />
            <Flow d="M67 290 V340" color="var(--color-berry)" />
            <Flow d="M332 370 C 350 300, 350 90, 336 52" color="var(--color-berry)" label="next bay" lx={286} ly={318} />
          </svg>
        </Card>

        <section>
          <SectionTitle>Elmina Ridge 1 in numbers</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <Stat tone="leaf" label="Made today" value={fmtInt(todayKwh)} unit="kWh" />
            <Stat tone="leaf" label="This month" value={fmt(monthKwh / 1000, 1)} unit="MWh" />
            <Stat tone="sun" label="Roofs today" value={TOWNSHIP.homes} unit="homes" />
            <Stat tone="leaf" label="CO₂ if used locally" value={fmt((monthKwh * CO2_KG_PER_KWH) / 1000, 1)} unit="t / month" />
            <Stat tone="sky" label="Homes planned" value={fmtInt(TOWNSHIP.homesPlanned)} unit="City of Elmina" />
            <Stat tone="sky" label="SunD Bays" value={views.length} />
          </div>
          <p className="mt-2 text-[13px] text-ink-subtle">Scaled from one 4.4 kWp roof’s simulated output to 1 MWp · grid factor 0.74 kg CO₂/kWh (EC 2024)</p>
        </section>

        <section>
          <SectionTitle>SunD Bays right now</SectionTitle>
          <Card className="divide-y divide-outline">
            {[
              { st: 'surplus', label: 'Solar surplus (discounted)', cls: 'bg-leaf-deep' },
              { st: 'normal', label: 'Available', cls: 'bg-sky' },
              { st: 'busy', label: 'All ports busy', cls: 'bg-coral' },
              { st: 'grid', label: 'On grid backup', cls: 'bg-[#8A8E9C]' },
            ].map((r) => (
              <div key={r.st} className="flex items-center gap-3 px-4 py-3">
                <span className={`h-3 w-3 rounded-full ${r.cls}`} />
                <span className="flex-1">{r.label}</span>
                <span className="font-bold tabular">{count(r.st)}</span>
              </div>
            ))}
          </Card>
        </section>

        <Card tone="berry" className="p-4">
          <div className="mb-3 font-bold">Next: beyond Elmina</div>
          <div className="flex flex-wrap gap-2">
            {['Bandar Bukit Raja', 'Serenia City', 'Malls & offices', 'Partner petrol stations', 'SunD Balcony 2027'].map((t) => (
              <span key={t} className="rounded-full bg-page px-3 py-1 text-[14px] font-bold text-berry-ink">
                {t}
              </span>
            ))}
          </div>
          <div className="mt-2 text-[14px] text-ink-muted">Open to every EV driver · every bay runs on its own canopy + battery</div>
        </Card>

        <Card tone="leaf" className="p-4">
          <div className="mb-3 font-bold">Why credits first?</div>
          <WhyCredits />
        </Card>
      </div>
    </>
  );
}
