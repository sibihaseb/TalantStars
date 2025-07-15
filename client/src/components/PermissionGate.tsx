import { ReactNode } from 'react';
import { usePermissions, Permission, PermissionSets } from '@/hooks/usePermissions';
import { useRoleCheck } from '@/hooks/usePermissions';
import { AlertTriangle, Lock, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PermissionGateProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  role?: string | string[];
  fallback?: ReactNode;
  showError?: boolean;
}

export function PermissionGate({
  children,
  permission,
  permissions = [],
  requireAll = false,
  role,
  fallback,
  showError = false
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermissions();
  const { role: userRole } = useRoleCheck();

  // Check role-based access first
  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role];
    if (!allowedRoles.includes(userRole)) {
      return showError ? (
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You need {allowedRoles.join(' or ')} role to access this content.
          </AlertDescription>
        </Alert>
      ) : (fallback || null);
    }
  }

  // Check permission-based access
  if (permission || permissions.length > 0) {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    const allPermissions = permission ? [permission, ...permissions] : permissions;
    const hasAccess = requireAll 
      ? hasAllPermissions(allPermissions)
      : hasAnyPermission(allPermissions);

    if (!hasAccess) {
      return showError ? (
        <Alert variant="destructive" className="m-4">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this content.
          </AlertDescription>
        </Alert>
      ) : (fallback || null);
    }
  }

  return <>{children}</>;
}

// Specific permission gates for common use cases
export function AdminGate({ children, fallback, showError = false }: { children: ReactNode; fallback?: ReactNode; showError?: boolean }) {
  return (
    <PermissionGate role="admin" fallback={fallback} showError={showError}>
      {children}
    </PermissionGate>
  );
}

export function ProducerGate({ children, fallback, showError = false }: { children: ReactNode; fallback?: ReactNode; showError?: boolean }) {
  return (
    <PermissionGate role={["admin", "producer"]} fallback={fallback} showError={showError}>
      {children}
    </PermissionGate>
  );
}

export function ManagerGate({ children, fallback, showError = false }: { children: ReactNode; fallback?: ReactNode; showError?: boolean }) {
  return (
    <PermissionGate role={["admin", "manager"]} fallback={fallback} showError={showError}>
      {children}
    </PermissionGate>
  );
}

export function UserManagementGate({ children, fallback, showError = false }: { children: ReactNode; fallback?: ReactNode; showError?: boolean }) {
  return (
    <PermissionGate
      permissions={[
        PermissionSets.USER_MANAGEMENT.CREATE,
        PermissionSets.USER_MANAGEMENT.UPDATE,
        PermissionSets.USER_MANAGEMENT.DELETE,
        PermissionSets.ADMIN.USER_MANAGEMENT
      ]}
      fallback={fallback}
      showError={showError}
    >
      {children}
    </PermissionGate>
  );
}

export function JobManagementGate({ children, fallback, showError = false }: { children: ReactNode; fallback?: ReactNode; showError?: boolean }) {
  return (
    <PermissionGate
      permissions={[
        PermissionSets.JOBS.CREATE,
        PermissionSets.JOBS.UPDATE,
        PermissionSets.JOBS.DELETE,
        PermissionSets.ADMIN.ALL
      ]}
      fallback={fallback}
      showError={showError}
    >
      {children}
    </PermissionGate>
  );
}

export function MediaUploadGate({ children, fallback, showError = false }: { children: ReactNode; fallback?: ReactNode; showError?: boolean }) {
  return (
    <PermissionGate
      permissions={[
        PermissionSets.MEDIA.UPLOAD,
        PermissionSets.MEDIA.UPLOAD_OWN,
        PermissionSets.MEDIA.UPLOAD_JOB
      ]}
      fallback={fallback}
      showError={showError}
    >
      {children}
    </PermissionGate>
  );
}

export function AIFeaturesGate({ children, fallback, showError = false }: { children: ReactNode; fallback?: ReactNode; showError?: boolean }) {
  return (
    <PermissionGate
      permissions={[
        PermissionSets.AI.USE_BASIC,
        PermissionSets.AI.USE_ADVANCED,
        PermissionSets.AI.PROFILE_OPTIMIZATION,
        PermissionSets.AI.JOB_MATCHING
      ]}
      fallback={fallback}
      showError={showError}
    >
      {children}
    </PermissionGate>
  );
}

// Permission-aware button component
interface PermissionButtonProps {
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  role?: string | string[];
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
}

export function PermissionButton({
  permission,
  permissions = [],
  requireAll = false,
  role,
  children,
  onClick,
  className,
  variant = 'default',
  size = 'default',
  disabled = false,
  ...props
}: PermissionButtonProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermissions();
  const { role: userRole } = useRoleCheck();

  // Check role-based access
  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role];
    if (!allowedRoles.includes(userRole)) {
      return null;
    }
  }

  // Check permission-based access
  if (permission || permissions.length > 0) {
    if (isLoading) {
      return (
        <button 
          className={`${className} opacity-50 cursor-not-allowed`} 
          disabled={true}
          {...props}
        >
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
        </button>
      );
    }

    const allPermissions = permission ? [permission, ...permissions] : permissions;
    const hasAccess = requireAll 
      ? hasAllPermissions(allPermissions)
      : hasAnyPermission(allPermissions);

    if (!hasAccess) {
      return null;
    }
  }

  return (
    <button
      className={className}
      onClick={onClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {children}
    </button>
  );
}

// Permission status indicator
export function PermissionStatus({ permission, className = "" }: { permission: Permission; className?: string }) {
  const { checkPermission } = usePermissions();
  const result = checkPermission(permission);

  if (result.loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
        <span className="text-sm text-muted-foreground">Checking...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {result.hasPermission ? (
        <Shield className="h-4 w-4 text-green-600" />
      ) : (
        <Lock className="h-4 w-4 text-red-600" />
      )}
      <span className={`text-sm ${result.hasPermission ? 'text-green-600' : 'text-red-600'}`}>
        {result.hasPermission ? 'Allowed' : 'Denied'}
      </span>
    </div>
  );
}