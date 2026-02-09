/**
 * Authentication Service for the Online Bookstore Application
 * Handles user authentication, token management, and session state
 */

import {
  LoginRequest,
  UserRegistrationRequest,
  AuthResponse,
  UserInfo,
  RefreshTokenRequest,
} from '@/types/api';
import { ApiClient } from '@/services/api/client';
import { StorageService } from '@/services/storage';
import { LoggerService } from '@/services/logger';
import { appConfig, apiEndpoints } from '@/config/app';

export class AuthService {
  private apiClient: ApiClient;
  private storage: StorageService;
  private logger: LoggerService;
  private currentUser: UserInfo | null = null;
  private authStateListeners: Array<(user: UserInfo | null) => void> = [];

  constructor(
    apiClient: ApiClient,
    storage: StorageService,
    logger: LoggerService
  ) {
    this.apiClient = apiClient;
    this.storage = storage;
    this.logger = logger.createChild('AuthService');
    this.initializeAuth();
  }

  /**
   * Initialize authentication state from storage
   */
  private initializeAuth(): void {
    try {
      const storedUser = this.storage.getLocalJSON<UserInfo>(appConfig.auth.userStorageKey);
      const token = this.storage.getLocal(appConfig.auth.tokenStorageKey);

      if (storedUser && token) {
        this.currentUser = storedUser;
        this.apiClient.setAuthToken(token);
        this.logger.info('Authentication state restored from storage');
      }
    } catch (error) {
      this.logger.error('Failed to initialize auth state:', error);
      this.clearAuthState();
    }
  }

  /**
   * Login user with email and password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      this.logger.info('Attempting user login');
      
      const response = await this.apiClient.post<AuthResponse>(
        apiEndpoints.auth.login,
        credentials
      );

      await this.handleAuthSuccess(response);
      this.logger.info('User login successful');
      
      return response;
    } catch (error) {
      this.logger.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Register new user
   */
  async register(userData: UserRegistrationRequest): Promise<AuthResponse> {
    try {
      this.logger.info('Attempting user registration');
      
      const response = await this.apiClient.post<AuthResponse>(
        apiEndpoints.auth.register,
        userData
      );

      await this.handleAuthSuccess(response);
      this.logger.info('User registration successful');
      
      return response;
    } catch (error) {
      this.logger.error('Registration failed:', error);
      throw error;
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = this.storage.getLocal(appConfig.auth.refreshTokenStorageKey);
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      this.logger.info('Refreshing authentication token');
      
      const request: RefreshTokenRequest = { refreshToken };
      const response = await this.apiClient.post<AuthResponse>(
        apiEndpoints.auth.refresh,
        request
      );

      await this.handleAuthSuccess(response);
      this.logger.info('Token refresh successful');
      
      return response;
    } catch (error) {
      this.logger.error('Token refresh failed:', error);
      await this.logout();
      throw error;
    }
  }

  /**
   * Logout user and clear authentication state
   */
  async logout(): Promise<void> {
    try {
      this.logger.info('Logging out user');
      
      // Try to notify the server about logout (optional)
      try {
        await this.apiClient.post(apiEndpoints.auth.logout);
      } catch (error) {
        // Ignore logout API errors, still proceed with local cleanup
        this.logger.warn('Server logout failed, proceeding with local cleanup:', error);
      }

      this.clearAuthState();
      this.logger.info('User logout successful');
    } catch (error) {
      this.logger.error('Logout failed:', error);
      // Still clear local state even if server logout fails
      this.clearAuthState();
    }
  }

  /**
   * Handle successful authentication
   */
  private async handleAuthSuccess(response: AuthResponse): Promise<void> {
    const { accessToken, refreshToken, user } = response;

    // Store tokens and user info
    this.storage.setLocal(appConfig.auth.tokenStorageKey, accessToken);
    this.storage.setLocal(appConfig.auth.refreshTokenStorageKey, refreshToken);
    this.storage.setLocalJSON(appConfig.auth.userStorageKey, user);

    // Update API client with new token
    this.apiClient.setAuthToken(accessToken);

    // Update current user state
    this.currentUser = user;

    // Notify listeners
    this.notifyAuthStateChange(user);
  }

  /**
   * Clear authentication state
   */
  private clearAuthState(): void {
    // Clear stored data
    this.storage.removeLocal(appConfig.auth.tokenStorageKey);
    this.storage.removeLocal(appConfig.auth.refreshTokenStorageKey);
    this.storage.removeLocal(appConfig.auth.userStorageKey);

    // Clear API client token
    this.apiClient.clearAuthToken();

    // Update current user state
    this.currentUser = null;

    // Notify listeners
    this.notifyAuthStateChange(null);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.currentUser && this.apiClient.isAuthenticated();
  }

  /**
   * Get current user information
   */
  getCurrentUser(): UserInfo | null {
    return this.currentUser;
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.storage.getLocal(appConfig.auth.tokenStorageKey);
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  /**
   * Subscribe to authentication state changes
   */
  onAuthStateChange(callback: (user: UserInfo | null) => void): () => void {
    this.authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners about auth state change
   */
  private notifyAuthStateChange(user: UserInfo | null): void {
    this.authStateListeners.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        this.logger.error('Error in auth state listener:', error);
      }
    });
  }

  /**
   * Validate token expiration
   */
  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      this.logger.error('Failed to decode token:', error);
      return true;
    }
  }

  /**
   * Get time until token expires (in seconds)
   */
  getTokenExpirationTime(): number {
    const token = this.getAccessToken();
    if (!token) return 0;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return Math.max(0, payload.exp - currentTime);
    } catch (error) {
      this.logger.error('Failed to decode token:', error);
      return 0;
    }
  }

  /**
   * Setup automatic token refresh
   */
  setupTokenRefresh(): void {
    const refreshInterval = setInterval(async () => {
      if (this.isAuthenticated()) {
        const timeUntilExpiry = this.getTokenExpirationTime();
        
        // Refresh token when it's about to expire (5 minutes before)
        if (timeUntilExpiry <= 300) {
          try {
            await this.refreshToken();
          } catch (error) {
            this.logger.error('Automatic token refresh failed:', error);
            clearInterval(refreshInterval);
          }
        }
      } else {
        clearInterval(refreshInterval);
      }
    }, 60000); // Check every minute
  }

  /**
   * Validate user session
   */
  async validateSession(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      // Make a simple authenticated request to validate session
      await this.apiClient.get('/user/profile');
      return true;
    } catch (error) {
      this.logger.warn('Session validation failed:', error);
      await this.logout();
      return false;
    }
  }
}
