import { apiClient } from './api-client';
import {
  LoginRequest,
  LoginResponse,
  UserRegistrationRequest,
  UserResponse,
  UpdateUserRequest,
  ApiResponse,
} from '@/types/api';
import Cookies from 'js-cookie';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserResponse | null;
  tokens: AuthTokens | null;
}

export class AuthService {
  private readonly basePath = '/users';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_data';
  private readonly TOKEN_EXPIRY_KEY = 'token_expiry';

  /**
   * Register a new user
   */
  async register(userData: UserRegistrationRequest): Promise<ApiResponse<UserResponse>> {
    const response = await apiClient.post<UserResponse>(`${this.basePath}/register`, userData);
    return response;
  }

  /**
   * Login user with email and password
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<LoginResponse>(`${this.basePath}/login`, credentials);
    
    if (response.data) {
      this.storeAuthData(response.data);
    }
    
    return response;
  }

  /**
   * Logout user and clear stored data
   */
  async logout(): Promise<void> {
    try {
      // Optional: Call logout endpoint if available
      // await apiClient.post('/users/logout');
    } catch (error) {
      console.warn('Logout endpoint failed:', error);
    } finally {
      this.clearAuthData();
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<ApiResponse<UserResponse>> {
    const response = await apiClient.get<UserResponse>(`${this.basePath}/profile`);
    
    if (response.data) {
      this.storeUserData(response.data);
    }
    
    return response;
  }

  /**
   * Update user profile
   */
  async updateProfile(userData: UpdateUserRequest): Promise<ApiResponse<UserResponse>> {
    const response = await apiClient.put<UserResponse>(`${this.basePath}/profile`, userData);
    
    if (response.data) {
      this.storeUserData(response.data);
    }
    
    return response;
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<ApiResponse<LoginResponse>> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<LoginResponse>('/auth/refresh', {
      refreshToken,
    });
    
    if (response.data) {
      this.storeAuthData(response.data);
    }
    
    return response;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const expiry = this.getTokenExpiry();
    
    if (!token || !expiry) {
      return false;
    }
    
    // Check if token is expired (with 5-minute buffer)
    const now = Date.now();
    const expiryTime = new Date(expiry).getTime();
    const bufferTime = 5 * 60 * 1000; // 5 minutes
    
    return now < (expiryTime - bufferTime);
  }

  /**
   * Get current user data from storage
   */
  getCurrentUser(): UserResponse | null {
    if (typeof window === 'undefined') {
      return null;
    }
    
    const userData = localStorage.getItem(this.USER_KEY);
    
    if (userData) {
      try {
        return JSON.parse(userData) as UserResponse;
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem(this.USER_KEY);
      }
    }
    
    return null;
  }

  /**
   * Get access token from storage
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    
    // Try localStorage first, then cookies
    return localStorage.getItem(this.TOKEN_KEY) || Cookies.get(this.TOKEN_KEY) || null;
  }

  /**
   * Get refresh token from storage
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    
    return localStorage.getItem(this.REFRESH_TOKEN_KEY) || Cookies.get(this.REFRESH_TOKEN_KEY) || null;
  }

  /**
   * Get token expiry time
   */
  getTokenExpiry(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    
    return localStorage.getItem(this.TOKEN_EXPIRY_KEY);
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: 'USER' | 'ADMIN'): boolean {
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
   * Get current auth state
   */
  getAuthState(): AuthState {
    const user = this.getCurrentUser();
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    const expiry = this.getTokenExpiry();
    
    const tokens = accessToken && refreshToken && expiry ? {
      accessToken,
      refreshToken,
      expiresIn: new Date(expiry).getTime(),
    } : null;
    
    return {
      isAuthenticated: this.isAuthenticated(),
      user,
      tokens,
    };
  }

  /**
   * Store authentication data
   */
  private storeAuthData(loginResponse: LoginResponse): void {
    if (typeof window === 'undefined') {
      return;
    }
    
    const { accessToken, refreshToken, expiresIn, user } = loginResponse;
    
    // Calculate expiry time
    const expiryTime = new Date(Date.now() + (expiresIn * 1000)).toISOString();
    
    // Store in localStorage
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    
    // Also store in secure cookies for SSR
    const cookieOptions = {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      expires: new Date(Date.now() + (expiresIn * 1000)),
    };
    
    Cookies.set(this.TOKEN_KEY, accessToken, cookieOptions);
    Cookies.set(this.REFRESH_TOKEN_KEY, refreshToken, {
      ...cookieOptions,
      expires: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)), // 7 days
    });
    
    // Update API client token
    apiClient.setAuthToken(accessToken);
  }

  /**
   * Store user data only
   */
  private storeUserData(user: UserResponse): void {
    if (typeof window === 'undefined') {
      return;
    }
    
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Clear all authentication data
   */
  private clearAuthData(): void {
    if (typeof window === 'undefined') {
      return;
    }
    
    // Clear localStorage
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    // Clear cookies
    Cookies.remove(this.TOKEN_KEY);
    Cookies.remove(this.REFRESH_TOKEN_KEY);
    
    // Clear API client token
    apiClient.clearAuth();
  }

  /**
   * Validate registration data
   */
  validateRegistrationData(userData: UserRegistrationRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userData.email || !emailRegex.test(userData.email)) {
      errors.push('Valid email is required');
    }
    
    // Password validation
    if (!userData.password || userData.password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (userData.password && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(userData.password)) {
      errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number');
    }
    
    // Name validation
    if (!userData.firstName || userData.firstName.trim().length === 0) {
      errors.push('First name is required');
    }
    
    if (!userData.lastName || userData.lastName.trim().length === 0) {
      errors.push('Last name is required');
    }
    
    // Phone number validation (optional)
    if (userData.phoneNumber) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(userData.phoneNumber)) {
        errors.push('Invalid phone number format');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate login data
   */
  validateLoginData(credentials: LoginRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!credentials.email || credentials.email.trim().length === 0) {
      errors.push('Email is required');
    }
    
    if (!credentials.password || credentials.password.trim().length === 0) {
      errors.push('Password is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Create singleton instance
export const authService = new AuthService();
export default authService;
