// Top navigation bar shown on all authenticated pages.
// Hides itself entirely if there is no authenticated user (prevents render on the login page).

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Top nav bar with route tabs, user info, AI status badge, and logout. */
export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  /** Returns true if the given path matches the current URL — used to highlight the active tab. */
  const isActive = (path: string) => location.pathname === path;

  /** Navigation tabs. Admin-only tabs are filtered out for non-admin users. */
  const isAdmin = user?.role === 'admin';
  const navTabs = [
    { path: '/', label: 'Evaluation' },
    { path: '/dashboard', label: 'Dashboard' },
    ...(isAdmin ? [{ path: '/research', label: 'Research Analytics' }] : []),
    ...(isAdmin ? [{ path: '/admin', label: 'Admin' }] : []),
    { path: '/settings', label: 'Settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Don't render anything if there's no user — avoids a flash of the navbar on the login page
  if (!user) return null;

  return (
    <nav className="navbar-container">
      <div className="navbar-left">
        <div className="navbar-logo">
          <img src="/uvu-official.svg" alt="UVU Logo" className="uvu-logo-image" />
        </div>
        <div className="navbar-tabs">
          {navTabs.map((tab) => (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`navbar-tab ${isActive(tab.path) ? 'is-active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="navbar-right">
        {/* Visual indicator that AI features are available — not interactive yet */}
        <div className="ai-badge">
          <div className="ai-dot"></div>
          <span>AI Enabled</span>
        </div>

        <div className="navbar-divider"></div>

        {/* User avatar and name — avatar letter is hardcoded "W", should derive from user.name */}
        <div className="navbar-user">
          <div className="user-avatar">W</div>
          <span className="user-name">{user?.name || 'Willy Wolverine'}</span>
        </div>

        <div className="navbar-divider"></div>

        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </nav>
  );
};
