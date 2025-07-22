import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  ExternalLink,
  Move,
  BarChart3,
  Verified
} from 'lucide-react';
import {
  SiFacebook,
  SiX,
  SiInstagram,
  SiLinkedin,
  SiYoutube,
  SiTiktok,
  SiTelegram,
  SiSnapchat,
  SiWhatsapp,
  SiReddit,
  SiDiscord,
  SiPinterest
} from 'react-icons/si';

const SOCIAL_PLATFORMS = [
  { id: 'facebook', name: 'Facebook', icon: SiFacebook, color: '#1877F2', baseUrl: 'https://facebook.com/' },
  { id: 'instagram', name: 'Instagram', icon: SiInstagram, color: '#E4405F', baseUrl: 'https://instagram.com/' },
  { id: 'twitter', name: 'X (Twitter)', icon: SiX, color: '#000000', baseUrl: 'https://twitter.com/' },
  { id: 'linkedin', name: 'LinkedIn', icon: SiLinkedin, color: '#0A66C2', baseUrl: 'https://linkedin.com/in/' },
  { id: 'youtube', name: 'YouTube', icon: SiYoutube, color: '#FF0000', baseUrl: 'https://youtube.com/@' },
  { id: 'tiktok', name: 'TikTok', icon: SiTiktok, color: '#000000', baseUrl: 'https://tiktok.com/@' },
  { id: 'telegram', name: 'Telegram', icon: SiTelegram, color: '#26A5E4', baseUrl: 'https://t.me/' },
  { id: 'snapchat', name: 'Snapchat', icon: SiSnapchat, color: '#FFFC00', baseUrl: 'https://snapchat.com/add/' },
  { id: 'whatsapp', name: 'WhatsApp', icon: SiWhatsapp, color: '#25D366', baseUrl: 'https://wa.me/' },
  { id: 'reddit', name: 'Reddit', icon: SiReddit, color: '#FF4500', baseUrl: 'https://reddit.com/u/' },
  { id: 'discord', name: 'Discord', icon: SiDiscord, color: '#5865F2', baseUrl: 'https://discord.com/users/' },
  { id: 'pinterest', name: 'Pinterest', icon: SiPinterest, color: '#BD081C', baseUrl: 'https://pinterest.com/' }
];

interface SocialMediaLink {
  id: number;
  platform: string;
  username: string;
  url: string;
  displayName?: string;
  isVisible: boolean;
  iconColor?: string;
  sortOrder: number;
  clickCount: number;
  verifiedAt?: string;
}

interface SocialMediaManagerProps {
  className?: string;
}

