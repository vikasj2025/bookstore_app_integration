'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Badge, StatusBadge, ToolTypeBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  LoadingState,
  LoadingCard,
  EmptyState,
  PulsingDot,
  ProgressBar,
} from '@/components/ui/Loading';
import { useEnvironmentUpdates } from '@/hooks/useWebSocket';
import apiService from '@/services/api';
import { formatRelativeTime, formatDuration, cn } from '@/lib/utils';
import {
  BuildEnvironmentDetails,
  HealthStatus,
  InstalledTool,
} from '@/types/api';
import {
  RefreshCw,
  Settings,
  Trash2,
  Activity,
  Server,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  HelpCircle,
  Plus,
  Eye,
  Download,
} from 'lucide-react';

interface EnvironmentStatusDashboardProps {
  onCreateEnvironment?: () => void;
  onConfigureEnvironment?: (environmentId: string) => void;
  onViewDetails?: (environmentId: string) => void;
}

const EnvironmentStatusDashboard: React.FC<EnvironmentStatusDashboardProps> = ({
  onCreateEnvironment,
  onConfigureEnvironment,
  onViewDetails,
}) => {
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch environments
  const {
    data: environments,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['build-environments'],
    queryFn: () => apiService.listBuildEnvironments(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // WebSocket updates for real-time status
  const { updates } = useEnvironmentUpdates(selectedEnvironmentId || '');

  // Handle real-time updates
  useEffect(() => {
    if (updates.length > 0) {
      const latestUpdate = updates[updates.length - 1];
      if (latestUpdate.type === 'STATUS_UPDATE') {
        // Invalidate and refetch environments to get latest data
        queryClient.invalidateQueries({ queryKey: ['build-environments'] });
      }
    }
  }, [updates, queryClient]);

  const handleDeleteEnvironment = async (environmentId: string) => {
    if (window.confirm('Are you sure you want to delete this environment?')) {
      try {
        await apiService.deleteBuildEnvironment(environmentId);
        queryClient.invalidateQueries({ queryKey: ['build-environments'] });
      } catch (error) {
        console.error('Failed to delete environment:', error);
      }
    }
  };

  const getHealthStatusIcon = (status: HealthStatus['status']) => {
    switch (status) {
      case 'HEALTHY':
        return <CheckCircle className="h-4 w-4 text-success-500" />;
      case 'DEGRADED':
        return <AlertCircle className="h-4 w-4 text-warning-500" />;
      case 'UNHEALTHY':
        return <XCircle className="h-4 w-4 text-error-500" />;
      default:
        return <HelpCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-success-600';
      case 'CONFIGURING':
        return 'text-warning-600';
      case 'ERROR':
      case 'INACTIVE':
        return 'text-error-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Build Environments</h1>
            <p className="text-muted-foreground">
              Monitor and manage your automated build environments
            </p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Build Environments</h1>
            <p className="text-muted-foreground">
              Monitor and manage your automated build environments
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              title="Failed to load environments"
              description="There was an error loading your build environments. Please try again."
              icon={<XCircle className="h-12 w-12" />}
              action={
                <Button onClick={() => refetch()} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!environments || environments.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Build Environments</h1>
            <p className="text-muted-foreground">
              Monitor and manage your automated build environments
            </p>
          </div>
          <Button onClick={onCreateEnvironment}>
            <Plus className="h-4 w-4 mr-2" />
            Create Environment
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              title="No build environments found"
              description="Get started by creating your first automated build environment. It will be configured automatically when you clone a repository."
              icon={<Server className="h-12 w-12" />}
              action={
                <Button onClick={onCreateEnvironment}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Environment
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Build Environments</h1>
          <p className="text-muted-foreground">
            Monitor and manage your automated build environments
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={onCreateEnvironment}>
            <Plus className="h-4 w-4 mr-2" />
            Create Environment
          </Button>
        </div>
      </div>

      {/* Environment Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {environments.map((environment) => (
          <Card
            key={environment.environmentId}
            className={cn(
              'transition-all duration-200 hover:shadow-lg cursor-pointer',
              selectedEnvironmentId === environment.environmentId &&
                'ring-2 ring-primary ring-offset-2'
            )}
            onClick={() => setSelectedEnvironmentId(environment.environmentId)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    {environment.status === 'CONFIGURING' && (
                      <PulsingDot variant="warning" />
                    )}
                    <CardTitle className="text-lg">
                      {environment.environmentName}
                    </CardTitle>
                  </div>
                </div>
                <StatusBadge status={environment.status} />
              </div>
              <CardDescription className="flex items-center space-x-4 text-xs">
                <span className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>Created {formatRelativeTime(environment.createdAt)}</span>
                </span>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Health Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getHealthStatusIcon(environment.healthStatus.status)}
                  <span className="text-sm font-medium">
                    Health: {environment.healthStatus.status}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {environment.healthStatus.uptime > 0 &&
                    `Uptime: ${formatDuration(environment.healthStatus.uptime)}`}
                </span>
              </div>

              {/* Installed Tools */}
              <div>
                <h4 className="text-sm font-medium mb-2">Installed Tools</h4>
                {environment.installedTools.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {environment.installedTools.slice(0, 4).map((tool) => (
                      <ToolTypeBadge
                        key={`${tool.toolType}-${tool.version}`}
                        toolType={tool.toolType}
                        className="text-xs"
                      />
                    ))}
                    {environment.installedTools.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{environment.installedTools.length - 4} more
                      </Badge>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No tools installed</p>
                )}
              </div>

              {/* Environment Variables Count */}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {Object.keys(environment.environmentVariables || {}).length} env vars
                </span>
                <span>
                  Last modified {formatRelativeTime(environment.lastModified)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails?.(environment.environmentId);
                  }}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onConfigureEnvironment?.(environment.environmentId);
                  }}
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Configure
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteEnvironment(environment.environmentId);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Real-time Updates Panel */}
      {selectedEnvironmentId && updates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Real-time Updates</span>
            </CardTitle>
            <CardDescription>
              Live updates for environment {selectedEnvironmentId}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {updates.slice(-5).map((update, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 text-sm p-2 rounded-md bg-muted/50"
                >
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(update.timestamp)}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {update.type}
                  </Badge>
                  <span className="flex-1">
                    {JSON.stringify(update.data)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnvironmentStatusDashboard;
