// Manages authentication state and session persistence for the AISTER app.
// Backed by Supabase — sessions rehydrate from Supabase's own storage and stay
// in sync via onAuthStateChange.

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

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
  session: Session | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapSupabaseUserToLocalUser = (suUser: SupabaseUser): User => ({
  id: suUser.id,
  email: suUser.email || '',
  name: suUser.user_metadata?.full_name || suUser.email?.split('@')[0] || 'User',
  role: suUser.user_metadata?.role || 'teacher',
});

/** Wraps the app in auth state. Must be rendered above any component that calls useAuth(). */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Start in loading state so ProtectedRoute shows a spinner instead of
  // immediately redirecting to login before the Supabase session check completes.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error.message);
          return;
        }

        if (mounted) {
          setSession(initialSession);
          if (initialSession?.user) {
            setUser(mapSupabaseUserToLocalUser(initialSession.user));
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) {
        setSession(newSession);
        if (newSession?.user) {
          setUser(mapSupabaseUserToLocalUser(newSession.user));
        } else {
          setUser(null);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        setSession(data.session);
        if (data.user) {
          setUser(mapSupabaseUserToLocalUser(data.user));
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    // Derive isAuthenticated from user presence rather than a separate boolean
    // to keep them from ever getting out of sync.
    isAuthenticated: !!user,
    session,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
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
