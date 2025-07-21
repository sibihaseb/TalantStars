import { useState, useRef, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  Upload, 
  Image as ImageIcon, 
  Crop as CropIcon, 
  Sparkles,
  Palette,
  Monitor,
  Square,
  RectangleHorizontal,
  Scissors,
  Check,
  X,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Maximize2
} from 'lucide-react';

interface CropPreset {
  name: string;
  aspect: number;
  icon: any;
  description: string;
}

const cropPresets: CropPreset[] = [
  {
    name: "16:9 Widescreen",
    aspect: 16/9,
    icon: RectangleHorizontal,
    description: "Perfect for hero banners and covers"
  },
  {
    name: "1:1 Square", 
    aspect: 1,
    icon: Square,
    description: "Ideal for profile images"
  },
  {
    name: "4:3 Standard",
    aspect: 4/3,
    icon: Monitor,
    description: "Classic photo format"
  }
];

export function HeroBannerUpload({ onUploadSuccess }: { onUploadSuccess?: (url: string) => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [activePreset, setActivePreset] = useState<CropPreset>(cropPresets[0]);
  const [isCustomCrop, setIsCustomCrop] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const resetState = () => {
    setSelectedFile(null);
    setImageSrc('');
    setCrop(undefined);
    setCompletedCrop(undefined);
    setActivePreset(cropPresets[0]);
    setIsCustomCrop(false);
    setUploadProgress(0);
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPG, PNG, GIF, WebP)",
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
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageSrc(result);
    };
    reader.readAsDataURL(file);
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const aspectRatio = activePreset.aspect;
    
    // Create initial crop based on selected preset
    let cropWidth = width;
    let cropHeight = width / aspectRatio;
    
    if (cropHeight > height) {
      cropHeight = height;
      cropWidth = height * aspectRatio;
    }

    const x = (width - cropWidth) / 2;
    const y = (height - cropHeight) / 2;

    const newCrop: Crop = {
      unit: 'px',
      width: cropWidth,
      height: cropHeight,
      x,
      y,
    };

    setCrop(newCrop);
  }, [activePreset]);

  const getCroppedImg = useCallback(async (): Promise<Blob | null> => {
    if (!completedCrop || !imageRef.current || !canvasRef.current) return null;

    const image = imageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.save();

    // Apply transformations
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height,
    );

    ctx.restore();

    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.9);
    });
  }, [completedCrop, rotation, flipHorizontal, flipVertical]);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile || !completedCrop) throw new Error('No file or crop selected');
      
      const croppedBlob = await getCroppedImg();
      if (!croppedBlob) throw new Error('Failed to crop image');

      const formData = new FormData();
      const croppedFile = new File([croppedBlob], selectedFile.name, { type: 'image/jpeg' });
      formData.append('heroImage', croppedFile);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      try {
        // Use hero image specific endpoint that uploads to Wasabi
        const response = await fetch('/api/user/hero-image', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (!response.ok) throw new Error('Upload failed');
        
        const result = await response.json();
        return result;
      } catch (error) {
        clearInterval(progressInterval);
        throw error;
      }
    },
    onSuccess: (result) => {
      toast({
        title: "Hero Banner Uploaded!",
        description: `Your ${activePreset.name} hero banner has been uploaded successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      onUploadSuccess?.(result.url);
      setIsOpen(false);
      resetState();
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload your hero banner. Please try again.",
        variant: "destructive",
      });
      setUploadProgress(0);
    }
  });

  const handleCropPresetChange = (preset: CropPreset) => {
    setActivePreset(preset);
    setIsCustomCrop(false);
    
    if (imageRef.current) {
      const { width, height } = imageRef.current;
      const aspectRatio = preset.aspect;
      
      let cropWidth = width;
      let cropHeight = width / aspectRatio;
      
      if (cropHeight > height) {
        cropHeight = height;
        cropWidth = height * aspectRatio;
      }

      const x = (width - cropWidth) / 2;
      const y = (height - cropHeight) / 2;

      const newCrop: Crop = {
        unit: 'px',
        width: cropWidth,
        height: cropHeight,
        x,
        y,
      };

      setCrop(newCrop);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Card className="cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-lg">Upload Hero Banner</CardTitle>
              <CardDescription>
                Add a stunning background image to your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex justify-center space-x-2 mb-4">
                {cropPresets.map((preset) => (
                  <Badge key={preset.name} variant="secondary" className="text-xs">
                    {preset.name}
                  </Badge>
                ))}
              </div>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <Upload className="w-4 h-4 mr-2" />
                Choose Image
              </Button>
            </CardContent>
          </Card>
        </DialogTrigger>
        
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              Hero Banner Upload & Crop
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {!imageSrc ? (
              <div className="text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 cursor-pointer hover:border-blue-500 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Choose your hero image</h3>
                  <p className="text-gray-600 mb-4">
                    Upload a high-quality image that represents you professionally
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports JPG, PNG, GIF, WebP • Max 10MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Crop Presets */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <CropIcon className="w-4 h-4" />
                    Crop Options
                  </Label>
                  <Tabs value={isCustomCrop ? 'custom' : activePreset.name} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      {cropPresets.map((preset) => (
                        <TabsTrigger 
                          key={preset.name} 
                          value={preset.name}
                          onClick={() => handleCropPresetChange(preset)}
                          className="text-xs"
                        >
                          <preset.icon className="w-3 h-3 mr-1" />
                          {preset.name}
                        </TabsTrigger>
                      ))}
                      <TabsTrigger 
                        value="custom" 
                        onClick={() => setIsCustomCrop(true)}
                        className="text-xs"
                      >
                        <Scissors className="w-3 h-3 mr-1" />
                        Custom
                      </TabsTrigger>
                    </TabsList>
                    
                    {cropPresets.map((preset) => (
                      <TabsContent key={preset.name} value={preset.name} className="mt-2">
                        <p className="text-sm text-gray-600">{preset.description}</p>
                      </TabsContent>
                    ))}
                    <TabsContent value="custom" className="mt-2">
                      <p className="text-sm text-gray-600">Drag to create a custom crop area</p>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Image Transformations */}
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRotation(prev => (prev + 90) % 360)}
                  >
                    <RotateCw className="w-4 h-4 mr-1" />
                    Rotate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFlipHorizontal(prev => !prev)}
                  >
                    <FlipHorizontal className="w-4 h-4 mr-1" />
                    Flip H
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFlipVertical(prev => !prev)}
                  >
                    <FlipVertical className="w-4 h-4 mr-1" />
                    Flip V
                  </Button>
                </div>

                {/* Crop Area */}
                <div className="border rounded-lg overflow-hidden bg-black">
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={isCustomCrop ? undefined : activePreset.aspect}
                    className="max-h-96"
                  >
                    <img
                      ref={imageRef}
                      src={imageSrc}
                      onLoad={onImageLoad}
                      alt="Crop preview"
                      className="max-w-full max-h-96 object-contain"
                      style={{
                        transform: `rotate(${rotation}deg) scaleX(${flipHorizontal ? -1 : 1}) scaleY(${flipVertical ? -1 : 1})`
                      }}
                    />
                  </ReactCrop>
                </div>

                {/* Upload Progress */}
                {uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading to Wasabi S3...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsOpen(false);
                      resetState();
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose Different Image
                    </Button>
                    <Button
                      onClick={() => uploadMutation.mutate()}
                      disabled={!completedCrop || uploadMutation.isPending}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {uploadMutation.isPending ? 'Uploading...' : 'Upload Banner'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}