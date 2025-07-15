import { storage } from "./storage";
import { DefaultRolePermissions } from "./permissions";

/**
 * Initialize default role permissions in the database
 */
async function initializeRolePermissions() {
  console.log("Initializing default role permissions...");
  
  try {
    // Clear existing role permissions
    console.log("Clearing existing role permissions...");
    
    // Initialize permissions for each role
    for (const [role, permissions] of Object.entries(DefaultRolePermissions)) {
      console.log(`Setting up permissions for role: ${role}`);
      
      for (const permission of permissions) {
        try {
          await storage.createRolePermission({
            role: role as any,
            category: permission.category as any,
            action: permission.action as any,
            resource: permission.resource,
            granted: true
          });
          console.log(`✓ Created permission: ${permission.category}.${permission.action}${permission.resource ? ` (${permission.resource})` : ''}`);
        } catch (error) {
          // Skip if permission already exists
          if (error.message?.includes('duplicate')) {
            console.log(`  Already exists: ${permission.category}.${permission.action}${permission.resource ? ` (${permission.resource})` : ''}`);
          } else {
            console.error(`  Error creating permission: ${error.message}`);
          }
        }
      }
    }
    
    console.log("✅ Role permissions initialized successfully!");
    
  } catch (error) {
    console.error("❌ Error initializing role permissions:", error);
  }
}

/**
 * Grant comprehensive admin permissions to a specific user
 */
async function grantAdminPermissions(userId: string) {
  console.log(`Granting admin permissions to user: ${userId}`);
  
  const adminPermissions = DefaultRolePermissions.admin;
  
  for (const permission of adminPermissions) {
    try {
      await storage.createUserPermission({
        userId,
        category: permission.category as any,
        action: permission.action as any,
        resource: permission.resource,
        granted: true,
        grantedBy: userId // Self-granted for admin
      });
      console.log(`✓ Granted: ${permission.category}.${permission.action}${permission.resource ? ` (${permission.resource})` : ''}`);
    } catch (error) {
      if (error.message?.includes('duplicate')) {
        console.log(`  Already granted: ${permission.category}.${permission.action}${permission.resource ? ` (${permission.resource})` : ''}`);
      } else {
        console.error(`  Error granting permission: ${error.message}`);
      }
    }
  }
  
  console.log("✅ Admin permissions granted successfully!");
}

// Export functions for use in other scripts
export { initializeRolePermissions, grantAdminPermissions };

// Run initialization if script is called directly
if (require.main === module) {
  initializeRolePermissions()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Initialization failed:", error);
      process.exit(1);
    });
}