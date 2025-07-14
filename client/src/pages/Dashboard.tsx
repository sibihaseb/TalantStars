import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  MessageSquare, 
  Star, 
  Briefcase,
  Plus,
  Search,
  FileText,
  Settings,
  Bell,
  Eye,
  Heart,
  DollarSign,
  Clock,
  Theater,
  Music,
  Camera,
  Mic
} from "lucide-react";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ThemeProvider>
    );
  }

  if (!isAuthenticated) {
    return (
      <ThemeProvider>
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

  // Default to talent role if profile doesn't exist or role is undefined
  const userRole = user?.profile?.role || "talent";

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "talent":
        return <Star className="w-5 h-5" />;
      case "manager":
        return <Users className="w-5 h-5" />;
      case "producer":
        return <Briefcase className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Welcome back, {user?.firstName || user?.profile?.displayName || "User"}!
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="flex items-center gap-1">
                {getRoleIcon(userRole)}
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Account
              </Badge>
              {!user?.profile && (
                <Badge variant="destructive">
                  Profile Incomplete
                </Badge>
              )}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Profile Views</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {user?.profile ? "1,247" : "0"}
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Messages</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {user?.profile ? "12" : "0"}
                    </p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Opportunities</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {user?.profile ? "8" : "0"}
                    </p>
                  </div>
                  <Briefcase className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {user?.profile ? "4.8" : "N/A"}
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Completion Alert */}
          {!user?.profile && (
            <Card className="glass-card border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                      Complete Your Profile
                    </h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Set up your profile to start connecting with opportunities
                    </p>
                  </div>
                  <Button 
                    onClick={() => setLocation("/onboarding")}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    Complete Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {userRole === "talent" && (
              <>
                <Card className="glass-card hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
                      <Search className="w-5 h-5 mr-2 text-blue-600" />
                      Find Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      Browse and apply to casting calls and gigs
                    </p>
                    <Button size="sm" className="w-full" onClick={() => setLocation("/jobs")}>
                      Browse Jobs
                    </Button>
                  </CardContent>
                </Card>

                <Card className="glass-card hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-green-600" />
                      Update Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      Keep your profile current and attractive
                    </p>
                    <Button size="sm" className="w-full" variant="outline" onClick={() => setLocation("/profile")}>
                      Edit Profile
                    </Button>
                  </CardContent>
                </Card>

                <Card className="glass-card hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2 text-purple-600" />
                      Messages
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      Connect with producers and managers
                    </p>
                    <Button size="sm" className="w-full" variant="outline" onClick={() => setLocation("/messages")}>
                      View Messages
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}

            {userRole === "producer" && (
              <>
                <Card className="glass-card hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
                      <Plus className="w-5 h-5 mr-2 text-blue-600" />
                      Post New Gig
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      Create casting calls and find talent
                    </p>
                    <Button size="sm" className="w-full" onClick={() => setLocation("/post-gig")}>
                      Post Gig
                    </Button>
                  </CardContent>
                </Card>

                <Card className="glass-card hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
                      <Users className="w-5 h-5 mr-2 text-green-600" />
                      Find Talent
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      Search through talent profiles
                    </p>
                    <Button size="sm" className="w-full" variant="outline" onClick={() => setLocation("/find-talent")}>
                      Browse Talent
                    </Button>
                  </CardContent>
                </Card>

                <Card className="glass-card hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
                      <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
                      Manage Projects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      Track your active projects
                    </p>
                    <Button size="sm" className="w-full" variant="outline" onClick={() => setLocation("/search")}>
                      View Projects
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}

            {userRole === "manager" && (
              <>
                <Card className="glass-card hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
                      <Users className="w-5 h-5 mr-2 text-blue-600" />
                      Manage Talent
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      Oversee your talent roster
                    </p>
                    <Button size="sm" className="w-full" onClick={() => setLocation("/find-talent")}>
                      View Talent
                    </Button>
                  </CardContent>
                </Card>

                <Card className="glass-card hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
                      <Search className="w-5 h-5 mr-2 text-green-600" />
                      Find Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      Discover gigs for your talent
                    </p>
                    <Button size="sm" className="w-full" variant="outline" onClick={() => setLocation("/search")}>
                      Browse Gigs
                    </Button>
                  </CardContent>
                </Card>

                <Card className="glass-card hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                      Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      Track performance metrics
                    </p>
                    <Button size="sm" className="w-full" variant="outline" onClick={() => setLocation("/dashboard")}>
                      View Analytics
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Recent Activity */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900 dark:text-white">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user?.profile ? (
                  <>
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">
                          Profile created successfully
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Today
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">
                          Account verified
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Today
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Complete your profile to see activity updates
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
}