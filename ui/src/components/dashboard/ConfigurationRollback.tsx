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
import { Badge, ProgressBadge } from '@/components/ui/Badge';
import {
  LoadingState,
  LoadingTable,
  EmptyState,
} from '@/components/ui/Loading';
import apiService from '@/services/api';
import { formatRelativeTime, formatDate, cn } from '@/lib/utils';
import {
  ConfigurationSnapshot,
  ConfigurationRollbackRequest,
  CreateSnapshotRequest,
} from '@/types/api';
import {
  History,
  RotateCcw,
  Camera,
  Tag,
  User,
  Calendar,
  Package,
  Settings,
  Database,
  Docker,
  GitBranch,
  CheckCircle,
  AlertTriangle,
  Clock,
  Plus,
  Eye,
  Download,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

const createSnapshotSchema = z.object({
  name: z.string().min(1, 'Snapshot name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  tags: z.array(z.string()).default([]),
  isStable: z.boolean().default(false),
});

const rollbackSchema = z.object({
  snapshotId: z.string().min(1, 'Please select a snapshot'),
  rollbackType: z.enum(['FULL', 'PARTIAL']).default('FULL'),
  componentsToRollback: z.array(
    z.enum(['BUILD_TOOLS', 'ENVIRONMENT_VARIABLES', 'REPOSITORY_ACCESS', 'DOCKER_CONFIG'])
  ).optional(),
  reason: z.string().max(500, 'Reason too long').optional(),
});

interface ConfigurationRollbackProps {
  environmentId: string;
}

const ConfigurationRollback: React.FC<ConfigurationRollbackProps> = ({
  environmentId,
}) => {
  const [selectedSnapshot, setSelectedSnapshot] = useState<ConfigurationSnapshot | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showRollbackForm, setShowRollbackForm] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const queryClient = useQueryClient();

  // Fetch configuration snapshots
  const {
    data: snapshotsData,
    isLoading: snapshotsLoading,
    error: snapshotsError,
  } = useQuery({
    queryKey: ['configuration-snapshots', environmentId],
    queryFn: () => apiService.getConfigurationSnapshots(environmentId, 20),
  });

  // Create snapshot mutation
  const createSnapshotMutation = useMutation({
    mutationFn: (data: CreateSnapshotRequest) =>
      apiService.createConfigurationSnapshot(environmentId, data),
    onSuccess: () => {
      toast.success('Configuration snapshot created successfully');
      queryClient.invalidateQueries({ queryKey: ['configuration-snapshots', environmentId] });
      setShowCreateForm(false);
      createForm.reset();
    },
    onError: (error) => {
      toast.error(`Failed to create snapshot: ${error.message}`);
    },
  });

  // Rollback configuration mutation
  const rollbackMutation = useMutation({
    mutationFn: (data: ConfigurationRollbackRequest) => apiService.rollbackConfiguration(data),
    onSuccess: () => {
      toast.success('Configuration rollback initiated successfully');
      queryClient.invalidateQueries({ queryKey: ['build-environments'] });
      setShowRollbackForm(false);
      rollbackForm.reset();
      setSelectedSnapshot(null);
    },
    onError: (error) => {
      toast.error(`Failed to rollback configuration: ${error.message}`);
    },
  });

  // Form handling
  const createForm = useForm<CreateSnapshotRequest>({
    resolver: zodResolver(createSnapshotSchema),
    defaultValues: {
      name: '',
      description: '',
      tags: [],
      isStable: false,
    },
  });

  const rollbackForm = useForm<ConfigurationRollbackRequest>({
    resolver: zodResolver(rollbackSchema),
    defaultValues: {
      environmentId,
      snapshotId: '',
      rollbackType: 'FULL',
      componentsToRollback: [],
      reason: '',
    },
  });

  const watchedRollbackType = rollbackForm.watch('rollbackType');

  const onCreateSubmit = (data: CreateSnapshotRequest) => {
    createSnapshotMutation.mutate(data);
  };

  const onRollbackSubmit = (data: ConfigurationRollbackRequest) => {
    rollbackMutation.mutate(data);
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      const currentTags = createForm.getValues('tags');
      if (!currentTags.includes(tagInput.trim())) {
        createForm.setValue('tags', [...currentTags, tagInput.trim()]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = createForm.getValues('tags');
    createForm.setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  const handleSelectSnapshot = (snapshot: ConfigurationSnapshot) => {
    setSelectedSnapshot(snapshot);
    rollbackForm.setValue('snapshotId', snapshot.snapshotId);
  };

  const getComponentIcon = (component: string) => {
    switch (component) {
      case 'BUILD_TOOLS':
        return <Package className="h-4 w-4" />;
      case 'ENVIRONMENT_VARIABLES':
        return <Settings className="h-4 w-4" />;
      case 'REPOSITORY_ACCESS':
        return <GitBranch className="h-4 w-4" />;
      case 'DOCKER_CONFIG':
        return <Docker className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const snapshots = snapshotsData?.snapshots || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Configuration Management</h2>
          <p className="text-muted-foreground">
            Create snapshots and rollback to previous configurations
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowCreateForm(true)}>
            <Camera className="h-4 w-4 mr-2" />
            Create Snapshot
          </Button>
          <Button
            onClick={() => setShowRollbackForm(true)}
            disabled={!selectedSnapshot}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Rollback
          </Button>
        </div>
      </div>

      {/* Configuration Snapshots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Configuration Snapshots</span>
          </CardTitle>
          <CardDescription>
            Available configuration snapshots for rollback
          </CardDescription>
        </CardHeader>
        <CardContent>
          {snapshotsLoading ? (
            <LoadingTable rows={5} columns={5} />
          ) : snapshotsError ? (
            <EmptyState
              title="Failed to load snapshots"
              description="There was an error loading configuration snapshots."
              icon={<AlertTriangle className="h-12 w-12" />}
            />
          ) : snapshots.length === 0 ? (
            <EmptyState
              title="No configuration snapshots"
              description="Create your first configuration snapshot to enable rollback capabilities."
              icon={<Camera className="h-12 w-12" />}
              action={
                <Button onClick={() => setShowCreateForm(true)}>
                  <Camera className="h-4 w-4 mr-2" />
                  Create First Snapshot
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {snapshots.map((snapshot) => (
                <div
                  key={snapshot.snapshotId}
                  className={cn(
                    'p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md',
                    selectedSnapshot?.snapshotId === snapshot.snapshotId
                      ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                  onClick={() => handleSelectSnapshot(snapshot)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{snapshot.name}</h3>
                        {snapshot.isStable && (
                          <Badge variant="success" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Stable
                          </Badge>
                        )}
                      </div>
                      
                      {snapshot.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {snapshot.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{snapshot.createdBy}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatRelativeTime(snapshot.createdAt)}</span>
                        </span>
                      </div>
                      
                      {snapshot.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {snapshot.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span>{snapshot.configurationSummary.buildToolsCount} tools</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Settings className="h-4 w-4 text-muted-foreground" />
                          <span>{snapshot.configurationSummary.environmentVariablesCount} env vars</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <GitBranch className="h-4 w-4 text-muted-foreground" />
                          <span>{snapshot.configurationSummary.repositoryAccessCount} repos</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Docker className="h-4 w-4 text-muted-foreground" />
                          <span>{snapshot.configurationSummary.hasDockerConfig ? 'Docker' : 'No Docker'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3" />
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

      {/* Create Snapshot Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Configuration Snapshot</CardTitle>
            <CardDescription>
              Capture the current environment configuration for future rollback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <div>
                <label className="label">Snapshot Name</label>
                <input
                  className="input"
                  placeholder="e.g., Before Maven 3.9 upgrade"
                  {...createForm.register('name')}
                />
                {createForm.formState.errors.name && (
                  <p className="text-sm text-error-500 mt-1">
                    {createForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              
              <div>
                <label className="label">Description (Optional)</label>
                <textarea
                  className="input min-h-20"
                  placeholder="Describe what this snapshot captures..."
                  {...createForm.register('description')}
                />
              </div>
              
              <div>
                <label className="label">Tags</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    className="input flex-1"
                    placeholder="Add a tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button type="button" onClick={handleAddTag}>
                    Add
                  </Button>
                </div>
                {createForm.watch('tags').length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {createForm.watch('tags').map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isStable"
                  {...createForm.register('isStable')}
                />
                <label htmlFor="isStable" className="label">
                  Mark as stable configuration
                </label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={createSnapshotMutation.isPending}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Create Snapshot
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Rollback Form */}
      {showRollbackForm && selectedSnapshot && (
        <Card>
          <CardHeader>
            <CardTitle>Rollback Configuration</CardTitle>
            <CardDescription>
              Rollback to snapshot: {selectedSnapshot.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={rollbackForm.handleSubmit(onRollbackSubmit)} className="space-y-4">
              <div>
                <label className="label">Rollback Type</label>
                <select
                  className="input"
                  {...rollbackForm.register('rollbackType')}
                >
                  <option value="FULL">Full Rollback</option>
                  <option value="PARTIAL">Partial Rollback</option>
                </select>
              </div>
              
              {watchedRollbackType === 'PARTIAL' && (
                <div>
                  <label className="label">Components to Rollback</label>
                  <div className="space-y-2">
                    {['BUILD_TOOLS', 'ENVIRONMENT_VARIABLES', 'REPOSITORY_ACCESS', 'DOCKER_CONFIG'].map((component) => (
                      <div key={component} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={component}
                          value={component}
                          {...rollbackForm.register('componentsToRollback')}
                        />
                        <label htmlFor={component} className="label flex items-center space-x-2">
                          {getComponentIcon(component)}
                          <span>{component.replace('_', ' ')}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <label className="label">Reason for Rollback (Optional)</label>
                <textarea
                  className="input min-h-20"
                  placeholder="Explain why you're rolling back..."
                  {...rollbackForm.register('reason')}
                />
              </div>
              
              <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-warning-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-warning-800">Warning</h4>
                    <p className="text-sm text-warning-700">
                      Rolling back will replace your current configuration with the selected snapshot.
                      This action cannot be undone automatically.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRollbackForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  loading={rollbackMutation.isPending}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Rollback Configuration
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConfigurationRollback;
