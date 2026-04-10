// User settings page showing account information and preference toggles.
// Account info is read from AuthContext. Preferences are local state only — not persisted yet.

import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Card } from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { Bell, User, Eye } from 'lucide-react';

/** Settings page with account info display and toggleable user preferences. */
export const Settings: React.FC = () => {
  const { user } = useAuth();

  // Preference state is local only — wire to a user preferences API/table when backend is ready.
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <Navbar />

      <main className="flex-1 px-8 py-8">
        <h1 className="text-4xl font-black text-primary mb-8">Settings</h1>

        {/* Account Information — read-only display from AuthContext */}
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

        {/* Preferences — toggle switches and a dropdown for evaluation duration */}
        <div>
          <h2 className="text-2xl font-bold text-primary mb-6">Preferences</h2>
          <Card>
            <div className="space-y-6">
              {/* Notifications toggle */}
              <div className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-100">
                <div className="flex items-center gap-4">
                  <Bell size={28} className="text-primary opacity-60" />
                  <div>
                    <p className="font-semibold text-primary">Notifications</p>
                    <p className="text-sm text-text">Receive evaluation alerts</p>
                  </div>
                </div>
                {/* Custom pill toggle — translate-x shifts the dot based on state */}
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`w-12 h-6 rounded-full transition ${
                    notifications ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition transform ${
                      notifications ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Email updates toggle */}
              <div className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-100">
                <div className="flex items-center gap-4">
                  <Eye size={28} className="text-primary opacity-60" />
                  <div>
                    <p className="font-semibold text-primary">Email Updates</p>
                    <p className="text-sm text-text">Get weekly summary emails</p>
                  </div>
                </div>
                <button
                  onClick={() => setEmailUpdates(!emailUpdates)}
                  className={`w-12 h-6 rounded-full transition ${
                    emailUpdates ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition transform ${
                      emailUpdates ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Default evaluation duration dropdown.
                  Note: defaultValue on an <option> is non-standard — move it to the <select> if this breaks. */}
              <div className="p-4 bg-white rounded-lg border border-gray-100">
                <p className="font-semibold text-primary mb-3">Default Evaluation Duration</p>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg text-primary font-semibold focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>15 minutes</option>
                  <option defaultValue="selected">20 minutes</option>
                  <option>30 minutes</option>
                  <option>45 minutes</option>
                  <option>60 minutes</option>
                </select>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};
