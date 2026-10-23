import { ArrowRight, Car, Footprints, Grid3x3, HandHeart, Snowflake, Sun, ThermometerSun, Volume2, WashingMachine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BALCONY, KM_PER_UNIT, PEAK, SLICE_KWH_PER_MONTH } from '../data/constants';
import { nudgesFor, type Nudge } from '../data/nudges';
import { COOL_ROOMS, WALKS, coolOccupancy, feelsLikeC, heatLabel, isCoolOpen, underWalkC, walkMinutes } from '../data/sund';
import { cx, fmt, fmtInt, fmtRm } from '../lib/format';
import { speak, useLang, useT } from '../lib/i18n';
import { sliceValueRm } from '../lib/pricing';
import { hourOf, solarKw } from '../sim/solar';
import { usePersona, useProfile } from '../store/hooks';
import { useStore } from '../store/useStore';
import { Card, IconBubble, LinkButton, Pill, ProgressBar } from './ui';

const NUDGE_ICON = { washer: WashingMachine, snow: Snowflake, car: Car };

/** Distance from the current person's home to a map point, in metres. */
export function useMetresTo(x: number, y: number) {
  const home = usePersona().home;
  return Math.round((Math.hypot(x - home.x, y - home.y) * KM_PER_UNIT * 1000) / 10) * 10;
}

export function useNearestCoolRoom() {
  const home = usePersona().home;
  return [...COOL_ROOMS].sort((a, b) => Math.hypot(a.x - home.x, a.y - home.y) - Math.hypot(b.x - home.x, b.y - home.y))[0];
}

/** Heat alert with the nearest SunD Cool room in one tap (deck slide 3, Uncle Tan). */
export function HeatAlertCard() {
  const t = useT();
  const lang = useLang();
  const heat = useStore((s) => s.heat);
  const simTime = useStore((s) => s.simTime);
  const toast = useStore((s) => s.toast);
  const room = useNearestCoolRoom();
  const metres = useMetresTo(room.x, room.y);
  if (!heat.on) return null;
  const open = isCoolOpen(room, simTime, true);
  const inside = coolOccupancy(room, simTime, true);
  const h = hourOf(simTime);
  const speech = t('Heat alert. {temp} degrees today. SunD Cool is open at {hall}, {m} metres away, until 6 pm. Drink water and rest in the shade.', {
    temp: heat.tempC,
    hall: t(room.name),
    m: metres,
  });

  return (
    <section className="rise-in overflow-hidden rounded-[20px] border border-sun-soft bg-sun-wash" aria-live="polite">
      <div className="flex items-center gap-3 bg-sun px-5 py-3 text-white">
        <ThermometerSun size={26} />
        <div className="flex-1">
          <div className="font-display text-[20px] font-bold leading-6">{t('Heat alert · {temp} °C', { temp: heat.tempC })}</div>
          <div className="text-[14px] text-white/85">
            {t(heatLabel(heat.tempC))} · {t('day {d} at ≥35 °C', { d: heat.day })}
          </div>
        </div>
        <button
          type="button"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 hover:bg-white/25"
          aria-label={t('Read aloud')}
          onClick={() => {
            if (!speak(speech, lang)) toast({ icon: 'alert', title: t('This device can’t read aloud') });
          }}
        >
          <Volume2 size={22} />
        </button>
      </div>
      <div className="p-5">
        <div className="flex items-start gap-3">
          <IconBubble tone="berry">
            <Snowflake size={22} />
          </IconBubble>
          <div className="flex-1">
            <div className="font-bold leading-6">{t('SunD Cool · {hall}', { hall: t(room.name) })}</div>
            <div className="text-[15px] text-ink-muted tabular">
              {fmtInt(metres)} m · {open ? t('open until {h}', { h: '6 pm' }) : h < room.opens ? t('opens 11 am') : t('closed for today')}
              {open && ` · ${inside}/${room.capacity} ${t('inside')}`}
            </div>
          </div>
        </div>
        <div className="stack-lg mt-4 grid grid-cols-2 gap-3">
          <LinkButton to="/cool" variant="red">
            <Snowflake size={20} /> {t('Go to SunD Cool')}
          </LinkButton>
          <LinkButton to="/map?tab=walk" variant="secondary">
            <Footprints size={20} /> {t('Shaded route')}
          </LinkButton>
        </div>
      </div>
    </section>
  );
}

