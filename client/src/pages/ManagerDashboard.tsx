import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Calendar, 
  Briefcase, 
  MessageSquare, 
  Star,
  TrendingUp,
  Bell,
  Settings,
  Plus,
  Search,
  Filter,
  Eye,
  Edit3,
  Clock,
  CheckCircle,
  AlertCircle,
  Globe,
  MapPin,
  Phone,
  Mail,
  Award,
  Target,
  BarChart3,
  UserCheck,
  DollarSign,
  FileText,
  Zap,
  HandShake,
  Network,
  Building,
  Compass
} from 'lucide-react';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch manager data
  const { data: talents } = useQuery({
    queryKey: ['/api/manager/talents'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/manager/talents');
      return response.json();
    },
    enabled: !!user,
  });

  const { data: opportunities } = useQuery({
    queryKey: ['/api/manager/opportunities'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/manager/opportunities');
      return response.json();
    },
    enabled: !!user,
  });

  const { data: meetings } = useQuery({
    queryKey: ['/api/manager/meetings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/manager/meetings');
      return response.json();
    },
    enabled: !!user,
  });

  const { data: analytics } = useQuery({
    queryKey: ['/api/manager/analytics'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/manager/analytics');
      return response.json();
    },
    enabled: !!user,
  });

  const activeTalents = talents?.filter((t: any) => t.status === 'active') || [];
  const upcomingMeetings = meetings?.filter((m: any) => new Date(m.date) > new Date()) || [];
  const recentOpportunities = opportunities?.slice(0, 4) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                <AvatarImage src={user?.profileImageUrl} />
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-blue-600 text-white text-xl font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Manager Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-300 flex items-center space-x-2">
                  <span className="capitalize">{user?.firstName} {user?.lastName}</span>
                  <span>•</span>
                  <span>Talent Manager</span>
                  <span>•</span>
                  <Users className="w-4 h-4" />
                  <span>{activeTalents.length} Active Talents</span>
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
              <Button className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Talent
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Active Talents</p>
                  <p className="text-2xl font-bold">{activeTalents.length}</p>
                </div>
                <Users className="w-8 h-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Opportunities</p>
                  <p className="text-2xl font-bold">{opportunities?.length || 0}</p>
                </div>
                <Target className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Meetings</p>
                  <p className="text-2xl font-bold">{upcomingMeetings.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Revenue</p>
                  <p className="text-2xl font-bold">${analytics?.totalRevenue || 0}</p>
                </div>
                <DollarSign className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="talents">My Talents</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span>Top Performers</span>
                  </CardTitle>
                  <CardDescription>
                    Your most successful talents this month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeTalents.slice(0, 3).map((talent: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={talent.profileImageUrl} />
                            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-blue-600 text-white text-xs">
                              {talent.firstName?.[0]}{talent.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{talent.firstName} {talent.lastName}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{talent.talentType}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{talent.bookings || 0} bookings</Badge>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View All Talents
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Meetings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Upcoming Meetings</span>
                  </CardTitle>
                  <CardDescription>
                    Your scheduled meetings and calls
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingMeetings.slice(0, 3).map((meeting: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{meeting.title}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{meeting.time}</span>
                          </p>
                        </div>
                        <Badge variant="outline">{meeting.type}</Badge>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Schedule Meeting
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Opportunities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Briefcase className="w-5 h-5" />
                    <span>Recent Opportunities</span>
                  </CardTitle>
                  <CardDescription>
                    Latest casting calls and gigs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOpportunities.slice(0, 3).map((opp: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{opp.title}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{opp.company}</p>
                        </div>
                        <Badge variant={opp.priority === 'high' ? 'destructive' : 'secondary'}>
                          {opp.priority}
                        </Badge>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full" size="sm">
                      <Search className="w-4 h-4 mr-2" />
                      Browse More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="talents">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Talent Roster</CardTitle>
                    <CardDescription>Manage your talent roster and their careers</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Talent
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeTalents.map((talent: any, index: number) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={talent.profileImageUrl} />
                            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-blue-600 text-white">
                              {talent.firstName?.[0]}{talent.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold">{talent.firstName} {talent.lastName}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{talent.talentType}</p>
                          </div>
                          <Badge variant="outline">{talent.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Active Applications</span>
                            <span className="font-medium">{talent.applications || 0}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Bookings</span>
                            <span className="font-medium">{talent.bookings || 0}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Revenue</span>
                            <span className="font-medium">${talent.revenue || 0}</span>
                          </div>
                          <div className="flex items-center space-x-2 pt-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Message
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

          <TabsContent value="opportunities">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Opportunity Pipeline</CardTitle>
                    <CardDescription>Track and manage opportunities for your talents</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                    <Button className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Opportunity
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOpportunities.map((opp: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                            {opp.company?.[0] || 'C'}
                          </div>
                          <div>
                            <h3 className="font-semibold">{opp.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{opp.company}</p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                              <MapPin className="w-3 h-3" />
                              <span>{opp.location}</span>
                              <span>•</span>
                              <Clock className="w-3 h-3" />
                              <span>Deadline: {opp.deadline}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={opp.priority === 'high' ? 'destructive' : opp.priority === 'medium' ? 'secondary' : 'outline'}>
                          {opp.priority}
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

          <TabsContent value="meetings">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Meeting Schedule</CardTitle>
                    <CardDescription>Manage your meetings and appointments</CardDescription>
                  </div>
                  <Button className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Meeting
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingMeetings.map((meeting: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white">
                            <Calendar className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{meeting.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{meeting.description}</p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                              <Clock className="w-3 h-3" />
                              <span>{meeting.date} at {meeting.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{meeting.type}</Badge>
                        <Button variant="ghost" size="sm">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
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
                    <CardTitle>Social Network</CardTitle>
                    <CardDescription>Connect with industry professionals and promote your talents</CardDescription>
                  </div>
                  <Button className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Post
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Access your social feed and promote your talents
                  </p>
                  <Button variant="outline" className="mt-4">
                    <Globe className="w-4 h-4 mr-2" />
                    Go to Social
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>Track your talent management performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                          <p className="text-2xl font-bold text-green-600">${analytics?.totalRevenue || 0}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
                          <p className="text-2xl font-bold text-blue-600">{analytics?.successRate || 0}%</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Network Growth</p>
                          <p className="text-2xl font-bold text-purple-600">+{analytics?.networkGrowth || 0}</p>
                        </div>
                        <Network className="w-8 h-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}