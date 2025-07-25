import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Crown, 
  Check, 
  Star,
  Zap,
  Shield,
  Loader2,
  CreditCard
} from 'lucide-react';
import StripePaymentForm from './StripePaymentForm';

interface PricingTier {
  id: number;
  name: string;
  category: string;
  price: string;
  annualPrice: string;
  isActive: boolean;
  maxPhotos: number;
  maxVideos: number;
  maxAudio: number;
  maxExternalLinks: number;
  permissions: string[] | null;
}

interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
}

export default function PricingPlanSelector() {
  const { user, refetch: refetchUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);

  const { data: pricingTiers = [], isLoading } = useQuery<PricingTier[]>({
    queryKey: ['/api/pricing-tiers'],
  });

  const createPaymentIntentMutation = useMutation({
    mutationFn: async ({ tierId, amount, isAnnual }: { tierId: number; amount: number; isAnnual: boolean }) => {
      const response = await apiRequest('POST', '/api/payments/create-intent', {
        tierId,
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        isAnnual,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setPaymentIntent(data);
    },
    onError: (error) => {
      console.error('Error creating payment intent:', error);
      toast({
        title: "Payment Setup Failed",
        description: "Could not set up payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateTierMutation = useMutation({
    mutationFn: async (tierId: number) => {
      const response = await apiRequest('POST', '/api/user/update-tier', { tierId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      refetchUser();
      toast({
        title: "Plan Updated",
        description: "Your plan has been updated successfully!",
      });
      setIsPaymentDialogOpen(false);
      setSelectedTier(null);
      setPaymentIntent(null);
    },
    onError: (error) => {
      console.error('Error updating tier:', error);
      toast({
        title: "Update Failed",
        description: "Could not update your plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <div className="text-center py-8">Please log in to view pricing plans.</div>;
  }

  // Filter pricing tiers based on user role (admins see all)
  const filteredTiers = pricingTiers.filter((tier: PricingTier) => {
    if (!user) return false;
    
    // Admins and super_admins can see all tiers
    if (user.role === 'admin' || user.role === 'super_admin') {
      return true;
    }
    
    // Regular users see tiers for their role
    return tier.category === user.role || (user.role === 'talent' && tier.category === 'talent');
  }) || [];

  const handleSelectPlan = (tier: PricingTier) => {
    setSelectedTier(tier);
    
    const price = parseFloat(isAnnual ? tier.annualPrice : tier.price);
    
    if (price === 0) {
      // Free tier - update directly
      updateTierMutation.mutate(tier.id);
    } else {
      // Paid tier - create payment intent
      setIsPaymentDialogOpen(true);
      createPaymentIntentMutation.mutate({
        tierId: tier.id,
        amount: price,
        isAnnual,
      });
    }
  };

  const handlePaymentSuccess = () => {
    updateTierMutation.mutate(selectedTier!.id);
  };

  const getTierIcon = (tierName: string) => {
    if (tierName.toLowerCase().includes('basic')) return <Shield className="w-5 h-5" />;
    if (tierName.toLowerCase().includes('professional')) return <Star className="w-5 h-5" />;
    if (tierName.toLowerCase().includes('enterprise')) return <Crown className="w-5 h-5" />;
    return <Zap className="w-5 h-5" />;
  };

  return (
    <div className="space-y-8">
      {/* Annual/Monthly Toggle */}
      <div className="flex items-center justify-center space-x-4 p-4 bg-gray-50 rounded-lg">
        <Label htmlFor="billing-toggle" className="text-sm font-medium">Monthly</Label>
        <Switch
          id="billing-toggle"
          checked={isAnnual}
          onCheckedChange={setIsAnnual}
        />
        <Label htmlFor="billing-toggle" className="text-sm font-medium">
          Annual <Badge variant="secondary" className="ml-1">Save 20%</Badge>
        </Label>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {filteredTiers.map((tier: PricingTier) => {
          const monthlyPrice = parseFloat(tier.price);
          const annualPrice = parseFloat(tier.annualPrice);
          const displayPrice = isAnnual ? annualPrice : monthlyPrice;
          const isCurrentPlan = user.pricingTierId === tier.id;
          const isPopular = tier.name.toLowerCase().includes('professional');

          return (
            <Card 
              key={tier.id} 
              className={`relative ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''} ${isPopular ? 'border-blue-500' : ''}`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {getTierIcon(tier.name)}
                </div>
                <CardTitle className="text-xl">{tier.name}</CardTitle>
                <div className="text-3xl font-bold">
                  ${displayPrice.toFixed(2)}
                  <span className="text-sm font-normal text-gray-600">
                    /{isAnnual ? 'year' : 'month'}
                  </span>
                </div>
                {isCurrentPlan && (
                  <Badge variant="secondary">Current Plan</Badge>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{tier.maxPhotos === 0 ? 'Unlimited' : tier.maxPhotos} Photos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{tier.maxVideos === 0 ? 'Unlimited' : tier.maxVideos} Videos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{tier.maxAudio === 0 ? 'Unlimited' : tier.maxAudio} Audio Files</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{tier.maxExternalLinks === 0 ? 'Unlimited' : tier.maxExternalLinks} External Links</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => handleSelectPlan(tier)}
                  disabled={isCurrentPlan || updateTierMutation.isPending}
                  className="w-full"
                  variant={isCurrentPlan ? "secondary" : "default"}
                >
                  {updateTierMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : isCurrentPlan ? (
                    "Current Plan"
                  ) : displayPrice === 0 ? (
                    "Select Free Plan"
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Upgrade to {tier.name}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Upgrade</DialogTitle>
          </DialogHeader>
          
          {paymentIntent && selectedTier ? (
            <StripePaymentForm
              clientSecret={paymentIntent.clientSecret}
              tierId={selectedTier.id}
              amount={parseFloat(isAnnual ? selectedTier.annualPrice : selectedTier.price)}
              tierName={selectedTier.name}
              isAnnual={isAnnual}
              onSuccess={handlePaymentSuccess}
            />
          ) : createPaymentIntentMutation.isPending ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-2">Setting up payment...</span>
            </div>
          ) : (
            <div className="text-center py-4">
              <p>There was an issue setting up the payment. Please try again.</p>
              <Button 
                onClick={() => setIsPaymentDialogOpen(false)}
                variant="outline" 
                className="mt-4"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}