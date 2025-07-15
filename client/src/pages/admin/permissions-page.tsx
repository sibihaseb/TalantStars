import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, Users, Settings, Check, X, Plus, AlertTriangle } from 'lucide-react';

interface Permission {
  id: number;
  category: string;
  action: string;
  resource: string;
  granted: boolean;
  expiresAt?: string;
  conditions?: any;
  grantedBy?: string;
  grantedAt: string;
}

interface RolePermission extends Permission {
  role: string;
}

interface UserPermission extends Permission {
  userId: string;
  user?: {
    username: string;
    email: string;
    role: string;
  };
}

export default function PermissionsPage() {
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [activeTab, setActiveTab] = useState('roles');

  // Fetch role permissions
  const { data: rolePermissions, isLoading: rolePermissionsLoading } = useQuery<Record<string, RolePermission[]>>({
    queryKey: ['/api/admin/permissions/roles'],
  });

  // Fetch permission categories
  const { data: categories } = useQuery<{ categories: string[]; actions: string[] }>({
    queryKey: ['/api/admin/permissions/categories'],
  });

  // Fetch users for user permissions
  const { data: users } = useQuery<Array<{ id: number; username: string; email: string; role: string }>>({
    queryKey: ['/api/admin/users'],
  });

  // Fetch specific user permissions
  const { data: userPermissionData, isLoading: userPermissionsLoading } = useQuery({
    queryKey: ['/api/admin/permissions/users', selectedUserId],
    enabled: !!selectedUserId,
  });

  // Initialize role permissions
  const initializeRolePermissions = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/initialize-role-permissions');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Role Permissions Initialized",
        description: `${data.created} permissions created out of ${data.total} total`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/permissions/roles'] });
    },
    onError: (error: any) => {
      toast({
        title: "Initialization Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Test permissions
  const testPermissions = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/test-permissions');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Permission Test Completed",
        description: `Permission created and tested successfully. Has permission: ${data.hasPermission}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create role permission
  const createRolePermission = useMutation({
    mutationFn: async (data: { role: string; category: string; action: string; resource: string; granted: boolean }) => {
      const response = await apiRequest('POST', '/api/admin/permissions/roles', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Role Permission Created",
        description: "Permission has been added to the role",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/permissions/roles'] });
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create user permission
  const createUserPermission = useMutation({
    mutationFn: async (data: { userId: string; category: string; action: string; resource: string; granted: boolean; expiresAt?: string }) => {
      const response = await apiRequest('POST', `/api/admin/permissions/users/${data.userId}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User Permission Created",
        description: "Permission has been added to the user",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/permissions/users', selectedUserId] });
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const RolePermissionsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Role-Based Permissions</h3>
          <p className="text-sm text-muted-foreground">Manage permissions for user roles</p>
        </div>
        <div className="space-x-2">
          <Button 
            onClick={() => initializeRolePermissions.mutate()}
            disabled={initializeRolePermissions.isPending}
            variant="outline"
          >
            {initializeRolePermissions.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Initialize Defaults
          </Button>
          <Button 
            onClick={() => testPermissions.mutate()}
            disabled={testPermissions.isPending}
            variant="outline"
          >
            {testPermissions.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Test Permissions
          </Button>
        </div>
      </div>

      {rolePermissionsLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4">
          {Object.entries(rolePermissions || {}).map(([role, permissions]) => (
            <Card key={role}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {role.toUpperCase()} Role
                  <Badge variant="outline">{permissions.length} permissions</Badge>
                </CardTitle>
                <CardDescription>
                  Permissions for {role} role users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {permissions.map((permission) => (
                    <div key={`${permission.category}-${permission.action}-${permission.resource}`} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        {permission.granted ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-600" />
                        )}
                        <Badge variant="outline">{permission.category}</Badge>
                        <span className="text-sm font-medium">{permission.action}</span>
                        <span className="text-sm text-muted-foreground">on {permission.resource}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const UserPermissionsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">User-Specific Permissions</h3>
          <p className="text-sm text-muted-foreground">Override role permissions for specific users</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select User</CardTitle>
          <CardDescription>Choose a user to manage their permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a user" />
            </SelectTrigger>
            <SelectContent>
              {users?.map((user) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  {user.username} ({user.email}) - {user.role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedUserId && (
        <Card>
          <CardHeader>
            <CardTitle>User Permissions</CardTitle>
            <CardDescription>
              Specific permissions for {userPermissionData?.user?.username}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userPermissionsLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">User-Specific Permissions</h4>
                  <div className="grid gap-2">
                    {userPermissionData?.userPermissions?.map((permission: UserPermission) => (
                      <div key={permission.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          {permission.granted ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-600" />
                          )}
                          <Badge variant="outline">{permission.category}</Badge>
                          <span className="text-sm font-medium">{permission.action}</span>
                          <span className="text-sm text-muted-foreground">on {permission.resource}</span>
                          {permission.expiresAt && (
                            <Badge variant="destructive" className="text-xs">
                              Expires: {new Date(permission.expiresAt).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Role-Based Permissions</h4>
                  <div className="grid gap-2">
                    {userPermissionData?.rolePermissions?.map((permission: RolePermission) => (
                      <div key={`${permission.category}-${permission.action}-${permission.resource}`} className="flex items-center justify-between p-2 border rounded bg-muted/50">
                        <div className="flex items-center gap-2">
                          {permission.granted ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-600" />
                          )}
                          <Badge variant="secondary">{permission.category}</Badge>
                          <span className="text-sm font-medium">{permission.action}</span>
                          <span className="text-sm text-muted-foreground">on {permission.resource}</span>
                          <Badge variant="outline" className="text-xs">From role</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  const PermissionCreatorTab = () => {
    const [newPermission, setNewPermission] = useState({
      type: 'role',
      role: '',
      userId: '',
      category: '',
      action: '',
      resource: '',
      granted: true,
      expiresAt: ''
    });

    const handleCreate = () => {
      if (newPermission.type === 'role') {
        createRolePermission.mutate({
          role: newPermission.role,
          category: newPermission.category,
          action: newPermission.action,
          resource: newPermission.resource,
          granted: newPermission.granted
        });
      } else {
        createUserPermission.mutate({
          userId: newPermission.userId,
          category: newPermission.category,
          action: newPermission.action,
          resource: newPermission.resource,
          granted: newPermission.granted,
          expiresAt: newPermission.expiresAt || undefined
        });
      }
      
      setNewPermission({
        type: 'role',
        role: '',
        userId: '',
        category: '',
        action: '',
        resource: '',
        granted: true,
        expiresAt: ''
      });
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Permission
          </CardTitle>
          <CardDescription>Add new permissions to roles or users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Permission Type</Label>
              <Select value={newPermission.type} onValueChange={(value) => setNewPermission({...newPermission, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="role">Role Permission</SelectItem>
                  <SelectItem value="user">User Permission</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newPermission.type === 'role' ? (
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={newPermission.role} onValueChange={(value) => setNewPermission({...newPermission, role: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="producer">Producer</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="talent">Talent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <Label htmlFor="user">User</Label>
                <Select value={newPermission.userId} onValueChange={(value) => setNewPermission({...newPermission, userId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.username} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={newPermission.category} onValueChange={(value) => setNewPermission({...newPermission, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="action">Action</Label>
              <Select value={newPermission.action} onValueChange={(value) => setNewPermission({...newPermission, action: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.actions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="resource">Resource</Label>
              <Input 
                id="resource"
                value={newPermission.resource}
                onChange={(e) => setNewPermission({...newPermission, resource: e.target.value})}
                placeholder="e.g., all, own, specific_id"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="granted"
                checked={newPermission.granted}
                onChange={(e) => setNewPermission({...newPermission, granted: e.target.checked})}
              />
              <Label htmlFor="granted">Grant Permission</Label>
            </div>

            {newPermission.type === 'user' && (
              <div>
                <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                <Input 
                  id="expiresAt"
                  type="datetime-local"
                  value={newPermission.expiresAt}
                  onChange={(e) => setNewPermission({...newPermission, expiresAt: e.target.value})}
                />
              </div>
            )}
          </div>

          <Button 
            onClick={handleCreate}
            disabled={!newPermission.category || !newPermission.action || !newPermission.resource || 
                     (newPermission.type === 'role' && !newPermission.role) || 
                     (newPermission.type === 'user' && !newPermission.userId)}
            className="w-full"
          >
            Create Permission
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Permission Management</h1>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
        <div>
          <p className="text-sm text-yellow-800">
            <strong>Permission System:</strong> This system uses category-based permissions with specific actions and resources. 
            Role permissions are inherited by all users with that role, while user permissions override role permissions.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="roles">Role Permissions</TabsTrigger>
          <TabsTrigger value="users">User Permissions</TabsTrigger>
          <TabsTrigger value="create">Create Permission</TabsTrigger>
        </TabsList>
        
        <TabsContent value="roles" className="space-y-4">
          <RolePermissionsTab />
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <UserPermissionsTab />
        </TabsContent>
        
        <TabsContent value="create" className="space-y-4">
          <PermissionCreatorTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}