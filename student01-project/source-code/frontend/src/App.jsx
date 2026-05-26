import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import SubmitIncident from './pages/SubmitIncident'
import IncidentDetail from './pages/IncidentDetail'
import Reports from './pages/Reports'
import CategoryBreakdown from './pages/CategoryBreakdown'
import Settings from './pages/Settings'

function PrivateRoute({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Routes with Sidebar Layout */}
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/submit" element={<SubmitIncident />} />
        <Route path="/incidents/:id" element={<IncidentDetail />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/category" element={<CategoryBreakdown />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}