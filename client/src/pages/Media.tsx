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
  Download,
  Edit,
  Save,
  MoreHorizontal,
  Filter,
  Search,
  Grid,
  List
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
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
  const [editingMedia, setEditingMedia] = useState<MediaFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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

  const editForm = useForm<UploadFormData>({
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
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress for large files
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 500);
      
      try {
        let response;
        
        if (data.file) {
          // For file uploads, use FormData
          const formData = new FormData();
          formData.append('title', data.title);
          formData.append('description', data.description || '');
          formData.append('category', data.category);
          formData.append('file', data.file);
          
          response = await apiRequest('POST', '/api/media', formData);
        } else if (data.externalUrl) {
          // For external URLs, use JSON
          response = await apiRequest('POST', '/api/media', {
            title: data.title,
            description: data.description || '',
            category: data.category,
            externalUrl: data.externalUrl
          });
        }
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 1000);
        
        return response.json();
      } catch (error) {
        clearInterval(progressInterval);
        setIsUploading(false);
        setUploadProgress(0);
        throw error;
      }
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

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<MediaFile> }) => {
      const response = await apiRequest('PUT', `/api/media/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      setEditingMedia(null);
      toast({
        title: "Success",
        description: "Media updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update media",
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
    if (uploadType === 'file' && !data.file) {
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
      file: uploadType === 'file' ? data.file : undefined,
    });
  };

  const onEditSubmit = (data: UploadFormData) => {
    if (!editingMedia) return;
    
    updateMutation.mutate({
      id: editingMedia.id,
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
      },
    });
  };

  const startEditing = (media: MediaFile) => {
    setEditingMedia(media);
    editForm.reset({
      title: media.title,
      description: media.description,
      category: media.category,
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
      : Math.min(filteredMedia.length - 1, selectedMediaIndex + 1);
    
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

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Filter and search media
  const filteredMedia = mediaFiles.filter((media: MediaFile) => {
    const matchesCategory = categoryFilter === 'all' || media.category === categoryFilter;
    const matchesSearch = searchQuery === '' || 
      media.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      media.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const currentMedia = selectedMediaIndex !== null ? filteredMedia[selectedMediaIndex] : null;

  const categories = ['all', 'portfolio', 'demo', 'headshot', 'resume', 'other'];
  const categoryCounts = categories.reduce((acc, category) => {
    acc[category] = category === 'all' 
      ? mediaFiles.length 
      : mediaFiles.filter((m: MediaFile) => m.category === category).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <Header />
        
        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="max-w-6xl mx-auto">
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
                <TabsTrigger value="gallery">My Gallery ({mediaFiles.length})</TabsTrigger>
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
                            <FormField
                              control={form.control}
                              name="file"
                              render={({ field: { onChange, value, ...field } }) => (
                                <FormItem>
                                  <FormLabel>Select File</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="file"
                                      accept="image/*,video/*,audio/*"
                                      className="mt-1 cursor-pointer"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        onChange(file);
                                      }}
                                      {...field}
                                    />
                                  </FormControl>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Supported formats: Images (JPG, PNG, GIF), Videos (MP4, MOV, AVI), Audio (MP3, WAV)
                                  </p>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
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

                        {isUploading && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Uploading...</span>
                              <span className="text-sm text-gray-600">{Math.round(uploadProgress)}%</span>
                            </div>
                            <Progress value={uploadProgress} className="w-full" />
                          </div>
                        )}

                        <Button 
                          type="submit" 
                          disabled={uploadMutation.isPending || isUploading}
                          className="w-full"
                        >
                          {isUploading ? 'Uploading...' : 'Upload Media'}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="gallery">
                <div className="space-y-6">
                  {/* Gallery Controls */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Search media..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10 w-64"
                            />
                          </div>
                          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Filter by category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(category => (
                                <SelectItem key={category} value={category}>
                                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)} ({categoryCounts[category]})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant={viewMode === 'grid' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                          >
                            <Grid className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={viewMode === 'list' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                          >
                            <List className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Gallery Content */}
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {searchQuery || categoryFilter !== 'all' 
                          ? `${filteredMedia.length} media files found` 
                          : `My Gallery (${mediaFiles.length} files)`}
                      </CardTitle>
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
                      ) : filteredMedia.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          {searchQuery || categoryFilter !== 'all' 
                            ? 'No media files match your search criteria'
                            : 'No media files uploaded yet'}
                        </div>
                      ) : (
                        <div className={viewMode === 'grid' 
                          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                          : "space-y-4"}>
                          {filteredMedia.map((media: MediaFile, index: number) => (
                            <Card key={media.id} className={`overflow-hidden group hover:shadow-lg transition-shadow ${
                              viewMode === 'list' ? 'flex' : ''
                            }`}>
                              <CardContent className="p-0">
                                <div className={`relative ${viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : ''}`}>
                                  {media.mediaType === 'image' && media.url && (
                                    <img 
                                      src={media.url} 
                                      alt={media.title || 'Media file'} 
                                      className={`object-cover cursor-pointer ${
                                        viewMode === 'list' ? 'w-32 h-32' : 'w-full h-48'
                                      }`}
                                      onClick={() => openModal(index)}
                                    />
                                  )}
                                  {media.mediaType === 'video' && media.url && (
                                    <div className="relative">
                                      <video 
                                        src={media.url} 
                                        className={`object-cover cursor-pointer ${
                                          viewMode === 'list' ? 'w-32 h-32' : 'w-full h-48'
                                        }`}
                                        onClick={() => openModal(index)}
                                      />
                                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Video className="h-12 w-12 text-white" />
                                      </div>
                                    </div>
                                  )}
                                  {media.mediaType === 'audio' && (
                                    <div className={`bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 flex items-center justify-center cursor-pointer group-hover:from-purple-200 group-hover:to-blue-200 dark:group-hover:from-purple-800 dark:group-hover:to-blue-800 transition-colors ${
                                      viewMode === 'list' ? 'w-32 h-32' : 'w-full h-48'
                                    }`}
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
                                
                                <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
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
                                      {truncateText(media.description, 100)}
                                    </p>
                                  )}
                                  
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {new Date(media.createdAt).toLocaleDateString()}
                                    </span>
                                    
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => startEditing(media)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
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
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Edit Media Dialog */}
        <Dialog open={editingMedia !== null} onOpenChange={() => setEditingMedia(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Media</DialogTitle>
            </DialogHeader>
            {editingMedia && (
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                  <FormField
                    control={editForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
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

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setEditingMedia(null)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </DialogContent>
        </Dialog>

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
                    {filteredMedia.length > 1 && (
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
                          disabled={selectedMediaIndex === filteredMedia.length - 1}
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
                        

                      </div>
                    </div>
                  </div>
                  
                  {/* Thumbnail navigation */}
                  {filteredMedia.length > 1 && (
                    <div className="p-4 border-t bg-gray-50 dark:bg-gray-800">
                      <div className="flex space-x-2 overflow-x-auto">
                        {filteredMedia.map((media: MediaFile, index: number) => (
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