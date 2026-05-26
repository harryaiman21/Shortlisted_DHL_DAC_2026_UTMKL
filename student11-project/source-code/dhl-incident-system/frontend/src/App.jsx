import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import Layout from './components/Layout'; // Admin Layout

// --- Admin Pages ---
import Dashboard from './pages/Admin/Dashboard';
import Vault from './pages/Admin/Vault';
import DraftBuilder from './pages/Admin/DraftBuilder';
import Departments from './pages/Admin/Departments';
import BotControl from './pages/Admin/BotControl';
import EmployeeManager from './pages/Admin/EmployeeManager';
import NotificationsPage from './pages/Admin/NotificationsPage';

// --- Auth Pages ---
import Login from './pages/Login';
import Logout from './pages/Logout';

// --- The Bouncer (Route Protector) ---
const ProtectedRoute = ({ children }) => {
  const { user, token, loading } = useAuth();

  // 1. Wait for AuthContext to check localStorage before making a decision
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium">
        Loading workspace...
      </div>
    );
  }

  // 2. If there is no valid session, kick them back to the login page securely
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  // 3. If they have the keys, let them in!
  return children;
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            {/* --- PUBLIC ROUTES --- */}
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />

            {/* --- REDIRECT ROOT DIRECTLY TO ADMIN --- */}
            <Route path="/" element={<Navigate to="/admin" replace />} />

            {/* --- PROTECTED ADMIN ROUTES --- */}
            {/* The Layout component wraps all of these, displaying your Sidebar/Navbar */}
            <Route path="/admin" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="vault" element={<Vault />} />
              <Route path="draft" element={<DraftBuilder />} />
              <Route path="departments" element={<Departments />} />
              <Route path="employees" element={<EmployeeManager />} />
              <Route path="bot-control" element={<BotControl />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;