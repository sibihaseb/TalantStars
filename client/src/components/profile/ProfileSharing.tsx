import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Copy, 
  Share, 
  Link, 
  Facebook, 
  Twitter, 
  Mail, 
  MessageCircle, 
  Globe,
  Eye,
  EyeOff,
  Edit2,
  Check,
  X
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
}

export default function ProfileSharing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [newCustomUrl, setNewCustomUrl] = useState("");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Fetch current profile sharing settings
  const { data: sharingSettings, isLoading } = useQuery<ProfileSharingSettings>({
    queryKey: ['/api/profile/sharing'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/profile/sharing');
      return response.json();
    }
  });

  // Update sharing settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<ProfileSharingSettings>) => {
      const response = await apiRequest('PUT', '/api/profile/sharing', settings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile/sharing'] });
      toast({
        title: "Settings updated",
        description: "Your profile sharing settings have been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update sharing settings",
        variant: "destructive",
      });
    }
  });

  // Update custom URL mutation
  const updateCustomUrlMutation = useMutation({
    mutationFn: async (customUrl: string) => {
      const response = await apiRequest('PUT', '/api/profile/sharing/custom-url', { customUrl });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile/sharing'] });
      setIsEditingUrl(false);
      setNewCustomUrl("");
      toast({
        title: "Custom URL updated",
        description: "Your custom profile URL has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "URL update failed",
        description: error.message || "Failed to update custom URL",
        variant: "destructive",
      });
    }
  });

  const handleSettingChange = (key: keyof ProfileSharingSettings, value: any) => {
    updateSettingsMutation.mutate({ [key]: value });
  };

  const handleCustomUrlUpdate = () => {
    if (newCustomUrl.trim()) {
      updateCustomUrlMutation.mutate(newCustomUrl.trim());
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedUrl(label);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
      setTimeout(() => setCopiedUrl(null), 2000);
    });
  };

  const shareProfile = (platform: string, url: string) => {
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=Check out my profile on Talents & Stars`,
      email: `mailto:?subject=My Profile - ${user?.firstName} ${user?.lastName}&body=Check out my profile: ${url}`,
      sms: `sms:?body=Check out my profile: ${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const baseUrl = window.location.origin;
  const profileUrl = sharingSettings?.customUrl 
    ? `${baseUrl}/profile/${sharingSettings.customUrl}`
    : `${baseUrl}/profile/${user?.id}`;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Sharing</h1>
        <p className="text-gray-600">
          Share your profile with the world and control who can see what
        </p>
      </div>

      {/* Profile URL Card */}
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
                  {sharingSettings?.customUrl || user?.id}
                </span>
                <Button
                  onClick={() => {
                    setIsEditingUrl(true);
                    setNewCustomUrl(sharingSettings?.customUrl || "");
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
          <div className="flex flex-wrap gap-2 pt-4">
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
            <Button
              onClick={() => shareProfile('sms', profileUrl)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              SMS
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
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
              <p className="text-sm text-gray-500">
                Allow your profile to be discovered by anyone with the link
              </p>
            </div>
            <Switch
              checked={sharingSettings?.isPublic || false}
              onCheckedChange={(checked) => handleSettingChange('isPublic', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Allow Direct Messages</Label>
              <p className="text-sm text-gray-500">
                Let visitors send you direct messages through your profile
              </p>
            </div>
            <Switch
              checked={sharingSettings?.allowDirectMessages || false}
              onCheckedChange={(checked) => handleSettingChange('allowDirectMessages', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Show Contact Information</Label>
              <p className="text-sm text-gray-500">
                Display your email and phone number on your public profile
              </p>
            </div>
            <Switch
              checked={sharingSettings?.showContactInfo || false}
              onCheckedChange={(checked) => handleSettingChange('showContactInfo', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Show Social Links</Label>
              <p className="text-sm text-gray-500">
                Display your social media links on your public profile
              </p>
            </div>
            <Switch
              checked={sharingSettings?.showSocialLinks || false}
              onCheckedChange={(checked) => handleSettingChange('showSocialLinks', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Show Media Gallery</Label>
              <p className="text-sm text-gray-500">
                Display your portfolio media on your public profile
              </p>
            </div>
            <Switch
              checked={sharingSettings?.showMediaGallery || false}
              onCheckedChange={(checked) => handleSettingChange('showMediaGallery', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Allow Non-Account Holders</Label>
              <p className="text-sm text-gray-500">
                Let people without accounts view your profile (limited access)
              </p>
            </div>
            <Switch
              checked={sharingSettings?.allowNonAccountHolders || false}
              onCheckedChange={(checked) => handleSettingChange('allowNonAccountHolders', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Completely Private</Label>
              <p className="text-sm text-gray-500">
                Make your profile private from all users (overrides other settings)
              </p>
            </div>
            <Switch
              checked={sharingSettings?.completelyPrivate || false}
              onCheckedChange={(checked) => handleSettingChange('completelyPrivate', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Analytics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Profile Analytics
          </CardTitle>
          <CardDescription>
            See how your profile is performing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {sharingSettings?.profileViews || 0}
              </div>
              <div className="text-sm text-gray-600">Profile Views</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {sharingSettings?.lastShared ? "Yes" : "No"}
              </div>
              <div className="text-sm text-gray-600">Recently Shared</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {sharingSettings?.isPublic ? "Public" : "Private"}
              </div>
              <div className="text-sm text-gray-600">Visibility</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}