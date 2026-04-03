// Teacher dashboard showing quick stats and recent evaluations.
// All data is currently hardcoded mock values — wire to mockApi.getEvaluations() when ready.

import React from 'react';
import { Navbar } from '../components/Navbar';
import { Card } from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, CheckCircle } from 'lucide-react';

/** Teacher home screen with stats overview and a recent evaluations list. */
export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // TODO: Replace with real data from mockApi.getEvaluations() once hooked up
  const recentEvaluations = [
    { id: 1, student: 'Emma Rodriguez', date: '2024-03-24', score: 88, status: 'completed' },
    { id: 2, student: 'Marcus Johnson', date: '2024-03-23', score: 92, status: 'completed' },
    { id: 3, student: 'Sarah Chen', date: '2024-03-22', score: 85, status: 'completed' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <Navbar />

      <main className="flex-1 px-8 py-8">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-5xl font-black text-primary mb-2">Welcome back, {user?.name || 'Evaluator'}</h1>
          <p className="text-lg text-text mb-8">Track your evaluations and view detailed analytics</p>

          <button className="bg-primary text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-primary-dark transition flex items-center gap-2 shadow-md hover:shadow-lg">
            <span>Start New Evaluation</span>
            <ArrowRight size={20} />
          </button>
        </div>

        {/* Quick Stats — hardcoded until real data is connected */}
        <h2 className="text-2xl font-bold text-primary mb-6">Your Quick Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-text mb-2">Total Evaluations</p>
                <p className="text-4xl font-black text-primary">52</p>
              </div>
              <CheckCircle size={28} className="text-primary opacity-40" />
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-text mb-2">Pending Reviews</p>
                <p className="text-4xl font-black text-primary">4</p>
                <p className="text-xs text-text mt-1">Due this week</p>
              </div>
              <CheckCircle size={28} className="text-primary opacity-40" />
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-text mb-2">Average Score</p>
                <p className="text-4xl font-black text-primary">87%</p>
                <p className="text-xs text-primary-light mt-1">+2% from last month</p>
              </div>
              <CheckCircle size={28} className="text-primary opacity-40" />
            </div>
          </Card>
        </div>

        {/* Recent Evaluations list */}
        <div>
          <h2 className="text-2xl font-bold text-primary mb-6">Recent Evaluations</h2>
          <Card>
            <div className="space-y-4">
              {recentEvaluations.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-4 bg-white rounded-lg hover:bg-gray-50 transition cursor-pointer border border-gray-100"
                >
                  <div>
                    <p className="font-semibold text-primary">{item.student}</p>
                    <p className="text-sm text-text">{item.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{item.score}%</p>
                    <p className="text-xs text-primary-light capitalize">{item.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};
