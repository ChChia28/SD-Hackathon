import { Check, Lock } from 'lucide-react';
import { Card, PageHeader, StarBadge } from '../../components/ui';
import { ACHIEVEMENTS } from '../../data/rewards';
import { cx } from '../../lib/format';
import { useProfile } from '../../store/hooks';

export default function Achievements() {
  const prof = useProfile();
  return (
    <>
      <PageHeader title="Badges" />
      <div className="px-5 pb-10 pt-4">
        <p className="mb-4 text-ink-muted">
          {prof.achievements.length} of {ACHIEVEMENTS.length} earned
        </p>
        <div className="grid grid-cols-2 gap-3">
          {ACHIEVEMENTS.map((a) => {
            const earned = prof.achievements.includes(a.id);
            return (
              <Card key={a.id} className={cx('flex flex-col items-center p-4 text-center', !earned && 'bg-surface')}>
                <StarBadge earned={earned} size={64} />
                <div className="mt-3 font-bold leading-6">{a.title}</div>
                <div className="mt-1 text-[14px] leading-5 text-ink-muted">{a.desc}</div>
                <div className={cx('mt-2 flex items-center gap-1 text-[14px] font-bold', earned ? 'text-leaf-ink' : 'text-ink-subtle')}>
                  {earned ? <Check size={16} /> : <Lock size={14} />}
                  {earned ? 'Earned' : 'Not yet'}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