const SocialMediaManager: React.FC<SocialMediaManagerProps> = ({ className = "" }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingLink, setEditingLink] = useState<SocialMediaLink | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    platform: '',
    username: '',
    url: '',
    displayName: '',
    isVisible: true,
    iconColor: ''
  });

  // Fetch social media links
  const { data: socialLinks = [], isLoading } = useQuery({
    queryKey: ['/api/social-media-links'],
    enabled: !!user?.id,
  });

  // Create social media link mutation
  const createLinkMutation = useMutation({
    mutationFn: async (linkData: any) => {
      const response = await apiRequest('POST', '/api/social-media-links', linkData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social-media-links'] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "Social Media Link Added",
        description: "Your social media link has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Adding Link",
        description: "Failed to add social media link. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update social media link mutation
  const updateLinkMutation = useMutation({
    mutationFn: async ({ id, ...linkData }: any) => {
      const response = await apiRequest('PUT', `/api/social-media-links/${id}`, linkData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social-media-links'] });
      setIsEditDialogOpen(false);
      setEditingLink(null);
      resetForm();
      toast({
        title: "Social Media Link Updated",
        description: "Your social media link has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Updating Link",
        description: "Failed to update social media link. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete social media link mutation
  const deleteLinkMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/social-media-links/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social-media-links'] });
      toast({
        title: "Social Media Link Deleted",
        description: "Your social media link has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Deleting Link",
        description: "Failed to delete social media link. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      platform: '',
      username: '',
      url: '',
      displayName: '',
      isVisible: true,
      iconColor: ''
    });
  };

  const getPlatformConfig = (platformId: string) => {
    return SOCIAL_PLATFORMS.find(p => p.id === platformId) || SOCIAL_PLATFORMS[0];
  };

  const handlePlatformChange = (platform: string) => {
    const config = getPlatformConfig(platform);
    setFormData(prev => ({
      ...prev,
      platform,
      iconColor: config.color,
      url: prev.username ? config.baseUrl + prev.username : config.baseUrl
    }));
  };

  const handleUsernameChange = (username: string) => {
    const config = getPlatformConfig(formData.platform);
    setFormData(prev => ({
      ...prev,
      username,
      url: username ? config.baseUrl + username : config.baseUrl
    }));
  };

  const handleAddLink = () => {
    if (!formData.platform || !formData.url) {
      toast({
        title: "Missing Information",
        description: "Please select a platform and provide a valid link.",
        variant: "destructive",
      });
      return;
    }

    createLinkMutation.mutate({
      ...formData,
      sortOrder: socialLinks.length
    });
  };

  const handleEditLink = (link: SocialMediaLink) => {
    setEditingLink(link);
    setFormData({
      platform: link.platform,
      username: link.username || '',
      url: link.url,
      displayName: link.displayName || '',
      isVisible: link.isVisible,
      iconColor: link.iconColor || getPlatformConfig(link.platform).color
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateLink = () => {
    if (!editingLink) return;

    updateLinkMutation.mutate({
      id: editingLink.id,
      ...formData
    });
  };

  const handleDeleteLink = (id: number) => {
    if (confirm('Are you sure you want to delete this social media link?')) {
      deleteLinkMutation.mutate(id);
    }
  };

  const toggleVisibility = (link: SocialMediaLink) => {
    updateLinkMutation.mutate({
      id: link.id,
      ...link,
      isVisible: !link.isVisible
    });
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Social Media Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Social Media Links
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Social Media Link</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Select onValueChange={handlePlatformChange} value={formData.platform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOCIAL_PLATFORMS.map((platform) => {
                        const Icon = platform.icon;
                        return (
                          <SelectItem key={platform.id} value={platform.id}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" style={{ color: platform.color }} />
                              {platform.name}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="username">Username/Handle</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    placeholder="your_username"
                  />
                </div>

                <div>
                  <Label htmlFor="url">Full URL</Label>
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <Label htmlFor="displayName">Display Name (Optional)</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="Custom display name"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="isVisible">Show on Profile</Label>
                  <Switch
                    id="isVisible"
                    checked={formData.isVisible}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVisible: checked }))}
                  />
                </div>

                <Button 
                  onClick={handleAddLink} 
                  className="w-full"
                  disabled={createLinkMutation.isPending}
                >
                  {createLinkMutation.isPending ? 'Adding...' : 'Add Social Media Link'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {socialLinks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No social media links added yet</p>
              <p className="text-sm">Add your social media links to showcase them on your profile</p>
            </div>
          ) : (
            socialLinks.map((link: SocialMediaLink) => {
              const platform = getPlatformConfig(link.platform);
              const Icon = platform.icon;

              return (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon 
                      className="h-6 w-6" 
                      style={{ color: link.iconColor || platform.color }} 
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {link.displayName || link.username || platform.name}
                        </span>
                        {link.verifiedAt && (
                          <Verified className="h-4 w-4 text-blue-500" />
                        )}
                        {!link.isVisible && (
                          <Badge variant="secondary" className="text-xs">
                            Hidden
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {link.clickCount} clicks • {platform.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleVisibility(link)}
                      title={link.isVisible ? 'Hide from profile' : 'Show on profile'}
                    >
                      {link.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(link.url, '_blank')}
                      title="Visit link"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditLink(link)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteLink(link.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Social Media Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-platform">Platform</Label>
                <Select onValueChange={handlePlatformChange} value={formData.platform}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOCIAL_PLATFORMS.map((platform) => {
                      const Icon = platform.icon;
                      return (
                        <SelectItem key={platform.id} value={platform.id}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" style={{ color: platform.color }} />
                            {platform.name}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-username">Username/Handle</Label>
                <Input
                  id="edit-username"
                  value={formData.username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="your_username"
                />
              </div>

              <div>
                <Label htmlFor="edit-url">Full URL</Label>
                <Input
                  id="edit-url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label htmlFor="edit-displayName">Display Name (Optional)</Label>
                <Input
                  id="edit-displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="Custom display name"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="edit-isVisible">Show on Profile</Label>
                <Switch
                  id="edit-isVisible"
                  checked={formData.isVisible}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVisible: checked }))}
                />
              </div>

              <Button 
                onClick={handleUpdateLink} 
                className="w-full"
                disabled={updateLinkMutation.isPending}
              >
                {updateLinkMutation.isPending ? 'Updating...' : 'Update Social Media Link'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SocialMediaManager;