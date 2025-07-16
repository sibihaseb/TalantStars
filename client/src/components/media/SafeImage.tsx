import { useState, useEffect } from 'react';
import { ImageIcon, AlertCircle } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  maxRetries?: number;
  retryDelay?: number;
}

export function SafeImage({ 
  src, 
  alt, 
  className = '', 
  fallbackClassName = '',
  maxRetries = 3,
  retryDelay = 1000
}: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setCurrentSrc(src);
    setIsLoading(true);
    setHasError(false);
    setRetryCount(0);
  }, [src]);

  const handleImageLoad = () => {
    console.log('SafeImage loaded successfully:', currentSrc);
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    console.error('SafeImage loading error:', currentSrc, 'Retry count:', retryCount);
    setIsLoading(false);
    
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setTimeout(() => {
        const cacheBuster = `?retry=${retryCount + 1}&t=${Date.now()}`;
        setCurrentSrc(src + cacheBuster);
        setIsLoading(true);
      }, retryDelay);
    } else {
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${fallbackClassName || className}`}>
        <div className="text-center p-4">
          <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Image failed to load</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={`absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}>
          <div className="text-center">
            <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-pulse" />
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        </div>
      )}
      <img 
        src={currentSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        crossOrigin="anonymous"
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />
    </div>
  );
}