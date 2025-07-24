import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Crown, Star, Zap, ArrowRight, CreditCard, Tag, Percent } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface PricingTier {
  id: number;
  name: string;
  price: string;
  annualPrice: string;
  duration: number;
  features: string[];
  active: boolean;
  category: 'talent' | 'manager' | 'producer' | 'agent';
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
  hasSocialFeatures: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PricingSelectionProps {
  userRole: string;
  onComplete: () => void;
}

export function PricingSelection({ userRole, onComplete }: PricingSelectionProps) {
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Map user roles to pricing categories
  const getCategoryFromRole = (role: string): string => {
    switch (role.toLowerCase()) {
      case 'talent':
        return 'talent';
      case 'manager':
        return 'manager';
      case 'producer':
        return 'producer';
      case 'agent':
        return 'agent';
      default:
        return 'talent';
    }
  };

  const category = getCategoryFromRole(userRole);

  const { data: pricingTiers, isLoading } = useQuery({
    queryKey: ['/api/pricing-tiers', category],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/pricing-tiers?role=${category}`);
      return response.json();
    },
  });

  const selectTierMutation = useMutation({
    mutationFn: async (tierId: number) => {
      const response = await apiRequest('POST', '/api/user/select-tier', { tierId });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Tier Selected",
        description: `Successfully selected ${selectedTier?.name} tier! Let's complete your profile.`,
      });
      onComplete();
    },
    onError: (error: Error) => {
      toast({
        title: "Selection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (tierId: number) => {
      const amount = isAnnual ? parseFloat(selectedTier?.annualPrice || '0') : parseFloat(selectedTier?.price || '0');
      const response = await apiRequest('POST', '/api/create-payment-intent', { 
        amount,
        tierId,
        isAnnual,
        description: `${selectedTier?.name} ${isAnnual ? 'Annual' : 'Monthly'} Plan`
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Navigate to checkout with client secret
      setLocation(`/checkout?client_secret=${data.clientSecret}&tier_id=${selectedTier?.id}&annual=${isAnnual}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Payment Setup Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const validatePromoCodeMutation = useMutation({
    mutationFn: async (data: { code: string, tierId: number, planType: string }) => {
      const response = await apiRequest('POST', '/api/validate-promo-code', data);
      return response.json();
    },
    onSuccess: (data) => {
      setAppliedPromo(data);
      toast({
        title: "Promo Code Applied!",
        description: `You saved $${data.savings.toFixed(2)} with code ${data.promoCode.code}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Invalid Promo Code",
        description: error.message,
        variant: "destructive",
      });
      setAppliedPromo(null);
    },
  });

  const handleApplyPromoCode = () => {
    if (!promoCode.trim() || !selectedTier) return;
    
    setPromoLoading(true);
    const planType = isAnnual ? "annual" : "monthly";
    validatePromoCodeMutation.mutate({ 
      code: promoCode.trim(), 
      tierId: selectedTier.id, 
      planType 
    });
    setPromoLoading(false);
  };

  const handleSelectTier = (tier: PricingTier) => {
    setSelectedTier(tier);
    const price = isAnnual ? parseFloat(tier.annualPrice) : parseFloat(tier.price);
    
    if (price === 0) {
      // Free tier - select directly
      selectTierMutation.mutate(tier.id);
    } else {
      // Paid tier - create payment intent (with promo if applied)
      createPaymentMutation.mutate(tier.id);
    }
  };

  const getTierIcon = (tier: PricingTier) => {
    if (tier.name.toLowerCase().includes('enterprise')) return <Crown className="w-5 h-5 text-purple-500" />;
    if (tier.name.toLowerCase().includes('professional')) return <Star className="w-5 h-5 text-blue-500" />;
    return <Zap className="w-5 h-5 text-green-500" />;
  };

  const formatPrice = (price: string, annualPrice: string, tier: PricingTier) => {
    const originalPrice = parseFloat(price) || 0;
    const originalAnnual = parseFloat(annualPrice) || 0;
    
    if (originalPrice === 0) return 'Free';
    
    // Apply promo discount if available for this tier
    let discountedPrice = originalPrice;
    let discountedAnnual = originalAnnual;
    
    if (appliedPromo && selectedTier?.id === tier.id) {
      const planAmount = isAnnual ? originalAnnual : originalPrice;
      const discountAmount = appliedPromo.discountAmount || 0;
      
      if (isAnnual) {
        discountedAnnual = Math.max(0, planAmount - discountAmount);
      } else {
        discountedPrice = Math.max(0, planAmount - discountAmount);
      }
    }
    
    if (isAnnual && originalAnnual > 0) {
      const monthlySavings = originalPrice > 0 && (originalPrice * 12) > 0 
        ? Math.max(0, Math.min(100, ((originalPrice * 12 - originalAnnual) / (originalPrice * 12) * 100)))
        : 0;
      
      return (
        <div className="text-center">
          {appliedPromo && selectedTier?.id === tier.id ? (
            <div>
              <div className="text-lg line-through text-gray-400">${originalAnnual.toFixed(2)}</div>
              <div className="text-3xl font-bold text-green-600">${discountedAnnual.toFixed(2)}</div>
            </div>
          ) : (
            <div className="text-3xl font-bold text-blue-600">${originalAnnual.toFixed(2)}</div>
          )}
          <div className="text-sm text-gray-600">per year</div>
          {monthlySavings > 0 && (
            <div className="text-xs text-green-600 font-medium">Save {monthlySavings.toFixed(0)}%</div>
          )}
        </div>
      );
    } else {
      return (
        <div className="text-center">
          {appliedPromo && selectedTier?.id === tier.id ? (
            <div>
              <div className="text-lg line-through text-gray-400">${originalPrice.toFixed(2)}</div>
              <div className="text-3xl font-bold text-green-600">${discountedPrice.toFixed(2)}</div>
            </div>
          ) : (
            <div className="text-3xl font-bold text-blue-600">${originalPrice.toFixed(2)}</div>
          )}
          <div className="text-sm text-gray-600">per month</div>
        </div>
      );
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'talent': return '🎭';
      case 'manager': return '👔';
      case 'producer': return '🎬';
      case 'agent': return '🤝';
      default: return '🎭';
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'talent': return 'Talent';
      case 'manager': return 'Manager';
      case 'producer': return 'Producer';
      case 'agent': return 'Agent';
      default: return 'Talent';
    }
  };

  // Filter tiers by category
  const filteredTiers = pricingTiers?.filter((tier: PricingTier) => tier.category === category && tier.active) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pricing options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <span className="text-4xl mr-2">{getCategoryIcon(category)}</span>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Choose Your {getCategoryTitle(category)} Plan
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Select the perfect plan to get started with your {getCategoryTitle(category).toLowerCase()} journey
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center mb-6">
        <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setIsAnnual(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !isAnnual
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isAnnual
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Annual
            <span className="ml-1 text-xs text-green-600 dark:text-green-400">Save up to 17%</span>
          </button>
        </div>
      </div>

      {/* Promo Code Section */}
      <div className="flex items-center justify-center mb-8">
        <Card className="w-full max-w-md">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <Label htmlFor="promo-code" className="flex items-center gap-2 text-sm font-medium">
                <Tag className="w-4 h-4" />
                Have a promo code?
              </Label>
              <div className="flex gap-2">
                <Input
                  id="promo-code"
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="flex-1"
                />
                <Button 
                  onClick={handleApplyPromoCode}
                  disabled={!promoCode.trim() || !selectedTier || promoLoading || validatePromoCodeMutation.isPending}
                  size="sm"
                >
                  {promoLoading || validatePromoCodeMutation.isPending ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <Percent className="w-4 h-4 mr-1" />
                      Apply
                    </>
                  )}
                </Button>
              </div>
              {appliedPromo && (
                <div className="text-sm text-green-600 font-medium flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  {appliedPromo.promoCode.code} applied! Save ${appliedPromo.savings.toFixed(2)}
                </div>
              )}
              <p className="text-xs text-gray-500">
                Select a plan first, then apply your promo code for instant savings
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredTiers.map((tier: PricingTier) => (
          <Card key={tier.id} className="relative overflow-hidden border-2 hover:border-blue-300 transition-all duration-200">
            {tier.name.toLowerCase().includes('professional') && (
              <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
                Most Popular
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center mb-2">
                {getTierIcon(tier)}
                <CardTitle className="text-xl ml-2">{tier.name}</CardTitle>
              </div>
              
              <div className="mb-4">
                {formatPrice(tier.price, tier.annualPrice, tier)}
              </div>

              <Badge variant="secondary" className="mx-auto">
                {getCategoryIcon(category)} {getCategoryTitle(category)}
              </Badge>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Key Features */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>📸 Photos</span>
                  <span className="font-medium">
                    {tier.maxPhotos === 0 ? 'Unlimited' : tier.maxPhotos}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>🎥 Videos</span>
                  <span className="font-medium">
                    {tier.maxVideos === 0 ? 'Unlimited' : tier.maxVideos}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>🎵 Audio Files</span>
                  <span className="font-medium">
                    {tier.maxAudio === 0 ? 'Unlimited' : tier.maxAudio}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>💾 Storage</span>
                  <span className="font-medium">
                    {tier.maxStorageGB === 0 ? 'Unlimited' : `${tier.maxStorageGB}GB`}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Feature Permissions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>💬 Messaging</span>
                  {tier.hasMessaging ? <CheckCircle className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full bg-gray-200"></div>}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>📊 Analytics</span>
                  {tier.hasAnalytics ? <CheckCircle className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full bg-gray-200"></div>}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>🤖 AI Features</span>
                  {tier.hasAIFeatures ? <CheckCircle className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full bg-gray-200"></div>}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>🌟 Social Features</span>
                  {tier.hasSocialFeatures ? <CheckCircle className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full bg-gray-200"></div>}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>⚡ Priority Support</span>
                  {tier.hasPrioritySupport ? <CheckCircle className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full bg-gray-200"></div>}
                </div>
              </div>

              <Separator />

              {/* Select Button */}
              <Button
                onClick={() => handleSelectTier(tier)}
                disabled={selectTierMutation.isPending || createPaymentMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {selectTierMutation.isPending || createPaymentMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center">
                    {parseFloat(tier.price) === 0 ? (
                      <>
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Get Started Free
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Choose Plan
                      </>
                    )}
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Comparison */}
      <div className="mt-12 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          All plans include basic profile creation, search functionality, and platform access.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          You can upgrade or downgrade your plan at any time.
        </p>
      </div>
    </div>
  );
}