import { http, HttpResponse } from 'msw';
import {
  BuildEnvironmentDetails,
  MavenWrapperDownloadResponse,
  MavenWrapperStatusResponse,
  BuildEnvironmentConfigResponse,
  RepositoryAccessResponse,
  RepositoryValidationResponse,
  BuildToolVersionsResponse,
  BuildToolInstallResponse,
  HealthCheckResponse,
  ScheduledHealthCheckResponse,
  ConfigurationRollbackResponse,
  ConfigurationSnapshotsResponse,
  CreateSnapshotResponse,
} from '@/types/api';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.buildenvironment.company.com/v1';

// Mock data
const mockEnvironments: BuildEnvironmentDetails[] = [
  {
    environmentId: 'env-001',
    environmentName: 'Java Spring Boot Project',
    status: 'ACTIVE',
    createdAt: '2024-01-15T10:30:00Z',
    lastModified: '2024-01-20T14:45:00Z',
    installedTools: [
      {
        toolType: 'java',
        version: '17.0.8',
        installationPath: '/usr/lib/jvm/java-17-openjdk',
        isDefault: true,
        installedAt: '2024-01-15T10:35:00Z',
        status: 'ACTIVE',
      },
      {
        toolType: 'maven',
        version: '3.9.4',
        installationPath: '/opt/maven',
        isDefault: true,
        installedAt: '2024-01-15T10:40:00Z',
        status: 'ACTIVE',
      },
    ],
    environmentVariables: {
      JAVA_HOME: '/usr/lib/jvm/java-17-openjdk',
      MAVEN_HOME: '/opt/maven',
      PATH: '/usr/lib/jvm/java-17-openjdk/bin:/opt/maven/bin:$PATH',
    },
    healthStatus: {
      status: 'HEALTHY',
      lastChecked: '2024-01-20T15:00:00Z',
      uptime: 432000, // 5 days in seconds
    },
    configurationHistory: [
      {
        changeId: 'change-001',
        changeType: 'CREATE',
        timestamp: '2024-01-15T10:30:00Z',
        changedBy: 'john.doe@company.com',
        summary: 'Initial environment creation',
        details: { environmentName: 'Java Spring Boot Project' },
      },
    ],
  },
  {
    environmentId: 'env-002',
    environmentName: 'Node.js React App',
    status: 'CONFIGURING',
    createdAt: '2024-01-18T09:15:00Z',
    lastModified: '2024-01-20T11:30:00Z',
    installedTools: [
      {
        toolType: 'nodejs',
        version: '18.18.0',
        installationPath: '/usr/local/nodejs',
        isDefault: true,
        installedAt: '2024-01-18T09:20:00Z',
        status: 'ACTIVE',
      },
    ],
    environmentVariables: {
      NODE_ENV: 'development',
      PATH: '/usr/local/nodejs/bin:$PATH',
    },
    healthStatus: {
      status: 'DEGRADED',
      lastChecked: '2024-01-20T15:00:00Z',
      uptime: 172800, // 2 days in seconds
    },
    configurationHistory: [],
  },
  {
    environmentId: 'env-003',
    environmentName: 'Python Django API',
    status: 'ERROR',
    createdAt: '2024-01-19T16:45:00Z',
    lastModified: '2024-01-20T08:20:00Z',
    installedTools: [],
    environmentVariables: {},
    healthStatus: {
      status: 'UNHEALTHY',
      lastChecked: '2024-01-20T15:00:00Z',
      uptime: 0,
    },
    configurationHistory: [],
  },
];

