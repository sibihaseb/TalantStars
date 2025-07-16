import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crop as CropIcon, Image as ImageIcon, Square, Circle, Maximize2, RotateCw } from 'lucide-react';

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File;
  onCropComplete: (croppedFile: File) => void;
}

const aspectRatios = {
  free: { value: undefined, label: 'Free Form', icon: Maximize2 },
  '1:1': { value: 1, label: 'Square (1:1)', icon: Square },
  '4:3': { value: 4/3, label: 'Standard (4:3)', icon: ImageIcon },
  '16:9': { value: 16/9, label: 'Widescreen (16:9)', icon: ImageIcon },
  '3:2': { value: 3/2, label: 'Photo (3:2)', icon: ImageIcon },
  '9:16': { value: 9/16, label: 'Portrait (9:16)', icon: ImageIcon },
};

const ImageCropper: React.FC<ImageCropperProps> = ({ isOpen, onClose, imageFile, onCropComplete }) => {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    x: 10,
    y: 10,
    width: 80,
    height: 80,
  });
  
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>('free');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [rotation, setRotation] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Create image URL when file changes
  React.useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
    
    // Set initial crop based on image dimensions
    const aspectRatio = aspectRatios[selectedAspectRatio as keyof typeof aspectRatios]?.value;
    if (aspectRatio) {
      const cropWidth = Math.min(width, height * aspectRatio);
      const cropHeight = cropWidth / aspectRatio;
      setCrop({
        unit: 'px',
        x: (width - cropWidth) / 2,
        y: (height - cropHeight) / 2,
        width: cropWidth,
        height: cropHeight,
      });
    }
  }, [selectedAspectRatio]);

  const handleAspectRatioChange = (ratio: string) => {
    setSelectedAspectRatio(ratio);
    const aspectRatio = aspectRatios[ratio as keyof typeof aspectRatios]?.value;
    
    if (imgRef.current) {
      const { naturalWidth: width, naturalHeight: height } = imgRef.current;
      
      if (aspectRatio) {
        const cropWidth = Math.min(width, height * aspectRatio);
        const cropHeight = cropWidth / aspectRatio;
        setCrop({
          unit: 'px',
          x: (width - cropWidth) / 2,
          y: (height - cropHeight) / 2,
          width: cropWidth,
          height: cropHeight,
        });
      } else {
        // Free form - use current crop dimensions
        setCrop(prev => ({ ...prev }));
      }
    }
  };

  const getCroppedImg = useCallback(async (): Promise<File> => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) {
      throw new Error('Crop area not selected');
    }

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    const { naturalWidth, naturalHeight } = image;
    const { x, y, width, height } = completedCrop;

    // Set canvas size to crop dimensions
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply rotation if needed
    if (rotation !== 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    // Draw cropped image
    ctx.drawImage(
      image,
      x, y, width, height,
      0, 0, width, height
    );

    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }
          
          const file = new File([blob], imageFile.name, {
            type: imageFile.type,
            lastModified: Date.now(),
          });
          
          resolve(file);
        },
        imageFile.type,
        0.95
      );
    });
  }, [completedCrop, imageFile, rotation]);

  const handleCropComplete = async () => {
    if (!completedCrop) return;
    
    setIsProcessing(true);
    try {
      const croppedFile = await getCroppedImg();
      onCropComplete(croppedFile);
      onClose();
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CropIcon className="h-5 w-5" />
            Crop Image
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Aspect Ratio:</label>
              <Select value={selectedAspectRatio} onValueChange={handleAspectRatioChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(aspectRatios).map(([key, { label, icon: Icon }]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleRotate}
              className="flex items-center gap-2"
            >
              <RotateCw className="h-4 w-4" />
              Rotate
            </Button>
          </div>

          {/* Crop Area */}
          <Card>
            <CardContent className="p-6">
              <div className="relative mx-auto max-w-2xl">
                {imageUrl && (
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={aspectRatios[selectedAspectRatio as keyof typeof aspectRatios]?.value}
                    className="max-h-96"
                  >
                    <img
                      ref={imgRef}
                      src={imageUrl}
                      alt="Crop preview"
                      onLoad={onImageLoad}
                      style={{
                        transform: `rotate(${rotation}deg)`,
                        maxWidth: '100%',
                        maxHeight: '400px',
                      }}
                    />
                  </ReactCrop>
                )}
              </div>
              
              {/* Hidden canvas for cropping */}
              <canvas
                ref={canvasRef}
                style={{ display: 'none' }}
              />
            </CardContent>
          </Card>

          {/* Preview Info */}
          {completedCrop && (
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                Size: {Math.round(completedCrop.width)} × {Math.round(completedCrop.height)}
              </Badge>
              <Badge variant="outline">
                Aspect: {(completedCrop.width / completedCrop.height).toFixed(2)}:1
              </Badge>
              {rotation !== 0 && (
                <Badge variant="outline">
                  Rotation: {rotation}°
                </Badge>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCropComplete}
            disabled={!completedCrop || isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <CropIcon className="h-4 w-4 mr-2" />
                Apply Crop
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropper;