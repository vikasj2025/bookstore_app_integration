import { http, HttpResponse } from 'msw';
import {
  OAuthInitiateRequest,
  OAuthInitiateResponse,
  OAuthCallbackRequest,
  AuthenticationResponse,
  TokenValidationRequest,
  TokenValidationResponse,
  TokenRefreshRequest,
  TokenRefreshResponse,
  UserInfo,
} from '@/types/auth';
import {
  RedirectTargetRequest,
  RedirectTargetResponse,
} from '@/types/navigation';
import {
  SessionCreateRequest,
  SessionResponse,
  SessionUpdateRequest,
  FeatureFlagsResponse,
  CompatibilityCheckRequest,
  CompatibilityCheckResponse,
} from '@/types/session';

// Mock user data
const mockUser: UserInfo = {
  userId: 'user-123',
  email: 'john.doe@company.com',
  name: 'John Doe',
  roles: ['user', 'manager'],
  permissions: ['read', 'write', 'delete'],
  lastLoginAt: new Date().toISOString(),
};

// Mock tokens
const mockAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsIm5hbWUiOiJKb2huIERvZSIsInJvbGVzIjpbInVzZXIiLCJtYW5hZ2VyIl0sInBlcm1pc3Npb25zIjpbInJlYWQiLCJ3cml0ZSIsImRlbGV0ZSJdLCJpYXQiOjE2NzAwMDAwMDAsImV4cCI6MTY3MDAwMzYwMH0.mock-signature';
const mockRefreshToken = 'refresh-token-123';
const mockSessionId = 'session-123';