/** The roofless household's way into solar: a 1 kW slice of the township pool. */
export function SliceCard() {
  const t = useT();
  const persona = usePersona();
  const prof = useProfile();
  const simTime = useStore((s) => s.simTime);
  const weather = useStore((s) => s.weather);
  if (persona.reward !== 'slice') return null;
  if (!prof.sliceOn)
    return (
      <Card to="/wallet/slice" tone="sun" className="flex items-center gap-4 p-5">
        <IconBubble tone="sun" size={52}>
          <Sun size={26} />
        </IconBubble>
        <div className="flex-1">
          <div className="font-bold">{t('Subscribe to a 1 kW solar slice')}</div>
          <div className="text-[14px] text-ink-muted">{t('≈110 kWh a month off your bill · no roof needed')}</div>
        </div>
        <ArrowRight size={20} className="text-ink-subtle" />
      </Card>
    );
  const kw = solarKw(persona.kWp, hourOf(simTime), weather);
  const dom = new Date(simTime).getDate();
  const expected = (SLICE_KWH_PER_MONTH * dom) / 30;

  return (
    <section className="card-navy p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[15px] font-bold text-white/80">
          <Sun size={18} className="text-sun-bright" /> {t('Your 1 kW solar slice')}
        </div>
        {persona.sponsored ? (
          <span className="rounded-full bg-sun px-2.5 py-0.5 text-[13px] font-bold text-white">{t('Sponsored')}</span>
        ) : (
          <span className="flex items-center gap-1.5 text-[13px] font-bold text-white/70 tabular">
            <span className="live-dot" /> {fmt(kw, 2)} kW
          </span>
        )}
      </div>
      <div className="mt-2 font-display text-[40px] font-bold leading-[44px] tabular">
        {fmtInt(prof.monthKwh)}
        <span className="ml-1 text-[18px] text-white/60">/ ~{SLICE_KWH_PER_MONTH} kWh</span>
      </div>
      <div className="mt-1 text-[14px] text-white/70">{t('this month · on track: {e} kWh by today', { e: fmtInt(expected) })}</div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
        <span className="block h-full rounded-full bg-sun-bright transition-[width] duration-500" style={{ width: `${Math.min(100, (prof.monthKwh / SLICE_KWH_PER_MONTH) * 100)}%` }} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 font-bold tabular">
          −{fmtRm(prof.monthRebateRm)} {t('off your bill')}
        </span>
        {prof.monthCredits > 0.05 && <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 font-bold tabular">+{fmt(prof.monthCredits)} SC</span>}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <LinkButton to="/wallet/slice" variant="red">
          {t('Bill & slice')}
        </LinkButton>
        <LinkButton to="/wallet" variant="onnavy">
          {t('Wallet')}
        </LinkButton>
      </div>
    </section>
  );
}

function NudgeRow({ n }: { n: Nudge }) {
  const t = useT();
  const accept = useStore((s) => s.acceptNudge);
  const done = useProfile().nudgesDone.includes(n.id);
  const Icon = NUDGE_ICON[n.icon];
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-page p-3">
      <IconBubble tone={done ? 'leaf' : 'sun'} size={40}>
        <Icon size={20} />
      </IconBubble>
      <div className="min-w-0 flex-1">
        <div className="font-bold leading-5">{t(n.title)}</div>
        <div className="text-[13px] leading-5 text-ink-muted">{done ? t('Done · {k} kWh in solar hours', { k: n.kwh }) : t(n.body)}</div>
      </div>
      {!done &&
        (n.to ? (
          <Link to={n.to} onClick={() => accept(n.id)} className="btn btn-secondary !min-h-11 !px-3 !text-[15px]">
            {t(n.cta)}
          </Link>
        ) : (
          <button type="button" onClick={() => accept(n.id)} className="btn btn-secondary !min-h-11 !px-3 !text-[15px]">
            {t(n.cta)}
          </button>
        ))}
    </div>
  );
}

/** Solar-peak nudges, 11am–3pm (deck slide 6). */
export function PeakNudgeCard() {
  const t = useT();
  const persona = usePersona();
  const prof = useProfile();
  const simTime = useStore((s) => s.simTime);
  const h = hourOf(simTime);
  const list = nudgesFor(persona.id).filter((n) => persona.drivesEv || n.icon !== 'car');
  if (!list.length) return null;
  if (h < PEAK.from - 2 || h >= PEAK.to)
    return null;
  const live = h >= PEAK.from;
  return (
    <section className="rounded-[20px] border border-sun-soft bg-sun-wash p-5">
      <div className="flex items-center gap-2">
        <Pill tone="sun" icon={<Sun size={15} />}>
          {live ? t('Solar peak now') : t('Solar peak at 11 am')}
        </Pill>
        <span className="text-[14px] text-ink-muted">11am–3pm</span>
      </div>
      <div className="mt-2 font-bold leading-6">{live ? t('Use power now, while the sun pays for it') : t('Plan heavy chores for the solar peak')}</div>
      <div className="mt-3 flex flex-col gap-2">
        {list.map((n) => (
          <NudgeRow key={n.id} n={n} />
        ))}
      </div>
      <div className="mt-3 text-[13px] text-ink-muted tabular">{t('{k} kWh moved into solar hours this month', { k: fmt(prof.nudgeKwh, 1) })}</div>
    </section>
  );
}

