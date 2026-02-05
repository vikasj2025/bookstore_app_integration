// API Types based on OpenAPI specification

export interface BootstrapRequest {
  projectPath: string;
  mavenVersion: string;
  projectType?: 'spring-boot' | 'web-app' | 'library' | 'microservice';
  customProperties?: Record<string, string>;
}

export interface BootstrapResponse {
  bootstrapId: string;
  status: 'initiated' | 'in_progress' | 'completed' | 'failed';
  message: string;
  estimatedCompletion?: string;
  downloadUrl?: string;
}

export interface BootstrapStatus {
  bootstrapId: string;
  status: 'initiated' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  startTime: string;
  completionTime?: string;
  errorMessage?: string;
  logs: LogEntry[];
}

export interface ConfigDiscoveryRequest {
  projectPath: string;
  scanDepth?: number;
  includeSubmodules?: boolean;
}

export interface ConfigDiscoveryResponse {
  projectType: 'spring-boot' | 'web-app' | 'library' | 'microservice';
  detectedMavenVersion: string;
  recommendedConfiguration: MavenConfiguration;
  submodules: SubmoduleInfo[];
  detectedDependencies: DependencyInfo[];
}

export interface ConfigurationTemplatesResponse {
  templates: ConfigurationTemplate[];
  totalCount: number;
}

export interface VerificationRequest {
  fileName: string;
  checksum: string;
  algorithm: 'SHA256' | 'MD5' | 'SHA1';
  fileSize?: number;
}

export interface VerificationResponse {
  isValid: boolean;
  checksumMatch: boolean;
  fileSizeMatch: boolean;
  actualChecksum: string;
  actualFileSize: number;
  verificationTime: string;
}

export interface CacheStatusResponse {
  status: 'healthy' | 'degraded' | 'offline';
  hitRate: number;
  totalKeys: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  lastUpdated: string;
}

export interface CacheInvalidationRequest {
  keys?: string[];
  patterns?: string[];
  invalidateAll?: boolean;
}

export interface CacheInvalidationResponse {
  invalidatedKeys: number;
  operationTime: number;
  success: boolean;
}

export interface HealthResponse {
  status: 'UP' | 'DOWN' | 'DEGRADED';
  components: Record<string, {
    status: 'UP' | 'DOWN';
    details?: Record<string, any>;
  }>;
  timestamp: string;
}

export interface MetricsResponse {
  timeRange: string;
  metrics: {
    downloads?: MetricData;
    bootstrap_operations?: MetricData;
    cache_hits?: MetricData;
    response_times?: MetricData;
  };
  generatedAt: string;
}

export interface BuildMonitoringResponse {
  builds: BuildInfo[];
  totalCount: number;
  summary: {
    running: number;
    completed: number;
    failed: number;
    pending: number;
  };
}

export interface MavenConfiguration {
  mavenVersion: string;
  javaVersion: string;
  properties: Record<string, string>;
  repositories: RepositoryInfo[];
}

export interface SubmoduleInfo {
  name: string;
  path: string;
  artifactId: string;
  groupId: string;
}

export interface DependencyInfo {
  groupId: string;
  artifactId: string;
  version: string;
  scope: string;
}

export interface ConfigurationTemplate {
  id: string;
  name: string;
  description: string;
  projectType: string;
  mavenVersion: string;
  configuration: MavenConfiguration;
}

export interface RepositoryInfo {
  id: string;
  url: string;
  name: string;
}

export interface LogEntry {
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  message: string;
}

export interface MetricData {
  current: number;
  average: number;
  peak: number;
  total: number;
  timeSeries: {
    timestamp: string;
    value: number;
  }[];
}

export interface BuildInfo {
  buildId: string;
  projectId: string;
  status: 'running' | 'completed' | 'failed' | 'pending';
  startTime: string;
  endTime?: string;
  duration?: number;
  mavenVersion: string;
  logs: LogEntry[];
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: string;
    timestamp: string;
    traceId?: string;
  };
}

// Additional UI-specific types
export interface ApiResponse<T> {
  data?: T;
  error?: ErrorResponse;
  loading: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface FilterParams {
  status?: string;
  projectType?: string;
  timeRange?: string;
  search?: string;
}
