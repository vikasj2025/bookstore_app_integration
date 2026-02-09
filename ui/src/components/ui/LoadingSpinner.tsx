/**
 * Loading Spinner Component
 * Provides consistent loading indicators across the application
 */

import React from 'react';
import { clsx } from 'clsx';
import { LoaderIcon } from 'lucide-react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  centered?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  text,
  centered = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const containerClasses = centered
    ? 'flex flex-col items-center justify-center'
    : 'flex items-center';

  return (
    <div className={clsx(containerClasses, className)}>
      <LoaderIcon
        className={clsx(
          'animate-spin text-primary-600',
          sizeClasses[size]
        )}
      />
      {text && (
        <span
          className={clsx(
            'ml-2 text-secondary-600',
            textSizeClasses[size],
            centered && 'ml-0 mt-2'
          )}
        >
          {text}
        </span>
      )}
    </div>
  );
};

export { LoadingSpinner };
export default LoadingSpinner;

// Full page loading component
export const FullPageLoader: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90">
    <LoadingSpinner size="xl" text={text} centered />
  </div>
);

// Skeleton loading component
export const Skeleton: React.FC<{
  className?: string;
  width?: string;
  height?: string;
}> = ({ className, width, height }) => (
  <div
    className={clsx(
      'animate-pulse bg-secondary-200 rounded',
      className
    )}
    style={{ width, height }}
  />
);

// Card skeleton for book cards
export const BookCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg border border-secondary-200 p-4 animate-pulse">
    <Skeleton className="w-full h-48 mb-4" />
    <Skeleton className="w-3/4 h-4 mb-2" />
    <Skeleton className="w-1/2 h-4 mb-2" />
    <Skeleton className="w-1/4 h-4" />
  </div>
);

// List skeleton for order/cart items
export const ListItemSkeleton: React.FC = () => (
  <div className="flex items-center space-x-4 p-4 animate-pulse">
    <Skeleton className="w-16 h-16 rounded" />
    <div className="flex-1 space-y-2">
      <Skeleton className="w-3/4 h-4" />
      <Skeleton className="w-1/2 h-4" />
    </div>
    <Skeleton className="w-16 h-4" />
  </div>
);
