import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Send, 
  Image, 
  Video, 
  Music, 
  Smile, 
  Search,
  UserPlus,
  Users,
  Settings,
  Globe,
  Lock,
  Eye,
  Camera,
  AtSign,
  MapPin,
  Calendar,
  Upload,
  X,
  Star,
  Award,
  Zap,
  Sparkles,
  TrendingUp,
  Play,
  Pause,
  Volume2,
  Filter,
  Grid,
  List,
  MoreHorizontal,
  Bookmark,
  Flag,
  CheckCircle,
  PlusCircle,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Repeat2,
  ExternalLink,
  Download,
  Edit,
  Trash2
} from 'lucide-react';

interface SocialPost {
  id: number;
  userId: number;
  content: string;
  mediaUrls: string[];
  privacy: string;
  taggedUsers: number[];
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string;
    role: string;
    verified?: boolean;
  };
  isLiked?: boolean;
  isBookmarked?: boolean;
  engagement?: {
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    views: number;
  };
}

interface JobHistoryItem {
  id: number;
  title: string;
  company: string;
  jobType: string;
  role: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  verified: boolean;
}

export default function SocialModern() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<any[]>([]);
  const [postPrivacy, setPostPrivacy] = useState<'public' | 'friends' | 'private'>('public');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('feed');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Job history form state
  const [showJobHistoryForm, setShowJobHistoryForm] = useState(false);
  const [jobHistoryForm, setJobHistoryForm] = useState({
    title: '',
    company: '',
    jobType: 'feature_film',
    role: '',
    startDate: '',
    endDate: '',
    location: '',
    description: '',
  });

  // Fetch social feed
  const { data: feedPosts, isLoading: feedLoading } = useQuery({
    queryKey: ['/api/social/feed', selectedFilter],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/social/feed?filter=${selectedFilter}`);
      return response.json();
    },
    enabled: !!user,
  });

  // Fetch user's job history
  const { data: jobHistory, isLoading: jobHistoryLoading } = useQuery({
    queryKey: ['/api/job-history', user?.id],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/job-history/${user?.id}`);
      return response.json();
    },
    enabled: !!user,
  });

  // Fetch social stats
  const { data: socialStats } = useQuery({
    queryKey: ['/api/social/stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/social/stats');
      return response.json();
    },
    enabled: !!user,
  });

  // Fetch trending hashtags
  const { data: trendingHashtags } = useQuery({
    queryKey: ['/api/social/trending'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/social/trending');
      return response.json();
    },
    enabled: !!user,
  });

  // Media upload handler
  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadProgress(10);
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const uploadResult = await response.json();
      setUploadProgress(100);
      
      setSelectedMedia(prev => [...prev, {
        id: Date.now(),
        url: uploadResult.url,
        type: uploadResult.type,
        originalName: uploadResult.originalName,
        size: uploadResult.size,
      }]);

      setTimeout(() => setUploadProgress(0), 1000);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload media file",
        variant: "destructive",
      });
      setUploadProgress(0);
    }
  };

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: { content: string; mediaUrls: string[]; privacy: string }) => {
      const response = await apiRequest('POST', '/api/social/posts', postData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social/feed'] });
      setNewPostContent('');
      setSelectedMedia([]);
      setPostPrivacy('public');
      setShowCreatePost(false);
      toast({
        title: "Post shared successfully! ✨",
        description: "Your update has been shared with your network.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to share post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Job history mutation
  const createJobHistoryMutation = useMutation({
    mutationFn: async (jobData: any) => {
      const response = await apiRequest('POST', '/api/job-history', jobData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/job-history'] });
      setShowJobHistoryForm(false);
      setJobHistoryForm({
        title: '',
        company: '',
        jobType: 'feature_film',
        role: '',
        startDate: '',
        endDate: '',
        location: '',
        description: '',
      });
      toast({
        title: "Work experience added! 🎬",
        description: "Your job history has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add experience",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      await apiRequest('POST', `/api/social/posts/${postId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social/feed'] });
    },
  });

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;
    
    createPostMutation.mutate({
      content: newPostContent,
      mediaUrls: selectedMedia.map(m => m.url),
      privacy: postPrivacy,
    });
  };

  const handleCreateJobHistory = () => {
    if (!jobHistoryForm.title || !jobHistoryForm.company || !jobHistoryForm.role) {
      toast({
        title: "Please fill required fields",
        description: "Title, company, and role are required",
        variant: "destructive",
      });
      return;
    }
    
    createJobHistoryMutation.mutate(jobHistoryForm);
  };

  const handleLikePost = (postId: number) => {
    likePostMutation.mutate(postId);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case 'public': return <Globe className="w-4 h-4" />;
      case 'friends': return <Users className="w-4 h-4" />;
      case 'private': return <Lock className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getJobTypeIcon = (jobType: string) => {
    switch (jobType) {
      case 'feature_film': return <Video className="w-4 h-4" />;
      case 'tv_show': return <Play className="w-4 h-4" />;
      case 'commercial': return <Star className="w-4 h-4" />;
      case 'fashion_show': return <Sparkles className="w-4 h-4" />;
      case 'music_concert': return <Music className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  const getJobTypeColor = (jobType: string) => {
    switch (jobType) {
      case 'feature_film': return 'bg-red-500';
      case 'tv_show': return 'bg-blue-500';
      case 'commercial': return 'bg-green-500';
      case 'fashion_show': return 'bg-purple-500';
      case 'music_concert': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Join the Community</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Connect with talented professionals and share your journey
            </p>
            <Button onClick={() => window.location.href = '/auth'} className="w-full">
              Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar - Profile & Stats */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              
              {/* Profile Card */}
              <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar className="w-16 h-16 border-4 border-white dark:border-gray-700 shadow-lg">
                        <AvatarImage src={user.profileImageUrl} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-bold">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      {user.role === 'talent' && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{user.firstName} {user.lastName}</h3>
                      <p className="text-gray-600 dark:text-gray-400">@{user.username}</p>
                      <Badge 
                        variant="secondary" 
                        className="mt-1 capitalize bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                      >
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{socialStats?.posts || 0}</p>
                      <p className="text-xs text-gray-500">Posts</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">{socialStats?.followers || 0}</p>
                      <p className="text-xs text-gray-500">Followers</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{socialStats?.following || 0}</p>
                      <p className="text-xs text-gray-500">Following</p>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Search className="w-4 h-4 mr-2" />
                      Discover People
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Users className="w-4 h-4 mr-2" />
                      My Network
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Trending Topics */}
              <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    <h3 className="text-lg font-semibold">Trending</h3>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {trendingHashtags?.map((hashtag: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">#{hashtag.tag}</p>
                          <p className="text-xs text-gray-500">{hashtag.count} posts</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {hashtag.trend}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              
              {/* Header with Tabs */}
              <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold">Social Hub</h1>
                        <p className="text-gray-600 dark:text-gray-400">Connect, share, and grow together</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                      >
                        {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                      </Button>
                      <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Posts</SelectItem>
                          <SelectItem value="following">Following</SelectItem>
                          <SelectItem value="trending">Trending</SelectItem>
                          <SelectItem value="recent">Recent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="feed">Feed</TabsTrigger>
                      <TabsTrigger value="create">Create</TabsTrigger>
                      <TabsTrigger value="experience">Experience</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Tab Content */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                
                {/* Feed Tab */}
                <TabsContent value="feed" className="space-y-6">
                  {/* Quick Create Post */}
                  <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border-0 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={user.profileImageUrl} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <Button 
                          variant="outline" 
                          className="flex-1 justify-start text-gray-500 hover:text-gray-700"
                          onClick={() => setActiveTab('create')}
                        >
                          What's happening in your world? ✨
                        </Button>
                        <Button size="sm" onClick={() => setActiveTab('create')}>
                          <PlusCircle className="w-4 h-4 mr-2" />
                          Post
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Posts Feed */}
                  <div className="space-y-6">
                    {feedLoading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <Card key={i} className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border-0 shadow-xl">
                            <CardContent className="p-6">
                              <div className="animate-pulse">
                                <div className="flex items-center space-x-4 mb-4">
                                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                                  <div className="space-y-2">
                                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                                    <div className="h-3 bg-gray-300 rounded w-24"></div>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      feedPosts?.map((post: SocialPost) => (
                        <Card key={post.id} className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                          <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Avatar className="w-12 h-12">
                                  <AvatarImage src={post.user?.profileImageUrl} />
                                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                    {post.user?.firstName?.[0]}{post.user?.lastName?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-semibold">{post.user?.firstName} {post.user?.lastName}</h4>
                                    {post.user?.role === 'talent' && (
                                      <CheckCircle className="w-4 h-4 text-blue-500" />
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <span>@{post.user?.username}</span>
                                    <span>•</span>
                                    <span>{formatTimeAgo(post.createdAt)}</span>
                                    <span>•</span>
                                    {getPrivacyIcon(post.privacy)}
                                  </div>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-gray-800 dark:text-gray-200 mb-4 whitespace-pre-wrap">
                              {post.content}
                            </p>
                            
                            {/* Media attachments */}
                            {post.mediaUrls && post.mediaUrls.length > 0 && (
                              <div className="mb-4">
                                <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
                                  {post.mediaUrls.map((url, index) => (
                                    <div key={index} className="relative aspect-square">
                                      <img 
                                        src={url} 
                                        alt={`Media ${index + 1}`}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                          <CardFooter className="pt-0">
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center space-x-6">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleLikePost(post.id)}
                                  className={`${post.isLiked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500`}
                                >
                                  <Heart className={`w-4 h-4 mr-1 ${post.isLiked ? 'fill-current' : ''}`} />
                                  {post.likes}
                                </Button>
                                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500">
                                  <MessageCircle className="w-4 h-4 mr-1" />
                                  {post.comments}
                                </Button>
                                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-green-500">
                                  <Repeat2 className="w-4 h-4 mr-1" />
                                  {post.shares}
                                </Button>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-yellow-500">
                                  <Bookmark className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500">
                                  <Share2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardFooter>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>

                {/* Create Tab */}
                <TabsContent value="create">
                  <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border-0 shadow-xl">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                          <Edit className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Create Post</h3>
                          <p className="text-gray-600 dark:text-gray-400">Share your thoughts with the community</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={user.profileImageUrl} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Textarea
                            placeholder="What's happening in your world? 🌟"
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            className="min-h-[120px] resize-none border-none focus:ring-0 text-lg placeholder:text-gray-400"
                            maxLength={280}
                          />
                          <div className="flex justify-between items-center mt-2">
                            <div className="text-sm text-gray-500">
                              {280 - newPostContent.length} characters remaining
                            </div>
                            <div className="flex items-center space-x-2">
                              {getPrivacyIcon(postPrivacy)}
                              <Select value={postPrivacy} onValueChange={(value: any) => setPostPrivacy(value)}>
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="public">Public</SelectItem>
                                  <SelectItem value="friends">Friends</SelectItem>
                                  <SelectItem value="private">Private</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Media Preview */}
                      {selectedMedia.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          {selectedMedia.map((media) => (
                            <div key={media.id} className="relative">
                              <img 
                                src={media.url} 
                                alt={media.originalName}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setSelectedMedia(selectedMedia.filter(m => m.id !== media.id))}
                                className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {uploadProgress > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Uploading...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <Progress value={uploadProgress} className="h-2" />
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <label htmlFor="media-upload" className="cursor-pointer">
                              <Image className="w-4 h-4 mr-2" />
                              Photo
                              <input
                                id="media-upload"
                                type="file"
                                accept="image/*,video/*"
                                className="hidden"
                                onChange={handleMediaUpload}
                              />
                            </label>
                          </Button>
                          <Button variant="outline" size="sm">
                            <Video className="w-4 h-4 mr-2" />
                            Video
                          </Button>
                          <Button variant="outline" size="sm">
                            <Music className="w-4 h-4 mr-2" />
                            Audio
                          </Button>
                        </div>
                        <Button 
                          onClick={handleCreatePost}
                          disabled={!newPostContent.trim() || createPostMutation.isPending}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        >
                          {createPostMutation.isPending ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Share Post
                            </>
                          )}
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </TabsContent>

                {/* Experience Tab */}
                <TabsContent value="experience">
                  <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border-0 shadow-xl">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                            <Award className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">Work Experience</h3>
                            <p className="text-gray-600 dark:text-gray-400">Showcase your professional journey</p>
                          </div>
                        </div>
                        <Button onClick={() => setShowJobHistoryForm(true)}>
                          <PlusCircle className="w-4 h-4 mr-2" />
                          Add Experience
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {jobHistoryLoading ? (
                          <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                              <div key={i} className="animate-pulse">
                                <div className="flex items-center space-x-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                                  <div className="space-y-2">
                                    <div className="h-4 bg-gray-300 rounded w-32"></div>
                                    <div className="h-3 bg-gray-300 rounded w-24"></div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          jobHistory?.map((job: JobHistoryItem) => (
                            <div key={job.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-4">
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getJobTypeColor(job.jobType)}`}>
                                    {getJobTypeIcon(job.jobType)}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                      <h4 className="font-semibold text-lg">{job.title}</h4>
                                      {job.verified && (
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                      )}
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400">{job.company}</p>
                                    <p className="text-sm text-gray-500">{job.role}</p>
                                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                      <div className="flex items-center space-x-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>{new Date(job.startDate).getFullYear()} - {job.endDate ? new Date(job.endDate).getFullYear() : 'Present'}</span>
                                      </div>
                                      {job.location && (
                                        <div className="flex items-center space-x-1">
                                          <MapPin className="w-3 h-3" />
                                          <span>{job.location}</span>
                                        </div>
                                      )}
                                    </div>
                                    {job.description && (
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{job.description}</p>
                                    )}
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

            </div>
          </div>

          {/* Right Sidebar - Activity & Suggestions */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              
              {/* Activity Feed */}
              <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-lg font-semibold">Recent Activity</h3>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <p><span className="font-medium">Sarah Johnson</span> liked your post</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      <p><span className="font-medium">Mike Chen</span> commented on your video</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <UserPlus className="w-4 h-4 text-green-500" />
                      <p><span className="font-medium">Emma Davis</span> started following you</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Share2 className="w-4 h-4 text-purple-500" />
                      <p><span className="font-medium">Alex Rodriguez</span> shared your post</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Suggestions */}
              <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold">Suggested Connections</h3>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                              U{i}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">User {i}</p>
                            <p className="text-xs text-gray-500">Talent</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <UserPlus className="w-3 h-3 mr-1" />
                          Follow
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>

        </div>
      </div>

      {/* Job History Form Modal */}
      <Dialog open={showJobHistoryForm} onOpenChange={setShowJobHistoryForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Work Experience</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Project Title *</label>
                <Input
                  value={jobHistoryForm.title}
                  onChange={(e) => setJobHistoryForm({...jobHistoryForm, title: e.target.value})}
                  placeholder="e.g., The Dark Knight"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Company/Studio *</label>
                <Input
                  value={jobHistoryForm.company}
                  onChange={(e) => setJobHistoryForm({...jobHistoryForm, company: e.target.value})}
                  placeholder="e.g., Warner Bros Pictures"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Project Type</label>
                <Select value={jobHistoryForm.jobType} onValueChange={(value) => setJobHistoryForm({...jobHistoryForm, jobType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature_film">Feature Film</SelectItem>
                    <SelectItem value="short_film">Short Film</SelectItem>
                    <SelectItem value="tv_show">TV Show</SelectItem>
                    <SelectItem value="tv_series">TV Series</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="fashion_show">Fashion Show</SelectItem>
                    <SelectItem value="advertisement">Advertisement</SelectItem>
                    <SelectItem value="music_concert">Music Concert</SelectItem>
                    <SelectItem value="theater">Theater</SelectItem>
                    <SelectItem value="voice_over">Voice Over</SelectItem>
                    <SelectItem value="modeling">Modeling</SelectItem>
                    <SelectItem value="documentary">Documentary</SelectItem>
                    <SelectItem value="web_series">Web Series</SelectItem>
                    <SelectItem value="music_video">Music Video</SelectItem>
                    <SelectItem value="corporate_video">Corporate Video</SelectItem>
                    <SelectItem value="live_performance">Live Performance</SelectItem>
                    <SelectItem value="radio">Radio</SelectItem>
                    <SelectItem value="podcast">Podcast</SelectItem>
                    <SelectItem value="audiobook">Audiobook</SelectItem>
                    <SelectItem value="gaming">Gaming</SelectItem>
                    <SelectItem value="animation">Animation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Your Role *</label>
                <Input
                  value={jobHistoryForm.role}
                  onChange={(e) => setJobHistoryForm({...jobHistoryForm, role: e.target.value})}
                  placeholder="e.g., Lead Actor, Background Dancer"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={jobHistoryForm.startDate}
                  onChange={(e) => setJobHistoryForm({...jobHistoryForm, startDate: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={jobHistoryForm.endDate}
                  onChange={(e) => setJobHistoryForm({...jobHistoryForm, endDate: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input
                value={jobHistoryForm.location}
                onChange={(e) => setJobHistoryForm({...jobHistoryForm, location: e.target.value})}
                placeholder="e.g., Los Angeles, CA"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={jobHistoryForm.description}
                onChange={(e) => setJobHistoryForm({...jobHistoryForm, description: e.target.value})}
                placeholder="Describe your role and responsibilities..."
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowJobHistoryForm(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateJobHistory}
                disabled={createJobHistoryMutation.isPending}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
              >
                {createJobHistoryMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <>
                    <Award className="w-4 h-4 mr-2" />
                    Add Experience
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}