'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  PulsingDot,
} from '@/components/ui/Loading';
import apiService from '@/services/api';
import { formatRelativeTime, cn } from '@/lib/utils';
import {
  RepositoryAccessRequest,
  RepositoryFormData,
  RepositoryAccessConfig,
} from '@/types/api';
import {
  GitBranch,
  Key,
  Shield,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  Eye,
  EyeOff,
  TestTube,
  Trash2,
  Settings,
  Lock,
  Unlock,
} from 'lucide-react';
import { toast } from 'sonner';

const repositoryAccessSchema = z.object({
  repositoryUrl: z.string().url('Please enter a valid repository URL'),
  authenticationType: z.enum(['TOKEN', 'SSH_KEY', 'USERNAME_PASSWORD']),
  credentials: z.object({
    username: z.string().optional(),
    password: z.string().optional(),
    token: z.string().optional(),
    sshPrivateKey: z.string().optional(),
    sshPassphrase: z.string().optional(),
  }),
  accessLevel: z.enum(['READ', 'WRITE', 'ADMIN']).default('read'),
});

interface RepositoryAccessManagerProps {
  environmentId: string;
  repositoryAccess?: RepositoryAccessConfig[];
  onAccessConfigured?: () => void;
}

const RepositoryAccessManager: React.FC<RepositoryAccessManagerProps> = ({
  environmentId,
  repositoryAccess = [],
  onAccessConfigured,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});
  const [validatingAccess, setValidatingAccess] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Configure repository access mutation
  const configureAccessMutation = useMutation({
    mutationFn: (data: RepositoryAccessRequest) => apiService.configureRepositoryAccess(data),
    onSuccess: () => {
      toast.success('Repository access configured successfully');
      queryClient.invalidateQueries({ queryKey: ['build-environments'] });
      setShowAddForm(false);
      onAccessConfigured?.();
    },
    onError: (error) => {
      toast.error(`Failed to configure repository access: ${error.message}`);
    },
  });

  // Validate repository access mutation
  const validateAccessMutation = useMutation({
    mutationFn: (accessId: string) => apiService.validateRepositoryAccess(accessId),
    onSuccess: (data) => {
      if (data.isValid) {
        toast.success('Repository access validation successful');
      } else {
        toast.error(`Validation failed: ${data.message}`);
      }
    },
    onError: (error) => {
      toast.error(`Validation failed: ${error.message}`);
    },
    onSettled: () => {
      setValidatingAccess(null);
    },
  });

  // Form handling
  const form = useForm<RepositoryFormData>({
    resolver: zodResolver(repositoryAccessSchema),
    defaultValues: {
      repositoryUrl: '',
      authenticationType: 'TOKEN',
      credentials: {},
      accessLevel: 'read',
    },
  });

  const watchedAuthType = form.watch('authenticationType');

  const onSubmit = (data: RepositoryFormData) => {
    configureAccessMutation.mutate({
      environmentId,
      ...data,
    });
  };

  const handleValidateAccess = async (accessId: string) => {
    setValidatingAccess(accessId);
    validateAccessMutation.mutate(accessId);
  };

  const toggleCredentialsVisibility = (accessId: string) => {
    setShowCredentials(prev => ({
      ...prev,
      [accessId]: !prev[accessId],
    }));
  };

  const getAuthTypeIcon = (type: string) => {
    switch (type) {
      case 'TOKEN':
        return <Key className="h-4 w-4" />;
      case 'SSH_KEY':
        return <Shield className="h-4 w-4" />;
      case 'USERNAME_PASSWORD':
        return <Lock className="h-4 w-4" />;
      default:
        return <Key className="h-4 w-4" />;
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'READ':
        return 'bg-blue-100 text-blue-800';
      case 'WRITE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Repository Access</h2>
          <p className="text-muted-foreground">
            Manage secure access to private repositories and build resources
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Repository
        </Button>
      </div>

      {/* Configured Repository Access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GitBranch className="h-5 w-5" />
            <span>Configured Repositories</span>
          </CardTitle>
          <CardDescription>
            Repositories with configured secure access for this environment
          </CardDescription>
        </CardHeader>
        <CardContent>
          {repositoryAccess.length === 0 ? (
            <EmptyState
              title="No repository access configured"
              description="Add repository access to enable secure builds from private repositories."
              icon={<GitBranch className="h-12 w-12" />}
              action={
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Configure First Repository
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {repositoryAccess.map((repo, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getAuthTypeIcon(repo.authenticationType)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{repo.repositoryUrl}</span>
                          <Badge
                            variant="outline"
                            className={cn('text-xs', getAccessLevelColor('read'))}
                          >
                            READ
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Authentication: {repo.authenticationType}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleCredentialsVisibility(`repo-${index}`)}
                    >
                      {showCredentials[`repo-${index}`] ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleValidateAccess(`repo-${index}`)}
                      loading={validatingAccess === `repo-${index}`}
                    >
                      <TestTube className="h-3 w-3 mr-1" />
                      Test
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Repository Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Configure Repository Access</CardTitle>
            <CardDescription>
              Add secure access to a private repository for automated builds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Repository URL */}
              <div>
                <label className="label">Repository URL</label>
                <input
                  className="input"
                  placeholder="https://github.com/username/repo.git"
                  {...form.register('repositoryUrl')}
                />
                {form.formState.errors.repositoryUrl && (
                  <p className="text-sm text-error-500 mt-1">
                    {form.formState.errors.repositoryUrl.message}
                  </p>
                )}
              </div>

              {/* Authentication Type */}
              <div>
                <label className="label">Authentication Type</label>
                <select
                  className="input"
                  {...form.register('authenticationType')}
                >
                  <option value="TOKEN">Personal Access Token</option>
                  <option value="SSH_KEY">SSH Key</option>
                  <option value="USERNAME_PASSWORD">Username & Password</option>
                </select>
              </div>

              {/* Credentials based on auth type */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Credentials</h3>
                
                {watchedAuthType === 'TOKEN' && (
                  <div>
                    <label className="label">Personal Access Token</label>
                    <input
                      type="password"
                      className="input"
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      {...form.register('credentials.token')}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Generate a personal access token with repository access permissions
                    </p>
                  </div>
                )}

                {watchedAuthType === 'USERNAME_PASSWORD' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Username</label>
                      <input
                        className="input"
                        placeholder="username"
                        {...form.register('credentials.username')}
                      />
                    </div>
                    <div>
                      <label className="label">Password</label>
                      <input
                        type="password"
                        className="input"
                        placeholder="password"
                        {...form.register('credentials.password')}
                      />
                    </div>
                  </div>
                )}

                {watchedAuthType === 'SSH_KEY' && (
                  <div className="space-y-4">
                    <div>
                      <label className="label">SSH Private Key</label>
                      <textarea
                        className="input min-h-32"
                        placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
                        {...form.register('credentials.sshPrivateKey')}
                      />
                    </div>
                    <div>
                      <label className="label">SSH Passphrase (Optional)</label>
                      <input
                        type="password"
                        className="input"
                        placeholder="passphrase"
                        {...form.register('credentials.sshPassphrase')}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Access Level */}
              <div>
                <label className="label">Access Level</label>
                <select
                  className="input"
                  {...form.register('accessLevel')}
                >
                  <option value="read">Read Only</option>
                  <option value="WRITE">Read & Write</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Choose the minimum required access level for your build process
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={configureAccessMutation.isPending}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Configure Access
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Security Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security Best Practices</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-4 w-4 text-success-500 mt-0.5" />
              <p>
                Use personal access tokens instead of passwords when possible for better security
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-4 w-4 text-success-500 mt-0.5" />
              <p>
                Grant minimum required permissions - use read-only access for build-only repositories
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-4 w-4 text-success-500 mt-0.5" />
              <p>
                Regularly rotate access tokens and SSH keys to maintain security
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-4 w-4 text-success-500 mt-0.5" />
              <p>
                Test repository access after configuration to ensure proper connectivity
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RepositoryAccessManager;
