// Reusable white card container used across all pages for content sections.

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Internal padding size.
   * - "sm": p-4 (16px)
   * - "md": p-6 (24px) — default
   * - "lg": p-10 (40px)
   */
  padding?: 'sm' | 'md' | 'lg';
}

/** White rounded card container. Uses the "card-base" CSS class from globals.css for shadow/border. */
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
    <div className={`card-base ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
};
