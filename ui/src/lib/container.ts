/**
 * Dependency Injection Container for the Online Bookstore Application
 * Implements a simple service container pattern for managing application dependencies
 */

import { ApiClient } from '@/services/api/client';
import { AuthService } from '@/services/auth';
import { BookService } from '@/services/book';
import { CartService } from '@/services/cart';
import { OrderService } from '@/services/order';
import { UserService } from '@/services/user';
import { NotificationService } from '@/services/notification';
import { StorageService } from '@/services/storage';
import { LoggerService } from '@/services/logger';
import { appConfig } from '@/config/app';

// Service lifetime types
type ServiceLifetime = 'singleton' | 'scoped' | 'transient';

// Service registration interface
interface ServiceRegistration<T = any> {
  factory: () => T;
  lifetime: ServiceLifetime;
  instance?: T;
}

// Service container class
class ServiceContainer {
  private services = new Map<string, ServiceRegistration>();
  private scopedInstances = new Map<string, any>();

  /**
   * Register a service with the container
   */
  register<T>(
    key: string,
    factory: () => T,
    lifetime: ServiceLifetime = 'singleton'
  ): void {
    this.services.set(key, { factory, lifetime });
  }

  /**
   * Resolve a service from the container
   */
  resolve<T>(key: string): T {
    const registration = this.services.get(key);
    if (!registration) {
      throw new Error(`Service '${key}' not found in container`);
    }

    switch (registration.lifetime) {
      case 'singleton':
        if (!registration.instance) {
          registration.instance = registration.factory();
        }
        return registration.instance;

      case 'scoped':
        if (!this.scopedInstances.has(key)) {
          this.scopedInstances.set(key, registration.factory());
        }
        return this.scopedInstances.get(key);

      case 'transient':
        return registration.factory();

      default:
        throw new Error(`Unknown service lifetime: ${registration.lifetime}`);
    }
  }

  /**
   * Clear scoped instances (useful for request/session boundaries)
   */
  clearScoped(): void {
    this.scopedInstances.clear();
  }

  /**
   * Check if a service is registered
   */
  isRegistered(key: string): boolean {
    return this.services.has(key);
  }

  /**
   * Get all registered service keys
   */
  getRegisteredServices(): string[] {
    return Array.from(this.services.keys());
  }
}

// Create the global container instance
const container = new ServiceContainer();

// Service keys constants
export const SERVICE_KEYS = {
  API_CLIENT: 'ApiClient',
  AUTH_SERVICE: 'AuthService',
  BOOK_SERVICE: 'BookService',
  CART_SERVICE: 'CartService',
  ORDER_SERVICE: 'OrderService',
  USER_SERVICE: 'UserService',
  NOTIFICATION_SERVICE: 'NotificationService',
  STORAGE_SERVICE: 'StorageService',
  LOGGER_SERVICE: 'LoggerService',
} as const;

/**
 * Configure and register all application services
 */
