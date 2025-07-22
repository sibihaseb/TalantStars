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
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ProgressMascot } from "@/components/mascot/ProgressMascot";
import { EnhancedMediaUpload } from "@/components/media/EnhancedMediaUpload";
import { JobHistoryManager } from '@/components/talent/JobHistoryManager';
import { TierUpgradeManager } from '@/components/billing/TierUpgradeManager';
import { AvailabilityCalendar } from '@/components/talent/AvailabilityCalendar';
import ProfileImageUpload from "@/components/ProfileImageUpload";
import ProfileSharing from '@/components/profile/ProfileSharing';

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
  Info
} from 'lucide-react';

export default function TalentDashboard() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isJobHistoryDialogOpen, setIsJobHistoryDialogOpen] = useState(false);
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [jobHistoryForm, setJobHistoryForm] = useState({
    id: null,
    title: "",
    company: "",
    jobType: "",
    role: "",
    startDate: "",
    endDate: "",
    location: "",
    description: "",
    verified: false
  });
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
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
          setIsJobHistoryDialogOpen(true);
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

  // Create/Update job history mutation
  const createJobHistoryMutation = useMutation({
    mutationFn: async (jobData: any) => {
      console.log("🔥🔥🔥 MUTATION FUNCTION CALLED");
      console.log("editingJobId:", editingJobId);
      console.log("jobData:", jobData);
      
      const method = editingJobId ? 'PUT' : 'POST';
      const url = editingJobId ? `/api/job-history/${editingJobId}` : '/api/job-history';
      
      console.log("🚀 Making API request:", { method, url, jobData });
      
      try {
        const response = await apiRequest(method, url, jobData);
        console.log("✅ API Response received:", response);
        console.log("Response status:", response.status);
        console.log("Response ok:", response.ok);
        
        const result = await response.json();
        console.log("✅ Response JSON:", result);
        return result;
      } catch (error) {
        console.error("❌ API Request failed:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("✅ MUTATION SUCCESS with data:", data);
      queryClient.invalidateQueries({ queryKey: [`/api/job-history/${user?.id}`] });
      setJobHistoryForm({
        id: null,
        title: "",
        company: "",
        jobType: "",
        role: "",
        startDate: "",
        endDate: "",
        location: "",
        description: "",
        verified: false
      });
      setEditingJobId(null);
      setIsJobHistoryDialogOpen(false);
      toast({
        title: "Success",
        description: editingJobId ? "Job history updated successfully!" : "Job history added successfully!",
      });
    },
    onError: (error) => {
      console.error("❌ MUTATION ERROR:", error);
      toast({
        title: "Error",
        description: "Failed to add job history. Please try again.",
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

  const handleCreateJobHistory = () => {
    console.log("🔥🔥🔥 handleCreateJobHistory CALLED");
    console.log("Form data being submitted:", jobHistoryForm);
    console.log("Form validation:", {
      title: !!jobHistoryForm.title,
      company: !!jobHistoryForm.company,
      role: !!jobHistoryForm.role
    });
    console.log("editingJobId:", editingJobId);
    console.log("Mutation status:", {
      isPending: createJobHistoryMutation.isPending,
      isError: createJobHistoryMutation.isError,
      error: createJobHistoryMutation.error
    });
    
    if (jobHistoryForm.title && jobHistoryForm.company && jobHistoryForm.role) {
      console.log("🚀 CALLING MUTATION with data:", jobHistoryForm);
      createJobHistoryMutation.mutate(jobHistoryForm);
    } else {
      console.log("❌ Form validation failed - missing required fields");
      console.log("Missing fields:", {
        title: !jobHistoryForm.title,
        company: !jobHistoryForm.company,
        role: !jobHistoryForm.role
      });
    }
  };

  // Delete job history mutation
  const deleteJobHistoryMutation = useMutation({
    mutationFn: async (jobId: number) => {
      console.log("🔥🔥🔥 DELETE MUTATION FUNCTION CALLED with jobId:", jobId);
      
      try {
        const response = await apiRequest('DELETE', `/api/job-history/${jobId}`);
        console.log("✅ DELETE API Response received:", response);
        console.log("Response status:", response.status);
        console.log("Response ok:", response.ok);
        
        const result = await response.json();
        console.log("✅ DELETE Response JSON:", result);
        return result;
      } catch (error) {
        console.error("❌ DELETE API Request failed:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("✅ DELETE MUTATION SUCCESS with data:", data);
      queryClient.invalidateQueries({ queryKey: [`/api/job-history/${user?.id}`] });
      toast({
        title: "Success",
        description: "Job history deleted successfully!",
      });
    },
    onError: (error) => {
      console.error("❌ DELETE MUTATION ERROR:", error);
      toast({
        title: "Error",
        description: "Failed to delete job history. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEditJob = (job: any) => {
    console.log("🔥🔥🔥 handleEditJob CALLED with job:", job);
    setJobHistoryForm({
      id: job.id,
      title: job.title,
      company: job.company,
      jobType: job.job_type || "",
      role: job.role,
      startDate: job.start_date,
      endDate: job.end_date,
      location: job.location || "",
      description: job.description,
      verified: job.verified
    });
    setEditingJobId(job.id);
    console.log("🔥 Setting dialog open for edit");
    setIsJobHistoryDialogOpen(true);
  };

  const handleDeleteJob = (jobId: number) => {
    console.log("🔥🔥🔥 handleDeleteJob CALLED with jobId:", jobId);
    if (confirm("Are you sure you want to delete this job history entry?")) {
      console.log("🚀 CALLING DELETE MUTATION for jobId:", jobId);
      deleteJobHistoryMutation.mutate(jobId);
    } else {
      console.log("❌ Delete cancelled by user");
    }
  };

  const handleAddJobHistory = () => {
    if (jobHistoryForm.title && jobHistoryForm.company && jobHistoryForm.role) {
      createJobHistoryMutation.mutate(jobHistoryForm);
    }
  };

  const handleCompleteProfile = () => {
    // Navigate to onboarding page for profile completion
    setLocation('/onboarding');
  };

  const handleViewApplications = () => {
    setActiveTab("applications");
  };

  const handleEditProfile = () => {
    setLocation('/onboarding');
  };

  const handleUpdateProfile = () => {
    setLocation('/onboarding');
  };

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

  const profileCompletion = 75; // Calculate based on profile data
  const recentApplications = applications?.slice(0, 3) || [];
  const recentOpportunities = opportunities?.slice(0, 4) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 pt-4">
        {/* Enhanced Header with larger profile and better layout */}
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            {/* Hero background section */}
            <div className="h-32 bg-gradient-to-r from-purple-600 via-blue-500 to-teal-400 relative">
              <div className="absolute inset-0 bg-black/20"></div>
            </div>
            
            {/* Profile content */}
            <div className="relative px-6 pb-6">
              <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6 -mt-16">
                {/* Larger profile avatar */}
                <Avatar className="h-32 w-32 border-4 border-white shadow-xl ring-4 ring-purple-100">
                  <AvatarImage src={user?.profileImageUrl || profile?.profileImageUrl} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white text-3xl font-bold">
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
                    {profile?.bio || `${profile?.talentType} with extensive experience in the entertainment industry.`}
                  </p>
                  
                  <div className="flex items-center justify-center md:justify-start space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profile?.location || 'Location not set'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Available for work</span>
                    </div>
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

              {/* Work Experience - Enhanced with JobHistoryManager */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="w-5 h-5" />
                    <span>Work Experience</span>
                    <Badge variant="outline" className="text-xs">AI Enhanced</Badge>
                  </CardTitle>
                  <CardDescription>
                    Drag to reorder, enhance with AI, and validate skills
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
              {/* Achievements Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Work Experience & Achievements</CardTitle>
                      <CardDescription>Add your professional work history and achievements</CardDescription>
                    </div>
                    <Dialog open={isJobHistoryDialogOpen} onOpenChange={setIsJobHistoryDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Experience
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Work Experience</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="job-title">Job Title</Label>
                              <Input
                                id="job-title"
                                value={jobHistoryForm.title}
                                onChange={(e) => setJobHistoryForm({...jobHistoryForm, title: e.target.value})}
                                placeholder="Lead Actor, Background Vocalist, etc."
                              />
                            </div>
                            <div>
                              <Label htmlFor="company">Company/Production</Label>
                              <Input
                                id="company"
                                value={jobHistoryForm.company}
                                onChange={(e) => setJobHistoryForm({...jobHistoryForm, company: e.target.value})}
                                placeholder="Netflix, Warner Bros, etc."
                              />
                            </div>
                            <div>
                              <Label htmlFor="job-type">Job Type</Label>
                              <Select value={jobHistoryForm.jobType} onValueChange={(value) => setJobHistoryForm({...jobHistoryForm, jobType: value})}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select job type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="feature_film">Feature Film</SelectItem>
                                  <SelectItem value="short_film">Short Film</SelectItem>
                                  <SelectItem value="tv_series">TV Series</SelectItem>
                                  <SelectItem value="commercial">Commercial</SelectItem>
                                  <SelectItem value="music_video">Music Video</SelectItem>
                                  <SelectItem value="theater">Theater</SelectItem>
                                  <SelectItem value="fashion_show">Fashion Show</SelectItem>
                                  <SelectItem value="concert">Concert</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="start-date">Start Date</Label>
                                <Input
                                  id="start-date"
                                  type="date"
                                  value={jobHistoryForm.startDate}
                                  onChange={(e) => setJobHistoryForm({...jobHistoryForm, startDate: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="end-date">End Date</Label>
                                <Input
                                  id="end-date"
                                  type="date"
                                  value={jobHistoryForm.endDate}
                                  onChange={(e) => setJobHistoryForm({...jobHistoryForm, endDate: e.target.value})}
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="description">Description</Label>
                              <Textarea
                                id="description"
                                value={jobHistoryForm.description}
                                onChange={(e) => setJobHistoryForm({...jobHistoryForm, description: e.target.value})}
                                placeholder="Describe your role and achievements..."
                              />
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setIsJobHistoryDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleAddJobHistory}
                                disabled={!jobHistoryForm.title || !jobHistoryForm.company || createJobHistoryMutation.isPending}
                              >
                                {createJobHistoryMutation.isPending ? "Adding..." : "Add"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {jobHistory?.map((job: any, index: number) => (
                        <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Award className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-lg">{job.title}</p>
                              {job.verified && <CheckCircle className="w-5 h-5 text-green-500" />}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{job.company}</p>
                            <p className="text-sm text-gray-500 mb-2">
                              {new Date(job.startDate).getFullYear()} - {job.endDate ? new Date(job.endDate).getFullYear() : 'Present'}
                            </p>
                            {job.description && (
                              <p className="text-sm text-gray-700 dark:text-gray-300">{job.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                      {(!jobHistory || jobHistory.length === 0) && (
                        <div className="text-center py-8">
                          <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 dark:text-gray-400">
                            Add your work history and achievements to showcase your experience
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
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
              
              {/* Social Media Integration */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Social Media Integration</CardTitle>
                      <CardDescription>Connect your social media accounts to showcase your online presence</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <Label htmlFor="instagram">Instagram URL</Label>
                      <Input
                        id="instagram"
                        type="url"
                        placeholder="https://instagram.com/yourusername"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="twitter">Twitter/X URL</Label>
                      <Input
                        id="twitter"
                        type="url"
                        placeholder="https://twitter.com/yourusername"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="linkedin">LinkedIn URL</Label>
                      <Input
                        id="linkedin"
                        type="url"
                        placeholder="https://linkedin.com/in/yourusername"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tiktok">TikTok URL</Label>
                      <Input
                        id="tiktok"
                        type="url"
                        placeholder="https://tiktok.com/@yourusername"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="youtube">YouTube URL</Label>
                      <Input
                        id="youtube"
                        type="url"
                        placeholder="https://youtube.com/@yourusername"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Personal Website</Label>
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://yourwebsite.com"
                        className="mt-1"
                      />
                    </div>
                    <Button className="w-full mt-4">
                      Save Social Media Links
                    </Button>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Note</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-200">
                          Only social media profiles with links will be displayed on your public profile page.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
