import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="w-full flex flex-col space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`bg-dark-850 border ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-dark-border focus:border-primary-500 focus:ring-primary-500/50'
        } text-white rounded-lg px-4 py-2.5 outline-none transition-all focus:ring-2 w-full ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-400 mt-1">{error}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
