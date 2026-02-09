import { Injectable } from '@angular/core';

export interface AppConfig {
  apiBaseUrl: string;
  apiTimeout: number;
  retryAttempts: number;
  enableLogging: boolean;
  enableAnalytics: boolean;
  cacheExpiration: number;
}

/**
 * Configuration Service - Singleton
 * 
 * Manages application configuration for different environments.
 * Provides centralized access to configuration values.
 * 
 * Registered as Singleton for app-wide configuration access.
 */
@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: AppConfig;

  constructor() {
    // Default configuration - would be loaded from environment files
    this.config = {
      apiBaseUrl: 'http://localhost:8080',
      apiTimeout: 30000,
      retryAttempts: 2,
      enableLogging: true,
      enableAnalytics: false,
      cacheExpiration: 300000 // 5 minutes
    };
  }

  getConfig(): AppConfig {
    return this.config;
  }

  get apiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }

  get apiTimeout(): number {
    return this.config.apiTimeout;
  }

  get retryAttempts(): number {
    return this.config.retryAttempts;
  }

  updateConfig(partialConfig: Partial<AppConfig>): void {
    this.config = { ...this.config, ...partialConfig };
  }
}
