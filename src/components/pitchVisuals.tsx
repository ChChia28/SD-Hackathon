import { RefreshCw, Sun, Wallet, Zap, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import township from '../assets/sund-township.jpg';
import { cx } from '../lib/format';

// The pitch-mode pages that show a picture instead of the phone. Figures are the deck's (v12, slides 3 and 6–8)
// and the Sheet's Scenarios tab; nothing here is computed. The township picture is the deck's slide 3 illustration.

/** A card the height of the phone on a laptop; on phones it fills the space between the slide bar and the captions. */
function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="pitch-visual rise-in w-[min(820px,100%)] overflow-y-auto rounded-[32px] border border-outline bg-page shadow-soft no-scrollbar">
      <div className="flex min-h-full flex-col justify-center gap-5 px-4 py-5 sm:gap-7 sm:px-10 sm:py-8 min-[1200px]:py-6">{children}</div>
    </div>
  );
}

const Kicker = ({ children }: { children: ReactNode }) => <div className="text-[14px] font-extrabold uppercase tracking-[0.16em] text-ink-subtle">{children}</div>;

function Swatch({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span className="flex items-center gap-2 text-[14px] font-bold text-ink-muted">
      <span className="h-3 w-3 rounded-[3px]" style={{ background: color }} />
      {children}
    </span>
  );
}

const NAVY = 'var(--color-sky)';
const RED = 'var(--color-sun)';

