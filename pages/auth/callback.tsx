import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/lib/auth-store';
import { storeAuthData } from '@/lib/auth';
import apiClient from '@/lib/api-client';
import { AuthenticationResponse } from '@/types/auth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface CallbackPageProps {
  code?: string;
  state?: string;
  error?: string;
  errorDescription?: string;
}

export default function CallbackPage({ 
  code, 
  state, 
  error: urlError, 
  errorDescription 
}: CallbackPageProps) {
  const router = useRouter();
  const { setUser, setTokens, setError } = useAuthStore();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string>('/dashboard');

  useEffect(() => {
    if (urlError) {
      setStatus('error');
      setErrorMessage(errorDescription || urlError);
      setError(errorDescription || urlError);
      return;
    }

    if (!code || !state) {
      setStatus('error');
      setErrorMessage('Missing authorization code or state parameter');
      setError('Invalid callback parameters');
      return;
    }

    handleCallback();
  }, [code, state, urlError, errorDescription]);

  const handleCallback = async () => {
    try {
      setStatus('processing');

      // Parse state to get return URL
      let parsedState: any = {};
      try {
        parsedState = JSON.parse(state || '{}');
        if (parsedState.returnUrl) {
          setRedirectUrl(parsedState.returnUrl);
        }
      } catch (e) {
        console.warn('Failed to parse state parameter:', e);
      }

      // Exchange authorization code for tokens
      const authResponse: AuthenticationResponse = await apiClient.post('/auth/oauth/callback', {
        code,
        state,
        clientId: process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID,
      });

      // Store authentication data
      storeAuthData(authResponse);
      
      // Update auth store
      setUser(authResponse.user);
      setTokens({
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
      });

      setStatus('success');

      // Redirect after a short delay
      setTimeout(() => {
        router.push(redirectUrl);
      }, 2000);

    } catch (error: any) {
      console.error('OAuth callback failed:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Authentication failed');
      setError(error.message || 'Authentication failed');
    }
  };

  const handleRetry = () => {
    router.push('/auth/login');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center">
          {status === 'processing' && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <LoadingSpinner size="lg" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Completing Sign In
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Processing your authentication...
                </p>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="xs" />
                  <span>Validating authorization code</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="xs" />
                  <span>Generating JWT tokens</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="xs" />
                  <span>Creating user session</span>
                </div>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Sign In Successful!
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Redirecting you to your destination...
                </p>
              </div>
              <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                <p>Redirecting to:</p>
                <p className="font-mono text-xs">{redirectUrl}</p>
              </div>
              <div className="text-xs text-muted-foreground">
                <p>If you're not redirected automatically,</p>
                <Button 
                  variant="link" 
                  onClick={() => router.push(redirectUrl)}
                  className="p-0 text-xs"
                >
                  click here to continue
                </Button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
                  <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Authentication Failed
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  We encountered an issue during sign in.
                </p>
              </div>
              {errorMessage && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  {errorMessage}
                </div>
              )}
              <div className="space-y-3">
                <Button 
                  onClick={handleRetry}
                  className="w-full"
                >
                  Try Again
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleGoHome}
                  className="w-full"
                >
                  Go to Home
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query } = context;
  
  return {
    props: {
      code: (query.code as string) || null,
      state: (query.state as string) || null,
      error: (query.error as string) || null,
      errorDescription: (query.error_description as string) || null,
    },
  };
};
