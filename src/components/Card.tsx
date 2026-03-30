import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-10',
  };

  return (
    <div
      className={`card-base ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </div>
  );
};