/** Slide 2: who pays for township solar, and what a resident gets, today and with SunD. */
function Problem() {
  const row = (label: string, segs: { w: number; color: string; text: string }[]) => (
    <div className="flex items-center gap-4">
      <span className="w-[80px] shrink-0 text-[15px] font-bold text-ink sm:w-[104px] sm:text-[17px]">{label}</span>
      <div className="flex h-[52px] flex-1 gap-[2px]">
        {segs.map((s, i) => (
          <div key={s.text} className={cx('flex items-center px-2 text-[13px] font-bold text-white sm:px-4 sm:text-[17px]', i === 0 && 'rounded-l-xl', i === segs.length - 1 && 'rounded-r-xl')} style={{ width: `${s.w}%`, background: s.color }}>
            {s.text}
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <Frame>
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <Kicker>Who pays to build the solar</Kicker>
          <div className="flex gap-4">
            <Swatch color={RED}>Customers’ top-ups</Swatch>
            <Swatch color={NAVY}>Sime Darby</Swatch>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {row('Today', [{ w: 100, color: NAVY, text: 'Sime Darby · 100%' }])}
          {row('With SunD', [
            { w: 53, color: RED, text: 'Top-ups · 53%' },
            { w: 47, color: NAVY, text: 'Sime Darby · 47%' },
          ])}
        </div>
      </section>

      <section>
        <Kicker>What a resident feels</Kicker>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div className="rounded-[20px] bg-sunken p-4 sm:p-5">
            <div className="text-[15px] font-bold text-ink-muted">Today</div>
            <div className="mt-1 text-[22px] font-bold leading-8 text-ink-muted sm:text-[34px] sm:leading-[44px]">Almost nothing</div>
            <div className="mt-1 text-[16px] leading-6 text-ink-muted">The panels sit on Sime Darby’s roofs</div>
          </div>
          <div className="rounded-[20px] bg-sun-soft p-4 sm:p-5">
            <div className="text-[15px] font-bold text-sun-ink">With SunD</div>
            <div className="mt-1 text-[32px] font-bold leading-[40px] text-sun sm:text-[44px] sm:leading-[44px]">+30%</div>
            <div className="mt-1 text-[16px] leading-6 text-ink">more value on money they already spend here</div>
          </div>
        </div>
      </section>

      <div className="rounded-2xl bg-sky px-4 py-3 text-center text-[16px] font-bold text-white sm:px-6 sm:py-4 sm:text-[21px]">
        So it stays a pilot. <span className="text-sun-bright">SunD lets residents pay in, and feel it.</span>
      </div>
      <p className="-mt-3 text-[13px] text-ink-subtle">Deck slides 7–8: build RM 7.2M, of which top-ups RM 3.8M (53%) · a RM 500 top-up gets RM 650 (+30%).</p>
    </Frame>
  );
}

const PLACES = [
  { n: 1, name: 'Mall roof solar', phase: 1 },
  { n: 2, name: 'SunD Bay', phase: 1 },
  { n: 3, name: 'Home solar', phase: 2 },
  { n: 4, name: 'Balcony solar', phase: 2 },
  { n: 5, name: 'SunD Walk', phase: 2 },
  { n: 6, name: 'SunD Cool', phase: 2 },
];

const LOOP: { Icon: LucideIcon; word: string; sub: string }[] = [
  { Icon: Sun, word: 'Make', sub: 'Solar on roofs, canopies and balconies' },
  { Icon: Zap, word: 'Use', sub: 'Bays, the mall, Walk and Cool run on it' },
  { Icon: Wallet, word: 'Spend', sub: 'Credits in the SunD Wallet, only inside SD' },
  { Icon: RefreshCw, word: 'Grow', sub: 'Top-ups build the next roof' },
];

/** The four steps round a circle, clockwise from the top, with SunD in the middle. */
function LoopRing() {
  const c = 90;
  const r = 68;
  const at = (deg: number) => [c + r * Math.sin((deg * Math.PI) / 180), c - r * Math.cos((deg * Math.PI) / 180)];
  return (
    <svg viewBox="0 0 180 180" className="h-[136px] w-[136px] sm:h-[184px] sm:w-[184px]" role="img" aria-label="Make, use, spend, grow: one loop">
      <defs>
        <marker id="loop-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 10 5 0 10z" fill="var(--color-sun)" />
        </marker>
      </defs>
      {[0, 90, 180, 270].map((a) => {
        const [x1, y1] = at(a + 24);
        const [x2, y2] = at(a + 66);
        return <path key={a} d={`M${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2}`} fill="none" stroke="var(--color-sun)" strokeWidth={3.5} strokeLinecap="round" markerEnd="url(#loop-arrow)" />;
      })}
      {LOOP.map((s, i) => {
        const [x, y] = at(i * 90);
        return (
          <g key={s.word} transform={`translate(${x} ${y})`}>
            <circle r={17} fill="#fff" stroke="var(--color-sun)" strokeWidth={2.5} />
            <s.Icon x={-9} y={-9} size={18} color="var(--color-sky)" strokeWidth={2.4} />
          </g>
        );
      })}
      <circle cx={c} cy={c} r={33} fill="var(--color-sky)" />
      <text x={c} y={c + 6} textAnchor="middle" fontSize={19} fontWeight={800} fill="#fff">
        Sun<tspan fill="var(--color-sun-bright)">D</tspan>
      </text>
    </svg>
  );
}

function LoopLabel({ i, align }: { i: number; align: 'center' | 'left' | 'right' }) {
  const s = LOOP[i];
  return (
    <div className={cx('flex flex-col gap-0.5', align === 'center' && 'items-center text-center', align === 'right' && 'items-end text-right')}>
      <span className="flex items-center gap-1.5 text-[16px] font-bold text-ink sm:text-[18px]">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sun text-[12px] font-bold text-white">{i + 1}</span>
        {s.word}
      </span>
      <span className="max-w-[190px] text-[13px] leading-4 text-ink-muted sm:text-[14px] sm:leading-5">{s.sub}</span>
    </div>
  );
}

/** Slide 1: every SunD facility in one township, then the loop that ties them together. */
function Cover() {
  return (
    <Frame>
      <section>
        <Kicker>Every SunD facility, one township</Kicker>
        <img
          src={township}
          alt="The SunD township: 1 mall roof solar, 2 SunD Bay, 3 home solar, 4 balcony solar, 5 SunD Walk, 6 SunD Cool. Phase 1, the pilot: Wallet, mall roof, SunD Bay. Phase 2: home solar, balcony, Walk, Cool."
          className="mt-3 max-h-[42vh] w-full rounded-[20px] object-contain min-[1200px]:max-h-[min(36vh,calc(100dvh_-_495px))]"
        />
      </section>

      {/* Phones: the six places, then the loop. Laptops: side by side, so the page fits without scrolling. */}
      <div className="grid gap-5 min-[1200px]:grid-cols-[190px_1fr] min-[1200px]:items-center min-[1200px]:gap-6">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 min-[1200px]:grid-cols-1 min-[1200px]:gap-y-2.5">
          {PLACES.map((p) => (
            <span key={p.n} className="flex items-center gap-2 text-[14px] font-bold text-ink min-[1200px]:text-[15px]">
              <span className={cx('flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] text-white', p.phase === 1 ? 'bg-sun' : 'bg-sky')}>{p.n}</span>
              {p.name}
            </span>
          ))}
        </div>
        <section>
          <Kicker>One solar loop</Kicker>
          <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-x-3 gap-y-2">
            <div />
            <LoopLabel i={0} align="center" />
            <div />
            <LoopLabel i={3} align="right" />
            <LoopRing />
            <LoopLabel i={1} align="left" />
            <div />
            <LoopLabel i={2} align="center" />
            <div />
          </div>
        </section>
      </div>
    </Frame>
  );
}

const SCENARIOS = [
  { name: 'Bear', npv: 0.69, payback: 10.6, sessions: 1.3 },
  { name: 'Base', npv: 2.26, payback: 9.0, sessions: 1.6, base: true },
  { name: 'Bull', npv: 4.82, payback: 7.0, sessions: 2.0 },
];

/** Slide 7: the headline numbers, then the same model in a bear, base and bull case. */
function Numbers() {
  const max = Math.max(...SCENARIOS.map((s) => s.npv));
  const kpi = (label: string, value: string, red?: boolean) => (
    <div className={cx('rounded-[20px] p-3 sm:p-5', red ? 'bg-sun-soft' : 'bg-sunken')}>
      <div className={cx('text-[12px] font-bold sm:text-[15px]', red ? 'text-sun-ink' : 'text-ink-muted')}>{label}</div>
      <div className={cx('mt-1 text-[20px] font-bold leading-7 tabular sm:text-[38px] sm:leading-[44px]', red ? 'text-sun' : 'text-ink')}>{value}</div>
    </div>
  );
  return (
    <Frame>
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {kpi('Value today (NPV)', 'RM 2.26M')}
        {kpi('Return (IRR)', '12.0%')}
        {kpi('Payback', '9.0 years', true)}
      </div>

      <section>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-1">
          <Kicker>Positive in every case</Kicker>
          <span className="text-[14px] text-ink-muted">Value today (NPV), RM million</span>
        </div>
        <div className="flex flex-col gap-4">
          {SCENARIOS.map((s) => (
            <div key={s.name} className="flex items-center gap-4">
              <div className="w-[88px] shrink-0 sm:w-[150px]">
                <div className="text-[16px] font-bold text-ink sm:text-[18px]">{s.name}</div>
                <div className="text-[13px] leading-4 text-ink-muted">{s.sessions} charges per lot a day</div>
              </div>
              <div className="flex flex-1 items-center gap-3">
                <div className="h-8 rounded-r-[4px]" style={{ width: `${(s.npv / max) * 64}%`, background: s.base ? RED : NAVY }} />
                <span className={cx('whitespace-nowrap text-[15px] font-bold tabular sm:text-[20px]', s.base ? 'text-sun' : 'text-ink')}>RM {s.npv.toFixed(2)}M</span>
              </div>
              <div className="w-[64px] shrink-0 text-right sm:w-[96px]">
                <div className="text-[15px] font-bold tabular text-ink sm:text-[18px]">{s.payback.toFixed(1)} yrs</div>
                <div className="text-[13px] text-ink-muted">payback</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-2xl bg-sky px-4 py-3 text-center text-[15px] font-bold leading-6 text-white sm:px-6 sm:py-4 sm:text-[19px] sm:leading-7">
        Where it lands rests on two facts only SDP has: <span className="text-sun-bright">car-park traffic and the mall transformer’s spare capacity.</span>
      </div>
      <p className="-mt-3 text-[13px] text-ink-subtle">Sheet, Scenarios tab: bear / base / bull also move running cost, grid connection and how fast credits are spent. One precinct, 25 years, 8%, before tax.</p>
    </Frame>
  );
}

export type VisualKind = 'cover' | 'problem' | 'numbers';

export function PitchVisual({ kind }: { kind: VisualKind }) {
  return kind === 'cover' ? <Cover /> : kind === 'problem' ? <Problem /> : <Numbers />;
}
