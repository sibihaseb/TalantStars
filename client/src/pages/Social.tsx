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
import { useToast } from '@/hooks/use-toast';
import { ThemeProvider } from '@/components/ui/theme-provider';
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
  X
} from 'lucide-react';

interface SocialPost {
  id: number;
  userId: number;
  content: string;
  mediaIds: number[];
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
  };
}

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string;
  role: string;
}

interface MediaFile {
  id: number;
  url: string;
  mediaType: string;
  title: string;
  description: string;
}

export default function Social() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<MediaFile[]>([]);
  const [taggedUsers, setTaggedUsers] = useState<User[]>([]);
  const [postPrivacy, setPostPrivacy] = useState<'public' | 'friends' | 'private'>('public');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch social feed
  const { data: feedPosts, isLoading: feedLoading } = useQuery({
    queryKey: ['/api/social/feed'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/social/feed');
      return response.json();
    },
    enabled: !!user,
  });

  // Fetch user's own posts
  const { data: userPosts } = useQuery({
    queryKey: ['/api/social/posts', user?.id],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/social/posts/${user?.id}`);
      return response.json();
    },
    enabled: !!user,
  });

  // Fetch friends
  const { data: friends } = useQuery({
    queryKey: ['/api/social/friends'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/social/friends');
      return response.json();
    },
    enabled: !!user,
  });

  // Fetch friend requests
  const { data: friendRequests } = useQuery({
    queryKey: ['/api/social/friend-requests'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/social/friend-requests');
      return response.json();
    },
    enabled: !!user,
  });

  // Search users
  const { data: searchResults } = useQuery({
    queryKey: ['/api/social/search', searchQuery],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/social/search?q=${encodeURIComponent(searchQuery)}`);
      return response.json();
    },
    enabled: !!user && searchQuery.length > 2,
  });

  // Media upload handler
  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadProgress(10);
      const response = await fetch('/api/social/upload', {
        method: 'POST',
        body: formData,
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
      queryClient.invalidateQueries({ queryKey: ['/api/social/posts', user?.id] });
      setNewPostContent('');
      setSelectedMedia([]);
      setTaggedUsers([]);
      setPostPrivacy('public');
      toast({
        title: "Post shared!",
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

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      await apiRequest('POST', `/api/social/posts/${postId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social/feed'] });
    },
  });

  // Send friend request mutation
  const sendFriendRequestMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest('POST', `/api/social/friend-request/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social/search'] });
      toast({
        title: "Friend request sent! 👋",
        description: "Your friend request has been sent.",
      });
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

  const handleLikePost = (postId: number) => {
    likePostMutation.mutate(postId);
  };

  const handleSendFriendRequest = (userId: number) => {
    sendFriendRequestMutation.mutate(userId);
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

  const EmojiPicker = ({ onEmojiSelect }: { onEmojiSelect: (emoji: string) => void }) => {
    const emojis = ['😀', '😂', '😍', '🤔', '😎', '🎉', '💪', '🔥', '✨', '🎭', '🎬', '🎤', '🎵', '🎸', '👏', '💯', '🙌', '❤️', '💯', '🌟'];
    
    return (
      <div className="grid grid-cols-10 gap-1 p-2 bg-white dark:bg-gray-800 rounded-lg border shadow-lg">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onEmojiSelect(emoji)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-lg"
          >
            {emoji}
          </button>
        ))}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to access social features</h2>
          <Button onClick={() => window.location.href = '/auth'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Sidebar - User Profile & Navigation */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={user.profileImageUrl} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold">{user.firstName} {user.lastName}</h3>
                      <p className="text-gray-600 dark:text-gray-400">@{user.username}</p>
                      <Badge variant="secondary" className="mt-1">
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Posts</span>
                      <span className="font-medium">{userPosts?.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Friends</span>
                      <span className="font-medium">{friends?.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Requests</span>
                      <span className="font-medium">{friendRequests?.length || 0}</span>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Search className="w-4 h-4 mr-2" />
                        Discover People
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="w-4 h-4 mr-2" />
                        My Network
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="w-4 h-4 mr-2" />
                        Privacy Settings
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Feed */}
            <div className="lg:col-span-2">
              {/* Create Post */}
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar>
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
                        className="min-h-[100px] resize-none border-none focus:ring-0 text-lg placeholder:text-gray-400"
                        maxLength={280}
                      />
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-sm text-gray-500">
                          {280 - newPostContent.length} characters remaining
                        </div>
                        <div className="flex items-center space-x-2">
                          {getPrivacyIcon(postPrivacy)}
                          <span className="text-sm text-gray-600 capitalize">{postPrivacy}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Media Preview */}
                  {selectedMedia.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {selectedMedia.map((media) => (
                          <div key={media.id} className="relative">
                            <img 
                              src={media.url} 
                              alt={media.title}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => setSelectedMedia(selectedMedia.filter(m => m.id !== media.id))}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Tagged Users */}
                  {taggedUsers.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Tagged:</p>
                      <div className="flex flex-wrap gap-2">
                        {taggedUsers.map((user) => (
                          <Badge key={user.id} variant="secondary" className="flex items-center gap-1">
                            <AtSign className="w-3 h-3" />
                            {user.username}
                            <button
                              onClick={() => setTaggedUsers(taggedUsers.filter(u => u.id !== user.id))}
                              className="ml-1 text-red-500 hover:text-red-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Image className="w-4 h-4 mr-1" />
                            Photo
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Media</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <input
                              type="file"
                              accept="image/*,video/*,audio/*"
                              onChange={handleMediaUpload}
                              className="w-full"
                            />
                            {uploadProgress > 0 && (
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                            )}
                            {selectedMedia.length > 0 && (
                              <div className="grid grid-cols-3 gap-2">
                                {selectedMedia.map((media, index) => (
                                  <div key={index} className="relative">
                                    <img 
                                      src={media.url} 
                                      alt="Upload preview" 
                                      className="w-full h-16 object-cover rounded"
                                    />
                                    <button
                                      onClick={() => setSelectedMedia(prev => prev.filter((_, i) => i !== index))}
                                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button variant="ghost" size="sm">
                        <Video className="w-4 h-4 mr-1" />
                        Video
                      </Button>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Smile className="w-4 h-4 mr-1" />
                            Emoji
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Emoji</DialogTitle>
                          </DialogHeader>
                          <EmojiPicker onEmojiSelect={(emoji) => setNewPostContent(prev => prev + emoji)} />
                        </DialogContent>
                      </Dialog>
                      
                      <Button variant="ghost" size="sm">
                        <AtSign className="w-4 h-4 mr-1" />
                        Tag
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <select 
                        value={postPrivacy} 
                        onChange={(e) => setPostPrivacy(e.target.value as 'public' | 'friends' | 'private')}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="public">Public</option>
                        <option value="friends">Friends</option>
                        <option value="private">Private</option>
                      </select>
                      
                      <Button 
                        onClick={handleCreatePost}
                        disabled={!newPostContent.trim() || createPostMutation.isPending}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        {createPostMutation.isPending ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-1" />
                            Share
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>

              {/* Posts Feed */}
              <div className="space-y-6">
                {feedLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading your feed...</p>
                  </div>
                ) : feedPosts?.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <div className="text-6xl mb-4">🌟</div>
                      <h3 className="text-xl font-bold mb-2">Welcome to your social feed!</h3>
                      <p className="text-gray-600 mb-6">
                        Connect with other talents, share your journey, and discover opportunities.
                      </p>
                      <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Find People to Follow
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  feedPosts?.map((post: SocialPost) => (
                    <Card key={post.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={post.user?.profileImageUrl} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                {post.user?.firstName?.[0]}{post.user?.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="font-semibold">
                                  {post.user?.firstName} {post.user?.lastName}
                                </h4>
                                <span className="text-gray-500">@{post.user?.username}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <span>{formatTimeAgo(post.createdAt)}</span>
                                <span>•</span>
                                <div className="flex items-center space-x-1">
                                  {getPrivacyIcon(post.privacy)}
                                  <span className="capitalize">{post.privacy}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 mb-4">
                          {post.content}
                        </div>
                        
                        {/* Media attachments would go here */}
                        {post.mediaIds?.length > 0 && (
                          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
                            <p className="text-sm text-gray-600">Media attachments ({post.mediaIds.length})</p>
                          </div>
                        )}
                        
                        {/* Tagged users */}
                        {post.taggedUsers?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.taggedUsers.map((userId) => (
                              <Badge key={userId} variant="outline" className="text-xs">
                                <AtSign className="w-3 h-3 mr-1" />
                                Tagged user
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-6">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLikePost(post.id)}
                              className="text-gray-600 hover:text-red-500"
                            >
                              <Heart className="w-4 h-4 mr-1" />
                              {post.likes || 0}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-600">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              {post.comments || 0}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-600">
                              <Share2 className="w-4 h-4 mr-1" />
                              {post.shares || 0}
                            </Button>
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}