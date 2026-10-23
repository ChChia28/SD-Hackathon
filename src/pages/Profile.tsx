import { Bell, BookOpen, Building, Car, CreditCard, Globe, Info, PlayCircle, Type as TypeIcon } from 'lucide-react';
import { LANGS } from '../lib/i18n';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, Button, Card, PageHeader, Pill, ProgressBar, Row, SectionTitle, Toggle } from '../components/ui';
import { EV, KM_PER_KWH, SOLAR_SELL_RATE_RM } from '../data/constants';
import { PERSONAS, PERSONA_IDS } from '../data/personas';
import { fmtInt } from '../lib/format';
import { usePersona, useProfile } from '../store/hooks';
import { useStore } from '../store/useStore';

export default function Profile() {
  const persona = usePersona();
  const prof = useProfile();
  const setPersona = useStore((s) => s.setPersona);
  const alerts = useStore((s) => s.surplusAlerts);
  const setAlerts = useStore((s) => s.setSurplusAlerts);
  const replay = useStore((s) => s.replayOnboarding);
  const toast = useStore((s) => s.toast);
  const nav = useNavigate();
  const setLang = useStore((s) => s.setLang);
  const setLarge = useStore((s) => s.setLargeText);

  return (
    <>
      <PageHeader title="Profile" />
      <div className="flex flex-col gap-6 px-5 pb-10 pt-6">
        <div className="flex items-center gap-4">
          <Avatar initials={persona.initials} size={72} />
          <div className="min-w-0">
            <div className="font-display text-[24px] font-bold leading-8">{persona.name}</div>
            <Pill tone="sky">{persona.tagline}</Pill>
            <div className="mt-1 text-[15px] text-ink-muted">{persona.address}</div>
          </div>
        </div>

        <section>
          <SectionTitle>Viewing as</SectionTitle>
          <div className="segmented">
            {PERSONA_IDS.map((p) => (
              <button key={p} type="button" aria-pressed={persona.id === p} onClick={() => setPersona(p)}>
                {PERSONAS[p].short}
              </button>
            ))}
          </div>

        </section>

        {persona.reward === 'cream' && (
          <section>
            <SectionTitle>My solar system</SectionTitle>
            <Card tone="leaf" className="divide-y divide-leaf-soft px-5 py-1">
              <Row label="Type" value={persona.systemLabel} />
              <Row label="Capacity" value={`${persona.kWp} kWp`} />
              <Row label="Panels" value={persona.panels} />
              <Row label="Solar income" value={`RM ${SOLAR_SELL_RATE_RM.toFixed(2)}/kWh${persona.rewardShare < 1 ? ` × ${Math.round(persona.rewardShare * 100)}%` : ''}`} />
              {persona.canRebate && (
                <Row
                  label="Reward mix"
                  value={
                    <Link to="/wallet" className="text-sky-deep underline">
                      {100 - Math.round(prof.cashShare * 100)}% credits · {Math.round(prof.cashShare * 100)}% rebate
                    </Link>
                  }
                />
              )}
              <Row label="Status" value="Active under CREAM" tone="leaf" />
              <Row label="Lifetime output" value={`${fmtInt(prof.lifetimeGenKwh)} kWh`} />
            </Card>
          </section>
        )}

        {persona.reward === 'slice' && (
          <section>
            <SectionTitle>My solar slice</SectionTitle>
            <Card tone="leaf" className="divide-y divide-leaf-soft px-5 py-1">
              <Row label="Type" value={persona.systemLabel} />
              <Row label="Size" value="1 kW of the Elmina pool" />
              <Row label="Credits issued at" value={`${Math.round((persona.tariff ?? 0) * 100)} sen/kWh (your tariff)`} />
              <Row label="Status" value={prof.sliceOn ? 'Active' : 'Paused'} tone="leaf" />
              <Row label="Lifetime output" value={`${fmtInt(prof.lifetimeGenKwh)} kWh`} />
            </Card>
          </section>
        )}

        {persona.drivesEv && <section>
          <SectionTitle>My vehicle</SectionTitle>
          <Card tone="sky" className="p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-soft text-sky-deep">
                <Car size={24} />
              </span>
              <div className="flex-1">
                <div className="font-bold">{EV.name}</div>
                <div className="text-[14px] text-ink-muted">
                  {KM_PER_KWH} km per kWh · {EV.batteryKwh} kWh battery
                </div>
              </div>
            </div>
            <ProgressBar value={prof.evSoc / 100} className="mt-4" />
            <div className="mt-1.5 text-[14px] text-ink-muted tabular">
              {Math.round(prof.evSoc)}% · ≈ {fmtInt((prof.evSoc / 100) * EV.batteryKwh * KM_PER_KWH)} km range
            </div>
          </Card>
        </section>}

        <section>
          <SectionTitle>Payment methods</SectionTitle>
          <Card className="divide-y divide-outline">
            <div className="flex min-h-14 items-center gap-3 px-4">
              <Building size={20} className="text-ink-muted" />
              <span className="flex-1 font-bold">FPX online banking</span>
              <Pill tone="slate">Default</Pill>
            </div>
            <div className="flex min-h-14 items-center gap-3 px-4">
              <CreditCard size={20} className="text-ink-muted" />
              <span className="flex-1 font-bold">Visa •••• 4821</span>
            </div>
          </Card>
        </section>

        <section>
          <SectionTitle>Settings</SectionTitle>
          <Card className="divide-y divide-outline">
            <div className="flex min-h-16 items-center gap-3 px-4">
              <Bell size={20} className="text-ink-muted" />
              <div className="flex-1">
                <div className="font-bold">Green SunD Bay alerts</div>
                <div className="text-[14px] text-ink-muted">Surplus solar nearby</div>
              </div>
              <Toggle on={alerts} onChange={setAlerts} label="Green SunD Bay alerts" />
            </div>
            <div className="flex min-h-16 items-center gap-3 px-4">
              <Globe size={20} className="text-ink-muted" />
              <span className="flex-1 font-bold">Language</span>
              <div className="segmented w-40">
                {LANGS.map((l) => (
                  <button key={l.id} type="button" aria-pressed={prof.lang === l.id} onClick={() => setLang(l.id)}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex min-h-16 items-center gap-3 px-4">
              <TypeIcon size={20} className="text-ink-muted" />
              <div className="flex-1">
                <div className="font-bold">Large text</div>
                <div className="text-[14px] text-ink-muted">Bigger type and buttons</div>
              </div>
              <Toggle on={prof.largeText} onChange={setLarge} label="Large text" />
            </div>
            <Link to="/sources" className="flex min-h-16 items-center gap-3 px-4">
              <BookOpen size={20} className="text-ink-muted" />
              <span className="flex-1 font-bold">Sources and assumptions</span>
            </Link>
          </Card>
        </section>

        <Card tone="sky" className="flex items-center gap-3 p-5">
          <Info size={20} className="shrink-0 text-sky-deep" />
          <div>
            <div className="font-bold">SunD Wallet · v2.0</div>
            <div className="text-[14px] text-ink-muted">Prototype · simulated data</div>
          </div>
        </Card>

        <Button
          variant="secondary"
          onClick={() => {
            replay();
            nav('/');
          }}
        >
          <PlayCircle size={20} /> Replay onboarding
        </Button>
      </div>
    </>
  );
}
