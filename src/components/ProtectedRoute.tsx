// Route guard. Redirects unauthenticated users to /login and (optionally) gates by role.

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, User } from '../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If set, restricts the route to users whose role is in this list. */
  requireRole?: User['role'][];
}

/**
 * Wraps a route element with authentication (+ optional role) enforcement.
 * - While auth is loading: shows a spinner.
 * - Not authenticated → /login.
 * - Authenticated but role not permitted → /dashboard.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireRole }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && !requireRole.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
