import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { UserPlus, ArrowRight } from "lucide-react";
import TalentDashboard from "./TalentDashboard";
import ProducerDashboard from "./ProducerDashboard";
import ManagerDashboard from "./ManagerDashboard";
import AdminDashboard from "./AdminDashboard";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Fetch user profile to determine role and onboarding status
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/auth/user'],
    enabled: isAuthenticated,
  });

  // Check if user has completed onboarding (has a profile with basic info)
  const { data: userProfile, isLoading: userProfileLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    enabled: isAuthenticated && !!user,
  });

  // Show loading state
  if (isLoading || profileLoading || userProfileLoading) {
    return (
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ThemeProvider>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-gray-900 dark:text-white">
                Authentication Required
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Please log in to access your dashboard
              </p>
              <Button 
                onClick={() => window.location.href = "/api/login"}
                className="w-full"
              >
                Log In
              </Button>
            </CardContent>
          </Card>
        </div>
      </ThemeProvider>
    );
  }

  // Get user role from user object, default to talent
  const userRole = user?.role || "talent";

  // Check if user needs to complete onboarding
  // For talent users, check if they have basic profile info
  // For other roles, check if they have any profile data
  const needsOnboarding = () => {
    if (!userProfile) return true;
    
    // For talent users, require displayName, bio, and location
    if (userRole === "talent") {
      return !userProfile.displayName || !userProfile.bio || !userProfile.location;
    }
    
    // For other roles, just require displayName and bio
    return !userProfile.displayName || !userProfile.bio;
  };

  // Show onboarding prompt if user hasn't completed their profile
  if (isAuthenticated && needsOnboarding()) {
    return (
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Complete Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Welcome to Talents & Stars! Let's set up your profile with some questions specific to your role as a {userRole}.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  This will only take a few minutes and helps us match you with the perfect opportunities.
                </p>
              </div>
              <Button 
                onClick={() => setLocation("/onboarding")}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                Complete Profile Setup
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline"
                onClick={() => setLocation("/dashboard?skip_onboarding=true")}
                className="w-full"
              >
                Skip for Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </ThemeProvider>
    );
  }

  // Route to appropriate dashboard based on role
  switch (userRole) {
    case "admin":
    case "super_admin":
      return <AdminDashboard />;
    case "producer":
      return <ProducerDashboard />;
    case "manager":
      return <ManagerDashboard />;
    case "agent":
      return <ManagerDashboard />;  // Agents use manager dashboard for now
    case "talent":
    default:
      return <TalentDashboard />;
  }
}