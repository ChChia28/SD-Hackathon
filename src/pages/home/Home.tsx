import { ArrowRight, Car, Footprints, Leaf, MapPin, QrCode, Snowflake, Sun, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BayRow } from '../../components/bay';
import { HouseSolar } from '../../components/illustrations';
import { TabHeader } from '../../components/shell';
import { Card, IconBubble, LinkButton, Pill, ProgressBar, SectionTitle, SeeAll, Stat } from '../../components/ui';
import { CO2_KG_PER_KWH, TOWNSHIP } from '../../data/constants';
import { BalconyTeaser, CoolRoomCard, HeatAlertCard, PeakNudgeCard, SliceCard, SponsoredNote, WalkTeaser } from '../../components/sund';
import { useT } from '../../lib/i18n';
import { getBay } from '../../data/bays';
import { fmt, fmtInt, fmtRm } from '../../lib/format';
import { scToKm, usesCredits } from '../../lib/pricing';
import { hourOf, isDaylight, solarKw } from '../../sim/solar';
import { useBayViews, usePersona, useProfile } from '../../store/hooks';
import { useStore } from '../../store/useStore';

export default function Home() {
  const t = useT();
  const persona = usePersona();
  const prof = useProfile();
  const simTime = useStore((s) => s.simTime);
  const heat = useStore((s) => s.heat.on);
  const h = hourOf(simTime);
  const greeting = h < 12 ? t('Good morning') : h < 18 ? t('Good afternoon') : t('Good evening');
  const resident = usesCredits(persona.id);
  const elder = persona.id === 'elder';

  return (
    <>
      <TabHeader />
      <div className="flex flex-col gap-6 px-5 pb-8 pt-2">
        <h1 className="text-[26px] font-bold leading-8">
          {greeting}, {t(persona.short)}
        </h1>
        <HeatAlertCard />
        <SessionBanner />
        {persona.reward === 'cream' && <LiveSolarCard />}
        {persona.reward === 'slice' && <SliceCard />}
        {persona.reward === 'none' && <SaverCard />}
        <SponsoredNote />
        <PeakNudgeCard />
        {resident && persona.drivesEv && <CreditCard />}
        {elder && !heat && <CoolRoomCard />}
        {persona.drivesEv && <NearestBay />}
        {!elder && <QuickActions />}
        {elder && <WalkTeaser />}
        <section>
          <SectionTitle>{t('Your solar story')}</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            {persona.reward === 'cream' && (
              <>
                <Stat tone="leaf" label="Made this month" value={fmtInt(prof.monthKwh)} unit="kWh" />
                <Stat tone="sun" label="Credits this month" value={fmt(prof.monthCredits)} unit="SC" />
              </>
            )}
            {persona.reward === 'slice' && (
              <>
                <Stat tone="leaf" label={t('Slice this month')} value={fmtInt(prof.monthKwh)} unit="kWh" />
                <Stat tone="sun" label={t('Off your bill')} value={fmt(prof.monthRebateRm, 2)} unit="RM" />
              </>
            )}
            {persona.reward === 'none' && (
              <>
                <Stat tone="leaf" label="Green charges" value={prof.greenCharges} />
                <Stat tone="sun" label="Solar charged" value={fmtInt(prof.solarKwhCharged)} unit="kWh" />
              </>
            )}
            {persona.drivesEv ? (
              <Stat tone="sky" label="Driven on solar" value={fmtInt(prof.kmOnSolar)} unit="km" />
            ) : (
              <Stat tone="sky" label={t('Moved to solar hours')} value={fmt(prof.nudgeKwh, 0)} unit="kWh" />
            )}
            <Stat tone="leaf" label={t('CO₂ avoided')} value={fmtInt(persona.reward === 'slice' ? prof.monthKwh * CO2_KG_PER_KWH + prof.co2Kg : prof.co2Kg)} unit="kg" />
          </div>
        </section>
        {persona.id === 'condo' && <BalconyTeaser />}
        {!elder && persona.reward !== 'cream' && <WalkTeaser />}
        <ImpactTeaser />
      </div>
    </>
  );
}

function SessionBanner() {
  const session = useStore((s) => s.session);
  const evSoc = useProfile().evSoc;
  if (!session) return null;
  const done = session.status === 'done';
  return (
    <Card to={done && session.txId ? `/charge/receipt/${session.txId}` : '/charge/session'} className="flex items-center gap-3 border-leaf bg-leaf-soft p-4">
      <IconBubble tone="leaf">
        <Zap size={22} fill="currentColor" />
      </IconBubble>
      <div className="flex-1">
        <div className="font-bold">{done ? 'Charging complete' : `Charging at ${getBay(session.bayId).name}`}</div>
        <div className="text-[15px] text-leaf-ink tabular">
          {done ? 'Tap to see your receipt' : `${Math.round(evSoc)}% battery · +${fmt(session.delivered)} kWh so far`}
        </div>
      </div>
      <ArrowRight size={20} className="text-leaf-ink" />
    </Card>
  );
}

