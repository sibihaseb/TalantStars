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
import { SafeImage } from './SafeImage';

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

interface FileMetadata {
  file: File;
  title: string;
  category: string;
  preview?: string;
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
  const [fileMetadata, setFileMetadata] = useState<FileMetadata[]>([]);
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
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const [verificationInProgress, setVerificationInProgress] = useState(false);
  const [uploadedMediaId, setUploadedMediaId] = useState<number | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string>('');
  
  const [mediaFormData, setMediaFormData] = useState<MediaFormData>({
    title: '',
    description: '',
    category: 'portfolio',
    files: [],
    externalUrl: ''
  });

  // Image resizing utility
  const resizeImage = (file: File, maxWidth: number = 1920, maxHeight: number = 1080): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        let { width, height } = img;
        
        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = height * (maxWidth / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = width * (maxHeight / height);
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(resizedFile);
          } else {
            resolve(file);
          }
        }, file.type, 0.85);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

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
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      
      // Trigger automatic verification for uploaded media
      if (data && data.length > 0) {
        const mediaId = data[0].id;
        setUploadedMediaId(mediaId);
        await verifyUpload(mediaId);
      }
    },
    onError: (error: any) => {
      setUploadInProgress(false);
      setVerificationInProgress(false);
      
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
      }
      // Error handling for individual files is done in form submit
    },
  });

  // External upload mutation (for single external URLs)
  const externalUploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/media/external", formData);
      return response.json();
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
      
      // Trigger automatic verification for external media
      if (data && data.id) {
        setUploadedMediaId(data.id);
        await verifyUpload(data.id);
      }
    },
    onError: (error: any) => {
      setUploadInProgress(false);
      setVerificationInProgress(false);
      
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
    setFileMetadata([]);
    setUploadType('file');
    setUploadInProgress(false);
    setVerificationInProgress(false);
    setUploadedMediaId(null);
    setVerificationStatus('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Verification function with retry logic
  const verifyUpload = async (mediaId: number, maxRetries = 10) => {
    setVerificationInProgress(true);
    setVerificationStatus('Starting verification...');
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        setVerificationStatus(`Verification attempt ${attempt}/${maxRetries}...`);
        
        const response = await apiRequest('POST', `/api/media/verify/${mediaId}`);
        const result = await response.json();
        
        console.log(`Verification attempt ${attempt} result:`, result);
        
        const isFullyVerified = result.exists && 
                               result.accessible && 
                               result.databaseConsistent && 
                               result.s3Accessible &&
                               result.databaseComplete;
        
        if (isFullyVerified) {
          setVerificationStatus('✓ Upload verified successfully!');
          setVerificationInProgress(false);
          
          // Success! Close dialog and show success message
          setShowUploadDialog(false);
          resetForm();
          
          toast({
            title: "Upload successful",
            description: "Your media has been uploaded and verified successfully.",
          });
          
          return true;
        } else {
          setVerificationStatus(`Attempt ${attempt}: ${result.errors.join(', ')}`);
        }
        
        // Wait before next attempt
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      } catch (error) {
        console.error(`Verification attempt ${attempt} failed:`, error);
        setVerificationStatus(`Attempt ${attempt}: Verification request failed`);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
    }
    
    // All attempts failed
    setVerificationStatus('❌ Upload verification failed after maximum retries');
    setVerificationInProgress(false);
    
    toast({
      title: "Upload verification failed",
      description: "The upload completed but couldn't be verified. Please try again.",
      variant: "destructive"
    });
    
    return false;
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

  const handleFileSelection = async (files: File[]) => {
    try {
      const processedFiles: File[] = [];
      const metadata: FileMetadata[] = [];
      const previews: string[] = [];
      
      for (const file of files) {
        let processedFile = file;
        
        // Resize images if they're too large
        if (file.type.startsWith('image/') && file.size > 2 * 1024 * 1024) { // 2MB threshold
          processedFile = await resizeImage(file);
        }
        
        processedFiles.push(processedFile);
        
        // Create metadata entry with default values
        metadata.push({
          file: processedFile,
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
          category: 'portfolio'
        });
        
        // Generate preview
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          const preview = await new Promise<string>((resolve) => {
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(processedFile);
          });
          previews.push(preview);
        } else {
          previews.push('');
        }
      }
      
      setSelectedFiles(processedFiles);
      setFileMetadata(metadata);
      setFilePreviews(previews);
      setMediaFormData(prev => ({ ...prev, files: processedFiles }));
    } catch (error) {
      console.error('Error processing files:', error);
      toast({
        title: "Error",
        description: "Failed to process files. Please try again.",
        variant: "destructive"
      });
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

  const handleFormSubmit = useCallback(async () => {
    console.log(`=== FORM SUBMIT TRIGGERED ===`);
    console.log(`Upload type: ${uploadType}`);
    console.log(`Selected files:`, selectedFiles);
    console.log(`File metadata:`, fileMetadata);
    console.log(`Media form data:`, mediaFormData);
    
    if (uploadType === 'file' && (!selectedFiles || selectedFiles.length === 0)) {
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

    // Set upload in progress
    setUploadInProgress(true);
    setVerificationStatus('');

    if (uploadType === 'file' && fileMetadata.length > 0) {
      // Upload files individually with their metadata
      let successfulUploads = 0;
      let failedUploads = 0;
      
      for (const meta of fileMetadata) {
        if (!meta.title.trim()) {
          toast({
            title: "Title required",
            description: `Please enter a title for ${meta.file.name}`,
            variant: "destructive",
          });
          setUploadInProgress(false);
          return;
        }

        const formData = new FormData();
        formData.append('title', meta.title);
        formData.append('description', mediaFormData.description || '');
        formData.append('category', meta.category);
        formData.append('file', meta.file);

        console.log(`=== PREPARING UPLOAD ===`);
        console.log(`File: ${meta.file.name} (${meta.file.size} bytes)`);
        console.log(`Title: ${meta.title}`);
        console.log(`Category: ${meta.category}`);
        console.log(`Description: ${mediaFormData.description || ''}`);

        try {
          console.log(`=== STARTING UPLOAD MUTATION ===`);
          await uploadMutation.mutateAsync(formData);
          console.log(`=== UPLOAD SUCCESS ===`);
          successfulUploads++;
        } catch (error) {
          console.error('=== UPLOAD FAILED ===');
          console.error('Upload failed for file:', meta.file.name, error);
          console.error('Error details:', error);
          failedUploads++;
          setUploadInProgress(false);
          setVerificationInProgress(false);
        }
      }
      
      // Note: Success handling is now done in the mutation onSuccess callback
      // which triggers automatic verification
    } else if (uploadType === 'external' && mediaFormData.externalUrl) {
      // Handle external URL upload
      const formData = new FormData();
      formData.append('title', mediaFormData.title);
      formData.append('description', mediaFormData.description);
      formData.append('category', mediaFormData.category);
      formData.append('url', mediaFormData.externalUrl);

      try {
        await externalUploadMutation.mutateAsync(formData);
      } catch (error) {
        setUploadInProgress(false);
        setVerificationInProgress(false);
      }
    }
  }, [mediaFormData, uploadType, uploadMutation, externalUploadMutation, toast, selectedFiles, fileMetadata, onUploadComplete, resetForm]);

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
    <div key={media.id} className="group relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all">
      {/* Media Preview */}
      <div className="aspect-video bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
        {media.mediaType === "image" ? (
          <SafeImage 
            src={media.url}
            alt={media.title || media.originalName}
            className="w-full h-full object-cover"
            fallbackClassName="w-full h-full"
            maxRetries={3}
            retryDelay={1000}
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
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openGallery(index)}
            className="bg-white/90 hover:bg-white text-gray-900 border-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteMutation.mutate(media.id)}
            className="bg-red-500/90 hover:bg-red-600 text-white border-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Media type badge */}
        <div className={`absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-medium text-white ${getMediaTypeColor(media.mediaType)}`}>
          {getMediaIcon(media.mediaType)}
          <span className="ml-1 capitalize">{media.mediaType}</span>
        </div>
      </div>
      
      {/* Media info */}
      <div className="p-4 space-y-2">
        <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm">
          {media.title || media.originalName}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
          {media.category?.replace('_', ' ') || 'Portfolio'}
        </p>
        {media.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
            {media.description}
          </p>
        )}
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            {media.isExternal && (
              <Badge variant="outline" className="text-xs">
                <ExternalLink className="h-3 w-3 mr-1" />
                External
              </Badge>
            )}
          </div>
          <span className="text-xs text-gray-400">
            {new Date(media.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Upload Section - Clean Modern Design */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Upload className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upload New Media</h2>
          </div>
          {showGallery && (
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <ImageIcon className="h-4 w-4" />
              <span>View All Media</span>
            </Button>
          )}
        </div>
        
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium text-base">
              <Plus className="h-5 w-5 mr-2" />
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
                        <div className="space-y-6">
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Total size: {(selectedFiles.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          
                          {/* Individual file metadata editing */}
                          <div className="space-y-4 max-h-96 overflow-y-auto">
                            {fileMetadata.map((meta, index) => (
                              <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="flex items-start space-x-4">
                                  {/* File preview */}
                                  <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 flex-shrink-0">
                                    {meta.file.type.startsWith('image/') && filePreviews[index] ? (
                                      <img src={filePreviews[index]} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
                                        {getMediaIcon(meta.file.type.split('/')[0])}
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* File details */}
                                  <div className="flex-1 space-y-3">
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {meta.file.name}
                                      </p>
                                      <div className="flex items-center space-x-2">
                                        {meta.file.type.startsWith('image/') && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleCropImage(meta.file)}
                                            className="h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full"
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
                                            const newMetadata = fileMetadata.filter((_, i) => i !== index);
                                            setSelectedFiles(newFiles);
                                            setFilePreviews(newPreviews);
                                            setFileMetadata(newMetadata);
                                            setMediaFormData(prev => ({ ...prev, files: newFiles }));
                                          }}
                                          className="h-8 w-8 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <div>
                                        <Label htmlFor={`file-title-${index}`} className="text-xs font-medium">Title</Label>
                                        <Input
                                          id={`file-title-${index}`}
                                          value={meta.title}
                                          onChange={(e) => {
                                            const newMetadata = [...fileMetadata];
                                            newMetadata[index] = { ...meta, title: e.target.value };
                                            setFileMetadata(newMetadata);
                                          }}
                                          placeholder="Enter title"
                                          className="mt-1 h-8"
                                        />
                                      </div>
                                      
                                      <div>
                                        <Label htmlFor={`file-category-${index}`} className="text-xs font-medium">Category</Label>
                                        <Select 
                                          value={meta.category} 
                                          onValueChange={(value) => {
                                            const newMetadata = [...fileMetadata];
                                            newMetadata[index] = { ...meta, category: value };
                                            setFileMetadata(newMetadata);
                                          }}
                                        >
                                          <SelectTrigger className="mt-1 h-8">
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
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="flex flex-col items-center justify-center py-8">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                              <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              Drop your files here or click to browse
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
                              Supported formats: Images (JPG, PNG, GIF), Videos (MP4, MOV, AVI), Audio (MP3, WAV, AAC)
                            </p>
                          </div>
                          
                          <div className="flex justify-center">
                            <Button
                              onClick={() => fileInputRef.current?.click()}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg"
                              size="lg"
                            >
                              <Camera className="h-5 w-5 mr-2" />
                              Choose Files
                            </Button>
                          </div>
                        </div>
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
                
                {/* External link form fields only shown for external uploads */}
                {uploadType === 'external' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="external-title">Title *</Label>
                        <Input
                          id="external-title"
                          value={mediaFormData.title}
                          onChange={(e) => setMediaFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter media title"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="external-category">Category</Label>
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
                      <Label htmlFor="external-description">Description</Label>
                      <Textarea
                        id="external-description"
                        value={mediaFormData.description}
                        onChange={(e) => setMediaFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter media description..."
                        rows={3}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
                
                {/* Upload Progress and Verification Status */}
                {(uploadInProgress || verificationInProgress) && (
                  <div className="border-t pt-4">
                    <div className="space-y-3">
                      {uploadInProgress && (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm text-gray-600">Uploading media...</span>
                        </div>
                      )}
                      
                      {verificationInProgress && (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm text-gray-600">Verifying upload...</span>
                        </div>
                      )}
                      
                      {verificationStatus && (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <p className="text-sm font-mono text-gray-700 dark:text-gray-300">
                            {verificationStatus}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowUploadDialog(false)}
                    disabled={uploadInProgress || verificationInProgress}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleFormSubmit}
                    disabled={uploadInProgress || verificationInProgress}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    {uploadInProgress ? 'Uploading...' : 
                     verificationInProgress ? 'Verifying...' : 
                     'Upload Media'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
      </div>

      {/* Gallery Section */}
      {showGallery && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ImageIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Media Gallery</h2>
              <Badge variant="secondary" className="ml-2">
                {mediaFiles.length} files
              </Badge>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-video bg-gray-300 dark:bg-gray-700 rounded-lg mb-3"></div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {mediaFiles.map((media, index) => renderMediaCard(media, index))}
              </div>
            )}
          </div>
        </div>
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