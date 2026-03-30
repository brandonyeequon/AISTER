import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navTabs = [
    { path: '/evaluations', label: 'Evaluation' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/research', label: 'Research Analytics' },
    { path: '/settings', label: 'Settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
        <div className="ai-badge">
          <div className="ai-dot"></div>
          <span>AI Enabled</span>
        </div>
        
        <div className="navbar-divider"></div>

        <div className="navbar-user">
          <div className="user-avatar">W</div>
          <span className="user-name">{user?.name || 'Willy Wolverine'}</span>
        </div>

        <div className="navbar-divider"></div>

        <button
          onClick={handleLogout}
          className="logout-button"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};
