// Admin overview page showing system-wide stats and status indicators.
// All data is currently hardcoded mock values — wire to real admin API endpoints when available.

import React from 'react';
import { Navbar } from '../components/Navbar';
import { Card } from '../components/Card';

/** Admin dashboard with system stats, health indicators, and recent activity logs. */
export const AdminDashboard: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <Navbar />

      <main className="flex-1 px-8 py-8">
        <h1 className="text-4xl font-black text-primary mb-8">Admin Dashboard</h1>

        {/* Top-level KPI cards — hardcoded until real admin queries are connected */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <h2 className="text-lg font-bold text-primary mb-2">Total Teachers</h2>
            <p className="text-4xl font-black text-primary">24</p>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-primary mb-2">Total Evaluations</h2>
            <p className="text-4xl font-black text-primary">156</p>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-primary mb-2">Pending Reviews</h2>
            <p className="text-4xl font-black text-primary">12</p>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-primary mb-2">System Health</h2>
            <p className="text-2xl font-bold text-green-600">✓ Healthy</p>
          </Card>
        </div>

        {/* System Status & Recent Logs — all placeholder values */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-2xl font-bold text-primary mb-4">System Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-semibold">Database</span>
                <span className="text-green-600">Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">API Server</span>
                <span className="text-green-600">Running</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">AI Services</span>
                <span className="text-green-600">Active</span>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold text-primary mb-4">Recent Logs</h2>
            <div className="space-y-2 text-sm text-text">
              <p>✓ Database backup completed</p>
              <p>✓ User sync successful</p>
              <p>✓ AI model updated</p>
              <p>✓ System check passed</p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};
