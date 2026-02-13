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
import { Badge, ToolTypeBadge, ProgressBadge } from '@/components/ui/Badge';
import {
  LoadingState,
  LoadingTable,
  EmptyState,
  ProgressBar,
} from '@/components/ui/Loading';
import apiService from '@/services/api';
import { formatRelativeTime, cn } from '@/lib/utils';
import {
  BuildToolVersionsResponse,
  BuildToolInstallRequest,
  ToolInstallFormData,
  InstalledTool,
} from '@/types/api';
import {
  Download,
  Package,
  Settings,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  RefreshCw,
  Star,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';

const toolInstallSchema = z.object({
  toolType: z.enum(['maven', 'gradle', 'npm', 'docker', 'nodejs', 'java']),
  version: z.string().min(1, 'Version is required'),
  installationPath: z.string().optional(),
  setAsDefault: z.boolean().default(true),
  configuration: z.record(z.any()).default({}),
});

interface BuildToolManagerProps {
  environmentId: string;
  installedTools?: InstalledTool[];
  onToolInstalled?: () => void;
}

const BuildToolManager: React.FC<BuildToolManagerProps> = ({
  environmentId,
  installedTools = [],
  onToolInstalled,
}) => {
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [showInstallForm, setShowInstallForm] = useState(false);
  const queryClient = useQueryClient();

  // Fetch available tool versions
  const {
    data: toolVersions,
    isLoading: versionsLoading,
    error: versionsError,
  } = useQuery({
    queryKey: ['build-tool-versions', selectedTool],
    queryFn: () => apiService.getBuildToolVersions(selectedTool || undefined),
    enabled: true,
  });

  // Install tool mutation
  const installToolMutation = useMutation({
    mutationFn: (data: BuildToolInstallRequest) => apiService.installBuildTool(data),
    onSuccess: () => {
      toast.success('Tool installation initiated successfully');
      queryClient.invalidateQueries({ queryKey: ['build-environments'] });
      setShowInstallForm(false);
      onToolInstalled?.();
    },
    onError: (error) => {
      toast.error(`Failed to install tool: ${error.message}`);
    },
  });

  // Form handling
  const form = useForm<ToolInstallFormData>({
    resolver: zodResolver(toolInstallSchema),
    defaultValues: {
      toolType: 'maven',
      version: '',
      setAsDefault: true,
      configuration: {},
    },
  });

  const onSubmit = (data: ToolInstallFormData) => {
    installToolMutation.mutate({
      environmentId,
      ...data,
    });
  };

  const getToolIcon = (toolType: string) => {
    switch (toolType) {
      case 'maven':
      case 'gradle':
        return <Package className="h-4 w-4" />;
      case 'npm':
      case 'nodejs':
        return <Package className="h-4 w-4" />;
      case 'docker':
        return <Package className="h-4 w-4" />;
      case 'java':
        return <Package className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-4 w-4 text-success-500" />;
      case 'INACTIVE':
        return <Clock className="h-4 w-4 text-warning-500" />;
      case 'ERROR':
        return <AlertCircle className="h-4 w-4 text-error-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const toolTypes = ['maven', 'gradle', 'npm', 'docker', 'nodejs', 'java'] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Build Tools</h2>
          <p className="text-muted-foreground">
            Manage and install build tools for your environment
          </p>
        </div>
        <Button onClick={() => setShowInstallForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Install Tool
        </Button>
      </div>

      {/* Installed Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Installed Tools</span>
          </CardTitle>
          <CardDescription>
            Currently installed build tools in this environment
          </CardDescription>
        </CardHeader>
        <CardContent>
          {installedTools.length === 0 ? (
            <EmptyState
              title="No tools installed"
              description="Install build tools to get started with automated environment setup."
              icon={<Package className="h-12 w-12" />}
              action={
                <Button onClick={() => setShowInstallForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Install First Tool
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {installedTools.map((tool) => (
                <div
                  key={`${tool.toolType}-${tool.version}`}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getToolIcon(tool.toolType)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <ToolTypeBadge toolType={tool.toolType} />
                          <span className="font-medium">{tool.version}</span>
                          {tool.isDefault && (
                            <Badge variant="outline" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {tool.installationPath}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(tool.status)}
                      <span className="text-sm">{tool.status}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Installed {formatRelativeTime(tool.installedAt)}
                    </span>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Versions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Available Versions</span>
              </CardTitle>
              <CardDescription>
                Browse and install available tool versions
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <select
                className="input w-40"
                value={selectedTool}
                onChange={(e) => setSelectedTool(e.target.value)}
              >
                <option value="">All Tools</option>
                {toolTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.toUpperCase()}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['build-tool-versions'] })}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {versionsLoading ? (
            <LoadingTable rows={5} columns={4} />
          ) : versionsError ? (
            <EmptyState
              title="Failed to load versions"
              description="There was an error loading available tool versions."
              icon={<AlertCircle className="h-12 w-12" />}
            />
          ) : toolVersions && Object.keys(toolVersions.availableVersions).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(toolVersions.availableVersions).map(([toolType, versions]) => (
                <div key={toolType}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                    <ToolTypeBadge toolType={toolType as any} />
                    <span>{toolType.toUpperCase()}</span>
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {versions.slice(0, 6).map((version) => (
                      <div
                        key={version.version}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{version.version}</span>
                            {version.isLatest && (
                              <Badge variant="success" className="text-xs">
                                Latest
                              </Badge>
                            )}
                            {version.isLts && (
                              <Badge variant="outline" className="text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                LTS
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          Released {version.releaseDate}
                        </p>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            form.setValue('toolType', toolType as any);
                            form.setValue('version', version.version);
                            setShowInstallForm(true);
                          }}
                        >
                          <Download className="h-3 w-3 mr-2" />
                          Install
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No versions available"
              description="No tool versions are currently available for installation."
              icon={<Package className="h-12 w-12" />}
            />
          )}
        </CardContent>
      </Card>

      {/* Install Tool Modal/Form */}
      {showInstallForm && (
        <Card>
          <CardHeader>
            <CardTitle>Install Build Tool</CardTitle>
            <CardDescription>
              Configure and install a new build tool in your environment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Tool Type</label>
                  <select
                    className="input"
                    {...form.register('toolType')}
                  >
                    {toolTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Version</label>
                  <input
                    className="input"
                    placeholder="e.g., 3.9.4"
                    {...form.register('version')}
                  />
                  {form.formState.errors.version && (
                    <p className="text-sm text-error-500 mt-1">
                      {form.formState.errors.version.message}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="label">Installation Path (Optional)</label>
                <input
                  className="input"
                  placeholder="Custom installation path"
                  {...form.register('installationPath')}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="setAsDefault"
                  {...form.register('setAsDefault')}
                />
                <label htmlFor="setAsDefault" className="label">
                  Set as default version
                </label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInstallForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={installToolMutation.isPending}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Install Tool
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BuildToolManager;
