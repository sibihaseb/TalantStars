import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Upload, 
  Image, 
  Video, 
  Music, 
  FileText, 
  ExternalLink, 
  Trash2, 
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Download
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

import { Header } from '@/components/layout/Header';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { apiRequest } from '@/lib/queryClient';

const uploadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  file: z.any().optional(),
  externalUrl: z.string().url('Please enter a valid URL').optional(),
});

type UploadFormData = z.infer<typeof uploadSchema>;

interface MediaFile {
  id: number;
  title: string;
  description: string;
  category: string;
  mediaType: string;
  url: string;
  externalUrl?: string;
  filename?: string;
  originalName?: string;
  createdAt: string;
}

export default function Media() {
  const [uploadType, setUploadType] = useState<'file' | 'external'>('file');
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'portfolio',
    },
  });

  const { data: mediaFiles = [], isLoading, error } = useQuery({
    queryKey: ['/api/media'],
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: UploadFormData & { file?: File }) => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description || '');
      formData.append('category', data.category);
      
      if (data.file) {
        formData.append('file', data.file);
      } else if (data.externalUrl) {
        formData.append('externalUrl', data.externalUrl);
      }
      
      const response = await apiRequest('POST', '/api/media', formData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      form.reset();
      toast({
        title: "Success",
        description: "Media uploaded successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload media",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/media/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      toast({
        title: "Success",
        description: "Media deleted successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete media",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UploadFormData) => {
    const fileInput = document.getElementById('file') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    
    if (uploadType === 'file' && !file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }
    
    if (uploadType === 'external' && !data.externalUrl) {
      toast({
        title: "Error",
        description: "Please enter a valid external URL",
        variant: "destructive",
      });
      return;
    }
    
    uploadMutation.mutate({
      ...data,
      file: uploadType === 'file' ? file : undefined,
    });
  };

  const openModal = (index: number) => {
    setSelectedMediaIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMediaIndex(null);
  };

  const navigateMedia = (direction: 'prev' | 'next') => {
    if (selectedMediaIndex === null) return;
    
    const newIndex = direction === 'prev' 
      ? Math.max(0, selectedMediaIndex - 1)
      : Math.min(mediaFiles.length - 1, selectedMediaIndex + 1);
    
    setSelectedMediaIndex(newIndex);
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
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'video':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'audio':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const currentMedia = selectedMediaIndex !== null ? mediaFiles[selectedMediaIndex] : null;

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
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Tabs value={uploadType} onValueChange={(value) => setUploadType(value as 'file' | 'external')}>
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="file">Upload File</TabsTrigger>
                            <TabsTrigger value="external">External Link</TabsTrigger>
                          </TabsList>

                          <TabsContent value="file" className="space-y-4">
                            <div>
                              <Label htmlFor="file">Select File</Label>
                              <Input
                                id="file"
                                type="file"
                                accept="image/*,video/*,audio/*"
                                className="mt-1 cursor-pointer"
                              />
                              <p className="text-sm text-gray-500 mt-1">
                                Supported formats: Images (JPG, PNG, GIF), Videos (MP4, MOV, AVI), Audio (MP3, WAV)
                              </p>
                            </div>
                          </TabsContent>

                          <TabsContent value="external" className="space-y-4">
                            <FormField
                              control={form.control}
                              name="externalUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>External URL</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="https://youtube.com/watch?v=..."
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TabsContent>
                        </Tabs>

                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter a title for your media..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Add a description..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="portfolio">Portfolio</SelectItem>
                                  <SelectItem value="demo">Demo Reel</SelectItem>
                                  <SelectItem value="headshot">Headshot</SelectItem>
                                  <SelectItem value="resume">Resume</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit" 
                          disabled={uploadMutation.isPending}
                          className="w-full"
                        >
                          {uploadMutation.isPending ? 'Uploading...' : 'Upload Media'}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="gallery">
                <Card>
                  <CardHeader>
                    <CardTitle>My Gallery</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      </div>
                    ) : error ? (
                      <div className="text-center py-8 text-red-600">
                        Error loading media files
                      </div>
                    ) : mediaFiles.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No media files uploaded yet
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mediaFiles.map((media: MediaFile, index: number) => (
                          <Card key={media.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                            <CardContent className="p-0">
                              <div className="relative">
                                {media.mediaType === 'image' && media.url && (
                                  <img 
                                    src={media.url} 
                                    alt={media.title || 'Media file'} 
                                    className="w-full h-48 object-cover cursor-pointer"
                                    onClick={() => openModal(index)}
                                  />
                                )}
                                {media.mediaType === 'video' && media.url && (
                                  <div className="relative">
                                    <video 
                                      src={media.url} 
                                      className="w-full h-48 object-cover cursor-pointer"
                                      onClick={() => openModal(index)}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Video className="h-12 w-12 text-white" />
                                    </div>
                                  </div>
                                )}
                                {media.mediaType === 'audio' && (
                                  <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 flex items-center justify-center cursor-pointer group-hover:from-purple-200 group-hover:to-blue-200 dark:group-hover:from-purple-800 dark:group-hover:to-blue-800 transition-colors"
                                       onClick={() => openModal(index)}>
                                    <Music className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                                  </div>
                                )}
                                
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                                    onClick={() => openModal(index)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <Badge className={getMediaTypeColor(media.mediaType)}>
                                    {getMediaIcon(media.mediaType)}
                                    <span className="ml-1 capitalize">{media.mediaType}</span>
                                  </Badge>
                                  <Badge variant="outline">{media.category}</Badge>
                                </div>
                                
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                                  {media.title || 'Untitled'}
                                </h3>
                                
                                {media.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                                    {media.description}
                                  </p>
                                )}
                                
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(media.createdAt).toLocaleDateString()}
                                  </span>
                                  
                                  <div className="flex items-center space-x-2">
                                    {media.externalUrl && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => window.open(media.externalUrl, '_blank')}
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => deleteMutation.mutate(media.id)}
                                      disabled={deleteMutation.isPending}
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
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

        {/* Media Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0">
            {currentMedia && (
              <div className="flex flex-col h-full">
                <DialogHeader className="p-6 pb-4 border-b">
                  <div className="flex items-center justify-between">
                    <DialogTitle className="text-xl font-semibold">
                      {currentMedia.title || 'Untitled'}
                    </DialogTitle>
                    <div className="flex items-center space-x-2">
                      <Badge className={getMediaTypeColor(currentMedia.mediaType)}>
                        {getMediaIcon(currentMedia.mediaType)}
                        <span className="ml-1 capitalize">{currentMedia.mediaType}</span>
                      </Badge>
                      <Badge variant="outline">{currentMedia.category}</Badge>
                    </div>
                  </div>
                </DialogHeader>
                
                <div className="flex-1 flex flex-col">
                  <div className="flex-1 bg-black flex items-center justify-center relative">
                    {currentMedia.mediaType === 'image' && currentMedia.url && (
                      <img 
                        src={currentMedia.url} 
                        alt={currentMedia.title || 'Media file'} 
                        className="max-w-full max-h-full object-contain"
                      />
                    )}
                    {currentMedia.mediaType === 'video' && currentMedia.url && (
                      <video 
                        src={currentMedia.url} 
                        className="max-w-full max-h-full object-contain"
                        controls
                      />
                    )}
                    {currentMedia.mediaType === 'audio' && currentMedia.url && (
                      <div className="flex flex-col items-center justify-center space-y-4 text-white">
                        <Music className="h-24 w-24 text-gray-400" />
                        <audio src={currentMedia.url} controls className="w-full max-w-md" />
                      </div>
                    )}
                    
                    {/* Navigation buttons */}
                    {mediaFiles.length > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                          onClick={() => navigateMedia('prev')}
                          disabled={selectedMediaIndex === 0}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                          onClick={() => navigateMedia('next')}
                          disabled={selectedMediaIndex === mediaFiles.length - 1}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  
                  {/* Bottom info panel */}
                  <div className="p-6 border-t bg-white dark:bg-gray-900">
                    {currentMedia.description && (
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {currentMedia.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Uploaded on {new Date(currentMedia.createdAt).toLocaleDateString()}
                      </span>
                      
                      <div className="flex items-center space-x-2">
                        {currentMedia.externalUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(currentMedia.externalUrl, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Open Original
                          </Button>
                        )}
                        
                        {currentMedia.url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(currentMedia.url, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Thumbnail navigation */}
                  {mediaFiles.length > 1 && (
                    <div className="p-4 border-t bg-gray-50 dark:bg-gray-800">
                      <div className="flex space-x-2 overflow-x-auto">
                        {mediaFiles.map((media: MediaFile, index: number) => (
                          <div
                            key={media.id}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden cursor-pointer border-2 ${
                              index === selectedMediaIndex
                                ? 'border-blue-500'
                                : 'border-gray-200 dark:border-gray-700'
                            }`}
                            onClick={() => setSelectedMediaIndex(index)}
                          >
                            {media.mediaType === 'image' && media.url && (
                              <img 
                                src={media.url} 
                                alt={media.title || 'Media file'} 
                                className="w-full h-full object-cover"
                              />
                            )}
                            {media.mediaType === 'video' && media.url && (
                              <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                <Video className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                              </div>
                            )}
                            {media.mediaType === 'audio' && (
                              <div className="w-full h-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center">
                                <Music className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ThemeProvider>
  );
}