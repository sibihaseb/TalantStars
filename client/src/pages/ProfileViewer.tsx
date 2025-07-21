import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SkillEndorsements } from "@/components/talent/SkillEndorsements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Phone, 
  Globe, 
  Star, 
  CheckCircle, 
  MessageCircle,
  DollarSign,
  Clock,
  Play,
  Image,
  Music,
  Video,
  Award,
  Users,
  Calendar,
  Heart,
  Share2,
  Download,
  Eye,
  Camera,
  Film
} from "lucide-react";

export default function ProfileViewer() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  
  console.log("ProfileViewer - userId from params:", userId);
  
  // Fetch profile data for the specific user
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['/api/talent', userId],
    enabled: !!userId,
  });

  // Fetch media files for the user
  const { data: mediaFiles = [] } = useQuery({
    queryKey: ['/api/media', userId],
    enabled: !!userId,
  });
  
  console.log("ProfileViewer - profile data:", profile);
  console.log("ProfileViewer - media files:", mediaFiles);
  console.log("ProfileViewer - isLoading:", isLoading);
  console.log("ProfileViewer - error:", error);

  if (isLoading) {
    return (
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          </main>
          <Footer />
        </div>
      </ThemeProvider>
    );
  }

  if (!profile) {
    return (
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Not Found</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                The profile you're looking for doesn't exist or has been removed.
              </p>
            </div>
          </main>
          <Footer />
        </div>
      </ThemeProvider>
    );
  }

  const isOwnProfile = user?.id === parseInt(userId);

  // Helper function to get media by category
  const getMediaByCategory = (category: string) => {
    return mediaFiles.filter((media: any) => media.category === category);
  };

  // Create sample media data for demonstration
  const sampleMedia = [
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1594736797933-d0e501ba2fe1?w=800&h=600&fit=crop",
      mediaType: "image",
      category: "headshot",
      title: "Professional Headshot",
      description: "Professional headshot for casting calls"
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
      mediaType: "image", 
      category: "portfolio",
      title: "Character Study",
      description: "Character work from latest production"
    },
    {
      id: 3,
      url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=600&fit=crop",
      mediaType: "image",
      category: "portfolio", 
      title: "Stage Performance",
      description: "Live performance at Lincoln Center"
    },
    {
      id: 4,
      externalUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      mediaType: "video",
      category: "demo",
      title: "Acting Demo Reel",
      description: "2024 professional demo reel showcasing range"
    }
  ];

  const displayMedia = mediaFiles.length > 0 ? mediaFiles : sampleMedia;

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Hero Profile Header with Media Background */}
            <Card className="overflow-hidden border-0 shadow-2xl">
              <div className="relative h-80 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                {/* Background Media */}
                {displayMedia.find((m: any) => m.category === 'portfolio') && (
                  <div className="absolute inset-0">
                    <img 
                      src={displayMedia.find((m: any) => m.category === 'portfolio')?.url}
                      alt="Background"
                      className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  </div>
                )}
                
                {/* Profile Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex flex-col md:flex-row items-end space-y-4 md:space-y-0 md:space-x-8">
                    {/* Profile Avatar */}
                    <div className="relative">
                      <Avatar className="w-40 h-40 border-4 border-white shadow-2xl">
                        <AvatarImage 
                          src={displayMedia.find((m: any) => m.category === 'headshot')?.url} 
                        />
                        <AvatarFallback className="text-white text-3xl font-bold bg-gradient-to-br from-blue-500 to-purple-600">
                          {profile?.displayName?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {profile?.isVerified && (
                        <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-2">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                    
                    {/* Profile Details */}
                    <div className="flex-1 text-white">
                      <div className="flex items-center space-x-3 mb-2">
                        <h1 className="text-4xl font-bold">
                          {profile?.displayName}
                        </h1>
                        {profile?.isFeatured && (
                          <Star className="w-8 h-8 text-yellow-400 fill-current" />
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-1">
                          {profile?.role}
                        </Badge>
                        {profile?.talentType && profile?.talentType !== 'profile' && (
                          <Badge variant="outline" className="border-white/50 text-white bg-white/10 text-lg px-4 py-1">
                            {profile?.talentType}
                          </Badge>
                        )}
                        <Badge className="bg-green-500/80 text-white border-0 text-lg px-4 py-1">
                          {profile?.availabilityStatus}
                        </Badge>
                      </div>
                      
                      <p className="text-xl leading-relaxed max-w-3xl opacity-90">
                        {profile?.bio || "Professional talent ready for your next project"}
                      </p>
                      
                      <div className="flex items-center space-x-6 mt-4 text-white/80">
                        {profile?.location && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-5 h-5" />
                            <span>{profile?.location}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <Eye className="w-5 h-5" />
                          <span>{profile?.profileViews || 0} views</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-3">
                      <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg">
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Contact
                      </Button>
                      <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                        <Heart className="w-5 h-5 mr-2" />
                        Follow
                      </Button>
                      <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                        <Share2 className="w-5 h-5 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Quick Info */}
              <div className="space-y-6">
                {/* Rates Card */}
                {(profile?.dailyRate || profile?.weeklyRate || profile?.projectRate) && (
                  <Card className="shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2 text-lg">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <span>Rates</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {profile?.dailyRate && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Daily</span>
                          <span className="font-bold text-green-600 text-lg">${profile?.dailyRate}</span>
                        </div>
                      )}
                      {profile?.weeklyRate && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Weekly</span>
                          <span className="font-bold text-green-600 text-lg">${profile?.weeklyRate}</span>
                        </div>
                      )}
                      {profile?.projectRate && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Project</span>
                          <span className="font-bold text-green-600 text-lg">${profile?.projectRate}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Contact Info */}
                <Card className="shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Contact Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile?.phoneNumber && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-green-600" />
                        <span className="text-gray-700">{profile?.phoneNumber}</span>
                      </div>
                    )}
                    {profile?.website && (
                      <div className="flex items-center space-x-3">
                        <Globe className="w-5 h-5 text-blue-600" />
                        <a href={profile?.website} target="_blank" rel="noopener noreferrer" 
                           className="text-blue-600 hover:underline">
                          Visit Website
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Skills */}
                {profile?.skills && profile?.skills?.length > 0 && (
                  <Card className="shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2 text-lg">
                        <Award className="w-5 h-5 text-purple-600" />
                        <span>Skills & Expertise</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {profile?.skills?.map((skill: any, index: any) => (
                          <Badge key={index} variant="secondary" className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200 hover:from-blue-100 hover:to-purple-100 transition-colors">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Media Portfolio */}
              <div className="lg:col-span-2">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-xl">
                      <Camera className="w-6 h-6 text-purple-600" />
                      <span>Portfolio & Media</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="all" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="all">All Media</TabsTrigger>
                        <TabsTrigger value="images">Photos</TabsTrigger>
                        <TabsTrigger value="videos">Videos</TabsTrigger>
                        <TabsTrigger value="headshots">Headshots</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="all" className="mt-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {displayMedia.map((media: any, index: number) => (
                            <div 
                              key={index}
                              className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer hover:shadow-xl transition-all duration-300"
                              onClick={() => setSelectedMedia(media)}
                            >
                              <img 
                                src={media.url || "https://images.unsplash.com/photo-1533584595016-84b0be18b738?w=400&h=400&fit=crop"} 
                                alt={media.title || `Media ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  {media.mediaType === 'video' ? (
                                    <Play className="w-12 h-12 text-white" />
                                  ) : (
                                    <Eye className="w-12 h-12 text-white" />
                                  )}
                                </div>
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                                <h4 className="text-white font-semibold text-sm">{media.title}</h4>
                                <p className="text-white/80 text-xs">{media.category}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="images" className="mt-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {displayMedia.filter((m: any) => m.mediaType === 'image').map((media: any, index: number) => (
                            <div 
                              key={index}
                              className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer hover:shadow-xl transition-all duration-300"
                              onClick={() => setSelectedMedia(media)}
                            >
                              <img 
                                src={media.url} 
                                alt={media.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                                <Eye className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="videos" className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {displayMedia.filter((m: any) => m.mediaType === 'video').map((media: any, index: number) => (
                            <div key={index} className="group relative aspect-video overflow-hidden rounded-lg bg-black">
                              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <div className="text-center text-white">
                                  <Video className="w-16 h-16 mx-auto mb-4" />
                                  <h3 className="text-xl font-bold mb-2">{media.title}</h3>
                                  <p className="text-blue-100">{media.description}</p>
                                  <Button className="mt-4 bg-white text-blue-600 hover:bg-gray-100">
                                    <Play className="w-4 h-4 mr-2" />
                                    Watch Demo
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="headshots" className="mt-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {displayMedia.filter((m: any) => m.category === 'headshot').map((media: any, index: number) => (
                            <div 
                              key={index}
                              className="group relative aspect-portrait overflow-hidden rounded-lg cursor-pointer hover:shadow-xl transition-all duration-300"
                              onClick={() => setSelectedMedia(media)}
                            >
                              <img 
                                src={media.url} 
                                alt={media.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                                <Eye className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Skill Endorsements */}
            {userId && (
              <SkillEndorsements 
                userId={userId} 
                isOwnProfile={isOwnProfile} 
              />
            )}
          </div>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}