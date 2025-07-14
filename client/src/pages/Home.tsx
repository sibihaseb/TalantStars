import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { TalentCard } from "@/components/talent/TalentCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Plus, 
  Search, 
  MessageSquare, 
  Star,
  TrendingUp,
  Users,
  Calendar,
  Bell
} from "lucide-react";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Show login screen if not authenticated
  if (!isLoading && !isAuthenticated) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ThemeProvider>
    );
  }

  const userRole = user?.profile?.role || "talent";

  // Fetch recent talents for producers/managers
  const { data: recentTalents = [] } = useQuery({
    queryKey: ["/api/search/talents"],
    enabled: isAuthenticated && userRole !== "talent",
    retry: false,
  });

  // Fetch recent jobs for talents
  const { data: recentJobs = [] } = useQuery({
    queryKey: ["/api/jobs"],
    enabled: isAuthenticated && userRole === "talent",
    retry: false,
  });

  // Fetch conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/conversations"],
    enabled: isAuthenticated,
    retry: false,
  });

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
    return null; // Will redirect to login
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <Header />
        
        <main className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back, {user?.firstName || user?.email}!
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {userRole === "talent" && "Manage your profile and discover new opportunities"}
                {userRole === "manager" && "Oversee your talents and track their performance"}
                {userRole === "producer" && "Find the perfect talent for your projects"}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {userRole === "talent" && (
                <>
                  <Link href="/profile">
                    <Button className="w-full h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                      <Star className="h-5 w-5 mr-2" />
                      Update Profile
                    </Button>
                  </Link>
                  <Link href="/jobs">
                    <Button variant="outline" className="w-full h-16">
                      <Search className="h-5 w-5 mr-2" />
                      Browse Opportunities
                    </Button>
                  </Link>
                  <Link href="/messages">
                    <Button variant="outline" className="w-full h-16 relative">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Messages
                      {conversations.length > 0 && (
                        <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                          {conversations.length}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                </>
              )}
              
              {userRole === "manager" && (
                <>
                  <Link href="/dashboard">
                    <Button className="w-full h-16 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Analytics
                    </Button>
                  </Link>
                  <Link href="/search">
                    <Button variant="outline" className="w-full h-16">
                      <Users className="h-5 w-5 mr-2" />
                      Manage Talents
                    </Button>
                  </Link>
                  <Link href="/messages">
                    <Button variant="outline" className="w-full h-16 relative">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Messages
                      {conversations.length > 0 && (
                        <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                          {conversations.length}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                </>
              )}
              
              {userRole === "producer" && (
                <>
                  <Link href="/search">
                    <Button className="w-full h-16 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
                      <Search className="h-5 w-5 mr-2" />
                      Find Talent
                    </Button>
                  </Link>
                  <Link href="/post-gig">
                    <Button variant="outline" className="w-full h-16">
                      <Plus className="h-5 w-5 mr-2" />
                      Post New Job
                    </Button>
                  </Link>
                  <Link href="/messages">
                    <Button variant="outline" className="w-full h-16 relative">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Messages
                      {conversations.length > 0 && (
                        <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                          {conversations.length}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Dashboard Stats */}
            <div className="mb-8">
              <DashboardStats userRole={userRole} />
            </div>

            {/* Content based on user role */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {userRole === "talent" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5" />
                        <span>Recent Opportunities</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {recentJobs.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500 dark:text-gray-400 mb-4">
                            No opportunities available at the moment
                          </p>
                          <Link href="/jobs">
                            <Button variant="outline">
                              <Search className="h-4 w-4 mr-2" />
                              Browse All Jobs
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {recentJobs.slice(0, 3).map((job: any) => (
                            <div key={job.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                {job.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {job.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <Badge variant="secondary">{job.talentType}</Badge>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {job.budget && `$${job.budget}`}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {userRole !== "talent" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <span>Recent Talents</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {recentTalents.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500 dark:text-gray-400 mb-4">
                            No talents found
                          </p>
                          <Link href="/search">
                            <Button variant="outline">
                              <Search className="h-4 w-4 mr-2" />
                              Search Talents
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {recentTalents.slice(0, 3).map((talent: any) => (
                            <TalentCard 
                              key={talent.id} 
                              profile={talent} 
                              showActions={false}
                            />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bell className="h-5 w-5" />
                      <span>Recent Activity</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Profile viewed
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            2 hours ago
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            New message received
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            4 hours ago
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Profile optimization suggestion
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            1 day ago
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {userRole === "talent" && (
                        <>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Keep your profile updated with latest work
                            </p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Upload high-quality media samples
                            </p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Respond to messages promptly
                            </p>
                          </div>
                        </>
                      )}
                      {userRole === "manager" && (
                        <>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Review talent performance regularly
                            </p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Help talents optimize their profiles
                            </p>
                          </div>
                        </>
                      )}
                      {userRole === "producer" && (
                        <>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Use detailed job descriptions for better matches
                            </p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Save favorite talents for future projects
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
}
