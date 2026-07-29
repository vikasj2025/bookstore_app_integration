import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// JWT secret for server-side validation
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

// Protected routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/profile', '/admin'];

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/callback'];

// Admin routes that require admin role
const ADMIN_ROUTES = ['/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Get tokens from cookies
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));

  // Handle authentication for protected routes
  if (isProtectedRoute) {
    if (!accessToken) {
      // Redirect to login with return URL
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify JWT token
      const { payload } = await jwtVerify(accessToken, JWT_SECRET);
      
      // Check admin access for admin routes
      if (isAdminRoute) {
        const userRoles = payload.roles as string[] || [];
        if (!userRoles.includes('admin')) {
          // Redirect to dashboard if not admin
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }

      // Token is valid, continue
      return NextResponse.next();
    } catch (error) {
      console.error('Token verification failed:', error);
      
      // Try to refresh token if available
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${process.env.API_BASE_URL}/auth/tokens/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshResponse.ok) {
            const { accessToken: newAccessToken, refreshToken: newRefreshToken, expiresIn } = await refreshResponse.json();
            
            // Create response with new tokens
            const response = NextResponse.next();
            
            // Set new tokens in cookies
            const cookieOptions = {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict' as const,
              maxAge: expiresIn,
            };
            
            response.cookies.set('access_token', newAccessToken, cookieOptions);
            response.cookies.set('refresh_token', newRefreshToken, {
              ...cookieOptions,
              maxAge: 7 * 24 * 60 * 60, // 7 days
            });
            
            return response;
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }
      
      // Clear invalid tokens and redirect to login
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
      response.cookies.delete('session_id');
      
      return response;
    }
  }

  // Handle redirect for authenticated users accessing login page
  if (pathname === '/auth/login' && accessToken) {
    try {
      // Verify token is still valid
      await jwtVerify(accessToken, JWT_SECRET);
      
      // Redirect to dashboard if already authenticated
      const returnUrl = request.nextUrl.searchParams.get('returnUrl');
      const redirectUrl = returnUrl || '/dashboard';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    } catch (error) {
      // Token is invalid, allow access to login page
      const response = NextResponse.next();
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
      response.cookies.delete('session_id');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
