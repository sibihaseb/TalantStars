import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  ExternalLink,
  Download,
  Share2,
  Info
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SafeImage } from "./SafeImage";

interface MediaItem {
  id: number;
  title: string;
  description: string;
  url: string;
  mediaType: string;
  category: string;
  externalUrl?: string;
  isExternal?: boolean;
  originalName: string;
  createdAt: string;
  thumbnailUrl?: string;
}

interface MediaGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  mediaItems: MediaItem[];
  initialIndex?: number;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ 
  isOpen, 
  onClose, 
  mediaItems = [], 
  initialIndex = 0 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  const currentItem = mediaItems[currentIndex];

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : mediaItems.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < mediaItems.length - 1 ? prev + 1 : 0));
  };

  const togglePlayPause = () => {
    if (videoRef) {
      if (isPlaying) {
        videoRef.pause();
      } else {
        videoRef.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef) {
      videoRef.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef) {
      if (videoRef.requestFullscreen) {
        videoRef.requestFullscreen();
      }
    }
  };

  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const getVimeoVideoId = (url: string) => {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
  };

  const renderMediaContent = () => {
    if (!currentItem) return null;

    // External video links
    if (currentItem.isExternal && currentItem.externalUrl) {
      const youtubeId = getYouTubeVideoId(currentItem.externalUrl);
      const vimeoId = getVimeoVideoId(currentItem.externalUrl);

      if (youtubeId) {
        return (
          <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              className="w-full h-full"
              frameBorder="0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        );
      }

      if (vimeoId) {
        return (
          <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
            <iframe
              src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&color=ffffff&title=0&byline=0&portrait=0`}
              className="w-full h-full"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; fullscreen; picture-in-picture"
            />
          </div>
        );
      }

      // Other external links
      return (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
          <div className="text-center text-white">
            <ExternalLink className="h-16 w-16 mx-auto mb-4" />
            <p className="text-xl font-semibold mb-2">External Content</p>
            <p className="text-sm opacity-90 mb-4">This content is hosted externally</p>
            <Button 
              variant="outline" 
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              onClick={() => window.open(currentItem.externalUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
          </div>
        </div>
      );
    }

    // Local media content
    switch (currentItem.mediaType) {
      case 'image':
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <SafeImage 
              src={currentItem.url}
              alt={currentItem.title}
              className="max-w-full max-h-full object-contain rounded-lg"
              fallbackClassName="max-w-full max-h-full flex items-center justify-center"
              maxRetries={3}
              retryDelay={1000}
            />
          </div>
        );
      
      case 'video':
        return (
          <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
            <video
              ref={setVideoRef}
              src={currentItem.url}
              className="w-full h-full object-contain"
              controls
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onLoadedMetadata={() => {
                if (videoRef) {
                  setIsMuted(videoRef.muted);
                }
              }}
            />
            
            {/* Custom video controls overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/50 rounded-lg p-2">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlayPause}
                  className="text-white hover:text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:text-white hover:bg-white/20"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      
      case 'audio':
        return (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-green-500 to-blue-600 rounded-lg">
            <div className="text-center text-white">
              <div className="bg-white/20 rounded-full p-8 mb-6 inline-block">
                <Volume2 className="h-16 w-16" />
              </div>
              <audio
                src={currentItem.url}
                controls
                className="w-full max-w-md"
                style={{ filter: 'invert(1)' }}
              />
            </div>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg">
            <div className="text-center text-white">
              <ExternalLink className="h-16 w-16 mx-auto mb-4" />
              <p className="text-xl font-semibold">Unsupported Media Type</p>
              <p className="text-sm opacity-90">{currentItem.mediaType}</p>
            </div>
          </div>
        );
    }
  };

  if (!isOpen || mediaItems.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 bg-black/95">
        <div className="relative w-full h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center space-x-4">
              <DialogTitle className="text-white text-lg font-semibold">
                {currentItem?.title || 'Media Gallery'}
              </DialogTitle>
              <Badge variant="secondary" className="bg-white/20 text-white">
                {currentIndex + 1} of {mediaItems.length}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInfo(!showInfo)}
                className="text-white hover:text-white hover:bg-white/20"
              >
                <Info className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 relative p-4">
            {renderMediaContent()}
            
            {/* Navigation buttons */}
            {mediaItems.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 hover:text-white"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 hover:text-white"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>

          {/* Media info panel */}
          {showInfo && currentItem && (
            <div className="border-t border-white/10 p-4 bg-black/80">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-white font-semibold mb-2">Details</h3>
                  <div className="space-y-1 text-sm text-white/80">
                    <p><span className="font-medium">Title:</span> {currentItem.title}</p>
                    <p><span className="font-medium">Category:</span> {currentItem.category}</p>
                    <p><span className="font-medium">Type:</span> {currentItem.mediaType}</p>
                    <p><span className="font-medium">Added:</span> {new Date(currentItem.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">Description</h3>
                  <p className="text-sm text-white/80">{currentItem.description || 'No description available'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Thumbnail navigation */}
          {mediaItems.length > 1 && (
            <div className="border-t border-white/10 p-4 bg-black/80">
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {mediaItems.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentIndex(index)}
                    className={`
                      flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                      ${index === currentIndex 
                        ? 'border-blue-500 ring-2 ring-blue-500/50' 
                        : 'border-white/20 hover:border-white/40'
                      }
                    `}
                  >
                    {item.mediaType === 'image' ? (
                      <img 
                        src={item.url} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                        <Play className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaGallery;