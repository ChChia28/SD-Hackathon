import { Building2, Check, CircleUser, Coins, Footprints, HeartHandshake, Home as HomeIcon, KeyRound, Loader2, MapPin, ReceiptText, Snowflake, Sun, Zap } from 'lucide-react';
import { SLICE_KWH_PER_MONTH, SOLAR_SELL_RATE_RM, YIELD_KWH_PER_KWP_DAY } from '../data/constants';
import { useEffect, useState, type ReactNode } from 'react';
import { SunMark } from '../components/shell';
import { Button, Card, Pill } from '../components/ui';
import { RewardMix } from '../components/RewardMix';
import { FlowRow, LoopGraphic } from '../components/visual';
import { PERSONAS, PERSONA_IDS } from '../data/personas';
import { cx } from '../lib/format';
import { useStore } from '../store/useStore';
import type { PersonaId } from '../store/types';

const SLIDES: { title: string; caption: string; visual: ReactNode }[] = [
  {
    title: 'Every surface makes solar',
    caption: 'Rooftops, bay canopies and walkway roofs all feed one township pool',
    visual: (
      <FlowRow
        size={64}
        items={[
          { icon: <HomeIcon size={30} />, label: 'Rooftops', sub: '1 MWp today', tone: 'sky' },
          { icon: <Zap size={30} />, label: 'Canopies', sub: 'SunD Bays', tone: 'leaf' },
          { icon: <Footprints size={30} />, label: 'Walkways', sub: 'SunD Walk', tone: 'sun' },
        ]}
      />
    ),
  },
  {
    title: 'No roof? Own a slice',
    caption: `A 1 kW slice ≈ ${SLICE_KWH_PER_MONTH} kWh a month, worth ≈ RM 40 in SunD credits`,
    visual: (
      <div className="flex flex-col gap-6">
        <FlowRow
          sep={['×', '=']}
          size={60}
          items={[
            { icon: <Sun size={28} />, label: `${SLICE_KWH_PER_MONTH} kWh`, sub: 'per month', tone: 'sun' },
            { icon: <ReceiptText size={28} />, label: '36 sen', sub: 'flat rate', tone: 'sky' },
            { icon: <Coins size={28} />, label: '≈ RM 40', sub: 'off the bill', tone: 'leaf' },
          ]}
        />
        <div className="flex flex-wrap justify-center gap-2">
          <Pill tone="sky" icon={<Building2 size={15} />}>Condo owners</Pill>
          <Pill tone="sky" icon={<KeyRound size={15} />}>Renters</Pill>
          <Pill tone="berry" icon={<HeartHandshake size={15} />}>B40 sponsored</Pill>
        </div>
      </div>
    ),
  },
  {
    title: 'Spend it where it is made',
    caption: '1 SC = RM 1, only at solar-powered places: never leaks out of the loop',
    visual: (
      <LoopGraphic
        nodes={[
          { icon: <Zap size={26} />, label: 'SunD Bay', tone: 'sky' },
          { icon: <Footprints size={26} />, label: 'SunD Walk', tone: 'sun' },
          { icon: <Snowflake size={26} />, label: 'SunD Cool', tone: 'berry' },
        ]}
      />
    ),
  },
];

const PERSONA_ICON = { landed: HomeIcon, condo: Building2, public: CircleUser, elder: HeartHandshake };
const PERSONA_TAGS: Record<PersonaId, string[]> = {
  landed: ['CREAM roof host', 'Credits on top of lease'],
  condo: ['No roof', '1 kW solar slice'],
  public: ['Pay per kWh', 'Saver deals'],
  elder: ['Sponsored slice', 'Heat alerts'],
};

const TOWNSHIPS = [
  { name: 'City of Elmina', live: true },
  { name: 'Bandar Bukit Raja', live: false },
  { name: 'Serenia City', live: false },
];

type Step = 'splash' | 'intro' | 'persona' | 'link' | 'detect' | 'found' | 'mix';

