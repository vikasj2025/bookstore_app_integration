import { httpClient } from '@/lib/http-client';
import {
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  AuthResponse,
  UserProfile,
} from '@/types/api';
import { removeAuthToken, setAuthToken, getAuthToken } from '@/utils/auth';

/**
 * Authentication Service
 * Handles user authentication, registration, and session management
 */
export class AuthService {
  private static readonly TOKEN_KEY = 'accessToken';
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private static readonly USER_KEY = 'user';

  /**
   * Login user with email and password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await httpClient.post<AuthResponse>('/auth/login', credentials);
      
      // Store tokens and user data
      this.storeAuthData(response);
      
      return response;
    } catch (error) {
      throw this.handleAuthError(error, 'Login failed');
    }
  }

  /**
   * Register new user account
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await httpClient.post<AuthResponse>('/auth/register', userData);
      
      // Store tokens and user data
      this.storeAuthData(response);
      
      return response;
    } catch (error) {
      throw this.handleAuthError(error, 'Registration failed');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await httpClient.post<AuthResponse>('/auth/refresh', {
        refreshToken,
      } as RefreshTokenRequest);
      
      // Update stored tokens
      this.storeAuthData(response);
      
      return response;
    } catch (error) {
      // If refresh fails, clear all auth data
      this.logout();
      throw this.handleAuthError(error, 'Session expired');
    }
  }

  /**
   * Logout user and clear session data
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate tokens on server
      await httpClient.post('/auth/logout');
    } catch (error) {
      // Continue with local logout even if server call fails
      console.warn('Logout endpoint failed:', error);
    } finally {
      // Always clear local auth data
      this.clearAuthData();
    }
  }

  /**
   * Get current user profile
   */
  getCurrentUser(): UserProfile | null {
    try {
      const userData = localStorage.getItem(AuthService.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const user = this.getCurrentUser();
    
    return !!(token && user);
  }

  /**
   * Check if current access token is expired
   */
  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    
    if (!token) return true;
    
    try {
      // Decode JWT payload (basic check without verification)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  /**
   * Get access token from storage
   */
  getAccessToken(): string | null {
    return localStorage.getItem(AuthService.TOKEN_KEY);
  }

  /**
   * Get refresh token from storage
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(AuthService.REFRESH_TOKEN_KEY);
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  /**
   * Store authentication data in localStorage
   */
  private storeAuthData(authResponse: AuthResponse): void {
    localStorage.setItem(AuthService.TOKEN_KEY, authResponse.accessToken);
    localStorage.setItem(AuthService.REFRESH_TOKEN_KEY, authResponse.refreshToken);
    localStorage.setItem(AuthService.USER_KEY, JSON.stringify(authResponse.user));
    
    // Set token in HTTP client
    setAuthToken(authResponse.accessToken);
  }

  /**
   * Clear all authentication data
   */
  private clearAuthData(): void {
    localStorage.removeItem(AuthService.TOKEN_KEY);
    localStorage.removeItem(AuthService.REFRESH_TOKEN_KEY);
    localStorage.removeItem(AuthService.USER_KEY);
    
    // Remove token from HTTP client
    removeAuthToken();
  }

  /**
   * Handle authentication errors with user-friendly messages
   */
  private handleAuthError(error: any, defaultMessage: string): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    
    if (error.response?.data?.validationErrors) {
      const validationError = error.response.data.validationErrors[0];
      return new Error(validationError.message || defaultMessage);
    }
    
    return new Error(error.message || defaultMessage);
  }

  /**
   * Initialize auth service - check for existing session
   */
  initialize(): void {
    const token = this.getAccessToken();
    
    if (token) {
      if (this.isTokenExpired()) {
        // Try to refresh token
        this.refreshToken().catch(() => {
          // If refresh fails, clear auth data
          this.clearAuthData();
        });
      } else {
        // Set token in HTTP client
        setAuthToken(token);
      }
    }
  }

  /**
   * Setup automatic token refresh before expiration
   */
  setupAutoRefresh(): void {
    const token = this.getAccessToken();
    
    if (!token) return;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;
      
      // Refresh token 5 minutes before expiration
      const refreshTime = Math.max(timeUntilExpiration - 5 * 60 * 1000, 0);
      
      if (refreshTime > 0) {
        setTimeout(() => {
          this.refreshToken().catch(() => {
            // If refresh fails, redirect to login
            window.location.href = '/auth/login';
          });
        }, refreshTime);
      }
    } catch (error) {
      console.error('Error setting up auto refresh:', error);
    }
  }
}

// Create and export service instance
export const authService = new AuthService();
export default authService;
