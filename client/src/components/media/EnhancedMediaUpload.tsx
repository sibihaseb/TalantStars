import React, { useState, useCallback, useRef } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  Camera, 
  Link, 
  FileImage, 
  Play, 
  Music, 
  Video, 
  Trash2, 
  Edit,
  Eye,
  ExternalLink,
  Plus,
  X,
  Image as ImageIcon,
  Film,
  Mic,
  Globe,
  Crop,
  Scissors
} from "lucide-react";
import { UpgradePrompt } from "@/components/upgrade/UpgradePrompt";
import MediaGallery from './MediaGallery';
import ImageCropper from './ImageCropper';

interface MediaUploadProps {
  onUploadComplete?: (media: any) => void;
  showGallery?: boolean;
}

interface MediaFormData {
  title: string;
  description: string;
  category: string;
  files?: File[];
  externalUrl?: string;
}

const categories = [
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'headshots', label: 'Headshots' },
  { value: 'demo_reel', label: 'Demo Reel' },
  { value: 'voice_samples', label: 'Voice Samples' },
  { value: 'behind_scenes', label: 'Behind the Scenes' },
  { value: 'testimonials', label: 'Testimonials' },
  { value: 'press', label: 'Press & Media' },
  { value: 'other', label: 'Other' }
];

export function EnhancedMediaUpload({ onUploadComplete, showGallery = true }: MediaUploadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadType, setUploadType] = useState<'file' | 'external'>('file');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradePromptData, setUpgradePromptData] = useState<{
    limitType: 'photos' | 'videos' | 'audio' | 'external_links' | 'storage';
    currentCount: number;
    maxAllowed: number;
    currentPlan?: string;
  } | null>(null);
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<File | null>(null);
  
  const [mediaFormData, setMediaFormData] = useState<MediaFormData>({
    title: '',
    description: '',
    category: 'portfolio',
    files: [],
    externalUrl: ''
  });

  // Fetch user media
  const { data: mediaFiles = [], isLoading } = useQuery({
    queryKey: ["/api/media"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/media");
      return response.json();
    },
    enabled: !!user && showGallery
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/media", formData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      onUploadComplete?.(data);
      setShowUploadDialog(false);
      resetForm();
      const fileCount = Array.isArray(data) ? data.length : 1;
      toast({
        title: "Upload successful",
        description: `${fileCount} file${fileCount > 1 ? 's' : ''} uploaded successfully.`,
      });
    },
    onError: (error: any) => {
      // Parse error response for limit information
      let errorData = error;
      if (error.response) {
        try {
          errorData = typeof error.response === 'string' ? JSON.parse(error.response) : error.response;
        } catch (e) {
          errorData = error;
        }
      }
      
      // Check if error is related to limits
      if (errorData.limitType && errorData.currentCount !== undefined && errorData.maxAllowed !== undefined) {
        setUpgradePromptData({
          limitType: errorData.limitType as 'photos' | 'videos' | 'audio' | 'external_links' | 'storage',
          currentCount: errorData.currentCount,
          maxAllowed: errorData.maxAllowed,
          currentPlan: 'Free' // TODO: Get actual plan from user data
        });
        setShowUpgradePrompt(true);
      } else {
        toast({
          title: "Upload failed",
          description: errorData.message || error.message || 'Upload failed',
          variant: "destructive",
        });
      }
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (mediaId: number) => {
      await apiRequest("DELETE", `/api/media/${mediaId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      toast({
        title: "Media deleted",
        description: "Media file has been removed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setMediaFormData({
      title: '',
      description: '',
      category: 'portfolio',
      files: [],
      externalUrl: ''
    });
    setSelectedFiles([]);
    setFilePreviews([]);
    setUploadType('file');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileList = Array.from(e.dataTransfer.files);
      handleFileSelection(fileList);
    }
  }, []);

  const handleFileSelection = (files: File[]) => {
    setSelectedFiles(files);
    setMediaFormData(prev => ({ ...prev, files }));
    
    // Create previews
    const previews: string[] = [];
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previews[index] = e.target?.result as string;
        if (previews.length === files.length) {
          setFilePreviews([...previews]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    // Auto-fill title if empty - use first file name
    if (!mediaFormData.title && files.length > 0) {
      setMediaFormData(prev => ({ 
        ...prev, 
        title: files.length === 1 ? files[0].name.replace(/\.[^/.]+$/, "") : `${files.length} files selected`
      }));
    }
  };

  const handleCropImage = (file: File) => {
    setImageToCrop(file);
    setShowImageCropper(true);
  };

  const handleCropComplete = (croppedFile: File) => {
    // Replace the original file with the cropped one
    const fileIndex = selectedFiles.findIndex(f => f === imageToCrop);
    if (fileIndex !== -1) {
      const newFiles = [...selectedFiles];
      newFiles[fileIndex] = croppedFile;
      setSelectedFiles(newFiles);
      setMediaFormData(prev => ({ ...prev, files: newFiles }));
      
      // Update preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const newPreviews = [...filePreviews];
        newPreviews[fileIndex] = e.target?.result as string;
        setFilePreviews(newPreviews);
      };
      reader.readAsDataURL(croppedFile);
    }
    
    setImageToCrop(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files);
      handleFileSelection(fileList);
    }
  };

  const handleFormSubmit = useCallback(() => {
    if (!mediaFormData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your media",
        variant: "destructive",
      });
      return;
    }

    if (uploadType === 'file' && (!mediaFormData.files || mediaFormData.files.length === 0)) {
      toast({
        title: "Files required",
        description: "Please select one or more files to upload",
        variant: "destructive",
      });
      return;
    }

    if (uploadType === 'external' && !mediaFormData.externalUrl?.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('title', mediaFormData.title);
    formData.append('description', mediaFormData.description);
    formData.append('category', mediaFormData.category);
    
    if (uploadType === 'file' && mediaFormData.files) {
      // Append multiple files
      mediaFormData.files.forEach((file) => {
        formData.append('files', file);
      });
    } else if (uploadType === 'external' && mediaFormData.externalUrl) {
      formData.append('externalUrl', mediaFormData.externalUrl);
    }

    uploadMutation.mutate(formData);
  }, [mediaFormData, uploadType, uploadMutation, toast]);

  const getMediaIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'audio':
        return <Mic className="h-4 w-4" />;
      default:
        return <FileImage className="h-4 w-4" />;
    }
  };

  const getMediaTypeColor = (mediaType: string) => {
    switch (mediaType) {
      case 'image':
        return 'bg-blue-500';
      case 'video':
        return 'bg-purple-500';
      case 'audio':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const openGallery = (index: number) => {
    setGalleryStartIndex(index);
    setGalleryOpen(true);
  };

  const renderMediaCard = (media: any, index: number) => (
    <Card key={media.id} className="group relative overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 relative overflow-hidden">
          {media.mediaType === "image" ? (
            <img 
              src={media.url} 
              alt={media.title || media.originalName}
              className="w-full h-full object-cover"
            />
          ) : media.mediaType === "video" ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
              <Play className="h-8 w-8 text-white" />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-blue-500">
              <Music className="h-8 w-8 text-white" />
            </div>
          )}
          
          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => openGallery(index)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteMutation.mutate(media.id)}
              className="bg-red-500/80 hover:bg-red-500 text-white"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Media type badge */}
          <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium text-white ${getMediaTypeColor(media.mediaType)}`}>
            {getMediaIcon(media.mediaType)}
            <span className="ml-1 capitalize">{media.mediaType}</span>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {media.title || media.originalName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {media.category.replace('_', ' ')}
              </p>
              {media.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                  {media.description}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-2">
              {media.isExternal && (
                <Badge variant="outline" className="text-xs">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  External
                </Badge>
              )}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(media.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="border-2 border-dashed border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5 text-blue-600" />
            <span>Upload New Media</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add New Media
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                  <span>Upload Media</span>
                </DialogTitle>
                <DialogDescription>
                  Upload images, videos, audio files, or add external links to your media gallery.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Upload Type Selector */}
                <Tabs value={uploadType} onValueChange={(value) => setUploadType(value as 'file' | 'external')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="file" className="flex items-center space-x-2">
                      <Camera className="h-4 w-4" />
                      <span>Upload File</span>
                    </TabsTrigger>
                    <TabsTrigger value="external" className="flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <span>External Link</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="file" className="space-y-4 mt-6">
                    {/* File Upload Area */}
                    <div
                      className={`
                        border-2 border-dashed rounded-lg p-8 text-center transition-colors
                        ${dragActive 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                        }
                      `}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      {selectedFiles.length > 0 ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {selectedFiles.map((file, index) => (
                              <div key={index} className="relative">
                                <div className="w-24 h-24 mx-auto rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                                  {file.type.startsWith('image/') && filePreviews[index] ? (
                                    <img src={filePreviews[index]} alt="Preview" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
                                      {getMediaIcon(file.type.split('/')[0])}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Optional crop button for images */}
                                {file.type.startsWith('image/') && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCropImage(file)}
                                    className="absolute -top-2 -left-2 h-6 w-6 p-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full"
                                    title="Crop image (optional)"
                                  >
                                    <Crop className="h-3 w-3" />
                                  </Button>
                                )}
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newFiles = selectedFiles.filter((_, i) => i !== index);
                                    const newPreviews = filePreviews.filter((_, i) => i !== index);
                                    setSelectedFiles(newFiles);
                                    setFilePreviews(newPreviews);
                                    setMediaFormData(prev => ({ ...prev, files: newFiles }));
                                  }}
                                  className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                                <p className="text-xs text-center mt-2 text-gray-600 dark:text-gray-400 truncate">
                                  {file.name}
                                </p>
                              </div>
                            ))}
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Total size: {(selectedFiles.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <FileImage className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
                            Drag and drop your media files here
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            or click to browse
                          </p>
                          <Button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Select Files
                          </Button>
                        </>
                      )}
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*,audio/*"
                        onChange={handleFileInputChange}
                        className="hidden"
                        multiple
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="external" className="space-y-4 mt-6">
                    {/* External URL Input */}
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Globe className="h-5 w-5 text-blue-600" />
                          <h3 className="font-medium text-blue-900 dark:text-blue-100">External Media</h3>
                        </div>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          Add media from YouTube, Vimeo, SoundCloud, or any other platform
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="external-url">Media URL</Label>
                        <Input
                          id="external-url"
                          type="url"
                          placeholder="https://www.youtube.com/watch?v=..."
                          value={mediaFormData.externalUrl || ''}
                          onChange={(e) => setMediaFormData(prev => ({ ...prev, externalUrl: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                {/* Media Information Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={mediaFormData.title}
                      onChange={(e) => setMediaFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter media title"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={mediaFormData.category} 
                      onValueChange={(value) => setMediaFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={mediaFormData.description}
                    onChange={(e) => setMediaFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter media description..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowUploadDialog(false)}
                    disabled={uploadMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleFormSubmit}
                    disabled={uploadMutation.isPending}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    {uploadMutation.isPending ? 'Uploading...' : 'Upload Media'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Gallery Section */}
      {showGallery && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ImageIcon className="h-5 w-5" />
              <span>Media Gallery</span>
              <Badge variant="secondary" className="ml-2">
                {mediaFiles.length} files
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-video bg-gray-300 dark:bg-gray-700 rounded-lg mb-2"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : mediaFiles.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Upload className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No media files uploaded yet</p>
                <p className="text-sm">Upload your first media to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {mediaFiles.map((media, index) => renderMediaCard(media, index))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Media Gallery Modal */}
      <MediaGallery 
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        mediaItems={mediaFiles}
        initialIndex={galleryStartIndex}
      />

      {/* Upgrade Prompt */}
      {showUpgradePrompt && upgradePromptData && (
        <UpgradePrompt
          isOpen={showUpgradePrompt}
          onClose={() => setShowUpgradePrompt(false)}
          limitType={upgradePromptData.limitType}
          currentCount={upgradePromptData.currentCount}
          maxAllowed={upgradePromptData.maxAllowed}
          currentPlan={upgradePromptData.currentPlan}
        />
      )}

      {/* Image Cropper */}
      {showImageCropper && imageToCrop && (
        <ImageCropper
          isOpen={showImageCropper}
          onClose={() => setShowImageCropper(false)}
          imageFile={imageToCrop}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}

export default EnhancedMediaUpload;