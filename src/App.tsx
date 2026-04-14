// Root application component. Defines all client-side routes and wraps the tree in AuthProvider.
// Non-critical pages are lazy-loaded with React.lazy so the initial bundle only contains
// the auth shell + whichever route the user lands on.

import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Login } from './pages/Login';
import './styles/globals.css';

const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Evaluations = lazy(() =>
  import('./pages/Evaluations').then((m) => ({ default: m.Evaluations }))
);
const AdminDashboard = lazy(() =>
  import('./pages/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const ResearchAnalytics = lazy(() =>
  import('./pages/ResearchAnalytics').then((m) => ({ default: m.ResearchAnalytics }))
);
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })));
const ResetPassword = lazy(() =>
  import('./pages/ResetPassword').then((m) => ({ default: m.ResetPassword }))
);
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })));

function App() {
  return (
    // BrowserRouter must wrap AuthProvider because ProtectedRoute uses useNavigate,
    // which requires a Router context to be present.
    <Router>
      <AuthProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />

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
                <ProtectedRoute requireRole={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/research"
              element={
                <ProtectedRoute requireRole={['admin']}>
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

            <Route path="/evaluations" element={<Navigate to="/" replace />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
