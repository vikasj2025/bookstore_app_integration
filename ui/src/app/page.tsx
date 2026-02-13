'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import EnvironmentStatusDashboard from '@/components/dashboard/EnvironmentStatusDashboard';
import BuildToolManager from '@/components/dashboard/BuildToolManager';
import RepositoryAccessManager from '@/components/dashboard/RepositoryAccessManager';
import HealthCheckMonitor from '@/components/dashboard/HealthCheckMonitor';
import ConfigurationRollback from '@/components/dashboard/ConfigurationRollback';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 3;
      },
    },
  },
});

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string>('');

  const handleCreateEnvironment = () => {
    // TODO: Implement create environment modal/form
    console.log('Create environment clicked');
  };

  const handleConfigureEnvironment = (environmentId: string) => {
    setSelectedEnvironmentId(environmentId);
    setActiveTab('build-tools');
  };

  const handleViewDetails = (environmentId: string) => {
    setSelectedEnvironmentId(environmentId);
    // Could open a detailed view modal or navigate to a details page
    console.log('View details for environment:', environmentId);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <EnvironmentStatusDashboard
            onCreateEnvironment={handleCreateEnvironment}
            onConfigureEnvironment={handleConfigureEnvironment}
            onViewDetails={handleViewDetails}
          />
        );
      case 'build-tools':
        return selectedEnvironmentId ? (
          <BuildToolManager
            environmentId={selectedEnvironmentId}
            onToolInstalled={() => {
              // Refresh environment data when tool is installed
              queryClient.invalidateQueries({ queryKey: ['build-environments'] });
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No Environment Selected
              </h3>
              <p className="text-sm text-muted-foreground">
                Please select an environment from the overview to manage build tools.
              </p>
            </div>
          </div>
        );
      case 'repositories':
        return selectedEnvironmentId ? (
          <RepositoryAccessManager
            environmentId={selectedEnvironmentId}
            onAccessConfigured={() => {
              // Refresh environment data when access is configured
              queryClient.invalidateQueries({ queryKey: ['build-environments'] });
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No Environment Selected
              </h3>
              <p className="text-sm text-muted-foreground">
                Please select an environment from the overview to manage repository access.
              </p>
            </div>
          </div>
        );
      case 'health':
        return selectedEnvironmentId ? (
          <HealthCheckMonitor environmentId={selectedEnvironmentId} />
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No Environment Selected
              </h3>
              <p className="text-sm text-muted-foreground">
                Please select an environment from the overview to monitor health.
              </p>
            </div>
          </div>
        );
      case 'rollback':
        return selectedEnvironmentId ? (
          <ConfigurationRollback environmentId={selectedEnvironmentId} />
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No Environment Selected
              </h3>
              <p className="text-sm text-muted-foreground">
                Please select an environment from the overview to manage configuration rollback.
              </p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
              <p className="text-muted-foreground">
                Configure global settings for the build environment dashboard
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="card p-6">
                <h3 className="text-lg font-medium mb-4">API Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="label">API Base URL</label>
                    <input
                      className="input"
                      value={process.env.NEXT_PUBLIC_API_BASE_URL || ''}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="label">WebSocket URL</label>
                    <input
                      className="input"
                      value={process.env.NEXT_PUBLIC_WS_URL || ''}
                      readOnly
                    />
                  </div>
                </div>
              </div>
              <div className="card p-6">
                <h3 className="text-lg font-medium mb-4">Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Auto-refresh dashboard</span>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Show detailed logs</span>
                    <input type="checkbox" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Enable notifications</span>
                    <input type="checkbox" defaultChecked />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Page Not Found
              </h3>
              <p className="text-sm text-muted-foreground">
                The requested page could not be found.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
          {renderContent()}
        </DashboardLayout>
        
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          expand={true}
          richColors
          closeButton
        />
        
        {/* React Query DevTools (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </div>
    </QueryClientProvider>
  );
};

export default Dashboard;
