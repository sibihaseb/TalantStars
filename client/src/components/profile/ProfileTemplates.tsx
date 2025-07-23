import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, Phone, Globe, Star, CheckCircle, MessageCircle, DollarSign, 
  Clock, Play, Eye, Camera, Film, Award, Users, Heart, Share2, 
  Palette, Layout, Sparkles, Zap, Crown, Music
} from "lucide-react";
import MediaModal from '@/components/MediaModal';
import SkillEndorsement from '@/components/SkillEndorsement';
import SocialMediaLinks from '@/components/profile/SocialMediaLinks';
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export type ProfileTemplate = 'classic' | 'modern' | 'artistic' | 'minimal' | 'cinematic';

interface ProfileTemplatesProps {
  profile: any;
  mediaFiles: any[];
  userId: string;
  user: any;
  selectedTemplate: ProfileTemplate;
  sharingSettings?: any;
  onTemplateChange: (template: ProfileTemplate) => void;
}

// Template Selector Component
export function TemplateSelector({ 
  selectedTemplate, 
  onTemplateChange, 
  userTier,
  onUpgrade 
}: { 
  selectedTemplate: ProfileTemplate, 
  onTemplateChange: (template: ProfileTemplate) => void,
  userTier?: any,
  onUpgrade?: () => void
}) {
  const templates = [
    { id: 'classic' as ProfileTemplate, name: 'Classic', icon: Layout, color: 'bg-blue-500', description: 'Professional and timeless', requiresUpgrade: false },
    { id: 'modern' as ProfileTemplate, name: 'Modern', icon: Zap, color: 'bg-purple-500', description: 'Sleek and contemporary', requiresUpgrade: false },
    { id: 'artistic' as ProfileTemplate, name: 'Artistic', icon: Palette, color: 'bg-pink-500', description: 'Creative and expressive', requiresUpgrade: false },
    { id: 'minimal' as ProfileTemplate, name: 'Minimal', icon: Sparkles, color: 'bg-gray-500', description: 'Clean and focused', requiresUpgrade: false },
    { id: 'cinematic' as ProfileTemplate, name: 'Cinematic', icon: Crown, color: 'bg-yellow-500', description: 'Dramatic and bold', requiresUpgrade: false }
  ];

  // Check if user has access to all templates
  const hasAllTemplates = userTier?.features?.includes('profile_templates_all') || false;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Choose Your Profile Style
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {templates.map((template) => {
            const Icon = template.icon;
            const isLocked = template.requiresUpgrade && !hasAllTemplates;
            
            return (
              <div key={template.id} className="relative">
                <button
                  onClick={() => {
                    if (isLocked) {
                      onUpgrade?.();
                      return;
                    }
                    console.log('Template selected:', template.id);
                    onTemplateChange(template.id);
                  }}
                  disabled={false}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    isLocked 
                      ? 'border-gray-200 bg-gray-50 opacity-75 cursor-not-allowed' 
                      : selectedTemplate === template.id
                        ? 'border-blue-500 bg-blue-50 hover:scale-105'
                        : 'border-gray-200 hover:border-gray-300 hover:scale-105'
                  }`}
                >
                  <div className={`w-12 h-12 ${isLocked ? 'bg-gray-400' : template.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`font-semibold text-sm ${isLocked ? 'text-gray-400' : ''}`}>
                    {template.name}
                  </h3>
                  <p className={`text-xs mt-1 ${isLocked ? 'text-gray-400' : 'text-gray-500'}`}>
                    {template.description}
                  </p>
                </button>
                
                {isLocked && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 rounded-lg">
                    <Crown className="w-6 h-6 text-yellow-500 mb-2" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpgrade?.();
                      }}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium hover:shadow-lg transition-all"
                    >
                      Upgrade Now
                    </button>
                    <p className="text-xs text-center text-gray-600 mb-2 px-2">
                      Please upgrade to access this template
                    </p>
                    <Button
                      size="sm"
                      onClick={onUpgrade}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-3 py-1 text-xs"
                    >
                      Upgrade Now
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default TemplateSelector;

// Shared authentication and button logic
function useProfileActions() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Check authentication status - handle errors gracefully
  const { data: currentUser, error: authError } = useQuery({
    queryKey: ['/api/user'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/user', { credentials: 'include' });
        if (!response.ok) return null;
        return response.json();
      } catch (error) {
        console.log('Auth check failed:', error);
        return null;
      }
    },
    retry: false, // Don't retry on auth failures
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const handleContact = async (targetProfile: any) => {
    console.log('Contact button clicked, currentUser:', currentUser);
    
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please log in to contact this talent.",
        variant: "default"
      });
      
      // Navigate to auth page after showing toast
      setTimeout(() => {
        setLocation('/auth');
      }, 500);
      return;
    }
    
    try {
      // Create a direct message to the talent
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          receiverId: targetProfile.userId || targetProfile.id,
          content: `Hi ${targetProfile.displayName}, I'm interested in discussing potential opportunities with you. Let's connect!`,
        }),
      });

      if (response.ok) {
        toast({
          title: "Message Sent",
          description: `Your message has been sent to ${targetProfile.displayName}.`,
          variant: "default"
        });
        
        // Redirect to messages page to continue conversation
        setTimeout(() => {
          setLocation('/messages');
        }, 1500);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Contact error:', error);
      toast({
        title: "Message Failed",
        description: "Unable to send message. Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleFollow = async (targetProfile: any) => {
    console.log('Follow button clicked, currentUser:', currentUser);
    
    if (!currentUser) {
      toast({
        title: "Login Required", 
        description: "Please log in to follow this talent.",
        variant: "default"
      });
      
      // Navigate to auth page after showing toast
      setTimeout(() => {
        setLocation('/auth');
      }, 500);
      return;
    }
    
    try {
      // Send a friend/follow request
      const response = await fetch('/api/social/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          addresseeId: targetProfile.userId || targetProfile.id,
        }),
      });

      if (response.ok) {
        toast({
          title: "Follow Request Sent",
          description: `You are now following ${targetProfile.displayName}!`,
          variant: "default"
        });
      } else {
        throw new Error('Failed to follow user');
      }
    } catch (error) {
      console.error('Follow error:', error);
      toast({
        title: "Follow Failed",
        description: "Unable to follow this user. Please try again later.",
        variant: "destructive"
      });
    }
  };

  return {
    currentUser,
    handleContact,
    handleFollow
  };
}

