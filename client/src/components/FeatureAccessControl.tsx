import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Star, Crown, Zap, ArrowRight } from "lucide-react";

interface FeatureAccessControlProps {
  feature: string;
  hasAccess: boolean;
  userTier: string;
  children: React.ReactNode;
  upgradeMessage?: string;
}

const featureDescriptions = {
  analytics: {
    title: "📊 Analytics Dashboard",
    description: "View detailed performance metrics, insights, and reporting",
    icon: <Star className="w-5 h-5" />,
    requiredTiers: ["Professional", "Enterprise"]
  },
  messaging: {
    title: "💬 Messaging System",
    description: "Send and receive messages with other users",
    icon: <Star className="w-5 h-5" />,
    requiredTiers: ["Basic", "Professional", "Enterprise"]
  },
  aiFeatures: {
    title: "🤖 AI-Powered Features",
    description: "Profile optimization, smart matching, and AI suggestions",
    icon: <Crown className="w-5 h-5" />,
    requiredTiers: ["Professional", "Enterprise"]
  },
  prioritySupport: {
    title: "⚡ Priority Support",
    description: "Get priority customer support and faster response times",
    icon: <Zap className="w-5 h-5" />,
    requiredTiers: ["Enterprise"]
  },
  createJobs: {
    title: "📝 Create Job Posts",
    description: "Post jobs and casting calls to find talent",
    icon: <Star className="w-5 h-5" />,
    requiredTiers: ["Professional", "Enterprise"]
  },
  viewProfiles: {
    title: "🔍 View Talent Profiles",
    description: "Browse and view detailed talent profiles",
    icon: <Star className="w-5 h-5" />,
    requiredTiers: ["Basic", "Professional", "Enterprise"]
  },
  exportData: {
    title: "📤 Export Data",
    description: "Download reports and data exports",
    icon: <Crown className="w-5 h-5" />,
    requiredTiers: ["Enterprise"]
  },
  socialFeatures: {
    title: "🌟 Social Features",
    description: "Create posts, follow others, and engage with the community",
    icon: <Star className="w-5 h-5" />,
    requiredTiers: ["Basic", "Professional", "Enterprise"]
  }
};

export function FeatureAccessControl({ 
  feature, 
  hasAccess, 
  userTier, 
  children, 
  upgradeMessage 
}: FeatureAccessControlProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const featureInfo = featureDescriptions[feature as keyof typeof featureDescriptions];
  
  if (hasAccess) {
    return <>{children}</>;
  }

  const handleFeatureClick = () => {
    setShowUpgradeModal(true);
  };

  return (
    <>
      <div 
        className="relative cursor-pointer"
        onClick={handleFeatureClick}
      >
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 bg-gray-900/20 rounded-lg flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg border">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Upgrade Required
              </span>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-blue-600" />
              <span>Feature Upgrade Required</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Feature Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {featureInfo?.icon}
                  <span>{featureInfo?.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  {featureInfo?.description}
                </p>
                {upgradeMessage && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {upgradeMessage}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current vs Required Tiers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Your Current Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary" className="text-lg py-2 px-4">
                    {userTier}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Required Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {featureInfo?.requiredTiers.map(tier => (
                      <Badge 
                        key={tier} 
                        variant={tier === userTier ? "secondary" : "default"}
                        className="py-1 px-3"
                      >
                        {tier}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upgrade Options */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-center">
                Ready to upgrade your experience?
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => {
                    // Navigate to pricing page
                    window.location.href = '/pricing';
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  View Pricing Plans
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowUpgradeModal(false)}
                >
                  Maybe Later
                </Button>
              </div>
            </div>

            {/* Benefits Preview */}
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-sm text-green-700 dark:text-green-300">
                  ✨ What you'll get with an upgrade:
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Instant access to this feature</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Enhanced platform capabilities</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Priority customer support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Advanced analytics and insights</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Hook for easier usage
export function useFeatureAccess(userTier: string, userPermissions: any) {
  const checkFeatureAccess = (feature: string) => {
    // This would be connected to your actual user permissions system
    switch (feature) {
      case 'analytics':
        return userPermissions?.hasAnalytics || false;
      case 'messaging':
        return userPermissions?.hasMessaging || false;
      case 'aiFeatures':
        return userPermissions?.hasAIFeatures || false;
      case 'prioritySupport':
        return userPermissions?.hasPrioritySupport || false;
      case 'createJobs':
        return userPermissions?.canCreateJobs || false;
      case 'viewProfiles':
        return userPermissions?.canViewProfiles || false;
      case 'exportData':
        return userPermissions?.canExportData || false;
      case 'socialFeatures':
        return userPermissions?.hasSocialFeatures || false;
      default:
        return false;
    }
  };

  return { checkFeatureAccess };
}