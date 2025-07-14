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
  Users, 
  Calendar, 
  MessageCircle, 
  Briefcase, 
  TrendingUp, 
  Star, 
  DollarSign,
  Eye,
  Plus,
  CheckCircle,
  AlertCircle,
  UserPlus,
  Settings
} from "lucide-react";

export default function ManagerDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access your manager dashboard.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch manager data
  const { data: profile } = useQuery({
    queryKey: ['/api/auth/user'],
    enabled: isAuthenticated,
  });

  const { data: managedTalent = [] } = useQuery({
    queryKey: ['/api/managed-talent'],
    enabled: isAuthenticated,
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['/api/jobs'],
    enabled: isAuthenticated,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['/api/messages'],
    enabled: isAuthenticated,
  });

  const { data: meetings = [] } = useQuery({
    queryKey: ['/api/meetings'],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
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

  const activeTalent = managedTalent.filter((talent: any) => talent.status === 'active').length;
  const upcomingMeetings = meetings.filter((meeting: any) => meeting.status === 'scheduled').length;
  const unreadMessages = messages.filter((msg: any) => !msg.read).length;
  const availableOpportunities = jobs.filter((job: any) => job.status === 'open').length;

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back, {profile?.profile?.displayName || profile?.displayName || "Manager"}! 
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Manage your talent roster, track opportunities, and coordinate bookings
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Talent</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {activeTalent}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming Meetings</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {upcomingMeetings}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-600" />
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
                    <MessageCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Opportunities</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {availableOpportunities}
                      </p>
                    </div>
                    <Briefcase className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Dashboard Content */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="talent">My Talent</TabsTrigger>
                <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
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
                            <p className="font-medium">Talent booking confirmed</p>
                            <p className="text-sm text-gray-500">2 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium">Meeting scheduled</p>
                            <p className="text-sm text-gray-500">1 day ago</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Users className="h-5 w-5 text-purple-500" />
                          <div>
                            <p className="font-medium">New talent added</p>
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
                          onClick={() => window.location.href = "/find-talent"}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add New Talent
                        </Button>
                        <Button 
                          className="w-full justify-start" 
                          variant="outline"
                          onClick={() => window.location.href = "/jobs"}
                        >
                          <Briefcase className="h-4 w-4 mr-2" />
                          Browse Opportunities
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

              <TabsContent value="talent">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>My Talent Roster</CardTitle>
                      <Button onClick={() => window.location.href = "/find-talent"}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Talent
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {managedTalent.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">No talent in your roster yet</p>
                        <Button className="mt-4" onClick={() => window.location.href = "/find-talent"}>
                          Find and Add Talent
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {managedTalent.map((talent: any) => (
                          <div key={talent.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-gray-600" />
                              </div>
                              <div>
                                <h3 className="font-medium">{talent.name}</h3>
                                <p className="text-sm text-gray-500">{talent.type}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={talent.status === 'active' ? 'default' : 'secondary'}>
                                {talent.status}
                              </Badge>
                              <Button size="sm" variant="outline">
                                Manage
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="opportunities">
                <Card>
                  <CardHeader>
                    <CardTitle>Available Opportunities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {jobs.length === 0 ? (
                      <div className="text-center py-8">
                        <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">No opportunities available</p>
                        <p className="text-sm text-gray-400 mt-2">Check back later for new casting calls</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {jobs.slice(0, 5).map((job: any) => (
                          <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h3 className="font-medium">{job.title}</h3>
                              <p className="text-sm text-gray-500">{job.location}</p>
                              <p className="text-sm text-gray-500">Budget: ${job.budget}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{job.type}</Badge>
                              <Button size="sm">View Details</Button>
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
              </TabsContent>

              <TabsContent value="schedule">
                <Card>
                  <CardHeader>
                    <CardTitle>Schedule & Meetings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {meetings.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">No meetings scheduled</p>
                        <Button className="mt-4" onClick={() => window.location.href = "/meetings"}>
                          Schedule a Meeting
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {meetings.map((meeting: any) => (
                          <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h3 className="font-medium">{meeting.title}</h3>
                              <p className="text-sm text-gray-500">{meeting.date} at {meeting.time}</p>
                              <p className="text-sm text-gray-500">With: {meeting.participants}</p>
                            </div>
                            <Badge variant={meeting.status === 'scheduled' ? 'default' : 'secondary'}>
                              {meeting.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
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