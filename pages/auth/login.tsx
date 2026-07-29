import { GetServerSideProps } from 'next';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AlertCircle } from 'lucide-react';

interface LoginPageProps {
  returnUrl?: string;
  error?: string;
}

export default function LoginPage({ returnUrl, error: serverError }: LoginPageProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, error, login } = useAuthStore();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      const redirectTo = returnUrl || '/dashboard';
      router.push(redirectTo);
    }
  }, [isAuthenticated, returnUrl, router]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    
    try {
      await login({
        clientId: process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID || 'default-client-id',
        redirectUri: `${window.location.origin}/auth/callback`,
        state: JSON.stringify({ 
          returnUrl: returnUrl || '/dashboard',
          timestamp: Date.now(),
        }),
        scope: 'openid profile email',
      });
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const displayError = serverError || error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Sign In
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Access your account with secure OAuth SSO
            </p>
          </div>

          {displayError && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{displayError}</span>
            </div>
          )}

          {returnUrl && (
            <div className="mb-6 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              <p>You'll be redirected to:</p>
              <p className="font-mono text-xs">{returnUrl}</p>
            </div>
          )}

          <div className="space-y-4">
            <Button 
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full"
              size="lg"
            >
              {isLoggingIn ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Redirecting to SSO...
                </>
              ) : (
                'Sign In with SSO'
              )}
            </Button>

            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <div className="h-1 w-1 rounded-full bg-green-500"></div>
                <span>Secure OAuth 2.0 authentication</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="h-1 w-1 rounded-full bg-green-500"></div>
                <span>Automatic redirect after login</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="h-1 w-1 rounded-full bg-green-500"></div>
                <span>JWT token-based session management</span>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button 
              variant="link" 
              onClick={() => router.push('/')}
              className="text-sm text-muted-foreground"
            >
              ← Back to Home
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query } = context;
  
  return {
    props: {
      returnUrl: (query.returnUrl as string) || null,
      error: (query.error as string) || null,
    },
  };
};
