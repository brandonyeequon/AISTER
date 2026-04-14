// Password reset landing page. Supabase sends users here from the recovery email with
// a session already established via the URL fragment — we just call updateUser().

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInput } from '../components/FormInput';
import { supabase } from '../utils/supabase';

const resetSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type ResetFormData = z.infer<typeof resetSchema>;

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState<boolean | null>(null);

  const form = useForm<ResetFormData>({ resolver: zodResolver(resetSchema) });

  useEffect(() => {
    // If no session is present by the time we render, the recovery link was invalid
    // or already consumed — getSession() reports the current state, and the listener
    // catches the PASSWORD_RECOVERY event emitted when Supabase exchanges the URL token.
    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setHasRecoverySession(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setHasRecoverySession((prev) => prev ?? data.session !== null);
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const onSubmit = async (data: ResetFormData) => {
    setError(null);
    setSubmitting(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: data.password });
      if (updateError) throw updateError;
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password.');
    } finally {
      setSubmitting(false);
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

          <h3 className="login-title">Reset Password</h3>

          {hasRecoverySession === false && (
            <div className="login-alert">
              This reset link is invalid or has already been used. Request a new one from the login page.
            </div>
          )}

          {success && (
            <div className="login-alert login-alert-success">
              Password updated. Redirecting to login…
            </div>
          )}

          {hasRecoverySession && !success && (
            <form onSubmit={form.handleSubmit(onSubmit)} className="login-form">
              {error && <div className="login-alert">{error}</div>}

              <FormInput
                label="New Password"
                type="password"
                placeholder="Enter a new password"
                autoComplete="new-password"
                {...form.register('password')}
                error={form.formState.errors.password?.message}
              />

              <FormInput
                label="Confirm Password"
                type="password"
                placeholder="Re-enter the new password"
                autoComplete="new-password"
                {...form.register('confirmPassword')}
                error={form.formState.errors.confirmPassword?.message}
              />

              <button type="submit" disabled={submitting} className="login-button">
                {submitting ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
