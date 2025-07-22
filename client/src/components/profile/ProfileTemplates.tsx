import { useState } from "react";
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

export type ProfileTemplate = 'classic' | 'modern' | 'artistic' | 'minimal' | 'cinematic';

interface ProfileTemplatesProps {
  profile: any;
  mediaFiles: any[];
  userId: string;
  user: any;
  selectedTemplate: ProfileTemplate;
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

// Classic Template - Professional and Timeless
export function ClassicTemplate({ profile, mediaFiles, userId, user }: Omit<ProfileTemplatesProps, 'selectedTemplate' | 'onTemplateChange'>) {
  const isOwnProfile = user?.id === parseInt(userId);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  const handleMediaClick = (index: number) => {
    setSelectedMediaIndex(index);
    setIsMediaModalOpen(true);
  };
  
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Traditional Header */}
      <Card className="bg-white shadow-lg">
        <div 
          className="h-32 bg-gradient-to-r from-blue-600 to-blue-800"
          style={{
            backgroundImage: user?.heroImageUrl ? `linear-gradient(rgba(59, 130, 246, 0.7), rgba(30, 64, 175, 0.7)), url(${user.heroImageUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
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
              
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                <Badge className="bg-blue-100 text-blue-800">{profile?.role}</Badge>
                {profile?.talentType && <Badge variant="outline">{profile?.talentType}</Badge>}
              </div>
              
              <p className="text-gray-600 max-w-2xl">{profile?.bio}</p>
            </div>
            
            <div className="flex gap-2">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact
              </Button>
              <Button variant="outline">
                <Star className="w-4 h-4 mr-2" />
                Follow
              </Button>
            </div>
          </div>
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
            </CardContent>
          </Card>
          
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
          
          {/* Skills Section */}
          {profile?.skills && profile.skills.length > 0 && (
            <Card className="mt-6">
              <CardHeader><CardTitle>Skills & Endorsements</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profile.skills.map((skill: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <Badge variant="secondary" className="text-sm">{skill}</Badge>
                      <SkillEndorsement 
                        skill={skill}
                        userId={parseInt(userId)}
                        currentUser={user}
                        endorsements={[]} // This would come from API in real implementation
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
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
export function ModernTemplate({ profile, mediaFiles, userId, user }: Omit<ProfileTemplatesProps, 'selectedTemplate' | 'onTemplateChange'>) {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero Section with Glass Morphism */}
      <div className="relative h-96 overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-end gap-6">
              <Avatar className="w-24 h-24 ring-4 ring-white/50">
                <AvatarImage src={mediaFiles.find(m => m.category === 'headshot')?.url} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xl font-bold">
                  {profile?.displayName?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-white">
                <h1 className="text-4xl font-bold mb-2">{profile?.displayName}</h1>
                <div className="flex gap-2 mb-3">
                  <Badge className="bg-white/20 text-white border-0">{profile?.role}</Badge>
                  <Badge className="bg-gradient-to-r from-pink-500 to-orange-500 text-white border-0">{profile?.talentType}</Badge>
                </div>
                <p className="text-lg opacity-90">{profile?.bio}</p>
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
            <div className="text-2xl font-bold text-purple-600">{profile?.skills?.length || 0}</div>
            <div className="text-sm text-gray-500">Skills</div>
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

      {/* Modern Media Grid */}
      <Card className="border-0 shadow-2xl overflow-hidden">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mediaFiles.map((media, index) => (
              <div key={index} className="group relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
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
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Artistic Template - Creative and Expressive
export function ArtisticTemplate({ profile, mediaFiles, userId, user }: Omit<ProfileTemplatesProps, 'selectedTemplate' | 'onTemplateChange'>) {
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
                  <AvatarImage src={mediaFiles.find(m => m.category === 'headshot')?.url} />
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
                
                <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-2">
                  {profile?.skills?.slice(0, 5).map((skill: string, index: number) => (
                    <Badge key={index} variant="outline" className="border-pink-300 text-pink-700 hover:bg-pink-50">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Creative Media Mosaic */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6">
          {mediaFiles.slice(0, 2).map((media, index) => (
            <div key={index} className="group relative overflow-hidden rounded-2xl shadow-xl">
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
              </div>
            </div>
          ))}
        </div>
        
        <div className="md:row-span-2">
          {mediaFiles[2] && (
            <div className="group relative overflow-hidden rounded-2xl shadow-xl h-full">
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
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          {mediaFiles.slice(3, 5).map((media, index) => (
            <div key={index} className="group relative overflow-hidden rounded-2xl shadow-xl">
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Minimal Template - Clean and Focused
export function MinimalTemplate({ profile, mediaFiles, userId, user }: Omit<ProfileTemplatesProps, 'selectedTemplate' | 'onTemplateChange'>) {
  return (
    <div className="max-w-5xl mx-auto space-y-12 py-8">
      {/* Ultra Clean Header */}
      <div className="text-center space-y-6">
        <Avatar className="w-24 h-24 mx-auto">
          <AvatarImage src={mediaFiles.find(m => m.category === 'headshot')?.url} />
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
        
        <div className="flex justify-center gap-8 pt-4">
          <Button variant="ghost" className="text-gray-900 hover:bg-gray-100 px-8">Contact</Button>
          <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8">Follow</Button>
        </div>
      </div>

      {/* Minimal Stats */}
      <div className="grid grid-cols-3 gap-8 py-8 border-y border-gray-200">
        <div className="text-center">
          <div className="text-3xl font-light text-gray-900">${profile?.dailyRate}</div>
          <div className="text-sm text-gray-500 uppercase tracking-wide">Daily Rate</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-light text-gray-900">{profile?.skills?.length || 0}</div>
          <div className="text-sm text-gray-500 uppercase tracking-wide">Skills</div>
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
            <div key={index} className="group">
              <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                <img 
                  src={media.url} 
                  alt={media.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-light text-gray-900">{media.title}</h3>
                <p className="text-sm text-gray-500">{media.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Cinematic Template - Dramatic and Bold
export function CinematicTemplate({ profile, mediaFiles, userId, user }: Omit<ProfileTemplatesProps, 'selectedTemplate' | 'onTemplateChange'>) {
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
              <AvatarImage src={mediaFiles.find(m => m.category === 'headshot')?.url} />
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
            
            <div className="flex justify-center gap-6">
              <Button size="lg" className="bg-yellow-500 text-black hover:bg-yellow-400 px-12 py-4 text-lg">
                <Film className="w-5 h-5 mr-2" />
                View Reel
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black px-12 py-4 text-lg">
                <MessageCircle className="w-5 h-5 mr-2" />
                Get in Touch
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

      {/* Cinematic Content Sections */}
      <div className="bg-black text-white">
        <div className="max-w-7xl mx-auto py-20 px-8">
          {/* Featured Work */}
          <div className="mb-20">
            <h2 className="text-5xl font-bold mb-12 text-center">Featured Work</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mediaFiles.map((media, index) => (
                <div key={index} className="group relative">
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={media.url} 
                      alt={media.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="text-center">
                      <Play className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold">{media.title}</h3>
                      <p className="text-yellow-400">{media.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Stats Bar */}
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
                <div className="text-4xl font-bold text-yellow-400">{profile?.skills?.length || 0}</div>
                <div className="text-gray-400 uppercase tracking-wide">Skills</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-yellow-400">{mediaFiles.length}</div>
                <div className="text-gray-400 uppercase tracking-wide">Media Files</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}