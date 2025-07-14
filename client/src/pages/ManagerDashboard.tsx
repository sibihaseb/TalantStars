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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
  Settings,
  Edit,
  Upload,
  Bell,
  Search,
  Filter,
  BarChart3,
  UserCheck,
  UserX,
  Video,
  Phone,
  FileText,
  Image,
  Music,
  Folder,
  Heart
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

  const { data: managementRequests = [] } = useQuery({
    queryKey: ['/api/management-requests'],
    enabled: isAuthenticated,
  });

  const { data: talentInquiries = [] } = useQuery({
    queryKey: ['/api/talent-inquiries'],
    enabled: isAuthenticated,
  });

  const { data: analytics = [] } = useQuery({
    queryKey: ['/api/talent-analytics'],
    enabled: isAuthenticated,
  });

  const queryClient = useQueryClient();

  // Mutations for management actions
  const acceptManagementMutation = useMutation({
    mutationFn: (requestId: string) => apiRequest(`/api/management-requests/${requestId}/accept`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/management-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/managed-talent'] });
      toast({
        title: "Management Request Accepted",
        description: "You are now managing this talent.",
      });
    },
  });

  const declineManagementMutation = useMutation({
    mutationFn: (requestId: string) => apiRequest(`/api/management-requests/${requestId}/decline`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/management-requests'] });
      toast({
        title: "Management Request Declined",
        description: "The request has been declined.",
      });
    },
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
  const pendingRequests = managementRequests.filter((req: any) => req.status === 'pending').length;
  const newInquiries = talentInquiries.filter((inquiry: any) => !inquiry.read).length;

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

            {/* Management Request Alert */}
            {pendingRequests > 0 && (
              <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Bell className="h-5 w-5 text-blue-600" />
                      <div>
                        <h3 className="font-medium text-blue-900 dark:text-blue-100">
                          New Management Requests
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-200">
                          {pendingRequests} talent{pendingRequests > 1 ? 's' : ''} requesting management
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.location.href = "#requests"}>
                      Review Requests
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
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
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Requests</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {pendingRequests}
                      </p>
                    </div>
                    <UserPlus className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New Inquiries</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {newInquiries}
                      </p>
                    </div>
                    <Bell className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Meetings</p>
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
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Messages</p>
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
                    <Briefcase className="h-8 w-8 text-indigo-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Dashboard Content */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="talent">My Talent</TabsTrigger>
                <TabsTrigger value="requests">Requests</TabsTrigger>
                <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
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
                          onClick={() => window.location.href = "/messages"}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Group Chat
                        </Button>
                        <Button 
                          className="w-full justify-start" 
                          variant="outline"
                          onClick={() => window.location.href = "/post-gig"}
                        >
                          <Briefcase className="h-4 w-4 mr-2" />
                          Post Project
                        </Button>
                        <Button 
                          className="w-full justify-start" 
                          variant="outline"
                          onClick={() => window.location.href = "/meetings"}
                        >
                          <Video className="h-4 w-4 mr-2" />
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
                          <div key={talent.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                  <Users className="h-6 w-6 text-gray-600" />
                                </div>
                                <div>
                                  <h3 className="font-medium">{talent.name}</h3>
                                  <p className="text-sm text-gray-500">{talent.type}</p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Badge variant={talent.status === 'active' ? 'default' : 'secondary'}>
                                      {talent.status}
                                    </Badge>
                                    <Badge variant="outline">
                                      {talent.profileViews || 0} views
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="outline">
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button size="sm" variant="outline">
                                  <MessageCircle className="h-4 w-4 mr-1" />
                                  Chat
                                </Button>
                                <Button size="sm" variant="outline">
                                  <BarChart3 className="h-4 w-4 mr-1" />
                                  Analytics
                                </Button>
                              </div>
                            </div>
                            
                            {/* Talent Quick Actions */}
                            <div className="grid grid-cols-4 gap-2 mt-3">
                              <Button size="sm" variant="ghost" className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span className="text-xs">Availability</span>
                              </Button>
                              <Button size="sm" variant="ghost" className="flex items-center space-x-1">
                                <DollarSign className="h-3 w-3" />
                                <span className="text-xs">Rates</span>
                              </Button>
                              <Button size="sm" variant="ghost" className="flex items-center space-x-1">
                                <Upload className="h-3 w-3" />
                                <span className="text-xs">Media</span>
                              </Button>
                              <Button size="sm" variant="ghost" className="flex items-center space-x-1">
                                <Eye className="h-3 w-3" />
                                <span className="text-xs">View Profile</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="requests" id="requests">
                <Card>
                  <CardHeader>
                    <CardTitle>Management Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {managementRequests.length === 0 ? (
                      <div className="text-center py-8">
                        <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">No management requests</p>
                        <p className="text-sm text-gray-400 mt-2">Talent can request management from their profile</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {managementRequests.map((request: any) => (
                          <div key={request.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                  <Users className="h-6 w-6 text-gray-600" />
                                </div>
                                <div>
                                  <h3 className="font-medium">{request.talentName}</h3>
                                  <p className="text-sm text-gray-500">{request.talentType}</p>
                                  <p className="text-sm text-gray-500">Requested: {new Date(request.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => acceptManagementMutation.mutate(request.id)}
                                  disabled={acceptManagementMutation.isPending}
                                >
                                  <UserCheck className="h-4 w-4 mr-1" />
                                  Accept
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => declineManagementMutation.mutate(request.id)}
                                  disabled={declineManagementMutation.isPending}
                                >
                                  <UserX className="h-4 w-4 mr-1" />
                                  Decline
                                </Button>
                              </div>
                            </div>
                            {request.message && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                                <p className="text-sm text-gray-700">{request.message}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="inquiries">
                <Card>
                  <CardHeader>
                    <CardTitle>Talent Inquiries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {talentInquiries.length === 0 ? (
                      <div className="text-center py-8">
                        <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">No talent inquiries</p>
                        <p className="text-sm text-gray-400 mt-2">Producers will contact you about your talent</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {talentInquiries.map((inquiry: any) => (
                          <div key={inquiry.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h3 className="font-medium">{inquiry.producerName}</h3>
                                <p className="text-sm text-gray-500">Interested in: {inquiry.talentName}</p>
                                <p className="text-sm text-gray-500">Project: {inquiry.projectName}</p>
                                <p className="text-sm text-gray-500">{new Date(inquiry.createdAt).toLocaleDateString()}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant={inquiry.read ? 'secondary' : 'default'}>
                                  {inquiry.read ? 'Read' : 'New'}
                                </Badge>
                                <Button size="sm" variant="outline">
                                  <MessageCircle className="h-4 w-4 mr-1" />
                                  Reply
                                </Button>
                              </div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-md">
                              <p className="text-sm text-gray-700">{inquiry.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics">
                <Card>
                  <CardHeader>
                    <CardTitle>Talent Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {managedTalent.length === 0 ? (
                      <div className="text-center py-8">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">No talent analytics</p>
                        <p className="text-sm text-gray-400 mt-2">Add talent to your roster to see analytics</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Overall Analytics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-center">
                                <Eye className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                                <div className="text-2xl font-bold">
                                  {managedTalent.reduce((sum: number, talent: any) => sum + (talent.profileViews || 0), 0)}
                                </div>
                                <div className="text-sm text-gray-500">Total Views</div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-center">
                                <Bell className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                                <div className="text-2xl font-bold">{newInquiries}</div>
                                <div className="text-sm text-gray-500">New Inquiries</div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-center">
                                <Briefcase className="h-6 w-6 mx-auto mb-2 text-green-600" />
                                <div className="text-2xl font-bold">
                                  {managedTalent.reduce((sum: number, talent: any) => sum + (talent.activeApplications || 0), 0)}
                                </div>
                                <div className="text-sm text-gray-500">Active Applications</div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-center">
                                <Star className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                                <div className="text-2xl font-bold">
                                  {managedTalent.reduce((sum: number, talent: any) => sum + (talent.endorsements || 0), 0)}
                                </div>
                                <div className="text-sm text-gray-500">Total Endorsements</div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Individual Talent Analytics */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Individual Talent Performance</h3>
                          {managedTalent.map((talent: any) => (
                            <div key={talent.id} className="p-4 border rounded-lg">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                    <Users className="h-5 w-5 text-gray-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium">{talent.name}</h4>
                                    <p className="text-sm text-gray-500">{talent.type}</p>
                                  </div>
                                </div>
                                <Button size="sm" variant="outline">
                                  <BarChart3 className="h-4 w-4 mr-1" />
                                  Detailed View
                                </Button>
                              </div>
                              <div className="grid grid-cols-4 gap-4 text-sm">
                                <div className="text-center">
                                  <div className="font-medium">{talent.profileViews || 0}</div>
                                  <div className="text-gray-500">Views</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium">{talent.inquiries || 0}</div>
                                  <div className="text-gray-500">Inquiries</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium">{talent.applications || 0}</div>
                                  <div className="text-gray-500">Applications</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium">{talent.bookings || 0}</div>
                                  <div className="text-gray-500">Bookings</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="opportunities">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Available Opportunities</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Filter className="h-4 w-4 mr-1" />
                          Filter
                        </Button>
                        <Button variant="outline" size="sm">
                          <Search className="h-4 w-4 mr-1" />
                          Search
                        </Button>
                      </div>
                    </div>
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
                          <div key={job.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h3 className="font-medium">{job.title}</h3>
                                <p className="text-sm text-gray-500">{job.location}</p>
                                <p className="text-sm text-gray-500">Budget: ${job.budget}</p>
                                <p className="text-sm text-gray-500">Type: {job.talentType}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">{job.status}</Badge>
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button size="sm">
                                  <UserPlus className="h-4 w-4 mr-1" />
                                  Recommend Talent
                                </Button>
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                              {job.description}
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
            </Tabs>
          </div>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
}