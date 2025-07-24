import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useRoute } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";

// Dynamic Availability Status Component
function DynamicAvailabilityStatus({ userId }: { userId: number }) {
  const { data: availabilityEntries = [] } = useQuery({
    queryKey: [`/api/availability/user/${userId}`],
    enabled: !!userId,
    queryFn: async () => {
      const response = await fetch(`/api/availability/user/${userId}`, {
        credentials: 'include',
      });
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Function to determine current availability status from calendar entries
  const getCurrentAvailabilityStatus = () => {
    if (!availabilityEntries?.length) return { status: 'available', text: 'Available for work' };
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Check if there's a current busy/unavailable entry for today
    const currentEntry = availabilityEntries.find((entry: any) => {
      const startDate = new Date(entry.startDate).toISOString().split('T')[0];
      const endDate = new Date(entry.endDate).toISOString().split('T')[0];
      return startDate <= todayStr && endDate >= todayStr;
    });
    
    if (currentEntry) {
      const statusText = {
        'busy': 'Currently busy',
        'unavailable': 'Unavailable',
        'available': 'Available for work'
      }[currentEntry.status] || 'Available for work';
      
      return { status: currentEntry.status, text: statusText };
    }
    
    return { status: 'available', text: 'Available for work' };
  };

  const availability = getCurrentAvailabilityStatus();
  
  // Color coding for different statuses
  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'busy': 'text-yellow-600 dark:text-yellow-400',
      'unavailable': 'text-red-600 dark:text-red-400',
      'available': 'text-green-600 dark:text-green-400'
    };
    return statusColors[status] || statusColors['available'];
  };

  return (
    <div className={`flex items-center gap-1 ${getStatusColor(availability.status)}`}>
      <Calendar className="w-4 h-4" />
      <span>{availability.text}</span>
    </div>
  );
}
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ProgressMascot } from "@/components/mascot/ProgressMascot";
import { EnhancedMediaUpload } from "@/components/media/EnhancedMediaUpload";
import { JobHistoryManager } from '@/components/talent/JobHistoryManager';
import { SkillEndorsements } from '@/components/talent/SkillEndorsements';

import { TierUpgradeManager } from '@/components/billing/TierUpgradeManager';
import { AvailabilityCalendar } from '@/components/talent/AvailabilityCalendar';
import ProfileImageUpload from "@/components/ProfileImageUpload";
import ProfileSharing from '@/components/profile/ProfileSharing';
import SocialMediaManager from '@/components/profile/SocialMediaManager';

import { TemplateSelector } from '@/components/profile/ProfileTemplates';

import UsageDashboard from "@/components/usage/UsageDashboard";
import { NotificationDropdown } from "@/components/ui/notification-dropdown";
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
  PlayCircle,
  Edit,
  Trash,
  Info,
  Palette,
  User
} from 'lucide-react';

