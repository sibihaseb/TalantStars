import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/Header';
import { ThemeProvider } from '@/components/ui/theme-provider';

export default function TestUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string>('');
  const { toast } = useToast();

  const handleFileUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const formData = new FormData(event.currentTarget);
    const fileInput = event.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    setUploadResult('');
    
    try {
      console.log('Uploading file:', file.name, 'size:', file.size, 'type:', file.type);
      
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('title', formData.get('title') as string || 'Test Upload');
      uploadFormData.append('description', formData.get('description') as string || 'Test description');
      uploadFormData.append('category', 'portfolio');
      
      const response = await fetch('/api/media', {
        method: 'POST',
        body: uploadFormData,
        credentials: 'include',
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', errorText);
        setUploadResult(`Upload failed: ${response.status} - ${errorText}`);
        toast({
          title: "Upload Failed",
          description: `${response.status}: ${errorText}`,
          variant: "destructive",
        });
        return;
      }
      
      const result = await response.json();
      console.log('Upload successful:', result);
      setUploadResult(`Upload successful: ${JSON.stringify(result, null, 2)}`);
      toast({
        title: "Success",
        description: "File uploaded successfully!",
      });
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult(`Upload error: ${error.message}`);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
        <div className="max-w-4xl mx-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle>Test File Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    defaultValue="Test Upload"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    type="text"
                    defaultValue="Test description"
                  />
                </div>
                
                <div>
                  <Label htmlFor="file">File</Label>
                  <Input
                    id="file"
                    name="file"
                    type="file"
                    accept="image/*,video/*,audio/*"
                    required
                  />
                </div>
                
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? 'Uploading...' : 'Upload File'}
                </Button>
              </form>
              
              {uploadResult && (
                <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <h3 className="font-semibold mb-2">Upload Result:</h3>
                  <pre className="text-sm overflow-auto">{uploadResult}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ThemeProvider>
  );
}