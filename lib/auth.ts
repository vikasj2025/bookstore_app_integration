import Cookies from 'js-cookie';
import { jwtVerify, SignJWT } from 'jose';
import { AuthenticationResponse, TokenValidationResponse, UserInfo } from '@/types/auth';
import apiClient from './api-client';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_INFO_KEY = 'user_info';
const SESSION_ID_KEY = 'session_id';

// JWT secret for client-side validation (should match server)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

/**
 * Get access token from cookies
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return Cookies.get(ACCESS_TOKEN_KEY) || null;
}

/**
 * Get refresh token from cookies
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return Cookies.get(REFRESH_TOKEN_KEY) || null;
}

/**
 * Get user info from localStorage
 */
export function getUserInfo(): UserInfo | null {
  if (typeof window === 'undefined') return null;
  const userInfo = localStorage.getItem(USER_INFO_KEY);
  return userInfo ? JSON.parse(userInfo) : null;
}

/**
 * Get session ID from cookies
 */
export function getSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  return Cookies.get(SESSION_ID_KEY) || null;
}

/**
 * Store authentication data
 */
export function storeAuthData(authResponse: AuthenticationResponse): void {
  if (typeof window === 'undefined') return;

  // Store tokens in secure cookies
  const cookieOptions = {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    expires: new Date(Date.now() + authResponse.expiresIn * 1000),
  };

  Cookies.set(ACCESS_TOKEN_KEY, authResponse.accessToken, cookieOptions);
  Cookies.set(REFRESH_TOKEN_KEY, authResponse.refreshToken, {
    ...cookieOptions,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });
  Cookies.set(SESSION_ID_KEY, authResponse.sessionId, cookieOptions);

  // Store user info in localStorage
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(authResponse.user));
}

/**
 * Clear authentication data
 */
export function clearAuthData(): void {
  if (typeof window === 'undefined') return;

  Cookies.remove(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
  Cookies.remove(SESSION_ID_KEY);
  localStorage.removeItem(USER_INFO_KEY);
}

/**
 * Validate JWT token
 */
export async function validateToken(token?: string): Promise<TokenValidationResponse> {
  const tokenToValidate = token || getAccessToken();
  
  if (!tokenToValidate) {
    return { valid: false };
  }

  try {
    // Client-side JWT validation
    const { payload } = await jwtVerify(tokenToValidate, JWT_SECRET);
    
    // Additional server-side validation
    const response = await apiClient.post<TokenValidationResponse>('/auth/tokens/validate', {
      token: tokenToValidate,
    });

    return response;
  } catch (error) {
    console.error('Token validation failed:', error);
    return { valid: false };
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await apiClient.post('/auth/tokens/refresh', {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken, expiresIn } = response;

    // Update stored tokens
    const cookieOptions = {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      expires: new Date(Date.now() + expiresIn * 1000),
    };

    Cookies.set(ACCESS_TOKEN_KEY, accessToken, cookieOptions);
    Cookies.set(REFRESH_TOKEN_KEY, newRefreshToken, {
      ...cookieOptions,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return accessToken;
  } catch (error) {
    console.error('Token refresh failed:', error);
    clearAuthData();
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = getAccessToken();
  
  if (!token) {
    return false;
  }

  const validation = await validateToken(token);
  return validation.valid;
}

/**
 * Get current user
 */
export function getCurrentUser(): UserInfo | null {
  return getUserInfo();
}

/**
 * Check if user has required role
 */
export function hasRole(requiredRole: string): boolean {
  const user = getCurrentUser();
  return user?.roles?.includes(requiredRole) || false;
}

/**
 * Check if user has required permission
 */
export function hasPermission(requiredPermission: string): boolean {
  const user = getCurrentUser();
  return user?.permissions?.includes(requiredPermission) || false;
}

/**
 * Check if user has any of the required roles
 */
export function hasAnyRole(requiredRoles: string[]): boolean {
  const user = getCurrentUser();
  if (!user?.roles) return false;
  
  return requiredRoles.some(role => user.roles.includes(role));
}

/**
 * Check if user has any of the required permissions
 */
export function hasAnyPermission(requiredPermissions: string[]): boolean {
  const user = getCurrentUser();
  if (!user?.permissions) return false;
  
  return requiredPermissions.some(permission => user.permissions.includes(permission));
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  const sessionId = getSessionId();
  
  try {
    if (sessionId) {
      await apiClient.delete(`/session/${sessionId}`);
    }
  } catch (error) {
    console.error('Logout API call failed:', error);
  } finally {
    clearAuthData();
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }
}
