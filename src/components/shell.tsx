import { Bell, Gift, Home, Map as MapIcon, Signal, Wallet, Wifi, Zap } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { cx, fmtTime } from '../lib/format';
import { isDaylight, hourOf } from '../sim/solar';
import { useLongPress, usePersona } from '../store/hooks';
import { useStore } from '../store/useStore';
import { WEATHER_LABEL, WeatherIcon } from './status';
import { Avatar } from './ui';
import { useT } from '../lib/i18n';

export function SunMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="12" fill="var(--color-sky)" />
      <g className="spin-slow" stroke="var(--color-sun)" strokeWidth="2.6" strokeLinecap="round">
        <path d="M20 6v3M20 29v3M7 19h3M30 19h3M10.8 9.8l2.1 2.1M27.1 26.1l2.1 2.1M10.8 28.2l2.1-2.1M27.1 11.9l2.1-2.1" />
      </g>
      <circle cx="20" cy="19" r="6" fill="var(--color-sun)" />
      <path d="M10 34h20" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

/** "SunD" wordmark: the D in Sime Darby red. */
export const SunD = () => (
  <>
    Sun<span className="text-sun">D</span>
  </>
);

export function StatusBar() {
  const simTime = useStore((s) => s.simTime);
  return (
    <div className="status-bar h-11 shrink-0 items-center justify-between px-7 text-[15px] font-bold text-ink">
      <span className="tabular">{fmtTime(simTime).replace(/ [ap]m/, '')}</span>
      <span className="flex items-center gap-1.5 text-ink">
        <Signal size={16} strokeWidth={2.5} />
        <Wifi size={16} strokeWidth={2.5} />
        <span className="ml-0.5 inline-flex h-3.5 w-6 items-center rounded-[4px] border-2 border-ink p-[1px]">
          <span className="h-full w-[70%] rounded-[2px] bg-ink" />
        </span>
      </span>
    </div>
  );
}

/** Scroll container that resets to the top on navigation. */
function ScrollArea({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  useEffect(() => {
    ref.current?.scrollTo(0, 0);
  }, [pathname]);
  return (
    <main ref={ref} className="scroll">
      {children}
    </main>
  );
}

export function TabShell() {
  return (
    <>
      <ScrollArea>
        <Outlet />
      </ScrollArea>
      <BottomNav />
    </>
  );
}

export function SubShell() {
  return (
    <ScrollArea>
      <Outlet />
    </ScrollArea>
  );
}

function BottomNav() {
  const t = useT();
  const charging = useStore((s) => s.session?.status === 'charging');
  const item = (to: string, label: string, icon: ReactNode) => (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) => cx('flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl text-[13px] font-bold', isActive ? 'text-sky-deep' : 'text-ink-muted')}
    >
      {icon}
      {label}
    </NavLink>
  );
  return (
    <nav className="relative z-20 flex shrink-0 items-end gap-1 border-t border-outline bg-page px-3 pb-[max(8px,env(safe-area-inset-bottom))] pt-1.5" aria-label="Main">
      {item('/', t('Home'), <Home size={24} />)}
      {item('/wallet', t('Wallet'), <Wallet size={24} />)}
      <div className="flex flex-1 justify-center">
        <Link
          to={charging ? '/charge/session' : '/charge'}
          aria-label={charging ? 'Charging in progress' : 'Charge'}
          className={cx('-mt-7 flex h-16 w-16 items-center justify-center rounded-full text-white shadow-active transition-transform active:scale-95', charging ? 'bg-leaf-deep ring-pulse' : 'bg-sun')}
          style={{ boxShadow: '0 0 0 5px #fff, var(--shadow-active)' }}
        >
          <Zap size={30} fill="currentColor" />
        </Link>
      </div>
      {item('/map', t('Map'), <MapIcon size={24} />)}
      {item('/rewards', t('Rewards'), <Gift size={24} />)}
    </nav>
  );
}

/** Header for the main tabs. Long-press the logo to open the presenter controls. */
export function TabHeader({ title }: { title?: ReactNode }) {
  const t = useT();
  const persona = usePersona();
  const simTime = useStore((s) => s.simTime);
  const weather = useStore((s) => s.weather);
  const speed = useStore((s) => s.speed);
  const unread = useStore((s) => s.notices.some((n) => !n.read));
  const setDemoOpen = useStore((s) => s.setDemoOpen);
  const press = useLongPress(() => setDemoOpen(true));
  const night = !isDaylight(hourOf(simTime));

  return (
    <header className="flex items-center gap-3 px-5 pb-2 pt-3">
      <button type="button" className="shrink-0 select-none rounded-xl" aria-label="SunD Wallet (long-press for demo controls)" {...press}>
        <SunMark size={44} />
      </button>
      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-[19px] font-bold leading-6">{typeof title === 'string' ? t(title) : (title ?? <><SunD /> Wallet</>)}</div>
        <div className="flex items-center gap-1.5 whitespace-nowrap text-[14px] text-ink-muted">
          <span className="live-dot shrink-0" aria-hidden="true" />
          <span className="tabular">{fmtTime(simTime)}</span>
          <span className="flex items-center gap-1" title={night ? 'Night' : WEATHER_LABEL[weather]}>
            <WeatherIcon weather={weather} night={night} size={15} />
            <span className="sr-only">{night ? 'Night' : WEATHER_LABEL[weather]}</span>
          </span>
          {speed !== 1 && <span className="rounded-md bg-sunken px-1.5 font-mono text-[12px] font-bold">{speed === 0 ? 'paused' : `${speed}×`}</span>}
        </div>
      </div>
      <Link to="/notifications" className="icon-btn" aria-label={unread ? 'Notifications, unread' : 'Notifications'}>
        <Bell size={24} />
        {unread && <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-sky ring-2 ring-white" />}
      </Link>
      <Link to="/profile" aria-label="Profile" className="rounded-full">
        <Avatar initials={persona.initials} size={40} />
      </Link>
    </header>
  );
}
