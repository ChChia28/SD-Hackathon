import { CheckCircle2, Droplets, Footprints, HeartPulse, QrCode, Snowflake, Sofa, Sun, ThermometerSun, Volume2, Zap } from 'lucide-react';
import { useState } from 'react';
import { Button, Card, IconBubble, LinkButton, PageHeader, Pill, ProgressBar, Row, SectionTitle } from '../../components/ui';
import { useMetresTo, useNearestCoolRoom } from '../../components/sund';
import { HEAT_LEVEL1_C } from '../../data/constants';
import { COOL_ROOMS, WALKS, coolOccupancy, feelsLikeC, heatLabel, isCoolOpen, walkMinutes } from '../../data/sund';
import { fmt, fmtInt } from '../../lib/format';
import { speak, useLang, useT } from '../../lib/i18n';
import { dayKey, hourOf } from '../../sim/solar';
import { usePersona, useProfile } from '../../store/hooks';
import { useStore } from '../../store/useStore';

/** A tiny deterministic QR-like pattern for the check-in code (decorative; the scan is simulated). */
function CheckinCode({ seed }: { seed: string }) {
  const n = 21;
  const cells: boolean[] = [];
  let h = 2166136261;
  for (let i = 0; i < n * n; i++) {
    h ^= seed.charCodeAt(i % seed.length) + i;
    h = Math.imul(h, 16777619);
    cells.push(((h >>> 0) & 7) < 3);
  }
  const finder = (x: number, y: number) => {
    const inBox = (cx: number, cy: number) => x >= cx && x < cx + 7 && y >= cy && y < cy + 7;
    for (const [cx, cy] of [[0, 0], [n - 7, 0], [0, n - 7]]) {
      if (inBox(cx, cy)) {
        const dx = x - cx;
        const dy = y - cy;
        return dx === 0 || dy === 0 || dx === 6 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
      }
    }
    return null;
  };
  return (
    <svg viewBox={`-1 -1 ${n + 2} ${n + 2}`} className="h-44 w-44" role="img" aria-label="Check-in code">
      <rect x={-1} y={-1} width={n + 2} height={n + 2} fill="#fff" />
      {Array.from({ length: n * n }, (_, i) => {
        const x = i % n;
        const y = Math.floor(i / n);
        const f = finder(x, y);
        const on = f === null ? cells[i] : f;
        return on ? <rect key={i} x={x} y={y} width={1.02} height={1.02} fill="var(--color-ink)" /> : null;
      })}
    </svg>
  );
}

export default function Cool() {
  const t = useT();
  const lang = useLang();
  const persona = usePersona();
  const prof = useProfile();
  const heat = useStore((s) => s.heat);
  const simTime = useStore((s) => s.simTime);
  const checkin = useStore((s) => s.coolCheckin);
  const toast = useStore((s) => s.toast);
  const room = useNearestCoolRoom();
  const metres = useMetresTo(room.x, room.y);
  const [showCode, setShowCode] = useState(false);
  const open = isCoolOpen(room, simTime, heat.on);
  const inside = coolOccupancy(room, simTime, heat.on);
  const checkedIn = prof.coolCheckins.includes(dayKey(simTime));
  const route = WALKS.find((w) => w.to.includes('Community Hall'))!;
  const h = hourOf(simTime);

  const status = heat.on
    ? open
      ? t('Open now · until 6 pm')
      : h < room.opens
        ? t('Opens 11 am today')
        : t('Closed for today')
    : t('Opens on heat-alert days');

  return (
    <>
      <PageHeader title="SunD Cool" />
      <div className="flex flex-col gap-6 px-5 pb-10 pt-4">
        {heat.on ? (
          <div className="flex items-center gap-3 rounded-[20px] bg-sun px-5 py-4 text-white">
            <ThermometerSun size={28} />
            <div className="flex-1">
              <div className="font-display text-[20px] font-bold leading-6">{t('Heat alert · {temp} °C', { temp: heat.tempC })}</div>
              <div className="text-[14px] text-white/85">
                {t(heatLabel(heat.tempC))} · {t('feels like {f} °C outside', { f: fmt(feelsLikeC(simTime, true), 0) })}
              </div>
            </div>
            <button
              type="button"
              aria-label={t('Read aloud')}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15"
              onClick={() => {
                const ok = speak(t('Heat alert. {temp} degrees today. SunD Cool is open at {hall}, {m} metres away, until 6 pm. Drink water and rest in the shade.', { temp: heat.tempC, hall: t(room.name), m: metres }), lang);
                if (!ok) toast({ icon: 'alert', title: t('This device can’t read aloud') });
              }}
            >
              <Volume2 size={22} />
            </button>
          </div>
        ) : (
          <Card tone="sky" className="flex items-center gap-3 p-4">
            <Sun size={22} className="shrink-0 text-sky-deep" />
            <div className="text-[15px] text-ink-muted">{t('No heat alert today. Rooms open when MetMalaysia issues Level 1 (≥{c} °C for 3 days).', { c: HEAT_LEVEL1_C })}</div>
          </Card>
        )}

        <section className="card-navy p-5">
          <div className="flex items-center gap-2 text-[15px] font-bold text-white/80">
            <Snowflake size={18} className="text-sun-bright" /> {t('Nearest SunD Cool')}
          </div>
          <div className="mt-1 font-display text-[26px] font-bold leading-8">{t(room.name)}</div>
          <div className="mt-1 text-[15px] text-white/70 tabular">
            {fmtInt(metres)} m · {status}
          </div>
          {open && (
            <>
              <div className="mt-4 flex items-baseline justify-between text-[14px] text-white/80 tabular">
                <span>{t('Inside now')}</span>
                <span className="font-bold text-white">
                  {inside} / {room.capacity}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/15">
                <span className="block h-full rounded-full bg-sun-bright" style={{ width: `${(inside / room.capacity) * 100}%` }} />
              </div>
            </>
          )}
          <div className="stack-lg mt-4 grid grid-cols-2 gap-3">
            <Button
              variant="red"
              onClick={() => {
                if (!checkedIn) checkin();
                setShowCode(true);
              }}
            >
              <QrCode size={20} /> {checkedIn ? t('My pass') : t('Check in')}
            </Button>
            <LinkButton to={`/map?tab=walk&walk=${route.id}`} variant="onnavy">
              <Footprints size={20} /> {walkMinutes(route.lengthM)} min
            </LinkButton>
          </div>
        </section>

        {showCode && (
          <Card className="rise-in flex flex-col items-center gap-3 p-5 text-center">
            <CheckinCode seed={`${persona.id}-${dayKey(simTime)}`} />
            <div className="flex items-center gap-2 font-bold text-leaf-ink">
              <CheckCircle2 size={20} /> {t('Checked in · stay as long as you like')}
            </div>
            <div className="text-[14px] text-ink-muted">{t('Show this at the door. Free for every resident.')}</div>
          </Card>
        )}

        <section>
          <SectionTitle>{t('Inside the room')}</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            {[
              { Icon: Zap, label: t('Solar-powered cooling') },
              { Icon: Droplets, label: t('Free drinking water') },
              { Icon: Sofa, label: t('Seats and rest area') },
              { Icon: HeartPulse, label: t('First aid on site') },
            ].map((x) => (
              <div key={x.label} className="card flex items-center gap-3 p-3.5">
                <IconBubble tone="berry" size={40}>
                  <x.Icon size={20} />
                </IconBubble>
                <span className="text-[15px] font-bold leading-5">{x.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle>{t('Other rooms')}</SectionTitle>
          <div className="flex flex-col gap-2">
            {COOL_ROOMS.filter((r) => r.id !== room.id).map((r) => {
              const o = isCoolOpen(r, simTime, heat.on);
              const n = coolOccupancy(r, simTime, heat.on);
              return (
                <Card key={r.id} className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold">{t(r.name)}</span>
                    <Pill tone={o ? 'leaf' : 'slate'}>{o ? t('Open') : t('Closed')}</Pill>
                  </div>
                  <div className="text-[14px] text-ink-muted tabular">
                    {t(r.area)} · {r.opens}:00–{r.closes - 12}:00 pm · {r.capacity} {t('seats')}
                  </div>
                  {o && <ProgressBar className="mt-2" value={n / r.capacity} color="var(--color-berry)" />}
                </Card>
              );
            })}
          </div>
        </section>

        <Card tone="sky" className="divide-y divide-sky-soft px-5 py-1">
          <Row label={t('Who gets pinged first')} value={t('65+ and B40 households')} />
          <Row label={t('Why it matters')} value={t('+12.9% elderly admissions per +1 °C (Selangor)')} />
          <Row label={t('Pilot KPI')} value={t('Visits per heat-alert day')} />
        </Card>
      </div>
    </>
  );
}