const mockToolVersions: BuildToolVersionsResponse = {
  availableVersions: {
    maven: [
      {
        version: '3.9.6',
        releaseDate: '2023-12-01',
        isLts: false,
        isLatest: true,
        downloadUrl: 'https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.tar.gz',
        checksum: 'sha256:abc123...',
      },
      {
        version: '3.9.4',
        releaseDate: '2023-08-15',
        isLts: true,
        isLatest: false,
        downloadUrl: 'https://archive.apache.org/dist/maven/maven-3/3.9.4/binaries/apache-maven-3.9.4-bin.tar.gz',
        checksum: 'sha256:def456...',
      },
    ],
    java: [
      {
        version: '21.0.1',
        releaseDate: '2023-10-15',
        isLts: true,
        isLatest: true,
        downloadUrl: 'https://download.oracle.com/java/21/latest/jdk-21_linux-x64_bin.tar.gz',
        checksum: 'sha256:ghi789...',
      },
      {
        version: '17.0.8',
        releaseDate: '2023-07-18',
        isLts: true,
        isLatest: false,
        downloadUrl: 'https://download.oracle.com/java/17/archive/jdk-17.0.8_linux-x64_bin.tar.gz',
        checksum: 'sha256:jkl012...',
      },
    ],
    nodejs: [
      {
        version: '20.10.0',
        releaseDate: '2023-11-22',
        isLts: true,
        isLatest: true,
        downloadUrl: 'https://nodejs.org/dist/v20.10.0/node-v20.10.0-linux-x64.tar.xz',
        checksum: 'sha256:mno345...',
      },
    ],
  },
  lastUpdated: '2024-01-20T12:00:00Z',
};

const mockSnapshots: ConfigurationSnapshotsResponse = {
  environmentId: 'env-001',
  snapshots: [
    {
      snapshotId: 'snap-001',
      name: 'Before Maven 3.9.6 Upgrade',
      description: 'Stable configuration before upgrading Maven to 3.9.6',
      createdAt: '2024-01-15T14:30:00Z',
      createdBy: 'john.doe@company.com',
      isStable: true,
      tags: ['stable', 'pre-upgrade', 'maven'],
      configurationSummary: {
        buildToolsCount: 2,
        environmentVariablesCount: 3,
        repositoryAccessCount: 1,
        hasDockerConfig: false,
      },
    },
    {
      snapshotId: 'snap-002',
      name: 'Initial Setup',
      description: 'Initial environment configuration',
      createdAt: '2024-01-15T10:30:00Z',
      createdBy: 'system',
      isStable: true,
      tags: ['initial', 'baseline'],
      configurationSummary: {
        buildToolsCount: 2,
        environmentVariablesCount: 3,
        repositoryAccessCount: 0,
        hasDockerConfig: false,
      },
    },
  ],
  totalCount: 2,
};