export function configureServices(): void {
  // Register core services first (dependencies for other services)
  container.register(
    SERVICE_KEYS.LOGGER_SERVICE,
    () => new LoggerService(appConfig.logging),
    'singleton'
  );

  container.register(
    SERVICE_KEYS.STORAGE_SERVICE,
    () => new StorageService(),
    'singleton'
  );

  container.register(
    SERVICE_KEYS.NOTIFICATION_SERVICE,
    () => new NotificationService(),
    'singleton'
  );

  // Register API client (singleton to prevent socket exhaustion)
  container.register(
    SERVICE_KEYS.API_CLIENT,
    () => {
      const logger = container.resolve<LoggerService>(SERVICE_KEYS.LOGGER_SERVICE);
      return new ApiClient(appConfig.api, logger);
    },
    'singleton'
  );

  // Register business services
  container.register(
    SERVICE_KEYS.AUTH_SERVICE,
    () => {
      const apiClient = container.resolve<ApiClient>(SERVICE_KEYS.API_CLIENT);
      const storage = container.resolve<StorageService>(SERVICE_KEYS.STORAGE_SERVICE);
      const logger = container.resolve<LoggerService>(SERVICE_KEYS.LOGGER_SERVICE);
      return new AuthService(apiClient, storage, logger);
    },
    'singleton'
  );

  container.register(
    SERVICE_KEYS.BOOK_SERVICE,
    () => {
      const apiClient = container.resolve<ApiClient>(SERVICE_KEYS.API_CLIENT);
      const logger = container.resolve<LoggerService>(SERVICE_KEYS.LOGGER_SERVICE);
      return new BookService(apiClient, logger);
    },
    'singleton'
  );

  // Cart service is scoped to user session
  container.register(
    SERVICE_KEYS.CART_SERVICE,
    () => {
      const apiClient = container.resolve<ApiClient>(SERVICE_KEYS.API_CLIENT);
      const storage = container.resolve<StorageService>(SERVICE_KEYS.STORAGE_SERVICE);
      const logger = container.resolve<LoggerService>(SERVICE_KEYS.LOGGER_SERVICE);
      return new CartService(apiClient, storage, logger);
    },
    'scoped'
  );

  container.register(
    SERVICE_KEYS.ORDER_SERVICE,
    () => {
      const apiClient = container.resolve<ApiClient>(SERVICE_KEYS.API_CLIENT);
      const logger = container.resolve<LoggerService>(SERVICE_KEYS.LOGGER_SERVICE);
      return new OrderService(apiClient, logger);
    },
    'singleton'
  );

  container.register(
    SERVICE_KEYS.USER_SERVICE,
    () => {
      const apiClient = container.resolve<ApiClient>(SERVICE_KEYS.API_CLIENT);
      const logger = container.resolve<LoggerService>(SERVICE_KEYS.LOGGER_SERVICE);
      return new UserService(apiClient, logger);
    },
    'singleton'
  );
}

/**
 * Get a service from the container
 */
export function getService<T>(key: string): T {
  return container.resolve<T>(key);
}

/**
 * Convenience functions for commonly used services
 */
export const getApiClient = () => getService<ApiClient>(SERVICE_KEYS.API_CLIENT);
export const getAuthService = () => getService<AuthService>(SERVICE_KEYS.AUTH_SERVICE);
export const getBookService = () => getService<BookService>(SERVICE_KEYS.BOOK_SERVICE);
export const getCartService = () => getService<CartService>(SERVICE_KEYS.CART_SERVICE);
export const getOrderService = () => getService<OrderService>(SERVICE_KEYS.ORDER_SERVICE);
export const getUserService = () => getService<UserService>(SERVICE_KEYS.USER_SERVICE);
export const getNotificationService = () => getService<NotificationService>(SERVICE_KEYS.NOTIFICATION_SERVICE);
export const getStorageService = () => getService<StorageService>(SERVICE_KEYS.STORAGE_SERVICE);
export const getLoggerService = () => getService<LoggerService>(SERVICE_KEYS.LOGGER_SERVICE);

/**
 * Clear scoped services (useful for logout or session changes)
 */
export function clearScopedServices(): void {
  container.clearScoped();
}

/**
 * Initialize the dependency injection container
 * This should be called once at application startup
 */
export function initializeContainer(): void {
  try {
    configureServices();
    
    // Validate that all services can be resolved
    const logger = getLoggerService();
    logger.info('Dependency injection container initialized successfully');
    
    // Log registered services in development
    if (appConfig.app.debug) {
      const registeredServices = container.getRegisteredServices();
      logger.debug('Registered services:', registeredServices);
    }
  } catch (error) {
    console.error('Failed to initialize dependency injection container:', error);
    throw error;
  }
}

// Export the container for advanced use cases
export { container };

// Type definitions for service interfaces
export interface IServiceContainer {
  resolve<T>(key: string): T;
  register<T>(key: string, factory: () => T, lifetime?: ServiceLifetime): void;
  isRegistered(key: string): boolean;
  clearScoped(): void;
}
