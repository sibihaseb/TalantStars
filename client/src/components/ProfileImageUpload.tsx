import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, Crop, Save, X, Camera, ImageIcon } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface ProfileImageUploadProps {
  currentImage?: string;
  onImageUpdate?: (url: string) => void;
  mandatory?: boolean;
}

export default function ProfileImageUpload({ 
  currentImage, 
  onImageUpdate, 
  mandatory = false 
}: ProfileImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropData, setCropData] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest('POST', '/api/user/profile-image', formData, {
        headers: {
          // Don't set Content-Type for FormData - browser will set it with boundary
        }
      });
      return response.json();
    },
    onSuccess: (data) => {
      setShowCropper(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setCropData(null);
      
      if (onImageUpdate) {
        onImageUpdate(data.profileImageUrl);
      }
      
      // Invalidate queries to refresh user data
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      
      toast({
        title: "Success",
        description: "Profile image updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload profile image",
        variant: "destructive",
      });
    }
  });

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setShowCropper(true);
  }, [toast]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleCrop = useCallback(() => {
    if (!selectedFile || !cropData || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    if (!ctx) return;

    // Set canvas size to 16:9 aspect ratio (e.g., 1920x1080)
    const outputWidth = 1920;
    const outputHeight = 1080;
    canvas.width = outputWidth;
    canvas.height = outputHeight;

    // Calculate scale factors
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    // Draw the cropped image
    ctx.drawImage(
      img,
      cropData.x * scaleX,
      cropData.y * scaleY,
      cropData.width * scaleX,
      cropData.height * scaleY,
      0,
      0,
      outputWidth,
      outputHeight
    );

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const formData = new FormData();
        formData.append('profileImage', blob, 'profile-image.jpg');
        uploadMutation.mutate(formData);
      }
    }, 'image/jpeg', 0.9);
  }, [selectedFile, cropData, uploadMutation]);

  const handleImageLoad = () => {
    if (imageRef.current) {
      const img = imageRef.current;
      const rect = img.getBoundingClientRect();
      
      // Calculate 16:9 crop area centered on the image
      const aspectRatio = 16 / 9;
      let cropWidth = rect.width;
      let cropHeight = rect.width / aspectRatio;
      
      if (cropHeight > rect.height) {
        cropHeight = rect.height;
        cropWidth = rect.height * aspectRatio;
      }
      
      const x = (rect.width - cropWidth) / 2;
      const y = (rect.height - cropHeight) / 2;
      
      setCropData({
        x,
        y,
        width: cropWidth,
        height: cropHeight
      });
    }
  };

  const cancelCrop = () => {
    setShowCropper(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setCropData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Profile Image {mandatory && <span className="text-red-500">*</span>}
          </CardTitle>
          {mandatory && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              A profile image is required. Images will be automatically cropped to 16:9 aspect ratio.
            </p>
          )}
        </CardHeader>
        <CardContent>
          {/* Current Image Display */}
          {currentImage && !showCropper && (
            <div className="mb-4">
              <img
                src={currentImage}
                alt="Current profile"
                className="w-full max-w-md h-auto rounded-lg shadow-md"
                style={{ aspectRatio: '16/9', objectFit: 'cover' }}
              />
            </div>
          )}

          {/* File Upload Area */}
          {!showCropper && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 text-gray-400">
                  <ImageIcon className="w-full h-full" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    Drop your image here, or browse
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Supports JPG, PNG, GIF up to 10MB
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                    Images will be automatically cropped to 16:9 aspect ratio
                  </p>
                </div>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Image
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          )}

          {/* Crop Interface */}
          {showCropper && previewUrl && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Crop your image to 16:9 ratio
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Drag the crop area to adjust the selection
                </p>
              </div>
              
              <div className="relative max-w-2xl mx-auto">
                <div
                  ref={cropperRef}
                  className="relative inline-block"
                  style={{ maxWidth: '100%' }}
                >
                  <img
                    ref={imageRef}
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full h-auto"
                    onLoad={handleImageLoad}
                  />
                  
                  {/* Crop Overlay */}
                  {cropData && (
                    <div
                      className="absolute border-2 border-blue-500 bg-blue-500/20"
                      style={{
                        left: cropData.x,
                        top: cropData.y,
                        width: cropData.width,
                        height: cropData.height,
                        cursor: 'move'
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Crop className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  onClick={handleCrop}
                  disabled={uploadMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {uploadMutation.isPending ? 'Saving...' : 'Save & Crop'}
                </Button>
                <Button
                  variant="outline"
                  onClick={cancelCrop}
                  disabled={uploadMutation.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hidden canvas for cropping */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />
    </div>
  );
}