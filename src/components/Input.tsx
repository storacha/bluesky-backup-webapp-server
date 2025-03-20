"use client";

import { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'outline' | 'filled';
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  label?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  className = '',
  variant = 'default',
  error,
  leftIcon,
  rightIcon,
  label,
  helperText,
  disabled,
  id,
  ...props
}, ref) => {
  const baseStyles = 'w-full px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none';
  
  const variants = {
    default: 'border border-gray-300 focus:border-[var(--color-bluesky-blue)] focus:ring-2 focus:ring-[var(--color-bluesky-blue)]/20',
    outline: 'border-2 border-[var(--color-bluesky-blue)] focus:ring-2 focus:ring-[var(--color-bluesky-blue)]/20',
    filled: 'bg-gray-100 border border-transparent focus:bg-white focus:border-[var(--color-bluesky-blue)]'
  };

  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const classes = [
    baseStyles,
    variants[variant],
    error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : '',
    className
  ].join(' ');

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label 
          htmlFor={inputId}
          className="text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            ${classes}
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
          `}
          disabled={disabled}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            {rightIcon}
          </span>
        )}
      </div>
      {(error || helperText) && (
        <p className={`text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
