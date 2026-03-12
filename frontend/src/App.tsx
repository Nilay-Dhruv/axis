import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';

// Lazy load ALL page components
const Dashboard      = lazy(() => import('./pages/Dashboard'));
const Departments    = lazy(() => import('./pages/Departments'));
const DepartmentDetail = lazy(() => import('./pages/DepartmentDetail'));
const Activities     = lazy(() => import('./pages/Activities'));
const ActivityLogs   = lazy(() => import('./pages/ActivityLogs'));
const Outcomes       = lazy(() => import('./pages/Outcomes'));
const OutcomeDetail  = lazy(() => import('./pages/OutcomeDetail'));
const Signals        = lazy(() => import('./pages/Signals'));
const SignalDetail   = lazy(() => import('./pages/SignalDetail'));
const Analytics      = lazy(() => import('./pages/Analytics'));
const Roles          = lazy(() => import('./pages/Roles'));
const Settings       = lazy(() => import('./pages/Settings'));
const Automations    = lazy(() => import('./pages/Automations'));
const Decisions      = lazy(() => import('./pages/Decisions'));
const DecisionDetail = lazy(() => import('./pages/DecisionDetail'));
const Simulations    = lazy(() => import('./pages/Simulations'));
const Reports        = lazy(() => import('./pages/Reports'));
const DataImport     = lazy(() => import('./pages/DataImport'));
const Webhooks       = lazy(() => import('./pages/Webhooks'));
const ApiKeys        = lazy(() => import('./pages/ApiKeys'));
const TwoFactor      = lazy(() => import('./pages/TwoFactor'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const AuditLog       = lazy(() => import('./pages/AuditLog'));
const NotFound       = lazy(() => import('./pages/NotFound'));

// Fallback shown while chunk loads
function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'var(--neu-bg)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '3px solid var(--neu-divider)',
          borderTopColor: '#5aa9c4',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px'
        }} />
        <p style={{ color: 'var(--neu-text-light)', fontSize: 13 }}>Loading…</p>
      </div>
    </div>
  );
}

export default function App() {
  // Initialize theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('axis-theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"        element={<Dashboard />} />
            <Route path="departments"      element={<Departments />} />
            <Route path="departments/:id"  element={<DepartmentDetail />} />
            <Route path="activities"       element={<Activities />} />
            <Route path="activity-logs"    element={<ActivityLogs />} />
            <Route path="outcomes"         element={<Outcomes />} />
            <Route path="outcomes/:id"     element={<OutcomeDetail />} />
            <Route path="signals"          element={<Signals />} />
            <Route path="signals/:id"      element={<SignalDetail />} />
            <Route path="analytics"        element={<Analytics />} />
            <Route path="roles"            element={<Roles />} />
            <Route path="settings"         element={<Settings />} />
            <Route path="settings/2fa"     element={<TwoFactor />} />
            <Route path="automations"      element={<Automations />} />
            <Route path="decisions"        element={<Decisions />} />
            <Route path="decisions/:id"    element={<DecisionDetail />} />
            <Route path="simulations"      element={<Simulations />} />
            <Route path="reports"          element={<Reports />} />
            <Route path="import"           element={<DataImport />} />
            <Route path="webhooks"         element={<Webhooks />} />
            <Route path="api-keys"         element={<ApiKeys />} />
            <Route path="admin/users"      element={<UserManagement />} />
            <Route path="admin/audit-log"  element={<AuditLog />} />
            <Route path="*"                element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}