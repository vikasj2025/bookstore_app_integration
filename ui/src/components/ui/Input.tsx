import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helpText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);

    const baseClasses = [
      'block w-full rounded-lg border',
      'bg-white',
      'text-gray-900 placeholder-gray-500',
      'transition-colors duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50',
    ];

    const stateClasses = hasError
      ? [
          'border-error-300 focus:border-error-500 focus:ring-error-500',
          'pr-10', // Space for error icon
        ]
      : [
          'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
        ];

    const sizeClasses = ['px-3 py-2 text-sm'];

    const paddingClasses = [
      leftIcon ? 'pl-10' : '',
      rightIcon && !hasError ? 'pr-10' : '',
    ].filter(Boolean);

    const widthClasses = fullWidth ? ['w-full'] : [];

    return (
      <div className={clsx(widthClasses)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-sm">{leftIcon}</span>
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              baseClasses,
              stateClasses,
              sizeClasses,
              paddingClasses,
              className
            )}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined
            }
            {...props}
          />
          
          {hasError && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ExclamationCircleIcon
                className="h-5 w-5 text-error-500"
                aria-hidden="true"
              />
            </div>
          )}
          
          {rightIcon && !hasError && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-sm">{rightIcon}</span>
            </div>
          )}
        </div>
        
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1 text-sm text-error-600"
            role="alert"
          >
            {error}
          </p>
        )}
        
        {helpText && !error && (
          <p
            id={`${inputId}-help`}
            className="mt-1 text-sm text-gray-500"
          >
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };
