'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import {
  LoadingState,
  EmptyState,
  ProgressBar,
  PulsingDot,
} from '@/components/ui/Loading';
import apiService from '@/services/api';
import { formatRelativeTime, formatDuration, cn } from '@/lib/utils';
import {
  HealthCheckResponse,
  ScheduledHealthCheckRequest,
  HealthCheck,
} from '@/types/api';
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Play,
  Pause,
  Settings,
  Bell,
  Mail,
  Webhook,
  Calendar,
  Zap,
  TrendingUp,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';

const scheduleHealthCheckSchema = z.object({
  schedule: z.string().min(1, 'Schedule is required'),
  checkType: z.enum(['basic', 'comprehensive', 'connectivity']).default('basic'),
  notificationSettings: z.object({
    notifyOnFailure: z.boolean().default(true),
    notifyOnRecovery: z.boolean().default(true),
    emailRecipients: z.array(z.string().email()).default([]),
    webhookUrl: z.string().url().optional().or(z.literal('')),
  }).default({}),
});

interface HealthCheckMonitorProps {
  environmentId: string;
}

const HealthCheckMonitor: React.FC<HealthCheckMonitorProps> = ({
  environmentId,
}) => {
  const [selectedCheckType, setSelectedCheckType] = useState<'basic' | 'comprehensive' | 'connectivity'>('basic');
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const queryClient = useQueryClient();

  // Fetch health check results
  const {
    data: healthCheck,
    isLoading: healthLoading,
    error: healthError,
    refetch: refetchHealth,
  } = useQuery({
    queryKey: ['health-check', environmentId, selectedCheckType],
    queryFn: () => apiService.performHealthCheck(environmentId, selectedCheckType),
    refetchInterval: 60000, // Refetch every minute
  });

  // Perform health check mutation
  const performHealthCheckMutation = useMutation({
    mutationFn: (checkType: 'basic' | 'comprehensive' | 'connectivity') =>
      apiService.performHealthCheck(environmentId, checkType),
    onSuccess: () => {
      toast.success('Health check completed successfully');
      queryClient.invalidateQueries({ queryKey: ['health-check', environmentId] });
    },
    onError: (error) => {
      toast.error(`Health check failed: ${error.message}`);
    },
  });

  // Schedule health checks mutation
  const scheduleHealthChecksMutation = useMutation({
    mutationFn: (data: ScheduledHealthCheckRequest) => apiService.scheduleHealthChecks(data),
    onSuccess: () => {
      toast.success('Health check schedule configured successfully');
      setShowScheduleForm(false);
    },
    onError: (error) => {
      toast.error(`Failed to schedule health checks: ${error.message}`);
    },
  });

  // Form handling
  const form = useForm<ScheduledHealthCheckRequest>({
    resolver: zodResolver(scheduleHealthCheckSchema),
    defaultValues: {
      environmentId,
      schedule: '0 */6 * * *', // Every 6 hours
      checkType: 'basic',
      notificationSettings: {
        notifyOnFailure: true,
        notifyOnRecovery: true,
        emailRecipients: [],
        webhookUrl: '',
      },
    },
  });

  const onSubmit = (data: ScheduledHealthCheckRequest) => {
    scheduleHealthChecksMutation.mutate(data);
  };

  const handleRunHealthCheck = (checkType: 'basic' | 'comprehensive' | 'connectivity') => {
    setSelectedCheckType(checkType);
    performHealthCheckMutation.mutate(checkType);
  };

  const getCheckStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle className="h-4 w-4 text-success-500" />;
      case 'WARN':
        return <AlertTriangle className="h-4 w-4 text-warning-500" />;
      case 'FAIL':
        return <XCircle className="h-4 w-4 text-error-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return 'text-success-600 bg-success-50 border-success-200';
      case 'DEGRADED':
        return 'text-warning-600 bg-warning-50 border-warning-200';
      case 'UNHEALTHY':
        return 'text-error-600 bg-error-50 border-error-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const checkTypes = [
    {
      type: 'basic' as const,
      name: 'Basic',
      description: 'Quick connectivity and service availability checks',
      icon: <Zap className="h-4 w-4" />,
    },
    {
      type: 'comprehensive' as const,
      name: 'Comprehensive',
      description: 'Full system health including performance metrics',
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      type: 'connectivity' as const,
      name: 'Connectivity',
      description: 'Network connectivity and external service checks',
      icon: <Shield className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Health Monitoring</h2>
          <p className="text-muted-foreground">
            Monitor environment health and configure automated checks
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowScheduleForm(true)}>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Checks
          </Button>
          <Button onClick={() => refetchHealth()}>
            <Activity className="h-4 w-4 mr-2" />
            Run Check
          </Button>
        </div>
      </div>

      {/* Health Check Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Health Check Types</span>
          </CardTitle>
          <CardDescription>
            Choose the type of health check to perform on your environment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {checkTypes.map((checkType) => (
              <div
                key={checkType.type}
                className={cn(
                  'p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md',
                  selectedCheckType === checkType.type
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                )}
                onClick={() => setSelectedCheckType(checkType.type)}
              >
                <div className="flex items-center space-x-3 mb-2">
                  {checkType.icon}
                  <h3 className="font-medium">{checkType.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {checkType.description}
                </p>
                <Button
                  size="sm"
                  className="w-full"
                  variant={selectedCheckType === checkType.type ? 'default' : 'outline'}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRunHealthCheck(checkType.type);
                  }}
                  loading={performHealthCheckMutation.isPending && selectedCheckType === checkType.type}
                >
                  <Play className="h-3 w-3 mr-2" />
                  Run {checkType.name} Check
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Health Check Results */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Latest Health Check Results</span>
              </CardTitle>
              <CardDescription>
                Results from the most recent health check
              </CardDescription>
            </div>
            {healthCheck && (
              <div className="text-right">
                <div className={cn('px-3 py-1 rounded-full text-sm font-medium border', getOverallStatusColor(healthCheck.overallStatus))}>
                  {healthCheck.overallStatus}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Checked {formatRelativeTime(healthCheck.checkedAt)}
                </p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {healthLoading ? (
            <LoadingState message="Running health check..." />
          ) : healthError ? (
            <EmptyState
              title="Health check failed"
              description="There was an error running the health check. Please try again."
              icon={<XCircle className="h-12 w-12" />}
              action={
                <Button onClick={() => refetchHealth()} variant="outline">
                  <Activity className="h-4 w-4 mr-2" />
                  Retry Check
                </Button>
              }
            />
          ) : healthCheck ? (
            <div className="space-y-6">
              {/* Individual Checks */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Individual Checks</h3>
                {healthCheck.checks.map((check, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      {getCheckStatusIcon(check.status)}
                      <div>
                        <h4 className="font-medium">{check.checkName}</h4>
                        <p className="text-sm text-muted-foreground">{check.message}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={check.status === 'PASS' ? 'success' : check.status === 'WARN' ? 'warning' : 'error'}
                        className="mb-1"
                      >
                        {check.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {check.responseTime}ms
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommendations */}
              {healthCheck.recommendations.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Recommendations</h3>
                  <div className="space-y-2">
                    {healthCheck.recommendations.map((recommendation, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-3 bg-warning-50 border border-warning-200 rounded-lg"
                      >
                        <AlertTriangle className="h-4 w-4 text-warning-600 mt-0.5" />
                        <p className="text-sm text-warning-800">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              title="No health check results"
              description="Run a health check to see the status of your environment."
              icon={<Activity className="h-12 w-12" />}
              action={
                <Button onClick={() => handleRunHealthCheck('basic')}>
                  <Play className="h-4 w-4 mr-2" />
                  Run Basic Health Check
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>

      {/* Schedule Health Checks Form */}
      {showScheduleForm && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule Automated Health Checks</CardTitle>
            <CardDescription>
              Configure automated health checks to monitor your environment continuously
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Schedule */}
              <div>
                <label className="label">Schedule (Cron Expression)</label>
                <input
                  className="input"
                  placeholder="0 */6 * * * (every 6 hours)"
                  {...form.register('schedule')}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use cron syntax. Examples: "0 */6 * * *" (every 6 hours), "0 0 * * *" (daily)
                </p>
                {form.formState.errors.schedule && (
                  <p className="text-sm text-error-500 mt-1">
                    {form.formState.errors.schedule.message}
                  </p>
                )}
              </div>

              {/* Check Type */}
              <div>
                <label className="label">Check Type</label>
                <select
                  className="input"
                  {...form.register('checkType')}
                >
                  <option value="basic">Basic</option>
                  <option value="comprehensive">Comprehensive</option>
                  <option value="connectivity">Connectivity</option>
                </select>
              </div>

              {/* Notification Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Settings</h3>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="notifyOnFailure"
                    {...form.register('notificationSettings.notifyOnFailure')}
                  />
                  <label htmlFor="notifyOnFailure" className="label">
                    Notify on health check failures
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="notifyOnRecovery"
                    {...form.register('notificationSettings.notifyOnRecovery')}
                  />
                  <label htmlFor="notifyOnRecovery" className="label">
                    Notify when environment recovers
                  </label>
                </div>
                
                <div>
                  <label className="label">Email Recipients (comma-separated)</label>
                  <input
                    className="input"
                    placeholder="admin@company.com, dev-team@company.com"
                    onChange={(e) => {
                      const emails = e.target.value.split(',').map(email => email.trim()).filter(Boolean);
                      form.setValue('notificationSettings.emailRecipients', emails);
                    }}
                  />
                </div>
                
                <div>
                  <label className="label">Webhook URL (Optional)</label>
                  <input
                    className="input"
                    placeholder="https://hooks.slack.com/services/..."
                    {...form.register('notificationSettings.webhookUrl')}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowScheduleForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={scheduleHealthChecksMutation.isPending}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Health Checks
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HealthCheckMonitor;
