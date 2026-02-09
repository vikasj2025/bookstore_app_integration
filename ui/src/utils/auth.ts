/**
 * Authentication utilities
 */

/**
 * Get authentication token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

/**
 * Set authentication token in localStorage
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('accessToken', token);
}

/**
 * Remove authentication token from localStorage
 */
export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  return !!token && !isTokenExpired(token);
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
}

/**
 * Decode JWT token payload
 */
export function decodeToken(token: string): any {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    return null;
  }
}

/**
 * Get user role from token
 */
export function getUserRole(): string | null {
  const token = getAuthToken();
  if (!token) return null;
  
  const payload = decodeToken(token);
  return payload?.role || null;
}

/**
 * Check if user has specific role
 */
export function hasRole(role: string): boolean {
  const userRole = getUserRole();
  return userRole === role;
}

/**
 * Check if user is admin
 */
export function isAdmin(): boolean {
  return hasRole('ADMIN');
}
