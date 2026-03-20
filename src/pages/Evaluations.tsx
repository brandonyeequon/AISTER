import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export const Evaluations: React.FC = () => {
  const [evaluations] = useState([
    {
      id: '1',
      studentName: 'John Doe',
      criteria: 'Participation',
      score: 85,
      date: '2024-03-15',
    },
    {
      id: '2',
      studentName: 'Jane Smith',
      criteria: 'Assignment Quality',
      score: 92,
      date: '2024-03-16',
    },
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <Navbar />
      
      <main className="flex-1 px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-black text-primary">Evaluations</h1>
          <Button className="w-auto px-8">+ New Evaluation</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-primary">
                <th className="text-left py-4 px-4 font-bold text-primary">Student Name</th>
                <th className="text-left py-4 px-4 font-bold text-primary">Criteria</th>
                <th className="text-left py-4 px-4 font-bold text-primary">Score</th>
                <th className="text-left py-4 px-4 font-bold text-primary">Date</th>
                <th className="text-left py-4 px-4 font-bold text-primary">Action</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((evaluation) => (
                <tr key={evaluation.id} className="border-b border-border hover:bg-white transition-colors">
                  <td className="py-4 px-4">{evaluation.studentName}</td>
                  <td className="py-4 px-4">{evaluation.criteria}</td>
                  <td className="py-4 px-4 font-bold text-primary">{evaluation.score}%</td>
                  <td className="py-4 px-4">{evaluation.date}</td>
                  <td className="py-4 px-4">
                    <button className="text-primary hover:text-primary-dark font-bold">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};
