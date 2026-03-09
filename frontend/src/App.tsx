import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Departments from './pages/Departments'
import ComingSoon from './pages/ComingSoon'
import ProtectedRoute from './components/common/ProtectedRoute'
import PublicRoute from './components/common/PublicRoute'
import Activities from './pages/Activities'
import Outcomes from './pages/Outcomes'
import Signals from './pages/Signals'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard"   element={<Dashboard />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/outcomes" element={<Outcomes />} />
          <Route path="/signals"  element={<Signals />} />
          <Route path="/analytics"   element={<ComingSoon />} />
          <Route path="/automations" element={<ComingSoon />} />
          <Route path="/decisions"   element={<ComingSoon />} />
          <Route path="/simulations" element={<ComingSoon />} />
          <Route path="/roles"       element={<ComingSoon />} />
          <Route path="/settings"    element={<ComingSoon />} />
        </Route>

        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        <Route path="*"  element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}