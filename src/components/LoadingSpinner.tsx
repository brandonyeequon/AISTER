import React from 'react';

export const LoadingSpinner: React.FC<{ label?: string }> = ({ label = 'Loading...' }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      <p className="mt-4 text-primary font-bold">{label}</p>
    </div>
  </div>
);
