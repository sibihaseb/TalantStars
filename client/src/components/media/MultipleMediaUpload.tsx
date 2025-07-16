import React, { useState, useCallback, useRef } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  FileImage, 
  Play, 
  Music, 
  Video, 
  Trash2, 
  X,
  Image as ImageIcon,
  Film,
  Mic,
  Check,
  AlertCircle,
  Plus,
  Crown
} from "lucide-react";

interface MultipleMediaUploadProps {
  onUploadComplete?: (media: any[]) => void;
  maxFiles?: number;
  allowedTypes?: string[];
}

interface FileWithMetadata {
  file: File;
  id: string;
  title: string;
  description: string;
  category: string;
  preview?: string;
  uploading?: boolean;
  uploaded?: boolean;
  error?: string;
  progress?: number;
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

export function MultipleMediaUpload({ 
  onUploadComplete, 
  maxFiles = 10, 
  allowedTypes = ['image/*', 'video/*', 'audio/*']
}: MultipleMediaUploadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileWithMetadata[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="h-8 w-8 text-blue-500" />;
    if (mimeType.startsWith('video/')) return <Film className="h-8 w-8 text-red-500" />;
    if (mimeType.startsWith('audio/')) return <Mic className="h-8 w-8 text-green-500" />;
    return <FileImage className="h-8 w-8 text-gray-500" />;
  };

  const generateFilePreview = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve(null);
      }
    });
  };

  const handleFileSelect = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    
    if (selectedFiles.length + fileArray.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive"
      });
      return;
    }

    const newFiles: FileWithMetadata[] = [];
    
    for (const file of fileArray) {
      // Check file type
      const isAllowed = allowedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', '/'));
        }
        return file.type === type;
      });

      if (!isAllowed) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not supported`,
          variant: "destructive"
        });
        continue;
      }

      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 50MB limit`,
          variant: "destructive"
        });
        continue;
      }

      const preview = await generateFilePreview(file);
      
      newFiles.push({
        file,
        id: Math.random().toString(36).substr(2, 9),
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        description: '',
        category: 'portfolio',
        preview,
        uploading: false,
        uploaded: false,
        progress: 0
      });
    }

    setSelectedFiles(prev => [...prev, ...newFiles]);
  }, [selectedFiles, maxFiles, allowedTypes, toast]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  const removeFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  };

  const updateFileMetadata = (id: string, updates: Partial<FileWithMetadata>) => {
    setSelectedFiles(prev => prev.map(f => 
      f.id === id ? { ...f, ...updates } : f
    ));
  };

  const uploadMutation = useMutation({
    mutationFn: async (files: FileWithMetadata[]) => {
      const uploadedMedia = [];
      
      for (let i = 0; i < files.length; i++) {
        const fileData = files[i];
        
        // Update file status
        updateFileMetadata(fileData.id, { uploading: true, progress: 0 });
        
        try {
          const formData = new FormData();
          formData.append('file', fileData.file);
          formData.append('title', fileData.title);
          formData.append('description', fileData.description);
          formData.append('category', fileData.category);

          const response = await apiRequest('POST', '/api/media', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          const result = await response.json();
          
          updateFileMetadata(fileData.id, { 
            uploading: false, 
            uploaded: true, 
            progress: 100 
          });
          
          uploadedMedia.push(result);
          
        } catch (error: any) {
          // Handle tier limit errors specifically
          if (error.response && error.response.status === 400) {
            try {
              const errorData = await error.response.json();
              if (errorData.limitType) {
                // Show upgrade prompt for tier limits
                updateFileMetadata(fileData.id, { 
                  uploading: false, 
                  error: errorData.message 
                });
                
                toast({
                  title: "Upload Limit Reached",
                  description: errorData.message,
                  variant: "destructive",
                  action: (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = '/pricing'}
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade Plan
                    </Button>
                  ),
                });
                
                // Stop further uploads if limit reached
                break;
              }
            } catch (parseError) {
              // Fallback to generic error
              updateFileMetadata(fileData.id, { 
                uploading: false, 
                error: 'Upload failed' 
              });
            }
          } else {
            updateFileMetadata(fileData.id, { 
              uploading: false, 
              error: error instanceof Error ? error.message : 'Upload failed' 
            });
          }
        }
        
        // Update overall progress
        setUploadProgress(((i + 1) / files.length) * 100);
      }
      
      return uploadedMedia;
    },
    onSuccess: (uploadedMedia) => {
      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${uploadedMedia.length} files`,
      });
      
      // Invalidate media queries
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
      
      // Call completion callback
      if (onUploadComplete) {
        onUploadComplete(uploadedMedia);
      }
      
      // Reset form
      setSelectedFiles([]);
      setUploadProgress(0);
      setShowUploadDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: "destructive"
      });
    }
  });

  const handleUpload = () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    uploadMutation.mutate(selectedFiles);
  };

  const hasValidFiles = selectedFiles.length > 0;
  const canUpload = hasValidFiles && !uploading && selectedFiles.every(f => f.title.trim());

  return (
    <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Upload Multiple Files
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Multiple Media Files</DialogTitle>
          <DialogDescription>
            Upload up to {maxFiles} files. Supported formats: images, videos, and audio files.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium mb-2">
              Drag & drop files here, or click to select
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {selectedFiles.length}/{maxFiles} files selected
            </p>
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              Choose Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={allowedTypes.join(',')}
              onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>

          {/* File List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Selected Files ({selectedFiles.length})</h3>
              <div className="grid gap-4">
                {selectedFiles.map((fileData) => (
                  <Card key={fileData.id} className="p-4">
                    <div className="flex items-start gap-4">
                      {/* File Icon/Preview */}
                      <div className="flex-shrink-0">
                        {fileData.preview ? (
                          <img 
                            src={fileData.preview} 
                            alt={fileData.title}
                            className="h-16 w-16 object-cover rounded"
                          />
                        ) : (
                          getFileIcon(fileData.file.type)
                        )}
                      </div>
                      
                      {/* File Details */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor={`title-${fileData.id}`}>Title</Label>
                          <Input
                            id={`title-${fileData.id}`}
                            value={fileData.title}
                            onChange={(e) => updateFileMetadata(fileData.id, { title: e.target.value })}
                            placeholder="Enter title"
                            disabled={uploading}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`category-${fileData.id}`}>Category</Label>
                          <Select 
                            value={fileData.category} 
                            onValueChange={(value) => updateFileMetadata(fileData.id, { category: value })}
                            disabled={uploading}
                          >
                            <SelectTrigger>
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
                        
                        <div>
                          <Label htmlFor={`description-${fileData.id}`}>Description</Label>
                          <Textarea
                            id={`description-${fileData.id}`}
                            value={fileData.description}
                            onChange={(e) => updateFileMetadata(fileData.id, { description: e.target.value })}
                            placeholder="Optional description"
                            disabled={uploading}
                            rows={1}
                          />
                        </div>
                      </div>
                      
                      {/* Status & Actions */}
                      <div className="flex-shrink-0 flex items-center gap-2">
                        {fileData.uploading && (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                            <span className="text-sm">{fileData.progress}%</span>
                          </div>
                        )}
                        {fileData.uploaded && (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                        {fileData.error && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        {!uploading && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(fileData.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* File Info */}
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                      <span>{fileData.file.name}</span>
                      <span>{(fileData.file.size / (1024 * 1024)).toFixed(1)} MB</span>
                      <Badge variant="outline">{fileData.file.type}</Badge>
                    </div>
                    
                    {fileData.error && (
                      <div className="mt-2 text-sm text-red-600">
                        Error: {fileData.error}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading files...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowUploadDialog(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={!canUpload}
              className="flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload {selectedFiles.length} Files
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default MultipleMediaUpload;