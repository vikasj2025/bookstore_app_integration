// Session management types

export interface SessionCreateRequest {
  userId: string;
  userAgent?: string;
  ipAddress?: string;
  context?: Record<string, any>;
}

export interface SessionResponse {
  sessionId: string;
  userId: string;
  createdAt: string;
  lastAccessedAt: string;
  expiresAt: string;
  context?: Record<string, any>;
  isActive: boolean;
}

export interface SessionUpdateRequest {
  context?: Record<string, any>;
  extendExpiration?: boolean;
}

// Migration and feature flag types
export interface FeatureFlagsResponse {
  enableNextjsRedirect: boolean;
  enableJspCompatibility: boolean;
  gradualRolloutPercentage: number;
  migrationPhase: 'preparation' | 'pilot' | 'rollout' | 'complete';
}

export interface CompatibilityCheckRequest {
  systemType: 'jsp' | 'nextjs';
  version: string;
  features?: string[];
}

export interface CompatibilityCheckResponse {
  compatible: boolean;
  issues?: {
    feature: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
  }[];
  recommendedActions?: string[];
}
