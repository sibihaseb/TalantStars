import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
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
  Shield,
  Loader2
} from 'lucide-react';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

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
  description?: string;
  features?: string[];
}

function TierUpgradeManagerContent() {
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
  const pricingTiers = allPricingTiers.filter((tier: PricingTier) => {
    // Admins can see all tiers
    if (user?.role === 'admin' || user?.role === 'super_admin') {
      return true;
    }
    
    // Regular users see tiers for their role
    const userCategory = user?.role || 'talent';
    return tier.category === userCategory;
  });

  // Create payment intent mutation for paid tiers
  const createPaymentIntentMutation = useMutation({
    mutationFn: async ({ tierId, amount, isAnnual }: { tierId: number; amount: number; isAnnual?: boolean }) => {
      const response = await apiRequest('POST', '/api/payments/create-intent', { 
        tierId, 
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        isAnnual: isAnnual || false
      });
      return response.json();
    }
  });

  // Update user tier mutation (for free tiers)
  const updateTierMutation = useMutation({
    mutationFn: async (tierId: number) => {
      const response = await apiRequest('POST', '/api/user/update-tier', { tierId });
      return response.json();
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

  // Payment form component for Stripe payments
  function CheckoutForm({ clientSecret, tierId }: { clientSecret: string; tierId: number }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();

      if (!stripe || !elements || isProcessing) return;

      setIsProcessing(true);

      try {
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          redirect: 'if_required',
        });

        if (error) {
          console.error("Payment error:", error);
          toast({
            title: "Payment Failed",
            description: error.message || "Payment could not be processed",
            variant: "destructive",
          });
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
          console.log("Payment succeeded:", paymentIntent.id);
          
          // Update user tier after successful payment
          await updateTierMutation.mutateAsync(tierId);
          
          toast({
            title: "Payment Successful!",
            description: "Your plan has been upgraded successfully.",
          });
        } else {
          console.log("Payment processing completed with status:", paymentIntent?.status);
          toast({
            title: "Payment Processing",
            description: "Your payment is being processed. You'll receive an update shortly.",
          });
        }
      } catch (err) {
        console.error("Payment processing error:", err);
        toast({
          title: "Payment Error",
          description: "An unexpected error occurred during payment processing",
          variant: "destructive",
        });
      }

      setIsProcessing(false);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <PaymentElement />
        <Button 
          type="submit" 
          disabled={!stripe || isProcessing}
          className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Complete Upgrade
            </>
          )}
        </Button>
      </form>
    );
  }

  const handleUpgrade = async (tier: PricingTier) => {
    const price = parseFloat(tier.price);
    
    if (price === 0) {
      // Free tier, update directly
      updateTierMutation.mutate(tier.id);
    } else {
      // Paid tier, create payment intent
      setSelectedTier(tier);
      setIsUpgradeDialogOpen(true);
      createPaymentIntentMutation.mutate({ 
        tierId: tier.id, 
        amount: price,
        isAnnual: false
      });
    }
  };

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
                        /month
                      </span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>{tier.maxPhotos} photos</span>
                      </li>
                      <li className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>{tier.maxVideos} videos</span>
                      </li>
                      <li className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>{tier.maxAudio} audio files</span>
                      </li>
                      <li className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>{tier.maxExternalLinks} external links</span>
                      </li>
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
                          <>
                            <ArrowUp className="h-4 w-4 mr-2" />
                            Upgrade to {tier.name}
                          </>
                        ) : (
                          <>
                            <ArrowDown className="h-4 w-4 mr-2" />
                            Downgrade to {tier.name}
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Dialog */}
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        {selectedTier && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {getTierChangeType(selectedTier) === 'upgrade' ? 'Upgrade' : 'Downgrade'} to {selectedTier.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{selectedTier.name}</span>
                  <span className="text-lg font-bold">${selectedTier.price}</span>
                </div>
                <p className="text-sm text-gray-600">{selectedTier.duration}</p>
              </div>

              {parseFloat(selectedTier.price) === 0 ? (
                // Free tier - direct update
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    This will immediately change your plan to {selectedTier.name}.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsUpgradeDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={confirmTierChange}
                      disabled={updateTierMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {updateTierMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        `Confirm Change`
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                // Paid tier - Stripe payment
                <div className="space-y-4">
                  {createPaymentIntentMutation.data?.clientSecret ? (
                    <Elements 
                      stripe={stripePromise} 
                      options={{ 
                        clientSecret: createPaymentIntentMutation.data.clientSecret,
                        appearance: { theme: 'stripe' }
                      }}
                    >
                      <CheckoutForm 
                        clientSecret={createPaymentIntentMutation.data.clientSecret} 
                        tierId={selectedTier.id} 
                      />
                    </Elements>
                  ) : createPaymentIntentMutation.isPending ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <span className="ml-2">Setting up payment...</span>
                    </div>
                  ) : (
                    <Button
                      onClick={() => createPaymentIntentMutation.mutate({ 
                        tierId: selectedTier.id, 
                        amount: parseFloat(selectedTier.price) 
                      })}
                      className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Continue to Payment
                    </Button>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

export function TierUpgradeManager() {
  return (
    <Elements stripe={stripePromise}>
      <TierUpgradeManagerContent />
    </Elements>
  );
}