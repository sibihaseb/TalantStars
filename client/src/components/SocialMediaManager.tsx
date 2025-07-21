import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Youtube,
  Music,
  Globe,
  Plus,
  Save,
  Trash2
} from "lucide-react";

interface SocialLinks {
  instagram?: string;
  twitter?: string;
  facebook?: string;
  linkedin?: string;
  youtube?: string;
  spotify?: string;
  tiktok?: string;
  website?: string;
  [key: string]: string | undefined;
}

const socialPlatforms = [
  { key: 'instagram', name: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/username' },
  { key: 'twitter', name: 'Twitter/X', icon: Twitter, placeholder: 'https://twitter.com/username' },
  { key: 'facebook', name: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/username' },
  { key: 'linkedin', name: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/username' },
  { key: 'youtube', name: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/channel/username' },
  { key: 'spotify', name: 'Spotify', icon: Music, placeholder: 'https://open.spotify.com/artist/username' },
  { key: 'tiktok', name: 'TikTok', icon: Music, placeholder: 'https://tiktok.com/@username' },
  { key: 'website', name: 'Personal Website', icon: Globe, placeholder: 'https://yourwebsite.com' },
];

export function SocialMediaManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [isEditing, setIsEditing] = useState(false);

  // Fetch current social links
  const { data: socialLinksData, isLoading } = useQuery({
    queryKey: ['/api/user/social-links'],
    onSuccess: (data) => {
      setSocialLinks(data.socialLinks || {});
    }
  });

  // Update social links mutation
  const updateSocialLinksMutation = useMutation({
    mutationFn: async (links: SocialLinks) => {
      const response = await apiRequest('PUT', '/api/user/social-links', { socialLinks: links });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/social-links'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      setIsEditing(false);
      toast({
        title: "Success!",
        description: "Social media links updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update social media links",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (platform: string, value: string) => {
    setSocialLinks(prev => ({
      ...prev,
      [platform]: value.trim() || undefined
    }));
  };

  const handleSave = () => {
    // Validate URLs
    const validatedLinks: SocialLinks = {};
    
    Object.entries(socialLinks).forEach(([key, value]) => {
      if (value && value.trim()) {
        let url = value.trim();
        // Add https:// if not present
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }
        validatedLinks[key] = url;
      }
    });

    updateSocialLinksMutation.mutate(validatedLinks);
  };

  const handleRemove = (platform: string) => {
    setSocialLinks(prev => {
      const newLinks = { ...prev };
      delete newLinks[platform];
      return newLinks;
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Social Media Links</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Social Media Links
        </CardTitle>
        <CardDescription>
          Add your social media profiles to display on your public profile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Display Mode */}
        {!isEditing && (
          <div className="space-y-4">
            {socialPlatforms.map((platform) => {
              const Icon = platform.icon;
              const currentLink = (socialLinksData?.socialLinks || {})[platform.key];
              
              if (!currentLink) return null;
              
              return (
                <div key={platform.key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{platform.name}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                        {currentLink}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(currentLink, '_blank')}
                  >
                    Visit
                  </Button>
                </div>
              );
            })}
            
            {Object.keys(socialLinksData?.socialLinks || {}).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No social media links added yet</p>
                <p className="text-sm">Add your social profiles to showcase your presence</p>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button onClick={() => setIsEditing(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {Object.keys(socialLinksData?.socialLinks || {}).length === 0 ? 'Add Social Links' : 'Edit Social Links'}
              </Button>
            </div>
          </div>
        )}

        {/* Edit Mode */}
        {isEditing && (
          <div className="space-y-4">
            {socialPlatforms.map((platform) => {
              const Icon = platform.icon;
              const currentValue = socialLinks[platform.key] || '';
              
              return (
                <div key={platform.key} className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {platform.name}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder={platform.placeholder}
                      value={currentValue}
                      onChange={(e) => handleInputChange(platform.key, e.target.value)}
                      className="flex-1"
                    />
                    {currentValue && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemove(platform.key)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleSave}
                disabled={updateSocialLinksMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  setSocialLinks(socialLinksData?.socialLinks || {});
                }}
                disabled={updateSocialLinksMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}