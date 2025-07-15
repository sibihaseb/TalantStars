import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { 
  Calendar, 
  Briefcase, 
  Users, 
  MessageSquare, 
  Camera, 
  Star, 
  TrendingUp,
  Bell,
  Settings,
  Plus,
  Search,
  Filter,
  Eye,
  Heart,
  Share2,
  Edit3,
  Upload,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Globe,
  MapPin,
  Mail,
  Phone,
  Award,
  Target,
  BarChart3,
  PlayCircle
} from 'lucide-react';

export default function TalentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch user profile and stats
  const { data: profile } = useQuery({
    queryKey: ['/api/user/profile'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/user/profile');
      return response.json();
    },
    enabled: !!user,
  });

  const { data: applications } = useQuery({
    queryKey: ['/api/applications'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/applications');
      return response.json();
    },
    enabled: !!user,
  });

  const { data: opportunities } = useQuery({
    queryKey: ['/api/opportunities'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/opportunities');
      return response.json();
    },
    enabled: !!user,
  });

  const { data: socialStats } = useQuery({
    queryKey: ['/api/social/stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/social/stats');
      return response.json();
    },
    enabled: !!user,
  });

  const profileCompletion = 75; // Calculate based on profile data
  const recentApplications = applications?.slice(0, 3) || [];
  const recentOpportunities = opportunities?.slice(0, 4) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                <AvatarImage src={profile?.profileImageUrl} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Welcome back, {user?.firstName}!
                </h1>
                <p className="text-gray-600 dark:text-gray-300 flex items-center space-x-2">
                  <span className="capitalize">{user?.role}</span>
                  <span>•</span>
                  <span className="capitalize">{profile?.talentType}</span>
                  <span>•</span>
                  <MapPin className="w-4 h-4" />
                  <span>{profile?.location}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Profile Views</p>
                  <p className="text-2xl font-bold">{socialStats?.profileViews || 0}</p>
                </div>
                <Eye className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Active Applications</p>
                  <p className="text-2xl font-bold">{applications?.length || 0}</p>
                </div>
                <Briefcase className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Network</p>
                  <p className="text-2xl font-bold">{socialStats?.connections || 0}</p>
                </div>
                <Users className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Opportunities</p>
                  <p className="text-2xl font-bold">{opportunities?.length || 0}</p>
                </div>
                <Target className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Completion */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Profile Completion</span>
                  </CardTitle>
                  <CardDescription>
                    Complete your profile to get better opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-gray-600">{profileCompletion}%</span>
                    </div>
                    <Progress value={profileCompletion} className="h-2" />
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Basic Information</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Profile Photo</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                        <span>Portfolio Media</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span>Demo Reel</span>
                      </div>
                    </div>
                    <Button className="w-full" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Complete Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Applications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Briefcase className="w-5 h-5" />
                    <span>Recent Applications</span>
                  </CardTitle>
                  <CardDescription>
                    Track your latest job applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentApplications.map((app: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{app.title}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{app.company}</p>
                        </div>
                        <Badge variant={app.status === 'pending' ? 'secondary' : app.status === 'approved' ? 'default' : 'destructive'}>
                          {app.status}
                        </Badge>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View All Applications
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Social Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5" />
                    <span>Social Activity</span>
                  </CardTitle>
                  <CardDescription>
                    Your recent social engagement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="text-sm">Post Likes</span>
                      </div>
                      <span className="text-sm font-medium">{socialStats?.likes || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">Comments</span>
                      </div>
                      <span className="text-sm font-medium">{socialStats?.comments || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Share2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Shares</span>
                      </div>
                      <span className="text-sm font-medium">{socialStats?.shares || 0}</span>
                    </div>
                    <Button variant="outline" className="w-full" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Post
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Job Applications</CardTitle>
                    <CardDescription>Track and manage your job applications</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applications?.map((app: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                            {app.company?.[0] || 'C'}
                          </div>
                          <div>
                            <h3 className="font-semibold">{app.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{app.company}</p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                              <Clock className="w-3 h-3" />
                              <span>Applied {app.appliedDate}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={app.status === 'pending' ? 'secondary' : app.status === 'approved' ? 'default' : 'destructive'}>
                          {app.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="opportunities">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recommended Opportunities</CardTitle>
                    <CardDescription>Discover jobs that match your skills and interests</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Browse More
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recentOpportunities.map((opp: any, index: number) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                              {opp.company?.[0] || 'C'}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{opp.title}</CardTitle>
                              <CardDescription>{opp.company}</CardDescription>
                            </div>
                          </div>
                          <Badge variant="outline">{opp.type}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{opp.location}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{opp.deadline}</span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                            {opp.description}
                          </p>
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center space-x-2">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium">{opp.match}% match</span>
                            </div>
                            <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                              Apply Now
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Social Feed</CardTitle>
                    <CardDescription>Connect with the entertainment community</CardDescription>
                  </div>
                  <Button 
                    onClick={() => window.location.href = '/social'}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Post
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Access your social feed by visiting the Social page
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => window.location.href = '/social'}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Go to Social
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Portfolio</CardTitle>
                    <CardDescription>Showcase your work and talent</CardDescription>
                  </div>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    <Upload className="w-4 h-4 mr-2" />
                    Add Media
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors">
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                      <Camera className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-sm text-gray-600 mb-2">Add Photos</p>
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors">
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                      <PlayCircle className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-sm text-gray-600 mb-2">Add Videos</p>
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors">
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                      <Award className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-sm text-gray-600 mb-2">Add Achievements</p>
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Availability Calendar</CardTitle>
                    <CardDescription>Manage your schedule and availability</CardDescription>
                  </div>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Calendar functionality would be integrated here
                  </p>
                  <Button variant="outline" className="mt-4">
                    <Calendar className="w-4 h-4 mr-2" />
                    Open Calendar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}