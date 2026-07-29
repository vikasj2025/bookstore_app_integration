// Authentication related types based on API specification

export interface OAuthInitiateRequest {
  clientId: string;
  redirectUri: string;
  state?: string;
  scope?: string;
}

export interface OAuthInitiateResponse {
  authorizationUrl: string;
  state: string;
  expiresIn: number;
}

export interface OAuthCallbackRequest {
  code: string;
  state: string;
  clientId?: string;
}

export interface AuthenticationResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: UserInfo;
  sessionId: string;
}

export interface TokenValidationRequest {
  token: string;
}

export interface TokenValidationResponse {
  valid: boolean;
  user?: UserInfo;
  expiresAt?: string;
  scopes?: string[];
}

export interface TokenRefreshRequest {
  refreshToken: string;
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

export interface UserInfo {
  userId: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
  lastLoginAt?: string;
}

export interface UserContext {
  userId: string;
  roles: string[];
  permissions: string[];
}

// Authentication state for client-side state management
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserInfo | null;
  accessToken: string | null;
  refreshToken: string | null;
  sessionId: string | null;
  error: string | null;
}

export interface AuthActions {
  login: (credentials: OAuthInitiateRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  validateToken: () => Promise<boolean>;
  setUser: (user: UserInfo) => void;
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  clearAuth: () => void;
  setError: (error: string | null) => void;
}

export type AuthStore = AuthState & AuthActions;
