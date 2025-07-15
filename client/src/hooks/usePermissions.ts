import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { apiRequest } from '@/lib/queryClient';

export interface Permission {
  category: string;
  action: string;
  resource?: string;
}

export interface PermissionResult {
  hasPermission: boolean;
  loading: boolean;
  error?: Error;
}

export interface UserPermissions {
  userPermissions: Array<{
    id: number;
    category: string;
    action: string;
    resource: string;
    granted: boolean;
    expiresAt?: string;
    conditions?: any;
  }>;
  rolePermissions: Array<{
    id: number;
    category: string;
    action: string;
    resource: string;
    granted: boolean;
    role: string;
  }>;
}

export function usePermissions() {
  const { user } = useAuth();

  const { data: userPermissions, isLoading, error } = useQuery<UserPermissions>({
    queryKey: ['/api/admin/permissions/users', user?.id],
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const checkPermission = (permission: Permission): PermissionResult => {
    if (isLoading) {
      return { hasPermission: false, loading: true };
    }

    if (error) {
      return { hasPermission: false, loading: false, error: error as Error };
    }

    if (!user || !userPermissions) {
      return { hasPermission: false, loading: false };
    }

    // Admin has all permissions
    if (user.role === 'admin') {
      return { hasPermission: true, loading: false };
    }

    // Check user-specific permissions first (overrides role permissions)
    const userPermission = userPermissions.userPermissions.find(p => 
      p.category === permission.category && 
      p.action === permission.action &&
      (!permission.resource || p.resource === permission.resource || p.resource === "all")
    );

    if (userPermission) {
      // Check if permission is granted and not expired
      if (!userPermission.granted) {
        return { hasPermission: false, loading: false };
      }
      
      if (userPermission.expiresAt && new Date(userPermission.expiresAt) < new Date()) {
        return { hasPermission: false, loading: false };
      }
      
      return { hasPermission: true, loading: false };
    }

    // Fall back to role-based permissions
    const rolePermission = userPermissions.rolePermissions.find(p => 
      p.category === permission.category && 
      p.action === permission.action &&
      (!permission.resource || p.resource === permission.resource || p.resource === "all")
    );

    return { 
      hasPermission: rolePermission ? rolePermission.granted : false, 
      loading: false 
    };
  };

  const hasPermission = (permission: Permission): boolean => {
    return checkPermission(permission).hasPermission;
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  return {
    userPermissions,
    checkPermission,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isLoading,
    error
  };
}

// Predefined permission sets for common actions
export const PermissionSets = {
  // User Management
  USER_MANAGEMENT: {
    CREATE: { category: 'USER', action: 'CREATE' },
    READ: { category: 'USER', action: 'READ' },
    UPDATE: { category: 'USER', action: 'UPDATE' },
    DELETE: { category: 'USER', action: 'DELETE' },
    READ_ALL: { category: 'USER', action: 'READ', resource: 'all' },
    UPDATE_ALL: { category: 'USER', action: 'update', resource: 'all' },
  },

  // Content Management
  CONTENT: {
    CREATE: { category: 'CONTENT', action: 'CREATE' },
    UPDATE: { category: 'CONTENT', action: 'UPDATE' },
    DELETE: { category: 'CONTENT', action: 'DELETE' },
    PUBLISH: { category: 'CONTENT', action: 'PUBLISH' },
    MODERATE: { category: 'CONTENT', action: 'MODERATE' },
    CREATE_OWN: { category: 'CONTENT', action: 'CREATE', resource: 'own_profile' },
    UPDATE_OWN: { category: 'CONTENT', action: 'UPDATE', resource: 'own_profile' },
  },

  // Job Management
  JOBS: {
    CREATE: { category: 'JOBS', action: 'CREATE' },
    READ: { category: 'JOBS', action: 'READ' },
    UPDATE: { category: 'JOBS', action: 'UPDATE' },
    DELETE: { category: 'JOBS', action: 'DELETE' },
    APPLY: { category: 'JOBS', action: 'APPLY' },
    UPDATE_OWN: { category: 'JOBS', action: 'UPDATE', resource: 'own' },
    DELETE_OWN: { category: 'JOBS', action: 'DELETE', resource: 'own' },
  },

  // Media Management
  MEDIA: {
    UPLOAD: { category: 'MEDIA', action: 'UPLOAD' },
    DELETE: { category: 'MEDIA', action: 'DELETE' },
    MODERATE: { category: 'MEDIA', action: 'MODERATE' },
    UPLOAD_OWN: { category: 'MEDIA', action: 'UPLOAD', resource: 'own_media' },
    UPLOAD_JOB: { category: 'MEDIA', action: 'UPLOAD', resource: 'job_media' },
  },

  // Admin Functions
  ADMIN: {
    ALL: { category: 'ADMIN', action: 'ALL' },
    USER_MANAGEMENT: { category: 'ADMIN', action: 'USER_MANAGEMENT' },
    SYSTEM_SETTINGS: { category: 'ADMIN', action: 'SYSTEM_SETTINGS' },
    ANALYTICS: { category: 'ADMIN', action: 'ANALYTICS' },
  },

  // AI Features
  AI: {
    USE_BASIC: { category: 'AI', action: 'USE', resource: 'basic_features' },
    USE_ADVANCED: { category: 'AI', action: 'USE', resource: 'advanced_features' },
    PROFILE_OPTIMIZATION: { category: 'AI', action: 'USE', resource: 'profile_optimization' },
    JOB_MATCHING: { category: 'AI', action: 'USE', resource: 'job_matching' },
  },

  // Billing
  BILLING: {
    VIEW: { category: 'BILLING', action: 'VIEW' },
    MANAGE: { category: 'BILLING', action: 'MANAGE' },
    PROCESS: { category: 'BILLING', action: 'PROCESS' },
  },

  // System Operations
  SYSTEM: {
    BACKUP: { category: 'SYSTEM', action: 'BACKUP' },
    RESTORE: { category: 'SYSTEM', action: 'RESTORE' },
    CONFIGURE: { category: 'SYSTEM', action: 'CONFIGURE' },
    MONITOR: { category: 'SYSTEM', action: 'MONITOR' },
  }
};

// Hook for role-based UI components
export function useRoleCheck() {
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';
  const isProducer = user?.role === 'producer';
  const isManager = user?.role === 'manager';
  const isTalent = user?.role === 'talent';

  return {
    isAdmin,
    isProducer,
    isManager,
    isTalent,
    role: user?.role || 'guest'
  };
}