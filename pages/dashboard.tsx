import { GetServerSideProps } from 'next';
import { useAuthStore } from '@/lib/auth-store';
import { hasRole, hasPermission, getCurrentUser } from '@/lib/auth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { User, Shield, Clock, LogOut } from 'lucide-react';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const currentUser = getCurrentUser();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ProtectedRoute 
      protection={{ requireAuth: true }}
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">Please sign in to access the dashboard.</p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary p-2">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Modern Authentication Demo</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name || currentUser?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email || currentUser?.email}</p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* User Info Card */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <User className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">User Information</h2>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-sm">{user?.name || currentUser?.name || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{user?.email || currentUser?.email || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User ID</label>
                  <p className="text-sm font-mono">{user?.userId || currentUser?.userId || 'N/A'}</p>
                </div>
                
                {(user?.lastLoginAt || currentUser?.lastLoginAt) && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Login</label>
                    <p className="text-sm">
                      {new Date(user?.lastLoginAt || currentUser?.lastLoginAt || '').toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Roles Card */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Roles & Permissions</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Roles</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(user?.roles || currentUser?.roles || []).map((role) => (
                      <Badge key={role} variant="secondary">
                        {role}
                      </Badge>
                    ))}
                    {(!user?.roles?.length && !currentUser?.roles?.length) && (
                      <span className="text-sm text-muted-foreground">No roles assigned</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Permissions</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(user?.permissions || currentUser?.permissions || []).map((permission) => (
                      <Badge key={permission} variant="outline">
                        {permission}
                      </Badge>
                    ))}
                    {(!user?.permissions?.length && !currentUser?.permissions?.length) && (
                      <span className="text-sm text-muted-foreground">No permissions assigned</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Session Info Card */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Session Information</h2>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Authentication Status</label>
                  <div className="mt-1">
                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      Authenticated
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Session Type</label>
                  <p className="text-sm">OAuth 2.0 + JWT</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Login Time</label>
                  <p className="text-sm">{new Date().toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Feature Demonstration */}
          <div className="mt-8">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Feature Demonstration</h2>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="text-md font-medium">Role-Based Access</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${
                        hasRole('admin') ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span>Admin Access: {hasRole('admin') ? 'Granted' : 'Denied'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${
                        hasRole('user') ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span>User Access: {hasRole('user') ? 'Granted' : 'Denied'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${
                        hasRole('manager') ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span>Manager Access: {hasRole('manager') ? 'Granted' : 'Denied'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-md font-medium">Permission-Based Access</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${
                        hasPermission('read') ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span>Read Permission: {hasPermission('read') ? 'Granted' : 'Denied'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${
                        hasPermission('write') ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span>Write Permission: {hasPermission('write') ? 'Granted' : 'Denied'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${
                        hasPermission('delete') ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span>Delete Permission: {hasPermission('delete') ? 'Granted' : 'Denied'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // This demonstrates server-side redirect logic
  // In a real implementation, you would validate the session here
  
  return {
    props: {},
  };
};
