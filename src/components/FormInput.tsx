// Labeled form input with optional error message display.
// Used on the Login page with React Hook Form's register() spread pattern.

import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label text displayed above the input. */
  label: string;
  /** Validation error message shown below the input in red. */
  error?: string;
}

/** Labeled input field with error state styling. Forwards all native input attributes and refs. */
export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="form-group">
        <label className="form-label">{label}</label>
        {/* form-input-error adds a red border when an error is present */}
        <input
          ref={ref}
          className={`form-input ${error ? 'form-input-error' : ''} ${className}`}
          {...props}
        />
        {error && <span className="form-error">{error}</span>}
      </div>
    );
  }
);
FormInput.displayName = 'FormInput';
