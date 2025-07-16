import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Users, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface PlanRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
}

export function PlanRequiredModal({ isOpen, onClose, userRole }: PlanRequiredModalProps) {
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: pricingTiers = [], isLoading } = useQuery({
    queryKey: ["/api/pricing-tiers"],
    enabled: isOpen,
  });

  const selectTierMutation = useMutation({
    mutationFn: async (tierId: number) => {
      const response = await apiRequest("POST", "/api/user/select-tier", { tierId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Plan Selected",
        description: "Your plan has been selected successfully. You can now access all features.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      onClose();
      window.location.reload(); // Force refresh to update user data
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to select plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSelectPlan = (tierId: number) => {
    selectTierMutation.mutate(tierId);
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
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Plan Selection Required
          </DialogTitle>
          <div className="text-center text-muted-foreground">
            <div className="flex items-center justify-center gap-2 mb-2">
              {getRoleIcon(userRole)}
              <span>Welcome, {getRoleLabel(userRole)}!</span>
            </div>
            <p>To access the platform, please select a plan that suits your needs.</p>
            <p className="text-sm text-red-600 mt-2">This step is mandatory and cannot be skipped.</p>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {roleSpecificTiers.map((tier: any) => (
            <Card 
              key={tier.id} 
              className={`relative transition-all duration-200 hover:shadow-lg ${
                selectedTier === tier.id ? 'ring-2 ring-primary' : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{tier.name}</CardTitle>
                  <Badge variant="outline">{tier.category}</Badge>
                </div>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    ${tier.price}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{tier.duration}
                    </span>
                  </div>
                  {tier.annualPrice && (
                    <div className="text-sm text-muted-foreground">
                      Annual: ${tier.annualPrice}/year
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {tier.permissions && tier.permissions.map((permission: any, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{permission.name}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handleSelectPlan(tier.id)}
                  disabled={selectTierMutation.isPending}
                  className="w-full"
                  variant={tier.price === "0.00" ? "outline" : "default"}
                >
                  {selectTierMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      Selecting...
                    </div>
                  ) : (
                    <>
                      {tier.price === "0.00" ? "Get Started Free" : `Choose ${tier.name}`}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <Crown className="h-4 w-4" />
            <span className="font-medium">Important Notice</span>
          </div>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            Plan selection is mandatory to access platform features. Even our free plan requires explicit selection 
            to ensure you understand the features available to you.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}