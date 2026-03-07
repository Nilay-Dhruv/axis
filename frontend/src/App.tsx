import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ComingSoon from './pages/ComingSoon'
import ProtectedRoute from './components/common/ProtectedRoute'
import PublicRoute from './components/common/PublicRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Protected routes — all wrapped in MainLayout */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard"   element={<Dashboard />} />
          <Route path="/departments" element={<ComingSoon />} />
          <Route path="/activities"  element={<ComingSoon />} />
          <Route path="/outcomes"    element={<ComingSoon />} />
          <Route path="/signals"     element={<ComingSoon />} />
          <Route path="/analytics"   element={<ComingSoon />} />
          <Route path="/automations" element={<ComingSoon />} />
          <Route path="/decisions"   element={<ComingSoon />} />
          <Route path="/simulations" element={<ComingSoon />} />
          <Route path="/roles"       element={<ComingSoon />} />
          <Route path="/settings"    element={<ComingSoon />} />
        </Route>

        {/* Default */}
        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        <Route path="*"  element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
} 