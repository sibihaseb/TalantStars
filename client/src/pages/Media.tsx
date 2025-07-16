import { Header } from '@/components/layout/Header';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { EnhancedMediaUpload } from '@/components/media/EnhancedMediaUpload';

export default function Media() {
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
            
            <EnhancedMediaUpload showGallery={true} />
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}