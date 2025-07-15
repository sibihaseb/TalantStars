import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  PermissionGate, 
  AdminGate, 
  ProducerGate, 
  ManagerGate, 
  UserManagementGate, 
  JobManagementGate, 
  MediaUploadGate, 
  AIFeaturesGate,
  PermissionButton,
  PermissionStatus 
} from '@/components/PermissionGate';
import { usePermissions, PermissionSets } from '@/hooks/usePermissions';
import { useRoleCheck } from '@/hooks/usePermissions';
import { Shield, Users, Briefcase, Upload, Brain, Settings } from 'lucide-react';

/**
 * COMPREHENSIVE PERMISSION SYSTEM EXAMPLES
 * 
 * This component demonstrates how to use the permission system throughout the platform.
 * Use these patterns in your actual components.
 */

export default function PermissionExamples() {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
  const { isAdmin, isProducer, isManager, isTalent, role } = useRoleCheck();

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Permission System Examples</h1>
        <Badge variant="outline">Current Role: {role}</Badge>
      </div>

      {/* Role-Based Gates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Role-Based Access Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AdminGate>
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <h3 className="font-semibold text-red-800">Admin Only Content</h3>
              <p className="text-sm text-red-600">This content is only visible to administrators.</p>
            </div>
          </AdminGate>

          <ProducerGate>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="font-semibold text-blue-800">Producer/Admin Content</h3>
              <p className="text-sm text-blue-600">This content is visible to producers and admins.</p>
            </div>
          </ProducerGate>

          <ManagerGate>
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <h3 className="font-semibold text-green-800">Manager/Admin Content</h3>
              <p className="text-sm text-green-600">This content is visible to managers and admins.</p>
            </div>
          </ManagerGate>

          {/* Show fallback content for non-admin users */}
          <AdminGate 
            fallback={
              <div className="p-4 bg-gray-50 border border-gray-200 rounded">
                <h3 className="font-semibold text-gray-700">Restricted Content</h3>
                <p className="text-sm text-gray-600">You need admin access to view this content.</p>
              </div>
            }
          >
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <h3 className="font-semibold text-red-800">Secret Admin Content</h3>
              <p className="text-sm text-red-600">This is sensitive admin information.</p>
            </div>
          </AdminGate>
        </CardContent>
      </Card>

      {/* Permission-Based Gates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permission-Based Access Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <UserManagementGate>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded">
              <h3 className="font-semibold text-purple-800">User Management</h3>
              <p className="text-sm text-purple-600">Create, update, or delete users.</p>
            </div>
          </UserManagementGate>

          <JobManagementGate>
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded">
              <h3 className="font-semibold text-indigo-800">Job Management</h3>
              <p className="text-sm text-indigo-600">Create, update, or delete job postings.</p>
            </div>
          </JobManagementGate>

          <MediaUploadGate>
            <div className="p-4 bg-orange-50 border border-orange-200 rounded">
              <h3 className="font-semibold text-orange-800">Media Upload</h3>
              <p className="text-sm text-orange-600">Upload media files to the platform.</p>
            </div>
          </MediaUploadGate>

          <AIFeaturesGate>
            <div className="p-4 bg-teal-50 border border-teal-200 rounded">
              <h3 className="font-semibold text-teal-800">AI Features</h3>
              <p className="text-sm text-teal-600">Access AI-powered features and tools.</p>
            </div>
          </AIFeaturesGate>

          {/* Specific permission checks */}
          <PermissionGate permission={PermissionSets.CONTENT.CREATE}>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h3 className="font-semibold text-yellow-800">Content Creation</h3>
              <p className="text-sm text-yellow-600">Create new content on the platform.</p>
            </div>
          </PermissionGate>

          <PermissionGate 
            permissions={[PermissionSets.JOBS.CREATE, PermissionSets.JOBS.UPDATE]}
            showError={true}
          >
            <div className="p-4 bg-pink-50 border border-pink-200 rounded">
              <h3 className="font-semibold text-pink-800">Job Creation & Updates</h3>
              <p className="text-sm text-pink-600">Create and update job postings.</p>
            </div>
          </PermissionGate>

          {/* Multiple permissions - require all */}
          <PermissionGate 
            permissions={[PermissionSets.ADMIN.USER_MANAGEMENT, PermissionSets.ADMIN.SYSTEM_SETTINGS]}
            requireAll={true}
          >
            <div className="p-4 bg-gray-50 border border-gray-200 rounded">
              <h3 className="font-semibold text-gray-800">Advanced Admin Functions</h3>
              <p className="text-sm text-gray-600">Requires both user management and system settings permissions.</p>
            </div>
          </PermissionGate>
        </CardContent>
      </Card>

      {/* Permission Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Permission-Based Buttons
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <PermissionButton 
              permission={PermissionSets.USER_MANAGEMENT.CREATE}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Create User
            </PermissionButton>

            <PermissionButton 
              permissions={[PermissionSets.JOBS.CREATE, PermissionSets.JOBS.UPDATE]}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Manage Jobs
            </PermissionButton>

            <PermissionButton 
              role={["admin", "producer"]}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            >
              Admin/Producer Action
            </PermissionButton>

            <PermissionButton 
              permission={PermissionSets.MEDIA.UPLOAD}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded"
            >
              Upload Media
            </PermissionButton>

            <PermissionButton 
              permission={PermissionSets.AI.USE_ADVANCED}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded"
            >
              AI Features
            </PermissionButton>
          </div>
        </CardContent>
      </Card>

      {/* Permission Status Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Permission Status Indicators
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">User Management</h4>
              <PermissionStatus permission={PermissionSets.USER_MANAGEMENT.CREATE} />
            </div>
            <div>
              <h4 className="font-medium mb-2">Job Creation</h4>
              <PermissionStatus permission={PermissionSets.JOBS.CREATE} />
            </div>
            <div>
              <h4 className="font-medium mb-2">Media Upload</h4>
              <PermissionStatus permission={PermissionSets.MEDIA.UPLOAD} />
            </div>
            <div>
              <h4 className="font-medium mb-2">AI Features</h4>
              <PermissionStatus permission={PermissionSets.AI.USE_BASIC} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Programmatic Permission Checks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Programmatic Permission Checks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Role Checks</h4>
              <ul className="text-sm space-y-1">
                <li>Is Admin: <Badge variant={isAdmin ? "default" : "secondary"}>{isAdmin ? "Yes" : "No"}</Badge></li>
                <li>Is Producer: <Badge variant={isProducer ? "default" : "secondary"}>{isProducer ? "Yes" : "No"}</Badge></li>
                <li>Is Manager: <Badge variant={isManager ? "default" : "secondary"}>{isManager ? "Yes" : "No"}</Badge></li>
                <li>Is Talent: <Badge variant={isTalent ? "default" : "secondary"}>{isTalent ? "Yes" : "No"}</Badge></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Permission Checks</h4>
              <ul className="text-sm space-y-1">
                <li>Can Create Users: <Badge variant={hasPermission(PermissionSets.USER_MANAGEMENT.CREATE) ? "default" : "secondary"}>{hasPermission(PermissionSets.USER_MANAGEMENT.CREATE) ? "Yes" : "No"}</Badge></li>
                <li>Can Create Jobs: <Badge variant={hasPermission(PermissionSets.JOBS.CREATE) ? "default" : "secondary"}>{hasPermission(PermissionSets.JOBS.CREATE) ? "Yes" : "No"}</Badge></li>
                <li>Can Upload Media: <Badge variant={hasPermission(PermissionSets.MEDIA.UPLOAD) ? "default" : "secondary"}>{hasPermission(PermissionSets.MEDIA.UPLOAD) ? "Yes" : "No"}</Badge></li>
                <li>Can Use AI: <Badge variant={hasPermission(PermissionSets.AI.USE_BASIC) ? "default" : "secondary"}>{hasPermission(PermissionSets.AI.USE_BASIC) ? "Yes" : "No"}</Badge></li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Example 1: Conditional Rendering</h4>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`// Show different content based on role
{isAdmin && <AdminPanel />}
{isProducer && <ProducerTools />}
{isTalent && <TalentDashboard />}

// Show content based on permissions
{hasPermission(PermissionSets.JOBS.CREATE) && <CreateJobButton />}
{hasAnyPermission([PermissionSets.JOBS.CREATE, PermissionSets.JOBS.UPDATE]) && <JobManagementPanel />}`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Example 2: Function Calls</h4>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`// Check permission before action
const handleDeleteUser = (userId) => {
  if (!hasPermission(PermissionSets.USER_MANAGEMENT.DELETE)) {
    toast.error("You don't have permission to delete users");
    return;
  }
  // Proceed with deletion
};

// Multiple permission check
const handleAdvancedFeature = () => {
  if (!hasAllPermissions([PermissionSets.ADMIN.ALL, PermissionSets.SYSTEM.CONFIGURE])) {
    toast.error("Insufficient permissions for this feature");
    return;
  }
  // Proceed with advanced feature
};`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Example of how to use in a real component
export function ExampleJobManagementComponent() {
  const { hasPermission } = usePermissions();
  const { isAdmin, isProducer } = useRoleCheck();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Job Management</h2>
      
      {/* Role-based access */}
      {(isAdmin || isProducer) && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Producer Controls</h3>
          <p>Producer-specific functionality here</p>
        </div>
      )}

      {/* Permission-based actions */}
      <div className="space-y-2">
        <JobManagementGate>
          <Button>Create New Job</Button>
        </JobManagementGate>

        <PermissionGate permission={PermissionSets.JOBS.UPDATE}>
          <Button variant="outline">Edit Jobs</Button>
        </PermissionGate>

        <PermissionGate permission={PermissionSets.JOBS.DELETE}>
          <Button variant="destructive">Delete Jobs</Button>
        </PermissionGate>
      </div>

      {/* Conditional content */}
      {hasPermission(PermissionSets.JOBS.CREATE) && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
          <p>Additional tools for job creators</p>
        </div>
      )}
    </div>
  );
}