export default function Onboarding() {
  const complete = useStore((s) => s.completeOnboarding);
  const setActivePersona = useStore((s) => s.setPersona);
  const [step, setStep] = useState<Step>('splash');
  const [slide, setSlide] = useState(0);
  const [persona, setPersona] = useState<PersonaId>('condo');
  const [unit, setUnit] = useState('');
  const p = PERSONAS[persona];

  useEffect(() => {
    if (step === 'splash') {
      const id = window.setTimeout(() => setStep('intro'), 1800);
      return () => window.clearTimeout(id);
    }
    if (step === 'detect') {
      const id = window.setTimeout(() => setStep('found'), 1400);
      return () => window.clearTimeout(id);
    }
  }, [step]);

  if (step === 'splash')
    return (
      <button type="button" onClick={() => setStep('intro')} className="relative flex flex-1 flex-col items-center justify-center gap-5 bg-sky px-8 text-center text-white">
        <span className="star-pop">
          <SunMark size={96} />
        </span>
        <div>
          <div className="font-display text-[44px] font-bold leading-[48px]">
            Sun<span className="text-sun-bright">D</span> Wallet
          </div>
          <div className="mt-2 text-[20px] leading-8 text-sky-soft">The sun is already on our roofs.</div>
        </div>
        <div className="absolute bottom-10 text-[14px] text-sky-soft">by Sime Darby Property · demo</div>
      </button>
    );

  if (step === 'intro') {
    const s = SLIDES[slide];
    const last = slide === SLIDES.length - 1;
    return (
      <div className="flex flex-1 flex-col px-6 pb-8 pt-4">
        <div className="flex justify-end">
          <button type="button" className="btn btn-ghost" onClick={() => setStep('persona')}>
            Skip
          </button>
        </div>
        <div key={slide} className="rise-in flex flex-1 flex-col justify-center">
          <div className="rounded-[28px] bg-sky-wash px-4 py-8">{s.visual}</div>
          <h1 className="mt-8 text-center text-[30px] font-bold leading-10">{s.title}</h1>
          <p className="mt-2 text-center text-[18px] text-ink-muted">{s.caption}</p>
        </div>
        <div className="mb-6 flex justify-center gap-2" aria-label={`Slide ${slide + 1} of ${SLIDES.length}`}>
          {SLIDES.map((_, i) => (
            <span key={i} className={cx('h-2.5 rounded-full transition-all duration-300', i === slide ? 'w-8 bg-sky' : 'w-2.5 bg-ink-faint')} />
          ))}
        </div>
        <Button size="lg" onClick={() => (last ? setStep('persona') : setSlide(slide + 1))}>
          {last ? 'Get started' : 'Next'}
        </Button>
      </div>
    );
  }

  if (step === 'persona')
    return (
      <div className="scroll px-6 pb-8 pt-8">
        <h1 className="text-[32px] font-bold leading-10">Who are you?</h1>
        <p className="mt-1 text-[18px] text-ink-muted">Switch any time in Profile.</p>
        <div className="mt-6 flex flex-col gap-3">
          {PERSONA_IDS.map((id) => {
            const Icon = PERSONA_ICON[id];
            const sel = persona === id;
            return (
              <button key={id} type="button" aria-pressed={sel} onClick={() => setPersona(id)} className={cx('card flex min-h-24 items-center gap-4 p-4 text-left', sel && 'card-active')}>
                <span className={cx('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl', sel ? 'bg-sky text-white' : 'bg-sky-soft text-sky-deep')}>
                  <Icon size={28} />
                </span>
                <span className="flex-1">
                  <span className="block text-[19px] font-bold leading-7">{PERSONAS[id].label}</span>
                  <span className="block text-[14px] text-ink-muted">{PERSONAS[id].short} · {PERSONAS[id].tagline}</span>
                  <span className="mt-1 flex flex-wrap gap-1.5">
                    {PERSONA_TAGS[id].map((t) => (
                      <Pill key={t} tone={sel ? 'sky' : 'slate'}>
                        {t}
                      </Pill>
                    ))}
                  </span>
                </span>
                {sel && <Check size={24} className="shrink-0 text-sky-deep" />}
              </button>
            );
          })}
        </div>
        <Button
          size="lg"
          className="mt-8 w-full"
          onClick={() => {
            if (persona === 'public') return complete('public');
            setUnit(p.address);
            setStep('link');
          }}
        >
          Continue
        </Button>
      </div>
    );

  if (step === 'link')
    return (
      <div className="scroll px-6 pb-8 pt-8">
        <h1 className="text-[32px] font-bold leading-10">Link your home</h1>
        <div className="mt-6 text-[15px] font-bold text-ink-muted">Township</div>
        <div className="mt-2 flex flex-col gap-2">
          {TOWNSHIPS.map((t) => (
            <div key={t.name} className={cx('card flex min-h-14 items-center gap-3 px-4', t.live ? 'card-active' : 'opacity-60')}>
              <MapPin size={20} className={t.live ? 'text-sky-deep' : 'text-ink-subtle'} />
              <span className="flex-1 font-bold">{t.name}</span>
              {t.live ? <Check size={20} className="text-sky-deep" /> : <Pill tone="slate">Soon</Pill>}
            </div>
          ))}
        </div>
        <label className="mt-6 block text-[15px] font-bold text-ink-muted" htmlFor="unit">
          Address / unit
        </label>
        <input
          id="unit"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="mt-2 w-full rounded-[12px] border border-outline bg-surface px-5 py-4 text-[18px] outline-none focus:border-sky focus:ring-4 focus:ring-sky-soft"
        />
        <Button size="lg" className="mt-8 w-full" onClick={() => setStep('detect')}>
          {PERSONAS[persona].reward === 'cream' ? 'Find my solar' : 'Find my slice'}
        </Button>
      </div>
    );

  const landed = persona === 'landed';
  const slice = p.reward === 'slice';
  const facts = landed
    ? [
        { v: `~${Math.round(p.kWp * YIELD_KWH_PER_KWP_DAY)}`, u: 'kWh/day' },
        { v: `~RM ${Math.round(p.kWp * YIELD_KWH_PER_KWP_DAY * 30 * SOLAR_SELL_RATE_RM)}`, u: 'income/month' },
        { v: '+20%', u: 'as credits' },
      ]
    : [
        { v: `≈${SLICE_KWH_PER_MONTH}`, u: 'kWh/month' },
        { v: `~RM ${Math.round(SLICE_KWH_PER_MONTH * (p.tariff ?? 0.35))}`, u: 'off bill/month' },
        { v: p.sponsored ? 'RM 0' : 'No roof', u: p.sponsored ? 'sponsored' : 'needed' },
      ];
  if (step === 'mix')
    return (
      <div className="scroll px-6 pb-8 pt-8">
        <h1 className="text-[32px] font-bold leading-10">Choose your mix</h1>
        <p className="mt-1 text-[18px] text-ink-muted">Change it any time in Wallet.</p>
        <Card tone="sky" className="mt-6 p-4">
          <RewardMix />
        </Card>
        <Button size="lg" className="mt-8 w-full" onClick={() => complete(persona)}>
          Open SunD Wallet
        </Button>
      </div>
    );
  return (
    <div className="flex flex-1 flex-col px-6 pb-8 pt-8">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        {step === 'detect' ? (
          <>
            <Loader2 size={56} className="spin text-sky" />
            <h1 className="mt-6 text-[24px] font-bold leading-8">{landed ? 'Checking CREAM register…' : 'Reserving your 1 kW slice…'}</h1>
          </>
        ) : (
          <div className="rise-in w-full">
            <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-leaf-soft text-leaf-deep">
              <Check size={48} strokeWidth={2.5} />
            </span>
            <h1 className="mt-6 text-[28px] font-bold leading-9">{landed ? 'Found it!' : p.sponsored ? 'Your slice is sponsored' : 'Your slice is ready'}</h1>
            <Card tone="leaf" className="mt-6 p-5 text-left">
              <div className="text-[14px] font-bold uppercase tracking-wider text-leaf-ink">{p.systemLabel}</div>
              <div className="mt-1 font-display text-[28px] font-bold">
                {slice ? 'No roof needed · 1 kW of the pool' : `${p.kWp} kWp · ${p.panels} panels`}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {facts.map((x) => (
                  <div key={x.u} className="rounded-2xl bg-page p-2">
                    <div className="font-display text-[22px] font-bold tabular">{x.v}</div>
                    <div className="text-[13px] text-ink-muted">{x.u}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
      {step === 'found' && (
        <Button size="lg" onClick={() => {
            if (p.sponsored) {
              setActivePersona(persona);
              return complete(persona);
            }
            // The mix edits the active persona's wallet, so switch to it first.
            setActivePersona(persona);
            setStep('mix');
          }}>
          {p.sponsored ? 'Open SunD Wallet' : 'Next: choose your mix'}
        </Button>
      )}
    </div>
  );
}