// Classic Template - Professional and Timeless
export function ClassicTemplate({ profile, mediaFiles, userId, user, sharingSettings }: Omit<ProfileTemplatesProps, 'selectedTemplate' | 'onTemplateChange'>) {
  const isOwnProfile = user?.id === parseInt(userId);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  // Convert user profile social links to the expected format (handle double nesting)
  const socialLinksData = React.useMemo(() => {
    const profileSocialLinks = profile?.socialLinks?.socialLinks || profile?.socialLinks;
    if (!profileSocialLinks) return [];
    
    return Object.entries(profileSocialLinks).map(([platform, url], index) => ({
      id: index + 1,
      platform,
      username: String(url).split('/').pop() || '',
      url: String(url),
      displayName: platform.charAt(0).toUpperCase() + platform.slice(1),
      isVisible: true,
      sortOrder: index,
      clickCount: 0
    }));
  }, [profile?.socialLinks]);

  // Track profile view when component mounts (only for non-own profiles)
  const { mutate: trackView } = useMutation({
    mutationFn: async () => {
      if (!isOwnProfile) {
        await fetch(`/api/profile/view/${userId}`, {
          method: 'POST',
          credentials: 'include',
        });
      }
    },
    onSuccess: () => {
      // Silently track view - no user feedback needed
    },
  });

  // Track view on mount
  useEffect(() => {
    trackView();
  }, []);

  // Query to fetch current availability status from calendar
  const actualUserId = profile?.userId || profile?.id || userId;
  const { data: availabilityEntries = [] } = useQuery({
    queryKey: [`/api/availability/user/${actualUserId}`],
    enabled: !!actualUserId,
    queryFn: async () => {
      const response = await fetch(`/api/availability/user/${actualUserId}`, {
        credentials: 'include',
      });
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Function to determine current availability status from calendar entries
  const getCurrentAvailabilityStatus = () => {
    if (!availabilityEntries?.length) return profile?.availabilityStatus || 'available';
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Check if there's a current busy/unavailable entry for today
    const currentEntry = availabilityEntries.find((entry: any) => {
      const startDate = new Date(entry.startDate).toISOString().split('T')[0];
      const endDate = new Date(entry.endDate).toISOString().split('T')[0];
      return startDate <= todayStr && endDate >= todayStr;
    });
    
    if (currentEntry) {
      return currentEntry.status;
    }
    
    return profile?.availabilityStatus || 'available';
  };

  const currentAvailability = getCurrentAvailabilityStatus();

  // Get availability display properties
  const getAvailabilityDisplay = (status: string) => {
    switch (status) {
      case 'available':
        return { text: 'Available for work', color: 'bg-green-100 text-green-800', variant: 'default' as const };
      case 'busy':
        return { text: 'Currently busy', color: 'bg-yellow-100 text-yellow-800', variant: 'secondary' as const };
      case 'unavailable':
        return { text: 'Not available', color: 'bg-red-100 text-red-800', variant: 'destructive' as const };
      default:
        return { text: 'Available for work', color: 'bg-green-100 text-green-800', variant: 'default' as const };
    }
  };

  const availabilityDisplay = getAvailabilityDisplay(currentAvailability);

  const handleMediaClick = (index: number) => {
    setSelectedMediaIndex(index);
    setIsMediaModalOpen(true);
  };
  
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Traditional Header */}
      <Card className="bg-white shadow-lg">
        <div 
          className="bg-gradient-to-r from-blue-600 to-blue-800"
          style={{
            backgroundImage: user?.heroImageUrl ? `linear-gradient(rgba(59, 130, 246, 0.7), rgba(30, 64, 175, 0.7)), url(${user.heroImageUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '160px'
          }}
        ></div>
        <CardContent className="relative pt-0 pb-6">
          <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6 -mt-16">
            <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
              <AvatarImage src={user?.profileImageUrl || user?.mainImageUrl || mediaFiles.find(m => m.category === 'headshot')?.url} className="object-cover" />
              <AvatarFallback className="text-2xl font-bold bg-blue-600 text-white">
                {profile?.displayName?.split(' ').map((n: string) => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left md:mt-4">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{profile?.displayName}</h1>
                {profile?.isVerified && <CheckCircle className="w-6 h-6 text-blue-500" />}
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleContact(profile);
                }}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact
              </Button>
              <Button 
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFollow(profile);
                }}
              >
                <Star className="w-4 h-4 mr-2" />
                Follow
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges and Bio Section */}
      <Card className="bg-white shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-wrap justify-center md:justify-start gap-2" style={{ marginBottom: '15px' }}>
            <Badge className="bg-blue-100 text-blue-800">{profile?.role}</Badge>
            {profile?.talentType && <Badge variant="outline">{profile?.talentType}</Badge>}
          </div>
          <p className="text-gray-600 max-w-4xl text-center md:text-left">{profile?.bio}</p>
        </CardContent>
      </Card>

      {/* Content in traditional two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {profile?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{profile.location}</span>
                </div>
              )}
              {profile?.phoneNumber && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{profile.phoneNumber}</span>
                </div>
              )}
              {profile?.website && (sharingSettings?.showSocialMedia !== false) && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                     className="text-sm text-blue-600 hover:underline">{profile.website}</a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <Badge variant={availabilityDisplay.variant} className={`text-xs ${availabilityDisplay.color}`}>
                  {availabilityDisplay.text}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Physical Stats */}
          {(profile?.height || profile?.weight || profile?.eyeColor || profile?.hairColor) && (
            <Card>
              <CardHeader><CardTitle>Physical Details</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {profile?.height && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Height:</span>
                    <span className="text-sm font-medium">{profile.height}</span>
                  </div>
                )}
                {profile?.weight && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Weight:</span>
                    <span className="text-sm font-medium">{profile.weight}</span>
                  </div>
                )}
                {profile?.eyeColor && profile.eyeColor.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Eyes:</span>
                    <span className="text-sm font-medium">{Array.isArray(profile.eyeColor) ? profile.eyeColor.join(', ') : profile.eyeColor}</span>
                  </div>
                )}
                {profile?.hairColor && profile.hairColor.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Hair:</span>
                    <span className="text-sm font-medium">{Array.isArray(profile.hairColor) ? profile.hairColor.join(', ') : profile.hairColor}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Languages */}
          {profile?.languages && profile.languages.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Languages</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((lang: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">{lang}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Social Media Links */}
          {(socialLinksData && socialLinksData.length > 0) && (sharingSettings?.showSocialMedia !== false) && (
            <Card>
              <CardHeader><CardTitle>Connect with Me</CardTitle></CardHeader>
              <CardContent>
                <SocialMediaLinks
                  socialLinks={socialLinksData || []}
                  userId={parseInt(userId)}
                  variant="classic"
                />
              </CardContent>
            </Card>
          )}

          {/* Rates */}
          <Card>
            <CardHeader><CardTitle>Professional Rates</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {profile?.dailyRate && <div className="flex justify-between"><span>Daily:</span><span className="font-semibold">${profile.dailyRate}</span></div>}
              {profile?.weeklyRate && <div className="flex justify-between"><span>Weekly:</span><span className="font-semibold">${profile.weeklyRate}</span></div>}
              {profile?.projectRate && <div className="flex justify-between"><span>Project:</span><span className="font-semibold">${profile.projectRate}</span></div>}
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Portfolio</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {mediaFiles.map((media, index) => (
                  <div key={index} className="relative aspect-square overflow-hidden rounded-lg border cursor-pointer hover:shadow-lg transition-all"
                       onClick={() => handleMediaClick(index)}>
                    <img src={media.url} alt={media.title} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/50 transition-opacity">
                      {media.fileType?.startsWith('video') ? (
                        <Play className="w-8 h-8 text-white" />
                      ) : media.fileType?.startsWith('audio') ? (
                        <Music className="w-8 h-8 text-white" />
                      ) : (
                        <Eye className="w-8 h-8 text-white" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          

        </div>
      </div>
      
      {/* Media Modal */}
      <MediaModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        mediaItems={mediaFiles}
        currentIndex={selectedMediaIndex}
        onIndexChange={setSelectedMediaIndex}
      />
    </div>
  );
}

// Modern Template - Sleek and Contemporary 
export function ModernTemplate({ profile, mediaFiles, userId, user, sharingSettings }: Omit<ProfileTemplatesProps, 'selectedTemplate' | 'onTemplateChange'>) {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const isOwnProfile = user?.id === parseInt(userId);

  // Convert user profile social links to the expected format (handle double nesting)
  const socialLinksData = React.useMemo(() => {
    const profileSocialLinks = profile?.socialLinks?.socialLinks || profile?.socialLinks;
    if (!profileSocialLinks) return [];
    
    return Object.entries(profileSocialLinks).map(([platform, url], index) => ({
      id: index + 1,
      platform,
      username: String(url).split('/').pop() || '',
      url: String(url),
      displayName: platform.charAt(0).toUpperCase() + platform.slice(1),
      isVisible: true,
      sortOrder: index,
      clickCount: 0
    }));
  }, [profile?.socialLinks]);

  // Track profile view when component mounts (only for non-own profiles)
  const { mutate: trackView } = useMutation({
    mutationFn: async () => {
      if (!isOwnProfile) {
        await fetch(`/api/profile/view/${userId}`, {
          method: 'POST',
          credentials: 'include',
        });
      }
    },
    onSuccess: () => {
      // Silently track view - no user feedback needed
    },
  });

  // Track view on mount
  useEffect(() => {
    trackView();
  }, []);

  // Query to fetch current availability status from calendar
  const actualUserId = profile?.userId || profile?.id || userId;
  const { data: availabilityEntries = [] } = useQuery({
    queryKey: [`/api/availability/user/${actualUserId}`],
    enabled: !!actualUserId,
    queryFn: async () => {
      const response = await fetch(`/api/availability/user/${actualUserId}`, {
        credentials: 'include',
      });
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Function to determine current availability status from calendar entries
  const getCurrentAvailabilityStatus = () => {
    if (!availabilityEntries?.length) return profile?.availabilityStatus || 'available';
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Check if there's a current busy/unavailable entry for today
    const currentEntry = availabilityEntries.find((entry: any) => {
      const startDate = new Date(entry.startDate).toISOString().split('T')[0];
      const endDate = new Date(entry.endDate).toISOString().split('T')[0];
      return startDate <= todayStr && endDate >= todayStr;
    });
    
    if (currentEntry) {
      return currentEntry.status;
    }
    
    return profile?.availabilityStatus || 'available';
  };

  const currentAvailability = getCurrentAvailabilityStatus();

  // Get availability display properties
  const getAvailabilityDisplay = (status: string) => {
    switch (status) {
      case 'available':
        return { text: 'Available for work', color: 'bg-green-100 text-green-800', variant: 'default' as const };
      case 'busy':
        return { text: 'Currently busy', color: 'bg-yellow-100 text-yellow-800', variant: 'secondary' as const };
      case 'unavailable':
        return { text: 'Not available', color: 'bg-red-100 text-red-800', variant: 'destructive' as const };
      default:
        return { text: 'Available for work', color: 'bg-green-100 text-green-800', variant: 'default' as const };
    }
  };

  const availabilityDisplay = getAvailabilityDisplay(currentAvailability);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero Section with Glass Morphism */}
      <div className="relative h-96 overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-end gap-6">
              <Avatar className="w-24 h-24 ring-4 ring-white/50">
                <AvatarImage src={user?.profileImageUrl || user?.mainImageUrl || mediaFiles.find(m => m.category === 'headshot')?.url} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xl font-bold">
                  {profile?.displayName?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-white">
                <h1 className="text-4xl font-bold mb-2">{profile?.displayName}</h1>
                <div className="flex gap-2 mb-6">
                  <Badge className="bg-white/20 text-white border-0">{profile?.role}</Badge>
                  <Badge className="bg-gradient-to-r from-pink-500 to-orange-500 text-white border-0">{profile?.talentType}</Badge>
                </div>
                <p className="text-lg opacity-90">{profile?.bio}</p>
              </div>
              <div className="flex gap-4">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleContact(profile);
                  }}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact
                </Button>
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFollow(profile);
                  }}
                >
                  <Star className="w-4 h-4 mr-2" />
                  Follow
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 -mt-20 relative z-10">
        <Card className="backdrop-blur-xl bg-white/80 border-0 shadow-2xl">
          <CardContent className="p-6 text-center">
            <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">${profile?.dailyRate}</div>
            <div className="text-sm text-gray-500">Daily Rate</div>
          </CardContent>
        </Card>
        
        <Card className="backdrop-blur-xl bg-white/80 border-0 shadow-2xl">
          <CardContent className="p-6 text-center">
            <Eye className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{profile?.profileViews || 0}</div>
            <div className="text-sm text-gray-500">Profile Views</div>
          </CardContent>
        </Card>
        
        <Card className="backdrop-blur-xl bg-white/80 border-0 shadow-2xl">
          <CardContent className="p-6 text-center">
            <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{profile?.languages?.length || 0}</div>
            <div className="text-sm text-gray-500">Languages</div>
          </CardContent>
        </Card>
        
        <Card className="backdrop-blur-xl bg-white/80 border-0 shadow-2xl">
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-pink-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-pink-600">{mediaFiles.length}</div>
            <div className="text-sm text-gray-500">Media Items</div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Contact & Availability */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Contact & Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile?.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{profile.location}</span>
              </div>
            )}
            {profile?.phoneNumber && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{profile.phoneNumber}</span>
              </div>
            )}
            {profile?.website && (sharingSettings?.showSocialMedia !== false) && (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-500" />
                <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                   className="text-sm text-blue-600 hover:underline truncate">{profile.website}</a>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              <Badge variant={availabilityDisplay.variant} className={`text-xs ${availabilityDisplay.color}`}>
                {availabilityDisplay.text}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Physical Details */}
        {(profile?.height || profile?.weight || profile?.eyeColor || profile?.hairColor) && (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Physical Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile?.height && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Height:</span>
                  <span className="text-sm font-medium">{profile.height}</span>
                </div>
              )}
              {profile?.weight && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Weight:</span>
                  <span className="text-sm font-medium">{profile.weight}</span>
                </div>
              )}
              {profile?.eyeColor && profile.eyeColor.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Eyes:</span>
                  <span className="text-sm font-medium">{Array.isArray(profile.eyeColor) ? profile.eyeColor.join(', ') : profile.eyeColor}</span>
                </div>
              )}
              {profile?.hairColor && profile.hairColor.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Hair:</span>
                  <span className="text-sm font-medium">{Array.isArray(profile.hairColor) ? profile.hairColor.join(', ') : profile.hairColor}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Languages Only */}
        {profile?.languages && profile.languages.length > 0 && (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-cyan-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-cyan-600" />
                Languages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {profile.languages.map((lang: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">{lang}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Social Media Links */}
        {(sharingSettings?.showSocialMedia !== false) && socialLinksData && socialLinksData.length > 0 && (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-pink-50 md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-pink-600" />
                Social Media
              </CardTitle>
            </CardHeader>
            <CardContent className="py-6">
              <SocialMediaLinks socialLinks={socialLinksData} userId={parseInt(userId)} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modern Media Grid */}
      <Card className="border-0 shadow-2xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl">Portfolio</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mediaFiles.map((media, index) => (
              <div 
                key={index} 
                className="group relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 cursor-pointer"
                onClick={() => {
                  setSelectedMediaIndex(index);
                  setIsMediaModalOpen(true);
                }}
              >
                <img 
                  src={media.url} 
                  alt={media.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-white font-semibold">{media.title}</h3>
                    <p className="text-white/80 text-sm">{media.category}</p>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      {media.fileType?.startsWith('video') ? (
                        <Play className="w-5 h-5 text-white" />
                      ) : media.fileType?.startsWith('audio') ? (
                        <Music className="w-5 h-5 text-white" />
                      ) : (
                        <Eye className="w-5 h-5 text-white" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {mediaFiles.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No media files uploaded yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Media Modal */}
      <MediaModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        mediaItems={mediaFiles}
        currentIndex={selectedMediaIndex}
        onIndexChange={setSelectedMediaIndex}
      />
    </div>
  );
}

// Artistic Template - Creative and Expressive
export function ArtisticTemplate({ profile, mediaFiles, userId, user, sharingSettings }: Omit<ProfileTemplatesProps, 'selectedTemplate' | 'onTemplateChange'>) {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const isOwnProfile = user?.id === parseInt(userId);

  // Convert user profile social links to the expected format (handle double nesting)
  const socialLinksData = React.useMemo(() => {
    const profileSocialLinks = profile?.socialLinks?.socialLinks || profile?.socialLinks;
    if (!profileSocialLinks) return [];
    
    return Object.entries(profileSocialLinks).map(([platform, url], index) => ({
      id: index + 1,
      platform,
      username: String(url).split('/').pop() || '',
      url: String(url),
      displayName: platform.charAt(0).toUpperCase() + platform.slice(1),
      isVisible: true,
      sortOrder: index,
      clickCount: 0
    }));
  }, [profile?.socialLinks]);

  // Track profile view when component mounts (only for non-own profiles)
  const { mutate: trackView } = useMutation({
    mutationFn: async () => {
      if (!isOwnProfile) {
        await fetch(`/api/profile/view/${userId}`, {
          method: 'POST',
          credentials: 'include',
        });
      }
    },
    onSuccess: () => {
      // Silently track view - no user feedback needed
    },
  });

  // Track view on mount
  useEffect(() => {
    trackView();
  }, []);

  // Query to fetch current availability status from calendar
  const actualUserId = profile?.userId || profile?.id || userId;
  const { data: availabilityEntries = [] } = useQuery({
    queryKey: [`/api/availability/user/${actualUserId}`],
    enabled: !!actualUserId,
    queryFn: async () => {
      const response = await fetch(`/api/availability/user/${actualUserId}`, {
        credentials: 'include',
      });
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Function to determine current availability status from calendar entries
  const getCurrentAvailabilityStatus = () => {
    if (!availabilityEntries?.length) return profile?.availabilityStatus || 'available';
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Check if there's a current busy/unavailable entry for today
    const currentEntry = availabilityEntries.find((entry: any) => {
      const startDate = new Date(entry.startDate).toISOString().split('T')[0];
      const endDate = new Date(entry.endDate).toISOString().split('T')[0];
      return startDate <= todayStr && endDate >= todayStr;
    });
    
    if (currentEntry) {
      return currentEntry.status;
    }
    
    return profile?.availabilityStatus || 'available';
  };

  const currentAvailability = getCurrentAvailabilityStatus();

  // Get availability display properties
  const getAvailabilityDisplay = (status: string) => {
    switch (status) {
      case 'available':
        return { text: 'Available for work', color: 'bg-green-100 text-green-800', variant: 'default' as const };
      case 'busy':
        return { text: 'Currently busy', color: 'bg-yellow-100 text-yellow-800', variant: 'secondary' as const };
      case 'unavailable':
        return { text: 'Not available', color: 'bg-red-100 text-red-800', variant: 'destructive' as const };
      default:
        return { text: 'Available for work', color: 'bg-green-100 text-green-800', variant: 'default' as const };
    }
  };

  const availabilityDisplay = getAvailabilityDisplay(currentAvailability);

  const handleMediaClick = (index: number) => {
    setSelectedMediaIndex(index);
    setIsMediaModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Artistic Header with Asymmetric Layout */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 rounded-3xl transform rotate-1"></div>
        <Card className="relative bg-white rounded-3xl shadow-2xl transform -rotate-1 hover:rotate-0 transition-transform duration-500">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
                <Avatar className="w-32 h-32 relative z-10 ring-4 ring-white shadow-2xl">
                  <AvatarImage src={user?.profileImageUrl || user?.mainImageUrl || mediaFiles.find(m => m.category === 'headshot')?.url} />
                  <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-500 text-white text-2xl font-bold">
                    {profile?.displayName?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  {profile?.displayName}
                </h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                  <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">{profile?.role}</Badge>
                  <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">{profile?.talentType}</Badge>
                </div>
                <p className="text-gray-700 text-lg italic">{profile?.bio}</p>
                
                {profile?.languages && profile.languages.length > 0 && (
                  <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-2">
                    {profile.languages.slice(0, 5).map((lang: string, index: number) => (
                      <Badge key={index} variant="outline" className="border-pink-300 text-pink-700 hover:bg-pink-50">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Creative Media Mosaic */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6">
          {mediaFiles.slice(0, 2).map((media, index) => (
            <div 
              key={index} 
              className="group relative overflow-hidden rounded-2xl shadow-xl cursor-pointer"
              onClick={() => handleMediaClick(index)}
            >
              <img 
                src={media.url} 
                alt={media.title}
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 to-transparent">
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-white font-bold">{media.title}</h3>
                  <p className="text-pink-200">{media.category}</p>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="md:row-span-2">
          {mediaFiles[2] && (
            <div 
              className="group relative overflow-hidden rounded-2xl shadow-xl h-full cursor-pointer"
              onClick={() => handleMediaClick(2)}
            >
              <img 
                src={mediaFiles[2].url} 
                alt={mediaFiles[2].title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent">
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-white font-bold text-xl">{mediaFiles[2].title}</h3>
                  <p className="text-blue-200">{mediaFiles[2].category}</p>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          {mediaFiles.slice(3, 5).map((media, index) => (
            <div 
              key={index} 
              className="group relative overflow-hidden rounded-2xl shadow-xl cursor-pointer"
              onClick={() => handleMediaClick(index + 3)}
            >
              <img 
                src={media.url} 
                alt={media.title}
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-pink-900/80 to-transparent">
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-white font-bold">{media.title}</h3>
                  <p className="text-purple-200">{media.category}</p>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Artistic Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact & Rates */}
        <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 rounded-3xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Contact & Rates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile?.location && (
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                <MapPin className="w-5 h-5 text-pink-500" />
                <span className="font-medium">{profile.location}</span>
              </div>
            )}
            {profile?.phoneNumber && (
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                <Phone className="w-5 h-5 text-purple-500" />
                <span className="font-medium">{profile.phoneNumber}</span>
              </div>
            )}
            {profile?.website && (sharingSettings?.showSocialMedia !== false) && (
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                <Globe className="w-5 h-5 text-indigo-500" />
                <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                   className="font-medium text-indigo-600 hover:underline">{profile.website}</a>
              </div>
            )}
            {profile?.dailyRate && (
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                <DollarSign className="w-5 h-5 text-green-500" />
                <span className="font-bold text-green-600">${profile.dailyRate} / day</span>
              </div>
            )}
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
              <Clock className="w-5 h-5 text-orange-500" />
              <Badge variant={availabilityDisplay.variant} className={`${availabilityDisplay.color}`}>
                {availabilityDisplay.text}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Physical & Professional Details */}
        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-3xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Professional Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(profile?.height || profile?.weight) && (
              <div className="p-3 bg-white rounded-xl">
                <p className="text-sm text-gray-600 mb-2">Physical Stats:</p>
                <div className="flex gap-4">
                  {profile?.height && <span className="font-medium">{profile.height}</span>}
                  {profile?.weight && <span className="font-medium">{profile.weight}</span>}
                </div>
              </div>
            )}
            {(profile?.eyeColor && profile.eyeColor.length > 0) && (
              <div className="p-3 bg-white rounded-xl">
                <p className="text-sm text-gray-600 mb-2">Eye Color:</p>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(profile.eyeColor) ? profile.eyeColor : [profile.eyeColor]).map((color: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">{color}</Badge>
                  ))}
                </div>
              </div>
            )}
            {(profile?.hairColor && profile.hairColor.length > 0) && (
              <div className="p-3 bg-white rounded-xl">
                <p className="text-sm text-gray-600 mb-2">Hair Color:</p>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(profile.hairColor) ? profile.hairColor : [profile.hairColor]).map((color: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">{color}</Badge>
                  ))}
                </div>
              </div>
            )}
            {profile?.languages && profile.languages.length > 0 && (
              <div className="p-3 bg-white rounded-xl">
                <p className="text-sm text-gray-600 mb-2">Languages:</p>
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((lang: string, index: number) => (
                    <Badge key={index} className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-xs">{lang}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>



      {/* Social Media Links for Artistic Template */}
      {(sharingSettings?.showSocialMedia !== false) && socialLinksData && socialLinksData.length > 0 && (
        <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200 rounded-3xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              Connect With Me
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SocialMediaLinks socialLinks={socialLinksData} userId={parseInt(userId)} />
          </CardContent>
        </Card>
      )}

      {/* Media Modal */}
      <MediaModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        mediaItems={mediaFiles}
        currentIndex={selectedMediaIndex}
        onIndexChange={setSelectedMediaIndex}
      />
    </div>
  );
}

// Minimal Template - Clean and Focused
export function MinimalTemplate({ profile, mediaFiles, userId, user, sharingSettings }: Omit<ProfileTemplatesProps, 'selectedTemplate' | 'onTemplateChange'>) {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const isOwnProfile = user?.id === parseInt(userId);

  // Convert user profile social links to the expected format (handle double nesting)
  const socialLinksData = React.useMemo(() => {
    const profileSocialLinks = profile?.socialLinks?.socialLinks || profile?.socialLinks;
    if (!profileSocialLinks) return [];
    
    return Object.entries(profileSocialLinks).map(([platform, url], index) => ({
      id: index + 1,
      platform,
      username: String(url).split('/').pop() || '',
      url: String(url),
      displayName: platform.charAt(0).toUpperCase() + platform.slice(1),
      isVisible: true,
      sortOrder: index,
      clickCount: 0
    }));
  }, [profile?.socialLinks]);

  // Track profile view when component mounts (only for non-own profiles)
  const { mutate: trackView } = useMutation({
    mutationFn: async () => {
      if (!isOwnProfile) {
        await fetch(`/api/profile/view/${userId}`, {
          method: 'POST',
          credentials: 'include',
        });
      }
    },
    onSuccess: () => {
      // Silently track view - no user feedback needed
    },
  });

  // Track view on mount
  useEffect(() => {
    trackView();
  }, []);
  // Query to fetch current availability status from calendar
  const actualUserId = profile?.userId || profile?.id || userId;
  const { data: availabilityEntries = [] } = useQuery({
    queryKey: [`/api/availability/user/${actualUserId}`],
    enabled: !!actualUserId,
    queryFn: async () => {
      const response = await fetch(`/api/availability/user/${actualUserId}`, {
        credentials: 'include',
      });
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Function to determine current availability status from calendar entries
  const getCurrentAvailabilityStatus = () => {
    if (!availabilityEntries?.length) return profile?.availabilityStatus || 'available';
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Check if there's a current busy/unavailable entry for today
    const currentEntry = availabilityEntries.find((entry: any) => {
      const startDate = new Date(entry.startDate).toISOString().split('T')[0];
      const endDate = new Date(entry.endDate).toISOString().split('T')[0];
      return startDate <= todayStr && endDate >= todayStr;
    });
    
    if (currentEntry) {
      return currentEntry.status;
    }
    
    return profile?.availabilityStatus || 'available';
  };

  const currentAvailability = getCurrentAvailabilityStatus();

  // Get availability display properties
  const getAvailabilityDisplay = (status: string) => {
    switch (status) {
      case 'available':
        return { text: 'Available for work', color: 'text-green-600', variant: 'default' as const };
      case 'busy':
        return { text: 'Currently busy', color: 'text-yellow-600', variant: 'secondary' as const };
      case 'unavailable':
        return { text: 'Not available', color: 'text-red-600', variant: 'destructive' as const };
      default:
        return { text: 'Available for work', color: 'text-green-600', variant: 'default' as const };
    }
  };

  const availabilityDisplay = getAvailabilityDisplay(currentAvailability);

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-8">
      {/* Ultra Clean Header */}
      <div className="text-center space-y-6">
        <Avatar className="w-24 h-24 mx-auto">
          <AvatarImage src={user?.profileImageUrl || user?.mainImageUrl || mediaFiles.find(m => m.category === 'headshot')?.url} />
          <AvatarFallback className="bg-gray-900 text-white text-xl font-light">
            {profile?.displayName?.split(' ').map((n: string) => n[0]).join('') || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <h1 className="text-5xl font-light text-gray-900 mb-2">{profile?.displayName}</h1>
          <p className="text-xl text-gray-600 font-light">{profile?.talentType} • {profile?.location}</p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <p className="text-gray-700 text-lg leading-relaxed font-light">{profile?.bio}</p>
        </div>
        
        <div className="flex justify-center gap-4 pt-4">
          <Button 
            variant="ghost" 
            className="text-gray-900 hover:bg-gray-100 px-8"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleContact(profile);
            }}
          >
            Contact
          </Button>
          <Button 
            className="bg-gray-900 hover:bg-gray-800 text-white px-8"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleFollow(profile);
            }}
          >
            Follow
          </Button>
        </div>
      </div>

      {/* Minimal Stats */}
      <div className="grid grid-cols-3 gap-8 py-8 border-y border-gray-200">
        <div className="text-center">
          <div className="text-3xl font-light text-gray-900">${profile?.dailyRate}</div>
          <div className="text-sm text-gray-500 uppercase tracking-wide">Daily Rate</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-light text-gray-900">{profile?.languages?.length || 0}</div>
          <div className="text-sm text-gray-500 uppercase tracking-wide">Languages</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-light text-gray-900">{mediaFiles.length}</div>
          <div className="text-sm text-gray-500 uppercase tracking-wide">Portfolio</div>
        </div>
      </div>

      {/* Clean Media Grid */}
      <div className="space-y-8">
        <h2 className="text-2xl font-light text-gray-900 text-center">Portfolio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {mediaFiles.map((media, index) => (
            <div 
              key={index} 
              className="group cursor-pointer"
              onClick={() => {
                setSelectedMediaIndex(index);
                setIsMediaModalOpen(true);
              }}
            >
              <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
                <img 
                  src={media.url} 
                  alt={media.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {media.fileType?.startsWith('video') ? (
                      <Play className="w-6 h-6 text-gray-900" />
                    ) : media.fileType?.startsWith('audio') ? (
                      <Music className="w-6 h-6 text-gray-900" />
                    ) : (
                      <Eye className="w-6 h-6 text-gray-900" />
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-light text-gray-900">{media.title}</h3>
                <p className="text-sm text-gray-500">{media.category}</p>
              </div>
            </div>
          ))}
        </div>
        {mediaFiles.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Camera className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="font-light">No portfolio items yet</p>
          </div>
        )}
      </div>

      {/* Minimal Profile Details */}
      <div className="max-w-5xl mx-auto space-y-20 px-6">
        {/* Essential Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
          <div className="space-y-10">
            <div className="border-b border-gray-200 pb-10">
              <h3 className="text-3xl font-light text-gray-900 mb-8">Contact</h3>
              <div className="space-y-6">
                {profile?.phoneNumber && (
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600 font-light text-xl">Phone</span>
                    <span className="font-medium text-gray-900 text-lg">{profile.phoneNumber}</span>
                  </div>
                )}
                {profile?.website && (sharingSettings?.showSocialMedia !== false) && (
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600 font-light text-xl">Website</span>
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                       className="text-gray-900 hover:underline font-medium break-all max-w-xs text-right text-lg">{profile.website}</a>
                  </div>
                )}
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600 font-light text-xl">Status</span>
                  <span className={`font-medium text-lg ${availabilityDisplay.color}`}>
                    {availabilityDisplay.text}
                  </span>
                </div>
              </div>
            </div>

            {/* Social Media Links for Minimal Template - moved to left column */}
            {(sharingSettings?.showSocialMedia !== false) && socialLinksData && socialLinksData.length > 0 && (
              <div className="border-b border-gray-200 pb-10">
                <h3 className="text-3xl font-light text-gray-900 mb-8">Connect</h3>
                <div className="space-y-6">
                  <SocialMediaLinks socialLinks={socialLinksData} userId={parseInt(userId)} />
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-10">
            {(profile?.height || profile?.weight || profile?.eyeColor || profile?.hairColor) && (
              <div className="border-b border-gray-200 pb-10">
                <h3 className="text-3xl font-light text-gray-900 mb-8">Physical Details</h3>
                <div className="space-y-6">
                  {profile?.height && (
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-600 font-light text-xl">Height</span>
                      <span className="font-medium text-gray-900 text-lg">{profile.height}</span>
                    </div>
                  )}
                  {profile?.weight && (
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-600 font-light text-xl">Weight</span>
                      <span className="font-medium text-gray-900 text-lg">{profile.weight}</span>
                    </div>
                  )}
                  {profile?.eyeColor && profile.eyeColor.length > 0 && (
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-600 font-light text-xl">Eyes</span>
                      <span className="font-medium text-gray-900 text-lg">{Array.isArray(profile.eyeColor) ? profile.eyeColor.join(', ') : profile.eyeColor}</span>
                    </div>
                  )}
                  {profile?.hairColor && profile.hairColor.length > 0 && (
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-600 font-light text-xl">Hair</span>
                      <span className="font-medium text-gray-900 text-lg">{Array.isArray(profile.hairColor) ? profile.hairColor.join(', ') : profile.hairColor}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {profile?.languages && profile.languages.length > 0 && (
              <div className="border-b border-gray-200 pb-10">
                <h3 className="text-3xl font-light text-gray-900 mb-8">Languages</h3>
                <div className="space-y-4">
                  {profile.languages.map((lang: string, index: number) => (
                    <div key={index} className="text-gray-700 font-light text-xl py-2">• {lang}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Additional Rates */}
        {(profile?.weeklyRate || profile?.projectRate) && (
          <div className="border-t border-gray-200 pt-12">
            <h3 className="text-2xl font-light text-gray-900 mb-8 text-center">Additional Rates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-2xl mx-auto">
              {profile?.weeklyRate && (
                <div className="text-center py-6">
                  <div className="text-3xl font-light text-gray-900 mb-2">${profile.weeklyRate}</div>
                  <div className="text-base text-gray-500 uppercase tracking-wide">Weekly Rate</div>
                </div>
              )}
              {profile?.projectRate && (
                <div className="text-center py-6">
                  <div className="text-3xl font-light text-gray-900 mb-2">${profile.projectRate}</div>
                  <div className="text-base text-gray-500 uppercase tracking-wide">Project Rate</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Media Modal */}
      <MediaModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        mediaItems={mediaFiles}
        currentIndex={selectedMediaIndex}
        onIndexChange={setSelectedMediaIndex}
      />
    </div>
  );
}

// Cinematic Template - Dramatic and Bold
export function CinematicTemplate({ profile, mediaFiles, userId, user, sharingSettings }: Omit<ProfileTemplatesProps, 'selectedTemplate' | 'onTemplateChange'>) {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const isOwnProfile = user?.id === parseInt(userId);

  // Convert user profile social links to the expected format (handle double nesting)
  const socialLinksData = React.useMemo(() => {
    const profileSocialLinks = profile?.socialLinks?.socialLinks || profile?.socialLinks;
    if (!profileSocialLinks) return [];
    
    return Object.entries(profileSocialLinks).map(([platform, url], index) => ({
      id: index + 1,
      platform,
      username: String(url).split('/').pop() || '',
      url: String(url),
      displayName: platform.charAt(0).toUpperCase() + platform.slice(1),
      isVisible: true,
      sortOrder: index,
      clickCount: 0
    }));
  }, [profile?.socialLinks]);

  // Track profile view when component mounts (only for non-own profiles)
  const { mutate: trackView } = useMutation({
    mutationFn: async () => {
      if (!isOwnProfile) {
        await fetch(`/api/profile/view/${userId}`, {
          method: 'POST',
          credentials: 'include',
        });
      }
    },
    onSuccess: () => {
      // Silently track view - no user feedback needed
    },
  });

  // Track view on mount
  useEffect(() => {
    trackView();
  }, []);
  // Query to fetch current availability status from calendar
  const actualUserId = profile?.userId || profile?.id || userId;
  const { data: availabilityEntries = [] } = useQuery({
    queryKey: [`/api/availability/user/${actualUserId}`],
    enabled: !!actualUserId,
    queryFn: async () => {
      const response = await fetch(`/api/availability/user/${actualUserId}`, {
        credentials: 'include',
      });
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Function to determine current availability status from calendar entries
  const getCurrentAvailabilityStatus = () => {
    if (!availabilityEntries?.length) return profile?.availabilityStatus || 'available';
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Check if there's a current busy/unavailable entry for today
    const currentEntry = availabilityEntries.find((entry: any) => {
      const startDate = new Date(entry.startDate).toISOString().split('T')[0];
      const endDate = new Date(entry.endDate).toISOString().split('T')[0];
      return startDate <= todayStr && endDate >= todayStr;
    });
    
    if (currentEntry) {
      return currentEntry.status;
    }
    
    return profile?.availabilityStatus || 'available';
  };

  const currentAvailability = getCurrentAvailabilityStatus();

  // Get availability display properties
  const getAvailabilityDisplay = (status: string) => {
    switch (status) {
      case 'available':
        return { text: 'Available for work', color: 'bg-green-600', variant: 'default' as const };
      case 'busy':
        return { text: 'Currently busy', color: 'bg-yellow-600', variant: 'secondary' as const };
      case 'unavailable':
        return { text: 'Not available', color: 'bg-red-600', variant: 'destructive' as const };
      default:
        return { text: 'Available for work', color: 'bg-green-600', variant: 'default' as const };
    }
  };

  const availabilityDisplay = getAvailabilityDisplay(currentAvailability);

  return (
    <div className="max-w-full mx-auto">
      {/* Full-width Cinematic Header */}
      <div className="relative h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black">
          {mediaFiles[0] && (
            <img 
              src={mediaFiles[0].url} 
              alt="Hero background"
              className="w-full h-full object-cover opacity-40" 
            />
          )}
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl px-8">
            <Avatar className="w-32 h-32 mx-auto mb-8 ring-4 ring-yellow-400">
              <AvatarImage src={user?.profileImageUrl || user?.mainImageUrl || mediaFiles.find(m => m.category === 'headshot')?.url} />
              <AvatarFallback className="bg-yellow-500 text-black text-3xl font-bold">
                {profile?.displayName?.split(' ').map((n: string) => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <h1 className="text-7xl font-bold mb-6 tracking-wide">
              {profile?.displayName?.toUpperCase()}
            </h1>
            
            <div className="flex justify-center gap-4 mb-8">
              <Badge className="bg-yellow-500 text-black text-lg px-6 py-2">{profile?.role}</Badge>
              <Badge className="bg-white text-black text-lg px-6 py-2">{profile?.talentType}</Badge>
            </div>
            
            <p className="text-2xl mb-12 font-light opacity-90">{profile?.bio}</p>
            
            <div className="flex justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-yellow-500 text-black hover:bg-yellow-400 px-12 py-4 text-lg"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleContact(profile);
                }}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Contact
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-black px-12 py-4 text-lg"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFollow(profile);
                }}
              >
                <Star className="w-5 h-5 mr-2" />
                Follow
              </Button>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="animate-bounce">
            <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-black text-white">
        <div className="max-w-7xl mx-auto py-12 px-8">
          <div className="border-y border-gray-800 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-yellow-400">${profile?.dailyRate}</div>
                <div className="text-gray-400 uppercase tracking-wide">Daily Rate</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-yellow-400">{profile?.profileViews || 0}</div>
                <div className="text-gray-400 uppercase tracking-wide">Profile Views</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-yellow-400">{profile?.languages?.length || 0}</div>
                <div className="text-gray-400 uppercase tracking-wide">Languages</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-yellow-400">{mediaFiles.length}</div>
                <div className="text-gray-400 uppercase tracking-wide">Media Files</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cinematic Content Sections */}
      <div className="max-w-7xl mx-auto px-8 space-y-16 py-16">
        {/* Stats & Contact */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <Card className="bg-black/80 border-yellow-500 border-2 text-white">
            <CardContent className="p-6 text-center">
              <DollarSign className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-500">${profile?.dailyRate}</div>
              <div className="text-sm text-gray-300">DAILY RATE</div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/80 border-white border-2 text-white">
            <CardContent className="p-6 text-center">
              <MapPin className="w-8 h-8 text-white mx-auto mb-2" />
              <div className="text-lg font-bold">{profile?.location}</div>
              <div className="text-sm text-gray-300">LOCATION</div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/80 border-yellow-500 border-2 text-white">
            <CardContent className="p-6 text-center">
              <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-500">{profile?.languages?.length || 0}</div>
              <div className="text-sm text-gray-300">LANGUAGES</div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/80 border-white border-2 text-white">
            <CardContent className="p-6 text-center">
              <Film className="w-8 h-8 text-white mx-auto mb-2" />
              <div className="text-lg font-bold">{mediaFiles.length}</div>
              <div className="text-sm text-gray-300">PORTFOLIO</div>
            </CardContent>
          </Card>
        </div>

        {/* Professional Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact & Availability */}
          <Card className="bg-gradient-to-br from-gray-900 to-black border-yellow-500 border-2">
            <CardHeader>
              <CardTitle className="text-2xl text-yellow-500 font-bold tracking-wide">
                CONTACT & AVAILABILITY
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-white">
              {profile?.phoneNumber && (
                <div className="flex items-center gap-4 p-4 bg-black/40 rounded-lg border border-yellow-500/20">
                  <Phone className="w-6 h-6 text-yellow-500" />
                  <span className="text-lg font-medium">{profile.phoneNumber}</span>
                </div>
              )}
              {profile?.website && (sharingSettings?.showSocialMedia !== false) && (
                <div className="flex items-center gap-4 p-4 bg-black/40 rounded-lg border border-yellow-500/20">
                  <Globe className="w-6 h-6 text-yellow-500" />
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                     className="text-lg font-medium text-yellow-400 hover:text-yellow-300">{profile.website}</a>
                </div>
              )}
              <div className="flex items-center gap-4 p-4 bg-black/40 rounded-lg border border-yellow-500/20">
                <Clock className="w-6 h-6 text-yellow-500" />
                <Badge className={`text-lg px-4 py-2 ${availabilityDisplay.color} text-white`}>
                  {availabilityDisplay.text.toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Physical Details */}
          <Card className="bg-gradient-to-br from-gray-900 to-black border-white border-2">
            <CardHeader>
              <CardTitle className="text-2xl text-white font-bold tracking-wide">
                PROFESSIONAL SPECS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-white">
              {(profile?.height || profile?.weight) && (
                <div className="p-4 bg-black/40 rounded-lg border border-white/20">
                  <h4 className="text-yellow-500 font-bold mb-3">PHYSICAL</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {profile?.height && <span className="font-medium">{profile.height}</span>}
                    {profile?.weight && <span className="font-medium">{profile.weight}</span>}
                  </div>
                </div>
              )}
              
              {(profile?.eyeColor && profile.eyeColor.length > 0) && (
                <div className="p-4 bg-black/40 rounded-lg border border-white/20">
                  <h4 className="text-yellow-500 font-bold mb-3">FEATURES</h4>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <span className="text-gray-300">Eyes:</span>
                      {(Array.isArray(profile.eyeColor) ? profile.eyeColor : [profile.eyeColor]).map((color: string, index: number) => (
                        <Badge key={index} className="bg-yellow-500/20 text-yellow-200 text-sm">{color}</Badge>
                      ))}
                    </div>
                    {(profile?.hairColor && profile.hairColor.length > 0) && (
                      <div className="flex gap-2">
                        <span className="text-gray-300">Hair:</span>
                        {(Array.isArray(profile.hairColor) ? profile.hairColor : [profile.hairColor]).map((color: string, index: number) => (
                          <Badge key={index} className="bg-white/20 text-white text-sm">{color}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {profile?.languages && profile.languages.length > 0 && (
                <div className="p-4 bg-black/40 rounded-lg border border-white/20">
                  <h4 className="text-yellow-500 font-bold mb-3">LANGUAGES</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.languages.map((lang: string, index: number) => (
                      <Badge key={index} className="bg-yellow-500 text-black font-bold text-sm">{lang}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>



        {/* Social Media Links for Cinematic Template */}
        {(sharingSettings?.showSocialMedia !== false) && socialLinksData && socialLinksData.length > 0 && (
          <Card className="bg-gradient-to-r from-black to-gray-900 border-yellow-500 border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-yellow-500 font-bold tracking-wider">
                CONNECT
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SocialMediaLinks socialLinks={socialLinksData} userId={parseInt(userId)} />
            </CardContent>
          </Card>
        )}

        {/* Cinematic Media Gallery */}
        <Card className="bg-black border-yellow-500 border-2 overflow-hidden">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl text-yellow-500 font-bold tracking-wider">
              FEATURED WORK
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mediaFiles.map((media, index) => (
                <div 
                  key={index} 
                  className="group relative overflow-hidden rounded-lg border-2 border-yellow-500/50 hover:border-yellow-500 transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedMediaIndex(index);
                    setIsMediaModalOpen(true);
                  }}
                >
                  <img 
                    src={media.url} 
                    alt={media.title}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-4 left-4">
                      <h3 className="text-white font-bold text-xl">{media.title}</h3>
                      <p className="text-yellow-400 font-medium">{media.category}</p>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                    {media.fileType?.startsWith('video') ? (
                      <Play className="w-6 h-6 text-yellow-500" />
                    ) : media.fileType?.startsWith('audio') ? (
                      <Music className="w-6 h-6 text-yellow-500" />
                    ) : (
                      <Eye className="w-6 h-6 text-yellow-500" />
                    )}
                  </div>
                </div>
              ))}
              {mediaFiles.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <Film className="w-20 h-20 mx-auto mb-6 text-yellow-500/50" />
                  <p className="text-white/50 text-xl font-light">No featured work uploaded yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Media Modal */}
      <MediaModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        mediaItems={mediaFiles}
        currentIndex={selectedMediaIndex}
        onIndexChange={setSelectedMediaIndex}
      />
    </div>
  );
}