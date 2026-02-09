/**
 * Reusable Button Component
 * Provides consistent button styling and behavior across the application
 */

import React from 'react';
import { clsx } from 'clsx';
import { LoaderIcon } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
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
      'inline-flex',
      'items-center',
      'justify-center',
      'rounded-lg',
      'font-medium',
      'transition-all',
      'duration-200',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'disabled:pointer-events-none',
    ];

    const variantClasses = {
      primary: [
        'bg-primary-600',
        'text-white',
        'hover:bg-primary-700',
        'focus:ring-primary-500',
        'shadow-sm',
      ],
      secondary: [
        'bg-secondary-100',
        'text-secondary-900',
        'hover:bg-secondary-200',
        'focus:ring-secondary-500',
        'border',
        'border-secondary-300',
      ],
      outline: [
        'bg-transparent',
        'text-primary-600',
        'border',
        'border-primary-600',
        'hover:bg-primary-50',
        'focus:ring-primary-500',
      ],
      ghost: [
        'bg-transparent',
        'text-secondary-700',
        'hover:bg-secondary-100',
        'focus:ring-secondary-500',
      ],
      danger: [
        'bg-error-600',
        'text-white',
        'hover:bg-error-700',
        'focus:ring-error-500',
        'shadow-sm',
      ],
    };

    const sizeClasses = {
      sm: ['px-3', 'py-1.5', 'text-sm', 'gap-1.5'],
      md: ['px-4', 'py-2', 'text-sm', 'gap-2'],
      lg: ['px-6', 'py-3', 'text-base', 'gap-2.5'],
    };

    const widthClasses = fullWidth ? ['w-full'] : [];

    const isDisabled = disabled || loading;

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
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <LoaderIcon className="animate-spin" size={size === 'sm' ? 14 : 16} />
        )}
        {!loading && leftIcon && (
          <span className="flex-shrink-0">{leftIcon}</span>
        )}
        {children && <span>{children}</span>}
        {!loading && rightIcon && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export default Button;
