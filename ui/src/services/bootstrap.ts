import { apiClient, withRetry } from './api';
import {
  BootstrapRequest,
  BootstrapResponse,
  BootstrapStatus,
  ConfigDiscoveryRequest,
  ConfigDiscoveryResponse,
  ConfigurationTemplatesResponse,
  VerificationRequest,
  VerificationResponse,
} from '@/types/api';

export class BootstrapService {
  /**
   * Initialize Maven wrapper bootstrap
   */
  async initializeBootstrap(request: BootstrapRequest): Promise<BootstrapResponse> {
    return withRetry(() => 
      apiClient.post<BootstrapResponse>('/bootstrap', request)
    );
  }

  /**
   * Get bootstrap operation status
   */
  async getBootstrapStatus(bootstrapId: string): Promise<BootstrapStatus> {
    return withRetry(() => 
      apiClient.get<BootstrapStatus>(`/bootstrap/${bootstrapId}/status`)
    );
  }

  /**
   * Discover project configuration
   */
  async discoverConfiguration(request: ConfigDiscoveryRequest): Promise<ConfigDiscoveryResponse> {
    return withRetry(() => 
      apiClient.post<ConfigDiscoveryResponse>('/configuration/discovery', request)
    );
  }

  /**
   * Get available configuration templates
   */
  async getConfigurationTemplates(filters?: {
    type?: string;
    version?: string;
  }): Promise<ConfigurationTemplatesResponse> {
    return withRetry(() => 
      apiClient.get<ConfigurationTemplatesResponse>('/configuration', filters)
    );
  }

  /**
   * Download Maven wrapper
   */
  async downloadMavenWrapper(params: {
    version: string;
    platform: 'windows' | 'linux' | 'macos';
    checksum?: boolean;
  }): Promise<Blob> {
    return withRetry(() => 
      apiClient.downloadFile('/downloads/maven-wrapper', params)
    );
  }

  /**
   * Verify download integrity
   */
  async verifyDownload(request: VerificationRequest): Promise<VerificationResponse> {
    return withRetry(() => 
      apiClient.post<VerificationResponse>('/downloads/verify', request)
    );
  }

  /**
   * Poll bootstrap status until completion
   */
  async pollBootstrapStatus(
    bootstrapId: string,
    onUpdate?: (status: BootstrapStatus) => void,
    pollInterval: number = 2000
  ): Promise<BootstrapStatus> {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const status = await this.getBootstrapStatus(bootstrapId);
          
          if (onUpdate) {
            onUpdate(status);
          }
          
          if (status.status === 'completed' || status.status === 'failed') {
            resolve(status);
            return;
          }
          
          setTimeout(poll, pollInterval);
        } catch (error) {
          reject(error);
        }
      };
      
      poll();
    });
  }

  /**
   * Create a complete bootstrap workflow
   */
  async bootstrapProject(
    request: BootstrapRequest,
    onStatusUpdate?: (status: BootstrapStatus) => void
  ): Promise<BootstrapStatus> {
    // Step 1: Initialize bootstrap
    const initResponse = await this.initializeBootstrap(request);
    
    // Step 2: Poll for completion
    const finalStatus = await this.pollBootstrapStatus(
      initResponse.bootstrapId,
      onStatusUpdate
    );
    
    return finalStatus;
  }

  /**
   * Get platform-specific download parameters
   */
  getPlatformParams(): { platform: 'windows' | 'linux' | 'macos' } {
    if (typeof window === 'undefined') {
      return { platform: 'linux' }; // Default for SSR
    }
    
    const userAgent = window.navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('win')) {
      return { platform: 'windows' };
    } else if (userAgent.includes('mac')) {
      return { platform: 'macos' };
    } else {
      return { platform: 'linux' };
    }
  }

  /**
   * Validate Maven version format
   */
  validateMavenVersion(version: string): boolean {
    const versionPattern = /^[0-9]+\.[0-9]+\.[0-9]+$/;
    return versionPattern.test(version);
  }

  /**
   * Get recommended Maven version based on project type
   */
  getRecommendedMavenVersion(projectType?: string): string {
    const recommendations: Record<string, string> = {
      'spring-boot': '3.9.6',
      'web-app': '3.9.6',
      'library': '3.8.8',
      'microservice': '3.9.6',
    };
    
    return recommendations[projectType || 'web-app'] || '3.9.6';
  }
}

// Export singleton instance
export const bootstrapService = new BootstrapService();
