import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface MediaItem {
  id: number;
  url: string;
  title?: string;
  description?: string;
  category: string;
  fileType: string;
}

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaItems: MediaItem[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export default function MediaModal({ 
  isOpen, 
  onClose, 
  mediaItems, 
  currentIndex, 
  onIndexChange 
}: MediaModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  if (!mediaItems.length) return null;

  const currentMedia = mediaItems[currentIndex];
  const isVideo = currentMedia?.fileType?.startsWith('video');
  const isAudio = currentMedia?.fileType?.startsWith('audio');
  const isImage = currentMedia?.fileType?.startsWith('image');

  const goToPrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : mediaItems.length - 1;
    onIndexChange(newIndex);
  };

  const goToNext = () => {
    const newIndex = currentIndex < mediaItems.length - 1 ? currentIndex + 1 : 0;
    onIndexChange(newIndex);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl w-full h-[80vh] p-0 overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        <VisuallyHidden>
          <DialogTitle>
            {currentMedia?.title || `Media ${currentIndex + 1} of ${mediaItems.length}`}
          </DialogTitle>
        </VisuallyHidden>
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-black/50 text-white p-4 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg">{currentMedia?.title || 'Untitled'}</h3>
            <p className="text-sm opacity-80">
              {currentIndex + 1} of {mediaItems.length} • {currentMedia?.category}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Media Content */}
        <div className="relative w-full h-full bg-black flex items-center justify-center">
          {isImage && (
            <img
              src={currentMedia.url}
              alt={currentMedia.title || 'Media'}
              className="max-w-full max-h-full object-contain"
            />
          )}

          {isVideo && (
            <div className="relative w-full h-full">
              <video
                src={currentMedia.url}
                controls
                autoPlay={isPlaying}
                muted={isMuted}
                className="w-full h-full object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {/* Video Controls Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const video = document.querySelector('video');
                      if (video) {
                        if (isPlaying) {
                          video.pause();
                        } else {
                          video.play();
                        }
                      }
                    }}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const video = document.querySelector('video');
                      if (video) {
                        video.muted = !isMuted;
                        setIsMuted(!isMuted);
                      }
                    }}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isAudio && (
            <div className="flex flex-col items-center justify-center space-y-6 text-white">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                <Volume2 className="w-16 h-16" />
              </div>
              <audio
                src={currentMedia.url}
                controls
                autoPlay={isPlaying}
                className="w-96"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </div>
          )}

          {/* Navigation Arrows */}
          {mediaItems.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 w-12 h-12 rounded-full"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 w-12 h-12 rounded-full"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}
        </div>

        {/* Footer with Description */}
        {currentMedia?.description && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4">
            <p className="text-sm">{currentMedia.description}</p>
          </div>
        )}

        {/* Thumbnail Navigation */}
        {mediaItems.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 rounded-lg p-2">
            {mediaItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => onIndexChange(index)}
                className={`w-12 h-12 rounded overflow-hidden border-2 ${
                  index === currentIndex ? 'border-white' : 'border-transparent'
                }`}
              >
                {item.fileType?.startsWith('image') ? (
                  <img
                    src={item.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                    {item.fileType?.startsWith('video') ? (
                      <Play className="w-4 h-4 text-white" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-white" />
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}