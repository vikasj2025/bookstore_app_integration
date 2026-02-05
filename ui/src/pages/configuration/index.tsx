import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Page } from '@/components/layout/Layout';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { withAuth } from '@/hooks/useAuth';
import { useBootstrapWebSocket } from '@/hooks/useWebSocket';
import { bootstrapService } from '@/services/bootstrap';
import {
  BootstrapRequest,
  BootstrapStatus,
  ConfigurationTemplate,
  ConfigDiscoveryResponse,
} from '@/types/api';
import {
  FolderIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  DocumentTextIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

const bootstrapSchema = z.object({
  projectPath: z.string().min(1, 'Project path is required'),
  mavenVersion: z.string().regex(/^[0-9]+\.[0-9]+\.[0-9]+$/, 'Invalid Maven version format (e.g., 3.9.6)'),
  projectType: z.enum(['spring-boot', 'web-app', 'library', 'microservice']).optional(),
  customProperties: z.record(z.string()).optional(),
});

type BootstrapFormData = z.infer<typeof bootstrapSchema>;

function ProjectDiscovery({ onDiscovered }: { onDiscovered: (config: ConfigDiscoveryResponse) => void }) {
  const [projectPath, setProjectPath] = useState('');
  const [discovering, setDiscovering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDiscover = async () => {
    if (!projectPath.trim()) {
      setError('Please enter a project path');
      return;
    }

    setDiscovering(true);
    setError(null);

    try {
      const config = await bootstrapService.discoverConfiguration({
        projectPath: projectPath.trim(),
        includeSubmodules: true,
      });
      onDiscovered(config);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Discovery failed');
    } finally {
      setDiscovering(false);
    }
  };

  return (
    <Card>
      <CardHeader 
        title="Project Discovery" 
        subtitle="Automatically detect Maven configuration from your project"
      />
      <CardContent>
        <div className="space-y-4">
          <Input
            label="Project Path"
            placeholder="/path/to/your/maven/project"
            value={projectPath}
            onChange={(e) => setProjectPath(e.target.value)}
            leftIcon={<FolderIcon className="h-4 w-4" />}
            error={error}
            helpText="Enter the absolute path to your Maven project directory"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleDiscover}
          loading={discovering}
          leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
        >
          Discover Configuration
        </Button>
      </CardFooter>
    </Card>
  );
}

function ConfigurationTemplates({ onSelect }: { onSelect: (template: ConfigurationTemplate) => void }) {
  const [templates, setTemplates] = useState<ConfigurationTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await bootstrapService.getConfigurationTemplates();
        setTemplates(response.templates);
      } catch (error) {
        console.error('Failed to load templates:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Configuration Templates" subtitle="Choose from pre-configured setups" />
      <CardContent>
        <div className="space-y-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 cursor-pointer transition-colors"
              onClick={() => onSelect(template)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                  <p className="text-sm text-gray-500">{template.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-xs text-gray-400">Type: {template.projectType}</span>
                    <span className="text-xs text-gray-400">Maven: {template.mavenVersion}</span>
                  </div>
                </div>
                <DocumentTextIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function BootstrapForm({ initialData }: { initialData?: Partial<BootstrapFormData> }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bootstrapId, setBootstrapId] = useState<string | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  
  const { status: bootstrapStatus } = useBootstrapWebSocket(bootstrapId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BootstrapFormData>({
    resolver: zodResolver(bootstrapSchema),
    defaultValues: {
      projectPath: '',
      mavenVersion: '3.9.6',
      projectType: 'web-app',
      ...initialData,
    },
  });

  const projectType = watch('projectType');

  // Update recommended Maven version when project type changes
  useEffect(() => {
    if (projectType) {
      const recommended = bootstrapService.getRecommendedMavenVersion(projectType);
      setValue('mavenVersion', recommended);
    }
  }, [projectType, setValue]);

  const onSubmit = async (data: BootstrapFormData) => {
    setIsSubmitting(true);
    
    try {
      const request: BootstrapRequest = {
        projectPath: data.projectPath,
        mavenVersion: data.mavenVersion,
        projectType: data.projectType,
        customProperties: data.customProperties,
      };
      
      const response = await bootstrapService.initializeBootstrap(request);
      setBootstrapId(response.bootstrapId);
      setShowProgress(true);
    } catch (error) {
      console.error('Bootstrap failed:', error);
      alert('Bootstrap failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader title="Bootstrap Configuration" subtitle="Configure Maven wrapper bootstrap settings" />
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent>
            <div className="space-y-6">
              <Input
                label="Project Path"
                placeholder="/path/to/your/maven/project"
                {...register('projectPath')}
                error={errors.projectPath?.message}
                leftIcon={<FolderIcon className="h-4 w-4" />}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Type
                  </label>
                  <select
                    {...register('projectType')}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="spring-boot">Spring Boot</option>
                    <option value="web-app">Web Application</option>
                    <option value="library">Library</option>
                    <option value="microservice">Microservice</option>
                  </select>
                </div>
                
                <Input
                  label="Maven Version"
                  placeholder="3.9.6"
                  {...register('mavenVersion')}
                  error={errors.mavenVersion?.message}
                  helpText="Format: X.Y.Z (e.g., 3.9.6)"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              loading={isSubmitting}
              leftIcon={<PlayIcon className="h-4 w-4" />}
              variant="primary"
            >
              Start Bootstrap
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Bootstrap Progress Modal */}
      <Modal
        isOpen={showProgress}
        onClose={() => setShowProgress(false)}
        title="Bootstrap Progress"
        size="lg"
        closeOnOverlayClick={false}
        showCloseButton={bootstrapStatus?.status === 'completed' || bootstrapStatus?.status === 'failed'}
      >
        {bootstrapStatus && (
          <BootstrapProgress 
            status={bootstrapStatus} 
            onComplete={() => setShowProgress(false)}
          />
        )}
      </Modal>
    </>
  );
}

function BootstrapProgress({ status, onComplete }: { status: BootstrapStatus; onComplete: () => void }) {
  useEffect(() => {
    if (status.status === 'completed') {
      setTimeout(onComplete, 2000); // Auto-close after 2 seconds
    }
  }, [status.status, onComplete]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <StatusBadge status={status.status} size="lg" />
        <span className="text-sm text-gray-500">
          {status.progress}% complete
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${status.progress}%` }}
        />
      </div>
      
      <div>
        <p className="font-medium text-gray-900">Current Step:</p>
        <p className="text-sm text-gray-600">{status.currentStep}</p>
      </div>
      
      {status.logs && status.logs.length > 0 && (
        <div>
          <p className="font-medium text-gray-900 mb-2">Logs:</p>
          <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
            {status.logs.slice(-5).map((log, index) => (
              <div key={index} className="text-xs font-mono">
                <span className="text-gray-500">[{log.timestamp}]</span>
                <span className={`ml-2 ${
                  log.level === 'ERROR' ? 'text-red-600' :
                  log.level === 'WARN' ? 'text-yellow-600' :
                  'text-gray-700'
                }`}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {status.errorMessage && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-3">
          <p className="text-error-800 text-sm">{status.errorMessage}</p>
        </div>
      )}
    </div>
  );
}

function ConfigurationPage() {
  const [formData, setFormData] = useState<Partial<BootstrapFormData>>({});

  const handleDiscovered = (config: ConfigDiscoveryResponse) => {
    setFormData({
      projectType: config.projectType,
      mavenVersion: config.detectedMavenVersion,
    });
  };

  const handleTemplateSelected = (template: ConfigurationTemplate) => {
    setFormData({
      projectType: template.projectType as any,
      mavenVersion: template.mavenVersion,
    });
  };

  return (
    <Page 
      title="Configuration" 
      subtitle="Set up Maven wrapper bootstrap for your project"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Discovery and Templates */}
        <div className="space-y-6">
          <ProjectDiscovery onDiscovered={handleDiscovered} />
          <ConfigurationTemplates onSelect={handleTemplateSelected} />
        </div>
        
        {/* Right column - Bootstrap Form */}
        <div className="lg:col-span-2">
          <BootstrapForm initialData={formData} />
        </div>
      </div>
    </Page>
  );
}

export default withAuth(ConfigurationPage);
