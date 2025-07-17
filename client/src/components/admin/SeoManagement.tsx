import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Search, 
  Settings, 
  Image, 
  Globe, 
  Share2, 
  Edit3, 
  Trash2, 
  Plus,
  Upload,
  Eye,
  ExternalLink,
  Save,
  RefreshCw,
  ChevronRight
} from 'lucide-react';

interface SeoSetting {
  id: number;
  key: string;
  value: string;
  description: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SeoImage {
  id: number;
  name: string;
  url: string;
  alt: string;
  description: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProfileSeoData {
  id: number;
  userId: number;
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  customMeta: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SeoManagement() {
  const [activeTab, setActiveTab] = useState('settings');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch SEO settings
  const { data: seoSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/admin/seo/settings'],
    queryFn: () => apiRequest('/api/admin/seo/settings')
  });

  // Fetch SEO images
  const { data: seoImages, isLoading: imagesLoading } = useQuery({
    queryKey: ['/api/admin/seo/images'],
    queryFn: () => apiRequest('/api/admin/seo/images')
  });

  // Fetch profile SEO data
  const { data: profileSeoData, isLoading: profilesLoading } = useQuery({
    queryKey: ['/api/admin/seo/profiles'],
    queryFn: () => apiRequest('/api/admin/seo/profiles')
  });

  // Create/Update SEO setting
  const settingMutation = useMutation({
    mutationFn: (data: any) => {
      if (data.id) {
        return apiRequest(`/api/admin/seo/settings/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      }
      return apiRequest('/api/admin/seo/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/seo/settings'] });
      setIsDialogOpen(false);
      setEditingItem(null);
      toast({
        title: "Success",
        description: "SEO setting saved successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save SEO setting",
        variant: "destructive"
      });
    }
  });

  // Create/Update SEO image
  const imageMutation = useMutation({
    mutationFn: (data: any) => {
      if (data.id) {
        return apiRequest(`/api/admin/seo/images/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      }
      return apiRequest('/api/admin/seo/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/seo/images'] });
      setIsDialogOpen(false);
      setEditingItem(null);
      toast({
        title: "Success",
        description: "SEO image saved successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save SEO image",
        variant: "destructive"
      });
    }
  });

  // Delete SEO item
  const deleteMutation = useMutation({
    mutationFn: ({ type, id }: { type: string; id: number }) => {
      return apiRequest(`/api/admin/seo/${type}/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/seo/${type}`] });
      toast({
        title: "Success",
        description: "Item deleted successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive"
      });
    }
  });

  // Generate profile SEO data
  const generateMutation = useMutation({
    mutationFn: () => {
      return apiRequest('/api/admin/seo/profiles/generate', {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/seo/profiles'] });
      toast({
        title: "Success",
        description: "Profile SEO data generated successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate profile SEO data",
        variant: "destructive"
      });
    }
  });

  const handleSave = (data: any) => {
    if (activeTab === 'settings') {
      settingMutation.mutate(data);
    } else if (activeTab === 'images') {
      imageMutation.mutate(data);
    }
  };

  const handleDelete = (type: string, id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteMutation.mutate({ type, id });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/seo/images/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setEditingItem(prev => ({
          ...prev,
          url: result.url
        }));
        toast({
          title: "Success",
          description: "Image uploaded successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      });
    }
  };

  const filteredSettings = seoSettings?.filter((setting: SeoSetting) => {
    const matchesSearch = setting.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         setting.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || setting.type === selectedType;
    return matchesSearch && matchesType;
  });

  const filteredImages = seoImages?.filter((image: SeoImage) => {
    const matchesSearch = image.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || image.type === selectedType;
    return matchesSearch && matchesType;
  });

  const SettingsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">SEO Settings</h3>
          <p className="text-sm text-muted-foreground">
            Manage global SEO settings and configurations
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingItem({ key: '', value: '', description: '', type: 'global', isActive: true });
            setIsDialogOpen(true);
          }}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Setting
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search settings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="global">Global</SelectItem>
            <SelectItem value="page">Page</SelectItem>
            <SelectItem value="meta">Meta</SelectItem>
            <SelectItem value="social">Social</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {settingsLoading ? (
          <div className="text-center py-8">Loading settings...</div>
        ) : filteredSettings?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No settings found matching your criteria
          </div>
        ) : (
          filteredSettings?.map((setting: SeoSetting) => (
            <Card key={setting.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium">{setting.key}</h4>
                      <Badge variant={setting.isActive ? "default" : "secondary"}>
                        {setting.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">{setting.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {setting.description}
                    </p>
                    <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {setting.value}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingItem(setting);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete('settings', setting.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const ImagesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">SEO Images</h3>
          <p className="text-sm text-muted-foreground">
            Manage images for social media sharing and SEO
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingItem({ 
              name: '', 
              url: '', 
              alt: '', 
              description: '', 
              type: 'og', 
              isActive: true 
            });
            setIsDialogOpen(true);
          }}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Image
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search images..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="og">Open Graph</SelectItem>
            <SelectItem value="twitter">Twitter</SelectItem>
            <SelectItem value="favicon">Favicon</SelectItem>
            <SelectItem value="logo">Logo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {imagesLoading ? (
          <div className="col-span-full text-center py-8">Loading images...</div>
        ) : filteredImages?.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No images found matching your criteria
          </div>
        ) : (
          filteredImages?.map((image: SeoImage) => (
            <Card key={image.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
                  <img 
                    src={image.url} 
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium truncate">{image.name}</h4>
                    <div className="flex items-center space-x-1">
                      <Badge variant={image.isActive ? "default" : "secondary"} className="text-xs">
                        {image.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{image.type}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {image.description}
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(image.url, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingItem(image);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete('images', image.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const ProfilesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Profile SEO Data</h3>
          <p className="text-sm text-muted-foreground">
            Manage SEO data for individual user profiles
          </p>
        </div>
        <Button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          size="sm"
        >
          {generateMutation.isPending ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Generate All
        </Button>
      </div>

      <div className="grid gap-4">
        {profilesLoading ? (
          <div className="text-center py-8">Loading profile data...</div>
        ) : profileSeoData?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No profile SEO data found
          </div>
        ) : (
          profileSeoData?.map((profile: ProfileSeoData) => (
            <Card key={profile.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium">{profile.title}</h4>
                      <Badge variant={profile.isActive ? "default" : "secondary"}>
                        {profile.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {profile.description}
                    </p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p><strong>Keywords:</strong> {profile.keywords}</p>
                      <p><strong>OG Title:</strong> {profile.ogTitle}</p>
                      <p><strong>Twitter Card:</strong> {profile.twitterCard}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`/profile/${profile.userId}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingItem(profile);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const EditDialog = () => (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingItem?.id ? 'Edit' : 'Add'} {
              activeTab === 'settings' ? 'SEO Setting' : 
              activeTab === 'images' ? 'SEO Image' : 'Profile SEO Data'
            }
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {activeTab === 'settings' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="key">Key</Label>
                  <Input
                    id="key"
                    value={editingItem?.key || ''}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, key: e.target.value }))}
                    placeholder="e.g., site_title"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={editingItem?.type || 'global'}
                    onValueChange={(value) => setEditingItem(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">Global</SelectItem>
                      <SelectItem value="page">Page</SelectItem>
                      <SelectItem value="meta">Meta</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="value">Value</Label>
                <Textarea
                  id="value"
                  value={editingItem?.value || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="Setting value"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingItem?.description || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What this setting controls"
                  rows={2}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={editingItem?.isActive || false}
                  onCheckedChange={(checked) => setEditingItem(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </>
          )}
          
          {activeTab === 'images' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editingItem?.name || ''}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Image name"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={editingItem?.type || 'og'}
                    onValueChange={(value) => setEditingItem(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="og">Open Graph</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="favicon">Favicon</SelectItem>
                      <SelectItem value="logo">Logo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="url">Image URL</Label>
                <div className="flex space-x-2">
                  <Input
                    id="url"
                    value={editingItem?.url || ''}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="Image URL"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="alt">Alt Text</Label>
                <Input
                  id="alt"
                  value={editingItem?.alt || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, alt: e.target.value }))}
                  placeholder="Alternative text for accessibility"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingItem?.description || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Image description"
                  rows={2}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={editingItem?.isActive || false}
                  onCheckedChange={(checked) => setEditingItem(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleSave(editingItem)}
            disabled={settingMutation.isPending || imageMutation.isPending}
          >
            {settingMutation.isPending || imageMutation.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">SEO Management</h2>
          <p className="text-muted-foreground">
            Manage SEO settings, images, and profile data for better search visibility
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            <Globe className="h-3 w-3 mr-1" />
            SEO System
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center space-x-2">
            <Image className="h-4 w-4" />
            <span>Images</span>
          </TabsTrigger>
          <TabsTrigger value="profiles" className="flex items-center space-x-2">
            <Share2 className="h-4 w-4" />
            <span>Profiles</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>

        <TabsContent value="images">
          <ImagesTab />
        </TabsContent>

        <TabsContent value="profiles">
          <ProfilesTab />
        </TabsContent>
      </Tabs>

      <EditDialog />
    </div>
  );
}