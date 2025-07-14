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
import { useQuery } from "@tanstack/react-query";
import { 
  Plus, 
  Users, 
  Briefcase, 
  TrendingUp, 
  Star, 
  DollarSign,
  Eye,
  MessageCircle,
  Calendar,
  CheckCircle,
  AlertCircle,
  Search,
  Film
} from "lucide-react";

export default function ProducerDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access your producer dashboard.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch producer data
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

  if (isLoading) {
    return (
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-green-900">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
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

  const activeJobs = jobs.filter((job: any) => job.status === 'open').length;
  const totalApplications = applications.length;
  const unreadMessages = messages.filter((msg: any) => !msg.read).length;
  const completedJobs = jobs.filter((job: any) => job.status === 'completed').length;

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-green-900">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back, {profile?.profile?.displayName || profile?.displayName || "Producer"}! 
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Manage your projects, find talent, and track casting progress
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Projects</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {activeJobs}
                      </p>
                    </div>
                    <Film className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Applications</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {totalApplications}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
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
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Projects</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {completedJobs}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Dashboard Content */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="talent">Find Talent</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
                            <p className="font-medium">New application received</p>
                            <p className="text-sm text-gray-500">2 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Film className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium">Project "Feature Film" posted</p>
                            <p className="text-sm text-gray-500">1 day ago</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Users className="h-5 w-5 text-purple-500" />
                          <div>
                            <p className="font-medium">Talent shortlisted</p>
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
                          onClick={() => window.location.href = "/post-gig"}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Post New Project
                        </Button>
                        <Button 
                          className="w-full justify-start" 
                          variant="outline"
                          onClick={() => window.location.href = "/find-talent"}
                        >
                          <Search className="h-4 w-4 mr-2" />
                          Find Talent
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
                          onClick={() => window.location.href = "/meetings"}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Meeting
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="projects">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>My Projects</CardTitle>
                      <Button onClick={() => window.location.href = "/post-gig"}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Project
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {jobs.length === 0 ? (
                      <div className="text-center py-8">
                        <Film className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">No projects yet</p>
                        <Button className="mt-4" onClick={() => window.location.href = "/post-gig"}>
                          Post Your First Project
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {jobs.map((job: any) => (
                          <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h3 className="font-medium">{job.title}</h3>
                              <p className="text-sm text-gray-500">{job.location}</p>
                              <p className="text-sm text-gray-500">Budget: ${job.budget}</p>
                              <p className="text-sm text-gray-500">Applications: {job.applicationCount || 0}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                                {job.status}
                              </Badge>
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="talent">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Find Talent</CardTitle>
                      <Button onClick={() => window.location.href = "/find-talent"}>
                        <Search className="h-4 w-4 mr-2" />
                        Advanced Search
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500">Search and discover talented individuals</p>
                      <p className="text-sm text-gray-400 mt-2">Use filters to find the perfect match for your projects</p>
                      <Button className="mt-4" onClick={() => window.location.href = "/find-talent"}>
                        Start Searching
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{activeJobs}</div>
                        <div className="text-sm text-gray-500">Active Projects</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{totalApplications}</div>
                        <div className="text-sm text-gray-500">Total Applications</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{completedJobs}</div>
                        <div className="text-sm text-gray-500">Completed Projects</div>
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