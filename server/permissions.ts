import { storage } from "./storage";
import { 
  RolePermission, 
  UserPermission, 
  InsertRolePermission, 
  InsertUserPermission 
} from "@shared/schema";

// Permission audit log interface
interface PermissionAuditLog {
  userId: string;
  userRole: string;
  permission: PermissionCheck;
  granted: boolean;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
}

/**
 * Enhanced permissions management system
 * Provides granular permission checking and management
 */

export interface PermissionCheck {
  category: string;
  action: string;
  resource?: string;
}

export interface PermissionContext {
  userId: string;
  userRole: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

/**
 * Check if a user has a specific permission
 * Combines role-based and user-specific permissions
 */
export async function hasPermission(
  context: PermissionContext,
  permission: PermissionCheck
): Promise<boolean> {
  try {
    // Check user-specific permissions first (overrides role permissions)
    const userPermissions = await storage.getUserPermissions(context.userId);
    const userPermission = userPermissions.find(p => 
      p.category === permission.category && 
      p.action === permission.action &&
      (!permission.resource || p.resource === permission.resource || p.resource === "all")
    );

    // If user has specific permission, check if it's granted and not expired
    if (userPermission) {
      if (!userPermission.granted) return false;
      if (userPermission.expiresAt && new Date(userPermission.expiresAt) < context.timestamp) {
        return false;
      }
      
      // Check conditions if any
      if (userPermission.conditions) {
        const conditions = userPermission.conditions as any;
        if (conditions.ipRestrictions && context.ipAddress) {
          const allowedIps = conditions.ipRestrictions as string[];
          if (!allowedIps.includes(context.ipAddress)) return false;
        }
        
        if (conditions.timeRestrictions) {
          const timeRestrictions = conditions.timeRestrictions as any;
          const currentHour = context.timestamp.getHours();
          if (currentHour < timeRestrictions.startHour || currentHour > timeRestrictions.endHour) {
            return false;
          }
        }
      }
      
      return true;
    }

    // Fall back to role-based permissions
    const rolePermissions = await storage.getRolePermissions(context.userRole);
    const rolePermission = rolePermissions.find(p => 
      p.category === permission.category && 
      p.action === permission.action &&
      (!permission.resource || p.resource === permission.resource || p.resource === "all")
    );

    return rolePermission ? rolePermission.granted : false;
  } catch (error) {
    console.error("Permission check failed:", error);
    return false;
  }
}

/**
 * Check multiple permissions at once
 */
export async function hasPermissions(
  context: PermissionContext,
  permissions: PermissionCheck[]
): Promise<boolean[]> {
  return Promise.all(permissions.map(permission => hasPermission(context, permission)));
}

/**
 * Check if user has ANY of the specified permissions
 */
export async function hasAnyPermission(
  context: PermissionContext,
  permissions: PermissionCheck[]
): Promise<boolean> {
  const results = await hasPermissions(context, permissions);
  return results.some(result => result);
}

/**
 * Check if user has ALL of the specified permissions
 */
export async function hasAllPermissions(
  context: PermissionContext,
  permissions: PermissionCheck[]
): Promise<boolean> {
  const results = await hasPermissions(context, permissions);
  return results.every(result => result);
}

/**
 * Log permission access attempts for auditing
 */
async function logPermissionAttempt(
  context: PermissionContext,
  permission: PermissionCheck,
  granted: boolean
): Promise<void> {
  try {
    const auditLog: PermissionAuditLog = {
      userId: context.userId,
      userRole: context.userRole,
      permission,
      granted,
      timestamp: context.timestamp,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      reason: granted ? "Access granted" : "Access denied"
    };

    // Log to admin logs for now (could be separate audit table)
    await storage.createAdminLog({
      action: "permission_check",
      details: JSON.stringify(auditLog),
      adminId: context.userId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      timestamp: context.timestamp
    });
  } catch (error) {
    console.error("Failed to log permission attempt:", error);
  }
}

/**
 * Grant a specific permission to a user
 */
export async function grantUserPermission(
  userId: string,
  permission: Omit<InsertUserPermission, 'userId'>,
  grantedBy: string
): Promise<UserPermission> {
  return storage.createUserPermission({
    ...permission,
    userId,
    grantedBy,
    granted: true
  });
}

/**
 * Revoke a specific permission from a user
 */
export async function revokeUserPermission(
  userId: string,
  category: string,
  action: string,
  resource?: string
): Promise<void> {
  const userPermissions = await storage.getUserPermissions(userId);
  const permission = userPermissions.find(p => 
    p.category === category && 
    p.action === action &&
    (!resource || p.resource === resource)
  );

  if (permission) {
    await storage.updateUserPermission(permission.id, { granted: false });
  }
}

/**
 * Get all effective permissions for a user (role + user specific)
 */
export async function getUserEffectivePermissions(
  userId: string,
  userRole: string
): Promise<{
  rolePermissions: RolePermission[];
  userPermissions: UserPermission[];
  effective: Array<{
    category: string;
    action: string;
    resource?: string;
    granted: boolean;
    source: 'role' | 'user';
  }>;
}> {
  const [rolePermissions, userPermissions] = await Promise.all([
    storage.getRolePermissions(userRole),
    storage.getUserPermissions(userId)
  ]);

  const effective: Array<{
    category: string;
    action: string;
    resource?: string;
    granted: boolean;
    source: 'role' | 'user';
  }> = [];

  // Add role permissions
  rolePermissions.forEach(rp => {
    effective.push({
      category: rp.category,
      action: rp.action,
      resource: rp.resource || undefined,
      granted: rp.granted,
      source: 'role'
    });
  });

  // Override with user permissions
  userPermissions.forEach(up => {
    const existingIndex = effective.findIndex(ep => 
      ep.category === up.category && 
      ep.action === up.action &&
      ep.resource === up.resource
    );

    if (existingIndex >= 0) {
      effective[existingIndex] = {
        category: up.category,
        action: up.action,
        resource: up.resource || undefined,
        granted: up.granted,
        source: 'user'
      };
    } else {
      effective.push({
        category: up.category,
        action: up.action,
        resource: up.resource || undefined,
        granted: up.granted,
        source: 'user'
      });
    }
  });

  return { rolePermissions, userPermissions, effective };
}

/**
 * Common permission checks for the platform
 */
export const PermissionChecks = {
  // User Management
  CREATE_USER: { category: "user_management", action: "create" },
  VIEW_ALL_USERS: { category: "user_management", action: "read", resource: "all" },
  VIEW_OWN_PROFILE: { category: "user_management", action: "read", resource: "own" },
  UPDATE_ANY_USER: { category: "user_management", action: "update", resource: "all" },
  UPDATE_OWN_PROFILE: { category: "user_management", action: "update", resource: "own" },
  DELETE_USER: { category: "user_management", action: "delete" },
  
  // Profile Management
  CREATE_PROFILE: { category: "profile_management", action: "create" },
  VIEW_ALL_PROFILES: { category: "profile_management", action: "read", resource: "all" },
  VIEW_OWN_PROFILE: { category: "profile_management", action: "read", resource: "own" },
  UPDATE_ANY_PROFILE: { category: "profile_management", action: "update", resource: "all" },
  UPDATE_OWN_PROFILE: { category: "profile_management", action: "update", resource: "own" },
  VERIFY_PROFILE: { category: "profile_management", action: "verify" },
  
  // Media Management
  UPLOAD_MEDIA: { category: "media_management", action: "create" },
  VIEW_ALL_MEDIA: { category: "media_management", action: "read", resource: "all" },
  VIEW_OWN_MEDIA: { category: "media_management", action: "read", resource: "own" },
  DELETE_ANY_MEDIA: { category: "media_management", action: "delete", resource: "all" },
  DELETE_OWN_MEDIA: { category: "media_management", action: "delete", resource: "own" },
  MODERATE_MEDIA: { category: "media_management", action: "moderate" },
  
  // Job Management
  CREATE_JOB: { category: "job_management", action: "create" },
  VIEW_ALL_JOBS: { category: "job_management", action: "read", resource: "all" },
  VIEW_OWN_JOBS: { category: "job_management", action: "read", resource: "own" },
  UPDATE_ANY_JOB: { category: "job_management", action: "update", resource: "all" },
  UPDATE_OWN_JOB: { category: "job_management", action: "update", resource: "own" },
  DELETE_ANY_JOB: { category: "job_management", action: "delete", resource: "all" },
  DELETE_OWN_JOB: { category: "job_management", action: "delete", resource: "own" },
  PUBLISH_JOB: { category: "job_management", action: "publish" },
  
  // Application Management
  APPLY_TO_JOB: { category: "application_management", action: "create" },
  VIEW_ALL_APPLICATIONS: { category: "application_management", action: "read", resource: "all" },
  VIEW_OWN_APPLICATIONS: { category: "application_management", action: "read", resource: "own" },
  APPROVE_APPLICATION: { category: "application_management", action: "approve" },
  REJECT_APPLICATION: { category: "application_management", action: "reject" },
  
  // Messaging
  SEND_MESSAGE: { category: "messaging", action: "create" },
  VIEW_ALL_MESSAGES: { category: "messaging", action: "read", resource: "all" },
  VIEW_OWN_MESSAGES: { category: "messaging", action: "read", resource: "own" },
  MODERATE_MESSAGES: { category: "messaging", action: "moderate" },
  
  // Analytics
  VIEW_ANALYTICS: { category: "analytics", action: "read" },
  EXPORT_ANALYTICS: { category: "analytics", action: "export" },
  
  // System Settings
  MANAGE_SETTINGS: { category: "system_settings", action: "update" },
  VIEW_SETTINGS: { category: "system_settings", action: "read" },
  
  // Content Moderation
  MODERATE_CONTENT: { category: "content_moderation", action: "moderate" },
  APPROVE_CONTENT: { category: "content_moderation", action: "approve" },
  REJECT_CONTENT: { category: "content_moderation", action: "reject" },
  
  // Verification
  VERIFY_USERS: { category: "verification", action: "verify" },
  UNVERIFY_USERS: { category: "verification", action: "unverify" },
  
  // AI Features
  USE_AI_ENHANCEMENT: { category: "ai_features", action: "create" },
  MANAGE_AI_SETTINGS: { category: "ai_features", action: "update" },
  
  // Reports
  GENERATE_REPORTS: { category: "reports", action: "create" },
  VIEW_REPORTS: { category: "reports", action: "read" },
  EXPORT_REPORTS: { category: "reports", action: "export" },
};

/**
 * Default role permissions
 */
export const DefaultRolePermissions: Record<string, PermissionCheck[]> = {
  talent: [
    PermissionChecks.VIEW_OWN_PROFILE,
    PermissionChecks.UPDATE_OWN_PROFILE,
    PermissionChecks.CREATE_PROFILE,
    PermissionChecks.UPLOAD_MEDIA,
    PermissionChecks.VIEW_OWN_MEDIA,
    PermissionChecks.DELETE_OWN_MEDIA,
    PermissionChecks.VIEW_ALL_JOBS,
    PermissionChecks.APPLY_TO_JOB,
    PermissionChecks.VIEW_OWN_APPLICATIONS,
    PermissionChecks.SEND_MESSAGE,
    PermissionChecks.VIEW_OWN_MESSAGES,
    PermissionChecks.USE_AI_ENHANCEMENT,
  ],
  
  manager: [
    PermissionChecks.VIEW_OWN_PROFILE,
    PermissionChecks.UPDATE_OWN_PROFILE,
    PermissionChecks.VIEW_ALL_PROFILES,
    PermissionChecks.VIEW_ALL_JOBS,
    PermissionChecks.CREATE_JOB,
    PermissionChecks.UPDATE_OWN_JOB,
    PermissionChecks.DELETE_OWN_JOB,
    PermissionChecks.PUBLISH_JOB,
    PermissionChecks.VIEW_ALL_APPLICATIONS,
    PermissionChecks.APPROVE_APPLICATION,
    PermissionChecks.REJECT_APPLICATION,
    PermissionChecks.SEND_MESSAGE,
    PermissionChecks.VIEW_OWN_MESSAGES,
    PermissionChecks.VIEW_ANALYTICS,
    PermissionChecks.USE_AI_ENHANCEMENT,
    PermissionChecks.GENERATE_REPORTS,
    PermissionChecks.VIEW_REPORTS,
  ],
  
  producer: [
    PermissionChecks.VIEW_OWN_PROFILE,
    PermissionChecks.UPDATE_OWN_PROFILE,
    PermissionChecks.VIEW_ALL_PROFILES,
    PermissionChecks.VIEW_ALL_JOBS,
    PermissionChecks.CREATE_JOB,
    PermissionChecks.UPDATE_OWN_JOB,
    PermissionChecks.DELETE_OWN_JOB,
    PermissionChecks.PUBLISH_JOB,
    PermissionChecks.VIEW_ALL_APPLICATIONS,
    PermissionChecks.APPROVE_APPLICATION,
    PermissionChecks.REJECT_APPLICATION,
    PermissionChecks.SEND_MESSAGE,
    PermissionChecks.VIEW_OWN_MESSAGES,
    PermissionChecks.VIEW_ANALYTICS,
    PermissionChecks.USE_AI_ENHANCEMENT,
    PermissionChecks.GENERATE_REPORTS,
    PermissionChecks.VIEW_REPORTS,
    PermissionChecks.EXPORT_REPORTS,
  ],
  
  admin: [
    // Full access to everything
    PermissionChecks.CREATE_USER,
    PermissionChecks.VIEW_ALL_USERS,
    PermissionChecks.UPDATE_ANY_USER,
    PermissionChecks.DELETE_USER,
    PermissionChecks.VIEW_ALL_PROFILES,
    PermissionChecks.UPDATE_ANY_PROFILE,
    PermissionChecks.VERIFY_PROFILE,
    PermissionChecks.VIEW_ALL_MEDIA,
    PermissionChecks.DELETE_ANY_MEDIA,
    PermissionChecks.MODERATE_MEDIA,
    PermissionChecks.VIEW_ALL_JOBS,
    PermissionChecks.UPDATE_ANY_JOB,
    PermissionChecks.DELETE_ANY_JOB,
    PermissionChecks.PUBLISH_JOB,
    PermissionChecks.VIEW_ALL_APPLICATIONS,
    PermissionChecks.APPROVE_APPLICATION,
    PermissionChecks.REJECT_APPLICATION,
    PermissionChecks.VIEW_ALL_MESSAGES,
    PermissionChecks.MODERATE_MESSAGES,
    PermissionChecks.VIEW_ANALYTICS,
    PermissionChecks.EXPORT_ANALYTICS,
    PermissionChecks.MANAGE_SETTINGS,
    PermissionChecks.VIEW_SETTINGS,
    PermissionChecks.MODERATE_CONTENT,
    PermissionChecks.APPROVE_CONTENT,
    PermissionChecks.REJECT_CONTENT,
    PermissionChecks.VERIFY_USERS,
    PermissionChecks.UNVERIFY_USERS,
    PermissionChecks.USE_AI_ENHANCEMENT,
    PermissionChecks.MANAGE_AI_SETTINGS,
    PermissionChecks.GENERATE_REPORTS,
    PermissionChecks.VIEW_REPORTS,
    PermissionChecks.EXPORT_REPORTS,
  ],
};

/**
 * Express middleware for permission checking
 */
export function requirePermission(permission: PermissionCheck) {
  return async (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const context: PermissionContext = {
      userId: req.user.id,
      userRole: req.user.role,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      timestamp: new Date()
    };

    const hasAccess = await hasPermission(context, permission);
    if (!hasAccess) {
      // Log permission denial for auditing
      await logPermissionAttempt(context, permission, false);
      return res.status(403).json({ 
        error: "Permission denied",
        required: permission
      });
    }

    // Log successful permission check
    await logPermissionAttempt(context, permission, true);
    next();
  };
}

/**
 * Express middleware for checking any of multiple permissions
 */
export function requireAnyPermission(permissions: PermissionCheck[]) {
  return async (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const context: PermissionContext = {
      userId: req.user.id,
      userRole: req.user.role,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      timestamp: new Date()
    };

    const hasAccess = await hasAnyPermission(context, permissions);
    if (!hasAccess) {
      return res.status(403).json({ 
        error: "Permission denied",
        required: permissions
      });
    }

    next();
  };
}