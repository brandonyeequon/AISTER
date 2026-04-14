// Root application component. Defines all client-side routes and wraps the tree in AuthProvider.
// Every route except /login is protected — unauthenticated users are redirected to /login.

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Evaluations } from './pages/Evaluations';
import { AdminDashboard } from './pages/AdminDashboard';
import { ResearchAnalytics } from './pages/ResearchAnalytics';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';
import './styles/globals.css';

function App() {
  return (
    // BrowserRouter must wrap AuthProvider because ProtectedRoute uses useNavigate,
    // which requires a Router context to be present.
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public route — no auth required */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes — ProtectedRoute redirects to /login if not authenticated */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Evaluations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/research"
            element={
              <ProtectedRoute>
                <ResearchAnalytics />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Default redirect — send root URL to the main evaluation flow */}
          <Route path="/" element={<Navigate to="/evaluations" replace />} />

          {/* Catch-all — any unmatched path shows the 404 page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
