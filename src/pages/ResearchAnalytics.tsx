import React, { useState } from 'react';
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

// Mock data for evaluations over time
const evaluationTrendData = [
  { week: 'Week 1', evaluations: 4, completed: 3 },
  { week: 'Week 2', evaluations: 7, completed: 6 },
  { week: 'Week 3', evaluations: 5, completed: 5 },
  { week: 'Week 4', evaluations: 9, completed: 8 },
  { week: 'Week 5', evaluations: 6, completed: 6 },
  { week: 'Week 6', evaluations: 8, completed: 7 },
];

// Mock data for performance distribution
const performanceDistributionData = [
  { score: '0-2', count: 1 },
  { score: '2-4', count: 3 },
  { score: '4-6', count: 8 },
  { score: '6-8', count: 15 },
  { score: '8-10', count: 12 },
];

// Mock data for evaluator comparison
const evaluatorComparisonData = [
  { name: 'You', value: 87 },
  { name: 'Team Avg', value: 82 },
  { name: 'Top Performer', value: 94 },
];

// Mock data for evaluation duration
const durationPatternData = [
  { time: 'Mon', duration: 18 },
  { time: 'Tue', duration: 22 },
  { time: 'Wed', duration: 20 },
  { time: 'Thu', duration: 25 },
  { time: 'Fri', duration: 19 },
  { time: 'Sat', duration: 15 },
  { time: 'Sun', duration: 17 },
];

export const ResearchAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('30days');

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <Navbar />

      <main className="flex-1 px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-black text-primary">Research Analytics</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setDateRange('7days')}
              className={`px-4 py-2 rounded-md font-semibold transition ${
                dateRange === '7days'
                  ? 'bg-primary text-white'
                  : 'bg-white text-primary border border-primary'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setDateRange('30days')}
              className={`px-4 py-2 rounded-md font-semibold transition ${
                dateRange === '30days'
                  ? 'bg-primary text-white'
                  : 'bg-white text-primary border border-primary'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setDateRange('90days')}
              className={`px-4 py-2 rounded-md font-semibold transition ${
                dateRange === '90days'
                  ? 'bg-primary text-white'
                  : 'bg-white text-primary border border-primary'
              }`}
            >
              90 Days
            </button>
          </div>
        </div>

        {/* KPI Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-text mb-2">Total Evaluations</p>
                <p className="text-4xl font-black text-primary">52</p>
              </div>
              <TrendingUp size={24} className="text-primary opacity-50" />
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-text mb-2">Completed</p>
                <p className="text-4xl font-black text-primary">48</p>
                <p className="text-xs text-text mt-1">92% completion rate</p>
              </div>
              <CheckCircle2 size={24} className="text-primary opacity-50" />
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-text mb-2">Pending</p>
                <p className="text-4xl font-black text-primary">4</p>
              </div>
              <BarChart3 size={24} className="text-primary opacity-50" />
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-text mb-2">Avg Duration</p>
                <p className="text-4xl font-black text-primary">20m</p>
                <p className="text-xs text-text mt-1">per evaluation</p>
              </div>
              <Clock size={24} className="text-primary opacity-50" />
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Evaluation Trends */}
          <Card>
            <h2 className="text-2xl font-bold text-primary mb-6">Evaluations Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evaluationTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="week" stroke="#8f949c" />
                <YAxis stroke="#8f949c" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                  }}
                />
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

          {/* Performance Distribution */}
          <Card>
            <h2 className="text-2xl font-bold text-primary mb-6">Score Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceDistributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="score" stroke="#8f949c" />
                <YAxis stroke="#8f949c" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="#1c6b3d" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Evaluator Comparison & Duration Pattern */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Evaluator Comparison */}
          <Card>
            <h2 className="text-2xl font-bold text-primary mb-6">Your Performance vs Team</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={evaluatorComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" stroke="#8f949c" />
                <YAxis stroke="#8f949c" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" fill="#1c6b3d" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Duration Pattern */}
          <Card>
            <h2 className="text-2xl font-bold text-primary mb-6">Evaluation Duration (Minutes)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={durationPatternData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="time" stroke="#8f949c" />
                <YAxis stroke="#8f949c" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                  }}
                />
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
        </div>
      </main>
    </div>
  );
};
