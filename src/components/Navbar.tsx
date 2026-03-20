import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/evaluations', label: 'Evaluations' },
    ...(user?.role === 'admin' ? [{ path: '/admin', label: 'Admin' }] : []),
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="flex justify-between items-center px-5 py-5 shadow-md bg-white">
      <div className="flex items-center gap-8">
        <h1 className="text-4xl font-black text-primary">AISTER</h1>
        <div className="flex gap-8">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`text-2xl font-black text-primary transition-all ${
                isActive(link.path)
                  ? 'underline underline-offset-4'
                  : 'hover:text-primary-dark'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="text-lg font-bold text-primary hover:text-primary-dark"
      >
        Logout
      </button>
    </nav>
  );
};
