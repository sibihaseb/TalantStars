import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Search from "@/pages/Search";
import Messages from "@/pages/Messages";
import Dashboard from "@/pages/Dashboard";
import Onboarding from "@/pages/Onboarding";
import HowItWorks from "@/pages/HowItWorks";
import PostGig from "@/pages/PostGig";
import FindTalent from "@/pages/FindTalent";
import BrowseJobs from "@/pages/BrowseJobs";
import Admin from "@/pages/Admin";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes */}
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/how-it-works" component={HowItWorks} />
          <Route path="/find-talent" component={FindTalent} />
          <Route path="/post-gig" component={PostGig} />
        </>
      ) : (
        <>
          {/* Authenticated routes */}
          <Route path="/" component={user?.profile ? Home : Landing} />
          <Route path="/onboarding" component={Onboarding} />
          <Route path="/profile" component={Profile} />
          <Route path="/search" component={Search} />
          <Route path="/messages" component={Messages} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/post-gig" component={PostGig} />
          <Route path="/find-talent" component={FindTalent} />
          <Route path="/jobs" component={BrowseJobs} />
          <Route path="/admin" component={Admin} />
          <Route path="/how-it-works" component={HowItWorks} />
        </>
      )}
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
