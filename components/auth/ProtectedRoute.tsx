import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/lib/auth-store';
import { hasAnyRole, hasAnyPermission } from '@/lib/auth';
import { ProtectedRouteProps } from '@/types/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertCircle, Shield } from 'lucide-react';

export function ProtectedRoute({ children, protection, fallback }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, validateToken } = useAuthStore();
  const [isValidating, setIsValidating] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      setIsValidating(true);
      
      // Validate token if not already authenticated
      if (!isAuthenticated) {
        const isValid = await validateToken();
        if (!isValid && protection.requireAuth) {
          const redirectTo = protection.redirectTo || '/auth/login';
          const loginUrl = `${redirectTo}?returnUrl=${encodeURIComponent(router.asPath)}`;
          router.push(loginUrl);
          return;
        }
      }

      // Check authentication requirement
      if (protection.requireAuth && !isAuthenticated) {
        setHasAccess(false);
        setIsValidating(false);
        return;
      }

      // Check role requirements
      if (protection.requiredRoles && protection.requiredRoles.length > 0) {
        const hasRequiredRole = hasAnyRole(protection.requiredRoles);
        if (!hasRequiredRole) {
          setHasAccess(false);
          setIsValidating(false);
          return;
        }
      }

      // Check permission requirements
      if (protection.requiredPermissions && protection.requiredPermissions.length > 0) {
        const hasRequiredPermission = hasAnyPermission(protection.requiredPermissions);
        if (!hasRequiredPermission) {
          setHasAccess(false);
          setIsValidating(false);
          return;
        }
      }

      setHasAccess(true);
      setIsValidating(false);
    };

    checkAccess();
  }, [isAuthenticated, user, protection, router, validateToken]);

  // Show loading state while validating
  if (isLoading || isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Validating access...</p>
        </div>
      </div>
    );
  }

  // Show access denied if user doesn't have required access
  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Access Denied
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {!isAuthenticated 
                  ? 'You need to sign in to access this page.'
                  : 'You don\'t have the required permissions to access this page.'
                }
              </p>
            </div>

            {protection.requiredRoles && protection.requiredRoles.length > 0 && (
              <div className="rounded-lg bg-muted p-3 text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4" />
                  <span className="font-medium">Required Roles:</span>
                </div>
                <p className="text-muted-foreground">
                  {protection.requiredRoles.join(', ')}
                </p>
              </div>
            )}

            {protection.requiredPermissions && protection.requiredPermissions.length > 0 && (
              <div className="rounded-lg bg-muted p-3 text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4" />
                  <span className="font-medium">Required Permissions:</span>
                </div>
                <p className="text-muted-foreground">
                  {protection.requiredPermissions.join(', ')}
                </p>
              </div>
            )}

            <div className="space-y-3">
              {!isAuthenticated ? (
                <Button 
                  onClick={() => {
                    const redirectTo = protection.redirectTo || '/auth/login';
                    const loginUrl = `${redirectTo}?returnUrl=${encodeURIComponent(router.asPath)}`;
                    router.push(loginUrl);
                  }}
                  className="w-full"
                >
                  Sign In
                </Button>
              ) : (
                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
              )}
              
              <Button 
                variant="outline"
                onClick={() => router.push('/')}
                className="w-full"
              >
                Go to Home
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // User has access, render children
  return <>{children}</>;
}

// Higher-order component for easier usage
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  protection: ProtectedRouteProps['protection'],
  fallback?: React.ReactNode
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute protection={protection} fallback={fallback}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
