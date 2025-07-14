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
  Film,
  Filter,
  Settings,
  Heart,
  Folder,
  Video,
  Phone,
  Mail,
  MapPin,
  Clock,
  Zap,
  Target,
  Bookmark,
  Share
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

  const { data: talents = [] } = useQuery({
    queryKey: ['/api/talents'],
    enabled: isAuthenticated,
  });

  const { data: savedTalents = [] } = useQuery({
    queryKey: ['/api/saved-talents'],
    enabled: isAuthenticated,
  });

  const { data: projectFolders = [] } = useQuery({
    queryKey: ['/api/project-folders'],
    enabled: isAuthenticated,
  });

  const { data: aiMatches = [] } = useQuery({
    queryKey: ['/api/ai-matches'],
    enabled: isAuthenticated,
  });

  const queryClient = useQueryClient();

  // AI-powered matching mutation
  const generateAIMatchesMutation = useMutation({
    mutationFn: (criteria: any) => apiRequest('/api/ai-matches', { 
      method: 'POST', 
      body: JSON.stringify(criteria) 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-matches'] });
      toast({
        title: "AI Matches Generated",
        description: "Found talent matches based on your criteria.",
      });
    },
  });

  // Save talent to favorites
  const saveTalentMutation = useMutation({
    mutationFn: (talentId: string) => apiRequest('/api/saved-talents', { 
      method: 'POST', 
      body: JSON.stringify({ talentId }) 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-talents'] });
      toast({
        title: "Talent Saved",
        description: "Added to your favorites.",
      });
    },
  });

  // Request meeting mutation
  const requestMeetingMutation = useMutation({
    mutationFn: (meetingData: any) => apiRequest('/api/meetings', { 
      method: 'POST', 
      body: JSON.stringify(meetingData) 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meetings'] });
      toast({
        title: "Meeting Request Sent",
        description: "The talent will be notified of your meeting request.",
      });
    },
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
  const savedTalentCount = savedTalents.length;
  const aiMatchCount = aiMatches.length;

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
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
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Applications</p>
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
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Matches</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {aiMatchCount}
                      </p>
                    </div>
                    <Zap className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Saved Talent</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {savedTalentCount}
                      </p>
                    </div>
                    <Heart className="h-8 w-8 text-red-600" />
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
                    <MessageCircle className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
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
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="talent">Find Talent</TabsTrigger>
                <TabsTrigger value="ai-matches">AI Matches</TabsTrigger>
                <TabsTrigger value="saved">Saved Talent</TabsTrigger>
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
                          onClick={() => generateAIMatchesMutation.mutate({})}
                          disabled={generateAIMatchesMutation.isPending}
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          AI Talent Matching
                        </Button>
                        <Button 
                          className="w-full justify-start" 
                          variant="outline"
                          onClick={() => window.location.href = "/find-talent"}
                        >
                          <Search className="h-4 w-4 mr-2" />
                          Advanced Search
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
                          <Video className="h-4 w-4 mr-2" />
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
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Filter className="h-4 w-4 mr-1" />
                          Advanced Filters
                        </Button>
                        <Button onClick={() => window.location.href = "/find-talent"}>
                          <Search className="h-4 w-4 mr-2" />
                          Full Search
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {talents.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">Search and discover talented individuals</p>
                        <p className="text-sm text-gray-400 mt-2">Use filters to find the perfect match for your projects</p>
                        <Button className="mt-4" onClick={() => window.location.href = "/find-talent"}>
                          Start Searching
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Search Filters */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="outline">Actor</Badge>
                          <Badge variant="outline">Los Angeles</Badge>
                          <Badge variant="outline">Available</Badge>
                          <Button variant="ghost" size="sm">
                            <Plus className="h-3 w-3 mr-1" />
                            Add Filter
                          </Button>
                        </div>
                        
                        {/* Talent Results */}
                        {talents.slice(0, 5).map((talent: any) => (
                          <div key={talent.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                  <Users className="h-6 w-6 text-gray-600" />
                                </div>
                                <div>
                                  <h3 className="font-medium">{talent.name}</h3>
                                  <p className="text-sm text-gray-500">{talent.type}</p>
                                  <p className="text-sm text-gray-500">{talent.location}</p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      ${talent.dailyRate}/day
                                    </Badge>
                                    <Badge variant={talent.availability === 'available' ? 'default' : 'secondary'} className="text-xs">
                                      {talent.availability}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="ghost" onClick={() => saveTalentMutation.mutate(talent.id)}>
                                  <Heart className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Video className="h-4 w-4 mr-1" />
                                  Meet
                                </Button>
                                <Button size="sm">
                                  <MessageCircle className="h-4 w-4 mr-1" />
                                  Contact
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <Button 
                          className="w-full mt-4" 
                          variant="outline"
                          onClick={() => window.location.href = "/find-talent"}
                        >
                          View All Talent
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ai-matches">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        <span>AI-Powered Matches</span>
                      </CardTitle>
                      <Button 
                        onClick={() => generateAIMatchesMutation.mutate({})}
                        disabled={generateAIMatchesMutation.isPending}
                      >
                        <Target className="h-4 w-4 mr-2" />
                        Generate Matches
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {aiMatches.length === 0 ? (
                      <div className="text-center py-8">
                        <Zap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">No AI matches yet</p>
                        <p className="text-sm text-gray-400 mt-2">Generate AI-powered talent matches based on your project requirements</p>
                        <Button 
                          className="mt-4" 
                          onClick={() => generateAIMatchesMutation.mutate({})}
                          disabled={generateAIMatchesMutation.isPending}
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Generate AI Matches
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {aiMatches.map((match: any) => (
                          <div key={match.id} className="p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                  <Zap className="h-6 w-6 text-yellow-600" />
                                </div>
                                <div>
                                  <h3 className="font-medium">{match.talentName}</h3>
                                  <p className="text-sm text-gray-500">{match.talentType}</p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                                      {match.matchScore}% Match
                                    </Badge>
                                    <Badge variant="outline">{match.location}</Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="ghost" onClick={() => saveTalentMutation.mutate(match.talentId)}>
                                  <Heart className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button size="sm">
                                  <MessageCircle className="h-4 w-4 mr-1" />
                                  Contact
                                </Button>
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 bg-white/50 p-3 rounded-md">
                              <p className="font-medium mb-1">Why this match:</p>
                              <p>{match.reason}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="saved">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Heart className="h-5 w-5 text-red-500" />
                        <span>Saved Talent</span>
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Folder className="h-4 w-4 mr-1" />
                          Create Folder
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-1" />
                          Organize
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {savedTalents.length === 0 ? (
                      <div className="text-center py-8">
                        <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">No saved talent yet</p>
                        <p className="text-sm text-gray-400 mt-2">Save talent profiles to organize and track your favorites</p>
                        <Button className="mt-4" onClick={() => window.location.href = "/find-talent"}>
                          <Search className="h-4 w-4 mr-2" />
                          Find Talent to Save
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Project Folders */}
                        {projectFolders.length > 0 && (
                          <div className="mb-6">
                            <h3 className="font-medium mb-3">Project Folders</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {projectFolders.map((folder: any) => (
                                <div key={folder.id} className="p-3 border rounded-lg">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Folder className="h-4 w-4 text-blue-500" />
                                    <span className="font-medium">{folder.name}</span>
                                  </div>
                                  <p className="text-sm text-gray-500">{folder.talentCount} talent saved</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Saved Talent List */}
                        {savedTalents.map((talent: any) => (
                          <div key={talent.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                  <Users className="h-6 w-6 text-gray-600" />
                                </div>
                                <div>
                                  <h3 className="font-medium">{talent.name}</h3>
                                  <p className="text-sm text-gray-500">{talent.type}</p>
                                  <p className="text-sm text-gray-500">Saved: {new Date(talent.savedAt).toLocaleDateString()}</p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      ${talent.dailyRate}/day
                                    </Badge>
                                    <Badge variant={talent.availability === 'available' ? 'default' : 'secondary'} className="text-xs">
                                      {talent.availability}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="ghost">
                                  <Share className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Video className="h-4 w-4 mr-1" />
                                  Meet
                                </Button>
                                <Button size="sm">
                                  <MessageCircle className="h-4 w-4 mr-1" />
                                  Contact
                                </Button>
                              </div>
                            </div>
                            {talent.notes && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                                <p className="text-sm text-gray-700">{talent.notes}</p>
                              </div>
                            )}
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
                    <CardTitle>Project Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Performance Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-center">
                              <Film className="h-6 w-6 mx-auto mb-2 text-green-600" />
                              <div className="text-2xl font-bold text-green-600">{activeJobs}</div>
                              <div className="text-sm text-gray-500">Active Projects</div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-center">
                              <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                              <div className="text-2xl font-bold text-blue-600">{totalApplications}</div>
                              <div className="text-sm text-gray-500">Total Applications</div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-center">
                              <Heart className="h-6 w-6 mx-auto mb-2 text-red-600" />
                              <div className="text-2xl font-bold text-red-600">{savedTalentCount}</div>
                              <div className="text-sm text-gray-500">Saved Talent</div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-center">
                              <CheckCircle className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                              <div className="text-2xl font-bold text-purple-600">{completedJobs}</div>
                              <div className="text-sm text-gray-500">Completed Projects</div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Project Performance */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Project Performance</h3>
                        <div className="space-y-3">
                          {jobs.map((job: any) => (
                            <div key={job.id} className="p-4 border rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium">{job.title}</h4>
                                  <p className="text-sm text-gray-500">{job.location}</p>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium">{job.applicationCount || 0} applications</div>
                                  <div className="text-sm text-gray-500">{job.viewCount || 0} views</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
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