import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, CreditCard, ArrowLeft, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/Header";

interface PricingTier {
  id: number;
  name: string;
  price: string;
  annualPrice: string;
  duration: number;
  features: string[];
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
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Parse URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const clientSecret = urlParams.get('client_secret');
  const tierId = urlParams.get('tier_id');
  const isAnnual = urlParams.get('annual') === 'true';

  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const { data: tier } = useQuery({
    queryKey: ['/api/admin/pricing-tiers', tierId],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/pricing-tiers');
      const tiers = await response.json();
      return tiers.find((t: PricingTier) => t.id === parseInt(tierId || '0'));
    },
    enabled: !!tierId,
  });

  const selectTierMutation = useMutation({
    mutationFn: async (tierId: number) => {
      const response = await apiRequest('POST', '/api/user/select-tier', { tierId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Payment Successful!",
        description: "Your tier has been activated. Welcome to your new plan!",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Activation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleMockPayment = async () => {
    setPaymentProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setPaymentProcessing(false);
      
      if (tier) {
        selectTierMutation.mutate(tier.id);
      }
    }, 2000);
  };

  const calculatePrice = () => {
    if (!tier) return 0;
    return isAnnual ? parseFloat(tier.annualPrice) : parseFloat(tier.price);
  };

  const calculateSavings = () => {
    if (!tier || !isAnnual) return 0;
    const monthly = parseFloat(tier.price);
    const annual = parseFloat(tier.annualPrice);
    return (monthly * 12) - annual;
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

  if (!clientSecret || !tierId || !tier) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-6 text-center">
              <div className="text-red-500 mb-4">
                <CreditCard className="w-12 h-12 mx-auto" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Invalid Checkout Session</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                This checkout session is invalid or has expired.
              </p>
              <Button onClick={() => setLocation("/")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Complete Your Purchase
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You're just one step away from unlocking your full potential
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Plan Summary */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-2xl mr-2">{getCategoryIcon(tier.category)}</span>
                Plan Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{tier.name}</h3>
                  <Badge variant="secondary" className="mt-1">
                    {tier.category.charAt(0).toUpperCase() + tier.category.slice(1)}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    ${calculatePrice().toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {isAnnual ? 'per year' : 'per month'}
                  </div>
                </div>
              </div>

              {isAnnual && calculateSavings() > 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <div className="flex items-center text-green-700 dark:text-green-400">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span className="font-medium">
                      You save ${calculateSavings().toFixed(2)} per year!
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="font-medium">What's included:</h4>
                <div className="grid grid-cols-1 gap-2">
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

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="flex items-center text-sm">
                    {tier.hasMessaging ? <CheckCircle className="w-4 h-4 text-green-500 mr-1" /> : <div className="w-4 h-4 rounded-full bg-gray-200 mr-1"></div>}
                    <span>Messaging</span>
                  </div>
                  <div className="flex items-center text-sm">
                    {tier.hasAnalytics ? <CheckCircle className="w-4 h-4 text-green-500 mr-1" /> : <div className="w-4 h-4 rounded-full bg-gray-200 mr-1"></div>}
                    <span>Analytics</span>
                  </div>
                  <div className="flex items-center text-sm">
                    {tier.hasAIFeatures ? <CheckCircle className="w-4 h-4 text-green-500 mr-1" /> : <div className="w-4 h-4 rounded-full bg-gray-200 mr-1"></div>}
                    <span>AI Features</span>
                  </div>
                  <div className="flex items-center text-sm">
                    {tier.hasSocialFeatures ? <CheckCircle className="w-4 h-4 text-green-500 mr-1" /> : <div className="w-4 h-4 rounded-full bg-gray-200 mr-1"></div>}
                    <span>Social Features</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center text-blue-700 dark:text-blue-400">
                  <Shield className="w-4 h-4 mr-2" />
                  <span className="text-sm">
                    This is a demo checkout. No real payment will be processed.
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Payment Method</h4>
                  <div className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-gray-500" />
                    <span className="text-sm">Demo Payment (No charges)</span>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Billing Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Plan:</strong> {tier.name} ({isAnnual ? 'Annual' : 'Monthly'})</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-t">
                  <span className="font-medium">Total</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${calculatePrice().toFixed(2)}
                  </span>
                </div>

                <Button
                  onClick={handleMockPayment}
                  disabled={paymentProcessing || selectTierMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  {paymentProcessing || selectTierMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      Complete Purchase
                    </div>
                  )}
                </Button>

                <div className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => setLocation("/")}
                    className="text-sm"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            By completing this purchase, you agree to our Terms of Service and Privacy Policy.
            You can cancel your subscription at any time.
          </p>
        </div>
      </div>
    </div>
  );
}