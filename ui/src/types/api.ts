// API Types based on OpenAPI specification

export interface ErrorResponse {
  error: string;
  message: string;
  details?: string;
  timestamp: string;
  path: string;
  requestId: string;
  validationErrors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  rejectedValue?: string;
}

// Maven Wrapper Types
export interface MavenWrapperDownloadRequest {
  projectPath: string;
  mavenVersion: string;
  repositoryUrl?: string;
  forceDownload?: boolean;
}

export interface MavenWrapperDownloadResponse {
  downloadId: string;
  status: 'INITIATED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  message: string;
  estimatedCompletionTime: string;
}

export interface MavenWrapperStatusResponse {
  downloadId: string;
  status: 'INITIATED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  progress: number;
  startTime: string;
  completionTime?: string;
  errorMessage?: string;
  downloadedFiles: string[];
}

// Build Environment Types
export interface BuildEnvironmentConfigRequest {
  environmentName: string;
  buildTools: BuildToolConfig[];
  environmentVariables?: Record<string, string>;
  dockerConfig?: DockerConfig;
  repositoryAccess?: RepositoryAccessConfig[];
}

export interface BuildEnvironmentConfigResponse {
  environmentId: string;
  configurationId: string;
  status: 'PENDING' | 'CONFIGURING' | 'COMPLETED' | 'FAILED';
  message: string;
  estimatedCompletionTime: string;
}

export interface BuildEnvironmentDetails {
  environmentId: string;
  environmentName: string;
  status: 'ACTIVE' | 'INACTIVE' | 'CONFIGURING' | 'ERROR' | 'DELETED';
  createdAt: string;
  lastModified: string;
  installedTools: InstalledTool[];
  environmentVariables: Record<string, string>;
  healthStatus: HealthStatus;
  configurationHistory: ConfigurationHistoryItem[];
}

export interface BuildToolConfig {
  toolType: 'maven' | 'gradle' | 'npm' | 'docker' | 'nodejs' | 'java';
  version: string;
  installationPath?: string;
  configuration?: Record<string, any>;
}

export interface DockerConfig {
  baseImage?: string;
  registryUrl?: string;
  registryCredentials?: RegistryCredentials;
}

export interface RepositoryAccessConfig {
  repositoryUrl: string;
  authenticationType: 'TOKEN' | 'SSH_KEY' | 'USERNAME_PASSWORD';
  credentials?: RepositoryCredentials;
}

export interface RegistryCredentials {
  username?: string;
  password?: string;
  token?: string;
}

export interface RepositoryCredentials {
  username?: string;
  password?: string;
  token?: string;
  sshPrivateKey?: string;
  sshPassphrase?: string;
}

// Repository Access Types
export interface RepositoryAccessRequest {
  environmentId: string;
  repositoryUrl: string;
  authenticationType: 'TOKEN' | 'SSH_KEY' | 'USERNAME_PASSWORD';
  credentials?: RepositoryCredentials;
  accessLevel?: 'READ' | 'WRITE' | 'ADMIN';
}

export interface RepositoryAccessResponse {
  accessId: string;
  repositoryUrl: string;
  status: 'CONFIGURED' | 'VALIDATING' | 'ACTIVE' | 'ERROR';
  message: string;
  configuredAt: string;
}

export interface RepositoryValidationResponse {
  accessId: string;
  isValid: boolean;
  validationStatus: 'SUCCESS' | 'AUTHENTICATION_FAILED' | 'AUTHORIZATION_FAILED' | 'NETWORK_ERROR' | 'REPOSITORY_NOT_FOUND';
  message: string;
  testedAt: string;
  responseTime: number;
}

// Build Tools Types
export interface BuildToolVersionsResponse {
  availableVersions: Record<string, ToolVersion[]>;
  lastUpdated: string;
}

export interface ToolVersion {
  version: string;
  releaseDate: string;
  isLts: boolean;
  isLatest: boolean;
  downloadUrl: string;
  checksum: string;
}

export interface BuildToolInstallRequest {
  environmentId: string;
  toolType: 'maven' | 'gradle' | 'npm' | 'docker' | 'nodejs' | 'java';
  version: string;
  installationPath?: string;
  setAsDefault?: boolean;
  configuration?: Record<string, any>;
}

export interface BuildToolInstallResponse {
  installationId: string;
  status: 'PENDING' | 'DOWNLOADING' | 'INSTALLING' | 'CONFIGURING' | 'COMPLETED' | 'FAILED';
  message: string;
  estimatedCompletionTime: string;
}

