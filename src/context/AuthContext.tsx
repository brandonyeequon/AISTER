// Manages authentication state and session persistence for the AISTER app.
// Auth is currently mocked — any email + password "123456" works.
// When connecting a real backend, replace the login() body (marked with TODO below).

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

/** Shape of an authenticated user. */
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'teacher' | 'admin' | 'evaluator';
}

/** Everything exposed by AuthContext to consumers. */
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Wraps the app in auth state. Must be rendered above any component that calls useAuth(). */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  // Start in loading state so ProtectedRoute shows a spinner instead of
  // immediately redirecting to login before the localStorage check completes.
  const [isLoading, setIsLoading] = useState(true);

  // SESSION RESTORE: On mount, try to rehydrate the user from localStorage.
  // This keeps evaluators logged in across page refreshes.
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      // If the stored value is corrupt JSON, silently discard it and remain logged out.
      console.error('Failed to restore user from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logs in a user by email and password.
   * Currently mocked — accepts any email, ignores password.
   * TODO: Replace with actual API call (e.g., Supabase signInWithPassword).
   */
  const login = useCallback(async (email: string, _password: string) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockUser: User = {
        id: '1',
        email,
        // Derive display name from the email prefix (e.g., "jdoe@uvu.edu" → "jdoe")
        name: email.split('@')[0],
        role: 'teacher',
      };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Clears user state and removes the session from localStorage. */
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    // Derive isAuthenticated from user presence rather than a separate boolean
    // to keep them from ever getting out of sync.
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

/**
 * Returns the current auth context.
 * Must be called inside a component that is a descendant of AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
