/**
 * Application configuration and environment variables
 * Centralizes all configuration management for the bookstore application
 */

export const appConfig = {
  // Application metadata
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Online Bookstore',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
    debug: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
  },

  // API configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/v1',
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10),
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // Authentication settings
  auth: {
    accessTokenExpiry: process.env.NEXT_PUBLIC_ACCESS_TOKEN_EXPIRY || '15m',
    refreshTokenExpiry: process.env.NEXT_PUBLIC_REFRESH_TOKEN_EXPIRY || '7d',
    tokenStorageKey: 'bookstore_auth_token',
    refreshTokenStorageKey: 'bookstore_refresh_token',
    userStorageKey: 'bookstore_user',
  },

  // Cache configuration
  cache: {
    duration: parseInt(process.env.NEXT_PUBLIC_CACHE_DURATION || '300000', 10), // 5 minutes
    staleTime: parseInt(process.env.NEXT_PUBLIC_STALE_TIME || '60000', 10), // 1 minute
  },

  // Pagination settings
  pagination: {
    defaultPageSize: parseInt(process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE || '20', 10),
    maxPageSize: parseInt(process.env.NEXT_PUBLIC_MAX_PAGE_SIZE || '100', 10),
  },

  // Shopping cart settings
  cart: {
    maxItems: parseInt(process.env.NEXT_PUBLIC_MAX_CART_ITEMS || '50', 10),
    persistenceDuration: process.env.NEXT_PUBLIC_CART_PERSISTENCE_DURATION || '7d',
    storageKey: 'bookstore_cart',
  },

  // Feature flags
  features: {
    enableMSW: process.env.NEXT_PUBLIC_ENABLE_MSW === 'true',
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    enableErrorReporting: process.env.NEXT_PUBLIC_ENABLE_ERROR_REPORTING === 'true',
    enableServiceWorker: process.env.NEXT_PUBLIC_ENABLE_SW === 'true',
    enableOfflineMode: process.env.NEXT_PUBLIC_ENABLE_OFFLINE_MODE === 'true',
    enableDarkMode: process.env.NEXT_PUBLIC_ENABLE_DARK_MODE === 'true',
  },

  // External services
  services: {
    sentry: {
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    },
    analytics: {
      googleAnalyticsId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
    },
  },

  // Theme configuration
  theme: {
    default: process.env.NEXT_PUBLIC_DEFAULT_THEME || 'light',
    storageKey: 'bookstore_theme',
  },

  // Internationalization
  i18n: {
    defaultLocale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'en',
    supportedLocales: process.env.NEXT_PUBLIC_SUPPORTED_LOCALES?.split(',') || ['en'],
    storageKey: 'bookstore_locale',
  },

  // Security settings
  security: {
    enableCSP: process.env.NEXT_PUBLIC_ENABLE_CSP === 'true',
    allowedOrigins: process.env.NEXT_PUBLIC_ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  },

  // Image configuration
  images: {
    domains: process.env.NEXT_PUBLIC_IMAGE_DOMAINS?.split(',') || [
      'localhost',
      'api.bookstore.com',
      'images.unsplash.com',
    ],
    placeholderUrl: 'https://via.placeholder.com/300x400?text=No+Image',
  },

  // Logging configuration
  logging: {
    level: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info',
    enableConsole: process.env.NEXT_PUBLIC_APP_ENV !== 'production',
  },
} as const;

// Type-safe environment validation
export function validateConfig(): void {
  const requiredEnvVars = [
    'NEXT_PUBLIC_API_BASE_URL',
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
}

// Development mode helpers
export const isDevelopment = appConfig.app.environment === 'development';
export const isProduction = appConfig.app.environment === 'production';
export const isStaging = appConfig.app.environment === 'staging';

// API endpoints configuration
export const apiEndpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },
  books: {
    list: '/books',
    details: (id: string) => `/books/${id}`,
    categories: '/books/categories',
    search: '/books/search',
  },
  cart: {
    get: '/cart',
    add: '/cart/items',
    update: (itemId: string) => `/cart/items/${itemId}`,
    remove: (itemId: string) => `/cart/items/${itemId}`,
    clear: '/cart',
  },
  orders: {
    list: '/orders',
    create: '/orders',
    details: (id: string) => `/orders/${id}`,
    cancel: (id: string) => `/orders/${id}/cancel`,
  },
  user: {
    profile: '/user/profile',
    updateProfile: '/user/profile',
  },
  health: '/health',
} as const;
