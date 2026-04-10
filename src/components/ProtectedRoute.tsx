// Route guard that redirects unauthenticated users to /login.
// Shows a loading spinner while the auth state is being restored from localStorage
// to prevent a flash of the login redirect on page refresh.

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Wraps a route element with authentication enforcement.
 * - While auth is loading (localStorage check in progress): shows a spinner.
 * - If not authenticated: redirects to /login (replace: true prevents back-nav to the guarded page).
 * - If authenticated: renders the wrapped children.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Still checking localStorage — show a spinner to avoid a race-condition redirect
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-primary font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in — send to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
