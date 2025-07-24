import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlanRequiredModal } from "./PlanRequiredModal";
import { Loader2 } from "lucide-react";

interface User {
  id: number;
  role: string;
  pricingTierId?: number;
  username: string;
  email?: string;
}

interface PlanProtectedRouteProps {
  children: React.ReactNode;
}

export function PlanProtectedRoute({ children }: PlanProtectedRouteProps) {
  const [showPlanModal, setShowPlanModal] = useState(false);
  
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/user"],
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });

  useEffect(() => {
    // Super admins bypass plan selection entirely
    if (user && user.role === 'super_admin') {
      setShowPlanModal(false);
      return;
    }
    
    if (user && !user.pricingTierId) {
      setShowPlanModal(true);
    } else if (user && user.pricingTierId) {
      setShowPlanModal(false);
    }
  }, [user]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is not authenticated, let other components handle the redirect
  if (error || !user) {
    return <>{children}</>;
  }

  // Super admins bypass plan selection entirely
  if (user.role === 'super_admin') {
    return <>{children}</>;
  }

  // If user needs to select a plan, show the modal and prevent access
  if (!user.pricingTierId) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg font-medium">Setting up your account...</p>
            <p className="text-sm text-muted-foreground mt-2">Please wait while we prepare your dashboard</p>
          </div>
        </div>
        <PlanRequiredModal
          isOpen={showPlanModal}
          onClose={() => setShowPlanModal(false)}
          userRole={user.role || 'talent'}
        />
      </>
    );
  }

  // User has a plan, render the protected content
  return <>{children}</>;
}