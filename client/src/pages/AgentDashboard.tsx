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
  Handshake, 
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
  FileText,
  Phone,
  Mail,
  Award,
  Target,
  BarChart3,
  Zap,
  Building,
  UserPlus,
  FileCheck,
  PieChart,
  TrendingDown,
  Activity
} from 'lucide-react';

export default function AgentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch agent data
  const { data: clients } = useQuery({
    queryKey: ['/api/agent/clients'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/agent/clients');
      return response.json();
    },
    enabled: !!user,
  });

  const { data: deals } = useQuery({
    queryKey: ['/api/agent/deals'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/agent/deals');
      return response.json();
    },
    enabled: !!user,
  });

  const { data: negotiations } = useQuery({
    queryKey: ['/api/agent/negotiations'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/agent/negotiations');
      return response.json();
    },
    enabled: !!user,
  });

  const { data: analytics } = useQuery({
    queryKey: ['/api/agent/analytics'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/agent/analytics');
      return response.json();
    },
    enabled: !!user,
  });

  const activeClients = clients?.filter((c: any) => c.status === 'active') || [];
  const activeDeals = deals?.filter((d: any) => d.status === 'active') || [];
  const pendingNegotiations = negotiations?.filter((n: any) => n.status === 'pending') || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                <AvatarImage src={user?.profileImageUrl} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Agent Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-300 flex items-center space-x-2">
                  <span className="capitalize">{user?.firstName} {user?.lastName}</span>
                  <span>•</span>
                  <span>Talent Agent</span>
                  <span>•</span>
                  <Handshake className="w-4 h-4" />
                  <span>{activeClients.length} Active Clients</span>
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
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm font-medium">Active Clients</p>
                  <p className="text-2xl font-bold">{activeClients.length}</p>
                </div>
                <Users className="w-8 h-8 text-indigo-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Active Deals</p>
                  <p className="text-2xl font-bold">{activeDeals.length}</p>
                </div>
                <Handshake className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Commission</p>
                  <p className="text-2xl font-bold">${analytics?.totalCommission || 0}k</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Success Rate</p>
                  <p className="text-2xl font-bold">{analytics?.successRate || 0}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="deals">Deals</TabsTrigger>
            <TabsTrigger value="negotiations">Negotiations</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Top Clients */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span>Top Clients</span>
                  </CardTitle>
                  <CardDescription>
                    Your highest-earning clients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeClients.slice(0, 3).map((client: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={client.profileImageUrl} />
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs">
                              {client.firstName?.[0]}{client.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{client.firstName} {client.lastName}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{client.talentType}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">${client.earnings || 0}k</Badge>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View All Clients
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Deals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Handshake className="w-5 h-5" />
                    <span>Recent Deals</span>
                  </CardTitle>
                  <CardDescription>
                    Your latest deal activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeDeals.slice(0, 3).map((deal: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{deal.title}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{deal.client}</span>
                          </p>
                        </div>
                        <Badge variant={deal.status === 'closed' ? 'default' : deal.status === 'pending' ? 'secondary' : 'outline'}>
                          {deal.status}
                        </Badge>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Deal
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Negotiations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Pending Negotiations</span>
                  </CardTitle>
                  <CardDescription>
                    Active contract negotiations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingNegotiations.slice(0, 3).map((negotiation: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{negotiation.project}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{negotiation.client}</p>
                        </div>
                        <Badge variant={negotiation.priority === 'high' ? 'destructive' : 'secondary'}>
                          {negotiation.priority}
                        </Badge>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      View All Negotiations
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Client Roster</CardTitle>
                    <CardDescription>Manage your talent representation</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Client
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeClients.map((client: any, index: number) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={client.profileImageUrl} />
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                              {client.firstName?.[0]}{client.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold">{client.firstName} {client.lastName}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{client.talentType}</p>
                          </div>
                          <Badge variant="outline">{client.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Active Deals</span>
                            <span className="font-medium">{client.activeDeals || 0}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Earnings</span>
                            <span className="font-medium">${client.earnings || 0}k</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Commission</span>
                            <span className="font-medium">${client.commission || 0}k</span>
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

          <TabsContent value="deals">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Deal Pipeline</CardTitle>
                    <CardDescription>Track and manage your deals</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                    <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                      <Plus className="w-4 h-4 mr-2" />
                      New Deal
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deals?.map((deal: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                            <Handshake className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{deal.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{deal.client}</p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                              <DollarSign className="w-3 h-3" />
                              <span>${deal.value || 0}k</span>
                              <span>•</span>
                              <Clock className="w-3 h-3" />
                              <span>{deal.timeline}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={deal.status === 'closed' ? 'default' : deal.status === 'pending' ? 'secondary' : 'outline'}>
                          {deal.status}
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

          <TabsContent value="negotiations">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Contract Negotiations</CardTitle>
                    <CardDescription>Manage ongoing negotiations</CardDescription>
                  </div>
                  <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Negotiation
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {negotiations?.map((negotiation: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{negotiation.project}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{negotiation.client}</p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                              <Clock className="w-3 h-3" />
                              <span>Started {negotiation.startDate}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={negotiation.priority === 'high' ? 'destructive' : negotiation.priority === 'medium' ? 'secondary' : 'outline'}>
                          {negotiation.priority}
                        </Badge>
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
                    <CardTitle>Professional Network</CardTitle>
                    <CardDescription>Build relationships and promote your clients</CardDescription>
                  </div>
                  <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Post
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Connect with industry professionals and promote your clients
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
                <CardDescription>Track your agency performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Commission</p>
                          <p className="text-2xl font-bold text-green-600">${analytics?.totalCommission || 0}k</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Deal Success Rate</p>
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
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Deal Value</p>
                          <p className="text-2xl font-bold text-purple-600">${analytics?.avgDealValue || 0}k</p>
                        </div>
                        <BarChart3 className="w-8 h-8 text-purple-500" />
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