export interface InstalledTool {
  toolType: 'maven' | 'gradle' | 'npm' | 'docker' | 'nodejs' | 'java';
  version: string;
  installationPath: string;
  isDefault: boolean;
  installedAt: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
}

// Health Check Types
export interface HealthCheckResponse {
  environmentId: string;
  overallStatus: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  checkedAt: string;
  checks: HealthCheck[];
  recommendations: string[];
}

export interface HealthCheck {
  checkName: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  message: string;
  responseTime: number;
  details?: Record<string, any>;
}

export interface HealthStatus {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'UNKNOWN';
  lastChecked: string;
  uptime: number;
}

export interface ScheduledHealthCheckRequest {
  environmentId: string;
  schedule: string;
  checkType?: 'basic' | 'comprehensive' | 'connectivity';
  notificationSettings?: NotificationSettings;
}

export interface ScheduledHealthCheckResponse {
  scheduleId: string;
  environmentId: string;
  schedule: string;
  nextExecution: string;
  status: 'ACTIVE' | 'PAUSED' | 'STOPPED';
}

export interface NotificationSettings {
  notifyOnFailure?: boolean;
  notifyOnRecovery?: boolean;
  emailRecipients?: string[];
  webhookUrl?: string;
}

// Configuration Rollback Types
export interface ConfigurationRollbackRequest {
  environmentId: string;
  snapshotId: string;
  rollbackType?: 'FULL' | 'PARTIAL';
  componentsToRollback?: ('BUILD_TOOLS' | 'ENVIRONMENT_VARIABLES' | 'REPOSITORY_ACCESS' | 'DOCKER_CONFIG')[];
  reason?: string;
}

export interface ConfigurationRollbackResponse {
  rollbackId: string;
  status: 'INITIATED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'PARTIALLY_COMPLETED';
  message: string;
  initiatedAt: string;
  estimatedCompletionTime: string;
}

export interface ConfigurationSnapshotsResponse {
  environmentId: string;
  snapshots: ConfigurationSnapshot[];
  totalCount: number;
}

export interface ConfigurationSnapshot {
  snapshotId: string;
  name: string;
  description?: string;
  createdAt: string;
  createdBy: string;
  isStable: boolean;
  tags: string[];
  configurationSummary: ConfigurationSummary;
}

export interface ConfigurationSummary {
  buildToolsCount: number;
  environmentVariablesCount: number;
  repositoryAccessCount: number;
  hasDockerConfig: boolean;
}

export interface CreateSnapshotRequest {
  name: string;
  description?: string;
  tags?: string[];
  isStable?: boolean;
}

export interface CreateSnapshotResponse {
  snapshotId: string;
  environmentId: string;
  name: string;
  status: 'CREATING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  message: string;
}

export interface ConfigurationHistoryItem {
  changeId: string;
  changeType: 'CREATE' | 'UPDATE' | 'DELETE' | 'ROLLBACK';
  timestamp: string;
  changedBy: string;
  summary: string;
  details?: Record<string, any>;
}

// WebSocket Message Types
export interface WebSocketMessage {
  type: 'STATUS_UPDATE' | 'PROGRESS_UPDATE' | 'ERROR' | 'COMPLETION';
  data: any;
  timestamp: string;
}

export interface StatusUpdateMessage extends WebSocketMessage {
  type: 'STATUS_UPDATE';
  data: {
    environmentId: string;
    status: string;
    message?: string;
  };
}

export interface ProgressUpdateMessage extends WebSocketMessage {
  type: 'PROGRESS_UPDATE';
  data: {
    operationId: string;
    progress: number;
    currentStep?: string;
    totalSteps?: number;
  };
}

// UI State Types
export interface DashboardState {
  environments: BuildEnvironmentDetails[];
  selectedEnvironmentId?: string;
  isLoading: boolean;
  error?: string;
}

export interface FilterOptions {
  status?: string[];
  toolType?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  searchTerm?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Form Types
export interface EnvironmentFormData {
  environmentName: string;
  buildTools: BuildToolConfig[];
  environmentVariables: Record<string, string>;
  dockerConfig?: DockerConfig;
  repositoryAccess: RepositoryAccessConfig[];
}

export interface RepositoryFormData {
  repositoryUrl: string;
  authenticationType: 'TOKEN' | 'SSH_KEY' | 'USERNAME_PASSWORD';
  credentials: RepositoryCredentials;
  accessLevel: 'READ' | 'WRITE' | 'ADMIN';
}

export interface ToolInstallFormData {
  toolType: 'maven' | 'gradle' | 'npm' | 'docker' | 'nodejs' | 'java';
  version: string;
  installationPath?: string;
  setAsDefault: boolean;
  configuration: Record<string, any>;
}
