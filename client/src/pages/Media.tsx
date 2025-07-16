import { Header } from '@/components/layout/Header';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { EnhancedMediaUpload } from '@/components/media/EnhancedMediaUpload';
import { TagManager } from '@/components/media/TagManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export default function Media() {
  // Fetch media files for tag management
  const { data: mediaFiles = [], refetch: refetchMediaFiles } = useQuery({
    queryKey: ['/api/media'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/media');
      return await res.json();
    },
  });

  const handleMediaFilesUpdate = () => {
    refetchMediaFiles();
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Media Gallery</h1>
              <p className="text-muted-foreground">
                Upload and manage your portfolio images, videos, and audio files
              </p>
            </div>
            
            <Tabs defaultValue="gallery" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="gallery">Media Gallery</TabsTrigger>
                <TabsTrigger value="tags">Tag Manager</TabsTrigger>
              </TabsList>
              
              <TabsContent value="gallery" className="space-y-6">
                <EnhancedMediaUpload 
                  showGallery={true} 
                  onUploadComplete={handleMediaFilesUpdate}
                />
              </TabsContent>
              
              <TabsContent value="tags" className="space-y-6">
                <TagManager 
                  mediaFiles={mediaFiles}
                  onMediaFilesUpdate={handleMediaFilesUpdate}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}