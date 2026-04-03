// Authentication page with Login and Sign Up tabs.
// Login form uses React Hook Form + Zod validation.
// Auth is fully mocked — any username + password "123456" works.
// The "Test Evaluations (Dev)" button must be removed before production deployment.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import { FormInput } from '../components/FormInput';

/** Zod schema for the login form — username required, password minimum 6 chars. */
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

/** Login/signup page. Redirects to /evaluations on successful authentication. */
export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  /** Handles the standard login form submit — passes username as the email to the mock auth. */
  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      await login(data.username, data.password);
      navigate('/evaluations');
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error(err);
    }
  };

  /**
   * One-click dev login that bypasses the form.
   * TODO: Remove this button before deploying to production.
   */
  const handleTestLogin = async () => {
    try {
      setError(null);
      await login('test@example.com', '123456');
      navigate('/evaluations');
    } catch (err) {
      setError('Test login failed. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="auth-signin">
      <div className="login-container">
        <div className="login-card">
          {/* Brand header — UVU logo + AI-STER name */}
          <div className="login-brand">
            <img src="/uvu-2-logo.png" alt="UVU Logo" className="login-logo" />
            <h2 className="brand-name">AI-STER</h2>
          </div>

          {/* Tab switcher — Login / Sign Up */}
          <div className="auth-tabs">
            <button
              onClick={() => setActiveTab('login')}
              className={`auth-tab ${activeTab === 'login' ? 'is-active' : ''}`}
              type="button"
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`auth-tab ${activeTab === 'signup' ? 'is-active' : ''}`}
              type="button"
            >
              Sign Up
            </button>
          </div>

          {activeTab === 'login' && (
            <>
              <h3 className="login-title">Welcome Back</h3>

              <form onSubmit={handleSubmit(onSubmit)} className="login-form">
                {error && <div className="login-alert">{error}</div>}

                <FormInput
                  label="Username"
                  type="text"
                  placeholder="Enter Your Username"
                  {...register('username')}
                  error={errors.username?.message}
                />

                <FormInput
                  label="Password"
                  type="password"
                  placeholder="Enter Your Password"
                  {...register('password')}
                  error={errors.password?.message}
                />

                <button type="submit" disabled={isLoading} className="login-button">
                  {isLoading ? 'Signing in...' : 'Login to Your Account'}
                </button>
              </form>

              {/* Helper text for demo / development */}
              <div className="login-demo">Demo: username: anything • password: 123456</div>

              {/* Dev-only shortcut — remove before production */}
              <button
                type="button"
                onClick={handleTestLogin}
                disabled={isLoading}
                className="test-button"
              >
                Test Evaluations (Dev)
              </button>
            </>
          )}

          {activeTab === 'signup' && (
            <>
              <h3 className="login-title">Create Account</h3>
              <p className="signup-note">Sign up functionality coming soon</p>
            </>
          )}
        </div>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <p>© 2025 Utah Valley University School of Education</p>
          <p>
            Need help? Contact Krista Ruggles |{' '}
            <a href="mailto:kruggles@uvu.edu" className="footer-link">
              K.Ruggles@uvu.edu
            </a>{' '}
            | 801-863-8057
          </p>
        </div>
      </footer>
    </div>
  );
};
