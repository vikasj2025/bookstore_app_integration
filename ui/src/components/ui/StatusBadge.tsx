import React from 'react';
import { clsx } from 'clsx';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  XCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

type StatusType = 
  | 'success' 
  | 'error' 
  | 'warning' 
  | 'info' 
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'initiated'
  | 'in_progress';

interface StatusBadgeProps {
  status: StatusType;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const statusConfig = {
  success: {
    colors: 'bg-success-100 text-success-800 border-success-200',
    icon: CheckCircleIcon,
    defaultText: 'Success',
  },
  completed: {
    colors: 'bg-success-100 text-success-800 border-success-200',
    icon: CheckCircleIcon,
    defaultText: 'Completed',
  },
  error: {
    colors: 'bg-error-100 text-error-800 border-error-200',
    icon: XCircleIcon,
    defaultText: 'Error',
  },
  failed: {
    colors: 'bg-error-100 text-error-800 border-error-200',
    icon: XCircleIcon,
    defaultText: 'Failed',
  },
  warning: {
    colors: 'bg-warning-100 text-warning-800 border-warning-200',
    icon: ExclamationCircleIcon,
    defaultText: 'Warning',
  },
  info: {
    colors: 'bg-primary-100 text-primary-800 border-primary-200',
    icon: InformationCircleIcon,
    defaultText: 'Info',
  },
  pending: {
    colors: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: ClockIcon,
    defaultText: 'Pending',
  },
  running: {
    colors: 'bg-primary-100 text-primary-800 border-primary-200',
    icon: ClockIcon,
    defaultText: 'Running',
  },
  initiated: {
    colors: 'bg-primary-100 text-primary-800 border-primary-200',
    icon: ClockIcon,
    defaultText: 'Initiated',
  },
  in_progress: {
    colors: 'bg-primary-100 text-primary-800 border-primary-200',
    icon: ClockIcon,
    defaultText: 'In Progress',
  },
};

const sizeConfig = {
  sm: {
    container: 'px-2 py-0.5 text-xs',
    icon: 'h-3 w-3',
    gap: 'gap-1',
  },
  md: {
    container: 'px-2.5 py-1 text-sm',
    icon: 'h-4 w-4',
    gap: 'gap-1.5',
  },
  lg: {
    container: 'px-3 py-1.5 text-base',
    icon: 'h-5 w-5',
    gap: 'gap-2',
  },
};

export function StatusBadge({
  status,
  text,
  size = 'md',
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeStyles = sizeConfig[size];
  
  if (!config) {
    console.warn(`Unknown status: ${status}`);
    return null;
  }

  const Icon = config.icon;
  const displayText = text || config.defaultText;

  return (
    <span
      className={clsx(
        'inline-flex items-center',
        'font-medium rounded-full border',
        'transition-colors duration-200',
        config.colors,
        sizeStyles.container,
        showIcon && sizeStyles.gap,
        className
      )}
    >
      {showIcon && (
        <Icon
          className={clsx(
            sizeStyles.icon,
            status === 'running' || status === 'in_progress' ? 'animate-pulse' : ''
          )}
          aria-hidden="true"
        />
      )}
      {displayText}
    </span>
  );
}

// Utility function to get status color for other components
export function getStatusColor(status: StatusType): string {
  const config = statusConfig[status];
  return config ? config.colors : statusConfig.info.colors;
}

// Utility function to determine status type from string
export function normalizeStatus(status: string): StatusType {
  const normalized = status.toLowerCase().replace(/[\s_-]/g, '_');
  
  if (normalized in statusConfig) {
    return normalized as StatusType;
  }
  
  // Map common variations
  const mappings: Record<string, StatusType> = {
    'ok': 'success',
    'done': 'completed',
    'finished': 'completed',
    'fail': 'failed',
    'failure': 'failed',
    'err': 'error',
    'warn': 'warning',
    'wait': 'pending',
    'waiting': 'pending',
    'processing': 'in_progress',
    'active': 'running',
    'started': 'initiated',
  };
  
  return mappings[normalized] || 'info';
}

export type { StatusType };
