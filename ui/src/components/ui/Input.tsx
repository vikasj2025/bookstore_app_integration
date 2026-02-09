/**
 * Reusable Input Component
 * Provides consistent input styling and behavior across the application
 */

import React from 'react';
import { clsx } from 'clsx';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      type = 'text',
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const inputId = id || React.useId();
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const baseClasses = [
      'block',
      'w-full',
      'rounded-lg',
      'border',
      'px-3',
      'py-2',
      'text-sm',
      'transition-colors',
      'duration-200',
      'placeholder:text-secondary-400',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-1',
      'disabled:bg-secondary-50',
      'disabled:text-secondary-500',
      'disabled:cursor-not-allowed',
    ];

    const stateClasses = error
      ? [
          'border-error-300',
          'text-error-900',
          'focus:border-error-500',
          'focus:ring-error-500',
        ]
      : [
          'border-secondary-300',
          'text-secondary-900',
          'focus:border-primary-500',
          'focus:ring-primary-500',
        ];

    const iconClasses = leftIcon || rightIcon || isPassword ? 'pr-10' : '';
    const leftIconClasses = leftIcon ? 'pl-10' : '';

    const containerClasses = fullWidth ? 'w-full' : '';

    return (
      <div className={containerClasses}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-medium text-secondary-700"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-secondary-400">{leftIcon}</span>
            </div>
          )}
          
          <input
            ref={ref}
            type={inputType}
            id={inputId}
            className={clsx(
              baseClasses,
              stateClasses,
              iconClasses,
              leftIconClasses,
              className
            )}
            {...props}
          />
          
          {(rightIcon || isPassword) && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {isPassword ? (
                <button
                  type="button"
                  className="text-secondary-400 hover:text-secondary-600 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOffIcon size={16} />
                  ) : (
                    <EyeIcon size={16} />
                  )}
                </button>
              ) : (
                <span className="text-secondary-400 pointer-events-none">
                  {rightIcon}
                </span>
              )}
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <div className="mt-1">
            {error && (
              <p className="text-sm text-error-600" role="alert">
                {error}
              </p>
            )}
            {!error && helperText && (
              <p className="text-sm text-secondary-500">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export default Input;
