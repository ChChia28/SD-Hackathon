import { Footprints, Snowflake, Sun, ThermometerSun } from 'lucide-react';
import { useMetresTo } from '../../components/sund';
import { Card, IconBubble, LinkButton, Pill, ProgressBar, SectionTitle } from '../../components/ui';
import { WALK_DELTA_C } from '../../data/constants';
import { COOL_ROOMS, WALKS, coolOccupancy, feelsLikeC, isCoolOpen, underWalkC, walkKwhPerDay, walkMinutes, walkRoofKwp, type CoolRoom, type Walk } from '../../data/sund';
import { cx, fmt, fmtInt } from '../../lib/format';
import { useT } from '../../lib/i18n';
import { useStore } from '../../store/useStore';

function WalkRow({ w, active, onSelect }: { w: Walk; active: boolean; onSelect: () => void }) {
  const t = useT();
  const heat = useStore((s) => s.heat.on);
  const simTime = useStore((s) => s.simTime);
  const road = feelsLikeC(simTime, heat);
  const under = underWalkC(simTime, heat);
  return (
    <Card onClick={onSelect} className={cx('p-4', active && 'card-active')}>
      <div className="flex items-start gap-3">
        <IconBubble tone={w.status === 'next' ? 'sky' : 'slate'}>
          <Footprints size={22} />
        </IconBubble>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold">{w.name}</span>
            <Pill tone={w.status === 'next' ? 'sun' : 'slate'}>{w.status === 'next' ? t('Phase 3 · built first') : t('Planned')}</Pill>
          </div>
          <div className="text-[14px] text-ink-muted">
            {t(w.from)} → {t(w.to)}
          </div>
          <div className="text-[14px] text-ink-muted tabular">
            {w.lengthM} m · {walkMinutes(w.lengthM)} min · #{w.rank} {t('hottest route (Landsat)')}
          </div>
        </div>
      </div>
      {active && (
        <div className="rise-in mt-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-sun-wash p-3">
              <div className="flex items-center gap-1 text-[13px] font-bold text-sun-ink">
                <ThermometerSun size={14} /> {t('Main road now')}
              </div>
              <div className="font-display text-[24px] font-bold tabular">{fmt(road, 0)} °C</div>
              <div className="text-[12px] text-ink-muted">{t('feels-like')}</div>
            </div>
            <div className="rounded-2xl bg-sky-wash p-3">
              <div className="flex items-center gap-1 text-[13px] font-bold text-sky-deep">
                <Footprints size={14} /> {t('Under SunD Walk')}
              </div>
              <div className="font-display text-[24px] font-bold tabular">{fmt(under, 0)} °C</div>
              <div className="text-[12px] text-ink-muted">−{WALK_DELTA_C} °C {t('expected')}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-leaf-wash p-3">
            <Sun size={20} className="shrink-0 text-leaf-deep" />
            <div className="text-[14px] leading-5">
              {t('Roof solar')} ≈ <b>{fmtInt(walkRoofKwp(w))} kWp</b> · ~{fmtInt(walkKwhPerDay(w))} kWh / {t('day')} {t('into the pool')}
            </div>
          </div>
          <div className="text-[12px] leading-4 text-ink-subtle">{t('Shade benefit from a tropical in-situ study (−3.1 °C UTCI). Roof: one 1.2 m row of panels, team assumption.')}</div>
        </div>
      )}
    </Card>
  );
}

export function WalkList({ selected, onSelect }: { selected?: string; onSelect: (id: string | undefined) => void }) {
  const t = useT();
  return (
    <section>
      <SectionTitle>{t('SunD Walk · coolest routes')}</SectionTitle>
      <div className="flex flex-col gap-2">
        {WALKS.map((w) => (
          <WalkRow key={w.id} w={w} active={selected === w.id} onSelect={() => onSelect(selected === w.id ? undefined : w.id)} />
        ))}
      </div>
    </section>
  );
}

function CoolRow({ r }: { r: CoolRoom }) {
  const t = useT();
  const heat = useStore((s) => s.heat.on);
  const simTime = useStore((s) => s.simTime);
  const metres = useMetresTo(r.x, r.y);
  const open = isCoolOpen(r, simTime, heat);
  const n = coolOccupancy(r, simTime, heat);
  return (
    <Card to="/cool" className="p-4">
      <div className="flex items-center gap-3">
        <IconBubble tone={open ? 'berry' : 'slate'}>
          <Snowflake size={22} />
        </IconBubble>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-bold">{t(r.name)}</span>
            {r.primary && <Pill tone="berry">{t('Pilot hall')}</Pill>}
          </div>
          <div className="text-[14px] text-ink-muted tabular">
            {fmtInt(metres)} m · {open ? t('open now · {n}/{c} inside', { n, c: r.capacity }) : t('opens on heat-alert days, 11 am–6 pm')}
          </div>
        </div>
      </div>
      {open && <ProgressBar className="mt-3" value={n / r.capacity} color="var(--color-berry)" />}
    </Card>
  );
}

export function CoolList() {
  const t = useT();
  const heat = useStore((s) => s.heat.on);
  return (
    <section className="flex flex-col gap-3">
      <SectionTitle>{t('SunD Cool rooms')}</SectionTitle>
      {!heat && <div className="rounded-2xl bg-sky-wash p-3 text-[14px] text-ink-muted">{t('No heat alert today. Rooms open on MetMalaysia Level 1 days.')}</div>}
      {COOL_ROOMS.map((r) => (
        <CoolRow key={r.id} r={r} />
      ))}
      <LinkButton to="/cool" variant="secondary">
        <Snowflake size={20} /> {t('Open SunD Cool')}
      </LinkButton>
    </section>
  );
}
