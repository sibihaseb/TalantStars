import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Crop, Image, Check, X } from 'lucide-react';
import ReactCrop, { Crop as CropType, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface HeroImageUploadProps {
  currentImage?: string;
  onImageUpdate?: (imageUrl: string) => void;
  aspectRatio?: number; // 16:9 = 1.777
}

export default function HeroImageUpload({ 
  currentImage, 
  onImageUpdate,
  aspectRatio = 16 / 9 // 16:9 aspect ratio by default
}: HeroImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadHeroImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('heroImage', file);
      
      console.log('📸 Uploading hero image to server...');
      console.log('📸 FormData entries:', Array.from(formData.entries()));
      
      const response = await fetch('/api/user/hero-image', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(error.error || 'Failed to upload hero image');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log('✅ Hero image upload successful:', data);
      toast({
        title: "Success!",
        description: "Hero image updated successfully",
      });
      
      // Update the UI with new image URL
      if (onImageUpdate && data.heroImageUrl) {
        onImageUpdate(data.heroImageUrl);
      }
      
      // Reset the form
      setSelectedFile(null);
      setPreviewUrl('');
      setShowCropper(false);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error) => {
      console.error('❌ Hero image upload failed:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload hero image",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('🖼️ Hero image file selected:', file.name, file.type, file.size);

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setShowCropper(true);
    
    // Initialize crop to 16:9 aspect ratio
    const initialCrop: CropType = {
      unit: '%',
      width: 100,
      height: 100 / aspectRatio,
      x: 0,
      y: 0,
    };
    setCrop(initialCrop);
  }, [toast, aspectRatio]);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    
    // Set initial crop to maintain 16:9 aspect ratio
    const cropHeight = width / aspectRatio;
    const yOffset = Math.max(0, (height - cropHeight) / 2);
    
    const initialCrop: CropType = {
      unit: 'px',
      width: width,
      height: Math.min(cropHeight, height),
      x: 0,
      y: yOffset,
    };
    
    setCrop(initialCrop);
  }, [aspectRatio]);

  const getCroppedImage = useCallback(() => {
    if (!completedCrop || !imageRef.current || !canvasRef.current) {
      return null;
    }

    const image = imageRef.current;
    const canvas = canvasRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    // Set canvas size to maintain 16:9 aspect ratio
    const cropWidth = crop.width * scaleX;
    const cropHeight = crop.height * scaleY;
    
    canvas.width = cropWidth;
    canvas.height = cropHeight;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    return new Promise<File>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'hero-image.jpg', {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          
          console.log('🎨 Cropped hero image created:', {
            width: cropWidth,
            height: cropHeight,
            aspectRatio: cropWidth / cropHeight,
            size: file.size
          });
          
          resolve(file);
        }
      }, 'image/jpeg', 0.95);
    });
  }, [completedCrop]);

  const handleUpload = async () => {
    try {
      const croppedFile = await getCroppedImage();
      if (croppedFile) {
        uploadHeroImageMutation.mutate(croppedFile);
      }
    } catch (error) {
      console.error('❌ Error creating cropped image:', error);
      toast({
        title: "Error",
        description: "Failed to process image",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setShowCropper(false);
    setCrop(undefined);
    setCompletedCrop(undefined);
    
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Background Image
        </CardTitle>
        <CardDescription>
          Upload a background image for your profile header (16:9 aspect ratio recommended)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Image Display */}
        {currentImage && !showCropper && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Current Background</label>
            <div 
              className="w-full h-32 bg-cover bg-center rounded-lg border border-gray-200"
              style={{ backgroundImage: `url(${currentImage})` }}
            />
          </div>
        )}

        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          data-testid="hero-file-input"
        />

        {/* Image Cropper */}
        {showCropper && previewUrl && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Crop Your Background Image (16:9 ratio)
              </label>
              <div className="text-xs text-gray-500">
                Drag to reposition • Resize corners to adjust
              </div>
            </div>
            
            <div className="max-h-96 overflow-hidden rounded-lg border">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectRatio}
                minHeight={100}
              >
                <img
                  ref={imageRef}
                  alt="Crop preview"
                  src={previewUrl}
                  onLoad={onImageLoad}
                  className="max-w-full h-auto"
                />
              </ReactCrop>
            </div>

            {/* Hidden canvas for cropping */}
            <canvas
              ref={canvasRef}
              className="hidden"
            />

            <div className="flex gap-2">
              <Button 
                onClick={handleUpload}
                disabled={uploadHeroImageMutation.isPending || !completedCrop}
                className="flex-1"
              >
                <Check className="h-4 w-4 mr-2" />
                {uploadHeroImageMutation.isPending ? 'Uploading...' : 'Upload Background'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={uploadHeroImageMutation.isPending}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Upload Button */}
        {!showCropper && (
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {currentImage ? 'Change Background Image' : 'Upload Background Image'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}