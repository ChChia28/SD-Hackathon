import { BellOff } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TOAST_ICONS } from '../../components/overlays';
import { PageHeader } from '../../components/ui';
import { cx, fmtDateTime } from '../../lib/format';
import { useStore } from '../../store/useStore';

export default function Notifications() {
  const notices = useStore((s) => s.notices);
  const markRead = useStore((s) => s.markNoticesRead);
  const nav = useNavigate();
  // Mark read when leaving, so unread items stay highlighted while they're on screen.
  useEffect(() => () => markRead(), [markRead]);

  return (
    <>
      <PageHeader title="Notifications" />
      {notices.length === 0 ? (
        <div className="p-10 text-center text-ink-muted">
          <BellOff size={40} className="mx-auto mb-3" />
          Nothing here yet.
        </div>
      ) : (
        <ul className="divide-y divide-outline">
          {notices.map((n) => {
            const { Icon, cls } = TOAST_ICONS[n.icon];
            return (
              <li key={n.id}>
                <button type="button" disabled={!n.to} onClick={() => n.to && nav(n.to)} className={cx('flex w-full items-start gap-3 px-5 py-4 text-left', !n.read && 'bg-sky-soft/50')}>
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${cls}`}>
                    <Icon size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold leading-6">{n.title}</span>
                    {n.body && <span className="block text-[15px] leading-6 text-ink-muted">{n.body}</span>}
                    <span className="mt-0.5 block text-[14px] text-ink-subtle">{fmtDateTime(n.at)}</span>
                  </span>
                  {!n.read && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-sky" aria-label="Unread" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