/** SunD Cool room status card (always visible for Uncle Tan; on heat days for everyone). */
export function CoolRoomCard() {
  const t = useT();
  const heat = useStore((s) => s.heat.on);
  const simTime = useStore((s) => s.simTime);
  const room = useNearestCoolRoom();
  const metres = useMetresTo(room.x, room.y);
  const open = isCoolOpen(room, simTime, heat);
  const inside = coolOccupancy(room, simTime, heat);
  return (
    <Card to="/cool" tone="berry" className="p-5">
      <div className="flex items-start gap-3">
        <IconBubble tone="berry" size={52}>
          <Snowflake size={26} />
        </IconBubble>
        <div className="flex-1">
          <div className="text-[14px] font-bold text-berry-ink">SunD Cool</div>
          <div className="font-bold leading-6">{t(room.name)}</div>
          <div className="text-[14px] text-ink-muted tabular">
            {fmtInt(metres)} m · {open ? t('open now · {n}/{c} inside', { n: inside, c: room.capacity }) : t('opens on heat-alert days, 11 am–6 pm')}
          </div>
        </div>
        <ArrowRight size={20} className="mt-1 text-ink-subtle" />
      </div>
      {open && <ProgressBar className="mt-3" value={inside / room.capacity} color="var(--color-berry)" />}
    </Card>
  );
}

/** The coolest walk from home, with the expected shade benefit. */
export function WalkTeaser() {
  const t = useT();
  const persona = usePersona();
  const heat = useStore((s) => s.heat.on);
  const simTime = useStore((s) => s.simTime);
  const w = persona.id === 'elder' ? WALKS[1] : persona.id === 'condo' ? WALKS[0] : WALKS[2];
  return (
    <Card to={`/map?tab=walk&walk=${w.id}`} tone="leaf" className="flex items-center gap-4 p-5">
      <IconBubble tone="leaf" size={52}>
        <Footprints size={26} />
      </IconBubble>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-bold text-leaf-ink">{t('Coolest walk')}</div>
        <div className="truncate font-bold leading-6">{t(w.to)}</div>
        <div className="text-[14px] text-ink-muted tabular">
          {w.lengthM} m · {walkMinutes(w.lengthM)} min · {fmt(feelsLikeC(simTime, heat), 0)} → {fmt(underWalkC(simTime, heat), 0)} °C {t('feels-like')}
        </div>
      </div>
      <ArrowRight size={20} className="text-ink-subtle" />
    </Card>
  );
}

/** SunD Balcony: plug-in kits for condo balconies, proposed for the 2027 sandbox (deck slide 6, A7). */
export function BalconyTeaser() {
  const t = useT();
  const prof = useProfile();
  return (
    <Card to="/wallet/balcony" className="flex items-center gap-4 p-5">
      <IconBubble tone="slate" size={52}>
        <Grid3x3 size={24} />
      </IconBubble>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold">SunD Balcony</span>
          <Pill tone="slate">2027 · {t('sandbox')}</Pill>
        </div>
        <div className="text-[14px] text-ink-muted tabular">
          {BALCONY.watts} W {t('plug-in kit')} · ~{BALCONY.kwhMonth} kWh / {t('month')} · RM {BALCONY.rmLow}–{BALCONY.rmHigh}
        </div>
        {prof.balconyWaitlist && <div className="text-[14px] font-bold text-leaf-ink">{t('On the waitlist')}</div>}
      </div>
      <ArrowRight size={20} className="text-ink-subtle" />
    </Card>
  );
}

/** Small "who pays for a sponsored slice" explainer for Uncle Tan. */
export function SponsoredNote() {
  const t = useT();
  const persona = usePersona();
  if (!persona.sponsored) return null;
  return (
    <div className={cx('flex items-center gap-3 rounded-2xl bg-sky-wash p-4')}>
      <HandHeart size={22} className="shrink-0 text-sky-deep" />
      <div className="text-[15px] leading-6 text-ink-muted">
        {t('Your slice is paid for by the Elmina solar dividend. Worth about {rm} a month on your bill.', { rm: fmtRm(sliceValueRm(persona.tariff ?? 0.35)) })}
      </div>
    </div>
  );
}
