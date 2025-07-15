import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions, Permission } from '@/hooks/usePermissions';
import { useLocation } from 'wouter';
import { Loader2, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRole?: string | string[];
  requiredPermission?: Permission;
  requiredPermissions?: Permission[];
  requireAll?: boolean;
  fallbackRoute?: string;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requiredRole,
  requiredPermission,
  requiredPermissions = [],
  requireAll = false,
  fallbackRoute = '/login'
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading: permissionsLoading } = usePermissions();
  const [, navigate] = useLocation();

  // Handle loading states
  if (authLoading || permissionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    navigate(fallbackRoute);
    return null;
  }

  // Check role-based access
  if (requiredRole && user) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowedRoles.includes(user.role)) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
          <Alert variant="destructive" className="max-w-md">
            <Lock className="h-4 w-4" />
            <AlertDescription>
              You need {allowedRoles.join(' or ')} role to access this page.
            </AlertDescription>
          </Alert>
        </div>
      );
    }
  }

  // Check permission-based access
  if (requiredPermission || requiredPermissions.length > 0) {
    const allPermissions = requiredPermission ? [requiredPermission, ...requiredPermissions] : requiredPermissions;
    const hasAccess = requireAll 
      ? hasAllPermissions(allPermissions)
      : hasAnyPermission(allPermissions);

    if (!hasAccess) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
          <Alert variant="destructive" className="max-w-md">
            <Lock className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to access this page.
            </AlertDescription>
          </Alert>
        </div>
      );
    }
  }

  return <>{children}</>;
}

// Admin route protection
export function AdminRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredRole="admin">
      {children}
    </ProtectedRoute>
  );
}

// Producer route protection
export function ProducerRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredRole={["admin", "producer"]}>
      {children}
    </ProtectedRoute>
  );
}

// Manager route protection
export function ManagerRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredRole={["admin", "manager"]}>
      {children}
    </ProtectedRoute>
  );
}

// Permission-based route protection
export function PermissionRoute({ 
  children, 
  permission, 
  permissions = [], 
  requireAll = false 
}: { 
  children: ReactNode; 
  permission?: Permission; 
  permissions?: Permission[]; 
  requireAll?: boolean; 
}) {
  return (
    <ProtectedRoute
      requiredPermission={permission}
      requiredPermissions={permissions}
      requireAll={requireAll}
    >
      {children}
    </ProtectedRoute>
  );
}