import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import {
  BuildEnvironmentConfigRequest,
  BuildEnvironmentConfigResponse,
  BuildEnvironmentDetails,
  MavenWrapperDownloadRequest,
  MavenWrapperDownloadResponse,
  MavenWrapperStatusResponse,
  RepositoryAccessRequest,
  RepositoryAccessResponse,
  RepositoryValidationResponse,
  BuildToolVersionsResponse,
  BuildToolInstallRequest,
  BuildToolInstallResponse,
  HealthCheckResponse,
  ScheduledHealthCheckRequest,
  ScheduledHealthCheckResponse,
  ConfigurationRollbackRequest,
  ConfigurationRollbackResponse,
  ConfigurationSnapshotsResponse,
  CreateSnapshotRequest,
  CreateSnapshotResponse,
  ErrorResponse,
} from '@/types/api';

class ApiService {
  private client: AxiosInstance;
  private retryCount = 3;
  private retryDelay = 1000; // 1 second

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.buildenvironment.company.com/v1',
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Handle 401 unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          // Handle token refresh or redirect to login
          this.handleUnauthorized();
          return Promise.reject(error);
        }

        // Handle retryable errors (5xx, network errors)
        if (this.shouldRetry(error) && !originalRequest._retryCount) {
          originalRequest._retryCount = 0;
        }

        if (originalRequest._retryCount < this.retryCount && this.shouldRetry(error)) {
          originalRequest._retryCount++;
          await this.delay(this.retryDelay * originalRequest._retryCount);
          return this.client(originalRequest);
        }

        return Promise.reject(this.transformError(error));
      }
    );
  }

  private getAuthToken(): string | null {
    // Get token from localStorage, sessionStorage, or cookies
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    }
    return null;
  }

  private handleUnauthorized(): void {
    // Clear stored tokens and redirect to login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
      // Redirect to login page or emit event
      window.location.href = '/login';
    }
  }

  private shouldRetry(error: AxiosError): boolean {
    if (!error.response) return true; // Network error
    const status = error.response.status;
    return status >= 500 || status === 429; // Server errors or rate limiting
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private transformError(error: AxiosError): Error {
    if (error.response?.data) {
      const errorData = error.response.data as ErrorResponse;
      return new Error(errorData.message || 'An error occurred');
    }
    return new Error(error.message || 'Network error occurred');
  }

  // Maven Wrapper API
  async downloadMavenWrapper(request: MavenWrapperDownloadRequest): Promise<MavenWrapperDownloadResponse> {
    const response = await this.client.post<MavenWrapperDownloadResponse>('/maven-wrapper/download', request);
    return response.data;
  }

  async getMavenWrapperStatus(downloadId: string): Promise<MavenWrapperStatusResponse> {
    const response = await this.client.get<MavenWrapperStatusResponse>(`/maven-wrapper/status/${downloadId}`);
    return response.data;
  }

  // Build Environment API
  async configureBuildEnvironment(request: BuildEnvironmentConfigRequest): Promise<BuildEnvironmentConfigResponse> {
    const response = await this.client.post<BuildEnvironmentConfigResponse>('/build-environment/configure', request);
    return response.data;
  }

  async getBuildEnvironment(environmentId: string): Promise<BuildEnvironmentDetails> {
    const response = await this.client.get<BuildEnvironmentDetails>(`/build-environment/${environmentId}`);
    return response.data;
  }

  async deleteBuildEnvironment(environmentId: string): Promise<void> {
    await this.client.delete(`/build-environment/${environmentId}`);
  }

  async listBuildEnvironments(params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<BuildEnvironmentDetails[]> {
    const response = await this.client.get<BuildEnvironmentDetails[]>('/build-environments', { params });
    return response.data;
  }

  // Repository Access API
  async configureRepositoryAccess(request: RepositoryAccessRequest): Promise<RepositoryAccessResponse> {
    const response = await this.client.post<RepositoryAccessResponse>('/repository-access/configure', request);
    return response.data;
  }

  async validateRepositoryAccess(accessId: string): Promise<RepositoryValidationResponse> {
    const response = await this.client.post<RepositoryValidationResponse>(`/repository-access/${accessId}/validate`);
    return response.data;
  }

  // Build Tools API
  async getBuildToolVersions(toolType?: string): Promise<BuildToolVersionsResponse> {
    const params = toolType ? { toolType } : undefined;
    const response = await this.client.get<BuildToolVersionsResponse>('/build-tools/versions', { params });
    return response.data;
  }

  async installBuildTool(request: BuildToolInstallRequest): Promise<BuildToolInstallResponse> {
    const response = await this.client.post<BuildToolInstallResponse>('/build-tools/install', request);
    return response.data;
  }

  // Health Check API
  async performHealthCheck(
    environmentId: string,
    checkType?: 'basic' | 'comprehensive' | 'connectivity'
  ): Promise<HealthCheckResponse> {
    const params = checkType ? { checkType } : undefined;
    const response = await this.client.get<HealthCheckResponse>(`/health-check/environment/${environmentId}`, { params });
    return response.data;
  }

  async scheduleHealthChecks(request: ScheduledHealthCheckRequest): Promise<ScheduledHealthCheckResponse> {
    const response = await this.client.post<ScheduledHealthCheckResponse>('/health-check/scheduled', request);
    return response.data;
  }

  // Configuration Rollback API
  async rollbackConfiguration(request: ConfigurationRollbackRequest): Promise<ConfigurationRollbackResponse> {
    const response = await this.client.post<ConfigurationRollbackResponse>('/configuration/rollback', request);
    return response.data;
  }

  async getConfigurationSnapshots(
    environmentId: string,
    limit?: number
  ): Promise<ConfigurationSnapshotsResponse> {
    const params = limit ? { limit } : undefined;
    const response = await this.client.get<ConfigurationSnapshotsResponse>(
      `/configuration/snapshots/${environmentId}`,
      { params }
    );
    return response.data;
  }

  async createConfigurationSnapshot(
    environmentId: string,
    request: CreateSnapshotRequest
  ): Promise<CreateSnapshotResponse> {
    const response = await this.client.post<CreateSnapshotResponse>(
      `/configuration/snapshots/${environmentId}`,
      request
    );
    return response.data;
  }

  // Utility methods
  setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
    }
  }

  // Health check for API connectivity
  async checkApiHealth(): Promise<boolean> {
    try {
      await this.client.get('/health');
      return true;
    } catch {
      return false;
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;

// Export specific methods for easier testing
export {
  ApiService,
};

// Error handling utilities
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};

export const isNetworkError = (error: unknown): boolean => {
  return error instanceof Error && error.message.includes('Network');
};

export const isServerError = (error: AxiosError): boolean => {
  return !!(error.response && error.response.status >= 500);
};

export const isClientError = (error: AxiosError): boolean => {
  return !!(error.response && error.response.status >= 400 && error.response.status < 500);
};
