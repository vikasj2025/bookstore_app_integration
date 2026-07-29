import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary';
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = 'md', variant = 'default', ...props }, ref) => {
    const sizes = {
      xs: 'h-3 w-3 border',
      sm: 'h-4 w-4 border',
      md: 'h-6 w-6 border-2',
      lg: 'h-8 w-8 border-2',
      xl: 'h-12 w-12 border-4',
    };
    
    const variants = {
      default: 'border-gray-300 border-t-gray-600 dark:border-gray-600 dark:border-t-gray-300',
      primary: 'border-primary/20 border-t-primary',
      secondary: 'border-secondary/20 border-t-secondary',
    };
    
    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            'animate-spin rounded-full',
            sizes[size],
            variants[variant],
            className
          )
        )}
        role="status"
        aria-label="Loading"
        {...props}
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

// Loading skeleton component
interface LoadingSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
  width?: string;
  height?: string;
}

const LoadingSkeleton = React.forwardRef<HTMLDivElement, LoadingSkeletonProps>(
  ({ className, lines = 1, width = '100%', height = '1rem', ...props }, ref) => {
    return (
      <div ref={ref} className={twMerge(clsx('space-y-2', className))} {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded bg-muted"
            style={{
              width: index === lines - 1 && lines > 1 ? '75%' : width,
              height,
            }}
          />
        ))}
      </div>
    );
  }
);

LoadingSkeleton.displayName = 'LoadingSkeleton';

// Loading overlay component
interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
  className?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  text = 'Loading...',
  className,
}) => {
  return (
    <div className={twMerge(clsx('relative', className))}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-2">
            <LoadingSpinner size="lg" variant="primary" />
            <p className="text-sm text-muted-foreground">{text}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export { LoadingSpinner, LoadingSkeleton, LoadingOverlay };
export type { LoadingSpinnerProps, LoadingSkeletonProps, LoadingOverlayProps };
