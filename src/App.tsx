import { HashRouter, Navigate, Route, Routes, useLocation, useSearchParams } from 'react-router-dom';
import { Confetti, DashboardFloat, DemoSheet, DemoSidePanel, Toasts } from './components/overlays';
import { ModeBar, PITCH_STEPS, PitchBottom, PitchEntry, PitchKeyBridge, PitchNotes, PitchSlide, PitchTop, usePitchSwipe } from './components/pitch';
import { PitchVisual } from './components/pitchVisuals';
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
        <Route path="map/bay/:id" element={<BayDetail />} />
        <Route path="charge" element={<Scan />} />
        <Route path="charge/setup/:bayId" element={<Setup />} />
        <Route path="charge/session" element={<Session />} />
        <Route path="charge/receipt/:id" element={<Receipt />} />
        <Route path="rewards/redeem/:id" element={<Redeem />} />
        <Route path="rewards/achievements" element={<Achievements />} />
      </Route>
      <Route path="welcome" element={<Welcome />} />
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
  const visual = pitch.on ? PITCH_STEPS[Math.min(pitch.step, PITCH_STEPS.length - 1)].visual : undefined;
  const loc = useLocation();
  const swipe = usePitchSwipe();
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
      {/* Pitch mode on a laptop: the slide on the left, the app in the middle, labels on the right. */}
      <PitchSlide />
      {/* The phone column: a bar on top with the Home button (live prototype) or the slide (pitch mode), then the app.
          Full width on phones; a framed 390 px phone from sm up. Below 1200 px pitch mode adds captions with Back / Next. */}
      <div className={cx('app-col flex w-full flex-col items-center sm:w-auto', pitch.on && 'pitch-col')} {...(pitch.on ? swipe : {})}>
        <ModeBar />
        <PitchTop />
        {visual && <PitchVisual kind={visual} />}
        {/* Hidden, not unmounted, on picture steps so the app keeps its place. */}
        <div className={cx('phone', large && 'large-text')} style={visual ? { display: 'none' } : undefined}>
          <StatusBar />
          <div className="screen">
            <ErrorBoundary>{onboarded ? <AppRoutes /> : <Onboarding />}</ErrorBoundary>
            <Toasts />
            <DemoSheet />
            <Confetti />
          </div>
        </div>
        <PitchBottom />
      </div>
      {pitch.on && !visual && <div className="hidden w-[300px] shrink-0 min-[1200px]:block" aria-hidden="true" />}
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
