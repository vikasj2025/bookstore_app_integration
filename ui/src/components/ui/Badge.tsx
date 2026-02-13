import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success: 'border-transparent bg-success-500 text-white hover:bg-success-600',
        warning: 'border-transparent bg-warning-500 text-white hover:bg-warning-600',
        error: 'border-transparent bg-error-500 text-white hover:bg-error-600',
        healthy: 'status-healthy',
        degraded: 'status-degraded',
        unhealthy: 'status-unhealthy',
        unknown: 'status-unknown',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

function Badge({ className, variant, icon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {icon && (
        <span className="mr-1" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };

// Status-specific badge components
export const StatusBadge: React.FC<{
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'UNKNOWN' | 'ACTIVE' | 'INACTIVE' | 'ERROR' | 'CONFIGURING';
  children?: React.ReactNode;
  className?: string;
}> = ({ status, children, className }) => {
  const getVariant = () => {
    switch (status) {
      case 'HEALTHY':
      case 'ACTIVE':
        return 'healthy';
      case 'DEGRADED':
      case 'CONFIGURING':
        return 'degraded';
      case 'UNHEALTHY':
      case 'ERROR':
      case 'INACTIVE':
        return 'unhealthy';
      case 'UNKNOWN':
      default:
        return 'unknown';
    }
  };

  return (
    <Badge variant={getVariant()} className={className}>
      {children || status}
    </Badge>
  );
};

export const ProgressBadge: React.FC<{
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'INITIATED';
  children?: React.ReactNode;
  className?: string;
}> = ({ status, children, className }) => {
  const getVariant = () => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'IN_PROGRESS':
      case 'INITIATED':
        return 'warning';
      case 'FAILED':
        return 'error';
      case 'PENDING':
      default:
        return 'secondary';
    }
  };

  return (
    <Badge variant={getVariant()} className={className}>
      {children || status}
    </Badge>
  );
};

export const ToolTypeBadge: React.FC<{
  toolType: 'maven' | 'gradle' | 'npm' | 'docker' | 'nodejs' | 'java';
  className?: string;
}> = ({ toolType, className }) => {
  const getColor = () => {
    switch (toolType) {
      case 'maven':
        return 'bg-orange-500 text-white';
      case 'gradle':
        return 'bg-green-500 text-white';
      case 'npm':
        return 'bg-red-500 text-white';
      case 'docker':
        return 'bg-blue-500 text-white';
      case 'nodejs':
        return 'bg-green-600 text-white';
      case 'java':
        return 'bg-orange-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <Badge className={cn(getColor(), className)}>
      {toolType.toUpperCase()}
    </Badge>
  );
};
