import { Injectable, Inject } from '@angular/core';

/**
 * Logging Service - Singleton Utility Service
 * 
 * Provides centralized logging functionality for the entire application.
 * Supports different log levels and environment-specific behavior.
 * 
 * Registered as Singleton for consistent logging across the app.
 */
@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private isProduction: boolean;

  constructor(@Inject('ENVIRONMENT') environment: string) {
    this.isProduction = environment === 'production';
  }

  log(message: string, ...args: any[]): void {
    if (!this.isProduction) {
      console.log(`[LOG] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }

  error(message: string, error?: any): void {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
    // In production, send to error tracking service
    if (this.isProduction) {
      this.sendToErrorTracking(message, error);
    }
  }

  warn(message: string, ...args: any[]): void {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
  }

  info(message: string, ...args: any[]): void {
    console.info(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
  }

  debug(message: string, ...args: any[]): void {
    if (!this.isProduction) {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }

  private sendToErrorTracking(message: string, error: any): void {
    // Integration with error tracking service (e.g., Sentry, LogRocket)
    // This would be implemented based on the chosen error tracking solution
  }
}
