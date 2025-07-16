import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
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
import { MultipleMediaUpload } from "@/components/media/MultipleMediaUpload";
import { EnhancedMediaUpload } from "@/components/media/EnhancedMediaUpload";
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
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isJobHistoryDialogOpen, setIsJobHistoryDialogOpen] = useState(false);
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [jobHistoryForm, setJobHistoryForm] = useState({
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

  // Calculate dynamic progress based on user profile
  const calculateProfileProgress = () => {
    if (!profile) return [];
    
    console.log('Profile data:', profile);
    console.log('Job history:', jobHistory);
    
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

    console.log('Progress items:', progressItems);
    console.log('Incomplete items:', progressItems.filter(item => !item.completed));

    return progressItems;
  };

  const profileProgress = calculateProfileProgress();

  const handleProgressItemClick = (item: any) => {
    console.log('handleProgressItemClick called with:', item);
    // Navigate to appropriate section based on item
    switch (item.id) {
      case 'basic-info':
        if (!item.completed) {
          console.log('Navigating to onboarding for basic-info');
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
        toast({
          title: "Verification",
          description: "Contact support to complete verification process",
        });
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

  const { data: jobHistory } = useQuery({
    queryKey: ['/api/job-history', user?.id],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/job-history/${user?.id}`);
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

  // Create job history mutation
  const createJobHistoryMutation = useMutation({
    mutationFn: async (jobData: any) => {
      const response = await apiRequest('POST', '/api/job-history', jobData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/job-history'] });
      setJobHistoryForm({
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
      setIsJobHistoryDialogOpen(false);
      toast({
        title: "Success",
        description: "Job history added successfully!",
      });
    },
    onError: (error) => {
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
    if (jobHistoryForm.title && jobHistoryForm.company && jobHistoryForm.role) {
      createJobHistoryMutation.mutate(jobHistoryForm);
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
              <Button 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                onClick={handleEditProfile}
              >
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

              {/* Work Experience */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="w-5 h-5" />
                    <span>Work Experience</span>
                  </CardTitle>
                  <CardDescription>
                    Your professional experience and achievements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {jobHistory?.slice(0, 3).map((job: any, index: number) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-sm">{job.title}</p>
                            {job.verified && <CheckCircle className="w-4 h-4 text-green-500" />}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{job.company}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(job.startDate).getFullYear()} - {job.endDate ? new Date(job.endDate).getFullYear() : 'Present'}
                          </p>
                        </div>
                      </div>
                    ))}
                    {(!jobHistory || jobHistory.length === 0) && (
                      <div className="text-center py-6 text-gray-500">
                        <Award className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">No work experience added yet</p>
                      </div>
                    )}
                    <Dialog open={isJobHistoryDialogOpen} onOpenChange={setIsJobHistoryDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full" size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Experience
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Add Work Experience</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="job-title">Job Title</Label>
                              <Input
                                id="job-title"
                                value={jobHistoryForm.title}
                                onChange={(e) => setJobHistoryForm({...jobHistoryForm, title: e.target.value})}
                                placeholder="e.g., Lead Actor"
                              />
                            </div>
                            <div>
                              <Label htmlFor="company">Company/Production</Label>
                              <Input
                                id="company"
                                value={jobHistoryForm.company}
                                onChange={(e) => setJobHistoryForm({...jobHistoryForm, company: e.target.value})}
                                placeholder="e.g., Netflix"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="job-type">Job Type</Label>
                              <Select value={jobHistoryForm.jobType} onValueChange={(value) => setJobHistoryForm({...jobHistoryForm, jobType: value})}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select job type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="film">Film</SelectItem>
                                  <SelectItem value="tv">Television</SelectItem>
                                  <SelectItem value="theater">Theater</SelectItem>
                                  <SelectItem value="commercial">Commercial</SelectItem>
                                  <SelectItem value="music">Music</SelectItem>
                                  <SelectItem value="modeling">Modeling</SelectItem>
                                  <SelectItem value="voice">Voice Acting</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="role">Role</Label>
                              <Input
                                id="role"
                                value={jobHistoryForm.role}
                                onChange={(e) => setJobHistoryForm({...jobHistoryForm, role: e.target.value})}
                                placeholder="e.g., Supporting Actor"
                              />
                            </div>
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
                            <Label htmlFor="location">Location</Label>
                            <Input
                              id="location"
                              value={jobHistoryForm.location}
                              onChange={(e) => setJobHistoryForm({...jobHistoryForm, location: e.target.value})}
                              placeholder="e.g., Los Angeles, CA"
                            />
                          </div>
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              value={jobHistoryForm.description}
                              onChange={(e) => setJobHistoryForm({...jobHistoryForm, description: e.target.value})}
                              placeholder="Describe your role and achievements..."
                              className="min-h-24"
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsJobHistoryDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleCreateJobHistory}
                              disabled={createJobHistoryMutation.isPending}
                            >
                              {createJobHistoryMutation.isPending ? "Adding..." : "Add Experience"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
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
              {/* Enhanced Media Upload with Gallery */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Media Gallery</CardTitle>
                      <CardDescription>Showcase your work and talent with photos, videos, and audio</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <MultipleMediaUpload 
                        maxFiles={10}
                        onUploadComplete={(media) => {
                          toast({
                            title: "Upload Complete",
                            description: `Successfully uploaded ${media.length} files`,
                          });
                          queryClient.invalidateQueries({ queryKey: ['/api/media'] });
                        }}
                      />
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
              
              {/* Achievements Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Achievements & Experience</CardTitle>
                      <CardDescription>Add your work history and achievements</CardDescription>
                    </div>
                    <Dialog open={isJobHistoryDialogOpen} onOpenChange={setIsJobHistoryDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Achievement
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Job History</DialogTitle>
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
                    <div className="text-center py-8">
                      <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Add your work history and achievements to showcase your experience
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Availability Calendar</CardTitle>
                    <CardDescription>Manage your schedule and availability</CardDescription>
                  </div>
                  <Button 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    onClick={() => toast({ title: "Coming Soon", description: "Calendar functionality will be available soon!" })}
                  >
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