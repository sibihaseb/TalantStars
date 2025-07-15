import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n";
import { User, Camera, Upload, X, Crop, Check } from 'lucide-react';

interface ProfileImageUploadProps {
  currentImageUrl?: string;
  userId: string;
  onImageUpdate: (imageUrl: string) => void;
  mandatory?: boolean;
}

const REQUIRED_ASPECT_RATIO = 1; // 1:1 square aspect ratio
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export function ProfileImageUpload({ 
  currentImageUrl, 
  userId, 
  onImageUpdate,
  mandatory = false
}: ProfileImageUploadProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [cropping, setCropping] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'profile');
      formData.append('userId', userId);

      const response = await apiRequest('POST', '/api/media/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      return response.json();
    },
    onSuccess: (data) => {
      onImageUpdate(data.url);
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      toast({
        title: t('profileImageUpdated'),
        description: mandatory ? "Your profile image has been set!" : "Profile image updated successfully",
      });
      setSelectedFile(null);
      setPreview(null);
      setUploadProgress(0);
    },
    onError: (error) => {
      toast({
        title: t('uploadError'),
        description: error.message,
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: t('fileTooLarge'),
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      toast({
        title: t('invalidFileType'),
        description: "Please upload a JPG, PNG, or WebP image",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, [toast, t]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxFiles: 1,
    disabled: uploadMutation.isPending
  });

  const cropImage = useCallback(() => {
    if (!imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const image = imageRef.current;
    
    if (!ctx) return;

    // Calculate crop dimensions for 1:1 aspect ratio
    const minDimension = Math.min(image.naturalWidth, image.naturalHeight);
    const cropX = (image.naturalWidth - minDimension) / 2;
    const cropY = (image.naturalHeight - minDimension) / 2;
    
    // Set canvas dimensions
    canvas.width = 400; // Standard profile image size
    canvas.height = 400;
    
    // Draw cropped image
    ctx.drawImage(
      image,
      cropX, cropY, minDimension, minDimension,
      0, 0, 400, 400
    );
    
    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], selectedFile?.name || 'profile.jpg', {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        uploadMutation.mutate(croppedFile);
      }
    }, 'image/jpeg', 0.9);
  }, [selectedFile, uploadMutation]);

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
    setCropping(false);
    setUploadProgress(0);
  };

  const hasValidImage = currentImageUrl && !currentImageUrl.includes('placeholder');

  return (
    <Card className={`w-full max-w-md mx-auto ${mandatory && !hasValidImage ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          {t('profileImage')}
          {mandatory && <Badge variant="destructive" className="text-xs">Required</Badge>}
        </CardTitle>
        {mandatory && !hasValidImage && (
          <p className="text-sm text-red-600 dark:text-red-400">
            A 1:1 profile image is required to complete your profile
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Image Display */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
              {currentImageUrl ? (
                <img 
                  src={currentImageUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/api/placeholder/128/128';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
            {hasValidImage && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                <Check className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>

        {/* Upload Interface */}
        {!preview && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-300 hover:border-primary'
            } ${uploadMutation.isPending ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isDragActive ? 'Drop the image here' : 'Drag & drop an image or click to select'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              JPG, PNG, or WebP • Max 5MB • Will be cropped to 1:1 square
            </p>
          </div>
        )}

        {/* Preview and Crop */}
        {preview && (
          <div className="space-y-4">
            <div className="relative">
              <img 
                ref={imageRef}
                src={preview} 
                alt="Preview" 
                className="w-full max-h-64 object-contain rounded-lg"
                onLoad={() => setCropping(true)}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 border-2 border-white shadow-lg rounded-full pointer-events-none">
                  <div className="w-full h-full border-2 border-primary rounded-full"></div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 justify-center">
              <Button
                onClick={cropImage}
                disabled={uploadMutation.isPending}
                className="flex items-center gap-2"
              >
                <Crop className="h-4 w-4" />
                {uploadMutation.isPending ? 'Uploading...' : 'Crop & Upload'}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={uploadMutation.isPending}
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploadMutation.isPending && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {/* Hidden canvas for cropping */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Requirements */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Image will be automatically cropped to 1:1 square format</p>
          <p>• Recommended minimum size: 400x400 pixels</p>
          <p>• Supported formats: JPG, PNG, WebP</p>
        </div>
      </CardContent>
    </Card>
  );
}