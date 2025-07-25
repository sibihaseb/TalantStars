import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Star, 
  Crown, 
  Medal, 
  Trophy, 
  Zap, 
  Users, 
  Plus,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface PricingTier {
  id: number;
  name: string;
  price: string;
  duration: number;
  features: string[];
  active: boolean;
  maxPhotos: number;
  maxVideos: number;
  maxAudio: number;
  maxStorageGB: number;
  maxProjects: number;
  maxApplications: number;
  hasAnalytics: boolean;
  hasMessaging: boolean;
  hasAIFeatures: boolean;
  hasPrioritySupport: boolean;
  canCreateJobs: boolean;
  canViewProfiles: boolean;
  canExportData: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PricingTierManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isInitializing, setIsInitializing] = useState(false);

  // Fetch pricing tiers
  const { data: pricingTiers = [], isLoading: tiersLoading } = useQuery<PricingTier[]>({
    queryKey: ['/api/admin/pricing-tiers'],
  });

  // Initialize default tiers
  const initDefaultTiersMutation = useMutation({
    mutationFn: async () => {
      setIsInitializing(true);
      return await apiRequest('POST', '/api/admin/init-default-tiers');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pricing-tiers'] });
      toast({
        title: "Success",
        description: "Default pricing tiers have been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to create default pricing tiers",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsInitializing(false);
    },
  });

  const getFeaturedIcon = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'platinum': return <Crown className="w-4 h-4 text-purple-500" />;
      case 'gold': return <Medal className="w-4 h-4 text-yellow-500" />;
      case 'premium': return <Star className="w-4 h-4 text-blue-500" />;
      default: return <Trophy className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTierColor = (tier: PricingTier) => {
    if (tier.name === 'Enterprise') return 'bg-gradient-to-r from-purple-500 to-pink-500';
    if (tier.name === 'Professional') return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    return 'bg-gradient-to-r from-gray-500 to-gray-600';
  };

  const formatPrice = (price: string) => {
    return parseFloat(price) === 0 ? 'Free' : `$${parseFloat(price).toFixed(2)}/month`;
  };

  const renderFeaturesList = (tier: PricingTier) => {
    const features = [
      { key: 'canCreateJobs', label: 'Create Jobs', enabled: tier.canCreateJobs },
      { key: 'hasAnalytics', label: 'Analytics', enabled: tier.hasAnalytics },
      { key: 'hasMessaging', label: 'Messaging', enabled: tier.hasMessaging },
      { key: 'hasAIFeatures', label: 'AI Features', enabled: tier.hasAIFeatures },
      { key: 'hasPrioritySupport', label: 'Priority Support', enabled: tier.hasPrioritySupport },
      { key: 'canExportData', label: 'Export Data', enabled: tier.canExportData },
    ];

    return (
      <div className="space-y-2">
        {features.map((feature) => (
          <div key={feature.key} className="flex items-center justify-between">
            <span className="text-sm">{feature.label}</span>
            {feature.enabled ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderMediaLimits = (tier: PricingTier) => {
    const limits = [
      { label: 'Photos', value: tier.maxPhotos },
      { label: 'Videos', value: tier.maxVideos },
      { label: 'Audio Files', value: tier.maxAudio },
      { label: 'Storage', value: tier.maxStorageGB, unit: 'GB' },
      { label: 'Projects', value: tier.maxProjects },
      { label: 'Applications', value: tier.maxApplications },
    ];

    return (
      <div className="space-y-2">
        <h4 className="font-semibold text-sm">Media Limits</h4>
        {limits.map((limit) => (
          <div key={limit.label} className="flex items-center justify-between">
            <span className="text-sm">{limit.label}</span>
            <span className="text-sm font-medium">
              {limit.value === 0 ? 'Unlimited' : `${limit.value}${limit.unit || ''}`}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (tiersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pricing Tier Management</h1>
          <p className="text-gray-600 mt-1">Manage subscription tiers and feature access</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            <Settings className="w-4 h-4 mr-1" />
            {pricingTiers.length} Tiers
          </Badge>
          {pricingTiers.length === 0 && (
            <Button 
              onClick={() => initDefaultTiersMutation.mutate()}
              disabled={isInitializing}
              className="flex items-center space-x-2"
            >
              {isInitializing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>Create Default Tiers</span>
            </Button>
          )}
        </div>
      </div>

      {/* No Tiers Message */}
      {pricingTiers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Pricing Tiers Found</h3>
            <p className="text-gray-600 mb-4">
              Create default pricing tiers to get started with the platform's subscription system.
            </p>
            <Button 
              onClick={() => initDefaultTiersMutation.mutate()}
              disabled={isInitializing}
              className="flex items-center space-x-2"
            >
              {isInitializing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>Create Default Tiers</span>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pricing Tiers Grid */}
      {pricingTiers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pricingTiers.map((tier) => (
            <Card key={tier.id} className="relative overflow-hidden">
              {/* Tier Header */}
              <div className={`h-2 ${getTierColor(tier)}`} />
              
              {/* Popular/Featured Badge */}
              {(tier.name === 'Professional' || tier.name === 'Enterprise') && (
                <div className="absolute top-4 right-4">
                  <Badge variant={tier.name === 'Enterprise' ? "default" : "secondary"}>
                    {tier.name === 'Enterprise' ? (
                      <>
                        <Crown className="w-3 h-3 mr-1" />
                        Featured
                      </>
                    ) : (
                      <>
                        <Star className="w-3 h-3 mr-1" />
                        Popular
                      </>
                    )}
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-gray-600">{tier.duration} days</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {formatPrice(tier.price)}
                </div>
                <div className="text-gray-600 text-sm">
                  {tier.features.join(', ')}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">Features</h4>
                  {renderFeaturesList(tier)}
                </div>

                {/* Media Limits */}
                {renderMediaLimits(tier)}

                {/* Status */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm font-medium">Status</span>
                  <Badge variant={tier.active ? "default" : "secondary"}>
                    {tier.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {pricingTiers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Tier Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {pricingTiers.filter(t => t.active).length}
                </div>
                <div className="text-sm text-gray-600">Active Tiers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {pricingTiers.filter(t => t.hasAIFeatures).length}
                </div>
                <div className="text-sm text-gray-600">AI Features</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {pricingTiers.filter(t => parseFloat(t.price) === 0).length}
                </div>
                <div className="text-sm text-gray-600">Free Tiers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  ${Math.max(...pricingTiers.map(t => parseFloat(t.price))).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Highest Price</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}