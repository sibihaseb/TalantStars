import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, Crown, Star, Users, Briefcase, CreditCard, Tag, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface PlanRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
}

export function PlanRequiredModal({ isOpen, onClose, userRole }: PlanRequiredModalProps) {
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [promoCode, setPromoCode] = useState<string>('');
  const [showPromoInput, setShowPromoInput] = useState<boolean>(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: pricingTiers = [], isLoading } = useQuery({
    queryKey: ["/api/pricing-tiers", userRole],
    queryFn: () => fetch(`/api/pricing-tiers?role=${userRole}`).then(res => res.json()),
    enabled: isOpen,
  });

  const selectTierMutation = useMutation({
    mutationFn: async ({ tierId, promoCode }: { tierId: number; promoCode?: string }) => {
      const response = await apiRequest("POST", "/api/user/select-tier", { 
        tierId, 
        promoCode: promoCode || undefined 
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.requiresPayment) {
        // Handle paid tier - redirect to payment
        handlePaymentRedirect(data);
        return;
      }
      
      toast({
        title: "Plan Selected",
        description: "Your plan has been activated successfully. Let's complete your profile.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      onClose();
      // Redirect to onboarding for profile questions
      setTimeout(() => setLocation("/onboarding"), 500);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to select plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePaymentRedirect = (paymentData: any) => {
    // For now, show a message about payment requirement
    toast({
      title: "Payment Required",
      description: `This plan costs $${paymentData.finalPrice}. Payment integration coming soon!`,
      variant: "default",
    });
    
    // In a real implementation, redirect to Stripe checkout
    console.log("Payment data:", paymentData);
  };

  const createPaymentMutation = useMutation({
    mutationFn: async ({ tierId, isAnnual }: { tierId: number; isAnnual: boolean }) => {
      const tier = pricingTiers.find((t: any) => t.id === tierId);
      const amount = isAnnual ? parseFloat(tier.annualPrice) : parseFloat(tier.price);
      
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        amount,
        tierId,
        isAnnual,
        description: `${tier.name} Plan ${isAnnual ? '(Annual)' : '(Monthly)'}`
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Redirect to checkout page with payment intent
      const params = new URLSearchParams({
        client_secret: data.clientSecret,
        tier_id: data.tierId.toString(),
        annual: data.isAnnual.toString()
      });
      setLocation(`/checkout?${params.toString()}`);
    },
    onError: (error: any) => {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to create payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSelectPlan = (tierId: number, isAnnual: boolean = false) => {
    setSelectedTier(tierId);
    
    const tier = pricingTiers.find((t: any) => t.id === tierId);
    const price = isAnnual ? parseFloat(tier.annualPrice) : parseFloat(tier.price);
    
    if (price === 0) {
      // Free tier - direct selection
      selectTierMutation.mutate({ tierId, promoCode });
    } else {
      // Paid tier - attempt selection with promo code
      selectTierMutation.mutate({ tierId, promoCode });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'talent':
        return <Star className="h-5 w-5" />;
      case 'manager':
        return <Users className="h-5 w-5" />;
      case 'producer':
        return <Briefcase className="h-5 w-5" />;
      case 'agent':
        return <Crown className="h-5 w-5" />;
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'talent':
        return 'Talent';
      case 'manager':
        return 'Manager';
      case 'producer':
        return 'Producer';
      case 'agent':
        return 'Agent';
      default:
        return 'User';
    }
  };

  const roleSpecificTiers = pricingTiers.filter((tier: any) => 
    tier.category.toLowerCase() === userRole.toLowerCase()
  );

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Loading Plans</DialogTitle>
            <DialogDescription>Please wait while we load your available plans.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              {getRoleIcon(userRole)}
              <h1 className="text-3xl font-bold">Welcome, {getRoleLabel(userRole)}!</h1>
            </div>
            <p className="text-lg opacity-90">Choose the perfect plan to unlock your potential</p>
            <p className="text-sm opacity-75 mt-2">Select a plan to continue - this step is required to access the platform</p>
          </div>
        </div>

        {/* Promo Code Section */}
        <div className="mb-6">
          <Button
            onClick={() => setShowPromoInput(!showPromoInput)}
            variant="outline"
            className="mx-auto flex items-center gap-2"
          >
            <Tag className="h-4 w-4" />
            Have a promo code?
            {showPromoInput ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          
          {showPromoInput && (
            <div className="mt-4 max-w-md mx-auto">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="flex-1"
                />
                <Button
                  onClick={() => {
                    if (promoCode.trim()) {
                      toast({
                        title: "Promo Code Applied",
                        description: `Code "${promoCode}" will be applied during plan selection.`,
                      });
                    }
                  }}
                  variant="outline"
                  disabled={!promoCode.trim()}
                >
                  Apply
                </Button>
              </div>
              {promoCode && (
                <p className="text-sm text-green-600 mt-2 text-center">
                  ✓ Code "{promoCode}" ready to apply
                </p>
              )}
            </div>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {roleSpecificTiers.map((tier: any, index: number) => {
            const isPopular = index === 1; // Make middle tier popular
            const isFree = parseFloat(tier.price) === 0;
            const isPremium = parseFloat(tier.price) > 50;
            
            return (
              <Card 
                key={tier.id} 
                className={`relative transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                  selectedTier === tier.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
                } ${isPopular ? 'border-2 border-blue-500' : ''} ${isPremium ? 'border-2 border-purple-500' : ''}`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-4 py-1 text-xs font-semibold">
                      MOST POPULAR
                    </Badge>
                  </div>
                )}
                
                {/* Premium Badge */}
                {isPremium && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-500 text-white px-4 py-1 text-xs font-semibold">
                      PREMIUM
                    </Badge>
                  </div>
                )}

                <CardHeader className={`text-center pb-4 ${isPopular ? 'bg-blue-50' : isPremium ? 'bg-purple-50' : ''}`}>
                  <div className="mb-4">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                      isFree ? 'bg-gray-100 text-gray-600' : 
                      isPopular ? 'bg-blue-100 text-blue-600' : 
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {isFree ? <Star className="h-8 w-8" /> : 
                       isPopular ? <Crown className="h-8 w-8" /> : 
                       <Briefcase className="h-8 w-8" />}
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl font-bold mb-2">{tier.name}</CardTitle>
                  <CardDescription className="text-base">{tier.description}</CardDescription>
                  
                  {/* Pricing */}
                  <div className="mt-4">
                    <div className="text-4xl font-bold text-gray-900">
                      {isFree ? 'Free' : `$${tier.price}`}
                      {!isFree && (
                        <span className="text-sm font-normal text-gray-500">/month</span>
                      )}
                    </div>
                    {tier.annualPrice && parseFloat(tier.annualPrice) > 0 && (
                      <div className="text-sm text-gray-600 mt-2">
                        <span className="line-through">${(parseFloat(tier.price) * 12).toFixed(0)}</span>
                        <span className="ml-2 font-semibold text-green-600">${tier.annualPrice}/year</span>
                        <Badge variant="outline" className="ml-2 text-green-600 border-green-600 text-xs">
                          {Math.round((1 - parseFloat(tier.annualPrice) / (parseFloat(tier.price) * 12)) * 100)}% OFF
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features List */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 mb-3">What's included:</h4>
                    {tier.features && tier.features.slice(0, 8).map((feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      </div>
                    ))}
                    {tier.features && tier.features.length > 8 && (
                      <div className="text-sm text-gray-500">
                        + {tier.features.length - 8} more features
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-4">
                    {/* Monthly Button */}
                    <Button
                      onClick={() => handleSelectPlan(tier.id, false)}
                      disabled={selectTierMutation.isPending || createPaymentMutation.isPending}
                      className={`w-full h-12 font-semibold transition-all ${
                        isFree ? 'bg-gray-600 hover:bg-gray-700' :
                        isPopular ? 'bg-blue-600 hover:bg-blue-700' :
                        'bg-purple-600 hover:bg-purple-700'
                      }`}
                      size="lg"
                    >
                      {(selectTierMutation.isPending || createPaymentMutation.isPending) ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                          {isFree ? "Activating..." : "Processing..."}
                        </div>
                      ) : (
                        <>
                          {isFree ? (
                            <>
                              <Star className="h-5 w-5 mr-2" />
                              Get Started Free
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-5 w-5 mr-2" />
                              Start Monthly - ${tier.price}/mo
                            </>
                          )}
                        </>
                      )}
                    </Button>
                    
                    {/* Annual Button */}
                    {tier.annualPrice && parseFloat(tier.annualPrice) > 0 && (
                      <Button
                        onClick={() => handleSelectPlan(tier.id, true)}
                        disabled={selectTierMutation.isPending || createPaymentMutation.isPending}
                        className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold"
                        size="lg"
                        variant="default"
                      >
                        {(selectTierMutation.isPending || createPaymentMutation.isPending) ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                            Processing...
                          </div>
                        ) : (
                          <>
                            <Crown className="h-5 w-5 mr-2" />
                            Save with Annual - ${tier.annualPrice}/yr
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer Notice */}
        <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <Crown className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                Why do I need to select a plan?
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                Plan selection ensures you get the right features and helps us provide the best experience for your role. 
                Even our free plan requires selection so you understand what's available. You can always upgrade later!
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}