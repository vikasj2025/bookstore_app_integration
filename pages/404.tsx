import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Search, Home, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/router';

export default function NotFoundPage() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleSignIn = () => {
    router.push('/auth/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-muted p-6">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>
          
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              404
            </h1>
            <h2 className="mt-2 text-xl font-semibold text-foreground">
              Page Not Found
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The page you are looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium">What you can do:</p>
            <ul className="mt-2 text-left text-muted-foreground space-y-1">
              <li>• Check the URL for typos</li>
              <li>• Go back to the previous page</li>
              <li>• Visit our home page</li>
              <li>• Sign in to access protected content</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button onClick={handleGoHome} className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Go to Home
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline"
                onClick={handleGoBack}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleSignIn}
              >
                Sign In
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>Need help? Contact our support team.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
