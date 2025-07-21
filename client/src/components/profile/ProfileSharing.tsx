import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { 
  TemplateSelector,
  type ProfileTemplate 
} from '@/components/profile/ProfileTemplates';
import ProfileImageUpload from '@/components/ProfileImageUpload';
import { SocialMediaManager } from '@/components/SocialMediaManager';
import { 
  Copy, 
  Share, 
  Link, 
  Facebook, 
  Twitter, 
  Mail, 
  MessageCircle, 
  Eye,
  EyeOff,
  Edit2,
  Check,
  X,
  ArrowLeft,
  Palette,
  Settings,
  Image,
  User,
  Shield
} from "lucide-react";

interface ProfileSharingSettings {
  customUrl?: string;
  isPublic: boolean;
  allowDirectMessages: boolean;
  showContactInfo: boolean;
  showSocialLinks: boolean;
  showMediaGallery: boolean;
  allowNonAccountHolders: boolean;
  completelyPrivate: boolean;
  shareableFields: string[];
  profileViews: number;
  lastShared?: string;
  showSocialMedia?: boolean;
  showExperience?: boolean;
  showSkills?: boolean;
}

export default function ProfileSharing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [newCustomUrl, setNewCustomUrl] = useState("");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ProfileTemplate>('modern');
  const [activeTab, setActiveTab] = useState<'sharing' | 'appearance' | 'templates' | 'settings'>('sharing');

  // Fetch current profile sharing settings
  const { data: sharingSettings, isLoading, error } = useQuery<ProfileSharingSettings>({
    queryKey: ['/api/profile/sharing'],
    enabled: !!user,
    queryFn: async () => {
      const response = await fetch('/api/profile/sharing', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    // Provide default values if API fails
    placeholderData: {
      isPublic: true,
      allowDirectMessages: true,
      showContactInfo: true,
      showSocialLinks: true,
      showMediaGallery: true,
      allowNonAccountHolders: false,
      completelyPrivate: false,
      shareableFields: ['name', 'bio', 'skills', 'experience'],
      profileViews: 0
    }
  });

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const profileUrl = sharingSettings?.customUrl 
    ? `${baseUrl}/profile/${sharingSettings.customUrl}`
    : `${baseUrl}/profile/${user?.username || user?.id}`;

  const userTier = user?.pricingTierId || 1;

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(type);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the URL manually",
        variant: "destructive",
      });
    }
  };

  const shareProfile = (platform: string, url: string) => {
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=Check out my profile!`,
      email: `mailto:?subject=Check out my profile&body=${encodeURIComponent(url)}`,
      sms: `sms:?body=Check out my profile: ${encodeURIComponent(url)}`
    } as const;

    if (platform in shareUrls) {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
    }
  };

  const updateCustomUrlMutation = useMutation({
    mutationFn: async (customUrl: string) => {
      const response = await apiRequest('PUT', '/api/profile/sharing', { customUrl });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile/sharing'] });
      setIsEditingUrl(false);
      setNewCustomUrl("");
      toast({
        title: "Success!",
        description: "Custom URL updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update custom URL",
        variant: "destructive",
      });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<ProfileSharingSettings>) => {
      const response = await apiRequest('PUT', '/api/profile/sharing', settings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile/sharing'] });
      toast({
        title: "Settings updated",
        description: "Your privacy settings have been saved",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const handleCustomUrlUpdate = () => {
    if (newCustomUrl.trim()) {
      updateCustomUrlMutation.mutate(newCustomUrl.trim());
    }
  };

  const handleSettingChange = (key: keyof ProfileSharingSettings, value: boolean) => {
    updateSettingsMutation.mutate({ [key]: value });
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setLocation('/dashboard')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
          <Share className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Settings & Sharing</h1>
          <p className="text-gray-600">Manage your profile appearance and sharing settings</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        <button
          onClick={() => setActiveTab('sharing')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'sharing' 
              ? 'bg-white shadow-sm text-blue-600' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Share className="w-4 h-4 inline mr-2" />
          Profile Sharing
        </button>
        <button
          onClick={() => setActiveTab('appearance')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'appearance' 
              ? 'bg-white shadow-sm text-blue-600' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Palette className="w-4 h-4 inline mr-2" />
          Appearance
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'templates' 
              ? 'bg-white shadow-sm text-blue-600' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Palette className="w-4 h-4 inline mr-2" />
          Template Selection
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'settings' 
              ? 'bg-white shadow-sm text-blue-600' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Shield className="w-4 h-4 inline mr-2" />
          Privacy Settings
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'sharing' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Profile URL */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Your Profile URL
              </CardTitle>
              <CardDescription>
                Share this link to let others view your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  value={profileUrl}
                  readOnly
                  className="flex-1"
                />
                <Button 
                  onClick={() => copyToClipboard(profileUrl, "Profile URL")}
                  variant="outline"
                  size="sm"
                >
                  {copiedUrl === "Profile URL" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              {/* Custom URL Section */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Custom URL</Label>
                {isEditingUrl ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{baseUrl}/profile/</span>
                    <Input
                      value={newCustomUrl}
                      onChange={(e) => setNewCustomUrl(e.target.value)}
                      placeholder="your-custom-url"
                      className="flex-1"
                    />
                    <Button
                      onClick={handleCustomUrlUpdate}
                      size="sm"
                      disabled={updateCustomUrlMutation.isPending}
                    >
                      {updateCustomUrlMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditingUrl(false);
                        setNewCustomUrl("");
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{baseUrl}/profile/</span>
                    <span className="font-medium">
                      {sharingSettings?.customUrl || user?.username || user?.id}
                    </span>
                    <Button
                      onClick={() => {
                        setIsEditingUrl(true);
                        setNewCustomUrl(sharingSettings?.customUrl || user?.username || "");
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Share Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-4">
                <Button
                  onClick={() => window.open(`${profileUrl}?template=${selectedTemplate}`, '_blank')}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                <Button
                  onClick={() => shareProfile('facebook', profileUrl)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Facebook className="h-4 w-4" />
                  Facebook
                </Button>
                <Button
                  onClick={() => shareProfile('twitter', profileUrl)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Twitter className="h-4 w-4" />
                  Twitter
                </Button>
                <Button
                  onClick={() => shareProfile('email', profileUrl)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Profile Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Profile Analytics
              </CardTitle>
              <CardDescription>
                Track your profile performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Profile Views</span>
                  <Badge variant="secondary">{sharingSettings?.profileViews || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Shared</span>
                  <span className="text-sm">{sharingSettings?.lastShared || 'Never'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Profile Status</span>
                  <Badge variant={sharingSettings?.isPublic ? "default" : "secondary"}>
                    {sharingSettings?.isPublic ? "Public" : "Private"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'appearance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Profile Images */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Image
                </CardTitle>
                <CardDescription>
                  Upload your main profile photo (1:1 ratio)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileImageUpload
                  currentImage={user?.profileImageUrl || undefined}
                  onImageUpdate={(url) => {
                    queryClient.invalidateQueries({ queryKey: ['/api/user'] });
                  }}
                  mandatory={false}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Background Image
                </CardTitle>
                <CardDescription>
                  Upload a hero background image (16:9 ratio)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileImageUpload
                  currentImage={user?.heroImageUrl || undefined}
                  onImageUpdate={(url) => {
                    queryClient.invalidateQueries({ queryKey: ['/api/user'] });
                  }}
                  mandatory={false}
                  aspectRatio={16/9}
                  uploadEndpoint="/api/user/hero-image"
                  fieldName="heroImage"
                />
              </CardContent>
            </Card>


          </div>

          {/* Right Column - Profile Customization */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Display Options
              </CardTitle>
              <CardDescription>
                Customize how your profile information is displayed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Show Social Media Icons</Label>
                  <p className="text-xs text-gray-500">Display social media links on your profile</p>
                </div>
                <Switch
                  checked={sharingSettings?.showSocialMedia || false}
                  onCheckedChange={(checked) => {
                    console.log('🔄 Social media toggle clicked:', checked);
                    handleSettingChange('showSocialMedia', checked);
                  }}
                />
              </div>
              
              {/* Social Media Manager - Show when enabled */}
              {sharingSettings?.showSocialMedia && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-base">Social Media Links</CardTitle>
                    <CardDescription>
                      Manage your social media profiles that will be displayed on your public profile
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SocialMediaManager />
                  </CardContent>
                </Card>
              )}
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Show Experience Timeline</Label>
                  <p className="text-xs text-gray-500">Display your work history timeline</p>
                </div>
                <Switch
                  checked={sharingSettings?.showExperience || true}
                  onCheckedChange={(checked) => handleSettingChange('showExperience', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Show Skills Section</Label>
                  <p className="text-xs text-gray-500">Display your professional skills</p>
                </div>
                <Switch
                  checked={sharingSettings?.showSkills || true}
                  onCheckedChange={(checked) => handleSettingChange('showSkills', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Profile Template Selection
              </CardTitle>
              <CardDescription>
                Choose how your profile appears to visitors. Select from our professionally designed templates to showcase your talent.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TemplateSelector 
                selectedTemplate={selectedTemplate}
                onTemplateChange={setSelectedTemplate}
                userTier={userTier}
                onUpgrade={() => setLocation('/pricing-selection')}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-2xl space-y-6">
          <SocialMediaManager />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Control who can see your profile and what information is displayed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Public Profile</Label>
                  <p className="text-sm text-gray-500">Allow anyone to view your profile</p>
                </div>
                <Switch
                  checked={sharingSettings?.isPublic || false}
                  onCheckedChange={(checked) => handleSettingChange('isPublic', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Direct Messages</Label>
                  <p className="text-sm text-gray-500">Allow others to message you directly</p>
                </div>
                <Switch
                  checked={sharingSettings?.allowDirectMessages || false}
                  onCheckedChange={(checked) => handleSettingChange('allowDirectMessages', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Show Contact Info</Label>
                  <p className="text-sm text-gray-500">Display your contact information</p>
                </div>
                <Switch
                  checked={sharingSettings?.showContactInfo || false}
                  onCheckedChange={(checked) => handleSettingChange('showContactInfo', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Show Media Gallery</Label>
                  <p className="text-sm text-gray-500">Display your portfolio and media</p>
                </div>
                <Switch
                  checked={sharingSettings?.showMediaGallery || false}
                  onCheckedChange={(checked) => handleSettingChange('showMediaGallery', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Allow Non-Account Holders</Label>
                  <p className="text-sm text-gray-500">Let people without accounts view your profile</p>
                </div>
                <Switch
                  checked={sharingSettings?.allowNonAccountHolders || false}
                  onCheckedChange={(checked) => handleSettingChange('allowNonAccountHolders', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}