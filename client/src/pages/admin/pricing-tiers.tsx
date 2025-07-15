import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Crown, 
  Star, 
  Users, 
  Camera, 
  Video, 
  Headphones, 
  HardDrive, 
  Briefcase, 
  Mail, 
  BarChart3, 
  MessageSquare, 
  Brain, 
  Search, 
  Shield, 
  Palette, 
  Code, 
  TrendingUp, 
  UserCog, 
  VideoIcon, 
  Download, 
  Settings,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const pricingTierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.string().min(1, "Price is required"),
  duration: z.string().min(1, "Duration is required"),
  features: z.array(z.string()).min(1, "At least one feature is required"),
  active: z.boolean(),
  
  // Resource limits
  maxPhotos: z.string().min(0),
  maxVideos: z.string().min(0),
  maxAudioFiles: z.string().min(0),
  maxStorageGB: z.string().min(1),
  maxProjects: z.string().min(0),
  maxApplicationsPerMonth: z.string().min(0),
  
  // Feature access
  hasAnalytics: z.boolean(),
  hasRealtimeMessaging: z.boolean(),
  hasAIFeatures: z.boolean(),
  hasAdvancedSearch: z.boolean(),
  hasPrioritySupport: z.boolean(),
  hasCustomBranding: z.boolean(),
  hasAPIAccess: z.boolean(),
  hasAdvancedAnalytics: z.boolean(),
  hasTeamCollaboration: z.boolean(),
  hasVideoConferencing: z.boolean(),
  
  // Permissions
  canCreateJobs: z.boolean(),
  canViewTalentProfiles: z.boolean(),
  canExportData: z.boolean(),
  canManageTeam: z.boolean(),
  canAccessReports: z.boolean(),
});

type PricingTierForm = z.infer<typeof pricingTierSchema>;

const resourceLimits = [
  { key: 'maxPhotos', label: 'Max Photos', icon: Camera, description: 'Maximum photo uploads allowed' },
  { key: 'maxVideos', label: 'Max Videos', icon: Video, description: 'Maximum video uploads allowed' },
  { key: 'maxAudioFiles', label: 'Max Audio Files', icon: Headphones, description: 'Maximum audio file uploads' },
  { key: 'maxStorageGB', label: 'Storage (GB)', icon: HardDrive, description: 'Total storage limit in GB' },
  { key: 'maxProjects', label: 'Max Projects', icon: Briefcase, description: 'Maximum active projects' },
  { key: 'maxApplicationsPerMonth', label: 'Applications/Month', icon: Mail, description: 'Job applications per month' },
];

const featureAccess = [
  { key: 'hasAnalytics', label: 'Analytics', icon: BarChart3, description: 'Basic analytics dashboard' },
  { key: 'hasRealtimeMessaging', label: 'Real-time Messaging', icon: MessageSquare, description: 'Live messaging system' },
  { key: 'hasAIFeatures', label: 'AI Features', icon: Brain, description: 'AI-powered profile optimization' },
  { key: 'hasAdvancedSearch', label: 'Advanced Search', icon: Search, description: 'Enhanced search capabilities' },
  { key: 'hasPrioritySupport', label: 'Priority Support', icon: Shield, description: 'Priority customer support' },
  { key: 'hasCustomBranding', label: 'Custom Branding', icon: Palette, description: 'Brand customization options' },
  { key: 'hasAPIAccess', label: 'API Access', icon: Code, description: 'Developer API access' },
  { key: 'hasAdvancedAnalytics', label: 'Advanced Analytics', icon: TrendingUp, description: 'Advanced reporting tools' },
  { key: 'hasTeamCollaboration', label: 'Team Collaboration', icon: Users, description: 'Team management features' },
  { key: 'hasVideoConferencing', label: 'Video Conferencing', icon: VideoIcon, description: 'Built-in video calls' },
];

const permissions = [
  { key: 'canCreateJobs', label: 'Create Jobs', icon: Plus, description: 'Post job opportunities' },
  { key: 'canViewTalentProfiles', label: 'View Talent Profiles', icon: Users, description: 'Browse talent profiles' },
  { key: 'canExportData', label: 'Export Data', icon: Download, description: 'Download data exports' },
  { key: 'canManageTeam', label: 'Manage Team', icon: UserCog, description: 'Team management access' },
  { key: 'canAccessReports', label: 'Access Reports', icon: BarChart3, description: 'View detailed reports' },
];

