import { apiClient, withRetry } from './api';
import {
  CacheStatusResponse,
  CacheInvalidationRequest,
  CacheInvalidationResponse,
  HealthResponse,
  MetricsResponse,
  BuildMonitoringResponse,
  FilterParams,
  PaginationParams,
} from '@/types/api';

export class MonitoringService {
  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<HealthResponse> {
    return apiClient.get<HealthResponse>('/monitoring/health');
  }

  /**
   * Get service metrics
   */
  async getMetrics(params?: {
    timeRange?: '1h' | '24h' | '7d' | '30d';
    metrics?: ('downloads' | 'bootstrap_operations' | 'cache_hits' | 'response_times')[];
  }): Promise<MetricsResponse> {
    return withRetry(() => 
      apiClient.get<MetricsResponse>('/monitoring/metrics', params)
    );
  }

  /**
   * Get build monitoring data
   */
  async getBuildMonitoring(params?: {
    projectId?: string;
    status?: 'running' | 'completed' | 'failed' | 'pending';
    limit?: number;
  }): Promise<BuildMonitoringResponse> {
    return withRetry(() => 
      apiClient.get<BuildMonitoringResponse>('/monitoring/builds', params)
    );
  }

  /**
   * Get cache status
   */
  async getCacheStatus(): Promise<CacheStatusResponse> {
    return withRetry(() => 
      apiClient.get<CacheStatusResponse>('/cache/status')
    );
  }

  /**
   * Invalidate cache entries
   */
  async invalidateCache(request: CacheInvalidationRequest): Promise<CacheInvalidationResponse> {
    return withRetry(() => 
      apiClient.post<CacheInvalidationResponse>('/cache/invalidate', request)
    );
  }

  /**
   * Get real-time metrics with polling
   */
  async pollMetrics(
    onUpdate: (metrics: MetricsResponse) => void,
    params?: {
      timeRange?: '1h' | '24h' | '7d' | '30d';
      metrics?: ('downloads' | 'bootstrap_operations' | 'cache_hits' | 'response_times')[];
    },
    pollInterval: number = 30000
  ): Promise<() => void> {
    let isPolling = true;
    
    const poll = async () => {
      if (!isPolling) return;
      
      try {
        const metrics = await this.getMetrics(params);
        onUpdate(metrics);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
      
      if (isPolling) {
        setTimeout(poll, pollInterval);
      }
    };
    
    // Start polling
    poll();
    
    // Return cleanup function
    return () => {
      isPolling = false;
    };
  }

  /**
   * Get build monitoring with real-time updates
   */
  async pollBuildMonitoring(
    onUpdate: (builds: BuildMonitoringResponse) => void,
    params?: {
      projectId?: string;
      status?: 'running' | 'completed' | 'failed' | 'pending';
      limit?: number;
    },
    pollInterval: number = 5000
  ): Promise<() => void> {
    let isPolling = true;
    
    const poll = async () => {
      if (!isPolling) return;
      
      try {
        const builds = await this.getBuildMonitoring(params);
        onUpdate(builds);
      } catch (error) {
        console.error('Failed to fetch build monitoring data:', error);
      }
      
      if (isPolling) {
        setTimeout(poll, pollInterval);
      }
    };
    
    // Start polling
    poll();
    
    // Return cleanup function
    return () => {
      isPolling = false;
    };
  }

  /**
   * Get system health with continuous monitoring
   */
  async pollHealthStatus(
    onUpdate: (health: HealthResponse) => void,
    onError?: (error: Error) => void,
    pollInterval: number = 10000
  ): Promise<() => void> {
    let isPolling = true;
    
    const poll = async () => {
      if (!isPolling) return;
      
      try {
        const health = await this.getHealthStatus();
        onUpdate(health);
      } catch (error) {
        console.error('Health check failed:', error);
        if (onError) {
          onError(error as Error);
        }
      }
      
      if (isPolling) {
        setTimeout(poll, pollInterval);
      }
    };
    
    // Start polling
    poll();
    
    // Return cleanup function
    return () => {
      isPolling = false;
    };
  }

  /**
   * Calculate cache efficiency metrics
   */
  calculateCacheEfficiency(cacheStatus: CacheStatusResponse): {
    hitRatePercentage: number;
    memoryUtilization: number;
    efficiency: 'excellent' | 'good' | 'fair' | 'poor';
  } {
    const hitRatePercentage = Math.round(cacheStatus.hitRate * 100);
    const memoryUtilization = cacheStatus.memoryUsage.percentage;
    
    let efficiency: 'excellent' | 'good' | 'fair' | 'poor';
    
    if (hitRatePercentage >= 90 && memoryUtilization < 80) {
      efficiency = 'excellent';
    } else if (hitRatePercentage >= 75 && memoryUtilization < 90) {
      efficiency = 'good';
    } else if (hitRatePercentage >= 60) {
      efficiency = 'fair';
    } else {
      efficiency = 'poor';
    }
    
    return {
      hitRatePercentage,
      memoryUtilization,
      efficiency,
    };
  }

  /**
   * Get build success rate from monitoring data
   */
  calculateBuildSuccessRate(builds: BuildMonitoringResponse): {
    successRate: number;
    totalBuilds: number;
    successfulBuilds: number;
    failedBuilds: number;
  } {
    const totalBuilds = builds.summary.completed + builds.summary.failed;
    const successfulBuilds = builds.summary.completed;
    const failedBuilds = builds.summary.failed;
    const successRate = totalBuilds > 0 ? (successfulBuilds / totalBuilds) * 100 : 0;
    
    return {
      successRate: Math.round(successRate),
      totalBuilds,
      successfulBuilds,
      failedBuilds,
    };
  }

  /**
   * Format metrics for display
   */
  formatMetricValue(value: number, type: 'downloads' | 'bootstrap_operations' | 'cache_hits' | 'response_times'): string {
    switch (type) {
      case 'downloads':
      case 'bootstrap_operations':
      case 'cache_hits':
        return value.toLocaleString();
      case 'response_times':
        return `${value.toFixed(2)}ms`;
      default:
        return value.toString();
    }
  }
}

// Export singleton instance
export const monitoringService = new MonitoringService();