function LiveSolarCard() {
  const persona = usePersona();
  const prof = useProfile();
  const simTime = useStore((s) => s.simTime);
  const weather = useStore((s) => s.weather);
  const h = hourOf(simTime);
  const kw = solarKw(persona.kWp, h, weather);
  const typical = persona.kWp * 3.7;
  const day = isDaylight(h);
  const landed = persona.id === 'landed';

  return (
    <Card to="/home/solar" tone="leaf" className="p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-[15px] font-bold text-ink-muted">
            {landed ? 'Live from your roof' : 'Your canopy share'}
            <Pill tone="leaf" icon={<span className="live-dot" />}>
              Live
            </Pill>
          </div>
          <div className="mt-2 font-display text-[44px] font-bold leading-[48px] tabular">
            {fmt(kw, 2)}
            <span className="ml-1 text-[20px] text-ink-muted">kW</span>
          </div>
          <div className="mt-1 text-[15px] text-ink-muted">{day ? (kw > 0.05 ? 'Generating' : 'Sunrise') : 'Resting · night'}</div>
        </div>
        <HouseSolar kw={kw} kWp={persona.kWp} variant={landed ? 'house' : 'canopy'} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-page p-3">
          <div className="text-[14px] text-ink-muted">Made today</div>
          <div className="font-display text-[22px] font-bold tabular">
            {fmt(prof.todayKwh)} <span className="text-[15px] text-ink-muted">kWh</span>
          </div>
        </div>
        <div className="rounded-2xl bg-sun-soft p-3">
          <div className="flex items-center gap-1 text-[14px] text-sun-ink">
            <Sun size={14} /> Earned today
          </div>
          <div className="font-display text-[22px] font-bold text-sun-ink tabular">
            +{fmt(prof.todayCredits, 2)} <span className="text-[15px]">SC</span>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <ProgressBar value={prof.todayKwh / typical} />
        <div className="mt-1.5 text-[14px] text-ink-muted">
          {Math.round((prof.todayKwh / typical) * 100)}% of a typical {fmtInt(typical)} kWh day
        </div>
      </div>
    </Card>
  );
}

function CreditCard() {
  const prof = useProfile();
  return (
    <section className="card-navy p-5">
      <div className="flex items-center gap-2 text-[15px] font-bold text-white/80">
        <Sun size={18} className="text-sun-bright" /> SunD Credits
      </div>
      <div className="mt-1 font-display text-[44px] font-bold leading-[48px] tabular">
        {fmt(prof.sc)}
        <span className="ml-1 text-[20px] text-white/60">SC</span>
      </div>
      <div className="mt-1 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-bold tabular">
          <Car size={16} className="text-white/70" /> ≈ {fmtInt(scToKm(prof.sc))} km
        </span>
        {prof.monthRebateRm > 0 && <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 font-bold tabular">+{fmtRm(prof.monthRebateRm)} bill rebate</span>}
        {prof.saver > 0 && <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 font-bold tabular">Saver {fmtRm(prof.saver)}</span>}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <LinkButton to="/charge" variant="red">
          <Zap size={20} /> Charge now
        </LinkButton>
        <LinkButton to="/wallet" variant="onnavy">
          View wallet
        </LinkButton>
      </div>
    </section>
  );
}

function SaverCard() {
  const prof = useProfile();
  const views = useBayViews();
  const green = views.filter((v) => v.status === 'surplus').length;
  return (
    <section className="rounded-[20px] border border-sky-bright bg-sky-soft p-5">
      <div className="flex items-center gap-2 text-[15px] font-bold text-sky-deep">
        <Leaf size={18} /> {green} green SunD {green === 1 ? 'Bay' : 'Bays'} · cheaper now
      </div>
      <div className="mt-3 rounded-2xl bg-page p-4">
        <div className="text-[14px] text-ink-muted">Saver Credits</div>
        <div className="font-display text-[32px] font-bold tabular">{fmtRm(prof.saver)}</div>
        <Pill tone="leaf">60%+ solar bays</Pill>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <LinkButton to="/wallet/saver">Buy Saver</LinkButton>
        <LinkButton to="/map" variant="secondary">
          Map
        </LinkButton>
      </div>
    </section>
  );
}

function NearestBay() {
  const views = useBayViews();
  const pick = views.find((v) => v.status === 'surplus') ?? views.find((v) => v.status !== 'busy') ?? views[0];
  return (
    <section>
      <SectionTitle action={<SeeAll to="/map">Map</SeeAll>}>{pick.status === 'surplus' ? 'Green SunD Bay nearby' : 'Nearest SunD Bay'}</SectionTitle>
      <BayRow v={pick} />
    </section>
  );
}

function QuickActions() {
  const t = useT();
  const action = (to: string, label: string, icon: ReactNode) => (
    <Link to={to} className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-[20px] border border-outline bg-page p-2 text-center text-[14px] font-bold leading-5 hover:shadow-soft">
      <IconBubble tone="sky">{icon}</IconBubble>
      {label}
    </Link>
  );
  return (
    <section className="grid grid-cols-4 gap-2">
      {action('/map', t('Find bay'), <MapPin size={22} />)}
      {action('/charge', t('Scan to charge'), <QrCode size={22} />)}
      {action('/map?tab=walk', 'SunD Walk', <Footprints size={22} />)}
      {action('/cool', 'SunD Cool', <Snowflake size={22} />)}
    </section>
  );
}

function ImpactTeaser() {
  const landed = useStore((s) => s.profiles.landed);
  const today = landed.todayKwh * TOWNSHIP.homes;
  return (
    <Card to="/home/impact" tone="sky" className="flex items-center gap-4 p-5">
      <IconBubble tone="leaf" size={52}>
        <Leaf size={26} />
      </IconBubble>
      <div className="flex-1">
        <div className="text-[14px] text-ink-muted">Elmina today</div>
        <div className="font-bold leading-6 tabular">
          {fmtInt(today)} kWh · {TOWNSHIP.homes} roofs · {TOWNSHIP.mwp} MWp
        </div>
        <div className="text-[14px] font-bold text-sky-deep">See the energy loop</div>
      </div>
      <ArrowRight size={20} className="text-ink-subtle" />
    </Card>
  );
}