export const handlers = [
  // Build Environment endpoints
  http.get(`${baseURL}/build-environments`, () => {
    return HttpResponse.json(mockEnvironments);
  }),

  http.get(`${baseURL}/build-environment/:environmentId`, ({ params }) => {
    const { environmentId } = params;
    const environment = mockEnvironments.find(env => env.environmentId === environmentId);
    
    if (!environment) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(environment);
  }),

  http.post(`${baseURL}/build-environment/configure`, async ({ request }) => {
    const body = await request.json();
    const response: BuildEnvironmentConfigResponse = {
      environmentId: `env-${Date.now()}`,
      configurationId: `config-${Date.now()}`,
      status: 'PENDING',
      message: 'Environment configuration initiated',
      estimatedCompletionTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };
    return HttpResponse.json(response, { status: 202 });
  }),

  http.delete(`${baseURL}/build-environment/:environmentId`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Maven Wrapper endpoints
  http.post(`${baseURL}/maven-wrapper/download`, async ({ request }) => {
    const body = await request.json();
    const response: MavenWrapperDownloadResponse = {
      downloadId: `download-${Date.now()}`,
      status: 'INITIATED',
      message: 'Maven Wrapper download initiated',
      estimatedCompletionTime: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
    };
    return HttpResponse.json(response);
  }),

  http.get(`${baseURL}/maven-wrapper/status/:downloadId`, ({ params }) => {
    const response: MavenWrapperStatusResponse = {
      downloadId: params.downloadId as string,
      status: 'COMPLETED',
      progress: 100,
      startTime: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      completionTime: new Date().toISOString(),
      downloadedFiles: ['maven-wrapper.jar', 'maven-wrapper.properties'],
    };
    return HttpResponse.json(response);
  }),

  // Repository Access endpoints
  http.post(`${baseURL}/repository-access/configure`, async ({ request }) => {
    const body = await request.json();
    const response: RepositoryAccessResponse = {
      accessId: `access-${Date.now()}`,
      repositoryUrl: (body as any).repositoryUrl,
      status: 'CONFIGURED',
      message: 'Repository access configured successfully',
      configuredAt: new Date().toISOString(),
    };
    return HttpResponse.json(response, { status: 201 });
  }),

  http.post(`${baseURL}/repository-access/:accessId/validate`, ({ params }) => {
    const response: RepositoryValidationResponse = {
      accessId: params.accessId as string,
      isValid: true,
      validationStatus: 'SUCCESS',
      message: 'Repository access validation successful',
      testedAt: new Date().toISOString(),
      responseTime: 250,
    };
    return HttpResponse.json(response);
  }),

  // Build Tools endpoints
  http.get(`${baseURL}/build-tools/versions`, ({ request }) => {
    const url = new URL(request.url);
    const toolType = url.searchParams.get('toolType');
    
    if (toolType && mockToolVersions.availableVersions[toolType]) {
      return HttpResponse.json({
        availableVersions: {
          [toolType]: mockToolVersions.availableVersions[toolType],
        },
        lastUpdated: mockToolVersions.lastUpdated,
      });
    }
    
    return HttpResponse.json(mockToolVersions);
  }),

  http.post(`${baseURL}/build-tools/install`, async ({ request }) => {
    const body = await request.json();
    const response: BuildToolInstallResponse = {
      installationId: `install-${Date.now()}`,
      status: 'PENDING',
      message: 'Tool installation initiated',
      estimatedCompletionTime: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
    };
    return HttpResponse.json(response, { status: 202 });
  }),

  // Health Check endpoints
  http.get(`${baseURL}/health-check/environment/:environmentId`, ({ params, request }) => {
    const url = new URL(request.url);
    const checkType = url.searchParams.get('checkType') || 'basic';
    
    const response: HealthCheckResponse = {
      environmentId: params.environmentId as string,
      overallStatus: 'HEALTHY',
      checkedAt: new Date().toISOString(),
      checks: [
        {
          checkName: 'Service Connectivity',
          status: 'PASS',
          message: 'All services are responding',
          responseTime: 45,
          details: { endpoint: '/health', statusCode: 200 },
        },
        {
          checkName: 'Build Tools',
          status: 'PASS',
          message: 'All build tools are available',
          responseTime: 23,
          details: { maven: 'available', java: 'available' },
        },
        {
          checkName: 'Repository Access',
          status: 'WARN',
          message: 'Some repositories have slow response times',
          responseTime: 1200,
          details: { slowRepositories: ['repo1'] },
        },
      ],
      recommendations: [
        'Consider optimizing repository access for better performance',
      ],
    };
    return HttpResponse.json(response);
  }),

  http.post(`${baseURL}/health-check/scheduled`, async ({ request }) => {
    const body = await request.json();
    const response: ScheduledHealthCheckResponse = {
      scheduleId: `schedule-${Date.now()}`,
      environmentId: (body as any).environmentId,
      schedule: (body as any).schedule,
      nextExecution: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
      status: 'ACTIVE',
    };
    return HttpResponse.json(response, { status: 201 });
  }),

  // Configuration Rollback endpoints
  http.get(`${baseURL}/configuration/snapshots/:environmentId`, ({ params, request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    return HttpResponse.json({
      ...mockSnapshots,
      environmentId: params.environmentId as string,
      snapshots: mockSnapshots.snapshots.slice(0, limit),
    });
  }),

  http.post(`${baseURL}/configuration/snapshots/:environmentId`, async ({ params, request }) => {
    const body = await request.json();
    const response: CreateSnapshotResponse = {
      snapshotId: `snap-${Date.now()}`,
      environmentId: params.environmentId as string,
      name: (body as any).name,
      status: 'CREATING',
      createdAt: new Date().toISOString(),
      message: 'Snapshot creation initiated',
    };
    return HttpResponse.json(response, { status: 201 });
  }),

  http.post(`${baseURL}/configuration/rollback`, async ({ request }) => {
    const body = await request.json();
    const response: ConfigurationRollbackResponse = {
      rollbackId: `rollback-${Date.now()}`,
      status: 'INITIATED',
      message: 'Configuration rollback initiated',
      initiatedAt: new Date().toISOString(),
      estimatedCompletionTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };
    return HttpResponse.json(response, { status: 202 });
  }),

  // Health endpoint for API connectivity
  http.get(`${baseURL}/health`, () => {
    return HttpResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
  }),
];
