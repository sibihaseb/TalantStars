import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, ArrowRight, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  description: string;
  requiredTier?: string;
}

export function UpgradePrompt({ isOpen, onClose, feature, description, requiredTier }: UpgradePromptProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: pricingTiers = [], isLoading } = useQuery({
    queryKey: ["/api/pricing-tiers"],
    enabled: isOpen,
  });

  const handleUpgrade = () => {
    onClose();
    setLocation("/dashboard"); // User can select plan from dashboard
  };

  const userRole = user?.role || "talent";
  const roleSpecificTiers = pricingTiers.filter((tier: any) => 
    tier.category.toLowerCase() === userRole.toLowerCase()
  );

  // Get recommended tier (next tier up from current)
  const currentTierIndex = roleSpecificTiers.findIndex((tier: any) => tier.id === user?.pricingTierId);
  const recommendedTier = roleSpecificTiers[currentTierIndex + 1] || roleSpecificTiers[roleSpecificTiers.length - 1];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            Upgrade Required
          </DialogTitle>
          <DialogDescription>
            Unlock {feature} with a higher tier plan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Feature Description */}
          <Card className="border-l-4 border-l-blue-500 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900">{feature}</h3>
                  <p className="text-sm text-blue-700 mt-1">{description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Tier */}
          {recommendedTier && (
            <Card className="border-2 border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{recommendedTier.name}</CardTitle>
                  <Badge className="bg-yellow-500 text-white">
                    RECOMMENDED
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-bold text-gray-900">
                  ${recommendedTier.price}
                  <span className="text-sm font-normal text-gray-500">/month</span>
                </div>
                
                {/* Features Preview */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Key Features:</h4>
                  {recommendedTier.features?.slice(0, 4).map((feature: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="h-4 w-4 text-green-500" />
                      {feature.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </div>
                  ))}
                  {recommendedTier.features?.length > 4 && (
                    <div className="text-sm text-gray-500">
                      + {recommendedTier.features.length - 4} more features
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleUpgrade}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              <Crown className="h-5 w-5 mr-2" />
              View All Plans
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button 
              onClick={onClose}
              variant="outline"
              size="lg"
              className="px-8"
            >
              Later
            </Button>
          </div>

          {/* Benefits Note */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              💡 <strong>Pro tip:</strong> Annual plans save up to 20% compared to monthly billing
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}