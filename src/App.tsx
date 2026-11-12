import { useEffect, useRef } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation, useSearchParams } from 'react-router-dom';
import { Confetti, DashboardFloat, DemoSheet, DemoSidePanel, Toasts } from './components/overlays';
import { ModeBar, PitchBottom, PitchEntry, PitchKeyBridge, PitchNotes, PitchTop, usePitchSwipe } from './components/pitch';
import { StatusBar, SubShell, TabShell } from './components/shell';
import Receipt from './pages/charge/Receipt';
import Scan from './pages/charge/Scan';
import Session from './pages/charge/Session';
import Setup from './pages/charge/Setup';
import Home from './pages/home/Home';
import Landing from './pages/Landing';
import Impact from './pages/home/Impact';
import Notifications from './pages/home/Notifications';
import SolarDetail from './pages/home/SolarDetail';
import BayDetail from './pages/map/BayDetail';
import MapPage from './pages/map/MapPage';
import Onboarding, { type OnboardingStep } from './pages/Onboarding';
import Profile from './pages/Profile';
import Achievements from './pages/rewards/Achievements';
import Redeem from './pages/rewards/Redeem';
import Rewards from './pages/rewards/Rewards';
import BuySaver from './pages/wallet/BuySaver';
import PassPage from './pages/wallet/Pass';
import CreditRules from './pages/wallet/CreditRules';
import Statement from './pages/wallet/Statement';
import TxDetail from './pages/wallet/TxDetail';
import Wallet from './pages/wallet/Wallet';
import Slice from './pages/wallet/Slice';
import Balcony from './pages/wallet/Balcony';
import Cool from './pages/cool/Cool';
import Sources from './pages/Sources';
import Dashboard from './pages/sdp/Dashboard';
import PilotCase from './pages/sdp/PilotCase';
import { ErrorBoundary } from './components/ErrorBoundary';
import { cx } from './lib/format';
import { useSimulation } from './store/hooks';
import { useStore } from './store/useStore';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<TabShell />}>
        <Route index element={<Home />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="map" element={<MapPage />} />
        <Route path="rewards" element={<Rewards />} />
      </Route>
      <Route element={<SubShell />}>
        <Route path="home/solar" element={<SolarDetail />} />
        <Route path="home/impact" element={<Impact />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
        <Route path="wallet/tx/:id" element={<TxDetail />} />
        <Route path="wallet/statement" element={<Statement />} />
        <Route path="wallet/saver" element={<BuySaver />} />
        <Route path="wallet/pass" element={<PassPage />} />
        <Route path="wallet/rules" element={<CreditRules />} />
        <Route path="wallet/slice" element={<Slice />} />
        <Route path="wallet/balcony" element={<Balcony />} />
        <Route path="cool" element={<Cool />} />
        <Route path="sources" element={<Sources />} />
        <Route path="pilot" element={<PilotCase />} />
        <Route path="map/bay/:id" element={<BayDetail />} />
        <Route path="charge" element={<Scan />} />
        <Route path="charge/setup/:bayId" element={<Setup />} />
        <Route path="charge/session" element={<Session />} />
        <Route path="charge/receipt/:id" element={<Receipt />} />
        <Route path="rewards/redeem/:id" element={<Redeem />} />
        <Route path="rewards/achievements" element={<Achievements />} />
      </Route>
      <Route path="welcome" element={<Welcome />} />
      {/* #/pitch and #/pitch/N: PitchEntry moves to the step's screen; nothing to show meanwhile. */}
      <Route path="pitch/*" element={null} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/** A first-run screen held still for pitch mode: /welcome?step=splash or ?step=link. */
function Welcome() {
  const [params] = useSearchParams();
  const step = (params.get('step') ?? 'splash') as OnboardingStep;
  return <Onboarding key={step} start={step} hold />;
}

function Stage() {
  const onboarded = useStore((s) => s.onboarded);
  const large = useStore((s) => s.profiles[s.persona].largeText);
  const pitch = useStore((s) => s.pitch);
  const loc = useLocation();
  const swipe = usePitchSwipe();
  // Pitch mode: the app scrolls, but nothing in it can be pressed. Clicks (and keyboard presses, which arrive as clicks),
  // form changes and the logo's long-press are stopped before they reach the app; scrolling is left alone.
  const screenRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = screenRef.current;
    if (!el || !pitch.on) return;
    const block = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const stop = (e: Event) => e.stopPropagation();
    const blocked = ['click', 'dblclick', 'auxclick', 'contextmenu', 'submit', 'change', 'beforeinput'];
    blocked.forEach((t) => el.addEventListener(t, block, true));
    el.addEventListener('pointerdown', stop, true);
    return () => {
      blocked.forEach((t) => el.removeEventListener(t, block, true));
      el.removeEventListener('pointerdown', stop, true);
    };
  }, [pitch.on]);
  // The home page: choose Pitch mode or the Live prototype. The site link opens here.
  if (loc.pathname === '/start')
    return (
      <ErrorBoundary>
        <Landing />
      </ErrorBoundary>
    );
  if (loc.pathname.startsWith('/sdp'))
    return (
      <ErrorBoundary>
        <Dashboard />
        <DashboardFloat />
      </ErrorBoundary>
    );
  return (
    <div className="stage">
      {/* The phone column, the same on phones and laptops: a bar on top (Home + mode in the live prototype;
          Home, slide number and title in pitch mode), the app, and in pitch mode the navigation below.
          Full width on phones; a framed 390 px phone from sm up. */}
      <div className={cx('app-col flex w-full flex-col items-center sm:w-auto', pitch.on && 'pitch-col')} {...(pitch.on ? swipe : {})}>
        <ModeBar />
        <PitchTop />
        <div className={cx('phone', large && 'large-text')}>
          <StatusBar />
          <div className="screen" ref={screenRef}>
            <ErrorBoundary>{onboarded ? <AppRoutes /> : <Onboarding />}</ErrorBoundary>
            <Toasts />
            <DemoSheet />
            <Confetti />
          </div>
        </div>
        <PitchBottom />
      </div>
      <div className={pitch.on ? 'hidden' : 'contents'}>
        <DemoSidePanel />
      </div>
      <PitchNotes />
    </div>
  );
}

export default function App() {
  useSimulation();
  return (
    <HashRouter>
      <PitchKeyBridge />
      <PitchEntry />
      <Stage />
    </HashRouter>
  );
}
