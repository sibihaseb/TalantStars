import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  Image, 
  Video, 
  Music,
  FileText,
  ExternalLink,
  Trash2,
  Plus,
  Eye,
  Download
} from "lucide-react";

export default function Media() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [uploadType, setUploadType] = useState<'file' | 'external'>('file');
  const [externalUrl, setExternalUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('portfolio');

  // Redirect if not authenticated
  if (!isAuthenticated) {
    window.location.href = "/auth";
    return null;
  }

  // Fetch media files
  const { data: mediaFiles = [], isLoading } = useQuery({
    queryKey: ['/api/media'],
  });

  // Upload file mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      toast({
        title: "Success",
        description: "Media uploaded successfully!",
      });
      setDescription('');
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add external media mutation
  const externalMutation = useMutation({
    mutationFn: async (data: { url: string; description: string; category: string }) => {
      const response = await apiRequest('POST', '/api/media/external', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      toast({
        title: "Success",
        description: "External media added successfully!",
      });
      setExternalUrl('');
      setDescription('');
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Media",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete media mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/media/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      toast({
        title: "Success",
        description: "Media deleted successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    formData.append('category', category);
    uploadMutation.mutate(formData);
  };

  const handleExternalAdd = (e: React.FormEvent) => {
    e.preventDefault();
    externalMutation.mutate({
      url: externalUrl,
      description,
      category,
    });
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'audio':
        return <Music className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getMediaTypeColor = (type: string) => {
    switch (type) {
      case 'image':
        return 'bg-green-100 text-green-800';
      case 'video':
        return 'bg-blue-100 text-blue-800';
      case 'audio':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Media Portfolio
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Upload and manage your portfolio media files
              </p>
            </div>

            <Tabs defaultValue="upload" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload Media</TabsTrigger>
                <TabsTrigger value="gallery">My Gallery</TabsTrigger>
              </TabsList>

              <TabsContent value="upload">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Upload className="h-5 w-5" />
                      <span>Add New Media</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Tabs value={uploadType} onValueChange={(value) => setUploadType(value as 'file' | 'external')}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="file">Upload File</TabsTrigger>
                        <TabsTrigger value="external">External Link</TabsTrigger>
                      </TabsList>

                      <TabsContent value="file">
                        <form onSubmit={handleFileUpload} className="space-y-4">
                          <div>
                            <Label htmlFor="file">Select File</Label>
                            <Input
                              id="file"
                              name="file"
                              type="file"
                              accept="image/*,video/*,audio/*"
                              required
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="category">Category</Label>
                            <select
                              id="category"
                              value={category}
                              onChange={(e) => setCategory(e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                              <option value="portfolio">Portfolio</option>
                              <option value="demo">Demo Reel</option>
                              <option value="headshot">Headshot</option>
                              <option value="resume">Resume</option>
                              <option value="other">Other</option>
                            </select>
                          </div>

                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              name="description"
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              placeholder="Describe this media file..."
                              className="mt-1"
                            />
                          </div>

                          <Button 
                            type="submit" 
                            disabled={uploadMutation.isPending}
                            className="w-full"
                          >
                            {uploadMutation.isPending ? 'Uploading...' : 'Upload Media'}
                          </Button>
                        </form>
                      </TabsContent>

                      <TabsContent value="external">
                        <form onSubmit={handleExternalAdd} className="space-y-4">
                          <div>
                            <Label htmlFor="url">External URL</Label>
                            <Input
                              id="url"
                              type="url"
                              value={externalUrl}
                              onChange={(e) => setExternalUrl(e.target.value)}
                              placeholder="https://youtube.com/watch?v=..."
                              required
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="category">Category</Label>
                            <select
                              id="category"
                              value={category}
                              onChange={(e) => setCategory(e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                              <option value="portfolio">Portfolio</option>
                              <option value="demo">Demo Reel</option>
                              <option value="headshot">Headshot</option>
                              <option value="resume">Resume</option>
                              <option value="other">Other</option>
                            </select>
                          </div>

                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              placeholder="Describe this media..."
                              className="mt-1"
                            />
                          </div>

                          <Button 
                            type="submit" 
                            disabled={externalMutation.isPending}
                            className="w-full"
                          >
                            {externalMutation.isPending ? 'Adding...' : 'Add External Media'}
                          </Button>
                        </form>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="gallery">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Image className="h-5 w-5" />
                      <span>Media Gallery</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : mediaFiles.length === 0 ? (
                      <div className="text-center py-8">
                        <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">No media files uploaded yet</p>
                        <p className="text-sm text-gray-400 mt-2">Upload your first media file to get started</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mediaFiles.map((media: any) => (
                          <Card key={media.id} className="overflow-hidden">
                            <CardContent className="p-0">
                              {media.type === 'image' && media.url && (
                                <img 
                                  src={media.url} 
                                  alt={media.description || 'Media file'} 
                                  className="w-full h-48 object-cover"
                                />
                              )}
                              {media.type === 'video' && media.url && (
                                <video 
                                  src={media.url} 
                                  className="w-full h-48 object-cover"
                                  controls
                                />
                              )}
                              {media.type === 'audio' && media.url && (
                                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                                  <Music className="h-12 w-12 text-gray-400" />
                                </div>
                              )}
                              {media.externalUrl && (
                                <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                  <ExternalLink className="h-12 w-12 text-blue-600" />
                                </div>
                              )}
                              
                              <div className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <Badge className={getMediaTypeColor(media.type)}>
                                    {getMediaIcon(media.type)}
                                    <span className="ml-1 capitalize">{media.type}</span>
                                  </Badge>
                                  <Badge variant="outline">{media.category}</Badge>
                                </div>
                                
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                  {media.description || 'No description'}
                                </p>
                                
                                <div className="flex space-x-2">
                                  {media.url && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => window.open(media.url, '_blank')}
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      View
                                    </Button>
                                  )}
                                  {media.externalUrl && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => window.open(media.externalUrl, '_blank')}
                                    >
                                      <ExternalLink className="h-4 w-4 mr-1" />
                                      Open
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => deleteMutation.mutate(media.id)}
                                    disabled={deleteMutation.isPending}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        
        <Footer />
      </div>
    </ThemeProvider>
  );
}