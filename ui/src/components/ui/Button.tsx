import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      'inline-flex items-center justify-center',
      'font-medium rounded-lg',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'active:scale-95',
    ];

    const variantClasses = {
      primary: [
        'bg-primary-600 hover:bg-primary-700',
        'text-white',
        'focus:ring-primary-500',
        'shadow-sm hover:shadow-md',
      ],
      secondary: [
        'bg-gray-100 hover:bg-gray-200',
        'text-gray-900',
        'focus:ring-gray-500',
        'border border-gray-300',
      ],
      success: [
        'bg-success-600 hover:bg-success-700',
        'text-white',
        'focus:ring-success-500',
        'shadow-sm hover:shadow-md',
      ],
      warning: [
        'bg-warning-600 hover:bg-warning-700',
        'text-white',
        'focus:ring-warning-500',
        'shadow-sm hover:shadow-md',
      ],
      error: [
        'bg-error-600 hover:bg-error-700',
        'text-white',
        'focus:ring-error-500',
        'shadow-sm hover:shadow-md',
      ],
      ghost: [
        'bg-transparent hover:bg-gray-100',
        'text-gray-700 hover:text-gray-900',
        'focus:ring-gray-500',
      ],
    };

    const sizeClasses = {
      sm: ['px-3 py-1.5 text-sm', 'gap-1.5'],
      md: ['px-4 py-2 text-sm', 'gap-2'],
      lg: ['px-6 py-3 text-base', 'gap-2.5'],
    };

    const widthClasses = fullWidth ? ['w-full'] : [];

    const LoadingSpinner = () => (
      <svg
        className="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    return (
      <button
        ref={ref}
        className={clsx(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          widthClasses,
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <LoadingSpinner />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children && <span>{children}</span>}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
