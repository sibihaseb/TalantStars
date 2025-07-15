import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { 
  User, 
  Calendar, 
  MessageCircle, 
  Briefcase, 
  TrendingUp, 
  Star, 
  DollarSign,
  Eye,
  Users,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus
} from "lucide-react";
import { EmotionalProgress } from "@/components/ui/emotional-progress";

export default function TalentDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access your talent dashboard.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch user profile and dashboard data
  const { data: profile } = useQuery({
    queryKey: ['/api/auth/user'],
    enabled: isAuthenticated,
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['/api/jobs'],
    enabled: isAuthenticated,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['/api/job-applications'],
    enabled: isAuthenticated,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['/api/messages'],
    enabled: isAuthenticated,
  });

  const { data: media = [] } = useQuery({
    queryKey: ['/api/media'],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          </main>
          <Footer />
        </div>
      </ThemeProvider>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Calculate profile completion
  const profileCompletion = profile?.profile ? Math.min(100, (
    (profile.profile.displayName ? 10 : 0) +
    (profile.profile.bio ? 15 : 0) +
    (profile.profile.location ? 10 : 0) +
    (profile.profile.skills?.length > 0 ? 20 : 0) +
    (media.length > 0 ? 25 : 0) +
    (profile.profile.resume ? 20 : 0)
  )) : 0;

  const unreadMessages = messages.filter((msg: any) => !msg.read).length;
  const activeApplications = applications.filter((app: any) => app.status === 'pending').length;
  const availableJobs = jobs.filter((job: any) => job.status === 'open').length;

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back, {profile?.profile?.displayName || profile?.displayName || "Talent"}! 
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Manage your talent profile, applications, and opportunities
              </p>
            </div>

            {/* Profile Completion Alert */}
            {profileCompletion < 100 && (
              <Card className="mb-6 border-2 border-gradient-to-r from-blue-200 to-purple-200 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-900/20">
                <CardContent className="p-4">
                  <EmotionalProgress
                    currentStep={Math.floor(profileCompletion / 10)}
                    totalSteps={10}
                    stepTitle="Complete Your Profile"
                    completedSteps={[
                      ...(profile?.profile?.displayName ? ["Display Name"] : []),
                      ...(profile?.profile?.bio ? ["Bio"] : []),
                      ...(profile?.profile?.location ? ["Location"] : []),
                      ...(profile?.profile?.skills?.length > 0 ? ["Skills"] : []),
                      ...(media.length > 0 ? ["Media Portfolio"] : []),
                      ...(profile?.profile?.resume ? ["Resume"] : [])
                    ]}
                    showRewards={true}
                    onStepComplete={(step) => {
                      console.log(`Profile step ${step} completed!`);
                    }}
                  />
                  <div className="mt-4 flex justify-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        // Check if user has a profile, if not go to onboarding
                        if (!profile?.profile?.displayName) {
                          window.location.href = "/onboarding";
                        } else {
                          window.location.href = "/profile";
                        }
                      }}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
                    >
                      Complete Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Profile Views</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {profile?.profile?.profileViews || 0}
                      </p>
                    </div>
                    <Eye className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Applications</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {activeApplications}
                      </p>
                    </div>
                    <Briefcase className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New Messages</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {unreadMessages}
                      </p>
                    </div>
                    <MessageCircle className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available Jobs</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {availableJobs}
                      </p>
                    </div>
                    <Star className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Dashboard Content */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
                <TabsTrigger value="jobs">Find Jobs</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5" />
                        <span>Recent Activity</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="font-medium">Profile updated</p>
                            <p className="text-sm text-gray-500">2 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Briefcase className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium">Applied to new casting</p>
                            <p className="text-sm text-gray-500">1 day ago</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Star className="h-5 w-5 text-yellow-500" />
                          <div>
                            <p className="font-medium">Received skill endorsement</p>
                            <p className="text-sm text-gray-500">2 days ago</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Plus className="h-5 w-5" />
                        <span>Quick Actions</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Button 
                          className="w-full justify-start" 
                          variant="outline"
                          onClick={() => {
                            // Check if user has a profile, if not go to onboarding
                            if (!profile?.profile?.displayName) {
                              window.location.href = "/onboarding";
                            } else {
                              window.location.href = "/profile";
                            }
                          }}
                        >
                          <User className="h-4 w-4 mr-2" />
                          {!profile?.profile?.displayName ? "Complete Profile" : "Edit Profile"}
                        </Button>
                        <Button 
                          className="w-full justify-start" 
                          variant="outline"
                          onClick={() => window.location.href = "/jobs"}
                        >
                          <Briefcase className="h-4 w-4 mr-2" />
                          Browse Jobs
                        </Button>
                        <Button 
                          className="w-full justify-start" 
                          variant="outline"
                          onClick={() => window.location.href = "/messages"}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Messages
                        </Button>
                        <Button 
                          className="w-full justify-start" 
                          variant="outline"
                          onClick={() => window.location.href = "/availability"}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Manage Availability
                        </Button>
                        <Button 
                          className="w-full justify-start" 
                          variant="outline"
                          onClick={() => window.location.href = "/media"}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Upload Media
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Recent Opportunities */}
                <div className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Star className="h-5 w-5" />
                        <span>Recent Opportunities</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {jobs.length === 0 ? (
                        <div className="text-center py-8">
                          <Star className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-gray-500">No opportunities available at the moment</p>
                          <p className="text-sm text-gray-400 mt-2">Check back later for new opportunities</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {jobs.slice(0, 3).map((job: any) => (
                            <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex-1">
                                <h3 className="font-medium">{job.title}</h3>
                                <p className="text-sm text-gray-500">{job.location}</p>
                                <p className="text-sm text-gray-500">Budget: ${job.budget}</p>
                              </div>
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => window.location.href = `/jobs/${job.id}`}
                                >
                                  View Details
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={() => window.location.href = `/jobs/${job.id}/apply`}
                                >
                                  Apply
                                </Button>
                              </div>
                            </div>
                          ))}
                          <Button 
                            className="w-full mt-4" 
                            variant="outline"
                            onClick={() => window.location.href = "/jobs"}
                          >
                            View All Opportunities
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="applications">
                <Card>
                  <CardHeader>
                    <CardTitle>My Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {applications.length === 0 ? (
                      <div className="text-center py-8">
                        <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">No applications yet</p>
                        <Button className="mt-4" onClick={() => window.location.href = "/jobs"}>
                          Browse Available Jobs
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {applications.map((app: any) => (
                          <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h3 className="font-medium">{app.jobTitle}</h3>
                              <p className="text-sm text-gray-500">Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
                            </div>
                            <Badge variant={app.status === 'pending' ? 'secondary' : 'default'}>
                              {app.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="jobs">
                <Card>
                  <CardHeader>
                    <CardTitle>Available Opportunities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {jobs.length === 0 ? (
                      <div className="text-center py-8">
                        <Star className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">No jobs available at the moment</p>
                        <p className="text-sm text-gray-400 mt-2">Check back later for new opportunities</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {jobs.slice(0, 5).map((job: any) => (
                          <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <h3 className="font-medium">{job.title}</h3>
                              <p className="text-sm text-gray-500">{job.location}</p>
                              <p className="text-sm text-gray-500">Budget: ${job.budget}</p>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => window.location.href = `/jobs/${job.id}`}
                              >
                                View Details
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => window.location.href = `/jobs/${job.id}/apply`}
                              >
                                Apply
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button 
                          className="w-full mt-4" 
                          variant="outline"
                          onClick={() => window.location.href = "/jobs"}
                        >
                          View All Jobs
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Profile Completion</span>
                        <span className="font-medium">{profileCompletion}%</span>
                      </div>
                      <Progress value={profileCompletion} />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <Button 
                          className="w-full" 
                          onClick={() => {
                            // Check if user has a profile, if not go to onboarding
                            if (!profile?.profile?.displayName) {
                              window.location.href = "/onboarding";
                            } else {
                              window.location.href = "/profile";
                            }
                          }}
                        >
                          {!profile?.profile?.displayName ? "Complete Profile" : "Edit Profile"}
                        </Button>
                        <Button 
                          className="w-full" 
                          variant="outline"
                          onClick={() => {
                            // Check if user has a profile, if not go to onboarding
                            if (!profile?.profile?.displayName) {
                              window.location.href = "/onboarding";
                            } else {
                              window.location.href = "/profile";
                            }
                          }}
                        >
                          {!profile?.profile?.displayName ? "Setup Profile" : "Upload Media"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
}