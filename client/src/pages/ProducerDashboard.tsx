import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { 
  Film, 
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
  DollarSign,
  Camera,
  Play,
  Clapperboard,
  Megaphone,
  Award,
  Target,
  BarChart3,
  Zap,
  Building,
  Calendar1,
  UserPlus
} from 'lucide-react';

export default function ProducerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch producer data
  const { data: projects } = useQuery({
    queryKey: ['/api/producer/projects'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/producer/projects');
      return response.json();
    },
    enabled: !!user,
  });

  const { data: castings } = useQuery({
    queryKey: ['/api/producer/castings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/producer/castings');
      return response.json();
    },
    enabled: !!user,
  });

  const { data: applications } = useQuery({
    queryKey: ['/api/producer/applications'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/producer/applications');
      return response.json();
    },
    enabled: !!user,
  });

  const { data: analytics } = useQuery({
    queryKey: ['/api/producer/analytics'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/producer/analytics');
      return response.json();
    },
    enabled: !!user,
  });

  const activeProjects = projects?.filter((p: any) => p.status === 'active') || [];
  const openCastings = castings?.filter((c: any) => c.status === 'open') || [];
  const recentApplications = applications?.slice(0, 4) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                <AvatarImage src={user?.profileImageUrl} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white text-xl font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Producer Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-300 flex items-center space-x-2">
                  <span className="capitalize">{user?.firstName} {user?.lastName}</span>
                  <span>•</span>
                  <span>Film & TV Producer</span>
                  <span>•</span>
                  <Film className="w-4 h-4" />
                  <span>{activeProjects.length} Active Projects</span>
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
              <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Active Projects</p>
                  <p className="text-2xl font-bold">{activeProjects.length}</p>
                </div>
                <Film className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Open Castings</p>
                  <p className="text-2xl font-bold">{openCastings.length}</p>
                </div>
                <Megaphone className="w-8 h-8 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Applications</p>
                  <p className="text-2xl font-bold">{applications?.length || 0}</p>
                </div>
                <Users className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Budget</p>
                  <p className="text-2xl font-bold">${analytics?.totalBudget || 0}M</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="castings">Castings</TabsTrigger>
            <TabsTrigger value="talent">Talent Pool</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Active Projects */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Film className="w-5 h-5 text-orange-500" />
                    <span>Active Projects</span>
                  </CardTitle>
                  <CardDescription>
                    Your current film and TV projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeProjects.slice(0, 3).map((project: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white">
                            <Film className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{project.title}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{project.type}</p>
                          </div>
                        </div>
                        <Badge variant={project.phase === 'production' ? 'default' : project.phase === 'pre-production' ? 'secondary' : 'outline'}>
                          {project.phase}
                        </Badge>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View All Projects
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Casting Calls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Megaphone className="w-5 h-5" />
                    <span>Recent Casting Calls</span>
                  </CardTitle>
                  <CardDescription>
                    Your latest casting opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {openCastings.slice(0, 3).map((casting: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{casting.role}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Closes {casting.deadline}</span>
                          </p>
                        </div>
                        <Badge variant="outline">{casting.applications || 0} apps</Badge>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Casting Call
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Applications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Recent Applications</span>
                  </CardTitle>
                  <CardDescription>
                    Latest talent applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentApplications.slice(0, 3).map((app: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={app.profileImageUrl} />
                            <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white text-xs">
                              {app.firstName?.[0]}{app.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{app.firstName} {app.lastName}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{app.role}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">New</Badge>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Review Applications
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
                  <div>
                    <CardTitle>Project Portfolio</CardTitle>
                    <CardDescription>Manage your film and TV projects</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                      <Plus className="w-4 h-4 mr-2" />
                      New Project
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeProjects.map((project: any, index: number) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white">
                              <Film className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{project.title}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{project.type}</p>
                            </div>
                          </div>
                          <Badge variant="outline">{project.phase}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Budget</span>
                            <span className="font-medium">${project.budget || 0}M</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Timeline</span>
                            <span className="font-medium">{project.timeline}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Cast</span>
                            <span className="font-medium">{project.castCount || 0} roles</span>
                          </div>
                          <div className="flex items-center space-x-2 pt-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit
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

          <TabsContent value="castings">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Casting Calls</CardTitle>
                    <CardDescription>Manage your casting opportunities</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                    <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                      <Plus className="w-4 h-4 mr-2" />
                      New Casting
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {castings?.map((casting: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white">
                            <Megaphone className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{casting.role}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{casting.project}</p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                              <Calendar className="w-3 h-3" />
                              <span>Deadline: {casting.deadline}</span>
                              <span>•</span>
                              <Users className="w-3 h-3" />
                              <span>{casting.applications || 0} applications</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={casting.status === 'open' ? 'default' : casting.status === 'closed' ? 'secondary' : 'outline'}>
                          {casting.status}
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

          <TabsContent value="talent">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Talent Pool</CardTitle>
                    <CardDescription>Discover and connect with talented individuals</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                      <Search className="w-4 h-4 mr-2" />
                      Search Talent
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Search and discover talent for your projects
                  </p>
                  <Button variant="outline" className="mt-4">
                    <Search className="w-4 h-4 mr-2" />
                    Browse Talent
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Industry Network</CardTitle>
                    <CardDescription>Connect with industry professionals and promote your projects</CardDescription>
                  </div>
                  <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Post
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Share updates about your projects and connect with the industry
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
                <CardTitle>Production Analytics</CardTitle>
                <CardDescription>Track your project performance and industry metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Budget</p>
                          <p className="text-2xl font-bold text-orange-600">${analytics?.totalBudget || 0}M</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-800 dark:to-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Project Success Rate</p>
                          <p className="text-2xl font-bold text-red-600">{analytics?.successRate || 0}%</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-red-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Industry Connections</p>
                          <p className="text-2xl font-bold text-purple-600">{analytics?.connections || 0}</p>
                        </div>
                        <Users className="w-8 h-8 text-purple-500" />
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