export default function TalentDashboard() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const queryClient = useQueryClient();


  const { toast } = useToast();

  // Fetch user profile and stats
  const { data: profile } = useQuery({
    queryKey: ['/api/user/profile'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/user/profile');
      return response.json();
    },
    enabled: !!user,
  });

  // Fetch job history early so it's available for progress calculation
  const { data: jobHistory } = useQuery({
    queryKey: ['/api/job-history', user?.id],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/job-history/${user?.id}`);
      return response.json();
    },
    enabled: !!user,
    refetchOnWindowFocus: true,
    refetchInterval: 10000, // Refetch every 10 seconds to keep data fresh
  });

  // Calculate dynamic progress based on user profile
  const calculateProfileProgress = () => {
    if (!profile) return [];
    
    const progressItems = [
      {
        id: 'basic-info',
        title: 'Complete Basic Information',
        description: 'Add your name, email, and contact details',
        completed: !!(profile.firstName && profile.lastName && profile.email),
        points: 20,
        category: 'profile' as const
      },
      {
        id: 'profile-image',
        title: 'Upload Profile Image',
        description: 'Add a professional headshot',
        completed: !!profile.profileImageUrl,
        points: 25,
        category: 'profile' as const
      },
      {
        id: 'bio',
        title: 'Write Your Bio',
        description: 'Tell your story in 300 words',
        completed: !!(profile.bio && profile.bio.length > 100),
        points: 30,
        category: 'profile' as const
      },
      {
        id: 'skills',
        title: 'Add Skills & Talents',
        description: 'List your key abilities and expertise',
        completed: !!(profile.skills && profile.skills.length > 0),
        points: 25,
        category: 'profile' as const
      },
      {
        id: 'experience',
        title: 'Add Work Experience',
        description: 'Include past jobs and projects',
        completed: !!(jobHistory && jobHistory.length > 0),
        points: 30,
        category: 'experience' as const
      },
      {
        id: 'availability',
        title: 'Set Availability',
        description: 'Update your availability status',
        completed: !!(profile.availabilityStatus && profile.availabilityStatus !== 'not_set'),
        points: 15,
        category: 'profile' as const
      },
      {
        id: 'verification',
        title: 'Get Verified',
        description: 'Complete identity verification',
        completed: !!profile.verified,
        points: 40,
        category: 'achievement' as const
      }
    ];

    return progressItems;
  };

  const profileProgress = useMemo(() => calculateProfileProgress(), [profile, jobHistory]);

  const handleProgressItemClick = (item: any) => {
    // Navigate to appropriate section based on item
    switch (item.id) {
      case 'basic-info':
        if (!item.completed) {
          setLocation('/onboarding');
        } else {
          setActiveTab('overview');
        }
        break;
      case 'profile-image':
        if (!item.completed) {
          setLocation('/onboarding');
        } else {
          setActiveTab('overview');
        }
        break;
      case 'bio':
        if (!item.completed) {
          setLocation('/onboarding');
        } else {
          setActiveTab('overview');
        }
        break;
      case 'skills':
        if (!item.completed) {
          setLocation('/onboarding');
        } else {
          setActiveTab('overview');
        }
        break;
      case 'experience':
        if (!item.completed) {
          setActiveTab('experience');
        } else {
          setActiveTab('overview');
        }
        break;
      case 'availability':
        if (!item.completed) {
          setLocation('/onboarding');
        } else {
          setActiveTab('overview');
        }
        break;
      case 'verification':
        if (!item.completed) {
          toast({
            title: "Verification Process",
            description: "Your profile is complete! Admin verification is the final step to unlock all platform features.",
          });
          // Show verification status or guide user to verification section
          setActiveTab('overview');
        } else {
          toast({
            title: "Already Verified",
            description: "Your profile has been successfully verified by our admin team.",
          });
        }
        break;
      default:
        // For any other incomplete items, navigate to onboarding
        if (!item.completed) {
          setLocation('/onboarding');
        }
        break;
    }
  };

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

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', '/api/social/posts', {
        content,
        privacy: 'public',
        mediaUrls: [],
        taggedUsers: []
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social/feed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/social/stats'] });
      setPostContent("");
      setIsPostDialogOpen(false);
      toast({
        title: "Success",
        description: "Post created successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });



  // Media upload mutation
  const uploadMediaMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', 'portfolio');
      const response = await apiRequest('POST', '/api/upload', formData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      setMediaFile(null);
      setIsMediaDialogOpen(false);
      toast({
        title: "Success",
        description: "Media uploaded successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload media. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Action handlers
  const handleCreatePost = () => {
    if (postContent.trim()) {
      createPostMutation.mutate(postContent);
    }
  };

  const handleMediaUpload = () => {
    if (mediaFile) {
      uploadMediaMutation.mutate(mediaFile);
    }
  };

  // Job history is now handled by JobHistoryManager component





  const handleCompleteProfile = () => {
    // Navigate to onboarding page for profile completion
    setLocation('/onboarding');
  };

  const handleViewApplications = () => {
    setActiveTab("applications");
  };

  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  
  const handleEditProfile = () => {
    setIsProfileEditOpen(true);
  };

  // Profile update is now handled by ProfileEditForm component

  const handleUploadMedia = () => {
    setIsMediaDialogOpen(true);
  };

  const handleUpgrade = () => {
    setActiveTab("billing");
    toast({
      title: "Upgrade Required",
      description: "Please upgrade your plan to access this feature.",
      variant: "default",
    });
  };

  const { data: socialStats } = useQuery({
    queryKey: ['/api/social/stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/social/stats');
      return response.json();
    },
    enabled: !!user,
  });

  // Calculate actual progress percentage
  const profileCompletion = useMemo(() => {
    if (!profileProgress || profileProgress.length === 0) return 0;
    
    const totalPoints = profileProgress.reduce((sum, item) => sum + item.points, 0);
    const completedPoints = profileProgress
      .filter(item => item.completed)
      .reduce((sum, item) => sum + item.points, 0);
    
    if (totalPoints === 0) return 0;
    return Math.round((completedPoints / totalPoints) * 100);
  }, [profileProgress]);
  const recentApplications = applications?.slice(0, 3) || [];
  const recentOpportunities = opportunities?.slice(0, 4) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 pt-4">
        {/* Enhanced Header with larger profile and better layout */}
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            {/* Hero background section */}
            <div className="h-24 bg-gradient-to-r from-purple-600 via-blue-500 to-teal-400 relative">
              <div className="absolute inset-0 bg-black/20"></div>
            </div>
            
            {/* Profile content */}
            <div className="relative px-6 pb-6">
              <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6 -mt-20">
                {/* Larger profile avatar */}
                <Avatar className="h-40 w-40 border-4 border-white shadow-xl ring-4 ring-purple-100">
                  <AvatarImage src={user?.profileImageUrl || undefined} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white text-4xl font-bold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                {/* Profile info */}
                <div className="flex-1 text-center md:text-left md:mt-4">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                      {user?.firstName} {user?.lastName}
                    </h1>
                    {profile?.isVerified && (
                      <div className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-full">
                        <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Verified</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-3 py-1">
                      {user?.role}
                    </Badge>
                    {profile?.talentType && (
                      <Badge variant="outline" className="px-3 py-1">
                        {profile?.talentType}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 max-w-2xl mb-3 leading-relaxed">
                    {profile?.bio || 'Click the edit button to add your professional bio and showcase your experience.'}
                  </p>
                  
                  <div className="flex items-center justify-center md:justify-start space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profile?.location || 'Location not set'}</span>
                    </div>
                    <DynamicAvailabilityStatus userId={user?.id || 0} />
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex items-center space-x-3 md:mt-4">
                  <NotificationDropdown />
                  <Button variant="outline" size="sm" onClick={() => setLocation('/profile-sharing')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 shadow-lg"
                    onClick={handleEditProfile}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </div>
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
          <TabsList className="grid w-full grid-cols-10 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="settings">Settings & Sharing</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Interactive Mascot Progress */}
              <div className="lg:col-span-1">
                <ProgressMascot
                  title="Profile Journey"
                  items={profileProgress}
                  onItemClick={handleProgressItemClick}
                  showActions={true}
                  className="h-fit"
                />
              </div>

              {/* Dashboard Cards */}
              <div className="lg:col-span-2 space-y-8">
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
                    <Button variant="outline" className="w-full" size="sm" onClick={handleViewApplications}>
                      <Eye className="w-4 h-4 mr-2" />
                      View All Applications
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Experience Overview - Enhanced */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="w-5 h-5" />
                    <span>Recent Experience</span>
                  </CardTitle>
                  <CardDescription>
                    Latest work experience entries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {jobHistory && jobHistory.length > 0 ? (
                    <div className="space-y-3">
                      {jobHistory.slice(0, 3).map((job: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Briefcase className="w-4 h-4 text-purple-500" />
                            <div>
                              <p className="font-medium text-sm">{job.title}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{job.company}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {job.role || 'General'}
                          </Badge>
                        </div>
                      ))}
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        size="sm" 
                        onClick={() => setActiveTab('experience')}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Manage All Experience
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Briefcase className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">No work experience added yet</p>
                      <Button 
                        size="sm" 
                        onClick={() => setActiveTab('experience')}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Experience
                      </Button>
                    </div>
                  )}
                </CardContent>
                </Card>
              </div>
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
                    <Button 
                      onClick={() => setLocation('/jobs')}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Browse More
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!opportunities || opportunities.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Opportunities Available</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      We're working hard to bring you the best opportunities. Check back soon or browse all available jobs.
                    </p>
                    <Button 
                      onClick={() => setLocation('/jobs')}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Browse All Jobs
                    </Button>
                  </div>
                ) : (
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
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  // Navigate to job details page
                                  setLocation(`/jobs/${opp.id}`);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View Details
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                                onClick={() => {
                                  // Handle apply/accept action
                                  toast({
                                    title: "Application Submitted",
                                    description: "Your application has been sent to the producer.",
                                  });
                                }}
                              >
                                Accept
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    ))}
                  </div>
                )}
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
                    onClick={() => setLocation('/social')}
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
                    onClick={() => setLocation('/social')}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Go to Social
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio">
            <div className="space-y-6">
              {/* Profile Template Selection */}
              <TemplateSelector 
                selectedTemplate={profile?.profileTemplate || "classic"}
                onTemplateChange={async (template) => {
                  console.log('Template changed to:', template);
                  try {
                    const response = await fetch('/api/user/profile-template', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      credentials: 'include',
                      body: JSON.stringify({ selectedTemplate: template }),
                    });
                    
                    if (response.ok) {
                      toast({
                        title: "Template Updated",
                        description: `Profile template changed to ${template}`,
                      });
                      // Refresh profile data
                      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
                    } else {
                      throw new Error('Failed to save template');
                    }
                  } catch (error) {
                    console.error('Error saving template:', error);
                    toast({
                      title: "Error",
                      description: "Failed to save template selection",
                      variant: "destructive",
                    });
                  }
                }}
                userTier={user?.pricingTierId ? { id: user.pricingTierId, features: ['profile_templates_all'] } : null}
                onUpgrade={handleUpgrade}
              />
              


              {/* Media Portfolio */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Media Portfolio</CardTitle>
                      <CardDescription>Showcase your work with images, videos, and audio</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => setLocation('/media')}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        View All Media
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <EnhancedMediaUpload 
                    showGallery={true}
                    onUploadComplete={(media) => {
                      toast({
                        title: "Media Uploaded",
                        description: "Your media has been added to your portfolio",
                      });
                      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="experience">
            <div className="space-y-6">
              <Tabs defaultValue="work-history" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="work-history" className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Work Experience
                  </TabsTrigger>
                  <TabsTrigger value="skills" className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Skills & Endorsements
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="work-history" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Award className="w-5 h-5" />
                        <span>Work Experience & Achievements</span>
                        <Badge variant="outline" className="text-xs">AI Enhanced</Badge>
                      </CardTitle>
                      <CardDescription>
                        Add your professional work history with AI enhancement and skill validation. Drag to reorder entries.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <JobHistoryManager 
                        jobHistory={jobHistory || []}
                        onJobUpdated={() => {
                          queryClient.invalidateQueries({ queryKey: [`/api/job-history/${user?.id}`] });
                        }}
                        userId={user?.id || 0}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="skills" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Target className="w-5 h-5" />
                        <span>Skills & Endorsements</span>
                      </CardTitle>
                      <CardDescription>
                        Manage your professional skills and get endorsements from colleagues
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <SkillEndorsements 
                        profile={{ 
                          id: user?.id, 
                          skills: profile?.skills, 
                          talentType: profile?.talentType 
                        }} 
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          <TabsContent value="billing">
            <TierUpgradeManager />
          </TabsContent>

          <TabsContent value="usage">
            <UsageDashboard />
          </TabsContent>

          <TabsContent value="calendar">
            <AvailabilityCalendar />
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              {/* Profile Sharing Section */}
              <ProfileSharing />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Profile Edit Dialog */}
      <Dialog open={isProfileEditOpen} onOpenChange={setIsProfileEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <ProfileEditForm 
            profile={profile} 
            user={user} 
            onClose={() => setIsProfileEditOpen(false)}
            onSave={() => {
              setIsProfileEditOpen(false);
              queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
              queryClient.invalidateQueries({ queryKey: [`/api/talent/${user?.username}`] });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Profile Edit Form Component with pre-populated data
function ProfileEditForm({ profile, user, onClose, onSave }: {
  profile: any;
  user: any;
  onClose: () => void;
  onSave: () => void;
}) {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || `${user?.firstName} ${user?.lastName}` || '',
    location: profile?.location || '',
    bio: profile?.bio || '',
    website: profile?.website || '',
    phoneNumber: profile?.phoneNumber || '',
    height: profile?.height || '',
    weight: profile?.weight || '',
    eyeColor: profile?.eyeColor || [],
    hairColor: profile?.hairColor || [],
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PUT', `/api/talent/${user?.username}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      onSave();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="displayName">Display Name *</Label>
          <Input
            id="displayName"
            value={formData.displayName}
            onChange={(e) => handleInputChange('displayName', e.target.value)}
            placeholder="Your display name"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="City, State"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="bio">Professional Bio *</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          placeholder="Tell us about your experience and what makes you unique (minimum 10 characters)"
          rows={4}
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          {formData.bio.length}/500 characters
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="website">Website (Optional)</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            placeholder="https://yourwebsite.com"
          />
        </div>
        
        <div>
          <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
          <Input
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>

      {profile?.talentType === 'actor' && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Actor-Specific Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                value={formData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
                placeholder="5'8&quot;"
              />
            </div>
            
            <div>
              <Label htmlFor="weight">Weight</Label>
              <Input
                id="weight"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder="150 lbs"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={updateProfileMutation.isPending}
          className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
        >
          {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
