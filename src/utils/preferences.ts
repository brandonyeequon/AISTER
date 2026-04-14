// Persisted per-user Settings preferences. Stored as a jsonb column on profiles.

import { supabase } from './supabase';

export interface UserPreferences {
  notifications: boolean;
  emailUpdates: boolean;
  defaultDurationMinutes: number;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  notifications: true,
  emailUpdates: true,
  defaultDurationMinutes: 20,
};

function coerce(raw: Partial<UserPreferences> | null | undefined): UserPreferences {
  return {
    notifications: raw?.notifications ?? DEFAULT_PREFERENCES.notifications,
    emailUpdates: raw?.emailUpdates ?? DEFAULT_PREFERENCES.emailUpdates,
    defaultDurationMinutes:
      raw?.defaultDurationMinutes ?? DEFAULT_PREFERENCES.defaultDurationMinutes,
  };
}

export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  const { data, error } = await supabase
    .from('profiles')
    .select('preferences')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Failed to load preferences:', error.message);
    return DEFAULT_PREFERENCES;
  }

  return coerce(data?.preferences as Partial<UserPreferences> | null);
}

export async function saveUserPreferences(
  userId: string,
  prefs: UserPreferences
): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({ preferences: prefs })
    .eq('id', userId);

  if (error) {
    console.error('Failed to save preferences:', error.message);
    return false;
  }
  return true;
}
