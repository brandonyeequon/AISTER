// Research analytics page. Pulls aggregate data from Supabase (RLS-scoped) and renders
// KPI cards + Recharts visualizations. The date-range filter reruns the query.

import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Card } from '../components/Card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, BarChart3, Clock, CheckCircle2 } from 'lucide-react';
import { AnalyticsBundle, AnalyticsRange, fetchAnalytics } from '../utils/analytics';

const EMPTY_BUNDLE: AnalyticsBundle = {
  kpis: {
    totalEvaluations: 0,
    completedEvaluations: 0,
    pendingEvaluations: 0,
    avgDurationMinutes: 0,
  },
  trend: [],
  distribution: [],
  duration: [],
};

const TOOLTIP_STYLE = {
  backgroundColor: '#ffffff',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
};

export const ResearchAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = useState<AnalyticsRange>('30days');
  const [bundle, setBundle] = useState<AnalyticsBundle>(EMPTY_BUNDLE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchAnalytics(dateRange)
      .then((result) => {
        if (!cancelled) setBundle(result);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load analytics');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dateRange]);

  const { kpis, trend, distribution, duration } = bundle;
  const completionRate =
    kpis.totalEvaluations === 0
      ? 0
      : Math.round((kpis.completedEvaluations / kpis.totalEvaluations) * 100);

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <Navbar />

      <main className="flex-1 px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-black text-primary">Research Analytics</h1>

          <div className="flex gap-3">
            {(['7days', '30days', '90days'] as AnalyticsRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-md font-semibold transition ${
                  dateRange === range
                    ? 'bg-primary text-white'
                    : 'bg-white text-primary border border-primary'
                }`}
              >
                {range === '7days' ? '7 Days' : range === '30days' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-text mb-2">Total Evaluations</p>
                <p className="text-4xl font-black text-primary">
                  {isLoading ? '…' : kpis.totalEvaluations}
                </p>
              </div>
              <TrendingUp size={24} className="text-primary opacity-50" />
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-text mb-2">Completed</p>
                <p className="text-4xl font-black text-primary">
                  {isLoading ? '…' : kpis.completedEvaluations}
                </p>
                <p className="text-xs text-text mt-1">{completionRate}% completion rate</p>
              </div>
              <CheckCircle2 size={24} className="text-primary opacity-50" />
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-text mb-2">Pending</p>
                <p className="text-4xl font-black text-primary">
                  {isLoading ? '…' : kpis.pendingEvaluations}
                </p>
              </div>
              <BarChart3 size={24} className="text-primary opacity-50" />
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-text mb-2">Avg Duration</p>
                <p className="text-4xl font-black text-primary">
                  {isLoading ? '…' : `${kpis.avgDurationMinutes}m`}
                </p>
                <p className="text-xs text-text mt-1">per completed evaluation</p>
              </div>
              <Clock size={24} className="text-primary opacity-50" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <h2 className="text-2xl font-bold text-primary mb-6">Evaluations Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="week" stroke="#8f949c" />
                <YAxis stroke="#8f949c" allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="evaluations"
                  stroke="#1c6b3d"
                  strokeWidth={2}
                  dot={{ fill: '#1c6b3d', r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#12b981"
                  strokeWidth={2}
                  dot={{ fill: '#12b981', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold text-primary mb-6">Score Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="score" stroke="#8f949c" />
                <YAxis stroke="#8f949c" allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" fill="#1c6b3d" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card>
          <h2 className="text-2xl font-bold text-primary mb-6">Average Duration by Day (Minutes)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={duration}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="time" stroke="#8f949c" />
              <YAxis stroke="#8f949c" allowDecimals={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Line
                type="monotone"
                dataKey="duration"
                stroke="#1c6b3d"
                strokeWidth={3}
                dot={{ fill: '#1c6b3d', r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </main>
    </div>
  );
};
