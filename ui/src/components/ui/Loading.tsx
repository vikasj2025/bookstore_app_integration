import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <Loader2 
      className={cn('animate-spin', sizeClasses[size], className)} 
      aria-label="Loading"
    />
  );
};

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
  height?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  className, 
  lines = 1, 
  height = 'h-4' 
}) => {
  return (
    <div className={cn('space-y-2', className)} role="status" aria-label="Loading content">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'loading-skeleton',
            height,
            index === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
};

interface LoadingCardProps {
  className?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({ className }) => {
  return (
    <div className={cn('card p-6', className)} role="status" aria-label="Loading card">
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="loading-skeleton h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="loading-skeleton h-4 w-3/4" />
            <div className="loading-skeleton h-3 w-1/2" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="loading-skeleton h-3 w-full" />
          <div className="loading-skeleton h-3 w-5/6" />
          <div className="loading-skeleton h-3 w-4/6" />
        </div>
      </div>
    </div>
  );
};

interface LoadingTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const LoadingTable: React.FC<LoadingTableProps> = ({ 
  rows = 5, 
  columns = 4, 
  className 
}) => {
  return (
    <div className={cn('space-y-4', className)} role="status" aria-label="Loading table">
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="loading-skeleton h-4 flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="loading-skeleton h-6 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading...', 
  className,
  size = 'md'
}) => {
  return (
    <div 
      className={cn('flex flex-col items-center justify-center p-8 text-center', className)}
      role="status"
      aria-label={message}
    >
      <LoadingSpinner size={size} className="mb-4" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
};

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showPercentage?: boolean;
  label?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  className,
  showPercentage = true,
  label,
  variant = 'default',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const variantClasses = {
    default: 'bg-primary',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
  };

  return (
    <div className={cn('space-y-2', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between text-sm">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showPercentage && <span className="font-medium">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
        <div
          className={cn('h-full transition-all duration-300 ease-in-out', variantClasses[variant])}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
};

interface PulsingDotProps {
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export const PulsingDot: React.FC<PulsingDotProps> = ({ 
  className,
  variant = 'default' 
}) => {
  const variantClasses = {
    default: 'bg-primary',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
  };

  return (
    <div className={cn('relative', className)}>
      <div className={cn('h-3 w-3 rounded-full', variantClasses[variant])} />
      <div 
        className={cn(
          'absolute inset-0 h-3 w-3 rounded-full animate-ping',
          variantClasses[variant],
          'opacity-75'
        )} 
      />
    </div>
  );
};

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      {icon && (
        <div className="mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4 max-w-md">{description}</p>
      )}
      {action && action}
    </div>
  );
};