export default function PricingTiersPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pricingTiers, isLoading } = useQuery({
    queryKey: ['/api/admin/pricing-tiers'],
  });

  const form = useForm<PricingTierForm>({
    resolver: zodResolver(pricingTierSchema),
    defaultValues: {
      name: '',
      price: '',
      duration: '',
      features: [],
      active: true,
      maxPhotos: '0',
      maxVideos: '0',
      maxAudioFiles: '0',
      maxStorageGB: '1',
      maxProjects: '0',
      maxApplicationsPerMonth: '0',
      hasAnalytics: false,
      hasRealtimeMessaging: false,
      hasAIFeatures: false,
      hasAdvancedSearch: false,
      hasPrioritySupport: false,
      hasCustomBranding: false,
      hasAPIAccess: false,
      hasAdvancedAnalytics: false,
      hasTeamCollaboration: false,
      hasVideoConferencing: false,
      canCreateJobs: false,
      canViewTalentProfiles: true,
      canExportData: false,
      canManageTeam: false,
      canAccessReports: false,
    },
  });

  const createTierMutation = useMutation({
    mutationFn: (data: PricingTierForm) => apiRequest('POST', '/api/admin/pricing-tiers', {
      ...data,
      price: parseFloat(data.price),
      duration: parseInt(data.duration),
      maxPhotos: parseInt(data.maxPhotos),
      maxVideos: parseInt(data.maxVideos),
      maxAudioFiles: parseInt(data.maxAudioFiles),
      maxStorageGB: parseInt(data.maxStorageGB),
      maxProjects: parseInt(data.maxProjects),
      maxApplicationsPerMonth: parseInt(data.maxApplicationsPerMonth),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pricing-tiers'] });
      setIsCreateDialogOpen(false);
      setEditingTier(null);
      form.reset();
      toast({
        title: "Success",
        description: "Pricing tier saved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save pricing tier",
        variant: "destructive",
      });
    },
  });

  const updateTierMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PricingTierForm }) => 
      apiRequest('PUT', `/api/admin/pricing-tiers/${id}`, {
        ...data,
        price: parseFloat(data.price),
        duration: parseInt(data.duration),
        maxPhotos: parseInt(data.maxPhotos),
        maxVideos: parseInt(data.maxVideos),
        maxAudioFiles: parseInt(data.maxAudioFiles),
        maxStorageGB: parseInt(data.maxStorageGB),
        maxProjects: parseInt(data.maxProjects),
        maxApplicationsPerMonth: parseInt(data.maxApplicationsPerMonth),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pricing-tiers'] });
      setEditingTier(null);
      form.reset();
      toast({
        title: "Success",
        description: "Pricing tier updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update pricing tier",
        variant: "destructive",
      });
    },
  });

  const deleteTierMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/admin/pricing-tiers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pricing-tiers'] });
      toast({
        title: "Success",
        description: "Pricing tier deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete pricing tier",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: PricingTierForm) => {
    if (editingTier) {
      updateTierMutation.mutate({ id: editingTier.id, data });
    } else {
      createTierMutation.mutate(data);
    }
  };

  const handleEdit = (tier: any) => {
    setEditingTier(tier);
    form.reset({
      name: tier.name,
      price: tier.price.toString(),
      duration: tier.duration.toString(),
      features: tier.features || [],
      active: tier.active,
      maxPhotos: tier.maxPhotos?.toString() || '0',
      maxVideos: tier.maxVideos?.toString() || '0',
      maxAudioFiles: tier.maxAudioFiles?.toString() || '0',
      maxStorageGB: tier.maxStorageGB?.toString() || '1',
      maxProjects: tier.maxProjects?.toString() || '0',
      maxApplicationsPerMonth: tier.maxApplicationsPerMonth?.toString() || '0',
      hasAnalytics: tier.hasAnalytics || false,
      hasRealtimeMessaging: tier.hasRealtimeMessaging || false,
      hasAIFeatures: tier.hasAIFeatures || false,
      hasAdvancedSearch: tier.hasAdvancedSearch || false,
      hasPrioritySupport: tier.hasPrioritySupport || false,
      hasCustomBranding: tier.hasCustomBranding || false,
      hasAPIAccess: tier.hasAPIAccess || false,
      hasAdvancedAnalytics: tier.hasAdvancedAnalytics || false,
      hasTeamCollaboration: tier.hasTeamCollaboration || false,
      hasVideoConferencing: tier.hasVideoConferencing || false,
      canCreateJobs: tier.canCreateJobs || false,
      canViewTalentProfiles: tier.canViewTalentProfiles ?? true,
      canExportData: tier.canExportData || false,
      canManageTeam: tier.canManageTeam || false,
      canAccessReports: tier.canAccessReports || false,
    });
    setIsCreateDialogOpen(true);
  };

  const renderTierCard = (tier: any) => (
    <Card key={tier.id} className="relative">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              {tier.name}
              {tier.name.toLowerCase().includes('premium') && <Crown className="h-4 w-4 text-yellow-500" />}
              {tier.name.toLowerCase().includes('pro') && <Star className="h-4 w-4 text-blue-500" />}
            </CardTitle>
            <CardDescription>
              ${tier.price}/{tier.duration} days
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={tier.active ? "default" : "secondary"}>
              {tier.active ? "Active" : "Inactive"}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(tier)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteTierMutation.mutate(tier.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Resource Limits */}
          <div>
            <h4 className="font-semibold mb-2">Resource Limits</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Photos: {tier.maxPhotos || 0 === 0 ? "Unlimited" : tier.maxPhotos}</div>
              <div>Videos: {tier.maxVideos || 0 === 0 ? "Unlimited" : tier.maxVideos}</div>
              <div>Audio: {tier.maxAudioFiles || 0 === 0 ? "Unlimited" : tier.maxAudioFiles}</div>
              <div>Storage: {tier.maxStorageGB || 1}GB</div>
              <div>Projects: {tier.maxProjects || 0 === 0 ? "Unlimited" : tier.maxProjects}</div>
              <div>Applications: {tier.maxApplicationsPerMonth || 0 === 0 ? "Unlimited" : tier.maxApplicationsPerMonth}/month</div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold mb-2">Features</h4>
            <div className="flex flex-wrap gap-1">
              {tier.hasAnalytics && <Badge variant="outline">Analytics</Badge>}
              {tier.hasRealtimeMessaging && <Badge variant="outline">Real-time Messaging</Badge>}
              {tier.hasAIFeatures && <Badge variant="outline">AI Features</Badge>}
              {tier.hasAdvancedSearch && <Badge variant="outline">Advanced Search</Badge>}
              {tier.hasPrioritySupport && <Badge variant="outline">Priority Support</Badge>}
              {tier.hasCustomBranding && <Badge variant="outline">Custom Branding</Badge>}
              {tier.hasAPIAccess && <Badge variant="outline">API Access</Badge>}
              {tier.hasAdvancedAnalytics && <Badge variant="outline">Advanced Analytics</Badge>}
              {tier.hasTeamCollaboration && <Badge variant="outline">Team Collaboration</Badge>}
              {tier.hasVideoConferencing && <Badge variant="outline">Video Conferencing</Badge>}
            </div>
          </div>

          {/* Permissions */}
          <div>
            <h4 className="font-semibold mb-2">Permissions</h4>
            <div className="flex flex-wrap gap-1">
              {tier.canCreateJobs && <Badge variant="secondary">Create Jobs</Badge>}
              {tier.canViewTalentProfiles && <Badge variant="secondary">View Profiles</Badge>}
              {tier.canExportData && <Badge variant="secondary">Export Data</Badge>}
              {tier.canManageTeam && <Badge variant="secondary">Manage Team</Badge>}
              {tier.canAccessReports && <Badge variant="secondary">Access Reports</Badge>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pricing Tiers</h1>
          <p className="text-muted-foreground">
            Manage subscription tiers with specific resource limits and feature access
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingTier(null);
              form.reset();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Tier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTier ? 'Edit Pricing Tier' : 'Create New Pricing Tier'}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Basic, Pro, Premium" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (days)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-y-0 gap-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Active</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Resource Limits */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Resource Limits</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {resourceLimits.map((limit) => (
                      <FormField
                        key={limit.key}
                        control={form.control}
                        name={limit.key as keyof PricingTierForm}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <limit.icon className="h-4 w-4" />
                              {limit.label}
                            </FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormDescription className="text-xs">
                              {limit.description}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Feature Access */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Feature Access</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {featureAccess.map((feature) => (
                      <FormField
                        key={feature.key}
                        control={form.control}
                        name={feature.key as keyof PricingTierForm}
                        render={({ field }) => (
                          <FormItem className="flex items-center space-y-0 gap-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="flex items-center gap-2">
                              <feature.icon className="h-4 w-4" />
                              <FormLabel>{feature.label}</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Permissions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {permissions.map((permission) => (
                      <FormField
                        key={permission.key}
                        control={form.control}
                        name={permission.key as keyof PricingTierForm}
                        render={({ field }) => (
                          <FormItem className="flex items-center space-y-0 gap-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="flex items-center gap-2">
                              <permission.icon className="h-4 w-4" />
                              <FormLabel>{permission.label}</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createTierMutation.isPending || updateTierMutation.isPending}
                  >
                    {editingTier ? 'Update' : 'Create'} Tier
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pricing Tiers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pricingTiers?.map(renderTierCard)}
        </div>
      )}
    </div>
  );
}