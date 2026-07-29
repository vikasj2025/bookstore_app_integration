import { NextPageContext } from 'next';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';

interface ErrorPageProps {
  statusCode?: number;
  hasGetInitialPropsRun?: boolean;
  err?: Error;
}

function ErrorPage({ statusCode, hasGetInitialPropsRun, err }: ErrorPageProps) {
  const getErrorMessage = () => {
    if (statusCode === 404) {
      return {
        title: 'Page Not Found',
        description: 'The page you are looking for does not exist.',
      };
    }
    
    if (statusCode === 500) {
      return {
        title: 'Internal Server Error',
        description: 'Something went wrong on our end. Please try again later.',
      };
    }
    
    if (statusCode === 403) {
      return {
        title: 'Access Denied',
        description: 'You do not have permission to access this resource.',
      };
    }
    
    if (statusCode === 401) {
      return {
        title: 'Authentication Required',
        description: 'Please sign in to access this page.',
      };
    }
    
    return {
      title: statusCode ? `Error ${statusCode}` : 'Application Error',
      description: statusCode
        ? 'A server-side error occurred.'
        : 'A client-side error occurred.',
    };
  };

  const { title, description } = getErrorMessage();

  const handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const handleSignIn = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  };

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
              {title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {description}
            </p>
            {statusCode && (
              <p className="mt-1 text-xs text-muted-foreground">
                Error Code: {statusCode}
              </p>
            )}
          </div>

          {process.env.NODE_ENV === 'development' && err && (
            <div className="rounded-lg bg-muted p-3 text-left">
              <p className="text-xs font-mono text-destructive">
                {err.message}
              </p>
              {err.stack && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-muted-foreground">
                    Stack trace
                  </summary>
                  <pre className="mt-1 text-xs text-muted-foreground overflow-auto max-h-32">
                    {err.stack}
                  </pre>
                </details>
              )}
            </div>
          )}

          <div className="space-y-3">
            {statusCode === 401 ? (
              <Button onClick={handleSignIn} className="w-full">
                Sign In
              </Button>
            ) : (
              <Button onClick={handleReload} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
            
            <Button 
              variant="outline"
              onClick={handleGoHome}
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </div>

          {statusCode === 404 && (
            <div className="text-xs text-muted-foreground">
              <p>If you believe this is an error, please contact support.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode, hasGetInitialPropsRun: true, err };
};

export default ErrorPage;
