import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import { FormInput } from '../components/FormInput';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

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

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      await login(data.username, data.password);
      navigate('/dashboard');
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="auth-signin">
      {/* Main Content */}
      <div className="login-container">
        <div className="login-card">
          {/* Logo and Branding */}
          <div className="text-center mb-4">
            <img src="/uvu-official.svg" alt="UVU Logo" className="login-logo mb-0 translate-x-2.5" />
            <h2 className="text-2xl font-bold text-primary">AI-STER</h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 justify-center">
            <button
              onClick={() => setActiveTab('login')}
              className={`px-8 py-2 rounded-lg font-bold text-lg transition-all ${
                activeTab === 'login'
                  ? 'bg-white text-primary shadow-md'
                  : 'bg-transparent text-primary border border-gray-300'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`px-8 py-2 rounded-lg font-bold text-lg transition-all ${
                activeTab === 'signup'
                  ? 'bg-white text-primary shadow-md'
                  : 'bg-transparent text-primary border border-gray-300'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Login Form */}
          {activeTab === 'login' && (
            <>
              <h3 className="login-title">Welcome Back</h3>

              <form onSubmit={handleSubmit(onSubmit)} className="login-form">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="login-button"
                >
                  {isLoading ? 'Signing in...' : 'Login to Your Account'}
                </button>
              </form>

              <div className="mt-4 text-center text-text text-sm">
                Demo: username: anything • password: 123456
              </div>
            </>
          )}

          {/* Sign Up Form */}
          {activeTab === 'signup' && (
            <>
              <h3 className="login-title">Create Account</h3>
              <p className="text-center text-text">Sign up functionality coming soon</p>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="text-center py-6 text-xs text-gray-600">
          <p>© 2025 Utah Valley University School of Education</p>
          <p>
            Need help? Contact Krista Ruggles |{' '}
            <a href="mailto:kruggles@uvu.edu" className="text-primary hover:underline">
              K.Ruggles@uvu.edu
            </a>{' '}
            | 801-863-8057
          </p>
        </div>
      </footer>
    </div>
  );
};
