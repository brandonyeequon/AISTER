import React from 'react';
import { Navbar } from '../components/Navbar';
import { Card } from '../components/Card';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <Navbar />
      
      <main className="flex-1 px-8 py-8">
        <h1 className="text-4xl font-black text-primary mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <h2 className="text-2xl font-bold text-primary mb-2">Total Evaluations</h2>
            <p className="text-4xl font-black text-primary">12</p>
          </Card>
          
          <Card>
            <h2 className="text-2xl font-bold text-primary mb-2">Pending Reviews</h2>
            <p className="text-4xl font-black text-primary">3</p>
          </Card>
          
          <Card>
            <h2 className="text-2xl font-bold text-primary mb-2">Average Score</h2>
            <p className="text-4xl font-black text-primary">87%</p>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <h2 className="text-2xl font-bold text-primary mb-4">Recent Activity</h2>
            <p className="text-text">Welcome, {user?.name}! Your dashboard content will appear here.</p>
          </Card>
        </div>
      </main>
    </div>
  );
};
