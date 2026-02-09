import { api } from '@/lib/api-client';
import {
  AuthResponse,
  LoginRequest,
  RefreshTokenRequest,
  UserRegistrationRequest,
  UserProfileResponse,
  UpdateUserProfileRequest,
  SuccessResponse,
} from '@/types';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: UserRegistrationRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  }

  /**
   * Login user with email and password
   */
  static async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  }

  /**
   * Refresh JWT token using refresh token
   */
  static async refreshToken(data: RefreshTokenRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/refresh', data);
    return response.data;
  }

  /**
   * Logout user and invalidate tokens
   */
  static async logout(): Promise<SuccessResponse> {
    const response = await api.post<SuccessResponse>('/auth/logout');
    return response.data;
  }

  /**
   * Get current user profile
   */
  static async getProfile(): Promise<UserProfileResponse> {
    const response = await api.get<UserProfileResponse>('/users/profile');
    return response.data;
  }

  /**
   * Update user profile
   */
  static async updateProfile(data: UpdateUserProfileRequest): Promise<UserProfileResponse> {
    const response = await api.put<UserProfileResponse>('/users/profile', data);
    return response.data;
  }

  /**
   * Validate token by checking if it's expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  /**
   * Get token expiration time
   */
  static getTokenExpiration(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch {
      return null;
    }
  }

  /**
   * Check if user has admin role
   */
  static hasAdminRole(user: UserProfileResponse): boolean {
    return user.role === 'ADMIN';
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default AuthService;
