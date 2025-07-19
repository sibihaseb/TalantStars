import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Crown, 
  Check, 
  ArrowUp, 
  ArrowDown, 
  CreditCard,
  Star,
  Zap,
  Shield
} from 'lucide-react';

interface PricingTier {
  id: number;
  name: string;
  price: string;
  duration: string;
  features: string[];
  isCurrentTier?: boolean;
}

export function TierUpgradeManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);

  // Fetch all pricing tiers
  const { data: allPricingTiers = [], isLoading } = useQuery({
    queryKey: ["/api/pricing-tiers"],
  });

  // Filter tiers by user's category (talent, manager, producer, agent)
  const pricingTiers = allPricingTiers.filter((tier: any) => {
    // If user doesn't have a role, show talent tiers as default
    const userCategory = user?.role || 'talent';
    return tier.category === userCategory;
  });

  // Update user tier mutation
  const updateTierMutation = useMutation({
    mutationFn: async (tierId: number) => {
      return apiRequest(`/api/user/tier`, {
        method: 'POST',
        body: { tierId }
      });
    },
    onSuccess: () => {
      toast({
        title: "Plan Updated",
        description: "Your plan has been successfully updated!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setIsUpgradeDialogOpen(false);
      setSelectedTier(null);
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Unable to update your plan. Please try again.",
        variant: "destructive",
      });
    }
  });

  const currentTierIndex = pricingTiers.findIndex((tier: PricingTier) => tier.id === user?.pricingTierId);

  const handleTierChange = (tier: PricingTier) => {
    setSelectedTier(tier);
    setIsUpgradeDialogOpen(true);
  };

  const confirmTierChange = () => {
    if (selectedTier) {
      updateTierMutation.mutate(selectedTier.id);
    }
  };

  const getTierIcon = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'basic':
      case 'free':
        return <Shield className="h-5 w-5" />;
      case 'professional':
      case 'pro':
        return <Star className="h-5 w-5" />;
      case 'premium':
      case 'enterprise':
        return <Crown className="h-5 w-5" />;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };

  const getTierChangeType = (tier: PricingTier) => {
    const tierIndex = pricingTiers.findIndex((t: PricingTier) => t.id === tier.id);
    if (tierIndex > currentTierIndex) return 'upgrade';
    if (tierIndex < currentTierIndex) return 'downgrade';
    return 'current';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Manage Your Plan
          </CardTitle>
          <CardDescription>
            Upgrade or downgrade your {user?.role || 'talent'} plan to access different features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pricingTiers.map((tier: PricingTier, index: number) => {
              const isCurrentTier = tier.id === user?.pricingTierId;
              const changeType = getTierChangeType(tier);
              
              return (
                <Card 
                  key={tier.id} 
                  className={`relative transition-all duration-200 hover:shadow-lg ${
                    isCurrentTier 
                      ? 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-900/20' 
                      : 'hover:shadow-md'
                  }`}
                >
                  {isCurrentTier && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-500 text-white">
                        Current Plan
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className="flex items-center justify-center mb-2">
                      {getTierIcon(tier.name)}
                    </div>
                    <CardTitle className="text-lg">{tier.name}</CardTitle>
                    <div className="text-2xl font-bold">
                      ${tier.price}
                      <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                        /{tier.duration || 'month'}
                      </span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <ul className="space-y-2 mb-6">
                      {(tier.features || []).slice(0, 4).map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {!isCurrentTier && (
                      <Button
                        onClick={() => handleTierChange(tier)}
                        disabled={updateTierMutation.isPending}
                        className={`w-full ${
                          changeType === 'upgrade'
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-orange-600 hover:bg-orange-700'
                        }`}
                      >
                        {changeType === 'upgrade' ? (
                          <ArrowUp className="h-4 w-4 mr-2" />
                        ) : (
                          <ArrowDown className="h-4 w-4 mr-2" />
                        )}
                        {changeType === 'upgrade' ? 'Upgrade' : 'Downgrade'} to {tier.name}
                      </Button>
                    )}
                    
                    {isCurrentTier && (
                      <Button disabled className="w-full bg-gray-200 text-gray-500 cursor-not-allowed">
                        <Check className="h-4 w-4 mr-2" />
                        Current Plan
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedTier && getTierChangeType(selectedTier) === 'upgrade' ? 'Upgrade' : 'Downgrade'} Plan
            </DialogTitle>
          </DialogHeader>
          
          {selectedTier && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-lg">
                  {getTierChangeType(selectedTier) === 'upgrade' ? 'Upgrade' : 'Downgrade'} to{' '}
                  <span className="font-semibold">{selectedTier.name}</span>?
                </p>
                <p className="text-2xl font-bold mt-2">
                  ${selectedTier.price}/{selectedTier.duration || 'month'}
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="font-medium">Plan includes:</p>
                <ul className="space-y-1">
                  {(selectedTier.features || []).map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsUpgradeDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className={`flex-1 ${
                    getTierChangeType(selectedTier) === 'upgrade'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                  onClick={confirmTierChange}
                  disabled={updateTierMutation.isPending}
                >
                  {updateTierMutation.isPending ? 'Processing...' : 
                    `Confirm ${getTierChangeType(selectedTier) === 'upgrade' ? 'Upgrade' : 'Downgrade'}`
                  }
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}