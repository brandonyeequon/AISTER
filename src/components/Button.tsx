// Reusable button component with two visual variants.

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual style of the button.
   * - "primary": filled green background, white text (default)
   * - "secondary": white background, green border and text
   */
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

/** General-purpose button. Spreads all native button attributes for flexibility. */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'font-bold py-3 px-4 rounded-md transition-colors duration-300 w-full';

  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark shadow-lg',
    secondary: 'bg-white text-primary border-2 border-primary hover:bg-gray-50',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
