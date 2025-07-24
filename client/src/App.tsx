import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { PlanProtectedRoute } from "@/components/PlanProtectedRoute";
import CookieConsentBanner from "@/components/legal/CookieConsentBanner";
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
import AdminDashboard from "@/pages/AdminDashboard";
import PermissionsPage from "@/pages/admin/permissions-page";
import PricingTiersPage from "@/pages/admin/pricing-tiers";
import QuestionsManagement from "@/pages/admin/questions-management";
import FeaturedTalentManagement from "@/pages/admin/featured-talent";
import PromoCodeManagement from "@/pages/admin/promo-codes";
import Auth from "@/pages/Auth";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import MeetingManagement from "@/pages/MeetingManagement";
import TalentProfile from "@/pages/TalentProfile";
import ProfileViewer from "@/pages/ProfileViewer";
import TalentDashboard from "@/pages/TalentDashboard";
import ProducerDashboard from "@/pages/ProducerDashboard";
import ManagerDashboard from "@/pages/ManagerDashboard";
import Availability from "@/pages/Availability";
import MascotDemo from "@/pages/MascotDemo";
import Media from "@/pages/Media";
import Social from "@/pages/SocialModern";
import Checkout from "@/pages/Checkout";
import FeaturedTalents from "@/pages/FeaturedTalents";
import TestUpload from "@/pages/TestUpload";
import DebugLogs from "@/pages/DebugLogs";
import VerificationDemo from "@/pages/verification-demo";
import ProfileSharingPage from "@/pages/ProfileSharingPage";

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
      {/* Auth route - unified login/registration */}
      <Route path="/auth" component={Auth} />
      <Route path="/login" component={Login} />
      <Route path="/forgot-password" component={ForgotPassword} />
      
      {/* Public routes */}
      <Route path="/jobs" component={BrowseJobs} />
      <Route path="/browse-jobs" component={BrowseJobs} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/mascot-demo" component={MascotDemo} />
      <Route path="/featured-talents" component={FeaturedTalents} />
      <Route path="/test-upload" component={TestUpload} />
      <Route path="/debug-logs" component={DebugLogs} />
      <Route path="/verification-demo" component={VerificationDemo} />
      <Route path="/talent/:userId" component={ProfileViewer} />
      
      {/* Protected admin routes */}
      <Route path="/admin">
        {isAuthenticated && (user?.role === 'admin' || user?.role === 'super_admin') ? <Admin /> : <Auth />}
      </Route>
      <Route path="/admin/dashboard">
        {isAuthenticated && (user?.role === 'admin' || user?.role === 'super_admin') ? <AdminDashboard /> : <Auth />}
      </Route>
      <Route path="/admin/permissions">
        {isAuthenticated && (user?.role === 'admin' || user?.role === 'super_admin') ? <PermissionsPage /> : <Auth />}
      </Route>
      <Route path="/admin/pricing-tiers">
        {isAuthenticated && (user?.role === 'admin' || user?.role === 'super_admin') ? <PricingTiersPage /> : <Auth />}
      </Route>
      <Route path="/admin/questions">
        {isAuthenticated && (user?.role === 'admin' || user?.role === 'super_admin') ? <QuestionsManagement /> : <Auth />}
      </Route>
      <Route path="/admin/promo-codes">
        {isAuthenticated && (user?.role === 'admin' || user?.role === 'super_admin') ? <PromoCodeManagement /> : <Auth />}
      </Route>
      <Route path="/admin/questions-management">
        {isAuthenticated && user?.role === 'admin' ? <QuestionsManagement /> : <Auth />}
      </Route>
      <Route path="/admin/featured-talent">
        {isAuthenticated && user?.role === 'admin' ? <FeaturedTalentManagement /> : <Auth />}
      </Route>
      
      {/* Single unified dashboard that redirects based on role */}
      <Route path="/dashboard">
        {isAuthenticated ? <PlanProtectedRoute><Dashboard /></PlanProtectedRoute> : <Auth />}
      </Route>
      
      {/* Direct dashboard routes */}
      <Route path="/talent-dashboard">
        {isAuthenticated ? <PlanProtectedRoute><TalentDashboard /></PlanProtectedRoute> : <Auth />}
      </Route>
      <Route path="/producer-dashboard">
        {isAuthenticated ? <PlanProtectedRoute><ProducerDashboard /></PlanProtectedRoute> : <Auth />}
      </Route>
      <Route path="/manager-dashboard">
        {isAuthenticated ? <PlanProtectedRoute><ManagerDashboard /></PlanProtectedRoute> : <Auth />}
      </Route>
      
      {/* Other protected routes */}
      <Route path="/onboarding">
        {isAuthenticated ? <PlanProtectedRoute><Onboarding /></PlanProtectedRoute> : <Auth />}
      </Route>
      <Route path="/profile-completion">
        {isAuthenticated ? <PlanProtectedRoute><Onboarding /></PlanProtectedRoute> : <Auth />}
      </Route>
      <Route path="/profile">
        {isAuthenticated ? <PlanProtectedRoute><Profile /></PlanProtectedRoute> : <Auth />}
      </Route>
      <Route path="/search">
        {isAuthenticated ? <PlanProtectedRoute><Search /></PlanProtectedRoute> : <Auth />}
      </Route>
      <Route path="/messages">
        {isAuthenticated ? <PlanProtectedRoute><Messages /></PlanProtectedRoute> : <Auth />}
      </Route>
      <Route path="/post-gig">
        {isAuthenticated ? <PlanProtectedRoute><PostGig /></PlanProtectedRoute> : <Auth />}
      </Route>
      <Route path="/find-talent">
        {isAuthenticated ? <PlanProtectedRoute><FindTalent /></PlanProtectedRoute> : <Auth />}
      </Route>
      <Route path="/find-talents">
        <FindTalent />
      </Route>
      <Route path="/talent/:id">
        {isAuthenticated ? <PlanProtectedRoute><TalentProfile /></PlanProtectedRoute> : <Auth />}
      </Route>
      <Route path="/profile/:userId">
        <ProfileViewer />
      </Route>
      <Route path="/meetings">
        {isAuthenticated ? <PlanProtectedRoute><MeetingManagement /></PlanProtectedRoute> : <Auth />}
      </Route>
      <Route path="/availability">
        {isAuthenticated ? <PlanProtectedRoute><Availability /></PlanProtectedRoute> : <Auth />}
      </Route>
      <Route path="/media">
        {isAuthenticated ? <PlanProtectedRoute><Media /></PlanProtectedRoute> : <Auth />}
      </Route>
      <Route path="/social">
        {isAuthenticated ? <PlanProtectedRoute><Social /></PlanProtectedRoute> : <Auth />}
      </Route>
      <Route path="/profile-sharing">
        {isAuthenticated ? <PlanProtectedRoute><ProfileSharingPage /></PlanProtectedRoute> : <Auth />}
      </Route>
      <Route path="/checkout">
        {isAuthenticated ? <Checkout /> : <Auth />}
      </Route>
      
      {/* Conditional home route */}
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <Route path="/">
          <PlanProtectedRoute><Dashboard /></PlanProtectedRoute>
        </Route>
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
        <CookieConsentBanner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
