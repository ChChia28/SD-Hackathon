import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Confetti, DashboardFloat, DemoSheet, DemoSidePanel, Toasts } from './components/overlays';
import { PitchKeyBridge } from './components/pitch';
import { StatusBar, SubShell, TabShell } from './components/shell';
import Receipt from './pages/charge/Receipt';
import Scan from './pages/charge/Scan';
import Session from './pages/charge/Session';
import Setup from './pages/charge/Setup';
import Home from './pages/home/Home';
import Impact from './pages/home/Impact';
import Notifications from './pages/home/Notifications';
import SolarDetail from './pages/home/SolarDetail';
import BayDetail from './pages/map/BayDetail';
import MapPage from './pages/map/MapPage';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import Achievements from './pages/rewards/Achievements';
import Redeem from './pages/rewards/Redeem';
import Rewards from './pages/rewards/Rewards';
import BuySaver from './pages/wallet/BuySaver';
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
import { PitchTag } from './components/pitch';
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function Stage() {
  const onboarded = useStore((s) => s.onboarded);
  const large = useStore((s) => s.profiles[s.persona].largeText);
  const loc = useLocation();
  if (loc.pathname.startsWith('/sdp'))
    return (
      <ErrorBoundary>
        <Dashboard />
        <DashboardFloat />
      </ErrorBoundary>
    );
  return (
    <div className="stage">
      <div className="flex flex-col items-center gap-3">
        <PitchTag />
        <div className={cx('phone', large && 'large-text')}>
          <StatusBar />
          <div className="screen">
            <ErrorBoundary>{onboarded ? <AppRoutes /> : <Onboarding />}</ErrorBoundary>
            <Toasts />
            <DemoSheet />
            <Confetti />
          </div>
        </div>
      </div>
      <DemoSidePanel />
    </div>
  );
}

export default function App() {
  useSimulation();
  return (
    <HashRouter>
      <PitchKeyBridge />
      <Stage />
    </HashRouter>
  );
}
