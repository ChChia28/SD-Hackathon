import { Flame } from 'lucide-react';
import { FacilityRow } from '../../components/facility';
import { TabHeader } from '../../components/shell';
import { Card, Pill, ProgressBar, SectionTitle, SeeAll, StarBadge } from '../../components/ui';
import { KM_PER_KWH } from '../../data/constants';
import { ACHIEVEMENTS, CLUBHOUSE, EBIKES, LEADERBOARD, OFFERS, levelFor } from '../../data/rewards';
import { cx, fmtInt } from '../../lib/format';
import { usesCredits } from '../../lib/pricing';
import { usePersona, useProfile } from '../../store/hooks';
import { useStore } from '../../store/useStore';

export default function Rewards() {
  const persona = usePersona();
  const prof = useProfile();
  const simTime = useStore((s) => s.simTime);
  const resident = usesCredits(persona.id);
  const level = levelFor(prof.solarKwhCharged);

  const month = new Date(simTime).getMonth();
  const myKm = prof.txs
    .filter((t) => t.type === 'charge' && new Date(t.at).getMonth() === month)
    .reduce((a, t) => a + (((t.kwh ?? 0) * (t.solarPct ?? 0)) / 100) * KM_PER_KWH, 0);
  const board = [...LEADERBOARD, { name: 'You', km: myKm }].sort((a, b) => b.km - a.km);

  return (
    <>
      <TabHeader title="Rewards" />
      <div className="flex flex-col gap-6 px-5 pb-8 pt-2">
        <Card tone="sky" className="p-5">
          <div className="flex items-center gap-4">
            <StarBadge earned size={64} />
            <div className="flex-1">
              <div className="text-[14px] font-bold uppercase tracking-wider text-sun-ink">Level {level.index}</div>
              <div className="font-display text-[24px] font-bold leading-8">{level.name}</div>
              <div className="text-[14px] text-ink-muted tabular">{fmtInt(prof.solarKwhCharged)} solar kWh charged</div>
            </div>
          </div>
          <ProgressBar value={level.progress} className="mt-4" />
          <div className="mt-1.5 text-[14px] text-ink-muted">{level.next ? `${fmtInt(level.toNext)} kWh → ${level.next.name}` : 'Top level'}</div>
        </Card>

        <Card tone="sun" className="p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sun-soft text-sun-deep">
              <Flame size={26} fill="currentColor" />
            </span>
            <div className="flex-1">
              <div className="font-display text-[22px] font-bold tabular">{prof.streak}-day green streak</div>
              <div className="text-[14px] text-ink-muted">1 solar charge a day</div>
            </div>
          </div>
          <div className="mt-4 flex justify-between" aria-label={`${Math.min(prof.streak, 7)} of 7 days`}>
            {Array.from({ length: 7 }, (_, i) => {
              const done = i < Math.min(prof.streak, 7);
              return (
                <span key={i} className={cx('flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-bold', done ? 'bg-sun text-white' : 'border-2 border-dashed border-ink-faint text-ink-subtle')}>
                  {i + 1}
                </span>
              );
            })}
          </div>
          {prof.streak === 6 && <div className="mt-3 rounded-xl bg-berry-soft px-3 py-2 text-[15px] font-bold text-berry-ink">1 more day → Green week badge</div>}
        </Card>

        <section>
          <SectionTitle>Bonus offers</SectionTitle>
          <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
            {OFFERS.filter((o) => resident || !o.resident).map((o) => (
              <Card key={o.id} to={o.to} tone="berry" className="w-[200px] shrink-0 p-4">
                <Pill tone="berry">{o.tag}</Pill>
                <div className="mt-2 font-bold leading-6">{o.title}</div>
                <div className="mt-1 text-[14px] leading-5 text-ink-muted">{o.body}</div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle action={<SeeAll to="/map?tab=ebike">Map</SeeAll>}>SunD eBike</SectionTitle>
          <div className="flex flex-col gap-2">
            {EBIKES.slice(0, 3).map((f) => (
              <FacilityRow key={f.id} f={f} />
            ))}
          </div>
        </section>

        <section>
          <SectionTitle>Clubhouse{!resident && ' · residents'}</SectionTitle>
          <div className="flex flex-col gap-2">
            {CLUBHOUSE.map((f) => (
              <FacilityRow key={f.id} f={f} />
            ))}
          </div>
        </section>

        <section>
          <SectionTitle action={<SeeAll to="/rewards/achievements" />}>Badges</SectionTitle>
          <Card to="/rewards/achievements" className="flex items-center justify-between p-4">
            {ACHIEVEMENTS.slice(0, 5).map((a) => (
              <StarBadge key={a.id} earned={prof.achievements.includes(a.id)} size={48} />
            ))}
          </Card>
          <div className="mt-2 text-[14px] text-ink-muted">
            {prof.achievements.length} of {ACHIEVEMENTS.length} earned
          </div>
        </section>

        <section>
          <SectionTitle>Elmina leaderboard</SectionTitle>
          <Card className="divide-y divide-outline">
            {board.map((r, i) => (
              <div key={r.name} className={cx('flex min-h-14 items-center gap-3 px-4', r.name === 'You' && 'bg-sky-soft')}>
                <span className="w-6 text-center font-display font-bold text-ink-muted">{i + 1}</span>
                <span className={cx('flex-1', r.name === 'You' && 'font-bold')}>{r.name === 'You' ? `You (${persona.name.split(' ')[0]})` : r.name}</span>
                <span className="font-bold tabular">{fmtInt(r.km)} km</span>
              </div>
            ))}
          </Card>
          <div className="mt-2 text-[14px] text-ink-muted">Solar km this month</div>
        </section>
      </div>
    </>
  );
}
