import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, Crop, Save, X, Camera, ImageIcon } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface HeroImageUploadProps {
  currentImage?: string;
  onImageUpdate?: (url: string) => void;
  aspectRatio?: number; // width/height ratio (e.g., 16/9 = 1.78)
}

export default function HeroImageUpload({ 
  currentImage, 
  onImageUpdate,
  aspectRatio = 16/9 // Default to 16:9 for hero images
}: HeroImageUploadProps) {
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
  const [isCropDragging, setIsCropDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Upload mutation for hero images
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      console.log('Uploading hero image to server...');
      const response = await apiRequest('POST', '/api/user/hero-image', formData);
      const result = await response.json();
      console.log('Hero image upload result:', result);
      return result;
    },
    onSuccess: (data) => {
      setShowCropper(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setCropData(null);
      
      if (onImageUpdate) {
        onImageUpdate(data.heroImageUrl);
      }
      
      // Invalidate queries to refresh user data
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      
      toast({
        title: "Success!",
        description: "Hero image uploaded successfully",
      });
    },
    onError: (error) => {
      console.error('Hero image upload failed:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload hero image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const initializeCropper = useCallback(() => {
    if (!imageRef.current || !cropperRef.current) return;

    const img = imageRef.current;
    const cropper = cropperRef.current;
    
    const imgRect = img.getBoundingClientRect();
    const containerRect = cropper.getBoundingClientRect();
    
    // Calculate crop area for the specified aspect ratio
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    
    let cropWidth, cropHeight;
    
    if (containerWidth / containerHeight > aspectRatio) {
      // Container is wider than desired ratio
      cropHeight = containerHeight * 0.8;
      cropWidth = cropHeight * aspectRatio;
    } else {
      // Container is taller than desired ratio
      cropWidth = containerWidth * 0.8;
      cropHeight = cropWidth / aspectRatio;
    }
    
    const x = (containerWidth - cropWidth) / 2;
    const y = (containerHeight - cropHeight) / 2;
    
    setCropData({ x, y, width: cropWidth, height: cropHeight });
  }, [aspectRatio]);

  const handleCropSubmit = async () => {
    if (!selectedFile || !cropData || !imageRef.current || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    if (!ctx) return;

    // Get the actual image dimensions
    const imgRect = img.getBoundingClientRect();
    const scaleX = img.naturalWidth / imgRect.width;
    const scaleY = img.naturalHeight / imgRect.height;

    // Calculate actual crop coordinates
    const actualCrop = {
      x: cropData.x * scaleX,
      y: cropData.y * scaleY,
      width: cropData.width * scaleX,
      height: cropData.height * scaleY,
    };

    // Set canvas size to desired output size (larger for hero images)
    canvas.width = 1920; // HD width for hero images
    canvas.height = 1920 / aspectRatio; // Maintain aspect ratio

    // Draw the cropped image
    ctx.drawImage(
      img,
      actualCrop.x,
      actualCrop.y,
      actualCrop.width,
      actualCrop.height,
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const formData = new FormData();
        formData.append('files', blob, `hero-${selectedFile.name}`);
        uploadMutation.mutate(formData);
      }
    }, 'image/jpeg', 0.9);
  };

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsCropDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!isCropDragging || !cropData || !cropperRef.current) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    const containerRect = cropperRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(containerRect.width - cropData.width, cropData.x + deltaX));
    const newY = Math.max(0, Math.min(containerRect.height - cropData.height, cropData.y + deltaY));

    setCropData({ ...cropData, x: newX, y: newY });
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isCropDragging, cropData, dragStart]);

  const handleDragEnd = useCallback(() => {
    setIsCropDragging(false);
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Hero Background Image
          <span className="text-sm font-normal text-gray-500">
            (Recommended: {aspectRatio === 16/9 ? '16:9' : `${aspectRatio.toFixed(2)}:1`} ratio)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Image Preview */}
        {currentImage && !showCropper && (
          <div className="relative">
            <img 
              src={currentImage} 
              alt="Current hero image" 
              className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
              style={{ aspectRatio }}
            />
            <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
              Current
            </div>
          </div>
        )}

        {/* File Input */}
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="w-full"
            variant="outline"
          >
            <Camera className="w-4 h-4 mr-2" />
            {currentImage ? 'Change Hero Image' : 'Upload Hero Image'}
          </Button>
        </div>

        {/* Cropper */}
        {showCropper && previewUrl && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Crop your hero image to {aspectRatio === 16/9 ? '16:9' : `${aspectRatio.toFixed(2)}:1`} ratio:
            </div>
            
            <div 
              ref={cropperRef}
              className="relative w-full h-80 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100"
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
            >
              <img
                ref={imageRef}
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-contain"
                onLoad={initializeCropper}
                draggable={false}
              />
              
              {cropData && (
                <div
                  className="absolute border-2 border-blue-500 bg-blue-500/20 cursor-move"
                  style={{
                    left: cropData.x,
                    top: cropData.y,
                    width: cropData.width,
                    height: cropData.height,
                  }}
                  onMouseDown={handleDragStart}
                >
                  <div className="absolute -top-8 left-0 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                    Hero Image Area
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCropSubmit}
                disabled={uploadMutation.isPending || !cropData}
                className="flex-1"
              >
                {uploadMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Hero Image
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => {
                  setShowCropper(false);
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setCropData(null);
                }}
                variant="outline"
                disabled={uploadMutation.isPending}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
}