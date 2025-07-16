import React from 'react';
import { EnhancedMediaUpload } from '@/components/media/EnhancedMediaUpload';

interface MediaUploadProps {
  onUploadComplete?: (media: any) => void;
  showGallery?: boolean;
}

export function MediaUpload({ onUploadComplete, showGallery = true }: MediaUploadProps) {
  return (
    <EnhancedMediaUpload 
      onUploadComplete={onUploadComplete}
      showGallery={showGallery}
    />
  );
}

export default MediaUpload;