// User settings page. Account info is read-only from AuthContext; preferences are
// persisted to profiles.preferences (jsonb) so they follow the user across devices.

import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Card } from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { Bell, User, Eye, LucideIcon } from 'lucide-react';
import {
  DEFAULT_PREFERENCES,
  UserPreferences,
  getUserPreferences,
  saveUserPreferences,
} from '../utils/preferences';

const DURATION_OPTIONS = [15, 20, 30, 45, 60];

interface TogglePrefRowProps {
  icon: LucideIcon;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}

const TogglePrefRow: React.FC<TogglePrefRowProps> = ({
  icon: Icon,
  label,
  description,
  checked,
  disabled,
  onChange,
}) => (
  <div className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-100">
    <div className="flex items-center gap-4">
      <Icon size={28} className="text-primary opacity-60" />
      <div>
        <p className="font-semibold text-primary">{label}</p>
        <p className="text-sm text-text">{description}</p>
      </div>
    </div>
    <button
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full transition ${
        checked ? 'bg-primary' : 'bg-gray-300'
      } disabled:opacity-50`}
      aria-pressed={checked}
      aria-label={label}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full transition transform ${
          checked ? 'translate-x-6' : 'translate-x-0.5'
        }`}
      />
    </button>
  </div>
);

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'error'>('idle');

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setIsLoading(true);
    getUserPreferences(user.id).then((loaded) => {
      if (!cancelled) {
        setPrefs(loaded);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const persist = async (next: UserPreferences) => {
    if (!user) return;
    setPrefs(next);
    setSavingState('saving');
    const ok = await saveUserPreferences(user.id, next);
    setSavingState(ok ? 'idle' : 'error');
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <Navbar />

      <main className="flex-1 px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black text-primary">Settings</h1>
          {savingState === 'saving' && <p className="text-sm text-text">Saving…</p>}
          {savingState === 'error' && <p className="text-sm text-red-600">Save failed</p>}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary mb-6">Account Information</h2>
          <Card>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <User size={28} className="text-primary opacity-60" />
                <div>
                  <p className="text-sm font-semibold text-text mb-1">Full Name</p>
                  <p className="text-lg font-semibold text-primary">{user?.name || 'Not Set'}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center gap-4">
                  <User size={28} className="text-primary opacity-60" />
                  <div>
                    <p className="text-sm font-semibold text-text mb-1">Email</p>
                    <p className="text-lg font-semibold text-primary">{user?.email || 'Not Set'}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center gap-4">
                  <User size={28} className="text-primary opacity-60" />
                  <div>
                    <p className="text-sm font-semibold text-text mb-1">Role</p>
                    <p className="text-lg font-semibold text-primary">{user?.role || 'Evaluator'}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-primary mb-6">Preferences</h2>
          <Card>
            <div className="space-y-6">
              <TogglePrefRow
                icon={Bell}
                label="Notifications"
                description="Receive evaluation alerts"
                checked={prefs.notifications}
                disabled={isLoading}
                onChange={(next) => void persist({ ...prefs, notifications: next })}
              />

              <TogglePrefRow
                icon={Eye}
                label="Email Updates"
                description="Get weekly summary emails"
                checked={prefs.emailUpdates}
                disabled={isLoading}
                onChange={(next) => void persist({ ...prefs, emailUpdates: next })}
              />

              <div className="p-4 bg-white rounded-lg border border-gray-100">
                <p className="font-semibold text-primary mb-3">Default Evaluation Duration</p>
                <select
                  disabled={isLoading}
                  value={prefs.defaultDurationMinutes}
                  onChange={(e) =>
                    void persist({ ...prefs, defaultDurationMinutes: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-primary font-semibold focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                >
                  {DURATION_OPTIONS.map((value) => (
                    <option key={value} value={value}>
                      {value} minutes
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};
