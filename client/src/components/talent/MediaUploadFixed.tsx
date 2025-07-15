import React, { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Upload, 
  FileImage, 
  Link, 
  Camera, 
  Save, 
  Folder, 
  Play, 
  Music, 
  Trash2 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface MediaUploadProps {
  onUploadComplete?: (media: any) => void;
  showGallery?: boolean;
}

interface MediaFormData {
  title: string;
  description: string;
  category: string;
  file?: File | null;
  externalUrl?: string;
  aspectRatio?: string;
}

export function MediaUpload({ onUploadComplete, showGallery = true }: MediaUploadProps) {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showExternalDialog, setShowExternalDialog] = useState(false);
  const [uploadType, setUploadType] = useState<'file' | 'external'>('file');
  const [dragActive, setDragActive] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<string>('custom');
  const [mediaFormData, setMediaFormData] = useState<MediaFormData>({
    title: '',
    description: '',
    category: 'portfolio',
    file: null,
    externalUrl: '',
    aspectRatio: 'custom'
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      toast({
        title: "Upload successful",
        description: "Your media has been uploaded successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
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
      file: null,
      externalUrl: '',
      aspectRatio: 'custom'
    });
    setAspectRatio('custom');
  };

  const handleFileSelect = useCallback((file: File) => {
    setMediaFormData(prev => ({ ...prev, file }));
  }, []);

  const handleFormSubmit = useCallback(() => {
    if (!mediaFormData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your media",
        variant: "destructive",
      });
      return;
    }

    if (uploadType === 'file' && !mediaFormData.file) {
      toast({
        title: "File required",
        description: "Please select a file to upload",
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
    
    if (uploadType === 'file' && mediaFormData.file) {
      formData.append('file', mediaFormData.file);
    } else if (uploadType === 'external' && mediaFormData.externalUrl) {
      formData.append('externalUrl', mediaFormData.externalUrl);
    }

    uploadMutation.mutate(formData);
  }, [mediaFormData, uploadType, uploadMutation, toast]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const renderMediaCard = (media: any) => (
    <Card key={media.id} className="group relative overflow-hidden">
      <CardContent className="p-4">
        <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 relative overflow-hidden">
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
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => deleteMutation.mutate(media.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {media.title || media.originalName}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {media.category}
        </p>
        {media.externalUrl && (
          <Badge variant="outline" className="mt-2">
            External Link
          </Badge>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Enhanced Upload Dialog */}
      <Card className="border-2 border-dashed border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5 text-blue-600" />
            <span>Upload New Media</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <Camera className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Upload className="h-5 w-5 text-blue-600" />
                    <span>Upload Media</span>
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Upload Type Selection */}
                  <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => setUploadType('file')}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        uploadType === 'file' 
                          ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' 
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Camera className="h-4 w-4 mr-2 inline" />
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadType('external')}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        uploadType === 'external' 
                          ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' 
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Link className="h-4 w-4 mr-2 inline" />
                      External Link
                    </button>
                  </div>

                  {/* File Upload Section */}
                  {uploadType === 'file' && (
                    <div className="space-y-4">
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
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,video/*,audio/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileSelect(file);
                          }}
                          className="hidden"
                        />
                      </div>

                      {mediaFormData.file && (
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <FileImage className="h-5 w-5 text-blue-600 mr-3" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {mediaFormData.file.name}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* External URL Section */}
                  {uploadType === 'external' && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Link className="h-4 w-4 text-blue-600" />
                          <h3 className="font-medium text-blue-900 dark:text-blue-100">Add External Media</h3>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Add videos from YouTube, Vimeo, Instagram, TikTok, or other platforms
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
                  )}

                  {/* Media Details Form */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="media-title">Title *</Label>
                      <Input
                        id="media-title"
                        placeholder="Enter a title for your media"
                        value={mediaFormData.title}
                        onChange={(e) => setMediaFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="media-description">Description</Label>
                      <Textarea
                        id="media-description"
                        placeholder="Add a description for your media"
                        rows={3}
                        value={mediaFormData.description}
                        onChange={(e) => setMediaFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="media-category">Category</Label>
                      <Select value={mediaFormData.category} onValueChange={(value) => setMediaFormData(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="portfolio">Portfolio</SelectItem>
                          <SelectItem value="headshots">Headshots</SelectItem>
                          <SelectItem value="demo_reel">Demo Reel</SelectItem>
                          <SelectItem value="voice_samples">Voice Samples</SelectItem>
                          <SelectItem value="behind_the_scenes">Behind the Scenes</SelectItem>
                          <SelectItem value="training">Training</SelectItem>
                          <SelectItem value="testimonials">Testimonials</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Image Cropping Options */}
                    {uploadType === 'file' && mediaFormData.file?.type.startsWith('image/') && (
                      <div>
                        <Label htmlFor="aspect-ratio">Aspect Ratio (for images)</Label>
                        <Select value={aspectRatio} onValueChange={setAspectRatio}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="custom">Custom</SelectItem>
                            <SelectItem value="1x1">Square (1:1)</SelectItem>
                            <SelectItem value="4x3">Standard (4:3)</SelectItem>
                            <SelectItem value="16x9">Widescreen (16:9)</SelectItem>
                            <SelectItem value="2x3">Portrait (2:3)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Upload Button */}
                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowUploadDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleFormSubmit}
                      disabled={uploadMutation.isPending}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {uploadMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          Uploading...
                        </div>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Upload Media
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" className="flex-1" onClick={() => setShowExternalDialog(true)}>
              <Link className="h-4 w-4 mr-2" />
              Add External Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Section */}
      {showGallery && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Folder className="h-5 w-5" />
              <span>My Gallery</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-video bg-gray-300 rounded-lg mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : mediaFiles.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No media files uploaded yet</p>
                <p className="text-sm">Upload your first media to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mediaFiles.map(renderMediaCard)}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}