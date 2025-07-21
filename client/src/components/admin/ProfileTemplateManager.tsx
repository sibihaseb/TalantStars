import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Palette, 
  Crown, 
  Star, 
  Settings,
  CheckCircle,
  XCircle,
  Layout,
  Zap,
  Sparkles
} from 'lucide-react';

interface PricingTier {
  id: number;
  name: string;
  price: number;
  category: string;
  features: string[];
}

export default function ProfileTemplateManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all pricing tiers
  const { data: pricingTiers = [], isLoading } = useQuery<PricingTier[]>({
    queryKey: ["/api/admin/pricing-tiers"],
  });

  // Toggle profile templates feature for a tier
  const toggleTemplatesMutation = useMutation({
    mutationFn: async ({ tierId, enabled }: { tierId: number; enabled: boolean }) => {
      const response = await apiRequest('POST', `/api/admin/pricing-tiers/${tierId}/toggle-templates`, { enabled });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Template Access Updated",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pricing-tiers"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update template access",
        variant: "destructive",
      });
    }
  });

  const hasTemplateAccess = (tier: PricingTier) => {
    return tier.features.includes('profile_templates_all');
  };

  const handleToggleAccess = (tierId: number, currentAccess: boolean) => {
    toggleTemplatesMutation.mutate({ tierId, enabled: !currentAccess });
  };

  const templates = [
    { id: 'classic', name: 'Classic', icon: Layout, color: 'bg-blue-500', description: 'Professional and timeless' },
    { id: 'modern', name: 'Modern', icon: Zap, color: 'bg-purple-500', description: 'Sleek and contemporary' },
    { id: 'artistic', name: 'Artistic', icon: Palette, color: 'bg-pink-500', description: 'Creative and expressive' },
    { id: 'minimal', name: 'Minimal', icon: Sparkles, color: 'bg-gray-500', description: 'Clean and focused' },
    { id: 'cinematic', name: 'Cinematic', icon: Crown, color: 'bg-yellow-500', description: 'Dramatic and bold' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Palette className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Profile Template Management</h1>
          <p className="text-gray-600">Configure which pricing tiers have access to premium profile templates</p>
        </div>
      </div>

      {/* Current Template Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Template Access Status
          </CardTitle>
          <CardDescription>
            All users currently have access to all profile templates. Use the controls below to restrict premium templates to specific tiers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {templates.map((template) => {
              const Icon = template.icon;
              return (
                <div key={template.id} className="relative">
                  <div className={`w-full p-4 rounded-lg border-2 border-gray-200 bg-white transition-all`}>
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className={`w-12 h-12 ${template.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-xs text-gray-600">{template.description}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Available to All
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Current Status: Open Access</h4>
                <p className="text-sm text-blue-700">All profile templates are currently available to users regardless of their pricing tier. You can configure tier-specific access using the controls below.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Tier Template Access Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Pricing Tier Template Access
          </CardTitle>
          <CardDescription>
            Configure which pricing tiers should have access to all profile templates. Tiers without access will only see the Classic template.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pricingTiers.map((tier) => {
              const hasAccess = hasTemplateAccess(tier);
              return (
                <div key={tier.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      tier.category === 'talent' ? 'bg-blue-500' :
                      tier.category === 'manager' ? 'bg-green-500' :
                      tier.category === 'producer' ? 'bg-orange-500' :
                      'bg-purple-500'
                    }`} />
                    <div>
                      <h4 className="font-medium">{tier.name}</h4>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-600">${tier.price}/month • {tier.category}</p>
                        <Badge variant={hasAccess ? "default" : "secondary"} className="text-xs">
                          {hasAccess ? "Full Access" : "Classic Only"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {hasAccess ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`template-access-${tier.id}`}
                        checked={hasAccess}
                        onCheckedChange={() => handleToggleAccess(tier.id, hasAccess)}
                        disabled={toggleTemplatesMutation.isPending}
                      />
                      <Label htmlFor={`template-access-${tier.id}`} className="text-sm font-medium">
                        {hasAccess ? "Enabled" : "Disabled"}
                      </Label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Separator className="my-6" />

          <div className="bg-amber-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-900">Template Access Configuration</h4>
                <p className="text-sm text-amber-700 mb-3">
                  Users with tiers that have "Full Access" can choose from all 5 profile templates. Users with "Classic Only" access will only see the Classic template option.
                </p>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Classic Template: Always available to all users</li>
                  <li>• Premium Templates: Modern, Artistic, Minimal, Cinematic</li>
                  <li>• Changes take effect immediately for all users</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}