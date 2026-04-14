// Authentication page with Login, Sign Up, and Forgot Password tabs.
// Forms use React Hook Form + Zod validation. Auth is backed by Supabase.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import { FormInput } from '../components/FormInput';
import { supabase } from '../utils/supabase';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const signupSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignupFormData = z.infer<typeof signupSchema>;

const forgotSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

type AuthTab = 'login' | 'signup' | 'forgot';

/** Login/signup page. Redirects to /evaluations on successful authentication. */
export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null);
  const [signupSubmitting, setSignupSubmitting] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<AuthTab>('login');

  const loginForm = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });
  const signupForm = useForm<SignupFormData>({ resolver: zodResolver(signupSchema) });
  const forgotForm = useForm<ForgotFormData>({ resolver: zodResolver(forgotSchema) });

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      await login(data.email, data.password);
      navigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(message);
      console.error(err);
    }
  };

  const onSignupSubmit = async (data: SignupFormData) => {
    setSignupError(null);
    setSignupSuccess(null);
    setSignupSubmitting(true);

    try {
      const { data: signupData, error: signupErr } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { full_name: data.fullName, role: 'evaluator' },
        },
      });

      if (signupErr) throw signupErr;

      // If the Supabase project has email confirmation enabled, there is no session yet.
      if (!signupData.session) {
        setSignupSuccess(
          `Account created. Check ${data.email} for a confirmation email, then sign in.`
        );
        signupForm.reset();
        setActiveTab('login');
        return;
      }

      // Email confirmation disabled → user is already signed in.
      await login(data.email, data.password);
      navigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed. Please try again.';
      setSignupError(message);
      console.error(err);
    } finally {
      setSignupSubmitting(false);
    }
  };

  const onForgotSubmit = async (data: ForgotFormData) => {
    setForgotError(null);
    setForgotSuccess(null);
    setForgotSubmitting(true);

    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetErr) throw resetErr;
      setForgotSuccess(`Password reset email sent to ${data.email}. Check your inbox.`);
      forgotForm.reset();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not send reset email.';
      setForgotError(message);
    } finally {
      setForgotSubmitting(false);
    }
  };

  return (
    <div className="auth-signin">
      <div className="login-container">
        <div className="login-card">
          <div className="login-brand">
            <img src="/uvu-2-logo.png" alt="UVU Logo" className="login-logo" />
            <h2 className="brand-name">AI-STER</h2>
          </div>

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

              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="login-form">
                {error && <div className="login-alert">{error}</div>}
                {signupSuccess && <div className="login-alert login-alert-success">{signupSuccess}</div>}

                <FormInput
                  label="Email"
                  type="email"
                  placeholder="you@uvu.edu"
                  autoComplete="email"
                  {...loginForm.register('email')}
                  error={loginForm.formState.errors.email?.message}
                />

                <FormInput
                  label="Password"
                  type="password"
                  placeholder="Enter Your Password"
                  autoComplete="current-password"
                  {...loginForm.register('password')}
                  error={loginForm.formState.errors.password?.message}
                />

                <button type="submit" disabled={isLoading} className="login-button">
                  {isLoading ? 'Signing in...' : 'Login to Your Account'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('forgot');
                    setForgotError(null);
                    setForgotSuccess(null);
                  }}
                  className="mt-3 text-sm font-semibold text-primary hover:underline"
                >
                  Forgot your password?
                </button>
              </form>
            </>
          )}

          {activeTab === 'signup' && (
            <>
              <h3 className="login-title">Create Account</h3>

              <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="login-form">
                {signupError && <div className="login-alert">{signupError}</div>}

                <FormInput
                  label="Full Name"
                  type="text"
                  placeholder="Jane Wolverine"
                  autoComplete="name"
                  {...signupForm.register('fullName')}
                  error={signupForm.formState.errors.fullName?.message}
                />

                <FormInput
                  label="Email"
                  type="email"
                  placeholder="you@uvu.edu"
                  autoComplete="email"
                  {...signupForm.register('email')}
                  error={signupForm.formState.errors.email?.message}
                />

                <FormInput
                  label="Password"
                  type="password"
                  placeholder="Create a password"
                  autoComplete="new-password"
                  {...signupForm.register('password')}
                  error={signupForm.formState.errors.password?.message}
                />

                <button type="submit" disabled={signupSubmitting} className="login-button">
                  {signupSubmitting ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
            </>
          )}

          {activeTab === 'forgot' && (
            <>
              <h3 className="login-title">Reset Password</h3>

              <form onSubmit={forgotForm.handleSubmit(onForgotSubmit)} className="login-form">
                {forgotError && <div className="login-alert">{forgotError}</div>}
                {forgotSuccess && <div className="login-alert login-alert-success">{forgotSuccess}</div>}

                <p className="text-sm text-text mb-2">
                  Enter your email and we'll send a reset link.
                </p>

                <FormInput
                  label="Email"
                  type="email"
                  placeholder="you@uvu.edu"
                  autoComplete="email"
                  {...forgotForm.register('email')}
                  error={forgotForm.formState.errors.email?.message}
                />

                <button type="submit" disabled={forgotSubmitting} className="login-button">
                  {forgotSubmitting ? 'Sending…' : 'Send Reset Link'}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="mt-3 text-sm font-semibold text-primary hover:underline"
                >
                  Back to login
                </button>
              </form>
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
