import { useAuth } from "@/hooks/useAuth";
import PricingPlanSelector from "@/components/payments/PricingPlanSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function PricingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Link href="/dashboard">
              <Button variant="ghost" className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your entertainment career. Upgrade or downgrade anytime.
          </p>
        </div>

        {/* Current Plan Info */}
        {user && user.pricingTierId && (
          <Card className="max-w-md mx-auto mb-8">
            <CardHeader>
              <CardTitle className="text-center">Current Plan</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-lg font-semibold text-blue-600">
                Active Plan (Tier {user.pricingTierId})
              </div>
              <div className="text-sm text-gray-600 mt-2">
                Role: {user.role}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing Plans */}
        <div className="max-w-6xl mx-auto">
          <PricingPlanSelector />
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>All plans include our core features. Upgrade for advanced capabilities.</p>
          <p className="mt-2">Questions? <a href="mailto:support@talentsandstars.com" className="text-blue-600 hover:underline">Contact our support team</a></p>
        </div>
      </div>
    </div>
  );
}