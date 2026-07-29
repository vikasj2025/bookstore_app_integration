// Navigation and redirect related types

export interface RedirectTargetRequest {
  intendedDestination?: string;
  userContext?: {
    userId: string;
    roles: string[];
    permissions: string[];
  };
  sessionId?: string;
}

export interface RedirectTargetResponse {
  redirectUrl: string;
  redirectType: 'permanent' | 'temporary' | 'conditional';
  statusCode: 302 | 307 | 308;
  context?: Record<string, any>;
}

export interface NavigationContext {
  intendedDestination?: string;
  returnUrl?: string;
  state?: string;
  timestamp?: string;
}

// Next.js specific types for server-side redirects
export interface ServerSideRedirect {
  destination: string;
  permanent?: boolean;
  statusCode?: 302 | 307 | 308;
}

export interface RedirectOptions {
  permanent?: boolean;
  statusCode?: 302 | 307 | 308;
  preserveQuery?: boolean;
}

// Route protection types
export interface RouteProtection {
  requireAuth: boolean;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  redirectTo?: string;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  protection: RouteProtection;
  fallback?: React.ReactNode;
}
