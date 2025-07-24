import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import TalentDashboard from "./TalentDashboard";
import ProducerDashboard from "./ProducerDashboard";
import ManagerDashboard from "./ManagerDashboard";
import AdminDashboard from "./AdminDashboard";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Fetch user profile to determine role
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/auth/user'],
    enabled: isAuthenticated,
  });

  // Show loading state
  if (isLoading || profileLoading) {
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