export const handlers = [
  // OAuth Authentication Endpoints
  http.post('/auth/oauth/initiate', async ({ request }) => {
    const body = await request.json() as OAuthInitiateRequest;
    
    const response: OAuthInitiateResponse = {
      authorizationUrl: `https://oauth.provider.com/authorize?client_id=${body.clientId}&redirect_uri=${encodeURIComponent(body.redirectUri)}&state=${body.state}&scope=${body.scope}`,
      state: body.state || 'mock-state',
      expiresIn: 600, // 10 minutes
    };
    
    return HttpResponse.json(response);
  }),

  http.post('/auth/oauth/callback', async ({ request }) => {
    const body = await request.json() as OAuthCallbackRequest;
    
    // Simulate validation
    if (!body.code || body.code === 'invalid') {
      return HttpResponse.json(
        {
          error: 'invalid_grant',
          message: 'Invalid authorization code',
          timestamp: new Date().toISOString(),
          requestId: 'req-123',
        },
        { status: 400 }
      );
    }
    
    const response: AuthenticationResponse = {
      accessToken: mockAccessToken,
      refreshToken: mockRefreshToken,
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: mockUser,
      sessionId: mockSessionId,
    };
    
    return HttpResponse.json(response);
  }),

  // JWT Token Management Endpoints
  http.post('/auth/tokens/validate', async ({ request }) => {
    const body = await request.json() as TokenValidationRequest;
    
    // Simulate token validation
    const isValid = body.token === mockAccessToken;
    
    const response: TokenValidationResponse = {
      valid: isValid,
      user: isValid ? mockUser : undefined,
      expiresAt: isValid ? new Date(Date.now() + 3600000).toISOString() : undefined,
      scopes: isValid ? ['openid', 'profile', 'email'] : undefined,
    };
    
    return HttpResponse.json(response);
  }),

  http.post('/auth/tokens/refresh', async ({ request }) => {
    const body = await request.json() as TokenRefreshRequest;
    
    // Simulate refresh token validation
    if (body.refreshToken !== mockRefreshToken) {
      return HttpResponse.json(
        {
          error: 'invalid_grant',
          message: 'Invalid refresh token',
          timestamp: new Date().toISOString(),
          requestId: 'req-124',
        },
        { status: 401 }
      );
    }
    
    const response: TokenRefreshResponse = {
      accessToken: mockAccessToken,
      refreshToken: mockRefreshToken,
      tokenType: 'Bearer',
      expiresIn: 3600,
    };
    
    return HttpResponse.json(response);
  }),

  // Redirect Services
  http.post('/navigation/redirect-target', async ({ request }) => {
    const body = await request.json() as RedirectTargetRequest;
    
    // Simulate redirect logic
    let redirectUrl = body.intendedDestination || '/dashboard';
    
    // Check user permissions for intended destination
    if (body.intendedDestination?.includes('/admin')) {
      const hasAdminRole = body.userContext?.roles?.includes('admin');
      if (!hasAdminRole) {
        redirectUrl = '/dashboard'; // Fallback for non-admin users
      }
    }
    
    const response: RedirectTargetResponse = {
      redirectUrl,
      redirectType: 'temporary',
      statusCode: 302,
      context: {
        reason: 'post_authentication_redirect',
        timestamp: new Date().toISOString(),
      },
    };
    
    return HttpResponse.json(response);
  }),

  // Session Management
  http.post('/session/create', async ({ request }) => {
    const body = await request.json() as SessionCreateRequest;
    
    const response: SessionResponse = {
      sessionId: mockSessionId,
      userId: body.userId,
      createdAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 1800000).toISOString(), // 30 minutes
      context: body.context,
      isActive: true,
    };
    
    return HttpResponse.json(response, { status: 201 });
  }),

  http.get('/session/:sessionId', ({ params }) => {
    const { sessionId } = params;
    
    if (sessionId !== mockSessionId) {
      return HttpResponse.json(
        {
          error: 'session_not_found',
          message: 'Session not found',
          timestamp: new Date().toISOString(),
          requestId: 'req-125',
        },
        { status: 404 }
      );
    }
    
    const response: SessionResponse = {
      sessionId: mockSessionId,
      userId: mockUser.userId,
      createdAt: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
      lastAccessedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 1200000).toISOString(), // 20 minutes from now
      context: { loginMethod: 'oauth_sso' },
      isActive: true,
    };
    
    return HttpResponse.json(response);
  }),

  http.put('/session/:sessionId', async ({ params, request }) => {
    const { sessionId } = params;
    const body = await request.json() as SessionUpdateRequest;
    
    if (sessionId !== mockSessionId) {
      return HttpResponse.json(
        {
          error: 'session_not_found',
          message: 'Session not found',
          timestamp: new Date().toISOString(),
          requestId: 'req-126',
        },
        { status: 404 }
      );
    }
    
    const response: SessionResponse = {
      sessionId: mockSessionId,
      userId: mockUser.userId,
      createdAt: new Date(Date.now() - 600000).toISOString(),
      lastAccessedAt: new Date().toISOString(),
      expiresAt: body.extendExpiration 
        ? new Date(Date.now() + 1800000).toISOString() // Extended 30 minutes
        : new Date(Date.now() + 1200000).toISOString(), // Original 20 minutes
      context: { ...body.context, lastUpdate: new Date().toISOString() },
      isActive: true,
    };
    
    return HttpResponse.json(response);
  }),

  http.delete('/session/:sessionId', ({ params }) => {
    const { sessionId } = params;
    
    if (sessionId !== mockSessionId) {
      return HttpResponse.json(
        {
          error: 'session_not_found',
          message: 'Session not found',
          timestamp: new Date().toISOString(),
          requestId: 'req-127',
        },
        { status: 404 }
      );
    }
    
    return new HttpResponse(null, { status: 204 });
  }),

  // Migration Support
  http.get('/migration/feature-flags', () => {
    const response: FeatureFlagsResponse = {
      enableNextjsRedirect: true,
      enableJspCompatibility: false,
      gradualRolloutPercentage: 100,
      migrationPhase: 'rollout',
    };
    
    return HttpResponse.json(response);
  }),

  http.post('/migration/legacy-compatibility', async ({ request }) => {
    const body = await request.json() as CompatibilityCheckRequest;
    
    const response: CompatibilityCheckResponse = {
      compatible: body.systemType === 'nextjs',
      issues: body.systemType === 'jsp' ? [
        {
          feature: 'redirect_mechanism',
          severity: 'high',
          description: 'JSP scriptlet redirects are deprecated',
          recommendation: 'Migrate to Next.js server-side redirects',
        },
      ] : [],
      recommendedActions: body.systemType === 'jsp' ? [
        'Implement Next.js getServerSideProps redirect logic',
        'Update authentication flow to use modern JWT tokens',
        'Test redirect behavior with Cypress E2E tests',
      ] : [],
    };
    
    return HttpResponse.json(response);
  }),
];
