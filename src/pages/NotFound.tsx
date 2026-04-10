// 404 page — rendered for any route that doesn't match a defined path.
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg">
      <h1 className="text-6xl font-black text-primary mb-4">404</h1>
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Page Not Found</h2>
      <p className="text-text mb-8">Sorry, the page you're looking for doesn't exist.</p>
      
      <div className="w-48">
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    </div>
  );
};
