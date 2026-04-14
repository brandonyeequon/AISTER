// Admin overview page. Pulls system-wide stats, recent activity, and a user management table.
// RLS gates every query — admins can read all profiles/evaluations and update any profile's role.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Card } from '../components/Card';
import { supabase } from '../utils/supabase';
import { useAuth, User } from '../context/AuthContext';
import { formatDate, formatDateTime } from '../utils/formatDate';

type Role = User['role'];

const ROLE_OPTIONS: Role[] = ['teacher', 'evaluator', 'admin'];

interface RecentActivityRow {
  id: string;
  status: string;
  updated_at: string;
  evaluator: { full_name: string | null; email: string } | null;
}

interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  created_at: string;
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [totalEvaluations, setTotalEvaluations] = useState(0);
  const [pendingReviews, setPendingReviews] = useState(0);
  const [recent, setRecent] = useState<RecentActivityRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingRoleChange, setPendingRoleChange] = useState<string | null>(null);

  const roleCounts = useMemo(() => {
    const counts: Record<Role, number> = { teacher: 0, evaluator: 0, admin: 0 };
    users.forEach((u) => {
      if (u.role in counts) counts[u.role] += 1;
    });
    return counts;
  }, [users]);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [totalResult, pendingResult, recentResult, usersResult] = await Promise.all([
        supabase.from('evaluations').select('*', { count: 'exact', head: true }),
        supabase
          .from('evaluations')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'in-progress'),
        supabase
          .from('evaluations')
          .select('id, status, updated_at, evaluator:profiles!evaluations_evaluator_id_fkey(full_name, email)')
          .order('updated_at', { ascending: false })
          .limit(8),
        supabase
          .from('profiles')
          .select('id, email, full_name, role, created_at')
          .order('created_at', { ascending: false }),
      ]);

      if (totalResult.error) throw new Error(totalResult.error.message);
      if (pendingResult.error) throw new Error(pendingResult.error.message);
      if (recentResult.error) throw new Error(recentResult.error.message);
      if (usersResult.error) throw new Error(usersResult.error.message);

      setTotalEvaluations(totalResult.count ?? 0);
      setPendingReviews(pendingResult.count ?? 0);
      setRecent((recentResult.data as unknown as RecentActivityRow[]) ?? []);
      setUsers((usersResult.data ?? []) as UserRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const handleRoleChange = async (targetId: string, nextRole: Role) => {
    if (targetId === user?.id && nextRole !== 'admin') {
      const confirmed = window.confirm(
        'You are about to remove your own admin role. You will lose access to this page. Continue?'
      );
      if (!confirmed) return;
    }

    setPendingRoleChange(targetId);
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: nextRole })
      .eq('id', targetId);
    setPendingRoleChange(null);

    if (updateError) {
      alert(`Failed to update role: ${updateError.message}`);
      return;
    }

    setUsers((prev) => prev.map((u) => (u.id === targetId ? { ...u, role: nextRole } : u)));
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <Navbar />

      <main className="flex-1 px-8 py-8">
        <h1 className="text-4xl font-black text-primary mb-8">Admin Dashboard</h1>

        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <h2 className="text-lg font-bold text-primary mb-2">Total Teachers</h2>
            <p className="text-4xl font-black text-primary">{isLoading ? '…' : roleCounts.teacher}</p>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-primary mb-2">Total Evaluations</h2>
            <p className="text-4xl font-black text-primary">{isLoading ? '…' : totalEvaluations}</p>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-primary mb-2">Pending Reviews</h2>
            <p className="text-4xl font-black text-primary">{isLoading ? '…' : pendingReviews}</p>
            <p className="text-xs text-text mt-1">Evaluations in progress</p>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-primary mb-2">Users</h2>
            <p className="text-sm text-text">
              {isLoading
                ? '…'
                : `${roleCounts.evaluator} evaluators · ${roleCounts.admin} admins`}
            </p>
          </Card>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-2xl font-bold text-primary mb-4">System Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-semibold">Supabase Database</span>
                <span className={error ? 'text-red-600' : 'text-green-600'}>
                  {error ? 'Error' : 'Connected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">AI Analysis Function</span>
                <span className="text-green-600">Configured</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Total Evaluations</span>
                <span className="font-semibold text-primary">{totalEvaluations}</span>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold text-primary mb-4">Recent Activity</h2>
            <div className="space-y-2 text-sm text-text">
              {isLoading && <p>Loading…</p>}
              {!isLoading && recent.length === 0 && <p>No evaluation activity yet.</p>}
              {!isLoading &&
                recent.map((row) => {
                  const who = row.evaluator?.full_name || row.evaluator?.email || 'Unknown evaluator';
                  const statusLabel = row.status === 'completed' ? 'Completed' : 'In Progress';
                  return (
                    <div key={row.id} className="flex justify-between gap-4 border-b border-gray-100 pb-2 last:border-0">
                      <span className="truncate">
                        <span className="font-semibold text-primary">{who}</span> — {statusLabel}
                      </span>
                      <span className="whitespace-nowrap text-xs">{formatDateTime(row.updated_at)}</span>
                    </div>
                  );
                })}
            </div>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <h2 className="text-2xl font-bold text-primary mb-4">User Management</h2>
            <p className="text-sm text-text mb-4">
              Update a user's role to change their access. Only admins can reach this page.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-200">
                    <th className="pb-2 pr-4 font-semibold text-primary">Name</th>
                    <th className="pb-2 pr-4 font-semibold text-primary">Email</th>
                    <th className="pb-2 pr-4 font-semibold text-primary">Joined</th>
                    <th className="pb-2 font-semibold text-primary">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr>
                      <td colSpan={4} className="py-4 text-text">Loading…</td>
                    </tr>
                  )}
                  {!isLoading && users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 text-text">No users found.</td>
                    </tr>
                  )}
                  {!isLoading &&
                    users.map((u) => (
                      <tr key={u.id} className="border-b border-gray-100 last:border-0">
                        <td className="py-3 pr-4 text-primary font-medium">
                          {u.full_name || '—'}
                          {u.id === user?.id && (
                            <span className="ml-2 text-xs text-text">(you)</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-text">{u.email}</td>
                        <td className="py-3 pr-4 text-text">{formatDate(u.created_at)}</td>
                        <td className="py-3">
                          <select
                            value={u.role}
                            disabled={pendingRoleChange === u.id}
                            onChange={(e) => void handleRoleChange(u.id, e.target.value as Role)}
                            className="px-3 py-1.5 border border-gray-300 rounded-md text-primary font-semibold focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                          >
                            {ROLE_OPTIONS.map((role) => (
                              <option key={role} value={role}>
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};
