import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full';
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    secondary: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-700 dark:text-secondary-300',
    destructive: 'bg-error-100 text-error-800 dark:bg-error-700 dark:text-error-300',
    success: 'bg-success-100 text-success-800 dark:bg-success-700 dark:text-success-300',
    warning: 'bg-warning-100 text-warning-800 dark:bg-warning-700 dark:text-warning-300',
    info: 'bg-primary-100 text-primary-800 dark:bg-primary-700 dark:text-primary-300',
  };
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  };

  return (
    <span
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
