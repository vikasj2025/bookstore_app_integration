import { GetServerSideProps } from 'next';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface HomePageProps {
  redirectUrl?: string;
}

export default function HomePage({ redirectUrl }: HomePageProps) {
  const { isAuthenticated, isLoading, user, login } = useAuthStore();

  useEffect(() => {
    // Handle redirect after authentication
    if (redirectUrl && isAuthenticated) {
      window.location.href = redirectUrl;
    }
  }, [redirectUrl, isAuthenticated]);

  const handleLogin = async () => {
    await login({
      clientId: process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID || 'default-client-id',
      redirectUri: `${window.location.origin}/auth/callback`,
      state: Math.random().toString(36).substring(7),
      scope: 'openid profile email',
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex min-h-[80vh] items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <h1 className="mb-6 text-3xl font-bold text-foreground">
              Modern Authentication
            </h1>
            
            {isAuthenticated && user ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    Welcome, {user.name}!
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {user.email}
                  </p>
                  <div className="mt-2">
                    <span className="text-xs text-muted-foreground">
                      Roles: {user.roles.join(', ')}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = '/dashboard'}
                  >
                    Go to Dashboard
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => useAuthStore.getState().logout()}
                  >
                    Logout
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  Experience seamless authentication with our modern OAuth SSO system.
                  No more manual redirects - everything happens automatically!
                </p>
                
                <div className="space-y-4">
                  <Button 
                    onClick={handleLogin}
                    className="w-full"
                    size="lg"
                  >
                    Sign In with SSO
                  </Button>
                  
                  <div className="text-xs text-muted-foreground">
                    <p>✅ Automatic redirect after login</p>
                    <p>✅ Secure JWT token management</p>
                    <p>✅ Session persistence</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query } = context;
  
  // Check if there's a redirect URL from query params
  const redirectUrl = query.redirect as string;
  
  return {
    props: {
      redirectUrl: redirectUrl || null,
    },
  };
};
